# Chat Package Rebuild Proposal

## 1. 文档目的

这份文档用于帮助团队评估 `packages/chat` 是否应该进行一次彻底重构，以及如果重构，新的方案应该如何设计。

本文档面向两类读者：

- 已经熟悉当前 `chat` 实现的开发者
- 不了解当前实现，但需要参与方案评估、边界讨论和任务拆解的开发者

当前假设：

- 项目仍处于开发阶段
- 这轮讨论暂时不把兼容性作为首要约束
- 评估重点是架构合理性、可扩展性、实现复杂度和后续演进空间

补充说明：

- 本文档主要负责问题分析和方向讨论
- 当前阶段更具体的落地设计已拆分为：
  - `ARCHITECTURE_REFACTOR_DESIGN.md`
  - `ARCHITECTURE_REFACTOR_API_RUNTIME.md`
  - `ARCHITECTURE_REFACTOR_EXECUTION.md`
- 新的详细设计已经采用“runtime 先留在 `packages/chat`，稳定后再评估是否下沉”的前提

## 2. 一句话结论

如果不考虑兼容性，建议把这次工作定义为一次真正的分层重构，而不是在当前 `TrChat` 体系上继续叠加“纯 UI 模式”。

当前阶段更合理的目标是：

- 在 `packages/chat` 内部先重建 runtime 和 UI 的分层边界
- 保持 `TrChat` 作为开箱即用入口
- 新增纯 UI / controlled 用法
- UI 只消费稳定的 runtime interface，不直接依赖 `chatKit`、`responseProvider`、`ChatConfig`
- 等 runtime contract 稳定后，再评估是否下沉到 `packages/kit`

## 3. 当前旧方案梳理

### 3.1 当前架构如何工作

当前 `packages/chat` 的核心链路可以概括为：

`TrChat` -> `ChatScaffold` -> `config/runtime` -> `ChatProvider` -> `chatKit` -> `default renderer / whitebox components`

对应关键文件：

- `src/index.ts`
  对外导出 `TrChat` 和 whitebox 组件，以及 `useChatKit`、`createChatAdapterFromConfig` 等 helper
- `src/components/core/Chat.vue`
  黑盒入口，主要负责把 props 转给 `ChatScaffold`
- `src/components/core/ChatScaffold.vue`
  负责 `config -> adapter -> model state -> preset props/slices -> provider`
- `src/components/core/ChatProvider.vue`
  负责解析或创建 `chatKit`，并把 runtime、history、attachments、mcp、chatUi 等上下文注入给下层
- `src/runtime/config/*`
  负责 `loadChatConfig`、feature 解析、provider factory、preset 投影
- `src/runtime/chat-kit/*`
  负责 `useChatKit`、消息标注、消息临时状态、发送/重试/编辑/重新生成等语义
- `src/components/core/default-renderer/*`
  负责默认页面壳和默认组合方式
- `src/components/workspace/*`
  负责 workspace 左右栏、history 抽屉、移动端/桌面端布局切换等 UI 本地状态

### 3.2 当前方案的优点

- 黑盒和白盒两种用法都已经存在，上手路径清晰
- `config -> projection -> renderer` 的 declarative 体验对 demo 和快速接入比较友好
- `workspace`、`history`、`mcp`、`model selector`、`attachments` 这些功能已经有较完整的 UI 封装
- `TrChat` 的产品化体验较强，适合快速搭建一个可用聊天页

### 3.3 当前方案的核心问题

#### 1. UI 层和 runtime 层耦合过深

当前很多 UI 叶子组件直接依赖 `CHAT_KIT_KEY` 或相关 runtime context。

典型文件：

- `src/components/core/ChatSender.vue`
- `src/components/core/ChatHeader.vue`
- `src/components/core/ChatMessageList.vue`
- `src/components/history/ChatHistoryList.vue`
- `src/components/renderers/ErrorRenderer.vue`
- `src/components/renderers/EditInputRenderer.vue`

这意味着：

- UI 不能独立于默认 runtime 存在
- 用户无法真正替换数据层，只能“接管一部分”
- whitebox 看上去可组合，但底层依然隐含强约束

