import { components, internal } from "../_generated/api";
import { Agent, createThread, saveMessage } from "@convex-dev/agent";
import { google } from "@ai-sdk/google";
import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { workflowManager } from "../lib/workflowManager";
import { z } from "zod";

export const bookAgent = new Agent(components.agent, {
  name: "Book Agent",
  languageModel: google.chat("gemini-2.5-flash"),
  instructions:
    "You are a helpful book recommendation agent that can recommend books to users.",
  maxSteps: 3,
  usageHandler: async (ctx, args) => {
    console.log(`Usage:`, args);
  },
});

export const getBookRecommendation = internalAction({
  args: { bookTitle: v.string() },
  handler: async (ctx, { bookTitle }) => {
    console.log("Getting book recommendation for book:", bookTitle);
    const threadId = await createThread(ctx, components.agent);
    const prompt = `What's a good book to read if I liked ${bookTitle}? Please respond in 1-2 sentences.`;
    const result = await bookAgent.generateText(
      ctx,
      { threadId },
      { prompt: prompt as never },
    );
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
    await saveMessage(step, components.agent, {
      threadId,
      prompt: bookTitle,
    });
    // For functions that require `fetch` or otherwise need an action, run them
    // as steps explicitly.
    const results = await step.runAction(
      internal.node.firecrawl.searchFirecrawl,
      { searchQuery: `Books similar to ${bookTitle}`, limit: 1 },
      { retry: true },
    );

    console.log("Results:", results);

    const formattedResults = results?.web
      ?.map(
        (result) =>
          // @ts-expect-error - TOOD: Figure out how to type Firecrawl results
          `- ${result.title} \n ${result.description} \n ${result.markdown}`,
      )
      .join("\n");

    const finalPrompt = `What book would you recommend to read next? Please respond in 1-2 sentences. Here are some results: \n ${formattedResults}`;

    const { object } = await step.runAction(
      internal.agents.books.getStructuredBookRecommendation,
      {
        userId,
        prompt: finalPrompt,
      },
    );

    console.log(object);
  },
});

// Similar to thread.generateObject / thread.streamObject
export const getStructuredBookRecommendation = bookAgent.asObjectAction({
  schema: z.object({
    bookTitle: z.string().describe("The title of the book to recommend."),
    bookDescription: z
      .string()
      .describe("The description of the book to recommend."),
  }),
});
