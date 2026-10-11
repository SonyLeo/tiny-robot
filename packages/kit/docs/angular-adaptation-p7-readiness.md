# P7 前置准备、反证与重新验收

> 2026-10-11。工作树 `D:/Projects/Work/tiny-robot-kit-angular`，分支 `feat/kit-angular`。本轮授权 N1–N6 实施与验证，不包含新的提交、推送或发布；历史本地提交授权只对应当时检查点。本页为当前状态入口，优先于历史执行表中的整体完成结论。

## 1. 当前结论

### 最新交接检查点（2026-10-11）

本轮按[N1–N6消费契约与完整验收设计](./angular-adaptation-finalization-design.md)完成基础 Angular 技术关口。N4 使用同一 N3 hash 完成 Angular20/21/22 strict/build/TestBed 与两模式 smoke；Angular20另补工具流式、Skill、旧格式5项打包能力、Node `/node` 和两模式受控GitHub404/取消、真实HTTP取消。N6 最终回归、lint、clean build和严格声明通过，重新pack与N3 hash一致。此前旧dist残留和失败记录保留为历史；发布决策与暂无 Angular 业务评审者单列。

下表列出当前 N3 候选包结果；下方历史章节中的“Angular22未运行”、275 等文字只描述当时检查点。最新证据以本节与[验收索引](./angular-adaptation-validation-results.md#2026-10-11-最新核对)为准。

历史本地提交保存了 D3 修复、存储生命周期、公开辅助出口和阶段验收记录。本轮改动仍在工作树中，未提交、推送或发布。

| 范围 | 最新实际结果 |
| --- | --- |
| manager/Vue 共享规则 | 已落地；Vue 五文件50/50通过，尾保存、删除取消、加载代际及paused保留有契约证据 |
| kit/Vue 源码回归 | N6：32文件，294 passed、1 skipped；lint、四入口 clean build和严格生成声明检查通过，重新pack与当前N3 hash一致 |
| 存储与公开工具 | DB close局部契约、类型往返、错误传播通过；根/core复用同一AIClient和工具实现，严格生成声明检查通过 |
| 当前候选产物 | SHA-256 `9EDCD1EC12EA7F1C76D5A6D3843BE1060153B0ED0B5B6F13BC6D469C1D3D52CE`；开发版本 0.5.1，未发布 |
| Angular20/21/22 独立宿主 | 同一候选包均通过 `skipLibCheck:false`、入口/声明检查、生产构建、8 文件 43/43 TestBed，以及 Zone.js/zoneless 关键浏览器 smoke；结果路径见[完成审核清单](./angular-adaptation-completion-audit.md) |
| 浏览器与资源 | 三版均完成本地 HTTP/SSE、Skill、OPFS/File、固定 ref GitHub、500/2000 历史、40 chunks、30 次销毁；最终订阅/请求/队列/数据库/timer 计数归零。Angular22 Zone 模式保留一次短暂 `dbBlocked:1` 环境观测，最终数据库计数平衡 |
| 列表调整 | `setMessages(messages)` 已在核心、Angular message/conversation connection、Vue `useMessage/useConversation` 实现；允许 idle/completed/aborted/error，processing/paused/工具审批拒绝；核心、Vue、manager 和当前候选包三版 Angular TestBed 已覆盖，索引见完成审核清单 |

资源取消阻塞、三版同包矩阵、受控传输负例和旧格式消费证据已关闭/归并。当前 M01–L01 技术结果见[完成审核清单](./angular-adaptation-completion-audit.md)，材料复核和新增负例后的完整脚本复验已完成。当前尚未发布；后续发布事项见[后续待办](#8-下一次继续的待办)。

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

“通过”指已确认首版范围内的技术验收通过，包含下述证据分工与限制；不代表完成业务评审或获得发布授权。逐子项和日志见[完成审核清单](./angular-adaptation-completion-audit.md)。

| 能力 | 完整关口 | 已有证据与尚缺内容 |
| --- | --- | --- |
| M01 消息/动态 Provider | 通过 | 三版 TestBed及关键smoke，空输入、对象顺序、动态Provider、setMessages |
| M02 Promise/流式/自定义 chunk | 通过 | 工具流式核心42项、三版TestBed/smoke、Angular20三层OnPush工具流式补验 |
| M03 取消/错误 | 通过 | 核心迟到丢弃、三版两模式、Angular20真实HTTP首块后取消及恢复 |
| M04 插件/请求清洗 | 通过 | 核心通用组合与三版公开命令、错误和字段清洗消费 |
| M05 工具/审批/恢复 | 通过 | 核心、三版TestBed、两模式整页重载批准/拒绝/故障恢复 |
| M06 Skill | 通过 | 三版动态选择/File/OPFS/IDB/固定ref，Angular20两模式受控GitHub404/取消；picker UI不承诺 |
| C01 会话生命周期 | 通过 | 共享manager、Vue/Angular连接、后台切换、删除清空及整页重载 |
| C02 持久化 | 通过 | 可控队列/尾保存/错误/paused/close；Angular20内置旧格式5项补验，fake IDB往返与真实Skill DB生命周期分别记录 |
| C03 竞态 | 通过 | 核心可控快切/加载代际/删除重建/迟到结果，三版关键页面消费 |
| A01 Signals/OnPush | 通过 | 三版TestBed及两模式嵌套刷新，Angular20三层工具消费；无业务评审者 |
| A02 生命周期 | 通过 | 自有/共享连接、manager释放、30次资源计数和DB owner；不合作Provider限制保留 |
| P01 独立消费 | 通过 | 同hash三版无Vue/alias、strict、入口、生产构建、TestBed及两模式浏览器 |
| V01 Vue 兼容 | 通过 | N6全量294/1 skipped、direct mutation/deep watch/签名；兼容变化另列 |
| L01 其他公开能力 | 通过 | core辅助出口/声明、真实SSE、Node FS/GitHub；默认opt-in网络测试仍skipped |

## 7. 首版范围保持

Skill 不静默延期；不以 Chat WC 或单会话结果替代 kit 完整 Angular 验收。SSR 暂不承诺，不新增 HttpClient/Observable wrapper 或 Angular UI 组件库。没有 Angular 业务评审者的缺口保留，主线程技术检查不称为业务方认可。

基础 Angular 实施与技术验收已完成，N6材料与脚本最终复核已收口。剩余版本、兼容迁移、提交/推送/发布由用户决定；技术验收不替代这些授权。

## 8. 下一次继续的待办

按以下顺序推进，实施仍由`gpt-6.1-sol high`子代理完成，主线程复核；读取本页与结果索引后再动代码，不重做已经有证据的步骤。

1. **T01 资源取消反证，已完成。** 核心可控reader与 Angular20/21/22 浏览器两模式均证明 abort 后迟到结果不会写入历史；保留旧失败记录和修复后 tarball/hash。
2. **T02 版本矩阵，已完成当前 N4 检查点。** 同一候选包在 Angular20/21/22 仓库外宿主通过 strict类型、生产构建、TestBed和Zone.js/zoneless smoke；npm peer 解析崩溃的历史保留，实际通过宿主使用可复现依赖。后续只在源码或hash变化时重跑受影响矩阵。
3. **T03 列表能力实现与验收。已完成。** 用户已确认受控 `setMessages(messages)`：只复制数组容器、保持消息对象身份、非 processing/paused/工具审批期间允许，统一触发消息通知和既有自动保存；清空列表不删除会话。核心、Angular connection、Vue connection、manager 和当前候选包 Angular TestBed 已覆盖；逐子项证据路径并入 T08 收口。
4. **T04 能力证据补齐，已完成。** 工具流式核心42项、打包能力5项、Node `/node` FS/GitHub消费已记录；M01-L01各项证据路径已归并到最终审计表，不把测试数量代替能力关口。
5. **T05 冻结源码并重打包，当前候选包已冻结。** N3 clean build、公开声明和 hash 已固定；若后续修改运行时或包元数据，必须生成新 hash 并按影响范围重跑。
6. **T06 完整独立矩阵，已完成。** 同包20/21/22完成 strict、无Vue/alias、core ESM/CJS与Angular实际ESM消费、声明、构建、TestBed及两模式浏览器；Angular20另补旧格式和受控传输负例。证据见完成审核清单。
7. **T07 Skill与资源基线，已完成。** File、OPFS句柄、二进制、strict/warnings、取消/异常、IDB close、受控成功/404/取消与真实fixed ref、长历史和30次销毁均有证据。OPFS不等于`showDirectoryPicker` UI；短heap观测不证明长期无泄漏。
8. **T08 交付准备审查，已完成。** API/迁移、可重建示例、团队材料和M01–L01证据已回填并复核；异步close等待的strict/5项TestBed及新增负例前缀后的完整smoke均通过。完整复验首次GitHub403限流、重置后重试成功及PID/端口清理见[完成审核](./angular-adaptation-completion-audit.md#n6-最终收口)。无业务评审者的缺口保留。

实施收口后待用户决定：候选版本及上述两项兼容迁移策略；是否本地提交、推送/PR及发布。后续实际Angular业务试用发现的问题按复现场景迭代；不另建分叉核心。

复现产物与隔离宿主暂保留在仓库外`D:/Projects/Work/_tmp`，不纳入提交；仓库提交包含可重建源码、测试、脚本和文档。后续继续前先检查分支、工作树及代理状态，保护现有修改。
