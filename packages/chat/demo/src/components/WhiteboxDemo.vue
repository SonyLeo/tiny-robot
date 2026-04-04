<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  TrChat,
  createChatAdapterFromConfig,
  useChatKit,
  useMcpManager,
  TrModelSelector,
  TrMcpTrigger,
} from '@opentiny/tiny-robot-chat'
import type { TrChatPresetOverrides } from '@opentiny/tiny-robot-chat'
import { localStorageStrategyFactory, toolPlugin } from '@opentiny/tiny-robot-kit'
import { defaultMcpServers } from '../data/mcpServers'
import { WELCOME_CONFIG, WELCOME_PROMPTS, BRAND_CONFIG } from '../constants'
import { createDemoMcpBridge } from '../utils/mcpBridge'

const STORAGE_KEY = 'tiny-robot-chat-demo-whitebox-workspace-preview'
const SEEDED_FLAG_KEY = `${STORAGE_KEY}-seeded-v4`
const MOBILE_BREAKPOINT = '(max-width: 900px)'
const previewConversationTitles = ['2', '12312333123', '1', '新会话', '1']

const deepseekApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || ''
const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || ''

const mcpManager = useMcpManager({
  initialPlugins: defaultMcpServers,
  bridge: createDemoMcpBridge(),
})

const chatConfig = {
  models: [
    { id: 'deepseek-chat', label: 'DeepSeek Chat', providerId: 'deepseek' },
    { id: 'deepseek-reasoner', label: 'DeepSeek Reasoner', providerId: 'deepseek' },
    { id: 'gpt-4o', label: 'GPT-4o', providerId: 'openai' },
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini', providerId: 'openai' },
  ],
  providers: {
    deepseek: {
      baseURL: 'https://api.deepseek.com/v1',
      headers: {
        Authorization: `Bearer ${deepseekApiKey}`,
      },
      systemPrompt: 'You are a helpful assistant.',
    },
    openai: {
      baseURL: 'https://api.openai.com/v1',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
      },
      systemPrompt: 'You are a helpful assistant.',
    },
  },
  defaults: {
    model: 'deepseek-chat',
  },
  ui: {
    brand: BRAND_CONFIG,
    welcome: WELCOME_CONFIG,
    prompts: WELCOME_PROMPTS,
  },
  integrations: {
    mcpManager,
  },
}

const toolPluginInstance = toolPlugin({
  getTools: mcpManager.getTools,
  callTool: mcpManager.callTool,
})

const chatAdapter = createChatAdapterFromConfig(chatConfig)
const chatKit = useChatKit({
  responseProvider: chatAdapter.createResponseProvider(chatAdapter.defaultModel),
  plugins: [toolPluginInstance],
  storage: localStorageStrategyFactory({
    key: STORAGE_KEY,
  }),
})

const scaffoldRuntime = {
  chatKit,
  mcpManager,
}

const shellConfig = {
  variant: 'workspace' as const,
  leftRegion: {
    enabled: true,
    width: 272,
    collapsible: true,
    defaultOpen: true,
    collapseMode: 'rail' as const,
    railLabel: 'History',
  },
  rightRegion: {
    enabled: true,
    width: 360,
    collapsible: true,
    defaultOpen: false,
    collapseMode: 'hidden' as const,
    railLabel: 'Extension',
  },
}

const scaffoldPresetOverrides = computed<TrChatPresetOverrides>(() => ({
  showFeedback: false,
  shell: shellConfig,
}))

const isMobileViewport = ref(false)
let mediaQueryList: MediaQueryList | null = null

function syncViewportState(event?: MediaQueryListEvent) {
  const isMobile = event ? event.matches : Boolean(mediaQueryList?.matches)
  isMobileViewport.value = isMobile
}

function ensureDemoConversations() {
  if (typeof window === 'undefined') {
    return
  }

  if (window.localStorage.getItem(SEEDED_FLAG_KEY) === '1') {
    return
  }

  if (chatKit.conversations.value.length > 0) {
    window.localStorage.setItem(SEEDED_FLAG_KEY, '1')
    return
  }

  const created = previewConversationTitles.map((title) => chatKit.createConversation({ title }))
  const firstConversation = created[0]

  if (firstConversation) {
    void chatKit.switchConversation(firstConversation.id)
  }

  window.localStorage.setItem(SEEDED_FLAG_KEY, '1')
}

const activeConversationTitle = computed(() => {
  const activeConversation = chatKit.conversations.value.find((item) => item.id === chatKit.activeConversationId.value)
  return activeConversation?.title || 'TinyRobot Chat'
})

onMounted(() => {
  if (typeof window === 'undefined') {
    return
  }

  mediaQueryList = window.matchMedia(MOBILE_BREAKPOINT)
  syncViewportState()

  if ('addEventListener' in mediaQueryList) {
    mediaQueryList.addEventListener('change', syncViewportState)
  } else {
    ;(
      mediaQueryList as MediaQueryList & {
        addListener: (listener: (event: MediaQueryListEvent) => void) => void
      }
    ).addListener(syncViewportState)
  }

  window.requestAnimationFrame(() => {
    ensureDemoConversations()
  })
})

onBeforeUnmount(() => {
  if (!mediaQueryList) {
    return
  }

  if ('removeEventListener' in mediaQueryList) {
    mediaQueryList.removeEventListener('change', syncViewportState)
  } else {
    ;(
      mediaQueryList as MediaQueryList & {
        removeListener: (listener: (event: MediaQueryListEvent) => void) => void
      }
    ).removeListener(syncViewportState)
  }
})
</script>

<template>
  <TrChat.Scaffold
    :config="chatConfig"
    :runtime="scaffoldRuntime"
    :preset-overrides="scaffoldPresetOverrides"
    v-slot="{ presetSlices }"
  >
    <div class="whitebox-workspace">
      <TrChat.WorkspaceLayout :appearance="presetSlices.appearance.appearance" :shell="shellConfig">
        <TrChat.Layout :appearance="presetSlices.appearance.appearance">
          <TrChat.Header :title="activeConversationTitle" :show-history="true" :show-new-chat="false" />

          <div v-if="chatKit.messages.value.length === 0" class="tr-chat__welcome-area">
            <TrChat.Welcome @prompt-click="chatKit.sendMessage($event)" />
          </div>

          <TrChat.MessageList v-else />

          <TrChat.Footer class="whitebox-workspace__footer">
            <TrChat.Attachments />
            <TrChat.Sender>
              <template #footer>
                <div class="whitebox-workspace__tools">
                  <TrModelSelector v-if="presetSlices.modelSelector.enabled" />
                  <TrMcpTrigger />
                </div>
              </template>
            </TrChat.Sender>
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.WorkspaceLayout>
    </div>
  </TrChat.Scaffold>
</template>

<style scoped>
.whitebox-workspace {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.whitebox-workspace__footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.whitebox-workspace__tools {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
