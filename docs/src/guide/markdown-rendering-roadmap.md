---
outline: deep
---

# Markdown 实施路线

本文从当前 `feat/markdown-comp` 源码出发规划下一轮 Markdown 实施，不重复 M0–M5 的历史建设计划。架构决策与硬边界见 [TrMarkdown 当前设计](/guide/markdown-rendering-design)；使用 API 见 [Markdown 组件](/components/markdown)。路线基准：2026-11-22。完成状态只有在代码和对应验收都完成后才勾选。

## 目标与顺序

本轮要将 TrMarkdown 从“功能齐全的实现”收敛为“默认结果可信、流式稳定、性能可解释、替换点经过验证”的组件库能力。顺序为：

1. 固定基线与契约，确认哪些差异是生产默认问题。
2. 修复当前流式围栏和异步高亮的正确性风险。
3. 统一 parse 触发条件，避免展示配置引发无关重解析。
4. 对生产默认排版和代码高亮做隔离的视觉校准。
5. 只有指标证明需要时，分别试验 remend、解析器复用/块缓存、流式代码高亮。
6. 完成全量验证与设计决策记录，决定是否保留新增依赖。

Parser/renderer 整体替换、通用 IR 重构和完整 renderer 移植不在本轮交付范围。

## 当前实现面

以下是路线起点，执行各阶段时应重新核实：

- 独立 `TrMarkdown` 与 Bubble Markdown 已共用 Vue 组件入口。
- 默认 parser adapter 是 markdown-it；结果映射到 `TrMarkdownRenderNode` 再由 Vue 节点和高级组件呈现。
- 支持 basic/animated streaming、稳定内容与 tail、若干不完整结构 hold、动画队列和 profiler。
- 支持 Highlight.js 默认高亮及可选 Shiki；特殊块包括 HTML Preview、Mermaid、Math、Footnotes、Alerts、Video、Image Gallery 与 citations。
- CT 位于 `packages/test/src/markdown-ct/*.spec.ts`，集成 E2E 位于 `packages/test/src/markdown/index.spec.ts`，演示案例在 `packages/markdown-demo`。
- demo 控件会设置排版变量。验收生产默认时应让演示样例不覆盖所验证的值，或单独标识 override。

当前工作树是 `feat/markdown-comp`；阶段实施沿用该工作树，不为同一任务新建分支或 worktree。保持用户现有改动，不清理无关文件。

## 总体验收门禁

### 正确性

- 相同原文在独立静态渲染、Bubble 渲染、流式完成后最终节点语义一致。
- append、插入、删除、非前缀 rewrite 和快速连续 rewrite 后无旧节点、旧高亮、旧异步结果或错误图片/图表残留。
- 有序列表起始编号、表格对齐、链接协议、code language 等语义信息在解析、IR 和 Vue 映射中保留。
- 任意临时补全只影响中途 UI；finalized 重新用原文解析，输出 DOM/文本与静态基准一致。
- 对本轮修复过的缺陷必须有可重复回归测试；阶段结束时用“触发样例 → 失败前行为 → 修复后的不变量”说明，不以文档提醒代替测试。

### 安全

- raw HTML 默认关闭。
- 危险 URL、事件属性、scriptable SVG、KaTeX 危险命令、Mermaid 输入和自定义节点走受控策略。
- HTML preview 只在 sandbox iframe 执行，source/copy/download 使用原始 fenced source。
- 任一 XSS fixture 成功执行或危险链接可触发，候选依赖/渲染路径直接不通过。

### 视觉

- 固定浏览器版本、字体（含中文与等宽字体）、容器宽度、主题、DPR、滚动位置和动画状态。
- 覆盖 standalone/Bubble、default/bubble/article、light/dark、桌面和 375px 窄屏。
- 同时保留“当前生产默认截图”和“校准后的候选截图”；测试比较必须使用同一文案。
- 评审标题层级、中文断行、段落节奏、嵌套列表、表格、引用、inline code、代码块、特殊块、操作反馈和 stream/finalized 连续性。
- 视觉改动不得通过要求业务方复制额外 CSS 才验收通过。

### 性能与发布

