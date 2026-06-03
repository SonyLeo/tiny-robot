<script setup lang="ts">
import { computed, ref } from 'vue'
import { BubbleList, TrLayout } from '@opentiny/tiny-robot'
import type { LayoutFloatingConfig, LayoutMainScrollHost } from '@opentiny/tiny-robot'
import AsideStateFixtures from './fixtures/AsideStateFixtures.vue'
import FloatingStateFixtures from './fixtures/FloatingStateFixtures.vue'

const mode = ref<'normal' | 'floating'>('normal')
const scrollHostRef = ref<LayoutMainScrollHost>(null)
const leftCollapseEffect = ref<'overlay' | 'slide'>('overlay')
const rightCollapseEffect = ref<'overlay' | 'slide'>('overlay')
const showHeaderSlot = ref(true)
const showLeftAsideSlot = ref(true)
const leftMode = ref<'dock' | 'drawer'>('dock')
const rightMode = ref<'dock' | 'drawer'>('drawer')
const leftOpen = ref(true)
const rightOpen = ref(false)
const leftWidth = ref(280)
const rightWidth = ref(320)
const leftRailWidth = ref(56)
const rightRailWidth = ref(0)
const leftResizable = ref(true)
const rightResizable = ref(true)
const showAsideStateFixtures = ref(false)
const showFloatingStateFixtures = ref(false)

const floating = ref<LayoutFloatingConfig>({
  x: 96,
  y: 72,
  width: 520,
  height: 620,
  draggable: true,
  resizable: true,
  minWidth: 360,
  maxWidth: 720,
})

const leftExpanded = computed(() => String(leftOpen.value))
const rightExpanded = computed(() => String(rightOpen.value))

const metrics = ref({
  leftResizeStart: 0,
  leftResizeEnd: 0,
  rightResizeStart: 0,
  rightResizeEnd: 0,
  floatingLeftResizeStart: 0,
  floatingLeftResizeEnd: 0,
  floatingRightResizeStart: 0,
  floatingRightResizeEnd: 0,
  leftToggleActions: 0,
  rightToggleActions: 0,
  modeToggleActions: 0,
})

const widths = ref({
  left: 280,
  right: 320,
  floating: 520,
})

const messages = ref(
  Array.from({ length: 40 }, (_, index) => ({
    role: index % 2 === 0 ? 'assistant' : 'user',
    content: `layout message ${index + 1}`,
  })),
)

function setMode(next: 'normal' | 'floating') {
  mode.value = next
  metrics.value.modeToggleActions += 1
}

function setLeftMode(layoutMode: 'dock' | 'drawer') {
  leftMode.value = layoutMode
}

function setRightMode(layoutMode: 'dock' | 'drawer') {
  rightMode.value = layoutMode
}

function toggleLeft() {
  leftOpen.value = !leftOpen.value
  metrics.value.leftToggleActions += 1
}

function toggleRight() {
  rightOpen.value = !rightOpen.value
  metrics.value.rightToggleActions += 1
}

function collapseLeft() {
  leftOpen.value = false
}

function collapseRight() {
  rightOpen.value = false
}

function disableLeftResizable() {
  leftResizable.value = false
}

function disableRightResizable() {
  rightResizable.value = false
}

function setLeftRailWidth(nextWidth: number) {
  leftRailWidth.value = nextWidth
}

function disableFloatingResizable() {
  floating.value = { ...floating.value, resizable: false }
}

function disableFloatingDraggable() {
  floating.value = { ...floating.value, draggable: false }
}

function emptyConditionalSlots() {
  showHeaderSlot.value = false
  showLeftAsideSlot.value = false
}

function updateLeftOpen(next: boolean) {
  leftOpen.value = next
}

function updateLeftWidth(next: number) {
  leftWidth.value = next
  widths.value.left = next
}

function updateRightOpen(next: boolean) {
  rightOpen.value = next
}

function updateRightWidth(next: number) {
  rightWidth.value = next
  widths.value.right = next
}

function updateFloating(next?: LayoutFloatingConfig) {
  floating.value = next ?? {}
}

function appendMessages() {
  const start = messages.value.length
  messages.value = [
    ...messages.value,
    ...Array.from({ length: 20 }, (_, index) => ({
      role: (start + index) % 2 === 0 ? 'assistant' : 'user',
      content: `layout appended ${start + index + 1}`,
    })),
  ]
}

function resetFloating() {
  floating.value = { ...floating.value, x: 96, y: 72, width: 520, height: 620 }
  widths.value.floating = 520
}
</script>

