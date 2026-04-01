# Chat 消息动作扩展与结构化渲染调研 / 设计文档

> Last updated: `2026-04-01`
> Status: `Draft for team review`
> Scope: `packages/chat`
> Audience: chat 包维护者、平台接入层、脚手架/模板维护者

## 1. 文档目标

本文档用于回答两个在 `packages/chat` 中已经持续出现的高频需求，并给出一套适合团队评估的实现方向：

1. 用户经常基于现有 `feedback` 按钮扩展自己的业务按钮
2. 用户经常需要拦截模型返回，过滤 / 整合结果，并渲染为自定义 UI 组件

文档会同时覆盖：

- 当前代码已经能做什么
- 当前代码为什么还不够
- 业界主流是怎么做的
- 对 `packages/chat` 最合适的演进方向是什么
- 哪些部分应该先做，哪些部分应该后做

本文档不是 API 定稿，而是团队评估用的调研与设计草案。

## 2. 问题定义

### 2.1 需求一：消息级业务动作扩展

当前用户常见诉求包括：

- 在 assistant 消息下增加“加入知识库”“生成工单”“转成草稿”“保存到案例库”等业务按钮
- 在 user 消息下增加“重新编辑并重发”“提取关键词”“作为模板保存”等动作
- 不希望重写整个消息列表，只希望在现有 feedback 区域扩展行为
- 希望黑盒与白盒接入路径都能保持一致的能力模型

### 2.2 需求二：模型结果转为自定义 UI

当前用户常见诉求包括：

- 模型返回的并不只是 markdown，而是某类业务卡片、配置表单、图表、审批块、artifact、工作流节点等
- 需要在显示前过滤原始文本，抽取结构化信息
- 需要把结构化信息稳定渲染成 Vue 组件
- 不希望整页接管 message list，只希望对某一类消息内容替换渲染器

### 2.3 当前问题的本质

这两个需求表面上看分别属于：

- “feedback 按钮扩展”
- “消息内容自定义渲染”

但从架构上看，它们本质上都指向同一个问题：

> `packages/chat` 当前已经有一定扩展能力，但还没有把“消息级扩展点”正式抽象成稳定 contract。

## 3. 当前代码现状

## 3.1 现有消息动作能力

当前 chat 包已经有一条消息动作链：

- [ChatFeedback.vue](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/components/chat/ChatFeedback.vue)
- [useChatFeedback.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/composables/useChatFeedback.ts)
- [ChatMessageActionPayload](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/types/core.ts)
- [ChatMessageList.vue](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/components/chat/ChatMessageList.vue)

当前行为特点：

- assistant 默认动作固定为：
  - `copy`
  - `refresh`
- user 默认动作固定为：
  - `copy`
  - `edit`
- 业务侧目前只能通过 `onActionClick` 做“动作发生后的回调”
- 默认动作列表由 `useChatFeedback.ts` 直接硬编码生成

这说明当前已有“动作事件透出”，但还没有“动作定义注册”。

## 3.2 底层 Feedback 组件实际上更强

底层组件 [TrFeedback](/e:/LS_WorkSpace/web/tiny-robot/packages/components/src/feedback/index.vue) 已经支持两类能力：

- `actions`
  - 适合右侧 icon 型动作
- `operations`
  - 适合左侧文本型业务动作

相关类型定义见：

- [FeedbackProps](/e:/LS_WorkSpace/web/tiny-robot/packages/components/src/feedback/index.type.ts)

也就是说，底层并不是不能扩，而是 chat 层目前把它限制成了固定的 feedback 行为。

## 3.3 现有消息渲染能力

当前 chat 包已经有多层渲染能力：

### A. 黑盒级 slot

- `message-list`
- `prefix`
- `suffix`
- `after`
- `content-footer`

对应入口主要在：

- [ChatDefaultBodyRegion.vue](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/components/chat/ChatDefaultBodyRegion.vue)
- [ChatMessageList.vue](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/components/chat/ChatMessageList.vue)

### B. 白盒级组合

用户可以手动组合：

- `TrChat.Layout`
- `TrChat.MessageList`
- `TrChat.Footer`
- `TrChat.Sender`

这条路径已经被 demo 和 test scene 使用。

### C. Bubble renderer 底层能力

