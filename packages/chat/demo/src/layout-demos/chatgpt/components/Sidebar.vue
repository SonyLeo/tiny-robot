<script setup lang="ts">
import { useChatAside } from '@/composables/useChatAside'
import { Chat } from '@/index'
import { IconAi, IconMenuCollapse, IconMenuExpand, IconUser } from '@opentiny/tiny-robot-svgs'
import { chatGptNavItems, chatGptRecentChats } from '../data'

const [newChatItem, ...quickActionItems] = chatGptNavItems
const { isDrawer, isRail } = useChatAside('left')
</script>

<template>
  <Chat.Aside placement="left" v-slot="{ isExpanded }">
    <div class="chatgpt-sidebar" :class="{ 'is-expanded': isExpanded, 'is-drawer': isDrawer, 'is-rail': isRail }">
      <div class="chatgpt-sidebar__stage">
        <div class="chatgpt-sidebar__brand">
          <div class="chatgpt-sidebar__brand-identity">
            <Chat.AsideToggle
              v-if="isRail"
              placement="left"
              class="chatgpt-sidebar__brand-toggle"
              aria-label="Open sidebar"
              title="Open sidebar"
            >
              <span
                class="chatgpt-sidebar__brand-toggle-icon chatgpt-sidebar__brand-toggle-icon--logo"
                aria-hidden="true"
              >
                <IconAi />
              </span>
              <span
                class="chatgpt-sidebar__brand-toggle-icon chatgpt-sidebar__brand-toggle-icon--expand"
                aria-hidden="true"
              >
                <IconMenuExpand />
              </span>
            </Chat.AsideToggle>

            <div v-else class="chatgpt-sidebar__brand-mark" aria-hidden="true">
              <IconAi />
            </div>

            <strong class="chatgpt-sidebar__title">ChatGPT</strong>
          </div>

          <Chat.AsideToggle
            v-if="!isRail"
            placement="left"
            class="chatgpt-sidebar__icon-button"
            aria-label="Collapse sidebar"
          >
            <IconMenuCollapse />
          </Chat.AsideToggle>
        </div>

        <div class="chatgpt-sidebar__new-chat">
          <button v-if="isRail" class="chatgpt-sidebar__compact-button" type="button" :aria-label="newChatItem.label">
            <component :is="newChatItem.icon" />
          </button>

          <button v-else class="chatgpt-sidebar__new-chat-button" type="button">
            <span class="chatgpt-sidebar__new-chat-icon" aria-hidden="true">
              <component :is="newChatItem.icon" />
            </span>
            <span class="chatgpt-sidebar__new-chat-text">{{ newChatItem.label }}</span>
          </button>
        </div>

        <div class="chatgpt-sidebar__quick-actions">
          <button v-for="item in quickActionItems" :key="item.label" class="chatgpt-sidebar__action" type="button">
            <span class="chatgpt-sidebar__action-icon" aria-hidden="true">
              <component :is="item.icon" />
            </span>
            <span class="chatgpt-sidebar__action-content">{{ item.label }}</span>
          </button>
        </div>

        <div class="chatgpt-sidebar__recent">
          <p class="chatgpt-sidebar__section-label">最近</p>

          <button
            v-for="(item, index) in chatGptRecentChats"
            :key="`${item}-${index}`"
            class="chatgpt-sidebar__recent-item"
            :class="{ 'is-active': index === 0 }"
            type="button"
          >
            <span class="chatgpt-sidebar__recent-content">{{ item }}</span>
          </button>
        </div>

        <button class="chatgpt-sidebar__bottom-button" type="button" aria-label="Profile">
          <IconUser />
        </button>
      </div>
    </div>
  </Chat.Aside>
</template>

<style>
.chatgpt-sidebar {
  height: 100%;
  background: #f7f7f5;
  color: #171717;
  overflow: hidden;
}

.chatgpt-sidebar__stage {
  display: flex;
  flex-direction: column;
  width: var(--tr-chat-layout-left-expanded-width, 260px);
  height: 100%;
  padding: 10px 8px;
  transition: width var(--chatgpt-sidebar-motion-duration, 280ms)
    var(--chatgpt-sidebar-motion-easing, cubic-bezier(0.4, 0, 0.2, 1));
}

.chatgpt-sidebar__brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  padding: 4px 0 10px;
}

.chatgpt-sidebar__brand-identity {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.chatgpt-sidebar__brand-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #171717;
}

.chatgpt-sidebar__brand-toggle-icon {
  position: absolute;
  inset: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: opacity var(--chatgpt-sidebar-motion-duration, 240ms)
    var(--chatgpt-sidebar-motion-easing, cubic-bezier(0, 0, 0.2, 1));
}

.chatgpt-sidebar__brand-toggle svg {
  font-size: 20px;
}

.chatgpt-sidebar__brand-toggle-icon--expand {
  opacity: 0;
}

.chatgpt-sidebar__brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  color: #171717;
}

.chatgpt-sidebar__brand-mark svg {
  font-size: 20px;
}

.chatgpt-sidebar__title,
.chatgpt-sidebar__action-content,
.chatgpt-sidebar__recent-content,
.chatgpt-sidebar__section-label,
.chatgpt-sidebar__new-chat-text {
  transition: opacity var(--chatgpt-sidebar-motion-duration, 280ms)
    var(--chatgpt-sidebar-motion-easing, cubic-bezier(0.4, 0, 0.2, 1));
}

