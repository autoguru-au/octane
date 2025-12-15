# Story: GDU. Documentation. As a Developer, I want comprehensive documentation and training for React Router 7, so that I can effectively build and maintain SSR applications

## Story Details

**Story ID**: AG-TBD-027
**Epic**: AG-TBD-000 - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Must Have
**Story Points**: 8
**Sprint**: Sprint 13

## Description

### Summary
After successfully migrating all SSR applications to React Router 7 and optimizing the platform, we need to create comprehensive documentation and deliver training to ensure all developers can effectively work with the new build tooling. This includes migration guides, best practices, troubleshooting documentation, training sessions, and video tutorials that enable the entire engineering team to be productive with RR7.

Documentation is critical for:
- Onboarding new developers
- Supporting existing developers working on RR7 apps
- Sharing knowledge and best practices discovered during migrations
- Reducing support burden on platform team
- Ensuring consistent patterns across applications

### Background
Throughout the migration project (AG-TBD-001 through AG-TBD-026), we've accumulated valuable knowledge:
- Migration patterns and strategies
- Common pitfalls and solutions
- Performance optimization techniques
- Deployment procedures
- Troubleshooting workflows
- Best practices for SSR applications

This knowledge currently exists in:
- Pull request discussions
- Slack conversations
- Individual team members' heads
- Scattered notes and documents

We need to consolidate, organize, and formalize this knowledge into accessible documentation and training materials that serve as the single source of truth for React Router 7 development at AutoGuru.

### User Value
Developers benefit from clear, comprehensive documentation that reduces learning time, prevents common mistakes, and accelerates development. The business benefits from reduced onboarding time, fewer production issues, and more consistent code quality.

## User Persona

**Role**: Full-Stack Developer
**Name**: "Sarah the Full-Stack Dev"
**Context**: Joining AutoGuru or switching to work on RR7 application, needs to quickly understand new build tooling
**Goals**: Learn RR7 quickly, follow best practices, avoid common pitfalls, know where to find answers
**Pain Points**: Overwhelming when learning new framework, frustration when documentation is missing or outdated, time wasted debugging known issues

## Acceptance Criteria

### Documentation Created

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | GDU README updated with RR7 architecture overview | ☐ | ☐ | ☐ |
| 2 | React Router 7 getting started guide created | ☐ | ☐ | ☐ |
| 3 | Migration guide (Next.js to RR7) created | ☐ | ☐ | ☐ |
| 4 | SSR patterns and best practices documented | ☐ | ☐ | ☐ |
| 5 | Data fetching guide (loaders and actions) created | ☐ | ☐ | ☐ |
| 6 | Error handling and resilience guide created | ☐ | ☐ | ☐ |
| 7 | Performance optimization guide created | ☐ | ☐ | ☐ |
| 8 | Deployment guide (CDK, Lambda, CloudFront) created | ☐ | ☐ | ☐ |
| 9 | Troubleshooting guide created | ☐ | ☐ | ☐ |
| 10 | FAQ document created | ☐ | ☐ | ☐ |
| 11 | API reference for common utilities created | ☐ | ☐ | ☐ |
| 12 | Code examples repository created | ☐ | ☐ | ☐ |

### Training Delivered

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | RR7 overview training session delivered (1 hour) | ☐ | ☐ | ☐ |
| 2 | Deep dive: Data fetching with loaders (1 hour) | ☐ | ☐ | ☐ |
| 3 | Deep dive: Forms and mutations with actions (1 hour) | ☐ | ☐ | ☐ |
| 4 | Deep dive: Deployment and infrastructure (1 hour) | ☐ | ☐ | ☐ |
| 5 | Hands-on workshop: Building SSR app (2 hours) | ☐ | ☐ | ☐ |
| 6 | Troubleshooting clinic (1 hour) | ☐ | ☐ | ☐ |
| 7 | All sessions recorded and published | ☐ | ☐ | ☐ |

### Onboarding Updated

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Onboarding checklist updated to include RR7 | ☐ | ☐ | ☐ |
| 2 | New developer setup guide updated | ☐ | ☐ | ☐ |
| 3 | Code review guidelines updated for RR7 patterns | ☐ | ☐ | ☐ |
| 4 | Architecture decision records (ADRs) created | ☐ | ☐ | ☐ |

