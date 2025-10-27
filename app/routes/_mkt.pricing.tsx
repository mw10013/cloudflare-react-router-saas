import type { Route } from "./+types/_mkt.pricing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as Oui from "@/components/ui/oui-index";
import { RequestContext } from "@/lib/request-context";
import { invariant } from "@epic-web/invariant";
import { env } from "cloudflare:workers";
import * as Rac from "react-aria-components";
import { redirect } from "react-router";
import * as z from "zod";

export async function loader({ context }: Route.LoaderArgs) {
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { stripeService } = requestContext;
  const plans = await stripeService.getPlans();
  const subscriptions = (
    await env.D1.prepare(
      `
select u.email as email, u.stripeCustomerId as userStripeCustomerId, s.*, o.name as organizationName from Subscription s 
inner join Organization o on o.organizationId = s.referenceId
inner join Member m on m.organizationId = o.organizationId and m.role = 'owner'
inner join User u on u.userId = m.userId`,
    ).all()
  ).results;
  return { plans, subscriptions };
}

export async function action({ request, context }: Route.ActionArgs) {
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { auth, session, stripeService } = requestContext;
  if (!session) {
    return redirect("/login");
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
  return redirect(url);
}

export default function RouteComponent({
  loaderData: { plans, subscriptions },
}: Route.ComponentProps) {
  return (
    <div className="p-6">
      <div className="mx-auto grid max-w-xl gap-8 md:grid-cols-2">
        {plans.map((plan) => {
          return (
            <Card key={plan.name}>
              <CardHeader>
                <CardTitle>{plan.displayName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold">
                      Monthly: ${plan.monthlyPriceInCents / 100}
                    </p>
                    <Rac.Form method="post">
                      <Oui.Button
                        name="intent"
                        value={plan.monthlyPriceLookupKey}
                        type="submit"
                        data-testid={plan.monthlyPriceLookupKey}
                      >
                        Get Started Monthly
                      </Oui.Button>
                    </Rac.Form>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      Annual: ${plan.annualPriceInCents / 100}
                    </p>
                    <Rac.Form method="post">
                      <Oui.Button
                        name="intent"
                        value={plan.annualPriceLookupKey}
                        type="submit"
                        data-testid={plan.annualPriceLookupKey}
                      >
                        Get Started Annual
                      </Oui.Button>
                    </Rac.Form>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <pre>{JSON.stringify({ subscriptions }, null, 2)}</pre>
    </div>
  );
}
