import { DurableObject } from "cloudflare:workers";

export interface Env {
  SQL_MIGRATIONS_DO: DurableObjectNamespace<SQLMigrationsDO>;
}

export class SQLMigrationsDO extends DurableObject<Env> {
  echo(s: string) {
    return Promise.resolve(s);
  }
}

export default {
  fetch(_request: Request, _env: Env, _ctx: ExecutionContext) {
    return new Response("-_-", { status: 404 });
  },
};
