# Review A Spec Detail

## 1. 这份文档怎么用

这份文档不是给评审人会前速读的短 memo，而是给 owner 自己用的完整底稿。

它要解决 3 件事：

1. 你需要把这轮重构的判断链路完整讲顺。
2. 对方在评审里追问“旧方案是什么、新方案为什么这样切、现在为什么能开工”时，你不能只能回去翻长文档。
3. 会后如果要回写规范文档，这份文档要能直接反推需要修改的设计点和阶段门禁。

这份文档默认按下面的顺序使用：

1. 先讲第 2 章和第 3 章，让对方先知道这轮到底要拍板什么。
2. 再讲第 4 章和第 5 章，用一张总对照把旧方案和新方案放在同一张桌子上。
3. 再进入第 6 章，说明为什么这轮通过后可以直接进入 `Phase 1A`。
4. 最后按第 7-10 章四张问题卡片展开。
5. 如果对方追问，就直接从第 11 章开始答，不需要再跳到别的文档。

如果这份文档讲完后，你自己还会卡住，说明这里的设计说明还不够；这份文档的目标就是尽量把“会中要临时想”的部分前置消化掉。

## 2. Review A 这轮到底要拍板什么

这轮不是泛泛讨论“方案大方向有没有问题”，而是要一次拍板 5 个问题，并决定能不能直接开工。

### 2.1 要拍板的 5 个问题

1. 入口心智是否接受  
   是否接受把入口正式收敛为 `TrChat` 和 `TrChat.Root`，并把 `TrChat.Page` 定义为官方默认页面层，而不是第三入口。

2. 桥接路径是否接受  
   是否接受 `config -> createRuntimeFromConfig(config) -> { runtime, ui } -> TrChat.Root` 作为唯一官方桥接路径。

3. 边界切法是否接受  
   是否接受 `ui` 只做 display-only、runtime 按 source of truth 切、`Page` 只做 composition。

4. 当前 contract package 是否足够开工  
   是否接受当前 Phase 0.5 冻结项已经足够支撑 `Phase 1A` 编码。

5. `Phase 1A` 的 scope / gate / exit criteria 是否接受  
   是否接受先做 foundation，再进 `Page baseline` 和黑盒新主路径。

### 2.2 这 5 个问题里，哪些是硬门禁

下面 4 个点只要有一个答不稳，这轮就不应该直接开工：

1. `Root` 是否只吃 `{ runtime, ui }`
2. `ui` 是否严格保持 display-only
3. `messageId` 是否被当成稳定动作定位键
4. `Phase 1A` 的 bridge subset 是否已经说清楚“支持什么，不支持什么”

下面这些点可以是 `pass with follow-ups`，但不能无限期悬着：

1. `Footer` 在后续 `Page baseline` 的落位
2. `history / workspace / models / mcp` 在后续阶段的具体时序
3. 更后面的 public surface 收口方式

### 2.3 Review A 必须冻结的三层内容

为了保证这轮评审结束后真的能开工，而不是“方向大概对、实现再慢慢想”，这轮内容必须分成 3 桶来看。

#### A. Must Freeze Now

这些内容是 `Phase 1A` 立刻编码一定会依赖的 contract，本轮必须拍板：

##### 入口 API

- `TrChat`
- `TrChat.Root`
- `TrChat.Page`

这里要冻结的不是所有未来实现，而是这三个对象的角色关系必须稳定。

##### 桥接 API

- `createRuntimeFromConfig(config) -> { runtime, ui }`

这里要冻结的不是 helper 内部实现，而是：

- 它是唯一官方桥接路径
- 输入是 `config`
- 输出是 `{ runtime, ui }`
- `Phase 1A` 只承诺 subset，不承诺完整黑盒覆盖

##### Root props

- `TrChat.Root` 只消费 `{ runtime, ui }`

这里必须冻结，因为只要 `Root` 继续保留“后面再塞别的黑盒 props”的空间，`Phase 1A` 编码时它就会重新退化成总装配层。

##### `Phase 1A` 立刻会依赖的 runtime / primitive contract

- `ChatUIMessage`
- `messageId`
- `createConversationRuntime`
- `createSenderRuntime`
- `createMessageRuntime`
- `createAttachmentsRuntime`
- `createTransportRuntime`
- `TrChat.Message`
- `TrChat.MessageList`
- `TrChat.Sender`

这里不要求把所有最终公开 props 名字都钉死，但至少要把实现会依赖的输入输出 contract 定下来。