- 使用 `streamProfiler` 记录 parse 次数/耗时/输入长度/节点数；浏览器 Performance 记录更新延迟、long task 和首次文字/高亮可见时间。
- 比较当前生产构建的同步入口、异步 chunk 和实际 gzip，不使用 npm unpacked size代替。
- 高级依赖仍保持按需加载；报告每个 chunk 在何种用户行为下加载。
- 性能预算在 Spike 前由项目维护者确认并记录；未确认预算时先报告基线和增量，不杜撰硬门槛。

### 评审产物

- 行为改动附相关 CT/E2E 结果和关键 DOM/状态断言。
- 视觉改动附相同语料、视口、字体和主题的前后截图；影响流式体验时补关键状态录屏或逐状态截图。
- 性能/依赖改动附基线与候选数据，注明构建入口、设备/浏览器、chunk 触发条件及测量方法。
- 状态机改动附状态转换表；涉及多个可见状态或异步交互时附简明状态图。
- 安全改动附危险输入和最终呈现路径的验证结果。

## 阶段 0：冻结语料与生产默认基线

### 目标

建立可重复的基准，使后续实现能区分语义 bug、默认样式差异与高亮引擎差异。公开 demo 成为生产默认的真实展示，而不是只展示一套 demo 专用值。

### 实施步骤

1. 从当前 markdown-demo 和测试 fixture 选取 4–6 条短而有代表性的回答：中文多级标题/段落/列表；起始编号列表和嵌套任务列表；对齐表格与长单元格；引用/alert；inline code 与 TS/Python/SQL/YAML/未知语言代码；公式/Mermaid/图片混合内容。
2. 为两条流式样例记录确定性 chunk 序列：未闭合粗体/链接、围栏内出现 fence-like 文本、表格未完、代码增长、普通 append、同块 rewrite、段落删除、finalize。
3. 为 XSS/协议边界准备无执行断言 fixture：`javascript:`、事件属性、危险 HTML、SVG、数据 URL、KaTeX href 和 Mermaid 不合法输入。
4. 固定截图用的测试页/视口与字体。区分 `production defaults` 与显式 overrides，确认控制面板不会覆盖默认值组。
5. 保存当前 CT、E2E、类型检查、组件 build 的基线结果与 parse profiler 摘要。

### 产出

- 命名稳定、可复用的 Markdown fixture；流式 chunk 序列可被测试与 demo 共用。
- 独立/Bubble、light/dark、桌面/窄屏的初始截图。
- 当前源测试、类型检查和构建基线记录。

### 验收

- 固定语料每个 Markdown 能力有明确预期 DOM/可访问属性/回退状态。
- 测试能稳定复现 append、rewrite、finalize，不使用真实网络或不确定计时。
- 至少一组截图直接使用组件生产默认 props，不注入 demo 专属排版值。
- 不在本阶段调整样式或引擎，避免基线被污染。

### 阶段记录（2026-11-22）

