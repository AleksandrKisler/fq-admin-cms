export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('token').value;
  if (to.path.startsWith('/admin')) {
    // Включить охрану позже:
    // if (!token) return navigateTo('/login');
  }
});
