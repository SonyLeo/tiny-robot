---
outline: deep
---

# Markdown 渲染 Roadmap

本文档基于 `LobeUI` 的完整 Markdown 能力面，为 TinyRobot 建立一份可跟踪的实现路线图。

它的用途不是替代调研文档，而是：

- 作为后续实现推进的能力清单
- 作为阶段拆分和优先级排序依据
- 作为团队对齐“先做什么、后做什么、做成什么算完成”的跟踪板

历史调研、Spike 和测试迁移过程已归档到 [Markdown 归档](/guide/archive/markdown/)。

## 文档职责与维护约定

当前这组 markdown 文档按下面方式收口维护：

- 设计真相源： [TrMarkdown 设计方案](/guide/markdown-rendering-design)
- 进度与任务真相源：当前这份 roadmap
- 调研与历史判断： [Markdown 归档](/guide/archive/markdown/)

`checklist / process / spike / fixtures / testing migration / codeblock report` 继续保留在归档目录，但不再各自维护一份最新进度快照。

## 当前阻塞与收口优先级（2026-06-14）

在最新一轮修复与测试迁移后，上一批公共契约问题已经完成代码与 CT / E2E smoke 验证。当前不再把 raw HTML、HTML Preview streaming 主链路、context 响应式、HTML Preview source fidelity 视为阻塞项。

补充对齐项：对照 LobeUI 后，当前继续保留 `markdown-it -> TinyRobot render-node -> Vue renderer` 路线，不在本阶段自研 Markdown parser。后续对齐优先学习 provider、组件映射、受控扩展点和 streaming 编排，而不是重写底层 Markdown 语法解析。

1. `P1` 体积与按需加载边界
   - `packages/components` 发布构建已把 Mermaid / KaTeX / Shiki / @shikijs / highlight.js 高级运行时 external 化，避免发布产物生成巨型高级能力 chunk
   - CT / demo 仍可以按 consumer 视角拆分 vendor chunks；临时 bundle budget 脚本已按提交前约定移除，后续如需门禁应另行升级为正式 CI 检查
2. `P2` parser adapter 文档契约
   - `TrMarkdownParserAdapter` 仍应明确为“产出当前 render-node 协议”的 adapter，而不是完全稳定的通用 IR
   - 这轮不建议做大规模 IR 抽象重构，优先保持文档诚实
3. `P2` 公开文档与测试入口维护
   - `TrMarkdown` 已具备独立组件文档入口与 AGENTS 结构说明
   - 后续新增能力时必须同步 CT、E2E smoke 与文档状态，避免再次漂移
4. `P2` 提交边界清理
   - 临时 bundle budget 脚本与 root script 已按提交前约定移除；除非团队决定把它升级成正式 CI 门禁，否则不放入本次提交
   - 提交前需要复核 staged 文件，避免把非 markdown 任务改动混进本次 markdown 收口提交

## 提交前 Checklist（当前收口批次）

- [x] 复核 staged / unstaged diff，把 markdown CT 迁移、LobeUI 对齐修复、文档更新和无关改动分组确认
- [x] 移除临时 `scripts/check-markdown-bundle-budget.js`
- [x] 移除 root `package.json` 中的临时 `check:markdown-bundle`
- [x] 确认非 markdown 文件是否属于本次提交；`packages/components/src/mcp-server-picker/components/PluginModal.vue` 已从 staged 集合排除，仅保留为工作区改动
- [ ] 重新运行 `pnpm -F @opentiny/tiny-robot type-check`
- [ ] 重新运行 `pnpm -F tiny-robot-test test:ct`
- [ ] 重新运行 `pnpm -F tiny-robot-test test src/markdown/index.spec.ts`
- [ ] 重新运行 `pnpm -F @opentiny/tiny-robot build`

## 后续架构执行计划

这些任务不阻塞当前提交前收口，但需要在后续迭代中按独立 PR / 独立验证推进，避免在当前批次里同时扩大 parser、props、debug 和 CI 边界。

### Phase A：结构性 props 稳定化

目标：参考 LobeUI `useStableValue` 的收益，降低调用方传 inline object 时导致的无意义 parse / render / iframe remount。

- [ ] 盘点高频复杂 props：`features / parserOptions / componentProps / components / renderOptions / code / link / streaming`
- [ ] 先做 profiling / CT 观测，确认哪些 prop identity 变化会触发真实额外成本
- [ ] 设计 Vue 侧 `useStableStruct` 或局部 computed key 策略，避免把函数型 prop 做深比较
- [ ] 先从 HTML Preview iframe remount 和 parse runtime 两条高价值路径试点
- [ ] 补 CT：inline object rerender 不应造成 HTML Preview iframe 重建或 parse count 异常上涨

### Phase B：受控 transform pipeline

目标：不自研 parser，也不直接开放 `remarkPlugins / rehypePlugins`，而是在 `markdown-it -> render-node` 后提供 TinyRobot 可控的 node transform 层。

- [ ] 定义 transform 输入输出：`TrMarkdownRenderNode[] -> TrMarkdownRenderNode[]`
- [ ] 明确安全边界：transform 不能绕过 HTML sanitizer、不能直接写 DOM、不能访问 Bubble 私有状态
- [ ] 先把内部 `citations / custom semantic blocks` 作为 transform pipeline 的试点候选
- [ ] 设计失败回退：transform 抛错时保留原始节点并输出 dev warning
- [ ] 补 CT：transform 顺序、错误回退、code/math/html boundary 不被误改

### Phase C：parser adapter 边界升级

目标：短期保持文档诚实，长期再评估是否从当前 render-node 协议抽象出稳定 IR。

- [ ] 先冻结当前 `TrMarkdownRenderNode` 字段语义：`type / tag / text / attrs / children / position / meta`
- [ ] 给每类节点补最小 contract fixture，避免 parser adapter 变更时 renderer 被隐式打破
- [ ] 评估是否需要新增 `version` 或 `capabilities` 字段表达 adapter 能力
- [ ] 如果未来接 unified/remark/rehype，只作为 adapter 实验，不替换默认 markdown-it 主线

### Phase D：debug / profiler 边界迁移

目标：继续收窄 root DOM dataset，把 profiler/debug 从 DOM attrs 迁到更清晰的 debug panel / provider 机制。

- [ ] 保留当前 summary attrs 和 `data-stream-snapshot` 作为 CT/E2E 稳定入口
- [ ] 设计内部 debug provider，让 demo panel 从 provider 读取 profiler 细节
- [ ] 逐步减少 demo 对 root dataset debug JSON 的直接依赖
- [ ] 补 CT/E2E：用户可见 streaming 行为不依赖 profiler debug 字段

### Phase E：正式 bundle budget 门禁评估

目标：把临时脚本经验沉淀成正式 CI 方案，而不是把一次性检查脚本直接塞进当前提交。

- [ ] 确定预算指标：entry raw/gzip、advanced runtime chunk、dynamic import marker
- [ ] 确定运行时机：release build 后、CI nightly、或 PR check
- [ ] 确定失败策略：blocking check 还是 warning report
- [ ] 重新引入正式脚本时补 README / AGENTS / CI 文档，而不是只加 root script

## Roadmap 目标

TinyRobot 的目标不是复刻 `LobeUI` 的 React 实现，而是对标它的能力完整度，并在 Vue 3 架构下形成自己的第一方 Markdown 基座。

Roadmap 以 `TrMarkdown` 为核心能力对象，覆盖两类落地场景：

- 独立使用的 Markdown 渲染组件
- `BubbleRenderers.Markdown` 的底层实现

## 跟踪规则

建议后续按以下状态维护：

- `Not Started`：尚未开始
- `Planned`：已进入阶段计划，但未开工
- `In Progress`：开发中
- `Blocked`：依赖未满足或方案待定
- `Done`：已实现并可对外使用

当前这版 roadmap 的状态判断已结合代码现状与最新一轮 demo / build / test 验证结果维护。

## 测试策略快照（2026-06-14）

Markdown 自动化验证已从“巨型 E2E harness”迁移为“CT 契约测试 + 少量 E2E smoke”：

- `packages/test/src/markdown-ct/*.spec.ts` 覆盖 `TrMarkdown` 单组件契约：
  - static structure / variants / links / task list / componentProps / custom components / citations / alerts / footnotes
  - code block / Shiki transformer / custom actions / HTML Preview / HTML Preview streaming mode
  - Math / Mermaid / Video / Image Gallery
  - streaming incomplete hold / smoothing parse count / animated summary telemetry / rewrite reset / hard reset / skip matrix
- `packages/test/src/markdown/index.spec.ts` 只保留真实集成 smoke：
  - markdown demo page smoke
  - Bubble fallback renderer
  - Bubble explicit markdown content type
  - HTML Preview iframe
  - animated markdown + Bubble streaming smoke
