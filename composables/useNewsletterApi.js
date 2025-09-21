export function useNewsletterApi() {
    const {$api} = useNuxtApp();
    return {
        list:    () => $api('/newsletters'),
        get:     (id) => $api(`/newsletters/${id}`),
        create:  (payload) => $api('newsletter/send', { method:'POST', body: payload }),
        update:  (id, payload) => $api(`/newsletters/${id}`, { method:'PUT', body: payload }),
        remove:  (id) => $api(`/newsletters/${id}`, { method:'DELETE' }),
        send:    (id) => $api(`/newsletters/${id}/send`, { method:'POST' }),
        subs:    (tag) => $api('/newsletters/subscribers', { query: tag? { tag } : {} }),
}
}