<template>
  <div class="layout-demo">
    <h2>Layout 组件测试</h2>

    <div class="layout-demo__controls">
      <button data-testid="mode-normal-btn" type="button" @click="setMode('normal')">normal</button>
      <button data-testid="mode-floating-btn" type="button" @click="setMode('floating')">floating</button>
      <button data-testid="reset-floating-btn" type="button" @click="resetFloating">reset floating</button>

      <button data-testid="left-mode-dock-btn" type="button" @click="setLeftMode('dock')">left dock</button>
      <button data-testid="left-mode-drawer-btn" type="button" @click="setLeftMode('drawer')">left drawer</button>
      <button data-testid="left-toggle-btn" type="button" @click="toggleLeft">left toggle</button>
      <button data-testid="left-collapse-btn" type="button" @click="collapseLeft">left collapse</button>
      <button data-testid="left-effect-overlay-btn" type="button" @click="leftCollapseEffect = 'overlay'">
        left overlay
      </button>
      <button data-testid="left-effect-slide-btn" type="button" @click="leftCollapseEffect = 'slide'">
        left slide
      </button>
      <button data-testid="left-resizable-off-btn" type="button" @click="disableLeftResizable">
        left resizable off
      </button>
      <button data-testid="left-rail-width-zero-btn" type="button" @click="setLeftRailWidth(0)">left rail zero</button>

      <button data-testid="right-mode-dock-btn" type="button" @click="setRightMode('dock')">right dock</button>
      <button data-testid="right-mode-drawer-btn" type="button" @click="setRightMode('drawer')">right drawer</button>
      <button data-testid="right-toggle-btn" type="button" @click="toggleRight">right toggle</button>
      <button data-testid="right-collapse-btn" type="button" @click="collapseRight">right collapse</button>
      <button data-testid="right-effect-slide-btn" type="button" @click="rightCollapseEffect = 'slide'">
        right slide
      </button>
      <button data-testid="right-resizable-off-btn" type="button" @click="disableRightResizable">
        right resizable off
      </button>

      <button data-testid="append-messages-btn" type="button" @click="appendMessages">append messages</button>
      <button data-testid="conditional-slots-empty-btn" type="button" @click="emptyConditionalSlots">
        empty conditional slots
      </button>
      <button data-testid="floating-resizable-off-btn" type="button" @click="disableFloatingResizable">
        floating resizable off
      </button>
      <button data-testid="floating-draggable-off-btn" type="button" @click="disableFloatingDraggable">
        floating draggable off
      </button>
      <button data-testid="show-aside-state-fixtures-btn" type="button" @click="showAsideStateFixtures = true">
        show aside fixtures
      </button>
      <button data-testid="show-floating-state-fixtures-btn" type="button" @click="showFloatingStateFixtures = true">
        show floating fixtures
      </button>
    </div>

    <div class="layout-demo__metrics">
      <div data-testid="metric-left-resize-start">{{ metrics.leftResizeStart }}</div>
      <div data-testid="metric-left-resize-end">{{ metrics.leftResizeEnd }}</div>
      <div data-testid="metric-right-resize-start">{{ metrics.rightResizeStart }}</div>
      <div data-testid="metric-right-resize-end">{{ metrics.rightResizeEnd }}</div>
      <div data-testid="metric-floating-left-resize-start">{{ metrics.floatingLeftResizeStart }}</div>
      <div data-testid="metric-floating-left-resize-end">{{ metrics.floatingLeftResizeEnd }}</div>
      <div data-testid="metric-floating-right-resize-start">{{ metrics.floatingRightResizeStart }}</div>
      <div data-testid="metric-floating-right-resize-end">{{ metrics.floatingRightResizeEnd }}</div>
      <div data-testid="metric-left-toggle-actions">{{ metrics.leftToggleActions }}</div>
      <div data-testid="metric-right-toggle-actions">{{ metrics.rightToggleActions }}</div>
      <div data-testid="metric-mode-toggle-actions">{{ metrics.modeToggleActions }}</div>
      <div data-testid="emitted-left-width">{{ widths.left }}</div>
      <div data-testid="emitted-right-width">{{ widths.right }}</div>
      <div data-testid="emitted-floating-width">{{ widths.floating }}</div>
      <div data-testid="messages-count">{{ messages.length }}</div>
    </div>

    <div class="layout-demo__host" data-testid="layout-demo-host">
      <TrLayout
        id="layout-demo-surface"
        class="layout-demo__layout layout-demo__layout--surface-marker"
        data-surface-marker="layout-demo-surface"
        :mode="mode"
        :floating="floating"
        @update:floating="updateFloating"
        @aside-resize-start="
          ({ placement }) => (placement === 'left' ? metrics.leftResizeStart++ : metrics.rightResizeStart++)
        "
        @aside-resize-end="
          ({ placement, width }) => {
            if (placement === 'left') {
              metrics.leftResizeEnd++
              widths.left = width
            } else {
              metrics.rightResizeEnd++
              widths.right = width
            }
          }
        "
        @floating-resize-start="
          ({ edge }) => (edge === 'left' ? metrics.floatingLeftResizeStart++ : metrics.floatingRightResizeStart++)
        "
        @floating-resize-end="
          ({ edge, width }) => {
            widths.floating = width
            if (edge === 'left') metrics.floatingLeftResizeEnd++
            else metrics.floatingRightResizeEnd++
          }
        "
      >
        <template #left-aside>
          <TrLayout.Aside
            v-if="showLeftAsideSlot"
            placement="left"
            :mode="leftMode"
            :open="leftOpen"
            :width="leftWidth"
            :rail-width="leftRailWidth"
            :min-width="220"
            :max-width="420"
            :resizable="leftResizable"
            :collapse-effect="leftCollapseEffect"
            class="layout-demo__aside layout-demo__aside--left"
            @update:open="updateLeftOpen"
            @update:width="updateLeftWidth"
          >
            <div class="layout-demo__aside-content" data-testid="left-aside-slot">
              <div class="layout-demo__aside-header">
                <span data-testid="left-expanded-state">{{ leftExpanded }}</span>
                <TrLayout.AsideToggle placement="left" data-testid="left-aside-toggle">
                  <template #default="{ isOpen }">
                    <span data-testid="left-toggle-slot">{{ isOpen ? 'left-open' : 'left-close' }}</span>
                  </template>
                </TrLayout.AsideToggle>
              </div>
              <div class="layout-demo__aside-body">left aside content</div>
            </div>
          </TrLayout.Aside>
        </template>

        <template #header>
          <div v-if="showHeaderSlot" class="layout-demo__header" data-testid="layout-header-slot">layout header</div>
        </template>

        <template #main>
          <TrLayout.Main :scroll-host="scrollHostRef">
            <BubbleList ref="scrollHostRef" class="layout-demo__bubble-list" :messages="messages" />
          </TrLayout.Main>
        </template>

        <template #footer>
          <div class="layout-demo__footer" data-testid="layout-footer-slot">layout footer</div>
        </template>

        <template #right-aside>
          <TrLayout.Aside
            placement="right"
            :mode="rightMode"
            :open="rightOpen"
            :width="rightWidth"
            :rail-width="rightRailWidth"
            :min-width="240"
            :max-width="420"
            :resizable="rightResizable"
            :collapse-effect="rightCollapseEffect"
            class="layout-demo__aside layout-demo__aside--right"
            @update:open="updateRightOpen"
            @update:width="updateRightWidth"
          >
            <div class="layout-demo__aside-content" data-testid="right-aside-slot">
              <div class="layout-demo__aside-header">
                <span data-testid="right-expanded-state">{{ rightExpanded }}</span>
                <TrLayout.AsideToggle placement="right" data-testid="right-aside-toggle" />
              </div>
              <div class="layout-demo__aside-body">right aside content</div>
            </div>
          </TrLayout.Aside>
        </template>
      </TrLayout>
    </div>

    <AsideStateFixtures v-if="showAsideStateFixtures" />
    <FloatingStateFixtures v-if="showFloatingStateFixtures" />
  </div>