#### 2. UI 运行时状态会回写到 message 对象

当前实现里，一部分编辑态、错误态、optimistic 状态、渲染标记会直接写回消息对象或消息扩展字段。

典型文件：

- `src/runtime/chat-kit/chatMessageState.ts`
- `src/runtime/chat-kit/chatRenderMessages.ts`
- `src/runtime/chat-kit/useChatConversation.ts`

这意味着：

- 外部 store 难以直接复用自己的 message schema
- UI 状态和业务消息耦合，边界不干净
- 消息是否可复用、可持久化、可回放，会被 UI 实现细节影响

#### 3. UI 公共契约过于 runtime-centric

当前对外主要能力围绕以下概念组织：

- `ChatConfig`
- `responseProvider`
- `chatKit`
- `presetOverrides`
- `messageTransforms`

这些概念对内部实现是自然的，但对“只想自定义数据层”的使用者来说不够直观。

从外部视角看，用户真正关心的是：

- 消息如何进来
- 消息如何发送
- 会话如何切换
- 错误如何显示
- 哪些动作是可用的

但当前公开结构并没有围绕这些能力组织。

#### 4. config、runtime、UI 三层没有真正分开

当前 `ChatScaffold` 同时处理：

- config 归一化
- provider adapter
- model state
- preset 投影
- runtime 注入

这使得很多改动天然跨层：

- 改 UI，容易碰到 runtime
- 改 runtime，容易碰到 config
- 改 config，容易碰到 default renderer

#### 5. context 粒度偏大，feature 边界不够清晰

当前更像是“一个大 provider，下面许多组件共享注入”，而不是按功能域拆开的 runtime/context。

这带来的问题：

- 组件复用边界不清晰
- 局部 feature 很难单独演进
- 状态更新范围更大，不利于后续性能治理

### 3.4 旧方案适合什么，不适合什么

适合：

- 想快速接一个现成聊天页
- 接受官方 runtime 组织方式
- 希望通过 `config` 和少量 slots 完成接入

不适合：

- 用户完全自定义数据层
- 用户使用自有 store、事件总线、WebSocket、agent runtime
- 把 chat 当成可深度拼装的 UI primitives
- 长期演进为真正的 headless + preset 体系

## 4. 业界最佳实践对标

这部分只参考官方文档或官方仓库，不依赖第三方博客。

### 4.1 AI SDK

参考：

- https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat
- https://ai-sdk.dev/docs/ai-sdk-ui/transport
- https://ai-sdk.dev/docs/reference/ai-sdk-core/ui-message
- https://ai-sdk.dev/docs/reference/ai-sdk-core/model-message
- https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence

值得借鉴的点：

- UI 消息模型和模型请求消息模型明确分离
- transport 是可替换的，不强耦合到某一个 provider shape
- 持久化、恢复、流式恢复被视为 runtime 能力，而不是 UI 细节

对我们的启发：

- 必须定义独立的 `ChatUIMessage`
- 发送协议应该通过 transport/runtime 抽象，而不是把 provider 配置塞进 UI

### 4.2 assistant-ui

参考：

- https://www.assistant-ui.com/docs/architecture
- https://www.assistant-ui.com/docs/runtimes/custom/external-store
- https://www.assistant-ui.com/docs/api-reference/runtimes/thread-runtime
- https://www.assistant-ui.com/docs/api-reference/runtimes/ComposerRuntime
- https://www.assistant-ui.com/docs/api-reference/runtimes/message-runtime
- https://www.assistant-ui.com/docs/api-reference/runtimes/ThreadListRuntime

值得借鉴的点：

- runtime 按 feature 拆分，而不是一个大对象吃掉所有能力
- 支持外部 store runtime，这一点和“用户完全自定义数据层”非常契合
- UI 组件消费 runtime interface，而不是直接消费底层 SDK

对我们的启发：

- 新方案不应该只是一个巨大的 `ChatViewBridge`
- 更适合拆成 `conversation / sender / message / history / workspace` 几类 runtime

### 4.3 Stream Chat / Sendbird UIKit

参考：

