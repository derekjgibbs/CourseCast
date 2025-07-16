"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { type ReactNode, useState } from "react";

import { CONVEX_URL } from "@/lib/env/convex";

interface LiveConvexProviderProps {
  children: ReactNode;
}

export function LiveConvexProvider({ children }: LiveConvexProviderProps) {
  const [convex] = useState(() => new ConvexReactClient(CONVEX_URL));
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