##### 核心 slot API / contract

这轮必须冻结：

- slot 体系是否存在
- `replace / augment` 两类是否成立
- slot 不得拿 whole runtime
- slot props 只暴露最小必要模块
- 核心一级 slot catalog 是否成立

目前这一层至少包括：

- `header`
- `welcome`
- `message-list`
- `sender`
- `left`
- `left-rail`
- `right`
- `mobile-left`
- `mobile-right`

#### B. Freeze Semantics Now

这些内容本轮先冻结语义与边界，不要求展开完整消费面：

- `Page` slot-provider 机制
- slot props 的最小暴露原则
- degrade rules 的基本原则
- `Page` composition-only 的落地约束
- 核心 slot 一级位点与 region 的归属关系

这一桶的特点是：

- 现在不定，后面一定会漂
- 但现在没必要把每个 slot 的完整 props 矩阵一次讲完

#### C. Defer To Review B

这些内容不应该阻塞 `Review A` 的开工签字，而应该放到 `Review B` 结合 `Phase 1B` 一起评：

- `Page baseline` 的完整 slot 消费面
- `history / models / workspace` 完整 props 矩阵
- `Footer` 的最终落位细节
- 所有 augment hook 的最终细粒度命名
- 最终公开面与发布语义

这里的判断标准很简单：

- 如果它是 `Phase 1A` 编码立刻会碰到的，就不该留到下一轮
- 如果它依赖 `Page baseline / history / workspace` 真正站起来以后才有意义，就不该强行塞进 `Review A`

## 3. 这轮评审应该怎么判断是否合理

我会用下面 6 条标准来判断这轮方案是不是稳：

1. 能不能用一句话讲清主路径  
   如果主路径还需要靠大量“但是”“例外”“其实还有一层”才能说清，说明方案还不够稳。

2. 入口、桥接、页面层是不是各自有边界  
   `TrChat`、`Root`、`Page` 不能再互相吞职责。

3. owner 是否按 source of truth 切，而不是按 UI 结构切  
   这会直接决定后面能不能稳定扩展。

4. 能不能先做 foundation，再做页面和黑盒主路径  
   如果第一阶段还必须先碰大量 `Page` / workspace / history / slot 消费面，说明阶段拆法有问题。

5. 编码后能不能靠 tests 约束 contract  
   如果冻结的 contract 还不能变成 tests，这轮冻结的价值就会打折。

6. 这轮通过后是不是真的能直接开工  
   如果评审完还得再开一场“才能开工”的会，说明本轮 scope 仍然不对。

## 4. 先给出完整结论

如果只看最终方案，这轮重构准备把 chat 的主路径收成下面这条链路：

```text
黑盒：
TrChat(config)

桥接：
createRuntimeFromConfig(config) -> { runtime, ui }

白盒：
TrChat.Root({ runtime, ui })
  + TrChat.Page
  或
  + primitives
```

这条链路对应 8 个固定结论：

1. `TrChat` 继续保留，仍然是默认黑盒入口。
2. `TrChat.Root` 是正式白盒入口。
3. `TrChat.Page` 是官方默认页面层，不是第三入口。
4. `Root` 只消费 `{ runtime, ui }`。
5. `ui` 严格保持 display-only。
6. runtime 按 source of truth 切分。
7. `Page` 是 composition-only，不允许退化成 whole-runtime relay。
8. `messageId` 是 next-surface 中唯一稳定的消息动作定位键。

这轮如果通过，还额外意味着：

1. `Review A` 不是纯方向评审，而是“方向 + contract sign-off”的开工签字会。
2. 不再额外再开一场“才能开工”的评审。
3. 可以直接进入 `Phase 1A` 编码。

## 5. 旧方案 vs 新方案总对照

