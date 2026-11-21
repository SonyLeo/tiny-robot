---
outline: deep
---

# TrMarkdown 当前设计

本文记录 TinyRobot Markdown 的当前架构决策、职责边界、用户体验契约和实现约束。实施顺序、阶段任务与验收门禁见 [Markdown 实施路线](/guide/markdown-rendering-roadmap)。本文以 `feat/markdown-comp` 当前实现和 2026-11-22 技术评审为基准；代码与本文冲突时，应先确认代码是否有意改变契约，再同步更新本文和路线图。

## 产品目标

`TrMarkdown` 是 TinyRobot Vue 组件库的第一方 Markdown 视图层，服务独立组件和 Bubble 消息。用户只提供 Markdown 内容及少量场景选项，就应获得统一、易读、安全、适合 AI 回答的默认输出。组件库负责默认排版、交互、主题适配、能力开关和流式行为；业务可以通过受控组件映射与 token 定制真实需求，但不应被迫自行挑选 renderer、重写 Markdown CSS 或分别接入代码块、公式和图表。

对标 LobeUI 的对象是体验与能力完整度，不是 React 实现、DOM 结构或所有默认视觉。可见差异应通过同语料截图确认。解析器选择主要影响语法正确性、节点语义和扩展成本；CSS、组件结构、主题值与交互状态才直接决定大部分外观。

### 成功标准

- 独立 `TrMarkdown` 与 Bubble Markdown 在同一变体和主题下遵循同一套默认排版与组件行为。
- AI 常见回答在静态、生成中、重写和完成后均语义正确，没有旧内容残留或临时解析状态泄漏。
- Markdown 节点由 Vue 组件渲染，代码块、媒体和增强能力有清楚的默认交互与可访问状态。
- 不启用的重型功能不进入初始同步执行路径；新增依赖需证明其减少的维护或改善的行为大于加载、升级与安全成本。
- 功能、视觉、性能和安全都有可重复的测试语料，不以单一 demo 截图或“感觉更好”作为验收。

## 当前架构

主数据流如下：

```text
content + public options
  -> streaming state (stable content + temporary tail)
  -> markdown-it parser adapter
  -> TrMarkdownRenderNode[]
  -> citation/node transforms
  -> Vue node and feature components
  -> themed DOM
```

animated 模式在解析稳定内容后继续经过 block diff、reveal queue、token scheduler 和文本动画。非文本节点遵循明确的跳过或独立呈现策略。基础流式模式与动画流式模式是同一解析语义上的两种呈现策略，不得引入另一套静态/流式 Markdown 语法解释器。

### 职责划分

| 层 | 当前职责 | 主要位置 |
|---|---|---|
| 公共组件/API | props 默认值、能力配置、上下文、独立/Bubble 共用入口 | `TrMarkdown.vue`、`index.type.ts`、`context.ts` |
| 输入与流状态 | stable content、临时 tail、未完成结构 hold、平滑边界 | `runtime/useMarkdownStreamStateRuntime.ts`、`stream/useMarkdownStreamState.ts`、`useIncompleteMarkdown.ts`、`useMarkdownSmoother.ts` |
| 语法解析 | markdown-it 规则/插件及 token 到 TinyRobot 节点的转换 | `parser/markdownItAdapter.ts`、`parser/*Plugin.ts` |
| 内部节点协议 | parser 与 Vue renderer 之间的当前约定 | `TrMarkdownRenderNode`，定义于 `index.type.ts` |
| 渲染 | 按节点类别分发到语义组件，集中处理默认与覆盖组件 props | `utils/render.ts`、`utils/renderers/*`、`NodeRenderer.ts` |
| 高级呈现 | 代码围栏、HTML 预览、Mermaid、KaTeX、脚注、alerts、图片 gallery、citation | `components/*`、`utils/*` |
| 主题和排版 | TinyRobot theme tokens、Markdown 私有 CSS variables、default/bubble/article 变体 | `styles/markdown.less`、主题 provider |
| 质量面 | 组件契约、集成 smoke、固定 fixture、演示及性能观测 | `packages/test/src/markdown-ct/*`、`packages/test/src/markdown/*`、`packages/markdown-demo/*` |

