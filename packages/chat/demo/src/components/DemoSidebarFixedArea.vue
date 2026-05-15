<script setup lang="ts">
import {
  IconCollapseLeft,
  IconCollapseRight,
  IconMenuCollapse,
  IconMenuExpand,
  IconNewSession,
} from '@opentiny/tiny-robot-svgs'
import { Chat } from '@/index'
import DemoSidebarBrand from './DemoSidebarBrand.vue'

defineProps<{
  collapsed: boolean
  isMobile: boolean
  showToggle: boolean
}>()
</script>

<template>
  <div class="demo-sidebar-fixed-area" :class="{ 'demo-sidebar-fixed-area--collapsed': collapsed }">
    <DemoSidebarBrand class="demo-sidebar-fixed-area__brand" :collapsed="collapsed" />

    <Chat.LeftSidebarToggle
      v-if="showToggle"
      class="demo-icon-button demo-sidebar-fixed-area__toggle"
      aria-label="切换左侧面板"
      v-slot="{ expanded }"
    >
      <component
        :is="
          isMobile ? (expanded ? IconMenuCollapse : IconMenuExpand) : expanded ? IconCollapseRight : IconCollapseLeft
        "
        class="demo-icon-glyph"
      />
    </Chat.LeftSidebarToggle>

    <button
      class="demo-sidebar-fixed-area__primary"
      :class="{
        'demo-icon-button': collapsed,
        'demo-sidebar-fixed-area__primary--collapsed': collapsed,
      }"
      type="button"
      :aria-label="collapsed ? '新建会话' : undefined"
      :title="collapsed ? '新建会话' : undefined"
    >
      <IconNewSession class="demo-sidebar-fixed-area__icon" />
      <span class="demo-sidebar-fixed-area__label" :class="{ 'demo-sidebar-fixed-area__label--hidden': collapsed }">
        新建会话
      </span>
    </button>
  </div>
</template>

<style scoped>
.demo-sidebar-fixed-area {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas:
    'brand toggle'
    'primary primary';
  align-items: center;
  gap: 16px 12px;
}

.demo-sidebar-fixed-area--collapsed {
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    'brand'
    'toggle'
    'primary';
  justify-items: center;
}

.demo-sidebar-fixed-area__brand {
  grid-area: brand;
  width: 100%;
}

.demo-sidebar-fixed-area__toggle {
  grid-area: toggle;
}

.demo-sidebar-fixed-area__primary {
  grid-area: primary;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid #dbe1ea;
  border-radius: 999px;
  background: #ffffff;
  color: #111827;
  cursor: pointer;
  transition:
    width 200ms ease,
    min-height 200ms ease,
    padding 200ms ease,
    border-color 200ms ease,
    background-color 200ms ease;
}

.demo-sidebar-fixed-area__primary--collapsed {
  width: 36px;
  min-width: 36px;
  min-height: 36px;
  gap: 0;
  padding: 0;
  border-color: transparent;
  border-radius: 12px;
  background: transparent;
}

.demo-sidebar-fixed-area__icon {
  flex: none;
  font-size: 16px;
}

.demo-sidebar-fixed-area__label {
  overflow: hidden;
  white-space: nowrap;
  max-width: 120px;
  opacity: 1;
  transition:
    max-width 200ms ease,
    opacity 200ms ease;
}

.demo-sidebar-fixed-area__label--hidden {
  max-width: 0;
  opacity: 0;
}
</style>
