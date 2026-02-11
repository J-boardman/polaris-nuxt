import { createAuthClient } from "better-auth/vue";
import {
  convexClient,
  crossDomainClient,
} from "@convex-dev/better-auth/client/plugins";

export type AuthClient = ReturnType<typeof createAuthClient<{
  plugins: [ReturnType<typeof convexClient>, ReturnType<typeof crossDomainClient>];
}>>;

let authClientInstance: AuthClient | null = null;

/**
 * Create the auth client with cookie-based storage.
 * Called by the plugin to initialize with SSR-compatible storage.
 */
export function initAuthClient(storage: {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem?: (key: string) => void;
}): AuthClient {
  const config = useRuntimeConfig();
  const convexSiteUrl = config.public.convexSiteUrl as string;

  authClientInstance = createAuthClient({
    baseURL: convexSiteUrl,
    plugins: [
      convexClient(),
      crossDomainClient({ storage, disableCache: true }),
    ],
  });

  return authClientInstance;
}

/**
 * Get the auth client instance.
 * Must be called after the plugin has initialized the client.
 */
export function getAuthClient(): AuthClient {
  if (!authClientInstance) {
    throw new Error(
      'Auth client not initialized. Make sure the convex-better-auth plugin has run.'
    );
  }
  return authClientInstance;
}
