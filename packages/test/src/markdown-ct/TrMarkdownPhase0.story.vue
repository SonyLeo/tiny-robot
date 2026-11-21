<script setup lang="ts">
import { computed } from 'vue'
import TrBubble from '../../../components/src/bubble/Bubble.vue'
import TrBubbleProvider from '../../../components/src/bubble/BubbleProvider.vue'
import BubbleMarkdown from '../../../components/src/bubble/renderers/Markdown.vue'
import TrMarkdown from '../../../components/src/markdown/TrMarkdown.vue'
import type { TrMarkdownProps } from '../../../components/src/markdown/index.type'
import '../../../components/src/markdown/styles/markdown.less'

const props = withDefaults(
  defineProps<{
    content?: string
    features?: TrMarkdownProps['features']
    mode?: 'standalone' | 'bubble'
    streaming?: TrMarkdownProps['streaming']
    theme?: 'light' | 'dark'
    variant?: TrMarkdownProps['variant']
  }>(),
  {
    content: '',
    mode: 'standalone',
    theme: 'light',
    variant: 'default',
  },
)

const rootClass = computed(() => [
  `markdown-phase0`,
  `markdown-phase0--${props.mode}`,
  `markdown-phase0--${props.theme}`,
])
</script>

<template>
  <main :class="rootClass" :data-tr-color-mode="theme" data-phase0-baseline>
    <section v-if="mode === 'standalone'" class="markdown-phase0__surface" data-testid="phase0-standalone">
      <TrMarkdown :content="content" :features="features" :streaming="streaming" :variant="variant" />
    </section>
    <section v-else class="markdown-phase0__surface" data-testid="phase0-bubble">
      <TrBubbleProvider>
        <TrBubble :content="content" :fallback-content-renderer="BubbleMarkdown" />
      </TrBubbleProvider>
    </section>
  </main>
</template>

<style>
.markdown-phase0 {
  width: 720px;
  padding: 28px;
  font-family: Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  box-sizing: border-box;
  background: var(--tr-container-bg-default);
  color: var(--tr-text-primary);
}

.markdown-phase0--dark {
  background: var(--tr-container-bg-default);
}

.markdown-phase0__surface {
  width: 100%;
}

@media (max-width: 375px) {
  .markdown-phase0 {
    width: 375px;
    padding: 18px;
  }
}
</style>
