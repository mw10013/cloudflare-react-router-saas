# Plan Domain Object

## Goal

The goal is to have a plan domain object that contains the data of a saas subscription plan.
Auth would use it to derive the plans for the better-auth stripe plugin.
Pricing page would jse it to derive the pricing UI.

## Requirements

- Lives in `domain.ts` and defined as a zod schema and type.
- Shape is

```
{
  name: string;
  monthlyPriceId: string;
  annualPriceId: string;
  freeTrialInDays: number;
}
```

- There are two plans: `basic` and `pro`.
- Each plan has two prices: `monthly` and `annual`.
- Stripe lookup keys for the prices are `basicMonthly`, `basicAnnual`, `proMonthly`, `proAnnual`.
- `freeTrialInDays` applies per plan.
- `stripe-service.ts` has `getPlans` that returns an array of `Plan` ordered by `name` ascending.
- `getPlans` caches the plans in Cloudflare KV using key `"stripe:plans"`.
- On cache miss, `getPlans` fetches prices from Stripe by lookup keys `["basicMonthly", "basicAnnual", "proMonthly", "proAnnual"]` with `expand: ["data.product"]`, then constructs and returns `Plan` objects.
- `auth.ts` uses `getPlans` to generate plans for the better-auth stripe plugin, mapping `Plan` to better-auth format (e.g., `priceId: monthlyPriceId`, `annualDiscountPriceId: annualPriceId`, `freeTrial: { days: freeTrialInDays }`).
- `_mkt.pricing.tsx` uses `getPlans` to generate the UI for pricing.
  - Use separate buttons for monthly/annual with `name="intent"` and values like `"basicMonthly"`, `"basicAnnual"`, etc.
  - Include `data-testid` attributes like `data-testid="proAnnual"`.
  - Action parses `intent` to extract plan name and annual flag (e.g., `"basicMonthly"` → plan: `"basic"`, annual: `false`).
- `ensureBillingPortalConfiguration` in `stripe-service.ts` uses the four prices from `getPlans` to configure the billing portal.
- `stripe.spec.ts` tests that `getPlans` returns the correct four prices with expected lookup keys and IDs.

## Research

### Better-Auth Stripe Plugin

- Plans are defined with `name`, `priceId`, optional `annualDiscountPriceId`, optional `limits`, optional `freeTrial: { days: number }`.
- Supports static plans array or dynamic async function returning plans.
- Upgrade API accepts `annual: boolean` to switch between monthly and annual prices.
- For UI, separate buttons can be used with intent parsing to set `annual` flag.
- Customer creation and webhook handling are built-in.

### Stripe API

- Prices can be created with `lookup_key` for easy retrieval.
- `prices.list({ lookup_keys: [...], expand: ["data.product"] })` fetches prices by lookup keys.
- Lookup keys must be unique per price.

### Cloudflare KV

- Used for caching with keys like `"stripe:prices"` or `"stripe:plans"`.
- Cache miss handling: fetch from Stripe, store in KV, return data.

### Current Implementation Gaps

- `stripe-service.ts` currently has `getPrices` for two prices (`"basic"`, `"pro"`); needs refactoring to `getPlans` for four prices.
- `auth.ts` uses `getPrices`; needs update to `getPlans` with mapping.
- `_mkt.pricing.tsx` uses `getPrices`; needs update to `getPlans` with intent parsing.
- `ensureBillingPortalConfiguration` uses two prices; needs four.
- `stripe.spec.ts` does not exist; needs creation.

## Plan

1. **Define Plan schema in domain.ts**

   - **Description**: Create a Zod schema and TypeScript type for the `Plan` object in `domain.ts`. The schema should validate the shape `{ name: string; monthlyPriceId: string; annualPriceId: string; freeTrialInDays: number; }`. Ensure it supports the two plans (`basic` and `pro`) and aligns with functional programming principles (e.g., immutable interfaces).
   - **Status**: ✅ Completed
   - **Implementation Notes**:
     - Added Zod schema `Plan` and inferred TypeScript type `Plan` in `domain.ts`.
     - Schema validates the required shape: `{ name: string; monthlyPriceId: string; annualPriceId: string; freeTrialInDays: number; }`.
     - Aligned with functional programming principles by using immutable Zod schema definitions.
     - Supports two plans (`basic` and `pro`) via the `name` field; actual plan instances will be defined in `stripe-service.ts` as per step 2.

