<template>
  <div class="scene-grid">
    <div data-testid="chat-message-transforms-trchat" class="chat-wrapper">
      <div class="transform-toolbar">
        <span data-testid="transform-trchat-chunk-count">chunks:{{ trChatChunkCount }}</span>
      </div>

      <TrChat :config="trChatConfig" />
    </div>

    <div data-testid="chat-message-transforms-whitebox" class="chat-wrapper">
      <div class="transform-toolbar">
        <span data-testid="transform-whitebox-chunk-count">chunks:{{ whiteboxChunkCount }}</span>
      </div>

      <TrChat.Root :runtime="whiteboxResolution.runtime" :ui="whiteboxResolution.ui">
        <TrChat.Page />
      </TrChat.Root>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BubbleContentRendererProps } from '@opentiny/tiny-robot'
import { computed, defineComponent, h, ref } from 'vue'
import { TrChat } from '@opentiny/tiny-robot-chat'
import { createOfficialSceneConfig } from './officialSceneConfig'
import { useStableSceneRuntime } from './useStableSceneRuntime'

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

const trChatChunkCount = ref(0)
const whiteboxChunkCount = ref(0)

const trChatTransforms = {
  onChunk() {
    trChatChunkCount.value += 1
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

const transformRenderers = {
  contentMatches: [
    {
      find: (_message: unknown, content: { type?: string; text?: string }) =>
        content.type === 'text' && Boolean(content.text?.startsWith('[card]')),
      renderer: TransformCardRenderer,
      priority: -2,
    },
  ],
}

const trChatConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Message Transforms',
    welcomeTitle: 'Message Transforms Welcome',
    welcomeDescription: 'Transform hooks should rewrite the final assistant message and preserve streaming state.',
    welcomePrompts: [{ label: 'transform prompt', description: 'transform prompt' }],
    messages: {
      renderers: transformRenderers,
      transforms: trChatTransforms,
    },
  }),
)

const whiteboxConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Message Transforms Root + Page',
    welcomeTitle: 'Message Transforms Root + Page',
    welcomeDescription: 'The whitebox page path should preserve config-owned transforms and renderers.',
    welcomePrompts: [{ label: 'transform prompt', description: 'transform prompt' }],
    messages: {
      renderers: transformRenderers,
      transforms: whiteboxTransforms,
    },
  }),
)

const whiteboxResolution = useStableSceneRuntime(whiteboxConfig)
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
