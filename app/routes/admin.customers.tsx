import type { Route } from "./+types/admin.customers";
import * as Oui from "@/components/ui/oui-index";
import { RequestContext } from "@/lib/request-context";
import { invariant } from "@epic-web/invariant";
import * as ReactRouter from "react-router";
import * as z from "zod";

export async function loader({ request, context }: Route.LoaderArgs) {
  const LIMIT = 20;
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams);
  const schema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    filter: z.string().trim().optional(),
  });
  const { page, filter } = schema.parse(params);
  const offset = (page - 1) * LIMIT;
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { repository } = requestContext;
  const result = await repository.getCustomers({
    limit: LIMIT,
    offset,
    searchValue: filter === "" ? undefined : filter,
  });
  const pageCount = Math.max(1, Math.ceil(result.count / LIMIT));
  if (page > pageCount) {
    const u = new URL(request.url);
    u.searchParams.set("page", String(pageCount));
    return ReactRouter.redirect(u.toString());
  }

  return {
    customers: result.customers,
    page,
    pageCount,
    filter,
  };
}

export default function RouteComponent({ loaderData }: Route.ComponentProps) {
  const navigate = ReactRouter.useNavigate();

  return (
    <div className="flex flex-col gap-8 p-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground text-sm">
          Manage your customers and subscriptions.
        </p>
      </header>

      <div>
        <Oui.SearchField
          aria-label="Filter by email"
          defaultValue={loaderData.filter ?? ""}
          name="filter"
          onSubmit={(filter: string) =>
            void navigate(`./?filter=${encodeURIComponent(filter)}&page=1`)
          }
        >
          <Oui.Input placeholder="Filter by email..." />
        </Oui.SearchField>
      </div>

      <Oui.Table aria-label="Customers">
        <Oui.TableHeader>
          <Oui.Column isRowHeader className="w-8">
            Id
          </Oui.Column>
          <Oui.Column>Email</Oui.Column>
          <Oui.Column>Stripe Customer ID</Oui.Column>
          <Oui.Column>Stripe Subscription ID</Oui.Column>
          <Oui.Column>Plan</Oui.Column>
          <Oui.Column>Status</Oui.Column>
        </Oui.TableHeader>
        <Oui.TableBody items={loaderData.customers}>
          {(customer) => (
            <Oui.Row id={customer.userId}>
              <Oui.Cell>{customer.userId}</Oui.Cell>
              <Oui.Cell>{customer.email}</Oui.Cell>
              <Oui.Cell>
                {customer.stripeCustomerId ? (
                  <Oui.Link
                    href={`https://dashboard.stripe.com/customers/${customer.stripeCustomerId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {customer.stripeCustomerId}
                  </Oui.Link>
                ) : (
                  ""
                )}
              </Oui.Cell>
              <Oui.Cell>
                {customer.subscription?.stripeSubscriptionId ? (
                  <Oui.Link
                    href={`https://dashboard.stripe.com/subscriptions/${customer.subscription.stripeSubscriptionId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {customer.subscription.stripeSubscriptionId}
                  </Oui.Link>
                ) : (
                  ""
                )}
              </Oui.Cell>
              <Oui.Cell>{customer.subscription?.plan ?? ""}</Oui.Cell>
              <Oui.Cell>{customer.subscription?.status ?? ""}</Oui.Cell>
            </Oui.Row>
          )}
        </Oui.TableBody>
      </Oui.Table>

      {loaderData.pageCount > 1 && (
        <Oui.Pagination selectedKeys={[loaderData.page]}>
          <Oui.PaginationItem
            id="prev"
            href={`/admin/customers?page=${String(
              loaderData.page > 1 ? loaderData.page - 1 : 1,
            )}${
              loaderData.filter
                ? `&filter=${encodeURIComponent(loaderData.filter)}`
                : ""
            }`}
            isDisabled={loaderData.page <= 1}
          >
            Previous
          </Oui.PaginationItem>
          {Array.from({ length: loaderData.pageCount }, (_, i) => (
            <Oui.PaginationItem
              key={i + 1}
              id={String(i + 1)}
              href={`/admin/customers?page=${String(i + 1)}${
                loaderData.filter
                  ? `&filter=${encodeURIComponent(loaderData.filter)}`
                  : ""
              }`}
            >
              {i + 1}
            </Oui.PaginationItem>
          ))}
          <Oui.PaginationItem
            id="next"
            href={`/admin/customers?page=${String(
              loaderData.page < loaderData.pageCount
                ? loaderData.page + 1
                : loaderData.pageCount,
            )}${
              loaderData.filter
                ? `&filter=${encodeURIComponent(loaderData.filter)}`
                : ""
            }`}
            isDisabled={loaderData.page >= loaderData.pageCount}
          >
            Next
          </Oui.PaginationItem>
        </Oui.Pagination>
      )}
    </div>
  );
}
