---
outline: [2, 3]
---

# Chat 定制与进阶

这页只解决一个问题：

- 当 `TrChat` 默认入口已经不够用时，应该如何升级到结构定制、运行时扩展和更高层装配

如果你现在只是想先把 chat 跑起来，或者只是想查配置字段，建议先回到：

- [Chat 接入与入口](./chat.md)
- [Chat 配置与能力](./chat-features.md)

## 什么时候该看这页

适合：

- 你已经熟悉 `TrChat`、`presetOverrides` 和常见 slots
- 你现在要继续扩消息动作、消息渲染或运行时结果
- 你要做 workspace 左右面板、页面结构重排，或接入 MCP

不适合：

- 第一次接入 `@opentiny/tiny-robot-chat`
- 还没确认 `TrChat` 是否已经够用
- 还在查配置字段和能力开关写在哪里

## 定制升级路径

建议按下面这条路径逐级升级：

| 你要做什么 | 推荐入口 | 什么时候再往上走 |
| :-- | :-- | :-- |
| 改布局、文案、默认开关 | `presetOverrides` | 覆盖不够再用 slots |
| 换局部 UI | `slots` | 默认结构本身不合适再进 `Scaffold` |
| 重排页面结构，但仍想复用默认配置能力 | `TrChat.Scaffold` | 需要自己管 runtime 再进 `Provider` |
| 自己决定页面装配和底层输入 | `TrChat.Provider` | - |
| 扩展消息动作、消息渲染、运行时消息结果 | `presetOverrides` + 顶层 `runtime` | - |

一条实用规则：

- 先继续留在 `TrChat`
- 确认默认入口真做不到时，再进入 `Scaffold` 或 `Provider`

## 结构定制

### 继续使用 `TrChat` 时，先试这 3 类手段

1. `presetOverrides`
   - 改布局模式、占位文案、默认能力开关
2. `slots`
   - 替换 header、welcome、sender、message-list 局部内容
3. workspace panel slots
   - 只替换 workspace 左右面板内容

常用 slots：

| slot | 适合做什么 |
| :-- | :-- |
| `header-extra` | 给默认 header 右侧补按钮或工具位 |
| `footer-extra` | 给默认 footer 顶部补说明或状态条 |
| `welcome` | 替换欢迎区 |
| `sender` | 接管底部输入区 UI，但保留默认运行时 |
| `message-list` | 接管中间消息区 |
| `left` / `left-rail` / `right` | 在 workspace 模式下替换左右面板内容 |
| `mobile-left` / `mobile-right` | 在 workspace 模式下替换移动端 drawer / sheet |

### Workspace 面板级定制

如果你只是想替换 workspace 左右面板内容，不需要为了这件事直接进入 `Scaffold` 或 `Provider`。

推荐顺序：

- 继续使用 `TrChat`
- 通过 `left / left-rail / right / mobile-left / mobile-right` 替换面板内容
- 保留默认聊天主区、模型选择和默认运行时

<demo vue="../../demos/chat/workspace-panel-slots.vue" :vueFiles="['../../demos/chat/workspace-panel-slots.vue']" title="Workspace 面板级定制" description="继续使用 TrChat，只替换 workspace 左右面板内容。" />

### 当 slots 不够时：`TrChat.Scaffold`

`TrChat.Scaffold` 适合：

- 页面结构要改
- 但仍希望继续沿用默认配置能力和 `presetSlices`

可以把它理解成：

- “开始自己排页面”
- “但还不想自己重写整条 config -> preset -> UI 装配链”

一个最小示意：

```vue
<TrChat.Scaffold :config="chatConfig" v-slot="{ chatKit, presetSlices }">
  <TrChat.Layout>
    <TrChat.Header v-bind="presetSlices.header" />

    <TrChat.Welcome
      v-if="chatKit.messages.value.length === 0 && presetSlices.welcome"
      v-bind="presetSlices.welcome"
      @prompt-click="chatKit.sendMessage($event)"
    />

    <TrChat.MessageList v-else v-bind="presetSlices.messageList" />

    <TrChat.Footer>
      <TrChat.Sender v-bind="presetSlices.sender" />
    </TrChat.Footer>
  </TrChat.Layout>
</TrChat.Scaffold>
```

### 需要自己接管 runtime 时：`TrChat.Provider`

`TrChat.Provider` 适合：

- 你已经明确要自己装配页面
- 你愿意手动管理更底层输入
- 你已经有自己的 `chatKit` 或 `responseProvider`

一个最小示意：

