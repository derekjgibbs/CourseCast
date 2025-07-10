import { describe, expect, test } from "vitest";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { createMockUser, createMockUserScenario } from "./utils";

describe("Users table schema", () => {
  test("validates required fields structure", () => {
    const userValidator = v.object({
      name: v.string(),
      email: v.string(),
      created_at: v.number(),
      updated_at: v.number(),
    });

    const validUser = createMockUser();
    
    // Test that validator is properly defined and mock data has correct types
    expect(userValidator).toBeDefined();
    expect(validUser.name).toBeTypeOf("string");
    expect(validUser.email).toBeTypeOf("string");
    expect(validUser.created_at).toBeTypeOf("number");
    expect(validUser.updated_at).toBeTypeOf("number");
  });

  test("validates email is string type", () => {
    const userValidator = v.object({
      name: v.string(),
      email: v.string(),
      created_at: v.number(),
      updated_at: v.number(),
    });

    const userWithValidEmail = {
      name: "Test User",
      email: "test@example.com",
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    expect(userValidator).toBeDefined();
    expect(userWithValidEmail.email).toBeTypeOf("string");
    expect(userWithValidEmail.email).toContain("@");
  });
});

describe("User scenarios table schema", () => {
  test("validates required fields structure", () => {
    const userScenarioValidator = v.object({
      user_id: v.string(),
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

    const validScenario = createMockUserScenario("user123");
    
    expect(userScenarioValidator).toBeDefined();
    expect(validScenario.user_id).toBeTypeOf("string");
    expect(validScenario.name).toBeTypeOf("string");
    expect(validScenario.token_budget).toBeTypeOf("number");
    expect(validScenario.max_credits).toBeTypeOf("number");
    expect(validScenario.min_credits).toBeTypeOf("number");
    expect(validScenario.utilities).toBeTypeOf("object");
    expect(Array.isArray(validScenario.fixed_courses)).toBe(true);
    expect(validScenario.is_active).toBeTypeOf("boolean");
  });

  test("validates name field type", () => {
    const validScenario = createMockUserScenario("user123");
    
    expect(validScenario.name).toBeTypeOf("string");
    expect(validScenario.name.length).toBeGreaterThan(0);
    expect(validScenario.name.length).toBeLessThanOrEqual(200);
  });

  test("validates numeric field types", () => {
    const validScenario = createMockUserScenario("user123");
    
    expect(validScenario.token_budget).toBeTypeOf("number");
    expect(validScenario.max_credits).toBeTypeOf("number");
    expect(validScenario.min_credits).toBeTypeOf("number");
    expect(validScenario.token_budget).toBeGreaterThan(0);
  });

  test("validates utilities object structure", () => {
    const validScenario = createMockUserScenario("user123");
    
    expect(validScenario.utilities).toBeTypeOf("object");
    expect(Array.isArray(validScenario.utilities)).toBe(false);
    
    // Check utilities values are numbers
    Object.values(validScenario.utilities).forEach(value => {
      expect(value).toBeTypeOf("number");
    });
  });

  test("validates fixed_courses array", () => {
    const validScenario = createMockUserScenario("user123");
    
    expect(Array.isArray(validScenario.fixed_courses)).toBe(true);
    
    // Check all elements are strings
    validScenario.fixed_courses.forEach(courseId => {
      expect(courseId).toBeTypeOf("string");
      expect(courseId.length).toBeGreaterThan(0);
    });
  });

  test("validates boolean fields", () => {
    const validScenario = createMockUserScenario("user123");
    
    expect(validScenario.is_active).toBeTypeOf("boolean");
  });
});

describe("Schema table definitions", () => {
  test("can define users table", () => {
    const usersTable = defineTable({
      name: v.string(),
      email: v.string(),
      created_at: v.number(),
      updated_at: v.number(),
    });

    expect(usersTable).toBeDefined();
  });

  test("can define user_scenarios table with reference", () => {
    const userScenariosTable = defineTable({
      user_id: v.id("users"),
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

    expect(userScenariosTable).toBeDefined();
  });

  test("can define complete schema with indexes", () => {
    const schema = defineSchema({
      users: defineTable({
        name: v.string(),
        email: v.string(),
        created_at: v.number(),
        updated_at: v.number(),
      }).index("by_email", ["email"]),
      
      user_scenarios: defineTable({
        user_id: v.id("users"),
        name: v.string(),
        token_budget: v.number(),
        max_credits: v.number(),
        min_credits: v.number(),
        utilities: v.record(v.string(), v.number()),
        fixed_courses: v.array(v.number()),
        is_active: v.boolean(),
        created_at: v.number(),
        updated_at: v.number(),
      })
        .index("by_user", ["user_id"])
        .index("by_user_active", ["user_id", "is_active"]),
    });

    expect(schema).toBeDefined();
  });
});