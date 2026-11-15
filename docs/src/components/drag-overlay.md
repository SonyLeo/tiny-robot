---
outline: [1, 3]
---

# DragOverlay 拖拽浮层

一个提供拖拽上传能力的组件，通过自定义指令 `v-dropzone` 和一个纯展示的浮层组件 `<tr-drag-overlay>` 协同工作。

本功能由两部分组成：

- `v-dropzone`: 一个自定义 Vue 指令，负责监听和处理DOM元素的拖拽事件。
- `<tr-drag-overlay>`: 一个纯展示组件，根据传入的 `is-dragging` prop 显示或隐藏一个全屏的拖拽浮层。

## 代码示例 {#代码示例}

### 基本用法 {#基本用法}

将 `v-dropzone` 指令附加到任何你希望响应拖拽的元素上。同时，在页面中放置一个 `<tr-drag-overlay>` 组件，并通过一个状态变量将其 `is-dragging` prop 与指令的状态同步。

<demo vue="../../demos/drag-overlay/basic.vue" />

### 自定义拖拽层 {#自定义拖拽层}

通过 `overlay-title` 和 `overlay-description` 设置标题与多行说明，`fullscreen` 控制全屏展示样式；需要替换浮层内容时使用 `overlay` 插槽。

<demo vue="../../demos/drag-overlay/custom-overlay.vue" />

### 状态禁用 {#状态禁用}

在 `v-dropzone` 配置中设置 `disabled`，可暂停目标区域的拖拽处理。

<demo vue="../../demos/drag-overlay/disabled.vue" />

## Attributes {#attributes}

**v-dropzone** 指令传递的参数

| 名称             | 类型                                                                 | 默认值      | 说明                                   |
| ---------------- | -------------------------------------------------------------------- | ----------- | -------------------------------------- |
| [`accept`](#基本用法) | `string`                                                             | `''`        | 文件类型过滤规则（如 `'.png,.jpg'`）   |
| [`multiple`](#基本用法) | `boolean`                                                            | `true`      | 是否允许多文件拖拽                     |
| [`maxSize`](#基本用法) | `number`                                                             | `10485760`  | 最大文件大小（字节，默认 10 MB）       |
| [`maxFiles`](#基本用法) | `number`                                                             | `3`         | 最大文件数量                           |
| [`disabled`](#状态禁用) | `boolean`                                                            | `false`     | 是否禁用拖拽                           |
| [`onDrop`](#基本用法) | `(files: File[]) => void`                                            | -           | 当符合条件的文件被放下时触发的回调（必需） |
| [`onError`](#基本用法) | `(rejection: FileRejection) => void`                                 | -           | 当文件被拒绝或发生错误时触发的回调（必需） |
| [`onDraggingChange`](#基本用法) | `(dragging: boolean, element: HTMLElement \| null) => void`          | -           | 拖拽状态变化时触发的回调               |

## Props {#props}

| 属性                | 类型              | 默认值  | 说明                                     |
| ------------------- | ----------------- | ------- | ---------------------------------------- |
| [`is-dragging`](#基本用法) | `boolean`         | `false` | 是否显示拖拽浮层                         |
| [`drag-target`](#基本用法) | `Element \| null` | `null`  | 目标元素的 Element，用于定位覆盖层       |
| [`overlay-title`](#自定义拖拽层) | `string`          | `''`    | 浮层的主标题                             |
| [`overlay-description`](#自定义拖拽层) | `string[]`        | `[]`    | 浮层的描述文本，数组中的每个元素为一行   |
| [`fullscreen`](#自定义拖拽层) | `boolean`         | `false` | 是否全屏模式，控制覆盖层的边框显示       |

## Slots {#slots}

| 插槽名  | 说明             |
| ------- | ---------------- |
| [`overlay`](#自定义拖拽层) | 自定义浮层内容   |

## Types {#types}

**FileRejection**

```typeScript
export interface RejectionReason {
  code: DragZoneErrorCode
  message: string
}

export interface FileRejection extends RejectionReason {
  files: File[]
}
```

## CSS 变量 {#css-变量}

DragOverlay 组件支持以下 CSS 变量来自定义样式：

**全局变量 (`:root`)**

| 变量名                                              | 说明                 |
| --------------------------------------------------- | -------------------- |
| [`--tr-drag-overlay-bg-color`](#css-变量) | 背景颜色             |
| [`--tr-drag-overlay-border-color`](#css-变量) | 边框颜色             |
| [`--tr-drag-overlay-title-color`](#css-变量) | 标题文字颜色         |
| [`--tr-drag-overlay-title-font-weight`](#css-变量) | 标题字体粗细         |
| [`--tr-drag-overlay-description-color`](#css-变量) | 描述文字颜色         |
| [`--tr-drag-overlay-description-font-weight`](#css-变量) | 描述字体粗细         |
| [`--tr-drag-overlay-content-padding`](#css-变量) | 内容区域内边距       |
| [`--tr-drag-overlay-content-border-width`](#css-变量) | 内容边框宽度         |
| [`--tr-drag-overlay-content-border-radius`](#css-变量) | 内容边框圆角         |
| [`--tr-drag-overlay-icon-font-size`](#css-变量) | 图标字体大小         |
| [`--tr-drag-overlay-icon-margin`](#css-变量) | 图标外边距           |
| [`--tr-drag-overlay-text-gap`](#css-变量) | 文本区域间距         |
| [`--tr-drag-overlay-title-font-size`](#css-变量) | 标题字体大小         |
| [`--tr-drag-overlay-title-line-height`](#css-变量) | 标题行高             |
| [`--tr-drag-overlay-description-font-size`](#css-变量) | 描述字体大小         |
| [`--tr-drag-overlay-description-line-height`](#css-变量) | 描述行高             |

**全屏模式变量**

| 变量名                                                  | 说明                     |
| ------------------------------------------------------- | ------------------------ |
| [`--tr-drag-overlay-content-padding-fullscreen`](#css-变量) | 全屏模式内容区域内边距   |
| [`--tr-drag-overlay-content-border-width-fullscreen`](#css-变量) | 全屏模式内容边框宽度     |

**变量覆盖示例**

基础样式自定义

```css
:root {
  --tr-drag-overlay-bg-color: rgba(0, 0, 0, 0.1);
  --tr-drag-overlay-title-color: #333;
  --tr-drag-overlay-content-padding: 60px;
}
```

全屏模式自定义

```css
:root {
  --tr-drag-overlay-content-padding-fullscreen: 80px 200px;
  --tr-drag-overlay-content-border-width-fullscreen: 2px;
}
```
