---
outline: [2, 3]
---

# Chat 自定义

本页介绍当 `TrChat` 无法满足需求时，如何升级到更高自由度的接入路径。

推荐的理解顺序是：

1. `TrChat`
2. `TrChat.Root + TrChat.Page`
3. `TrChat.Root + primitives`

如果尚未确定接入方式，请先参阅：

- [Chat 快速开始](./chat.md)

如果仍在使用 `TrChatConfig` 配置，请先参阅：

- [Chat 配置](./chat-features.md)

## 什么时候进入自定义路径

适合这些情况：

- 需要自行创建 runtime
- 希望保留官方页面，但不再使用默认接入方式
- 需要自定义页面结构
- 希望保留官方 UI 和聊天行为，但需要自行对接 transport 层
- 需要在 sender、message list 或 workspace 层进行更深度的定制

## `Root + Page`

适合：

- 需要自行创建 runtime
- 仍希望使用官方页面结构
- 需要将聊天页嵌入业务容器

这是最平滑的升级路径。查看完整示例：[Chat Runtime + Slots](/examples/chat-runtime-and-slots)

```vue
<script setup lang="ts">
import { TrChat, createRuntimeFromConfig } from '@opentiny/tiny-robot-chat'

const config = {
  request: {
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat/completions',
      },
    },
    models: [{ id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' }],
    defaultModelId: 'gpt-4.1-mini',
  },
  ui: {
    brand: { title: 'Internal Chat' },
  },
}

const { runtime, ui } = createRuntimeFromConfig(config)
</script>

<template>
  <TrChat.Root :runtime="runtime" :ui="ui">
    <TrChat.Page />
  </TrChat.Root>
</template>
```

## `Root + primitives`

适合：

- 需要自行组合 `Header / MessageList / Footer / History / Workspace`
- 需要在页面中插入自定义区域
- 需要单独使用 `TrChat.Sender`、`TrChat.MessageList`、`TrChat.McpTrigger`

这是完全自定义页面组合的路径。查看完整示例：[Chat Workspace 布局](/examples/chat-workspace-layout)

### 最小示例

```vue
<script setup lang="ts">
import { TrChat, createRuntimeFromConfig } from '@opentiny/tiny-robot-chat'

const { runtime, ui } = createRuntimeFromConfig({
  request: {
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat/completions',
      },
    },
    models: [{ id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' }],
    defaultModelId: 'gpt-4.1-mini',
  },
  ui: { brand: { title: 'My Chat' } },
})
</script>

<template>
  <TrChat.Root :runtime="runtime" :ui="ui">
    <TrChat.Layout :appearance="ui.appearance" :content-layout="ui.contentLayout">
      <TrChat.Header :title="ui.brand?.title" />

      <TrChat.Welcome
        v-if="runtime.conversation.messages.value.length === 0"
        :title="ui.welcome?.title"
        :description="ui.welcome?.description"
        :prompts="ui.welcome?.prompts"
        @prompt-click="runtime.conversation.send({ text: $event })"
      />

      <TrChat.MessageList v-else />

      <TrChat.Footer>
        <TrChat.Sender />
      </TrChat.Footer>
    </TrChat.Layout>
  </TrChat.Root>
</template>
```

## `TrChat.Provider(transportAdapter)`

适合：

- 希望保留官方 UI 和聊天行为
- 不需要自行创建整套 runtime
- 但需要自行接管 transport / data-access 层

推荐使用以下属性名：

- `transportAdapter`

兼容别名仍然支持：

- `responseProvider`

新代码中建议优先使用 `transportAdapter`。

### 最小示例

```vue
<script setup lang="ts">
import { TrChat } from '@opentiny/tiny-robot-chat'

const transportAdapter = async (requestBody, abortSignal) => {
  const response = await fetch('/api/chat/completions', {
    method: 'POST',
    signal: abortSignal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  return await response.json()
}
</script>

<template>
  <TrChat.Provider :transport-adapter="transportAdapter">
    <TrChat.Layout>
      <TrChat.MessageList />
      <TrChat.Footer>
        <TrChat.Sender />
      </TrChat.Footer>
    </TrChat.Layout>
  </TrChat.Provider>
</template>
```

`responseProvider` 仍然兼容，但建议逐步迁移到 `transportAdapter`。

## `createRuntimeFromConfig`

`createRuntimeFromConfig(config)` 适合这种场景：

- 已有一份 `TrChatConfig`
- 需要从默认入口升级到 `Root + Page` 或 `Root + primitives`
- 无需手写完整 runtime 映射

其作用是：

- 从 `TrChatConfig`
- 到 `{ runtime, ui }`
- 的官方桥接工具

它不是默认入口的一部分，而是升级到自定义路径时推荐的桥接工具。

## Slots 与扩展点

在升级到 `Root + primitives` 之前，可以先通过 slots 做轻量扩展。

### `TrChat.Page` Slots

`TrChat.Page` 提供以下 slots，分为页面级、bubble 级和 workspace 级三类。

#### 页面级 slots

| Slot | 类型 | 用途 |
|---|---|---|
| `header` | replace | 替换整个默认 header 区域 |
| `header-extra` | augment | 在 header 右侧注入自定义内容 |
| `message-list` | replace | 替换默认消息列表 |
| `welcome` | replace | 替换默认欢迎区 |
| `empty` | replace | 无 welcome 配置时的空状态 |
| `sender` | replace | 替换默认 sender 区域 |
| `footer-extra` | augment | 在 sender 上方注入额外内容 |

`replace` 类型的 slot 会完全替换对应的默认区域；`augment` 类型的 slot 在默认区域旁边注入内容，不影响默认结构。

部分 slots 提供 slot props：

