# Kit Angular 适配执行计划与子代理任务

> 2026-09-27。配套目标：[angular-adaptation-goals.md](./angular-adaptation-goals.md)。工作目录：`D:/Projects/Work/tiny-robot-kit-angular`，分支 `feat/kit-angular`，基线 `robot/develop@0f75d2c`。
>
> 当前状态（2026-10-05最新交接）：D3共享manager/Vue及存储/出口修复已落地；kit275通过/1跳过，lint、clean build、Angular20严格声明/构建/32项TestBed通过。最新浏览器取消资源探针失败、Angular21宿主peer安装失败；列表API待评审，完整A1未通过。本轮已授权本地检查点提交，推送/发布另评审。结果和下一任务见[P7清单](./angular-adaptation-p7-readiness.md)。下方进度表保留历史结论，旧“完成”不能覆盖失败/未运行。实施继续使用`gpt-6.1-sol high`子代理，主代理负责审查。

## 1. 执行纪律

- 每个实现任务使用一个有边界的子代理；任务依赖顺序执行。允许无文件重叠的检查并行，禁止两个代理同时编辑同一 kit 文件。代理不能自行提交、推送、发布或修改全局环境。
- 子代理开始前读取目标文档、仓库规则和 `tiny-robot-monorepo` 技能；触及 Vue 代码时读取 `vue-best-practices` 技能。每次报告文件清单、改动理由、运行的命令及结果、未运行项、风险与下一任务所需接口。
- 主代理在任务结束后重读差异、检查公开入口和兼容性、按风险运行必要验证。未通过关口则修复或收窄下一任务；不把实验代码自动视为正式 API。
- WC 主 worktree 目前与 `robot/develop` 在 kit 文件上无差异。每次开始共享文件编辑前重新检查，发现新改动先确定来源和兼容方式，不覆盖已有修改。
- 不把 Chat WC 当成 Angular 验收；浏览器宿主必须用 Angular 自己的输入、消息和工具状态组件。

## 2. 任务依赖和关口

| 任务 | 执行者 | 前置条件 | 产出 | 主代理通过条件 | 状态 |
| --- | --- | --- | --- | --- | --- |
| S0 基线与矩阵 | 主代理 | 目标文档 | 能力编号、源文件和现有测试映射；WC 差异记录 | 目标范围与当前证据/缺口可区分 | 已完成 |
| S1 核心入口隔离 | 子代理 | S0 | `/core` 的 Vue 独立导入与相应聚焦测试 | Vue `useMessage` 行为仍可用；核心运行时与声明无 Vue 导出链；差异局部 | 已审查通过；实验新增的根入口 Vue adapter 导出已在 D1 撤回 |
| S2 发布元数据与存储类型隔离 | 子代理 | S1 | 必需 peer、OpenAI 声明、存储类型及 `toRaw` 边界的最小修正 | Vue 旧入口兼容；无 Vue 安装的 tarball 导入和严格声明检查有证据 | 已审查通过，仅 `/core` 单会话实验入口 |
| S3 Angular 单会话实验 | 子代理 | S2 的可安装产物 | Angular 自建 UI、Signal 连接试验与 TestBed | M01-M05 的核心路径、`OnPush` 嵌套更新及销毁可复现 | 实验已执行；见 `packages/kit/experiments/angular-s3/README.md`，未作正式 API 决策 |
| S4 状态方案对照实验 | 子代理 | S3 | native 订阅与 Angular adapter 的对照、性能记录 | 对象身份、通知、长历史流式开销可比较；推荐有证据 | 实验已执行；R1 选 native 订阅加 revision 方向 |
| R1 设计评审 | 主代理 | S1-S4 | 能力边界、状态、生命周期、包方案决策记录 | 目标文档更新且无未解释的核心兼容冲突 | 技术方向已确认；Angular 使用方评审缺口保留 |
| D1 正式消息/插件/工具 | 子代理 | R1 | M01-M05、A01-A02 实现及验收 | 核心、TestBed、浏览器与 Vue 相关回归通过 | 已审查通过 Angular 20 消息阶段；完整版本矩阵留 D4 |
| D2 Skill | 子代理 | D1 | M06 等价能力 | 三种选择模式及加载、存储、资源在无 Vue Angular 宿主可用 | 已审查通过 Angular 20 独立消费；完整版本矩阵留 D4 |
| D3 共享会话与持久化 | 子代理 | D1/R1 | C01-C03、V01 | 可控异步竞态、旧数据和 Vue 深度修改回归通过 | 待执行 |
| D4 发布与示例 | 子代理 | D1-D3 | P01、L01、文档及 Angular UI 示例 | 独立安装、声明、生产构建、浏览器操作符合目标 | 待执行 |
| A1 最终验收 | 主代理 | D1-D4 | 逐项证据、风险、宣讲材料 | M01-L01 均有明确通过结果；失败项不宣称完成 | 待执行 |

S1-S4 是验证任务，允许保留局部实验代码，但主代理在 R1 决定是否正式采用。若实验表明需要大范围重构或影响 Vue 兼容，先列证据、替代方案和成本，再更新目标文档。

