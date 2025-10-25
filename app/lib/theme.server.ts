import { env } from "cloudflare:workers";
import { createCookieSessionStorage } from "react-router";
import { createThemeSessionResolver } from "remix-themes";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__remix-themes",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: ["r3m1x-th3m3s"],
    ...(env.ENVIRONMENT === "production"
      ? {
          domain: "crrs.mw10013.workers.dev",
          secure: true,
        }
      : {}),
  },
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage);
