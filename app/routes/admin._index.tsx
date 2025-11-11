import type { Route } from "./+types/admin._index";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RequestContext } from "@/lib/request-context";
import { invariant } from "@epic-web/invariant";

export async function loader({ context }: Route.LoaderArgs) {
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { repository } = requestContext;

  return {
    dashboardData: await repository.getAdminDashboardData(),
  };
}

export default function RouteComponent({
  loaderData: { dashboardData },
}: Route.ComponentProps) {
  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>
            Total customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {dashboardData.customerCount}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
          <CardDescription>Subscriptions currently active</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {dashboardData.activeSubscriptionCount}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trialing Subscriptions</CardTitle>
          <CardDescription>Subscriptions in trial period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {dashboardData.trialingSubscriptionCount}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
