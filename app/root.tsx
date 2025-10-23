import type { NavigateOptions } from "react-router";
import type { Route } from "./+types/root";
import * as Oui from "@/components/ui/oui-index";
import { RouterProvider } from "react-aria-components";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useHref,
  useNavigate,
} from "react-router";
import "@/app/app.css";

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
];

// https://github.com/adobe/react-spectrum/issues/6397
// https://github.com/argos-ci/argos/blob/4822931b05c78e1b4a79e15cf4437fb0297369a6/apps/frontend/src/router.tsx#L21-L31
function useHrefEx(href: string) {
  const resolvedHref = useHref(href);
  if (
    href.startsWith("https://") ||
    href.startsWith("http://") ||
    href.startsWith("mailto:")
  ) {
    return href;
  }
  return resolvedHref;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      {/* shadcn app/layout RootLayout */}
      <body className="background font-sans antialiased">
        {/* <Toaster /> */}
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <RouterProvider navigate={navigate} useHref={useHrefEx}>
          <Oui.DialogEx1AlertProvider>{children}</Oui.DialogEx1AlertProvider>
          <ScrollRestoration />
          <Scripts />
        </RouterProvider>
      </body>
    </html>
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
