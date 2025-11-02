import type { Route } from "./+types/app.$organizationId.domain";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function loader() {
  return { message: "Domain management coming soon" };
}

export default function RouteComponent({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex flex-col gap-8 p-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Domain</h1>
        <p className="text-muted-foreground text-sm">
          Manage your organization's domain settings.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Domain Information</CardTitle>
          <CardDescription>
            View and manage domain-related settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre>{JSON.stringify(loaderData, null, 2)}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
