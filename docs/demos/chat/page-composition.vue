<template>
  <div class="chat-demo-shell">
    <div class="chat-demo-container">
      <TrChat.Root :runtime="resolution.runtime" :ui="resolution.ui">
        <TrChat.Page />
      </TrChat.Root>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrChat, createRuntimeFromConfig } from '@opentiny/tiny-robot-chat'

const config = {
  request: {
    models: [
      { id: 'gpt-4o-mini', providerId: 'openai', label: 'GPT-4o Mini' },
      { id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' },
    ],
    defaultModelId: 'gpt-4.1-mini',
    transport: {
      type: 'openai-compatible' as const,
      endpoint: '/api/chat/completions',
      systemPrompt: 'You are a helpful assistant for the TinyRobot docs.',
    },
  },
  ui: {
    brand: {
      title: 'TinyRobot Chat',
    },
    welcome: {
      title: 'Official Page Composition',
      description: 'This example owns runtime creation while keeping the official page structure.',
      prompts: [
        { label: 'Runtime bridge', description: 'Why use createRuntimeFromConfig before TrChat.Root + TrChat.Page?' },
        { label: 'Upgrade path', description: 'When should I move from the default page to page composition?' },
      ],
    },
    contentLayout: 'centered' as const,
  },
  sender: {
    placeholder: 'Ask something...',
    mode: 'multiple' as const,
    maxLength: 200,
    wordCount: true,
  },
  history: {
    enabled: true,
    defaultOpen: false,
  },
  workspace: {
    enabled: true,
    defaultView: 'workspace' as const,
    left: {
      enabled: true,
      defaultOpen: true,
      collapseMode: 'rail' as const,
    },
    right: {
      enabled: true,
      defaultOpen: false,
      collapseMode: 'hidden' as const,
    },
  },
  messages: {
    feedback: {
      enabled: true,
    },
  },
}

const resolution = createRuntimeFromConfig(config)
</script>

<style scoped>
.chat-demo-shell,
.chat-demo-container {
  height: 100%;
  min-height: 0;
}

.chat-demo-container {
  width: 100%;
  overflow: hidden;
  background: #fff;
}

:deep(.tr-chat),
:deep(.tr-chat-workspace-layout),
:deep(.tr-workspace-shell) {
  height: 100%;
  min-height: 0;
}
</style>
