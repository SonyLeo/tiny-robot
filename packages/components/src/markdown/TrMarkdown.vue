<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { provideMarkdownContext } from './context'
import type { TrMarkdownProps, TrMarkdownRenderNode } from './index.type'
import { markdownItAdapter } from './parser/markdownItAdapter'
import NodeRenderer from './NodeRenderer'

const defaultCodeConfig = {
  copyable: true,
  showLanguage: true,
  inlineColorPreview: true,
  blockMode: 'overlay',
  defaultExpand: true,
  highlight: {
    enabled: true,
    engine: 'highlightjs',
    enableTransformer: false,
  },
} as const

const props = withDefaults(defineProps<TrMarkdownProps>(), {
  content: '',
  variant: 'default',
  parser: () => markdownItAdapter,
  parserOptions: () => ({
    html: false,
    linkify: true,
    typographer: false,
    breaks: false,
  }),
  features: () => ({
    html: false,
  }),
  code: () => ({
    copyable: true,
    showLanguage: true,
    inlineColorPreview: true,
    blockMode: 'overlay',
    defaultExpand: true,
    highlight: {
      enabled: true,
      engine: 'highlightjs',
      enableTransformer: false,
    },
  }),
  link: () => ({
    target: '_blank',
    rel: 'noopener noreferrer',
  }),
  components: () => ({}),
})

const resolvedCode = computed(() => ({
  ...defaultCodeConfig,
  ...props.code,
  highlight: {
    ...defaultCodeConfig.highlight,
    ...props.code?.highlight,
  },
}))

provideMarkdownContext({
  variant: props.variant,
  features: props.features,
  code: resolvedCode.value,
  link: props.link,
  components: props.components,
})

const nodes = ref<TrMarkdownRenderNode[]>([])
const parserOptionsKey = computed(() => JSON.stringify(props.parserOptions || {}))
const featuresKey = computed(() => JSON.stringify(props.features || {}))
const markdownContext = computed(() => ({
  variant: props.variant,
  features: props.features,
  code: resolvedCode.value,
  link: props.link,
  components: props.components,
}))

const parseMarkdown = async () => {
  nodes.value = await props.parser.parse(props.content || '', {
    ...props.parserOptions,
    html: props.features.html || props.parserOptions.html,
  })
}

watch(() => [props.content, props.parser, parserOptionsKey.value, featuresKey.value], parseMarkdown, {
  immediate: true,
})

const rootClass = computed(() => [`tr-markdown`, `tr-markdown--${props.variant}`])
</script>

<template>
  <div class="tr-markdown-root" :class="rootClass">
    <NodeRenderer
      v-for="(node, index) in nodes"
      :key="`${node.type}-${node.tag || 'node'}-${index}`"
      :node="node"
      :context="markdownContext"
    />
  </div>
</template>
