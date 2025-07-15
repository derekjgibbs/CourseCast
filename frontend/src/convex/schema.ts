import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
    fixed_courses: v.array(v.string()),
    is_active: v.boolean(),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_user", ["user_id"])
    .index("by_user_active", ["user_id", "is_active"])
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
