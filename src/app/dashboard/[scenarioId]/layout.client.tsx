"use client";

import { Loader2 } from "lucide-react";
import { type ReactNode, useEffect } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";

import { api } from "@/convex/_generated/api";
import { FetchedCoursesProvider, useFetchCourses } from "@/hooks/use-fetch-courses";
import { ScenarioProvider } from "@/features/scenario/get";
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
    <FetchedCoursesProviderWrapper>
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
  return null;
}

interface FetchedCoursesProviderWrapperProps {
  children: ReactNode;
}

function FetchedCoursesProviderWrapper({ children }: FetchedCoursesProviderWrapperProps) {
  const { data } = useFetchCourses();
  return typeof data === "undefined" ? (
    <LoadingSpinner>Fetching courses</LoadingSpinner>
  ) : (
    <FetchedCoursesProvider courses={data}>{children}</FetchedCoursesProvider>
  );
}