### Quality Assurance

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Documentation peer-reviewed by 3+ developers | ☐ | ☐ | ☐ |
| 2 | New developer tested onboarding docs (feedback collected) | ☐ | ☐ | ☐ |
| 3 | All code examples tested and working | ☐ | ☐ | ☐ |
| 4 | Documentation searchable (indexed) | ☐ | ☐ | ☐ |
| 5 | Feedback mechanism in place for doc improvements | ☐ | ☐ | ☐ |

## Technical Implementation

### Documentation Structure

```
docs/
├── README.md                           # Main entry point
├── react-router-7/
│   ├── README.md                       # RR7 overview
│   ├── getting-started/
│   │   ├── setup.md                    # Local setup
│   │   ├── your-first-app.md           # Tutorial
│   │   └── project-structure.md        # File organization
│   ├── guides/
│   │   ├── migration-from-nextjs.md    # Migration guide
│   │   ├── data-fetching.md            # Loaders and actions
│   │   ├── routing.md                  # File-based routing
│   │   ├── forms.md                    # Form handling
│   │   ├── error-handling.md           # Error boundaries
│   │   ├── authentication.md           # Auth0 integration
│   │   ├── styling.md                  # Vanilla Extract
│   │   ├── testing.md                  # Unit and E2E tests
│   │   ├── performance.md              # Optimization techniques
│   │   └── deployment.md               # CDK, Lambda, CloudFront
│   ├── best-practices/
│   │   ├── ssr-patterns.md             # SSR best practices
│   │   ├── code-organization.md        # File structure
│   │   ├── component-patterns.md       # Component design
│   │   ├── state-management.md         # State patterns
│   │   └── api-integration.md          # GraphQL, REST
│   ├── troubleshooting/
│   │   ├── common-issues.md            # Common problems
│   │   ├── debugging.md                # Debugging guide
│   │   ├── performance-issues.md       # Performance debugging
│   │   └── deployment-issues.md        # Deployment problems
│   ├── reference/
│   │   ├── api.md                      # API reference
│   │   ├── utilities.md                # Helper functions
│   │   ├── environment-variables.md    # Env vars
│   │   └── configuration.md            # Config options
│   ├── examples/
│   │   ├── basic-crud.md               # CRUD example
│   │   ├── authentication.md           # Auth example
│   │   ├── file-uploads.md             # Upload example
│   │   ├── real-time-updates.md        # WebSocket example
│   │   └── complex-forms.md            # Multi-step form
│   └── faq.md                          # Frequently asked questions
├── infrastructure/
│   ├── cdk-setup.md                    # CDK infrastructure
│   ├── lambda-configuration.md         # Lambda setup
│   ├── cloudfront-setup.md             # CloudFront config
│   └── monitoring.md                   # CloudWatch, X-Ray
└── architecture/
    ├── overview.md                     # Architecture overview
    ├── decisions/                      # ADRs
    │   ├── 001-react-router-7.md
    │   ├── 002-lambda-deployment.md
    │   └── 003-vite-build-tool.md
    └── diagrams/                       # Architecture diagrams
        ├── request-flow.png
        ├── deployment.png
        └── data-fetching.png
```

### Example Documentation Content

#### 1. Getting Started Guide

```markdown
# Getting Started with React Router 7

## Prerequisites
- Node.js 20+
- Yarn 1.22+
- AWS CLI configured
- Basic React knowledge

## Create Your First RR7 App

### 1. Generate Application
bash
cd packages/gdu/apps
yarn create-app my-app --template ssr


### 2. Project Structure
my-app/
├── app/
│   ├── root.tsx              # Root component
│   ├── entry.server.tsx      # SSR entry
│   ├── entry.client.tsx      # Client entry
│   └── routes/
│       └── _index.tsx        # Homepage
├── public/                   # Static assets
├── vite.config.ts            # Vite configuration
└── package.json


### 3. Run Development Server
bash
cd my-app
yarn dev


Visit http://localhost:3000

### 4. Add Your First Route

Create `app/routes/about.tsx`:

typescript
import { json } from 'react-router';
import { Box, Heading, Text } from '@autoguru/overdrive';

export default function About() {
  return (
    <Box padding="6">
      <Heading size="5">About Us</Heading>
      <Text>This is the about page.</Text>
    </Box>
  );
}


Visit http://localhost:3000/about

### 5. Add Data Fetching

Create `app/routes/users.tsx`:

typescript
import { json, type LoaderFunctionArgs } from 'react-router';
import { useLoaderData } from 'react-router';

export async function loader({ request }: LoaderFunctionArgs) {
  const users = await fetch('https://api.example.com/users').then(r => r.json());
  return json({ users });
}

export default function Users() {
  const { users } = useLoaderData<typeof loader>();

  return (
    <Box>
      <Heading>Users</Heading>
      {users.map(user => (
        <Text key={user.id}>{user.name}</Text>
      ))}
    </Box>
  );
}


### Next Steps
- [Data Fetching Guide](./guides/data-fetching.md)
- [Routing Guide](./guides/routing.md)
- [Deployment Guide](./guides/deployment.md)
```

