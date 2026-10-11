# Angular 适配验收结果索引

> 2026-10-11。结果按实际运行范围记录。当前首版基础 Angular 技术关口通过，最新结果见本节与第4节；修复前/修复中的记录保留历史。逐子项见[完成审核](./angular-adaptation-completion-audit.md)，交付与发布状态见[P7清单](./angular-adaptation-p7-readiness.md)。

## 1. 结果来源

### 2026-10-11 最新核对

本次 N4 补证使用同一候选包 `9EDCD1EC12EA7F1C76D5A6D3843BE1060153B0ED0B5B6F13BC6D469C1D3D52CE`，未改变运行时源码或包元数据：

- `D:/Projects/Work/_tmp/kit-angular-n4-20-20261011/N4-tool-stream-core.log`：核心工具流式 42/42，通过多块字符串、对象 delta、部分结果失败、无结果 fallback、取消后迟到块。
- `D:/Projects/Work/_tmp/kit-angular-n4-20-20261011/N4-capabilities-ng-test.log`：打包能力 TestBed 5/5；`N4-capabilities-tsc.log` 严格类型检查 exit 0。
- `D:/Projects/Work/_tmp/kit-angular-n4-20-20261011/N4-node-consumer.log`：Node v22.22.3 独立消费 `/core`、`/node`、真实 FS storage、受控成功/404/取消和固定 commit 的真实 GitHub。
- Angular 21 修正版浏览器结果：`D:/Projects/Work/_tmp/kit-angular-n4-21-20261011/N4-browser-smoke-fixed.log` 与 `N4-browser-smoke-result.json`；Angular 22 修正版结果：`D:/Projects/Work/_tmp/p7-angular22-n4-evidence-20261011/browser-smoke.stdout.log`、`browser-smoke.result.json`。两版 Zone.js/zoneless 均包含 500/2000 历史、40 chunks、30 次销毁和最终订阅/请求/队列/数据库/timer 计数归零。
- Angular20 两模式受控GitHub404/响应开始后取消与真实HTTP首块后取消已通过：`N4-negative-transports-browser.log`、`N4-negative-transports-{zoneless,zone}.json`、`N4-negative-transports-tsc.log`、`N4-negative-transports-cleanup.log`。GitHub使用307连接本地真实HTTP，证明浏览器传输负例，不能声明为github.com外网故障实验。Signal、服务端提前close、迟到块不入DOM/历史均有断言；自有PID/端口已清理。
- N6修正打包能力测试的异步close等待，重新strict exit0、5/5 TestBed通过：Angular20目录`N6-capabilities-tsc.log`、`N6-capabilities-ng-test.log`及退出码文件；未改产品运行时或hash。
- N6主线程最终源码回归：32文件294 passed、1 skipped；lint、正常clean build和严格生成声明检查均exit0，重新pack与N3 hash一致。日志位于`D:/Projects/Work/_tmp/kit-angular-n3-20261011/`的`N6-kit-full.log`、`N6-kit-lint.log`、`N6-kit-clean-build.log`、`N6-core-public-types.log`；重复包清单为`D:/Projects/Work/_tmp/kit-angular-n6-consistency-20261011/pack.json`。
- N6新增负例前缀后的完整默认smoke已在Angular20同包复验，两模式passed、pageErrors为空、exit0。Angular20目录证据：`N6-full-browser-smoke-with-negatives.log`、`N6-full-browser-{zone,zoneless}.json`、`N6-full-browser-manifest.json`、`N6-full-browser-cleanup.json`。30次销毁资源计数归零、DB opens/closes 32/32；Zone短暂dbBlocked:1最终删除成功。PID15020退出，55743/55744无监听。首次真实GitHub403且remaining=0，等待额度重置后仅重试一次完整流程通过；保留`N6-full-browser-smoke-with-negatives-attempt1.log`和`N6-full-browser-github-network-diagnostic.log`，不承诺外网稳定性。
- 默认Node opt-in网络测试仍skipped，不由显式fixed-ref成功改写。暂无Angular业务评审者，用户接受后续使用中迭代；SSR不承诺。

