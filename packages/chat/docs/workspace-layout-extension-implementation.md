# Chat Workspace 布局扩展实现方案

> Last updated: `2026-03-28`
> Status: `Draft for confirmation`
> Primary doc: 本文档是 `packages/chat` 默认布局从“中心会话 + history drawer”升级到“workspace shell”的实现级方案。
> Related:
> - [布局扩展进度](./workspace-layout-extension-progress.md)
> - [Chat 实现说明](./chat-implementation.md)
> - [旧草案归档说明](./a.md)

## 1. 文档目标

本文档用于冻结本轮布局扩展的实现方向，作为后续开发、联调、测试和文档更新的共同依据。

本次方案需要同时满足两件事：

- 默认产品体验先落成“左侧功能区 + 中间会话区”的两栏布局。
- 内部架构从一开始按“三栏 workspace shell”设计，右侧工作区默认隐藏，需要时再展开。

这意味着：

- 用户默认看到的是类似截图中的两栏界面。
- 左侧栏支持折叠成 rail。
- 右侧工作区不是后期临时拼接，而是一等公民区域，只是默认关闭。

## 2. 背景与当前问题

当前 `packages/chat` 主线默认结构仍然是：

- 顶部 `Header`
- 中间 `Welcome / MessageList`
- 底部 `Footer + Sender`
- 独立 `History drawer`

当前实现的关键限制：

- 默认渲染器仍在页面末尾直接挂载 `ChatHistory`，路径见 `src/components/chat/ChatDefaultRenderer.vue`
- `ChatHistory` 仍然以 `drawer | surface` 语义工作，路径见 `src/components/history/ChatHistory.vue`
- `chatUiContext` 只有 `history.visible / history.display`，尚未上升到页面级多面板状态，路径见 `src/chatUiContext.ts`
- `layout.variant = 'workspace'` 目前只是一种消息区视觉样式，不是 shell 级布局能力，路径见 `src/styles/layout.css`

继续在这套结构上补“左栏折叠”和“右侧预览区”，会面临三个问题：

- `history` 语义会越来越像“左栏别名”，后续难以承载更多左侧能力。
- 右侧工作区没有正式状态模型，后面接文件预览、链接预览、artifact 会越来越别扭。
- 黑盒 `TrChat` 和白盒 `TrChat.Scaffold` 容易走出两套不同布局链路。

## 3. 目标体验

### 3.1 桌面端默认体验

桌面端默认界面为“两栏”：

- 左侧：功能区 / 会话区
- 中间：会话区
- 右侧：工作区默认隐藏

具体表现：

- 左侧默认展开
- 左侧可折叠成 rail
- 右侧默认关闭，宽度为 `0`
- 用户点击“扩展 / 预览 / 右侧面板”入口后再打开右侧

### 3.2 桌面端扩展体验

右侧工作区打开后，界面升级为“三栏”：

- 左侧：功能区
- 中间：会话区
- 右侧：展示区 / 预览区 / artifact 区

### 3.3 移动端降级体验

移动端不保留桌面三栏：

- 左侧降级为 `drawer`
- 右侧降级为 `modal` 或 `sheet`
- 中间会话区保持单栏主流程

### 3.4 与截图场景的对应关系

截图 1 对应状态：

- 左侧展开
- 中间会话区工作
- 右侧隐藏

截图 2 对应状态：

- 左侧折叠成 rail
- 中间会话区工作
- 右侧隐藏

因此，截图场景可以完全被本方案覆盖，而且不需要把右侧工作区强行暴露出来。

## 4. 设计原则

### 4.1 默认两栏，能力三栏

用户默认体验优先追求稳定和简洁：

- 默认只打开左侧
- 右侧按需展开

但架构层必须预留三栏能力：

- 左侧正式区域
- 中间正式区域
- 右侧正式区域

### 4.2 `layout` 与 `shell` 分离

`layout` 继续只负责消息区样式：

- `bubble`
- `docs`
- `workspace`

`shell` 负责页面级结构：

- `stacked`
- `workspace`

### 4.3 `history` 不是左侧栏的别名

`history` 仍然是一项功能能力，而不是布局容器本身。

左侧栏的默认内容可以是 history，但左侧栏的正式语义应是：

- 功能区
- 上下文区
- 工作区左面板

### 4.4 右侧工作区是正式区域

右侧面板从 V1 就要具备正式区域语义：

- 有显隐状态
- 有宽度
- 有默认空态
- 有后续内容插槽