`TrMarkdownParserAdapter` 目前是实现插槽，不是成熟稳定的任意 parser 扩展协议。适配器必须产生 renderer 认得的当前节点协议。未通过真实第二实现验证前，不把内部节点协议升级为公共通用 IR，不为理论上的多 parser 提前增加版本、能力协商或通用插件面。

## 技术选择

### Markdown 解析

当前保留 `markdown-it` 和 `markdown-it-footnote`。markdown-it 有稳定的 token、插件和规则边界，足以承载现有组件映射。它不负责输出视觉，也不提供 AI 增量/重写语义。更换 parser 需要逐项迁移 GFM 细节、脚注、数学、任务列表、媒体、自定义语义块、位置数据、引用变换、安全和回归语料。

默认 adapter 只在稳定源文、adapter 本身或有效语法配置变动时重新解析；数学和脚注的展示配置不影响语法开关。自定义 adapter 按完整有效 options 变化更新。引用元数据通过最近一次解析成功的原始节点单独计算，主题及展示选项也独立更新。解析仍按调用创建实例，便于保持文档状态隔离。

**只有出现硬需求才评估 Unified/remark/rehype 或 Comark。** 例如：现有生态缺少无法合理补齐的必需语法、多个内容来源必须共享 mdast/hast transforms，或服务端预解析文档能实测改善首屏。React 的 `react-markdown` 不能直接作为 Vue renderer。

生产依赖声明、实际安装版本、lockfile 和发布边界必须一起审查。当前源分支的 `packages/components/package.json` 仍声明 `markdown-it` `^14.1.0`，而外部调研讨论过 15.x。不要把上游最新版的修复算作当前消费方已获得的修复；版本升级需检查 breaking changes、安全公告、peer 范围、lockfile 和消费构建。

### 流式语义

流式状态被拆成四类问题，分别设计和验证：

1. **临时语法呈现：** 未闭合的结构可以暂缓进入正式节点树，或通过仅用于预览的补全字符串呈现。
2. **增量成本：** 何时重解析、如何稳定节点身份、是否缓存已完成区块，由实际 profiler 数据决定。
3. **重写正确性：** 非前缀更新、插入、删除和整体替换必须使受影响状态失效；正确性优先于复用缓存。
4. **完成态收敛：** `active=false` 时以原始、未补全内容执行正式解析；输出必须与同一原文一次性静态解析一致。

当前实现通过 `stableContent` 与独立 `StreamTail` 隔离未完成内容，支持 link、image、table、code fence 等 hold，并提供 basic 与 animated 模式。`useIncompleteMarkdown.ts` 和 `useMarkdownSmoother.ts` 共用围栏扫描规则，识别行首围栏并保留原始输入偏移；最终 Markdown 语义仍由 parser 判定。系统要求减少动态效果时，流式内容使用基础呈现并保留 tail 和 active 状态。公开调研中的 `remend` 只作为临时语法预处理候选，不是 sanitizer、block cache、rewrite engine 或完整 renderer。若尝试，必须处理补全占位 URL，且 finalized 绝不解析补全结果。

不得因为“按块缓存”看似更快就直接引入哈希缓存。文档级引用定义、脚注、前置 HTML、表格结构等可能影响先前区块。优化前先量测 parse count 和 parse cost；若采用缓存，必须证明依赖边界，非 append 更新采用保守失效。

### 代码高亮与代码块

普通代码高亮通过引擎接口独立于 Markdown parser。当前默认 Highlight.js，可选 Shiki，语言/主题按需加载。新代码等待着色时立即显示原文；同一源码等待主题或引擎变化时可继续显示原有高亮。只有最新请求能更新展示，禁用和卸载使等待中的请求失效。当前已实现 Highlight.js 的按需子语言列表较窄，Shiki 有单独白名单；“支持 Shiki”不等于每种常见语言已正确高亮。语言覆盖、主题、token engine、代码块容器和工具栏是不同变量。

