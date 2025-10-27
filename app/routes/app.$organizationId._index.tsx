import type { Route } from "./+types/app.$organizationId._index";
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
import { useFetcher } from "react-router";

export async function loader({
  request,
  context,
  params: { organizationId },
}: Route.LoaderArgs) {
  const MIN_TTL_MS = 5 * 60 * 1000;
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { auth } = requestContext;
  const session = await auth.api.getSession({ headers: request.headers });
  invariant(session, "Missing session");
  const now = Date.now();
  return {
    invitations: (
      await auth.api.listUserInvitations({
        headers: request.headers,
        query: { email: session.user.email },
      })
    ).filter(
      (v) =>
        v.status === "pending" && v.expiresAt.getTime() - now >= MIN_TTL_MS,
    ),
    subscriptions: await auth.api.listActiveSubscriptions({
      headers: request.headers,
      query: { referenceId: organizationId },
    }),
    session,
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  invariant(intent === "accept" || intent === "reject", "Invalid intent");
  const invitationId = formData.get("invitationId");
  invariant(
    typeof invitationId === "string" && invitationId.length > 0,
    "Missing invitationId",
  );
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { auth } = requestContext;
  if (intent === "accept")
    await auth.api.acceptInvitation({
      headers: request.headers,
      body: { invitationId },
    });
  else
    await auth.api.rejectInvitation({
      headers: request.headers,
      body: { invitationId },
    });
  return null;
}

const expiresIn = (expiresAt: Date): string => {
  const diff = expiresAt.getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const m = Math.floor(diff / 60000);
  if (m < 1) return "in <1m";
  if (m < 60) return `in ${String(m)}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `in ${String(h)}h`;
  const d = Math.floor(h / 24);
  return `in ${String(d)}d`;
};

function InvitationItem({
  invitation,
}: {
  invitation: Route.ComponentProps["loaderData"]["invitations"][number];
}) {
  const fetcher = useFetcher();
  const disabled = fetcher.state !== "idle";
  return (
    <li className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
      <div className="grow text-sm">
        <div>Inviter ID: {invitation.inviterId}</div>
        <div>Organization ID: {invitation.organizationId}</div>
        <div>Role: {invitation.role}</div>
        <div>Expires: {expiresIn(invitation.expiresAt)}</div>
      </div>
      <fetcher.Form method="post" className="flex gap-2">
        <input type="hidden" name="invitationId" value={invitation.id} />
        <Oui.Button
          type="submit"
          name="intent"
          value="accept"
          variant="outline"
          size="sm"
          isDisabled={disabled}
        >
          Accept
        </Oui.Button>
        <Oui.Button
          type="submit"
          name="intent"
          value="reject"
          variant="destructive"
          size="sm"
          isDisabled={disabled}
        >
          Reject
        </Oui.Button>
      </fetcher.Form>
    </li>
  );
}

export default function RouteComponent({
  loaderData: { invitations, ...loaderData },
}: Route.ComponentProps) {
  return (
    <div data-slot="invite-container" className="flex flex-col gap-6 p-6">
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invitations</CardTitle>
            <CardDescription>
              Invitations awaiting your response.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col divide-y">
              {invitations.map((invitation) => (
                <InvitationItem key={invitation.id} invitation={invitation} />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      <pre className="overflow-x-auto">
        {JSON.stringify(loaderData, null, 2)}
      </pre>
    </div>
  );
}