| 维度 | 旧方案容易呈现出来的样子 | 新方案准备冻结的样子 | 为什么要这样改 |
| --- | --- | --- | --- |
| 用户入口 | `TrChat / Scaffold / Provider / overrides` 等概念容易一起出现 | 正式入口只保留 `TrChat` 和 `TrChat.Root` | 降低使用者的决策成本 |
| 页面层定位 | 页面结构容易和入口层混在一起 | `TrChat.Page` 是默认页面层，不是第三入口 | 保留默认页面能力，但不制造第三入口 |
| 黑盒到白盒路径 | 没有一条稳定、正式、可测试的 on-ramp | `createRuntimeFromConfig(config)` 是唯一官方桥接路径 | 给高级用户和实现者一条清晰升级梯子 |
| Root 责任 | 容易重新承担 config 投影和总装配职责 | `Root` 只消费 `{ runtime, ui }` | 防止白盒入口重新退化成黑盒装配层 |
| UI 配置 | 容易混入结构和行为 owner | `ui` 只保留 display-only | 保持职责清晰，避免配置层偷藏行为 |
| runtime owner | 容易按页面区块、按钮、现有实现切 | 按 source of truth 切 | 后续扩展和测试更稳 |
| 页面组合 | `Page` 容易变成“什么都能拿”的 relay | `Page` 只做 composition | 保护白盒分层不被打穿 |
| 消息动作定位 | 容易继续用 messageIndex / 位置语义兜底 | `messageId` 是唯一稳定定位键 | edit / retry / regenerate / hydrate 才能稳定 |
| 阶段推进 | 容易先冲 `Page` 和黑盒主路径 | 先 freeze contract，再做 Phase 1A foundation | 先站稳底座，减少返工 |

## 6. 如果 Review A 通过，立刻能开始写什么

这部分是这轮最关键的“可开工说明”。如果这里说不清，就算方向合理，也不算真正能开工。

### 6.1 Phase 1A 立刻可以开的 5 个实现包

#### 实现包 1：runtime foundation

目标：

- 把 `conversation / sender / message / attachments` 这 4 个 owner 的最小 runtime 建起来。

最小交付物：

- `ChatUIMessage`
- `createConversationRuntime`
- `createSenderRuntime`
- `createMessageRuntime`
- `createAttachmentsRuntime`
- `createTransportRuntime`

这个包解决的问题：

- 消息主链路有没有稳定 owner
- sender 和 attachments 的 handoff 能不能真正落地
- `messageId` 能不能成为稳定动作定位键

#### 实现包 2：Root baseline

目标：

- 让 `TrChat.Root({ runtime, ui })` 成为真实可运行入口。

最小交付物：

- `TrChat.Root`
- 最小 provide / inject 边界
- `Root + primitives` 最小链路可运行

这个包解决的问题：

- 白盒入口是不是只吃 `{ runtime, ui }`
- `Root` 有没有重新退化成第二套黑盒装配层

#### 实现包 3：bridge baseline

目标：

- 让 `createRuntimeFromConfig(config)` 先支持 `Phase 1A` subset。

最小交付物：

- `createRuntimeFromConfig(config)`
- `Phase 1A` bridge subset 的字段映射

`Phase 1A` 只需要支持的域：

- `request.transport`
- `request.systemPrompt`
- `request.defaultModelId` 的 fixed-default-only 注入
- `conversation.initialMessages`
- `conversation.persistence` 的 active-conversation hydrate / restore
- `ui.*`
- `sender.*`
- `attachments.*`
- `messages.actions`
- `messages.renderers`
- `messages.feedback`
- `lifecycle.beforeSend`
- `lifecycle.error`

当前明确不要求支持：

- `history.*`
- `workspace.*`
- `models.*`
- `mcp.*`
- `messages.transforms`
- `lifecycle.afterReceive`
- `lifecycle.modelChange`
- `lifecycle.conversationChange`

这个包解决的问题：

- 黑盒到白盒是不是已经有可信 on-ramp
- `Phase 1A` 能不能在不假装“完整黑盒覆盖”的前提下真实开工

#### 实现包 4：最小 UI baseline

目标：

- 让 `Phase 1A` 不是只有 runtime，没有最小可见链路。

最小交付物：

- `TrChat.Message`
- `TrChat.MessageList`
- `TrChat.Sender`

这个包解决的问题：

- 基础 message / sender 主链路有没有真正跑起来
- runtime contract 能不能被最小 UI 消费面验证

#### 实现包 5：contract tests baseline

目标：

- 让这轮冻结的 contract 不只停在 prose。

最小交付物：

- runtime contract tests
- message extension 最小 contract tests
- sender / attachments handoff tests
- `Root + createRuntimeFromConfig` 最小链路测试

这个包解决的问题：

- 这轮评审拍板的内容，能不能在编码中持续约束实现

### 6.2 Review A 通过后还不能直接写什么

下面这些内容不要在 `Phase 1A` 提前展开：

