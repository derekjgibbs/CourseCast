"use client";

import { Loader2 } from "lucide-react";
import { type ReactNode, useEffect } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";

import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FetchedCoursesProvider, useFetchCourses } from "@/hooks/use-fetch-courses";
import { ScenarioProvider } from "@/features/scenario/get";
import { Skeleton } from "@/components/ui/skeleton";
import { type SupportedTerm, toSupportedTerm } from "@/lib/term";
import type { UserScenarioId } from "@/convex/types";

interface ScenarioProviderWrapperProps {
  scenarioId: UserScenarioId;
  children: ReactNode;
}

export function ScenarioProviderWrapper({ scenarioId, children }: ScenarioProviderWrapperProps) {
  const scenario = useQuery(api.scenarios.get, { id: scenarioId });
  return typeof scenario === "undefined" ? (
    <LoadingSpinner>Fetching scenario</LoadingSpinner>
  ) : scenario === null ? (
    <RedirectToDashboardHome />
  ) : (
    <FetchedCoursesProviderWrapper term={toSupportedTerm(scenario.term)}>
      <ScenarioProvider scenario={scenario}>{children}</ScenarioProvider>
    </FetchedCoursesProviderWrapper>
  );
}

interface LoadingSpinnerProps {
  children: ReactNode;
}

function LoadingSpinner({ children }: LoadingSpinnerProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-2">
      <Loader2 className="size-16 animate-spin text-gray-400" />
      <span className="text-sm font-medium text-gray-600">{children}</span>
    </div>
  );
}

function RedirectToDashboardHome() {
  const router = useRouter();
  useEffect(() => router.push("/dashboard"), [router]);
  return (
    <div className="relative mx-auto w-full max-w-7xl grow justify-center space-y-8 px-6 py-8">
      <div className="flex items-center justify-between gap-6 rounded-lg border-0 bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600 px-6 py-4 text-white shadow-lg">
        <div className="grow">
          <Skeleton className="h-6 w-64 bg-blue-200" />
          <Skeleton className="mt-1 h-4 w-96 bg-blue-200" />
        </div>
        <Skeleton className="h-12 w-32 bg-white/20" />
      </div>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-40" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-80" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="grow space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-28" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-72" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-4 pb-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 py-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-28" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-64" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 py-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-32" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-80" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-5 gap-4 pb-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="grid grid-cols-5 gap-4 py-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface FetchedCoursesProviderWrapperProps {
  term: SupportedTerm;
  children: ReactNode;
}

function FetchedCoursesProviderWrapper({ term, children }: FetchedCoursesProviderWrapperProps) {
  const { isPending, isError, data, error } = useFetchCourses(term);
  return isPending ? (
    <LoadingSpinner>Fetching courses</LoadingSpinner>
  ) : isError ? (
    <div className="flex h-full flex-col items-center justify-center space-y-2">
      <p className="text-sm font-medium text-red-600">Error fetching courses</p>
      <p className="text-sm text-red-500">{error.message}</p>
    </div>
  ) : (
    <FetchedCoursesProvider courses={data}>{children}</FetchedCoursesProvider>
  );
}