- `message-list`：`{ messages: ReadonlyRef<ChatMessage[]> }`
- `sender`：`{ send, abort, status, lastError, retry }`

示例——用 `header-extra` 注入状态指示器：

```vue
<TrChat.Root :runtime="runtime" :ui="ui">
  <TrChat.Page>
    <template #header-extra>
      <span class="status-badge">{{ runtime.conversation.status.value }}</span>
    </template>
  </TrChat.Page>
</TrChat.Root>
```

示例——用 `sender` 替换默认发送区：

```vue
<TrChat.Page>
  <template #sender="{ send, status }">
    <div>
      <input v-model="draft" @keydown.enter="send(draft)" />
      <span>{{ status.value }}</span>
    </div>
  </template>
</TrChat.Page>
```

#### Bubble 级 slots

这些 slots 透传给底层的 `BubbleList`，用于自定义消息气泡的各个位置：

| Slot | 用途 |
|---|---|
| `prefix` | 消息气泡前方 |
| `suffix` | 消息气泡后方（同行） |
| `after` | 消息气泡下方 |
| `content-footer` | 消息内容底部 |

#### Workspace 级 slots

这些 slots 只在 workspace 模式下生效：

| Slot | 用途 |
|---|---|
| `left` | 替换桌面端左侧面板（默认是历史列表） |
| `left-rail` | 替换桌面端左侧折叠 rail |
| `right` | 替换桌面端右侧面板 |
| `mobile-left` | 替换移动端左侧 sheet（不提供时 fallback 到 `left`） |
| `mobile-right` | 替换移动端右侧 sheet（不提供时 fallback 到 `right`） |

示例——自定义左侧面板：

```vue
<TrChat.Page>
  <template #left>
    <aside class="my-sidebar">
      <h3>项目导航</h3>
      <ul>
        <li>文档</li>
        <li>设置</li>
      </ul>
    </aside>
  </template>
</TrChat.Page>
```

### `TrChat.Header` Slots

| Slot | 用途 |
|---|---|
| `title` | 替换默认标题文字 |
| `extra` | 在标题右侧、操作按钮左侧注入内容 |

示例：

```vue
<TrChat.Header :title="'My Chat'">
  <template #extra>
    <span class="badge">Beta</span>
  </template>
</TrChat.Header>
```

### `TrChat.Footer` Slots

| Slot | 用途 |
|---|---|
| `extra` | 在 sender 上方注入内容（和 `TrChat.Page` 的 `footer-extra` 对应） |
| 默认 slot | footer 的主体内容，通常放 `TrChat.Sender` |

### `TrChat.Sender` Slots

| Slot | 用途 |
|---|---|
| `footer` | 发送区底部左侧，适合放 MCP 触发器、工具按钮等 |
| `footer-right` | 发送区底部右侧（默认位置是上传和语音按钮） |

`footer` 和 `footer-right` 只在多行模式（`mode: 'multiple'`）下生效。

示例——左下角放 MCP 触发器，右下角放自定义按钮：

```vue
<TrChat.Sender>
  <template #footer>
    <TrChat.McpTrigger label="MCP 工具" />
  </template>
  <template #footer-right>
    <button @click="handleCustomAction">自定义</button>
  </template>
</TrChat.Sender>
```

### `TrChat.WorkspaceLayout` Slots

`TrChat.WorkspaceLayout` 是 workspace 模式下的高层布局组件，在 `Root + primitives` 路径下使用。

| Slot | 用途 | Slot Props |
|---|---|---|
| `left` | 桌面端左侧面板 | `{ collapsed, toggle, collapse, expand }` |
| `left-rail` | 桌面端左侧折叠 rail | `{ expand }` |
| `right` | 桌面端右侧面板 | `{ collapsed, toggle, collapse, expand }` |
| `mobile-left` | 移动端左侧 sheet（fallback 到 `left`） | — |
| `mobile-right` | 移动端右侧 sheet（fallback 到 `right`） | — |
| 默认 slot | 中间主内容区，通常放 `TrChat.Layout` | — |

`left` 和 `right` 的 slot props 可以用来控制侧边栏的折叠状态：

```vue
<TrChat.WorkspaceLayout :appearance="ui.appearance">
  <template #left="{ collapsed, toggle }">
    <aside>
      <button @click="toggle">{{ collapsed ? '展开' : '折叠' }}</button>
      <nav v-if="!collapsed">侧边栏内容</nav>
    </aside>
  </template>

  <TrChat.Layout>
    <!-- 中间聊天区 -->
  </TrChat.Layout>
</TrChat.WorkspaceLayout>
```

### 什么时候用 slots，什么时候升级到 primitives

- 只改某个区域的局部 UI → 用 `TrChat.Page` 的 slots
- 需要跨多个区域重排结构 → 升级到 `Root + primitives`
- 需要消费 slot props 之外的 runtime 模块 → 升级到 `Root + primitives`

## 常见高级场景

### MCP

如果需要接入 MCP，推荐两种路径：

- 在 `TrChat.Provider` 上显式传入 `mcpManager`
- 或在 `TrChat.Root` 的 runtime 里提供 `mcp`

如果只需在 sender footer 区域放置触发器，可以配合 `TrChat.McpTrigger`。

### Sender extensions

如果需要实现 suggestion、mention 或自定义 sender 扩展，推荐走：

- `Root + primitives`
- 或 `TrChat.Provider`

这类能力不应通过默认入口隐式传递。

### Standalone advanced surfaces

这些能力仍然适合放在高级路径里介绍：

- `useMcpManager`
- `TrChat.McpTrigger`
- `TrChat.Feedback`

## 下一步看哪里

- 返回入口选择：参阅 [Chat 快速开始](./chat.md)
- 继续配置默认接入方式：参阅 [Chat 配置](./chat-features.md)