- 已冻结 6 组静态语料：中文层级与嵌套任务列表、非 1 起始编号与对齐表格、引用/alert、常见及未知代码语言、公式/Mermaid/图片混合内容、安全边界输入。语料位于 `packages/components/src/markdown/fixtures/phase0.ts`，静态 CT 固定标题、列表、表格、代码和安全回退的 DOM 结果。
- 两组确定性流式序列覆盖 append、rewrite、删除段落和 finalize，并比较流式完成后的文本与同一原文静态渲染结果；另覆盖未闭合链接/粗体、未完成表格、代码追加及 fence-like 行。
- 截图覆盖 standalone light、Bubble light、375px Bubble dark。截图 harness 固定 Arial/PingFang SC/Microsoft YaHei sans-serif 字体回退、容器宽度、内边距、浏览器 Chromium 和动画状态；组件仍使用生产默认 props，没有 demo typography overrides。未将字体配置注入组件。
- 安全 CT 检查 Markdown 输入不会产生 script、事件属性或危险 SVG/URL；KaTeX `trust: false` 下公式正常降级/渲染且不生成 javascript 链接；非法 Mermaid 保留源代码并显示错误状态。测试不触发真实网络资源。
- 验收命令：`pnpm -F tiny-robot-test exec playwright test -c playwright-ct.config.ts --workers=1 --reporter=line src/markdown-ct/tr-markdown-phase0.spec.ts`（5 passed）；`pnpm -F tiny-robot-test exec playwright test -c playwright-ct.config.ts --workers=1 --reporter=line src/markdown-ct/tr-markdown-static.spec.ts`（6 passed）；`pnpm --filter @opentiny/tiny-robot type-check`（通过）；`git diff --check`（通过）。CT 走源码 alias；未运行完整 E2E、docs build 或 consumer dist build，本阶段记录为后续发布门禁而非已验证。
- 测试环境发现 CT adapter 与 runner 不能使用独立漂移的版本：Playwright 的 Babel AST 转换器混用时会在发现测试阶段报 `Couldn't find a Program`。`packages/test/package.json` 已将两项精确对齐到 `1.62.0`，与当前仓库可验证组合一致。
- 已发现语义缺口：`ordered_list_open` 的 parser node 带有起始编号信息，但 Vue `List` 映射目前只传 `ordered`，`<ol start="3">` 未保留。阶段 0 仅锁定这个结果；阶段 3 负责修复并将断言升级为要求 `start="3"`。

## 阶段 1：流式解析正确性修复

### 目标

修复围栏扫描重复且可能不一致的问题，明确尾部状态，并确保异步流式更新只提交当前输入的结果。

### 实施步骤

1. 盘点 `useIncompleteMarkdown.ts` 和 `useMarkdownSmoother.ts` 对 fence 的识别规则，定义共享 fence scanner 输出：marker 字符、opening run 长度、起止偏移、closed/open 状态。
2. 关闭 fence 必须和打开 fence marker 相同、长度不短于 opening run；关闭标记之后仅允许空白。代码体中的带 info string fence-like 行不得被误作关闭标记。
3. 两种流式路径复用同一 scanner；空输入、CRLF、前导最多 3 空格、不同长度反引号/波浪线、嵌套看似 opener、围栏结束后追加普通段落均建立纯函数用例。
4. 检查 parser 请求、流块提交、定时器和高亮请求的失效策略。每个异步结果须关联输入版本；不匹配时不可写入响应式状态。
5. 异步高亮状态需处理 disable、语言切换、引擎切换、主题变化和组件卸载；缓存旧 Promise 可复用，但旧请求不能覆盖新展示。
6. 加入 `prefers-reduced-motion` 处理，减少动画应跳过逐字 reveal，静态内容和流式内容仍然正确可读。

### 文件边界

- 主路径：`packages/components/src/markdown/stream/useIncompleteMarkdown.ts`、`useMarkdownSmoother.ts` 及新共享纯函数（若确有重复消除价值）。
- 高亮：`components/code-block/useCodeHighlight.ts` 与相关测试。
- animated lifecycle：只在竞态定位到 runtime/queue 后再最小修复，不顺手改队列架构。

### 验收

- 每个 fence fixture 在每个 chunk 边界上都有预期 stable/tail 范围；完成后解析树和一次性静态输入一致。
- 无未闭合围栏被提前当成闭合，也无已闭合围栏持续吞掉后续段落。
- 通过可控 deferred Promise 逆序完成的 CT，旧高亮不能覆盖新代码或已关闭状态。
- 插入、删除、前缀 append、非前缀 rewrite 和连续 rewrite 均无旧内容残留。
- reduced motion 下不启动字符 reveal，但最终内容及复制/链接等交互仍可用。

## 阶段 2：收窄解析依赖与消除无效重解析

### 目标

只在语法输入改变时运行 Markdown parser。外观能力切换和解析后数据变化采用更窄的更新路径，避免用户传 inline object 时产生不必要的 parse。

### 实施步骤

