<script setup lang="ts">
import type { Development } from '~/types'
import LatexContentCard from '~/components/Cards/LatexContentCard.vue'

defineProps<{ development: Development }>()
</script>

<template>
  <latex-content-card
    btn-check="Consulter les exercices"
    link-prefix="developpements"
    :object="development"
  >
    <p v-html="development.summary" />
  </latex-content-card>
</template>
