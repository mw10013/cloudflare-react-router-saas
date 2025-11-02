"use client";

import type { Route } from "./+types/_mkt.pricing";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as Oui from "@/components/ui/oui-index";
import { RequestContext } from "@/lib/request-context";
import { invariant } from "@epic-web/invariant";
import * as Rac from "react-aria-components";
import * as ReactRouter from "react-router";
import * as z from "zod";

export async function loader({ context }: Route.LoaderArgs) {
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { stripeService, repository } = requestContext;
  const plans = await stripeService.getPlans();
  const subscriptions = await repository.getSubscriptionsWithDetails();
  return { plans, subscriptions };
}

export async function action({ request, context }: Route.ActionArgs) {
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { authService: auth, session, stripeService } = requestContext;
  if (!session) {
    return ReactRouter.redirect("/login");
  }
  if (session.user.role !== "user")
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw new Response("Forbidden", { status: 403 });
  const schema = z.object({
    intent: z.string().nonempty("Missing intent"),
  });
  const { intent } = schema.parse(Object.fromEntries(await request.formData()));

  const plans = await stripeService.getPlans();
  const plan = plans.find(
    (p) =>
      p.monthlyPriceLookupKey === intent || p.annualPriceLookupKey === intent,
  );
  invariant(plan, `Missing plan for intent ${intent}`);

  const activeOrganizationId = session.session.activeOrganizationId;
  invariant(activeOrganizationId, "Missing activeOrganizationId");

  const subscriptions = await auth.api.listActiveSubscriptions({
    headers: request.headers,
    query: { referenceId: activeOrganizationId },
  });
  const subscriptionId =
    subscriptions.length > 0
      ? subscriptions[0].stripeSubscriptionId
      : undefined;
  console.log(`pricing: action`, { plan: plan.name, subscriptionId });
  const { url, redirect: isRedirect } = await auth.api.upgradeSubscription({
    headers: request.headers,
    body: {
      plan: plan.name,
      annual: intent === plan.annualPriceLookupKey,
      referenceId: activeOrganizationId,
      subscriptionId,
      seats: 1,
      successUrl: "/app", // stripe checkout session
      cancelUrl: "/pricing",
      returnUrl: `/app/${activeOrganizationId}/billing`, // stripe billing portal
      disableRedirect: false, // disable false since we redirect after successful subscription
    },
  });
  console.log(`pricing: action`, { isRedirect, url });
  invariant(isRedirect, "isRedirect is not true");
  invariant(url, "Missing url");
  return ReactRouter.redirect(url);
}

/**
 * @see https://www.shadcnblocks.com/block/pricing2
 * @see https://github.com/shadcnblocks/shadcn-ui-blocks/blob/30a7540bf9fd9dd55a8b55fd53a4df1d2c098697/src/block/pricing2.tsx
 */
export default function RouteComponent({
  loaderData: { plans, subscriptions: _subscriptions },
}: Route.ComponentProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  return (
    <div className="p-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
        <h2 className="text-4xl font-semibold text-pretty lg:text-6xl">
          Pricing
        </h2>
        <p className="text-muted-foreground lg:text-xl">
          Check out our pricing plans
        </p>
        <div className="flex items-center gap-3 text-lg">
          Monthly
          <Oui.SwitchEx
            isSelected={isAnnual}
            onChange={setIsAnnual}
            aria-label="Annual pricing"
          />
          Annual
        </div>
        <div className="flex flex-col items-stretch gap-6 md:flex-row">
          {plans.map((plan) => {
            const price = isAnnual
              ? plan.annualPriceInCents / 100
              : plan.monthlyPriceInCents / 100;
            const lookupKey = isAnnual
              ? plan.annualPriceLookupKey
              : plan.monthlyPriceLookupKey;
            return (
              <Card
                key={plan.name}
                className="flex w-80 flex-col justify-between text-left"
              >
                <CardHeader>
                  <CardTitle>
                    <p>{plan.displayName}</p>
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {plan.description}
                  </p>
                  <div className="flex items-end">
                    <span className="text-4xl font-semibold">${price}</span>
                    <span className="text-muted-foreground text-2xl font-semibold">
                      {isAnnual ? "/yr" : "/mo"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>{/* Features would go here */}</CardContent>
                <CardFooter className="mt-auto">
                  <Rac.Form method="post" className="w-full">
                    <Oui.Button
                      name="intent"
                      value={lookupKey}
                      type="submit"
                      className="w-full"
                      data-testid={plan.name}
                    >
                      Purchase
                    </Oui.Button>
                  </Rac.Form>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
      <pre>{JSON.stringify(_subscriptions, null, 2)}</pre>
    </div>
  );
}
