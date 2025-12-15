# Story: SP. SSR Migration. As a Supplier Manager, I want the supplier portal migrated to React Router 7, so that I can continue managing my workshop operations with improved performance

## Story Details

**Story ID**: AG-TBD-023
**Epic**: AG-TBD-000 - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Must Have
**Story Points**: 13
**Sprint**: Sprint 10

## Description

### Summary
We're migrating the Supplier Portal SSR application from Next.js to React Router 7 with Lambda deployment. This is a critical B2B application used daily by workshop managers, service coordinators, and admin staff to manage bookings, availability, pricing, and customer interactions. The migration must be seamless with zero disruption to supplier operations.

Unlike internal tools, this migration affects external users who depend on the portal for their business operations. Extensive testing, stakeholder coordination, and careful deployment planning are essential.

### Background
The Supplier Portal is a revenue-critical application serving hundreds of workshop partners across Australia. Suppliers use it to:
- Manage booking requests and scheduling
- Update service availability and pricing
- Communicate with customers
- Process job completions and invoicing
- View performance metrics and reports

Downtime or functionality issues directly impact supplier satisfaction and AutoGuru's service delivery. After successfully migrating internal apps (AG-TBD-022), we're ready to tackle this higher-stakes migration with proven procedures and infrastructure.

### User Value
Suppliers benefit from improved portal performance, faster page loads, and a more responsive interface. The React Router 7 migration provides a foundation for future enhancements while maintaining all existing functionality suppliers rely on.

## User Persona

**Role**: Supplier Manager / Workshop Manager
**Name**: "Tony the Workshop Manager"
**Context**: Uses the portal daily from workshop office to manage bookings and operations
**Goals**: Efficiently manage incoming bookings, update availability, communicate with customers, complete jobs quickly
**Pain Points**: Needs reliable portal access during business hours, can't afford system downtime during peak booking times

## Acceptance Criteria

### Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | All booking management features work identically | ☐ | ☐ | ☐ |
| 2 | Availability calendar updates and displays correctly | ☐ | ☐ | ☐ |
| 3 | Pricing management (view, edit, save) works properly | ☐ | ☐ | ☐ |
| 4 | Job completion workflow functions correctly | ☐ | ☐ | ☐ |
| 5 | Customer communication (messages, calls) works | ☐ | ☐ | ☐ |
| 6 | Document uploads (invoices, photos) work correctly | ☐ | ☐ | ☐ |
| 7 | Performance metrics dashboard displays accurately | ☐ | ☐ | ☐ |
| 8 | Search and filter functionality works correctly | ☐ | ☐ | ☐ |
| 9 | Notifications display and update properly | ☐ | ☐ | ☐ |
| 10 | Mobile responsive views work on tablets and phones | ☐ | ☐ | ☐ |
| 11 | Multi-location suppliers can switch between workshops | ☐ | ☐ | ☐ |
| 12 | All report generation and exports work correctly | ☐ | ☐ | ☐ |
| 13 | Real-time booking updates appear without refresh | ☐ | ☐ | ☐ |

### Non-Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Page load time improved by 20% vs Next.js baseline | ☐ | ☐ | ☐ |
| 2 | Time to interactive (TTI) under 2 seconds | ☐ | ☐ | ☐ |
| 3 | Lambda cold start under 2.5 seconds (p95) | ☐ | ☐ | ☐ |
| 4 | Warm Lambda response under 400ms (p95) | ☐ | ☐ | ☐ |
| 5 | Zero downtime during deployment | ☐ | ☐ | ☐ |
| 6 | Supports 500 concurrent users (peak load) | ☐ | ☐ | ☐ |
| 7 | Booking submission success rate > 99.9% | ☐ | ☐ | ☐ |
| 8 | Works on Chrome, Firefox, Safari, Edge (latest 2 versions) | ☐ | ☐ | ☐ |
| 9 | Mobile browser support (iOS Safari, Chrome Android) | ☐ | ☐ | ☐ |
| 10 | Maintains WCAG AA accessibility compliance | ☐ | ☐ | ☐ |

### Edge Cases

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Handle concurrent booking updates from multiple tabs | ☐ | ☐ | ☐ |
| 2 | Gracefully handle large file uploads (invoices, photos) | ☐ | ☐ | ☐ |
| 3 | Recover from WebSocket disconnection (real-time updates) | ☐ | ☐ | ☐ |
| 4 | Handle session timeout during form completion | ☐ | ☐ | ☐ |
| 5 | Manage optimistic UI updates that fail | ☐ | ☐ | ☐ |
| 6 | Display appropriate errors for payment processing failures | ☐ | ☐ | ☐ |

