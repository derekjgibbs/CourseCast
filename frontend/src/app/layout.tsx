import "./globals.css";

import type { ReactNode } from "react";
import type { Viewport } from "next";

import { Inter } from "next/font/google";

import { cn } from "@/lib/utils";

import { LiveConvexProvider } from "@/features/live-convex-provider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

interface LayoutProps {
  children: ReactNode;
}

const inter = Inter({ subsets: ["latin"] });
const classes = cn(inter.className, "antialiased");
export default function Layout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body className={classes}>
        <LiveConvexProvider>{children}</LiveConvexProvider>
      </body>
    </html>
  );
}
