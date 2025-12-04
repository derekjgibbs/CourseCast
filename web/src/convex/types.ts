import { Infer, v } from "convex/values";

import { Doc, Id } from "./_generated/dataModel";

// Validator definitions for type inference
export const userValidator = v.object({
  name: v.string(),
  email: v.string(),
  created_at: v.number(),
  updated_at: v.number(),
});

export const userScenarioValidator = v.object({
  user_id: v.id("users"),
  name: v.string(),
  token_budget: v.int64(),
  max_credits: v.number(),
  utilities: v.record(v.string(), v.number()),
  fixed_courses: v.array(v.string()),
  is_active: v.boolean(),
  created_at: v.int64(),
  updated_at: v.int64(),
});

export const courseValidator = v.object({
  course_id: v.string(),
  title: v.string(),
  department: v.string(),
  instructor: v.string(),
  days: v.string(),
  start_time: v.string(),
  end_time: v.string(),
  term: v.string(),
  credits: v.number(),
  price_forecast: v.number(),
  price_std_dev: v.number(),
  course_quality: v.number(),
  instructor_quality: v.number(),
  difficulty: v.number(),
  work_required: v.number(),
});

// Utility validators
export const courseUtilitiesValidator = v.record(v.string(), v.int64());
export const fixedCoursesValidator = v.array(v.string());

// Input validators for API operations
export const createUserValidator = v.object({
  name: v.string(),
  email: v.string(),
});

export const updateUserValidator = v.object({
  name: v.optional(v.string()),
  email: v.optional(v.string()),
});

export const createUserScenarioValidator = v.object({ name: v.string() });

export const updateUserScenarioValidator = v.object({
  id: v.id("user_scenarios"),
  name: v.optional(v.string()),
  token_budget: v.optional(v.int64()),
  max_credits: v.optional(v.number()),
  utilities: v.optional(v.record(v.string(), v.int64())),
  fixed_courses: v.optional(v.array(v.string())),
});

// Inferred TypeScript types
export type User = Infer<typeof userValidator>;
export type UserScenario = Infer<typeof userScenarioValidator>;
export type Course = Infer<typeof courseValidator>;
export type CourseUtilities = Infer<typeof courseUtilitiesValidator>;
export type FixedCourses = Infer<typeof fixedCoursesValidator>;

// Input types for API operations
export type CreateUserInput = Infer<typeof createUserValidator>;
export type UpdateUserInput = Infer<typeof updateUserValidator>;
export type CreateUserScenarioInput = Infer<typeof createUserScenarioValidator>;
export type UpdateUserScenarioInput = Infer<typeof updateUserScenarioValidator>;

// Document types from schema (will be available after schema generation)
export type UserDoc = Doc<"users">;
export type UserScenarioDoc = Doc<"user_scenarios">;

// ID types for type safety
export type UserId = Id<"users">;
export type UserScenarioId = Id<"user_scenarios">;

// Business logic constraints (for use in validation functions)
export const CONSTRAINTS = {
  USER_SCENARIO: {
    NAME_MAX_LENGTH: 200,
    TOKEN_BUDGET_DEFAULT: 4500n,
    MAX_CREDITS_DEFAULT: 7.5,
    MAX_CREDITS_LIMIT: 10.0,
  },
  COURSE_UTILITY: {
    MIN_VALUE: 0n,
    MAX_VALUE: 100n,
  },
} as const;

// Type guards for runtime validation
export const isValidUtilityValue = (value: bigint): boolean => {
  return (
    value >= CONSTRAINTS.COURSE_UTILITY.MIN_VALUE && value <= CONSTRAINTS.COURSE_UTILITY.MAX_VALUE
  );
};

export const isValidCreditsRange = (min: number, max: number): boolean => {
  return min >= 0 && max <= CONSTRAINTS.USER_SCENARIO.MAX_CREDITS_LIMIT && min <= max;
};

export const isValidScenarioName = (name: string): boolean => {
  return name.length > 0 && name.length <= CONSTRAINTS.USER_SCENARIO.NAME_MAX_LENGTH;
};

// Utility functions for validation
export const validateUtilities = (utilities: CourseUtilities): boolean => {
  return Object.values(utilities).every(isValidUtilityValue);
};

export const validateFixedCourses = (courses: FixedCourses): boolean => {
  return courses.every(courseId => courseId.length > 0);
};
