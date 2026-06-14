---
outline: deep
---

# Markdown 实施 Checklist

本文档用于把 `M0` 和 `M1` 的实现前准备，固化成可直接执行的检查清单。

它不负责解释方案本身，只负责回答：

> 真正开始编码时，`M0` 和 `M1` 需要逐项确认什么，做完什么才算能进入下一步？

配套文档：

- 流程： [Markdown 渲染开发流程](/guide/archive/markdown/markdown-rendering-process)
- 设计： [TrMarkdown 设计方案](/guide/markdown-rendering-design)
- Spike： [Markdown 渲染 Spike 结论](/guide/archive/markdown/markdown-rendering-spike)
- 路线图： [Markdown 渲染 Roadmap](/guide/markdown-rendering-roadmap)

> 维护说明（2026-06-08）
>
> 这份文档当前降级为阶段执行附录，只保留 checklist 参考价值。
> 最新实现进度请以 [Markdown 渲染 Roadmap](/guide/markdown-rendering-roadmap) 为准；
> 公共 API、架构边界与已知问题请以 [TrMarkdown 设计方案](/guide/markdown-rendering-design) 为准。

## 使用方式

建议在真正开始 `M0` 和 `M1` 时，把这份清单作为逐项打勾的执行表。

## 历史进度更新（截至 2026-06-07）

- [x] markdown 验证入口已补一轮“源码直连”硬化：
  - `packages/test` 与 `packages/markdown-demo` 现在都显式为 `@opentiny/tiny-robot` / `@opentiny/tiny-robot-svgs` 配置了 workspace `src` alias
  - 两个入口都补了 `optimizeDeps.exclude`，避免 dev / E2E 再吃到旧 prebundle
  - `markdown-demo` / `packages/test` 的 `tsconfig` 已补 `Bundler`、`ES2022.Intl` 和 source-only type 支持，源码 alias 不再因为 consumer TS 配置过弱而失败
  - `packages/test` markdown Playwright 断言已从“抓瞬时 queue / settling 帧”收口到“验证正式 scheduler 契约”，减少 streaming 回归误报
- [x] `markdown-demo` 已拆成两层：
  - `Public parity`：公开对标层，按 LobeUI section 心智组织
  - `Internal regression`：内部回归层，保留 article / Bubble 集成等实现验收 case
- [x] `markdown-demo` 公开浏览路径已补第一轮可用性收口：
  - 顶部 case browser 支持 section 切换与单 case focus
  - 右侧导航已从长 TOC 收敛为 section + case 两级浏览
  - `Public parity` 视图默认落到首个公开 section，并把 playground controls 收到预览下方按需展开
  - `Public parity` 仅在单 case focus 时展示源码，`Internal regression` 继续保持更直接的源码 / controls 回归视图
- [x] `markdown-demo` 复杂与扩展型公开 section 已补第二轮叙事收口：
  - `Media` 默认只展示基础图片节点，`Image gallery` 改为 narrative chips 进入
  - `Code` 默认只展示 `inline code + code blocks`，`Color preview / Transformers / Custom actions` 改为 narrative chips 进入
  - `HTML Preview` 默认只展示 `document preview + fragment fallback`
  - `Streamdown` 默认只展示可阅读主回答
  - `Custom` 默认只展示 `components + componentProps`
  - `Math and Diagrams` 默认只展示公式与图表主路径，错误态改为 narrative chips 进入
  - `Footnotes` 默认只展示 `single footnote + inline footnote`
  - `Alerts` 默认只展示五类官方 alert
  - gallery / transformer / streaming / profiler / render hook 等复杂 case 统一下沉到 section narrative chips 进入
- [x] 公开 demo section 已收敛为：
  - `Basic / Media / Lists / Code / HTML Preview / Math and Diagrams / Footnotes / Alerts / Variants / Streamdown / Custom / APIs`
- [x] `Long article` 与 `Bubble integration` 已从公开主路径移出，不再和基础 typography / 公开 code 案例重复展示
- [x] 公开 streaming 已拆成三段职责：
  - `Streamdown`
  - `Streamdown Profiler`
  - `Character Animation Loss Repro`
- [x] `M4.5` 原先未补的 animated fixture 已推进到 demo / test：
  - `heading + list`
  - `quote + paragraph`
  - `fast chunks`
  - `high TPS burst`
  - `settling append`
- [x] `Basic` demo 已覆盖 `headings / paragraph / long article / styling text / break lines / quoting text / links / lists / task lists / bubble variant / tables`
- [x] `marginMultiple` 已统一作用到 `paragraph / heading / blockquote / list / table / hr` 等基础节点间距
- [x] 显式 `<br>` 已进入 parser / render / test 链路，并补掉了 `<br>` 后重复 `softbreak` 的问题
- [x] demo 右侧面板当前统一控制整块 markdown 渲染内容，不再拆 code 与 typography 两套独立字号 / 行高模型
- [x] task list / checkbox 已进入默认静态实现，并补到 demo / test / bubble 集成回归
- [x] long-article / bubble 排版回归已补齐
- [x] Bubble 集成已补齐两条正式路径：
  - fallback renderer + string content
  - provider-level match + `{ type: 'markdown', text }`
