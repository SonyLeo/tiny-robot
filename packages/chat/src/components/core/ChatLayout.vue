<script setup lang="ts">
import { BubbleProvider, ThemeProvider } from '@opentiny/tiny-robot'
import type { BubbleListProps } from '@opentiny/tiny-robot'
import { computed, getCurrentInstance, type PropType, provide } from 'vue'
import { useDefaultBubbleConfig } from './useDefaultBubbleConfig'
import { BUBBLE_CONFIG_KEY, useChatScaffoldContext } from '@/shared/context'
import type { ChatAppearanceConfig, ChatBubbleRenderers, ChatContentLayout } from '@/types'
import { triStateBooleanProp } from '@/shared/utils'

defineOptions({ name: 'TrChatLayout' })

const props = defineProps({
  show: triStateBooleanProp,
  roleConfigs: Object as PropType<BubbleListProps['roleConfigs']>,
  appearance: Object as PropType<ChatAppearanceConfig>,
  contentLayout: String as PropType<ChatContentLayout>,
  bubbleRenderers: Object as PropType<ChatBubbleRenderers>,
})
const scaffoldContext = useChatScaffoldContext()
const layoutSlice = computed(() => scaffoldContext?.presetSlices.value.layout)
const appearanceSlice = computed(() => scaffoldContext?.presetSlices.value.appearance.appearance)
const resolvedBubbleRenderers = computed<ChatBubbleRenderers | undefined>(
  () => props.bubbleRenderers ?? layoutSlice.value?.bubbleRenderers,
)

const {
  contentMatches: defaultContentMatches,
  boxMatches: defaultBoxMatches,
  roles: defaultRoles,
} = useDefaultBubbleConfig()
const contentMatches = computed(() => [
  ...(resolvedBubbleRenderers.value?.contentMatches ?? []),
  ...defaultContentMatches,
])
const boxMatches = computed(() => [...(resolvedBubbleRenderers.value?.boxMatches ?? []), ...defaultBoxMatches])
const resolvedShow = computed(() => props.show ?? layoutSlice.value?.show ?? true)
const resolvedAppearance = computed(() => props.appearance ?? appearanceSlice.value)
const resolvedContentLayout = computed<ChatContentLayout>(
  () => props.contentLayout ?? layoutSlice.value?.contentLayout ?? 'centered',
)
const themeScopeId = `tr-chat-theme-scope-${getCurrentInstance()?.uid ?? 'fallback'}`
const scopedThemeTargetElement = `#${themeScopeId}`
const resolvedRoleConfigs = computed(() => props.roleConfigs ?? layoutSlice.value?.roleConfigs)

const mergedRoleConfigs = computed(() => ({
  ...defaultRoles,
  ...resolvedRoleConfigs.value,
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
        :data-tr-appearance-mode="resolvedAppearance?.mode"
        :data-chat-content-layout="resolvedContentLayout"
      >
        <slot />
      </div>
    </ThemeProvider>

    <div
      v-else
      v-show="resolvedShow"
      class="tr-chat"
      :data-tr-appearance-mode="resolvedAppearance?.mode"
      :data-chat-content-layout="resolvedContentLayout"
    >
      <slot />
    </div>
  </BubbleProvider>
</template>