- 新增 markdown 能力时，默认先补 CT；只有涉及页面导航、Bubble 组合、iframe 集成或跨组件 wiring 时再补 E2E。
- `packages/test` 与 `packages/markdown-demo` 已在 Vite consumer 配置层拆分 `Mermaid / KaTeX / Shiki / markdown-it / DOMPurify` vendor chunks，并使用 demo/test 专属 chunk warning budget，当前 build 不再出现 large chunk warning。
- `packages/components` 发布构建已把 Mermaid / KaTeX / Shiki / @shikijs / highlight.js 高级运行时保留为 external dynamic imports，当前不再生成 `katex.min.css`、`mermaid.core.js`、`cytoscape.esm.js`、`wardley*.js` 等高级能力 chunk。
- 当前剩余治理重点是把构建体积指标接入可重复的回归检查，避免后续新增高级 case 时绕过 external / dynamic import 边界。

## 当前进度快照（截至 2026-06-14 的实现盘点）

- markdown 验证入口已完成一轮“源码直连”硬化：
  - `packages/test` 与 `packages/markdown-demo` 现已显式把 `@opentiny/tiny-robot` / `@opentiny/tiny-robot-svgs` 指向 workspace `src`
  - 对应 consumer `tsconfig` 已补齐 `Bundler`、`ES2022.Intl` 与 source-only type 支持
  - Playwright markdown spec 已从瞬时 queue / settling 帧断言收口到更稳定的 scheduler 契约断言
- `M0`、`M1`、`M2` 已完成主要实现闭环，`TrMarkdown` 已成为独立 Markdown 入口
- `M3` 已进入正式收口状态：`BubbleRenderers.Markdown` 已消费 `TrMarkdown`，并已补齐 fallback renderer 与显式 markdown content type 两条接入路径
- code 模块已完成独立子系统收敛，默认主路径继续使用 `highlight.js/core`，`Shiki` 保留为可选高级路径
- `markdown-demo` 已切到 `TrThemeProvider`，并收敛为“左侧实时预览 + 右侧统一控制整块 markdown 渲染”的双栏结构
- `markdown-demo` 当前已拆成两层：
  - `Public parity`：公开对标层，按 LobeUI section 心智组织
  - `Internal regression`：内部回归层，保留 article / Bubble 集成等实现验收 case
- `markdown-demo` 当前浏览器结构也已收口：
  - `Public parity` 视图补了顶部 case browser、右侧 case navigation 与单 case focus；默认先落到首个公开 section，预览优先，source / playground 改为按需展开
  - `Internal regression` 视图继续保留更直接的整页回归浏览与默认展开 controls，优先服务实现验收
- `Media / Code / HTML Preview / Streamdown / Custom` 五个复杂或扩展型公开 section 已补第二轮 docs parity 收口：
  - `Media` 先讲普通图片节点，再把 `Image gallery` 下沉为显式增强入口
  - `Code` 先讲 `inline code / code blocks`，再把 `Color preview / Transformers / Custom actions` 下沉为进阶入口
  - `HTML Preview` 先讲完整文档预览和 fragment fallback，再把 `auto / live / defer` streaming 差异收进 narrative chips
  - `Streamdown` 先讲可阅读主回答，再把 `Profiler / Character Animation Loss Repro` 下沉为进阶诊断入口
  - `Custom` 先讲 `components + componentProps`，再把 `renderOptions.alerts.render` 作为进阶 render hook 暴露
- `Math and Diagrams` 也已统一到同一套 section narrative 心智：
  - 默认只展示公式与图表主路径
  - 错误公式与 Mermaid 异常语法下沉到进阶入口
- `Footnotes / Alerts` 也已按同样方式完成 docs parity 收口：
  - `Footnotes` 先讲单脚注与行内脚注，再把重复引用稳定性下沉为进阶入口
  - `Alerts` 先讲五类官方 alert，再把普通 blockquote 对照与 same-line 边界下沉为进阶入口
- 公开 demo 当前 section 已收敛为：
  - `Basic / Media / Lists / Code / HTML Preview / Math and Diagrams / Footnotes / Alerts / Variants / Streamdown / Custom / APIs`
- `M1` 的基础排版收尾已进入封口阶段：`Basic` 区已覆盖 `headings / paragraph / long article / styling text / break lines / quoting text / links / lists / task lists / bubble variant / tables`
- task list 已进入默认静态路径，当前实现未额外引入 task-list parser 插件，而是沿用现有 `markdown-it -> IR -> render` 链路做轻量识别
- `M4` 已完成第一阶段与第二阶段收口：
  - `TrMarkdown` 已新增 `streaming` 配置入口
  - 静态 parser 只消费 `stableContent`
  - text tail smoothing、incomplete link、incomplete code fence、incomplete table 已有第一方策略
  - 第二阶段已补 `incomplete image` hold，以及对标 `LobeUI streamingAnimationRepro` 的 `large append / paragraph burst` demo cases
  - `markdown-demo` 与 `packages/test` 已补固定 streaming fixtures、step-by-step controls 和 Playwright 断言
- `M4.5` 已完成 P0 深度对标收口，整体状态仍保持 `In Progress`：
  - 继续沿现有 `TrMarkdown` 第一方 streaming 分支推进
  - 直接复用现有 `@vueuse/core/useRafFn` 与 `unicode-segmenter`
  - `fast-array-diff` 仅作为小依赖备选，不默认引入
  - 当前不采用通用动画框架、`Splitting.js` 或第二 markdown parser
  - 已补 `streaming.mode/preset`、markdown-it block `position`、stable top-level key、`useStreamBlockDiff`、`useStreamRevealQueue`、`useStreamTextAnimation`、`StreamAnimatedText`
  - `TrMarkdown` root 已收缩为稳定 summary telemetry，并通过 `data-stream-snapshot` / `data-stream-profiler-debug` 暴露结构化调试快照
  - 已新增第一方 stream profiler 事件模型，覆盖 `input / parse / block-diff / queue-transition / animation-frame / token-schedule`
  - 已新增 token scheduler，把原先 token patch 提升为可观测的 `idle / append / patch / reset` 调度结果，并暴露 preserved / inserted / deleted / replaced 计数
- 当前剩余项已经收敛为一个 P0 闭环，并已进入“可验证收口”状态：
  - 事件语义：root / block / frame / token 事件都已在 profiler 中显式建模，dataset 与 timeline label 保持同源
  - timeline 面板：按 root / block / input / parse / diff / queue / frame / token 分组，补齐 FPS / frame duration / root commit cost / block commit cost 观察面
  - token patch 回归：同块 rewrite、插删改、hard reset、finalized cleanup 已进入回归范围；emoji / CJK 继续保留在专项矩阵中
  - 文档边界：跨 block / parser 级 token diff 明确只进入后续 Spike，不进入当前默认主线
  - `markdown-demo` 已补 `animated streaming repro`、`rewrite/reset` fixture、预览侧/控制侧 telemetry，以及 finalized 后再 loop 的自动回放
  - `markdown-demo` telemetry panel 已补 profiler event count、timeline、queue transitions、settle/finalize、frame、token schedule 观察面
  - `markdown-demo` 的 animated repro 已继续覆盖 `fast chunks / high TPS burst / settling append`
  - `packages/test` 已补 `large append / paragraph burst / fast chunks / high TPS / heading + list / quote + paragraph / settling append / rewrite-reset / hard reset / skip matrix / profiler / token scheduler / finalized cleanup` 回归
  - `useStreamTextAnimation` 已补 backlog cap，避免 stream 速度快于 fade 时形成长时间不可见 backlog
  - `streaming.active = false` 当前正式策略已收敛为 `visible settling -> finalized plain text DOM`
  - `append during settling` 已正式纳入 scheduler 契约，并验证 finalize timer 会被撤销后恢复到 streaming 队列
  - `token-level rewrite patch` 与 token scheduler 已进入正式 P0：同 block rewrite 时复用未变 grapheme birth，结构变化才 hard reset
