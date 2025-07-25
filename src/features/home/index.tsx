"use client";

import Link from "next/link";
import { AuthLoading, Authenticated, Unauthenticated } from "convex/react";
import { Loader2 } from "lucide-react";

import { AuthenticationForm } from "./form";

export function HomeMain() {
  return (
    <main className="flex grow flex-col">
      <AuthLoading>
        <div className="flex grow items-center justify-center">
          <Loader2 className="size-32 animate-spin text-gray-400" />
        </div>
      </AuthLoading>
      <Unauthenticated>
        <div className="flex grow items-center justify-center px-6 py-8">
          <div className="w-full max-w-7xl">
            <AuthenticationForm />
          </div>
        </div>
      </Unauthenticated>
      <Authenticated>
        <div className="flex grow items-center justify-center px-6 py-8">
          <div className="w-full max-w-7xl">
            <div className="space-y-6 text-center">
              <h1 className="text-4xl font-bold text-gray-900">Welcome to CourseCast</h1>
              <p className="mx-auto max-w-2xl text-xl text-gray-600">
                Optimize your course selection using Monte Carlo simulation. Get started by visiting
                your dashboard.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </Authenticated>
    </main>
  );
}