- [x] `BubbleRenderers.Markdown` 已支持消费 provider `contentAttributes` / renderer attributes，并可继续透传 `style / code / link / parserOptions / features`
- [x] Bubble markdown 的当前策略已明确为“显式启用而非默认匹配”，以避免普通 Bubble 主路径承担 markdown 运行时代价
- [x] `TrMarkdown` 已补 `streaming` 配置入口，并按 `stableContent + tailContent` 拆出流式分支
- [x] `M4` 第一阶段已覆盖 `text tail smoothing / incomplete link / incomplete code fence / incomplete table`
- [x] `M4` 第二阶段已补 `incomplete image` hold
- [x] `markdown-demo` 已补 `LobeUI` 对标的 streaming repro case：
  - `large append`
  - `paragraph burst`
- [x] `markdown-demo` 已补独立 `Streaming` case，右侧 control panel 可按固定 step 驱动左侧热更新
- [x] `packages/test` 已补 streaming 回归页与 Playwright 断言
- [x] 经本地 `LobeUI` 源码对照，当前明确不作为 `M4` 实现门禁的项：
  - `useStreamQueue` 对应的 per-char animation queue 在当时被延后到 `M4.5 animated` 路径处理
  - parser 级 token-level diff
- [x] `M4.5` 已完成目标冻结：
  - 继续沿现有 `TrMarkdown` 第一方 streaming 分支推进
  - 不替换主线 markdown renderer
- [x] `M4.5` 基础库决策已完成：
  - 直接复用 `@vueuse/core/useRafFn`
  - 直接复用 `unicode-segmenter`
  - `fast-array-diff` 仅作为小依赖备选
  - 当前不采用通用动画框架、`Splitting.js` 或第二 markdown parser
- [x] `M4.5` 已进入第一轮实现：
  - 已新增 `streaming.mode = 'animated'` 与 `preset`
  - 已补 markdown-it block `position`，animated path 不再依赖 index key
  - 已落 `useStreamBlockDiff` / `useStreamRevealQueue` / `useStreamTextAnimation` / `StreamAnimatedText`
  - `markdown-demo` 已补 `rewrite/reset` fixture，并把 repro case 切到 animated 模式
- [x] `M4.5` 第一阶段 scope 已完成收口：
  - `TrMarkdown` root 已补 `stream state / scheduler phase / queueLength / blockCount / activeIndex / animatingIndex / streamingIndex / charDelay / fadeDuration / settleHoldMs / activeBlockCount / revealedCount / pendingCount / rewriteCount / resetCount / parseCount` telemetry
  - `markdown-demo` 已补预览侧与控制侧 telemetry 面板，并把自动回放改成“等待 finalized 后再 loop”
  - `useStreamTextAnimation` 已补 backlog cap，`streaming.active = false` 当前正式策略已收敛为 `visible settling -> finalized plain text DOM`
  - `useStreamRevealQueue` 已显式区分 `animatingIndex / streamingIndex`，并补 `append during settling` 的 finalize 撤销策略
  - `packages/test` 已补 `large append / paragraph burst / fast chunks / high TPS / heading + list / quote + paragraph / settling append / rewrite-reset / skip matrix / finalized cleanup` 回归
  - 已完成 `type-check / build / playwright` 验证闭环
- [x] `M4.5` token-level rewrite patch 已进入正式 P0：
  - 新增 `stream/streamTokenPatch.ts`，以 grapheme 为单位生成 `equal / insert / delete / replace` patch segments
  - 新增 `stream/useStreamTokenScheduler.ts`，把 patch 结果收敛为 `idle / append / patch / reset` 调度动作
  - `useStreamTextAnimation` 在同一 block、同一 revision、同时具备公共前缀与后缀时复用未变字符的 birth timeline
  - `useStreamBlockDiff` 已把 `rewrite` 与 `hardReset` 分离，结构变化才递增 `resetRevision`
  - root telemetry 已新增 `updateKind / hardReset / skippedCharCount / skippedNodeCount / skippedBuckets`
  - `markdown-demo` 已新增 `Streaming rewrite patch` 专项 case
  - `packages/test` 已补同块 rewrite patch 与结构变化 hard reset 的区分断言
- [x] `M4.5` stream profiler 已进入正式 P0：
  - 新增 `stream/streamProfiler.ts`
  - root dataset 已暴露 profiler enabled / event count / timeline / root commit / block commit / input / parse / block diff / queue / settle / finalize / frame / token schedule 聚合指标
  - `MarkdownStreamingTelemetryPanel` 已补 profiler 观察区，并按 root / block / input / parse / diff / queue / frame / token 分组展示
  - `packages/test` 已补 profiler enabled、event count、root commit count、block commit count、token schedule count、finalize count、rewrite input count、token preserved count 断言
- [x] `M4.5` P0 闭环已补齐：
  - profiler 事件语义与 root / block commit 命名已对齐
  - profiler 面板已补齐 timeline / FPS / frame duration / root commit cost / block commit cost
  - token patch 回归已补齐同块 rewrite / 插删改 / hard reset / finalized cleanup
  - 文档边界已回填，明确跨 block / parser 级 token diff 不进入当前默认主线
