<script setup lang="ts">
import { BubbleProvider, ThemeProvider } from '@opentiny/tiny-robot'
import type { BubbleListProps } from '@opentiny/tiny-robot'
import { computed, getCurrentInstance, type PropType, provide } from 'vue'
import { useDefaultBubbleConfig } from '@/composables'
import { BUBBLE_CONFIG_KEY, useChatScaffoldContext } from '@/context'
import type { ChatAppearanceConfig } from '@/types'
import { triStateBooleanProp } from '@/utils'

defineOptions({ name: 'TrChatLayout' })

const props = defineProps({
  show: triStateBooleanProp,
  fullscreen: triStateBooleanProp,
  roleConfigs: Object as PropType<BubbleListProps['roleConfigs']>,
  appearance: Object as PropType<ChatAppearanceConfig>,
})
const scaffoldContext = useChatScaffoldContext()
const layoutSlice = computed(() => scaffoldContext?.presetSlices.value.layout)
const appearanceSlice = computed(() => scaffoldContext?.presetSlices.value.appearance.appearance)

const { contentMatches, boxMatches, roles: defaultRoles } = useDefaultBubbleConfig()
const resolvedShow = computed(() => props.show ?? layoutSlice.value?.show ?? true)
const resolvedFullscreen = computed(() => props.fullscreen ?? layoutSlice.value?.fullscreen ?? false)
const resolvedAppearance = computed(() => props.appearance ?? appearanceSlice.value)
const themeScopeId = `tr-chat-theme-scope-${getCurrentInstance()?.uid ?? 'fallback'}`
const scopedThemeTargetElement = `#${themeScopeId}`

const mergedRoleConfigs = computed(() => ({
  ...defaultRoles,
  ...(props.roleConfigs ?? layoutSlice.value?.roleConfigs),
}))

const scopedColorMode = computed(() => {
  const mode = resolvedAppearance.value?.mode

  if (mode === 'light' || mode === 'dark') {
    return mode
  }

  if (mode === 'system') {
    return 'auto'
  }

  return undefined
})

const useScopedThemeProvider = computed(() => Boolean(scopedColorMode.value))

provide(BUBBLE_CONFIG_KEY, {
  roleConfigs: mergedRoleConfigs,
})
</script>

<template>
  <BubbleProvider :box-renderer-matches="boxMatches" :content-renderer-matches="contentMatches">
    <ThemeProvider
      v-if="useScopedThemeProvider"
      :target-element="scopedThemeTargetElement"
      :color-mode="scopedColorMode"
    >
      <div
        :id="themeScopeId"
        v-show="resolvedShow"
        class="tr-chat"
        :class="{ 'tr-chat--fullscreen': resolvedFullscreen }"
        :data-tr-appearance-mode="resolvedAppearance?.mode"
      >
        <slot />
      </div>
    </ThemeProvider>

    <div
      v-else
      v-show="resolvedShow"
      class="tr-chat"
      :class="{ 'tr-chat--fullscreen': resolvedFullscreen }"
      :data-tr-appearance-mode="resolvedAppearance?.mode"
    >
      <slot />
    </div>
  </BubbleProvider>
</template>
