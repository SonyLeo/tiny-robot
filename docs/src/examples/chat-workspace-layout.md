
# Chat Workspace 布局示例

使用 `TrChat.Root + TrChat.WorkspaceLayout + primitives` 完全自定义页面结构，包括自定义左右侧边栏、`TrChat.Header` 的 `#extra` slot，以及通过 `useMcpManager` 接入 MCP 工具。

<demo vue="../../demos/chat/workspace-layout.vue" :vueFiles="['../../demos/chat/workspace-layout.vue', '../../demos/chat/workspace-layout-config.ts', '../../demos/chat/mockMcp.ts', '../../demos/chat/WorkspaceLeftPanel.vue', '../../demos/chat/WorkspaceRightPanel.vue', '../../demos/chat/FullscreenToggle.vue']" />
