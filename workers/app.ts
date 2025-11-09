import { createAuthService } from "@/lib/auth-service";
import { createD1SessionService } from "@/lib/d1-session-service";
import { createRepository } from "@/lib/repository";
import { RequestContext } from "@/lib/request-context";
import { createSesService } from "@/lib/ses-service";
import { createStripeService } from "@/lib/stripe-service";
import * as Hono from "hono";
import * as ReactRouter from "react-router";
import { createE2eRoutes } from "./e2e";

const MAGIC_LINK_VERIFY_PATH = "/api/auth/magic-link/verify";

/**
 * Rate limiting
 * @see https://github.com/better-auth/better-auth/blob/1881c33126ddd6385cc355dc6933133c3ce1d97f/packages/better-auth/src/plugins/magic-link/index.ts#L436-L447
 * 
 * @example
 * ```ts
 * rateLimit: [
			{
				pathMatcher(path) {
					return (
						path.startsWith("/sign-in/magic-link") ||
						path.startsWith("/magic-link/verify")
					);
				},
				window: opts.rateLimit?.window || 60,
				max: opts.rateLimit?.max || 5,
			},
		],
 * ```
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const isMagicLinkRequest =
      (url.pathname === "/login" && request.method === "POST") ||
      url.pathname === MAGIC_LINK_VERIFY_PATH;
    if (isMagicLinkRequest) {
      const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
      const { success } = await env.MAGIC_LINK_RATE_LIMITER.limit({ key: ip });
      if (!success) {
        return new Response("Rate limit exceeded", { status: 429 });
      }
    }

    const hono = new Hono.Hono();
    const d1SessionService = createD1SessionService({
      d1: env.D1,
      request,
      sessionConstraint: new URL(request.url).pathname.startsWith("/api/auth/")
        ? "first-primary"
        : undefined,
    });
    const repository = createRepository({ db: d1SessionService.getSession() });
    const stripeService = createStripeService();
    const authService = createAuthService({
      db: d1SessionService.getSession(),
      stripeService,
      sesService: createSesService(),
    });

    const authHandler = (c: Hono.Context) => {
      console.log(`worker fetch: auth: ${c.req.raw.url}`);
      return authService.handler(c.req.raw);
    };
    hono.post("/api/auth/stripe/webhook", authHandler);
    hono.get("/api/auth/magic-link/verify", authHandler);
    hono.get("/api/auth/subscription/*", authHandler);

    if (env.ENVIRONMENT === "local") {
      hono.all(
        "/.well-known/appspecific/com.chrome.devtools.json",
        () => new Response(null, { status: 204 }),
      );
      hono.route("/", createE2eRoutes({ repository, stripeService }));
    }

    hono.all("*", async (c) => {
      const context = new ReactRouter.RouterContextProvider();
      context.set(RequestContext, {
        env,
        authService,
        repository,
        stripeService,
        session:
          (await authService.api.getSession({ headers: c.req.raw.headers })) ??
          undefined,
      });
      const requestHandler = ReactRouter.createRequestHandler(
        () => import("virtual:react-router/server-build"),
        import.meta.env.MODE,
      );
      return requestHandler(c.req.raw, context);
    });
    const response = await hono.fetch(request, env, ctx);
    d1SessionService.setSessionBookmarkCookie(response);
    // ctx.waitUntil(runtime.dispose());
    return response;
  },

  async scheduled(scheduledEvent, env, _ctx) {
    switch (scheduledEvent.cron) {
      case "0 0 * * *": {
        const repository = createRepository({ db: env.D1 });
        const deletedCount = await repository.deleteExpiredSessions();
        console.log(`Deleted ${String(deletedCount)} expired sessions`);
        break;
      }
      default: {
        console.warn(`Unexpected cron schedule: ${scheduledEvent.cron}`);
        break;
      }
    }
  },
} satisfies ExportedHandler<Env>;
