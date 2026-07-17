<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { computed, ref, shallowRef, useTemplateRef, watch } from 'vue'
import { BubbleList } from '@opentiny/tiny-robot'
import type { BubbleListProps, BubbleRoleConfig } from '@opentiny/tiny-robot'
import { Chat } from '@/index'
import type { ChatFloatingConfig, ChatLayoutMode } from '@/types/layout'

type BubbleMessages = NonNullable<BubbleListProps['messages']>
type BubbleMessage = BubbleMessages[number]
type SurfaceScenario = 'fullscreen' | 'right-edge'
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
      '这类稍长一点的回复也很适合当前 demo，因为它能把 BubbleList 的内容密度拉起来，方便观察 normal 和 floating 两种 surface 里的真实滚动、拖拽改宽与虚拟滚动条同步。',
    ],
  },
]

function createSeedMessages(): BubbleMessages {
  const intro: BubbleMessage[] = [
    {
      role: 'assistant',
      content:
        '你好，我是 TinyRobot。这里展示 Layout 的两种 surface：normal 全屏承载，以及 floating 贴住视口右侧的悬浮面板。',
    },
    {
      role: 'assistant',
      content:
        '你可以切换 Fullscreen / Floating，重点观察主区滚动、输入区固定、右侧 floating 改宽，以及虚拟滚动条和真实滚动宿主之间的同步关系。',
    },
  ]

  const transcript = seedTurns.flatMap<BubbleMessage>(({ question, answers }) => [
    { role: 'user', content: question },
    ...answers.map((content) => ({ role: 'assistant', content })),
  ])

  const outro: BubbleMessage[] = [
    { role: 'user', content: '切到 Right Edge 之后，我应该重点观察哪些地方？' },
    {
      role: 'assistant',
      content:
        '重点看三件事：第一，floating 默认是否贴边但仍然留出可拖拽和滚动的操作空间；第二，改宽后主区列表滚动和虚拟滚动条 thumb 是否仍然一致；第三，左侧业务背景是否还能成立。',
    },
  ]

  return [...intro, ...transcript, ...outro]
}

const scenario = shallowRef<SurfaceScenario>('fullscreen')
const mode = shallowRef<ChatLayoutMode>('normal')
const floating = shallowRef<ChatFloatingConfig>({
  width: 448,
  height: 'calc(100dvh - 48px)',
  draggable: true,
  resizable: true,
  minWidth: 340,
  maxWidth: 640,
})
const draft = ref('')
const messages = ref<BubbleMessages>(createSeedMessages())
const bubbleListRef = useTemplateRef<InstanceType<typeof BubbleList>>('bubbleListRef')
const { width: viewportWidth } = useWindowSize({ type: 'visual' })

const isFullscreenScenario = computed(() => scenario.value === 'fullscreen')
const scenarioTitle = computed(() => (isFullscreenScenario.value ? 'normal 全屏承载' : 'floating 右侧贴边'))
const scenarioHint = computed(() =>
  isFullscreenScenario.value
    ? '适合检查主区滚动、header / footer 布局，以及内容在 normal surface 里的稳定性。'
    : '适合检查 floating 贴边定位、左右改宽和虚拟滚动条在紧边界下的交互。',
)

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

function createRightEdgeFloatingConfig(): ChatFloatingConfig {
  const preferredWidth = Math.max(360, Math.round(viewportWidth.value * 0.34))
  const viewportLimit = Math.max(320, viewportWidth.value - 48)
  const nextWidth = Math.min(520, viewportLimit, preferredWidth)

  return {
    x: Math.max(24, viewportWidth.value - nextWidth - 24),
    y: 24,
    width: nextWidth,
    height: 'calc(100dvh - 48px)',
    draggable: true,
    resizable: true,
    minWidth: 340,
    maxWidth: 640,
  }
}

