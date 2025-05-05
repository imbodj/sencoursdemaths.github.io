<script setup lang="ts">
import type { Sheet } from '~/types'
import SheetCard from '~/components/Cards/SheetCard.vue'

const { data: sheets, status, error } = await useFetch<Sheet[]>('/_api/latex/fiches/')

const route = useRoute()
const path = removeTrailingSlashIfPossible(route.path)
const config = useRuntimeConfig()
usePdfBanner(`/${config.public.baseUrl}/pdf${path}.pdf`)

usePageHead({ title: 'Liste des fiches' })
</script>

<template>
  <div>
    <div v-if="status === 'pending'">
      <spinner />
    </div>
    <div v-else-if="sheets">
      <h1>Liste des fiches</h1>
      <cards
        input-id="sheet-search-field"
        :items="sheets"
        :search-fields="['name', 'summary']"
      >
        <template #default="slotProps">
          <sheet-card :sheet="slotProps.item" />
        </template>
      </cards>
    </div>
    <div v-else>
      <error-display :error="error" />
    </div>
  </div>
</template>
