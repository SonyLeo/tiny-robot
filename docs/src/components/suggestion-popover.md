---
outline: deep
---

# SuggestionPopover 建议弹出框

## 代码示例 {#代码示例}

### 基本示例 {#基本示例}

使用 `data` 传入建议数据，通过 `item-click` 接收选中项。`topOffset` 控制弹出框与触发器的间距。

<demo vue="../../demos/suggestion/popover-basic.vue" />

### 触发方式 {#触发方式}

使用 `trigger` 决定弹出框的触发方式。目前有 `click` 和 `manual` 两种方式，默认为 `click`。`trigger` 为 `manual` 时，通过 `show` 手动控制弹出框显示状态。可使用 `trigger` 插槽自定义触发器，并监听 `open`、`close` 和 `click-outside` 处理弹窗交互。

<demo vue="../../demos/suggestion/popover-trigger.vue" />

### 分组数据 {#分组数据}

`data` 数组中的项，添加 `group` 字段来表示为分组数据。分组数据和普通数据不能混合

<demo vue="../../demos/suggestion/popover-grouped.vue" />

### 自定义渲染列表项 {#自定义渲染列表项}

使用 `item` 插槽自定义渲染列表项

<demo vue="../../demos/suggestion/popover-custom-item.vue" />

### 加载中和空数据 {#加载中和空数据}

<demo vue="../../demos/suggestion/popover-other-status.vue" />

### 其他插槽 {#其他插槽}

通过 `title` 和 `icon` 设置默认头部的标题与图标；另外还提供了 `header` 和 `body` 插槽，方便开发者替换整个头部或列表区域。

<demo vue="../../demos/suggestion/popover-slots.vue" />

### 移动端适配 {#移动端适配}

> 目前移动端判断逻辑是，视窗宽度小于 768px

将窗口宽度缩小到 768px，可以点击查看上面的示例

## Props {#props}

| 属性                   | 类型                  | 必填 | 默认值    | 说明                                                 |
| ---------------------- | --------------------- | ---- | --------- | ---------------------------------------------------- |
| [`data`](#分组数据) | `SuggestionData`      | 是   | -         | 建议数据                                             |
| [`title`](#其他插槽) | `string`              | 否   | -         | 弹出框标题                                           |
| [`icon`](#其他插槽) | `VNode \| Component`  | 否   | -         | 标题图标                                             |
| [`show`](#触发方式) | `boolean`             | 否   | -         | 控制弹出框显示/隐藏，仅在 trigger 为 'manual' 时有效 |
| [`trigger`](#触发方式) | `'click' \| 'manual'` | 否   | `'click'` | 触发方式：点击或手动控制                             |
| [`selectedGroup`](#分组数据) | `string`              | 否   | -         | 当前选中分组 (v-model)                               |
| [`groupShowMoreTrigger`](#分组数据) | `'click' \| 'hover'`  | 否   | -         | 分组"显示更多"的触发方式                             |
| [`loading`](#加载中和空数据) | `boolean`             | 否   | `false`   | 是否显示加载状态                                     |
| [`topOffset`](#基本示例) | `number`              | 否   | -         | 顶部偏移量                                           |

## Slots {#slots}

弹出框插槽结构示意图：

```txt
+---------------------------+         +-----------+
|     SuggestionPopover     |  <----  |  trigger  |
|  +---------------------+  |         +-----------+
|  |       header        |  |
|  +---------------------+  |
|  |                     |  |
|  |        body         |  |
|  |   +-------------+   |  |
|  |   |   item[]    |   |  |
|  |   +-------------+   |  |
|  |                     |  |
|  |  loading / empty    |  |
|  +---------------------+  |
+---------------------------+
```

| 插槽名    | 类型                                                       | 说明               |
| --------- | ---------------------------------------------------------- | ------------------ |
| [`trigger`](#触发方式) | `() => VNode \| VNode[]`                                   | 自定义触发器       |
| [`item`](#自定义渲染列表项) | `({ item }: { item: SuggestionItem }) => VNode \| VNode[]` | 自定义渲染列表项   |
| [`loading`](#加载中和空数据) | `() => VNode \| VNode[]`                                   | 自定义加载状态显示 |
| [`empty`](#加载中和空数据) | `() => VNode \| VNode[]`                                   | 自定义空状态显示   |
| [`header`](#其他插槽) | `() => VNode \| VNode[]`                                   | 自定义头部区域     |
| [`body`](#其他插槽) | `() => VNode \| VNode[]`                                   | 自定义列表区域     |

## Events {#events}

| 事件名          | 参数                     | 说明                   |
| --------------- | ------------------------ | ---------------------- |
| [`item-click`](#基本示例) | `item: SuggestionItem`   | 点击建议项时触发       |
| [`group-click`](#分组数据) | `group: SuggestionGroup` | 点击分组时触发         |
| [`open`](#触发方式) | -                        | 弹窗打开时触发         |
| [`close`](#触发方式) | -                        | 弹窗关闭时触发         |
| [`click-outside`](#触发方式) | `event: MouseEvent`      | 点击弹窗外部区域时触发 |

## Types {#types}

**SuggestionItem** - 建议项数据结构

| 属性   | 类型     | 说明       |
| ------ | -------- | ---------- |
| `id`   | `string` | 项唯一标识 |
| `text` | `string` | 显示文本   |

**SuggestionGroup** - 建议分组数据结构

| 属性    | 类型                 | 说明           |
| ------- | -------------------- | -------------- |
| `group` | `string`             | 分组标识       |
| `label` | `string`             | 分组显示名称   |
| `icon`  | `VNode \| Component` | 分组图标       |
| `items` | `SuggestionItem[]`   | 分组下的建议项 |

**SuggestionData** - 建议数据联合类型

```typescript
type SuggestionData = (SuggestionItem | SuggestionGroup)[]
```

表示数据可以是：

- 平铺的建议项数组 `SuggestionItem[]`
- 分组的建议项数组 `SuggestionGroup[]`