## 3. 阶段 1 的详细检查表

### S0 基线

- 将 M01-L01 对应到公开入口、现有单测、文档和消费示例，区分“已有覆盖”和“缺失 Angular 证据”。
- 对 `robot/develop`、本 worktree 与 WC worktree 的 kit 文件差异留记录；后续每个共享文件任务重查。
- 冻结实验输入：可控 Promise/AsyncGenerator、工具审批脚本、长历史消息规模、错误和取消时序。指标记录机器、版本、消息数量、chunk 数、持续时间、内存和更新次数，不预设性能阈值。

静态测试映射如下；“已有”只表示找到用例，**尚未运行**，不能记作通过。

| 能力 | 已有源码/测试依据 | 仍缺的关键证据 |
| --- | --- | --- |
| M01-M04 | `src/message/test/native.test.ts`、`src/vue/message/useMessage.lifecycle.test.ts`，覆盖发送、状态、订阅、错误、取消、插件、字段过滤 | Angular UI 更新、对外快照语义、严格声明与真实本地传输 |
| M05 | `src/message/test/toolPlugin.test.ts` 覆盖工具执行、轮次限制、审批、拒绝、取消、恢复与持久化 | Angular `OnPush` 嵌套工具状态、组件销毁和独立宿主 |
| M06 | `src/skills/test/*` 覆盖浏览器/Node 加载、存储、手动/自动选择和资源工具 | 无 Vue 宿主的类型/运行时可用性、Angular 动态选择 UI |
| C01-C03 | `src/vue/conversation/useConversation*.test.ts`、`src/storage/*.test.ts` 覆盖常规操作、旧数据、部分异步保存与删除顺序 | 框架无关会话层、快速切换与并发加载、自动保存尾调用、销毁后晚到结果 |
| A01-A02 | `src/message/test/vue.test.ts` 验证 Vue 响应式嵌套更新 | Angular Signal、Zone.js/zoneless、`DestroyRef`、自有/共享实例规则 |
| P01、L01 | `src/index.ts`、`src/core.ts`、`src/node.ts`、`package.json`；`src/skills/test/publicExports.test.ts` | 无 Vue tarball 安装、入口声明 `skipLibCheck: false`、Angular 20/21/22 生产构建 |
| V01 | Vue 消息/会话测试及 CLI 模板、`packages/chat/src/runtime` 消费 | 共享核心修改后的 Vue 回归，直接嵌套修改与深度保存兼容 |

### S1 核心入口隔离

- 检查 `/core` 的静态导出图和生成的 `.d.ts`。保持 Vue `useMessage` 原有业务用法与行为；S1 为实验新增的 Vue adapter 根入口导出不是正式公开方案，D1 撤回；不改引擎消息协议。
- 核查核心测试使用直接源码导入是否掩盖导出问题。补一个有意义的入口回归检查，检验核心导出与 Vue 导出各自可达。
- 主代理检查源码 diff、类型/运行时边界和 WC 改动；通过后交 S2。

### S2 发布和存储隔离

- 清理 `ConversationInfo` 对 Vue 会话文件的类型依赖，定义唯一中立来源；保留 Vue 公开类型名称和赋值兼容。
- 处理 `unwrapProxy` 的 Vue 依赖边界，保留 Vue IndexedDB 存储的代理序列化和旧数据行为；不将 Vue 包带入 Angular 的运行时加载链。
- 检查 `openai` 在公共声明中的解析方式、Vue peer 形式及入口导出。比较独立适配包与子入口所需最小发布改动，先获得可安装实验产物，不锁定最终方案。
- 验证 tarball 内的入口、声明、依赖树；独立 TypeScript 宿主使用 `skipLibCheck: false`，无 Vue、无仓库 alias。记录安装命令和 tarball hash。

### S3 Angular 单会话宿主

- 以 Angular 20 为第一实验宿主，再在 21/22 验证同一公共调用与声明。实现真正的 Angular 输入、消息列表、工具状态子组件，不引入 WC 或 Vue。
- 用 `responseProvider` 接可控异步流，验证 send、多个 chunk、cancel、Provider 错误、工具确认/拒绝、组件销毁；用本地 HTTP/SSE 做一条真实传输路径。
- 用 Angular Signals/`computed` 连接状态，`OnPush` 子组件在 Zone.js 与 zoneless 下无需额外用户点击或逐块手动 `detectChanges()` 即能更新。TestBed 检查订阅释放和自有/共享实例边界。
- 该任务只证明消息能力可行；不把多会话、Skill 或发布兼容视为通过。

### S4 状态方案对照

- 同一输入下比较“订阅 native adapter 后发布 Angular 状态”与“Angular `MessageStateAdapter`”。两个试验都必须保留引擎内部消息引用。
- 记录对外消息/嵌套对象身份、`OnPush` 内容和工具状态更新、通知时序、插件观察结果与订阅清理。
- 对较长历史持续流式记录更新耗时、复制量与内存。若快照策略需要按 chunk 深拷贝全部历史，必须展示成本并提出替代方案。
- 结论包含最小可靠方案、已知限制和正式 API 设计输入；主代理在 R1 评审后决定。