- https://getstream.io/chat/docs/sdk/react/components/message-input-components/message_input/
- https://getstream.io/chat/docs/sdk/react/components/contexts/message_context/
- https://docs.sendbird.com/docs/chat/uikit/v3/react/modules/overview

值得借鉴的点：

- feature context 拆分明确
- prebuilt UI 和底层状态能力之间有清晰分层
- 模块化程度高，利于替换局部 UI，而不必替换整套系统

对我们的启发：

- `packages/chat` 适合提供两层能力：
  - primitives
  - preset modules / 页面级组合

### 4.4 Bot Framework Web Chat

参考：

- https://github.com/microsoft/BotFramework-WebChat

值得借鉴的点：

- 可以重组整套 UI
- 但内部 store 不是官方推荐的公共集成边界，推荐使用 hooks API

对我们的启发：

- 即使内部使用 store，也不应该把内部 store shape 直接暴露给用户
- 应暴露稳定的 runtime interface / hooks

### 4.5 Radix / Base UI / 状态机思路

参考：

- https://www.radix-ui.com/primitives/docs/overview/introduction
- https://www.radix-ui.com/primitives/docs/guides/composition
- https://v5.mui.com/base-ui/getting-started/
- https://stately.ai/docs

值得借鉴的点：

- primitives 应该专注于结构、交互和可组合性
- 复杂异步流程应有稳定的状态建模，而不是分散在很多局部布尔值里

对我们的启发：

- `send / streaming / abort / retry / error / requires-action` 更适合抽象成显式状态流

## 5. 新方案目标

### 5.1 目标

- 支持真正的“纯 UI”消费方式
- 支持用户完全接管数据层
- 支持官方内置 runtime 作为默认实现
- 让 UI primitives 和 preset UI 能长期独立演进
- 让消息模型、transport、持久化、streaming、history 等能力拥有清晰边界

### 5.2 非目标

- 不以兼容当前 `TrChat` API 为首要目标
- 不追求第一阶段就支持任意业务 schema 直接渲染
- 不把所有组件都改成纯 props drilling
- 不把 demo 方案直接升级为正式架构

## 6. 推荐的新架构

### 6.1 总体分层

推荐拆成两层主包职责。

#### `packages/kit`

负责 headless runtime：

- `ChatUIMessage`、`ChatConversation`、`ChatAttachment`、`ChatToolCall` 等核心类型
- runtime interfaces
- transport interfaces
- 状态流转和生命周期
- persistence / stream resume / session 恢复
- external store 接入层
- provider/http/websocket 等默认 runtime adapter
- UI message 和模型消息之间的转换

#### `packages/chat`

负责 Vue UI：

- Chat primitives
- preset renderer / preset page shell
- workspace 壳层
- history / model selector / attachments / feedback / mcp 等 UI 组合
- Vue composables 和 feature context

### 6.2 新的核心边界

UI 不再直接依赖：

- `chatKit`
- `responseProvider`
- `ChatConfig`
- `provider factory`

UI 只依赖 runtime interface。

建议核心接口按 feature 拆分，而不是一个超大对象。

例如：

- `ConversationRuntime`
  负责消息列表、发送状态、停止生成、重新生成
- `SenderRuntime`
  负责输入框值、上传附件、草稿、发送动作
- `MessageRuntime`
  负责单条消息的编辑、复制、重试、反馈、tool action
- `HistoryRuntime`
  负责历史会话列表、切换、重命名、删除、新建
- `WorkspaceRuntime`
  负责 workspace 本地面板和区域状态
- `ModelRuntime`
  负责当前模型、可选模型、切换模型

### 6.3 新的消息模型

建议引入统一的 `ChatUIMessage`。

设计原则：

- immutable
- 面向 UI
- part-based
- 不混入 provider 私有字段
- 不依赖隐藏属性
- 不把临时 UI 状态偷偷写回原对象

建议结构示意：

