export type D1SessionMgr = ReturnType<typeof createD1SessionMgr>;

export function createD1SessionMgr(db: D1Database, request: Request) {
  let session: D1DatabaseSession | null = null;

  const getBookmarkFromRequest = (): D1SessionBookmark | undefined => {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) return undefined;
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    const bookmarkCookie = cookies.find((c) => c.startsWith("d1-bookmark="));
    if (!bookmarkCookie) return undefined;
    return bookmarkCookie.split("=")[1];
  };

  const getDb = (
    constraint: D1SessionConstraint = "first-unconstrained",
  ): D1DatabaseSession => {
    if (!session) {
      const bookmark = getBookmarkFromRequest();
      session = db.withSession(bookmark ?? constraint);
    }
    return session;
  };

  return {
    getDb,
  };
}
