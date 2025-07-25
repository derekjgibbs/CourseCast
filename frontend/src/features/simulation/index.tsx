"use client";

import { Loader2 } from "lucide-react";
import { useQuery } from "convex/react";

import type { UserScenarioDoc, UserScenarioId } from "@/convex/types";
import { api } from "@/convex/_generated/api";

import type { Course } from "@/lib/schema/course";

import {
  FetchedCoursesProvider,
  useFetchCourses,
  useFetchedCourses,
} from "@/hooks/use-fetch-courses";

import { ConstraintsTable } from "./table/constraints";
import { FixedCoursesTable } from "./table/fixed-courses";
import { CourseUtilitiesTable } from "./table/course-utilities";

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

  const fixedCourses = scenario.fixed_courses.reduce((acc, courseId) => {
    const course = courseMap.get(courseId);
    if (typeof course !== "undefined") acc.push(course);
    return acc;
  }, [] as Course[]);

  const coursesWithUtilities = Object.entries(scenario.utilities).reduce(
    (acc, [courseId, utility]) => {
      const course = courseMap.get(courseId);
      if (typeof course !== "undefined") acc.push({ ...course, utility });
      return acc;
    },
    [] as CourseWithUtility[],
  );

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

interface LiveSimulationProps {
  scenarioId: UserScenarioId;
}

export function LiveSimulation({ scenarioId }: LiveSimulationProps) {
  const { data } = useFetchCourses();
  const scenario = useQuery(api.scenarios.get, { id: scenarioId });
  return typeof data === "undefined" || typeof scenario === "undefined" ? (
    <div className="flex h-full flex-col items-center justify-center space-y-2">
      <Loader2 className="size-16 animate-spin" />
      <span className="text-sm font-medium text-gray-600">Loading courses</span>
    </div>
  ) : (
    <FetchedCoursesProvider courses={data}>
      <SimulationContent scenario={scenario} />
    </FetchedCoursesProvider>
  );
}