## 4. 正式开发和最终验收

- **D1**：共享消息引擎只保留一份。Angular 层接状态和生命周期；受控更新 API 保证外部嵌套写入会通知，而 Vue 代理的直接修改继续有效。撤回 S1 新增的 Vue adapter 根入口导出与相应测试预期，保持 Vue `useMessage` 内部使用。Angular 复用 `/core` 的插件规则，不逐符号复制 Vue 插件包装。验证默认与自定义插件、工具流式状态、暂停审批及错误钩子。
- **D2**：Skill 手动、自动、动态选择可从 Angular 状态或 getter 读取；浏览器/GitHub 加载、导入取消、内存/IndexedDB、资源文件和工具功能逐项验收。Node 入口保留。
- **D3**：核心拥有框架无关的会话规则，Angular/Vue 负责状态连接。测试保存节流尾调用、同 ID 操作串行、并发加载、快速切换、后台生成、暂停恢复和销毁后的晚到结果；不能用删除历史代替释放实例。
- **D4/A1**：确保 SSE 工具与会话存储有无 Vue 的公开路径；打包后在仓库外分别安装 Angular 20/21/22，按文档能力消费消息、插件/工具、Skill、会话和存储。无 Vue 安装、`skipLibCheck: false`、生产构建、Zone.js/zoneless 交互和真实传输通过。记录长历史流式与重复销毁资源基线，交付 Angular 示例、迁移/使用文档和团队宣讲提纲。

主代理每个关口使用固定审查问题：是否越过包职责；是否破坏 Vue 根入口/插件/直接修改；是否有产物与声明证据；异步及销毁规则是否明确；测试是否测到真实行为；失败和未运行项是否如实记录。

## 5. 子代理提示词

以下提示词按顺序使用。派发时附上最新 `git status`、上一关口结果和实际可用模型；不要把未验证的建议写成既定设计。每个任务只编辑指定范围，遇到不可局部解决的架构冲突时先报告证据。

### S1 提示词：核心入口隔离

> 你在 `D:/Projects/Work/tiny-robot-kit-angular` 工作，分支 `feat/kit-angular`。先读 `packages/kit/docs/angular-adaptation-goals.md`、`packages/kit/docs/angular-adaptation-execution.md` 和适用的 repo/skill 规则。任务只处理 S1：让 `@opentiny/tiny-robot-kit/core` 的源码导出图不再引入 Vue adapter，同时保留现有 Vue 入口和 Vue 消费方行为。先检查 `src/core.ts`、`src/message/adapters/index.ts`、`src/vue/message/useMessage.ts`、包入口和相关测试；做最小修改并补聚焦回归。不要实施会话迁移、Angular 包或发布元数据调整；不要提交、推送、发布或改全局环境。报告改动文件、差异理由、运行的验证与结果、尚未证明的打包/声明风险。若 WC worktree 中 kit 文件出现新改动，先报告冲突再动共享文件。

### S2 提示词：发布与存储隔离

> 基于 S1 已审查结果，处理目标文档 R03 和计划 S2。限定在 kit 的存储中立类型、序列化边界、公开入口与包元数据。保持根入口 Vue API、旧 LocalStorage/IndexedDB 格式和 `/node` 可用；查明 OpenAI 公共声明依赖。制作本地安装产物，在仓库外无 Vue、无源码 alias 的 TypeScript 消费宿主用 `skipLibCheck: false` 验证 `/core` 和拟用于 Angular 的入口。记录 tarball 内容、依赖树和失败证据。先比较包拆分与子入口，再做验证所需最小调整；未经主代理评审不锁定最终发布 API。不要提交、推送、发布或改全局环境。

### S3 提示词：Angular 单会话实验

> 基于已可独立安装的 kit 产物，创建真实 Angular 宿主，界面由 Angular 组件实现，不嵌入 WC。完成阶段 1 的 S3：Signal/`computed` 状态连接、`OnPush` 消息和工具子组件、发送、可控多 chunk 流、取消、错误、工具确认/拒绝、销毁、真实本地 HTTP/SSE。首先以 Angular 20 验证，再验证 21/22 的类型和构建；覆盖 Zone.js 与 zoneless。流式断言不能靠额外点击或每 chunk 手动 `detectChanges()`。实现仅作实验，不修改会话/Skill。报告每个运行模式的实际结果、代码位置、命令、风险及调用 API 的设计疑问。

### S4 提示词：状态对照实验

> 使用 S3 的同一宿主和输入，对比 native adapter 订阅发布 Angular 状态与 Angular `MessageStateAdapter`。不得复制消息引擎或替换引擎内部持有的消息对象。记录每个 chunk 的状态通知、对外数组/消息/嵌套身份、`OnPush` 子组件更新、插件可见状态、销毁后行为，并测长历史流式的耗时与内存。给出有数据的最小方案建议；不要直接把实验 API 宣布为正式公开 API。

### D1 提示词：消息、工具与 Angular 生命周期

