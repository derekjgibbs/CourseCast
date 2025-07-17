import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

import { query } from "./_generated/server";

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
