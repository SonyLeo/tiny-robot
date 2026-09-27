# Kit Angular 适配目标与验收基线

> 状态：目标基线；S1-S4 前期验证与 R1 评审已完成，D1 消息和 D2 Skill 阶段已审查通过，完整首版尚未验收。详细任务、提示词和关口见 [执行计划](./angular-adaptation-execution.md)。
>
> 建立日期：2026-09-26。工作分支：`feat/kit-angular`；起点：`robot/develop` 的 `0f75d2c9689559b075fab20f577aab2f21bd62c0`。

## 1. 文档用途与变更规则

本文是 kit Angular 适配的需求、设计和验收共同基线。后续任务开始前先核对本文的目标、阶段状态和未决事项；每完成一个阶段，补充实际结果、证据路径、偏差及决策。目标变更须说明原因、兼容影响和验收变化，不能因单会话演示成功就把其余能力默认为完成。

以下用语保持区分：

- **已确认**：用户在当前协作中明确给出的边界。
- **建议**：准备验证的工作假设，尚未构成发布承诺。
- **待决**：必须依据实验、业务需要或评审结果确定。
- **已验收**：有可复现用例和产物证据，不能仅凭源码阅读或演示判断。

本文中的首版是首次对外宣称 kit 支持 Angular 的版本；前期验证版本只用于证明架构可行，不代表首版交付。

## 2. 已确认目标和边界

1. **已确认：完整覆盖现有 kit 的业务消费能力。** Angular 开发者能以自己的 Angular 组件开发聊天业务界面，使用与 Vue 版对等的消息、请求、工具、Skill、会话和存储能力；不逐文件、逐符号复制 Vue 的内部组装 API。Skill 虽没有确定的首批业务使用方，仍纳入首版能力和验收；不能把它静默延期。
2. **已确认：Angular 消费方无需因使用 kit 安装 Vue。** 运行时代码、公共声明和包元数据都须验证。共享核心不能依赖 Vue 或 Angular，Angular 适配层可以依赖 Angular；既有 Vue API 按兼容契约保留。
3. **已确认：用 Angular 自己编写的界面验收。** Chat Web Components 是独立任务，嵌入 WC 不能证明 kit 的 Angular 适配完成。双方共享 kit 文件时，记录变更归属、共同基线及依赖，维护一套核心实现。
4. **已确认：首版暂无 SSR 要求。** 不承诺服务端实例化、服务端会话读取或请求间隔离，也不将 SSR 验证列为首版完成关口。以后新增 SSR 承诺时，须补服务端导入、实例化和请求间隔离验证。浏览器存储及文件选择仅按浏览器场景验收。
5. **已确认：按阶段计划推进。** 2026-09-27 已授权制定详细计划并由子代理执行实现，主代理负责审查。依赖仅按计划安装在项目或隔离宿主，不改全局环境；不提交、推送或发布。

### Angular 版本与运行模式

