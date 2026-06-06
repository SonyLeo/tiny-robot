<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { HTML_PREVIEW_AUTO_HEIGHT_MESSAGE_TYPE, HTML_PREVIEW_SRCDOC_MAX_LENGTH } from './const'
import { buildStaticSrcDoc } from './utils'

const props = withDefaults(
  defineProps<{
    background?: string
    content?: string
    defaultHeight?: number
    sandbox?: string
    title?: string
  }>(),
  {
    defaultHeight: 400,
    title: 'HTML preview',
  },
)

const frameId = `tr-markdown-html-preview-${Math.random().toString(36).slice(2)}`
const iframeRef = ref<HTMLIFrameElement | null>(null)
const height = ref(props.defaultHeight)
const tooLarge = computed(() => (props.content || '').length > HTML_PREVIEW_SRCDOC_MAX_LENGTH)
const srcDoc = computed(() => {
  if (tooLarge.value) return ''

  return buildStaticSrcDoc({
    background: props.background,
    content: props.content || '',
    frameId,
  })
})

const handleMessage = (event: MessageEvent) => {
  const data = event.data
  if (!data || typeof data !== 'object') return
  if (event.source !== iframeRef.value?.contentWindow) return
  if (data.type !== HTML_PREVIEW_AUTO_HEIGHT_MESSAGE_TYPE || data.frameId !== frameId) return

  const nextHeight = Number(data.height)
  if (!Number.isFinite(nextHeight) || nextHeight <= 0) return

  height.value = Math.max(props.defaultHeight, nextHeight)
}

watch(
  () => props.defaultHeight,
  (nextHeight) => {
    height.value = nextHeight
  },
)

watch(srcDoc, () => {
  height.value = props.defaultHeight
})

onMounted(() => {
  window.addEventListener('message', handleMessage)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handleMessage)
})
</script>

<template>
  <div v-if="tooLarge" class="tr-markdown__html-preview-fallback">Content too large to preview inline.</div>
  <iframe
    v-else
    class="tr-markdown__html-preview-iframe"
    ref="iframeRef"
    :sandbox="sandbox"
    :srcdoc="srcDoc"
    :style="{ height: `${height}px` }"
    :title="title"
  />
</template>
