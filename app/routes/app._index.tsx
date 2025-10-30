import type { Route } from "./+types/app._index";
import { RequestContext } from "@/lib/request-context";
import { invariant } from "@epic-web/invariant";
import { redirect } from "react-router";

export async function loader({ request, context }: Route.LoaderArgs) {
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { authService: auth } = requestContext;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.session.activeOrganizationId)
    throw new Error("Missing session or active organization");
  return redirect(`/app/${session.session.activeOrganizationId}`);
}
