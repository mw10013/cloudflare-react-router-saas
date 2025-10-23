import { env } from "cloudflare:test";

export async function resetDb(resetFn?: (db: D1Database) => Promise<void>) {
  await env.D1.batch([
    // Delete from referencing tables first to avoid FK constraint errors
    ...["Session", "Member", "Invitation", "Verification", "Organization"].map(
      (table) => env.D1.prepare(`delete from ${table}`),
    ),
    // Keep the admin in account and user.
    env.D1.prepare(`delete from Account where accountId <> 1`),
    env.D1.prepare(`delete from User where userId <> 1`),
  ]);
  if (resetFn) await resetFn(env.D1);
}
