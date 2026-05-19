<script setup lang="ts">
import { Chat } from '@/index'
import { IconMenuCollapse } from '@opentiny/tiny-robot-svgs'
import { chatGptNavItems, chatGptRecentChats } from '../data'
</script>

<template>
  <div class="chatgpt-sidebar-panel">
    <div class="chatgpt-sidebar-panel__brand">
      <strong>ChatGPT</strong>
      <Chat.AsideToggle side="left" class="chatgpt-sidebar-panel__collapse-button">
        <IconMenuCollapse />
      </Chat.AsideToggle>
    </div>

    <div class="chatgpt-sidebar-panel__quick-actions">
      <button
        v-for="item in chatGptNavItems"
        :key="item.label"
        class="chatgpt-sidebar-panel__quick-action"
        type="button"
      >
        <component :is="item.icon" />
        <span>{{ item.label }}</span>
      </button>
    </div>

    <div class="chatgpt-sidebar-panel__section">
      <p class="chatgpt-sidebar-panel__section-label">最近</p>
      <button
        v-for="item in chatGptRecentChats"
        :key="item"
        class="chatgpt-sidebar-panel__recent-item"
        :class="{ 'is-active': item === '问候交流' }"
        type="button"
      >
        {{ item }}
      </button>
    </div>

    <div class="chatgpt-sidebar-panel__account">
      <div class="chatgpt-sidebar-panel__account-avatar">lu</div>
      <div>
        <strong>lu bai</strong>
        <p>Plus</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chatgpt-sidebar-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chatgpt-sidebar-panel__brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  padding: 4px 8px 10px;
}

.chatgpt-sidebar-panel__brand strong {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.chatgpt-sidebar-panel__quick-actions,
.chatgpt-sidebar-panel__section {
  display: grid;
  gap: 6px;
}

.chatgpt-sidebar-panel__quick-action,
.chatgpt-sidebar-panel__recent-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 0 12px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: #171717;
  text-align: left;
}

.chatgpt-sidebar-panel__quick-action :deep(svg),
.chatgpt-sidebar-panel__recent-item :deep(svg),
.chatgpt-sidebar-panel__collapse-button :deep(svg) {
  font-size: 18px;
}

.chatgpt-sidebar-panel__collapse-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #171717;
}

.chatgpt-sidebar-panel__section {
  margin-top: 18px;
}

.chatgpt-sidebar-panel__section-label {
  margin: 0;
  padding: 0 12px;
  font-size: 14px;
  font-weight: 700;
}

.chatgpt-sidebar-panel__quick-action:hover,
.chatgpt-sidebar-panel__recent-item:hover,
.chatgpt-sidebar-panel__collapse-button:hover,
.chatgpt-sidebar-panel__account:hover {
  background: #ffffff;
}

.chatgpt-sidebar-panel__recent-item.is-active {
  background: #ecebe8;
}

.chatgpt-sidebar-panel__account {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  padding: 10px;
  border-radius: 16px;
}

.chatgpt-sidebar-panel__account-avatar {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: #dfdfda;
  font-size: 12px;
  font-weight: 700;
}

.chatgpt-sidebar-panel__account p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #6b6b66;
}
</style>
