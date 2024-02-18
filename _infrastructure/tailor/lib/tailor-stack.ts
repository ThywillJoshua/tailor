import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

const stackName = "Tailor-Frontend";
const permittedIps = ["151.38.190.137"];

export class TailorStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new cdk.aws_s3.Bucket(this, `${stackName}-Bucket`, {
      bucketName: `${stackName}-Bucket`.toLowerCase(),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      encryption: cdk.aws_s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },

      publicReadAccess: true,

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
            "aws:SourceIp": [...permittedIps],
          },
        },
      }),
    );

    new cdk.CfnOutput(this, "Frontend_Bucket_ARN", {
      value: bucket.bucketArn,
    });
    new cdk.CfnOutput(this, "Frontend_Domain_Name", {
      value: bucket.bucketDomainName,
    });
  }
}
