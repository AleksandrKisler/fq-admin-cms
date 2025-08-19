export default defineNuxtRouteMiddleware((to) => {
    const token = useCookie('token').value;
    if (to.path.startsWith('/admin')) {
        // if (!token) return navigateTo('/login');
    }
});
