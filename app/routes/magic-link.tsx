import type { Route } from "./+types/magic-link";
import { RequestContext } from "@/lib/request-context";
import { invariant } from "@epic-web/invariant";
import { redirect } from "react-router";

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) return { error };

  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { authService: auth } = requestContext;
  const session = await auth.api.getSession({ headers: request.headers });
  if (session?.user.role === "admin") return redirect("/admin");
  else if (session?.user.role === "user") return redirect("/app");

  return { error: `Invalid role: ${session?.user.role ?? "unknown"}` };
}

export default function RouteComponent({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Magic Link Error</h1>
      <p className="mt-4">{loaderData.error}</p>
      <p className="mt-4">
        Try{" "}
        <a href="/login" className="underline">
          signing in
        </a>{" "}
        again.
      </p>
    </div>
  );
}
