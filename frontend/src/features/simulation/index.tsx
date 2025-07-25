"use client";

import { Bookmark, Heart, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useQuery } from "convex/react";

import type { UserScenarioDoc, UserScenarioId } from "@/convex/types";
import { api } from "@/convex/_generated/api";

import type { Course } from "@/lib/schema/course";

import {
  FetchedCoursesProvider,
  useFetchCourses,
  useFetchedCourses,
} from "@/hooks/use-fetch-courses";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { ConstraintsTable } from "./table/constraints";
import { FixedCoursesTable } from "./table/fixed-courses";
import { CourseUtilitiesTable } from "./table/course-utilities";

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
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-6 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Simulation Parameters</h1>
        <p className="text-gray-600">
          Review the configuration parameters for your course registration simulation
        </p>
      </div>
      <Accordion
        type="multiple"
        defaultValue={["constraints", "fixed-courses", "utilities"]}
        className="w-full"
      >
        <AccordionItem value="constraints">
          <AccordionTrigger>
            <span className="text-lg font-semibold">Scenario Constraints</span>
          </AccordionTrigger>
          <AccordionContent>
            <ConstraintsTable
              name={scenario.name}
              tokenBudget={scenario.token_budget}
              minCredits={scenario.min_credits}
              maxCredits={scenario.max_credits}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="fixed-courses">
          <AccordionTrigger>
            <div className="inline-flex items-center gap-2">
              <Bookmark className="size-5 fill-blue-800 text-blue-800" />
              <span className="text-lg font-semibold">Fixed Courses</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <FixedCoursesTable courses={fixedCourses} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="utilities">
          <AccordionTrigger>
            <div className="inline-flex items-center gap-2">
              <Heart className="size-5 fill-red-800 text-red-800" />
              <span className="text-lg font-semibold">Course Utilities</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <CourseUtilitiesTable coursesWithUtilities={coursesWithUtilities} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
