<script setup lang="ts">
import { chatGptAssistantActions } from '../data'
</script>

<template>
  <div class="chatgpt-main">
    <div class="chatgpt-main__bubble-row">
      <div class="chatgpt-main__user-bubble">hello</div>
    </div>

    <section class="chatgpt-main__assistant">
      <h2>Hello!</h2>

      <div class="chatgpt-main__assistant-actions">
        <button
          v-for="(Icon, index) in chatGptAssistantActions"
          :key="index"
          class="chatgpt-main__assistant-action"
          type="button"
        >
          <component :is="Icon" class="chatgpt-main__icon" />
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.chatgpt-main {
  min-height: 100%;
  display: grid;
  align-content: start;
  gap: 48px;
  padding: 14px var(--tr-chat-layout-main-padding-inline, var(--tr-chat-layout-inner-padding-inline)) 0;
  box-sizing: border-box;
}

.chatgpt-main__bubble-row {
  display: flex;
  justify-content: flex-end;
}

.chatgpt-main__user-bubble {
  display: inline-flex;
  align-items: center;
  min-height: 42px;
  padding: 0 18px;
  border-radius: 999px;
  background: #f1efed;
  color: #171717;
}

.chatgpt-main__assistant {
  width: min(100%, 760px);
  padding-top: 18px;
}

.chatgpt-main__assistant h2 {
  margin: 0;
  font-size: 34px;
  font-weight: 500;
  color: #171717;
}

.chatgpt-main__assistant-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 18px;
}

.chatgpt-main__assistant-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #6e6e69;
}

.chatgpt-main__icon {
  font-size: 18px;
}
</style>