- 完整 `TrChat.Page`
- `history / models / workspace` baseline
- 黑盒 `TrChat` 新主路径全量回切
- 所有 slot catalog 的完整消费面
- `Page` shell 的完整 app-shell 体验
- `Phase 2/3/4` 的 parity 工作

原因不是这些不重要，而是：

- 它们都依赖 `Phase 1A` foundation 稳定
- 现在先写，只会把后面的返工提前制造出来

### 6.2A Review A 会前允许做到什么 preview

如果评审对象时间有限，`Review A` 会前允许做一小批 `Phase 1A preview`，但这批 preview 的角色必须非常清楚：

- 它不是 `Phase 1A` 完成报告
- 它不是新的规范来源
- 它只用来证明当前冻结的 `Must Freeze Now` contract 具备最小可实现性

允许做的 preview 建议只限制在下面 5 包：

1. runtime foundation preview
2. Root baseline preview
3. bridge baseline preview
4. minimal UI baseline preview
5. targeted contract tests preview

这 5 包的目标不是“把第一阶段先偷偷做完”，而是：

- 证明 `Root + bridge + minimal UI` 这条最小链路真的能跑
- 证明 `messageId`、sender / attachments handoff、bridge subset 这些高风险 contract 不是空讲
- 让评审从抽象争论变成对可行性的判断

### 6.2B Review A 会前不允许 preview 提前做什么

为了避免 preview 反向绑架方案，下面这些内容不应该在 `Review A` 会前被做成“既成事实”：

- 完整 `Page baseline`
- `history / models / workspace` baseline
- 黑盒 `TrChat` 新主路径回切
- 完整 slot 消费面或完整 slot parity
- 最终 public surface / export 收口

一句话规则：

- preview 只能证明 `Must Freeze Now` 可实现，不能提前偷做 `Review B` 才该冻结的内容

### 6.2C 带着 preview 开会时到底在看什么

如果你带着 preview 去开 `Review A`，你真正要请对方判断的不是“这批代码写得好不好”，而是下面 3 件事：

1. 这批 preview 有没有证明当前 contract 不是纸上设计
2. 这批 preview 有没有暴露出当前 contract 缺失的关键开工门禁
3. 这批 preview 有没有越界，提前做进了 `Review B` 才该决定的内容

也就是说，preview 在 `Review A` 里的法律地位始终是：

- evidence
- feasibility signal
- not a second source of truth

### 6.2D Review A 通过后怎么处理 preview

如果 `Review A` 结果是：

- `pass`
  这批 preview 可以直接升级成正式 `Phase 1A`
- `pass with follow-ups`
  先修 preview 和 contract 的偏差，再升级成正式 `Phase 1A`
- `blocked`
  回到 review docs / normative docs 重新拍板，不允许让 preview 继续扩张并替代设计决策

### 6.3 Review A 通过后的第一周任务顺序

如果这轮通过，建议你按下面顺序组织第一周工作：

1. 先把 runtime foundation 的类型、factory、owner 划清
2. 再把 `Root` 的输入、provide / inject、最小 runtime 消费面打通
3. 再补 `createRuntimeFromConfig(config)` 的 subset bridge
4. 再接 `Message / MessageList / Sender` 最小 UI baseline
5. 最后把 contract tests 补上

这个顺序的目标很明确：

- 先站住 owner 和数据流
- 再让白盒最小主链路跑起来
- 最后用 tests 锁住

### 6.4 Review A 通过后的不可回退结论

只要这轮评审通过，下面这些不应该在编码中被临时推翻：

- `TrChat / TrChat.Root / TrChat.Page` 的角色关系
- `Root` 只吃 `{ runtime, ui }`
- `ui` 是 display-only
- runtime 按 source of truth 切分
- `Page` 是 composition-only
- `messageId` 是稳定动作定位键
- `Phase 1A` 只承诺 bridge subset，而不是完整黑盒覆盖

如果编码中发现这些点站不住，应回到评审层重新拍板，而不是在实现里临时改口。

### 6.5 关于 preview 的最后一条边界

如果你在会前准备了 preview，需要始终记住：

- preview 是 evidence，不是 normative source
- 如果 preview 和已冻结的 review docs / 规范文档冲突，以后者为准
- preview 的价值是帮助评审判断“能不能开工”，不是替代评审去决定“应该怎么设计”

## 7. 卡片 A：入口心智为什么要收敛成 `TrChat / Root / Page`

### 7.1 旧方案在使用感知上是什么样

旧方案里，使用者很容易同时接触到这些概念：

