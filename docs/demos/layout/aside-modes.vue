<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutAsideConfig } from '@opentiny/tiny-robot'
import './demo.css'

const leftAside = ref<LayoutAsideConfig>({
  layoutMode: 'dock',
  expanded: true,
  expandedWidth: 220,
  collapsedWidth: 56,
  resizable: true,
})

const rightAside = ref<LayoutAsideConfig>({
  layoutMode: 'drawer',
  expanded: false,
  expandedWidth: 280,
})

function toggleLeftAside() {
  leftAside.value = {
    ...leftAside.value,
    expanded: !(leftAside.value.expanded ?? true),
  }
}

function openRightAside() {
  rightAside.value = {
    ...rightAside.value,
    expanded: true,
  }
}

function updateLeftAside(next?: LayoutAsideConfig) {
  leftAside.value = next ?? {}
}

function updateRightAside(next?: LayoutAsideConfig) {
  rightAside.value = next ?? {}
}
</script>

<template>
  <div class="layout-aside-demo">
    <div class="layout-aside-demo__toolbar">
      <button type="button" class="layout-aside-demo__action" @click="toggleLeftAside">切换左侧 rail</button>
      <button type="button" class="layout-aside-demo__action" @click="openRightAside">打开右侧 drawer</button>
    </div>

    <div class="layout-aside-demo__tip">左侧收起后保留 rail；右侧 drawer 可点击遮罩或按 Esc 关闭。</div>

    <div class="layout-demo-shell layout-demo-shell--basic">
      <TrLayout
        class="layout-demo-layout layout-demo-layout--aside"
        :left-aside="leftAside"
        :right-aside="rightAside"
        @update:left-aside="updateLeftAside"
        @update:right-aside="updateRightAside"
      >
        <template #left-aside>
          <TrLayout.Aside placement="left" collapse-effect="slide">
            <div class="layout-demo-panel">
              <div class="layout-demo-panel__header">
                <strong class="layout-demo-copy">Rail 导航</strong>
                <TrLayout.AsideToggle placement="left" />
              </div>
              <div class="layout-demo-nav">
                <button v-for="item in ['会话', '收藏', '历史']" :key="item" type="button">{{ item }}</button>
              </div>
            </div>
          </TrLayout.Aside>
        </template>

        <template #header>
          <div class="layout-demo-header">Rail / Drawer</div>
        </template>

        <template #main>
          <div class="layout-demo-copy layout-demo-copy--spacious">
            <h3>侧栏形态</h3>
            <p class="layout-demo-muted">
              左侧使用 `dock + collapsedWidth` 演示 rail；右侧使用 `drawer` 演示遮罩关闭和默认切换文案。
            </p>
          </div>
        </template>

        <template #right-aside>
          <TrLayout.Aside placement="right">
            <div class="layout-demo-panel">
              <div class="layout-demo-panel__header">
                <strong class="layout-demo-copy">右侧 Drawer</strong>
                <TrLayout.AsideToggle placement="right" />
              </div>
              <div class="layout-demo-meta layout-demo-muted">
                <div>打开方式：按钮或 Toggle</div>
                <div>关闭方式：Toggle、遮罩、Esc</div>
              </div>
            </div>
          </TrLayout.Aside>
        </template>
      </TrLayout>
    </div>
  </div>
</template>

<style scoped>
.layout-aside-demo {
  display: grid;
  gap: 12px;
}

.layout-aside-demo__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.layout-aside-demo__action {
  min-width: 120px;
  height: 36px;
  padding: 0 14px;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 999px;
  background: var(--vp-c-bg, var(--tr-container-bg-default, #ffffff));
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
  cursor: pointer;
}

.layout-aside-demo__tip {
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}
</style>