组件库底层已经支持内容渲染匹配：

- [useBubbleContentRenderer.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/components/src/bubble/composables/useBubbleContentRenderer.ts)
- [defaultRenderers.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/components/src/bubble/renderers/defaultRenderers.ts)
- [bubble/index.type.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/components/src/bubble/index.type.ts)

chat 包自己的默认 bubble 配置也已经留了内部扩展口：

- [useDefaultBubbleConfig.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/composables/useDefaultBubbleConfig.ts)

内部甚至已经存在：

- `extraContentMatches`
- `extraBoxMatches`
- `overrideRoles`

但这些能力目前没有正式暴露成 chat 层公共 contract。

## 3.4 现有请求 / 消息生命周期能力

底层 `kit` 已经有比较完整的插件与生命周期模型：

- [packages/kit/src/vue/message/types.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/kit/src/vue/message/types.ts)

其中已经具备：

- `onBeforeRequest`
- `onAfterRequest`
- `onCompletionChunk`
- `onTurnStart`
- `onTurnEnd`

这意味着：

- “拦截模型结果”这件事并不是做不到
- 只是目前这条能力还停留在 `kit` 层，没有被 chat 包包装成易用的业务入口

## 3.5 当前数据模型的关键限制

当前消息内容模型在层间并不完全一致：

- `bubble` 层支持：
  - `content: string | ChatMessageContentItem[]`
  - 见 [bubble/index.type.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/components/src/bubble/index.type.ts)
- `kit` 核心层的 `ChatMessage.content` 仍主要按 `string` 使用
  - 见 [packages/kit/src/types.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/kit/src/types.ts)

这会导致一个直接问题：

> “结构化消息内容”在渲染层能理解，但在 runtime 主链上还没有成为稳定 contract。

## 4. 当前实现能满足到什么程度

## 4.1 对需求一：可以做，但方式不优雅

用户今天已经可以：

- 在白盒路径里替换 `ChatFeedback`
- 在 `after` slot 里自己追加按钮
- 通过 `onActionClick` 接住默认 action 事件

但问题是：

- 需要重复 copy / edit / refresh 等默认逻辑
- 没有统一的动作合并、排序、显隐、异步状态模型
- 黑盒与白盒会快速分叉
- “业务动作”与“反馈动作”没有正式边界

## 4.2 对需求二：可以做，但成本过高

用户今天已经可以：

- 全量接管 `message-list`
- 用 slot 形式外挂 UI
- 在 `kit` plugin 中处理 chunk / message
- 在白盒路径里自己指定 renderer

但问题是：

- 成本过高
- 类型链不统一
- 黑盒路径没有低成本标准入口
- 需要懂 `kit + chat + bubble` 三层实现

## 5. 业界主流做法

这里优先参考一手官方资料，而不是社区博客。

## 5.1 OpenAI：结构化输出 / 工具调用

OpenAI 当前官方主线已经非常明确：

- 对“可机读结果”优先使用 **Structured Outputs**
- 对“需要执行动作 / 返回结构化结果”优先使用 **tool / function calling**
- 不鼓励将复杂 UI 结构建立在不稳定的自由文本约定上

对本项目最关键的启发是：

- 不应继续鼓励“让模型输出一段特殊 markdown 再正则解析”
- 应该把“自定义 UI”建立在结构化 schema 或工具结果之上

官方资料：

- https://developers.openai.com/api/docs/guides/structured-outputs
- https://developers.openai.com/api/docs/guides/function-calling

## 5.2 Anthropic：content blocks / tool_use / tool_result

Anthropic 官方把工具调用和工具结果直接建模为结构化内容块，而不是普通文本。

这对本项目的启发是：

- 消息内容不应该只等于 markdown 文本
- chat 层应该能承接“文本之外的消息部件”
- UI 层应该依据部件类型，而不是依据字符串模式，来决定渲染器

官方资料：

- https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview

## 5.3 AI SDK：streaming data / metadata / middleware

AI SDK 当前在 UI 层的做法已经比较成熟：

- 支持 streaming custom data
- 支持 message metadata
- 支持 middleware
- 允许把“文本之外的数据”作为正式消息附属数据流来处理

这对本项目的启发是：