```vue
<TrChat.Provider :chat-kit="chatKit">
  <div class="tr-chat" style="height: 100%">
    <TrChat.Header title="手动组合页面" />
    <TrChat.MessageList />
    <TrChat.Footer>
      <TrChat.Sender />
    </TrChat.Footer>
  </div>
</TrChat.Provider>
```

如果你只是想替换 workspace 面板，不要直接从这里开始。

## 运行时扩展

### 扩展消息下方动作

如果你想继续使用 `TrChat`，但要在消息下方增加业务动作，不需要先接管整页 `message-list`。

当前推荐入口：

- `presetOverrides.messageActions`
- `presetOverrides.messageActionsMode`

最小示例：

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

### 替换某类消息的默认渲染

如果你只想替换某一类消息的默认渲染，不需要直接接管 `message-list`。

当前推荐入口：

- `presetOverrides.bubbleRenderers`

最小示例：

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

一个常见顺序是：

1. 先用 `messageTransforms` 改写结果
2. 再用 `bubbleRenderers` 命中 renderer

### 运行时改写消息结果

如果你想在消息真正渲染前改写结果，当前推荐从 `runtime.messageTransforms` 进入。

当前支持：

- `onChunk`
- `onFinish`

最小示例：

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

适合：

- 过滤模型原始文本
- 给最终消息补 metadata
- 改写最终消息内容，再交给 renderer 命中

### 什么时候才需要看 `chatKit.runtime`

大多数直接使用 `TrChat` 的页面，并不需要手动消费 runtime bridge。

只有在这些场景里，才值得继续往下看：

- 你要读更细的请求状态
- 你要调试 streaming / request lifecycle
- 你要手动 `clear`
- 你要手动 `saveMessages`

当前可用能力：

- `chatKit.runtime.activeEngine`
- `chatKit.runtime.requestState`
- `chatKit.runtime.processingState`
- `chatKit.runtime.isProcessing`
- `chatKit.runtime.clear()`
- `chatKit.runtime.saveMessages()`

## MCP 最小接入

如果你现在要解决的不是“原理”，而是“先让模型能挂上 MCP 工具”，可以直接看这个最小 recipe。

最小闭环只需要 3 件事：

1. 用 `useMcpManager()` 托管工具列表和工具执行
2. 用 `toolPlugin({ getTools, callTool })` 把工具接入消息请求链
3. 把 `mcpManager` 通过 `runtime.mcpManager` 传给 `TrChat`

<demo vue="../../demos/chat/mcp-minimal.vue" :vueFiles="['../../demos/chat/mcp-minimal.vue']" title="MCP 最小集成" description="只展示 mcpManager + toolPlugin + runtime.mcpManager 的最小前端接线，不额外模拟工具调用。" />

真正落地时，只需要把 `mcpManager.bridge` 对接到你的后端或真实 MCP bridge，让模型正常返回 `tool_calls` 即可。

## 公开组件与工具函数

以下表格都对应 [packages/chat/src/index.ts](e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/index.ts) 当前真实导出的 public surface。

### `TrChat` compound components

这些成员最适合做 whitebox 或半白盒组装：

| API | 作用 | 适合什么时候用 |
| :-- | :-- | :-- |
| `TrChat.Scaffold` | 保留 config -> preset -> provider 链路，但自己排页面 | 想改结构但还想复用默认能力 |
| `TrChat.Provider` | 建立 chat runtime / ui context 根 | 已有 `chatKit`，或要自己接 `responseProvider` |
| `TrChat.Layout` | 默认 stacked 主体布局容器 | 自己重组 header / body / footer |
| `TrChat.WorkspaceLayout` | workspace 壳层布局 | 自己接 left / right / mobile sheet |
| `TrChat.Header` | 默认 header 组件 | 单独摆标题、历史入口、新会话入口 |
| `TrChat.Welcome` | 默认欢迎区 | 白盒组装欢迎态 |
| `TrChat.MessageList` | 默认消息列表 | 保留默认 bubble 链与 actions |
| `TrChat.Footer` | 默认 footer 容器 | 继续复用默认底部分区 |
| `TrChat.Attachments` | 默认附件列表区域 | 白盒页里单独摆附件区 |
| `TrChat.Sender` | 默认发送区 | 继续复用发送、取消、附件动作 |
| `TrChat.History` | 默认历史面板 | 整块复用会话历史 |
| `TrChat.HistorySurface` | 历史表面组件 | 把历史区抽离到别处展示 |
| `TrChat.WorkspaceShell` | workspace 桌面壳层 | 自己接管左右区域宽度、折叠和主题 |
| `TrChat.WorkspaceRightSheet` | 移动端右侧 sheet | 单独复用移动端右栏入口 |

