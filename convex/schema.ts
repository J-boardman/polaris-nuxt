import { defineSchema } from "convex/server";
import * as db from "./db";

export default defineSchema({
  projects: db.projects.projectsTable,
});
