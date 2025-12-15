# Story: FP. SSR Migration. As a Fleet Controller, I want the fleet management portal migrated to React Router 7, so that I can manage my fleet operations with improved performance and reliability

## Story Details

**Story ID**: AG-TBD-024
**Epic**: AG-TBD-000 - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Must Have
**Story Points**: 13
**Sprint**: Sprint 11

## Description

### Summary
We're migrating the Fleet Management Portal (FleetGuru) SSR application from Next.js to React Router 7 with Lambda deployment. This is a critical B2B platform used by fleet controllers and managers to oversee vehicle fleets, manage service bookings, track compliance, monitor costs, and generate reports. The migration must be seamless with zero disruption to fleet operations.

FleetGuru serves enterprise customers managing fleets from 10 to 1000+ vehicles. Downtime or data integrity issues could disrupt business-critical operations and damage customer relationships.

### Background
The Fleet Management Portal is a premium, revenue-critical application serving corporate customers across Australia. Fleet controllers use it to:
- View and manage all fleet vehicles in one dashboard
- Schedule and track service bookings across the fleet
- Monitor compliance deadlines (rego, insurance, safety inspections)
- Track and analyze fleet costs and spending patterns
- Generate reports for management and auditing
- Approve or reject service requests from drivers
- Set fleet-wide policies and preferences

These customers pay premium fees for FleetGuru and expect enterprise-grade reliability. After successfully migrating the Supplier Portal (AG-TBD-023), we're ready to apply those learnings to this similarly complex B2B application.

### User Value
Fleet controllers benefit from improved portal performance, faster bulk operations, and more responsive data tables. The React Router 7 migration provides better handling of large datasets and sets the foundation for planned analytics enhancements.

## User Persona

**Role**: Fleet Controller / Fleet Manager
**Name**: "Sarah the Fleet Controller"
**Context**: Manages 200+ vehicle fleet from corporate office, uses portal daily for oversight and approvals
**Goals**: Efficiently monitor fleet health, approve service requests quickly, stay on top of compliance deadlines, control costs
**Pain Points**: Needs reliable data accuracy, can't afford downtime during business hours, requires fast bulk operations for large fleets

## Acceptance Criteria

### Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Fleet dashboard displays all vehicles with correct data | ☐ | ☐ | ☐ |
| 2 | Vehicle detail pages load with complete history | ☐ | ☐ | ☐ |
| 3 | Service booking approval workflow functions correctly | ☐ | ☐ | ☐ |
| 4 | Bulk approval/rejection of bookings works | ☐ | ☐ | ☐ |
| 5 | Compliance tracking displays accurate deadline warnings | ☐ | ☐ | ☐ |
| 6 | Cost reporting and analytics load correctly | ☐ | ☐ | ☐ |
| 7 | Fleet-wide policy settings save and apply properly | ☐ | ☐ | ☐ |
| 8 | Report generation (PDF, CSV exports) works correctly | ☐ | ☐ | ☐ |
| 9 | Search and filter across large vehicle lists (1000+) | ☐ | ☐ | ☐ |
| 10 | Driver management features work correctly | ☐ | ☐ | ☐ |
| 11 | Multi-fleet management (switching between fleets) works | ☐ | ☐ | ☐ |
| 12 | Email notifications send correctly for approvals | ☐ | ☐ | ☐ |
| 13 | Scheduled maintenance reminders appear correctly | ☐ | ☐ | ☐ |
| 14 | Audit log displays all user actions accurately | ☐ | ☐ | ☐ |

### Non-Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Dashboard loads within 2 seconds for 500 vehicle fleet | ☐ | ☐ | ☐ |
| 2 | Vehicle list pagination handles 1000+ vehicles smoothly | ☐ | ☐ | ☐ |
| 3 | Bulk operations process 50 items within 5 seconds | ☐ | ☐ | ☐ |
| 4 | Report generation completes within 30 seconds for 12 months data | ☐ | ☐ | ☐ |
| 5 | Lambda cold start under 2.5 seconds (p95) | ☐ | ☐ | ☐ |
| 6 | Warm Lambda response under 300ms (p95) | ☐ | ☐ | ☐ |
| 7 | Zero downtime during deployment | ☐ | ☐ | ☐ |
| 8 | Supports 200 concurrent users (peak load) | ☐ | ☐ | ☐ |
| 9 | Data accuracy 100% (zero data corruption) | ☐ | ☐ | ☐ |
| 10 | Works on Chrome, Firefox, Safari, Edge (latest 2 versions) | ☐ | ☐ | ☐ |
| 11 | Maintains SOC 2 compliance requirements | ☐ | ☐ | ☐ |

### Edge Cases

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Handle fleets with 1000+ vehicles without performance degradation | ☐ | ☐ | ☐ |
| 2 | Gracefully handle report generation timeouts for large datasets | ☐ | ☐ | ☐ |
| 3 | Manage concurrent bulk operations from multiple fleet controllers | ☐ | ☐ | ☐ |
| 4 | Handle CSV uploads with 1000+ rows (bulk vehicle imports) | ☐ | ☐ | ☐ |
| 5 | Recover from interrupted report generation | ☐ | ☐ | ☐ |
| 6 | Display appropriate errors when approval deadline passed | ☐ | ☐ | ☐ |

## Technical Implementation

### Frontend (MFE: `gdu`)