#### 2. Migration Guide

```markdown
# Migrating from Next.js to React Router 7

## Overview
This guide walks through migrating a Next.js SSR application to React Router 7.

## Key Differences

| Next.js | React Router 7 |
|---------|----------------|
| pages/ | app/routes/ |
| getServerSideProps | loader |
| getStaticProps | loader + cache headers |
| API routes | action |
| useRouter | useNavigate, useParams |
| next/link | Link from react-router |
| next/image | img (with optimization) |

## Step-by-Step Migration

### 1. Convert Page to Route

**Before (Next.js):**
typescript
// pages/users/[id].tsx
export async function getServerSideProps({ params }) {
  const user = await fetchUser(params.id);
  return { props: { user } };
}

export default function UserPage({ user }) {
  return <div>{user.name}</div>;
}


**After (React Router 7):**
typescript
// app/routes/users/$id.tsx
import { json, type LoaderFunctionArgs } from 'react-router';
import { useLoaderData } from 'react-router';

export async function loader({ params }: LoaderFunctionArgs) {
  const user = await fetchUser(params.id);
  return json({ user });
}

export default function UserPage() {
  const { user } = useLoaderData<typeof loader>();
  return <div>{user.name}</div>;
}


### 2. Convert API Route to Action

**Before (Next.js):**
typescript
// pages/api/users.ts
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const user = await createUser(req.body);
    res.status(201).json(user);
  }
}


**After (React Router 7):**
typescript
// app/routes/users.new.tsx
import { redirect, type ActionFunctionArgs } from 'react-router';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const user = await createUser(Object.fromEntries(formData));
  return redirect(`/users/${user.id}`);
}

export default function NewUser() {
  return (
    <Form method="post">
      {/* form fields */}
    </Form>
  );
}


### 3. Update Navigation

**Before (Next.js):**
typescript
import Link from 'next/link';
import { useRouter } from 'next/router';

<Link href="/about">About</Link>

const router = useRouter();
router.push('/dashboard');


**After (React Router 7):**
typescript
import { Link, useNavigate } from 'react-router';

<Link to="/about">About</Link>

const navigate = useNavigate();
navigate('/dashboard');


### Common Pitfalls

1. **Forgetting to return json()**: Always wrap data in `json()` from loaders
2. **Not handling errors**: Use ErrorBoundary components
3. **Incorrect file naming**: Routes use `$` for params, not `[]`
4. **Missing types**: Import types from 'react-router'

### Checklist

- [ ] Convert pages/ to app/routes/
- [ ] Update getServerSideProps to loader
- [ ] Update API routes to actions
- [ ] Update navigation (Link, useRouter)
- [ ] Update image components
- [ ] Test all routes
- [ ] Test all forms
- [ ] Verify SEO (meta tags)
```

#### 3. Performance Optimization Guide

