import type { User } from "better-auth/types";
import { createAuthService } from "@/lib/auth-service";
import { invariant } from "@epic-web/invariant";
import { env } from "cloudflare:workers";
import { RequestContext } from "lib/request-context";
import { createStripeService } from "lib/stripe-service";
import { RouterContextProvider } from "react-router";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  action as acceptInvitationAction,
  loader as acceptInvitationLoader,
} from "~/routes/accept-invitation.$invitationId";
import { action as loginAction } from "~/routes/login";
import { loader as magicLinkLoader } from "~/routes/magic-link";
import { action as signOutAction } from "~/routes/signout";
import { resetDb } from "../test-utils";

type TestContext = Awaited<ReturnType<typeof createTestContext>>;
type TestUser = Awaited<ReturnType<TestContext["createTestUser"]>>;

async function createTestContext() {
  await resetDb();

  const mockSendMagicLink = vi.fn().mockResolvedValue(undefined);
  const mockSendInvitationEmail = vi.fn().mockResolvedValue(undefined);
  const auth = createAuthService({
    db: env.D1.withSession(),
    stripeService: createStripeService(),
    sesService: {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      async sendEmail() {},
    },
    sendMagicLink: mockSendMagicLink,
    sendInvitationEmail: mockSendInvitationEmail,
  });
  const context = async ({ headers }: { headers?: Headers } = {}) => {
    const session = headers
      ? ((await auth.api.getSession({ headers })) ?? undefined)
      : undefined;
    const context = new RouterContextProvider();
    context.set(RequestContext, {
      env,
      authService: auth,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      repository: {} as any,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      stripeService: {} as any,
      session,
    });
    return context;
  };

  const sessionCookie = (response: Response) => {
    const setCookieHeader = response.headers.get("Set-Cookie");
    invariant(setCookieHeader, "Expected Set-Cookie header.");
    const match = setCookieHeader.match(/better-auth\.session_token=([^;]+)/);
    if (!match) throw new Error(`Missing session cookie: ${setCookieHeader}`);
    return `better-auth.session_token=${match[1]}`;
  };

  const createTestUser = async (email: User["email"]) => {
    const user = {
      email,
      headers: new Headers(),
      context: async () => context({ headers: user.headers }),
      session: async () => await auth.api.getSession({ headers: user.headers }),
    };
    const signInMagicLinkResponse = await auth.api.signInMagicLink({
      asResponse: true,
      headers: {},
      body: { email: user.email },
    });
    if (signInMagicLinkResponse.status !== 200)
      throw new Error("createUser: failed to signInMagicLink", {
        cause: signInMagicLinkResponse,
      });
    const magicLinkToken = (
      mockSendMagicLink.mock.calls[0][0] as { token: string }
    ).token;
    mockSendMagicLink.mockReset();
    const magicLinkVerifyResponse = await auth.api.magicLinkVerify({
      asResponse: true,
      headers: {},
      query: {
        token: magicLinkToken,
        // No callbackURL's so response is not redirect and we can check for status 200
      },
    });
    if (magicLinkVerifyResponse.status !== 200)
      throw new Error("createUser: failed to verify magic link", {
        cause: magicLinkVerifyResponse,
      });
    user.headers.set("Cookie", sessionCookie(magicLinkVerifyResponse));
    return user;
  };

  return {
    db: env.D1,
    auth,
    context,
    mockSendMagicLink,
    mockSendInvitationEmail,
    adminEmail: "a@a.com", // MUST align with admin in test database.
    createTestUser,
    sessionCookie,
  };
}