V1 不要求内容丰富，但不应该继续把右侧当成“以后再说”的占位。

### 4.5 桌面与移动端行为分离

桌面端追求效率：

- inline pane
- 可折叠
- 宽度稳定

移动端追求流程清晰：

- 左 drawer
- 右 modal/sheet
- 避免强行保留桌面三栏

## 5. 范围与非目标

### 5.1 本次范围

- 为 `packages/chat` 新增正式 `workspace shell` 布局能力
- 默认黑盒 `TrChat` 升级为 workspace shell
- 左侧栏默认承载 history 内容
- 左侧栏支持折叠为 rail
- 右侧工作区默认隐藏
- 右侧工作区提供正式插槽和默认空态
- 黑盒与白盒共用同一套 shell contract
- 更新 demo、文档、测试

### 5.2 本次非目标

- 不在 V1 引入复杂的左侧多 tab panel host
- 不在 V1 实现 artifact 栈、工具栈、portal 栈
- 不在 V1 引入应用级 sidebar portal 基础设施
- 不处理 provider/runtime/tool/MCP 的底层能力变更
- 不做与本次 shell 升级无关的大规模视觉翻修

## 6. 目标状态模型

### 6.1 顶层 shell 状态

新增页面级 shell 状态，至少覆盖：

- 左侧是否可见
- 左侧是否折叠
- 左侧宽度
- 右侧是否可见
- 右侧是否折叠
- 右侧宽度
- 当前是否处于移动端降级模式

### 6.2 兼容保留的 history 状态

为了兼容现有 API，保留 `history` 语义层，但内部映射到新的 workspace 状态。

兼容映射建议：

- `history.visible`
  在桌面端映射为左侧工作区是否处于展开可见状态

- `history.toggle()`
  在桌面端映射为左侧工作区展开/收起

- `history.display`
  仅保留兼容用途
  桌面端 workspace 下不再作为主要判定字段

### 6.3 默认状态

建议默认值：

- left visible = `true`
- left collapsed = `false`
- left width = `272`
- right visible = `false`
- right collapsed = `true`
- right width = `360`

## 7. 配置与对外 contract

### 7.1 新增 shell 配置

建议在 `ChatConfig` 中新增：

```ts
export type ChatShellVariant = 'stacked' | 'workspace'

export type ChatWorkspaceRegionWidth = 'sm' | 'md' | 'lg' | number

export interface ChatWorkspaceRegionConfig {
  enabled?: boolean
  collapsible?: boolean
  defaultOpen?: boolean
  collapseMode?: 'rail' | 'hidden'
  width?: ChatWorkspaceRegionWidth
  railLabel?: string
}

export interface ChatWorkspaceViewStateConfig {
  fullWidth?: boolean
}

export interface ChatWorkspaceShellConfig {
  variant?: ChatShellVariant
  leftRegion?: ChatWorkspaceRegionConfig
  rightRegion?: ChatWorkspaceRegionConfig
  viewState?: ChatWorkspaceViewStateConfig
}
```

并在以下位置透传：

- `ChatConfig.shell`
- `TrChatPresetOverrides.shell`
- `ChatPresetSlices.shell`

### 7.2 默认值

V1 建议默认值：

```ts
shell: {
  variant: 'workspace',
  leftRegion: {
    enabled: true,
    width: 272,
    collapsible: true,
    defaultOpen: true,
    collapseMode: 'rail',
    railLabel: 'History',
  },
  rightRegion: {
    enabled: true,
    width: 360,
    collapsible: true,
    defaultOpen: false,
    collapseMode: 'hidden',
    railLabel: 'Preview',
  },
}
```

### 7.3 兼容字段

以下字段保留，但语义做兼容映射：

- `showHistory`
  兼容旧代码，内部映射为左侧栏入口是否启用

- `historyProps`
  继续用于默认 history 内容本身

V1 不立即删除旧字段，但文档主推 `shell`。

## 8. 插槽设计

### 8.1 黑盒默认插槽

建议新增以下 slot：

- `workspace-left`
- `workspace-left-brand`
- `workspace-left-toolbar`
- `workspace-left-content`
- `workspace-left-footer`
- `workspace-left-rail`
- `workspace-right`
- `workspace-right-empty`

### 8.2 含义

建议语义如下：

- `workspace-left`
  完整替换左侧栏整体

- `workspace-left-brand`
  左侧顶部品牌区

- `workspace-left-toolbar`
  左侧头部操作区，例如“新建会话”

