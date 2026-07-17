<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { computed, nextTick, ref, shallowRef, useTemplateRef, watch } from 'vue'
import { Layout as ProductLayout, LayoutAsideToggle, LayoutProxyScrollbar } from '@opentiny/tiny-robot'
import type {
  LayoutAsideMode,
  LayoutAsideOpenValue,
  LayoutAsideOptions,
  LayoutAsideResizeValue,
  LayoutFloatingState,
  LayoutMode,
} from '@opentiny/tiny-robot'
import {
  IconAi,
  IconArrowUp,
  IconClose,
  IconCopy,
  IconFileFolder,
  IconLike,
  IconMenuCollapse,
  IconMenuExpand,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconShare,
} from '@opentiny/tiny-robot-svgs'

type Scene = 'aside' | 'floating'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
}

const isMobile = useMediaQuery('(max-width: 959px)')
const activeScene = shallowRef<Scene>('aside')
const asideMode = shallowRef<LayoutAsideMode>('dock')
const mode = shallowRef<LayoutMode>('normal')
const draft = shallowRef('')
const mainRef = useTemplateRef<HTMLElement>('mainRef')

const leftAside = shallowRef<LayoutAsideOptions>({
  mode: 'dock',
  open: true,
  expandedWidth: 248,
  collapsedWidth: 64,
  resizable: true,
  minExpandedWidth: 220,
  maxExpandedWidth: 340,
  collapseEffect: 'overlay',
})

const rightAside = shallowRef<LayoutAsideOptions>({
  mode: 'dock',
  open: true,
  expandedWidth: 318,
  resizable: true,
  minExpandedWidth: 260,
  maxExpandedWidth: 440,
})

const floatingState = shallowRef<LayoutFloatingState>({
  placement: 'bottom-right',
  offsetX: 30,
  offsetY: 30,
  width: 620,
  height: 720,
})

const messages = ref<Message[]>([
  { id: 1, role: 'user', content: '帮我把这份产品方案整理成一页式汇报。' },
  {
    id: 2,
    role: 'assistant',
    content:
      '可以。我会先提炼目标、用户问题和核心方案，再补充执行路径与衡量指标。右侧资料栏已关联当前项目文件，方便核对来源。',
  },
  { id: 3, role: 'user', content: '重点突出 AI 工作台和可扩展的侧边面板。' },
  {
    id: 4,
    role: 'assistant',
    content:
      '建议采用三层结构：左侧承载会话与项目导航，中间保持连续对话，右侧用于文件、引用和任务上下文。同一个 aside 可以作为 dock 常驻，也可以切换为 drawer 临时覆盖主区。',
  },
])

const isFloating = computed(() => activeScene.value === 'floating')

watch(
  [activeScene, asideMode, isMobile],
  ([scene, panelMode, mobile]) => {
    const floating = scene === 'floating'

    mode.value = floating ? 'floating' : 'normal'
    leftAside.value = {
      ...leftAside.value,
      mode: floating || mobile ? 'drawer' : 'dock',
      open: !floating && !mobile,
      resizable: !floating && !mobile,
    }
    rightAside.value = {
      ...rightAside.value,
      mode: floating || mobile ? 'drawer' : panelMode,
      open: floating ? false : true,
      resizable: !floating && !mobile && panelMode === 'dock',
    }
  },
  { immediate: true },
)

function toggleFloatingScene(): void {
  activeScene.value = isFloating.value ? 'aside' : 'floating'
}

function toggleRightAsideMode(): void {
  asideMode.value = asideMode.value === 'dock' ? 'drawer' : 'dock'
}

function updateLeftAsideOpen(detail: LayoutAsideOpenValue): void {
  leftAside.value = { ...leftAside.value, open: detail.open }
}

function updateRightAsideOpen(detail: LayoutAsideOpenValue): void {
  rightAside.value = { ...rightAside.value, open: detail.open }
}

function updateLeftAsideWidth(detail: LayoutAsideResizeValue): void {
  leftAside.value = { ...leftAside.value, expandedWidth: detail.expandedWidth }
}

