<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { splitTextGraphemes } from '../../stream/grapheme'
import type { TrMarkdownStreamTextAnimationController } from '../../stream/streamingAnimation.type'

const props = defineProps<{
  text: string
  startOffset: number
  controller: TrMarkdownStreamTextAnimationController
}>()

const graphemes = computed(() => splitTextGraphemes(props.text))
let previousFrameTs = 0
const getNow = () => {
  return typeof performance === 'undefined' ? Date.now() : performance.now()
}

const items = computed(() => {
  const nowMs = props.controller.nowMs.value
  const fadeDuration = props.controller.fadeDuration.value

  return graphemes.value.map((segment, index) => {
    const birth = props.controller.getBirthAt(props.startOffset + index)

    if (typeof birth !== 'number') {
      return {
        key: `${props.startOffset}-${index}`,
        segment,
        className: 'tr-markdown__stream-char tr-markdown__stream-char--revealed',
        style: undefined,
      }
    }

    const elapsed = nowMs - birth

    if (elapsed >= fadeDuration) {
      return {
        key: `${props.startOffset}-${index}`,
        segment,
        className: 'tr-markdown__stream-char tr-markdown__stream-char--revealed',
        style: undefined,
      }
    }

    return {
      key: `${props.startOffset}-${index}`,
      segment,
      className: 'tr-markdown__stream-char tr-markdown__stream-char--animating',
      style: {
        animationDelay: `${-elapsed}ms`,
      },
    }
  })
})

const revealCharCount = computed(() => items.value.filter((item) => item.className.includes('--animating')).length)

watchEffect(() => {
  const frameStart = getNow()
  const revealChars = revealCharCount.value
  const now = props.controller.nowMs.value
  const frameIntervalMs = previousFrameTs > 0 ? Math.max(0, now - previousFrameTs) : undefined
  previousFrameTs = now
  props.controller.profiler?.recordAnimationFrame({
    backlog: revealChars,
    blockKey: props.controller.blockKey,
    durationMs: Math.max(0, getNow() - frameStart),
    frameIntervalMs,
    inputActive: revealChars > 0,
    revealChars,
    skipped: revealChars === 0,
  })
})
</script>

<template>
  <span class="tr-markdown__stream-text">
    <span v-for="item in items" :key="item.key" :class="item.className" :style="item.style">
      {{ item.segment }}
    </span>
  </span>
</template>
