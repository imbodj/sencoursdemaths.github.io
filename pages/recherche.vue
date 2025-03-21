<script setup lang="ts">
import type { Ref } from 'vue'
import LessonCard from '~/components/Cards/LessonCard.vue'
import DevelopmentCard from '~/components/Cards/DevelopmentCard.vue'
import SheetCard from '~/components/Cards/SheetCard.vue'
import type { LatexContentObject, Development, Lesson, Sheet } from '~/types'

const route = useRoute()
const request = route.query.requete?.toString()
const regexPattern = computed<string>(() => request ? normalizeString(request) : '.*')

const { status: lessonsQueryStatus, data: allLessons } = await useFetch<Lesson[]>(`/_api/latex/lecons/index.json`)

const { status: developmentsQueryStatus, data: allDevelopments } = await useFetch<Development[]>(`/_api/latex/developpements/index.json`)

const { status: sheetsQueryStatus, data: allSheets } = await useFetch<Sheet[]>(`/_api/latex/fiches/index.json`)

const doSearch = <T extends LatexContentObject>(list: Ref<T[] | null>): T[] => {
  const result: T[] = []
  if (!list.value) {
    return result
  }
  for (const value of list.value) {
    const regex = RegExp(regexPattern.value, 'ig')
    const latexObject = value as T
    if (regex.test(latexObject['page-name-search'])) {
      result.push(latexObject)
    }
  }
  return result
}

const lessons = computed<Lesson[]>(() => doSearch<Lesson>(allLessons))
const developments = computed<Development[]>(() => doSearch<Development>(allDevelopments))
const sheets = computed<Sheet[]>(() => doSearch<Sheet>(allSheets))
const isEmpty = computed(() => lessons.value.length === 0 && developments.value.length === 0 && sheets.value.length === 0)
usePageHead({ title: 'Recherche' })
</script>

<template>
  <div>
    <div v-if="lessonsQueryStatus === 'pending' || developmentsQueryStatus === 'pending' || sheetsQueryStatus === 'pending'">
      <spinner />
    </div>
    <div v-else-if="lessons && developments && sheets">
      <h2>Recherche</h2>
      <p v-if="isEmpty">
        Votre recherche n'a donné aucun résultat.
      </p>
      <p
        v-else
        class="mb-0"
      >
        <client-only fallback="Voici les résultats pour votre recherche.">
          Voici les résultats pour votre recherche de <q v-text="request && request.length > 0 ? request : 'Tout'" />.
        </client-only>
      </p>

      <div
        v-if="lessons && !isEmpty"
        class="mt-4"
      >
        <h3>Leçons</h3>
        <p
          v-if="lessons.length === 0"
          class="mb-0"
        >
          Aucun plan de leçon trouvé pour cette recherche.
        </p>
        <cards
          v-if="lessons.length > 0"
          input-id="lesson-search-field"
          :items="lessons"
        >
          <template #default="slotProps">
            <lesson-card :lesson="slotProps.item" />
          </template>
        </cards>
      </div>
      <div
        v-if="developments && !isEmpty"
        class="mt-4"
      >
        <h3>Développements</h3>
        <p
          v-if="developments.length === 0"
          class="mb-0"
        >
          Aucun développement trouvé pour cette recherche.
        </p>
        <cards
          v-if="developments.length > 0"
          input-id="development-search-field"
          :items="developments"
        >
          <template #default="slotProps">
            <development-card :development="slotProps.item" />
          </template>
        </cards>
      </div>
      <div
        v-if="sheets && !isEmpty"
        class="mt-4"
      >
        <h3>Fiches</h3>
        <p
          v-if="sheets.length === 0"
          class="mb-0"
        >
          Aucune fiche trouvée pour cette recherche.
        </p>
        <cards
          v-if="sheets.length > 0"
          input-id="sheet-search-field"
          :items="sheets"
        >
          <template #default="slotProps">
            <sheet-card :sheet="slotProps.item" />
          </template>
        </cards>
      </div>
    </div>
    <div v-else>
      <error-display error="500" />
    </div>
  </div>
</template>
