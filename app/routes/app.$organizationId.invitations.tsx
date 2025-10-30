import type { Route } from "./+types/app.$organizationId.invitations";
import { useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as Oui from "@/components/ui/oui-index";
import * as Domain from "@/lib/domain";
import { onSubmitReactRouter } from "@/lib/oui-on-submit-react-router";
import { RequestContext } from "@/lib/request-context";
import { invariant } from "@epic-web/invariant";
import { useFetcher, useSubmit } from "react-router";
import * as z from "zod";

export async function loader({
  request,
  context,
  params: { organizationId },
}: Route.LoaderArgs) {
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { authService: auth } = requestContext;

  const { success: canManageInvitations } = await auth.api.hasPermission({
    headers: request.headers,
    body: {
      organizationId,
      permissions: {
        invitation: ["create", "cancel"],
      },
    },
  });

  return {
    canManageInvitations,
    invitations: await auth.api.listInvitations({
      headers: request.headers,
      query: {
        organizationId,
      },
    }),
  };
}

export async function action({
  request,
  context,
  params: { organizationId },
}: Route.ActionArgs): Promise<Oui.FormActionResult> {
  const schema = z.discriminatedUnion("intent", [
    z.object({
      intent: z.literal("cancel"),
      invitationId: z.string().min(1, "Missing invitationId"),
    }),
    z.object({
      intent: z.literal("invite"),
      emails: z
        .string()
        .transform((v) =>
          v
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean),
        )
        .pipe(
          z
            .array(z.email("Please provide valid email addresses."))
            .min(1, "At least one email is required"),
        ),
      role: Domain.MemberRole.extract(
        ["member", "admin"],
        "Role must be Member or Admin.",
      ),
    }),
  ]);

  const parseResult = schema.safeParse(
    Object.fromEntries(await request.formData()),
  );
  if (!parseResult.success) {
    const { formErrors: details, fieldErrors: validationErrors } =
      z.flattenError(parseResult.error);
    return { success: false, details, validationErrors };
  }
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { authService: auth, env } = requestContext;
  switch (parseResult.data.intent) {
    case "cancel":
      await auth.api.cancelInvitation({
        headers: request.headers,
        body: { invitationId: parseResult.data.invitationId },
      });
      return { success: true };
    case "invite":
      for (const email of parseResult.data.emails) {
        const result = await auth.api.createInvitation({
          headers: request.headers,
          body: {
            email,
            role: parseResult.data.role,
            organizationId,
            resend: true,
          },
        });
        // Workaround for better-auth createInvitation role bug
        if (result.role !== parseResult.data.role) {
          await env.D1.prepare(
            "update Invitation set role = ? where invitationId = ?",
          )
            .bind(parseResult.data.role, Number(result.id))
            .run();
        }
      }
      return { success: true };
    default:
      void (parseResult.data satisfies never);
      throw new Error("Unknown intent");
  }
}

export default function RouteComponent({
  loaderData: { canManageInvitations, invitations },
  actionData,
}: Route.ComponentProps) {
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);

  // Reset form after successful invite
  useEffect(() => {
    if (actionData?.success) {
      formRef.current?.reset();
    }
  }, [actionData]);

  return (
    <div className="flex flex-col gap-8 p-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Invitations</h1>
        <p className="text-muted-foreground text-sm">
          Invite new members and manage your invitations.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Invite New Members</CardTitle>
          <CardDescription>
            Enter email addresses separated by commas to send invitations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Oui.Form
            ref={formRef}
            id="invite-form"
            method="post"
            validationErrors={actionData?.validationErrors}
            onSubmit={onSubmitReactRouter(submit)}
            className="grid"
          >
            <Oui.TextFieldEx
              name="emails"
              label="Email Addresses"
              type="text"
              placeholder="user1@example.com, user2@example.com"
              isDisabled={!canManageInvitations}
            />
            <Oui.SelectEx
              name="role"
              label="Role"
              isDisabled={!canManageInvitations}
              defaultValue={"member"}
              items={[
                { id: "member", name: "Member" },
                { id: "admin", name: "Admin" },
              ]}
            >
              {(item) => <Oui.ListBoxItem>{item.name}</Oui.ListBoxItem>}
            </Oui.SelectEx>
            <Oui.Button
              type="submit"
              name="intent"
              value="invite"
              variant="outline"
              isDisabled={!canManageInvitations}
              className="justify-self-end"
            >
              Send Invites
            </Oui.Button>
          </Oui.Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Invitations</CardTitle>
          <CardDescription>
            Review and manage invitations sent for this organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitations.length > 0 ? (
            <ul className="divide-y">
              {invitations.map((i) => (
                <InvitationItem
                  key={i.id}
                  invitation={i}
                  canManageInvitations={canManageInvitations}
                />
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              No invitations have been sent for this organization yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InvitationItem({
  invitation,
  canManageInvitations,
}: {
  invitation: Route.ComponentProps["loaderData"]["invitations"][number];
  canManageInvitations: boolean;
}) {
  const fetcher = useFetcher<Route.ComponentProps["actionData"]>();
  const pending = fetcher.state !== "idle";
  return (
    <li
      key={invitation.id}
      className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
    >
      <div className="flex flex-col">
        <span className="text-sm font-medium">{invitation.email}</span>
        <span className="text-muted-foreground text-sm">
          {invitation.role} — {invitation.status}
        </span>
        {invitation.status === "pending" && (
          <span className="text-muted-foreground text-xs">
            Expires:{" "}
            {new Date(invitation.expiresAt)
              .toISOString()
              .replace("T", " ")
              .slice(0, 16)}{" "}
            UTC
          </span>
        )}
      </div>
      {canManageInvitations && invitation.status === "pending" && (
        <div className="flex flex-col items-end gap-1">
          <fetcher.Form method="post">
            <input type="hidden" name="invitationId" value={invitation.id} />
            <Oui.Button
              type="submit"
              name="intent"
              value="cancel"
              variant="outline"
              size="sm"
              aria-label={`Cancel invitation for ${invitation.email}`}
              isDisabled={pending}
            >
              Cancel
            </Oui.Button>
          </fetcher.Form>
        </div>
      )}
    </li>
  );
}
