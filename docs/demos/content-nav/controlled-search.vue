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
        @select="handleSelect"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, h, onBeforeUnmount, ref } from 'vue'
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

type DemoTurn = {
  userId: string
  user: string
  assistant: string
}

const demoTurns: DemoTurn[] = [
  {
    userId: 'u-discovery',
    user: '映射关系应该怎么设计？',
    assistant:
      '可以把每一轮用户提问视为一个稳定锚点：目录数据直接来源于用户消息本身，BubbleList 负责渲染完整上下文，ContentNav 只消费“用户问题摘要 + 对应 DOM 锚点”。这样目录、滚动定位和阅读上下文会天然保持一致。',
  },
  {
    userId: 'u-feedback',
    user: '点击目录之后，我不想只是滚过去而已；最好让对应的用户气泡轻微闪一下。',
    assistant:
      '这非常适合 jump feedback。只要目录项和真实用户气泡之间的定位链路稳定，点击目录之后就可以直接给对应气泡加一层轻反馈，让用户明确知道当前跳到的是哪一轮对话。',
  },
  {
    userId: 'u-tooltip',
    user: '这里我还想顺便验证超长目录文案被截断之后，tooltip 能不能完整展示。',
    assistant:
      '长文案很适合在目录里做省略，在 tooltip 中保留完整语义。这样导航本身依然紧凑，但用户在需要时又能获取完整问题描述。',
  },
  {
    userId: 'u-search',
    user: '示例里再带一个 controlled search，会不会更贴近真实使用场景？',
    assistant:
      '会更贴近。目录的 label 可以保持问题摘要，searchText 再把用户提问和助手回复都拼接进去，这样既保留了目录语义，也提高了搜索召回率。',
  },
]

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

const messages = demoTurns.flatMap((turn) => [
  {
    id: turn.userId,
    role: 'user',
    content: turn.user,
  },
  {
    id: `assistant-${turn.userId}`,
    role: 'assistant',
    content: turn.assistant,
  },
]) satisfies BubbleMessage[]

const jumpFlashClassName = 'demo-user-box-flash'
const jumpTransitionDuration = '220ms'
const jumpFeedbackDuration = 520

const scrollContainerRef = ref<HTMLElement | null>(null)
const placement = ref<'left' | 'right'>('right')
const activeId = ref(demoTurns[0].userId)
const query = ref('')
const searchEnabled = ref(false)
let jumpFeedbackTimer: ReturnType<typeof setTimeout> | null = null

const search = computed(() => (searchEnabled.value ? { placeholder: '搜索用户问题或回复关键词' } : false))
const contentNavItems = computed(() =>
  demoTurns.map((turn) => ({
    id: turn.userId,
    label: turn.user,
    searchText: `${turn.user} ${turn.assistant}`,
    tooltipText: turn.user,
  })),
)

const boxRendererMatches = [
  {
    find: (messages) => messages[0]?.role === 'user',
    renderer: BubbleRenderers.Box,
    priority: 999,
    attributes: (messages, _content, contentIndex) => {
      if (contentIndex !== undefined && contentIndex > 0) {
        return undefined
      }

      const firstMessage = messages[0]
      if (!firstMessage?.id) {
        return undefined
      }

      return {
        'data-content-nav-id': firstMessage.id,
      }
    },
  },
] satisfies BubbleBoxRendererMatch[]

function queryTargetById(root: ParentNode, id: string) {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return root.querySelector<HTMLElement>(`[data-content-nav-id="${CSS.escape(id)}"]`)
  }

  return Array.from(root.querySelectorAll<HTMLElement>('[data-content-nav-id]')).find(
    (entry) => entry.dataset.contentNavId === id,
  )
}

function findBubbleBoxTarget(id: string) {
  const container = scrollContainerRef.value
  if (!container) {
    return null
  }

  return queryTargetById(container, id)
}

function clearJumpFeedback() {
  if (jumpFeedbackTimer) {
    clearTimeout(jumpFeedbackTimer)
    jumpFeedbackTimer = null
  }
}

function applyJumpFeedback(id: string) {
  const target = findBubbleBoxTarget(id)

  if (!target) {
    return
  }

  clearJumpFeedback()
  target.classList.remove(jumpFlashClassName)
  void target.offsetWidth
  target.classList.add(jumpFlashClassName)

  jumpFeedbackTimer = setTimeout(() => {
    target.classList.remove(jumpFlashClassName)
    jumpFeedbackTimer = null
  }, jumpFeedbackDuration)
}

function handleSelect(item: { id: string }) {
  activeId.value = item.id
  applyJumpFeedback(item.id)
}

onBeforeUnmount(() => {
  clearJumpFeedback()
})
</script>

<style lang="less" scoped>
.demo {
  display: grid;
  gap: 16px;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
  font-size: 13px;
}

.placement,
.controls label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.stage {
  position: relative;
  height: 480px;
  overflow: hidden;
  border: 1px solid #dfe7f2;
  border-radius: 12px;
  background: #fff;
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
  top: 0;

  &.is-right {
    right: 16px;
  }

  &.is-left {
    left: 16px;
  }
}

:deep(.tr-bubble__box[data-role='user']) {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
  scroll-margin-top: 20px;
  transition:
    background-color v-bind(jumpTransitionDuration) ease,
    box-shadow v-bind(jumpTransitionDuration) ease;
}

:deep(.tr-bubble__box[data-role='user'].demo-user-box-flash) {
  --tr-bubble-box-bg: #b9d7ff;
  box-shadow:
    0 0 0 1px rgba(55, 132, 255, 0.2),
    0 12px 28px -18px rgba(55, 132, 255, 0.45),
    var(--tr-bubble-box-shadow);
}
</style>
