<script setup lang="ts">
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
      关闭回写后，拖拽和 resize 仍会触发 `update:floatingState`，但浮层会保持 `floatingState` prop 当前的值。
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
          <div class="layout-floating-controlled-demo__note">开启回写后，拖动或缩放会直接同步到 `floatingState`。</div>
          <div class="layout-floating-controlled-demo__note">
            初始 `placement` 为 `center`，第一次拖动或缩放后会自动换成最近的角位置。
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

.layout-floating-controlled-demo__note {
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--vp-c-brand-soft, #e6f4ff);
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
  line-height: 1.6;
}
</style>
