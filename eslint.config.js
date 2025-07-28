import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import imsort from "@bastidood/eslint-plugin-imsort";
import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig } from "eslint/config";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });
export default defineConfig(
  { ignores: ["src/convex/_generated/**/*"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["src/**/*.{j,t}s{x,}"],
    extends: [imsort.configs.all],
    plugins: { "@bastidood/imsort": imsort },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
      ],
    },
  },
);