### N1开始前的检查点历史

- 上一轮实际命令记录：kit 32 files，287 passed、1 skipped（总计288）；lint、普通ESM/CJS/DTS build、diff检查通过。该build没有清理旧dist，不能记为clean build。
- 普通build后的检查点包 SHA-256 `1A6248AAF89DB4BCCCFB0615FF2CB9B404D4CC2B8C6EA23A6B55E6CE7468AA63` 含旧输出残留，不作为最终候选产物。
- 此包的 Angular20 外部宿主 `D:/Projects/Work/_tmp/tiny-robot-kit-angular-final-20b`：strict/entry-check已通过；TestBed 32 passed/1 failed。唯一失败为新增setMessages测试在双视图fixture中期望总行数1，实际2。静态检查确认Host包含Primary/Secondary两个视图；应逐视图断言，不能据此认定引擎更新缺陷。修正及重跑待N1执行，生产build最终退出码本轮未复核。
- 历史复核：Angular22 旧 P7-T01 包 `C7C01DB6…E515A` 的 Node22.22.3、Angular/CLI/build22.2.2、TS6.0.3、zone0.16.3 结果均 exit 0；真实GitHub未运行，当前 setMessages 未覆盖。该条只保留为历史，不能覆盖当前 N3 候选包结果。
- Angular22报告与日志：`D:/Projects/Work/_tmp/p7-angular22-t02-20261011-r1/T02-angular22-results.md`、`t02-results-actual.log`、`t02-smoke.log`。失败包装脚本的`t02-results.log`无有效命令，不计入证据。

以下表格中的旧结果按各自源码/产物保留；当前N1–N6同包结论见第4节，不用旧包顶替。

| 标识 | 源码/产物 | 用途 |
| --- | --- | --- |
| H-D42 | `b53927601`；tarball SHA-256 `41613AEDF8A867B7A64FE4EDBE69664F2F5027CB012AC2E384EFEAAEDCFA6FB5` | 历史三版本单会话矩阵；原始日志于 `D:/Projects/Work/_tmp/tiny-robot-kit-d42` |
| P7-B | `f63c8310d` 修复前 clean build；tarball SHA-256 `4E3881929E1D7C74792D01179FE347EE74FDA60C5E776785CEC6C76D7D124C85` | 当前反证与 Skill 读取基线；不是最终交付产物 |
| P7-W | 工作树 manager 修复中 | 针对性契约与主线程复核测试；2026-10-05 主线程重跑 4 文件 34/34 通过。Vue 共享接入和独立产物验收仍未放行 |
| P7-D3 | `f63c8310d` 加本轮未提交 manager/Vue 修复；SHA-256 `1AEDBE014A7592FA860FAE89BE978210F4FB965B10FCCF37216101FACDBE33B6` | clean build 后 npm pack 的 D3 复验检查点；不是最终全能力放行产物 |
| P7-SL | 本次本地提交的源码检查点，父提交`f63c8310d`；SHA-256 `2E23E364ABB1A0B152FFAC53121EA94A1BD8C3E24E7BA585647B5FD6905D1E7C` | 含manager/Vue、存储close与中立序列化、core公开工具；Angular20类型/构建/TestBed通过，资源取消探针曾失败；非最终产物 |
| P7-T01 | 当前工作树 clean build/pack；SHA-256 `C7C01DB61D907849478B34CCAE2F3246292A282B7225B29B74C50F0C5E7E515A` | 核心丢弃取消后迟到资源结果；Angular20仓库外宿主 strict check、生产构建、TestBed 32/32及 Zone.js/zoneless browser smoke通过；资源取消为`aborted`，500/2000历史和30次销毁完成；尚非最终版本矩阵产物 |
| P7-T02 | 同一 P7-T01 tarball；仓库外 Angular21.2.25/CLI 21.2.26、TS5.9.3、Zone.js0.16.3；pnpm10.33.2 | strict check、生产构建、7文件32/32 TestBed、Zone.js/zoneless browser smoke、本地HTTP/SSE、Skill资源取消、OPFS、受控GitHub、500/2000历史、30次销毁均通过；非最终产物，真实GitHub未运行 |
| P7-T03 | 当前工作树 `setMessages` 实现；未重新打包 | 核心、Angular bridge、Vue message/conversation、manager 相关 6 文件共 87 项定向测试通过；尚未在最终 tarball 和 Angular22 独立宿主运行 |

