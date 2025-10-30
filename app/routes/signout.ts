import type { Route } from "./+types/signout";
import { RequestContext } from "@/lib/request-context";
import { invariant } from "@epic-web/invariant";
import { redirect } from "react-router";

export async function action({ request, context }: Route.ActionArgs) {
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing RequestContext");
  const { authService: auth } = requestContext;
  const { headers } = await auth.api.signOut({
    headers: request.headers,
    returnHeaders: true,
  });
  return redirect("/", { headers });
}
