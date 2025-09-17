export default defineNuxtRouteMiddleware((to) => {
    const token = useCookie('token').value;
    if (to.path.startsWith('/admin')) {
        // Доступ к админке проверяется на сервере, поэтому здесь ничего не делаем.
        // Если понадобится клиентский редирект, верните проверку токена ниже.
        // if (!token) return navigateTo('/login');
    }
});
