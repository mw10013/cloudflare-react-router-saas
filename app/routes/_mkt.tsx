import type { Route } from "./+types/_mkt";
import { AppLogoIcon } from "@/components/app-logo-icon";
import ReactRouterThemeToggleButton from "@/components/oui-react-router-theme-toggle-button";
import * as Oui from "@/components/ui/oui-index";
import { RequestContext } from "@/lib/request-context";
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
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <ReactRouter.Outlet />
      </main>
    </div>
  );
}

function SiteHeader() {
  const routeLoaderData =
    ReactRouter.useRouteLoaderData<Route.ComponentProps["loaderData"]>(
      "routes/_mkt",
    );
  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="flex h-14 items-center gap-2 md:gap-4">
        <MainNav />
        {/* <MobileNav />
            <nav className="flex items-center gap-0.5">
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="h-8 w-8 px-0"
              >
                <Link
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icons.gitHub className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </Button>
              <ModeSwitcher />
            </nav>
          </div> */}
        <div className="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
          <nav className="flex items-center gap-0.5">
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
            <ReactRouterThemeToggleButton />
            {routeLoaderData?.sessionUser ? (
              <Rac.Form
                action="/signout"
                method="post"
                className="grid w-full max-w-sm gap-6"
              >
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
          </nav>
        </div>
      </div>
    </header>
  );
}

function MainNav() {
  return (
    <div className="mr-4 hidden md:flex">
      <Oui.Link
        href={ReactRouter.href("/")}
        className="mr-4 flex items-center gap-2"
      >
        <AppLogoIcon className="text-primary" />
      </Oui.Link>
      <nav className="flex items-center gap-4 text-sm xl:gap-6">
        <Oui.Link href={ReactRouter.href("/pricing")}>Pricing</Oui.Link>
      </nav>
    </div>
  );
}
