<script setup lang="ts">
import { computed } from 'vue'
import { TrWelcome, TrPrompts } from '@opentiny/tiny-robot'
import type { Component, VNode } from 'vue'
import type { PromptProps } from '@opentiny/tiny-robot'

defineOptions({ name: 'TrChatWelcome' })

interface Props {
  title: string
  description?: string
  icon?: VNode | Component
  prompts?: PromptProps[]
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'prompt-click': [description: string] }>()

const iconVNode = computed(() => props.icon as VNode | undefined)
const welcomeStyle = computed(() => ({
  '--title-color': 'var(--chat-text-primary)',
  '--description-color': 'var(--chat-text-secondary)',
}))
</script>

<template>
  <div class="tr-chat__welcome">
    <TrWelcome :title="props.title" :description="props.description || ''" :icon="iconVNode" :style="welcomeStyle" />
    <!-- UI-W2：传 wrap=true 使 Prompt 卡片可换行；添加容器类供布局测试锚点 -->
    <TrPrompts
      v-if="props.prompts?.length"
      :items="props.prompts"
      :wrap="true"
      class="tr-chat__welcome-prompts"
      @item-click="(_ev, item) => emit('prompt-click', item.description ?? item.label)"
    />
  </div>
</template>
