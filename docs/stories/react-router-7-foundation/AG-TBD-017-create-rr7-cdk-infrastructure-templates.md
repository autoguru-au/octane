# Story: GDU. Infrastructure. As a DevOps Engineer, I want CDK infrastructure templates for React Router 7, so that I can deploy SSR applications to AWS

## Story Details

**Story ID**: AG-TBD-017
**Epic**: AG-TBD-001 - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Must Have
**Story Points**: 8
**Sprint**: 8

## Description

### Summary
We need to create AWS CDK infrastructure templates for deploying React Router 7 SSR applications to AWS. This includes Lambda functions with the Lambda Web Adapter layer, API Gateway for routing, CloudFront for CDN and static assets, S3 for build artifacts, and all necessary IAM roles and permissions. The templates should support multi-environment deployments (dev, uat, preprod, prod) and integrate with our existing deployment pipeline.

These templates will be created in the MFE repository and follow AutoGuru's established patterns for infrastructure as code.

### Background
Currently, our Next.js applications are deployed using CDK templates that configure Lambda, API Gateway, CloudFront, and S3. These templates handle environment-specific configuration, domain routing, monitoring, and alarms.

React Router 7 requires a different deployment approach:
- Lambda Web Adapter layer for SSR
- Vite build output (different structure than Next.js)
- Separate client/server bundles
- CloudFront configuration for static assets

We need to create new CDK templates that support these requirements while maintaining compatibility with our existing deployment processes.

### User Value
DevOps engineers and developers can deploy React Router 7 SSR applications to AWS with production-grade infrastructure, automatic scaling, monitoring, and all the benefits of infrastructure as code.

## User Persona

**Role**: DevOps Engineer / Platform Engineer
**Name**: "Infra Ian the Infrastructure Engineer"
**Context**: Deploying and managing SSR applications in AWS
**Goals**:
- Deploy applications with infrastructure as code
- Support multi-environment deployments
- Ensure high availability and performance
- Monitor applications effectively
- Keep costs optimized
**Pain Points**:
- Manual infrastructure setup is error-prone
- Different frameworks need different infrastructure
- Managing multiple environments is complex
- Need to balance cost and performance

## Acceptance Criteria

### Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | CDK stack created for React Router 7 SSR applications in MFE repo | ☐ | ☐ | ☐ |
| 2 | Lambda function configured with Lambda Web Adapter layer | ☐ | ☐ | ☐ |
| 3 | API Gateway (HTTP API) routes all requests to Lambda | ☐ | ☐ | ☐ |
| 4 | CloudFront distribution serves static assets from S3 and proxies SSR to API Gateway | ☐ | ☐ | ☐ |
| 5 | S3 bucket created for static assets (client build output) | ☐ | ☐ | ☐ |
| 6 | Environment variables passed to Lambda (APP_ENV, NODE_ENV, etc.) | ☐ | ☐ | ☐ |
| 7 | IAM roles and permissions configured (Lambda execution, S3 access, CloudWatch) | ☐ | ☐ | ☐ |
| 8 | CloudWatch log groups created with retention policies | ☐ | ☐ | ☐ |
| 9 | CloudWatch alarms for errors, throttles, and high duration | ☐ | ☐ | ☐ |
| 10 | Custom domain configuration (Route53 + ACM certificate) | ☐ | ☐ | ☐ |
| 11 | Multi-environment support (dev, uat, preprod, prod) | ☐ | ☐ | ☐ |

### Non-Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Infrastructure deployment completes within 10 minutes | ☐ | ☐ | ☐ |
| 2 | Lambda memory configurable (default 512MB, up to 10GB) | ☐ | ☐ | ☐ |
| 3 | Lambda timeout configurable (default 30s, up to 900s) | ☐ | ☐ | ☐ |
| 4 | CloudFront cache TTL configurable per environment | ☐ | ☐ | ☐ |
| 5 | Auto-scaling configured for API Gateway | ☐ | ☐ | ☐ |
| 6 | Cost tags applied to all resources | ☐ | ☐ | ☐ |

