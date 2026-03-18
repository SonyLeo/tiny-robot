<template>
  <div class="chat-demo">
    <h2>Chat 组件测试</h2>

    <div class="mode-switcher">
      <button data-testid="switch-blackbox" :class="{ active: mode === 'blackbox' }" @click="mode = 'blackbox'">
        黑盒模式
      </button>
      <button data-testid="switch-whitebox" :class="{ active: mode === 'whitebox' }" @click="mode = 'whitebox'">
        白盒模式
      </button>
      <button
        data-testid="switch-blackbox-edge"
        :class="{ active: mode === 'blackbox-edge' }"
        @click="mode = 'blackbox-edge'"
      >
        边界场景
      </button>
      <button
        data-testid="switch-welcome-prompts"
        :class="{ active: mode === 'welcome-prompts' }"
        @click="mode = 'welcome-prompts'"
      >
        Welcome Prompts
      </button>
      <button
        data-testid="switch-sender-extensions"
        :class="{ active: mode === 'sender-extensions' }"
        @click="mode = 'sender-extensions'"
      >
        Sender Extensions
      </button>
      <button
        data-testid="switch-mcp-feature"
        :class="{ active: mode === 'mcp-feature' }"
        @click="mode = 'mcp-feature'"
      >
        MCP Feature
      </button>
      <button
        data-testid="switch-layout-config"
        :class="{ active: mode === 'layout-config' }"
        @click="mode = 'layout-config'"
      >
        Layout Config
      </button>
    </div>

    <div v-if="mode === 'blackbox'" data-testid="chat-blackbox" class="chat-wrapper">
      <div class="status-bar">
        <span data-testid="on-finish-log">{{ finishLog }}</span>
        <span data-testid="on-action-log">{{ actionLog }}</span>
        <span data-testid="variant-indicator">{{ messageListVariant }}</span>
        <button data-testid="toggle-message-variant" @click="toggleMessageListVariant">
          {{ messageListVariant === 'bubble' ? 'docs variant' : 'bubble variant' }}
        </button>
      </div>
      <TrChat
        :brand="brand"
        :welcome="welcome"
        :prompts="prompts"
        :attachments-feature="attachmentsFeature"
        :sender-actions-feature="senderActionsFeature"
        :models="models"
        :provider-factories="providerFactories"
        default-model="openai-test"
        placeholder="请输入消息..."
        :max-length="20"
        show-history
        show-feedback
        :message-list-variant="messageListVariant"
        :on-finish="handleFinish"
        :on-error="handleError"
        :on-message-action="handleMessageAction"
        v-model:fullscreen="isFullscreen"
      />
    </div>

    <div v-if="mode === 'blackbox-edge' && isShow" data-testid="chat-blackbox-edge" class="chat-wrapper">
      <div class="status-bar">
        <span data-testid="on-error-log">{{ errorLog }}</span>
      </div>
      <TrChat
        :response-provider="edgeResponseProvider"
        :brand="brand"
        :attachments-feature="edgeAttachmentsFeature"
        :sender-actions-feature="edgeSenderActionsFeature"
        placeholder="请输入消息..."
        show-history
        enable-fullscreen
        v-model:fullscreen="isFullscreen"
        v-model:show="isShow"
        :role-configs="{ user: { placement: 'start' }, assistant: { placement: 'end' } }"
        :sender-props="{ maxLength: 5 }"
        :on-finish="handleFinish"
        :on-error="handleError"
      >
        <template #header-extra>
          <button data-testid="custom-header-btn">自定义按钮</button>
        </template>
        <template #footer-extra>
          <div data-testid="custom-footer-extra">这是 Footer 额外区域</div>
        </template>
      </TrChat>
    </div>

    <div v-if="mode === 'welcome-prompts'" data-testid="chat-welcome-prompts" class="welcome-prompts-grid">
      <div data-testid="chat-welcome-prompts-enabled" class="chat-wrapper">
        <TrChat v-bind="welcomePromptsPreset" />
      </div>

      <div data-testid="chat-welcome-prompts-disabled" class="chat-wrapper">
        <TrChat v-bind="disabledWelcomePromptsPreset" />
      </div>

      <div data-testid="chat-welcome-prompts-override" class="chat-wrapper">
        <TrChat v-bind="overrideWelcomePromptsPreset" />
      </div>

      <div data-testid="chat-welcome-prompts-slot" class="chat-wrapper">
        <TrChat v-bind="welcomePromptsPreset">
          <template #welcome>
            <div data-testid="welcome-slot-content">Custom welcome slot</div>
          </template>
        </TrChat>
      </div>

      <div data-testid="chat-welcome-prompts-whitebox" class="chat-wrapper">
        <TrChat.Root :chat-kit="whiteboxWelcomePromptsChat" v-bind="whiteboxWelcomePromptsSlices.root">
          <TrChat.Layout :fullscreen="false">
            <TrChat.Header v-bind="whiteboxWelcomePromptsSlices.header" />

            <TrChat.Welcome
              v-if="showWhiteboxWelcomePrompts && whiteboxWelcomePromptsSlices.welcome"
              v-bind="whiteboxWelcomePromptsSlices.welcome"
              @prompt-click="handleWhiteboxWelcomePromptClick"
            />

            <TrChat.MessageList v-else auto-scroll />

            <TrChat.Footer>
              <TrChat.Sender
                v-bind="whiteboxWelcomePromptsSlices.sender"
                placeholder="Whitebox welcome prompts test..."
              />
            </TrChat.Footer>
          </TrChat.Layout>
        </TrChat.Root>
      </div>
    </div>

    <div v-if="mode === 'sender-extensions'" class="sender-extensions-grid">
      <div data-testid="chat-sender-extensions-blackbox" class="chat-wrapper">
        <TrChat
          :brand="{ title: 'Sender Extensions Blackbox' }"
          :welcome="senderExtensionsWelcome"
          :response-provider="senderExtensionsProvider"
          :sender-props="{
            extensions: senderSuggestionExtensions,
            placeholder: 'Type ECS to trigger suggestions...',
          }"
        />
      </div>

      <div data-testid="chat-sender-extensions-whitebox" class="chat-wrapper">
        <TrChat.Root :chat-kit="senderExtensionsWhiteboxChat">
          <TrChat.Layout :fullscreen="false">
            <TrChat.Header title="Sender Extensions Whitebox" />

            <TrChat.Welcome
              v-if="showSenderExtensionsWhiteboxWelcome"
              title="Sender Extensions"
              description="White-box passthrough verification for senderProps.extensions."
            />

            <TrChat.MessageList v-else auto-scroll />

            <TrChat.Footer>
              <TrChat.Sender
                :extensions="senderSuggestionExtensions"
                placeholder="Type ECS to trigger suggestions..."
              />
            </TrChat.Footer>
          </TrChat.Layout>
        </TrChat.Root>
      </div>
    </div>

    <div v-if="mode === 'mcp-feature'" class="welcome-prompts-grid">
      <div data-testid="chat-mcp-feature-blackbox" class="chat-wrapper">
        <TrChat v-bind="mcpBlackboxPreset">
          <template #header-extra>
            <button data-testid="mcp-feature-blackbox-open" @click="mcpBlackboxPanelVisible = true">Open MCP</button>
            <TrChatMcpPanel :visible="mcpBlackboxPanelVisible" @update:visible="mcpBlackboxPanelVisible = $event" />
          </template>
        </TrChat>
      </div>

      <div data-testid="chat-mcp-feature-whitebox" class="chat-wrapper">
        <TrChat.Root :chat-kit="mcpWhiteboxChat" v-bind="mcpWhiteboxSlices.root">
          <TrChat.Layout v-bind="mcpWhiteboxSlices.layout">
            <TrChat.Header v-bind="mcpWhiteboxSlices.header">
              <template #extra>
                <button data-testid="mcp-feature-whitebox-open" @click="mcpWhiteboxPanelVisible = true">
                  Open MCP
                </button>
              </template>
            </TrChat.Header>
            <TrChat.Welcome
              v-if="showMcpWhiteboxWelcome && mcpWhiteboxSlices.welcome"
              v-bind="mcpWhiteboxSlices.welcome"
            />
            <TrChat.MessageList v-else v-bind="mcpWhiteboxSlices.messageList" />
            <TrChat.Footer>
              <TrChat.Sender v-bind="mcpWhiteboxSlices.sender" />
            </TrChat.Footer>
            <TrChatMcpPanel :visible="mcpWhiteboxPanelVisible" @update:visible="mcpWhiteboxPanelVisible = $event" />
          </TrChat.Layout>
        </TrChat.Root>
      </div>
    </div>

    <div v-if="mode === 'layout-config'" class="welcome-prompts-grid">
      <div data-testid="chat-layout-config-blackbox" class="chat-wrapper">
        <TrChat v-bind="layoutConfigBlackboxPreset" />
      </div>

      <div data-testid="chat-layout-config-whitebox" class="chat-wrapper">
        <TrChat.Root :chat-kit="layoutConfigWhiteboxChat" v-bind="layoutConfigWhiteboxSlices.root">
          <TrChat.Layout v-bind="layoutConfigWhiteboxSlices.layout">
            <TrChat.Header v-bind="layoutConfigWhiteboxSlices.header" />
            <TrChat.Welcome
              v-if="showLayoutConfigWhiteboxWelcome && layoutConfigWhiteboxSlices.welcome"
              v-bind="layoutConfigWhiteboxSlices.welcome"
              @prompt-click="handleLayoutConfigWhiteboxPromptClick"
            />
            <TrChat.MessageList v-else v-bind="layoutConfigWhiteboxSlices.messageList" />
            <TrChat.Footer>
              <TrChat.Sender v-bind="layoutConfigWhiteboxSlices.sender" />
            </TrChat.Footer>
          </TrChat.Layout>
        </TrChat.Root>
      </div>

      <div data-testid="chat-layout-workspace-blackbox" class="chat-wrapper">
        <TrChat v-bind="workspaceLayoutBlackboxPreset" />
      </div>

      <div data-testid="chat-layout-workspace-whitebox" class="chat-wrapper">
        <TrChat.Root :chat-kit="workspaceLayoutWhiteboxChat" v-bind="workspaceLayoutWhiteboxSlices.root">
          <TrChat.Layout v-bind="workspaceLayoutWhiteboxSlices.layout">
            <TrChat.Header v-bind="workspaceLayoutWhiteboxSlices.header" />
            <TrChat.Welcome
              v-if="showWorkspaceLayoutWhiteboxWelcome && workspaceLayoutWhiteboxSlices.welcome"
              v-bind="workspaceLayoutWhiteboxSlices.welcome"
              @prompt-click="handleWorkspaceLayoutWhiteboxPromptClick"
            />
            <TrChat.MessageList v-else v-bind="workspaceLayoutWhiteboxSlices.messageList" />
            <TrChat.Footer>
              <TrChat.Sender v-bind="workspaceLayoutWhiteboxSlices.sender" />
            </TrChat.Footer>
          </TrChat.Layout>
        </TrChat.Root>
      </div>
    </div>

    <div v-if="mode === 'whitebox'" data-testid="chat-whitebox" class="chat-wrapper">
      <div class="status-bar">
        <span data-testid="status-indicator">{{ status }}</span>
        <span data-testid="message-count">{{ messages.length }}</span>
        <span data-testid="on-finish-log">{{ finishLog }}</span>
        <span data-testid="on-action-log">{{ actionLog }}</span>
        <span data-testid="variant-indicator">{{ messageListVariant }}</span>
        <button data-testid="toggle-message-variant" @click="toggleMessageListVariant">
          {{ messageListVariant === 'bubble' ? 'docs variant' : 'bubble variant' }}
        </button>
      </div>

      <TrChat.Root
        :chat-kit="chat"
        :attachments-feature="attachmentsFeature"
        :sender-actions-feature="senderActionsFeature"
      >
        <TrChat.Layout :fullscreen="false">
          <TrChat.Header show-history />

          <TrChat.Welcome
            v-if="messages.length === 0"
            title="白盒模式测试"
            description="验证 Root、inject 和手动组合链路"
            :prompts="prompts"
            @prompt-click="handlePromptClick"
          />

          <TrChat.MessageList v-else auto-scroll :variant="messageListVariant" :on-action-click="handleMessageAction">
            <template #after="slotProps">
              <TrChatFeedback v-if="slotProps.role === 'assistant'" v-bind="slotProps" />
            </template>
          </TrChat.MessageList>

          <TrChat.Footer>
            <div class="whitebox-footer">
              <TrModelSelector
                v-model="selectedModel"
                :models="models"
                :provider-factories="providerFactories"
                @change="handleModelChange"
              />
              <TrChat.Sender placeholder="白盒模式请输入消息...">
                <template #footer-right>
                  <span data-testid="whitebox-custom-footer-right">自定义 footer-right</span>
                </template>
              </TrChat.Sender>
            </div>
          </TrChat.Footer>

          <TrChat.History />
        </TrChat.Layout>
      </TrChat.Root>
    </div>

    <div v-if="mode === 'whitebox'" class="welcome-prompts-grid">
      <div data-testid="chat-whitebox-slices-default" class="chat-wrapper">
        <TrChat.Root :chat-kit="whiteboxSlicesChat" v-bind="whiteboxFeatureSlices.root">
          <TrChat.Layout v-bind="whiteboxFeatureSlices.layout">
            <TrChat.Header v-bind="whiteboxFeatureSlices.header" />

            <TrChat.Welcome
              v-if="showWhiteboxSlicesWelcome && whiteboxFeatureSlices.welcome"
              v-bind="whiteboxFeatureSlices.welcome"
              @prompt-click="handleWhiteboxSlicesPromptClick"
            />

            <TrChat.MessageList v-else v-bind="whiteboxFeatureSlices.messageList" />

            <TrChat.Footer>
              <TrChat.Attachments />
              <TrChat.Sender v-bind="whiteboxFeatureSlices.sender" />
            </TrChat.Footer>
          </TrChat.Layout>
        </TrChat.Root>
      </div>

      <div data-testid="chat-whitebox-slices-slot" class="chat-wrapper">
        <TrChat.Root :chat-kit="whiteboxSlicesSlotChat" v-bind="whiteboxFeatureSlices.root">
          <TrChat.Layout v-bind="whiteboxFeatureSlices.layout">
            <TrChat.Header v-bind="whiteboxFeatureSlices.header" />

            <TrChat.Welcome
              v-if="showWhiteboxSlicesSlotWelcome && whiteboxFeatureSlices.welcome"
              v-bind="whiteboxFeatureSlices.welcome"
              @prompt-click="handleWhiteboxSlicesSlotPromptClick"
            />

            <TrChat.MessageList v-else v-bind="whiteboxFeatureSlices.messageList" />

            <TrChat.Footer>
              <TrChat.Attachments />
              <TrChat.Sender v-bind="whiteboxFeatureSlices.sender">
                <template #footer-right>
                  <span data-testid="whitebox-slices-custom-footer-right">whitebox slices footer-right</span>
                </template>
              </TrChat.Sender>
            </TrChat.Footer>
          </TrChat.Layout>
        </TrChat.Root>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import {
  TrChat,
  TrChatFeedback,
  TrChatMcpPanel,
  TrModelSelector,
  createChatAdapterFromConfig,
  createPresetChatProps,
  createPresetChatSlices,
  useChatKit,
  useMcpManager,
  useModelSelector,
} from '../../../chat/src'
import type {
  ChatListVariant,
  ChatMessageActionPayload,
  ModelOption,
  ModelProviderFactory,
} from '../../../chat/src/types'
import type { ChatCompletion } from '../../../kit/src/vue/message/types'
import { createMockFactory, createMockProvider } from './mockProvider'

