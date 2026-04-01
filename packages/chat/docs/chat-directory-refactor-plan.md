# Chat Directory Refactor Plan

> Last updated: `2026-04-02`
> Status: `Refactor guide`
> Scope: `packages/chat`
> Related:
> - [README](./README.md)
> - [Chat Implementation](./chat-implementation.md)
> - [Checklist](./chat-directory-refactor-checklist.md)

## Progress

- Phase 0: completed
- Phase 1: completed
- Phase 2: completed
- Phase 3: completed
- Phase 4: completed
- Phase 5: completed
- Phase 6: completed
- Phase 7: completed
- Phase 8: completed
- Phase 9: completed
- Phase 10: completed
- Phase 11: completed
- Phase 12: completed
- Phase 13: completed

当前已完成的重组范围：

- 新建并启用了 `runtime/config`
- 新建并启用了 `runtime/presets`
- 新建并启用了 `runtime/chat-kit`
- 新建并启用了 `runtime/scaffold`
- 新建并启用了统一的 `components/workspace`
- 新建并启用了 `components/history/useHistoryState.ts`
- 新建并启用了 `components/mcp/*`
- 新建并启用了 `components/model-selector/*` 作为 feature-local composable 的 canonical 目录
- 新建并启用了 `components/feedback/*`
- 新建并启用了 `components/attachments/*`
- 新建并启用了 `components/core/*`
- 新建并启用了 `components/core/default-renderer/*`
- 新建并启用了 `shared/context/*`
- 新建并启用了 `shared/messages/*`
- 新建并启用了 `shared/utils/*`
- `styles/index.css` 继续作为稳定入口，`variables.css` 已重命名为 `tokens.css`
- `tests/_harness.mjs` 已支持递归发现测试文件
- `tests` 已按 `contracts / runtime / config / ui` 分组
- 旧路径已经压成兼容层
- `type-check` 与包内 `test` 已通过

当前目录重组计划中的所有阶段已完成。

## 1. 文档目的

本文档用于指导 `packages/chat` 的目录重组与模块收口。

它关注的是：

- 目标目录结构
- 模块边界与目录归属
- 分阶段重组顺序
- 每个阶段的注意事项与验证方式

它不关注的是：

- PR 切分
- 提交流程
- 发布流程

本文档假定当前仍处于开发阶段，因此优先考虑：

- 让目录结构表达真实架构
- 降低后续迭代认知成本
- 在尽量不破坏 public API 的前提下完成内部重组

## 2. 当前实现的结构判断

基于当前代码，`packages/chat` 已经自然形成三条主链：

### 2.1 配置与预设链

```text
loadChatConfig
  -> resolveChatFeatures
  -> createChatAdapterFromConfig
  -> createPresetChatProps
  -> createPresetChatSlices
```

这条链当前分散在：

- `src/adapters`
- `src/features`
- `src/presets`
- `src/helpers` 的一部分调用辅助

实际语义更接近“runtime config pipeline”，而不是独立的 `adapter + feature + preset` 三套无关目录。

### 2.2 聊天运行时链

```text
useChatKit
  -> useChatConversation
  -> useChatRequest
  -> useChatMessages
  -> chatMessageState / chatRenderMessages
```

这条链当前主要位于 `src/composables`，但其中有些文件是 chat runtime 核心，有些文件只是局部 UI feature 的状态逻辑，语义混杂。

### 2.3 UI 组合链

```text
TrChat
  -> TrChat.Scaffold
    -> TrChat.Root
      -> ChatDefaultRenderer
        -> ChatLayout
        -> Workspace / History / Sender / Feedback / MCP / ModelSelector
```

这条链当前主要位于 `src/components/chat`，但其中夹杂了：

- workspace 的子域实现
- feature 级组件
- default renderer 内部区域组件

导致 `components/chat` 既像“主骨架”，又像“大杂烩目录”。

## 3. 当前目录的主要问题

