# Chat Main Scroll

## 1. 范围

`Chat.Main` 现在只做两件事：

- 作为主区壳层
- 基于 `scrollHost` 渲染和同步右侧虚拟滚动条

真实滚动不再由 `Chat.Main` 自己承担，也不再隐式查找 `.tr-bubble-list`。

## 2. 对外契约

`Chat.Main` 必须显式接收 `scrollHost`：

```ts
import type { ComponentPublicInstance } from 'vue'

export type ChatMainScrollHostComponent = Pick<ComponentPublicInstance, '$el'>

export type ChatMainScrollHost = HTMLElement | ChatMainScrollHostComponent | null | undefined

export interface ChatMainProps {
  scrollHost: ChatMainScrollHost
}
```

这里允许传两类值：

- 真实 DOM 元素
- 组件 ref 对应的组件实例

组件实例会在 `ChatMain.vue` 内部通过 `unrefElement()` 解析为根 DOM。

## 3. 推荐结构

### 3.1 BubbleList

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { BubbleList } from '@opentiny/tiny-robot'
import { Chat } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot/style.css'
import '@opentiny/tiny-robot-chat/style.css'

const bubbleListRef = useTemplateRef<InstanceType<typeof BubbleList>>('bubbleListRef')
</script>

<template>
  <Chat.Main :scroll-host="bubbleListRef">
    <BubbleList ref="bubbleListRef" />
  </Chat.Main>
</template>
```

这里要注意：

- `BubbleList` 作为 `scrollHost` 时，必须同时带上 `@opentiny/tiny-robot` 的样式入口
- 否则 `BubbleList` 根节点拿不到 `overflow-y: auto`，虚拟滚动条可以渲染，但真实宿主不会滚动

### 3.2 自定义内容组件

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { Chat } from '@opentiny/tiny-robot-chat'
import MainContent from './MainContent.vue'

const mainRef = useTemplateRef<InstanceType<typeof MainContent>>('mainRef')
</script>

<template>
  <Chat.Main :scroll-host="mainRef">
    <MainContent ref="mainRef" />
  </Chat.Main>
</template>
```

## 4. scrollHost 约束

传入的 `scrollHost` 必须满足下面约束：

- 它是 `Chat.Main` 内唯一真实滚动容器
- 它自己负责 `overflow: auto` 或 `overflow-y: auto`
- 它自己负责 `width: 100%`
- 推荐同时提供 `height: 100%`、`min-height: 0`、`box-sizing: border-box`
- 如果传的是组件 ref，组件根节点本身就必须是滚动容器
- 如果宿主的滚动能力依赖外部样式文件，必须确保对应样式已经实际加载

不满足这些约束时，虚拟滚动条的高度、偏移和可滚动状态都会失真。

## 5. Chat.Main 自身职责

`Chat.Main` 本身固定为壳层：

- `height: 100%`
- `min-height: 100%`
- `overflow: hidden`

它不再负责：

- 创建默认滚动上下文
- 猜测谁是滚动宿主
- 给非目标节点回写滚动位置

## 6. 虚拟滚动条逻辑

滚动条状态全部来自真实 `scrollHost` 的：

- `scrollTop`
- `scrollHeight`
- `clientHeight`

表现规则：

- 只有内容可滚动时才渲染滚动条
- 只有 hover 或 thumb 拖拽中时才提高可见度
- thumb 最小高度固定为 `36px`
- 拖拽 thumb 时直接回写 `scrollHost.scrollTop`
- 拖拽期间会锁定 `body.cursor = 'grabbing'` 和 `body.userSelect = 'none'`

## 7. 同步机制

`useChatMainScrollbar.ts` 当前的同步来源有：

- `scroll`
- `ResizeObserver`
- `MutationObserver`
- `requestAnimationFrame`

当前实现做的事：

- 监听真实滚动位置变化
- 监听宿主尺寸变化
- 监听宿主子树内容变化
- 在 `scrollHost` 切换时清理旧宿主、标记新宿主并重算 metrics

其中 `requestAnimationFrame` 只负责合并同一帧内的重复同步，避免在高频事件里直接反复读写布局。

## 8. 样式口径

原生滚动条隐藏现在统一通过 `data-tr-chat-scroll-host` 标记完成：

```css
.tr-chat-main [data-tr-chat-scroll-host] {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tr-chat-main [data-tr-chat-scroll-host]::-webkit-scrollbar {
  display: none;
}
```

这意味着：

- `Chat.Main` 只负责隐藏被标记宿主的原生滚动条
- 具体滚动布局样式由宿主自己承担
- `BubbleList` 的宽度、撑满和气泡居中规则已经回到 `BubbleList.vue` 自身

## 9. BubbleList 口径

当前 `BubbleList` 已经补齐了作为 `scrollHost` 的基础样式：

- `width: 100%`
- `height: 100%`
- `min-height: 0`
- `overflow-y: auto`
- `overflow-x: hidden`

同时会把直接子级 `.tr-bubble` 约束到：

- `width: min(100%, var(--tr-bubble-list-content-max-width, 100%))`
- `margin-inline: auto`

所以在 `Chat.Main + BubbleList` 这个主路径里，`BubbleList` 自己就是完整的滚动宿主。

## 10. 注意点

- 不要在 `Chat.Main` 里面再套第二层真实滚动容器。
- 不要把 `scrollHost` 指向一个只包裹内容、但自己不滚动的节点。
- 如果传组件 ref，不要让组件根节点外面再多包一层非滚动壳。
- 如果 `scrollHost` 是第三方或组件库组件，先确认它的样式入口已经加载，否则根节点可能存在，但并不具备真实滚动能力。
- 如果内容高度变化只发生在宿主外部，虚拟滚动条不会替你兜底。
- `scrollHost` 为空时，`Chat.Main` 只渲染壳层，不会启用虚拟滚动条。

## 11. 验证点

- `Chat.Main` 内只有一个真实滚动容器。
- 长内容下，thumb 高度和偏移始终跟随真实滚动同步。
- 切换 `scrollHost` 后，旧宿主的原生滚动条样式标记会被清理。
- BubbleList、自定义 `Main` 组件两条路径都能正常工作。
- `floating / normal` 两种 surface 下的主区滚动行为一致。
