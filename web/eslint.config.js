import imsort from "@bastidood/eslint-plugin-imsort";
import nextTypeScript from "eslint-config-next/typescript";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier/flat";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  prettier,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    extends: [imsort.configs.all],
    plugins: { "@bastidood/imsort": imsort },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
      ],
      "import/no-anonymous-default-export": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "src/convex/_generated/**/*"]),
]);