- [x] 本轮源码直连验证结果已确认：
  - `pnpm -F @opentiny/tiny-robot type-check` 已通过
  - `pnpm -F @opentiny/tiny-robot build` 已通过
  - `pnpm -F @opentiny/tiny-robot-markdown-demo type-check` 已通过
  - `pnpm -F @opentiny/tiny-robot-markdown-demo build` 已通过
  - `pnpm -F tiny-robot-test build` 已通过
  - `pnpm -F tiny-robot-test test -- src/markdown/index.spec.ts` 已通过
  - `packages/components` 当前构建结果为 `531 modules transformed`，`dist/markdown/index.js` 约 `76.61 kB / gzip 18.97 kB`
  - `packages/markdown-demo` 当前 source-verify 构建结果为 `3912 modules transformed`，主入口 chunk 约 `327.40 kB / gzip 128.22 kB`，无 large chunk warning
  - `packages/test` 当前 source-verify 构建结果为 `3878 modules transformed`，主入口 chunk 约 `979.94 kB / gzip 334.27 kB`，仍有 large chunk warning
  - 上述 `modules transformed` 已不再与早期 dist-based 验证数字直接横向比较，发布体积仍应以 `packages/components` 自身构建产物为准
- [x] `M4.5` 后续剩余项已缩小为更深一层的 LobeUI profiler 对齐并回填到 P0：
  - root / block 事件命名、timeline label 与 dataset 字段已统一
  - profiler 面板的可视化时间轴、FPS / frame duration / commit cost 已拆分
  - token patch 回归已补齐同块 rewrite / 插删改 / hard reset / finalized cleanup
  - 跨 block / parser 级 token diff 继续保留为后续 Spike，不进入当前默认主线
- [x] `M5` 已进入局部实现：
  - `HTML Preview` 基础静态路径已落地：完整 HTML 文档识别、iframe sandbox + srcdoc、Preview / Code、copy / download、fragment fallback、dark mode 都已进入实现、demo 与 Playwright
  - `HTML Preview streaming parity` 已完成：`streamingMode = auto / live / defer` 已接入运行时分流，无 `<script>` 文档支持 live mount，`auto` 下的 script-lock / defer 语义、demo 与 Playwright 已补齐
  - `Mermaid` 已完成最小闭环收口：`mermaid` fenced block 分流、动态 import、theme/loading/error/retry/source copy 已进入代码，公开 `Math and Diagrams` 已补 `flowchart / sequence / invalid syntax`，并已通过类型检查与 Playwright 回归
  - `KaTeX / LaTeX` 已完成最小闭环收口：第一方 `math-inline / math-block` 节点、`$...$ / $$...$$` 语法、KaTeX runtime/CSS 按需加载、错误 fallback 已进入代码，公开 `Math and Diagrams` 已补 `inline / block / invalid formula`，并已通过类型检查与 Playwright 回归
  - `Footnotes` 已完成最小闭环收口：第一方 footnote ref / list / backref、单脚注 / 重复引用 / 行内脚注 demo，以及 Playwright 回归都已补齐
  - `Alerts` 已完成最小闭环收口：五类 GitHub alert、第一方 `AlertBlock`、公开 demo 与 Playwright 对照回归已补齐
  - `Videos` 已完成最小闭环收口：独立 `<video ... />` block 已进入第一方媒体节点路径，公开 `Media` section、测试页与 Playwright 回归都已补齐
  - `Citations` 已完成最小闭环收口：`citations` 第一方数据入口、正文 `[1]` 引用节点化、来源卡片 demo、代码边界 case 与 Playwright 回归都已补齐
  - `Custom Plugins` 已完成第一方语义块收口：`tr-thinking / tr-artifact` 已进入 parser -> render -> demo -> Playwright 链路，用来对齐 LobeUI 公开 custom plugins 的展示结果，同时继续冻结 `remarkPlugins / rehypePlugins / plugins`
  - markdown 内部容器层已完成本阶段收口：`html-preview / mermaid / math` 的 floating toolbar、preview/source toggle、loading surface、status surface、source block 与共享样式骨架已统一到内部 shared 层
- [x] `M5` 剩余起步任务待确认：
  - 插件与扩展点公开边界已按“第一方语义块公开、通用插件接口继续 internal”收口

## LobeUI Public Demo Checklist

## 目标

把 `markdown-demo` 的公开层收敛成与 LobeUI 一致的 section 心智，同时把 TinyRobot 自己的集成回归和 streaming 验收内容隔离出去。

## Checklist

