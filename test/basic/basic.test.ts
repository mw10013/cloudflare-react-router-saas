import type { Auth } from "~/lib/auth";
import type { Repository } from "~/lib/repository";
import type { StripeService } from "~/lib/stripe-service";
import {
  createExecutionContext,
  env,
  waitOnExecutionContext,
} from "cloudflare:test";
import { RouterContextProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { RequestContext } from "~/lib/request-context";
import { loader } from "~/routes/_mkt";
import worker from "../test-worker";

describe("basic", () => {
  it("should have env", () => {
    expect(env).toBeDefined();
    expect(env.D1).toBeDefined();
  });

  /**
   * Cloudflare redefines Request as generic to include cf properties, but TypeScript sees the standard non-generic Request.
   * This cast ensures type safety for IncomingRequestCfProperties in tests.
   *
   * @see https://developers.cloudflare.com/workers/testing/vitest-integration/write-your-first-test/#unit-tests
   */
  const IncomingRequest = Request as new (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => Request<unknown, IncomingRequestCfProperties>;

  it("dispatches fetch event", async () => {
    const request = new IncomingRequest("http://example.com");
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);
    expect(response.status).toBe(200);
  });

  it("loader returns result", () => {
    const context = new RouterContextProvider();
    context.set(RequestContext, {
      env,
      auth: {} as Auth,
      repository: {} as Repository,
      stripeService: {} as StripeService,
    });

    const result = loader({
      request: new IncomingRequest("http://example.com"),
      params: {},
      context,
    });

    expect(result).toBeDefined();
  });
});