## 2. 通过与失败的具体范围

| 能力/检查 | 版本/环境 | 结果 | 范围与限制 |
| --- | --- | --- | --- |
| H-D42 严格声明 | Angular 20.3.33/TS 5.9.3；21.2.24/TS 5.9.3；22.2.1/TS 6.0.3 | 通过 | 三版 `skipLibCheck:false`；历史产物，未含本轮 manager 修复 |
| H-D42 生产构建 | 上述三版；22 使用隔离 Node 24.19.0 | 通过 | 默认 Node 22.15.1 的 Angular 22 构建失败另记，不声明为通过 |
| H-D42 TestBed | 三版各 4 文件/20 项 | 通过 | `app/d1/d2/s4`，不含完整 manager 会话测试 |
| H-D42 浏览器 | 三版，各 Zone.js/zoneless | 通过 | 单会话流式、取消、错误、工具批准/拒绝、本地 HTTP/SSE；不证明共享 manager 审批整页恢复 |
| P7-B kit 全量 | Node，25 文件/214 项 | 通过 | 213 passed、1 skipped；已审查发现未覆盖的共享会话缺口 |
| P7-B clean build | ESM/CJS/DTS | 通过 | 清除旧 dist 再构建打包；不包含修复中源码 |
| P7-T03 `setMessages` 局部回归 | Node/Vitest；6 个文件 | 通过 | 87 项通过；覆盖状态拒绝、数组容器隔离、已有消息身份、新消息 adapter、单次通知、Vue 自动保存和 manager 保存；不替代独立 Angular 宿主 |
| P7-W 首轮 manager 契约 | 3 文件/24 项 | 通过 | 只证明这些测试；主线程独立复核仍失败，不放行 |
| P7-W 关闭自动保存时回收 idle | manager.review.test.ts | 通过 | 首轮失败后已调整 dirty 调度；仍须 Vue 接入回归 |
| P7-W 阻塞保存期间删除取消请求 | manager.review.test.ts | 通过 | 首轮 abort 次数 0；修复后立即启动捕获的旧引擎 abort，删除仍排在旧保存与取消之后 |
| P7-W 入队前快照异常报告 | manager.review.test.ts | 通过 | 首轮拒绝但未报告；修复后 flush 拒绝且 onPersistenceError 收到异常 |
| P7-W manager 与 Angular connection 局部复验 | 4 文件/34 项 | 通过 | manager.review/contract/test 与 angular-connection；不证明 Vue 已接入或最终 Angular 多会话宿主通过 |
| P7-D3 Vue 共享接入 | 5 文件/50 项 | 通过 | 根签名、同步 title/clear、deep watch、插件/消费者嵌套修改、默认 throttle、快速切换、加载去重、provider watcher 回收 |
| P7-D3 kit 全量 | 28 文件/255 项 | 通过 | 254 passed、1 skipped；跳过项保持记录，不记为通过 |
| P7-D3 clean build/pack | ESM/CJS/DTS，30 个包文件 | 通过 | npm pack --ignore-scripts，版本 0.5.1 仅本地开发检查点；未发布 |
| P7-D3 独立 Angular 20 类型/入口 | Node 22.15.1，仓库外 `p7-angular20-d3-recheck` | 通过 | skipLibCheck:false，core/angular JS 与声明依赖图无 Vue；node_modules 没有 Vue。入口检查脚本先修正 DTS .js→.d.ts 解析，再通过 |
| P7-D3 独立 Angular 20 生产构建 | 同一 tarball 和宿主 | 通过 | 真正 Angular 模板构建；尚不能代表 21/22 与浏览器全部通过 |
| P7-D3 独立 Angular 20 TestBed | Angular20.3.33/TS5.9.3；5文件29项 | 通过 | app/d1/d2/s4 与新增 manager 9项；只有初始 detectChanges，后续流式/工具变化依赖 Angular scheduler |
| P7-D3 独立 Angular 20 浏览器 | Chrome，Zone.js/zoneless | 通过 | 真正 page.reload 的工具/Skill批准拒绝、缺快照/资源/Skill、删除、保存失败恢复、后台/双视图、dispose保留历史、真实本地HTTP/SSE；pageErrors均为空 |
| M06 真实 GitHub loader | P7-B `/core`，Node 原生 fetch；固定 commit | 通过 | 未拦截 HTTP，加载 weather name 正确、instructions 1856 字符、无资源；不是浏览器目录选择或全 Angular 版本证明 |
| P7-T01 取消后迟到资源 | Angular20，最新 tarball `C7C01DB6…E515A`；核心可控 reader、浏览器 Zone.js/zoneless | 通过 | `toolPlugin` 在每个结果写入前及循环结束后检查 `AbortSignal`；迟到内容未进入历史，工具状态为`cancelled`；浏览器资源探针记录一次短暂 IndexedDB `blocked` 后删除成功，不能将 `blocked` 单独解释为泄漏 |
| P7-T02 Angular21 独立消费 | Angular21.2.25/CLI21.2.26、TS5.9.3、Zone.js0.16.3；同一 P7-T01 tarball，仓库外全新宿主 | 通过 | `skipLibCheck:false` 类型检查、生产构建、7文件32/32 TestBed通过；Zone.js和zoneless smoke均`status: passed`且`pageErrors: []`；本地HTTP/SSE、Skill取消、OPFS目录、二进制/重复路径、受控GitHub、500/2000历史和30次销毁通过，最终 subscriptions/requests/queues/databases/timers 均为0，数据库 open/close 均32。真实GitHub未提供配置，不计通过 |
| P7-T02 npm 安装诊断 | Node22.15.1/npm10.9.2；两个全新Angular21宿主目录 | 环境工具失败 | npm在 peer set 解析时重复抛 `Cannot read properties of null (reading 'edgesOut')`，栈位于 npm Arborist `#loadPeerSet`；未使用`--force`或`--legacy-peer-deps`。改由pnpm10.33.2干净安装成功，Angular消费验证通过 |

