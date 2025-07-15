import { query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("courses").collect();
  },
});

export const listPaginated = query({
  args: { 
    paginationOpts: paginationOptsValidator,
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("courses");
    
    // Apply search filter if provided
    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();
      const allCourses = await query.collect();
      const filtered = allCourses.filter(course => 
        course.title.toLowerCase().includes(searchLower) ||
        course.course_id.toLowerCase().includes(searchLower) ||
        course.instructor.toLowerCase().includes(searchLower)
      );
      // Note: This is a simplified approach. For better performance with large datasets,
      // consider implementing server-side filtering with database indexes
      return {
        page: filtered.slice(0, args.paginationOpts.numItems || 10),
        isDone: filtered.length <= (args.paginationOpts.numItems || 10),
        continueCursor: null,
      };
    }
    
    return await query.paginate(args.paginationOpts);
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