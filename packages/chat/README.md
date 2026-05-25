# @opentiny/tiny-robot-chat

`@opentiny/tiny-robot-chat` 是一个面向对话场景的布局包，负责提供 chat shell，而不负责具体消息渲染。

它当前主要解决这几类能力：

- `embedded / detached` 两种 chat surface 模式
- 左右侧栏的 `dock / drawer` 布局切换
- aside 宽度调整
- detached 模式下的拖拽与改宽
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
import { shallowRef } from 'vue'
import { Chat } from '@opentiny/tiny-robot-chat'
import type { ChatAsideConfig, ChatSurfaceMode } from '@opentiny/tiny-robot-chat'

const surfaceMode = shallowRef<ChatSurfaceMode>('embedded')
const leftAside = shallowRef<ChatAsideConfig>({
  layoutMode: 'dock',
  expanded: true,
  expandedWidth: 280,
})
</script>

<template>
  <Chat.Layout v-model:surface-mode="surfaceMode" v-model:left-aside="leftAside">
    <template #header>header</template>
    <template #main>
      <Chat.Main>main</Chat.Main>
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

- `embedded / detached` 切换是否正常
- left / right aside 的展开、收起、drawer/dock 切换是否正常
- dock aside 改宽是否正常
- detached surface 的拖拽、改宽、边界约束是否正常
- `Chat.Main` 包裹 `BubbleList` 时滚动宿主与滚动条表现是否正常
