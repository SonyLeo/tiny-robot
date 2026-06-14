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

- 调研： [Markdown 渲染调研](/guide/archive/markdown/markdown-rendering-research)
- 设计： [TrMarkdown 设计方案](/guide/markdown-rendering-design)
- 流程： [Markdown 渲染开发流程](/guide/archive/markdown/markdown-rendering-process)
- 路线图： [Markdown 渲染 Roadmap](/guide/markdown-rendering-roadmap)

> 维护说明（2026-06-08）
>
> 这份文档当前降级为历史 Spike 参考。
> 若 Spike 结论与现行实现冲突，应以 design / roadmap 中的最新收口结论为准。

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

## M4 当前开工基线（2026-05-30）

在 `M0`、`M1`、`M2` 以及 Bubble markdown 集成收口后，`M4` 的重点不再是“换一个 markdown 组件”，而是先把 AI 流式输出中最容易感知的稳定性问题拆出来单独处理。

### 这轮先做什么

只做第一批最容易让用户感知到“闪一下 / 跳一下 / 整段重排”的问题：

- 未闭合 code fence
- 未闭合 link
- 未闭合 table
- 尾部 token 追加时的 block 稳定性

### 这轮明确不做什么

- 不补 `mermaid / math / alerts / footnotes`
- 不把静态渲染主路径切换到另一套底层
- 不在第一步就追求完整 token-level diff

### M5 起手顺序补充说明

当前 `M5` 的第一阶段已调整为 `HTML Preview`，不是 `Mermaid`。

原因很简单：

- HTML Preview 能更早验证安全隔离、显式开关和默认路径零污染
- 它直接复用 code 子系统，切入面比 Mermaid 更小
- 先把 preview 的门禁跑通，再进入 Mermaid / KaTeX，会更稳

### 当前建议的最小执行顺序

1. 固定两组流式 fixture：
   - `streaming-basic.md`
   - `streaming-code.md`
2. 在 `packages/components/src/markdown/stream/` 下建立最小模块草图：
   - `useMarkdownStreamState.ts`
   - `useMarkdownSmoother.ts`
   - `useIncompleteMarkdown.ts`
3. 先基于现有 `TrMarkdown` 静态链路做“尾部稳定输出”实验
4. 如果自建 smoothing 成本过高，再回到 `streamdown-vue` / `Comark` 做第二轮对照 Spike

### 当前判断

现阶段最稳妥的策略是：

- 保持 `TrMarkdown` 静态路径不动
- 把 streaming 当作单独分支
- 先验证“增量稳定性”这件事本身

这样做的好处是：

- 不会把流式复杂度传播给所有 markdown 场景
- 能更清楚地衡量 `streamdown-vue` / `Comark` 的真实收益
- 可以先拿 TinyRobot 自己的 AI 输出场景做基准，再决定是否引入新依赖

## M4 第一阶段实现结论（2026-05-30）

在按上述基线推进后，当前可以确认：

- 这轮 `M4` 没有引入新的默认依赖
- 当前正式实现继续建立在现有 `TrMarkdown` 静态链路之上，而不是切换到底层新库
- 第一阶段已经落地的模块为：
  - `stream/useMarkdownStreamState.ts`
  - `stream/useMarkdownSmoother.ts`
  - `stream/useIncompleteMarkdown.ts`
  - `components/stream/StreamTail.vue`
- 当前策略已经验证有效的点：
  - text tail smoothing
  - incomplete link hold
  - incomplete code fence hold
  - incomplete table hold
  - parser 仅在 `stableContent` 变化时重跑

这说明当前最小第一方 streaming 分支已经足以完成 `M4` 第一阶段，不需要为了当前范围立即把 `streamdown-vue` 或 `Comark` 引入默认实现。

后续若要再评估外部 streaming 底层，更适合等下面这些问题真正成为瓶颈后再做第二轮 Spike：

- queue / scheduler
- 更细粒度 token diff
- 更复杂的 block merge / paragraph continuation

## M4 第二阶段对照结论（2026-05-30）

对照本地 `LobeUI` streaming 源码后，可以进一步确认：

- `src/Markdown/SyntaxMarkdown/useSmoothStreamContent.ts`
  - 解决的是 smoothing preset、输入压力和特定 fenced language bypass
- `src/Markdown/SyntaxMarkdown/useStreamQueue.ts`
  - 解决的是 block reveal / char fade 的动画调度
  - 前提是 `rehypeStreamAnimated.ts` 已把文本拆成 `.stream-char`
- `src/Markdown/SyntaxMarkdown/StreamdownRender.tsx`
  - 采用的是“smoothed content -> block re-lex -> birth map / animation meta”这条链路
  - 并不存在一层独立的 parser 级 token diff 系统

这意味着对 TinyRobot 当前第一方 streaming 路线，更合理的第二阶段收口是：

- 补 `incomplete image`
- 补 `LobeUI streamingAnimationRepro` 对标 demo case
- 保持 `queue / scheduler` 与 parser 级 token diff 继续留在后续 Spike，而不是强行塞进当前默认实现

