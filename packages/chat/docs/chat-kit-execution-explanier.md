# Chat Kit Execution Explainer

> 面向 `packages/chat` 当前正式结构与实现方式的对内讲解文档。
> 本文档负责把“为什么这样做、接下来怎么做、如何向别人解释”讲清楚。
> 设计源见 [chat-kit-design.md](./chat-kit-design.md)。
> 执行决议见 [packages/chat/chat-kit-review-02.md](../packages/chat/chat-kit-review-02.md)。
> 实时状态见 [packages/chat/progress.md](../packages/chat/progress.md)。

---

## 1. 这份文档回答什么问题

这份文档不重复设计文档和进度文档的职责，而是集中回答下面几个更适合对内沟通的问题：

- `packages/chat` 当前真正缺的是什么
- 为什么当前不应再继续堆 props、堆页面、堆模板
- 为什么 feature registry / resolver 是当前结构的关键
- attachments / sender actions / welcomePrompts / MCP / layout 各自应该怎么理解
- 黑盒、白盒、`chat-cli` 为什么必须共享同一套能力底座
- 当前这套分层和业界成熟方案相比，到底借鉴了什么

一句话说，它是一份“讲给团队听”的解释文稿。

---

## 2. 一句话主结论

`packages/chat` 当前真正的主线，已经不是继续补聊天基础组件，而是：

> 把已经存在的聊天运行时能力，系统化升级为稳定、声明式、可被黑盒、白盒、`chat-cli` 和更高层 preset/skill 共同消费的能力 contract。

这里最重要的关键词不是“新组件”，而是：

- 稳定
- 声明式
- 可复用
- 可生成

如果今天你要拿这份内容去对团队讲，建议在这一节后面立刻补一句：

> 我们不是在继续堆聊天页面，而是在把聊天能力沉淀成一套可声明、可装配、可生成、可组合的工程底座。

---

## 3. 当前真实问题到底是什么

如果只看表面，会以为 `packages/chat` 还缺很多东西。

但从当前代码和设计结论看，实际情况不是“没有能力”，而是“能力已经有了，但能力的装配方式还不稳定”。

当前已经存在的基础包括：

- 黑盒入口：`TrChat`
- 白盒入口：`TrChat.Root / Layout / Header / Welcome / MessageList / Footer / Sender / History`
- 状态组合层：`useChatKit`
- 配置主链路：`ChatConfig -> createChatAdapterFromConfig() -> createPresetChatProps()`
- 已存在的场景能力：历史、反馈、模型切换、重试、optimistic / rollback、MCP 接入、docs variant、统一消息动作入口

从实现上也能看出，`packages/chat` 已经在消费 TinyRobot 的原子能力，而不是从零造轮子：

- `ChatSender.vue` 直接包裹 `TrSender`
- `AttachmentsRenderer.vue` 直接包裹 `TrAttachments`
- `ChatWelcome.vue` 直接包裹 `TrWelcome` 和 `TrPrompts`
- `ChatMcpPanel.vue` 直接包裹 `TrMcpServerPicker`

所以真正的差距，不在“有没有 Sender / Attachments / Prompts / MCP Picker”，而在：

1. 这些能力是否有统一声明入口
2. 是否有统一解析入口
3. 黑盒和白盒是否共享同一套默认能力
4. `chat-cli` 是否能稳定消费这些能力

也就是说，当前偏窄的是：

- 配置层
- adapter 层
- feature 装配层

而不是底层原子组件层。

---

## 4. 为什么不能继续按老路往前走

如果不先解决装配层问题，继续沿着“页面手工 wiring”前进，会出现三个很现实的问题。

### 4.1 `TrChat` 会越来越像“大 props 容器”

每加一个高频能力，都往 `TrChatProps` 里补几个离散字段，短期快，长期一定失控。

最后会变成：

- 配置入口分散
- 默认值逻辑分散
- 黑盒行为难预测
- 白盒难复用

### 4.2 高价值能力会停留在“demo 可拼、页面可接”

比如：

- attachments
- sender actions
- welcome prompts
- drag upload
- conversations navigation
- 更完整的 MCP 管理

这些能力如果只是“原子组件有了”和“某个 demo 能拼出来”，那它们仍然不算 `chat` 的正式能力。

### 4.3 `chat-cli` 会继续走“复制页面”路线

如果底层没有稳定的 feature 契约，CLI 模板就只能依赖：

- 不同版本的 `App.vue`
- 大量页面层 if/else
- 手工拼 welcome / sender / side panel / MCP

这类模板越多，债越大。

---

## 5. 当前正式结构是什么

现在更适合把 `packages/chat` 理解为一条已经落地的能力装配链，而不是一组待规划的阶段性工作。

```text
ChatConfig
  -> Feature Registry / Resolver
  -> ChatAdapter
  -> presetProps / presetSlices
  -> TrChat / TrChat.* / chat-cli

AgentPreset / SkillPack
  -> resolve 成 ChatConfig patch
  -> 回到上面这条主链
```

如果只看最新实现，当前已经正式存在的结构包括：

- 黑盒入口：`TrChat`
- 白盒入口：`TrChat.Root / Layout / Header / Welcome / MessageList / Footer / Sender / History`
- preset 入口：`TrChat.PresetRoot`
- 运行时主引擎：`useChatKit`
- 配置主链路：`ChatConfig -> createChatAdapterFromConfig() -> createPresetChatProps() / createPresetChatSlices()`
- 高层装配入口：`resolveAgentPreset() / applyAgentPresetToConfig() / createChatAdapterFromAgentPreset()`
- CLI 消费面：stable feature keys、preset prop keys、preset slice keys

当前已经被正式收口的高频能力也不是抽象概念，而是已经进入统一 resolve 链路的能力：

- `attachments`
- `senderActions`
- `welcomePrompts`
- `mcp`
- `history`
- `feedback`

这些能力现在都不是“某个 demo 里恰好能拼出来”，而是：

- 有正式配置入口
- 有统一解析入口
- 有 preset 投影结果
- 能被黑盒、白盒和 `chat-cli` 共享消费

---

## 6. 当前实现里最重要的边界是什么

如果今天要结合代码向别人解释结构，最重要的不是再讲 roadmap，而是讲清楚哪些边界已经稳定。

### 6.1 `ChatConfig` 是声明入口，不是运行时

`ChatConfig` 负责表达：

- 模型
- provider
- defaults
- ui
- layout
- features
- runtime

它回答的是：

> 这个聊天场景想要什么能力和默认行为。

它不直接负责：

- 渲染页面
- 创建消息状态
- 执行请求

### 6.2 feature registry 负责能力语义，不负责页面拼装

`resolveChatFeatures()` 的职责是把 feature 配置解析成统一结果，例如：

- 是否启用
- 默认行为是什么
- 应该投影成哪些 preset 输出

这一步的重点不是“多一个抽象层”，而是让：

- attachments
- sender actions
- history
- feedback
- mcp
- welcome prompts

这些能力都先回到统一能力语义，而不是散在页面、demo、slot 和模板目录里。

### 6.3 adapter 是标准化中间层，不是页面层

`ChatAdapter` 已经包含：

- 规范化后的 config
- models
- providerFactories
- defaultModel
- resolvedFeatures
- createResponseProvider()

所以 adapter 更适合讲成：

> 配置和 feature 解析完成之后的标准中间层。

它不是最终 UI，也不是临时过渡对象，而是当前这条能力主链中的正式层。

### 6.4 `presetProps` 和 `presetSlices` 是两种消费投影

当前最容易被忽视的一点是：

- `presetProps` 不是为了黑盒临时拼出来的一包 props
- `presetSlices` 也不是重复设计

它们分别对应两种消费方式：

