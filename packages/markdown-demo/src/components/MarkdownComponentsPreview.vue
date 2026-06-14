<script setup lang="ts">
import { computed, defineComponent, h, useSlots } from 'vue'
import TrMarkdown from '../../../components/src/markdown'
import type { MarkdownDemoPreviewProps } from '../types/markdownDemo'

const props = defineProps<MarkdownDemoPreviewProps>()

const DemoHeading = defineComponent({
  name: 'DemoMarkdownHeading',
  props: {
    level: {
      type: Number,
      required: true,
    },
    badge: {
      type: String,
      default: '',
    },
  },
  setup(componentProps) {
    const slots = useSlots()

    return () =>
      h(
        `h${Math.min(Math.max(componentProps.level, 1), 6)}`,
        {
          class: ['demo-markdown-heading', `demo-markdown-heading--${componentProps.level}`],
        },
        [
          componentProps.badge ? h('span', { class: 'demo-markdown-heading__badge' }, componentProps.badge) : undefined,
          slots.default?.(),
        ],
      )
  },
})

const DemoLink = defineComponent({
  name: 'DemoMarkdownLink',
  props: {
    href: {
      type: String,
      default: undefined,
    },
    rel: {
      type: String,
      default: undefined,
    },
    target: {
      type: String,
      default: undefined,
    },
    iconLabel: {
      type: String,
      default: '',
    },
    tone: {
      type: String,
      default: '',
    },
  },
  setup(componentProps) {
    const slots = useSlots()

    return () =>
      h(
        'a',
        {
          class: ['demo-markdown-link', componentProps.tone ? `demo-markdown-link--${componentProps.tone}` : undefined],
          href: componentProps.href,
          rel: componentProps.rel,
          target: componentProps.target,
          'data-link-tone': componentProps.tone || undefined,
        },
        [
          h('span', { class: 'demo-markdown-link__icon', 'aria-hidden': 'true' }, componentProps.iconLabel || '->'),
          slots.default?.(),
        ],
      )
  },
})

const DemoInlineCode = defineComponent({
  name: 'DemoMarkdownInlineCode',
  props: {
    code: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    tone: {
      type: String,
      default: '',
    },
  },
  setup(componentProps) {
    return () =>
      h(
        'code',
        {
          class: [
            'demo-markdown-inline-code',
            componentProps.tone ? `demo-markdown-inline-code--${componentProps.tone}` : undefined,
          ],
          'data-inline-tone': componentProps.tone || undefined,
        },
        [
          h('span', { class: 'demo-markdown-inline-code__label' }, componentProps.label || 'TOKEN'),
          h('span', componentProps.code),
        ],
      )
  },
})

const components = {
  heading: DemoHeading,
  link: DemoLink,
  inlineCode: DemoInlineCode,
}

const componentProps = computed(() => ({
  ...(props.markdownProps.componentProps || {}),
  heading: {
    badge: 'M5.7',
  },
  link: {
    iconLabel: 'DOCS',
    tone: 'brand',
  },
  inlineCode: {
    label: 'TOKEN',
    tone: 'brand',
  },
  paragraph: {
    class: 'demo-markdown-paragraph',
    'data-component-props-paragraph': 'true',
  },
}))
</script>

<template>
  <div class="components-preview">
    <div class="components-preview__meta">
      <strong>components + componentProps</strong>
      <p>
        这个案例同时走 `components` 和 `componentProps`，验证覆写组件与默认节点组件都能在不动 parser
        的前提下接到公开扩展参数。
      </p>
    </div>

    <TrMarkdown
      :content="controls.content"
      :style="markdownStyle"
      v-bind="markdownProps"
      :components="components"
      :component-props="componentProps"
    />
  </div>
</template>

<style scoped>
.components-preview {
  display: grid;
  gap: 14px;
}

.components-preview__meta {
  display: grid;
  gap: 4px;
}

.components-preview__meta strong,
.components-preview__meta p {
  margin: 0;
}

.components-preview__meta strong {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.components-preview__meta p {
  color: var(--tr-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

:deep(.demo-markdown-heading) {
  position: relative;
  padding-left: 16px;
  color: var(--tr-text-primary);
}

:deep(.demo-markdown-heading)::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  border-radius: 999px;
  background: linear-gradient(
    180deg,
    var(--tr-color-primary),
    color-mix(in srgb, var(--tr-color-primary) 36%, white 64%)
  );
}

:deep(.demo-markdown-heading__badge) {
  display: inline-flex;
  margin-right: 10px;
  padding: 0.16em 0.46em;
  border-radius: 999px;
  background: color-mix(in srgb, var(--tr-color-primary) 14%, transparent);
  color: var(--tr-color-primary);
  font-size: 11px;
  font-weight: var(--tr-font-weight-bold);
  letter-spacing: 0.04em;
  vertical-align: middle;
}

:deep(.demo-markdown-link) {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  color: var(--tr-color-primary);
  font-weight: var(--tr-font-weight-medium);
  text-decoration: none;
}

:deep(.demo-markdown-link:hover) {
  text-decoration: underline;
}

:deep(.demo-markdown-link--brand) {
  text-decoration-thickness: 0.08em;
}

:deep(.demo-markdown-link__icon) {
  font-size: 11px;
  opacity: 0.72;
}

:deep(.demo-markdown-paragraph) {
  padding-left: 12px;
  border-left: 2px solid color-mix(in srgb, var(--tr-color-primary) 20%, transparent);
}

:deep(.demo-markdown-inline-code) {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 0.24em 0.5em;
  border: 1px solid color-mix(in srgb, var(--tr-color-primary) 28%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--tr-color-primary) 12%, transparent);
  color: var(--tr-text-primary);
  font-size: 0.84em;
}

:deep(.demo-markdown-inline-code--brand) {
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tr-color-primary) 8%, transparent);
}

:deep(.demo-markdown-inline-code__label) {
  font-size: 10px;
  font-weight: var(--tr-font-weight-bold);
  letter-spacing: 0.04em;
  opacity: 0.7;
}
</style>
