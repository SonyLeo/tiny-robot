---
outline: deep
---

# TrMarkdown 设计方案

本文档用于定义 TinyRobot 在 Vue 3 技术栈下的第一方 Markdown 渲染基座 `TrMarkdown`。

它聚焦于：

- 组件职责与边界
- 模块分层
- API 草图
- 样式规范
- Bubble 集成方式
- 分阶段演进策略

配套文档：

- 调研文档： [Markdown 渲染调研](/guide/markdown-rendering-research)
- 路线图： [Markdown 渲染 Roadmap](/guide/markdown-rendering-roadmap)

## 设计目标

`TrMarkdown` 的目标不是只替换当前 `BubbleRenderers.Markdown`，而是成为 TinyRobot 的 Markdown rendering base。

它需要同时满足两类场景：

- 独立组件使用
- 作为 `Bubble` 的 Markdown 内容渲染内核

## 当前实现快照（2026-05-30）

当前实现已经从“方案草图”进入到“可运行的第一版基座”：

- `TrMarkdown`、parser adapter、render 层、节点组件和 code 子系统都已在 `packages/components/src/markdown` 内落地
- `BubbleRenderers.Markdown` 已经改为消费 `TrMarkdown`
- `markdown-demo` 已切成 docs preview 风格双栏结构，并通过 `TrThemeProvider` 统一 light / dark
- 基础排版当前已覆盖：
  - `headings`
  - `paragraph`
  - `long article`
  - `styling text`
  - `break lines`
  - `quoting text`
  - `links`
  - `lists`
  - `task lists`
  - `bubble variant`
  - `tables`
- 当前 typography 控制策略已经收敛为：
  - `fontSize / lineHeight / headerMultiple / marginMultiple` 统一驱动整块 markdown 渲染
  - code 字体大小从正文字号派生
  - 基础块级节点间距统一受 `marginMultiple` 控制
- task list 当前实现策略：
  - 不额外引入 `markdown-it-task-lists`
  - 继续沿用现有 parser IR，在 list item 首段识别 `[ ] / [x]`
  - 渲染层输出受控 checkbox，并复用现有 list / bubble 样式体系
- 当前仍明确不在默认主路径中的能力：
  - footnotes / alerts
  - math / mermaid / html preview
  - 流式 markdown

## 命名规则

`markdown` 模块内部的命名规则应区分“对外 API”与“模块内部实现”。

### 对外规则

对外暴露给使用者的入口、类型与能力名，保留 `TrMarkdown` 语义：

- `TrMarkdown`
- `TrMarkdownProps`
- `TrMarkdownParserAdapter`
- `TrMarkdownComponentMap`
- `TrMarkdownContext`

原因：

- 它们属于 TinyRobot 的公开能力面
- 需要保持品牌语义和跨模块可辨识度

### 模块内部规则

模块内部文件和私有实现不再重复 `TrMarkdown` 前缀，而使用短名。

例如：

- `context.ts`
- `NodeRenderer.ts`
- `components/nodes/Paragraph.vue`
- `components/code-block/CodeBlock.vue`
- `components/code-block/CopyButton.vue`

原因：

- 目录 `markdown/` 已经提供了领域上下文
- 再写 `TrMarkdownParagraph`、`TrMarkdownCodeBlockToolbar` 会产生语义重复
- 短名更利于后续扩展和维护

### 命名规则一句话总结

> 模块名表达领域，对外类型表达品牌，对内文件表达职责。

## 核心设计原则

`TrMarkdown` 的设计以三条原则为基础：

1. 解析层、渲染层、样式层分离
2. 标签级组件映射，而不是直接 `v-html`
3. 流式 Markdown 单独处理，不和静态 Markdown 混为一谈

## 三方库选型策略

为了避免重复造轮子，`TrMarkdown` 不应该从零实现全部能力，而应优先复用成熟的底层库，并把 TinyRobot 自己的工作聚焦在：

- Vue 组件映射
- Bubble / chat 场景变体
- 样式体系
- 代码块专项体验
- 流式交互策略

这里的选型原则是：

1. **优先复用 parser / renderer / plugin 底层能力**
2. **不直接把编辑器产品当作运行时渲染内核**
3. **静态渲染与流式渲染允许使用不同底层**
4. **优先选可组合、可替换、边界清晰的库**

## 性能与体积约束

`TrMarkdown` 在设计阶段就必须同时考虑两类成本：

- **发布成本**：包体积、依赖体积、默认引入成本
- **运行成本**：渲染性能、流式更新性能、长消息场景性能

这两类成本不能混为一谈，但都必须成为设计输入。

### 一、默认路径必须轻

`TrMarkdown` 的默认路径应只承担“基础 Markdown 渲染”。

默认路径建议只包含：

- 标题
- 段落
- 列表
- 引用
- 链接
- 图片
- 表格
- 行内代码
- 基础代码块容器

默认路径不应该自动打包：

- `Shiki`
- `mermaid`
- `KaTeX`
- HTML Preview runtime
- 重型流式增强逻辑

原则：

> 高级能力不能绑架基础渲染路径。

### 二、重能力必须插件化或延迟加载

以下能力都应视为“重能力”：

- 代码高亮
- Mermaid
- LaTeX / KaTeX
- HTML Preview
- 流式 Markdown 增强

这些能力的设计要求：

1. 默认关闭
2. feature flag 显式开启
3. 运行时按需加载
4. 不进入无相关内容的渲染路径

例如：

- 只有遇到 fenced code block 且开启高亮时，才加载 `shiki`
- 只有遇到 `mermaid` fence 且启用 Mermaid 时，才加载 `mermaid`
- 只有启用公式且文档中存在数学内容时，才加载 `katex` 链路

### 三、静态渲染与流式渲染必须拆分

静态 Markdown 和 AI 流式 Markdown 不是同一个问题。

因此应拆成两条实现路径：

- `TrMarkdownStaticRenderer`
- `TrMarkdownStreamRenderer`

这样做的收益是：

- 静态路径保持简单、稳定、低成本
- 流式路径可以自由引入 smoothing、token hold、tail 等逻辑
- 不把 streaming 复杂度传播给所有使用场景

