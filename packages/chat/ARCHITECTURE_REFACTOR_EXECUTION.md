# Chat Refactor Execution Plan

Status: active execution plan.

This document owns phase gates, cutover sequencing, and validation expectations.
When it conflicts with the historical proposal, this document wins.

Cutover milestones:

| Milestone | Required artifacts | Forbidden repository state |
| --- | --- | --- |
| `next surface available` | `Root` baseline, `createRuntimeFromConfig(config)`, runtime contract tests, migration examples | announcing `Root/Page` as the default path before the bridge and tests exist |
| `docs/AGENTS mindshare flip` | updated refactor docs, `packages/chat/AGENTS.md`, explicit legacy guidance window, slot catalog | flipping package guidance while demos/tests/exports still force old-only usage |
| `public export flip` | export disposition table executed, `public-surface` tests updated, next-surface examples green | changing `src/index.ts` or contract tests without a mapped migration target |
| `legacy removal` | parity complete, demos migrated, delete-or-internal decisions landed, deprecation window closed | removing legacy symbols while any required feature still lacks a new contract or example |

Owner rule:

- The orchestrating implementer owns milestone transitions.
- No single doc, demo, or export change should imply a milestone flip on its own.

Export disposition table:

| Current export or surface | Disposition | Migration target | Test owner | Removal phase |
| --- | --- | --- | --- | --- |
| `TrChat` | retain | `TrChat` | `tests/contracts/public-surface.test.mjs` | n/a |
| `TrChat.Root` | add and retain | `TrChat.Root` | next-surface contract tests | n/a |
| `TrChat.Page` | add and retain | `TrChat.Page` | page integration tests | n/a |
| `TrChat.Scaffold` / `TrChatProvider` / `TrChat.Provider` | legacy | `TrChat.Root + TrChat.Page` or `TrChat.Root + primitives` | scaffold/runtime migration tests | Phase 4 |
| `TrChat.Layout` / `TrChat.WorkspaceLayout` | legacy | `TrChat.Page` or `TrChat.WorkspaceShell` | page integration tests | Phase 4 |
| `TrChat.Header` / `TrChat.MessageList` / `TrChat.Sender` / `TrChat.Attachments` / `TrChat.History` / `TrChat.Footer` / `TrChat.WorkspaceShell` | retain | `TrChat.Root + primitives` | primitive UI tests | n/a |
| `TrChat.Welcome` | legacy until `Page` welcome slot lands | `TrChat.Page` or `page-welcome` slot | page integration tests | Phase 4 |
| `TrChat.HistorySurface` / `TrChat.WorkspaceRightSheet` | legacy | workspace slots or `WorkspaceShell` defaults | workspace/page tests | Phase 4 |
| `TrMcpTrigger` / `TrChatMcpPanel` | rename toward `TrChat.McpTrigger` / `TrChat.McpPanel` once parity lands | `Root + primitives` or page slots | workspace/MCP tests | Phase 4 |
| `TrModelSelector` | rename toward `TrChat.ModelSelector` once parity lands | `Root + primitives` | model/runtime tests | Phase 4 |
| `TrChatFeedback` | legacy until message extension parity lands | `config.messages.feedback` or message extension contract | message extension tests | Phase 4 |
| `useChatKit` | legacy | runtime factory plus debug or inspector helpers | runtime contract tests | Phase 4 |
| `useMcpManager` | legacy until MCP contract lands | `config.mcp` plus MCP runtime helpers | MCP parity tests | Phase 4 |
| `useChatAttachments` / `useModelSelector` / `useChatFeedback` | review under parity, keep only if still needed as stable helpers | feature-specific runtime helpers | feature parity tests | Phase 4 |
| `loadChatConfig` / `createChatAdapterFromConfig` / `createPresetChatProps` / `createPresetChatSlices` | legacy | `TrChatConfig` plus `createRuntimeFromConfig(config)` | config contract tests | Phase 4 |
| renderer exports such as `MarkStreamRenderer` / `ErrorRenderer` / `EditInputRenderer` / `ToolCallsRenderer` / `AttachmentsRenderer` | retain under message extension contract unless explicitly replaced | `config.messages.renderers` or Root message extension surface | message extension tests | Phase 3A review, final cleanup in Phase 4 |

