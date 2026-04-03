# Chat Runtime Chain

> Last updated: `2026-04-01`
> Status: `Current source-of-truth summary`
> Scope: `packages/chat` runtime chain around `useChatKit`

Detailed companion: [Chat Runtime Chain Code Analysis](./chat-runtime-chain-code-analysis.md)

## 1. 文档目标

这份文档只回答一个问题：`useChatKit` 所在的运行时链是如何组织起来的。

它重点覆盖：

- `responseProvider` 是如何进入 chat 包的
- `TrChat.Scaffold` 和 `TrChat.Root` 如何决定 runtime 来源
- `useChatKit` 如何组合 `useChatConversation / useChatRequest / useChatMessages`
- error、retry、optimistic turn、edit rollback 是怎么落在消息上的
- runtime annotations 为什么需要 `chatMessageState / chatRenderMessages`

它不重点展开：

- UI 骨架和 workspace 页面装配

这些内容见 [Chat UI Rendering](./chat-ui-rendering.md)。

## 2. 运行时主链总览

从黑盒入口追踪运行时，当前推荐看这条链：

```text
config
  -> createChatAdapterFromConfig()
    -> createResponseProvider()
      -> createOpenAICompatibleResponseProvider()

TrChat.Scaffold
  -> createScaffoldResponseProvider()
  -> useChatKit()

TrChat.Root
  -> resolveRootChatKit()
    -> useChatKit()

useChatKit
  -> useChatConversation()
    -> useConversation() from @opentiny/tiny-robot-kit
  -> useChatRequest()
  -> useChatMessages()
  -> chatMessageState.ts
  -> chatRenderMessages.ts
```

关键文件：

- [src/runtime/config/configProjection.ts](../src/runtime/config/configProjection.ts)
- [src/runtime/config/openaiCompatibleTransport.ts](../src/runtime/config/openaiCompatibleTransport.ts)
- [src/runtime/scaffold/scaffoldRuntime.ts](../src/runtime/scaffold/scaffoldRuntime.ts)
- [src/runtime/scaffold/resolveRootChatKit.ts](../src/runtime/scaffold/resolveRootChatKit.ts)
- [src/runtime/chat-kit/useChatKit.ts](../src/runtime/chat-kit/useChatKit.ts)
- [src/runtime/chat-kit/useChatConversation.ts](../src/runtime/chat-kit/useChatConversation.ts)
- [src/runtime/chat-kit/useChatRequest.ts](../src/runtime/chat-kit/useChatRequest.ts)
- [src/runtime/chat-kit/useChatMessages.ts](../src/runtime/chat-kit/useChatMessages.ts)
- [src/runtime/chat-kit/chatMessageState.ts](../src/runtime/chat-kit/chatMessageState.ts)
- [src/runtime/chat-kit/chatRenderMessages.ts](../src/runtime/chat-kit/chatRenderMessages.ts)

## 3. `responseProvider` 的进入路径

### 3.1 从 config 到 provider

当调用 [src/runtime/config/configProjection.ts](../src/runtime/config/configProjection.ts) 里的 `createChatAdapterFromConfig()` 时，会先：

1. 调用 [src/runtime/config/configLoader.ts](../src/runtime/config/configLoader.ts) 做 config 归一化和校验
2. 调用 [src/runtime/config/registry.ts](../src/runtime/config/registry.ts) 做 feature resolution
3. 把 `models` 转成 `ModelOption[]`
4. 生成 `createResponseProvider(modelId?)`

`createResponseProvider()` 会根据模型找到对应 provider 配置，并调用 [src/runtime/config/openaiCompatibleTransport.ts](../src/runtime/config/openaiCompatibleTransport.ts) 里的 `createOpenAICompatibleResponseProvider()`。

当前这一层的边界很明确：

- provider 类型只支持 `openai-compatible`
- transport 负责把 chat 包自己的 config 投影成 OpenAI Compatible Chat Completions 请求
- 它不负责做更高层的会话管理

### 3.2 `createOpenAICompatibleResponseProvider()`

这个 transport 负责：

