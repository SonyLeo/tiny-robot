<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { Chat } from '@/index'
import { BubbleList } from '@opentiny/tiny-robot'
import type { BubbleListProps, BubbleRoleConfig } from '@opentiny/tiny-robot'
import type { ChatDetachedBounds, ChatSurfaceMode } from '@/types/layout'

type BubbleMessages = NonNullable<BubbleListProps['messages']>
type BubbleMessage = BubbleMessages[number]
type SeedTurn = {
  question: string
  answers: string[]
}

const seedTurns: SeedTurn[] = [
  {
    question: '帮我解释一下 protagonist 的用法。',
    answers: [
      '最标准的对应词是 protagonist，表示故事、电影或戏剧里的核心角色。它更偏叙事语境，而不是演员的表演身份。',
      '如果你想表达更口语化一点，也可以说 main character；如果强调演员或主演身份，则更常用 lead。',
    ],
  },
  {
    question: '那它和 hero 一样吗？',
    answers: [
      '不完全一样。hero 往往带有正面价值判断，而 protagonist 只是叙事中心角色，甚至可以是反派或道德模糊的人物。',
      '现代很多作品里的主人公会是 anti-hero、反派视角或道德复杂人物，这时 protagonist 依然成立，但 hero 就不一定成立。',
    ],
  },
  {
    question: '举两个例子。',
    answers: [
      '例如 Harry Potter is the protagonist of the series. 另一个更有区分度的例子是：The protagonist of the story is not a hero, but an unreliable narrator.',
    ],
  },
  {
    question: '如果我要写成更口语一点的版本呢？',
    answers: [
      '你可以说 main character。这在说明电影、小说、动画人物时更自然，比如：Who is the main character in this movie? 读者不会停下来想这个词是不是太书面。',
    ],
  },
  {
    question: '那 lead 和 leading role 更适合什么场景？',
    answers: [
      '当你讨论表演、演员、主演位置时，lead / leading role 会更自然。比如 She played the lead in the stage adaptation. 这个时候焦点更偏向演员和出演关系，而不是故事结构。',
      '如果语境是 casting、演出阵容、奖项提名，lead actor / leading role 的命中率通常会比 protagonist 更高。',
    ],
  },
  {
    question: '能不能给我一个更完整的对比例句？',
    answers: [
      '当然可以：In literary analysis, the protagonist of the novel is not a hero but a deeply flawed narrator. 如果你想换成更日常表达，可以说：The main character of the novel is not heroic at all. 如果转到影视行业语境，则可以说：The actor took the lead role in the adaptation.',
    ],
  },
  {
    question: '如果我在写读书笔记，应该优先选哪个词？',
    answers: [
      '如果是偏分析型、评论型的读书笔记，优先用 protagonist 会更稳，因为它准确地落在“叙事中心角色”这个概念上。',
      '如果你写的是更轻松的观后感、推荐语或者社交媒体短评，那么 main character 更自然，读者也更容易快速理解。',
    ],
  },
  {
    question: '那 villain、antagonist、protagonist 之间怎么区分？',
    answers: [
      'villain 是价值判断，强调“坏人”或反派形象；antagonist 是叙事功能，强调与主角形成冲突的一方；protagonist 则是故事围绕展开的中心人物。',
      '一个角色完全可能同时是 protagonist 和 villain，例如以反派为主视角的作品；也可能 antagonist 不是 villain，只是和主角目标冲突的人。',
    ],
  },
  {
    question: '给我一个更短、更适合口语讲解的版本。',
    answers: [
      '可以直接说：protagonist 比较像“作品里的主角”，main character 更口语，hero 带正面意味，lead 更像“主演”或者“主打演员”。',
    ],
  },
  {
    question: '再帮我补一个适合教学场景的总结。',
    answers: [
      '如果你是在课堂上讲解，可以这样收尾：When we talk about story structure, protagonist is the most precise term. When we want a more natural everyday expression, main character is usually enough. When we shift the focus to performance and casting, lead or leading role becomes more appropriate.',
      '这类稍长一点的回复也很适合当前 demo，因为它能把 BubbleList 的内容密度拉起来，方便观察 detached 主区里的真实滚动、拖拽改宽和右侧虚拟滚动条 thumb 的同步关系。',
    ],
  },
]

function createSeedMessages(): BubbleMessages {
  const intro: BubbleMessage[] = [
    { role: 'assistant', content: '你好，我是 TinyRobot。这里是 detached 模式下的真实 BubbleList 场景。' },
    {
      role: 'assistant',
      content:
        '这个 demo 会预置一段较长的多轮对话，让你一进来就能看出：1. 主区到底是谁在滚，2. 右侧虚拟滚动条是否跟随，3. 发送新消息后自动滚底是否稳定。',
    },
  ]

  const transcript = seedTurns.flatMap<BubbleMessage>(({ question, answers }) => [
    { role: 'user', content: question },
    ...answers.map((content) => ({ role: 'assistant', content })),
  ])

  const outro: BubbleMessage[] = [
    { role: 'user', content: '继续补一点内容，我想看看滚动条拖动时的反馈。' },
    {
      role: 'assistant',
      content:
        '可以继续追加。你现在应该能明显看到：内容已经足够长，BubbleList 是唯一真实滚动宿主，虚拟滚动条 thumb 会随着滚动位置变化，发送新消息时如果处于底部附近会自动滚到底部。',
    },
    {
      role: 'assistant',
      content:
        '如果你把 surface 切回 Embedded，再切回 Detached，也可以继续观察 detachedBounds 是否保持上次位置，以及列表滚动和滚动条是否仍然一致。',
    },
  ]

  return [...intro, ...transcript, ...outro]
}

