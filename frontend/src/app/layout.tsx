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
export default function Layout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "flex min-h-dvh flex-col antialiased")}>
        <header
          className="bg-background sticky top-0 z-1 border-b border-gray-200 shadow-sm"
          role="banner"
        >
          <nav
            className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
            role="navigation"
            aria-label="Main navigation"
          >
            <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent">
              CourseCast
            </h1>
          </nav>
        </header>
        <main className="grow">
          <LiveConvexProvider>{children}</LiveConvexProvider>
        </main>
        <footer className="mt-12 border-t border-gray-200 bg-white" role="contentinfo">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="text-center text-sm text-gray-500">
              <p>&copy; 2024 CourseCast. Course optimization using Monte Carlo simulation.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
