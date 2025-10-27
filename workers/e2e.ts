import type { Repository } from "@/lib/repository";
import type { StripeService } from "@/lib/stripe-service";
import { env } from "cloudflare:workers";
import * as Hono from "hono";

/*
curl -X POST http://localhost:5173/api/e2e/delete/user/e2e@e2e.com | jq
curl -X POST http://localhost:5173/api/e2e/delete/user/e2e@e2e.com -w "\nStatus: %{http_code}\n"
curl -X POST http://localhost:5173/api/e2e/delete/user/a@a.com -w "\nStatus: %{http_code}\n"
*/

export function createE2eRoutes({
  repository,
  stripeService: { stripe },
}: {
  repository: Repository;
  stripeService: StripeService;
}) {
  const e2e = new Hono.Hono().basePath("/api/e2e");
  const d1 = env.D1;

  e2e.post("/delete/user/:email", async (c) => {
    const email = c.req.param("email");

    // Always delete Stripe customers by email since D1 database may be out of sync
    const customers = await stripe.customers.list({
      email,
      expand: ["data.subscriptions"],
    });
    for (const customer of customers.data) {
      await stripe.customers.del(customer.id);
    }

    const user = await repository.getUser({ email });
    if (!user) {
      return c.json({
        success: true,
        message: `User ${email} already deleted.`,
      });
    }
    if (user.role === "admin") {
      return c.json(
        {
          success: false,
          message: `Cannot delete admin user ${email}.`,
        },
        403,
      );
    }
    const results = await d1.batch([
      d1
        .prepare(
          `
with t as (
  select m.organizationId
  from Member m
  where m.userId = ?1 and m.role = 'owner'
  and not exists (
    select 1 from Member m1
    where m1.organizationId = m.organizationId
    and m1.userId != ?1 and m1.role = 'owner'
  )
)
delete from Organization where organizationId in (select organizationId from t)
`,
        )
        .bind(user.userId),
      d1
        .prepare(
          `delete from User where userId = ? and role <> 'admin' returning *`,
        )
        .bind(user.userId),
    ]);
    const deletedCount = results[1].results.length;
    console.log(
      `e2e deleted user ${email} (deletedCount: ${String(deletedCount)})`,
    );
    return c.json({
      success: true,
      message: `Deleted user ${email} (deletedCount: ${String(deletedCount)}).`,
      customers: customers.data,
    });
  });
  return e2e;
}
