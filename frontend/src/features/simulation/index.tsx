"use client";

import { Loader2 } from "lucide-react";
import { useQuery } from "convex/react";

import type { UserScenarioId } from "@/convex/types";
import { api } from "@/convex/_generated/api";

import type { Course } from "@/lib/schema/course";

import { useFetchCourses } from "@/hooks/use-fetch-courses";

import { ConstraintsTable } from "./table/constraints";
import { FixedCoursesTable } from "./table/fixed-courses";
import { CourseUtilitiesTable } from "./table/course-utilities";

interface LiveSimulationProps {
  scenarioId: UserScenarioId;
}

export function LiveSimulation({ scenarioId }: LiveSimulationProps) {
  const scenario = useQuery(api.scenarios.get, { id: scenarioId });
  const { data: courseMap } = useFetchCourses();

  if (typeof scenario === "undefined" || typeof courseMap === "undefined") {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-2">
        <Loader2 className="size-16 animate-spin" />
        <span className="text-sm font-medium text-gray-600">Loading simulation parameters</span>
      </div>
    );
  }

  const fixedCourses = scenario.fixed_courses
    .map(courseId => courseMap.get(courseId))
    .filter((course): course is Course => typeof course !== "undefined");

  const coursesWithUtilities = Object.entries(scenario.utilities)
    .map(([courseId, utility]) => {
      const course = courseMap.get(courseId);
      return typeof course !== "undefined" ? { ...course, utility } : undefined;
    })
    .filter((course): course is Course & { utility: bigint } => typeof course !== "undefined");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-6 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Simulation Parameters</h1>
        <p className="text-gray-600">
          Review the configuration parameters for your course registration simulation
        </p>
      </div>
      <ConstraintsTable
        name={scenario.name}
        tokenBudget={scenario.token_budget}
        minCredits={scenario.min_credits}
        maxCredits={scenario.max_credits}
      />
      <FixedCoursesTable courses={fixedCourses} />
      <CourseUtilitiesTable coursesWithUtilities={coursesWithUtilities} />
    </div>
  );
}
