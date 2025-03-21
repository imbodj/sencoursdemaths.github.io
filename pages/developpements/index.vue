<script setup lang="ts">
import type { Development } from '~/types'
import DevelopmentCard from '~/components/Cards/DevelopmentCard.vue'

const { data: developments, status, error } = await useFetch<Development[]>('/_api/latex/developpements/')

const route = useRoute()
const path = removeTrailingSlashIfPossible(route.path)
usePdfBanner(`/pdf${path}.pdf`)

usePageHead({ title: 'Liste des développements' })
</script>

<template>
  <div>
    <div v-if="status === 'pending'">
      <spinner />
    </div>
    <div v-else-if="developments">
      <h1>Liste des développements</h1>
      <cards
        input-id="development-search-field"
        :items="developments"
        :search-fields="['name', 'summary']"
      >
        <template #default="slotProps">
          <development-card :development="slotProps.item" />
        </template>
      </cards>
    </div>
    <div v-else>
      <error-display :error="error" />
    </div>
  </div>
</template>
