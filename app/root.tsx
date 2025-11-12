import type { NavigateOptions } from "react-router";
import type { Route } from "./+types/root";
import * as Oui from "@/components/ui/oui-index";
import { themeSessionResolver } from "@/lib/theme.server";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  unstable_useRoute,
} from "react-router";
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
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
  return { theme: getTheme(), environment: env.ENVIRONMENT };
}

interface HtmlProps {
  children: React.ReactNode;
  ssrTheme: boolean;
  environment: typeof env.ENVIRONMENT;
}

function Html({ children, ssrTheme, environment }: HtmlProps) {
  const [theme] = useTheme();
  return (
    <html lang="en" className={theme ?? ""}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={ssrTheme} />
        <Links />
      </head>
      <body className="font-sans antialiased">
        <ReactRouterProvider>
          <Oui.DialogExAlertProvider>{children}</Oui.DialogExAlertProvider>
          <ScrollRestoration />
          <Scripts />
          {environment === "production" && (
            <>
              {/* Cloudflare Web Analytics */}
              <script
                defer
                src="https://static.cloudflareinsights.com/beacon.min.js"
                data-cf-beacon='{"token": "cda8ee53d031493ea855f227fcd90239"}'
              ></script>
              {/* End Cloudflare Web Analytics */}
            </>
          )}
        </ReactRouterProvider>
      </body>
    </html>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = unstable_useRoute("root");
  return (
    <ThemeProvider
      specifiedTheme={data.loaderData?.theme ?? null}
      themeAction="/action/set-theme"
      disableTransitionOnThemeChange
    >
      <Html
        ssrTheme={Boolean(data.loaderData?.theme)}
        environment={data.loaderData?.environment ?? "local"}
      >
        {children}
      </Html>
    </ThemeProvider>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "A dreadful error occurred.";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
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
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