## Technical Implementation

### Frontend (MFE: `gdu`)

#### Application Structure
```
packages/gdu/apps/supplier-portal/
├── app/
│   ├── root.tsx                    # Root layout
│   ├── entry.server.tsx            # SSR entry point
│   ├── entry.client.tsx            # Client hydration
│   ├── routes/
│   │   ├── _auth.tsx               # Auth layout
│   │   ├── _auth.login.tsx         # Login page
│   │   ├── _dashboard.tsx          # Dashboard layout
│   │   ├── _dashboard.index.tsx    # Dashboard home
│   │   ├── _dashboard.bookings/
│   │   │   ├── index.tsx           # Bookings list
│   │   │   ├── $id.tsx             # Booking detail
│   │   │   └── $id.complete.tsx    # Complete booking
│   │   ├── _dashboard.availability.tsx
│   │   ├── _dashboard.pricing.tsx
│   │   ├── _dashboard.reports.tsx
│   │   └── _dashboard.settings/
│   ├── components/
│   │   ├── BookingCard.tsx
│   │   ├── AvailabilityCalendar.tsx
│   │   ├── PricingTable.tsx
│   │   └── ...
│   └── queries/
│       ├── BookingsQuery.graphql
│       ├── AvailabilityQuery.graphql
│       └── ...
└── vite.config.ts
```

#### Key Migration Patterns

**1. Booking Management Loader**
```typescript
// routes/_dashboard.bookings/index.tsx
import { json, type LoaderFunctionArgs } from 'react-router';
import { getSupplierSession } from '~/auth.server';
import { fetchBookings } from '~/api/bookings';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSupplierSession(request);

  if (!session) {
    throw redirect('/login');
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'pending';
  const page = parseInt(url.searchParams.get('page') || '1');

  const bookings = await fetchBookings({
    supplierId: session.supplierId,
    status,
    page,
    perPage: 20,
  });

  return json({
    bookings,
    status,
    page,
    supplierId: session.supplierId,
  });
}

export default function BookingsPage() {
  const { bookings, status, page } = useLoaderData<typeof loader>();

  return (
    <Box padding="6">
      <Stack space="4">
        <Heading size="5">Bookings</Heading>
        <BookingFilters currentStatus={status} />
        <BookingsList bookings={bookings} />
        <Pagination currentPage={page} total={bookings.total} />
      </Stack>
    </Box>
  );
}
```

**2. Booking Completion Action**
```typescript
// routes/_dashboard.bookings/$id.complete.tsx
import { redirect, type ActionFunctionArgs } from 'react-router';
import { completeBooking } from '~/api/bookings';
import { uploadInvoice } from '~/api/uploads';

export async function action({ request, params }: ActionFunctionArgs) {
  const session = await getSupplierSession(request);
  const formData = await request.formData();

  const bookingId = params.id!;
  const notes = formData.get('notes') as string;
  const invoice = formData.get('invoice') as File;

  try {
    // Upload invoice
    let invoiceUrl;
    if (invoice && invoice.size > 0) {
      invoiceUrl = await uploadInvoice(invoice, {
        bookingId,
        supplierId: session.supplierId,
      });
    }

    // Complete booking
    await completeBooking({
      bookingId,
      supplierId: session.supplierId,
      notes,
      invoiceUrl,
    });

    return redirect(`/bookings/${bookingId}?completed=true`);
  } catch (error) {
    return json(
      { error: 'Failed to complete booking. Please try again.' },
      { status: 400 }
    );
  }
}

export default function CompleteBookingPage() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <Form method="post" encType="multipart/form-data">
      <Stack space="4">
        <FormikTextArea
          name="notes"
          label="Completion Notes"
          isRequired
        />
        <FormikFileInput
          name="invoice"
          label="Upload Invoice"
          accept=".pdf,.jpg,.png"
        />
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Completing...' : 'Complete Booking'}
        </Button>
      </Stack>
    </Form>
  );
}
```

