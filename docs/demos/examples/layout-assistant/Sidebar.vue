<template>
  <div class="layout-assistant-demo__sidebar" :class="{ 'is-expanded': isExpanded, 'is-rail': !isExpanded }">
    <div class="layout-assistant-demo__sidebar-stage">
      <div class="layout-assistant-demo__sidebar-brand">
        <div class="layout-assistant-demo__sidebar-brand-identity">
          <TrLayout.AsideToggle
            v-if="!isExpanded"
            placement="left"
            class="layout-assistant-demo__sidebar-brand-toggle"
            aria-label="展开左侧历史"
            title="展开左侧历史"
          >
            <span
              class="layout-assistant-demo__sidebar-brand-toggle-icon layout-assistant-demo__sidebar-brand-toggle-icon--logo"
              aria-hidden="true"
            >
              <IconAi class="layout-assistant-demo__brand-logo" />
            </span>
            <span
              class="layout-assistant-demo__sidebar-brand-toggle-icon layout-assistant-demo__sidebar-brand-toggle-icon--expand"
              aria-hidden="true"
            >
              <IconMenuExpand />
            </span>
          </TrLayout.AsideToggle>

          <div v-else class="layout-assistant-demo__sidebar-brand-mark" aria-hidden="true">
            <IconAi class="layout-assistant-demo__brand-logo" />
          </div>

          <strong class="layout-assistant-demo__sidebar-brand-title">TinyRobot</strong>
        </div>

        <TrLayout.AsideToggle
          v-if="isExpanded"
          placement="left"
          class="layout-assistant-demo__icon-button"
          aria-label="收起左侧历史"
        >
          <IconMenuCollapse />
        </TrLayout.AsideToggle>
      </div>

      <div class="layout-assistant-demo__sidebar-new-chat">
        <button
          v-if="!isExpanded"
          class="layout-assistant-demo__sidebar-compact-button"
          type="button"
          aria-label="新建会话"
          @click="context.handleNewConversation"
        >
          <IconNewSession />
        </button>

        <button
          v-else
          class="layout-assistant-demo__sidebar-new-chat-button"
          type="button"
          @click="context.handleNewConversation"
        >
          <span class="layout-assistant-demo__sidebar-new-chat-icon" aria-hidden="true">
            <IconNewSession />
          </span>
          <span class="layout-assistant-demo__sidebar-new-chat-text">新建会话</span>
        </button>
      </div>

      <div v-if="isExpanded" class="layout-assistant-demo__history-section">
        <div class="layout-assistant-demo__sidebar-head">
          <div>
            <span class="layout-assistant-demo__sidebar-title">历史对话</span>
            <span class="layout-assistant-demo__sidebar-meta">{{ historyCount }} 个会话</span>
          </div>
        </div>

        <div class="layout-assistant-demo__history-shell">
          <TrHistory
            class="layout-assistant-demo__history"
            :selected="context.activeConversationId ?? undefined"
            :search-bar="true"
            :data="context.historyData"
            @item-click="(item) => item?.id && context.handleHistorySelect(item)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrHistory, TrLayout } from '@opentiny/tiny-robot'
import { IconAi, IconMenuCollapse, IconMenuExpand, IconNewSession } from '@opentiny/tiny-robot-svgs'
import { computed } from 'vue'
import type { LayoutAssistantContext } from './context'

const props = defineProps<{
  context: LayoutAssistantContext
  isExpanded: boolean
}>()

const historyCount = computed(() => props.context.historyData.length)
</script>