#### Application Structure
```
packages/gdu/apps/fleet-management/
├── app/
│   ├── root.tsx
│   ├── entry.server.tsx
│   ├── entry.client.tsx
│   ├── routes/
│   │   ├── _auth.tsx
│   │   ├── _auth.login.tsx
│   │   ├── _fleet.tsx                    # Fleet layout
│   │   ├── _fleet.dashboard.tsx          # Main dashboard
│   │   ├── _fleet.vehicles/
│   │   │   ├── index.tsx                 # Vehicle list (paginated)
│   │   │   ├── $id.tsx                   # Vehicle detail
│   │   │   ├── $id.history.tsx           # Service history
│   │   │   ├── $id.compliance.tsx        # Compliance status
│   │   │   └── import.tsx                # Bulk import
│   │   ├── _fleet.bookings/
│   │   │   ├── index.tsx                 # Booking approvals
│   │   │   ├── pending.tsx               # Pending approvals
│   │   │   ├── $id.tsx                   # Booking detail
│   │   │   └── bulk-approve.tsx          # Bulk operations
│   │   ├── _fleet.compliance/
│   │   │   ├── index.tsx                 # Compliance dashboard
│   │   │   ├── expiring.tsx              # Expiring items
│   │   │   └── overdue.tsx               # Overdue items
│   │   ├── _fleet.reports/
│   │   │   ├── index.tsx                 # Report center
│   │   │   ├── cost-analysis.tsx         # Cost reports
│   │   │   ├── usage.tsx                 # Usage reports
│   │   │   └── generate.tsx              # Report builder
│   │   ├── _fleet.settings/
│   │   │   ├── policies.tsx              # Fleet policies
│   │   │   ├── drivers.tsx               # Driver management
│   │   │   ├── notifications.tsx         # Notification settings
│   │   │   └── integrations.tsx          # API integrations
│   │   └── _fleet.audit.tsx              # Audit log
│   ├── components/
│   │   ├── FleetDashboard/
│   │   ├── VehicleTable/
│   │   ├── ComplianceWidget/
│   │   ├── CostChart/
│   │   ├── BulkActionBar/
│   │   └── ...
│   └── queries/
│       ├── FleetQuery.graphql
│       ├── VehiclesQuery.graphql
│       ├── BookingsQuery.graphql
│       └── ...
└── vite.config.ts
```

#### Key Implementation Patterns

**1. Fleet Dashboard Loader (Large Dataset Handling)**
```typescript
// routes/_fleet.dashboard.tsx
import { json, type LoaderFunctionArgs } from 'react-router';
import { getFleetSession } from '~/auth.server';
import { fetchFleetSummary } from '~/api/fleet';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getFleetSession(request);

  if (!session) {
    throw redirect('/login');
  }

  // Parallel data fetching for dashboard
  const [
    fleetSummary,
    pendingApprovals,
    upcomingCompliance,
    recentActivity,
    costSummary,
  ] = await Promise.all([
    fetchFleetSummary(session.fleetId),
    fetchPendingApprovals(session.fleetId, { limit: 10 }),
    fetchUpcomingCompliance(session.fleetId, { days: 30 }),
    fetchRecentActivity(session.fleetId, { limit: 20 }),
    fetchCostSummary(session.fleetId, { period: 'month' }),
  ]);

  return json({
    fleetSummary,
    pendingApprovals,
    upcomingCompliance,
    recentActivity,
    costSummary,
    fleetId: session.fleetId,
  });
}

export default function FleetDashboard() {
  const data = useLoaderData<typeof loader>();

  return (
    <Box padding="6">
      <Stack space="6">
        <Heading size="5">Fleet Dashboard</Heading>

        <Columns space="4" collapseBelow="tablet">
          <StatCard
            title="Total Vehicles"
            value={data.fleetSummary.totalVehicles}
            change={data.fleetSummary.vehicleChange}
          />
          <StatCard
            title="Pending Approvals"
            value={data.pendingApprovals.count}
            urgent={data.pendingApprovals.urgent}
          />
          <StatCard
            title="Compliance Items"
            value={data.upcomingCompliance.count}
            warning={data.upcomingCompliance.dueSoon}
          />
          <StatCard
            title="Month Spend"
            value={formatCurrency(data.costSummary.total)}
            change={data.costSummary.percentChange}
          />
        </Columns>

        <Columns space="6" collapseBelow="tablet">
          <Column width="2/3">
            <PendingApprovalsWidget bookings={data.pendingApprovals.items} />
          </Column>
          <Column width="1/3">
            <ComplianceWidget items={data.upcomingCompliance.items} />
          </Column>
        </Columns>

        <CostTrendChart data={data.costSummary.trend} />
      </Stack>
    </Box>
  );
}
```

**2. Paginated Vehicle List (Handle 1000+ Vehicles)**
```typescript
// routes/_fleet.vehicles/index.tsx
export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getFleetSession(request);
  const url = new URL(request.url);

  // Extract pagination and filter params
  const page = parseInt(url.searchParams.get('page') || '1');
  const perPage = parseInt(url.searchParams.get('perPage') || '50');
  const search = url.searchParams.get('search') || '';
  const status = url.searchParams.get('status') || 'all';
  const sortBy = url.searchParams.get('sortBy') || 'rego';
  const sortOrder = url.searchParams.get('sortOrder') || 'asc';

  const vehicles = await fetchVehicles({
    fleetId: session.fleetId,
    page,
    perPage,
    search,
    status,
    sortBy,
    sortOrder,
  });

  return json({
    vehicles: vehicles.items,
    pagination: {
      page,
      perPage,
      total: vehicles.total,
      totalPages: Math.ceil(vehicles.total / perPage),
    },
    filters: { search, status, sortBy, sortOrder },
  });
}

export default function VehiclesPage() {
  const { vehicles, pagination, filters } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const handlePageChange = (newPage: number) => {
    setSearchParams({ ...Object.fromEntries(searchParams), page: String(newPage) });
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setSearchParams({ ...Object.fromEntries(searchParams), ...newFilters, page: '1' });
  };

  return (
    <Box padding="6">
      <Stack space="4">
        <Heading size="5">Fleet Vehicles ({pagination.total})</Heading>

        <VehicleFilters
          filters={filters}
          onChange={handleFilterChange}
        />

        <VehicleTable
          vehicles={vehicles}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSort={(field) => handleFilterChange({ sortBy: field })}
        />

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </Stack>
    </Box>
  );
}
```

