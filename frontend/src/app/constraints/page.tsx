import type { Metadata } from "next";

import { useQuery } from "convex/react";

import ConstraintSetupPage from "@/components/constraints/ConstraintSetupPage";
import { api } from "@/convex/_generated/api";

export const metadata: Metadata = {
  title: "Constraint Management - CourseCast",
  description: "Configure course selection constraints and optimization parameters",
};

export default function Page() {
  const [user] = useQuery(api.users.list) ?? [];
  return typeof user === "undefined" ? (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-lg text-gray-600">Loading user data...</p>
        </div>
      </div>
    </main>
  ) : (
    <main>
      {/* Navigation Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm" role="banner">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <nav
            className="flex items-center justify-between"
            role="navigation"
            aria-label="Main navigation"
          >
            <div className="flex items-center space-x-4">
              <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent">
                CourseCast
              </h1>
              <span className="text-gray-400">|</span>
              <h2 className="text-lg font-medium text-gray-700">Constraint Management</h2>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="font-medium text-gray-600 transition-colors duration-200 hover:text-blue-600"
                aria-label="Go to Course Catalog"
              >
                Course Catalog
              </a>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>User:</span>
                <span className="font-medium text-gray-700">{user.name}</span>
              </div>
            </div>
          </nav>
        </div>
      </header>
      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
        {/* Breadcrumb Navigation */}
        <div className="mx-auto max-w-7xl px-6 py-4">
          <nav aria-label="Breadcrumb" className="flex text-sm text-gray-500">
            <a href="/" className="transition-colors duration-200 hover:text-blue-600">
              Home
            </a>
            <span className="mx-2">/</span>
            <span className="font-medium text-gray-700" aria-current="page">
              Constraint Management
            </span>
          </nav>
        </div>
        {/* Page Content */}
        <div className="pb-12">
          <ConstraintSetupPage userId={user._id} />
        </div>
      </div>
      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white" role="contentinfo">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; 2024 CourseCast. Course optimization using Monte Carlo simulation.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
