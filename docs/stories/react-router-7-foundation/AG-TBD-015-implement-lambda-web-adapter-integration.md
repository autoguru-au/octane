# Story: GDU. Build Tooling. As a Developer, I want Lambda Web Adapter integration, so that I can deploy React Router 7 SSR apps to AWS Lambda

## Story Details

**Story ID**: AG-TBD-015
**Epic**: AG-TBD-001 - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Must Have
**Story Points**: 13
**Sprint**: 7

## Description

### Summary
We need to create an integration layer between React Router 7's SSR output and AWS Lambda using the Lambda Web Adapter. This adapter allows us to deploy standard Node.js web applications (Express, Fastify, etc.) to Lambda by translating Lambda events to HTTP requests. This is critical infrastructure that enables our SSR applications to run serverlessly in production.

The handler needs to be performant (especially cold starts), support streaming responses, handle multi-tenant routing, and integrate seamlessly with our existing deployment pipeline.

### Background
Currently, our Next.js SSR applications run on Lambda using Next.js's built-in Lambda support. React Router 7 doesn't have Lambda-specific builds - it outputs a standard Node.js server. The AWS Lambda Web Adapter is the recommended approach for deploying modern web frameworks to Lambda.

The Lambda Web Adapter wraps your web application and translates AWS Lambda events (from API Gateway or ALB) into standard HTTP requests that your application understands. This means we can write a standard Express server for React Router 7 and deploy it to Lambda without Lambda-specific code.

### User Value
Developers can deploy React Router 7 SSR applications to AWS Lambda with production-grade performance, automatic scaling, and cost efficiency, while writing standard Node.js server code without Lambda-specific concerns.

## User Persona

**Role**: Full-Stack Developer / DevOps Engineer
**Name**: "Deploy Diane the Platform Engineer"
**Context**: Deploying SSR applications to AWS Lambda in production
**Goals**:
- Deploy SSR apps with minimal cold start time
- Support multi-tenant routing (multiple domains/apps on one Lambda)
- Stream large responses efficiently
- Monitor performance and errors
**Pain Points**:
- Lambda cold starts can be slow
- Lambda has memory and timeout constraints
- Need to handle AWS-specific event formats
- Debugging Lambda issues is difficult

## Acceptance Criteria

### Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Lambda handler created at `packages/gdu/config/react-router/lambda/handler.ts` | ☐ | ☐ | ☐ |
| 2 | Express server wraps React Router 7 request handler | ☐ | ☐ | ☐ |
| 3 | Handler translates Lambda events to HTTP requests correctly | ☐ | ☐ | ☐ |
| 4 | Streaming responses work (chunked transfer encoding) | ☐ | ☐ | ☐ |
| 5 | Environment variables are read from Lambda environment | ☐ | ☐ | ☐ |
| 6 | Multi-tenant routing supported (route based on host header) | ☐ | ☐ | ☐ |
| 7 | Static assets are served correctly (or redirected to CloudFront) | ☐ | ☐ | ☐ |
| 8 | Health check endpoint responds at `/__health` | ☐ | ☐ | ☐ |
| 9 | Request/response logging integrated with CloudWatch | ☐ | ☐ | ☐ |
| 10 | Error handling catches and logs all errors properly | ☐ | ☐ | ☐ |

### Non-Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Cold start completes within 2 seconds (p95) | ☐ | ☐ | ☐ |
| 2 | Warm request latency under 100ms (p95) | ☐ | ☐ | ☐ |
| 3 | Memory usage under 512MB during normal operation | ☐ | ☐ | ☐ |
| 4 | Handler bundle size under 10MB (pre-compression) | ☐ | ☐ | ☐ |
| 5 | Supports Lambda timeout up to 30 seconds | ☐ | ☐ | ☐ |
| 6 | Graceful shutdown on Lambda freeze | ☐ | ☐ | ☐ |