- `M5` 已完成本轮高级能力与公共契约收口：
  - `HTML Preview` 基础能力已落地：`html` fenced block 分流、iframe sandbox + srcdoc、Preview / Code 切换、copy / download、fragment fallback、dark mode 已进入代码、demo 与 Playwright 回归
  - `HTML Preview streaming parity` 已完成主链路收口：`streaming.active -> context -> CodeFenceResolver -> HtmlPreviewBlock` 已接通，`streamingMode = auto / live / defer`、script-lock / defer 语义与 CT 覆盖已补齐
  - `HTML Preview` 源码保真已修复：preview / source / copy / download 不再主动 `trim()` 用户 fenced HTML source；`CodeFenceResolver` 对 HTML Preview 会保留 resolver 收到的源码，parser source range 级 byte-for-byte 保真继续作为后续专项
  - `HTML Preview` streaming tail 边界已补回归：closed trailing HTML fence 不再被切入 unstable tail，完整 HTML fence 在 streaming 下仍留在稳定 parser 路径
  - `Mermaid block` 已完成最小闭环收口：`mermaid` fenced block 分流、动态 import、light/dark theme 映射、loading/error/retry/source copy 已进入代码；公开 demo 已新增 `Math and Diagrams` section，覆盖 `flowchart / sequence / invalid syntax`，并已通过类型检查与 Playwright 回归
  - `KaTeX / LaTeX` 已完成最小闭环收口：第一方 `math-inline / math-block` 节点、`$...$ / $$...$$` 语法、按需加载 `katex` runtime 与 CSS、错误 fallback 已进入代码；公开 demo 已补 `inline / block / invalid formula`，并已通过类型检查与 Playwright 回归
  - `Footnotes` 已完成最小闭环收口：`markdown-it-footnote` 仅负责 token 化，脚注 ref / list / backref 全部映射到第一方节点；公开 demo 已新增 `Footnotes` section，覆盖 `single / repeated / inline` 三条主路径，并已通过类型检查与 Playwright 回归
  - `GitHub Alert` 已完成最小闭环收口：沿现有 blockquote render 路径轻量识别 `NOTE / TIP / IMPORTANT / WARNING / CAUTION`，第一方 `AlertBlock`、公开 demo 与 Playwright 对照回归已补齐
  - `Videos` 已完成最小闭环收口：保持 `html: false` 默认边界不变，仅把独立 `<video ... />` block 收敛为第一方媒体节点；公开 `Media` section、测试页与 Playwright 回归已补齐
  - `Image Gallery` 已完成最小闭环收口：默认图片节点继续保持轻量，`features.imageGallery` 开启后由 markdown 自己持有多图预览、caption、缩略图与键盘关闭；公开 demo 与 Playwright 回归已补齐
  - `Citations` 已完成最小闭环收口：新增 `citations` 第一方数据入口，正文 `[1] / [2]` 会在普通文本节点中升级成 citation node；公开 `Custom` section 已补 `Citations + code boundary` 两条 case，测试页与 Playwright 回归已补齐
  - `Custom Plugins` 已完成第一方语义块收口：`tr-thinking / tr-artifact` 会作为内建 custom semantic block 进入 parser 与 render 链路，公开 `Custom` section、测试页与 Playwright 回归都已补齐，同时继续保持 `remarkPlugins / rehypePlugins / plugins` 为 internal
  - markdown 内部容器层本轮已完成冻结：`TrMarkdown.vue` 运行时已拆分到独立 composables，`render.ts` 已拆成分域 renderer，`HTML Preview / Mermaid` 的 `Preview / Code` 切换器与 default-mode 本地同步逻辑已收口到 markdown 内部共用子组件 / composable；`html-preview / mermaid / math` 的 floating toolbar、loading surface、status header、status surface、source block 以及共享样式骨架都已收口到 markdown 内部 shared 子组件 / shared selectors
  - 公开 demo 已与 LobeUI 当前公开 Markdown docs 完整对齐；`Custom Plugins` 的公开目标已收敛为“第一方语义块效果对齐”，而不是通用插件平台
  - 后续仍应避免把通用 `Custom Plugins` API 直接并行塞进默认路径；当前正式边界仍是继续冻结第一方扩展能力
- `Bubble` 与 markdown 的当前正式边界已明确：
  - string content 可通过 `fallbackContentRenderer={BubbleRenderers.Markdown}` 接入
  - `{ type: 'markdown', text }` 推荐通过 provider-level `contentRendererMatches` 显式启用
  - `contentAttributes` / renderer attributes 可继续向 `TrMarkdown` 透传 `style / code / link / parserOptions / features`
  - 显式 markdown content type 暂不进入 Bubble 默认匹配，避免普通 Bubble 主路径承担 markdown 运行时代价
- 本轮仍未进入的范围：
  - 通用 custom plugins API
- `M4.5` 后续剩余项已收敛为 P0 闭环：
  - root / block / frame / token 事件语义已统一到同一 profiler 事件模型
  - profiler 面板已拆分 timeline、FPS、frame duration、root commit cost、block commit cost 观察面
  - token patch 回归已覆盖同块 rewrite / 插删改 / hard reset / finalized cleanup，emoji / CJK 作为后续专项边界继续跟踪
  - 文档边界已回填：跨 block / parser 级 token diff 进入后续 Spike，不再计入当前阶段验收

## LobeUI 对标能力总览

下表先把 `LobeUI` 的主要能力面拆开，再对照 TinyRobot 当前状态。

| 能力域 | LobeUI 现状 | TinyRobot 当前 | 当前状态 |
| --- | --- | --- | --- |
| 基础 Markdown 语法 | 完整 | 已覆盖静态基础语法与基础 demo | Done |
| 标签级组件映射 | 有 | 已实现 | Done |
| 统一 Markdown 入口组件 | 有 | `TrMarkdown` 已实现 | Done |
| Markdown Provider / 上下文 | 有 | `useMarkdownContext` 已改为响应式读取契约，并有 prop update CT 覆盖 | Done |
| 静态与流式分支拆分 | 有 | 静态完成，流式第一阶段已实现 | Done |
| 代码块独立子系统 | 有 | 已实现 | Done |
| Mermaid 代码块 | 有 | 已完成最小闭环，支持 fenced block 分流、动态加载、theme/loading/error/retry/source copy，demo 与 test 已补公开 case | Done |
| HTML Preview 代码块 | 有 | 已完成基础预览、source fidelity、fragment fallback、streaming auto/live/defer 与 iframe smoke | Done |
| 原始 HTML 能力 | 有 | `features.html` 已具备 sanitizer 后的 inline / block render path，并有 disabled/enabled 与安全回归 CT | Done |
| 公式支持 | 有 | 已完成最小闭环，支持 `$...$ / $$...$$`、第一方 math node、KaTeX 动态加载与错误 fallback | Done |
| Footnotes | 有 | 已完成最小闭环，支持定义式 / 行内脚注、重复引用、第一方锚点与 backref | Done |
| GitHub Alert | 有 | 已完成最小闭环，支持五类 GitHub alert、第一方 AlertBlock 与 demo / test 对照回归 | Done |
| 图片 Gallery | 有 | 已完成 markdown 自持的独立 gallery 预览链路 | Done |
| chat variant | 有 | `bubble` / `article` 已落地，Bubble markdown 集成已收口 | Done |
| 插件扩展点 | 完整 | `actionsRender` 已新增 `defaultActions / renderDefaultActions` 稳定入口；parser adapter 仍按当前 render-node 协议维护 | Partial |
| 安全层 | 完整 | 默认关闭 HTML，raw HTML 走 DOMPurify sanitizer，HTML Preview 走 sandbox iframe；仍需长期关注高级依赖与新节点安全回归 | Done |
| 流式 smoothing / tail hold | 有 | 已实现 smoothing / tail / incomplete hold / scheduler 契约 | Done |
| 字符级 streaming 动画 / reveal queue | 有 | 已实现 animated queue、token scheduler、profiler telemetry 与回归闭环 | Done |

## 实现原则

所有阶段都围绕这三条原则推进：

1. 解析层、渲染层、样式层分离
2. 标签级组件映射，而不是直接 `v-html`
3. 流式 Markdown 单独处理，不和静态 Markdown 混为一谈

## 里程碑总览

Roadmap 建议拆成七个阶段，其中 `M4.5` 是 `M4` 之后、`M5` 之前的专项收口阶段：

1. `M0` 明确边界与组件骨架
2. `M1` 建立静态 `TrMarkdown` 基座
3. `M2` 建立代码块专项能力
4. `M3` 接入 Bubble 与内容类型
5. `M4` 建立流式 Markdown 分支
6. `M4.5` 收敛 streaming animation
7. `M5` 补齐高级能力与扩展点

## 阶段验收框架

为了避免 `TrMarkdown` 在实现过程中失控，每个阶段都建议从四个维度验收：

1. **功能目标**
2. **测试方法**
3. **体积预算**
4. **渲染性能预算**

这里的指标只针对 Markdown 组件自身，不扩展到整个 TinyRobot 组件库。

### A. 功能目标

必须回答：

- 这一阶段到底新增了什么能力
- 哪些能力明确不在本阶段
- 哪些能力还只是预留接口

### B. 测试方法

建议分三层：

- **静态测试**：类型、结构、快照、输出结构
- **行为测试**：节点渲染、组件映射、能力开关
- **场景测试**：长文本、代码块、Bubble 集成、流式消息

### C. 体积预算

建议统一关注三类成本：