function updateRightAsideWidth(detail: LayoutAsideResizeValue): void {
  rightAside.value = { ...rightAside.value, expandedWidth: detail.expandedWidth }
}

async function sendMessage(): Promise<void> {
  const value = draft.value.trim()
  if (!value) return

  const nextId = messages.value.length + 1
  messages.value.push({ id: nextId, role: 'user', content: value })
  messages.value.push({
    id: nextId + 1,
    role: 'assistant',
    content: '已同步到当前工作区。右侧资料栏保留引用，浮层模式下也能继续打开左右侧栏处理上下文。',
  })
  draft.value = ''

  await nextTick()
  mainRef.value?.scrollTo({ top: mainRef.value.scrollHeight })
}
</script>

<template>
  <div class="product-showcase" :class="{ 'is-floating': isFloating }">
    <section class="product-showcase__workspace" aria-label="Product workspace">
      <header class="workspace-header">
        <div class="workspace-brand">
          <span class="workspace-brand__mark">N</span>
          <strong>Northstar</strong>
        </div>
        <nav class="workspace-nav">
          <span class="is-active">Overview</span>
          <span>Projects</span>
          <span>Insights</span>
        </nav>
        <button class="workspace-avatar" type="button">A</button>
      </header>

      <main class="workspace-body">
        <p class="workspace-eyebrow">Q3 Product Planning</p>
        <h1>AI workspace for clearer decisions</h1>
        <p class="workspace-lead">Bring conversations, files and product context into one focused workspace.</p>

        <div class="workspace-metrics">
          <article class="metric-card">
            <span>Active projects</span>
            <strong>12</strong>
            <small>+18% this month</small>
          </article>
          <article class="metric-card">
            <span>Open decisions</span>
            <strong>08</strong>
            <small>3 need attention</small>
          </article>
          <article class="metric-card">
            <span>Team alignment</span>
            <strong>94%</strong>
            <small>Across 6 teams</small>
          </article>
        </div>
      </main>
    </section>

    <!-- @vue-ignore Dynamic mode switches between the normal and floating prop branches. -->
    <ProductLayout
      :mode="mode"
      :left-aside="leftAside"
      :right-aside="rightAside"
      v-model:floating-state="floatingState"
      class="product-showcase__layout"
      :floating-options="{
        draggable: true,
        resizable: true,
        minWidth: 440,
        maxWidth: 920,
        minHeight: 560,
        maxHeight: 860,
      }"
      @left-aside-open-change="updateLeftAsideOpen"
      @right-aside-open-change="updateRightAsideOpen"
      @left-aside-resize="updateLeftAsideWidth"
      @right-aside-resize="updateRightAsideWidth"
    >
      <template #left-aside>
        <aside class="chat-sidebar">
          <div class="chat-sidebar__top">
            <div class="chat-sidebar__brand">
              <IconAi />
              <strong>Assistant</strong>
            </div>
            <LayoutAsideToggle side="left" class="icon-button">
              <IconMenuCollapse />
            </LayoutAsideToggle>
          </div>

          <button class="new-chat" type="button">
            <IconPlus />
            <span>New conversation</span>
          </button>
          <button class="sidebar-search" type="button">
            <IconSearch />
            <span>Search conversations</span>
            <kbd>⌘ K</kbd>
          </button>
          <p class="sidebar-label">Projects</p>
          <button class="sidebar-item is-active" type="button">
            <IconFileFolder />
            <span>Product strategy</span>
          </button>
          <button class="sidebar-item" type="button">
            <IconFileFolder />
            <span>Customer research</span>
          </button>
          <p class="sidebar-label">Recent</p>
          <button
            v-for="item in ['AI workspace direction', 'Positioning review', 'Research synthesis']"
            :key="item"
            class="sidebar-history"
            type="button"
          >
            {{ item }}
          </button>
          <div class="chat-sidebar__account">
            <span>A</span>
            <div>
              <strong>Alex Morgan</strong>
              <small>Personal workspace</small>
            </div>
            <b>•••</b>
          </div>
        </aside>
      </template>

      <template #header>
        <header class="chat-header">
          <LayoutAsideToggle side="left" class="icon-button">
            <IconMenuExpand />
          </LayoutAsideToggle>
          <div class="chat-header__title">
            <strong>Product strategy</strong>
            <span><i></i> GPT-5 · Thinking</span>
          </div>
          <div class="chat-header__actions">
            <button v-if="!isFloating" class="header-action" type="button" @click="toggleRightAsideMode">
              {{ asideMode === 'dock' ? 'Use drawer' : 'Use dock' }}
            </button>
            <button class="header-action" type="button" @click="toggleFloatingScene">
              {{ isFloating ? 'Dock' : 'Open floating' }}
            </button>
            <button class="icon-button" type="button" aria-label="Share">
              <IconShare />
            </button>
            <LayoutAsideToggle side="right" class="icon-button">
              <IconFileFolder />
            </LayoutAsideToggle>
          </div>
        </header>
      </template>

      <template #main>
        <main ref="mainRef" class="chat-main">
          <div class="chat-main__content">
            <div class="chat-context">
              <span>{{ isFloating ? 'Floating panel keeps full layout slots' : `Right aside is ${asideMode}` }}</span>
              <span>·</span>
              <span>Updated just now</span>
            </div>

            <div v-for="message in messages" :key="message.id" class="message" :class="`message--${message.role}`">
              <div v-if="message.role === 'user'" class="message__user">{{ message.content }}</div>
              <div v-else class="message__assistant">
                <div class="assistant-avatar">
                  <IconAi />
                </div>
                <div class="assistant-copy">
                  <p>{{ message.content }}</p>
                  <div class="assistant-actions">
                    <button type="button" aria-label="Copy">
                      <IconCopy />
                    </button>
                    <button type="button" aria-label="Like">
                      <IconLike />
                    </button>
                    <button type="button" aria-label="Refresh">
                      <IconRefresh />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <article class="answer-card">
              <div class="answer-card__heading">
                <span>Suggested structure</span>
                <em>Draft</em>
              </div>
              <ol>
                <li>
                  <strong>Context</strong>
                  <span>What changed and why it matters now</span>
                </li>
                <li>
                  <strong>Opportunity</strong>
                  <span>A shared AI workspace for decisions</span>
                </li>
                <li>
                  <strong>Next step</strong>
                  <span>Validate with three product teams</span>
                </li>
              </ol>
            </article>
          </div>
          <LayoutProxyScrollbar :scroll-target="mainRef" />
        </main>
      </template>

      <template #footer>
        <footer class="chat-footer">
          <div class="composer">
            <button type="button" aria-label="Add attachment">
              <IconPlus />
            </button>
            <input v-model="draft" placeholder="Ask anything about this project" @keydown.enter="sendMessage" />
            <span>Thinking</span>
            <button type="button" aria-label="Send" class="composer__send" @click="sendMessage">
              <IconArrowUp />
            </button>
          </div>
          <small>AI can make mistakes. Check important information.</small>
        </footer>
      </template>

      <template #right-aside>
        <aside class="reference-panel">
          <div class="reference-panel__header">
            <div>
              <small>Workspace context</small>
              <strong>References</strong>
            </div>
            <LayoutAsideToggle side="right" class="icon-button">
              <IconClose />
            </LayoutAsideToggle>
          </div>
          <div class="reference-panel__body">
            <div class="reference-file">
              <span class="file-icon">PDF</span>
              <div>
                <strong>Q3 product brief</strong>
                <small>2.4 MB · Updated today</small>
              </div>
              <b>•••</b>
            </div>
            <div class="reference-file">
              <span class="file-icon file-icon--doc">DOC</span>
              <div>
                <strong>Customer research</strong>
                <small>18 pages · 6 sources</small>
              </div>
              <b>•••</b>
            </div>
            <div class="reference-section">
              <p>Used in this answer</p>
              <button type="button">
                <span>1</span>
                Product strategy brief
                <small>92% match</small>
              </button>
              <button type="button">
                <span>2</span>
                Research synthesis
                <small>86% match</small>
              </button>
            </div>
          </div>
        </aside>
      </template>
    </ProductLayout>
  </div>
