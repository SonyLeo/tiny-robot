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
  <TrMarkdown :content="content" />
</template>
```

正文、标题、列表、表格和代码块使用组件库提供的排版。默认 `variant="default"` 适合通用内容；独立组件可以显式选择 `bubble` 或 `article`。Bubble 的 Markdown adapter 默认使用 `bubble`。演示页默认展示这套生产排版，关闭「production defaults」后可单独对比自定义字号、行高、标题比例和间距。

启用高级能力或完整代码块时，可以按需配置：

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

默认用 Highlight.js 着色，支持 Python（`python` / `py`）、SQL、YAML（`yaml` / `yml`）等语言。也可选用示例中的 Shiki；两个引擎的支持语言不同，未识别的语言以纯文本显示。系统要求减少动态效果时，生成中的 Markdown 继续更新，但不会逐字播放。

直接安装组件包时，项目需满足组件包声明的 Vue `^3.3.11`、`markdown-it ^14.1.0` 和 `dompurify ^3.3.1` peer 依赖，并在应用入口引入 `@opentiny/tiny-robot/dist/style.css`。普通 Markdown 的原始 HTML 默认关闭；`features.htmlPreview` 单独控制 fenced HTML 的沙箱预览。

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
- 实施阶段与验收：[/guide/markdown-rendering-roadmap](/guide/markdown-rendering-roadmap)
