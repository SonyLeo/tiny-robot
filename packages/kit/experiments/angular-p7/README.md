# Angular P7 多会话验证宿主

> 2026-10-05检查点：最新kit产物`2E23E364…6905D1E7C`在Angular20严格声明/生产构建/32项TestBed通过；browser-smoke在首个zoneless资源取消探针报`Late resource content leaked after cancellation`，整轮未通过。21重建模板的Vitest3.2.7与Angular build要求`^4.0.8`冲突，须修正后从新目录重建；22未跑。以下为可重建方案，不能作为已完成证据。详见[最新失败及待办](../../docs/angular-adaptation-validation-results.md#最新产物浏览器失败与版本安装失败)。

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
```

20/21 使用 TypeScript 5.9；22 使用 TypeScript 6。Angular 22 CLI 要求足够新的 Node，传入已有系统或 bundled Node 的绝对路径：

```powershell
node packages/kit/experiments/angular-p7/rebuild.mjs D:/Artifacts/kit.tgz D:/Projects/Work/_tmp/p7-angular22-final 22 --node=C:/path/to/node.exe --reuse-single
C:/path/to/node.exe node_modules/@angular/cli/bin/ng.js build
```

在各个隔离目录使用同一 Node 完成 typecheck、entry check、build、test 和 browser smoke，并保留 stdout/stderr。`p7-host-manifest.json` 保存 tarball SHA-256、Node 版本和 Angular major；结果报告另记录实际 Angular/TypeScript 版本。npm CLI 默认定位到启动脚本的 Node 安装，可用 `P7_NPM_CLI` 指定实际 npm-cli.js。浏览器默认使用本地 Chrome；可用 `P7_CHROME` 指定可执行文件。

## 验收范围

`manager.spec.ts` 是新增 TestBed 契约：后台 A→B→A 流式、双视图销毁、嵌套工具状态、dispose 取消 processing 并保存 history/paused、尾保存失败与恢复、迟到加载、删除未加载 paused 会话和缺 snapshot。每个 fixture 只有第一次初始化使用 detectChanges，流式检查依赖 Angular scheduler 与 whenStable，未增加点击或手动渲染伪造刷新。

`browser-smoke.mjs` 在 Zone.js/zoneless 两种模式真正执行 `page.reload()`：工具和 Skill 的批准/拒绝、全新页 resolver 从 IndexedDB 重建资源、缺快照、缺资源、缺 Skill、删除、保存失败与恢复、真实本地 HTTP/SSE、最终 dispose 与历史保留。HTTP 由脚本内真实 server 提供，动态端口；Angular 服务为脚本自己的子进程。finally 关闭浏览器、HTTP 和该子进程树。

`--reuse-single` 把 angular-s3 的 app/d1/d2/s4 测试与必要 fixture 复制到隔离宿主，再从同一个最终 tarball 执行，保留单会话、Skill loader/storage 与此前状态测试。P7 浏览器覆盖补上真正 manager 生命周期与整页 paused 恢复；历史 D2 的同页 recreate 不能作为这一关口的替代。

受控 storage/provider 是宿主测试工具，不代表额外引擎。缺资源与缺 Skill 是故障注入，各自结果如下；scriptedProvider 的普通流式与真实 HTTP 路径分别验证。不会把本地 HTTP 或被控制的数据声明为真实外网 Skill 加载证据。

缺少资源文件和缺少整个 Skill 的结果不同：资源工具执行失败可进入后续回复；整个 Skill 无法通过 resolver 重建时，审批拒绝并保留 paused/快照，界面显示错误。补回 Skill 后可再次批准。浏览器脚本分别断言这些结果，遵循既有核心契约。

宿主源码存在不代表验收通过。只有指定最终 tarball 下实际执行的命令、退出码及日志可作为结果；尚未运行的 Angular major/mode 必须保留为未运行。

## DB 关闭、资源边界与长期运行观测

服务 owns Skill IndexedDB，`dispose()` 返回同一个 Promise，先等待 ready、manager 取消/最终保存队列，再在 finally 关闭自有 Skill DB。共享 conversation storage 的所有权仍由调用者管理。`service.spec.ts` 用阻塞 manager disposal 检查关闭顺序，以及最终保存失败后仍关闭 DB。`core-helpers.spec.ts` 严格消费 tarball `/core` 的 formatMessages、extractTextFromResponse、AIClient 和 BaseModelProvider，不复制工具实现。

浏览器 diagnostics 使用原生 File、OPFS 的真实 FileSystemDirectoryHandle（不弹目录选择器）验证 strict 成功、重复 File 的 warnings/strict 拒绝、binary 字节持久化与 text tool 错误、reader failed 状态、资源执行取消后不接收迟到内容、import cancel。DB close 后直接 deleteDatabase，blocked 会失败。

受控 GitHub 只拦截 acme/p7 fixture URL。真实外网为另一个按钮与结果字段，默认未运行；需要执行时传入固定 repo/ref/path：

```powershell
$env:P7_LIVE_GITHUB_JSON = '{"repo":"openclaw/openclaw","ref":"58672075219d09495de6489ad0821d276ac84f13","path":"skills/weather"}'
node browser-smoke.mjs
```

真实网络 job 有 15 秒取消边界；受控结果不用于宣称真实网络通过。

性能探针在真实 Angular OnPush 双视图渲染 500、2000 条历史后流式写入 40 个 token，记录初次渲染、首 token 和整轮耗时及渲染行数；随后重复 30 次创建双视图、后台流式、销毁视图、dispose manager 与 close DB。每 10 次记录订阅/request/timer/save queue/DB 计数和原始 heap，最后这些可观察资源必须回到 0。smoke 还记录 CDP GC 前后 heap；heap 单次下降不能替代这些确定的生命周期关口，性能数值不预设跨机器阈值。
