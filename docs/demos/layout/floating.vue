<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import { IconClose } from '@opentiny/tiny-robot-svgs'
import type { LayoutFloatingConfig, LayoutMode } from '@opentiny/tiny-robot'
import './demo.css'

const mode = ref<LayoutMode>('normal')

const floating = ref<LayoutFloatingConfig>({
  x: 48,
  y: 32,
  width: 520,
  height: 420,
  draggable: true,
  resizable: true,
  minWidth: 380,
  maxWidth: 680,
})

function openFloating() {
  mode.value = 'floating'
}

function closeFloating() {
  mode.value = 'normal'
}
</script>

<template>
  <div class="layout-floating-demo">
    <div class="layout-floating-toolbar">
      <button v-if="mode === 'normal'" type="button" class="layout-floating-trigger" @click="openFloating">
        打开浮层
      </button>
      <button v-else type="button" class="layout-floating-trigger" @click="closeFloating">关闭浮层</button>
    </div>

    <div class="layout-floating-tip">点击按钮查看浮层布局。</div>

    <TrLayout v-if="mode === 'floating'" class="layout-floating-layout" :mode="mode" :floating="floating">
      <template #header>
        <div class="layout-demo-header layout-floating-header">
          <span>Floating Layout</span>
          <button type="button" class="layout-floating-close" aria-label="关闭浮层" @click="closeFloating">
            <IconClose />
          </button>
        </div>
      </template>

      <template #main>
        <div class="layout-demo-copy layout-demo-copy--spacious">
          <h3>浮层内容区</h3>
          <p class="layout-demo-muted">支持拖拽移动，并支持左右边缘改宽。</p>
        </div>
      </template>

      <template #footer>
        <div class="layout-demo-footer">可拖拽 / 可改宽</div>
      </template>
    </TrLayout>
  </div>
</template>

<style scoped>
.layout-floating-demo {
  display: grid;
  gap: 12px;
}

.layout-floating-toolbar {
  display: flex;
  justify-content: flex-start;
}

.layout-floating-trigger {
  min-width: 96px;
  height: 36px;
  padding: 0 14px;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 999px;
  background: var(--vp-c-bg, var(--tr-container-bg-default, #ffffff));
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
  cursor: pointer;
}

.layout-floating-tip {
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-floating-layout {
  --tr-layout-height: 100%;
  --tr-layout-content-max-width: none;
  --tr-layout-main-max-width: none;
  --tr-layout-header-max-width: none;
  --tr-layout-footer-max-width: none;
  --tr-layout-header-padding-inline: 0;
  --tr-layout-main-padding-inline: 0;
  --tr-layout-footer-padding-inline: 0;
  --tr-layout-inner-padding-block: 0;
  --tr-layout-surface-radius: 26px;
  --tr-layout-surface-shadow: 0 24px 60px color-mix(in srgb, var(--vp-c-text-1, #111827) 14%, transparent);
  --tr-layout-main-bg: var(--vp-c-bg, var(--tr-container-bg-default, #ffffff));
  --tr-layout-header-bg: var(--vp-c-bg, var(--tr-container-bg-default, #ffffff));
  --tr-layout-footer-bg: var(--vp-c-bg, var(--tr-container-bg-default, #ffffff));
  height: 100%;
}

.layout-floating-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.layout-floating-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 999px;
  background: var(--vp-c-bg, var(--tr-container-bg-default, #ffffff));
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
  cursor: pointer;
}

.layout-floating-close :deep(svg) {
  font-size: 14px;
}
</style>