以上 P7-W 状态将按修复后实际复验追加，保留失败发生时的证据。

主线程复验命令（2026-10-05，工作树源码）：

```powershell
pnpm --filter @opentiny/tiny-robot-kit exec vitest run src/conversation/manager.review.test.ts src/conversation/manager.contract.test.ts src/conversation/manager.test.ts src/conversation/angular-connection.test.ts
```

四文件 34/34 通过。manager 实现者另报告九文件 95/95、ESM/CJS/DTS 构建通过；全包 `tsc --noEmit` 仍有既存错误，不能记为通过。Vue 接入后将重新执行完整回归与构建，以最终 tarball 为独立消费证据。

### P7-D3 复验命令与宿主修正

```powershell
pnpm --filter @opentiny/tiny-robot-kit exec vitest run
pnpm --filter @opentiny/tiny-robot-kit build --clean
npm pack ./packages/kit --ignore-scripts --pack-destination D:/Projects/Work/_tmp/tiny-robot-kit-p7/d3-fixed --json
node packages/kit/experiments/angular-p7/rebuild.mjs D:/Projects/Work/_tmp/tiny-robot-kit-p7/d3-fixed/opentiny-tiny-robot-kit-0.5.1.tgz D:/Projects/Work/_tmp/p7-angular20-d3-recheck 20 --reuse-single
# 以下在隔离宿主中运行
node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json
node entry-check.mjs
node node_modules/@angular/cli/bin/ng.js build
node node_modules/@angular/cli/bin/ng.js test --watch=false
node browser-smoke.mjs
```

