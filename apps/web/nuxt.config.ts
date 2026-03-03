// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ['@narduk-enterprises/narduk-nuxt-template-layer'],

  // App-specific game styles (layer provides base CSS)
  css: ['~/assets/css/main.css'],

  // Game pages must be client-rendered (localStorage, AudioContext, etc.)
  routeRules: {
    '/': { ssr: false },
  },

  runtimeConfig: {
    // Server-only (admin API routes)
    googleServiceAccountKey: process.env.GSC_SERVICE_ACCOUNT_JSON || '',
    posthogApiKey: process.env.POSTHOG_PERSONAL_API_KEY || '',
    gaPropertyId: process.env.GA_PROPERTY_ID || '',
    posthogProjectId: process.env.POSTHOG_PROJECT_ID || '',
    adminToken: process.env.ADMIN_TOKEN || '',
    public: {
      appUrl: process.env.SITE_URL || 'https://neon-sewer-raid.workers.dev',
      appName: process.env.APP_NAME || 'Neon Sewer Raid',
      // Analytics
      posthogPublicKey: process.env.POSTHOG_PUBLIC_KEY || '',
      posthogHost: process.env.POSTHOG_HOST || 'https://us.i.posthog.com',
      gaMeasurementId: process.env.GA_MEASUREMENT_ID || '',
      posthogProjectId: process.env.POSTHOG_PROJECT_ID || '',
      // IndexNow
      indexNowKey: process.env.INDEXNOW_KEY || '',
    }
  },

  site: {
    url: process.env.SITE_URL || 'https://neon-sewer-raid.workers.dev',
    name: 'Neon Sewer Raid',
    description: 'An arcade action game. Fight robots, bats, ninjas, and the Rat King in neon-lit sewers! Built with Nuxt 4 and Cloudflare Workers.',
    defaultLocale: 'en',
  },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'Neon Sewer Raid',
      url: process.env.SITE_URL || 'https://neon-sewer-raid.workers.dev',
      logo: '/favicon.svg',
    },
  },

  image: {
    cloudflare: {
      baseURL: process.env.SITE_URL || 'https://neon-sewer-raid.workers.dev',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'theme-color', content: '#050510' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },

  sitemap: {},

  robots: {
    groups: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
})