### Edge Cases

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Handle Lambda cold starts gracefully (warmers optional) | ☐ | ☐ | ☐ |
| 2 | Support custom Lambda layers (for shared dependencies) | ☐ | ☐ | ☐ |
| 3 | Handle CloudFront cache invalidations on deploy | ☐ | ☐ | ☐ |
| 4 | Support blue/green deployments (Lambda aliases) | ☐ | ☐ | ☐ |

## Technical Implementation

### Infrastructure (CDK Stack)

#### Repository Structure
```
mfe/
├── infrastructure/                   # CDK infrastructure
│   ├── lib/
│   │   ├── stacks/
│   │   │   └── react-router-ssr-stack.ts    # Main RR7 SSR stack
│   │   ├── constructs/
│   │   │   ├── lambda-ssr.ts                # Lambda SSR construct
│   │   │   ├── cloudfront-ssr.ts            # CloudFront construct
│   │   │   ├── s3-assets.ts                 # S3 static assets
│   │   │   └── monitoring.ts                # CloudWatch monitoring
│   │   └── config/
│   │       └── react-router-config.ts        # Config interface
│   ├── bin/
│   │   └── deploy-react-router-app.ts       # Deployment entry
│   └── README.md
```

#### Main CDK Stack
```typescript
// infrastructure/lib/stacks/react-router-ssr-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

import { LambdaSSRConstruct } from '../constructs/lambda-ssr';
import { CloudFrontSSRConstruct } from '../constructs/cloudfront-ssr';
import { S3AssetsConstruct } from '../constructs/s3-assets';
import { MonitoringConstruct } from '../constructs/monitoring';

export interface ReactRouterSSRStackProps extends cdk.StackProps {
  appName: string;
  environment: 'dev' | 'uat' | 'preprod' | 'prod';
  buildPath: string;                   // Path to React Router build output
  domainName?: string;                 // Custom domain
  certificateArn?: string;             // ACM certificate ARN
  lambdaMemorySize?: number;           // Lambda memory (MB)
  lambdaTimeout?: cdk.Duration;        // Lambda timeout
  enableXray?: boolean;                // Enable X-Ray tracing
  enableProvisioning?: boolean;        // Provisioned concurrency
  provisionedConcurrentExecutions?: number;
}

export class ReactRouterSSRStack extends cdk.Stack {
  public readonly lambdaFunction: lambda.Function;
  public readonly apiGateway: apigatewayv2.HttpApi;
  public readonly cloudFrontDistribution: cloudfront.Distribution;
  public readonly assetsBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: ReactRouterSSRStackProps) {
    super(scope, id, props);

    // S3 bucket for static assets
    const assetsConstruct = new S3AssetsConstruct(this, 'Assets', {
      appName: props.appName,
      environment: props.environment,
      buildPath: `${props.buildPath}/client`,
    });
    this.assetsBucket = assetsConstruct.bucket;

    // Lambda function with Web Adapter
    const lambdaConstruct = new LambdaSSRConstruct(this, 'SSRLambda', {
      appName: props.appName,
      environment: props.environment,
      buildPath: `${props.buildPath}/server`,
      memorySize: props.lambdaMemorySize || 512,
      timeout: props.lambdaTimeout || cdk.Duration.seconds(30),
      enableXray: props.enableXray ?? false,
      environmentVariables: {
        APP_ENV: props.environment,
        NODE_ENV: 'production',
        CLOUDFRONT_DOMAIN: '', // Set after CloudFront created
      },
    });
    this.lambdaFunction = lambdaConstruct.function;

    // API Gateway HTTP API
    this.apiGateway = new apigatewayv2.HttpApi(this, 'HttpApi', {
      apiName: `${props.appName}-${props.environment}`,
      description: `React Router 7 SSR API for ${props.appName}`,
      defaultIntegration: new integrations.HttpLambdaIntegration(
        'LambdaIntegration',
        this.lambdaFunction,
        {
          payloadFormatVersion: apigatewayv2.PayloadFormatVersion.VERSION_2_0,
        }
      ),
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [apigatewayv2.CorsHttpMethod.ANY],
        allowHeaders: ['*'],
      },
    });

    // CloudFront distribution
    const cloudFrontConstruct = new CloudFrontSSRConstruct(this, 'CloudFront', {
      appName: props.appName,
      environment: props.environment,
      assetsBucket: this.assetsBucket,
      apiGateway: this.apiGateway,
      domainName: props.domainName,
      certificateArn: props.certificateArn,
    });
    this.cloudFrontDistribution = cloudFrontConstruct.distribution;

    // Update Lambda with CloudFront domain
    this.lambdaFunction.addEnvironment(
      'CLOUDFRONT_DOMAIN',
      this.cloudFrontDistribution.distributionDomainName
    );

    // Monitoring and alarms
    new MonitoringConstruct(this, 'Monitoring', {
      appName: props.appName,
      environment: props.environment,
      lambdaFunction: this.lambdaFunction,
      apiGateway: this.apiGateway,
      cloudFrontDistribution: this.cloudFrontDistribution,
    });

    // Provisioned concurrency (optional, for production)
    if (props.enableProvisioning) {
      const version = this.lambdaFunction.currentVersion;
      const alias = new lambda.Alias(this, 'LiveAlias', {
        aliasName: 'live',
        version,
        provisionedConcurrentExecutions: props.provisionedConcurrentExecutions || 2,
      });
    }

    // Outputs
    new cdk.CfnOutput(this, 'CloudFrontURL', {
      value: `https://${this.cloudFrontDistribution.distributionDomainName}`,
      description: 'CloudFront distribution URL',
    });

    new cdk.CfnOutput(this, 'ApiGatewayURL', {
      value: this.apiGateway.url!,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'AssetsBucketName', {
      value: this.assetsBucket.bucketName,
      description: 'S3 bucket for static assets',
    });

    if (props.domainName) {
      new cdk.CfnOutput(this, 'CustomDomainURL', {
        value: `https://${props.domainName}`,
        description: 'Custom domain URL',
      });
    }
  }
}
```

#### Lambda SSR Construct
```typescript
// infrastructure/lib/constructs/lambda-ssr.ts
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface LambdaSSRConstructProps {
  appName: string;
  environment: string;
  buildPath: string;
  memorySize?: number;
  timeout?: cdk.Duration;
  enableXray?: boolean;
  environmentVariables?: Record<string, string>;
}