describe("user authentication flow", () => {
  let c: TestContext;
  let magicLinkUrl: string | undefined;
  let testUser: TestUser;

  beforeAll(async () => {
    c = await createTestContext();
    testUser = await c.createTestUser("regular-user@test.com");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs in with email", async () => {
    const form = new FormData();
    form.append("email", testUser.email);
    const request = new Request("http://localhost/login", {
      method: "POST",
      body: form,
    });

    await loginAction({
      request,
      context: await c.context(),
      params: {},
    });
    expect(c.mockSendMagicLink).toHaveBeenCalledTimes(1);
    magicLinkUrl = (c.mockSendMagicLink.mock.calls[0][0] as { url: string })
      .url;
  });

  it("signs in with magic link", async () => {
    invariant(magicLinkUrl, "Expected magicLinkUrl");
    const request = new Request(magicLinkUrl);

    const response = await c.auth.handler(request);

    expect(response.status).toBe(302);
    expect(response.headers.has("Set-Cookie")).toBe(true);
  });

  it("signs out successfully", async () => {
    const form = new FormData();
    const request = new Request("http://localhost/signout", {
      method: "POST",
      body: form,
      headers: testUser.headers,
    });

    const response = await signOutAction({
      request,
      context: await testUser.context(),
      params: {},
    });

    invariant(response instanceof Response, "Expected Response");
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("/");

    // Verify session is cleared
    const sessionAfterSignout = await c.auth.api.getSession({
      headers: testUser.headers,
    });
    expect(sessionAfterSignout).toBeNull();
  });

  it("redirects user role to /app after magic link verification", async () => {
    // Create a new magic link for the user
    const form = new FormData();
    form.append("email", testUser.email);
    const loginRequest = new Request("http://localhost/login", {
      method: "POST",
      body: form,
    });

    await loginAction({
      request: loginRequest,
      context: await c.context(),
      params: {},
    });

    const newMagicLinkUrl = (
      c.mockSendMagicLink.mock.calls[0][0] as { url: string }
    ).url;
    invariant(newMagicLinkUrl, "Expected magicLinkUrl");

    // Verify the magic link (this should establish the session)
    const verifyRequest = new Request(newMagicLinkUrl);
    const verifyResponse = await c.auth.handler(verifyRequest);

    expect(verifyResponse.status).toBe(302);
    expect(verifyResponse.headers.has("Set-Cookie")).toBe(true);

    // Update testUser headers with the new session cookie
    const sessionCookie = c.sessionCookie(verifyResponse);
    testUser.headers.set("Cookie", sessionCookie);

    // Now check that the loader would redirect user to /app
    const loaderRequest = new Request("http://localhost/magic-link", {
      headers: testUser.headers,
    });
    const loaderResult = await magicLinkLoader({
      request: loaderRequest,
      context: await testUser.context(),
      params: {},
    });

    // The loader should redirect user to /app
    invariant(loaderResult instanceof Response, "Expected Response");
    expect(loaderResult.status).toBe(302);
    expect(loaderResult.headers.get("Location")).toBe("/app");
  });

  it("handles invalid email format", async () => {
    const form = new FormData();
    form.append("email", "invalid-email");
    const request = new Request("http://localhost/login", {
      method: "POST",
      body: form,
    });

    const result = await loginAction({
      request,
      context: await c.context(),
      params: {},
    });

    expect(result.success).toBe(false);
    expect(result.validationErrors?.email).toBeDefined();
  });
});