### Edge Cases

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Handle Lambda event payload limit (6MB request) | ☐ | ☐ | ☐ |
| 2 | Gracefully handle response size exceeding 6MB | ☐ | ☐ | ☐ |
| 3 | Support API Gateway v1 and v2 event formats | ☐ | ☐ | ☐ |
| 4 | Handle ALB events for direct ALB integration | ☐ | ☐ | ☐ |
| 5 | Recover from React Router rendering errors | ☐ | ☐ | ☐ |
| 6 | Handle missing static assets gracefully | ☐ | ☐ | ☐ |

## Technical Implementation

### Backend (Lambda Handler)

#### Component Structure
```
packages/gdu/config/react-router/lambda/
├── handler.ts                    # Main Lambda handler
├── server.ts                     # Express server setup
├── adapter.ts                    # Lambda Web Adapter wrapper
├── middleware/
│   ├── logging.ts                # Request/response logging
│   ├── error-handler.ts          # Global error handling
│   ├── health-check.ts           # Health check endpoint
│   └── static-assets.ts          # Static asset handling
├── utils/
│   ├── cold-start.ts             # Cold start optimization
│   ├── streaming.ts              # Streaming response helpers
│   └── multi-tenant.ts           # Multi-tenant routing
└── __tests__/
    ├── handler.test.ts
    ├── server.test.ts
    └── integration.test.ts
```

#### Main Lambda Handler
```typescript
// packages/gdu/config/react-router/lambda/handler.ts
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import { createRequestHandler } from '@react-router/express';
import express from 'express';
import serverless from 'serverless-http';
import { createLogger } from '@autoguru/utilities';

import { createServer } from './server';

const logger = createLogger('lambda-handler');

// Track cold starts
let isColdStart = true;

// Create Express app (done once, reused across invocations)
const app = createServer();

// Wrap with serverless-http for Lambda compatibility
const serverlessHandler = serverless(app, {
  binary: [
    'image/*',
    'application/pdf',
    'application/octet-stream',
    'font/*',
  ],
  request(request, event, context) {
    // Attach Lambda context to request
    request.lambdaEvent = event;
    request.lambdaContext = context;
  },
});

export const handler = async (
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyResultV2> => {
  const coldStart = isColdStart;
  isColdStart = false;

  const startTime = Date.now();

  try {
    logger.info('Request received', {
      coldStart,
      path: event.rawPath,
      method: event.requestContext.http.method,
      requestId: context.requestId,
    });

    // Call the serverless handler
    const response = await serverlessHandler(event, context);

    const duration = Date.now() - startTime;

    logger.info('Request completed', {
      coldStart,
      duration,
      statusCode: response.statusCode,
      requestId: context.requestId,
    });

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Request failed', {
      coldStart,
      duration,
      error: error.message,
      stack: error.stack,
      requestId: context.requestId,
    });

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        requestId: context.requestId,
      }),
      headers: {
        'content-type': 'application/json',
      },
    };
  }
};
```

#### Express Server Setup
```typescript
// packages/gdu/config/react-router/lambda/server.ts
import { createRequestHandler } from '@react-router/express';
import compression from 'compression';
import express from 'express';
import type { Express } from 'express';

import { errorHandler } from './middleware/error-handler';
import { healthCheck } from './middleware/health-check';
import { loggingMiddleware } from './middleware/logging';
import { staticAssetRedirect } from './middleware/static-assets';

const BUILD_DIR = process.env.BUILD_DIR || './dist';

export const createServer = (): Express => {
  const app = express();

  // Trust proxy headers from API Gateway/ALB
  app.set('trust proxy', true);

  // Compression
  app.use(compression());

  // Logging middleware
  app.use(loggingMiddleware);

  // Health check endpoint
  app.get('/__health', healthCheck);

  // Static assets - redirect to CloudFront or serve directly
  app.use(staticAssetRedirect);

  // React Router request handler
  app.all(
    '*',
    createRequestHandler({
      build: require(BUILD_DIR),
      mode: process.env.NODE_ENV || 'production',
      getLoadContext: (req, res) => {
        return {
          // Make Lambda context available in loaders/actions
          lambdaEvent: req.lambdaEvent,
          lambdaContext: req.lambdaContext,
        };
      },
    })
  );

  // Global error handler
  app.use(errorHandler);

  return app;
};
```