初次宿主严格类型检查发现 `ReturnType<typeof deferred>` 未固定 void 导致 resolve 缺参数，改为 `deferred<void>` 后通过。入口图脚本把 DTS 的 `.js` specifier 当运行时文件，改为声明文件解析后通过。这两项为宿主问题，没有修改 kit 产物以绕过声明检查。

浏览器第一轮因删除 Skill 的宿主操作返回 void/`Done`，脚本错等 `true` 而失败；第二轮错误期望“缺少 Skill 仍完成”，实际保留 paused。源码 `skillPlugin.resolveRestoredSkills` 及既有 resolver-failure 用例明确规定拒绝恢复、保留 paused/快照，不调用 Provider。脚本修正为检查错误 `Unable to restore selected skills: docs`、paused、快照存在、awaiting-approval，再恢复 Skill 后检查批准成功。第三轮两模式通过；不是删除失败断言或改引擎为宽松执行。

P7-D3 kit 全量中的一项跳过是 `loaderNode.test.ts` 的 opt-in 网络测试，默认未设置 `RUN_NETWORK_TESTS=1`。之前单独的原生 fetch GitHub 读取有成功记录，但不据此将该跳过测试记为通过。

S4 在同一 Angular20 宿主测得 500条/80chunks：full-copy 215.60ms、revision 7.01ms、adapter 3.03ms；仅为一次 Node/TestBed 样本，不能当成更长历史、浏览器资源曲线或存储开启时的性能证明。

### 存储独立反证与修复检查点

主线程新增 `src/storage/storage.review.test.ts`，修复前的三个反例全部失败：LocalStorage quota 错误被吞，使 manager.flush 正常完成；实际 IndexedDB 往返将 Uint8Array 扁平化且丢失 Map/Set；两个并发首次写入打开两条数据库连接。保留这些失败事实，不能以 manager 向自定义 storage 提供的快照测试代替内置策略往返。

随后最小修复：LocalStorage 写入保留日志并抛错；中立 unwrapProxy 保留 ArrayBuffer view/Map/Set，manager 复用同一规则；Conversation/Skill IndexedDB 共用各实例的首次打开任务，并提供拥有者调用的 close。manager 不自动关闭外部共享 storage。

```powershell
pnpm --filter @opentiny/tiny-robot-kit exec vitest run src/storage/storage.review.test.ts src/storage/storageStrategies.test.ts src/skills/test/indexedDBStorage.test.ts src/conversation/manager.contract.test.ts
```

本次实际 **4 文件 38/38 通过**。此结果只放行已覆盖的写入错误传播、类型往返和并发连接反例；close 的 pending-open、幂等、失败重试、共享所有权及懒资源读取仍需专门验收。该源码尚未进入 P7-D3 tarball；最终完整关口仍未放行。

LocalStorage 的兼容变化明确为：原先写入失败仅记录日志并返回，现在直接调用者收到异常，manager 的 flush/dispose 可拒绝并报告错误；加载的旧空值 fallback 保持。不得写成所有错误行为均不变。

随后子代理补 10 项 close 契约，运行 `src/storage` 与 `src/skills/test/indexedDBStorage.test.ts`：**5 文件 28/28 通过**，定向 lint/diff 通过；使用 fake-indexeddb 的实际请求，并非浏览器资源证明。

L01 子代理 runtime 用例 **8/8 通过**，根/core 类与函数身份一致，无 Vue 导入，文本格式化的工具字段丢失及 nullable 响应契约明确。主线程 `pnpm --filter @opentiny/tiny-robot-kit build --clean` 和 `exec tsc -p test/tsconfig.core-public-utils.json` 通过，后者真实消费新生成入口且 `skipLibCheck:false`。

全量回归此时为 **32 文件，273 passed、2 failed、1 skipped**。失败均在 `useConversation.test.ts` 引擎回收用例，未配置 Node 中不存在的 LocalStorage，原实现吞错掩盖了该测试环境问题；将在这两个用例提供显式存储后复验。全量 lint 此时也失败（两个旧未使用 import、本轮 computed 依赖读取表达式）；不记为通过。尚未制作此次修复 tarball。

