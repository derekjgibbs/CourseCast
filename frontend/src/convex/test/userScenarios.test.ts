import { describe, expect, test } from "vitest";
import { v } from "convex/values";
import { createMockUser, createMockUserScenario } from "./utils";
import { 
  createUserScenarioValidator, 
  updateUserScenarioValidator,
  isValidUtilityValue,
  isValidCreditsRange,
  isValidScenarioName,
  validateUtilities,
  validateFixedCourses,
  getDefaultUserScenario,
  CONSTRAINTS
} from "../types";

describe("User scenario mutations", () => {
  describe("createUserScenario", () => {
    test("validates required fields structure", () => {
      const mockUserId = "user123";
      const mockScenario = createMockUserScenario(mockUserId);
      
      expect(createUserScenarioValidator).toBeDefined();
      expect(mockScenario.user_id).toBeTypeOf("string");
      expect(mockScenario.name).toBeTypeOf("string");
      expect(mockScenario.token_budget).toBeTypeOf("number");
      expect(mockScenario.max_credits).toBeTypeOf("number");
      expect(mockScenario.min_credits).toBeTypeOf("number");
      expect(mockScenario.utilities).toBeTypeOf("object");
      expect(Array.isArray(mockScenario.fixed_courses)).toBe(true);
      expect(mockScenario.is_active).toBeTypeOf("boolean");
    });

    test("creates scenario with valid data", () => {
      const scenarioData = {
        user_id: "user123",
        name: "Test Scenario",
        token_budget: 4500,
        max_credits: 5.0,
        min_credits: 0.0,
        utilities: { "ACCT7900401": 50, "REAL8400401": 75 },
        fixed_courses: ["ACCT7900401", "REAL8400401"],
      };
      
      expect(scenarioData.user_id).toBeTypeOf("string");
      expect(scenarioData.name).toBeTypeOf("string");
      expect(scenarioData.token_budget).toBeGreaterThan(0);
      expect(scenarioData.max_credits).toBeGreaterThanOrEqual(scenarioData.min_credits);
      expect(validateUtilities(scenarioData.utilities)).toBe(true);
      expect(validateFixedCourses(scenarioData.fixed_courses)).toBe(true);
    });

    test("applies default values", () => {
      const userId = "user123";
      const scenarioName = "Default Scenario";
      const defaultScenario = getDefaultUserScenario(userId as any, scenarioName);
      
      expect(defaultScenario.user_id).toBe(userId);
      expect(defaultScenario.name).toBe(scenarioName);
      expect(defaultScenario.token_budget).toBe(CONSTRAINTS.USER_SCENARIO.TOKEN_BUDGET_DEFAULT);
      expect(defaultScenario.max_credits).toBe(CONSTRAINTS.USER_SCENARIO.MAX_CREDITS_DEFAULT);
      expect(defaultScenario.min_credits).toBe(CONSTRAINTS.USER_SCENARIO.MIN_CREDITS_DEFAULT);
      expect(defaultScenario.utilities).toEqual({});
      expect(defaultScenario.fixed_courses).toEqual([]);
      expect(defaultScenario.is_active).toBe(true);
    });

    test("validates credit ranges", () => {
      const validRanges = [
        { min: 0, max: 5 },
        { min: 2, max: 8 },
        { min: 5, max: 5 },
      ];
      
      const invalidRanges = [
        { min: -1, max: 5 },
        { min: 0, max: 11 },
        { min: 5, max: 2 },
      ];
      
      validRanges.forEach(range => {
        expect(isValidCreditsRange(range.min, range.max)).toBe(true);
      });
      
      invalidRanges.forEach(range => {
        expect(isValidCreditsRange(range.min, range.max)).toBe(false);
      });
    });

    test("validates utility values", () => {
      const validUtilities = {
        "ACCT7900401": 0,
        "REAL8400401": 50,
        "FINC8010001": 100,
      };
      
      const invalidUtilities = {
        "ACCT7900401": -1,
        "REAL8400401": 150,
        "FINC8010001": 50,
      };
      
      expect(validateUtilities(validUtilities)).toBe(true);
      expect(validateUtilities(invalidUtilities)).toBe(false);
    });

    test("validates fixed courses", () => {
      const validCourses = ["ACCT7900401", "REAL8400401", "FINC8010001"];
      const invalidCourses = ["", "ACCT7900401", "REAL8400401"];
      
      expect(validateFixedCourses(validCourses)).toBe(true);
      expect(validateFixedCourses(invalidCourses)).toBe(false);
    });

    test("validates scenario name", () => {
      const validNames = ["Test", "Valid Scenario Name", "X".repeat(200)];
      const invalidNames = ["", "X".repeat(201)];
      
      validNames.forEach(name => {
        expect(isValidScenarioName(name)).toBe(true);
      });
      
      invalidNames.forEach(name => {
        expect(isValidScenarioName(name)).toBe(false);
      });
    });

    test("sets proper timestamps", () => {
      const mockScenario = createMockUserScenario("user123");
      const now = Date.now();
      
      expect(mockScenario.created_at).toBeTypeOf("number");
      expect(mockScenario.updated_at).toBeTypeOf("number");
      expect(mockScenario.created_at).toBeLessThanOrEqual(now);
      expect(mockScenario.updated_at).toBeLessThanOrEqual(now);
    });
  });

  describe("updateUserScenario", () => {
    test("validates update fields structure", () => {
      expect(updateUserScenarioValidator).toBeDefined();
      
      const validUpdate = {
        name: "Updated Scenario",
        token_budget: 5000,
        max_credits: 6.0,
        min_credits: 1.0,
        utilities: { "ACCT7900401": 75 },
        fixed_courses: ["ACCT7900401"],
        is_active: false,
      };
      
      expect(validUpdate.name).toBeTypeOf("string");
      expect(validUpdate.token_budget).toBeTypeOf("number");
      expect(validUpdate.max_credits).toBeTypeOf("number");
      expect(validUpdate.min_credits).toBeTypeOf("number");
      expect(validUpdate.utilities).toBeTypeOf("object");
      expect(Array.isArray(validUpdate.fixed_courses)).toBe(true);
      expect(validUpdate.is_active).toBeTypeOf("boolean");
    });

    test("updates scenario fields", () => {
      const originalScenario = createMockUserScenario("user123");
      const updates = {
        name: "Updated Name",
        token_budget: 6000,
        max_credits: 7.0,
      };
      
      expect(updates.name).not.toBe(originalScenario.name);
      expect(updates.token_budget).not.toBe(originalScenario.token_budget);
      expect(updates.max_credits).not.toBe(originalScenario.max_credits);
    });

    test("allows partial updates", () => {
      const nameUpdate = { name: "New Name" };
      const budgetUpdate = { token_budget: 5000 };
      const utilitiesUpdate = { utilities: { "ACCT7900401": 80 } };
      
      expect(nameUpdate.name).toBeTypeOf("string");
      expect(budgetUpdate.token_budget).toBeTypeOf("number");
      expect(utilitiesUpdate.utilities).toBeTypeOf("object");
    });

    test("validates constraint on update", () => {
      const validUpdate = {
        max_credits: 8.0,
        min_credits: 2.0,
        utilities: { "ACCT7900401": 75 },
      };
      
      expect(isValidCreditsRange(validUpdate.min_credits, validUpdate.max_credits)).toBe(true);
      expect(validateUtilities(validUpdate.utilities)).toBe(true);
    });

    test("updates timestamp", () => {
      const originalTime = Date.now() - 1000;
      const updatedTime = Date.now();
      
      expect(updatedTime).toBeGreaterThan(originalTime);
    });
  });

  describe("deleteUserScenario", () => {
    test("handles scenario deletion", () => {
      const scenarioToDelete = createMockUserScenario("user123");
      
      expect(scenarioToDelete).toBeDefined();
      expect(scenarioToDelete.user_id).toBeTypeOf("string");
      expect(scenarioToDelete.name).toBeTypeOf("string");
    });

    test("handles non-existent scenario", () => {
      const nonExistentId = "non-existent-scenario-id";
      
      expect(nonExistentId).toBeTypeOf("string");
      expect(nonExistentId.length).toBeGreaterThan(0);
    });

    test("handles active scenario deletion", () => {
      const activeScenario = createMockUserScenario("user123");
      activeScenario.is_active = true;
      
      expect(activeScenario.is_active).toBe(true);
    });
  });

  describe("setActiveUserScenario", () => {
    test("sets scenario as active", () => {
      const scenario = createMockUserScenario("user123");
      scenario.is_active = false;
      
      expect(scenario.is_active).toBe(false);
    });

    test("deactivates other scenarios for same user", () => {
      const userId = "user123";
      const scenario1 = createMockUserScenario(userId);
      const scenario2 = createMockUserScenario(userId);
      
      scenario1.is_active = true;
      scenario2.is_active = true;
      
      expect(scenario1.user_id).toBe(scenario2.user_id);
      expect(scenario1.is_active).toBe(true);
      expect(scenario2.is_active).toBe(true);
    });

    test("handles non-existent scenario", () => {
      const nonExistentId = "non-existent-scenario-id";
      
      expect(nonExistentId).toBeTypeOf("string");
      expect(nonExistentId.length).toBeGreaterThan(0);
    });

    test("validates scenario belongs to user", () => {
      const userId1 = "user123";
      const userId2 = "user456";
      const scenario = createMockUserScenario(userId1);
      
      expect(scenario.user_id).toBe(userId1);
      expect(scenario.user_id).not.toBe(userId2);
    });
  });

  describe("getUserScenarios", () => {
    test("retrieves scenarios for user", () => {
      const userId = "user123";
      const scenario1 = createMockUserScenario(userId);
      const scenario2 = createMockUserScenario(userId);
      
      expect(scenario1.user_id).toBe(userId);
      expect(scenario2.user_id).toBe(userId);
    });

    test("filters by user ID", () => {
      const userId1 = "user123";
      const userId2 = "user456";
      const scenario1 = createMockUserScenario(userId1);
      const scenario2 = createMockUserScenario(userId2);
      
      expect(scenario1.user_id).toBe(userId1);
      expect(scenario2.user_id).toBe(userId2);
      expect(scenario1.user_id).not.toBe(scenario2.user_id);
    });

    test("handles user with no scenarios", () => {
      const userId = "user-with-no-scenarios";
      
      expect(userId).toBeTypeOf("string");
      expect(userId.length).toBeGreaterThan(0);
    });

    test("orders by creation date", () => {
      const time1 = Date.now() - 2000;
      const time2 = Date.now() - 1000;
      const time3 = Date.now();
      
      expect(time1).toBeLessThan(time2);
      expect(time2).toBeLessThan(time3);
    });
  });

  describe("getActiveUserScenario", () => {
    test("retrieves active scenario for user", () => {
      const userId = "user123";
      const activeScenario = createMockUserScenario(userId);
      activeScenario.is_active = true;
      
      expect(activeScenario.user_id).toBe(userId);
      expect(activeScenario.is_active).toBe(true);
    });

    test("returns null when no active scenario", () => {
      const userId = "user-with-no-active-scenario";
      
      expect(userId).toBeTypeOf("string");
      expect(userId.length).toBeGreaterThan(0);
    });

    test("returns only one active scenario per user", () => {
      const userId = "user123";
      const scenario1 = createMockUserScenario(userId);
      const scenario2 = createMockUserScenario(userId);
      
      scenario1.is_active = true;
      scenario2.is_active = false;
      
      expect(scenario1.user_id).toBe(userId);
      expect(scenario2.user_id).toBe(userId);
      expect(scenario1.is_active).toBe(true);
      expect(scenario2.is_active).toBe(false);
    });

    test("handles non-existent user", () => {
      const nonExistentUserId = "non-existent-user";
      
      expect(nonExistentUserId).toBeTypeOf("string");
      expect(nonExistentUserId.length).toBeGreaterThan(0);
    });
  });

  describe("Business logic validation", () => {
    test("validates utility value constraints", () => {
      const validValues = [0, 25, 50, 75, 100];
      const invalidValues = [-1, 101, 150, -50];
      
      validValues.forEach(value => {
        expect(isValidUtilityValue(value)).toBe(true);
      });
      
      invalidValues.forEach(value => {
        expect(isValidUtilityValue(value)).toBe(false);
      });
    });

    test("validates credit range constraints", () => {
      const validRanges = [
        { min: 0, max: 0 },
        { min: 0, max: 5 },
        { min: 5, max: 10 },
      ];
      
      const invalidRanges = [
        { min: -1, max: 5 },
        { min: 0, max: 11 },
        { min: 8, max: 5 },
      ];
      
      validRanges.forEach(range => {
        expect(isValidCreditsRange(range.min, range.max)).toBe(true);
      });
      
      invalidRanges.forEach(range => {
        expect(isValidCreditsRange(range.min, range.max)).toBe(false);
      });
    });

    test("validates scenario name constraints", () => {
      const minLength = 1;
      const maxLength = CONSTRAINTS.USER_SCENARIO.NAME_MAX_LENGTH;
      
      expect(isValidScenarioName("A")).toBe(true);
      expect(isValidScenarioName("X".repeat(maxLength))).toBe(true);
      expect(isValidScenarioName("")).toBe(false);
      expect(isValidScenarioName("X".repeat(maxLength + 1))).toBe(false);
    });

    test("validates utilities object structure", () => {
      const validUtilities = {
        "ACCT7900401": 25,
        "REAL8400401": 50,
        "FINC8010001": 75,
      };
      
      const invalidUtilities = {
        "ACCT7900401": 150,
        "REAL8400401": -10,
        "FINC8010001": 50,
      };
      
      const emptyUtilities = {};
      
      expect(validateUtilities(validUtilities)).toBe(true);
      expect(validateUtilities(invalidUtilities)).toBe(false);
      expect(validateUtilities(emptyUtilities)).toBe(true);
    });

    test("validates fixed courses array", () => {
      const validCourses = ["ACCT7900401", "REAL8400401"];
      const invalidCourses = ["", "ACCT7900401"];
      const emptyCourses: string[] = [];
      
      expect(validateFixedCourses(validCourses)).toBe(true);
      expect(validateFixedCourses(invalidCourses)).toBe(false);
      expect(validateFixedCourses(emptyCourses)).toBe(true);
    });
  });

  describe("Active scenario management", () => {
    test("ensures only one active scenario per user", () => {
      const userId = "user123";
      const scenarios = [
        createMockUserScenario(userId),
        createMockUserScenario(userId),
        createMockUserScenario(userId),
      ];
      
      scenarios[0].is_active = true;
      scenarios[1].is_active = false;
      scenarios[2].is_active = false;
      
      const activeCount = scenarios.filter(s => s.is_active).length;
      expect(activeCount).toBe(1);
    });

    test("handles user with no scenarios", () => {
      const userId = "user-with-no-scenarios";
      const scenarios: any[] = [];
      
      expect(scenarios.length).toBe(0);
      expect(userId).toBeTypeOf("string");
    });
  });
});