- `presetProps` 更适合黑盒整包消费
- `presetSlices` 更适合白盒组合和 CLI 按部位消费

也就是说，当前系统稳定下来的不是某个页面，而是：

- stable feature results
- stable preset props
- stable preset slices

### 6.5 `AgentPreset / SkillPack` 是高层配置抽象，不是第二套运行时

这点必须反复强调。

`AgentPreset / SkillPack` 的职责是：

- 表达更高层场景
- 产出 `ChatConfig patch`
- 最终回到 `ChatConfig -> Adapter -> Preset Output` 主链

它们不是：

- 新的 UI runtime
- 新的 feature registry
- 新的页面入口

所以更准确的讲法是：

> `SkillPack` 抽公共能力包，`AgentPreset` 定义最终场景，但它们最终都要回到同一条 chat 能力主链。

### 6.6 `ChatRoot + useChatKit` 是运行时装配点

配置链和 preset 链走完以后，真正把能力跑起来的是：

- `ChatRoot`
- `resolveRootChatKit()`
- `useChatKit()`

其中：

- `ChatRoot` 负责 root 级 provide / inject 装配
- `resolveRootChatKit()` 负责决定 `chatKit` 是外部传入还是内部创建
- `useChatKit()` 负责统一运行时状态

所以现在的真实边界是：

```text
装配链负责把能力整理出来
运行时链负责把能力执行起来
```

### 6.7 黑盒、白盒、CLI 共享的是结果，不是页面

当前最值得讲清楚的一个事实是：

- 黑盒不是一套逻辑
- 白盒不是另一套逻辑
- CLI 也不是靠复制页面兜出来的逻辑

它们共享的是：

- 同一个 `ChatConfig` 入口
- 同一个 feature resolve 结果
- 同一个 adapter
- 同一份 `presetProps`
- 同一份 `presetSlices`

只不过：

- `TrChat` 更偏整包消费
- `TrChat.*` 更偏组合消费
- `chat-cli` 更偏 contract 消费

---

## 7. 当前调用链应该怎么讲

前面几节更偏“为什么这样设计”。  
但如果今天要把这套结构讲给别人听，真正最容易卡住的地方通常不是设计理念，而是：

- 名词都认识
- 大概知道有一条调用链
- 但一旦问“值到底从哪来、往哪去”，就会开始对不上

这一节的目标，就是把这件事讲到可以顺着图往下讲。

建议把当前 `packages/chat` 的结构拆成两条链来看：

1. 装配链：能力怎么被声明、合并、解析、投影
2. 运行时链：投影结果怎么变成真正的聊天行为和 UI

先记住一句总纲：

> `presets` 负责“把能力装配出来”，`ChatRoot + useChatKit` 负责“把能力跑起来”。

### 7.1 先记住四个核心对象

如果不先把名词钉住，后面的图会很容易串。

`ChatConfig`

- 它是底层配置中心
- 负责表达模型、provider、ui、layout、features、runtime
- 它回答的是：“这个聊天场景想要什么能力和默认行为”

`AgentPreset / SkillPack`

- 它们不是运行时
- 它们是 `ChatConfig` 之上的“高层配置抽象”
- 它们回答的是：“一个公共能力包怎么复用”、“一个最终场景怎么组合”

`ChatAdapter`

- 它是配置走入 UI 之前的中间层
- 里面已经包含：
  - `config`
  - `models`
  - `providerFactories`
  - `defaultModel`
  - `resolvedFeatures`
  - `createResponseProvider()`
- 它回答的是：“这份配置已经被标准化成什么样了”

`useChatKit`

- 它是真正的聊天运行时主引擎
- 它回答的是：
  - 当前消息是什么
  - 会话怎么切换
  - 请求怎么发
  - 错误怎么处理
  - retry / optimistic / rollback 怎么跑

如果要把这四个对象用一句话串起来，可以这样说：

```text
AgentPreset / SkillPack
  -> 产出更高层的配置 patch
  -> 回到 ChatConfig
  -> 进入 ChatAdapter
  -> 投影成 preset props / slices
  -> 交给 ChatRoot 和 useChatKit 跑起来
```

### 7.2 总图：当前 `chat` 其实有两条链

建议对外讲的时候先给这张总图，不要一上来就讲函数名。

```text
                ┌────────────────────────────┐
                │  上层装配层                │
                │  baseConfig                │
                │  + AgentPreset             │
                │  + SkillPack               │
                └────────────┬───────────────┘
                             │
                             v
                ┌────────────────────────────┐
                │  ChatConfig                │
                │  models/providers/ui/...   │
                └────────────┬───────────────┘
                             │
                             v
                ┌────────────────────────────┐
                │  Adapter + Feature Resolve │
                │  createChatAdapter...      │
                └────────────┬───────────────┘
                             │
                   ┌─────────┴─────────┐
                   v                   v
        ┌──────────────────┐   ┌──────────────────┐
        │ presetProps      │   │ presetSlices     │
        │ 黑盒更爱吃它      │   │ 白盒/CLI更爱吃它 │
        └─────────┬────────┘   └─────────┬────────┘
                  │                      │
                  └─────────┬────────────┘
                            v
                ┌────────────────────────────┐
                │  TrChat / TrChatPresetRoot │
                │  ChatRoot                  │
                │  useChatKit                │
                └────────────┬───────────────┘
                             │
                             v
                ┌────────────────────────────┐
                │ Header / Welcome /         │
                │ MessageList / Sender /     │
                │ History / WorkspaceShell   │
                └────────────────────────────┘
```

这张图里最重要的不是细节，而是两个判断：

- 上半段是“装配链”
- 下半段是“运行时链”

也就是说：

- 上半段解决“能力怎么被表达和整理”
- 下半段解决“能力怎么被真正执行和渲染”

### 7.2.1 用对象流转表把链路钉住

如果团队里有人总觉得“图看懂了，但对象还是对不上”，最有效的补充不是再画更多框图，而是直接给一张对象流转表。

| 对象 | 来源 | 当前层做了什么 | 产出给谁 |
| --- | --- | --- | --- |
| `ChatConfig` | 原始配置 / `baseConfig` | 统一表达模型、provider、ui、layout、features、runtime | `resolveChatFeatures()` / adapter |
| `ResolvedFeatures` | `resolveChatFeatures(config.features)` | 把 feature 配置解析成统一能力结果和 preset 投影 | `ChatAdapter` / `presetProps` |
| `ChatAdapter` | `ChatConfig + ResolvedFeatures` | 组装 `models`、`providerFactories`、`defaultModel`、`createResponseProvider()` | `createPresetChatProps()` |
| `presetProps` | `createPresetChatProps(adapter)` | 生成黑盒最容易直接消费的一包 props | `TrChat` |
| `presetSlices` | `createPresetChatSlices(presetProps)` | 把整包 props 切成 root / layout / header / sender 等部位结果 | `TrChat.*` / `chat-cli` |
| `ResolvedAgentPreset` | `AgentPreset + SkillPack` | 计算继承链、skill 列表和 `chatConfigPatch` | `applyAgentPresetToConfig()` |
| `chatKit` | `resolveRootChatKit()` | 统一聊天运行时状态和行为 | `ChatRoot` 子树 |

这张表最适合回答四个高频问题：

- 这个对象是从哪来的
- 它在这一层做了什么
- 它是不是最终 UI
- 它下游到底给谁消费

### 7.3 第一条链：不带 preset 的基础装配链

先看最基础的一条链，不带 `AgentPreset / SkillPack`，只看 `ChatConfig` 自己怎么流。

```text
raw input
  -> loadChatConfig()
  -> normalized ChatConfig
  -> resolveChatFeatures()
  -> createChatAdapterFromConfig()
  -> createPresetChatProps()
  -> createPresetChatSlices()
  -> TrChat / White-box / chat-cli
```

