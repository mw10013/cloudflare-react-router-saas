import type { Route } from "./+types/app.$organizationId.domain";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { env } from "cloudflare:workers";

export async function loader() {
  const { DOMAIN_DO } = env;
  const id = DOMAIN_DO.idFromName("domain");
  const stub = DOMAIN_DO.get(id);
  return { ping: await stub.ping(), high: await stub.high() };
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
