export interface SQLSchemaMigration {
  idMonotonicInc: number;
  description: string;
  sql?: string;
}

export interface SQLSchemaMigrationsConfig {
  doStorage: DurableObjectStorage;
  migrations: SQLSchemaMigration[];
  kvKey?: string;
}

export class SQLSchemaMigrations {
  #_config: SQLSchemaMigrationsConfig;
  #_migrations: SQLSchemaMigration[];
  #_kvKey: string;
  #_lastMigrationId: number;

  constructor(config: SQLSchemaMigrationsConfig) {
    this.#_config = config;
    this.#_kvKey = config.kvKey ?? "__sql_migrations_lastID";

    const migrations = [...config.migrations];
    migrations.sort((a, b) => a.idMonotonicInc - b.idMonotonicInc);
    const idSeen = new Set<number>();
    migrations.forEach((m) => {
      if (m.idMonotonicInc < 0) {
        throw new Error(
          `Migration ID cannot be negative: ${String(m.idMonotonicInc)}`,
        );
      }
      if (idSeen.has(m.idMonotonicInc)) {
        throw new Error(
          `Duplicate migration ID detected: ${String(m.idMonotonicInc)}`,
        );
      }
      idSeen.add(m.idMonotonicInc);
    });

    this.#_migrations = migrations;

    this.#_lastMigrationId =
      this.#_config.doStorage.kv.get<number>(this.#_kvKey) ?? -1;
  }

  /**
   * Checks if there are any migrations that have not been run yet.
   * @returns `true` if there are pending migrations, `false` otherwise.
   */
  hasMigrationsToRun(): boolean {
    if (!this.#_migrations.length) {
      return false;
    }
    return (
      this.#_lastMigrationId <
      this.#_migrations[this.#_migrations.length - 1].idMonotonicInc
    );
  }

  runAll(sqlGen?: (idMonotonicInc: number) => string): {
    rowsRead: number;
    rowsWritten: number;
  } {
    const result = {
      rowsRead: 0,
      rowsWritten: 0,
    };

    if (!this.hasMigrationsToRun()) {
      return result;
    }

    // Find the index of the last successfully run migration (by exact ID match) to locate the start of pending ones
    const lastRunIndex = this.#_migrations.findIndex(
      (m) => m.idMonotonicInc === this.#_lastMigrationId,
    );
    // If no exact match (e.g., none run yet), run all; otherwise, slice from the next migration
    const migrationsToRun =
      lastRunIndex === -1
        ? this.#_migrations
        : this.#_migrations.slice(lastRunIndex + 1);

    if (migrationsToRun.length > 0) {
      this.#_config.doStorage.transactionSync(() => {
        migrationsToRun.forEach((m) => {
          const query = m.sql ?? sqlGen?.(m.idMonotonicInc);
          if (!query) {
            throw new Error(
              `migration with neither 'sql' nor 'sqlGen' provided: ${String(m.idMonotonicInc)}`,
            );
          }
          const cursor = this.#_config.doStorage.sql.exec(query);
          // Consume the cursor for accurate rowsRead/rowsWritten tracking.
          cursor.toArray();

          result.rowsRead += cursor.rowsRead;
          result.rowsWritten += cursor.rowsWritten;
        });

        this.#_config.doStorage.kv.put(
          this.#_kvKey,
          migrationsToRun[migrationsToRun.length - 1].idMonotonicInc,
        );
      });
      // Only update the instance property after the transaction succeeds.
      // If updated inside the transaction and it fails, the instance property
      // would be ahead of storage, causing hasMigrationsToRun() to incorrectly
      // return false on subsequent calls.
      this.#_lastMigrationId =
        migrationsToRun[migrationsToRun.length - 1].idMonotonicInc;
    }

    return result;
  }
}
