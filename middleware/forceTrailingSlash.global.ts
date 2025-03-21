export default defineNuxtRouteMiddleware((to, _) => {
  if (!to.path.endsWith('/')) {
    const { path, query, hash } = to
    const nextRoute = { path: path + '/', query, hash }
    return navigateTo(nextRoute, { redirectCode: 301 })
  }
})
