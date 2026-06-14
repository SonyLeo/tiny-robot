<script setup lang="ts">
import { computed, markRaw } from 'vue'
import {
  Bubble,
  BubbleList,
  BubbleProvider,
  BubbleRendererMatchPriority,
  BubbleRenderers,
} from '../../../components/src/bubble'
import type {
  BubbleContentAttributesConfig,
  BubbleContentRendererMatch,
  BubbleMessage,
  BubbleRoleConfig,
} from '../../../components/src/bubble/index.type'
import type { MarkdownDemoPreviewProps } from '../types/markdownDemo'

const props = defineProps<MarkdownDemoPreviewProps>()

const markdownRenderer = markRaw(BubbleRenderers.Markdown)

const roleConfigs: Record<string, BubbleRoleConfig> = {
  user: {
    placement: 'end',
  },
}

const resolveMarkdownLink = () => ({
  ...(props.markdownProps.link || {}),
  target: '_self',
  rel: props.markdownProps.link?.rel || 'nofollow noopener',
})

const fallbackMarkdownAttributes: BubbleContentAttributesConfig = () => ({
  markdown: {
    ...props.markdownProps,
    link: resolveMarkdownLink(),
  },
  style: props.markdownStyle,
  'data-bubble-markdown-mode': 'fallback',
})

const contentTypeMarkdownAttributes: BubbleContentAttributesConfig = (_, content) => {
  if (content.type !== 'markdown') {
    return undefined
  }

  return {
    markdown: {
      ...props.markdownProps,
      link: resolveMarkdownLink(),
    },
    style: props.markdownStyle,
    'data-bubble-markdown-mode': 'content-type',
  }
}

const contentRendererMatches = computed<Array<BubbleContentRendererMatch>>(() => [
  {
    find: (_, content) => content.type === 'markdown',
    renderer: markdownRenderer,
    priority: BubbleRendererMatchPriority.CONTENT,
  },
])

const explicitMessages = computed<BubbleMessage[]>(() => [
  {
    role: 'user',
    content: 'Please keep this markdown reply inside the assistant bubble.',
  },
  {
    role: 'assistant',
    content: [
      {
        type: 'markdown',
        text: props.controls.content,
      },
      {
        type: 'text',
        text: 'This trailing text item intentionally stays on the plain text renderer to verify split content routing.',
      },
    ],
  },
])
</script>

<template>
  <div class="bubble-preview">
    <section class="bubble-preview__group">
      <div class="bubble-preview__meta">
        <p class="bubble-preview__title">Fallback renderer</p>
        <p class="bubble-preview__desc">
          String content + `fallbackContentRenderer=&quot;BubbleRenderers.Markdown&quot;`.
        </p>
      </div>

      <BubbleProvider :content-attributes="fallbackMarkdownAttributes">
        <Bubble :content="controls.content" role="assistant" :fallback-content-renderer="BubbleRenderers.Markdown" />
      </BubbleProvider>
    </section>

    <section class="bubble-preview__group">
      <div class="bubble-preview__meta">
        <p class="bubble-preview__title">Explicit markdown content type</p>
        <p class="bubble-preview__desc">
          Provider-level match routes `{ type: 'markdown', text }` to `BubbleRenderers.Markdown`.
        </p>
      </div>

      <BubbleProvider
        :content-renderer-matches="contentRendererMatches"
        :content-attributes="contentTypeMarkdownAttributes"
      >
        <BubbleList :messages="explicitMessages" :role-configs="roleConfigs" content-render-mode="split" />
      </BubbleProvider>
    </section>
  </div>
</template>

<style scoped>
.bubble-preview {
  display: grid;
  gap: 18px;
}

.bubble-preview__group {
  display: grid;
  gap: 10px;
  padding: 16px;
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 18%, transparent);
  border-radius: 18px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 94%, transparent);
}

.bubble-preview__meta {
  display: grid;
  gap: 4px;
}

.bubble-preview__title,
.bubble-preview__desc {
  margin: 0;
}

.bubble-preview__title {
  font-size: 13px;
  font-weight: 700;
  color: var(--tr-text-primary);
}

.bubble-preview__desc {
  font-size: 13px;
  line-height: 1.6;
  color: var(--tr-text-secondary);
}
</style>
