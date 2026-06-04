<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutFloatingConfig } from '@opentiny/tiny-robot'

const blockedFloating = ref<LayoutFloatingConfig>({
  x: 64,
  y: 96,
  width: 420,
  height: 300,
  draggable: true,
  resizable: true,
  minWidth: 320,
  maxWidth: 480,
})

const blockedFloatingUpdates = ref(0)
const blockedFloatingLastWidth = ref(420)
const blockedFloatingLastX = ref(64)

const uncontrolledDefaultFloating = ref<LayoutFloatingConfig>({
  x: 560,
  y: 96,
  width: 420,
  height: 300,
  draggable: true,
  resizable: true,
  minWidth: 320,
  maxWidth: 480,
})

const uncontrolledFloatingUpdates = ref(0)
const uncontrolledFloatingLastWidth = ref(420)
const uncontrolledFloatingLastX = ref(560)

function handleBlockedFloating(next: LayoutFloatingConfig) {
  blockedFloatingUpdates.value += 1
  blockedFloatingLastWidth.value = typeof next.width === 'number' ? next.width : blockedFloatingLastWidth.value
  blockedFloatingLastX.value = typeof next.x === 'number' ? next.x : blockedFloatingLastX.value
}

function handleUncontrolledFloating(next: LayoutFloatingConfig) {
  uncontrolledFloatingUpdates.value += 1
  uncontrolledFloatingLastWidth.value =
    typeof next.width === 'number' ? next.width : uncontrolledFloatingLastWidth.value
  uncontrolledFloatingLastX.value = typeof next.x === 'number' ? next.x : uncontrolledFloatingLastX.value
}

function updateUncontrolledDefaultFloating() {
  uncontrolledDefaultFloating.value = {
    ...uncontrolledDefaultFloating.value,
    x: 700,
    y: 132,
    width: 360,
  }
}
</script>

<template>
  <div class="floating-state-fixtures">
    <div class="floating-state-fixtures__metrics">
      <div data-testid="blocked-floating-updates">{{ blockedFloatingUpdates }}</div>
      <div data-testid="blocked-floating-last-width">{{ blockedFloatingLastWidth }}</div>
      <div data-testid="blocked-floating-last-x">{{ blockedFloatingLastX }}</div>
      <div data-testid="uncontrolled-floating-updates">{{ uncontrolledFloatingUpdates }}</div>
      <div data-testid="uncontrolled-floating-last-width">{{ uncontrolledFloatingLastWidth }}</div>
      <div data-testid="uncontrolled-floating-last-x">{{ uncontrolledFloatingLastX }}</div>
    </div>

    <TrLayout
      id="blocked-floating-surface"
      data-surface-marker="blocked-floating"
      class="floating-state-fixtures__layout"
      :mode="'floating'"
      :floating="blockedFloating"
      @update:floating="handleBlockedFloating"
    >
      <template #main>
        <div class="floating-state-fixtures__panel">blocked controlled floating</div>
      </template>
    </TrLayout>

    <TrLayout
      id="uncontrolled-floating-surface"
      data-surface-marker="uncontrolled-floating"
      class="floating-state-fixtures__layout"
      default-mode="floating"
      :default-floating="uncontrolledDefaultFloating"
      @update:floating="handleUncontrolledFloating"
    >
      <template #main>
        <div class="floating-state-fixtures__panel">
          <span>uncontrolled floating</span>
          <button
            type="button"
            data-testid="uncontrolled-default-floating-update-btn"
            @click="updateUncontrolledDefaultFloating"
          >
            update default floating
          </button>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style scoped>
.floating-state-fixtures__metrics {
  display: none;
}

.floating-state-fixtures__layout {
  --tr-layout-left-bg: #f8fafc;
  --tr-layout-right-bg: #f8fafc;
  --tr-layout-main-bg: #ffffff;
}

.floating-state-fixtures__panel {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 100%;
  padding: 16px;
  box-sizing: border-box;
}
</style>
