import type { User } from "better-auth/types";
import { invariant } from "@epic-web/invariant";
import { env } from "cloudflare:workers";
import { RouterContextProvider } from "react-router";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { createAuth } from "~/lib/auth";
import { RequestContext } from "~/lib/request-context";
import { createStripeService } from "~/lib/stripe-service";
import {
  action as acceptInvitationAction,
  loader as acceptInvitationLoader,
} from "~/routes/accept-invitation.$invitationId";
import { action as forgotPasswordAction } from "~/routes/forgot-password";
import { action as loginAction } from "~/routes/login";
import { action as resetPasswordAction } from "~/routes/reset-password";
import { action as signInAction } from "~/routes/signin";
import { action as signOutAction } from "~/routes/signout";
import { action as signUpAction } from "~/routes/signup";
import { resetDb } from "../test-utils";

type TestContext = Awaited<ReturnType<typeof createTestContext>>;
type TestUser = Awaited<ReturnType<TestContext["createTestUser"]>>;

async function createTestContext() {
  await resetDb();

  const mockSendResetPassword = vi.fn().mockResolvedValue(undefined);
  const mockSendVerificationEmail = vi.fn().mockResolvedValue(undefined);
  const mockSendMagicLink = vi.fn().mockResolvedValue(undefined);
  const mockSendInvitationEmail = vi.fn().mockResolvedValue(undefined);
  const auth = createAuth({
    d1: env.D1,
    stripeService: createStripeService(),
    ses: {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      async sendEmail() {},
    },
    sendResetPassword: mockSendResetPassword,
    sendVerificationEmail: mockSendVerificationEmail,
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
      auth,
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
    mockSendVerificationEmail,
    mockSendResetPassword,
    mockSendMagicLink,
    mockSendInvitationEmail,
    adminEmail: "a@a.com", // MUST align with admin in test database.
    createTestUser,
    sessionCookie,
  };
}

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

describe("auth sign up flow", () => {
  const email = "email@test.com";
  const password = "password";
  const headers = new Headers();
  let emailVerificationUrl: string | undefined;
  let c: TestContext;

  beforeAll(async () => {
    c = await createTestContext();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("signs up", async () => {
    const form = new FormData();
    form.append("email", email);
    form.append("password", password);
    const request = new Request("http://localhost/signup", {
      method: "POST",
      body: form,
    });

    await expect(
      signUpAction({
        request,
        context: await c.context(),
        params: {},
      }),
    ).rejects.toSatisfy(
      (response: unknown) =>
        response instanceof Response &&
        response.status === 302 &&
        response.headers.get("location") === "/",
    );

    expect(c.mockSendVerificationEmail).toHaveBeenCalledTimes(1);
    emailVerificationUrl = (
      c.mockSendVerificationEmail.mock.calls[0][0] as { url: string }
    ).url;
    expect(emailVerificationUrl).toBeDefined();
  });

  it("does not sign up when user already exists", async () => {
    const form = new FormData();
    form.append("email", email);
    form.append("password", password);
    const request = new Request("http://localhost/signup", {
      method: "POST",
      body: form,
    });

    await expect(
      signUpAction({
        request,
        context: await c.context(),
        params: {},
      }),
    ).rejects.toSatisfy(
      (response: unknown) =>
        response instanceof Response &&
        response.status === 302 &&
        response.headers.get("location") === "/signin",
    );
  });

  it("does not sign in with unverified email", async () => {
    const form = new FormData();
    form.append("email", email);
    form.append("password", password);
    const request = new Request("http://localhost/signin", {
      method: "POST",
      body: form,
    });

    await expect(
      signInAction({
        request,
        context: await c.context(),
        params: {},
      }),
    ).rejects.toSatisfy(
      (response: unknown) =>
        response instanceof Response &&
        response.status === 302 &&
        response.headers.get("location") === "/email-verification",
    );

    expect(c.mockSendVerificationEmail).toHaveBeenCalledTimes(1);
    emailVerificationUrl = (
      c.mockSendVerificationEmail.mock.calls[0][0] as { url: string }
    ).url;
    expect(emailVerificationUrl).toBeDefined();
  });

  it("verifies email", async () => {
    invariant(emailVerificationUrl, "Expected emailVerificationUrl");
    const request = new Request(emailVerificationUrl);

    const response = await c.auth.handler(request);

    expect(response.status).toBe(302);
    expect(response.headers.has("Set-Cookie")).toBe(true);
    headers.set("Cookie", c.sessionCookie(response));
  });

  it("has valid session", async () => {
    const session = await c.auth.api.getSession({ headers });
    invariant(session, "Expected session");
    expect(session.user.email).toBe(email);
  });

  it("signs out", async () => {
    const request = new Request("http://localhost/signout", {
      method: "POST",
      headers,
    });

    const response = await signOutAction({
      request,
      context: await c.context(),
      params: {},
    });

    expect(response.status).toBe(302);
    expect(response.headers.has("Set-Cookie")).toBe(true);
  });

  it("does not sign in with invalid password", async () => {
    const form = new FormData();
    form.append("email", email);
    form.append("password", "INVALID_PASSWORD");
    const request = new Request("http://localhost/signin", {
      method: "POST",
      body: form,
    });

    await expect(
      signInAction({ request, context: await c.context(), params: {} }),
    ).rejects.toSatisfy(
      (thrown: unknown) => thrown instanceof Response && thrown.status === 401,
    );
  });

  it("signs in with valid password", async () => {
    const form = new FormData();
    form.append("email", email);
    form.append("password", password);
    const request = new Request("http://localhost/signin", {
      method: "POST",
      body: form,
    });

    await expect(
      signInAction({
        request,
        context: await c.context(),
        params: {},
      }),
    ).rejects.toSatisfy(
      (response: unknown) =>
        response instanceof Response &&
        response.status === 302 &&
        response.headers.get("location") === "/" &&
        response.headers.has("Set-Cookie"),
    );
  });
});

describe("auth forgot password flow", () => {
  const newPassword = "newpass123456";
  let resetPasswordUrl: string | undefined;
  let resetToken: string | undefined;
  let c: TestContext;
  let testUser: TestUser;

  beforeAll(async () => {
    c = await createTestContext();
    testUser = await c.createTestUser("test@test.com");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends reset password email", async () => {
    const form = new FormData();
    form.append("email", testUser.email);
    const request = new Request("http://localhost/forgot-password", {
      method: "POST",
      body: form,
    });

    await forgotPasswordAction({
      request,
      context: await c.context(),
      params: {},
    });

    expect(c.mockSendResetPassword).toHaveBeenCalledTimes(1);
    resetPasswordUrl = (
      c.mockSendResetPassword.mock.calls[0][0] as { url: string }
    ).url;
    expect(resetPasswordUrl).toBeDefined();
    resetToken = (c.mockSendResetPassword.mock.calls[0][0] as { token: string })
      .token;
    expect(resetToken).toBeDefined();
  });

  it("allows reset password", async () => {
    invariant(resetPasswordUrl, "Expected resetPasswordUrl");
    const request = new Request(resetPasswordUrl);

    const response = await c.auth.handler(request);

    expect(response.status).toBe(302);
    expect(response.headers.get("location")?.includes("/reset-password")).toBe(
      true,
    );
  });

  it("resets password", async () => {
    const form = new FormData();
    form.append("password", newPassword);
    invariant(resetToken, "Expected resetToken");
    form.append("token", resetToken);
    const request = new Request("http://localhost/reset-password", {
      method: "POST",
      body: form,
    });

    const result = await resetPasswordAction({
      request,
      context: await c.context(),
      params: {},
    });

    expect(result.success).toBe(true);
  });

  it("signs in with new password", async () => {
    const form = new FormData();
    form.append("email", testUser.email);
    form.append("password", newPassword);
    const request = new Request("http://localhost/signin", {
      method: "POST",
      body: form,
    });

    await expect(
      signInAction({
        request,
        context: await c.context(),
        params: {},
      }),
    ).rejects.toSatisfy(
      (response: unknown) =>
        response instanceof Response &&
        response.status === 302 &&
        response.headers.get("location") === "/" &&
        response.headers.has("Set-Cookie"),
    );
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