1. 列出 parser 真实消费字段：parser identity、HTML、linkify、typographer、breaks、math、footnotes，以及插件所需配置。
2. 将 parse invalidation key 与呈现 features 分开。image gallery、Mermaid 展示模式、copyable、主题/样式等不能单独触发 Markdown 语法解析。
3. citations 当前在 parse 后执行。将 citation 更新路径与 parser watch 分开，citation props 更新只对已有节点重新应用 citation transform；确认 transform 不会原地污染 parser 原始输出或重复包装节点。
4. 按配置缓存或复用 MarkdownIt 实例前，确认 parser.use 插件无跨文档可变状态、引用/环境数据隔离、HTML 配置隔离与并发安全。若无法证明安全，优先保持实例隔离。
5. 使用现有 `data-stream-parse-count` 和 profiler 比较变更前后；另记录 1K、10K、20K 字符 fixture 的 parse 时长，不先引入 block cache。

### 验收

- 仅切 image gallery、code toolbar、引用元数据或 theme 不增加 parser parse count。
- 改变 parser、语法选项或语法 feature 会重新解析，并正确更新输出。
- Citation update 的节点结果与从头 parse + citations 等价；重复 update 不累积 citation wrapper。
- 若实例复用，交错解析两个不同配置文档不会泄漏插件选项、token/meta 或内容。
- 不因消除 parse 而造成 Vue 组件漏更新。

## 阶段 3：统一生产默认视觉

### 目标

让组件文档、Markdown demo 和直接使用组件的人看到同一套默认规范；通过最常见内容验证 TinyRobot 的 UI 差距是否来自样式/组件设计，而非 parser。

### 实施步骤

1. 将阶段 0 的默认截图与 LobeUI chat 对照。固定字体、容器宽度、字号基线、主题中性色和内容；不追求像素克隆。
2. 先定 Bubble 的正文/标题关系。LobeUI chat 明确缩小标题层级，而 TinyRobot 当前 bubble 变量默认 heading scale 为 1；选择能让 AI 回答保持主次又不过度夸张的值，并同时检查 default/article。
3. 统一段落、标题、列表与 blockquote 的垂直节奏。修复列表起始编号、表格 alignment 等节点语义映射；CSS 调整不能弥补被 parser adapter 丢掉的属性。
4. 精调代码外框、padding、行高、语言标签、复制反馈、hover/focus 行为。先用相同高亮输出做容器调校。
5. 对 demo 的 controls 明确“生产默认”开关。推荐示例不注入与组件不同的值；覆盖演示使用单独名称和说明。
6. 校准 narrow viewport 的表格横滚、超长 URL/inline code、代码横滚和容器溢出；明暗主题都截图检查。

### 验收

- 盲评样例至少由 3 人评审，按中文可读性、层级/间距、列表/表格、代码块、主题一致性分别评分并记录意见。
- 组件默认 API 的截图与 Markdown demo 的默认场景相符；业务无需额外 CSS。
- Bubble/standalone 在相同 variant 下呈现一致字体、标题和块间距规则，容器自身差异只通过明确 variant/token 表达。
- 截图差异经人工 review；不允许仅依靠像素阈值忽略文字溢出、错位和对比度问题。
- 确认并保留语义回归：编号列表 start、表格左右/居中对齐、嵌套列表和 task checkbox。

## 阶段 4：代码高亮选择 Spike

### 目标

决定是否改变默认高亮引擎，且将 token 色彩、引擎能力、语言覆盖、异步等待和代码块容器作为独立变量评估。

### 对照组

1. 当前 Highlight.js + 当前主题。
2. Highlight.js 精调主题 + 补齐目标语言。
3. 当前 Shiki 路径 + 指定双主题/语言白名单。
4. 只有在用户明确要求增长中的代码着色时，增列 `@shikijs/stream` 原型；否则不加入本阶段默认比较。

### 实施步骤

1. 固定 TypeScript、Python、SQL、YAML、JSON、shell、未知语言、多语言混杂、超长行和 100+ 行内容。
2. 固定代码外框、字体、字号、行高、复制工具栏和语言标签，只替换高亮 HTML/token 结果。
3. 比较浅色/深色主题、常见语言准确性、未注册语言降级、首次文字可见与着色完成耗时。
4. 用生产 consumer build 检查初始同步 JS、首次代码渲染触发 chunk、gzip 体积和失败回退。
5. 流式 fenced code 的 append 与 rewrite 分别测试。若普通 plain tail 后在闭合时一次高亮更稳定，保留简单方案；不为动画增加 tokenizer，除非有体验需求。

