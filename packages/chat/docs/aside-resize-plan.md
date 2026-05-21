# Aside 拖拽宽度方案

## 1. 目标

为 `Chat.Layout` 的左右 `aside` 增加桌面端拖拽改宽能力：

- 鼠标移到 `aside` 与 `main` 边界时显示双向拖拽光标
- 按住边界拖拽时实时修改 `expandedWidth`
- 通过最小/最大宽度限制拖拽边界
- 保持现有 `leftAside / rightAside` 受控模型不变

## 2. 当前结构结论

当前宽度状态和更新入口都在 layout 壳层：

- 类型定义：`packages/chat/src/types/layout.ts`
- 状态收口：`packages/chat/src/layout/ChatLayout.vue`
- 运行时 store：`packages/chat/src/composables/createChatLayoutStore.ts`
- 壳层样式：`packages/chat/src/styles/layout.css`

`Chat.Aside` 当前只负责内容壳，不拥有宽度状态，也不负责边界布局。

结论：

- 不建议给 `ChatAsideProps` 增加 `allowResize`
- 拖拽能力应放在 `ChatLayout` 的 `leftAside / rightAside` 配置内
- 拖拽 handle 应渲染在 `ChatLayout` 壳层，而不是 `Chat.Aside` 内部

## 3. API 方案

建议直接扩展 `ChatAsideConfig`：

```ts
type ChatAsidePlacement = 'left' | 'right'
type ChatAsideLayoutMode = 'dock' | 'drawer'

interface ChatAsideConfig {
  layoutMode?: ChatAsideLayoutMode
  expanded?: boolean
  expandedWidth?: number | string
  collapsedWidth?: number | string

  resizable?: boolean
  expandedMinWidth?: number | string
  expandedMaxWidth?: number | string
}

interface ChatLayoutProps {
  leftAside?: ChatAsideConfig
  rightAside?: ChatAsideConfig
}
```

命名结论：

- `resizable` 优先于 `allowResize`
- `expandedMinWidth / expandedMaxWidth` 保持和 `expandedWidth` 同层
- 不新增 `ChatLayoutProps` 顶层全局边界配置

原因：

- 左右 `aside` 宽度天然是两套独立配置
- 现有宽度模型已经是 side-scoped
- 这样最符合当前 API 结构

## 4. 交互规则

仅在以下条件下允许拖拽：

- `layoutMode === 'dock'`
- `expanded === true`
- `resizable === true`

不支持拖拽的场景：

- `drawer`
- `dock + rail`
- `dock + hidden`

拖拽时只修改：

- `expandedWidth`

不联动修改：

- `collapsedWidth`
- `layoutMode`
- `expanded`

边界规则：

- 左侧 `aside`：`nextWidth = startWidth + deltaX`
- 右侧 `aside`：`nextWidth = startWidth - deltaX`
- 最终宽度先经过 `min/max` clamp，再回写

## 5. 事件与数据流

v1 建议继续复用现有受控事件：

- `update:leftAside`
- `update:rightAside`

即拖拽过程中直接通过更新：

- `leftAside.expandedWidth`
- `rightAside.expandedWidth`

来驱动 UI。

结论：

- v1 不单独新增公共 `resize` 事件
- 先保持“props down / update up”的现有风格
- 如果后续确实有埋点或持久化需求，再补 `resize-end` 一类事件

## 6. 实现位置

### 6.1 类型层

文件：

- `packages/chat/src/types/layout.ts`
- `packages/chat/src/types/layout.internal.ts`

建议新增：

- `resizable`
- `expandedMinWidth`
- `expandedMaxWidth`
- `setExpandedWidth()` 这类运行时 API

### 6.2 store 层

文件：

- `packages/chat/src/composables/createChatLayoutStore.ts`

建议在 panel controller 上增加：

```ts
setExpandedWidth: (nextWidth: number) => void
resizable: boolean
expandedMinWidth: string
expandedMaxWidth: string
```

内部处理：

