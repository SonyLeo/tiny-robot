# Chat Refactor Execution Plan

## 1. 文档角色

本文档负责回答：

- 旧实现的能力边界如何被新方案覆盖
- 目录结构与职责如何切清
- phase 应该怎样拆才不至于中途返工
- 测试如何分层

对外 API 与 runtime 设计请看：

- [ARCHITECTURE_REFACTOR_API_RUNTIME.md](./ARCHITECTURE_REFACTOR_API_RUNTIME.md)

## 2. 执行原则

### 2.1 以能力覆盖为约束，不以命名兼容为约束

这轮重构的核心约束是：

- 旧功能边界必须被覆盖
- 新入口必须比旧入口更容易理解
- 不要求保留旧命名

### 2.2 先冻结契约，再写实现

如果下面这些没有先冻结，就不建议进入实现：

- `TrChat / TrChat.Root / TrChat.Page` 命名与职责
- `TrChatConfig` 的功能域结构
- `ChatUIMessage.id`
- runtime modules 的边界
- `sender / attachments` 的 source of truth
- `message extension contract`
- `workspace + history` contract
- `slot` 与配置项优先级

### 2.3 phase 的拆分应服从真实产品主路径

`workspace / history / model` 不能被当成后置“附加 feature”，因为它们已经是当前默认页面的重要主路径。

### 2.4 命名与入口判断补充

为了避免重构后再次出现“同一个能力不知道该写在哪”的问题，这里补 5 条执行判断：

- 黑盒展示默认值统一使用 `config.ui`
- 黑盒流程节点处理统一使用 `config.lifecycle`
- `ui` 只负责品牌、欢迎区、appearance、copy、内容宽度等展示默认值
- `workspace` 只负责视图模式、左右区域、rail/sheet/mobile fallback 等壳层语义
- 同一类能力不再保留 `config.messages.*` 与 `config.lifecycle.*` 这类双入口

## 3. 旧能力覆盖表

| 旧能力族 | 当前旧入口 | 新方案正式承接 |
| --- | --- | --- |
| 黑盒默认接入 | `TrChat + config` | `TrChat + TrChatConfig` |
| 自带 runtime + 官方默认页面 | `TrChat.Scaffold` / `TrChat.Provider` 变体 | `TrChat.Root + TrChat.Page` |
| 白盒拼装 | `TrChat.Provider + compounds` | `TrChat.Root + primitives` |
| provider / model / defaults | `config.models/providers/defaults` | `config.request.*` |
| appearance / brand / welcome / layout | `config.ui / layout / appearance` | `config.ui / config.workspace` |
| sender 默认行为 | `presetOverrides / senderProps / senderActionsFeature` | `config.sender / config.attachments` |
| history 显示与交互 | `features.history / historyProps / chatUiContext` | `config.history + history runtime + workspace runtime` |
| workspace 左右栏 | `shell + workspace components + slots` | `config.workspace + workspace runtime + page slots` |
| messageActions | `presetOverrides.messageActions` | 黑盒：`config.messages.actions`；Root：`message runtime + primitives / slots` |
| bubbleRenderers | `presetOverrides.bubbleRenderers` | 黑盒：`config.messages.renderers`；Root：`message runtime + primitives / slots` |
| messageTransforms | `runtime.messageTransforms` | `config.messages.transforms` 或 transport pipeline |
| callbacks / onBeforeSend / onError | `callbacks + scaffold/provider callbacks` | `config.lifecycle.*` |
| feedback | `features.feedback + ChatFeedback` | `config.messages.feedback + message extension contract` |
| attachments | `features.attachments + attachmentsManager` | `sender runtime + attachments runtime + config.attachments` |
| sender voice / wordCount | `senderActionsFeature` | `config.sender.*` |
| MCP | `mcpManager + trigger + panel` | `config.mcp + mcp feature contract` |
| runtime 观测与调试 | `chatKit.runtime.*` | 后续单独 inspector / debug composables |
| helper / public composables | `useChatKit/useMcpManager/useChatAttachments/...` | 重构完成后重新收口，保留必要稳定 helper |

## 4. 必须提前守住的 parity guardrails