如果要把这条链讲给别人听，建议一层一层说。

##### 第一步：`loadChatConfig()` 做规范化，不做运行时

这一层最容易被误解成“简单 parse 一下 JSON”。  
其实它做的是正式的配置入口收口。

它负责把原始输入规范化成合法的 `ChatConfig`，包括：

- `models`
- `providers`
- `defaults`
- `appearance`
- `ui`
- `layout`
- `features`
- `runtime`

所以它的职责不是：

- 渲染页面
- 判断 UI 怎么显示
- 创建聊天状态

它的职责只是：

> 把“外部声明的聊天意图”收成一份可继续处理的正式配置对象。

这也是为什么前面文档一直强调：真正缺的是“装配层”，不是“组件数量”。

##### 第二步：`resolveChatFeatures()` 做 feature 解析

到这一层开始，系统才正式回答：

- 某个 feature 到底是不是启用
- 启用后默认行为是什么
- 这个 feature 最终应该投影成哪些 preset 输出

可以把它理解成：

```text
feature config
  -> enabled?
  -> resolved defaults?
  -> projected preset props?
```

例如：

- `attachments`
  - 会被投影成 `attachmentsFeature`
- `senderActions`
  - 会被投影成 `senderActionsFeature`
- `history`
  - 会被投影成 `showHistory + historyProps`
- `feedback`
  - 会被投影成 `showFeedback`
- `mcp`
  - 会被投影成 `mcpManager`

所以这一层很关键，因为它第一次把“声明式 feature”转换成“可消费结果”。

##### 第三步：`createChatAdapterFromConfig()` 产出中间层

当配置和 feature 都被规范化之后，系统会把它们收进 `ChatAdapter`。

这一步很适合对别人解释成：

> adapter 是 `chat` 的正式中间层，它不是最终 UI，也不是原始配置，而是已经准备好给 UI 和 preset 消费的标准化结果。

它里面已经有：

- `config`
- `models`
- `providerFactories`
- `defaultModel`
- `resolvedFeatures`
- `createResponseProvider()`

也就是说，到 adapter 为止，系统已经回答了两个问题：

1. 这份聊天配置是什么
2. 这份配置会产生什么标准运行时能力

##### 第四步：`createPresetChatProps()` 做黑盒投影

这一层做的不是新解析，而是“把 adapter 投影成黑盒更容易直接吃的结果”。

输出里会包含：

- `models`
- `providerFactories`
- `defaultModel`
- `appearance`
- `brand`
- `welcome`
- `prompts`
- `messageListVariant`
- `roleConfigs`
- `attachmentsFeature`
- `senderActionsFeature`
- `mcpManager`
- `showHistory`
- `historyProps`
- `showFeedback`

讲的时候可以直接用一句话概括：

> `createPresetChatProps()` 的作用，是把标准化能力结果打平成一包适合黑盒默认消费的 props。

##### 第五步：`createPresetChatSlices()` 做白盒 / CLI 投影

这一步很重要，因为它说明系统不是只准备服务黑盒。

它会把一整包 preset props 再切成更适合组合消费的 slices：

- `root`
- `layout`
- `appearance`
- `header`
- `welcome`
- `messageList`
- `sender`
- `history`
- `modelSelector`

如果讲到这里有人问：

> 为什么不只保留一份大 props？

答案就是：

- 黑盒组件喜欢“整包吃”
- 白盒组合和 CLI 更喜欢“按部位吃”

所以 `presetProps` 和 `presetSlices` 不是重复，而是给不同消费形态的两种投影方式。

##### 第六步：统一流向 3 个消费者

最后这些结果不是只去 `TrChat`。

而是同时流向：

- `TrChat` 黑盒
- `TrChat.*` 白盒组合
- `chat-cli`

也就是说，当前系统真正稳定的不是某个页面，而是：

- stable feature result
- stable preset props
- stable preset slices

这也是为什么前面会说：

> 黑盒、白盒、CLI 必须共享同一条能力主链。

### 7.4 第二条链：带 preset 的装配链

上面那条链解释了“没有 preset 时怎么走”。  
下面这条链解释的是：为什么 `packages/chat/src/presets` 能抽公共 agent 配置，而且又不会长出第二套运行时。

```text
baseConfig
  + preset inheritance
  + skill packs
  + current preset
  = resolved chatConfigPatch

resolved chatConfigPatch
  + baseConfig
  = final ChatConfig

final ChatConfig
  -> createChatAdapterFromConfig()
  -> createPresetChatProps()
  -> createPresetChatSlices()
```

这里最关键的判断是：

> `AgentPreset / SkillPack` 不直接驱动 UI，它们只负责产出 `ChatConfig patch`。

也就是说：

- 它们不是新的 runtime
- 也不是新的渲染入口
- 它们只是高层装配输入

##### `SkillPack` 和 `AgentPreset` 分别是什么

建议用一句最简单的话去讲：

```text
SkillPack = 可复用能力包
AgentPreset = 最终场景定义
```

这套职责分工其实在 `presets` 自己的 authoring guide 里也非常明确：

- `preset = final scene`
- `skill pack = reusable bundle`

如果更具体一点：

`SkillPack`

- 用来抽公共能力包
- 更偏“可复用能力和布局提示”
- 不应该承担最终场景身份

`AgentPreset`

- 用来定义最终场景
- 负责最后一层 override
- 更偏“助手身份、品牌、最终欢迎区和 prompt 决策”

##### `catalog.ts` 里的内建例子到底在表达什么

当前内建配置最适合拿来讲这件事。

`conversation-core`

- 开启 `history`
- 开启 `feedback`

它表达的是：

> 这是一组“对话类 agent 常见的通用能力”

`docs-layout`

- `layout.variant = docs`
- 配 assistant / user placements
- 配 docs 风格的 welcome

它表达的是：

> 这是一组“docs 阅读式场景”的公共布局和欢迎区能力

`tool-agent-core`

- 开启 `history`
- 开启 `mcp`
- 提供和工具相关的 prompts

它表达的是：

> 这是一组“工具型 agent”常见的公共能力包

`assistant-base`

- 挂上 `conversation-core`
- 给基础 system prompt
- 给基础 prompts

它表达的是：

> 这是一个“通用 assistant 场景基类”

`docs-reader`

- `extends: ['assistant-base']`
- `skills: ['docs-layout']`
- 自己补最终 brand

它表达的是：

> 这是一个建立在 assistant-base 之上的 docs 场景成品

`tool-agent`

- `extends: ['assistant-base']`
- `skills: ['tool-agent-core']`
- 自己补最终 system prompt 和 brand

它表达的是：

> 这是一个建立在 assistant-base 之上的工具型 agent 场景成品

把这个关系直接画成图，最容易讲：

```text
BUILT_IN_SKILL_PACKS
  conversation-core
  docs-layout
  tool-agent-core

BUILT_IN_AGENT_PRESETS
  assistant-base
    skills: [conversation-core]

  docs-reader
    extends: [assistant-base]
    skills: [docs-layout]

  tool-agent
    extends: [assistant-base]
    skills: [tool-agent-core]
```

或者更直观一点：

```text
conversation-core   docs-layout      tool-agent-core
      |                  |                  |
      |                  |                  |
      v                  v                  v
  assistant-base -----> docs-reader     tool-agent
```

注意这里不要把这张图误讲成“运行时继承树”。  
它只是配置组合关系图。

##### preset 的合并顺序一定要讲清楚

别人一旦开始问细节，最常见的问题就是：

> 到底先合并 skill，还是先合并 preset？

当前规则非常清楚：

1. inherited presets
2. 每个 preset 声明的 skill packs
3. 当前 preset 自己
4. 最后 merge 回 `baseConfig`

