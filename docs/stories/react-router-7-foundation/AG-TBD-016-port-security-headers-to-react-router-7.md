# Story: GDU. Build Tooling. As a Security Engineer, I want security headers in React Router 7, so that SSR applications are protected against common web vulnerabilities

## Story Details

**Story ID**: AG-TBD-016
**Epic**: AG-TBD-001 - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Must Have
**Story Points**: 5
**Sprint**: 7

## Description

### Summary
We need to port all security headers from our Next.js configuration to React Router 7. These headers protect against common web vulnerabilities like XSS, clickjacking, MIME-sniffing, and more. The headers need to be applied consistently across all routes and work with both Lambda and local development environments.

In Next.js, we configure security headers in `next.config.ts`. In React Router 7, we'll implement them as Express middleware that runs before the React Router handler.

### Background
Our current Next.js configuration includes comprehensive security headers defined in `packages/gdu/config/next.config.ts`:
- **HSTS** (Strict-Transport-Security): Forces HTTPS for 2 years
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME-sniffing
- **Content-Security-Policy**: Restricts resource loading to trusted sources
- **X-XSS-Protection**: Enables browser XSS filtering
- **Referrer-Policy**: Controls referrer information
- **X-DNS-Prefetch-Control**: Controls DNS prefetching

These headers are critical for our security posture and compliance. They must be maintained when migrating to React Router 7.

### User Value
Security engineers and compliance teams can trust that React Router 7 SSR applications maintain the same security posture as our Next.js applications, protecting users from common web vulnerabilities.

## User Persona

**Role**: Security Engineer / Compliance Officer
**Name**: "Secure Sam the Security Engineer"
**Context**: Ensuring all web applications meet security standards
**Goals**:
- Enforce consistent security headers across all applications
- Pass security audits and penetration tests
- Prevent XSS, clickjacking, and other common attacks
- Maintain compliance with security standards (OWASP, PCI-DSS)
**Pain Points**:
- Different frameworks have different security configurations
- Security headers can be forgotten during migrations
- Need to audit headers across many applications
- CSP violations are hard to debug

## Acceptance Criteria

### Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Security headers middleware created at `packages/gdu/config/react-router/lambda/middleware/security-headers.ts` | ☐ | ☐ | ☐ |
| 2 | All headers from Next.js config are ported (HSTS, CSP, X-Frame-Options, etc.) | ☐ | ☐ | ☐ |
| 3 | Content-Security-Policy includes all required directives and trusted sources | ☐ | ☐ | ☐ |
| 4 | Headers apply to all routes (HTML pages, API endpoints, static files) | ☐ | ☐ | ☐ |
| 5 | Headers work in both Lambda and local development environments | ☐ | ☐ | ☐ |
| 6 | CSP nonce generation for inline scripts (if needed) | ☐ | ☐ | ☐ |
| 7 | Environment-specific CSP (stricter in production) | ☐ | ☐ | ☐ |
| 8 | Headers are configurable via `guru.config.js` (optional overrides) | ☐ | ☐ | ☐ |

### Non-Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Middleware adds negligible latency (< 1ms) | ☐ | ☐ | ☐ |
| 2 | Headers are sent before any response body | ☐ | ☐ | ☐ |
| 3 | No memory leaks from header generation | ☐ | ☐ | ☐ |
| 4 | CSP violations are logged (in development) | ☐ | ☐ | ☐ |

### Edge Cases

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Handle conflicting headers from React Router | ☐ | ☐ | ☐ |
| 2 | Support custom CSP directives per application | ☐ | ☐ | ☐ |
| 3 | Gracefully handle CSP header length limits (4096 bytes) | ☐ | ☐ | ☐ |

## Technical Implementation

### Backend (Security Headers Middleware)

#### Component Structure
```
packages/gdu/config/react-router/lambda/middleware/
├── security-headers.ts              # Main security headers middleware
├── csp.ts                           # CSP generation utilities
└── __tests__/
    ├── security-headers.test.ts     # Tests
    └── csp.test.ts                  # CSP tests
```

