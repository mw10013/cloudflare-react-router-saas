import type { Route } from "./+types/_mkt";
import { AppLogoIcon } from "@/components/app-logo-icon";
import ReactRouterThemeToggleButton from "@/components/oui-react-router-theme-toggle-button";
import * as Oui from "@/components/ui/oui-index";
import { RequestContext } from "@/lib/request-context";
import * as Rac from "react-aria-components";
import * as ReactRouter from "react-router";

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
      className="container mx-auto flex flex-1 flex-col px-4"
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
          <div className="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
            <div className="hidden w-full flex-1 md:flex md:w-auto md:flex-none">
              <CommandMenu />
            </div>
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
                href="/login"
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
      <Oui.Link href="/" className="mr-4 flex items-center gap-2 lg:mr-6">
        <AppLogoIcon className="text-primary size-7" />
        <span className="hidden font-bold lg:inline-block">SaaS</span>
      </Oui.Link>
      <nav className="flex items-center gap-4 text-sm xl:gap-6">
        <Oui.Link
          href="/pricing"
          className={
            "text-foreground/80 data-hovered:text-foreground/80 transition-colors"
          }
        >
          Pricing
        </Oui.Link>
      </nav>
    </div>
  );
}
