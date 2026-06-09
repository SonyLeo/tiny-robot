<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutFloating } from '@opentiny/tiny-robot'

type LayoutMainScrollHost = HTMLElement | { $el: Element | null } | null | undefined

const scrollbarHostRef = ref<LayoutMainScrollHost>(null)

const floating = {
  placement: 'top-right',
  offsetX: 40,
  offsetY: 56,
  width: 360,
  height: 260,
  draggable: false,
  resizable: false,
} satisfies LayoutFloating

const scrollItems = Array.from({ length: 80 }, (_, index) => `css var item ${index + 1}`)
</script>

<template>
  <div class="layout-css-vars">
    <div class="layout-css-vars__host layout-css-vars__host--wide">
      <TrLayout
        data-testid="css-vars-normal-surface"
        class="layout-css-vars__layout layout-css-vars__layout--normal"
        :left-aside="{ mode: 'dock', open: true, expandedWidth: 220 }"
        :right-aside="{ mode: 'dock', open: true, expandedWidth: 240 }"
      >
        <template #left-aside>
          <TrLayout.Aside placement="left">
            <div class="layout-css-vars__panel">left dock</div>
          </TrLayout.Aside>
        </template>

        <template #header>
          <div class="layout-css-vars__slot">header</div>
        </template>

        <template #main>
          <div class="layout-css-vars__slot">main</div>
        </template>

        <template #footer>
          <div class="layout-css-vars__slot">footer</div>
        </template>

        <template #right-aside>
          <TrLayout.Aside placement="right">
            <div class="layout-css-vars__panel">right dock</div>
          </TrLayout.Aside>
        </template>
      </TrLayout>
    </div>

    <div class="layout-css-vars__host layout-css-vars__host--narrow">
      <TrLayout
        data-testid="css-vars-main-min-surface"
        class="layout-css-vars__layout layout-css-vars__layout--main-min"
        :left-aside="{ mode: 'dock', open: true, expandedWidth: 220 }"
        :right-aside="{ mode: 'dock', open: true, expandedWidth: 240 }"
      >
        <template #left-aside>
          <TrLayout.Aside placement="left">
            <div class="layout-css-vars__panel">left dock</div>
          </TrLayout.Aside>
        </template>

        <template #main>
          <div class="layout-css-vars__slot">main min width</div>
        </template>

        <template #right-aside>
          <TrLayout.Aside placement="right">
            <div class="layout-css-vars__panel">right dock</div>
          </TrLayout.Aside>
        </template>
      </TrLayout>
    </div>

    <div class="layout-css-vars__host layout-css-vars__host--drawer">
      <TrLayout
        data-testid="css-vars-right-drawer-surface"
        class="layout-css-vars__layout layout-css-vars__layout--drawer"
        :left-aside="{ mode: 'dock', open: true, expandedWidth: 312 }"
        :right-aside="{ mode: 'drawer', open: true }"
      >
        <template #left-aside>
          <TrLayout.Aside placement="left" class="layout-css-vars__aside layout-css-vars__aside--dock-boundary">
            <div class="layout-css-vars__panel">left dock boundary</div>
          </TrLayout.Aside>
        </template>

        <template #main>
          <div class="layout-css-vars__slot">right drawer</div>
        </template>

        <template #right-aside>
          <TrLayout.Aside placement="right" class="layout-css-vars__aside layout-css-vars__aside--right-drawer">
            <div class="layout-css-vars__panel">right drawer panel</div>
          </TrLayout.Aside>
        </template>
      </TrLayout>
    </div>

    <div class="layout-css-vars__host layout-css-vars__host--drawer">
      <TrLayout
        data-testid="css-vars-left-drawer-surface"
        class="layout-css-vars__layout layout-css-vars__layout--drawer"
        :left-aside="{ mode: 'drawer', open: true }"
        :right-aside="{ mode: 'dock', open: true, expandedWidth: 260 }"
      >
        <template #left-aside>
          <TrLayout.Aside placement="left" class="layout-css-vars__aside layout-css-vars__aside--left-drawer">
            <div class="layout-css-vars__panel">left drawer panel</div>
          </TrLayout.Aside>
        </template>

        <template #main>
          <div class="layout-css-vars__slot">left drawer</div>
        </template>

        <template #right-aside>
          <TrLayout.Aside placement="right">
            <div class="layout-css-vars__panel">right dock</div>
          </TrLayout.Aside>
        </template>
      </TrLayout>
    </div>

    <div class="layout-css-vars__host layout-css-vars__host--wide">
      <TrLayout
        data-testid="css-vars-legacy-surface"
        class="layout-css-vars__layout layout-css-vars__layout--legacy"
        :left-aside="{ mode: 'dock', open: true, expandedWidth: 280 }"
      >
        <template #left-aside>
          <TrLayout.Aside placement="left">
            <div class="layout-css-vars__panel">legacy left dock</div>
          </TrLayout.Aside>
        </template>

        <template #main>
          <div class="layout-css-vars__slot">legacy guard</div>
        </template>
      </TrLayout>
    </div>

    <TrLayout
      data-testid="css-vars-floating-surface"
      class="layout-css-vars__layout layout-css-vars__layout--floating"
      mode="floating"
      :floating="floating"
    >
      <template #main>
        <div class="layout-css-vars__slot">floating surface</div>
      </template>
    </TrLayout>

    <div class="layout-css-vars__host layout-css-vars__host--scrollbar">
      <TrLayout
        data-testid="css-vars-scrollbar-surface"
        class="layout-css-vars__layout layout-css-vars__layout--scrollbar"
      >
        <template #main>
          <TrLayout.Main :scroll-host="scrollbarHostRef">
            <div ref="scrollbarHostRef" class="layout-css-vars__scroll-host">
              <div v-for="item in scrollItems" :key="item" class="layout-css-vars__scroll-item">
                {{ item }}
              </div>
            </div>
          </TrLayout.Main>
        </template>
      </TrLayout>
    </div>
  </div>