- [x] 公开层与内部回归层拆分
- [x] 公开层 section 顺序对齐为 `Basic / Media / Lists / Code / HTML Preview / Math and Diagrams / Footnotes / Alerts / Variants / Streamdown / Custom / APIs`
- [x] 基础列表从 `Basic` 中拆出，避免和段落/标题重复混排展示
- [x] `Long article` 不再作为公开 `Basic` 案例重复出现
- [x] `Bubble integration` 不再作为公开主路径 case 重复出现
- [x] 公开 `Streamdown` 已拆成 `Streamdown / Streamdown Profiler / Character Animation Loss Repro`
- [x] `heading + list` animated fixture 已补到 demo / test
- [x] `quote + paragraph` animated fixture 已补到 demo / test
- [x] 已补 `Images` 公开 case
- [x] 已补 `HTML Preview` 公开 case
- [x] 已补 `Math and Diagrams` 公开 case（当前覆盖 KaTeX + Mermaid）
- [x] 已补 `Footnotes` 公开 case
- [x] 已补 `Variants` 公开 case
- [x] 已补 `Markdown Components` 公开 case
- [x] `Videos` 公开 case
- [x] `Alerts` 公开 case
- [x] `Custom / Citations` 完整公开 case
- [x] `Custom Plugins` 完整公开 case
- [x] 达到与 LobeUI 公开 Markdown docs 的完整能力一致（当前公开 gap 已收口为零）

## M0 Checklist

## 目标

建立 `TrMarkdown` 的模块边界和目录骨架，不做正式功能能力。

## 开始前确认

- [ ] 已阅读调研文档
- [ ] 已阅读设计文档
- [ ] 已阅读流程文档
- [ ] 已阅读 roadmap
- [ ] 已确认当前阶段不做高级能力

## 目录与导出

- [ ] 新建 `packages/components/src/markdown/`
- [ ] 新建 `index.ts`
- [ ] 新建 `index.type.ts`
- [ ] 新建 `TrMarkdown.vue`
- [ ] 预留 `parser/`
- [ ] 预留 `render/`
- [ ] 预留 `stream/`
- [ ] 预留 `components/`
- [ ] 预留 `styles/`

## 边界定义

- [ ] 明确 `TrMarkdown` 是统一入口组件
- [ ] 明确 `BubbleRenderers.Markdown` 后续只是适配层
- [ ] 明确静态与流式将是两条分支
- [ ] 明确默认路径不带重能力

## 类型与接口

- [ ] 预留 `TrMarkdownProps`
- [ ] 预留 `TrMarkdownParserAdapter`
- [ ] 预留 `TrMarkdownComponentMap`
- [ ] 预留 `variant` 概念
- [ ] 预留 `streaming` 概念

## 构建与导出检查

- [ ] 不新增默认运行时重依赖
- [ ] 不破坏 `packages/components/src/index.ts` 现有导出结构
- [ ] 不影响当前主包构建策略

## 文档回填

- [ ] design 文档中的目录结构与现实一致
- [ ] roadmap 中 `M0` 进入可执行状态

## M0 通过条件

- [ ] 目录骨架存在
- [ ] 导出边界明确
- [ ] 不引入重依赖
- [ ] 文档同步完成

## M1 Checklist

## 目标

完成第一版静态 Markdown 基座，支持基础 Markdown 节点与 `bubble` variant。

## 开始前确认

- [ ] `M0` 已完成
- [ ] 静态底层路线已拍板
- [ ] 默认路径轻量原则已确认
- [ ] fixture 规划已冻结

## 选型确认

- [ ] 确定静态路径优先采用哪条路线：
  - [ ] `Comark`
  - [ ] `@crazydos/vue-markdown`
  - [ ] `markdown-it` + 自建 IR/render
- [ ] 说明未选路线的原因

## 基础节点能力

- [ ] 标题
- [ ] 段落
- [ ] 列表
- [ ] 引用
- [ ] 分隔线
- [ ] 链接
- [ ] 图片
- [ ] 行内代码
- [ ] 基础代码块容器
- [ ] 表格

## 组件映射

- [ ] 预留 `components` 覆写能力
- [ ] 至少支持 `paragraph / heading / link / image / codeBlock / table`

## 样式与 variant

- [ ] 建立 `--tr-markdown-*` 第一版变量
- [ ] 建立 `default` variant
- [ ] 建立 `bubble` variant
- [ ] 不依赖 `markdown-body` 作为主心智

## 性能与体积检查

- [ ] 默认路径不引入 `Shiki`
- [ ] 默认路径不引入 `mermaid`
- [ ] 默认路径不引入 `KaTeX`
- [ ] 若用到 parser 依赖，确认是否 external / 可 lazy
- [ ] 普通文本渲染路径没有回退到最终整段 `v-html`

## 测试准备

- [ ] `basic.md`
- [ ] `long-article.md`
- [ ] `table-heavy.md`
- [ ] `bubble-chat.md`

## 测试内容

- [ ] 基础节点单元测试
- [ ] variant 测试
- [ ] 组件映射测试
- [ ] Bubble 集成基础测试
- [ ] 长文档场景回归

## M1 通过条件

- [ ] 基础 Markdown 静态渲染已可用
- [ ] `bubble` variant 生效
- [ ] 默认路径轻量约束满足
- [ ] fixture 可用于下一阶段回归
- [ ] 没有把流式能力、高级能力提前混进来

## 进入 M2 前的确认

- [ ] 代码块是否需要独立成专项子系统，已获得确认
- [ ] 高亮底层候选是否已明确
- [ ] 当前基础路径是否稳定

## M2 Checklist

## 目标

把 code 模块从“基础节点可渲染”推进到“对标 LobeUI docs 的正式 code 子系统”。

