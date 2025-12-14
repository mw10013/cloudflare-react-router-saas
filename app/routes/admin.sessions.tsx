import type { Route } from "./+types/admin.sessions";
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
  const result = await repository.getSessions({
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
    sessions: result.sessions,
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
        <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
        <p className="text-muted-foreground text-sm">Manage your sessions.</p>
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

      <Oui.Table aria-label="Sessions">
        <Oui.TableHeader>
          <Oui.Column isRowHeader className="w-8">
            Id
          </Oui.Column>
          <Oui.Column>Email</Oui.Column>
          <Oui.Column>IP Address</Oui.Column>
          <Oui.Column>Created At</Oui.Column>
          <Oui.Column>Expires At</Oui.Column>
        </Oui.TableHeader>
        <Oui.TableBody items={loaderData.sessions}>
          {(session) => (
            <Oui.Row id={session.sessionId}>
              <Oui.Cell>{session.sessionId}</Oui.Cell>
              <Oui.Cell>{session.user.email}</Oui.Cell>
              <Oui.Cell>{session.ipAddress ?? ""}</Oui.Cell>
              <Oui.Cell>
                {new Date(session.createdAt).toLocaleString()}
              </Oui.Cell>
              <Oui.Cell>
                {new Date(session.expiresAt).toLocaleString()}
              </Oui.Cell>
            </Oui.Row>
          )}
        </Oui.TableBody>
      </Oui.Table>

      {loaderData.pageCount > 1 && (
        <Oui.Pagination selectedKeys={[loaderData.page]}>
          <Oui.PaginationItem
            id="prev"
            href={`/admin/sessions?page=${String(
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
              href={`/admin/sessions?page=${String(i + 1)}${
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
            href={`/admin/sessions?page=${String(
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
