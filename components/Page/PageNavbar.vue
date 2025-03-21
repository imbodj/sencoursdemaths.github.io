<script setup lang="ts">
const formRef = ref()
const doSearch = () => {
  const form = formRef.value.$el.querySelector('form')
  if (form) {
    form.submit()
  }
}

const route = useRoute()
const searchValue = ref(route.query.requete?.toString())
</script>

<template>
  <b-navbar
    data-bs-theme="dark"
    v-b-color-mode="'dark'"
    variant="dark"
    toggleable="lg"
  >
    <b-navbar-toggle target="page-navbar-collapse" />
    <b-collapse
      id="page-navbar-collapse"
      is-nav
    >
      <b-navbar-nav class="me-auto">
        <b-nav-item
          to="/"
          :active="$route.path === '/'"
        >
          <icon name="bi:house-door-fill" /> Accueil
        </b-nav-item>
        <b-nav-item
          to="/lecons/"
          :active="$route.path.startsWith('/lecons')"
        >
          <icon name="bi:file-text-fill" /> Leçons
        </b-nav-item>
        <b-nav-item
          to="/developpements/"
          :active="$route.path.startsWith('/developpements')"
        >
          <icon name="bi:pencil-fill" /> Développements
        </b-nav-item>
        <b-nav-item
          to="/fiches/"
          :active="$route.path.startsWith('/fiches')"
        >
          <icon name="bi:backpack-fill" /> Fiches
        </b-nav-item>
        <b-nav-item
          to="/bibliographie/"
          :active="$route.path.startsWith('/bibliographie')"
        >
          <icon name="bi:book-fill" /> Bibliographie
        </b-nav-item>
        <b-nav-item
          class="d-none"
          to="/recherche/"
          :active="$route.path.startsWith('/recherche')"
        >
          <icon name="bi:search" /> Recherche
        </b-nav-item>
      </b-navbar-nav>
      <b-navbar-nav>
        <b-nav-form
          ref="formRef"
          action="/recherche/"
          method="get"
          class="mt-2 mt-lg-0 w-100"
        >
          <b-input-group
            size="sm"
            data-bs-theme="light"
          >
            <b-form-input
              id="page-search-input"
              v-model="searchValue"
              placeholder="Rechercher"
              name="requete"
            />
            <b-button
              type="submit"
              variant="secondary"
              @click="doSearch"
            >
              <icon name="bi:search" />
            </b-button>
          </b-input-group>
        </b-nav-form>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<style lang="scss" scoped>
@import 'assets/bootstrap-mixins';

:deep(.search-bar form) {
  @include media-breakpoint-down(lg) {
    margin-top: 10px;
    flex: 1;
  }
}
</style>
