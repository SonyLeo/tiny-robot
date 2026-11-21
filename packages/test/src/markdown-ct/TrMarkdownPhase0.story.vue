<script setup lang="ts">
import { computed } from 'vue'
import TrBubble from '../../../components/src/bubble/Bubble.vue'
import TrBubbleProvider from '../../../components/src/bubble/BubbleProvider.vue'
import BubbleMarkdown from '../../../components/src/bubble/renderers/Markdown.vue'
import TrMarkdown from '../../../components/src/markdown/TrMarkdown.vue'
import '../../../components/src/styles/components/bubble.less'
import type { TrMarkdownProps } from '../../../components/src/markdown/index.type'
import ThemeProvider from '../../../components/src/theme-provider/index.vue'
import '../../../components/src/markdown/styles/markdown.less'

const props = withDefaults(
  defineProps<{
    content?: string
    features?: TrMarkdownProps['features']
    mode?: 'standalone' | 'bubble'
    headingScale?: number
    narrow?: boolean
    streaming?: TrMarkdownProps['streaming']
    theme?: 'light' | 'dark'
    variant?: TrMarkdownProps['variant']
  }>(),
  {
    content: '',
    mode: 'standalone',
    headingScale: undefined,
    narrow: false,
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
  <main
    :class="[
      ...rootClass,
      {
        'markdown-phase0--heading-scale-override': headingScale !== undefined,
        'markdown-phase0--narrow': narrow,
      },
    ]"
    data-phase0-baseline
    :style="headingScale === undefined ? undefined : { '--phase0-heading-scale': headingScale }"
  >
    <ThemeProvider :color-mode="theme" target-element="html">
      <section v-if="mode === 'standalone'" class="markdown-phase0__surface" data-testid="phase0-standalone">
        <TrMarkdown :content="content" :features="features" :streaming="streaming" :variant="variant" />
      </section>
      <section v-else class="markdown-phase0__surface" data-testid="phase0-bubble">
        <TrBubbleProvider>
          <TrBubble :content="content" :fallback-content-renderer="BubbleMarkdown" />
        </TrBubbleProvider>
      </section>
    </ThemeProvider>
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

<style>
.markdown-phase0--heading-scale-override .tr-markdown--bubble {
  --tr-markdown-heading-scale: var(--phase0-heading-scale);
}

.markdown-phase0--narrow {
  width: 375px;
  padding: 18px;
}
</style>
