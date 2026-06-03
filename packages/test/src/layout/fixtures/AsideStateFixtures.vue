<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'

const baseLayoutStyle = {
  '--tr-layout-height': '100%',
  '--tr-layout-content-max-width': 'none',
  '--tr-layout-main-max-width': 'none',
  '--tr-layout-header-max-width': 'none',
  '--tr-layout-footer-max-width': 'none',
  '--tr-layout-header-padding-inline': '0',
  '--tr-layout-main-padding-inline': '0',
  '--tr-layout-footer-padding-inline': '0',
  '--tr-layout-inner-padding-block': '0',
  '--tr-layout-main-min-width': '120px',
  '--tr-layout-left-bg': '#f8fafc',
  '--tr-layout-right-bg': '#f8fafc',
  '--tr-layout-main-bg': '#ffffff',
  height: '100%',
} as const

const blockedLayoutStyle = {
  ...baseLayoutStyle,
  '--tr-layout-left-dock-width': '410px',
} as const

const tokenLayoutStyle = {
  ...baseLayoutStyle,
  '--tr-layout-left-dock-width': '376px',
} as const

const blockedOpenEvents = ref(0)
const blockedLastOpen = ref('none')
const blockedWidthEvents = ref(0)
const blockedLastWidth = ref(260)

const uncontrolledOpenEvents = ref(0)
const uncontrolledWidthEvents = ref(0)
const uncontrolledLastWidth = ref(290)

const drawerLeftOpen = ref(false)
const drawerRightOpen = ref(false)

function handleBlockedOpen(next: boolean) {
  blockedOpenEvents.value += 1
  blockedLastOpen.value = String(next)
}

function handleBlockedWidth(next: number) {
  blockedWidthEvents.value += 1
  blockedLastWidth.value = next
}

function handleUncontrolledOpen() {
  uncontrolledOpenEvents.value += 1
}

function handleUncontrolledWidth(next: number) {
  uncontrolledWidthEvents.value += 1
  uncontrolledLastWidth.value = next
}

function updateDrawerLeftOpen(next: boolean) {
  drawerLeftOpen.value = next
}

function updateDrawerRightOpen(next: boolean) {
  drawerRightOpen.value = next
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
        <TrLayout class="aside-state-fixtures__layout" :style="blockedLayoutStyle">
          <template #left-aside>
            <TrLayout.Aside
              placement="left"
              mode="dock"
              :open="true"
              :width="260"
              :rail-width="48"
              :min-width="220"
              :max-width="420"
              :resizable="true"
              @update:open="handleBlockedOpen"
              @update:width="handleBlockedWidth"
            >
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
        <TrLayout class="aside-state-fixtures__layout" :style="baseLayoutStyle">
          <template #left-aside>
            <TrLayout.Aside
              placement="left"
              mode="dock"
              :default-open="true"
              :default-width="290"
              :rail-width="52"
              :min-width="240"
              :max-width="340"
              :resizable="true"
              @update:open="handleUncontrolledOpen"
              @update:width="handleUncontrolledWidth"
            >
              <template #default="{ isOpen }">
                <div class="aside-state-fixtures__panel">
                  <span data-testid="uncontrolled-open-state">{{ isOpen ? 'open' : 'closed' }}</span>
                  <TrLayout.AsideToggle
                    placement="left"
                    aria-label="Uncontrolled custom toggle"
                    data-testid="uncontrolled-toggle"
                  />
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

    <section class="aside-state-fixtures__section" data-testid="token-aside-fixture">
      <h3>Token Fallback Aside</h3>
      <div class="aside-state-fixtures__host">
        <TrLayout class="aside-state-fixtures__layout" :style="tokenLayoutStyle">
          <template #left-aside>
            <TrLayout.Aside placement="left" mode="dock" :open="true">
              <div class="aside-state-fixtures__panel">
                <span data-testid="token-open-state">open</span>
              </div>
            </TrLayout.Aside>
          </template>

          <template #main>
            <div class="aside-state-fixtures__main">token fallback aside</div>
          </template>
        </TrLayout>
      </div>
    </section>

    <section class="aside-state-fixtures__section" data-testid="drawer-aside-fixture">
      <h3>Drawer Width Aside</h3>
      <div class="aside-state-fixtures__host">
        <TrLayout class="aside-state-fixtures__layout" :style="baseLayoutStyle">
          <template #left-aside>
            <TrLayout.Aside
              placement="left"
              mode="drawer"
              :open="drawerLeftOpen"
              class="aside-state-fixtures__drawer"
              style="--tr-layout-drawer-width: 344px"
              @update:open="updateDrawerLeftOpen"
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
              mode="drawer"
              :open="drawerRightOpen"
              class="aside-state-fixtures__drawer"
              style="--tr-layout-drawer-width: 388px"
              @update:open="updateDrawerRightOpen"
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
