const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/basic-source.D8ZagBfQ.js","assets/chunks/framework.DevOmPuU.js","assets/chunks/theme.D9F6VUla.js","assets/chunks/controlled-search.Dkmmf204.js"])))=>i.map(i=>d[i]);
import{aD as c,bQ as l,aZ as b,aL as D,v as h,H as i,bL as E,bB as B,J as e,bk as t,bJ as r,G as u,b7 as p,aU as v}from"./chunks/framework.DevOmPuU.js";import{L as A,N as m}from"./chunks/index.BTkQYOD4.js";const f=`<template>
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
        <section
          v-for="section in sections"
          :key="section.id"
          :data-content-nav-id="section.id"
          class="article-section"
        >
          <h4>{{ section.label }}</h4>
          <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
        </section>
      </div>

      <tr-content-nav
        class="nav"
        :items="items"
        :scroll-container="scrollContainerRef"
        :expand-trigger="expandTrigger"
        v-model:expanded="expanded"
        :search="{ placeholder: '搜索章节' }"
        @select="handleSelect"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { TrContentNav } from '@opentiny/tiny-robot'

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
      '推荐直接让章节节点带上 data-content-nav-id，并与目录项 id 保持一致。',
      '这样目录项、滚动定位和激活态可以由 TrContentNav 在内部统一处理。',
    ],
  },
]

const scrollContainerRef = ref<HTMLElement | null>(null)
const expandTrigger = ref<'hover' | 'manual'>('hover')
const expanded = ref(false)
const isManualMode = computed(() => expandTrigger.value === 'manual')
const jumpFlashClassName = 'article-section-flash'
const jumpTransitionDuration = '220ms'
const jumpFeedbackDuration = 520
let jumpFeedbackTimer: ReturnType<typeof setTimeout> | null = null

const items = computed(() =>
  sections.map((section) => ({
    id: section.id,
    label: section.label,
    searchText: \`\${section.label} \${section.paragraphs.join(' ')}\`,
  })),
)

function queryTargetById(root: ParentNode, id: string) {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return root.querySelector<HTMLElement>(\`[data-content-nav-id="\${CSS.escape(id)}"]\`)
  }

  return Array.from(root.querySelectorAll<HTMLElement>('[data-content-nav-id]')).find(
    (entry) => entry.dataset.contentNavId === id,
  )
}

function findSectionTarget(id: string) {
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
  const target = findSectionTarget(id)
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
  applyJumpFeedback(item.id)
}

onBeforeUnmount(() => {
  clearJumpFeedback()
})
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
  padding: 28px;
}

.article-section {
  padding: 28px;
  scroll-margin-top: 16px;
  transition:
    background-color v-bind(jumpTransitionDuration) ease,
    box-shadow v-bind(jumpTransitionDuration) ease,
    border-color v-bind(jumpTransitionDuration) ease;
}

.article-section + .article-section {
  border-top: 1px solid #eef3f8;
  padding-top: 28px;
}

.article-section.article-section-flash {
  background: linear-gradient(180deg, rgba(185, 215, 255, 0.42) 0%, rgba(185, 215, 255, 0.14) 100%);
  box-shadow: 0 12px 28px -22px rgba(55, 132, 255, 0.55);
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
`,g=`<template>
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
        :class="['nav', \`is-\${placement}\`]"
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
    id: \`assistant-\${turn.userId}\`,
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
    searchText: \`\${turn.user} \${turn.assistant}\`,
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
    return root.querySelector<HTMLElement>(\`[data-content-nav-id="\${CSS.escape(id)}"]\`)
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
`,k=JSON.parse('{"title":"TrContentNav 内容导航组件","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/content-nav.md","filePath":"components/content-nav.md"}'),F={name:"components/content-nav.md"},_=Object.assign(F,{setup(x){const d=p();c(async()=>{d.value=(await l(async()=>{const{default:o}=await import("./chunks/basic-source.D8ZagBfQ.js");return{default:o}},__vite__mapDeps([0,1,2]))).default});const a=v(!0),C=p();return c(async()=>{C.value=(await l(async()=>{const{default:o}=await import("./chunks/controlled-search.Dkmmf204.js");return{default:o}},__vite__mapDeps([3,1,2]))).default}),(o,n)=>{const s=b("ClientOnly");return D(),h("div",null,[n[2]||(n[2]=i('<h1 id="trcontentnav-内容导航组件" tabindex="-1">TrContentNav 内容导航组件 <a class="header-anchor" href="#trcontentnav-内容导航组件" aria-label="Permalink to &quot;TrContentNav 内容导航组件&quot;">​</a></h1><p><code>TrContentNav</code> 用于长内容区域和长对话场景的目录导航。</p><p>组件通过 <code>items</code> 渲染目录项，并根据 <code>item.id</code> 定位目标节点。目标节点默认使用 <code>data-content-nav-id</code> 标记。</p><p>默认情况下，组件使用 <code>expandTrigger=&quot;hover&quot;</code>，在鼠标悬浮或焦点进入时自动展开。若需要由外部控制展开状态，可将 <code>expandTrigger</code> 设为 <code>manual</code>，并配合 <code>v-model:expanded</code> 使用。</p><h2 id="接入说明" tabindex="-1">接入说明 <a class="header-anchor" href="#接入说明" aria-label="Permalink to &quot;接入说明&quot;">​</a></h2><p>使用组件时，通常只需要准备以下内容：</p><ul><li>目录项列表</li><li>与 <code>id</code> 对应的目标节点标记（默认使用 <code>data-content-nav-id</code>）</li></ul><p>推荐接入方式如下：</p><ul><li><code>TrBubbleList</code> 场景：通过 <code>BubbleProvider</code> 的 <code>boxRendererMatches.attributes</code> 为目标节点设置 <code>data-content-nav-id</code></li><li>普通滚动容器：直接在章节节点上设置 <code>data-content-nav-id</code></li></ul><p>传入 <code>scrollContainer</code> 时，组件仅在该容器内查找目标节点；未传入时，在全局文档范围内查找。</p><p>在 Bubble 场景下，<code>data-content-nav-id</code> 应标记在实际滚动目标节点上。使用默认 Box renderer 时，该节点通常为 <code>.tr-bubble__box</code>，而非整个 <code>.tr-bubble</code> 容器。</p><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="bubblelist-场景" tabindex="-1">BubbleList 场景 <a class="header-anchor" href="#bubblelist-场景" aria-label="Permalink to &quot;BubbleList 场景&quot;">​</a></h3><p>在聊天场景中，建议由调用方维护 <code>items</code>，并通过 <code>BubbleProvider</code> 为目标气泡节点设置 <code>data-content-nav-id</code>。</p>',14)),E(e(t(A),null,null,512),[[B,a.value]]),e(s,null,{default:r(()=>[e(t(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22controlled-search.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fcontent-nav%2Fcontrolled-search.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22controls%5C%22%3E%5Cn%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22placement%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cspan%3E%E5%81%9C%E9%9D%A0%E4%BD%8D%E7%BD%AE%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%3Clabel%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cinput%20v-model%3D%5C%22placement%5C%22%20type%3D%5C%22radio%5C%22%20value%3D%5C%22left%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%E5%B7%A6%E4%BE%A7%5Cn%20%20%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%20%20%20%20%20%20%20%20%3Clabel%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cinput%20v-model%3D%5C%22placement%5C%22%20type%3D%5C%22radio%5C%22%20value%3D%5C%22right%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%E5%8F%B3%E4%BE%A7%5Cn%20%20%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%20%20%3Clabel%3E%5Cn%20%20%20%20%20%20%20%20%3Cinput%20v-model%3D%5C%22searchEnabled%5C%22%20type%3D%5C%22checkbox%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%E6%98%BE%E7%A4%BA%E6%90%9C%E7%B4%A2%E5%8C%BA%5Cn%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22stage%5C%22%3E%5Cn%20%20%20%20%20%20%3Cdiv%20ref%3D%5C%22scrollContainerRef%5C%22%20class%3D%5C%22conversation%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Ctr-bubble-provider%20%3Abox-renderer-matches%3D%5C%22boxRendererMatches%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Ctr-bubble-list%20class%3D%5C%22conversation-list%5C%22%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Ftr-bubble-provider%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%20%20%3Ctr-content-nav%5Cn%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%5B'nav'%2C%20%60is-%24%7Bplacement%7D%60%5D%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aitems%3D%5C%22contentNavItems%5C%22%5Cn%20%20%20%20%20%20%20%20%3Ascroll-container%3D%5C%22scrollContainerRef%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aplacement%3D%5C%22placement%5C%22%5Cn%20%20%20%20%20%20%20%20%3Asearch%3D%5C%22search%5C%22%5Cn%20%20%20%20%20%20%20%20v-model%3Aactive-id%3D%5C%22activeId%5C%22%5Cn%20%20%20%20%20%20%20%20v-model%3Aquery%3D%5C%22query%5C%22%5Cn%20%20%20%20%20%20%20%20%40select%3D%5C%22handleSelect%5C%22%5Cn%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20h%2C%20onBeforeUnmount%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%5Cn%20%20TrBubbleList%2C%5Cn%20%20TrBubbleProvider%2C%5Cn%20%20TrContentNav%2C%5Cn%20%20BubbleRenderers%2C%5Cn%20%20type%20BubbleBoxRendererMatch%2C%5Cn%20%20type%20BubbleMessage%2C%5Cn%20%20type%20BubbleRoleConfig%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cn%5Cntype%20DemoTurn%20%3D%20%7B%5Cn%20%20userId%3A%20string%5Cn%20%20user%3A%20string%5Cn%20%20assistant%3A%20string%5Cn%7D%5Cn%5Cnconst%20demoTurns%3A%20DemoTurn%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20userId%3A%20'u-discovery'%2C%5Cn%20%20%20%20user%3A%20'%E6%98%A0%E5%B0%84%E5%85%B3%E7%B3%BB%E5%BA%94%E8%AF%A5%E6%80%8E%E4%B9%88%E8%AE%BE%E8%AE%A1%EF%BC%9F'%2C%5Cn%20%20%20%20assistant%3A%5Cn%20%20%20%20%20%20'%E5%8F%AF%E4%BB%A5%E6%8A%8A%E6%AF%8F%E4%B8%80%E8%BD%AE%E7%94%A8%E6%88%B7%E6%8F%90%E9%97%AE%E8%A7%86%E4%B8%BA%E4%B8%80%E4%B8%AA%E7%A8%B3%E5%AE%9A%E9%94%9A%E7%82%B9%EF%BC%9A%E7%9B%AE%E5%BD%95%E6%95%B0%E6%8D%AE%E7%9B%B4%E6%8E%A5%E6%9D%A5%E6%BA%90%E4%BA%8E%E7%94%A8%E6%88%B7%E6%B6%88%E6%81%AF%E6%9C%AC%E8%BA%AB%EF%BC%8CBubbleList%20%E8%B4%9F%E8%B4%A3%E6%B8%B2%E6%9F%93%E5%AE%8C%E6%95%B4%E4%B8%8A%E4%B8%8B%E6%96%87%EF%BC%8CContentNav%20%E5%8F%AA%E6%B6%88%E8%B4%B9%E2%80%9C%E7%94%A8%E6%88%B7%E9%97%AE%E9%A2%98%E6%91%98%E8%A6%81%20%2B%20%E5%AF%B9%E5%BA%94%20DOM%20%E9%94%9A%E7%82%B9%E2%80%9D%E3%80%82%E8%BF%99%E6%A0%B7%E7%9B%AE%E5%BD%95%E3%80%81%E6%BB%9A%E5%8A%A8%E5%AE%9A%E4%BD%8D%E5%92%8C%E9%98%85%E8%AF%BB%E4%B8%8A%E4%B8%8B%E6%96%87%E4%BC%9A%E5%A4%A9%E7%84%B6%E4%BF%9D%E6%8C%81%E4%B8%80%E8%87%B4%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20userId%3A%20'u-feedback'%2C%5Cn%20%20%20%20user%3A%20'%E7%82%B9%E5%87%BB%E7%9B%AE%E5%BD%95%E4%B9%8B%E5%90%8E%EF%BC%8C%E6%88%91%E4%B8%8D%E6%83%B3%E5%8F%AA%E6%98%AF%E6%BB%9A%E8%BF%87%E5%8E%BB%E8%80%8C%E5%B7%B2%EF%BC%9B%E6%9C%80%E5%A5%BD%E8%AE%A9%E5%AF%B9%E5%BA%94%E7%9A%84%E7%94%A8%E6%88%B7%E6%B0%94%E6%B3%A1%E8%BD%BB%E5%BE%AE%E9%97%AA%E4%B8%80%E4%B8%8B%E3%80%82'%2C%5Cn%20%20%20%20assistant%3A%5Cn%20%20%20%20%20%20'%E8%BF%99%E9%9D%9E%E5%B8%B8%E9%80%82%E5%90%88%20jump%20feedback%E3%80%82%E5%8F%AA%E8%A6%81%E7%9B%AE%E5%BD%95%E9%A1%B9%E5%92%8C%E7%9C%9F%E5%AE%9E%E7%94%A8%E6%88%B7%E6%B0%94%E6%B3%A1%E4%B9%8B%E9%97%B4%E7%9A%84%E5%AE%9A%E4%BD%8D%E9%93%BE%E8%B7%AF%E7%A8%B3%E5%AE%9A%EF%BC%8C%E7%82%B9%E5%87%BB%E7%9B%AE%E5%BD%95%E4%B9%8B%E5%90%8E%E5%B0%B1%E5%8F%AF%E4%BB%A5%E7%9B%B4%E6%8E%A5%E7%BB%99%E5%AF%B9%E5%BA%94%E6%B0%94%E6%B3%A1%E5%8A%A0%E4%B8%80%E5%B1%82%E8%BD%BB%E5%8F%8D%E9%A6%88%EF%BC%8C%E8%AE%A9%E7%94%A8%E6%88%B7%E6%98%8E%E7%A1%AE%E7%9F%A5%E9%81%93%E5%BD%93%E5%89%8D%E8%B7%B3%E5%88%B0%E7%9A%84%E6%98%AF%E5%93%AA%E4%B8%80%E8%BD%AE%E5%AF%B9%E8%AF%9D%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20userId%3A%20'u-tooltip'%2C%5Cn%20%20%20%20user%3A%20'%E8%BF%99%E9%87%8C%E6%88%91%E8%BF%98%E6%83%B3%E9%A1%BA%E4%BE%BF%E9%AA%8C%E8%AF%81%E8%B6%85%E9%95%BF%E7%9B%AE%E5%BD%95%E6%96%87%E6%A1%88%E8%A2%AB%E6%88%AA%E6%96%AD%E4%B9%8B%E5%90%8E%EF%BC%8Ctooltip%20%E8%83%BD%E4%B8%8D%E8%83%BD%E5%AE%8C%E6%95%B4%E5%B1%95%E7%A4%BA%E3%80%82'%2C%5Cn%20%20%20%20assistant%3A%5Cn%20%20%20%20%20%20'%E9%95%BF%E6%96%87%E6%A1%88%E5%BE%88%E9%80%82%E5%90%88%E5%9C%A8%E7%9B%AE%E5%BD%95%E9%87%8C%E5%81%9A%E7%9C%81%E7%95%A5%EF%BC%8C%E5%9C%A8%20tooltip%20%E4%B8%AD%E4%BF%9D%E7%95%99%E5%AE%8C%E6%95%B4%E8%AF%AD%E4%B9%89%E3%80%82%E8%BF%99%E6%A0%B7%E5%AF%BC%E8%88%AA%E6%9C%AC%E8%BA%AB%E4%BE%9D%E7%84%B6%E7%B4%A7%E5%87%91%EF%BC%8C%E4%BD%86%E7%94%A8%E6%88%B7%E5%9C%A8%E9%9C%80%E8%A6%81%E6%97%B6%E5%8F%88%E8%83%BD%E8%8E%B7%E5%8F%96%E5%AE%8C%E6%95%B4%E9%97%AE%E9%A2%98%E6%8F%8F%E8%BF%B0%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20userId%3A%20'u-search'%2C%5Cn%20%20%20%20user%3A%20'%E7%A4%BA%E4%BE%8B%E9%87%8C%E5%86%8D%E5%B8%A6%E4%B8%80%E4%B8%AA%20controlled%20search%EF%BC%8C%E4%BC%9A%E4%B8%8D%E4%BC%9A%E6%9B%B4%E8%B4%B4%E8%BF%91%E7%9C%9F%E5%AE%9E%E4%BD%BF%E7%94%A8%E5%9C%BA%E6%99%AF%EF%BC%9F'%2C%5Cn%20%20%20%20assistant%3A%5Cn%20%20%20%20%20%20'%E4%BC%9A%E6%9B%B4%E8%B4%B4%E8%BF%91%E3%80%82%E7%9B%AE%E5%BD%95%E7%9A%84%20label%20%E5%8F%AF%E4%BB%A5%E4%BF%9D%E6%8C%81%E9%97%AE%E9%A2%98%E6%91%98%E8%A6%81%EF%BC%8CsearchText%20%E5%86%8D%E6%8A%8A%E7%94%A8%E6%88%B7%E6%8F%90%E9%97%AE%E5%92%8C%E5%8A%A9%E6%89%8B%E5%9B%9E%E5%A4%8D%E9%83%BD%E6%8B%BC%E6%8E%A5%E8%BF%9B%E5%8E%BB%EF%BC%8C%E8%BF%99%E6%A0%B7%E6%97%A2%E4%BF%9D%E7%95%99%E4%BA%86%E7%9B%AE%E5%BD%95%E8%AF%AD%E4%B9%89%EF%BC%8C%E4%B9%9F%E6%8F%90%E9%AB%98%E4%BA%86%E6%90%9C%E7%B4%A2%E5%8F%AC%E5%9B%9E%E7%8E%87%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'28px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'28px'%20%7D%20%7D)%5Cn%5Cnconst%20roles%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%7D%2C%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%7D%2C%5Cn%7D%20satisfies%20Record%3Cstring%2C%20BubbleRoleConfig%3E%5Cn%5Cnconst%20messages%20%3D%20demoTurns.flatMap((turn)%20%3D%3E%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20turn.userId%2C%5Cn%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20content%3A%20turn.user%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20%60assistant-%24%7Bturn.userId%7D%60%2C%5Cn%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20content%3A%20turn.assistant%2C%5Cn%20%20%7D%2C%5Cn%5D)%20satisfies%20BubbleMessage%5B%5D%5Cn%5Cnconst%20jumpFlashClassName%20%3D%20'demo-user-box-flash'%5Cnconst%20jumpTransitionDuration%20%3D%20'220ms'%5Cnconst%20jumpFeedbackDuration%20%3D%20520%5Cn%5Cnconst%20scrollContainerRef%20%3D%20ref%3CHTMLElement%20%7C%20null%3E(null)%5Cnconst%20placement%20%3D%20ref%3C'left'%20%7C%20'right'%3E('right')%5Cnconst%20activeId%20%3D%20ref(demoTurns%5B0%5D.userId)%5Cnconst%20query%20%3D%20ref('')%5Cnconst%20searchEnabled%20%3D%20ref(false)%5Cnlet%20jumpFeedbackTimer%3A%20ReturnType%3Ctypeof%20setTimeout%3E%20%7C%20null%20%3D%20null%5Cn%5Cnconst%20search%20%3D%20computed(()%20%3D%3E%20(searchEnabled.value%20%3F%20%7B%20placeholder%3A%20'%E6%90%9C%E7%B4%A2%E7%94%A8%E6%88%B7%E9%97%AE%E9%A2%98%E6%88%96%E5%9B%9E%E5%A4%8D%E5%85%B3%E9%94%AE%E8%AF%8D'%20%7D%20%3A%20false))%5Cnconst%20contentNavItems%20%3D%20computed(()%20%3D%3E%5Cn%20%20demoTurns.map((turn)%20%3D%3E%20(%7B%5Cn%20%20%20%20id%3A%20turn.userId%2C%5Cn%20%20%20%20label%3A%20turn.user%2C%5Cn%20%20%20%20searchText%3A%20%60%24%7Bturn.user%7D%20%24%7Bturn.assistant%7D%60%2C%5Cn%20%20%20%20tooltipText%3A%20turn.user%2C%5Cn%20%20%7D))%2C%5Cn)%5Cn%5Cnconst%20boxRendererMatches%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20find%3A%20(messages)%20%3D%3E%20messages%5B0%5D%3F.role%20%3D%3D%3D%20'user'%2C%5Cn%20%20%20%20renderer%3A%20BubbleRenderers.Box%2C%5Cn%20%20%20%20priority%3A%20999%2C%5Cn%20%20%20%20attributes%3A%20(messages%2C%20_content%2C%20contentIndex)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20if%20(contentIndex%20!%3D%3D%20undefined%20%26%26%20contentIndex%20%3E%200)%20%7B%5Cn%20%20%20%20%20%20%20%20return%20undefined%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20const%20firstMessage%20%3D%20messages%5B0%5D%5Cn%20%20%20%20%20%20if%20(!firstMessage%3F.id)%20%7B%5Cn%20%20%20%20%20%20%20%20return%20undefined%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20return%20%7B%5Cn%20%20%20%20%20%20%20%20'data-content-nav-id'%3A%20firstMessage.id%2C%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%5D%20satisfies%20BubbleBoxRendererMatch%5B%5D%5Cn%5Cnfunction%20queryTargetById(root%3A%20ParentNode%2C%20id%3A%20string)%20%7B%5Cn%20%20if%20(typeof%20CSS%20!%3D%3D%20'undefined'%20%26%26%20typeof%20CSS.escape%20%3D%3D%3D%20'function')%20%7B%5Cn%20%20%20%20return%20root.querySelector%3CHTMLElement%3E(%60%5Bdata-content-nav-id%3D%5C%22%24%7BCSS.escape(id)%7D%5C%22%5D%60)%5Cn%20%20%7D%5Cn%5Cn%20%20return%20Array.from(root.querySelectorAll%3CHTMLElement%3E('%5Bdata-content-nav-id%5D')).find(%5Cn%20%20%20%20(entry)%20%3D%3E%20entry.dataset.contentNavId%20%3D%3D%3D%20id%2C%5Cn%20%20)%5Cn%7D%5Cn%5Cnfunction%20findBubbleBoxTarget(id%3A%20string)%20%7B%5Cn%20%20const%20container%20%3D%20scrollContainerRef.value%5Cn%20%20if%20(!container)%20%7B%5Cn%20%20%20%20return%20null%5Cn%20%20%7D%5Cn%5Cn%20%20return%20queryTargetById(container%2C%20id)%5Cn%7D%5Cn%5Cnfunction%20clearJumpFeedback()%20%7B%5Cn%20%20if%20(jumpFeedbackTimer)%20%7B%5Cn%20%20%20%20clearTimeout(jumpFeedbackTimer)%5Cn%20%20%20%20jumpFeedbackTimer%20%3D%20null%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnfunction%20applyJumpFeedback(id%3A%20string)%20%7B%5Cn%20%20const%20target%20%3D%20findBubbleBoxTarget(id)%5Cn%5Cn%20%20if%20(!target)%20%7B%5Cn%20%20%20%20return%5Cn%20%20%7D%5Cn%5Cn%20%20clearJumpFeedback()%5Cn%20%20target.classList.remove(jumpFlashClassName)%5Cn%20%20void%20target.offsetWidth%5Cn%20%20target.classList.add(jumpFlashClassName)%5Cn%5Cn%20%20jumpFeedbackTimer%20%3D%20setTimeout(()%20%3D%3E%20%7B%5Cn%20%20%20%20target.classList.remove(jumpFlashClassName)%5Cn%20%20%20%20jumpFeedbackTimer%20%3D%20null%5Cn%20%20%7D%2C%20jumpFeedbackDuration)%5Cn%7D%5Cn%5Cnfunction%20handleSelect(item%3A%20%7B%20id%3A%20string%20%7D)%20%7B%5Cn%20%20activeId.value%20%3D%20item.id%5Cn%20%20applyJumpFeedback(item.id)%5Cn%7D%5Cn%5CnonBeforeUnmount(()%20%3D%3E%20%7B%5Cn%20%20clearJumpFeedback()%5Cn%7D)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20lang%3D%5C%22less%5C%22%20scoped%3E%5Cn.demo%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%2016px%3B%5Cn%7D%5Cn%5Cn.controls%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%2012px%2016px%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.placement%2C%5Cn.controls%20label%20%7B%5Cn%20%20display%3A%20inline-flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%206px%3B%5Cn%7D%5Cn%5Cn.stage%20%7B%5Cn%20%20position%3A%20relative%3B%5Cn%20%20height%3A%20480px%3B%5Cn%20%20overflow%3A%20hidden%3B%5Cn%20%20border%3A%201px%20solid%20%23dfe7f2%3B%5Cn%20%20border-radius%3A%2012px%3B%5Cn%20%20background%3A%20%23fff%3B%5Cn%7D%5Cn%5Cn.conversation%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20overflow%3A%20auto%3B%5Cn%7D%5Cn%5Cn.conversation-list%20%7B%5Cn%20%20--tr-bubble-list-gap%3A%2016px%3B%5Cn%20%20--tr-bubble-list-padding%3A%2024px%2072px%2040px%3B%5Cn%20%20--tr-bubble-max-width%3A%20560px%3B%5Cn%7D%5Cn%5Cn.nav%20%7B%5Cn%20%20top%3A%200%3B%5Cn%5Cn%20%20%26.is-right%20%7B%5Cn%20%20%20%20right%3A%2016px%3B%5Cn%20%20%7D%5Cn%5Cn%20%20%26.is-left%20%7B%5Cn%20%20%20%20left%3A%2016px%3B%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn%3Adeep(.tr-bubble__box%5Bdata-role%3D'user'%5D)%20%7B%5Cn%20%20--tr-bubble-box-bg%3A%20var(--tr-color-primary-light)%3B%5Cn%20%20scroll-margin-top%3A%2020px%3B%5Cn%20%20transition%3A%5Cn%20%20%20%20background-color%20v-bind(jumpTransitionDuration)%20ease%2C%5Cn%20%20%20%20box-shadow%20v-bind(jumpTransitionDuration)%20ease%3B%5Cn%7D%5Cn%5Cn%3Adeep(.tr-bubble__box%5Bdata-role%3D'user'%5D.demo-user-box-flash)%20%7B%5Cn%20%20--tr-bubble-box-bg%3A%20%23b9d7ff%3B%5Cn%20%20box-shadow%3A%5Cn%20%20%20%200%200%200%201px%20rgba(55%2C%20132%2C%20255%2C%200.2)%2C%5Cn%20%20%20%200%2012px%2028px%20-18px%20rgba(55%2C%20132%2C%20255%2C%200.45)%2C%5Cn%20%20%20%20var(--tr-bubble-box-shadow)%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[0]||(n[0]=()=>{a.value=!1}),vueCode:t(g)},u({_:2},[C.value?{name:"vue",fn:r(()=>[e(t(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[3]||(n[3]=i('<p>使用建议：</p><ul><li>参与导航的消息应提供稳定的 <code>id</code></li><li><code>ContentNavItem.id</code> 与目标 box 根节点上的 <code>data-content-nav-id</code> 保持一致</li><li><code>label / searchText / tooltipText</code> 由调用方直接生成</li><li>如需设置 <code>scroll-margin-top</code>、点击反馈或高亮样式，建议统一作用于同一目标节点</li><li><code>expandTrigger=&quot;hover&quot;</code> 适用于轻量侧边目录场景</li></ul><h3 id="普通内容场景" tabindex="-1">普通内容场景 <a class="header-anchor" href="#普通内容场景" aria-label="Permalink to &quot;普通内容场景&quot;">​</a></h3><p>在普通内容场景中，可直接在章节节点上设置 <code>data-content-nav-id</code>，并将对应的 <code>items</code> 传入 <code>TrContentNav</code>。示例中同时展示了点击目录项后的滚动定位与章节高亮反馈。</p>',4)),E(e(t(A),null,null,512),[[B,a.value]]),e(s,null,{default:r(()=>[e(t(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22basic-source.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fcontent-nav%2Fbasic-source.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22controls%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%20class%3D%5C%22controls-title%5C%22%3E%E5%B1%95%E5%BC%80%E6%A8%A1%E5%BC%8F%3C%2Fspan%3E%5Cn%5Cn%20%20%20%20%20%20%3Clabel%3E%5Cn%20%20%20%20%20%20%20%20%3Cinput%20v-model%3D%5C%22expandTrigger%5C%22%20type%3D%5C%22radio%5C%22%20value%3D%5C%22hover%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20hover%5Cn%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%5Cn%20%20%20%20%20%20%3Clabel%3E%5Cn%20%20%20%20%20%20%20%20%3Cinput%20v-model%3D%5C%22expandTrigger%5C%22%20type%3D%5C%22radio%5C%22%20value%3D%5C%22manual%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20manual%5Cn%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%5Cn%20%20%20%20%20%20%3Ctemplate%20v-if%3D%5C%22isManualMode%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cspan%20class%3D%5C%22controls-divider%5C%22%20aria-hidden%3D%5C%22true%5C%22%3E%3C%2Fspan%3E%5Cn%5Cn%20%20%20%20%20%20%20%20%3Clabel%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cinput%20v-model%3D%5C%22expanded%5C%22%20type%3D%5C%22checkbox%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%E5%B1%95%E5%BC%80%E7%9B%AE%E5%BD%95%E9%9D%A2%E6%9D%BF%5Cn%20%20%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%5Cn%20%20%20%20%20%20%20%20%3Cbutton%20type%3D%5C%22button%5C%22%20%40click%3D%5C%22expanded%20%3D%20false%5C%22%3E%E6%94%B6%E8%B5%B7%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%20%20%3Cbutton%20type%3D%5C%22button%5C%22%20%40click%3D%5C%22expanded%20%3D%20true%5C%22%3E%E5%B1%95%E5%BC%80%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cp%20class%3D%5C%22tip%5C%22%3E%5Cn%20%20%20%20%20%20%3Ctemplate%20v-if%3D%5C%22isManualMode%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%E5%BD%93%E5%89%8D%E4%B8%BA%20%3Ccode%3Emanual%3C%2Fcode%3E%20%E6%A8%A1%E5%BC%8F%EF%BC%8C%E7%9B%AE%E5%BD%95%E9%9D%A2%E6%9D%BF%E4%B8%8D%E5%86%8D%E8%B7%9F%E9%9A%8F%20hover%20%E8%87%AA%E5%8A%A8%E5%B1%95%E5%BC%80%EF%BC%8C%E6%94%B9%E7%94%B1%E5%A4%96%E9%83%A8%20%3Ccode%3Ev-model%3Aexpanded%3C%2Fcode%3E%20%E6%8E%A7%E5%88%B6%E3%80%82%5Cn%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%20%20%3Ctemplate%20v-else%3E%20%E5%BD%93%E5%89%8D%E4%B8%BA%20%3Ccode%3Ehover%3C%2Fcode%3E%20%E6%A8%A1%E5%BC%8F%EF%BC%8C%E9%BC%A0%E6%A0%87%E6%82%AC%E6%B5%AE%E6%88%96%E8%81%9A%E7%84%A6%E5%88%B0%E7%9B%AE%E5%BD%95%E9%9D%A2%E6%9D%BF%E6%97%B6%E4%BC%9A%E8%87%AA%E5%8A%A8%E5%B1%95%E5%BC%80%E3%80%82%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%3C%2Fp%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22stage%5C%22%3E%5Cn%20%20%20%20%20%20%3Cdiv%20ref%3D%5C%22scrollContainerRef%5C%22%20class%3D%5C%22article%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Csection%5Cn%20%20%20%20%20%20%20%20%20%20v-for%3D%5C%22section%20in%20sections%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Akey%3D%5C%22section.id%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Adata-content-nav-id%3D%5C%22section.id%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20class%3D%5C%22article-section%5C%22%5Cn%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Ch4%3E%7B%7B%20section.label%20%7D%7D%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cp%20v-for%3D%5C%22paragraph%20in%20section.paragraphs%5C%22%20%3Akey%3D%5C%22paragraph%5C%22%3E%7B%7B%20paragraph%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fsection%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%20%20%3Ctr-content-nav%5Cn%20%20%20%20%20%20%20%20class%3D%5C%22nav%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aitems%3D%5C%22items%5C%22%5Cn%20%20%20%20%20%20%20%20%3Ascroll-container%3D%5C%22scrollContainerRef%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aexpand-trigger%3D%5C%22expandTrigger%5C%22%5Cn%20%20%20%20%20%20%20%20v-model%3Aexpanded%3D%5C%22expanded%5C%22%5Cn%20%20%20%20%20%20%20%20%3Asearch%3D%5C%22%7B%20placeholder%3A%20'%E6%90%9C%E7%B4%A2%E7%AB%A0%E8%8A%82'%20%7D%5C%22%5Cn%20%20%20%20%20%20%20%20%40select%3D%5C%22handleSelect%5C%22%5Cn%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20onBeforeUnmount%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrContentNav%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cntype%20DemoSection%20%3D%20%7B%5Cn%20%20id%3A%20string%5Cn%20%20label%3A%20string%5Cn%20%20paragraphs%3A%20string%5B%5D%5Cn%7D%5Cn%5Cnconst%20sections%3A%20DemoSection%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'overview'%2C%5Cn%20%20%20%20label%3A%20'Overview'%2C%5Cn%20%20%20%20paragraphs%3A%20%5B'ContentNav%20%E9%80%82%E5%90%88%E7%94%A8%E4%BA%8E%E9%95%BF%E5%86%85%E5%AE%B9%E5%8C%BA%E5%9F%9F%E7%9A%84%E5%BF%AB%E9%80%9F%E5%AE%9A%E4%BD%8D%E3%80%82'%2C%20'%E6%8E%A5%E5%85%A5%E6%97%B6%E5%8F%AA%E9%9C%80%E8%A6%81%E5%87%86%E5%A4%87%E7%9B%AE%E5%BD%95%E9%A1%B9%E5%92%8C%E7%9C%9F%E5%AE%9E%E6%BB%9A%E5%8A%A8%E7%9B%AE%E6%A0%87%E4%B9%8B%E9%97%B4%E7%9A%84%E6%98%A0%E5%B0%84%E5%85%B3%E7%B3%BB%E3%80%82'%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'structure'%2C%5Cn%20%20%20%20label%3A%20'Structure'%2C%5Cn%20%20%20%20paragraphs%3A%20%5B'%E6%8E%A8%E8%8D%90%E6%8A%8A%E6%AF%8F%E4%B8%AA%E7%AB%A0%E8%8A%82%E6%A0%87%E9%A2%98%E6%88%96%E6%AE%B5%E8%90%BD%E5%AE%B9%E5%99%A8%E4%BD%9C%E4%B8%BA%E6%BB%9A%E5%8A%A8%E7%9B%AE%E6%A0%87%E3%80%82'%2C%20'%E7%9B%AE%E5%BD%95%E6%96%87%E6%9C%AC%E5%8F%AF%E4%BB%A5%E4%BF%9D%E6%8C%81%E7%AE%80%E6%B4%81%EF%BC%8C%E6%90%9C%E7%B4%A2%E6%96%87%E6%9C%AC%E5%86%8D%E8%A1%A5%E5%85%85%E6%9B%B4%E5%A4%9A%E4%B8%8A%E4%B8%8B%E6%96%87%E3%80%82'%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'interaction'%2C%5Cn%20%20%20%20label%3A%20'Interaction'%2C%5Cn%20%20%20%20paragraphs%3A%20%5B%5Cn%20%20%20%20%20%20'%E5%BD%93%E7%94%A8%E6%88%B7%E7%82%B9%E5%87%BB%E7%9B%AE%E5%BD%95%E9%A1%B9%E6%97%B6%EF%BC%8CContentNav%20%E4%BC%9A%E6%BB%9A%E5%8A%A8%E5%88%B0%E5%AF%B9%E5%BA%94%E7%9B%AE%E6%A0%87%E3%80%82'%2C%5Cn%20%20%20%20%20%20'%E6%BB%9A%E5%8A%A8%E8%BF%87%E7%A8%8B%E4%B8%AD%EF%BC%8C%E5%BD%93%E5%89%8D%E6%BF%80%E6%B4%BB%E9%A1%B9%E4%B9%9F%E4%BC%9A%E9%9A%8F%E7%9D%80%E5%8F%AF%E8%A7%81%E5%8C%BA%E5%9F%9F%E8%87%AA%E5%8A%A8%E6%9B%B4%E6%96%B0%E3%80%82'%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'tips'%2C%5Cn%20%20%20%20label%3A%20'Tips'%2C%5Cn%20%20%20%20paragraphs%3A%20%5B%5Cn%20%20%20%20%20%20'%E6%8E%A8%E8%8D%90%E7%9B%B4%E6%8E%A5%E8%AE%A9%E7%AB%A0%E8%8A%82%E8%8A%82%E7%82%B9%E5%B8%A6%E4%B8%8A%20data-content-nav-id%EF%BC%8C%E5%B9%B6%E4%B8%8E%E7%9B%AE%E5%BD%95%E9%A1%B9%20id%20%E4%BF%9D%E6%8C%81%E4%B8%80%E8%87%B4%E3%80%82'%2C%5Cn%20%20%20%20%20%20'%E8%BF%99%E6%A0%B7%E7%9B%AE%E5%BD%95%E9%A1%B9%E3%80%81%E6%BB%9A%E5%8A%A8%E5%AE%9A%E4%BD%8D%E5%92%8C%E6%BF%80%E6%B4%BB%E6%80%81%E5%8F%AF%E4%BB%A5%E7%94%B1%20TrContentNav%20%E5%9C%A8%E5%86%85%E9%83%A8%E7%BB%9F%E4%B8%80%E5%A4%84%E7%90%86%E3%80%82'%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20scrollContainerRef%20%3D%20ref%3CHTMLElement%20%7C%20null%3E(null)%5Cnconst%20expandTrigger%20%3D%20ref%3C'hover'%20%7C%20'manual'%3E('hover')%5Cnconst%20expanded%20%3D%20ref(false)%5Cnconst%20isManualMode%20%3D%20computed(()%20%3D%3E%20expandTrigger.value%20%3D%3D%3D%20'manual')%5Cnconst%20jumpFlashClassName%20%3D%20'article-section-flash'%5Cnconst%20jumpTransitionDuration%20%3D%20'220ms'%5Cnconst%20jumpFeedbackDuration%20%3D%20520%5Cnlet%20jumpFeedbackTimer%3A%20ReturnType%3Ctypeof%20setTimeout%3E%20%7C%20null%20%3D%20null%5Cn%5Cnconst%20items%20%3D%20computed(()%20%3D%3E%5Cn%20%20sections.map((section)%20%3D%3E%20(%7B%5Cn%20%20%20%20id%3A%20section.id%2C%5Cn%20%20%20%20label%3A%20section.label%2C%5Cn%20%20%20%20searchText%3A%20%60%24%7Bsection.label%7D%20%24%7Bsection.paragraphs.join('%20')%7D%60%2C%5Cn%20%20%7D))%2C%5Cn)%5Cn%5Cnfunction%20queryTargetById(root%3A%20ParentNode%2C%20id%3A%20string)%20%7B%5Cn%20%20if%20(typeof%20CSS%20!%3D%3D%20'undefined'%20%26%26%20typeof%20CSS.escape%20%3D%3D%3D%20'function')%20%7B%5Cn%20%20%20%20return%20root.querySelector%3CHTMLElement%3E(%60%5Bdata-content-nav-id%3D%5C%22%24%7BCSS.escape(id)%7D%5C%22%5D%60)%5Cn%20%20%7D%5Cn%5Cn%20%20return%20Array.from(root.querySelectorAll%3CHTMLElement%3E('%5Bdata-content-nav-id%5D')).find(%5Cn%20%20%20%20(entry)%20%3D%3E%20entry.dataset.contentNavId%20%3D%3D%3D%20id%2C%5Cn%20%20)%5Cn%7D%5Cn%5Cnfunction%20findSectionTarget(id%3A%20string)%20%7B%5Cn%20%20const%20container%20%3D%20scrollContainerRef.value%5Cn%20%20if%20(!container)%20%7B%5Cn%20%20%20%20return%20null%5Cn%20%20%7D%5Cn%5Cn%20%20return%20queryTargetById(container%2C%20id)%5Cn%7D%5Cn%5Cnfunction%20clearJumpFeedback()%20%7B%5Cn%20%20if%20(jumpFeedbackTimer)%20%7B%5Cn%20%20%20%20clearTimeout(jumpFeedbackTimer)%5Cn%20%20%20%20jumpFeedbackTimer%20%3D%20null%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnfunction%20applyJumpFeedback(id%3A%20string)%20%7B%5Cn%20%20const%20target%20%3D%20findSectionTarget(id)%5Cn%20%20if%20(!target)%20%7B%5Cn%20%20%20%20return%5Cn%20%20%7D%5Cn%5Cn%20%20clearJumpFeedback()%5Cn%20%20target.classList.remove(jumpFlashClassName)%5Cn%20%20void%20target.offsetWidth%5Cn%20%20target.classList.add(jumpFlashClassName)%5Cn%5Cn%20%20jumpFeedbackTimer%20%3D%20setTimeout(()%20%3D%3E%20%7B%5Cn%20%20%20%20target.classList.remove(jumpFlashClassName)%5Cn%20%20%20%20jumpFeedbackTimer%20%3D%20null%5Cn%20%20%7D%2C%20jumpFeedbackDuration)%5Cn%7D%5Cn%5Cnfunction%20handleSelect(item%3A%20%7B%20id%3A%20string%20%7D)%20%7B%5Cn%20%20applyJumpFeedback(item.id)%5Cn%7D%5Cn%5CnonBeforeUnmount(()%20%3D%3E%20%7B%5Cn%20%20clearJumpFeedback()%5Cn%7D)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20lang%3D%5C%22less%5C%22%20scoped%3E%5Cn.demo%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%2014px%3B%5Cn%7D%5Cn%5Cn.controls%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%2010px%2012px%3B%5Cn%7D%5Cn%5Cn.controls-title%20%7B%5Cn%20%20color%3A%20%2334495e%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20font-weight%3A%20600%3B%5Cn%7D%5Cn%5Cn.controls%20label%20%7B%5Cn%20%20display%3A%20inline-flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%206px%3B%5Cn%20%20color%3A%20%234f647a%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.controls-divider%20%7B%5Cn%20%20width%3A%201px%3B%5Cn%20%20height%3A%2016px%3B%5Cn%20%20background%3A%20%23d7e1ec%3B%5Cn%7D%5Cn%5Cn.controls%20button%20%7B%5Cn%20%20padding%3A%204px%2010px%3B%5Cn%7D%5Cn%5Cn.tip%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20color%3A%20%234f647a%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20line-height%3A%201.6%3B%5Cn%7D%5Cn%5Cn.stage%20%7B%5Cn%20%20position%3A%20relative%3B%5Cn%20%20height%3A%20420px%3B%5Cn%20%20overflow%3A%20hidden%3B%5Cn%20%20border%3A%201px%20solid%20%23dfe7f2%3B%5Cn%20%20border-radius%3A%2012px%3B%5Cn%20%20background%3A%20%23fff%3B%5Cn%7D%5Cn%5Cn.article%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20overflow%3A%20auto%3B%5Cn%20%20padding%3A%2028px%3B%5Cn%7D%5Cn%5Cn.article-section%20%7B%5Cn%20%20padding%3A%2028px%3B%5Cn%20%20scroll-margin-top%3A%2016px%3B%5Cn%20%20transition%3A%5Cn%20%20%20%20background-color%20v-bind(jumpTransitionDuration)%20ease%2C%5Cn%20%20%20%20box-shadow%20v-bind(jumpTransitionDuration)%20ease%2C%5Cn%20%20%20%20border-color%20v-bind(jumpTransitionDuration)%20ease%3B%5Cn%7D%5Cn%5Cn.article-section%20%2B%20.article-section%20%7B%5Cn%20%20border-top%3A%201px%20solid%20%23eef3f8%3B%5Cn%20%20padding-top%3A%2028px%3B%5Cn%7D%5Cn%5Cn.article-section.article-section-flash%20%7B%5Cn%20%20background%3A%20linear-gradient(180deg%2C%20rgba(185%2C%20215%2C%20255%2C%200.42)%200%25%2C%20rgba(185%2C%20215%2C%20255%2C%200.14)%20100%25)%3B%5Cn%20%20box-shadow%3A%200%2012px%2028px%20-22px%20rgba(55%2C%20132%2C%20255%2C%200.55)%3B%5Cn%7D%5Cn%5Cn.article-section%20h4%20%7B%5Cn%20%20margin%3A%200%200%2012px%3B%5Cn%20%20font-size%3A%2018px%3B%5Cn%20%20line-height%3A%201.4%3B%5Cn%7D%5Cn%5Cn.article-section%20p%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20color%3A%20%234f647a%3B%5Cn%20%20line-height%3A%201.7%3B%5Cn%7D%5Cn%5Cn.article-section%20p%20%2B%20p%20%7B%5Cn%20%20margin-top%3A%2010px%3B%5Cn%7D%5Cn%5Cn.nav%20%7B%5Cn%20%20top%3A%200%3B%5Cn%20%20right%3A%2016px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[1]||(n[1]=()=>{a.value=!1}),vueCode:t(f)},u({_:2},[d.value?{name:"vue",fn:r(()=>[e(t(d))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[4]||(n[4]=i('<h2 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h2><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>items</code></td><td><code>ContentNavItem[]</code></td><td>-</td><td>目录项列表。组件默认使用 <code>item.id</code> 匹配 <code>[data-content-nav-id=&quot;&lt;id&gt;&quot;]</code>，并滚动到对应节点</td></tr><tr><td><code>scrollContainer</code></td><td><code>HTMLElement | null</code></td><td><code>null</code></td><td>滚动容器。传入后仅在该容器内解析目标节点</td></tr><tr><td><code>search</code></td><td><code>false | ContentNavSearchOptions</code></td><td><code>false</code></td><td>搜索区配置。传入 <code>false</code> 时不显示搜索区</td></tr><tr><td><code>activeId</code></td><td><code>string</code></td><td>非受控</td><td>当前激活项。传入后进入受控模式</td></tr><tr><td><code>expanded</code></td><td><code>boolean</code></td><td>-</td><td>展开状态。在 <code>expandTrigger=&quot;manual&quot;</code> 时用于外部控制</td></tr><tr><td><code>query</code></td><td><code>string</code></td><td>非受控</td><td>搜索词。传入后进入受控模式</td></tr><tr><td><code>placement</code></td><td><code>&#39;left&#39; | &#39;right&#39;</code></td><td><code>&#39;right&#39;</code></td><td>停靠位置</td></tr><tr><td><code>expandTrigger</code></td><td><code>&#39;hover&#39; | &#39;manual&#39;</code></td><td><code>&#39;hover&#39;</code></td><td>展开方式。<code>hover</code> 为自动展开，<code>manual</code> 为外部控制</td></tr><tr><td><code>emptyText</code></td><td><code>string</code></td><td><code>&#39;No matching items&#39;</code></td><td>搜索无结果文案</td></tr></tbody></table><h2 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h2><table tabindex="0"><thead><tr><th>插槽</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>item</code></td><td><code>{ item, segments, active, expanded, highlighted }</code></td><td>自定义目录项内容</td></tr><tr><td><code>marker</code></td><td><code>{ item, active }</code></td><td>自定义目录点</td></tr><tr><td><code>search</code></td><td><code>{ query, setQuery, options }</code></td><td>自定义搜索区</td></tr><tr><td><code>empty</code></td><td>-</td><td>自定义空结果内容</td></tr></tbody></table><h2 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h2><table tabindex="0"><thead><tr><th>事件</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>update:activeId</code></td><td><code>value: string | undefined</code></td><td>当前激活项变化</td></tr><tr><td><code>update:expanded</code></td><td><code>value: boolean</code></td><td>展开状态变化。<code>manual</code> 模式下可用于 <code>v-model:expanded</code>，<code>hover</code> 模式下可用于监听自动展开状态</td></tr><tr><td><code>update:query</code></td><td><code>value: string</code></td><td>搜索词变化</td></tr><tr><td><code>select</code></td><td><code>item: ContentNavItem</code></td><td>目录项被选中时触发</td></tr><tr><td><code>activate</code></td><td><code>item: ContentNavItem</code></td><td>目录项被激活时触发</td></tr></tbody></table><h2 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h2><h3 id="contentnavitem" tabindex="-1">ContentNavItem <a class="header-anchor" href="#contentnavitem" aria-label="Permalink to &quot;ContentNavItem&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>id</code></td><td><code>string</code></td><td>唯一标识，同时用于匹配目标节点</td></tr><tr><td><code>label</code></td><td><code>string</code></td><td>目录显示文本</td></tr><tr><td><code>searchText</code></td><td><code>string</code></td><td>搜索时额外匹配的文本</td></tr><tr><td><code>tooltipText</code></td><td><code>string</code></td><td>自定义 tooltip 文案</td></tr><tr><td><code>meta</code></td><td><code>Record&lt;string, unknown&gt;</code></td><td>自定义透传数据</td></tr></tbody></table><h3 id="contentnavsearchoptions" tabindex="-1">ContentNavSearchOptions <a class="header-anchor" href="#contentnavsearchoptions" aria-label="Permalink to &quot;ContentNavSearchOptions&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>placeholder</code></td><td><code>string</code></td><td>搜索框占位文案</td></tr><tr><td><code>matcher</code></td><td><code>ContentNavSearchMatcher</code></td><td>自定义搜索匹配逻辑</td></tr><tr><td><code>clearOnCollapse</code></td><td><code>boolean</code></td><td>收起时是否清空搜索词</td></tr></tbody></table><h2 id="css-变量" tabindex="-1">CSS 变量 <a class="header-anchor" href="#css-变量" aria-label="Permalink to &quot;CSS 变量&quot;">​</a></h2><table tabindex="0"><thead><tr><th>CSS 变量</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-content-nav-width-collapsed</code></td><td>折叠态宽度</td></tr><tr><td><code>--tr-content-nav-width-expanded</code></td><td>展开态宽度</td></tr><tr><td><code>--tr-content-nav-surface-radius</code></td><td>面板圆角</td></tr><tr><td><code>--tr-content-nav-item-radius</code></td><td>目录项圆角</td></tr><tr><td><code>--tr-content-nav-marker-width</code></td><td>目录点宽度</td></tr><tr><td><code>--tr-content-nav-marker-height</code></td><td>目录点高度</td></tr><tr><td><code>--tr-content-nav-marker-radius</code></td><td>目录点圆角</td></tr><tr><td><code>--tr-content-nav-marker-track-size</code></td><td>目录点轨道尺寸</td></tr><tr><td><code>--tr-content-nav-bg</code></td><td>面板背景色</td></tr><tr><td><code>--tr-content-nav-border</code></td><td>面板边框色</td></tr><tr><td><code>--tr-content-nav-shadow</code></td><td>面板阴影</td></tr><tr><td><code>--tr-content-nav-item-color</code></td><td>目录项文本色</td></tr><tr><td><code>--tr-content-nav-item-color-active</code></td><td>激活目录项文本色</td></tr><tr><td><code>--tr-content-nav-item-bg-hover</code></td><td>目录项 hover 背景色</td></tr><tr><td><code>--tr-content-nav-marker-color</code></td><td>默认目录点颜色</td></tr><tr><td><code>--tr-content-nav-marker-color-active</code></td><td>激活目录点颜色</td></tr><tr><td><code>--tr-content-nav-tooltip-bg</code></td><td>tooltip 背景色</td></tr><tr><td><code>--tr-content-nav-tooltip-color</code></td><td>tooltip 文本色</td></tr><tr><td><code>--tr-content-nav-tooltip-shadow</code></td><td>tooltip 阴影</td></tr><tr><td><code>--tr-content-nav-search-bg</code></td><td>搜索框背景色</td></tr><tr><td><code>--tr-content-nav-search-color</code></td><td>搜索框文本色</td></tr><tr><td><code>--tr-content-nav-search-border</code></td><td>搜索框边框色</td></tr><tr><td><code>--tr-content-nav-search-border-focus</code></td><td>搜索框聚焦边框色</td></tr><tr><td><code>--tr-content-nav-search-focus-ring</code></td><td>搜索框聚焦外环</td></tr><tr><td><code>--tr-content-nav-search-radius</code></td><td>搜索框圆角</td></tr><tr><td><code>--tr-content-nav-empty-color</code></td><td>空结果文本色</td></tr><tr><td><code>--tr-content-nav-focus-ring</code></td><td>目录项聚焦外环</td></tr><tr><td><code>--tr-content-nav-highlight-color</code></td><td>搜索高亮色</td></tr></tbody></table>',13))])}}});export{k as __pageData,_ as default};
