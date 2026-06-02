<script setup lang="ts">
import { computed, ref } from 'vue'
import { BubbleList, TrLayout } from '@opentiny/tiny-robot'
import type { LayoutAsideConfig, LayoutFloatingConfig, LayoutMainScrollHost } from '@opentiny/tiny-robot'

const mode = ref<'normal' | 'floating'>('normal')
const scrollHostRef = ref<LayoutMainScrollHost>(null)
const leftCollapseEffect = ref<'overlay' | 'slide'>('overlay')
const rightCollapseEffect = ref<'overlay' | 'slide'>('overlay')
const showHeaderSlot = ref(true)
const showLeftAsideSlot = ref(true)

const leftAside = ref<LayoutAsideConfig>({
  layoutMode: 'dock',
  expanded: true,
  expandedWidth: 280,
  collapsedWidth: 56,
  resizable: true,
  minExpandedWidth: 220,
  maxExpandedWidth: 420,
})

const rightAside = ref<LayoutAsideConfig>({
  layoutMode: 'drawer',
  expanded: false,
  expandedWidth: 320,
  collapsedWidth: 0,
  resizable: true,
  minExpandedWidth: 240,
  maxExpandedWidth: 420,
})

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

const leftExpanded = computed(() => String(leftAside.value.expanded ?? false))
const rightExpanded = computed(() => String(rightAside.value.expanded ?? false))

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
  leftAside.value = { ...leftAside.value, layoutMode }
}

function setRightMode(layoutMode: 'dock' | 'drawer') {
  rightAside.value = { ...rightAside.value, layoutMode }
}

function toggleLeft() {
  leftAside.value = { ...leftAside.value, expanded: !(leftAside.value.expanded ?? false) }
  metrics.value.leftToggleActions += 1
}

function toggleRight() {
  rightAside.value = { ...rightAside.value, expanded: !(rightAside.value.expanded ?? false) }
  metrics.value.rightToggleActions += 1
}

function collapseLeft() {
  leftAside.value = { ...leftAside.value, expanded: false }
}

function collapseRight() {
  rightAside.value = { ...rightAside.value, expanded: false }
}

function disableLeftResizable() {
  leftAside.value = { ...leftAside.value, resizable: false }
}

function disableRightResizable() {
  rightAside.value = { ...rightAside.value, resizable: false }
}

function setLeftCollapsedWidthUnsafe(collapsedWidth: string) {
  leftAside.value = { ...leftAside.value, collapsedWidth: collapsedWidth as LayoutAsideConfig['collapsedWidth'] }
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

function updateLeftAside(next?: LayoutAsideConfig) {
  leftAside.value = next ?? {}
}

function updateRightAside(next?: LayoutAsideConfig) {
  rightAside.value = next ?? {}
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
      <button data-testid="left-collapsed-calc-btn" type="button" @click="setLeftCollapsedWidthUnsafe('calc(56px)')">
        left collapsed calc
      </button>

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
        :left-aside="leftAside"
        :right-aside="rightAside"
        @update:left-aside="updateLeftAside"
        @update:right-aside="updateRightAside"
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
          <TrLayout.Aside v-if="showLeftAsideSlot" placement="left" :collapse-effect="leftCollapseEffect">
            <div class="layout-demo__aside-content" data-testid="left-aside-slot">
              <div class="layout-demo__aside-header">
                <span data-testid="left-expanded-state">{{ leftExpanded }}</span>
                <TrLayout.AsideToggle placement="left" data-testid="left-aside-toggle">
                  <template #default="{ isExpanded }">
                    <span data-testid="left-toggle-slot">{{ isExpanded ? 'left-open' : 'left-close' }}</span>
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
          <TrLayout.Aside placement="right" :collapse-effect="rightCollapseEffect">
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
  --tr-layout-main-max-width: none;
  --tr-layout-header-max-width: none;
  --tr-layout-footer-max-width: none;
  --tr-layout-header-padding-inline: 0;
  --tr-layout-main-padding-inline: 0;
  --tr-layout-footer-padding-inline: 0;
  --tr-layout-inner-padding-block: 0;
  --tr-layout-left-bg: #f8fafc;
  --tr-layout-right-bg: #f8fafc;
  --tr-layout-header-bg: #ffffff;
  --tr-layout-main-bg: #ffffff;
  --tr-layout-footer-bg: #ffffff;
  --tr-layout-main-scrollbar-inline-end: 4px;
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
