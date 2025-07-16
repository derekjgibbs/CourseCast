import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { createUserValidator, updateUserValidator, UserDoc, UserId } from "./types";

// Mutations

export const createUser = mutation({
  args: createUserValidator,
  handler: async (ctx, args) => {
    const { name, email } = args;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      throw new ConvexError("Name is required and cannot be empty");
    }

    if (!email || !email.includes("@")) {
      throw new ConvexError("Valid email address is required");
    }

    // Check for email uniqueness (case insensitive)
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", email.toLowerCase()))
      .first();

    if (existingUser) {
      throw new ConvexError("A user with this email already exists");
    }

    // Create timestamps
    const now = Date.now();

    // Insert user
    const userId = await ctx.db.insert("users", {
      name: name.trim(),
      email: email.toLowerCase(),
      created_at: now,
      updated_at: now,
    });

    return userId;
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
    const existingUser = await ctx.db.get(id as UserId);
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
      if (!updates.email || !updates.email.includes("@")) {
        throw new ConvexError("Valid email address is required");
      }

      // Check for email uniqueness (excluding current user)
      const normalizedEmail = updates.email.toLowerCase();
      if (normalizedEmail !== existingUser.email) {
        const emailConflict = await ctx.db
          .query("users")
          .withIndex("by_email", q => q.eq("email", normalizedEmail))
          .first();

        if (emailConflict) {
          throw new ConvexError("A user with this email already exists");
        }
      }

      updateData.email = normalizedEmail;
    }

    // Update timestamp
    updateData.updated_at = Date.now();

    // Apply updates
    await ctx.db.patch(id as UserId, updateData);

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

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const { email } = args;

    if (!email || !email.includes("@")) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", email.toLowerCase()))
      .first();

    return user;
  },
});

export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const { id } = args;

    if (!id || id.length === 0) {
      return null;
    }

    try {
      const user = await ctx.db.get(id as UserId);
      return user;
    } catch {
      return null;
    }
  },
});

export const list = query({
  args: {},
  handler: async ctx => {
    const users = await ctx.db.query("users").order("desc").collect();

    return users;
  },
});
