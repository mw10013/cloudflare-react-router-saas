import type { Plan } from "@/lib/domain";
import type { Stripe as StripeTypes } from "stripe";
import { planData, Plan as PlanSchema } from "@/lib/domain";
import { invariant } from "@epic-web/invariant";
import { env } from "cloudflare:workers";
import * as Stripe from "stripe";
import * as z from "zod";

type Price = StripeTypes.Price;
type PriceWithLookupKey = Price & { lookup_key: string };
const isPriceWithLookupKey = (p: Price): p is PriceWithLookupKey =>
  p.lookup_key !== null;
function assertPriceWithLookupKey(p: Price): asserts p is PriceWithLookupKey {
  invariant(p.lookup_key !== null, "Missing lookup_key");
}

export type StripeService = ReturnType<typeof createStripeService>;

export function createStripeService() {
  const stripe = new Stripe.Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-10-29.clover",
  });

  const getPlans = async (): Promise<Plan[]> => {
    const key = "stripe:plans";
    const cachedPlans = await env.KV.get(key, { type: "json" });
    if (cachedPlans) {
      const parseResult = z.array(PlanSchema).safeParse(cachedPlans);
      if (parseResult.success) {
        console.log(`stripeService: getPlans: cache hit`);
        return parseResult.data;
      }
    }
    console.log(`stripeService: getPlans: cache miss`);
    const _getPrices = async (): Promise<PriceWithLookupKey[]> => {
      const lookupKeys = planData.flatMap((plan) => [
        plan.monthlyPriceLookupKey,
        plan.annualPriceLookupKey,
      ]);
      const priceList = await stripe.prices.list({
        lookup_keys: lookupKeys,
        expand: ["data.product"],
      });
      if (priceList.data.length === 0) {
        // Create products first
        const products = await Promise.all(
          planData.map(async (plan) => {
            const product = await stripe.products.create({
              name: plan.displayName,
              description: `${plan.displayName} plan.`,
            });
            return { plan, product };
          }),
        );
        // Then create prices for each product
        const prices = await Promise.all(
          products.flatMap(({ plan, product }) => [
            stripe.prices.create({
              product: product.id,
              unit_amount: plan.monthlyPriceInCents,
              currency: "usd",
              recurring: { interval: "month" },
              lookup_key: plan.monthlyPriceLookupKey,
              expand: ["product"],
            }),
            stripe.prices.create({
              product: product.id,
              unit_amount: plan.annualPriceInCents,
              currency: "usd",
              recurring: { interval: "year" },
              lookup_key: plan.annualPriceLookupKey,
              expand: ["product"],
            }),
          ]),
        );
        return prices.map((price) => {
          assertPriceWithLookupKey(price);
          return price;
        });
      } else {
        const prices = priceList.data.filter(isPriceWithLookupKey);
        invariant(
          prices.length === planData.length * 2,
          "Count of prices not " +
            (planData.length * 2).toString() +
            " (" +
            prices.length.toString() +
            ")",
        );
        return prices;
      }
    };

    const prices = await _getPrices();
    const plans: Plan[] = planData.map((plan) => {
      const monthlyPrice = prices.find(
        (p) => p.lookup_key === plan.monthlyPriceLookupKey,
      );
      invariant(monthlyPrice, `Missing monthly price for ${plan.name}`);
      invariant(
        typeof monthlyPrice.product !== "string",
        "Product should be expanded",
      );
      const annualPrice = prices.find(
        (p) => p.lookup_key === plan.annualPriceLookupKey,
      );
      invariant(annualPrice, `Missing annual price for ${plan.name}`);
      return {
        name: plan.name,
        displayName: plan.displayName,
        description: plan.description,
        productId: monthlyPrice.product.id,
        monthlyPriceId: monthlyPrice.id,
        monthlyPriceLookupKey: plan.monthlyPriceLookupKey,
        monthlyPriceInCents: plan.monthlyPriceInCents,
        annualPriceId: annualPrice.id,
        annualPriceLookupKey: plan.annualPriceLookupKey,
        annualPriceInCents: plan.annualPriceInCents,
        freeTrialDays: plan.freeTrialDays,
      };
    });
    await env.KV.put(key, JSON.stringify(plans));
    return plans;
  };

  const ensureBillingPortalConfiguration = async (): Promise<void> => {
    const key = "stripe:isBillingPortalConfigured";
    const isConfigured = await env.KV.get(key);
    if (isConfigured === "true") return;
    const configurations = await stripe.billingPortal.configurations.list({
      limit: 2,
    });
    if (configurations.data.length === 0) {
      const plans = await getPlans();
      const basicPlan = plans.find((p) => p.name === "basic");
      invariant(basicPlan, "Missing basic plan");
      const proPlan = plans.find((p) => p.name === "pro");
      invariant(proPlan, "Missing pro plan");
      await stripe.billingPortal.configurations.create({
        business_profile: {
          headline: "Manage your subscription and billing information",
        },
        features: {
          customer_update: {
            enabled: true,
            allowed_updates: ["name", "phone"],
          },
          invoice_history: {
            enabled: true,
          },
          payment_method_update: {
            enabled: true,
          },
          // Allow immediate cancellation with prorated refunds for unused time
          subscription_cancel: {
            enabled: true,
            mode: "immediately",
            proration_behavior: "create_prorations",
          },
          subscription_update: {
            enabled: true,
            default_allowed_updates: ["price"],
            proration_behavior: "create_prorations",
            products: [
              {
                product: basicPlan.productId,
                prices: [basicPlan.monthlyPriceId, basicPlan.annualPriceId],
              },
              {
                product: proPlan.productId,
                prices: [proPlan.monthlyPriceId, proPlan.annualPriceId],
              },
            ],
          },
        },
      });
      console.log(
        `stripeService: ensureBillingPortalConfiguration: created billing portal configuration`,
      );
    } else {
      if (configurations.data.length > 1) {
        console.log(
          "WARNING: More than 1 billing portal configuration found. Should not be more than 1.",
        );
      }
      await env.KV.put(key, "true");
    }
  };

  return {
    stripe,
    getPlans,
    ensureBillingPortalConfiguration,
  };
}
