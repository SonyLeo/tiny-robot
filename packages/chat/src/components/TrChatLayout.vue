<script setup lang="ts">
import { BubbleProvider } from '@opentiny/tiny-robot'
import type { BubbleListProps } from '@opentiny/tiny-robot'
import { computed, provide } from 'vue'
import { useDefaultBubbleConfig } from '../composables'
import { BUBBLE_CONFIG_KEY } from '../context'

interface Props {
  fullscreen?: boolean
  roleConfigs?: BubbleListProps['roleConfigs']
}

const props = withDefaults(defineProps<Props>(), {
  fullscreen: false,
})

const { contentMatches, boxMatches, roles: defaultRoles } = useDefaultBubbleConfig()

const mergedRoleConfigs = computed(() => ({
  ...defaultRoles,
  ...props.roleConfigs,
}))

provide(BUBBLE_CONFIG_KEY, {
  roleConfigs: mergedRoleConfigs,
})
</script>

<template>
  <BubbleProvider :box-renderer-matches="boxMatches" :content-renderer-matches="contentMatches">
    <div class="tr-chat" :class="{ 'tr-chat--fullscreen': props.fullscreen }">
      <slot />
    </div>
  </BubbleProvider>
</template>