- 统一把 `number | string` 转成可计算的 px 值
- 拖拽运行时按 px 计算
- 回写时直接写 `number`

## 7. 壳层实现

文件：

- `packages/chat/src/layout/ChatLayout.vue`
- `packages/chat/src/styles/layout.css`

建议在左右 `aside` 壳层边界各加一个 handle：

```vue
<div class="tr-chat-layout__aside tr-chat-layout__aside--left">
  <slot name="left-aside" />
  <div class="tr-chat-layout__resize-handle tr-chat-layout__resize-handle--left" />
</div>

<div class="tr-chat-layout__aside tr-chat-layout__aside--right">
  <div class="tr-chat-layout__resize-handle tr-chat-layout__resize-handle--right" />
  <slot name="right-aside" />
</div>
```

建议样式职责：

- 可视分隔线：`1px`
- 命中区：`8px` 到 `12px`
- hover / dragging：`cursor: col-resize`
- 拖拽期间 layout 根节点挂 `tr-chat-layout--resizing`
- 拖拽期间关闭 grid width transition，避免抖动

## 8. 拖拽实现细节

推荐使用 Pointer Events：

- `pointerdown`
- `pointermove`
- `pointerup`
- `pointercancel`

关键状态：

- `startX`
- `startWidth`
- `placement`

推荐流程：

1. `pointerdown` 记录起始坐标和起始宽度
2. 调用 `setPointerCapture(pointerId)`
3. `pointermove` 实时计算 `nextWidth`
4. `nextWidth` 经过 `min/max` clamp
5. 调用 `setExpandedWidth(nextWidth)`
6. `pointerup/pointercancel` 清理拖拽状态

拖拽期间建议同时处理：

- `document.body` 增加 `cursor: col-resize`
- `document.body` 临时禁用文本选择
- handle 增加 `touch-action: none`

## 9. 为什么不用 CSS `resize`

不采用原生 `resize`：

- 它是元素自身原生缩放手柄，不适合 `aside/main` 分隔条场景
- 交互位置不可控
- 很难做左右侧统一边界拖拽体验
- 很难和当前 grid 布局宽度变量契合

结论：

- 这里应使用自定义 splitter，而不是 CSS `resize`

## 10. 可访问性

业界标准 splitter 通常会补：

- `role="separator"`
- `aria-orientation`
- `aria-valuenow / aria-valuemin / aria-valuemax`
- 键盘方向键调整宽度

但当前阶段一文档已明确：

- 不提供 `a11y`

所以 v1 结论：

- 先做 pointer 版拖拽
- DOM 结构预留后续升级空间
- 键盘与 ARIA 语义作为后续增强项

## 11. 最终结论

最终采用：

- `resizable` 放进 `ChatAsideConfig`
- `expandedMinWidth / expandedMaxWidth` 放进 `ChatAsideConfig`
- 拖拽实现放在 `ChatLayout`
- handle 渲染在 `aside` 壳层边界
- 只支持 `dock + expanded`
- 只修改 `expandedWidth`
- 继续复用 `update:leftAside / update:rightAside`
- 底层实现使用 Pointer Events + `setPointerCapture()`

## 12. 评审只需确认 5 点

- 是否接受 `resizable` 放在 `ChatAsideConfig`，而不是 `ChatAsideProps`
- 是否接受 `expandedMinWidth / expandedMaxWidth` 也放在 `ChatAsideConfig`
- 是否接受 v1 只支持 `dock + expanded`
- 是否接受 v1 只复用 `update:leftAside / update:rightAside`
- 是否接受 v1 暂不补键盘与 ARIA splitter 语义

## 13. 参考

- WAI APG Window Splitter Pattern
  - https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/
- MDN `setPointerCapture()`
  - https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture
- MDN `cursor`
  - https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
- MDN `resize`
  - https://developer.mozilla.org/en-US/docs/Web/CSS/resize
- MDN `touch-action`
  - https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action
- Ark UI Splitter
  - https://ark-ui.com/docs/components/splitter