### 决策门槛

- Shiki 仅在盲评中稳定改善可读性且语言正确性/主题成本可接受时提升默认优先级。
- 高亮异步等待不允许让代码内容消失；失败立即降级纯文本。
- 由维护者在测试前确认首屏和代码场景的 chunk 预算；记录实际增量，不把“懒加载”视为零成本。
- 若精调 Highlight.js 主题/语言覆盖已达到要求，保留现状，不因 LobeUI 使用 Shiki 就更换。
- `@shikijs/stream` 只有在持续着色带来明确价值且 recall token 可正确消费时才采用。

## 阶段 5：流式预处理与 renderer 候选 Spike

### 目标

验证 `remend` 是否比当前自有 hold/tail 对未闭合行内语法有净收益；评估单一完整 renderer 候选是否能替代足够多的自维护实现。原型独立放在 demo/test spike harness，不接入公共 API。

### 阶段 5A：remend

实现对照为 current vs current + remend（或同功能薄 adapter）。固定输入语料：中文无空格强调、嵌套强调、半个链接、半张图片、行内 code、行内 `$` 货币、未闭合 `$$`、fence、table、HTML、CJK 标点。

只将预处理用于临时展示。原始 source、citation offsets、复制源码、最终 parser 输入均不被改写。检查占位 URL 不可被当作真实可点击链接。对每个 chunk 和 finalize 记录误渲染、布局跳变与最终 DOM。

通过条件：目标未闭合语料中途态明显减少，finalized 与原始 source 的静态输出严格一致，无新增货币/链接/公式误判，无危险 placeholder link。由于 remend 不覆盖所有表格/围栏/重写语义，通过也不代表可以删除全部自有 stream logic；列出实际删除的 handler 后再决策。

### 阶段 5B：完整 renderer（可选）

只选一个候选，避免同时维护多个 demo adapter。优先依据 Vue 最低版本、是否可只拿 parser/stream 层、主题控制、HTML 安全、SSR、async component、维护风险、依赖边界选出候选。Comark 0.x 和 Markstream 生态先作为原型，不直接升级 TinyRobot peer Vue 范围或采用其默认 CSS。

对照 current MarkdownIt、候选默认 renderer、候选节点/解析输出接入 TinyRobot Vue renderer（若 API 允许）。同一主题下比较语法正确性、DOM 语义、流式中途与 finalized、重写、安全、包体积、adapter 复杂度。候选必须保留统一主题和节点交互，而不是以默认视觉截图作为唯一优势。

通过条件：在统一主题后仍具备无法低成本补齐的结构性优势，必要语法覆盖完整，安全门禁通过，生产包与性能在维护者预先设定容忍范围内，且能实际删除/替代具体维护逻辑。否则关闭 Spike，不替换主线。

## 阶段 6：收敛、文档与发布验证

### 实施步骤

1. 对每项 Spike 记录采用/不采用及证据，去除实验代码和无用依赖。
2. 更新 `TrMarkdown` 公开 API 文档、设计文档、路线图、demo 默认值与安全说明。
3. 核对包的 peer/dependencies、锁定版本、动态 import、Vite/Rollup external 与 consumer 安装要求。
4. 复查 docs 中的旧路线链接、候选版本事实和“已完成”状态，移除已过时的并行计划。
5. 运行受影响的 Markdown CT、集成 E2E、组件类型检查、文档 build 和组件 build。若测试 source alias 指向 src，另运行 consumer/build check 才能声称发布产物行为已验证。

### 验收

- 从组件文档能进入唯一当前设计和实施路线，不会进入相互冲突的旧路线图。
- 每项已接受的新增依赖有必要性、加载方式、许可证、版本与回滚说明。
- feature fixture 与所有 CT/E2E smoke 均通过；记录未运行或环境限制。
- 组件包构建与文档/consumer 行为的验证边界清楚说明。
- 当前 worktree 的无关修改保留，不清理其他 worktree。按任务约定，每个阶段由主 Agent 独立验收、更新进度后单独本地提交。