2. **Implement getPlans in stripe-service.ts**

   - **Description**: Refactor the existing `getPrices` function to `getPlans`, which fetches four prices from Stripe using lookup keys `["basicMonthly", "basicAnnual", "proMonthly", "proAnnual"]` with `expand: ["data.product"]`. Implement Cloudflare KV caching with key `"stripe:plans"` (cache miss: fetch from Stripe, store in KV, return data). Construct and return an array of `Plan` objects.
   - **Status**: ✅ Completed
   - **Implementation Notes**:
     - Refactored `getPrices` to `getPlans` in `stripe-service.ts`.
     - Implemented KV caching with key `"stripe:plans"`.

3. **Update auth.ts to use getPlans**

   - **Description**: Modify `auth.ts` to use the new `getPlans` function instead of `getPrices`. Map the `Plan` objects to the better-auth stripe plugin format, including `priceId: monthlyPriceId`, `annualDiscountPriceId: annualPriceId`, and `freeTrial: { days: freeTrialDays }`. Ensure the plans are provided dynamically via an async function for the plugin configuration.
   - **Status**: ✅ Completed
   - **Implementation Notes**:
     - Updated the plans async function in the stripe plugin configuration to use `stripeService.getPlans()` instead of `getPrices()`.
     - Mapped each `Plan` object to the better-auth format: `priceId: monthlyPriceId`, `annualDiscountPriceId: annualPriceId`, `freeTrial: { days: freeTrialDays }`.
     - Removed `lookupKey` as it's no longer needed.
     - Made the freeTrial days dynamic based on `plan.freeTrialDays` instead of hardcoded 2.
     - Updated console log messages to include the plan name dynamically.

4. **Update \_mkt.pricing.tsx to use getPlans**

   - **Description**: Refactor `_mkt.pricing.tsx` to use `getPlans` for generating the pricing UI. Implement separate buttons for monthly and annual options with `name="intent"` and values like `"basicMonthly"`, `"basicAnnual"`, etc. Add `data-testid` attributes such as `data-testid="proAnnual"`. Update the action to parse the `intent` to extract plan name and annual flag (e.g., `"basicMonthly"` → plan: `"basic"`, annual: `false`).
   - **Status**: ✅ Completed
   - **Implementation Notes**:
     - [Add notes here as you implement.]

5. **Update ensureBillingPortalConfiguration in stripe-service.ts**

   - **Description**: Modify `ensureBillingPortalConfiguration` to use the four prices from `getPlans` instead of the previous two prices. Ensure the billing portal is configured with all monthly and annual prices for both basic and pro plans.
   - **Status**: ✅ Completed
   - **Implementation Notes**:
     - Updated the function to retrieve both monthly and annual prices for basic and pro plans using `stripe.prices.retrieve` with `expand: ["product"]`.
     - Modified the `products` array in the billing portal configuration to include both monthly and annual price IDs for each plan, enabling users to switch between monthly and annual subscriptions in the Stripe billing portal.

6. **Refactor stripe.spec.ts e2e tests**

   - **Description**: Update the existing `stripe.spec.ts` in the e2e directory to test the new plan structure. Iterate through 'planData' in 'domain.ts'. Use look up keys as the base name for emails ('stripe-basicmonthly@e2e.com') and intent ('proAnnual'). Keep the same e2e flow: delete user, login, navigate to pricing, select plan via intent button, complete payment, and verify subscription. Use appropriate test emails for each plan variant.
   - **Status**: ✅ Completed
   - **Implementation Notes**:
     - Imported `planData` from `domain.ts` to dynamically generate test cases.
     - Created test cases for each lookup key (monthly and annual for each plan) using `flatMap`.
     - Updated email format to use lookup keys as base names (e.g., `stripe-basicMonthly@e2e.com`).
     - Replaced index-based button selection with `data-testid` attributes matching the lookup keys.
     - Maintained the same e2e flow: delete user, login, navigate to pricing, select plan, complete payment, and verify subscription.
