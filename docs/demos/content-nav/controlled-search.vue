<template>
  <section class="demo">
    <div class="controls">
      <div class="placement">
        <span>停靠位置</span>
        <label>
          <input v-model="placement" type="radio" value="left" />
          左侧
        </label>
        <label>
          <input v-model="placement" type="radio" value="right" />
          右侧
        </label>
      </div>

      <label>
        <input v-model="searchEnabled" type="checkbox" />
        显示搜索区
      </label>
    </div>

    <div class="stage">
      <div ref="scrollContainerRef" class="conversation">
        <tr-bubble-provider :box-renderer-matches="boxRendererMatches">
          <tr-bubble-list class="conversation-list" :messages="messages" :role-configs="roles" />
        </tr-bubble-provider>
      </div>

      <tr-content-nav
        :class="['nav', `is-${placement}`]"
        :items="contentNavItems"
        :scroll-container="scrollContainerRef"
        :placement="placement"
        :search="search"
        v-model:active-id="activeId"
        v-model:query="query"
        :target-active-class="styles.userBubbleActive"
        :target-active-duration="560"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, h, ref, useCssModule } from 'vue'
import {
  TrBubbleList,
  TrBubbleProvider,
  TrContentNav,
  BubbleRenderers,
  type BubbleBoxRendererMatch,
  type BubbleMessage,
  type BubbleRoleConfig,
} from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { controlledSearchMessages } from './controlled-search.messages'

const styles = useCssModule()

const messages = controlledSearchMessages

function isUserMessage(message: BubbleMessage): message is BubbleMessage & { id: string; role: 'user' } {
  return message.role === 'user' && typeof message.id === 'string'
}

const aiAvatar = h(IconAi, { style: { fontSize: '28px' } })
const userAvatar = h(IconUser, { style: { fontSize: '28px' } })

const roles = {
  assistant: {
    placement: 'start',
    avatar: aiAvatar,
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
  },
} satisfies Record<string, BubbleRoleConfig>

const userMessages = messages.filter(isUserMessage)
const messageById = new Map(messages.map((message) => [String(message.id), message]))

const scrollContainerRef = ref<HTMLElement | null>(null)
const placement = ref<'left' | 'right'>('right')
const activeId = ref(userMessages[0]?.id ?? '')
const query = ref('')
const searchEnabled = ref(false)

const search = computed(() => (searchEnabled.value ? { placeholder: '搜索用户问题或回复关键词' } : false))
const contentNavItems = userMessages.map((message) => {
  const assistantReply = messageById.get(`assistant-${message.id}`)
  const label = String(message.content)

  return {
    id: message.id,
    label,
    searchText: `${label} ${String(message.content)} ${String(assistantReply?.content ?? '')}`,
    tooltipText: label,
  }
})

const boxRendererMatches = [
  {
    find: (groupedMessages) => groupedMessages[0]?.role === 'user',
    renderer: BubbleRenderers.Box,
    priority: 999,
    attributes: (groupedMessages) => {
      const firstMessage = groupedMessages[0]
      if (typeof firstMessage?.id !== 'string') {
        return undefined
      }

      return {
        class: styles.userBubbleTarget,
        'data-content-nav-id': firstMessage.id,
      }
    },
  },
] satisfies BubbleBoxRendererMatch[]
</script>

<style module lang="less">
.userBubbleTarget {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
  scroll-margin-top: 20px;
  transition:
    background-color 220ms ease,
    box-shadow 220ms ease;
}

.userBubbleActive {
  --tr-bubble-box-bg: #b9d7ff;
  box-shadow:
    0 0 0 1px rgba(84, 132, 255, 0.28),
    0 16px 34px rgba(84, 132, 255, 0.16);
}
</style>

<style lang="less" scoped>
@import './demo-shell.less';

.demo {
  --content-nav-demo-gap: 16px;
  --content-nav-demo-controls-gap: 12px 16px;
  --content-nav-demo-stage-height: 480px;
}

.placement {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.conversation {
  height: 100%;
  overflow: auto;
}

.conversation-list {
  --tr-bubble-list-gap: 16px;
  --tr-bubble-list-padding: 24px 72px 40px;
  --tr-bubble-max-width: 560px;
}

.nav {
  &.is-right {
    right: 16px;
  }

  &.is-left {
    left: 16px;
  }
}
</style>