先比较现有 Highlight.js 主题、调优后的 Highlight.js 与现有 Shiki 路径；同容器、同字体、同代码、同主题背景评估可读性，再量测首次文本可见、完成着色时间和实际消费构建的异步 chunk。只有产品明确要求生成过程中高亮增长中的代码块，才评估 `@shikijs/stream` 的 token recall 协议；它不处理整篇 Markdown 流式状态。

代码节点按交互分型：短代码/snippet、普通多行代码、完整交互代码块、Mermaid、HTML document preview。普通块默认提供合理的语言标识和复制能力；高级交互不得令短代码产生不必要的大面板。生成中的未闭合代码块先按 plain tail 展示、完成后高亮是当前可接受基线；若体验验证需要连续高亮，再独立试验流式 token renderer。

### 视觉与主题

Markdown 的视觉基线属于产品契约，不是下游项目的自由拼装选项。正式默认值应在 `TrMarkdown` 的 default/bubble/article 场景中定义，demo 展示这些默认值；除非 demo 是展示某一明确配置，不得注入一套与产品默认不同的字号、标题比例或间距后把它当作标准效果。

- `default`：通用内容展示。
- `bubble`：聊天密度，使用正文/标题/段落/代码组合的协调比例。
- `article`：更舒展的阅读排版。
- CSS variables 只作为少数有稳定语义的主题/密度 token。组件库要规定默认值；不把每个 CSS 细节都升级成公共 prop。
- 视觉回归覆盖独立与 Bubble、light/dark、桌面/窄屏、普通及高级节点、流式完成前后。
- LobeUI 截图仅用于对照，不照搬 Ant Design token 或认为 CSS-in-JS 天生优于 Less。

截图比较分两层：双方原生默认视觉用于参考设计；统一基础 token 后用于隔离节点结构/能力差异。主题字体、容器宽度、line-height、标题比例和间距须固定，避免变量污染。

### 安全

- raw HTML 默认为关闭。开启后通过 DOMPurify 净化并以受控节点路径呈现；不要把 raw HTML 直接透传到 `v-html`。
- 如果 sanitization 后仍有其他会生成/改写 HTML 的处理步骤，sanitizer 必须位于最终 DOM 注入边界或对最终输出再次验证。
- fenced HTML preview 使用 sandbox iframe，不与 Markdown DOM 共用执行上下文。更改 sandbox token 必须有安全评审及 XSS/导航测试。
- URL 协议对 links、images、audio/video、补全产生的临时链接分别验证；未知或危险协议按文本/禁用链接降级。
- KaTeX `trust` 不因内容渲染失败而打开；资源限制保持明确。Mermaid 保持安全模式，不为解决图表兼容问题放宽 security level。
- 安全语料是任何 renderer/预处理候选的一票否决门禁。

## 公共 API 边界

公开 props 和导出都视为长期 API。新增能力前先从真实调用方需求出发，不为了第三方 API 镜像而公开全部选项。

- `content`、`variant`、`streaming`、`features`、`code`、`link` 是第一方使用入口。
- `components`、`componentProps` 是受控的标签/节点展示覆盖，不等同于任意 parser plugin API。
- `renderOptions` 仅开放已有稳定调用场景支撑的 render hook。
- `parser` 输出须遵守当前 `TrMarkdownRenderNode` 协议；文档明确这是当前适配契约。
- `useMarkdownContext` 为公开响应式读取接口，改动要覆盖 consumer prop 更新。
- Bubble 是适配层，Markdown 的解析状态、私有配置和功能事实应留在 Markdown 子树。不得为正常 Markdown 迭代修改 Bubble 通用核心。
- root `data-stream-*` summary attrs 有 CT/E2E 消费者；除非有迁移计划，不删除、不扩张成无约束的 profiler 协议。

## 性能与发布边界

- 先区分核心路径和按需高级功能；Mermaid、KaTeX、Shiki、Highlight.js 子语言等不得无意进入不需要它们的初始 chunk。
- 每个高级功能核对源码 dynamic import、Vite/Rollup external 和最终 consumer build，不能仅依据源码里有 `import()` 就宣称发布包已按需。
- 解析性能通过 parse count、单次耗时、输入长度及节点数记录；生产逻辑不依赖 profiler telemetry。
- 对更新频率高的场景，分别量测 parser、highlight、DOM patch 和动画调度，定位瓶颈后再缓存/节流。
- 上游包体积页面、npm unpacked size 不等于 TinyRobot 实际 gzip。选型报告必须注明构建配置、入口和异步 chunk 触发点。

