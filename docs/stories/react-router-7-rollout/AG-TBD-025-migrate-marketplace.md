# Story: B2C. SSR Migration. As a Consumer, I want the marketplace migrated to React Router 7, so that I can discover and book automotive services with the best performance and SEO

## Story Details

**Story ID**: AG-TBD-025
**Epic**: AG-TBD-000 - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Must Have
**Story Points**: 21
**Sprint**: Sprint 11-12 (2 sprints)

## Description

### Summary
We're migrating the AutoGuru B2C Marketplace SSR application from Next.js to React Router 7 with Lambda deployment. This is our highest-risk, highest-visibility migration - the main consumer-facing application that drives the majority of AutoGuru's revenue. The marketplace serves hundreds of thousands of Australian consumers searching for and booking automotive services.

This migration requires exceptional care, extensive testing, gradual rollout, 24/7 monitoring, and immediate rollback capability. SEO performance is critical as organic search drives significant traffic. Any degradation in search rankings, page performance, or booking conversion could impact revenue.

### Background
The AutoGuru Marketplace is the flagship B2C application where consumers:
- Search for automotive services by location and service type
- Compare quotes from multiple suppliers
- Read reviews and ratings
- Book services online with instant confirmation
- Make payments and manage bookings
- Leave reviews after service completion

The marketplace handles:
- 100,000+ monthly visitors
- 10,000+ monthly bookings
- Peak traffic: 1,000+ concurrent users
- Critical SEO performance (drives 60% of traffic)
- Complex booking funnel with multiple steps
- Payment processing integration
- Real-time availability and pricing

After successfully migrating internal apps (AG-TBD-022), supplier portal (AG-TBD-023), and fleet management (AG-TBD-024), we've validated our RR7 infrastructure and learned valuable lessons. Now we're ready for the highest-stakes migration with proven playbooks and confidence.

### User Value
Consumers benefit from significantly improved page load speeds, better mobile performance, and enhanced SEO that helps them discover AutoGuru services. The React Router 7 migration provides the foundation for planned enhancements like progressive web app (PWA) capabilities and offline-first booking.

## User Persona

**Role**: Consumer / Car Owner
**Name**: "Mark the Melbourne Driver"
**Context**: Needs brake service for his 2018 Toyota Camry, searches Google, finds AutoGuru, books online
**Goals**: Find trustworthy mechanic quickly, get fair pricing, book online conveniently, avoid phone calls
**Pain Points**: Needs fast website on mobile (often searching on phone), requires clear pricing, wants quick booking process, expects instant confirmation

## Acceptance Criteria

### Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Homepage loads with featured services and search | ☐ | ☐ | ☐ |
| 2 | Service search by location and service type works | ☐ | ☐ | ☐ |
| 3 | Search results display with accurate pricing and availability | ☐ | ☐ | ☐ |
| 4 | Supplier profile pages load with reviews and ratings | ☐ | ☐ | ☐ |
| 5 | Quote request flow works end-to-end | ☐ | ☐ | ☐ |
| 6 | Instant booking flow works end-to-end | ☐ | ☐ | ☐ |
| 7 | Payment processing integrates correctly (Stripe) | ☐ | ☐ | ☐ |
| 8 | Booking confirmation displays and emails correctly | ☐ | ☐ | ☐ |
| 9 | User account dashboard shows bookings and history | ☐ | ☐ | ☐ |
| 10 | Review submission and display works correctly | ☐ | ☐ | ☐ |
| 11 | Service category pages load correctly | ☐ | ☐ | ☐ |
| 12 | Location pages load with local suppliers | ☐ | ☐ | ☐ |
| 13 | Blog/content pages render correctly | ☐ | ☐ | ☐ |
| 14 | Mobile responsive design works perfectly | ☐ | ☐ | ☐ |
| 15 | All analytics tracking fires correctly | ☐ | ☐ | ☐ |
| 16 | All conversion pixels fire correctly (Google, Facebook) | ☐ | ☐ | ☐ |

### SEO Requirements (CRITICAL)

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Meta tags (title, description) identical or improved | ☐ | ☐ | ☐ |
| 2 | Structured data (schema.org) renders correctly | ☐ | ☐ | ☐ |
| 3 | OpenGraph tags for social sharing correct | ☐ | ☐ | ☐ |
| 4 | Canonical URLs set correctly | ☐ | ☐ | ☐ |
| 5 | Robots.txt and sitemap.xml serve correctly | ☐ | ☐ | ☐ |
| 6 | SSR HTML includes full content (not client-rendered) | ☐ | ☐ | ☐ |
| 7 | Page speed scores equal or better (Lighthouse 90+) | ☐ | ☐ | ☐ |
| 8 | Core Web Vitals meet Google standards | ☐ | ☐ | ☐ |
| 9 | Internal linking structure preserved | ☐ | ☐ | ☐ |
| 10 | No broken links or 404 errors | ☐ | ☐ | ☐ |

### Non-Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Homepage loads within 1.5 seconds (p95) | ☐ | ☐ | ☐ |
| 2 | Search results load within 2 seconds (p95) | ☐ | ☐ | ☐ |
| 3 | Booking flow completes within 3 minutes (p95) | ☐ | ☐ | ☐ |
| 4 | Lambda cold start under 2 seconds (p95) | ☐ | ☐ | ☐ |
| 5 | Warm Lambda response under 200ms (p95) | ☐ | ☐ | ☐ |
| 6 | Zero downtime during deployment | ☐ | ☐ | ☐ |
| 7 | Supports 1,000 concurrent users (peak load) | ☐ | ☐ | ☐ |
| 8 | Booking conversion rate maintained or improved | ☐ | ☐ | ☐ |
| 9 | Payment success rate > 99.5% | ☐ | ☐ | ☐ |
| 10 | Error rate < 0.01% | ☐ | ☐ | ☐ |
| 11 | Mobile performance score 90+ (Lighthouse) | ☐ | ☐ | ☐ |
| 12 | Desktop performance score 95+ (Lighthouse) | ☐ | ☐ | ☐ |

### Edge Cases

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Handle payment processing failures gracefully | ☐ | ☐ | ☐ |
| 2 | Manage double-booking prevention | ☐ | ☐ | ☐ |
| 3 | Handle supplier availability changes during booking | ☐ | ☐ | ☐ |
| 4 | Gracefully degrade when external APIs timeout | ☐ | ☐ | ☐ |
| 5 | Recover from interrupted booking flows | ☐ | ☐ | ☐ |
| 6 | Handle high traffic spikes (2x normal load) | ☐ | ☐ | ☐ |

## Technical Implementation

### Frontend (MFE: `gdu`)