### 3.1 顶层目录采用了多套坐标系

当前 `src` 同时按这些维度拆目录：

- 技术类型：`components / composables / styles / utils / types`
- 运行时阶段：`adapters / features / presets / helpers`
- 功能域：`history / model-selector / workspace / mcp-trigger`

这会导致：

- 同一条主链横跨多个目录
- 新文件不容易判断应该放在哪
- 团队成员只能靠历史习惯决定归属

### 3.2 `workspace` 边界不稳定

当前 workspace 相关实现分散在：

- `src/chatUiContext.ts`
- `src/components/workspace/*`
- `src/components/chat/ChatWorkspaceLayout.vue`
- `src/components/chat/workspace/*`
- `src/types/workspace.ts`

这说明 `workspace` 实际上已经是一级功能域，但目录上仍然被拆成两半。

### 3.3 `composables` 顶层过载

当前 `src/composables` 同时承载：

- chat runtime 核心：`useChatKit`、`useChatConversation`、`useChatRequest`
- runtime 内部辅助：`chatMessageState`、`chatRenderMessages`
- feature 状态：`useHistoryState`、`useMcpManager`、`useModelSelector`
- 交互细节：`useFloatingDropdown`、`useKeyboardNavigation`

目录本身已经无法表达优先级和所有权。

### 3.4 `adapters` 命名不能准确表达职责

`src/adapters` 里当前不只是 adapter：

- config 归一化
- provider factory
- feature 投影
- CLI contract 输出
- preset slice 投影

更准确的名字应该是 `runtime/config`。

### 3.5 `components/chat` 目录超载

当前 `components/chat` 里既有：

- `TrChat` 主骨架
- default renderer
- workspace layout
- attachments / feedback / mcp panel 等 feature 组件

这使得“主骨架”和“子域功能”混在一起。

### 3.6 测试结构与目录边界未对齐

当前 `packages/chat/tests` 大量测试堆在顶层。

同时测试基建 `tests/_harness.mjs` 只扫描顶层 `.test.mjs` 文件，不支持递归目录，因此测试结构尚未为目录重组做好准备。

## 4. 重组目标

本次目录重组建议遵循以下目标：

### 4.1 保持 public API 稳定

以下内容在目录重组期间应尽量保持不变：

- `src/index.ts`
- `src/internal.ts`
- `package.json` exports
- `TrChat` 及其 compound component 导出名
- 关键类型导出名

### 4.2 让目录能够表达主链

开发者在看目录时，应该能快速回答：

1. 配置与 preset 在哪里
2. chat runtime 核心在哪里
3. workspace/history/mcp/model selector 等 feature 在哪里

### 4.3 降低功能域的跨目录跳转

以 `workspace` 为例，重组后应做到：

- 状态
- 容器
- 布局
- sidebar / panel / sheet

都能在同一 feature 目录中找到。

### 4.4 迁移顺序要支持渐进式执行

目录重组应允许：

- 先迁移内部实现
- 再逐步清理兼容层
- 期间持续跑类型检查与现有测试

而不是要求一次性大爆炸改完。

## 5. 目标目录结构

建议的目标目录结构如下：