**3. Bulk Approval Action**
```typescript
// routes/_fleet.bookings/bulk-approve.tsx
export async function action({ request }: ActionFunctionArgs) {
  const session = await getFleetSession(request);
  const formData = await request.formData();

  const bookingIds = formData.getAll('bookingIds') as string[];
  const action = formData.get('action') as 'approve' | 'reject';
  const note = formData.get('note') as string;

  if (bookingIds.length === 0) {
    return json(
      { error: 'No bookings selected' },
      { status: 400 }
    );
  }

  if (bookingIds.length > 50) {
    return json(
      { error: 'Maximum 50 bookings can be processed at once' },
      { status: 400 }
    );
  }

  try {
    // Process bulk operation
    const results = await bulkProcessBookings({
      fleetId: session.fleetId,
      bookingIds,
      action,
      note,
      userId: session.userId,
    });

    // Log audit trail
    await logAuditEvent({
      fleetId: session.fleetId,
      userId: session.userId,
      action: `BULK_${action.toUpperCase()}`,
      details: {
        count: bookingIds.length,
        bookingIds,
        note,
      },
    });

    return json({
      success: true,
      processed: results.success.length,
      failed: results.failed.length,
      results,
    });
  } catch (error) {
    return json(
      { error: 'Bulk operation failed. Please try again.' },
      { status: 500 }
    );
  }
}

export default function BulkApprovePage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <Form method="post">
      <Stack space="4">
        <Heading size="4">Bulk Approve Bookings</Heading>

        {actionData?.error && (
          <Alert variant="critical">{actionData.error}</Alert>
        )}

        {actionData?.success && (
          <Alert variant="positive">
            Successfully processed {actionData.processed} bookings
            {actionData.failed > 0 && ` (${actionData.failed} failed)`}
          </Alert>
        )}

        <BookingSelectionTable name="bookingIds" />

        <FormikTextArea
          name="note"
          label="Approval Note (Optional)"
          placeholder="Add a note for these approvals..."
        />

        <Columns space="3">
          <Button
            type="submit"
            name="action"
            value="approve"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Approve Selected'}
          </Button>
          <Button
            type="submit"
            name="action"
            value="reject"
            variant="critical"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Reject Selected'}
          </Button>
        </Columns>
      </Stack>
    </Form>
  );
}
```

**4. Report Generation (Handle Long-Running Operations)**
```typescript
// routes/_fleet.reports/generate.tsx
export async function action({ request }: ActionFunctionArgs) {
  const session = await getFleetSession(request);
  const formData = await request.formData();

  const reportType = formData.get('reportType') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const format = formData.get('format') as 'pdf' | 'csv' | 'excel';

  try {
    // For large reports, trigger async generation
    const dateRange = getDaysBetween(startDate, endDate);

    if (dateRange > 90 || reportType === 'detailed') {
      // Async generation for large reports
      const job = await queueReportGeneration({
        fleetId: session.fleetId,
        userId: session.userId,
        reportType,
        startDate,
        endDate,
        format,
      });

      return json({
        async: true,
        jobId: job.id,
        message: 'Report generation started. You\'ll receive an email when ready.',
      });
    } else {
      // Synchronous generation for small reports
      const report = await generateReport({
        fleetId: session.fleetId,
        reportType,
        startDate,
        endDate,
        format,
      });

      return json({
        async: false,
        downloadUrl: report.url,
        expiresAt: report.expiresAt,
      });
    }
  } catch (error) {
    return json(
      { error: 'Report generation failed. Please try again.' },
      { status: 500 }
    );
  }
}

export default function GenerateReportPage() {
  const actionData = useActionData<typeof action>();

  useEffect(() => {
    // Auto-download synchronous reports
    if (actionData?.downloadUrl) {
      window.location.href = actionData.downloadUrl;
    }
  }, [actionData]);

  return (
    <Form method="post">
      <Stack space="4">
        <Heading size="4">Generate Report</Heading>

        {actionData?.message && (
          <Alert variant="info">{actionData.message}</Alert>
        )}

        <FormikSelect
          name="reportType"
          label="Report Type"
          options={reportTypeOptions}
          isRequired
        />

        <Columns space="3">
          <FormikDatePicker
            name="startDate"
            label="Start Date"
            isRequired
          />
          <FormikDatePicker
            name="endDate"
            label="End Date"
            isRequired
          />
        </Columns>

        <FormikRadioGroup
          name="format"
          label="Format"
          options={[
            { label: 'PDF', value: 'pdf' },
            { label: 'CSV', value: 'csv' },
            { label: 'Excel', value: 'excel' },
          ]}
          isRequired
        />

        <Button type="submit" variant="primary">
          Generate Report
        </Button>
      </Stack>
    </Form>
  );
}
```

**5. Compliance Tracking**
```typescript
// routes/_fleet.compliance/index.tsx
export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getFleetSession(request);
  const url = new URL(request.url);

  const filter = url.searchParams.get('filter') || 'all';

  const [compliance, expiringCount, overdueCount] = await Promise.all([
    fetchComplianceItems({
      fleetId: session.fleetId,
      filter,
    }),
    fetchExpiringCount(session.fleetId, { days: 30 }),
    fetchOverdueCount(session.fleetId),
  ]);

  return json({
    compliance,
    expiringCount,
    overdueCount,
    filter,
  });
}

export default function CompliancePage() {
  const { compliance, expiringCount, overdueCount, filter } =
    useLoaderData<typeof loader>();

  return (
    <Box padding="6">
      <Stack space="4">
        <Heading size="5">Fleet Compliance</Heading>

        <Columns space="3">
          <StatCard
            title="Expiring Soon"
            value={expiringCount}
            variant="warning"
            link="/compliance/expiring"
          />
          <StatCard
            title="Overdue"
            value={overdueCount}
            variant="critical"
            link="/compliance/overdue"
          />
        </Columns>

        <ComplianceFilters currentFilter={filter} />

        <ComplianceTable items={compliance} />
      </Stack>
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
        manualChunks: undefined,
      },
    },
  },
  ssr: {
    noExternal: ['@autoguru/overdrive', 'recharts'],
  },
});
```

