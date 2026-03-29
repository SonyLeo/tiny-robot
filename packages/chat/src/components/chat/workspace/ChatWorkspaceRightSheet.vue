<script setup lang="ts">
import { ThemeProvider } from '@opentiny/tiny-robot'
import { Comment, Fragment, computed, getCurrentInstance, useSlots, type VNode } from 'vue'
import { CHAT_UI_KEY, useChatScaffoldContext, useRequiredInject } from '@/context'
import ChatWorkspaceRightPanel from './ChatWorkspaceRightPanel.vue'

defineOptions({ name: 'TrChatWorkspaceRightSheet' })

defineSlots<{
  default?: () => unknown
}>()

const chatUi = useRequiredInject(CHAT_UI_KEY, 'chat ui')
const scaffoldContext = useChatScaffoldContext()
const slots = useSlots()
const shouldRender = computed(() => chatUi.workspace.enabled.value && chatUi.workspace.isMobile.value)
const isOpen = computed(() => shouldRender.value && chatUi.workspace.right.visible.value)
const appearance = computed(() => scaffoldContext?.presetSlices.value.appearance.appearance)
const scopedColorMode = computed(() => {
  const mode = appearance.value?.mode

  if (mode === 'light' || mode === 'dark') {
    return mode
  }

  if (mode === 'system') {
    return 'auto'
  }

  return undefined
})

const themeScopeId = `tr-chat-right-sheet-theme-${getCurrentInstance()?.uid ?? 'fallback'}`

function flattenSlotNodes(nodes: VNode[]): VNode[] {
  const flattened: VNode[] = []

  for (const node of nodes) {
    if (node.type === Comment) {
      continue
    }

    if (node.type === Fragment && Array.isArray(node.children)) {
      flattened.push(...flattenSlotNodes(node.children as VNode[]))
      continue
    }

    flattened.push(node)
  }

  return flattened
}

function isRightPanelVNode(node: VNode) {
  if (node.type === ChatWorkspaceRightPanel) {
    return true
  }

  if (typeof node.type !== 'object' || node.type === null) {
    return false
  }

  const component = node.type as { name?: string; __name?: string }

  return component.name === 'TrChatWorkspaceRightPanel' || component.__name === 'TrChatWorkspaceRightPanel'
}

const slotContainsRightPanel = computed(() =>
  flattenSlotNodes((slots.default?.() ?? []) as VNode[]).some((node) => isRightPanelVNode(node)),
)
</script>

<template>
  <template v-if="shouldRender">
    <div
      class="tr-chat-workspace-right-sheet__overlay"
      :class="{ 'is-open': isOpen }"
      @click="chatUi.workspace.right.close()"
    />

    <ThemeProvider v-if="scopedColorMode" :target-element="`#${themeScopeId}`" :color-mode="scopedColorMode">
      <div :id="themeScopeId" class="tr-chat-workspace-right-sheet" :class="{ 'is-open': isOpen }">
        <slot v-if="slotContainsRightPanel" />
        <ChatWorkspaceRightPanel v-else mobile>
          <slot />
        </ChatWorkspaceRightPanel>
      </div>
    </ThemeProvider>

    <div v-else :id="themeScopeId" class="tr-chat-workspace-right-sheet" :class="{ 'is-open': isOpen }">
      <slot v-if="slotContainsRightPanel" />
      <ChatWorkspaceRightPanel v-else mobile>
        <slot />
      </ChatWorkspaceRightPanel>
    </div>
  </template>
</template>

<style scoped lang="less">
.tr-chat-workspace-right-sheet__overlay {
  position: fixed;
  inset: 0;
  z-index: 10;
  opacity: 0;
  pointer-events: none;
  background: var(--chat-workspace-overlay-bg, rgba(15, 23, 42, 0.28));
  backdrop-filter: blur(2px);
  transition: opacity 0.22s ease;

  &.is-open {
    opacity: 1;
    pointer-events: auto;
  }
}

.tr-chat-workspace-right-sheet {
  position: fixed;
  inset: 0;
  z-index: 100;
  min-height: 0;
  max-height: none;
  overflow: hidden;
  background: var(--chat-workspace-panel-bg, var(--tr-container-bg-default, #fff));
  box-shadow: none;
  transform: translateX(100%);
  transition: transform 0.28s ease;

  &.is-open {
    transform: translateX(0);
  }
}
</style>
