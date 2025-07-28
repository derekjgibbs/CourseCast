import Link from "next/link";
import type { Metadata } from "next";

import { HomeMain } from "@/features/home";

export const metadata: Metadata = {
  title: "CourseCast",
  description: "Course optimization using Monte Carlo simulation.",
};

export default function Page() {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-white/40 shadow-sm backdrop-blur-md">
        <nav className="mx-auto max-w-7xl px-6 py-4">
          <Link
            href="/"
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent transition-all duration-300 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700"
          >
            CourseCast
          </Link>
        </nav>
      </header>
      <HomeMain />
      <footer className="mt-12 border-t border-white/10 bg-white/30 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-center text-sm text-gray-600">
            &copy; 2025 CourseCast. Course optimization using Monte Carlo simulation.
          </p>
        </div>
      </footer>
    </div>
  );
}
