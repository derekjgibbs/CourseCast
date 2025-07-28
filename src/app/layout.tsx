import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import type { Viewport } from "next";

import { cn } from "@/lib/utils";
import { LiveConvexProvider } from "@/features/live-convex-provider";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

interface LayoutProps {
  children: ReactNode;
}

const inter = Inter({ subsets: ["latin"] });
export default function Layout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "min-h-dvh max-w-dvw antialiased")}>
        <LiveConvexProvider>{children}</LiveConvexProvider>
        <Toaster richColors closeButton position="bottom-left" theme="light" />
      </body>
    </html>
  );
}