type ChatMode =
  | 'blackbox'
  | 'whitebox'
  | 'blackbox-edge'
  | 'welcome-prompts'
  | 'sender-extensions'
  | 'mcp-feature'
  | 'layout-config'

function getInitialMode(): ChatMode {
  if (typeof window === 'undefined') {
    return 'blackbox'
  }

  const mode = new URLSearchParams(window.location.search).get('chatMode')
  if (
    mode === 'whitebox' ||
    mode === 'blackbox-edge' ||
    mode === 'welcome-prompts' ||
    mode === 'sender-extensions' ||
    mode === 'mcp-feature' ||
    mode === 'layout-config'
  ) {
    return mode
  }

  return 'blackbox'
}

const mode = ref<ChatMode>(getInitialMode())
const finishLog = ref('')
const errorLog = ref('')
const actionLog = ref('')
const messageListVariant = ref<ChatListVariant>('bubble')
const isFullscreen = ref(false)
const isShow = ref(true)

const models: ModelOption[] = [
  { value: 'openai-test', label: 'OpenAI Test', provider: 'openai' },
  { value: 'deepseek-test', label: 'DeepSeek Test', provider: 'deepseek' },
]

const providerFactories: ModelProviderFactory[] = [createMockFactory('openai'), createMockFactory('deepseek')]