```text
packages/chat/src/
  index.ts
  internal.ts

  types/
    index.ts
    core.ts
    model.ts
    scaffold.ts
    ui.ts
    workspace.ts

  shared/
    context/
      index.ts
      injectionKeys.ts
      scaffoldContext.ts
    messages/
      index.ts
    utils/
      index.ts
      iconMap.ts
      props.ts
      typeGuards.ts

  runtime/
    chat-kit/
      index.ts
      useChatKit.ts
      useChatConversation.ts
      useChatRequest.ts
      useChatMessages.ts
      chatMessageState.ts
      chatRenderMessages.ts
    config/
      index.ts
      capabilities.ts
      configLoader.ts
      configProjection.ts
      openaiCompatibleTransport.ts
      chatCli.ts
      featureRegistry.ts
      featureTypes.ts
      types.ts
    presets/
      index.ts
      resolve.ts
      catalog.ts
      types.ts
      README.md
    scaffold/
      index.ts
      scaffoldRuntime.ts
      resolveRootChatKit.ts

  components/
    core/
      index.ts
      Chat.vue
      ChatScaffold.vue
      ChatRoot.vue
      ChatLayout.vue
      ChatHeader.vue
      ChatFooter.vue
      ChatWelcome.vue
      ChatMessageList.vue
      ChatSender.vue
      useDefaultBubbleConfig.ts
      default-renderer/
        index.ts
        ChatDefaultRenderer.vue
        ChatDefaultHeaderRegion.vue
        ChatDefaultBodyRegion.vue
        ChatDefaultFooterRegion.vue
    attachments/
      index.ts
      ChatAttachments.vue
      useChatAttachments.ts
    feedback/
      index.ts
      ChatFeedback.vue
      useChatFeedback.ts
    history/
      index.ts
      ChatHistory.vue
      ChatHistorySurface.vue
      ChatHistoryContent.vue
      ChatHistoryList.vue
      ChatHistoryPanel.vue
      ChatHistoryToolbar.vue
      ChatHistorySearch.vue
      ChatHistoryNewSession.vue
      ChatHistoryManageButton.vue
      useHistoryState.ts
    mcp/
      index.ts
      McpTrigger.vue
      ChatMcpPanel.vue
      useMcpManager.ts
    model-selector/
      index.ts
      ModelSelector.vue
      useModelSelector.ts
      useFloatingDropdown.ts
      useKeyboardNavigation.ts
    renderers/
      index.ts
      AttachmentsRenderer.vue
      ErrorRenderer.vue
      EditInputRenderer.vue
      MarkStreamRenderer.vue
      ToolCallsRenderer.vue
      ToolCallRenderer.vue
    workspace/
      index.ts
      chatUiContext.ts
      WorkspaceShell.vue
      useWorkspaceRegion.ts
      runtime.ts
      ChatWorkspaceLayout.vue
      ChatWorkspaceSidebar.vue
      ChatWorkspaceSidebarShell.vue
      ChatWorkspaceSidebarRail.vue
      ChatWorkspaceLeftSheet.vue
      ChatWorkspaceRightEmpty.vue
      ChatWorkspaceRightPanel.vue
      ChatWorkspaceRightSheet.vue

  styles/
    index.css
    tokens.css
    layout.css
    drawer.css
```

## 6. 目标结构的模块职责

### 6.1 `types/`

保留为顶层公共 contract 层。

第一阶段不建议大改 `types` 目录，只做最小 import 调整，避免目录重组与 public type 调整耦合在一起。

### 6.2 `shared/`

只允许放“跨 runtime 与 UI 的共享基础设施”：

- injection keys
- shared message copy
- 公共 utils

不允许继续把 feature-local composable 放入 `shared/`。

### 6.3 `runtime/`

承接所有非视觉的核心逻辑：

- config 归一化与投影
- chat runtime
- preset 解析
- scaffold 编排辅助

判断标准：

- 如果一个模块没有 UI，但会影响 `TrChat` 的行为、状态流、配置解析或 provider 连接，它优先属于 `runtime/`。

### 6.4 `components/core/`

只保留 `TrChat` 主骨架和默认组合链。

这里的内容应该回答：

- 如何进入 chat
- 如何从 scaffold 到 root
- 如何进入 default renderer
- 如何拼出默认 chat 页面

### 6.5 `components/<feature>/`

每个功能域单独成目录。

判断标准：

- 如果一个组件及其 composable 服务于某一功能域，例如 `history` 或 `mcp`，它应该和该功能域在同一目录中。

### 6.6 `styles/`

保留统一样式入口，但允许 feature 样式逐步回归 feature 拥有者。

短期内仍建议保留：