## 阶段状态

此表记录当前执行状态。代码已写入但验收未完成的阶段仍为「进行中」；视觉人工评审、选型决策和发布验证分别记录证据，不以源码用例结果代替。

| 阶段 | 状态 | 说明 |
|---|---|---|
| 0：冻结基线 | 已完成 | 固定语料、安全边界、生产默认截图与流式最终一致性 CT 已通过；有序列表 start 丢失登记到阶段 3 |
| 1：流式正确性 | 已完成 | 共享 fence scanner、异步高亮有效性与 reduced motion 已验收；19 项组合 CT、组件 type-check 通过。实现与边界记录见本表之后的阶段日志 |
| 2：解析触发条件 | 已完成 | 默认语法键、引用投影、自定义 adapter 兼容和旧解析失效已验收；保留 parser 实例隔离 |
| 3：默认视觉 | 待人工验收 | 标题、编号列表、表格语义、窄屏和 demo 默认测试通过；需 3 人盲评 |
| 4：高亮 Spike | 进行中 | 核对 Highlight.js、补齐语言并调色的 Highlight.js、Shiki 三组同容器对照与消费构建量测 |
| 5：预处理/renderer Spike | 已完成，保留现状 | remend 对部分行内中途态有帮助，未证明可删现有流逻辑；完整 renderer 不启动原型 |
| 6：收敛发布 | 进行中 | 聚合源码回归、生产文档和打包消费检查；待阶段 3 人工验收后收口 |

阶段可并行准备与评审，但实施依赖须遵守：0 → 1 → 2；视觉阶段 3 可在基线冻结后与纯流逻辑工作并行；高亮 4 与 remend 5A 可并行；完整 renderer 5B 等现有语义 fixture 定型、且有明确待验证优势后再启动。阶段 4、5 的验收允许以证据支持「保留现状」收尾；在预算或人工评分缺失时，不提升候选为生产默认。

### 阶段 1 记录（2026-11-22）

- 新增纯函数共享 fence scanner，`useIncompleteMarkdown` 与 smoother 不再各自解释闭合规则。支持相同 marker、closing run 不短于 opener、最多 3 个前导空格、closing 行仅接受 ASCII 空格/tab；LF/CRLF/CR 的源偏移和 info string 边界已覆盖。markdown-it 同步规则指出，反引号 opener 的 info string 不允许再含反引号；关闭 fence 的尾随空格仅按 CommonMark 空格/tab 判断。
- 异步高亮加入请求版本和卸载失效保护；当源码变化时立即移除旧代码的高亮结果，避免 pending 期间把旧代码样式套在新源码上；同源码的语言、引擎或主题变更期间保留现有展示，只有最新请求可提交。disable/空代码和异常回退为纯文本。
- `prefers-reduced-motion: reduce` 禁用 animated reveal，但不篡改 streaming active/tail 状态，内容仍可读。
- CT：`tr-markdown-phase1.spec.ts`、streaming、code/html、phase0 组合运行（`pnpm -F tiny-robot-test exec playwright test -c playwright-ct.config.ts --workers=1 --reporter=line src/markdown-ct/tr-markdown-phase1.spec.ts src/markdown-ct/tr-markdown-streaming.spec.ts src/markdown-ct/tr-markdown-code-html.spec.ts src/markdown-ct/tr-markdown-phase0.spec.ts --update-snapshots`，19 passed）；组件 `pnpm --filter @opentiny/tiny-robot type-check` 与 `git diff --check` 通过。CT 走源码 alias。

### 阶段 2 记录（2026-11-22）

