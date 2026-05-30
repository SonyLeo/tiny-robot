---
outline: deep
---

# Markdown 渲染调研

## 背景

本文档用于沉淀 TinyRobot 当前 Markdown 渲染现状，以及外部 AI 组件库的实现调研。

这份文档重点回答三个问题：

1. TinyRobot 当前 `Bubble` 的 Markdown 是怎么工作的。
2. `LobeUI`、`Ant Design X Markdown`、`streamdown`、`assistant-ui`、`NLUX` 这些参考实现分别解决了什么问题。
3. 基于这些调研，TinyRobot 当前最核心的问题是什么。

## 一句话结论

- TinyRobot 当前不是“整个 Bubble 依赖三方 Markdown 组件”，而是“Bubble 已经有一套自有 renderer 架构，但 `BubbleRenderers.Markdown` 目前只是对三方解析库的薄封装”。
- 真正的问题不在 `BubbleProvider / renderer` 架构，而在 Markdown 叶子渲染器还停留在 `markdown-it + DOMPurify + v-html` 阶段。
- 如果要对标 `LobeUI` 的成熟度，TinyRobot 应该把 Markdown 从“Bubble 内的一个薄渲染器”升级成第一方能力层。

## 当前 TinyRobot 的现状

### 已验证事实：Bubble 的总体机制

TinyRobot 的 `Bubble` 已经是 renderer architecture，而不是“把所有内容丢给一个三方聊天组件”。

当前链路可以概括为：

1. `Bubble` / `BubbleList` 负责消息分组、布局、角色配置和 Box 包裹。
2. `BubbleContentWrapper` 根据消息和 `contentIndex` 选择一个内容渲染器。
3. 渲染器匹配规则由 `BubbleProvider`、组件 props 和默认规则共同决定。
4. Markdown 只是其中一个可选内容渲染器。

相关代码与文档：

- 组件文档：`docs/src/components/bubble.md`
- 内容渲染入口：`packages/components/src/bubble/BubbleContentWrapper.vue`
- 匹配逻辑：`packages/components/src/bubble/composables/useBubbleContentRenderer.ts`
- 默认匹配规则：`packages/components/src/bubble/renderers/defaultRenderers.ts`
- Markdown 渲染器：`packages/components/src/bubble/renderers/Markdown.vue`
- Markdown 依赖加载：`packages/components/src/bubble/utils.ts`

### 已验证事实：Markdown 在当前体系中的定位

`Bubble` 的 Markdown 示例并不是“自动识别 Markdown 内容类型”，而是通过 fallback renderer 的方式启用的。

也就是说，当前文档中的用法本质上是：

```vue
<tr-bubble
  :content="mdContent"
  :fallback-content-renderer="BubbleRenderers.Markdown"
/>
```

这说明：

- Markdown 目前更像“字符串内容的解释策略”
- 而不是 `type: 'markdown'` 这样的一级内容类型
- 它尚未进入 TinyRobot 的默认 `contentRendererMatches`

### 已验证事实：当前 Markdown renderer 的真实实现

当前 `BubbleRenderers.Markdown` 的实现非常直接：

1. 使用 `useMessageContent` 取出当前文本内容。
2. 懒加载 `markdown-it` 和 `dompurify`。
3. `markdown-it.render(content)` 产出 HTML 字符串。
4. `dompurify.sanitize(...)` 进行净化。
5. 最终通过 `v-html` 注入到 DOM。

当前实现的优点：

- 接入成本低
- 对使用方负担小
- 通过 peer dependency 避免默认安装 markdown 能力
- 适合快速给 `Bubble` 增加一个“可用的 Markdown 模式”

当前实现的限制：

- Markdown 子树在渲染层退化为一整块 HTML island
- `h1/p/pre/code/table/blockquote/a/img/hr` 等元素没有第一方组件映射
- 样式控制只能靠容器类名和少量全局 CSS
- 无法精细控制流式不完整 Markdown
- 难以自然扩展 Mermaid、LaTeX、HTML Preview、脚注、引用卡片、搜索结果卡片等高级节点
- Markdown 相关配置目前通过 `BubbleProvider.store.mdConfig` / `dompurifyConfig` 读取，类型边界较弱

### 现状判断

TinyRobot 当前的真正状态不是“没有架构”，而是：

