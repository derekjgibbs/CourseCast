import { describe, expect, test } from "vitest";
import {
  isValidUtilityValue,
  isValidCreditsRange,
  isValidScenarioName,
  validateUtilities,
  validateFixedCourses,
  getDefaultUserScenario,
  CONSTRAINTS,
} from "@/convex/types";
import { v } from "convex/values";

describe("Business logic validation", () => {
  describe("Utility value validation", () => {
    test("accepts valid utility values", () => {
      expect(isValidUtilityValue(0)).toBe(true);
      expect(isValidUtilityValue(50)).toBe(true);
      expect(isValidUtilityValue(100)).toBe(true);
    });

    test("rejects invalid utility values", () => {
      expect(isValidUtilityValue(-1)).toBe(false);
      expect(isValidUtilityValue(101)).toBe(false);
      expect(isValidUtilityValue(999)).toBe(false);
    });

    test("handles edge cases", () => {
      expect(isValidUtilityValue(0.5)).toBe(true);
      expect(isValidUtilityValue(99.9)).toBe(true);
      expect(isValidUtilityValue(100.1)).toBe(false);
    });
  });

  describe("Credits range validation", () => {
    test("accepts valid credit ranges", () => {
      expect(isValidCreditsRange(0, 5)).toBe(true);
      expect(isValidCreditsRange(2, 8)).toBe(true);
      expect(isValidCreditsRange(0, 10)).toBe(true);
    });

    test("rejects invalid credit ranges", () => {
      expect(isValidCreditsRange(-1, 5)).toBe(false);
      expect(isValidCreditsRange(0, 11)).toBe(false);
      expect(isValidCreditsRange(5, 2)).toBe(false); // min > max
    });

    test("accepts equal min and max credits", () => {
      expect(isValidCreditsRange(5, 5)).toBe(true);
    });
  });

  describe("Scenario name validation", () => {
    test("accepts valid scenario names", () => {
      expect(isValidScenarioName("Test Scenario")).toBe(true);
      expect(isValidScenarioName("A")).toBe(true);
      expect(isValidScenarioName("X".repeat(200))).toBe(true);
    });

    test("rejects invalid scenario names", () => {
      expect(isValidScenarioName("")).toBe(false);
      expect(isValidScenarioName("X".repeat(201))).toBe(false);
    });
  });

  describe("Utilities object validation", () => {
    test("validates correct utilities object", () => {
      const validUtilities = { ACCT7900401: 50, REAL8400401: 75, FINC8010001: 25 };
      expect(validateUtilities(validUtilities)).toBe(true);
    });

    test("validates empty utilities object", () => {
      expect(validateUtilities({})).toBe(true);
    });

    test("rejects utilities with invalid values", () => {
      const invalidUtilities = { ACCT7900401: 150, REAL8400401: 75 };
      expect(validateUtilities(invalidUtilities)).toBe(false);
    });

    test("rejects utilities with negative values", () => {
      const invalidUtilities = { ACCT7900401: -10, REAL8400401: 75 };
      expect(validateUtilities(invalidUtilities)).toBe(false);
    });
  });

  describe("Fixed courses validation", () => {
    test("validates correct fixed courses array", () => {
      expect(validateFixedCourses(["ACCT7900401", "REAL8400401", "FINC8010001"])).toBe(true);
    });

    test("validates empty fixed courses array", () => {
      expect(validateFixedCourses([])).toBe(true);
    });

    test("rejects empty course IDs", () => {
      expect(validateFixedCourses([""])).toBe(false);
    });

    test("rejects non-string course IDs", () => {
      expect(validateFixedCourses([123 as any, "REAL8400401"])).toBe(false);
    });
  });
});