- **默认路径成本**：一个最普通 Markdown 文本渲染时会不会带入重依赖
- **能力增量成本**：开启高亮、Mermaid、KaTeX 后增加多少
- **拆包有效性**：相关能力是否真的按需进入

### D. 渲染性能预算

建议统一关注三类场景：

- **静态首渲染**
- **更新渲染**
- **流式增量更新**

## 通用验收原则

无论哪个阶段，都建议遵守这几条硬规则：

1. **默认路径不引入重能力**
   - `Shiki`
   - `mermaid`
   - `KaTeX`
   - HTML Preview runtime

2. **重能力必须可关闭**

3. **重能力必须支持延迟加载**

4. **渲染更新不得无边界扩散**
   - 尾部更新不应导致前序所有 block 重算

5. **引入一个新依赖前，必须说明收益**
   - 解决了什么问题
   - 少写了多少底层代码
   - 默认路径是否受影响

## M0：明确边界与组件骨架

### 目标

- 在 `packages/components/src/markdown` 建立独立模块
- 确定对外导出入口
- 确定 `TrMarkdown` 与 `BubbleRenderers.Markdown` 的职责边界

### 为什么先做这个

TinyRobot 当前的问题不是完全缺能力，而是 Markdown 逻辑分散在：

- `BubbleRenderers.Markdown`
- `BubbleProvider.store`
- 外部样式类名

如果不先收口边界，后续功能会继续堆在 `Markdown.vue` 里。

### 产出物

- `packages/components/src/markdown/index.ts`
- `packages/components/src/markdown/index.type.ts`
- `packages/components/src/markdown/TrMarkdown.vue`
- `packages/components/src/markdown/README.md`（可选）

### 验收标准

- `TrMarkdown` 可以作为独立组件导出
- `BubbleRenderers.Markdown` 不再被视为最终能力归属
- 文档中明确 `Bubble` 只是消费 `TrMarkdown`

### 当前状态

- 状态：`Done`
- 依赖：无

### 阶段验收标准

#### 功能目标

- 建立 `packages/components/src/markdown/` 模块骨架
- 明确 `TrMarkdown`、`TrMarkdownProvider`、`BubbleRenderers.Markdown` 的职责边界
- 明确静态渲染和流式渲染将是两条分支

#### 测试方法

- 静态检查：
  - 目录结构存在
  - 导出入口存在
  - 类型入口存在
- 文档检查：
  - `design` 文档与 `roadmap` 文档同步更新

#### 体积预算

- 此阶段不引入任何新的重依赖
- 不允许因为目录骨架调整而使默认主入口新增 Markdown 运行时代码

#### 渲染性能预算

- 此阶段不涉及运行时性能目标
- 但必须明确后续将记录“静态首渲染、更新渲染、流式渲染”三类性能指标

#### 通过条件

- `TrMarkdown` 作为独立模块骨架存在
- 文档中能明确看出后续能力边界
- 主包默认路径未引入额外运行时代码

## M1：建立静态 `TrMarkdown` 基座

### 目标

先实现一个不依赖 `v-html` 的静态 Markdown 渲染内核，对标 `LobeUI` 的基础静态渲染能力。

### 能力范围

- 标题
- 段落
- 列表
- 引用
- 分隔线
- 链接
- 图片
- 行内代码
- 代码块
- 表格
- GFM 常用能力

### 推荐实现方式

- 第一阶段 parser 继续基于 `markdown-it`
- 但最终渲染不再直接输出 HTML 字符串
- 在 parser 层构建 TinyRobot 自己的 Markdown IR
- render 层把 IR 映射成 Vue VNode / 第一方子组件

### 产出物

- `parser/markdownItAdapter.ts`
- `render/renderMarkdown.ts`
- `components/TrMarkdownParagraph.vue`
- `components/TrMarkdownHeading.vue`
- `components/TrMarkdownLink.vue`
- `components/TrMarkdownImage.vue`
- `components/TrMarkdownBlockquote.vue`
- `components/TrMarkdownTable.vue`
- `components/TrMarkdownInlineCode.vue`
- `components/TrMarkdownCodeBlock.vue`

### 样式要求

- 新建 `--tr-markdown-*` CSS 变量体系
- 脱离 `markdown-body` 语义
- 默认提供 `default` 与 `bubble` 两种 variant 的视觉基线

### 验收标准

- 基础 Markdown 内容不再经过最终 `v-html`
- `TrMarkdown` 能独立渲染常见 Markdown 文本
- `Bubble` 场景可通过变量桥接获得更贴合气泡的排版

### 当前状态

- 状态：`Done`
- 依赖：`M0`

### 阶段验收标准

#### 功能目标

- 支持基础 Markdown 渲染：
  - 标题
  - 段落
  - 列表
  - 引用
  - 链接
  - 图片
  - 行内代码
  - 代码块容器
  - 表格
  - 分隔线
- 支持 `default` 和 `bubble` variant
- 最终渲染不再依赖整段 `v-html`

#### 测试方法

- 单元测试：
  - 每种基础节点至少一条渲染测试
  - `components` 覆写能力测试
  - `variant` 切换测试
- 快照测试：
  - 基础 markdown 文本
  - 含表格、引用、列表、代码块的复合文档
- Bubble 集成测试：
  - `BubbleRenderers.Markdown` 渲染普通 markdown 消息

#### 体积预算

- 默认路径不得引入：
  - `shiki`
  - `mermaid`
  - `katex`
- 若仍使用 `markdown-it` adapter：
  - 继续保持 `markdown-it` 可 external / lazy
- 默认静态 Markdown 基础实现应保持“轻依赖”状态

#### 渲染性能预算

- 单条普通 Markdown 消息首渲染：
  - 不应出现明显同步阻塞感
- 纯文本尾部追加更新：
  - 不应导致整段 DOM 完整销毁重建
- 长文档场景：
  - 需要建立基准用例，例如：
    - 100 段普通文本
    - 10 个表格
    - 10 个代码块

#### 通过条件

- 默认路径可用且不依赖重能力
- 基础 Markdown 节点均可第一方渲染
- `bubble` variant 生效
- 没有回退到最终 `v-html` 主路径

## M2：建立代码块专项能力

### 目标

对标 `LobeUI` 把代码块从普通节点提升为独立子系统。

### 对标能力

从 `LobeUI` 来看，代码块至少包含这些分流：

- 普通块级代码
- 单行代码快速展示
- Mermaid 代码块
- HTML Preview 代码块
- full-featured code block 模式
- 语言标签
- hover toolbar
- copy -> check 反馈

### TinyRobot 建议拆分

- `TrMarkdownCodeInline`
- `TrMarkdownCodeBlock`
- `TrMarkdownCodeFenceResolver`

后续可扩展：

- `TrMarkdownMermaidBlock`
- `TrMarkdownHtmlPreviewBlock`

### 推荐验收顺序

#### P0

- 代码块统一容器
- 语言识别
- copy 按钮预留
- 单行 / 多行区分

#### P1

- 高亮策略接口
- 语言标签
- toolbar 结构
- copy 状态机
- Mermaid block
- HTML Preview block

### 验收标准

- Markdown 里的代码块不再只是默认 `pre > code`
- 代码节点可以根据语言和模式做策略分发
- Bubble 场景中的代码块有独立 spacing、radius、overflow 和视觉规则

### 当前状态

- 状态：`Not Started`
- 依赖：`M1`

### 阶段验收标准

#### 功能目标

- 代码块形成独立子系统
- 支持：
  - inline code
  - block code
  - language 识别
  - 单行 / 多行展示分流
- 为后续高亮、Mermaid、HTML Preview 预留策略接口
- 预留代码块交互结构：
  - header
  - toolbar
  - copy button
  - language tag

#### 测试方法

- 单元测试：
  - fenced code 语言识别
  - inline code 渲染
  - 单行代码和多行代码分流
- 组件测试：
  - 代码块 UI 容器、滚动、复制按钮预留区域
  - toolbar 显隐策略
  - 语言标签显示
- 场景测试：
  - 长代码块
  - 多个代码块连续渲染

#### 体积预算

- 基础代码块实现不得默认引入 `Shiki`
- 若引入高亮：
  - 必须通过 feature flag 控制
  - 必须可动态加载
- Mermaid 和 HTML Preview 仍不得进入默认路径

#### 渲染性能预算

- 单个大代码块渲染不得拖慢普通文本路径
- 多代码块文档中，普通文本追加不应触发前序代码块重复高亮
- 代码块应成为稳定更新边界
- toolbar hover / copy 状态变化不得触发代码内容重算

#### 通过条件

- 代码块策略分发已独立建模
- 默认路径未引入重型高亮依赖
- 代码块更新边界清晰
- 交互结构已设计清楚，并有明确组件边界