### 四、更新粒度必须细化

当前 `BubbleRenderers.Markdown` 的实现是“内容变化 -> 整段 render + sanitize + replace”，这对流式场景天然不友好。

`TrMarkdown` 新方案应尽量满足：

- 代码块成为稳定边界
- 表格成为稳定边界
- 段落至少成为逻辑边界

重点不是一开始就做到最细粒度 diff，而是避免：

- 尾部 token 更新导致前面所有内容重算
- 一个未闭合链接导致整段 DOM 抖动
- 后续普通文本追加触发前序代码块重复高亮

### 五、代码块要作为性能热点单独设计

代码块是 Markdown 场景里最容易放大性能问题的节点。

所以它不能只被看作一个普通节点，而应被当作：

- 功能热点
- 体积热点
- 渲染热点

这要求：

- `TrMarkdownCodeBlock` 单独建模
- 高亮链路与普通文本链路分离
- Mermaid / HTML Preview 分流
- 后续支持 copy、toolbar、折叠时，不影响基础路径

### 六、引入一个库之前要看“收益/成本比”

对 `TrMarkdown` 来说，不是“能用的库就引”，而是看它是否真的减少重复造轮子。

建议用下面这个判断框架：

#### 适合引入

- 明显减少底层实现工作量
- 能力边界清晰
- 可按需加载
- 可替换
- 不强绑定编辑器或整套产品模型

#### 不适合引入

- 体积大但只解决边角需求
- 无法按需进入
- 强绑定编辑器或 viewer 产品
- 会压缩 TinyRobot 自己的组件映射与样式控制权

### 七、针对 `TrMarkdown` 的设计约束清单

下面这些条目建议写成后续实现时的明确验收要求：

- 默认渲染路径不引入 `Shiki`、`mermaid`、`KaTeX`
- 所有重能力都必须可关闭
- 所有重能力都应允许延迟加载
- 静态与流式渲染必须是分支实现
- 代码块应有独立更新边界
- 不允许流式尾部变化导致前序所有内容重算

### 八、对 TinyRobot 当前构建方式的启发

从当前组件包构建可以确认两点：

- `markdown-it` 和 `dompurify` 已被外部化
- `BubbleRenderers.Markdown` 已经通过动态 import 避免默认路径引入它们

这说明 TinyRobot 现阶段在 Markdown 方向上已经有一个正确起点：

- 基础包不应默认背负 Markdown 的全部成本

`TrMarkdown` 新方案应保留并强化这个方向，而不是回退成“所有能力默认打进主包”。

目前第一版 `M1` 验证结果也支持这一判断：

- `type-check` 已通过
- `build` 已通过
- 当前 `dist/markdown/index.js` 约 `10.73 kB`
- 尚未引入 `Shiki`、`mermaid`、`KaTeX`

说明第一版静态基座在默认路径上仍然比较轻，方向是对的。

## Vue 技术栈候选库梳理

这一节专门回答：在 Vue 技术栈里，是否已经存在能覆盖 `LobeUI` 各场景能力的底层库。

### A. 可直接作为 Vue Markdown 渲染底座候选的库

#### 1. `Comark` / `@comark/vue`

来源：

