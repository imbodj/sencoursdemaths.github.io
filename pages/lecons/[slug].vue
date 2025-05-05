<script setup lang="ts">
import { siteMeta } from '~/site/meta'
import type { LessonContent } from '~/types'

const route = useRoute()
const { data: lesson, status, error } = await useFetch<LessonContent>(`/_api/latex/lecons/${route.params.slug}.json`)

const path = removeTrailingSlashIfPossible(route.path)
const config = useRuntimeConfig()
usePdfBanner(`/${config.public.baseUrl}/pdf${path}.pdf`)
useCaveatsBanner(`https://github.com/${siteMeta.github.username}/${siteMeta.github.repository}/edit/main/content/latex${path}.tex`)

usePageHead({ title: 'Affichage d\'une leçon' })
</script>

<template>
  <div>
    <div v-if="status === 'pending'">
      <spinner />
    </div>
    <div v-else-if="lesson">
      <Title>Leçon {{ lesson.slug }} : {{ lesson['page-title'] }}</Title>
      <main>
        <math-document :body="lesson.body" />
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