#### Logging Middleware
```typescript
// packages/gdu/config/react-router/lambda/middleware/logging.ts
import { createLogger } from '@autoguru/utilities';
import type { NextFunction, Request, Response } from 'express';

const logger = createLogger('http');

export const loggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  // Log request
  logger.info('Request started', {
    method: req.method,
    path: req.path,
    query: req.query,
    headers: {
      'user-agent': req.get('user-agent'),
      'x-forwarded-for': req.get('x-forwarded-for'),
      host: req.get('host'),
    },
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;

    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      contentLength: res.get('content-length'),
    });

    return originalSend.call(this, data);
  };

  next();
};
```

#### Error Handler Middleware
```typescript
// packages/gdu/config/react-router/lambda/middleware/error-handler.ts
import { createLogger } from '@autoguru/utilities';
import type { ErrorRequestHandler } from 'express';

const logger = createLogger('error-handler');

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Don't expose internal errors to client
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : err.message;

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
    }),
  });
};
```

#### Health Check Middleware
```typescript
// packages/gdu/config/react-router/lambda/middleware/health-check.ts
import type { Request, Response } from 'express';

export const healthCheck = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || 'unknown',
    environment: process.env.APP_ENV || 'unknown',
  });
};
```

#### Static Asset Redirect
```typescript
// packages/gdu/config/react-router/lambda/middleware/static-assets.ts
import type { NextFunction, Request, Response } from 'express';

const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN;
const SERVE_STATIC_FROM_LAMBDA = process.env.SERVE_STATIC_FROM_LAMBDA === 'true';

export const staticAssetRedirect = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check if this is a static asset request
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
  const isStatic = staticExtensions.some(ext => req.path.endsWith(ext));

  // If CloudFront is configured and this is a static asset, redirect
  if (CLOUDFRONT_DOMAIN && isStatic && !SERVE_STATIC_FROM_LAMBDA) {
    const cloudFrontUrl = `https://${CLOUDFRONT_DOMAIN}${req.path}`;
    return res.redirect(301, cloudFrontUrl);
  }

  // Otherwise, continue to next middleware
  next();
};
```

#### Multi-Tenant Support
```typescript
// packages/gdu/config/react-router/lambda/utils/multi-tenant.ts
import type { Request } from 'express';

/**
 * Determine the tenant from the request
 * Based on host header or custom routing logic
 */
export const getTenantFromRequest = (req: Request): string | null => {
  const host = req.get('host');

  if (!host) return null;

  // Example: Extract subdomain as tenant
  // app1.autoguru.com.au -> 'app1'
  // app2.autoguru.com.au -> 'app2'
  const subdomain = host.split('.')[0];

  // Add your tenant resolution logic
  const tenantMap: Record<string, string> = {
    'fleet': 'fleet-platform',
    'supplier': 'supplier-platform',
    'www': 'b2c-marketplace',
  };

  return tenantMap[subdomain] || null;
};
```

#### Cold Start Optimization
```typescript
// packages/gdu/config/react-router/lambda/utils/cold-start.ts

/**
 * Pre-load critical modules during cold start
 * to avoid lazy loading during first request
 */
export const prewarmModules = async () => {
  // Pre-load React Router build
  await import('./build/server');

  // Pre-load other critical modules
  await Promise.all([
    import('react'),
    import('react-dom/server'),
    import('@autoguru/utilities'),
  ]);
};

// Call during module initialization
if (process.env.PREWARM === 'true') {
  prewarmModules().catch(console.error);
}
```

### Lambda Deployment Package

#### Package Configuration
```typescript
// packages/gdu/config/react-router/lambda/package.config.ts

