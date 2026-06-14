<script setup lang="ts">
import { computed } from 'vue'
import TrMarkdown from '../../../components/src/markdown'
import type { MarkdownDemoPreviewProps } from '../types/markdownDemo'

const props = defineProps<MarkdownDemoPreviewProps>()

const citations = computed(() => props.markdownProps.citations || [])

const getCitationTitle = (citation: (typeof citations.value)[number], index: number) => {
  if (citation.title) {
    return citation.title
  }

  if (citation.alt) {
    return citation.alt
  }

  try {
    return new URL(citation.url).hostname.replace(/^www\./, '')
  } catch {
    return `Citation ${index + 1}`
  }
}
</script>

<template>
  <div class="citations-preview">
    <div class="citations-preview__meta">
      <strong>citations + first-party refs</strong>
      <p>
        这个案例对齐 LobeUI 的 `Citations` 文档组织：上方先展示来源卡片，正文中的 `[1] / [2]` 再升级为第一方引用节点，
        保持 markdown 渲染链路本身不暴露通用插件接口。
      </p>
    </div>

    <div v-if="citations.length" class="citations-preview__sources" data-citation-source-list="true">
      <a
        v-for="(citation, index) in citations"
        :key="citation.url"
        class="citations-preview__source-card"
        :href="citation.url"
        target="_blank"
        rel="noopener noreferrer"
        data-citation-source-card="true"
      >
        <span class="citations-preview__source-index">[{{ index + 1 }}]</span>
        <strong>{{ getCitationTitle(citation, index) }}</strong>
        <span>{{ citation.summary || citation.url }}</span>
      </a>
    </div>

    <TrMarkdown :content="controls.content" :style="markdownStyle" v-bind="markdownProps" />
  </div>
</template>

<style scoped>
.citations-preview {
  display: grid;
  gap: 14px;
}

.citations-preview__meta {
  display: grid;
  gap: 4px;
}

.citations-preview__meta strong,
.citations-preview__meta p {
  margin: 0;
}

.citations-preview__meta strong {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.citations-preview__meta p {
  color: var(--tr-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.citations-preview__sources {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
}

.citations-preview__source-card {
  display: grid;
  gap: 6px;
  min-height: 108px;
  padding: 14px 16px;
  border: 1px solid color-mix(in srgb, var(--tr-color-primary) 18%, transparent);
  border-radius: 18px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--tr-color-primary) 8%, transparent),
    color-mix(in srgb, var(--tr-container-bg-default) 92%, transparent)
  );
  color: var(--tr-text-primary);
  text-decoration: none;
}

.citations-preview__source-card:hover {
  border-color: color-mix(in srgb, var(--tr-color-primary) 30%, transparent);
  transform: translateY(-1px);
}

.citations-preview__source-card strong {
  font-size: 14px;
  line-height: 1.5;
}

.citations-preview__source-card span {
  color: var(--tr-text-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.citations-preview__source-index {
  color: var(--tr-color-primary) !important;
  font-weight: var(--tr-font-weight-bold);
  letter-spacing: 0.04em;
}
</style>
