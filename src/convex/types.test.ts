import { describe, expect, test } from "vitest";
import {
  isValidCreditsRange,
  isValidUtilityValue,
  isValidScenarioName,
  validateFixedCourses,
  validateUtilities,
} from "@/convex/types";

describe("Business logic validation", () => {
  describe("Utility value validation", () => {
    test("accepts valid utility values", () => {
      expect(isValidUtilityValue(0n)).toBe(true);
      expect(isValidUtilityValue(50n)).toBe(true);
      expect(isValidUtilityValue(100n)).toBe(true);
    });
    test("rejects invalid utility values", () => {
      expect(isValidUtilityValue(-1n)).toBe(false);
      expect(isValidUtilityValue(101n)).toBe(false);
      expect(isValidUtilityValue(999n)).toBe(false);
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
      const validUtilities = { ACCT7900401: 50n, REAL8400401: 75n, FINC8010001: 25n };
      expect(validateUtilities(validUtilities)).toBe(true);
    });
    test("validates empty utilities object", () => {
      expect(validateUtilities({})).toBe(true);
    });
    test("rejects utilities with invalid values", () => {
      const invalidUtilities = { ACCT7900401: 150n, REAL8400401: 75n };
      expect(validateUtilities(invalidUtilities)).toBe(false);
    });

    test("rejects utilities with negative values", () => {
      const invalidUtilities = { ACCT7900401: -10n, REAL8400401: 75n };
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
  });
});
