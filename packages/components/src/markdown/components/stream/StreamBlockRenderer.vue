<script setup lang="ts">
import { computed, watch } from 'vue'
import type { TrMarkdownContext } from '../../context'
import NodeRenderer from '../../NodeRenderer'
import type { TrMarkdownStreamingPreset } from '../../index.type'
import { useStreamTextAnimation } from '../../stream/useStreamTextAnimation'
import type {
  TrMarkdownNodeAnimationMeta,
  TrMarkdownStreamBlock,
  TrMarkdownStreamBlockState,
} from '../../stream/streamingAnimation.type'
import type { TrMarkdownStreamProfiler } from '../../stream/streamProfiler'

const props = defineProps<{
  block: TrMarkdownStreamBlock
  blockIndex: number
  state: TrMarkdownStreamBlockState
  context: TrMarkdownContext
  queueLength: number
  preset: TrMarkdownStreamingPreset
  profiler?: TrMarkdownStreamProfiler
  resetRevision: number
}>()

const emit = defineEmits<{
  settled: [blockKey: string]
}>()

const getNow = () => {
  return typeof performance === 'undefined' ? Date.now() : performance.now()
}

let blockCommitStartedAt = 0
let blockCommitSeen = false

const visible = computed(() => props.state !== 'queued')
const shouldAnimate = computed(() => props.block.animationEligible && props.state !== 'revealed')

const controller = useStreamTextAnimation(
  () => props.block.animationText,
  computed(() => ({
    active: shouldAnimate.value,
    blockKey: props.block.key,
    queueLength: props.queueLength,
    preset: props.preset,
    profiler: props.profiler,
    revision: props.resetRevision,
    onSettled: () => emit('settled', props.block.key),
  })),
)

const animation = computed<TrMarkdownNodeAnimationMeta | undefined>(() => {
  if (!shouldAnimate.value || (props.state !== 'animating' && props.state !== 'streaming')) {
    return
  }

  return {
    blockKey: props.block.key,
    state: props.state,
    controller,
  }
})

watch(
  [() => props.state, () => controller.status.value, () => controller.exhausted.value],
  ([state, status, exhausted]) => {
    if (state === 'animating' && (status === 'settled' || exhausted)) {
      emit('settled', props.block.key)
    }
  },
  {
    immediate: true,
  },
)

watch(
  [() => props.block.key, () => props.state, () => props.block.animationText],
  () => {
    blockCommitStartedAt = getNow()
  },
  {
    immediate: true,
    flush: 'pre',
  },
)

watch(
  [() => props.block.key, () => props.state, () => props.block.animationText],
  ([blockKey, state, text]) => {
    props.profiler?.recordBlockCommit({
      blockChars: text.length,
      blockIndex: props.blockIndex,
      blockKey,
      durationMs: Math.max(0, getNow() - blockCommitStartedAt),
      phase: blockCommitSeen ? 'update' : 'mount',
      state,
    })
    blockCommitSeen = true
  },
  {
    immediate: true,
    flush: 'post',
  },
)
</script>

<template>
  <NodeRenderer v-if="visible" :node="block.node" :context="context" :animation="animation" />
</template>
