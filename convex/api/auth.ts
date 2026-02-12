import { query } from "../_generated/server";
import { authComponent } from "../lib/auth";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});