```markdown
# Performance Optimization Guide

## Overview
Optimize your React Router 7 application for maximum performance.

## Lambda Optimization

### Right-Size Memory
typescript
// Analyze memory usage in CloudWatch
// Recommended: p99 usage + 20% buffer

const myFunction = new NodejsFunction(this, 'MyFunction', {
  memorySize: 1024, // Based on analysis
});


### Reduce Bundle Size
typescript
// vite.config.ts
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        pure_funcs: ['console.log'],
      },
    },
  },
});


### Use Provisioned Concurrency
typescript
const alias = new Alias(this, 'Alias', {
  aliasName: 'live',
  version: myFunction.currentVersion,
  provisionedConcurrentExecutions: 5,
});


## CloudFront Optimization

### Optimize Cache Policy
typescript
const cachePolicy = new CachePolicy(this, 'Cache', {
  minTtl: Duration.seconds(0),
  maxTtl: Duration.hours(24),
  defaultTtl: Duration.minutes(10),
  // Only cache on essential parameters
  cookieBehavior: CacheCookieBehavior.allowList('session'),
  queryStringBehavior: CacheQueryStringBehavior.allExcept(
    'utm_source', 'utm_campaign' // Exclude tracking params
  ),
});


## Client-Side Optimization

### Lazy Load Images
tsx
<img src="/hero.jpg" loading="lazy" alt="Hero" />


### Code Split Routes
typescript
// Automatic in RR7 - each route is code-split


### Optimize Fonts
typescript
export function links() {
  return [
    {
      rel: 'preload',
      href: '/fonts/inter.woff2',
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous',
    },
  ];
}


## Data Fetching Optimization

### Parallel Fetching
typescript
export async function loader() {
  // Good: Parallel fetching
  const [users, posts] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
  ]);

  return json({ users, posts });
}


### Use DataLoader for N+1 Prevention
typescript
import DataLoader from 'dataloader';

const userLoader = new DataLoader(async (ids) => {
  return await fetchUsersByIds(ids);
});

// Batches requests automatically
const user = await userLoader.load(userId);


## Monitoring

### Track Performance
typescript
export async function loader({ request }: LoaderFunctionArgs) {
  const start = Date.now();

  const data = await fetchData();

  const duration = Date.now() - start;
  console.log(`Loader duration: ${duration}ms`);

  return json(data);
}


### Set Performance Budgets
- Lambda cold start: < 2s (p95)
- Lambda duration: < 500ms (p95)
- Page load: < 2s (p95)
- Lighthouse score: > 90
```

### Training Materials

#### Training Session Outline

**Session 1: React Router 7 Overview (1 hour)**
- Why React Router 7?
- Key differences from Next.js
- Architecture overview
- Live demo: Simple SSR app
- Q&A

**Session 2: Data Fetching (1 hour)**
- Loaders deep dive
- Actions deep dive
- Error handling
- Caching strategies
- Live demo: CRUD operations
- Q&A

**Session 3: Forms and Mutations (1 hour)**
- Progressive enhancement
- Form validation
- Optimistic UI
- File uploads
- Live demo: Multi-step form
- Q&A

**Session 4: Deployment and Infrastructure (1 hour)**
- CDK infrastructure
- Lambda configuration
- CloudFront setup
- Monitoring and debugging
- Live demo: Deploy to AWS
- Q&A

**Session 5: Hands-On Workshop (2 hours)**
- Build complete SSR application
- Implement authentication
- Add data fetching
- Deploy to staging
- Guided exercise with help from platform team

**Session 6: Troubleshooting Clinic (1 hour)**
- Common issues and solutions
- Debugging techniques
- Performance profiling
- Open discussion: Your challenges
- Q&A

#### Video Tutorial Topics

1. **Getting Started (15 min)**
   - Setup local environment
   - Create first RR7 app
   - Understand project structure

2. **Routing Fundamentals (20 min)**
   - File-based routing
   - Dynamic routes
   - Nested layouts
   - Route parameters

3. **Data Fetching with Loaders (25 min)**
   - What are loaders?
   - Fetching data server-side
   - Type-safe data access
   - Caching strategies

4. **Forms with Actions (25 min)**
   - What are actions?
   - Progressive enhancement
   - Form validation
   - Handling submissions

5. **Error Handling (15 min)**
   - Error boundaries
   - Error responses
   - User-friendly errors

6. **Authentication (30 min)**
   - Auth0 integration
   - Protected routes
   - Session management

7. **Deployment (30 min)**
   - CDK infrastructure
   - Deploy to Lambda
   - CloudFront configuration
   - Environment variables

8. **Performance Optimization (25 min)**
   - Bundle optimization
   - Lambda tuning
   - CloudFront caching
   - Monitoring

9. **Troubleshooting (20 min)**
   - Common issues
   - Debugging tips
   - CloudWatch logs
   - X-Ray tracing

10. **Best Practices (20 min)**
    - Code organization
    - Component patterns
    - State management
    - Testing strategies

### Code Examples Repository

```
examples/
├── basic-crud/                 # Simple CRUD app
│   ├── app/routes/
│   │   ├── _index.tsx
│   │   ├── items/
│   │   │   ├── index.tsx      # List items
│   │   │   ├── new.tsx        # Create item
│   │   │   ├── $id.tsx        # View item
│   │   │   └── $id.edit.tsx   # Edit item
│   └── README.md
├── authentication/             # Auth0 integration
│   ├── app/
│   │   ├── auth.server.ts
│   │   ├── routes/
│   │   │   ├── _auth/
│   │   │   └── _protected/
│   └── README.md
├── file-uploads/              # File upload example
│   ├── app/routes/
│   │   └── upload.tsx
│   └── README.md
├── real-time-updates/         # WebSocket example
│   ├── app/
│   │   ├── hooks/useWebSocket.ts
│   │   └── routes/dashboard.tsx
│   └── README.md
├── complex-forms/             # Multi-step form
│   ├── app/routes/
│   │   └── booking/
│   │       ├── step1.tsx
│   │       ├── step2.tsx
│   │       └── confirm.tsx
│   └── README.md
└── performance-optimized/     # Performance patterns
    ├── app/
    │   ├── components/LazyImage.tsx
    │   ├── utils/dataLoader.ts
    │   └── routes/optimized.tsx
    └── README.md
```

