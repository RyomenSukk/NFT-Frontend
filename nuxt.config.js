export default {
  // Global page headers
  head: {
    titleTemplate: '%s - NFT Marketplace',
    title: 'NFT Marketplace',
    htmlAttrs: {
      lang: 'th'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'NFT Marketplace - ซื้อ ขาย และสร้างสรรค์ NFT บน Blockchain' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  env: {
    BACKEND_URL: process.env.BACKEND_URL
  },

  // Global CSS
  css: [
    '~/assets/main.css'
  ],

  // Plugins to run before rendering page
  plugins: [
    '~/plugins/web3.client.js'
  ],

  // Auto import components
  components: true,

  // Modules for dev and build
  buildModules: [
    '@nuxtjs/vuetify',
  ],

  // Modules
  modules: [],

  // Vuetify module configuration
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    treeShake: true,
    theme: {
      dark: false,
      themes: {
        light: {
          primary: '#6B46C1',
          secondary: '#9333EA',
          accent: '#F59E0B',
          error: '#EF4444',
          warning: '#F97316',
          info: '#3B82F6',
          success: '#10B981',
          background: '#F9FAFB'
        },
        dark: {
          primary: '#9333EA',
          secondary: '#A855F7',
          accent: '#FCD34D',
          error: '#F87171',
          warning: '#FB923C',
          info: '#60A5FA',
          success: '#34D399',
          background: '#111827'
        }
      }
    }
  },

  // Build Configuration
  build: {
    transpile: ['vuetify'],
    extend(config, ctx) {
      // Add support for Web3
      config.node = {
        fs: 'empty'
      }
    }
  },

  server: {
    port: 3000,
    host: '0.0.0.0'
  }
}