#### Application Structure
```
packages/gdu/apps/marketplace/
├── app/
│   ├── root.tsx
│   ├── entry.server.tsx
│   ├── entry.client.tsx
│   ├── routes/
│   │   ├── _index.tsx                      # Homepage
│   │   ├── _auth/
│   │   │   ├── login.tsx
│   │   │   ├── signup.tsx
│   │   │   └── forgot-password.tsx
│   │   ├── search/
│   │   │   ├── index.tsx                   # Search landing
│   │   │   ├── results.tsx                 # Search results
│   │   │   └── $serviceType.$location.tsx  # Dynamic search
│   │   ├── services/
│   │   │   ├── $slug.tsx                   # Service category
│   │   │   └── $slug.$location.tsx         # Service + location
│   │   ├── suppliers/
│   │   │   └── $slug.tsx                   # Supplier profile
│   │   ├── booking/
│   │   │   ├── quote.tsx                   # Request quote
│   │   │   ├── instant.tsx                 # Instant booking
│   │   │   ├── details.tsx                 # Booking details
│   │   │   ├── payment.tsx                 # Payment
│   │   │   └── confirmation.tsx            # Confirmation
│   │   ├── account/
│   │   │   ├── index.tsx                   # Dashboard
│   │   │   ├── bookings.tsx                # My bookings
│   │   │   ├── bookings.$id.tsx            # Booking detail
│   │   │   ├── reviews.tsx                 # My reviews
│   │   │   ├── vehicles.tsx                # My vehicles
│   │   │   └── settings.tsx                # Account settings
│   │   ├── locations/
│   │   │   └── $state.$suburb.tsx          # Location pages
│   │   └── blog/
│   │       ├── index.tsx                   # Blog home
│   │       └── $slug.tsx                   # Blog post
│   ├── components/
│   │   ├── SearchForm/
│   │   ├── SupplierCard/
│   │   ├── BookingFlow/
│   │   ├── PaymentForm/
│   │   ├── ReviewWidget/
│   │   └── ...
│   └── queries/
│       ├── SearchQuery.graphql
│       ├── SupplierQuery.graphql
│       ├── BookingMutation.graphql
│       └── ...
└── vite.config.ts
```

#### Critical Implementation Patterns

**1. Homepage Loader (SEO Optimized)**
```typescript
// routes/_index.tsx
import { json, type LoaderFunctionArgs, type MetaFunction } from 'react-router';
import { fetchFeaturedServices, fetchPopularLocations } from '~/api/marketplace';

export const meta: MetaFunction = () => {
  return [
    { title: 'AutoGuru - Compare & Book Automotive Services Online' },
    {
      name: 'description',
      content:
        'Find and book trusted mechanics, mobile services, and automotive specialists across Australia. Compare quotes, read reviews, and book online in minutes.',
    },
    { property: 'og:title', content: 'AutoGuru - Book Automotive Services' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://www.autoguru.com.au' },
    { property: 'og:image', content: 'https://www.autoguru.com.au/og-image.jpg' },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  // Parallel data fetching for optimal performance
  const [featuredServices, popularLocations, testimonials] = await Promise.all([
    fetchFeaturedServices({ limit: 8 }),
    fetchPopularLocations({ limit: 12 }),
    fetchTestimonials({ limit: 6 }),
  ]);

  return json(
    {
      featuredServices,
      popularLocations,
      testimonials,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=3600', // Cache for 5min client, 1hr CDN
      },
    }
  );
}

export default function Homepage() {
  const { featuredServices, popularLocations, testimonials } =
    useLoaderData<typeof loader>();

  return (
    <Box>
      <HeroSection />
      <SearchForm />

      <Section padding="8">
        <Stack space="6">
          <Heading size="5">Popular Services</Heading>
          <Columns space="4" collapseBelow="tablet">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </Columns>
        </Stack>
      </Section>

      <Section backgroundColor="neutral" padding="8">
        <Stack space="6">
          <Heading size="5">Find Services Near You</Heading>
          <LocationGrid locations={popularLocations} />
        </Stack>
      </Section>

      <Section padding="8">
        <Stack space="6">
          <Heading size="5">What Our Customers Say</Heading>
          <TestimonialCarousel testimonials={testimonials} />
        </Stack>
      </Section>

      <CTASection />
    </Box>
  );
}
```

**2. Search Results (Performance Critical)**
```typescript
// routes/search/results.tsx
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const serviceType = url.searchParams.get('service');
  const location = url.searchParams.get('location');
  const page = parseInt(url.searchParams.get('page') || '1');
  const sortBy = url.searchParams.get('sortBy') || 'relevance';

  // Input validation
  if (!serviceType || !location) {
    throw redirect('/');
  }

  // Fetch search results
  const results = await searchSuppliers({
    serviceType,
    location,
    page,
    sortBy,
    perPage: 20,
  });

  // SEO: Generate dynamic meta tags
  const title = `${serviceType} in ${location} | Compare & Book | AutoGuru`;
  const description = `Find trusted ${serviceType} services in ${location}. Compare quotes, read reviews, and book online. ${results.total} suppliers available.`;

  return json(
    {
      results: results.items,
      total: results.total,
      page,
      serviceType,
      location,
      sortBy,
      meta: { title, description },
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300',
      },
    }
  );
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];

  return [
    { title: data.meta.title },
    { name: 'description', content: data.meta.description },
    { property: 'og:title', content: data.meta.title },
    { property: 'og:description', content: data.meta.description },
  ];
};

export default function SearchResults() {
  const { results, total, page, serviceType, location, sortBy } =
    useLoaderData<typeof loader>();

  return (
    <Box padding="6">
      <Stack space="6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Search', href: '/search' },
            { label: `${serviceType} in ${location}` },
          ]}
        />

        <Heading size="5">
          {serviceType} in {location}
        </Heading>

        <Text>{total} suppliers available</Text>

        <Columns space="6" collapseBelow="tablet">
          <Column width="1/4">
            <SearchFilters serviceType={serviceType} location={location} />
          </Column>

          <Column width="3/4">
            <Stack space="4">
              <SortControls currentSort={sortBy} />

              {results.map((supplier) => (
                <SupplierCard key={supplier.id} supplier={supplier} />
              ))}

              <Pagination currentPage={page} total={total} perPage={20} />
            </Stack>
          </Column>
        </Columns>
      </Stack>
    </Box>
  );
}
```

**3. Supplier Profile (Rich SEO)**
```typescript
// routes/suppliers/$slug.tsx
export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params;

  const supplier = await fetchSupplier(slug);

  if (!supplier) {
    throw new Response('Not Found', { status: 404 });
  }

  // Fetch additional data in parallel
  const [reviews, services, availability] = await Promise.all([
    fetchSupplierReviews(supplier.id, { limit: 10 }),
    fetchSupplierServices(supplier.id),
    fetchSupplierAvailability(supplier.id, { days: 7 }),
  ]);

  return json(
    {
      supplier,
      reviews,
      services,
      availability,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=1800',
      },
    }
  );
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];

  const { supplier } = data;

  return [
    { title: `${supplier.name} - ${supplier.suburb} | AutoGuru` },
    {
      name: 'description',
      content: `${supplier.name} in ${supplier.suburb}. ${supplier.rating} stars from ${supplier.reviewCount} reviews. Book online today.`,
    },
    { property: 'og:title', content: supplier.name },
    { property: 'og:type', content: 'business.business' },
    { property: 'og:url', content: `https://www.autoguru.com.au/suppliers/${supplier.slug}` },
    { property: 'og:image', content: supplier.logo },
    // Structured data for Google
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'AutoRepair',
        name: supplier.name,
        address: {
          '@type': 'PostalAddress',
          streetAddress: supplier.address,
          addressLocality: supplier.suburb,
          addressRegion: supplier.state,
          postalCode: supplier.postcode,
          addressCountry: 'AU',
        },
        telephone: supplier.phone,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: supplier.rating,
          reviewCount: supplier.reviewCount,
        },
      },
    },
  ];
};