### 白盒入口核心 props

最常需要查的是 `Scaffold` 和 `Provider` 这两个入口：

| API | 核心 props | 说明 |
| :-- | :-- | :-- |
| `TrChat.Scaffold` | `config`、`runtime`、`callbacks`、`presetOverrides` | 和顶层 `TrChat` 基本一致，但默认通过 `slot` 暴露 `chatKit / adapter / presetProps / presetSlices / currentModel / selectModel` |
| `TrChat.Provider` | 二选一：`chatKit` 或 `responseProvider` | 如果不传 `chatKit`，可以继续传 `plugins / storage / initialMessages / messageTransforms / onFinish / onError` 让它内部创建 runtime |
| `TrChat.Provider` 共享 props | `mcpManager`、`attachmentsManager`、`attachmentsFeature`、`senderActionsFeature`、`messages`、`shell` | 这些会进入 provider context，被叶子组件直接消费 |

### 独立公开组件

这些组件也以 named export 的方式单独暴露，适合不想通过 `TrChat.*` 访问时使用：

| API | 对应成员 | 作用 |
| :-- | :-- | :-- |
| `TrChatScaffold` | `TrChat.Scaffold` | 单独导入 scaffold |
| `TrChatLayout` | `TrChat.Layout` | 单独导入 stacked layout |
| `TrChatWorkspaceLayout` | `TrChat.WorkspaceLayout` | 单独导入 workspace layout |
| `TrChatAttachments` | `TrChat.Attachments` | 单独导入附件区 |
| `TrChatHistorySurface` | `TrChat.HistorySurface` | 单独导入历史 surface |
| `TrChatWorkspaceShell` | `TrChat.WorkspaceShell` | 单独导入 workspace shell |
| `TrChatWorkspaceRightSheet` | `TrChat.WorkspaceRightSheet` | 单独导入移动端右侧 sheet |
| `TrChatFeedback` | 无 compound 同名成员 | 复用消息反馈区 |
| `TrModelSelector` | 无 compound 同名成员 | 在任意位置单独摆模型切换 |
| `TrMcpTrigger` | 无 compound 同名成员 | 在任意位置单独摆 MCP 入口 |
| `TrChatMcpPanel` | 无 compound 同名成员 | 复用 MCP 面板本体 |

### 这一页只保留少数值得手动消费的 API

`@opentiny/tiny-robot-chat` 的确还公开了更多 hooks、renderers 和底层常量，但对大多数业务接入并不构成稳定入口。  

这份组件文档只保留“用户在白盒接入时真的可能手动消费”的少数工具：

| API | 作用 |
| :-- | :-- |
| `createChatAdapterFromConfig` | 从配置生成 adapter |
| `createPresetChatProps` | 生成 preset props |
| `createPresetChatSlices` | 生成叶子组件可消费的 preset slices |
| `useChatKit` | 创建 chat facade runtime |
| `useChatAttachments` | 创建附件 manager |
| `useMcpManager` | 创建 MCP manager |
| `useModelSelector` | 模型选择状态桥接 |

建议只有在这些场景才进入这层能力：

- 页面壳层二次封装
- 内部白盒接入层
- 需要显式消费 adapter / preset props / preset slices 的中间层

如果你只是业务页面接入聊天 UI，通常先停在 `TrChat` 就够了。

其余更底层的公开导出：

- 更适合作为源码层能力保留
- 不适合作为用户文档里的主参考入口
- 真要追的话，直接看 [packages/chat/src/index.ts](e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/index.ts)

## FAQ / 常见坑

### 什么时候该用 `Scaffold`，什么时候该用 `Provider`

推荐判断方式：

- 还想复用默认配置能力和 `presetSlices`
  - 先用 `Scaffold`
- 已经明确要自己装配页面，并且愿意自己管 runtime
  - 再用 `Provider`

### 只是替换 workspace 左右面板，是否需要进入 whitebox

通常不需要。

优先继续使用：

- `TrChat`
- `left / left-rail / right / mobile-left / mobile-right`

### `messageActions`、`bubbleRenderers`、`messageTransforms` 为什么不在 `features`

因为它们不是稳定默认能力开关，而是：

- 页面级渲染扩展
- 消息级行为扩展
- 运行时结果改写

所以它们应继续放在：

- `presetOverrides`
- 顶层 `runtime`

## 继续阅读

- [Chat 接入与入口](./chat.md)
- [Chat 配置与能力](./chat-features.md)
