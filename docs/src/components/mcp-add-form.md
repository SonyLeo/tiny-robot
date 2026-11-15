---
outline: [1, 3]
---

# McpAddForm 插件添加表单

McpAddForm 是一个用于添加插件的表单组件，支持表单添加和代码添加两种方式。

## 代码示例 {#代码示例}

### 基础用法 {#基础用法}

<demo vue="../../demos/mcp-add-form/basic.vue" />

## Props {#props}

| 属性     | 类型             | 默认值 | 说明         |
| -------- | ---------------- | ------ | ------------ |
| [`addType`](#基础用法)  | `AddType`        | `form` | 当前添加方式 |
| [`formData`](#基础用法) | `McpAddFormData` | -      | 表单数据     |
| [`codeData`](#基础用法) | `string`         | -      | 代码数据     |

## Events {#events}

| 事件名           | 说明               | 回调参数                                         |
| ---------------- | ------------------ | ------------------------------------------------ |
| [`update:addType`](#基础用法) | 添加方式变化时触发 | `(value: AddType)`                               |
| [`confirm`](#基础用法) | 确认添加时触发     | `(type: AddType, data: McpAddFormData \| string)` |
| [`cancel`](#基础用法) | 取消添加时触发     | -                                                |

## Types {#types}

**AddType**

```typescript
type AddType = 'form' | 'code'
```

**McpAddFormData**

```typescript
interface McpAddFormData {
  name: string
  description: string
  type: 'sse' | 'streamableHttp'
  url: string
  headers: string
  thumbnail?: File | null
}
```

## CSS 变量 {#css-变量}

McpAddForm 组件支持以下 CSS 变量来自定义样式：

**全局变量 (`:root`)**

| 变量名                                             | 说明                   |
| -------------------------------------------------- | ---------------------- |
| [`--tr-mcp-add-form-box-shadow`](#css-变量) | 容器阴影               |
| [`--tr-mcp-add-form-content-padding`](#css-变量) | 内容区域内边距         |
| [`--tr-mcp-add-form-add-type-gap`](#css-变量) | 添加类型区域间距       |
| [`--tr-mcp-add-form-add-type-margin-bottom`](#css-变量) | 添加类型区域下边距     |
| [`--tr-mcp-add-form-add-type-label-font-size`](#css-变量) | 标签字体大小           |
| [`--tr-mcp-add-form-add-type-label-font-weight`](#css-变量) | 标签字体粗细           |
| [`--tr-mcp-add-form-add-type-label-line-height`](#css-变量) | 标签行高               |
| [`--tr-mcp-add-form-add-type-label-color`](#css-变量) | 标签文字颜色           |
| [`--tr-mcp-add-form-footer-padding`](#css-变量) | 底部区域内边距         |
| [`--tr-mcp-add-form-footer-gap`](#css-变量) | 底部按钮间距           |
| [`--tr-mcp-add-form-button-border-radius`](#css-变量) | 按钮圆角               |
| [`--tr-mcp-add-form-button-padding`](#css-变量) | 按钮内边距             |
| [`--tr-mcp-add-form-button-font-size`](#css-变量) | 按钮字体大小           |
| [`--tr-mcp-add-form-button-height`](#css-变量) | 按钮高度               |
| [`--tr-mcp-add-form-button-line-height`](#css-变量) | 按钮行高               |
| [`--tr-mcp-add-form-button-min-width`](#css-变量) | 按钮最小宽度           |
| [`--tr-mcp-add-form-button-transition`](#css-变量) | 按钮过渡效果           |
| [`--tr-mcp-add-form-cancel-bg-color`](#css-变量) | 取消按钮背景色         |
| [`--tr-mcp-add-form-cancel-border-color`](#css-变量) | 取消按钮边框色         |
| [`--tr-mcp-add-form-cancel-text-color`](#css-变量) | 取消按钮文字颜色       |
| [`--tr-mcp-add-form-cancel-hover-border-color`](#css-变量) | 取消按钮悬停边框色     |
| [`--tr-mcp-add-form-confirm-bg-color`](#css-变量) | 确认按钮背景色         |
| [`--tr-mcp-add-form-confirm-border-color`](#css-变量) | 确认按钮边框色         |
| [`--tr-mcp-add-form-confirm-text-color`](#css-变量) | 确认按钮文字颜色       |
| [`--tr-mcp-add-form-confirm-hover-bg-color`](#css-变量) | 确认按钮悬停背景色     |
| [`--tr-mcp-add-form-confirm-hover-border-color`](#css-变量) | 确认按钮悬停边框色     |

**响应式变量**

| 变量名                                             | 说明                       |
| -------------------------------------------------- | -------------------------- |
| [`--tr-mcp-add-form-add-type-gap-mobile`](#css-变量) | 移动端添加类型区域间距     |

**变量覆盖示例**

默认模式

```css
:root {
  --tr-mcp-add-form-max-width: 600px;
}
```

自定义按钮颜色

```css
:root {
  --tr-mcp-add-form-confirm-bg-color: #1890ff;
  --tr-mcp-add-form-confirm-border-color: #1890ff;
  --tr-mcp-add-form-confirm-hover-bg-color: #40a9ff;
}
```
