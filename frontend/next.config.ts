import type { NextConfig } from 'next';

export default {
  output: 'standalone',
  experimental: { reactCompiler: true },
} satisfies NextConfig;
