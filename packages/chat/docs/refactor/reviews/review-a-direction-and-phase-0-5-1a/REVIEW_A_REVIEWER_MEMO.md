# Review A Reviewer Memo

## 1. 这次我想和你讨论什么

这次我想和你一起拍板 5 个问题，并判断这轮评审结束后能不能直接进入 `Phase 1A`：

1. `TrChat / TrChat.Root / TrChat.Page` 这组入口心智是不是足够清楚
2. `ui`、runtime、`Page` 的边界切法是不是合理
3. `config -> createRuntimeFromConfig(config) -> { runtime, ui } -> TrChat.Root` 这条桥接路径是不是成立
4. 当前 `Phase 0.5` 冻结下来的 contract package，是不是已经足够支撑 `Phase 1A`
5. `Phase 1A` 的 scope / gate / exit criteria 是不是可以直接作为开工门禁

这次不要求你提前看完所有长文档，也不要求你评后面所有阶段的细节。

我更希望你重点帮我判断：

- 这轮是否可以给出 `pass / pass with follow-ups / blocked`
- 是否可以直接进入 `Phase 1A`
- 如果还不能开工，最该先回写哪一块 contract 或阶段门禁

换句话说，这次不是一场泛泛的方向聊天，而是一场 `Review A` 开工签字评审。

## 2. 现在为什么必须重构

我现在看到的主要问题，不是单点 bug，而是整体结构已经开始影响后续开发：

1. 入口太多，不容易理解  
   使用者很容易同时接触 `TrChat`、`Scaffold`、`Provider`、各种 overrides 和 integrations，不容易判断自己应该从哪里开始。

2. 从黑盒到白盒，没有一条清楚的升级路径  
   现在黑盒能用，但一旦想往下拆，就缺少一条正式、清楚、可测试的过渡方式。

3. 配置、数据、页面结构混在一起  
   同一个能力到底属于配置、属于内部状态、还是属于页面层，经常说不清楚。

4. 很多行为还靠历史习惯维持  
   不少地方更多靠“以前就是这么做的”，而不是靠清楚的约定和测试来保证。

所以这次重构，不是简单整理几个 API，而是要把整个 chat 的主路径重新梳理清楚。

## 3. 第一部分：先把 `TrChat` 这一层讲清楚

这一部分只回答一个问题：

> 用户到底应该怎么进入这套系统。

### 我的建议

我准备把入口收成两层：

- `TrChat`
- `TrChat.Root`

其中：

- `TrChat` 继续保留，仍然是默认入口
- `TrChat.Root` 是更底层、更可控的入口
- `TrChat.Page` 继续保留，但它不是第三个入口，而是默认页面层

我希望未来用户是沿着这条路径逐步往下走：

```text
TrChat
-> TrChat.Root + TrChat.Page
-> TrChat.Root + primitives
```

### 为什么我要这么改

因为现在入口概念太多，而且彼此边界不清。

如果不收口，后面很容易继续出现这些问题：

- 使用者不知道该停在 `TrChat`，还是应该继续往下拆
- 进阶使用者不知道真正的白盒起点在哪里
- `Page` 很容易又被理解成一个新的独立入口

### 这一部分我想请你重点帮我看什么

1. `TrChat / TrChat.Root / TrChat.Page` 这三者的关系是不是清楚
2. `TrChat.Page` 会不会仍然容易被误解成第三个入口

## 4. 第二部分：再把数据和能力怎么分讲清楚

这一部分只回答一个问题：

> 系统内部的数据、状态、能力，到底归谁负责。

### 我的建议

我准备把内部能力按“真实归属”来分，而不是按页面上长什么样来分。

这次我想先明确 3 条原则：

1. `ui` 只负责展示默认值和展示配置
2. 真实数据和行为，放到各自的运行层里
3. `Page` 只负责组合页面，不负责兜底管理所有内部能力

当前第一阶段最关键的 4 个部分是：

- `conversation`
- `message`
- `sender`
- `attachments`

这也是为什么我第一阶段不先做完整页面，而是先把这几个基础部分做稳。

### 为什么我要这么改

如果不把这几层拆开，后面最容易出现这些问题：

1. 职责越来越不清楚  
   一个能力到底该归哪里，每次都要重新判断。

2. `ui` 越界  
   本来只应该放展示相关内容，最后又混进了行为控制和业务逻辑。

3. `Page` 变成中转站  
   页面层很容易变成“什么都能从这里拿”的地方，最后分层就会被打穿。

### 这一部分我希望现在至少明确什么

这轮我希望至少把下面几点说清楚：

- `ui` 只负责展示
- 真实数据和行为不放在 `ui`
- `Page` 只负责组装页面
- `messageId` 是消息相关动作的稳定定位方式
- sender 和 attachments 的分工边界

### 这一部分我想请你重点帮我看什么

1. 这些职责这样分，是不是合理
2. `ui` 和内部运行层的边界是不是够清楚
3. `Page` 这样定义，后面会不会还是很容易越界

## 5. 第三部分：最后再讲黑盒和白盒怎么接起来

这一部分只回答一个问题：

> 黑盒模式怎么平滑过渡到白盒模式。

### 我的建议

我准备把这条路径收成一条固定的流程：

```text
TrChat(config)
  -> createRuntimeFromConfig(config)
  -> { runtime, ui }
  -> TrChat.Root({ runtime, ui })
```

也就是说：

- 黑盒继续使用 `TrChatConfig`
- 中间通过 `createRuntimeFromConfig(config)` 做转换
- `Root` 只接收转换后的结果

### 为什么我要这么改

因为黑盒和白盒之间不能再有很多条半正式的过渡方式。

如果后面又出现：

