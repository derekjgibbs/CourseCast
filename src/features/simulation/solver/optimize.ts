import { type Constraint, solve } from "yalps";

import type { OptimizationRequest, OptimizationResponse } from "./schema";

class OptimizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OptimizationError";
  }
}

export function optimize(request: OptimizationRequest) {
  // Calculate prices for all courses
  const coursesWithPrices = request.courses.map(course => ({
    ...course,
    utility: request.utilities.get(course.forecast_id) ?? 0,
  }));

  // Constraints map
  const constraints = new Map<string, Constraint>([
    ["budget", { max: request.budget }],
    ["max_credits", { max: request.max_credits }],
  ]);

  // Build conflict group mappings for efficient constraint generation
  const conflictGroups = new Map<string, Set<string>>();
  const courseToGroups = new Map<string, Set<string>>();

  // Process conflict groups and build mappings
  for (const course of coursesWithPrices) {
    courseToGroups.set(course.forecast_id, new Set());

    for (const groupId of course.conflict_groups) {
      // Add course to group
      let group = conflictGroups.get(groupId);
      if (typeof group === "undefined") {
        group = new Set();
        conflictGroups.set(groupId, group);
      }
      group.add(course.forecast_id);

      // Add group to course's groups
      const courseGroups = courseToGroups.get(course.forecast_id);
      if (typeof courseGroups === "undefined")
        throw new OptimizationError(`Course groups not found for ${course.forecast_id}`);
      courseGroups.add(groupId);
    }
  }

  // Pre-create all conflict group constraints
  // Only create constraints for groups with multiple courses
  for (const [groupId, courses] of conflictGroups.entries())
    if (courses.size > 1) constraints.set(groupId, { max: 1 });

  // Variables map
  const variables = new Map<string, Map<string, number>>();
  for (const course of coursesWithPrices) {
    const courseVariables = new Map([
      // Objective Function
      ["weighted_credit_utility", course.utility * course.credits],
      ["budget", course.truncated_price],
      ["max_credits", course.credits],
    ]);
    variables.set(course.forecast_id, courseVariables);

    // Only add each constraint once per group
    const courseGroups = courseToGroups.get(course.forecast_id);
    if (typeof courseGroups === "undefined")
      throw new OptimizationError(`Course groups not found for ${course.forecast_id}`);
    for (const groupId of courseGroups) courseVariables.set(groupId, 1);
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
    objective: "weighted_credit_utility",
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
