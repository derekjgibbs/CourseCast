import assert from "node:assert/strict";

assert(process.env.NEXT_PUBLIC_CONVEX_URL, "NEXT_PUBLIC_CONVEX_URL must be set");
export const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