</template>

<style>
.layout-css-vars {
  display: grid;
  gap: 20px;
  margin-top: 12px;
}

.layout-css-vars__host {
  position: relative;
  overflow: hidden;
  border: 1px solid #dcdfe6;
}

.layout-css-vars__host--wide {
  width: 980px;
}

.layout-css-vars__host--narrow {
  width: 700px;
}

.layout-css-vars__host--drawer {
  width: 920px;
}

.layout-css-vars__host--scrollbar {
  width: 720px;
}

.layout-css-vars__layout {
  width: 100%;
}

.layout-css-vars__layout--normal {
  --tr-layout-height: 420px;
  --tr-layout-bg: rgb(244, 246, 251);
  --tr-layout-left-bg: rgb(255, 244, 229);
  --tr-layout-right-bg: rgb(232, 245, 255);
  --tr-layout-header-bg: rgb(224, 242, 254);
  --tr-layout-main-bg: rgb(245, 250, 255);
  --tr-layout-footer-bg: rgb(232, 245, 233);
  --tr-layout-divider-color: rgb(123, 134, 156);
  --tr-layout-content-max-width: 420px;
  --tr-layout-inner-padding-inline: 24px;
  --tr-layout-inner-padding-block: 18px;
}

.layout-css-vars__layout--main-min {
  --tr-layout-height: 280px;
  --tr-layout-main-min-width: 300px;
}

.layout-css-vars__layout--drawer {
  --tr-layout-height: 360px;
  --tr-layout-overlay-bg: rgba(10, 20, 30, 0.45);
  --tr-layout-panel-shadow: 0 0 0 3px rgb(17, 34, 51);
}

.layout-css-vars__layout--legacy {
  --tr-layout-height: 280px;
  --tr-layout-content-max-width: none;
  --tr-layout-left-dock-width: 420px;
  --tr-layout-main-max-width: 320px;
}

.layout-css-vars__layout--floating {
  --tr-layout-bg: rgb(252, 248, 240);
  --tr-layout-surface-radius: 18px;
  --tr-layout-surface-shadow: 0 0 0 4px rgb(11, 22, 33);
  --tr-layout-surface-z-index: 2048;
}

.layout-css-vars__layout--scrollbar {
  --tr-layout-height: 360px;
  --tr-layout-main-scrollbar-width: 14px;
  --tr-layout-main-scrollbar-thumb-bg: rgb(120, 130, 150);
  --tr-layout-main-scrollbar-thumb-bg-hover: rgb(90, 100, 120);
  --tr-layout-main-scrollbar-thumb-bg-active: rgb(60, 70, 90);
}

.layout-css-vars__aside--dock-boundary {
  --tr-layout-drawer-width: 480px;
}

.layout-css-vars__aside--right-drawer {
  --tr-layout-drawer-width: 368px;
}

.layout-css-vars__aside--left-drawer {
  --tr-layout-drawer-width: 336px;
}

.layout-css-vars__slot,
.layout-css-vars__panel {
  display: grid;
  place-items: center;
  min-height: 100%;
  padding: 16px;
  box-sizing: border-box;
}

.layout-css-vars__scroll-host {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 16px;
  box-sizing: border-box;
}

.layout-css-vars__scroll-item {
  padding: 10px 12px;
  border-bottom: 1px solid #ebeef5;
}
</style>
