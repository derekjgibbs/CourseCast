import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { 
  createUserScenarioValidator, 
  updateUserScenarioValidator,
  UserScenarioDoc,
  UserScenarioId,
  UserId,
  isValidCreditsRange,
  isValidScenarioName,
  validateUtilities,
  validateFixedCourses,
  getDefaultUserScenario,
  CONSTRAINTS
} from "./types";

// Mutations

export const createUserScenario = mutation({
  args: createUserScenarioValidator,
  handler: async (ctx, args) => {
    const { user_id, name } = args;
    
    // Validate user exists
    const user = await ctx.db.get(user_id);
    if (!user) {
      throw new ConvexError("User not found");
    }
    
    // Validate scenario name
    if (!isValidScenarioName(name)) {
      throw new ConvexError(`Scenario name must be between 1 and ${CONSTRAINTS.USER_SCENARIO.NAME_MAX_LENGTH} characters`);
    }
    
    // Create scenario with defaults or provided values
    const defaultScenario = getDefaultUserScenario(user_id, name);
    
    const scenarioData = {
      ...defaultScenario,
      token_budget: args.token_budget ?? defaultScenario.token_budget,
      max_credits: args.max_credits ?? defaultScenario.max_credits,
      min_credits: args.min_credits ?? defaultScenario.min_credits,
      utilities: args.utilities ?? defaultScenario.utilities,
      fixed_courses: args.fixed_courses ?? defaultScenario.fixed_courses,
    };
    
    // Validate credit range
    if (!isValidCreditsRange(scenarioData.min_credits, scenarioData.max_credits)) {
      throw new ConvexError(
        `Credits must be between ${CONSTRAINTS.USER_SCENARIO.MIN_CREDITS_LIMIT} and ${CONSTRAINTS.USER_SCENARIO.MAX_CREDITS_LIMIT}, with min <= max`
      );
    }
    
    // Validate token budget
    if (scenarioData.token_budget <= 0) {
      throw new ConvexError("Token budget must be greater than 0");
    }
    
    // Validate utilities
    if (!validateUtilities(scenarioData.utilities)) {
      throw new ConvexError(
        `Utility values must be between ${CONSTRAINTS.COURSE_UTILITY.MIN_VALUE} and ${CONSTRAINTS.COURSE_UTILITY.MAX_VALUE}`
      );
    }
    
    // Validate fixed courses
    if (!validateFixedCourses(scenarioData.fixed_courses)) {
      throw new ConvexError("Fixed courses must be non-empty strings");
    }
    
    // If this is the first scenario for the user, make it active
    const existingScenarios = await ctx.db
      .query("user_scenarios")
      .withIndex("by_user", (q) => q.eq("user_id", user_id))
      .collect();
    
    const isFirstScenario = existingScenarios.length === 0;
    
    // Insert scenario
    const scenarioId = await ctx.db.insert("user_scenarios", {
      ...scenarioData,
      is_active: isFirstScenario,
    });
    
    return scenarioId;
  },
});