如果用 `docs-reader` 来解释，可以讲成：

```text
presetChain = [assistant-base, docs-reader]

处理 assistant-base:
  先合并它的 skills -> conversation-core
  再合并 assistant-base 自己

处理 docs-reader:
  先合并它的 skills -> docs-layout
  再合并 docs-reader 自己

最后：
  把整个 merged patch merge 回 baseConfig
```

这一步的结果不是 UI，而是：

```text
ResolvedAgentPreset.chatConfigPatch
```

也就是说，preset 系统的目标不是“直接渲染”，而是“先产出一份正式 patch”。

### 7.4.1 用 `docs-reader` 走一遍完整链路

如果只讲抽象层，很容易记不住。  
最适合拿来讲实现的 built-in 例子就是 `docs-reader`。

它在当前代码里的组合关系是：

```text
assistant-base
  -> skills: [conversation-core]

docs-reader
  -> extends: [assistant-base]
  -> skills: [docs-layout]
```

把它顺着当前实现走一遍，可以得到下面这条链：

```text
baseConfig
  + assistant-base
  + conversation-core
  + docs-reader
  + docs-layout
  -> chatConfigPatch
  -> final ChatConfig
  -> ChatAdapter
  -> presetProps / presetSlices
  -> TrChatPresetRoot
  -> ChatRoot
  -> useChatKit
```

如果把每一步里真正发生的事展开，可以这样讲：

1. `assistant-base` 先提供基础 assistant 场景
   - `defaults.systemPrompt`
   - `ui.prompts`
   - `skills = ['conversation-core']`

2. `conversation-core` 再补对话通用能力
   - `features.history = true`
   - `features.feedback = true`

3. `docs-reader` 继承 `assistant-base`
   - 继承基础 assistant prompt 和默认 system prompt
   - 自己补 `ui.brand.title = 'Docs Reader'`

4. `docs-layout` 再补 docs 场景布局
   - `layout.variant = 'docs'`
   - `layout.placements.assistant = 'start'`
   - `layout.placements.user = 'end'`
   - `ui.welcome.title = 'Docs Assistant'`

5. `resolveAgentPreset()` 把这些东西合并成 `chatConfigPatch`
   - 这里还没有 UI
   - 只有一份更完整的配置 patch

6. `applyAgentPresetToConfig()` 把 patch merge 回 `baseConfig`
   - 得到最终 `ChatConfig`

7. `createChatAdapterFromConfig()` 把它变成 `ChatAdapter`
   - 这里已经得到 `models`
   - `providerFactories`
   - `defaultModel`
   - `resolvedFeatures`

8. `createPresetChatProps()` 再把 adapter 投影成黑盒 props
   - `messageListVariant = 'docs'`
   - `roleConfigs.assistant.placement = 'start'`
   - `roleConfigs.user.placement = 'end'`
   - `showHistory = true`
   - `showFeedback = true`

9. `createPresetChatSlices()` 把整包 props 切成白盒和 CLI 更好消费的部位

10. `TrChatPresetRoot` 把这些结果接回 `ChatRoot`
    - 同时把 `resolvedPreset / chatConfig / adapter / presetProps / presetSlices` 暴露给 slot

如果要对别人讲“preset 到底是不是第二套系统”，这一条例子最适合直接落结论：

> `docs-reader` 没有创造第二条运行时。它只是把一组高层场景配置，重新压回同一条 `ChatConfig -> Adapter -> Preset Output -> ChatRoot` 主链。

### 7.5 `TrChatPresetRoot` 如何把 preset 链接回运行时链

讲到这里通常还会有一个问题：

> 好，就算 preset 已经变成 `ChatConfig patch` 了，那它怎么真正进到聊天组件里？

最好的回答入口就是 `TrChatPresetRoot`。

它在整条链里的位置可以画成：

```text
baseConfig + preset + skillPacks
  -> createPresetConsumptionFromAgentPreset()
  -> resolvedPreset
  -> chatConfig
  -> adapter
  -> presetProps
  -> presetSlices
  -> ChatRoot
  -> slot 暴露给白盒组合
```

这说明 `TrChatPresetRoot` 的职责不是自己渲染一套聊天页面，而是做桥接：

1. 它负责把 preset 装配链跑完
2. 它负责把结果喂给 `ChatRoot`
3. 它负责把中间结果暴露给上层 slot，方便白盒消费

所以非常适合把它讲成：

> `TrChatPresetRoot` 是 preset 装配链和聊天运行时链之间的桥。

### 7.6 运行时链到底怎么走

上面讲的都还是“配置怎么变成可消费结果”。  
但如果不把运行时链也讲清楚，别人还是会觉得：

> 好像只是做了一堆配置抽象

实际上 `chat` 的真正运行时主链很清楚：

```text
TrChat / TrChatPresetRoot
  -> ChatRoot
  -> resolveRootChatKit()
  -> useChatKit()
  -> provide runtime context
  -> Header / Welcome / MessageList / Sender / History 等 inject 消费
```

这里最重要的是理解 `ChatRoot` 的职责。

##### `ChatRoot` 不是普通容器，而是运行时装配点

`ChatRoot` 主要做三件事：

1. 解析 `chatKit`
2. 建立 root 级 feature manager
3. 把这些 runtime 结果通过 provide/inject 发给子组件

所以 `ChatRoot` 里真正被发下去的是：

- `CHAT_KIT_KEY`
- `CHAT_UI_KEY`
- `CHAT_MESSAGES_KEY`
- `MCP_MANAGER_KEY`
- `CHAT_ATTACHMENTS_KEY`
- `CHAT_SENDER_ACTIONS_KEY`

可以直接把这件事讲成：

> `ChatRoot` 不是页面壳，而是整个聊天运行时的上下文装配点。

##### `resolveRootChatKit()` 负责决定 chatKit 从哪来

这一层也很适合讲，因为它同时解释了黑盒和白盒。

它支持两种来源：

1. 外部已经给了 `chatKit`
2. 外部没有给，那就根据 `responseProvider` 现场创建一个

也就是说：

- 黑盒用法更常见的是：传 `responseProvider`，由内部自己创建 `chatKit`
- 白盒或更高层容器可以直接：传一个已经创建好的 `chatKit`

这正好说明了：

> 黑盒和白盒不是两套 runtime，只是 `chatKit` 的接入方式不同。

##### `useChatKit()` 才是真正的聊天引擎

如果只允许保留一个“运行时核心名词”，那就是 `useChatKit()`。

它组合了：

- `useChatConversation()`
- `useChatRequest()`
- `useChatMessages()`

它负责的不是 UI，而是：

- 会话列表
- 当前会话
- 当前消息流
- 发送消息
- 请求状态
- 错误状态
- retry
- optimistic turn
- edit rollback

所以你完全可以把它解释成：

```text
useChatKit
  = chat 的统一 runtime facade
```

也就是说，后面的 `Header / MessageList / Sender / History` 都是在消费同一份 runtime，而不是各玩各的。

### 7.7 黑盒、白盒、CLI 到底共享的是什么

这也是最值得讲清楚的一个点。

很多人会下意识觉得：

- 黑盒就是一套默认实现
- 白盒就是另一套拼装实现
- CLI 就是模板复制

但当前代码已经不是这样了。

它们共享的真正对象是：

- 同一个 `ChatConfig` 入口
- 同一个 feature resolve 结果
- 同一个 adapter
- 同一份 `presetProps`
- 同一份 `presetSlices`

只不过消费方式不同：

`TrChat`

- 更适合整包吃 `presetProps`
- 更像黑盒默认消费器

`TrChat.*`

- 更适合按 slice 和 context 自己组合
- 更像白盒消费器

`chat-cli`

