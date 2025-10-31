import type { CustomAdapter } from "@better-auth/core/db/adapter";
import type { CleanedWhere } from "better-auth/adapters";
import type { Where } from "better-auth/types";
import { createAdapterFactory } from "better-auth/adapters";

/**
 * Better-Auth options allow you to specify model names and we do so to align with our
 * SQLite schema, which uses capitalized table names (e.g., 'User').
 * Better-Auth adapter test harness hard-codes model names in lower-case (e.g., 'user').
 * Fortunately, the hard-coded model names are singular but we still need to handle the capitalization.
 *
 * Better-Auth uses `id` as the primary key for all its domain objects. Our SQLLite schema uses `userId` and `sessionId` ie.
 * the name of the table with first letter lowercased and `Id` appended. We map select and where clauses along with D1 results
 * to adapt to this convention.
 * 
 * If a Better-Auth field name conflicts with an id name, the field name needs to be renamed. A Better-Auth `account` has a field
 * named `accountId`. We rename it to `betterAuthAccountId` and convey that to Better-Auth in its options.

 * @example
 * account: {
 *   modelName: "Account",
 *   fields: { accountId: "betterAuthAccountId" },
 * }
 *
 * We need to map database results to change model id to Better-Auth id. Eg. `userId` -> `id`, `sessionId` -> `id.
 * The Better-Auth CustomAdapter interface uses an unconstrained type parameter of `T` and that is too loose for our mapping
 * since we need to work with a `Record<string, unknown>` shape. Currently using `as any` to get around this and hope we can
 * find a type-safe solution in the future.
 *
 * Better-Auth does not seem to serialize Date objects as text in where clauses when `supportsDates` is false.
 * We handle this by serializing Date objects to ISO strings in `where` processing.
 *
 * Better-Auth with the Organization plugin does not seem to handle `activeOrganizationId` data transformation.
 * The Organization plugin works with `activeOrganizationId` as a string, but the SQLite schema has it typed as a number.
 * We handle this by transforming `activeOrganizationId` in the `customTransformOutput` function.
 */

function adapt({
  model: rawModel,
  select,
  where,
}: {
  model: string;
  select?: string[];
  where?: Where[];
}) {
  const model =
    rawModel[0] === rawModel[0].toLowerCase()
      ? rawModel[0].toUpperCase() + rawModel.slice(1)
      : rawModel;
  const modelId = model[0].toLowerCase() + model.slice(1) + "Id";

  return {
    model,
    modelId,
    selectClause: select?.length
      ? select.map((s) => (s === "id" ? modelId : s)).join(", ")
      : "*",
    ...adaptWhere({ where, modelId }),
    mapResult: <T extends Record<string, unknown>>(result?: T | null) => {
      if (!result) return null;
      const id = result[modelId];
      return id === undefined ? result : { ...result, id }; // For simplicity, we append `id` rather than replace.
    },
  };
}

function adaptWhere({ where, modelId }: { where?: Where[]; modelId: string }): {
  whereClause?: string;
  // unknown[] to align with D1's bind(...values: unknown[]) method
  whereValues: unknown[];
} {
  if (!where || where.length === 0)
    return { whereClause: undefined, whereValues: [] };

  const serializeWhereValue = (v: unknown): unknown =>
    v instanceof Date ? v.toISOString() : v;

  const clauses: string[] = [];
  const whereValues: unknown[] = [];
  for (const w of where) {
    type Operator = NonNullable<Where["operator"]>;
    const op = (w.operator ?? "eq") as Operator;
    const field = w.field === "id" ? modelId : w.field;
    let sql = "";
    switch (op) {
      case "eq":
        sql = `${field} = ?`;
        whereValues.push(serializeWhereValue(w.value));
        break;
      case "ne":
        sql = `${field} <> ?`;
        whereValues.push(serializeWhereValue(w.value));
        break;
      case "lt":
        sql = `${field} < ?`;
        whereValues.push(serializeWhereValue(w.value));
        break;
      case "lte":
        sql = `${field} <= ?`;
        whereValues.push(serializeWhereValue(w.value));
        break;
      case "gt":
        sql = `${field} > ?`;
        whereValues.push(serializeWhereValue(w.value));
        break;
      case "gte":
        sql = `${field} >= ?`;
        whereValues.push(serializeWhereValue(w.value));
        break;
      case "in":
        if (Array.isArray(w.value) && w.value.length > 0) {
          sql = `${field} in (${w.value.map(() => "?").join(",")})`;
          whereValues.push(...w.value.map(serializeWhereValue));
        } else {
          sql = "0"; // always false
        }
        break;
      case "not_in":
        if (Array.isArray(w.value) && w.value.length > 0) {
          sql = `${field} not in (${w.value.map(() => "?").join(",")})`;
          whereValues.push(...w.value.map(serializeWhereValue));
        } else {
          sql = "1"; // always true
        }
        break;
      case "contains":
        sql = `${field} like ?`;
        whereValues.push(`%${String(serializeWhereValue(w.value))}%`);
        break;
      case "starts_with":
        sql = `${field} like ?`;
        whereValues.push(`${String(serializeWhereValue(w.value))}%`);
        break;
      case "ends_with":
        sql = `${field} like ?`;
        whereValues.push(`%${String(serializeWhereValue(w.value))}`);
        break;
      default:
        void (op satisfies never);
        throw new Error(`Unsupported where operator: ${String(op)}`);
    }
    clauses.push(sql);
  }
  let whereClause = clauses[0];
  for (let i = 1; i < clauses.length; i++) {
    whereClause = `${whereClause} ${where[i].connector ?? "and"} ${clauses[i]}`;
  }
  return { whereClause, whereValues };
}

