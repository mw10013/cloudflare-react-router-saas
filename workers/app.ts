import { createAuthService } from "@/lib/auth-service";
import { createD1SessionService } from "@/lib/d1-session-service";
import { createRepository } from "@/lib/repository";
import { RequestContext } from "@/lib/request-context";
import { createSesService } from "@/lib/ses-service";
import { createStripeService } from "@/lib/stripe-service";
import * as Hono from "hono";
import * as ReactRouter from "react-router";
// import { DomainDo } from "./domain-do";
import { createE2eRoutes } from "./e2e";

export default {
  async fetch(request, env, ctx) {
    const hono = new Hono.Hono();
    const d1SessionService = createD1SessionService({
      d1: env.D1,
      request,
    });
    const repository = createRepository({ d1SessionService });
    const stripeService = createStripeService();
    const authService = createAuthService({
      d1SessionService,
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
} satisfies ExportedHandler<Env>;

// export { DomainDo };
