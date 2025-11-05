import * as Domain from "@/lib/domain";
import { invariant } from "@epic-web/invariant";
import * as z from "zod";

/**
 * The repository provides data access methods for the application's domain entities.
 *
 * Naming Conventions:
 * - `get*`: SELECT operations that retrieve entities
 * - `update*`: UPDATE operations that modify existing entities
 * - `upsert*`: INSERT OR UPDATE operations for creating or updating entities
 * - `create*`: INSERT operations for creating new entities
 * - `delete*`/`softDelete*`: DELETE operations (either physical or logical)
 *
 * Domain objects generally map 1:1 to sqlite tables and contain all columns.
 * SQL queries typically return JSON, especially for nested or composite domain objects.
 * Use select * for simple, single-table queries where all columns are needed.
 * Use explicit columns in json_object or nested queries to construct correct shapes.
 * No use of a.* or b.*; all multi-entity queries use explicit JSON construction.
 */

// https://www.scattered-thoughts.net/writing/sql-needed-structure/

export type Repository = ReturnType<typeof createRepository>;

export function createRepository({
  db,
}: {
  db: D1Database | D1DatabaseSession;
}) {
  const getUser = async ({ email }: { email: Domain.User["email"] }) => {
    const result = await db
      .prepare(`select * from User where email = ?`)
      .bind(email)
      .first();
    return Domain.User.nullable().parse(result);
  };

  const getAppDashboardData = async ({
    userEmail,
    organizationId,
  }: {
    userEmail: string;
    organizationId: string;
  }) => {
    const result = await db
      .prepare(
        `
select json_object(
  'userInvitations', (
    select json_group_array(
      json_object(
        'invitationId', i.invitationId,
        'email', i.email,
        'inviterId', i.inviterId,
        'organizationId', i.organizationId,
        'role', i.role,
        'status', i.status,
        'expiresAt', i.expiresAt,
        'organization', json_object(
          'organizationId', o.organizationId,
          'name', o.name,
          'slug', o.slug,
          'logo', o.logo,
          'metadata', o.metadata,
          'createdAt', o.createdAt
        ),
        'inviter', json_object(
          'userId', u.userId,
          'name', u.name,
          'email', u.email,
          'emailVerified', u.emailVerified,
          'image', u.image,
          'role', u.role,
          'banned', u.banned,
          'banReason', u.banReason,
          'banExpires', u.banExpires,
          'stripeCustomerId', u.stripeCustomerId,
          'createdAt', u.createdAt,
          'updatedAt', u.updatedAt
        )
      )
    )
    from Invitation i
    inner join Organization o on o.organizationId = i.organizationId
    inner join User u on u.userId = i.inviterId
    where i.email = ?1 and i.status = 'pending'
  ),
  'memberCount', (
    select count(*) from Member where organizationId = ?2
  ),
  'pendingInvitationCount', (
    select count(*) from Invitation where organizationId = ?2 and status = 'pending'
  )
) as data
        `,
      )
      .bind(userEmail, organizationId)
      .first();
    invariant(
      typeof result?.data === "string",
      "Expected result.data to be a string",
    );
    return z
      .object({
        userInvitations: Domain.InvitationWithOrganizationAndInviter.array(),
        memberCount: z.number(),
        pendingInvitationCount: z.number(),
      })
      .parse(JSON.parse(result.data));
  };

  const getAdminDashboardData = async () => {
    const result = await db
      .prepare(
        `
select json_object(
  'customerCount', (
    select count(*) from User where role = 'user'
  ),
  'activeSubscriptionCount', (
    select count(*) from Subscription where status = 'active'
  ),
  'trialingSubscriptionCount', (
    select count(*) from Subscription where status = 'trialing'
  )
) as data
        `,
      )
      .first();
    invariant(
      typeof result?.data === "string",
      "Expected result.data to be a string",
    );
    return z
      .object({
        customerCount: z.number(),
        activeSubscriptionCount: z.number(),
        trialingSubscriptionCount: z.number(),
      })
      .parse(JSON.parse(result.data));
  };

  const getCustomers = async ({
    limit,
    offset,
    searchValue,
  }: {
    limit: number;
    offset: number;
    searchValue?: string;
  }) => {
    const searchPattern = searchValue ? `%${searchValue}%` : "%";
    const result = await db
      .prepare(
        `
select json_object(
  'customers', coalesce((
    select json_group_array(
      json_object(
        'userId', u.userId,
        'name', u.name,
        'email', u.email,
        'emailVerified', u.emailVerified,
        'image', u.image,
        'role', u.role,
        'banned', u.banned,
        'banReason', u.banReason,
        'banExpires', u.banExpires,
        'stripeCustomerId', u.stripeCustomerId,
        'createdAt', u.createdAt,
        'updatedAt', u.updatedAt,
        'subscription', (
          select json_object(
            'subscriptionId', s.subscriptionId,
            'plan', s.plan,
            'referenceId', s.referenceId,
            'stripeCustomerId', s.stripeCustomerId,
            'stripeSubscriptionId', s.stripeSubscriptionId,
            'status', s.status,
            'periodStart', s.periodStart,
            'periodEnd', s.periodEnd,
            'cancelAtPeriodEnd', s.cancelAtPeriodEnd,
            'seats', s.seats,
            'trialStart', s.trialStart,
            'trialEnd', s.trialEnd
          ) from Subscription s where s.stripeCustomerId = u.stripeCustomerId limit 1
        )
      )
    ) from (
      select * from User u
      where u.role = 'user'
      and u.email like ?
      order by u.email asc
      limit ? offset ?
    ) as u
  ), json('[]')),
  'count', (
    select count(*) from User u where u.role = 'user' and u.email like ?
  ),
  'limit', ?,
  'offset', ?
) as data
        `,
      )
      .bind(searchPattern, limit, offset, searchPattern, limit, offset)
      .first();
    invariant(
      typeof result?.data === "string",
      "Expected result.data to be a string",
    );
    return z
      .object({
        customers: Domain.UserWithSubscription.array(),
        count: z.number(),
        limit: z.number(),
        offset: z.number(),
      })
      .parse(JSON.parse(result.data));
  };

  return {
    getUser,
    getAppDashboardData,
    getAdminDashboardData,
    getCustomers,
  };
}