- 应该区分“持久消息内容”和“流式附加数据”
- 应该给 chat 层一个中间管线，而不是让用户直接碰 transport
- 结构化 UI 更适合通过 data / metadata / parts 进入渲染层

官方资料：

- https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data
- https://ai-sdk.dev/docs/ai-sdk-ui/message-metadata
- https://ai-sdk.dev/docs/ai-sdk-core/middleware

## 6. 我们要解决的不是单个按钮，而是两条正式能力线

基于上面的现状与调研，我认为这里不应该继续堆局部 patch，而应该收敛成两条正式能力：

1. **Message Actions**
2. **Structured Message Rendering**

其中：

- 第一条解决“feedback 扩展”
- 第二条解决“模型结果转自定义 UI”

## 7. 设计目标

无论最终 API 长什么样，应该至少满足下面这些目标：

### 7.1 对业务方简单

- 黑盒路径可用
- 白盒路径可复用
- 默认能力不丢
- 不需要直接理解底层 `kit` 插件细节

### 7.2 对维护者清晰

- feedback 与业务动作边界清楚
- 结构化内容与纯文本边界清楚
- runtime 层与渲染层分工清楚

### 7.3 对未来扩展友好

- 可以支持 sources / citations / artifacts / approval cards / tool status
- 可以支持流式中间态
- 可以支持 CLI / 模板 / preset 消费

### 7.4 对现有链路可渐进演进

- 不一次性推翻 `TrChat`
- 不强迫用户立刻改成白盒
- 优先在现有 `config / preset / slots / scaffold` 框架内加新能力

## 8. 方案一：消息动作系统（推荐优先做）

## 8.1 核心判断

当前问题不是“feedback 不够多”，而是 chat 包还没有正式区分：

- built-in feedback actions
- business message actions

更好的做法是保留 feedback 组件作为 UI 承载层，但把动作系统升级成可注册、可合并、可控制显隐的正式 contract。

## 8.2 推荐抽象

建议新增一组 chat 层类型：

```ts
export interface ChatMessageActionContext {
  role?: string
  message: ChatMessage | undefined
  messageIndex?: number
  messages: ChatMessage[]
  messageIndexes: number[]
  chatKit?: UseChatKitReturn | null
  conversationId?: string
}

export interface ChatMessageActionDefinition {
  id: string
  label: string
  icon?: 'copy' | 'refresh' | 'edit' | VNode | Component
  placement?: 'actions' | 'operations'
  roles?: Array<'assistant' | 'user' | 'tool' | 'system'>
  order?: number
  when?: (ctx: ChatMessageActionContext) => boolean
  onClick?: (ctx: ChatMessageActionContext) => void | Promise<void>
}
```

并在 chat 层增加：

```ts
messageActions?:
  | ChatMessageActionDefinition[]
  | ((ctx: ChatMessageActionContext) => ChatMessageActionDefinition[])
```

## 8.3 为什么这样最合理

因为底层 [TrFeedback](/e:/LS_WorkSpace/web\tiny-robot\packages\components\src\feedback\index.vue) 已经天然区分：

- `actions`
- `operations`

chat 层完全可以映射成：

- built-in copy / refresh / edit 继续放 `actions`
- 业务型“创建工单 / 加入知识库 / 生成摘要卡”放 `operations`

这样既能保留现有视觉语言，也不会再把所有业务按钮都硬塞进“反馈”语义里。

## 8.4 最小落地形态

先不做太复杂的 action state store，第一阶段只做：

- built-in actions 默认存在
- 用户 actions append
- 支持 replace 模式
- 支持 `when(ctx)` 控制显隐
- 支持 action placement
- `onActionClick` 继续保留，作为统一埋点 / 审计 hook

## 8.5 推荐的对外入口

建议入口优先放在：

- `TrChatPresetOverrides`
- `ChatPresetProps`

理由：

- 这是页面级能力，而不是 provider 级能力
- 应该兼容黑盒和 scaffold
- 不应再让用户必须接管 `after` slot 才能扩动作

## 8.6 涉及代码落点

主要会触达：

