-- Migration number: 0001 	 2025-01-31T00:42:00.000Z
create table UserRole (userRoleId text primary key);

--> statement-breakpoint
insert into
  UserRole (userRoleId)
values
  ('user'),
  ('admin');

--> statement-breakpoint
create table MemberRole (memberRoleId text primary key);

--> statement-breakpoint
insert into
  MemberRole (memberRoleId)
values
  ('member'),
  ('owner'),
  ('admin');

--> statement-breakpoint
create table InvitationStatus (invitationStatusId text primary key);

--> statement-breakpoint
insert into
  InvitationStatus (invitationStatusId)
values
  ('pending'),
  ('accepted'),
  ('rejected'),
  ('canceled');

--> statement-breakpoint
create table User (
  userId integer primary key,
  name text not null default '',
  email text not null unique,
  emailVerified integer not null default 0,
  image text,
  role text not null default 'user' references UserRole (userRoleId),
  banned integer not null default 0,
  banReason text,
  banExpires text,
  stripeCustomerId text unique,
  createdAt text not null default (datetime('now')),
  updatedAt text not null default (datetime('now'))
);

--> statement-breakpoint
create table Session (
  sessionId integer primary key,
  expiresAt text not null,
  token text not null unique,
  createdAt text not null default (datetime('now')),
  updatedAt text not null default (datetime('now')),
  ipAddress text,
  userAgent text,
  userId integer not null references User (userId) on delete cascade,
  impersonatedBy integer references User (userId),
  activeOrganizationId integer references Organization (organizationId) on delete cascade
);

--> statement-breakpoint
create index SessionUserIdIndex on Session (userId);

--> statement-breakpoint
create index SessionExpiresAtIndex on Session (expiresAt);

--> statement-breakpoint
create table Organization (
  organizationId integer primary key,
  name text not null,
  slug text not null unique,
  logo text,
  metadata text,
  createdAt text not null default (datetime('now'))
);

--> statement-breakpoint
create index OrganizationSlugIndex on Organization (slug);

--> statement-breakpoint
create table Member (
  memberId integer primary key,
  userId integer not null references User (userid) on delete cascade,
  organizationId integer not null references Organization (organizationId) on delete cascade,
  role text not null references MemberRole (memberRoleId),
  createdAt text not null default (datetime('now'))
);

--> statement-breakpoint
create index MemberUserIdIndex on Member (userId);

--> statement-breakpoint
create index MemberOrganizationIdIndex on Member (organizationId);

--> statement-breakpoint
create table Invitation (
  invitationId integer primary key,
  email text not null,
  inviterId integer not null references User (userId),
  organizationId integer not null references Organization (organizationId) on delete cascade,
  role text not null references MemberRole (memberRoleId),
  status text not null references InvitationStatus (invitationStatusId),
  expiresAt text not null
);

--> statement-breakpoint
create index InvitationEmailIndex on Invitation (email);

--> statement-breakpoint
create index InvitationOrganizationIdIndex on Invitation (organizationId);

--> statement-breakpoint
create table Account (
  accountId integer primary key,
  betterAuthAccountId text not null,
  providerId text not null,
  userId integer not null references User (userId) on delete cascade,
  accessToken text,
  refreshToken text,
  idToken text,
  accessTokenExpiresAt text,
  refreshTokenExpiresAt text,
  scope text,
  password text,
  createdAt text not null default (datetime('now')),
  updatedAt text not null default (datetime('now'))
);

--> statement-breakpoint
create index AccountUserIdIndex on Account (userId);

--> statement-breakpoint
create table Verification (
  verificationId integer primary key,
  identifier text not null,
  value text not null,
  expiresAt text not null,
  createdAt text not null default (datetime('now')),
  updatedAt text not null default (datetime('now'))
);

--> statement-breakpoint
create index VerificationIdentifierIndex on Verification (identifier);

--> statement-breakpoint
create index VerificationExpiresAtIndex on Verification (expiresAt);

create table Subscription (
  subscriptionId integer primary key,
  plan text not null,
  referenceId integer not null references Organization (organizationId) on delete cascade,
  stripeCustomerId text,
  stripeSubscriptionId text,
  status text not null,
  periodStart text,
  periodEnd text,
  cancelAtPeriodEnd integer,
  seats integer,
  trialStart text,
  trialEnd text
);

--> statement-breakpoint
insert into
  User (userId, name, email, role)
values
  (1, 'Admin', 'a@a.com', 'admin');

--> statement-breakpoint
insert into
  Account (
    accountId,
    betterAuthAccountId,
    providerId,
    userId,
    password
  )
values
  (1, '1', 'credential', 1, '');