const surfaceMode = shallowRef<ChatSurfaceMode>('detached')
const detachedBounds = shallowRef<ChatDetachedBounds>({
  width: 480,
  height: '62vh',
})
const draft = ref('')
const messages = ref<BubbleMessages>(createSeedMessages())

const roleConfigs: Record<string, BubbleRoleConfig> = {
  assistant: {
    placement: 'start',
    shape: 'rounded',
  },
  user: {
    placement: 'end',
    shape: 'rounded',
  },
}

function appendMessage(role: 'user' | 'assistant', content: string): void {
  messages.value.push({ role, content })
}

function sendMessage(): void {
  const value = draft.value.trim()
  if (!value) {
    return
  }

  appendMessage('user', value)
  appendMessage(
    'assistant',
    `已收到你的问题：“${value}”。这条回复用于验证 BubbleList 作为唯一真实滚动宿主时，detached 主区的自动滚底与虚拟滚动条同步是否稳定。`,
  )
  draft.value = ''
}
</script>

<template>
  <div class="surface-layout-demo">
    <Chat.Layout
      v-model:surface-mode="surfaceMode"
      v-model:detached-bounds="detachedBounds"
      class="surface-layout-demo__layout"
      detached-draggable
      detached-resizable
      :min-detached-width="320"
      :max-detached-width="720"
    >
      <template #header>
        <div class="surface-layout-demo__header">
          <div class="surface-layout-demo__modes">
            <button
              type="button"
              :class="{ 'is-active': surfaceMode === 'embedded' }"
              @click="surfaceMode = 'embedded'"
            >
              Embedded
            </button>
            <button
              type="button"
              :class="{ 'is-active': surfaceMode === 'detached' }"
              @click="surfaceMode = 'detached'"
            >
              Detached
            </button>
          </div>
          <span>{{ messages.length }} messages</span>
        </div>
      </template>

      <template #main>
        <Chat.Main>
          <BubbleList
            class="surface-layout-demo__conversation"
            :messages="messages"
            :role-configs="roleConfigs"
            auto-scroll
          />
        </Chat.Main>
      </template>

      <template #footer>
        <div class="surface-layout-demo__footer">
          <input
            v-model="draft"
            type="text"
            placeholder="输入问题，观察 Embedded / Detached 下的布局表现"
            @keydown.enter="sendMessage"
          />
          <button type="button" @click="sendMessage">发送</button>
        </div>
      </template>
    </Chat.Layout>
  </div>
</template>

<style scoped>
.surface-layout-demo {
  min-height: 100%;
  background:
    radial-gradient(circle at top, rgba(97, 140, 255, 0.16), transparent 38%),
    linear-gradient(180deg, #f8fafc 0%, #eef3ff 100%);
}

.surface-layout-demo__layout {
  --tr-chat-layout-content-max-width: 980px;
  --tr-chat-layout-header-bg: rgba(255, 255, 255, 0.94);
  --tr-chat-layout-footer-bg: rgba(255, 255, 255, 0.94);
  --tr-chat-layout-main-bg: rgba(255, 255, 255, 0.96);
  --tr-chat-layout-divider-color: #e2e8f0;
  --tr-chat-layout-inner-padding-inline: 24px;
  --tr-chat-layout-inner-padding-block: 18px;
  --tr-chat-surface-radius: 28px;
}

.surface-layout-demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 56px;
}

.surface-layout-demo__modes {
  display: flex;
  align-items: center;
  gap: 8px;
}

.surface-layout-demo__modes button {
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid #dbe3f0;
  border-radius: 999px;
  background: #ffffff;
  color: #0f172a;
  font-size: 13px;
  cursor: pointer;
}

.surface-layout-demo__modes button.is-active {
  border-color: #355dff;
  background: #eef3ff;
  color: #355dff;
}

.surface-layout-demo__conversation {
  height: 100%;
  --tr-bubble-list-gap: 22px;
  --tr-bubble-list-padding: 20px 0 28px;
  --tr-bubble-max-width: min(100%, 720px);
  --tr-bubble-box-padding: 16px 18px;
  --tr-bubble-box-border-radius: 22px;
  --tr-bubble-text-font-size: 16px;
  --tr-bubble-text-line-height: 1.85;
}

.surface-layout-demo__conversation:deep([data-role='user']) {
  --tr-bubble-box-bg: #e8efff;
}

.surface-layout-demo__conversation:deep([data-role='assistant']) {
  --tr-bubble-box-bg: #f7f9fc;
}

.surface-layout-demo__footer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
}

.surface-layout-demo__footer input {
  min-width: 0;
  min-height: 52px;
  padding: 0 18px;
  border: 1px solid #dbe3f0;
  border-radius: 999px;
  font-size: 15px;
}

.surface-layout-demo__footer button {
  min-width: 92px;
  min-height: 52px;
  border: 0;
  border-radius: 999px;
  background: #315efb;
  color: #ffffff;
  font-size: 15px;
}

@media (max-width: 959px) {
  .surface-layout-demo__layout {
    --tr-chat-layout-inner-padding-inline: 16px;
  }

  .surface-layout-demo__header {
    min-height: 48px;
    align-items: flex-start;
    flex-direction: column;
  }

  .surface-layout-demo__modes {
    flex-wrap: wrap;
  }

  .surface-layout-demo__conversation {
    --tr-bubble-list-gap: 18px;
  }

  .surface-layout-demo__footer {
    grid-template-columns: 1fr;
  }
}
</style>