这些能力不能等到最后才补：

### 4.1 消息主链路

- send
- abort
- retry
- regenerate
- edit
- error / optimistic / streaming 状态

### 4.2 message extension 链路

- 默认 renderer 命中顺序
- custom renderer 注册
- messageActions merge / replace
- feedback 行为
- transform 后仍能继续命中 renderer / action 链

### 4.3 sender / attachments 链路

- draft
- 待发送附件
- 上传入口
- voice
- wordCount
- 发送成功后清空输入与待发送附件

### 4.4 workspace / history / model 联动

- workspace 默认页
- left / left-rail / right / mobile-left / mobile-right
- history drawer / surface / collapse 行为
- model selector 的当前值与禁用态
- mobile breakpoint 下的区域行为

### 4.5 MCP

- trigger
- panel
- bridge 执行
- 与消息链路、workspace 页面能正常协作

## 5. 目录与职责建议

```text
src/
  components/
    root/
      TrChatRoot.vue
    page/
      TrChatPage.vue
      TrChatPageHeader.vue
      TrChatPageBody.vue
      TrChatPageFooter.vue
    primitives/
      TrChatHeader.vue
      TrChatMessageList.vue
      TrChatMessage.vue
      TrChatSender.vue
      TrChatHistory.vue
      TrChatModelSelector.vue
      TrChatAttachments.vue
    workspace/
      TrChatWorkspaceShell.vue
      TrChatWorkspaceRail.vue
      TrChatWorkspaceSheet.vue
    features/
      message-actions/
      feedback/
      mcp/
      renderers/
  runtime/
    core/
      types.ts
      keys.ts
      composables.ts
      resolveRuntimeDefaults.ts
      resolveRuntimeCapabilities.ts
    transport/
      createTransportRuntime.ts
      normalizeChatUIMessage.ts
    external/
      createExternalRuntime.ts
    conversation/
      createConversationRuntime.ts
    sender/
      createSenderRuntime.ts
    message/
      createMessageRuntime.ts
    history/
      createHistoryRuntime.ts
    models/
      createModelRuntime.ts
    workspace/
      createWorkspaceRuntime.ts
    attachments/
      createAttachmentsRuntime.ts
  config/
    normalizeChatConfig.ts
    createTransportConfig.ts
    createUiConfig.ts
    createLifecycleConfig.ts
  shared/
    context/
    copy/
    utils/
```

### 5.1 ownership 原则

- `root/`
  只负责 runtime normalize、provide、上下文边界
- `page/`
  只负责官方默认页面结构与 slot contract
- `primitives/`
  只负责单一 UI 职责，不负责跨区域状态编排
- `workspace/`
  只负责 shell / rail / sheet / responsive 布局
- `features/`
  承接 message actions、feedback、mcp、renderers 等 feature 级能力
- `runtime/`
  只放 source of truth 与动作语义

## 6. phase 计划

## Phase 0：冻结契约与覆盖表

目标：

- 先把用户心智、runtime 边界、扩展 contract 定下来

必须产出：

- `TrChat / TrChat.Root / TrChat.Page` 公开命名
- `config.ui / config.lifecycle` 正式命名
- `TrChatConfig` 功能域结构
- `ChatUIMessage` 与稳定 `messageId`
- runtime modules 边界
- `ui vs workspace` 边界表
- `messages vs lifecycle` 边界表
- `sender / attachments` source of truth 规则
- `workspace + history` contract
- `message extension contract`
- primitive 读取边界表
- phase-to-test matrix
- 旧能力覆盖表

没有这些，不进入实现。

Phase 0 退出条件：

- 三份设计文档中的命名、边界、目录、phase 叙述已经一致
- 边界表和覆盖表进入“可实现”状态，不再依赖口头解释
- phase-to-test matrix 已写定，后续阶段不再临时补门禁

## Phase 1：runtime foundation + Root baseline

目标：

- 建立新的 runtime 与 `TrChat.Root`
- 让 UI 技术上脱离 `chatKit`
- 建立 whitebox 最小链路

必须覆盖：

