import type { Route } from "./+types/app";
import { RequestContext } from "@/lib/request-context";
import { invariant } from "@epic-web/invariant";
import { Outlet, redirect } from "react-router";

const appMiddleware: Route.MiddlewareFunction = async ({
  request,
  context,
}) => {
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { authService: auth } = requestContext;
  const session = await auth.api.getSession({ headers: request.headers });
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  if (!session?.user) throw redirect("/login");
  if (session.user.role !== "user")
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw new Response("Forbidden", { status: 403 });
};

export const middleware: Route.MiddlewareFunction[] = [appMiddleware];

export default function RouteComponent() {
  return <Outlet />;
}
