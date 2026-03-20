<template>
  <div data-testid="chat-preset-entry" class="chat-wrapper">
    <TrChat.PresetRoot
      :response-provider="presetEntryProvider"
      :base-config="presetEntryBaseConfig"
      :preset="presetEntryPreset"
      :presets="BUILT_IN_AGENT_PRESETS as any"
      :skill-packs="BUILT_IN_SKILL_PACKS as any"
      :preset-overrides="presetEntryOverrides"
    >
      <template #default="{ chatKit: presetEntryChatKit, resolvedPreset, presetSlices }">
        <TrChat.Layout v-bind="{ ...presetSlices.layout, ...presetSlices.appearance }">
          <TrChat.Header v-bind="presetSlices.header">
            <template #extra>
              <span data-testid="preset-entry-preset-id">{{ resolvedPreset.presetId }}</span>
            </template>
          </TrChat.Header>

          <TrChat.Welcome
            v-if="presetEntryChatKit.messages.value.length === 0 && presetSlices.welcome"
            v-bind="presetSlices.welcome"
            @prompt-click="(description) => presetEntryChatKit.sendMessage(description)"
          />

          <TrChat.MessageList v-else v-bind="presetSlices.messageList" />

          <TrChat.Footer>
            <TrChat.Sender v-bind="presetSlices.sender" />
          </TrChat.Footer>
        </TrChat.Layout>
      </template>
    </TrChat.PresetRoot>
  </div>
</template>

<script setup lang="ts">
import { BUILT_IN_AGENT_PRESETS, BUILT_IN_SKILL_PACKS, TrChat, getBuiltInAgentPreset } from '../../../../chat/src'
import { createMockProvider } from '../mockProvider'

const presetEntryPreset = getBuiltInAgentPreset('docs-reader')
if (!presetEntryPreset) {
  throw new Error('docs-reader preset not found')
}

const presetEntryBaseConfig = {
  models: [{ id: 'preset-entry-model', provider: 'openai' }],
  providers: {
    openai: {
      type: 'openai-compatible' as const,
      endpoint: '/api/chat',
    },
  },
  ui: {
    brand: {
      title: 'Preset Entry Base',
    },
    welcome: {
      title: 'Preset Entry Base Welcome',
      description: 'PresetRoot should consume resolved preset slices through a scoped slot.',
    },
  },
}

const presetEntryProvider = createMockProvider({
  provider: 'openai',
  model: 'preset-entry-model',
})

const presetEntryOverrides = {
  placeholder: 'Preset entry sender...',
}
</script>

<style scoped>
.chat-wrapper {
  position: relative;
  height: calc(100vh - 100px);
}
</style>
