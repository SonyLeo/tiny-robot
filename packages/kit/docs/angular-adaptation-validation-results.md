# Angular 适配验收结果索引

> 2026-10-05。结果按实际运行范围记录。修复前、修复中和最终产物分开，不把某个局部通过升级为完整能力通过。当前 P7 仍在进行，见 [当前审查清单](./angular-adaptation-p7-readiness.md)。

## 1. 结果来源

| 标识 | 源码/产物 | 用途 |
| --- | --- | --- |
| H-D42 | `b53927601`；tarball SHA-256 `41613AEDF8A867B7A64FE4EDBE69664F2F5027CB012AC2E384EFEAAEDCFA6FB5` | 历史三版本单会话矩阵；原始日志于 `D:/Projects/Work/_tmp/tiny-robot-kit-d42` |
| P7-B | `f63c8310d` 修复前 clean build；tarball SHA-256 `4E3881929E1D7C74792D01179FE347EE74FDA60C5E776785CEC6C76D7D124C85` | 当前反证与 Skill 读取基线；不是最终交付产物 |
| P7-W | 工作树 manager 修复中 | 针对性契约与主线程复核测试；2026-10-05 主线程重跑 4 文件 34/34 通过。Vue 共享接入和独立产物验收仍未放行 |
| P7-D3 | `f63c8310d` 加本轮未提交 manager/Vue 修复；SHA-256 `1AEDBE014A7592FA860FAE89BE978210F4FB965B10FCCF37216101FACDBE33B6` | clean build 后 npm pack 的 D3 复验检查点；不是最终全能力放行产物 |
| P7-SL | 本次本地提交的源码检查点，父提交`f63c8310d`；SHA-256 `2E23E364ABB1A0B152FFAC53121EA94A1BD8C3E24E7BA585647B5FD6905D1E7C` | 含manager/Vue、存储close与中立序列化、core公开工具；Angular20类型/构建/TestBed通过，新增浏览器资源取消失败；非最终产物 |

## 2. 通过与失败的具体范围

| 能力/检查 | 版本/环境 | 结果 | 范围与限制 |
| --- | --- | --- | --- |
| H-D42 严格声明 | Angular 20.3.33/TS 5.9.3；21.2.24/TS 5.9.3；22.2.1/TS 6.0.3 | 通过 | 三版 `skipLibCheck:false`；历史产物，未含本轮 manager 修复 |
| H-D42 生产构建 | 上述三版；22 使用隔离 Node 24.19.0 | 通过 | 默认 Node 22.15.1 的 Angular 22 构建失败另记，不声明为通过 |
| H-D42 TestBed | 三版各 4 文件/20 项 | 通过 | `app/d1/d2/s4`，不含完整 manager 会话测试 |
| H-D42 浏览器 | 三版，各 Zone.js/zoneless | 通过 | 单会话流式、取消、错误、工具批准/拒绝、本地 HTTP/SSE；不证明共享 manager 审批整页恢复 |
| P7-B kit 全量 | Node，25 文件/214 项 | 通过 | 213 passed、1 skipped；已审查发现未覆盖的共享会话缺口 |
| P7-B clean build | ESM/CJS/DTS | 通过 | 清除旧 dist 再构建打包；不包含修复中源码 |
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

### 最新产物浏览器失败与版本安装失败

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

## 4. 最终结果待补

- 优先复现和修复取消后的迟到资源内容；修正21/22宿主依赖模板。
- 列表调整API等待用户评审，不能认定单条updateMessage已覆盖列表删除/清空。
- 源码冻结后重新执行kit/Vue/lint/clean build/严格声明，并制作最终hash；275/1跳过与当前hash是检查点证据。
- 最终产物完整20/21/22独立安装及两模式验收，包括原生会话、后台/多视图、真正重载工具/Skill审批和本地HTTP/SSE。
- 原生File/目录句柄/IDB资源整套、受控与真实GitHub分开，以及500/2000长历史和重复销毁资源基线。
- 最终M01-L01逐子项归并、迁移/示例/团队材料；发布评审另行进行。具体顺序见[P7待办](./angular-adaptation-p7-readiness.md#8-下一次继续的待办)。