export const d1Adapter = (db: D1Database | D1DatabaseSession) => {
  return createAdapterFactory({
    config: {
      adapterId: "d1-adapter",
      adapterName: "D1 Adapter",
      supportsNumericIds: true,
      supportsDates: false,
      supportsBooleans: false,
      disableIdGeneration: true,
      debugLogs: false,
      // debugLogs: {
      //   deleteMany: true,
      // },
      customTransformOutput: ({ field, data }) => {
        if (field === "activeOrganizationId" && typeof data === "number") {
          return String(data);
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return data;
      },
    },
    adapter: () => {
      const create: CustomAdapter["create"] = async ({
        model,
        data,
        select,
      }) => {
        const adapted = adapt({ model, select });
        const keys = Object.keys(data);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        const values = keys.map((k) => data[k]);
        const placeholders = keys.map(() => "?").join(",");
        const sql = `insert into ${adapted.model} (${keys.join(",")}) values (${placeholders}) returning ${adapted.selectClause}`;
        const result = adapted.mapResult<typeof data>(
          await db
            .prepare(sql)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            .bind(...values)
            .first(),
        );
        if (!result) {
          throw new Error(`Failed to create record in ${model}`);
        }
        return result;
      };

      const findOne: CustomAdapter["findOne"] = async ({
        model,
        where,
        select,
      }) => {
        const adapted = adapt({ model, select, where });
        const sql = `select ${adapted.selectClause} from ${adapted.model} ${adapted.whereClause ? `where ${adapted.whereClause}` : ""} limit 1`;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return adapted.mapResult<Record<string, unknown>>(
          await db
            .prepare(sql)
            .bind(...adapted.whereValues)
            .first(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any; // Better-Auth has unconstrained type parameter but we are working with a Record shape.
      };

      const findMany: CustomAdapter["findMany"] = async ({
        model,
        where,
        limit,
        sortBy,
        offset,
      }: {
        model: string;
        where?: CleanedWhere[];
        limit: number;
        sortBy?: {
          field: string;
          direction: "asc" | "desc";
        };
        offset?: number;
      }) => {
        const adapted = adapt({ model, where });
        let sql = `select * from ${adapted.model}`;
        if (adapted.whereClause) sql += ` where ${adapted.whereClause}`;
        if (sortBy) sql += ` order by ${sortBy.field} ${sortBy.direction}`;
        sql += ` limit ${String(limit)}`;
        if (offset) sql += ` offset ${String(offset)}`;
        const result = await db
          .prepare(sql)
          .bind(...adapted.whereValues)
          .run();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
        return result.results.map(adapted.mapResult) as any[]; // Better-Auth has unconstrained type parameter but we are working with a Record shape.
      };

      const update: CustomAdapter["update"] = async ({
        model,
        where,
        update,
      }) => {
        const adapted = adapt({ model, where });
        const set = Object.keys(update as object)
          .map((k) => `${k} = ?`)
          .join(",");
        const setValues = Object.values(update as object);
        const sql = `update ${adapted.model} set ${set} ${
          adapted.whereClause ? `where ${adapted.whereClause}` : ""
        } returning *`;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return adapted.mapResult(
          await db
            .prepare(sql)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            .bind(...setValues, ...adapted.whereValues)
            .first(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any; // Better-Auth has unconstrained type parameter but we are working with a Record shape.
      };

      const updateMany: CustomAdapter["updateMany"] = async ({
        model,
        where,
        update,
      }) => {
        const adapted = adapt({ model, where });
        const set = Object.keys(update)
          .map((k) => `${k} = ?`)
          .join(",");
        const setValues = Object.values(update);
        const sql = `update ${adapted.model} set ${set} ${adapted.whereClause ? `where ${adapted.whereClause}` : ""}`;
        const result = await db
          .prepare(sql)
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          .bind(...setValues, ...adapted.whereValues)
          .run();
        return result.meta.changes;
      };

      const del: CustomAdapter["delete"] = async ({ model, where }) => {
        const adapted = adapt({ model, where });
        const sql = `delete from ${adapted.model} ${adapted.whereClause ? `where ${adapted.whereClause}` : ""}`;
        await db
          .prepare(sql)
          .bind(...adapted.whereValues)
          .run();
      };

      const deleteMany: CustomAdapter["deleteMany"] = async ({
        model,
        where,
      }) => {
        const adapted = adapt({ model, where });
        const sql = `delete from ${adapted.model} ${adapted.whereClause ? `where ${adapted.whereClause}` : ""} returning *`;
        const result = await db
          .prepare(sql)
          .bind(...adapted.whereValues)
          .run();
        return result.results.length; // result.meta.changes is impacted by 'on delete cascade' so we cannot use.
      };

      const count: CustomAdapter["count"] = async ({ model, where }) => {
        const adapted = adapt({ model, where });
        const sql = `select count(*) as count from ${adapted.model} ${adapted.whereClause ? `where ${adapted.whereClause}` : ""}`;
        const result = await db
          .prepare(sql)
          .bind(...adapted.whereValues)
          .first<number>("count");
        if (!result) {
          throw new Error(`Failed to count records in ${model}`);
        }
        return result;
      };

      return {
        create,
        findOne,
        findMany,
        update,
        updateMany,
        delete: del,
        deleteMany,
        count,
      };
    },
  });
};
