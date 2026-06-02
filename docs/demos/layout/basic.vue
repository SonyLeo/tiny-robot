<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutAsideConfig } from '@opentiny/tiny-robot'
import './demo.css'

const leftAside = ref<LayoutAsideConfig>({
  layoutMode: 'dock',
  expanded: true,
  expandedWidth: 200,
})

const rightAside = ref<LayoutAsideConfig>({
  layoutMode: 'dock',
  expanded: true,
  expandedWidth: 240,
})
</script>

<template>
  <div class="layout-demo-shell layout-demo-shell--basic">
    <TrLayout class="layout-demo-layout layout-demo-layout--aside" :left-aside="leftAside" :right-aside="rightAside">
      <template #left-aside>
        <TrLayout.Aside placement="left">
          <div class="layout-demo-panel">
            <div class="layout-demo-panel__header">
              <strong class="layout-demo-copy">导航</strong>
            </div>
            <div class="layout-demo-nav">
              <button v-for="item in ['会话', '收藏', '历史']" :key="item" type="button">{{ item }}</button>
            </div>
          </div>
        </TrLayout.Aside>
      </template>

      <template #header>
        <div class="layout-demo-header">Layout Header</div>
      </template>

      <template #main>
        <div class="layout-demo-copy layout-demo-copy--spacious">
          <h3>主区内容</h3>
          <p class="layout-demo-muted">用于承载消息区、工作区或详情内容。</p>
        </div>
      </template>

      <template #footer>
        <div class="layout-demo-footer">Layout Footer</div>
      </template>

      <template #right-aside>
        <TrLayout.Aside placement="right">
          <div class="layout-demo-panel">
            <div class="layout-demo-panel__header">
              <strong class="layout-demo-copy">信息栏</strong>
            </div>
            <div class="layout-demo-meta layout-demo-muted">
              <div>状态：运行中</div>
              <div>模型：通用助手</div>
            </div>
          </div>
        </TrLayout.Aside>
      </template>
    </TrLayout>
  </div>
</template>
