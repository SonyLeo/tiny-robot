<script setup lang="ts">
import { computed, toRef, useSlots, useTemplateRef } from 'vue'
import { createChatLayoutStore } from '@/composables/createChatLayoutStore'
import { useChatLayoutInteractions } from '@/composables/useChatLayoutInteractions'
import { provideChatLayoutStore } from '@/composables/useChatLayout'
import { useChatLayoutViewState } from '@/composables/useChatLayoutViewState'
import { useChatSurface } from '@/composables/useChatSurface'
import ChatAsideResizeTrigger from './ChatAsideResizeTrigger.vue'
import ChatSurfaceResizeTrigger from './ChatSurfaceResizeTrigger.vue'
import { createChatLayoutAsideStoreInput } from './utils'
import type {
  ChatAsideConfig,
  ChatDetachedBounds,
  ChatLayoutEmits,
  ChatLayoutProps,
  ChatLayoutSlots,
  ChatSurfaceMode,
} from '@/types/layout'

defineOptions({
  name: 'ChatLayout',
})

const props =
  defineProps<
    Pick<ChatLayoutProps, 'detachedDraggable' | 'detachedResizable' | 'minDetachedWidth' | 'maxDetachedWidth'>
  >()

const emit = defineEmits<ChatLayoutEmits>()

defineSlots<ChatLayoutSlots>()

const surfaceModeState = defineModel<ChatSurfaceMode>('surfaceMode')
const detachedBoundsState = defineModel<ChatDetachedBounds>('detachedBounds')
const leftAsideState = defineModel<ChatAsideConfig>('leftAside')
const rightAsideState = defineModel<ChatAsideConfig>('rightAside')
const surfaceHostRef = useTemplateRef<HTMLElement>('surfaceHostRef')
const surfaceFrameRef = useTemplateRef<HTMLElement>('surfaceFrameRef')
const surfaceDragHandleRef = useTemplateRef<HTMLElement>('surfaceDragHandleRef')
const layoutRootRef = useTemplateRef<HTMLElement>('layoutRootRef')
const leftAsideRef = useTemplateRef<HTMLElement>('leftAsideRef')
const rightAsideRef = useTemplateRef<HTMLElement>('rightAsideRef')

const layoutStore = createChatLayoutStore({
  left: createChatLayoutAsideStoreInput(leftAsideState),
  right: createChatLayoutAsideStoreInput(rightAsideState),
})

provideChatLayoutStore(layoutStore)

const slots = useSlots()
const { closeDrawers, left, right } = layoutStore
const isDrawerVisible = computed(() => layoutStore.isDrawerVisible)
const {
  isResizing: isAsideResizing,
  draggingPlacement,
  leftHandleProps,
  rightHandleProps,
} = useChatLayoutInteractions({
  rootRef: layoutRootRef,
  leftAsideRef,
  rightAsideRef,
  left,
  right,
  isDrawerVisible,
  closeDrawers,
  onResizeStart: (detail) => emit('aside-resize-start', detail),
  onResize: (detail) => emit('aside-resize', detail),
  onResizeEnd: (detail) => emit('aside-resize-end', detail),
})

const {
  hasHeader,
  hasMain,
  hasFooter,
  leftAsideHidden,
  rightAsideHidden,
  leftResizeVisible,
  rightResizeVisible,
  layoutStyle,
  layoutClass,
  leftAsideClass,
  rightAsideClass,
} = useChatLayoutViewState({
  slots,
  left,
  right,
  isDrawerVisible,
  isResizing: isAsideResizing,
})

const {
  showDragBar,
  showResizeHandles,
  surfaceClass,
  surfaceStyle,
  dragBarClass,
  activeResizeEdge,
  leftResizeHandleProps,
  rightResizeHandleProps,
} = useChatSurface({
  surfaceModeState,
  detachedBoundsState,
  detachedDraggableState: toRef(props, 'detachedDraggable'),
  detachedResizableState: toRef(props, 'detachedResizable'),
  minDetachedWidthState: toRef(props, 'minDetachedWidth'),
  maxDetachedWidthState: toRef(props, 'maxDetachedWidth'),
  hostRef: surfaceHostRef,
  frameRef: surfaceFrameRef,
  dragHandleRef: surfaceDragHandleRef,
  onDetachedResizeStart: (detail) => emit('detached-resize-start', detail),
  onDetachedResize: (detail) => emit('detached-resize', detail),
  onDetachedResizeEnd: (detail) => emit('detached-resize-end', detail),
})

const layoutRootStyle = computed(() => ({
  ...layoutStyle.value,
  '--tr-chat-layout-height': '100%',
}))
</script>

<template>
  <div ref="surfaceHostRef" class="tr-chat-layout-surface-host" data-part="surface-host">
    <div
      ref="surfaceFrameRef"
      class="tr-chat-layout-surface"
      :class="surfaceClass"
      :style="surfaceStyle"
      data-part="surface"
      :data-resizing-edge="activeResizeEdge ?? undefined"
    >
      <div
        v-if="showDragBar"
        ref="surfaceDragHandleRef"
        class="tr-chat-layout-surface__drag-bar"
        :class="dragBarClass"
        data-part="surface-drag-bar"
      />
      <ChatSurfaceResizeTrigger
        v-if="showResizeHandles"
        edge="left"
        :active="activeResizeEdge === 'left'"
        @pointerdown="leftResizeHandleProps.onPointerdown"
      />
      <ChatSurfaceResizeTrigger
        v-if="showResizeHandles"
        edge="right"
        :active="activeResizeEdge === 'right'"
        @pointerdown="rightResizeHandleProps.onPointerdown"
      />

      <div
        ref="layoutRootRef"
        class="tr-chat-layout"
        :style="layoutRootStyle"
        :class="layoutClass"
        data-part="root"
        :data-dragging="draggingPlacement ?? undefined"
      >
        <div
          ref="leftAsideRef"
          class="tr-chat-layout__aside tr-chat-layout__aside--left"
          :class="leftAsideClass"
          data-part="aside"
          data-placement="left"
          :data-resizable="leftResizeVisible ? '' : undefined"
          :aria-hidden="leftAsideHidden ? 'true' : undefined"
          :inert="leftAsideHidden"
        >
          <slot name="left-aside" />
          <ChatAsideResizeTrigger
            v-if="leftResizeVisible"
            placement="left"
            :dragging-placement="draggingPlacement"
            @pointerdown="leftHandleProps.onPointerdown"
          />
        </div>

        <div
          class="tr-chat-layout__header-shell"
          :class="{ 'tr-chat-layout__header-shell--active': hasHeader }"
          :aria-hidden="hasHeader ? undefined : 'true'"
        >
          <div class="tr-chat-layout__header-inner">
            <header class="tr-chat-header">
              <slot name="header" />
            </header>
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
            <footer class="tr-chat-footer">
              <slot name="footer" />
            </footer>
          </div>
        </div>

        <div
          ref="rightAsideRef"
          class="tr-chat-layout__aside tr-chat-layout__aside--right"
          :class="rightAsideClass"
          data-part="aside"
          data-placement="right"
          :data-resizable="rightResizeVisible ? '' : undefined"
          :aria-hidden="rightAsideHidden ? 'true' : undefined"
          :inert="rightAsideHidden"
        >
          <ChatAsideResizeTrigger
            v-if="rightResizeVisible"
            placement="right"
            :dragging-placement="draggingPlacement"
            @pointerdown="rightHandleProps.onPointerdown"
          />
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
    </div>
  </div>
</template>