export default function SupplierProfile() {
  const { supplier, reviews, services, availability } =
    useLoaderData<typeof loader>();

  return (
    <Box padding="6">
      <Stack space="6">
        <SupplierHeader supplier={supplier} />

        <Columns space="6" collapseBelow="tablet">
          <Column width="2/3">
            <Stack space="6">
              <AboutSection description={supplier.description} />
              <ServicesSection services={services} />
              <ReviewsSection reviews={reviews} rating={supplier.rating} />
            </Stack>
          </Column>

          <Column width="1/3">
            <Stack space="4">
              <BookingWidget supplierId={supplier.id} availability={availability} />
              <ContactCard supplier={supplier} />
              <LocationMap address={supplier.address} />
            </Stack>
          </Column>
        </Columns>
      </Stack>
    </Box>
  );
}
```

**4. Booking Flow with Payment**
```typescript
// routes/booking/payment.tsx
export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getUserSession(request);

  if (!session) {
    throw redirect('/login?returnTo=/booking/payment');
  }

  // Retrieve booking from session
  const bookingData = await getBookingFromSession(request);

  if (!bookingData) {
    throw redirect('/');
  }

  // Create Stripe payment intent
  const paymentIntent = await createPaymentIntent({
    amount: bookingData.total,
    currency: 'aud',
    metadata: {
      bookingId: bookingData.id,
      userId: session.userId,
    },
  });

  return json({
    bookingData,
    clientSecret: paymentIntent.clientSecret,
    stripePublicKey: process.env.STRIPE_PUBLIC_KEY!,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getUserSession(request);
  const formData = await request.formData();

  const paymentIntentId = formData.get('paymentIntentId') as string;
  const bookingData = await getBookingFromSession(request);

  try {
    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return json(
        { error: 'Payment not completed. Please try again.' },
        { status: 400 }
      );
    }

    // Create booking
    const booking = await createBooking({
      ...bookingData,
      userId: session.userId,
      paymentIntentId,
      status: 'confirmed',
    });

    // Send confirmation emails
    await Promise.all([
      sendBookingConfirmationToCustomer(booking),
      sendBookingNotificationToSupplier(booking),
    ]);

    // Track conversion
    await trackConversion({
      userId: session.userId,
      bookingId: booking.id,
      amount: bookingData.total,
      source: 'marketplace',
    });

    // Clear booking session
    await clearBookingSession(request);

    return redirect(`/booking/confirmation?id=${booking.id}`);
  } catch (error) {
    console.error('Booking creation failed:', error);

    return json(
      { error: 'Booking failed. Please contact support.' },
      { status: 500 }
    );
  }
}

export default function BookingPayment() {
  const { bookingData, clientSecret, stripePublicKey } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <Box padding="6">
      <Stack space="6">
        <Heading size="5">Complete Your Booking</Heading>

        {actionData?.error && (
          <Alert variant="critical">{actionData.error}</Alert>
        )}

        <Columns space="6" collapseBelow="tablet">
          <Column width="2/3">
            <StripePaymentForm
              clientSecret={clientSecret}
              publicKey={stripePublicKey}
            />
          </Column>

          <Column width="1/3">
            <BookingSummary booking={bookingData} />
          </Column>
        </Columns>
      </Stack>
    </Box>
  );
}
```

**5. Service Category Page (SEO Focused)**
```typescript
// routes/services/$slug.tsx
export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params;

  const service = await fetchService(slug);

  if (!service) {
    throw new Response('Not Found', { status: 404 });
  }

  const [popularLocations, relatedServices, faqs] = await Promise.all([
    fetchPopularLocationsForService(service.id),
    fetchRelatedServices(service.id),
    fetchServiceFAQs(service.id),
  ]);

  return json(
    {
      service,
      popularLocations,
      relatedServices,
      faqs,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400', // Cache heavily
      },
    }
  );
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];

  const { service } = data;

  return [
    { title: `${service.name} | Compare & Book Online | AutoGuru` },
    {
      name: 'description',
      content: service.metaDescription,
    },
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.name,
        description: service.description,
        provider: {
          '@type': 'Organization',
          name: 'AutoGuru',
        },
      },
    },
  ];
};

export default function ServicePage() {
  const { service, popularLocations, relatedServices, faqs } =
    useLoaderData<typeof loader>();

  return (
    <Box>
      <HeroSection service={service} />

      <Section padding="8">
        <Stack space="6">
          <RichTextContent content={service.description} />

          <Heading size="4">Find {service.name} Near You</Heading>
          <LocationGrid locations={popularLocations} service={service} />

          <Heading size="4">Related Services</Heading>
          <ServiceGrid services={relatedServices} />

          <Heading size="4">Frequently Asked Questions</Heading>
          <FAQAccordion faqs={faqs} />
        </Stack>
      </Section>
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
      prerender: [
        // Prerender static pages for best SEO
        '/',
        '/services',
        '/locations',
        '/about',
        '/how-it-works',
      ],
    }),
    tsconfigPaths(),
  ],
  build: {
    target: 'es2022',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
      },
    },
    rollupOptions: {
      output: {
        manualChunks: undefined, // Single bundle for Lambda
      },
    },
  },
  ssr: {
    noExternal: ['@autoguru/overdrive', 'react-stripe-js'],
  },
});
```

### Backend (`mfe` CDK Infrastructure)

#### Lambda Configuration (High Performance)
```typescript
// mfe/lib/stacks/marketplace-stack.ts
const marketplaceFunction = new NodejsFunction(this, 'MarketplaceFunction', {
  entry: 'dist/apps/marketplace/server.js',
  handler: 'handler',
  runtime: Runtime.NODEJS_20_X,
  architecture: Architecture.ARM_64,
  memorySize: 2048, // High memory for optimal cold starts
  timeout: Duration.seconds(30),
  environment: {
    NODE_ENV: 'production',
    AWS_LAMBDA_EXEC_WRAPPER: '/opt/bootstrap',
    PORT: '8080',
    SESSION_SECRET: process.env.SESSION_SECRET!,
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN!,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID!,
    GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT!,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
    STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY!,
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID!,
  },
  bundling: {
    minify: true,
    sourceMap: true,
    target: 'es2022',
    externalModules: ['aws-sdk'],
    nodeModules: ['stripe'], // Include Stripe SDK
  },
  layers: [lambdaWebAdapterLayer],
  reservedConcurrentExecutions: 200, // Higher for marketplace
});

// Provisioned concurrency for zero cold starts
const alias = new Alias(this, 'MarketplaceAlias', {
  aliasName: 'live',
  version: marketplaceFunction.currentVersion,
  provisionedConcurrentExecutions: 10, // Always warm
});

// Auto-scaling for provisioned concurrency
const target = alias.addAutoScaling({
  minCapacity: 10,
  maxCapacity: 50,
});

