# Kit Angular 适配能力与证据映射

> 基线：`90e92e19b710c101c2cd30e78d6453d129be1cdf`（`feat/kit-angular`）。本表是 B0.1 的静态读码结果；本轮没有安装、测试或构建。文中的“历史通过”只引用 2026-09-27 产物，不能当作合并后新基线通过。

## 读表规则

- “消费操作”按 `docs/src/tools/message.md`、`conversation.md`、`skill.md` 的业务操作描述；Angular 只需要业务结果等价，不复制 Vue `ref/watch` 语法。
- “入口”区分根 `@opentiny/tiny-robot-kit`（Vue 绑定）、`/core`（框架无关消息/插件/Skill/会话/存储/SSE/Provider）、`/angular`（Signals/DestroyRef 连接）和 `/node`（Node Skill）。D4.1 已补齐 `/core` 的框架无关辅助出口；根入口仍保留原 Vue 绑定。
- 证据标签：**源码存在**表示读码事实；**历史通过**表示既有日志/产物；**本轮未复验**表示合并后没有动态证据；**缺口**表示必须在 B0-D3 或 D4/A1 补齐。

## M01-M06：消息、请求、插件、工具、Skill

| 子项 | Vue 文档化消费操作与契约 | 无 Vue/Angular 实际入口与源码 | 已有测试/证明范围 | 当前缺口与负责阶段 |
| --- | --- | --- | --- | --- |
| M01 初始消息、发送、请求状态 | `useMessage({ initialMessages, responseProvider })`；读取 `messages/requestState/processingState/isProcessing/isPaused/canStartTurn`；`sendMessage` trim 空输入并短路，`send(...messages)` 原样追加；同回合不可重入。 | `/core` `createMessageEngine`、native adapter；`/angular` `createAngularMessage/injectAngularMessage` 暴露 Signals 和同名动作。实现：`src/message/core/engine.ts:167-179,684-721`、`src/angular.ts:43-79`。 | `src/message/test/native.test.ts:82-117,119-189` 断言初始状态、单/流式追加和通知序列；`src/vue/message/useMessage.test.ts:13-32` 断言 Vue 返回形状；D1 历史 Angular 20 TestBed 9/9 与浏览器单会话通过。 | 根入口 Vue 直接可用，但 B0 必须在新基线复验；D3 需要多会话实例隔离。Angular 21/22、会话宿主缺证据（B0、D3c、D4/A1）。 |
| M01 动态 Provider | Vue 消费者修改返回对象 `responseProvider.value`，后续回合用新 Provider，当前回合固定旧 Provider。 | `/core` `MessageEngine.setResponseProvider`；`/angular` `setResponseProvider`；Vue 转换在 `src/vue/message/useMessage.ts:213-249`。 | `src/vue/message/useMessage.test.ts:34-43` 断言两次请求使用新 Provider；核心测试覆盖请求执行。 | Angular 动态替换的独立声明/真实宿主证据未集中记录；B0/D1c 复验。 |
| M02 Promise/AsyncGenerator/合并 | Provider 接收清洗后的 body 和 `AbortSignal`，可返回 Promise 或 AsyncGenerator；默认逐块合并；顶层 `onCompletionChunk` 必须显式调用 `runDefault` 才保留默认合并。 | `/core` `executeRequest`：`src/message/core/engine.ts:512-635`；`/angular` 转发核心，无 Vue wrapper；根 Vue 还做 `createVueBaseContext` 转换。 | `src/message/test/native.test.ts:96-189,420-489`、`src/vue/message/useMessage.lifecycle.test.ts:132-196` 覆盖流式块、钩子顺序、字段清洗不改展示消息；D1 历史 Zone.js/zoneless 流式通过。 | 需 Angular OnPush 子组件逐块自动更新、请求 body/展示消息分离和自定义 chunk 的实际消费断言；Angular 21/22 浏览器未验（B0、D4）。 |
| M03 取消、错误、finally | `abortRequest` 等待活动 Provider 退出；Provider/可传播钩子错误使 Promise reject 和状态 `error`；`onError` 可追加消息，`onFinally` 异常只记录；取消后状态 `aborted`。 | `/core` `engine.abort/runTurnLifecycle`：`src/message/core/engine.ts:298-387,719-763`；`/angular` `abort/dispose`：`src/angular.ts:35-80`；SSE 工具在根 `src/utils.ts:21-101,164-238`。 | `src/vue/message/useMessage.lifecycle.test.ts:202-368` 覆盖错误钩子、finally、取消；`src/message/test/native.test.ts:41-61,516-536` 断言迟到 chunk 丢弃；D1 历史错误/取消和本地 HTTP/SSE 通过。 | 不合作且永不返回的 Provider 仍可能让 abort/dispose 等待；Angular 消费者错误 UI、真实网络取消和资源基线留 D4/A1。 |
| M04 请求清洗与默认插件 | `requestMessageFields/requestMessageFieldsExclude` 只改请求 body；默认 `thinkingPlugin`、`lengthPlugin`；插件生命周期按协议执行，插件可修改 request body/追加消息/命令。 | `/core` `src/message/plugins/index.ts`、`engine.ts:136-147,520-539`；Vue 适配在 `src/vue/message/useMessage.ts:65-211`；Angular 直接用 core 插件。 | `src/message/test/native.test.ts:232-263,538-612` 覆盖 before-request、去重、thinking；`src/vue/message/useMessage.lifecycle.test.ts:175-196` 覆盖清洗；`src/message/test/toolPlugin.test.ts` 覆盖工具插件生命周期和限制。 | 需独立 Angular 断言展示消息不被清洗、插件错误/命令在 Signals 中可见；B0/D1c，完整矩阵 D4。 |
| M05 工具执行与审批 | 显式注册 `toolPlugin`；动态工具/Provider、流式结果、轮数限制、确认/拒绝和 `dispatchCommand`；暂停消息与回合快照应能在导航/重载后恢复。 | `/core` `src/message/plugins/toolPlugin.ts:289-430,634-706,918-1052`，命令为 `tool.resume/tool.reject`；`/angular` 只转发 `dispatchCommand`。 | `src/message/test/toolPlugin.test.ts:88-234,503-650,978-1179,1182-1432,1518-1695,1805-2200,2312-2648` 覆盖动态工具、并发审批、取消、拒绝、暂停快照、同 tool id 隔离；D1 历史 Angular 20 审批/拒绝通过。 | 需 Angular 多视图共享管理器、后台生成、删除/销毁边界；D2 的“恢复”在旧实例仍活着时以 `createAngularMessage(options(messages))` 重建（`experiments/angular-s3/src/d2.spec.ts:88-126`），不是真正整页重载。D3c 必须销毁旧实例后重载成功/失败各测一次。 |
| M06 Skill 选择 | Vue 文档支持 manual/none/auto、响应式 getter、`onInstructionsResolved`、按请求选择；Skill instructions 不自动写历史，资源工具需 `toolPlugin`。 | `/core` `skillPlugin`、loader/storage/capabilities；`/angular` 复用 `/core`，D2 用 getter `selection: () => signal()`；根 Vue 包装在 `src/vue/message/plugins/skillPlugin.ts`。Node `/node` 仅导出 fs/GitHub Node loader/storage。 | `src/skills/test/skillPlugin.test.ts:53-112,187-306,315-406,412-630,637-753,827-1011` 覆盖选择、资源工具、暂停恢复、resolver 缺失/失败；`loaderBrowser.test.ts:52-177` 覆盖 fileList、**模拟** directoryHandle、二进制、strict/warnings、取消；`resourceCapability.test.ts:41-199` 覆盖文本/二进制列出、二进制不可读和参数错误；IndexedDB/memory 测试覆盖 lazy text/binary 和取消。D2 历史 Angular 20 TestBed 4/4、File/IndexedDB 浏览器通过，GitHub 是受控 fetch。 | 独立 Angular 真实浏览器 directory picker、真实 GitHub、失败 UI、跨重载资源恢复未证明；D2 不能代表 21/22。B0 映射，D3c 重载审批，D4/A1 全版本 Skill 与真实浏览器。 |