```ts
type ChatUIMessage = {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  createdAt?: number
  status?: 'pending' | 'streaming' | 'done' | 'error'
  parts: ChatUIMessagePart[]
  meta?: {
    conversationId?: string
    model?: string
    error?: {
      message: string
      retryable?: boolean
    }
    capabilities?: {
      editable?: boolean
      retryable?: boolean
      regeneratable?: boolean
      feedbackable?: boolean
    }
  }
}

type ChatUIMessagePart =
  | { type: 'text'; text: string }
  | { type: 'markdown'; text: string }
  | { type: 'attachment'; attachment: ChatAttachment }
  | { type: 'tool-call'; toolCall: ChatToolCall }
  | { type: 'tool-result'; toolResult: ChatToolResult }
  | { type: 'error'; message: string }
  | { type: 'custom'; kind: string; payload: unknown }
```

### 6.4 新的 runtime 类型

推荐至少提供两类 runtime。

#### 1. `TransportRuntime`

面向官方默认实现。

负责：

- provider/http/websocket 请求
- 流式响应
- request state
- 持久化与恢复
- 默认消息转换

#### 2. `ExternalStoreRuntime`

面向用户完全自定义数据层。

由用户自己提供：

- `messages`
- `conversations`
- `activeConversationId`
- `send / abort / retry / regenerate / edit`
- `loadMore / createConversation / switchConversation`
- `attachments / models / tool actions`

UI 只消费统一 runtime interface，不关心底层来自 transport 还是外部 store。

### 6.5 新的 UI 结构

建议把 `packages/chat` 拆成两层。

#### 1. primitives

职责：

- 无业务默认值
- 只处理结构、交互、键盘、可访问性、布局
- 接受 feature runtime 或精简 props

例如：

- `ChatRoot`
- `ChatHeader`
- `ChatMessageList`
- `ChatMessage`
- `ChatSender`
- `ChatHistory`
- `ChatWorkspaceShell`

#### 2. presets

职责：

- 默认组合方式
- 默认样式
- 默认 renderer 注册
- 默认 action 组装
- 默认页面布局

例如：

- `TrChat`
- `TrChatWorkspace`
- `DefaultMessageRenderer`

### 6.6 新的配置角色

新的 `config` 不应再作为 UI 的中心。

建议把它降级为“创建默认 runtime 的一种输入方式”。

即：

- `config` 是 `createTransportRuntime(config)` 的输入
- 不是 UI 层主入口
- 不是白盒组件的基础前提

这意味着：

- `ChatScaffold` 可以消失，或者退化为 preset 级 helper
- `configProjection.ts` 这种“UI 预设投影”逻辑应缩到 preset 层

### 6.7 状态管理建议

对于复杂异步流，建议显式定义状态，而不是散落在多个布尔字段里。

至少应覆盖：

- idle
- submitting
- streaming
- awaiting-tool
- aborted
- error
- completed

这不一定要求引入 XState，但要求具备状态机式思维：

- 状态明确
- 转移明确
- impossible states 尽量避免

## 7. 新旧方案对比

| 维度 | 旧方案 | 新方案 |
| --- | --- | --- |
| UI 与 runtime 关系 | 强耦合 | runtime interface 解耦 |
| 核心入口 | `TrChat -> Scaffold -> Provider` | `runtime -> primitives -> presets` |
| 消息模型 | runtime message + UI 注解 | 独立 `ChatUIMessage` |
| 外部自定义数据层 | 困难 | 一等支持 |
| config 角色 | 中心入口 | 默认 runtime 构造输入 |
| 扩展方式 | config / preset / slots / runtime | runtime capability + primitives + presets |
| 状态边界 | provider/context 偏大 | feature-sliced runtime |
| UI 组件复用性 | 中等 | 高 |
| 持久化/恢复 | 与现有 runtime 紧耦合 | runtime 层明确负责 |
| 长期演进空间 | 受限 | 更适合继续扩展 |

## 8. 建议保留和建议删除的部分

### 8.1 建议保留

- 当前 `workspace` 的产品形态和交互经验
- 当前 `history`、`attachments`、`mcp`、`model selector` 这些 feature 的产品概念
- 当前 default renderer 的页面结构经验
- 黑盒和白盒双路径这个产品方向

### 8.2 建议删除或重做

