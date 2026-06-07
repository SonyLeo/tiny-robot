<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  identifier?: string
  title?: string
  type?: string
  language?: string
  content?: string
}>()

const resolvedTitle = computed(() => props.title || props.identifier || 'Artifact')
const resolvedType = computed(() => props.type || props.language || 'text/plain')
const svgPreviewSrc = computed(() => {
  if (resolvedType.value !== 'image/svg+xml' || !props.content) {
    return ''
  }

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(props.content)}`
})
const showSvgPreview = computed(() => Boolean(svgPreviewSrc.value))
</script>

<template>
  <section
    class="tr-markdown__artifact"
    data-artifact-block="true"
    :data-artifact-identifier="identifier || undefined"
    :data-artifact-type="resolvedType"
  >
    <header class="tr-markdown__artifact-header">
      <div class="tr-markdown__artifact-meta">
        <span class="tr-markdown__artifact-eyebrow">Artifact</span>
        <strong class="tr-markdown__artifact-title">{{ resolvedTitle }}</strong>
      </div>
      <span class="tr-markdown__artifact-type">{{ resolvedType }}</span>
    </header>
    <div class="tr-markdown__artifact-body">
      <slot>
        <figure v-if="showSvgPreview" class="tr-markdown__artifact-preview" data-artifact-preview="true">
          <img class="tr-markdown__artifact-preview-image" :src="svgPreviewSrc" :alt="resolvedTitle" />
        </figure>
        <pre class="tr-markdown__artifact-pre">{{ content }}</pre>
      </slot>
    </div>
  </section>
</template>
