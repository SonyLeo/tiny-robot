<script setup lang="ts">
import { computed, h } from 'vue'
import TrMarkdown from '../../../components/src/markdown'
import type { TrMarkdownAlertRenderContext } from '../../../components/src/markdown'
import type { MarkdownDemoPreviewProps } from '../types/markdownDemo'

const props = defineProps<MarkdownDemoPreviewProps>()

const renderCustomAlert = ({ kind, title, renderChildren }: TrMarkdownAlertRenderContext) => {
  const role = kind === 'warning' || kind === 'caution' ? 'alert' : 'note'

  return h(
    'section',
    {
      class: 'demo-markdown-alert',
      'data-custom-alert-kind': kind,
      role,
    },
    [
      h('header', { class: 'demo-markdown-alert__header' }, [
        h('span', { class: 'demo-markdown-alert__eyebrow' }, `ALERT / ${kind.toUpperCase()}`),
        h('strong', { class: 'demo-markdown-alert__title' }, title),
      ]),
      h('div', { class: 'demo-markdown-alert__body' }, renderChildren()),
    ],
  )
}

const renderOptions = computed(() => ({
  ...(props.markdownProps.renderOptions || {}),
  alerts: {
    ...(props.markdownProps.renderOptions?.alerts || {}),
    render: renderCustomAlert,
  },
}))
</script>

<template>
  <div class="alert-render-preview">
    <div class="alert-render-preview__meta">
      <strong>`renderOptions.alerts.render`</strong>
      <p>
        这个案例单独接管 alert 渲染边界，不复用默认 `AlertBlock`，只复用 markdown 子树，验证扩展点已经和默认实现解耦。
      </p>
    </div>

    <TrMarkdown
      :content="controls.content"
      :style="markdownStyle"
      v-bind="markdownProps"
      :render-options="renderOptions"
    />
  </div>
</template>

<style scoped>
.alert-render-preview {
  display: grid;
  gap: 14px;
}

.alert-render-preview__meta {
  display: grid;
  gap: 4px;
}

.alert-render-preview__meta strong,
.alert-render-preview__meta p {
  margin: 0;
}

.alert-render-preview__meta strong {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.alert-render-preview__meta p {
  color: var(--tr-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

:deep(.demo-markdown-alert) {
  display: grid;
  gap: 12px;
  padding: 16px 18px;
  border: 1px solid color-mix(in srgb, var(--tr-color-primary) 18%, transparent);
  border-radius: 18px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--tr-color-primary) 10%, transparent),
    color-mix(in srgb, var(--tr-container-bg-default) 88%, transparent)
  );
  box-shadow: 0 16px 32px color-mix(in srgb, var(--tr-color-primary) 8%, transparent);
}

:deep(.demo-markdown-alert__header) {
  display: grid;
  gap: 4px;
}

:deep(.demo-markdown-alert__eyebrow) {
  font-size: 11px;
  font-weight: var(--tr-font-weight-bold);
  letter-spacing: 0.08em;
  color: var(--tr-color-primary);
}

:deep(.demo-markdown-alert__title) {
  font-size: 16px;
  color: var(--tr-text-primary);
}

:deep(.demo-markdown-alert__body) {
  display: grid;
  gap: 10px;
}

:deep(.demo-markdown-alert__body .tr-markdown__paragraph:last-child) {
  margin-bottom: 0;
}
</style>
