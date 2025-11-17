"use client";

import type { Route } from "./+types/_mkt.pricing";
import { useState } from "react";
import * as Oui from "@/components/ui/oui-index";
import { RequestContext } from "@/lib/request-context";
import { invariant } from "@epic-web/invariant";
import * as Rac from "react-aria-components";
import * as ReactRouter from "react-router";
import { siGithub } from "simple-icons";
import * as z from "zod";

export async function loader({ context }: Route.LoaderArgs) {
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { stripeService } = requestContext;
  const plans = await stripeService.getPlans();
  return { plans };
}

export async function action({ request, context }: Route.ActionArgs) {
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { authService: auth, session, stripeService } = requestContext;
  if (!session) {
    return ReactRouter.redirect(ReactRouter.href("/login"));
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
      successUrl: ReactRouter.href("/app"), // stripe checkout session
      cancelUrl: ReactRouter.href("/pricing"),
      returnUrl: ReactRouter.href("/app/:organizationId/billing", {
        organizationId: activeOrganizationId,
      }), // stripe billing portal
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
  loaderData: { plans },
}: Route.ComponentProps) {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center py-12">
      <div className="relative flex w-full flex-col items-center justify-center gap-4 border px-6 py-48">
        {/* Decorative Lines */}
        <span className="bg-primary absolute -top-[9px] left-0 h-5 w-px animate-pulse opacity-80" />
        <span className="bg-primary absolute top-0 -left-[9px] h-px w-5 animate-pulse opacity-80" />
        <span className="bg-primary absolute right-0 -bottom-[9px] h-5 w-px animate-pulse opacity-80" />
        <span className="bg-primary absolute -right-[9px] bottom-0 h-px w-5 animate-pulse opacity-80" />
        <div className="absolute inset-0 isolate -z-10 overflow-hidden">
          <div className="absolute inset-y-0 left-1/2 w-[1200px] -translate-x-1/2 mask-[linear-gradient(black,transparent_320px),linear-gradient(90deg,transparent,black_5%,black_95%,transparent)] [mask-composite:intersect]">
            <svg
              className="text-primary/10 pointer-events-none absolute inset-0"
              width="100%"
              height="100%"
            >
              <defs>
                <pattern
                  id="grid-_r_17_"
                  x="-0.25"
                  y={-1}
                  width={60}
                  height={60}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 60 0 L 0 0 0 60"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth={1}
                  />
                </pattern>
              </defs>
              <rect fill="url(#grid-_r_17_)" width="100%" height="100%" />
            </svg>
          </div>
          <div className="absolute top-6 left-1/2 size-20 -translate-x-1/2 -translate-y-1/2 scale-x-[1.6] opacity-10 mix-blend-overlay">
            <div className="absolute -inset-16 bg-[conic-gradient(from_90deg,#22d3ee_5deg,#38bdf8_63deg,#2563eb_115deg,#0ea5e9_170deg,#22d3ee_220deg,#38bdf8_286deg,#22d3ee_360deg)] mix-blend-overlay blur-[50px] grayscale saturate-[2]" />
            <div className="absolute -inset-16 bg-[conic-gradient(from_90deg,#22d3ee_5deg,#38bdf8_63deg,#2563eb_115deg,#0ea5e9_170deg,#22d3ee_220deg,#38bdf8_286deg,#22d3ee_360deg)] mix-blend-overlay blur-[50px] grayscale saturate-[2]" />
          </div>
        </div>

        {/* Hero */}
        <h1 className="text-center text-3xl leading-tight font-semibold text-wrap md:text-5xl">
          Find the perfect plan for you.
        </h1>
        <p className="text-muted-foreground text-center text-xl text-pretty">
          Simple and transparent pricing. No hidden fees, no surprises.
        </p>
      </div>
      <div className="relative flex w-full flex-col items-center">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, var(--muted) 0px, var(--muted) 1px, transparent 1px, transparent 5px)",
          }}
        />
        <div className="bg-secondary absolute -top-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-6 rounded-full p-2 px-3">
          <span className="text-sm font-medium">Monthly</span>
          <Oui.SwitchEx
            isSelected={isAnnual}
            onChange={setIsAnnual}
            aria-label="Annual pricing"
            className="scale-150"
          />
          <span className="text-sm font-medium">Annual</span>
        </div>
        <div className="flex w-full flex-col items-center md:flex-row">
          {plans.map((plan) => {
            const price = isAnnual
              ? plan.annualPriceInCents / 100
              : plan.monthlyPriceInCents / 100;
            const lookupKey = isAnnual
              ? plan.annualPriceLookupKey
              : plan.monthlyPriceLookupKey;
            return (
              <div
                key={plan.name}
                className="group relative flex aspect-square h-full w-full flex-col items-center justify-center gap-4 overflow-hidden border-l p-6 not-sm:border-r"
              >
                <h1 className="text-center text-2xl leading-tight font-semibold text-wrap lg:text-3xl">
                  {plan.displayName}
                </h1>
                <p className="text-center text-2xl leading-tight font-medium text-wrap lg:text-3xl">
                  {plan.description}
                </p>
                <div className="relative flex items-end">
                  <span className="text-4xl font-semibold">${price}</span>
                  <span className="text-muted-foreground text-2xl">
                    {isAnnual ? "/yr" : "/mo"}
                  </span>
                </div>
                <Rac.Form method="post" className="mt-6">
                  <Oui.Button
                    name="intent"
                    value={lookupKey}
                    type="submit"
                    className="w-full rounded-full! text-base! font-semibold"
                    data-testid={plan.name}
                  >
                    Get {plan.name.charAt(0).toUpperCase() + plan.name.slice(1)}
                  </Oui.Button>
                </Rac.Form>
                <svg
                  viewBox="0 0 39 39"
                  fill="none"
                  className="absolute -bottom-16 size-32 grayscale transition-all group-hover:scale-105 group-hover:grayscale-0"
                >
                  <path
                    d="M39 24H24V6H6V24H24V39H0V6H6V0H39V24Z"
                    fill="#81ADEC"
                  />
                </svg>
              </div>
            );
          })}
        </div>
      </div>
      <div className="relative flex w-full flex-col items-start justify-center gap-4 border border-t-0 p-12 py-16">
        <div className="absolute inset-4 -z-10">
          <svg
            className="text-primary/10 pointer-events-none absolute inset-0"
            width="100%"
            height="100%"
          >
            <defs>
              <pattern
                id="dots-_S_2_"
                x={-1}
                y={-1}
                width={12}
                height={12}
                patternUnits="userSpaceOnUse"
              >
                <rect x={1} y={1} width={2} height={2} fill="currentColor" />
              </pattern>
            </defs>
            <rect fill="url(#dots-_S_2_)" width="100%" height="100%" />
          </svg>
        </div>
        <h1 className="text-2xl leading-tight font-semibold text-wrap lg:text-3xl">
          Get started with CRRS.
        </h1>
        <p className="text-muted-foreground text-2xl leading-normal font-medium text-wrap sm:max-w-[80%] lg:text-3xl">
          Build with{" "}
          <Oui.Link
            href="https://github.com/mw10013/oui"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            className="inline-flex items-center gap-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary size-6"
              aria-hidden="true"
            >
              <circle cx={12} cy={12} r={10} />
            </svg>
            <span className="text-primary font-semibold">Oui</span>
          </Oui.Link>{" "}
          components, authenticate users with{" "}
          <Oui.Link
            href="https://www.better-auth.com/"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            className="inline-flex items-center gap-1.5"
          >
            <svg
              fill="none"
              viewBox="0 0 500 500"
              className="inline-block size-6"
            >
              <path fill="#fff" d="M0 0h500v500H0z" />
              <path
                fill="#000"
                d="M69 121h86.988v259H69zM337.575 121H430v259h-92.425z"
              />
              <path
                fill="#000"
                d="M427.282 121v83.456h-174.52V121zM430 296.544V380H252.762v-83.456z"
              />
              <path fill="#000" d="M252.762 204.455v92.089h-96.774v-92.089z" />
            </svg>
            <span className="text-primary font-semibold">Better-Auth</span>
          </Oui.Link>
          , and monetize through{" "}
          <Oui.Link
            href="https://stripe.com/"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            className="inline-flex items-center gap-1.5"
          >
            <span className="inline-flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                className="inline-block size-6 brightness-125"
                fill="#6772e5"
              >
                <path
                  d="M111.328 15.602c0-4.97-2.415-8.9-7.013-8.9s-7.423 3.924-7.423 8.863c0 5.85 3.32 8.8 8.036 8.8 2.318 0 4.06-.528 5.377-1.26V19.22a10.246 10.246 0 0 1-4.764 1.075c-1.9 0-3.556-.67-3.774-2.943h9.497a39.64 39.64 0 0 0 .063-1.748zm-9.606-1.835c0-2.186 1.35-3.1 2.56-3.1s2.454.906 2.454 3.1zM89.4 6.712a5.434 5.434 0 0 0-3.801 1.509l-.254-1.208h-4.27v22.64l4.85-1.032v-5.488a5.434 5.434 0 0 0 3.444 1.265c3.472 0 6.64-2.792 6.64-8.957.003-5.66-3.206-8.73-6.614-8.73zM88.23 20.1a2.898 2.898 0 0 1-2.288-.906l-.03-7.2a2.928 2.928 0 0 1 2.315-.96c1.775 0 2.998 2 2.998 4.528.003 2.593-1.198 4.546-2.995 4.546zM79.25.57l-4.87 1.035v3.95l4.87-1.032z"
                  fillRule="evenodd"
                />
                <path d="M74.38 7.035h4.87V24.04h-4.87z" />
                <path
                  d="M69.164 8.47l-.302-1.434h-4.196V24.04h4.848V12.5c1.147-1.5 3.082-1.208 3.698-1.017V7.038c-.646-.232-2.913-.658-4.048 1.43zm-9.73-5.646L54.698 3.83l-.02 15.562c0 2.87 2.158 4.993 5.038 4.993 1.585 0 2.756-.302 3.405-.643v-3.95c-.622.248-3.683 1.138-3.683-1.72v-6.9h3.683V7.035h-3.683zM46.3 11.97c0-.758.63-1.05 1.648-1.05a10.868 10.868 0 0 1 4.83 1.25V7.6a12.815 12.815 0 0 0-4.83-.888c-3.924 0-6.557 2.056-6.557 5.488 0 5.37 7.375 4.498 7.375 6.813 0 .906-.78 1.186-1.863 1.186-1.606 0-3.68-.664-5.307-1.55v4.63a13.461 13.461 0 0 0 5.307 1.117c4.033 0 6.813-1.992 6.813-5.485 0-5.796-7.417-4.76-7.417-6.943zM13.88 9.515c0-1.37 1.14-1.9 2.982-1.9A19.661 19.661 0 0 1 25.6 9.876v-8.27A23.184 23.184 0 0 0 16.862.001C9.762.001 5 3.72 5 9.93c0 9.716 13.342 8.138 13.342 12.326 0 1.638-1.4 2.146-3.37 2.146-2.905 0-6.657-1.202-9.6-2.802v8.378A24.353 24.353 0 0 0 14.973 32C22.27 32 27.3 28.395 27.3 22.077c0-10.486-13.42-8.613-13.42-12.56z"
                  fillRule="evenodd"
                />
              </svg>
              <span className="text-primary font-semibold">Stripe</span>
            </span>
          </Oui.Link>
          .
        </p>
        <div className="mt-6 flex flex-col items-center gap-6">
          <div className="flex w-fit gap-4">
            <Rac.Link
              href="https://github.com/mw10013/cloudflare-react-router-saas"
              target="_blank"
              rel="noopener noreferrer"
              className={Oui.buttonClassName({
                variant: "outline",
                className: "h-11 rounded-full! text-base! font-medium",
              })}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                <path d={siGithub.path} />
              </svg>
              Star on Github
            </Rac.Link>
          </div>
        </div>
      </div>
    </div>
  );
}
