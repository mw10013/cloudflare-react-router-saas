import type { Route } from "./+types/app.$organizationId.members";
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
import { redirect, useFetcher } from "react-router";
import * as z from "zod";

export async function loader({
  request,
  context,
  params: { organizationId },
}: Route.LoaderArgs) {
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { auth } = requestContext;
  const session = await auth.api.getSession({ headers: request.headers });
  invariant(session, "Missing session");
  const members = (
    await auth.api.listMembers({
      headers: request.headers,
      query: {
        organizationId,
      },
    })
  ).members;
  const { success: canEdit } = await auth.api.hasPermission({
    headers: request.headers,
    body: {
      organizationId,
      permissions: {
        member: ["update", "delete"],
      },
    },
  });
  const member = members.find((m) => m.user.id === session.user.id);
  invariant(member, "Missing member");
  const canLeaveMemberId = member.role !== "owner" ? member.id : undefined;
  return {
    canEdit,
    canLeaveMemberId,
    userId: session.user.id,
    members,
  };
}

export async function action({
  request,
  context,
  params: { organizationId },
}: Route.ActionArgs) {
  const schema = z.discriminatedUnion("intent", [
    z.object({
      intent: z.literal("remove"),
      memberId: z.string().min(1, "Missing memberId"),
    }),
    z.object({
      intent: z.literal("leave"),
    }),
    z.object({
      intent: z.literal("changeRole"),
      memberId: z.string().min(1, "Missing memberId"),
      role: z.enum(["member", "admin"]),
    }),
  ]);
  const parseResult = schema.parse(
    Object.fromEntries(await request.formData()),
  );
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { auth } = requestContext;
  switch (parseResult.intent) {
    case "remove":
      await auth.api.removeMember({
        headers: request.headers,
        body: { memberIdOrEmail: parseResult.memberId, organizationId },
      });
      break;
    case "leave":
      await auth.api.leaveOrganization({
        headers: request.headers,
        body: { organizationId },
      });
      return redirect("/app");
    case "changeRole":
      await auth.api.updateMemberRole({
        headers: request.headers,
        body: {
          role: parseResult.role,
          memberId: parseResult.memberId,
          organizationId,
        },
      });
      break;
    default:
      void (parseResult satisfies never);
  }
  return null;
}

export default function RouteComponent({
  loaderData: { canEdit, canLeaveMemberId, members },
}: Route.ComponentProps) {
  return (
    <div className="flex flex-col gap-8 p-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Members</h1>
        <p className="text-muted-foreground text-sm">
          Manage organization members and control access to your organization.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Current Members</CardTitle>
          <CardDescription>
            Review and manage members currently part of this organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <ul className="divide-y">
              {members.map((member) => (
                <MemberItem
                  key={member.id}
                  member={member}
                  canEdit={canEdit}
                  canLeaveMemberId={canLeaveMemberId}
                />
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              No members have been added to this organization yet.
            </p>
          )}
        </CardContent>
      </Card>
      <pre>{JSON.stringify({ members }, null, 2)}</pre>
    </div>
  );
}

function MemberItem({
  member,
  canEdit,
  canLeaveMemberId,
}: {
  member: Route.ComponentProps["loaderData"]["members"][number];
  canEdit: boolean;
  canLeaveMemberId?: string;
}) {
  const fetcher = useFetcher(); // Caution: sharing fetcher
  const pending = fetcher.state !== "idle";
  return (
    <li className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="flex flex-col">
        <span className="text-sm font-medium">{member.user.email}</span>
        {member.role !== "owner" && canEdit ? (
          <Oui.SelectEx
            name="role"
            defaultValue={member.role}
            aria-label={`Change role for ${member.user.email}`}
            items={[
              { id: "member", name: "Member" },
              { id: "admin", name: "Admin" },
            ]}
            onChange={(key) =>
              void fetcher.submit(
                { intent: "changeRole", memberId: member.id, role: key },
                { method: "post" },
              )
            }
            className="mt-2"
          >
            {(item) => <Oui.ListBoxItem>{item.name}</Oui.ListBoxItem>}
          </Oui.SelectEx>
        ) : (
          <span className="text-muted-foreground text-sm">{member.role}</span>
        )}
      </div>
      {member.role !== "owner" && (
        <div className="flex gap-2">
          {canEdit && (
            <fetcher.Form method="post">
              <input type="hidden" name="memberId" value={member.id} />
              <Oui.Button
                type="submit"
                name="intent"
                value="remove"
                variant="outline"
                size="sm"
                isDisabled={pending}
              >
                Remove
              </Oui.Button>
            </fetcher.Form>
          )}
          {member.id === canLeaveMemberId && (
            <fetcher.Form method="post">
              <Oui.Button
                type="submit"
                name="intent"
                value="leave"
                variant="outline"
                size="sm"
                isDisabled={pending}
              >
                Leave
              </Oui.Button>
            </fetcher.Form>
          )}
        </div>
      )}
    </li>
  );
}