- `TrChat`
- `Scaffold`
- `Provider`
- `presetOverrides`
- 多种 callbacks / integrations
- 白盒拼装路径里的页面结构和 runtime 概念

结果不是“概念多”这么简单，而是“入口层级和职责不清”：

- 有些概念像入口
- 有些概念像注入层
- 有些概念像默认页面层
- 但在使用时经常被混在一起理解

### 7.2 旧方案为什么会带来持续问题

它会直接带来 4 类代价：

1. 黑盒用户不知道什么时候该停在 `TrChat`
2. 进阶用户不知道白盒路径应该从哪里开始
3. 页面结构、runtime、slot、默认实现会被一起当成“都能改的东西”
4. 文档、demo、实现、评审很难围绕同一条心智收口

继续沿着旧方案演进，后面只会出现：

- 新概念继续堆上去
- 黑盒和白盒边界继续模糊
- 评审只能靠口头解释补洞

### 7.3 新方案具体怎么切

这轮准备把入口心智收敛成：

- `TrChat`
  黑盒默认入口
- `TrChat.Root`
  白盒正式入口
- `TrChat.Page`
  官方默认页面层，挂在 `Root` 之上，但不是第三入口

真正对外的“入口”只有两层：

- 黑盒：`TrChat`
- 白盒：`TrChat.Root`

`Page` 不是和这两者并列的另一层入口，而是白盒路径里的官方默认 page layer。

### 7.4 为什么不是别的切法

#### 方案 A：继续把 `Scaffold / Provider` 暴露成主要用户心智

不采用的原因：

- 它们更像内部装配层术语，不像产品 API
- 用户会继续按实现阶段理解 API，而不是按能力理解 API
- 评审和文档仍然要靠解释“这层到底给谁用”

#### 方案 B：把 `Page` 做成第三入口

不采用的原因：

- 用户会误以为 `TrChat`、`Root`、`Page` 是并列三层系统
- `Page` 极易被做成“什么都能管”的中间总线
- 后面的 slot、region、runtime owner 全会跟着漂

#### 方案 C：只保留 `TrChat` 和 `Root`，把 `Page` 完全内部化

这轮不采用的原因：

- 用户确实会真实经历 `TrChat -> Root + Page -> Root + primitives` 这条升级梯子
- 如果不显式文档化 `Page`，高级用户会缺少可信的官方默认 page layer
- 但要明确：它是默认页面层，不是独立入口

### 7.5 改完之后用户会怎么理解

对使用者来说，选择路径会更清楚：

- 想快速接入，用 `TrChat`
- 想自己控制 runtime 和页面拼装，从 `TrChat.Root` 进入
- 想在白盒路径里复用官方默认页面，就搭配 `TrChat.Page`
- 想继续拆得更细，就在 `Root` 下直接用 primitives

也就是：

```text
TrChat
-> TrChat.Root + TrChat.Page
-> TrChat.Root + primitives
```

### 7.6 当前阶段冻结到哪里

这轮只需要把这件事做到“心智冻结”：

- 评审人接受这三个对象的定位
- 后续 contract 和实现都围绕这条关系展开

本轮不要求：

- 证明 `Page` 的完整实现已经成立
- 证明所有 primitives 都已经准备完

### 7.7 这个卡片最容易被追问的点

最容易被追问的是：

- 既然 `Page` 不是第三入口，为什么还要保留它的公开定位？

建议回答：

- 因为用户真实会沿这条升级路径走
- 公开 `Page` 是为了给白盒路径一个官方默认页面层
- 不把它定义成第三入口，是为了防止它吞入口语义和 runtime 语义

## 8. 卡片 B：为什么桥接路径必须是 `config -> runtime/ui -> Root`

### 8.1 旧方案在桥接上是什么样

旧方案里，`config` 往往不只是配置，还经常承担这些角色：

- 页面默认行为
- 运行态能力注入
- UI 展示控制
- callbacks / integrations 入口
- 某些隐式投影或装配逻辑

结果是：

- `config` 像一个“所有事情都往里塞”的总入口
- `Root` 或类似白盒入口容易重新承担隐式装配职责
- 黑盒到白盒之间没有明确、稳定、可测试的桥

### 8.2 旧桥接为什么不稳

最直接的问题有 3 个：

1. 黑盒和白盒之间没有一个正式、稳定的过渡点
2. `Root` 容易被做成“既懂 config，又懂 runtime，又懂页面结构”的总装配层
3. 很难在测试里独立验证“config 域映射是否正确”和“页面消费是否正确”

