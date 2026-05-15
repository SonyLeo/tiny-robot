<script setup lang="ts">
import { IconClose, IconFileFolder } from '@opentiny/tiny-robot-svgs'
import { Chat } from '@/index'
</script>

<template>
  <Chat.RightPanel v-slot="{ mode }">
    <div class="demo-right-panel">
      <div class="demo-right-panel__header">
        <div class="demo-right-panel__title">
          <h3>扩展工作区</h3>
        </div>

        <Chat.RightPanelToggle class="demo-icon-button" aria-label="关闭扩展工作区">
          <IconClose class="demo-icon-glyph" />
        </Chat.RightPanelToggle>
      </div>

      <div class="demo-empty-state">
        <div class="demo-empty-state__icon">
          <IconFileFolder />
        </div>
        <strong>暂无扩展内容</strong>
        <p>后续可在此处查看文件、链接或扩展结果。当前模式：{{ mode }}</p>
      </div>
    </div>
  </Chat.RightPanel>
</template>

<style scoped>
.demo-right-panel {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 24px;
  height: 100%;
  padding: 20px;
}

.demo-right-panel__header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
}

.demo-right-panel__title h3 {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 18px;
}

.demo-empty-state {
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 12px;
  padding-bottom: 48px;
  text-align: center;
}

.demo-empty-state__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  color: #f59e0b;
}

.demo-empty-state strong {
  font-size: 28px;
}

.demo-empty-state p {
  max-width: 260px;
  color: #64748b;
  line-height: 1.7;
}

@media (max-width: 959px) {
  .demo-empty-state strong {
    font-size: 24px;
  }
}
</style>