**3. Real-time Updates Integration**
```typescript
// app/root.tsx
import { useEffect } from 'react';
import { useFetcher } from 'react-router';
import { useWebSocket } from '~/hooks/useWebSocket';

export default function Root() {
  const fetcher = useFetcher();
  const ws = useWebSocket(`wss://api.autoguru.com.au/supplier-updates`);

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);

      // Revalidate booking data when updates arrive
      if (update.type === 'BOOKING_UPDATED') {
        fetcher.load(`/bookings/${update.bookingId}`);
      }
    };
  }, [ws, fetcher]);

  return (
    <Outlet />
  );
}
```

**4. Availability Calendar**
```typescript
// routes/_dashboard.availability.tsx
export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSupplierSession(request);
  const url = new URL(request.url);
  const month = url.searchParams.get('month') || getCurrentMonth();

  const availability = await fetchAvailability({
    supplierId: session.supplierId,
    month,
  });

  return json({ availability, month });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSupplierSession(request);
  const formData = await request.formData();

  const date = formData.get('date') as string;
  const isAvailable = formData.get('available') === 'true';
  const capacity = parseInt(formData.get('capacity') as string);

  await updateAvailability({
    supplierId: session.supplierId,
    date,
    isAvailable,
    capacity,
  });

  return json({ success: true });
}

export default function AvailabilityPage() {
  const { availability, month } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const handleDateClick = (date: string, currentCapacity: number) => {
    const formData = new FormData();
    formData.set('date', date);
    formData.set('available', 'true');
    formData.set('capacity', String(currentCapacity + 1));

    fetcher.submit(formData, { method: 'post' });
  };

  return (
    <Box padding="6">
      <AvailabilityCalendar
        availability={availability}
        onDateClick={handleDateClick}
        month={month}
      />
    </Box>
  );
}
```

#### Build Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    reactRouter({
      ssr: true,
      appDirectory: 'app',
      serverModuleFormat: 'esm',
    }),
    tsconfigPaths(),
  ],
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined, // Single bundle for Lambda
      },
    },
  },
  ssr: {
    noExternal: ['@autoguru/overdrive'],
  },
});
```

### Backend (`mfe` CDK Infrastructure)

#### Lambda Configuration
```typescript
// mfe/lib/stacks/supplier-portal-stack.ts
const supplierPortalFunction = new NodejsFunction(
  this,
  'SupplierPortalFunction',
  {
    entry: 'dist/apps/supplier-portal/server.js',
    handler: 'handler',
    runtime: Runtime.NODEJS_20_X,
    architecture: Architecture.ARM_64,
    memorySize: 1024, // Higher memory for better cold start
    timeout: Duration.seconds(30),
    environment: {
      NODE_ENV: 'production',
      AWS_LAMBDA_EXEC_WRAPPER: '/opt/bootstrap',
      PORT: '8080',
      SESSION_SECRET: process.env.SESSION_SECRET!,
      AUTH0_DOMAIN: process.env.AUTH0_DOMAIN!,
      AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID!,
      GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT!,
    },
    bundling: {
      minify: true,
      sourceMap: true,
      target: 'es2022',
      externalModules: ['aws-sdk'],
    },
    layers: [lambdaWebAdapterLayer],
    // Provisioned concurrency for business hours
    reservedConcurrentExecutions: 100,
  }
);

// Provisioned concurrency for business hours (8am-6pm AEST)
const alias = new Alias(this, 'SupplierPortalAlias', {
  aliasName: 'live',
  version: supplierPortalFunction.currentVersion,
  provisionedConcurrentExecutions: 5, // Reduce cold starts
});
```

#### CloudFront Distribution
```typescript
const supplierPortalDistribution = new Distribution(
  this,
  'SupplierPortalDistribution',
  {
    defaultBehavior: {
      origin: new HttpOrigin(functionUrl.domainName),
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      allowedMethods: AllowedMethods.ALLOW_ALL,
      cachePolicy: new CachePolicy(this, 'SupplierPortalCache', {
        cachePolicyName: 'SupplierPortalSSR',
        minTtl: Duration.seconds(0),
        maxTtl: Duration.minutes(5),
        defaultTtl: Duration.seconds(30),
        cookieBehavior: CacheCookieBehavior.all(), // Needed for sessions
        headerBehavior: CacheHeaderBehavior.allowList(
          'Authorization',
          'Accept',
          'Accept-Language'
        ),
        queryStringBehavior: CacheQueryStringBehavior.all(),
        enableAcceptEncodingGzip: true,
        enableAcceptEncodingBrotli: true,
      }),
      originRequestPolicy: OriginRequestPolicy.ALL_VIEWER,
    },
    additionalBehaviors: {
      '/api/*': {
        origin: new HttpOrigin(apiDomainName),
        cachePolicy: CachePolicy.CACHING_DISABLED,
        allowedMethods: AllowedMethods.ALLOW_ALL,
      },
      '/assets/*': {
        origin: new S3Origin(assetsBucket),
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    },
    domainNames: ['suppliers.autoguru.com.au'],
    certificate: certificate,
  }
);
```

