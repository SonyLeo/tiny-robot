<script setup lang="ts">
import { Chat } from '@/index'
import { useChatAside } from '@/composables/useChatAside'
import { IconFileFolder, IconMenuExpand, IconShare } from '@opentiny/tiny-robot-svgs'

const { isMobile } = useChatAside('left')
</script>

<template>
  <div class="chatgpt-header">
    <div v-if="isMobile" class="chatgpt-header__left">
      <Chat.AsideToggle side="left" class="chatgpt-header__icon-button">
        <IconMenuExpand class="chatgpt-header__icon" />
      </Chat.AsideToggle>
    </div>

    <div class="chatgpt-header__right">
      <button class="chatgpt-header__share" type="button">
        <IconShare class="chatgpt-header__icon" />
        <span>分享</span>
      </button>

      <Chat.AsideToggle side="right" class="chatgpt-header__icon-button">
        <IconFileFolder class="chatgpt-header__icon" />
      </Chat.AsideToggle>
    </div>
  </div>
</template>

<style scoped>
.chatgpt-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 52px;
  gap: 12px;
}

.chatgpt-header__left,
.chatgpt-header__right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chatgpt-header__icon-button {
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

.chatgpt-header__share {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 10px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #171717;
  font-size: 14px;
}

.chatgpt-header__icon {
  font-size: 18px;
}

@media (max-width: 959px) {
  .chatgpt-header {
    justify-content: space-between;
  }
}
</style>