### Backend (`mfe` CDK Infrastructure)

#### Lambda Configuration
```typescript
// mfe/lib/stacks/fleet-management-stack.ts
const fleetManagementFunction = new NodejsFunction(
  this,
  'FleetManagementFunction',
  {
    entry: 'dist/apps/fleet-management/server.js',
    handler: 'handler',
    runtime: Runtime.NODEJS_20_X,
    architecture: Architecture.ARM_64,
    memorySize: 2048, // Higher memory for large dataset processing
    timeout: Duration.seconds(30),
    environment: {
      NODE_ENV: 'production',
      AWS_LAMBDA_EXEC_WRAPPER: '/opt/bootstrap',
      PORT: '8080',
      SESSION_SECRET: process.env.SESSION_SECRET!,
      AUTH0_DOMAIN: process.env.AUTH0_DOMAIN!,
      AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID!,
      GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT!,
      REPORT_QUEUE_URL: reportQueue.queueUrl,
    },
    bundling: {
      minify: true,
      sourceMap: true,
      target: 'es2022',
      externalModules: ['aws-sdk'],
    },
    layers: [lambdaWebAdapterLayer],
    reservedConcurrentExecutions: 50,
  }
);

// Grant SQS permissions for async report generation
reportQueue.grantSendMessages(fleetManagementFunction);

// Provisioned concurrency during business hours
const alias = new Alias(this, 'FleetManagementAlias', {
  aliasName: 'live',
  version: fleetManagementFunction.currentVersion,
  provisionedConcurrentExecutions: 3,
});
```

#### CloudFront Configuration
```typescript
const fleetManagementDistribution = new Distribution(
  this,
  'FleetManagementDistribution',
  {
    defaultBehavior: {
      origin: new HttpOrigin(functionUrl.domainName),
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      allowedMethods: AllowedMethods.ALLOW_ALL,
      cachePolicy: new CachePolicy(this, 'FleetManagementCache', {
        cachePolicyName: 'FleetManagementSSR',
        minTtl: Duration.seconds(0),
        maxTtl: Duration.minutes(10),
        defaultTtl: Duration.minutes(1),
        cookieBehavior: CacheCookieBehavior.all(),
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
      },
      '/reports/*': {
        origin: new S3Origin(reportsBucket),
        cachePolicy: new CachePolicy(this, 'ReportsCache', {
          minTtl: Duration.hours(1),
          maxTtl: Duration.days(7),
          defaultTtl: Duration.days(1),
        }),
      },
    },
    domainNames: ['fleet.autoguru.com.au'],
    certificate: certificate,
  }
);
```

#### SQS Queue for Async Report Generation
```typescript
const reportQueue = new Queue(this, 'ReportGenerationQueue', {
  queueName: 'fleet-report-generation',
  visibilityTimeout: Duration.minutes(15),
  retentionPeriod: Duration.days(7),
  deadLetterQueue: {
    queue: new Queue(this, 'ReportGenerationDLQ'),
    maxReceiveCount: 3,
  },
});

// Lambda to process report queue
const reportProcessor = new NodejsFunction(this, 'ReportProcessor', {
  entry: 'dist/workers/report-processor.js',
  handler: 'handler',
  runtime: Runtime.NODEJS_20_X,
  timeout: Duration.minutes(15),
  memorySize: 3008,
  environment: {
    REPORTS_BUCKET: reportsBucket.bucketName,
    EMAIL_SERVICE_URL: process.env.EMAIL_SERVICE_URL!,
  },
});

reportQueue.grantConsumeMessages(reportProcessor);
reportsBucket.grantWrite(reportProcessor);

reportProcessor.addEventSource(
  new SqsEventSource(reportQueue, {
    batchSize: 1,
  })
);
```

### Integration Points

#### Auth0 Fleet Authentication
```typescript
// Multi-fleet support
export async function getFleetSession(request: Request) {
  const session = await authenticator.isAuthenticated(request);

  if (!session) {
    return null;
  }

  // Fetch fleet memberships
  const fleetMemberships = await fetchFleetMemberships(session.userId);

  // Get selected fleet from cookie or default to first
  const selectedFleetId =
    getFleetCookie(request) || fleetMemberships[0]?.fleetId;

  return {
    userId: session.userId,
    email: session.email,
    fleetId: selectedFleetId,
    fleetMemberships,
    permissions: session.permissions,
  };
}
```

#### GraphQL API Integration
- **Fleet Queries**: Dashboard data, vehicle lists, compliance status
- **Booking Mutations**: Approve/reject bookings, bulk operations
- **Reporting Queries**: Cost analysis, usage statistics
- **Audit Logging**: Track all user actions

#### SQS Integration
- **Report Queue**: Async report generation for large datasets
- **Email Notifications**: Send reports via email when complete

#### S3 Integration
- **Reports Bucket**: Store generated reports
- **Pre-signed URLs**: Download reports securely

### Monitoring and Alerting

