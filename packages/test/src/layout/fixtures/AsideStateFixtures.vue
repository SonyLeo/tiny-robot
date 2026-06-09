<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutAsideValue } from '@opentiny/tiny-robot'

const baseLayoutStyle = {
  '--tr-layout-height': '100%',
  '--tr-layout-content-max-width': 'none',
  '--tr-layout-inner-padding-inline': '0',
  '--tr-layout-inner-padding-block': '0',
  '--tr-layout-main-min-width': '120px',
  '--tr-layout-left-bg': '#f8fafc',
  '--tr-layout-right-bg': '#f8fafc',
  '--tr-layout-main-bg': '#ffffff',
  height: '100%',
} as const

const blockedOpenEvents = ref(0)
const blockedLastOpen = ref('true')
const blockedWidthEvents = ref(0)
const blockedLastWidth = ref(260)

const uncontrolledOpenEvents = ref(0)
const uncontrolledWidthEvents = ref(0)
const uncontrolledLastWidth = ref(290)
const uncontrolledLastOpen = ref(true)
const uncontrolledDefaultOpen = ref(true)
const uncontrolledDefaultWidth = ref(290)

const drawerLeftOpen = ref(false)
const drawerRightOpen = ref(false)

const blockedLeftAside = {
  mode: 'dock',
  open: true,
  expandedWidth: 260,
  collapsedWidth: 48,
  minExpandedWidth: 220,
  maxExpandedWidth: 420,
  resizable: true,
} as const

const uncontrolledLeftAside = computed(() => ({
  mode: 'dock' as const,
  defaultOpen: uncontrolledDefaultOpen.value,
  defaultExpandedWidth: uncontrolledDefaultWidth.value,
  collapsedWidth: 52,
  minExpandedWidth: 240,
  maxExpandedWidth: 340,
  resizable: true,
}))

const drawerLeftAside = computed(() => ({
  mode: 'drawer' as const,
  open: drawerLeftOpen.value,
}))

const drawerRightAside = computed(() => ({
  mode: 'drawer' as const,
  open: drawerRightOpen.value,
}))

function handleBlockedAside(next: LayoutAsideValue) {
  if (blockedLastOpen.value !== String(next.open)) {
    blockedOpenEvents.value += 1
    blockedLastOpen.value = String(next.open)
  }

  if (next.expandedWidth !== undefined && next.expandedWidth !== blockedLastWidth.value) {
    blockedWidthEvents.value += 1
    blockedLastWidth.value = next.expandedWidth
  }
}

function handleUncontrolledAside(next: LayoutAsideValue) {
  if (next.open !== uncontrolledLastOpen.value) {
    uncontrolledOpenEvents.value += 1
    uncontrolledLastOpen.value = next.open
  }

  if (next.expandedWidth !== undefined && next.expandedWidth !== uncontrolledLastWidth.value) {
    uncontrolledWidthEvents.value += 1
    uncontrolledLastWidth.value = next.expandedWidth
  }
}

function updateUncontrolledDefaults() {
  uncontrolledDefaultOpen.value = false
  uncontrolledDefaultWidth.value = 332
}

function updateDrawerLeftAside(next: LayoutAsideValue) {
  drawerLeftOpen.value = next.open
}

function updateDrawerRightAside(next: LayoutAsideValue) {
  drawerRightOpen.value = next.open
}
</script>

