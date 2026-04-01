<template>
  <div class="scene-grid">
    <div data-testid="chat-message-transforms-blackbox" class="chat-wrapper">
      <div class="transform-toolbar">
        <span data-testid="transform-blackbox-chunk-count">chunks:{{ blackboxChunkCount }}</span>
      </div>

      <TrChat
        :config="messageTransformsConfig"
        :runtime="{
          messageTransforms: blackboxTransforms,
        }"
        :preset-overrides="messageTransformsOverrides"
      />
    </div>

    <div data-testid="chat-message-transforms-whitebox" class="chat-wrapper">
      <div class="transform-toolbar">
        <span data-testid="transform-whitebox-chunk-count">chunks:{{ whiteboxChunkCount }}</span>
      </div>

      <TrChat.Root :chat-kit="messageTransformsWhiteboxChat" v-bind="messageTransformsWhiteboxSlices.root">
        <TrChat.Layout
          v-bind="{ ...messageTransformsWhiteboxSlices.layout, ...messageTransformsWhiteboxSlices.appearance }"
        >
          <TrChat.Header v-bind="messageTransformsWhiteboxSlices.header" />
          <TrChat.Welcome
            v-if="messageTransformsWhiteboxChat.messages.value.length === 0 && messageTransformsWhiteboxSlices.welcome"
            v-bind="messageTransformsWhiteboxSlices.welcome"
            @prompt-click="messageTransformsWhiteboxChat.sendMessage($event)"
          />
          <TrChat.MessageList v-else v-bind="messageTransformsWhiteboxSlices.messageList" />
          <TrChat.Footer>
            <TrChat.Sender v-bind="messageTransformsWhiteboxSlices.sender" />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Root>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BubbleContentRendererProps } from '@opentiny/tiny-robot'
import { defineComponent, h, ref } from 'vue'
import {
  TrChat,
  createChatAdapterFromConfig,
  createPresetChatProps,
  createPresetChatSlices,
  useChatKit,
} from '@opentiny/tiny-robot-chat'
import { createChatSceneConfig } from './sharedDemoFixtures'

const TransformCardRenderer = defineComponent({
  name: 'TransformCardRenderer',
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
          'data-testid': 'message-transform-card',
        },
        typeof props.message.content === 'string' ? props.message.content : JSON.stringify(props.message.content),
      )
  },
})

const messageTransformsConfig = createChatSceneConfig({
  ui: {
    brand: {
      title: 'Message Transforms',
    },
    welcome: {
      title: 'Message Transforms Welcome',
      description: 'Transform hooks should rewrite the final assistant message and preserve streaming state.',
    },
    prompts: [{ label: 'transform prompt', description: 'transform prompt' }],
  },
})

const messageTransformsOverrides = {
  bubbleRenderers: {
    contentMatches: [
      {
        find: (_message: unknown, content: { type?: string; text?: string }) =>
          content?.type === 'text' && content.text?.startsWith('[card]'),
        renderer: TransformCardRenderer,
        priority: -2,
      },
    ],
  },
}

const blackboxChunkCount = ref(0)
const whiteboxChunkCount = ref(0)

const blackboxTransforms = {
  onChunk() {
    blackboxChunkCount.value += 1
  },
  onFinish({ message }: { message: { content?: string; metadata?: Record<string, unknown> } }) {
    return {
      content: `[card] ${message.content ?? ''}`,
      metadata: {
        ...(message.metadata ?? {}),
        transformed: true,
      },
    }
  },
}

const whiteboxTransforms = {
  onChunk() {
    whiteboxChunkCount.value += 1
  },
  onFinish({ message }: { message: { content?: string; metadata?: Record<string, unknown> } }) {
    return {
      content: `[card] ${message.content ?? ''}`,
      metadata: {
        ...(message.metadata ?? {}),
        transformed: true,
      },
    }
  },
}

const messageTransformsWhiteboxAdapter = createChatAdapterFromConfig(messageTransformsConfig)
const messageTransformsWhiteboxPreset = createPresetChatProps(
  messageTransformsWhiteboxAdapter,
  messageTransformsOverrides,
)
const messageTransformsWhiteboxSlices = createPresetChatSlices(messageTransformsWhiteboxPreset)
const messageTransformsWhiteboxChat = useChatKit({
  responseProvider: messageTransformsWhiteboxAdapter.createResponseProvider(),
  messageTransforms: whiteboxTransforms,
})
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

.transform-toolbar {
  display: flex;
  gap: 8px;
  padding: 8px 12px 0;
  font-size: 12px;
}

.transform-toolbar span {
  padding: 2px 6px;
  border-radius: 999px;
  background: #eef2ff;
}
</style>
