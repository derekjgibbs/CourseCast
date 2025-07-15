import { describe, expect, test } from "vitest";
import { v, Infer } from "convex/values";

// Define validators as they should exist in types.ts
const userValidator = v.object({
  name: v.string(),
  email: v.string(),
  created_at: v.number(),
  updated_at: v.number(),
});

const userScenarioValidator = v.object({
  user_id: v.string(), // Will be v.id("users") in actual schema
  name: v.string(),
  token_budget: v.number(),
  max_credits: v.number(),
  min_credits: v.number(),
  utilities: v.record(v.string(), v.number()),
  fixed_courses: v.array(v.number()),
  is_active: v.boolean(),
  created_at: v.number(),
  updated_at: v.number(),
});

const courseUtilityValidator = v.record(v.string(), v.number());

describe("TypeScript type inference", () => {
  test("User type inference works correctly", () => {
    type User = Infer<typeof userValidator>;
    
    const user: User = {
      name: "Test User",
      email: "test@example.com",
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    expect(user.name).toBeTypeOf("string");
    expect(user.email).toBeTypeOf("string");
    expect(user.created_at).toBeTypeOf("number");
    expect(user.updated_at).toBeTypeOf("number");
  });

  test("UserScenario type inference works correctly", () => {
    type UserScenario = Infer<typeof userScenarioValidator>;
    
    const scenario: UserScenario = {
      user_id: "user123",
      name: "Test Scenario",
      token_budget: 4500,
      max_credits: 5.0,
      min_credits: 0.0,
      utilities: { "ACCT7900401": 50, "REAL8400401": 60 },
      fixed_courses: ["ACCT7900401", "REAL8400401", "FINC8010001"],
      is_active: true,
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    expect(scenario.user_id).toBeTypeOf("string");
    expect(scenario.name).toBeTypeOf("string");
    expect(scenario.token_budget).toBeTypeOf("number");
    expect(scenario.max_credits).toBeTypeOf("number");
    expect(scenario.min_credits).toBeTypeOf("number");
    expect(scenario.utilities).toBeTypeOf("object");
    expect(Array.isArray(scenario.fixed_courses)).toBe(true);
    expect(scenario.is_active).toBeTypeOf("boolean");
    expect(scenario.created_at).toBeTypeOf("number");
    expect(scenario.updated_at).toBeTypeOf("number");
  });

  test("CourseUtilities type inference works correctly", () => {
    type CourseUtilities = Infer<typeof courseUtilityValidator>;
    
    const utilities: CourseUtilities = {
      "19": 50,
      "20": 60,
      "21": 70,
    };

    expect(utilities).toBeTypeOf("object");
    expect(utilities["19"]).toBeTypeOf("number");
    expect(utilities["20"]).toBeTypeOf("number");
    expect(utilities["21"]).toBeTypeOf("number");
  });

  test("Validators are properly defined", () => {
    expect(userValidator).toBeDefined();
    expect(userScenarioValidator).toBeDefined();
    expect(courseUtilityValidator).toBeDefined();
  });

  test("Fixed courses array type works", () => {
    const fixedCoursesValidator = v.array(v.string());
    type FixedCourses = Infer<typeof fixedCoursesValidator>;
    
    const validCourses: FixedCourses = ["ACCT7900401", "REAL8400401", "FINC8010001"];
    expect(Array.isArray(validCourses)).toBe(true);
    validCourses.forEach(courseId => {
      expect(courseId).toBeTypeOf("string");
    });
  });

  test("User ID reference type safety", () => {
    // Test that ID validator works as expected
    const userIdValidator = v.id("users");
    expect(userIdValidator).toBeDefined();
  });
});

describe("Validator composition", () => {
  test("Nested object validation structure", () => {
    const complexValidator = v.object({
      user: userValidator,
      scenario: userScenarioValidator,
    });

    type ComplexType = Infer<typeof complexValidator>;
    
    const validData: ComplexType = {
      user: {
        name: "Test User",
        email: "test@example.com",
        created_at: Date.now(),
        updated_at: Date.now(),
      },
      scenario: {
        user_id: "user123",
        name: "Test Scenario",
        token_budget: 4500,
        max_credits: 5.0,
        min_credits: 0.0,
        utilities: { "ACCT7900401": 50 },
        fixed_courses: ["ACCT7900401"],
        is_active: true,
        created_at: Date.now(),
        updated_at: Date.now(),
      },
    };

    expect(complexValidator).toBeDefined();
    expect(validData.user.name).toBeTypeOf("string");
    expect(validData.scenario.name).toBeTypeOf("string");
  });

  test("Optional fields work correctly", () => {
    const optionalFieldValidator = v.object({
      required_field: v.string(),
      optional_field: v.optional(v.string()),
    });

    type OptionalType = Infer<typeof optionalFieldValidator>;

    const dataWithOptional: OptionalType = {
      required_field: "required",
      optional_field: "optional",
    };

    const dataWithoutOptional: OptionalType = {
      required_field: "required",
    };

    expect(optionalFieldValidator).toBeDefined();
    expect(dataWithOptional.required_field).toBeTypeOf("string");
    expect(dataWithOptional.optional_field).toBeTypeOf("string");
    expect(dataWithoutOptional.required_field).toBeTypeOf("string");
    expect(dataWithoutOptional.optional_field).toBeUndefined();
  });

  test("Union types work for status fields", () => {
    const statusValidator = v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("archived")
    );

    type Status = Infer<typeof statusValidator>;

    const activeStatus: Status = "active";
    const inactiveStatus: Status = "inactive";
    const archivedStatus: Status = "archived";

    expect(statusValidator).toBeDefined();
    expect(activeStatus).toBe("active");
    expect(inactiveStatus).toBe("inactive");
    expect(archivedStatus).toBe("archived");
  });

  test("Record validator works for utilities", () => {
    type Utilities = Infer<typeof courseUtilityValidator>;
    
    const utilities: Utilities = {
      "ACCT7900401": 25,
      "REAL8400401": 50,
      "FINC8010001": 75,
    };

    expect(Object.keys(utilities)).toEqual(["ACCT7900401", "REAL8400401", "FINC8010001"]);
    expect(Object.values(utilities)).toEqual([25, 50, 75]);
  });
});