### Integration Points

#### Auth0 Supplier Authentication
```typescript
// app/auth.server.ts
import { Authenticator } from 'remix-auth';
import { Auth0Strategy } from 'remix-auth-auth0';

export const authenticator = new Authenticator<SupplierSession>(
  sessionStorage
);

authenticator.use(
  new Auth0Strategy(
    {
      domain: process.env.AUTH0_DOMAIN!,
      clientID: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      callbackURL: 'https://suppliers.autoguru.com.au/auth/callback',
      audience: 'https://api.autoguru.com.au',
    },
    async ({ accessToken, profile }) => {
      // Fetch supplier data from GraphQL
      const supplier = await fetchSupplier(profile.id);

      return {
        userId: profile.id,
        supplierId: supplier.id,
        email: profile.email,
        name: supplier.name,
        accessToken,
      };
    }
  )
);
```

#### GraphQL API Integration
- **Booking Queries**: Fetch booking lists, details, status updates
- **Availability Mutations**: Update calendar availability
- **Pricing Queries**: Fetch and update service pricing
- **Reporting Queries**: Generate performance reports

#### WebSocket for Real-time Updates
- **Connection**: WSS connection to API Gateway WebSocket
- **Events**: Booking updates, new booking alerts, customer messages
- **Reconnection**: Automatic reconnection with exponential backoff

#### File Upload Service
- **S3 Direct Upload**: Pre-signed URLs for invoice/photo uploads
- **Validation**: File type, size validation client and server-side
- **Processing**: Image optimization, PDF validation

### Monitoring and Alerting

#### CloudWatch Dashboard
```typescript
const dashboard = new Dashboard(this, 'SupplierPortalDashboard', {
  dashboardName: 'SupplierPortal-ReactRouter7',
  widgets: [
    [
      new SingleValueWidget({
        title: 'Current Requests/Min',
        metrics: [
          supplierPortalFunction.metricInvocations({
            statistic: 'sum',
            period: Duration.minutes(1),
          }),
        ],
      }),
      new SingleValueWidget({
        title: 'Error Rate',
        metrics: [
          supplierPortalFunction.metricErrors({
            statistic: 'average',
            period: Duration.minutes(5),
          }),
        ],
      }),
    ],
    [
      new GraphWidget({
        title: 'Response Time (p50, p95, p99)',
        left: [
          supplierPortalFunction.metricDuration({
            statistic: 'p50',
          }),
          supplierPortalFunction.metricDuration({
            statistic: 'p95',
          }),
          supplierPortalFunction.metricDuration({
            statistic: 'p99',
          }),
        ],
      }),
      new GraphWidget({
        title: 'Concurrent Executions',
        left: [
          supplierPortalFunction.metricConcurrentExecutions(),
        ],
      }),
    ],
    [
      new GraphWidget({
        title: 'Booking Completion Success Rate',
        left: [
          new Metric({
            namespace: 'SupplierPortal',
            metricName: 'BookingCompletionSuccess',
            statistic: 'average',
          }),
        ],
      }),
      new GraphWidget({
        title: 'Upload Success Rate',
        left: [
          new Metric({
            namespace: 'SupplierPortal',
            metricName: 'FileUploadSuccess',
            statistic: 'average',
          }),
        ],
      }),
    ],
  ],
});
```

#### Critical Alarms
```typescript
// High error rate
new Alarm(this, 'SupplierPortalErrorRate', {
  metric: supplierPortalFunction.metricErrors({
    statistic: 'sum',
    period: Duration.minutes(5),
  }),
  threshold: 10,
  evaluationPeriods: 2,
  treatMissingData: TreatMissingData.NOT_BREACHING,
  alarmDescription: 'Supplier Portal error rate exceeded threshold',
  actionsEnabled: true,
});

// Slow response time
new Alarm(this, 'SupplierPortalSlowResponse', {
  metric: supplierPortalFunction.metricDuration({
    statistic: 'p95',
    period: Duration.minutes(5),
  }),
  threshold: 2000, // 2 seconds
  evaluationPeriods: 3,
  alarmDescription: 'Supplier Portal response time too high',
});

// Booking completion failures
new Alarm(this, 'BookingCompletionFailures', {
  metric: new Metric({
    namespace: 'SupplierPortal',
    metricName: 'BookingCompletionFailure',
    statistic: 'sum',
    period: Duration.minutes(5),
  }),
  threshold: 5,
  evaluationPeriods: 2,
  alarmDescription: 'Multiple booking completion failures detected',
});
```

