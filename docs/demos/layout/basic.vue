<script setup lang="ts">
import { TrLayout } from '@opentiny/tiny-robot'
</script>

<template>
  <div class="layout-basic-demo">
    <TrLayout>
      <template #left-aside>
        <TrLayout.Aside placement="left" default-open :default-width="160">
          <div class="layout-basic-demo__aside">导航</div>
        </TrLayout.Aside>
      </template>

      <template #header>
        <div class="layout-basic-demo__header">Header</div>
      </template>

      <template #main>
        <div class="layout-basic-demo__main">Main</div>
      </template>

      <template #footer>
        <div class="layout-basic-demo__footer">Footer</div>
      </template>

      <template #right-aside>
        <TrLayout.Aside placement="right" default-open :default-width="160">
          <div class="layout-basic-demo__aside">信息栏</div>
        </TrLayout.Aside>
      </template>
    </TrLayout>
  </div>
</template>

<style scoped>
.layout-basic-demo {
  --tr-layout-height: 100%;
  --tr-layout-content-max-width: none;
  --tr-layout-inner-padding-inline: 0;
  --tr-layout-inner-padding-block: 0;
  --tr-layout-main-min-width: 0;
  --tr-layout-header-bg: color-mix(in srgb, var(--tr-color-primary, #1476ff) 8%, #ffffff);
  --tr-layout-main-bg: var(--vp-c-bg, var(--tr-container-bg-default, #ffffff));
  --tr-layout-footer-bg: color-mix(in srgb, var(--tr-color-primary, #1476ff) 8%, #ffffff);
  --tr-layout-left-bg: color-mix(in srgb, var(--vp-c-bg-soft, #f5f7fa) 92%, #eef3ff);
  --tr-layout-right-bg: color-mix(in srgb, var(--vp-c-bg-soft, #f5f7fa) 92%, #eef3ff);
  height: 400px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 18px;
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
  font-weight: 600;
}

.layout-basic-demo__header,
.layout-basic-demo__footer {
  padding: 16px 20px;
  text-align: center;
}

.layout-basic-demo__main,
.layout-basic-demo__aside {
  display: grid;
  place-items: center;
  height: 100%;
}
</style>
