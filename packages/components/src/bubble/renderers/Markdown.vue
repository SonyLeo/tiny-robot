<script setup lang="ts">
import { useMessageContent } from '../composables'
import { BubbleContentRendererProps } from '../index.type'
import { TrMarkdown } from '../../markdown'
import Text from './Text.vue'

const props = defineProps<BubbleContentRendererProps>()

const { contentText: content } = useMessageContent(props)
</script>

<template>
  <TrMarkdown v-if="content" class="tr-bubble__markdown" data-type="markdown" variant="bubble" :content="content" />
  <Text v-else v-bind="props" />
</template>

<style scoped lang="less">
.tr-bubble__markdown {
  width: 100%;
}
</style>