- `Bubble` 外层已经具备良好的可扩展渲染器框架
- `Markdown` 内层还没有接入同等粒度的语义控制能力

换句话说：

> 现在的问题不是 `Bubble` 架构太弱，而是 Markdown 这一块还没有成为第一方渲染子系统。

## 外部方案调研

## `LobeUI`

参考资料：

- [LobeUI 仓库](https://github.com/lobehub/lobe-ui)
- [Markdown 入口](https://raw.githubusercontent.com/lobehub/lobe-ui/master/src/Markdown/Markdown.tsx)
- [MarkdownRender](https://raw.githubusercontent.com/lobehub/lobe-ui/master/src/Markdown/SyntaxMarkdown/MarkdownRender.tsx)
- [StreamdownRender](https://raw.githubusercontent.com/lobehub/lobe-ui/master/src/Markdown/SyntaxMarkdown/StreamdownRender.tsx)
- [MarkdownProvider](https://raw.githubusercontent.com/lobehub/lobe-ui/master/src/Markdown/components/MarkdownProvider.tsx)
- [组件映射逻辑](https://raw.githubusercontent.com/lobehub/lobe-ui/master/src/hooks/useMarkdown/useMarkdownComponents.tsx)
- [remark 插件逻辑](https://raw.githubusercontent.com/lobehub/lobe-ui/master/src/hooks/useMarkdown/useMarkdownRemarkPlugins.ts)
- [rehype 插件逻辑](https://raw.githubusercontent.com/lobehub/lobe-ui/master/src/hooks/useMarkdown/useMarkdownRehypePlugins.ts)

### 已验证事实

`LobeUI` 的 Markdown 不是 `v-html` 方案，而是完整的 AST / component mapping 方案：

- 外层 `Markdown` 组件负责统一能力开关和视觉变体
- `MarkdownProvider` 负责通过 context 下发配置
- 静态渲染分支使用 `react-markdown`
- 流式渲染分支使用 `StreamdownRender`
- 每个常见标签都可映射到第一方组件，例如：
  - `a`
  - `img`
  - `video`
  - `pre`
  - `table`
  - `section`
  - `kbd`
- remark / rehype 插件链可按开关组合

插件能力包含：

- GFM
- 数学公式
- GitHub Alert
- 自定义脚注
- 原始 HTML
- 视频扩展
- CJK 友好断行
- 聊天态换行增强

### 已验证事实：流式部分

`LobeUI` 的流式分支不是简单“文本变化就整段重渲染”，而是额外做了这些事情：

- 对输入文本做 smoothing
- 使用 `remend` 处理流式状态下的不完整 Markdown
- 用 `marked.lexer` 先切分 block
- 以 block 为单位进行 reveal / animation
- 对动画进行 profiler 和节流控制

### 对 TinyRobot 有价值的点

`LobeUI` 最值得学习的，不是它具体用了哪个 parser，而是它把 Markdown 当成了独立能力层：

- Markdown 自己有 provider
- Markdown 自己有 renderer 组件树
- Markdown 自己有 variant（默认态 / chat 态）
- Markdown 自己有静态与流式两条实现分支
- Markdown 自己有标签级组件映射

### 应该对标的功能特性

如果把 `LobeUI` 当作 TinyRobot 在 Markdown 能力上的主要对标对象，它当前已经具备的“产品级功能面”大致可以拆成下面这些条目。

#### 1. 基础渲染能力

- 标题、段落、列表、引用、表格、分隔线、删除线、任务列表
- 行内代码与代码块区分
- GFM 扩展支持
- 聊天态换行增强

#### 2. 标签级组件映射

- 链接使用第一方 `Link`
- 图片使用第一方 `Image`
- 视频使用第一方 `Video`
- 表格使用第一方 `MarkdownTable`
- 代码块使用第一方 `CodeBlock`
- `kbd`、`section` 等语义节点也有专门处理

这意味着它不是“把 Markdown 转成 HTML 然后上样式”，而是把 Markdown 变成可控的 UI 组件树。

#### 3. 代码块能力

从 `CodeBlock.tsx` 可以确认它已经把代码块分成多种分流：

- 普通代码高亮
- 单行代码快速展示
- Mermaid 代码块
- 完整 HTML 文档预览
- 可通过 `fullFeaturedCodeBlock` 打开更完整的代码块体验

这类设计很关键，因为 AI 消息里的代码块往往不只是“着色文本”，而是潜在的交互节点。

#### 4. 数学公式与图表

从类型和插件配置可以确认它已经内建这些能力开关：

- `enableLatex`
- `enableMermaid`
- `enableHtmlPreview`
- `enableGithubAlert`
- `enableCustomFootnotes`

它的官方 demo 内容也明确覆盖了：

- KaTeX / LaTeX
- Mermaid
- Footnotes
- Code
- Table
- 长文段落排版

#### 5. 流式渲染体验

`LobeUI` 的流式分支不是单纯“支持内容变化”，而是包含完整的 stream UX 设计：

- `enableStream`
- `animated`
- `streamSmoothingPreset`
- block 级 reveal
- smoothing / queue / settle 逻辑

这一层是它和普通 Markdown 组件拉开差距的核心能力。

#### 6. 视觉变体与版式控制

从 `MarkdownProps` 类型可以确认它把视觉排版能力暴露为一等配置：

- `variant: 'default' | 'chat'`
- `fontSize`
- `lineHeight`
- `borderRadius`
- `headerMultiple`
- `marginMultiple`
- `enableImageGallery`

也就是说，它不只是“有一套默认样式”，而是已经具备“同一渲染引擎，不同阅读场景”的能力。

#### 7. 可扩展性

它对外提供的扩展点也非常完整：

- `components`
- `componentProps`
- `remarkPlugins`
- `remarkPluginsAhead`
- `rehypePlugins`
- `rehypePluginsAhead`
- `customRender`
- `reactMarkdownProps`

这意味着它已经不是一个单纯的组件，而是一个 Markdown rendering platform。

### 对标矩阵：LobeUI vs TinyRobot 当前现状

| 能力项 | LobeUI | TinyRobot 当前 | 判断 |
| --- | --- | --- | --- |
| 基础 Markdown 渲染 | 完整 | 基本可用 | TinyRobot 有基础能力，但缺少结构化渲染 |
| 标签级组件映射 | 有 | 无 | 这是当前最大差距之一 |
| 代码块分流 | 高亮 / Mermaid / HTML Preview / 单行分支 | 无 | TinyRobot 当前只有裸 `pre/code` HTML |
| 表格/引用/链接统一组件 | 有 | 无 | 当前主要靠 HTML 默认结构和外部样式 |
| LaTeX | 有 | 无 | 后续能力项 |
| Mermaid | 有 | 无 | 后续能力项 |
| Footnotes | 有 | 无 | 后续能力项 |
| GitHub Alert | 有 | 无 | 可选能力项 |
| 图片 Gallery | 有 | 无 | 与 TinyRobot 图片能力可联动 |
| 流式 Markdown | 有专门实现 | 仅文本变化触发重渲染 | TinyRobot 需要单独补 streaming layer |
| chat 视觉变体 | 有 | 无 | TinyRobot 应至少提供 `bubble` variant |
| 插件扩展点 | 完整 | 很弱 | 当前主要只有 parser config/sanitize config |
| 安全层 | 明确配置 | 基本有 | TinyRobot 已有 DOMPurify，但边界较薄 |

### 基于 LobeUI 的能力对标，TinyRobot 应优先追齐什么

如果只从“能力特性”角度对标 `LobeUI`，TinyRobot 最应该优先追齐的不是 Mermaid 和 LaTeX，而是下面这四层：

1. **标签级组件映射**
   - 这是从“HTML 注入器”升级成“第一方渲染器”的门槛。

2. **代码块专项能力**
   - 代码块是 AI 场景最常用、也是最值得单独设计的节点。

3. **bubble / chat 视觉变体**
   - TinyRobot 当前主要场景就是对话气泡，不做 variant 会导致样式规范始终散落在 Bubble 内部。

4. **流式 Markdown 分支**
   - 这是 AI 组件库和普通内容组件库的本质差异。

我的建议优先级是：

- P0：标签映射 + 样式统一 + code block 组件化
- P1：bubble variant + 图片/表格/引用专项样式
- P2：streaming layer
- P3：LaTeX / Mermaid / Footnotes / HTML Preview

### 不适合直接照搬的点

`LobeUI` 基于 React 和 `react-markdown` 生态，TinyRobot 在 Vue 里不能直接复制实现，但可以复制设计分层。

## `Ant Design X Markdown`

参考资料：

- [Ant Design X Markdown 文档](https://x.ant.design/x-markdowns/introduce)
- [包信息](https://www.npmjs.com/package/@ant-design/x-markdown)
- [XMarkdown 入口](https://raw.githubusercontent.com/ant-design/x/master/packages/x-markdown/src/XMarkdown/index.tsx)
- [Parser.ts](https://raw.githubusercontent.com/ant-design/x/master/packages/x-markdown/src/XMarkdown/core/Parser.ts)
- [Renderer.ts](https://raw.githubusercontent.com/ant-design/x/master/packages/x-markdown/src/XMarkdown/core/Renderer.ts)
- [useStreaming.ts](https://raw.githubusercontent.com/ant-design/x/master/packages/x-markdown/src/XMarkdown/hooks/useStreaming.ts)

### 已验证事实

`@ant-design/x-markdown` 的路线和 `LobeUI` 不同，它更偏 streaming-first：

- 解析内核使用 `marked`
- 输出 HTML 后通过 `html-react-parser` 转成 React 节点
- 使用 `DOMPurify` 做净化
- 允许自定义 tag -> component 映射
- 自己维护 streaming cache 和 incomplete token 识别逻辑

它在 `useStreaming` 中专门识别这些“不完整 token”：

- link
- image
- html
- emphasis
- list
- table
- inline-code

并且可以：

- 对不完整 token 保留缓存
- 为不完整 token 输出占位组件
- 给代码块打上 `data-state="loading|done"` 和 `data-lang`
- 注入 `xmd-tail` 流式尾巴

### 对 TinyRobot 有价值的点

`Ant Design X Markdown` 最值得借鉴的是：

- 把流式 Markdown 当作独立问题处理
- 把不完整 token 的用户体验前置考虑
- 代码块、链接、图片、表格等节点都有“正在流式中”的状态语义

### 不适合直接照搬的点

它的实现更偏“一体化解析器 + 渲染器”，对 TinyRobot 现阶段来说实现成本较高。

## `streamdown`

参考资料：

- [streamdown 仓库](https://github.com/vercel/streamdown)
- [streamdown README](https://raw.githubusercontent.com/vercel/streamdown/main/packages/streamdown/README.md)
- [npm](https://www.npmjs.com/package/streamdown)

### 已验证事实

`streamdown` 明确把自己定义为：

> “`react-markdown` 的流式场景替代品”

它的定位非常清楚：

- 服务 AI streaming output
- 兼容不完整 Markdown
- 支持 GFM、数学公式、Mermaid、代码高亮
- 把安全作为默认能力

### 对 TinyRobot 有价值的点

`streamdown` 的最大启发是产品分层：

- 静态 Markdown 可以是一套实现
- 流式 Markdown 可以是另一套实现
- 两者共享节点样式和大部分组件，但不应该强行共用最薄的解析链

## `assistant-ui`

参考资料：

- [assistant-ui react-markdown README](https://raw.githubusercontent.com/assistant-ui/assistant-ui/main/packages/react-markdown/README.md)
- [assistant-ui react-streamdown README](https://raw.githubusercontent.com/assistant-ui/assistant-ui/main/packages/react-streamdown/README.md)
- [react-markdown 包信息](https://www.npmjs.com/package/@assistant-ui/react-markdown)
- [react-streamdown 包信息](https://www.npmjs.com/package/@assistant-ui/react-streamdown)

### 已验证事实

`assistant-ui` 明确把 Markdown 能力拆成两档：

| 包 | 定位 |
| --- | --- |
| `@assistant-ui/react-markdown` | 轻量渲染，基于 `react-markdown` |
| `@assistant-ui/react-streamdown` | 重型渲染，基于 `streamdown`，内建 Shiki / KaTeX / Mermaid |

### 对 TinyRobot 有价值的点

这说明主流 AI 组件库已经默认承认一件事：

> AI 消息里的 Markdown，不再只是普通内容渲染问题，而是能力分层问题。

## `NLUX`

参考资料：

- [NLUX Markdown 文档](https://docs.nlkit.com/nlux/reference/ui/markdown)
- [npm: @nlux/markdown](https://www.npmjs.com/package/@nlux/markdown)

### 已验证事实

`NLUX` 提供的是自己的 Markdown parser，并明确强调：

- 它可以把 Markdown 文本流解析成 DOM
- 它既能用于流式渲染，也能用于定制 renderers

### 对 TinyRobot 有价值的点

它说明还有第三条路线：

- 不走 `react-markdown`
- 不走 HTML 注入
- 而是直接为 AI chat 做专用 parser

但这条路线对 TinyRobot 的短中期成本最高。

## Vue 技术栈下的路线比较

在 Vue 3 场景下，当前可选路线大致有三种。

### 路线 A：继续使用 `markdown-it`，但从 HTML 注入升级为结构化渲染

可学习对象：

- VitePress 本身使用 `markdown-it`
- TinyRobot 当前已经引入 `markdown-it` 作为 Markdown 能力的事实基础

特点：

- 生态成熟，插件丰富
- 与 TinyRobot 当前认知成本最低
- 适合从现状平滑升级
- 可以把 `markdown-it.parse()` 的 token 流转换成内部 IR，再映射为 Vue VNode
- 不需要最终 `v-html`

短板：

- token 是流式开闭结构，转树需要自己封装
- 相比 unified 生态，语义树转换与插件能力没有那么标准化

### 路线 B：切到 unified / remark / rehype 生态，再做 Vue 渲染器

参考资料：

- [unified](https://unifiedjs.com/)
- [remark](https://remark.js.org/)
- [react-markdown](https://github.com/remarkjs/react-markdown)

特点：

- 语义分层最清晰：Markdown -> mdast -> hast -> renderer
- 最接近 `LobeUI` 的心智模型
- 插件生态最丰富
- 更适合做长期可扩展的 Markdown 平台

短板：

- Vue 侧缺少像 `react-markdown` 这样现成成熟的一方 renderer
- 需要自己把 mdast / hast 映射成 Vue VNode
- 实施成本和调试成本高于 `markdown-it`

### 路线 C：为流式场景建立专用 parser / preprocessor

可学习对象：

- `Ant Design X Markdown`
- `streamdown`
- `NLUX`

特点：

- 最适合 AI streaming output
- 可以单独处理半截链接、半截图片、半截表格、代码 fence 未闭合等问题

短板：

- 实现复杂度最高
- 不适合作为第一阶段的唯一主路径

## 最终结论

结合当前现状和外部对标，我对 TinyRobot 的最终判断是：

- `Bubble` 的 renderer 架构本身是对的，问题集中在 Markdown 叶子渲染器过薄。
- `LobeUI` 最值得对标的不是某个 parser，而是它把 Markdown 经营成了一个独立的平台能力。
- TinyRobot 在 Vue 下的合理路线不是继续给 `Markdown.vue` 打补丁，而是建立独立的 `TrMarkdown` 基座。

更具体的设计方案请参考 [TrMarkdown 设计方案](/guide/markdown-rendering-design)，实现节奏请参考 [Markdown 渲染 Roadmap](/guide/markdown-rendering-roadmap)。
## 参考资料

### TinyRobot 仓库内资料

- `docs/src/components/bubble.md`
- `packages/components/src/bubble/renderers/Markdown.vue`
- `packages/components/src/bubble/composables/useBubbleContentRenderer.ts`
- `packages/components/src/bubble/renderers/defaultRenderers.ts`
- `packages/components/src/bubble/utils.ts`

### 外部官方资料

- [LobeUI 仓库](https://github.com/lobehub/lobe-ui)
- [LobeUI Markdown 入口](https://raw.githubusercontent.com/lobehub/lobe-ui/master/src/Markdown/Markdown.tsx)
- [LobeUI StreamdownRender](https://raw.githubusercontent.com/lobehub/lobe-ui/master/src/Markdown/SyntaxMarkdown/StreamdownRender.tsx)
- [Ant Design X Markdown 文档](https://x.ant.design/x-markdowns/introduce)
- [Ant Design X Markdown 源码](https://github.com/ant-design/x/tree/master/packages/x-markdown)
- [streamdown](https://github.com/vercel/streamdown)
- [assistant-ui Markdown 文档](https://www.assistant-ui.com/docs/ui/markdown)
- [assistant-ui Streamdown 文档](https://www.assistant-ui.com/docs/ui/streamdown)
- [NLUX Markdown 文档](https://docs.nlkit.com/nlux/reference/ui/markdown)
- [unified](https://unifiedjs.com/)
- [remark](https://remark.js.org/)
- [react-markdown](https://github.com/remarkjs/react-markdown)
