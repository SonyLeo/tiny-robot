<script setup lang="ts">
import { BubbleProvider } from '@opentiny/tiny-robot'
import type { BubbleListProps } from '@opentiny/tiny-robot'
import { computed, provide } from 'vue'
import { useDefaultBubbleConfig } from '../../composables'
import { BUBBLE_CONFIG_KEY } from '../../context'
import type { ChatAppearanceConfig } from '../../types'

defineOptions({ name: 'TrChatLayout' })

interface Props {
  show?: boolean
  fullscreen?: boolean
  roleConfigs?: BubbleListProps['roleConfigs']
  appearance?: ChatAppearanceConfig
}

const props = withDefaults(defineProps<Props>(), {
  show: true,
  fullscreen: false,
})

const { contentMatches, boxMatches, roles: defaultRoles } = useDefaultBubbleConfig()

const mergedRoleConfigs = computed(() => ({
  ...defaultRoles,
  ...props.roleConfigs,
}))

const colorModeAttr = computed(() => {
  return props.appearance?.mode === 'light' || props.appearance?.mode === 'dark' ? props.appearance.mode : undefined
})

provide(BUBBLE_CONFIG_KEY, {
  roleConfigs: mergedRoleConfigs,
})
</script>

<template>
  <BubbleProvider :box-renderer-matches="boxMatches" :content-renderer-matches="contentMatches">
    <div
      v-show="props.show"
      class="tr-chat"
      :class="{ 'tr-chat--fullscreen': props.fullscreen }"
      :data-tr-appearance-mode="props.appearance?.mode"
      :data-tr-color-mode="colorModeAttr"
    >
      <slot />
    </div>
  </BubbleProvider>
</template>