> 以 R1 已确认设计为准，只实现 M01-M05、A01-A02。共享引擎继续处理发送、流式、插件、工具和命令；Angular 层只负责 Signal 状态连接、派生状态、DI 与 `DestroyRef`。实现受控消息更新，确保 `OnPush` 子组件显示嵌套内容与工具状态，同时不替换引擎内部持有的消息对象。分别测自有/共享实例的卸载、取消、重复释放、错误和迟到 chunk。保持 `responseProvider` 边界，Angular 使用 `/core` 插件而非 Vue 根入口包装；撤回 S1 新增的 `createVueMessageAdapter` 根入口导出与相应测试预期，保留 Vue `useMessage` 内部使用，并记录旧 `/core` 路径的兼容变化。不写会话和 Skill 正式实现。交付测试、Angular 原生 UI 操作证据、Vue 相关回归和未解决风险。不得提交、推送或发布。

### D2 提示词：Skill 能力

> 在 D1 已通过且 R1 API 决议固定后，只实现 M06。复用 kit 现有 core Skill 逻辑，提供 Angular 开发者可用的手动、自动及按请求动态选择方式；动态值可通过 getter/Signal 获取，无需 Vue `Ref`。验证浏览器文件与 GitHub 加载、取消、导入、内存和 IndexedDB 存储、资源读取、自动选择与工具审批恢复。`/node` 保留原能力，不引入浏览器 Angular 的 Node 依赖。使用仓库外无 Vue 宿主检查类型和运行时，报告逐项证据及与 Vue API 的差异；不得自行扩展为 Skill UI 组件。

### D3 提示词：共享会话、持久化与 Vue 兼容

> 只实现 C01-C03、V01 中与会话有关的部分，遵循 R1 确定的核心/适配边界。一个框架无关会话规则层处理创建、切换、后台生成、删除、持久化顺序；Vue 层保留现有 `useConversation` refs 和深度监听直接修改消息的自动保存行为；Angular 层通过明确更新 API 触发通知与保存。用可控异步存储测自动保存节流尾调用、并发加载、快速切换、同 ID 删除再建、保存删除顺序、后台生成、暂停审批恢复、销毁后旧结果晚到。LocalStorage/IndexedDB 旧数据回归必须通过。说明自有和共享会话释放语义，禁止把销毁等同于删除历史。提交逐项验收证据与 Vue 回归结果。

### D4 提示词：发布、示例和文档

> 在 D1-D3 已审查后，只处理 P01、L01 和交付材料。根据 R1 的包方案设置公开入口、peer/依赖、声明和构建；保留既有 Vue 根入口与 `/node` 行为，为 SSE 工具和会话存储提供无 Vue 的公开路径。创建仓库外独立 Angular 消费宿主，真正安装本地打包产物，不用源码 alias、不安装 Vue，`skipLibCheck: false`。分别以 Angular 20/21/22 在 Zone.js 与 zoneless 共六种组合做类型检查、生产构建和主要浏览器操作；补本地 HTTP/SSE、长历史性能和重复销毁资源基线。交付 Angular 自建界面示例、API/迁移文档、已知限制与宣讲提纲，说明 `createVueMessageAdapter` 旧 `/core` 路径的变化。任何失败项标记失败，不能默认为通过；不得发布或推送。

## 6. 进度记录

