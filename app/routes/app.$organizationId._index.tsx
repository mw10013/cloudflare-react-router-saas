import type { Route } from "./+types/app.$organizationId._index";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import * as Oui from "@/components/ui/oui-index";
import { RequestContext } from "@/lib/request-context";
import { invariant } from "@epic-web/invariant";
import * as Rac from "react-aria-components";
import { useFetcher } from "react-router";

export async function loader({
  request,
  context,
  params: { organizationId },
}: Route.LoaderArgs) {
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { authService: auth, repository } = requestContext;
  const session = await auth.api.getSession({ headers: request.headers });
  invariant(session, "Missing session");

  return {
    dashboardData: await repository.getAppDashboardData({
      userEmail: session.user.email,
      organizationId,
    }),
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
  const { authService: auth } = requestContext;
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
  invitation: Route.ComponentProps["loaderData"]["dashboardData"]["userInvitations"][number];
}) {
  const fetcher = useFetcher();
  const disabled = fetcher.state !== "idle";
  return (
    <Oui.CardGridListItem textValue={invitation.inviter.email}>
      <Item size="sm" className="gap-4 px-0">
        <ItemContent>
          <ItemTitle>{invitation.inviter.email}</ItemTitle>
          <ItemDescription>
            Role: {invitation.role}
            <br />
            Expires {expiresIn(invitation.expiresAt)}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <fetcher.Form method="post" className="flex gap-2">
            <input
              type="hidden"
              name="invitationId"
              value={invitation.invitationId}
            />
            <Oui.Button
              type="submit"
              name="intent"
              value="accept"
              variant="outline"
              size="sm"
              isDisabled={disabled}
              aria-label={`Accept invitation from ${invitation.inviter.email}`}
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
              aria-label={`Reject invitation from ${invitation.inviter.email}`}
            >
              Reject
            </Oui.Button>
          </fetcher.Form>
        </ItemActions>
      </Item>
    </Oui.CardGridListItem>
  );
}

export default function RouteComponent({
  loaderData: { dashboardData },
}: Route.ComponentProps) {
  return (
    <div data-slot="invite-container" className="flex flex-col gap-6 p-6">
      {dashboardData.userInvitations.length > 0 && (
        <Card className="gap-4">
          <CardHeader>
            <CardTitle>Invitations</CardTitle>
            <CardDescription>
              Invitations awaiting your response.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Rac.GridList aria-label="Invitations awaiting your response">
              {dashboardData.userInvitations.map((invitation) => (
                <InvitationItem
                  key={invitation.invitationId}
                  invitation={invitation}
                />
              ))}
            </Rac.GridList>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              Total members in this organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="member-count">
              {dashboardData.memberCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>Invitations awaiting response</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.pendingInvitationCount}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
