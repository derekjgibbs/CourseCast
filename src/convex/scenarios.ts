import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";
import {
  CONSTRAINTS,
  createUserScenarioValidator,
  isValidCreditsRange,
  isValidScenarioName,
  updateUserScenarioValidator,
  validateUtilities,
  validateFixedCourses,
} from "./types";
import { getAuthUserId } from "@convex-dev/auth/server";

// Mutations

export const create = mutation({
  args: createUserScenarioValidator,
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("user not authenticated");

    const user = await ctx.db.get(userId);
    if (user === null) throw new ConvexError("unknown user");

    const now = BigInt(Date.now());
    return await ctx.db.insert("user_scenarios", {
      user_id: userId,
      name: args.name,
      token_budget: CONSTRAINTS.USER_SCENARIO.TOKEN_BUDGET_DEFAULT,
      min_credits: CONSTRAINTS.USER_SCENARIO.MIN_CREDITS_DEFAULT,
      max_credits: CONSTRAINTS.USER_SCENARIO.MAX_CREDITS_DEFAULT,
      utilities: {},
      fixed_courses: [],
      created_at: now,
      updated_at: now,
    });
  },
});

export const update = mutation({
  args: updateUserScenarioValidator,
  handler: async (ctx, updates) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("user not authenticated");

    const scenario = await ctx.db
      .query("user_scenarios")
      .withIndex("by_id", q => q.eq("_id", updates.id))
      .unique();
    if (scenario === null) throw new ConvexError("scenario not found");
    if (scenario.user_id !== userId)
      throw new ConvexError("scenario must belong to the authenticated user");

    if (typeof updates.name !== "undefined") {
      if (!isValidScenarioName(updates.name))
        throw new ConvexError(`scenario name of length ${updates.name.length} is too long`);
      scenario.name = updates.name;
    }

    if (typeof updates.token_budget !== "undefined") {
      if (updates.token_budget <= 0) throw new ConvexError("token budget must be positive");
      scenario.token_budget = updates.token_budget;
    }

    const newMinCredits = updates.min_credits ?? scenario.min_credits;
    const newMaxCredits = updates.max_credits ?? scenario.max_credits;
    if (!isValidCreditsRange(newMinCredits, newMaxCredits))
      throw new ConvexError("invalid credit range");

    scenario.min_credits = newMinCredits;
    scenario.max_credits = newMaxCredits;

    if (typeof updates.utilities !== "undefined") {
      if (!validateUtilities(updates.utilities)) throw new ConvexError("invalid utility values");
      scenario.utilities = updates.utilities;
    }

    if (typeof updates.fixed_courses !== "undefined") {
      if (!validateFixedCourses(updates.fixed_courses))
        throw new ConvexError("fixed courses must be non-empty strings");
      scenario.fixed_courses = updates.fixed_courses;
    }

    const now = BigInt(Date.now());
    scenario.updated_at = now;

    await ctx.db.patch(updates.id, scenario);
  },
});

export const remove = mutation({
  args: { id: v.id("user_scenarios") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("user not authenticated");

    const scenario = await ctx.db
      .query("user_scenarios")
      .withIndex("by_id", q => q.eq("_id", id))
      .unique();
    if (scenario === null) throw new ConvexError("scenario not found");
    if (scenario.user_id !== userId)
      throw new ConvexError("scenario must belong to the authenticated user");

    await ctx.db.delete(id);
  },
});

// Queries

export const get = query({
  args: { id: v.id("user_scenarios") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("user not authenticated");

    const scenario = await ctx.db
      .query("user_scenarios")
      .withIndex("by_id", q => q.eq("_id", id))
      .unique();
    if (scenario === null) throw new ConvexError("scenario not found");

    const { user_id, ...rest } = scenario;
    if (user_id !== userId) throw new ConvexError("scenario must belong to the authenticated user");

    return rest;
  },
});

export const list = query({
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("user not authenticated");

    return await ctx.db
      .query("user_scenarios")
      .withIndex("by_user_id", q => q.eq("user_id", userId))
      .order("desc")
      .collect();
  },
});
