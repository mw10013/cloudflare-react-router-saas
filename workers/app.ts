import * as Hono from "hono";
import { createRequestHandler, RouterContextProvider } from "react-router";
import { createAuth } from "~/lib/auth";
import { createRepository } from "~/lib/repository";
import { RequestContext } from "~/lib/request-context";
import { createSes } from "~/lib/ses";
import { createStripeService } from "~/lib/stripe-service";
import { DomainDo } from "./domain-do";
import { createE2eRoutes } from "./e2e";

export default {
  async fetch(request, env, ctx) {
    const hono = new Hono.Hono();
    const repository = createRepository();
    const stripeService = createStripeService();
    const auth = createAuth({
      d1: env.D1,
      stripeService,
      ses: createSes(),
    });

    const authHandler = (c: Hono.Context) => {
      console.log(`worker fetch: auth: ${c.req.raw.url}`);
      return auth.handler(c.req.raw);
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
      const context = new RouterContextProvider();
      context.set(RequestContext, {
        env,
        auth,
        repository,
        stripeService,
        session:
          (await auth.api.getSession({ headers: c.req.raw.headers })) ??
          undefined,
      });
      const requestHandler = createRequestHandler(
        () => import("virtual:react-router/server-build"),
        import.meta.env.MODE,
      );
      return requestHandler(c.req.raw, context);
    });
    const response = await hono.fetch(request, env, ctx);
    // ctx.waitUntil(runtime.dispose());
    return response;
  },
} satisfies ExportedHandler<Env>;

export { DomainDo };
