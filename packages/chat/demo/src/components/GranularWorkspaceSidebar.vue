<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrChat, TrMcpTrigger } from '@opentiny/tiny-robot-chat'
import type { UseMcpManagerReturn } from '@opentiny/tiny-robot-chat'
import { useTheme, type ColorMode } from '@opentiny/tiny-robot'
import { IconAi, IconPlus } from '@opentiny/tiny-robot-svgs'
import { ChatWorkspaceSidebarShell } from '@/components/chat/workspace'
import { CHAT_KIT_KEY, useRequiredInject } from '../../../src/context'

type SidebarTab = 'model' | 'tools' | 'theme' | 'history'

const props = defineProps<{
  title: string
  models: Array<{ id: string; label: string; providerId: string }>
  currentModel: string
  temperature: number
  mcpManager: UseMcpManagerReturn
}>()

const emit = defineEmits<{
  (e: 'update:currentModel', value: string): void
  (e: 'update:temperature', value: number): void
}>()

const chatKit = useRequiredInject(CHAT_KIT_KEY, 'chat kit')
const { colorMode, setColorMode } = useTheme()

const activeTab = ref<SidebarTab>('model')
const promptLibrary = [
  '你是一个专注于企业设计系统的前端工程助手。',
  '优先给出可直接落地的 API 设计方案，并解释兼容性影响。',
  '回复尽量简洁，必要时再展开具体实现细节。',
]

const currentModelProxy = computed({
  get: () => props.currentModel,
  set: (value: string) => emit('update:currentModel', value),
})

const activePluginCount = computed(() => props.mcpManager.activeCount.value)
const pluginCards = computed(() => props.mcpManager.installedPlugins.value)

function handleCreateConversation() {
  chatKit.createConversation()
}

function handleTemperatureInput(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  emit('update:temperature', Number.isFinite(value) ? value : props.temperature)
}

function isCurrentColorMode(mode: ColorMode) {
  return colorMode?.value === mode
}

function switchTheme(mode: ColorMode) {
  setColorMode(mode)
}

function formatToolCount(count: number) {
  return `${count} tool${count === 1 ? '' : 's'}`
}

const tabOptions: Array<{ id: SidebarTab; label: string }> = [
  { id: 'model', label: '模型配置' },
  { id: 'tools', label: '工具' },
  { id: 'theme', label: '主题' },
  { id: 'history', label: '历史会话' },
]
</script>

