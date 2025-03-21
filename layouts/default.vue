<script setup lang="ts">
const banners = useBanners()
</script>

<template>
  <div>
    <nuxt-loading-indicator color="white" />
    <page-header />
    <page-navbar />
    <client-only>
      <banner
        v-for="(banner, index) in banners"
        :key="`banner-${index}`"
        :banner="banner"
      />
    </client-only>
    <page-content id="page-content">
      <slot />
    </page-content>
    <page-footer />
  </div>
</template>

<style lang="scss">
#page-content {
  h1,
  h2,
  h3,
  h4,
  h5 {
    border-bottom: 1px solid rgba(black, 0.25);
    padding-bottom: 0.2em;
    margin-bottom: 0.5em;
  }

  ul li {
    padding-left: 0 !important;
    list-style-type: '— ';
  }

  a:not([role='button']) {
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