- `conversation`
- `sender`
- `attachments` 最小 handoff 能力
- `message`
- `history` 最小切会话能力
- `models` 最小切模型能力
- `workspace` 最小区域状态能力

必须完成：

- `ChatUIMessage`
- `createTransportRuntime`
- `createConversationRuntime`
- `createSenderRuntime`
- `createMessageRuntime`
- `createAttachmentsRuntime`
- `createHistoryRuntime`
- `createModelRuntime`
- `createWorkspaceRuntime`
- `TrChat.Root`
- `TrChat.Header`
- `TrChat.Message`
- `TrChat.MessageList`
- `TrChat.Sender`

验收标准：

- UI 中不再直接依赖 `chatKit`
- UI 不再往消息对象写隐藏状态
- sender 与 attachments 的最小 source of truth handoff 已可运行
- edit / retry / regenerate / abort 主链可运行

Phase 1 必跑测试：

- runtime contract tests
- `message extension` 最小 contract tests
- `sender / attachments` source of truth contract tests

Phase 1 退出条件：

- 基础 runtime suites 全绿
- `Root + whitebox primitives` 最小链路可运行
- attachments 未再被推迟成“后面再补”的悬空能力

## Phase 2：黑盒 `TrChat` + 官方 `TrChat.Page`

目标：

- 建立新的黑盒心智
- 让默认页面重新可用，并且比旧方案更容易理解

必须完成：

- `TrChat`
- `TrChat.Page`
- `TrChatConfig` 全域解析
- 黑盒 slots
- request / ui / workspace / history / sender / messages / lifecycle 的主路径配置
- `TrChat.Page` 与 `WorkspaceShell` / `Header` / `MessageList` / `Sender` 的默认组合关系

重点验收：

- 文档层不再需要解释 `Scaffold / Provider / presetOverrides`
- 用户只需要理解 `TrChat` 和 `TrChat.Root`
- 常见默认接入能只靠一个 `config` 完成
- `TrChat.Page` 被明确为官方默认页面组件，而不是第三层用户入口

Phase 2 必跑测试：

- blackbox config contract tests
- page integration tests
- `TrChat` / `Root + Page` / `Root + whitebox primitives` 对照测试

Phase 2 退出条件：

- 黑盒主路径文档、示例、类型签名一致
- `ui`、`workspace`、`messages`、`lifecycle` 四类入口在黑盒模式下都能找到唯一写入口
- `TrChat.Page` 自身只负责页面组合，不再吞并下层 primitives 的职责

## Phase 3：feature parity

目标：

- 分两段补齐当前已公开、已被 demo/tests 依赖的 feature 边界

### Phase 3A：message and sender parity

必须覆盖：

- attachments
- sender voice / wordCount
- messageActions
- feedback
- renderers
- transforms

Phase 3A 必跑测试：

- message extension contract tests
- sender / attachments integration tests
- feature parity tests: message / sender slice

Phase 3A 退出条件：

- 消息扩展链路与发送链路不再依赖“临时约定”
- attachments、voice、wordCount、actions、renderers、feedback、transforms 均有稳定测试面

### Phase 3B：workspace and app parity

必须覆盖：

- MCP
- workspace mobile fallbacks
- history / model / workspace 联动细节

这一阶段不允许只做“结构差不多”，必须对齐关键交互语义。

Phase 3B 必跑测试：

- workspace / history contract tests
- page integration tests: workspace variants
- feature parity tests: workspace / MCP slice

Phase 3B 退出条件：

- workspace / history / model / MCP 不再是后置补洞能力
- stacked / workspace / mobile 三类主路径的交互语义有稳定回归保护

## Phase 4：稳定化、文档、测试、helper 收口

目标：

- 收口 public surface
- 补齐 demo / docs / tests
- 评估哪些 helper 应继续公开

完成项：

- docs 全面切换到新心智
- demo 全面迁移
- helper / inspector 收口
- 删除旧术语与旧 surface

Phase 4 必跑测试：

- docs and demo verification
- public surface verification
- full targeted package suite

Phase 4 退出条件：

- 文档、示例、public surface 与实现保持一致
- 每个正式入口至少有一个可运行 demo
- 收口类工作有自动化验证，不是仅靠人工检查

