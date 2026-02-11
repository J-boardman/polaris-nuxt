<script setup lang="ts">
import { getAuthClient } from '~/lib/auth-client';

definePageMeta({ layout: false });

if (import.meta.client) {
  const route = useRoute();
  const authClient = getAuthClient();
  const token = route.query.ott as string | undefined;

  if (!token) {
    navigateTo('/sign-in', { replace: true });
  } else {
    try {
      // Verify the one-time token
      const result = await authClient.crossDomain.oneTimeToken.verify({ token });
      const session = result.data?.session;

      if (session) {
        // Establish the session
        await authClient.getSession({
          fetchOptions: {
            headers: { Authorization: `Bearer ${session.token}` },
          },
        });
        authClient.updateSession();

        // Wait for the plugin's session watcher to pick up the new session
        const reactiveSession = authClient.useSession();
        if (!reactiveSession.value?.data?.session) {
          await new Promise<void>((resolve) => {
            const stop = watch(
              () => reactiveSession.value,
              (val) => {
                if (val?.data?.session) {
                  stop();
                  resolve();
                }
              }
            );
          });
        }

        // Wait for Convex WebSocket auth to actually be established
        const convexAuthReady = useState('convex-auth-ready');
        if (!convexAuthReady.value) {
          await new Promise<void>((resolve) => {
            const stop = watch(convexAuthReady, (ready) => {
              if (ready) {
                stop();
                resolve();
              }
            });
          });
        }

        navigateTo('/', { replace: true });
      } else {
        // OTT verification succeeded but no session was established
        navigateTo('/sign-in', { replace: true });
      }
    } catch (error) {
      console.error('[auth/callback] OTT verification failed:', error);
      navigateTo('/sign-in', { replace: true });
    }
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <p>Signing in...</p>
  </div>
</template>
