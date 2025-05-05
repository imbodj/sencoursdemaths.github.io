import { defineNuxtConfig } from 'nuxt/config'
import StylelintPlugin from 'vite-plugin-stylelint'
import eslintPlugin from '@nabla/vite-plugin-eslint'
import 'dotenv/config'
import { siteMeta } from './site/meta'

const baseUrl = 'SenCoursDeMaths'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '~/modules/readme-md-to-content',
    '~/modules/commit-sha-file-generator',
    '~/modules/latex-pdf-generator',
    '~/modules/latex-to-content',
    '@bootstrap-vue-next/nuxt',
    '@nuxtjs/google-fonts',
    'nuxt-link-checker',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    '@nuxt/icon',
  ],

  ssr: true,
  app: {
    baseURL: `/${baseUrl}/`,
    head: {
      titleTemplate: `%s | ${siteMeta.title}`,
      htmlAttrs: {
        lang: 'fr',
      },
      meta: [
        { name: 'description', content: siteMeta.description },
        { name: 'theme-color', content: '#343a40' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  css: [
    '~/assets/app.scss',
    '~/node_modules/katex/dist/katex.min.css',
  ],

  site: {
    url: siteMeta.url,
    name: siteMeta.title,
    trailingSlash: true,
  },

  runtimeConfig: {
    public: {
      baseUrl,
    },
  },

  experimental: {
    defaults: {
      nuxtLink: {
        trailingSlash: 'append',
      },
    },
    inlineRouteRules: true,
  },
  compatibilityDate: '2024-07-01',
  nitro: {
    preset: 'static',
    prerender: {
      failOnError: false, // ← Ignore les erreurs pour générer quand même
    },
  },

  vite: {
    plugins: [
      StylelintPlugin(),
      eslintPlugin(),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          silenceDeprecations: [
            'mixed-decls',
            'color-functions',
            'global-builtin',
            'import',
          ],
        },
      },
    },
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  googleFonts: {
    display: 'swap',
    families: {
      'Raleway': true,
      'Noto Sans JP': true,
    },
  },

  icon: {
    provider: 'iconify',
    class: 'vue-icon',
  },

  linkChecker: {
    failOnError: false,
    excludeLinks: [
      '/pdf/**',
    ],
    skipInspections: [
      'link-text',
      'no-uppercase-chars',
      'redirects',
    ],
  },

  robots: {
    disallow: ['/historique/*'],
  },
})
