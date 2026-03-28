# Chat 实现说明

> Last updated: `2026-03-28`
> Primary doc: 本文件是 `packages/chat` 当前包级实现说明的主文档
> Related:
> - [useChatKit 实现深潜](./use-chat-kit-implementation-deep-dive.md)

## 范围

`packages/chat` 是这个 monorepo 中的聊天场景组装层。

它负责：

- `TrChat`、`TrChat.Scaffold`、`TrChat.Root` 等公开聊天入口
- 基于配置的聊天场景组装
- preset props 与 preset slices 的投影
- 构建在 `packages/kit` 之上的 chat 级运行时组合
- history、attachments、feedback、model selector、MCP trigger 等打包 UI 能力

它不负责：

- 稳定 `ResponseProvider` 合同之外的 provider SDK 实现层
- 后端代理服务
- `packages/kit` 已经提供的底层消息引擎

## 当前稳定主链

当前稳定的主链路是：

```text
ChatConfig
  -> loadChatConfig()
  -> createChatAdapterFromConfig()
    -> adapter.getModel()
    -> adapter.createResponseProvider()
  -> ChatScaffold
    -> currentModel
    -> chatKit.updateResponseProvider()
```

关键约束：

- `ResponseProvider` 是本包唯一稳定的运行时 provider 合同
- `providerId` 用来标识模型归属的 provider 配置
- `providers[*].type` 默认是 `openai-compatible`
- `presetOverrides` 可以影响 preset 投影，但不拥有运行时模型身份

## 公开入口表面

当前对外的主要入口有：

- `TrChat`
- `TrChat.Scaffold`
- `TrChat.Root`
- 白盒叶子组件：
  - `TrChat.Layout`
  - `TrChat.Header`
  - `TrChat.Welcome`
  - `TrChat.MessageList`
  - `TrChat.Footer`
  - `TrChat.Sender`
  - `TrChat.History`
  - `TrChat.HistorySurface`

## 文件职责

### `adapters/*`

职责：

- 归一化 `ChatConfig`
- 校验 `model.providerId -> providers[providerId]`
- 将配置投影为 `ChatAdapter`
- 生成稳定的 preset props 与 preset slices

关键文件：

- `configLoader.ts`
- `configProjection.ts`
- `openaiCompatibleTransport.ts`

### `components/chat/*`

这里放组件表面和仅服务组件的实现：

- `ChatScaffold.vue`
  - adapter 创建
  - model state 持有
  - `chatKit` 创建或复用
  - runtime provider 更新
  - scaffold context 注入
- `ChatRoot.vue`
  - root context 边界
  - `chatKit | responseProvider` 入口解析
- `ChatDefaultRenderer.vue`
  - 默认黑盒页面组合
- `ChatDefaultHeaderRegion.vue`
- `ChatDefaultBodyRegion.vue`
- `ChatDefaultFooterRegion.vue`

### `helpers/*`

这里放非组件的入口辅助函数：

- `scaffoldRuntime.ts`
  - `ChatScaffold.vue` 使用的一组纯 helper
  - 包括初始模型解析
  - provider 创建
  - preset override 组装
  - named slot 收集
- `resolveRootChatKit.ts`
  - `TrChatRoot` 的 root props 解析 helper
  - 决定是使用外部注入的 `chatKit`，还是从 `responseProvider` 创建默认 `chatKit`

### `types/scaffold.ts`

这里负责 scaffold 相关的公开类型：

- `TrChatScaffoldProps`
- `ChatScaffoldRuntimeInput`
- `ChatScaffoldCallbacks`
- `TrChatScaffoldContextValue`

### `components/model-selector/*` + `composables/useModelSelector.ts`

职责：

- `ModelSelector.vue`
  - 只负责 dropdown UI
- `useModelSelector.ts`
  - 模型选择状态
  - disabled / fallback 逻辑
  - 变更通知

这两者都不再负责运行时 provider 切换。

## 当前验证状态

当前 `packages/chat` 的实现通过下面这些验证覆盖：

- `pnpm -F @opentiny/tiny-robot-chat type-check`
- `pnpm.cmd -F @opentiny/tiny-robot-chat test:unit`
- `pnpm.cmd -F @opentiny/tiny-robot-chat-demo type-check`
- `pnpm.cmd -F @opentiny/tiny-robot-chat-demo build`
- `packages/test/src/chat/*` 对保留 chat 表面的 Playwright 覆盖

## 剩余任务

当前还有少量可继续推进的工作，但都不是阻塞项。

### 1. Runtime message state contract

现状：

- `chatMessageState.ts` 已经集中管理这些常见状态的读写：
  - `error`
  - `isEditing`
  - `optimistic`
  - `turnId`
- retry / optimistic / edit rollback 已经走通主链

评估：

- 现在不是必须做的任务
- 只有当后续 message-level UI state 继续增多时，才值得再往前推进

建议：`defer`

### 2. Config / feature pipeline cleanup

现状：

- `configLoader.ts` 仍然相对偏长
- feature defaults 和 preset projection 逻辑仍散在几个地方

评估：

- 这是有价值的工程整理工作
- 但不是功能阻塞
- 只有当包准备继续扩展更多 config 或 feature 表面时，收益才会明显变高

建议：`optional`

### 3. Selector accessibility / keyboard polish

现状：

- keyboard scope
- close logic 清晰度
- ARIA / focus management

评估：

- 属于独立 UI polish
- 不属于当前主线重构
- 只有当可访问性或交互质量成为明确优先级时才值得重新推进

建议：`defer`

## 任务决策

建议保留在 backlog 中的任务：

- runtime message state contract cleanup
- config / feature pipeline cleanup
- selector accessibility / keyboard polish

建议暂时不主动推进的方向：

- sidebar shell 默认布局升级
- 建立在未确认 sidebar / shell 合同上的新模板或新壳层设计
- 执行跟踪文档和演讲提纲类文档

## 文档策略

对 `packages/chat/docs`，建议只保留两类文档：

- 当前实现状态文档
- 源码级深读文档

不再保留：

- 已经过时的执行跟踪文档
- 仍停留在假设阶段的 planning 文档
- talk / presentation outline 材料
