export type D1SessionService = ReturnType<typeof createD1SessionService>;

export interface CreateD1SessionServiceConfig {
  d1: D1Database;
  request: Request;
  sessionConstraint?: D1SessionConstraint;
}

export function createD1SessionService({
  d1,
  request,
  ...config
}: CreateD1SessionServiceConfig) {
  let sessionConstraint: D1SessionConstraint | undefined =
    config.sessionConstraint;
  let session: D1DatabaseSession | null = null;
  const BOOKMARK_COOKIE_NAME = "X-D1-Bookmark";

  const setSessionContraint = (constraint: D1SessionConstraint) => {
    sessionConstraint = constraint;
    if (session) {
      console.warn(
        "WARNING: D1 session constraint changed after session was created",
      );
    }
  };

  const getSession = (constraint?: D1SessionConstraint): D1DatabaseSession => {
    if (!session) {
      const cookie = request.headers.get("Cookie");
      const bookmark = cookie
        ?.split(";")
        .find((c) => c.trim().startsWith(`${BOOKMARK_COOKIE_NAME}=`))
        ?.split("=")[1];
      // console.log(`d1-session-service: cookie bookmark: ${String(bookmark)}`);
      session = d1.withSession(bookmark ?? constraint ?? sessionConstraint);
    }
    return session;
  };

  const setSessionBookmarkCookie = (response: Response) => {
    if (!session) return;
    const bookmark = session.getBookmark();
    if (!bookmark) return;
    // https://github.com/cloudflare/cloudflare-docs/blob/81edf345c23d367e744f4adb1c45b1e19a693cfc/src/content/docs/d1/best-practices/read-replication.mdx
    response.headers.append(
      "Set-Cookie",
      `${BOOKMARK_COOKIE_NAME}=${bookmark}; Path=/; HttpOnly; SameSite=Strict; Secure`,
    );
  };

  return {
    setSessionContraint,
    getSession,
    setSessionBookmarkCookie,
  };
}
