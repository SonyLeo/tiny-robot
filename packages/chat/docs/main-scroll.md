# Chat Main Scroll

## 1. 范围

`Chat.Main` 当前采用“双模式”滚动口径：

- 默认模式：`Chat.Main` 自己滚动
- BubbleList 模式：`BubbleList` 成为唯一真实滚动宿主

## 2. 结构约定

推荐结构：

```vue
<Chat.Main>
  <BubbleList />
</Chat.Main>
```

运行时检测到 `.tr-bubble-list` 后：

- `Chat.Main` 切换为裁剪层
- `.tr-bubble-list` 铺满主区并承担真实滚动
- 每条 `.tr-bubble` 在主区内按内容最大宽度居中

如果没有 `.tr-bubble-list`：

- `Chat.Main` 继续作为普通滚动容器
- 不启用内部虚拟滚动条

## 3. 滚动条逻辑

内部滚动条只服务 `BubbleList` 模式。

同步来源：

- `scrollTop`
- `scrollHeight`
- `clientHeight`

表现规则：

- 仅在内容可滚动时显示滚动条轨道
- 仅在 hover 或拖拽 thumb 时提高可见度
- thumb 最小高度是 `36px`
- 原生滚动条会被隐藏

拖拽规则：

- 拖拽 thumb 时回写 `BubbleList.scrollTop`
- 拖拽期间会锁定 `body.cursor = 'grabbing'` 和 `body.userSelect = 'none'`

## 4. 同步机制

滚动条同步由 `useChatMainScrollbar.ts` 负责，依赖：

- `scroll` 事件
- `ResizeObserver`
- `MutationObserver`
- `requestAnimationFrame`

作用：

- 侦测 `.tr-bubble-list` 是否挂载
- 侦测内容高度变化
- 侦测容器尺寸变化
- 把 thumb 高度和偏移映射到当前真实滚动位置

## 5. 样式口径

`Chat.Main` 自身：

- `height: 100%`
- `min-height: 100%`
- 默认 `overflow-y: auto`

BubbleList 模式下：

- `Chat.Main` 变为 `overflow: hidden`
- `.tr-bubble-list` 使用 `height: 100%`
- `.tr-bubble-list` 使用 `overflow-y: auto`

相关变量：

- `--tr-bubble-list-padding`
- `--tr-bubble-list-content-max-width`
- `--tr-chat-layout-main-padding-inline`
- `--tr-chat-layout-main-max-width`
- `--tr-chat-layout-inner-padding-block`

## 6. 验证点

- `BubbleList` 存在时，主区只有一个真实滚动宿主。
- 长内容场景下，自定义 thumb 高度和位置能跟随真实滚动同步。
- 没有 `BubbleList` 时，`Chat.Main` 仍然可以正常回退为普通滚动容器。
