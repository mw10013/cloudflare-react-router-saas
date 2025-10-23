import type { SQLSchemaMigration } from "../../workers/sql-schema-migrations";
import type { Env } from "./test-worker";
import { env, listDurableObjectIds, runInDurableObject } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { SQLSchemaMigrations } from "../../workers/sql-schema-migrations";
import { SQLMigrationsDO } from "./test-worker";

function makeM(state: DurableObjectState, migrations: SQLSchemaMigration[]) {
  return new SQLSchemaMigrations({
    doStorage: state.storage,
    migrations: migrations,
  });
}

declare module "cloudflare:test" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ProvidedEnv extends Env {}
}

describe("happy paths", () => {
  it("empty initial storage", async () => {
    // Check sending request directly to instance
    const id = env.SQL_MIGRATIONS_DO.idFromName("emptyDO");
    const stub = env.SQL_MIGRATIONS_DO.get(id);

    await runInDurableObject(
      stub,
      async (instance: SQLMigrationsDO, state: DurableObjectState) => {
        const m = makeM(state, [
          {
            idMonotonicInc: 1,
            description: "test default tables",
            sql: `SELECT * FROM sqlite_master;`,
          },
        ]);
        m.runAll();

        expect(state.storage.sql.databaseSize).toEqual(8192);
        return Promise.resolve();
      },
    );

    // Check direct access to instance fields and storage
    await runInDurableObject(
      stub,
      async (instance: SQLMigrationsDO, state: DurableObjectState) => {
        expect(await state.storage.get<number>("__sql_migrations_lastID")).toBe(
          1,
        );
      },
    );

    // Check IDs can be listed
    const ids = await listDurableObjectIds(env.SQL_MIGRATIONS_DO);
    expect(ids.length).toBe(1);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    expect(ids[0].equals(id)).toBe(true);
  });

  it("multiple DDL", async () => {
    const id = env.SQL_MIGRATIONS_DO.idFromName("emptyDO");
    const stub = env.SQL_MIGRATIONS_DO.get(id);

    await runInDurableObject(
      stub,
      async (instance: SQLMigrationsDO, state: DurableObjectState) => {
        expect(instance).toBeInstanceOf(SQLMigrationsDO);

        const res = makeM(state, [
          {
            idMonotonicInc: 1,
            description: "tbl1",
            sql: `CREATE TABLE users(name TEXT PRIMARY KEY, age INTEGER);`,
          },
          {
            idMonotonicInc: 2,
            description: "tbl2",
            sql: `CREATE TABLE IF NOT EXISTS usersActivities (activityType TEXT, userName TEXT, PRIMARY KEY (userName, activityType));`,
          },
        ]).runAll();

        expect(res).toEqual({
          rowsRead: 2,
          rowsWritten: 6,
        });
        return Promise.resolve();
      },
    );
  });

  it("multiple DDL and data inserts", async () => {
    const id = env.SQL_MIGRATIONS_DO.idFromName("data-test");
    const stub = env.SQL_MIGRATIONS_DO.get(id);

    await runInDurableObject(
      stub,
      async (instance: SQLMigrationsDO, state: DurableObjectState) => {
        makeM(state, [
          {
            idMonotonicInc: 1,
            description: "tbl1",
            sql: `CREATE TABLE users(name TEXT PRIMARY KEY, age INTEGER);`,
          },
          {
            idMonotonicInc: 2,
            description: "data",
            sql: `INSERT INTO users VALUES ('ironman', 100); INSERT INTO users VALUES ('thor', 9000);`,
          },
          {
            idMonotonicInc: 3,
            description: "data2",
            sql: `INSERT INTO users VALUES ('hulk', 5);`,
          },
        ]).runAll();

        let rows = state.storage.sql
          .exec<{ name: string; age: number }>(`SELECT * FROM users;`)
          .toArray();
        expect(rows).toEqual([
          { name: "ironman", age: 100 },
          { name: "thor", age: 9000 },
          { name: "hulk", age: 5 },
        ]);

        makeM(state, [
          // Edge case but even if you do not provide the previous migrations
          // it should run only from where it left off.
          // WARNING: Do not do this in production since running these for a first time
          // on a fresh DO will fail!!!
          {
            idMonotonicInc: 4,
            description: "data3",
            sql: `DELETE FROM users WHERE name = 'thor';`,
          },
        ]).runAll();

        rows = state.storage.sql
          .exec<{ name: string; age: number }>(`SELECT * FROM users;`)
          .toArray();
        expect(rows).toEqual([
          { name: "ironman", age: 100 },
          { name: "hulk", age: 5 },
        ]);
        return Promise.resolve();
      },
    );
  });

  it("run migrations multiple times", async () => {
    const id = env.SQL_MIGRATIONS_DO.idFromName("emptyDO");
    const stub = env.SQL_MIGRATIONS_DO.get(id);

    await runInDurableObject(
      stub,
      async (instance: SQLMigrationsDO, state: DurableObjectState) => {
        const m1 = [
          {
            idMonotonicInc: 1,
            description: "tbl1",
            sql: `CREATE TABLE IF NOT EXISTS users(name TEXT PRIMARY KEY, age INTEGER);`,
          },
          {
            idMonotonicInc: 2,
            description: "tbl2",
            sql: `CREATE TABLE IF NOT EXISTS usersActivities (activityType TEXT, userName TEXT, PRIMARY KEY (userName, activityType));`,
          },
        ];
        const r1 = makeM(state, m1).runAll();

        const m2 = m1.concat([
          {
            idMonotonicInc: 3,
            description: "round 2",
            sql: `
                    CREATE TABLE IF NOT EXISTS marvel (heroName TEXT);
                    CREATE TABLE IF NOT EXISTS marvelMovies (name TEXT PRIMARY KEY, releaseDateMs INTEGER);
                    `,
          },
        ]);
        const r2_1 = makeM(state, m2).runAll();

        for (let i = 0; i < 5; i++) {
          const r2_n = makeM(state, m2).runAll();
          // Should have no effect running the same migrations.
          expect(r2_n).toEqual({
            rowsRead: 0,
            rowsWritten: 0,
          });
        }

        return Promise.resolve({ r1, r2: r2_1 });
      },
    );
  });

  it("hasMigrationsToRun", async () => {
    const id = env.SQL_MIGRATIONS_DO.idFromName("hasMigrationsToRun");
    const stub = env.SQL_MIGRATIONS_DO.get(id);

    await runInDurableObject(
      stub,
      async (instance: SQLMigrationsDO, state: DurableObjectState) => {
        expect(makeM(state, []).hasMigrationsToRun()).toEqual(false);

        const migrations = [
          {
            idMonotonicInc: 1,
            description: "tbl1",
            sql: `CREATE TABLE users(name TEXT PRIMARY KEY, age INTEGER);`,
          },
        ];
        const m = makeM(state, migrations);
        expect(m.hasMigrationsToRun()).toEqual(true);
        m.runAll();
        expect(m.hasMigrationsToRun()).toEqual(false);

        const m1 = makeM(state, migrations);
        expect(m1.hasMigrationsToRun()).toEqual(false);

        return Promise.resolve();
      },
    );
  });
});