## Definition of Done

### Documentation Complete
- [ ] All documentation files created and reviewed
- [ ] Code examples tested and working
- [ ] Screenshots and diagrams added where helpful
- [ ] Documentation published to internal wiki/Confluence
- [ ] Documentation searchable and indexed
- [ ] README.md updated with RR7 information
- [ ] Architecture Decision Records (ADRs) created

### Training Complete
- [ ] All 6 training sessions delivered
- [ ] Sessions recorded and published
- [ ] 80%+ of engineering team attended at least 3 sessions
- [ ] Training feedback collected (average 4+ stars)
- [ ] Video tutorials recorded and published
- [ ] Code examples repository created and accessible

### Onboarding Updated
- [ ] Onboarding checklist includes RR7 training
- [ ] New developer setup guide updated
- [ ] Code review guidelines updated
- [ ] New developer onboarded successfully using docs (validation)
- [ ] Feedback from new developer incorporated

### Quality Assurance
- [ ] All documentation peer-reviewed
- [ ] Technical accuracy verified by 3+ senior devs
- [ ] Code examples tested in CI
- [ ] Documentation tested with new developer
- [ ] Feedback mechanism in place
- [ ] Documentation maintenance plan established

## Dependencies

### Blocked By
- AG-TBD-025: Marketplace migration (need all learnings consolidated)
- AG-TBD-026: Optimization (include optimization patterns in docs)

### Blocks
- None (documentation enables but doesn't block)

### Related Stories
- AG-TBD-028: Webpack deprecation (documentation includes migration path)

## Story Points Justification

**Complexity Factors**:

- **Documentation Writing**: High
  - 12 major documentation topics
  - Code examples for each
  - Screenshots and diagrams
  - Estimated: 4-5 days

- **Training Preparation**: Medium
  - 6 training sessions to prepare
  - Slides and demos
  - Hands-on exercises
  - Estimated: 2-3 days

- **Training Delivery**: Medium
  - 7 hours of sessions
  - Recording and publishing
  - Q&A and support
  - Estimated: 2 days

- **Video Tutorials**: Low-Medium
  - 10 video tutorials
  - Recording and editing
  - Estimated: 1-2 days

**Total Points**: 8

**Breakdown**:
- Documentation: 4 points
- Training preparation: 2 points
- Training delivery: 1 point
- Video tutorials: 1 point

## Notes & Decisions

### Technical Decisions

- **Documentation Platform**: Use Confluence for main docs, GitHub for code examples
  - Rationale: Confluence searchable and accessible to all, GitHub for version control

- **Video Format**: 15-30 minute focused tutorials vs 2-hour recordings
  - Rationale: Short videos more consumable, easier to find specific topics

- **Training Schedule**: Weekly sessions over 6 weeks vs intensive bootcamp
  - Rationale: Weekly allows time to practice, less disruptive to sprint work

- **Live vs Pre-recorded**: Live sessions with recording vs pre-recorded only
  - Rationale: Live allows Q&A, recording provides reference

### Open Questions
- [ ] Should we create Loom videos or use professional recording? (Recommend Loom for speed)
- [ ] Should we make training mandatory? (Recommend yes for team members working on SSR apps)
- [ ] Do we need external documentation review? (Recommend internal is sufficient)

### Assumptions
- Developers have time to attend training sessions
- Documentation will be maintained going forward
- Video tutorials remain relevant for 6+ months
- New developers will actually read documentation

### Success Criteria

Documentation and training is successful if:
- ✓ 80%+ of engineering team attended at least 3 training sessions
- ✓ Training feedback average 4+ stars
- ✓ New developer successfully onboards using documentation
- ✓ Documentation referenced regularly (analytics show usage)
- ✓ Reduced Slack questions about RR7 basics
- ✓ All code examples working and tested
- ✓ Video tutorials published and accessible
- ✓ Positive feedback from team on documentation quality
