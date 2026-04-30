<template>
  <div class="demo-container">
    <TrChat.Root :runtime="resolution.runtime" :ui="resolution.ui" :mcp-manager="mcpManager">
      <!--
        workspace 模式下，TrChat.Page 内部自带 WorkspaceLayout。
        直接把布局 slots 传给 TrChat.Page 即可：
        - #left：替换默认的历史记录侧边栏
        - #left-rail：自定义折叠后的 rail 图标
        - #right：自定义右侧面板内容
      -->
      <TrChat.Page>
        <!-- 自定义左侧面板 -->
        <template #left>
          <aside class="left-panel">
            <div class="left-panel__section">
              <p class="left-panel__eyebrow">项目</p>
              <h3 class="left-panel__title">自定义左侧面板</h3>
              <p class="left-panel__body">通过 TrChat.Page 的 #left slot 替换默认的历史列表。</p>
            </div>
            <div class="left-panel__section">
              <p class="left-panel__label">固定上下文</p>
              <ul class="left-panel__list">
                <li><strong>发布简报</strong><span>总结当前发布状态</span></li>
                <li><strong>文档计划</strong><span>保持示例和文档导航一致</span></li>
                <li><strong>API 清理</strong><span>关注公开接口的清晰度</span></li>
              </ul>
            </div>
          </aside>
        </template>

        <!-- 自定义 rail 图标（左侧面板折叠后显示） -->
        <template #left-rail>
          <span class="rail-icon" title="项目">📁</span>
          <span class="rail-icon" title="设置">⚙️</span>
        </template>

        <!-- 自定义右侧面板 -->
        <template #right>
          <aside class="right-panel">
            <div class="right-panel__card">
              <p class="right-panel__eyebrow">工作区摘要</p>
              <h3 class="right-panel__title">自定义右侧面板</h3>
              <p class="right-panel__body">右侧面板适合放结构化输出、检查点或操作工具。</p>
            </div>
            <div class="right-panel__metrics">
              <div class="right-panel__metric">
                <span class="right-panel__metric-label">入口</span>
                <strong>Root + Page</strong>
              </div>
              <div class="right-panel__metric">
                <span class="right-panel__metric-label">MCP</span>
                <strong>{{ mcpStatus }}</strong>
              </div>
            </div>
          </aside>
        </template>

        <template #header-extra>
          <FullscreenToggle />
        </template>
      </TrChat.Page>
    </TrChat.Root>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'
import { TrChat, createRuntimeFromConfig, useMcpManager } from '@opentiny/tiny-robot-chat'
import FullscreenToggle from './FullscreenToggle.vue'
import { createDemoConfig } from './config'
import { MOCK_PLUGINS, MOCK_BRIDGE } from './mockMcp'

const mcpManager = useMcpManager({ initialPlugins: MOCK_PLUGINS, bridge: MOCK_BRIDGE })

const resolution = createRuntimeFromConfig(
  createDemoConfig({
    storageKey: 'docs-demo-custom-layout',
    welcomeTitle: '自定义 Workspace 布局',
    welcomeDescription: '通过 WorkspaceLayout 的 #left、#right、#left-rail slots 自定义侧边栏内容。',
    workspace: true,
    initialMessages: [
      {
        role: 'assistant',
        content:
          '这个示例展示了自定义左侧面板、自定义右侧面板和自定义 rail 图标。聊天区由 TrChat.Page 负责，不需要手动组合原语。',
      },
    ],
  }),
)

onBeforeUnmount(() => resolution.dispose())

const mcpStatus = computed(() =>
  mcpManager.activeCount.value > 0 ? `${mcpManager.activeCount.value} 个插件已激活` : '未激活',
)
</script>

<style scoped>
.demo-container {
  height: 600px;
  width: 100%;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 8px;
  overflow: hidden;
}

:deep(.tr-chat),
:deep(.tr-chat-workspace-layout),
:deep(.tr-workspace-shell) {
  height: 100%;
  min-height: 0;
}

/* ── 左侧面板 ── */
.left-panel {
  height: 100%;
  display: grid;
  align-content: start;
  gap: 18px;
  padding: 22px 18px;
  background: linear-gradient(180deg, rgba(250, 252, 255, 0.98) 0%, rgba(244, 248, 255, 1) 100%);
}

.left-panel__section {
  display: grid;
  gap: 10px;
}

.left-panel__eyebrow,
.left-panel__label {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #667085;
}

.left-panel__title {
  margin: 0;
  font-size: 18px;
  line-height: 1.25;
  color: #111827;
}

.left-panel__body {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #667085;
}

.left-panel__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}

.left-panel__list li {
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

.left-panel__list strong {
  color: #101828;
}

/* ── Rail 图标 ── */
.rail-icon {
  font-size: 15px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.15s ease;
}

.rail-icon:hover {
  opacity: 1;
}

/* ── 右侧面板 ── */
.right-panel {
  height: 100%;
  display: grid;
  align-content: start;
  gap: 18px;
  padding: 22px 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 250, 252, 1) 100%);
}

.right-panel__card,
.right-panel__metric {
  display: grid;
  gap: 8px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    0 8px 22px rgba(15, 23, 42, 0.05),
    inset 0 0 0 1px rgba(20, 24, 31, 0.06);
}

.right-panel__eyebrow {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #667085;
}

.right-panel__title {
  margin: 0;
  font-size: 18px;
  line-height: 1.25;
  color: #111827;
}

.right-panel__body {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #667085;
}

.right-panel__metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.right-panel__metric-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #667085;
}

.right-panel__metric strong {
  color: #111827;
  font-size: 14px;
}
</style>
