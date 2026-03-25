# useChatKit 10 分钟团队宣讲提纲

## 1. 使用说明

这份提纲按 10 分钟准备，目标不是把所有源码细节一次讲完，而是让团队成员在短时间内建立下面三个共识：

- `useChatKit` 在整体架构里到底是什么
- 它和基础 `kit` 的关系是什么
- 它为什么要额外做重试、编辑重发、乐观态、错误归一化这些增强

建议的讲法：

- 面向“已经知道 chat 包，但没系统读过运行时代码”的同学
- 先讲职责边界，再讲一条主链，再讲几个关键增强点
- 10 分钟内不要陷入每个 helper 函数的实现细枝末节

---

## 2. 10 分钟时间分配

### 0:00 - 1:00 开场：先把 useChatKit 定位说清楚

建议讲稿：

> 今天这 10 分钟，我们不把 `useChatKit` 当成一个独立引擎来看，而是把它看成 chat 包对 `tiny-robot-kit` 运行时的产品级封装。真正的消息请求、流式处理、插件系统、多会话引擎都还在 `kit`，`useChatKit` 做的是把这些原始能力整理成一套聊天 UI 能直接消费的运行时接口。

本段目标：

- 先纠正一个常见误解：`useChatKit` 不是重新实现了一套 `useMessage`
- 帮听众建立“组合层 / facade 层”的认知

建议展示：

- `packages/chat/src/composables/useChatKit.ts`
- `packages/kit/src/vue/message/useMessage.ts`
- `packages/kit/src/vue/conversation/useConversation.ts`

---

### 1:00 - 2:30 整体链路：从组件入口一路讲到 kit

建议讲稿：

> chat 运行时主链是这样的：`TrChat` 或 `TrChat.Scaffold` 先进入 `ChatScaffold`，`ChatScaffold` 负责从 config 里解析出模型、provider 和 preset，然后创建或复用 `chatKit`。`ChatRoot` 再把 `chatKit` 注入到整棵组件树。真正到了 `useChatKit` 内部，它又拆成三块：`useChatConversation`、`useChatRequest`、`useChatMessages`。而这三块下面最核心的底座，仍然是 `kit` 的 `useConversation` 和 `useMessage`。

建议展示图：

```text
TrChat / TrChat.Scaffold
  -> ChatScaffold
  -> ChatRoot
  -> useChatKit
  -> useChatConversation / useChatRequest / useChatMessages
  -> kit.useConversation
  -> kit.useMessage
```

本段重点：

- 让大家知道代码应该从哪里读起
- 让大家知道 `chat` 和 `kit` 不是平行关系，而是上下层关系

---

### 2:30 - 4:00 基础 kit 能力：chat 到底建立在什么之上

建议讲稿：

> 要理解 `useChatKit`，先要知道底层已经有什么。`useMessage` 负责单个会话里的消息收发、流式 chunk 合并、请求状态机和插件生命周期。`useConversation` 负责多会话、active conversation、消息引擎的惰性创建和消息持久化。换句话说，chat 层没有重新做这些基础设施，而是站在这两层之上做产品语义增强。

推荐强调：

- `useMessage`
  - 发消息
  - 接流
  - 插件系统
  - 请求状态
- `useConversation`
  - 多会话
  - 切换会话
  - 自动保存
  - 惰性引擎

建议点到为止，不在这段深入工具插件实现。

---

### 4:00 - 6:30 useChatKit 自己做了什么

这是整场最重要的部分，建议拆成三点讲。

#### 第一部分：它把底层运行时编排成了一个统一接口

建议讲稿：

> `useChatKit` 对外给到的是一套更稳定的 chat 运行时接口：会话能力、当前消息、UI 友好状态、错误对象、发送、重试、编辑、切换 provider。组件层基本不需要知道底层到底是 `useConversation` 还是 `useMessage`。

可以展示的接口点：

- `messages`
- `status`
- `lastError`
- `sendMessage`
- `retry`
- `editMessage`
- `updateResponseProvider`

