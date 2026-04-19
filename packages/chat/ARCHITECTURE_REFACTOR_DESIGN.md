# Chat Refactor Design Overview

Status: settled design overview.

Use this file for the target mental model and design-level boundaries.
Use `ARCHITECTURE_REFACTOR_API_RUNTIME.md` for contract detail and `ARCHITECTURE_REFACTOR_EXECUTION.md` for phase/cutover rules.

## 1. 文档状态

本文档是 `packages/chat` 重构设计的总览与索引文档。

它用于回答 4 个问题：

- 为什么要重构
- 重构后对外 API 应该怎样变得更容易理解
- 哪些能力边界必须覆盖到
- 详细设计和实施计划分别去哪看

当前固定前提：

- 当前阶段是开发阶段
- 不以兼容旧 API 为首要目标
- 但必须覆盖旧实现已经提供的功能边界
- 这轮重构要同时提升扩展性、结构清晰度和测试可分层性

与其他文档的关系：

- [ARCHITECTURE_REFACTOR_PROPOSAL.md](./ARCHITECTURE_REFACTOR_PROPOSAL.md)
  负责背景、旧方案问题、方向论证
- [ARCHITECTURE_REFACTOR_API_RUNTIME.md](./ARCHITECTURE_REFACTOR_API_RUNTIME.md)
  负责新的对外 API、配置模型、runtime 模型、UI 边界
- [ARCHITECTURE_REFACTOR_EXECUTION.md](./ARCHITECTURE_REFACTOR_EXECUTION.md)
  负责能力覆盖、目录组织、phase 计划、测试策略

## 2. 这次整理的核心变化

相对上一版长文档，这次做了 4 个明确收敛：

1. 不再把“内部实现分层”直接暴露成“用户使用阶段”
2. 正式对外入口层收敛为两层：`TrChat` 和 `TrChat.Root`
3. 黑盒模式优先使用单一 `config`，并按功能域组织，而不是再拆多个并列顶层概念
4. 先冻结“旧能力如何被新方案承接”，再讨论实现细节与阶段推进

## 3. 重构目标

### 3.1 业务目标

新的 `packages/chat` 要同时服务两类正式用法：

- 开箱即用：
  用户只提供一个清晰的黑盒配置，就能跑起完整聊天页
- 高级定制：
  用户自己提供 runtime，并选择复用官方页面、局部 primitives 或完全白盒拼装

### 3.2 技术目标

- UI 不再直接依赖 `chatKit`
- UI 不再隐式修改消息对象
- 运行时契约按功能域切分，而不是围绕“大 provider + 注入上下文”组织
- 黑盒模式与高级定制模式共用同一套底层 primitives
- 用户按“我要改哪块能力”理解 API，而不是按“我现在到了哪个阶段”理解 API

### 3.3 非目标

- 不要求保留 `ChatScaffold`、`ChatProvider`、`useChatKit` 的兼容语义
- 不要求保留旧命名
- 不要求第一阶段就把 runtime 下沉到 `packages/kit`
- 不要求第一阶段开放所有内部 helper

## 4. 顶层设计结论

### 4.1 正式对外保留两层入口，并显式定义官方页面层

推荐新的正式用户心智分成三部分，但只有两层“入口”：

#### A. `TrChat`

面向默认接入。

适合：

- 快速启动完整聊天页
- 使用官方默认 runtime 和默认页面
- 通过一个清晰的黑盒 `config` 做模型、页面、消息、sender、workspace、history、MCP 等能力配置

#### B. `TrChat.Root`

面向高级定制。

适合：

- 用户自己带 runtime
- 想继续使用官方默认页面时，配合 `TrChat.Page`
- 想局部复用 primitives 或完整白盒拼装页面

#### C. `TrChat.Page`

作为官方 preset page layer 存在。

它不是第三层独立入口，但必须被显式文档化，因为用户会真实经历这条升级路径：

