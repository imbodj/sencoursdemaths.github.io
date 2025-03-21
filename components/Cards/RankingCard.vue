<script setup lang="ts">
import type { Ranking } from '~/types'
import LatexContentCard from '~/components/Cards/LatexContentCard.vue'

defineProps<{ ranking: Ranking }>()
</script>

<template>
  <latex-content-card
    btn-check="Consulter l'entrée"
    link-prefix="historique"
    :object="ranking"
  />
</template>
