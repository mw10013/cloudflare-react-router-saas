import type { Route } from "./+types/_mkt";
import { AppLogoIcon } from "@/components/app-logo-icon";
import * as OuiReactRouter from "@/components/oui-react-router-index";
import * as Oui from "@/components/ui/oui-index";
import { RequestContext } from "@/lib/request-context";
import { Menu } from "lucide-react";
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
      <Footer />
    </div>
  );
}

function Header() {
  const routeLoaderData =
    ReactRouter.useRouteLoaderData<Route.ComponentProps["loaderData"]>(
      "routes/_mkt",
    );
  const submit = ReactRouter.useSubmit();
  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="flex h-14 items-center gap-2 md:gap-4">
        <Oui.Link href={ReactRouter.href("/")}>
          <AppLogoIcon />
        </Oui.Link>
        <nav className="hidden items-center gap-4 text-sm md:flex xl:gap-6">
          <Oui.Link href={ReactRouter.href("/pricing")}>Pricing</Oui.Link>
        </nav>
        <nav className="ml-auto">
          <div className="hidden items-center gap-2 md:flex">
            <GitHubRepoLink />
            <OuiReactRouter.ReactRouterThemeToggleButton />
            {routeLoaderData?.sessionUser ? (
              <Oui.Button
                variant="outline"
                onPress={() =>
                  void submit(
                    {},
                    { method: "post", action: ReactRouter.href("/signout") },
                  )
                }
              >
                Sign Out
              </Oui.Button>
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
              <Oui.Button
                aria-label="Menu"
                variant="ghost"
                className="md:hidden"
              >
                <Menu />
              </Oui.Button>
            }
          >
            <div className="flex flex-col gap-4">
              <Oui.Link href={ReactRouter.href("/pricing")}>Pricing</Oui.Link>
              <div className="flex gap-2">
                <GitHubRepoLink />
                <OuiReactRouter.ReactRouterThemeToggleButton />
              </div>
              {routeLoaderData?.sessionUser ? (
                <Oui.Button
                  variant="outline"
                  onPress={() =>
                    void submit(
                      {},
                      { method: "post", action: ReactRouter.href("/signout") },
                    )
                  }
                >
                  Sign Out
                </Oui.Button>
              ) : (
                <Oui.Link href={ReactRouter.href("/login")}>
                  Sign in / Sign up
                </Oui.Link>
              )}
            </div>
          </Oui.PopoverEx>
        </nav>
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

export function Footer() {
  return (
    <footer className="relative mt-16 py-8 md:mt-20">
      <div className="flex justify-between gap-2 max-sm:flex-col max-sm:text-center">
        <p className="text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Oui
        </p>
      </div>
    </footer>
  );
}
