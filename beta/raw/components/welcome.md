---
outline: deep
title: Welcome
kind: component
description: 用于展示欢迎信息，支持标题、描述、图标、对齐方式和底部内容。
status: stable
package: '@opentiny/tiny-robot'
exports: [TrWelcome]
keywords: [欢迎页, 标题, 插槽]
---

# Welcome

Welcome 是一个用于展示欢迎信息的通用组件，包含标题、描述、图标等内容。
组件支持自定义对齐方向、图标、底部内容等功能。

## 代码示例

### 基本

基础用法


> **示例**
>
> - [basic.vue](<https://sonyleo.github.io/tiny-robot/beta/demos/welcome/basic.vue>)



### 对齐方向

通过 `align` 属性设置对齐方向


> **示例**
>
> - [align.vue](<https://sonyleo.github.io/tiny-robot/beta/demos/welcome/align.vue>)



### 底部内容

使用 `footer` 插槽，给 Welcome 底部添加内容


> **示例**
>
> - [footer.vue](<https://sonyleo.github.io/tiny-robot/beta/demos/welcome/footer.vue>)



## Props

| 属性          | 类型                            | 必填 | 默认值     | 说明                                |
| ------------- | ------------------------------- | ---- | ---------- | ----------------------------------- |
| `title`       | `string`                        | 是   | -          | 标题                                |
| `description` | `string`                        | 是   | -          | 标题描述                            |
| `align`       | `'left' \| 'center' \| 'right'` | 否   | `'center'` | 内容对齐方式                        |
| `icon`        | `VNode`                         | 否   | -          | 自定义图标节点，支持 Vue 组件或 JSX |

## Slots

| 插槽名   | 说明             |
| -------- | ---------------- |
| `footer` | 组件底部内容插槽 |
