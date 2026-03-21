<script setup lang="ts">
import { computed } from 'vue'
import { useChatKit } from '@/composables'
import type { AgentPresetInput, SkillPackInput } from '@/presets'
import { createPresetConsumptionFromAgentPreset } from '@/presets'
import type { ChatConfig } from '@/adapters'
import type { TrChatProps, TrChatRootProps, UseChatKitOptions, UseChatKitReturn } from '@/types'
import { conditionalProp } from '@/utils'
import ChatRoot from './ChatRoot.vue'

defineOptions({ name: 'TrChatPresetRoot' })

type Props = TrChatRootProps & {
  baseConfig: ChatConfig
  preset: AgentPresetInput
  presets?: AgentPresetInput[]
  skillPacks?: SkillPackInput[]
  presetOverrides?: Partial<TrChatProps>
}

interface PresetRootSlotProps {
  chatKit: UseChatKitReturn
  resolvedPreset: ReturnType<typeof createPresetConsumptionFromAgentPreset>['resolvedPreset']
  chatConfig: ReturnType<typeof createPresetConsumptionFromAgentPreset>['chatConfig']
  adapter: ReturnType<typeof createPresetConsumptionFromAgentPreset>['adapter']
  presetProps: ReturnType<typeof createPresetConsumptionFromAgentPreset>['presetProps']
  presetSlices: ReturnType<typeof createPresetConsumptionFromAgentPreset>['presetSlices']
}

const props = defineProps<Props>()

const providedChatKit = conditionalProp(props, 'chatKit')
const providedResponseProvider = conditionalProp(props, 'responseProvider')

if (!providedChatKit && !providedResponseProvider) {
  throw new Error('[TrChatPresetRoot] Either chatKit or responseProvider must be provided')
}

const chatKit =
  providedChatKit ??
  useChatKit({
    responseProvider: providedResponseProvider as UseChatKitOptions['responseProvider'],
    plugins: conditionalProp(props, 'plugins'),
    storage: conditionalProp(props, 'storage'),
    initialMessages: conditionalProp(props, 'initialMessages'),
    onFinish: conditionalProp(props, 'onFinish'),
    onError: conditionalProp(props, 'onError'),
  })

const consumption = computed(() =>
  createPresetConsumptionFromAgentPreset({
    baseConfig: props.baseConfig,
    preset: props.preset,
    presets: props.presets,
    skillPacks: props.skillPacks,
    presetOverrides: props.presetOverrides,
  }),
)

const slotProps = computed<PresetRootSlotProps>(() => ({
  chatKit,
  ...consumption.value,
}))
</script>

<template>
  <ChatRoot :chat-kit="chatKit" v-bind="consumption.presetSlices.root">
    <slot v-bind="slotProps" />
  </ChatRoot>
</template>
