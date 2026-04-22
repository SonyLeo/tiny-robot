# Chat Refactor Execution Plan

Status: active development-phase execution plan.

This document owns phase gates, implementation sequencing, and validation expectations for the refactor while it is still in active development.
When it conflicts with the historical proposal, this document wins.

For review cadence, phase status tracking, and stage-level decisions, use
`alignment-tracker.md`.

当前阶段固定前提：

- 这是开发阶段文档，不以对外导出切换、deprecation、对外文档默认心智切换为当前门禁
- 旧实现只作为能力边界、测试锚点和目录来源参考，不作为 API 命名兼容目标
- 评审与实现优先级按 contract freeze、runtime 落地、page 落地、feature parity、测试分层推进

Development milestones:

| Milestone | Required artifacts | Forbidden repository state |
| --- | --- | --- |
| `contract freeze ready` | runtime owner tables, slot catalog, bridge subset, source-of-truth rules, implementation routing | opening runtime implementation while contract still depends on口头解释 |
| `Root baseline runnable` | `Root`, `conversation/sender/message/attachments` baseline, `messageId`, Phase 1A tests | writing page/app-shell code before Root baseline and send chain are stable |
| `Page baseline runnable` | `history/models/workspace` baseline, `Page`, primitive/page baseline tests | claiming default page is ready while app-shell contract is still implicit |
| `feature parity runnable` | message extension, MCP, workspace details, parity tests | treating feature gaps as postscript after runtime/page shapes have shipped internally |
| `hardening ready` | contract source artifacts, targeted suites, docs/AGENTS implementation guidance | continuing implementation while contracts and tests still drift |

Owner rule:

- The orchestrating implementer owns milestone transitions.
- No single doc, demo, or export change should imply a milestone flip on its own.

Old implementation boundary reference:

| Current boundary or anchor | Refactor target owner | Dev-stage treatment | Test owner |
| --- | --- | --- | --- |
| `Chat.vue` blackbox entry | `TrChat` + `TrChatConfig` | 只作为黑盒能力边界参考 | blackbox config tests |
| `ChatScaffold.vue` / `ChatProvider.vue` | `TrChat.Root`, `TrChat.Page`, primitives | 只作为旧实现边界与组合拆分参考 | runtime/page baseline tests |
| `useChatKit` and runtime chat-kit chain | `conversation/message/sender/attachments` runtimes | 只作为旧消息主链路 owner 参考 | runtime contract tests |
| workspace components and slot behavior | `workspace/history/models` runtimes + `Page`/`WorkspaceShell` | 只作为 app-shell 行为参考 | workspace/history/page tests |
| `messageActions / renderers / transforms / feedback` | message extension contract | 只作为 feature 边界参考 | message extension tests |
| MCP trigger/panel/manager | `mcp runtime` + primitives / page slots | 只作为 MCP 边界参考 | MCP parity tests |

Phase 0 must also produce:

- a full old-boundary reference table based on current code and tests
- a minimum slot catalog with slot names, slot props, replace or merge precedence, and `slot vs Root + primitives` rules
- contract source artifacts for slot catalog, page slot props, config bridge matrix, and public surface intent
- explicit ownership for the development milestones above

## 1. 文档角色

本文档负责回答：

- 旧实现的能力边界如何被新方案覆盖
- 目录结构与职责如何切清
- phase 应该怎样拆才不至于中途返工
- 测试如何分层

对外 API 与 runtime 设计请看：

- [api-runtime.md](./api-runtime.md)

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

### 2.5 开发期实现路由原则

这轮重构在开发阶段必须补一条显式实现路由规则，避免团队一边写新 runtime，一边继续把结构性改动长回旧路径。

执行原则：

