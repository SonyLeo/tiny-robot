<script setup lang="ts">
defineProps<{
  src?: string
  title?: string
  poster?: string
  preload?: string
  controls?: boolean
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
  playsinline?: boolean
  crossorigin?: string
  controlslist?: string
  width?: string | number
  height?: string | number
}>()
</script>

<template>
  <div class="tr-markdown__video-wrap" data-video-node="true">
    <video
      class="tr-markdown__video"
      :src="src"
      :title="title"
      :poster="poster"
      :preload="preload"
      :controls="controls"
      :autoplay="autoplay"
      :loop="loop"
      :muted="muted"
      :playsinline="playsinline"
      :crossorigin="crossorigin"
      :controlslist="controlslist"
      :width="width"
      :height="height"
    />
  </div>
</template>