#### Security Headers Middleware
```typescript
// packages/gdu/config/react-router/lambda/middleware/security-headers.ts
import type { NextFunction, Request, Response } from 'express';
import { generateCSP, CSPDefaultsList } from './csp';
import type { GuruConfig } from '../../../lib/config';

export interface SecurityHeadersOptions {
  cspOverrides?: CSPItem[];
  enableHSTS?: boolean;
  hstsMaxAge?: number;
  enableCSPReporting?: boolean;
  cspReportUri?: string;
}

/**
 * Default security headers matching Next.js configuration
 */
export const defaultSecurityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
];

/**
 * Create security headers middleware
 */
export const createSecurityHeadersMiddleware = (
  options: SecurityHeadersOptions = {}
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Apply default security headers
    defaultSecurityHeaders.forEach(({ key, value }) => {
      // Don't override if header already set
      if (!res.getHeader(key)) {
        res.setHeader(key, value);
      }
    });

    // Generate and apply CSP
    const cspList = options.cspOverrides || CSPDefaultsList;
    const csp = generateCSP(cspList);

    // Add CSP reporting if enabled
    let cspHeader = csp;
    if (options.enableCSPReporting && options.cspReportUri) {
      cspHeader += `; report-uri ${options.cspReportUri}`;
    }

    res.setHeader('Content-Security-Policy', cspHeader);

    // Apply custom HSTS if specified
    if (options.enableHSTS !== false && options.hstsMaxAge) {
      res.setHeader(
        'Strict-Transport-Security',
        `max-age=${options.hstsMaxAge}; includeSubDomains; preload`
      );
    }

    next();
  };
};

/**
 * Convenience export for standard middleware
 */
export const securityHeaders = createSecurityHeadersMiddleware();
```