Phase 0 must also produce:

- a full export disposition table based on `src/index.ts` and `tests/contracts/public-surface.test.mjs`
- a minimum slot catalog with slot names, slot props, replace or merge precedence, and `slot vs Root + primitives` rules
- explicit ownership for the four cutover milestones above

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

### 2.5 trunk-safe cutover 原则

这轮重构必须补一条显式 cutover 规则，避免主分支进入“旧 surface 还在扩展，新 surface 也没收口”的摇摆状态。

执行原则：

- 任一时刻只能有一套“默认对外推荐”的 public surface
- 新 surface 可以与旧 surface 并存，但必须明确标记为 `next` / `legacy`
- 旧 surface 在 cutover 前只接受必要修复，不再承接新能力设计
- `TrChat` / `TrChat.Root` / `TrChat.Page` 不得在缺少迁移文档、示例、public-surface 测试的情况下替换当前默认入口
- `packages/chat/AGENTS.md`、chat docs、demo、contract tests 必须与 cutover 节点同步更新

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

### 3.1 legacy surface 与测试迁移表

| 对象 | Phase 0-1 | Phase 2 | Phase 3 | Phase 4 |
| --- | --- | --- | --- | --- |
| `src/index.ts` 中的 `Scaffold / Provider / Layout / useChatKit` 等旧 surface | 保持可用并明确标注 legacy | 文档停止把它们当主路径；只保留迁移说明 | 只接受必要修复，不再承接新能力 | 在新 surface、docs、demo、tests 全绿后移除、下放 `internal` 或保留极少量稳定 helper |
| `tests/contracts/public-surface.test.mjs` | 继续保护当前 shipping surface | 新增 next-surface 对照断言或新测试文件 | 旧 surface 断言只保留 cutover 必需项 | 完成 public surface 翻转后重写为新 contract |
| `tests/runtime/scaffold-runtime.test.mjs` | 继续作为当前实现锚点 | 新增 `Root + createRuntimeFromConfig` 对照测试 | 旧 scaffold 只保留回归保护 | cutover 后删除或替换为新的 Root/runtime contract tests |
| `tests/config/*` | 继续保护当前 config 行为 | 新增 next `TrChatConfig` 覆盖，不立即删除 legacy 分支断言 | 逐步把 feature 行为迁移到新 config / runtime contract | cutover 后统一收口旧 config 断言 |
| `tests/ui/chat-ui-context.test.mjs` 与 `tests/contracts/workspace-slot-contract.test.mjs` | 视为当前 shipping workspace 语义锚点 | 保持 green，不允许为了推进新结构而忽略 | 作为 workspace/history/model parity 的硬门禁 | 由新的 workspace/page tests 接替后再调整 |
| `packages/chat/AGENTS.md` 与 chat 相关 docs | Phase 0 纳入对齐清单 | 与 `Root/Page` 默认心智同步 | 跟随 parity 与 cutover 更新 | 完成新 public guidance 收口 |

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
- `ConversationRuntime / MessageRuntime / SenderRuntime / AttachmentsRuntime` 方法级 contract
- `ui vs workspace` 边界表
- `messages vs lifecycle` 边界表
- `sender / attachments` source of truth 规则
- `status / error / capabilities` 是 canonical data 还是 derived view state
- `workspace + history` contract
- `workspace` 第一阶段是否保持为 `packages/chat` 本地 UI runtime
- `message extension contract`
- 官方 `createRuntimeFromConfig(config)` 桥接入口
- primitive 读取边界表
- legacy surface cutover 表
- 具体测试迁移表
- `AGENTS.md` / docs / demo 对齐清单
- phase-to-test matrix
- 旧能力覆盖表

没有这些，不进入实现。

Phase 0 退出条件：

- 三份设计文档中的命名、边界、目录、phase 叙述已经一致
- `ARCHITECTURE_REFACTOR_*.md`、`packages/chat/AGENTS.md`、相关 chat docs 对主路径表述一致
- 边界表和覆盖表进入“可实现”状态，不再依赖口头解释
- cutover 表和测试迁移表已经落地，不再靠临时判断决定删改哪些 surface / tests
- phase-to-test matrix 已写定，后续阶段不再临时补门禁

