<script setup lang="ts">
import { siteMeta } from '~/site/meta'

const { data: commitSha } = await useFetch<{ long: string, short: string }>('/_api/latest-commit/')
const githubRepo = `https://github.com/${siteMeta.github.username}/${siteMeta.github.repository}`
</script>

<template>
  <span v-if="commitSha">
    Révision <a :href="`${githubRepo}/commit/${commitSha.long}`">&#35;{{ commitSha.short }}</a>.
  </span>
</template>
