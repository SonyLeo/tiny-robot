# ChatMain 滚动与虚拟滚动条方案

## 1. 背景

当前主区有 3 层可能参与滚动：

- `ChatLayout` 的 `.tr-chat-layout__main-shell`
- `BubbleList` 根节点 `.tr-bubble-list`
- 业务层自己再包一层滚动容器

这会带来两个直接问题：

- 主区容易出现双滚动条或多滚动宿主
- 滚动条无法稳定贴在 `main` 右边界，右侧 panel 展开时位置会错

## 2. 当前实现现状

### 2.1 Layout

- `ChatMain` 现在只是一个空壳容器
- `ChatLayout` 里的 `.tr-chat-layout__main-shell` 当前承担了主区滚动

对应文件：

- `packages/chat/src/layout/ChatMain.vue`
- `packages/chat/src/layout/ChatLayout.vue`
- `packages/chat/src/styles/layout.css`

关键现状：

- `.tr-chat-layout__main-shell { overflow-y: auto; }`
- `.tr-chat-layout__main-inner` 负责 `max-width + margin: auto + padding-inline`

### 2.2 BubbleList

`BubbleList` 当前公开契约就是“自己是滚动容器”。

对应文件：

- `packages/components/src/bubble/BubbleList.vue`
- `packages/components/src/bubble/index.type.ts`
- `docs/src/components/bubble.md`

关键现状：

- `.tr-bubble-list { overflow-y: auto; }`
- `useAutoScroll` 直接绑定 `listRef`
- `autoScroll` 文档前提明确要求 `BubbleList` 本身可滚动

这意味着不能直接粗暴关闭 `BubbleList` 自滚，否则会破坏现有组件契约。

## 3. DeepSeek 调研结论

基于页面结构和样式，DeepSeek 主区的关键不是“原生滚动条换皮”，而是把 3 个职责拆开了：

- 滚动宿主
- 滚动条 overlay
- 内容限宽层

主区核心结构可抽象为：

```html
<div class="ds-scroll-area">
  <div class="ds-scroll-area__gutters">
    <div class="ds-scroll-area__vertical-gutter">
      <div class="ds-scroll-area__vertical-bar"></div>
    </div>
  </div>

  <div class="ds-virtual-list">
    <div class="ds-virtual-list-items"></div>
  </div>
</div>
```

调研结论：

- `ds-scroll-area__gutters` 是独立的滚动条 overlay 层
- gutter 宽度跟随整个 `main` 区域，竖条固定 `right: 0`
- 正文列不是靠外层收窄，而是靠内层 `padding-left/right` 居中
- 因此滚动条永远贴在 `main` 的右边，而不是贴在正文列右边
- 右侧 panel 打开时，`main` 变窄，gutter 仍然 `right: 0`，所以滚动条自然贴到 `main` 和右侧 panel 的分界处
- 主区只有一个真实滚动宿主，不存在 `layout main` 和 `message list` 同时滚的情况

## 4. 结论

要复现 DeepSeek 这类效果，不能继续让：

- `main-shell` 滚
- `BubbleList` 也滚

必须收敛为：

- 主区只有一个真实滚动宿主
- 滚动条由独立 overlay 层绘制
- 内容宽度和滚动条定位解耦

## 5. 最终方案

最终采用：

- `ChatLayout.main-shell` 不再滚动，只保留布局壳职责
- `ChatMain` 升级为主区 `ScrollArea`
- `BubbleList` 新增外部滚动宿主模式，接入 `ChatMain`

### 5.1 ChatLayout 改造

`ChatLayout` 里的 `.tr-chat-layout__main-shell` 改为：

- 只负责 grid 区域定位
- `overflow: hidden`
- 不再负责主区滚动

`main-shell` 内不再直接承担“滚动 + 内容居中”两种职责。

### 5.2 ChatMain 改造

`ChatMain` 升级成主区 `ScrollArea`，内部拆成 3 层：

```vue
<main class="tr-chat-main">
  <div ref="viewportRef" class="tr-chat-main__viewport">
    <div class="tr-chat-main__content">
      <slot />
    </div>
  </div>

  <div class="tr-chat-main__gutters">
    <div class="tr-chat-main__vertical-gutter">
      <div class="tr-chat-main__vertical-bar" />
    </div>
  </div>
</main>
```

职责：

- `tr-chat-main`
  - 主区相对定位壳
- `tr-chat-main__viewport`
  - 主区唯一真实滚动宿主
  - `overflow-y: auto`
- `tr-chat-main__content`
  - `max-width + margin-inline: auto + padding-inline`
  - 只负责正文列居中
- `tr-chat-main__gutters`
  - 自定义虚拟滚动条 overlay
- `tr-chat-main__vertical-gutter`
  - 固定 `right: 0`
  - 永远贴主区右边界

### 5.3 BubbleList 改造

`BubbleList` 保持默认行为不变，但新增外部滚动模式：

```ts
interface BubbleListProps {
  autoScroll?: boolean
  scrollHost?: 'self' | 'external'
  scrollTarget?: MaybeRef<HTMLElement | null>
}
```

语义：

- `scrollHost = 'self'`
  - 保持当前行为
  - `BubbleList` 自己滚
- `scrollHost = 'external'`
  - `BubbleList` 不再 `overflow-y: auto`
  - `useAutoScroll` 绑定到 `scrollTarget`
  - `scrollToBottom()` 也滚动 `scrollTarget`

在 `ChatMain` 场景里使用方式：

```vue
<Chat.Main>
  <BubbleList
    :messages="messages"
    auto-scroll
    scroll-host="external"
    :scroll-target="viewportRef"
  />
</Chat.Main>
```

## 6. 为什么这是最终方案

这是当前唯一同时满足下面 4 个条件的方案：

- 不破坏 `BubbleList` 现有默认契约
- 主区只保留一个真实滚动宿主
- 滚动条始终贴 `main` 右边界
- 右侧 panel 展开时滚动条位置自动正确

如果只保留 `BubbleList` 自滚而关闭 `main-shell`：

- 简单聊天页能工作
- 但滚动条会更接近内容列，而不是稳定贴住整个 `main` 右边界
- 很难做出 DeepSeek 现在的视觉结果

如果继续保留 `main-shell` 和 `BubbleList` 双滚：

- 自动滚底逻辑会冲突
- 主区容易出现双滚动条
- 自定义滚动条定位会持续不稳定

## 7. 实施顺序

建议按这个顺序落地：

1. `BubbleList` 增加 `external scroll host` 能力
2. `ChatMain` 升级为 `ScrollArea`
3. `ChatLayout.main-shell` 退回纯布局壳
4. demo 切到 `ChatMain viewport` 作为主区唯一滚动宿主

## 8. 评审结论

评审时只需要确认这 3 点：

- 是否接受 `ChatMain = 主区 ScrollArea`
- 是否接受 `BubbleList` 增加 `external scroll host` API
- 是否接受主区“滚动宿主 / 滚动条 overlay / 内容限宽层”三层解耦