target.scaleOnUtilization({
  utilizationTarget: 0.7,
});
```

#### CloudFront Distribution (Optimized for SEO and Performance)
```typescript
const marketplaceDistribution = new Distribution(this, 'MarketplaceDistribution', {
  defaultBehavior: {
    origin: new HttpOrigin(functionUrl.domainName),
    viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    allowedMethods: AllowedMethods.ALLOW_ALL,
    cachePolicy: new CachePolicy(this, 'MarketplaceSSRCache', {
      cachePolicyName: 'MarketplaceSSR',
      minTtl: Duration.seconds(0),
      maxTtl: Duration.hours(24),
      defaultTtl: Duration.minutes(5),
      cookieBehavior: CacheCookieBehavior.allowList('session', 'auth'), // Only essential cookies
      headerBehavior: CacheHeaderBehavior.allowList(
        'Accept',
        'Accept-Language',
        'CloudFront-Viewer-Country'
      ),
      queryStringBehavior: CacheQueryStringBehavior.all(),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
    }),
    originRequestPolicy: OriginRequestPolicy.ALL_VIEWER,
    responseHeadersPolicy: new ResponseHeadersPolicy(this, 'MarketplaceHeaders', {
      securityHeadersBehavior: {
        contentTypeOptions: { override: true },
        frameOptions: { frameOption: HeadersFrameOption.DENY, override: true },
        strictTransportSecurity: {
          accessControlMaxAge: Duration.days(365),
          includeSubdomains: true,
          override: true,
        },
        xssProtection: { protection: true, modeBlock: true, override: true },
      },
    }),
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
      responseHeadersPolicy: new ResponseHeadersPolicy(this, 'AssetsHeaders', {
        customHeadersBehavior: {
          customHeaders: [
            {
              header: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
              override: true,
            },
          ],
        },
      }),
    },
    '/images/*': {
      origin: new S3Origin(imagesBucket),
      cachePolicy: CachePolicy.CACHING_OPTIMIZED,
    },
  },
  domainNames: ['www.autoguru.com.au', 'autoguru.com.au'],
  certificate: certificate,
  httpVersion: HttpVersion.HTTP2_AND_3,
  priceClass: PriceClass.PRICE_CLASS_ALL, // Global distribution
  enableLogging: true,
  logBucket: logsBucket,
  logFilePrefix: 'marketplace/',
});

// Apex domain redirect (autoguru.com.au -> www.autoguru.com.au)
new CloudFrontFunction(this, 'ApexRedirect', {
  code: CloudFrontFunctionCode.fromInline(`
    function handler(event) {
      var request = event.request;
      var host = request.headers.host.value;

      if (host === 'autoguru.com.au') {
        return {
          statusCode: 301,
          statusDescription: 'Moved Permanently',
          headers: {
            location: { value: 'https://www.autoguru.com.au' + request.uri }
          }
        };
      }

      return request;
    }
  `),
});
```

### Integration Points

#### Stripe Payment Processing
```typescript
// Payment intent creation
export async function createPaymentIntent(params: {
  amount: number;
  currency: string;
  metadata: Record<string, string>;
}) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  return stripe.paymentIntents.create({
    amount: params.amount * 100, // Convert to cents
    currency: params.currency,
    metadata: params.metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });
}
```

#### GraphQL API Integration
- **Search Queries**: Supplier search, service search, location search
- **Booking Mutations**: Create booking, update booking, cancel booking
- **User Queries**: Account details, booking history, vehicles
- **Review Mutations**: Submit review, update review
- **Analytics Events**: Track page views, conversions, user behavior

#### Google Analytics & Tag Manager
```typescript
// app/root.tsx
export default function Root() {
  useEffect(() => {
    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.GOOGLE_ANALYTICS_ID!);
    }
  }, []);

  return (
    <>
      <GoogleTagManager gtmId={process.env.GTM_ID!} />
      <Outlet />
    </>
  );
}
```

#### Facebook Pixel & Conversion Tracking
```typescript
// Track booking conversion
export async function trackConversion(data: {
  userId: string;
  bookingId: string;
  amount: number;
  source: string;
}) {
  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value: data.amount,
      currency: 'AUD',
      content_ids: [data.bookingId],
    });
  }

  // Google Ads Conversion
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: process.env.GOOGLE_ADS_CONVERSION_ID!,
      value: data.amount,
      currency: 'AUD',
      transaction_id: data.bookingId,
    });
  }
}
```

### Monitoring and Alerting

#### CloudWatch Dashboard
```typescript
const dashboard = new Dashboard(this, 'MarketplaceDashboard', {
  dashboardName: 'Marketplace-ReactRouter7-Production',
  widgets: [
    [
      new SingleValueWidget({
        title: 'Current Traffic (req/min)',
        metrics: [
          marketplaceFunction.metricInvocations({
            statistic: 'sum',
            period: Duration.minutes(1),
          }),
        ],
      }),
      new SingleValueWidget({
        title: 'Booking Conversion Rate',
        metrics: [
          new Metric({
            namespace: 'Marketplace',
            metricName: 'BookingConversionRate',
            statistic: 'average',
            period: Duration.hours(1),
          }),
        ],
      }),
      new SingleValueWidget({
        title: 'Revenue (Last Hour)',
        metrics: [
          new Metric({
            namespace: 'Marketplace',
            metricName: 'Revenue',
            statistic: 'sum',
            period: Duration.hours(1),
          }),
        ],
      }),
    ],
    [
      new GraphWidget({
        title: 'Response Time (p50, p95, p99)',
        left: [
          marketplaceFunction.metricDuration({ statistic: 'p50' }),
          marketplaceFunction.metricDuration({ statistic: 'p95' }),
          marketplaceFunction.metricDuration({ statistic: 'p99' }),
        ],
      }),
      new GraphWidget({
        title: 'Error Rate',
        left: [
          marketplaceFunction.metricErrors({ statistic: 'sum' }),
        ],
      }),
    ],
    [
      new GraphWidget({
        title: 'Booking Funnel',
        left: [
          new Metric({
            namespace: 'Marketplace',
            metricName: 'SearchViews',
            statistic: 'sum',
          }),
          new Metric({
            namespace: 'Marketplace',
            metricName: 'SupplierViews',
            statistic: 'sum',
          }),
          new Metric({
            namespace: 'Marketplace',
            metricName: 'BookingStarted',
            statistic: 'sum',
          }),
          new Metric({
            namespace: 'Marketplace',
            metricName: 'BookingCompleted',
            statistic: 'sum',
          }),
        ],
      }),
      new GraphWidget({
        title: 'Payment Success Rate',
        left: [
          new Metric({
            namespace: 'Marketplace',
            metricName: 'PaymentSuccessRate',
            statistic: 'average',
          }),
        ],
      }),
    ],
    [
      new GraphWidget({
        title: 'Lambda Provisioned Concurrency',
        left: [
          alias.metric('ProvisionedConcurrentExecutions'),
          alias.metric('ProvisionedConcurrencyUtilization'),
        ],
      }),
      new GraphWidget({
        title: 'CloudFront Cache Hit Rate',
        left: [
          marketplaceDistribution.metricCacheHitRate(),
        ],
      }),
    ],
  ],
});
```

#### Critical Business Alarms
```typescript
// Revenue drop alarm
new Alarm(this, 'RevenueDrop', {
  metric: new Metric({
    namespace: 'Marketplace',
    metricName: 'Revenue',
    statistic: 'sum',
    period: Duration.hours(1),
  }),
  threshold: 1000, // Alert if hourly revenue < $1000
  evaluationPeriods: 2,
  comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
  treatMissingData: TreatMissingData.BREACHING,
  alarmDescription: 'Marketplace revenue drop detected - CRITICAL',
  actionsEnabled: true,
});

