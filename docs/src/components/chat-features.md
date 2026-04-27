---
outline: [2, 3]
---

# Chat 配置

这一页只讲当前 `TrChat` 的正式配置合同，也就是 `TrChatConfig`。

如果尚未确定接入方式，请先参阅：

- [Chat 快速开始](./chat.md)

如果不再使用默认接入方式，需要自行创建 runtime、自定义页面结构或使用 `TrChat.Provider(transportAdapter)`，请参阅：

- [Chat 自定义](./chat-advanced.md)

## `TrChat` 只接受什么

`TrChat` 只接受：

- `TrChatConfig` 对象
- `TrChatConfig` 的序列化 JSON 字符串

本页所有内容围绕同一个目标：

- 用 `TrChatConfig` 把默认聊天页配置起来

## 配置总览

| 字段 | 负责什么 | 常见内容 |
| :-- | :-- | :-- |
| `request` | 模型、默认模型、transport | `models`、`defaultModelId`、`transport` |
| `conversation` | 初始消息和持久化恢复 | `initialMessages`、`persistence` |
| `ui` | 展示层默认配置 | `brand`、`welcome`、`appearance`、`contentLayout`、`labels` |
| `sender` | 输入区默认行为 | `placeholder`、`mode`、`maxLength`、`wordCount`、`voice` |
| `attachments` | 附件上传与附件列表 | `enabled`、`upload`、`list` |
| `history` | 历史入口和默认状态 | `enabled`、`defaultOpen` |
| `workspace` | workspace 左右区和默认视图 | `enabled`、`left`、`right`、`defaultView` |
| `messages` | 消息动作、渲染、反馈、变换 | `actions`、`actionMode`、`renderers`、`feedback`、`transforms` |
| `lifecycle` | 发送前后和错误钩子 | `beforeSend`、`afterReceive`、`error` |

## 一份最常见的 `TrChatConfig`

```ts
const config = {
  request: {
    models: [
      { id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' },
    ],
    defaultModelId: 'gpt-4.1-mini',
    transport: {
      type: 'openai-compatible',
      endpoint: '/api/chat/completions',
      systemPrompt: 'You are a helpful assistant.',
    },
  },
  ui: {
    brand: { title: 'Internal Chat' },
    welcome: {
      title: '欢迎使用 TinyRobot Chat',
      description: '先试着问一个问题。',
    },
    appearance: { mode: 'system' },
    contentLayout: 'centered',
  },
  sender: {
    placeholder: 'Ask TinyRobot anything',
    mode: 'multiple',
    maxLength: 200,
    wordCount: true,
  },
  attachments: {
    enabled: true,
    upload: {
      enabled: true,
      accept: '.txt,.md',
      multiple: true,
    },
    list: {
      wrap: true,
    },
  },
  history: {
    enabled: true,
    defaultOpen: false,
  },
  workspace: {
    enabled: true,
    defaultView: 'workspace',
  },
  messages: {
    feedback: { enabled: true },
  },
}
```

## `request`

`request` 负责三件事：

- 当前有哪些模型可选
- 默认选哪个模型
- 请求的目标地址

最常用的是：

- `models`
- `defaultModelId`
- `transport`

最小示例：

```ts
request: {
  models: [
    { id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' },
  ],
  defaultModelId: 'gpt-4.1-mini',
  transport: {
    type: 'openai-compatible',
    endpoint: '/api/chat/completions',
  },
}
```


#### 完整字段参考 {#request-ref}

##### `request.models[]`

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | `string` | ✅ | 模型唯一标识 |
| `providerId` | `string` | ✅ | 模型提供商标识 |
| `label` | `string` | — | 显示名称 |
| `icon` | `Component` | — | 模型图标组件 |
| `disabled` | `boolean` | — | 是否禁用 |

##### `request.transport`

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `type` | `'openai-compatible'` | — | 传输协议类型 |
| `endpoint` | `string` | — | 请求地址（相对或绝对路径） |
| `baseURL` | `string` | — | 基础 URL |
| `apiPath` | `string` | — | API 路径 |
| `systemPrompt` | `string` | — | 系统提示词 |
| `temperature` | `number` | — | 温度参数 |
| `maxTokens` | `number` | — | 最大 token 数 |
| `headers` | `Record<string, string>` | — | 自定义请求头 |
| `credentials` | `RequestCredentials` | — | 请求凭证模式（`'omit'` / `'same-origin'` / `'include'`） |

##### 其他字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `defaultModelId` | `string \| null` | 默认选中的模型 ID |
| `systemPrompt` | `string` | 顶层系统提示词（优先级低于 `transport.systemPrompt`） |