const edgeBaseProvider = createMockProvider({
  provider: 'edge-provider',
  model: 'edge-model',
})

const edgeResponseProvider = async function* (
  body: unknown,
  signal: AbortSignal,
): AsyncGenerator<ChatCompletion, void, unknown> {
  const stream = await edgeBaseProvider(body as never, signal)
  yield* stream as AsyncGenerator<ChatCompletion, void, unknown>
}

const brand = {
  title: 'Chat Kit 测试',
}

const welcome = {
  title: 'TinyRobot',
  description: '这里用于验证 Chat Kit 的黑盒接入和 E2E 场景。',
}

const prompts = [
  { label: '解释 React hooks', description: '解释 React hooks' },
  { label: '生成 Hello World', description: '请帮我写一个 Hello World' },
]

const attachmentsFeature = {
  upload: {
    tooltip: '上传附件',
    accept: '.txt,.md',
    multiple: true,
  },
}

const senderActionsFeature = {
  voice: {
    enabled: true,
    tooltip: '语音输入',
  },
  wordCount: true,
}

const senderExtensionSuggestions = [
  { content: 'ECS instance startup issue' },
  { content: 'ECS backup restore workflow' },
  { content: 'ECS monitoring alert setup' },
]

const senderSuggestionExtensions = [TrSender.suggestion(senderExtensionSuggestions)]

