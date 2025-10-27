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

export const planData = [
  // in display order
  {
    name: "basic", // lowercase to accomodate better-auth
    displayName: "Basic",
    monthlyPriceInCents: 5000,
    monthlyPriceLookupKey: "basicMonthly",
    annualPriceInCents: Math.round(5000 * 12 * 0.8), // 20% discount for annual,
    annualPriceLookupKey: "basicAnnual",
    freeTrialDays: 7,
  },
  {
    name: "pro",
    displayName: "Pro",
    monthlyPriceInCents: 10000,
    monthlyPriceLookupKey: "proMonthly",
    annualPriceInCents: Math.round(10000 * 12 * 0.8),
    annualPriceLookupKey: "proAnnual",
    freeTrialDays: 14,
  },
] as const;

export const Plan = z.object({
  name: z.string().nonempty(),
  displayName: z.string().nonempty(),
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
