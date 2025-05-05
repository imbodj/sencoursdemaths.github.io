<script setup lang="ts">
import { siteMeta } from '~/site/meta'
import type { SheetContent } from '~/types'

const route = useRoute()
const { data: sheet, status, error } = await useFetch<SheetContent>(`/_api/latex/fiches/${route.params.slug}.json`)

const path = removeTrailingSlashIfPossible(route.path)
const config = useRuntimeConfig()
usePdfBanner(`/${config.public.baseUrl}/pdf${path}.pdf`)
useCaveatsBanner(`https://github.com/${siteMeta.github.username}/${siteMeta.github.repository}/edit/main/content/latex${path}.tex`)

usePageHead({ title: 'Affichage d\'une fiche' })
</script>

<template>
  <div>
    <div v-if="status === 'pending'">
      <spinner />
    </div>
    <div v-else-if="sheet">
      <Title>{{ sheet['page-title'] }}</Title>
      <main>
        <math-document :body="sheet.body" />
      </main>
    </div>
    <div v-else>
      <error-display :error="error" />
    </div>
  </div>
</template>

<style lang="scss">
@import 'assets/highlighting';
</style>
