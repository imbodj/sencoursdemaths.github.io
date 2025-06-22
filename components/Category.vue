<script setup lang="ts">
import type { Category } from '~/types'

const props = defineProps<{ category?: Category }>()
const name = computed<string>(() => {
  switch (props.category) {
    case undefined:
      return 'Toutes les catégories'
    case 'algebra':
      return 'Treminale S2'
    case 'analysis':
      return 'Terminale L'
    default:
      return props.category
  }
})
const iconId = computed<string>(() => {
  switch (props.category) {
    case undefined:
      return 'list'
    case 'algebra':
      return 'bezier'
    case 'analysis':
      return 'option'
    default:
      return 'bezier2'
  }
})
</script>

<template>
  <span>
    <icon :name="`bi:${iconId}`" /> {{ name }}
  </span>
</template>
