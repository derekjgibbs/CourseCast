import type { ReactNode } from "react";

import { LiveConvexProvider } from "@/features/live-convex-provider";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return <LiveConvexProvider>{children}</LiveConvexProvider>;
}
