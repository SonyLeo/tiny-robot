<script setup lang="ts">
import { TrContainer, TrHistory, TrIconButton, type HistoryMenuItem } from '@opentiny/tiny-robot'
import { IconClose, IconHistory, IconNewSession } from '@opentiny/tiny-robot-svgs'
import { computed, ref, watch } from 'vue'
import { useChat } from '../composables/useChat'
import { useMcp } from '../composables/useMcp'
import ChatConversation from './ChatConversation.vue'
import ThemeToggleButton from './ThemeToggleButton.vue'

const show = defineModel<boolean>('show', { required: true })
const fullscreen = defineModel<boolean>('fullscreen', { default: false })

const {
  currentConversationTitle,
  activeConversationId,
  conversations,
  switchConversation,
  updateConversationTitle,
  deleteConversation,
  startNewConversation,
} = useChat()
const { closePicker } = useMcp()
const historyDrawerOpen = ref(false)

const panelTitle = computed(() => currentConversationTitle.value || 'AI Assistant')
const historyData = computed(() =>
  conversations.value.map((item) => ({
    ...item,
    title: item.title || 'New conversation',
  })),
)

watch(show, (value) => {
  if (!value) {
    closePicker()
    historyDrawerOpen.value = false
  }
})

function handleHistorySelect(item: { id: string }) {
  switchConversation(item.id)
  historyDrawerOpen.value = false
}

function handleHistoryTitleChange(newTitle: string, item: { id: string }) {
  updateConversationTitle(item.id, newTitle)
}

function handleHistoryAction(action: HistoryMenuItem, item: { id: string }) {
  if (action.id === 'delete') {
    deleteConversation(item.id)
  }
}
</script>

<template>
  <TrContainer v-model:show="show" v-model:fullscreen="fullscreen" :title="panelTitle" class="assistant-panel">
    <template #operations>
      <TrIconButton
        :icon="IconNewSession"
        size="28"
        svgSize="20"
        title="新会话"
        aria-label="Start new conversation"
        @click="startNewConversation"
      />

      <div class="assistant-history-anchor">
        <TrIconButton
          :icon="IconHistory"
          size="28"
          svgSize="20"
          title="历史会话"
          aria-label="Open conversation history"
          @click="historyDrawerOpen = true"
        />

        <Transition name="assistant-history-popover">
          <div
            v-if="historyDrawerOpen"
            class="assistant-history-popover"
            role="dialog"
            aria-modal="true"
            aria-label="Conversation history"
          >
            <button
              class="assistant-history-popover__backdrop"
              type="button"
              aria-label="Close history"
              @click="historyDrawerOpen = false"
            />
            <aside class="assistant-history-popover__panel">
              <div class="assistant-history-popover__head">
                <span class="assistant-history-popover__title">历史对话</span>
                <TrIconButton
                  :icon="IconClose"
                  size="28"
                  svgSize="20"
                  title="关闭历史对话"
                  aria-label="Close conversation history"
                  @click="historyDrawerOpen = false"
                />
              </div>
              <button class="assistant-history-popover__new" type="button" @click="startNewConversation">
                想写段文案，起个名字
              </button>
              <TrHistory
                class="assistant-history-popover__list"
                :data="historyData"
                :selected="activeConversationId ?? undefined"
                :search-bar="true"
                @item-click="handleHistorySelect"
                @item-title-change="handleHistoryTitleChange"
                @item-action="handleHistoryAction"
              />
            </aside>
          </div>
        </Transition>
      </div>

      <ThemeToggleButton />
    </template>

    <ChatConversation :fullscreen="fullscreen" />
  </TrContainer>
</template>

<style scoped>
.assistant-panel {
  box-shadow: -12px 0 40px rgba(15, 23, 42, 0.08);
}

.assistant-history-anchor {
  position: relative;
  display: inline-flex;
}

.assistant-history-popover {
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--tr-z-index-drawer);
}

.assistant-history-popover__backdrop {
  display: none;
}

.assistant-history-popover__panel {
  width: min(300px, calc(100vw - 40px));
  max-height: min(560px, calc(100vh - 140px));
  padding: 18px 16px 16px;
  background: var(--tr-container-bg-default);
  border: 1px solid color-mix(in srgb, var(--tr-border-color-disabled) 84%, transparent);
  border-radius: 24px;
  box-shadow:
    0 18px 40px rgba(15, 23, 42, 0.14),
    0 2px 10px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.assistant-history-popover__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.assistant-history-popover__title {
  font-size: 18px;
  font-weight: 700;
}

.assistant-history-popover__new {
  width: 100%;
  min-height: 40px;
  padding: 0 14px;
  border: none;
  border-radius: 14px;
  background: var(--tr-container-bg-hover);
  color: var(--tr-color-primary);
  text-align: left;
  font-size: 14px;
  cursor: pointer;
}

.assistant-history-popover__new:hover {
  filter: brightness(0.98);
}

.assistant-history-popover__list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  --tr-history-item-selected-bg: var(--tr-history-item-hover-bg);
  --tr-history-item-selected-color: var(--tr-color-primary);
  --tr-history-item-space-y: 4px;
}

.assistant-history-popover__list :deep(.tr-history) {
  padding-right: 2px;
}

.assistant-history-popover__list :deep(.tr-history__search) {
  margin-bottom: 8px;
}

.assistant-history-popover-enter-active,
.assistant-history-popover-leave-active {
  transition: opacity 0.2s ease;
}

.assistant-history-popover-enter-active .assistant-history-popover__panel,
.assistant-history-popover-leave-active .assistant-history-popover__panel {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.assistant-history-popover-enter-from,
.assistant-history-popover-leave-to {
  opacity: 0;
}

.assistant-history-popover-enter-from .assistant-history-popover__panel,
.assistant-history-popover-leave-to .assistant-history-popover__panel {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

@media (max-width: 767px) {
  .assistant-history-popover {
    position: fixed;
    top: 56px;
    left: 12px;
    right: 12px;
    transform: none;
    z-index: var(--tr-z-index-drawer);
  }

  .assistant-history-popover__backdrop {
    position: fixed;
    inset: 0;
    display: block;
    border: none;
    background: transparent;
    cursor: pointer;
  }

  .assistant-history-popover__panel {
    width: auto;
    max-height: calc(100vh - 120px);
    padding: 16px 14px 14px;
    border-radius: 20px;
  }
}
</style>
