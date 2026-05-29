<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number
  }>(),
  {
    size: 24,
  },
)
</script>

<template>
  <svg
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    :width="size"
    :height="size"
    fill="none"
  >
    <rect width="48.000000" height="48.000000" x="0.000000" y="0.000000" />
    <path d="M7 14L7 34L15.6608 29L15.6608 19L7 14Z" fill="rgb(4,35,219)" fill-rule="nonzero" />
    <path d="M15.6606 19L15.6606 29L24.3206 24L15.6606 19Z" fill="rgb(28,84,228)" fill-rule="nonzero" />
    <path
      d="M24.3206 24L15.6606 19L32.9773 8.99414L41.6415 14L24.3206 24Z"
      fill="rgb(171,155,255)"
      fill-rule="nonzero"
    />
    <path d="M15.6608 19L7 14L24.3208 4L32.9775 8.99417L15.6608 19Z" fill="rgb(115,71,255)" fill-rule="nonzero" />
    <path d="M41.6415 34L24.3206 44L15.6606 39L32.9806 29L41.6415 34Z" fill="rgb(0,207,202)" fill-rule="nonzero" />
    <path
      d="M32.9808 29L41.6417 24L41.6417 34L32.9808 29ZM15.6608 39L7 34L24.3208 24L32.9808 29L15.6608 39Z"
      fill="rgb(0,235,210)"
      fill-rule="nonzero"
    />
  </svg>
</template>