#### CSP Generation Utilities
```typescript
// packages/gdu/config/react-router/lambda/middleware/csp.ts

export type CSPKey =
  | 'frame-ancestors'
  | 'frame-src'
  | 'style-src'
  | 'img-src'
  | 'font-src'
  | 'worker-src'
  | 'child-src'
  | 'object-src'
  | 'connect-src'
  | 'script-src-elem'
  | 'script-src';

export interface CSPItem {
  key: CSPKey;
  values: string[];
}

/**
 * Default CSP directives (ported from Next.js config)
 */
export const CSPDefaultsList: CSPItem[] = [
  {
    key: 'frame-ancestors',
    values: ['https://*.autoguru.com.au', 'https://*.autoguru.com'],
  },
  {
    key: 'frame-src',
    values: [
      "'self'",
      'https://*.autoguru.com.au',
      'https://*.autoguru.com',
      'https://www.youtube.com',
      'https://www.google.com',
      'https://*.doubleclick.net',
      'https://*.googleadservices.com',
    ],
  },
  {
    key: 'style-src',
    values: [
      "'self'",
      "'unsafe-inline'", // Required for Vanilla Extract
      'https://*.autoguru.com.au',
      'https://*.autoguru.com',
      'https://*.googleapis.com',
      'https://*.googleadservices.com',
    ],
  },
  {
    key: 'img-src',
    values: [
      "'self'",
      'data:',
      'https://*.autoguru.com.au',
      'https://*.autoguru.com',
      'https://*.autoguru.au',
      'https://*.googletagmanager.com',
      'https://*.googleapis.com',
      'https://*.google-analytics.com',
      'https://*.heapanalytics.com/',
      'https://heapanalytics.com/',
      'https://*.tvsquared.com',
      'https://*.google.com',
      'https://*.google.com.au',
      'https://*.googleadservices.com',
      'https://*.gstatic.com',
      'https://*.quantserve.com',
    ],
  },
  {
    key: 'font-src',
    values: [
      'https://*.autoguru.com.au',
      'https://*.autoguru.com',
      'https://*.googleapis.com',
      'https://*.gstatic.com',
    ],
  },
  {
    key: 'worker-src',
    values: ["'self'", 'blob:'],
  },
  {
    key: 'child-src',
    values: ["'self'", 'blob:'],
  },
  {
    key: 'object-src',
    values: ["'none'"],
  },
  {
    key: 'connect-src',
    values: [
      "'self'",
      '*.autoguru.com.au',
      '*.autoguru.com',
      'https://*.googletagmanager.com',
      'https://*.google-analytics.com',
      'https://*.google.com',
      'https://*.google.com.au',
      'https://*.googleapis.com',
      'https://*.gstatic.com',
      'https://*.googleadservices.com',
      'https://*.heapanalytics.com',
      'https://*.doubleclick.net',
      'https://*.mapbox.com',
      'https://*.quantserve.com',
      'https://*.wisepops.com',
      'https://*.tvsquared.com',
      'https://*.quantcount.com',
      'https://*.nr-data.net',
    ],
  },
  {
    key: 'script-src-elem',
    values: [
      "'self'",
      "'unsafe-inline'", // May need for inline scripts
      'https://*.autoguru.com.au',
      'https://*.autoguru.com',
      'https://*.google-analytics.com',
      'https://*.googletagmanager.com',
      'https://*.googleapis.com',
      'https://*.gstatic.com',
      'https://*.google.com',
      'https://*.google.com.au',
      'https://*.googleadservices.com',
      'https://*.heapanalytics.com',
      'https://*.doubleclick.net',
      'https://*.mapbox.com',
      'https://*.quantserve.com',
      'https://*.wisepops.com',
      'https://*.tvsquared.com',
      'https://*.quantcount.com',
    ],
  },
  {
    key: 'script-src',
    values: [
      "'self'",
      "'unsafe-eval'", // Required for some libraries
      'https://*.autoguru.com.au',
      'https://*.autoguru.com',
      'https://*.googleadservices.com',
      'https://*.googleapis.com',
      'https://*.googletagmanager.com',
      'https://*.google.com.au',
      'https://*.gstatic.com',
      'https://*.heapanalytics.com',
      'https://*.quantserve.com',
      'https://*.wisepops.com',
      'https://*.tvsquared.com',
      'https://*.quantcount.com',
    ],
  },
];

/**
 * Generate CSP header value from CSP items
 */
export const generateCSP = (cspList: CSPItem[]): string => {
  return cspList.reduce(
    (policies, csp, currentIndex) =>
      `${policies}${currentIndex !== 0 ? '; ' : ''}${csp.key} ${csp.values.join(' ')}`,
    ''
  );
};

/**
 * Merge custom CSP directives with defaults
 */
export const mergeCSP = (
  defaults: CSPItem[],
  overrides: Partial<CSPItem>[]
): CSPItem[] => {
  const merged = new Map<CSPKey, string[]>();

  // Add defaults
  defaults.forEach(({ key, values }) => {
    merged.set(key, [...values]);
  });

  // Apply overrides
  overrides.forEach(({ key, values }) => {
    if (key && values) {
      const existing = merged.get(key) || [];
      merged.set(key, [...new Set([...existing, ...values])]);
    }
  });

  // Convert back to array
  return Array.from(merged.entries()).map(([key, values]) => ({
    key,
    values,
  }));
};

/**
 * Generate CSP nonce for inline scripts
 * Use this to allow specific inline scripts while blocking others
 */
export const generateCSPNonce = (): string => {
  return Buffer.from(Math.random().toString()).toString('base64');
};
```

#### Integration with Express Server
```typescript
// packages/gdu/config/react-router/lambda/server.ts (modified)
import { createSecurityHeadersMiddleware } from './middleware/security-headers';

export const createServer = (options?: ServerOptions): Express => {
  const app = express();

  // ... other middleware ...

  // Security headers (MUST be early in middleware chain)
  app.use(createSecurityHeadersMiddleware({
    cspOverrides: options?.cspOverrides,
    enableCSPReporting: process.env.CSP_REPORT_URI ? true : false,
    cspReportUri: process.env.CSP_REPORT_URI,
  }));

  // ... rest of middleware ...

  return app;
};
```

#### Guru Config Integration
```typescript
// Allow apps to customize CSP via guru.config.js
interface GuruConfig {
  // ... existing fields ...
  security?: {
    cspOverrides?: CSPItem[];
    hstsMaxAge?: number;
    enableCSPReporting?: boolean;
  };
}

// In server.ts
const guruConfig = getGuruConfig();
app.use(createSecurityHeadersMiddleware({
  cspOverrides: guruConfig?.security?.cspOverrides,
  hstsMaxAge: guruConfig?.security?.hstsMaxAge,
  enableCSPReporting: guruConfig?.security?.enableCSPReporting,
}));
```