## UI/UX Specifications

### Design References
- **Figma**: Existing Supplier Portal designs (no changes)
- **Status**: Pixel-perfect migration, no design changes
- **Visual Regression**: Automated Percy tests on all pages

### Critical User Flows

#### 1. Accept Booking Flow
```
Dashboard → Pending Bookings → Select Booking → Review Details → Accept → Confirmation
Expected time: < 30 seconds total
Page loads: < 500ms each
```

#### 2. Complete Booking Flow
```
Active Bookings → Select Booking → Complete → Upload Invoice → Add Notes → Submit → Success
Expected time: < 2 minutes
Form submission: < 1 second
File upload: < 5 seconds for 5MB file
```

#### 3. Update Availability Flow
```
Dashboard → Availability → Select Date Range → Set Capacity → Save → Confirmation
Expected time: < 1 minute
Calendar interaction: Instant
Save: < 500ms
```

## Test Scenarios

### Functional Testing

#### Happy Paths
1. **Login and Dashboard**
   - Supplier logs in via Auth0
   - Dashboard loads with pending bookings count
   - Metrics display correctly

2. **Accept Booking**
   - Navigate to pending bookings
   - Review booking details
   - Accept booking
   - Booking moves to active list
   - Customer receives notification

3. **Complete Booking**
   - Navigate to active booking
   - Upload invoice PDF
   - Add completion notes
   - Submit completion
   - Booking moves to completed
   - Customer receives invoice

4. **Update Availability**
   - Open availability calendar
   - Click dates to toggle availability
   - Set capacity for specific dates
   - Changes save automatically
   - Calendar reflects updates

#### Error Scenarios

1. **Authentication Failure**
   - Invalid credentials → Clear error message
   - Session timeout → Redirect to login with return URL
   - No internet → Offline message

2. **Booking Acceptance Failure**
   - Booking already accepted → Error message
   - Network failure → Retry option
   - Validation error → Specific field error

3. **File Upload Failure**
   - File too large → Size limit error
   - Invalid file type → Format error
   - Network interruption → Resume upload option

4. **Concurrent Update Conflict**
   - Two tabs update same booking → Conflict resolution UI
   - Optimistic update fails → Revert with notification

### Performance Testing

#### Load Test Scenarios
```yaml
# Morning peak (9am AEST)
Scenario: Morning Peak
  Users: 200 concurrent
  Duration: 30 minutes
  Actions:
    - Login: 10%
    - View Dashboard: 30%
    - View Bookings: 25%
    - Accept Booking: 15%
    - Update Availability: 10%
    - Complete Booking: 10%

  Success Criteria:
    - Response time p95 < 1 second
    - Error rate < 0.1%
    - No Lambda throttling
```

#### Stress Test
```yaml
Scenario: Stress Test
  Ramp up: 0 to 500 users over 15 minutes
  Hold: 500 users for 10 minutes
  Ramp down: 500 to 0 over 5 minutes

  Success Criteria:
    - System remains stable
    - Lambda auto-scales appropriately
    - No data loss or corruption
    - Graceful degradation if limits hit
```

### User Acceptance Testing (UAT)

#### UAT Participants
- 10 diverse suppliers (metro, regional, different service types)
- 2 multi-location suppliers
- 1 high-volume supplier (>100 bookings/month)

#### UAT Checklist
- [ ] All participants can log in successfully
- [ ] Booking acceptance works for all participants
- [ ] Availability updates work correctly
- [ ] Mobile/tablet usage verified
- [ ] No show-stopper issues identified
- [ ] Performance perceived as same or better
- [ ] Positive feedback from majority

## Rollback Plan

### Pre-Deployment Preparation
- [ ] Next.js version tagged as `supplier-portal-nextjs-stable`
- [ ] CloudFront configuration exported and saved
- [ ] Lambda function ARN documented
- [ ] DNS records documented
- [ ] Rollback procedure tested in staging
- [ ] Team trained on rollback process
- [ ] Communication templates prepared

### Rollback Triggers

**Immediate Rollback**:
- Booking acceptance failure rate > 1%
- Booking completion failure rate > 1%
- Error rate > 0.5% for 5 minutes
- Response time p95 > 5 seconds for 10 minutes
- Authentication failures > 5%
- Critical feature non-functional
- Data integrity issues