- `styles/index.css` 作为构建入口
- `layout.css`、`drawer.css` 作为全局布局样式

## 7. 当前文件到目标目录的映射

下面给出建议的具体映射，后续重组时可以直接照此执行。

### 7.1 根文件

- `src/index.ts`：保留原位
- `src/internal.ts`：保留原位
- `src/context.ts` -> `src/shared/context/index.ts`
- `src/messages.ts` -> `src/shared/messages/index.ts`
- `src/capabilities.ts` -> `src/runtime/config/capabilities.ts`
- `src/chatUiContext.ts` -> `src/components/workspace/chatUiContext.ts`

### 7.2 `src/adapters`

- `src/adapters/configLoader.ts` -> `src/runtime/config/configLoader.ts`
- `src/adapters/configProjection.ts` -> `src/runtime/config/configProjection.ts`
- `src/adapters/openaiCompatibleTransport.ts` -> `src/runtime/config/openaiCompatibleTransport.ts`
- `src/adapters/chatCli.ts` -> `src/runtime/config/chatCli.ts`
- `src/adapters/types.ts` -> `src/runtime/config/types.ts`
- `src/adapters/index.ts` -> `src/runtime/config/index.ts`

### 7.3 `src/features`

- `src/features/registry.ts` -> `src/runtime/config/featureRegistry.ts`
- `src/features/types.ts` -> `src/runtime/config/featureTypes.ts`
- `src/features/index.ts` -> `src/runtime/config/features.ts` 或并入 `src/runtime/config/index.ts`

### 7.4 `src/presets`

- `src/presets/resolve.ts` -> `src/runtime/presets/resolve.ts`
- `src/presets/catalog.ts` -> `src/runtime/presets/catalog.ts`
- `src/presets/types.ts` -> `src/runtime/presets/types.ts`
- `src/presets/index.ts` -> `src/runtime/presets/index.ts`
- `src/presets/README.md` -> `src/runtime/presets/README.md`

### 7.5 `src/helpers`

- `src/helpers/scaffoldRuntime.ts` -> `src/runtime/scaffold/scaffoldRuntime.ts`
- `src/helpers/resolveRootChatKit.ts` -> `src/runtime/scaffold/resolveRootChatKit.ts`

### 7.6 runtime 核心 composables

- `src/composables/useChatKit.ts` -> `src/runtime/chat-kit/useChatKit.ts`
- `src/composables/useChatConversation.ts` -> `src/runtime/chat-kit/useChatConversation.ts`
- `src/composables/useChatRequest.ts` -> `src/runtime/chat-kit/useChatRequest.ts`
- `src/composables/useChatMessages.ts` -> `src/runtime/chat-kit/useChatMessages.ts`
- `src/composables/chatMessageState.ts` -> `src/runtime/chat-kit/chatMessageState.ts`
- `src/composables/chatRenderMessages.ts` -> `src/runtime/chat-kit/chatRenderMessages.ts`

### 7.7 feature-local composables

- `src/composables/useChatAttachments.ts` -> `src/components/attachments/useChatAttachments.ts`
- `src/composables/useChatFeedback.ts` -> `src/components/feedback/useChatFeedback.ts`
- `src/composables/useHistoryState.ts` -> `src/components/history/useHistoryState.ts`
- `src/composables/useMcpManager.ts` -> `src/components/mcp/useMcpManager.ts`
- `src/composables/useModelSelector.ts` -> `src/components/model-selector/useModelSelector.ts`
- `src/composables/useFloatingDropdown.ts` -> `src/components/model-selector/useFloatingDropdown.ts`
- `src/composables/useKeyboardNavigation.ts` -> `src/components/model-selector/useKeyboardNavigation.ts`
- `src/composables/useDefaultBubbleConfig.ts` -> `src/components/core/useDefaultBubbleConfig.ts`

### 7.8 `src/components/chat`

