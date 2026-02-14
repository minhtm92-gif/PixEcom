import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';

export interface PixEcomCdnStackProps extends cdk.StackProps {
  domainName?: string;
  certificateArn?: string;
  originDomain?: string;
  apiOriginDomain?: string;
  enableWaf?: boolean;
  priceClass?: cloudfront.PriceClass;
}

export class PixEcomCdnStack extends cdk.Stack {
  public readonly distribution: cloudfront.Distribution;
  public readonly staticAssetsBucket: s3.Bucket;
  public readonly logsBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: PixEcomCdnStackProps) {
    super(scope, id, props);

    const originDomain = props?.originDomain || process.env.ORIGIN_DOMAIN || 'your-server.com';
    const apiOriginDomain = props?.apiOriginDomain || process.env.API_ORIGIN_DOMAIN || originDomain;
    const enableWaf = props?.enableWaf ?? (process.env.ENABLE_WAF === 'true');
    const enableLogs = process.env.ENABLE_ACCESS_LOGS !== 'false';
    const priceClass = props?.priceClass || this.getPriceClass(process.env.PRICE_CLASS);

    // Create S3 bucket for CloudFront access logs
    this.logsBucket = new s3.Bucket(this, 'CdnLogsBucket', {
      bucketName: `pixecom-cdn-logs-${cdk.Aws.ACCOUNT_ID}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      lifecycleRules: [
        {
          enabled: true,
          expiration: cdk.Duration.days(90),
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(30),
            },
          ],
        },
      ],
    });

    // Create S3 bucket for static assets
    this.staticAssetsBucket = new s3.Bucket(this, 'StaticAssetsBucket', {
      bucketName: `pixecom-static-assets-${cdk.Aws.ACCOUNT_ID}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
    });

    // Origin Access Identity for S3
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      'StaticAssetsOAI',
      {
        comment: 'OAI for PixEcom static assets',
      }
    );

    this.staticAssetsBucket.grantRead(originAccessIdentity);

    // Custom cache policies
    const staticAssetsCachePolicy = new cloudfront.CachePolicy(
      this,
      'StaticAssetsCachePolicy',
      {
        cachePolicyName: 'PixEcomStaticAssetsPolicy',
        comment: 'Cache policy for static assets (images, CSS, JS)',
        defaultTtl: cdk.Duration.days(30),
        maxTtl: cdk.Duration.days(365),
        minTtl: cdk.Duration.seconds(0),
        enableAcceptEncodingGzip: true,
        enableAcceptEncodingBrotli: true,
        headerBehavior: cloudfront.CacheHeaderBehavior.allowList('Origin'),
        queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
      }
    );

    const apiCachePolicy = new cloudfront.CachePolicy(this, 'ApiCachePolicy', {
      cachePolicyName: 'PixEcomApiPolicy',
      comment: 'Cache policy for API routes',
      defaultTtl: cdk.Duration.seconds(0),
      maxTtl: cdk.Duration.seconds(1),
      minTtl: cdk.Duration.seconds(0),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
      headerBehavior: cloudfront.CacheHeaderBehavior.allowList(
        'Authorization',
        'X-Workspace-Id',
        'Content-Type',
        'Accept',
        'Origin',
        'Referer'
      ),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
      cookieBehavior: cloudfront.CacheCookieBehavior.all(),
    });

    const webCachePolicy = new cloudfront.CachePolicy(this, 'WebCachePolicy', {
      cachePolicyName: 'PixEcomWebPolicy',
      comment: 'Cache policy for Next.js web application',
      defaultTtl: cdk.Duration.minutes(5),
      maxTtl: cdk.Duration.hours(24),
      minTtl: cdk.Duration.seconds(0),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
      headerBehavior: cloudfront.CacheHeaderBehavior.allowList(
        'Accept',
        'Accept-Language',
        'CloudFront-Viewer-Country'
      ),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
      cookieBehavior: cloudfront.CacheCookieBehavior.allowList(
        'cart_session',
        'next-auth.session-token'
      ),
    });

    // Origin Request Policy for API
    const apiOriginRequestPolicy = new cloudfront.OriginRequestPolicy(
      this,
      'ApiOriginRequestPolicy',
      {
        originRequestPolicyName: 'PixEcomApiOriginPolicy',
        comment: 'Forward all headers and cookies to API origin',
        headerBehavior: cloudfront.OriginRequestHeaderBehavior.all(),
        cookieBehavior: cloudfront.OriginRequestCookieBehavior.all(),
        queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
      }
    );

    // Response Headers Policy for security
    const securityHeadersPolicy = new cloudfront.ResponseHeadersPolicy(
      this,
      'SecurityHeadersPolicy',
      {
        responseHeadersPolicyName: 'PixEcomSecurityHeaders',
        comment: 'Security headers for PixEcom',
        securityHeadersBehavior: {
          contentTypeOptions: { override: true },
          frameOptions: {
            frameOption: cloudfront.HeadersFrameOption.DENY,
            override: true,
          },
          referrerPolicy: {
            referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
            override: true,
          },
          strictTransportSecurity: {
            accessControlMaxAge: cdk.Duration.days(365),
            includeSubdomains: true,
            preload: true,
            override: true,
          },
          xssProtection: {
            protection: true,
            modeBlock: true,
            override: true,
          },
        },
        corseBehavior: {
          accessControlAllowOrigins: ['*'],
          accessControlAllowHeaders: ['*'],
          accessControlAllowMethods: ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE'],
          accessControlAllowCredentials: true,
          originOverride: false,
        },
      }
    );

    // Define origins
    const webOrigin = new origins.HttpOrigin(originDomain, {
      protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
      httpPort: 80,
      customHeaders: {
        'X-Forwarded-Host': originDomain,
      },
    });

    const apiOrigin = new origins.HttpOrigin(apiOriginDomain, {
      protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
      httpPort: 80,
      customHeaders: {
        'X-Forwarded-Host': apiOriginDomain,
      },
    });

    const s3Origin = new origins.S3Origin(this.staticAssetsBucket, {
      originAccessIdentity,
    });

    // Optional: Custom domain certificate
    let certificate: acm.ICertificate | undefined;
    if (props?.certificateArn) {
      certificate = acm.Certificate.fromCertificateArn(
        this,
        'Certificate',
        props.certificateArn
      );
    }

    // Optional: WAF Web ACL
    let webAclId: string | undefined;
    if (enableWaf) {
      const webAcl = new wafv2.CfnWebACL(this, 'CloudFrontWebACL', {
        scope: 'CLOUDFRONT',
        defaultAction: { allow: {} },
        visibilityConfig: {
          cloudWatchMetricsEnabled: true,
          metricName: 'PixEcomWebACL',
          sampledRequestsEnabled: true,
        },
        rules: [
          {
            name: 'RateLimitRule',
            priority: 1,
            statement: {
              rateBasedStatement: {
                limit: 2000,
                aggregateKeyType: 'IP',
              },
            },
            action: { block: {} },
            visibilityConfig: {
              cloudWatchMetricsEnabled: true,
              metricName: 'RateLimitRule',
              sampledRequestsEnabled: true,
            },
          },
          {
            name: 'AWSManagedRulesCommonRuleSet',
            priority: 2,
            statement: {
              managedRuleGroupStatement: {
                vendorName: 'AWS',
                name: 'AWSManagedRulesCommonRuleSet',
              },
            },
            overrideAction: { none: {} },
            visibilityConfig: {
              cloudWatchMetricsEnabled: true,
              metricName: 'AWSManagedRulesCommonRuleSetMetric',
              sampledRequestsEnabled: true,
            },
          },
          {
            name: 'AWSManagedRulesKnownBadInputsRuleSet',
            priority: 3,
            statement: {
              managedRuleGroupStatement: {
                vendorName: 'AWS',
                name: 'AWSManagedRulesKnownBadInputsRuleSet',
              },
            },
            overrideAction: { none: {} },
            visibilityConfig: {
              cloudWatchMetricsEnabled: true,
              metricName: 'AWSManagedRulesKnownBadInputsRuleSetMetric',
              sampledRequestsEnabled: true,
            },
          },
        ],
      });

      webAclId = webAcl.attrArn;
    }

    // Create CloudFront distribution
    this.distribution = new cloudfront.Distribution(this, 'CdnDistribution', {
      comment: 'PixEcom v2.0 CDN Distribution',
      enabled: true,
      priceClass,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      enableIpv6: true,
      enableLogging: enableLogs,
      logBucket: enableLogs ? this.logsBucket : undefined,
      logFilePrefix: 'cloudfront-logs/',
      logIncludesCookies: true,
      certificate,
      domainNames: props?.domainName ? [props.domainName] : undefined,
      webAclId,
      defaultBehavior: {
        origin: webOrigin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachePolicy: webCachePolicy,
        responseHeadersPolicy: securityHeadersPolicy,
        compress: true,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: apiOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: apiCachePolicy,
          originRequestPolicy: apiOriginRequestPolicy,
          responseHeadersPolicy: securityHeadersPolicy,
          compress: true,
        },
        '/static/*': {
          origin: s3Origin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          cachePolicy: staticAssetsCachePolicy,
          responseHeadersPolicy: securityHeadersPolicy,
          compress: true,
        },
        '/_next/static/*': {
          origin: webOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          cachePolicy: staticAssetsCachePolicy,
          responseHeadersPolicy: securityHeadersPolicy,
          compress: true,
        },
        '/_next/image*': {
          origin: webOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          cachePolicy: staticAssetsCachePolicy,
          responseHeadersPolicy: securityHeadersPolicy,
          compress: true,
        },
      },
      errorResponses: [
        {
          httpStatus: 404,
          ttl: cdk.Duration.seconds(10),
        },
        {
          httpStatus: 500,
          ttl: cdk.Duration.seconds(0),
        },
        {
          httpStatus: 502,
          ttl: cdk.Duration.seconds(0),
        },
        {
          httpStatus: 503,
          ttl: cdk.Duration.seconds(0),
        },
        {
          httpStatus: 504,
          ttl: cdk.Duration.seconds(0),
        },
      ],
    });

    // Outputs
    new cdk.CfnOutput(this, 'DistributionId', {
      value: this.distribution.distributionId,
      description: 'CloudFront Distribution ID',
      exportName: 'PixEcomCdnDistributionId',
    });

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: this.distribution.distributionDomainName,
      description: 'CloudFront Distribution Domain Name',
      exportName: 'PixEcomCdnDomainName',
    });

    new cdk.CfnOutput(this, 'StaticAssetsBucketName', {
      value: this.staticAssetsBucket.bucketName,
      description: 'S3 Bucket for Static Assets',
      exportName: 'PixEcomStaticAssetsBucket',
    });

    new cdk.CfnOutput(this, 'LogsBucketName', {
      value: this.logsBucket.bucketName,
      description: 'S3 Bucket for CloudFront Logs',
      exportName: 'PixEcomCdnLogsBucket',
    });
  }

  private getPriceClass(priceClassStr?: string): cloudfront.PriceClass {
    switch (priceClassStr) {
      case 'PriceClass_100':
        return cloudfront.PriceClass.PRICE_CLASS_100;
      case 'PriceClass_200':
        return cloudfront.PriceClass.PRICE_CLASS_200;
      case 'PriceClass_All':
        return cloudfront.PriceClass.PRICE_CLASS_ALL;
      default:
        return cloudfront.PriceClass.PRICE_CLASS_100;
    }
  }
}
