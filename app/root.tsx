import type { NavigateOptions } from "react-router";
import type { Route } from "./+types/root";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as Oui from "@/components/ui/oui-index";
import { themeSessionResolver } from "@/lib/theme.server";
import * as ReactRouter from "react-router";
import * as RemixThemes from "remix-themes";
import "@/app/app.css";
import { ReactRouterProvider } from "@/components/oui-react-router-provider";
import { env } from "cloudflare:workers";

declare module "react-aria-components" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "icon",
    href: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    type: "image/png",
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  const { getTheme } = await themeSessionResolver(request);
  throw new Error("Test error");
  return {
    theme: getTheme(),
    isAnalyticsEnabled: env.ENVIRONMENT === "production",
  };
}

function Html({
  children,
  ssrTheme,
  isAnalyticsEnabled,
}: {
  children: React.ReactNode;
  ssrTheme: boolean;
  isAnalyticsEnabled: boolean;
}) {
  const [theme] = RemixThemes.useTheme();
  return (
    <html lang="en" className={theme ?? ""}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>crrs</title>
        <meta
          name="description"
          content="Saas template for cloudflare and react router."
        />
        <RemixThemes.PreventFlashOnWrongTheme ssrTheme={ssrTheme} />
        <ReactRouter.Links />
      </head>
      <body className="font-sans antialiased">
        <ReactRouterProvider>
          <Oui.DialogExAlertProvider>{children}</Oui.DialogExAlertProvider>
          <ReactRouter.ScrollRestoration />
          <ReactRouter.Scripts />
          {isAnalyticsEnabled && (
            <script
              defer
              src="https://static.cloudflareinsights.com/beacon.min.js"
              data-cf-beacon='{"token": "cda8ee53d031493ea855f227fcd90239"}'
            ></script>
          )}
        </ReactRouterProvider>
      </body>
    </html>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  // Layout is used by ErrorBoundary where there may be no loader data so cannot use unstable_useRoute
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data = ReactRouter.useRouteLoaderData("root");
  return (
    <RemixThemes.ThemeProvider
      // ?? ensures undefined (from missing loader data) becomes null for ThemeProvider type
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      specifiedTheme={data?.loaderData?.theme ?? null}
      themeAction="/action/set-theme"
      disableTransitionOnThemeChange
    >
      <Html
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        ssrTheme={Boolean(data?.loaderData?.theme)}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        isAnalyticsEnabled={Boolean(data?.loaderData?.isAnalyticsEnabled)}
      >
        {children}
      </Html>
    </RemixThemes.ThemeProvider>
  );
}

export default function App() {
  return <ReactRouter.Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Error";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (ReactRouter.isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <Card>
        <CardHeader>
          <CardTitle>{message}</CardTitle>
        </CardHeader>
        <CardContent>
          {details}
          {stack && (
            <pre className="overflow-x-auto pt-4">
              <code>{stack}</code>
            </pre>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <Oui.Link
            className={Oui.buttonClassName({ variant: "secondary" })}
            href="/"
          >
            Return Home
          </Oui.Link>
        </CardFooter>
      </Card>
    </main>
  );
}
