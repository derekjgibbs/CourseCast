import { ConvexError, v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

import { mutation, query } from "./_generated/server";
import { createUserValidator, updateUserValidator, UserDoc, UserId } from "./types";

// Mutations

export const createUser = mutation({
  args: createUserValidator,
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const email = args.email.trim();

    // Validate required fields
    if (name.length === 0) throw new ConvexError("name is required and cannot be empty");
    if (!email.includes("@")) throw new ConvexError("valid email address is required");

    // Check for email uniqueness (case insensitive)
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", q => q.eq("email", email))
      .unique();
    if (existingUser !== null) throw new ConvexError("A user with this email already exists");

    // Insert user
    return await ctx.db.insert("users", {
      name: name.trim(),
      email: email.trim(),
    });
  },
});

export const updateUser = mutation({
  args: {
    id: v.id("users"),
    updates: updateUserValidator,
  },
  handler: async (ctx, args) => {
    const { id, updates } = args;

    // Find existing user
    const existingUser = await ctx.db.get(id);
    if (!existingUser) {
      throw new ConvexError("User not found");
    }

    // Validate updates
    const updateData: Partial<UserDoc> = {};

    if (updates.name !== undefined) {
      if (!updates.name || updates.name.trim().length === 0) {
        throw new ConvexError("Name cannot be empty");
      }
      updateData.name = updates.name.trim();
    }

    if (updates.email !== undefined) {
      if (!updates.email || !updates.email.includes("@"))
        throw new ConvexError("Valid email address is required");

      // Check for email uniqueness (excluding current user)
      const normalizedEmail = updates.email.toLowerCase();
      if (normalizedEmail !== existingUser.email) {
        const emailConflict = await ctx.db
          .query("users")
          .withIndex("email", q => q.eq("email", normalizedEmail))
          .unique();
        if (emailConflict !== null) throw new ConvexError("A user with this email already exists");
      }
      updateData.email = normalizedEmail;
    }

    // Apply updates
    await ctx.db.patch(id, updateData);
    return id;
  },
});

export const deleteUser = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const { id } = args;

    // Check if user exists
    const user = await ctx.db.get(id as UserId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    // Delete all user scenarios first (cascade delete)
    const userScenarios = await ctx.db
      .query("user_scenarios")
      .withIndex("by_user", q => q.eq("user_id", id as UserId))
      .collect();

    for (const scenario of userScenarios) {
      await ctx.db.delete(scenario._id);
    }

    // Delete the user
    await ctx.db.delete(id as UserId);

    return { success: true };
  },
});

// Queries

export const getAuthenticatedUser = query({
  handler: async ctx => {
    const id = await getAuthUserId(ctx);
    if (id === null) throw new ConvexError("unknown session");

    const user = await ctx.db
      .query("users")
      .withIndex("by_id", q => q.eq("_id", id))
      .unique();
    if (user === null) throw new ConvexError("unknown user");

    return user;
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const { email } = args;

    if (!email || !email.includes("@")) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("email", q => q.eq("email", email))
      .unique();

    return user;
  },
});

export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => await ctx.db.get(id),
});

export const list = query({
  args: {},
  handler: async ctx => await ctx.db.query("users").order("desc").collect(),
});
