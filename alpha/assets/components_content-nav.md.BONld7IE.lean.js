const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/basic-source.B3nrIhIX.js","assets/chunks/framework.CtXINCeU.js","assets/chunks/theme.Dt9R_b_Y.js","assets/chunks/controlled-search.DSVwSbln.js"])))=>i.map(i=>d[i]);
import{aD as c,bQ as i,aZ as m,aL as D,v,H as s,bL as E,bB as B,J as n,bk as t,bJ as d,G as u,b7 as p,aU as h}from"./chunks/framework.CtXINCeU.js";import{L as A,N as b}from"./chunks/index.DZKug4fT.js";const g=`<template>
  <section class="demo">
    <div class="controls">
      <span class="controls-title">展开模式</span>

      <label>
        <input v-model="expandTrigger" type="radio" value="hover" />
        hover
      </label>

      <label>
        <input v-model="expandTrigger" type="radio" value="manual" />
        manual
      </label>

      <template v-if="isManualMode">
        <span class="controls-divider" aria-hidden="true"></span>

        <label>
          <input v-model="expanded" type="checkbox" />
          展开目录面板
        </label>

        <button type="button" @click="expanded = false">收起</button>
        <button type="button" @click="expanded = true">展开</button>
      </template>
    </div>

    <p class="tip">
      <template v-if="isManualMode">
        当前为 <code>manual</code> 模式，目录面板不再跟随 hover 自动展开，改由外部 <code>v-model:expanded</code> 控制。
      </template>
      <template v-else> 当前为 <code>hover</code> 模式，鼠标悬浮或聚焦到目录面板时会自动展开。 </template>
    </p>

    <div class="stage">
      <div ref="scrollContainerRef" class="article">
        <section v-for="section in sections" :key="section.id" :ref="bindTarget(section.id)" class="article-section">
          <h4>{{ section.label }}</h4>
          <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
        </section>
      </div>

      <tr-content-nav
        class="nav"
        :source="source"
        :scroll-container="scrollContainerRef"
        :expand-trigger="expandTrigger"
        v-model:expanded="expanded"
        :search="{ placeholder: '搜索章节' }"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrContentNav, useContentNavSource } from '@opentiny/tiny-robot'

type DemoSection = {
  id: string
  label: string
  paragraphs: string[]
}

const sections: DemoSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    paragraphs: ['ContentNav 适合用于长内容区域的快速定位。', '接入时只需要准备目录项和真实滚动目标之间的映射关系。'],
  },
  {
    id: 'structure',
    label: 'Structure',
    paragraphs: ['推荐把每个章节标题或段落容器作为滚动目标。', '目录文本可以保持简洁，搜索文本再补充更多上下文。'],
  },
  {
    id: 'interaction',
    label: 'Interaction',
    paragraphs: [
      '当用户点击目录项时，ContentNav 会滚动到对应目标。',
      '滚动过程中，当前激活项也会随着可见区域自动更新。',
    ],
  },
  {
    id: 'tips',
    label: 'Tips',
    paragraphs: [
      '如果内容节点会动态增删，优先通过 useContentNavSource 统一维护 source 和 target 绑定。',
      '这样目录项、滚动定位和激活态能始终保持一致。',
    ],
  },
]

const scrollContainerRef = ref<HTMLElement | null>(null)
const expandTrigger = ref<'hover' | 'manual'>('hover')
const expanded = ref(false)
const isManualMode = computed(() => expandTrigger.value === 'manual')
const items = computed(() =>
  sections.map((section) => ({
    id: section.id,
    label: section.label,
    searchText: \`\${section.label} \${section.paragraphs.join(' ')}\`,
  })),
)
const { source, bindTarget } = useContentNavSource({ items })
<\/script>

<style lang="less" scoped>
.demo {
  display: grid;
  gap: 14px;
}

.controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 12px;
}

.controls-title {
  color: #34495e;
  font-size: 13px;
  font-weight: 600;
}

.controls label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #4f647a;
  font-size: 13px;
}

.controls-divider {
  width: 1px;
  height: 16px;
  background: #d7e1ec;
}

.controls button {
  padding: 4px 10px;
}

.tip {
  margin: 0;
  color: #4f647a;
  font-size: 13px;
  line-height: 1.6;
}

.stage {
  position: relative;
  height: 420px;
  overflow: hidden;
  border: 1px solid #dfe7f2;
  border-radius: 12px;
  background: #fff;
}

.article {
  height: 100%;
  overflow: auto;
  padding: 28px 88px 28px 28px;
}

.article-section {
  padding: 0 0 28px;
  scroll-margin-top: 16px;
}

.article-section + .article-section {
  border-top: 1px solid #eef3f8;
  padding-top: 28px;
}

.article-section h4 {
  margin: 0 0 12px;
  font-size: 18px;
  line-height: 1.4;
}

.article-section p {
  margin: 0;
  color: #4f647a;
  line-height: 1.7;
}

.article-section p + p {
  margin-top: 10px;
}

.nav {
  top: 0;
  right: 16px;
}
</style>
`,f=`<template>
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
        <tr-bubble-list
          ref="bubbleListRef"
          class="conversation-list"
          :messages="messages"
          :role-configs="roles"
          :content-nav="contentNavOptions"
        />
      </div>

      <tr-content-nav
        v-if="contentNavSource"
        :class="['nav', \`is-\${placement}\`]"
        :source="contentNavSource"
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
  TrContentNav,
  type BubbleListContentNavOptions,
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
    id: \`assistant-\${turn.userId}\`,
    role: 'assistant',
    content: turn.assistant,
  },
]) satisfies BubbleMessage[]

const jumpFlashClassName = 'demo-user-bubble-flash'
const jumpTransitionDuration = '220ms'
const jumpFeedbackDuration = 520

const scrollContainerRef = ref<HTMLElement | null>(null)
const bubbleListRef = ref<InstanceType<typeof TrBubbleList> | null>(null)
const placement = ref<'left' | 'right'>('right')
const activeId = ref(demoTurns[0].userId)
const query = ref('')
const searchEnabled = ref(false)
let jumpFeedbackTimer: ReturnType<typeof setTimeout> | null = null

const search = computed(() => (searchEnabled.value ? { placeholder: '搜索用户问题或回复关键词' } : false))
const contentNavSource = computed(() => bubbleListRef.value?.getContentNavSource())
const demoTurnById = new Map(demoTurns.map((turn) => [turn.userId, turn]))
const contentNavOptions = {
  itemResolver: ({ group }) => {
    const firstMessage = group.messages[0]
    if (firstMessage?.role !== 'user' || !firstMessage.id) {
      return false
    }

    const turn = demoTurnById.get(firstMessage.id)
    if (!turn) {
      return false
    }

    return {
      id: turn.userId,
      label: turn.user,
      searchText: \`\${turn.user} \${turn.assistant}\`,
      tooltipText: turn.user,
    }
  },
} satisfies BubbleListContentNavOptions

function findBubbleTarget(id: string) {
  const container = scrollContainerRef.value
  if (!container) {
    return null
  }

  return container.querySelector<HTMLElement>(\`.tr-bubble[data-content-nav-id="\${id}"]\`) ?? null
}

function clearJumpFeedback() {
  if (jumpFeedbackTimer) {
    clearTimeout(jumpFeedbackTimer)
    jumpFeedbackTimer = null
  }
}

function applyJumpFeedback(id: string) {
  const target = findBubbleTarget(id)

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
<\/script>

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
`,k=JSON.parse('{"title":"TrContentNav 内容导航组件","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/content-nav.md","filePath":"components/content-nav.md"}'),F={name:"components/content-nav.md"},N=Object.assign(F,{setup(x){const r=p();c(async()=>{r.value=(await i(async()=>{const{default:a}=await import("./chunks/basic-source.B3nrIhIX.js");return{default:a}},__vite__mapDeps([0,1,2]))).default});const o=h(!0),C=p();return c(async()=>{C.value=(await i(async()=>{const{default:a}=await import("./chunks/controlled-search.DSVwSbln.js");return{default:a}},__vite__mapDeps([3,1,2]))).default}),(a,e)=>{const l=m("ClientOnly");return D(),v("div",null,[e[2]||(e[2]=s("",10)),E(n(t(A),null,null,512),[[B,o.value]]),n(l,null,{default:d(()=>[n(t(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22controlled-search.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fcontent-nav%2Fcontrolled-search.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22controls%5C%22%3E%5Cn%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22placement%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cspan%3E%E5%81%9C%E9%9D%A0%E4%BD%8D%E7%BD%AE%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%3Clabel%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cinput%20v-model%3D%5C%22placement%5C%22%20type%3D%5C%22radio%5C%22%20value%3D%5C%22left%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%E5%B7%A6%E4%BE%A7%5Cn%20%20%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%20%20%20%20%20%20%20%20%3Clabel%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cinput%20v-model%3D%5C%22placement%5C%22%20type%3D%5C%22radio%5C%22%20value%3D%5C%22right%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%E5%8F%B3%E4%BE%A7%5Cn%20%20%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%20%20%3Clabel%3E%5Cn%20%20%20%20%20%20%20%20%3Cinput%20v-model%3D%5C%22searchEnabled%5C%22%20type%3D%5C%22checkbox%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%E6%98%BE%E7%A4%BA%E6%90%9C%E7%B4%A2%E5%8C%BA%5Cn%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22stage%5C%22%3E%5Cn%20%20%20%20%20%20%3Cdiv%20ref%3D%5C%22scrollContainerRef%5C%22%20class%3D%5C%22conversation%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Ctr-bubble-list%5Cn%20%20%20%20%20%20%20%20%20%20ref%3D%5C%22bubbleListRef%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20class%3D%5C%22conversation-list%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Amessages%3D%5C%22messages%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Arole-configs%3D%5C%22roles%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Acontent-nav%3D%5C%22contentNavOptions%5C%22%5Cn%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%20%20%3Ctr-content-nav%5Cn%20%20%20%20%20%20%20%20v-if%3D%5C%22contentNavSource%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%5B'nav'%2C%20%60is-%24%7Bplacement%7D%60%5D%5C%22%5Cn%20%20%20%20%20%20%20%20%3Asource%3D%5C%22contentNavSource%5C%22%5Cn%20%20%20%20%20%20%20%20%3Ascroll-container%3D%5C%22scrollContainerRef%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aplacement%3D%5C%22placement%5C%22%5Cn%20%20%20%20%20%20%20%20%3Asearch%3D%5C%22search%5C%22%5Cn%20%20%20%20%20%20%20%20v-model%3Aactive-id%3D%5C%22activeId%5C%22%5Cn%20%20%20%20%20%20%20%20v-model%3Aquery%3D%5C%22query%5C%22%5Cn%20%20%20%20%20%20%20%20%40select%3D%5C%22handleSelect%5C%22%5Cn%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20h%2C%20onBeforeUnmount%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%5Cn%20%20TrBubbleList%2C%5Cn%20%20TrContentNav%2C%5Cn%20%20type%20BubbleListContentNavOptions%2C%5Cn%20%20type%20BubbleMessage%2C%5Cn%20%20type%20BubbleRoleConfig%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cn%5Cntype%20DemoTurn%20%3D%20%7B%5Cn%20%20userId%3A%20string%5Cn%20%20user%3A%20string%5Cn%20%20assistant%3A%20string%5Cn%7D%5Cn%5Cnconst%20demoTurns%3A%20DemoTurn%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20userId%3A%20'u-discovery'%2C%5Cn%20%20%20%20user%3A%20'%E6%98%A0%E5%B0%84%E5%85%B3%E7%B3%BB%E5%BA%94%E8%AF%A5%E6%80%8E%E4%B9%88%E8%AE%BE%E8%AE%A1%EF%BC%9F'%2C%5Cn%20%20%20%20assistant%3A%5Cn%20%20%20%20%20%20'%E5%8F%AF%E4%BB%A5%E6%8A%8A%E6%AF%8F%E4%B8%80%E8%BD%AE%E7%94%A8%E6%88%B7%E6%8F%90%E9%97%AE%E8%A7%86%E4%B8%BA%E4%B8%80%E4%B8%AA%E7%A8%B3%E5%AE%9A%E9%94%9A%E7%82%B9%EF%BC%9A%E7%9B%AE%E5%BD%95%E6%95%B0%E6%8D%AE%E7%9B%B4%E6%8E%A5%E6%9D%A5%E6%BA%90%E4%BA%8E%E7%94%A8%E6%88%B7%E6%B6%88%E6%81%AF%E6%9C%AC%E8%BA%AB%EF%BC%8CBubbleList%20%E8%B4%9F%E8%B4%A3%E6%B8%B2%E6%9F%93%E5%AE%8C%E6%95%B4%E4%B8%8A%E4%B8%8B%E6%96%87%EF%BC%8CContentNav%20%E5%8F%AA%E6%B6%88%E8%B4%B9%E2%80%9C%E7%94%A8%E6%88%B7%E9%97%AE%E9%A2%98%E6%91%98%E8%A6%81%20%2B%20%E5%AF%B9%E5%BA%94%20DOM%20%E9%94%9A%E7%82%B9%E2%80%9D%E3%80%82%E8%BF%99%E6%A0%B7%E7%9B%AE%E5%BD%95%E3%80%81%E6%BB%9A%E5%8A%A8%E5%AE%9A%E4%BD%8D%E5%92%8C%E9%98%85%E8%AF%BB%E4%B8%8A%E4%B8%8B%E6%96%87%E4%BC%9A%E5%A4%A9%E7%84%B6%E4%BF%9D%E6%8C%81%E4%B8%80%E8%87%B4%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20userId%3A%20'u-feedback'%2C%5Cn%20%20%20%20user%3A%20'%E7%82%B9%E5%87%BB%E7%9B%AE%E5%BD%95%E4%B9%8B%E5%90%8E%EF%BC%8C%E6%88%91%E4%B8%8D%E6%83%B3%E5%8F%AA%E6%98%AF%E6%BB%9A%E8%BF%87%E5%8E%BB%E8%80%8C%E5%B7%B2%EF%BC%9B%E6%9C%80%E5%A5%BD%E8%AE%A9%E5%AF%B9%E5%BA%94%E7%9A%84%E7%94%A8%E6%88%B7%E6%B0%94%E6%B3%A1%E8%BD%BB%E5%BE%AE%E9%97%AA%E4%B8%80%E4%B8%8B%E3%80%82'%2C%5Cn%20%20%20%20assistant%3A%5Cn%20%20%20%20%20%20'%E8%BF%99%E9%9D%9E%E5%B8%B8%E9%80%82%E5%90%88%20jump%20feedback%E3%80%82%E5%8F%AA%E8%A6%81%E7%9B%AE%E5%BD%95%E9%A1%B9%E5%92%8C%E7%9C%9F%E5%AE%9E%E7%94%A8%E6%88%B7%E6%B0%94%E6%B3%A1%E4%B9%8B%E9%97%B4%E7%9A%84%E5%AE%9A%E4%BD%8D%E9%93%BE%E8%B7%AF%E7%A8%B3%E5%AE%9A%EF%BC%8C%E7%82%B9%E5%87%BB%E7%9B%AE%E5%BD%95%E4%B9%8B%E5%90%8E%E5%B0%B1%E5%8F%AF%E4%BB%A5%E7%9B%B4%E6%8E%A5%E7%BB%99%E5%AF%B9%E5%BA%94%E6%B0%94%E6%B3%A1%E5%8A%A0%E4%B8%80%E5%B1%82%E8%BD%BB%E5%8F%8D%E9%A6%88%EF%BC%8C%E8%AE%A9%E7%94%A8%E6%88%B7%E6%98%8E%E7%A1%AE%E7%9F%A5%E9%81%93%E5%BD%93%E5%89%8D%E8%B7%B3%E5%88%B0%E7%9A%84%E6%98%AF%E5%93%AA%E4%B8%80%E8%BD%AE%E5%AF%B9%E8%AF%9D%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20userId%3A%20'u-tooltip'%2C%5Cn%20%20%20%20user%3A%20'%E8%BF%99%E9%87%8C%E6%88%91%E8%BF%98%E6%83%B3%E9%A1%BA%E4%BE%BF%E9%AA%8C%E8%AF%81%E8%B6%85%E9%95%BF%E7%9B%AE%E5%BD%95%E6%96%87%E6%A1%88%E8%A2%AB%E6%88%AA%E6%96%AD%E4%B9%8B%E5%90%8E%EF%BC%8Ctooltip%20%E8%83%BD%E4%B8%8D%E8%83%BD%E5%AE%8C%E6%95%B4%E5%B1%95%E7%A4%BA%E3%80%82'%2C%5Cn%20%20%20%20assistant%3A%5Cn%20%20%20%20%20%20'%E9%95%BF%E6%96%87%E6%A1%88%E5%BE%88%E9%80%82%E5%90%88%E5%9C%A8%E7%9B%AE%E5%BD%95%E9%87%8C%E5%81%9A%E7%9C%81%E7%95%A5%EF%BC%8C%E5%9C%A8%20tooltip%20%E4%B8%AD%E4%BF%9D%E7%95%99%E5%AE%8C%E6%95%B4%E8%AF%AD%E4%B9%89%E3%80%82%E8%BF%99%E6%A0%B7%E5%AF%BC%E8%88%AA%E6%9C%AC%E8%BA%AB%E4%BE%9D%E7%84%B6%E7%B4%A7%E5%87%91%EF%BC%8C%E4%BD%86%E7%94%A8%E6%88%B7%E5%9C%A8%E9%9C%80%E8%A6%81%E6%97%B6%E5%8F%88%E8%83%BD%E8%8E%B7%E5%8F%96%E5%AE%8C%E6%95%B4%E9%97%AE%E9%A2%98%E6%8F%8F%E8%BF%B0%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20userId%3A%20'u-search'%2C%5Cn%20%20%20%20user%3A%20'%E7%A4%BA%E4%BE%8B%E9%87%8C%E5%86%8D%E5%B8%A6%E4%B8%80%E4%B8%AA%20controlled%20search%EF%BC%8C%E4%BC%9A%E4%B8%8D%E4%BC%9A%E6%9B%B4%E8%B4%B4%E8%BF%91%E7%9C%9F%E5%AE%9E%E4%BD%BF%E7%94%A8%E5%9C%BA%E6%99%AF%EF%BC%9F'%2C%5Cn%20%20%20%20assistant%3A%5Cn%20%20%20%20%20%20'%E4%BC%9A%E6%9B%B4%E8%B4%B4%E8%BF%91%E3%80%82%E7%9B%AE%E5%BD%95%E7%9A%84%20label%20%E5%8F%AF%E4%BB%A5%E4%BF%9D%E6%8C%81%E9%97%AE%E9%A2%98%E6%91%98%E8%A6%81%EF%BC%8CsearchText%20%E5%86%8D%E6%8A%8A%E7%94%A8%E6%88%B7%E6%8F%90%E9%97%AE%E5%92%8C%E5%8A%A9%E6%89%8B%E5%9B%9E%E5%A4%8D%E9%83%BD%E6%8B%BC%E6%8E%A5%E8%BF%9B%E5%8E%BB%EF%BC%8C%E8%BF%99%E6%A0%B7%E6%97%A2%E4%BF%9D%E7%95%99%E4%BA%86%E7%9B%AE%E5%BD%95%E8%AF%AD%E4%B9%89%EF%BC%8C%E4%B9%9F%E6%8F%90%E9%AB%98%E4%BA%86%E6%90%9C%E7%B4%A2%E5%8F%AC%E5%9B%9E%E7%8E%87%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'28px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'28px'%20%7D%20%7D)%5Cn%5Cnconst%20roles%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%7D%2C%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%7D%2C%5Cn%7D%20satisfies%20Record%3Cstring%2C%20BubbleRoleConfig%3E%5Cn%5Cnconst%20messages%20%3D%20demoTurns.flatMap((turn)%20%3D%3E%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20turn.userId%2C%5Cn%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20content%3A%20turn.user%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20%60assistant-%24%7Bturn.userId%7D%60%2C%5Cn%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20content%3A%20turn.assistant%2C%5Cn%20%20%7D%2C%5Cn%5D)%20satisfies%20BubbleMessage%5B%5D%5Cn%5Cnconst%20jumpFlashClassName%20%3D%20'demo-user-bubble-flash'%5Cnconst%20jumpTransitionDuration%20%3D%20'220ms'%5Cnconst%20jumpFeedbackDuration%20%3D%20520%5Cn%5Cnconst%20scrollContainerRef%20%3D%20ref%3CHTMLElement%20%7C%20null%3E(null)%5Cnconst%20bubbleListRef%20%3D%20ref%3CInstanceType%3Ctypeof%20TrBubbleList%3E%20%7C%20null%3E(null)%5Cnconst%20placement%20%3D%20ref%3C'left'%20%7C%20'right'%3E('right')%5Cnconst%20activeId%20%3D%20ref(demoTurns%5B0%5D.userId)%5Cnconst%20query%20%3D%20ref('')%5Cnconst%20searchEnabled%20%3D%20ref(false)%5Cnlet%20jumpFeedbackTimer%3A%20ReturnType%3Ctypeof%20setTimeout%3E%20%7C%20null%20%3D%20null%5Cn%5Cnconst%20search%20%3D%20computed(()%20%3D%3E%20(searchEnabled.value%20%3F%20%7B%20placeholder%3A%20'%E6%90%9C%E7%B4%A2%E7%94%A8%E6%88%B7%E9%97%AE%E9%A2%98%E6%88%96%E5%9B%9E%E5%A4%8D%E5%85%B3%E9%94%AE%E8%AF%8D'%20%7D%20%3A%20false))%5Cnconst%20contentNavSource%20%3D%20computed(()%20%3D%3E%20bubbleListRef.value%3F.getContentNavSource())%5Cnconst%20demoTurnById%20%3D%20new%20Map(demoTurns.map((turn)%20%3D%3E%20%5Bturn.userId%2C%20turn%5D))%5Cnconst%20contentNavOptions%20%3D%20%7B%5Cn%20%20itemResolver%3A%20(%7B%20group%20%7D)%20%3D%3E%20%7B%5Cn%20%20%20%20const%20firstMessage%20%3D%20group.messages%5B0%5D%5Cn%20%20%20%20if%20(firstMessage%3F.role%20!%3D%3D%20'user'%20%7C%7C%20!firstMessage.id)%20%7B%5Cn%20%20%20%20%20%20return%20false%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20const%20turn%20%3D%20demoTurnById.get(firstMessage.id)%5Cn%20%20%20%20if%20(!turn)%20%7B%5Cn%20%20%20%20%20%20return%20false%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20return%20%7B%5Cn%20%20%20%20%20%20id%3A%20turn.userId%2C%5Cn%20%20%20%20%20%20label%3A%20turn.user%2C%5Cn%20%20%20%20%20%20searchText%3A%20%60%24%7Bturn.user%7D%20%24%7Bturn.assistant%7D%60%2C%5Cn%20%20%20%20%20%20tooltipText%3A%20turn.user%2C%5Cn%20%20%20%20%7D%5Cn%20%20%7D%2C%5Cn%7D%20satisfies%20BubbleListContentNavOptions%5Cn%5Cnfunction%20findBubbleTarget(id%3A%20string)%20%7B%5Cn%20%20const%20container%20%3D%20scrollContainerRef.value%5Cn%20%20if%20(!container)%20%7B%5Cn%20%20%20%20return%20null%5Cn%20%20%7D%5Cn%5Cn%20%20return%20container.querySelector%3CHTMLElement%3E(%60.tr-bubble%5Bdata-content-nav-id%3D%5C%22%24%7Bid%7D%5C%22%5D%60)%20%3F%3F%20null%5Cn%7D%5Cn%5Cnfunction%20clearJumpFeedback()%20%7B%5Cn%20%20if%20(jumpFeedbackTimer)%20%7B%5Cn%20%20%20%20clearTimeout(jumpFeedbackTimer)%5Cn%20%20%20%20jumpFeedbackTimer%20%3D%20null%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnfunction%20applyJumpFeedback(id%3A%20string)%20%7B%5Cn%20%20const%20target%20%3D%20findBubbleTarget(id)%5Cn%5Cn%20%20if%20(!target)%20%7B%5Cn%20%20%20%20return%5Cn%20%20%7D%5Cn%5Cn%20%20clearJumpFeedback()%5Cn%20%20target.classList.remove(jumpFlashClassName)%5Cn%20%20void%20target.offsetWidth%5Cn%20%20target.classList.add(jumpFlashClassName)%5Cn%5Cn%20%20jumpFeedbackTimer%20%3D%20setTimeout(()%20%3D%3E%20%7B%5Cn%20%20%20%20target.classList.remove(jumpFlashClassName)%5Cn%20%20%20%20jumpFeedbackTimer%20%3D%20null%5Cn%20%20%7D%2C%20jumpFeedbackDuration)%5Cn%7D%5Cn%5Cnfunction%20handleSelect(item%3A%20%7B%20id%3A%20string%20%7D)%20%7B%5Cn%20%20activeId.value%20%3D%20item.id%5Cn%20%20applyJumpFeedback(item.id)%5Cn%7D%5Cn%5CnonBeforeUnmount(()%20%3D%3E%20%7B%5Cn%20%20clearJumpFeedback()%5Cn%7D)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20lang%3D%5C%22less%5C%22%20scoped%3E%5Cn.demo%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%2016px%3B%5Cn%7D%5Cn%5Cn.controls%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%2012px%2016px%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.placement%2C%5Cn.controls%20label%20%7B%5Cn%20%20display%3A%20inline-flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%206px%3B%5Cn%7D%5Cn%5Cn.stage%20%7B%5Cn%20%20position%3A%20relative%3B%5Cn%20%20height%3A%20480px%3B%5Cn%20%20overflow%3A%20hidden%3B%5Cn%20%20border%3A%201px%20solid%20%23dfe7f2%3B%5Cn%20%20border-radius%3A%2012px%3B%5Cn%20%20background%3A%20%23fff%3B%5Cn%7D%5Cn%5Cn.conversation%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20overflow%3A%20auto%3B%5Cn%7D%5Cn%5Cn.conversation-list%20%7B%5Cn%20%20--tr-bubble-list-gap%3A%2016px%3B%5Cn%20%20--tr-bubble-list-padding%3A%2024px%2072px%2040px%3B%5Cn%20%20--tr-bubble-max-width%3A%20560px%3B%5Cn%7D%5Cn%5Cn.nav%20%7B%5Cn%20%20top%3A%200%3B%5Cn%5Cn%20%20%26.is-right%20%7B%5Cn%20%20%20%20right%3A%2016px%3B%5Cn%20%20%7D%5Cn%5Cn%20%20%26.is-left%20%7B%5Cn%20%20%20%20left%3A%2016px%3B%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn%3Adeep(%5Bdata-role%3D'user'%5D)%20%7B%5Cn%20%20--tr-bubble-box-bg%3A%20var(--tr-color-primary-light)%3B%5Cn%20%20scroll-margin-top%3A%2020px%3B%5Cn%7D%5Cn%5Cn%3Adeep(%5Bdata-role%3D'user'%5D%20.tr-bubble__box)%20%7B%5Cn%20%20transition%3A%5Cn%20%20%20%20background-color%20v-bind(jumpTransitionDuration)%20ease%2C%5Cn%20%20%20%20box-shadow%20v-bind(jumpTransitionDuration)%20ease%3B%5Cn%7D%5Cn%5Cn%3Adeep(%5Bdata-role%3D'user'%5D.demo-user-bubble-flash%20.tr-bubble__box)%20%7B%5Cn%20%20--tr-bubble-box-bg%3A%20%23b9d7ff%3B%5Cn%20%20box-shadow%3A%5Cn%20%20%20%200%200%200%201px%20rgba(55%2C%20132%2C%20255%2C%200.2)%2C%5Cn%20%20%20%200%2012px%2028px%20-18px%20rgba(55%2C%20132%2C%20255%2C%200.45)%2C%5Cn%20%20%20%20var(--tr-bubble-box-shadow)%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{o.value=!1}),vueCode:t(f)},u({_:2},[C.value?{name:"vue",fn:d(()=>[n(t(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[3]||(e[3]=s("",5)),E(n(t(A),null,null,512),[[B,o.value]]),n(l,null,{default:d(()=>[n(t(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22basic-source.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fcontent-nav%2Fbasic-source.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22controls%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%20class%3D%5C%22controls-title%5C%22%3E%E5%B1%95%E5%BC%80%E6%A8%A1%E5%BC%8F%3C%2Fspan%3E%5Cn%5Cn%20%20%20%20%20%20%3Clabel%3E%5Cn%20%20%20%20%20%20%20%20%3Cinput%20v-model%3D%5C%22expandTrigger%5C%22%20type%3D%5C%22radio%5C%22%20value%3D%5C%22hover%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20hover%5Cn%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%5Cn%20%20%20%20%20%20%3Clabel%3E%5Cn%20%20%20%20%20%20%20%20%3Cinput%20v-model%3D%5C%22expandTrigger%5C%22%20type%3D%5C%22radio%5C%22%20value%3D%5C%22manual%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20manual%5Cn%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%5Cn%20%20%20%20%20%20%3Ctemplate%20v-if%3D%5C%22isManualMode%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cspan%20class%3D%5C%22controls-divider%5C%22%20aria-hidden%3D%5C%22true%5C%22%3E%3C%2Fspan%3E%5Cn%5Cn%20%20%20%20%20%20%20%20%3Clabel%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cinput%20v-model%3D%5C%22expanded%5C%22%20type%3D%5C%22checkbox%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%E5%B1%95%E5%BC%80%E7%9B%AE%E5%BD%95%E9%9D%A2%E6%9D%BF%5Cn%20%20%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%5Cn%20%20%20%20%20%20%20%20%3Cbutton%20type%3D%5C%22button%5C%22%20%40click%3D%5C%22expanded%20%3D%20false%5C%22%3E%E6%94%B6%E8%B5%B7%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%20%20%3Cbutton%20type%3D%5C%22button%5C%22%20%40click%3D%5C%22expanded%20%3D%20true%5C%22%3E%E5%B1%95%E5%BC%80%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cp%20class%3D%5C%22tip%5C%22%3E%5Cn%20%20%20%20%20%20%3Ctemplate%20v-if%3D%5C%22isManualMode%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%E5%BD%93%E5%89%8D%E4%B8%BA%20%3Ccode%3Emanual%3C%2Fcode%3E%20%E6%A8%A1%E5%BC%8F%EF%BC%8C%E7%9B%AE%E5%BD%95%E9%9D%A2%E6%9D%BF%E4%B8%8D%E5%86%8D%E8%B7%9F%E9%9A%8F%20hover%20%E8%87%AA%E5%8A%A8%E5%B1%95%E5%BC%80%EF%BC%8C%E6%94%B9%E7%94%B1%E5%A4%96%E9%83%A8%20%3Ccode%3Ev-model%3Aexpanded%3C%2Fcode%3E%20%E6%8E%A7%E5%88%B6%E3%80%82%5Cn%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%20%20%3Ctemplate%20v-else%3E%20%E5%BD%93%E5%89%8D%E4%B8%BA%20%3Ccode%3Ehover%3C%2Fcode%3E%20%E6%A8%A1%E5%BC%8F%EF%BC%8C%E9%BC%A0%E6%A0%87%E6%82%AC%E6%B5%AE%E6%88%96%E8%81%9A%E7%84%A6%E5%88%B0%E7%9B%AE%E5%BD%95%E9%9D%A2%E6%9D%BF%E6%97%B6%E4%BC%9A%E8%87%AA%E5%8A%A8%E5%B1%95%E5%BC%80%E3%80%82%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%3C%2Fp%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22stage%5C%22%3E%5Cn%20%20%20%20%20%20%3Cdiv%20ref%3D%5C%22scrollContainerRef%5C%22%20class%3D%5C%22article%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Csection%20v-for%3D%5C%22section%20in%20sections%5C%22%20%3Akey%3D%5C%22section.id%5C%22%20%3Aref%3D%5C%22bindTarget(section.id)%5C%22%20class%3D%5C%22article-section%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Ch4%3E%7B%7B%20section.label%20%7D%7D%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cp%20v-for%3D%5C%22paragraph%20in%20section.paragraphs%5C%22%20%3Akey%3D%5C%22paragraph%5C%22%3E%7B%7B%20paragraph%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fsection%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%20%20%3Ctr-content-nav%5Cn%20%20%20%20%20%20%20%20class%3D%5C%22nav%5C%22%5Cn%20%20%20%20%20%20%20%20%3Asource%3D%5C%22source%5C%22%5Cn%20%20%20%20%20%20%20%20%3Ascroll-container%3D%5C%22scrollContainerRef%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aexpand-trigger%3D%5C%22expandTrigger%5C%22%5Cn%20%20%20%20%20%20%20%20v-model%3Aexpanded%3D%5C%22expanded%5C%22%5Cn%20%20%20%20%20%20%20%20%3Asearch%3D%5C%22%7B%20placeholder%3A%20'%E6%90%9C%E7%B4%A2%E7%AB%A0%E8%8A%82'%20%7D%5C%22%5Cn%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrContentNav%2C%20useContentNavSource%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cntype%20DemoSection%20%3D%20%7B%5Cn%20%20id%3A%20string%5Cn%20%20label%3A%20string%5Cn%20%20paragraphs%3A%20string%5B%5D%5Cn%7D%5Cn%5Cnconst%20sections%3A%20DemoSection%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'overview'%2C%5Cn%20%20%20%20label%3A%20'Overview'%2C%5Cn%20%20%20%20paragraphs%3A%20%5B'ContentNav%20%E9%80%82%E5%90%88%E7%94%A8%E4%BA%8E%E9%95%BF%E5%86%85%E5%AE%B9%E5%8C%BA%E5%9F%9F%E7%9A%84%E5%BF%AB%E9%80%9F%E5%AE%9A%E4%BD%8D%E3%80%82'%2C%20'%E6%8E%A5%E5%85%A5%E6%97%B6%E5%8F%AA%E9%9C%80%E8%A6%81%E5%87%86%E5%A4%87%E7%9B%AE%E5%BD%95%E9%A1%B9%E5%92%8C%E7%9C%9F%E5%AE%9E%E6%BB%9A%E5%8A%A8%E7%9B%AE%E6%A0%87%E4%B9%8B%E9%97%B4%E7%9A%84%E6%98%A0%E5%B0%84%E5%85%B3%E7%B3%BB%E3%80%82'%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'structure'%2C%5Cn%20%20%20%20label%3A%20'Structure'%2C%5Cn%20%20%20%20paragraphs%3A%20%5B'%E6%8E%A8%E8%8D%90%E6%8A%8A%E6%AF%8F%E4%B8%AA%E7%AB%A0%E8%8A%82%E6%A0%87%E9%A2%98%E6%88%96%E6%AE%B5%E8%90%BD%E5%AE%B9%E5%99%A8%E4%BD%9C%E4%B8%BA%E6%BB%9A%E5%8A%A8%E7%9B%AE%E6%A0%87%E3%80%82'%2C%20'%E7%9B%AE%E5%BD%95%E6%96%87%E6%9C%AC%E5%8F%AF%E4%BB%A5%E4%BF%9D%E6%8C%81%E7%AE%80%E6%B4%81%EF%BC%8C%E6%90%9C%E7%B4%A2%E6%96%87%E6%9C%AC%E5%86%8D%E8%A1%A5%E5%85%85%E6%9B%B4%E5%A4%9A%E4%B8%8A%E4%B8%8B%E6%96%87%E3%80%82'%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'interaction'%2C%5Cn%20%20%20%20label%3A%20'Interaction'%2C%5Cn%20%20%20%20paragraphs%3A%20%5B%5Cn%20%20%20%20%20%20'%E5%BD%93%E7%94%A8%E6%88%B7%E7%82%B9%E5%87%BB%E7%9B%AE%E5%BD%95%E9%A1%B9%E6%97%B6%EF%BC%8CContentNav%20%E4%BC%9A%E6%BB%9A%E5%8A%A8%E5%88%B0%E5%AF%B9%E5%BA%94%E7%9B%AE%E6%A0%87%E3%80%82'%2C%5Cn%20%20%20%20%20%20'%E6%BB%9A%E5%8A%A8%E8%BF%87%E7%A8%8B%E4%B8%AD%EF%BC%8C%E5%BD%93%E5%89%8D%E6%BF%80%E6%B4%BB%E9%A1%B9%E4%B9%9F%E4%BC%9A%E9%9A%8F%E7%9D%80%E5%8F%AF%E8%A7%81%E5%8C%BA%E5%9F%9F%E8%87%AA%E5%8A%A8%E6%9B%B4%E6%96%B0%E3%80%82'%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'tips'%2C%5Cn%20%20%20%20label%3A%20'Tips'%2C%5Cn%20%20%20%20paragraphs%3A%20%5B%5Cn%20%20%20%20%20%20'%E5%A6%82%E6%9E%9C%E5%86%85%E5%AE%B9%E8%8A%82%E7%82%B9%E4%BC%9A%E5%8A%A8%E6%80%81%E5%A2%9E%E5%88%A0%EF%BC%8C%E4%BC%98%E5%85%88%E9%80%9A%E8%BF%87%20useContentNavSource%20%E7%BB%9F%E4%B8%80%E7%BB%B4%E6%8A%A4%20source%20%E5%92%8C%20target%20%E7%BB%91%E5%AE%9A%E3%80%82'%2C%5Cn%20%20%20%20%20%20'%E8%BF%99%E6%A0%B7%E7%9B%AE%E5%BD%95%E9%A1%B9%E3%80%81%E6%BB%9A%E5%8A%A8%E5%AE%9A%E4%BD%8D%E5%92%8C%E6%BF%80%E6%B4%BB%E6%80%81%E8%83%BD%E5%A7%8B%E7%BB%88%E4%BF%9D%E6%8C%81%E4%B8%80%E8%87%B4%E3%80%82'%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20scrollContainerRef%20%3D%20ref%3CHTMLElement%20%7C%20null%3E(null)%5Cnconst%20expandTrigger%20%3D%20ref%3C'hover'%20%7C%20'manual'%3E('hover')%5Cnconst%20expanded%20%3D%20ref(false)%5Cnconst%20isManualMode%20%3D%20computed(()%20%3D%3E%20expandTrigger.value%20%3D%3D%3D%20'manual')%5Cnconst%20items%20%3D%20computed(()%20%3D%3E%5Cn%20%20sections.map((section)%20%3D%3E%20(%7B%5Cn%20%20%20%20id%3A%20section.id%2C%5Cn%20%20%20%20label%3A%20section.label%2C%5Cn%20%20%20%20searchText%3A%20%60%24%7Bsection.label%7D%20%24%7Bsection.paragraphs.join('%20')%7D%60%2C%5Cn%20%20%7D))%2C%5Cn)%5Cnconst%20%7B%20source%2C%20bindTarget%20%7D%20%3D%20useContentNavSource(%7B%20items%20%7D)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20lang%3D%5C%22less%5C%22%20scoped%3E%5Cn.demo%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%2014px%3B%5Cn%7D%5Cn%5Cn.controls%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%2010px%2012px%3B%5Cn%7D%5Cn%5Cn.controls-title%20%7B%5Cn%20%20color%3A%20%2334495e%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20font-weight%3A%20600%3B%5Cn%7D%5Cn%5Cn.controls%20label%20%7B%5Cn%20%20display%3A%20inline-flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%206px%3B%5Cn%20%20color%3A%20%234f647a%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.controls-divider%20%7B%5Cn%20%20width%3A%201px%3B%5Cn%20%20height%3A%2016px%3B%5Cn%20%20background%3A%20%23d7e1ec%3B%5Cn%7D%5Cn%5Cn.controls%20button%20%7B%5Cn%20%20padding%3A%204px%2010px%3B%5Cn%7D%5Cn%5Cn.tip%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20color%3A%20%234f647a%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20line-height%3A%201.6%3B%5Cn%7D%5Cn%5Cn.stage%20%7B%5Cn%20%20position%3A%20relative%3B%5Cn%20%20height%3A%20420px%3B%5Cn%20%20overflow%3A%20hidden%3B%5Cn%20%20border%3A%201px%20solid%20%23dfe7f2%3B%5Cn%20%20border-radius%3A%2012px%3B%5Cn%20%20background%3A%20%23fff%3B%5Cn%7D%5Cn%5Cn.article%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20overflow%3A%20auto%3B%5Cn%20%20padding%3A%2028px%2088px%2028px%2028px%3B%5Cn%7D%5Cn%5Cn.article-section%20%7B%5Cn%20%20padding%3A%200%200%2028px%3B%5Cn%20%20scroll-margin-top%3A%2016px%3B%5Cn%7D%5Cn%5Cn.article-section%20%2B%20.article-section%20%7B%5Cn%20%20border-top%3A%201px%20solid%20%23eef3f8%3B%5Cn%20%20padding-top%3A%2028px%3B%5Cn%7D%5Cn%5Cn.article-section%20h4%20%7B%5Cn%20%20margin%3A%200%200%2012px%3B%5Cn%20%20font-size%3A%2018px%3B%5Cn%20%20line-height%3A%201.4%3B%5Cn%7D%5Cn%5Cn.article-section%20p%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20color%3A%20%234f647a%3B%5Cn%20%20line-height%3A%201.7%3B%5Cn%7D%5Cn%5Cn.article-section%20p%20%2B%20p%20%7B%5Cn%20%20margin-top%3A%2010px%3B%5Cn%7D%5Cn%5Cn.nav%20%7B%5Cn%20%20top%3A%200%3B%5Cn%20%20right%3A%2016px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{o.value=!1}),vueCode:t(g)},u({_:2},[r.value?{name:"vue",fn:d(()=>[n(t(r))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[4]||(e[4]=s("",19))])}}});export{k as __pageData,N as default};