</template>

<style scoped>
.product-showcase {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f5f7fb;
  color: #172033;
}

.product-showcase__workspace {
  position: absolute;
  inset: 0;
  background: #f7f8fb;
}

.workspace-header {
  display: flex;
  align-items: center;
  height: 72px;
  padding: 0 34px;
  border-bottom: 1px solid #e4e8f0;
  background: #ffffff;
}

.workspace-brand,
.workspace-nav,
.chat-sidebar__brand,
.chat-sidebar__top,
.chat-header,
.chat-header__actions,
.assistant-actions,
.composer,
.reference-panel__header,
.workspace-metrics,
.chat-sidebar__account,
.sidebar-search,
.sidebar-item {
  display: flex;
  align-items: center;
}

.workspace-brand {
  gap: 10px;
  min-width: 220px;
  font-size: 16px;
}

.workspace-brand__mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #1b5cff;
  color: #ffffff;
  font-weight: 800;
}

.workspace-nav {
  gap: 28px;
  margin: auto;
  color: #7a8496;
  font-size: 13px;
}

.workspace-nav .is-active {
  color: #172033;
  font-weight: 700;
}

.workspace-avatar,
.assistant-avatar,
.chat-sidebar__account > span {
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: #d9e3ff;
  color: #315efb;
  font-weight: 700;
}

