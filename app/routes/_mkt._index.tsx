import type { Route as MktRoute } from "./+types/_mkt"; // Import type from parent route
import type { Route } from "./+types/_mkt._index";
import * as Oui from "@/components/ui/oui-index";
import { useRouteLoaderData } from "react-router";

export function meta(_: Route.MetaArgs) {
  return [{ title: "saas" }, { name: "description", content: "saas template" }];
}

export default function RouteComponent() {
  const mktRouteLoaderData =
    useRouteLoaderData<MktRoute.ComponentProps["loaderData"]>("routes/_mkt");
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6">
      <h1 className="text-center text-6xl font-bold tracking-tighter md:text-8xl">
        SaaS
      </h1>
      <div className="mt-8">
        {mktRouteLoaderData?.sessionUser ? (
          <Oui.Link
            href={
              mktRouteLoaderData.sessionUser.role === "admin"
                ? "/admin"
                : "/app"
            }
          >
            Enter
          </Oui.Link>
        ) : (
          <Oui.Link href="/login">Get Started</Oui.Link>
        )}
      </div>
    </div>
  );
}
