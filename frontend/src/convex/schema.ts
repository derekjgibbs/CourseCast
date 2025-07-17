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
    course_id: v.string(),
    title: v.string(),
    department: v.string(),
    instructor: v.string(),
    days: v.string(),
    start_time: v.string(),
    end_time: v.string(),
    term: v.string(),
    credits: v.number(),
    price_forecast: v.number(),
    price_std_dev: v.number(),
    course_quality: v.number(),
    instructor_quality: v.number(),
    difficulty: v.number(),
    work_required: v.number(),
  })
    .index("by_course_id", ["course_id"])
    .index("by_department", ["department"]),
});