## C01-C03：会话、持久化、竞态

| 子项 | Vue 文档化消费操作与契约 | Vue/core/angular/node 入口与源码 | 已有测试/证明范围 | 当前缺口与负责阶段 |
| --- | --- | --- | --- | --- |
| C01 会话生命周期 | `useConversation` 创建、加载、切换、重命名、删除、清空；`sendMessage/abortActiveRequest` 作用于活跃会话；未活跃但仍 processing/paused 的引擎按契约后台保留。 | 目前仅根 Vue `src/vue/conversation/useConversation.ts:9-405`；引擎缓存 `workingEngines`、活跃 id 和懒加载均在 Vue composable。`/core` 无会话管理器，`/angular` 无会话入口。 | `useConversation.lifecycle.test.ts:62-173,226-454` 覆盖加载、空列表 onLoad、创建/标题/删除/清空；`useConversation.test.ts:18-53` 覆盖 paused 引擎保留、idle 引擎回收。 | C01 无框架无关公开实现，也没有 Angular 会话 API；D3a 共享管理器，D3b Vue 接入，D3c Angular 多会话。 |
| C02 存储/自动保存/旧格式 | 默认 LocalStorage；可选 IndexedDB/自定义 strategy；自动保存 deep watch 节流，暂停时保存消息；旧 `renderContent` 转换；删除/保存返回值遵循文档。 | 根 `src/storage/index.ts` 保留 Vue 兼容 factories/types；`/core` 通过 `src/storage/core.ts` 提供同一运行时实现及共享 `ConversationStorage` 类型桥接；策略：`localStorageStrategy.ts:14-89`、`indexedDBStrategy.ts:34-160`；Vue `setupAutoSave`/队列：`useConversation.ts:28-130`。 | `storageStrategies.test.ts:37-142` 覆盖 LocalStorage/IndexedDB、旧格式、腐坏/删除失败；`useConversation.test.ts:55-155` 覆盖初始与暂停保存顺序；`useConversation.lifecycle.test.ts:177-454` 覆盖延迟保存/删除、同 ID 删除再创建、失败。D4.1 严格声明消费检查覆盖 core factory→conversation manager 赋值。 | Vue deep watch 的尾调用在回收前可能丢失（文档 `conversation.md:136`，实现 `stopAutoSave` 只 stop watcher）；队列快照/删除/恢复由 D3 共享管理器负责，D4.2 补完整独立安装与浏览器证据。 |
| C03 竞态与回收 | 快速切换、并发加载、晚到初始列表、保存后删除、同 ID 重建、后台生成、暂停审批恢复；视图解绑、请求取消、管理器释放、删除历史是不同动作。 | 当前 Vue `ensureEngine`/`clearInactiveEngines`/`deleteConversation`：`useConversation.ts:199-337`；turn metadata localStorage `src/message/core/turnPersistence.ts`，独立 `__tiny-robot-turn` best-effort 快照。 | lifecycle 测试 177-390 覆盖晚到标题保存、删除等待、保存后删除、同 ID 重建；toolPlugin 2312-2648 覆盖旧消息重建、缺快照、同 tool id。 | 缺共享代际/加载去重和 Angular 管理器；缺真正关闭视图后重载、manager dispose/重复 dispose、保存失败不阻塞其他会话、资源/请求释放基线。D3a/D3c，D4/A1。 |

