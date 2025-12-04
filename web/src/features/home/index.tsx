"use client";

import Link from "next/link";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Loader2 } from "lucide-react";

import { AuthenticationForm } from "./form";

export function HomeMain() {
  return (
    <main className="flex grow flex-col">
      <AuthLoading>
        <div className="flex grow items-center justify-center">
          <div className="space-y-4 text-center">
            <Loader2 className="mx-auto size-32 animate-spin text-blue-600" />
            <p className="text-lg text-gray-600">Loading CourseCast...</p>
          </div>
        </div>
      </AuthLoading>
      <Unauthenticated>
        <div className="flex grow items-center justify-center px-6 py-8">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-5xl font-bold text-transparent">
                Welcome to CourseCast
              </h1>
              <p className="text-xl leading-relaxed text-gray-600">
                Get started with course optimization using Monte Carlo simulation.
              </p>
            </div>
            <AuthenticationForm />
          </div>
        </div>
      </Unauthenticated>
      <Authenticated>
        <div className="flex grow items-center justify-center px-6 py-8">
          <div className="w-full max-w-4xl space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-5xl font-bold text-transparent">
                Welcome to CourseCast
              </h1>
              <p className="mx-auto max-w-2xl text-xl leading-relaxed text-gray-600">
                Optimize your course selection using Monte Carlo simulation. Get started by visiting
                your dashboard.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex transform items-center rounded-xl border border-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </Authenticated>
    </main>
  );
}
