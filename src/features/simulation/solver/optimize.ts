import { type Constraint, solve } from "yalps";

import type { OptimizationRequest, OptimizationResponse } from "./schema";

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

    // Add conflict group constraints using precomputed data
    for (const groupId of course.conflict_groups) {
      courseVariables.set(groupId, 1);
      // Ensure constraint exists (only add once per group)
      if (!constraints.has(groupId)) constraints.set(groupId, { max: 1 });
    }
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
