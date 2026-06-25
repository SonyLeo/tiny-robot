const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/floating-panels.BnxGjrW6.js","assets/chunks/theme.DHQenhyE.js","assets/chunks/framework.B4VLx0KC.js","assets/chunks/floating.Du4Xvzu6.js","assets/chunks/main-scroll.C5fkf2Yw.js","assets/chunks/aside-resizable.QWzYUdAU.js","assets/chunks/aside-slot-props.CyLIwCV8.js","assets/chunks/aside-collapse-effect.Db2IKvIn.js","assets/chunks/aside-modes.DWWDV6rR.js","assets/chunks/basic.Ti9lBSbs.js"])))=>i.map(i=>d[i]);
import{aD as r,bQ as s,aZ as B,aL as D,v as L,H as h,bL as c,bB as p,J as e,bk as a,bJ as n,G as u,w as l,I as b,b7 as y,aU as w}from"./chunks/framework.B4VLx0KC.js";import{L as f,N as m}from"./chunks/index.DwvxFyhW.js";const T=`<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutAsideSideOpenEventDetail, LayoutFloatingOptions, LayoutFloatingState } from '@opentiny/tiny-robot'

const open = ref(false)
const leftOpen = ref(false)
const rightOpen = ref(false)

const defaultFloatingState: LayoutFloatingState = {
  placement: 'top-right',
  offsetX: 24,
  offsetY: 32,
  width: 560,
  height: 420,
}

const floatingOptions: LayoutFloatingOptions = {
  draggable: true,
  resizable: true,
  minWidth: 420,
  maxWidth: 760,
  minHeight: 320,
}

function updateLeftAside(detail: LayoutAsideSideOpenEventDetail) {
  leftOpen.value = detail.open
}

function updateRightAside(detail: LayoutAsideSideOpenEventDetail) {
  rightOpen.value = detail.open
}
<\/script>

<template>
  <div class="layout-floating-panels-demo">
    <div class="layout-floating-panels-demo__toolbar">
      <button type="button" class="layout-floating-panels-demo__button" @click="open = !open">
        {{ open ? '关闭浮层' : '打开浮层' }}
      </button>
    </div>

    <TrLayout
      v-if="open"
      class="layout-floating-panels-demo__layout"
      mode="floating"
      :default-floating-state="defaultFloatingState"
      :floating-options="floatingOptions"
      :left-aside="{ mode: 'drawer', open: leftOpen }"
      :right-aside="{ mode: 'drawer', open: rightOpen }"
      @left-aside-open-change="updateLeftAside"
      @right-aside-open-change="updateRightAside"
    >
      <template #left-aside>
        <div class="layout-floating-panels-demo__drawer">
          <div class="layout-floating-panels-demo__drawer-title">左侧抽屉</div>
          <div>适合放筛选、导航或补充信息。</div>
          <TrLayout.AsideToggle side="left" class="layout-floating-panels-demo__chip">关闭抽屉</TrLayout.AsideToggle>
        </div>
      </template>

      <template #header>
        <div class="layout-floating-panels-demo__header">
          <strong>浮层工作区</strong>
          <div class="layout-floating-panels-demo__actions">
            <button type="button" class="layout-floating-panels-demo__button" @click="leftOpen = true">
              打开左抽屉
            </button>
            <button type="button" class="layout-floating-panels-demo__button" @click="rightOpen = true">
              打开右抽屉
            </button>
          </div>
        </div>
      </template>

      <template #main>
        <div class="layout-floating-panels-demo__main">
          <div class="layout-floating-panels-demo__card">左右两侧都使用 drawer，需要时再展开，不占主区宽度。</div>
          <div class="layout-floating-panels-demo__card">整个浮层仍可拖拽、缩放，适合临时工作区或对话面板。</div>
        </div>
      </template>

      <template #right-aside>
        <div class="layout-floating-panels-demo__drawer">
          <div class="layout-floating-panels-demo__drawer-title">右侧抽屉</div>
          <div>点击遮罩、按 \`Esc\` 或按钮都可以关闭。</div>
          <TrLayout.AsideToggle side="right" class="layout-floating-panels-demo__chip">关闭抽屉</TrLayout.AsideToggle>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style>
.layout-floating-panels-demo__layout {
  --tr-layout-floating-radius: 16px;
  --tr-layout-drawer-width: 240px;
}
</style>

<style scoped>
.layout-floating-panels-demo {
  display: grid;
  gap: 8px;
}

.layout-floating-panels-demo__toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.layout-floating-panels-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.layout-floating-panels-demo__button,
.layout-floating-panels-demo__chip,
.layout-floating-panels-demo__rail-chip {
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  background: var(--vp-c-bg, #ffffff);
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-floating-panels-demo__button,
.layout-floating-panels-demo__chip {
  min-height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  cursor: pointer;
}

.layout-floating-panels-demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 24px 16px;
  background: var(--vp-c-bg, #ffffff);
}

.layout-floating-panels-demo__main,
.layout-floating-panels-demo__drawer {
  display: grid;
  align-content: start;
  gap: 12px;
  padding: 16px;
  box-sizing: border-box;
  height: 100%;
  background: var(--vp-c-bg, #ffffff);
}

.layout-floating-panels-demo__main {
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-floating-panels-demo__card {
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--vp-c-bg-soft, #f6f8fa);
}

.layout-floating-panels-demo__drawer-title {
  font-weight: 600;
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}
</style>
`,W=`<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutFloatingOptions, LayoutFloatingState } from '@opentiny/tiny-robot'

const open = ref(false)

const defaultFloatingState: LayoutFloatingState = {
  placement: 'top-right',
  offsetX: 24,
  offsetY: 32,
  width: 520,
  height: 360,
}

const floatingOptions: LayoutFloatingOptions = {
  draggable: true,
  resizable: true,
  minWidth: 360,
  maxWidth: 680,
}
<\/script>

<template>
  <div class="layout-floating-demo">
    <div class="layout-floating-demo__toolbar">
      <button type="button" class="layout-floating-demo__trigger" @click="open = !open">
        {{ open ? '关闭浮层' : '打开浮层' }}
      </button>
      <span class="layout-floating-demo__tip">拖动顶部横条或边缘手柄调整位置和大小。</span>
    </div>

    <TrLayout
      v-if="open"
      class="layout-floating-demo__layout"
      mode="floating"
      :default-floating-state="defaultFloatingState"
      :floating-options="floatingOptions"
    >
      <template #header>
        <div class="layout-floating-demo__header">
          <strong>浮层布局</strong>
          <button type="button" class="layout-floating-demo__close" @click="open = false">关闭</button>
        </div>
      </template>

      <template #main>
        <div class="layout-floating-demo__main">
          <div class="layout-floating-demo__card">\`defaultFloatingState\` 设置初始位置和大小。</div>
          <div class="layout-floating-demo__card">\`floatingOptions\` 控制拖动、缩放和尺寸范围。</div>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style>
.layout-floating-demo__layout {
  --tr-layout-floating-radius: 12px;
}
</style>

<style scoped>
.layout-floating-demo {
  display: grid;
  gap: 8px;
}

.layout-floating-demo__toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.layout-floating-demo__trigger,
.layout-floating-demo__close {
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 8px;
  background: var(--vp-c-bg, #ffffff);
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
  cursor: pointer;
}

.layout-floating-demo__tip {
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-floating-demo__main {
  display: grid;
  gap: 12px;
  padding: 16px;
}

.layout-floating-demo__card {
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--vp-c-bg-soft, #f6f8fa);
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-floating-demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}
</style>
`,F=`<script setup lang="ts">
import { ref } from 'vue'
import { TinySwitch } from '@opentiny/vue'
import MainScrollBubble from './main-scroll-bubble.vue'
import MainScrollDiv from './main-scroll-div.vue'

const activeExample = ref<'bubble' | 'div'>('bubble')
const isCentered = ref(true)
<\/script>

<template>
  <div class="layout-main-scroll-demo">
    <div class="layout-main-scroll-demo__toolbar">
      <div class="layout-main-scroll-demo__switcher" aria-label="主区滚动示例切换">
        <button
          type="button"
          class="layout-main-scroll-demo__switch"
          :class="{ 'is-active': activeExample === 'bubble' }"
          :aria-pressed="activeExample === 'bubble'"
          @click="activeExample = 'bubble'"
        >
          BubbleList
        </button>

        <button
          type="button"
          class="layout-main-scroll-demo__switch"
          :class="{ 'is-active': activeExample === 'div' }"
          :aria-pressed="activeExample === 'div'"
          @click="activeExample = 'div'"
        >
          普通 div
        </button>
      </div>

      <label class="layout-main-scroll-demo__field">
        <span>内容居中</span>
        <tiny-switch v-model="isCentered"></tiny-switch>
      </label>
    </div>

    <div class="layout-main-scroll-demo__stage">
      <MainScrollBubble v-if="activeExample === 'bubble'" :centered="isCentered" />
      <MainScrollDiv v-else :centered="isCentered" />
    </div>
  </div>
</template>

<style scoped>
.layout-main-scroll-demo {
  display: grid;
  gap: 12px;
}

.layout-main-scroll-demo__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.layout-main-scroll-demo__switcher {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.layout-main-scroll-demo__field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-main-scroll-demo__switch {
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 8px;
  background: var(--vp-c-bg, #ffffff);
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
  cursor: pointer;
}

.layout-main-scroll-demo__switch.is-active {
  border-color: var(--vp-c-brand-1, var(--tr-color-primary, #5e7ce0));
  color: var(--vp-c-brand-1, var(--tr-color-primary, #5e7ce0));
}

.layout-main-scroll-demo__stage {
  --tr-layout-height: 400px;
}
</style>
`,S=`<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutAsideProps, LayoutAsideSideResizeEventDetail } from '@opentiny/tiny-robot'

const minExpandedWidth = 160
const maxExpandedWidth = 320
const expandedWidth = ref(220)

const leftAside = computed<LayoutAsideProps>(() => ({
  defaultOpen: true,
  expandedWidth: expandedWidth.value,
  minExpandedWidth,
  maxExpandedWidth,
  resizable: true,
}))

function updateLeftAsideWidth(detail: LayoutAsideSideResizeEventDetail) {
  expandedWidth.value = detail.expandedWidth
}
<\/script>

<template>
  <div class="layout-aside-resizable-demo">
    <TrLayout :left-aside="leftAside" @left-aside-resize="updateLeftAsideWidth">
      <template #left-aside>
        <div class="layout-aside-resizable-demo__aside">
          <strong>{{ expandedWidth }}px</strong>
          <span>拖动右侧分隔线</span>
        </div>
      </template>

      <template #main>
        <div class="layout-aside-resizable-demo__main">
          <div class="layout-aside-resizable-demo__metric">
            <span>最小宽度</span>
            <strong>{{ minExpandedWidth }}px</strong>
          </div>
          <div class="layout-aside-resizable-demo__metric">
            <span>当前宽度</span>
            <strong>{{ expandedWidth }}px</strong>
          </div>
          <div class="layout-aside-resizable-demo__metric">
            <span>最大宽度</span>
            <strong>{{ maxExpandedWidth }}px</strong>
          </div>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style scoped>
.layout-aside-resizable-demo {
  --tr-layout-height: 100%;
  --tr-layout-main-min-width: 0;
  --tr-layout-left-aside-bg: var(--vp-c-bg-alt, #f8fafc);
  height: 400px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 16px;
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-aside-resizable-demo__aside {
  display: grid;
  place-items: center;
  gap: 8px;
  height: 100%;
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-aside-resizable-demo__aside strong {
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-aside-resizable-demo__main {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  align-content: center;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-aside-resizable-demo__metric {
  display: grid;
  gap: 6px;
  padding: 12px;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 8px;
  background: var(--vp-c-bg, #ffffff);
}

.layout-aside-resizable-demo__metric strong {
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

@media (max-width: 520px) {
  .layout-aside-resizable-demo__main {
    grid-template-columns: 1fr;
  }
}
</style>
`,z=`<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type {
  LayoutAsideProps,
  LayoutAsideSideOpenEventDetail,
  LayoutAsideSideResizeEventDetail,
} from '@opentiny/tiny-robot'

const leftOpen = ref(true)
const leftExpandedWidth = ref(220)
const rightOpen = ref(false)

const leftAside = computed<LayoutAsideProps>(() => ({
  open: leftOpen.value,
  expandedWidth: leftExpandedWidth.value,
  collapsedWidth: 88,
  minExpandedWidth: 160,
  maxExpandedWidth: 320,
  resizable: true,
}))

const rightAside = computed<LayoutAsideProps>(() => ({
  mode: 'drawer',
  open: rightOpen.value,
}))

function updateLeftAsideOpen(detail: LayoutAsideSideOpenEventDetail) {
  leftOpen.value = detail.open
}

function updateLeftAsideWidth(detail: LayoutAsideSideResizeEventDetail) {
  leftExpandedWidth.value = detail.expandedWidth
}

function updateRightAsideOpen(detail: LayoutAsideSideOpenEventDetail) {
  rightOpen.value = detail.open
}

function setLeftExpandedWidth(nextWidth: number) {
  leftOpen.value = true
  leftExpandedWidth.value = nextWidth
}
<\/script>

<template>
  <div class="layout-slot-props-demo">
    <div class="layout-slot-props-demo__controls">
      <div class="layout-slot-props-demo__group">
        <span class="layout-slot-props-demo__group-label">左侧栏</span>
        <button type="button" class="layout-slot-props-demo__button" @click="leftOpen = !leftOpen">
          {{ leftOpen ? '收起左侧栏' : '展开左侧栏' }}
        </button>
        <button type="button" class="layout-slot-props-demo__button" @click="leftOpen = true">展开</button>
        <button type="button" class="layout-slot-props-demo__button" @click="leftOpen = false">收起</button>
        <button type="button" class="layout-slot-props-demo__button" @click="setLeftExpandedWidth(160)">
          宽度 160
        </button>
        <button type="button" class="layout-slot-props-demo__button" @click="setLeftExpandedWidth(240)">
          宽度 240
        </button>
        <button type="button" class="layout-slot-props-demo__button" @click="setLeftExpandedWidth(320)">
          宽度 320
        </button>
      </div>

      <div class="layout-slot-props-demo__group">
        <span class="layout-slot-props-demo__group-label">右侧栏</span>
        <button type="button" class="layout-slot-props-demo__button" @click="rightOpen = true">打开抽屉</button>
        <button type="button" class="layout-slot-props-demo__button" @click="rightOpen = false">关闭抽屉</button>
      </div>
    </div>

    <TrLayout
      class="layout-slot-props-demo__layout"
      :left-aside="leftAside"
      :right-aside="rightAside"
      @left-aside-open-change="updateLeftAsideOpen"
      @left-aside-resize="updateLeftAsideWidth"
      @right-aside-open-change="updateRightAsideOpen"
    >
      <template #left-aside>
        <div v-if="leftOpen" class="layout-slot-props-demo__aside">
          <p class="layout-slot-props-demo__summary">left / dock / {{ leftOpen ? 'open' : 'closed' }}</p>

          <dl class="layout-slot-props-demo__list">
            <div class="layout-slot-props-demo__row">
              <dt>expandedWidth</dt>
              <dd>{{ leftExpandedWidth }}</dd>
            </div>
            <div class="layout-slot-props-demo__row">
              <dt>collapsedWidth</dt>
              <dd>{{ leftAside.collapsedWidth }}</dd>
            </div>
            <div class="layout-slot-props-demo__row">
              <dt>resizable</dt>
              <dd>{{ leftAside.resizable }}</dd>
            </div>
          </dl>

          <TrLayout.AsideToggle side="left" class="layout-slot-props-demo__button">
            <template #default="{ isOpen }">
              {{ isOpen ? '收起侧栏' : '展开侧栏' }}
            </template>
          </TrLayout.AsideToggle>
        </div>

        <div v-else class="layout-slot-props-demo__rail">
          <TrLayout.AsideToggle side="left" class="layout-slot-props-demo__button">
            <template #default="{ isOpen }">
              {{ isOpen ? '收起' : '展开' }}
            </template>
          </TrLayout.AsideToggle>
        </div>
      </template>

      <template #header>
        <div class="layout-slot-props-demo__header">外层更新 leftAside / rightAside，并通过事件回写状态。</div>
      </template>

      <template #main>
        <div class="layout-slot-props-demo__main">
          <p>外层控制 open 和 expandedWidth，状态变化后再传回组件。</p>
          <p>侧栏内部可以使用 Layout.AsideToggle，它的默认插槽会提供当前开关状态。</p>
        </div>
      </template>

      <template #right-aside>
        <div class="layout-slot-props-demo__drawer">
          <p class="layout-slot-props-demo__summary">right / drawer / {{ rightOpen ? 'open' : 'closed' }}</p>
          <p>右侧抽屉由 rightAside.open 控制。</p>
          <TrLayout.AsideToggle side="right" class="layout-slot-props-demo__button"> 关闭抽屉 </TrLayout.AsideToggle>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style>
.layout-slot-props-demo__layout {
  --tr-layout-height: 360px;
  --tr-layout-left-aside-bg: var(--vp-c-bg-alt, #f8fafc);
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 16px;
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}
</style>

<style scoped>
.layout-slot-props-demo {
  display: grid;
  gap: 12px;
}

.layout-slot-props-demo__controls {
  display: grid;
  gap: 8px;
}

.layout-slot-props-demo__group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.layout-slot-props-demo__group-label {
  font-size: 12px;
  font-weight: 600;
}

.layout-slot-props-demo__button {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 8px;
  background: var(--vp-c-bg, #ffffff);
  color: inherit;
  cursor: pointer;
}

.layout-slot-props-demo__header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  background: var(--vp-c-bg, #ffffff);
}

.layout-slot-props-demo__aside,
.layout-slot-props-demo__drawer,
.layout-slot-props-demo__main {
  display: grid;
  align-content: start;
  gap: 10px;
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  padding: 16px;
  background: var(--vp-c-bg, #ffffff);
}

.layout-slot-props-demo__rail {
  display: grid;
  place-items: center;
  box-sizing: border-box;
  height: 100%;
  padding: 12px;
  background: var(--vp-c-bg, #ffffff);
}

.layout-slot-props-demo__summary,
.layout-slot-props-demo__main p,
.layout-slot-props-demo__drawer p,
.layout-slot-props-demo__list dt,
.layout-slot-props-demo__list dd {
  margin: 0;
}

.layout-slot-props-demo__summary,
.layout-slot-props-demo__main,
.layout-slot-props-demo__drawer {
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-slot-props-demo__list {
  display: grid;
  gap: 6px;
  margin: 0;
}

.layout-slot-props-demo__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
</style>
`,X=`<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import { TinyRadio, TinyRadioGroup, TinySwitch } from '@opentiny/vue'
import type { LayoutAsideCollapseEffect, LayoutAsideProps } from '@opentiny/tiny-robot'

const collapseEffect = ref<LayoutAsideCollapseEffect>('overlay')
const collapsedWidth = ref(72)
const open = ref(true)

const leftAside = computed<LayoutAsideProps>(() => ({
  open: open.value,
  expandedWidth: 176,
  collapsedWidth: collapsedWidth.value,
  collapseEffect: collapseEffect.value,
}))

const hint = computed(() =>
  collapseEffect.value === 'overlay' ? '收起时更像把内容盖住，内容留在原位' : '收起时更像整块一起滑走',
)

const collapsedHint = computed(() =>
  collapsedWidth.value === 0 ? '当前收起到 0，主要看收起过程。' : '当前会留一条窄栏，更容易看出两种结果的差别。',
)
<\/script>

<template>
  <div class="layout-collapse-effect-demo">
    <div class="layout-collapse-effect-demo__controls">
      <div class="layout-collapse-effect-demo__group">
        <label class="layout-collapse-effect-demo__field">
          <span>收起方式</span>
          <tiny-radio-group v-model="collapseEffect">
            <tiny-radio label="overlay">overlay</tiny-radio>
            <tiny-radio label="slide">slide</tiny-radio>
          </tiny-radio-group>
        </label>

        <label class="layout-collapse-effect-demo__field">
          <span>展开</span>
          <tiny-switch v-model="open"></tiny-switch>
        </label>
      </div>

      <label class="layout-collapse-effect-demo__field layout-collapse-effect-demo__field--range">
        <span class="layout-collapse-effect-demo__range-label">收起宽度</span>
        <input
          v-model.number="collapsedWidth"
          class="layout-collapse-effect-demo__range"
          type="range"
          min="0"
          max="120"
          step="4"
        />
        <strong>{{ collapsedWidth }}px</strong>
      </label>
    </div>

    <TrLayout class="layout-collapse-effect-demo__layout" :left-aside="leftAside">
      <template #left-aside>
        <div class="layout-collapse-effect-demo__aside">
          <div class="layout-collapse-effect-demo__aside-rail" />
          <div class="layout-collapse-effect-demo__aside-panel" />
        </div>
      </template>

      <template #main>
        <div class="layout-collapse-effect-demo__main">
          <strong>{{ collapseEffect }}</strong>
          <span>{{ hint }}</span>
          <em>{{ collapsedHint }}</em>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style>
.layout-collapse-effect-demo__layout {
  --layout-collapse-effect-demo-aside-bg: color-mix(
    in srgb,
    var(--vp-c-brand-1, var(--tr-color-primary, #5e7ce0)) 6%,
    var(--vp-c-bg, #ffffff)
  );
  --layout-collapse-effect-demo-rail-bg: color-mix(in srgb, var(--vp-c-text-1, #1f2329) 4%, var(--vp-c-bg, #ffffff));
  --layout-collapse-effect-demo-panel-bg: color-mix(
    in srgb,
    var(--vp-c-brand-1, var(--tr-color-primary, #5e7ce0)) 10%,
    var(--vp-c-bg, #ffffff)
  );
  --tr-layout-height: 216px;
  --tr-layout-main-min-width: 0;
  --tr-layout-left-aside-bg: var(--layout-collapse-effect-demo-aside-bg);
  --tr-layout-main-bg: var(--vp-c-bg, #ffffff);
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 12px;
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}
</style>

<style scoped>
.layout-collapse-effect-demo {
  display: grid;
  gap: 12px;
}

.layout-collapse-effect-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.layout-collapse-effect-demo__group {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.layout-collapse-effect-demo__field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-collapse-effect-demo__field--range {
  min-width: min(320px, 100%);
  flex: 1 1 280px;
}

.layout-collapse-effect-demo__range-label {
  min-width: 60px;
}

.layout-collapse-effect-demo__range {
  width: 100%;
  min-width: 120px;
}

.layout-collapse-effect-demo__aside {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 10px;
  box-sizing: border-box;
  width: 176px;
  height: 100%;
  padding: 12px;
  background: var(--layout-collapse-effect-demo-aside-bg);
}

.layout-collapse-effect-demo__aside-rail,
.layout-collapse-effect-demo__aside-panel {
  height: 100%;
  border-radius: 12px;
}

.layout-collapse-effect-demo__aside-rail {
  background: var(--layout-collapse-effect-demo-rail-bg);
}

.layout-collapse-effect-demo__aside-panel {
  background: var(--layout-collapse-effect-demo-panel-bg);
}

.layout-collapse-effect-demo__main {
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 8px;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
  text-align: center;
  background: var(--vp-c-bg, #ffffff);
}

.layout-collapse-effect-demo__main strong {
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
  font-size: 14px;
}

.layout-collapse-effect-demo__main em {
  font-style: normal;
  font-size: 12px;
}
</style>
`,O=`<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutAsideSideOpenEventDetail } from '@opentiny/tiny-robot'

const leftOpen = ref(true)
const rightOpen = ref(false)

function updateLeftAside(detail: LayoutAsideSideOpenEventDetail) {
  leftOpen.value = detail.open
}

function updateRightAside(detail: LayoutAsideSideOpenEventDetail) {
  rightOpen.value = detail.open
}
<\/script>

<template>
  <div class="layout-aside-demo">
    <TrLayout
      :left-aside="{ open: leftOpen, expandedWidth: 156, collapsedWidth: 56 }"
      :right-aside="{ mode: 'drawer', open: rightOpen }"
      @left-aside-open-change="updateLeftAside"
      @right-aside-open-change="updateRightAside"
    >
      <template #left-aside>
        <div v-if="leftOpen" class="layout-aside-demo__aside">
          <TrLayout.AsideToggle side="left" class="layout-aside-demo__chip">收起侧栏</TrLayout.AsideToggle>
          <div class="layout-aside-demo__chip">collapsedWidth: 56px</div>
        </div>
        <div v-else class="layout-aside-demo__rail">
          <TrLayout.AsideToggle side="left" class="layout-aside-demo__rail-chip">栏</TrLayout.AsideToggle>
          <div class="layout-aside-demo__rail-chip">56</div>
        </div>
      </template>

      <template #header>
        <div class="layout-aside-demo__header">
          <span>侧栏模式</span>
          <button type="button" class="layout-aside-demo__chip" @click="rightOpen = true">打开抽屉</button>
        </div>
      </template>

      <template #main>
        <div class="layout-aside-demo__main">左侧是 \`dock + collapsedWidth\`，右侧是 \`drawer\`。</div>
      </template>

      <template #right-aside>
        <div class="layout-aside-demo__drawer layout-aside-demo__drawer-panel">
          <div>Drawer</div>
          <div>点击遮罩、按 \`Esc\` 或按钮关闭。</div>
          <TrLayout.AsideToggle side="right" class="layout-aside-demo__chip">关闭抽屉</TrLayout.AsideToggle>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style scoped>
.layout-aside-demo {
  --tr-layout-height: 100%;
  --tr-layout-left-aside-bg: var(--vp-c-bg-alt, #f8fafc);
  --tr-layout-drawer-width: 240px;
  height: 400px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 16px;
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-aside-demo__drawer-panel {
  height: 100%;
}

.layout-aside-demo__header,
.layout-aside-demo__main,
.layout-aside-demo__drawer {
  background: var(--vp-c-bg, #ffffff);
}

.layout-aside-demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
}

.layout-aside-demo__main,
.layout-aside-demo__aside,
.layout-aside-demo__drawer {
  padding: 16px;
  box-sizing: border-box;
}

.layout-aside-demo__aside,
.layout-aside-demo__drawer,
.layout-aside-demo__rail {
  display: grid;
  gap: 8px;
}

.layout-aside-demo__rail {
  width: 56px;
  height: 100%;
  padding: 12px 8px;
  box-sizing: border-box;
  justify-items: center;
}

.layout-aside-demo__drawer {
  min-height: 100%;
}

.layout-aside-demo__main,
.layout-aside-demo__drawer {
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-aside-demo__chip,
.layout-aside-demo__rail-chip {
  display: grid;
  place-items: center;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  background: var(--vp-c-bg, #ffffff);
  color: inherit;
}

.layout-aside-demo__chip {
  min-height: 36px;
  padding: 0 12px;
  border-radius: 8px;
}

.layout-aside-demo__rail-chip {
  width: 40px;
  min-height: 40px;
  padding: 0;
  border-radius: 8px;
}
</style>
`,Z=`<script setup lang="ts">
import { TrLayout } from '@opentiny/tiny-robot'
<\/script>

<template>
  <div class="layout-basic-demo">
    <TrLayout
      :left-aside="{ defaultOpen: true, defaultExpandedWidth: 160 }"
      :right-aside="{ defaultOpen: true, defaultExpandedWidth: 160 }"
    >
      <template #left-aside>
        <div class="layout-basic-demo__aside">导航</div>
      </template>

      <template #header>
        <div class="layout-basic-demo__header">Header</div>
      </template>

      <template #main>
        <div class="layout-basic-demo__main">Main</div>
      </template>

      <template #footer>
        <div class="layout-basic-demo__footer">Footer</div>
      </template>

      <template #right-aside>
        <div class="layout-basic-demo__aside">信息栏</div>
      </template>
    </TrLayout>
  </div>
</template>

<style scoped>
.layout-basic-demo {
  --tr-layout-height: 100%;
  --tr-layout-main-min-width: 0;
  --tr-layout-header-bg: var(--vp-c-bg-soft, #f6f8fa);
  --tr-layout-main-bg: var(--vp-c-bg, #ffffff);
  --tr-layout-footer-bg: var(--vp-c-bg-soft, #f6f8fa);
  --tr-layout-left-aside-bg: var(--vp-c-bg-alt, #f8fafc);
  --tr-layout-right-aside-bg: var(--vp-c-bg-alt, #f8fafc);
  height: 400px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 16px;
}

.layout-basic-demo__header,
.layout-basic-demo__footer {
  padding: 12px 16px;
  text-align: center;
}

.layout-basic-demo__main,
.layout-basic-demo__aside {
  display: grid;
  place-items: center;
  height: 100%;
}
</style>
`,G=JSON.parse('{"title":"Layout 布局","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/layout.md","filePath":"components/layout.md"}'),P={name:"components/layout.md"},V=Object.assign(P,{setup(q){const g=y();r(async()=>{g.value=(await s(async()=>{const{default:d}=await import("./chunks/floating-panels.BnxGjrW6.js");return{default:d}},__vite__mapDeps([0,1,2]))).default});const v=y();r(async()=>{v.value=(await s(async()=>{const{default:d}=await import("./chunks/floating.Du4Xvzu6.js");return{default:d}},__vite__mapDeps([3,1,2]))).default});const _=y();r(async()=>{_.value=(await s(async()=>{const{default:d}=await import("./chunks/main-scroll.C5fkf2Yw.js");return{default:d}},__vite__mapDeps([4,1,2]))).default});const C=y();r(async()=>{C.value=(await s(async()=>{const{default:d}=await import("./chunks/aside-resizable.QWzYUdAU.js");return{default:d}},__vite__mapDeps([5,1,2]))).default});const x=y();r(async()=>{x.value=(await s(async()=>{const{default:d}=await import("./chunks/aside-slot-props.CyLIwCV8.js");return{default:d}},__vite__mapDeps([6,1,2]))).default});const A=y();r(async()=>{A.value=(await s(async()=>{const{default:d}=await import("./chunks/aside-collapse-effect.Db2IKvIn.js");return{default:d}},__vite__mapDeps([7,2,1]))).default});const E=y();r(async()=>{E.value=(await s(async()=>{const{default:d}=await import("./chunks/aside-modes.DWWDV6rR.js");return{default:d}},__vite__mapDeps([8,1,2]))).default});const o=w(!0),k=y();return r(async()=>{k.value=(await s(async()=>{const{default:d}=await import("./chunks/basic.Ti9lBSbs.js");return{default:d}},__vite__mapDeps([9,1,2]))).default}),(d,t)=>{const i=B("ClientOnly");return D(),L("div",null,[t[8]||(t[8]=h('<h1 id="layout-布局" tabindex="-1">Layout 布局 <a class="header-anchor" href="#layout-布局" aria-label="Permalink to &quot;Layout 布局&quot;">​</a></h1><p><code>Layout</code> 用来组织带有头部、主内容区、底部和左右侧栏的页面。</p><p>它覆盖三类核心场景：</p><ul><li>标准页面骨架</li><li>可收起的左右侧栏</li><li>可拖动、可缩放的浮层布局</li></ul><h2 id="基础布局" tabindex="-1">基础布局 <a class="header-anchor" href="#基础布局" aria-label="Permalink to &quot;基础布局&quot;">​</a></h2><p><code>Layout</code> 用于定义页面结构，区域中的具体内容可按需配置。</p>',6)),c(e(a(f),null,null,512),[[p,o.value]]),e(i,null,{default:n(()=>[e(a(m),{title:"基础布局",description:"最小布局示例。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{o.value=!1}),vueCode:a(Z)},u({_:2},[k.value?{name:"vue",fn:n(()=>[e(a(k))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[9]||(t[9]=h('<h2 id="侧栏" tabindex="-1">侧栏 <a class="header-anchor" href="#侧栏" aria-label="Permalink to &quot;侧栏&quot;">​</a></h2><h3 id="展示形态" tabindex="-1">展示形态 <a class="header-anchor" href="#展示形态" aria-label="Permalink to &quot;展示形态&quot;">​</a></h3><p>用 <code>leftAside</code> / <code>rightAside</code> 配置侧栏。</p><ul><li><code>dock</code>：占据页面空间</li><li><code>drawer</code>：覆盖在内容上方</li></ul><p><code>drawer</code> 的宽度优先通过 <code>--tr-layout-drawer-width</code> 控制，未设置时回退到侧栏展开宽度。</p>',5)),c(e(a(f),null,null,512),[[p,o.value]]),e(i,null,{default:n(()=>[e(a(m),{title:"显示模式",description:"左侧占据页面空间，右侧覆盖在内容上方。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[1]||(t[1]=()=>{o.value=!1}),vueCode:a(O)},u({_:2},[E.value?{name:"vue",fn:n(()=>[e(a(E))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[10]||(t[10]=h('<h3 id="收起行为" tabindex="-1">收起行为 <a class="header-anchor" href="#收起行为" aria-label="Permalink to &quot;收起行为&quot;">​</a></h3><p><code>collapsedWidth</code> 控制收起后还保留多少宽度，<code>collapseEffect</code> 控制收起时的动画效果。</p><ul><li><code>collapsedWidth &gt; 0</code>：收起后保留一条窄栏</li><li><code>collapsedWidth = 0</code>：收起后完全隐藏</li><li><code>overlay</code>：内容留在原位</li><li><code>slide</code>：内容跟着一起移动</li></ul>',3)),c(e(a(f),null,null,512),[[p,o.value]]),e(i,null,{default:n(()=>[e(a(m),{title:"收起行为",description:"对比 overlay 和 slide 两种收起动画。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[2]||(t[2]=()=>{o.value=!1}),vueCode:a(X)},u({_:2},[A.value?{name:"vue",fn:n(()=>[e(a(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[11]||(t[11]=h('<h3 id="状态控制" tabindex="-1">状态控制 <a class="header-anchor" href="#状态控制" aria-label="Permalink to &quot;状态控制&quot;">​</a></h3><p>用 <code>leftAside</code> / <code>rightAside</code> 控制开关和宽度。</p><p>侧栏内容通过 <code>left-aside</code> / <code>right-aside</code> 提供。</p><p>受控用法下，状态变化后需要同步回写。侧栏内部切换可使用 <code>Layout.AsideToggle</code>，默认插槽提供 <code>{ isOpen }</code>。</p>',4)),c(e(a(f),null,null,512),[[p,o.value]]),e(i,null,{default:n(()=>[e(a(m),{title:"状态控制",description:"通过 leftAside、rightAside 和事件同步侧栏状态。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[3]||(t[3]=()=>{o.value=!1}),vueCode:a(z)},u({_:2},[x.value?{name:"vue",fn:n(()=>[e(a(x))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[12]||(t[12]=l("h3",{id:"宽度调整",tabindex:"-1"},[b("宽度调整 "),l("a",{class:"header-anchor",href:"#宽度调整","aria-label":'Permalink to "宽度调整"'},"​")],-1)),t[13]||(t[13]=l("p",null,[l("code",null,"resizable"),b(" 可以开启 "),l("code",null,"dock"),b(" 侧栏的拖拽改宽，宽度范围由 "),l("code",null,"minExpandedWidth"),b(" 和 "),l("code",null,"maxExpandedWidth"),b(" 控制。")],-1)),c(e(a(f),null,null,512),[[p,o.value]]),e(i,null,{default:n(()=>[e(a(m),{title:"宽度调整",description:"拖动分隔线查看当前宽度和边界。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[4]||(t[4]=()=>{o.value=!1}),vueCode:a(S)},u({_:2},[C.value?{name:"vue",fn:n(()=>[e(a(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[14]||(t[14]=h(`<h2 id="主区滚动" tabindex="-1">主区滚动 <a class="header-anchor" href="#主区滚动" aria-label="Permalink to &quot;主区滚动&quot;">​</a></h2><p><code>Layout.ProxyScrollbar</code> 用来显示主区滚动条，<code>scrollTarget</code> 指向实际滚动的内容区域。</p><blockquote><p>适合消息区居中的对话页：内容可以居中，滚动条仍固定在主区右侧，视觉更整齐。</p></blockquote><ul><li><code>scrollTarget</code> 传实际滚动元素，或对应组件实例的 <code>ref</code></li><li>该元素需自行设置尺寸、<code>box-sizing</code> 和滚动样式</li><li>使用 <code>Layout.ProxyScrollbar</code> 时，建议同时隐藏该元素的原生滚动条，例如：</li></ul><div class="language-css vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">css</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">.scroll-host</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  width</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">100</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">%</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  height</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">100</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">%</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  box-sizing</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">border-box</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  overflow</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">auto</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  scrollbar-width</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">none</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -ms-overflow-style</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">none</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">.scroll-host::-webkit-scrollbar</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  display</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">none</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div>`,5)),c(e(a(f),null,null,512),[[p,o.value]]),e(i,null,{default:n(()=>[e(a(m),{title:"主区滚动",description:"演示内容区居中后，滚动条仍固定在主区右侧。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22main-scroll.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Flayout%2Fmain-scroll.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20TinySwitch%20%7D%20from%20'%40opentiny%2Fvue'%5Cnimport%20MainScrollBubble%20from%20'.%2Fmain-scroll-bubble.vue'%5Cnimport%20MainScrollDiv%20from%20'.%2Fmain-scroll-div.vue'%5Cn%5Cnconst%20activeExample%20%3D%20ref%3C'bubble'%20%7C%20'div'%3E('bubble')%5Cnconst%20isCentered%20%3D%20ref(true)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22layout-main-scroll-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22layout-main-scroll-demo__toolbar%5C%22%3E%5Cn%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22layout-main-scroll-demo__switcher%5C%22%20aria-label%3D%5C%22%E4%B8%BB%E5%8C%BA%E6%BB%9A%E5%8A%A8%E7%A4%BA%E4%BE%8B%E5%88%87%E6%8D%A2%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20class%3D%5C%22layout-main-scroll-demo__switch%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%7B%20'is-active'%3A%20activeExample%20%3D%3D%3D%20'bubble'%20%7D%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Aaria-pressed%3D%5C%22activeExample%20%3D%3D%3D%20'bubble'%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%40click%3D%5C%22activeExample%20%3D%20'bubble'%5C%22%5Cn%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20BubbleList%5Cn%20%20%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%5Cn%20%20%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20class%3D%5C%22layout-main-scroll-demo__switch%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%7B%20'is-active'%3A%20activeExample%20%3D%3D%3D%20'div'%20%7D%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Aaria-pressed%3D%5C%22activeExample%20%3D%3D%3D%20'div'%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%40click%3D%5C%22activeExample%20%3D%20'div'%5C%22%5Cn%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%E6%99%AE%E9%80%9A%20div%5Cn%20%20%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%20%20%3Clabel%20class%3D%5C%22layout-main-scroll-demo__field%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cspan%3E%E5%86%85%E5%AE%B9%E5%B1%85%E4%B8%AD%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%3Ctiny-switch%20v-model%3D%5C%22isCentered%5C%22%3E%3C%2Ftiny-switch%3E%5Cn%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22layout-main-scroll-demo__stage%5C%22%3E%5Cn%20%20%20%20%20%20%3CMainScrollBubble%20v-if%3D%5C%22activeExample%20%3D%3D%3D%20'bubble'%5C%22%20%3Acentered%3D%5C%22isCentered%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%3CMainScrollDiv%20v-else%20%3Acentered%3D%5C%22isCentered%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.layout-main-scroll-demo%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__toolbar%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__switcher%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%208px%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__field%20%7B%5Cn%20%20display%3A%20inline-flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20color%3A%20var(--vp-c-text-2%2C%20var(--tr-text-secondary%2C%20%234e5969))%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__switch%20%7B%5Cn%20%20height%3A%2034px%3B%5Cn%20%20padding%3A%200%2012px%3B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider%2C%20var(--tr-border-color%2C%20%23dcdfe6))%3B%5Cn%20%20border-radius%3A%208px%3B%5Cn%20%20background%3A%20var(--vp-c-bg%2C%20%23ffffff)%3B%5Cn%20%20color%3A%20var(--vp-c-text-2%2C%20var(--tr-text-secondary%2C%20%234e5969))%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__switch.is-active%20%7B%5Cn%20%20border-color%3A%20var(--vp-c-brand-1%2C%20var(--tr-color-primary%2C%20%235e7ce0))%3B%5Cn%20%20color%3A%20var(--vp-c-brand-1%2C%20var(--tr-color-primary%2C%20%235e7ce0))%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__stage%20%7B%5Cn%20%20--tr-layout-height%3A%20400px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22main-scroll-bubble.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Flayout%2Fmain-scroll-bubble.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20BubbleList%2C%20TrLayout%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20type%20%7B%20BubbleListProps%2C%20BubbleRoleConfig%2C%20LayoutScrollTarget%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cnconst%20props%20%3D%20defineProps%3C%7B%5Cn%20%20centered%3A%20boolean%5Cn%7D%3E()%5Cn%5Cnconst%20scrollTargetRef%20%3D%20ref%3CLayoutScrollTarget%3E(null)%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20user%3A%20%7B%20placement%3A%20'end'%20%7D%2C%5Cn%20%20assistant%3A%20%7B%20placement%3A%20'start'%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20messages%3A%20BubbleListProps%5B'messages'%5D%20%3D%20Array.from(%7B%20length%3A%2012%20%7D%2C%20(_%2C%20index)%20%3D%3E%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20content%3A%20%60%E7%AC%AC%20%24%7Bindex%20%2B%201%7D%20%E8%BD%AE%EF%BC%9A%E5%B8%AE%E6%88%91%E6%95%B4%E7%90%86%E4%B8%80%E4%B8%8B%E5%BD%93%E5%89%8D%E5%B8%83%E5%B1%80%E7%9A%84%E6%BB%9A%E5%8A%A8%E5%8C%BA%E3%80%82%60%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20content%3A%20'%E5%8F%AF%E4%BB%A5%E3%80%82%E5%86%85%E5%AE%B9%E5%8C%BA%E5%8F%AF%E4%BB%A5%E5%B1%85%E4%B8%AD%E6%98%BE%E7%A4%BA%EF%BC%8C%E6%BB%9A%E5%8A%A8%E6%9D%A1%E4%BB%8D%E7%84%B6%E8%B4%B4%E7%9D%80%20Layout%20%E4%B8%BB%E5%8C%BA%E5%8F%B3%E4%BE%A7%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%5D).flat()%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3CTrLayout%3E%5Cn%20%20%20%20%3Ctemplate%20%23main%3E%5Cn%20%20%20%20%20%20%3CBubbleList%5Cn%20%20%20%20%20%20%20%20ref%3D%5C%22scrollTargetRef%5C%22%5Cn%20%20%20%20%20%20%20%20class%3D%5C%22layout-main-scroll-bubble%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%7B%20'is-centered'%3A%20props.centered%20%7D%5C%22%5Cn%20%20%20%20%20%20%20%20%3Amessages%3D%5C%22messages%5C%22%5Cn%20%20%20%20%20%20%20%20%3Arole-configs%3D%5C%22roles%5C%22%5Cn%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%3CTrLayout.ProxyScrollbar%20%3Ascroll-target%3D%5C%22scrollTargetRef%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%3C%2FTrLayout%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.layout-main-scroll-bubble%20%7B%5Cn%20%20--tr-bubble-list-padding%3A%2016px%3B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20box-sizing%3A%20border-box%3B%5Cn%20%20overflow%3A%20auto%3B%5Cn%20%20scrollbar-width%3A%20none%3B%5Cn%20%20-ms-overflow-style%3A%20none%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-bubble%3A%3A-webkit-scrollbar%20%7B%5Cn%20%20display%3A%20none%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-bubble.is-centered%20%7B%5Cn%20%20max-width%3A%20450px%3B%5Cn%20%20margin%3A%200%20auto%3B%5Cn%7D%5Cn%5Cn%3Adeep(%5Bdata-role%3D'user'%5D)%20%7B%5Cn%20%20--tr-bubble-box-bg%3A%20var(--tr-color-primary-light)%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22main-scroll-div.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Flayout%2Fmain-scroll-div.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrLayout%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20type%20%7B%20LayoutScrollTarget%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cnconst%20props%20%3D%20defineProps%3C%7B%5Cn%20%20centered%3A%20boolean%5Cn%7D%3E()%5Cn%5Cnconst%20scrollTargetRef%20%3D%20ref%3CLayoutScrollTarget%3E(null)%5Cn%5Cnconst%20sections%20%3D%20Array.from(%7B%20length%3A%2012%20%7D%2C%20(_%2C%20index)%20%3D%3E%20index%20%2B%201)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3CTrLayout%3E%5Cn%20%20%20%20%3Ctemplate%20%23main%3E%5Cn%20%20%20%20%20%20%3Cdiv%20ref%3D%5C%22scrollTargetRef%5C%22%20class%3D%5C%22layout-main-scroll-div%5C%22%20%3Aclass%3D%5C%22%7B%20'is-centered'%3A%20props.centered%20%7D%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Csection%20v-for%3D%5C%22section%20in%20sections%5C%22%20%3Akey%3D%5C%22section%5C%22%20class%3D%5C%22layout-main-scroll-div__item%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cstrong%3ESection%20%7B%7B%20section%20%7D%7D%3C%2Fstrong%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cp%3E%E6%99%AE%E9%80%9A%E5%86%85%E5%AE%B9%E5%8C%BA%E4%B9%9F%E5%8F%AF%E4%BB%A5%E6%8A%8A%E6%BB%9A%E5%8A%A8%E5%AE%B9%E5%99%A8%E4%BA%A4%E7%BB%99%20Layout.ProxyScrollbar%E3%80%82%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fsection%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3CTrLayout.ProxyScrollbar%20%3Ascroll-target%3D%5C%22scrollTargetRef%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%3C%2FTrLayout%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.layout-main-scroll-div%20%7B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20box-sizing%3A%20border-box%3B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%20%20padding%3A%2016px%3B%5Cn%20%20overflow%3A%20auto%3B%5Cn%20%20scrollbar-width%3A%20none%3B%5Cn%20%20-ms-overflow-style%3A%20none%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-div%3A%3A-webkit-scrollbar%20%7B%5Cn%20%20display%3A%20none%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-div.is-centered%20%7B%5Cn%20%20max-width%3A%20550px%3B%5Cn%20%20margin%3A%200%20auto%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-div__item%20%7B%5Cn%20%20padding%3A%2016px%3B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider%2C%20var(--tr-border-color%2C%20%23dcdfe6))%3B%5Cn%20%20border-radius%3A%2012px%3B%5Cn%20%20background%3A%20var(--vp-c-bg%2C%20%23ffffff)%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-div__item%20p%20%7B%5Cn%20%20margin%3A%208px%200%200%3B%5Cn%20%20color%3A%20var(--vp-c-text-2%2C%20var(--tr-text-secondary%2C%20%234e5969))%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[5]||(t[5]=()=>{o.value=!1}),vueCode:a(F)},u({_:2},[_.value?{name:"vue",fn:n(()=>[e(a(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[15]||(t[15]=h('<h2 id="浮层" tabindex="-1">浮层 <a class="header-anchor" href="#浮层" aria-label="Permalink to &quot;浮层&quot;">​</a></h2><p>适合临时面板或悬浮工作区，只在 <code>mode=&quot;floating&quot;</code> 时生效。</p><h3 id="基本用法" tabindex="-1">基本用法 <a class="header-anchor" href="#基本用法" aria-label="Permalink to &quot;基本用法&quot;">​</a></h3><p><code>defaultFloatingState</code> 设置初始位置和大小，<code>floatingOptions</code> 设置拖动、缩放和尺寸范围。</p><ul><li><code>defaultFloatingState</code>：只设置初始值</li><li><code>floatingState</code>：由外部控制位置和大小</li></ul><p>传 <code>floatingState</code> 时，需要在 <code>update:floatingState</code> 中同步最新值。</p>',6)),c(e(a(f),null,null,512),[[p,o.value]]),e(i,null,{default:n(()=>[e(a(m),{title:"基本用法",description:"打开时通过 defaultFloatingState 设置初始位置和大小。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[6]||(t[6]=()=>{o.value=!1}),vueCode:a(W)},u({_:2},[v.value?{name:"vue",fn:n(()=>[e(a(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[16]||(t[16]=l("h3",{id:"浮层工作区",tabindex:"-1"},[b("浮层工作区 "),l("a",{class:"header-anchor",href:"#浮层工作区","aria-label":'Permalink to "浮层工作区"'},"​")],-1)),t[17]||(t[17]=l("p",null,"浮层里同样可以放入侧栏、头部和主区。常见用法是把左右两侧都做成按需展开的 drawer。",-1)),c(e(a(f),null,null,512),[[p,o.value]]),e(i,null,{default:n(()=>[e(a(m),{title:"浮层工作区",description:"在浮层里组合左右 drawer，适合临时工作区、对话面板或侧边操作台。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[7]||(t[7]=()=>{o.value=!1}),vueCode:a(T)},u({_:2},[g.value?{name:"vue",fn:n(()=>[e(a(g))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[18]||(t[18]=h('<h2 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h2><h3 id="layout-props" tabindex="-1">Layout <a class="header-anchor" href="#layout-props" aria-label="Permalink to &quot;Layout {#layout-props}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td><code>mode</code></td><td>布局模式；<code>normal</code> 参与普通布局，<code>floating</code> 会脱离普通布局，不占原来的位置空间</td><td><code>&#39;normal&#39; | &#39;floating&#39;</code></td><td><code>&#39;normal&#39;</code></td></tr><tr><td><code>leftAside</code></td><td>左侧栏配置</td><td><a href="#layout-aside-props"><code>LayoutAsideProps</code></a></td><td><code>-</code></td></tr><tr><td><code>rightAside</code></td><td>右侧栏配置</td><td><a href="#layout-aside-props"><code>LayoutAsideProps</code></a></td><td><code>-</code></td></tr><tr><td><code>floatingState</code></td><td>受控浮层状态，需配合 <code>update:floatingState</code> 回写</td><td><a href="#layout-floating-state"><code>LayoutFloatingState</code></a></td><td><code>-</code></td></tr><tr><td><code>defaultFloatingState</code></td><td>非受控浮层初始状态，仅首次挂载读取一次</td><td><a href="#layout-floating-state"><code>LayoutFloatingState</code></a></td><td><code>-</code></td></tr><tr><td><code>floatingOptions</code></td><td>浮层拖拽、缩放和尺寸约束配置</td><td><a href="#layout-floating-options"><code>LayoutFloatingOptions</code></a></td><td><code>-</code></td></tr></tbody></table><h3 id="layout-proxy-scrollbar-props" tabindex="-1">Layout.ProxyScrollbar <a class="header-anchor" href="#layout-proxy-scrollbar-props" aria-label="Permalink to &quot;Layout.ProxyScrollbar {#layout-proxy-scrollbar-props}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td><code>scrollTarget</code></td><td>真实滚动容器的元素，或对应组件实例的 ref</td><td><a href="#layout-scroll-target"><code>LayoutScrollTarget</code></a></td><td><code>-</code></td></tr></tbody></table><h3 id="layout-aside-toggle-props" tabindex="-1">Layout.AsideToggle <a class="header-anchor" href="#layout-aside-toggle-props" aria-label="Permalink to &quot;Layout.AsideToggle {#layout-aside-toggle-props}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td><code>side</code></td><td>控制的侧栏位置</td><td><code>&#39;left&#39; | &#39;right&#39;</code></td><td><code>-</code></td></tr></tbody></table><p>它是一个现成的开关按钮，只能在 <code>Layout</code> 内部使用，通常放在 <code>left-aside</code> / <code>right-aside</code> 插槽中。</p><h2 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h2><h3 id="layout-slots" tabindex="-1">Layout <a class="header-anchor" href="#layout-slots" aria-label="Permalink to &quot;Layout {#layout-slots}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>插槽名</th><th>说明</th><th>作用域参数</th></tr></thead><tbody><tr><td><code>left-aside</code></td><td>左侧栏内容</td><td><code>-</code></td></tr><tr><td><code>header</code></td><td>顶部区域</td><td><code>-</code></td></tr><tr><td><code>main</code></td><td>主区内容</td><td><code>-</code></td></tr><tr><td><code>footer</code></td><td>底部区域</td><td><code>-</code></td></tr><tr><td><code>right-aside</code></td><td>右侧栏内容</td><td><code>-</code></td></tr></tbody></table><h3 id="layout-asidetoggle" tabindex="-1">Layout.AsideToggle <a class="header-anchor" href="#layout-asidetoggle" aria-label="Permalink to &quot;Layout.AsideToggle&quot;">​</a></h3><table tabindex="0"><thead><tr><th>插槽名</th><th>说明</th><th>作用域参数</th></tr></thead><tbody><tr><td><code>default</code></td><td>自定义切换按钮内容</td><td><code>{ isOpen: boolean }</code></td></tr></tbody></table><h2 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h2><h3 id="layout-layout-events" tabindex="-1">Layout <a class="header-anchor" href="#layout-layout-events" aria-label="Permalink to &quot;Layout {#layout-layout-events}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>事件名</th><th>说明</th><th>回调参数</th></tr></thead><tbody><tr><td><code>update:floatingState</code></td><td>浮层位置或尺寸变化</td><td>(value: <a href="#layout-floating-state"><code>LayoutFloatingState</code></a>)</td></tr><tr><td><code>aside-open-change</code></td><td>侧栏开关变化</td><td>(detail: <a href="#layout-aside-open-detail"><code>LayoutAsideOpenDetail</code></a>)</td></tr><tr><td><code>left-aside-open-change</code></td><td>左侧栏开关变化</td><td>(detail: <a href="#layout-aside-open-value"><code>LayoutAsideOpenValue</code></a>)</td></tr><tr><td><code>right-aside-open-change</code></td><td>右侧栏开关变化</td><td>(detail: <a href="#layout-aside-open-value"><code>LayoutAsideOpenValue</code></a>)</td></tr><tr><td><code>aside-resize-start</code></td><td>开始调整侧栏宽度</td><td>(detail: <a href="#layout-aside-resize-detail"><code>LayoutAsideResizeDetail</code></a>)</td></tr><tr><td><code>aside-resize</code></td><td>调整侧栏宽度时持续触发</td><td>(detail: <a href="#layout-aside-resize-detail"><code>LayoutAsideResizeDetail</code></a>)</td></tr><tr><td><code>aside-resize-end</code></td><td>结束调整侧栏宽度</td><td>(detail: <a href="#layout-aside-resize-detail"><code>LayoutAsideResizeDetail</code></a>)</td></tr><tr><td><code>left-aside-resize-start</code></td><td>开始调整左侧栏宽度</td><td>(detail: <a href="#layout-aside-resize-value"><code>LayoutAsideResizeValue</code></a>)</td></tr><tr><td><code>left-aside-resize</code></td><td>调整左侧栏宽度时持续触发</td><td>(detail: <a href="#layout-aside-resize-value"><code>LayoutAsideResizeValue</code></a>)</td></tr><tr><td><code>left-aside-resize-end</code></td><td>结束调整左侧栏宽度</td><td>(detail: <a href="#layout-aside-resize-value"><code>LayoutAsideResizeValue</code></a>)</td></tr><tr><td><code>right-aside-resize-start</code></td><td>开始调整右侧栏宽度</td><td>(detail: <a href="#layout-aside-resize-value"><code>LayoutAsideResizeValue</code></a>)</td></tr><tr><td><code>right-aside-resize</code></td><td>调整右侧栏宽度时持续触发</td><td>(detail: <a href="#layout-aside-resize-value"><code>LayoutAsideResizeValue</code></a>)</td></tr><tr><td><code>right-aside-resize-end</code></td><td>结束调整右侧栏宽度</td><td>(detail: <a href="#layout-aside-resize-value"><code>LayoutAsideResizeValue</code></a>)</td></tr><tr><td><code>floating-drag-start</code></td><td>开始拖动浮层</td><td>(detail: <a href="#layout-floating-drag-detail"><code>LayoutFloatingDragDetail</code></a>)</td></tr><tr><td><code>floating-drag</code></td><td>拖动浮层时持续触发</td><td>(detail: <a href="#layout-floating-drag-detail"><code>LayoutFloatingDragDetail</code></a>)</td></tr><tr><td><code>floating-drag-end</code></td><td>结束拖动浮层</td><td>(detail: <a href="#layout-floating-drag-detail"><code>LayoutFloatingDragDetail</code></a>)</td></tr><tr><td><code>floating-resize-start</code></td><td>开始调整浮层尺寸</td><td>(detail: <a href="#layout-floating-resize-detail"><code>LayoutFloatingResizeDetail</code></a>)</td></tr><tr><td><code>floating-resize</code></td><td>调整浮层尺寸时持续触发</td><td>(detail: <a href="#layout-floating-resize-detail"><code>LayoutFloatingResizeDetail</code></a>)</td></tr><tr><td><code>floating-resize-end</code></td><td>结束调整浮层尺寸</td><td>(detail: <a href="#layout-floating-resize-detail"><code>LayoutFloatingResizeDetail</code></a>)</td></tr></tbody></table><h2 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types {#types}&quot;">​</a></h2><h3 id="layout-aside-props" tabindex="-1">LayoutAsideProps <a class="header-anchor" href="#layout-aside-props" aria-label="Permalink to &quot;LayoutAsideProps {#layout-aside-props}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td><code>mode</code></td><td>侧栏模式</td><td><code>&#39;dock&#39; | &#39;drawer&#39;</code></td><td><code>&#39;dock&#39;</code></td></tr><tr><td><code>open</code></td><td>受控开关状态</td><td><code>boolean</code></td><td><code>-</code></td></tr><tr><td><code>defaultOpen</code></td><td>非受控初始开关状态</td><td><code>boolean</code></td><td><code>left: true</code> / <code>right: false</code></td></tr><tr><td><code>expandedWidth</code></td><td>受控展开宽度；<code>drawer</code> 未设置 <code>--tr-layout-drawer-width</code> 时会回退使用该宽度</td><td><code>number</code></td><td><code>-</code></td></tr><tr><td><code>defaultExpandedWidth</code></td><td>非受控初始展开宽度；<code>drawer</code> 宽度回退值</td><td><code>number</code></td><td><code>left: 300</code> / <code>right: 320</code></td></tr><tr><td><code>minExpandedWidth</code></td><td>最小展开宽度边界</td><td><code>number</code></td><td><code>left: 200</code> / <code>right: 240</code></td></tr><tr><td><code>maxExpandedWidth</code></td><td>最大展开宽度边界</td><td><code>number</code></td><td><code>left: 560</code> / <code>right: 640</code></td></tr><tr><td><code>collapsedWidth</code></td><td>收起后保留的窄栏宽度，仅 <code>dock</code> 生效</td><td><code>number</code></td><td><code>0</code></td></tr><tr><td><code>collapseEffect</code></td><td><code>dock</code> 收起到窄栏时的内容动画</td><td><code>&#39;overlay&#39; | &#39;slide&#39;</code></td><td><code>&#39;overlay&#39;</code></td></tr><tr><td><code>resizable</code></td><td>是否允许拖拽改宽，仅 <code>dock</code> 生效</td><td><code>boolean</code></td><td><code>false</code></td></tr></tbody></table><h3 id="layout-aside-open-detail" tabindex="-1">LayoutAsideOpenDetail <a class="header-anchor" href="#layout-aside-open-detail" aria-label="Permalink to &quot;LayoutAsideOpenDetail {#layout-aside-open-detail}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th></tr></thead><tbody><tr><td><code>side</code></td><td>当前侧栏位置</td><td><code>&#39;left&#39; | &#39;right&#39;</code></td></tr><tr><td><code>open</code></td><td>当前是否展开</td><td><code>boolean</code></td></tr></tbody></table><h3 id="layout-aside-open-value" tabindex="-1">LayoutAsideOpenValue <a class="header-anchor" href="#layout-aside-open-value" aria-label="Permalink to &quot;LayoutAsideOpenValue {#layout-aside-open-value}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th></tr></thead><tbody><tr><td><code>open</code></td><td>当前是否展开</td><td><code>boolean</code></td></tr></tbody></table><h3 id="layout-aside-resize-detail" tabindex="-1">LayoutAsideResizeDetail <a class="header-anchor" href="#layout-aside-resize-detail" aria-label="Permalink to &quot;LayoutAsideResizeDetail {#layout-aside-resize-detail}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th></tr></thead><tbody><tr><td><code>side</code></td><td>当前侧栏位置</td><td><code>&#39;left&#39; | &#39;right&#39;</code></td></tr><tr><td><code>expandedWidth</code></td><td>当前侧栏宽度</td><td><code>number</code></td></tr></tbody></table><h3 id="layout-aside-resize-value" tabindex="-1">LayoutAsideResizeValue <a class="header-anchor" href="#layout-aside-resize-value" aria-label="Permalink to &quot;LayoutAsideResizeValue {#layout-aside-resize-value}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th></tr></thead><tbody><tr><td><code>expandedWidth</code></td><td>当前侧栏宽度</td><td><code>number</code></td></tr></tbody></table><h3 id="layout-scroll-target" tabindex="-1">LayoutScrollTarget <a class="header-anchor" href="#layout-scroll-target" aria-label="Permalink to &quot;LayoutScrollTarget {#layout-scroll-target}&quot;">​</a></h3><p><code>HTMLElement | Pick&lt;ComponentPublicInstance, &#39;$el&#39;&gt; | null | undefined</code></p><h3 id="layout-floating-state" tabindex="-1">LayoutFloatingState <a class="header-anchor" href="#layout-floating-state" aria-label="Permalink to &quot;LayoutFloatingState {#layout-floating-state}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td><code>placement</code></td><td>浮层位置</td><td><code>&#39;top-left&#39; | &#39;top-right&#39; | &#39;bottom-left&#39; | &#39;bottom-right&#39; | &#39;center&#39;</code></td><td><code>&#39;center&#39;</code></td></tr><tr><td><code>offsetX</code></td><td>横向偏移；<code>placement</code> 为 <code>center</code> 时不生效</td><td><code>number</code></td><td><code>24</code></td></tr><tr><td><code>offsetY</code></td><td>纵向偏移；<code>placement</code> 为 <code>center</code> 时不生效</td><td><code>number</code></td><td><code>24</code></td></tr><tr><td><code>width</code></td><td>浮层宽度；非受控时表示初始值，受控时表示当前值</td><td><code>number</code></td><td><code>420</code></td></tr><tr><td><code>height</code></td><td>浮层高度；非受控时表示初始值，受控时表示当前值</td><td><code>number</code></td><td><code>560</code></td></tr></tbody></table><h3 id="layout-floating-options" tabindex="-1">LayoutFloatingOptions <a class="header-anchor" href="#layout-floating-options" aria-label="Permalink to &quot;LayoutFloatingOptions {#layout-floating-options}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td><code>draggable</code></td><td>是否允许拖动浮层</td><td><code>boolean</code></td><td><code>true</code></td></tr><tr><td><code>resizable</code></td><td>是否允许通过浮层边缘手柄调整尺寸</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td><code>minWidth</code></td><td>最小宽度</td><td><code>number</code></td><td><code>320</code></td></tr><tr><td><code>maxWidth</code></td><td>最大宽度</td><td><code>number</code></td><td><code>视口宽度</code></td></tr><tr><td><code>minHeight</code></td><td>最小高度</td><td><code>number</code></td><td><code>240</code></td></tr><tr><td><code>maxHeight</code></td><td>最大高度</td><td><code>number</code></td><td><code>视口高度</code></td></tr></tbody></table><h3 id="layout-floating-drag-detail" tabindex="-1">LayoutFloatingDragDetail <a class="header-anchor" href="#layout-floating-drag-detail" aria-label="Permalink to &quot;LayoutFloatingDragDetail {#layout-floating-drag-detail}&quot;">​</a></h3><p>与 <a href="#layout-floating-state"><code>LayoutFloatingState</code></a> 一致。</p><h3 id="layout-floating-resize-detail" tabindex="-1">LayoutFloatingResizeDetail <a class="header-anchor" href="#layout-floating-resize-detail" aria-label="Permalink to &quot;LayoutFloatingResizeDetail {#layout-floating-resize-detail}&quot;">​</a></h3><p>在 <a href="#layout-floating-state"><code>LayoutFloatingState</code></a> 基础上增加以下字段：</p><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th></tr></thead><tbody><tr><td><code>handle</code></td><td>当前拖动的边或角</td><td><code>&#39;s&#39; | &#39;e&#39; | &#39;w&#39; | &#39;ne&#39; | &#39;nw&#39; | &#39;se&#39; | &#39;sw&#39;</code></td></tr></tbody></table><h2 id="css-变量" tabindex="-1">CSS 变量 <a class="header-anchor" href="#css-变量" aria-label="Permalink to &quot;CSS 变量&quot;">​</a></h2><h3 id="layout-css-basics" tabindex="-1">布局基础 <a class="header-anchor" href="#layout-css-basics" aria-label="Permalink to &quot;布局基础 {#layout-css-basics}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-layout-height</code></td><td>布局高度</td></tr><tr><td><code>--tr-layout-bg</code></td><td>容器背景</td></tr><tr><td><code>--tr-layout-left-aside-bg</code></td><td>左侧栏背景</td></tr><tr><td><code>--tr-layout-right-aside-bg</code></td><td>右侧栏背景</td></tr><tr><td><code>--tr-layout-header-bg</code></td><td>顶部背景</td></tr><tr><td><code>--tr-layout-main-bg</code></td><td>主区背景</td></tr><tr><td><code>--tr-layout-footer-bg</code></td><td>底部背景</td></tr><tr><td><code>--tr-layout-divider-color</code></td><td>分隔线颜色</td></tr><tr><td><code>--tr-layout-overlay-bg</code></td><td>drawer 遮罩颜色</td></tr><tr><td><code>--tr-layout-panel-shadow</code></td><td>drawer 阴影</td></tr><tr><td><code>--tr-layout-floating-radius</code></td><td>浮层圆角</td></tr><tr><td><code>--tr-layout-floating-shadow</code></td><td>浮层阴影</td></tr><tr><td><code>--tr-layout-floating-z-index</code></td><td>浮层层级</td></tr></tbody></table><h3 id="layout-css-content" tabindex="-1">内容与交互 <a class="header-anchor" href="#layout-css-content" aria-label="Permalink to &quot;内容与交互 {#layout-css-content}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-layout-main-min-width</code></td><td>主区最小宽度</td></tr><tr><td><code>--tr-layout-drawer-width</code></td><td>drawer 展示宽度</td></tr><tr><td><code>--tr-layout-main-scrollbar-width</code></td><td>滚动条宽度</td></tr><tr><td><code>--tr-layout-main-scrollbar-thumb-bg</code></td><td>滚动条滑块颜色</td></tr><tr><td><code>--tr-layout-main-scrollbar-thumb-bg-hover</code></td><td>滑块悬停颜色</td></tr><tr><td><code>--tr-layout-main-scrollbar-thumb-bg-active</code></td><td>滑块激活颜色</td></tr></tbody></table>',43))])}}});export{G as __pageData,V as default};