const senderExtensionsWelcome = {
  title: 'Sender Extensions',
  description: 'Type ECS in the sender to verify senderProps.extensions passthrough.',
}

const senderExtensionsProvider = createMockProvider({
  provider: 'openai',
  model: 'sender-extensions-model',
})

const senderExtensionsWhiteboxChat = useChatKit({
  responseProvider: senderExtensionsProvider,
})
const showSenderExtensionsWhiteboxWelcome = computed(() => senderExtensionsWhiteboxChat.messages.value.length === 0)

const mcpFeaturePlugins = [
  {
    id: 'weather-service',
    name: 'Weather Service',
    icon: 'W',
    description: 'Get weather information for any location',
    enabled: true,
    expanded: true,
    tools: [
      {
        id: 'get-weather',
        name: 'Get Weather',
        description: 'Get current weather for a location',
        enabled: true,
      },
    ],
    category: 'utilities',
  },
]

const mcpBlackboxManager = useMcpManager({
  initialPlugins: mcpFeaturePlugins,
})
const mcpWhiteboxManager = useMcpManager({
  initialPlugins: mcpFeaturePlugins,
})

const mcpFeatureBaseConfig = {
  models: [{ id: 'mcp-feature-model', provider: 'openai' }],
  providers: {
    openai: {
      type: 'openai-compatible' as const,
      endpoint: '/api/chat',
    },
  },
  ui: {
    brand: {
      title: 'MCP Feature',
    },
    welcome: {
      title: 'MCP Feature Welcome',
      description: 'MCP manager should travel through feature -> preset -> root.',
    },
  },
}

