import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

const stackName = "AHCP3-frontend";
export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new cdk.aws_s3.Bucket(scope, `${stackName}-Bucket`, {
      bucketName: `${stackName}-Bucket`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
      encryption: cdk.aws_s3.BucketEncryption.S3_MANAGED,
      autoDeleteObjects: true,
      versioned: true,
    });
    bucket.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        sid: "EnforceTLS",
        effect: cdk.aws_iam.Effect.DENY,
        principals: [new cdk.aws_iam.AnyPrincipal()],
        actions: ["s3:*"],
        resources: [bucket.bucketArn, bucket.bucketArn + "/*"],
        conditions: { Bool: { "aws:SecureTransport": "false" } },
      })
    );

    const originAccessIdentity = new cdk.aws_cloudfront.OriginAccessIdentity(
      scope,
      `${stackName}-OAI`
    );

    const distribution = new cdk.aws_cloudfront.Distribution(
      scope,
      `${stackName}-Distribution`,
      {
        defaultBehavior: {
          origin: new cdk.aws_cloudfront_origins.S3Origin(bucket, {
            originAccessIdentity,
          }),
          originRequestPolicy:
            cdk.aws_cloudfront.OriginRequestPolicy.ALL_VIEWER,
          cachePolicy: cdk.aws_cloudfront.CachePolicy.CACHING_OPTIMIZED,
          viewerProtocolPolicy:
            cdk.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          responseHeadersPolicy: new cdk.aws_cloudfront.ResponseHeadersPolicy(
            scope,
            `${stackName}-Response-Headers`,
            {
              securityHeadersBehavior: {
                contentSecurityPolicy: {
                  contentSecurityPolicy:
                    "default-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://*.amazonaws.com https://*.amazoncognito.com https://fonts.gstatic.com; img-src *;",
                  override: true,
                },
                contentTypeOptions: {
                  override: true,
                },
                frameOptions: {
                  frameOption: cdk.aws_cloudfront.HeadersFrameOption.DENY,
                  override: true,
                },
                referrerPolicy: {
                  referrerPolicy:
                    cdk.aws_cloudfront.HeadersReferrerPolicy
                      .STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
                  override: true,
                },
                strictTransportSecurity: {
                  includeSubdomains: true,
                  override: true,
                  preload: true,
                  accessControlMaxAge: cdk.Duration.days(365),
                },
                xssProtection: {
                  override: true,
                  protection: true,
                  modeBlock: true,
                },
              },
            }
          ),
        },
        defaultRootObject: "index.html",
        errorResponses: [{ httpStatus: 403, responsePagePath: "/index.html" }],
        // domainNames: props?.domainNames,
        // certificate: props?.certificate,
        // webAclId: props?.webAclId,
      }
    );

    new cdk.CfnOutput(this, "Cloudfront_Distribution_ID", {
      value: distribution.distributionId,
    });
    new cdk.CfnOutput(this, "Cloudfront_Domain", {
      value: distribution.distributionDomainName,
    });
    new cdk.CfnOutput(this, "Frontend_Bucket_Name", {
      value: bucket.bucketName,
    });
  }
}
