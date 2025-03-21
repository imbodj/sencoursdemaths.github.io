<script setup lang="ts">
import type { Book } from '~/types'

const props = defineProps<{ book: Book }>()

const alt = computed(() => {
  let alt = props.book.title
  if (props.book.subtitle) {
    alt += ': ' + props.book.subtitle
  }
  return alt
})
const authors = computed(() => props.book.authors.join(', '))
const short = computed(() => `[${props.book.short}]`)
const image = computed(() => `/images/livres/${props.book.isbn10}.jpg`)
const date = computed(() => {
  const parts = props.book.date.split('-')
  return `${parts[2]}/${parts[1]}/${parts[0]}`
})
</script>

<template>
  <b-row
    :id="book.short"
    class="book"
  >
    <b-col
      cols="12"
      md="4"
      lg="3"
      class="d-flex align-items-center justify-content-center pt-3 pb-4 pt-md-0 pb-md-0"
    >
      <img
        class="preview"
        :src="image"
        :alt="alt"
      >
    </b-col>
    <b-col
      class="info"
      cols="12"
      md="8"
      lg="9"
    >
      <h2 class="title">
        <strong v-text="book.title" /> {{ book.subtitle }}
      </h2>
      <span class="text-muted d-block">
        {{ authors }}
        &bull;
        {{ date }}
        &bull;
        Éditions {{ book.publisher }}
        <span v-if="book.edition">&bull; {{ book.edition }}<sup>ème</sup> édition</span>
      </span>
      <p
        class="mt-2 comment"
        v-text="book.comment"
      />
      <small class="text-muted d-block mb-2">
        <u>Référence :</u> <strong v-text="short" />.
      </small>
      <b-button-group class="mt-2 align-self-start">
        <b-button
          :href="`${book.buy}`"
          variant="dark"
        >
          <icon name="bi:cart" /> Acheter le livre
        </b-button>
        <b-button
          :href="`${book.website}`"
          variant="secondary"
        >
          <icon name="bi:info-circle" /> Plus d'informations
        </b-button>
      </b-button-group>
    </b-col>
  </b-row>
</template>

<style lang="scss" scoped>
.book {
  .preview {
    height: 250px;
  }

  .info {
    display: flex;
    flex-direction: column;

    .title {
      border-bottom: none !important;
      margin-bottom: 0 !important;
    }

    .comment {
      flex: 1;
    }
  }
}
</style>
