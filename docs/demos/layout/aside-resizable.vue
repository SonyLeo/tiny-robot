<script setup lang="ts">
import { TrLayout } from '@opentiny/tiny-robot'
</script>

<template>
  <div class="layout-aside-resizable-demo">
    <TrLayout
      :left-aside="{
        defaultOpen: true,
        defaultExpandedWidth: 220,
        minExpandedWidth: 160,
        maxExpandedWidth: 320,
        resizable: true,
      }"
    >
      <template #left-aside>
        <div class="layout-aside-resizable-demo__aside">拖动右侧分隔线</div>
      </template>

      <template #main>
        <div class="layout-aside-resizable-demo__main">当前示例只演示 dock 侧栏宽度调整。</div>
      </template>
    </TrLayout>
  </div>
</template>

<style scoped>
.layout-aside-resizable-demo {
  --tr-layout-height: 100%;
  --tr-layout-content-max-width: none;
  --tr-layout-inner-padding-inline: 0;
  --tr-layout-inner-padding-block: 0;
  --tr-layout-main-min-width: 0;
  --tr-layout-left-bg: var(--vp-c-bg-alt, #f8fafc);
  height: 400px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 16px;
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-aside-resizable-demo__aside,
.layout-aside-resizable-demo__main {
  display: grid;
  place-items: center;
  height: 100%;
}

.layout-aside-resizable-demo__main {
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}
</style>
