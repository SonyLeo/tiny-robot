<script setup lang="ts">
import TrMarkdown from '../../../components/src/markdown'
import type { MarkdownDemoPreviewProps } from '../types/markdownDemo'

defineProps<MarkdownDemoPreviewProps>()
</script>

<template>
  <div class="custom-plugins-preview">
    <div class="custom-plugins-preview__meta">
      <strong>first-party semantic blocks</strong>
      <p>
        这个案例对齐 LobeUI `Custom Plugins` 的公开效果，但仍然保持 TinyRobot 的边界冻结: 不公开 `remarkPlugins /
        rehypePlugins`，而是把 `tr-thinking / tr-artifact` 做成第一方语义块。
      </p>
    </div>

    <TrMarkdown :content="controls.content" :style="markdownStyle" v-bind="markdownProps" />
  </div>
</template>

<style scoped>
.custom-plugins-preview {
  display: grid;
  gap: 14px;
}

.custom-plugins-preview__meta {
  display: grid;
  gap: 4px;
}

.custom-plugins-preview__meta strong,
.custom-plugins-preview__meta p {
  margin: 0;
}

.custom-plugins-preview__meta strong {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.custom-plugins-preview__meta p {
  color: var(--tr-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}
</style>