<template>
  <ChatWorkspaceSidebarShell class="granular-sidebar-shell">
    <template #brand>
      <div class="granular-sidebar__brand-main">
        <span class="granular-sidebar__brand-icon">
          <IconAi />
        </span>
        <strong>{{ props.title }}</strong>
      </div>
    </template>

    <section class="granular-sidebar__panel">
      <button type="button" class="granular-sidebar__new-session" @click="handleCreateConversation">
        <span>＋ 新建会话</span>
        <span class="granular-sidebar__kbd-group">
          <kbd>Ctrl</kbd>
          <kbd>K</kbd>
        </span>
      </button>

      <nav class="granular-sidebar__tabs" aria-label="Sidebar sections">
        <button
          v-for="tab in tabOptions"
          :key="tab.id"
          type="button"
          class="granular-sidebar__tab"
          :class="{ 'is-active': activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </nav>

      <div class="granular-sidebar__panel-body" :class="{ 'is-history': activeTab === 'history' }">
        <template v-if="activeTab === 'model'">
          <section class="granular-sidebar__section">
            <div class="granular-sidebar__section-title">模型选择</div>
            <label class="granular-sidebar__select-wrap">
              <select v-model="currentModelProxy" class="granular-sidebar__select">
                <option v-for="model in props.models" :key="model.id" :value="model.id">
                  {{ model.label }}
                </option>
              </select>
            </label>
          </section>

          <section class="granular-sidebar__section">
            <div class="granular-sidebar__section-row">
              <span class="granular-sidebar__section-title">模型温度</span>
              <strong class="granular-sidebar__value">{{ props.temperature.toFixed(1) }}</strong>
            </div>
            <input
              class="granular-sidebar__slider"
              type="range"
              min="0"
              max="1"
              step="0.1"
              :value="props.temperature"
              @input="handleTemperatureInput"
            />
          </section>

          <section class="granular-sidebar__section">
            <div class="granular-sidebar__section-row">
              <span class="granular-sidebar__section-title">提示词</span>
              <button type="button" class="granular-sidebar__ghost-action" aria-label="Add prompt">
                <IconPlus />
              </button>
            </div>
            <div class="granular-sidebar__prompt-list">
              <div v-for="prompt in promptLibrary" :key="prompt" class="granular-sidebar__prompt-item">
                {{ prompt }}
              </div>
            </div>
          </section>
        </template>

        <template v-else-if="activeTab === 'tools'">
          <section class="granular-sidebar__section">
            <div class="granular-sidebar__section-row">
              <span class="granular-sidebar__section-title">MCP 扩展</span>
              <span class="granular-sidebar__badge">{{ activePluginCount }} active</span>
            </div>
            <div class="granular-sidebar__tools-actions">
              <TrMcpTrigger />
            </div>
          </section>

          <section class="granular-sidebar__plugin-list">
            <article v-for="plugin in pluginCards" :key="plugin.id" class="granular-sidebar__plugin-card">
              <div class="granular-sidebar__plugin-head">
                <strong>{{ plugin.name }}</strong>
                <span class="granular-sidebar__plugin-state" :class="{ 'is-enabled': plugin.enabled }">
                  {{ plugin.enabled ? 'Enabled' : 'Disabled' }}
                </span>
              </div>
              <p>{{ plugin.description }}</p>
              <span class="granular-sidebar__plugin-meta">{{ formatToolCount(plugin.tools.length) }}</span>
            </article>
          </section>
        </template>

        <template v-else-if="activeTab === 'theme'">
          <section class="granular-sidebar__section">
            <div class="granular-sidebar__section-title">主题模式</div>
            <div class="granular-sidebar__theme-grid">
              <button
                type="button"
                class="granular-sidebar__theme-card"
                :class="{ 'is-active': isCurrentColorMode('light') }"
                @click="switchTheme('light')"
              >
                <span>浅色</span>
                <small>适合文档和工作台</small>
              </button>
              <button
                type="button"
                class="granular-sidebar__theme-card"
                :class="{ 'is-active': isCurrentColorMode('dark') }"
                @click="switchTheme('dark')"
              >
                <span>深色</span>
                <small>适合夜间长时间使用</small>
              </button>
              <button
                type="button"
                class="granular-sidebar__theme-card"
                :class="{ 'is-active': isCurrentColorMode('auto') }"
                @click="switchTheme('auto')"
              >
                <span>跟随系统</span>
                <small>自动同步系统配色</small>
              </button>
            </div>
          </section>
        </template>

        <TrChat.HistorySurface v-else class="granular-sidebar__history-surface" />
      </div>
    </section>
  </ChatWorkspaceSidebarShell>
</template>

