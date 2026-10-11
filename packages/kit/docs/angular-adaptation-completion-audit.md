# Angular 适配首版完成审核（当前证据清单）

> 记录时间：2026-10-11。基线分支 `feat/kit-angular`，HEAD `9de3df7c3a4374c090400aedbdd337c0ef036980`；工作树存在未提交源码和文档修改。本记录按当前源码、当前测试和当前产物证据建立，不从旧正文推导完成，也不把本记录当作首版放行公告。

## 读取口径

能力只有在对应层实际证明时才记为通过。共享核心测试可以证明框架无关规则，但不能替代 Angular 模板刷新、仓库外包安装或真实浏览器资源；Angular TestBed 可以证明 Signals、OnPush、DI 和连接生命周期，但不能替代真实版本矩阵；旧 tarball 的结果只保留为历史。当前 N3 候选包为 `D:/Projects/Work/_tmp/kit-angular-n3-20261011/opentiny-tiny-robot-kit-0.5.1.tgz`，SHA-256 `9EDCD1EC12EA7F1C76D5A6D3843BE1060153B0ED0B5B6F13BC6D469C1D3D52CE`。同一 hash 的版本/模式技术矩阵已完成；当前证据归并与发布决策分别记录。

当前检查点：N1/N2 已隔离严格声明检查 exit 0，三版各 8 个文件 43 项 TestBed 通过；Angular20另补打包能力5项。N6 主线程最终全量 kit/Vue 回归为 32 文件 294 passed、1 skipped，lint、正常 `tsup --clean` 和严格生成声明检查通过，重新 pack 的 SHA-256 与 N3 完全一致。日志位于 N3 目录 `N6-kit-full.log`、`N6-kit-lint.log`、`N6-kit-clean-build.log`、`N6-core-public-types.log`；重复打包清单位于 `D:/Projects/Work/_tmp/kit-angular-n6-consistency-20261011/pack.json`。测试数量只索引已运行检查，能力结论按下表判定。

本轮矩阵进度（已读日志）：同一 N3 hash 的 Angular 20/21/22 strict、生产构建、43 项 TestBed 和两模式关键浏览器 smoke 已完成。Angular 21 的 Zone/zoneless 生命周期字段在修正脚本后均有结构化结果；Angular 22 首轮诊断等待问题也已由外部宿主修正后复跑通过，首轮保留为历史。用户已确认暂无 Angular 业务评审者，后续在实际使用中迭代；本轮按首版基础 Angular 完整功能收口，不假称已获业务评审认可。

已回填的同 hash 产物证据：Angular 20 外部宿主 `D:/Projects/Work/_tmp/kit-angular-n4-20-20261011`（`n4-strict.log`、`n4-build.log`、`n4-test.log`、`n4-smoke.log`）；Angular 21 外部宿主 `D:/Projects/Work/_tmp/kit-angular-n4-21-20261011`（`N4-results.md`、`N4-browser-smoke-result.json`、`N4-tsc.log`、`N4-build.log`、`N4-test.log`）；Angular 22 外部宿主 `D:/Projects/Work/_tmp/p7-angular22-n4-final-20261011`、证据目录 `D:/Projects/Work/_tmp/p7-angular22-n4-evidence-20261011`（`summary.json`、`strict-tsc.stdout.log`、`ng-build.stdout.log`、`ng-test.stdout.log`、修正后 `browser-smoke.result.json`/stdout、`report.zh.md`、`cleanup.json`）。这些日志均指向候选 SHA-256 `9EDCD1EC12EA7F1C76D5A6D3843BE1060153B0ED0B5B6F13BC6D469C1D3D52CE`；22 自有 PID/端口清理有实际记录。

