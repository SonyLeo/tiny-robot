<template>
  <div class="surface-grid">
    <div data-testid="chat-surface-slots-default" class="chat-wrapper">
      <TrChat :config="slotSurfaceConfig">
        <template #header-extra>
          <button data-testid="surface-header-extra">Header Extra</button>
        </template>

        <template #footer-extra>
          <div data-testid="surface-footer-extra">Footer Extra</div>
        </template>

        <template #prefix="{ role, messageIndexes }">
          <span v-if="role === 'assistant'" data-testid="surface-prefix-slot">
            prefix-{{ messageIndexes.join('-') }}
          </span>
        </template>

        <template #suffix="{ role, messageIndexes }">
          <span v-if="role === 'assistant'" data-testid="surface-suffix-slot">
            suffix-{{ messageIndexes.join('-') }}
          </span>
        </template>

        <template #content-footer="{ role, messageIndexes }">
          <span v-if="role === 'assistant'" data-testid="surface-content-footer-slot">
            footer-{{ messageIndexes.join('-') }}
          </span>
        </template>
      </TrChat>
    </div>

    <div data-testid="chat-surface-header-slot" class="chat-wrapper">
      <TrChat :config="slotSurfaceConfig">
        <template #header>
          <div data-testid="surface-header-slot">Custom Header Slot</div>
        </template>
      </TrChat>
    </div>

    <div data-testid="chat-surface-welcome-slot" class="chat-wrapper">
      <TrChat :config="slotSurfaceConfig">
        <template #welcome>
          <div data-testid="surface-welcome-slot">Custom Welcome Slot</div>
        </template>
      </TrChat>
    </div>

    <div data-testid="chat-surface-empty-slot" class="chat-wrapper">
      <TrChat :config="emptySlotConfig">
        <template #empty>
          <div data-testid="surface-empty-slot">Custom Empty Slot</div>
        </template>
      </TrChat>
    </div>

    <div data-testid="chat-surface-custom-render" class="chat-wrapper">
      <TrChat :config="customRenderConfig">
        <template #message-list="{ messages }">
          <div data-testid="surface-message-list-slot">messages:{{ messages.value.length }}</div>
        </template>

        <template #sender="{ send, status }">
          <div class="surface-custom-sender">
            <div data-testid="surface-sender-slot-status">status:{{ status.value }}</div>
            <button data-testid="surface-sender-slot-send" @click="send('surface-sender-slot')">Send From Slot</button>
          </div>
        </template>
      </TrChat>
    </div>

    <div data-testid="chat-surface-runtime-diagnostics" class="chat-wrapper">
      <div class="surface-runtime-diagnostics-toolbar">
        <span data-testid="surface-runtime-diagnostics-status">
          status:{{ runtimeDiagnosticsResolution.runtime.conversation.status.value }}
        </span>
        <span data-testid="surface-runtime-diagnostics-message-count">
          messages:{{ runtimeDiagnosticsResolution.runtime.conversation.messages.value.length }}
        </span>
        <span data-testid="surface-runtime-diagnostics-model">
          model:{{ runtimeDiagnosticsResolution.runtime.models?.currentModelId.value ?? 'none' }}
        </span>
        <button data-testid="surface-runtime-diagnostics-send" @click="sendRuntimeDiagnosticsMessage">
          Send Runtime Message
        </button>
        <button data-testid="surface-runtime-diagnostics-reset" @click="resetRuntimeDiagnosticsConversation">
          Reset Conversation
        </button>
      </div>

      <TrChat.Root :runtime="runtimeDiagnosticsResolution.runtime" :ui="runtimeDiagnosticsResolution.ui">
        <TrChat.Layout
          :appearance="runtimeDiagnosticsResolution.ui.appearance"
          :content-layout="runtimeDiagnosticsResolution.ui.contentLayout"
        >
          <TrChat.Header :title="runtimeDiagnosticsResolution.ui.brand?.title" :show-history="false" />

          <TrChat.Welcome
            v-if="showRuntimeDiagnosticsWelcome"
            :compatibility-relay="false"
            :title="runtimeDiagnosticsResolution.ui.welcome?.title"
            :description="runtimeDiagnosticsResolution.ui.welcome?.description"
            :prompts="runtimeDiagnosticsResolution.ui.welcome?.prompts"
            @prompt-click="runtimeDiagnosticsResolution.runtime.conversation.send({ text: $event })"
          />

          <TrChat.MessageList v-else :compatibility-relay="false" auto-scroll />

          <TrChat.Footer>
            <TrChat.Sender />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Root>
    </div>

    <div data-testid="chat-surface-granular-model" class="chat-wrapper">
      <TrChat.Root :runtime="granularModelResolution.runtime" :ui="granularModelResolution.ui">
        <div class="surface-diagnostics">
          <span data-testid="surface-granular-current-model">
            {{ granularModelResolution.runtime.models?.currentModelId.value }}
          </span>
          <span data-testid="surface-granular-header-title">
            {{ granularModelResolution.ui.brand?.title }}
          </span>
          <span data-testid="surface-granular-model-log">{{ granularModelLog }}</span>
          <button data-testid="surface-granular-switch-model" @click="switchGranularModel">Switch To DeepSeek</button>
        </div>

        <TrChat.Layout
          :appearance="granularModelResolution.ui.appearance"
          :content-layout="granularModelResolution.ui.contentLayout"
        >
          <TrChat.Header
            :title="granularModelResolution.ui.brand?.title"
            :show-history="false"
            :show-new-chat="false"
          />

          <TrChat.Welcome
            v-if="showGranularModelWelcome"
            :compatibility-relay="false"
            :title="granularModelResolution.ui.welcome?.title"
            :description="granularModelResolution.ui.welcome?.description"
            :prompts="granularModelResolution.ui.welcome?.prompts"
            @prompt-click="granularModelResolution.runtime.conversation.send({ text: $event })"
          />

          <TrChat.MessageList v-else :compatibility-relay="false" />

          <TrChat.Footer>
            <TrChat.Sender />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Root>
    </div>

    <div data-testid="chat-surface-provider-branch" class="chat-wrapper">
      <TrChat.Provider :response-provider="providerBranchResponseProvider">
        <TrChat.Layout :appearance="{ mode: 'dark' }">
          <TrChat.Header :show-new-chat="false">
            <template #title>
              <span data-testid="surface-provider-title-slot">Provider Branch Title Slot</span>
            </template>
            <template #extra>
              <span data-testid="surface-provider-extra-slot">Provider Extra Slot</span>
            </template>
          </TrChat.Header>

          <TrChat.MessageList auto-scroll />

          <TrChat.Footer>
            <TrChat.Sender placeholder="Provider branch sender..." />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Provider>
    </div>

    <div data-testid="chat-surface-granular-footer-right" class="chat-wrapper">
      <TrChat.Root :runtime="granularFooterRightResolution.runtime" :ui="granularFooterRightResolution.ui">
        <TrChat.Layout
          :appearance="granularFooterRightResolution.ui.appearance"
          :content-layout="granularFooterRightResolution.ui.contentLayout"
        >
          <TrChat.Header :title="granularFooterRightResolution.ui.brand?.title" :show-history="false" />

          <TrChat.Welcome
            v-if="showGranularFooterRightWelcome"
            :compatibility-relay="false"
            :title="granularFooterRightResolution.ui.welcome?.title"
            :description="granularFooterRightResolution.ui.welcome?.description"
            :prompts="granularFooterRightResolution.ui.welcome?.prompts"
            @prompt-click="granularFooterRightResolution.runtime.conversation.send({ text: $event })"
          />

          <TrChat.MessageList v-else :compatibility-relay="false" />

          <TrChat.Footer>
            <TrChat.Sender>
              <template #footer-right>
                <button data-testid="surface-granular-footer-right-slot">Granular Footer Right Slot</button>
              </template>
            </TrChat.Sender>
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Root>
    </div>

    <div data-testid="chat-surface-granular-sender-config" class="chat-wrapper">
      <TrChat.Root :runtime="granularSenderConfigResolution.runtime" :ui="granularSenderConfigResolution.ui">
        <TrChat.Layout
          :appearance="granularSenderConfigResolution.ui.appearance"
          :content-layout="granularSenderConfigResolution.ui.contentLayout"
        >
          <TrChat.Header :title="granularSenderConfigResolution.ui.brand?.title" :show-history="false" />

          <TrChat.Welcome
            v-if="showGranularSenderConfigWelcome"
            :compatibility-relay="false"
            :title="granularSenderConfigResolution.ui.welcome?.title"
            :description="granularSenderConfigResolution.ui.welcome?.description"
            :prompts="granularSenderConfigResolution.ui.welcome?.prompts"
            @prompt-click="granularSenderConfigResolution.runtime.conversation.send({ text: $event })"
          />

          <TrChat.MessageList v-else :compatibility-relay="false" />

          <TrChat.Footer>
            <TrChat.Sender />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Root>
    </div>

    <div v-if="showGranularCloseShell" data-testid="chat-surface-granular-close" class="chat-wrapper">
      <TrChat.Root :runtime="granularCloseResolution.runtime" :ui="granularCloseResolution.ui">
        <TrChat.Layout
          :appearance="granularCloseResolution.ui.appearance"
          :content-layout="granularCloseResolution.ui.contentLayout"
        >
          <TrChat.Header
            :title="granularCloseResolution.ui.brand?.title"
            :show-history="false"
            :show-new-chat="false"
            show-close
            @close="showGranularCloseShell = false"
          />

          <TrChat.Welcome
            v-if="showGranularCloseWelcome"
            :compatibility-relay="false"
            :title="granularCloseResolution.ui.welcome?.title"
            :description="granularCloseResolution.ui.welcome?.description"
            :prompts="granularCloseResolution.ui.welcome?.prompts"
            @prompt-click="granularCloseResolution.runtime.conversation.send({ text: $event })"
          />

          <TrChat.MessageList v-else :compatibility-relay="false" />

          <TrChat.Footer>
            <TrChat.Sender />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Root>
    </div>

    <div data-testid="chat-surface-workspace-history" class="history-surface-wrapper">
      <div class="history-surface-toolbar">
        <button data-testid="workspace-history-seed" @click="seedWorkspaceHistory">Seed Conversations</button>
      </div>

      <TrChat.Root :runtime="workspaceHistoryResolution.runtime" :ui="workspaceHistoryResolution.ui">
        <TrChat.WorkspaceLayout
          :appearance="workspaceHistoryResolution.ui.appearance"
          :sidebar-title="workspaceHistoryResolution.ui.brand?.title"
        >
          <template #right>
            <aside class="surface-history-placeholder" data-testid="workspace-history-placeholder">
              Workspace history default left owner path
            </aside>
          </template>

          <TrChat.Layout
            :appearance="workspaceHistoryResolution.ui.appearance"
            :content-layout="workspaceHistoryResolution.ui.contentLayout"
          >
            <TrChat.Header :title="workspaceHistoryResolution.ui.brand?.title" :show-history="false" />
            <TrChat.Welcome
              v-if="showWorkspaceHistoryWelcome"
              :compatibility-relay="false"
              :title="workspaceHistoryResolution.ui.welcome?.title"
              :description="workspaceHistoryResolution.ui.welcome?.description"
            />
            <TrChat.MessageList v-else :compatibility-relay="false" auto-scroll />
            <TrChat.Footer>
              <TrChat.Sender />
            </TrChat.Footer>
          </TrChat.Layout>
        </TrChat.WorkspaceLayout>
      </TrChat.Root>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrChat } from '@opentiny/tiny-robot-chat'
