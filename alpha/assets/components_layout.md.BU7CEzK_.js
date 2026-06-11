const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/floating-controlled.BnwZHTYW.js","assets/chunks/theme.SmcjlRiv.js","assets/chunks/framework.DZAkmf3-.js","assets/chunks/floating.B9zhkdAA.js","assets/chunks/main-scroll.CbebChNS.js","assets/chunks/aside-resizable.p2OfaV4_.js","assets/chunks/aside-slot-props.BCcaXaRF.js","assets/chunks/aside-collapse-effect.cNFubhmp.js","assets/chunks/aside-modes.CB852gjQ.js","assets/chunks/basic.DreCC1IL.js"])))=>i.map(i=>d[i]);
import{aD as r,bQ as i,aZ as B,aL as w,v as L,H as c,bL as s,bB as p,J as e,bk as o,bJ as n,G as u,w as b,I as v,b7 as m,aU as k}from"./chunks/framework.DZAkmf3-.js";import{L as y,N as f}from"./chunks/index.Cbv7wNfH.js";const T=`<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutFloatingOptions, LayoutFloatingState } from '@opentiny/tiny-robot'

function createFloatingState(): LayoutFloatingState {
  return {
    placement: 'center',
    width: 420,
    height: 320,
  }
}

const open = ref(false)
const writebackEnabled = ref(true)
const floatingState = ref<LayoutFloatingState>(createFloatingState())
const lastEmittedFloatingState = ref<LayoutFloatingState | null>(null)

const floatingOptions: LayoutFloatingOptions = {
  draggable: true,
  resizable: true,
  minWidth: 320,
  minHeight: 240,
}

const floatingStateText = computed(() => JSON.stringify(floatingState.value, null, 2))
const emittedText = computed(() => JSON.stringify(lastEmittedFloatingState.value, null, 2))

function updateFloatingState(nextFloatingState: LayoutFloatingState) {
  lastEmittedFloatingState.value = nextFloatingState

  if (writebackEnabled.value) {
    floatingState.value = nextFloatingState
  }
}

function reset() {
  floatingState.value = createFloatingState()
  lastEmittedFloatingState.value = null
  open.value = true
}
<\/script>

<template>
  <div class="layout-floating-controlled-demo">
    <div class="layout-floating-controlled-demo__toolbar">
      <button type="button" class="layout-floating-controlled-demo__button" @click="open = !open">
        {{ open ? '关闭浮层' : '打开浮层' }}
      </button>
      <button
        type="button"
        class="layout-floating-controlled-demo__button"
        @click="writebackEnabled = !writebackEnabled"
      >
        {{ writebackEnabled ? '关闭回写' : '开启回写' }}
      </button>
      <button type="button" class="layout-floating-controlled-demo__button" @click="reset">重置</button>
    </div>

    <p class="layout-floating-controlled-demo__tip">
      关闭回写后，拖拽和 resize 仍会触发 \`update:floatingState\`，但浮层会保持 \`floatingState\` prop 当前的值。
    </p>

    <div class="layout-floating-controlled-demo__grid">
      <div class="layout-floating-controlled-demo__card">
        <div class="layout-floating-controlled-demo__card-title">floatingState prop</div>
        <pre>{{ floatingStateText }}</pre>
      </div>

      <div class="layout-floating-controlled-demo__card">
        <div class="layout-floating-controlled-demo__card-title">last emitted</div>
        <pre>{{ emittedText }}</pre>
      </div>
    </div>

    <TrLayout
      v-if="open"
      class="layout-floating-controlled-demo__layout"
      mode="floating"
      :floating-state="floatingState"
      :floating-options="floatingOptions"
      @update:floating-state="updateFloatingState"
    >
      <template #header>
        <div class="layout-floating-controlled-demo__header">
          <strong>受控浮层</strong>
          <button type="button" class="layout-floating-controlled-demo__button" @click="open = false">关闭</button>
        </div>
      </template>

      <template #main>
        <div class="layout-floating-controlled-demo__main">
          <div class="layout-floating-controlled-demo__note">开启回写后，拖动或缩放会直接同步到 \`floatingState\`。</div>
          <div class="layout-floating-controlled-demo__note">
            初始 \`placement\` 为 \`center\`，第一次拖动或缩放后会自动换成最近的角位置。
          </div>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style>
.layout-floating-controlled-demo__layout {
  --tr-layout-frame-radius: 16px;
}
</style>

<style scoped>
.layout-floating-controlled-demo {
  display: grid;
  gap: 12px;
}

.layout-floating-controlled-demo__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.layout-floating-controlled-demo__button {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 8px;
  background: var(--vp-c-bg, #ffffff);
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
  cursor: pointer;
}

.layout-floating-controlled-demo__tip {
  margin: 0;
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-floating-controlled-demo__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.layout-floating-controlled-demo__card {
  padding: 12px;
  border-radius: 12px;
  background: var(--vp-c-bg-soft, #f6f8fa);
}

.layout-floating-controlled-demo__card-title {
  font-weight: 600;
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-floating-controlled-demo__card pre {
  margin: 8px 0 0;
  overflow: auto;
  font-size: 12px;
  line-height: 1.5;
}

.layout-floating-controlled-demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-floating-controlled-demo__main {
  display: grid;
  gap: 12px;
  padding: 16px;
}

.layout-floating-controlled-demo__note {
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--vp-c-brand-soft, #e6f4ff);
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
  line-height: 1.6;
}
</style>
`,S=`<script setup lang="ts">
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
          <div class="layout-floating-demo__card">关闭后重新打开，会重新读取默认位置。</div>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style>
.layout-floating-demo__layout {
  --tr-layout-frame-radius: 12px;
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
`,W=`<script setup lang="ts">
import { computed, ref } from 'vue'
import MainScrollBubble from './main-scroll-bubble.vue'
import MainScrollDiv from './main-scroll-div.vue'

const activeExample = ref<'bubble' | 'div'>('bubble')

const currentExample = computed(() => (activeExample.value === 'bubble' ? MainScrollBubble : MainScrollDiv))
<\/script>

<template>
  <div class="layout-main-scroll-demo">
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

    <p class="layout-main-scroll-demo__tip">两种写法都把真实滚动容器传给 \`scrollHost\`，区别只在滚动内容本身是什么。</p>

    <div class="layout-main-scroll-demo__stage">
      <component :is="currentExample" />
    </div>
  </div>
</template>

<style scoped>
.layout-main-scroll-demo {
  display: grid;
  gap: 12px;
}

.layout-main-scroll-demo__switcher {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.layout-main-scroll-demo__tip {
  margin: 0;
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-main-scroll-demo__stage {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
  --tr-layout-height: 400px;
}
</style>
`,F=`<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutAsideProps, LayoutAsideState } from '@opentiny/tiny-robot'

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

function updateLeftAside(nextAside: LayoutAsideState) {
  expandedWidth.value = nextAside.expandedWidth ?? expandedWidth.value
}
<\/script>

<template>
  <div class="layout-aside-resizable-demo">
    <TrLayout :left-aside="leftAside" @left-aside-state-change="updateLeftAside">
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
  --tr-layout-content-max-width: none;
  --tr-layout-inner-padding-inline: 0;
  --tr-layout-inner-padding-block: 0;
  --tr-layout-main-min-width: 0;
  --tr-layout-left-bg: var(--vp-c-bg-alt, #f8fafc);
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
`,X=`<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutAsideProps, LayoutAsideState } from '@opentiny/tiny-robot'

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

function updateLeftAside(nextAside: LayoutAsideState) {
  leftOpen.value = nextAside.open
  leftExpandedWidth.value = nextAside.expandedWidth ?? leftExpandedWidth.value
}

function updateRightAside(nextAside: LayoutAsideState) {
  rightOpen.value = nextAside.open
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
      @left-aside-state-change="updateLeftAside"
      @right-aside-state-change="updateRightAside"
    >
      <template #left-aside="slotProps">
        <div class="layout-slot-props-demo__aside">
          <p class="layout-slot-props-demo__summary">
            {{ slotProps.placement }} / {{ slotProps.mode }} / {{ slotProps.open ? 'open' : 'closed' }}
          </p>

          <dl class="layout-slot-props-demo__list">
            <div class="layout-slot-props-demo__row">
              <dt>expandedWidth</dt>
              <dd>{{ slotProps.expandedWidth ?? '-' }}</dd>
            </div>
            <div class="layout-slot-props-demo__row">
              <dt>collapsedWidth</dt>
              <dd>{{ slotProps.collapsedWidth ?? '-' }}</dd>
            </div>
            <div class="layout-slot-props-demo__row">
              <dt>resizable</dt>
              <dd>{{ slotProps.resizable }}</dd>
            </div>
          </dl>
        </div>
      </template>

      <template #header>
        <div class="layout-slot-props-demo__header">外层更新 leftAside / rightAside，插槽内读取当前状态。</div>
      </template>

      <template #main>
        <div class="layout-slot-props-demo__main">
          <p>受控写法下，update 事件回传新状态，外部合并后再传回组件。</p>
          <p>插槽参数适合展示当前状态，也可以在插槽内部直接调用操作方法。</p>
        </div>
      </template>

      <template #right-aside="slotProps">
        <div class="layout-slot-props-demo__drawer">
          <p class="layout-slot-props-demo__summary">
            {{ slotProps.placement }} / {{ slotProps.mode }} / {{ slotProps.open ? 'open' : 'closed' }}
          </p>
          <p>右侧抽屉也只展示状态。</p>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style>
.layout-slot-props-demo__layout {
  --tr-layout-height: 360px;
  --tr-layout-content-max-width: none;
  --tr-layout-inner-padding-inline: 0;
  --tr-layout-inner-padding-block: 0;
  --tr-layout-left-bg: var(--vp-c-bg-alt, #f8fafc);
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
`,P=`<script setup lang="ts">
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
  --tr-layout-content-max-width: none;
  --tr-layout-inner-padding-inline: 0;
  --tr-layout-inner-padding-block: 0;
  --tr-layout-main-min-width: 0;
  --tr-layout-left-bg: var(--layout-collapse-effect-demo-aside-bg);
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
`,Z=`<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutAsideState } from '@opentiny/tiny-robot'

const rightOpen = ref(false)

function updateRightAside(next: LayoutAsideState) {
  rightOpen.value = next.open
}
<\/script>

<template>
  <div class="layout-aside-demo">
    <TrLayout
      :left-aside="{ defaultOpen: true, defaultExpandedWidth: 156, collapsedWidth: 56 }"
      :right-aside="{ mode: 'drawer', open: rightOpen }"
      @right-aside-state-change="updateRightAside"
    >
      <template #left-aside="{ open }">
        <div v-if="open" class="layout-aside-demo__aside">
          <TrLayout.AsideToggle placement="left" class="layout-aside-demo__chip">收起侧栏</TrLayout.AsideToggle>
          <div class="layout-aside-demo__chip">collapsedWidth: 56px</div>
        </div>
        <div v-else class="layout-aside-demo__rail">
          <TrLayout.AsideToggle placement="left" class="layout-aside-demo__rail-chip">栏</TrLayout.AsideToggle>
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
          <TrLayout.AsideToggle placement="right" class="layout-aside-demo__chip">关闭抽屉</TrLayout.AsideToggle>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style scoped>
.layout-aside-demo {
  --tr-layout-height: 100%;
  --tr-layout-content-max-width: none;
  --tr-layout-inner-padding-inline: 0;
  --tr-layout-inner-padding-block: 0;
  --tr-layout-left-bg: var(--vp-c-bg-alt, #f8fafc);
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
`,q=`<script setup lang="ts">
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
  --tr-layout-content-max-width: none;
  --tr-layout-inner-padding-inline: 0;
  --tr-layout-inner-padding-block: 0;
  --tr-layout-main-min-width: 0;
  --tr-layout-header-bg: var(--vp-c-bg-soft, #f6f8fa);
  --tr-layout-main-bg: var(--vp-c-bg, #ffffff);
  --tr-layout-footer-bg: var(--vp-c-bg-soft, #f6f8fa);
  --tr-layout-left-bg: var(--vp-c-bg-alt, #f8fafc);
  --tr-layout-right-bg: var(--vp-c-bg-alt, #f8fafc);
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
`,G=JSON.parse('{"title":"Layout 布局","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/layout.md","filePath":"components/layout.md"}'),z={name:"components/layout.md"},I=Object.assign(z,{setup(R){const h=m();r(async()=>{h.value=(await i(async()=>{const{default:a}=await import("./chunks/floating-controlled.BnwZHTYW.js");return{default:a}},__vite__mapDeps([0,1,2]))).default});const g=m();r(async()=>{g.value=(await i(async()=>{const{default:a}=await import("./chunks/floating.B9zhkdAA.js");return{default:a}},__vite__mapDeps([3,1,2]))).default});const _=m();r(async()=>{_.value=(await i(async()=>{const{default:a}=await import("./chunks/main-scroll.CbebChNS.js");return{default:a}},__vite__mapDeps([4,1,2]))).default});const x=m();r(async()=>{x.value=(await i(async()=>{const{default:a}=await import("./chunks/aside-resizable.p2OfaV4_.js");return{default:a}},__vite__mapDeps([5,1,2]))).default});const C=m();r(async()=>{C.value=(await i(async()=>{const{default:a}=await import("./chunks/aside-slot-props.BCcaXaRF.js");return{default:a}},__vite__mapDeps([6,1,2]))).default});const A=m();r(async()=>{A.value=(await i(async()=>{const{default:a}=await import("./chunks/aside-collapse-effect.cNFubhmp.js");return{default:a}},__vite__mapDeps([7,2,1]))).default});const E=m();r(async()=>{E.value=(await i(async()=>{const{default:a}=await import("./chunks/aside-modes.CB852gjQ.js");return{default:a}},__vite__mapDeps([8,1,2]))).default});const d=k(!0),D=m();return r(async()=>{D.value=(await i(async()=>{const{default:a}=await import("./chunks/basic.DreCC1IL.js");return{default:a}},__vite__mapDeps([9,1,2]))).default}),(a,t)=>{const l=B("ClientOnly");return w(),L("div",null,[t[8]||(t[8]=c('<h1 id="layout-布局" tabindex="-1">Layout 布局 <a class="header-anchor" href="#layout-布局" aria-label="Permalink to &quot;Layout 布局&quot;">​</a></h1><p><code>Layout</code> 用来组织带有头部、主内容区、底部和左右侧栏的页面。</p><p>它覆盖三类核心场景：</p><ul><li>标准页面骨架</li><li>可收起的左右侧栏</li><li>可拖动、可缩放的浮层布局</li></ul><h2 id="基础布局" tabindex="-1">基础布局 <a class="header-anchor" href="#基础布局" aria-label="Permalink to &quot;基础布局&quot;">​</a></h2><p>基础布局适合最常见的桌面端页面：</p><ul><li>顶部放工具栏或标题</li><li>中间放主内容</li><li>左右两侧按需放导航或信息栏</li><li>底部放状态栏或操作栏</li></ul><p><code>Layout</code> 本身只负责分区，不限制各区域的内容。</p>',8)),s(e(o(y),null,null,512),[[p,d.value]]),e(l,null,{default:n(()=>[e(o(f),{title:"基础布局",description:"最小布局示例。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{d.value=!1}),vueCode:o(q)},u({_:2},[D.value?{name:"vue",fn:n(()=>[e(o(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[9]||(t[9]=c('<p>配置详见：<a href="#layout-props">Layout Props</a>、<a href="#layout-slots">Layout Slots</a></p><h2 id="侧栏" tabindex="-1">侧栏 <a class="header-anchor" href="#侧栏" aria-label="Permalink to &quot;侧栏&quot;">​</a></h2><h3 id="展示形态" tabindex="-1">展示形态 <a class="header-anchor" href="#展示形态" aria-label="Permalink to &quot;展示形态&quot;">​</a></h3><p>侧栏由 <code>leftAside</code> / <code>rightAside</code> 配置，支持两种显示方式：</p><ul><li><code>dock</code>：占据页面空间，适合常驻导航、工具栏或信息栏</li><li><code>drawer</code>：覆盖在内容上方，适合临时面板</li></ul><p><code>drawer</code> 的宽度通过 <code>--tr-layout-drawer-width</code> 控制。</p>',6)),s(e(o(y),null,null,512),[[p,d.value]]),e(l,null,{default:n(()=>[e(o(f),{title:"显示模式",description:"左侧占据页面空间，右侧覆盖在内容上方。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[1]||(t[1]=()=>{d.value=!1}),vueCode:o(Z)},u({_:2},[E.value?{name:"vue",fn:n(()=>[e(o(E))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[10]||(t[10]=c('<h3 id="收起行为" tabindex="-1">收起行为 <a class="header-anchor" href="#收起行为" aria-label="Permalink to &quot;收起行为&quot;">​</a></h3><p><code>dock</code> 侧栏关闭时，可以完全隐藏，也可以保留一条窄栏。</p><ul><li><code>collapsedWidth &gt; 0</code>：收起后保留一条窄栏</li><li><code>collapsedWidth = 0</code>：收起后完全隐藏</li><li><code>overlay</code>：内容基本留在原位</li><li><code>slide</code>：内容会跟着一起移动</li></ul>',3)),s(e(o(y),null,null,512),[[p,d.value]]),e(l,null,{default:n(()=>[e(o(f),{title:"收起行为",description:"对比 overlay 和 slide 两种收起动画。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[2]||(t[2]=()=>{d.value=!1}),vueCode:o(P)},u({_:2},[A.value?{name:"vue",fn:n(()=>[e(o(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[11]||(t[11]=b("h3",{id:"状态控制",tabindex:"-1"},[v("状态控制 "),b("a",{class:"header-anchor",href:"#状态控制","aria-label":'Permalink to "状态控制"'},"​")],-1)),t[12]||(t[12]=b("p",null,[v("推荐把 "),b("code",null,"leftAside"),v(" / "),b("code",null,"rightAside"),v(" 作为侧栏状态入口。插槽参数可以读取当前状态，也可以在插槽内部触发操作。")],-1)),t[13]||(t[13]=b("p",null,"受控写法下，外部不回写，界面不会变化。",-1)),s(e(o(y),null,null,512),[[p,d.value]]),e(l,null,{default:n(()=>[e(o(f),{title:"状态控制",description:"通过 leftAside、rightAside 受控回写，并在插槽中读取侧栏状态。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[3]||(t[3]=()=>{d.value=!1}),vueCode:o(X)},u({_:2},[C.value?{name:"vue",fn:n(()=>[e(o(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[14]||(t[14]=c('<p>插槽参数字段详见 <a href="#layoutasideslotprops">LayoutAsideSlotProps</a>。</p><h3 id="宽度调整" tabindex="-1">宽度调整 <a class="header-anchor" href="#宽度调整" aria-label="Permalink to &quot;宽度调整&quot;">​</a></h3><p><code>resizable</code> 可以开启 <code>dock</code> 侧栏的拖拽改宽，宽度范围由 <code>minExpandedWidth</code> 和 <code>maxExpandedWidth</code> 控制。</p>',3)),s(e(o(y),null,null,512),[[p,d.value]]),e(l,null,{default:n(()=>[e(o(f),{title:"宽度调整",description:"拖动分隔线查看当前宽度和边界。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[4]||(t[4]=()=>{d.value=!1}),vueCode:o(F)},u({_:2},[x.value?{name:"vue",fn:n(()=>[e(o(x))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[15]||(t[15]=c('<p>配置详见：<a href="#layout-props">Layout Props</a>、<a href="#layout-slots">Layout Slots</a>、<a href="#layout-layout-events">Layout Events</a>、<a href="#layout-css-content">CSS 变量</a></p><h2 id="主区滚动" tabindex="-1">主区滚动 <a class="header-anchor" href="#主区滚动" aria-label="Permalink to &quot;主区滚动&quot;">​</a></h2><p><code>Layout.Main</code> 用来接管主区滚动条，但它不制造滚动。真正发生滚动的仍然是你传入的 <code>scrollHost</code>。</p><p>不传 <code>scrollHost</code> 也可以正常显示，只是不会接管滚动条。</p><div class="tip custom-block"><p class="custom-block-title"><code>scrollHost</code> 怎么理解</p><p>把 <code>scrollHost</code> 当成“真实出现滚动条的那个元素”。</p><ul><li>如果你自己写的是 <code>div</code>，就把 <code>div</code> 的 <code>ref</code> 传进来</li><li>如果你传的是组件 <code>ref</code>，这个组件的根元素需要就是滚动容器</li></ul></div><p>使用时注意三点：</p><ul><li><code>scrollHost</code> 必须指向真实滚动容器</li><li>滚动容器本身需要设置 <code>overflow: auto</code> 或 <code>overflow-y: auto</code></li><li>建议同时设置 <code>width: 100%</code>、<code>height: 100%</code>、<code>box-sizing: border-box</code></li></ul><p><code>Layout.Main</code> 会统一处理主区滚动条的展示，因此不建议再额外定制 <code>scrollHost</code> 的滚动条样式。</p>',8)),s(e(o(y),null,null,512),[[p,d.value]]),e(l,null,{default:n(()=>[e(o(f),{title:"主区滚动",description:"切换查看 BubbleList 和普通 div 两种 scrollHost 写法。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22main-scroll.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Flayout%2Fmain-scroll.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20MainScrollBubble%20from%20'.%2Fmain-scroll-bubble.vue'%5Cnimport%20MainScrollDiv%20from%20'.%2Fmain-scroll-div.vue'%5Cn%5Cnconst%20activeExample%20%3D%20ref%3C'bubble'%20%7C%20'div'%3E('bubble')%5Cn%5Cnconst%20currentExample%20%3D%20computed(()%20%3D%3E%20(activeExample.value%20%3D%3D%3D%20'bubble'%20%3F%20MainScrollBubble%20%3A%20MainScrollDiv))%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22layout-main-scroll-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22layout-main-scroll-demo__switcher%5C%22%20aria-label%3D%5C%22%E4%B8%BB%E5%8C%BA%E6%BB%9A%E5%8A%A8%E7%A4%BA%E4%BE%8B%E5%88%87%E6%8D%A2%5C%22%3E%5Cn%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20class%3D%5C%22layout-main-scroll-demo__switch%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%7B%20'is-active'%3A%20activeExample%20%3D%3D%3D%20'bubble'%20%7D%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aaria-pressed%3D%5C%22activeExample%20%3D%3D%3D%20'bubble'%5C%22%5Cn%20%20%20%20%20%20%20%20%40click%3D%5C%22activeExample%20%3D%20'bubble'%5C%22%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20BubbleList%5Cn%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%5Cn%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20class%3D%5C%22layout-main-scroll-demo__switch%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%7B%20'is-active'%3A%20activeExample%20%3D%3D%3D%20'div'%20%7D%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aaria-pressed%3D%5C%22activeExample%20%3D%3D%3D%20'div'%5C%22%5Cn%20%20%20%20%20%20%20%20%40click%3D%5C%22activeExample%20%3D%20'div'%5C%22%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%E6%99%AE%E9%80%9A%20div%5Cn%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cp%20class%3D%5C%22layout-main-scroll-demo__tip%5C%22%3E%E4%B8%A4%E7%A7%8D%E5%86%99%E6%B3%95%E9%83%BD%E6%8A%8A%E7%9C%9F%E5%AE%9E%E6%BB%9A%E5%8A%A8%E5%AE%B9%E5%99%A8%E4%BC%A0%E7%BB%99%20%60scrollHost%60%EF%BC%8C%E5%8C%BA%E5%88%AB%E5%8F%AA%E5%9C%A8%E6%BB%9A%E5%8A%A8%E5%86%85%E5%AE%B9%E6%9C%AC%E8%BA%AB%E6%98%AF%E4%BB%80%E4%B9%88%E3%80%82%3C%2Fp%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22layout-main-scroll-demo__stage%5C%22%3E%5Cn%20%20%20%20%20%20%3Ccomponent%20%3Ais%3D%5C%22currentExample%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.layout-main-scroll-demo%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__switcher%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%208px%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__switch%20%7B%5Cn%20%20height%3A%2034px%3B%5Cn%20%20padding%3A%200%2012px%3B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider%2C%20var(--tr-border-color%2C%20%23dcdfe6))%3B%5Cn%20%20border-radius%3A%208px%3B%5Cn%20%20background%3A%20var(--vp-c-bg%2C%20%23ffffff)%3B%5Cn%20%20color%3A%20var(--vp-c-text-2%2C%20var(--tr-text-secondary%2C%20%234e5969))%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__switch.is-active%20%7B%5Cn%20%20border-color%3A%20var(--vp-c-brand-1%2C%20var(--tr-color-primary%2C%20%235e7ce0))%3B%5Cn%20%20color%3A%20var(--vp-c-brand-1%2C%20var(--tr-color-primary%2C%20%235e7ce0))%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__tip%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20color%3A%20var(--vp-c-text-2%2C%20var(--tr-text-secondary%2C%20%234e5969))%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__stage%20%7B%5Cn%20%20--tr-bubble-box-bg%3A%20var(--tr-color-primary-light)%3B%5Cn%20%20--tr-layout-height%3A%20400px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22main-scroll-bubble.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Flayout%2Fmain-scroll-bubble.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20BubbleList%2C%20TrLayout%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cntype%20LayoutMainScrollHost%20%3D%20HTMLElement%20%7C%20%7B%20%24el%3A%20Element%20%7C%20null%20%7D%20%7C%20null%20%7C%20undefined%5Cn%5Cnconst%20scrollHostRef%20%3D%20ref%3CLayoutMainScrollHost%3E(null)%5Cn%5Cnconst%20messages%20%3D%20Array.from(%7B%20length%3A%2024%20%7D%2C%20(_%2C%20index)%20%3D%3E%20(%7B%5Cn%20%20role%3A%20index%20%25%202%20%3D%3D%3D%200%20%3F%20'assistant'%20%3A%20'user'%2C%5Cn%20%20content%3A%20%60layout%20message%20%24%7Bindex%20%2B%201%7D%60%2C%5Cn%7D))%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3CTrLayout%20class%3D%5C%22layout-main-scroll-example%20layout-main-scroll-example--bubble%5C%22%3E%5Cn%20%20%20%20%3Ctemplate%20%23main%3E%5Cn%20%20%20%20%20%20%3CTrLayout.Main%20%3Ascroll-host%3D%5C%22scrollHostRef%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3CBubbleList%20ref%3D%5C%22scrollHostRef%5C%22%20%3Amessages%3D%5C%22messages%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%3C%2FTrLayout.Main%3E%5Cn%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%3C%2FTrLayout%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.layout-main-scroll-example%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-example--bubble%20%7B%5Cn%20%20--tr-bubble-box-bg%3A%20var(--tr-color-primary-light)%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22main-scroll-div.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Flayout%2Fmain-scroll-div.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrLayout%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cntype%20LayoutMainScrollHost%20%3D%20HTMLElement%20%7C%20%7B%20%24el%3A%20Element%20%7C%20null%20%7D%20%7C%20null%20%7C%20undefined%5Cn%5Cnconst%20scrollHostRef%20%3D%20ref%3CLayoutMainScrollHost%3E(null)%5Cn%5Cnconst%20sections%20%3D%20Array.from(%7B%20length%3A%2012%20%7D%2C%20(_%2C%20index)%20%3D%3E%20(%7B%5Cn%20%20title%3A%20%60Section%20%24%7Bindex%20%2B%201%7D%60%2C%5Cn%20%20text%3A%20'%E6%99%AE%E9%80%9A%E6%BB%9A%E5%8A%A8%E5%AE%B9%E5%99%A8%E5%90%8C%E6%A0%B7%E5%8F%AF%E4%BB%A5%E7%9B%B4%E6%8E%A5%E4%BA%A4%E7%BB%99%20Layout.Main%20%E7%AE%A1%E7%90%86%E3%80%82'%2C%5Cn%7D))%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3CTrLayout%20class%3D%5C%22layout-main-scroll-example%20layout-main-scroll-example--div%5C%22%3E%5Cn%20%20%20%20%3Ctemplate%20%23main%3E%5Cn%20%20%20%20%20%20%3CTrLayout.Main%20%3Ascroll-host%3D%5C%22scrollHostRef%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20ref%3D%5C%22scrollHostRef%5C%22%20class%3D%5C%22layout-main-scroll-div__host%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Carticle%20v-for%3D%5C%22section%20in%20sections%5C%22%20%3Akey%3D%5C%22section.title%5C%22%20class%3D%5C%22layout-main-scroll-div__card%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cstrong%3E%7B%7B%20section.title%20%7D%7D%3C%2Fstrong%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cp%3E%7B%7B%20section.text%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Farticle%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2FTrLayout.Main%3E%5Cn%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%3C%2FTrLayout%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.layout-main-scroll-example%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-div__host%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20overflow%3A%20auto%3B%5Cn%20%20box-sizing%3A%20border-box%3B%5Cn%20%20padding%3A%2016px%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-div__card%20%7B%5Cn%20%20padding%3A%2016px%3B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider%2C%20var(--tr-border-color%2C%20%23dcdfe6))%3B%5Cn%20%20border-radius%3A%2012px%3B%5Cn%20%20background%3A%20var(--vp-c-bg%2C%20%23ffffff)%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-div__card%20p%20%7B%5Cn%20%20margin%3A%208px%200%200%3B%5Cn%20%20color%3A%20var(--vp-c-text-2%2C%20var(--tr-text-secondary%2C%20%234e5969))%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[5]||(t[5]=()=>{d.value=!1}),vueCode:o(W)},u({_:2},[_.value?{name:"vue",fn:n(()=>[e(o(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[16]||(t[16]=c('<p>配置详见：<a href="#layout-main-props">Layout.Main Props</a>、<a href="#layout-css-content">CSS 变量</a></p><h2 id="浮层" tabindex="-1">浮层 <a class="header-anchor" href="#浮层" aria-label="Permalink to &quot;浮层&quot;">​</a></h2><p>适合临时面板、对话工作区等悬浮场景。相关配置只在 <code>mode=&quot;floating&quot;</code> 时生效。</p><h3 id="基本用法" tabindex="-1">基本用法 <a class="header-anchor" href="#基本用法" aria-label="Permalink to &quot;基本用法&quot;">​</a></h3><p><code>defaultFloatingState</code> 用来设置初始位置和大小，<code>floatingOptions</code> 用来控制是否可拖动、是否可缩放，以及尺寸范围。</p><p>同一个浮层只需要选一种写法：</p><ul><li>想让组件自己记住位置和大小，用 <code>defaultFloatingState</code></li><li>想让外部控制位置和大小，用 <code>floatingState</code></li></ul>',7)),s(e(o(y),null,null,512),[[p,d.value]]),e(l,null,{default:n(()=>[e(o(f),{title:"基本用法",description:"打开时通过 defaultFloatingState 设置初始位置和大小。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[6]||(t[6]=()=>{d.value=!1}),vueCode:o(S)},u({_:2},[g.value?{name:"vue",fn:n(()=>[e(o(g))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[17]||(t[17]=c('<p>示例通过 <code>v-if</code> 控制挂载，关闭后重新打开会重新读取 <code>defaultFloatingState</code>。</p><h3 id="状态控制-1" tabindex="-1">状态控制 <a class="header-anchor" href="#状态控制-1" aria-label="Permalink to &quot;状态控制&quot;">​</a></h3><p><code>floatingState</code> 配合 <code>update:floatingState</code> 可以从外部控制浮层的位置和大小。外部不回写，界面不会变化。</p><p>是否使用 <code>floatingState</code>，会在第一次渲染时确定。不要在已经显示出来之后，再切换成另一种写法。</p><p><code>placement</code> 为 <code>center</code> 时，第一次拖动或缩放后，会自动换成最近的角位置。</p>',5)),s(e(o(y),null,null,512),[[p,d.value]]),e(l,null,{default:n(()=>[e(o(f),{title:"状态控制",description:"通过 floatingState 和 update:floatingState 回写浮层状态。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[7]||(t[7]=()=>{d.value=!1}),vueCode:o(T)},u({_:2},[h.value?{name:"vue",fn:n(()=>[e(o(h))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[18]||(t[18]=c('<p>配置详见：<a href="#layout-props">Layout Props</a>、<a href="#types">Types</a>、<a href="#layout-layout-events">Layout Events</a>、<a href="#layout-css-basics">CSS 变量</a></p><h2 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h2><p><a id="layout-props"></a></p><h3 id="layout" tabindex="-1">Layout <a class="header-anchor" href="#layout" aria-label="Permalink to &quot;Layout&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td><code>mode</code></td><td>布局模式；<code>normal</code> 参与普通布局，<code>floating</code> 会脱离普通布局并 Teleport 到 <code>body</code></td><td><code>&#39;normal&#39; | &#39;floating&#39;</code></td><td><code>&#39;normal&#39;</code></td></tr><tr><td><code>leftAside</code></td><td>左侧栏配置</td><td><code>LayoutAsideProps</code></td><td><code>-</code></td></tr><tr><td><code>rightAside</code></td><td>右侧栏配置</td><td><code>LayoutAsideProps</code></td><td><code>-</code></td></tr><tr><td><code>floatingState</code></td><td>受控浮层状态，需配合 <code>update:floatingState</code> 回写</td><td><code>LayoutFloatingState</code></td><td><code>-</code></td></tr><tr><td><code>defaultFloatingState</code></td><td>非受控浮层初始状态，仅首次挂载读取一次</td><td><code>LayoutFloatingState</code></td><td><code>-</code></td></tr><tr><td><code>floatingOptions</code></td><td>浮层拖拽、缩放和尺寸约束配置</td><td><code>LayoutFloatingOptions</code></td><td><code>-</code></td></tr></tbody></table><p><a id="layout-main-props"></a></p><h3 id="layout-main" tabindex="-1">Layout.Main <a class="header-anchor" href="#layout-main" aria-label="Permalink to &quot;Layout.Main&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td><code>scrollHost</code></td><td>真实滚动容器的元素或组件实例 ref</td><td><code>HTMLElement | ComponentPublicInstance | null</code></td><td><code>-</code></td></tr></tbody></table><p><a id="layout-aside-toggle-props"></a></p><h3 id="layout-asidetoggle" tabindex="-1">Layout.AsideToggle <a class="header-anchor" href="#layout-asidetoggle" aria-label="Permalink to &quot;Layout.AsideToggle&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td><code>placement</code></td><td>控制的侧栏位置</td><td><code>&#39;left&#39; | &#39;right&#39;</code></td><td><code>-</code></td></tr></tbody></table><p>它只是一个现成的开关按钮。需要展示更多状态或自定义交互时，优先用 <code>left-aside</code> / <code>right-aside</code> 插槽。</p><h2 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h2><p><a id="layout-slots"></a></p><h3 id="layout-1" tabindex="-1">Layout <a class="header-anchor" href="#layout-1" aria-label="Permalink to &quot;Layout&quot;">​</a></h3><table tabindex="0"><thead><tr><th>插槽名</th><th>说明</th><th>作用域参数</th></tr></thead><tbody><tr><td><code>left-aside</code></td><td>左侧栏内容</td><td><code>LayoutAsideSlotProps</code></td></tr><tr><td><code>header</code></td><td>顶部区域</td><td><code>-</code></td></tr><tr><td><code>main</code></td><td>主区内容</td><td><code>-</code></td></tr><tr><td><code>footer</code></td><td>底部区域</td><td><code>-</code></td></tr><tr><td><code>right-aside</code></td><td>右侧栏内容</td><td><code>LayoutAsideSlotProps</code></td></tr></tbody></table><h3 id="layout-asidetoggle-1" tabindex="-1">Layout.AsideToggle <a class="header-anchor" href="#layout-asidetoggle-1" aria-label="Permalink to &quot;Layout.AsideToggle&quot;">​</a></h3><table tabindex="0"><thead><tr><th>插槽名</th><th>说明</th><th>作用域参数</th></tr></thead><tbody><tr><td><code>default</code></td><td>自定义切换按钮内容</td><td><code>{ isOpen: boolean }</code></td></tr></tbody></table><h2 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h2><p><a id="layout-layout-events"></a></p><h3 id="layout-2" tabindex="-1">Layout <a class="header-anchor" href="#layout-2" aria-label="Permalink to &quot;Layout&quot;">​</a></h3><table tabindex="0"><thead><tr><th>事件名</th><th>说明</th><th>回调参数</th></tr></thead><tbody><tr><td><code>left-aside-state-change</code></td><td>左侧栏运行时状态变化</td><td><code>(value: LayoutAsideState)</code></td></tr><tr><td><code>right-aside-state-change</code></td><td>右侧栏运行时状态变化</td><td><code>(value: LayoutAsideState)</code></td></tr><tr><td><code>update:floatingState</code></td><td>浮层位置或尺寸变化</td><td><code>(value: LayoutFloatingState)</code></td></tr><tr><td><code>aside-resize-start</code></td><td>开始调整侧栏宽度</td><td><code>(detail: LayoutAsideResizeEventDetail)</code></td></tr><tr><td><code>aside-resize</code></td><td>调整侧栏宽度时持续触发</td><td><code>(detail: LayoutAsideResizeEventDetail)</code></td></tr><tr><td><code>aside-resize-end</code></td><td>结束调整侧栏宽度</td><td><code>(detail: LayoutAsideResizeEventDetail)</code></td></tr><tr><td><code>floating-drag-start</code></td><td>开始拖动浮层</td><td><code>(detail: LayoutFloatingDragEventDetail)</code></td></tr><tr><td><code>floating-drag</code></td><td>拖动浮层时持续触发</td><td><code>(detail: LayoutFloatingDragEventDetail)</code></td></tr><tr><td><code>floating-drag-end</code></td><td>结束拖动浮层</td><td><code>(detail: LayoutFloatingDragEventDetail)</code></td></tr><tr><td><code>floating-resize-start</code></td><td>开始调整浮层尺寸</td><td><code>(detail: LayoutFloatingResizeEventDetail)</code></td></tr><tr><td><code>floating-resize</code></td><td>调整浮层尺寸时持续触发</td><td><code>(detail: LayoutFloatingResizeEventDetail)</code></td></tr><tr><td><code>floating-resize-end</code></td><td>结束调整浮层尺寸</td><td><code>(detail: LayoutFloatingResizeEventDetail)</code></td></tr></tbody></table><p><code>left-aside-state-change</code> / <code>right-aside-state-change</code> 只回传运行时状态字段 <code>open</code> 和 <code>expandedWidth</code>。受控写法下，需要外部把它合并回 <code>leftAside</code> / <code>rightAside</code>。</p><p>这两个事件只是告诉你“侧栏现在变成了什么状态”，不会把整个 <code>leftAside</code> / <code>rightAside</code> 对象原样回传回来。</p><h4 id="侧栏-resize-事件字段" tabindex="-1">侧栏 resize 事件字段 <a class="header-anchor" href="#侧栏-resize-事件字段" aria-label="Permalink to &quot;侧栏 resize 事件字段&quot;">​</a></h4><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th></tr></thead><tbody><tr><td><code>placement</code></td><td>当前被调整的侧栏位置</td><td><code>&#39;left&#39; | &#39;right&#39;</code></td></tr><tr><td><code>width</code></td><td>当前侧栏宽度</td><td><code>number</code></td></tr></tbody></table><h4 id="浮层-drag-事件字段" tabindex="-1">浮层 drag 事件字段 <a class="header-anchor" href="#浮层-drag-事件字段" aria-label="Permalink to &quot;浮层 drag 事件字段&quot;">​</a></h4><p><code>floating-drag-start</code> / <code>floating-drag</code> / <code>floating-drag-end</code> 直接返回 <code>LayoutFloatingState</code>。</p><h4 id="浮层-resize-事件字段" tabindex="-1">浮层 resize 事件字段 <a class="header-anchor" href="#浮层-resize-事件字段" aria-label="Permalink to &quot;浮层 resize 事件字段&quot;">​</a></h4><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th></tr></thead><tbody><tr><td><code>handle</code></td><td>当前拖动的边或角</td><td><code>&#39;n&#39; | &#39;s&#39; | &#39;e&#39; | &#39;w&#39; | &#39;ne&#39; | &#39;nw&#39; | &#39;se&#39; | &#39;sw&#39;</code></td></tr><tr><td><code>placement</code></td><td>当前锚点位置</td><td><code>&#39;top-left&#39; | &#39;top-right&#39; | &#39;bottom-left&#39; | &#39;bottom-right&#39; | &#39;center&#39;</code></td></tr><tr><td><code>offsetX</code></td><td>横向偏移；<code>center</code> 下不参与定位</td><td><code>number</code></td></tr><tr><td><code>offsetY</code></td><td>纵向偏移；<code>center</code> 下不参与定位</td><td><code>number</code></td></tr><tr><td><code>width</code></td><td>当前宽度</td><td><code>number</code></td></tr><tr><td><code>height</code></td><td>当前高度</td><td><code>number</code></td></tr></tbody></table><p><a id="types"></a></p><h2 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h2><h3 id="layoutasideprops" tabindex="-1">LayoutAsideProps <a class="header-anchor" href="#layoutasideprops" aria-label="Permalink to &quot;LayoutAsideProps&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td><code>mode</code></td><td>侧栏模式</td><td><code>&#39;dock&#39; | &#39;drawer&#39;</code></td><td><code>&#39;dock&#39;</code></td></tr><tr><td><code>open</code></td><td>受控开关状态</td><td><code>boolean</code></td><td><code>-</code></td></tr><tr><td><code>defaultOpen</code></td><td>非受控初始开关状态</td><td><code>boolean</code></td><td><code>left: true</code> / <code>right: false</code></td></tr><tr><td><code>expandedWidth</code></td><td>受控展开宽度，仅 <code>dock</code> 生效</td><td><code>number</code></td><td><code>-</code></td></tr><tr><td><code>defaultExpandedWidth</code></td><td>非受控初始展开宽度，仅 <code>dock</code> 生效</td><td><code>number</code></td><td><code>-</code></td></tr><tr><td><code>minExpandedWidth</code></td><td>最小展开宽度，仅 <code>dock</code> 生效</td><td><code>number</code></td><td><code>left: 200</code> / <code>right: 240</code></td></tr><tr><td><code>maxExpandedWidth</code></td><td>最大展开宽度，仅 <code>dock</code> 生效</td><td><code>number</code></td><td><code>left: 560</code> / <code>right: 640</code></td></tr><tr><td><code>collapsedWidth</code></td><td>收起后保留的窄栏宽度，仅 <code>dock</code> 生效</td><td><code>number</code></td><td><code>0</code></td></tr><tr><td><code>collapseEffect</code></td><td><code>dock</code> 收起到窄栏时的内容动画</td><td><code>&#39;overlay&#39; | &#39;slide&#39;</code></td><td><code>&#39;overlay&#39;</code></td></tr><tr><td><code>resizable</code></td><td>是否允许拖拽改宽，仅 <code>dock</code> 生效</td><td><code>boolean</code></td><td><code>false</code></td></tr></tbody></table><h3 id="layoutasidestate" tabindex="-1">LayoutAsideState <a class="header-anchor" href="#layoutasidestate" aria-label="Permalink to &quot;LayoutAsideState&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th></tr></thead><tbody><tr><td><code>open</code></td><td>当前开关状态</td><td><code>boolean</code></td></tr><tr><td><code>expandedWidth</code></td><td>当前展开宽度</td><td><code>number | undefined</code></td></tr></tbody></table><h3 id="layoutasideslotprops" tabindex="-1">LayoutAsideSlotProps <a class="header-anchor" href="#layoutasideslotprops" aria-label="Permalink to &quot;LayoutAsideSlotProps&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th></tr></thead><tbody><tr><td><code>placement</code></td><td>侧栏位置</td><td><code>&#39;left&#39; | &#39;right&#39;</code></td></tr><tr><td><code>mode</code></td><td>当前侧栏模式</td><td><code>&#39;dock&#39; | &#39;drawer&#39;</code></td></tr><tr><td><code>open</code></td><td>当前是否展开</td><td><code>boolean</code></td></tr><tr><td><code>expandedWidth</code></td><td>当前展开宽度</td><td><code>number | undefined</code></td></tr><tr><td><code>collapsedWidth</code></td><td>收起后窄栏宽度</td><td><code>number | undefined</code></td></tr><tr><td><code>resizable</code></td><td>是否允许拖拽改宽</td><td><code>boolean</code></td></tr><tr><td><code>isRail</code></td><td>当前是否处于窄栏状态</td><td><code>boolean</code></td></tr><tr><td><code>isHidden</code></td><td>当前是否处于隐藏状态</td><td><code>boolean</code></td></tr><tr><td><code>canResize</code></td><td>当前是否可以拖拽改宽</td><td><code>boolean</code></td></tr><tr><td><code>toggle</code></td><td>切换开关</td><td><code>() =&gt; void</code></td></tr><tr><td><code>setOpen</code></td><td>直接设置开关状态</td><td><code>(next: boolean) =&gt; void</code></td></tr><tr><td><code>setExpandedWidth</code></td><td>直接设置展开宽度</td><td><code>(next: number) =&gt; void</code></td></tr></tbody></table><p><a id="layout-floating-fields"></a></p><h3 id="layoutfloatingstate" tabindex="-1">LayoutFloatingState <a class="header-anchor" href="#layoutfloatingstate" aria-label="Permalink to &quot;LayoutFloatingState&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td><code>placement</code></td><td>浮层锚点位置</td><td><code>&#39;top-left&#39; | &#39;top-right&#39; | &#39;bottom-left&#39; | &#39;bottom-right&#39; | &#39;center&#39;</code></td><td><code>&#39;center&#39;</code></td></tr><tr><td><code>offsetX</code></td><td>横向偏移；<code>center</code> 下不参与定位</td><td><code>number</code></td><td><code>24</code></td></tr><tr><td><code>offsetY</code></td><td>纵向偏移；<code>center</code> 下不参与定位</td><td><code>number</code></td><td><code>24</code></td></tr><tr><td><code>width</code></td><td>浮层宽度；非受控时表示初始值，受控时表示当前值</td><td><code>number</code></td><td><code>420</code></td></tr><tr><td><code>height</code></td><td>浮层高度；非受控时表示初始值，受控时表示当前值</td><td><code>number</code></td><td><code>560</code></td></tr></tbody></table><h3 id="layoutfloatingoptions" tabindex="-1">LayoutFloatingOptions <a class="header-anchor" href="#layoutfloatingoptions" aria-label="Permalink to &quot;LayoutFloatingOptions&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td><code>draggable</code></td><td>是否允许拖动浮层</td><td><code>boolean</code></td><td><code>true</code></td></tr><tr><td><code>resizable</code></td><td>是否允许通过 8 个方向手柄调整尺寸</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td><code>minWidth</code></td><td>最小宽度</td><td><code>number</code></td><td><code>320</code></td></tr><tr><td><code>maxWidth</code></td><td>最大宽度</td><td><code>number</code></td><td><code>视口宽度</code></td></tr><tr><td><code>minHeight</code></td><td>最小高度</td><td><code>number</code></td><td><code>240</code></td></tr><tr><td><code>maxHeight</code></td><td>最大高度</td><td><code>number</code></td><td><code>视口高度</code></td></tr></tbody></table><h2 id="css-变量" tabindex="-1">CSS 变量 <a class="header-anchor" href="#css-变量" aria-label="Permalink to &quot;CSS 变量&quot;">​</a></h2><p><a id="layout-css-basics"></a></p><h3 id="布局基础" tabindex="-1">布局基础 <a class="header-anchor" href="#布局基础" aria-label="Permalink to &quot;布局基础&quot;">​</a></h3><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-layout-height</code></td><td>布局高度</td></tr><tr><td><code>--tr-layout-bg</code></td><td>容器背景</td></tr><tr><td><code>--tr-layout-left-bg</code></td><td>左侧栏背景</td></tr><tr><td><code>--tr-layout-right-bg</code></td><td>右侧栏背景</td></tr><tr><td><code>--tr-layout-header-bg</code></td><td>顶部背景</td></tr><tr><td><code>--tr-layout-main-bg</code></td><td>主区背景</td></tr><tr><td><code>--tr-layout-footer-bg</code></td><td>底部背景</td></tr><tr><td><code>--tr-layout-divider-color</code></td><td>分隔线颜色</td></tr><tr><td><code>--tr-layout-overlay-bg</code></td><td>drawer 遮罩颜色</td></tr><tr><td><code>--tr-layout-panel-shadow</code></td><td>drawer 阴影</td></tr><tr><td><code>--tr-layout-frame-radius</code></td><td>浮层圆角</td></tr><tr><td><code>--tr-layout-frame-shadow</code></td><td>浮层阴影</td></tr><tr><td><code>--tr-layout-frame-z-index</code></td><td>浮层层级</td></tr></tbody></table><p><a id="layout-css-content"></a></p><h3 id="内容与交互" tabindex="-1">内容与交互 <a class="header-anchor" href="#内容与交互" aria-label="Permalink to &quot;内容与交互&quot;">​</a></h3><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-layout-content-max-width</code></td><td>header、main、footer 内容区的最大宽度</td></tr><tr><td><code>--tr-layout-inner-padding-inline</code></td><td>横向内边距</td></tr><tr><td><code>--tr-layout-inner-padding-block</code></td><td>纵向内边距</td></tr><tr><td><code>--tr-layout-main-min-width</code></td><td>主区最小宽度</td></tr><tr><td><code>--tr-layout-drawer-width</code></td><td>drawer 展示宽度</td></tr><tr><td><code>--tr-layout-main-scrollbar-width</code></td><td>滚动条宽度</td></tr><tr><td><code>--tr-layout-main-scrollbar-thumb-bg</code></td><td>滚动条滑块颜色</td></tr><tr><td><code>--tr-layout-main-scrollbar-thumb-bg-hover</code></td><td>滑块悬停颜色</td></tr><tr><td><code>--tr-layout-main-scrollbar-thumb-bg-active</code></td><td>滑块激活颜色</td></tr></tbody></table>',50))])}}});export{G as __pageData,I as default};