- `TrChat`
- `TrChat.Root + TrChat.Page`
- `TrChat.Root + primitives`

推荐示意：

```vue
<TrChat :config="config" />

<TrChat.Root :runtime="runtime" :ui="ui">
  <TrChat.Page />
</TrChat.Root>

<TrChat.Root :runtime="runtime" :ui="ui">
  <TrChat.Header />
  <TrChat.MessageList />
  <TrChat.Sender />
</TrChat.Root>
```

补充说明：

- `TrChat.Page` 是官方默认页面组件
- 它属于 `TrChat.Root` 之上的官方页面实现，不是第三层独立入口
- `TrChat.Root` 必须配套一条可信的官方桥接入口，例如 `createRuntimeFromConfig(config)`，否则这条升级路径会退化成重写 cliff

### 4.2 不再把这些概念作为主要用户心智

以下概念可以保留为内部实现术语，但不再作为主要公开使用阶段：

- `Scaffold`
- `Provider`
- `Controlled`
- `presetOverrides`
- `integrations`
- `events`
- `overrides`

原因很直接：

- 这些术语更像内部装配层，而不是用户直觉能理解的产品 API
- 旧方案让测试和接入同学很难判断“这类配置到底该放哪一层”
- 新方案需要优先降低决策成本

## 5. 新的 API 设计原则

### 5.1 黑盒模式用一个主配置对象

黑盒 `TrChat` 不再鼓励用户在多个并列顶层 prop 之间做选择。

推荐只有一个主入口：

```ts
type TrChatProps = {
  config: TrChatConfig
}
```

`TrChatConfig` 内部按功能域组织，而不是按“阶段”组织。

### 5.2 配置按功能域组织

黑盒配置优先按这些能力域拆分：

- `request`
- `conversation`
- `ui`
- `workspace`
- `messages`
- `sender`
- `attachments`
- `history`
- `mcp`
- `lifecycle`

这样用户是按“我要改哪一块能力”找配置，而不是按“我现在是不是到了 overrides / provider / preset 这一层”找配置。

### 5.3 命名判断补充

这一轮命名判断再补充 4 条明确规则：

- `ui` 优于 `page`
  因为这里表达的是“展示默认值与文案品牌配置”，而 `page` 已经被 `TrChat.Page` 作为组件名占用
- `lifecycle` 优于 `handlers`
  因为这里承载的是发送、接收、错误、模型切换、会话切换等流程节点处理，而不是泛化的任意 handler 桶
- `TrChat.Page` 继续保留
  它表达的是“官方默认页面组件”，先不继续引入 `DefaultPreset`、`App` 之类新的公开术语
- `ui`、`workspace`、`messages`、`lifecycle` 必须严格分边界
  `ui` 只负责展示默认值；`workspace` 负责壳层结构与区域状态；`messages` 负责消息扩展；`lifecycle` 负责流程节点处理

### 5.4 runtime 只暴露稳定的 source of truth

runtime 设计遵守两个原则：

- 只有真正拥有独立 source of truth 的领域，才提升为一级 runtime module
- UI 是否显示、动作是否可执行，都不通过隐藏状态或消息对象补丁表达

补充：

- `edit / retry / regenerate` 的归属必须在实现前定死，不能只停留在 runtime module 命名层
- `messageId` 必须覆盖 streaming、rollback、transform、恢复、持久化场景下的稳定语义
- `workspace` 在第一阶段按 `packages/chat` 内部公开 UI runtime 处理，不先强行下沉到 `packages/kit`

### 5.5 内部可以继续分层，但不要把内部术语直接外露

内部仍然可以保留这些层：

- runtime factories
- root providers
- preset page implementation
- feature composables

但对外文档和正式 API 应优先保持简单：

- 黑盒：`TrChat`
- 高级定制：`TrChat.Root`
- 官方默认页面组件：`TrChat.Page`
- 可复用白盒组件：`TrChat.* primitives`

## 6. 这轮必须先冻结的边界

