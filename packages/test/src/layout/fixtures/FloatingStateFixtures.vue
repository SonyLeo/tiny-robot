<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutDefaultFloatingConfig, LayoutFloatingRect } from '@opentiny/tiny-robot'

const blockedFloating = ref<LayoutFloatingRect>({
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

const uncontrolledDefaultFloating = ref<LayoutDefaultFloatingConfig>({
  placement: 'top-right',
  offset: 24,
  width: 420,
  height: 300,
  draggable: true,
  resizable: true,
  minWidth: 320,
  maxWidth: 480,
})

const uncontrolledFloatingUpdates = ref(0)
const uncontrolledFloatingLastWidth = ref(420)
const uncontrolledFloatingLastX = ref(0)
const showPlacementFixtures = ref(false)

const placementDefaults: Array<{ marker: string; config: LayoutDefaultFloatingConfig }> = [
  {
    marker: 'placement-top-left',
    config: { placement: 'top-left', offset: 16, width: 320, height: 220, draggable: false, resizable: false },
  },
  {
    marker: 'placement-top-right',
    config: { placement: 'top-right', offset: 20, width: 340, height: 230, draggable: false, resizable: false },
  },
  {
    marker: 'placement-bottom-left',
    config: { placement: 'bottom-left', offset: 28, width: 300, height: 210, draggable: false, resizable: false },
  },
  {
    marker: 'placement-bottom-right',
    config: { placement: 'bottom-right', offset: 32, width: 280, height: 200, draggable: false, resizable: false },
  },
  {
    marker: 'placement-center',
    config: { placement: 'center', offset: 96, width: 360, height: 240, draggable: false, resizable: false },
  },
]

function handleBlockedFloating(next: LayoutFloatingRect) {
  blockedFloatingUpdates.value += 1
  blockedFloatingLastWidth.value = next.width
  blockedFloatingLastX.value = next.x
}

function handleUncontrolledFloating(next: LayoutFloatingRect) {
  uncontrolledFloatingUpdates.value += 1
  uncontrolledFloatingLastWidth.value = next.width
  uncontrolledFloatingLastX.value = next.x
}

function updateUncontrolledDefaultFloating() {
  uncontrolledDefaultFloating.value = {
    ...uncontrolledDefaultFloating.value,
    placement: 'bottom-left',
    offset: 40,
    width: 360,
  }
}

function openPlacementFixtures() {
  showPlacementFixtures.value = true
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

    <button
      type="button"
      class="floating-state-fixtures__placement-toggle"
      data-testid="show-floating-placement-fixtures-btn"
      @click="openPlacementFixtures"
    >
      show floating placement fixtures
    </button>

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
      mode="floating"
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

    <template v-if="showPlacementFixtures">
      <TrLayout
        v-for="placementFixture in placementDefaults"
        :id="`${placementFixture.marker}-surface`"
        :key="placementFixture.marker"
        :data-surface-marker="placementFixture.marker"
        class="floating-state-fixtures__layout"
        mode="floating"
        :default-floating="placementFixture.config"
      >
        <template #main>
          <div class="floating-state-fixtures__panel">{{ placementFixture.marker }}</div>
        </template>
      </TrLayout>
    </template>
  </div>
</template>

<style scoped>
.floating-state-fixtures__metrics {
  display: none;
}

.floating-state-fixtures__placement-toggle {
  margin: 0 0 12px;
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