### Testing Strategy

#### Unit Tests
```typescript
// packages/gdu/config/react-router/lambda/middleware/__tests__/security-headers.test.ts
import { createSecurityHeadersMiddleware } from '../security-headers';
import { generateCSP, CSPDefaultsList } from '../csp';

describe('Security Headers Middleware', () => {
  it('sets all default security headers', () => {
    const middleware = createSecurityHeadersMiddleware();
    const req = {} as Request;
    const res = {
      setHeader: jest.fn(),
      getHeader: jest.fn(() => null),
    } as unknown as Response;
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith('X-DNS-Prefetch-Control', 'on');
    expect(res.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
    expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'SAMEORIGIN');
    expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    expect(res.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
    expect(next).toHaveBeenCalled();
  });

  it('sets HSTS header', () => {
    const middleware = createSecurityHeadersMiddleware();
    const res = {
      setHeader: jest.fn(),
      getHeader: jest.fn(() => null),
    } as unknown as Response;

    middleware({} as Request, res, jest.fn());

    expect(res.setHeader).toHaveBeenCalledWith(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  });

  it('generates CSP header', () => {
    const middleware = createSecurityHeadersMiddleware();
    const res = {
      setHeader: jest.fn(),
      getHeader: jest.fn(() => null),
    } as unknown as Response;

    middleware({} as Request, res, jest.fn());

    const cspCall = (res.setHeader as jest.Mock).mock.calls.find(
      call => call[0] === 'Content-Security-Policy'
    );

    expect(cspCall).toBeDefined();
    expect(cspCall[1]).toContain("frame-ancestors");
    expect(cspCall[1]).toContain("'self'");
  });

  it('does not override existing headers', () => {
    const middleware = createSecurityHeadersMiddleware();
    const res = {
      setHeader: jest.fn(),
      getHeader: jest.fn((key) => key === 'X-Frame-Options' ? 'DENY' : null),
    } as unknown as Response;

    middleware({} as Request, res, jest.fn());

    const frameOptionsCall = (res.setHeader as jest.Mock).mock.calls.find(
      call => call[0] === 'X-Frame-Options'
    );

    expect(frameOptionsCall).toBeUndefined();
  });
});

describe('CSP Generation', () => {
  it('generates valid CSP string', () => {
    const csp = generateCSP(CSPDefaultsList);

    expect(csp).toContain("frame-ancestors https://*.autoguru.com.au");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain('; '); // Directives separated by semicolons
  });

  it('merges custom CSP directives', () => {
    const custom: Partial<CSPItem>[] = [
      { key: 'img-src', values: ['https://example.com'] },
    ];

    const merged = mergeCSP(CSPDefaultsList, custom);
    const imgSrc = merged.find(item => item.key === 'img-src');

    expect(imgSrc.values).toContain('https://example.com');
    expect(imgSrc.values).toContain("'self'"); // Still has defaults
  });
});
```

#### Integration Tests
```typescript
// Test with actual Express server
import request from 'supertest';
import { createServer } from '../server';

describe('Security Headers Integration', () => {
  it('applies security headers to all responses', async () => {
    const app = createServer();

    const response = await request(app).get('/');

    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['content-security-policy']).toBeDefined();
    expect(response.headers['strict-transport-security']).toContain('max-age=63072000');
  });
});
```

### Integration Points

#### Express Middleware Chain
- Runs early in middleware chain (before React Router)
- Sets headers before any response is sent
- Integrates with existing middleware (logging, errors)

#### Guru Config System
- Optional CSP overrides via `guru.config.js`
- Custom HSTS max-age
- CSP reporting configuration

#### Environment Variables
- `CSP_REPORT_URI`: URI for CSP violation reports
- `NODE_ENV`: Stricter CSP in production

## UI/UX Specifications

N/A - This is a backend security story

## Test Scenarios

### Happy Path
1. Request comes to Express server
2. Security headers middleware runs
3. All headers are set on response
4. React Router renders page
5. Response sent with headers
6. Browser enforces security policies

