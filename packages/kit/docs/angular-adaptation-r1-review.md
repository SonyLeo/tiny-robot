# Kit Angular 适配 R1 设计评审记录

> 2026-09-27。状态：技术方向经用户确认；D1 消息与 D2 Skill 已通过 Angular 20 独立消费验证。完整公开能力仍须经过 D3-D4 和最终版本矩阵验收。目标范围见 [目标与验收基线](./angular-adaptation-goals.md)，阶段证据见 [执行计划](./angular-adaptation-execution.md)。目前没有 Angular 业务评审者，不能将技术方向确认记作 Angular 使用方认可。

## 证据边界

- S1/S2：`/core` 的实验产物可由无 Vue 宿主导入；根入口仍会加载 Vue，存储尚无中立公开入口。kit 全量测试 192 通过、1 跳过；Vue 存储聚焦回归 22 项通过。
- S3：真实 Angular 20 宿主从本地 tarball 导入 `/core`；zoneless TestBed 5 项，Zone.js/zoneless 浏览器流式、取消、错误、工具批准/拒绝和本地 HTTP/SSE 通过。Angular 21/22 已分别通过严格声明检查和生产构建，尚无两版本浏览器交互证据。
- S4：同一三块可控流下，深拷贝、native 订阅加 revision、自定义 adapter 包装的通知、对象身份、插件、`OnPush` 子组件和 `DestroyRef` 释放检查通过。500 条历史、80 chunk 的两轮单模式计时详见 [S4 结果](../experiments/angular-s3/S4-results.md)；数据仅用于比较本机实验负载，不构成性能承诺。
- 独立复现：从仓库实验源码复制到新的仓库外宿主、重新安装 S2 tarball 后，无 Vue 依赖，Angular 20 严格类型、生产构建、12 项 TestBed 和 Zone.js/zoneless 浏览器交互再次通过；没有使用仓库源码 alias。
- D1：正式 `/angular` 入口、核心 `updateMessage` 与取消后迟到 chunk 防护已实现。kit 全量 194 通过、1 跳过；仓库外 Angular 20 宿主安装 D1 tarball，无 Vue，严格类型、生产构建、9 项 TestBed 及 Zone.js/zoneless 浏览器主要交互通过。Angular 21/22 和 Skill/会话仍未作正式验收。
- D2：复用 D1 tarball 的 `/core` Skill API；仓库外 Angular 20 宿主无 Vue，严格类型、生产构建、20 项 TestBed 和 Chrome 原生文件/IndexedDB 路径通过。GitHub HTTP 响应由测试拦截。自有连接销毁会取消暂停回合；跨导航恢复取决于 D3 共享会话所有权与保存规则。

## 建议的设计决策

| 编号 | 建议 | 理由与约束 | 状态 |
| --- | --- | --- | --- |
| R1-A 状态 | 共享引擎继续使用 native adapter；Angular 订阅通知并写入 Signal，另发布单调递增的 revision。嵌套消息是可变视图，不称为不可变快照 | S4 中自定义 adapter 仍须委托 native 且引入订阅顺序约束；逐块深拷贝完整历史在长历史实验中成本明显。`OnPush` 子组件须读取 revision 或将它作为输入，工具状态子组件须接收变化后的值 | 方向确认；D1 固定使用方式与类型 |
| R1-B 消息更新 | Angular 消费方通过受控 `updateMessage` 类方法改消息/嵌套状态，核心在原对象上修改并发出 `messages` 通知；不替换引擎持有的消息对象。Vue 现有直接修改继续由代理与深度监听追踪 | 普通 JS 对象的外部原地写入不会触发 Signal。需要稳定定位目标、销毁后规则及错误行为；D1 先以对象引用定位并测失效引用 | 方向确认；API 名称待 D1 固定 |
| R1-C 生命周期 | 明确自有实例与共享实例：自有作用域销毁先停止通知，再取消请求并释放定时器；共享连接销毁只解绑，后台请求继续。`dispose()` 幂等；删除会话另有显式操作 | S3 证明解绑与 abort 是不同动作；核心目前只有 `abort()`，尚无统一 dispose。迟到 chunk 和保存回调不得更新已销毁 Angular 连接 | 方向确认；D1/D3 验证具体规则 |
| R1-D 会话 | 提取一个框架无关会话规则层；它持有会话元信息、引擎映射、加载去重、代际标识、保存节流与同 ID 持久化队列。Angular/Vue 各自连接状态 | 现有 Vue `useConversation` 使用 refs、computed、深度 watch、节流计时器和异步加载，不能直接成为 Angular 核心。Vue 深度 watch 继续将直接修改送入共享保存规则；Angular 受控更新触发通知与保存 | 方向确认；D3 实测竞态后固定细节 |
| R1-E 发布 | 优先单包子入口：Vue 根入口维持既有业务 API；`/core` 保持无 Vue；Angular 新入口只导入 Angular 与共享模块；Vue 和 Angular peer 均 optional，`openai` 保持生产依赖。为存储、SSE 等框架无关能力提供无 Vue 的公开路径，仓库外分别核验运行时与声明图 | S2 已证明 `/core` 可以独立安装，但根入口仍需 Vue，`/core` 还缺会话存储及 SSE 入口。不能只凭消息实验宣称完整 kit 可在 Angular 消费 | 方向确认；具体辅助入口待 D3/D4 验证 |
| R1-F 传输与 Skill | 保留 `responseProvider` 作为传输边界。暂不新增 HttpClient/Observable 桥接；Skill 使用现有核心插件和选择 getter | S3 本地 HTTP/SSE 已通过 Provider；D2 在 Angular 20 宿主验证手动、自动、请求级 Signal 选择、加载、存储和资源。无需 Vue Ref 或新增 Angular Skill 包装 | D2 阶段通过；最终版本矩阵待 D4 |
| R1-G 能力边界 | 按 Vue 版的业务消费能力对等验收，不逐文件或逐符号复制 Vue。Angular 复用 `/core` 的 `toolPlugin`、`skillPlugin` 等规则，只设计消息与会话的 Angular 连接 API；旧 `AIClient` 等能力保持兼容，不新造 Angular 包装 | 文档的消息、会话、Skill 示例均通过 `useMessage`/`useConversation` 消费；根入口同名插件是 Vue 包装，`/core` 已有无 Vue 核心实现。文档与源码的部分旧导出说明不一致，最终以源码和发布产物复核 | 用户确认；D1-D4 逐项落实 |