### 8.3 新桥接怎么定义

新的切法是：

1. 黑盒继续吃 `TrChatConfig`
2. `createRuntimeFromConfig(config)` 负责把黑盒配置桥接成 `{ runtime, ui }`
3. `TrChat.Root` 只消费 `{ runtime, ui }`

也就是说：

- `config` 是黑盒侧的声明式输入
- `{ runtime, ui }` 是白盒侧的正式输入
- `createRuntimeFromConfig` 是两者之间唯一官方桥接入口

### 8.4 为什么一定要把 Root 输入切这么干净

如果 `Root` 继续直接吃大包 config，会出现两个后果：

1. `Root` 会重新退化成巨型协调层
2. 同一套能力在黑盒和白盒里会形成两套隐式映射

这和这轮重构的目标是相反的。

### 8.5 为什么 `Phase 1A` 的 bridge subset 是现在这组

当前 subset 的挑选标准只有两条：

1. 能直接支撑最小 message / sender / attachments 主链路
2. 不会把 `history / workspace / models / mcp / Page` 等后续层提前拉进来

基于这个标准：

- `messages.actions / renderers / feedback` 进 `Phase 1A`
  因为它们直接影响最小消息主链路能否形成
- `messages.transforms` 不进 `Phase 1A`
  因为它更像 message runtime 的扩展管线，过早冻结会影响后续扩展策略
- `lifecycle.beforeSend / error` 进 `Phase 1A`
  因为它们直接影响发送主链路和错误反馈
- `afterReceive / modelChange / conversationChange` 不进 `Phase 1A`
  因为它们依赖更后面的 message/history/models owner 收口

### 8.6 `conversation.persistence` 为什么只切 active-conversation restore

这是为了把“当前会话恢复”和“多会话历史管理”切开：

- `conversation.persistence`
  只负责当前 active conversation 的 hydrate / restore
- `history runtime`
  才负责多会话列表、切换、标题、管理态

如果这里不先切开，`Phase 1A` 编码时就会很容易再次把 history 责任偷回到 conversation。

### 8.7 当前阶段冻结到哪里

这轮只要求接受：

- 这条桥接路径是唯一官方路径
- `Root` 的输入边界已经冻结
- `createRuntimeFromConfig` 当前只承诺 subset，不宣称完整黑盒覆盖

这轮不要求：

- 立刻覆盖所有 config 域
- 立刻完成所有 feature parity

### 8.8 这个卡片最容易被追问的点

最容易被追问的是：

- `createRuntimeFromConfig` 会不会成为新的超级总线？

建议回答：

- 不会，因为它的职责是 bridge，而不是入口层
- 它的输入始终是 config，输出始终是 `{ runtime, ui }`
- 一旦它开始重新承载页面结构、slot、完整 feature parity，它就越界了

## 9. 卡片 C：为什么 runtime、ui、Page 必须这样切

### 9.1 旧方案里最容易混在一起的三层

旧方案里，最容易混在一起的是：

- 运行态 owner 和状态
- UI 展示配置
- 页面层的组合和 slot 承接

当这三层混在一起时，会出现：

- `ui` 不只是 display，还夹带行为和结构信息
- runtime 切法跟页面长什么样强耦合
- `Page` 变成“反正什么都能拿”的中继层

### 9.2 为什么这会成为后续所有问题的根

这会直接导致：

1. owner 不清楚，后续功能一加就打架
2. slot props 和 region 读什么不清楚
3. `Page` 很容易成为事实上的 whole-runtime relay
4. 测试只能测最终表现，测不了中间 contract

### 9.3 新边界怎么定义

这轮冻结下面三条边界：

1. `ui` 只负责 display-only
2. runtime 按 source of truth 切分
3. `Page` 是 composition-only

### 9.4 `ui` 里能放什么，不能放什么

可以放：

- 文案默认值
- 标题、副标题、空态提示
- 展示层布局默认值
- 主题、视觉样式相关默认值
- sender 展示层占位文案、按钮文案

不能放：

- send / retry / regenerate 等行为 owner
- history 的真实会话状态
- workspace 区域的业务数据 owner
- models 的真实选中状态 owner
- message actions 的执行逻辑 owner
- slot catalog 和页面结构 owner

一句话判断：

- 如果它回答的是“怎么展示”，倾向归 `ui`
- 如果它回答的是“谁拥有状态和能力”，就不该进 `ui`

