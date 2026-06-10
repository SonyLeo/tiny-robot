<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutFloating } from '@opentiny/tiny-robot'

function createFloating(): LayoutFloating {
  return {
    placement: 'top-right',
    offsetX: 0,
    offsetY: 88,
    width: 360,
    height: 420,
    draggable: true,
    resizable: true,
    minWidth: 320,
    minHeight: 240,
  }
}

const open = ref(false)
const writebackEnabled = ref(true)
const floating = ref<LayoutFloating>(createFloating())
const lastEmittedFloating = ref<LayoutFloating | null>(null)

const floatingText = computed(() => JSON.stringify(floating.value, null, 2))
const emittedText = computed(() => JSON.stringify(lastEmittedFloating.value, null, 2))

function updateFloating(nextFloating: LayoutFloating) {
  lastEmittedFloating.value = nextFloating

  if (writebackEnabled.value) {
    floating.value = nextFloating
  }
}

function reset() {
  floating.value = createFloating()
  lastEmittedFloating.value = null
  open.value = true
}
</script>

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
      关闭回写后，拖拽和 resize 仍会触发 `update:floating`，但浮层会保持 `floating` prop 当前的值。
    </p>

    <div class="layout-floating-controlled-demo__grid">
      <div class="layout-floating-controlled-demo__card">
        <div class="layout-floating-controlled-demo__card-title">floating prop</div>
        <pre>{{ floatingText }}</pre>
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
      :floating="floating"
      @update:floating="updateFloating"
    >
      <template #header>
        <div class="layout-floating-controlled-demo__header">
          <strong>受控聊天浮层</strong>
          <button type="button" class="layout-floating-controlled-demo__button" @click="open = false">关闭</button>
        </div>
      </template>

      <template #main>
        <div class="layout-floating-controlled-demo__main">
          <div class="layout-floating-controlled-demo__bubble layout-floating-controlled-demo__bubble--assistant">
            默认贴右侧边缘，`offsetX: 0`，更接近聊天面板场景。
          </div>
          <div class="layout-floating-controlled-demo__bubble layout-floating-controlled-demo__bubble--user">
            拖动顶部横条或 8 个方向手柄，观察右侧 JSON 是否回写。
          </div>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style>
.layout-floating-controlled-demo__layout {
  --tr-layout-surface-radius: 16px;
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

.layout-floating-controlled-demo__bubble {
  max-width: 88%;
  padding: 12px 14px;
  border-radius: 14px;
  line-height: 1.6;
}

.layout-floating-controlled-demo__bubble--assistant {
  background: var(--vp-c-bg-soft, #f6f8fa);
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-floating-controlled-demo__bubble--user {
  margin-inline-start: auto;
  background: var(--vp-c-brand-soft, #e6f4ff);
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}
</style>