- `Chat.vue` -> `src/components/core/Chat.vue`
- `ChatScaffold.vue` -> `src/components/core/ChatScaffold.vue`
- `ChatRoot.vue` -> `src/components/core/ChatRoot.vue`
- `ChatLayout.vue` -> `src/components/core/ChatLayout.vue`
- `ChatHeader.vue` -> `src/components/core/ChatHeader.vue`
- `ChatFooter.vue` -> `src/components/core/ChatFooter.vue`
- `ChatWelcome.vue` -> `src/components/core/ChatWelcome.vue`
- `ChatMessageList.vue` -> `src/components/core/ChatMessageList.vue`
- `ChatSender.vue` -> `src/components/core/ChatSender.vue`
- `ChatAttachments.vue` -> `src/components/attachments/ChatAttachments.vue`
- `ChatFeedback.vue` -> `src/components/feedback/ChatFeedback.vue`
- `ChatMcpPanel.vue` -> `src/components/mcp/ChatMcpPanel.vue`
- `ChatDefaultRenderer.vue` -> `src/components/core/default-renderer/ChatDefaultRenderer.vue`
- `ChatDefaultHeaderRegion.vue` -> `src/components/core/default-renderer/ChatDefaultHeaderRegion.vue`
- `ChatDefaultBodyRegion.vue` -> `src/components/core/default-renderer/ChatDefaultBodyRegion.vue`
- `ChatDefaultFooterRegion.vue` -> `src/components/core/default-renderer/ChatDefaultFooterRegion.vue`
- `ChatWorkspaceLayout.vue` -> `src/components/workspace/ChatWorkspaceLayout.vue`

### 7.9 workspace

来自两个旧目录的文件统一并入：

- `src/components/workspace/*`
- `src/components/chat/workspace/*`

目标统一目录：

- `src/components/workspace/*`

### 7.10 其他 feature 目录

- `src/components/history/*` -> `src/components/history/*`
- `src/components/model-selector/*` -> `src/components/model-selector/*`
- `src/components/mcp-trigger/*` -> `src/components/mcp/*`
- `src/components/render/*` -> `src/components/renderers/*`

### 7.11 `src/utils`

- `src/utils/iconMap.ts` -> `src/shared/utils/iconMap.ts`
- `src/utils/props.ts` -> `src/shared/utils/props.ts`
- `src/utils/typeGuards.ts` -> `src/shared/utils/typeGuards.ts`
- `src/utils/index.ts` -> `src/shared/utils/index.ts`

## 8. 重组执行原则

以下原则在整个重组期间应始终成立：

### 8.1 不同时改动目录与行为

如果某一阶段的目标是目录迁移，就不要在同一阶段顺手重写逻辑。

例如：

- 不要在搬迁 `ChatScaffold.vue` 时同时重构模型选择逻辑
- 不要在搬迁 `workspace` 文件时同时改 slot contract

### 8.2 先加兼容层，再删旧路径

建议顺序：

1. 新目录落位
2. 新目录建立 barrel
3. 旧路径改成 re-export 新路径
4. 批量修改内部 import
5. 验证通过后再删除旧实现文件

### 8.3 第一阶段不动 public types

`src/types/*` 与 `src/index.ts` 的导出名应尽量保持稳定。

如果后续确实要调整类型边界，应在目录重组完成后另起一轮工作。

### 8.4 第一阶段不改 slot 名

尤其是以下 workspace slot：

- `left`
- `left-rail`
- `right`
- `mobile-left`
- `mobile-right`

### 8.5 样式入口先保持不变

`src/styles/index.css` 仍作为唯一入口。

即使样式文件逐步迁移，也应保留一个统一聚合入口，避免构建出口波动。

## 9. 分阶段重组计划

以下阶段按推荐顺序排列，适合直接作为后续实施清单。

### Phase 0：冻结边界与约束

目标：

- 明确本轮重组只处理目录与模块归属
- 不处理提交流程
- 不处理 public API 设计变更

本阶段明确不做的事：