## M3：接入 Bubble 与内容类型

### 目标

把 `TrMarkdown` 真正接回 TinyRobot 现有 renderer 架构。

### 关键动作

1. `BubbleRenderers.Markdown` 改为内部渲染 `TrMarkdown`
2. Markdown 配置从 `BubbleProvider.store` 中逐步抽离
3. 文档补充显式的 Markdown 内容类型用法

### 推荐内容类型方向

当前推荐支持：

```ts
{ type: 'markdown', text: string }
```

但建议通过显式 provider match 接入，而不是直接塞进 Bubble 默认匹配：

```ts
{
  find: (_, content) => content.type === 'markdown',
  renderer: markRaw(BubbleMarkdownRenderer),
  priority: BubbleRendererMatchPriority.CONTENT,
}
```

这样做的原因是：

- 可以清晰区分 `text` 和 `markdown`
- 可以支持一条消息内的 split content routing
- 不会让未启用 markdown 的 Bubble 主路径默认带入 markdown 运行时代码

### 为什么这一步重要

当前 Markdown 主要通过 fallback 启用，这意味着：

- 无法和纯文本清晰区分
- 难以在默认规则里实现“文本 vs markdown”分流
- 不利于后续多模态内容扩展

### 验收标准

- `BubbleRenderers.Markdown` 不再直接 `v-html`
- Markdown 配置可通过 props / attributes 注入
- 文档给出显式 Markdown 内容类型示例

### 当前状态

- 状态：`Done`
- 依赖：`M1`

### 阶段验收标准

#### 功能目标

- `BubbleRenderers.Markdown` 内部已切换到 `TrMarkdown`
- string content fallback 路径已稳定
- `{ type: 'markdown', text }` 的显式内容类型路径已可通过 provider match 启用
- Markdown 配置已可通过 `contentAttributes` / renderer attributes 注入，不再主要依赖 `BubbleProvider.store`

#### 测试方法

- 组件测试：
  - `Bubble` 单消息 markdown
  - `BubbleList` 多消息 markdown
  - `bubble` variant 样式桥接
- 行为测试：
  - fallback 模式
  - 显式 content type 模式
  - `contentAttributes` / `renderer.attributes` 透传

#### 体积预算

- 仅使用 `Bubble` 但不启用 Markdown 时，不应引入 Markdown 重能力
- Bubble 主路径不应因为 `TrMarkdown` 接入而默认带入高亮、Mermaid、KaTeX

#### 渲染性能预算

- `BubbleList` 中多条 markdown 消息渲染时，滚动和首屏不应明显恶化
- 单条消息内容更新不应导致全列表不必要重算

#### 通过条件

- Bubble 与 `TrMarkdown` 集成稳定
- 配置传递边界清晰
- fallback / explicit markdown content type 两条路径都有 demo 与回归覆盖
- 未使用 Markdown 的 Bubble 场景不承担额外重依赖

## M4：建立流式 Markdown 分支

### 目标

对标 `LobeUI` 和 `Ant Design X Markdown`，把 streaming markdown 作为单独问题处理。

### 第一阶段要解决的不是全部语法，而是用户最容易感知的问题

- code fence 未闭合
- link 未闭合
- table 未闭合
- 流式尾巴 / tail
- 文本抖动和整段重排

### 建议的子模块

- `stream/useMarkdownStreamState.ts`
- `stream/useMarkdownSmoother.ts`
- `stream/useIncompleteMarkdown.ts`
- `components/stream/StreamTail.vue`

### 推荐策略

先不追求完整 parser 重写，而是先做：

- smoothing
- incomplete token 的展示策略
- block 级或段级稳定输出

### 验收标准

- AI 流式输出时，Markdown 不会频繁出现大幅闪烁和错位
- 半截链接、半截代码块等有稳定展示策略
- `TrMarkdown` 暴露 `streaming` 配置入口

### 当前状态

- 状态：`Done`
- 依赖：`M1`

### 阶段验收标准

#### 功能目标

- 支持流式 Markdown 增量展示
- 首批处理的不完整结构：
  - code fence
  - link
  - image
  - table
- 支持 tail / smoothing / 稳定输出策略
- 对标 `LobeUI` 后明确：
  - `useStreamQueue` 对应的是字符动画编排，不是 parser 级 token diff
  - 当时 `M4` 自身不把 per-char animation queue 作为实现门禁，该能力已在 `M4.5 animated` 路径补入
  - `token-level diff` 继续保留为后续 Spike 项，而不是当前 `M4` 实现门禁

#### 测试方法

- 场景测试：
  - 普通文本逐字流式
  - 代码块逐行流式
  - 半截链接 / 图片 / 表格
- 回归测试：
  - 关闭 streaming 时回退静态路径
- 压力测试：
  - 高频短 token 更新
  - 长回答持续追加

#### 体积预算

- 流式增强逻辑不得污染静态默认路径
- 若采用单独底层（例如 `streamdown-vue`），必须是可分支引入

#### 渲染性能预算

- token 高频到达时，不允许整段明显闪烁
- 流式尾部变化不应导致前序所有 block 重新渲染
- 需要为“单条长消息持续流式更新”建立基准场景

#### 通过条件

- streaming 分支可独立工作
- 常见不完整结构有稳定展示策略
- 流式渲染对静态路径零侵入

## M4.5：收敛 Streaming Animation

### 目标

在保留当前 `M4` stable head + tail 分支的前提下，补齐接近 `LobeUI` 的 streaming animation 体验：

- block reveal queue
- text-only per-char fade
- reset / rewrite 重新对齐

### 为什么单独拆成 `M4.5`

这部分虽然仍属于 streaming markdown，但复杂度已经明显高于：

- smoothing
- incomplete hold
- tail fallback

把它单独拆出来的价值在于：

- 不会让 `M4` 已完成能力和后续动画目标混淆
- 可以把依赖决策、性能预算和非目标单独写清楚
- 避免为了追求动效把 parser / code / table 的稳定边界打散

### 当前依赖决策

当前这轮已经冻结的基础库策略是：

- 直接复用现有 `@vueuse/core/useRafFn`
- 直接复用现有 `unicode-segmenter`
- `fast-array-diff` 仅作为 top-level block patch 的小依赖备选
- 不引入：
  - 通用动画框架
  - `Splitting.js`
  - 第二 markdown parser

### 功能目标

- `large append` 具备顺序 reveal
- `paragraph burst` 具备分段进入节奏
- 只让文本类 block 进入字符动画
- code / table / image 保持稳定跳过
- animated 路径具备稳定 block identity，而不是继续依赖 index key

### 当前非目标

- 不做 parser 级 token diff
- 不做 code block 内逐字符动画
- 不做 mermaid / math / html preview 的 streaming 动画
- 不为了动画回退到新的整套 renderer

### 推荐实现模块

- `stream/useStreamBlockDiff.ts`
- `stream/useStreamRevealQueue.ts`
- `stream/useStreamTextAnimation.ts`
- `components/stream/StreamAnimatedText.vue`

### 关键前提

在进入正式实现前，需要先明确下面几个约束：

- top-level block 需要稳定 identity
- animated streaming 路径不能继续仅用 index 作为 render key
- append、rewrite、finalize 三种生命周期必须分开
- `bubble` 是第一优先 benchmark，`default / article` 以不退化为主

### 当前状态

- 状态：`In Progress`
- 依赖：`M4`
- 当前已完成：
  - `streaming.mode = 'animated'` 与 `preset` 已接入
  - markdown-it block 已补 `position.charStart/charEnd`
  - animated 路径已切换到稳定 top-level key
  - `block diff / reveal queue / text animation` 首轮基座已落地
  - `TrMarkdown` root telemetry 已收缩为稳定 summary attrs，并通过 `data-stream-snapshot` / `data-stream-profiler-debug` 暴露结构化调试快照；低层 profiler 字段不再作为 root dataset 稳定契约扩散
  - demo 已补 `large append / paragraph burst / fast chunks / high TPS burst / heading + list / quote + paragraph / settling append / rewrite-reset` animated repro、预览侧/控制侧观测面板，以及 finalized 后再 loop 的自动回放
  - demo 已新增 `Streaming rewrite patch` 专项 case，root telemetry 可观察 `updateKind / hardReset / skippedCharCount / skippedNodeCount`
  - `packages/test` 已补 `large append / paragraph burst / fast chunks / high TPS / heading + list / quote + paragraph / settling append / rewrite-reset / hard reset / skip matrix / finalized cleanup` 回归
  - `useStreamTextAnimation` 已补 backlog cap，`streaming.active = false` 会先进入可见 settling，再回落为 plain text DOM
  - `useStreamRevealQueue` 已显式区分 `animatingIndex / streamingIndex`，并验证 `append during settling` 会取消 finalize hold 后恢复 streaming
  - `token-level rewrite patch` 已进入 P0，同 block rewrite 复用未变 grapheme birth，结构变化才 hard reset
  - 第一方 stream profiler 已进入 P0，root telemetry 可观察 input / calculation / queue / frame / token schedule 事件流
  - token scheduler 已进入 P0，`append / patch / reset` 调度结果可通过 profiler 与 test 断言验证
  - 当前 P0 已完成：
    - profiler 事件语义已与 root / block commit 命名对齐
    - profiler 面板已补齐 timeline / FPS / frame duration / root commit cost / block commit cost
    - token patch 回归已补齐同块 rewrite / 插删改 / hard reset / finalized cleanup
    - 文档边界已回填：跨 block / parser 级 token diff 只作为后续 Spike

