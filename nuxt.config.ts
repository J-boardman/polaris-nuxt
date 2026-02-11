// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', 'convex-nuxt'],
  css: ['~/assets/css/main.css'],
  convex: {
    url: process.env.CONVEX_URL
  },
})