在进入实现前，至少要先冻结这几组边界：

1. 正式公开命名与入口层级
   - `TrChat`
   - `TrChat.Root`
   - `TrChat.Page`
2. `TrChatConfig` 的功能域结构
3. `ChatUIMessage` 的稳定 `id` 语义
4. `ConversationRuntime / MessageRuntime / SenderRuntime / AttachmentsRuntime` 的方法级 contract
5. `sender / attachments / conversation.send` 的唯一 source of truth 与 handoff 规则
6. `workspace + history` 的组合 contract，以及 `workspace` 是 chat-local UI runtime 的阶段性定位
7. `messageActions / feedback / renderers / transforms` 的统一扩展 contract
8. `primitive -> runtime` 的读取边界
9. `slot` 与配置项的优先级规则
10. 新旧 public surface 的 cutover 规则、测试迁移表，以及 `AGENTS.md` / docs 的同步门禁

## 7. 旧功能覆盖原则

这轮虽然不考虑兼容性，但必须覆盖旧实现已经提供的能力边界。

验收标准不是“旧 API 还在不在”，而是：

- 旧能力是否在新方案里有正式承接点
- 新承接点是否比旧入口更容易理解
- 复杂能力是否被拆到了清晰、可测试的边界上

重点覆盖对象：

- 发送主链路：`send / abort / retry / regenerate / edit`
- 消息扩展链路：`messageActions / feedback / renderers / transforms`
- sender 能力：草稿、附件、voice、字数统计、发送后清空
- workspace / history / model 的联动能力
- MCP trigger / panel / bridge
- 黑盒、官方默认页面、白盒拼装三类使用方式

## 8. 阅读顺序建议

如果你关心：

- 对外 API 怎么命名才更简单
- `TrChat` 和 `TrChat.Root` 分别怎么用
- `config` 和 `runtime` 应该长什么样
- runtime / message / slot / workspace 的边界怎么切

先看：

- [ARCHITECTURE_REFACTOR_API_RUNTIME.md](./ARCHITECTURE_REFACTOR_API_RUNTIME.md)

如果你关心：

- 旧功能怎么映射到新方案
- phase 怎么拆更合理
- 哪些能力必须提前做 parity guard
- 测试怎么分层

先看：

- [ARCHITECTURE_REFACTOR_EXECUTION.md](./ARCHITECTURE_REFACTOR_EXECUTION.md)

## 9. 推荐结论

当前推荐结论如下：

- 同意做彻底重构，不保留旧 API 兼容层
- 同意以“旧能力覆盖”而不是“旧命名兼容”作为主要约束
- 同意正式对外收敛到 `TrChat` 和 `TrChat.Root` 两层入口心智
- 同意把 `TrChat.Page` 明确为官方默认页面组件与 preset page layer，而不是第三层独立入口
- 同意黑盒模式收敛为单一 `config`，并按功能域组织
- 同意命名上使用 `config.ui` 和 `config.lifecycle`
- 同意 `ui` 只表达展示默认值与文案品牌配置，不承载 workspace 壳层或消息行为扩展
- 同意 `workspace` 单独承接壳层结构、区域状态与 mobile/desktop 布局语义
- 同意同一类能力只保留一个正式写入口，避免再次出现阶段式配置歧义
- 同意旧术语映射主要留在执行文档里，不再放到总览和 API 文档里当作并列心智
- 同意提供 `createRuntimeFromConfig(config)` 这类官方桥接入口，避免 `TrChat.Root` 成为没有 on-ramp 的高级接口
- 同意先冻结 runtime 方法级 contract 与 trunk-safe cutover 规则，再进入实现
- 同意把 runtime、message、workspace、message extension 的边界先冻结，再进入实现

一句话概括：

`packages/chat` 应该从“很多阶段性入口拼起来的聊天组件包”，重建成“默认用法简单、进阶边界清晰、内部可扩展的聊天 UI 系统”。 
