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
    <div
      class="demo-sidebar-fixed-area__state demo-sidebar-fixed-area__state--open"
      :class="{ 'is-hidden': collapsed }"
    >
      <div class="demo-sidebar-fixed-area__header-row">
        <DemoSidebarBrand class="demo-sidebar-fixed-area__brand" :collapsed="false" />

        <Chat.AsideToggle
          side="left"
          v-if="showToggle"
          class="demo-icon-button demo-sidebar-fixed-area__toggle"
          aria-label="切换左侧面板"
          :aria-hidden="collapsed"
          :tabindex="collapsed ? -1 : 0"
          v-slot="{ isOpen }"
        >
          <component
            :is="
              isMobile ? (isOpen ? IconMenuCollapse : IconMenuExpand) : isOpen ? IconCollapseRight : IconCollapseLeft
            "
            class="demo-icon-glyph"
          />
        </Chat.AsideToggle>
      </div>

      <button
        class="demo-sidebar-fixed-area__primary-open"
        type="button"
        :aria-hidden="collapsed"
        :tabindex="collapsed ? -1 : 0"
      >
        <IconNewSession class="demo-sidebar-fixed-area__icon" />
        <span>新建会话</span>
      </button>
    </div>

    <div
      class="demo-sidebar-fixed-area__state demo-sidebar-fixed-area__state--rail"
      :class="{ 'is-hidden': !collapsed }"
    >
      <DemoSidebarBrand class="demo-sidebar-fixed-area__brand demo-sidebar-fixed-area__brand--rail" :collapsed="true" />

      <Chat.AsideToggle
        side="left"
        v-if="showToggle"
        class="demo-icon-button demo-sidebar-fixed-area__toggle-rail"
        aria-label="切换左侧面板"
        :aria-hidden="!collapsed"
        :tabindex="collapsed ? 0 : -1"
        v-slot="{ isOpen }"
      >
        <component
          :is="isMobile ? (isOpen ? IconMenuCollapse : IconMenuExpand) : isOpen ? IconCollapseRight : IconCollapseLeft"
          class="demo-icon-glyph"
        />
      </Chat.AsideToggle>

      <button
        class="demo-icon-button demo-sidebar-fixed-area__primary-rail"
        type="button"
        aria-label="新建会话"
        title="新建会话"
        :aria-hidden="!collapsed"
        :tabindex="collapsed ? 0 : -1"
      >
        <IconNewSession class="demo-sidebar-fixed-area__icon" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.demo-sidebar-fixed-area {
  position: relative;
  width: 100%;
  min-height: 94px;
  transition: min-height 220ms cubic-bezier(0.2, 0, 0, 1);
}

.demo-sidebar-fixed-area--collapsed {
  min-height: 126px;
}

.demo-sidebar-fixed-area--collapsed .demo-sidebar-fixed-area__state--open {
  position: absolute;
  inset: 0;
}

.demo-sidebar-fixed-area__state {
  display: grid;
  gap: 12px;
  align-content: start;
  transition:
    opacity 160ms ease,
    transform 220ms cubic-bezier(0.2, 0, 0, 1);
}

.demo-sidebar-fixed-area__state.is-hidden {
  opacity: 0;
  pointer-events: none;
}

.demo-sidebar-fixed-area__state--open.is-hidden {
  transform: translateX(-8px);
}

.demo-sidebar-fixed-area__state--rail {
  position: absolute;
  inset: 0;
  justify-items: center;
}

.demo-sidebar-fixed-area__state--rail.is-hidden {
  transform: translateY(-6px) scale(0.98);
}

.demo-sidebar-fixed-area__header-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
}

.demo-sidebar-fixed-area__brand {
  min-width: 0;
}

.demo-sidebar-fixed-area__brand--rail {
  width: 36px;
  min-width: 36px;
  justify-self: center;
}

.demo-sidebar-fixed-area__toggle-rail,
.demo-sidebar-fixed-area__primary-rail {
  justify-self: center;
}

.demo-sidebar-fixed-area__primary-open {
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
    border-color 200ms ease,
    background-color 200ms ease;
}

.demo-sidebar-fixed-area__primary-open:hover {
  background: #f8fbff;
  border-color: #c7d7f7;
}

.demo-sidebar-fixed-area__primary-rail {
  width: 36px;
  min-width: 36px;
  height: 36px;
  min-height: 36px;
}

.demo-sidebar-fixed-area__icon {
  flex: none;
  font-size: 16px;
}
</style>