- 解析 `endpoint` 或 `baseURL + apiPath`
- 把 `systemPrompt` 合并到 messages 前面
- 把 `temperature / maxTokens / headers / credentials` 投影到请求参数
- 通过 `fetch` 发起 SSE 请求
- 在非 2xx 情况下抛出 `ChatProviderError`

`ChatProviderError` 是 chat 包运行时错误归一化的重要入口，因为后面的 `useChatRequest()` 会优先识别它。

## 4. `TrChat.Scaffold` 如何决定 runtime

[src/components/core/ChatScaffold.vue](../src/components/core/ChatScaffold.vue) 是黑盒模式下 runtime 的第一层编排器。

它会先创建：

- `adapter`
- `resolvedModels`
- `resolvedDefaultModel`
- `currentModel`

然后再决定 `chatKit` 来源：

- 如果 `props.runtime?.chatKit` 已经传入
  - 直接复用外部 chatKit
- 否则
  - 调用 `useChatKit()`
  - 并通过 [src/runtime/scaffold/scaffoldRuntime.ts](../src/runtime/scaffold/scaffoldRuntime.ts) 的 `createScaffoldResponseProvider()` 生成 provider

这里有一个关键策略：

- 当 scaffold 自己持有 `chatKit` 时，它会随着 `currentModel` 变化调用 `chatKit.updateResponseProvider()`
- 当外部已经传入 `chatKit` 时，scaffold 不再接管 provider 生命周期

这个判断由 `shouldManageScaffoldResponseProvider()` 完成。

## 5. `TrChat.Root` 如何解析 runtime

[src/components/core/ChatRoot.vue](../src/components/core/ChatRoot.vue) 不自己理解 config，它只关心“当前有没有可用的 chat runtime”。

解析逻辑都在 [src/runtime/scaffold/resolveRootChatKit.ts](../src/runtime/scaffold/resolveRootChatKit.ts)：

- 如果传入了 `chatKit`
  - 直接返回
- 否则如果传入了 `responseProvider`
  - 组装成 `UseChatKitOptions`
  - 再调用 `useChatKit()`
- 如果两者都没有
  - 抛出带组件名的错误

这条路径也被 [tests/runtime/root-chat-kit.test.mjs](../tests/runtime/root-chat-kit.test.mjs) 保护。

这带来的结果是：

- `TrChat.Root` 可以同时服务黑盒和白盒
- whitebox 用户既可以自己构造 `chatKit`
- 也可以只给 `responseProvider`，让根节点代建 runtime

## 6. `useChatKit` 的职责分工

[src/runtime/chat-kit/useChatKit.ts](../src/runtime/chat-kit/useChatKit.ts) 不是对 `@opentiny/tiny-robot-kit` 的完整透传，而是一个 chat-first facade。

它内部组合了三层能力：

1. `useChatConversation()`
   - 会话与底层消息引擎桥接
2. `useChatRequest()`
   - 请求状态、provider 同步、错误归一化
3. `useChatMessages()`
   - 编辑态、重发、乐观修改

最后再用 `chatMessageState.ts` 补 runtime annotations。

### 6.1 `useChatConversation()`

[src/runtime/chat-kit/useChatConversation.ts](../src/runtime/chat-kit/useChatConversation.ts) 是离 `@opentiny/tiny-robot-kit` 最近的一层。

它会调用 `useConversation()`，并额外挂两类 plugin：

- transform plugin
  - 把 `messageTransforms.onChunk`
  - 和 `messageTransforms.onFinish`
  - 接进底层 completion 生命周期
- lifecycle plugin
  - 把 `onFinish`
  - 和 `onError`
  - 接进 turn 生命周期

它同时负责几件 chat 级策略：

- 首次 `sendMessage()` 时自动创建 conversation
- 自动把 `initialMessages` 只注入到第一条自动创建的会话
- 手动 `createConversation()` 时不复用 `initialMessages`

这也是为什么 `useChatConversation()` 不是简单把 `useConversation()` 导出出去。

### 6.2 `useChatRequest()`

[src/runtime/chat-kit/useChatRequest.ts](../src/runtime/chat-kit/useChatRequest.ts) 负责 chat 级请求状态抽象。

它做的事情包括：

- 把底层 `requestState + processingState` 折叠成更面向 UI 的 `ChatStatus`
  - `ready`
  - `submitted`
  - `streaming`
  - `error`