## `conversation`

`conversation` 负责初始消息和持久化恢复。

最常用的是：

- `initialMessages`
- `persistence`

最小示例：

```ts
conversation: {
  initialMessages: [
    { role: 'system', content: 'You are a helpful assistant.' },
  ],
}
```


#### 完整字段参考 {#conversation-ref}

| 字段 | 类型 | 说明 |
|---|---|---|
| `initialMessages` | `ChatMessage[]` | 首屏初始消息列表，首次加载时自动填充到会话中 |
| `persistence` | `ConversationStorageStrategy` | 会话持久化策略，用于保存和恢复会话数据。可使用 `@opentiny/tiny-robot-kit` 提供的 `localStorageStrategyFactory()` 或 `indexedDBStorageStrategyFactory()`，也可自行实现 |


## `ui`

`ui` 只负责展示层默认值。

最常用的是：

- `brand`
- `welcome`
- `appearance`
- `contentLayout`
- `labels`

最小示例：

```ts
ui: {
  brand: { title: 'Internal Chat' },
  welcome: {
    title: '欢迎使用 TinyRobot Chat',
    description: '先试着问一个问题。',
  },
  appearance: { mode: 'system' },
  contentLayout: 'centered',
}
```

##### `ui.labels` 文案覆盖

`labels` 可以覆盖组件内置的所有文案，按区域分组：

```ts
ui: {
  labels: {
    header: {
      newChat: '新建对话',
      openHistory: '打开历史',
      closeHistory: '关闭历史',
      close: '关闭',
    },
    history: {
      newSession: '新建会话',
      manage: '管理',
      done: '完成',
      defaultConversationTitle: '新对话',
      searchPlaceholder: '搜索会话...',
      deleteSelected: '删除选中',
      cancel: '取消',
    },
    sender: {
      placeholder: '请输入您的问题',
    },
    workspace: {
      rightPanelTitle: '预览面板',
      expandLeftSidebar: '展开左侧边栏',
      historyRailLabel: '历史',
      previewRailLabel: '预览',
      closeRightPanel: '关闭右侧面板',
    },
    feedback: {
      copy: '复制',
      edit: '编辑',
      regenerate: '重新生成',
    },
    error: {
      defaultMessage: '发生错误',
      retry: '重试',
    },
  },
}
```

每个分组都是可选的，只需要覆盖你想改的字段。例如只改右侧面板标题：

```ts
ui: {
  labels: {
    workspace: { rightPanelTitle: '详情面板' },
  },
}
```


#### 完整字段参考 {#ui-ref}

#### `ui.brand`

| 字段 | 类型 | 说明 |
|---|---|---|
| `title` | `string` | 品牌标题，显示在 header 区域 |
| `logo` | `VNode \| Component` | 品牌图标 |

#### `ui.welcome`

| 字段 | 类型 | 说明 |
|---|---|---|
| `title` | `string` | 欢迎区标题（必填） |
| `description` | `string` | 欢迎区描述 |
| `icon` | `VNode \| Component` | 欢迎区图标 |
| `prompts` | `PromptProps[]` | 快捷提示词列表 |

#### `ui.appearance`

| 字段 | 类型 | 可选值 | 说明 |
|---|---|---|---|
| `mode` | `ChatAppearanceMode` | `'light'` / `'dark'` / `'system'` | 主题模式 |

#### 其他字段