#### CloudWatch Dashboard
```typescript
const dashboard = new Dashboard(this, 'FleetManagementDashboard', {
  dashboardName: 'FleetManagement-ReactRouter7',
  widgets: [
    [
      new SingleValueWidget({
        title: 'Active Fleet Controllers',
        metrics: [
          new Metric({
            namespace: 'FleetManagement',
            metricName: 'ActiveUsers',
            statistic: 'sum',
          }),
        ],
      }),
      new SingleValueWidget({
        title: 'Bulk Operations/Hour',
        metrics: [
          new Metric({
            namespace: 'FleetManagement',
            metricName: 'BulkOperations',
            statistic: 'sum',
            period: Duration.hours(1),
          }),
        ],
      }),
    ],
    [
      new GraphWidget({
        title: 'Lambda Performance',
        left: [
          fleetManagementFunction.metricDuration({ statistic: 'p50' }),
          fleetManagementFunction.metricDuration({ statistic: 'p95' }),
          fleetManagementFunction.metricDuration({ statistic: 'p99' }),
        ],
      }),
      new GraphWidget({
        title: 'Report Generation',
        left: [
          new Metric({
            namespace: 'FleetManagement',
            metricName: 'ReportGenerationTime',
            statistic: 'average',
          }),
        ],
      }),
    ],
    [
      new GraphWidget({
        title: 'Data Accuracy',
        left: [
          new Metric({
            namespace: 'FleetManagement',
            metricName: 'DataAccuracyChecks',
            statistic: 'average',
          }),
        ],
      }),
      new GraphWidget({
        title: 'Approval Success Rate',
        left: [
          new Metric({
            namespace: 'FleetManagement',
            metricName: 'ApprovalSuccessRate',
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
// Data integrity alarm
new Alarm(this, 'DataIntegrityIssue', {
  metric: new Metric({
    namespace: 'FleetManagement',
    metricName: 'DataIntegrityErrors',
    statistic: 'sum',
    period: Duration.minutes(5),
  }),
  threshold: 1,
  evaluationPeriods: 1,
  treatMissingData: TreatMissingData.NOT_BREACHING,
  alarmDescription: 'Data integrity issue detected in fleet management',
  actionsEnabled: true,
});

// Bulk operation failures
new Alarm(this, 'BulkOperationFailures', {
  metric: new Metric({
    namespace: 'FleetManagement',
    metricName: 'BulkOperationFailureRate',
    statistic: 'average',
    period: Duration.minutes(5),
  }),
  threshold: 0.05, // 5% failure rate
  evaluationPeriods: 2,
  alarmDescription: 'High bulk operation failure rate',
});

// Report generation failures
new Alarm(this, 'ReportGenerationFailures', {
  metric: reportProcessor.metricErrors({
    period: Duration.minutes(15),
  }),
  threshold: 3,
  evaluationPeriods: 1,
  alarmDescription: 'Multiple report generation failures',
});
```

## UI/UX Specifications

### Design References
- **Figma**: Existing Fleet Management designs
- **Status**: Pixel-perfect migration, no design changes
- **Visual Regression**: Percy tests on all pages

### Critical User Flows

#### 1. Dashboard Overview
```
Login → Dashboard loads with:
  - Fleet summary stats
  - Pending approvals (top 10)
  - Compliance warnings
  - Cost summary
Expected load time: < 2 seconds
```

#### 2. Bulk Approve Bookings
```
Dashboard → Pending Bookings → Select Multiple → Bulk Approve → Confirm → Success
Expected time: < 1 minute for 50 bookings
Bulk operation: < 5 seconds
```

#### 3. Generate Cost Report
```
Reports → Cost Analysis → Select Date Range → Generate → Download/Email
Small reports (< 90 days): Immediate download
Large reports: Email when ready (< 5 minutes)
```

#### 4. Compliance Check
```
Dashboard → Compliance → View Expiring Items → Click Vehicle → View Details → Schedule Service
Expected flow time: < 2 minutes
All pages: < 1 second load
```

## Test Scenarios

### Functional Testing

#### Happy Paths
1. **Fleet Dashboard**
   - Fleet controller logs in
   - Dashboard loads with all widgets
   - Stats display correctly
   - Quick actions work

2. **Bulk Approve Bookings**
   - Navigate to pending bookings
   - Select 25 bookings
   - Click "Approve Selected"
   - Confirmation message appears
   - Bookings move to approved
   - Email notifications sent

3. **Generate Report**
   - Navigate to Reports
   - Select "Cost Analysis"
   - Choose date range (last month)
   - Generate PDF
   - Download starts automatically

4. **Compliance Tracking**
   - Navigate to Compliance
   - View expiring items (next 30 days)
   - Click on vehicle with expiring rego
   - View compliance details
   - Schedule renewal service

#### Error Scenarios

1. **Data Integrity**
   - Simulate vehicle data mismatch
   - System detects inconsistency
   - Alert displayed to user
   - Admin notified
   - Audit log entry created

2. **Bulk Operation Failure**
   - Submit bulk approval with 1 invalid booking
   - 49 succeed, 1 fails
   - Success message shows counts
   - Failed booking details displayed
   - User can retry failed item

3. **Report Generation Timeout**
   - Request very large report (12 months, all vehicles)
   - Lambda approaches timeout
   - System queues for async processing
   - User receives message
   - Email sent when complete

4. **Concurrent Updates**
   - Two controllers update same booking
   - Optimistic locking detects conflict
   - Second user sees conflict message
   - User can reload and retry

### Performance Testing

#### Load Test - Business Hours Peak
```yaml
Scenario: Business Hours Peak (10am AEST)
  Users: 100 concurrent fleet controllers
  Duration: 30 minutes
  Actions:
    - View dashboard: 40%
    - View vehicle list: 25%
    - Approve bookings: 15%
    - View reports: 10%
    - Update compliance: 5%
    - Bulk operations: 5%

  Success Criteria:
    - Response time p95 < 2 seconds
    - Error rate < 0.05%
    - Bulk operations < 5 seconds
    - Data accuracy 100%
```

#### Stress Test - Large Fleet
```yaml
Scenario: Large Fleet (1000+ Vehicles)
  Fleet size: 1000 vehicles
  Actions:
    - Load vehicle list (paginated)
    - Search vehicles
    - Filter by status
    - Sort by various fields
    - Generate fleet-wide report

  Success Criteria:
    - Vehicle list loads < 3 seconds
    - Pagination smooth (< 500ms)
    - Search results < 1 second
    - Report generation queues if > 2 minutes
```

### Data Integrity Testing

#### Critical Data Validation
- [ ] Vehicle counts match across all views
- [ ] Cost totals sum correctly
- [ ] Compliance dates accurate
- [ ] Booking statuses consistent
- [ ] Audit log complete and accurate
- [ ] No duplicate bookings after bulk operations
- [ ] No data loss during migrations

### User Acceptance Testing (UAT)

