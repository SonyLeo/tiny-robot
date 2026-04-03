# Chat Multimodal Upload Plan

> Last updated: `2026-04-03`
> Status: `Deferred proposal`
> Scope: `packages/chat` only
> Constraint: `Do not modify packages/kit in phase 2`

## 1. 目标

这份设计文档用于回答一个具体问题：

- 如果二期只允许修改 `packages/chat`
- 不修改 `packages/kit`

那么如何在 chat 包里支持：

- 用户上传图片
- 把图片输入给 Qwen 这类兼容 OpenAI 多模态格式的模型
- 尽量保持 `TrChat` 黑盒接入体验

当前推荐的阶段性目标是：

1. 先覆盖 `OpenAI-compatible` 的图片输入
2. 第一版优先支持 `Qwen-VL` 系列模型
3. 不改变 `packages/kit` 当前的字符串消息模型
4. 给用户提供足够小的接入面，而不是要求用户手写 `requestBody`

## 2. 当前架构基线

### 2.1 发送入口已经收敛为单参数

当前 runtime 发送链路只接收最终文本：

- `ChatSender` 在发送前可以拿到 `{ text, structuredData }`
- `onBeforeSend` 负责发送前业务组装
- 真正进入 runtime 的只有 `chatKit.sendMessage(text)`

相关代码：

- [src/components/core/ChatSender.vue](../src/components/core/ChatSender.vue)
- [src/types/scaffold.ts](../src/types/scaffold.ts)
- [src/runtime/chat-kit/useChatKit.ts](../src/runtime/chat-kit/useChatKit.ts)

这意味着：

- `structuredData` 仍然是发送前组装边界的一部分
- 它不是 chat runtime request contract 的一部分
- 二期方案不能再依赖 `sendMessage(content, data)` 这条旧思路

### 2.2 附件 UI 已存在，但还没有入模链路

当前附件能力主要停留在 UI 层：

- `useChatAttachments()` 保存 `rawFile + objectURL`
- `ChatAttachments` 负责列表展示
- `ChatSender` 负责 upload button 与发送后的清空

相关代码：

- [src/components/attachments/useChatAttachments.ts](../src/components/attachments/useChatAttachments.ts)
- [src/components/core/ChatRoot.vue](../src/components/core/ChatRoot.vue)
- [src/components/core/ChatSender.vue](../src/components/core/ChatSender.vue)

关键现状：

- `useChatAttachments()` 会保存 `rawFile`
- `attachmentsManager` 已经是 `TrChatRoot / presetOverrides` 级别的正式入口
- 但附件当前不会自动进入模型请求

这意味着：

- 目前“能上传图片”不等于“图片会进入模型”

### 2.3 `packages/kit` 已有足够强的请求扩展点

虽然二期不允许修改 `packages/kit`，但 `kit` 已经具备一个非常关键的现成能力：

- `UseMessagePlugin.onBeforeRequest(context)`

它允许在正式请求前异步修改：

- `requestBody.messages`
- `requestBody` 上的额外字段

相关代码：

- [../../kit/src/vue/message/types.ts](../../kit/src/vue/message/types.ts)
- [../../kit/src/vue/message/useMessage.ts](../../kit/src/vue/message/useMessage.ts)

同时：

- `useMessage` 默认会把 `metadata` 从 `requestBody.messages` 里剔除
- 但 `onBeforeRequest` 仍然可以通过 `context.messages` 读到原始消息及其 `metadata`

这意味着：

- 即使不改 `kit`
- `chat` 仍然可以在请求前把“文本 + 图片”重写为多模态请求

### 2.4 不能直接把会话态 `message.content` 改成数组

`packages/kit` 当前仍然把 `ChatMessage.content` 当作字符串来使用。

`packages/chat` 自己也仍然有多处字符串假设：

- 首次建会话标题使用 `content.slice(0, 20)`
- `sendMessage()` 仍是字符串发送链
- retry / regenerate / edit / history 都围绕文本消息展开

相关代码：

- [../../kit/src/types.ts](../../kit/src/types.ts)
- [src/runtime/chat-kit/useChatConversation.ts](../src/runtime/chat-kit/useChatConversation.ts)
- [src/runtime/chat-kit/useChatKit.ts](../src/runtime/chat-kit/useChatKit.ts)

因此二期不建议：

- 直接把存储态 message 的 `content` 改成多模态数组

否则会先撞上：

- title
- retry
- edit
- history

这些 chat 级语义链。

## 3. 设计结论

二期最稳的方案仍然是：

- **会话内继续保存字符串消息**
- **多模态资产走 `metadata` side-channel**
- **真正发请求时再序列化成 provider 需要的 `content[]`**

也就是说：

