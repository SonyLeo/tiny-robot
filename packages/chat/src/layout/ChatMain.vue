<script setup lang="ts">
import { unrefElement } from '@vueuse/core'
import { computed, type ComponentPublicInstance } from 'vue'
import { useChatMainScrollbar } from '@/composables/useChatMainScrollbar'
import type { ChatMainProps, ChatMainScrollHost } from '@/types/layout'

defineOptions({
  name: 'ChatMain',
})

const props = defineProps<ChatMainProps>()

const resolveScrollHostElement = (scrollHost: ChatMainScrollHost): HTMLElement | null => {
  const element = unrefElement(scrollHost as HTMLElement | ComponentPublicInstance | null | undefined)
  return element instanceof HTMLElement ? element : null
}

const scrollHostRef = computed<HTMLElement | null>(() => resolveScrollHostElement(props.scrollHost))

const { showScrollbar, rootClass, thumbStyle, setHovering, startThumbDrag } = useChatMainScrollbar({
  scrollHostRef,
})
</script>

<template>
  <main class="tr-chat-main" :class="rootClass" @mouseenter="setHovering(true)" @mouseleave="setHovering(false)">
    <slot />

    <div v-if="showScrollbar" class="tr-chat-main__scrollbar" aria-hidden="true">
      <div class="tr-chat-main__scrollbar-thumb" :style="thumbStyle" @pointerdown="startThumbDrag" />
    </div>
  </main>
</template>