export class LambdaSSRConstruct extends Construct {
  public readonly function: lambda.Function;

  constructor(scope: Construct, id: string, props: LambdaSSRConstructProps) {
    super(scope, id);

    // Lambda Web Adapter layer
    const webAdapterLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      'LambdaWebAdapter',
      `arn:aws:lambda:${cdk.Stack.of(this).region}:753240598075:layer:LambdaAdapterLayerX86:20`
    );

    // Lambda function
    this.function = new lambda.Function(this, 'Function', {
      functionName: `${props.appName}-ssr-${props.environment}`,
      description: `React Router 7 SSR function for ${props.appName}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.X86_64, // or ARM_64 for better price/performance
      handler: 'handler.handler', // Not used with Web Adapter, but required
      code: lambda.Code.fromAsset(props.buildPath),
      memorySize: props.memorySize || 512,
      timeout: props.timeout || cdk.Duration.seconds(30),
      layers: [webAdapterLayer],
      environment: {
        AWS_LAMBDA_EXEC_WRAPPER: '/opt/bootstrap',
        PORT: '8080', // Lambda Web Adapter expects app on this port
        ...props.environmentVariables,
      },
      tracing: props.enableXray ? lambda.Tracing.ACTIVE : lambda.Tracing.DISABLED,
      logRetention: logs.RetentionDays.ONE_MONTH,
      reservedConcurrentExecutions: undefined, // No limit by default
    });

    // Grant CloudWatch Logs permissions
    this.function.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:PutLogEvents',
        ],
        resources: ['*'],
      })
    );

    // Add tags
    cdk.Tags.of(this.function).add('App', props.appName);
    cdk.Tags.of(this.function).add('Environment', props.environment);
    cdk.Tags.of(this.function).add('ManagedBy', 'CDK');
  }
}
```

#### CloudFront Construct
```typescript
// infrastructure/lib/constructs/cloudfront-ssr.ts
import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

export interface CloudFrontSSRConstructProps {
  appName: string;
  environment: string;
  assetsBucket: s3.Bucket;
  apiGateway: apigatewayv2.HttpApi;
  domainName?: string;
  certificateArn?: string;
}

export class CloudFrontSSRConstruct extends Construct {
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: CloudFrontSSRConstructProps) {
    super(scope, id);

    // Origin Access Identity for S3
    const oai = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: `OAI for ${props.appName} ${props.environment}`,
    });

    // Grant read access to CloudFront
    props.assetsBucket.grantRead(oai);

    // S3 origin for static assets
    const s3Origin = new origins.S3Origin(props.assetsBucket, {
      originAccessIdentity: oai,
    });

    // API Gateway origin for SSR
    const apiOrigin = new origins.HttpOrigin(
      `${props.apiGateway.apiId}.execute-api.${cdk.Stack.of(this).region}.amazonaws.com`,
      {
        protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
      }
    );

    // Cache policy for static assets (long TTL)
    const staticCachePolicy = new cloudfront.CachePolicy(this, 'StaticCachePolicy', {
      cachePolicyName: `${props.appName}-static-${props.environment}`,
      comment: 'Cache policy for static assets',
      defaultTtl: cdk.Duration.days(365),
      maxTtl: cdk.Duration.days(365),
      minTtl: cdk.Duration.days(365),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
    });

    // Cache policy for SSR (no caching or short TTL)
    const ssrCachePolicy = new cloudfront.CachePolicy(this, 'SSRCachePolicy', {
      cachePolicyName: `${props.appName}-ssr-${props.environment}`,
      comment: 'Cache policy for SSR responses',
      defaultTtl: cdk.Duration.seconds(0),
      maxTtl: cdk.Duration.seconds(1),
      minTtl: cdk.Duration.seconds(0),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
      headerBehavior: cloudfront.CacheHeaderBehavior.allowList(
        'Accept',
        'Accept-Language',
        'Authorization',
      ),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
      cookieBehavior: cloudfront.CacheCookieBehavior.all(),
    });

    // Custom domain config
    const domainNames = props.domainName ? [props.domainName] : undefined;
    const certificate = props.certificateArn
      ? acm.Certificate.fromCertificateArn(this, 'Certificate', props.certificateArn)
      : undefined;

    // CloudFront distribution
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: `React Router 7 SSR distribution for ${props.appName} ${props.environment}`,
      defaultBehavior: {
        origin: apiOrigin,
        cachePolicy: ssrCachePolicy,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        compress: true,
      },
      additionalBehaviors: {
        // Static assets from S3
        '/assets/*': {
          origin: s3Origin,
          cachePolicy: staticCachePolicy,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          compress: true,
        },
        '*.js': {
          origin: s3Origin,
          cachePolicy: staticCachePolicy,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          compress: true,
        },
        '*.css': {
          origin: s3Origin,
          cachePolicy: staticCachePolicy,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          compress: true,
        },
      },
      domainNames,
      certificate,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // US, Canada, Europe
      enableIpv6: true,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
    });

    // Add tags
    cdk.Tags.of(this.distribution).add('App', props.appName);
    cdk.Tags.of(this.distribution).add('Environment', props.environment);
  }
}
```

#### S3 Assets Construct
```typescript
// infrastructure/lib/constructs/s3-assets.ts
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

export interface S3AssetsConstructProps {
  appName: string;
  environment: string;
  buildPath: string; // Path to client build
}

export class S3AssetsConstruct extends Construct {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: S3AssetsConstructProps) {
    super(scope, id);

    // S3 bucket for static assets
    this.bucket = new s3.Bucket(this, 'Bucket', {
      bucketName: `${props.appName}-assets-${props.environment}`,
      versioned: false,
      publicReadAccess: false, // CloudFront OAI will access
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      lifecycleRules: [
        {
          enabled: true,
          noncurrentVersionExpiration: cdk.Duration.days(30),
        },
      ],
      removalPolicy: props.environment === 'prod'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: props.environment !== 'prod',
    });

    // Deploy static assets
    new s3deploy.BucketDeployment(this, 'DeployAssets', {
      sources: [s3deploy.Source.asset(props.buildPath)],
      destinationBucket: this.bucket,
      cacheControl: [
        s3deploy.CacheControl.maxAge(cdk.Duration.days(365)),
        s3deploy.CacheControl.immutable(),
      ],
      prune: true, // Remove old files
    });

    // Add tags
    cdk.Tags.of(this.bucket).add('App', props.appName);
    cdk.Tags.of(this.bucket).add('Environment', props.environment);
  }
}
```

#### Monitoring Construct
```typescript
// infrastructure/lib/constructs/monitoring.ts
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Construct } from 'constructs';

export interface MonitoringConstructProps {
  appName: string;
  environment: string;
  lambdaFunction: lambda.Function;
  apiGateway: apigatewayv2.HttpApi;
  cloudFrontDistribution: cloudfront.Distribution;
  alarmEmail?: string;
}

export class MonitoringConstruct extends Construct {
  constructor(scope: Construct, id: string, props: MonitoringConstructProps) {
    super(scope, id);

    // SNS topic for alarms
    const alarmTopic = new sns.Topic(this, 'AlarmTopic', {
      displayName: `${props.appName} ${props.environment} Alarms`,
    });

    // Lambda error alarm
    const errorAlarm = new cloudwatch.Alarm(this, 'LambdaErrorAlarm', {
      alarmName: `${props.appName}-${props.environment}-lambda-errors`,
      metric: props.lambdaFunction.metricErrors({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 5,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    errorAlarm.addAlarmAction(new actions.SnsAction(alarmTopic));

    // Lambda throttle alarm
    const throttleAlarm = new cloudwatch.Alarm(this, 'LambdaThrottleAlarm', {
      alarmName: `${props.appName}-${props.environment}-lambda-throttles`,
      metric: props.lambdaFunction.metricThrottles({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    throttleAlarm.addAlarmAction(new actions.SnsAction(alarmTopic));

    // Lambda duration alarm (p95)
    const durationAlarm = new cloudwatch.Alarm(this, 'LambdaDurationAlarm', {
      alarmName: `${props.appName}-${props.environment}-lambda-duration`,
      metric: props.lambdaFunction.metricDuration({
        period: cdk.Duration.minutes(5),
        statistic: 'p95',
      }),
      threshold: 5000, // 5 seconds
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    durationAlarm.addAlarmAction(new actions.SnsAction(alarmTopic));

    // API Gateway 5xx alarm
    const apiErrorAlarm = new cloudwatch.Alarm(this, 'ApiErrorAlarm', {
      alarmName: `${props.appName}-${props.environment}-api-5xx`,
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ApiGateway',
        metricName: '5XXError',
        dimensionsMap: {
          ApiId: props.apiGateway.apiId,
        },
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 10,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    apiErrorAlarm.addAlarmAction(new actions.SnsAction(alarmTopic));

    // CloudFront error rate alarm
    const cloudFrontErrorAlarm = new cloudwatch.Alarm(this, 'CloudFrontErrorAlarm', {
      alarmName: `${props.appName}-${props.environment}-cloudfront-errors`,
      metric: new cloudwatch.Metric({
        namespace: 'AWS/CloudFront',
        metricName: '5xxErrorRate',
        dimensionsMap: {
          DistributionId: props.cloudFrontDistribution.distributionId,
        },
        period: cdk.Duration.minutes(5),
        statistic: 'Average',
      }),
      threshold: 5, // 5%
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    cloudFrontErrorAlarm.addAlarmAction(new actions.SnsAction(alarmTopic));

    // Dashboard
    new cloudwatch.Dashboard(this, 'Dashboard', {
      dashboardName: `${props.appName}-${props.environment}`,
      widgets: [
        [
          new cloudwatch.GraphWidget({
            title: 'Lambda Invocations',
            left: [props.lambdaFunction.metricInvocations()],
          }),
          new cloudwatch.GraphWidget({
            title: 'Lambda Errors',
            left: [props.lambdaFunction.metricErrors()],
          }),
        ],
        [
          new cloudwatch.GraphWidget({
            title: 'Lambda Duration (p50, p95, p99)',
            left: [
              props.lambdaFunction.metricDuration({ statistic: 'p50' }),
              props.lambdaFunction.metricDuration({ statistic: 'p95' }),
              props.lambdaFunction.metricDuration({ statistic: 'p99' }),
            ],
          }),
          new cloudwatch.GraphWidget({
            title: 'API Gateway Requests',
            left: [
              new cloudwatch.Metric({
                namespace: 'AWS/ApiGateway',
                metricName: 'Count',
                dimensionsMap: { ApiId: props.apiGateway.apiId },
                statistic: 'Sum',
              }),
            ],
          }),
        ],
      ],
    });
  }
}
```

### Deployment Script

```typescript
// infrastructure/bin/deploy-react-router-app.ts
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ReactRouterSSRStack } from '../lib/stacks/react-router-ssr-stack';

const app = new cdk.App();

// Get config from context
const appName = app.node.tryGetContext('appName');
const environment = app.node.tryGetContext('environment');
const buildPath = app.node.tryGetContext('buildPath');

if (!appName || !environment || !buildPath) {
  throw new Error('Missing required context: appName, environment, buildPath');
}

new ReactRouterSSRStack(app, `${appName}-${environment}`, {
  appName,
  environment,
  buildPath,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'ap-southeast-2',
  },
  // Optional: Add custom domain for prod
  ...(environment === 'prod' && {
    domainName: `${appName}.autoguru.com.au`,
    certificateArn: process.env.ACM_CERTIFICATE_ARN,
  }),
  // Optional: Enable provisioned concurrency for prod
  ...(environment === 'prod' && {
    enableProvisioning: true,
    provisionedConcurrentExecutions: 2,
  }),
});
```

### Deployment Commands

```bash
# Build React Router app
cd packages/my-ssr-app
npm run build -- --env prod

# Deploy infrastructure
cd mfe/infrastructure
cdk deploy \
  -c appName=my-ssr-app \
  -c environment=prod \
  -c buildPath=../../packages/my-ssr-app/dist/prod
```

## Integration Points

#### React Router 7 Build Output
- Reads server bundle from `dist/{env}/server`
- Reads client bundle from `dist/{env}/client`
- Deploys client to S3, server to Lambda

#### AWS Services
- Lambda: Runs SSR server
- API Gateway: Routes requests to Lambda
- CloudFront: CDN and static assets
- S3: Static asset storage
- CloudWatch: Logs and metrics
- Route53: DNS (optional)
- ACM: SSL certificates (optional)

#### Deployment Pipeline
- Integrates with existing CI/CD (Octopus Deploy)
- Supports multi-environment deployments
- Handles CloudFront cache invalidation

## UI/UX Specifications

N/A - Infrastructure story

## Test Scenarios

### Deployment Tests
1. Deploy to dev environment
2. Verify all resources created
3. Test Lambda function invocation
4. Test CloudFront distribution
5. Verify S3 assets deployed

### Functional Tests
1. **SSR Request**: Access app via CloudFront, verify HTML rendered
2. **Static Assets**: Verify JS/CSS loaded from S3
3. **API Gateway**: Test direct API Gateway access
4. **Custom Domain**: Verify custom domain routing (prod)

### Monitoring Tests
1. **CloudWatch Logs**: Verify logs appear
2. **Metrics**: Verify Lambda metrics recorded
3. **Alarms**: Trigger test alarm
4. **Dashboard**: View CloudWatch dashboard

## Definition of Done

### Development Complete
- [ ] CDK stack created
- [ ] Lambda SSR construct implemented
- [ ] CloudFront construct implemented
- [ ] S3 assets construct implemented
- [ ] Monitoring construct implemented
- [ ] Deployment script created
- [ ] Code reviewed and approved

### Testing Complete
- [ ] Deploy to dev environment successfully
- [ ] Lambda function invoked successfully
- [ ] CloudFront serves content
- [ ] S3 assets accessible
- [ ] Custom domain works (if configured)
- [ ] Alarms trigger correctly
- [ ] Dashboard displays metrics

### Documentation Complete
- [ ] Infrastructure architecture documented
- [ ] Deployment process documented
- [ ] Configuration options documented
- [ ] Troubleshooting guide created
- [ ] Cost estimation documented

### Deployment Ready
- [ ] Tested in dev environment
- [ ] Multi-environment support verified
- [ ] Monitoring and alarms working
- [ ] DevOps team trained
- [ ] Runbook created

## Dependencies

### Blocked By
- AG-TBD-015: Lambda Web Adapter integration (need handler format)

### Blocks
- AG-TBD-020: Pilot app migration (need infrastructure to deploy to)

### Related Stories
- AG-TBD-014: React Router config (builds the artifacts)
- AG-TBD-018: Build manifest (may influence deployment)

## Story Points Justification

**Complexity Factors**:
- **Frontend Complexity**: N/A

- **Backend Complexity**: High
  - Multiple AWS services (Lambda, API Gateway, CloudFront, S3)
  - CDK construct design
  - Multi-environment configuration
  - Monitoring and alarms
  - Custom domain setup

- **Testing Effort**: Medium
  - Deploy to dev environment
  - Test all AWS services
  - Verify monitoring
  - Test multi-environment

- **Integration Points**: 6
  - React Router build output
  - Lambda Web Adapter
  - API Gateway
  - CloudFront
  - S3
  - CloudWatch

- **Unknown Factors**:
  - Lambda Web Adapter layer compatibility
  - CloudFront cache behavior with SSR
  - Optimal Lambda memory/timeout settings

**Total Points**: 8

## Notes & Decisions

### Technical Decisions
- **CDK over CloudFormation**: Better developer experience, type safety
- **HTTP API over REST API**: Lower latency, lower cost, simpler
- **Lambda Web Adapter**: Standard approach for web frameworks
- **CloudFront + S3**: Best practice for static assets
- **Provisioned Concurrency**: Optional, for prod apps with strict latency requirements

### Open Questions
- [ ] Should we use Lambda@Edge for even lower latency?
- [ ] Do we need WAF for security?
- [ ] Should we implement blue/green deployments?
- [ ] Do we need separate stacks for frontend/backend?

### Assumptions
- AWS account and region configured
- ACM certificate available for custom domains
- Route53 hosted zone exists for domains
- CI/CD pipeline can run CDK deploy

### Cost Considerations
- Lambda: Pay per request, <$0.01 per 1000 requests
- API Gateway: ~$1 per million requests
- CloudFront: ~$0.085 per GB transfer
- S3: ~$0.023 per GB storage
- Provisioned Concurrency: ~$0.015 per GB-hour (expensive!)

### Files to Create

```
mfe/infrastructure/
├── lib/
│   ├── stacks/
│   │   └── react-router-ssr-stack.ts
│   ├── constructs/
│   │   ├── lambda-ssr.ts
│   │   ├── cloudfront-ssr.ts
│   │   ├── s3-assets.ts
│   │   └── monitoring.ts
│   └── config/
│       └── react-router-config.ts
├── bin/
│   └── deploy-react-router-app.ts
├── README.md
└── cdk.json
```

### New Dependencies

```json
{
  "dependencies": {
    "aws-cdk-lib": "^2.100.0",
    "constructs": "^10.0.0",
    "source-map-support": "^0.5.21"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```
