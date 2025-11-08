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
      .prepare(`select * from User where email = ?1`)
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
      and u.email like ?1
      order by u.email asc
      limit ?2 offset ?3
    ) as u
  ), json('[]')),
  'count', (
    select count(*) from User u where u.role = 'user' and u.email like ?1
  ),
  'limit', ?2,
  'offset', ?3
) as data
        `,
      )
      .bind(searchPattern, limit, offset)
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

  const getSubscriptions = async ({
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
  'subscriptions', coalesce((
    select json_group_array(
      json_object(
        'subscriptionId', s_subscriptionId,
        'plan', s_plan,
        'referenceId', s_referenceId,
        'stripeCustomerId', s_stripeCustomerId,
        'stripeSubscriptionId', s_stripeSubscriptionId,
        'status', s_status,
        'periodStart', s_periodStart,
        'periodEnd', s_periodEnd,
        'cancelAtPeriodEnd', s_cancelAtPeriodEnd,
        'seats', s_seats,
        'trialStart', s_trialStart,
        'trialEnd', s_trialEnd,
        'user', json_object(
          'userId', u_userId,
          'name', u_name,
          'email', u_email,
          'emailVerified', u_emailVerified,
          'image', u_image,
          'role', u_role,
          'banned', u_banned,
          'banReason', u_banReason,
          'banExpires', u_banExpires,
          'stripeCustomerId', u_stripeCustomerId,
          'createdAt', u_createdAt,
          'updatedAt', u_updatedAt
        )
      )
    ) from (
      select 
        s.subscriptionId as s_subscriptionId,
        s.plan as s_plan,
        s.referenceId as s_referenceId,
        s.stripeCustomerId as s_stripeCustomerId,
        s.stripeSubscriptionId as s_stripeSubscriptionId,
        s.status as s_status,
        s.periodStart as s_periodStart,
        s.periodEnd as s_periodEnd,
        s.cancelAtPeriodEnd as s_cancelAtPeriodEnd,
        s.seats as s_seats,
        s.trialStart as s_trialStart,
        s.trialEnd as s_trialEnd,
        u.userId as u_userId,
        u.name as u_name,
        u.email as u_email,
        u.emailVerified as u_emailVerified,
        u.image as u_image,
        u.role as u_role,
        u.banned as u_banned,
        u.banReason as u_banReason,
        u.banExpires as u_banExpires,
        u.stripeCustomerId as u_stripeCustomerId,
        u.createdAt as u_createdAt,
        u.updatedAt as u_updatedAt
      from Subscription s
      inner join User u on u.stripeCustomerId = s.stripeCustomerId
      where u.email like ?1
      order by u_email asc, s_subscriptionId asc
      limit ?2 offset ?3
    ) as joined
  ), json('[]')),
  'count', (
    select count(*)
    from Subscription s
    inner join User u on u.stripeCustomerId = s.stripeCustomerId
    where u.email like ?1
  ),
  'limit', ?2,
  'offset', ?3
) as data
        `,
      )
      .bind(searchPattern, limit, offset)
      .first();
    invariant(
      typeof result?.data === "string",
      "Expected result.data to be a string",
    );
    return z
      .object({
        subscriptions: Domain.SubscriptionWithUser.array(),
        count: z.number(),
        limit: z.number(),
        offset: z.number(),
      })
      .parse(JSON.parse(result.data));
  };

  const getSessions = async ({
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
  'sessions', coalesce((
    select json_group_array(
      json_object(
        'sessionId', s_sessionId,
        'expiresAt', s_expiresAt,
        'token', s_token,
        'createdAt', s_createdAt,
        'updatedAt', s_updatedAt,
        'ipAddress', s_ipAddress,
        'userAgent', s_userAgent,
        'userId', s_userId,
        'impersonatedBy', s_impersonatedBy,
        'activeOrganizationId', s_activeOrganizationId,
        'user', json_object(
          'userId', u_userId,
          'name', u_name,
          'email', u_email,
          'emailVerified', u_emailVerified,
          'image', u_image,
          'role', u_role,
          'banned', u_banned,
          'banReason', u_banReason,
          'banExpires', u_banExpires,
          'stripeCustomerId', u_stripeCustomerId,
          'createdAt', u_createdAt,
          'updatedAt', u_updatedAt
        )
      )
    ) from (
      select 
        s.sessionId as s_sessionId,
        s.expiresAt as s_expiresAt,
        s.token as s_token,
        s.createdAt as s_createdAt,
        s.updatedAt as s_updatedAt,
        s.ipAddress as s_ipAddress,
        s.userAgent as s_userAgent,
        s.userId as s_userId,
        s.impersonatedBy as s_impersonatedBy,
        s.activeOrganizationId as s_activeOrganizationId,
        u.userId as u_userId,
        u.name as u_name,
        u.email as u_email,
        u.emailVerified as u_emailVerified,
        u.image as u_image,
        u.role as u_role,
        u.banned as u_banned,
        u.banReason as u_banReason,
        u.banExpires as u_banExpires,
        u.stripeCustomerId as u_stripeCustomerId,
        u.createdAt as u_createdAt,
        u.updatedAt as u_updatedAt
      from Session s
      inner join User u on s.userId = u.userId
      where u.email like ?1
      order by u_email asc, s_createdAt asc
      limit ?2 offset ?3
    ) as joined
  ), json('[]')),
  'count', (
    select count(*)
    from Session s
    inner join User u on s.userId = u.userId
    where u.email like ?1
  ),
  'limit', ?2,
  'offset', ?3
) as data
        `,
      )
      .bind(searchPattern, limit, offset)
      .first();
    invariant(
      typeof result?.data === "string",
      "Expected result.data to be a string",
    );
    return z
      .object({
        sessions: Domain.SessionWithUser.array(),
        count: z.number(),
        limit: z.number(),
        offset: z.number(),
      })
      .parse(JSON.parse(result.data));
  };

  const updateInvitationRole = async ({
    invitationId,
    role,
  }: {
    invitationId: number;
    role: string;
  }) => {
    await db
      .prepare("update Invitation set role = ?1 where invitationId = ?2")
      .bind(role, invitationId)
      .run();
  };

  const deleteExpiredSessions = async () => {
    const result = await db
      .prepare("delete from Session where expiresAt < datetime('now')")
      .run();
    return result.meta.changes;
  };

  return {
    getUser,
    getAppDashboardData,
    getAdminDashboardData,
    getCustomers,
    getSubscriptions,
    getSessions,
    updateInvitationRole,
    deleteExpiredSessions,
  };
}