## A01-A02：Angular 状态与生命周期

| 子项 | 契约 | 当前入口/源码与历史证据 | 缺口/阶段 |
| --- | --- | --- | --- |
| A01 Signals/OnPush | `/angular` 提供只读 `state/messages/requestState/processingState/isProcessing/isPaused/canStartTurn/revision`；嵌套可变对象用 revision 或受控 `updateMessage` 通知；不逐 token 深拷贝历史。 | `src/angular.ts:12-80`；核心 native adapter 浅复制数组、嵌套对象共享 `src/message/adapters/native.ts:21-33`。D1 `experiments/angular-s3/src/d1.spec.ts:49-113` 断言 OnPush 子组件、revision、流式和共享解绑；S4 仅实验对比。 | 新基线未运行；Angular 21/22、Zone.js/zoneless 全矩阵和长历史资源数据留 B0/D4/A1。消息列表替换/删除/清空没有受控 Angular API，不能把 `updateMessage` 当完整列表修改能力（D4 先根据消费需求定最小 API）。 |
| A02 所有权/DestroyRef | 自有连接 destroy/dispose 解绑并 abort；共享连接 dispose 只解绑，后台 engine 继续；重复释放应幂等；销毁不等于删除历史。 | `src/angular.ts:27-40,82-112`；D1 测试 80-104 证明共享继续和自有 abort。 | 共享会话管理器最终释放、暂停快照保留、尾保存、多个视图互不影响未实现/未测。D3a/D3c；D4/A1 补资源基线和不合作 Provider 限制。 |

## P01、V01、L01：发布、Vue 兼容与其他公开能力

