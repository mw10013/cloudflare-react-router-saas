import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as Oui from "@/components/ui/oui-index";
import * as ReactRouter from "react-router";

/**
 * ErrorBoundary for React Router.
 *
 * @example
 * ```tsx
 * import * as OuiReactRouter from "@/components/oui-react-router-index";
 *
 * export const ErrorBoundary = OuiReactRouter.ReactRouterErrorBoundary;
 * ```
 */
export function ReactRouterErrorBoundary({ error }: { error: unknown }) {
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
            Go Home
          </Oui.Link>
        </CardFooter>
      </Card>
    </main>
  );
}
