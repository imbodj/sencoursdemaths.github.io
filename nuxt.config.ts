import { defineNuxtConfig } from 'nuxt/config'
import StylelintPlugin from 'vite-plugin-stylelint'
import eslintPlugin from '@nabla/vite-plugin-eslint'
import 'dotenv/config'
import { siteMeta } from './site/meta'
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '~/modules/books-cover-fetcher',
    'nuxt-cname-generator',
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

  nitro: {
    preset: 'static',
    output: {
      dir: 'dist',
    },
    prerender: {
      crawlLinks: true,
      failOnError: false,
    }
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

  experimental: {
    defaults: {
      nuxtLink: {
        trailingSlash: 'append',
      },
    },
    inlineRouteRules: true,
  },
  compatibilityDate: '2024-07-01',

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

  cname: {
    host: siteMeta.url,
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
    ],
  },

  robots: {
    robotsTxt: false,
    disallow: ['/historique/*'],
  },
})
