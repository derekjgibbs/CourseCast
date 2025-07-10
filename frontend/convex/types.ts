import { v, Infer } from "convex/values";
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
  token_budget: v.number(),
  max_credits: v.number(),
  min_credits: v.number(),
  utilities: v.record(v.string(), v.number()),
  fixed_courses: v.array(v.string()),
  is_active: v.boolean(),
  created_at: v.number(),
  updated_at: v.number(),
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
export const courseUtilitiesValidator = v.record(v.string(), v.number());
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

export const createUserScenarioValidator = v.object({
  user_id: v.id("users"),
  name: v.string(),
  token_budget: v.optional(v.number()),
  max_credits: v.optional(v.number()),
  min_credits: v.optional(v.number()),
  utilities: v.optional(v.record(v.string(), v.number())),
  fixed_courses: v.optional(v.array(v.string())),
});

export const updateUserScenarioValidator = v.object({
  name: v.optional(v.string()),
  token_budget: v.optional(v.number()),
  max_credits: v.optional(v.number()),
  min_credits: v.optional(v.number()),
  utilities: v.optional(v.record(v.string(), v.number())),
  fixed_courses: v.optional(v.array(v.string())),
  is_active: v.optional(v.boolean()),
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
export type CourseDoc = Doc<"courses">;

// ID types for type safety
export type UserId = Id<"users">;
export type UserScenarioId = Id<"user_scenarios">;
export type CourseId = Id<"courses">;

// Business logic constraints (for use in validation functions)
export const CONSTRAINTS = {
  USER_SCENARIO: {
    NAME_MAX_LENGTH: 200,
    TOKEN_BUDGET_DEFAULT: 4500,
    MAX_CREDITS_DEFAULT: 5.0,
    MIN_CREDITS_DEFAULT: 0.0,
    MAX_CREDITS_LIMIT: 10.0,
    MIN_CREDITS_LIMIT: 0.0,
  },
  COURSE_UTILITY: {
    MIN_VALUE: 0,
    MAX_VALUE: 100,
  },
} as const;

// Type guards for runtime validation
export const isValidUtilityValue = (value: number): boolean => {
  return value >= CONSTRAINTS.COURSE_UTILITY.MIN_VALUE && 
         value <= CONSTRAINTS.COURSE_UTILITY.MAX_VALUE;
};

export const isValidCreditsRange = (min: number, max: number): boolean => {
  return min >= CONSTRAINTS.USER_SCENARIO.MIN_CREDITS_LIMIT &&
         max <= CONSTRAINTS.USER_SCENARIO.MAX_CREDITS_LIMIT &&
         min <= max;
};

export const isValidScenarioName = (name: string): boolean => {
  return name.length > 0 && name.length <= CONSTRAINTS.USER_SCENARIO.NAME_MAX_LENGTH;
};

// Utility functions for validation
export const validateUtilities = (utilities: CourseUtilities): boolean => {
  return Object.values(utilities).every(isValidUtilityValue);
};

export const validateFixedCourses = (courses: FixedCourses): boolean => {
  return courses.every(courseId => typeof courseId === 'string' && courseId.length > 0);
};

// Default values for new scenarios
export const getDefaultUserScenario = (userId: UserId, name: string): Omit<UserScenario, "_id" | "_creationTime"> => ({
  user_id: userId,
  name,
  token_budget: CONSTRAINTS.USER_SCENARIO.TOKEN_BUDGET_DEFAULT,
  max_credits: CONSTRAINTS.USER_SCENARIO.MAX_CREDITS_DEFAULT,
  min_credits: CONSTRAINTS.USER_SCENARIO.MIN_CREDITS_DEFAULT,
  utilities: {},
  fixed_courses: [],
  is_active: true,
  created_at: Date.now(),
  updated_at: Date.now(),
});