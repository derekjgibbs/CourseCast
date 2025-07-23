import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  user_scenarios: defineTable({
    user_id: v.id("users"),
    name: v.string(),
    token_budget: v.int64(),
    max_credits: v.number(),
    min_credits: v.number(),
    utilities: v.record(v.string(), v.int64()),
    fixed_courses: v.array(v.string()),
    created_at: v.int64(),
    updated_at: v.int64(),
  })
    .index("by_user_id", ["user_id"])
    .index("by_created_at", ["created_at"]),
  courses: defineTable({
    term: v.string(),
    semester: v.string(),
    course_code: v.string(),
    title: v.string(),
    department: v.string(),
    instructors: v.array(v.string()),
    days: v.string(),
    start_date: v.string(),
    end_date: v.string(),
    days_code: v.string(),
    start_time: v.string(),
    end_time: v.string(),
    start_category: v.string(),
    credits: v.number(),
    capacity: v.int64(),
    aggregated_capacity: v.int64(),
    truncated_price_prediction: v.int64(),
    price_prediction_residual_mean: v.int64(),
    price_prediction_residual_std_dev: v.int64(),
    truncated_z_scores: v.array(v.int64()),
  }),
});