- 新的结构性实现优先写入 `src/root`、`src/page`、`src/primitives`、`src/runtime/*`、`src/legacy`
- 旧实现只作为能力边界与测试锚点参考，不作为当前方案的命名或分层约束
- `Chat.vue`、`ChatScaffold.vue`、`ChatProvider.vue` 在当前阶段不承担重构决策 source of truth，只承担旧边界参考
- 没有 contract source、runtime contract tests、最小 page tests 之前，不进入大范围 feature 扩展
- `packages/chat/AGENTS.md` 必须优先服务实现路由与评审，不必等待对外文档切换默认心智才允许推进代码结构

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
| messageTransforms | `runtime.messageTransforms` | `config.messages.transforms`；在 refactor target 中 owner 冻结为 `message runtime` extension pipeline |
| callbacks / onBeforeSend / onError | `callbacks + scaffold/provider callbacks` | `config.lifecycle.*` |
| feedback | `features.feedback + ChatFeedback` | `config.messages.feedback + message extension contract` |
| attachments | `features.attachments + attachmentsManager` | `sender runtime + attachments runtime + config.attachments` |
| sender voice / wordCount | `senderActionsFeature` | `config.sender.*` |
| MCP | `mcpManager + trigger + panel` | `config.mcp + mcp feature contract` |
| runtime 观测与调试 | `chatKit.runtime.*` | 后续单独 inspector / debug composables |
| helper / public composables | `useChatKit/useMcpManager/useChatAttachments/...` | 重构完成后重新收口，保留必要稳定 helper |

### 3.1 旧实现边界与测试锚点表

| 对象 | 当前阶段角色 | 开发期处理原则 |
| --- | --- | --- |
| `src/index.ts` 里的旧 surface | 现状参考，不是当前实现门禁 | 不围绕旧导出做设计回退 |
| `tests/contracts/public-surface.test.mjs` | 现状锚点 | 只用于识别当前 shipping surface，不作为 refactor contract freeze 门禁 |
| `tests/runtime/scaffold-runtime.test.mjs` | 旧主链路锚点 | 用于对照旧行为边界，不绑定新 runtime 的结构实现 |
| `tests/config/*` | 旧黑盒 config 行为锚点 | 用于识别旧能力范围，不要求新方案继续复刻旧入口组织方式 |
| `tests/ui/chat-ui-context.test.mjs` 与 `tests/contracts/workspace-slot-contract.test.mjs` | workspace 行为锚点 | 作为 workspace/history/model 语义参考，直到新的 page/workspace tests 接管 |
| `packages/chat/AGENTS.md` | 实现路由说明 | 优先服务当前开发阶段的评审与实现，而不是对外发布切换 |

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
  root/
    TrChatRoot.vue
    rootContext.ts
    normalizeRuntime.ts
  page/
    TrChatPage.vue
    TrChatPageHeaderRegion.vue
    TrChatPageBodyRegion.vue
    TrChatPageFooterRegion.vue
  primitives/
    TrChatHeader.vue
    TrChatMessageList.vue
    TrChatMessage.vue
    TrChatSender.vue
    TrChatFooter.vue
    TrChatHistory.vue
    TrChatModelSelector.vue
    TrChatWorkspaceShell.vue
    TrChatAttachments.vue
    TrChatMcpTrigger.vue
    TrChatMcpPanel.vue
  runtime/
    core/
      types.ts
      keys.ts
      normalizeRuntime.ts
      resolveRuntimeCapabilities.ts
    config/
      createRuntimeFromConfig.ts
      normalizeTrChatConfig.ts
      mapLifecycleHooks.ts
    conversation/
      createConversationRuntime.ts
      messageId.ts
      transforms.ts
    sender/
      createSenderRuntime.ts
    message/
      createMessageRuntime.ts
      actionRegistry.ts
      rendererRegistry.ts
      viewState.ts
    history/
      createHistoryRuntime.ts
    models/
      createModelRuntime.ts
    workspace/
      createWorkspaceRuntime.ts
    attachments/
      createAttachmentsRuntime.ts
    mcp/
      createMcpRuntime.ts
  legacy/
    createLegacyScaffoldBridge.ts
    createLegacyProviderBridge.ts
