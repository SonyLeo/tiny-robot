<script setup lang="ts">
import { TrLayout } from '@opentiny/tiny-robot'
</script>

<template>
  <div class="layout-aside-resizable-demo">
    <TrLayout>
      <template #left-aside>
        <TrLayout.Aside
          placement="left"
          default-open
          :default-width="220"
          :min-width="160"
          :max-width="320"
          :resizable="true"
        >
          <div class="layout-aside-resizable-demo__aside">拖动右侧分隔线</div>
        </TrLayout.Aside>
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
  --tr-layout-left-bg: color-mix(in srgb, var(--vp-c-bg-soft, #f5f7fa) 90%, #ffffff);
  height: 400px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 18px;
  background: var(--vp-c-bg-soft, var(--tr-container-bg-secondary, #f5f7fa));
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
