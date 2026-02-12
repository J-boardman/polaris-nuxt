import { customQuery, customCtx, type CustomCtx } from "convex-helpers/server/customFunctions";
import { query } from "../_generated/server";
import { ConvexError } from "convex/values";

// Use `userQuery` instead of `query` to add this behavior.
export const userQuery = customQuery(
  query, // The base function we're extending
  // Here we're using a `customCtx` helper because our modification
  // only modifies the `ctx` argument to the function.
  customCtx(async (ctx) => {
    // Look up the logged in user
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new ConvexError("Authentication required");
    // Pass in a user to use in evaluating rules,
    // which validate data access at access / write time.
    return { user };
  })
);

export type UserQueryCtx = CustomCtx<typeof userQuery>;