import { defineTable } from "convex/server";
import { ConvexError, v } from "convex/values";
import type { UserQueryCtx } from "../lib/customQueries";
import type { UserMutationCtx } from "../lib/customMutations";
import type { Id } from "../_generated/dataModel";
import type { PaginationOptions } from "convex/server";

const projectFields = {
  name: v.string(),
  ownerId: v.string(),
  importStatus: v.optional(
    v.union(
      v.literal("importing"),
      v.literal("completed"),
      v.literal("failed"),
    ),
  ),
  exportStatus: v.optional(
    v.union(
      v.literal("exporting"),
      v.literal("completed"),
      v.literal("failed"),
    ),
  ),
  exportRepoUrl: v.optional(v.string()),
};

export const projectsTable = defineTable(projectFields).index("by_ownerId", [
  "ownerId",
]);

export async function getUserProjects(ctx: UserQueryCtx | UserMutationCtx) {
  const projects = await ctx.db
    .query("projects")
    .withIndex("by_ownerId", (q) => q.eq("ownerId", ctx.user.subject))
    .collect();
  return projects;
}

export async function getUserProject(
  ctx: UserQueryCtx | UserMutationCtx,
  projectId: Id<"projects">,
) {
  const project = await ctx.db.get(projectId);
  if (!project) throw new ConvexError("Project not found");
  if (project.ownerId !== ctx.user.subject)
    throw new ConvexError("Unauthorized");
  return project;
}

export async function getPaginatedProjects(
  ctx: UserQueryCtx,
  paginationOpts: PaginationOptions,
) {
  return await ctx.db
    .query("projects")
    .withIndex("by_ownerId", (q) => q.eq("ownerId", ctx.user.subject))
    .paginate(paginationOpts);
}

export async function createProject(ctx: UserMutationCtx, name: string) {
  return await ctx.db.insert("projects", {
    name,
    ownerId: ctx.user.subject,
  });
}

export async function updateProject(
  ctx: UserMutationCtx,
  projectId: Id<"projects">,
  name: string,
) {
  const project = await getUserProject(ctx, projectId);
  return await ctx.db.patch(project._id, { name });
}

export async function removeProject(
  ctx: UserMutationCtx,
  projectId: Id<"projects">,
) {
  const project = await getUserProject(ctx, projectId);
  return await ctx.db.delete(project._id);
}
