<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutDefaultFloatingConfig } from '@opentiny/tiny-robot'

const open = ref(false)

const defaultFloating: LayoutDefaultFloatingConfig = {
  placement: 'top-right',
  offset: 24,
  width: 520,
  height: 360,
  draggable: true,
  resizable: true,
  minWidth: 360,
  maxWidth: 680,
}
</script>

<template>
  <div class="layout-floating-demo">
    <button type="button" class="layout-floating-demo__trigger" @click="open = !open">
      {{ open ? '关闭浮层' : '打开浮层' }}
    </button>

    <p class="layout-floating-demo__tip">打开后可直接拖动顶部横条，或拖动 8 个方向手柄调整尺寸。</p>

    <TrLayout v-if="open" class="layout-floating-demo__layout" mode="floating" :default-floating="defaultFloating">
      <template #header>
        <div class="layout-floating-demo__header">
          <strong>浮层布局</strong>
          <button type="button" class="layout-floating-demo__close" @click="open = false">关闭</button>
        </div>
      </template>

      <template #main>
        <div class="layout-floating-demo__main">
          <h3>初始值写法</h3>
          <p>
            这个示例只传 `defaultFloating`，首次挂载时按 `placement + offset` 初始化，后续位置和尺寸由组件自己维护。
          </p>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style>
.layout-floating-demo__layout {
  --tr-layout-surface-radius: 12px;
}
</style>

<style scoped>
.layout-floating-demo {
  display: grid;
  gap: 8px;
}

.layout-floating-demo__trigger,
.layout-floating-demo__close {
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 8px;
  background: var(--vp-c-bg, #ffffff);
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
  cursor: pointer;
}

.layout-floating-demo__tip {
  margin: 0 0 8px;
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-floating-demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-floating-demo__main {
  padding: 16px;
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-floating-demo__main p {
  margin: 8px 0 0;
  line-height: 1.6;
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}
</style>
