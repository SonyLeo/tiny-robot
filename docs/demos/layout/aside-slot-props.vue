<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutAsideSlotProps, LayoutAsideState } from '@opentiny/tiny-robot'

const rightOpen = ref(false)
const leftAsideApi = ref<LayoutAsideSlotProps | null>(null)
const rightAsideApi = ref<LayoutAsideSlotProps | null>(null)

function updateRightAside(nextAside: LayoutAsideState) {
  rightOpen.value = nextAside.open
}

function bindLeftAside(api: LayoutAsideSlotProps) {
  leftAsideApi.value = api
  return null
}

function bindRightAside(api: LayoutAsideSlotProps) {
  rightAsideApi.value = api
  return null
}
</script>

<template>
  <div class="layout-slot-props-demo">
    <div class="layout-slot-props-demo__controls">
      <div class="layout-slot-props-demo__group">
        <span class="layout-slot-props-demo__group-label">左侧 slot props</span>
        <button
          type="button"
          class="layout-slot-props-demo__button"
          :disabled="!leftAsideApi"
          @click="leftAsideApi?.toggle()"
        >
          {{ leftAsideApi?.open ? '收起左侧栏' : '展开左侧栏' }}
        </button>
        <button
          type="button"
          class="layout-slot-props-demo__button"
          :disabled="!leftAsideApi"
          @click="leftAsideApi?.setOpen(true)"
        >
          展开
        </button>
        <button
          type="button"
          class="layout-slot-props-demo__button"
          :disabled="!leftAsideApi"
          @click="leftAsideApi?.setOpen(false)"
        >
          收起
        </button>
        <button
          type="button"
          class="layout-slot-props-demo__button"
          :disabled="!leftAsideApi?.resizable || leftAsideApi?.mode !== 'dock'"
          @click="leftAsideApi?.setExpandedWidth(150)"
        >
          宽度 150
        </button>
        <button
          type="button"
          class="layout-slot-props-demo__button"
          :disabled="!leftAsideApi?.resizable || leftAsideApi?.mode !== 'dock'"
          @click="leftAsideApi?.setExpandedWidth(260)"
        >
          宽度 260
        </button>
        <button
          type="button"
          class="layout-slot-props-demo__button"
          :disabled="!leftAsideApi?.resizable || leftAsideApi?.mode !== 'dock'"
          @click="leftAsideApi?.setExpandedWidth(300)"
        >
          宽度 300
        </button>
      </div>

      <div class="layout-slot-props-demo__group">
        <span class="layout-slot-props-demo__group-label">右侧 slot props</span>
        <button
          type="button"
          class="layout-slot-props-demo__button"
          :disabled="!rightAsideApi"
          @click="rightAsideApi?.setOpen(true)"
        >
          打开抽屉
        </button>
        <button
          type="button"
          class="layout-slot-props-demo__button"
          :disabled="!rightAsideApi"
          @click="rightAsideApi?.setOpen(false)"
        >
          关闭抽屉
        </button>
      </div>
    </div>

    <TrLayout
      class="layout-slot-props-demo__layout"
      :left-aside="{
        defaultOpen: true,
        defaultExpandedWidth: 220,
        collapsedWidth: 100,
        minExpandedWidth: 80,
        maxExpandedWidth: 320,
        resizable: true,
      }"
      :right-aside="{ mode: 'drawer', open: rightOpen }"
      @update:rightAside="updateRightAside"
    >
      <template #left-aside="slotProps">
        <span class="layout-slot-props-demo__sync" aria-hidden="true">{{ bindLeftAside(slotProps) }}</span>

        <div class="layout-slot-props-demo__aside">
          <div class="layout-slot-props-demo__meta">
            <span>{{ slotProps.placement }}</span>
            <span>{{ slotProps.mode }}</span>
            <span>{{ slotProps.open ? 'open' : 'closed' }}</span>
          </div>

          <dl class="layout-slot-props-demo__list">
            <div>
              <dt>expandedWidth</dt>
              <dd>{{ slotProps.expandedWidth ?? '-' }}</dd>
            </div>
            <div>
              <dt>collapsedWidth</dt>
              <dd>{{ slotProps.collapsedWidth ?? '-' }}</dd>
            </div>
            <div>
              <dt>resizable</dt>
              <dd>{{ slotProps.resizable }}</dd>
            </div>
          </dl>
        </div>
      </template>

      <template #header>
        <div class="layout-slot-props-demo__header">外层控制区直接调用 slot props 暴露出的 action。</div>
      </template>

      <template #main>
        <div class="layout-slot-props-demo__main">
          <p>左侧和右侧的按钮都已经提到布局外层。</p>
          <p>插槽内部只保留状态展示，操作仍然直接来自 slot props。</p>
        </div>
      </template>

      <template #right-aside="slotProps">
        <span class="layout-slot-props-demo__sync" aria-hidden="true">{{ bindRightAside(slotProps) }}</span>

        <div class="layout-slot-props-demo__drawer">
          <div class="layout-slot-props-demo__meta">
            <span>{{ slotProps.placement }}</span>
            <span>{{ slotProps.mode }}</span>
            <span>{{ slotProps.open ? 'open' : 'closed' }}</span>
          </div>

          <p>右侧抽屉也只展示状态。</p>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style>
.layout-slot-props-demo__layout {
  --tr-layout-height: 360px;
  --tr-layout-content-max-width: none;
  --tr-layout-inner-padding-inline: 0;
  --tr-layout-inner-padding-block: 0;
  --tr-layout-left-bg: var(--vp-c-bg-alt, #f8fafc);
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 16px;
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}
</style>

<style scoped>
.layout-slot-props-demo {
  display: grid;
  gap: 12px;
}

.layout-slot-props-demo__controls {
  display: grid;
  gap: 10px;
}

.layout-slot-props-demo__group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.layout-slot-props-demo__group-label {
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
  font-size: 12px;
}

.layout-slot-props-demo__button {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 8px;
  background: var(--vp-c-bg, #ffffff);
  color: inherit;
  cursor: pointer;
}

.layout-slot-props-demo__button:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.layout-slot-props-demo__header,
.layout-slot-props-demo__main,
.layout-slot-props-demo__drawer {
  background: var(--vp-c-bg, #ffffff);
}

.layout-slot-props-demo__header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
}

.layout-slot-props-demo__aside,
.layout-slot-props-demo__drawer,
.layout-slot-props-demo__main {
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  padding: 16px;
}

.layout-slot-props-demo__aside {
  container-type: inline-size;
}

.layout-slot-props-demo__meta {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 8px;
}

.layout-slot-props-demo__meta span {
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--vp-c-bg, #ffffff);
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  font-size: 12px;
}

.layout-slot-props-demo__list {
  display: grid;
  gap: 8px;
  margin: 0;
}

.layout-slot-props-demo__list div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

@container (max-width: 140px) {
  .layout-slot-props-demo__meta {
    flex-direction: column;
    align-items: stretch;
  }

  .layout-slot-props-demo__meta span {
    text-align: center;
  }

  .layout-slot-props-demo__list div {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
}

.layout-slot-props-demo__list dt,
.layout-slot-props-demo__list dd,
.layout-slot-props-demo__main p,
.layout-slot-props-demo__drawer p {
  margin: 0;
}

.layout-slot-props-demo__main,
.layout-slot-props-demo__drawer {
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-slot-props-demo__sync {
  display: none;
}
</style>
