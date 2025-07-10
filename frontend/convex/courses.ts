import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("courses").collect();
  },
});

export const getById = query({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByDepartment = query({
  args: { department: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_department", (q) => q.eq("department", args.department))
      .collect();
  },
});

export const searchCourses = query({
  args: { 
    searchTerm: v.optional(v.string()),
    department: v.optional(v.string()),
    instructor: v.optional(v.string()),
    term: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let courses = await ctx.db.query("courses").collect();
    
    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();
      courses = courses.filter(course => 
        course.title.toLowerCase().includes(searchLower) ||
        course.course_id.toLowerCase().includes(searchLower) ||
        course.instructor.toLowerCase().includes(searchLower)
      );
    }
    
    if (args.department) {
      courses = courses.filter(course => course.department === args.department);
    }
    
    if (args.instructor) {
      courses = courses.filter(course => course.instructor === args.instructor);
    }
    
    if (args.term) {
      courses = courses.filter(course => course.term === args.term);
    }
    
    return courses;
  },
});