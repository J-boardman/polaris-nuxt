import { userMutation } from "../lib/customMutations";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { workflowManager } from "../lib/workflowManager";

export const getBookRecommendation = userMutation({
  args: {
    bookTitle: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Getting book recommendation for book:", args.bookTitle);
    await ctx.scheduler.runAfter(0, internal.agents.books.getBookRecommendation, {
      bookTitle: args.bookTitle,
    });
  },
});

export const kickoffGetBookRecommendationWorkflow = userMutation({
  args: {
    bookTitle: v.string(),
  },
  handler: async (ctx, args) => {
    const workflowId = await workflowManager.start(
      ctx,
      internal.agents.books.getBookRecommendationWorkflow,
      { bookTitle: args.bookTitle, userId: ctx.user.subject },
    );

    console.log("Workflow started with ID:", workflowId);
  },
});