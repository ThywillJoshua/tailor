import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
// import {BucketDeployment, Source} from "@aws-cdk/aws-s3-deployment";
// import * as path from "path";

// new BucketDeployment(this, 'BucketDeployment', {
//   destinationBucket: bucket,
//   sources: [Source.asset(path.resolve(__dirname, './dist'))]
// })

const stackName = "Tailor-Frontend";

export class TailorStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new cdk.aws_s3.Bucket(this, `${stackName}-Bucket`, {
      bucketName: `${stackName}-Bucket`.toLowerCase(),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      // blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
      // encryption: cdk.aws_s3.BucketEncryption.S3_MANAGED,
      // autoDeleteObjects: true,
      // versioned: true,
      // accessControl: cdk.aws_s3.BucketAccessControl.PRIVATE,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
    });

    bucket.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        sid: "EnforceTLS",
        effect: cdk.aws_iam.Effect.DENY,
        principals: [new cdk.aws_iam.AnyPrincipal()],
        actions: ["s3:*"],
        resources: [bucket.bucketArn, bucket.bucketArn + "/*"],
        conditions: {
          Bool: { "aws:SecureTransport": "false" },
          NotIpAddress: {
            "aws:SourceIp": ["151.38.190.137"],
          },
        },
      })
    );

    new cdk.CfnOutput(this, "Frontend_Bucket_Name", {
      value: bucket.bucketName,
    });
    new cdk.CfnOutput(this, "Frontend_Domain_Name", {
      value: bucket.bucketDomainName,
    });
  }
}
