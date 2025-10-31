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

  const setSessionContraint = (constraint: D1SessionConstraint) => {
    sessionConstraint = constraint;
    if (session) {
      console.warn("WARNING: D1 session constraint changed after session was created");
    }
  };

  const getBookmarkFromRequest = (): D1SessionBookmark | undefined => {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) return undefined;
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    const bookmarkCookie = cookies.find((c) => c.startsWith("d1-bookmark="));
    if (!bookmarkCookie) return undefined;
    return bookmarkCookie.split("=")[1];
  };

  const getSession = (constraint?: D1SessionConstraint): D1DatabaseSession => {
    if (!session) {
      const bookmark = getBookmarkFromRequest();
      session = d1.withSession(bookmark ?? constraint ?? sessionConstraint);
    }
    return session;
  };

  const setSessionBookmarkCookie = (response: Response) => {
    if (!session) return;
    const bookmark = session.getBookmark();
    if (!bookmark) return;
    response.headers.append(
      "Set-Cookie",
      `d1-bookmark=${bookmark}; Path=/; HttpOnly; SameSite=Lax`,
    );
  };

  return {
    setSessionContraint,
    getSession,
    setSessionBookmarkCookie,
  };
}