- `CHAT_KIT_KEY` 作为 UI 核心依赖
- `ChatScaffold` 作为中心编排层
- `config` 对 UI 组合的直接支配关系
- 任何对外部消息对象的隐式写操作
- 以 `useChatKit` 为中心的 UI 公共契约

## 9. 推荐的重构实施顺序

由于当前不强调兼容性，建议直接按目标架构重建，不必额外保留 legacy compat layer。

### 第一步：冻结目标契约

先确定：

- `ChatUIMessage`
- `ConversationRuntime`
- `SenderRuntime`
- `MessageRuntime`
- `HistoryRuntime`
- `ModelRuntime`
- `WorkspaceRuntime`

如果这一步没有稳定，不建议进入实现。

### 第二步：把 runtime contract 下沉到 `packages/kit`

产出：

- 新类型
- transport runtime
- external store runtime
- 生命周期/状态流模型
- 消息转换层

### 第三步：重建 `packages/chat` UI primitives

优先实现：

- message list
- sender
- message
- history
- workspace shell

要求：

- 不再依赖 `chatKit`
- 不再写入 message 隐藏状态

### 第四步：基于 primitives 重建 preset UI

产出：

- 新 `TrChat`
- 新 default renderer
- 新 workspace preset

### 第五步：回填 demo、测试、文档

产出：

- 最小 external store demo
- 官方 transport runtime demo
- workspace demo
- docs 更新
- contract tests

## 10. 收益与风险

### 10.1 预期收益

- 真正支持“纯 UI + 自定义数据层”
- 消息模型更清晰，后续支持多后端、多协议更容易
- UI primitives、preset UI、runtime 分层清楚，后续维护成本更低
- 更适合未来接 agent runtime、workflow runtime、WebSocket runtime
- 更适合做测试，尤其是 runtime contract tests 和 UI contract tests

### 10.2 主要风险

- 一次性重构范围较大
- 需要重新定义 `packages/kit` 和 `packages/chat` 的职责边界
- 旧有 feature 迁移时，容易出现“功能看似都有，细节行为不一致”
- 如果 runtime contract 设计不好，后面会形成新一轮锁定

## 11. 评审时建议重点讨论的问题

以下问题最值得在评审时优先确认。

### 11.1 架构边界

- 是否认同 `packages/kit` 负责 headless runtime，`packages/chat` 负责 Vue UI？
- 是否认同 `config` 应降级为默认 runtime 的输入，而不是 UI 中心入口？
- 是否认同 `ChatScaffold` 不再作为未来主架构核心？

### 11.2 消息模型

- 是否接受引入全新的 `ChatUIMessage`？
- `ChatUIMessage` 是否应该 part-based？
- tool call、tool result、attachments、error 是否都应收敛到统一 part 模型？

### 11.3 runtime 粒度

- 是做一个总 runtime，再通过 hooks 拆分读取，还是直接提供多个 feature runtime？
- `workspace` 应该算 UI 本地状态，还是也进入统一 runtime？
- `model` 和 `conversation` 是否应该是独立 runtime？

### 11.4 配置与扩展方式

- `config` 的最小保留范围是什么？
- `presetOverrides` 是否还需要保留，还是改成更明确的 slot / renderer / capability 配置？
- 官方是否要同时提供 `TransportRuntime` 和 `ExternalStoreRuntime`？

### 11.5 状态管理方式

- 是否引入正式状态机库，还是只保留状态机式建模？
- `editing / retrying / regenerating / awaiting-tool` 是否都进入显式状态流？

## 12. 待决策问题

以下是我当前认为还拿不准、需要团队明确拍板的点。建议在评审时逐项确认。

### D1. `packages/kit` 是否真的要承接新的 chat runtime contract

两种可能：

- 方案 A：`packages/kit` 成为 headless chat runtime 的正式归属地
- 方案 B：新的 runtime 仍留在 `packages/chat`，等稳定后再考虑下沉

我的倾向：

- 更偏向方案 A，因为它更符合当前 monorepo 的职责分层

不确定点：

- 这会不会让 `kit` 的职责膨胀过快
- 团队是否接受在这轮重构里同时调整两个包的定位

### D2. `ChatUIMessage` 的粒度应该多细