- **建议：首版兼容 Angular 20、21、22。** 2026-09-26 的[官方维护表](https://angular.dev/reference/releases)列出 20/21 为 LTS、22 为 Active；19 及更早已停止支持。候选 peer 范围为 `>=20 <23`，只有三个版本各自通过独立消费验证后才能写入发布配置。
- [官方兼容表](https://angular.dev/reference/versions)显示 Angular 20/21 使用 TypeScript 5.x，22 使用 TypeScript 6.x。类型验证必须覆盖两代 TypeScript；不能只用 kit 当前的 `skipLibCheck: true` 得出兼容结论。
- **建议：同时覆盖常规 Zone.js 与 zoneless 运行。** 尤其要验证流式和嵌套工具状态在真实 `OnPush` 子组件自动更新；不以额外点击或反复手动 `detectChanges()` 作为通过条件。具体版本与模式矩阵在前期验证中固化。
- 参考范围：当前 [Angular Material](https://www.npmjs.com/package/@angular/material) 的 Angular peer 为 `^22 || ^23`，[PrimeNG](https://www.npmjs.com/package/primeng)、[NG-Zorro](https://www.npmjs.com/package/ng-zorro-antd)、[NgRx](https://www.npmjs.com/package/@ngrx/store)主要跟随 22，[Taiga UI](https://www.npmjs.com/package/@taiga-ui/core)为 `>=19`。这些是参考，不替代 kit 自己的兼容验证。

## 3. 当前源码基线，不等于验证结果

| 现状线索 | 源码位置 | 需要确认的影响 |
| --- | --- | --- |
| 根入口导出 Vue composables、存储、Skill、旧客户端和工具函数；`/core` 导出消息引擎及核心插件；`/node` 导出 Node Skill API | `src/index.ts`、`src/core.ts`、`src/node.ts` | 入口的运行时和声明依赖要分别审计；根入口与 `/core` 的同名类型形状不同 |
| `/core` 经 adapter 汇总入口导出 Vue adapter | `src/message/adapters/index.ts` | 不能仅凭业务代码不 import Vue 认定核心独立 |
| 包声明 Vue 为必需 peer；OpenAI 类型出现在核心公开类型中，但 `openai` 当前仅列在 devDependencies | `package.json`、`src/message/types.ts` | 无 Vue 独立安装与 `skipLibCheck: false` 类型检查可能暴露问题 |
| 引擎持有并原地更新消息对象；native adapter 的 `getState()` 只复制消息数组，嵌套对象仍共享引用 | `src/message/core/engine.ts`、`src/message/adapters/native.ts` | 订阅值不能未经定义就称为不可变历史快照；Angular 子组件更新和性能均待测 |
| Vue adapter 使用响应式消息代理，Vue 会话层用深度 `watch` 自动保存；存储类型和序列化仍连着 Vue | `src/message/adapters/vue.ts`、`src/vue/conversation/useConversation.ts`、`src/storage/types.ts`、`src/storage/utils.ts` | 核心会话迁移须维持 Vue 直接修改消息及深度保存行为 |
| 引擎公开 `subscribe`、`abort`，尚无 `dispose()`；工具暂停回合元数据另存于 localStorage | `src/message/types.ts`、`src/message/core/turnPersistence.ts` | 取消订阅、取消请求、销毁实例和删除历史须明确区分 |

这些线索记录于初始只读检查，其中 `/core` 导出、存储类型与序列化依赖、包依赖元数据已在 S1/S2 作实验性调整。kit 全量测试已运行，结果为 192 通过、1 跳过；`/core` 已有无 Vue 的独立安装、严格声明及 ESM/CJS 导入证据。根入口无 Vue 导入仍失败，会话与存储尚无中立公开入口；上述结果不等于下表全部验收项已通过。

## 4. 首版能力清单与验收口径

表中“支持”是**目标状态**，不是当前实现状态。Angular 对等能力以业务可达的结果和契约判断，不要求复制 Vue `Ref`、`watch` 或内部 adapter 工厂的语法。现有导出逐项区分文档化消费能力、供高级组合的核心接口与旧兼容 API；未文档化不等于可以无记录地移除。

| 编号 | 目标 | 范围和可执行验收要点 |
| --- | --- | --- |
| M01 消息与请求 | 支持 | 初始消息、`sendMessage`、发送消息对象、请求状态及派生状态、动态替换 `responseProvider`；连续回合和空输入行为符合既有契约 |
| M02 响应处理 | 支持 | Promise 单次结果、AsyncGenerator 流式结果、默认增量合并、自定义 `onCompletionChunk` 和 `runDefault`；流式内容及元数据逐块出现在 Angular 消息子组件 |
| M03 取消与错误 | 支持 | `AbortSignal` 到达 Provider；取消、Provider 抛错、插件错误钩子、`onFinally`、错误继续发送的状态与 Promise 结果明确；迟到结果不能污染已终止实例 |
| M04 请求体与插件 | 支持 | 字段包含/排除、插件修改请求体、默认 `thinkingPlugin` 和 `lengthPlugin`、自定义插件生命周期和命令；展示消息不因请求清洗而改变 |
| M05 工具 | 支持 | `toolPlugin` 的动态工具、工具提供者、异步及流式执行、轮次限制、工具结果和失败/取消状态；确认/拒绝、并发审批、暂停恢复、重载后恢复均可在 Angular 界面操作 |
| M06 Skill | 支持 | Skill 的浏览器/GitHub 加载、取消、内存/IndexedDB 存储、导入和资源；手动、自动、按请求动态选择，相关工具与请求上下文可用。Node 专属文件系统入口保留其原有定位 |
| C01 会话 | 支持 | 创建、加载、切换、重命名、删除、清空；各会话独立消息引擎，活跃会话便捷发送/取消，非活跃会话可按契约后台生成 |
| C02 持久化 | 支持 | LocalStorage、IndexedDB、自定义 `ConversationStorageStrategy`，手动及自动保存，节流尾调用，旧消息格式读取，暂停审批与消息保存顺序 |
| C03 竞态 | 支持 | 快速切换、同一会话并发加载、初始列表晚到、保存后删除、同 ID 删除再创建、后台生成、暂停审批再恢复、销毁后异步结果晚到均有确定结果 |
| A01 Angular 状态 | 支持 | 消息、请求与嵌套工具状态在 Signal、`computed` 和真实 `OnPush` 子组件中更新；Zone.js 与 zoneless 均验收，不重复实现消息引擎 |
| A02 生命周期 | 支持 | 自有和共享引擎所有权、组件卸载、请求是否继续、订阅释放、幂等销毁、定时器和异步保存结尾规则可观察且有测试；销毁不等于删除历史 |
| P01 独立消费 | 支持 | Angular 应用只依赖声明所需的包，不装 Vue、不使用仓库源码 alias；消息/插件/Skill、SSE 工具及会话存储均有无 Vue 的公开消费路径；运行时、公共 `.d.ts`、ESM/CJS 入口和包元数据按发布承诺可用 |
| V01 Vue 兼容 | 保持 | 既有根入口、`useMessage/useConversation`、插件上下文、响应式 refs、直接修改消息及嵌套状态、深度自动保存保持现有契约；Vue 回归通过 |
| L01 其他公开能力 | 保持 | `AIClient`、Provider、SSE/格式化工具、`/node` 等现有公开 API 不因拆包或改入口失效；废弃的 `AIClient` 保持兼容，不另造 Angular 包装。原 `/core` 的 `createVueMessageAdapter` 路径是单独记录的兼容变化，不作为 Angular 能力实现 |

明确不在本任务的交付物：Angular 聊天 UI 组件库、Chat Web Components、后端服务，以及未被验证的 SSR 能力。完整支持 kit 不意味着这些项目自动包含在内。

## 5. 职责和候选设计

### 5.1 所有权

- **共享核心**：消息和回合状态、请求与取消、插件及命令协议、工具与 Skill 能力、会话规则、持久化契约和框架无关的状态通知。
- **Angular 适配**：通过独立入口把通知接到 Signals，提供派生状态、操作方法、依赖注入与生命周期连接，定义自有/共享实例的释放策略；不处理业务 UI 或重复实现流式引擎。
- **Vue 适配**：维持既有根入口、refs、响应式消息对象和直接修改的兼容行为。`createVueMessageAdapter` 继续供 `useMessage` 内部组装，Angular 不提供同名 API；S1 实验新增的根入口导出不进入正式公开方案。
- **业务消费方**：Angular 组件、后端地址/鉴权、模型选择、`responseProvider`、工具执行、是否选用存储及业务错误呈现。HTTP 传输保持 Provider 边界。

Vue `ref/computed` 可作为理解 Angular Signal/`computed` 的参照，但 Vue 深度代理会追踪的原地写入不会自动让普通 Angular 对象触发 Signal。Angular 对外需定义受控消息更新路径；它与 Vue 保留直接写入的兼容要求是两个不同契约。

### 5.2 前期验证后才决定

1. **状态连接**：比较订阅现有 native adapter 后发布 Angular 状态，与实现 Angular `MessageStateAdapter`。逐块检查嵌套更新、对象身份、插件回调、状态通知次数和长历史成本。不能替换引擎内部持有的消息对象；不能未经测量把每 token 深拷贝全历史定为正式方案。
2. **会话边界**：比较框架无关会话管理器加 Vue/Angular 连接，与其他最小兼容迁移路径。须解释 Vue 深度监听及消费方直接修改如何继续自动保存，以及 Angular 受控写入如何保存。
3. **发布方案**：S1-S4 后优先单包子入口：Vue 根入口维持既有消费方式，`/core` 提供无 Vue 的共享能力，新 Angular 入口只连接 Angular 与共享模块，`/node` 保持原定位。S1/S2 已证明 `/core` 可无 Vue 独立消费，但存储和 SSE 等辅助能力仍须设计无 Vue 的公开路径并实测。对旧 `/core` 的 Vue adapter 导出记录路径变化；不为此保留 Vue 依赖或新增一套 `/runtime`。正式入口名称和类型仍须在独立宿主验收后固定。
4. **传输桥接**：优先保留 `responseProvider`。如增加 HttpClient/Observable 便利层，须明确定义逐块产出、退订与 `AbortSignal` 的关系，以及 HTTP/解析错误如何传递；无证据时不作为主路径。

### 5.3 生命周期必须写明的规则

设计评审中须明确：谁创建和持有引擎；Angular 组件 `DestroyRef` 触发时只解绑还是同时 `abort()`；共享引擎是否允许后台生成；重复释放的结果；销毁后订阅回调、请求块、计时器和异步保存如何处理；删除会话是否先取消请求并等待持久化。取消订阅、终止请求、销毁运行时和删除历史是四个不同动作。

## 6. 分阶段实施与证据关口

### 阶段 0：需求基线（当前）

- 完成 M01-L01 的逐项范围表，标出已有证据与缺口；记录 Angular 20/21/22 候选范围、Zone.js/zoneless 验证建议和 SSR 排除项。
- 与 WC 任务核对共同 Git 基线、kit 文件变更和归属；保留用户已有修改。
- **完成关口**：目标与执行计划已形成；前期验证获授权。执行结果须逐项回填，不能预先记为通过。

### 阶段 1：最小核心清理与单会话实验

- 清理 `/core` 的 Vue 运行时与声明依赖，并处理存储类型、序列化和 OpenAI 类型的发布依赖问题；只做实验必需的最小变更。
- 构建本地可安装产物；在仓库外分别用 Angular 20、21、22 创建真实宿主，`skipLibCheck: false`，无 Vue、无源码 alias。依赖安装局限于工作区或隔离宿主，不改全局环境。
- 用可控异步 Provider 验证流式、取消、错误、工具审批/拒绝及销毁；用真实 `OnPush` 消息和工具子组件检查自动更新。增加本地 HTTP/SSE 传输验证，不以模拟 Provider 代替全部传输证据。
- 比较两种状态连接方案，并记录长历史流式时的提交次数、耗时与内存。**完成关口**：能选择最小可靠方案；尚不能宣称首版完成。

### 阶段 2：设计评审

- 固定核心与 Angular/Vue 边界、对外状态和受控更新规则、实例所有权、会话迁移、发布入口、类型依赖和兼容路径。
- 如核心兼容冲突或成本显著增加，列出修复、调整架构或明确缩小范围的证据及影响；范围变化须与用户讨论并更新本文。
- **完成关口**：设计决策有实验数据和可执行验收用例。没有 Angular 使用方评审者时记录缺口，并加严独立消费验证，不视为已获评审认可。

### 阶段 3：按能力开发

1. 消息、流式、状态、错误、插件及工具：覆盖 M01-M05、A01-A02 的相关部分。
2. Skill 加载、存储、选择和资源工具：覆盖 M06；动态选择不依赖 Vue `Ref`。
3. 共享会话、三种存储、兼容与竞态：覆盖 C01-C03 和 V01；重点验证自动保存尾调用、保存/删除顺序、快速切换、并发加载、后台生成与暂停恢复。
4. 包入口、声明、示例和文档：覆盖 P01、L01；逐项更新证据和风险。

每段完成后运行相关核心测试、Angular TestBed 与浏览器交互用例；共享核心或 Vue 兼容代码变更须运行对应 Vue 回归。不能只写与实现同构的测试，也不能以展示页代替断言。

### 阶段 4：交付验收

- 仓库外全新宿主独立安装产物，核对依赖树无 Vue、公共声明 `skipLibCheck: false`、Angular 20/21/22 生产构建、常规/zoneless 浏览器交互，以及实际本地传输。
- 对长历史持续流式和反复创建/销毁记录性能与资源基线；记录测试环境、数据规模和允许的残留资源。
- 逐项核对 M01-L01 的证据；交付 Angular 自建界面示例、API/迁移文档、已知限制、团队宣讲材料。只有所有首版目标有验收证据，才可宣称完成。

## 7. 验证分工和记录格式

| 层级 | 主要证明什么 | 不能替代什么 |
| --- | --- | --- |
| 核心单元/可控异步存储 | 消息、插件、会话规则及竞态的确定性结果 | Angular 模板自动刷新与包安装 |
| Angular TestBed | Signals、`OnPush`、DI、`DestroyRef` 和组件生命周期 | 浏览器交互与真实传输 |
| Angular 浏览器宿主 | 用户可见的流式、工具审批、切换和 zoneless 行为 | 独立安装及严格声明检查 |
| Vue 回归 | 旧 API、插件和深度修改兼容 | Angular 原生界面能力 |
| 仓库外消费宿主 | 发布入口、peer、运行时依赖、声明及生产构建 | 核心内部竞态的穷尽验证 |

每项验收记录统一填写：能力编号、版本/模式、命令或操作步骤、期望、实际结果、证据文件或日志路径、对应提交、结论（通过/失败/未运行）与剩余风险。未运行项写明原因，不记为通过。

## 8. 当前风险与未决事项

| 编号 | 风险或决策 | 当前处理 |
| --- | --- | --- |
| R01 | native 状态只浅复制，旧通知值会随嵌套对象后续变动；Angular `OnPush` 可能看不到嵌套字段变化 | S4 选 native 订阅加 revision 方向；D1 验受控更新及真实 `OnPush` 使用方式，文档明确可变视图语义 |
| R02 | Vue 消费方和插件存在原地修改，深度自动保存依赖 `watch` | 保留 Vue 契约；阶段 2 明确 Angular 受控更新与共享会话通知 |
| R03 | 原 `/core` 间接导出 Vue，存储依赖 `toRaw` 和 Vue 类型，包 peer 必需 Vue | S1/S2 已完成最小隔离并通过 `/core` 独立安装；D3/D4 补存储/SSE 无 Vue 入口及全能力产物验收 |
| R04 | 工具暂停元数据与会话消息分处存储；会话加载、保存、删除和恢复会竞态 | 可控异步存储及真实重载用例；定义晚到结果和销毁规则 |
| R05 | Angular 20/21 与 22 的 TypeScript 范围不同 | 三版本隔离宿主、严格声明与生产构建，失败时用证据调整 peer 承诺 |
| R06 | 与 WC 任务共享 kit 文件可能发生基线和实现分叉 | 每次共享文件编辑前核对差异和变更归属，不覆盖已有修改 |
| R07 | 旧 `/core` 曾导出 `createVueMessageAdapter`，但仓库文档和消费代码未使用；外部使用情况未知 | 保持 `/core` 无 Vue，Vue 内部继续使用 adapter；发布前核对已发布产物并记录路径变化，不为此复制 Angular API |
| R08 | 不合作且永不返回的 `responseProvider` 可使取消或自有连接释放 Promise 一直等待 | Provider 使用传入的 `AbortSignal` 及时结束；核心已忽略取消后迟到 chunk，D4 继续测资源基线并在 Angular API 文档明确限制 |

R1 已确定 native 状态订阅、共享会话规则层和单包子入口方向；D1 已采用 `updateMessage` 和自有/共享连接规则，并在 Angular 20 独立宿主验证。无 Vue 辅助入口的组织、会话规则和 Angular 21/22 验收仍待 D2-D4。当前无明确 Angular 业务评审者；若仍缺席，记录评审缺口并加强独立宿主验证。暂不新增 HttpClient/Observable 桥接，保留 `responseProvider` 边界。

## 9. 决策与阶段状态

| 日期 | 项目 | 状态 | 依据/后续动作 |
| --- | --- | --- | --- |
| 2026-09-26 | 使用 `robot/develop` 基线创建 `feat/kit-angular` 独立 worktree | 已完成 | 与 WC 分支分开工作；无实现改动 |
| 2026-09-26 | 首版完整支持现有 kit 能力，Skill 不默认延期 | 已确认 | M01-L01 逐项验收 |
| 2026-09-26 | 首版暂无 SSR 要求 | 已确认 | SSR 不进入当前验收；未来承诺须另增测试 |
| 2026-09-26 | Angular 20/21/22 与 Zone.js/zoneless 覆盖 | 建议，待独立验证 | 阶段 1 固化版本和模式矩阵 |
| 2026-09-27 | 阶段 0 目标文档与执行计划 | 已形成，待验证回填 | 实现由 `gpt-6-sol` high 子代理分任务执行；主代理审查，阶段 1 开始 |
| 2026-09-27 | S1/S2 核心入口及存储类型隔离 | 实验关口通过 | `/core` 无 Vue 消费通过；Vue 存储回归 22 项通过。根入口与无 Vue 存储入口仍待后续设计，详见执行计划进度记录 |
| 2026-09-27 | S3/S4 单会话与状态对照 | 实验关口通过，非首版验收 | Angular 20 TestBed、Zone.js/zoneless 浏览器交互、本地 HTTP/SSE；Angular 21/22 严格类型与生产构建；native revision 与 adapter 身份/通知/性能对照。详见执行计划和 [R1 评审记录](./angular-adaptation-r1-review.md) |
| 2026-09-27 | Angular 能力对等与 Vue adapter 路径 | 已确认方向 | 按文档和实际消费能力验收，不逐符号复制 Vue；`createVueMessageAdapter` 保留内部实现，`/core` 保持无 Vue。旧路径变化记入发布说明，存储/SSE 补无 Vue 入口 |
| 2026-09-27 | D1 消息阶段 | 已审查通过，非首版验收 | `/angular` 的 Signals、受控更新、自有/共享释放已由 Angular 20 独立宿主、严格声明、TestBed 和 Zone.js/zoneless 浏览器路径验证；kit 全量 194 通过、1 跳过。Skill、会话、21/22 浏览器矩阵和资源基线仍待 D2-D4 |
| 2026-09-27 | D2 Skill 阶段 | 已审查通过，非首版验收 | 复用 `/core` 的 Skill 插件、加载及存储，无需新增 Angular Skill 包装；Angular 20 独立宿主的请求级 Signal 选择、审批恢复、浏览器文件/GitHub 加载、取消和 IndexedDB 验证通过。自有连接销毁会取消暂停回合，导航持久化仍待 D3；21/22 浏览器矩阵和最终公开入口仍待 D4 |
