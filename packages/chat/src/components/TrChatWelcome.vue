<script setup lang="ts">
import { computed } from 'vue'
import { TrWelcome, TrPrompts } from '@opentiny/tiny-robot'
import type { Component, VNode } from 'vue'
import type { PromptProps } from '@opentiny/tiny-robot'

interface Props {
  title: string
  description?: string
  icon?: VNode | Component
  prompts?: PromptProps[]
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'prompt-click': [description: string] }>()

const iconVNode = computed(() => props.icon as VNode | undefined)
</script>

<template>
  <div class="tr-chat__welcome">
    <TrWelcome :title="props.title" :description="props.description || ''" :icon="iconVNode" />
    <TrPrompts
      v-if="props.prompts?.length"
      :items="props.prompts"
      @item-click="(_ev, item) => emit('prompt-click', item.description ?? item.label)"
    />
  </div>
</template>
