export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    const base = (config.public).filesBase || ''

    const fileUrl = (u) => {
        if (!u) return ''
        if (/^https?:\/\//i.test(u)) return u
        return `${base}${u}`
    }

    return { provide: { fileUrl } }
})