两种可能：

- 方案 A：只做较薄的统一消息结构，parts 类型先少一些
- 方案 B：从一开始就完整支持 text、markdown、tool-call、tool-result、attachment、error、custom

我的倾向：

- 更偏向方案 B 的方向，但第一阶段实现可以比目标模型更保守

不确定点：

- 如果一开始收得太窄，后续扩展时会不会再次破坏结构
- 如果一开始放得太宽，首轮实现复杂度会不会偏高

### D3. runtime interface 是“一个根对象”还是“多个 feature runtime”

两种可能：

- 方案 A：一个根 `ChatRuntime`，内部再通过 hooks 暴露局部能力
- 方案 B：直接公开多个 feature runtime，根节点只做组装

我的倾向：

- 更偏向方案 B，因为更利于解耦和按需消费

不确定点：

- Vue 侧的使用体验是否会因此变复杂
- 对简单 blackbox 用法是否需要一个聚合层来保持易用性

### D4. `workspace` 状态是否进入统一 runtime

两种可能：

- 方案 A：`workspace` 纯属 UI 本地状态，留在 `packages/chat`
- 方案 B：`workspace` 也进入统一 runtime，便于外部完全接管

我的倾向：

- 更偏向方案 A

不确定点：

- 如果未来强需求要求外部控制左右栏、sheet、history 可见性，是否还要再次上提接口

### D5. `config` 是否还保留 declarative feature projection

两种可能：

- 方案 A：保留一部分 declarative projection，用于 preset runtime 初始化
- 方案 B：大幅收缩 `config`，让它只负责 transport/runtime 构造

我的倾向：

- 更偏向方案 B

不确定点：

- 如果收得太狠，会不会损失当前 `TrChat` 的快速接入体验

### D6. 是否需要正式引入状态机库

两种可能：

- 方案 A：引入状态机库，统一异步生命周期表达
- 方案 B：不引入库，只保留状态机式建模和显式状态定义

我的倾向：

- 更偏向方案 B，先把模型做对，再决定要不要上库

不确定点：

- 如果后续 tool flow、multi-step flow 很复杂，不上库会不会导致逻辑再次分散

### D7. whitebox API 的公开粒度应该到什么程度

两种可能：

- 方案 A：公开 primitives 和少量 composable
- 方案 B：进一步公开更细的 feature component 和 renderer contract

我的倾向：

- 更偏向方案 A 起步

不确定点：

- 如果公开太少，用户可能仍然觉得“不够白盒”
- 如果公开太多，维护面会急剧扩大

### D8. 历史会话、模型、附件、MCP 是否都要在第一阶段进入统一 runtime

两种可能：

- 方案 A：第一阶段只统一 conversation + sender + message，其他 feature 后续补齐
- 方案 B：第一阶段把 conversation、history、model、attachments、MCP 一次性统一完

我的倾向：

- 更偏向方案 A，先打通主干

不确定点：

- 如果第一阶段范围过窄，第二阶段是否会再次遇到契约重切

## 13. 建议的评审结论格式

为了方便收敛讨论，建议最后把评审意见沉淀成下面这几项结论：

- 是否同意“彻底重构而不是增量补丁”
- 是否同意新的包级职责切分
- 是否同意新的消息模型方向
- 是否同意 feature-sliced runtime 方向
- 第一阶段的最小可交付范围是什么
- 哪些待决策问题需要在实现前先拍板

## 14. 推荐结论

基于当前代码现实和业界主流实现方式，我推荐的方向是：

- 同意做彻底重构
- 第一阶段把新的 runtime contract 保留在 `packages/chat`
- 等 runtime contract 稳定后，再评估是否下沉到 `packages/kit`
- 同意引入独立 `ChatUIMessage`
- 同意采用 feature-sliced runtime
- 同意把 `config` 收缩为黑盒模式的构造输入
- 第一阶段先打通 `conversation + sender + message + preset UI` 主链路

如果要一句话概括，就是：

不要继续把 `chat` 做成“内置 runtime 的大组件”，而应该先在 `packages/chat` 内把它重建成“runtime modules + Vue primitives + preset UI”的体系。
