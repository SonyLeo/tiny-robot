---
outline: [1, 3]
---

# Markdown 组件

`TrMarkdown` 是 TinyRobot 的第一方 Markdown 渲染基座。

它同时服务两条路径：

- 独立组件直接渲染
- `BubbleRenderers.Markdown` 作为 Bubble 的 markdown adapter

当前公开能力已经覆盖：

- 常规 markdown 结构
- raw HTML 显式开关
- code block / snippet / custom actions
- HTML Preview / Mermaid / Math / Footnotes / Alerts
- image gallery
- animated streaming
- `components` / `componentProps` / `renderOptions`

## 使用方式

```vue
<template>
  <TrMarkdown
    :content="content"
    :features="{
      htmlPreview: { enabled: true },
      mermaid: { enabled: true },
      math: { enabled: true },
    }"
    :code="{
      blockMode: 'full',
      highlight: { engine: 'shiki' },
    }"
  />
</template>
```

## Bubble 集成

Bubble 集成不需要修改 Bubble 源码，推荐通过 `BubbleRenderers.Markdown` 接入。

如果要统一给 Bubble 内的 markdown 注入私有配置，优先通过 `content-attributes` 传递 `markdown` 命名空间配置：

```ts
const contentAttributes = () => ({
  markdown: {
    code: { copyable: false },
    link: { target: '_self', rel: 'nofollow' },
    features: { htmlPreview: { enabled: true } },
  },
  style: {
    '--tr-markdown-font-size': '15px',
  },
})
```

旧的直传 markdown props 仍兼容，但后续应逐步迁移到 `markdown: { ... }`。

## 设计与进度

- 设计说明：[/guide/markdown-rendering-design](/guide/markdown-rendering-design)
- 路线与状态：[/guide/markdown-rendering-roadmap](/guide/markdown-rendering-roadmap)
- 历史调研与迁移记录：[/guide/archive/markdown/](/guide/archive/markdown/)