| 日期 | 任务 | 结果与证据 | 主代理审查 | 后续 |
| --- | --- | --- | --- | --- |
| 2026-09-27 | S0 | 目标文档及静态能力/测试映射已完成；WC worktree 的 kit 与共同基线无差异；未运行测试 | 静态检查完成 | S1 已派发；运行基线测试后补动态证据 |
| 2026-09-27 | S1 | `src/core.ts` 改为直接导出 native adapter；`src/vue/index.ts` 导出 Vue adapter；新增入口测试。入口 2 项及消息/Vue 29 项通过，kit 构建通过；产物 `/core` 无 Vue 引用 | 通过。`/core` 旧 Vue adapter 导入路径变化记为 R1 兼容迁移事项 | S2 处理 peer、OpenAI 声明和存储；不提前锁定 Angular 入口 |
| 2026-09-27 | S2 | `ConversationInfo` 移至中立存储类型，序列化移除 Vue `toRaw`；Vue peer 设为 optional，`openai` 为生产依赖。全量 kit 测试 192 通过、1 跳过；复核 Vue 存储聚焦 22 通过。仓库外安装本地 tarball（SHA-256 `9479D41688563B7FC4128565837829181B5CF3251854CE57C03C4FD06896B59F`），无 Vue 依赖，TS 5.9.3 `skipLibCheck: false`、`/core` ESM/CJS 运行通过 | 放行 S3 的单会话消息实验。根入口在无 Vue 宿主报 `ERR_MODULE_NOT_FOUND: vue`，`/core` 未导出存储；不能据此宣称完整 kit 独立消费通过 | S3 用真实 Angular 宿主；R1/D3/D4 解决会话和存储入口，最终清理未引用声明并重验产物 |
| 2026-09-27 | S3 | 仓库外安装 S2 tarball；实验源码在 `experiments/angular-s3`。Angular 20.3.32/TS 5.9.3 严格类型和生产构建、zoneless TestBed 5 项、Chrome headless 的 Zone.js/zoneless 交互及本地 HTTP/SSE 通过。Angular 21.2.24/TS 5.9.3、22.2.0/TS 6.0.3 严格类型及生产构建通过；22 使用隔离宿主 Node 22.22.3 | 单会话消息实验通过。状态桥每次通知完整 `structuredClone` 历史，仅供 S4 对照；21/22 尚无浏览器和 TestBed 交互证据。没有验证会话、Skill、存储或正式入口 | S4 测状态对象身份、每 chunk 复制成本和长历史性能；R1 决定正式状态、生命周期及发布方案 |
| 2026-09-27 | S4 | 同一可控输入比较 native 深拷贝、native 浅数组加 revision、自定义 adapter 包装；对象身份、逐块通知、插件观察、`OnPush` 消息/工具子组件及 `DestroyRef` 后停止发布的 7 项实验通过，连同 S3 共 12 项。500 条历史、80 chunk 的两轮单模式测量：深拷贝 86.7/95.8 ms，revision 1.31/1.72 ms，adapter 1.17/1.54 ms；估算深拷贝负载约 48 MB，详见 `experiments/angular-s3/S4-results.md` | 建议 R1 优先 native 订阅加 revision；它暴露可变消息视图，旧发布值的嵌套对象会继续变化。单机数据无性能承诺；S4 尚未覆盖 21/22 或 Zone.js 浏览器 | R1 审定状态语义、所有权、包和会话边界；决定是否接受显式 revision 契约 |
| 2026-09-27 | R1 评审 | 根据 S1-S4 形成 `angular-adaptation-r1-review.md`；用户确认按业务消费能力对等、采用可变消息视图与受控更新方向，`/core` 保持无 Vue，Vue adapter 不列为 Angular API | 技术方向通过，放行 D1；具体 API 名称和使用方式仍需独立消费验证。当前无 Angular 业务评审者 | D1 撤回实验新增的 Vue adapter 根入口导出，完成消息/工具与生命周期；D3/D4 补无 Vue 存储/SSE 入口 |
| 2026-09-27 | S3/S4 独立复现 | 从仓库实验源码复制到新的仓库外宿主，重新安装同一 tarball（SHA-256 `9479D41688563B7FC4128565837829181B5CF3251854CE57C03C4FD06896B59F`）；`npm ls vue --all` 为空，`skipLibCheck: false` 类型检查、Angular 20 生产构建、TestBed 12/12、Chrome headless Zone.js/zoneless 浏览器 smoke 均通过，页面错误为空；4317/4318 无残留监听 | 证明实验可从记录复现。它仍只覆盖单会话和 S4 实验，不能替代正式 API、Skill、存储或 21/22 浏览器验收 | R1 方向已确认，D1 实施 |
| 2026-09-27 | D1 消息与 Angular 生命周期 | 新增 `src/angular.ts` 的自有/共享连接、Signals、revision、受控 `updateMessage`；核心阻止取消后迟到 chunk 写入，撤回 S1 实验新增的 Vue adapter 根导出。kit 全量 194 通过、1 跳过；仓库外 `tiny-robot-angular-d1` 安装本地 tarball（SHA-256 `CED645910E3102C4A45CE510CB6F1F54DDAFB8AAFAF2628608CB8C60A2299B47`），`npm ls vue --all` 为空，严格 TS、ESM/CJS、Angular 20 生产构建、TestBed 9/9 通过；Zone.js/zoneless 浏览器流式、取消、错误、工具批准/拒绝、本地 HTTP/SSE 通过 | 消息阶段放行 D2。`updateMessage` 是 Angular 外部嵌套修改的通知入口；不合作且永不返回的 Provider 可能让 `abort()`/`dispose()` 长时间等待。21/22 及资源基线仍属 D4 验收 | D2 复用 `/core` Skill 插件；D3 处理共享会话；D4 完成版本矩阵和辅助入口 |
| 2026-09-27 | D2 Skill | 在仓库外 `tiny-robot-angular-d2` 安装同一 D1 tarball（SHA-256 `CED645910E3102C4A45CE510CB6F1F54DDAFB8AAFAF2628608CB8C60A2299B47`）；`npm ls vue --all` 为空，`skipLibCheck: false` 类型检查和生产构建通过。TestBed 全部 20/20，其中 D2 4/4 覆盖请求级 Signal 手动/无/自动选择、资源审批重建、文件/GitHub 加载、取消、内存及 IndexedDB。Chrome 原生 File/IndexedDB 与受控 GitHub 响应检查通过，页面错误为空；`git diff --check` 通过 | 放行 D3。现有 `/core` 能力足够，未新增 Angular Skill 插件。自有连接销毁会取消暂停回合，D3 须处理共享会话的导航持久化；GitHub 响应由本地路由控制，不代表实际外网服务可用。Angular 21/22 留 D4 | D3 处理共享会话及 Vue 深度保存；D4 将 Skill 纳入全版本独立消费 |
| 2026-09-27 | 本地交接检查点 | 已停止本次 Angular 开发服务器和本地 SSE 服务；4317、4318、4320 均无监听。工作树保留 S1-D2 的源码、实验与文档；没有发布或推送 | D1/D2 是阶段性通过，尚非完整 kit Angular 适配验收；D3 尚未启动 | D3 从共享会话所有权、持久化顺序及 Vue 深度自动保存开始；D4 补无 Vue 存储/SSE 入口与 Angular 20/21/22 最终矩阵 |
| 2026-10-04 | 上游同步与方案复核 | 拉取 `robot/develop@cd42d23a0`，无冲突合入为 `90e92e19b`；纳入 onLoad 空列表期间内存会话修复及最新消息/会话消费文档。静态复核 D1/D2 源码和消费用例，形成 `angular-adaptation-next-plan.md` | 历史阶段证据保留，新基线测试/构建/产物尚未运行；D2 恢复用例不能替代页面退出或真正重载验收 | 用户确认后先 B0 基线复验，再 D3 共享规则→Vue 兼容→Angular 会话恢复；本轮未推送 |
| 2026-10-04 | 详细任务与执行方式 | 用户确认共享核心、Vue/Angular 状态连接及应用级共享管理器方向；指定后续子代理使用 gpt-6.1-sol high。计划补充 B0/D3/D4 任务包、验收关口、派发提示词与 goal 建议 | 实施计划待用户确认；未创建 goal、派发子代理或执行实现/动态验证 | 确认后从 B0 开始；主线程逐关口审查并推进 |
| 2026-10-04 | 本轮计划核对与补充 | 只读核实工作树、入口、会话保存及最新消费文档；工具核实已有活跃 B0 至 D3 goal。计划补充 D3 必需的公开存储入口、工作区产物证据归属、执行节奏及目标完成清单 | 遵守用户「确认后再推进」要求；没有派发实现子代理、安装、测试或构建。历史计划行中的「未创建 goal」保留其当时含义 | 等待本轮计划确认；不重复创建 goal，不以计划完成代替实施验收 |
| 2026-10-04 | B0 新基线验证 | 用户确认按 B0-D3 实施。kit `pretest` 夹具已缓存；全量测试 22 文件、195 passed、1 skipped；重新构建并打包新 tarball，SHA-256 `F1982F2F1493444F340A722067C07708008848A90134B17A223337A75AF56723`。仓库外 Angular 20.3.33 宿主安装该 tarball，`pnpm ls vue` 为空；TypeScript 5.9.3 严格类型、生产构建、TestBed 20/20、Zone.js/zoneless 浏览器 smoke、本地 HTTP/SSE、D2 文件/IndexedDB/GitHub 受控响应与取消通过；4317/4318/4320 无残留监听 | B0.2 动态基线证据已通过；独立宿主目录结构修正后重跑。浏览器 GitHub 是受控路由，不代表外网服务；B0.1 能力映射和主线程公开入口审查仍未完成 | 等待 B0.1 能力表；审查缺口后进入 D3a.1 |
| 2026-10-04 | B0 能力映射 | 新增 `packages/kit/docs/angular-adaptation-capability-map.md`，按 M01-L01 映射文档消费、入口、源码/测试证据、Angular 缺口和阶段归属。确认 Angular 当前无列表级受控修改；storage 旧消息类型与 core OpenAI 联合类型需严格桥接；D2 暂停恢复不是整页重载证据 | 主线程待审查公开入口和范围；能力表不把源码存在或旧实验当作首版通过 | B0 关口审查通过后进入 D3a.1 |
| 2026-10-04 | D3a.1 桥接设计 | 新增 `angular-adaptation-d3a-bridge.md` 和 `angular-bridge.contract.test.ts`。确认共享会话只使用同一 `createMessageEngine(adapter, options)`；Vue 保留 reactive adapter、插件上下文和 direct mutation；Angular 使用 native adapter、Signals/revision 与受控 `updateMessage`；不新增 `MessageEngine.dispose()` 或列表操作。4/4 契约测试通过 | 主线程审查通过设计边界；storage 类型需在 D3a 实现时用 strict d.ts 验证，暂停快照不能用 abort 伪造释放后恢复 | 下一步 D3a.2 实现框架无关会话管理、加载代际和引擎缓存 |
| 2026-10-04 | D3a.2 共享会话生命周期 | 新增 `src/conversation/{types,manager,index}.ts`，`/core` 导出 `createConversationManager`。支持初始列表合并、创建/按需加载/切换/改名/删除/清空、engine factory 注入、同 ID 加载去重、generation/tombstone 和最后切换意图；主线程补充 loading generation 隔离。可控竞态测试 4/4 通过 | 主线程审查通过生命周期边界；create 为 eager engine，保存仍未进入共享队列；manager dispose、尾保存、暂停快照和 Vue/Angular 连接留后续阶段 | 下一步 D3a.3 实现持久化队列、快照物化、尾保存和 manager 释放 |
| 2026-10-04 | D3a.3 保存与释放 | `createConversationManager` 增加按 ID 自动保存节流、稳定消息/元数据快照、失败后队列继续、保存/删除/重建顺序、flush 和幂等 dispose；新增持久化与竞态测试。manager 聚焦测试 9/9 通过 | 通过主线程审查；Vue 代理不能直接 `structuredClone`，已在 D3b 使用既有 `unwrapProxy` 保持兼容 | 进入 D3b Vue 兼容回归 |
| 2026-10-04 | D3b Vue 兼容 | Vue `useConversation` 保留原 refs/computed、Vue message adapter、direct mutation 和 deep watch；保存路径使用 `unwrapProxy(toRaw(messages))` 物化快照，新增嵌套字段自动保存回归。Vue conversation 聚焦 20/20、D3a/D3b 联合 33/33 通过，ESLint 与 diff check 通过 | 通过；曾发现 `structuredClone` 对 Vue 代理/运行时字段抛 `DataCloneError`，已修复并由回归测试锁定 | 进入 D3c Angular 会话连接与独立消费 |
| 2026-10-04 | D3c.1 Angular 会话连接 | `/angular` 新增 `connectAngularConversation`、`injectAngularConversation`；Signals/revision 连接 manager，多个连接共享同一 manager，连接销毁只解绑 active engine 视图；新增 Angular connection 测试。kit 构建成功，连接/manager/bridge 聚焦 15/15 通过 | API 不复制会话规则；generation 不伪造到公开返回值。尚无真实 Angular manager 组件测试前不放行 D3c | D3c.2 仓库外 Angular 多会话宿主 |
| 2026-10-04 | D3c.2 Angular 20 独立宿主 | 使用修复后 tarball（SHA-256 `59A03027CAEC0FF3E9EBE44C09EAD81DC51FFE99683756214A56F40FCBAD7E36`）在仓库外无 Vue 宿主安装；`skipLibCheck:false` 类型检查、生产构建通过；TestBed 21/21 通过；真实 Angular 页面创建 A/B、切换、发送流式响应并在整页 reload 后恢复 active 会话、重新创建 engine，结果 `completed/browser reply`，无 page error | D3 共享会话、Vue 兼容和 Angular 多会话验收通过；新增 generation 回归修复了 storage 首次加载后 engine 不恢复的问题。Angular 21/22 版本矩阵与其他发布审计留 D4 | D3 目标完成，可进入 D4/A1；保留版本矩阵和资源基线限制 |
| 2026-10-04 | P0 阶段状态对齐 | 统一目标、评审、执行和后续计划文档的状态：B0-D3 已完成，D4/A1 尚待执行；检查点范围限定为 D3 代码、测试和证据文档。`git diff --check` 通过，未发现临时宿主或 tarball 未跟踪文件 | 主线程只读审查通过；本地提交不代表完整首版交付，不推送或发布 | P1 创建 D3 阶段性本地提交 |
| 2026-10-04 | D4.1 公开能力与依赖审计 | `/core` 新增框架无关 Provider、SSE、LocalStorage/IndexedDB 策略及工厂公开出口；storage 通过 core 类型桥接与 `ConversationStorage` 对齐，根 Vue storage 类型保持不变。`/core` ESM/CJS 产物无 Vue，公共声明仅保留 `openai/resources` 类型引用；Vue/Angular peer 均 optional，`openai` 为 production dependency。入口回归 3/3、构建、严格 `skipLibCheck:false` manager+storage 消费检查通过 | 未制作 tarball，未运行 Angular 21/22、完整浏览器矩阵或资源基线；旧 `/core` `createVueMessageAdapter` 路径继续保持迁移记录，不在 core 恢复 | D4.2 进行全版本独立安装、真实 SSE/存储/Skill 消费和资源矩阵；D4.3 补 API/迁移示例与最终材料 |
| 2026-10-05 | D4.4 重复释放资源基线 | 在 kit 最终构建产物执行 200 次 `createConversationManager` → eager engine → 幂等 `dispose()`，使用 `node --expose-gc` 记录 heap：before `6,015,848`、after `5,423,472`、delta `-592,376` bytes；manager 聚焦测试覆盖保存队列、timer、订阅和销毁后不发布。4317、4318、4320 均无监听 | 该结果是单进程、短会话基线，不代表浏览器 RSS 或长历史无泄漏；长历史 S4 测量仍为实验数据，待最终材料合并 | D4.3 补逐项能力证据和限制说明，A1 再审查是否满足发布门槛 |
| 2026-10-05 | D4.3 API 与迁移材料 | 新增 `packages/kit/docs/angular-adaptation-api.md`，说明 `/core`、`/angular` 入口、单/多会话连接、Signals/revision、OnPush、DestroyRef、存储/SSE 边界、Vue 对照和已知限制；能力映射同步补入 D4.2 产物证据 | 材料不宣称 SSR、真实 GitHub 外网或未验证资源曲线；未新增 HttpClient/Observable 包装 | A1 逐项审查 M01-L01，决定最终发布范围和剩余补件 |
| 2026-10-05 | D4.2 Angular 20/21/22 版本矩阵与入口验证 | 基于当前 HEAD `b5392760167f26ef9a799e56361e20efaf8e04f3` 重建 `@opentiny/tiny-robot-kit`：`pnpm --filter @opentiny/tiny-robot-kit build`、`pnpm --filter @opentiny/tiny-robot-kit pack --pack-destination D:/Projects/Work/_tmp/tiny-robot-kit-d42`；tarball SHA-256 `41613AEDF8A867B7A64FE4EDBE69664F2F5027CB012AC2E384EFEAAEDCFA6FB5`。仓库外隔离宿主 `D:/Projects/Work/_tmp/tiny-robot-kit-d42-hosts/{angular20,angular21,angular22}` 分别安装同一 tarball、无 Vue 依赖；Angular 20.3.33/TS 5.9.3/Zone.js 0.15.1、21.2.24/TS 5.9.3/Zone.js 0.16.3、22.2.1/TS 6.0.3/Zone.js 0.16.3 均 `tsc -p tsconfig.json --noEmit`（`skipLibCheck:false`）通过，`ng build` 生产构建通过（22 使用隔离 bundled Node 24.19.0；默认 Node 22.15.1 被 Angular CLI `>=22.22.3` 门槛拒绝）。每个宿主 TestBed 4 files/20 tests 通过；`browser-smoke.mjs` 的 Zone.js 与 zoneless 各自通过，流式、取消、错误、工具批准/拒绝和本地 HTTP/SSE 均无 page error。`/core`、`/angular`、`/node` ESM/CJS 入口命名导出分别 30/6/7 且一致；tarball `core.mjs/core.js/angular.mjs/angular.js/core.d.ts/angular.d.ts` 无 Vue token；端口 4317/4318 清理后无监听。 | D4.2 版本、严格声明、生产构建、入口、Zone.js/zoneless smoke 结果通过；Angular 22 的默认全局 Node 版本不满足 CLI，已用 bundled Node 24.19.0 在宿主内完成验证，不能把默认 Node 22.15.1 运行记为通过。Skill 的真实 directory picker/GitHub 外网、完整会话/存储/资源基线与 D4.3/A1 材料仍未在本项新增证据；本次只保留验证日志和 hash，临时宿主及 tarball 随后清理 | D4.3/A1 补 API/迁移/示例、真实 Skill 外网与资源基线；未因本项结果宣称完整首版完成 |
| 2026-10-05 | P7 完成审查与反证 | 重新读取 `f63c8310d` 源码及历史日志；kit 213 passed/1 skipped 和 clean build 通过。`gpt-6.1-sol high` 子代理复现 Vue 未共享、尾保存丢失、paused dispose 丢快照、delete/clear 不取消、disposed 迟到加载和 clear 复活等问题。新增当前审查页及团队说明；npm 0.5.1 运行时/声明确实公开 Vue adapter 的旧 core 路径 | 撤回 D3 整体完成判断。原单会话矩阵与局部测试结果保留，不扩写为完整会话或审批重载通过。用户已授权修复缺口并重新验收；未提交、推送或发布本轮修改 | manager 契约→Vue 共享接入→Angular 原生宿主与真正重载→资源/矩阵→P7 材料审查，详见当前 P7 文档 |
| 2026-10-05 | P7 D3 修复检查点 | `gpt-6.1-sol high` 子代理补 manager 节流/尾保存、取消/paused释放、代际/clear/重入与二进制快照；Vue 实际接入共享 manager，内部 runtime 回收 watcher。主线程复验 Vue 50/50、kit 254 passed/1 skipped、clean build 与 npm pack；D3 tarball SHA-256 `1AEDBE014A7592FA860FAE89BE978210F4FB965B10FCCF37216101FACDBE33B6`。新增可重建原生 `experiments/angular-p7`；仓库外 Angular 20.3.33/TS5.9.3 严格声明、无 Vue 入口图、生产构建、TestBed 29/29（含9项manager）通过 | 这是 D3 修复的局部源码与产物证据，非完整首版放行。浏览器两模式审批真正重载正在复验；内置 LocalStorage 错误传播、IndexedDB关闭/类型保留、格式化工具无 Vue 出口仍有缺口。全包 tsc 既存错误未通过；未提交、推送、发布 | 补存储/出口缺口，再以最终 tarball 完成20/21/22两模式、Skill/资源/性能与P7材料收口 |
| 2026-10-05 | P7 存储/出口与最新交接检查点 | manager/Vue共享修复、存储close/类型保留/错误传播、原core辅助出口及可重建宿主已落地；Vue50/50、kit275通过/1跳过、lint、clean build和严格产物声明通过。tarball SHA-256 `2E23E364ABB1A0B152FFAC53121EA94A1BD8C3E24E7BA585647B5FD6905D1E7C`在独立Angular20生产构建、无Vue入口图、7文件32/32 TestBed通过 | 最新browser-smoke资源取消探针失败：Late resource content leaked after cancellation；21模板Vitest peer安装失败，22未跑，长资源/真实GitHub未执行到；列表API待评审。用户授权本轮本地检查点提交，完整首版未放行 | 按P7 T01-T08继续：取消反证、宿主依赖修正、列表API评审、能力补验、冻结打包、最终矩阵/资源、材料审查；推送和发布另评审 |