- 默认 adapter 由稳定源文、adapter 身份、有效 HTML/linkify/typographer/breaks 和 math/footnotes 开关触发。Gallery、Mermaid 模式、复制、variant、引用元数据更新不重跑语法解析；自定义 adapter 仍按其收到的完整有效 options 响应变化，原有配置优先关系保持不变。
- 引用基于最近提交的原始解析节点单独计算，可更新、清空、再次应用；不累积包装。解析逆序返回或组件卸载时，失效请求不能提交。
- 独立验收 `TINY_ROBOT_MARKDOWN_BENCH=1 pnpm -F tiny-robot-test exec playwright test -c playwright-ct.config.ts --workers=1 --reporter=line src/markdown-ct/tr-markdown-phase2.spec.ts src/markdown-ct/tr-markdown-static.spec.ts`：15 passed（含 opt-in 量测），组件和测试 type-check、`git diff --check` 通过。测量由 Playwright 的 Node v22.23.4 worker 调用默认 adapter，每组 2 次预热、7 次采样，1K/10K/20K 字符的中位数约为 0.27/0.53/0.69 ms。数字只覆盖本机的简单重复段落和语法 tree 转换，不代表复杂文档、浏览器 DOM、着色、动画或低端设备。修改降低的是无关更新的 parse 次数，未改变单次 parser 算法。
- 暂不复用 markdown-it 实例或缓存块；该语料的耗时和目前已知的跨块失效成本不支持增加缓存。后续如真实长回答测量发现 parser 是瓶颈，再验证插件状态及文档隔离。

### 阶段 3 记录（2026-11-22）

- 原 Bubble 视觉 fixture 未加载生产 `bubble.less`，旧截图保留作历史记录。加载后发现生产 Bubble 字号 token 是 `inherit`，标题 `calc(inherit * …)` 计算无效。Bubble 标题以实际继承到的字号为基数，scale 候选值 `0.25`；默认和 article 仍使用各自的排版基数。LobeUI `dev`（`5c034056`）的 chat variant 默认正文 14px、行高 1.6，同倍率下 H1 为 19.25px。TinyRobot 的 16px Bubble fixture 验证 H1 为 22px；同一修复算法将 scale 临时设为 1 则为 40px，用于隔离倍率影响，并非旧故障截图。
- 列表保留 `start`（含 `0`），表格只转发 left/center/right 对齐，375px 下验证表格内部可滚动而页面不被撑开。demo 默认不注入排版 CSS，关闭「production defaults」才启用自定义值。
- `tr-markdown-phase0.spec.ts` + `tr-markdown-phase3.spec.ts`：7 项通过，核对并重建两张 Bubble 生产回归截图；demo 的默认排版切换 E2E 通过；组件和 demo type-check 通过。
- 待 3 人在同文案、同宽度、同主题条件下盲评中文可读性、标题层级/间距、列表/表格、代码块与主题一致性。此项尚未验收。

### 发布验证预检（2026-11-22）

- 在阶段 1 提交之后、阶段 2/3 候选修改期间运行 `pnpm build:components` 和 `pnpm -F docs build`，均通过。VitePress 输出既有的插件 Node 模块外部化和大 chunk 提示。组件库 `dist/markdown/index.js` 为 166.66 kB / 40.57 kB gzip，仅记录库入口，不包括下游打包器解析出的外部依赖。
- `pnpm -F tiny-robot-test exec playwright test --workers=1 --reporter=line src/markdown/index.spec.ts` 跑通 4 个源码集成用例，覆盖 Markdown 页面、Bubble 两条接入方式、iframe 和动画流式。最终阶段须对定版重跑，并另验证消费端产物。

### 阶段 5 记录（2026-11-22）

- `node phase5-remend-spike/run-phase5.mjs` 在独立 npm prefix 中加载 `remend@1.5.0`（Apache-2.0）。11 类语料共 53 个追加前缀、11 个原文收尾、3 个改写输入。与当前 hold/tail 对照时，默认 protocol 和 text-only 分别在 23 和 18 个前缀生成了当前稳定节点中尚未出现的目标语法节点；这是结构计数，不代表每一项视觉都改善。两组各有 26 次临时源文改写，默认及 text-only 分别有 8 和 3 个输入的占位值进入节点属性。后者仍包含图片占位，测试未推断点击或导航行为。
- 当前 `stableContent + tailContent` 在测试语料中保持原文；11 个收尾输入用 `active=false` 重新解析原文，结果与静态解析一致。此结果只确认原文收尾边界；试验未接入生产渲染，不能据此宣称替换后已通过组件、安全或性能验收。
- 默认保留共享围栏扫描、table hold、link/image hold 和 smoother。对未闭合强调和行内代码有明确产品诉求时，可再单测仅限这两类的临时补全，验证布局跳变和源码/复制/引用隔离。当前无生产依赖变更。
- 5B 不启动。`@comark/vue@0.9.2` 的 Vue peer `^3.5.43` 高于 TinyRobot 最低兼容版本；`markstream-vue@2.0.29` 声明 Vue `>=3.0.0`，本次未找到足以抵消节点映射、主题、回归和迁移成本的明确替换点。

