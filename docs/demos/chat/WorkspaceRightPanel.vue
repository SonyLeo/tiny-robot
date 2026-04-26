<template>
  <aside class="workspace-panel workspace-panel--right">
    <div class="workspace-summary-card">
      <p class="workspace-panel__eyebrow">工作区摘要</p>
      <h3 class="workspace-panel__title">自定义右侧面板</h3>
      <p class="workspace-panel__body">右侧面板适合放结构化输出、检查点或操作工具。</p>
    </div>
    <div class="workspace-metric-grid">
      <div class="workspace-metric-card">
        <span class="workspace-metric-card__label">入口</span>
        <strong>Root + primitives</strong>
      </div>
      <div class="workspace-metric-card">
        <span class="workspace-metric-card__label">MCP</span>
        <strong>{{ mcpStatus }}</strong>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{ mcpStatus?: string }>()
</script>

<style scoped>
.workspace-panel {
  height: 100%;
  display: grid;
  align-content: start;
  gap: 18px;
  padding: 22px 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 250, 252, 1) 100%);
}

.workspace-panel__eyebrow {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #667085;
}

.workspace-panel__title {
  margin: 0;
  font-size: 18px;
  line-height: 1.25;
  color: #111827;
}
.workspace-panel__body {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #667085;
}

.workspace-summary-card,
.workspace-metric-card {
  display: grid;
  gap: 8px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    0 8px 22px rgba(15, 23, 42, 0.05),
    inset 0 0 0 1px rgba(20, 24, 31, 0.06);
}

.workspace-metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.workspace-metric-card__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #667085;
}

.workspace-metric-card strong {
  color: #111827;
  font-size: 14px;
}
</style>
