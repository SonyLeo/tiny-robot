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
    <Chat.Topbar title="TrChat">
      <template #leading>
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
      </template>

      <template #actions>
        <div class="demo-header__actions">
          <button class="demo-icon-button" type="button" aria-label="新建会话">
            <IconNewSession class="demo-icon-glyph" />
          </button>

          <Chat.RightPanelToggle class="demo-icon-button" aria-label="打开扩展工作区">
            <IconMore class="demo-icon-glyph" />
          </Chat.RightPanelToggle>
        </div>
      </template>
    </Chat.Topbar>
  </Chat.Header>
</template>

<style scoped>
.demo-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (min-width: 960px) {
  .demo-header__mobile-toggle {
    display: none;
  }
}
</style>
