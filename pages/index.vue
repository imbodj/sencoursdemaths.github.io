<script setup lang="ts">
import { siteMeta } from '~/site/meta'

usePageHead({ title: 'Accueil' })

const { data, status, error } = await useFetch<{ body: string }>('/_api/readme/')
const onLinkClick = (event: MouseEvent) => {
  if (event.target?.tagName === 'A' && event.target.href && (event.target.href.startsWith('/') || event.target.href.startsWith(siteMeta.url))) {
    event.preventDefault()
    useRouter().push(new URL(event.target.href).pathname)
  }
}
</script>

<template>
  <div>
    <div v-if="status === 'pending'">
      <spinner />
    </div>
    <div v-else-if="data">
      <div
        @click="onLinkClick"
        v-html="data.body"
      />
    </div>
    <div v-else>
      <error-display :error="error" />
    </div>
  </div>
</template>
