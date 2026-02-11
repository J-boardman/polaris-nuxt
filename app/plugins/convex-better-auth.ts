import { watch, type Ref } from 'vue';
import { initAuthClient, type AuthClient } from '~/lib/auth-client';
import { createAuthStorage, getCookieHeader } from '~/lib/auth-storage';

export interface AuthSessionData {
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
  } | null;
  session: {
    id: string;
    userId: string;
    // token removed - not SSR-safe, handled separately on client
    expiresAt: Date | string;
    createdAt: Date | string;
    updatedAt: Date | string;
  } | null;
}

const AUTH_STATE_KEY = 'auth-session';

export default defineNuxtPlugin({
  name: 'convex-better-auth',
  order: 100,
  async setup(nuxtApp) {
    const storage = createAuthStorage();
    const authClient = initAuthClient(storage);

    const authState = useState<AuthSessionData>(AUTH_STATE_KEY, () => ({
      user: null,
      session: null,
    }));

    if (import.meta.server) {
      await setupServerAuth(nuxtApp.vueApp, authState);
    } else {
      setupClientAuth(authClient, authState);
    }
  },
});

async function setupServerAuth(
  vueApp: { _context: { provides?: Record<string, unknown> } },
  authState: Ref<AuthSessionData>
) {
  const cookieHeader = getCookieHeader();
  if (!cookieHeader) return;

  const config = useRuntimeConfig();
  const convexSiteUrl = config.public.convexSiteUrl as string;
  if (!convexSiteUrl) return;

  try {
    const [tokenResponse, sessionResponse] = await Promise.all([
      $fetch<{ token?: string }>(`${convexSiteUrl}/api/auth/convex/token`, {
        method: 'GET',
        headers: { 'Better-Auth-Cookie': cookieHeader },
      }).catch(() => null),
      $fetch<{
        user: AuthSessionData['user'];
        session: AuthSessionData['session'] & { token?: string };
      }>(`${convexSiteUrl}/api/auth/get-session`, {
        method: 'GET',
        headers: { 'Better-Auth-Cookie': cookieHeader },
      }).catch(() => null),
    ]);

    if (sessionResponse?.user && sessionResponse?.session) {
      // Extract token to exclude it from SSR-serialized state
      const { token: _, ...sessionWithoutToken } = sessionResponse.session;
      authState.value = {
        user: sessionResponse.user,
        session: sessionWithoutToken as AuthSessionData['session'],
      };
    }

    if (tokenResponse?.token) {
      const convexContext = vueApp._context.provides?.['convex-vue'] as {
        httpClientRef?: { value?: { setAuth: (token: string) => void } };
      } | undefined;

      if (convexContext?.httpClientRef?.value) {
        convexContext.httpClientRef.value.setAuth(tokenResponse.token);
      }
    }
  } catch {
    // Auth not available during SSR
  }
}

function setupClientAuth(authClient: AuthClient, authState: Ref<AuthSessionData>) {
  const convex = useConvexClient();
  const convexAuthReady = useState('convex-auth-ready', () => false);

  let cachedToken: string | null = null;

  const fetchToken = async ({ forceRefreshToken = false } = {}) => {
    if (cachedToken && !forceRefreshToken) return cachedToken;
    try {
      const { data } = await authClient.convex.token();
      cachedToken = data?.token || null;
      return cachedToken;
    } catch {
      cachedToken = null;
      return null;
    }
  };

  const onAuthChange = (isAuthenticated: boolean) => {
    convexAuthReady.value = isAuthenticated;
  };

  if (authState.value.session) {
    convex.setAuth(fetchToken, onAuthChange);
  }

  // Watch Better Auth's reactive session for changes
  const session = authClient.useSession();
  let authSetUp = authState.value.session !== null;
  let lastSessionId: string | null = authState.value.session?.id ?? null;

  watch(
    () => session.value,
    (newSession) => {
      const isPending = newSession?.isPending;
      const hasSession = !!(newSession?.data?.user && newSession?.data?.session);
      const newSessionId = newSession?.data?.session?.id ?? null;

      if (hasSession) {
        // Extract token to exclude it from SSR-serialized state
        const sessionData = newSession.data!.session as AuthSessionData['session'] & { token?: string };
        const { token: _, ...sessionWithoutToken } = sessionData;
        authState.value = {
          user: newSession.data!.user as AuthSessionData['user'],
          session: sessionWithoutToken as AuthSessionData['session'],
        };
      } else if (!isPending) {
        authState.value = { user: null, session: null };
      }

      if (hasSession) {
        const changed = newSessionId !== lastSessionId;
        if (!authSetUp || changed) {
          cachedToken = null;
          convex.setAuth(fetchToken, onAuthChange);
          authSetUp = true;
        }
        lastSessionId = newSessionId;
      } else if (!isPending) {
        if (authSetUp) {
          convex.setAuth(async () => null);
          convexAuthReady.value = false;
          authSetUp = false;
        }
        lastSessionId = null;
      }
    },
    { deep: true, immediate: true }
  );
}
