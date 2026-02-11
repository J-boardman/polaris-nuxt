import { setResponseHeader } from 'h3';

export default defineNuxtRouteMiddleware((to) => {
  // Only set headers on server
  if (import.meta.server) {
    const authState = useState<{ session: unknown } | null>('auth-session');

    // If user is authenticated, prevent caching
    if (authState.value?.session) {
      const event = useRequestEvent();
      if (event) {
        setResponseHeader(event, 'Cache-Control', 'private, no-store, no-cache, must-revalidate');
        setResponseHeader(event, 'Pragma', 'no-cache');
        setResponseHeader(event, 'Expires', '0');
      }
    }
  }
});