- 不修改 `package.json` exports
- 不修改 `src/index.ts` 的导出名
- 不修改 `src/internal.ts` 的导出名
- 不修改 `TrChatFull.*` compound component 挂载逻辑
- 不修改关键 slot 名称
- 不修改主要类型名

完成标准：

- 团队对“内部结构优化优先，外部 surface 暂不变化”达成一致

### Phase 1：建立目标目录骨架

目标：

- 先把目标目录创建出来
- 不急于搬迁所有实现

执行步骤：

1. 创建 `shared/`
2. 创建 `runtime/`
3. 创建 `components/` 下的各 feature 目录
4. 为新目录创建最小 `index.ts`
5. 暂时不删除旧目录

完成标准：

- 新目录骨架已经存在
- 老目录仍正常工作

### Phase 2：迁移 `runtime/config`

目标：

- 收口配置归一化与 feature/preset 投影主链

执行步骤：

1. 将 `src/adapters/*` 迁到 `src/runtime/config/*`
2. 将 `src/features/*` 迁到 `src/runtime/config/*`
3. 将 `src/capabilities.ts` 迁到 `src/runtime/config/capabilities.ts`
4. 建立 `src/runtime/config/index.ts`
5. 旧 `src/adapters/index.ts` 改为 re-export
6. 旧 `src/features/index.ts` 改为 re-export
7. 更新内部 import 到新路径

本阶段不要做：

- 不修改 config 行为
- 不修改 preset 合并策略
- 不修改 provider 逻辑

完成标准：

- 配置链的核心实现只存在于 `runtime/config`
- 旧目录仅保留兼容 re-export

### Phase 3：迁移 `runtime/scaffold`

目标：

- 去掉语义过泛的 `helpers`
- 让 scaffold 编排辅助形成独立层

执行步骤：

1. 迁移 `scaffoldRuntime.ts`
2. 迁移 `resolveRootChatKit.ts`
3. 建立 `src/runtime/scaffold/index.ts`
4. 更新 `ChatScaffold.vue`、`ChatRoot.vue` 引用
5. 旧 `helpers/*` 先保留兼容层

完成标准：

- scaffold 相关非 UI 辅助统一进入 `runtime/scaffold`

### Phase 4：迁移 `runtime/chat-kit`

目标：

- 将 chat runtime 核心从顶层 `composables` 剥离

执行步骤：

1. 迁移 `useChatKit.ts`
2. 迁移 `useChatConversation.ts`
3. 迁移 `useChatRequest.ts`
4. 迁移 `useChatMessages.ts`
5. 迁移 `chatMessageState.ts`
6. 迁移 `chatRenderMessages.ts`
7. 建立 `src/runtime/chat-kit/index.ts`
8. 旧 `composables/index.ts` 先保留兼容导出

完成标准：

- runtime 主链在目录上完整可见
- 顶层 `composables` 不再承载 chat 核心主链

### Phase 5：合并 `workspace`

目标：

- 解决当前最分裂的一级功能域

执行步骤：

1. 将 `src/chatUiContext.ts` 迁入 `src/components/workspace/`
2. 将 `src/components/workspace/*` 保留并纳入同一 feature 根
3. 将 `src/components/chat/ChatWorkspaceLayout.vue` 迁入 `src/components/workspace/`
4. 将 `src/components/chat/workspace/*` 全部迁入 `src/components/workspace/`
5. 建立统一的 `src/components/workspace/index.ts`
6. 旧路径先做 re-export

本阶段重点：

- 不修改 workspace slot contract
- 不重写 mobile sheet fallback 行为
- 不调整 shell 的默认交互语义

完成标准：

- workspace 只有一个 feature 根目录
- workspace 状态、布局、容器、panel 全部同域

### Phase 6：收口 `history`

目标：

- 将 history 组件与状态管理完全聚合

执行步骤：

