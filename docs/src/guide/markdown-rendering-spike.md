---
outline: deep
---

# Markdown 渲染 Spike 结论

本文档用于固化 `Stage 1`：正式实现前的底层库 Spike 结果。

它聚焦于三个问题：

1. 哪些 Vue 技术栈候选库值得继续推进
2. 它们分别适合静态渲染、流式渲染还是仅做参考
3. 进入 `M0 / M1` 前，哪些前置准备已经完成，哪些仍需补充

配套文档：

- 调研： [Markdown 渲染调研](/guide/markdown-rendering-research)
- 设计： [TrMarkdown 设计方案](/guide/markdown-rendering-design)
- 流程： [Markdown 渲染开发流程](/guide/markdown-rendering-process)
- 路线图： [Markdown 渲染 Roadmap](/guide/markdown-rendering-roadmap)

## Spike 范围

本轮 Spike 不做正式集成实现，只做底层能力验证和推进建议。

验证对象：

- `comark`
- `@comark/vue`
- `@crazydos/vue-markdown`
- `streamdown-vue`
- `vue-markdown-render`
- `markdown-it`
- `DOMPurify`
- `Shiki`
- `mermaid`
- `remark-math` / `rehype-katex` / `katex`

## Spike 结论总览

| 候选 | 适合场景 | 结论 | 建议定位 |
| --- | --- | --- | --- |
| `@comark/vue` | 静态 + 流式 + 组件映射 | 很值得继续验证 | 第一优先 Spike 候选 |
| `@crazydos/vue-markdown` | 静态 AST 渲染 | 保守可行 | 静态基座备选 |
| `streamdown-vue` | 流式 Markdown | 值得作为流式专用候选 | `M4` 候选 |
| `vue-markdown-render` | 轻量 `markdown-it` wrapper | 过薄 | 参考实现，不建议作为底座 |
| `markdown-it` | parser adapter | 仍然可靠 | `M1` 默认保守路线 |
| `Shiki` | 代码高亮 | 推荐 | `M2` 代码块底层候选 |
| `mermaid` | Mermaid block | 推荐 | `M5` 或 `M2` 扩展候选 |
| `remark-math` / `rehype-katex` / `katex` | 数学公式 | 推荐 | `M5` 公式路线 |
| `ByteMD` / `v-md-editor` | editor / viewer 产品 | 不适合 runtime 基座 | 不采用 |

## 候选库详细结论

## `comark` / `@comark/vue`

### 已验证事实

- `comark` 包描述明确为：
  - Components in Markdown parser
  - 支持 Vue / React / Svelte / HTML
  - 支持 streaming
- `@comark/vue` 是官方 Vue 运行时封装
- `comark` 本体依赖相对轻
- `shiki`、`katex`、`beautiful-mermaid` 以 **可选 peer dependency** 形式进入

### 为什么它很重要

这意味着它天然符合 TinyRobot 的两个关键要求：

1. 默认路径可以轻
2. 高级能力可以后置、按需进入

而且它同时覆盖了：

- 组件映射
- Markdown 解析
- 流式场景
- 插件扩展

### 风险

- 项目较新
- 生态成熟度、边界稳定性、Vue 集成自由度需要实际验证

### 结论

- **继续推进**
- 应作为第一优先 Spike 候选

### 推荐用途

- `M1`：静态基座候选
- `M4`：流式分支候选

## `@crazydos/vue-markdown`

### 已验证事实

- 是 Vue 组件
- 采用 unified / remark / rehype 体系
- 内建 `rehype-sanitize`

### 价值

- 非常适合对标 `LobeUI` 的 AST / component mapping 路线
- 能减少 TinyRobot 自己从 0 搭 unified 到 Vue renderer 的工作

### 风险

- 更偏基础渲染
- 流式能力没有 `Comark` 或 `streamdown-vue` 明确

### 结论

- **继续推进**
- 作为静态保守路线候选

### 推荐用途

- `M1` 静态基座备选

## `streamdown-vue`

### 已验证事实

- 明确定位为 Vue 3 / Nuxt 3 的 streaming markdown renderer
- 明确包含：
  - Shiki
  - KaTeX
  - Mermaid
  - secure streaming helpers