1. 用户文本仍保存在 `message.content: string`
2. 图片先被解析成稳定引用，再写入 `message.metadata.multimodal`
3. `onBeforeRequest` 读取原始消息 metadata
4. 在请求体中把对应 `messages[n].content` 改写成 OpenAI-compatible 多模态格式

这个方案的关键优点是：

- 不破坏 `kit` 当前字符串消息模型
- 不破坏 chat 包现有 title / history / render 主链
- 只需要在 `packages/chat` 内新增 sender 编排与 plugin 桥接

## 4. 对齐当前架构后的推荐边界

### 4.1 `attachmentsManager` 继续留在 UI / Root 注入层

二期不建议把 `attachmentsManager` 重新定义成 runtime 一等入口。

原因：

- 它当前已经是 `TrChatRoot` / `presetOverrides` 的正式输入
- 它本质上是页面态 UI 状态，而不是请求链本身
- 如果同时提供 `presetOverrides.attachmentsManager` 和 `runtime.attachmentsManager`，会引入双入口和所有权冲突

因此当前推荐边界是：

- `attachmentsManager` 继续沿用现有入口
- `runtime` 只新增与“多模态解析/序列化”相关的能力

如果未来为了黑盒体验需要增加“scaffold 语法糖”，也应该是桥接现有入口，而不是引入第二套平级契约。

### 4.2 在 `runtime` 新增 `multimodal`

二期建议新增：

```ts
interface ChatMultimodalResolvedAsset {
  kind: 'image'
  source:
    | { type: 'url'; url: string }
    | { type: 'data-url'; dataUrl: string }
    | { type: 'file-id'; fileId: string }
  mimeType?: string
  name?: string
  size?: number
  detail?: 'auto' | 'low' | 'high'
}

interface ChatMultimodalRuntimeOptions {
  resolveAttachments?: (input: {
    attachments: Attachment[]
    model?: string
    providerId?: string
  }) => Promise<ChatMultimodalResolvedAsset[]>

  serializeRequestMessage?: (input: {
    text: string
    assets: ChatMultimodalResolvedAsset[]
    model?: string
    providerId?: string
  }) => {
    content: unknown
    extraRequestFields?: Record<string, unknown>
  }
}
```

并扩展：

```ts
interface ChatScaffoldRuntimeInput {
  multimodal?: ChatMultimodalRuntimeOptions
}
```

职责拆分：

- `resolveAttachments`
  - 把本地 `File` 解析成稳定引用
  - 例如上传后端换 URL、转成 data URL、换成 file ID
- `serializeRequestMessage`
  - 把解析后的资产序列化为 provider wire format

如果用户不传 `serializeRequestMessage`，第一版可以提供一个默认 serializer：

- 输出 OpenAI-compatible 的 `content[]`

## 5. chat 包内的实现落点

### 5.1 推荐通过 sender 预处理 + chat 内部 plugin 落地

当前最贴合现有代码结构的实现方式是：

1. 用户点击发送
2. `ChatSender` 快照当前附件列表
3. `ChatSender` 调用 `runtime.multimodal.resolveAttachments()`
4. 将解析结果放入 chat 包内部的“待发送多模态 turn 上下文”
5. `ChatSender` 调用 `chatKit.sendMessage(text)`
6. chat 包内部 plugin 在 `onTurnStart` 阶段把待发送资产写入当前 user message 的 `metadata.multimodal`
7. 同一个 plugin 在 `onBeforeRequest` 阶段把 `requestBody.messages[n].content` 改写为多模态格式
8. 待 metadata 绑定成功后再清空附件 UI

这里的关键点是：

- `resolveAttachments()` 的异步阶段必须发生在 sender / pre-send 边界
- `metadata` 绑定和 `requestBody` 改写则应由 chat 包内部 plugin 承担
- 不应再试图把多模态数据塞进 `chatKit.sendMessage()` 参数

### 5.2 为什么必须有一个 chat 内部 plugin

因为当前发送链是：

- `ChatSender` 只能把最终文本交给 `chatKit.sendMessage(text)`
- `useMessage` 会在用户消息入队后执行 `onTurnStart`
- `useMessage` 会在请求前执行 `onBeforeRequest`

这正好提供了一个稳定桥接点：

- sender 负责异步准备附件
- plugin 负责把准备结果挂到消息上
- plugin 再负责把消息改写为 wire format

这样设计的优点是：

- 不修改 `packages/kit`
- 不破坏 `UseChatKitReturn['sendMessage']`
- 不要求用户自己手写 `toolPlugin` 或通用 `onBeforeRequest`

## 6. Retry / Edit / History 语义

### 6.1 retry 需要显式覆盖多模态 replay

当前 `retry()` 只对当前 active conversation 生效，并且会清理失败 turn 后重新发文本。

相关代码：

- [src/runtime/chat-kit/useChatKit.ts](../src/runtime/chat-kit/useChatKit.ts)

因此二期必须明确：

