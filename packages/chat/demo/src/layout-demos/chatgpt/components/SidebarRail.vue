<script setup lang="ts">
import { Chat } from '@/index'
import { IconEdit, IconMenuExpand, IconSearch, IconSparkles } from '@opentiny/tiny-robot-svgs'
</script>

<template>
  <div class="chatgpt-sidebar-rail">
    <div class="chatgpt-sidebar-rail__top">
      <Chat.AsideToggle side="left" class="chatgpt-sidebar-rail__button" aria-label="Open sidebar" title="打开边栏">
        <IconMenuExpand />
      </Chat.AsideToggle>
      <button class="chatgpt-sidebar-rail__button" type="button" title="新聊天">
        <IconEdit />
      </button>
      <button class="chatgpt-sidebar-rail__button" type="button" title="搜索聊天">
        <IconSearch />
      </button>
      <button class="chatgpt-sidebar-rail__button" type="button" title="Codex">
        <IconSparkles />
      </button>
    </div>

    <div class="chatgpt-sidebar-rail__bottom">
      <button class="chatgpt-sidebar-rail__avatar" type="button">lu</button>
    </div>
  </div>
</template>

<style scoped>
.chatgpt-sidebar-rail {
  display: grid;
  grid-template-rows: 1fr auto;
  height: 100%;
}

.chatgpt-sidebar-rail__top {
  display: grid;
  align-content: start;
  gap: 6px;
}

.chatgpt-sidebar-rail__bottom {
  align-self: end;
}

.chatgpt-sidebar-rail__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #171717;
}

.chatgpt-sidebar-rail__button :deep(svg) {
  font-size: 18px;
}

.chatgpt-sidebar-rail__button:hover {
  background: #ffffff;
}

.chatgpt-sidebar-rail__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 999px;
  background: #e8e8e4;
  color: #171717;
  font-size: 12px;
  font-weight: 700;
}
</style>