- [Comark 官方站](https://comark.dev/)
- [Nuxt MDC 模块页](https://nuxt.com/modules/mdc)

已验证事实：

- 官方明确说明支持 Vue / React / Svelte
- 官方明确说明支持 streaming-ready markdown
- 官方明确说明支持 components in markdown
- 官方明确说明支持 plugin 扩展
- 官方明确展示了 math 和 syntax highlighting 插件能力
- Nuxt 官方模块页明确写明 `@nuxtjs/mdc` 正在被 `Comark` 取代，并称其“更快、AI-friendly、且不再绑定 Vue/Nuxt”

对 TinyRobot 的价值：

- 它是目前 Vue 侧最接近 `LobeUI + streamdown` 能力面的候选底座
- 同时覆盖：
  - 组件映射
  - streaming
  - markdown components
  - 插件扩展

风险：

- 项目较新，生态成熟度和长期稳定性需要观察
- 需要评估它的扩展 API 是否足以承接 TinyRobot 自己的节点组件与 Bubble 变体

建议定位：

- **优先调研/Spike 候选**
- 很适合拿来做 `M0/M1` 技术验证

#### 2. `@crazydos/vue-markdown`

来源：

- [npm: @crazydos/vue-markdown](https://www.npmjs.com/package/@crazydos/vue-markdown)

已验证事实：

- 明确是 Vue component
- 基于 unified / remark / rehype 生态
- 内建 `rehype-sanitize`
- 依赖里包含 `remark-parse`、`remark-rehype`、`unified`

对 TinyRobot 的价值：

- 很适合走“对标 `LobeUI` 的 AST / component mapping 路线”
- 比纯 parser 更靠近可用的 Vue runtime component
- 让 TinyRobot 不必自己从 0 搭 unified 到 Vue 的第一版桥接

风险：

- 从公开包信息看，能力面更偏基础渲染，不像 `LobeUI` 那样自带完整流式能力
- 代码块专项体验、流式体验、组件平台化能力仍需二次封装

建议定位：

- **静态渲染底座候选**
- 适合 `M1` 阶段评估

#### 3. `streamdown-vue`

来源：

- [npm: streamdown-vue](https://www.npmjs.com/package/streamdown-vue)

已验证事实：

- 明确定位为 Vue 3 / Nuxt 3 的 streaming markdown renderer
- 描述中明确包含：
  - Shiki
  - KaTeX
  - Mermaid
  - secure streaming helpers
- 依赖中包含：
  - `marked`
  - `unified`
  - `remark-parse`
  - `remark-rehype`
  - `remark-gfm`
  - `remark-math`
  - `rehype-katex`
  - `shiki`
  - `mermaid`

对 TinyRobot 的价值：

- 它是 Vue 侧最直接的 “streamdown-style” 候选
- 如果 TinyRobot 在 `M4` 重点做流式 Markdown，能显著减少底层拼装工作

风险：

- 更偏流式 renderer，而不是 TinyRobot 全量静态/动态/平台化 Markdown 基座
- 需要评估其组件覆写、样式边界、Bubble 集成自由度

建议定位：

- **流式分支候选**
- 适合 `M4` 阶段评估

#### 4. `vue-markdown-render`

来源：

- [npm: vue-markdown-render](https://www.npmjs.com/package/vue-markdown-render)

已验证事实：

- 是一个纯 TypeScript 编写的 `markdown-it` Vue wrapper
- 依赖非常轻，仅依赖 `markdown-it`

对 TinyRobot 的价值：

- 适合作为“最薄 markdown-it runtime 包装”的参考
- 接入成本低

限制：

- 它本质上仍然偏简单 wrapper
- 不足以直接覆盖 `LobeUI` 的组件映射、代码块专项和流式能力

建议定位：

- **参考实现**
- 不建议作为 `TrMarkdown` 最终底座

### B. 可复用的底层能力库

这些库不一定直接承担 Vue Markdown renderer，但很适合成为 `TrMarkdown` 的底层积木。

#### 1. `markdown-it`

来源：

- [npm: markdown-it](https://www.npmjs.com/package/markdown-it)

定位：

- 适合 `M1` 的 parser adapter
- 当前 TinyRobot 已经在用，迁移成本最低

适合用来做：

- 第一阶段静态 Markdown IR 输入
- 与 `markdown-it-footnote` 等插件组合

#### 2. `micromark`

来源：

- [npm: micromark](https://www.npmjs.com/package/micromark)

已验证事实：

- 官方提供 `stream()` 接口
- 支持 CommonMark/GFM 以及 math 等扩展

定位：

- 更偏底层 tokenizer / parser
- 如果 TinyRobot 后续要做更强的 streaming parser，可作为低层候选

建议定位：

- **高级候选**
- 不建议第一阶段直接采用

#### 3. `DOMPurify`

来源：

- [npm: dompurify](https://www.npmjs.com/package/dompurify)

定位：

- 当前 TinyRobot 已经在用
- 若继续保留 HTML 中间态或需要处理受限 HTML，仍然值得保留

#### 4. `rehype-sanitize`

来源：

- `@crazydos/vue-markdown` 包依赖

定位：

- 如果采用 unified 路线，比 `DOMPurify` 更贴合 AST / rehype 处理链

#### 5. `Shiki`

来源：

- [npm: shiki](https://www.npmjs.com/package/shiki)

定位：

- 代码块高亮的首选底层
- 与 `LobeUI`、`streamdown-vue` 的目标能力一致

建议：

- 不作为默认运行时高亮方案
- 作为后续高级高亮模式候选
- 更适合：
  - full-featured code block
  - docs / article 场景
  - 可选高级主题体验

#### 6. `remark-math` + `rehype-katex` + `katex`

来源：

- [npm: remark-math](https://www.npmjs.com/package/remark-math)
- [npm: rehype-katex](https://www.npmjs.com/package/rehype-katex)
- [npm: katex](https://www.npmjs.com/package/katex)

定位：

- 如果采用 unified 路线，这是最自然的公式方案
- 如果采用 `streamdown-vue`，其依赖里已经带了这套链路

#### 7. `mermaid`

来源：

- [npm: mermaid](https://www.npmjs.com/package/mermaid)

定位：

- Mermaid block 的主流底层
- 不建议自己实现图表解析

#### 8. `markdown-it-footnote`

来源：

- [npm: markdown-it-footnote](https://www.npmjs.com/package/markdown-it-footnote)

定位：

- 如果 `M1` 继续走 `markdown-it` adapter，这是脚注能力的直接候选

### C. 不建议作为 `TrMarkdown` 核心 runtime 的库

#### 1. `ByteMD` / `@bytemd/vue-next`

来源：

- [npm: bytemd](https://www.npmjs.com/package/bytemd)
- [npm: @bytemd/vue-next](https://www.npmjs.com/package/@bytemd/vue-next)

判断：

- 它更像“可 hack 的 editor + viewer 产品”
- 很适合编辑器场景
- 但不适合作为 TinyRobot 运行时 Markdown 基座

原因：

- 体量较大
- 产品边界偏编辑器
- 对 Bubble 这类运行时渲染场景过重

#### 2. `v-md-editor`

来源：

- [npm: v-md-editor](https://www.npmjs.com/package/v-md-editor)

判断：

- 明确是 Markdown editor
- 不适合作为 TinyRobot 的核心 runtime renderer

### D. 一个值得注意的关联参考：`@nuxtjs/mdc`

来源：

- [Nuxt MDC](https://nuxt.com/modules/mdc)

已验证事实：

- 它支持把 Markdown 深度和 Vue component 结合
- 有 prose component 映射能力
- 支持 `p/h1.../table/code/img/a` 等标签映射为 Vue 组件
- 官方已经把 `Comark` 明确标成 successor

对 TinyRobot 的价值：

- `MDC` 证明了“Markdown AST -> Vue prose component 映射”这条路线在 Vue 里是可行的
- `Comark` 则像是这条路线的更新一代，更偏 streaming 和 AI 场景

## 推荐选型结论

结合当前 TinyRobot 目标，我建议不要只选“一种库覆盖全部问题”，而是按层次组合。

### 方案 A：最稳妥的分阶段组合

#### `M1` 静态基座

- parser / renderer 候选优先级：
  1. `@crazydos/vue-markdown`
  2. `markdown-it` + 自建 IR/render
  3. `Comark`（若 Spike 证明成熟可用，可上升为第一优先级）

#### `M2` 代码块

- 默认高亮：`highlight.js/core`
- `mermaid`
- 可选 `katex`

#### `M4` 流式分支

- `streamdown-vue`
- 或 `Comark`

这是我目前最推荐的实际落地方式，因为它：

- 避免一次性大迁移
- 降低完全自研的工作量
- 同时给 TinyRobot 保留第一方 UI 控制权

### 方案 B：以 `Comark` 为核心底座的激进方案

如果 Spike 结果良好，可以考虑：

- `Comark` 作为静态 + 流式统一底座
- `Shiki` / `mermaid` / `katex` 作为能力插件

优势：

- 更接近 `LobeUI` 的“平台化组件”方向
- 对 streaming 更友好

风险：

- 新项目风险
- 需要验证 Vue 场景下组件映射和样式边界是否足够稳定

### 我当前的拍板建议

如果现在就要给出设计结论，我建议：

1. **先把 `Comark` 纳入 Spike 候选**
2. **把 `@crazydos/vue-markdown` 作为静态 AST 路线的保守候选**
3. **把 `streamdown-vue` 作为流式分支候选**
4. **默认高亮采用 `highlight.js/core`，保留 `Shiki` 作为可选高级模式**
5. **保留 `mermaid`、`remark-math` / `rehype-katex`、`DOMPurify` 作为底层能力库**
5. **不要采用 `ByteMD`、`v-md-editor` 这类编辑器产品作为 runtime 基座**

## 这对当前设计文档的影响

基于这轮补充调研，`TrMarkdown` 的设计应调整为：

- 不预设“所有层都必须自研”
- `parser adapter` 层应允许接入现成 Vue renderer / parser 底座
- `stream` 层应允许单独替换为 `streamdown-vue` 或 `Comark`
- `components` 和 `styles` 仍由 TinyRobot 自己掌控

也就是说，TinyRobot 的正确策略不是“完全重写 Markdown 引擎”，而是：

> 复用成熟底层库，自己掌控节点组件、样式体系、Bubble 集成和 AI 场景体验。

## 包边界评估

在决定 `TrMarkdown` 是否要独立成新包前，需要先分清两件事：

1. **能力上是否独立**
2. **发布上是否值得独立**

这两件事并不总是等价。

### 从能力上看

`TrMarkdown` 确实具备独立能力的特征：

- 可以被 `Bubble` 消费
- 也可以被其他组件独立消费
- 自己有 parser / render / style / stream 四层
- 后续可能有独立的插件和节点体系

所以从架构抽象角度看，它完全可以被设计成一个“独立能力模块”。

### 从当前仓库边界看

但从 TinyRobot 当前 monorepo 状态看，先拆成独立 npm 包不一定是最优解。

原因有四个：

#### 1. 当前 `packages/components` 本身就是 UI 能力汇聚层

`packages/components` 负责所有可复用 UI building blocks 和导出入口。

按照现有边界：

- Bubble
- Sender
- Container
- Attachments
- ThemeProvider

都放在这里。

`TrMarkdown` 作为运行时 UI 渲染能力，天然也属于这一层。

#### 2. `TrMarkdown` 在第一阶段仍然强依赖 TinyRobot 的 UI 语义

例如：

- `bubble` variant
- 图片展示风格
- 代码块工具栏风格
- 主题变量桥接
- Bubble renderer 适配

这些都意味着第一阶段的 `TrMarkdown` 并不是一个完全中性的通用 Markdown 渲染库，而是带有明显 TinyRobot 设计系统语义的组件能力。

#### 3. 现在拆包，会把问题从“实现 Markdown”升级成“维护一个子产品”

一旦独立成 `@opentiny/tiny-robot-markdown`，你们就需要额外处理：

- 新包构建配置
- 新包发布节奏
- peer dependency 设计
- 版本同步
- 文档分发
- 子包 API 稳定性承诺

如果第一阶段能力还在快速演化，这会带来额外成本。

#### 4. 当前主包已经支持外部化和动态引入

从现有构建可以确认：

- `markdown-it`、`dompurify` 已经 external
- Bubble Markdown 已经走 runtime 懒加载

这意味着：

- 即便 `TrMarkdown` 先放在 `components` 内，也不等于一定会拖大主包
- 只要继续做好“默认路径轻 + 重能力按需”，包边界问题不必马上通过拆包解决

## 独立包 vs 放在 `components` 内的对比

### 方案 A：先放在 `packages/components` 内

优点：

- 最符合当前 monorepo 边界
- 迭代成本最低
- 与 Bubble / Theme / 图片 /代码块样式联动最顺
- 不会过早承诺独立包 API 稳定性
- 便于先把能力做对

缺点：

- 从概念上看不够“独立”
- 如果未来 `TrMarkdown` 被外部大量单独使用，后续还要再拆包

适用条件：

- 还处于 `M0-M3`
- 还在探索底层库组合
- 还未稳定确定插件、代码块、流式能力边界

### 方案 B：直接独立成 `@opentiny/tiny-robot-markdown`

优点：

- 语义上更清晰
- 后续可独立发布和单独使用
- 有利于把 Markdown 当成平台级子产品经营

缺点：

- 现在拆会显著增加维护成本
- 很容易在能力尚未稳定时就把 API 固化
- 当前阶段它还没完全脱离 TinyRobot UI 语义

适用条件：

- `TrMarkdown` 已经稳定
- 已经明确存在独立消费场景
- 已经完成至少一轮完整实现与内部验证
- 已经抽象出和 Bubble 无关的核心能力边界

## 我对包边界的结论

如果现在就需要拍板，我的建议是：

> **第一阶段不要独立发 `@tiny-robot-markdown`，而是先在 `packages/components/src/markdown` 内部实现。**

更具体地说：

- **架构上独立模块化**
  - 新建 `packages/components/src/markdown/`
  - 形成清晰的 `index.ts / index.type.ts / parser / render / stream / styles`

- **发布上先不独立拆包**
  - 仍由 `@opentiny/tiny-robot` 主包导出
  - 在实现上做好按需加载和可演进性

这是当前阶段最合理的折中。

## 未来何时值得拆成独立包

建议把以下条件作为未来拆包阈值：

1. `TrMarkdown` 已经能被 `Bubble` 之外的多个组件稳定复用
2. 静态与流式能力边界已经稳定
3. 代码块、Mermaid、KaTeX、插件扩展点 API 已基本定型
4. 样式变量体系已经稳定
5. 文档和示例已经足够支撑独立使用
6. 团队明确希望对外提供“独立 Markdown 产品能力”

满足这些条件后，再考虑拆成：

- `@opentiny/tiny-robot-markdown`

那时才更合适。

## 组件职责

### `TrMarkdown`

统一入口组件，负责：

- 接收 markdown 文本与配置
- 选择静态或流式渲染路径
- 挂载 provider / context
- 输出统一样式根容器

### `TrMarkdownProvider`

用于在内部节点和子模块之间共享：

- `variant`
- feature flags
- 组件覆写
- 链接策略
- 流式状态
- 样式级上下文

Vue 下建议使用 `provide/inject` 实现，而不是把所有信息层层 props 透传。

### `TrMarkdownStaticRenderer`

负责：

- 使用 parser adapter 解析 markdown
- 产出内部 Markdown IR
- 调用 render 层映射成 Vue VNode

### `TrMarkdownStreamRenderer`

负责：

- 处理流式输入状态
- 对不完整 Markdown 做平滑和保守展示
- 再复用静态 parser / renderer 输出节点树

### `BubbleRenderers.Markdown`

在新方案下，它不再承担 Markdown 核心逻辑，只是一个 Bubble 适配器：

- 读取当前 Bubble 内容
- 将 Bubble 场景变量桥接到 `TrMarkdown`
- 透传 Bubble 相关 attributes / state-change 能力

## 推荐目录结构

建议新增：

```text
packages/components/src/markdown/
├── index.ts
├── index.type.ts
├── TrMarkdown.vue
├── context.ts
├── NodeRenderer.ts
├── parser/
│   └── markdownItAdapter.ts
├── components/
│   ├── nodes/
│   │   ├── Paragraph.vue
│   │   ├── Heading.vue
│   │   ├── Link.vue
│   │   ├── Image.vue
│   │   ├── InlineCode.vue
│   │   ├── Blockquote.vue
│   │   ├── List.vue
│   │   ├── ListItem.vue
│   │   ├── Table.vue
│   │   └── Hr.vue
│   └── code-block/
│       ├── CodeFenceResolver.vue
│       ├── CodeBlock.vue
│       ├── CodeBlockSingleLine.vue
│       ├── CodeBlockHeader.vue
│       ├── CodeBlockToolbar.vue
│       ├── CodeLanguageTag.vue
│       └── CopyButton.vue
├── styles/
│   └── markdown.less
└── utils/
    └── render.ts
```

## 分层设计

## 解析层

### 目标

- 接收原始 Markdown 字符串
- 产出 TinyRobot 自己的 Markdown IR
- 允许替换 parser adapter

### 推荐默认路线

第一阶段默认使用 `markdown-it` adapter。

理由：

- 当前 TinyRobot 已经在 `Bubble` 中使用 `markdown-it`
- 迁移成本较低
- 先解决“结构化渲染”比“换 parser 生态”更优先

### 接口草图

```ts
export interface TrMarkdownParseContext {
  allowHtml?: boolean
  features?: TrMarkdownFeatureFlags
  parserOptions?: Record<string, unknown>
}

export interface TrMarkdownParserAdapter {
  name: string
  parse: (source: string, context: TrMarkdownParseContext) => TrMarkdownDocument
}
```

### 内部 IR 建议

建议定义一个轻量的内部节点树，而不是让业务层直接感知 `markdown-it` token 或 unified AST。

例如：

```ts
export interface TrMarkdownNode {
  type: string
  children?: TrMarkdownNode[]
  value?: string
  lang?: string
  attrs?: Record<string, unknown>
}
```

这样做的好处是：

- parser 可替换
- renderer 稳定
- 后续若切 unified，不会冲击组件层

## 渲染层

### 目标

- 将 Markdown IR 映射成第一方 Vue 组件树
- 支持消费者覆写部分节点组件
- 为后续代码块、图片、表格等能力扩展留口

### 建议节点最小集

- `root`
- `paragraph`
- `heading`
- `text`
- `strong`
- `emphasis`
- `delete`
- `blockquote`
- `list`
- `list-item`
- `link`
- `image`
- `inline-code`
- `code-block`
- `table`
- `table-row`
- `table-cell`
- `hr`
- `html`（受控）

### 组件映射建议

建议用统一组件映射表实现：

```ts
export interface TrMarkdownComponentMap {
  paragraph: Component
  heading: Component
  link: Component
  image: Component
  inlineCode: Component
  codeBlock: Component
  blockquote: Component
  table: Component
  hr: Component
}
```

并通过 composable 生成最终映射：

```ts
const components = useMarkdownComponents()
```

### 为什么必须做标签级组件映射

这一步是从“HTML 注入器”升级成“平台组件”的关键：

- 链接可以统一加 target / rel 策略
- 图片可以接入 TinyRobot 的图片体验
- 表格可以统一包装滚动容器
- 代码块可以进入独立分流逻辑
- 引用块可以有一方视觉语义

## 样式层

### 目标

- 定义 `TrMarkdown` 自己的视觉规范
- 脱离 `markdown-body` 或 GitHub Markdown 的默认心智
- 与 TinyRobot 现有 CSS 变量体系兼容

### 建议类名

- `.tr-markdown`
- `.tr-markdown--default`
- `.tr-markdown--bubble`
- `.tr-markdown__paragraph`
- `.tr-markdown__heading`
- `.tr-markdown__inline-code`
- `.tr-markdown__code-block`
- `.tr-markdown__blockquote`
- `.tr-markdown__table`
- `.tr-markdown__table-wrap`

### 建议变量体系

建议新增：

- `--tr-markdown-font-size`
- `--tr-markdown-line-height`
- `--tr-markdown-text-color`
- `--tr-markdown-heading-color`
- `--tr-markdown-heading-font-weight`
- `--tr-markdown-block-gap`
- `--tr-markdown-paragraph-margin`
- `--tr-markdown-list-margin`
- `--tr-markdown-blockquote-bg`
- `--tr-markdown-blockquote-border-color`
- `--tr-markdown-inline-code-bg`
- `--tr-markdown-inline-code-color`
- `--tr-markdown-code-block-bg`
- `--tr-markdown-code-block-border`
- `--tr-markdown-code-block-radius`
- `--tr-markdown-table-border-color`
- `--tr-markdown-table-header-bg`
- `--tr-markdown-link-color`
- `--tr-markdown-link-hover-color`
- `--tr-markdown-image-radius`

### variant 策略

建议至少支持：

- `default`
- `bubble`
- `article`（可后置）

其中 `bubble` variant 是第一阶段最重要的，因为 TinyRobot 当前主要使用场景就在对话气泡里。

## 代码块专项设计

从 `LobeUI` 的能力看，代码块不能只当普通节点处理。

### 第一阶段建议拆成

- `TrMarkdownInlineCode`
- `TrMarkdownCodeBlock`
- `TrMarkdownCodeFenceResolver`

### 第二阶段可扩展成

- `TrMarkdownMermaidBlock`
- `TrMarkdownHtmlPreviewBlock`

### 设计原因

这样后续可以逐步加：

- copy button
- syntax highlight
- 单行代码压缩展示
- Mermaid 分流
- HTML Preview 分流

## 代码块交互设计

如果目标是对标 `LobeUI` 的代码块体验，那么代码块不仅要“能渲染”，还要具备完整的交互结构。

这意味着后续不应只停留在：

- `TrMarkdownCodeBlock`
- `TrMarkdownCodeFenceResolver`

而应继续细化成一套可扩展的 code block interaction model。

### 设计目标

代码块交互层至少要覆盖这些体验：

- 语法高亮
- hover 时显示工具条
- 工具条内显示复制按钮
- 代码块右下角显示语言标签
- 点击复制后图标切换为对勾
- 一段时间后恢复默认复制图标

### 推荐组件结构

建议把代码块交互拆成下面这些组件：

- `CodeBlock`
- `CodeBlockHeader`
- `CodeBlockToolbar`
- `CopyButton`
- `CodeLanguageTag`

可选扩展：

- `CodeActions`
- `CodePreviewButton`

### 组件职责建议

#### `CodeBlock`

负责：

- 容器布局
- 语言信息透传
- 高亮内容承载
- toolbar 的显隐状态入口
- 与 `bubble` variant 的视觉对齐

#### `CodeBlockHeader`

负责：

- 顶部悬浮或覆盖层
- 容纳 toolbar / language tag

注意：

- 它不应负责高亮逻辑
- 它不应持有复制业务逻辑

#### `CodeBlockToolbar`

负责：

- 承载交互按钮
- 统一 hover / focus visible 行为
- 预留未来 actions，例如：
  - copy
  - preview
  - expand

#### `CopyButton`

负责：

- 点击复制
- 复制状态切换
- 图标与反馈

#### `CodeLanguageTag`

负责：

- 显示语言标签
- 和 toolbar 一起布局
- 根据 variant 切换视觉细节

### 基础 props 草图

建议后续至少具备这些 props：

```ts
interface TrMarkdownCodeBlockProps {
  code: string
  language?: string
  variant?: 'default' | 'bubble'
  highlightedHtml?: string
  copyable?: boolean
  showToolbar?: boolean | 'hover' | 'always'
}
```

其中：

- `code`：原始代码文本
- `language`：语言标签
- `highlightedHtml`：若后续引入高亮，可作为渲染输入
- `copyable`：是否显示复制能力
- `showToolbar`：工具条显隐策略

### toolbar 行为规则

建议明确以下规则：

#### 桌面端

- 默认 `hover` 时显示 toolbar
- `focus-within` 时也显示 toolbar
- 语言标签可常显，也可和 toolbar 同层显示

#### 移动端 / 无 hover 环境

- 不依赖 hover
- 建议：
  - 默认常显
  - 或点击 code block 后显示

不建议移动端仍然沿用“纯 hover 才可见”的设计。

### 语言标签规则

建议：

- **多行 block code** 的语言标签存在于代码块容器内
- 默认位于右下角
- 对标普通 `LobeUI` 模式时，属于 block code 主路径的一部分

而对于 **单行 code path**：

- 不强制显示语言标签
- 保持轻量 snippet 表达

原因：

- 语言是多行代码块的重要结构信息
- 单行路径应优先保持轻量，不应被完整交互污染

### 复制按钮状态机

复制按钮至少应有三个状态：

- `idle`
- `copied`
- `error`

建议状态机：

```ts
type CopyState = 'idle' | 'copied' | 'error'
```

建议行为：

- 初始：显示复制图标
- 点击成功：切换为对勾图标
- 保持 `1.5s ~ 2s`
- 自动回退为复制图标
- 失败时可进入 `error` 状态（可选）

### 状态归属建议

复制状态不应挂在整个 `TrMarkdown` 或 `Bubble` 上，而应局部收敛在：

- `CopyButton`
- 或 `CodeBlock`

原因：

- 它是局部瞬时 UI 状态
- 不应污染全局或上层消息状态

### 高亮与 toolbar 的关系

高亮与交互必须拆开设计。

建议：

- 高亮负责生成“代码内容呈现”
- toolbar 负责“用户交互”

两者之间只通过只读数据连接：

- `language`
- `code`
- `highlightedHtml`

不应让：

- hover 状态
- 复制状态

触发重新高亮或重新生成内容。

### 性能边界

这是后续实现时必须遵守的几条边界：

1. hover 显示 toolbar 只能是纯 UI 状态变化
2. 复制成功切换为对勾不能触发 code 内容重算
3. 高亮结果需要缓存
4. `bubble` variant 的样式变化不应重新高亮
5. 单行 code path 不应被多行 block code 的交互结构污染

换句话说：

> code content 和 code interaction 必须是两条更新路径。

### 推荐实现顺序

建议不要一次性把“高亮 + toolbar + copy + preview”一起实现，而是分两步：

#### 第一步

- `CodeBlockHeader`
- `CodeBlockToolbar`
- `CopyButton`
- `CodeLanguageTag`
- 先用纯文本代码块承接，不上高亮

#### 第二步

- 引入 `Shiki`
- 把高亮结果接入 `TrMarkdownCodeBlock`
- 保持 toolbar 与高亮更新解耦

## Code 模块配置模型

为了把 `inline code`、`single-line fenced snippet`、`multi-line code block` 和高级 code case 统一收口，`TrMarkdown` 需要补一层正式的 code 配置模型，而不是继续把规则散落在 demo 或节点组件里。

### 设计目标

- 默认路径继续走轻量 `highlight.js/core`
- 高级 code case 允许显式切到 `Shiki`
- 多行 block code 支持 `overlay` 与 `full` 两种展示模式
- `Color models` 这类 inline code 增强走正式配置，而不是临时样式补丁
- 自定义 actions 作为 code 子系统扩展点暴露

### 推荐配置草图

```ts
export interface TrMarkdownCodeConfig {
  copyable?: boolean
  showLanguage?: boolean
  inlineColorPreview?: boolean
  blockMode?: 'overlay' | 'full'
  defaultExpand?: boolean
  highlight?: {
    enabled?: boolean
    engine?: 'highlightjs' | 'shiki'
    enableTransformer?: boolean
  }
  actionsRender?: TrMarkdownCodeActionsRender
}
```

```ts
export type TrMarkdownCodeActionsRender = (context: {
  code: string
  language?: string
  originalNode: VNodeChild
}) => VNodeChild
```

### 配置职责

#### `copyable`

- 控制 fenced code 是否显示复制动作
- 默认开启
- single-line snippet 与 multi-line block 共享同一开关

#### `showLanguage`

- 控制语言信息是否显示
- `overlay` 模式下表现为悬浮语言标签
- `full` 模式下表现为 header 左侧语言区

#### `inlineColorPreview`

- 用于 `Color models` 这类 inline code 语义增强
- 对符合规则的 `HEX / RGB / HSL` inline code 追加颜色预览点
- 不影响普通 inline code 路径

#### `blockMode`

- `overlay`：保留轻量悬浮 toolbar 形态，优先服务 Bubble 与紧凑场景
- `full`：对标 LobeUI docs 里的 full-featured code block，具备 header、actions 与折叠结构

#### `highlight.engine`

- `highlightjs`：默认运行时主路径
- `shiki`：高级高亮路径，仅在显式开启时进入

#### `highlight.enableTransformer`

- 仅对高级高亮路径生效
- 用于承接 `Code Diff / Highlight / Focus` 这类注释变换能力

#### `actionsRender`

- 允许在默认 copy 动作之外追加自定义 action
- 用于对标 `Custom Highlight` 这类案例
- 不能反向侵入 parser 或 Markdown 主渲染流程

### 推荐默认值

```ts
const defaultCodeConfig: TrMarkdownCodeConfig = {
  copyable: true,
  showLanguage: true,
  inlineColorPreview: true,
  blockMode: 'overlay',
  defaultExpand: true,
  highlight: {
    enabled: true,
    engine: 'highlightjs',
    enableTransformer: false,
  },
}
```

### 设计决策

- 默认不把 full mode 作为全局默认值
  - 避免直接改变 Bubble 与现有消费方的代码块形态
  - docs / demo code case 再显式切到 `full`
- 默认不把 `Shiki` 回退成主高亮器
  - 保持当前“基础路径轻，高级路径显式开启”的策略
- `Color models` 视为 code 模块正式能力
  - 不是 demo 专用 patch
  - 不是依赖 `v-html` 的特例处理

### 当前这轮实现目标

本轮 code 模块收敛按下面顺序推进：

1. 补 `TrMarkdown` 的 code 配置模型
2. 补 `single-line snippet` 路径
3. 补 `full` 模式多行 code block
4. 补 inline `Color models`
5. 补 `Shiki Transformers` 与 `Custom Highlight` 的高级路径
6. 回填 demo / test / 文档闭环

### 当前落地状态（2026-05-30）

本轮已落地到源码的部分：

- `TrMarkdownProps.code` 已成为正式配置入口
- code path 已分成：
  - inline code
  - single-line fenced snippet
  - multi-line fenced code block
- 多行 block code 已支持 `overlay` / `full` 双模式
- inline `Color models` 已作为正式能力落到 `InlineCode.vue` + `markdown.less`
- 高亮策略已收口为：
  - 默认 `highlight.js/core` + 白名单语言
  - 高级 case 显式切到 `Shiki`
  - `Shiki` 走 `core + javascript engine + 语言/主题白名单` 的细粒度动态路径
  - `transformer` 仅在高级路径生效
- `actionsRender` 已作为 code 模块扩展点落地
- `packages/markdown-demo` 已补齐 5 个对标 LobeUI 的 code cases，并由右侧 controls 驱动左侧热更新
- `packages/markdown-demo` 已切到 markdown / theme-provider 专项入口，不再误走组件库总入口
- demo 重 case 已支持延迟挂载，避免首屏把所有 code 案例同时 mount
- `packages/test` 已补 code 专项回归页和 Playwright 断言
- `highlight.js` 路径在主题切换时不再重复触发无效重高亮
- `TrMarkdown` parse watch 已收敛为稳定 key，避免结构型 props 变更导致不必要重 parse
- 无 `ThemeProvider` 场景下的 `useTheme` inject warning 已抑制，减少测试与异步高亮噪音

对标 LobeUI 本地源码后，这一轮明确吸收的策略是：

- `Pre.tsx` 把 `PreSingleLine` 与完整 `Pre` 分开，TinyRobot 对应落实为 single-line snippet 与 multi-line block 分流
- `Highlighter.tsx` / `FullFeatured.tsx` 把 copy 内容和 actions 包在稳定边界里，TinyRobot 对应把 copy / toolbar / collapse 与高亮输出拆开
- `fullFeatured` 是显式模式而不是默认模式，TinyRobot 对应落为 `blockMode: 'overlay' | 'full'`
- LobeUI docs 本身就是“预览 + 控制”的专门体验，TinyRobot demo 对应改成分文件案例 + 左预览右控制面板

本轮验证已完成：

- `pnpm -F @opentiny/tiny-robot type-check`
- `pnpm -F @opentiny/tiny-robot build`
- `pnpm -F @opentiny/tiny-robot-markdown-demo type-check`
- `pnpm -F @opentiny/tiny-robot-markdown-demo build`
- `pnpm -F tiny-robot-test test -- src/markdown/index.spec.ts`
- demo 浅色 / 暗色模式页面截图核对
- `packages/components` 构建结果：`514 modules transformed`
- `packages/components/dist/markdown/index.js`：`35.98 kB / gzip 8.73 kB`
- `packages/markdown-demo` 构建结果：`267 modules transformed`
- `packages/markdown-demo` 构建日志已不再出现 large chunk warning

当前残余风险：

- `Shiki` 高级路径仍会生成若干按需语言 / 主题 chunk，但当前已经收敛到显式白名单，不再是整包扩散
- 若后续新增 code case 时继续从组件总入口或全量样式入口接入 demo，体积与首屏渲染时间会再次回涨
- 当前尚未把 Markdown 构建指标接入自动化预算门禁，后续可能需要补回归阈值

### 阶段归属建议

这套交互能力建议归到：

- `M2.5`
- 或 `M3` 早期补强

原因：

- 它已经超出“代码块结构”本身
- 但还没到 Mermaid / Preview / Gallery 这种高级能力层级

## 代码块高亮设计补充

当前建议把代码块高亮分成两层：

### 默认高亮方案

默认方案采用：

- `highlight.js/core`

原因：

- 体积更轻
- 可按语言白名单注册
- 更适合作为组件库默认运行时方案
- 与当前 `CodeBlock` 交互壳组合简单

推荐策略：

- 默认只注册少量常用语言，例如：
  - `ts`
  - `js`
  - `json`
  - `bash`
  - `html/xml`
  - `css`
  - `markdown`

### 高级高亮方案

后续若引入 `Shiki`，建议约束如下：

- 默认关闭
- feature flag 开启
- 动态加载
- 仅在 code block 实际出现且启用时进入

建议高亮接口保持中立，例如：

```ts
interface TrMarkdownCodeHighlightResult {
  language?: string
  html: string
}
```

这样可以避免把具体高亮器细节泄漏到整个 `TrMarkdown` API 表面。

## 流式层设计

### 目标

将 AI streaming markdown 视为独立问题，而不是把它混进静态 parser 的正常路径。

### 第一阶段关注的问题

- code fence 未闭合
- link 未闭合
- image 未闭合
- table 未闭合
- 流式尾巴
- 大段闪烁与整段重排

### 推荐模块

- `useMarkdownStreamState`
- `useMarkdownSmoother`
- `useIncompleteMarkdown`

### 推荐策略

第一阶段不追求完整 streaming parser 重写，而是先做：

- smoothing
- incomplete token 的保守展示
- 在 bubble 场景下稳定可读

## API 草图

### 顶层 props

```ts
export interface TrMarkdownProps {
  content?: string
  variant?: 'default' | 'bubble' | 'article'
  parser?: 'markdown-it' | 'unified' | TrMarkdownParserAdapter
  parserOptions?: Record<string, unknown>
  allowHtml?: boolean
  sanitize?: boolean | {
    enabled?: boolean
    config?: Record<string, unknown>
  }
  features?: {
    gfm?: boolean
    breaks?: boolean
    math?: boolean
    mermaid?: boolean
    footnotes?: boolean
    taskList?: boolean
  }
  components?: Partial<TrMarkdownComponentMap>
  link?: {
    target?: '_self' | '_blank'
    rel?: string
  }
  streaming?: false | {
    hasNextChunk?: boolean
    mode?: 'realtime' | 'smooth'
    tail?: boolean | { content?: string }
    incomplete?: 'hold' | 'placeholder' | 'safe-flush'
  }
}
```

### 公开导出建议

- `TrMarkdown`
- `TrMarkdownComponentMap`
- `TrMarkdownParserAdapter`
- `TrMarkdownProps`
- `useMarkdownContext`

## Bubble 集成设计

### 第一阶段

- 保留 `BubbleRenderers.Markdown`
- 但其内部直接渲染 `TrMarkdown`
- 不再在 `BubbleRenderers.Markdown` 中最终 `v-html`

### 第二阶段

建议引入显式内容类型：

```ts
{ type: 'markdown', text: string }
```

对应默认匹配规则：

```ts
{
  find: (_, content) => content.type === 'markdown',
  renderer: markRaw(BubbleMarkdownRenderer),
  priority: BubbleRendererMatchPriority.CONTENT
}
```

### 配置传递建议

不建议继续依赖 `BubbleProvider.store.mdConfig` / `dompurifyConfig` 这类弱类型入口。

更推荐通过：

- `BubbleProvider.contentAttributes`
- `BubbleContentRendererMatch.attributes`
- `BubbleRenderers.Markdown` 显式 props

来给 `TrMarkdown` 透传配置。

### 样式桥接建议

Bubble 场景应通过变量桥接，而不是复制完整样式：

```css
.tr-bubble__markdown {
  --tr-markdown-font-size: var(--tr-bubble-text-font-size);
  --tr-markdown-line-height: var(--tr-bubble-text-line-height);
  --tr-markdown-text-color: var(--tr-bubble-text-color);
}
```

## Vue 实现建议

### 组件风格

- Vue 3
- Composition API
- `<script setup lang="ts">`

### 数据流建议

- 顶层 props 作为输入源
- provider / inject 管理上下文
- composables 负责复杂逻辑
- 子组件只关心节点级渲染

### 为什么不建议第一阶段直接切 unified

不是 unified 不好，而是当前 TinyRobot 最迫切的问题是：

- 要先摆脱最终 `v-html`
- 要先建立节点组件化和样式规范
- 要先把代码块和 bubble variant 做出来

所以第一阶段更适合：

- 保留 `markdown-it`
- 把控制权收回到第一方 renderer

等基座稳定后，再评估是否补 unified adapter。

## 分阶段演进

### Phase 1

- 建立 `TrMarkdown` 目录骨架
- 完成静态基础渲染
- 建立样式变量体系
- 提供 `bubble` variant

### Phase 2

- 建立代码块专项子系统
- 将 `BubbleRenderers.Markdown` 接入 `TrMarkdown`
- 补充显式 markdown 内容类型建议

### Phase 3

- 建立流式 markdown 分支
- 处理不完整 token 和 smoothing

### Phase 4

- Mermaid
- LaTeX
- Footnotes
- HTML Preview
- 图片 Gallery
- 自定义块节点

## 与其他文档的边界

本文档只负责“怎么设计”。

不负责：

- 外部库调研细节
- 里程碑进度跟踪

对应职责为：

- 调研： [Markdown 渲染调研](/guide/markdown-rendering-research)
- 跟踪： [Markdown 渲染 Roadmap](/guide/markdown-rendering-roadmap)
