<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { computed, useSlots } from 'vue'
import { createChatLayoutStore } from '@/composables/createChatLayoutStore'
import { provideChatLayoutStore } from '@/composables/useChatLayout'
import type { ChatLayoutProps } from '@/types/layout'
import type { ChatLayoutSlots } from '@/types/layout.internal'

defineOptions({
  name: 'ChatLayout',
})

const props = withDefaults(defineProps<ChatLayoutProps>(), {
  mobileBreakpoint: 959,
})

defineSlots<ChatLayoutSlots>()

const layoutStore = createChatLayoutStore({
  mobileBreakpoint: computed(() => props.mobileBreakpoint),
  left: {
    defaultState: computed(() => props.left?.defaultState ?? 'expanded'),
    restingState: computed(() => props.left?.restingState),
  },
  right: {
    defaultState: computed(() => props.right?.defaultState ?? 'hidden'),
    restingState: computed(() => props.right?.restingState),
  },
})

provideChatLayoutStore(layoutStore)

const slots = useSlots()
const { closeOverlays, left, right, isMobile } = layoutStore

const overlayBackdropAriaLabel = computed(() => props.a11y?.backdropLabel ?? '关闭面板')
const mobileLeftSidebarAriaLabel = computed(() => props.a11y?.leftPanelLabel ?? '左侧面板')
const mobileRightPanelAriaLabel = computed(() => props.a11y?.rightPanelLabel ?? '右侧面板')

const hasLeftSidebar = computed(() => Boolean(slots['left-sidebar']))
const hasHeader = computed(() => Boolean(slots.header))
const hasMain = computed(() => Boolean(slots.main))
const hasFooter = computed(() => Boolean(slots.footer))
const hasRightPanel = computed(() => Boolean(slots['right-panel']))

const leftState = computed(() => left.state.value)
const rightState = computed(() => right.state.value)

const leftDesktopHidden = computed(() => !isMobile.value && leftState.value === 'hidden')
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
      'tr-chat-layout--left-expanded': !isMobile && hasLeftSidebar && leftState === 'expanded',
      'tr-chat-layout--left-collapsed': !isMobile && hasLeftSidebar && leftState === 'collapsed',
      'tr-chat-layout--right-expanded': !isMobile && hasRightPanel && rightState === 'expanded',
      'tr-chat-layout--right-collapsed': !isMobile && hasRightPanel && rightState === 'collapsed',
    }"
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
      :aria-label="isMobile ? mobileLeftSidebarAriaLabel : undefined"
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
      :aria-label="isMobile ? mobileRightPanelAriaLabel : undefined"
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
      :aria-label="overlayBackdropAriaLabel"
      @click="closeOverlays"
    />
  </div>
</template>
