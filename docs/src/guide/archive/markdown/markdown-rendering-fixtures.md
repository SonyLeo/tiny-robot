---
outline: deep
---

# Markdown Fixtures 与 Benchmark 规划

本文档用于定义 `TrMarkdown` 在正式实现前就应固定下来的 fixtures、场景样例和 benchmark 规划。

它的目标是：

- 统一后续回归样本
- 避免每个阶段都临时挑测试内容
- 让功能、体积和渲染性能有稳定对照物

配套文档：

- 设计： [TrMarkdown 设计方案](/guide/markdown-rendering-design)
- 流程： [Markdown 渲染开发流程](/guide/archive/markdown/markdown-rendering-process)
- 路线图： [Markdown 渲染 Roadmap](/guide/markdown-rendering-roadmap)
- Spike： [Markdown 渲染 Spike 结论](/guide/archive/markdown/markdown-rendering-spike)

> 维护说明（2026-06-08）
>
> 这份文档当前只保留 fixture / benchmark 规划参考。
> 活跃中的 demo、fixture 与测试 reality 以 `packages/components/src/markdown/fixtures`、`packages/test/src/markdown` 以及 roadmap 中的最新说明为准。

## 规划目标

`TrMarkdown` 的 fixtures 不只是为了测试“能不能渲染”，还要覆盖：

- 基础语法
- 复杂结构
- 长文档
- 代码块热点
- Bubble 场景
- 流式场景

## 建议落点

正式实现时，建议在仓库中建立以下结构：

```text
packages/components/src/markdown/
  fixtures/
    basic.md
    long-article.md
    code-heavy.md
    table-heavy.md
    bubble-chat.md
    streaming-basic.md
    streaming-code.md
    math-mermaid.md
```

如果后续需要测试项目承接，也可以在 `packages/test/src/markdown/` 下建立与之对应的 demo 和 spec。

当前已正式落地的首批流式 fixture 基线位于：

- `packages/components/src/markdown/fixtures/streaming.ts`

原因是 `M4` 第一阶段需要的是“固定 step 的 chunk 场景”，TS 场景集比单个 `.md` 文件更适合同时驱动 demo controls 和 Playwright 断言。

## Fixture 分类

## A. 基础语法类

### 1. `basic.md`

覆盖目标：

- 标题
- 段落
- 强调
- 删除线
- 列表
- task list
- 引用
- 分隔线
- 链接
- 图片
- 行内代码

用途：

- `M1` 基础节点渲染回归
- 快照对比

当前 demo 映射：

- `Headings`
- `Paragraph`
- `Styling text`
- `Break lines`
- `Quoting text`
- `Links`
- `Lists`
- `Task lists`
- `Bubble variant`
- `Tables`

### 2. `table-heavy.md`

覆盖目标：

- 表格
- 多列对齐
- 长单元格内容
- table overflow

用途：

- 表格组件渲染
- Bubble 宽度约束下的表现

## B. 长文档类

### 3. `long-article.md`

覆盖目标：

- 50~100 段文本
- 多级标题
- 多段列表和引用
- 长文本排版稳定性

用途：

- 静态首渲染观察
- 大文档回归
- variant 排版验证

当前 demo 映射：

- `Long article`

## C. 代码块热点类

### 4. `code-heavy.md`

覆盖目标：

- 多个 fenced code block
- 多语言
- 长代码块
- 连续代码块与普通文本混排

用途：

- `M2` 代码块专项能力
- 更新边界验证
- 高亮策略验证

### 5. `math-mermaid.md`

覆盖目标：

- Mermaid
- KaTeX / LaTeX
- 代码块和数学混排

用途：

- `M5` 高级能力回归

## D. Bubble 场景类

### 6. `bubble-chat.md`

覆盖目标：

- 对话气泡里常见 markdown
- 紧凑排版
- 图片、链接、引用、代码混排
- fallback renderer 与显式 markdown content type 两条接入方式
- provider attributes 对 bubble markdown 的配置透传

用途：

- `bubble` variant 回归
- `BubbleRenderers.Markdown` 集成测试

当前 demo / test 映射：

- `Bubble variant`
- `markdown-demo` 中的 `Bubble integration`
- `packages/test/src/markdown/index.vue` 中的 `markdown-bubble`
- `packages/test/src/markdown/index.vue` 中的 `markdown-bubble-fallback`
- `packages/test/src/markdown/index.vue` 中的 `markdown-bubble-content-type`

