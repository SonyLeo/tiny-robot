<script setup lang="ts">
import { IconArrowUp, IconPlus, IconVoice } from '@opentiny/tiny-robot-svgs'
</script>

<template>
  <div class="chatgpt-composer">
    <div class="chatgpt-composer__input">
      <button class="chatgpt-composer__icon-button chatgpt-composer__icon-button--ghost" type="button">
        <IconPlus class="chatgpt-composer__icon" />
      </button>

      <span class="chatgpt-composer__placeholder">有问题，尽管问</span>

      <div class="chatgpt-composer__meta">5.4 Thinking</div>

      <button class="chatgpt-composer__icon-button chatgpt-composer__icon-button--ghost" type="button">
        <IconVoice class="chatgpt-composer__icon" />
      </button>

      <button class="chatgpt-composer__submit" type="button">
        <IconArrowUp class="chatgpt-composer__icon" />
      </button>
    </div>

    <p class="chatgpt-composer__note">ChatGPT 也可能会犯错。请核查重要信息。</p>
  </div>
</template>

<style scoped>
.chatgpt-composer {
  width: min(100%, 820px);
  margin: 0 auto;
  padding-bottom: 4px;
}

.chatgpt-composer__input {
  display: grid;
  grid-template-columns: auto 1fr auto auto auto;
  align-items: center;
  gap: 10px;
  min-height: 58px;
  padding: 0 12px;
  border: 1px solid #e4e3df;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 14px 36px rgba(23, 23, 23, 0.06);
}

.chatgpt-composer__icon-button {
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

.chatgpt-composer__icon-button--ghost {
  background: transparent;
}

.chatgpt-composer__placeholder {
  color: #70706b;
  font-size: 16px;
}

.chatgpt-composer__meta {
  color: #7e7b76;
  font-size: 14px;
}

.chatgpt-composer__submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 999px;
  background: #171717;
  color: #ffffff;
}

.chatgpt-composer__icon {
  font-size: 18px;
}

.chatgpt-composer__note {
  margin: 10px 0 0;
  color: #7a7772;
  font-size: 12px;
  text-align: center;
}

@media (max-width: 959px) {
  .chatgpt-composer__input {
    grid-template-columns: auto 1fr auto;
  }

  .chatgpt-composer__meta,
  .chatgpt-composer__input > .chatgpt-composer__icon-button--ghost:nth-last-child(2) {
    display: none;
  }
}
</style>
