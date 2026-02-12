import { v } from "convex/values";
import * as db from "../db";
import { userMutation } from "../lib/customMutations";
import { userQuery } from "../lib/customQueries";

export const get = userQuery({
  args: {},
  handler: async (ctx) => {
    return await db.tasks.getUserTasks(ctx);
  },
});

export const create = userMutation({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    return await db.tasks.createTask(ctx, args.text);
  },
});

export const toggle = userMutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    return await db.tasks.toggleTask(ctx, args.taskId);
  },
});

export const remove = userMutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    return await db.tasks.removeTask(ctx, args.taskId);
  },
});