</template>

<style scoped>
.layout-demo {
  display: grid;
  gap: 16px;
}

.layout-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.layout-demo__metrics {
  display: none;
}

.layout-demo__host {
  position: relative;
  height: 720px;
  border: 1px solid #dcdfe6;
  overflow: hidden;
}

.layout-demo__layout {
  --tr-layout-height: 100%;
  --tr-layout-content-max-width: none;
  --tr-layout-inner-padding-inline: 0;
  --tr-layout-inner-padding-block: 0;
  --tr-layout-left-bg: #f8fafc;
  --tr-layout-right-bg: #f8fafc;
  --tr-layout-header-bg: #ffffff;
  --tr-layout-main-bg: #ffffff;
  --tr-layout-footer-bg: #ffffff;
  height: 100%;
}

.layout-demo__header,
.layout-demo__footer {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}

.layout-demo__footer {
  border-top: 1px solid #ebeef5;
  border-bottom: 0;
}

.layout-demo__aside--left {
  --tr-layout-drawer-width: min(84vw, 320px);
}

.layout-demo__aside--right {
  --tr-layout-drawer-width: min(88vw, 360px);
}

.layout-demo__aside-content {
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 100%;
}

.layout-demo__aside-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid #ebeef5;
}

.layout-demo__aside-body {
  padding: 12px;
}

.layout-demo__bubble-list {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 16px;
  box-sizing: border-box;
}
</style>
