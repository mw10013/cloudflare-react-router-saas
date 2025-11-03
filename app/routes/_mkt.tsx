import type { Route } from "./+types/_mkt";
import { AppLogoIcon } from "@/components/app-logo-icon";
import ReactRouterThemeToggleButton from "@/components/oui-react-router-theme-toggle-button";
import * as Oui from "@/components/ui/oui-index";
import { RequestContext } from "@/lib/request-context";
import { Menu } from "lucide-react";
import * as Rac from "react-aria-components";
import * as ReactRouter from "react-router";
import { siGithub } from "simple-icons";

export function loader({ context }: Route.LoaderArgs) {
  const requestContext = context.get(RequestContext);
  if (!requestContext) return { isSignedIn: false, sessionUser: null };
  const { session } = requestContext;
  return {
    isSignedIn: Boolean(session?.user),
    sessionUser: session?.user,
  };
}

export default function RouteComponent() {
  return (
    <div
      data-wrapper=""
      className="container mx-auto flex flex-1 flex-col px-4 lg:px-8"
    >
      <Header />
      <main className="flex flex-1 flex-col">
        <ReactRouter.Outlet />
      </main>
    </div>
  );
}

function Header() {
  const routeLoaderData =
    ReactRouter.useRouteLoaderData<Route.ComponentProps["loaderData"]>(
      "routes/_mkt",
    );
  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="flex h-14 items-center gap-2 md:gap-4">
        <Oui.Link href={ReactRouter.href("/")}>
          <AppLogoIcon />
        </Oui.Link>
        <nav className="hidden items-center gap-4 text-sm md:flex xl:gap-6">
          <Oui.Link href={ReactRouter.href("/pricing")}>Pricing</Oui.Link>
        </nav>
        <div className="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
          <nav className="flex items-center gap-0.5">
            <div className="hidden items-center gap-0.5 md:flex">
              <GitHubRepoLink />
              <ReactRouterThemeToggleButton />
              {routeLoaderData?.sessionUser ? (
                <Rac.Form action="/signout" method="post">
                  <Oui.Button type="submit" variant="outline">
                    Sign Out
                  </Oui.Button>
                </Rac.Form>
              ) : (
                <Oui.Link
                  href={ReactRouter.href("/login")}
                  className={Oui.buttonClassName({ variant: "outline" })}
                >
                  Sign in / Sign up
                </Oui.Link>
              )}
            </div>
            <Oui.PopoverEx
              triggerElement={
                <Oui.Button variant="ghost" className="md:hidden">
                  <Menu />
                </Oui.Button>
              }
              className="min-w-min"
            >
              <div className="flex flex-col gap-4">
                <Oui.Link href={ReactRouter.href("/pricing")}>Pricing</Oui.Link>
                <div className="flex gap-2">
                  <GitHubRepoLink />
                  <ReactRouterThemeToggleButton />
                </div>
                {routeLoaderData?.sessionUser ? (
                  <Rac.Form action="/signout" method="post">
                    <Oui.Button
                      type="submit"
                      variant="outline"
                      className="w-full"
                    >
                      Sign Out
                    </Oui.Button>
                  </Rac.Form>
                ) : (
                  <Oui.Link
                    href={ReactRouter.href("/login")}
                    className="w-full"
                  >
                    Sign in / Sign up
                  </Oui.Link>
                )}
              </div>
            </Oui.PopoverEx>
          </nav>
        </div>
      </div>
    </header>
  );
}

function GitHubRepoLink() {
  return (
    <Oui.Link
      aria-label="GitHub repo"
      href="https://github.com/mw10013/cloudflare-react-router-saas"
      target="_blank"
      rel="noopener noreferrer"
      className={Oui.buttonClassName({ variant: "ghost" })}
    >
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d={siGithub.path} />
      </svg>
    </Oui.Link>
  );
}