## 7. 测试策略

### 7.0 phase-to-test matrix

| Phase | 必跑测试 | 禁止进入下一阶段的失败项 |
| --- | --- | --- |
| Phase 0 | 文档一致性检查 | 命名、边界、目录、phase 叙述不一致 |
| Phase 1 | runtime contract tests / `message extension` 最小 contract tests / `sender-attachments` contract tests | runtime source of truth 漂移；attachments handoff 未成立；whitebox 最小链路不可运行 |
| Phase 2 | blackbox config contract tests / page integration tests / `TrChat` vs `Root + Page` 对照测试 | 黑盒配置仍有双入口；`TrChat.Page` 仍吞并下层职责；默认接入路径不可运行 |
| Phase 3A | message extension contract tests / sender-attachments integration tests / feature parity tests: message-sender slice | 消息链路与发送链路没有稳定回归保护 |
| Phase 3B | workspace-history contract tests / page integration tests: workspace variants / feature parity tests: workspace-MCP slice | workspace/history/model/MCP/mobile 主路径语义仍不稳定 |
| Phase 4 | docs and demo verification / public surface verification / full targeted package suite | public surface、文档、demo 与实现不一致 |

### 7.1 runtime contract tests

验证：

- `ChatUIMessage`
- `conversation / sender / message / history / models / workspace / attachments`
- `resolveRuntimeDefaults`
- `resolveRuntimeCapabilities`
- source of truth 规则
- `sender / attachments` handoff 规则
- `workspace / history` 组合语义

### 7.1A message extension contract tests

验证：

- action merge / replace
- 默认 renderer 命中顺序
- feedback placement
- transforms 之后仍能命中 renderer / action 链

### 7.2 primitive UI tests

验证：

- `Header`
- `Message`
- `MessageList`
- `Sender`
- `History`
- `ModelSelector`
- `WorkspaceShell`

重点检查 primitive 是否只消费允许读取的 runtime module。

### 7.3 page integration tests

验证：

- `TrChat.Page`
- 黑盒 `TrChat`
- `Root + Page`
- `Root + whitebox primitives`

### 7.4 feature parity tests

重点覆盖：

- message actions
- feedback
- renderers
- transforms
- sender voice / wordCount / attachments
- history / model / workspace 联动
- MCP
- mobile-left / mobile-right fallback

### 7.5 docs and demo verification

要求：

- 每个正式入口至少有一个 demo
- 每个复杂 feature 至少有一个针对性 demo
- 文档描述的用户心智必须和真实 public API 一致

## 8. 评审 checklist

评审当前方案时，至少逐项确认：

1. 用户是否只需要理解 `TrChat` 和 `TrChat.Root`
2. 用户是否能按“`TrChat` -> `TrChat.Root + TrChat.Page` -> `TrChat.Root + primitives`”理解升级路径
3. 黑盒配置是否按功能域组织，而不是按阶段组织
4. 同一类能力是否只有一个正式写入口
5. `TrChat.Page` 是否被清晰定义为官方页面组件，而不是第三层用户入口
6. `ui`、`workspace`、`messages`、`lifecycle` 是否各自只承担自己的边界
7. runtime modules 是否只承载真正的 source of truth
8. `workspace + history` 是否被视为主路径 contract
9. `message extension contract` 是否已经冻结
10. slots 和配置优先级是否明确
11. phase 是否把主路径能力放在足够早的位置
12. phase-to-test matrix 是否已经落地
13. 测试是否能按 runtime / primitive / page / feature parity 分层

## 9. 推荐结论

推荐按以下执行策略推进：

- 不做旧 API 兼容层
- 先做契约冻结和能力覆盖表
- 先把 `config.ui / config.lifecycle` 与单一入口原则定死
- 先把 `Root + runtime foundation + Page` 做成立
- 再回到黑盒 `TrChat`
- 再补齐 feature parity
- 最后统一收口 helper、docs、demo 与测试

一句话概括：

先把“边界和覆盖”做对，再把“实现和命名”做完，这样才能真正解决旧方案“功能多但难理解”的问题。
