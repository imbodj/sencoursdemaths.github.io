<script setup lang="ts">
import { siteMeta } from '~/site/meta'
import type { RankingContent } from '~/types'

const route = useRoute()
const { data: ranking, status, error } = await useFetch<RankingContent>(`/_api/latex/historique/${route.params.slug}.json`)

const path = removeTrailingSlashIfPossible(route.path)
const config = useRuntimeConfig()
usePdfBanner(`/${config.public.baseUrl}/pdf${path}.pdf`)
useCaveatsBanner(`https://github.com/${siteMeta.github.username}/${siteMeta.github.repository}/edit/main/content/latex${path}.tex`)

usePageHead({ title: 'Affichage d\'un classement' })

const rule = useRobotsRule()
rule.value = 'noindex, nofollow'

defineRouteRules({
  robots: false,
})
</script>

<template>
  <div>
    <div v-if="status === 'pending'">
      <spinner />
    </div>
    <div v-else-if="ranking">
      <Title>{{ ranking['page-title'] }}</Title>
      <main>
        <math-document :body="ranking.body" />
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