- 更适合吃“稳定 contract”
- 重点不是页面，而是：
  - stable feature keys
  - stable preset prop keys
  - stable preset slice keys

所以真正共享的不是“某个 Vue 页面”，而是：

> 同一份能力投影结果。

#### 7.7.1 黑盒 / 白盒 / CLI 消费矩阵表

如果前面的文字已经讲明白“它们共享同一份结果”，那接下来最适合补的就是一张矩阵表，专门回答：

- 三类消费者各自拿什么输入
- 它们最常用的消费方式是什么
- 哪一层最适合被谁直接使用

| 维度 | 黑盒：`TrChat` | 白盒：`TrChat.*` | CLI：`chat-cli` |
| --- | --- | --- | --- |
| 主要定位 | 默认成品组件 | 可组合场景组件 | 模板与脚手架消费者 |
| 最常见输入 | `presetProps` 或直接传一整包 `TrChatProps` | `presetSlices` + `chatKit` + context | stable feature keys / preset prop keys / preset slice keys |
| 最常见入口 | `TrChat` | `TrChat.Root / Layout / Header / MessageList / Sender ...` | `createChatCliCapabilitySurface()` |
| 是否自己创建 runtime | 通常会内部创建 `chatKit` | 可以外部传入 `chatKit`，也可以走 `ChatRoot` 内部创建 | 不直接创建聊天 runtime，主要消费装配结果 |
| 对 `presetProps` 的依赖 | 高，最适合整包消费 | 中，必要时读取整包，但更偏按 slice 拆用 | 中，只消费其中稳定暴露的 prop contract |
| 对 `presetSlices` 的依赖 | 低，黑盒一般不需要自己拆 | 高，最适合按 `root / layout / header / sender` 分部位组合 | 高，模板生成最适合按 slice 理解能力面 |
| 对 `chatKit` 的依赖 | 隐式依赖，通常由黑盒内部创建并透传给子树 | 显式依赖，白盒最容易直接围绕 `chatKit` 组合 | 不直接依赖 |
| 最关心什么 | 默认行为是否完整、接入是否最省事 | 可组合性、可替换性、局部控制力 | contract 是否稳定、能否避免复制页面 |
| 最适合讲成什么 | “一键可用的默认聊天成品” | “围绕同一 runtime 的白盒拼装面” | “消费 capability contract 的外部模板系统” |

这张表最重要的结论不是“它们差很多”，而是：

- 黑盒更偏“整包吃”
- 白盒更偏“按 slice 和 runtime 组合”
- CLI 更偏“按 contract 消费”

但三者背后对齐的仍然是：

- 同一个 `ChatConfig`
- 同一个 feature resolve 结果
- 同一个 adapter
- 同一组 preset 输出

### 7.8 最后用一段话把整条链串起来

如果今天要对团队顺着讲完整条链，建议直接用下面这段话：

```text
packages/chat 里其实有两条链。

第一条是装配链。
它负责把 baseConfig、AgentPreset、SkillPack 这些声明式输入，
整理成 ChatConfig、resolvedFeatures、adapter、presetProps、presetSlices。
这条链解决的是“能力怎么被表达、合并、解析、投影”。

第二条是运行时链。
它负责把这些投影结果接进 ChatRoot 和 useChatKit，
再由 Header、Welcome、MessageList、Sender、History、WorkspaceShell 等组件消费。
这条链解决的是“能力怎么被真正跑起来并渲染出来”。

所以 presets 不是第二套运行时。
它只是高层配置抽象，最后一定回到 ChatConfig -> Adapter -> Preset Output 这条主链。

SkillPack 抽的是公共能力包。
AgentPreset 定义的是最终场景。
ChatRoot 是运行时装配点。
useChatKit 是统一聊天引擎。
黑盒、白盒、CLI 共享的是同一份能力投影结果。
```

如果这段话讲顺了，基本就已经能把当前 `packages/chat` 的结构讲清楚了。

### 7.9 如果要结合实际文件夹代码讲，推荐按什么顺序

如果今天不是只讲抽象图，而是要一边打开 `packages/chat/src` 一边带别人过代码，最推荐的顺序不是按文件夹名字顺着读，而是按“系统实现链”来读。

最清楚的顺序是：

```text
公开入口
  -> 核心对象
  -> 基础装配链
  -> preset 装配链
  -> 装配链接入运行时
  -> runtime 主引擎
  -> context 分发
  -> UI 消费层
  -> CLI 消费层
```

这样讲的好处是：

- 先建立“这个包对外提供什么”的全局视角
- 再建立“系统里到底有哪些对象在流动”的对象视角
- 再解释“这些对象怎么被解析、投影、运行”的实现链路
- 最后再看页面组件，读者不容易把组件树误认为架构主线

#### 7.9.1 第一步：先从公开入口建立全局视角

第一站最适合看的是：

- `packages/chat/src/index.ts`

这一层最适合先回答：

- 这个包对外暴露了哪些能力
- 黑盒、白盒、preset、CLI 是否共存
- 团队应该把 `packages/chat` 理解成“组件包”还是“能力入口”

结合当前实现，`index.ts` 已经把这些入口统一暴露出来：

- `TrChat`
- `TrChat.Root / Layout / Header / Welcome / MessageList / Footer / Sender / History`
- `TrChat.PresetRoot`
- adapters、features、presets 相关导出

所以对内讲解时，第一句话就可以是：

> `packages/chat` 不是一组零散聊天组件，而是把聊天能力同时暴露给黑盒、白盒和更高层装配入口的统一包。

#### 7.9.2 第二步：再讲系统里真正流动的对象

这一段不要急着打开组件文件，先看类型定义最容易对齐概念。

推荐顺序是：

- `packages/chat/src/adapters/types.ts`
- `packages/chat/src/features/types.ts`
- `packages/chat/src/presets/types.ts`

这一轮最好先把下面几个对象讲清楚：

- `ChatConfig`
- `ResolvedChatFeatures`
- `ChatAdapter`
- `presetProps`
- `presetSlices`
- `AgentPreset / SkillPack`

这一步的目的不是讲 API 细节，而是先回答：

- 声明入口是谁
- 标准中间层是谁
- 消费投影是谁
- 高层配置抽象是谁

只要这几个对象先对齐，后面再看 `config.ts`、`resolve.ts`、`ChatRoot.vue`，读者就不会觉得每个文件都在做一套新东西。

#### 7.9.3 第三步：讲基础装配链，而不是先讲组件树

真正的主链建议先读：

- `packages/chat/src/adapters/config.ts`
- `packages/chat/src/features/registry.ts`

这一段最值得讲的是：

```text
ChatConfig
  -> resolveChatFeatures()
  -> createChatAdapterFromConfig()
  -> createPresetChatProps()
  -> createPresetChatSlices()
```

如果这条链没有讲清楚，后面再讲 `presets` 或 `TrChat`，别人只会记住很多文件名，记不住系统在干什么。

这里建议你重点强调三件事：

- `ChatConfig` 是声明入口
- feature registry 负责把能力解析成统一结果
- adapter 和 preset output 才是稳定消费面

也就是说，对内讲代码时，`adapters/` 和 `features/` 这两层才是“实现主轴”的前半段。

#### 7.9.4 第四步：再讲 presets 如何抽公共配置

等基础装配链讲明白之后，再带别人看：

- `packages/chat/src/presets/catalog.ts`
- `packages/chat/src/presets/resolve.ts`

这里最容易讲清楚的顺序是：

1. 先看 `catalog.ts`，回答“公共配置到底抽了什么”
2. 再看 `resolve.ts`，回答“这些公共配置最后怎么并回主链”

这一段最适合反复强调一句话：

> `AgentPreset / SkillPack` 不是第二套 runtime，只是更高层的 `ChatConfig patch` 抽象。

