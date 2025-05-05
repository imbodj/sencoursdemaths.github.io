<script setup lang="ts">
import type { Lesson } from '~/types'
import LessonCard from '~/components/Cards/LessonCard.vue'

const { data: lessons, status, error } = await useFetch<Lesson[]>('/_api/latex/lecons/')

const route = useRoute()
const path = removeTrailingSlashIfPossible(route.path)
const config = useRuntimeConfig()
usePdfBanner(`/${config.public.baseUrl}/pdf${path}.pdf`)

usePageHead({ title: 'Liste des leçons' })
</script>

<template>
  <div v-if="status === 'pending'">
    <spinner />
  </div>
  <div v-else-if="lessons">
    <h1>Liste des leçons</h1>
    <cards
      input-id="lesson-search-field"
      :items="lessons"
      :search-fields="['slug', 'name']"
    >
      <template #default="slotProps">
        <lesson-card :lesson="slotProps.item" />
      </template>
    </cards>
  </div>
  <div v-else>
    <error-display :error="error" />
  </div>
</template>