// Booking conversion drop
new Alarm(this, 'ConversionRateDrop', {
  metric: new Metric({
    namespace: 'Marketplace',
    metricName: 'BookingConversionRate',
    statistic: 'average',
    period: Duration.hours(1),
  }),
  threshold: 0.05, // Alert if conversion < 5%
  evaluationPeriods: 2,
  comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
  alarmDescription: 'Booking conversion rate drop - investigate immediately',
});

// Payment failure rate
new Alarm(this, 'PaymentFailureRate', {
  metric: new Metric({
    namespace: 'Marketplace',
    metricName: 'PaymentFailureRate',
    statistic: 'average',
    period: Duration.minutes(5),
  }),
  threshold: 0.01, // Alert if > 1% payment failures
  evaluationPeriods: 3,
  alarmDescription: 'High payment failure rate detected',
});

// SEO: Response time alarm
new Alarm(this, 'SlowPageLoads', {
  metric: marketplaceFunction.metricDuration({
    statistic: 'p95',
    period: Duration.minutes(5),
  }),
  threshold: 2000, // Alert if p95 > 2 seconds
  evaluationPeriods: 3,
  alarmDescription: 'Slow page loads - may impact SEO',
});
```

## Gradual Rollout Strategy (Canary Deployment)

### Phase 1: 1% Traffic (Hour 0-2)
```typescript
// Lambda alias with weighted routing
const canaryAlias = new Alias(this, 'MarketplaceCanary', {
  aliasName: 'canary',
  version: newVersion,
  provisionedConcurrentExecutions: 1,
});

// Route 1% to canary, 99% to stable
const distributionConfig = {
  origins: [
    {
      id: 'canary',
      domainName: canaryAlias.functionUrl,
      weight: 1,
    },
    {
      id: 'stable',
      domainName: stableAlias.functionUrl,
      weight: 99,
    },
  ],
};
```

**Success Criteria for 1%**:
- Error rate < 0.01%
- Response time within 10% of baseline
- Zero payment failures
- No negative customer feedback
- Booking conversion rate maintained

**Monitoring**: Every 5 minutes
**Duration**: 2 hours

### Phase 2: 10% Traffic (Hour 2-6)
If Phase 1 successful, increase to 10% traffic.

**Success Criteria for 10%**:
- Error rate < 0.01%
- Response time equal to or better than baseline
- Payment success rate > 99.5%
- Booking conversion rate maintained or improved
- No SEO ranking drops (monitor Google Search Console)

**Monitoring**: Every 15 minutes
**Duration**: 4 hours

### Phase 3: 50% Traffic (Hour 6-12)
If Phase 2 successful, increase to 50% traffic.

**Success Criteria for 50%**:
- All Phase 2 criteria maintained
- Sufficient data to compare RR7 vs Next.js side-by-side
- No customer escalations

**Monitoring**: Every 30 minutes
**Duration**: 6 hours

### Phase 4: 100% Traffic (Hour 12+)
If Phase 3 successful, route 100% traffic to RR7.

**Intensive Monitoring**: 24 hours
**Continued Monitoring**: 7 days
**Next.js Decommission**: After 2 weeks of successful operation

## UI/UX Specifications

### Design References
- **Figma**: Existing Marketplace designs
- **Status**: Pixel-perfect migration
- **Visual Regression**: Percy tests on 50+ key pages

### Critical User Flows

#### 1. Homepage to Booking (Happy Path)
```
Homepage → Search → Results → Supplier Profile → Book → Details → Payment → Confirmation
Expected time: 3-5 minutes
Each page: < 2 seconds
Payment: < 3 seconds
Total: < 5 minutes for average user
```

#### 2. SEO Landing to Booking
```
Google Search → Service Category Page → Search Results → Supplier → Book → Complete
Expected: Seamless, no layout shift, fast load times
First Contentful Paint: < 1 second
Time to Interactive: < 2 seconds
```

#### 3. Mobile Booking Flow
```
Mobile Search → Results (scroll) → Supplier (tap to call or book) → Book → Pay → Done
Expected: Touch-optimized, fast on 4G
Mobile Lighthouse score: 90+
```

## Test Scenarios

### Functional Testing

#### Happy Paths
1. **Search and Book**
   - User searches for "Brake Repair in Melbourne"
   - Results load with 20 suppliers
   - User clicks top supplier
   - User books service
   - User completes payment
   - Booking confirmed

2. **Account Management**
   - User logs in
   - Views booking history
   - Clicks on past booking
   - Leaves review
   - Review appears on supplier profile

3. **Quote Request**
   - User requests quote for service
   - Form submits successfully
   - Suppliers notified
   - User receives email confirmation

#### Error Scenarios
1. **Payment Failure**
   - User reaches payment page
   - Card declined
   - Clear error message shown
   - User can retry with different card
   - No duplicate bookings created

2. **Booking Conflict**
   - User selects time slot
   - Slot becomes unavailable during booking
   - User notified of conflict
   - Alternative times offered

3. **Session Timeout**
   - User starts booking
   - Session expires during payment
   - User redirected to login
   - Booking state preserved
   - User can resume after login

### Performance Testing

#### Load Test - Peak Traffic
```yaml
Scenario: Saturday Morning Peak
  Users: 1,000 concurrent
  Duration: 1 hour
  Actions:
    - Homepage visit: 30%
    - Search: 25%
    - Supplier profile: 20%
    - Start booking: 15%
    - Complete booking: 10%

  Success Criteria:
    - Response time p95 < 2 seconds
    - Error rate < 0.01%
    - Booking success rate > 99.5%
    - Payment success rate > 99.5%
    - No Lambda throttling
    - Provisioned concurrency scales appropriately
```

#### Stress Test - Black Friday
```yaml
Scenario: Promotional Peak (2x normal traffic)
  Users: 2,000 concurrent
  Duration: 30 minutes
  Ramp up: 0 to 2000 over 10 minutes

  Success Criteria:
    - System remains stable
    - Auto-scaling responds appropriately
    - Response times degrade gracefully (< 3s p95)
    - No errors or downtime
    - All bookings processed successfully
