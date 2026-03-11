<script setup lang="ts">
import { useTheme, useToolCall, type BubbleContentRendererProps } from '@opentiny/tiny-robot'
import { IconCancelled, IconError, IconLoading, IconPlugin } from '@opentiny/tiny-robot-svgs'
import { MarkdownCodeBlockNode } from 'markstream-vue'
import { computed, reactive, useAttrs, watchEffect, type Component } from 'vue'

const props = defineProps<BubbleContentRendererProps & { toolCallIndex: number }>()

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()

const { toolCall, toolCallWithResult, state } = useToolCall(props)

const node = reactive({
  type: 'code_block' as const,
  language: 'json',
  code: '',
  raw: '',
})

watchEffect(() => {
  const code = JSON.stringify(toolCallWithResult.value, null, 2)

  node.code = code
  node.raw = code
})

const { resolvedColorMode } = useTheme()

const textAndIconMap = new Map<string, { text: string; icon: Component }>([
  ['running', { text: '正在调用', icon: IconLoading }],
  ['success', { text: '已调用', icon: IconPlugin }],
  ['failed', { text: '调用失败', icon: IconError }],
  ['cancelled', { text: '已取消', icon: IconCancelled }],
])

const textAndIcon = computed(() => {
  return textAndIconMap.get(state.value?.status || '') || { text: '', icon: IconPlugin }
})
</script>

<template>
  <div class="markstream-vue" v-bind="attrs">
    <MarkdownCodeBlockNode
      :node="node"
      :stream="true"
      :is-dark="resolvedColorMode === 'dark'"
      :showFontSizeButtons="false"
    >
      <template #header-left>
        <div class="header-left">
          <component :is="textAndIcon.icon" class="header-icon" :class="`icon-${state.status}`" />
          <span>
            <span>{{ textAndIcon.text }}&nbsp;</span>
            <span class="title">{{ toolCall?.function.name || 'Untitled' }} </span>
          </span>
        </div>
      </template>
    </MarkdownCodeBlockNode>
  </div>
</template>

<style lang="less" scoped>
.tr-bubble__box .markstream-vue:first-child > * {
  margin-top: 0;
}

.markstream-vue {
  :deep(pre),
  :deep(code) {
    overflow-wrap: break-word;
    word-break: break-word;
    white-space: pre-wrap;
    max-width: 100%;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  font-size: 14px;

  .title {
    color: var(--tr-text-primary);
    font-weight: 600;
  }

  .header-icon {
    font-size: 20px;
    flex-shrink: 0;

    &.icon-running {
      color: #898989;
      animation: spin 1s linear infinite;
    }

    &.icon-success {
      color: #898989;
    }

    &.icon-failed,
    &.icon-cancelled {
      color: var(--tr-color-error);
    }
  }
}
</style>