## 开始前确认

- [x] 已阅读 `markdown-codeblock-lobeui-report`
- [x] 已确认默认高亮主路径继续使用 `highlight.js/core`
- [x] 已确认 `Shiki` 只作为高级 code case 的可选路径
- [x] 已确认 docs/demo 场景与 Bubble 场景允许采用不同 code block 形态

## 配置模型

- [x] `TrMarkdownProps` 补正式 `code` 配置入口
- [x] 支持 `copyable`
- [x] 支持 `showLanguage`
- [x] 支持 `blockMode`
- [x] 支持 `defaultExpand`
- [x] 支持 `inlineColorPreview`
- [x] 支持高级 actions 扩展点

## code path 分型

- [x] inline code 保持轻量基础样式
- [x] 支持 color preview inline code
- [x] single-line fenced code 走 snippet 路径
- [x] multi-line fenced code 走 block 路径
- [x] docs 场景支持 `full` 模式
- [x] bubble / 紧凑场景保留 `overlay` 模式

## 高亮策略

- [x] 默认 `highlight.js` 路径可用
- [x] 高级 `Shiki` 路径可显式开启
- [x] `Shiki` 已收敛到显式语言 / 主题白名单
- [x] transformer 仅在高级路径生效
- [x] copy / hover / collapse 不触发代码内容重算

## 对标案例

- [x] `Inline code`
- [x] `Color models`
- [x] `Code blocks`
- [x] `Shiki Transformers`
- [x] `Custom Highlight`

## demo / test / 验收

- [x] markdown demo 补齐所有 code 案例
- [x] 右侧控制项可驱动 code 关键表现
- [x] demo 已切到 markdown / theme-provider 专项入口
- [x] 重 code case 已支持延迟挂载
- [x] `packages/test` 补关键 code 回归场景
- [x] `type-check`
- [x] `build`
- [x] Playwright 断言
- [x] `packages/components` 构建收敛到 `514 modules transformed`
- [x] `dist/markdown/index.js` 收敛到 `35.98 kB / gzip 8.73 kB`
- [x] `packages/markdown-demo` 构建收敛到 `267 modules transformed`
- [x] demo 构建日志已不再出现 large chunk warning

## M2 通过条件

- [x] 所有 code 案例可在 demo 中独立查看
- [x] docs 场景与 Bubble 场景 code block 形态清晰
- [x] 默认路径仍保持 `highlight.js` 主路径
- [x] 高级能力只在显式开启时进入
- [x] 文档、实现、demo、验证结果同步完成

## M3 Checklist

## 目标

把 `TrMarkdown` 在 Bubble 里的接入方式收口成正式的对外使用边界，并补齐回归样例。

## 开始前确认

- [x] `BubbleRenderers.Markdown` 已切换到 `TrMarkdown`
- [x] 已确认不把 markdown 默认匹配硬塞进 Bubble 主路径
- [x] 已确认需要同时覆盖 fallback 路径和显式 markdown content type 路径

## 接入边界

- [x] string content 可通过 `fallbackContentRenderer={BubbleRenderers.Markdown}` 接入
- [x] `{ type: 'markdown', text }` 可通过 provider-level `contentRendererMatches` 显式启用
- [x] `BubbleRenderers.Markdown` 默认仍以 `bubble` variant 为主
- [x] `contentAttributes` / renderer attributes 可继续向 `TrMarkdown` 透传配置

## 配置传递

- [x] `style`
- [x] `code`
- [x] `link`
- [x] `parserOptions`
- [x] `features`
- [x] 透传边界已在设计文档中明确

## demo / test / 验收

- [x] `markdown-demo` 已补独立 `Bubble` 集成案例
- [x] 右侧控制项可继续驱动 bubble 内部 markdown 渲染
- [x] `packages/test` 已补 fallback / explicit content type 两条回归路径
- [x] Playwright 已覆盖 Bubble markdown 配置透传的关键断言

## M3 通过条件

- [x] Bubble 与 `TrMarkdown` 集成边界清晰
- [x] fallback 与显式 markdown content type 两条路径都可演示、可验证
- [x] 普通 Bubble 主路径不因 markdown 集成而默认承担 markdown 重能力

## M4 Checklist

## 目标

把 streaming markdown 从静态路径中独立出来，先解决最容易感知的尾部抖动、不完整 token 和 demo / test 验收闭环。

## 开始前确认

- [x] 已确认 `M4` 不推翻静态 `TrMarkdown` 基座
- [x] 已确认本轮先不引入 `streamdown-vue` / `Comark`
- [x] 已确认第一阶段覆盖的不完整结构为：
  - `link`
  - `code fence`
  - `table`
- [x] 已确认第二阶段补齐：
  - `image`
  - `LobeUI` streaming repro cases

## 分支实现

- [x] `TrMarkdownProps` 已补 `streaming?: boolean | TrMarkdownStreamingConfig`
- [x] `stream/useMarkdownStreamState.ts` 已建立
- [x] `stream/useMarkdownSmoother.ts` 已建立
- [x] `stream/useIncompleteMarkdown.ts` 已建立
- [x] `components/stream/StreamTail.vue` 已建立
- [x] 静态 parser 已改为只消费 `stableContent`
- [x] tail 渲染已独立于静态节点树

