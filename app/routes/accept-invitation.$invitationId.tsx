import type { Route } from "./+types/accept-invitation.$invitationId";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as Oui from "@/components/ui/oui-index";
import { RequestContext } from "@/lib/request-context";
import { invariant } from "@epic-web/invariant";
import * as Rac from "react-aria-components";
import * as ReactRouter from "react-router";
import * as z from "zod";

export function loader({
  context,
  params: { invitationId },
}: Route.LoaderArgs) {
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  return { needsAuth: !requestContext.session, invitationId };
}

export async function action({
  request,
  context,
  params: { invitationId },
}: Route.ActionArgs) {
  const schema = z.object({
    intent: z.enum(["accept", "reject"]),
  });
  const formData = await request.formData();
  const parseResult = schema.parse(Object.fromEntries(formData));
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { authService: auth } = requestContext;
  if (parseResult.intent === "accept") {
    await auth.api.acceptInvitation({
      body: { invitationId },
      headers: request.headers,
    });
  } else {
    await auth.api.rejectInvitation({
      body: { invitationId },
      headers: request.headers,
    });
  }
  return ReactRouter.redirect(ReactRouter.href("/app"));
}

export default function RouteComponent({ loaderData }: Route.ComponentProps) {
  if (loaderData.needsAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        You need to sign in or sign up to accept this invitation.
        <Oui.Link href="/login" className="mt-4">
          Go to Login
        </Oui.Link>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Invitation</CardTitle>
          <CardDescription>
            Would you like to accept or reject this invitation?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Rac.Form
            method="post"
            validationBehavior="aria"
            className="flex justify-end gap-6"
          >
            <Oui.Button type="submit" name="intent" value="accept">
              Accept
            </Oui.Button>
            <Oui.Button
              type="submit"
              name="intent"
              value="reject"
              variant="destructive"
            >
              Reject
            </Oui.Button>
          </Rac.Form>
        </CardContent>
      </Card>
    </div>
  );
}
