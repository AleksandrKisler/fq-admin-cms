export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    // Базовый домен/порт для раздачи файлов (меняй env-переменной)
    const base = (config.public && config.public.filesBase) || 'http://localhost:3001'

    const fileSSRUrl = (input) => {
        if (!input || typeof input !== 'string') return ''
        const raw = input.trim()

        if (/^https?:\/\//i.test(raw)) return raw

        let path = raw
        if (!path.startsWith('/')) path = '/' + path
        if (!/^\/images\//i.test(path)) {
            path = '/images' + (path.startsWith('/') ? '' : '/') + path.replace(/^\/+/, '')
        }

        return (base ? base.replace(/\/$/, '') : '') + path
    }

    return { provide: { fileSSRUrl } }
})
