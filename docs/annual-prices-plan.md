# Annual Prices Plan DEPRECATED

## Introduction

This plan outlines the steps to add annual pricing options to our existing Stripe subscription setup. Currently, we have two products ("basic" and "pro") each with one monthly recurring price. The goal is to introduce annual prices for both products, allowing customers to choose between monthly and annual billing cycles. This will provide flexibility, potentially increase conversions through annual discounts, and align with common SaaS pricing models.

Key changes include updating lookup keys for clarity, modifying the Stripe service to handle multiple prices per product, updating the auth configuration for better-auth, enhancing the pricing page UI, and improving test robustness.

## Step-by-Step Plan

1. **Update Lookup Keys Convention**

   - Change existing monthly prices from `"basic"` and `"pro"` to `"basicMonthly"` and `"proMonthly"`.
   - Add new annual prices with keys `"basicAnnual"` and `"proAnnual"`.
   - This ensures consistent naming and easier sorting/grouping.

2. **Modify `stripe-service.ts`**

   - Update `priceData` array to include both monthly and annual prices for each product.
   - Adjust `getPrices` function to create/fetch 4 prices instead of 2.
   - Update sorting logic: Sort by product (basic/pro), then by interval (monthly before annual).
   - Update invariant checks to expect 4 prices.
   - Ensure caching and KV storage handle the increased count.

3. **Update `auth.ts` (Better-Auth Configuration)**

   - Keep 2 plans (basic and pro) in the `plans` function.
   - Add `annualDiscountPriceId` property to each plan for annual pricing.
   - Each plan should have unique `priceId` (monthly) and `annualDiscountPriceId` (annual).
   - Configure free trials, callbacks, and authorization for both intervals.
   - Work around known bugs (e.g., #3537) by using `priceId` directly.

4. **Enhance `_mkt.pricing.tsx`**

   - Group prices by product (one card per product).
   - Display monthly and annual options side-by-side within each card for easy comparison.
   - Add savings indicator for annual (e.g., "Save 20% with annual").
   - Use separate buttons for monthly/annual with combined intent-based form submission (e.g., button name="intent" value="basicMonthly", "basicAnnual", "proMonthly", "proAnnual").
   - Ensure loader fetches and passes all 4 prices.

5. **Update Billing Portal Configuration**

   - Modify `ensureBillingPortalConfiguration` to include all 4 prices in the `products` array for subscription updates.
   - Test that customers can switch between monthly and annual plans.

6. **Improve `stripe.spec.ts`**

   - Replace brittle `getStartedIndex` with robust selectors (e.g., `data-testid` attributes like `"basicMonthly"`).
   - Update test data to cover both monthly and annual options.
   - Ensure tests validate the correct price selection during checkout.

7. **Testing and Validation**

   - Run e2e tests in a sandbox environment to verify checkout flows for both intervals.
   - Test subscription creation, upgrades, and billing portal interactions.
   - Validate that existing subscriptions remain unaffected.
   - Monitor for edge cases like proration and discounts.

8. **Deployment and Rollout**
   - Deploy changes to staging first for thorough testing.
   - Update any documentation or user-facing content about pricing.
   - Monitor Stripe dashboard for new price creation and subscription metrics.

## Considerations and Risks

- **Data Migration**: Existing subscriptions use the old lookup keys—ensure backward compatibility or plan for migration if needed.
- **UI Complexity**: Adding annual options may clutter the pricing page; focus on clean design.
- **Discounts**: Consider implementing annual discounts (e.g., 15-20% off) via Stripe's pricing features.
- **Better-Auth Limitations**: Watch for plugin bugs related to multiple prices per product.
- **Test Fragility**: Prioritize robust selectors to avoid future maintenance issues.

This plan maintains our functional programming style and TypeScript guidelines while leveraging Stripe's multi-price support.