import { createMockProvider } from '../mockProvider'
import { createOfficialSceneConfig } from './officialSceneConfig'
import { useStableSceneRuntime } from './useStableSceneRuntime'
import { useSceneWelcomeState } from './useSceneWelcomeState'

const SurfaceWelcomeIcon = {
  template: '<span data-testid="surface-welcome-icon">I</span>',
}

const slotSurfaceConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Surface Default Slots',
    welcomeTitle: 'Surface Welcome',
    welcomeDescription: 'Default renderer slot passthrough should stay intact.',
    welcomeIcon: SurfaceWelcomeIcon,
    sender: {
      placeholder: 'slot surface sender...',
      maxLength: 80,
    },
  }),
)

const emptySlotConfig = computed(() => {
  const config = createOfficialSceneConfig({
    brandTitle: 'Empty Slot Surface',
    welcomeTitle: 'Unused Welcome',
    welcomeDescription: 'This welcome content is removed so the empty slot can take over.',
  })

  return {
    ...config,
    ui: {
      ...config.ui,
      welcome: undefined,
    },
  }
})

const customRenderConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Custom Render Surface',
    welcomeTitle: 'Custom Render Surface',
    welcomeDescription: 'Message-list and sender slots should receive live slot props.',
    initialMessages: [
      {
        id: 'custom-render-initial',
        role: 'assistant',
        content: 'Initial custom render message',
      },
    ],
  }),
)

const runtimeDiagnosticsConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Runtime Diagnostics Surface',
    welcomeTitle: 'Runtime Diagnostics',
    welcomeDescription:
      'Official Root + runtime diagnostics should stay visible without any retired provider passthrough.',
  }),
)
const runtimeDiagnosticsResolution = useStableSceneRuntime(runtimeDiagnosticsConfig)
const showRuntimeDiagnosticsWelcome = useSceneWelcomeState(runtimeDiagnosticsResolution)

function sendRuntimeDiagnosticsMessage() {
  runtimeDiagnosticsResolution.value.runtime.sender?.send({ text: 'runtime-diagnostics-path' })
}

async function resetRuntimeDiagnosticsConversation() {
  const history = runtimeDiagnosticsResolution.value.runtime.history
  if (!history) {
    return
  }

  const nextConversationId = await Promise.resolve(history.createConversation({ title: 'Runtime diagnostics reset' }))
  if (nextConversationId) {
    await Promise.resolve(history.switchConversation(nextConversationId))
  }
}

const granularModelLog = ref('')
const granularModelConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Surface Granular Model Switch',
    welcomeTitle: 'Granular Model Switch',
    welcomeDescription: 'Manual Root + primitives composition should expose model runtime and page inputs.',
    models: [
      { id: 'openai-test', label: 'OpenAI Test', providerId: 'openai' },
      { id: 'deepseek-test', label: 'DeepSeek Test', providerId: 'deepseek' },
    ],
    defaultModelId: 'openai-test',
    welcomePrompts: [{ label: 'granular prompt', description: 'granular prompt' }],
  }),
)
const granularModelResolution = useStableSceneRuntime(granularModelConfig)
const showGranularModelWelcome = useSceneWelcomeState(granularModelResolution)

