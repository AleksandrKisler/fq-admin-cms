export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: true,
  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxtjs/tailwindcss",
    "@element-plus/nuxt",
  ],
  runtimeConfig: {
    public: {
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE || "http://localhost:3000/api/v1",
      filesBase: process.env.NUXT_PUBLIC_FILES_BASE || "http://localhost:3001",
    },
  },
  css: [
    "~/assets/css/theme.css",
    "~/assets/css/tailwind.css",
    "element-plus/dist/index.css",
    "element-plus/theme-chalk/dark/css-vars.css",
  ],
  postcss: {
    plugins: { tailwindcss: {}, autoprefixer: {} },
  },
  devServer: {
    port: 3001,
  },
});