### 阶段验收标准

#### 功能目标

- 在现有 `streaming` 配置上新增 `animated` 模式
- 支持文本类 block 的 reveal queue 与字符淡入
- reset / rewrite 时能中止旧队列并重新对齐
- task checkbox、inline code、code/table/image 的 skip matrix 已固定

#### 测试方法

- 场景测试：
  - `large append`
  - `paragraph burst`
  - `fast chunks`
  - `high TPS burst`
  - heading + list
  - quote + paragraph
  - settling append
  - rewrite / restart
- 组件测试：
  - settled block 回落为普通文本 DOM
  - code / table / image 继续跳过字符动画
- 可观测性测试：
  - queue 长度
  - active / animating / streaming index
  - char delay / fade duration / settle hold
  - live `.stream-char` 数量
  - rewrite / reset 次数
  - parse count

#### 体积预算

- 首选 0 新依赖
- 若引入 `fast-array-diff`，必须说明收益并记录构建变化
- 不允许引入通用动画框架和第二 markdown parser

#### 渲染性能预算

- parser 仍只在 `stableContent` 变化时重跑
- queue / fade 更新不得触发前序 block 重 parse
- settled block 不应永久保留大量 char span

#### 通过条件

- 动画体验对标目标可见
- 结构边界和当前 `M4` 基线没有退化
- demo / test / 文档同步完成
- 默认路径未被重依赖污染

## M5：高级能力与扩展点

### 目标

对标 `LobeUI` 的功能完整度，补齐高级节点和扩展能力。

### 能力项

- Mermaid
- LaTeX / KaTeX
- Footnotes
- GitHub Alert
- HTML Preview streaming parity
- 图片 Gallery
- 自定义语义块

### 扩展点

当前正式冻结的公开扩展点为：

- `components`
- `componentProps`
- `parserOptions`
- `renderOptions`
- `features`

其中 `renderOptions` 当前先只开放首个真实子能力：

- `renderOptions.alerts.render`

以下能力继续保持 internal / research，不进入当前公开冻结：

- `plugins`
- `remarkPlugins`
- `rehypePlugins`
- 通用 `customRender`
- stream scheduler / token patch / profiler raw events

### 验收标准

- `TrMarkdown` 已经不再只是一个“渲染普通 markdown 的组件”
- 而是可作为 TinyRobot Markdown 平台能力的统一入口

### 当前状态

- 状态：`In Progress`
- 依赖：`M1`，部分能力依赖 `M2` / `M4`

### 当前建议起手顺序（2026-06-08）

当前最自然的推进顺序已经调整为先修 public contract，再继续扩展点收口：

1. 修复 `P1` / `P2` 契约问题
   - `features.html` 的真实语义
   - `useMarkdownContext` 响应式上下文
   - HTML Preview 的 streaming 主链路与源码保真
2. 收紧架构边界
   - `parser adapter -> IR -> renderer` 的真实可替换边界
   - Bubble `contentAttributes` 与 Markdown 私有协议的分层
   - `actionsRender` 与 streaming telemetry 的暴露面
3. 收口公开文档与 contract-level 测试
   - 为 `TrMarkdown` 建立独立组件文档入口
   - 补齐 `features.html`、`useMarkdownContext`、HTML Preview fidelity 的专项回归

这样做的原因是：

- 当前高级能力的大面已经落地，但公共契约仍有明显失真
- 继续扩 API 或扩文档，只会放大现有边界问题
- 先把 public contract 和 internal boundary 做实，后续扩展点才不容易返工

### M5 推荐 Tasklist（持续更新）

#### M5.0：阶段准备与门禁

- 冻结 `features` 配置结构：
  - `features.htmlPreview`
  - `features.mermaid`
  - `features.math`
  - `features.footnotes`
  - `features.alerts`
  - `features.imageGallery`
- 冻结高级能力的共同门禁：
  - 默认关闭
  - 仅命中文档节点时按需加载
  - 不进入 Bubble 普通主路径
  - 不回退到整段 `v-html`
- 当前公开 `features` 语义已冻结为：
  - `features.htmlPreview` 仅作用于完整 HTML 文档 fenced block，保留 `streamingMode`
  - `features.mermaid` 仅作用于 `mermaid` fenced block
  - `features.math` 仅作用于 `$...$ / $$...$$` 第一方 math 节点
  - `features.footnotes` 仅作用于 parser token 命中的脚注节点
  - `features.alerts` 仅作用于 blockquote render 命中的 GitHub alerts
  - `features.imageGallery` 仅在显式开启后建立 gallery runtime，不改变默认图片轻量路径
- demo 分组已冻结为：
  - 公开层：`Basic / Media / Lists / Code / HTML Preview / Math and Diagrams / Footnotes / Alerts / Variants / Streamdown / Custom`
  - 内部层：`Internal Regression`
- fixture / demo / test 命名规则已冻结为：
  - demo case 文件继续按能力域维护在 `packages/markdown-demo/src/data/cases/*.ts`
  - `data-testid` 统一采用 `markdown-<domain>-<scenario>`
  - streaming / animated 场景继续采用 `markdown-stream-*`、`markdown-stream-animated-*`
- 验证命令模板已冻结为：
  - `pnpm -F @opentiny/tiny-robot type-check`
  - `pnpm -F @opentiny/tiny-robot-markdown-demo type-check`
  - `pnpm -F tiny-robot-test test -- src/markdown/index.spec.ts`
- 体积记录模板已冻结为：
  - `packages/components` 记录 `modules transformed`、`dist/markdown/index.js` 与 gzip
  - `packages/markdown-demo` 记录 `modules transformed`、主入口 chunk 与 large chunk warning
  - `packages/test` 仅记录 harness 体积，不作为对外发布门禁

#### M5.1：HTML Preview streaming parity

- 保留现有 `html` fenced code block -> `HtmlPreviewBlock` 分流主路径
- 保留现有 iframe sandbox + srcdoc、Preview / Code、copy / download、fragment fallback、dark mode 能力
- `features.htmlPreview.streamingMode = auto / live / defer` 的基础运行时分流已落地
- 已对齐 LobeUI 的三段语义：
  - 无 `<script>` 的完整 HTML 文档可在 streaming 过程中提前 live 挂载 iframe
  - 含 `<script>` 的 HTML 文档在 `auto` 下退回 defer，等待 `</html>` 后只启动一次
  - `live / defer` 可显式覆盖自动判定
- demo 已补齐 `HTML Preview` 公开 case 与 `auto / live / defer` streaming case
- test 已补齐 script-lock、`</html>` completion、live commit、defer fallback 与 streamingMode 切换断言
- 当前仍待收口的 blocker：
  - `streaming.active -> HtmlPreviewBlock` 主链路尚未完全做实
  - preview / source / copy / download 仍会对源码做 `trim()`，不满足保真要求

#### M5.2：Mermaid block

