import type { Route } from "./+types/admin";
import { invariant } from "@epic-web/invariant";
import * as Oui from "@/components/ui/oui-index";
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Outlet, redirect } from "react-router";
import { RequestContext } from "~/lib/request-context";

export const adminMiddleware: Route.MiddlewareFunction = ({ context }) => {
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { session } = requestContext;
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  if (!session?.user) throw redirect("/login");
  if (session.user.role !== "admin")
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw new Response("Forbidden", { status: 403 });
};

export const middleware: Route.MiddlewareFunction[] = [adminMiddleware];

const items = [
  {
    id: "SaaS",
    href: "/",
  },
  {
    id: "Admin",
    href: "/admin",
  },
  {
    id: "Users",
    href: "/admin/users",
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <Oui.SidebarExTree aria-label="Admin Navigation" items={items} />
      </SidebarContent>
    </Sidebar>
  );
}

export default function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <Oui.SidebarExTrigger className="m-2" />
        <div className="flex flex-col gap-2 px-4">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