| 当前 hash 宿主 | 实际版本 | 当前已读结果 | 边界/补验分工 |
| --- | --- | --- | --- |
| Angular 20 | core 20.3.33、TypeScript 5.9.3、Zone.js 0.15.1、Vitest 3.2.7、Node 22.22.3 | strict/entry/生产构建；8 文件 43 TestBed；两模式关键 smoke、原生资源、live fixed ref、500/2000×40chunks、30 次销毁计数归零；另补5项工具/Skill/旧格式 TestBed、两模式 GitHub404/取消与真实HTTP取消 | 技术关口通过；SSR/picker UI不承诺 |
| Angular 21 | core 21.2.25、CLI/build 21.2.26、TypeScript 5.9.3、Zone.js 0.16.3、Vitest 4.1.11、Node 22.22.3 | strict/entry/生产构建；8 文件 43 TestBed；两模式关键 smoke、原生资源、live fixed ref、500/2000×40chunks、30 次销毁计数归零；修正后的 Zone/zoneless 结构化生命周期结果 | 技术关口通过；5项细分能力与受控传输负面路径以Angular20同包补验承担，未在本版本重复 |
| Angular 22 | core/CLI/build 22.2.2、TypeScript 6.0.3、Zone.js 0.16.3、Vitest 4.1.11、Node 22.22.3 | no-direct-openai安装、无Vue、skipLibCheck:false、strict/entry/生产构建；8 文件 43 TestBed；两模式关键 smoke、原生资源、live fixed ref、500/2000×40chunks、30 次销毁计数归零；修正后的结构化生命周期结果 | 技术关口通过；细分补验由Angular20同包承担；`zone` 的 `dbBlocked:1` 为短暂环境观测，最终数据库计数归零 |

三版均通过 `--reuse-single` 将原 D2/S4 测试复制到外部宿主，再消费同一 N3 tgz；因此 D2 用例名本身不使本轮结果变成历史。当前包已证明动态 Skill Signal 的 manual→none→auto/`select_skills`。N4 重跑的 S4 500条/80chunks 与 P7 browser probe 500/2000条/40chunks 是不同场景，分别记录。

## M01–M06：消息、响应、取消、插件、工具、Skill

| 子项 | 当前源/测试证据 | 可由核心通用规则覆盖的部分 | 当前产物或独立宿主证据 | 当前结论/风险 |
| --- | --- | --- | --- | --- |
| M01 消息、发送、状态、动态 Provider | `src/message/core/engine.ts`；`src/message/test/native.test.ts`；`experiments/angular-p7/src/public-message.spec.ts`（空文本/对象顺序/Provider 替换） | 初始消息、空白短路、对象追加、同回合不可重入、当前回合固定旧 Provider、下一回合使用新 Provider | N4 三版 43 项 TestBed 已重跑上述公开消费；三版两模式关键消息 smoke 已运行 | 核心及当前包 Angular 消费已有 |
| M02 Promise、AsyncGenerator、默认合并、自定义 chunk | `engine.ts` 执行路径；`native.test.ts` 流式/钩子；`public-message.spec.ts` `runDefault=false/true`、嵌套 display/metadata revision；`N4-tool-stream-core.log` | Promise/AsyncGenerator 归一化、默认增量合并、未调用 `runDefault` 不合并、自定义字段原地更新；工具多块字符串/对象 delta 合并已有 42 项核心定向用例 | N4 三版 TestBed及两模式关键流式 smoke 已有；工具流式核心与打包能力补证已完成 | 消息和工具流式当前包消费已有；浏览器受控 GitHub 负面路径另列 |
| M03 取消、错误、finally | `native.test.ts` 迟到 chunk；Vue lifecycle tests；`public-message.spec.ts` Provider error、onError/onFinally、恢复发送；N4 smoke | AbortSignal 传递、迟到响应丢弃、错误 Promise reject、错误消息、finally 只记录、取消状态 | N4 三版 TestBed及两模式处理期间 dispose、HTTP/SSE 和页面重载已有；永不返回 Provider 的等待限制继续保留 | 核心与当前包关键消费已有 |
| M04 请求清洗、插件顺序/命令 | `native.test.ts` request fields、plugin order；`toolPlugin.test.ts`；`public-message.spec.ts` 请求清洗、命令结果、错误钩子 | body 白名单/排除不改展示消息；插件顺序、命令结果、重复工具名和错误传播由核心测试覆盖 | N4 三版 TestBed已验清洗后的 body、Signal 中嵌套命令更新、插件错误 UI；不必在每个浏览器版本穷举相同核心组合 | 核心与当前包公开消费已有 |
| M05 工具执行、流式结果、轮次、审批/恢复 | `toolPlugin.test.ts` 轮次、动态工具/provider、流式结果、审批并发、拒绝、暂停快照/重建、取消和运行时对象单结果；N4 TestBed和三版两模式 browser smoke | 工具来源、轮次上限、每次调用状态、审批命令并发和快照协议；42 项核心定向用例覆盖多块字符串、对象 delta、部分结果失败保留、无结果 fallback 和取消迟到块；当前包批准/拒绝和销毁旧实例整页重载已有 | N4 三版关键 smoke 与 Angular20 打包能力5项已有；多版本无需重复全部核心矩阵 | 核心和当前包工具流式边界通过 |
| M06 Skill 选择、资源、浏览器/GitHub/存储 | `skillPlugin.test.ts`、`selectionCapability.test.ts`、loader/storage tests；N4 宿主通过 `--reuse-single` 将 `d2.spec.ts` 接到当前 N3 包并运行；Node 宿主运行 `node-consumer.mjs` | manual/none/auto、候选限制、资源工具、懒读取、失败/取消、Node FS/GitHub 固定 ref 均有核心或独立宿主证据；三版 TestBed含动态 Signal getter 的三种选择；两模式真实 File/OPFS、固定 ref GitHub 和整页资源恢复已有 | Angular20 两模式受控307转本地HTTP的GitHub404/取消已补；真实 directory picker UI 不在首版自动化承诺 | 当前包消费通过；受控负例与真实GitHub成功分别记录 |