async function switchGranularModel() {
  const modelsRuntime = granularModelResolution.value.runtime.models
  if (!modelsRuntime) {
    return
  }

  const nextModelId = 'deepseek-test'
  const changed = await Promise.resolve(modelsRuntime.selectModel(nextModelId))
  if (changed !== false) {
    granularModelLog.value = modelsRuntime.currentModelId.value ?? ''
  }
}

const providerBranchResponseProvider = createMockProvider({
  provider: 'provider-branch',
  model: 'provider-branch-model',
})

const granularFooterRightConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Granular Footer Right Surface',
    welcomeTitle: 'Granular Footer Right Surface',
    welcomeDescription:
      'The official granular path should allow footer-right slot replacement without default sender tools.',
  }),
)

const granularFooterRightResolution = useStableSceneRuntime(granularFooterRightConfig)
const showGranularFooterRightWelcome = useSceneWelcomeState(granularFooterRightResolution)

const granularSenderConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Granular Sender Config Surface',
    welcomeTitle: 'Granular Sender Config Surface',
    welcomeDescription:
      'The official granular path should allow sender config to disable voice and word-count affordances.',
    sender: {
      wordCount: false,
      voice: {
        enabled: false,
      },
    },
  }),
)

const granularSenderConfigResolution = useStableSceneRuntime(granularSenderConfig)
const showGranularSenderConfigWelcome = useSceneWelcomeState(granularSenderConfigResolution)

const showGranularCloseShell = ref(true)
const granularCloseConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Granular Close Surface',
    welcomeTitle: 'Granular Close Surface',
    welcomeDescription: 'Leaf composition should be able to remove the surrounding shell after close.',
  }),
)
const granularCloseResolution = useStableSceneRuntime(granularCloseConfig)
const showGranularCloseWelcome = useSceneWelcomeState(granularCloseResolution)

const workspaceHistoryConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'Workspace History Surface',
    welcomeTitle: 'Workspace History',
    welcomeDescription: 'WorkspaceLayout default left owner path should keep history search and filtering alive.',
    workspace: true,
  }),
)
const workspaceHistoryResolution = useStableSceneRuntime(workspaceHistoryConfig)
const showWorkspaceHistoryWelcome = useSceneWelcomeState(workspaceHistoryResolution)

async function seedWorkspaceHistory() {
  const history = workspaceHistoryResolution.value.runtime.history
  if (!history || history.conversations.value.length > 0) {
    return
  }

  const firstConversationId = await Promise.resolve(history.createConversation({ title: 'Alpha Surface' }))
  await Promise.resolve(history.createConversation({ title: 'Beta Surface' }))
  if (firstConversationId) {
    await Promise.resolve(history.switchConversation(firstConversationId))
  }
}
</script>

<style scoped>
.surface-grid {
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

.surface-custom-sender {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
}

.surface-custom-sender button,
.surface-diagnostics button,
.history-surface-toolbar button,
.surface-runtime-diagnostics-toolbar button {
  padding: 6px 12px;
  border: 1px solid #d0d7e2;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.surface-runtime-diagnostics-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px 0;
  font-size: 12px;
}

.surface-runtime-diagnostics-toolbar span {
  padding: 2px 6px;
  border-radius: 999px;
  background: #eef2ff;
}

.surface-diagnostics {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 8px 12px 0;
  font-size: 12px;
}

.surface-diagnostics span {
  padding: 2px 6px;
  border-radius: 999px;
  background: #eef2ff;
}

.history-surface-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 420px;
  overflow: hidden;
  isolation: isolate;
}

.history-surface-toolbar {
  display: flex;
  gap: 8px;
}

.surface-history-placeholder {
  height: 100%;
  padding: 16px;
  color: #667085;
  font-size: 13px;
}
</style>
