# @opentiny/tiny-robot-chat

`@opentiny/tiny-robot-chat` 是一个面向对话场景的布局包，负责提供 chat shell，而不负责具体消息渲染。

它当前主要解决这几类能力：

- `normal / floating` 两种 chat surface 模式
- 左右侧栏的 `dock / drawer` 布局切换
- aside 宽度调整
- floating 模式下的拖拽与改宽
- 统一的 header / main / footer / aside 插槽组织

## 导出

- `Chat.Layout`
- `Chat.Main`
- `Chat.Aside`
- `Chat.AsideToggle`
- `@opentiny/tiny-robot-chat/style.css`

## 典型用法

```vue
<script setup lang="ts">
import { shallowRef, useTemplateRef } from 'vue'
import { BubbleList } from '@opentiny/tiny-robot'
import { Chat } from '@opentiny/tiny-robot-chat'
import type { ChatAsideConfig, ChatLayoutMode } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot/style.css'
import '@opentiny/tiny-robot-chat/style.css'

const mode = shallowRef<ChatLayoutMode>('normal')
const bubbleListRef = useTemplateRef<InstanceType<typeof BubbleList>>('bubbleListRef')
const leftAside = shallowRef<ChatAsideConfig>({
  layoutMode: 'dock',
  expanded: true,
  expandedWidth: 280,
})
</script>

<template>
  <Chat.Layout v-model:mode="mode" v-model:left-aside="leftAside">
    <template #header>header</template>
    <template #main>
      <Chat.Main :scroll-host="bubbleListRef">
        <BubbleList ref="bubbleListRef" :messages="[]" />
      </Chat.Main>
    </template>
    <template #left-aside>
      <Chat.Aside placement="left">aside</Chat.Aside>
    </template>
    <template #footer>footer</template>
  </Chat.Layout>
</template>
```

## 开发命令

```bash
pnpm -F @opentiny/tiny-robot-chat dev
pnpm -F @opentiny/tiny-robot-chat build
pnpm -F @opentiny/tiny-robot-chat lint
pnpm -F @opentiny/tiny-robot-chat type-check
pnpm -F @opentiny/tiny-robot-chat check
```

## 验证方案

建议按下面顺序验证：

1. `pnpm -F @opentiny/tiny-robot-chat lint`
2. `pnpm -F @opentiny/tiny-robot-chat type-check`
3. `pnpm -F @opentiny/tiny-robot-chat build`
4. `pnpm -F @opentiny/tiny-robot-chat dev`

手动验收重点：

- `normal / floating` 切换是否正常
- left / right aside 的展开、收起、drawer/dock 切换是否正常
- dock aside 改宽是否正常
- floating surface 的拖拽、改宽、边界约束是否正常
- `Chat.Main` 包裹 `BubbleList` 时滚动宿主与滚动条表现是否正常

## `Chat.Main` 约束

- `Chat.Main` 只做壳层和虚拟滚动条。
- 必须显式传入 `scrollHost`。
- `scrollHost` 必须是主区内唯一真实滚动容器，并自己负责 `overflow` 与尺寸样式。
- 如果 `scrollHost` 是 `BubbleList` 这类依赖组件样式的组件，必须先引入对应包的 `style.css`。
