import { invariant } from "@epic-web/invariant";
import type { Route } from "./+types/signout";
import { redirect } from "react-router";
import { RequestContext } from "~/lib/request-context";

export async function action({ request, context }: Route.ActionArgs) {
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing RequestContext");
  const { auth } = requestContext;
  const { headers } = await auth.api.signOut({
    headers: request.headers,
    returnHeaders: true,
  });
  return redirect("/", { headers });
}
