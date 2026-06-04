<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'

const rightOpen = ref(false)
</script>

<template>
  <div class="layout-aside-demo">
    <TrLayout>
      <template #left-aside>
        <TrLayout.Aside placement="left" default-open :default-width="156" :rail-width="56">
          <template #default="{ isOpen }">
            <div v-if="isOpen" class="layout-aside-demo__aside">
              <TrLayout.AsideToggle placement="left" class="layout-aside-demo__chip"> 收起侧栏 </TrLayout.AsideToggle>
              <div class="layout-aside-demo__chip">railWidth: 56px</div>
            </div>
            <div v-else class="layout-aside-demo__rail">
              <TrLayout.AsideToggle placement="left" class="layout-aside-demo__rail-chip">栏</TrLayout.AsideToggle>
              <div class="layout-aside-demo__rail-chip">56</div>
            </div>
          </template>
        </TrLayout.Aside>
      </template>

      <template #header>
        <div class="layout-aside-demo__header">
          <span>侧栏模式</span>
          <button type="button" class="layout-aside-demo__chip" @click="rightOpen = true">打开抽屉</button>
        </div>
      </template>

      <template #main>
        <div class="layout-aside-demo__main">左侧是 `dock + railWidth`，右侧是 `drawer`。</div>
      </template>

      <template #right-aside>
        <TrLayout.Aside
          placement="right"
          mode="drawer"
          v-model:open="rightOpen"
          style="--tr-layout-drawer-width: 240px"
        >
          <div class="layout-aside-demo__drawer">
            <div>Drawer</div>
            <div>点击遮罩、按 `Esc` 或按钮关闭。</div>
            <TrLayout.AsideToggle placement="right" class="layout-aside-demo__chip">关闭抽屉</TrLayout.AsideToggle>
          </div>
        </TrLayout.Aside>
      </template>
    </TrLayout>
  </div>
</template>

<style scoped>
.layout-aside-demo {
  --tr-layout-height: 100%;
  --tr-layout-content-max-width: none;
  --tr-layout-inner-padding-inline: 0;
  --tr-layout-inner-padding-block: 0;
  --tr-layout-left-bg: color-mix(in srgb, var(--vp-c-bg-soft, #f5f7fa) 88%, #ffffff);
  height: 400px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 18px;
  background: var(--vp-c-bg-soft, var(--tr-container-bg-secondary, #f5f7fa));
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-aside-demo__header,
.layout-aside-demo__main,
.layout-aside-demo__drawer {
  background: var(--vp-c-bg, var(--tr-container-bg-default, #ffffff));
}

.layout-aside-demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
}

.layout-aside-demo__main,
.layout-aside-demo__aside,
.layout-aside-demo__drawer {
  padding: 16px;
  box-sizing: border-box;
}

.layout-aside-demo__aside,
.layout-aside-demo__drawer,
.layout-aside-demo__rail {
  display: grid;
  gap: 8px;
}

.layout-aside-demo__rail {
  width: 56px;
  padding: 12px 8px;
  box-sizing: border-box;
  justify-items: center;
}

.layout-aside-demo__drawer {
  min-height: 100%;
}

.layout-aside-demo__main,
.layout-aside-demo__drawer {
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-aside-demo__chip {
  display: grid;
  place-items: center;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 10px;
  background: var(--vp-c-bg, var(--tr-container-bg-default, #ffffff));
  color: inherit;
}

.layout-aside-demo__rail-chip {
  display: grid;
  place-items: center;
  width: 40px;
  min-height: 40px;
  padding: 0;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 8px;
  background: var(--vp-c-bg, var(--tr-container-bg-default, #ffffff));
  color: inherit;
}
</style>
