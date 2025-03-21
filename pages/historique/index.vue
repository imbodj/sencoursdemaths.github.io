<script setup lang="ts">
import type { Ranking } from '~/types'
import RankingCard from '~/components/Cards/RankingCard.vue'

const { data: rankings, status, error } = await useFetch<Ranking[]>('/_api/latex/historique/')

const route = useRoute()
const path = removeTrailingSlashIfPossible(route.path)
usePdfBanner(`/pdf${path}.pdf`)

usePageHead({ title: 'Historique des admissions' })

const sortFunction = (rankings: Ranking[]) => rankings.sort((a, b) => b.slug.localeCompare(a.slug))
</script>

<template>
  <div>
    <div v-if="status === 'pending'">
      <spinner />
    </div>
    <div v-else-if="rankings">
      <h1>Historique des admis à l'agrégation externe</h1>
      <cards
        input-id="rankings-search-field"
        :items="rankings"
        :search-fields="['name', 'summary']"
        :sort-function="sortFunction"
      >
        <template #default="slotProps">
          <ranking-card :ranking="slotProps.item" />
        </template>
      </cards>
    </div>
    <div v-else>
      <error-display :error="error" />
    </div>
  </div>
</template>
