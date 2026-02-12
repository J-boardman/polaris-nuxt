import { v } from "convex/values";
import * as db from "../db";
import { userMutation } from "../lib/customMutations";
import { userQuery } from "../lib/customQueries";
import { paginationOptsValidator } from "convex/server";

export const get = userQuery({
  args: {},
  handler: async (ctx) => {
    return await db.projects.getUserProjects(ctx);
  },
});

export const getPaginated = userQuery({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await db.projects.getPaginatedProjects(ctx, args.paginationOpts);
  },
});

export const create = userMutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await db.projects.createProject(ctx, args.name);
  },
});

export const update = userMutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await db.projects.updateProject(ctx, args.projectId, args.name);
  },
});

export const remove = userMutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    return await db.projects.removeProject(ctx, args.projectId);
  },
});