<template>
  <div class="aside-state-fixtures">
    <div class="aside-state-fixtures__metrics">
      <div data-testid="blocked-open-events">{{ blockedOpenEvents }}</div>
      <div data-testid="blocked-last-open">{{ blockedLastOpen }}</div>
      <div data-testid="blocked-width-events">{{ blockedWidthEvents }}</div>
      <div data-testid="blocked-last-width">{{ blockedLastWidth }}</div>
      <div data-testid="uncontrolled-open-events">{{ uncontrolledOpenEvents }}</div>
      <div data-testid="uncontrolled-width-events">{{ uncontrolledWidthEvents }}</div>
      <div data-testid="uncontrolled-last-width">{{ uncontrolledLastWidth }}</div>
    </div>

    <section class="aside-state-fixtures__section" data-testid="blocked-aside-fixture">
      <h3>Blocked Controlled Aside</h3>
      <div class="aside-state-fixtures__host">
        <TrLayout
          class="aside-state-fixtures__layout"
          :style="baseLayoutStyle"
          :left-aside="blockedLeftAside"
          @update:leftAside="handleBlockedAside"
        >
          <template #left-aside>
            <TrLayout.Aside placement="left">
              <template #default="{ isOpen }">
                <div class="aside-state-fixtures__panel">
                  <span data-testid="blocked-open-state">{{ isOpen ? 'open' : 'closed' }}</span>
                  <TrLayout.AsideToggle
                    placement="left"
                    aria-label="Blocked controlled toggle"
                    data-testid="blocked-toggle"
                  />
                </div>
              </template>
            </TrLayout.Aside>
          </template>

          <template #main>
            <div class="aside-state-fixtures__main">blocked controlled aside</div>
          </template>
        </TrLayout>
      </div>
    </section>

    <section class="aside-state-fixtures__section" data-testid="uncontrolled-aside-fixture">
      <h3>Uncontrolled Aside</h3>
      <div class="aside-state-fixtures__host">
        <TrLayout
          class="aside-state-fixtures__layout"
          :style="baseLayoutStyle"
          :left-aside="uncontrolledLeftAside"
          @update:leftAside="handleUncontrolledAside"
        >
          <template #left-aside>
            <TrLayout.Aside placement="left">
              <template #default="{ isOpen }">
                <div class="aside-state-fixtures__panel">
                  <span data-testid="uncontrolled-open-state">{{ isOpen ? 'open' : 'closed' }}</span>
                  <TrLayout.AsideToggle
                    placement="left"
                    aria-label="Uncontrolled custom toggle"
                    data-testid="uncontrolled-toggle"
                  />
                  <button
                    type="button"
                    data-testid="uncontrolled-default-update-btn"
                    @click="updateUncontrolledDefaults"
                  >
                    update defaults
                  </button>
                </div>
              </template>
            </TrLayout.Aside>
          </template>

          <template #main>
            <div class="aside-state-fixtures__main">uncontrolled aside</div>
          </template>
        </TrLayout>
      </div>
    </section>

    <section class="aside-state-fixtures__section" data-testid="drawer-aside-fixture">
      <h3>Drawer Width Aside</h3>
      <div class="aside-state-fixtures__host">
        <TrLayout
          class="aside-state-fixtures__layout"
          :style="baseLayoutStyle"
          :left-aside="drawerLeftAside"
          :right-aside="drawerRightAside"
          @update:leftAside="updateDrawerLeftAside"
          @update:rightAside="updateDrawerRightAside"
        >
          <template #left-aside>
            <TrLayout.Aside
              placement="left"
              class="aside-state-fixtures__drawer"
              style="--tr-layout-drawer-width: 344px"
            >
              <div class="aside-state-fixtures__panel">
                <span data-testid="drawer-left-state">{{ drawerLeftOpen ? 'open' : 'closed' }}</span>
              </div>
            </TrLayout.Aside>
          </template>

          <template #main>
            <div class="aside-state-fixtures__drawer-controls">
              <TrLayout.AsideToggle
                placement="left"
                aria-label="Custom drawer left label"
                data-testid="drawer-left-toggle"
              />
              <TrLayout.AsideToggle placement="right" data-testid="drawer-right-toggle" />
            </div>
          </template>

          <template #right-aside>
            <TrLayout.Aside
              placement="right"
              class="aside-state-fixtures__drawer"
              style="--tr-layout-drawer-width: 388px"
            >
              <div class="aside-state-fixtures__panel">
                <span data-testid="drawer-right-state">{{ drawerRightOpen ? 'open' : 'closed' }}</span>
              </div>
            </TrLayout.Aside>
          </template>
        </TrLayout>
      </div>
    </section>
  </div>
</template>

<style scoped>
.aside-state-fixtures {
  display: grid;
  gap: 16px;
}

.aside-state-fixtures__metrics {
  display: none;
}

.aside-state-fixtures__section {
  display: grid;
  gap: 8px;
}

.aside-state-fixtures__host {
  position: relative;
  height: 320px;
  border: 1px solid #dcdfe6;
  overflow: hidden;
}

.aside-state-fixtures__panel,
.aside-state-fixtures__main,
.aside-state-fixtures__drawer-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 100%;
  padding: 16px;
  box-sizing: border-box;
}

.aside-state-fixtures__drawer-controls {
  justify-content: center;
  gap: 12px;
}
</style>
