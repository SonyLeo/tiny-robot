<template>
  <div class="scene-grid">
    <div data-testid="chat-renderer-registry-blackbox" class="chat-wrapper">
      <TrChat
        :config="rendererRegistryConfig"
        :runtime="{
          chatKit: rendererRegistryBlackboxChat,
        }"
        :preset-overrides="rendererRegistryOverrides"
      />
    </div>

    <div data-testid="chat-renderer-registry-whitebox" class="chat-wrapper">
      <TrChat.Provider :chat-kit="rendererRegistryWhiteboxChat" v-bind="rendererRegistryWhiteboxSlices.provider">
        <TrChat.Layout
          v-bind="{ ...rendererRegistryWhiteboxSlices.layout, ...rendererRegistryWhiteboxSlices.appearance }"
        >
          <TrChat.Header v-bind="rendererRegistryWhiteboxSlices.header" />
          <TrChat.MessageList v-bind="rendererRegistryWhiteboxSlices.messageList" />
          <TrChat.Footer>
            <TrChat.Sender v-bind="rendererRegistryWhiteboxSlices.sender" />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Provider>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BubbleRenderers } from '@opentiny/tiny-robot'
import type { BubbleContentRendererProps } from '@opentiny/tiny-robot'
import { defineComponent, h } from 'vue'
import {
  TrChat,
  type TrChatPresetOverrides,
  createChatAdapterFromConfig,
  createPresetChatProps,
  createPresetChatSlices,
  useChatKit,
} from '@opentiny/tiny-robot-chat'
import { createChatSceneConfig } from './sharedDemoFixtures'

const CustomCardRenderer = defineComponent({
  name: 'RendererRegistryCard',
  props: {
    message: {
      type: Object,
      required: true,
    },
    contentIndex: {
      type: Number,
      required: true,
    },
  },
  setup(props: BubbleContentRendererProps) {
    return () =>
      h(
        'div',
        {
          'data-testid': 'renderer-registry-card',
        },
        typeof props.message.content === 'string' ? props.message.content : JSON.stringify(props.message.content),
      )
  },
})

const rendererRegistryMessages = [
  {
    role: 'assistant',
    content: '[card] Blackbox custom renderer card',
  },
  {
    role: 'user',
    content: 'divider',
  },
  {
    role: 'assistant',
    content: 'Plain assistant fallback',
  },
]

const rendererRegistryBubbleRenderers: NonNullable<TrChatPresetOverrides['bubbleRenderers']> = {
  contentMatches: [
    {
      find: (_message, content) => content.type === 'text' && Boolean(content.text?.startsWith('[card]')),
      renderer: CustomCardRenderer,
      priority: -2,
    },
  ],
  boxMatches: [
    {
      find: (messages, content) =>
        messages.length === 1 &&
        messages[0]?.role === 'assistant' &&
        content?.type === 'text' &&
        Boolean(content.text?.startsWith('[card]')),
      renderer: BubbleRenderers.Box,
      priority: -2,
      attributes: {
        'data-registry-box': 'true',
      },
    },
  ],
}

const rendererRegistryConfig = createChatSceneConfig({
  ui: {
    brand: {
      title: 'Renderer Registry',
    },
  },
  features: {
    feedback: true,
  },
})

const rendererRegistryOverrides = {
  bubbleRenderers: rendererRegistryBubbleRenderers,
}

const rendererRegistryWhiteboxAdapter = createChatAdapterFromConfig(rendererRegistryConfig)
const rendererRegistryWhiteboxPreset = createPresetChatProps(rendererRegistryWhiteboxAdapter, rendererRegistryOverrides)
const rendererRegistryWhiteboxSlices = createPresetChatSlices(rendererRegistryWhiteboxPreset)
const rendererRegistryBlackboxChat = useChatKit({
  responseProvider: rendererRegistryWhiteboxAdapter.createResponseProvider(),
})
const rendererRegistryWhiteboxChat = useChatKit({
  responseProvider: rendererRegistryWhiteboxAdapter.createResponseProvider(),
})

const rendererRegistryBlackboxConversation = rendererRegistryBlackboxChat.createConversation({
  title: 'Renderer Registry Blackbox',
})
rendererRegistryBlackboxConversation.engine.messages.value.push(...rendererRegistryMessages)

const rendererRegistryWhiteboxConversation = rendererRegistryWhiteboxChat.createConversation({
  title: 'Renderer Registry Whitebox',
})
rendererRegistryWhiteboxConversation.engine.messages.value.push(...rendererRegistryMessages)
</script>

<style scoped>
.scene-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.chat-wrapper {
  position: relative;
  height: calc(100vh - 100px);
  min-height: 0;
  overflow: hidden;
  isolation: isolate;
}
</style>
