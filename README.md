<h1 align="center">
<code>Cloudflare-React-Router-Saas</code>
</h1>

<div align="center">
  <p>
  Lightweight saas template packed with essential functionality for Cloudflare and React Router
  </p>
  <p>
    <a href="https://crrs.devxo.workers.dev/">Demo</a>
  </p>
</div>

## Template Functionality

- **Authentication & Organizations:**
  - Magic link authentication using Better Auth
  - Multi-tenant organization management with automatic organization creation
  - Role-based access control (user/admin/organization member roles)
  - Organization invitations and membership management
  - Pre-seeded admin user for system administration

- **Payments & Subscriptions:**
  - Stripe integration with subscription processing
  - Monthly and annual pricing plans with configurable trial periods
  - Stripe Checkout and Customer Portal integration
  - Webhook handling for subscription lifecycle events
  - Subscription management (cancel, reactivate, billing portal access)

- **Database & Data Management:**
  - Cloudflare D1 (SQLite) database with comprehensive schema migrations
  - Type-safe database operations with Zod schema validation
  - Session management with automatic cleanup of expired sessions
  - Database seeding utilities for development and testing

- **Admin Panel:**
  - Comprehensive admin interface for user management
  - Session monitoring and administration
  - Customer and subscription oversight
  - Administrative dashboard with key metrics

- **Email Integration:**
  - AWS SES for transactional email delivery
  - Demo mode support for development without external email services

- **UI/UX Components:**
  - Shadcn UI components with React Aria Components integration
  - Theme switching (light/dark/system) with persistence

- **Testing Infrastructure:**
  - Unit and integration tests using Vitest
  - End-to-end testing with Playwright
  - Browser-based testing environment with Cloudflare Workers integration

- **Security & Performance:**
  - IP-based rate limiting for authentication endpoints using Cloudflare Rate Limiting
  - Server-side route protection and authorization
  - Secure session handling with database storage

## Quick Start

### Stripe

- Install the [Stripe CLI](https://stripe.com/docs/stripe-cli).
- Go to stripe and create a sandbox for testing.
  - Remember secret key for `STRIPE_SECRET_KEY` environment variable.
- Create a stripe webhook
  - Endpoint URL: dummy url for now.
  - Events: `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`
  - Remember signing secret for `STRIPE_WEBHOOK_SECRET` environment variable.

### Local Env

- Copy `.env.example` to `.env`.
- Edit the better-auth and stripe keys.
- Leave the aws ses email keys empty since we are running in demo mode.

```
pnpm i
pnpm d1:reset
pnpm dev
pnpm stripe:listen

# cron
curl "http://localhost:5173/cdn-cgi/handler/scheduled?cron=0%200%20*%20*%20*"
```

## Testing

### Stripe Test Card Details

- Card Number: `4242 4242 4242 4242`
- Expiration: Any future date
- CVC: Any 3-digit number

### Unit and Integration Tests

```
pnpm test
```

### E2E Tests

```
pnpm dev
pnpm stripe:listen
pnpm test:e2e
```

## Deploy

- pnpm exec wrangler kv namespace create <WRANGLER_NAME>-kv-production
- pnpm exec wrangler queues create <WRANGLER_NAME>-q-production
- Update wrangler.jsonc production kv_namespaces and queues
- pnpm d1:reset:PRODUCTION
- pnpm deploy:PRODUCTION
- pnpm exec wrangler secret put <SECRET> --env production
- Workers & Pages Settings: <WRANGLER_NAME>-production
  - Git repository: connect to git repo
  - Build configuration
    - Build command: CLOUDFLARE_ENV=production pnpm build
    - Deploy command: pnpm exec wrangler deploy

## TODO

- docs
- Set API version in Stripe Workbench and confirm it matches version used by Stripe service.
- stripe listen --load-from-webhooks-api --forward-to localhost:8787
  - Must have stripe webhook endpoint url with path /api/stripe/webhook
  - STRIPE_WEBHOOK_SECRET must align with listen secret
- stripe listen --forward-to localhost:8787/api/stripe/webhook
- stripe listen --print-secret

- analytics
- stripe sandbox for prod

## Oui

- React aria components with shadcn characteristics.
- https://oui.mw10013.workers.dev/

```
pnpm dlx shadcn@latest add --overwrite @oui/oui-index
pnpm dlx shadcn@latest add --overwrite @oui/oui-react-router-provider
pnpm dlx shadcn@latest add --overwrite @oui/oui-react-router-theme-toggle-button
pnpm dlx shadcn@latest add --overwrite @oui/oui-react-router-provider
```

## License

Licensed under the [MIT License](https://github.com/mw10013/cloudflare-react-router-saas/blob/main/LICENSE).
