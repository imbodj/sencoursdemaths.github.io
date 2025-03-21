<script setup lang="ts" generic="T extends { [key: string]: any }">
import type { Category } from '~/types'

type CategoryOrUndefined = Category | undefined

const props = withDefaults(
  defineProps<{
    inputId: string
    items: T[]
    searchFields?: string[]
    sortFunction?: (items: T[]) => T[]
  }>(),
  {
    sortFunction: (items: any[]) => items.sort(),
  },
)

const currentCategory = ref<CategoryOrUndefined>()
const search = ref<string>('')

const categories = computed<CategoryOrUndefined[]>(() => {
  let result: CategoryOrUndefined[] = []
  for (const item of props.items) {
    if (item.categories) {
      result = result.concat(item.categories)
    }
  }
  result = Array.from(new Set(result)).sort()
  result.unshift(undefined)
  return result
})

const itemsToDisplay = computed<T[]>(() => props.sortFunction(props.items.filter(filter)))

const filter = (item: T) => {
  let result = true
  if (currentCategory.value) {
    result = result && item.categories.includes(currentCategory.value)
  }
  if (search.value.length > 0) {
    const normalizedSearch = normalizeString(search.value)
    let searchResult = false
    for (const searchField of props.searchFields ?? []) {
      const value = item[searchField]
      if (value) {
        searchResult = searchResult || normalizeString(value.toString()).includes(normalizedSearch)
      }
    }
    result = result && searchResult
  }
  return result
}
</script>

<template>
  <div class="cards">
    <b-row class="header">
      <b-col
        cols="12"
        :lg="searchFields ? '9' : undefined"
      >
        <b-button-group
          v-if="categories.length > 1"
          class="categories mb-3 mb-lg-0"
        >
          <b-button
            v-for="category in categories"
            :key="category"
            variant="link"
            class="category-button"
            :class="{ active: currentCategory === category }"
            @click="currentCategory = category"
          >
            <category
              class="category"
              :category="category"
            />
          </b-button>
        </b-button-group>
      </b-col>
      <b-col
        v-if="searchFields"
        cols="12"
        lg="3"
        class="d-flex align-items-center"
      >
        <b-form-input
          :id="inputId"
          v-model="search"
          placeholder="Chercher dans la liste"
          class="form-control-sm"
        />
      </b-col>
    </b-row>
    <div
      v-for="(item, position) in itemsToDisplay"
      :key="`card-${position}`"
      class="mt-4 item-card p-3"
    >
      <slot :item="item" />
    </div>
    <em
      v-if="itemsToDisplay.length === 0"
      class="d-block mt-5 text-muted text-center"
    >
      Aucun contenu à afficher.
    </em>
  </div>
</template>

<style lang="scss" scoped>
@import 'assets/bootstrap-mixins';

.cards {
  .header {
    margin-bottom: 20px;
  }

  .categories {
    max-width: 100%;

    .category-button {
      color: rgba(black, 0.5);
      border-bottom: 1px solid rgba(black, 0.25);
      text-decoration: none;
      box-shadow: none;

      &:hover:not(.active) {
        color: rgba(black, 0.75);
        border-bottom: 1px solid rgba(black, 0.5);
      }

      &.active {
        color: var(--bs-blue);
        border-bottom-color: rgba(var(--bs-blue), 0.5);
      }

      @include media-breakpoint-down(md) {
        width: 33.3%;

        .category {
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          display: block;
        }
      }
    }
  }

  :deep(.item-card) {
    background-color: rgba(black, 0.05);
    transition: background-color 200ms;

    h2 {
      font-size: 1.2em;
      border-bottom: none;
    }

    &:hover {
      background-color: rgba(black, 0.1);
    }
  }

  :deep(.btn) {
    @include media-breakpoint-down(md) {
      font-size: 14px;
    }
  }
}
</style>
