import React, { useState, useRef } from "react";
import "./ImageConverter.css";

interface ImageConverterProps {}

const ImageConverter: React.FC<ImageConverterProps> = () => {
  const [imagePreviews] = useState<JSX.Element[]>([]);
  const fileSelectorRef = useRef<HTMLInputElement>(null);

  const addImageBox = (container: HTMLElement) => {
    const imageBox = document.createElement("div");
    const progressBox = document.createElement("progress");
    imageBox.appendChild(progressBox);
    container.appendChild(imageBox);

    return imageBox;
  };

  const processFile = (file: File) => {
    if (!file) {
      return;
    }

    console.log(file);

    const imageBox = addImageBox(
      document.getElementById("previews") as HTMLElement
    );

    // Load the data into an image
    const rawImage = new Image();

    rawImage.addEventListener("load", () => {
      // Convert image to WebP ObjectURL via a canvas blob
      const convertToWebP = (rawImage: HTMLImageElement) => {
        return new Promise<string>((resolve) => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          canvas.width = rawImage.width;
          canvas.height = rawImage.height;
          ctx?.drawImage(rawImage, 0, 0);

          canvas.toBlob((blob) => {
            resolve(URL.createObjectURL(blob as Blob));
          }, "image/webp");
        });
      };

      // Load image for display on the page
      const loadImageForDisplay = (imageURL: string) => {
        return new Promise<{ imageURL: string; scaledImg: HTMLImageElement }>(
          (resolve) => {
            const scaledImg = new Image();

            scaledImg.addEventListener("load", () => {
              resolve({ imageURL, scaledImg });
            });

            scaledImg.setAttribute("src", imageURL);
          }
        );
      };

      // Inject into the DOM
      const injectIntoDOM = (data: {
        imageURL: string;
        scaledImg: HTMLImageElement;
      }) => {
        const imageLink = document.createElement("a");

        imageLink.setAttribute("href", data.imageURL);
        imageLink.setAttribute(
          "download",
          `${file.name.replace(".png", "")}.webp`
        );
        imageLink.appendChild(data.scaledImg);

        imageBox.innerHTML = "";
        imageBox.appendChild(imageLink);
      };

      convertToWebP(rawImage)
        .then(loadImageForDisplay)
        .then(injectIntoDOM)
        .catch((error) => {
          console.error("Error processing file:", error);
          // You can handle errors here, such as displaying an error message.
        });
    });

    rawImage.src = URL.createObjectURL(file);
  };

  const processFiles = (files: FileList | null) => {
    if (!files) {
      return;
    }

    for (let i = 0; i < files.length; i++) {
      processFile(files[i]);
    }
  };

  const fileSelectorChanged = () => {
    if (fileSelectorRef.current) {
      processFiles(fileSelectorRef.current.files);
      fileSelectorRef.current.value = "";
    }
  };

  // Set up Drag and Drop
  const dragenter = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const dragover = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const drop = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    processFiles(e.dataTransfer.files);
  };

  return (
    <div className="image-converter-container">
      <input
        className="input"
        type="file"
        multiple
        accept="image/*"
        onChange={fileSelectorChanged}
        ref={fileSelectorRef}
      />

      <div
        className="dropTarget"
        onDragEnter={dragenter}
        onDragOver={dragover}
        onDrop={drop}
      ></div>

      <div id="previews" className="previews">
        {imagePreviews}
      </div>
    </div>
  );
};

export default ImageConverter;