### 9.5 runtime 按 source of truth 切是什么意思

意思是：runtime 的边界由“真正拥有状态与能力的对象”决定，而不是由页面上有没有某个区域或按钮决定。

例如：

- conversation runtime
  拥有会话内消息主链路和发送过程
- message runtime
  拥有消息扩展、renderer 选择、actions、feedback、message-level 语义
- sender runtime
  拥有输入、发送入口、sender 行为
- attachments runtime
  拥有附件状态和 handoff
- history runtime
  拥有多会话列表、切换、管理态
- workspace runtime
  拥有壳层区域和 workspace 结构状态

### 9.6 `Page` 为什么必须保持 composition-only

`Page` 的职责应该是：

- 组合 region
- 挂接官方默认页面布局
- 向 slot 提供最小必要 props

`Page` 不应该负责：

- 重新整理 whole runtime
- 透传整个 runtime 给 slot
- 成为“什么都能从这里拿”的中继层

否则一旦 `Page` 变成 relay，`Root + primitives` 这条白盒路径就会被打穿，最后一切又会退回“都从 Page 拿”。

### 9.7 `messageId` 为什么要在这轮冻结

因为只要 message action 还依赖位置语义、`messageIndex`、临时数组顺序，后面这些行为都会不稳：

- regenerate
- retry
- edit rollback
- hydrate restore
- optimistic message
- stream 更新和重组

所以这轮必须把 `messageId` 冻结成唯一稳定动作定位键。

### 9.8 当前阶段冻结到哪里

这轮只做到：

- owner tables 和读取边界冻结
- `ui` display-only 的边界冻结
- `Page` composition-only 的边界冻结
- `messageId` 语义冻结

这轮不做到：

- 所有 slot 细节完全实现
- `Page` baseline 完全可运行

### 9.9 这个卡片最容易被追问的点

最容易被追问的是：

- 如果后面某个能力同时影响 message、conversation、history、workspace，最终归谁？

建议回答：

- 先看谁拥有真实 source of truth
- 再看谁负责对外暴露稳定行为
- 最后才看页面上在哪个区域显示
- 不能按“UI 在哪”反推 owner

## 10. 卡片 D：为什么现在先做 Phase 0.5 / Phase 1A

### 10.1 为什么不直接先做 Page baseline 或黑盒新主路径

因为它们都建立在 foundation 之上：

- runtime owner
- `messageId`
- sender / attachments handoff
- bridge subset
- message extension owner

如果这些底层 contract 还没冻住，就先推 `Page` 或黑盒主路径，后面一改底层 contract，返工成本会非常高。

### 10.2 Phase 0.5 这轮到底冻结什么

这轮希望冻结：

- runtime owner tables
- `Root / Page / primitives` 读取边界
- slot catalog 与 `Page` slot-provider contract
- `createRuntimeFromConfig(config)` 的 bridge subset
- `messageId`
- `sender / attachments` handoff
- message extension owner

这轮不冻结：

- 最终 public surface 全量收口
- 所有 feature parity 细节
- `Page baseline` 的完整视觉和 app-shell 形态

### 10.3 Phase 1A 为什么只做 foundation

因为这一阶段的目标不是“看起来像完整产品”，而是证明下面这套底座真的能跑：

- `conversation / sender / message / attachments` baseline
- `Root + createRuntimeFromConfig` baseline
- targeted contract tests

它解决的是“这套切法能不能活”，而不是“这套方案看起来像不像最终 UI”。

### 10.4 什么结果算 `Phase 1A` 真正完成

要同时满足下面 4 条：

1. `conversation / sender / message / attachments` baseline 已实现
2. `Root + createRuntimeFromConfig` baseline 已实现
3. targeted contract tests 已通过
4. 编码中没有未回写的关键偏差

如果只是：

- 写了一堆 types
- 写了 factory 骨架
- 或者 UI 组件能渲染但链路不通

都不算完成。

### 10.5 这轮最容易被忽略的风险是什么

不是“做不出来”，而是：

- contract 还没收口，就急着往 `Page`、黑盒主路径、feature parity 推

这会让整个阶段顺序失控。

### 10.6 这个卡片最容易被追问的点

最容易被追问的是：

- 这轮如果 `pass with follow-ups`，哪些 follow-ups 不影响开工，哪些会阻塞开工？

建议回答：