## 每阶段工作记录模板

实施者每阶段在 PR 描述或工作记录中填写：

```text
目标与问题：
影响的公开契约/API：
源码路径：
实现选择及未选方案：
Fixtures/测试：
验证命令与结果：
性能或截图证据：
风险、回滚方式：
设计/路线文档更新：
```

## 开发反馈闭环

实现过程中遇到的问题按以下顺序处理，避免只把纠正写成下一位 Agent 可能忽略的说明：

1. **描述可复现失败：** 记录输入、配置、状态转换、实际结果和预期结果。对于 Markdown streaming，保留每个 chunk 的输入而不是只记录最后字符串。
2. **先建最小验证：** 用 CT、纯函数测试或固定 fixture 锁定 bug；需要视觉判断时冻结截图条件，需要状态推理时画转换表/状态图。
3. **修复根因：** 检查重复的解析规则、两套状态来源、过宽 watcher、异步失效和节点协议映射，不只覆盖当前例子。
4. **沉淀可执行护栏：** 判断是否需要类型/API 收窄、lint 规则或架构依赖规则。只有反复出现且规则有清晰替代路径时才新增全局禁令。
5. **让评审看到证据：** 报告相应测试、截图/录屏、profiler 或构建输出；说明仍未覆盖的边界。
6. **补充文档原因：** 将 API 意图、权衡和运维/升级限制记入设计文档；不要复制已有测试可以表达的行为规范。

### 本路线优先沉淀的错误类别

| 错误类别 | 可执行约束 | 评审证据 |
|---|---|---|
| fence scanner 把代码体内容当闭合标记 | 纯函数 chunk 序列回归与完整静态解析一致性 | 每个 chunk 的 stable/tail 结果、final DOM |
| 旧异步高亮覆盖新代码 | deferred Promise 逆序完成 CT | 展示内容和 language/engine 对应最新请求 |
| 展示 prop 触发无关 Markdown parse | parse count CT | 同一 fixture 下功能切换前后 parse count |
| token→node→Vue 丢失语义属性 | parser/renderer contract CT | 起始编号、表格 alignment 等 DOM 断言 |
| demo 和生产默认不一致 | 默认 props 的 demo/e2e visual baseline | 无额外 style override 的截图 |
| streaming finalized 状态残留临时内容 | 原文与 finalized snapshot 等价测试 | stream 前/后状态截图或 DOM 文本比较 |

### 状态图与注释约定

- Streaming 可视状态至少覆盖 `idle → streaming → settling/finalized`、append、rewrite/reset 和异步任务取消。新增状态或转换前更新转换表和相应测试。
- 复杂时序先画轻量 Mermaid state diagram；图不取代测试，也不要求给每个简单组件状态都画图。
- 注释保留给算法不变量、安全策略和非显然取舍。若某个注释只是解释“为什么这段明显代码存在”，优先改进命名或结构；若注释陈述必须始终成立的行为，尽量同时由测试/断言保护。
- 不将“一概禁注释”“一概禁定时器”“一概禁某 API”作为默认治理方式。先定位重复故障；全局规则需明确适用范围、错误信息和允许的受控出口。

## 不允许跳过的决策

- 默认视觉改变：先有同条件基线和多场景截图。
- 解析器或流式库新增：先列出替代/删除的自有代码及未覆盖语义。
- 高亮引擎变更：先冻结 token 主题与代码外框，报告消费构建体积。
- 任意 HTML/sanitizer 变更：先执行安全 fixture 和 sandbox 行为验证。
- 引入节点缓存：先证明跨块引用/脚注等依赖如何失效；rewrite 不满足即不能上线。