```

### SEO Testing

#### Pre-Deployment SEO Audit
- [ ] All meta tags identical or improved
- [ ] Structured data validates (Google Rich Results Test)
- [ ] Page speed scores meet targets (Lighthouse 90+)
- [ ] Core Web Vitals pass (PageSpeed Insights)
- [ ] Mobile-friendly test passes
- [ ] All internal links work
- [ ] Sitemap generates correctly
- [ ] Robots.txt serves correctly

#### Post-Deployment SEO Monitoring
- [ ] Google Search Console - no index errors
- [ ] Google Search Console - impressions maintained
- [ ] Google Search Console - click-through rate maintained
- [ ] Google Analytics - organic traffic maintained
- [ ] Google Analytics - bounce rate maintained or improved
- [ ] Rankings monitored for top 100 keywords (no drops)

### Conversion Testing

#### Booking Funnel Metrics
| Stage | Next.js Baseline | RR7 Target | Actual |
|-------|------------------|------------|--------|
| Search Views | 10,000/day | 10,000+ | ___ |
| Supplier Views | 3,000/day | 3,000+ | ___ |
| Booking Started | 800/day | 800+ | ___ |
| Booking Completed | 400/day | 400+ | ___ |
| Conversion Rate | 4% | 4%+ | ___ |

#### Revenue Impact
- Daily revenue maintained or increased
- Average order value maintained
- Payment success rate > 99.5%

## Rollback Plan

### Pre-Deployment Preparation
- [ ] Next.js version tagged as `marketplace-nextjs-stable-final`
- [ ] Full production database backup
- [ ] CloudFront configuration exported and version-controlled
- [ ] Lambda function ARNs documented
- [ ] DNS records documented
- [ ] Rollback tested in staging (< 5 min recovery)
- [ ] Canary deployment automation tested
- [ ] Communication templates ready
- [ ] War room scheduled
- [ ] On-call team briefed and available

### Rollback Triggers

**Immediate Rollback (Stop canary deployment)**:
- Revenue drop > 10% compared to same time previous week
- Booking conversion drop > 20%
- Payment failure rate > 1%
- Error rate > 0.1%
- Response time p95 > 5 seconds for 10 minutes
- SEO: Significant ranking drops detected
- Customer complaints > 5 in 1 hour
- Leadership directive

**Consider Rollback**:
- Error rate 0.01-0.1% for 30 minutes
- Booking conversion drop 10-20%
- Response time degradation but < 5s
- Minor customer complaints (1-5)

### Instant Rollback Procedure

```bash
#!/bin/bash
# marketplace-instant-rollback.sh

set -e

echo "🚨 MARKETPLACE EMERGENCY ROLLBACK INITIATED"
echo "Reason: $ROLLBACK_REASON"
echo "Initiated by: $OPERATOR_NAME"

# Alert leadership immediately
slack-notify "#leadership" "@channel 🚨 MARKETPLACE ROLLBACK IN PROGRESS - $ROLLBACK_REASON"
slack-notify "#war-room" "@channel 🚨 Executing marketplace rollback NOW"

# 1. Canary: Route all traffic to stable Next.js version
echo "⚡ Switching CloudFront to Next.js (100% traffic)..."
aws cloudfront update-distribution \
  --id $MARKETPLACE_DISTRIBUTION_ID \
  --distribution-config file://nextjs-stable-config.json \
  --if-match $ETAG

# 2. Invalidate CloudFront cache (all paths)
echo "🗑️  Invalidating CloudFront cache..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id $MARKETPLACE_DISTRIBUTION_ID \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)

echo "⏳ Waiting for invalidation (this is critical)..."
aws cloudfront wait invalidation-completed \
  --distribution-id $MARKETPLACE_DISTRIBUTION_ID \
  --id $INVALIDATION_ID \
  --max-attempts 30

# 3. Verify Next.js serving correctly (multiple checks)
echo "✅ Verifying Next.js restoration..."
SUCCESS_COUNT=0
for i in {1..10}; do
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://www.autoguru.com.au)
  if [ "$RESPONSE" = "200" ]; then
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    echo "✅ Check $i/$10: Success (HTTP $RESPONSE)"
  else
    echo "❌ Check $i/10: Failed (HTTP $RESPONSE)"
  fi
  sleep 2
done

if [ $SUCCESS_COUNT -lt 8 ]; then
  echo "❌ ROLLBACK VERIFICATION FAILED - ESCALATE IMMEDIATELY"
  slack-notify "#war-room" "@channel ❌ MARKETPLACE ROLLBACK FAILED - ALL HANDS"
  exit 1
fi

# 4. Verify booking flow working
echo "🔍 Testing booking flow..."
npm run test:smoke:production

