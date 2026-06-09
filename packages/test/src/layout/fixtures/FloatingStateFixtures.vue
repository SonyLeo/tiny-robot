<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutFloating } from '@opentiny/tiny-robot'

const blockedFloating = ref<LayoutFloating>({
  placement: 'top-left',
  offsetX: 64,
  offsetY: 96,
  width: 420,
  height: 300,
  draggable: true,
  resizable: true,
  minWidth: 320,
  maxWidth: 480,
})

const blockedFloatingUpdates = ref(0)
const blockedFloatingLastPlacement = ref('')
const blockedFloatingLastOffsetX = ref(-1)
const blockedFloatingLastOffsetY = ref(-1)
const blockedFloatingLastWidth = ref(420)

const uncontrolledDefaultFloating = ref<LayoutFloating>({
  placement: 'top-right',
  offsetX: 24,
  offsetY: 32,
  width: 420,
  height: 300,
  draggable: true,
  resizable: true,
  minWidth: 320,
  maxWidth: 480,
})

const uncontrolledFloatingUpdates = ref(0)
const uncontrolledFloatingLastPlacement = ref('')
const uncontrolledFloatingLastOffsetX = ref(-1)
const uncontrolledFloatingLastOffsetY = ref(-1)
const uncontrolledFloatingLastWidth = ref(420)
const showPlacementFixtures = ref(false)

const placementDefaults: Array<{ marker: string; config: LayoutFloating }> = [
  {
    marker: 'placement-top-left',
    config: {
      placement: 'top-left',
      offsetX: 16,
      offsetY: 16,
      width: 320,
      height: 220,
      draggable: false,
      resizable: false,
    },
  },
  {
    marker: 'placement-top-right',
    config: {
      placement: 'top-right',
      offsetX: 20,
      offsetY: 36,
      width: 340,
      height: 230,
      draggable: false,
      resizable: false,
    },
  },
  {
    marker: 'placement-bottom-left',
    config: {
      placement: 'bottom-left',
      offsetX: 28,
      offsetY: 44,
      width: 300,
      height: 210,
      draggable: false,
      resizable: false,
    },
  },
  {
    marker: 'placement-bottom-right',
    config: {
      placement: 'bottom-right',
      offsetX: 32,
      offsetY: 32,
      width: 280,
      height: 200,
      draggable: false,
      resizable: false,
    },
  },
  {
    marker: 'placement-center',
    config: {
      placement: 'center',
      offsetX: 96,
      offsetY: 96,
      width: 360,
      height: 240,
      draggable: false,
      resizable: false,
    },
  },
]

function handleBlockedFloating(next: LayoutFloating) {
  blockedFloatingUpdates.value += 1
  blockedFloatingLastPlacement.value = next.placement ?? ''
  blockedFloatingLastOffsetX.value = next.offsetX ?? -1
  blockedFloatingLastOffsetY.value = next.offsetY ?? -1
  if (next.width !== undefined) {
    blockedFloatingLastWidth.value = next.width
  }
}

function handleUncontrolledFloating(next: LayoutFloating) {
  uncontrolledFloatingUpdates.value += 1
  uncontrolledFloatingLastPlacement.value = next.placement ?? ''
  uncontrolledFloatingLastOffsetX.value = next.offsetX ?? -1
  uncontrolledFloatingLastOffsetY.value = next.offsetY ?? -1
  if (next.width !== undefined) {
    uncontrolledFloatingLastWidth.value = next.width
  }
}

function updateUncontrolledDefaultFloating() {
  uncontrolledDefaultFloating.value = {
    ...uncontrolledDefaultFloating.value,
    placement: 'bottom-left',
    offsetX: 40,
    offsetY: 48,
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
      <div data-testid="blocked-floating-last-placement">{{ blockedFloatingLastPlacement }}</div>
      <div data-testid="blocked-floating-last-offset-x">{{ blockedFloatingLastOffsetX }}</div>
      <div data-testid="blocked-floating-last-offset-y">{{ blockedFloatingLastOffsetY }}</div>
      <div data-testid="blocked-floating-last-width">{{ blockedFloatingLastWidth }}</div>
      <div data-testid="uncontrolled-floating-updates">{{ uncontrolledFloatingUpdates }}</div>
      <div data-testid="uncontrolled-floating-last-placement">{{ uncontrolledFloatingLastPlacement }}</div>
      <div data-testid="uncontrolled-floating-last-offset-x">{{ uncontrolledFloatingLastOffsetX }}</div>
      <div data-testid="uncontrolled-floating-last-offset-y">{{ uncontrolledFloatingLastOffsetY }}</div>
      <div data-testid="uncontrolled-floating-last-width">{{ uncontrolledFloatingLastWidth }}</div>
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
