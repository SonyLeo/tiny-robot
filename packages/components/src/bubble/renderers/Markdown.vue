<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { useMessageContent } from '../composables'
import type { BubbleContentRendererProps } from '../index.type'
import { TrMarkdown } from '../../markdown'
import type { TrMarkdownProps } from '../../markdown'
import Text from './Text.vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<BubbleContentRendererProps>()
const attrs = useAttrs()

const { content } = useMessageContent(props)

const markdownContent = computed(() => {
  const text = content.value?.text
  return typeof text === 'string' ? text : ''
})

const markdownVariant = computed<NonNullable<TrMarkdownProps['variant']>>(() => {
  const variant = attrs.variant
  return variant === 'default' || variant === 'article' || variant === 'bubble' ? variant : 'bubble'
})

const markdownPropsKeys = new Set<keyof TrMarkdownProps>([
  'citations',
  'components',
  'componentProps',
  'content',
  'code',
  'features',
  'link',
  'parser',
  'parserOptions',
  'renderOptions',
  'streaming',
  'variant',
])

const markdownScopedAttrs = computed<Partial<TrMarkdownProps>>(() => {
  const resolvedScopedAttrs = attrs.markdown

  if (!resolvedScopedAttrs || typeof resolvedScopedAttrs !== 'object' || Array.isArray(resolvedScopedAttrs)) {
    return {}
  }

  return resolvedScopedAttrs as Partial<TrMarkdownProps>
})

const legacyMarkdownAttrs = computed(() => {
  return Object.entries(attrs).reduce<Record<string, unknown>>((resolvedAttrs, [key, value]) => {
    if (key === 'markdown' || key === 'variant' || !markdownPropsKeys.has(key as keyof TrMarkdownProps)) {
      return resolvedAttrs
    }

    resolvedAttrs[key] = value
    return resolvedAttrs
  }, {})
})

const markdownAttrs = computed(() => ({
  ...legacyMarkdownAttrs.value,
  ...markdownScopedAttrs.value,
  variant: markdownVariant.value,
}))

const textAttrs = computed(() => ({
  ...attrs,
  ...props,
}))
</script>

<template>
  <TrMarkdown
    v-if="markdownContent"
    class="tr-bubble__markdown"
    data-type="markdown"
    :content="markdownContent"
    v-bind="markdownAttrs"
  />
  <Text v-else v-bind="textAttrs" />
</template>

<style scoped lang="less">
.tr-bubble__markdown {
  width: 100%;
}
</style>