## 流式策略

- [x] text tail smoothing 可用
- [x] incomplete link hold 可用
- [x] incomplete image hold 可用
- [x] incomplete code fence hold 可用
- [x] incomplete table hold 可用
- [x] `showTail: false` 不再错误回灌整段 tail
- [x] parser 只在 `stableContent` 变化时重跑
- [x] 经本地 `LobeUI` 源码对照，当前明确不作为实现门禁：
  - `M4` 自身不以 per-char animation queue / scheduler 为通过条件，相关能力已进入 `M4.5`
  - token-level diff

## demo / test / 验收

- [x] `packages/components/src/markdown/fixtures/streaming.ts` 已成为当前 streaming fixture 基线
- [x] `markdown-demo` 已补 `Streaming markdown` 案例
- [x] `markdown-demo` 已补 `Streaming repro` 案例
- [x] demo control panel 已补场景切换与 step 控制
- [x] `packages/test/src/markdown/index.vue` 已补 streaming 回归页
- [x] Playwright 已覆盖：
  - incomplete link
  - incomplete image
  - incomplete code fence
  - incomplete table
  - smoothing parse count
- [x] `pnpm -F @opentiny/tiny-robot type-check`
- [x] `pnpm -F @opentiny/tiny-robot build`
- [x] `pnpm -F @opentiny/tiny-robot-markdown-demo type-check`
- [x] `pnpm -F @opentiny/tiny-robot-markdown-demo build`
- [x] `pnpm -F tiny-robot-test build`
- [x] `pnpm -F tiny-robot-test test -- src/markdown/index.spec.ts`

## M4 通过条件

- [x] streaming 分支对静态路径零侵入
- [x] 常见不完整结构已有稳定展示策略
- [x] demo、test、文档和实现已经同步
- [x] 当前阶段未把新重依赖带入默认路径

## M4.5 Checklist

## 目标

在不更换 markdown 基座的前提下，补齐接近 `LobeUI` 的 streaming animation 体验。

## 开始前确认

- [x] 已确认继续沿现有 `TrMarkdown` 第一方 streaming 分支推进
- [x] 已确认不引入新的整套 markdown renderer
- [x] 已确认不引入通用动画框架
- [x] 已确认 `M4.5` 属于 `M4` 之后、`M5` 之前的专项收口阶段

## 基础库决策

- [x] 直接复用 `@vueuse/core/useRafFn`
- [x] 直接复用 `unicode-segmenter`
- [x] `fast-array-diff` 仅作为可选小依赖备选
- [x] `framesync` / `@sanity/diff-match-patch` / `micromark` 继续保留为后续 Spike
- [x] 当前不采用：
  - `motion`
  - `motion-v`
  - `@vueuse/motion`
  - `Splitting.js`
  - 第二 markdown parser

## 模块设计

- [x] 明确 stream-only block model / block identity 契约
- [x] animated streaming 路径切换到非 index 的稳定 top-level key
- [x] `stream/useStreamBlockDiff.ts`
- [x] `stream/useStreamRevealQueue.ts`
- [x] `stream/useStreamTextAnimation.ts`
- [x] `stream/streamingAnimation.type.ts`
- [x] `components/stream/StreamAnimatedText.vue`
- [x] `NodeRenderer` 与文本类节点接通 animation meta

## 生命周期策略

- [x] append update 沿用当前 queue
- [x] rewrite update 先进入 token patch；只有 block 数量或 block 类型/tag 变化时才触发 hard reset
- [x] `streaming.active = false` 会先进入可见 settling，再进入 finalized
- [x] queue 清空后回落为 plain text DOM
- [x] 不在 finalized 状态残留大量 `.stream-char`

## 动画节点策略

- [x] `paragraph` 进入动画路径
- [x] `heading` 进入动画路径
- [x] `listItem` 进入动画路径
- [x] `blockquote` 进入动画路径
- [x] `strong / em / link` 内部仅 text leaf 被拆分
- [x] `task checkbox` 永远跳过字符动画
- [x] `code / table / image / hr / raw html` 继续保持跳过
- [x] settled block 回落为普通文本 DOM
- [x] rewrite / reset 时可中止旧队列并重新对齐

## demo / test / 验收

- [x] `markdown-demo` 补 `Streaming Animation` 专项案例组
- [x] 覆盖 `large append`
- [x] 覆盖 `paragraph burst`
- [x] 覆盖 `fast chunks`
- [x] 覆盖 `high TPS burst`
- [x] 覆盖 `heading + list`
- [x] 覆盖 `quote + paragraph`
- [x] 覆盖 `settling append`
- [x] 覆盖 `rewrite / restart`
- [x] demo 可观察 `state / scheduler / update kind / hard reset / skipped chars / skipped nodes / queue / active/animating/streaming index / char delay / fade / settle hold / active block / revealed / pending / live span / rewrite/reset / parse`
- [x] demo 可观察 `profiler event count / grouped timeline / root commit / block commit / input / parse avg / block diff avg / queue events / settle / finalize / frames / FPS / token schedule`
- [x] `packages/test` 补 queue / token scheduler / profiler / token rewrite patch / hard reset / settled DOM / rewrite restart / skip matrix 回归
- [x] `pnpm -F @opentiny/tiny-robot type-check`
- [x] `pnpm -F @opentiny/tiny-robot build`
- [x] `pnpm -F @opentiny/tiny-robot-markdown-demo type-check`
- [x] `pnpm -F @opentiny/tiny-robot-markdown-demo build`
- [x] `pnpm -F tiny-robot-test build`
- [x] `pnpm -F tiny-robot-test test -- src/markdown/index.spec.ts`

