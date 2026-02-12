import { customMutation, customCtx, type CustomCtx } from "convex-helpers/server/customFunctions";
import { mutation } from "../_generated/server";
import { ConvexError } from "convex/values";

export const userMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new ConvexError("Authentication required");
    return { user };
  })
);

export type UserMutationCtx = CustomCtx<typeof userMutation>;