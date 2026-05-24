<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useChatMainScrollbar } from '@/composables/useChatMainScrollbar'

defineOptions({
  name: 'ChatMain',
})

const rootRef = useTemplateRef<HTMLElement>('rootRef')

const { showScrollbar, rootClass, thumbStyle, setHovering, startThumbDrag } = useChatMainScrollbar({
  rootRef,
})
</script>

<template>
  <main
    ref="rootRef"
    class="tr-chat-main"
    :class="rootClass"
    @mouseenter="setHovering(true)"
    @mouseleave="setHovering(false)"
  >
    <slot />

    <div v-if="showScrollbar" class="tr-chat-main__scrollbar" aria-hidden="true">
      <div class="tr-chat-main__scrollbar-thumb" :style="thumbStyle" @pointerdown="startThumbDrag" />
    </div>
  </main>
</template>
