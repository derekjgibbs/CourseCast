import type { NextConfig } from 'next';

export default {
  output: 'standalone',
  experimental: { authInterrupts: true, reactCompiler: true },
} satisfies NextConfig;
