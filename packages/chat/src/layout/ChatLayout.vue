<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { computed, toRef, useSlots } from 'vue'
import { provideChatLayoutConfig, useChatLayoutStoreContext } from '@/context/layoutContext'
import {
  DEFAULT_CONTENT_MAX_WIDTH,
  DEFAULT_LEFT_SIDEBAR_WIDTH,
  DEFAULT_LEFT_RAIL_WIDTH,
  DEFAULT_MOBILE_LEFT_SIDEBAR_WIDTH,
  DEFAULT_MOBILE_RIGHT_PANEL_WIDTH,
  DEFAULT_MOBILE_LEFT_SIDEBAR_ARIA_LABEL,
  DEFAULT_MOBILE_RIGHT_PANEL_ARIA_LABEL,
  DEFAULT_OVERLAY_BACKDROP_ARIA_LABEL,
  DEFAULT_RIGHT_PANEL_WIDTH,
  DEFAULT_TRANSITION_DURATION,
} from '@/shared/constants'
import { clampNonNegative, hasSlotContent, toCssLength } from '@/shared/utils'
import type { ChatLayoutProps } from '@/types/layout'

defineOptions({
  name: 'ChatLayout',
})

const props = withDefaults(defineProps<ChatLayoutProps>(), {
  leftSidebarWidth: DEFAULT_LEFT_SIDEBAR_WIDTH,
  leftRailWidth: DEFAULT_LEFT_RAIL_WIDTH,
  rightPanelWidth: DEFAULT_RIGHT_PANEL_WIDTH,
  mobileLeftSidebarWidth: DEFAULT_MOBILE_LEFT_SIDEBAR_WIDTH,
  mobileRightPanelWidth: DEFAULT_MOBILE_RIGHT_PANEL_WIDTH,
  contentMaxWidth: DEFAULT_CONTENT_MAX_WIDTH,
  transitionDuration: DEFAULT_TRANSITION_DURATION,
  overlayBackdropAriaLabel: DEFAULT_OVERLAY_BACKDROP_ARIA_LABEL,
  mobileLeftSidebarAriaLabel: DEFAULT_MOBILE_LEFT_SIDEBAR_ARIA_LABEL,
  mobileRightPanelAriaLabel: DEFAULT_MOBILE_RIGHT_PANEL_ARIA_LABEL,
})

const slots = useSlots()
const { closeOverlayPanels, isMobile, leftDrawerOpen, leftSidebarOpen, rightPanelOpen } = useChatLayoutStoreContext()

const leftRailWidth = computed(() => clampNonNegative(props.leftRailWidth))
provideChatLayoutConfig({
  leftRailWidth,
})

const hasLeftSidebar = computed(() => hasSlotContent(slots['left-sidebar']))
const hasHeader = computed(() => hasSlotContent(slots.header))
const hasMain = computed(() => hasSlotContent(slots.main))
const hasFooter = computed(() => hasSlotContent(slots.footer))
const hasRightPanel = computed(() => hasSlotContent(slots['right-panel']))

const desktopLeftWidth = computed(() => {
  if (isMobile.value || !hasLeftSidebar.value) {
    return '0px'
  }

  return leftSidebarOpen.value
    ? toCssLength(clampNonNegative(props.leftSidebarWidth))
    : toCssLength(leftRailWidth.value)
})

const desktopRightWidth = computed(() => {
  if (isMobile.value || !hasRightPanel.value || !rightPanelOpen.value) {
    return '0px'
  }

  return toCssLength(clampNonNegative(props.rightPanelWidth))
})

const contentMaxWidth = computed(() => toCssLength(props.contentMaxWidth))
const mobileLeftSidebarWidth = computed(() => toCssLength(props.mobileLeftSidebarWidth))
const mobileRightPanelWidth = computed(() => toCssLength(props.mobileRightPanelWidth))
const transitionDuration = toRef(props, 'transitionDuration')

