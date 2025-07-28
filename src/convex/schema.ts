import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  user_scenarios: defineTable({
    user_id: v.id("users"),
    name: v.string(),
    token_budget: v.int64(),
    /** @deprecated */
    min_credits: v.number(),
    max_credits: v.number(),
    utilities: v.record(v.string(), v.int64()),
    fixed_courses: v.array(v.string()),
    created_at: v.int64(),
    updated_at: v.int64(),
  })
    .index("by_user_id", ["user_id"])
    .index("by_created_at", ["created_at"]),
});