**Consider Rollback**:
- Error rate 0.1-0.5% for 15 minutes
- Performance degradation complaints from 3+ suppliers
- Unusual pattern in monitoring metrics

### Rollback Procedure

```bash
#!/bin/bash
# supplier-portal-rollback.sh

set -e

echo "🚨 INITIATING SUPPLIER PORTAL ROLLBACK"

# 1. Switch CloudFront origin to Next.js Lambda
echo "📝 Updating CloudFront distribution..."
aws cloudfront update-distribution \
  --id $SUPPLIER_PORTAL_DISTRIBUTION_ID \
  --distribution-config file://nextjs-distribution-config.json

# 2. Create invalidation
echo "🗑️  Creating CloudFront invalidation..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id $SUPPLIER_PORTAL_DISTRIBUTION_ID \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)

echo "⏳ Waiting for invalidation $INVALIDATION_ID..."
aws cloudfront wait invalidation-completed \
  --distribution-id $SUPPLIER_PORTAL_DISTRIBUTION_ID \
  --id $INVALIDATION_ID

# 3. Verify Next.js serving
echo "✅ Verifying Next.js deployment..."
RESPONSE=$(curl -I https://suppliers.autoguru.com.au)
if echo "$RESPONSE" | grep -q "200 OK"; then
  echo "✅ Rollback successful!"
else
  echo "❌ Rollback verification failed!"
  exit 1
fi

# 4. Notify team
echo "📢 Notifying team..."
slack-notify "#supplier-team" "🚨 Supplier Portal rolled back to Next.js due to $ROLLBACK_REASON"
slack-notify "#engineering" "🚨 Supplier Portal rollback completed. Investigating issue."

# 5. Create incident
echo "📋 Creating incident..."
create-incident "Supplier Portal RR7 Migration Rollback" "high"

echo "✅ ROLLBACK COMPLETE - Next.js restored"
```

**Expected Rollback Time**: 5-10 minutes
**Validation Time**: 5 minutes
**Total Recovery Time**: 10-15 minutes

### Post-Rollback Actions
1. Root cause analysis within 24 hours
2. Document issue and resolution
3. Update migration plan based on learnings
4. Communicate timeline for retry to stakeholders
5. Fix identified issues before reattempting

## Communication Plan

### Pre-Migration Communication