随后两用例配置真实读写的内存策略，原身份/回收断言保留；computed 读取改为 void 表达式，移除入口测试未使用 import。主线程全量复跑 **32 文件 275 passed、1 skipped**、lint、clean build 均通过。此次检查点 tarball SHA-256：`2E23E364ABB1A0B152FFAC53121EA94A1BD8C3E24E7BA585647B5FD6905D1E7C`，路径 `D:/Projects/Work/_tmp/tiny-robot-kit-p7/storage-l01/opentiny-tiny-robot-kit-0.5.1.tgz`。仍是本地检查点，未发布；列表调整能力待评审，独立矩阵尚未完成。

该产物于仓库外 `p7-angular20-storage-l01` 通过严格声明、无Vue入口图、生产构建和 **7 文件 32/32 TestBed**（新增 service关闭顺序2项、core辅助工具1项，加旧20项与manager9项）。此时浏览器正在执行。Angular21首次重建安装失败：`@angular/build@21.2.24` 要求 Vitest `^4.0.8`，模板仍为3.2.7；会按实际peer修正重建模板，不能用 force/legacy-peer-deps 绕过或记为版本通过。

### 修复前浏览器失败与版本安装失败

2026-10-05交接时，P7-SL浏览器命令已结束，退出码1。脚本按zoneless→zone顺序运行；首个模式通过前面的会话操作后，在`Validate native resources`诊断步骤失败：

```text
Error: Validate native resources: Error: Late resource content leaked after cancellation
    at diagnostic (.../browser-smoke.mjs:107:77)
    at async .../browser-smoke.mjs:113:29
```

失败断言位于`experiments/angular-p7/src/browser-resources.ts`：readText挂起→调用engine.abort→释放为`late forbidden content`→等待sending/aborting→检查历史没有该文本。实际出现该文本。**根因尚未核实、没有修复**，不能直接断言责任一定属于核心或削弱断言。下一步在核心复现相同时序，再审查toolPlugin/资源handler与取消后的写入。

```powershell
# 在仓库外 p7-angular20-storage-l01 中运行；真实网络配置不等于已执行到网络步骤
$env:P7_LIVE_GITHUB_JSON = '{"repo":"openclaw/openclaw","ref":"58672075219d09495de6489ad0821d276ac84f13","path":"skills/weather"}'
node browser-smoke.mjs
```

本轮整套两模式浏览器结果为失败；未完成原生资源整套验证，后续OPFS目录、受控/真实GitHub、500/2000长历史、30次销毁及GC结果均未运行，zone模式也未运行。此前P7-D3两模式通过保留为不同hash的历史证据。smoke退出时执行finally清理其浏览器、HTTP与Angular进程；随后检查4317/4318/4320无监听，不将其视为长期资源验收。

修复后以 P7-T01 最新 tarball 从全新仓库外 Angular20 宿主重跑同一 smoke：zoneless 与 zone 均通过，资源取消结果为 `aborted`，迟到内容未泄漏；OPFS 目录、二进制资源、严格重复路径、受控 GitHub、500/2000 历史、30 次销毁和本地 HTTP/SSE 均完成。删除探针允许规范中的短暂 `blocked`，等待最终 `success` 并以 2 秒超时判定；zoneless 为0次、zone为1次短暂 blocked，最终均成功且数据库 open/close 计数平衡。

Angular21重建命令也退出1：

```powershell
node packages/kit/experiments/angular-p7/rebuild.mjs D:/Projects/Work/_tmp/tiny-robot-kit-p7/storage-l01/opentiny-tiny-robot-kit-0.5.1.tgz D:/Projects/Work/_tmp/p7-angular21-storage-l01 21 --reuse-single
```

```text
npm error ERESOLVE could not resolve
peerOptional vitest@"^4.0.8" from @angular/build@21.2.24
Found: vitest@3.2.7
```

这是宿主模板依赖冲突，尚未修正；21类型/构建/TestBed/浏览器和22完整矩阵均未完成。该失败目录已包含宿主package.json，rebuild拒绝重复使用；修正模板后选择新目录，保留失败日志，不通过强制安装掩盖peer冲突。

