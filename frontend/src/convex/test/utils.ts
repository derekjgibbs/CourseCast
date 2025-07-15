import { v } from "convex/values";

export const createMockUser = () => ({
  name: "Test User",
  email: "test@example.com",
  created_at: Date.now(),
  updated_at: Date.now(),
});

export const createMockUserScenario = (userId: string) => ({
  user_id: userId,
  name: "Test Scenario",
  token_budget: 4500,
  max_credits: 5.0,
  min_credits: 0.0,
  utilities: { "ACCT7900401": 50, "REAL8400401": 60, "FINC8010001": 70 },
  fixed_courses: ["ACCT7900401", "REAL8400401", "FINC8010001"],
  is_active: true,
  created_at: Date.now(),
  updated_at: Date.now(),
});

export const createInvalidScenario = () => ({
  user_id: "invalid-id",
  name: "X".repeat(201), // Too long
  token_budget: -100, // Invalid
  max_credits: 15.0, // Too high
  min_credits: -5.0, // Too low
  utilities: { "INVALID001": 150 }, // Invalid utility value
  fixed_courses: [""], // Invalid empty course ID
  is_active: "not-boolean",
  created_at: "invalid-date",
  updated_at: "invalid-date",
});