.chatgpt-sidebar__title {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.chatgpt-sidebar__action-content,
.chatgpt-sidebar__recent-content,
.chatgpt-sidebar__new-chat-text {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
}

.chatgpt-sidebar__icon-button,
.chatgpt-sidebar__compact-button,
.chatgpt-sidebar__bottom-button,
.chatgpt-sidebar__action,
.chatgpt-sidebar__recent-item {
  border: 0;
  background: transparent;
  color: #171717;
}

.chatgpt-sidebar__icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
}

.chatgpt-sidebar__compact-button,
.chatgpt-sidebar__bottom-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
}

.chatgpt-sidebar__new-chat {
  margin-bottom: 8px;
  padding: 0;
}

.chatgpt-sidebar__new-chat-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 44px;
  padding-inline: 16px;
  border: 1px solid #d6d2ca;
  border-radius: 999px;
  background: #ffffff;
  color: #171717;
  text-align: center;
  transition:
    opacity var(--chatgpt-sidebar-motion-duration, 280ms)
      var(--chatgpt-sidebar-motion-easing, cubic-bezier(0.4, 0, 0.2, 1)),
    transform var(--chatgpt-sidebar-motion-duration, 280ms)
      var(--chatgpt-sidebar-motion-easing, cubic-bezier(0.4, 0, 0.2, 1));
}

.chatgpt-sidebar__new-chat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.chatgpt-sidebar__quick-actions,
.chatgpt-sidebar__recent {
  display: grid;
  gap: 6px;
}

.chatgpt-sidebar__recent {
  transition:
    max-height var(--chatgpt-sidebar-motion-duration, 240ms)
      var(--chatgpt-sidebar-motion-easing, cubic-bezier(0, 0, 0.2, 1)),
    opacity var(--chatgpt-sidebar-motion-duration, 240ms)
      var(--chatgpt-sidebar-motion-easing, cubic-bezier(0, 0, 0.2, 1)),
    margin-top var(--chatgpt-sidebar-motion-duration, 240ms)
      var(--chatgpt-sidebar-motion-easing, cubic-bezier(0, 0, 0.2, 1));
  max-height: 360px;
}

.chatgpt-sidebar__action {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  align-items: center;
  column-gap: 10px;
  min-height: 42px;
  padding: 0 8px 0 0;
  border-radius: 14px;
  text-align: left;
}

.chatgpt-sidebar__recent-item {
  display: flex;
  align-items: center;
  min-height: 42px;
  padding: 0 12px;
  border-radius: 14px;
  text-align: left;
}

.chatgpt-sidebar__action-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.chatgpt-sidebar__action svg,
.chatgpt-sidebar__icon-button svg,
.chatgpt-sidebar__compact-button svg,
.chatgpt-sidebar__bottom-button svg,
.chatgpt-sidebar__new-chat-icon svg,
.chatgpt-sidebar__new-chat-button svg {
  flex: 0 0 auto;
  font-size: 18px;
}

.chatgpt-sidebar__recent {
  margin-top: 18px;
}

.chatgpt-sidebar__section-label {
  margin: 0;
  padding: 0 8px;
  font-size: 14px;
  font-weight: 700;
}

.chatgpt-sidebar__action:hover,
.chatgpt-sidebar__recent-item:hover,
.chatgpt-sidebar__icon-button:hover,
.chatgpt-sidebar__compact-button:hover,
.chatgpt-sidebar__bottom-button:hover,
.chatgpt-sidebar__new-chat-button:hover,
.chatgpt-sidebar__brand-toggle:hover {
  background: #ffffff;
}

.chatgpt-sidebar__recent-item.is-active {
  background: #ecebe8;
}

.chatgpt-sidebar__bottom-button {
  margin-top: auto;
  align-self: flex-start;
  margin-inline: 0;
}

.chatgpt-sidebar.is-rail .chatgpt-sidebar__title,
.chatgpt-sidebar.is-rail .chatgpt-sidebar__action-content,
.chatgpt-sidebar.is-rail .chatgpt-sidebar__recent-content,
.chatgpt-sidebar.is-rail .chatgpt-sidebar__section-label {
  opacity: 0;
  pointer-events: none;
}

.chatgpt-sidebar.is-rail .chatgpt-sidebar__stage {
  width: var(--tr-chat-layout-left-collapsed-width, 52px);
}

.chatgpt-sidebar.is-rail:hover .chatgpt-sidebar__brand-toggle-icon--logo,
.chatgpt-sidebar.is-rail:focus-within .chatgpt-sidebar__brand-toggle-icon--logo {
  opacity: 0;
}

.chatgpt-sidebar.is-rail:hover .chatgpt-sidebar__brand-toggle-icon--expand,
.chatgpt-sidebar.is-rail:focus-within .chatgpt-sidebar__brand-toggle-icon--expand {
  opacity: 1;
}

.chatgpt-sidebar.is-rail .chatgpt-sidebar__title {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.chatgpt-sidebar.is-rail .chatgpt-sidebar__action {
  padding-inline-end: 0;
}

.chatgpt-sidebar.is-rail .chatgpt-sidebar__recent {
  max-height: 0;
  margin-top: 0;
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
}

.chatgpt-sidebar.is-drawer .chatgpt-sidebar__stage {
  width: 100%;
}

.chatgpt-sidebar.is-drawer .chatgpt-sidebar__new-chat-button {
  width: calc(100% - 8px);
}
</style>