# 5. Check revenue stream
echo "💰 Verifying revenue metrics..."
RECENT_BOOKINGS=$(aws cloudwatch get-metric-statistics \
  --namespace Marketplace \
  --metric-name BookingCompleted \
  --start-time $(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum \
  --query 'Datapoints[0].Sum' \
  --output text)

echo "Recent bookings: $RECENT_BOOKINGS"

# 6. Update status page
echo "📢 Updating status page..."
update-status-page "investigating" "Marketplace migration rollback in progress"

# 7. Notify stakeholders
echo "📧 Notifying stakeholders..."
slack-notify "#engineering" "✅ Marketplace rolled back to Next.js successfully. Next.js serving all traffic."
slack-notify "#product" "ℹ️  Marketplace migration rolled back. Investigating issues. No customer impact."
slack-notify "#support" "ℹ️  Marketplace rolled back preventively. System operating normally on Next.js."

# 8. Create incident
echo "📋 Creating incident..."
INCIDENT_ID=$(create-incident \
  "Marketplace RR7 Migration Rollback" \
  "critical" \
  --assignee "$ONCALL_LEAD" \
  --description "$ROLLBACK_REASON")

echo "Incident created: $INCIDENT_ID"

# 9. Schedule post-mortem
echo "📅 Scheduling post-mortem..."
schedule-meeting "Marketplace Rollback Post-Mortem" \
  --attendees "engineering-leads,product-leads,cto" \
  --time "+4 hours"

echo ""
echo "✅ ROLLBACK COMPLETE - Next.js serving all traffic"
echo "🔍 Next steps:"
echo "   1. Join war room immediately"
echo "   2. Review metrics and logs"
echo "   3. Root cause analysis"
echo "   4. Customer impact assessment"
echo "   5. Post-mortem in 4 hours"
echo ""
echo "Recovery time: $SECONDS seconds"
```

**Expected Rollback Time**: 3-5 minutes
**Verification Time**: 5-10 minutes
**Total Recovery Time**: 8-15 minutes

## Communication Plan

### Pre-Migration Communication

#### Internal - All Hands Meeting (1 Week Before)
**Audience**: Entire company
**Format**: Company-wide meeting
**Key Messages**:
- Marketplace migration is our most critical technical initiative
- Extensive testing and preparation completed
- Gradual rollout minimizes risk
- Everyone's role during migration
- How to report issues

#### Internal - War Room Setup (2 Days Before)
**Participants**: Engineering leads, Product leads, CTO, Support lead, On-call engineers
**Communication Channels**:
- Zoom war room (always on during deployment)
- Slack #war-room (dedicated channel)
- SMS/Phone for escalations
- Status dashboard (real-time metrics)

#### Internal - Engineering Team (1 Day Before)
**Message**:
```
Marketplace Migration - Final Briefing

Tomorrow: The Big One 🚀

Timeline:
- 02:00 AEST: Deployment begins
- 02:00-04:00: Canary 1% traffic
- 04:00-08:00: Canary 10% traffic (if green)
- 08:00-14:00: Canary 50% traffic (if green)
- 14:00+: 100% traffic (if green)

War room: [Zoom Link]
Slack: #war-room
Runbooks: [Link]

Who's doing what:
- Deployment: [Names]
- Monitoring: [Names]
- On-call: [Names]
- Customer comms: [Names]
- Leadership updates: [Names]

Rollback procedure tested ✓
Monitoring dashboards ready ✓
Team briefed ✓

Let's ship this carefully and confidently 💪

Questions? Ask in #war-room
```

#### External - SEO Community (3 Days Before)
**Audience**: SEO team, external SEO consultants
**Message**: Brief on migration, monitoring plan for rankings, rollback triggers

### During Deployment

#### War Room Updates (Every 15 Minutes During Canary)
```
[TIME] Marketplace Canary Update - [X]% Traffic

Status: [Phase] - [GREEN/YELLOW/RED]

Canary Traffic: X%
Current metrics:
  ✓ Traffic: X req/min
  ✓ Error rate: 0.00%
  ✓ Response time p95: Xms
  ✓ Booking conversions: X (on pace)
  ✓ Revenue: $X (tracking normally)
  ✓ Payment success: 100%

Compared to baseline (Next.js):
  Response time: -15% faster ⬆️
  Error rate: Equal ✓
  Conversions: +2% ⬆️

Issues: None
Decision: Proceed to next phase ✓

Next: Increase to X% at [TIME]
```

#### Incident Updates (If Issues Arise)
```
⚠️  CANARY YELLOW - Monitoring Closely

Issue: [Description]
Impact: [X% of canary traffic]
Severity: [Low/Medium]
Action: Holding at current traffic %

Investigating: [Team/Person]
ETA: [Time]

Rollback threshold: [Metric/Value]
Rollback ready: YES ✓
```

### Post-Deployment Communication

#### Hour 24 - Internal
```
✅ Marketplace Migration - 24 Hour Update

Status: 100% traffic on RR7 ✓
Rollbacks: 0
Issues: None

Performance vs Next.js:
  ⬆️  Response time: 22% faster
  ⬆️  Page load: 18% faster
  ⬆️  Conversion rate: +1.2%
  ✓  Revenue: On target
  ✓  SEO: Rankings stable
  ✓  Payments: 99.8% success

Customer feedback: Positive
Support tickets: 0 related

Continuing 24/7 monitoring.
Next check-in: 48 hours

Excellent work, team! 🎉
```

#### Week 1 - Leadership & Board
```
Marketplace React Router 7 Migration - Week 1 Summary

Executive Summary:
✅ Highly successful migration with zero customer impact
✅ Performance significantly improved across all metrics
✅ Revenue and conversions exceeding baseline
✅ SEO rankings maintained (zero impact)
✅ Zero downtime, zero rollbacks

Performance Improvements:
- Page load time: 2.1s → 1.5s (28% faster)
- Time to interactive: 3.2s → 2.1s (34% faster)
- Lambda cold starts: Eliminated with provisioned concurrency
- CloudFront cache hit rate: 82% (excellent)

Business Impact:
- Bookings: 2,847 (vs 2,801 previous week, +1.6%)
- Revenue: $284,700 (vs $279,200, +2.0%)
- Conversion rate: 4.2% (vs 4.1%, +0.1pp)
- Customer satisfaction: No degradation

SEO Performance:
- Organic traffic: Stable (52,341 sessions)
- Rankings: 98% stable, 2% improved
- Core Web Vitals: All passing
- Lighthouse scores: 95+ (desktop), 92+ (mobile)

Technical Excellence:
- Deployment executed flawlessly using canary strategy
- Monitoring and rollback procedures validated
- Team coordination exemplary
- Documentation comprehensive

Next Steps:
- Continue monitoring for 2 weeks
- Optimize bundle size (10% reduction possible)
- Decommission Next.js infrastructure (Sprint 13)
- Apply learnings to remaining migrations

Congratulations to the entire team on this exceptional execution.
```

#### Week 1 - SEO Community
```
Subject: Marketplace Migration Complete - SEO Update

Hi team,

Great news! The marketplace migration to React Router 7 is complete and SEO performance is excellent.

Results after 1 week:
✓ Rankings: 98% stable, 2% improved
✓ Organic traffic: Maintained (no drop)
✓ Core Web Vitals: All passing
✓ Page speed: Significantly improved
✓ Structured data: Validated and rendering
✓ Indexation: No issues

Next monitoring:
- Daily ranking checks (next 2 weeks)
- Weekly traffic analysis
- Monthly comprehensive review

No action required from SEO team. System performing optimally.

Thanks for the collaboration!
```

## Definition of Done

### Development Complete
- [ ] All routes migrated to React Router 7
- [ ] All meta tags and SEO elements verified
- [ ] Structured data implemented correctly
- [ ] Payment integration working (Stripe)
- [ ] Analytics integration working (GA, GTM, FB Pixel)
- [ ] Booking flow end-to-end functional
- [ ] Account management functional
- [ ] Review system functional
- [ ] Mobile responsive verified
- [ ] Unit tests passing (>85% coverage)
- [ ] Integration tests passing
- [ ] E2E tests passing (Playwright)
- [ ] Code reviewed and approved

### SEO Complete
- [ ] Meta tags identical or improved
- [ ] Structured data validated (Google Rich Results)
- [ ] Page speed scores meet targets (90+)
- [ ] Core Web Vitals passing
- [ ] Mobile-friendly test passing
- [ ] Sitemap generating correctly
- [ ] Robots.txt serving correctly
- [ ] Canonical URLs correct
- [ ] Internal linking preserved
- [ ] No broken links detected

### Testing Complete
- [ ] All acceptance criteria verified
- [ ] Manual testing of all user flows
- [ ] Booking flow tested (50+ scenarios)
- [ ] Payment testing (multiple cards, failures)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile testing (iOS, Android, multiple devices)
- [ ] Accessibility testing (WCAG AA, keyboard nav)
- [ ] Performance testing (load test 1000 concurrent)
- [ ] Stress testing (2000 concurrent)
- [ ] Visual regression testing (Percy - 50+ pages)
- [ ] SEO testing (Lighthouse, PageSpeed Insights)
- [ ] No critical or high-priority bugs

### Security & Compliance Complete
- [ ] Security review completed
- [ ] Payment PCI compliance verified
- [ ] Data encryption verified
- [ ] Session management secure
- [ ] HTTPS enforced everywhere
- [ ] Security headers configured
- [ ] No sensitive data in logs
- [ ] Stripe integration audited

### Deployment Complete
- [ ] Deployed to dev (tested 3 days)
- [ ] Deployed to staging (tested 10 days)
- [ ] Performance benchmarks met in staging
- [ ] SEO validation passed in staging
- [ ] Canary deployment 1% (2 hours, successful)
- [ ] Canary deployment 10% (4 hours, successful)
- [ ] Canary deployment 50% (6 hours, successful)
- [ ] Full deployment 100%
- [ ] CloudFront configured optimally
- [ ] DNS verified
- [ ] SSL certificates valid
- [ ] Monitoring dashboards live
- [ ] Business metric alarms configured
- [ ] 24-hour intensive monitoring completed
- [ ] 7-day monitoring completed
- [ ] SEO rankings monitored (no drops)

### Documentation Complete
- [ ] Migration playbook documented
- [ ] Deployment procedure documented
- [ ] Rollback procedure documented and tested
- [ ] Monitoring runbook created
- [ ] Troubleshooting guide created
- [ ] SEO monitoring guide created
- [ ] Support team briefed
- [ ] War room procedures documented
- [ ] Post-mortem completed (if issues)
- [ ] Lessons learned documented

## Dependencies

### Blocked By
- AG-TBD-024: Fleet Management migration (final B2B validation)
- AG-TBD-023: Supplier Portal migration (B2B patterns validated)
- AG-TBD-022: Internal apps migration (infrastructure proven)
- AG-TBD-015: Lambda Web Adapter integration
- AG-TBD-016: CDK infrastructure for RR7
- AG-TBD-019: Feature flags (for canary deployment)

### Blocks
- AG-TBD-026: Final optimization (waiting for marketplace performance data)
- AG-TBD-028: Webpack deprecation (can't deprecate until marketplace migrated)

### Related Stories
- AG-TBD-018: Parallel run strategy (canary deployment)
- AG-TBD-027: Documentation and training

## Story Points Justification

**Complexity Factors**:

- **Frontend Complexity**: Very High
  - Large application with 50+ routes
  - Complex booking funnel (multi-step)
  - Payment integration (Stripe)
  - SEO optimization critical (meta tags, structured data)
  - Analytics integration (GA, GTM, FB Pixel)
  - Mobile optimization crucial
  - Review system
  - Account management
  - Estimated: 8-10 days

- **Backend Complexity**: High
  - High-performance Lambda configuration
  - Provisioned concurrency with auto-scaling
  - CloudFront optimization for SEO and performance
  - Stripe payment integration
  - Complex caching strategy
  - Estimated: 4-5 days

- **Testing Effort**: Extremely High
  - Comprehensive functional testing (all user flows)
  - SEO testing and validation (critical)
  - Performance testing (1000+ concurrent users)
  - Payment testing (multiple scenarios)
  - Visual regression (50+ pages)
  - Cross-browser testing
  - Mobile device testing
  - Conversion tracking validation
  - Estimated: 8-10 days

- **Coordination Effort**: Very High
  - War room coordination
  - Leadership communication and sign-off
  - SEO team coordination
  - Support team briefing
  - Customer communication (if needed)
  - Gradual rollout management
  - Estimated: 3-4 days

- **Risk Management**: Extremely High
  - Canary deployment strategy
  - Intensive monitoring 24/7
  - Immediate rollback capability
  - Revenue monitoring
  - SEO monitoring
  - Estimated: 3-4 days

- **Integration Points**: 10+
  - Auth0 authentication
  - GraphQL API (search, bookings, users, reviews)
  - Stripe payments
  - Google Analytics
  - Google Tag Manager
  - Facebook Pixel
  - Google Ads
  - CloudFront + Lambda
  - CloudWatch + X-Ray
  - Email service

- **Unknown Factors**:
  - Real-world SEO impact (monitored closely)
  - High-traffic performance in production
  - Customer behavior patterns
  - Payment processing edge cases at scale

**Total Points**: 21

**Breakdown**:
- Application migration: 10 points (large, complex, SEO-critical)
- Testing and validation: 5 points (comprehensive, SEO critical)
- Infrastructure and deployment: 3 points (high performance, canary)
- Coordination and risk management: 3 points (war room, gradual rollout)

**Two Sprint Justification**:
This is the only story spanning 2 sprints due to:
1. Largest application in the platform
2. Highest business risk (revenue critical)
3. SEO requirements (can't rush)
4. Gradual rollout over 12+ hours
5. Extended monitoring period
6. Comprehensive testing requirements

## Notes & Decisions

### Technical Decisions

- **Provisioned Concurrency (10 minimum)**: Eliminate cold starts completely for marketplace
  - Rationale: SEO and conversion rate depend on fast response times, cost justified by revenue

- **Auto-Scaling Provisioned Concurrency**: Scale 10-50 based on traffic
  - Rationale: Handle traffic spikes while controlling costs

- **Aggressive Caching**: Cache SSR pages up to 24 hours with appropriate invalidation
  - Rationale: Improve performance and reduce Lambda costs

- **Canary Deployment**: Gradual rollout 1% → 10% → 50% → 100%
  - Rationale: Minimize risk, gather data at each stage, easy rollback

- **24/7 War Room**: Engineering team available during entire rollout
  - Rationale: Immediate response to any issues, highest-stakes deployment

- **SEO No-Compromise**: Any SEO degradation triggers rollback
  - Rationale: 60% of traffic from organic search, cannot risk rankings

### Open Questions
- [ ] Should we deploy on weekday or weekend? (Recommend Tuesday 2am AEST - lowest traffic, team fresh)
- [ ] Should we notify high-value customers? (Recommend no, unless issues arise)
- [ ] How long to keep Next.js infrastructure running? (Recommend 2 weeks after successful 100% rollout)
- [ ] Should we pre-warm CloudFront cache? (Recommend yes, crawl all key pages before deployment)
- [ ] Do we need external SEO monitoring service? (Recommend yes, use SEMrush or Ahrefs for real-time rank tracking)

### Assumptions
- Gradual rollout prevents major customer impact
- Provisioned concurrency eliminates cold start SEO issues
- Current SEO rankings will maintain with equivalent or better HTML
- Stripe SDK behaves identically in RR7 vs Next.js
- CloudFront caching strategy won't negatively impact conversions
- 24/7 monitoring team can respond to issues within 5 minutes

### Risk Assessment

**Risk Level**: VERY HIGH

**Key Risks**:

1. **SEO Rankings Drop** (Medium probability, CATASTROPHIC impact)
   - Mitigation: Extensive pre-testing, identical HTML output, gradual rollout, immediate rollback if rankings drop
   - Impact: 60% traffic loss, massive revenue impact, brand damage

2. **Revenue Drop Due to Conversion Issues** (Low probability, CATASTROPHIC impact)
   - Mitigation: Conversion tracking validation, booking funnel testing, gradual rollout monitors conversions
   - Impact: Direct revenue loss, customer frustration

3. **Payment Processing Failures** (Low probability, CRITICAL impact)
   - Mitigation: Extensive Stripe integration testing, payment failure monitoring, immediate rollback
   - Impact: Revenue loss, customer frustration, refund headaches

4. **Performance Degradation at Scale** (Medium probability, HIGH impact)
   - Mitigation: Load testing 2x expected peak, provisioned concurrency, auto-scaling, performance monitoring
   - Impact: Slow site, poor SEO, reduced conversions

5. **Customer-Facing Errors** (Low probability, HIGH impact)
   - Mitigation: Extensive E2E testing, gradual rollout, error rate monitoring, immediate rollback
   - Impact: Customer complaints, support load, reputation damage

**Overall Risk Posture**: Acceptable with comprehensive mitigation and gradual rollout strategy. Highest risk in entire migration project, but with proven infrastructure from previous migrations and extensive preparation.

### Success Criteria

Migration is successful if:
- ✓ Zero SEO ranking drops (top 100 keywords)
- ✓ Organic traffic maintained or increased
- ✓ Booking conversion rate maintained or improved
- ✓ Revenue maintained or increased
- ✓ Payment success rate > 99.5%
- ✓ Error rate < 0.01%
- ✓ Performance equal to or better than Next.js (ideally 20%+ faster)
- ✓ Zero customer escalations
- ✓ Core Web Vitals passing
- ✓ Lighthouse scores 90+
- ✓ No rollback required
- ✓ Positive team feedback on process

**If ALL criteria met**: Massive win for the company and team 🎉