- 识别 ` ```mermaid ` fenced code block
- 在 code 子系统中分流到 `MermaidBlock`
- 通过动态 import 加载 `mermaid`
- 支持 light / dark theme 映射
- 支持 loading / error / retry / copy source
- demo 覆盖 flowchart / sequence / invalid syntax
- test 覆盖默认关闭、显式开启、非 mermaid code 不加载 mermaid

#### M5.3：KaTeX / LaTeX

- 冻结 inline math 与 block math 语法范围：`$...$ / $$...$$`
- 沿当前 `markdown-it` adapter 扩展第一方 math parser，不回退到插件直接产出的 HTML 主路径
- 仅在 `features.math` 开启且文档包含公式时加载样式与运行时
- 提供 `MathInline` / `MathBlock` 两类节点组件
- demo 覆盖 inline formula、block formula、错误公式
- test 覆盖开关、错误 fallback、普通 `$` 文本不误判

#### M5.4：Footnotes

- 采用 `markdown-it-footnote` 或等价轻量 parser 插件
- 将 footnote ref / footnote list 映射为第一方 Vue 节点
- 统一锚点、返回链接、编号样式和可访问性
- demo 覆盖单脚注、多脚注、脚注内 link / code
- test 覆盖 parser token、render node、主题样式

#### M5.5：GitHub Alert

- 支持 `> [!NOTE]` / `TIP` / `IMPORTANT` / `WARNING` / `CAUTION`
- 不依赖重 parser，优先在 blockquote render 阶段识别
- 映射为 `AlertBlock`，走主题 token
- demo 覆盖五类 alert 与普通 blockquote 对照
- test 覆盖普通 blockquote 不被误判

#### M5.6：Image Gallery

- Image Gallery：
  - 普通 image 默认仍轻量
  - `features.imageGallery` 开启后接入预览层
  - 支持多图浏览、caption、alt、键盘关闭
- demo 已覆盖 gallery 多图预览路径，并保持暗色主题友好的 overlay 表现
- test 已覆盖默认关闭、显式开启、多图切换、caption 与键盘关闭

#### M5.7：插件与扩展点

- 在至少两类高级节点落地后再抽象
- 冻结最小公开边界：
  - `components`
  - `componentProps`
  - `parserOptions`
  - `renderOptions`
  - `features`
- 当前第一步已完成：
  - `componentProps` 已作为正式 `TrMarkdownProps` API 打通到 render 层
  - 公开 demo 已补 `components + componentProps` 案例
  - Playwright 已补“覆写组件 + 默认节点组件”共同接收 props 的回归
- 当前第二步已完成：
  - `renderOptions` 已作为正式 `TrMarkdownProps` API 打通到 render 层
  - 首个冻结子能力为 `renderOptions.alerts.render`
  - 公开 demo 与 Playwright 已补 `custom alert render` 案例
- 已明确 public API 与 internal hook 边界：
  - public：`components / componentProps / parserOptions / renderOptions / features`
  - internal：`plugins / remarkPlugins / rehypePlugins / customRender / stream scheduler / token patch / profiler raw events`
- 当前仍待继续收口的边界问题：
  - `useMarkdownContext` 响应式契约已完成主线修复并由 CT 覆盖，后续新增 context 字段时需要继续补 prop update 回归
  - `actionsRender` 已新增 `defaultActions / renderDefaultActions()` 稳定入口，`originalNode` 仅保留为 legacy compatibility
  - `TrMarkdownParserAdapter` 的可替换边界仍偏文档承诺，未完全成为稳定 IR

### 当前阶段非目标

- 不在同一轮里并行引入全部 `M5` 能力
- 不把任何高级能力默认带入 `TrMarkdown` 的基础静态路径
- 不让 `Bubble` 普通主路径自动承担 `Mermaid / KaTeX / Preview / Gallery` 成本
- 不为了高级能力回退到整段 `v-html` 或破坏现有 `M1 ~ M4` 分层

### 阶段验收标准

#### 功能目标

- 补齐高级能力：
  - Mermaid
  - LaTeX
  - Footnotes
  - GitHub Alert
  - HTML Preview
  - Image Gallery
- 补齐插件与组件扩展点

#### 测试方法

- 单元测试：
  - feature flag 开关控制
  - 插件启停逻辑
- 场景测试：
  - Mermaid 文档
  - 数学公式文档
  - 带脚注和表格的复合文档
- 交互测试：
  - 图片预览
  - 代码块扩展能力

#### 体积预算

- 所有高级能力必须是显式开启
- Mermaid / KaTeX / HTML Preview 不允许进入默认基础路径
- 每个高级能力都应可单独评估收益/成本

#### 渲染性能预算

- 高级能力启用时，基础文档性能不能显著回退
- 高级节点应尽量局部生效，不拖慢整篇文档其他节点

#### 通过条件

- 高级能力完整可控
- 默认路径仍然轻量
- 各能力具备清晰的开关与成本边界

## 能力清单与跟踪表

下表建议作为后续推进时的主跟踪表使用。

| 能力 | 阶段 | 当前状态 | 依赖 | 验收摘要 |
| --- | --- | --- | --- | --- |
| 独立 `TrMarkdown` 模块 | M0 | Done | - | 独立导出入口存在，已通过基础构建验证 |
| `TrMarkdown` 静态入口组件 | M0 | Done | M0 | 可单独渲染 markdown，已通过基础构建验证 |
| Markdown IR / parser adapter | M1 | Partial | M0 | 已脱离最终 `v-html` 主路径，但 adapter 可替换边界与内部 IR 仍需继续做实 |
| 标签级组件映射 | M1 | Done | M1 | `p/link/image/code/table` 可被第一方组件接管 |
| 基础样式变量体系 | M1 | Done | M1 | 建立 `--tr-markdown-*` |
| `bubble` variant | M1 | Done | M1 | Bubble 内排版和默认态可区分 |
| 代码块分流 | M2 | Done | M1 | 单行/多行/语言分流，已通过 type-check/build/test 完整验证 |
| Single-line fenced snippet | M2 | Done | M2 | 已补紧凑容器、语法高亮与 copy 交互，并通过 Playwright 回归 |
| 多行 code block full mode | M2 | Done | M2 | 已补 header + actions + collapse 结构，对标 docs 场景 |
| Inline color preview | M2 | Done | M1 | 已支持 `HEX / RGB / HSL` inline code 颜色预览 |
| 代码块交互结构 | M2/M3 | Done | M2 | overlay / full 双模式并存，docs 与 bubble 形态分离 |
| 默认高亮方案 | M2/M3 | Done | M2 | 默认采用 `highlight.js/core`，已通过 type-check/build/test 验证 |
| 高级高亮路径（Shiki） | M2/M5 | Done | M2 | 已接到高级 code case，承接 transformer 与 custom actions |
| Mermaid block | M2/M5 | Done | M2 | 已完成 `mermaid` fenced block 分流、动态 import、theme/loading/error/retry/source copy，公开 demo 与 Playwright Mermaid case 已补齐 |
| HTML Preview block | M2/M5 | Partial | M2 | 基础预览已落地，但 streaming 主链路与源码保真仍待收口 |
| Bubble 内部接入 `TrMarkdown` | M3 | Done | M1 | `BubbleRenderers.Markdown` 已消费 `TrMarkdown` |
| 显式 markdown 内容类型 | M3 | Done | M3 | `{ type: 'markdown', text }` 可通过 provider-level match 显式启用 |
| Bubble markdown 配置边界 | M3/M5 | Partial | M3 | `contentAttributes` 当前仍承担 markdown 私有配置透传，边界需继续收紧 |
| 流式 smoothing | M4 | Done | M1 | `stableContent + tailContent` 分支已落地，tail 更新不再默认 re-parse 前序内容 |
| 不完整 token 展示策略 | M4 | Done | M4 | link / image / table / code fence 已可控 |
| Streaming block diff / reveal queue | M4.5 | Done | M4 | 已落地并补齐 telemetry、rewrite/reset、visible settling 与 finalized fallback 策略 |
| Text-only stream animation | M4.5 | In Progress | M4.5 | P0 已封口：paragraph / heading / list / blockquote 文本淡入、demo/test/profiler 观测闭环已补；token-level rewrite patch、token scheduler、root/block commit profiler 已进入 P0，剩余为跨 block / parser 级 token diff 后续 Spike |
| KaTeX / LaTeX | M5 | Done | M1 | 已完成 `$...$ / $$...$$`、第一方 math node、KaTeX 按需加载与错误 fallback 的最小闭环 |
| Footnotes | M5 | Done | M1 | 已完成第一方 footnote ref / list / backref 渲染，公开 demo 与 Playwright 回归已补齐 |
| GitHub Alert | M5 | Done | M1 | 已完成五类 GitHub alert、第一方 AlertBlock、公开 demo 与 Playwright 对照回归 |
| Image Gallery | M5 | Done | M1 | 已完成 markdown 自持的图片浏览能力接入，并补齐 demo / test |
| 插件与组件扩展点 | M5 | Partial | M1 | 最小边界已暴露，但 `useMarkdownContext` / `actionsRender` / adapter contract 仍需继续收口 |
| 独立 `TrMarkdown` 文档契约 | M5 | Partial | M3 | 组件已正式导出，但当前仍主要依附 Bubble 文档与内部方案文，需补独立公开入口 |

## 指标记录建议

为了避免阶段验收流于主观，建议在每个阶段至少记录以下信息：

- 新增依赖列表
- 默认路径是否新增重依赖
- 是否新增动态 import
- 典型样例渲染结果快照
- 大文档基准样例渲染表现
- 流式样例渲染表现（若阶段涉及）

建议为 `TrMarkdown` 建一个固定 benchmark/demo 集：

1. `basic.md`
2. `long-article.md`
3. `code-heavy.md`
4. `table-heavy.md`
5. `streaming-basic.md`
6. `streaming-code.md`

后续每个阶段都对同一批样例做回归。

## 当前验证结果摘要

基于本轮 `M0 + M1` 的静态验证，可以确认：

- `pnpm -F @opentiny/tiny-robot type-check` 已通过
- `pnpm -F @opentiny/tiny-robot build` 已通过
- 当前构建产物中：
  - `dist/markdown/index.js` 约 `10.73 kB`
  - 尚未引入 `Shiki`、`mermaid`、`KaTeX`

这说明当前 `M1` 默认路径仍然保持轻量，符合“基础路径轻、重能力后置”的目标。

基于本轮 `M2` code 专项收敛的最新验证，可以继续确认：

- `pnpm -F @opentiny/tiny-robot type-check` 已通过
- `pnpm -F @opentiny/tiny-robot build` 已通过
- `pnpm -F @opentiny/tiny-robot-markdown-demo type-check` 已通过
- `pnpm -F @opentiny/tiny-robot-markdown-demo build` 已通过
- `pnpm -F tiny-robot-test test -- src/markdown/index.spec.ts` 已通过
- `packages/components` 当前构建结果：
  - `514 modules transformed`
  - `dist/markdown/index.js` 约 `35.98 kB`，`gzip 8.73 kB`
- `packages/markdown-demo` 当前构建结果：
  - `267 modules transformed`
  - `assets/index.css` 约 `53.01 kB`，`gzip 8.16 kB`
  - 构建日志已不再出现 large chunk warning
- markdown demo 已补齐并独立展示这些 code cases：
  - `Inline code`
  - `Color models`
  - `Code blocks`
  - `Shiki Transformers`
  - `Custom Highlight`
- `packages/test/src/markdown/index.vue` 与 `packages/test/src/markdown/index.spec.ts` 已补 code 回归页与断言
- 已完成浅色 / 暗色主题下的 demo 页面实际截图核对
- 当前代码块交互规则已收口为：
  - 单行 fenced code：走 snippet 路径，紧凑高亮 + copy
  - 多行 fenced code：按 `overlay / full` 双模式分流
  - inline code：支持 `HEX / RGB / HSL` color preview
- 本轮对标 LobeUI 本地源码后确认并吸收的优化策略：
  - 单行 code 与多行 block code 分路径处理，不让完整 toolbar 默认进入轻量路径
  - `full` 能力显式进入，避免 Bubble / 默认场景承担 header、collapse、actions 的额外成本
  - copy / toolbar / collapse 状态与语法高亮输出解耦，减少无效重算
  - docs/demo 不把所有重案例首屏一次性挂载，而是让重案例延迟进入

基于本轮 `M4.5` P0 深度对标收口的最新验证，还可以继续确认：

- `pnpm -F @opentiny/tiny-robot type-check` 已通过
- `pnpm -F @opentiny/tiny-robot build` 已通过
- `pnpm -F @opentiny/tiny-robot-markdown-demo type-check` 已通过
- `pnpm -F @opentiny/tiny-robot-markdown-demo build` 已通过
- `pnpm -F tiny-robot-test build` 已通过
- `pnpm -F tiny-robot-test test -- src/markdown/index.spec.ts` 已通过
- `packages/components` 当前构建结果：
  - `531 modules transformed`
  - `dist/markdown/index.js` 约 `76.61 kB`，`gzip 18.97 kB`
- `packages/markdown-demo` 当前构建结果：
  - `3912 modules transformed`
  - 主入口 chunk 约 `327.40 kB`，`gzip 128.22 kB`
  - 当前未出现 large chunk warning
- `packages/test` 当前构建结果：
  - `3878 modules transformed`
  - 主入口 chunk 约 `979.94 kB`，仍有 large chunk warning
  - 该 warning 属于 E2E harness 自身打包整套 source-verify 测试页，不是 `TrMarkdown` 对外生产默认路径
- `M4.5` 当前正式 settle 策略：
  - `streaming.active = false` 后先进入可见 `settling`
  - 若 queue 已清空，也会保留短暂 finalize hold 暴露状态
  - `.stream-char` 清空后再回落为普通文本 DOM
- `M4.5` 当前正式 profiler / scheduler 策略：
  - stream profiler 以 root dataset 暴露事件快照，demo telemetry panel 可读取 timeline 与聚合指标
  - token scheduler 负责把 append / patch / reset 的 birth timeline、segment action 与计数统一返回
  - code / table / image / task checkbox / inline code 等 skip matrix 仍保持非字符动画路径

基于本轮“源码直连验证入口”硬化的最新验证，还可以继续确认：

- `pnpm -F @opentiny/tiny-robot-markdown-demo build` 已通过
- `pnpm -F tiny-robot-test build` 已通过
- `pnpm -F tiny-robot-test test -- src/markdown/index.spec.ts` 已通过
- `packages/markdown-demo` 当前 source-verify 构建结果：
  - `3912 modules transformed`
  - 主入口 chunk 约 `327.40 kB`
  - 当前未出现 large chunk warning
- `packages/test` 当前 source-verify 构建结果：
  - `3878 modules transformed`
  - 主入口 chunk 约 `979.94 kB`
  - 仍有 large chunk warning
- 上述 `modules transformed` 与早期 dist-based 验证数字不可直接横向比较：
  - 当前反映的是 workspace source graph 被真实遍历后的结果
  - 发布体积与默认路径预算仍以 `packages/components` 自身产物为准

结合本轮前后构建日志，对体积收敛可以继续确认：

- `packages/components` 在发布构建层继续收口：高级 Markdown 运行时 external 化后，从本轮优化前的 `2661 modules transformed` 收敛到 `522 modules transformed`
- `packages/components/dist/markdown/index.js` 当前约 `164.02 kB`，`gzip 39.75 kB`；dist 不再输出 `katex.min.css`、`mermaid.core.js`、`cytoscape.esm.js`、`wardley*.js` 等高级能力 chunk
- `packages/markdown-demo` 从上一轮的 `3960 modules transformed` 收敛到当前 `365`
- 之前由整包 `Shiki` 与错误 demo 入口带来的异常膨胀，当前已收回到显式白名单 + 专项入口模式

当前这一轮仍需关注的风险：

- consumer 侧使用 Mermaid / KaTeX / Shiki 时仍会按实际功能路径加载对应依赖；这是能力增量成本，不应被误判为默认路径成本
- `katex/dist/katex.min.css?url` 仍要求 consumer 构建器能处理 CSS URL import；当前 Vite consumer 已验证，非 Vite bundler 需要后续单独说明或适配
- 若后续新增语言、主题或高级 runtime 时绕过白名单 / external / dynamic import 约束，组件包与 demo 体积都可能再次回涨
- 临时 `check:markdown-bundle` 脚本已按提交前约定移除；当前仍未接入正式 CI 预算门禁，后续若持续演进再评估是否升级为正式检查

基于本轮 `M4` streaming 收口的最新验证，可以继续确认：

- `pnpm -F @opentiny/tiny-robot type-check` 已通过
- `pnpm -F @opentiny/tiny-robot build` 已通过
- `pnpm -F @opentiny/tiny-robot-markdown-demo type-check` 已通过
- `pnpm -F @opentiny/tiny-robot-markdown-demo build` 已通过
- `pnpm -F tiny-robot-test build` 已通过
- `pnpm -F tiny-robot-test test -- src/markdown/index.spec.ts` 已通过
- `packages/components` 当前构建结果：
  - `519 modules transformed`
  - `dist/markdown/index.js` 约 `41.65 kB / gzip 10.40 kB`
- `packages/markdown-demo` 当前构建结果：
  - `349 modules transformed`
  - `assets/index.css` 约 `64.74 kB / gzip 10.17 kB`
- `M4` 当前回归已明确覆盖：
  - text tail smoothing
  - incomplete link hold
  - incomplete code fence hold
  - incomplete table hold
  - parser 只在 `stableContent` 变化时重跑

## 建议优先级

如果资源有限，建议按下面顺序推进：

### P0

- `M0`
- `M1`
- `M2` 中的代码块基础能力

### P1

- `M3`
- `bubble` variant 打磨
- 图片/表格/引用专项样式

### P2

- `M4`

### P3

- `M5`

## 建议的近期行动

如果要从 roadmap 直接进入实现，建议下一步做这三件事：

1. 建立 `packages/components/src/markdown/` 目录骨架
2. 定义 `TrMarkdownProps`、`TrMarkdownParserAdapter`、`TrMarkdownComponentMap`
3. 用一版最小可行实现替换当前 `BubbleRenderers.Markdown` 的内部逻辑

## 配套文档

- 历史调研与迁移记录： [Markdown 归档](/guide/archive/markdown/)
- 当前 Bubble 文档：`docs/src/components/bubble.md`