### Validation Tests
1. **CSP Validation**: Use CSP Evaluator to validate policy
2. **HSTS Preload**: Verify HSTS meets preload requirements
3. **Security Scan**: Run with security scanner (OWASP ZAP)
4. **Browser Testing**: Test in Chrome, Firefox, Safari

### CSP Violation Testing
1. Attempt to load resource from untrusted domain
2. Browser blocks and reports CSP violation
3. Violation logged (if reporting enabled)

## Definition of Done

### Development Complete
- [ ] Security headers middleware created
- [ ] All Next.js headers ported
- [ ] CSP generation utilities implemented
- [ ] Integration with Express server
- [ ] Guru config integration for overrides
- [ ] Unit tests written (>90% coverage)
- [ ] Code reviewed and approved

### Testing Complete
- [ ] All headers present in responses
- [ ] CSP validated with CSP Evaluator
- [ ] Security scan passed (OWASP ZAP)
- [ ] Tested in Chrome, Firefox, Safari
- [ ] CSP violations logged correctly
- [ ] No performance impact measured

### Documentation Complete
- [ ] Security headers documented
- [ ] CSP customization guide written
- [ ] Migration notes from Next.js
- [ ] Troubleshooting guide (CSP violations)

### Deployment Ready
- [ ] Headers tested in dev environment
- [ ] Security team sign-off
- [ ] Compliance verification
- [ ] Monitoring configured for CSP violations

## Dependencies

### Blocked By
- AG-TBD-015: Lambda Web Adapter (needs Express server)

### Blocks
- AG-TBD-020: Pilot app migration (needs security headers)

### Related Stories
- AG-TBD-014: React Router config
- AG-TBD-017: CDK infrastructure (may need CSP report endpoint)

## Story Points Justification

**Complexity Factors**:
- **Frontend Complexity**: N/A

- **Backend Complexity**: Medium
  - Port existing CSP configuration
  - Create Express middleware
  - CSP generation logic
  - Guru config integration
  - Testing with various configurations

- **Testing Effort**: Medium
  - Unit tests for middleware and CSP generation
  - Integration tests with Express
  - Security scanning
  - Browser compatibility testing

- **Integration Points**: 2
  - Express middleware chain
  - Guru config system

- **Unknown Factors**: Low
  - Well-understood problem (porting existing config)
  - Clear requirements from security team

**Total Points**: 5

## Notes & Decisions

### Technical Decisions
- **Express middleware**: Standard pattern for headers
- **Early in chain**: Headers set before any response
- **Preserve Next.js config**: Maintain existing CSP directives
- **Allow overrides**: Apps can customize via guru.config.js
- **CSP reporting**: Optional, configured via env var

### Open Questions
- [ ] Do we need CSP nonces for inline scripts?
- [ ] Should we use CSP report-only mode during migration?
- [ ] Do we need per-environment CSP (stricter in prod)?
- [ ] Should we create a CSP violation dashboard?

### Assumptions
- All existing CSP directives are still valid
- Vanilla Extract requires `'unsafe-inline'` for styles
- Some libraries require `'unsafe-eval'` for scripts
- Apps may need to customize CSP for third-party integrations

### Security Considerations
- **HSTS Preload**: Current config meets preload requirements
- **CSP Strictness**: Balance security with functionality
- **unsafe-inline/unsafe-eval**: Only where necessary
- **Regular Audits**: CSP should be reviewed quarterly
- **Violation Monitoring**: Track CSP violations in production

### Files to Create

```
packages/gdu/config/react-router/lambda/middleware/
├── security-headers.ts              # Main middleware
├── csp.ts                           # CSP utilities
└── __tests__/
    ├── security-headers.test.ts     # Middleware tests
    └── csp.test.ts                  # CSP tests
```

### Files to Modify

```
packages/gdu/config/react-router/lambda/server.ts    # Add middleware
packages/gdu/lib/config.ts                           # Add security options to GuruConfig
```

### Reference Documentation
- OWASP CSP Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html
- CSP Evaluator: https://csp-evaluator.withgoogle.com/
- HSTS Preload: https://hstspreload.org/