.workspace-avatar {
  width: 32px;
  height: 32px;
}

.workspace-body {
  width: min(100% - 68px, 940px);
  margin: 0 auto;
  padding: 110px 0 0;
}

.workspace-eyebrow {
  margin: 0 0 14px;
  color: #5375d9;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.workspace-body h1 {
  max-width: 620px;
  margin: 0;
  font-size: 42px;
  line-height: 1.12;
  letter-spacing: 0;
}

.workspace-lead {
  max-width: 560px;
  margin: 18px 0 42px;
  color: #738096;
  font-size: 16px;
  line-height: 1.7;
}

.workspace-metrics {
  gap: 14px;
}

.metric-card {
  display: grid;
  gap: 8px;
  width: 190px;
  padding: 18px;
  border: 1px solid #e4e8f0;
  border-radius: 8px;
  background: #ffffff;
}

.metric-card span,
.metric-card small {
  color: #778399;
  font-size: 12px;
}

.metric-card strong {
  font-size: 26px;
}

.metric-card small {
  color: #36a269;
}

.product-showcase__layout {
  --tr-layout-height: 100%;
  --tr-layout-bg: #ffffff;
  --tr-layout-left-aside-bg: #ffffff;
  --tr-layout-right-aside-bg: #ffffff;
  --tr-layout-main-bg: #ffffff;
  --tr-layout-header-bg: #ffffff;
  --tr-layout-footer-bg: #ffffff;
  --tr-layout-divider-color: #e8ebf1;
  --tr-layout-panel-shadow: 0 20px 48px rgba(28, 43, 72, 0.18);
  --tr-layout-overlay-bg: rgba(20, 30, 52, 0.38);
  --tr-layout-floating-radius: 16px;
  --tr-layout-floating-shadow: 0 28px 72px rgba(28, 43, 72, 0.22);
  --tr-layout-main-scrollbar-width: 12px;
  --tr-layout-main-scrollbar-thumb-bg: rgba(49, 94, 251, 0.2);
}

.chat-sidebar {
  display: flex;
  flex-direction: column;
  width: var(--tr-layout-aside-expanded-width);
  height: 100%;
  padding: 16px 12px 12px;
  background: #ffffff;
}

.chat-sidebar__top {
  justify-content: space-between;
  padding: 0 6px 18px;
}

.chat-sidebar__brand {
  gap: 9px;
  color: #172033;
}

.chat-sidebar__brand svg {
  color: #315efb;
  font-size: 20px;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #68758b;
  cursor: pointer;
}

.icon-button:hover {
  background: #f0f3f8;
  color: #172033;
}

.new-chat,
.sidebar-search,
.sidebar-item,
.sidebar-history {
  width: 100%;
  border: 0;
  background: transparent;
  color: #263247;
  text-align: left;
  cursor: pointer;
}