export const createLambdaPackageConfig = (buildEnv: string) => {
  return {
    // Files to include in Lambda package
    include: [
      'dist/**/server/**',      // Server build
      'dist/**/client/**',      // Client build (if serving from Lambda)
      'node_modules/**',        // Dependencies
      'handler.js',             // Entry point
    ],

    // Files to exclude (keep package small)
    exclude: [
      '**/*.map',               // Source maps
      '**/*.ts',                // TypeScript source
      '**/test/**',             // Tests
      '**/__tests__/**',        // Tests
      '.env*',                  // Env files (use Lambda env vars)
    ],

    // Compression
    compression: 'zip',

    // Output
    output: `lambda-package-${buildEnv}.zip`,
  };
};
```

### Integration Points

#### React Router 7 Build
- Imports server build from React Router output
- Uses `createRequestHandler` from `@react-router/express`
- Accesses build manifest for asset references

#### AWS Lambda
- Receives API Gateway v2 events
- Returns API Gateway v2 responses
- Uses Lambda context for request IDs, timeouts

#### CloudWatch Logs
- Structured JSON logging
- Request/response logging
- Error logging with stack traces
- Performance metrics (duration, cold starts)

#### CloudFront (Optional)
- Redirects static assets to CloudFront
- Or serves directly from Lambda if configured

#### Environment Variables
- `NODE_ENV`: development | production
- `APP_ENV`: dev | uat | preprod | prod
- `BUILD_DIR`: Path to React Router build
- `CLOUDFRONT_DOMAIN`: CloudFront domain for static assets
- `SERVE_STATIC_FROM_LAMBDA`: Whether to serve static from Lambda

## UI/UX Specifications

N/A - This is a backend infrastructure story

## Test Scenarios

### Happy Path
1. Lambda receives API Gateway event
2. Handler converts event to HTTP request
3. Express routes to React Router
4. React Router renders page
5. Response streamed back through Lambda
6. Client receives HTML

### Error Scenarios
1. **React Router Render Error**: Catches error, returns 500 with error page
2. **Lambda Timeout**: Gracefully terminates, logs timeout
3. **Out of Memory**: Lambda kills function, CloudWatch logs OOM
4. **Invalid Request**: Returns 400 with validation error

### Performance Tests
1. **Cold Start Benchmark**: Measure time from Lambda invoke to first byte
2. **Warm Request Benchmark**: Measure request handling time
3. **Memory Usage**: Monitor memory throughout request lifecycle
4. **Concurrent Requests**: Test with 100 concurrent requests
5. **Large Response**: Test streaming 10MB+ response

### Integration Tests
```typescript
// packages/gdu/config/react-router/lambda/__tests__/integration.test.ts
import { handler } from '../handler';

