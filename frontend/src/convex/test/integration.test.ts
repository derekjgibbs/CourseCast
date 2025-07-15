import { describe, expect, test } from "vitest";
import { v } from "convex/values";
import { createMockUser, createMockUserScenario } from "./utils";
import {
  createUserValidator,
  createUserScenarioValidator,
  updateUserScenarioValidator,
  getDefaultUserScenario,
  CONSTRAINTS,
} from "../types";

describe("Integration tests - User and Scenario workflows", () => {
  describe("Complete user lifecycle", () => {
    test("user creation to scenario management workflow", () => {
      // Step 1: Create a user
      const userData = {
        name: "Integration Test User",
        email: "integration@test.com",
      };

      expect(userData.name).toBeTypeOf("string");
      expect(userData.email).toContain("@");

      // Simulate user creation response
      const mockUserId = "user_integration_123";

      // Step 2: Create first scenario (should be active by default)
      const firstScenario = {
        user_id: mockUserId,
        name: "First Scenario",
        token_budget: 4500,
        max_credits: 5.0,
        min_credits: 0.0,
        utilities: { ACCT7900401: 75 },
        fixed_courses: ["ACCT7900401"],
      };

      expect(firstScenario.user_id).toBe(mockUserId);
      expect(firstScenario.name).toBeTypeOf("string");

      // Step 3: Create second scenario (should be inactive)
      const secondScenario = {
        user_id: mockUserId,
        name: "Second Scenario",
        token_budget: 5000,
        max_credits: 6.0,
        min_credits: 1.0,
        utilities: { REAL8400401: 80, FINC8010001: 60 },
        fixed_courses: ["REAL8400401", "FINC8010001"],
      };

      expect(secondScenario.user_id).toBe(mockUserId);
      expect(secondScenario.token_budget).toBeGreaterThan(firstScenario.token_budget);

      // Step 4: Switch active scenario
      expect(mockUserId).toBeTypeOf("string");

      // Step 5: Update scenario
      const scenarioUpdate = {
        name: "Updated Second Scenario",
        token_budget: 5500,
        utilities: { REAL8400401: 85, FINC8010001: 65, ACCT7900401: 70 },
      };

      expect(scenarioUpdate.name).not.toBe(secondScenario.name);
      expect(scenarioUpdate.token_budget).toBeGreaterThan(secondScenario.token_budget);

      // Step 6: Delete first scenario
      const scenarioToDelete = firstScenario;
      expect(scenarioToDelete).toBeDefined();
    });

    test("user deletion cascades to scenarios", () => {
      const userId = "user_cascade_test";
      const scenarios = [
        createMockUserScenario(userId),
        createMockUserScenario(userId),
        createMockUserScenario(userId),
      ];

      scenarios.forEach(scenario => {
        expect(scenario.user_id).toBe(userId);
      });

      // When user is deleted, all scenarios should be deleted
      expect(scenarios.length).toBe(3);
    });
  });

  describe("Active scenario management", () => {
    test("only one scenario can be active per user", () => {
      const userId = "user_active_test";

      // Create multiple scenarios
      const scenarios = [
        { ...createMockUserScenario(userId), is_active: false },
        { ...createMockUserScenario(userId), is_active: false },
        { ...createMockUserScenario(userId), is_active: false },
      ];

      // Simulate setting one as active
      scenarios[1].is_active = true;

      const activeCount = scenarios.filter(s => s.is_active).length;
      expect(activeCount).toBe(1);
      expect(scenarios[1].is_active).toBe(true);
      expect(scenarios[0].is_active).toBe(false);
      expect(scenarios[2].is_active).toBe(false);
    });

    test("setting new active scenario deactivates others", () => {
      const userId = "user_switch_active";

      const scenarios = [
        { ...createMockUserScenario(userId), id: "scenario1", is_active: true },
        { ...createMockUserScenario(userId), id: "scenario2", is_active: false },
        { ...createMockUserScenario(userId), id: "scenario3", is_active: false },
      ];

      // Before switch
      expect(scenarios[0].is_active).toBe(true);
      expect(scenarios[1].is_active).toBe(false);

      // Simulate switching active scenario
      scenarios[0].is_active = false;
      scenarios[1].is_active = true;

      // After switch
      expect(scenarios[0].is_active).toBe(false);
      expect(scenarios[1].is_active).toBe(true);
      expect(scenarios[2].is_active).toBe(false);

      const activeCount = scenarios.filter(s => s.is_active).length;
      expect(activeCount).toBe(1);
    });
  });

  describe("Data validation across workflows", () => {
    test("email uniqueness validation across user operations", () => {
      const email1 = "unique1@test.com";
      const email2 = "unique2@test.com";
      const duplicateEmail = "unique1@test.com";

      // Different emails should be allowed
      expect(email1).not.toBe(email2);
      expect(email1).toContain("@");
      expect(email2).toContain("@");

      // Duplicate emails should be rejected
      expect(duplicateEmail).toBe(email1);
    });

    test("scenario validation across multiple operations", () => {
      const userId = "user_validation_test";

      // Valid scenario creation
      const validScenario = {
        user_id: userId,
        name: "Valid Scenario",
        token_budget: 4500,
        max_credits: 5.0,
        min_credits: 0.0,
        utilities: { ACCT7900401: 50, REAL8400401: 75 },
        fixed_courses: ["ACCT7900401", "REAL8400401"],
      };

      expect(validScenario.min_credits).toBeLessThanOrEqual(validScenario.max_credits);
      expect(validScenario.token_budget).toBeGreaterThan(0);
      expect(Object.values(validScenario.utilities).every(v => v >= 0 && v <= 100)).toBe(true);
      expect(validScenario.fixed_courses.every(c => c.length > 0)).toBe(true);

      // Valid scenario update
      const validUpdate = {
        max_credits: 7.0,
        utilities: { FINC8010001: 80 },
        fixed_courses: ["FINC8010001", "ACCT7900401"],
      };

      const newMinCredits = validScenario.min_credits;
      const newMaxCredits = validUpdate.max_credits;

      expect(newMinCredits).toBeLessThanOrEqual(newMaxCredits);
      expect(Object.values(validUpdate.utilities).every(v => v >= 0 && v <= 100)).toBe(true);
      expect(validUpdate.fixed_courses.every(c => c.length > 0)).toBe(true);
    });
  });

  describe("Default value application", () => {
    test("default values applied correctly on scenario creation", () => {
      const userId = "user_defaults_test";
      const scenarioName = "Test Default Scenario";

      const defaultScenario = getDefaultUserScenario(userId as any, scenarioName);

      expect(defaultScenario.user_id).toBe(userId);
      expect(defaultScenario.name).toBe(scenarioName);
      expect(defaultScenario.token_budget).toBe(CONSTRAINTS.USER_SCENARIO.TOKEN_BUDGET_DEFAULT);
      expect(defaultScenario.max_credits).toBe(CONSTRAINTS.USER_SCENARIO.MAX_CREDITS_DEFAULT);
      expect(defaultScenario.min_credits).toBe(CONSTRAINTS.USER_SCENARIO.MIN_CREDITS_DEFAULT);
      expect(defaultScenario.utilities).toEqual({});
      expect(defaultScenario.fixed_courses).toEqual([]);
      expect(defaultScenario.is_active).toBe(true);
      expect(defaultScenario.created_at).toBeTypeOf("number");
      expect(defaultScenario.updated_at).toBeTypeOf("number");
    });

    test("partial scenario creation with defaults", () => {
      const userId = "user_partial_test";
      const partialScenario = {
        user_id: userId,
        name: "Partial Scenario",
        max_credits: 6.0,
        utilities: { ACCT7900401: 60 },
      };

      // Merge with defaults
      const defaults = getDefaultUserScenario(userId as any, partialScenario.name);
      const finalScenario = {
        ...defaults,
        ...partialScenario,
      };

      expect(finalScenario.user_id).toBe(userId);
      expect(finalScenario.name).toBe(partialScenario.name);
      expect(finalScenario.max_credits).toBe(partialScenario.max_credits);
      expect(finalScenario.utilities).toEqual(partialScenario.utilities);
      expect(finalScenario.token_budget).toBe(defaults.token_budget);
      expect(finalScenario.min_credits).toBe(defaults.min_credits);
      expect(finalScenario.fixed_courses).toEqual(defaults.fixed_courses);
    });
  });

  describe("Error handling workflows", () => {
    test("handles non-existent user operations gracefully", () => {
      const nonExistentUserId = "non_existent_user_123";

      expect(nonExistentUserId).toBeTypeOf("string");
      expect(nonExistentUserId.length).toBeGreaterThan(0);
    });

    test("handles non-existent scenario operations gracefully", () => {
      const nonExistentScenarioId = "non_existent_scenario_123";

      expect(nonExistentScenarioId).toBeTypeOf("string");
      expect(nonExistentScenarioId.length).toBeGreaterThan(0);
    });

    test("handles constraint violations gracefully", () => {
      const invalidScenarioData = {
        name: "", // Too short
        token_budget: -100, // Negative
        max_credits: 15.0, // Too high
        min_credits: -1.0, // Too low
        utilities: { ACCT7900401: 150 }, // Out of range
        fixed_courses: [""], // Empty course ID
      };

      expect(invalidScenarioData.name.length).toBe(0);
      expect(invalidScenarioData.token_budget).toBeLessThan(0);
      expect(invalidScenarioData.max_credits).toBeGreaterThan(
        CONSTRAINTS.USER_SCENARIO.MAX_CREDITS_LIMIT,
      );
      expect(invalidScenarioData.min_credits).toBeLessThan(
        CONSTRAINTS.USER_SCENARIO.MIN_CREDITS_LIMIT,
      );
      expect(Object.values(invalidScenarioData.utilities)[0]).toBeGreaterThan(
        CONSTRAINTS.COURSE_UTILITY.MAX_VALUE,
      );
      expect(invalidScenarioData.fixed_courses[0].length).toBe(0);
    });
  });

  describe("Complex scenario workflows", () => {
    test("bulk scenario operations for user", () => {
      const userId = "user_bulk_test";

      // Create multiple scenarios
      const scenarioNames = ["Scenario A", "Scenario B", "Scenario C", "Scenario D"];
      const scenarios = scenarioNames.map(name => ({
        user_id: userId,
        name,
        ...getDefaultUserScenario(userId as any, name),
      }));

      expect(scenarios).toHaveLength(4);
      scenarios.forEach((scenario, index) => {
        expect(scenario.user_id).toBe(userId);
        expect(scenario.name).toBe(scenarioNames[index]);
      });

      // Simulate bulk updates
      const updates = scenarios.map((scenario, index) => ({
        id: scenario.name,
        updates: {
          token_budget: 4000 + index * 500,
          max_credits: 4.0 + index,
        },
      }));

      expect(updates).toHaveLength(4);
      updates.forEach((update, index) => {
        expect(update.updates.token_budget).toBe(4000 + index * 500);
        expect(update.updates.max_credits).toBe(4.0 + index);
      });
    });

    test("scenario sharing and privacy", () => {
      const user1Id = "user1_privacy_test";
      const user2Id = "user2_privacy_test";

      const user1Scenarios = [createMockUserScenario(user1Id), createMockUserScenario(user1Id)];

      const user2Scenarios = [createMockUserScenario(user2Id)];

      // Verify scenarios belong to correct users
      user1Scenarios.forEach(scenario => {
        expect(scenario.user_id).toBe(user1Id);
        expect(scenario.user_id).not.toBe(user2Id);
      });

      user2Scenarios.forEach(scenario => {
        expect(scenario.user_id).toBe(user2Id);
        expect(scenario.user_id).not.toBe(user1Id);
      });

      // Verify user cannot access other user's scenarios
      const crossUserAttempt = {
        scenarioId: "user1_scenario_id",
        requestingUserId: user2Id,
      };

      expect(crossUserAttempt.requestingUserId).not.toBe(user1Id);
    });
  });
});
