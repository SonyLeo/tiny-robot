<template>
  <div class="msglist-config-grid">
    <!-- Custom role-configs: custom avatar name -->
    <div data-testid="chat-msglist-role-configs" class="chat-wrapper">
      <TrChat.Root :runtime="roleConfigsResolution.runtime" :ui="roleConfigsResolution.ui">
        <TrChat.Layout
          :appearance="roleConfigsResolution.ui.appearance"
          :content-layout="roleConfigsResolution.ui.contentLayout"
        >
          <TrChat.Header :title="roleConfigsResolution.ui.brand?.title" :show-history="false" />
          <TrChat.Welcome
            v-if="showRoleConfigsWelcome"
            :title="roleConfigsResolution.ui.welcome?.title"
            :description="roleConfigsResolution.ui.welcome?.description"
            :prompts="roleConfigsResolution.ui.welcome?.prompts"
            @prompt-click="roleConfigsResolution.runtime.conversation.send({ text: $event })"
          />
          <TrChat.MessageList v-else :role-configs="customRoleConfigs" auto-scroll />
          <TrChat.Footer>
            <TrChat.Sender />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Root>
    </div>

    <!-- auto-scroll: new messages scroll to bottom -->
    <div data-testid="chat-msglist-autoscroll" class="chat-wrapper">
      <TrChat.Root :runtime="autoScrollResolution.runtime" :ui="autoScrollResolution.ui">
        <TrChat.Layout
          :appearance="autoScrollResolution.ui.appearance"
          :content-layout="autoScrollResolution.ui.contentLayout"
        >
          <TrChat.Header :title="autoScrollResolution.ui.brand?.title" :show-history="false" />
          <TrChat.Welcome
            v-if="showAutoScrollWelcome"
            :title="autoScrollResolution.ui.welcome?.title"
            :description="autoScrollResolution.ui.welcome?.description"
            :prompts="autoScrollResolution.ui.welcome?.prompts"
            @prompt-click="autoScrollResolution.runtime.conversation.send({ text: $event })"
          />
          <TrChat.MessageList v-else auto-scroll />
          <TrChat.Footer>
            <TrChat.Sender />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Root>
    </div>

    <!-- group-strategy: consecutive same-role messages are grouped -->
    <div data-testid="chat-msglist-group-strategy" class="chat-wrapper">
      <TrChat.Root :runtime="groupStrategyResolution.runtime" :ui="groupStrategyResolution.ui">
        <TrChat.Layout
          :appearance="groupStrategyResolution.ui.appearance"
          :content-layout="groupStrategyResolution.ui.contentLayout"
        >
          <TrChat.Header :title="groupStrategyResolution.ui.brand?.title" :show-history="false" />
          <TrChat.MessageList group-strategy="consecutive" auto-scroll />
          <TrChat.Footer>
            <TrChat.Sender />
          </TrChat.Footer>
        </TrChat.Layout>
      </TrChat.Root>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, markRaw } from 'vue'
import { TrChat } from '@opentiny/tiny-robot-chat'
import { createOfficialSceneConfig } from './officialSceneConfig'
import { useStableSceneRuntime } from './useStableSceneRuntime'
import { useSceneWelcomeState } from './useSceneWelcomeState'

// Custom avatar components for role-configs test — use render functions (no template compiler needed)
const CustomAssistantAvatar = markRaw({
  name: 'CustomAssistantAvatar',
  render() {
    return h('span', { class: 'custom-avatar' }, 'AI')
  },
})
const CustomUserAvatar = markRaw({
  name: 'CustomUserAvatar',
  render() {
    return h('span', { class: 'custom-avatar' }, 'ME')
  },
})

const customRoleConfigs = {
  assistant: {
    name: 'Custom AI',
    avatar: CustomAssistantAvatar,
    placement: 'start' as const,
  },
  user: {
    name: 'Custom User',
    avatar: CustomUserAvatar,
    placement: 'end' as const,
  },
}

const roleConfigsConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'MessageList Role Configs',
    welcomeTitle: 'Role Configs Scene',
    welcomeDescription: 'Custom role-configs should render custom avatar and name in bubbles.',
    welcomePrompts: [{ label: 'Test role configs', description: 'Test role configs' }],
  }),
)

const autoScrollConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'MessageList AutoScroll',
    welcomeTitle: 'AutoScroll Scene',
    welcomeDescription: 'New messages should auto-scroll the list to the bottom.',
    welcomePrompts: [{ label: 'Test auto-scroll', description: 'Test auto-scroll' }],
  }),
)

const roleConfigsResolution = useStableSceneRuntime(roleConfigsConfig)
const autoScrollResolution = useStableSceneRuntime(autoScrollConfig)
const showRoleConfigsWelcome = useSceneWelcomeState(roleConfigsResolution)
const showAutoScrollWelcome = useSceneWelcomeState(autoScrollResolution)

// group-strategy: pre-seed 3 consecutive assistant messages to verify grouping
const groupStrategyConfig = computed(() =>
  createOfficialSceneConfig({
    brandTitle: 'MessageList Group Strategy',
    welcomeTitle: 'Group Strategy Scene',
    welcomeDescription: 'Consecutive same-role messages should be grouped into fewer bubbles.',
    initialMessages: [
      { role: 'user', content: 'hello' },
      { role: 'assistant', content: 'reply 1' },
      { role: 'assistant', content: 'reply 2' },
      { role: 'assistant', content: 'reply 3' },
    ],
  }),
)
const groupStrategyResolution = useStableSceneRuntime(groupStrategyConfig)
</script>

<style scoped>
.msglist-config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.chat-wrapper {
  position: relative;
  height: calc(100vh - 100px);
  min-height: 0;
  overflow: hidden;
  isolation: isolate;
}

:deep(.custom-avatar) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #2f6bff;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}
</style>