const mcpBlackboxAdapter = createChatAdapterFromConfig({
  ...mcpFeatureBaseConfig,
  features: {
    mcp: {
      manager: mcpBlackboxManager,
    },
  },
})
const mcpBlackboxPreset = createPresetChatProps(mcpBlackboxAdapter, {
  responseProvider: createMockProvider({
    provider: 'openai',
    model: 'mcp-feature-model',
  }),
})

const mcpWhiteboxAdapter = createChatAdapterFromConfig({
  ...mcpFeatureBaseConfig,
  features: {
    mcp: {
      manager: mcpWhiteboxManager,
    },
  },
})
const mcpWhiteboxPreset = createPresetChatProps(mcpWhiteboxAdapter)
const mcpWhiteboxSlices = createPresetChatSlices(mcpWhiteboxPreset)
const mcpWhiteboxChat = useChatKit({
  responseProvider: createMockProvider({
    provider: 'openai',
    model: 'mcp-feature-model',
  }),
})
const showMcpWhiteboxWelcome = computed(() => mcpWhiteboxChat.messages.value.length === 0)
const mcpBlackboxPanelVisible = ref(false)
const mcpWhiteboxPanelVisible = ref(false)

const layoutConfigAdapter = createChatAdapterFromConfig({
  models: [{ id: 'layout-config-model', provider: 'openai' }],
  providers: {
    openai: {
      type: 'openai-compatible',
      endpoint: '/api/chat',
    },
  },
  ui: {
    brand: {
      title: 'Layout Config',
    },
    welcome: {
      title: 'Layout Config Welcome',
      description: 'Layout variant and placements should be driven by config.',
    },
    prompts: [{ label: 'layout prompt', description: 'layout prompt' }],
  },
  layout: {
    variant: 'docs',
    placements: {
      assistant: 'end',
      user: 'start',
    },
  },
})
const layoutConfigBlackboxPreset = createPresetChatProps(layoutConfigAdapter, {
  responseProvider: createMockProvider({
    provider: 'openai',
    model: 'layout-config-model',
  }),
})
const layoutConfigWhiteboxPreset = createPresetChatProps(layoutConfigAdapter)
const layoutConfigWhiteboxSlices = createPresetChatSlices(layoutConfigWhiteboxPreset)
const layoutConfigWhiteboxChat = useChatKit({
  responseProvider: createMockProvider({
    provider: 'openai',
    model: 'layout-config-model',
  }),
})
const showLayoutConfigWhiteboxWelcome = computed(() => layoutConfigWhiteboxChat.messages.value.length === 0)

