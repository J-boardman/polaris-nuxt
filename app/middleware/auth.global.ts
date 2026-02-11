export default defineNuxtRouteMiddleware((to) => {
  if (to.name === 'sign-in' || to.path.startsWith('/auth/')) return;

  const authState = useState<{ session: unknown } | null>('auth-session');

  if (!authState.value?.session) {
    return navigateTo('/sign-in');
  }
});