#### UAT Participants
- 5 fleet controllers from different companies
- 1 large fleet (500+ vehicles)
- 1 medium fleet (100-500 vehicles)
- 3 small fleets (10-100 vehicles)

#### UAT Checklist
- [ ] All participants can log in and see correct fleet
- [ ] Dashboard displays accurate data for each fleet
- [ ] Bulk operations work for all fleet sizes
- [ ] Reports generate correctly
- [ ] No performance issues with large fleets
- [ ] Mobile/tablet usage validated
- [ ] Positive feedback from majority
- [ ] No data accuracy issues reported

## Rollback Plan

### Pre-Deployment Preparation
- [ ] Next.js version tagged as `fleet-management-nextjs-stable`
- [ ] Full database backup completed
- [ ] CloudFront configuration exported
- [ ] Lambda function ARN documented
- [ ] DNS records documented
- [ ] Rollback procedure tested in staging
- [ ] Data integrity validation scripts ready
- [ ] Communication templates prepared

### Rollback Triggers

**Immediate Rollback**:
- Data integrity error detected
- Bulk operation failure rate > 5%
- Report generation completely failing
- Authentication issues affecting > 10% of users
- Error rate > 0.5% for 5 minutes
- Response time p95 > 10 seconds for 10 minutes
- Critical feature non-functional
- Customer escalation

**Consider Rollback**:
- Error rate 0.1-0.5% for 15 minutes
- Performance degradation complaints from 2+ customers
- Bulk operations slower than Next.js baseline
- Report generation slower than baseline

### Rollback Procedure

```bash
#!/bin/bash
# fleet-management-rollback.sh

set -e

echo "🚨 INITIATING FLEET MANAGEMENT ROLLBACK"
echo "Reason: $ROLLBACK_REASON"

# 1. Verify data integrity before rollback
echo "🔍 Checking data integrity..."
npm run validate-data-integrity

# 2. Switch CloudFront origin to Next.js Lambda
echo "📝 Updating CloudFront distribution..."
aws cloudfront update-distribution \
  --id $FLEET_MGMT_DISTRIBUTION_ID \
  --distribution-config file://nextjs-distribution-config.json

# 3. Create invalidation
echo "🗑️  Creating CloudFront invalidation..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id $FLEET_MGMT_DISTRIBUTION_ID \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)

echo "⏳ Waiting for invalidation..."
aws cloudfront wait invalidation-completed \
  --distribution-id $FLEET_MGMT_DISTRIBUTION_ID \
  --id $INVALIDATION_ID

# 4. Verify Next.js serving
echo "✅ Verifying Next.js deployment..."
for i in {1..5}; do
  RESPONSE=$(curl -I https://fleet.autoguru.com.au)
  if echo "$RESPONSE" | grep -q "200 OK"; then
    echo "✅ Check $i: Success"
  else
    echo "❌ Check $i: Failed"
    exit 1
  fi
  sleep 2
done

# 5. Run data integrity check post-rollback
echo "🔍 Post-rollback data integrity check..."
npm run validate-data-integrity

# 6. Notify stakeholders
echo "📢 Notifying stakeholders..."
slack-notify "#fleet-team" "🚨 Fleet Management Portal rolled back to Next.js. Reason: $ROLLBACK_REASON"
slack-notify "#engineering" "🚨 Fleet Management rollback completed. All hands meeting in 15 minutes."
slack-notify "#leadership" "🚨 Fleet Management Portal issue - rolled back successfully. Customers not impacted. Details: $ROLLBACK_REASON"

# 7. Create high-priority incident
echo "📋 Creating incident..."
create-incident "Fleet Management RR7 Rollback" "critical" --assignee="$ONCALL_ENGINEER"

# 8. Send customer communication if needed
if [ "$CUSTOMER_IMPACT" = "true" ]; then
  echo "📧 Sending customer notifications..."
  send-customer-notification fleet-controllers "service-disruption-resolved.html"
fi

echo "✅ ROLLBACK COMPLETE"
echo "Next steps:"
echo "1. Root cause analysis (start immediately)"
echo "2. Customer impact assessment"
echo "3. All hands meeting: $(date -d '+15 minutes')"
```

**Expected Rollback Time**: 5-10 minutes
**Validation Time**: 10 minutes (including data integrity)
**Total Recovery Time**: 15-20 minutes

## Communication Plan

### Pre-Migration Communication

