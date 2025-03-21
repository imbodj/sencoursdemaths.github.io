<script setup lang="ts">
import type { Sheet } from '~/types'
import LatexContentCard from '~/components/Cards/LatexContentCard.vue'

defineProps<{ sheet: Sheet }>()
</script>

<template>
  <latex-content-card
    btn-check="Consulter la fiche"
    link-prefix="fiches"
    :object="sheet"
  >
    <p v-html="sheet.summary" />
  </latex-content-card>
</template>