- 用 `watchEffect()` 把最新 `responseProviderRef` 同步回当前 active engine
- 把异常归一化成 `ChatErrorInfo`

错误归一化逻辑会识别：

- `auth`
- `rate_limit`
- `server`
- `timeout`
- `network`
- `provider`
- `unknown`

判断依据主要来自：

- `ChatProviderError`
- HTTP status
- `code`
- 错误消息文本

### 6.3 `useChatMessages()`

[src/runtime/chat-kit/useChatMessages.ts](../src/runtime/chat-kit/useChatMessages.ts) 只关心一件事：编辑消息之后如何安全地重发。

它提供：

- `startEditMessage()`
- `cancelEditMessage()`
- `isMessageEditing()`
- `editMessage()`

它的策略不是“就地改消息文本”，而是：

1. 记录从当前 messageIndex 开始的消息快照
2. 把当前 index 及其后续消息整体裁掉
3. 用新的 user content 重新走发送链

这样可以让“编辑历史消息”与“重新生成后续 assistant turn”保持一致。

## 7. `useChatKit` 补上的 chat 级能力

`useChatKit()` 在组合完上面三层之后，又补了一层 chat 语义：

- retry
- optimistic turn
- edit rollback
- runtime bridge

### 7.1 optimistic turn

发送消息后，`useChatKit()` 会尝试把当前 turn 标记为 optimistic：

- 为最新 user message 生成 `turnId`
- 尝试找到对应 assistant message
- 给两者打上 `optimistic: true`

这套标记依赖 [src/runtime/chat-kit/chatMessageState.ts](../src/runtime/chat-kit/chatMessageState.ts)。

之后 `watchEffect()` 会持续观察：

- conversation 是否切换
- assistant 消息是否已经出现
- request 状态是否回到 `ready` 或进入 `error`

一旦 turn 完成或失败，就清掉 optimistic 标记。

### 7.2 retry

当 turn 失败时，`useChatKit()` 会在 `onTurnError` 回调里尝试建立 `retryContext`：

- 记录 `conversationId`
- 记录 `turnId`
- 记录原始 user content

只有在错误被识别为 `retryable` 时，才会保留这份上下文。

后续调用 `retry()` 时会：

1. 确保当前切回原始 conversation
2. 找到失败 turn 的起始 user message
3. 从那个位置起裁掉失败 turn
4. 用原始 user content 重发

这让 retry 的语义是“重放失败 turn”，而不是“重新开一条会话”。

### 7.3 edit rollback

编辑历史消息后如果重发失败，`useChatKit()` 会把会话回滚到编辑前的快照。

这个逻辑依赖 `editRollbackContext`：

- 记录当前 conversation
- 记录被编辑消息的 index
- 记录被删掉的整段消息快照

如果 turn 失败且仍停留在原 conversation，就把裁掉的消息插回去。

这是 chat 包对“编辑历史消息”最关键的一条保护线，因为它避免了失败后直接丢历史。

### 7.4 runtime bridge

`useChatKit()` 还把底层 engine 状态再包装成一个更稳定的 `runtime` 字段：

- `runtime.activeEngine`
- `runtime.requestState`
- `runtime.processingState`
- `runtime.isProcessing`
- `runtime.clear()`
- `runtime.saveMessages()`

这层 bridge 让 UI 或上层应用在需要更细粒度控制时，仍然能访问到底层引擎状态，但不必直接依赖底层 API 形状。

## 8. runtime annotations 的两条辅助链

### 8.1 `chatMessageState.ts`

[src/runtime/chat-kit/chatMessageState.ts](../src/runtime/chat-kit/chatMessageState.ts) 负责把 chat 包自己的运行时状态挂到 message.state 上。

当前承载的字段主要有：

- `error`
- `isEditing`
- `optimistic`
- `turnId`

这些字段分别被不同模块消费：

- `ErrorRenderer`
- `EditInputRenderer`
- `ChatFeedback`
- `useChatKit` 的 retry/optimistic 流程

### 8.2 `chatRenderMessages.ts`

