import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    {
      // Strip "use client" directives to avoid sourcemap warnings in React Router builds.
      name: "strip-use-client",
      transform(code, _id) {
        if (code.startsWith('"use client";\n')) {
          return code.slice(14);
        }
        return null;
      },
    },
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
});
