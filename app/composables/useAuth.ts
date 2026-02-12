import { computed } from "vue";
import { getAuthClient } from "~/lib/auth-client";
import type { AuthSessionData } from "~/plugins/convex-better-auth";

const AUTH_STATE_KEY = "auth-session";

export function useAuth() {
  const authClient = getAuthClient();

  const ssrAuthState = useState<AuthSessionData>(AUTH_STATE_KEY, () => ({
    user: null,
    session: null,
  }));

  // Only call useSession() on the client — nanostores don't work during SSR
  const betterAuthSession = import.meta.client ? authClient.useSession() : null;

  const session = computed(() => {
    if (import.meta.server) return ssrAuthState.value.session;
    return (
      betterAuthSession?.value?.data?.session ?? ssrAuthState.value.session
    );
  });

  const user = computed(() => {
    if (import.meta.server) return ssrAuthState.value.user;
    return betterAuthSession?.value?.data?.user ?? ssrAuthState.value.user;
  });

  const isLoading = computed(() => {
    if (import.meta.server) return false;
    if (ssrAuthState.value.session) return false;
    return betterAuthSession?.value?.isPending ?? false;
  });

  const isAuthenticated = computed(() => !!session.value);

  const signOut = async () => {
    await authClient.signOut();
    ssrAuthState.value = { user: null, session: null };
    await navigateTo("/sign-in", { replace: true });
  };

  return {
    session,
    user,
    isLoading,
    isAuthenticated,
    signIn: authClient.signIn,
    signUp: authClient.signUp,
    signOut,
    authClient,
  };
}