## M4.5 通过条件

- [x] reveal queue 观感已可见
- [x] 文本类 block 的字符动画已落地
- [x] 当前 `M4` stable head + tail 基线没有退化
- [x] 默认路径未被新重依赖污染
- [x] demo、test、文档和实现同步完成

## M5 Checklist

## 目标

在不污染默认路径的前提下，逐步补齐高级节点能力与扩展点。

## 目标冻结

- [x] 已确认 `M5` 不再和 `M4` / `M2` 混做
- [x] 已确认先冻结顺序，再决定具体能力的最小切入面
- [x] 已确认当前推荐起手顺序：
  - `Mermaid`
  - `KaTeX / LaTeX`
  - `Footnotes`
  - `GitHub Alert`
  - `Image Gallery`
  - 插件与扩展点
  - 公开 docs parity 收口

## 阶段门禁

- [x] 默认路径不得自动引入 `Mermaid`
- [x] 默认路径不得自动引入 `KaTeX`
- [x] 默认路径不得自动启用 `HTML Preview`
- [x] 所有高级能力都必须显式开关控制
- [x] 所有重能力都必须支持延迟加载
- [x] 普通 Bubble 主路径不得默认承担高级 markdown 成本

## 当前非目标

- [x] 不在一轮里并行做完全部高级能力
- [x] 不为高级能力回退到整段 `v-html`
- [x] 不先抽象插件系统、后补真实节点实现

## 起步任务

- [x] `HTML Preview streaming parity` 的目标冻结 / 最小方案确认
- [x] `HTML Preview streaming parity` 的 demo / fixture / 验收基线
- [x] `Mermaid` 的目标冻结 / 最小方案确认
- [x] `Mermaid` 的 demo / fixture / 验收基线
- [x] `KaTeX / LaTeX` 的目标冻结 / 最小方案确认
- [x] `Footnotes` 的最小 parser / render 方案确认
- [x] 插件与扩展点的最小公开边界确认

## M5 Tasklist（持续更新）

### M5.0 阶段准备

- [x] 冻结 `features.htmlPreview / mermaid / math / footnotes / alerts / imageGallery`
- [x] 冻结默认关闭、按需加载、Bubble 普通路径不承载高级能力的门禁
- [x] 新增 M5 fixture 命名规则与 demo 分组
- [x] 补 M5 验证命令与体积记录模板

#### M5.0 冻结结果

- `features.htmlPreview`
  - 默认关闭
  - 仅 `html` fenced block 且命中完整 HTML 文档时进入 `HtmlPreviewBlock`
  - 公开配置保持 `enabled / copyable / downloadable / defaultHeight / defaultMode / fileName / sandbox / streamingMode`
- `features.mermaid`
  - 默认关闭
  - 仅 `mermaid` fenced block 命中时进入 `MermaidBlock`
  - 公开配置保持 `enabled / copyable / defaultMode`
- `features.math`
  - 默认关闭
  - 仅 `$...$ / $$...$$` 第一方 math 节点命中时启用
  - 当前公开配置保持 `enabled / copyable`
- `features.footnotes`
  - 默认关闭
  - 仅 parser token 命中脚注结构时启用第一方脚注节点
  - 当前公开配置仅冻结 `enabled`
- `features.alerts`
  - 默认关闭
  - 仅 blockquote render 命中 GitHub alert marker 时启用第一方 alert 外壳
  - 当前公开配置仅冻结 `enabled`
- `features.imageGallery`
  - 默认关闭
  - 默认图片节点继续轻量渲染；仅显式开启后才建立 gallery 索引、预览层与键盘交互
  - 当前公开配置保持 `enabled / showCaption / closeOnEscape`

#### M5.0 共同门禁

- 所有高级能力默认关闭
- 所有重能力只在命中对应 markdown 节点后按需加载，不进入普通静态文本路径
- Bubble 普通主路径不默认承载高级 markdown 能力；仅 `fallbackContentRenderer` 或 provider-level `contentRendererMatches` 显式接入
- 高级能力不得通过整段 `v-html` 回退实现
- 当前发布门禁仍以 `packages/components` 产物为准；`packages/test` 的大 chunk warning 不作为对外发布阻断

#### M5.0 demo 分组与命名

- 公开 demo 分组冻结为：
  - `Basic`
  - `Media`
  - `Lists`
  - `Code`
  - `HTML Preview`
  - `Math and Diagrams`
  - `Footnotes`
  - `Alerts`
  - `Variants`
  - `Streamdown`
  - `Custom`
- 内部回归分组冻结为：
  - `Internal Regression`
