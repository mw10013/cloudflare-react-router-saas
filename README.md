<h1 align="center">
<code>Cloudflare-React-Router-Saas</code>
</h1>

<div align="center">
  <p>
  Lightweight saas template packed with essential functionality for Cloudflare and React Router
  </p>
  <p>
    <a href="https://crrs-production.devxo.workers.dev/">Demo</a>
  </p>
</div>

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

- invitations: pre overflow, main overflow, min-width-0?
- pagination: count/total
- analytics
- stripe sandbox for prod
- zod brands
- d1 strict tables: https://www.sqlite.org/stricttables.html, https://www.sqlite.org/stricttables.html
- organization: teams
- secondary storage: https://www.better-auth.com/docs/concepts/database#secondary-storage
- stripe: referenceId -> organizationId?
- https://crrs-production.devxo.workers.dev/api/auth/stripe/webhook

```
http://localhost:5173/
pnpm test --project d1 auth
pnpm test test/d1/d1-adapter.test.ts

curl "http://localhost:5173/cdn-cgi/handler/scheduled?cron=0%200%20*%20*%20*"
```

## Shadcn

```
pnpm dlx shadcn@latest add --all
pnpm dlx shadcn@latest migrate radix

pnpm dlx shadcn@latest add --overwrite @oui/oui-index
pnpm dlx shadcn@latest add --overwrite @oui/oui-react-router-provider
pnpm dlx shadcn@latest add --overwrite @oui/oui-react-router-theme-toggle-button
pnpm dlx shadcn@latest add --overwrite @oui/oui-react-router-provider

```

## Playwright

```
pnpm exec playwright test --ui example
pnpm exec playwright test
pnpm exec playwright test --project=chromium
pnpm exec playwright test --ui
pnpm exec playwright test --project=chromium --headed --debug example
```

## License

Licensed under the [MIT License](https://github.com/mw10013/cloudflare-react-router-saas/blob/main/LICENSE).