watch(
  [scenario, viewportWidth],
  ([nextScenario]) => {
    if (nextScenario === 'fullscreen') {
      mode.value = 'normal'
      return
    }

    mode.value = 'floating'
    floating.value = createRightEdgeFloatingConfig()
  },
  { immediate: true },
)

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
    `已收到你的问题：“${value}”。这条回复用于继续观察当前场景下的主区滚动、输入区固定，以及虚拟滚动条在长内容增长后的同步表现。`,
  )
  draft.value = ''
}
</script>

<template>
  <div class="surface-layout-demo" :class="`surface-layout-demo--${scenario}`">
    <div v-if="!isFullscreenScenario" class="surface-layout-demo__workspace" aria-hidden="true">
      <section class="surface-layout-demo__workspace-hero">
        <span class="surface-layout-demo__workspace-kicker">Right Edge Workspace</span>
        <h2>把 floating surface 贴住页面右侧，左边仍然保留真实的业务背景。</h2>
        <p>这个场景更接近“页面主内容 + 右侧 AI 助手”形态，适合观察定位、改宽、滚动条和输入区的协同。</p>
      </section>

      <div class="surface-layout-demo__workspace-grid">
        <article class="surface-layout-demo__workspace-card">
          <span>01</span>
          <strong>看默认位置</strong>
          <p>floating 默认贴住右侧，但仍然留出滚动条和边缘改宽的交互空间。</p>
        </article>
        <article class="surface-layout-demo__workspace-card">
          <span>02</span>
          <strong>看改宽过程</strong>
          <p>改宽时主区滚动容器、thumb 高度和 hover 命中不应该互相打架。</p>
        </article>
        <article class="surface-layout-demo__workspace-card">
          <span>03</span>
          <strong>看内容背景</strong>
          <p>左侧页面仍然成立，不需要再靠 Host / Container 两层切换去解释语义。</p>
        </article>
      </div>
    </div>

    <div class="surface-layout-demo__shell">
      <div
        class="surface-layout-demo__frame"
        :class="{ 'surface-layout-demo__frame--fullscreen': isFullscreenScenario }"
      >
        <Chat.Layout
          v-model:mode="mode"
          v-model:floating="floating"
          class="surface-layout-demo__layout"
          :class="{
            'surface-layout-demo__layout--fullscreen': isFullscreenScenario,
            'surface-layout-demo__layout--right-edge': !isFullscreenScenario,
          }"
        >
          <template #header>
            <div class="surface-layout-demo__header">
              <div class="surface-layout-demo__controls">
                <div class="surface-layout-demo__modes">
                  <span class="surface-layout-demo__label">Scene</span>
                  <button
                    type="button"
                    :class="{ 'is-active': scenario === 'fullscreen' }"
                    @click="scenario = 'fullscreen'"
                  >
                    Fullscreen
                  </button>
                  <button
                    type="button"
                    :class="{ 'is-active': scenario === 'right-edge' }"
                    @click="scenario = 'right-edge'"
                  >
                    Floating
                  </button>
                </div>

                <div class="surface-layout-demo__summary">
                  <strong>{{ scenarioTitle }}</strong>
                  <span>{{ scenarioHint }}</span>
                </div>
              </div>

              <span>{{ messages.length }} messages</span>
            </div>
          </template>

          <template #main>
            <Chat.Main :scroll-host="bubbleListRef">
              <BubbleList
                ref="bubbleListRef"
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
                placeholder="输入问题，继续观察 normal 主区或 floating 下的滚动与改宽表现"
                @keydown.enter="sendMessage"
              />
              <button type="button" @click="sendMessage">发送</button>
            </div>
          </template>
        </Chat.Layout>
      </div>
    </div>
  </div>
</template>