describe("accept invitation flow", () => {
  const inviteeEmail = "invitee@test.com";
  let invitationId: string | undefined;
  let c: TestContext;
  let testUser: TestUser;
  let inviteeUser: TestUser;

  beforeAll(async () => {
    c = await createTestContext();
    testUser = await c.createTestUser("test@test.com");
    inviteeUser = await c.createTestUser(inviteeEmail);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates invitation", async () => {
    const session = await testUser.session();
    invariant(session, "Expected session");
    invariant(
      session.session.activeOrganizationId,
      "Expected activeOrganizationId",
    );

    const response = await c.auth.api.createInvitation({
      asResponse: true,
      headers: testUser.headers,
      body: {
        email: inviteeEmail,
        role: "member",
        organizationId: session.session.activeOrganizationId,
        resend: true,
      },
    });

    expect(response.status).toBe(200);
    expect(c.mockSendInvitationEmail).toHaveBeenCalledTimes(1);
    invitationId = (
      c.mockSendInvitationEmail.mock.calls[0][0] as {
        invitation: { id: string };
      }
    ).invitation.id;
    invariant(invitationId, "Expected invitationId");
  });

  it("creates admin invitation (repro)", async () => {
    const session = await testUser.session();
    invariant(session, "Expected session");
    invariant(
      session.session.activeOrganizationId,
      "Expected activeOrganizationId",
    );

    const result = await c.auth.api.createInvitation({
      headers: testUser.headers,
      body: {
        email: "admin-invite@test.com",
        role: "admin",
        organizationId: session.session.activeOrganizationId,
        resend: true,
      },
    });

    expect(result.role).toBe("admin");
    expect(c.mockSendInvitationEmail).toHaveBeenCalledTimes(1);
    const sendInvitationEmailData = c.mockSendInvitationEmail.mock
      .calls[0][0] as { invitation: { id: string; role: string } };
    expect(sendInvitationEmailData).toBeDefined();
    expect(sendInvitationEmailData.invitation.role).toBe("admin");
    const invitationId = sendInvitationEmailData.invitation.id;
    invariant(invitationId, "Expected invitationId");
    const row = await c.db
      .prepare("select role from Invitation where invitationId = ? limit 1")
      .bind(Number(invitationId))
      .first<{ role: string }>();
    invariant(row, "Expected row from Invitation table");
    expect(row.role).toBe("admin");
  });

  it("detects unauthenticated user trying to accept invitation", async () => {
    invariant(invitationId, "Expected invitationId");
    const result = acceptInvitationLoader({
      request: new Request("http://irrelevant.com"),
      context: await c.context(),
      params: { invitationId },
    });

    expect(result.needsAuth).toBe(true);
  });

  it("detects authenticated user trying to accept invitation", async () => {
    invariant(invitationId, "Expected invitationId");
    const result = acceptInvitationLoader({
      request: new Request("http://irrelevant.com"),
      context: await inviteeUser.context(),
      params: { invitationId },
    });

    expect(result.needsAuth).toBe(false);
  });

  it("accepts invitation", async () => {
    const form = new FormData();
    form.append("intent", "accept");
    const request = new Request("http://irrelevant.com", {
      method: "POST",
      body: form,
      headers: inviteeUser.headers,
    });
    invariant(invitationId, "Expected invitationId");
    const response = await acceptInvitationAction({
      request,
      context: await inviteeUser.context(),
      params: { invitationId },
    });

    invariant(response instanceof Response, "Expected Response");
    expect(response.status).toBe(302);
  });
});

describe("reject invitation flow", () => {
  const inviteeEmail = "invitee@test.com";
  let invitationId: string | undefined;
  let c: TestContext;
  let testUser: TestUser;
  let inviteeUser: TestUser;

  beforeAll(async () => {
    c = await createTestContext();
    testUser = await c.createTestUser("test@test.com");
    inviteeUser = await c.createTestUser(inviteeEmail);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates invitation", async () => {
    const session = await testUser.session();
    invariant(session, "Expected session");
    invariant(
      session.session.activeOrganizationId,
      "Expected activeOrganizationId",
    );

    const response = await c.auth.api.createInvitation({
      asResponse: true,
      headers: testUser.headers,
      body: {
        email: inviteeEmail,
        role: "member",
        organizationId: session.session.activeOrganizationId,
        resend: true,
      },
    });

    expect(response.status).toBe(200);
    expect(c.mockSendInvitationEmail).toHaveBeenCalledTimes(1);
    invitationId = (
      c.mockSendInvitationEmail.mock.calls[0][0] as {
        invitation: { id: string };
      }
    ).invitation.id;
    expect(invitationId).toBeDefined();
  });

  it("reject invitation", async () => {
    const form = new FormData();
    form.append("intent", "reject");
    const request = new Request("http://irrelevant.com", {
      method: "POST",
      body: form,
      headers: inviteeUser.headers,
    });
    invariant(invitationId, "Expected invitationId");

    const response = await acceptInvitationAction({
      request,
      context: await inviteeUser.context(),
      params: { invitationId },
    });

    invariant(response instanceof Response, "Expected Response");
    expect(response.status).toBe(302);
  });
});

describe("admin bootstrap", () => {
  let c: TestContext;
  let magicLinkUrl: string | undefined;

  beforeAll(async () => {
    c = await createTestContext();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs in with email", async () => {
    const form = new FormData();
    form.append("email", c.adminEmail);
    const request = new Request("http://localhost/login", {
      method: "POST",
      body: form,
    });

    await loginAction({
      request,
      context: await c.context(),
      params: {},
    });
    expect(c.mockSendMagicLink).toHaveBeenCalledTimes(1);
    magicLinkUrl = (c.mockSendMagicLink.mock.calls[0][0] as { url: string })
      .url;
  });

  it("signs in with magic link", async () => {
    invariant(magicLinkUrl, "Expected magicLinkUrl");
    const request = new Request(magicLinkUrl);

    const response = await c.auth.handler(request);

    expect(response.status).toBe(302);
    expect(response.headers.has("Set-Cookie")).toBe(true);
  });
});
