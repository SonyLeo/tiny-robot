---
outline: deep
---

# Chat Slots 与渲染定制

`TrChat` 的黑盒默认渲染器已经内建了一组稳定的 slots。

这意味着很多“只改局部，不改整套页面结构”的需求，并不需要直接改成白盒组合。优先考虑 slot，通常成本更低。

## 默认 slot 适合解决什么问题

适合：

- 给默认 header / footer 补一个按钮
- 替换欢迎区或空状态
- 替换默认消息区渲染
- 给气泡组补充前后缀、尾部信息或内容底部扩展

不适合：

- 完全重组页面结构
- 自己控制上下文层和默认 slices

这类需求更适合：

- [Chat Scaffold 与 Root](./chat-scaffold.md)

## 黑盒默认支持的 slot

### 页面级 slot

| slot | 位置 | 说明 |
| :-- | :-- | :-- |
| `header` | 顶部区域 | 完整替换默认 header |
| `header-extra` | 默认 header 内部 | 向默认 header 的右侧扩展按钮或工具 |
| `message-list` | 中间内容区 | 完整替换默认 welcome / messageList 区域 |
| `welcome` | 欢迎态 | 替换默认 welcome 区域 |
| `empty` | 欢迎态兜底 | 当没有 `welcome` 且没有默认 welcome slice 时渲染 |
| `sender` | 底部输入区 | 完整替换默认 sender 区域 |
| `footer-extra` | 默认 footer 内部 | 向默认 footer 顶部插入额外内容 |

### `message-list` slot

`message-list` slot 会收到：

| 字段 | 说明 |
| :-- | :-- |
| `messages` | 当前消息列表 |

需要注意：

- 只要你提供了 `message-list` slot，默认 welcome / messageList 渲染链就不会再参与
- 这意味着欢迎态切换也需要你自己处理

示例：

```vue
<TrChat :config="chatConfig">
  <template #message-list="{ messages }">
    <div class="custom-message-region">
      当前消息数：{{ messages.value.length }}
    </div>
  </template>
</TrChat>
```

### `sender` slot

`sender` slot 会收到：

| 字段 | 说明 |
| :-- | :-- |
| `send` | 发送消息的方法 |
| `abort` | 中止当前请求的方法 |
| `status` | 当前请求状态 |
| `last-error` | 最近一次错误 |
| `retry` | 重试方法 |

这意味着你可以保留黑盒运行时，但完全接管底部输入 UI。

示例：

```vue
<TrChat :config="chatConfig">
  <template #sender="{ send, status }">
    <div class="custom-sender">
      <span>当前状态：{{ status.value }}</span>
      <button @click="send('你好')">发送</button>
    </div>
  </template>
</TrChat>
```

### `header-extra` 与 `footer-extra`

这是最推荐优先使用的两个扩展点：

- `header-extra` 适合放快捷入口、模型切换按钮、MCP 面板开关
- `footer-extra` 适合放说明文案、工具条、状态条

示例：

```vue
<TrChat :config="chatConfig">
  <template #header-extra>
    <button>打开 MCP</button>
  </template>

  <template #footer-extra>
    <div class="chat-footer-tip">内容由服务端代理转发</div>
  </template>
</TrChat>
```

## Bubble slots

默认 message list 还会把一组 bubble slots 透传到底层 `BubbleList`。

当前稳定支持：

- `prefix`
- `suffix`
- `after`
- `content-footer`

这几个 slot 适合：

- `prefix`：在气泡组前补额外标识
- `suffix`：在气泡组后补额外标识
- `after`：在气泡内容外部追加扩展 UI
- `content-footer`：在气泡内容底部追加扩展 UI

## Bubble slot props

这些 slot 来自底层消息分组语义，常见会收到：

| 字段 | 说明 |
| :-- | :-- |
| `messages` | 当前分组内的消息集合 |
| `role` | 当前分组角色 |
| `messageIndexes` | 当前分组对应的原始消息索引 |

`content-footer` 场景下，如果你需要更细的内容定位，通常还会结合底层内容索引语义一起使用。

示例：

```vue
<TrChat :config="chatConfig">
  <template #after="{ role, messageIndexes }">
    <div v-if="role === 'assistant'" class="bubble-extra">
      当前分组索引：{{ messageIndexes.join(', ') }}
    </div>
  </template>

  <template #content-footer="{ role }">
    <div v-if="role === 'assistant'" class="bubble-footer">
      由自定义 footer slot 渲染
    </div>
  </template>
</TrChat>
```

## 什么时候该改 slot，什么时候该改白盒

优先使用 slot：

- 只想改 header / footer 局部区域
- 只想改 welcome 或 empty 状态
- 只想在消息组周围补充小块 UI
- 仍然接受默认页面结构

改用 `TrChat.Scaffold` 或 `TrChat.Root`：

- 要重排页面结构
- 要把 welcome / list / footer 的组合逻辑完全改掉
- 要自己决定叶子组件装配链

## 一个推荐的定制顺序

建议按这个顺序演进：

1. 先试 `header-extra` / `footer-extra`
2. 再试 `welcome` / `empty`
3. 再试 bubble slots
4. 如果还不够，再改 `message-list` 或 `sender`
5. 仍然不够时，再进入 `Scaffold`

这样可以尽量保留默认场景的稳定性。

## 相关页面

- [Chat](./chat.md)
- [Chat Scaffold 与 Root](./chat-scaffold.md)
- [Chat Features](./chat-features.md)
