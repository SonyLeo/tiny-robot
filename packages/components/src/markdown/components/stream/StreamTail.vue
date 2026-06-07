<script setup lang="ts">
import { computed } from 'vue'
import type { TrMarkdownFeatureFlags, TrMarkdownStreamTailKind } from '../../index.type'
import HtmlPreviewBlock from '../html-preview/HtmlPreviewBlock.vue'
import { parseHtmlFenceTail, resolveHtmlPreviewConfig } from '../html-preview/utils'

const props = withDefaults(
  defineProps<{
    content?: string
    htmlPreview?: TrMarkdownFeatureFlags['htmlPreview']
    kind?: TrMarkdownStreamTailKind
    showCursor?: boolean
  }>(),
  {
    content: '',
    kind: 'text',
    showCursor: true,
  },
)

const isBlockTail = computed(() => props.kind === 'code' || props.kind === 'table')
const tailTag = computed(() => (isBlockTail.value ? 'pre' : 'div'))
const htmlPreviewConfig = computed(() => resolveHtmlPreviewConfig(props.htmlPreview))
const htmlFenceTail = computed(() => {
  if (props.kind !== 'code') {
    return
  }

  return parseHtmlFenceTail(props.content || '')
})
const shouldRenderHtmlPreviewTail = computed(() => {
  return Boolean(htmlPreviewConfig.value.enabled && htmlFenceTail.value)
})
</script>

<template>
  <HtmlPreviewBlock
    v-if="content && shouldRenderHtmlPreviewTail"
    class="tr-markdown__stream-tail tr-markdown__stream-tail--html-preview"
    :code="htmlFenceTail?.code || ''"
    :copyable="htmlPreviewConfig.copyable"
    :default-height="htmlPreviewConfig.defaultHeight"
    :default-mode="htmlPreviewConfig.defaultMode"
    :downloadable="htmlPreviewConfig.downloadable"
    :file-name="htmlPreviewConfig.fileName"
    :sandbox="htmlPreviewConfig.sandbox"
    :streaming-active="true"
    :streaming-mode="htmlPreviewConfig.streamingMode"
  />
  <component
    :is="tailTag"
    v-else-if="content"
    class="tr-markdown__stream-tail"
    aria-live="polite"
    aria-atomic="false"
    :class="[
      `tr-markdown__stream-tail--${kind}`,
      {
        'tr-markdown__stream-tail--cursor': showCursor,
      },
    ]"
  >
    <code v-if="kind === 'code'">{{ content }}</code>
    <template v-else>{{ content }}</template>
  </component>
</template>