## C01–C03：会话、存储、竞态

| 子项 | 当前源/测试证据 | 核心规则已证明 | 当前独立宿主证据 | 结论/风险 |
| --- | --- | --- | --- | --- |
| C01 会话生命周期 | `src/conversation/manager*.test.ts`；`manager.contract.test.ts`；N4 `manager.spec.ts` 与 browser smoke | 创建、加载、切换、标题、清空/删除、后台引擎、加载代际和同 ID 隔离 | 当前 tarball 三版两模式页面级切换、后台生成、双视图解绑、旧实例销毁后重新连接/重载已有 | 核心与当前包关键消费已有 |
| C02 持久化、尾保存、旧格式、close | manager契约；storageStrategies/indexedDBLifecycle；Skill IDB；N4 resources/Node；`packed-capabilities.spec.ts:167` | 队列快照、删除顺序、失败、pending-open/幂等close/共享所有权由可控核心测试覆盖；当前包Angular20内置两策略旧格式加载、修改、flush、await close/重开已有 | N6-capabilities-ng-test.log 5/5、N6-capabilities-tsc.log exit0；fake IDB负责数据往返，三版真实浏览器负责Skill DB生命周期 | 核心和当前包消费通过 |
| C03 竞态、回收、后台/暂停 | manager contract/review 代际、同 ID 删除再建、尾保存、dispose；tool tests 暂停快照；N4 lifecycle日志 | 可控并发规则已有；20/21/22 两模式均有 500/2000 历史、40 chunks、30 次销毁计数归零和修正后的结构化生命周期结果 | 不合作 Provider 等限制继续保留；浏览器受控 GitHub 负面路径另列 | 核心与三版主要生命周期通过；不合作 Provider 仍是已知限制 |

## A01–A02、P01、V01、L01

| 子项 | 当前证据 | 独立产物必须证明 | 当前结论 |
| --- | --- | --- | --- |
| A01 Signal/OnPush | `src/angular.ts` native connection + revision；N4 `public-message.spec.ts`/`manager.spec.ts` 真实 OnPush 子组件；三版两模式关键 smoke | 当前 hash 三版 Zone.js/zoneless 消息、嵌套状态、后台切换均已验；Vue adapter `getState()` 与 native identity 规则不能混写 | 当前包关键 Angular消费已有；工具流式样本见M05 |
| A02 所有权/DestroyRef | `angular-bridge.contract.test.ts`；manager contract；N4 dispose/manager tests及browser smoke | 当前包共享/自有连接、暂停快照、尾保存、旧实例销毁后重载、共享 IndexedDB 由拥有者 close 和三版结构化生命周期已有 | 关键消费已有；不合作 Provider 限制已记录 |
| P01 独立消费 | `/core`、`/angular`、`/node` exports；N3 clean build、strict declaration、diff check exit 0；N4 三版本 entry/strict/build/TestBed；Node `node-consumer.mjs` | 同一 N3 hash 三版本无 Vue/source alias、skipLibCheck:false、core ESM/CJS、Angular ESM生产构建与 TestBed；Node FS、受控 GitHub、取消和固定 ref 真实消费均有日志 | 三版本打包和 Node 公开入口已有；默认网络 skipped 单列 |
| V01 Vue 兼容 | Vue message/conversation tests、native/Vue adapter tests；N6全量 294 passed/1 skipped | direct mutation、deep watch、旧签名已有回归；Vue adapter `getState()` 递归普通值与 native 浅数组视图分别核对 | 当前源码回归通过，clean build重新pack与三版已验hash一致；兼容变化另列 |
| L01 其他公开能力 | `core.public-utils*.test.ts`、`message/publicExports.test.ts`、`skills/publicExports.test.ts`；N4 core-helpers；`/node` `node-consumer.mjs` | N3 包 ESM/CJS/DTS、`AIClient`/BaseModelProvider/format/extract helpers、Node FS/GitHub 固定 ref、工具字段和 nullable 文本契约均有证据 | 公开辅助类、Node 实际消费和固定 ref 已有；默认网络 skipped 单列 |

