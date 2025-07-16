import "./globals.css";

import type { Viewport } from "next";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Inter } from "next/font/google";
import { type ReactNode, useState } from "react";

import { CONVEX_URL } from "@/env/convex";
import { cn } from "@/lib/utils";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

interface LayoutProps {
  children: ReactNode;
}

const inter = Inter({ subsets: ["latin"] });
export default function Layout({ children }: LayoutProps) {
  const [convex] = useState(() => new ConvexReactClient(CONVEX_URL));
  return (
    <html lang="en">
      <body className={cn(inter.className, "dark antialiased")}>
        <ConvexProvider client={convex}>{children}</ConvexProvider>
      </body>
    </html>
  );
}
