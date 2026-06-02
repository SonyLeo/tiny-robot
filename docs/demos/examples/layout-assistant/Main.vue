<template>
  <div v-if="context.messages.length === 0" :ref="context.scrollHostRef" class="layout-assistant-demo__welcome">
    <div class="layout-assistant-demo__welcome-surface">
      <div class="layout-assistant-demo__welcome-copy">
        <span class="layout-assistant-demo__eyebrow">Layout Assistant Demo</span>
        <TrWelcome title="TinyRobot" description="您好，我是 TinyRobot，您的智能工作台助手" :icon="welcomeIcon" />
      </div>

      <TrPrompts
        :items="context.promptItems"
        :wrap="true"
        item-class="prompt-item"
        class="layout-assistant-demo__prompts"
        @item-click="context.handlePromptItemClick"
      />
    </div>
  </div>

  <div v-else class="layout-assistant-demo__main-content">
    <TrBubbleList
      :ref="context.scrollHostRef"
      class="layout-assistant-demo__bubble-list"
      :messages="context.messages"
      :role-configs="context.roles"
      auto-scroll
    />
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList, TrPrompts, TrWelcome } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'
import type { LayoutAssistantContext } from './context'

defineProps<{ context: LayoutAssistantContext }>()

const welcomeIcon = h(IconAi, { class: 'layout-assistant-demo__welcome-icon' })
</script>