## 逐子项核对表

以下路径均相对 `packages/kit`。`N2-message` 指 `experiments/angular-p7/src/public-message.spec.ts`，`N2-manager` 指同目录 `manager.spec.ts`；名称保留其新增阶段，N4 三版本已通过 `--reuse-single` 将它们复制到消费当前 N3 hash 的宿主并全部运行，8文件43项通过。`tool tests` 指 `src/message/test/toolPlugin.test.ts`，`Skill tests` 指 `src/skills/test/skillPlugin.test.ts`。表中“规则已有”仅表示该层的证据充分，不表示最终产物已放行；末列已具备的证据写“已有”，真正缺项写“待补”。

| 编号/子项 | 公开入口与可核验用例 | 已证明的层与结果 | 对应产物证据/边界 |
| --- | --- | --- | --- |
| M01 初始消息与 idle | `/core` engine/native；`src/message/test/native.test.ts:157` | 初始消息和 idle 派生状态规则已有 | N4打包状态读取已有 |
| M01 文本、空白发送 | `/angular` sendMessage；`N2-message:86` | 空文本/空白不追加、不请求，普通文本进入请求 | N4三版打包TestBed已有 |
| M01 消息对象与顺序 | `/angular` send；`N2-message:86` | 对象顺序、身份、展示字段已有 OnPush 消费断言 | N4三版打包TestBed已有 |
| M01 请求/派生状态、连续回合 | `/angular` requestState/isProcessing/isPaused/canStartTurn；native 通知序列、tool tests 暂停/恢复；`N2-message:197` | 核心状态及错误后下一回合规则已有 | N4六组关键smoke已有 |
| M01 动态 Provider | `/angular` setResponseProvider；`N2-message:60` | 当前回合含 length continuation 固定旧 Provider；下一回合使用新 Provider | N4三版打包TestBed已有，无须六组浏览器穷举 |
| M02 Promise 单结果 | `/core` ResponseProvider；native `sendMessage runs responseProvider` | 普通结果归一化与追加规则已有 | N4三版公开Provider消费已有 |
| M02 AsyncGenerator 默认增量 | `/core` engine；native 通知序列；P7 `message.spec.ts`、browser smoke | 核心流式状态/消息规则和当前包 OnPush 消费 | N4六组关键流式smoke已有 |
| M02 自定义 chunk/runDefault | `/core` onCompletionChunk；`N2-message:107` 两种参数 | 未调用/调用 runDefault 的结果分别断言；嵌套 display/metadata 自动刷新 | N4三版打包TestBed已有 |
| M03 AbortSignal/迟到块 | `/angular` abort；native迟到块；Vue lifecycle；P7 negative-transports | 核心迟到丢弃、Angular20两模式真实HTTP首块后取消：Signal/服务端close/DOM及历史均断言 | N4-negative-transports-{zoneless,zone}.json已有；不合作Provider限制保留 |
| M03 Provider 错误与恢复 | `/angular` sendMessage；`N2-message:197` | 原始 Promise reject、error UI、下一回合恢复已有 | N4三版打包TestBed已有 |
| M03 插件 error/finally | `/core` 插件生命周期；`N2-message:197`、Vue lifecycle | throwing onError/onFinally 的日志与原始错误保持有断言 | N4三版打包TestBed已有；不要把所有钩子异常都写成相同传播规则 |
| M04 字段包含/排除 | `/core` requestMessageFields/Exclude；`N2-message:146` | 请求清洗不改变展示历史，白名单/排除均断言 | N4三版打包TestBed已有 |
| M04 插件请求修改顺序 | `/core` plugins；native hook-order；`N2-message:146` | 两插件顺序修改请求并由 Provider 观察 | N4三版打包TestBed已有 |
| M04 默认 thinking | `/core` thinkingPlugin；`src/message/test/native.test.ts:613` | thinking 状态规则已有 | N4默认插件入口/消息消费已有 |
| M04 默认 length | `/core` lengthPlugin；`N2-message:60`、tool tests 关闭请求 continuation | continuation 的 Provider/工具关闭规则已有 | N4三版打包TestBed已有 |
| M04 命令/嵌套更新 | `/angular` dispatchCommand；`N2-message:179` | 泛型结果、unknown 命令拒绝、嵌套 mutate/revision 刷新 | N4三版打包TestBed已有 |
| M05 动态工具/提供者 | `/core` toolPlugin getTools/toolProvider；tool tests `:734`、`:828` | provider 来源、列表改变、当次 handler 稳定已有直接断言 | 一条当前包实际工具调用，无须逐浏览器重复所有来源 |
| M05 异步对象单结果 | `/core` runtime tools；tool tests `:535` | 运行时工具调用与对象单结果已有核心证据 | N4三版OnPush工具行消费已有 |
| M05 多块字符串/对象 delta | `src/message/test/toolPlugin.test.ts` streamed result contract；`packed-capabilities.spec.ts` 三层 OnPush | 每块累加、嵌套 delta/数组 index 合并、稳定消息身份、后续请求参数已有直接断言 | N4-tool-stream-core.log 42/42、N6-capabilities-ng-test.log 5/5 已有 |
| M05 失败/取消/部分结果 | tool tests streamed result contract、暂停/恢复中取消；当前包 browser smoke | 失败前无结果 fallback、失败后保留部分结果、取消迟到块与状态已有直接断言 | 核心42项和当前包取消/恢复 smoke 已有 |
| M05 轮次限制 | tool tests `:88`、`:161`、`:319`、`:363`、`:396`、`:436`、`:473` | 默认不限、零/超限、跨回合重置、continuation、违规 provider、callback throw 均有核心证据 | N4当前包toolPlugin实际调用已有，轮次组合由核心承担 |
| M05 批准/拒绝/并发 | `/angular` tool.resume/tool.reject；tool tests `:1182`、`:1518`、`:1805`；`N2-manager:160` | 命令幂等/并发、部分拒绝和继续、paused 列表保护已有 | N4六组关键审批/拒绝smoke已有 |
| M05 暂停/重载恢复 | tool tests `:2312`、`:2445`、`:2523`、`:2588`；P7 browser smoke | 核心快照、预算、缺状态/同 tool ID 隔离已有 | N4三版两模式销毁旧实例后整页批准/拒绝及缺快照已有 |
| M06 manual/none/auto | `/core` skillPlugin；Skill tests `:53`、`:911`、`:1049`、`:1069`；N4 `src/d2.spec.ts:50` | instructions/runtime tools、缺 toolPlugin/none 核心规则已有；N3 包三版本 TestBed 已执行 auto `select_skills` | 保留 N4 43 项 TestBed 与复制源/manifest；内部规则不需六组重跑 |
| M06 每请求动态选择 | skillPlugin selection getter；N4 `src/d2.spec.ts:50` | `--reuse-single` 将原 D2 用例接到当前 tgz，三版本 TestBed 验 manual→none→auto 的 Signal 逐请求变化 | 已有当前 hash 消费证据，不能因用例名 D2 判为仅历史 |
| M06 resolver/candidates/limits | Skill tests `:812`、`:854`、`:884`；selectionCapability max/concurrent tests | 失败继续、名称匹配、去重、候选限制、首个并发选择规则已有 | 当前包自动选择/失败 UI，不必全部版本重复内部组合 |
| M06 请求上下文/回调 | Skill tests `:721`、`:757`、`:787`；N4 `src/d2.spec.ts:50` | 核心默认不改展示历史已有；当前包 manual/auto instructions、资源工具和 phases 序列已有 | 当前产物此子项证据已给出 |
| M06 资源工具与恢复 | Skill tests `:187`、`:271`、`:399`、`:496`、`:609` | 迟到 reader、runtime rebuild、缺 resolver/snapshot/context 规则已有 | N4三版两模式Skill整页重载批准/拒绝/缺资源已有 |
| M06 浏览器加载/导入 | `/core` loadSkill；loaderBrowser tests；P7 `src/browser-resources.ts`、N4 smoke logs | 核心及 Angular 20/21/22 当前包两模式 File/真实 OPFS、binary、strict/warnings、reader失败、迟到取消/import cancel 有证据 | 三版当前包已有；不声称 picker UI |
| M06 GitHub 加载 | `/core` loadSkill；P7 controlled/live diagnostics；N4 smoke logs；Node controlled tests | Node受控重试/错误已有；三版当前包controlled success和live `openclaw/openclaw@58672075219d09495de6489ad0821d276ac84f13:skills/weather`通过 | Angular20两模式真实HTTP受控404/取消已有；Node默认skipped保留 |
| M06 内存/IndexedDB 存储 | `/core` memory/IndexedDB Skill storage；各 storage tests | 导入、资源 lazy reader、二进制与 close 的核心规则已有 | N4六组浏览器导入/重载/close及DB基线已有 |
| M06 Node 文件系统定位 | `/node` loadSkill/loadSkillWithDetails/createFsSkillStorage；loaderNode/fsStorage tests | 本地 FS fixtures、安装/回滚/只读/懒读规则已有；默认网络项 skipped | 当前 tgz Node FS 实际消费；entry-check 命名导出不能替代 |
| C01 创建/加载/标题 | `/core` manager、`/angular` connection；manager tests/contract | 会话独立初始消息、duplicate ID、标题快照和加载规则已有 | N4当前包页面创建/加载/标题消费已有 |
| C01 切换/活跃动作 | `/angular` switchConversation/sendMessage/send/abort；`N2-manager:39`、`:176` | 后台 A/活跃 B、返回自动刷新、无 active 动作边界已有 | N4六组浏览器后台切换已有 |
| C01 删除/清空 | `/core` deleteConversation/clear；manager contract/review；`N2-manager:241`、`:257` | 删除先取消、队列顺序、未加载暂停删除、历史隔离已有 | N4六组删除/重载smoke已有 |
| C02 自定义存储 | `/core` ConversationStorage；N2 service BrowserStorage | manager 接口消费、失败/flush/恢复有测试；P7 自定义 localStorage 不是内置策略 | N4三版声明与自定义存储消费已有 |
| C02 内置 LocalStorage/IndexedDB | `/core` strategy factories；storageStrategies/indexedDBLifecycle tests | 策略CRUD、错误和fake DB生命周期规则已有 | Angular20当前包内置factory加载/保存/close/重开5项已有；conversation IDB往返为fake IDB，真实Skill DB由三版浏览器承担 |
| C02 手动/自动保存、尾调用 | `/core` saveMessages/flush；manager contract `:207`、`:237`；`N2-manager:218` | 固定 leading/trailing 窗口、最终 tail、错误报告/恢复已有 | N4六组持久化重载已有；Vue deep watch不代替Angular保存 |
| C02 旧消息格式 | storageStrategies `:37`、`:107`；`packed-capabilities.spec.ts:167` | 内置 LocalStorage/IndexedDB renderContent→reasoning/text、metadata、OnPush显示、修改/flush/await close/重开有直接断言 | Angular20当前包 N6-capabilities-ng-test.log 5/5、N6-capabilities-tsc.log exit0；fake IDB数据往返与真实Skill DB生命周期分别记录 |
| C02 暂停消息/快照顺序 | manager contract `:582`、`:614`；tool/Skill tests | 先保存消息再 commit turn；失败不产生可恢复快照已有 | N4六组保存成功/失败后的整页恢复已有 |
| C02 外部 storage close | indexedDBLifecycle `:26`、`:42`、`:81`、`:100`、`:122`；Skill IDB | pending-open、幂等、重试、新实例历史、共享 owner 规则已有 | N4六组flush/dispose后owner close、真实Skill DB观察已有 |
| C03 快切/同 ID 并发加载 | manager tests/contract、加载代际；`N2-manager:231` | 加载去重/代际与 dispose 晚到不复活有规则证据 | N4六组关键切换smoke已有，细分竞态由核心承担 |
| C03 初始列表晚到 | manager contract `:121`、`:186`、`:329`；review `:78` | clear/dispose 后不恢复旧列表、同 ID 创建排序有证据 | N4三版manager消费已有 |
| C03 保存→删除→重建 | manager contract `:343`、`:479`；`N2-manager:241` | 捕获旧引擎、先取消、版本/保存队列顺序已有 | N4六组删除和恢复smoke已有 |
| C03 后台/暂停/回收 | manager review `:53`、`:104`、`:130`；tool/Skill tests；N2-manager | 核心后台、暂停、独立保存和释放规则已有 | N4六组后台/整页审批及资源probe已有 |
| A01 Signal/computed | `/angular` native connection；angular-bridge contract、N2-message | request/派生 Signal 与 revision 连接有局部证据 | N4当前tgz三版本TestBed已有 |
| A01 OnPush 嵌套工具/消息 | N2-message `:107`、`:179`；N2-manager `:81` | 只在 mount detectChanges，后续 whenStable 自动刷新 | N4当前包三版本Zone/zoneless smoke已有 |
| A01 可变视图/列表更新 | native/Vue adapters；native setMessages、N2-manager `:96`、`:137`、`:160` | 数组隔离/身份、processing/paused 拒绝；native与Vue getState不同 | N4当前包TestBed已有，API明确可变视图边界 |
| A02 自有/共享、DestroyRef | `/angular` create/inject/connect；angular-bridge contract、P7 dispose tests | 自有 abort、共享只解绑、重复 Promise 与 disposed动作规则已有 | N4三版TestBed及两模式卸载/重连接已有 |
| A02 manager 最终释放 | manager contract `:269`、`:302`、`:426`；N2-manager `:195` | 尾保存、活动取消、暂停快照、错误和晚到规则已有 | N4三版当前包重载/Skill DB owner close已有 |
| A02 timer/request/订阅/队列 | P7 `src/lifecycle-probe.ts`；N4三版两模式结构化结果 | 当前hash 30次取消/销毁后计数归零；DB opens/closes 32/32 | N4六组probe已有；wrapper人工计数与timer/DB真实观察分开 |
| P01 无 Vue/源码 alias | package exports、entry-check/声明图；N3 clean tarball；N4 manifests/entry/strict | 同一hash三版本无Vue/源码alias、skipLibCheck:false已验；21/22去掉宿主direct openai以确认kit生产依赖 | 三版本安装/声明与两模式浏览器已有 |
| P01 模块/生产构建 | `/core` ESM/CJS、`/angular` ESM、四入口 DTS；N4 entry/build logs | 当前包三版本 entry和生产构建已通过；不能将隔离Node angular require成功推广为普遍 Angular CJS承诺 | 保留实际 ESM/CJS/框架构建路径与版本记录 |
| V01 refs/插件/旧签名 | root Vue、useMessage/useConversation、Vue adapter tests | N6主线程全量 294 passed/1 skipped 含 Vue 回归 | N3目录 N6-kit-full.log已有；同hash重新pack一致 |
| V01 直接嵌套写与深保存 | Vue shared/lifecycle tests、adapter/facade identity tests | Vue 原地修改、deep watch与尾保存有相应规则证据 | N6最终回归记录已有；native视图不代替Vue代理契约 |
| V01 兼容变化 | API 旧 `/core` createVueMessageAdapter 和 LocalStorage 写入抛错 | npm 0.5.1 已发布路径曾存在，当前移除是明确变化 | 发布版本/迁移方式另行评审，不能删除此项 |
| L01 AIClient/Provider | `/core` AIClient/BaseModelProvider/OpenAIProvider；core.public-utils tests/typecheck；N4 core-helpers | 严格辅助出口、兼容测试及当前包 AIClient/BaseModelProvider 实际消费已有 | OpenAIProvider真实请求不是新增承诺；保留入口检查，不增加 Angular wrapper |
| L01 SSE/格式化 | `/core` handleSSEStream/sseStreamToGenerator/format/extract helpers；N4 core-helpers/smoke | 当前包三版 format/extract消费及真实本地HTTP/SSE已验；旧格式化丢工具/多模态字段已文档化 | 三版当前包已有；传输取消补验另列 |
| L01 Node/其他公开出口 | `/node`、message/Skill publicExports；Node loader/storage tests | exports/类型检查已有；严格 core-public-utils 不等于全部 Node消费 | 当前包 Node FS/受控 GitHub消费，真实网络状态单列 |

