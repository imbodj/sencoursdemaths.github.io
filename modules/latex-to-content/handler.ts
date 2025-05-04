import { latexStorageKey, bibStorageKey } from './common.ts'

export default defineEventHandler(async (event) => {
  const params = event.context.params
  if (!params?.type) {
    throw createError({ status: 404 })
  }
  let slug = params.slug ?? 'index'
  if (!slug.endsWith('.json')) {
    slug = slug += '.json'
  }
  const json = await useStorage(`assets:${latexStorageKey}`).getItem(params.type + '/' + slug)
  if (!json) {
    throw createError({ status: 404 })
  }
  return json
})