[src/runtime/chat-kit/chatRenderMessages.ts](../src/runtime/chat-kit/chatRenderMessages.ts) 负责 render-message normalization。

它会给 render message 打两个隐藏属性：

- source message
- message index

原因是：

- UI render 层可能拿到的是经过 bubble 分组/渲染链消费的 message
- 但 action、feedback、renderer 仍然要稳定追溯到原始消息对象

这也是为什么：

- `ChatMessageList`
- `ChatFeedback`
- `useChatFeedback`

都会显式调用 `getChatRenderSourceMessage()` 或 `unwrapChatRenderMessages()`。

## 9. `messageTransforms` 在运行时链里的位置

`messageTransforms` 不是 UI 钩子，而是底层 turn 生命周期上的 transform 钩子。

它在 [src/runtime/chat-kit/useChatConversation.ts](../src/runtime/chat-kit/useChatConversation.ts) 中被接到两处：

- `onCompletionChunk`
  - 对应 `messageTransforms.onChunk`
- `onTurnEnd`
  - 对应 `messageTransforms.onFinish`

当前支持的能力是：

- 在流式过程中观察 chunk
- 在 assistant 最终消息完成后返回一个 patch 覆写消息

`onFinish` 返回的 patch 不只是能改 `content`，也能合并：

- `metadata`
- `state`
- 其他普通字段

这也是 [tests/runtime/message-transforms.test.mjs](../tests/runtime/message-transforms.test.mjs) 覆盖的重点。

## 10. 测试与当前回归基线

如果要验证运行时链，最关键的测试文件是：

- [tests/runtime/composables.test.mjs](../tests/runtime/composables.test.mjs)
  - 覆盖 `useChatKit / useChatConversation / useChatRequest / useChatMessages / useModelSelector / useChatAttachments`
- [tests/runtime/message-transforms.test.mjs](../tests/runtime/message-transforms.test.mjs)
  - 覆盖 `messageTransforms`
- [tests/runtime/root-chat-kit.test.mjs](../tests/runtime/root-chat-kit.test.mjs)
  - 覆盖 `resolveRootChatKit`

这些测试基本对应了当前 runtime 链的稳定契约：

- 首次发送自动建会话
- 错误能被结构化
- retry 只重放失败 turn
- optimistic turn 会在完成后清理
- 编辑失败会回滚历史
- 外部 `chatKit` 和内部 `responseProvider` 两条接入路径都成立

## 11. 阅读源码的推荐顺序

如果要继续深挖运行时链，推荐按这个顺序读：

1. [src/runtime/config/configProjection.ts](../src/runtime/config/configProjection.ts)
2. [src/runtime/config/openaiCompatibleTransport.ts](../src/runtime/config/openaiCompatibleTransport.ts)
3. [src/runtime/scaffold/scaffoldRuntime.ts](../src/runtime/scaffold/scaffoldRuntime.ts)
4. [src/runtime/scaffold/resolveRootChatKit.ts](../src/runtime/scaffold/resolveRootChatKit.ts)
5. [src/runtime/chat-kit/useChatConversation.ts](../src/runtime/chat-kit/useChatConversation.ts)
6. [src/runtime/chat-kit/useChatRequest.ts](../src/runtime/chat-kit/useChatRequest.ts)
7. [src/runtime/chat-kit/useChatMessages.ts](../src/runtime/chat-kit/useChatMessages.ts)
8. [src/runtime/chat-kit/useChatKit.ts](../src/runtime/chat-kit/useChatKit.ts)
9. [src/runtime/chat-kit/chatMessageState.ts](../src/runtime/chat-kit/chatMessageState.ts)
10. [src/runtime/chat-kit/chatRenderMessages.ts](../src/runtime/chat-kit/chatRenderMessages.ts)

## 12. 当前 runtime 边界结论

截至当前代码状态，`useChatKit` 所在的运行时链应被理解为：

- 一个对 `@opentiny/tiny-robot-kit` 的 chat-first 封装层
- 一个把 provider、conversation、request、message editing 串成稳定产品语义的 facade
- 一个通过 runtime annotations 支撑 UI 渲染和交互的桥接层

而不是：

- 底层消息引擎本身
- 某种和 UI 完全无关的纯数据层抽象