### 价值

- 对 `M4` 很有吸引力
- 能明显减少流式 markdown 的底层拼装工作

### 风险

- 更偏流式 renderer，不是完整平台底座
- 需要验证和 TinyRobot 样式、Bubble 场景、节点覆写的适配自由度

### 结论

- **继续推进**
- 但主要作为流式专用候选

### 推荐用途

- `M4` 候选

## `vue-markdown-render`

### 已验证事实

- 是轻量 `markdown-it` Vue wrapper
- 依赖简单

### 价值

- 能作为“最薄包装”参考

### 不足

- 太薄
- 不足以覆盖 `LobeUI` 对标能力面

### 结论

- **不作为主底座**
- 仅保留参考价值

## `markdown-it`

### 已验证事实

- TinyRobot 当前已经使用
- 生态成熟
- 插件丰富

### 价值

- 如果不想在 `M1` 冒太多风险，它仍然是最稳的 parser adapter 路线

### 结论

- **保留**
- 作为 `M1` 的保守默认路线

## `Shiki`

### 已验证事实

- 是现代代码高亮主流底层之一
- 与 `LobeUI`、`streamdown-vue` 的能力方向一致

### 风险

- 体积和运行成本不应进入默认路径

### 结论

- **采用**
- 仅作为 `M2` 代码块专项能力的候选底层

## `mermaid`

### 结论

- 不自己造轮子
- 作为 Mermaid block 的标准底层候选

## `remark-math` / `rehype-katex` / `katex`

### 结论

- 作为公式能力的主流底层组合
- 仅在 `M5` 进入，不进入 `M1` 默认路径

## 不采用项

### `ByteMD` / `@bytemd/vue-next`

- 产品边界偏 editor/viewer
- 对 TinyRobot runtime markdown 场景过重

### `v-md-editor`

- 明确是 editor
- 不适合作为运行时基座

## 当前推荐技术路线

基于本轮 Spike 结果，我建议：

### 静态路径

优先级：

1. 先做 `Comark` 技术验证
2. 若验证风险过高，则退回 `@crazydos/vue-markdown`
3. 若仍不满足控制力要求，则回到 `markdown-it` + 自建 IR/render

### 流式路径

优先级：

1. `streamdown-vue`
2. `Comark`
3. 自建 smoothing / incomplete token 方案

### 代码块

- `Shiki`
- `mermaid`
- 公式能力后续再引

## 正式实现前准备完成条件

我建议把“可以进入正式实现”定义成下面这些条件满足：

### 文档侧

- 调研文档完成
- 设计文档完成
- 流程文档完成
- roadmap 完成
- Spike 结论文档完成

### 方案侧

- 已明确静态路径候选顺序
- 已明确流式路径候选顺序
- 已明确不采用项
- 已明确默认路径不得进入的重依赖

### 实现侧

- 已确定 `TrMarkdown` 先在 `packages/components/src/markdown` 内实现
- 已确定不会先独立发 `@tiny-robot-markdown`
- 已确定 `M0 -> M1 -> M2 -> M3 -> M4 -> M5` 的顺序

### 测试/基准侧

- 已规划固定 fixture / benchmark 集
- 已为每阶段定义测试方法和预算维度

## 进入正式实现前，仍缺什么

如果严格来说，当前还差两类真正“代码级”的前置准备需要落文件：

1. `TrMarkdown` fixture 目录骨架
2. `M0 / M1` 的最小测试任务清单模板

这两项不属于正式功能实现，但属于实现前的落地准备。

## 我对当前状态的判断

如果按文档准备、选型结论、阶段流程、验收标准来看：

- **实现前的方向性准备已经基本完成**

如果按“进入代码前还要不要再补准备物”来看：

- **还建议补一版 fixture / benchmark 目录和测试清单模板**

这样进入 `M0 / M1` 会更稳。

## 下一步建议

建议在正式实现前，再完成下面两件准备物：

1. 新建 Markdown fixtures / benchmark 规划文档
2. 新建 `M0 / M1` 实施 checklist 文档

做完这两件后，就可以进入正式实现。
