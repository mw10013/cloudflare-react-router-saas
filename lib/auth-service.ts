import type { StripeService } from "@/lib/stripe-service";
import type { BetterAuthOptions } from "better-auth";
import type { createSesService } from "./ses-service";
import { d1Adapter } from "@/lib/d1-adapter";
import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { admin, magicLink, organization } from "better-auth/plugins";
import { env } from "cloudflare:workers";

export type AuthService = ReturnType<typeof createAuthService>;

// [BUG]: Stripe plugin does not handle lookupKey and annualDiscountLookupKey in onCheckoutSessionCompleted: https://github.com/better-auth/better-auth/issues/3537
// STRIPE. Duplicate customers are created when using createCustomerOnSignUp: true and and a customer with same email exists in stripe: https://github.com/better-auth/better-auth/issues/3670
// TypeScript Error: "The inferred type of this node exceeds the maximum length the compiler will serialize" when using admin and organization plugins together. : https://github.com/better-auth/better-auth/issues/3067#issuecomment-2988246817

interface CreateAuthServiceOptions {
  db: D1Database | D1DatabaseSession;
  stripeService: StripeService;
  sesService: ReturnType<typeof createSesService>;
  // sendResetPassword?: NonNullable<
  //   BetterAuthOptions["emailAndPassword"]
  // >["sendResetPassword"];
  // sendVerificationEmail?: NonNullable<
  //   BetterAuthOptions["emailVerification"]
  // >["sendVerificationEmail"];
  // afterEmailVerification?: NonNullable<
  //   BetterAuthOptions["emailVerification"]
  // >["afterEmailVerification"];
  sendMagicLink?: Parameters<typeof magicLink>[0]["sendMagicLink"];
  sendInvitationEmail?: NonNullable<
    Parameters<typeof organization>[0]
  >["sendInvitationEmail"];
  databaseHookUserCreateAfter?: NonNullable<
    NonNullable<
      NonNullable<BetterAuthOptions["databaseHooks"]>["user"]
    >["create"]
  >["after"];
  databaseHookSessionCreateBefore?: NonNullable<
    NonNullable<
      NonNullable<BetterAuthOptions["databaseHooks"]>["session"]
    >["create"]
  >["before"];
}