### 拟议 Angular 消费契约

Angular 层向消费方提供只读 Signals：消息列表、请求状态、派生状态及 revision；命令转发 `sendMessage`、`send`、`abort`、`dispatchCommand`、`setResponseProvider`，并增加受控 `updateMessage`。D1 当前提供 `createAngularMessage` / `injectAngularMessage` 创建自有实例，`connectAngularMessage` / `injectSharedAngularMessage` 连接共享引擎；共享连接解绑不取消后台请求。D1 已用独立 Angular 20 宿主检查名称与声明，D4 的 20/21/22 全矩阵通过前仍不是最终发布验收。不把 S3 实验中的 `MessageSession` 作为公开 API。

对 Vue 开发者，可把 `messages.value` 理解为深响应式代理；Angular Signal 只追踪 Signal 值的发布，不能自动追踪旧消息对象内的字段。使用 `OnPush` 子组件时，业务组件可传入 `revision()`，或在子组件里直接读取这个 Signal。受控更新方法负责外部业务写入的通知，内部流式与工具状态继续由消息引擎及插件处理。

D1 的自有连接 `dispose()` 先解绑再调用引擎 `abort()`，共享连接只解绑；两者重复调用均返回同一释放结果。Provider 必须响应传入的 `AbortSignal` 才能保证请求及时结束；核心会丢弃取消后才产出的 chunk，但永不返回的 Provider 仍可能让取消 Promise 持续等待。D4 继续记录反复销毁的资源基线。

### 会话竞态和保存规则

- 同 ID 的元信息保存、消息保存与删除按队列串行；删除先令内存态不可见并取消该会话请求，再排队清理存储。同 ID 删除后重建采用新的代际标识，旧加载/保存结果不可覆盖新实例。
- 快速切换只改变活跃 ID；运行中的非活跃会话仍可后台生成。并发加载同 ID 去重，旧请求晚到须检查代际标识。暂停审批先持久化待审批消息，再暴露可恢复状态。
- 自动保存采用明确的 leading/trailing 节流和 `flush/dispose` 规则；释放监听不能静默丢掉最后一次保存。销毁之后异步完成可以清理内部队列，但不得再发布到已销毁连接。
- Vue `useConversation` 保留 refs、`computed`、直接修改消息后的深度自动保存及现有公开方法。其 `clear(): void` 签名不悄悄改成 Promise；如需要可等待清理，新增异步方法并留兼容包装。

## 已确认的公开边界

1. **消息视图**：首版按可变消息视图、显式 revision 和受控更新推进。Vue 的直接修改由其代理继续追踪；Angular 的外部修改必须经过受控更新。D1 用真实 `OnPush` 子组件决定 revision 的具体使用方式与命名，并验证引用和销毁规则；不把每个 token 深拷贝全部历史作为默认方案。
2. **Vue adapter 工厂**：`createVueMessageAdapter` 保留为 Vue `useMessage` 的内部组装函数，Angular 不做同名实现。`robot/develop` 的 `/core` 曾顺带导出它，仓库内文档、示例与消费代码未使用该路径；外部使用情况未知。正式方案保持 `/core` 无 Vue，并撤回 S1 实验新增的 Vue 根入口导出及其测试预期。发布前核对已发布产物，准确记录旧路径变化，不为此恢复 `/core` 的 Vue 依赖或新建 `/runtime`。
3. **消费 API 范围**：文档化的消息、插件/工具、Skill、会话、存储和 SSE 能力必须由无 Vue 的 Angular 宿主实际消费。已有高级核心接口按原职责保留；废弃或与 Vue 绑定的符号不要求逐一提供 Angular 替身。仅凭文档缺席不能推定某个旧导出可以无说明地删除。

## 开发放行条件

- R1 技术方向已确认并回填目标文档；D1 已通过 Angular 20 独立消费复核，D2 可以开始。没有 Angular 使用方评审者的缺口保留，D4 加严仓库外独立消费与浏览器矩阵；D1 API 的最终发布承诺仍取决于完整矩阵。
- D1 先验受控更新、Signal/`OnPush`、自有/共享销毁、错误和工具审批；D2 验 Skill；D3 验会话与 Vue 深度保存；D4 再验正式入口和 Angular 20/21/22 的 Zone.js/zoneless 全矩阵。
- 任一阶段若出现核心引用失效、Vue 直接修改丢保存或明显性能回退，先用可控用例记录并回到本评审调整，不以演示通过替代能力清单验收。