describe("Default value generation", () => {
  test("generates correct default user scenario", () => {
    const userId = "user123" as any; // Mock ID
    const name = "My Scenario";

    const defaultScenario = getDefaultUserScenario(userId, name);

    expect(defaultScenario.user_id).toBe(userId);
    expect(defaultScenario.name).toBe(name);
    expect(defaultScenario.token_budget).toBe(CONSTRAINTS.USER_SCENARIO.TOKEN_BUDGET_DEFAULT);
    expect(defaultScenario.max_credits).toBe(CONSTRAINTS.USER_SCENARIO.MAX_CREDITS_DEFAULT);
    expect(defaultScenario.min_credits).toBe(CONSTRAINTS.USER_SCENARIO.MIN_CREDITS_DEFAULT);
    expect(defaultScenario.utilities).toEqual({});
    expect(defaultScenario.fixed_courses).toEqual([]);
    expect(defaultScenario.is_active).toBe(true);
    expect(defaultScenario.created_at).toBeTypeOf("number");
    expect(defaultScenario.updated_at).toBeTypeOf("number");
  });
});

describe("Convex validator structure", () => {
  test("createUserScenarioValidator structure is correct", () => {
    const createUserScenarioValidator = v.object({
      user_id: v.id("users"),
      name: v.string(),
      token_budget: v.optional(v.number()),
      max_credits: v.optional(v.number()),
      min_credits: v.optional(v.number()),
      utilities: v.optional(v.record(v.string(), v.number())),
      fixed_courses: v.optional(v.array(v.number())),
    });

    expect(createUserScenarioValidator).toBeDefined();
  });

  test("updateUserScenarioValidator structure is correct", () => {
    const updateUserScenarioValidator = v.object({
      name: v.optional(v.string()),
      token_budget: v.optional(v.number()),
      max_credits: v.optional(v.number()),
      min_credits: v.optional(v.number()),
      utilities: v.optional(v.record(v.string(), v.number())),
      fixed_courses: v.optional(v.array(v.number())),
      is_active: v.optional(v.boolean()),
    });

    expect(updateUserScenarioValidator).toBeDefined();
  });
});

describe("Edge cases and error conditions", () => {
  test("handles very large utility objects", () => {
    const largeUtilities: Record<string, number> = {};
    for (let i = 1; i <= 1000; i++) {
      largeUtilities[i.toString()] = 50;
    }

    expect(validateUtilities(largeUtilities)).toBe(true);
  });

  test("handles very large fixed courses arrays", () => {
    const largeCourseArray = Array.from(
      { length: 1000 },
      (_, i) => `COURSE${i.toString().padStart(7, "0")}`,
    );

    expect(validateFixedCourses(largeCourseArray)).toBe(true);
  });

  test("handles decimal utility values", () => {
    const decimalUtilities = { ACCT7900401: 50.5, REAL8400401: 75.2 };
    expect(validateUtilities(decimalUtilities)).toBe(true);
  });

  test("validates constraints constants are correct", () => {
    expect(CONSTRAINTS.USER_SCENARIO.NAME_MAX_LENGTH).toBe(200);
    expect(CONSTRAINTS.USER_SCENARIO.TOKEN_BUDGET_DEFAULT).toBe(4500);
    expect(CONSTRAINTS.USER_SCENARIO.MAX_CREDITS_DEFAULT).toBe(5.0);
    expect(CONSTRAINTS.USER_SCENARIO.MIN_CREDITS_DEFAULT).toBe(0.0);
    expect(CONSTRAINTS.COURSE_UTILITY.MIN_VALUE).toBe(0);
    expect(CONSTRAINTS.COURSE_UTILITY.MAX_VALUE).toBe(100);
  });

  test("handles special number values", () => {
    expect(isValidUtilityValue(NaN)).toBe(false);
    expect(isValidUtilityValue(Infinity)).toBe(false);
    expect(isValidUtilityValue(-Infinity)).toBe(false);
  });

  test("validates ID type constraints", () => {
    const userIdValidator = v.id("users");
    const scenarioIdValidator = v.id("user_scenarios");
    const courseIdValidator = v.id("courses");

    expect(userIdValidator).toBeDefined();
    expect(scenarioIdValidator).toBeDefined();
    expect(courseIdValidator).toBeDefined();
  });

  test("validates array and record validators", () => {
    const fixedCoursesValidator = v.array(v.number());
    const utilitiesValidator = v.record(v.string(), v.number());

    expect(fixedCoursesValidator).toBeDefined();
    expect(utilitiesValidator).toBeDefined();
  });

  test("validates literal and union validators", () => {
    const statusValidator = v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("archived"),
    );

    expect(statusValidator).toBeDefined();
  });
});