1. 保留 `src/components/history/*` 作为 history feature 主目录
2. 将 `useHistoryState.ts` 迁入 `src/components/history/`
3. 更新 history 内部 import
4. 保持 shared context 中的 `CHAT_HISTORY_KEY`

完成标准：

- history 组件与其状态逻辑位于同一目录

### Phase 7：收口 `mcp`

目标：

- 将 trigger、panel、manager 合并为统一 feature

执行步骤：

1. 将 `McpTrigger.vue` 迁入 `src/components/mcp/`
2. 将 `ChatMcpPanel.vue` 迁入 `src/components/mcp/`
3. 将 `useMcpManager.ts` 迁入 `src/components/mcp/`
4. 建立 `src/components/mcp/index.ts`

完成标准：

- mcp feature 内部形成闭环

### Phase 8：收口 `model-selector`

目标：

- 将组件、状态、dropdown 行为、键盘交互聚合

执行步骤：

1. 保留 `ModelSelector.vue` 在独立 feature 目录
2. 将 `useModelSelector.ts` 迁入该目录
3. 将 `useFloatingDropdown.ts` 迁入该目录
4. 将 `useKeyboardNavigation.ts` 迁入该目录
5. 保持 `iconMap.ts` 仍在 shared utils

完成标准：

- model selector 的全部行为与 UI 位于同一 feature 目录

### Phase 9：收口 `feedback` 与 `attachments`

目标：

- 处理剩余两个典型 feature-local 模块

执行步骤：

1. 将 `ChatFeedback.vue` 与 `useChatFeedback.ts` 聚合到 `components/feedback`
2. 将 `ChatAttachments.vue` 与 `useChatAttachments.ts` 聚合到 `components/attachments`
3. 建立各自 `index.ts`

完成标准：

- 顶层 `composables` 进一步瘦身

### Phase 10：收口 `core`

目标：

- 将 `components/chat` 收缩为真正的核心骨架模块

执行步骤：

1. 迁移 `Chat.vue`
2. 迁移 `ChatScaffold.vue`
3. 迁移 `ChatRoot.vue`
4. 迁移 `ChatLayout.vue`
5. 迁移 `ChatHeader.vue`
6. 迁移 `ChatFooter.vue`
7. 迁移 `ChatWelcome.vue`
8. 迁移 `ChatMessageList.vue`
9. 迁移 `ChatSender.vue`
10. 将 default renderer 及其 region 组件迁入 `components/core/default-renderer`
11. 建立 `components/core/index.ts`
12. 原 `components/chat/index.ts` 暂时保留兼容导出

完成标准：

- `components/chat` 不再是全量功能聚合目录
- `components/core` 能表达主骨架语义

### Phase 11：收口 `shared`

目标：

- 将真正跨层共享的基础设施集中起来

执行步骤：

1. 拆分 `context.ts`
2. 迁移 `messages.ts`
3. 迁移 `utils/*`
4. 调整 `@/context`、`@/messages`、`@/utils` 到新的 shared barrel

完成标准：

- 根目录不再承载共享基础设施实现

### Phase 12：整理样式

目标：

- 让样式归属更清晰，但保留统一入口

执行步骤：

1. 保留 `styles/index.css`
2. 将 `variables.css` 改名为 `tokens.css`
3. `layout.css` 与 `drawer.css` 继续保留在 `styles/`
4. feature 样式按需要逐步迁移回 feature 目录
5. `styles/index.css` 继续作为最终聚合入口

完成标准：

- 样式入口稳定
- 样式归属关系更清楚

### Phase 13：整理测试目录

目标：

- 让测试结构与模块结构一致

建议目标结构：

```text
packages/chat/tests/
  _harness.mjs
  _helpers.mjs
  run-all.mjs
  contracts/
  runtime/
  config/
  ui/
```

执行步骤：

1. 先改造 `_harness.mjs` 支持递归扫描
2. 再迁移各类测试到分目录
3. `public-surface.test.mjs` 放 `contracts/`
4. `workspace-slot-contract.test.mjs` 放 `contracts/`
5. runtime/config/ui 测试按模块归类

