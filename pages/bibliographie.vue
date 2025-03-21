<script setup lang="ts">
import type { Book } from '~/types'
import BookCard from '~/components/Cards/BookCard.vue'

const { data: books, status, error } = await useFetch<Book[]>('/_api/bibliography/')

usePageHead({ title: 'Bibliographie' })
</script>

<template>
  <div>
    <div v-if="status === 'pending'">
      <spinner />
    </div>
    <div v-else-if="books">
      <h1>Bibliographie</h1>
      <cards
        input-id="book-search-field"
        :items="books"
        :search-fields="['title', 'subtitle', 'short', 'authors', 'publisher']"
      >
        <template #default="slotProps">
          <book-card :book="slotProps.item" />
        </template>
      </cards>
    </div>
    <div v-else>
      <error-display :error="error" />
    </div>
  </div>
</template>