## 补验层次与保留边界

- **工具动态/AsyncGenerator/对象结果**：动态 `getTools`/provider、轮次、审批、取消和运行时对象单结果已有核心证据；`N4-tool-stream-core.log` 的 42 项核心定向用例覆盖多块字符串、对象 delta、抛错前后部分结果保留、无结果 fallback 和取消迟到块；`N6-capabilities-ng-test.log` 的 5 项当前包 TestBed 覆盖打包能力消费，N4初次日志保留。最终结果已索引，不再把该能力写成未覆盖。
- **轮次限制**：核心 `maxToolRounds` 与 `onLimitExceeded` 已覆盖，属于核心通用规则；只需一条最终包入口 smoke 确认插件可消费，不应因浏览器没有重复每种上限而判缺。
- **Skill 自动/动态/Node**：N4 的 `--reuse-single` 已用当前候选包重跑 D2 Signal getter manual/none/auto、auto `select_skills`、instructions/资源工具和 phases；`N4-node-consumer.log` 另证 `/node` FS storage、受控成功/404/取消和固定 commit 的真实 GitHub 消费。resolver 失败/缺资源的当前包失败 UI/重载已见三版 smoke；Angular20两模式受控GitHub负例已补，证据与成功路径分别记录。
- **存储旧格式**：核心转换及 Angular20 当前包 `packed-capabilities.spec.ts` 的 LocalStorage/IndexedDB 加载→OnPush显示→修改→flush→await close/重开已有，最终日志为 `N6-capabilities-ng-test.log`（5/5）与 `N6-capabilities-tsc.log`（exit0），N4初次日志保留。fake-indexeddb 证明数据往返，三版浏览器 smoke 证明真实Skill DB生命周期。不要把 Vue deep watch 测试写成 Angular 自动保存证据，不扩写为21/22均独立重复旧格式用例。
- **真实资源与 GitHub**：OPFS directoryHandle、受控 HTTP fixture、真实 GitHub fixed ref 是三种不同证据。Angular 20/21/22 当前包两模式已有 OPFS、受控成功及真实固定 ref。Angular20另补两模式 GitHub404/取消与真实HTTP/SSE取消，日志为 `N4-negative-transports-browser.log`、`N4-negative-transports-{zoneless,zone}.json`、`N4-negative-transports-tsc.log`、`N4-negative-transports-cleanup.log`（同N4 Angular20目录）。GitHub负例用307转到本地真实HTTP，验证浏览器传输，不代表外网GitHub故障；Node默认网络 skipped 保留。
- **异步close复核**：打包能力测试已将cleanup/重开前/最终释放三处改为await close；Angular20同包重新strict exit0、5/5通过，日志为`N6-capabilities-tsc.log`、`N6-capabilities-ng-test.log`及对应退出码文件。
- **资源与性能**：N2/N3 计数与历史测试可证明规则；必须把最终 hash 的 500/2000、P7 lifecycle probe 每次 40 chunks、旧 S4 对照 500 条/80 chunks、30 次销毁计数分开记录。订阅/request/queue 是 wrapper 人工计数，timer 与 DB 为实际观察；短期 heap 样本不能单独证明无泄漏。
- **Angular 业务评审、SSR**：当前没有 Angular 业务评审者；SSR 不在首版承诺，不能因技术测试通过而删除这两个边界。

