# P7 前置准备、反证与重新验收

> 2026-10-11。工作树 `D:/Projects/Work/tiny-robot-kit-angular`，分支 `feat/kit-angular`。源码基线包含本轮 P7-T01 资源取消修复。用户已授权修复 D3 缺口、重新验收及本地检查点提交；推送、发布及最终首版放行仍留后续评审。本页为当前状态入口，优先于历史执行表中的整体完成结论。

## 1. 当前结论

### 最新交接检查点（2026-10-11）

本次本地提交保存 D3 修复、存储生命周期、公开辅助出口、可重建 Angular 宿主及验收记录。它是开发检查点，完整首版未放行；用户本轮授权本地提交，推送与发布另行评审。

| 范围 | 最新实际结果 |
| --- | --- |
| manager/Vue 共享规则 | 已落地；Vue 五文件50/50通过，尾保存、删除取消、加载代际及paused保留有契约证据 |
| kit 源码回归 | 32文件，275 passed、1 skipped；lint及四入口clean build通过 |
| 存储与公开工具 | DB close局部契约、类型往返、错误传播通过；根/core复用同一AIClient和工具实现，严格生成声明检查通过 |
| 最新产物 | SHA-256 `2E23E364ABB1A0B152FFAC53121EA94A1BD8C3E24E7BA585647B5FD6905D1E7C`；开发版本0.5.1，未发布 |
| 最新产物 Angular20 | 仓库外无Vue安装、skipLibCheck:false、入口图、生产构建和7文件32/32 TestBed通过 |
| 最新产物浏览器 | P7-T01 已修复并通过：Angular20 Zone.js/zoneless 均通过资源取消、OPFS、受控GitHub、500/2000历史和30次销毁；最新 tarball SHA-256 `C7C01DB61D907849478B34CCAE2F3246292A282B7225B29B74C50F0C5E7E515A` |
| Angular21 | 最新 P7-T01 tarball 在全新仓库外宿主通过：pnpm 安装、`skipLibCheck:false` strict check、生产构建、7文件32/32 TestBed、Zone.js/zoneless 浏览器 smoke；真实本地 HTTP/SSE、Skill资源取消、OPFS、500/2000历史和30次销毁通过。npm 10.9.2 在 peer 解析阶段可重复触发 Arborist `edgesOut` 崩溃，故以 pnpm 完成干净安装，不使用 force/legacy-peer-deps |
| Angular22 | 最新产物未运行；已确认隔离 Node 24.19.0 可用，但需配合可用 npm/pnpm CLI 重建独立宿主。历史矩阵不能顶替当前结果 |
| 列表调整 | Angular仅有单条updateMessage；受控列表删除/清空方案待用户评审，尚未实现或延期 |

