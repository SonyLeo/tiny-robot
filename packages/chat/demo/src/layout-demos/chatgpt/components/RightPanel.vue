<script setup lang="ts">
import { Chat } from '@/index'
import { IconClose } from '@opentiny/tiny-robot-svgs'
</script>

<template>
  <Chat.Aside placement="right">
    <div class="chatgpt-right-panel">
      <div class="chatgpt-right-panel__header">
        <strong>聊天中的文件</strong>

        <Chat.AsideToggle placement="right" class="chatgpt-right-panel__icon-button" aria-label="Close files panel">
          <IconClose class="chatgpt-right-panel__icon" />
        </Chat.AsideToggle>
      </div>

      <div class="chatgpt-right-panel__empty">
        <p>尚无文件参考</p>
      </div>
    </div>
  </Chat.Aside>
</template>

<style scoped>
.chatgpt-right-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
}

.chatgpt-right-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 54px;
  padding: 0 14px;
  border-bottom: 1px solid #eceae6;
}

.chatgpt-right-panel__header strong {
  font-size: 15px;
  color: #171717;
}

.chatgpt-right-panel__empty {
  display: grid;
  align-content: start;
  padding: 22px 16px;
  color: #8d8a85;
  font-size: 14px;
  flex: 1;
}

.chatgpt-right-panel__empty p {
  margin: 0;
}

.chatgpt-right-panel__icon-button {
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

.chatgpt-right-panel__icon {
  font-size: 18px;
}
</style>