- `packages/markdown-demo/src/data/cases/*.ts` 继续按能力域一文件一组 case 维护
- `data-testid` 命名冻结为 `markdown-<domain>-<scenario>`
  - 例如 `markdown-html-preview-enabled`
  - `markdown-mermaid-flowchart`
  - `markdown-image-gallery-enabled`
- streaming / animated 场景继续沿用 `markdown-stream-*`、`markdown-stream-animated-*` 前缀，不与 M5 高级节点 case 混名

#### M5.0 验证命令模板

- 类型检查：
  - `pnpm -F @opentiny/tiny-robot type-check`
  - `pnpm -F @opentiny/tiny-robot-markdown-demo type-check`
- markdown 回归：
  - `pnpm -F tiny-robot-test test -- src/markdown/index.spec.ts`
- 体积记录：
  - `pnpm -F @opentiny/tiny-robot build`
  - `pnpm -F @opentiny/tiny-robot-markdown-demo build`
  - `pnpm -F tiny-robot-test build`

#### M5.0 体积记录模板

- `packages/components`
  - `modules transformed`
  - `dist/markdown/index.js`
  - gzip 体积
- `packages/markdown-demo`
  - `modules transformed`
  - 主入口 chunk 与 gzip 体积
  - 是否出现 large chunk warning
- `packages/test`
  - `modules transformed`
  - 主入口 chunk 与 gzip 体积
  - 仅作为 harness 参考，不作为发布门禁

### M5.1 HTML Preview streaming parity

- [x] `html` fenced code 识别并分流到 `HtmlPreviewBlock`
- [x] HTML Preview 使用 iframe sandbox + srcdoc 隔离渲染
- [x] 支持 Preview / Code 切换
- [x] 支持 copy code、download code、fallback、dark mode
- [x] demo 覆盖完整文档预览、fragment 回退和显式开关
- [x] test 覆盖默认关闭、显式开启、sandbox 属性与 Preview / Code 切换
- [x] 将 `streamingMode = auto / live / defer` 真正接入运行时分流
- [x] 补齐无 `<script>` 文档的 live streaming iframe 挂载
- [x] 补齐含 `<script>` 文档在 `auto` 下的 defer / script-lock 语义
- [x] demo 补齐 `HTML Preview` 公开 case与 `auto / live / defer` streaming case
- [x] test 补齐 live commit / defer fallback / completion flush 断言

### M5.2 Mermaid block

- [x] 识别 `mermaid` fenced code block
- [x] code 子系统分流到 `MermaidBlock`
- [x] `mermaid` 运行时动态加载
- [x] 支持 light / dark theme 映射
- [x] 支持 loading / error / retry / copy source
- [x] demo 覆盖 flowchart / sequence / invalid syntax
- [x] test 覆盖默认关闭、显式开启、非 mermaid code 不加载 mermaid

### M5.3 KaTeX / LaTeX

- [x] 冻结 inline math 与 block math 语法范围：`$...$ / $$...$$`
- [x] 沿当前 `markdown-it` adapter 扩展第一方 math parser，不回退到插件直接产出的 HTML 主路径
- [x] 公式能力动态加载并受 `features.math` 控制
- [x] 新增 `MathInline` / `MathBlock` 节点组件
- [x] demo 覆盖 inline formula、block formula、错误公式
- [x] test 覆盖开关、错误 fallback、普通 `$` 文本不误判

### M5.4 Footnotes

- [x] 选定 `markdown-it-footnote` 作为轻量 token 插件
- [x] footnote ref / footnote list 映射为第一方 Vue 节点
- [x] 统一锚点、返回链接、编号样式和可访问性
- [x] demo 覆盖单脚注、多脚注、脚注内 link / code
- [x] test 覆盖 parser token、render node、主题样式

### M5.5 GitHub Alert

- [x] 支持 `NOTE / TIP / IMPORTANT / WARNING / CAUTION`
- [x] 优先在 blockquote render 阶段轻量识别
- [x] 新增 `AlertBlock` 并走主题 token
- [x] demo 覆盖五类 alert 与普通 blockquote 对照
- [x] test 覆盖普通 blockquote 不被误判

### M5.6 Image Gallery

- [x] Image Gallery 仅在 `features.imageGallery` 开启时启用
- [x] Image Gallery 支持多图浏览、caption、alt、键盘关闭
- [x] demo 覆盖 gallery 多图、暗色模式
- [x] test 覆盖默认关闭、显式开启、多图切换、caption 与键盘关闭

### M5.7 插件与扩展点

- [x] 至少两类高级节点落地后再冻结 public API
- [x] 冻结 `components / componentProps / parserOptions / renderOptions / features`
- [x] 先完成 `componentProps` 的最小公开边界
- [x] 完成 `renderOptions` 的最小公开边界，并以 `alerts.render` 作为首个真实 render hook
- [x] 明确 public API 与 internal hook 边界
- [x] demo 覆盖 custom component / custom code action / custom alert render

## M5 进入实现前通过条件

- [x] 起手顺序明确
- [x] 阶段非目标明确
- [x] 默认路径门禁明确
- [x] 第一项能力的最小切入方案拍板
