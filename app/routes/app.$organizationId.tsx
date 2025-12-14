import type { Organization } from "better-auth/plugins";
import type { User } from "better-auth/types";
import type { Route } from "./+types/app.$organizationId";
import * as React from "react";
import { AppLogoIcon } from "@/components/app-logo-icon";
import * as Oui from "@/components/ui/oui-index";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { RequestContext } from "@/lib/request-context";
import { invariant } from "@epic-web/invariant";
import { ChevronsUpDown, LogOut } from "lucide-react";
import * as Rac from "react-aria-components";
import * as ReactRouter from "react-router";

const organizationMiddleware: Route.MiddlewareFunction = async ({
  request,
  context,
  params: { organizationId },
}) => {
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const organizations = await requestContext.authService.api.listOrganizations({
    headers: request.headers,
  });
  const organization = organizations.find((org) => org.id === organizationId);
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  if (!organization) throw new Response("Forbidden", { status: 403 });
  context.set(RequestContext, {
    ...requestContext,
    organization,
    organizations,
  });
};

export const middleware: Route.MiddlewareFunction[] = [organizationMiddleware];

export function loader({
  context,
  params: { organizationId },
}: Route.ActionArgs) {
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { organization, organizations, session } = requestContext;
  invariant(organization, "Missing organization");
  invariant(organization.id === organizationId, "Organization ID mismatch");
  invariant(organizations, "Missing organizations");
  invariant(session, "Missing session");
  return {
    organization,
    organizations,
    user: session.user,
  };
}

/**
 * The `<main>` element uses `h-svh` for a stable height, essential for this app shell layout.
 * `h-dvh` is avoided because it causes jarring content reflows on mobile when browser UI resizes,
 * which is unsuitable for a layout with internal-only scrolling.
 */
export default function RouteComponent({
  loaderData: { organization, organizations, user },
}: Route.ComponentProps) {
  return (
    <SidebarProvider>
      <AppSidebar
        organization={organization}
        organizations={organizations}
        user={user}
      />
      <main className="flex h-svh w-full flex-col overflow-x-hidden">
        <Oui.SidebarTrigger />
        <ReactRouter.Outlet />
      </main>
    </SidebarProvider>
  );
}

export function AppSidebar({
  organization,
  organizations,
  user,
}: {
  organization: Organization;
  organizations: Organization[];
  user: User;
}) {
  const items = [
    {
      id: "Organization Home",
      href: `/app/${organization.id}`,
    },
    {
      id: "Members",
      href: `/app/${organization.id}/members`,
    },
    {
      id: "Invitations",
      href: `/app/${organization.id}/invitations`,
      "data-testid": "sidebar-invitations",
    },
    {
      id: "Billing",
      href: `/app/${organization.id}/billing`,
      "data-testid": "sidebar-billing",
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex w-full items-center gap-2 p-2">
          <Rac.Link
            href="/"
            aria-label="Home"
            className={Oui.buttonClassName({ variant: "ghost", size: "icon" })}
          >
            <AppLogoIcon className="text-primary size-7" />
          </Rac.Link>
          <OrganizationSwitcher
            organizations={organizations}
            organization={organization}
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <Oui.SidebarTree aria-label="Organization Navigation" items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}

export function OrganizationSwitcher({
  organizations,
  organization,
}: {
  organizations: Organization[];
  organization: Organization;
}) {
  const navigate = ReactRouter.useNavigate();
  return (
    <Rac.MenuTrigger>
      <Oui.Button
        variant="ghost"
        className="h-auto flex-1 items-center justify-between p-0 text-left font-medium data-hovered:bg-transparent"
      >
        <div className="grid leading-tight">
          <span className="truncate font-medium">{organization.name}</span>
        </div>
        <ChevronsUpDown className="text-muted-foreground ml-2 size-4" />
      </Oui.Button>
      <Oui.Popover>
        <Oui.Menu
          className="min-w-56 rounded-lg"
          onAction={(key: React.Key) => void navigate(`/app/${String(key)}`)}
        >
          <Rac.MenuSection>
            <Oui.MenuHeader>Switch Organization</Oui.MenuHeader>
            {organizations.map((org) => (
              <Oui.MenuItem
                key={org.id}
                id={org.id}
                textValue={org.name}
                className="p-2"
              >
                {org.name}
              </Oui.MenuItem>
            ))}
          </Rac.MenuSection>
        </Oui.Menu>
      </Oui.Popover>
    </Rac.MenuTrigger>
  );
}

export function NavUser({
  user,
}: {
  user: {
    email: string;
  };
}) {
  const submit = ReactRouter.useSubmit();
  return (
    <Rac.MenuTrigger>
      <Oui.SidebarButton>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{user.email}</span>
        </div>
        <ChevronsUpDown className="ml-auto size-4" />
      </Oui.SidebarButton>
      <Oui.Popover>
        <Oui.Menu className="min-w-56 rounded-lg">
          <Rac.MenuSection>
            <Oui.MenuHeader className="truncate px-1 py-1.5 text-center text-sm font-medium">
              {user.email}
            </Oui.MenuHeader>
          </Rac.MenuSection>
          <Oui.MenuSeparator />
          <Oui.MenuItem
            id="signOut"
            textValue="Sign Out"
            onAction={() =>
              void submit(
                {},
                { method: "post", action: ReactRouter.href("/signout") },
              )
            }
          >
            <LogOut className="mr-2 size-4" />
            Sign Out
          </Oui.MenuItem>
        </Oui.Menu>
      </Oui.Popover>
    </Rac.MenuTrigger>
  );
}
