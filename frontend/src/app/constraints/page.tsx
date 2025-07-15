import type { Metadata } from 'next';

import { useQuery } from 'convex/react';

import ConstraintSetupPage from '@/components/constraints/ConstraintSetupPage';
import { api } from '@/convex/_generated/api';

export const metadata: Metadata = {
  title: "Constraint Management - CourseCast",
  description: "Configure course selection constraints and optimization parameters",
};

export default function Page() {
  const [user] = useQuery(api.users.list) ?? [];
  return typeof user === 'undefined' ? (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading user data...</p>
        </div>
      </div>
    </main>
  ) : (
    <main>
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200" role="banner">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between" role="navigation" aria-label="Main navigation">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                CourseCast
              </h1>
              <span className="text-gray-400">|</span>
              <h2 className="text-lg font-medium text-gray-700">Constraint Management</h2>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav aria-label="Breadcrumb" className="flex text-sm text-gray-500">
            <a href="/" className="hover:text-blue-600 transition-colors duration-200">Home</a>
            <span className="mx-2">/</span>
            <span className="text-gray-700 font-medium" aria-current="page">Constraint Management</span>
          </nav>
        </div>
        {/* Page Content */}
        <div className="pb-12">
          <ConstraintSetupPage userId={user._id} />
        </div>
      </div>
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12" role="contentinfo">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2024 CourseCast. Course optimization using Monte Carlo simulation.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
