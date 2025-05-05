<script setup lang="ts">
import type { LatexContentObject } from '~/types'

defineProps<{
  btnCheck: string
  linkPrefix: string
  object: LatexContentObject
}>()

const config = useRuntimeConfig()
</script>

<template>
  <div>
    <h2
      class="card-title"
      v-html="object.name"
    />
    <slot />
    <b-button-group>
      <b-button
        :to="`/${linkPrefix}/${object.slug}/`"
        variant="dark"
      >
        <icon name="bi:box-arrow-in-right" /> {{ btnCheck }}
      </b-button>
      <b-button
        :href="`/${config.public.baseUrl}/pdf/${linkPrefix}/${object.slug}.pdf`"
        download="true"
        variant="secondary"
      >
        <icon name="bi:file-text" /> Télécharger le PDF
      </b-button>
    </b-button-group>
  </div>
</template>

<style lang="scss" scoped>
.card-title {
  border-bottom: none !important;
  margin-bottom: 18px !important;
}
</style>