.new-chat {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  border: 1px solid #dce3ef;
  border-radius: 8px;
  font-weight: 600;
}

.new-chat svg {
  color: #315efb;
}

.sidebar-search {
  gap: 9px;
  min-height: 40px;
  margin-top: 12px;
  padding: 0 10px;
  color: #718097;
  font-size: 12px;
}

.sidebar-search kbd {
  margin-left: auto;
  padding: 2px 5px;
  border: 1px solid #e0e5ed;
  border-radius: 4px;
  font-size: 10px;
}

.sidebar-label {
  margin: 24px 10px 7px;
  color: #99a3b3;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sidebar-item {
  gap: 9px;
  min-height: 38px;
  padding: 0 10px;
  border-radius: 7px;
  font-size: 13px;
}

.sidebar-item.is-active {
  background: #edf2ff;
  color: #315efb;
  font-weight: 600;
}

.sidebar-history {
  min-height: 34px;
  padding: 0 10px;
  overflow: hidden;
  border-radius: 7px;
  color: #6c788d;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-item:hover,
.sidebar-history:hover,
.sidebar-search:hover {
  background: #f5f7fa;
}

.chat-sidebar__account {
  gap: 9px;
  margin-top: auto;
  padding: 10px 6px 0;
  border-top: 1px solid #edf0f5;
}

.chat-sidebar__account > span {
  width: 30px;
  height: 30px;
  font-size: 12px;
}

.chat-sidebar__account div {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.chat-sidebar__account strong {
  font-size: 12px;
}

.chat-sidebar__account small {
  color: #8a95a8;
  font-size: 10px;
}

.chat-sidebar__account b {
  margin-left: auto;
  color: #a3acba;
  font-size: 11px;
}

.chat-header {
  justify-content: space-between;
  min-height: 66px;
  padding: 0 22px;
  border-bottom: 1px solid #edf0f4;
}

.chat-header__title {
  display: grid;
  gap: 5px;
  min-width: 0;
}

.chat-header__title strong {
  font-size: 14px;
}

.chat-header__title span {
  color: #8792a4;
  font-size: 11px;
}

.chat-header__title i {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 4px;
  border-radius: 50%;
  background: #39b879;
}

.chat-header__actions {
  gap: 6px;
}

.header-action {
  min-height: 32px;
  padding: 0 11px;
  border: 1px solid #dce3ef;
  border-radius: 7px;
  background: #ffffff;
  color: #315efb;
  font-size: 12px;
  cursor: pointer;
}

.chat-main {
  position: relative;
  height: 100%;
  overflow: auto;
}

.chat-main__content {
  width: min(100% - 48px, 720px);
  margin: 0 auto;
  padding: 30px 0 36px;
}

.chat-context {
  display: flex;
  gap: 7px;
  margin-bottom: 30px;
  color: #9aa4b4;
  font-size: 11px;
}

.message {
  margin-bottom: 28px;
}

.message--user {
  display: flex;
  justify-content: flex-end;
}

.message__user {
  max-width: 78%;
  padding: 12px 16px;
  border-radius: 14px;
  background: #eef2f8;
  color: #253249;
  font-size: 14px;
  line-height: 1.6;
}

.message__assistant {
  display: flex;
  gap: 12px;
}

.assistant-avatar {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  background: #e7edff;
  color: #315efb;
}

.assistant-avatar svg {
  font-size: 15px;
}

.assistant-copy {
  min-width: 0;
  color: #263247;
  font-size: 14px;
  line-height: 1.8;
}

.assistant-copy p {
  margin: 0;
}

.assistant-actions {
  gap: 3px;
  margin-top: 10px;
}

.assistant-actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 27px;
  height: 27px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #8f9aac;
  cursor: pointer;
}

.assistant-actions button:hover {
  background: #f1f4f8;
  color: #315efb;
}

.answer-card {
  margin: 34px 0 0 40px;
  border: 1px solid #dfe6f3;
  border-radius: 8px;
  background: #fafcff;
}

.answer-card__heading {
  display: flex;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #e6ebf4;
  color: #263247;
  font-size: 13px;
}

.answer-card em {
  padding: 3px 7px;
  border-radius: 4px;
  background: #e8efff;
  color: #315efb;
  font-size: 10px;
  font-style: normal;
}

.answer-card ol {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 16px 20px 18px 36px;
  color: #738096;
  font-size: 12px;
}

.answer-card li {
  padding-left: 4px;
}

.answer-card li strong {
  display: block;
  margin-bottom: 2px;
  color: #263247;
  font-size: 12px;
}

.chat-footer {
  padding: 10px 22px 16px;
  border-top: 1px solid #edf0f4;
}

.composer {
  gap: 10px;
  min-height: 52px;
  padding: 0 9px 0 14px;
  border: 1px solid #dce3ef;
  border-radius: 10px;
  background: #ffffff;
}

.composer > button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 0;
  background: transparent;
  color: #768399;
  cursor: pointer;
}

