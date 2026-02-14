#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PixEcomCdnStack } from '../lib/cdn-stack';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = new cdk.App();

const env = {
  account: process.env.AWS_ACCOUNT_ID || process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.AWS_REGION || process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

const environment = process.env.ENVIRONMENT || 'production';

new PixEcomCdnStack(app, `PixEcomCdnStack-${environment}`, {
  env,
  description: 'CloudFront CDN distribution for PixEcom v2.0',
  tags: {
    Project: 'PixEcom',
    Environment: environment,
    ManagedBy: 'CDK',
  },
  stackName: `pixecom-cdn-${environment}`,
});

app.synth();
