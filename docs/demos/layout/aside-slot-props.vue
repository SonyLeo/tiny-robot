<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type {
  LayoutAsideProps,
  LayoutAsideSideOpenEventDetail,
  LayoutAsideSideResizeEventDetail,
} from '@opentiny/tiny-robot'

const leftOpen = ref(true)
const leftExpandedWidth = ref(220)
const rightOpen = ref(false)

const leftAside = computed<LayoutAsideProps>(() => ({
  open: leftOpen.value,
  expandedWidth: leftExpandedWidth.value,
  collapsedWidth: 88,
  minExpandedWidth: 160,
  maxExpandedWidth: 320,
  resizable: true,
}))

const rightAside = computed<LayoutAsideProps>(() => ({
  mode: 'drawer',
  open: rightOpen.value,
}))

function updateLeftAsideOpen(detail: LayoutAsideSideOpenEventDetail) {
  leftOpen.value = detail.open
}

function updateLeftAsideWidth(detail: LayoutAsideSideResizeEventDetail) {
  leftExpandedWidth.value = detail.expandedWidth
}

function updateRightAsideOpen(detail: LayoutAsideSideOpenEventDetail) {
  rightOpen.value = detail.open
}

function setLeftExpandedWidth(nextWidth: number) {
  leftOpen.value = true
  leftExpandedWidth.value = nextWidth
}
</script>

<template>
  <div class="layout-slot-props-demo">
    <div class="layout-slot-props-demo__controls">
      <div class="layout-slot-props-demo__group">
        <span class="layout-slot-props-demo__group-label">左侧栏</span>
        <button type="button" class="layout-slot-props-demo__button" @click="leftOpen = !leftOpen">
          {{ leftOpen ? '收起左侧栏' : '展开左侧栏' }}
        </button>
        <button type="button" class="layout-slot-props-demo__button" @click="leftOpen = true">展开</button>
        <button type="button" class="layout-slot-props-demo__button" @click="leftOpen = false">收起</button>
        <button type="button" class="layout-slot-props-demo__button" @click="setLeftExpandedWidth(160)">
          宽度 160
        </button>
        <button type="button" class="layout-slot-props-demo__button" @click="setLeftExpandedWidth(240)">
          宽度 240
        </button>
        <button type="button" class="layout-slot-props-demo__button" @click="setLeftExpandedWidth(320)">
          宽度 320
        </button>
      </div>

      <div class="layout-slot-props-demo__group">
        <span class="layout-slot-props-demo__group-label">右侧栏</span>
        <button type="button" class="layout-slot-props-demo__button" @click="rightOpen = true">打开抽屉</button>
        <button type="button" class="layout-slot-props-demo__button" @click="rightOpen = false">关闭抽屉</button>
      </div>
    </div>

    <TrLayout
      class="layout-slot-props-demo__layout"
      :left-aside="leftAside"
      :right-aside="rightAside"
      @left-aside-open-change="updateLeftAsideOpen"
      @left-aside-resize="updateLeftAsideWidth"
      @right-aside-open-change="updateRightAsideOpen"
    >
      <template #left-aside>
        <div v-if="leftOpen" class="layout-slot-props-demo__aside">
          <p class="layout-slot-props-demo__summary">left / dock / {{ leftOpen ? 'open' : 'closed' }}</p>

          <dl class="layout-slot-props-demo__list">
            <div class="layout-slot-props-demo__row">
              <dt>expandedWidth</dt>
              <dd>{{ leftExpandedWidth }}</dd>
            </div>
            <div class="layout-slot-props-demo__row">
              <dt>collapsedWidth</dt>
              <dd>{{ leftAside.collapsedWidth }}</dd>
            </div>
            <div class="layout-slot-props-demo__row">
              <dt>resizable</dt>
              <dd>{{ leftAside.resizable }}</dd>
            </div>
          </dl>

          <TrLayout.AsideToggle side="left" class="layout-slot-props-demo__button">
            <template #default="{ isOpen }">
              {{ isOpen ? '收起侧栏' : '展开侧栏' }}
            </template>
          </TrLayout.AsideToggle>
        </div>

        <div v-else class="layout-slot-props-demo__rail">
          <TrLayout.AsideToggle side="left" class="layout-slot-props-demo__button">
            <template #default="{ isOpen }">
              {{ isOpen ? '收起' : '展开' }}
            </template>
          </TrLayout.AsideToggle>
        </div>
      </template>

      <template #header>
        <div class="layout-slot-props-demo__header">外层更新 leftAside / rightAside，并通过事件回写状态。</div>
      </template>

      <template #main>
        <div class="layout-slot-props-demo__main">
          <p>外层控制 open 和 expandedWidth，状态变化后再传回组件。</p>
          <p>侧栏内部可以使用 Layout.AsideToggle，它的默认插槽会提供当前开关状态。</p>
        </div>
      </template>

      <template #right-aside>
        <div class="layout-slot-props-demo__drawer">
          <p class="layout-slot-props-demo__summary">right / drawer / {{ rightOpen ? 'open' : 'closed' }}</p>
          <p>右侧抽屉由 rightAside.open 控制。</p>
          <TrLayout.AsideToggle side="right" class="layout-slot-props-demo__button"> 关闭抽屉 </TrLayout.AsideToggle>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style>
.layout-slot-props-demo__layout {
  --tr-layout-height: 360px;
  --tr-layout-left-aside-bg: var(--vp-c-bg-alt, #f8fafc);
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
  gap: 8px;
}

.layout-slot-props-demo__group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.layout-slot-props-demo__group-label {
  font-size: 12px;
  font-weight: 600;
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

.layout-slot-props-demo__header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  background: var(--vp-c-bg, #ffffff);
}

.layout-slot-props-demo__aside,
.layout-slot-props-demo__drawer,
.layout-slot-props-demo__main {
  display: grid;
  align-content: start;
  gap: 10px;
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  padding: 16px;
  background: var(--vp-c-bg, #ffffff);
}

.layout-slot-props-demo__rail {
  display: grid;
  place-items: center;
  box-sizing: border-box;
  height: 100%;
  padding: 12px;
  background: var(--vp-c-bg, #ffffff);
}

.layout-slot-props-demo__summary,
.layout-slot-props-demo__main p,
.layout-slot-props-demo__drawer p,
.layout-slot-props-demo__list dt,
.layout-slot-props-demo__list dd {
  margin: 0;
}

.layout-slot-props-demo__summary,
.layout-slot-props-demo__main,
.layout-slot-props-demo__drawer {
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-slot-props-demo__list {
  display: grid;
  gap: 6px;
  margin: 0;
}

.layout-slot-props-demo__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
</style>
