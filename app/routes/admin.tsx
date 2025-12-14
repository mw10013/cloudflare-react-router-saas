import type { Route } from "./+types/admin";
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

export const adminMiddleware: Route.MiddlewareFunction = ({ context }) => {
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { session } = requestContext;
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  if (!session?.user) throw ReactRouter.redirect(ReactRouter.href("/login"));
  if (session.user.role !== "admin")
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw new Response("Forbidden", { status: 403 });
};

export const middleware: Route.MiddlewareFunction[] = [adminMiddleware];

export function loader({ context }: Route.LoaderArgs) {
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { session } = requestContext;
  invariant(session?.user, "Missing user session");
  return { user: session.user };
}

export default function RouteComponent({
  loaderData: { user },
}: Route.ComponentProps) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <main className="flex h-svh w-full flex-col overflow-x-hidden">
        <Oui.SidebarTrigger />
        <ReactRouter.Outlet />
      </main>
    </SidebarProvider>
  );
}

export function AppSidebar({ user }: { user: { email: string } }) {
  const items = [
    {
      id: "Dashboard",
      href: ReactRouter.href("/admin"),
    },
    {
      id: "Users",
      href: ReactRouter.href("/admin/users"),
    },
    {
      id: "Customers",
      href: ReactRouter.href("/admin/customers"),
    },
    {
      id: "Subscriptions",
      href: ReactRouter.href("/admin/subscriptions"),
    },
    {
      id: "Sessions",
      href: ReactRouter.href("/admin/sessions"),
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="items-center justify-center">
        <Rac.Link
          href="/"
          aria-label="Home"
          className={Oui.buttonClassName({ variant: "ghost", size: "icon" })}
        >
          <AppLogoIcon className="text-primary size-7" />
        </Rac.Link>
      </SidebarHeader>
      <SidebarContent>
        <Oui.SidebarTree aria-label="Admin Navigation" items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
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
            <Rac.Header className="truncate px-1 py-1.5 text-center text-sm font-medium">
              {user.email}
            </Rac.Header>
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
