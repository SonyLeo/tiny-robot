<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { computed, useSlots } from 'vue'
import { useChatLayoutStoreContext } from '@/context/layoutContext'
import {
  DEFAULT_CONTENT_MAX_WIDTH,
  DEFAULT_LEFT_RAIL_WIDTH,
  DEFAULT_LEFT_SIDEBAR_WIDTH,
  DEFAULT_MOBILE_LEFT_SIDEBAR_ARIA_LABEL,
  DEFAULT_MOBILE_LEFT_SIDEBAR_WIDTH,
  DEFAULT_MOBILE_RIGHT_PANEL_ARIA_LABEL,
  DEFAULT_MOBILE_RIGHT_PANEL_WIDTH,
  DEFAULT_OVERLAY_BACKDROP_ARIA_LABEL,
  DEFAULT_RIGHT_PANEL_WIDTH,
} from '@/shared/constants'
import { clampNonNegative, toCssLength } from '@/shared/utils'
import type { ChatLayoutProps, ChatLayoutSlots } from '@/types/layout'

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
  overlayBackdropAriaLabel: DEFAULT_OVERLAY_BACKDROP_ARIA_LABEL,
  mobileLeftSidebarAriaLabel: DEFAULT_MOBILE_LEFT_SIDEBAR_ARIA_LABEL,
  mobileRightPanelAriaLabel: DEFAULT_MOBILE_RIGHT_PANEL_ARIA_LABEL,
})

defineSlots<ChatLayoutSlots>()

const slots = useSlots()
const store = useChatLayoutStoreContext()
const { closeOverlays, left, right, viewport } = store
const { isMobile } = viewport

const hasLeftSidebar = computed(() => Boolean(slots['left-sidebar']))
const hasHeader = computed(() => Boolean(slots.header))
const hasMain = computed(() => Boolean(slots.main))
const hasFooter = computed(() => Boolean(slots.footer))
const hasRightPanel = computed(() => Boolean(slots['right-panel']))

const leftSidebarWidthValue = computed(() => clampNonNegative(props.leftSidebarWidth))
const leftRailWidthValue = computed(() => clampNonNegative(props.leftRailWidth))
const rightPanelWidthValue = computed(() => clampNonNegative(props.rightPanelWidth))
const leftState = computed(() => left.state.value)
const rightState = computed(() => right.state.value)

const leftDesktopWidth = computed(() => {
  if (!hasLeftSidebar.value || isMobile.value) {
    return '0px'
  }

  return toCssLength(leftState.value === 'expanded' ? leftSidebarWidthValue.value : leftRailWidthValue.value)
})

const rightDesktopWidth = computed(() => {
  if (!hasRightPanel.value || isMobile.value) {
    return '0px'
  }

  return toCssLength(rightState.value === 'expanded' ? rightPanelWidthValue.value : 0)
})

const leftDesktopHidden = computed(
  () => !isMobile.value && leftState.value === 'collapsed' && leftRailWidthValue.value === 0,
)
const rightDesktopHidden = computed(() => !isMobile.value && rightState.value === 'hidden')

const mobileLeftOpen = computed(() => isMobile.value && hasLeftSidebar.value && leftState.value === 'overlay')
const mobileRightOpen = computed(() => isMobile.value && hasRightPanel.value && rightState.value === 'overlay')
const overlayVisible = computed(() => mobileLeftOpen.value || mobileRightOpen.value)
const leftAsideHidden = computed(
  () => !hasLeftSidebar.value || leftDesktopHidden.value || (isMobile.value && !mobileLeftOpen.value),
)
const rightAsideHidden = computed(
  () => !hasRightPanel.value || rightDesktopHidden.value || (isMobile.value && !mobileRightOpen.value),
)

const cssVars = computed(() => ({
  '--tr-chat-layout-left-width': leftDesktopWidth.value,
  '--tr-chat-layout-right-width': rightDesktopWidth.value,
  '--tr-chat-layout-content-max-width': toCssLength(props.contentMaxWidth),
  '--tr-chat-layout-mobile-left-width': toCssLength(props.mobileLeftSidebarWidth),
  '--tr-chat-layout-mobile-right-width': toCssLength(props.mobileRightPanelWidth),
}))

const keyboardTarget = typeof window === 'undefined' ? undefined : window

useEventListener(keyboardTarget, 'keydown', (event: KeyboardEvent) => {
  if (event.defaultPrevented || event.key !== 'Escape' || !overlayVisible.value) {
    return
  }

  closeOverlays()
})
</script>

<template>
  <div
    class="tr-chat-layout"
    :class="{
      'tr-chat-layout--mobile': isMobile,
      'tr-chat-layout--backdrop-visible': overlayVisible,
    }"
    :style="cssVars"
  >
    <div
      class="tr-chat-layout__aside tr-chat-layout__aside--left"
      :class="{
        'tr-chat-layout__aside--active': hasLeftSidebar,
        'tr-chat-layout__aside--desktop-hidden': leftDesktopHidden,
        'tr-chat-layout__aside--mobile-open': mobileLeftOpen,
      }"
      :role="mobileLeftOpen ? 'dialog' : undefined"
      :aria-modal="mobileLeftOpen ? 'true' : undefined"
      :aria-hidden="leftAsideHidden ? 'true' : undefined"
      :aria-label="isMobile ? props.mobileLeftSidebarAriaLabel : undefined"
      :inert="leftAsideHidden"
    >
      <slot name="left-sidebar" />
    </div>

    <div
      class="tr-chat-layout__header-shell"
      :class="{ 'tr-chat-layout__header-shell--active': hasHeader }"
      :aria-hidden="hasHeader ? undefined : 'true'"
    >
      <div class="tr-chat-layout__header-inner">
        <slot name="header" />
      </div>
    </div>

    <div class="tr-chat-layout__main-shell" :aria-hidden="hasMain ? undefined : 'true'">
      <div class="tr-chat-layout__main-inner">
        <slot name="main" />
      </div>
    </div>

    <div
      class="tr-chat-layout__footer-shell"
      :class="{ 'tr-chat-layout__footer-shell--active': hasFooter }"
      :aria-hidden="hasFooter ? undefined : 'true'"
    >
      <div class="tr-chat-layout__footer-inner">
        <slot name="footer" />
      </div>
    </div>

    <div
      class="tr-chat-layout__aside tr-chat-layout__aside--right"
      :class="{
        'tr-chat-layout__aside--active': hasRightPanel,
        'tr-chat-layout__aside--desktop-hidden': rightDesktopHidden,
        'tr-chat-layout__aside--mobile-open': mobileRightOpen,
      }"
      :role="mobileRightOpen ? 'dialog' : undefined"
      :aria-modal="mobileRightOpen ? 'true' : undefined"
      :aria-hidden="rightAsideHidden ? 'true' : undefined"
      :aria-label="isMobile ? props.mobileRightPanelAriaLabel : undefined"
      :inert="rightAsideHidden"
    >
      <slot name="right-panel" />
    </div>

    <button
      class="tr-chat-layout__backdrop"
      :class="{ 'tr-chat-layout__backdrop--active': overlayVisible }"
      type="button"
      :tabindex="overlayVisible ? 0 : -1"
      :aria-hidden="overlayVisible ? undefined : 'true'"
      :aria-label="props.overlayBackdropAriaLabel"
      @click="closeOverlays"
    />
  </div>
</template>