#### 第二部分：它增加了 turn 级别的状态管理

建议讲稿：

> `useChatKit` 里最有价值的设计其实不是“发送消息”，而是“跟踪一轮对话”。它会给一轮 user + assistant 绑定一个 `turnId`，然后在消息 `state` 上挂出 `optimistic`、`error`、`isEditing` 这些状态。这样 UI 就可以围绕同一轮对话做乐观渲染、失败重试、编辑态切换。

建议强调四个 state：

- `state.turnId`
- `state.optimistic`
- `state.error`
- `state.isEditing`

#### 第三部分：它增加了产品交互能力

建议讲稿：

> 相比基础 kit，`useChatKit` 最大的增强有三个：第一是结构化错误；第二是失败 turn 的重试；第三是编辑历史消息后的整段重发与失败回滚。这些都不是底层引擎默认提供的产品语义，是 chat 层补出来的。

---

### 6:30 - 8:30 用两个典型场景讲清价值

这一段建议讲两个场景，不要贪多。

#### 场景一：失败重试

建议讲稿：

> 当一次请求失败时，`useChatKit` 不是只记一个全局 error，而是会先把错误归一化，再把错误挂到失败 assistant message 的 `state.error` 上。如果错误可重试，它还会记住这次失败所在的 `conversationId`、`turnId` 和原始 userContent。之后调用 `retry()` 时，会先切回原会话，从失败 user message 那里把整轮失败内容裁掉，再重发原始内容。所以重试语义不是“再发一遍”，而是“替换掉失败的这一轮”。

讲这段时建议指出：

- 为什么错误要挂在 message 上
- 为什么 retry 要按 turn 删一整段，而不是只删 assistant

#### 场景二：编辑消息并重发

建议讲稿：

> `useChatKit` 把编辑历史消息理解成“改写会话历史”，而不是“原地改一条文本”。所以当用户编辑第 N 条消息时，chat 层会先把从第 N 条开始的整个尾部历史深拷贝起来，再乐观地把这段历史裁掉，然后用新内容重发。如果请求成功，这段备份就作废；如果失败，就把那段旧历史整段还原。这就是为什么编辑后的行为看起来是连贯的，而且不会留下半残的上下文。

讲这段时建议强调：

- 这是符合 LLM 对话语义的建模
- 不是简单的“文本编辑”

---

### 8:30 - 9:30 和基础 kit 的关系总结

建议讲稿：

> 所以 `useChatKit` 和基础 `kit` 的关系，不是替代关系，而是增强关系。`kit` 提供的是底层消息和会话基础设施，`chat` 提供的是产品级运行时外观层。它保留了 `kit` 的请求引擎、插件体系和多会话能力，同时增加了更适合界面交互的状态、错误、重试和编辑语义。

建议用一个简单对比表收尾：

| 层级 | 主要职责 |
| --- | --- |
| `kit.useMessage` | 单轮消息请求、流式响应、插件 |
| `kit.useConversation` | 多会话、切换、存储 |
| `chat.useChatKit` | UI 友好状态、失败恢复、编辑重发、provider 切换、组件集成 |

---

### 9:30 - 10:00 收尾：给团队留下三个记忆点

建议讲稿：

> 最后大家只要记住三个点就够了。第一，真正的引擎仍然在 `kit`。第二，`useChatKit` 的核心价值是 turn 级状态管理。第三，重试、编辑重发、乐观态和错误落点，都是 chat 包对基础能力做的产品化增强。

建议收尾金句：

> 可以把 `useMessage` 理解为发动机，把 `useConversation` 理解为底盘，而 `useChatKit` 更像是驾驶舱和整车控制层。

---

## 3. 推荐演示顺序

如果宣讲时会现场打开代码，建议按下面顺序切文件：

