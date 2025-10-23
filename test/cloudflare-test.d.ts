/* eslint-disable @typescript-eslint/no-explicit-any */

declare module "cloudflare:test" {
  // ProvidedEnv controls the type of `import("cloudflare:test").env`
  interface ProvidedEnv extends Env {
    TEST_MIGRATIONS: D1Migration[];
  }

  /**
   * Run code within a Durable Object instance.
   *
   * BUG: TypeScript type incompatibility between standard Request and \@cloudflare/workers-types Request.
   * @see https://github.com/cloudflare/workers-sdk/issues/10108
   */
  export function runInDurableObject<T>(
    stub: any,
    callback: (instance: any, state: any) => Promise<T>,
  ): Promise<T>;

  /**
   * Lists all Durable Object IDs for a given namespace
   */
  export function listDurableObjectIds(namespace: any): Promise<any[]>;
}
