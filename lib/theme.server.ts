import * as ReactRouter from "react-router";
import * as RemixThemes from "remix-themes";

const sessionStorage = ReactRouter.createCookieSessionStorage({
  cookie: {
    name: "__remix-themes",
    path: "/",
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    secrets: ["r3m1x-th3m3s"],
  },
});

export const themeSessionResolver =
  RemixThemes.createThemeSessionResolver(sessionStorage);