P7-SL同一次TestBed的500条/80chunks样本：full-copy235.40ms、revision4.36ms、adapter3.42ms。它只证明该次Node/TestBed对照，不能替代尚未运行的真实浏览器长历史与资源基线。唯一跳过仍为opt-in网络测试；全包源码tsc既存错误未转为通过，公开生成声明与独立Angular20严格检查则确实通过。

## 3. 真实 GitHub 最小复现

在 kit clean build 后，从工作树根目录运行；只输出标识、长度和资源信息，不把远程 Skill instructions 当成代理指令。

```powershell
node --input-type=module -e 'import { loadSkill } from "./packages/kit/dist/core.mjs"; const job=loadSkill({ source: "github", repo: "openclaw/openclaw", ref: "58672075219d09495de6489ad0821d276ac84f13", path: "skills/weather" }); const timer=setTimeout(()=>job.cancel(),15000); try { const skill=await job; console.log(JSON.stringify({ source:"live GitHub, no mock", repo:"openclaw/openclaw", ref:"58672075219d09495de6489ad0821d276ac84f13", name:skill.name, instructionsLength:skill.instructions.length, resources:skill.resources?.map(r=>({path:r.path,kind:r.kind}))??[] })); if(skill.name!=="weather") throw new Error("Unexpected Skill identity"); } finally { clearTimeout(timer); }'
```

实际输出：

```json
{"source":"live GitHub, no mock","repo":"openclaw/openclaw","ref":"58672075219d09495de6489ad0821d276ac84f13","name":"weather","instructionsLength":1856,"resources":[]}
```

这是一次固定路径真实服务可用性检查，不保证未来 GitHub 网络、限流或所有 Skill 目录均可用。最终 Angular 宿主继续验证真实 GitHub 和受控 HTTP 的不同职责，以及资源、取消和错误结果。

## 4. 当前收口状态（2026-10-11）

当前候选包 SHA-256 为 `9EDCD1EC12EA7F1C76D5A6D3843BE1060153B0ED0B5B6F13BC6D469C1D3D52CE`。Angular 20/21/22 已完成同包独立安装、无 Vue/源码 alias、`skipLibCheck:false`、生产构建、8 文件 43 项 TestBed 和 Zone.js/zoneless 浏览器验证。`setMessages` 的双视图、清空、身份及保存规则已包含在当前 TestBed 中。历史失败及旧包数据保留在上文，不作为当前未完成项。

三版两模式均有后台/多视图、工具/Skill 整页审批恢复、本地 HTTP/SSE、File/OPFS/IndexedDB、固定 ref GitHub、500/2000 历史及 30 次销毁证据。Angular22 Zone 的一次短暂 `dbBlocked:1` 保留为环境观测，最终数据库连接平衡。

旧 `renderContent` 独立消费已在 Angular20 当前包补验：`experiments/angular-p7/src/packed-capabilities.spec.ts` 分别通过内置 LocalStorage/IndexedDB 加载、OnPush 显示、修改、flush、await close/重开后再加载；metadata 保留，legacy 字段移除。最终证据为 `D:/Projects/Work/_tmp/kit-angular-n4-20-20261011/N6-capabilities-ng-test.log`（5/5）及 `N6-capabilities-tsc.log`（严格类型 exit 0）；同目录N4初次日志保留。IndexedDB 使用 fake-indexeddb 验证数据往返，真实Skill DB连接生命周期由三版 smoke 承担；不声称21/22各自重复了这两项旧格式用例。

浏览器传输负例与N6最终回归已补齐，详见本页最新核对；M01–L01证据已归并至完成审核清单。API/迁移、可重建示例和团队材料已更新，实验脚本顺序及材料最后复核已完成，首版基础Angular实施与技术验收收口。暂无Angular业务评审者，后续使用中迭代；SSR不承诺。发布版本、兼容迁移、提交、推送及发布另行授权。见[P7待办](./angular-adaptation-p7-readiness.md#8-下一次继续的待办)。