完成标准：

- 测试 runner 支持目录化
- 测试布局可以跟随模块结构

## 10. 每阶段的固定验证项

每完成一个阶段，都建议执行以下检查：

### 10.1 类型检查

```powershell
pnpm.cmd -F @opentiny/tiny-robot-chat type-check
```

### 10.2 包内测试

```powershell
pnpm.cmd -F @opentiny/tiny-robot-chat test
```

### 10.3 重点回归检查

- `src/index.ts` 的导出名未变化
- `src/internal.ts` 仍可正常导出
- `TrChatFull.*` compound surface 未变化
- workspace slot contract 未破坏
- config / preset 链未破坏
- default renderer 渲染路径未破坏

## 11. 重组期间的注意事项

### 11.1 不要重写 `ChatScaffold`

`ChatScaffold.vue` 是当前最核心的 orchestration 点。

目录重组期间只迁移文件与 import，不建议顺手重构它的行为。

### 11.2 不要重写 `ChatRoot`

`ChatRoot.vue` 当前负责核心 provide/inject 链。

迁移期间不要改变：

- context 提供顺序
- root 对 chatKit 的解析策略
- attachments/mcp/history 的注入条件

### 11.3 不要修改 workspace slot contract

当前 workspace slot contract 已经被源码 contract test 覆盖。

重组期间只允许移动代码，不建议改变：

- slot 名
- fallback 规则
- 移动端 sheet 逻辑

### 11.4 `types` 中对 composable 返回类型的引用要谨慎处理

当前 `types/ui.ts`、`types/scaffold.ts` 里会直接引用某些 composable 返回类型。

迁移这些 composable 时，建议先保留稳定 barrel，再逐步收敛 import 路径。

### 11.5 测试文件路径可能绑定源码位置

当前部分 contract test 直接读取源码文件内容。

因此在移动文件之前，要先决定：

- 是保留兼容文件
- 还是同步更新测试路径

### 11.6 `styles/index.css` 要持续保留

即使样式逐步 feature 化，也建议保留统一入口，避免构建出口和消费方式抖动。

## 12. 完成后的验收标准

当整轮目录重组完成后，应满足以下条件：

- 根目录只保留入口、类型和少量稳定目录
- `workspace` 只存在一个 feature 根目录
- 顶层 `composables` 已删除或仅剩极薄兼容层
- `adapters` 与 `features` 已由 `runtime/config` 取代
- `components/chat` 已收缩为 `components/core`
- `history / mcp / model-selector / feedback / attachments / workspace` 均形成 feature 目录
- 当前 public API 名称保持稳定
- 当前类型检查与包内测试全部通过

## 13. 建议的执行顺序总结

如果只看最短路径，建议按以下顺序推进：

1. 建目录骨架
2. 收口 `runtime/config`
3. 收口 `runtime/scaffold`
4. 收口 `runtime/chat-kit`
5. 合并 `workspace`
6. 收口 `history`
7. 收口 `mcp`
8. 收口 `model-selector`
9. 收口 `feedback` 与 `attachments`
10. 收口 `core`
11. 收口 `shared`
12. 整理 `styles`
13. 整理 `tests`

这个顺序的原因是：

- 先处理非 UI 核心链路，风险更低
- 再处理 workspace 这类边界最明显但影响较大的 feature
- 最后再收尾 shared、styles、tests

## 14. 后续维护建议

目录重组完成后，建议长期遵守以下规则：

- 新增 runtime 逻辑优先判断是否属于 `runtime/`
- 新增 feature-local composable 直接放进对应 feature 目录
- 不再往顶层新增新的“泛技术目录”
- `index.ts` 保持 public surface 导向，不回退成实现堆积点
- `workspace`、`history`、`mcp`、`model-selector` 继续按 feature 域维护
