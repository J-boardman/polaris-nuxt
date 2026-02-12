import { components, internal } from "../_generated/api";
import { Agent, createThread, saveMessage } from "@convex-dev/agent";
import { google } from "@ai-sdk/google";
import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { workflowManager } from "../lib/workflowManager";

export const booksAgent = new Agent(components.agent, {
  name: "Weather Agent",
  languageModel: google.chat("gemini-2.5-flash"),
  instructions: "You are a helpful book recommendation agent that can recommend books to users.",
  maxSteps: 3,
});

export const getBookRecommendation = internalAction({
  args: { bookTitle: v.string() },
  handler: async (ctx, { bookTitle }) => {
    console.log("Getting book recommendation for book:", bookTitle);
    const threadId = await createThread(ctx, components.agent);
    const prompt = `What's a good book to read if I liked ${bookTitle}? Please respond in 1-2 sentences.`;
    const result = await booksAgent.generateText(ctx, { threadId }, { prompt: prompt as never });
    console.log(result);
    console.log(result.text);
    return result.text;
  },
});



export const getBookRecommendationWorkflow = workflowManager.define({
  args: { bookTitle: v.string(), userId: v.string() },
  handler: async (step, { bookTitle, userId }) => {
    // Some functions can be called directly from a workflow, passing `step`
    // instead of `ctx`. This doesn't work for anything action-related.
    const threadId = await createThread(step, components.agent, {
      userId,
      title: bookTitle,
    });

    // Under the hood, these functions are calling step.runMutation,
    // so saving the message is a workflow step. The equivalent would be to call
    // step.runMutation with your own mutation that called saveMessage with ctx.
    const { messageId } = await saveMessage(step, components.agent, {
      threadId,
      prompt: bookTitle,
    });
    // For functions that require `fetch` or otherwise need an action, run them
    // as steps explicitly.
    const results = await step.runAction(
      internal.node.firecrawl.searchFirecrawl,
      { searchQuery: `Books similar to ${bookTitle}` },
      { retry: true },
    );
    console.log(results);
  },
});