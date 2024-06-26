import { defineNuxtConfig } from 'nuxt/config';
import { VitePWA } from 'vite-plugin-pwa';
import svgLoader from 'vite-svg-loader';

export default defineNuxtConfig({
  app: {
    head: {
      title: 'Helpdesk',
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Welcome to Helpdesk, the best tool for managing support tickets and technical assistance. Efficiently handle tickets and improve your teams productivity.' },
        { name: 'keywords', content: 'helpdesk, support, ticket management, ticketing system, technical support' },
        { property: 'og:title', content: 'Helpdesk' },
        { property: 'og:description', content: 'Welcome to Helpdesk, the best tool for managing support tickets and technical assistance. Efficiently handle tickets and improve your team\'s productivity.' },
        { property: 'og:type', content: 'website' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap' }
      ],
      script: [
        {
          src: 'https://kit.fontawesome.com/6f1acafdf1.js',
          crossorigin: 'anonymous',
        },
      ],
    }
  },
  
  css: [
    'assets/scss/main.scss',
    'bootstrap/dist/css/bootstrap.css'
  ],

  components: true,

  modules: [
    '@pinia/nuxt'
  ],

  plugins: [
    '~/plugins/init-store.client.js'
  ],

  build: {
    transpile: ['@fortawesome/fontawesome-free']
  },

  vite: {
    plugins: [
      svgLoader(),
      VitePWA({
        manifest: {
          name: 'Helpdesk',
          short_name: 'Helpdesk',
          lang: 'en',
          background_color: '#ffffff',
          theme_color: '#007bff',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/icon.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ]
  },

  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:5000/api'
    }
  }
});
