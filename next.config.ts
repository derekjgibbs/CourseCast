import type { NextConfig } from "next";

export default {
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.parquet": {
        loaders: [],
        as: "asset",
      },
    },
  },
} satisfies NextConfig;
