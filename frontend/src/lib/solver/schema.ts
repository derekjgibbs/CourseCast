import * as v from "valibot";

import { Course } from "@/lib/schema/course";

export const OptimizationRequest = v.object({
  budget: v.number(),
  max_credits: v.number(),
  min_credits: v.number(),
  utilities: v.map(v.string(), v.number()),
  fixed_courses: v.array(v.string()),
  courses: v.array(Course),
  seed: v.number(),
});
export type OptimizationRequest = v.InferOutput<typeof OptimizationRequest>;

export const OptimizationResponse = v.object({
  selectedCourses: v.array(v.string()),
  totalCost: v.number(),
  totalCredits: v.number(),
  totalUtility: v.number(),
  optimizationStatus: v.picklist(["optimal", "infeasible", "unbounded", "timedout", "cycled"]),
});
export type OptimizationResponse = v.InferOutput<typeof OptimizationResponse>;