<style scoped>
.granular-sidebar-shell {
  --granular-sidebar-shell-bg: linear-gradient(
    180deg,
    color-mix(in srgb, var(--chat-workspace-panel-bg) 94%, var(--chat-workspace-panel-bg-muted) 6%) 0%,
    color-mix(in srgb, var(--chat-workspace-panel-bg-muted) 80%, var(--chat-workspace-panel-bg) 20%) 100%
  );
  --granular-sidebar-surface: color-mix(
    in srgb,
    var(--chat-workspace-panel-bg) 90%,
    var(--chat-workspace-panel-bg-muted) 10%
  );
  --granular-sidebar-surface-strong: color-mix(
    in srgb,
    var(--chat-workspace-panel-bg) 96%,
    var(--chat-workspace-panel-bg-muted) 4%
  );
  --granular-sidebar-surface-soft: color-mix(
    in srgb,
    var(--chat-workspace-panel-bg-muted) 78%,
    var(--chat-workspace-panel-bg) 22%
  );
  --granular-sidebar-border: color-mix(in srgb, var(--chat-workspace-border) 78%, transparent);
  --granular-sidebar-border-strong: color-mix(in srgb, var(--chat-workspace-border) 92%, transparent);
  --granular-sidebar-inset-border: inset 0 0 0 1px color-mix(in srgb, var(--chat-workspace-border) 72%, transparent);
  --granular-sidebar-kbd-bg: color-mix(
    in srgb,
    var(--chat-workspace-panel-bg) 92%,
    var(--chat-workspace-panel-bg-muted) 8%
  );
  --granular-sidebar-success: color-mix(in srgb, #22c55e 76%, var(--chat-workspace-text-primary) 24%);
  background: var(--granular-sidebar-shell-bg);
}

.granular-sidebar__brand-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.granular-sidebar__brand-main strong {
  font-size: 15px;
  line-height: 1.2;
}

.granular-sidebar__brand-icon {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--chat-workspace-accent, var(--tr-color-primary, #2f6bff));
}

.granular-sidebar__new-session {
  width: 100%;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid var(--granular-sidebar-border-strong);
  border-radius: 14px;
  background: var(--granular-sidebar-surface);
  color: var(--chat-workspace-text-primary, var(--tr-text-primary, #111827));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.granular-sidebar__kbd-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.granular-sidebar__kbd-group kbd {
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 7px;
  border: 1px solid var(--granular-sidebar-border);
  background: var(--granular-sidebar-kbd-bg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--chat-workspace-text-secondary, var(--tr-text-secondary, #6b7280));
  font-size: 11px;
  font-weight: 700;
}

.granular-sidebar__panel {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  padding: 0 20px 24px;
  overflow: hidden;
}

.granular-sidebar__tabs {
  display: flex;
  gap: 4px;
  padding: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--chat-workspace-border) 72%, transparent);
  overflow-x: auto;
}

.granular-sidebar__tab {
  position: relative;
  padding: 14px 2px 12px;
  border: 0;
  background: transparent;
  color: var(--chat-workspace-text-secondary, var(--tr-text-secondary, #6b7280));
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.granular-sidebar__tab.is-active {
  color: var(--chat-workspace-text-primary, var(--tr-text-primary, #111827));
}

.granular-sidebar__tab.is-active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  border-radius: 999px;
  background: var(--chat-workspace-accent, var(--tr-color-primary, #2f6bff));
}

.granular-sidebar__panel-body {
  min-height: 0;
  overflow: auto;
  display: grid;
  align-content: start;
  gap: 18px;
  padding: 18px 0 0;
}

.granular-sidebar__panel-body.is-history {
  display: flex;
  flex-direction: column;
  align-content: normal;
}

.granular-sidebar__section,
.granular-sidebar__plugin-list {
  display: grid;
  gap: 12px;
}

.granular-sidebar__section-title {
  font-size: 14px;
  font-weight: 600;
}

.granular-sidebar__section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.granular-sidebar__value {
  font-size: 14px;
  font-weight: 700;
}

.granular-sidebar__select-wrap {
  display: block;
}

.granular-sidebar__select {
  width: 100%;
  height: 42px;
  padding: 0 14px;
  border: 1px solid var(--granular-sidebar-border-strong);
  border-radius: 12px;
  background: var(--granular-sidebar-surface-strong);
  color: var(--chat-workspace-text-primary, var(--tr-text-primary, #111827));
  font-size: 14px;
}

.granular-sidebar__slider {
  width: 100%;
}

.granular-sidebar__ghost-action {
  width: 26px;
  height: 26px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--chat-workspace-text-secondary, var(--tr-text-secondary, #6b7280));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.granular-sidebar__prompt-list {
  display: grid;
  gap: 8px;
}

.granular-sidebar__prompt-item {
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--granular-sidebar-surface-soft);
  color: var(--chat-workspace-text-secondary, var(--tr-text-secondary, #6b7280));
  font-size: 12px;
  line-height: 1.55;
  box-shadow: var(--granular-sidebar-inset-border);
}

.granular-sidebar__badge {
  padding: 6px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--chat-workspace-accent, #2f6bff) 10%, transparent);
  color: var(--chat-workspace-accent, var(--tr-color-primary, #2f6bff));
  font-size: 11px;
  font-weight: 700;
}

.granular-sidebar__tools-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.granular-sidebar__plugin-card {
  display: grid;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 16px;
  background: var(--granular-sidebar-surface-soft);
  box-shadow: var(--granular-sidebar-inset-border);
}

.granular-sidebar__plugin-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.granular-sidebar__plugin-card p {
  margin: 0;
  color: var(--chat-workspace-text-secondary, var(--tr-text-secondary, #6b7280));
  font-size: 12px;
  line-height: 1.5;
}

.granular-sidebar__plugin-state,
.granular-sidebar__plugin-meta {
  color: var(--chat-workspace-text-secondary, var(--tr-text-secondary, #6b7280));
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.granular-sidebar__plugin-state.is-enabled {
  color: var(--granular-sidebar-success);
}

.granular-sidebar__theme-grid {
  display: grid;
  gap: 10px;
}

.granular-sidebar__theme-card {
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid var(--granular-sidebar-border);
  background: var(--granular-sidebar-surface-soft);
  text-align: left;
  cursor: pointer;
}

.granular-sidebar__theme-card span {
  font-size: 13px;
  font-weight: 700;
}

.granular-sidebar__theme-card small {
  color: var(--chat-workspace-text-secondary, var(--tr-text-secondary, #6b7280));
  font-size: 12px;
}

.granular-sidebar__theme-card.is-active {
  border-color: color-mix(in srgb, var(--chat-workspace-accent, #2f6bff) 40%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--chat-workspace-accent, #2f6bff) 24%, transparent);
}

.granular-sidebar__history-surface {
  flex: 1;
  min-height: 0;
}
</style>