const workspaceLayoutAdapter = createChatAdapterFromConfig({
  models: [{ id: 'workspace-layout-model', provider: 'openai' }],
  providers: {
    openai: {
      type: 'openai-compatible',
      endpoint: '/api/chat',
    },
  },
  ui: {
    brand: {
      title: 'Workspace Layout',
    },
    welcome: {
      title: 'Workspace Layout Welcome',
      description: 'Workspace variant should remain a pure layout choice.',
    },
    prompts: [{ label: 'workspace prompt', description: 'workspace prompt' }],
  },
  layout: {
    variant: 'workspace',
    placements: {
      assistant: 'start',
      user: 'end',
    },
  },
})
const workspaceLayoutBlackboxPreset = createPresetChatProps(workspaceLayoutAdapter, {
  responseProvider: createMockProvider({
    provider: 'openai',
    model: 'workspace-layout-model',
  }),
})
const workspaceLayoutWhiteboxPreset = createPresetChatProps(workspaceLayoutAdapter)
const workspaceLayoutWhiteboxSlices = createPresetChatSlices(workspaceLayoutWhiteboxPreset)
const workspaceLayoutWhiteboxChat = useChatKit({
  responseProvider: createMockProvider({
    provider: 'openai',
    model: 'workspace-layout-model',
  }),
})
const showWorkspaceLayoutWhiteboxWelcome = computed(() => workspaceLayoutWhiteboxChat.messages.value.length === 0)

