import { type Constraint, solve } from "yalps";

import type { Course } from "@/lib/schema/course";

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

interface OptimizationRequest {
  budget: number;
  max_credits: number;
  min_credits: number;
  utilities: Map<string, number>; // forecast_id -> utility
  fixed_courses: string[]; // forecast_id[]
  courses: Course[];
  seed: number;
}

interface OptimizedCourse {
  forecast_id: string;
  price: number;
  credits: number;
  utility: number;
  department: string;
  title: string;
}

/** Calculate final price using Monte Carlo simulation with z-scores */
function calculatePrice(course: Course, seed: number): number {
  // Use the seed to deterministically select from price fluctuations
  const fluctuationIndex =
    Math.abs(Number.parseInt(course.forecast_id, 36) + seed) %
    course.truncated_price_fluctuations.length;
  const zScore = course.truncated_price_fluctuations[fluctuationIndex] ?? 0;

  const price =
    course.truncated_price_prediction +
    course.price_prediction_residual_mean +
    zScore * course.price_prediction_residual_std_dev;

  // Clamp price between 0 and 4851 (same as backend)
  return Math.min(4851, Math.max(0, price));
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
function generateTimeConflicts(course: Course): string[] {
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
  console.log(request);

  // Calculate prices for all courses
  const coursesWithPrices = request.courses.map(course => ({
    ...course,
    price: calculatePrice(course, request.seed),
    utility: request.utilities.get(course.forecast_id) ?? 0,
  }));

  // Build variables map for YALPS
  const variables = new Map<string, Map<string, number>>();
  const constraints = new Map<string, Constraint>([
    ["budget", { max: request.budget }],
    ["max_credits", { max: request.max_credits }],
    ["min_credits", { min: request.min_credits }],
  ]);

  // Generate time conflicts and course duplicates constraint data
  const timeConflictMap = new Map<string, Course[]>();
  const courseIdMap = new Map<string, Course[]>();
  for (const course of coursesWithPrices) {
    // Add course variables
    const courseVariableMap = new Map<string, number>();
    courseVariableMap.set("utility_credits", course.utility * course.credits); // objective function
    courseVariableMap.set("budget", course.price); // budget constraint
    courseVariableMap.set("max_credits", course.credits); // max credits constraint
    courseVariableMap.set("min_credits", course.credits); // min credits constraint
    variables.set(course.forecast_id, courseVariableMap);

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

      // Assert that variables object exists for this course
      const courseVariables = variables.get(course.forecast_id);
      if (typeof courseVariables === "undefined")
        throw new MissingCourseVariablesError(course.forecast_id);
      courseVariables.set(conflict, 1);
    }

    // Collect course duplicates
    const courseId = extractCourseId(course.forecast_id);
    // Get or initialize course sections list
    let courseList = courseIdMap.get(courseId);
    if (typeof courseList === "undefined") {
      courseList = [];
      courseIdMap.set(courseId, courseList);
      // At most one section per course
      constraints.set(`course_${courseId}`, { max: 1 });
    }
    courseList.push(course);

    // Assert that variables object exists for this course
    const courseVariables = variables.get(course.forecast_id);
    if (typeof courseVariables === "undefined")
      throw new MissingCourseVariablesError(course.forecast_id);
    courseVariables.set(`course_${courseId}`, 1);
  }

  // Add fixed course constraints
  for (const fixedCourseId of request.fixed_courses) {
    const fixedCourseVariables = variables.get(fixedCourseId);
    if (typeof fixedCourseVariables !== "undefined") {
      constraints.set(`fixed_${fixedCourseId}`, { equal: 1 });
      fixedCourseVariables.set(`fixed_${fixedCourseId}`, 1);
    }
  }

  // Solve the YALPS model
  const result = solve({
    direction: "maximize",
    objective: "utility_credits",
    constraints,
    variables,
    binaries: true,
  });

  // Process results
  const selectedCourses: OptimizedCourse[] = [];
  let totalCost = 0;
  let totalCredits = 0;
  let totalUtility = 0;

  for (const course of coursesWithPrices) {
    const variableResult = result.variables.find(([name]) => name === course.forecast_id);
    const variableValue = variableResult?.[1] ?? 0;
    if (variableValue === 1) {
      totalCost += course.price;
      totalCredits += course.credits;
      totalUtility += course.utility;
      selectedCourses.push({
        forecast_id: course.forecast_id,
        price: course.price,
        credits: course.credits,
        utility: course.utility,
        department: course.department,
        title: course.title,
      });
    }
  }

  return {
    selectedCourses,
    totalCost,
    totalCredits,
    totalUtility,
    optimizationStatus: result.status,
  };
}