export const updateUserScenario = mutation({
  args: {
    id: v.id("user_scenarios"),
    updates: updateUserScenarioValidator,
  },
  handler: async (ctx, args) => {
    const { id, updates } = args;
    
    // Find existing scenario
    const existingScenario = await ctx.db.get(id as UserScenarioId);
    if (!existingScenario) {
      throw new ConvexError("User scenario not found");
    }
    
    // Validate updates
    const updateData: Partial<UserScenarioDoc> = {};
    
    if (updates.name !== undefined) {
      if (!isValidScenarioName(updates.name)) {
        throw new ConvexError(`Scenario name must be between 1 and ${CONSTRAINTS.USER_SCENARIO.NAME_MAX_LENGTH} characters`);
      }
      updateData.name = updates.name;
    }
    
    if (updates.token_budget !== undefined) {
      if (updates.token_budget <= 0) {
        throw new ConvexError("Token budget must be greater than 0");
      }
      updateData.token_budget = updates.token_budget;
    }
    
    const newMinCredits = updates.min_credits ?? existingScenario.min_credits;
    const newMaxCredits = updates.max_credits ?? existingScenario.max_credits;
    
    if (!isValidCreditsRange(newMinCredits, newMaxCredits)) {
      throw new ConvexError(
        `Credits must be between ${CONSTRAINTS.USER_SCENARIO.MIN_CREDITS_LIMIT} and ${CONSTRAINTS.USER_SCENARIO.MAX_CREDITS_LIMIT}, with min <= max`
      );
    }
    
    if (updates.max_credits !== undefined) {
      updateData.max_credits = updates.max_credits;
    }
    
    if (updates.min_credits !== undefined) {
      updateData.min_credits = updates.min_credits;
    }
    
    if (updates.utilities !== undefined) {
      if (!validateUtilities(updates.utilities)) {
        throw new ConvexError(
          `Utility values must be between ${CONSTRAINTS.COURSE_UTILITY.MIN_VALUE} and ${CONSTRAINTS.COURSE_UTILITY.MAX_VALUE}`
        );
      }
      updateData.utilities = updates.utilities;
    }
    
    if (updates.fixed_courses !== undefined) {
      if (!validateFixedCourses(updates.fixed_courses)) {
        throw new ConvexError("Fixed courses must be non-empty strings");
      }
      updateData.fixed_courses = updates.fixed_courses;
    }
    
    if (updates.is_active !== undefined) {
      updateData.is_active = updates.is_active;
    }
    
    // Update timestamp
    updateData.updated_at = Date.now();
    
    // Apply updates
    await ctx.db.patch(id as UserScenarioId, updateData);
    
    return id;
  },
});

export const deleteUserScenario = mutation({
  args: { id: v.id("user_scenarios") },
  handler: async (ctx, args) => {
    const { id } = args;
    
    // Check if scenario exists
    const scenario = await ctx.db.get(id as UserScenarioId);
    if (!scenario) {
      throw new ConvexError("User scenario not found");
    }
    
    // Delete the scenario
    await ctx.db.delete(id as UserScenarioId);
    
    // If this was an active scenario, we might want to activate another one
    // But for now, we'll just leave the user with no active scenario
    
    return { success: true };
  },
});

export const setActiveUserScenario = mutation({
  args: { 
    id: v.id("user_scenarios"),
    user_id: v.id("users") 
  },
  handler: async (ctx, args) => {
    const { id, user_id } = args;
    
    // Check if scenario exists and belongs to the user
    const scenario = await ctx.db.get(id as UserScenarioId);
    if (!scenario) {
      throw new ConvexError("User scenario not found");
    }
    
    if (scenario.user_id !== user_id) {
      throw new ConvexError("Scenario does not belong to this user");
    }
    
    // Deactivate all other scenarios for this user
    const userScenarios = await ctx.db
      .query("user_scenarios")
      .withIndex("by_user", (q) => q.eq("user_id", user_id as UserId))
      .collect();
    
    for (const userScenario of userScenarios) {
      if (userScenario._id !== id) {
        await ctx.db.patch(userScenario._id, { 
          is_active: false,
          updated_at: Date.now()
        });
      }
    }
    
    // Activate the target scenario
    await ctx.db.patch(id as UserScenarioId, { 
      is_active: true,
      updated_at: Date.now()
    });
    
    return { success: true };
  },
});

// Queries

export const getUserScenarios = query({
  args: { 
    user_id: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { user_id, limit = 50 } = args;
    
    if (!user_id || user_id.length === 0) {
      return [];
    }
    
    const scenarios = await ctx.db
      .query("user_scenarios")
      .withIndex("by_user", (q) => q.eq("user_id", user_id as UserId))
      .order("desc")
      .take(limit);
    
    return scenarios;
  },
});

export const getActiveUserScenario = query({
  args: { user_id: v.id("users") },
  handler: async (ctx, args) => {
    const { user_id } = args;
    
    if (!user_id || user_id.length === 0) {
      return null;
    }
    
    const activeScenario = await ctx.db
      .query("user_scenarios")
      .withIndex("by_user_active", (q) => 
        q.eq("user_id", user_id as UserId).eq("is_active", true)
      )
      .first();
    
    return activeScenario;
  },
});