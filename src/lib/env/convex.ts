if (!process.env.NEXT_PUBLIC_CONVEX_URL) throw new Error("NEXT_PUBLIC_CONVEX_URL must be set");
export const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