| 子项 | 消费操作/入口 | 已有源码/测试与证据 | 当前缺口/阶段 |
| --- | --- | --- | --- |
| P01 独立消费 | Angular 应只安装包声明入口，`skipLibCheck:false`，无 Vue、无源码 alias；能消费消息、插件、Skill、SSE、会话存储和 Provider。 | `package.json` 有 `.`, `/core`, `/angular`, `/node` 的 ESM/CJS/types exports；Angular peer optional，Vue optional，`openai` production dependency。D4.1 后 `/core` 导出框架无关 storage、SSE、Provider；根入口仍保留 Vue 绑定。`createVueMessageAdapter` 不再从 `/core` 导出。 | D4.2 tarball `41613AEDF8A867B7A64FE4EDBE69664F2F5027CB012AC2E384EFEAAEDCFA6FB5` 在 Angular 20/21/22 宿主安装通过；三版本严格声明、生产构建、ESM/CJS 导出和无 Vue 依赖树通过；完整 Skill 外网和资源基线仍由 A1 收口。 |
| V01 Vue 兼容 | 保持根 `useMessage/useConversation`、Vue refs、插件上下文、直接改消息/嵌套字段和 deep watch；Vue 适配需把 core 消息映射为响应式代理。 | `src/vue/message/useMessage.ts:1-249`、`src/message/adapters/vue.ts:22-143`、`src/vue/conversation/useConversation.ts`；Vue 测试 `message/useMessage*.test.ts`、`message/test/vue.test.ts`、conversation lifecycle 已覆盖对象身份、插件、旧行为。 | 新基线尚未复验；共享会话迁移必须保留签名（`createConversation` 同步、`clear` void）和 direct mutation 保存；D3b。 |
| L01 其他公开能力 | 旧 `AIClient`、Provider、SSE/格式化工具、Skill、Node `/node` 入口按现有文档可用；废弃 `AIClient` 保留兼容，不新造 Angular wrapper。 | 根 `src/index.ts` 继续导出 `AIClient/BaseModelProvider/OpenAIProvider/storage/utils/types/vue`；`/core` 现在导出 `BaseModelProvider/OpenAIProvider`、SSE 处理器、LocalStorage/IndexedDB 策略及工厂；`src/node.ts` 保留 Node Skill API。 | `AIClient` 和旧格式化工具仍是根入口兼容 API；D4.1 新增 `/core` 辅助出口已做 ESM/CJS/严格声明检查，D4.2 三版本 ESM/CJS 命名导出一致。旧 `/core` 的 `createVueMessageAdapter` 路径变化已在 API/迁移材料中记录；真实 Skill 外网和最终资源边界仍待 A1。 |

## B0-D3 必补证据清单

1. **B0 基线复验**：按当前 HEAD 重新准备 Skill fixtures，运行 kit 测试、构建和新 tarball；核对 `onLoad` 空列表期间内存会话、入口声明、Vue 回归。记录“本轮未运行”改为新结果后才可进入 D3。
2. **D3a 共享规则**：用可控异步 storage/provider 覆盖初始列表晚到、并发同 ID 加载去重、A→B 快速切换、保存/删除队列、同 ID 删除再建、尾保存、代际和 manager/view dispose；明确快照物化时机及失败报告。
3. **D3b Vue**：验证 direct mutation 和嵌套工具字段由 deep watch 进入共享保存；保持旧消息格式、LocalStorage/IndexedDB、自定义 strategy、方法返回签名；新增尾保存行为要有兼容说明。
4. **D3c Angular**：仓库外新 tarball 宿主由应用服务持有 manager；真实 OnPush 消息/工具/会话列表覆盖后台生成、多个视图连接、视图卸载后继续、关闭后重新进入和**销毁旧实例后的整页重载**审批恢复；同时覆盖拒绝、删除、缺快照/资源、保存失败。
5. **D4/A1**：D4.1 已补 `/core` 无 Vue 的 conversation/storage/SSE/必要 Provider 路径；D4.2/A1 仍需在 Angular 20/21/22 各自 `skipLibCheck:false`、ESM/CJS、生产构建、Zone.js/zoneless 浏览器与本地 HTTP/SSE 中复验；Skill 的真实 directory picker/GitHub 与失败路径单列；记录资源、timer、请求、DB 连接及 tarball SHA-256。

## D4 发布矩阵与剩余能力（单列，不缩范围）

| 维度 | 必须证明 |
| --- | --- |
| 版本 | Angular 20、21、22 各独立安装同一候选产物；TypeScript 5/6 对应宿主，严格声明和生产构建。 |
| 运行模式 | 每版本 Zone.js 与 zoneless；真实 OnPush 子组件逐块刷新，不靠手动 detectChanges。 |
| 入口/依赖 | `/core`、`/angular` ESM/CJS 与 `.d.ts`；无 Vue 宿主依赖树；根 Vue 入口和 `/node` 原定位回归；`openai` 运行时声明；记录旧 `/core` Vue adapter 路径迁移。 |
| 辅助能力 | 无 Vue storage、SSE、Provider/旧工具可消费；LocalStorage/IndexedDB/自定义策略、旧消息格式、失败和尾保存；真实本地 HTTP/SSE。 |
| Skill | browser fileList、真实 directoryHandle、GitHub真实/受控响应分开；取消、strict/warnings、二进制、资源工具不可读错误、IndexedDB lazy reader、暂停审批重载。 |
| 性能/资源 | 500 条历史/80 chunk 对照及约定长历史；重复创建销毁后订阅、timer、请求、保存队列、DB 连接；区分共享 manager 持有资源和泄漏。 |
| 文档与兼容 | Angular 自建消费示例、API/迁移、已知限制；Vue direct mutation/deep watch 和旧方法签名回归；失败/未运行项明确记录，不能宣称完整首版。 |
