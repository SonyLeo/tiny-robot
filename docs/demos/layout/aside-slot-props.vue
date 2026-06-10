<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutAsideValue } from '@opentiny/tiny-robot'

const rightOpen = ref(false)

function updateRightAside(nextAside: LayoutAsideValue) {
  rightOpen.value = nextAside.open
}
</script>

<template>
  <div class="layout-slot-props-demo">
    <TrLayout
      :left-aside="{
        defaultOpen: true,
        defaultExpandedWidth: 220,
        collapsedWidth: 56,
        minExpandedWidth: 180,
        maxExpandedWidth: 320,
        resizable: true,
      }"
      :right-aside="{ mode: 'drawer', open: rightOpen }"
      @update:rightAside="updateRightAside"
    >
      <template
        #left-aside="{
          placement,
          mode,
          open,
          expandedWidth,
          collapsedWidth,
          resizable,
          toggle,
          setOpen,
          setExpandedWidth,
        }"
      >
        <div class="layout-slot-props-demo__aside">
          <div class="layout-slot-props-demo__meta">
            <span>{{ placement }}</span>
            <span>{{ mode }}</span>
            <span>{{ open ? 'open' : 'closed' }}</span>
          </div>

          <div class="layout-slot-props-demo__group">
            <button type="button" class="layout-slot-props-demo__button" @click="toggle">
              {{ open ? '收起左侧栏' : '展开左侧栏' }}
            </button>
            <button type="button" class="layout-slot-props-demo__button" @click="setOpen(true)">强制展开</button>
            <button type="button" class="layout-slot-props-demo__button" @click="setOpen(false)">强制收起</button>
          </div>

          <div v-if="mode === 'dock' && resizable" class="layout-slot-props-demo__group">
            <button type="button" class="layout-slot-props-demo__button" @click="setExpandedWidth(200)">
              宽度 200
            </button>
            <button type="button" class="layout-slot-props-demo__button" @click="setExpandedWidth(260)">
              宽度 260
            </button>
            <button type="button" class="layout-slot-props-demo__button" @click="setExpandedWidth(300)">
              宽度 300
            </button>
          </div>

          <dl class="layout-slot-props-demo__list">
            <div>
              <dt>expandedWidth</dt>
              <dd>{{ expandedWidth ?? '-' }}</dd>
            </div>
            <div>
              <dt>collapsedWidth</dt>
              <dd>{{ collapsedWidth ?? '-' }}</dd>
            </div>
            <div>
              <dt>resizable</dt>
              <dd>{{ resizable }}</dd>
            </div>
          </dl>
        </div>
      </template>

      <template #header>
        <div class="layout-slot-props-demo__header">
          <span>直接用 slot props 驱动侧栏</span>
          <button type="button" class="layout-slot-props-demo__button" @click="rightOpen = true">打开右侧抽屉</button>
        </div>
      </template>

      <template #main>
        <div class="layout-slot-props-demo__main">
          <p>这个示例不使用 `Layout.AsideToggle`，侧栏开关和宽度都直接来自 slot props。</p>
          <p>左侧是 `dock`，右侧是 `drawer`，两边都通过根组件状态驱动。</p>
        </div>
      </template>

      <template #right-aside="{ placement, mode, open, setOpen }">
        <div class="layout-slot-props-demo__drawer">
          <div class="layout-slot-props-demo__meta">
            <span>{{ placement }}</span>
            <span>{{ mode }}</span>
            <span>{{ open ? 'open' : 'closed' }}</span>
          </div>
          <p>右侧抽屉也直接消费 slot props。</p>
          <button type="button" class="layout-slot-props-demo__button" @click="setOpen(false)">关闭抽屉</button>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style scoped>
.layout-slot-props-demo {
  --tr-layout-height: 100%;
  --tr-layout-content-max-width: none;
  --tr-layout-inner-padding-inline: 0;
  --tr-layout-inner-padding-block: 0;
  --tr-layout-left-bg: var(--vp-c-bg-alt, #f8fafc);
  height: 420px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 16px;
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-slot-props-demo__header,
.layout-slot-props-demo__main,
.layout-slot-props-demo__drawer {
  background: var(--vp-c-bg, #ffffff);
}

.layout-slot-props-demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
}

.layout-slot-props-demo__aside,
.layout-slot-props-demo__drawer,
.layout-slot-props-demo__main {
  display: grid;
  gap: 12px;
  box-sizing: border-box;
  min-height: 100%;
  padding: 16px;
}

.layout-slot-props-demo__meta {
  display: flex;
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

.layout-slot-props-demo__group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
</style>
