<script setup lang="ts">
import type { Lesson } from '~/types'
import LatexContentCard from '~/components/Cards/LatexContentCard.vue'

defineProps<{ lesson: Lesson }>()
</script>

<template>
  <latex-content-card
    btn-check="Consulter le plan"
    link-prefix="lecons"
    :object="lesson"
  />
</template>
