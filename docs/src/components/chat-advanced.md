---
outline: deep
---

# Chat 进阶了解

这页是补充资料。现在的目标如果只是把 `TrChat` 用起来，可以先跳过。

这页主要讲两类内容：

- 继续使用 `TrChat` 时，还能怎么扩展
- 只有在更高定制层才需要单独消费的公开组件和配置加工能力

## 什么情况下再来看

适合：

- 你已经熟悉 `TrChat`、`presetOverrides` 和常见插槽
- 你现在要继续扩消息级动作、消息渲染或运行时消息结果
- 或者你要做更高一层的页面装配或中间层封装

不适合：

- 第一次接入 `@opentiny/tiny-robot-chat`
- 还在确认 `TrChat` 本身是否已经够用
- 还没明确遇到“默认入口做不到”的问题

如果你还在前面的阶段，建议先看：

- [Chat 快速接入](./chat.md)
- [先看这 4 个入口](./chat.md#先看这-4-个入口)
- [局部定制](./chat.md#局部定制)
- [页面级覆盖](./chat.md#页面级覆盖)

## 先看这些扩展能力

如果你现在主要还是继续使用 `TrChat`，这页最值得先看的其实是下面这些能力：

| 能力 | 什么时候才需要看 |
| :-- | :-- |
| `messageActions` | 你要给消息下方扩业务按钮，但不想接管整页消息列表 |
| `bubbleRenderers` | 你要替换某一类消息的默认渲染 |
| `messageTransforms` | 你要在运行时改写模型结果，再交给页面渲染 |
| `chatKit.runtime` | 你要读更细的请求状态或访问当前 engine |

如果这些都不是你现在的问题，可以直接跳到：

- [高级公开组件](#高级公开组件)
- [配置加工能力](#配置加工能力)

## 扩展消息下方动作

如果你想继续使用 `TrChat`，但要在消息下方增加业务动作，不需要先接管整页 `message-list`。

当前推荐入口：

- `presetOverrides.messageActions`
- `presetOverrides.messageActionsMode`

适合：

- assistant 消息下增加“保存到案例库”“创建工单”“加入知识库”这类动作
- user 消息下增加“保存为模板”“再次编辑”这类动作

一个最小示例：

```ts
const presetOverrides = {
  messageActions: [
    {
      id: 'save-case',
      label: '保存到案例库',
      placement: 'operations',
      roles: ['assistant'],
      onClick(context) {
        console.log(context.message)
      },
    },
  ],
}
```

默认行为：

- 不写 `messageActionsMode` 时，内置动作会保留
- 写 `messageActionsMode: 'replace'` 时，使用你自己的动作列表

当前支持的两个 placement：

- `actions`
  - 更适合右侧 icon 型动作
- `operations`
  - 更适合左侧文本型业务动作

## 替换某类消息的默认渲染

如果你只想替换某一类消息的默认渲染，不需要直接接管 `message-list`。

当前推荐入口：

- `presetOverrides.bubbleRenderers`

一个最小示例：

```ts
const presetOverrides = {
  bubbleRenderers: {
    contentMatches: [
      {
        find: (_message, content) =>
          content?.type === 'text' && content.text?.startsWith('[card]'),
        renderer: CustomCardRenderer,
        priority: -2,
      },
    ],
  },
}
```

适合：

- 某类消息渲染成卡片
- 某类消息渲染成 artifact / 审批块 / 结果块
- 只替换命中的消息，其他消息仍保留默认渲染链

一个常见推荐顺序是：

1. 先用 `messageTransforms` 把结果改写成可识别格式
2. 再用 `bubbleRenderers` 命中对应 renderer

## 运行时改写消息结果

如果你想在消息真正渲染前改写结果，当前推荐从 `runtime.messageTransforms` 进入。

当前支持：

- `onChunk`
- `onFinish`

一个最小示例：

```ts
const runtime = {
  messageTransforms: {
    onFinish({ message }) {
      return {
        content: `[card] ${message.content ?? ''}`,
        metadata: {
          transformed: true,
        },
      }
    },
  },
}
```

如果你要在流式过程中补充运行时信息，也可以用：

```ts
const runtime = {
  messageTransforms: {
    onChunk({ currentMessage }) {
      currentMessage.metadata ??= {}
      currentMessage.metadata.chunkCount =
        (currentMessage.metadata.chunkCount ?? 0) + 1
    },
  },
}
```

适合：

- 过滤模型原始文本
- 给最终消息补 metadata
- 改写最终消息内容，再交给 renderer 命中
- 观察流式 chunk

不建议：

- 在 transform 里直接塞太多复杂业务编排
- 把 transform 当成 transport 层替代品

## MCP 最小接入

如果你现在要解决的不是“进阶原理”，而是“让模型先能调一个 MCP 工具”，可以先看这个最小 recipe。

它放在这一页，而不是放在 quick start，原因是：

- 它依赖 `runtime.plugins`
- 它依赖 `mcpManager`
- 它涉及 tool call 这条运行时链

也就是说，这个场景已经属于“带运行时扩展点的接入”，而不是第一步把 `TrChat` 跑起来的必需内容。

最小闭环只需要 3 件事：

1. 用 `useMcpManager()` 托管工具列表和工具执行
2. 用 `toolPlugin({ getTools, callTool })` 把工具接入消息请求链
3. 把 `mcpManager` 通过 `runtime.mcpManager` 传给 `TrChat`

```ts
const mcpManager = useMcpManager({
  initialPlugins: [demoPlugin],
})

const runtime = {
  mcpManager,
  plugins: [
    toolPlugin({
      getTools: mcpManager.getTools,
      callTool: mcpManager.callTool,
    }),
  ],
}
```

这个示例刻意不再模拟假的 `tool_calls`、假工具结果或额外的 mock `responseProvider`，避免把“文档站 demo 逻辑”误读成“MCP 接入必须写这么多代码”。

真正落地时，只需要把 `mcpManager.bridge` 对接到你的后端或真实 MCP bridge，让模型正常返回 `tool_calls` 即可。

<demo vue="../../demos/chat/mcp-minimal.vue" :vueFiles="['../../demos/chat/mcp-minimal.vue']" title="MCP 最小集成" description="只展示 mcpManager + toolPlugin + runtime.mcpManager 的最小前端接线，不额外模拟工具调用。" />

生产建议：

- 前端不要直接托管真实 MCP server 的敏感凭证或 session
- 工具数量先少后多，第一版先保持“一个工具 + 一条完整调用链”
- 工具 schema 先小而准，不要一开始堆过多参数和复杂描述

## 什么时候才需要看 `chatKit.runtime`

大多数直接使用 `TrChat` 的页面，不需要手动消费 runtime bridge。

只有在这些场景里，才值得继续往下看：

- 你要读更细的请求状态
- 你要调试 streaming / request lifecycle
- 你要手动 `clear`
- 你要手动 `saveMessages`

当前可用能力包括：

- `chatKit.runtime.activeEngine`
- `chatKit.runtime.requestState`
- `chatKit.runtime.processingState`
- `chatKit.runtime.isProcessing`
- `chatKit.runtime.clear()`
- `chatKit.runtime.saveMessages()`

这层能力是“必要的底层 bridge”，不是为了把 `chat` 变成 `kit` 的完整替代品。

## 高级公开组件

如果你已经明确遇到“单靠 `TrChat` 主入口不够”的问题，再继续看这些公开组件。

| 能力 | 什么时候才需要看 |
| :-- | :-- |
| `TrChat.HistorySurface` | 你要把历史区单独抽出来放进自定义页面 |
| `TrModelSelector` | 你要在默认 footer 之外单独摆模型切换 |
| `TrMcpTrigger` / `TrChatMcpPanel` | 你要在更高层页面单独摆 MCP 入口或 MCP 面板 |
| `TrChat.WorkspaceLayout` / `TrChat.WorkspaceShell` / `TrChat.WorkspaceRightSheet` | 你要显式消费 workspace shell 相关公开 surface |

### `TrChat.HistorySurface`

`TrChat.HistorySurface` 适合在更高定制页面里，单独渲染一块独立历史区域。

适合：

- 左侧会话列表
- 独立面板布局
- 需要把历史区从默认页面里单独拿出来

### `TrMcpTrigger`

`TrMcpTrigger` 是 chat 层提供的 MCP 入口触发器。

适合：

- 放在 sender footer 工具条
- 在更高定制页面里单独暴露 MCP 入口
- 复用 chat 层默认的桌面端 / 移动端交互样式

### `TrChatMcpPanel`

`TrChatMcpPanel` 用于承接聊天场景中的 MCP 面板本体能力。

适合：

- 已经有自己的 MCP 入口按钮，只想复用面板本体
- 在 header / toolbar 中提供 MCP 面板入口
- 与 `mcpManager` 配合，展示插件与工具列表

### `TrModelSelector`

`TrModelSelector` 用于消费当前模型列表和当前模型状态。

适合：

- 放在 footer 工具条
- 放在 header 右侧扩展区
- 在更高定制页面里单独暴露模型切换能力

一个常见注意点：

- `models`
- `defaultModel`
- 每个 model 的 `providerId`
- `onModelChange`
- 如果没显示图标，先检查 `providerId` 是否命中了内置 provider 图标
- 如果你要强制指定图标，手动传 `ModelOption.icon`
- 默认是否出现 selector，也仍然取决于模型数量、默认模型配置，以及页面是否保留了默认 footer 工具位

### `TrChatFeedback`

`TrChatFeedback` 用于在更高定制页面里单独消费消息反馈能力。

适合：

- 你已经自己写了 `TrChat.MessageList`
- 但仍希望复用默认 feedback 行为

### `TrChat.WorkspaceLayout` / `TrChat.WorkspaceShell` / `TrChat.WorkspaceRightSheet`

这三个公开 surface 面向 workspace shell 场景。

适合：

- 你要显式消费 workspace 布局容器
- 你要自己控制左侧 / 中间 / 右侧区域的组合
- 你要单独复用移动端右侧 sheet 入口

简单区分：

- `TrChat.WorkspaceLayout`
  - Chat 层的 workspace 装配容器，默认会把 history、right panel / sheet 这些结构一起接起来
- `TrChat.WorkspaceShell`
  - 更低一层的区域容器，适合你自己控制左右区域和折叠行为
- `TrChat.WorkspaceRightSheet`
  - 移动端右侧区域的 sheet 入口，适合单独复用

如果你只是想替换 workspace 左右面板内容，优先继续使用 `TrChat` 上的面板级 slots：

- `left`
- `left-rail`
- `right`
- `mobile-left`
- `mobile-right`

如果你要重排 Header / Welcome / MessageList / Footer 整体结构，再继续进入这些公开组件。

## 配置加工能力

除了组件，`chat` 包还公开了配置归一化与配置加工能力。

当前常见入口包括：

| API | 作用 |
| :-- | :-- |
| `loadChatConfig` | 读取并规范化原始配置 |
| `createChatAdapterFromConfig` | 从配置生成 adapter |
| `createPresetChatProps` | 生成 preset props |
| `createPresetChatSlices` | 生成叶子组件可消费的 preset slices |

建议只有在这些场景才进入这层能力：

- 页面壳层二次封装
- 内部白盒接入层
- 需要显式消费 adapter / preset props / preset slices 的中间层

如果你只是业务页面接入聊天 UI，通常先停在 `TrChat` 就够了。

一个典型例子：

```ts
import {
  createChatAdapterFromConfig,
  createPresetChatProps,
  createPresetChatSlices,
} from '@opentiny/tiny-robot-chat'

const adapter = createChatAdapterFromConfig(chatConfig)
const presetProps = createPresetChatProps(adapter)
const slices = createPresetChatSlices(presetProps)
```

然后你可以把这些结果继续投影到更高层页面：

<demo vue="../../demos/chat/advanced-preset-slices.vue" :vueFiles="['../../demos/chat/advanced-preset-slices.vue']" title="配置加工能力" description="先生成 adapter、presetProps、presetSlices，再把结果投影到更高层页面。" />

## 相关页面

- [Chat 快速接入](./chat.md)
- [先看这 4 个入口](./chat.md#先看这-4-个入口)
- [局部定制](./chat.md#局部定制)
- [什么时候再看进阶内容](./chat.md#什么时候再看进阶内容)
- [History 历史](./history.md)
- [Feedback 气泡反馈](./feedback.md)
