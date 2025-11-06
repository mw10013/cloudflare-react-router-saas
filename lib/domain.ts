import * as z from "zod";

/**
 * Domain schemas and inferred types for the application.
 * Each Zod schema is exported in PascalCase, followed by its inferred type with the same name.
 *
 * Schemas must align with corresponding database tables especially code tables for roles and statuses.
 */

const intToBoolean = z.codec(z.number().int(), z.boolean(), {
  decode: (num) => num !== 0,
  encode: (bool) => (bool ? 1 : 0),
});

/**
 * Custom codec for ISO datetime strings. Can't use z.iso() because it expects 'T' separator,
 * but SQLite supports ISO strings without 'T' (e.g., "2023-01-01 12:00:00").
 */
const isoDatetimeToDate = z.codec(z.string(), z.date(), {
  decode: (str, ctx) => {
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      ctx.issues.push({
        code: "invalid_format",
        format: "datetime",
        input: str,
        message: `Invalid datetime: ${str}`,
      });
      return z.NEVER; // Abort processing
    }
    return date;
  },
  encode: (date) => date.toISOString(),
});

export const UserRole = z.enum(["user", "admin"]);
export type UserRole = z.infer<typeof UserRole>;

export const MemberRole = z.enum(["member", "owner", "admin"]);
export type MemberRole = z.infer<typeof MemberRole>;

export const InvitationStatus = z.enum([
  "pending",
  "accepted",
  "rejected",
  "canceled",
]);
export type InvitationStatus = z.infer<typeof InvitationStatus>;

/**
 * Subscription status values that must align with Stripe's Subscription.Status.
 */
export const SubscriptionStatus = z.enum([
  "active",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "past_due",
  "paused",
  "trialing",
  "unpaid",
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatus>;

export const Invitation = z.object({
  invitationId: z.number().int(),
  email: z.email(),
  inviterId: z.number().int(),
  organizationId: z.number().int(),
  role: MemberRole,
  status: InvitationStatus,
  expiresAt: isoDatetimeToDate,
});
export type Invitation = z.infer<typeof Invitation>;

export const User = z.object({
  userId: z.number().int(),
  name: z.string(),
  email: z.email(),
  emailVerified: intToBoolean,
  image: z.string().nullable(),
  role: UserRole,
  banned: intToBoolean,
  banReason: z.string().nullable(),
  banExpires: z.nullable(isoDatetimeToDate),
  stripeCustomerId: z.string().nullable(),
  createdAt: isoDatetimeToDate,
  updatedAt: isoDatetimeToDate,
});
export type User = z.infer<typeof User>;

export const Session = z.object({
  sessionId: z.number().int(),
  expiresAt: isoDatetimeToDate,
  token: z.string(),
  createdAt: isoDatetimeToDate,
  updatedAt: isoDatetimeToDate,
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  userId: z.number().int(),
  impersonatedBy: z.number().int().nullable(),
  activeOrganizationId: z.number().int().nullable(),
});
export type Session = z.infer<typeof Session>;

export const Organization = z.object({
  organizationId: z.number().int(),
  name: z.string().nonempty(),
  slug: z.string().nonempty(),
  logo: z.string().nullable(),
  metadata: z.string().nullable(),
  createdAt: isoDatetimeToDate,
});
export type Organization = z.infer<typeof Organization>;

export const planData = [
  // in display order
  {
    name: "basic", // lowercase to accomodate better-auth
    displayName: "Basic",
    description: "For personal use.",
    monthlyPriceInCents: 5000,
    monthlyPriceLookupKey: "basic-monthly",
    annualPriceInCents: Math.round(5000 * 12 * 0.8), // 20% discount for annual,
    annualPriceLookupKey: "basic-annual",
    freeTrialDays: 2,
  },
  {
    name: "pro",
    displayName: "Pro",
    description: "For professionals.",
    monthlyPriceInCents: 10000,
    monthlyPriceLookupKey: "pro-monthly",
    annualPriceInCents: Math.round(10000 * 12 * 0.8),
    annualPriceLookupKey: "pro-annual",
    freeTrialDays: 7,
  },
] as const;

export const Plan = z.object({
  name: z.string().nonempty(),
  displayName: z.string().nonempty(),
  description: z.string().nonempty(),
  productId: z.string().nonempty(),
  monthlyPriceId: z.string().nonempty(),
  monthlyPriceLookupKey: z.string(),
  monthlyPriceInCents: z.number().int(),
  annualPriceId: z.string().nonempty(),
  annualPriceLookupKey: z.string().nonempty(),
  annualPriceInCents: z.number().int(),
  freeTrialDays: z.number().int(),
});
export type Plan = z.infer<typeof Plan>;

export const Subscription = z.object({
  subscriptionId: z.number().int(),
  plan: z.string().nonempty(),
  referenceId: z.number().int(),
  stripeCustomerId: z.string().nullable(),
  stripeSubscriptionId: z.string().nullable(),
  status: SubscriptionStatus,
  periodStart: z.nullable(isoDatetimeToDate),
  periodEnd: z.nullable(isoDatetimeToDate),
  cancelAtPeriodEnd: intToBoolean,
  seats: z.number().int().nullable(),
  trialStart: z.nullable(isoDatetimeToDate),
  trialEnd: z.nullable(isoDatetimeToDate),
});
export type Subscription = z.infer<typeof Subscription>;

export const UserWithSubscription = User.extend({
  subscription: Subscription.nullable(),
});
export type UserWithSubscription = z.infer<typeof UserWithSubscription>;

export const SubscriptionWithUser = Subscription.extend({
  user: User,
});
export type SubscriptionWithUser = z.infer<typeof SubscriptionWithUser>;

export const InvitationWithOrganizationAndInviter = Invitation.extend({
  organization: Organization,
  inviter: User,
});
export type InvitationWithOrganizationAndInviter = z.infer<
  typeof InvitationWithOrganizationAndInviter
>;

export const SessionWithUser = Session.extend({
  user: User,
});
export type SessionWithUser = z.infer<typeof SessionWithUser>;
