<template>
  <div class="layout-assistant-demo__panel">
    <div class="layout-assistant-demo__panel-head">
      <div>
        <span class="layout-assistant-demo__panel-eyebrow">Workspace</span>
        <strong>会话信息</strong>
      </div>
      <TrLayout.AsideToggle placement="right" class="layout-assistant-demo__icon-button" aria-label="切换右侧信息">
        <IconClose />
      </TrLayout.AsideToggle>
    </div>

    <div class="layout-assistant-demo__panel-body">
      <div class="layout-assistant-demo__panel-group">
        <span class="layout-assistant-demo__panel-label">会话概览</span>
        <div class="layout-assistant-demo__panel-meta">
          <div class="layout-assistant-demo__panel-meta-row">
            <span>当前会话</span>
            <strong>{{ context.currentConversationTitle }}</strong>
          </div>
          <div class="layout-assistant-demo__panel-meta-row">
            <span>会话数</span>
            <strong>{{ historyCount }}</strong>
          </div>
          <div class="layout-assistant-demo__panel-meta-row">
            <span>消息数</span>
            <strong>{{ messageCount }}</strong>
          </div>
        </div>
      </div>

      <div class="layout-assistant-demo__panel-group">
        <span class="layout-assistant-demo__panel-label">案例说明</span>
        <p>保留真实对话链路，重点验证左右分栏、主区滚动和 footer 输入区。</p>
      </div>

      <div class="layout-assistant-demo__panel-group">
        <span class="layout-assistant-demo__panel-label">观察点</span>
        <ul class="layout-assistant-demo__panel-list">
          <li>Header 只保留结构入口，不重复堆叠标题和统计。</li>
          <li>右栏降为辅助说明，不抢主区视觉。</li>
          <li>三栏同时打开时，主区仍保持稳定可读宽度。</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrLayout } from '@opentiny/tiny-robot'
import { IconClose } from '@opentiny/tiny-robot-svgs'
import { computed } from 'vue'
import type { LayoutAssistantContext } from './context'

const props = defineProps<{ context: LayoutAssistantContext }>()

const historyCount = computed(() => props.context.historyData.length)
const messageCount = computed(() => props.context.messages.length)
</script>