## M4.5 基础库与实现策略 Spike（2026-05-30）

在这轮继续深度对标 `LobeUI` streaming 体验前，当前已经补做了一轮“基础库层”的缩窄验证。

目标不是再找一套能整体替换 `TrMarkdown` 的大框架，而是确认：

1. 有没有可以直接补到现有第一方实现里的小型基础库
2. 哪些库值得复用，哪些库会导致重复造轮子变成“重复引入大轮子”

### 当前已经冻结的结论

#### 直接复用

- `@vueuse/core/useRafFn`
  - 组件包当前已存在依赖
  - 适合作为 streaming animation 的主循环调度
  - 不需要额外引入新的通用动画框架
- `unicode-segmenter`
  - 组件包当前已存在依赖
  - 适合作为 grapheme 切分底层
  - 能避免 emoji / 合字在字符动画里被错误拆分

#### 小依赖备选

- `fast-array-diff`
  - 只解决 top-level block array 的 diff / patch
  - 职责单一，适合作为后续 `useStreamBlockDiff` 的可选实现加速件
  - 当前先不默认引入，等手写 block patch 复杂度真正升高后再决定

#### 延后评估

- `framesync`
  - 如果后续动画循环真的需要更细的 read/write phases，再单独评估
  - 目前 `useRafFn` 已经足够
- `@sanity/diff-match-patch`
  - 更适合 rewrite / reset 较多的文本改写场景
  - 当前 streaming 主场景仍然以 append-first 为主
- `micromark` / `mdast-util-from-markdown`
  - 值得尊重，适合未来 parser 基座升级 Spike
  - 但不属于这轮“避免重复造轮子”的最小加速件

#### 当前不采用

- `motion` / `motion-v` / `@vueuse/motion`
  - 更偏通用 UI 动画
  - 对 markdown streaming 来说过重
- `Splitting.js`
  - 适合静态 DOM 文本动效
  - 不适合 Vue 渲染树驱动的 streaming markdown
- `marked`
  - 虽可作为 block lexer 参考
  - 但当前主链路已经是 `markdown-it -> IR -> render`
  - 这轮不引入第二套 parser，避免语义漂移

### 为什么不直接继续引现成 streaming markdown 库

因为这轮的目标已经从“证明 streaming markdown 是否可行”变化为：

- 保留当前 `TrMarkdown`
- 在现有 `M4` 基线之上补 reveal queue 和 text animation

这意味着我们真正缺的不是：

- 整套 markdown renderer
- 新的 code block 系统
- 新的 theme / provider

而是：

- RAF 调度
- grapheme 切分
- block diff / queue

### `M4.5` 当前建议实现路径

建议把 `M4.5` 收敛为：

1. 继续复用当前 `stableContent + tailContent + incomplete hold`
2. 在 parse 后的顶层 `TrMarkdownRenderNode[]` 上做 block diff
3. 补 reveal queue
4. 只对文本类 block 做字符淡入
5. code / table / image 继续保持跳过

### 当前方案缺口分析

在再次对照 `LobeUI` 本地源码后，当前 `M4.5` 方案如果不补这些缺口，直接进入实现会有较高返工风险：

#### 1. 缺少 block identity

`LobeUI` 的 block queue 依赖 block `raw + startOffset`。

而 TinyRobot 当前：

- `TrMarkdownRenderNode` 没有 source range
- 顶层渲染还没有 streaming 专用稳定 key 契约

这意味着我们必须先补一层 stream-only block model，再谈 reveal queue。

#### 2. 缺少 finalize / settle 契约

`LobeUI` 的动画并不是一直挂着，它会在 block settled 后回到 revealed 状态。

TinyRobot 当前方案若不补：

- stream 结束后的 settle window
- settled 后回落 plain text DOM

就容易长期残留 `.stream-char`，也不利于控制 DOM 数量。

#### 3. 缺少 rewrite / reset 的正式策略

当前 `M4.5` 的现实目标仍然是 append-first。

所以方案必须明确：

- append：沿用当前 queue
- rewrite：hard reset，重建 timeline

否则实现时很容易一边做 queue，一边又被 rewrite 场景拖进 token diff 复杂度。

#### 4. 缺少 skip matrix

当前不能只写“code / table / image 跳过”，还必须把：

- inline code
- task checkbox
- raw html / preview
- 后续 mermaid / math

都提前写成固定矩阵。

#### 5. 缺少可观测性

`LobeUI` 有 repro 和 profiler，这对调 `skipped@birth`、`revealedLive/totalLive` 很关键。

TinyRobot 当前也需要至少在 demo / test 场景里补：

- queue 长度
- live span 数量
- rewrite / reset 次数
- parse count

### 这轮 Spike 的结论

如果只看“少造轮子、少引大框架、又能加速实现”的目标，当前最合理的组合是：

