# Story: GDU. Documentation. As a Developer, I want a React Router 7 migration guide, so that I can migrate Next.js SSR apps to React Router 7

## Story Details

**Story ID**: AG-TBD-019
**Epic**: AG-TBD-001 - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Must Have
**Story Points**: 5
**Sprint**: 8

## Description

### Summary
We need comprehensive documentation to guide developers through migrating existing Next.js SSR applications to React Router 7. This guide should cover architectural differences, step-by-step migration process, code transformation patterns, common pitfalls, testing strategies, and troubleshooting tips. The goal is to make migration straightforward and minimize the learning curve for developers.

### Background
We have approximately 5 SSR applications built with Next.js 14 in the Octane monorepo. These applications use Next.js-specific patterns for:
- File-based routing (pages directory)
- Data fetching (getServerSideProps, getStaticProps)
- API routes
- Image optimization (next/image)
- Link component (next/link)
- Configuration (next.config.ts)

React Router 7 has different paradigms:
- Route-based architecture (not file-based)
- Loader/action pattern for data fetching
- Different API route handling
- No built-in image optimization
- Standard Link component
- Vite configuration

We need clear migration instructions to help developers navigate these differences efficiently.

### User Value
Developers can confidently migrate SSR applications from Next.js to React Router 7 with clear step-by-step guidance, reducing migration time and avoiding common mistakes.

## User Persona

**Role**: Full-Stack Developer
**Name**: "Migrate Mike the Migration Developer"
**Context**: Migrating an existing Next.js SSR app to React Router 7
**Goals**:
- Understand architectural differences
- Follow a clear migration path
- Preserve existing functionality
- Avoid breaking changes
- Learn React Router 7 patterns
**Pain Points**:
- Different mental models between frameworks
- Lots of code to transform
- Unclear migration steps
- Fear of breaking production
- Limited React Router 7 resources

## Acceptance Criteria

### Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Migration guide document created at `packages/gdu/docs/react-router-7-migration.md` | ☐ | ☐ | ☐ |
| 2 | Guide includes architecture comparison (Next.js vs RR7) | ☐ | ☐ | ☐ |
| 3 | Guide includes step-by-step migration process | ☐ | ☐ | ☐ |
| 4 | Guide includes code transformation patterns with examples | ☐ | ☐ | ☐ |
| 5 | Guide covers data fetching migration (getServerSideProps -> loaders) | ☐ | ☐ | ☐ |
| 6 | Guide covers routing migration (pages/* -> routes) | ☐ | ☐ | ☐ |
| 7 | Guide covers API routes alternatives | ☐ | ☐ | ☐ |
| 8 | Guide includes troubleshooting section with common issues | ☐ | ☐ | ☐ |
| 9 | Guide includes testing checklist | ☐ | ☐ | ☐ |
| 10 | Guide includes performance comparison and optimization tips | ☐ | ☐ | ☐ |

### Non-Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Guide is clear and easy to follow for all skill levels | ☐ | ☐ | ☐ |
| 2 | Code examples are complete and runnable | ☐ | ☐ | ☐ |
| 3 | Guide includes visual diagrams for architecture comparison | ☐ | ☐ | ☐ |
| 4 | Guide is under 10,000 words (readable in 30-40 minutes) | ☐ | ☐ | ☐ |

### Edge Cases

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Document migration of complex nested routes | ☐ | ☐ | ☐ |
| 2 | Document migration of apps with custom server | ☐ | ☐ | ☐ |
| 3 | Document migration of apps with middleware | ☐ | ☐ | ☐ |

## Technical Implementation

### Documentation Structure

```markdown
# React Router 7 Migration Guide

## Table of Contents
1. Overview
2. Architecture Comparison
3. Prerequisites
4. Migration Strategy
5. Step-by-Step Migration
6. Code Transformation Patterns
7. Data Fetching Migration
8. Routing Migration
9. API Routes Alternatives
10. Image Optimization
11. Environment Variables
12. Testing Your Migration
13. Performance Optimization
14. Troubleshooting
15. Deployment
16. Rollback Plan

## 1. Overview

### Why Migrate to React Router 7?
- **Faster builds**: Vite is significantly faster than webpack
- **Better DX**: Hot module replacement is instant
- **Modern architecture**: Built for the modern web
- **Simplified deployment**: Standard Node.js app, not Next.js-specific
- **Future-proof**: React Router is maintained by Remix team

### What Changes?
- Build system: webpack → Vite
- Routing: File-based → Route configuration
- Data fetching: getServerSideProps → loaders
- Config: next.config.ts → react-router.config.ts + vite.config.ts

### Timeline Estimate
- Small app (5-10 pages): 1-2 days
- Medium app (10-30 pages): 3-5 days
- Large app (30+ pages): 1-2 weeks

## 2. Architecture Comparison

### Next.js Architecture
```
pages/
├── index.tsx                 # / route
├── about.tsx                 # /about route
├── blog/
│   ├── index.tsx            # /blog route
│   └── [slug].tsx           # /blog/:slug route
└── api/
    └── users.ts             # /api/users endpoint

next.config.ts               # Configuration
```

### React Router 7 Architecture
```
app/
├── root.tsx                 # Root layout
├── routes/
│   ├── _index.tsx          # / route
│   ├── about.tsx           # /about route
│   ├── blog._index.tsx     # /blog route
│   └── blog.$slug.tsx      # /blog/:slug route
└── services/
    └── api.ts              # API logic (not routes)

react-router.config.ts       # RR7 configuration
vite.config.ts              # Vite configuration
```

### Key Differences

| Aspect | Next.js | React Router 7 |
|--------|---------|----------------|
| Routing | File-based in pages/ | File-based in app/routes/ |
| Data Fetching | getServerSideProps | loader function |
| Mutations | API routes | action function |
| Layouts | _app.tsx | root.tsx + nested layouts |
| Config | next.config.ts | react-router.config.ts + vite |
| Bundler | webpack | Vite |
| Dev Server | next dev | vite dev |
| Deployment | Lambda (Next.js) | Lambda (Express + Web Adapter) |

## 3. Prerequisites

Before starting migration:

- [ ] Read React Router 7 documentation
- [ ] Review existing app architecture
- [ ] Create feature branch
- [ ] Set up local development environment
- [ ] Review guru.config.js configuration
- [ ] Understand current deployment pipeline

## 4. Migration Strategy

### Recommended Approach: Progressive Migration

1. **Prepare** (Day 1)
   - Create new RR7 structure alongside Next.js
   - Set up configuration
   - Create root layout

2. **Migrate Routes** (Day 2-3)
   - Start with simple pages
   - Migrate complex pages
   - Test each route

3. **Migrate Data Fetching** (Day 3-4)
   - Convert getServerSideProps to loaders
   - Convert API routes to actions or external API
   - Test data flows

4. **Migrate Assets & Styling** (Day 4)
   - Move static assets
   - Verify CSS/Vanilla Extract works
   - Test images

5. **Testing** (Day 5)
   - Manual testing all routes
   - Automated testing
   - Performance testing

6. **Deploy** (Day 6)
   - Deploy to dev
   - Deploy to UAT
   - Deploy to prod

### Alternative: Big Bang Migration
- Migrate everything at once
- Higher risk, faster completion
- Only for small apps

## 5. Step-by-Step Migration

### Step 1: Install Dependencies

```bash
cd packages/my-ssr-app

# Install React Router 7
yarn add react-router@7 @react-router/node @react-router/serve

# Remove Next.js (after migration complete)
# yarn remove next
```

### Step 2: Create App Structure

```bash
mkdir -p app/routes
touch app/root.tsx
touch app/routes/_index.tsx
touch react-router.config.ts
```

### Step 3: Create Root Layout

```typescript
// app/root.tsx
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

export default function Root() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  return (
    <html>
      <head>
        <title>Error</title>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>Something went wrong</h1>
        <Scripts />
      </body>
    </html>
  );
}
```

### Step 4: Configure React Router

```typescript
// react-router.config.ts
import { createReactRouterConfig } from '@autoguru/gdu/config/react-router';

export default createReactRouterConfig('prod', {
  isDebug: false,
});
```

### Step 5: Configure GDU Build

```javascript
// guru.config.js - Update type
module.exports = {
  type: 'ssr', // Keep as 'ssr'
  // ... other config
};
```

## 6. Code Transformation Patterns

### Pattern 1: Simple Page Migration

**Before (Next.js):**
```typescript
// pages/about.tsx
import { NextPage } from 'next';

const AboutPage: NextPage = () => {
  return (
    <div>
      <h1>About Us</h1>
      <p>Welcome to our about page</p>
    </div>
  );
};

export default AboutPage;
```

**After (React Router 7):**
```typescript
// app/routes/about.tsx
export default function About() {
  return (
    <div>
      <h1>About Us</h1>
      <p>Welcome to our about page</p>
    </div>
  );
}
```

### Pattern 2: Page with Data Fetching

**Before (Next.js):**
```typescript
// pages/users/[id].tsx
import { GetServerSideProps, NextPage } from 'next';

interface Props {
  user: User;
}

const UserPage: NextPage<Props> = ({ user }) => {
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const user = await fetchUser(params.id);

  return {
    props: { user },
  };
};

export default UserPage;
```

**After (React Router 7):**
```typescript
// app/routes/users.$id.tsx
import { useLoaderData } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';

export async function loader({ params }: LoaderFunctionArgs) {
  const user = await fetchUser(params.id);
  return { user };
}

export default function User() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### Pattern 3: Form with Mutations

**Before (Next.js):**
```typescript
// pages/contact.tsx
import { useState } from 'react';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
};

export default ContactPage;
```

**After (React Router 7):**
```typescript
// app/routes/contact.tsx
import { Form, redirect } from 'react-router';
import type { ActionFunctionArgs } from 'react-router';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  // Process form data
  await submitContactForm(data);

  return redirect('/thank-you');
}

export default function Contact() {
  return (
    <Form method="post">
      <input type="text" name="name" />
      <input type="email" name="email" />
      <button type="submit">Submit</button>
    </Form>
  );
}
```

### Pattern 4: Navigation Links

**Before (Next.js):**
```typescript
import Link from 'next/link';

<Link href="/about">
  <a>About Us</a>
</Link>
```

**After (React Router 7):**
```typescript
import { Link } from 'react-router';

<Link to="/about">About Us</Link>
```

### Pattern 5: Programmatic Navigation

**Before (Next.js):**
```typescript
import { useRouter } from 'next/router';

const router = useRouter();
router.push('/dashboard');
```

**After (React Router 7):**
```typescript
import { useNavigate } from 'react-router';

const navigate = useNavigate();
navigate('/dashboard');
```

## 7. Data Fetching Migration

### Server-Side Data Fetching

| Next.js | React Router 7 | Notes |
|---------|----------------|-------|
| getServerSideProps | loader | Runs on server for initial load and client navigations |
| getStaticProps | loader + headers | Use loader with long cache headers |
| getInitialProps | loader | Deprecated in Next.js anyway |

### Example Migration

```typescript
// Before: Next.js getServerSideProps
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { params, req, res } = context;

  // Access cookies
  const token = req.cookies.token;

  // Fetch data
  const data = await fetchData(params.id, token);

  // Set headers
  res.setHeader('Cache-Control', 'public, max-age=3600');

  // Redirect
  if (!data) {
    return {
      redirect: {
        destination: '/404',
        permanent: false,
      },
    };
  }

  // Return props
  return {
    props: { data },
  };
};

// After: React Router 7 loader
export async function loader({ params, request }: LoaderFunctionArgs) {
  // Access cookies
  const cookieHeader = request.headers.get('Cookie');
  const token = parseCookie(cookieHeader, 'token');

  // Fetch data
  const data = await fetchData(params.id, token);

  // Redirect
  if (!data) {
    throw redirect('/404');
  }

  // Return data with headers
  return json(
    { data },
    {
      headers: {
        'Cache-Control': 'public, max-age=3600',
      },
    }
  );
}
```

## 8. Routing Migration

### Route File Naming

| Next.js | React Router 7 | Route |
|---------|----------------|-------|
| pages/index.tsx | routes/_index.tsx | / |
| pages/about.tsx | routes/about.tsx | /about |
| pages/blog/index.tsx | routes/blog._index.tsx | /blog |
| pages/blog/[slug].tsx | routes/blog.$slug.tsx | /blog/:slug |
| pages/blog/[...slug].tsx | routes/blog.$.tsx | /blog/* |
| pages/[org]/[repo].tsx | routes/$org.$repo.tsx | /:org/:repo |

### Nested Layouts

**Before (Next.js):**
```typescript
// pages/_app.tsx
function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
```

**After (React Router 7):**
```typescript
// app/root.tsx
import { Outlet } from 'react-router';

export default function Root() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
```

## 9. API Routes Alternatives

Next.js API routes should be migrated to one of:

1. **React Router Actions** (for form submissions)
2. **External API** (separate service)
3. **Server Utilities** (for internal use)

### Migration Example

**Before (Next.js API Route):**
```typescript
// pages/api/users.ts
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const user = await createUser(req.body);
    res.json({ user });
  }
}
```

**After (React Router Action):**
```typescript
// app/routes/users.new.tsx
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const user = await createUser(Object.fromEntries(formData));
  return redirect(`/users/${user.id}`);
}
```

## 10. Image Optimization

Next.js `next/image` is not available in React Router 7.

**Options:**
1. Use standard `<img>` tag
2. Use a CDN with image optimization (Cloudinary, Imgix)
3. Use `@unpic/react` for multi-CDN support

**Before:**
```typescript
import Image from 'next/image';

<Image src="/logo.png" width={200} height={100} alt="Logo" />
```

**After:**
```typescript
<img src="/logo.png" width={200} height={100} alt="Logo" />

// Or with CDN
<img
  src="https://res.cloudinary.com/autoguru/image/upload/w_200,h_100/logo.png"
  width={200}
  height={100}
  alt="Logo"
/>
```

## 11. Environment Variables

**Before (Next.js):**
- Public vars: `NEXT_PUBLIC_*`
- Server vars: All others

**After (React Router 7 / Vite):**
- Public vars: `VITE_*` (build time)
- Server vars: All others (runtime)

**Migration:**
```bash
# Before
NEXT_PUBLIC_API_URL=https://api.autoguru.com.au

# After
VITE_API_URL=https://api.autoguru.com.au
```

**Usage:**
```typescript
// Before
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// After (client)
const apiUrl = import.meta.env.VITE_API_URL;

// After (server)
const apiUrl = process.env.API_URL;
```

## 12. Testing Your Migration

### Manual Testing Checklist

- [ ] All routes load correctly
- [ ] Navigation between routes works
- [ ] Forms submit successfully
- [ ] Data loads on server side
- [ ] Data loads on client side navigation
- [ ] Error boundaries catch errors
- [ ] Loading states display correctly
- [ ] CSS/styling appears correctly
- [ ] Images load
- [ ] Links work
- [ ] Browser back/forward works
- [ ] Deep linking works
- [ ] SEO metadata appears

### Automated Testing

```typescript
// Update imports
// Before
import { render } from '@testing-library/react';

// After
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';

// Create test router
const router = createMemoryRouter([
  {
    path: '/about',
    element: <About />,
  },
]);

render(<RouterProvider router={router} />);
```

## 13. Performance Optimization

### Build Performance

React Router 7 (Vite) is significantly faster than Next.js (webpack):
- Dev server: ~500ms vs ~5s
- HMR: ~50ms vs ~500ms
- Production build: ~30s vs ~2min

### Runtime Performance

Monitor:
- Lambda cold starts
- SSR render time
- Client hydration time
- Bundle sizes

### Optimization Tips

1. **Code Splitting**: Use dynamic imports
2. **Bundle Size**: Monitor with build manifest
3. **Caching**: Use HTTP cache headers in loaders
4. **Preloading**: Use `<Link prefetch>` for critical routes

## 14. Troubleshooting

### Common Issues

**Issue: "Module not found"**
- Check import paths
- Verify package installed
- Check tsconfig paths

**Issue: "Hydration mismatch"**
- Ensure server and client render same content
- Check for browser-only code in SSR
- Verify data is serializable

**Issue: "loader is not a function"**
- Ensure you exported loader as `export async function loader`
- Check route file naming
- Verify React Router config

**Issue: "Styles not loading"**
- Check Vanilla Extract setup
- Verify CSS imported in root
- Check build output for CSS files

**Issue: "Environment variables undefined"**
- Use `VITE_*` prefix for public vars
- Check .env file location
- Rebuild after changing env vars

## 15. Deployment

### Build Command

```bash
# Before
next build

# After
gdu build --env prod
```

### Deploy to AWS

```bash
cd mfe/infrastructure
cdk deploy \
  -c appName=my-ssr-app \
  -c environment=prod \
  -c buildPath=../../packages/my-ssr-app/dist/prod
```

### Deployment Checklist

- [ ] Build completes without errors
- [ ] Build manifest generated
- [ ] Lambda handler deployed
- [ ] Static assets uploaded to S3
- [ ] CloudFront distribution updated
- [ ] Environment variables set
- [ ] Health check passes
- [ ] Smoke tests pass

## 16. Rollback Plan

If issues occur:

1. **Immediate**: Revert CloudFront to previous origin
2. **Quick**: Redeploy previous Lambda version
3. **Safe**: Keep Next.js code in separate directory until migration proven

### Rollback Commands

```bash
# Revert Lambda alias
aws lambda update-alias \
  --function-name my-ssr-app \
  --name live \
  --function-version <previous-version>

# Redeploy previous stack
cdk deploy my-ssr-app-previous
```

## Appendix: Quick Reference

### Command Cheat Sheet

| Task | Next.js | React Router 7 |
|------|---------|----------------|
| Install | yarn add next | yarn add react-router@7 |
| Dev | next dev | gdu dev |
| Build | next build | gdu build |
| Start | next start | gdu serve |

### Import Cheat Sheet

| Feature | Next.js | React Router 7 |
|---------|---------|----------------|
| Link | import Link from 'next/link' | import { Link } from 'react-router' |
| Router | import { useRouter } from 'next/router' | import { useNavigate } from 'react-router' |
| Image | import Image from 'next/image' | Use <img> or CDN |
| Head | import Head from 'next/head' | import { Meta } from 'react-router' |
```

## UI/UX Specifications

N/A - Documentation story

## Test Scenarios

### Documentation Quality Tests
1. **Completeness**: All migration scenarios covered
2. **Accuracy**: Code examples are correct and runnable
3. **Clarity**: Instructions are clear and unambiguous
4. **Practicality**: Guide is usable for real migrations

### Validation Tests
1. Developer follows guide and successfully migrates test app
2. All code examples run without errors
3. Troubleshooting section addresses common issues
4. Migration timeline estimates are accurate

## Definition of Done

### Development Complete
- [ ] Migration guide document created
- [ ] All sections written and complete
- [ ] Code examples tested and working
- [ ] Diagrams created (if applicable)
- [ ] Review by senior developers
- [ ] Technical writing review

### Testing Complete
- [ ] Guide reviewed by 2+ developers
- [ ] Code examples verified
- [ ] Test migration performed using guide
- [ ] Feedback incorporated
- [ ] Grammar and spelling checked

### Documentation Complete
- [ ] Published to documentation site
- [ ] Linked from main docs
- [ ] Announced to team
- [ ] Added to onboarding materials

### Deployment Ready
- [ ] Guide is accessible to all developers
- [ ] Feedback mechanism in place
- [ ] Guide will be updated based on pilot migration learnings

## Dependencies

### Blocked By
- AG-TBD-014: React Router config (need to document config)
- AG-TBD-015: Lambda integration (need to document deployment)
- AG-TBD-016: Security headers (need to document differences)

### Blocks
- AG-TBD-020: Pilot migration (developers need guide)

### Related Stories
- All previous stories in epic (documents their work)

## Story Points Justification

**Complexity Factors**:
- **Documentation Complexity**: Medium
  - Comprehensive guide covering many topics
  - Code examples for each pattern
  - Architecture comparisons
  - Troubleshooting scenarios

- **Research Effort**: Medium
  - Review Next.js patterns in our apps
  - Research React Router 7 best practices
  - Identify all migration scenarios

- **Review Effort**: Medium
  - Technical review by senior developers
  - Test all code examples
  - Iterate based on feedback

- **Integration Points**: N/A

- **Unknown Factors**: Low
  - Documentation is well-understood deliverable

**Total Points**: 5

## Notes & Decisions

### Technical Decisions
- **Markdown format**: Easy to read, version control friendly
- **Code-heavy**: Show don't tell
- **Progressive migration**: Safest approach
- **Practical examples**: Real-world patterns from our apps

### Open Questions
- [ ] Should we create video tutorials?
- [ ] Should we create migration CLI tool?
- [ ] Should we include estimated costs comparison?

### Assumptions
- Developers familiar with Next.js
- Developers have basic React Router knowledge
- Guide will be updated after pilot migration

### Future Enhancements
- Video tutorial series
- Interactive examples
- Migration automation tool
- AI-assisted migration (codemod)

### Files to Create

```
packages/gdu/docs/
└── react-router-7-migration.md
```

### Also Consider
- Presentation deck for team
- FAQ document
- Common pitfalls one-pager
- Migration checklist (printable)