1. `packages/chat/src/types/core.ts`
2. `packages/chat/src/composables/useChatKit.ts`
3. `packages/chat/src/composables/useChatConversation.ts`
4. `packages/chat/src/composables/useChatRequest.ts`
5. `packages/chat/src/composables/useChatMessages.ts`
6. `packages/kit/src/vue/conversation/useConversation.ts`
7. `packages/kit/src/vue/message/useMessage.ts`
8. `packages/chat/src/components/chat/ChatRoot.vue`
9. `packages/chat/src/components/render/ErrorRenderer.vue`
10. `packages/chat/src/components/render/EditInputRenderer.vue`

这样顺序的好处是：

- 先从接口入手，避免一开始就陷进实现细节
- 先看 `chat` 如何编排，再看 `kit` 如何执行
- 最后再回到 UI 如何消费运行时状态

---

## 4. 每页或每段建议讲一个什么结论

如果需要拆成 6 到 8 页简报，可以用下面的页标题。

### 第 1 页：useChatKit 是什么

- 它是 chat 包的运行时 facade
- 它不是对 `useMessage` 的重复实现

### 第 2 页：整体运行时链路

- 入口如何走到 `useChatKit`
- `useChatKit` 如何下沉到 `kit`

### 第 3 页：基础 kit 已经提供了什么

- `useMessage`
- `useConversation`

### 第 4 页：useChatKit 额外加了什么

- UI 状态
- 错误归一化
- retry
- 编辑重发

### 第 5 页：一轮失败与重试

- 错误如何落到消息上
- retry 如何删 turn 并重发

### 第 6 页：一轮编辑与回滚

- 编辑为什么要裁掉后续历史
- 失败时为什么能恢复

### 第 7 页：和 UI 的连接方式

- `ChatRoot` provide
- 渲染器和 sender 如何消费状态

### 第 8 页：三点结论

- 引擎在 kit
- 价值在 turn 管理
- chat 做的是产品化封装

---

## 5. 宣讲时可以重点强调的代码点

如果时间有限，建议只重点展示下面这些实现点：

### 必讲

- `useChatKit` 里三块子模块的组合
- `onTurnError` 的错误处理和 retryContext 记录
- `markOptimisticTurn` 的 `turnId` 设计
- `retry()` 如何裁掉失败 turn
- `editMessage()` 如何裁掉历史并重发

### 选讲

- `useChatRequest` 的状态映射
- `useChatConversation` 的首轮自举逻辑
- `updateResponseProvider` 如何支持模型切换

### 可略讲

- 具体 UI 组件样式
- 非核心 feature preset 解析

---

## 6. 可能被问到的问题

### Q1：为什么不用 `kit`，还要多一层 `useChatKit`？

建议回答：

> 因为 `kit` 提供的是基础设施，`chat` 需要的是产品级交互语义。像 retry、编辑历史、消息级错误展示、乐观态，这些都更适合在 chat 层统一做，而不是让每个业务页面自己拼。

### Q2：为什么要引入 `turnId`？

建议回答：

> 不能只靠消息内容做关联，因为用户可能连续发送两次相同文本。`turnId` 可以稳定表示“一轮 user + assistant”。

### Q3：编辑消息为什么不是原地改一条文本？

建议回答：

> 因为从 LLM 语义看，编辑上文会影响后文，所以需要把编辑点之后的历史视为失效并重生成。

### Q4：工具调用、thinking 是 `useChatKit` 提供的吗？

建议回答：

> 不是。它们还是来自 `kit.useMessage` 的插件系统，`useChatKit` 主要做的是消费这些运行时结果并组织成更适合 UI 的状态。

---

## 7. 备讲备注

如果团队成员对这块还不熟，建议宣讲时尽量避免一开始就深挖：

- 每个 helper 函数的实现
- 所有 feature preset 解析细节
- 所有渲染组件的 props 细节

建议始终围绕下面这条主线讲：

> `useChatKit` 如何把底层 `kit` 的原始能力，提升为一套面向 chat UI 的产品运行时。

只要这条线讲清楚，后面的源码细节就容易自行消化。
