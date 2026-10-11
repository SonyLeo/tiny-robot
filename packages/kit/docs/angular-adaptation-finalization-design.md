# Angular 适配下一步设计：消费契约与完整验收

> 2026-10-11。基线`feat/kit-angular` / `9de3df7c3a4374c090400aedbdd337c0ef036980`，存在未提交源码和文档。本文保留已确认的N1–N6设计；基础Angular实施与技术验收已按设计完成，实际结果见[完成审核](./angular-adaptation-completion-audit.md)与[验证记录](./angular-adaptation-validation-results.md)。材料与实验脚本最终复核已完成；本轮未提交、推送或发布。

## 1. 目标与责任

首版对等 Vue 文档化的业务能力，覆盖目标文档 M01–L01，包括 Skill。对等的是发送、流式、工具、会话和存储等行为，不要求 Angular 复制 Vue 的文件结构、ref 或 deep watch。

| 层 | 承担责任 | 消费方式 |
| --- | --- | --- |
| 共享核心 `/core` | 唯一消息引擎，工具/Skill 规则，共享会话管理器，保存顺序、取消与竞态，存储与传输工具 | 普通 TypeScript 对象、方法、订阅与 Promise，不引用框架类型 |
| Vue 根入口 | refs/computed、插件响应式上下文、直接写消息与 deep watch 兼容连接 | 原 `useMessage/useConversation` 用法继续有效 |
| Angular `/angular` | Signals/computed、revision、DI/DestroyRef 连接及连接自身的释放 | Angular 自建组件读取 Signals，通过核心操作方法更新状态 |
| 业务应用 | UI、鉴权与业务传输、工具执行/审批交互、实例和外部存储的所有权 | 服务持有共享 manager，组件拥有视图连接 |

首版不承诺 SSR，不增加 Angular UI 库或 HttpClient/Observable 桥接。保留 responseProvider 的请求/AbortSignal 边界。同包子入口仍是当前方案；只有独立安装或声明图证明该方案不成立时，再比较拆包。

## 2. 消息状态契约

### 2.1 区分三个概念

- 引擎持有的消息对象：流式、工具和插件可能原地修改，不能随意替换这些对象来触发 UI。
- native/Angular 状态视图：复制数组容器，消息和嵌套对象仍可能共享引用，不是历史的深不可变快照。旧通知中的对象也可能随之后的更新变化。
- 持久化快照：实际保存进入队列时物化，后续消息变化不得改写已经排队的保存参数；自动保存先节流合并，不逐 token 深拷贝全部历史。

`MessageStateAdapter` 的通用契约不能被描述为“所有 adapter 都共享消息对象”。当前 Vue adapter 的 `getState()` 会递归转成普通值；Vue facade 对外仍提供响应式代理。Angular 使用 native 视图的身份规则，Vue 兼容测试使用 facade 的代理身份规则，两者分别验证。

### 2.2 修改方式

| 操作 | Angular 推荐入口 | 规则与验收 |
| --- | --- | --- |
| 编辑已有消息/嵌套业务字段 | `updateMessage(message, recipe)` | 使用当前引擎中的消息引用；通知 UI 与自动保存。不可借此绕过工具审批或改写引擎控制状态 |
| 删除、清空、重排、替换历史列表 | `setMessages(messages)` | idle/completed/aborted/error 允许；processing/paused 拒绝。复制输入数组容器，已有消息保持身份，新对象经 adapter 创建；发布一次 messages 通知 |
| 发送文本/消息对象 | `sendMessage` / `send` | 继续调用共享引擎；不将发送作为只编辑历史的方法 |
| 立即确认落盘 | `await manager.flush(id?)` | 等待约定保存队列；失败可被捕获，并通过 onPersistenceError 报告 |
| 删除会话历史 | `deleteConversation(id)` | 取消该会话并按队列删除历史/暂停快照；与 setMessages([]) 不同 |

只读 Signal 不是深度冻结；直接修改 `messages()` 的数组或嵌套对象在 JavaScript 中仍可能发生，但不属于 Angular 的通知/自动保存契约。文档应写“应通过受控 API 修改”，不能声称这些对象无法被修改。Vue 既有 `messages.value` 和嵌套直接写入继续兼容，不强制迁移。

当前 conversation connection 没有 active engine 时，sendMessage/send/abort/setMessages 不操作引擎，dispatchCommand 拒绝为 `No active conversation`。本轮保留这些既有实现并补边界说明与测试，不临时增加严格模式、默认创建会话或修改返回类型。UI 应先完成加载/创建/选择会话；disposed connection 的动作同步拒绝，重复 dispose 返回同一 Promise。

