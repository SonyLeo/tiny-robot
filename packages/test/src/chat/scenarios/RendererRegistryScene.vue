<template>
  <div class="scene-grid">
    <div data-testid="chat-renderer-registry-blackbox" class="chat-wrapper">
      <TrChat :config="blackboxConfig" />
    </div>

    <div data-testid="chat-renderer-registry-whitebox" class="chat-wrapper">
      <TrChat.Root :runtime="whiteboxResolution.runtime" :ui="whiteboxResolution.ui">
        <TrChat.Page />
      </TrChat.Root>
    </div>

    <div data-testid="chat-renderer-registry-granular" class="chat-wrapper">
      <TrChat.Root :runtime="granularResolution.runtime" :ui="granularResolution.ui">
        <TrChat.Layout
          :appearance="granularResolution.ui.appearance"
          :content-layout="granularResolution.ui.contentLayout"
        >
          <TrChat.Header :title="granularResolution.ui.brand?.title" />
          <TrChat.MessageList :compatibility-relay="false" variant="bubble" />
          <TrChat.Footer>
            <TrChat.Sender />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Root>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BubbleRenderers } from '@opentiny/tiny-robot'
import type { BubbleContentRendererProps } from '@opentiny/tiny-robot'
import { computed, defineComponent, h } from 'vue'
import { TrChat, createRuntimeFromConfig, type TrChatConfig } from '@opentiny/tiny-robot-chat'
import { createOfficialSceneConfig } from './officialSceneConfig'

const CustomCardRenderer = defineComponent({
  name: 'OfficialRendererRegistryCard',
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

const rendererRegistryMessages: NonNullable<NonNullable<TrChatConfig['conversation']>['initialMessages']> = [
  {
    id: 'renderer-registry-assistant-card',
    role: 'assistant',
    content: '[card] Official custom renderer card',
  },
  {
    id: 'renderer-registry-user-divider',
    role: 'user',
    content: 'divider',
  },
  {
    id: 'renderer-registry-assistant-plain',
    role: 'assistant',
    content: 'Plain assistant fallback',
  },
]

const rendererRegistryConfig = {
  renderers: {
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
  },
} satisfies NonNullable<TrChatConfig['messages']>

const blackboxConfig = computed<TrChatConfig>(() =>
  createOfficialSceneConfig({
    brandTitle: 'Renderer Registry Blackbox',
    welcomeTitle: 'Renderer Registry Blackbox',
    welcomeDescription: 'Official TrChat path should consume message runtime renderers.',
    contentLayout: 'wide',
    initialMessages: rendererRegistryMessages,
    messages: rendererRegistryConfig,
  }),
)

const whiteboxConfig = computed<TrChatConfig>(() =>
  createOfficialSceneConfig({
    brandTitle: 'Renderer Registry Root + Page',
    welcomeTitle: 'Renderer Registry Root + Page',
    welcomeDescription: 'Official Root + Page path should consume the same renderer registry.',
    contentLayout: 'wide',
    initialMessages: rendererRegistryMessages,
    messages: rendererRegistryConfig,
  }),
)

const granularConfig = computed<TrChatConfig>(() =>
  createOfficialSceneConfig({
    brandTitle: 'Renderer Registry Root + primitives',
    welcomeTitle: 'Renderer Registry Root + primitives',
    welcomeDescription: 'Official granular path should consume runtime-owned renderers without page relay.',
    contentLayout: 'wide',
    initialMessages: rendererRegistryMessages,
    messages: rendererRegistryConfig,
  }),
)

const whiteboxResolution = computed(() => createRuntimeFromConfig(whiteboxConfig.value))
const granularResolution = computed(() => createRuntimeFromConfig(granularConfig.value))
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