## Phase 1：runtime foundation + Root baseline

目标：

### Phase 1A：conversation / sender / message foundation

目标：

- 先把最难解耦的消息主链路 contract 定死
- 让 UI 技术上脱离 `chatKit`
- 建立 `TrChat.Root` 的最小可信 on-ramp

必须覆盖：

- `conversation`
- `sender`
- `attachments` handoff
- `message`

必须完成：

- `ChatUIMessage`
- `createTransportRuntime`
- `createConversationRuntime`
- `createSenderRuntime`
- `createMessageRuntime`
- `createAttachmentsRuntime`
- `TrChat.Root`
- `createRuntimeFromConfig(config)`
- `TrChat.Message`
- `TrChat.MessageList`
- `TrChat.Sender`

验收标准：

- UI 中不再直接依赖 `chatKit`
- UI 不再往消息对象写隐藏状态
- `messageId` 语义已覆盖 streaming / rollback / restore
- `edit / retry / regenerate / abort` owner 已可从 contract 直接判断
- sender 与 attachments 的 source of truth handoff 已可运行

Phase 1A 必跑测试：

- runtime contract tests
- `message extension` 最小 contract tests
- `sender / attachments` source of truth contract tests
- `Root + createRuntimeFromConfig` 最小链路测试

Phase 1A 退出条件：

- 基础 runtime suites 全绿
- `Root + whitebox primitives` 最小链路可运行
- attachments 不再是悬空能力

### Phase 1B：history / models / workspace baseline + Page shell

目标：

- 把默认页面真实依赖的 app-shell 基线提前拉齐
- 避免 `TrChat.Page` 在主路径语义未齐时提前“看起来完成”

必须覆盖：

- `history`
- `models`
- `workspace`
- `TrChat.Page` 最小页面壳

必须完成：

- `createHistoryRuntime`
- `createModelRuntime`
- `createWorkspaceRuntime`
- `TrChat.Page`
- `TrChat.Header`
- `TrChat.History`
- `TrChat.ModelSelector`
- `TrChat.WorkspaceShell`

验收标准：

- `workspace / history / model` 不再被视为后置附加项
- `Root + Page` 能跑通默认页面最小主路径
- workspace 响应式行为、history 打开关闭语义、model baseline 行为已被测试保护

Phase 1B 必跑测试：

- workspace / history contract tests
- primitive UI tests: `Header` / `History` / `ModelSelector` / `WorkspaceShell`
- page integration tests: `Root + Page` baseline

Phase 1B 退出条件：

- `Root + Page` 最小主路径可运行
- workspace/history/model baseline 已进入自动化回归保护
- 旧默认页面仍是 shipping path，直到 Phase 2 cutover 条件满足

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
- `TrChat -> Root + Page -> Root + primitives` 迁移示例
- legacy surface discoverability / deprecation 说明

重点验收：

- 文档层不再需要解释 `Scaffold / Provider / presetOverrides`
- 用户只需要理解 `TrChat` 和 `TrChat.Root`
- 常见默认接入能只靠一个 `config` 完成
- `TrChat.Page` 被明确为官方默认页面组件与 preset page layer，而不是第三层独立入口
- `createRuntimeFromConfig(config)` 已成为官方推荐的 Root on-ramp

Phase 2 必跑测试：

- blackbox config contract tests
- page integration tests
- `TrChat` / `Root + Page` / `Root + whitebox primitives` 对照测试
- migration example verification

Phase 2 退出条件：

- 黑盒主路径文档、示例、类型签名一致
- `ui`、`workspace`、`messages`、`lifecycle` 四类入口在黑盒模式下都能找到唯一写入口
- `TrChat.Page` 自身只负责页面组合，不再吞并下层 primitives 的职责
- 默认页面的 workspace/history/model baseline 已与当前 shipping 语义对齐
- 旧 surface 已明确标记 legacy，但未提前删除

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
- 旧默认页面与新默认页面的剩余交互差异

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
- 执行 public surface cutover
- 删除旧术语与旧 surface

