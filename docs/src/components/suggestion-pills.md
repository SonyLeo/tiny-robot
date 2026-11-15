---
outline: deep
---

# SuggestionPills 建议按钮组

## 代码示例 {#代码示例}

### 使用插槽 {#使用插槽}

通过默认插槽组合 `TrSuggestionPillButton`、下拉菜单等内容。按钮可通过 `item` 传入文本和图标，也可以使用默认插槽和 `icon` 插槽自定义内容。监听 `click-outside` 可以在点击组件外部时收起菜单或按钮组。

<demo vue="../../demos/suggestion/pills-popper.vue" />

### 展开与滚动 {#展开与滚动}

上面的示例提供了各项配置的切换控件：`overflowMode="expand"` 时通过 `v-model:showAll` 控制是否展开全部按钮，`showAllButtonOn` 控制“更多”按钮在悬停时还是始终显示。设置 `overflowMode="scroll"` 时，溢出的按钮改为横向滚动展示；`autoScrollOn` 可选择在鼠标悬停或点击按钮时自动将其滚动到可见区域。

## Props {#props}

**SuggestionPillsProps** - 药丸组件属性配置

| 属性              | 类型                      | 必填 | 默认值     | 说明                                                             |
| ----------------- | ------------------------- | ---- | ---------- | ---------------------------------------------------------------- |
| [`showAll`](#展开与滚动) | `boolean`                 | 否   | -          | 是否展开全部元素 (v-model)                                       |
| [`showAllButtonOn`](#展开与滚动) | `'hover' \| 'always'`     | 否   | `'hover'`  | 显示"更多"按钮的时机                                             |
| [`overflowMode`](#展开与滚动) | `'expand' \| 'scroll'`    | 否   | `'expand'` | 控制多余项的展示方式：`expand`为展开显示，`scroll`为横向滚动显示 |
| [`autoScrollOn`](#展开与滚动) | `'mouseenter' \| 'click'` | 否   | -          | 鼠标悬停或点击时是否自动滚动到可见区域                           |

**SuggestionPillButtonProps** - 药丸按钮属性配置

| 属性   | 类型                 | 必填 | 说明       |
| ------ | -------------------- | ---- | ---------- |
| [`item`](#使用插槽) | `SuggestionPillItem` | 是   | 药丸项数据 |

## Slots {#slots}

**SuggestionPillsSlots** - 药丸组件插槽定义

| 插槽名    | 类型            | 说明           |
| --------- | --------------- | -------------- |
| [`default`](#使用插槽) | `() => VNode[]` | 自定义内容插槽 |

**SuggestionPillButtonSlots** - 药丸按钮插槽定义

| 插槽名    | 类型            | 说明           |
| --------- | --------------- | -------------- |
| [`default`](#使用插槽) | `() => unknown` | 自定义内容插槽 |
| [`icon`](#使用插槽) | `() => unknown` | 自定义图标插槽 |

## Events {#events}

| 事件名          | 参数                | 说明                   |
| --------------- | ------------------- | ---------------------- |
| [`click-outside`](#使用插槽) | `event: MouseEvent` | 点击组件外部区域时触发 |

## Types {#types}

**SuggestionPillItem** - 建议药丸项类型

```typescript
type SuggestionPillItem = { text: string; icon?: VNode | Component } | { text?: string; icon: VNode | Component }
```

表示每个药丸项必须包含：

- `text` 或 `icon` 至少一个
- 支持自定义 Vue 组件或虚拟节点作为图标
