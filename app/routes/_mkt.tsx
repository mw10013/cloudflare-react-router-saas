import type { Route } from "./+types/_mkt";
import { AppLogoIcon } from "@/components/app-logo-icon";
import * as OuiReactRouter from "@/components/oui-react-router-index";
import * as Oui from "@/components/ui/oui-index";
import { Separator } from "@/components/ui/oui-index";
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
      className="container mx-auto flex flex-1 flex-col px-6 sm:px-12"
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
    <header className="bg-background/95 sticky top-0 z-10 w-full backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-2">
        <div className="flex items-center gap-12">
          <Oui.Link
            href={ReactRouter.href("/")}
            className="flex items-center gap-1"
          >
            <AppLogoIcon className="size-6 fill-current" />
            <span className="text-xl font-extrabold">CRRS</span>
            <span className="bg-primary relative top-1 size-1.5" />
          </Oui.Link>
          <div className="hidden items-center gap-6 md:flex">
            <Oui.Link
              href={ReactRouter.href("/pricing")}
              className="data-hovered:text-primary text-muted-foreground font-medium"
            >
              Pricing
            </Oui.Link>
            <Oui.Link
              href="https://github.com/mw10013/cloudflare-react-router-saas"
              target="_blank"
              rel="noopener noreferrer"
              className="data-hovered:text-primary text-muted-foreground font-medium"
            >
              Documentation
            </Oui.Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <GitHubRepoLink />
            <OuiReactRouter.ReactRouterThemeToggleButton />
            <Separator orientation="vertical" className="mx-1 h-6 min-h-6" />
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
              <Rac.Link
                href={ReactRouter.href("/login")}
                className={Oui.buttonClassName({
                  variant: "default",
                  size: "sm",
                })}
              >
                Sign in / Sign up
              </Rac.Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function GitHubRepoLink({
  className,
}: {
  className?: React.HTMLAttributes<SVGElement>["className"];
}) {
  return (
    <Rac.Link
      aria-label="GitHub repo"
      href="https://github.com/mw10013/cloudflare-react-router-saas"
      target="_blank"
      rel="noopener noreferrer"
      className={Oui.buttonClassName({
        variant: "ghost",
        className,
      })}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
        <path d={siGithub.path} />
      </svg>
    </Rac.Link>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-5xl flex-col gap-8 py-12">
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        <div className="max-w-md space-y-4 md:col-span-2 lg:col-span-4">
          <Oui.Link
            href={ReactRouter.href("/")}
            className="flex items-center gap-1"
          >
            <AppLogoIcon className="size-6 fill-current" />
            <span className="text-xl font-extrabold">CRRS</span>
            <span className="bg-primary relative top-1 size-1.5" />
          </Oui.Link>
          <p className="text-muted-foreground text-sm">
            Build and deploy serverless React Router applications on Cloudflare.
          </p>
          <div className="flex gap-4">
            <GitHubRepoLink className="h-auto! p-0! opacity-60 hover:opacity-100" />
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-sm font-bold">Resources</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Oui.Link
                href="https://github.com/mw10013/oui"
                className="text-muted-foreground data-hovered:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Oui Components
              </Oui.Link>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="text-sm font-bold">Support</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Oui.Link
                href="https://github.com/mw10013/cloudflare-react-router-saas"
                className="text-muted-foreground data-hovered:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Documentation
              </Oui.Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-border/40 flex flex-col items-center justify-between gap-4 border-t border-dashed pt-8 sm:flex-row">
        <p className="text-muted-foreground text-sm">
          © {/* */}2025{/* */} CRRS. Built with ♥ by{" "}
          <Oui.Link
            href="https://github.com/mw10013"
            target="_blank"
            rel="noopener noreferrer"
            className="data-hovered:text-foreground text-muted-foreground font-medium transition-all"
          >
            @mw10013
          </Oui.Link>
        </p>
      </div>
    </footer>
  );
}