## E. 流式场景类

### 7. `streaming-basic.md`

覆盖目标：

- 文本逐字追加
- 列表逐步成型
- 链接逐步闭合

用途：

- `M4` 流式基础能力

当前 demo / test 映射：

- `markdown-demo` 中的 `Streaming markdown`
- `packages/test/src/markdown/index.vue` 中的 `markdown-stream-smoothing`
- `packages/test/src/markdown/index.vue` 中的 `markdown-stream-link`
- `packages/test/src/markdown/index.vue` 中的 `markdown-stream-image`

### 8. `streaming-code.md`

覆盖目标：

- code fence 逐步生成
- 半截代码块
- 半截表格
- 尾部 token 高频更新

用途：

- `M4` 代码块流式回归

当前 demo / test 映射：

- `markdown-demo` 中的 `Streaming markdown`
- `packages/test/src/markdown/index.vue` 中的 `markdown-stream-code`
- `packages/test/src/markdown/index.vue` 中的 `markdown-stream-table`

### 9. `streaming-repro.md`

覆盖目标：

- 对标 `LobeUI streamingAnimationRepro` 的 `large append`
- 对标 `LobeUI streamingAnimationRepro` 的 `paragraph burst`
- 对标 `LobeUI` 风格 queue handoff 的 `fast chunks / high TPS burst`
- 对标 finalize 中断恢复的 `settling append`
- 明确当前第一方 streaming 路线的 scheduler 契约是否已正式收口

用途：

- `M4.5` animated repro、scheduler 观测与 finalize / reset 回归

当前 demo / test 映射：

- `markdown-demo` 中的 `Streaming repro`
- `packages/test/src/markdown/index.vue` 中的：
  - `markdown-stream-animated-large-append`
  - `markdown-stream-animated-paragraph-burst`
  - `markdown-stream-animated-fast-chunks`
  - `markdown-stream-animated-high-tps`
  - `markdown-stream-animated-heading-list`
  - `markdown-stream-animated-quote-paragraph`
  - `markdown-stream-animated-settling-append`
  - `markdown-stream-animated-rewrite-reset`
  - `markdown-stream-animated-skip-matrix`

## 每个 Fixture 应记录的信息

建议每个 fixture 除了 markdown 内容本身，还应记录：

- 主要覆盖能力
- 属于哪个阶段的关键样例
- 是否涉及重能力
- 是否要求 Bubble 集成验证
- 是否要求 streaming 验证

## Benchmark 关注点

这里的 benchmark 不一定一开始就做成完整自动化性能框架，但至少要固定“看什么”。

## 1. 静态首渲染

关注：

- `basic.md`
- `long-article.md`
- `code-heavy.md`

观察点：

- 是否有明显同步阻塞
- 长文档渲染是否可接受
- 代码块是否显著拉高渲染成本

## 2. 更新渲染

关注：

- 普通文本尾部追加
- 表格后追加普通文本
- 多代码块文档后追加普通文本

观察点：

- 是否触发前序无关 block 重算
- 代码块是否被重复处理

## 3. 流式渲染

关注：

- `streaming-basic.md`
- `streaming-code.md`

观察点：

- 是否闪烁
- 是否尾部抖动明显
- 是否出现整段反复重排

## 4. 包体积回归

建议在每个阶段记录：

- 默认路径是否新增重依赖
- 是否新增动态 import
- 高亮 / Mermaid / KaTeX 是否仍保持按需进入

## 与阶段的对应关系

| Fixture | 主要阶段 |
| --- | --- |
| `basic.md` | M1 |
| `table-heavy.md` | M1 / M3 |
| `long-article.md` | M1 |
| `code-heavy.md` | M2 |
| `bubble-chat.md` | M3 |
| `streaming-basic.md` | M4 |
| `streaming-code.md` | M4 |
| `math-mermaid.md` | M5 |

## 进入正式实现前的要求

在真正开始 `M0/M1` 实现前，至少应完成：

1. fixture 名单冻结
2. fixture 覆盖目标写清楚
3. benchmark 关注点写清楚

这样后续实现时，每阶段都知道该拿什么回归。