也就是说，这部分的重点不是“又新增了一套 preset 系统”，而是：

- `SkillPack` 抽公共能力包
- `AgentPreset` 定义最终场景
- 它们最后还是回到 `ChatConfig -> Adapter -> preset output` 这条主链

#### 7.9.5 第五步：再看装配链怎么接入运行时

当别人已经理解“配置是怎么被装配出来的”之后，再打开：

- `packages/chat/src/components/chat/ChatPresetRoot.vue`
- `packages/chat/src/components/chat/resolveRootChatKit.ts`

这一段是最好的桥接点，因为它正好回答：

- preset 输出怎么进入 `ChatRoot`
- `chatKit` 到底是外部传入，还是内部创建
- 黑盒 preset 消费和运行时之间是怎么接上的

这一步讲清楚之后，读者会很自然地接受：

```text
preset consumption
  -> ChatRoot
  -> chatKit runtime
```

#### 7.9.6 第六步：运行时核心要单独讲，不要埋在组件细节里

接下来最值得单独打开的是：

- `packages/chat/src/composables/useChatKit.ts`

这里最好明确告诉别人：

- 真正的聊天状态不在页面模板里
- 真正的请求生命周期不在某个单组件里
- `useChatKit` 才是统一 runtime facade

这一段适合回答：

- 会话状态怎么组织
- 消息怎么追加、重试、回滚
- response provider 怎么被消费

如果这一步讲顺了，后面再看 `Header / MessageList / Sender / History`，读者就会知道这些组件是在消费 runtime，而不是各自维护一套聊天逻辑。

#### 7.9.7 第七步：再讲 runtime 如何被分发给组件树

这时再看：

- `packages/chat/src/components/chat/ChatRoot.vue`
- `packages/chat/src/context.ts`

这一层最适合讲的是 provide/inject 边界：

- `CHAT_KIT_KEY`
- `CHAT_UI_KEY`
- `CHAT_MESSAGES_KEY`
- `MCP_MANAGER_KEY`
- `CHAT_ATTACHMENTS_KEY`
- `CHAT_SENDER_ACTIONS_KEY`

这一段讲清楚之后，就能很好地回答一个常见问题：

> 为什么黑盒和白盒不是两套实现？

答案就是：

- 它们共享同一个 `chatKit`
- 共享同一组 runtime context
- 只是消费方式不同

#### 7.9.8 第八步：最后再看 UI 组件层

这个时候再去带读 UI 文件最合适：

- `packages/chat/src/components/chat/Chat.vue`
- `packages/chat/src/components/chat/ChatMessageList.vue`
- `packages/chat/src/components/chat/ChatSender.vue`
- `packages/chat/src/components/chat/ChatHeader.vue`
- `packages/chat/src/components/workspace/*`

这里的讲法建议从“它们消费什么”出发，而不是从模板结构出发。

例如：

- `Chat.vue` 更像默认黑盒装配器
- `ChatMessageList.vue` 在消费消息与动作上下文
- `ChatSender.vue` 在消费 sender、attachments、actions 等 root 级能力
- `WorkspaceShell` 和 conversation navigation 更像 workspace 消费层

这样别人会更容易理解：

> UI 层是主链结果的消费者，而不是系统的起点。

#### 7.9.9 第九步：最后补 CLI，形成完整闭环

最后再看：

- `packages/chat/src/adapters/chatCli.ts`

把 CLI 放在最后讲，效果通常最好，因为它能帮助团队彻底接受一个事实：

> 这套系统不是只为某个 Vue 页面服务的，而是在输出一套稳定的 capability contract。

这时最适合讲清楚：

- CLI 不直接消费页面
- CLI 更依赖 stable feature keys / preset prop keys / preset slice keys
- CLI 的存在恰好证明当前主链不是“页面实现链”，而是“能力投影链”

#### 7.9.10 如果只给你 20 分钟，最短讲解顺序是什么

如果时间很紧，最推荐的压缩顺序是：

1. `packages/chat/src/index.ts`
2. `packages/chat/src/adapters/types.ts`
3. `packages/chat/src/adapters/config.ts`
4. `packages/chat/src/presets/catalog.ts`
5. `packages/chat/src/presets/resolve.ts`
6. `packages/chat/src/components/chat/ChatPresetRoot.vue`
7. `packages/chat/src/composables/useChatKit.ts`
8. `packages/chat/src/components/chat/ChatRoot.vue`
9. `packages/chat/src/components/chat/Chat.vue`
10. `packages/chat/src/adapters/chatCli.ts`

这 10 个文件已经足够把当前实现讲成一条完整的系统链：

```text
公开入口
  -> 对象定义
  -> 配置装配
  -> preset 抽象
  -> runtime 桥接
  -> runtime 主引擎
  -> UI 消费
  -> CLI 消费
```

如果对方是第一次接触 `packages/chat`，最不建议的顺序反而是：

- 直接从 `components/chat` 目录开始顺着点文件
- 直接从某个页面 demo 开始讲
- 直接从某个具体 feature 的 slot 拼装细节讲起

因为这样最容易把“组件树”误认为“系统结构”。

---

## 8. 结合使用场景怎么讲

下面这些例子最适合用来对团队解释“当前实现是怎么落到具体场景里的”。

### 8.1 场景一：客服聊天，支持附件上传与附件消息展示

业务目标：

- 用户能上传截图和 PDF
- 消息区要显示附件卡片
- 黑盒、白盒和模板生成结果要尽量一致

如果不做 feature 化，通常会变成：

- 页面在 sender slot 里插上传按钮
- 页面自己管理文件约束
- 消息渲染再自己判断附件展示
- 黑盒和白盒各接一套

结果就是一个“附件能力”被拆散在多个层里。

结合当前代码，正式配置入口更接近下面这种形态：

```ts
const chatConfig = {
  features: {
    attachments: {
      enabled: true,
      upload: {
        accept: 'image/*,.pdf',
        multiple: true,
        maxCount: 5,
        maxSize: 20 * 1024 * 1024,
        tooltip: '上传附件',
      },
      list: {
        variant: 'card',
        wrap: true,
      },
    },
  },
}
```

这里表达的是业务意图，而不是页面细节。

resolver 再把它落到统一运行时输出：

- sender 侧是否显示 upload action
- sender 允许选择哪些文件
- 附件列表是否以 `card / picture / auto` 方式展示
- 黑盒默认行为和白盒消费结果是否一致

这时 `packages/chat` 沉淀的就不是某个上传按钮，而是“聊天场景中的附件能力契约”。

### 8.2 场景二：企业智能助手，输入区支持多个高频动作

业务目标：

- 支持上传
- 支持语音输入
- 支持字数统计
- 支持统一的 sender 默认动作

如果完全依赖页面 slot 和 demo 拼法，马上会遇到这些问题：

- 每个页面都自己决定按钮顺序
- 每个页面都自己决定状态注入方式
- 哪些动作会影响请求上下文，没有统一约束
- 黑盒和白盒会越来越不一致

结合当前实现，更合理的表达方式是把它收敛成 `senderActions` feature：

```ts
const chatConfig = {
  features: {
    senderActions: {
      enabled: true,
      upload: {
        enabled: true,
        accept: '*',
        multiple: true,
      },
      voice: {
        enabled: true,
        tooltip: '语音输入',
        size: 'small',
        autoInsert: false,
      },
      wordCount: true,
      defaultActions: {
        clear: {
          tooltip: '清空',
        },
      },
    },
  },
}
```

这样 `packages/chat` 负责沉淀的是：

- 动作的声明方式
- 动作的默认编排
- 动作与请求参数的关系
- 黑盒和白盒的共享消费方式

而不是把 `Sender` 的每一个 slot 直接变成业务 API。

### 8.3 场景三：知识库问答页，空状态展示建议问题

