import type { NextConfig } from "next";

export default {
  experimental: { reactCompiler: true },
  webpack(config) {
    config.module.rules.push({
      test: /\.parquet$/iu,
      type: "asset/resource",
    });
    return config;
  },
} satisfies NextConfig;