身份识别只需要 `add/has`，登记表采用 WeakSet，仅登记 adapter 返回的消息对象，避免登记表强持有已经移出的历史。native adapter 返回原对象；Vue raw 对象重新进入时仍经 adapter 变为响应式代理，依靠 Vue 的代理缓存保持身份。此调整只消除登记表新增的强引用；引擎的 initialMessages/currentTurn 等既有引用需分别分析，不能声称已证明所有消息均可立即回收。

### 2.3 Angular 的刷新方式

Signals 类似 Vue ref，computed 类似 Vue computed，但普通消息对象的嵌套原地修改不会自动形成 Signal 通知。父模板读取消息 Signal，将同一消息对象及变化的 `revision()` 传给 OnPush 子组件；子组件的 revision input 变化使其重新检查，工具状态子组件也继续接收 revision。

保留 native 订阅 + revision，不新增 Angular MessageStateAdapter。后续若性能数据证明粗粒度 revision 成为瓶颈，再比较消息级通知或展示投影；没有数据时不引入每 token 全历史深拷贝、包装对象或另一套消息引擎。

依据：[Angular Signals](https://angular.dev/guide/signals) 与 [OnPush 子树检查](https://angular.dev/best-practices/skipping-subtrees)。模板读到的 Signal 更新会标记组件；相同对象 input 的嵌套变化本身不会触发 OnPush 检查。本轮已通过 Context7 核对该行为。

## 3. 所有权与生命周期

| 场景 | 所有者与动作 | 必须证明 |
| --- | --- | --- |
| 组件独占一次消息会话 | createAngularMessage/injectAngularMessage 创建并拥有引擎 | 销毁解绑且 abort；重复释放幂等，历史不被删除 |
| 组件连接外部引擎 | connectAngularMessage/injectSharedAngularMessage | 销毁只解绑，其他连接和请求继续 |
| 多会话页面 | 应用服务持有 manager，组件 injectAngularConversation | 一个视图销毁不影响另一视图或后台会话；重新连接读取当前状态 |
| 应用服务最终关闭 | 显式 await manager.dispose | 停止新操作，处理自有活动请求、尾保存及队列；已保存 paused 回合保留恢复快照 |
| 应用创建的 IndexedDB storage | 存储拥有者负责 close | manager 完成保存后再 close；manager 不自动关闭外部共享存储 |

DestroyRef 类似 Vue 的卸载清理注册机制；它只能触发清理，不能让 Angular 同步销毁过程等待异步保存。需要确定完成的业务操作必须显式等待 dispose/flush。浏览器强制退出不承诺异步保存完成。Provider 必须配合 AbortSignal；永不返回的 Provider 可能使 abort/自有释放 Promise 等待，此限制保留。

## 4. 下一步补验设计与顺序

### N1 修正宿主测试期望与列表消费闭环

源码事实：P7 `Host` 默认同时挂载 Primary 和 Secondary 两个视图。新增 setMessages 测试在整个 fixture 查询消息行并期望一行；保留一条消息后整个页面两行是两个视图各一行，不能据此判定核心更新失败。

实施时逐个 `[data-view]` 断言初始两条、保留后一条、清空后零条；仅 mount 时初始化 detectChanges，后续等待 whenStable。补消息身份、输入数组后改动不影响引擎、flush 后 storage 内容、processing/paused 拒绝且原回合继续、无 active 与 disposed 行为。已有核心身份/状态测试不重复添加同构用例。

### N2 补齐文档化消息与插件消费缺项

| 能力 | 场景与期望 | 主要证明层 |
| --- | --- | --- |
| M01 动态 Provider | 回合进行中换 Provider：当前请求仍用旧 Provider，下一回合使用新 Provider | 核心规则 + 打包入口的 Angular 消费 |
| M01 空文本/对象发送 | 空白不追加消息、不发请求；send(...messages) 保持约定字段与顺序 | 核心 + 独立声明/TestBed |
| M02 自定义 chunk | 分别证明未调用 runDefault 不自动合并、调用后合并；流式内容与自定义展示字段在 OnPush 中自动更新 | 核心 + 真实 OnPush TestBed |
| M04 请求清洗 | Provider 收到白名单/排除后的字段，展示消息保留原字段；插件请求修改顺序遵守现有协议 | 核心 + 独立公开 API 消费 |
| M03/M04 插件错误与命令 | 命令结果返回、嵌套状态自动刷新；原始错误使 Promise reject，错误消息可见；finally 的特殊规则保持 | 核心 + Angular TestBed/浏览器 |

先查已有用例并映射证据，缺什么补什么。不为同一通用核心规则在六组浏览器里穷举所有组合；六组都运行统一的关键消息/会话/工具/Skill/取消/错误 smoke，细分规则由可控核心测试和打包 TestBed 承担。

### N3 冻结候选源码与干净打包

全量 kit/Vue 回归、lint、严格生成声明及 diff 检查后，用正常 tsup `--clean` 构建四入口，检查旧 chunk/DTS 不残留，再 pack/hash。普通 build 不清旧文件，不能当 clean build；禁止手工修改 dist 绕过源码或声明问题。当前含旧输出的检查点包不能当最终交付包。

记录：HEAD、未提交 diff 标识、候选包 SHA-256、包文件清单、锁定依赖、入口运行时/声明图。候选冻结后若修代码，旧 hash 的通过保留为历史，并按影响复验；最终安装矩阵必须指向同一新 hash。

### N4 同一产物的独立版本/模式矩阵

候选 peer 继续为 `@angular/core >=20 <23`，但发布承诺以最终矩阵为准。Angular 20/21/22 各建仓库外全新宿主，按框架兼容范围选择隔离 Node、TypeScript、测试工具并记录实际版本；不改全局环境，不使用 force/legacy-peer-deps。

每版完成无 Vue/源码 alias 安装、skipLibCheck:false、core ESM/CJS 与声明图、Angular 实际 ESM 消费和生产构建、TestBed，以及 Zone.js/zoneless 两组浏览器用例。core CJS 成功不等于 Angular CJS 可在纯 Node require；按真实框架构建路径报告模块兼容，不扩大承诺。

浏览器必须包括多会话后台生成、双视图解绑、嵌套工具状态、工具/Skill 整页重载批准和拒绝、删除/缺资源/缺快照、本地 HTTP/SSE 及取消。不同版本或旧 hash 的结果不能顶替同一最终候选包。

### N5 Skill、存储与资源证据收口

- File、真实 OPFS directoryHandle、二进制、strict/warnings、取消/异常、懒读取、内置 IDB close 及旧消息格式分别映射。OPFS 证明目录句柄消费能力，不能写成用户 showDirectoryPicker 交互已验。
- GitHub 受控响应证明确定性错误/取消，固定路径真实 GitHub证明实际传输；分开记录，不能互相替代。
- 记录 500/2000 历史、流式 chunk 数、保存是否开启和耗时；重复 30 次销毁，核对订阅、timer、请求、队列和 DB 连接回到对应所有者的基线。手动计数和真实观测分别标明。
- 允许 IDB 删除短暂 blocked，但必须等待最终 success 并记录超时；不将发生过 blocked 一概写成泄漏，也不忽略永久 blocked。

### N6 文档、交付与完成审核

逐子项回填 M01–L01：入口/用例/命令、期望与结果、包 hash、宿主版本/模式、证据路径、风险。更新 API、迁移、可重建示例与团队材料；历史失败保留并标清修复后证据。

完成审核要求：所有首版子项有明确验收证据，最终包矩阵通过，Vue 兼容与公开声明通过，资源/性能基线及剩余限制可复现。无 Angular 业务评审者仍记录为缺口，不假称获认可。旧 npm 0.5.1 的 `/core` 曾导出 createVueMessageAdapter，路径移除和 LocalStorage 写入错误传播变化须列入迁移说明；发布版本和发布操作由用户另行决策。

## 5. 实施分工与停止条件

实现由用户指定的 `gpt-6.1-sol high` 子代理承担；主线程负责给出明确文件归属、审查 diff、核验记录并决定进入下一关。核心文件同时只交给一个实现任务；Angular 宿主任务不能擅改共享核心。WC 任务与本工作树基线/归属独立核对，整合时保持唯一核心。

子任务必须附上：本文件与目标文档、当前 HEAD/status、可改文件、已有证据、未决项、预期验收命令。子代理先给简短方案，再在已授权范围实现；不提交、推送、发布。

出现 Vue 兼容冲突、需要新存储协议/插件生命周期、大幅增加成本或缩小首版能力时，给出证据和修复/架构调整/缩范围选项，回到用户评审。测试期望错误或宿主工具依赖问题先纠正验证方法，不能为通过测试而改变业务规则。

本次设计不新增公开API、不调整已确认首版范围。N1–N6实施、技术检查、材料复核与脚本顺序复验均已完成，结果已回填。发布版本和兼容迁移决策独立于技术验收，不以测试数量代替逐能力证据。