## AI 辅助开发约束

Markdown 维护会逐步增加自动化开发的比例，因此代码、API 和验证入口都应让正确实现更容易复用、错误实现更容易被发现。规则文件用于解释目标和需要判断的边界；可确定的行为优先落实为代码级约束。

- 每次修正 Agent 或开发者的错误时，判断它是否代表可重复的失败模式。若是，为其增加最小回归测试、类型约束、lint/依赖规则或更窄的 API；若只是单次特殊场景，不要把偶然修正提升为无条件规则。
- 优先修根因和消除歧义；测试错误输入与边界状态，不只测试理想路径。错误提示应指出受违反的不变量或建议的修复方向。
- 状态交互应先写状态/转换表；如状态较多或涉及用户可见流程，补状态图，再按转换表建立测试。图用于审阅和沟通，自动化测试才是可执行契约。
- 代码审查同时看验证产物：相关 CT/E2E 结果、关键状态截图或录屏、性能/包体数据、安全 fixture 结果。产物应能对应到具体场景和代码变更，不以“Agent 说已验证”替代结果。
- 文档用于说明为什么、阶段顺序和未覆盖限制。已有测试或静态规则能表达的事项，不应只记在 Markdown 文档或 AGENTS.md 中。
- 留下简洁且长期有效的注释，说明非显然算法不变量、安全边界或不易从代码推断的决策原因。禁止为了规避过期风险而一概禁用注释；不要用注释为临时绕过架构的代码背书。
- lint、类型规则和架构禁令应针对仓库中已观察到的反复错误，并提供合理替代方式。不要因为某次 Agent 选错 API 就全局禁用该 API。

对 `TrMarkdown`，优先将这些原则应用于围栏扫描、异步高亮请求、parse invalidation、节点语义映射和 stream lifecycle。每项实施后要留下对应测试或验证产物，避免把个案修补成只有文字描述的“规范”。

## 当前需处理的实现缺口

路线图以源码复核后再关闭以下事项：

1. 生产默认样式要与演示页相符；bubble 标题比例与常见输出内容密度需基于对照截图定标。
2. 默认 renderer 必须保留语义属性：有序列表 start、表格单元格 alignment 等不能在 token→node 或 node→Vue 映射途中丢失。
3. 默认 highlight 语言表对 Python、SQL、YAML 等常见 AI 输出覆盖不足，需由目标语料确定清单。

这些是实现清单，不构成承诺所有行为已有回归失败；路线逐项定义验证方式。

## 不做的事

- 不因视觉差异而先换 parser；不为对齐 React 技术栈而引入 Unified 全家桶。
- 不在静态路径和流式路径使用语义不一致的两个 Markdown parser。
- 不直接采用完整 Vue Markdown renderer 作为 TinyRobot 默认 UI，除非它在统一主题、语义、安全、SSR、体积和维护门槛上全面胜出。
- 不默认引入 Comark、Markstream、`streamdown-vue` 等候选；仅通过独立原型证明具体收益后再决策。
- 不在未经 CJK/货币/嵌套语料验证时让 remend 改写正式内容。
- 不为了体验连续而给每次流式代码追加同步运行完整 Shiki，也不将 `@shikijs/stream` 误作 Markdown stream engine。
- 不预先建设通用 IR、通用插件平台、AST diff 或缓存框架。

## 维护规则

架构、公共边界和当前实现契约写在本文；阶段顺序、工作项状态、实现步骤和验收写在 [Markdown 实施路线](/guide/markdown-rendering-roadmap)。组件 API 使用方式写在 [Markdown 组件文档](/components/markdown)。历史调研 HTML 可作为候选线索，不能覆盖仓库当前 manifest、测试或源码事实。新发现的实现与本设计冲突时，先记录差异和目标决定，再同步文档和测试。