## N6 最终收口

当前首版基础 Angular 实施与技术验收完成，M01–L01 的证据按上表归并。API、迁移、可重建示例和团队说明分别见 [API](./angular-adaptation-api.md)、[宿主 README](../experiments/angular-p7/README.md)、[团队说明](./angular-adaptation-team-brief.md)。材料的相对链接、锚点、表格结构与当前结论已复核；历史失败和当前结果分别标明。

新增负例前缀后的完整默认浏览器脚本已在 Angular20 同包宿主复跑，Zone.js/zoneless 均 passed，`pageErrors=[]`、browser exit0。证据位于 `D:/Projects/Work/_tmp/kit-angular-n4-20-20261011/`：`N6-full-browser-smoke-with-negatives.log`、`N6-full-browser-{zone,zoneless}.json`、`N6-full-browser-manifest.json`、`N6-full-browser-cleanup.json`。覆盖取消/404负例后继续执行原有会话、审批恢复、真实资源、固定 ref GitHub、500/2000条历史×40chunks及30次销毁；最后 subscriptions/requests/queues/databases/timers 为0，DB opens/closes 32/32。Zone 的 `dbBlocked:1` 是短暂观测，删除最终成功。PID15020已退出，55743/55744无监听，浏览器与本地HTTP均关闭。

这次完整复验首次真实 GitHub 请求返回403，实际响应头显示匿名额度 `remaining=0`；等待限流重置后仅重试一次完整流程，两模式通过。首次日志 `N6-full-browser-smoke-with-negatives-attempt1.log` 与诊断 `N6-full-browser-github-network-diagnostic.log` 保留；真实网络成功不代表外网请求稳定性承诺，也不将默认 opt-in 网络测试的 skipped 改写为通过。

发布准备仍需用户决定版本及兼容迁移策略，尤其是旧 `/core` Vue adapter 路径移除和 LocalStorage 写入抛错；本轮没有提交、推送或发布授权。暂无 Angular 业务评审者，后续使用中迭代；SSR 不承诺。若源码或包 hash 改变，保留本轮结果并按影响重跑。
