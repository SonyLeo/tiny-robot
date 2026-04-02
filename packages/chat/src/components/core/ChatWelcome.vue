<script setup lang="ts">
import { computed } from 'vue'
import { TrWelcome, TrPrompts } from '@opentiny/tiny-robot'
import type { Component, VNode } from 'vue'
import type { PromptProps } from '@opentiny/tiny-robot'
import { useChatScaffoldContext } from '@/shared/context'

defineOptions({ name: 'TrChatWelcome' })

interface Props {
  title?: string
  description?: string
  icon?: VNode | Component
  prompts?: PromptProps[]
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'prompt-click': [description: string] }>()
const scaffoldContext = useChatScaffoldContext()
const welcomeSlice = computed(() => scaffoldContext?.presetSlices.value.welcome)

const resolvedTitle = computed(() => props.title ?? welcomeSlice.value?.title ?? '')
const resolvedDescription = computed(() => props.description ?? welcomeSlice.value?.description ?? '')
const resolvedPrompts = computed(() => props.prompts ?? welcomeSlice.value?.prompts)
const iconVNode = computed(() => (props.icon ?? welcomeSlice.value?.icon) as VNode | undefined)

const welcomeStyle = computed(() => ({
  '--title-color': 'var(--chat-text-primary)',
  '--description-color': 'var(--chat-text-secondary)',
}))
</script>

<template>
  <div class="tr-chat__welcome">
    <TrWelcome :title="resolvedTitle" :description="resolvedDescription" :icon="iconVNode" :style="welcomeStyle" />
    <TrPrompts
      v-if="resolvedPrompts?.length"
      :items="resolvedPrompts"
      :wrap="true"
      class="tr-chat__welcome-prompts"
      @item-click="(_ev, item) => emit('prompt-click', item.description ?? item.label)"
    />
  </div>
</template>

<style scoped>
:deep(.tr-welcome__icon) {
  font-size: 32px;
}
</style>
