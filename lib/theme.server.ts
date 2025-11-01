import { createCookieSessionStorage } from "react-router";
import { createThemeSessionResolver } from "remix-themes";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__remix-themes",
    path: "/",
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    secrets: ["r3m1x-th3m3s"],
  },
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage);
