<template>
  <aside class="workspace-panel workspace-panel--left">
    <div class="workspace-panel__section">
      <p class="workspace-panel__eyebrow">项目</p>
      <h3 class="workspace-panel__title">自定义左侧面板</h3>
      <p class="workspace-panel__body">通过 WorkspaceLayout 的 #left slot 替换默认的历史列表。</p>
    </div>
    <div class="workspace-panel__section">
      <p class="workspace-panel__label">固定上下文</p>
      <ul class="workspace-panel__list">
        <li><strong>发布简报</strong><span>总结当前发布状态</span></li>
        <li><strong>文档计划</strong><span>保持示例和文档导航一致</span></li>
        <li><strong>API 清理</strong><span>关注公开接口的清晰度</span></li>
      </ul>
    </div>
  </aside>
</template>

<style scoped>
.workspace-panel {
  height: 100%;
  display: grid;
  align-content: start;
  gap: 18px;
  padding: 22px 18px;
  background: linear-gradient(180deg, rgba(250, 252, 255, 0.98) 0%, rgba(244, 248, 255, 1) 100%);
}

.workspace-panel__section {
  display: grid;
  gap: 10px;
}

.workspace-panel__eyebrow,
.workspace-panel__label {
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

.workspace-panel__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}

.workspace-panel__list li {
  display: grid;
  gap: 4px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: inset 0 0 0 1px rgba(20, 24, 31, 0.06);
  font-size: 13px;
  line-height: 1.5;
  color: #475467;
}

.workspace-panel__list strong {
  color: #101828;
}
</style>
