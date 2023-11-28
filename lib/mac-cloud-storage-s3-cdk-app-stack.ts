import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";

export class MacCloudStorageS3CdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "IntelligentTieringBucket", {
      lifecycleRules: [
        {
          id: "IntelligentTieringRule",
          enabled: true,
          transitions: [
            {
              storageClass: s3.StorageClass.INTELLIGENT_TIERING,
              transitionAfter: cdk.Duration.days(0), // Transition immediately to Intelligent-Tiering
            },
          ],
        },
      ],
    });

    const user = new iam.User(this, "MyBucketUser");

    // Policy allowing access to the specific bucket
    const bucketPolicy = new iam.PolicyStatement({
      actions: ["s3:*"],
      resources: [bucket.bucketArn, `${bucket.bucketArn}/*`],
      effect: iam.Effect.ALLOW,
    });

    // Attach the policy to the user
    user.addToPolicy(bucketPolicy);

    // Output the username
    new cdk.CfnOutput(this, "UserNameOutput", {
      value: user.userName,
      description: "The name of the IAM user",
    });

    // Output the bucket name
    new cdk.CfnOutput(this, "BucketNameOutput", {
      value: bucket.bucketName,
      description: "The name of the S3 bucket",
    });
  }
}