业务目标：

- 首次进入聊天页时展示建议问题
- 点击建议后快速发起提问
- 同一套建议能力在普通聊天、docs-chat、workspace 中都能复用

如果不 feature 化，这类能力最容易散落在：

- welcome 区
- docs 页面
- demo 卡片

更合理的形式是：

```ts
const chatConfig = {
  features: {
    welcomePrompts: {
      enabled: true,
      welcome: [
        { label: '帮我总结这篇文档', description: '请总结这篇文档的核心内容' },
        { label: '列出 API 使用步骤', description: '请列出该 API 的使用步骤' },
        { label: '给我一个 Vue 示例', description: '请给我一个 Vue 示例' },
      ],
    },
  },
}
```

这时候需要强调两个边界：

- `welcomePrompts` feature 决定能力是否存在
- `layout` 决定建议显示在 welcome 区、sender 上方、侧栏还是别处

这正是“feature 与 layout 必须分离”的典型例子。

### 8.4 场景四：Agent 聊天，带 MCP 插件管理

业务目标：

- 聊天实例支持 MCP
- 有统一的 `mcpManager`
- 黑盒和白盒都能拿到同一份 MCP 能力入口
- UI 上可能是普通抽屉，也可能是 workspace 面板

当前 MCP 基础接入已经存在，结合最新实现，正式配置入口更接近：

```ts
const chatConfig = {
  features: {
    mcp: {
      enabled: true,
    },
  },
  runtime: {
    mcpManager,
  },
}
```

这里要讲清楚：

- `mcp` feature 管的是能力是否启用
- `runtime.mcpManager` 提供运行时 manager
- `layout.variant = 'workspace'` 这类配置只决定它在什么布局下被承载

如果这几层不拆开，后面每做一个新布局，MCP 都会重新耦合一遍。

### 8.5 场景五：同一个能力，不同布局下的呈现

这是最适合解释“为什么 layout 必须和 feature 分离、并被正式建模”的场景。

以 `welcomePrompts` 为例：

- 普通聊天：欢迎区下方
- docs-chat：文档摘要区下方
- workspace：左侧任务面板

这三种页面长相不同，但本质上不是三个 `welcomePrompts` 功能，而是：

- 同一个 feature
- 不同 layout placement

如果不把这层关系讲清楚，后续会自然演化成：

- docs 版 `welcomePrompts`
- workspace 版 `welcomePrompts`
- bubble 版 `welcomePrompts`

最终每个能力都裂成多份实现。

### 8.6 场景六：为什么黑盒、白盒和 CLI 必须共享一套结果

使用方会有三类典型模式：

1. 直接用 `TrChat`
2. 用白盒组合 API 自己拼
3. 通过 `chat-cli` 生成模板项目

如果没有共享能力底座，就会出现：

- 黑盒能开某能力，白盒得重接
- 白盒能拼某能力，黑盒没有正式默认
- CLI 只能复制页面，不能消费 capability

所以更准确的讲法不是“大家都直接消费 `resolveChatFeatures()`”，而是：

```ts
const adapter = createChatAdapterFromConfig(chatConfig)
const presetProps = createPresetChatProps(adapter)
const presetSlices = createPresetChatSlices(presetProps)
```

然后：

- 黑盒更偏向消费 `presetProps`
- 白盒更偏向消费 `presetSlices`
- CLI 消费同源的 stable feature keys / preset prop keys / preset slice keys

这就是“共享能力底座”的真正含义。

### 8.7 场景七：如果后续支持 Agent Skills，chat 里会怎么用

这里说的 `skills`，指的是以 `https://agentskills.io/home` 为代表的公开 Agent Skills 格式。

它的核心特征不是“一个神秘插件对象”，而是：

- skill 是一个目录
- 目录里至少包含一个 `SKILL.md`
- 可选携带 `scripts/`、`references/`、`assets/`
- agent 通过 progressive disclosure 方式按需加载 skill

如果未来 `packages/chat` 支持 Agent Skills，更合理的接入方式不是把 skill 直接塞进 `TrChat`，而是把它作为 capability bundle 来消费。

最典型的使用流程应当是：

1. 会话启动时，只发现和暴露 skill catalog，也就是 skill 的 `name + description`
2. 当用户问题或当前任务命中某个 skill 描述时，再激活 skill，读取完整 `SKILL.md`
3. 如果 `SKILL.md` 引用了 `references/` 或 `scripts/`，再按需继续加载
4. skill 最终解析回标准 capability 输出，而不是绕过 feature registry 直接改页面

下面是几个适合 `chat` 场景的例子。

#### 例子 A：项目级 docs-retrieval skill

假设某个仓库内存在：

```text
<project>/.agents/skills/docs-retrieval/
  ├── SKILL.md
  ├── references/
  │   └── retrieval-guidelines.md
  └── assets/
      └── query-template.md
```

这个 skill 的用途可以是：

- 当用户提问 API、SDK、文档摘要时，提示 agent 使用特定检索流程
- 给出查询模板、回答结构和注意事项
- 绑定一组 docs search 相关 MCP tools

在 `chat` 里更合理的消费方式是：

- skill 被发现后进入 catalog
- 命中时激活 `SKILL.md`
- resolver 把它映射为：
  - `welcomePrompts`
  - docs retrieval 相关 prompts
  - MCP / tools binding
  - `layout.variant = 'docs'` 的 hint

这样 `docs-chat` 后续消费的是标准 capability 结果，而不是某个页面特判“如果有 docs skill 就手工改 UI”。

#### 例子 B：用户级 customer-support-runbook skill

假设用户本地有一个跨项目通用 skill：

```text
~/.agents/skills/customer-support-runbook/
  ├── SKILL.md
  ├── references/
  │   ├── escalation-policy.md
  │   └── response-style.md
  └── assets/
      └── reply-template.md
```

这个 skill 的用途可以是：

- 客服问答时套用统一回复风格
- 在识别到投诉、退款、升级支持等场景时，引导 agent 走既定流程
- 给出推荐回复模板和升级规则

在 `chat` 里，这类 skill 不应直接等价于一个新页面模板，而应被映射为：

- welcome / empty-state prompts
- sender command 或常用 prompts
- 可能的 attachments 约束
- 可能的 workflow hints

这样同一个客服 runbook skill 可以被多个模板、多个页面和后续 CLI/workflow 共用。

#### 例子 C：项目级 code-review skill

假设某个开发项目内有：

```text
<project>/.agents/skills/code-review/
  ├── SKILL.md
  ├── scripts/
  │   └── collect-diff-summary.sh
  └── references/
      └── review-checklist.md
```

它的用途可以是：

- 代码评审时自动套用检查清单
- 在需要时调用脚本生成 diff 摘要
- 约束 agent 先读 checklist 再输出 review 结论

这类 skill 对 `chat` 的价值不是“多了一个 code review 页面”，而是：

- 为 agent preset 提供一组稳定 instructions
- 为 sender 或消息动作提供特定入口
- 为后续 workflow 提供一个可复用的审查能力包

也就是说，skill 更像“场景能力组合”，不是“页面变体本身”。

#### 例子 D：agent-mcp-builder skill

再比如一个更偏 agent 能力建设的 skill：

- 目标是指导 agent 生成或接入 MCP server
- 提供相关参考文档、模板和脚本
- 自动建议打开一组 MCP 管理能力

在 `chat` 中，这类 skill 更应该解析为：

- MCP 相关 prompts / commands
- `mcp` feature 的默认开关和入口 hint
- 一组推荐的 sender actions

而不是让 skill 直接接管整个 MCP 面板。

这个例子很适合说明：

- feature 是基础原语
- skill 是这些基础原语的组合包

### 8.8 为什么 Agent Skills 更适合作为后续扩展