#### Internal Team (1 Week Before)
**Audience**: Engineering, Product, Fleet team, Support
**Channel**: Slack (#fleet-team, #engineering), Email
**Message**:
```
Fleet Management Portal Migration - React Router 7
Deployment: [DATE] at [TIME]

What's happening:
- Migrating FleetGuru to new infrastructure
- Zero downtime deployment planned
- All features work identically
- Performance improvements expected
- Data integrity safeguards in place

Deployment window: [START] - [END] (off-peak hours)
Rollback plan: Ready within 15 minutes

Monitoring:
- War room: Zoom link
- Support: Monitor #fleet-support
- On-call: [NAMES] available

Critical success metrics:
- Data accuracy 100%
- Bulk operations success rate > 99%
- Zero customer escalations

Questions? #platform-team
```

#### Customer Communication (5 Days Before)
**Audience**: All fleet controllers
**Channel**: Email, in-app notification
**Message**:
```
Subject: FleetGuru Performance Enhancement - [DATE]

Hi [Fleet Name],

We're upgrading FleetGuru on [DATE] to deliver faster performance and improved reliability for managing your fleet.

What to expect:
✓ Faster dashboard loading
✓ Quicker bulk approvals
✓ More responsive vehicle lists
✓ Improved report generation
✓ All existing features work identically

When: [DATE] at [TIME] (low-traffic period)
Impact: None expected - portal remains available
Duration: Seamless migration

Your data is fully protected with comprehensive backups and safeguards.

If you notice anything unusual after [DATE], please contact support immediately at fleet-support@autoguru.com.au or 1800-XXX-XXX.

Thank you for trusting AutoGuru with your fleet management.

Best regards,
The AutoGuru FleetGuru Team
```

#### High-Value Customer Communication (5 Days Before)
**Audience**: Top 10 fleet customers (500+ vehicles)
**Channel**: Direct email from Account Manager
**Message**:
```
Subject: Important: FleetGuru System Enhancement - [DATE]

Hi [Customer Name],

I wanted to personally inform you about an important system enhancement to FleetGuru happening on [DATE].

We're upgrading our infrastructure to deliver:
- Faster performance for large fleets like yours
- More responsive bulk operations
- Improved handling of complex reports
- Enhanced reliability

Details:
- Date: [DATE]
- Time: [TIME] (selected for minimal impact)
- Expected impact: None
- Your data: Fully protected with enterprise-grade backups

Our team will be monitoring closely throughout the migration. You have my direct number ([PHONE]) if you notice any issues.

I'll follow up with you after the migration to ensure everything is running smoothly.

Best regards,
[Account Manager Name]
Fleet Account Manager
```

### During Deployment

#### War Room Updates (Every 10 Minutes)
**Audience**: Engineering team in war room
**Channel**: Slack (#war-room), Zoom
**Format**:
```
[TIME] Fleet Management Migration Update

Status: [Stage]
Progress: [X]% complete

Current metrics:
  - Error rate: X%
  - Response time p95: Xms
  - Active users: X
  - Data integrity checks: ✓ Passed

Recent actions:
  - [Action 1]
  - [Action 2]

Issues: [None | Description]
Next: [Next step]

ETA: [Time]
```

### Post-Deployment Communication

#### Immediate Success (Within 30 Minutes)
**Audience**: Engineering, Product, Fleet team
**Channel**: Slack
```
✅ Fleet Management Migration COMPLETE

Status: Successful
Duration: [X] minutes
Issues: None
Rollbacks: 0

Current metrics:
  - Error rate: 0%
  - Response time p95: 280ms (45% faster than Next.js!)
  - Active users: 23
  - Bulk operation success: 100%
  - Data integrity: ✓ Validated

Monitoring: Continuing for 48 hours
Next check-in: [TIME]

War room: Dissolved
On-call: Available as normal

Great work, team! 🎉
```

#### 24 Hour Update (To Customers)
**Audience**: All fleet controllers
**Channel**: In-app notification, email
**Message**:
```
Subject: FleetGuru Enhancement Complete ✓

Hi [Fleet Name],

Great news! The FleetGuru enhancement is complete and running smoothly.

What's improved:
✓ 45% faster dashboard loading
✓ Bulk approvals 60% quicker
✓ Reports generate faster
✓ Overall smoother experience

Everything is working perfectly, and your data is 100% accurate and secure.

Enjoying the improvements? We'd love to hear your feedback: fleet-feedback@autoguru.com.au

Thank you for your patience and trust.

Best regards,
The AutoGuru FleetGuru Team
```

#### 1 Week Summary
**Audience**: Leadership, all teams
**Channel**: Email, Confluence
```
Fleet Management RR7 Migration - Week 1 Summary

Status: Highly Successful ✓

Reliability:
- Uptime: 100%
- Zero rollbacks
- Zero customer issues
- Zero data integrity errors

Performance improvements:
- Dashboard load: 2.8s → 1.5s (46% faster)
- Bulk operations: 8.2s → 3.1s (62% faster)
- Vehicle list: 1.9s → 0.8s (58% faster)
- Report generation: 42s → 28s (33% faster)

Business metrics:
- 1,247 bulk approvals processed (100% success)
- 456 reports generated
- 89 fleet controllers active
- Customer satisfaction: No negative feedback

Customer feedback highlights:
- "Much faster than before!" - ABC Transport
- "Bulk approvals are so much quicker" - XYZ Logistics
- "Loving the performance" - Fleet Services Pty Ltd

Lessons learned: [Link to retrospective]
Metrics dashboard: [Link]

Next migration: Marketplace (Sprint 11-12) - highest risk
```

## Definition of Done

### Development Complete
- [ ] All routes migrated to React Router 7
- [ ] All loaders implement data fetching
- [ ] All actions handle operations
- [ ] Pagination working for large datasets (1000+ items)
- [ ] Bulk operations functional (up to 50 items)
- [ ] Report generation (sync and async) working
- [ ] Compliance tracking accurate
- [ ] Multi-fleet switching works
- [ ] Audit logging captures all actions
- [ ] Authentication via Auth0 working
- [ ] Unit tests passing (>85% coverage)
- [ ] Integration tests passing
- [ ] Code reviewed and approved

### Testing Complete
- [ ] All acceptance criteria verified
- [ ] Manual testing of all features
- [ ] Large fleet testing (1000+ vehicles)
- [ ] Bulk operations tested (50 items)
- [ ] Report generation tested (all types)
- [ ] Data integrity validated
- [ ] Concurrent operation testing
- [ ] Performance testing (load, stress)
- [ ] Cross-browser testing
- [ ] Accessibility testing (WCAG AA)
- [ ] UAT with 5 real customers
- [ ] Visual regression tests passing
- [ ] No critical bugs

### Security & Compliance Complete
- [ ] Security review completed
- [ ] SOC 2 compliance validated
- [ ] Data encryption verified
- [ ] Audit logging comprehensive
- [ ] Access controls validated
- [ ] HTTPS enforced
- [ ] Session management secure

### Data Integrity Complete
- [ ] Data validation scripts created
- [ ] Pre-migration integrity check passed
- [ ] Post-migration integrity check passed
- [ ] Backup and restore tested
- [ ] No data loss scenarios
- [ ] Concurrent update handling tested
- [ ] Audit trail complete

### Deployment Complete
- [ ] Deployed to dev (tested 2 days)
- [ ] Deployed to staging (tested 7 days)
- [ ] UAT completed in staging
- [ ] Performance benchmarks met
- [ ] Data integrity validated in staging
- [ ] Deployed to production
- [ ] CloudFront configured
- [ ] DNS verified
- [ ] SSL certificates valid
- [ ] Monitoring dashboards live
- [ ] Alarms configured and tested
- [ ] 48-hour monitoring completed
- [ ] 1-week monitoring completed

### Documentation Complete
- [ ] Migration guide documented
- [ ] API changes documented
- [ ] Deployment procedure documented
- [ ] Rollback procedure documented (including data integrity)
- [ ] Monitoring runbook created
- [ ] Troubleshooting guide created
- [ ] Support team briefed
- [ ] Customer communication sent

## Dependencies

### Blocked By
- AG-TBD-023: Supplier Portal migration (lessons learned applied)
- AG-TBD-022: Internal apps migration
- AG-TBD-015: Lambda Web Adapter
- AG-TBD-016: CDK infrastructure

### Blocks
- AG-TBD-025: Marketplace migration (waiting for final B2B validation)

### Related Stories
- AG-TBD-018: Parallel run strategy
- AG-TBD-019: Feature flags
- AG-TBD-026: Performance optimization
- AG-TBD-027: Documentation

## Story Points Justification

**Complexity Factors**:

- **Frontend Complexity**: Very High
  - Complex data tables with large datasets (1000+ rows)
  - Pagination, sorting, filtering for performance
  - Bulk operations (50 items at once)
  - Async report generation workflows
  - Multi-fleet management
  - Compliance tracking logic
  - Estimated: 5-6 days

- **Backend Complexity**: High
  - Lambda with higher memory for large datasets
  - SQS integration for async jobs
  - S3 integration for report storage
  - Complex data integrity requirements
  - Estimated: 3-4 days

- **Testing Effort**: Very High
  - Large fleet testing scenarios
  - Bulk operation testing
  - Data integrity validation critical
  - UAT with real customers essential
  - Performance testing with realistic data volumes
  - Estimated: 5-6 days

- **Coordination Effort**: High
  - Customer communication required
  - Account manager coordination for high-value customers
  - Support team training on new infrastructure
  - Estimated: 2 days

- **Integration Points**: 8
  - Auth0 (multi-fleet)
  - GraphQL API (fleet, vehicles, bookings, compliance, reports)
  - SQS (async reports)
  - S3 (report storage)
  - CloudFront + Lambda
  - Email service (notifications)
  - CloudWatch monitoring
  - X-Ray tracing

- **Unknown Factors**:
  - Performance with very large fleets (1000+)
  - Bulk operation concurrency issues
  - Report generation edge cases
  - Customer-specific workflows

**Total Points**: 13

**Breakdown**:
- Application migration: 6 points (complex features, large datasets, bulk ops)
- Testing and UAT: 4 points (data integrity critical, real customers)
- Infrastructure: 2 points (async processing, report storage)
- Coordination: 1 point (customer communication)

## Notes & Decisions

### Technical Decisions

- **Higher Lambda Memory (2048MB)**: Handle large dataset queries efficiently
  - Rationale: Fleet controllers may query 1000+ vehicles, need memory for processing

- **Async Report Generation**: Queue reports > 90 days or "detailed" type
  - Rationale: Avoid Lambda timeouts, better UX for long reports

- **Provisioned Concurrency (3)**: Balance cost vs cold start reduction
  - Rationale: Lower usage than supplier portal, but need responsive experience

- **Data Integrity Validation**: Pre and post-migration automated checks
  - Rationale: Enterprise customers require 100% data accuracy

- **Aggressive Caching for Reports**: Cache generated reports for 1-7 days
  - Rationale: Reports rarely change, reduce regeneration cost

### Open Questions
- [ ] Should we increase provisioned concurrency for the first week? (Recommend yes, 5 concurrent)
- [ ] Do we need a data migration plan for existing reports? (Recommend yes if reports stored in DB)
- [ ] Should we contact all customers or just high-value? (Recommend all get email, high-value get call)
- [ ] What's the largest fleet size to test with? (Recommend 1500 vehicles)
- [ ] Should we enable blue/green deployment? (Recommend no, adds complexity, rollback is fast)

### Assumptions
- Fleet controllers tolerate brief performance hiccups during off-peak deployment
- SQS and async report generation infrastructure is stable
- Current data integrity is 100% in Next.js version
- Large fleet customers won't generate reports during deployment window
- Auth0 handles multi-fleet membership correctly

### Risk Assessment

**Risk Level**: Medium-High

**Key Risks**:

1. **Data Integrity Issues** (Low probability, CRITICAL impact)
   - Mitigation: Automated validation, comprehensive backups, immediate rollback
   - Impact: Customer data corrupted, business disruption, reputation damage

2. **Large Fleet Performance Issues** (Medium probability, High impact)
   - Mitigation: Load testing with 1500 vehicle fleet, provisioned concurrency
   - Impact: Slow portal for largest customers

3. **Bulk Operation Failures** (Medium probability, High impact)
   - Mitigation: Transaction-safe bulk ops, detailed error messages, retry capability
   - Impact: Controllers can't approve bookings efficiently

4. **Report Generation Failures** (Medium probability, Medium impact)
   - Mitigation: Async generation, SQS DLQ, error notifications
   - Impact: Controllers can't access reports for management

5. **Customer Escalations** (Low probability, Very High impact)
   - Mitigation: Extensive UAT, customer communication, fast rollback
   - Impact: Account cancellations, revenue loss

**Overall Risk Posture**: Acceptable with comprehensive mitigation. Higher risk than supplier portal due to larger customers and data criticality. Lower risk than marketplace due to smaller user base.

### Success Criteria

Migration is successful if:
- ✓ Zero data integrity errors
- ✓ Zero downtime
- ✓ Error rate < 0.05% in first week
- ✓ Performance equal to or better than Next.js (ideally 20%+ faster)
- ✓ Bulk operations 100% reliable
- ✓ Report generation success rate > 99%
- ✓ Zero customer escalations
- ✓ Positive customer feedback
- ✓ No rollback required