- [useChatFeedback.ts](/e:/LS_WorkSpace/web\tiny-robot\packages\chat\src\composables\useChatFeedback.ts)
- [ChatFeedback.vue](/e:/LS_WorkSpace/web\tiny-robot\packages\chat\src\components\chat\ChatFeedback.vue)
- [core.ts](/e:/LS_WorkSpace/web\tiny-robot\packages\chat\src\types\core.ts)
- [ui.ts](/e:/LS_WorkSpace/web\tiny-robot\packages\chat\src\types\ui.ts)
- `configProjection.ts`
- `chat.md` / `chat-advanced.md`

## 9. 方案二：结构化消息渲染（推荐作为第二阶段主线）

## 9.1 核心判断

当前最不应该继续强化的路径是：

- 让模型输出自由文本
- 业务自己用字符串规则解析
- 再把字符串拼成自定义组件

推荐主线应该是：

> 结构化输出 / 工具结果 -> 消息转换 -> 内容部件 -> 渲染器注册

## 9.2 推荐分层

建议把这条能力拆成三层：

### A. Message Transform

对模型结果做结构化转换：

```ts
export interface ChatMessageTransforms {
  onChunk?: (ctx) => void
  onFinish?: (ctx) => ChatMessage | void
}
```

用途：

- 过滤大模型噪音文本
- 抽取 JSON 包
- 把 assistant message 从纯字符串改写成结构化内容
- 给 message.metadata / state 补充业务字段

### B. Bubble Renderer Registry

把 chat 内部已有的 renderer match 能力正式暴露出来：

```ts
bubbleRenderers?: {
  contentMatches?: BubbleContentRendererMatch[]
  boxMatches?: BubbleBoxRendererMatch[]
}
```

这条底座当前已经存在于：

- [useDefaultBubbleConfig.ts](/e:/LS_WorkSpace/web\tiny-robot\packages\chat\src\composables\useDefaultBubbleConfig.ts)
- [ChatLayout.vue](/e:/LS_WorkSpace/web\tiny-robot\packages\chat\src\components\chat\ChatLayout.vue)

### C. Structured Content Contract

最终把 message content 逐步统一成：

```ts
type ChatMessageContent = string | ChatMessageContentItem[]
```

这样 renderer 才不是外挂，而是主线能力。

## 9.3 为什么 renderer registry 比继续加 slot 更合适

slot 适合：

- 在消息周围补 UI
- 局部加 badge / feedback / sources
- 完全接管 message-list

但 slot 不适合：

- “只替换某一类消息内容”
- “让业务稳定声明一种新消息部件”
- “把结构化内容与渲染器绑定成正式 contract”

对这类需求，renderer registry 才是更接近业界主流的解法。

## 9.4 与 transport 层的边界

不建议把这类能力主要建在 [openaiCompatibleTransport.ts](/e:/LS_WorkSpace/web\tiny-robot\packages\chat\src\adapters\openaiCompatibleTransport.ts) 上。

原因：

- transport 应该尽量 provider-agnostic
- provider 层适合做协议适配，不适合承载业务 UI 语义
- 当前 `kit` 已经有 plugin / chunk hook，更适合在 runtime 层做中间转换

推荐边界是：

- transport：只负责把 provider 响应变成 `ChatCompletion`
- kit plugin / chat transform：负责把 completion 变成业务 message
- renderer registry：负责把业务 message 渲染成 UI

## 10. 方案三：只用 slot / 白盒组合解决（不推荐作为主方案）

这是当前已经可行的办法，但不推荐继续把它当正式方向。

### 优点

- 不需要改底层类型
- 业务马上能自救
- 对单个项目灵活

### 问题

- 黑盒与白盒路径会快速分叉
- 用户需要理解更多内部实现
- 很难形成模板 / preset / cli 稳定 contract
- 一旦每个团队都自己做一套消息解析和按钮扩展，维护成本会持续上升

结论：

- slot / 白盒仍然要保留
- 但它应该是 fallback，不应该是主推方案

## 11. 推荐路线

## 11.1 第一优先级：消息动作系统

先做消息动作系统，理由是：

- 用户需求明确且高频
- 底层能力已具备
- 风险低
- 不需要先统一 content 类型
- 能快速让 `feedback` 从硬编码能力升级为正式扩展点

第一阶段建议输出：

- `messageActions`
- 内置 actions 与业务 actions 合并规则
- action context
- async action 基础支持
- demo + unit test + e2e

