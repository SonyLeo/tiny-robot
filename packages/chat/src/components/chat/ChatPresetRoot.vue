<script setup lang="ts">
import { computed } from 'vue'
import type { AgentPresetInput, SkillPackInput } from '@/presets'
import { createPresetConsumptionFromAgentPreset } from '@/presets'
import type { ChatConfig } from '@/adapters'
import type { TrChatProps, TrChatRootProps, UseChatKitReturn } from '@/types'
import ChatRoot from './ChatRoot.vue'
import { resolveRootChatKit } from './resolveRootChatKit'

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

const chatKit = resolveRootChatKit('TrChatPresetRoot', props)

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

const rootBindings = computed(() => ({
  ...consumption.value.presetSlices.root,
  mcpManager: props.mcpManager ?? consumption.value.presetSlices.root.mcpManager,
  attachmentsManager: props.attachmentsManager ?? consumption.value.presetSlices.root.attachmentsManager,
  attachmentsFeature: props.attachmentsFeature ?? consumption.value.presetSlices.root.attachmentsFeature,
  senderActionsFeature: props.senderActionsFeature ?? consumption.value.presetSlices.root.senderActionsFeature,
  messages: props.messages ?? consumption.value.presetSlices.root.messages,
}))
</script>

<template>
  <ChatRoot :chat-kit="chatKit" v-bind="rootBindings">
    <slot v-bind="slotProps" />
  </ChatRoot>
</template>
