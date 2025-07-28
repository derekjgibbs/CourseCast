"use client";

import { Bookmark, Heart, Loader2, Settings } from "lucide-react";
import { useMemo } from "react";
import { useQuery } from "convex/react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { api } from "@/convex/_generated/api";
import type { Course } from "@/lib/schema/course";
import {
  FetchedCoursesProvider,
  useFetchCourses,
  useFetchedCourses,
} from "@/hooks/use-fetch-courses";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserScenarioDoc, UserScenarioId } from "@/convex/types";

import { SimulationSummary } from "./simulation";
import { useSpawnOptimizerPool } from "./query";

import { ConstraintsTable } from "./table/constraints";
import { CourseUtilitiesTable } from "./table/course-utilities";
import { FixedCoursesTable } from "./table/fixed-courses";

interface LiveSimulationProps {
  scenarioId: UserScenarioId;
}

export function LiveSimulation({ scenarioId }: LiveSimulationProps) {
  const { data } = useFetchCourses();
  const scenario = useQuery(api.scenarios.get, { id: scenarioId });
  return typeof data === "undefined" || typeof scenario === "undefined" ? (
    <div className="flex h-full flex-col items-center justify-center space-y-2">
      <Loader2 className="size-16 animate-spin" />
      <span className="text-sm font-medium text-gray-600">Loading scenario</span>
    </div>
  ) : (
    <FetchedCoursesProvider courses={data}>
      <SimulationContent scenario={scenario} />
    </FetchedCoursesProvider>
  );
}

interface CourseWithUtility extends Course {
  utility: bigint;
}

interface SimulationProps {
  scenario: Pick<
    UserScenarioDoc,
    "name" | "token_budget" | "min_credits" | "max_credits" | "fixed_courses" | "utilities"
  >;
}

function SimulationContent({ scenario }: SimulationProps) {
  const courseMap = useFetchedCourses();

  const fixedCourses = useMemo(
    () =>
      scenario.fixed_courses.reduce((acc, courseId) => {
        const course = courseMap.get(courseId);
        if (typeof course !== "undefined") acc.push(course);
        return acc;
      }, [] as Course[]),
    [scenario.fixed_courses, courseMap],
  );

  const coursesWithUtilities = useMemo(
    () =>
      Object.entries(scenario.utilities).reduce((acc, [courseId, utility]) => {
        const course = courseMap.get(courseId);
        if (typeof course !== "undefined") acc.push({ ...course, utility });
        return acc;
      }, [] as CourseWithUtility[]),
    [scenario.utilities, courseMap],
  );

  const eligibleCourses = useMemo(() => {
    const eligible = new Map<string, Course>();

    // Include courses with positive utility
    for (const [courseId, utility] of Object.entries(scenario.utilities)) {
      if (Number(utility) > 0) {
        const course = courseMap.get(courseId);
        if (typeof course !== "undefined") eligible.set(courseId, course);
      }
    }

    // Include fixed courses (regardless of utility)
    for (const courseId of scenario.fixed_courses) {
      const course = courseMap.get(courseId);
      if (typeof course !== "undefined") eligible.set(courseId, course);
    }

    return eligible;
  }, [scenario.utilities, scenario.fixed_courses, courseMap]);

  const utilities = useMemo(() => {
    return new Map(
      Object.entries(scenario.utilities).map(([courseId, utility]) => [courseId, Number(utility)]),
    );
  }, [scenario.utilities]);

  const simulation = useSpawnOptimizerPool({
    budget: Number(scenario.token_budget),
    min_credits: scenario.min_credits,
    max_credits: scenario.max_credits,
    courses: eligibleCourses,
    fixed_courses: scenario.fixed_courses,
    utilities,
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-6 py-8">
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="constraints" className="border-b-0">
          <AccordionTrigger>
            <div className="inline-flex items-center gap-2">
              <Settings className="size-5 fill-gray-200 text-gray-500" />
              <span className="text-lg font-semibold">Scenario Constraints</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="rounded-md bg-gray-100 p-4">
            <ConstraintsTable
              name={scenario.name}
              tokenBudget={scenario.token_budget}
              minCredits={scenario.min_credits}
              maxCredits={scenario.max_credits}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="fixed-courses" className="border-b-0">
          <AccordionTrigger>
            <div className="inline-flex items-center gap-2">
              <Bookmark className="size-5 fill-blue-800 text-blue-800" />
              <span className="text-lg font-semibold">Fixed Courses</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="rounded-md bg-blue-50 p-4">
            <FixedCoursesTable courses={fixedCourses} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="utilities" className="border-b-0">
          <AccordionTrigger>
            <div className="inline-flex items-center gap-2">
              <Heart className="size-5 fill-red-800 text-red-800" />
              <span className="text-lg font-semibold">Course Utilities</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="rounded-md bg-red-50 p-4">
            <CourseUtilitiesTable coursesWithUtilities={coursesWithUtilities} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      {typeof simulation.data === "undefined" ? (
        <div className="space-y-6 opacity-60 transition-opacity duration-1000">
          <div className="space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-5/6" />
            </div>
          </div>
        </div>
      ) : (
        <SimulationSummary responses={simulation.data} />
      )}
    </div>
  );
}
