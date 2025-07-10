import Head from 'next/head';
import { Inter } from 'next/font/google';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import ConstraintSetupPage from '../components/constraints/ConstraintSetupPage';

const inter = Inter({ subsets: ['latin'] });

export default function ConstraintManagement() {
  const users = useQuery(api.users.list);
  
  // Check if we have any users, if not show a setup screen
  if (users !== undefined && users.length === 0) {
    return (
      <>
        <Head>
          <title>Constraint Management - CourseCast</title>
          <meta name="description" content="Configure course selection constraints and optimization parameters" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className={`${inter.className} min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100`}>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl shadow-lg border border-white border-opacity-30 p-8 max-w-md">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome to CourseCast</h1>
              <p className="text-gray-600 mb-6">
                No users found in the system. Please set up your Convex database with sample data or create a user account.
              </p>
              <div className="space-y-3 text-sm text-gray-500">
                <p>To get started:</p>
                <ol className="list-decimal list-inside space-y-1 text-left">
                  <li>Run <code className="bg-gray-100 px-2 py-1 rounded">npx convex dev</code></li>
                  <li>Create sample users in your Convex dashboard</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
              <div className="mt-6">
                <a 
                  href="/" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Back to Course Catalog
                </a>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }
  
  // Show loading if users are still loading
  if (users === undefined) {
    return (
      <>
        <Head>
          <title>Constraint Management - CourseCast</title>
          <meta name="description" content="Configure course selection constraints and optimization parameters" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className={`${inter.className} min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100`}>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading user data...</p>
            </div>
          </div>
        </main>
      </>
    );
  }
  
  const currentUser = users[0]; // Get first user

  return (
    <>
      <Head>
        <title>Constraint Management - CourseCast</title>
        <meta name="description" content="Configure course selection constraints and optimization parameters" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="CourseCast" />
        <meta property="og:title" content="Constraint Management - CourseCast" />
        <meta property="og:description" content="Configure course selection constraints and optimization parameters" />
        <meta property="og:type" content="website" />
      </Head>
      <main className={`${inter.className}`}>
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
                  <span className="font-medium text-gray-700">{currentUser.name}</span>
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
            <ConstraintSetupPage userId={currentUser._id} />
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
    </>
  );
}