# Cloudflare-React-Router-Saas (crrs)

- https://crrs-production.devxo.workers.dev/
- https://crrs-production.devxo.workers.dev/api/auth/stripe/webhook

## TODO

- read replica
  - https://github.com/mw10013/cloudflare-effect-react-router-saas/tree/f367c28d7f41b22676fe98f0d486a345cb969fdb
- stripe
  - cancel -> subscribe -> another free trial!
  - referenceId -> organizationId
- admin
  - customers
  - sessions
- organization
  - teams?
- domain
  - zod brands
- css
  - invitations: pre overflow, main overflow, min-width-0?
  - buttons in pricing
- d1
  - read replica
  - strict tables: https://www.sqlite.org/stricttables.html, https://www.sqlite.org/stricttables.html
- batch
  - scavenge expired verifications
- secondary storage: https://www.better-auth.com/docs/concepts/database#secondary-storage

```
http://localhost:5173/
pnpm test --project d1 auth
pnpm test test/d1/d1-adapter.test.ts
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
pnpm dlx shadcn@latest add --overwrite @oui/oui-sidebar-ex

```

## Better-Auth

- https://github.com/Bekacru/better-call/blob/main/src/error.ts
- resend: true is creating a duplicate invite instead of reusing the existing one: https://github.com/better-auth/better-auth/issues/3507
- Create organization on user sign-up: https://github.com/better-auth/better-auth/issues/2010
  - feat: allow create an org on signup and set active org on sign in: https://github.com/better-auth/better-auth/pull/3076
- Async operations don't work inside databaseHooks on Cloudflare Workers: https://github.com/better-auth/better-auth/issues/2841
- The inferred type of 'auth' cannot be named without a reference: https://github.com/better-auth/better-auth/issues/2123

## Playwright

```
pnpm -F s exec playwright test --ui example
pnpm -F s exec playwright test
pnpm -F s exec playwright test --project=chromium
pnpm -F s exec playwright test --ui
pnpm -F s exec playwright test --project=chromium --headed --debug example
```

## Stripe

- https://docs.stripe.com/checkout/fulfillment

### Events

- https://www.better-auth.com/docs/plugins/stripe#set-up-stripe-webhooks

```
checkout.session.completed
customer.subscription.updated
customer.subscription.deleted
```

- https://github.com/t3dotgg/stripe-recommendations

```
checkout.session.completed
customer.subscription.created
customer.subscription.deleted
customer.subscription.paused
customer.subscription.pending_update_applied
customer.subscription.pending_update_expired
customer.subscription.resumed
customer.subscription.trial_will_end
customer.subscription.updated
invoice.marked_uncollectible
invoice.paid
invoice.payment_action_required
invoice.payment_failed
invoice.payment_succeeded
invoice.upcoming
payment_intent.created
payment_intent.payment_failed
payment_intent.succeeded
```

- Set API version in Stripe Workbench and confirm it matches version used by Stripe service.
- stripe trigger payment_intent.succeeded
- stripe trigger customer.subscription.updated

- https://docs.stripe.com/development
- https://docs.stripe.com/workbench/guides#view-api-versions

- Prevent customer creation race conditions: https://github.com/stripe/stripe-node/issues/476#issuecomment-402541143
- https://docs.stripe.com/api/idempotent_requests

- https://github.com/stripe/stripe-node
- https://docs.stripe.com/api?lang=node
- https://github.com/nextjs/saas-starter
- https://www.youtube.com/watch?v=Wdyndb17K58&t=173s

```
Double subscriptions are not an issue when you create a customer first, then create a payment intent for that customer and then load your checkout forms using that intent. It won't matter whether the user goes back, forward, refreshes or whatever. As long as the payment intent doesn't change, it won't be a double subscription. Also a lot of projects actually do allow multiple subscriptions, so they can't just make such a critical option on by default (limit to 1). On the price IDs between environments - use price lookup keys instead.
```

### Disable Cash App Pay

- https://github.com/t3dotgg/stripe-recommendations?tab=readme-ov-file#disable-cash-app-pay
- Settings | Payments | Payment methods

### Limit Customers to One Subscription

- https://github.com/t3dotgg/stripe-recommendations?tab=readme-ov-file#enable-limit-customers-to-one-subscription
- https://docs.stripe.com/payments/checkout/limit-subscriptions
- https://billing.stripe.com/p/login/test_3cs9EBfMn4Qn7Ze144

### Webhook

- stripe listen --load-from-webhooks-api --forward-to localhost:8787
  - Must have stripe webhook endpoint url with path /api/stripe/webhook
  - STRIPE_WEBHOOK_SECRET must align with listen secret
- stripe listen --forward-to localhost:8787/api/stripe/webhook
- stripe listen --print-secret

### Billing Portal

- Settings | Billing | Customer portal
- https://docs.stripe.com/customer-management/activate-no-code-customer-portal
- https://billing.stripe.com/p/login/test_9AQeYV6bN1Eb6VafYZ

### Testing Payments

To test Stripe payments, use the following test card details:

- Card Number: `4242 4242 4242 4242`
- Expiration: Any future date
- CVC: Any 3-digit number

## Sqlite

- https://emschwartz.me/subtleties-of-sqlite-indexes/?utm_source=tldrwebdev