describe("expected exceptions", () => {
  it("duplicate IDs", async () => {
    const id = env.SQL_MIGRATIONS_DO.idFromName("emptyDO");
    const stub = env.SQL_MIGRATIONS_DO.get(id);

    await runInDurableObject(
      stub,
      async (instance: SQLMigrationsDO, state: DurableObjectState) => {
        expect(() =>
          makeM(state, [
            {
              idMonotonicInc: 1,
              description: "tbl1",
              sql: `CREATE TABLE users(name TEXT PRIMARY KEY, age INTEGER);`,
            },
            {
              idMonotonicInc: 2,
              description: "tbl1",
              sql: `CREATE TABLE IF NOT EXISTS users(name TEXT PRIMARY KEY, age INTEGER);`,
            },
            {
              idMonotonicInc: 1,
              description: "tbl2",
              sql: `CREATE TABLE IF NOT EXISTS usersActivities (activityType TEXT, userName TEXT, PRIMARY KEY (userName, activityType));`,
            },
          ]).runAll(),
        ).toThrowError("Duplicate migration ID detected: 1");
        return Promise.resolve();
      },
    );
  });

  it("negative IDs", async () => {
    const id = env.SQL_MIGRATIONS_DO.idFromName("emptyDO");
    const stub = env.SQL_MIGRATIONS_DO.get(id);

    await runInDurableObject(
      stub,
      async (instance: SQLMigrationsDO, state: DurableObjectState) => {
        expect(() =>
          makeM(state, [
            {
              idMonotonicInc: -1,
              description: "tbl1",
              sql: `CREATE TABLE users(name TEXT PRIMARY KEY, age INTEGER);`,
            },
          ]).runAll(),
        ).toThrowError("Migration ID cannot be negative: -1");
        return Promise.resolve();
      },
    );
  });
});
