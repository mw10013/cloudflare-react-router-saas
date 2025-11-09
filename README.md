# Cloudflare-React-Router-Saas (crrs)

- https://crrs-production.devxo.workers.dev/
- https://crrs-production.devxo.workers.dev/api/auth/stripe/webhook

## TODO

- docs

- invitations: pre overflow, main overflow, min-width-0?
- pagination: count/total
- analytics
- stripe sandbox for prod
- zod brands
- d1 strict tables: https://www.sqlite.org/stricttables.html, https://www.sqlite.org/stricttables.html
- organization: teams
- secondary storage: https://www.better-auth.com/docs/concepts/database#secondary-storage
- stripe: referenceId -> organizationId?

```
http://localhost:5173/
pnpm test --project d1 auth
pnpm test test/d1/d1-adapter.test.ts

curl "http://localhost:5173/cdn-cgi/handler/scheduled?cron=0%200%20*%20*%20*"
```

## Local Dev

- pnpm i
- cp .env.example .env
- pnpm d1:reset
- pnpm dev

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

## Shadcn

```
pnpm dlx shadcn@latest add --all
pnpm dlx shadcn@latest migrate radix

pnpm dlx shadcn@latest add --overwrite @oui/oui-index
pnpm dlx shadcn@latest add --overwrite @oui/oui-react-router-provider
pnpm dlx shadcn@latest add --overwrite @oui/oui-react-router-theme-toggle-button
pnpm dlx shadcn@latest add --overwrite @oui/oui-react-router-provider

```

## Better-Auth

- resend: true is creating a duplicate invite instead of reusing the existing one: https://github.com/better-auth/better-auth/issues/3507
- Create organization on user sign-up: https://github.com/better-auth/better-auth/issues/2010
  - feat: allow create an org on signup and set active org on sign in: https://github.com/better-auth/better-auth/pull/3076

## Playwright

```
pnpm exec playwright test --ui example
pnpm exec playwright test
pnpm exec playwright test --project=chromium
pnpm exec playwright test --ui
pnpm exec playwright test --project=chromium --headed --debug example
```

## Stripe

### Events

- https://www.better-auth.com/docs/plugins/stripe#set-up-stripe-webhooks

```
checkout.session.completed
customer.subscription.updated
customer.subscription.deleted
```

- Set API version in Stripe Workbench and confirm it matches version used by Stripe service.
- stripe trigger payment_intent.succeeded
- stripe trigger customer.subscription.updated

### Webhook

- stripe listen --load-from-webhooks-api --forward-to localhost:8787
  - Must have stripe webhook endpoint url with path /api/stripe/webhook
  - STRIPE_WEBHOOK_SECRET must align with listen secret
- stripe listen --forward-to localhost:8787/api/stripe/webhook
- stripe listen --print-secret

### Testing Payments

To test Stripe payments, use the following test card details:

- Card Number: `4242 4242 4242 4242`
- Expiration: Any future date
- CVC: Any 3-digit number

## License

Licensed under the [MIT License](https://github.com/mw10013/cloudflare-react-router-saas/blob/main/LICENSE).
