import { type Constraint, solve } from "yalps";

import type { Course } from "@/lib/schema/course";

import type { CourseInput, OptimizationRequest, OptimizationResponse } from "./schema";

// String literal unions for type safety
type PartOfTerm = "Q1" | "Q2" | "Q3" | "Q4" | "Modular" | "Full";
type DaysCode = "M" | "T" | "W" | "R" | "F" | "S" | "U" | "MW" | "TR" | "FS" | "TBA";

// Bespoke error classes
class UnknownTermError extends Error {
  constructor(term: string) {
    super(`Unknown part_of_term: ${term}`);
    this.name = "UnknownTermError";
  }
}

class UnknownDaysCodeError extends Error {
  constructor(daysCode: string) {
    super(`Unknown days_code: ${daysCode}`);
    this.name = "UnknownDaysCodeError";
  }
}

class MissingCourseVariablesError extends Error {
  constructor(courseId: string) {
    super(`Variables object not found for course: ${courseId}`);
    this.name = "MissingCourseVariablesError";
  }
}

function mapTermToQuarters(term: PartOfTerm | (string & {})): string[] {
  switch (term) {
    case "Q1":
    case "Q2":
    case "Q3":
    case "Q4":
      return [term];
    case "Modular":
      return ["Modular"];
    case "Full":
      // Full term spans all quarters
      return ["Q1", "Q2", "Q3", "Q4"];
    default:
      throw new UnknownTermError(term);
  }
}

function mapDaysToArray(daysCode: DaysCode | (string & {})) {
  switch (daysCode) {
    case "M":
    case "T":
    case "W":
    case "R":
    case "F":
    case "S":
      return [daysCode];
    case "MW":
      return ["M", "W"];
    case "TR":
      return ["T", "R"];
    case "FS":
      return ["F", "S"];
    case "TBA":
      // TODO: Should we add a TBA constraint?
      return [];
    default:
      throw new UnknownDaysCodeError(daysCode);
  }
}

/**
 * Generate time conflict identifiers for courses
 */
function generateTimeConflicts(
  course: Pick<Course, "part_of_term" | "days_code" | "start_category">,
): string[] {
  const quarters = mapTermToQuarters(course.part_of_term);
  const days = mapDaysToArray(course.days_code);
  const timePeriod = course.start_category;

  // Generate all combinations like 'ct_q1MA', 'ct_q1WA'
  const conflicts: string[] = [];
  for (const quarter of quarters)
    for (const day of days) conflicts.push(`ct_${quarter}${day}${timePeriod}`);
  return conflicts;
}

/** Extract course ID from forecast_id for duplicate checking */
function extractCourseId(forecast_id: string): string {
  // Assume forecast_id format like "DEPT1234SEC" -> extract "DEPT1234"
  return forecast_id.substring(0, 8);
}

export function optimize(request: OptimizationRequest) {
  // Calculate prices for all courses
  const coursesWithPrices = request.courses.map(course => ({
    ...course,
    utility: request.utilities.get(course.forecast_id) ?? 0,
  }));

  // Generate time conflicts and course duplicates constraint data
  const timeConflictMap = new Map<string, CourseInput[]>();
  const courseIdMap = new Map<string, CourseInput[]>();

  // Constraints map
  const constraints = new Map<string, Constraint>([
    ["budget", { max: request.budget }],
    ["max_credits", { max: request.max_credits }],
    ["min_credits", { min: request.min_credits }],
  ]);

  // Variables map
  const variables = new Map<string, Map<string, number>>();
  for (const course of coursesWithPrices) {
    const courseVariables = new Map([
      // Objective Function
      ["weighted_credit_utility", course.utility * course.credits],
      ["budget", course.truncated_price],
      ["min_credits", course.credits],
      ["max_credits", course.credits],
    ]);
    variables.set(course.forecast_id, courseVariables);

    // Collect time conflicts
    const conflicts = generateTimeConflicts(course);
    for (const conflict of conflicts) {
      // Get or initialize conflict courses list
      let conflictCourses = timeConflictMap.get(conflict);
      if (typeof conflictCourses === "undefined") {
        conflictCourses = [];
        timeConflictMap.set(conflict, conflictCourses);
        constraints.set(conflict, { max: 1 }); // At most one course per time slot
      }
      conflictCourses.push(course);
      courseVariables.set(conflict, 1);
    }

    // Get or initialize course sections list
    const courseId = extractCourseId(course.forecast_id);
    let courseList = courseIdMap.get(courseId);
    if (typeof courseList === "undefined") {
      courseList = [];
      courseIdMap.set(courseId, courseList);
      // At most one section per course
      constraints.set(`course_${courseId}`, { max: 1 });
    }
    courseList.push(course);
    courseVariables.set(`course_${courseId}`, 1);
  }

  // Add fixed course constraints
  for (const fixedCourseId of request.fixed_courses) {
    const fixedCourseVariables = variables.get(fixedCourseId);
    if (typeof fixedCourseVariables === "undefined") continue;
    constraints.set(`fixed_${fixedCourseId}`, { equal: 1 });
    fixedCourseVariables.set(`fixed_${fixedCourseId}`, 1);
  }

  // Solve the YALPS model
  const solution = solve({
    direction: "maximize",
    objective: "utility_credits",
    constraints,
    variables,
    binaries: true,
  });

  // Process results
  const selectedCourses: string[] = [];
  let totalCost = 0;
  let totalCredits = 0;
  let totalUtility = 0;

  for (const course of coursesWithPrices) {
    const value = solution.variables.find(([name]) => name === course.forecast_id)?.[1] ?? 0;
    if (value === 1) {
      totalCost += course.truncated_price;
      totalCredits += course.credits;
      totalUtility += course.utility;
      selectedCourses.push(course.forecast_id);
    }
  }

  return {
    selectedCourses,
    totalCost,
    totalCredits,
    totalUtility,
    optimizationStatus: solution.status,
  } satisfies OptimizationResponse;
}
