<script setup lang="ts">
import { type Banner, BannerType } from '~/composables/useBanner'

const props = defineProps<{
  banner: Banner
}>()

const variant = computed(() => {
  switch (props.banner.type) {
    case BannerType.caveats:
      return 'red'
    case BannerType.wip:
      return 'teal'
    case BannerType.pdf:
    default:
      return 'dark'
  }
})

const icon = computed(() => {
  switch (props.banner.type) {
    case BannerType.caveats:
      return 'exclamation-circle-fill'
    case BannerType.wip:
      return 'wrench'
    case BannerType.pdf:
    default:
      return 'info-circle-fill'
  }
})
</script>

<template>
  <div
    class="banner"
    :class="variant"
  >
    <icon
      class="icon"
      :name="`bi:${icon}`"
    />
    <p
      class="mb-0"
      v-html="banner.message"
    />
  </div>
</template>

<style lang="scss" scoped>
@import 'assets/bootstrap-mixins';
@import 'assets/colors';

.banner {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  text-align: center;

  :deep(a) {
    color: black;
    text-decoration: underline;
  }

  &.dark,
  &.teal {
    color: rgba(white, 0.5);

    :deep(a) {
      color: rgba(white, 0.75);
    }
  }

  &.dark {
    background-color: map-get($banner-colors, 'dark');
  }

  &.teal {
    background-color: map-get($banner-colors, 'teal');
  }

  &.red {
    background-color: map-get($banner-colors, 'red');
  }

  .icon {
    margin-right: 8px;

    @include media-breakpoint-down(md) {
      font-size: 2em;
      margin-right: 10px;
    }
  }
}
</style>
