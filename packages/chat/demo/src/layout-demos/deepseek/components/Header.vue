<script setup lang="ts">
import { Chat } from '@/index'
import { IconMenuExpand, IconNewSession } from '@opentiny/tiny-robot-svgs'
</script>

<template>
  <div class="deepseek-header">
    <Chat.AsideToggle placement="left" class="deepseek-header__menu-button" aria-label="Open sidebar">
      <IconMenuExpand class="deepseek-header__icon" />
    </Chat.AsideToggle>

    <div class="deepseek-header__title">
      <h1>How to say protagonist</h1>
      <p>
        <span class="deepseek-header__spark">✦</span>
        Quick mode
      </p>
    </div>

    <div class="deepseek-header__right-actions">
      <Chat.AsideToggle placement="right" class="deepseek-header__action-button" aria-label="Open right panel">
        <IconNewSession class="deepseek-header__icon" />
      </Chat.AsideToggle>
    </div>
  </div>
</template>

<style scoped>
.deepseek-header {
  position: relative;
  min-height: 74px;
  padding: 10px 0;
}

.deepseek-header__menu-button,
.deepseek-header__action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #dbe3f0;
  border-radius: 999px;
  background: #ffffff;
  color: #64748b;
}

.deepseek-header__menu-button {
  display: none;
}

.deepseek-header__title {
  width: min(100%, 760px);
  margin: 0 auto;
}

.deepseek-header__title h1,
.deepseek-header__title p {
  margin: 0;
}

.deepseek-header__title h1 {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #0f172a;
}

.deepseek-header__title p {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  font-size: 13px;
  color: #64748b;
}

.deepseek-header__spark {
  color: #4f67ff;
}

.deepseek-header__right-actions {
  position: absolute;
  top: 0;
  right: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.deepseek-header__icon {
  font-size: 16px;
}

@media (max-width: 959px) {
  .deepseek-header {
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr) 36px;
    align-items: start;
    column-gap: 12px;
    min-height: 64px;
  }

  .deepseek-header__menu-button {
    position: static;
    display: inline-flex;
  }

  .deepseek-header__title {
    width: auto;
    min-width: 0;
    padding-inline: 0;
    text-align: left;
  }

  .deepseek-header__title h1 {
    font-size: 17px;
    line-height: 1.3;
  }

  .deepseek-header__title p {
    font-size: 12px;
  }

  .deepseek-header__menu-button,
  .deepseek-header__action-button {
    width: 36px;
    height: 36px;
  }

  .deepseek-header__right-actions {
    position: static;
    justify-self: end;
    gap: 6px;
  }
}
</style>
