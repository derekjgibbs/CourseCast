import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedUsers = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if users already exist
    const existingUsers = await ctx.db.query("users").collect();
    if (existingUsers.length > 0) {
      console.log(`Users already exist (${existingUsers.length} users found). Skipping seed.`);
      return { message: "Users already exist", count: existingUsers.length };
    }

    const now = Date.now();
    const sampleUsers = [
      {
        name: "Alice Johnson",
        email: "alice.johnson@mba.example.edu",
        created_at: now,
        updated_at: now,
      },
      {
        name: "Bob Smith",
        email: "bob.smith@mba.example.edu", 
        created_at: now,
        updated_at: now,
      },
      {
        name: "Carol Davis",
        email: "carol.davis@mba.example.edu",
        created_at: now,
        updated_at: now,
      },
      {
        name: "David Wilson",
        email: "david.wilson@mba.example.edu",
        created_at: now,
        updated_at: now,
      },
      {
        name: "Emma Brown",
        email: "emma.brown@mba.example.edu",
        created_at: now,
        updated_at: now,
      },
    ];

    const userIds = [];
    for (const userData of sampleUsers) {
      const userId = await ctx.db.insert("users", userData);
      userIds.push(userId);
      console.log(`Created user: ${userData.name} (${userId})`);
    }

    console.log(`Successfully seeded ${userIds.length} users`);
    return { 
      message: `Successfully created ${userIds.length} users`, 
      count: userIds.length,
      userIds 
    };
  },
});

export const seedUserScenarios = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all users
    const users = await ctx.db.query("users").collect();
    if (users.length === 0) {
      throw new Error("No users found. Please run seedUsers first.");
    }

    // Check if scenarios already exist
    const existingScenarios = await ctx.db.query("user_scenarios").collect();
    if (existingScenarios.length > 0) {
      console.log(`User scenarios already exist (${existingScenarios.length} scenarios found). Skipping seed.`);
      return { message: "User scenarios already exist", count: existingScenarios.length };
    }

    const now = Date.now();
    const scenarioTemplates = [
      {
        name: "Conservative Strategy",
        token_budget: 3500,
        max_credits: 6.0,
        min_credits: 4.0,
        utilities: {},
        fixed_courses: [],
      },
      {
        name: "Balanced Approach", 
        token_budget: 4500,
        max_credits: 7.5,
        min_credits: 5.0,
        utilities: {},
        fixed_courses: [],
      },
      {
        name: "Aggressive Strategy",
        token_budget: 6000,
        max_credits: 9.0,
        min_credits: 6.0,
        utilities: {},
        fixed_courses: [],
      },
    ];

    const scenarioIds = [];
    
    // Create scenarios for first 3 users
    for (let i = 0; i < Math.min(3, users.length); i++) {
      const user = users[i];
      const template = scenarioTemplates[i];
      
      const scenarioId = await ctx.db.insert("user_scenarios", {
        user_id: user._id,
        name: template.name,
        token_budget: template.token_budget,
        max_credits: template.max_credits,
        min_credits: template.min_credits,
        utilities: template.utilities,
        fixed_courses: template.fixed_courses,
        is_active: true, // Set as active scenario
        created_at: now,
        updated_at: now,
      });
      
      scenarioIds.push(scenarioId);
      console.log(`Created scenario "${template.name}" for user ${user.name} (${scenarioId})`);
    }

    console.log(`Successfully seeded ${scenarioIds.length} user scenarios`);
    return { 
      message: `Successfully created ${scenarioIds.length} user scenarios`,
      count: scenarioIds.length,
      scenarioIds 
    };
  },
});

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting full database seed...");
    
    // Seed users first
    const userResult = await ctx.runMutation("seed:seedUsers", {});
    console.log("User seeding result:", userResult);
    
    // Then seed user scenarios
    const scenarioResult = await ctx.runMutation("seed:seedUserScenarios", {});
    console.log("Scenario seeding result:", scenarioResult);
    
    return {
      users: userResult,
      scenarios: scenarioResult,
      message: "Database seeding completed successfully"
    };
  },
});

export const clearData = mutation({
  args: { confirm: v.boolean() },
  handler: async (ctx, args) => {
    if (!args.confirm) {
      throw new Error("Must set confirm=true to clear all data");
    }

    // Delete all user scenarios first (due to foreign key constraint)
    const scenarios = await ctx.db.query("user_scenarios").collect();
    for (const scenario of scenarios) {
      await ctx.db.delete(scenario._id);
    }

    // Delete all users
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.delete(user._id);
    }

    console.log(`Cleared ${scenarios.length} scenarios and ${users.length} users`);
    return { 
      message: `Cleared ${scenarios.length} scenarios and ${users.length} users`,
      scenariosDeleted: scenarios.length,
      usersDeleted: users.length
    };
  },
});