describe('Lambda Handler Integration', () => {
  it('handles API Gateway v2 event', async () => {
    const event = {
      version: '2.0',
      routeKey: '$default',
      rawPath: '/',
      requestContext: {
        http: {
          method: 'GET',
        },
      },
    };

    const response = await handler(event, mockContext);

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain('<!DOCTYPE html>');
  });

  it('handles health check', async () => {
    const event = createMockEvent('/__health');
    const response = await handler(event, mockContext);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      status: 'healthy',
    });
  });

  it('handles errors gracefully', async () => {
    // Mock React Router to throw error
    jest.spyOn(ReactRouter, 'createRequestHandler').mockImplementation(() => {
      throw new Error('Render error');
    });

    const event = createMockEvent('/');
    const response = await handler(event, mockContext);

    expect(response.statusCode).toBe(500);
  });
});
```

## Definition of Done

### Development Complete
- [ ] Lambda handler created with Express integration
- [ ] Serverless-http adapter configured
- [ ] All middleware implemented (logging, errors, health, static)
- [ ] Multi-tenant routing support
- [ ] Cold start optimization implemented
- [ ] Unit tests written (>80% coverage)
- [ ] Integration tests written
- [ ] Code reviewed and approved

### Testing Complete
- [ ] Test with mock Lambda events
- [ ] Test cold start performance (< 2s)
- [ ] Test warm request performance (< 100ms)
- [ ] Test with large payloads (near 6MB limit)
- [ ] Test streaming responses
- [ ] Test error handling
- [ ] Load test with Artillery/k6

### Documentation Complete
- [ ] Handler architecture documented
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Troubleshooting guide created
- [ ] Performance benchmarks documented

### Deployment Ready
- [ ] Lambda package configuration created
- [ ] CloudWatch logging verified
- [ ] CloudWatch metrics configured
- [ ] Alarms set up for errors and timeouts
- [ ] Tested in dev environment

## Dependencies

### Blocked By
- AG-TBD-014: React Router 7 base configuration (need build output)

### Blocks
- AG-TBD-017: CDK infrastructure templates (need handler interface)
- AG-TBD-020: Pilot app migration (need working Lambda deployment)

### Related Stories
- AG-TBD-016: Security headers (implemented as middleware)
- AG-TBD-018: Build manifest (used for asset references)

## Story Points Justification

**Complexity Factors**:
- **Frontend Complexity**: N/A

- **Backend Complexity**: High
  - Lambda event handling and transformation
  - Express server setup with React Router
  - Streaming response implementation
  - Multi-tenant routing logic
  - Cold start optimization
  - Error handling and logging

- **Testing Effort**: High
  - Unit tests for all middleware
  - Integration tests with mock Lambda events
  - Performance testing (cold starts, warm requests)
  - Load testing
  - Error scenario testing

- **Integration Points**: 5
  - React Router 7 build output
  - AWS Lambda (API Gateway v2, ALB)
  - CloudWatch Logs
  - CloudFront (optional)
  - Environment variable system

- **Unknown Factors**:
  - Lambda Web Adapter performance characteristics
  - React Router 7 streaming SSR behavior
  - Optimal bundle size for cold starts
  - Multi-tenant routing complexity

**Total Points**: 13

## Notes & Decisions

### Technical Decisions
- **Use serverless-http**: Battle-tested library for wrapping Express in Lambda
- **Express over Fastify**: Better React Router integration, team familiarity
- **CloudFront for static assets**: Reduce Lambda payload size, faster delivery
- **Structured logging**: JSON format for CloudWatch Insights queries
- **Health check endpoint**: Essential for monitoring and ALB health checks

### Open Questions
- [ ] Should we use Lambda@Edge for even lower latency?
- [ ] Do we need Lambda Provisioned Concurrency for production?
- [ ] How do we handle Lambda layers for shared dependencies?
- [ ] Should we implement Lambda warmers for critical apps?
- [ ] Do we need custom error pages for Lambda errors?

### Assumptions
- API Gateway v2 (HTTP API) is used (not v1/REST API)
- CloudFront is configured for static assets
- Lambda has at least 512MB memory
- Lambda timeout is at least 30 seconds
- CloudWatch Logs are enabled

### Performance Optimization Strategies

#### Cold Start Reduction
1. **Bundle size**: Keep under 10MB (faster download from S3)
2. **Tree shaking**: Remove unused code
3. **Module pre-warming**: Load critical modules during initialization
4. **Lambda layers**: Share dependencies across functions
5. **Arm64 architecture**: ~20% better price-performance

#### Warm Request Optimization
1. **Connection pooling**: Reuse database connections
2. **Caching**: Cache frequently accessed data
3. **Streaming**: Stream responses for large payloads
4. **Compression**: Enable gzip/brotli

### Files to Create

```
packages/gdu/config/react-router/lambda/
├── handler.ts                           # Main Lambda handler
├── server.ts                            # Express server
├── adapter.ts                           # Lambda adapter utilities
├── middleware/
│   ├── logging.ts                       # Request logging
│   ├── error-handler.ts                 # Error handling
│   ├── health-check.ts                  # Health check
│   ├── static-assets.ts                 # Static asset handling
│   └── index.ts                         # Middleware exports
├── utils/
│   ├── cold-start.ts                    # Cold start optimization
│   ├── streaming.ts                     # Streaming helpers
│   ├── multi-tenant.ts                  # Multi-tenant routing
│   └── index.ts                         # Utility exports
├── types.ts                             # TypeScript types
├── package.config.ts                    # Lambda package config
├── README.md                            # Documentation
└── __tests__/
    ├── handler.test.ts                  # Handler tests
    ├── server.test.ts                   # Server tests
    ├── middleware.test.ts               # Middleware tests
    └── integration.test.ts              # Integration tests
```

### Files to Modify

```
packages/gdu/package.json                # Add Lambda dependencies
```

### New Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "serverless-http": "^3.2.0",
    "compression": "^1.7.4",
    "@types/express": "^4.17.0",
    "@types/aws-lambda": "^8.10.0",
    "@types/compression": "^1.7.0"
  }
}
```
