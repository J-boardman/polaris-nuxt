import { defineTable } from "convex/server";
import { ConvexError, v } from "convex/values";
import type { UserQueryCtx } from "../lib/customQueries";
import type { UserMutationCtx } from "../lib/customMutations";
import type { Id } from "../_generated/dataModel";

export const tasksFields = {
  text: v.string(),
  isCompleted: v.boolean(),
  createdBy: v.optional(v.string())
}

export const tasksTable = defineTable(tasksFields).index("by_createdBy", ["createdBy"]);

export async function getUserTasks(ctx: UserQueryCtx | UserMutationCtx) {
  const tasks = await ctx.db.query("tasks").withIndex("by_createdBy", (q) => q.eq("createdBy", ctx.user.subject)).collect();
  return tasks;
}

export async function getUserTask(ctx: UserQueryCtx | UserMutationCtx, taskId: Id<"tasks">) {
  const task = await ctx.db.get("tasks", taskId);
  if (!task) throw new ConvexError("Task not found");
  if (task.createdBy !== ctx.user.subject) throw new ConvexError("Unauthorized");
  return task;
}

export async function createTask(ctx: UserMutationCtx, text: string) {
  return await ctx.db.insert("tasks", {
    text,
    isCompleted: false,
    createdBy: ctx.user.subject,
  });
}

export async function toggleTask(ctx: UserMutationCtx, taskId: Id<"tasks">) {
  const task = await getUserTask(ctx, taskId);
  return await ctx.db.patch(task._id, {
    isCompleted: !task.isCompleted,
  });
}

export async function removeTask(ctx: UserMutationCtx, taskId: Id<"tasks">) {
  const task = await getUserTask(ctx, taskId);
  return await ctx.db.delete(task._id);
}