.composer input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  color: #253249;
  font: inherit;
  font-size: 13px;
}

.composer input::placeholder {
  color: #9aa4b4;
}

.composer > span {
  color: #8c97a9;
  font-size: 11px;
}

.composer .composer__send {
  width: 34px;
  height: 34px;
  border-radius: 7px;
  background: #315efb;
  color: #ffffff;
}

.chat-footer small {
  display: block;
  margin-top: 8px;
  color: #9aa4b4;
  font-size: 10px;
  text-align: center;
}

.reference-panel {
  display: flex;
  flex-direction: column;
  width: var(--tr-layout-aside-expanded-width);
  height: 100%;
  background: #ffffff;
}

.reference-panel__header {
  justify-content: space-between;
  padding: 18px 16px;
  border-bottom: 1px solid #edf0f4;
}

.reference-panel__header div {
  display: grid;
  gap: 5px;
}

.reference-panel__header small {
  color: #8c97a9;
  font-size: 11px;
}

.reference-panel__header strong {
  font-size: 15px;
}

.reference-panel__body {
  padding: 18px 16px;
}

.reference-file {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #edf0f4;
}

.file-icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 38px;
  border-radius: 6px;
  background: #fff0e8;
  color: #ed7040;
  font-size: 9px;
  font-weight: 800;
}

.file-icon--doc {
  background: #eaf1ff;
  color: #315efb;
}

.reference-file div {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.reference-file strong {
  overflow: hidden;
  color: #344158;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reference-file small {
  color: #94a0b0;
  font-size: 10px;
}

.reference-file b {
  margin-left: auto;
  color: #a1aaba;
  font-size: 10px;
}

.reference-section {
  display: grid;
  gap: 8px;
  margin-top: 28px;
}

.reference-section p {
  margin: 0 0 4px;
  color: #8994a6;
  font-size: 11px;
  font-weight: 700;
}

.reference-section button {
  display: grid;
  grid-template-columns: 22px 1fr auto;
  gap: 7px;
  align-items: center;
  padding: 9px 0;
  border: 0;
  background: transparent;
  color: #516079;
  text-align: left;
  font-size: 11px;
}

.reference-section button span {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  background: #edf2ff;
  color: #315efb;
  font-size: 10px;
}

.reference-section button small {
  color: #48a273;
  font-size: 9px;
}

@media (max-width: 959px) {
  .workspace-header {
    padding: 0 16px;
  }

  .workspace-brand {
    min-width: 0;
  }

  .workspace-nav {
    display: none;
  }

  .workspace-body {
    width: calc(100% - 32px);
    padding-top: 118px;
  }

  .workspace-body h1 {
    font-size: 32px;
  }

  .workspace-metrics {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .metric-card {
    width: auto;
    padding: 12px;
  }

  .metric-card strong {
    font-size: 20px;
  }

  .product-showcase__layout {
    --tr-layout-floating-radius: 0px;
  }

  .chat-main__content {
    width: calc(100% - 32px);
  }

  .chat-header {
    padding: 0 14px;
  }

  .header-action {
    max-width: 110px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chat-footer {
    padding-inline: 14px;
  }

  .composer > span {
    display: none;
  }
}
</style>
