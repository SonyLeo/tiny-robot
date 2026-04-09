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
        <tr-bubble-list id="bubbleRef" class="conversation-list" :messages="messages" :role-configs="roles">
          <template #after="{ messages: groupMessages }">
            <span
              v-if="groupMessages[0]?.role === 'user'"
              v-content-nav-anchor="groupMessages[0]?.id || ''"
              class="nav-anchor"
              aria-hidden="true"
            />
          </template>
        </tr-bubble-list>
      </div>

      <tr-content-nav
        :class="['nav', `is-${placement}`]"
        :items="items"
        :scroll-container="scrollContainerRef"
        :placement="placement"
        :search="search"
        v-model:active-id="activeId"
        v-model:expanded="expanded"
        v-model:query="query"
        @select="handleSelect"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, h, onBeforeUnmount, ref, watch } from 'vue'
import {
  TrBubbleList,
  TrContentNav,
  vContentNavAnchor,
  type BubbleListProps,
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
    user: '点击目录之后，我不想只是滚过去而已；最好让对应的用户气泡轻微闪一下，像眨眼一样提醒用户“你现在跳到的是这一轮提问”，这样在长对话里更容易建立位置感。',
    assistant:
      '这是非常适合 jump feedback 的场景。只要把目录项注册到目标用户气泡上，点击目录时就能把反馈动画直接作用在真实消息节点上，而不是额外再写一套滚动后的高亮逻辑。',
  },
  {
    userId: 'u-tooltip',
    user: '另外我还想顺便验证超长目录文本的 tooltip 效果，所以这里故意放一条特别长、而且比普通标题长很多很多的用户消息，用来确认导航项被截断之后，悬浮出来的 tooltip 是否真的能完整帮助用户理解这条提问的语义，而不只是显示一小截模糊的残句。',
    assistant:
      '这种长文本很适合做可用性验证：目录本身负责保持简洁、单行、省空间，tooltip 再补充完整语义。只要 tooltip 的显示链路不被父容器裁切，就能明显提升长问题目录的可读性。',
  },
  {
    userId: 'u-search',
    user: '示例里再带一个 controlled search 会更贴近真实使用吗？',
    assistant:
      '会更贴近真实场景。目录项的 label 保留用户提问，searchText 则把用户提问与助手回复拼在一起，这样既保留了目录的语义清晰度，也提高了搜索召回率。',
  },
]

const aiAvatar = h(IconAi, { style: { fontSize: '28px' } })
const userAvatar = h(IconUser, { style: { fontSize: '28px' } })

const roles: Record<string, BubbleRoleConfig> = {
  assistant: {
    placement: 'start',
    avatar: aiAvatar,
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
  },
}

const messages: BubbleListProps['messages'] = demoTurns.flatMap((turn) => [
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
])

const items = demoTurns.map((turn) => ({
  id: turn.userId,
  label: turn.user,
  searchText: `${turn.user} ${turn.assistant}`,
}))

const jumpFlashClassName = 'demo-user-bubble-flash'
const jumpTransitionDuration = '220ms'
const jumpFeedbackDuration = 520

const scrollContainerRef = ref<HTMLElement | null>(null)
const placement = ref<'left' | 'right'>('right')
const activeId = ref(demoTurns[0].userId)
const expanded = ref(false)
const query = ref('')
const searchEnabled = ref(false)
let jumpFeedbackTimer: ReturnType<typeof setTimeout> | null = null

const search = computed(() => (searchEnabled.value ? { placeholder: '搜索用户问题或回复关键词' } : false))

watch(searchEnabled, (enabled) => {
  if (!enabled) {
    query.value = ''
  }
})

function clearJumpFeedback() {
  if (jumpFeedbackTimer) {
    clearTimeout(jumpFeedbackTimer)
    jumpFeedbackTimer = null
  }
}

function applyJumpFeedback(id: string) {
  const container = scrollContainerRef.value
  const target = container
    ? (Array.from(container.querySelectorAll<HTMLElement>('[data-content-nav-id]')).find(
        (entry) => entry.dataset.contentNavId === id,
      ) ??
      (typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
        ? container.querySelector<HTMLElement>(`#${CSS.escape(id)}`)
        : Array.from(container.querySelectorAll<HTMLElement>('[id]')).find((entry) => entry.id === id)) ??
      null)
    : null
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

.nav-anchor {
  display: block;
  width: 0;
  height: 0;
  overflow: hidden;
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

:deep([data-role='user']) {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
  scroll-margin-top: 20px;
}

:deep([data-role='user'] .tr-bubble__box) {
  transition:
    background-color v-bind(jumpTransitionDuration) ease,
    box-shadow v-bind(jumpTransitionDuration) ease;
}

:deep([data-role='user'].demo-user-bubble-flash .tr-bubble__box) {
  --tr-bubble-box-bg: #b9d7ff;
  box-shadow:
    0 0 0 1px rgba(55, 132, 255, 0.2),
    0 12px 28px -18px rgba(55, 132, 255, 0.45),
    var(--tr-bubble-box-shadow);
}
</style>