<style scoped>
.surface-layout-demo {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  background:
    radial-gradient(circle at top, rgba(97, 140, 255, 0.16), transparent 38%),
    linear-gradient(180deg, #f8fafc 0%, #eef3ff 100%);
}

.surface-layout-demo--right-edge {
  background:
    radial-gradient(circle at top left, rgba(97, 140, 255, 0.14), transparent 36%),
    linear-gradient(180deg, #f4f7fb 0%, #edf2ff 100%);
}

.surface-layout-demo__workspace {
  position: absolute;
  inset: 0;
  display: grid;
  align-content: start;
  gap: 24px;
  padding: 36px min(42vw, 560px) 32px 36px;
  box-sizing: border-box;
  pointer-events: none;
}

.surface-layout-demo__workspace-hero {
  width: min(100%, 620px);
  padding: 28px 30px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 22px 64px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(16px);
}

.surface-layout-demo__workspace-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(49, 94, 251, 0.1);
  color: #315efb;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.surface-layout-demo__workspace-hero h2,
.surface-layout-demo__workspace-hero p,
.surface-layout-demo__workspace-card strong,
.surface-layout-demo__workspace-card p {
  margin: 0;
}

.surface-layout-demo__workspace-hero h2 {
  margin-top: 16px;
  color: #0f172a;
  font-size: 32px;
  line-height: 1.18;
}

.surface-layout-demo__workspace-hero p {
  margin-top: 14px;
  color: #475569;
  font-size: 15px;
  line-height: 1.7;
}

.surface-layout-demo__workspace-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  width: min(100%, 720px);
}

.surface-layout-demo__workspace-card {
  display: grid;
  gap: 10px;
  min-height: 152px;
  padding: 22px 20px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.07);
}

.surface-layout-demo__workspace-card span {
  color: #315efb;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.surface-layout-demo__workspace-card strong {
  color: #0f172a;
  font-size: 16px;
}

.surface-layout-demo__workspace-card p {
  color: #475569;
  font-size: 14px;
  line-height: 1.7;
}

.surface-layout-demo__shell,
.surface-layout-demo__frame {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.surface-layout-demo__frame--fullscreen {
  background: rgba(255, 255, 255, 0.94);
}

.surface-layout-demo__layout {
  --tr-chat-layout-height: 100%;
  --tr-chat-layout-content-max-width: 980px;
  --tr-chat-layout-header-bg: rgba(255, 255, 255, 0.94);
  --tr-chat-layout-footer-bg: rgba(255, 255, 255, 0.94);
  --tr-chat-layout-main-bg: rgba(255, 255, 255, 0.96);
  --tr-chat-layout-divider-color: #e2e8f0;
  --tr-chat-layout-inner-padding-inline: 24px;
  --tr-chat-layout-inner-padding-block: 18px;
  --tr-chat-surface-radius: 28px;
}

.surface-layout-demo__layout--right-edge {
  --tr-chat-surface-radius: 30px;
}

.surface-layout-demo__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  min-height: 56px;
}

.surface-layout-demo__controls {
  display: grid;
  gap: 14px;
}

.surface-layout-demo__modes {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.surface-layout-demo__label {
  color: #475569;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.surface-layout-demo__modes button {
  min-height: 38px;
  padding: 0 16px;
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

.surface-layout-demo__summary {
  display: grid;
  gap: 4px;
}

.surface-layout-demo__summary strong {
  color: #0f172a;
  font-size: 15px;
}

.surface-layout-demo__summary span {
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
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

@media (max-width: 1199px) {
  .surface-layout-demo__workspace {
    padding-right: min(46vw, 540px);
  }

  .surface-layout-demo__workspace-grid {
    grid-template-columns: 1fr;
    width: min(100%, 420px);
  }
}

@media (max-width: 959px) {
  .surface-layout-demo__workspace {
    display: none;
  }

  .surface-layout-demo__layout {
    --tr-chat-layout-inner-padding-inline: 16px;
  }

  .surface-layout-demo__header {
    min-height: 48px;
    flex-direction: column;
  }

  .surface-layout-demo__controls {
    width: 100%;
  }

  .surface-layout-demo__conversation {
    --tr-bubble-list-gap: 18px;
  }

  .surface-layout-demo__footer {
    grid-template-columns: 1fr;
  }
}
</style>
