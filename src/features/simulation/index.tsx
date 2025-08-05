"use client";

import { Bookmark, Heart, Settings } from "lucide-react";
import { useMemo } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Course } from "@/lib/schema/course";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetchedCourses } from "@/hooks/use-fetch-courses";
import type { UserScenarioDoc } from "@/convex/types";

import { SimulationSummary } from "./simulation";
import { useSpawnOptimizerPool } from "./query";

import { ConstraintsTable } from "./table/constraints";
import { CourseUtilitiesTable } from "./table/course-utilities";
import { FixedCoursesTable } from "./table/fixed-courses";

interface CourseWithUtility extends Course {
  utility: number;
}

interface SimulationProps {
  scenario: Pick<
    UserScenarioDoc,
    "name" | "token_budget" | "max_credits" | "fixed_courses" | "utilities"
  >;
}

export function LiveSimulation({ scenario }: SimulationProps) {
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
        if (typeof course !== "undefined") acc.push({ ...course, utility: Number(utility) });
        return acc;
      }, [] as CourseWithUtility[]),
    [scenario.utilities, courseMap],
  );

  const eligibleCourses = useMemo(
    () =>
      [...Object.keys(scenario.utilities), ...scenario.fixed_courses].reduce((eligible, curr) => {
        const course = courseMap.get(curr);
        if (typeof course !== "undefined") eligible.set(curr, course);
        return eligible;
      }, new Map<string, Course>()),
    [scenario.utilities, scenario.fixed_courses, courseMap],
  );

  const utilities = useMemo(() => {
    return new Map(
      Object.entries(scenario.utilities).map(([courseId, utility]) => [courseId, Number(utility)]),
    );
  }, [scenario.utilities]);

  const simulation = useSpawnOptimizerPool({
    budget: Number(scenario.token_budget),
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
      {simulation.isPending ? (
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
      ) : simulation.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unexpected error encountered</AlertTitle>
          <AlertDescription>{simulation.error.message}</AlertDescription>
        </Alert>
      ) : (
        <SimulationSummary responses={simulation.data} />
      )}
    </div>
  );
}
