import { invariant } from "@epic-web/invariant";
import { env } from "cloudflare:workers";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { createAuth } from "~/lib/auth";
import { createStripeService } from "~/lib/stripe-service";
import { resetDb } from "../test-utils";

describe("better-auth sign up flow", () => {
  const email = "email@test.com";
  const password = "password";
  const name = "";
  const callbackURL = "/dashboard";
  const headers = new Headers();
  let emailVerificationUrl: string | undefined;
  let mockSendVerificationEmail: ReturnType<typeof vi.fn>;
  let auth: ReturnType<typeof createAuth>;

  beforeAll(async () => {
    await resetDb();
    mockSendVerificationEmail = vi.fn().mockResolvedValue(undefined);
    auth = createAuth({
      d1: env.D1,
      stripeService: createStripeService(),
      ses: {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        async sendEmail() {},
      },
      sendVerificationEmail: mockSendVerificationEmail,
    });
  });

  it("signs up", async () => {
    const response = await auth.api.signUpEmail({
      asResponse: true,
      body: {
        email,
        password,
        name,
        callbackURL,
      },
    });
    expect(response.ok).toBe(true);
    expect(mockSendVerificationEmail).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    emailVerificationUrl = mockSendVerificationEmail.mock.calls[0][0].url;
    expect(emailVerificationUrl).toBeDefined();
  });

  it("does not sign up when user already exists", async () => {
    const response = await auth.api.signUpEmail({
      asResponse: true,
      body: {
        email,
        password,
        name,
        callbackURL,
      },
    });

    expect(response.status).toBe(422);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    expect(((await response.json()) as any)?.code).toBe(
      "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
    );
  });

  it("does not sign in with unverified email", async () => {
    const response = await auth.api.signInEmail({
      asResponse: true,
      body: { email, password, callbackURL },
    });

    expect(response.status).toBe(403);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    expect(((await response.json()) as any)?.code).toBe("EMAIL_NOT_VERIFIED");
    expect(mockSendVerificationEmail).toHaveBeenCalledTimes(2);
  });

  it("does not verify email with invalid token", async () => {
    const request = new Request(
      "http://localhost:3000/api/auth/verify-email?token=INVALID_TOKEN&callbackURL=/dashboard",
    );
    const response = await auth.handler(request);

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "/dashboard?error=invalid_token",
    );
  });

  it("verifies email", async () => {
    invariant(emailVerificationUrl, "Expected emailVerificationUrl.");
    const request = new Request(emailVerificationUrl);

    const response = await auth.handler(request);

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(callbackURL);
    expect(response.headers.has("Set-Cookie")).toBe(true);

    const setCookieHeader = response.headers.get("Set-Cookie");
    invariant(setCookieHeader, "Expected Set-Cookie header.");
    const match = setCookieHeader.match(/better-auth\.session_token=([^;]+)/);
    const sessionCookie = match ? `better-auth.session_token=${match[1]}` : "";
    expect(sessionCookie).not.toBe("");
    headers.set("Cookie", sessionCookie);
  });

  it("has valid session", async () => {
    const session = await auth.api.getSession({ headers });

    invariant(session, "Expected session.");
    expect(session.user.email).toBe(email);
  });

  it("signs out", async () => {
    const response = await auth.api.signOut({
      headers,
      asResponse: true,
    });

    expect(response.ok).toBe(true);
    expect(response.headers.has("Set-Cookie")).toBe(true);
  });

  it("does not sign in with invalid password", async () => {
    const response = await auth.api.signInEmail({
      body: { email, password: "INVALID_PASSWORD", callbackURL },
      asResponse: true,
    });

    expect(response.status).toBe(401);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    expect(((await response.json()) as any)?.code).toBe(
      "INVALID_EMAIL_OR_PASSWORD",
    );
  });

  it("signs in with valid password", async () => {
    const response = await auth.api.signInEmail({
      asResponse: true,
      body: { email, password, callbackURL },
    });

    expect(response.ok).toBe(true);
    expect(response.headers.has("Set-Cookie")).toBe(true);
  });
});
