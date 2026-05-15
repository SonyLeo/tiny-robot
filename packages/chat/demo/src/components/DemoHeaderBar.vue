<script setup lang="ts">
import {
  IconCollapseLeft,
  IconCollapseRight,
  IconMenuCollapse,
  IconMenuExpand,
  IconMore,
  IconNewSession,
} from '@opentiny/tiny-robot-svgs'
import { Chat } from '@/index'
</script>

<template>
  <Chat.Header>
    <div class="demo-header">
      <div class="demo-header__left">
        <Chat.LeftSidebarToggle
          class="demo-icon-button demo-header__mobile-toggle"
          aria-label="切换左侧面板"
          v-slot="{ expanded, isMobile }"
        >
          <component
            :is="
              isMobile
                ? expanded
                  ? IconMenuCollapse
                  : IconMenuExpand
                : expanded
                  ? IconCollapseLeft
                  : IconCollapseRight
            "
            class="demo-icon-glyph"
          />
        </Chat.LeftSidebarToggle>

        <div class="demo-header__title">
          <strong>TrChat</strong>
        </div>
      </div>

      <div class="demo-header__actions">
        <button class="demo-icon-button" type="button" aria-label="新建会话">
          <IconNewSession class="demo-icon-glyph" />
        </button>

        <Chat.RightPanelToggle class="demo-icon-button" aria-label="打开扩展工作区">
          <IconMore class="demo-icon-glyph" />
        </Chat.RightPanelToggle>
      </div>
    </div>
  </Chat.Header>
</template>

<style scoped>
.demo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.demo-header__left,
.demo-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.demo-header__title {
  min-width: 0;
}

.demo-header__title strong {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (min-width: 960px) {
  .demo-header__mobile-toggle {
    display: none;
  }
}

@media (max-width: 959px) {
  .demo-header {
    position: relative;
    gap: 12px;
  }

  .demo-header__title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    pointer-events: none;
  }
}
</style>