```

### 5.1 ownership 原则

- `root/`
  只负责 runtime normalize、provide、上下文边界
- `page/`
  只负责官方默认页面结构与 slot contract
- `primitives/`
  只负责单一 UI 职责，不负责跨区域状态编排
- `runtime/`
  只放 source of truth、动作语义与 feature registry；`runtime/message/*` 承接 actions / feedback / renderers，`runtime/mcp/*` 承接 MCP bridge
- `legacy/`
  只承接 shipping surface 的 adapter、wrapper 与 `index -> id` 转译边界

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
- `ChatSendInput / ChatPendingAttachment / ChatResolvedMessageAction / ChatResolvedRenderer / ChatWorkspaceRegionRuntime` 最小辅助类型 contract
- `ui vs workspace` 边界表
- `messages vs lifecycle` 边界表
- `sender / attachments` source of truth 规则
- `status / error / capabilities` 是 canonical data 还是 derived view state
- `workspace + history` contract
- `workspace` 第一阶段是否保持为 `packages/chat` 本地 UI runtime
- `mcp` 是否进入 `ChatRuntimeInput / ChatRuntime`
- `message extension contract`
- 官方 `createRuntimeFromConfig(config)` 桥接入口
- `TrChat.Page` slot-provider contract
- `TrChat.Page` 的 footer companion region contract
- primitive 读取边界表
- slot catalog 最终命名
- `messageTransforms` 的正式 owner
- Phase 1A bridge 支持范围
- 旧实现边界参考表
- 高风险 alias / type 锚点表
- 当前 `src/index.ts` 公开面附录（参考，不是开工门禁）
- 关键测试锚点表
- `AGENTS.md` 实现路由清单
- phase-to-test matrix
- 旧能力覆盖表

没有这些，不进入实现。

Phase 0 退出条件：

- 三份设计文档中的命名、边界、目录、phase 叙述已经一致
- `ui` 不再同时存在 display-only 版本与 `ui.page / ui.messages / ui.slots` 版本
- slot catalog 已只保留一套公开命名，不再并行维护 `page-*` 与无前缀双体系
- `docs/refactor/design/*.md`、`packages/chat/AGENTS.md`、相关 chat docs 对主路径表述一致
- 边界表和覆盖表进入“可实现”状态，不再依赖口头解释
- 旧实现边界参考表和测试锚点表已经落地，不再靠临时判断决定该参考哪些旧结构 / tests
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
- `createConversationRuntime`
- `createSenderRuntime`
- `createMessageRuntime`
- `createAttachmentsRuntime`
- `TrChat.Root`
- `createRuntimeFromConfig(config)`
- `TrChat.Message`
- `TrChat.MessageList`
- `TrChat.Sender`

附加门禁：

- 必须显式写清 Phase 1A bridge 只支持哪些 `config` 域
- 不允许把 Phase 1A helper 宣称为“已完整覆盖黑盒路径”的官方 on-ramp

字段级 bridge subset 必须至少冻结成下面这张表：

| config 字段 | Phase 1A 状态 | 说明 |
| --- | --- | --- |
| `request.transport`, `request.systemPrompt` | `supported` | conversation baseline |
| `request.defaultModelId` | `fixed-default-only` | 只作为 `ChatSendInput.modelId` 默认值注入 |
| `request.models` | `deferred` | 不承诺产出 `models runtime` |
| `conversation.initialMessages` | `supported` | conversation seed baseline；在没有 active-conversation restore 时需 eager materialize 首屏 baseline，且第一次 send 不得重复注入 seed |
| `conversation.persistence` | `supported` | 只承诺 active-conversation hydrate / restore，不代表已有 `history runtime` |
| `ui.*` | `supported` | 严格 display-only |
| `sender.*` | `supported` | sender baseline |
| `attachments.*` | `supported` | attachments prepare + handoff baseline |
| `messages.actions`, `messages.renderers`, `messages.feedback` | `supported` | 最小 message extension 链 |
| `messages.transforms` | `deferred` | owner 已冻结为 message extension pipeline，但不属于 Phase 1A bridge 承诺 |
| `lifecycle.beforeSend`, `lifecycle.error` | `supported` | 最小 bridge hook |
| `lifecycle.afterReceive` | `deferred` | 顺序冻结，但不要求 Phase 1A bridge 落地 |
| `history.*`, `workspace.*`, `models.*`, `mcp.*` | `deferred` | 等 Phase 1B 或之后 |
| `lifecycle.modelChange`, `lifecycle.conversationChange` | `deferred` | 等 `models / history` baseline 建立后再接入 |

当前状态补充：

- 上表是 `Phase 1A` 当时冻结的 bridge subset。
- `lifecycle.afterReceive` 在 `Phase 1A` 时仍是 deferred。
- 进入 `Phase 2` 后，target `TrChatConfig` 黑盒入口已经允许把生命周期兼容的 `callbacks.onFinish` 规范化到 `config.lifecycle.afterReceive`，并继续走 `Root + Page` 主路径；当前状态以 `design/api-runtime.md` 和 `generated/config-bridge-matrix.md` 为准。

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
- package shorthand:
  `pnpm -F @opentiny/tiny-robot-chat check:phase-1a`

Phase 1A 退出条件：

- 基础 runtime suites 全绿
- `Root + whitebox primitives` 最小链路可运行
- attachments 不再是悬空能力
- `conversation.initialMessages` 首屏 baseline 语义已锁定并有测试保护
- footer companion region 只冻结 `footer-extra` augment slot 的实现期处理已显式记录并有 contract tests

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

Phase 1B bridge subset note:

- `createRuntimeFromConfig(config)` 进入 Phase 1B 后，允许把 `request.models`、`request.defaultModelId`、`history.*`、`workspace.*` 显式桥接到 `models / history / workspace` baseline runtime。
- `lifecycle.modelChange` 和 `lifecycle.conversationChange` 仍然保持 deferred，直到对应 runtime baseline 之外的 hook contract 也被实现并验证。

验收标准：

- `workspace / history / model` 不再被视为后置附加项
- `Root + Page` 能跑通默认页面最小主路径
- workspace 响应式行为、history 打开关闭语义、model baseline 行为已被测试保护

Phase 1B 必跑测试：

- workspace / history contract tests
- primitive UI tests: `Header` / `History` / `ModelSelector` / `WorkspaceShell`
- page integration tests: `Root + Page` baseline
- package-local mounted proof command: `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`

Phase 1B 退出条件：

- `Root + Page` 最小主路径可运行
- workspace/history/model baseline 已进入自动化回归保护
- 旧默认页面仍只作为边界对照参考，直到新的 page baseline 稳定

## Phase 2：黑盒 `TrChat` + 官方 `TrChat.Page`

目标：

- 建立新的黑盒心智
- 让默认页面重新可用，并且比旧方案更容易理解

当前 `Phase 2` 已先落地一条最窄 kickoff preview：

- 当 `TrChat` 收到的输入已经匹配 target `TrChatConfig`
- 且没有额外提供 `runtime`、`presetOverrides`
- `callbacks` 要么缺省，要么只包含生命周期兼容的 `onFinish / onError`

默认黑盒入口已允许先走：

`createRuntimeFromConfig(config) -> Root + Page`

同时保留明确的 compatibility fallback：

- 旧 shipping `ChatConfig` 形态
- 仍依赖 scaffold 语义的 callbacks：`onBeforeSend`、`onMessageAction`、`onModelChange`
- compatibility-only props

它们当前仍显式回退到 `ChatScaffold`。
`Review C` 需要拍板的是：这条 preview 是否可以继续扩成正式的黑盒默认主路径。

必须完成：

- `TrChat`
- `TrChat.Page`
- `TrChatConfig` 全域解析
- 黑盒 slots
- request / ui / workspace / history / sender / messages / lifecycle 的主路径配置
- `TrChat.Page` 与 `WorkspaceShell` / `Header` / `MessageList` / `Sender` 的默认组合关系
- `TrChat -> Root + Page -> Root + primitives` 开发期示例
- 黑盒主路径的实现说明与评审样例

重点验收：

- 文档层不再需要解释 `Scaffold / Provider / presetOverrides`
- 用户只需要理解 `TrChat` 和 `TrChat.Root`
- 常见默认接入能只靠一个 `config` 完成
- `TrChat.Page` 被明确为官方默认页面组件与 preset page layer，而不是第三层独立入口
- `createRuntimeFromConfig(config)` 已成为带显式 bridge subset 的官方推荐 Root on-ramp

Phase 2 必跑测试：

- blackbox config contract tests
- page integration tests
- `TrChat` / `Root + Page` / `Root + whitebox primitives` 对照测试
- blackbox example verification

Phase 2 退出条件：

- 黑盒主路径文档、示例、类型签名一致
- `ui`、`workspace`、`messages`、`lifecycle` 四类入口在黑盒模式下都能找到唯一写入口
- `TrChat.Page` 自身只负责页面组合，不再吞并下层 primitives 的职责
- 默认页面的 workspace/history/model baseline 已与当前 shipping 语义对齐
- 旧实现边界与新 contract 的对应关系已稳定

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

## Phase 4：稳定化、评审材料、测试、helper 收口

目标：

- 收口开发期评审材料
- 补齐 docs / tests / examples
- 评估哪些 helper 应继续保留

完成项：

- docs / AGENTS / blueprint / execution 口径统一
- 关键 examples 与 targeted suites 收口
- helper / inspector 收口
- 旧边界参考与新 contract 对照稳定

Phase 4 必跑测试：

- docs and example verification
- full targeted package suite

Phase 4 退出条件：

- 文档、示例、public surface 与实现保持一致
- 每个正式入口至少有一个可运行 demo
- 旧边界参考与新 contract 的对应关系已固化
- 收口类工作有自动化验证，不是仅靠人工检查

## 7. 测试策略

### 7.0 phase-to-test matrix

| Phase | 必跑测试 | 禁止进入下一阶段的失败项 |
| --- | --- | --- |
| Phase 0 | 文档一致性检查 / 旧边界参考表检查 / 测试锚点表检查 / slot catalog contract tests / contract source tests | 命名、边界、目录、phase 叙述不一致；slot 命名或 `ui` contract 仍双轨；旧边界参考仍依赖口头解释 |
| Phase 1A | runtime contract tests / `message extension` 最小 contract tests / `sender-attachments` contract tests / `Root + createRuntimeFromConfig` baseline tests | runtime source of truth 漂移；attachments handoff 未成立；`messageId` 语义不稳定；Root on-ramp 不可运行 |
| Phase 1B | workspace-history contract tests / primitive UI tests / `Root + Page` baseline integration tests | workspace/history/model baseline 未成立；默认页面主路径仍依赖口头约定 |
| Phase 2 | blackbox config contract tests / page integration tests / `TrChat` vs `Root + Page` 对照测试 / blackbox example verification | 黑盒配置仍有双入口；`TrChat.Page` 仍吞并下层职责；默认页面 workspace/history/model 语义未对齐；黑盒主路径仍不可评审 |
| Phase 3A | message extension contract tests / sender-attachments integration tests / feature parity tests: message-sender slice | 消息链路与发送链路没有稳定回归保护 |
| Phase 3B | workspace-history contract tests / page integration tests: workspace variants / feature parity tests: workspace-MCP slice | workspace/history/model/MCP/mobile 主路径语义仍不稳定 |
| Phase 4 | docs and example verification / full targeted package suite | 文档、示例、tests 与实现不一致；旧边界参考与新 contract 仍漂移 |

### 7.0A contract source tests

验证：

- slot catalog 命名与 precedence
- `TrChat.Page` slot-provider contract
- `config -> { runtime, ui }` bridge mapping
- old export / helper boundary reference

这些 tests 不能只靠 grep prose 文档，必须先有最小 contract source artifact。

推荐最小产物：

- `src/runtime/contracts/slotCatalog.ts`
- `src/runtime/contracts/pageSlotProps.ts`
- `src/runtime/contracts/configBridgeMatrix.ts`
- `src/runtime/contracts/publicSurfaceMatrix.ts`

contract tests 应优先断言这些 artifact，再由 docs 引用它们。

### 7.1 runtime contract tests

验证：

- `ChatUIMessage`
- `conversation / sender / message / history / models / workspace / attachments / mcp`
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
- `TrChat -> Root + Page -> Root + primitives` 至少有一条完整开发期实践示例
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
12. 旧实现边界参考表与测试锚点表是否已经落地
13. phase 是否把主路径能力放在足够早的位置
14. phase-to-test matrix 是否已经落地
15. 测试是否能按 runtime / primitive / page / feature parity 分层

## 9. 推荐结论

推荐按以下执行策略推进：

- 不做旧 API 兼容层
- 先做契约冻结和能力覆盖表
- 先把 `config.ui / config.lifecycle` 与单一入口原则定死
- 先把旧边界参考表、测试锚点表、`AGENTS.md` 实现路由门禁写死
- 先把 `Root + runtime foundation + createRuntimeFromConfig` 做成立
- 再补 `history / model / workspace` baseline 与 `Page`
- 再回到黑盒 `TrChat`
- 再补齐 feature parity
- 最后统一收口 helper、docs、examples、tests 与旧边界参考

一句话概括：

先把“contract、旧边界参考、主路径门禁”做对，再把“实现和命名”做完，这样才能真正解决旧方案“功能多但难理解、推进时还容易断层”的问题。
