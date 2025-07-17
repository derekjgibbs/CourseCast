import "./globals.css";

import type { ReactNode } from "react";
import type { Viewport } from "next";

import Link from "next/link";

import { Inter } from "next/font/google";

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
  return (
    <html lang="en">
      <body className={cn(inter.className, "flex min-h-dvh flex-col antialiased")}>
        <header
          className="bg-background sticky top-0 z-1 border-b border-gray-200 shadow-sm"
          role="banner"
        >
          <nav
            role="navigation"
            aria-label="Main navigation"
            className="mx-auto max-w-7xl px-6 py-4"
          >
            <Link
              href="/"
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent"
            >
              CourseCast
            </Link>
          </nav>
        </header>
        {children}
        <footer className="mt-12 border-t border-gray-200 bg-white" role="contentinfo">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="text-center text-sm text-gray-500">
              <p>&copy; 2025 CourseCast. Course optimization using Monte Carlo simulation.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
