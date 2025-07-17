import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";

import { LiveConvexProvider } from "@/features/live-convex-provider";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <LiveConvexProvider>{children}</LiveConvexProvider>
      <Toaster richColors theme="light" />
    </>
  );
}