- 这里也能转一点
- 那里也能自己补一点
- `Root` 也顺手再接一部分 config

那黑盒到白盒的过渡路径又会重新变模糊。

所以我想把它收成一句很明确的话：

> `config` 是黑盒输入，`{ runtime, ui }` 是白盒输入，`Root` 只接收后者。

### 这一部分我想请你重点帮我看什么

1. 这条过渡路径是不是自然
2. `Root` 只接收 `{ runtime, ui }` 会不会太死

## 6. 为什么第一阶段先做 `Phase 0.5 / Phase 1A`

我这次不打算一开始就冲完整页面，也不打算一开始就把黑盒主路径全部改完。

我想先做两件事：

- `Phase 0.5`：先把第一批必须说清楚的约定定下来
- `Phase 1A`：先把最核心的基础部分做起来

原因很简单：

1. 最难返工的，不是页面外观，而是底层职责分配、过渡方式、消息定位方式、发送和附件的配合方式
2. 如果 `Root + createRuntimeFromConfig` 这一层没先站住，后面的页面层和黑盒主路径都没有稳定基础
3. 先把最小基础做起来，更容易判断后面是不是还在正确方向上

## 7. 这轮评审至少要把哪些内容定下来

为了保证这轮评完能直接开工，我想把内容分成 3 组来看：

### 这一轮必须定下来的

这些是评完之后立刻开始开发一定会用到的内容：

- `TrChat / TrChat.Root / TrChat.Page`
- `createRuntimeFromConfig(config) -> { runtime, ui }`
- `Root` 只接收 `{ runtime, ui }`
- 第一阶段直接会依赖的运行层和基础组件约定
- 核心 slot 约定

这里的核心 slot 约定，以 `api-runtime.md` 里当前已经冻结的最小 slot catalog 为准：

- replace slots：
  `header`、`welcome`、`message-list`、`sender`、`left`、`left-rail`、`right`、`mobile-left`、`mobile-right`
- augment slots：
  `header-before`、`header-after`、`message-before`、`message-after`、`sender-before`、`sender-after`、`footer-extra`

### 这一轮先定原则，但不展开全部细节的

- `Page` 怎么给 slot 提供数据
- slot 可以拿到哪些最小信息
- 页面在简化模式下如何退化
- `Page` 只负责组合页面这一点怎么落实

### 留到下一轮再展开的

- 完整 `Page` 页面层
- `history / models / workspace` 的完整消费方式
- 独立 `footer` replace slot 与 `Footer` 的最终落位
- 最终公开面和更细粒度的 slot 命名

## 8. 我希望第一阶段完成时至少达到什么程度

我目前希望第一阶段至少做到：

- `conversation / sender / message / attachments` 这几个基础部分已经站住
- `Root + createRuntimeFromConfig` 这条最小链路已经跑通
- 针对核心约定的测试已经补上
- 没有发现但还没回写的关键偏差

换句话说，第一阶段不是“先写一堆类型和空壳就算完成”，而是基础部分已经真的能工作。

## 9. 这次我最想请你帮我拍板的 5 个问题

### 1. 入口层是否合理

我想请你看：

- `TrChat / TrChat.Root / TrChat.Page` 的关系是不是清楚
- `Page` 会不会还容易被误解

### 2. 数据和能力的分配是否合理

我想请你看：

- 这些职责这样分是不是合理
- `ui` / 内部运行层 / 页面层 的边界是不是清楚

### 3. 黑盒到白盒的过渡方式是否合理

我想请你看：

- `config -> runtime/ui -> Root` 这条路径是不是自然
- `Root` 只接收 `{ runtime, ui }` 是否合理

### 4. 当前 `Phase 0.5` contract package 是否已经足够开工

我想请你看：

- 这轮定下来的内容是不是已经足够支撑 `Phase 1A` 开始开发
- 现在还有没有明显漏掉的关键问题

### 5. `Phase 1A` 的拆法是否合理

我想请你看：

- 先做 foundation、再做 `Page baseline` 和黑盒主路径，这个顺序是不是合理
- 当前 `Phase 1A` 的 scope / gate / exit criteria 是否足够支撑直接开工

## 10. 这次不需要你先评的内容

为了控制会议范围，这次先不展开：

- 所有 slot 的逐项实现细节
- helper 最终公开面
- compatibility / migration / deprecation
- Phase 2 以后所有 feature parity 细节
- `packages/kit` 的长期下沉策略

如果你觉得这些内容有风险，我会先记下来，但不拿它们阻塞这轮判断。

## 11. 我希望这次会议最后得到什么

我希望最后能收出 4 个结论：

1. `Review A` 的结论是 `pass / pass with follow-ups / blocked`
2. 是否完成当前 `Phase 0.5` contract sign-off
3. 是否可以直接进入 `Phase 1A`
4. 如果还不能开工，我最应该先改哪一块

## 12. 如果你时间有限，只看这几句就够了

- 这次重构不是改几个 API，而是在重新梳理 chat 的主路径和边界
- 我想先把 `TrChat` 这一层讲清楚，再把内部数据和能力怎么分讲清楚，最后把黑盒到白盒怎么过渡讲清楚
- 我想把入口收成 `TrChat` 和 `TrChat.Root`，把 `Page` 放回默认页面层
- 我想把黑盒到白盒的路径收成：`config -> createRuntimeFromConfig -> { runtime, ui } -> Root`
- 我想第一步先把该定下来的约定定下来，再把最核心的基础部分做起来
- 这次我最需要你帮我判断的是：入口层、职责划分、桥接路径、当前 contract package 和 `Phase 1A` 拆法是否都合理，以及这轮评完能不能直接开工