| 字段 | 类型 | 可选值 | 说明 |
|---|---|---|---|
| `contentLayout` | `ChatContentLayout` | `'centered'` / `'wide'` | 内容区宽度模式 |
| `labels` | `ChatMessagesOverrides` | — | 文案覆盖，详见上方 [ui.labels 文案覆盖](#uilabels-文案覆盖) |


## `sender`

`sender` 负责发送区默认行为。

最常用的是：

- `placeholder`
- `mode`
- `maxLength`
- `wordCount`
- `voice`

最小示例：

```ts
sender: {
  placeholder: 'Ask TinyRobot anything',
  mode: 'multiple',
  maxLength: 200,
  wordCount: true,
}
```


#### 完整字段参考 {#sender-ref}

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `placeholder` | `string` | `'请输入您的问题'` | 输入框占位文本 |
| `mode` | `'single' \| 'multiple'` | `'single'` | 输入模式，单行或多行 |
| `maxLength` | `number` | — | 最大字符数 |
| `wordCount` | `boolean` | `false` | 是否显示字数统计 |
| `voice` | `ChatSenderActionVoiceConfig` | — | 语音输入配置 |

#### `sender.voice`

| 字段 | 类型 | 说明 |
|---|---|---|
| `enabled` | `boolean` | 是否启用语音输入 |
| `tooltip` | `string` | 按钮提示文本 |
| `tooltipPlacement` | `string` | 提示框位置 |
| `size` | `string` | 按钮尺寸 |
| `speechConfig` | `object` | 语音识别配置 |
| `autoInsert` | `boolean` | 是否自动插入识别结果 |


## `attachments`

`attachments` 负责附件上传和附件列表。

最常用的是：

- `enabled`
- `upload`
- `list`

最小示例：

```ts
attachments: {
  enabled: true,
  upload: {
    enabled: true,
    accept: '.txt,.md',
    multiple: true,
  },
  list: {
    wrap: true,
  },
}
```


#### 完整字段参考 {#attachments-ref}

| 字段 | 类型 | 说明 |
|---|---|---|
| `enabled` | `boolean` | 是否启用附件功能 |
| `upload` | `ChatAttachmentsUploadConfig` | 上传按钮配置 |
| `list` | `ChatAttachmentsListConfig` | 附件列表配置 |

#### `attachments.upload`

| 字段 | 类型 | 说明 |
|---|---|---|
| `enabled` | `boolean` | 是否启用上传按钮 |
| `accept` | `string` | 接受的文件类型（如 `'.txt,.md,.pdf'`） |
| `multiple` | `boolean` | 是否允许多文件上传 |
| `maxCount` | `number` | 最大文件数量 |
| `maxSize` | `number` | 单文件最大体积（字节） |
| `tooltip` | `string` | 按钮提示文本 |
| `tooltipPlacement` | `string` | 提示框位置 |

#### `attachments.list`

| 字段 | 类型 | 说明 |
|---|---|---|
| `variant` | `string` | 列表展示样式 |
| `wrap` | `boolean` | 是否换行显示 |
| `actions` | `object` | 附件操作配置 |
| `fileIcons` | `object` | 文件图标映射 |
| `fileMatchers` | `object` | 文件类型匹配规则 |
| `disabled` | `boolean` | 是否禁用 |


## `history`

`history` 负责历史入口是否开启，以及默认是否展开。

最小示例：

```ts
history: {
  enabled: true,
  defaultOpen: false,
}
```


#### 完整字段参考 {#history-ref}

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `enabled` | `boolean` | `true` | 是否启用历史会话功能 |
| `defaultOpen` | `boolean` | `false` | 历史面板是否默认展开 |


## `workspace`

`workspace` 负责 workspace 左右区和默认视图。

最常用的是：

- `enabled`
- `left`
- `right`
- `defaultView`

最小示例：

```ts
workspace: {
  enabled: true,
  defaultView: 'workspace',
  left: {
    enabled: true,
    defaultOpen: true,
    collapseMode: 'rail',
  },
  right: {
    enabled: true,
    defaultOpen: false,
    collapseMode: 'hidden',
  },
}
```


#### 完整字段参考 {#workspace-ref}

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `enabled` | `boolean` | `false` | 是否启用 workspace 布局 |
| `defaultView` | `'stacked' \| 'workspace'` | `'stacked'` | 默认视图模式。`stacked` 为堆叠布局，`workspace` 为左右分栏布局 |
| `left` | `ChatWorkspaceRegionConfig` | — | 左侧区域配置 |
| `right` | `ChatWorkspaceRegionConfig` | — | 右侧区域配置 |

#### `workspace.left` / `workspace.right`

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `enabled` | `boolean` | `true` | 是否启用该区域 |
| `collapsible` | `boolean` | `true` | 是否可折叠 |
| `defaultOpen` | `boolean` | 左侧 `true`，右侧 `false` | 是否默认展开 |
| `collapseMode` | `'rail' \| 'hidden'` | 左侧 `'rail'`，右侧 `'hidden'` | 折叠模式。`rail` 折叠为窄条，`hidden` 完全隐藏 |
| `width` | `number \| 'sm' \| 'md' \| 'lg'` | — | 区域宽度 |
| `railLabel` | `string` | — | rail 模式下的标签文本 |


## `messages`

`messages` 负责消息层扩展。

最常用的是：

- `actions`
- `actionMode`
- `renderers`
- `feedback`
- `transforms`

最小示例：

```ts
messages: {
  actionMode: 'append',
  feedback: {
    enabled: true,
  },
}
```


#### 完整字段参考 {#messages-ref}

| 字段 | 类型 | 说明 |
|---|---|---|
| `actions` | `ChatMessageActionDefinition[]` | 自定义消息动作按钮列表 |
| `actionMode` | `'append' \| 'replace'` | 动作模式。`append` 在默认动作后追加，`replace` 完全替换 |
| `renderers` | `ChatBubbleRenderers` | 自定义消息渲染器 |
| `feedback` | `{ enabled?: boolean }` | 消息反馈配置（复制、编辑、重新生成、用量面板） |
| `transforms` | `ChatMessageTransforms` | 消息变换钩子 |

#### `messages.feedback`

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `enabled` | `boolean` | `true` | 是否显示消息反馈区（复制、编辑、重新生成按钮） |

feedback 区域包含以下内置能力：

- **复制**：复制消息内容到剪贴板
- **编辑**（user 消息）：进入消息编辑模式
- **重新生成**（assistant 消息）：重新触发本轮回复
- **用量面板**（assistant 消息）：悬浮在 ℹ 图标上，展示本条回复的模型名称、结束原因、时间、输入 / 输出 / 总计 Token

用量面板是**自动行为**，不需要额外配置。只要后端响应的 `ChatCompletion` 对象里包含 `usage` 字段，面板就会自动出现：

```json
{
  "model": "gpt-4.1-mini",
  "choices": [{ "finish_reason": "stop", ... }],
  "usage": {
    "prompt_tokens": 128,
    "completion_tokens": 56,
    "total_tokens": 184
  }
}
```

大多数兼容 OpenAI 格式的接口默认会返回 `usage`，无需任何额外处理。

#### `messages.actions[]`

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | `string` | ✅ | 动作唯一标识 |
| `label` | `string` | ✅ | 显示文本 |
| `icon` | `string \| Component` | — | 图标 |
| `placement` | `'actions' \| 'operations'` | — | 显示位置 |
| `roles` | `('assistant' \| 'user' \| 'tool' \| 'system')[]` | — | 适用的消息角色 |
| `order` | `number` | — | 排序权重 |
| `when` | `(context) => boolean` | — | 条件显示函数 |
| `onClick` | `(context) => void \| Promise<void>` | — | 点击回调 |

#### `messages.transforms`

| 字段 | 类型 | 说明 |
|---|---|---|
| `onChunk` | `(context: ChatMessageTransformChunkContext) => void` | 流式响应每个 chunk 到达时调用 |
| `onFinish` | `(context: ChatMessageTransformFinishContext) => Partial<ChatMessage> \| void` | 响应完成后调用，可返回 patch 对象修改消息内容 |

#### `messages.renderers`

| 字段 | 类型 | 说明 |
|---|---|---|
| `contentMatches` | `BubbleContentRendererMatch[]` | 内容渲染器匹配规则 |
| `boxMatches` | `BubbleBoxRendererMatch[]` | 气泡容器渲染器匹配规则 |


## `lifecycle`

`lifecycle` 负责发送前后和错误处理的钩子。

最常用的是：

- `beforeSend`
- `afterReceive`
- `error`

最小示例：

```ts
lifecycle: {
  beforeSend: ({ text }) => ({ text: text.trim() }),
  error: (error) => {
    console.error(error)
  },
}
```


#### 完整字段参考 {#lifecycle-ref}

| 字段 | 类型 | 说明 |
|---|---|---|
| `beforeSend` | `ChatBeforeSendHandler` | 发送前拦截。接收 `{ text }` 参数，可返回修改后的 `{ text }` 或返回 `false` 取消发送 |
| `afterReceive` | `ChatAfterReceiveHandler` | 接收完成后回调。参数为 `ChatMessage`（来自 `@opentiny/tiny-robot-kit`），在 `messages.transforms` 之前执行 |
| `error` | `ChatErrorHandler` | 错误处理回调。参数为 `ChatErrorInfo \| Error` |

执行顺序：`beforeSend` → `conversation.send` → `afterReceive` → `messages.transforms`


## 什么不属于 `TrChatConfig`

下面这些不属于当前 `TrChat` 默认配置页的范围：

- `TrChat.Provider(transportAdapter)`
- `createRuntimeFromConfig`
- `Root + Page`
- `Root + primitives`
- MCP manager
- sender extensions

如果需要这些能力，请参阅下一页：

- [Chat 自定义](./chat-advanced.md)

## 下一步看哪里

- 继续使用默认接入方式：参阅 [Chat 快速开始](./chat.md)
- 自行控制页面、runtime 或 transport：参阅 [Chat 自定义](./chat-advanced.md)