- `workspace-left-content`
  左侧主内容区，默认承载 history 内容

- `workspace-left-footer`
  左侧底部操作区，例如登录/用户/扩展入口

- `workspace-left-rail`
  左侧折叠态 rail，自定义图标和入口

- `workspace-right`
  完整替换右侧工作区

- `workspace-right-empty`
  右侧打开但没有内容时的空态

## 9. 组件与文件级实现方案

### 9.1 新增 workspace 基础层

新增目录：

`packages/chat/src/components/workspace`

V1 计划落这些文件：

- `WorkspaceShell.vue`
- `useWorkspaceRegion.ts`
- `runtime.ts`
- `index.ts`

来源与策略：

- 以备份项目中的 workspace 实现为基础迁回主线
- 先保留左右区域、宽度、折叠、响应式能力
- 暂不把 `WorkspacePanelHost` 作为默认能力接入

### 9.2 新增 chat 默认 workspace 叶子组件

建议新增目录：

`packages/chat/src/components/chat/workspace`

建议文件：

- `ChatWorkspaceSidebar.vue`
- `ChatWorkspaceSidebarRail.vue`
- `ChatWorkspaceRightPanel.vue`
- `ChatWorkspaceRightEmpty.vue`

职责：

- `ChatWorkspaceSidebar`
  左侧完整展开态容器

- `ChatWorkspaceSidebarRail`
  左侧折叠 rail

- `ChatWorkspaceRightPanel`
  右侧正式工作区容器

- `ChatWorkspaceRightEmpty`
  右侧默认空态

### 9.3 复用 history 内容

左侧主内容默认直接复用：

- `src/components/history/ChatHistoryContent.vue`

但它的使用语义需要从“drawer 内容”升级为“sidebar 内容”。

本次不重写 history 子组件，而是：

- 保持 `ChatHistoryContent`
- 让它能稳定工作在 sidebar 容器中
- 把旧 `ChatHistory.vue` 逐步收缩为兼容层或移动端专用层

## 10. 现有文件改造清单

### 10.1 类型与导出

需要改造：

- `packages/chat/src/types/ui.ts`
- `packages/chat/src/types/index.ts`
- `packages/chat/src/index.ts`

新增：

- `packages/chat/src/types/workspace.ts`

### 10.2 配置链与 preset

需要改造：

- `packages/chat/src/adapters/types.ts`
- `packages/chat/src/adapters/configLoader.ts`
- `packages/chat/src/adapters/configProjection.ts`
- `packages/chat/src/presets/resolve.ts`

目标：

- 支持 `config.shell`
- 支持 `presetOverrides.shell`
- 生成 `presetSlices.shell`

### 10.3 UI context

需要改造：

- `packages/chat/src/chatUiContext.ts`
- `packages/chat/src/context.ts`
- `packages/chat/src/components/chat/ChatRoot.vue`

目标：

- 从 history-only context 升级成 workspace shell context
- 保留 history compatibility layer

### 10.4 默认渲染链

需要改造：

- `packages/chat/src/components/chat/ChatDefaultRenderer.vue`
- `packages/chat/src/components/chat/ChatHeader.vue`
- `packages/chat/src/components/chat/ChatScaffold.vue`

目标：

- 默认黑盒渲染切换到 `WorkspaceShell`
- header 的 left toggle/right toggle 语义收敛

### 10.5 历史组件

需要改造：

- `packages/chat/src/components/history/ChatHistory.vue`
- `packages/chat/src/components/history/ChatHistorySurface.vue`

目标：

- 继续保留旧 surface 能力
- 让旧 history 在 workspace shell 下不再强绑定 drawer

## 11. 默认页面结构

V1 默认页面结构建议如下：

```text
WorkspaceShell
  ├─ left region
  │   ├─ brand
  │   ├─ toolbar
  │   ├─ history content
  │   └─ footer
  ├─ center region
  │   └─ TrChat.Layout
  │       ├─ Header
  │       ├─ Body
  │       └─ Footer
  └─ right region
      └─ right empty / preview slot
```

默认行为：

- 左侧展开
- 右侧隐藏
- 中间会话区占满剩余空间

## 12. 左侧栏具体实现建议

### 12.1 展开态结构

建议结构：

- 顶部品牌区
  logo + 产品名 + 左侧折叠按钮

- 工具区
  新建会话 / 新建任务 按钮

- 内容区
  默认会话列表，直接复用 history 内容

- 底部区
  登录 / 用户入口 / 后续扩展能力

