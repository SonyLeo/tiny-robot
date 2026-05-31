<script setup lang="ts">
import TrMarkdown from '../../../components/src/markdown'
import type { MarkdownDemoPreviewProps } from '../types/markdownDemo'

defineProps<MarkdownDemoPreviewProps>()

const variantCards = [
  {
    id: 'default',
    label: 'default',
    description: '默认文档阅读视图，保留完整 typography 节奏。',
  },
  {
    id: 'bubble',
    label: 'bubble',
    description: '对话气泡视图，正文更紧凑，列表与内联节点缩得更贴近消息场景。',
  },
  {
    id: 'article',
    label: 'article',
    description: '长文阅读视图，段落和标题节奏更偏连续阅读。',
  },
] as const
</script>

<template>
  <div class="variants-preview">
    <section v-for="card in variantCards" :key="card.id" class="variants-preview__card">
      <header class="variants-preview__meta">
        <strong>{{ card.label }}</strong>
        <p>{{ card.description }}</p>
      </header>
      <TrMarkdown :content="controls.content" :style="markdownStyle" v-bind="markdownProps" :variant="card.id" />
    </section>
  </div>
</template>

<style scoped>
.variants-preview {
  display: grid;
  gap: 16px;
}

.variants-preview__card {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 18%, transparent);
  border-radius: 18px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 94%, transparent);
}

.variants-preview__meta {
  display: grid;
  gap: 4px;
}

.variants-preview__meta strong,
.variants-preview__meta p {
  margin: 0;
}

.variants-preview__meta strong {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.variants-preview__meta p {
  font-size: 13px;
  line-height: 1.6;
  color: var(--tr-text-secondary);
}
</style>