#### Internal Team (1 Week Before)
**Audience**: Engineering, Product, Support teams
**Channel**: Slack (#supplier-team, #engineering), Email
**Message**:
```
Supplier Portal Migration - React Router 7
Deployment: [DATE] at [TIME]

What's happening:
- Migrating Supplier Portal to new infrastructure
- Zero downtime deployment planned
- All features will work identically
- Performance improvements expected

Deployment window: [START] - [END]
Rollback plan: Ready within 10 minutes if needed

Support team: Monitor #supplier-support for issues
On-call: [NAMES] available during deployment

Questions? #platform-team
```

#### Supplier Communication (3 Days Before)
**Audience**: All active suppliers
**Channel**: Email, In-app notification
**Message**:
```
Subject: Upcoming Supplier Portal Enhancement

Hi [Supplier Name],

We're upgrading the Supplier Portal on [DATE] to improve performance and reliability.

What to expect:
✓ Faster page loads
✓ More responsive interface
✓ All existing features working the same
✓ No action required from you

When: [DATE] between [TIME RANGE]
Impact: None expected - you can continue using the portal normally

If you notice anything unusual after [DATE], please contact support.

Thanks for being a valued AutoGuru partner!

The AutoGuru Team
```

### During Deployment

#### Deployment Updates (Every 15 Minutes)
**Audience**: Engineering team
**Channel**: Slack (#deployments)
**Format**:
```
[TIME] Supplier Portal Deployment Update
Status: [In Progress | Monitoring | Complete]
Stage: [Current deployment stage]
Metrics:
  - Error rate: X%
  - Response time p95: Xms
  - Active users: X
Issues: [None | List]
Next: [Next step]
```

### Post-Deployment Communication

#### Immediate (Within 1 Hour)
**Audience**: Engineering, Product
**Channel**: Slack
```
✅ Supplier Portal Migration Complete

Deployment: Successful
Duration: [X] minutes
Rollbacks: None
Current metrics:
  - Error rate: 0.01%
  - Response time p95: 450ms
  - Active users: 125

Monitoring: Continuing for 24 hours
Next check-in: [TIME]
```

#### 24 Hour Update
**Audience**: All stakeholders
**Channel**: Email, Slack
```
Supplier Portal Migration - 24 Hour Update

Status: Stable ✓
Metrics comparison (Next.js → RR7):
  - Error rate: 0.05% → 0.02% (60% improvement)
  - Load time: 2.1s → 1.6s (24% faster)
  - Booking completions: 1,247 (100% success)

Supplier feedback: No issues reported
Support tickets: 0 related issues

Continuing monitoring for 1 week.

Next: Fleet Management migration (Sprint 11)
```

#### 1 Week Summary
**Audience**: Leadership, all teams
**Channel**: Email, Confluence
```
Supplier Portal RR7 Migration - Week 1 Summary

Migration: Successful ✓
Uptime: 99.99%
Performance: Improved across all metrics
Supplier satisfaction: No negative feedback

Detailed metrics:
[Link to dashboard]

Lessons learned:
[Link to retrospective]

Status: Migration complete, monitoring ongoing

Next migration: Fleet Management Portal (Sprint 11)
```

## Definition of Done

### Development Complete
- [ ] All routes migrated to React Router 7
- [ ] All loaders implement data fetching correctly
- [ ] All actions handle form submissions
- [ ] Authentication via Auth0 working
- [ ] File uploads functional
- [ ] Real-time updates via WebSocket working
- [ ] Error boundaries implemented
- [ ] Unit tests passing (>85% coverage)
- [ ] Integration tests passing
- [ ] Code reviewed and approved
- [ ] No critical security issues

### Testing Complete
- [ ] All acceptance criteria verified
- [ ] Manual testing completed for all features
- [ ] Booking acceptance tested (20+ scenarios)
- [ ] Booking completion tested (15+ scenarios)
- [ ] Availability management tested
- [ ] Mobile responsive testing complete
- [ ] Cross-browser testing complete (Chrome, Firefox, Safari, Edge)
- [ ] Accessibility testing complete (WCAG AA)
- [ ] Performance testing passed (load, stress)
- [ ] UAT completed with 10 suppliers
- [ ] Visual regression tests passing
- [ ] No critical or high-priority bugs

### Security Complete
- [ ] Security review completed
- [ ] Auth0 integration validated
- [ ] Session management secure
- [ ] File upload validation working
- [ ] No sensitive data exposed in logs
- [ ] HTTPS enforced everywhere
- [ ] OWASP Top 10 reviewed

### Deployment Complete
- [ ] Deployed to dev environment (tested 2 days)
- [ ] Deployed to staging environment (tested 5 days)
- [ ] UAT completed in staging
- [ ] Performance benchmarks met in staging
- [ ] Deployed to production
- [ ] CloudFront configured correctly
- [ ] DNS routing verified
- [ ] SSL certificates valid
- [ ] Monitoring dashboards created
- [ ] Alarms configured and tested
- [ ] On-call team briefed
- [ ] Rollback procedure validated

### Documentation Complete
- [ ] Migration guide documented
- [ ] API changes documented
- [ ] Deployment process documented
- [ ] Rollback procedure documented
- [ ] Monitoring runbook created
- [ ] Troubleshooting guide created
- [ ] Supplier-facing docs updated (if needed)
- [ ] Support team briefed
- [ ] Code comments added for complex logic

### Monitoring Complete
- [ ] CloudWatch dashboard live
- [ ] Critical alarms configured
- [ ] X-Ray tracing validated
- [ ] Error tracking configured
- [ ] Performance metrics tracked
- [ ] Business metrics tracked (booking completions)
- [ ] 24-hour monitoring completed
- [ ] 1-week monitoring completed
- [ ] Metrics compared to baseline
- [ ] No degradation in key metrics

## Dependencies

### Blocked By
- AG-TBD-022: Internal SSR apps migration (must complete successfully with lessons learned)
- AG-TBD-015: Lambda Web Adapter integration
- AG-TBD-016: CDK infrastructure for RR7

### Blocks
- AG-TBD-024: Fleet Management migration (waiting for supplier portal validation)
- AG-TBD-025: Marketplace migration (waiting for B2B validation)

### Related Stories
- AG-TBD-018: Parallel run strategy
- AG-TBD-019: Feature flags
- AG-TBD-026: Performance optimization
- AG-TBD-027: Documentation and training

## Story Points Justification

**Complexity Factors**:

- **Frontend Complexity**: High
  - Complex booking management flows
  - Real-time updates integration
  - File upload handling
  - Multi-step forms with validation
  - Mobile responsive requirements
  - Estimated: 4-5 days

- **Backend Complexity**: Medium
  - Lambda configuration more complex (provisioned concurrency)
  - CloudFront caching strategy for dynamic content
  - WebSocket integration for real-time updates
  - File upload to S3 integration
  - Estimated: 2-3 days

- **Testing Effort**: Very High
  - Extensive functional testing across all features
  - UAT with 10 real suppliers
  - Performance testing under realistic load
  - Security review required
  - Mobile testing on multiple devices
  - Estimated: 4-5 days

- **Coordination Effort**: Medium
  - Coordinate with Supplier team
  - Communicate with suppliers
  - Support team briefing
  - Estimated: 1-2 days

- **Integration Points**: 7
  - Auth0 authentication
  - GraphQL API (multiple endpoints)
  - WebSocket for real-time updates
  - S3 file uploads
  - CloudFront + Lambda
  - CloudWatch monitoring
  - X-Ray tracing

- **Unknown Factors**:
  - Real-time update behavior in production
  - File upload performance at scale
  - Supplier feedback may reveal edge cases
  - WebSocket reliability under load

**Total Points**: 13

**Breakdown**:
- Application migration: 5 points (complex flows, real-time features)
- Testing and UAT: 4 points (extensive testing, real users)
- Infrastructure and deployment: 2 points (provisioned concurrency, caching)
- Coordination and communication: 2 points (stakeholder management)

## Notes & Decisions

### Technical Decisions

- **Provisioned Concurrency**: Use 5 provisioned concurrent executions during business hours to minimize cold starts for suppliers
  - Rationale: Suppliers need fast response times, cold starts frustrating

- **Real-time Updates via WebSocket**: Continue using existing WebSocket infrastructure
  - Rationale: Works well, don't change what's working

- **File Upload Strategy**: S3 pre-signed URLs for direct upload
  - Rationale: Avoid Lambda size limits, better performance

- **Caching Strategy**: Aggressive caching for assets, minimal for dynamic content
  - Rationale: Balance performance with data freshness

- **Gradual Rollout**: Deploy to all suppliers simultaneously (no canary)
  - Rationale: Supplier base manageable size, canary adds complexity

### Open Questions
- [ ] What is the acceptable maintenance window for deployment? (Recommend 2-4am AEST for lowest traffic)
- [ ] Should we enable provisioned concurrency 24/7 or only business hours? (Recommend business hours 7am-7pm AEST)
- [ ] Do we need to notify high-value suppliers separately? (Recommend yes for top 20)
- [ ] What's the escalation path if rollback fails? (Recommend define now)

### Assumptions
- Suppliers tolerate brief performance hiccups during deployment
- WebSocket infrastructure is stable and production-ready
- File upload patterns won't change significantly
- Current monitoring is sufficient for new infrastructure
- Auth0 integration behaves identically in RR7

### Risk Assessment

**Risk Level**: Medium-High

**Key Risks**:

1. **Supplier Operations Disruption** (Medium probability, Very High impact)
   - Mitigation: Extensive testing, UAT with real suppliers, fast rollback
   - Impact: Revenue loss, supplier dissatisfaction

2. **Real-time Updates Issues** (Medium probability, High impact)
   - Mitigation: WebSocket integration tested thoroughly in staging
   - Impact: Suppliers miss important booking updates

3. **File Upload Failures** (Low probability, High impact)
   - Mitigation: Robust error handling, retry logic, tested with large files
   - Impact: Suppliers can't complete bookings

4. **Performance Degradation Under Load** (Medium probability, Medium impact)
   - Mitigation: Load testing at 150% expected peak, provisioned concurrency
   - Impact: Slow portal during peak times

5. **Authentication Issues** (Low probability, Very High impact)
   - Mitigation: Extensive auth testing, rollback plan ready
   - Impact: Suppliers locked out of portal

**Overall Risk Posture**: Acceptable with mitigation strategies in place. Higher risk than internal apps (AG-TBD-022) but lower than marketplace (AG-TBD-025).

### Success Criteria

Migration is successful if:
- ✓ Zero downtime during deployment
- ✓ Error rate < 0.1% in first week
- ✓ Performance equal to or better than Next.js
- ✓ Zero critical supplier-reported issues
- ✓ Booking completion success rate > 99.9%
- ✓ No rollback required
- ✓ Positive or neutral supplier feedback
