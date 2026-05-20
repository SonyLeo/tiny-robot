<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { computed, useSlots } from 'vue'
import { createChatLayoutStore } from '@/composables/createChatLayoutStore'
import { provideChatLayoutStore } from '@/composables/useChatLayout'
import type { ChatAsideConfig, ChatLayoutProps } from '@/types/layout'
import type { ChatLayoutSlots } from '@/types/layout.internal'

defineOptions({
  name: 'ChatLayout',
})

const props = defineProps<ChatLayoutProps>()

defineSlots<ChatLayoutSlots>()

const leftAsideState = defineModel<ChatAsideConfig>('leftAside')
const rightAsideState = defineModel<ChatAsideConfig>('rightAside')
const emptyAsideConfig: ChatAsideConfig = {}
const leftAsideConfig = computed(() => leftAsideState.value ?? emptyAsideConfig)
const rightAsideConfig = computed(() => rightAsideState.value ?? emptyAsideConfig)

function updateLeftAside(nextConfig: ChatAsideConfig): void {
  leftAsideState.value = nextConfig
}

function updateRightAside(nextConfig: ChatAsideConfig): void {
  rightAsideState.value = nextConfig
}

const layoutStore = createChatLayoutStore({
  asideLayoutMode: computed(() => props.asideLayoutMode),
  left: {
    layoutMode: computed(() => leftAsideConfig.value.layoutMode),
    expanded: computed(() => leftAsideConfig.value.expanded),
    closedMode: computed(() => leftAsideConfig.value.closedMode),
    expandedWidth: computed(() => leftAsideConfig.value.expandedWidth),
    collapsedWidth: computed(() => leftAsideConfig.value.collapsedWidth),
    onUpdate: updateLeftAside,
  },
  right: {
    layoutMode: computed(() => rightAsideConfig.value.layoutMode),
    expanded: computed(() => rightAsideConfig.value.expanded),
    closedMode: computed(() => rightAsideConfig.value.closedMode),
    expandedWidth: computed(() => rightAsideConfig.value.expandedWidth),
    collapsedWidth: computed(() => rightAsideConfig.value.collapsedWidth),
    onUpdate: updateRightAside,
  },
})

provideChatLayoutStore(layoutStore)

const slots = useSlots()
const { closeDrawers, left, right } = layoutStore
const isDrawerVisible = computed(() => layoutStore.isDrawerVisible)

const hasLeftSidebar = computed(() => Boolean(slots['left-aside']))
const hasHeader = computed(() => Boolean(slots.header))
const hasMain = computed(() => Boolean(slots.main))
const hasFooter = computed(() => Boolean(slots.footer))
const hasRightPanel = computed(() => Boolean(slots['right-aside']))
const leftAsideHidden = computed(() => !hasLeftSidebar.value || left.isHidden)
const rightAsideHidden = computed(() => !hasRightPanel.value || right.isHidden)

const layoutStyle = computed(() => ({
  '--tr-chat-layout-left-expanded-width': left.expandedWidth,
  '--tr-chat-layout-left-collapsed-width': left.collapsedWidth,
  '--tr-chat-layout-right-expanded-width': right.expandedWidth,
  '--tr-chat-layout-right-collapsed-width': right.collapsedWidth,
}))

const layoutClass = computed(() => ({
  'tr-chat-layout--left-dock': hasLeftSidebar.value && left.isDock,
  'tr-chat-layout--left-drawer': hasLeftSidebar.value && left.isDrawer,
  'tr-chat-layout--left-expanded': hasLeftSidebar.value && left.isExpanded,
  'tr-chat-layout--left-rail': hasLeftSidebar.value && left.isRail,
  'tr-chat-layout--right-dock': hasRightPanel.value && right.isDock,
  'tr-chat-layout--right-drawer': hasRightPanel.value && right.isDrawer,
  'tr-chat-layout--right-expanded': hasRightPanel.value && right.isExpanded,
  'tr-chat-layout--right-rail': hasRightPanel.value && right.isRail,
  'tr-chat-layout--drawer-visible': isDrawerVisible,
}))

const leftAsideClass = computed(() => ({
  'tr-chat-layout__aside--active': hasLeftSidebar.value,
  'tr-chat-layout__aside--dock': left.isDock,
  'tr-chat-layout__aside--drawer': left.isDrawer,
  'tr-chat-layout__aside--expanded': left.isExpanded,
  'tr-chat-layout__aside--rail': left.isRail,
  'tr-chat-layout__aside--hidden': left.isHidden,
}))

const rightAsideClass = computed(() => ({
  'tr-chat-layout__aside--active': hasRightPanel.value,
  'tr-chat-layout__aside--dock': right.isDock,
  'tr-chat-layout__aside--drawer': right.isDrawer,
  'tr-chat-layout__aside--expanded': right.isExpanded,
  'tr-chat-layout__aside--rail': right.isRail,
  'tr-chat-layout__aside--hidden': right.isHidden,
}))

const keyboardTarget = typeof window === 'undefined' ? undefined : window

useEventListener(keyboardTarget, 'keydown', (event: KeyboardEvent) => {
  if (event.defaultPrevented || event.key !== 'Escape' || !isDrawerVisible.value) {
    return
  }

  closeDrawers()
})
</script>

<template>
  <div class="tr-chat-layout" :style="layoutStyle" :class="layoutClass">
    <div
      class="tr-chat-layout__aside tr-chat-layout__aside--left"
      :class="leftAsideClass"
      :aria-hidden="leftAsideHidden ? 'true' : undefined"
      :inert="leftAsideHidden"
    >
      <slot name="left-aside" />
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
      :class="rightAsideClass"
      :aria-hidden="rightAsideHidden ? 'true' : undefined"
      :inert="rightAsideHidden"
    >
      <slot name="right-aside" />
    </div>

    <button
      class="tr-chat-layout__backdrop"
      :class="{ 'tr-chat-layout__backdrop--active': isDrawerVisible }"
      type="button"
      :tabindex="isDrawerVisible ? 0 : -1"
      :aria-hidden="isDrawerVisible ? undefined : 'true'"
      @click="closeDrawers"
    />
  </div>
</template>
