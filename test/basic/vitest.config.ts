import { defineWorkersProject } from "@cloudflare/vitest-pool-workers/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineWorkersProject({
  plugins: [tsconfigPaths()],
  test: {
    include: ["*.test.ts"],
    poolOptions: {
      workers: {
        main: "../test-worker.ts",
        wrangler: {
          configPath: "../../wrangler.jsonc",
        },
      },
    },
  },
});