- retry 不能只记 `userContent`
- 还必须能回放失败 user message 上的 `metadata.multimodal`

第一版推荐策略：

1. 首次发送时把 resolved assets 写入 user message metadata
2. retry 前从失败 user message 上读取 `metadata.multimodal`
3. 在重新发送前把这份 payload 放回待发送多模态 turn 上下文

这样才能保证：

- retry 仍是当前会话内语义
- 不依赖已被清空的附件 UI
- 不要求用户重新上传

### 6.2 history 与标题继续只看文本

第一版不改变：

- 会话标题仍基于文本
- history 列表仍展示文本摘要

如果未来需要在 history 中展示“图片消息”标记，应作为额外 UI 增强，而不是修改存储主结构。

### 6.3 edit 的阶段性策略

第一版建议采用保守策略：

- 编辑文本时默认保留已绑定的 `metadata.multimodal`
- 如果未来要支持“编辑时增删图片”，再单独扩展编辑态 UX

这比第一版就同时引入“文本编辑 + 图片重编排”更稳。

## 7. Provider 范围建议

### 7.1 第一版优先支持 Qwen-VL

推荐第一版目标模型：

- `qwen-vl-plus`
- `qwen-vl-max`
- 以及同类 OpenAI-compatible 视觉模型

原因：

- Qwen-VL 直接兼容 OpenAI Vision 输入格式
- 可以复用现有 `openai-compatible` provider
- 范围清晰，容易控制 phase 2 复杂度

### 7.2 默认 serializer 的边界

第一版建议默认 serializer 只负责：

- 文本
- 图片
- OpenAI-compatible `content[]`
- 必要时补充少量额外请求字段

不建议第一版同时内建：

- Anthropic serializer
- OpenAI Responses API 专用 serializer
- Qwen-Omni 音视频/全模态 serializer

## 8. 最小调用示例

如果按本方案实现，推荐的最小接入方式如下：

```ts
const attachmentsManager = useChatAttachments()

const runtime = {
  multimodal: {
    async resolveAttachments({ attachments }) {
      const image = attachments[0]
      if (!image?.rawFile) return []

      const formData = new FormData()
      formData.append('file', image.rawFile)

      const resp = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      const { url } = await resp.json()

      return [
        {
          kind: 'image',
          source: { type: 'url', url },
          detail: 'auto',
          name: image.name,
          mimeType: image.rawFile.type,
        },
      ]
    },
  },
}

<TrChat
  :config="chatConfig"
  :runtime="runtime"
  :preset-overrides="{ attachmentsManager }"
/>
```

用户只需要关心：

- 开启 `attachments`
- 提供 `attachmentsManager`
- 提供 `resolveAttachments`

不需要关心：

- request body 改写
- `image_url` 拼装
- OpenAI-compatible 多模态序列化细节

这些应由 chat 包内部兜底。

## 9. 第一版不建议做的事

- 不建议把 `message.content` 改造成数组
- 不建议把本地 `rawFile` 或 `blob:` URL 写入持久化会话
- 不建议让用户自己在 `toolPlugin` 或通用 `onBeforeRequest` 里手工拼多模态消息
- 不建议第一版同时支持 Anthropic / OpenAI / Qwen 三套独立 serializer
- 不建议第一版优先做 `Qwen-Omni`
- 不建议新增 `runtime.attachmentsManager` 作为第二套入口

## 10. 实施前 Checklist

- [ ] 确认 phase 2 仍然坚持“只改 `packages/chat`”
- [ ] 确认第一目标模型仍是 `Qwen-VL`
- [ ] 在 `ChatScaffoldRuntimeInput` 中新增 `multimodal`
- [ ] 保持 `attachmentsManager` 继续走 `TrChatRoot / presetOverrides` 入口
- [ ] 为 chat 包新增内部 multimodal plugin
- [ ] 在 sender / pre-send 阶段完成附件快照与 `resolveAttachments()`
- [ ] 在 `onTurnStart` 中把 resolved assets 绑定到 `message.metadata.multimodal`
- [ ] 在 `onBeforeRequest` 中把请求改写为 OpenAI-compatible 多模态格式
- [ ] 为 retry 增加多模态 replay 能力
- [ ] 明确持久化中只保存稳定引用，不保存 `rawFile` / `blob:` URL
- [ ] 为 Qwen-VL 跑通黑盒接入示例

## 11. 官方参考

- OpenAI Images and Vision
  - https://platform.openai.com/docs/guides/images-vision?api-mode=chat&format=base64-encoded
- Anthropic Vision
  - https://docs.anthropic.com/en/docs/build-with-claude/vision
- Qwen-VL OpenAI 兼容
  - https://help.aliyun.com/zh/model-studio/qwen-vl-compatible-with-openai
- Qwen-Omni
  - https://help.aliyun.com/zh/model-studio/qwen-omni
