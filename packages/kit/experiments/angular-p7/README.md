# Angular P7 多会话验证宿主

> **当前入口（2026-10-11）**：N3同hash的Angular20/21/22独立strict、入口/声明、生产构建、各43项TestBed与Zone.js/zoneless浏览器已通过；Angular20另补5项工具/Skill/旧格式及两模式真实HTTP取消/受控GitHub404和取消。N6最终kit/Vue为294 passed/1 skipped，clean pack同hash一致。结果、宿主实际版本及日志见[完成审核](../../docs/angular-adaptation-completion-audit.md)。暂无Angular业务评审者，后续使用中迭代；尚未发布。

> 历史检查点（2026-10-05）：旧包`2E23E364…6905D1E7C`曾出现迟到资源泄漏与21测试工具peer冲突，当时22未跑；现已修复并在当前同包矩阵复验。原始失败见[历史记录](../../docs/angular-adaptation-validation-results.md#修复前浏览器失败与版本安装失败)，不代表当前结论。

源目录为正式验收的可重建入口。安装与运行必须位于仓库外；仅依赖给定 tarball 的 `/core`、`/angular` 导出，`skipLibCheck:false`，没有 source alias、Vue 或复制的消息引擎。

应用服务拥有 `createConversationManager`，使用 `connectAngularConversation` 操作；每个视图通过 `injectAngularConversation` 连接，销毁视图仅解绑。消息行及其工具状态子组件均为真正的 OnPush，通过逐层传递 revision 刷新原地变化的消息内容和嵌套工具状态。

## 重建

先在仓库完成约定的 clean build/pack，再把最终 tarball 路径传给脚本。脚本不自行构建 kit，避免把变动中的 dist 当作最终证据；不发布、推送或修改全局 Node。目标目录须为新目录，不能是仓库内路径。

```powershell
node packages/kit/experiments/angular-p7/rebuild.mjs D:/Artifacts/kit.tgz D:/Projects/Work/_tmp/p7-angular20-final 20 --reuse-single
Set-Location D:/Projects/Work/_tmp/p7-angular20-final
node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json
node entry-check.mjs
node node_modules/@angular/cli/bin/ng.js build
node node_modules/@angular/cli/bin/ng.js test --watch=false
node browser-smoke.mjs
node browser-smoke.mjs --negative-transports
node node-consumer.mjs
```

20/21 使用 TypeScript 5.9；22 使用 TypeScript 6。Angular 22 CLI 要求足够新的 Node，传入已有系统或 bundled Node 的绝对路径：

```powershell
node packages/kit/experiments/angular-p7/rebuild.mjs D:/Artifacts/kit.tgz D:/Projects/Work/_tmp/p7-angular22-final 22 --node=C:/path/to/node.exe --reuse-single
C:/path/to/node.exe node_modules/@angular/cli/bin/ng.js build
```

在各个隔离目录使用同一 Node 完成 typecheck、entry check、build、test 和 browser smoke，并保留 stdout/stderr。`p7-host-manifest.json` 保存 tarball SHA-256、Node 版本和 Angular major；结果报告另记录实际 Angular/TypeScript 版本。npm CLI 默认定位到启动脚本的 Node 安装，可用 `P7_NPM_CLI` 指定实际 npm-cli.js。浏览器默认使用本地 Chrome；可用 `P7_CHROME` 指定可执行文件。

当前验收tgz为`D:/Projects/Work/_tmp/kit-angular-n3-20261011/opentiny-tiny-robot-kit-0.5.1.tgz`，SHA-256 `9EDCD1EC12EA7F1C76D5A6D3843BE1060153B0ED0B5B6F13BC6D469C1D3D52CE`。它不是npm已发布的旧0.5.1。模板使用major内版本范围，重新安装可能得到不同patch；精确复现本轮需保留隔离宿主lockfile与manifest，实际版本见审核清单。历史npm10.9.2在21宿主曾触发peer解析器崩溃，成功矩阵使用隔离pnpm10.33.2安装，未使用force/legacy-peer-deps；不将旧失败写成修复了全局npm。

N6已复跑新增负例前缀后的完整默认脚本，Angular20两模式通过且资源计数归零。证据位于`D:/Projects/Work/_tmp/kit-angular-n4-20-20261011/`的`N6-full-browser-smoke-with-negatives.log`、`N6-full-browser-{zone,zoneless}.json`、`N6-full-browser-manifest.json`及`N6-full-browser-cleanup.json`。首次真实GitHub遇到403匿名限流，等待重置后一次完整重试成功，失败日志和诊断保留；Zone短暂DB blocked最终成功。测试PID、HTTP/浏览器和端口均已清理，详见[最终收口](../../docs/angular-adaptation-completion-audit.md#n6-最终收口)。

## 验收范围

`manager.spec.ts` 是新增 TestBed 契约：后台 A→B→A 流式、双视图销毁、嵌套工具状态、dispose 取消 processing 并保存 history/paused、尾保存失败与恢复、迟到加载、删除未加载 paused 会话和缺 snapshot。每个 fixture 只有第一次初始化使用 detectChanges，流式检查依赖 Angular scheduler 与 whenStable，未增加点击或手动渲染伪造刷新。

`public-message.spec.ts`覆盖动态Provider、空输入/对象顺序、自定义chunk/runDefault、请求清洗、插件顺序/命令、错误UI与下一回合恢复。`packed-capabilities.spec.ts`新增5项：字符串/对象delta逐块经过三层OnPush显示、Signal逐请求none/manual/auto Skill选择、内置LocalStorage/IndexedDB旧renderContent迁移后显示/修改/flush/await close/重开。IndexedDB数据往返在TestBed使用fake-indexeddb；真实Skill DB生命周期另由浏览器证明。N6修正close等待后的Angular20定向5/5与strict日志见审核清单，不声称21/22独立重复这些补验。

`browser-smoke.mjs` 在 Zone.js/zoneless 两种模式真正执行 `page.reload()`：工具和 Skill 的批准/拒绝、全新页 resolver 从 IndexedDB 重建资源、缺快照、缺资源、缺 Skill、删除、保存失败与恢复、真实本地 HTTP/SSE、最终 dispose 与历史保留。HTTP 由脚本内真实 server 提供，动态端口；Angular 服务为脚本自己的子进程。finally 关闭浏览器、HTTP 和该子进程树。

`--negative-transports`只运行两模式的传输负例，普通完整smoke也包含此探针：HTTP首块后abort并断言signal、服务端提前close、迟到块不入DOM/历史；GitHub404与响应头/首段JSON之后取消。GitHub fixture通过307转到脚本本地真实HTTP服务，不能声明为真实github.com故障；它与下方固定ref外网加载承担不同验收职责。

`node-consumer.mjs`在仓库外消费tarball的`/core`和`/node`，验证FS存储CRUD、mock fetch的受控GitHub成功/404/取消及固定ref真实GitHub。Node mock证据不替代浏览器真实HTTP；此脚本会访问外网，结果必须单独记录。

`--reuse-single` 把 angular-s3 的 app/d1/d2/s4 测试与必要 fixture 复制到隔离宿主，再从同一个最终 tarball 执行，保留单会话、Skill loader/storage 与此前状态测试。P7 浏览器覆盖补上真正 manager 生命周期与整页 paused 恢复；历史 D2 的同页 recreate 不能作为这一关口的替代。

受控 storage/provider 是宿主测试工具，不代表额外引擎。缺资源与缺 Skill 是故障注入，各自结果如下；scriptedProvider 的普通流式与真实 HTTP 路径分别验证。不会把本地 HTTP 或被控制的数据声明为真实外网 Skill 加载证据。

缺少资源文件和缺少整个 Skill 的结果不同：资源工具执行失败可进入后续回复；整个 Skill 无法通过 resolver 重建时，审批拒绝并保留 paused/快照，界面显示错误。补回 Skill 后可再次批准。浏览器脚本分别断言这些结果，遵循既有核心契约。

宿主源码存在不代表验收通过。只有指定最终 tarball 下实际执行的命令、退出码及日志可作为结果；尚未运行的 Angular major/mode 必须保留为未运行。

## DB 关闭、资源边界与长期运行观测

服务 owns Skill IndexedDB，`dispose()` 返回同一个 Promise，先等待 ready、manager 取消/最终保存队列，再在 finally 关闭自有 Skill DB。共享 conversation storage 的所有权仍由调用者管理。`service.spec.ts` 用阻塞 manager disposal 检查关闭顺序，以及最终保存失败后仍关闭 DB。`core-helpers.spec.ts` 严格消费 tarball `/core` 的 formatMessages、extractTextFromResponse、AIClient 和 BaseModelProvider，不复制工具实现。

浏览器 diagnostics 使用原生 File、OPFS 的真实 FileSystemDirectoryHandle（不弹目录选择器）验证 strict 成功、重复 File 的 warnings/strict 拒绝、binary 字节持久化与 text tool 错误、reader failed 状态、资源执行取消后不接收迟到内容、import cancel。DB close 后直接 deleteDatabase，记录短暂 blocked 次数并等待最终 success；超过探针超时仍未删除则失败。

受控 GitHub 只拦截 acme/p7 fixture URL。真实外网为另一个按钮与结果字段，默认未运行；需要执行时传入固定 repo/ref/path：

```powershell
$env:P7_LIVE_GITHUB_JSON = '{"repo":"openclaw/openclaw","ref":"58672075219d09495de6489ad0821d276ac84f13","path":"skills/weather"}'
node browser-smoke.mjs
```

真实网络 job 有 15 秒取消边界；受控结果不用于宣称真实网络通过。

性能探针在真实 Angular OnPush 双视图渲染 500、2000 条历史后流式写入 40 个 token，记录初次渲染、首 token 和整轮耗时及渲染行数；随后重复 30 次创建双视图、后台流式、销毁视图、dispose manager 与 close DB。每 10 次记录订阅/request/timer/save queue/DB 计数和原始 heap，最后这些可观察资源必须回到 0。smoke 还记录 CDP GC 前后 heap；heap 单次下降不能替代这些确定的生命周期关口，性能数值不预设跨机器阈值。