function createBetterAuthOptions({
  db,
  stripeService,
  sesService,
  // sendResetPassword,
  // sendVerificationEmail,
  // afterEmailVerification,
  sendMagicLink,
  sendInvitationEmail,
  databaseHookUserCreateAfter,
  databaseHookSessionCreateBefore,
}: CreateAuthServiceOptions) {
  return {
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    telemetry: { enabled: false },
    rateLimit: { enabled: false },
    database: d1Adapter(db),
    user: { modelName: "User" },
    session: { modelName: "Session", storeSessionInDatabase: true },
    account: {
      modelName: "Account",
      fields: { accountId: "betterAuthAccountId" },
      accountLinking: { enabled: true },
    },
    verification: { modelName: "Verification" },
    // emailAndPassword: {
    //   enabled: true,
    //   requireEmailVerification: true,
    //   sendResetPassword:
    //     sendResetPassword ??
    //     (async ({ user, url, token }) => {
    //       console.log("sendResetPassword", { to: user.email, url, token });
    //       await sesService.sendEmail({
    //         to: user.email,
    //         from: env.TRANSACTIONAL_EMAIL,
    //         subject: "Reset your password",
    //         text: `Click the link to reset your password: ${url}`,
    //         html: `<a href="${url}">Click here to reset your password</a>`,
    //       });
    //     }),
    // },
    // emailVerification: {
    //   sendOnSignUp: true,
    //   sendOnSignIn: true,
    //   autoSignInAfterVerification: true,
    //   sendVerificationEmail:
    //     sendVerificationEmail ??
    //     (async ({ user, url, token }) => {
    //       console.log("sendVerificationEmail", { to: user.email, url, token });
    //       await sesService.sendEmail({
    //         to: user.email,
    //         from: env.TRANSACTIONAL_EMAIL,
    //         subject: "Please verify your email",
    //         text: `Click the link to verify your email: ${url}`,
    //         html: `<a href="${url}">Click here to verify your email</a>`,
    //       });
    //     }),
    //   afterEmailVerification,
    // },
    advanced: {
      database: { generateId: false, useNumberId: true },
      ipAddress: {
        ipAddressHeaders: ["cf-connecting-ip"],
      },
    },
    databaseHooks: {
      user: {
        create: {
          after:
            databaseHookUserCreateAfter ??
            ((user) => {
              console.log("databaseHooks.user.create.after", user);
              return Promise.resolve();
            }),
        },
      },
      session: {
        create: {
          before:
            databaseHookSessionCreateBefore ??
            ((session) => {
              console.log("databaseHooks.session.create.before", session);
              return Promise.resolve();
            }),
        },
      },
    },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (
          ctx.path === "/subscription/upgrade" ||
          ctx.path === "/subscription/billing-portal" ||
          ctx.path === "/subscription/cancel-subscription"
        ) {
          console.log(`better-auth: hooks: before: ${ctx.path}`);
          await stripeService.ensureBillingPortalConfiguration();
        }
      }),
    },
    plugins: [
      magicLink({
        storeToken: "hashed",
        sendMagicLink:
          sendMagicLink ??
          (async (data) => {
            console.log("sendMagicLink", data);
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (env.DEMO_MODE === "true") {
              await env.KV.put(`demo:magicLink`, data.url, {
                expirationTtl: 60,
              });
            }
            await sesService.sendEmail({
              to: data.email,
              from: env.TRANSACTIONAL_EMAIL,
              subject: "Your Magic Link",
              text: `Click the link to sign in: ${data.url}`,
              html: `<a href="${data.url}">Click here to sign in</a>`,
            });
          }),
      }),
      admin(),
      organization({
        organizationLimit: 1,
        requireEmailVerificationOnInvitation: true,
        cancelPendingInvitationsOnReInvite: true,
        schema: {
          organization: { modelName: "Organization" },
          member: { modelName: "Member" },
          invitation: { modelName: "Invitation" },
        },
        sendInvitationEmail:
          sendInvitationEmail ??
          (async (data) => {
            const url = `${env.BETTER_AUTH_URL}/accept-invitation/${data.id}`;
            await sesService.sendEmail({
              to: data.email,
              from: env.TRANSACTIONAL_EMAIL,
              subject: "You're invited!",
              text: `Click the link to accept your invitation: ${url}`,
              html: `<a href="${url}">Click here to accept your invitation</a>`,
            });
          }),
      }),
      stripe({
        stripeClient: stripeService.stripe,
        stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
        createCustomerOnSignUp: false,
        subscription: {
          enabled: true,
          requireEmailVerification: true,
          // [BUG]: Stripe plugin does not handle lookupKey and annualDiscountLookupKey in onCheckoutSessionCompleted: https://github.com/better-auth/better-auth/issues/3537
          // Workaround: populate `priceId`.
          plans: async () => {
            // console.log(`stripe plugin: plans`);
            const plans = await stripeService.getPlans();
            return plans.map((plan) => ({
              name: plan.name,
              priceId: plan.monthlyPriceId,
              annualDiscountPriceId: plan.annualPriceId,
              freeTrial: {
                days: plan.freeTrialDays,
                onTrialStart: (subscription) => {
                  console.log(
                    `stripe plugin: onTrialStart: ${plan.name} plan trial started for subscription ${subscription.id}`,
                  );
                  return Promise.resolve();
                },
                onTrialEnd: ({ subscription }) => {
                  console.log(
                    `stripe plugin: onTrialEnd: ${plan.name} plan trial ended for subscription ${subscription.id}`,
                  );
                  return Promise.resolve();
                },
                onTrialExpired: (subscription) => {
                  console.log(
                    `stripe plugin: onTrialExpired: ${plan.name} plan trial expired for subscription ${subscription.id}`,
                  );
                  return Promise.resolve();
                },
              },
            }));
          },
          authorizeReference: async ({ user, referenceId, action }) => {
            const result = Boolean(
              await db
                .prepare(
                  "select 1 from Member where userId = ? and organizationId = ? and role = 'owner'",
                )
                .bind(Number(user.id), Number(referenceId))
                .first(),
            );
            console.log(
              `stripe plugin: authorizeReference: user ${user.id} is attempting to ${action} subscription for referenceId ${referenceId}, authorized: ${String(result)}`,
            );
            return result;
          },
          onSubscriptionComplete: ({ subscription, plan }) => {
            console.log(
              `stripe plugin: onSubscriptionComplete: subscription ${subscription.id} completed for plan ${plan.name}`,
            );
            return Promise.resolve();
          },
          onSubscriptionUpdate: ({ subscription }) => {
            console.log(
              `stripe plugin: onSubscriptionUpdate: subscription ${subscription.id} updated`,
            );
            return Promise.resolve();
          },
          onSubscriptionCancel: ({ subscription }) => {
            console.log(
              `stripe plugin: onSubscriptionCancel: subscription ${subscription.id} canceled`,
            );
            return Promise.resolve();
          },
          onSubscriptionDeleted: ({ subscription }) => {
            console.log(
              `stripe plugin: onSubscriptionDeleted: subscription ${subscription.id} deleted`,
            );
            return Promise.resolve();
          },
        },
        schema: {
          subscription: {
            modelName: "Subscription",
          },
        },
        onCustomerCreate: ({ stripeCustomer, user }) => {
          console.log(
            `stripe plugin: onCustomerCreate: customer ${stripeCustomer.id} created for user ${user.email}`,
          );
          return Promise.resolve();
        },
        onEvent: (event) => {
          console.log(
            `stripe plugin: onEvent: stripe event received: ${event.type}`,
          );
          return Promise.resolve();
        },
      }),
    ],
  } satisfies BetterAuthOptions;
}

export function createAuthService(
  options: CreateAuthServiceOptions,
): ReturnType<typeof betterAuth<ReturnType<typeof createBetterAuthOptions>>> {
  const auth = betterAuth(
    createBetterAuthOptions({
      databaseHookUserCreateAfter: async (user) => {
        // https://github.com/better-auth/better-auth/issues/2010
        if (user.role === "user") {
          await auth.api.createOrganization({
            body: {
              name: `${user.email.charAt(0).toUpperCase() + user.email.slice(1)}'s Organization`,
              slug: user.email.replace(/[^a-z0-9]/g, "-").toLowerCase(),
              userId: user.id,
            },
          });
        }
      },
      databaseHookSessionCreateBefore: async (session) => {
        // https://github.com/better-auth/better-auth/issues/2010
        const activeOrganizationId =
          (await options.db
            .prepare(
              "select organizationId from Member where userId = ? and role = 'owner'",
            )
            .bind(session.userId)
            .first<number>("organizationId")) ?? undefined;
        return {
          data: {
            ...session,
            activeOrganizationId,
          },
        };
      },
      ...options,
    }),
  );
  return auth;
}
