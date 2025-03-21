/**
 * A middleware that clears the banners each time the user navigates.
 */
export default defineNuxtRouteMiddleware(() => {
  const banners = useBanners()
  banners.value = []
})