const shouldRenderDesktopLeftSidebar = computed(
  () => !isMobile.value && hasLeftSidebar.value && (leftSidebarOpen.value || leftRailWidth.value > 0),
)
const shouldRenderDesktopRightShell = computed(() => !isMobile.value && hasRightPanel.value)
const shouldRenderDesktopRightPanel = computed(() => shouldRenderDesktopRightShell.value && rightPanelOpen.value)
const shouldRenderMobileLeftSidebar = computed(() => isMobile.value && hasLeftSidebar.value && leftDrawerOpen.value)
const shouldRenderMobileRightPanel = computed(() => isMobile.value && hasRightPanel.value && rightPanelOpen.value)
const shouldRenderOverlayBackdrop = computed(
  () => shouldRenderMobileLeftSidebar.value || shouldRenderMobileRightPanel.value,
)

const cssVars = computed(() => ({
  '--tr-chat-layout-left-width': desktopLeftWidth.value,
  '--tr-chat-layout-right-width': desktopRightWidth.value,
  '--tr-chat-layout-content-max-width': contentMaxWidth.value,
  '--tr-chat-layout-transition-duration': transitionDuration.value,
  '--tr-chat-layout-mobile-left-width': mobileLeftSidebarWidth.value,
  '--tr-chat-layout-mobile-right-width': mobileRightPanelWidth.value,
}))

const keyboardTarget = typeof window === 'undefined' ? undefined : window

useEventListener(keyboardTarget, 'keydown', (event: KeyboardEvent) => {
  if (event.defaultPrevented || event.key !== 'Escape' || !shouldRenderOverlayBackdrop.value) {
    return
  }

  closeOverlayPanels()
})
</script>

<template>
  <div class="tr-chat-layout" :class="{ 'tr-chat-layout--mobile': isMobile }" :style="cssVars">
    <div v-if="shouldRenderDesktopLeftSidebar" class="tr-chat-layout__left-shell">
      <slot name="left-sidebar" />
    </div>

    <div v-if="hasHeader" class="tr-chat-layout__header-shell">
      <div class="tr-chat-layout__header-inner">
        <slot name="header" />
      </div>
    </div>

    <div class="tr-chat-layout__main-shell">
      <div class="tr-chat-layout__main-inner">
        <slot v-if="hasMain" name="main" />
      </div>
    </div>

    <div v-if="hasFooter" class="tr-chat-layout__footer-shell">
      <div class="tr-chat-layout__footer-inner">
        <slot name="footer" />
      </div>
    </div>

    <div
      v-if="shouldRenderDesktopRightShell"
      class="tr-chat-layout__right-shell"
      :class="{ 'tr-chat-layout__right-shell--closed': !rightPanelOpen }"
    >
      <slot v-if="shouldRenderDesktopRightPanel" name="right-panel" />
    </div>

    <Transition name="tr-chat-backdrop">
      <button
        v-if="shouldRenderOverlayBackdrop"
        class="tr-chat-layout__backdrop"
        type="button"
        :aria-label="props.overlayBackdropAriaLabel"
        @click="closeOverlayPanels"
      />
    </Transition>

    <Transition name="tr-chat-mobile-panel-left">
      <div
        v-if="shouldRenderMobileLeftSidebar"
        class="tr-chat-layout__mobile-panel tr-chat-layout__mobile-panel--left"
        role="dialog"
        aria-modal="true"
        :aria-label="props.mobileLeftSidebarAriaLabel"
      >
        <div class="tr-chat-layout__mobile-panel-surface" :style="{ width: mobileLeftSidebarWidth }">
          <slot name="left-sidebar" />
        </div>
      </div>
    </Transition>

    <Transition name="tr-chat-mobile-panel-right">
      <div
        v-if="shouldRenderMobileRightPanel"
        class="tr-chat-layout__mobile-panel tr-chat-layout__mobile-panel--right"
        role="dialog"
        aria-modal="true"
        :aria-label="props.mobileRightPanelAriaLabel"
      >
        <div class="tr-chat-layout__mobile-panel-surface" :style="{ width: mobileRightPanelWidth }">
          <slot name="right-panel" />
        </div>
      </div>
    </Transition>
  </div>
</template>
