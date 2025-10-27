import type { NavigateOptions } from "react-router";
import * as React from "react";
import * as Rac from "react-aria-components";
import * as ReactRouter from "react-router";

// https://github.com/adobe/react-spectrum/issues/6397
// https://github.com/adobe/react-spectrum/issues/6397#issuecomment-2838553394

declare module "react-aria-components" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

const isExternal = (href: string) =>
  href.startsWith("https://") ||
  href.startsWith("http://") ||
  href.startsWith("mailto:");

const useHref = (href: string) => {
  const reactRouterHref = ReactRouter.useHref(href);
  return isExternal(href) ? href : reactRouterHref;
};

export function ReactRouterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const reactRouterNavigate = ReactRouter.useNavigate();
  const navigate = React.useCallback(
    (path: string, options?: ReactRouter.NavigateOptions) => {
      if (isExternal(path)) {
        window.location.href = path;
      } else {
        void reactRouterNavigate(path, options);
      }
    },
    [reactRouterNavigate],
  );

  return (
    <Rac.RouterProvider navigate={navigate} useHref={useHref}>
      {children}
    </Rac.RouterProvider>
  );
}