把 Agent Skills 放到后续扩展层，不是因为它不重要，而是因为它天然依赖下面这些基础能力先稳定：

- feature registry / resolver
- MCP / tools binding
- prompts / commands 的正式入口
- layout hints / variant
- preset / CLI 的标准消费链路

否则 skill 很容易退化成：

- 页面级特判
- 模板级手工 wiring
- 绕过 feature registry 的大黑盒

这与 Agent Skills 自己倡导的集成方式也是相反的。按 `agentskills.io` 的做法，skills 更适合作为：

- 可发现的 catalog
- 可按需激活的 instructions bundle
- 可选脚本与参考资料包

而不是一上来就替代 agent 的核心 capability 层。

---

## 9. 为什么 CLI 现在不能先扩模板

这个问题几乎一定会被问到。

表面上看，先多做几个模板似乎推进更快，但如果 feature 契约还没稳定，CLI 只能走“复制页面”路线。

例如：

- 模板 A 复制一个 `App.vue`
- 模板 B 再复制一个 `App.vue`
- 各自在页面里接 sender actions、welcome、MCP、attachments

这种方式的问题是：

- 模板差异来自页面复制
- 不来自能力组合

最终模板越多，维护越失控。

真正成熟的目标应当是：

```ts
createTemplate({
  base: 'chat',
  features: ['attachments', 'welcomePrompts'],
  layout: 'docs',
})
```

或者：

```ts
createTemplate({
  base: 'chat',
  features: ['mcp', 'senderActions'],
  layout: 'workspace',
})
```

也就是说，模板应该逐步变成“capability consumer”，而不是“页面复制器”。

这也是为什么 `chat-cli` 更适合建立在现有 capability contract 之上，而不是继续走页面复制路线。

---

## 10. 结合业界成熟方案，我们借鉴了什么

这里最重要的是强调“借鉴分层思想”，而不是照搬实现。

### 10.1 Vercel AI SDK / AI Elements

Vercel 的公开方向非常强调：

- 用统一状态层管理聊天与流式过程
- 用可组合 UI 元素渲染消息、输入、工具与附件
- 把“AI 状态管理”和“界面渲染结构”拆开

对我们最有启发的不是具体 React API，而是这种分层方式：

- 状态主链路稳定
- 组件是可组合的
- 更高层产品再基于能力装配来组织体验

这与我们把 `useChatKit` 作为底座、再往上引入 feature registry / preset 的方向是一致的。

参考：

- [AI SDK](https://vercel.com/docs/ai-sdk)
- [AI Elements | Vercel Academy](https://docs.vercel.com/academy/ai-sdk/ai-elements)
- [Introducing AI Elements](https://vercel.com/blog/introducing-ai-elements)

### 10.2 Ant Design X

Ant Design X 的组件体系是一个很典型的例子：

- `Bubble`
- `Prompts`
- `Sender`
- `Attachments`
- 各类会话交互组件

它强调的是“聊天原子能力的可组合性”，而不是一开始就把所有东西塞进单一场景组件。

对我们的启发是：

- 原子能力应继续留在组件层
- `packages/chat` 应承担场景装配职责
- 场景层不应简单复制原子组件，而应收敛聊天能力契约

参考：

- [Ant Design X Overview](https://x.ant.design/components/overview/)
- [Bubble - Ant Design X](https://x.ant.design/components/bubble/)

### 10.3 LobeChat

LobeChat 在插件体系和能力分层上的实践很值得参考。

它的启发主要不在于具体 UI，而在于：

- 扩展能力需要正式边界
- 插件系统要先稳定能力接口，再扩张生态
- 高层体验不能建立在脆弱的页面拼装之上

这和我们先把 registry、preset output 和模板消费 contract 收稳，再让模板基于 capability 组合扩张，本质上是同一路线。

参考：

- [LobeChat Plugin System](https://lobehub.com/it/docs/usage/features/plugin-system)
- [LobeChat Plugins Gateway](https://github.com/lobehub/chat-plugins-gateway)

### 10.4 MCP 官方架构

MCP 官方文档最值得借鉴的是它对边界和能力协商的强调：

- host / client / server 分层明确
- capability negotiation 明确
- prompts 是用户可控制触发的
- sampling 必须保留用户控制和审查空间

对我们的直接启发是：

- MCP 在 UI 层也不应被当作“一个随手塞进页面的抽屉”
- 应先定义能力边界，再决定入口和布局
- feature 与 layout 分离，符合 MCP 本身的边界意识

参考：

- [Architecture - Model Context Protocol](https://modelcontextprotocol.io/specification/2024-11-05/architecture)
- [Prompts - Model Context Protocol](https://modelcontextprotocol.io/docs/concepts/prompts)
- [Sampling - Model Context Protocol](https://modelcontextprotocol.io/docs/concepts/sampling)

### 10.5 Agent Skills（agentskills.io）

如果把我们前面讨论的 `skill pack` 和公开生态做对照，最接近的公开格式就是 Agent Skills：

- skill 是一个目录
- 以 `SKILL.md` 作为入口
- 可附带脚本、参考资料和资源文件
- 通过 progressive disclosure 控制上下文成本
- 兼容项目级和用户级 skill 扫描

它对我们最大的启发不是“马上引入 marketplace”，而是：

- skills 是能力包，不是底层原语
- skills 适合建立在稳定 capability 层之上
- skills 的接入重点在 discovery、activation、resolution，而不是先做 UI 特例

这和我们把 `AgentPreset / SkillPack` 放在稳定 capability 主链路之上，是一致的。

参考：

- [Agent Skills Overview](https://agentskills.io/home)
- [What are skills?](https://agentskills.io/what-are-skills)
- [Specification](https://agentskills.io/specification)
- [How to add skills support to your agent](https://agentskills.io/client-implementation/adding-skills-support)

---

## 11. 当前实现下明确不建议做什么

为了让团队更容易统一判断，下面这些方向在当前实现下不应优先推进：

- 继续给 `TrChat` 增加大量离散 props
- 把 `packages/components` 的原子组件大规模平移成 `TrChat.*`
- 先在 demo 或页面里拼出新功能，再反向要求 `chat` 去适配
- 在 feature 契约未稳定前，先扩张 CLI flags 或模板分支
- 在 attachments / sender actions / welcomePrompts / MCP 正式收敛前，优先投入 theme 或 workspace shell

这些事不是永远不做，而是现在做会把结构带偏。

---

## 12. 如何向团队做 5 分钟版本说明

如果只给 5 分钟，我建议这样讲：

`packages/chat` 现在已经不只是聊天组件集合了，而是一条稳定的聊天能力装配链路。我们已经有很多运行时能力，比如 Sender、Attachments、Prompts、MCP、history、feedback，也已经有 `TrChat`、白盒组合和 `useChatKit`。真正的问题不是“没有能力”，而是这些能力以前缺少统一声明、统一解析、统一消费的方式，所以页面、demo、模板容易各写各的。

现在 `packages/chat` 已经把这些能力稳定成 contract，并且让黑盒、白盒和 `chat-cli` 共同消费这套 contract。又在这条主链之上补上了 `AgentPreset / SkillPack`，让更高层聊天场景可以继承、组合、覆盖，但最终仍然回到现有 `ChatConfig -> Adapter -> Feature Registry -> Preset` 这条主链路。

换句话说，我们不是继续堆页面，而是在把聊天能力沉淀成一套可声明、可装配、可生成、可组合的工程底座。

---

## 13. 一句话结论

`packages/chat` 当前最重要的成果，不是“又多了几个聊天页面”，而是：

> 我们已经把聊天能力沉淀成一套可声明、可解析、可复用、可被黑盒、白盒、`chat-cli` 和更高层 preset/skill 稳定消费的能力底座。