### 12.2 折叠态结构

折叠后切换为 rail：

- 顶部保留 logo
- 中部保留新建图标、历史图标
- 底部保留用户或登录入口
- 不显示文字列表

### 12.3 宽度建议

建议默认值：

- 展开宽度：`272px`
- 折叠宽度：`56px ~ 64px`

V1 可先使用固定折叠宽度。

V2 可考虑拖拽改宽。

## 13. 右侧工作区具体实现建议

### 13.1 V1 目标

V1 的右侧工作区只需要三件事：

- 正式容器
- 显隐状态
- 默认空态

### 13.2 默认空态

建议空态文案方向：

- “暂无预览内容”
- “后续可在此查看文件、链接或扩展结果”

### 13.3 后续扩展方向

右侧区域后续可挂载：

- 文件预览
- 链接预览
- artifact 结果
- tool UI
- 线程/上下文详情

## 14. 响应式策略

### 14.1 Desktop

断点建议：

- `>= 1024px`
  左 inline
  中 inline
  右 inline hidden/open

### 14.2 Tablet

- `768px ~ 1023px`
  左侧仍可 inline/rail
  右侧优先 overlay 或 hidden

### 14.3 Mobile

- `< 768px`
  左 drawer
  右 modal/sheet
  中间单栏主流程

## 15. 实施阶段

### Phase 1：冻结 contract

目标：

- 新增 `shell` 类型
- 接入 config -> adapter -> preset -> scaffold 链路
- 不改默认视觉结构

交付：

- `types/workspace.ts`
- `config.shell`
- `presetSlices.shell`

### Phase 2：引入 workspace shell

目标：

- 迁移 workspace 基础壳
- 默认渲染器包上 `WorkspaceShell`
- 左侧默认展开
- 右侧默认隐藏

交付：

- `components/workspace/*`
- `ChatDefaultRenderer.vue` 改造

### Phase 3：左侧 rail 与右侧空态

目标：

- 左侧折叠 rail
- 右侧空态工作区
- Header 入口收敛

交付：

- `components/chat/workspace/*`
- `ChatHeader.vue` 改造

### Phase 4：移动端降级与回归验证

目标：

- 左 drawer
- 右 modal/sheet
- demo / docs / tests 同步

## 16. 验证清单

### 16.1 类型与构建

- `pnpm -F @opentiny/tiny-robot-chat type-check`
- `pnpm -F @opentiny/tiny-robot-chat build`

### 16.2 demo

- `pnpm -F @opentiny/tiny-robot-chat-demo type-check`
- `pnpm -F @opentiny/tiny-robot-chat-demo build`

### 16.3 测试

- `pnpm -F tiny-robot-test test -- src/chat/index.spec.ts`
- `pnpm -F tiny-robot-test test -- src/chat/history.spec.ts`
- 如新增场景，再补 `workspace-shell.spec.ts`

### 16.4 人工验收

- 默认打开页面为左开右关
- 左侧栏可折叠为 rail
- 右侧默认隐藏
- 打开右侧后中间区自适应收缩
- 移动端左 drawer / 右 modal 正常
- 旧 `showHistory` 调用链不崩

## 17. 风险与控制

### 17.1 风险：默认视觉变化面大

控制方式：

- 先把默认行为冻结为“左开右关”
- 中间会话区尽量复用现有 `TrChat.Layout`

### 17.2 风险：旧 API 语义漂移

控制方式：

- 保留 `showHistory/historyProps`
- 文档中明确标注兼容层语义

### 17.3 风险：history 与 shell 强耦合

控制方式：

- 把 `ChatHistoryContent` 视为默认 sidebar content
- 不再让 `ChatHistory.vue` 拥有左栏容器语义

### 17.4 风险：移动端复杂度上升

控制方式：

- 桌面与移动端策略分开
- 不强求移动端桌面三栏同构

## 18. 验收标准

本次文档对应的实现完成后，应满足以下标准：

- 默认 `TrChat` 呈现为截图对应的两栏形态
- 左侧支持折叠为 rail
- 右侧工作区存在且默认隐藏
- 打开右侧后页面能平滑切换为三栏
- 黑盒和白盒路径消费同一套 shell contract
- 现有 history 基本能力不丢失
- 移动端具备明确降级方案

## 19. 文档维护规则

从本文件开始：

- 本文件作为当前 workspace 布局扩展的唯一主实现文档
- 进度更新写入 `workspace-layout-extension-progress.md`
- 旧草案不再继续追加设计内容