资源取消的核心阻塞已由 P7-T01 关闭；Angular21 最新产物矩阵现已通过。当前阻塞转为 Angular22 最新产物验证、消息列表调整 API 评审、M01-L01逐子项证据和最终交付材料。不能从单元测试或20/21两版结果推导完整首版通过。详细历史反证和有顺序的待办见[验收结果](./angular-adaptation-validation-results.md#修复前浏览器失败与版本安装失败)与[后续待办](#8-下一次继续的待办)。

以下第2-3节按发生顺序保留反证与检查点历史；其中“正在实施/待修复”描述当时状态，当前结论以本节和第6节为准。

当前实现具有单一消息引擎、Vue/native adapter、Angular 消息与会话连接，以及无 Vue 的 `/core` 辅助出口。既有单会话版本矩阵有实际证据，但不能证明完整多会话交付。

P7 逐项检查发现：Vue 会话仍独立维护管理规则；manager 的自动保存为 debounce，未实现 flush 尾保存；dispose 会取消暂停回合快照；delete/clear 未取消引擎；销毁后的操作与迟到加载未被阻止。因此撤回 D3 整体完成判断。此前测试命令确实通过，覆盖范围不足，不删除或篡改历史数据。

不再根据文件数或测试数量估算完成百分比。后续以目标文档 M01-L01 的子项关口与产物证据判定。

## 2. 实际复核证据

| 检查 | 实际结果 | 能证明什么 |
| --- | --- | --- |
| `pnpm --filter @opentiny/tiny-robot-kit exec vitest run` | 25 文件，213 passed、1 skipped | 当前已有测试通过；不能证明未编写的竞态与生命周期要求 |
| `pnpm --filter @opentiny/tiny-robot-kit build --clean` | ESM/CJS/DTS 成功 | 当前源码可构建；clean 清除旧声明与旧 chunk 后才打包 |
| P7 当前源码 tarball | SHA-256 `4E3881929E1D7C74792D01179FE347EE74FDA60C5E776785CEC6C76D7D124C85` | 此 hash 属于修复前基线，不作为修复后的最终交付产物 |
| D4.2 历史宿主日志 | Angular 20.3.33、21.2.24、22.2.1，三版严格声明/构建/20 项测试及两模式单会话 smoke | 日志包含 `app`、`d1`、`d2`、`s4`；没有正式 manager 会话 TestBed 文件 |
| D3c 历史重载描述 | `completed/browser reply` | 普通消息整页重载；不能证明 paused 工具/Skill 的恢复 |
| 200 次 heap 历史记录 | before 6,015,848、after 5,423,472 bytes | 短实例单进程基线；不能证明尾保存、paused、迟到加载和 DB 关闭 |
| npm 已发布 0.5.1 | registry integrity 与 npm pack 校验一致；core.mjs/core.d.ts 导出 createVueMessageAdapter，声明 import Vue | 旧导出是真实发布路径；需要准确说明兼容变化，不能仅按“内部符号”处理 |
| M06 真实 GitHub Node loader | 固定 openclaw/weather commit，未拦截网络，name weather、instructions 1856 字符、无资源 | 真实外网基础加载通过；不证明浏览器、目录句柄、资源恢复或最终 Angular 矩阵。命令见 [验收结果索引](./angular-adaptation-validation-results.md) |

历史 D4.2 日志保留于 `D:/Projects/Work/_tmp/tiny-robot-kit-d42`；宿主与 tarball 已清理。P7 验证输出使用独立目录 `D:/Projects/Work/_tmp/tiny-robot-kit-p7`。正式交付需要可从仓库脚本重建宿主，不能依赖这些临时目录继续存在。

Angular 22 历史构建使用隔离 Node 24.19.0；系统 Node 22.15.1 被 CLI 门槛拒绝。最终结果表分别记录实际宿主 Node 版本，不能合并为“系统环境全部通过”。

旧 npm tarball SHA-256：`B77754AA1EFD751C44B2CE7EE93BEB9861826982157E95CD1B12DD18C73DA98D`。使用 `pnpm view @opentiny/tiny-robot-kit@0.5.1 dist.tarball dist.integrity peerDependencies exports --json`、`npm pack @opentiny/tiny-robot-kit@0.5.1 --ignore-scripts` 读取；未安装到工作区、未发布。迁移说明见 [API 文档](./angular-adaptation-api.md#旧-core-vue-adapter-路径)。

## 3. D3 反证与修复关口

以下失败为修复前基线的实际结果。修复后保留反例，并新增通过证据与源码基线。

| 编号 | 已确认问题 | 可执行验收 |
| --- | --- | --- |
| F01 | Vue 会话持有独立 workingEngines、persistenceQueues 与加载/切换规则 | Vue 使用共享 manager，适配仅持有 facade/watch 映射；A→B 且 A 晚到最终为 B；并发同 ID 只生成一个引擎 |
| F02 | 自动保存取消重建 timeout，是 debounce；flush 不处理 timer | 固定窗口 leading/trailing；持续更新期间周期保存；通知 tail 后立即 flush，存储必须含 tail 且 timer 已结束 |
| F03 | dispose 清 timer 后无尾保存 | flush/dispose/回收保存最新消息；失败可观察；同 Promise 幂等释放；历史不删除 |
| F04 | dispose abort paused，清除 toolPlugin 快照 | 先保存 paused 消息，解绑并保留回合快照；新 manager 和 resolver 恢复批准/拒绝；旧实例不再参与 |
| F05 | delete/clear 丢弃引擎，未取消请求或清暂停快照 | 捕获旧引擎，取消并清其回合；同 ID 保存→删除→重建有序；其他会话不受影响；未加载 paused 会话删除也清快照 |
| F06 | disposed 只限制自动保存，新操作与迟到 load 仍可创建引擎 | 所有变更入口拒绝已释放 manager；延迟 load/loadMessages/switch 完成后不创建、不通知、不调用 onLoad |
| F07 | clear 未保留 tombstone，晚到列表可复活历史 | clear 的代际/删除标记使其前已发起的列表失效；删除期间未加载的旧条目也不能复活 |
| F08 | 初始/自动保存错误静默吞掉 | 错误报告及 flush/dispose 的拒绝规则明确；失败后同 ID 队列继续，其他 ID 独立 |
| F09 | 同 ID 直接 create 覆盖旧引擎且不释放 | 拒绝重复 ID 或以明确的退休流程释放；不得遗漏后台请求；delete 后同 ID recreate 仍允许 |
| F10 | 共享保存直接 structuredClone reactive metadata/runtime 字段 | 复用中立序列化规则；Vue metadata 和 runtime 字段保存符合既有契约；失败前不留下半创建状态 |

### 主线程独立复核（首轮修复后）

首轮 manager 实现的既有与新增测试共 24 项通过后，主线程在独立 `manager.review.test.ts` 验证了两个具体风险，均失败：

1. `autoSaveThrottle` 未配置时，消息通知仍标 dirty；回收 idle 引擎执行 flush 后保存了原本未手动保存的修改，违背 Vue `autoSaveMessages:false` 的兼容要求。
2. 尾保存的快照生成在入队前抛错时，flush 的 Promise.allSettled 结果被忽略，最终正常 resolve，也未报告持久化错误。

这两项为修复关口，保留测试供实现者修复，不能修改断言为当前错误行为。通过 24 项不是 manager 最终放行。

随后新增“storage 先前保存阻塞时 delete 仍及时取消 processing 引擎”用例。首轮实现将 abort 放在同 ID 保存队列内部，直到旧保存完成才取消，复现 abort 次数为 0。修复应立即捕获并启动旧引擎取消，同时保持存储删除及新代写入按队列排序，不能因旧存储永不返回而放任网络继续运行。

2026-10-05 随后修复并由主线程重跑：manager.review/contract/test 与 angular-connection 四文件 **34/34 通过**，上述三个独立复核问题转为通过。保留首轮失败记录；此结果只放行已覆盖的 manager 局部规则，尚未放行整个 D3。Vue 共享接入正在实施，另核对同步存储副作用、未加载历史 clear、二进制序列化和重入通知风险，之后重新 clean build/pack 并验独立宿主。

### D3 修复检查点（2026-10-05）

Vue `useConversation` 已接入共享 manager，删除独立规则与保存队列，保留 facade、选项映射和 sync deep watcher。内部 message runtime 未导出到根 API；具体引擎回收时同时停止其 provider watcher。同步存储 title/clear、初始列表晚到 clear、通知重入、回收时会话重新活跃均有新增反例转为通过。

主线程已复验 Vue 五文件 **50/50**，kit 全量 **254 passed、1 skipped**，clean build 的 ESM/CJS/DTS 成功。D3 检查点 tarball SHA-256 为 `1AEDBE014A7592FA860FAE89BE978210F4FB965B10FCCF37216101FACDBE33B6`。仓库外 Angular 20 严格声明、无 Vue 依赖图及生产构建通过；新多会话 TestBed 和浏览器仍在运行，21/22 尚未复跑该产物。

随后 Angular20 TestBed **29/29**（含新增manager 9项）、Zone.js/zoneless 浏览器均通过，包含真正整页重载的工具/Skill批准拒绝。缺少 Skill 的恢复契约已按源码复核：报告错误并保留 paused/快照，补回 Skill 后继续批准；不是强行完成回合。主线程修正宿主脚本的错误期望后复跑通过，失败历史见结果索引。21/22及最终存储修复产物尚未验收。

本次还发现内置 LocalStorage 保存方法吞掉错误，会使 manager 误认保存成功；manager 二进制快照测试不证明 IndexedDB 旧 unwrapProxy 的全部类型保留。存储错误传播、显式 DB close、格式化工具无 Vue 出口仍待修复和审计。这些未关闭前不能认定 C02/L01 或全 D3 放行。资源拥有者应等待 manager 最终保存后自行关闭外部 storage，manager 不擅自关闭共享 DB。

存储修复检查点：主线程的三个内置存储反例在修复前全部失败，修复后连同存储、Skill IndexedDB 和 manager 契约 **4 文件 38/38 通过**。LocalStorage 写入现已向调用方传播错误，中立序列化保留二进制 view/Map/Set，IndexedDB 并发首次调用共用打开任务。close 已有实现，但其生命周期验收、最新源码打包及最终矩阵尚未完成。原始失败和兼容变化见 [验收结果索引](./angular-adaptation-validation-results.md#存储独立反证与修复检查点)。

后续存储生命周期新增 10 项契约，子代理运行 `src/storage` 与 Skill IndexedDB 共 **5 文件 28/28 通过**，证明幂等、pending-open、失败后重试、历史保留、共享 storage 所有权及关闭后的懒资源边界。公开工具补原类/函数复用出口，8/8 局部通过；主线程 clean build 与 `test/tsconfig.core-public-utils.json` 的严格产物声明检查通过。

最新全量回归为 **273 passed、2 failed、1 skipped**：两个 Vue 引擎回收测试没有配置 Node 中不存在的 LocalStorage，先前写入错误被吞掩盖环境缺项。将显式提供内存存储，不恢复错误吞掉行为。lint 另发现两个既存未使用 import 和本轮 computed 依赖读取表达式，修复后复验；当前不放行最终产物。

上述环境与lint问题修正后，主线程重跑 **275 passed、1 skipped**、完整 lint 和 clean build 均通过。新检查点产物 SHA-256 `2E23E364ABB1A0B152FFAC53121EA94A1BD8C3E24E7BA585647B5FD6905D1E7C` 已在仓库外 Angular20 独立安装，严格声明和无Vue依赖图通过；完整矩阵及新增浏览器资源探针尚未完成。此检查点不包含待评审的列表调整能力。

另有范围决策待用户答复：`docs/src/tools/message.md` 将 messages 列表写入标为“引擎/应用”，允许初始化后的界面调整；Angular 当前仅支持单条 updateMessage。此前 D3a.1 明确不新增列表操作，但这不是完整首版列表能力的验收证明。已建议新增仅在非 processing/paused 状态可调用的受控列表更新，并等待评审；不静默延期或写成已等价。

### 存储与出口实施包（历史计划，局部实现已完成）

1. 存储写入失败必须传给 manager：LocalStorage saveConversation/saveMessages 保留日志并抛错；load 的既有空值 fallback 不改。记录写入失败不再伪成功的兼容变化，测试 quota/腐坏数据时暂停消息失败不生成可恢复快照，并测试修复存储后重试。
2. 复用中立序列化规则处理 IndexedDB 的 ArrayBuffer view/Map/Set，避免 manager 物化后再次被旧 unwrapProxy 扁平化。保留 Proxy、runtime字段、循环/共享引用和旧消息转换；用真实 storage 往返测试，不只检查 factory 输入。
3. Conversation/Skill IndexedDB 显式 close 由拥有者调用；并发初始化只持有一个打开任务，close 幂等，pending-open/失败可处理。manager 不自动 close 外部 storage。宿主先 await manager.dispose，再关闭自有 storage，补共用 storage 不被一个 manager 销毁和重复连接释放的证据。
4. `/core` 增加文档化格式化/提取工具的同一运行时出口，保持 Vue 根签名；严格声明消费验证其与 core OpenAI 消息/响应类型相容，不靠不安全类型声明承诺 tool 字段被保留。deprecated AIClient 保持旧 API，不造 Angular wrapper。
5. 上述源码冻结后再 clean build/pack；以新 hash 跑20/21/22完整矩阵、原生文件/目录与Skill边界、长历史/资源；D3检查点证据保留，不能顶替最终产物。

## 4. 已授权修复方案

### 4.1 共享 manager

- 保持 `createMessageEngine` 唯一消息/工具/Skill 规则。管理器不 import Vue/Angular。
- 固定窗口节流记录 dirty 状态；显式 flush 刷出尾调用并等待队列；删除取消尾调用，dispose 保存最新状态。
- 全局生命周期与会话 generation 同时检查所有异步 continuation。clear、delete、dispose 的失效时点为调用开始。
- 暂停持久化钩子置于工具快照钩子前，先等待消息保存成功。最终释放不 abort 已持久化 paused 引擎；显式 abort/delete 才取消审批。
- 同 ID 持久化队列串行；新代不得复用旧代异步结果；错误通过报告路径与可等待方法可观察。
- 最小连接接口：`notifyMessagesChanged(id)` 供 Vue deep watch 报告；`releaseInactiveEngines(excludeId?)` 回收可开始下一回合的空闲引擎，先处理尾保存。必要的 created/released hooks 只支持 facade/watch 生命周期，不另建会话规则。
- 不在每 token 通知时深拷贝全历史；存储写入时物化稳定快照。

### 4.2 Vue 接入

- 根 `useMessage/useConversation`、Ref/computed、插件响应式上下文、直接消息修改及原签名保持。
- 内部 Vue message runtime 同时提供 core engine 与旧 facade；不新增根入口公开符号。
- 会话列表、加载/切换、保存调度、删除与释放委托 manager；Vue 只保留代理、watch、选项和 facade 映射。
- `createConversation` 仍同步，`clear/updateConversationTitle` 仍 void；等待行为通过共享层处理，不强迫既有消费方改签名。
- 验证配置 initialMessages、加载失败 fallback、paused/background identity、空闲回收、旧数据和 runtime 序列化。

### 4.3 所有权与失败边界

组件共享连接释放只解绑。manager 拥有会话引擎；最终释放处理活动请求和保存，但不删除历史。外部 storage 由调用方拥有；若增加 DB close，manager 不自动关闭其他 manager 共用的 storage。Provider 必须响应 AbortSignal；永不结束的 Provider 是明确限制，不能靠测试超时伪称释放成功。

## 5. 后续执行顺序与产物

| 顺序 | 范围 | 主线程放行条件 |
| --- | --- | --- |
| R1 | manager 保存、代际、释放修复 | F02-F10 的可控反例转为契约测试；paused 使用真实 toolPlugin；无框架引用 |
| R2 | Vue 共享接入 | F01 及完整 Vue 回归；原签名、deep watch、插件上下文、对象身份与旧数据通过 |
| R3 | Angular 原生例子与可复现宿主 | 应用服务持有 manager、组件连接、真实 OnPush 消息/工具子组件；生产模板构建与严格声明 |
| R4 | 独立产物全能力验证 | 最终 tarball，20/21/22 与两模式；多会话、后台、多视图、真正重载工具/Skill 批准/拒绝；无 Vue/alias |
| R5 | Skill 与存储边界 | 真实 File/目录句柄/IndexedDB；二进制、取消、错误、strict/warnings；GitHub 受控与真实外网分开 |
| R6 | 性能与资源 | 500/80 对照及更长历史；反复卸载后订阅/timer/请求/保存队列/DB 连接基线，明确实际资源拥有者 |
| R7 | 材料与 P7 最终准备审查 | API、迁移、示例、团队说明、完整结果表；无失败/未运行被记为通过；随后交用户评审推进与发布 |

L01 的 `formatMessages/extractTextFromResponse` 与原AIClient无Vue出口已补齐，并通过局部运行时和严格生成声明验证；最终产物的所有入口、两代TypeScript和独立版本消费仍需归并。formatMessages仅返回文本结构，不能声明其输出为完整core工具消息。

实现使用 `gpt-6.1-sol high` 子代理，主线程检视 diff、契约、证据和兼容。共享核心文件只由一个任务编辑，Vue 与宿主任务不得覆盖 manager 文件。WC 工作树 kit 与 `robot/develop` 比较无差异，本轮改动归 Angular 工作树；后续整合保持单一共享核心。

## 6. M01-L01 当前完整关口状态

状态只有通过、失败、未运行；“完整关口未运行”不否定已有局部通过。

| 能力 | 完整关口 | 已有证据与尚缺内容 |
| --- | --- | --- |
| M01 消息/动态 Provider | 未运行 | 单会话核心/Vue/Angular 结果已通过；需最终产物逐项归并动态替换和空输入 |
| M02 Promise/流式/自定义 chunk | 未运行 | native/OnPush 流式已有证据；最终自定义 runDefault、元数据和展示/请求分离归并 |
| M03 取消/错误 | 未运行 | P7-T01 核心可控 reader 与 Angular20/21 Zone.js、zoneless 浏览器均证明取消后迟到资源不会写入历史；最终冻结产物全矩阵及错误子项归并待完成 |
| M04 插件/请求清洗 | 未运行 | 核心/Vue 生命周期已有测试；最终 Angular 自定义命令、错误和清洗结果收口 |
| M05 工具/审批/恢复 | 未运行 | paused dispose 已修复；核心与Angular20真正整页重载批准/拒绝通过；最终产物完整矩阵待跑 |
| M06 Skill | 未运行 | Angular20/21最新P7-T01 tarball完成原生目录、二进制、重复路径、资源取消和受控GitHub；真实GitHub与最终全版本产物归并待完成 |
| C01 会话生命周期 | 未运行 | Vue已共享manager；delete/clear及时取消、paused释放已有测试和Angular20产物证据；最终完整矩阵待跑 |
| C02 持久化 | 未运行 | 原三个反例及close局部生命周期通过；Angular20服务关闭顺序通过，最终浏览器及全版本仍待验收 |
| C03 竞态 | 未运行 | 快速切换、加载去重、迟到clear/dispose、重入及回收活跃会话的反例已通过；最终产物归并待跑 |
| A01 Signals/OnPush | 未运行 | 单消息真实组件已有证据；正式多会话/工具子组件矩阵待补 |
| A02 生命周期 | 未运行 | 共享只解绑、manager取消/尾保存/paused保留通过核心与Angular20；storage关闭及长资源基线待补 |
| P01 独立消费 | 未运行 | 最新tarball的Angular20/21 strict声明、生产构建、32项TestBed及两模式浏览器通过；Angular22未跑，最终冻结产物矩阵未完成 |
| V01 Vue 兼容 | 未运行 | 当前共享迁移50/50及kit全量275/1跳过通过；最终源码冻结后需归并所有兼容子项与后续修改回归 |
| L01 其他公开能力 | 未运行 | 新 core 出口检查通过；旧发布 adapter 路径和根/node 产物完整审计待收口 |

## 7. 首版范围保持

Skill 不静默延期；不以 Chat WC 或单会话结果替代 kit 完整 Angular 验收。SSR 暂不承诺，不新增 HttpClient/Observable wrapper 或 Angular UI 组件库。没有 Angular 业务评审者的缺口保留，主线程技术检查不称为业务方认可。

P7 前置准备完成后提交实际结果与剩余发布决策，用户评审决定是否推进、推送或发布。当前仍在修复与准备阶段，不标 goal 完成。

## 8. 下一次继续的待办

按以下顺序推进，实施仍由`gpt-6.1-sol high`子代理完成，主线程复核；读取本页与结果索引后再动代码，不重做已经有证据的步骤。

1. **T01 资源取消反证，已完成。** 核心可控reader与 Angular20 浏览器两模式均证明 abort 后迟到结果不会写入历史；保留旧失败记录和修复后 tarball/hash。
2. **T02 版本矩阵。Angular21已完成。** 最新tarball在仓库外Angular21宿主通过 strict类型、生产构建、TestBed32/32及Zone.js/zoneless smoke。npm10.9.2在两次干净安装中崩溃；pnpm10.33.2干净安装通过。下一步用隔离Node24.19.0建立Angular22新宿主并完成相同检查；不使用force/legacy-peer-deps，不改全局环境。
3. **T03 列表能力评审。** 等用户决定受控列表更新API；推荐只在idle/completed/error/aborted允许，processing/paused拒绝。评审须说明删除/清空、对象身份、通知与自动保存、Vue兼容；未经确认不实现或静默排除。
4. **T04 能力证据补齐。** 对照M01-M06/C01-C03/A01-A02/P01/V01/L01逐子项检查，补动态Provider、空输入、发送对象、自定义chunk/runDefault、插件命令/错误与请求清洗的独立消费缺项。开始前完成T03列表能力范围评审；通用核心规则用核心测试证明，Angular响应式与DI用真实TestBed证明。
5. **T05 冻结源码并重打包。** 全量kit、Vue回归、lint、clean build和公开声明通过后，制作新tarball/hash；当前`2E23…`是失败复现检查点，不能称最终放行产物。
6. **T06 完整独立矩阵。** 同一最终tarball在20/21/22全新仓库外宿主安装；skipLibCheck:false、无Vue/源码alias、ESM/CJS及声明、生产构建、TestBed、Zone.js/zoneless浏览器、本地HTTP/SSE、真正重载工具/Skill审批均记录退出码与版本。
7. **T07 Skill与资源基线。** 原生File、OPFS真实目录句柄、二进制、strict/warnings、取消/异常、IDB关闭后无blocked；受控GitHub与真实外网分开。OPFS句柄不等于用户操作showDirectoryPicker，若宣称文件选择交互已验证需另给交互证据。记录500/2000历史及重复30次销毁；区分实际观测和手动计数，资源需回到约定基线。
8. **T08 交付准备审查。** 回填最终结果、API/兼容迁移、可重建示例和团队材料；无Angular业务评审者的缺口保留。全部首版能力有证据后才完成goal，并交用户决定推进/推送/发布。

复现产物与隔离宿主暂保留在仓库外`D:/Projects/Work/_tmp`，不纳入提交；仓库提交包含可重建源码、测试、脚本和文档。后续继续前先检查分支、工作树及代理状态，保护现有修改。