- 只要影响 `Root` 输入边界、`ui` 边界、`messageId`、bridge subset 的 follow-up，都应视为阻塞项
- 只要还停留在 `Footer` 落位、Phase 1B 次序、后续公开面收口方式，就可以记录为后续项

## 11. 如果评审人继续追问，我建议你直接这样回答

### 11.1 “为什么还要保留 `TrChat.Page`，不直接只留 `TrChat` 和 `Root`？”

建议回答：

- 因为用户真实会沿 `TrChat -> Root + Page -> Root + primitives` 这条梯子往下走
- `Page` 公开存在，是为了给白盒路径一个官方默认页面层
- 但它不是第三入口，否则后面会吞掉入口语义和 runtime 语义

### 11.2 “`Root` 只吃 `{ runtime, ui }` 会不会切得太硬？”

建议回答：

- 这是故意切硬，因为不这样切，`Root` 很快又会退化成第二套黑盒装配层
- 真正拥有状态和能力的都应该进 runtime
- 真正只回答展示默认值的进 `ui`
- 既不属于 runtime，也不属于 display-only 的内容，说明 owner 还没切清，不该偷塞进 `Root`

### 11.3 “为什么 bridge subset 是现在这组，不是别组？”

建议回答：

- 判断标准不是“字段看起来重不重要”，而是“能不能直接支撑最小主链路”
- `Phase 1A` 只保留 message / sender / attachments / conversation 最小链路必须要用到的域
- 任何会把 `Page / history / workspace / models / mcp` 提前拖进来的域，都先不承诺

### 11.4 “`messageId` 真的足够稳定吗？”

建议回答：

- 这轮不是证明所有实现细节都已经完善，而是先冻结语义：message action 不再依赖位置语义
- 后续 `Phase 1A` 会用 runtime tests 去证明它在 regenerate、retry、edit、restore、optimistic 场景下站得住
- 如果这些 tests 站不住，应回到评审层，不是临时改口

### 11.5 “为什么 `messages.transforms` 不在 `Phase 1A`？”

建议回答：

- 因为它不是最小主链路的前置条件
- 它属于 message runtime 的扩展管线，过早冻结会压缩后续扩展空间
- 这轮先把 `actions / renderers / feedback` 落稳，再收 transforms 更安全

### 11.6 “`conversation.persistence` 和 `history` 真的能切开吗？”

建议回答：

- 这轮故意只把 `conversation.persistence` 缩成 active-conversation hydrate / restore
- 多会话列表、切换、标题、管理态全部推给 `history runtime`
- 如果编码时发现这两者又混回去，就说明 owner 还没切干净，必须回到设计层重拍

### 11.7 “这轮通过后，第一周到底写什么？”

建议回答：

1. 先把 runtime foundation 的类型和 owner 立起来
2. 再打通 `Root` 的最小 provide / inject 链路
3. 再补 `createRuntimeFromConfig(config)` subset bridge
4. 再接最小 `Message / MessageList / Sender`
5. 最后补 contract tests

### 11.8 “如果这轮只是方向通过，为什么你说能直接开工？”

建议回答：

- 因为这轮不是纯方向会，而是方向 + contract sign-off
- 只要硬门禁问题答稳，就应该直接把它当成开工签字会
- 如果评完还要再开一场“才能开工”的会，说明本轮 scope 还是切错了

## 12. 如果这轮不过，优先怎么回改

### 12.1 如果问题出在入口心智

优先回改：

- 第 7 章卡片 A 的“为什么不是别的切法”
- `Page` 的定位表述是否还在让人误解为第三入口

### 12.2 如果问题出在桥接路径

优先回改：

- 第 8 章卡片 B 的 subset 挑选标准
- `Root` 输入边界是不是仍然含糊
- `conversation.persistence` 和 `history` 的 owner 是否还不够清晰

### 12.3 如果问题出在边界切法

优先回改：

- 第 9 章卡片 C 的具体例子
- `ui` 能放什么、不能放什么
- `Page` 为什么不能做 relay 的论证

### 12.4 如果问题出在阶段拆法

优先回改：

- 第 6 章的可开工包
- 第 10 章的 `Phase 1A` 完成标准
- 阻塞项和 follow-up 项的边界

## 13. 一句话总括

这轮不是在评“全部细节是否都完美”，而是在评：

> 这套 chat 重构是否已经形成一条清楚、可解释、可冻结 contract、并且评完就能直接进入 `Phase 1A` 编码的主路径。