- `@vueuse/core/useRafFn`
- `unicode-segmenter`
- `fast-array-diff`（仅备选）

这比再接一套新的 markdown renderer 或通用动画框架，更符合 TinyRobot 当前 `M4.5` 的边界。

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

在 `M4` 第一阶段和第二阶段完成后，下一步更合理的是：

1. 维持当前第一方 streaming 分支，不替换主线 renderer
2. 进入 `M4.5`，先补：
   - block diff
   - reveal queue
   - text-only animation
3. 保持 `token-level diff`、更重的 parser 升级和通用动画框架继续停留在后续 Spike

### 2026-05-31 后续更新

本轮 Spike 的原始结论仍适用于“不要在 `M4.5` 起步阶段先替换 parser 或引入重型 diff 框架”。后续正式实现中，TinyRobot 已在不新增依赖的前提下补入轻量 token rewrite patch 与 token scheduler：

- 基于 `unicode-segmenter` 的 grapheme 切分
- 同 block rewrite 时生成 `equal / insert / delete / replace` patch segment
- `equal` segment 复用旧 birth timeline
- block 数量、type 或 tag 变化仍进入 hard reset

### 当前 P0 收口边界（2026-05-31）

- `M4.5` 的 profiler 事件语义已扩展到 root / block / frame / token 级别，但仍只作为观测和回归门禁，不代表引入了跨 block / parser diff
- `timeline` 面板已补 root commit / block commit / FPS / frame cost 观察面，但仍属于 P0 可视化，不是新的 diff 引擎
- `token patch` 仅覆盖同 block 内的 rewrite 复用，跨 block / parser 级 token diff 仍然只属于后续 Spike

因此当前剩余的 Spike 项已从“是否做 rewrite patch / 是否补 root-block profiler”收缩为：

- 是否继续细化 root commit / block commit 级 profiler 的采样精度和可视化布局
- 是否继续细化 profiler 面板的时间轴、frame duration、commit cost 与 FPS 采样
- skipped-char profiler 是否需要按节点类型、字符数量和 block state 继续分桶

## 后续 Spike：跨 block / parser 级 token diff

### 定位

这不是当前 `M4.5` P0 的完成门槛，而是未来如果继续深挖 streaming rewrite 体验时的专项 Spike。

当前 `M4.5` 已经做的是“同 block token patch”：在同一个稳定 block 内，按 grapheme 识别 `equal / insert / delete / replace`，并复用未变字符的 birth timeline。

跨 block / parser 级 token diff 要解决的是更重的一类问题：

- 段落被模型改写后拆成两段
- 两个段落被模型合并成一段
- list / blockquote / heading 在 rewrite 中发生结构变化
- 旧 block 的内容移动到新 block
- parser token 与 render node 的 identity 需要跨 parse 保持稳定

### 为什么不进当前默认主线

- 会把 streaming 动画从 render 层推进到 parser / AST 层，影响范围明显扩大
- 需要更完整的 source range、token identity 和 block merge / split 规则
- 会和后续 `M5` 的 mermaid / math / alert / footnotes 等高级节点互相影响
- 对大多数 AI append-first 输出场景收益有限，但实现和验证成本高

### 方案草图

#### Phase 1：source map 与 token identity Spike

- 为 `markdownItAdapter` 输出更稳定的 source range
- 建立 `StreamTokenIdentity` 草图：
  - `sourceStart`
  - `sourceEnd`
  - `nodeType`
  - `tag`
  - `textFingerprint`
- 对比当前 `TrMarkdownRenderNode.position` 是否足够承接跨 parse diff

#### Phase 2：block split / merge diff Spike

- 基于顶层 block 建立 diff 输入：
  - previous blocks
  - next blocks
  - source range
  - normalized text
- 验证三类操作：
  - split：一个 paragraph 变成两个 paragraph
  - merge：两个 paragraph 合并成一个 paragraph
  - move：同一段文本位置发生移动
- 判断是否需要引入 `fast-array-diff` 或保留手写 diff

#### Phase 3：parser-aware token patch Spike

- 在 block diff 之上继续做 token patch：
  - text token patch
  - inline mark boundary patch
  - link text patch
- 明确继续跳过：
  - code block
  - table
  - image
  - raw html
  - future mermaid / math / alert

#### Phase 4：验证与门禁

- demo case：
  - paragraph split
  - paragraph merge
  - list item rewrite
  - heading to paragraph
  - paragraph to blockquote
- test case：
  - preserved token count 不应为 0
  - split / merge 不应误触发全局 reset
  - 结构类型变化仍应 hard reset
- 性能门禁：
  - diff 只作用于 streaming animated 路径
  - 默认 static / basic streaming 路径零影响
  - 大文档 rewrite 不应出现明显长任务

### 建议结论

短期不做。

等 `M4.5` P0 的事件语义、timeline 面板、token patch 回归、文档边界收口后，如果真实业务中频繁出现“模型跨段落重写”的体验问题，再启动这个 Spike。