## 11.2 第二优先级：暴露 renderer registry

第二阶段建议只先暴露：

- `bubbleRenderers.contentMatches`
- `bubbleRenderers.boxMatches`

这能让用户开始做：

- 自定义卡片
- 自定义 artifact
- 自定义审批块
- 自定义 tool result panel

而不用整页接管 message list。

## 11.3 第三优先级：补 message transform

第三阶段再补：

- `messageTransforms.onFinish`
- `messageTransforms.onChunk`

目的：

- 正式打通“模型结果 -> 结构化消息 -> 自定义组件”的主线

## 11.4 第四优先级：统一 kit / bubble 的 content 类型

这一步价值很高，但改动面更大，应该在前面两步验证过方向后再推进。

## 12. 对现有 public surface 的建议

## 12.1 建议保留的东西

- `onActionClick`
- `prefix / suffix / after / content-footer`
- `message-list` slot
- 白盒组合能力

这些都仍然有价值，只是定位应调整为：

- 内置扩展点
- 或 fallback 能力

## 12.2 建议新增的东西

建议新增正式 public surface：

- `messageActions`
- `bubbleRenderers`
- `messageTransforms`

建议新增顺序：

1. `messageActions`
2. `bubbleRenderers`
3. `messageTransforms`

## 12.3 暂时不建议新增的东西

- 更多 feedback slot
- provider-specific UI hook
- 让模型直接返回 HTML / 组件名
- 基于 markdown 魔法标签的主线方案

## 13. 风险与控制

### 13.1 风险：动作系统越做越像工作流平台

控制方式：

- 第一阶段只解决“消息级动作”
- 不引入全局 action bus
- 不引入复杂权限 / loading store

### 13.2 风险：结构化渲染过早侵入 transport

控制方式：

- 坚持 transport 只做 provider 协议适配
- 业务转换放在 chat/kit transform 层

### 13.3 风险：内容模型统一改动过大

控制方式：

- 先暴露 renderer registry
- 再补 transform
- 最后再统一 `kit` 消息类型

### 13.4 风险：黑盒 / 白盒路径再次分叉

控制方式：

- 所有新能力优先放入 `presetOverrides / preset props / preset slices`
- 保证 `TrChat` 和 `TrChat.Scaffold` 能消费同一套能力

## 14. 建议的最小实施计划

### Phase A：Message Actions

目标：

- 让用户可以在不接管 message list 的前提下，扩展消息级业务按钮

交付：

- 新增 action definition / context 类型
- `useChatFeedback` 支持 built-in + custom action 合并
- 黑盒 demo
- 白盒 demo
- unit / e2e / docs

### Phase B：Bubble Renderer Registry

目标：

- 让用户可以声明式注册自定义消息渲染器

交付：

- 暴露 `bubbleRenderers.contentMatches / boxMatches`
- demo：业务卡片 / artifact 卡片
- docs：从 slot 到 renderer 的选型说明

### Phase C：Message Transform

目标：

- 让用户可以稳定地把模型返回转换成结构化消息

交付：

- `messageTransforms.onFinish`
- 进阶可选 `onChunk`
- demo：JSON -> 卡片组件

## 15. 当前建议给团队的决策结论

如果只给团队一个明确建议，我会建议：

1. **先做 Message Actions**
2. **再做 Bubble Renderer Registry**
3. **最后做 Message Transform**
4. **暂不直接重写 transport，也暂不直接做 content 类型大迁移**

原因是：

- 这样对当前代码最友好
- 风险最低
- 用户收益最大
- 与业界方向一致
- 能形成黑盒 / 白盒一致的扩展 contract

## 16. 参考资料

以下资料用于本次调研和设计判断：

- OpenAI Structured Outputs
  - https://developers.openai.com/api/docs/guides/structured-outputs
- OpenAI Function Calling
  - https://developers.openai.com/api/docs/guides/function-calling
- Anthropic Tool Use
  - https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
- AI SDK Streaming Custom Data
  - https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data
- AI SDK Message Metadata
  - https://ai-sdk.dev/docs/ai-sdk-ui/message-metadata
- AI SDK Middleware
  - https://ai-sdk.dev/docs/ai-sdk-core/middleware