Phase 4 必跑测试：

- docs and demo verification
- public surface verification
- full targeted package suite

Phase 4 退出条件：

- 文档、示例、public surface 与实现保持一致
- 每个正式入口至少有一个可运行 demo
- legacy surface 的迁移窗口、保留项、删除项已经执行完毕
- 收口类工作有自动化验证，不是仅靠人工检查

## 7. 测试策略

### 7.0 phase-to-test matrix

| Phase | 必跑测试 | 禁止进入下一阶段的失败项 |
| --- | --- | --- |
| Phase 0 | 文档一致性检查 / cutover 表检查 / 测试迁移表检查 | 命名、边界、目录、phase 叙述不一致；cutover 与测试迁移规则未写定 |
| Phase 1A | runtime contract tests / `message extension` 最小 contract tests / `sender-attachments` contract tests / `Root + createRuntimeFromConfig` baseline tests | runtime source of truth 漂移；attachments handoff 未成立；`messageId` 语义不稳定；Root on-ramp 不可运行 |
| Phase 1B | workspace-history contract tests / primitive UI tests / `Root + Page` baseline integration tests | workspace/history/model baseline 未成立；默认页面主路径仍依赖口头约定 |
| Phase 2 | blackbox config contract tests / page integration tests / `TrChat` vs `Root + Page` 对照测试 / migration example verification | 黑盒配置仍有双入口；`TrChat.Page` 仍吞并下层职责；默认页面 workspace/history/model 语义未对齐；迁移路径不可教 |
| Phase 3A | message extension contract tests / sender-attachments integration tests / feature parity tests: message-sender slice | 消息链路与发送链路没有稳定回归保护 |
| Phase 3B | workspace-history contract tests / page integration tests: workspace variants / feature parity tests: workspace-MCP slice | workspace/history/model/MCP/mobile 主路径语义仍不稳定 |
| Phase 4 | docs and demo verification / public surface verification / full targeted package suite | public surface、文档、demo 与实现不一致；legacy surface 未完成 cutover |

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
- `TrChat -> Root + Page -> Root + primitives` 至少有一条完整迁移示例
- slot catalog 与 slot props 文档已补齐

## 8. 评审 checklist

评审当前方案时，至少逐项确认：

1. 用户是否只需要理解 `TrChat` 和 `TrChat.Root`
2. 用户是否能按“`TrChat` -> `TrChat.Root + TrChat.Page` -> `TrChat.Root + primitives`”理解升级路径
3. 黑盒配置是否按功能域组织，而不是按阶段组织
4. 同一类能力是否只有一个正式写入口
5. `TrChat.Page` 是否被清晰定义为官方页面组件，而不是第三层用户入口
6. `ui`、`workspace`、`messages`、`lifecycle` 是否各自只承担自己的边界
7. runtime modules 是否只承载真正的 source of truth
8. `workspace + history` 是否被视为主路径 contract，而不是后置附加 feature
9. `createRuntimeFromConfig(config)` 是否足以成为官方 Root on-ramp
10. `message extension contract` 是否已经冻结
11. slots 和配置优先级是否明确，并且 slot catalog 可教
12. legacy surface cutover 表与测试迁移表是否已经落地
13. phase 是否把主路径能力放在足够早的位置
14. phase-to-test matrix 是否已经落地
15. 测试是否能按 runtime / primitive / page / feature parity 分层

## 9. 推荐结论

推荐按以下执行策略推进：

- 不做旧 API 兼容层
- 先做契约冻结和能力覆盖表
- 先把 `config.ui / config.lifecycle` 与单一入口原则定死
- 先把 trunk-safe cutover 表、测试迁移表、`AGENTS.md` / docs 对齐门禁写死
- 先把 `Root + runtime foundation + createRuntimeFromConfig` 做成立
- 再补 `history / model / workspace` baseline 与 `Page`
- 再回到黑盒 `TrChat`
- 再补齐 feature parity
- 最后统一收口 helper、docs、demo、tests 与 legacy surface

一句话概括：

先把“contract、cutover、主路径门禁”做对，再把“实现和命名”做完，这样才能真正解决旧方案“功能多但难理解、推进时还容易断层”的问题。