const welcomePromptsAdapter = createChatAdapterFromConfig({
  models: [{ id: 'welcome-prompts-model', provider: 'openai' }],
  providers: {
    openai: {
      type: 'openai-compatible',
      endpoint: '/api/chat',
    },
  },
  ui: {
    brand: {
      title: 'Welcome Prompts 测试',
    },
    welcome: {
      title: 'Welcome Prompts',
      description: '验证 welcomePrompts feature -> preset -> TrChat 主链路',
    },
    prompts: [{ label: 'legacy prompt', description: 'legacy prompt' }],
  },
  features: {
    welcomePrompts: {
      welcome: [
        { label: 'feature prompt 1', description: 'feature prompt 1' },
        { label: 'feature prompt 2', description: 'feature prompt 2' },
        { label: 'feature prompt 3', description: 'feature prompt 3' },
      ],
    },
  },
})

const welcomePromptsPreset = createPresetChatProps(welcomePromptsAdapter, {
  responseProvider: createMockProvider({
    provider: 'openai',
    model: 'welcome-prompts-model',
  }),
})

const disabledWelcomePromptsAdapter = createChatAdapterFromConfig({
  models: [{ id: 'welcome-prompts-disabled-model', provider: 'openai' }],
  providers: {
    openai: {
      type: 'openai-compatible',
      endpoint: '/api/chat',
    },
  },
  ui: {
    brand: {
      title: 'Welcome Prompts Disabled 测试',
    },
    welcome: {
      title: 'Welcome Prompts Disabled',
      description: '验证 welcomePrompts disabled 时应清空默认提示项',
    },
    prompts: [{ label: 'legacy prompt', description: 'legacy prompt' }],
  },
  features: {
    welcomePrompts: false,
  },
})

const disabledWelcomePromptsPreset = createPresetChatProps(disabledWelcomePromptsAdapter, {
  responseProvider: createMockProvider({
    provider: 'openai',
    model: 'welcome-prompts-disabled-model',
  }),
})

const overrideWelcomePromptsPreset = createPresetChatProps(welcomePromptsAdapter, {
  responseProvider: createMockProvider({
    provider: 'openai',
    model: 'welcome-prompts-model',
  }),
  prompts: [{ label: 'override prompt', description: 'override prompt' }],
})

const whiteboxWelcomePromptsPreset = createPresetChatProps(welcomePromptsAdapter)
const whiteboxWelcomePromptsSlices = createPresetChatSlices(whiteboxWelcomePromptsPreset)
const whiteboxWelcomePromptsChat = useChatKit({
  responseProvider: createMockProvider({
    provider: 'openai',
    model: 'welcome-prompts-model',
  }),
})
const showWhiteboxWelcomePrompts = computed(() => whiteboxWelcomePromptsChat.messages.value.length === 0)

const whiteboxFeatureAdapter = createChatAdapterFromConfig({
  models: [{ id: 'whitebox-slices-model', provider: 'openai' }],
  providers: {
    openai: {
      type: 'openai-compatible',
      endpoint: '/api/chat',
    },
  },
  ui: {
    brand: {
      title: 'Whitebox Slices',
    },
    welcome: {
      title: 'Whitebox Slices Welcome',
      description: 'Preset slices drive the white-box footer defaults.',
    },
  },
  features: {
    attachments: true,
    senderActions: {
      voice: {
        enabled: true,
        tooltip: 'Voice from preset slices',
      },
      wordCount: true,
    },
  },
})

