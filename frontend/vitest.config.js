import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["convex/**/*.{test,spec}.{js,ts}", "src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
    exclude: ["node_modules", "dist", ".next"],
    setupFiles: ["./src/test/setup.ts"],
  },
});
