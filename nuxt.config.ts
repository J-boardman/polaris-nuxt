// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', 'convex-nuxt', '@sentry/nuxt/module'],
  css: ['~/assets/css/main.css'],

  convex: {
    url: process.env.CONVEX_URL
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.SITE_URL || '',
      convexSiteUrl: process.env.CONVEX_SITE_URL || '',
      sentry: {
        dsn: process.env.SENTRY_DSN || '',
        tunnelUrl: process.env.SENTRY_TUNNEL_URL || '',
      },
    }
  },

  sentry: {
    org: 'homegrown-software-h0',
    project: 'javascript-nuxt',
    autoInjectServerSentry: 'top-level-import',
  },

  sourcemap: {
    client: 'hidden',
  },
})