const whiteboxFeaturePreset = createPresetChatProps(whiteboxFeatureAdapter, {
  placeholder: 'Whitebox slices sender...',
  maxLength: 60,
})
const whiteboxFeatureSlices = createPresetChatSlices(whiteboxFeaturePreset)
const whiteboxSlicesChat = useChatKit({
  responseProvider: createMockProvider({
    provider: 'openai',
    model: 'whitebox-slices-model',
  }),
})
const whiteboxSlicesSlotChat = useChatKit({
  responseProvider: createMockProvider({
    provider: 'openai',
    model: 'whitebox-slices-slot-model',
  }),
})
const showWhiteboxSlicesWelcome = computed(() => whiteboxSlicesChat.messages.value.length === 0)
const showWhiteboxSlicesSlotWelcome = computed(() => whiteboxSlicesSlotChat.messages.value.length === 0)

const edgeAttachmentsFeature = {
  upload: {
    tooltip: '上传附件',
    accept: '.txt',
    multiple: true,
  },
}

const edgeSenderActionsFeature = {
  upload: {
    enabled: false,
  },
}

function handleFinish(msg: { content?: string }) {
  finishLog.value = `finish:${msg.content?.slice(0, 40) ?? ''}`
}

function handleError(err: Error) {
  finishLog.value = `error:${err.message}`
  errorLog.value = `error:${err.message}`
}

function handleMessageAction(payload: ChatMessageActionPayload) {
  actionLog.value = `action:${payload.action}:${payload.role ?? ''}:${payload.messageIndex ?? -1}`
}

function toggleMessageListVariant() {
  messageListVariant.value = messageListVariant.value === 'bubble' ? 'docs' : 'bubble'
}

const selectedModel = ref('openai-test')
const chat = useChatKit({
  responseProvider: createMockProvider({
    provider: 'openai',
    model: selectedModel.value,
  }),
  onFinish: (msg) => {
    finishLog.value = `finish:${msg.content?.slice(0, 40) ?? ''}`
  },
  onError: (err) => {
    finishLog.value = `error:${err.message}`
  },
})

const { messages, status } = chat

const { selectModel } = useModelSelector({
  currentModel: selectedModel,
  models,
  providerFactories,
  chatKit: chat,
})

function handlePromptClick(description: string) {
  chat.sendMessage(description)
}

function handleWhiteboxWelcomePromptClick(description: string) {
  whiteboxWelcomePromptsChat.sendMessage(description)
}

function handleWhiteboxSlicesPromptClick(description: string) {
  whiteboxSlicesChat.sendMessage(description)
}

function handleWhiteboxSlicesSlotPromptClick(description: string) {
  whiteboxSlicesSlotChat.sendMessage(description)
}

function handleLayoutConfigWhiteboxPromptClick(description: string) {
  layoutConfigWhiteboxChat.sendMessage(description)
}

function handleWorkspaceLayoutWhiteboxPromptClick(description: string) {
  workspaceLayoutWhiteboxChat.sendMessage(description)
}

function handleModelChange(model: ModelOption) {
  selectModel(model)
}
</script>

<style scoped>
.chat-demo {
  max-width: 100%;
  margin: 0 auto;
}

.welcome-prompts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.sender-extensions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.mode-switcher {
  display: flex;
  gap: 8px;
  margin: 12px 0;
  padding: 0 20px;
}

.mode-switcher button {
  padding: 6px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-switcher button.active {
  background: #1677ff;
  color: #fff;
  border-color: #1677ff;
}

.chat-wrapper {
  position: relative;
  height: calc(100vh - 100px);
}

.status-bar {
  display: flex;
  gap: 12px;
  padding: 4px 12px;
  background: #f5f5f5;
  font-size: 12px;
  font-family: monospace;
  border-bottom: 1px solid #eee;
}

.status-bar span {
  padding: 2px 6px;
  background: #e8e8e8;
  border-radius: 3px;
}

.status-bar button {
  padding: 2px 8px;
  border: 1px solid #d0d7e2;
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
  font: inherit;
}

.whitebox-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
