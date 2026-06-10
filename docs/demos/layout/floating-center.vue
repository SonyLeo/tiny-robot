<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutFloating } from '@opentiny/tiny-robot'

function createFloating(): LayoutFloating {
  return {
    placement: 'center',
    width: 420,
    height: 320,
    draggable: true,
    resizable: true,
    minWidth: 320,
    minHeight: 240,
  }
}

const open = ref(false)
const floating = ref<LayoutFloating>(createFloating())

const placementText = computed(() => floating.value.placement ?? 'center')
const floatingText = computed(() => JSON.stringify(floating.value, null, 2))

function updateFloating(nextFloating: LayoutFloating) {
  floating.value = nextFloating
}

function reset() {
  floating.value = createFloating()
  open.value = true
}
</script>

<template>
  <div class="layout-floating-center-demo">
    <div class="layout-floating-center-demo__toolbar">
      <button type="button" class="layout-floating-center-demo__button" @click="open = !open">
        {{ open ? '关闭浮层' : '打开浮层' }}
      </button>
      <button type="button" class="layout-floating-center-demo__button" @click="reset">重置</button>
      <span class="layout-floating-center-demo__hint">当前 placement: {{ placementText }}</span>
    </div>

    <div class="layout-floating-center-demo__card">
      <div class="layout-floating-center-demo__card-title">current floating</div>
      <pre>{{ floatingText }}</pre>
    </div>

    <TrLayout
      v-if="open"
      class="layout-floating-center-demo__layout"
      mode="floating"
      :floating="floating"
      @update:floating="updateFloating"
    >
      <template #header>
        <div class="layout-floating-center-demo__header">
          <strong>center 锚点</strong>
          <button type="button" class="layout-floating-center-demo__button" @click="open = false">关闭</button>
        </div>
      </template>

      <template #main>
        <div class="layout-floating-center-demo__main">
          <p>初始 `placement` 是 `center`。</p>
          <p>从中心拖一次或 resize 一次后，右侧 JSON 会变成最近的角锚点。</p>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style>
.layout-floating-center-demo__layout {
  --tr-layout-surface-radius: 16px;
}
</style>

<style scoped>
.layout-floating-center-demo {
  display: grid;
  gap: 12px;
}

.layout-floating-center-demo__toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.layout-floating-center-demo__button {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 8px;
  background: var(--vp-c-bg, #ffffff);
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
  cursor: pointer;
}

.layout-floating-center-demo__hint {
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-floating-center-demo__card {
  padding: 12px;
  border-radius: 12px;
  background: var(--vp-c-bg-soft, #f6f8fa);
}

.layout-floating-center-demo__card-title {
  font-weight: 600;
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-floating-center-demo__card pre {
  margin: 8px 0 0;
  overflow: auto;
  font-size: 12px;
  line-height: 1.5;
}

.layout-floating-center-demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-floating-center-demo__main {
  display: grid;
  gap: 8px;
  padding: 16px;
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-floating-center-demo__main p {
  margin: 0;
  line-height: 1.6;
}
</style>
