# D3a.1 共享会话核心边界与 Vue/Angular 引擎桥接

状态：D3a.1 设计定案（2026-10-11）。本文定义共享会话核心与 Vue/Angular 连接层的实施边界；它不把尚未完成的独立宿主、完整能力矩阵或浏览器资源验收标记为已通过。

## 决策摘要

- 消息规则唯一位于 `createMessageEngine(adapter, options)`。共享会话管理器以后只负责会话实例、存储顺序和生命周期，不复制消息/工具/Skill 规则。
- 每个会话使用一个 `MessageEngine`。框架连接只消费 `getState()`、`subscribe()` 和操作方法；Angular 使用 `createNativeMessageAdapter()`，Vue 继续使用 `createVueMessageAdapter()`。
- Vue 的响应式消息代理、插件上下文和直接嵌套修改保持原路径。Angular 通过现有 `updateMessage(message, recipe)` 作为受控嵌套修改入口，并用订阅状态和 `revision` 驱动 Signals/OnPush 消费。
- 跨框架列表调整使用 `setMessages(messages)`。它只在非 `processing`/`paused` 状态替换消息列表容器，保持消息对象身份，触发一次消息通知；不直接暴露可写的内部数组，也不把清空列表等同于删除会话。
- 本轮列表能力仅使用已实现的 `setMessages`，不另增一组增删方法，也不把 `dispose()` 加到 `MessageEngine`。连接释放与引擎释放由上层管理器负责；下一步消费契约与验收见[设计记录](./angular-adaptation-finalization-design.md)。

## 设计定案

### 1. 分层和公开入口

- `/core` 只公开框架无关的 `MessageEngine`、`ConversationManager`、存储、SSE、Skill 和 Provider 类型/工厂；不得引用 Vue 或 Angular 类型。
- `/angular` 只负责把核心状态连接到 Angular Signals，并把 `DestroyRef` 转换为连接解绑；不复制消息、工具、Skill、存储或会话并发规则。
- Vue 根入口继续提供 `useMessage` 和 `useConversation`。Vue 的 `ref`、`computed`、插件响应式上下文、直接修改消息和深度自动保存属于兼容契约，不迁移成 Angular API。
- Angular 应用服务拥有一个 `ConversationManager`；组件只拥有连接。应用不应为每个组件创建一套独立会话管理器，除非确实需要隔离历史和请求。

### 2. 所有权和释放

| 对象 | 所有者 | 视图销毁时 | 显式释放时 |
| --- | --- | --- | --- |
| `createAngularMessage` 返回的自有连接 | 调用方 | 解绑并终止自有引擎当前回合 | 同上，幂等 |
| `connectAngularMessage` 返回的共享连接 | 调用方的引擎持有者 | 只取消订阅，不终止引擎 | 只取消订阅 |
| `connectAngularConversation` 返回的连接 | Angular 应用服务持有 manager | 只解绑当前活动引擎连接 | 只解绑，不删除历史 |
| `ConversationManager` | 应用级服务 | 不因组件销毁自动释放 | 停止新操作，处理自有请求和保存队列，保留历史 |

已持久化的暂停回合不能通过 `abort()` 实现“释放后恢复”，因为现有 abort 会清理暂停快照。管理器释放只终止仍在 processing 的回合；paused 回合先保存并保留快照，由新管理器重新加载后恢复。

### 3. 状态通知和消息身份

- 引擎状态是可变消息对象的浅层数组快照；通知表示列表或请求状态发生变化，不承诺深不可变历史。
- Angular 连接以 Signals 暴露 `messages`、请求状态和 `revision`。OnPush 子组件依赖 Signal 或 `revision()` 观察流式和嵌套状态更新，不通过额外点击或循环 `detectChanges()` 掩盖通知缺失。
- Angular 对嵌套消息修改使用 `updateMessage(message, recipe)`；列表替换、删除、清空和重排使用 `setMessages(messages)`。后者只复制数组容器，保留已有消息对象身份，并在允许的状态下发布一次消息通知。
- Vue 继续允许既有的 `messages.value` 和消息对象直接修改；其深度 watch 负责向 manager 报告变化。Angular 不需要、也不应模拟 Vue 的 deep watch。

### 4. 持久化和并发规则

- 自动保存按会话 ID 节流；实际保存进入队列时才物化会话和消息快照，不按每个流式 token 深拷贝历史。
- 同一会话 ID 的保存、改名、删除严格串行；保存顺序为会话元数据后消息，删除等待此前操作和必要的旧引擎取消，再删除历史及暂停快照。
- `flush(id?)` 取消尾部定时器并等待该 ID 的 dirty 状态和持久化队列；`dispose()` 必须等待所有受管引擎的最终保存，错误通过 Promise 和 `onPersistenceError` 可观察。
- 加载按会话 ID 去重；每次删除/重建递增 generation，切换递增 intent。迟到的加载、保存和请求结果不得覆盖新代际或最后一次切换意图。
- 连接解绑、取消请求、管理器释放和删除历史是四个不同操作，公开 API 和测试分别验证。

### 5. 版本与运行边界

- Angular 适配包的候选 peer 范围为 `@angular/core >=20 <23`，覆盖 Angular 20、21、22；最终发布前以三版本独立宿主验证为准。
- 不引入 RxJS peer、HttpClient/Observable 桥接或 Angular UI 组件库；`responseProvider` 继续接收核心约定的 `AbortSignal`。
- 首版不承诺 SSR；若后续承诺，必须另增服务端导入、实例隔离和请求间隔离验收。

这组规则是实现目标，不是完成证明。D3a 需要核心竞态和持久化测试，D3b 需要 Vue 兼容回归，D3c 需要真实 Angular TestBed 和独立宿主，A1 才能判断整体首版是否放行。

## 最小 MessageEngine 工厂契约

共享工厂的最小输入是 `MessageStateAdapter` 与 `CreateMessageEngineOptions`，当前实现为 `createMessageEngine(createNativeMessageAdapter(), options)`。工厂不导入 Angular、Vue 或存储。

引擎需要提供以下能力：

| 能力 | 当前契约 | 会话层用途 |
| --- | --- | --- |
| 状态 | `getState(): PublicMessageState` | 首次连接、加载和重连时读取消息及请求状态 |
| 通知 | `subscribe(listener)`、按 `messages/requestState` 过滤订阅，返回取消函数 | 连接层发布 Signals；管理器记录连接并解绑 |
| 请求 | `sendMessage`、`send` | 活跃或后台会话转发用户动作 |
| 取消 | `abort(): Promise<void>` | 取消当前请求/暂停命令；不等同于删除历史或连接解绑 |
| Provider | `setResponseProvider` | 动态替换传输实现，继续以 `AbortSignal` 为取消边界 |
| 命令 | `dispatchCommand(command, payload)` | 工具/Skill 审批、拒绝和恢复等插件命令 |
| 受控消息修改 | `updateMessage(message, recipe)` | Angular 修改嵌套状态并触发消息通知；拒绝不属于该引擎的消息引用 |
| 受控列表修改 | `setMessages(messages)` | 非 `processing`/`paused` 状态替换列表；复制数组容器、保留已有消息身份并触发一次消息通知 |

`PublicMessageState.messages` 是消息数组的浅层快照；消息对象及嵌套字段可能仍共享引用。Angular 连接应发布状态快照并提供 `revision`，不能把该值描述为深不可变历史。长历史下是否需要更细粒度复制留给 D3c/D4 的实测。

## Vue 桥接边界

`useMessage` 继续创建 `createVueMessageAdapter()`，再调用同一个 `createMessageEngine`。Vue adapter 的 `createMessage` 返回 `reactive` 消息，`getState` 通过 `toRaw` 物化状态；因此既有插件上下文、消息对象身份、直接修改 `message.content` 或 `message.state` 的行为继续成立。

共享会话迁移不得把 Vue adapter 替换成 Angular adapter，也不得要求 Vue 消费方改用 `updateMessage`。Vue 深度 `watch` 仍是自动保存直接嵌套修改的连接；Angular 的保存连接应监听引擎通知并只把受控修改视为可发布变更。

## Angular 连接边界

当前 `src/angular.ts` 的连接 API 是 D3a.1 的桥接基线：

- `createAngularMessage(options, destroyRef?)` 创建并拥有 native 引擎。
- `connectAngularMessage(engine, destroyRef?)` 连接调用方拥有的引擎。
- `injectAngularMessage` 与 `injectSharedAngularMessage` 只是在 Angular 注入上下文中取得 `DestroyRef` 的便捷入口。
- 连接暴露只读 `state/messages/requestState/processingState/isProcessing/isPaused/canStartTurn/revision`，以及发送、取消、命令、Provider 替换、`updateMessage` 和 `dispose`。

Angular 连接只消费同一引擎工厂的状态和操作，不实现消息、工具、Skill 或会话规则。共享连接 `dispose` 只取消订阅；自有连接 `dispose` 还调用 `engine.abort()`。两者都幂等，历史不会因连接释放而删除。管理器级释放、保存 flush 和后台引擎回收由 D3a.2/D3a.3 定义。

## storage ChatMessage 最小桥接

`src/message/types.ts` 的 `ChatMessage` 是基于 OpenAI `ChatCompletionMessageParam` 的消息运行时类型；`src/types.ts` 另有宽松的历史消息接口。存储边界当前引用后者，形成同名类型冲突。

D3a.1 采用最小桥接：存储策略的参数在适配边界按结构兼容的消息数组传递，不把 Vue `Ref`、Angular Signal 或 adapter 类型放进存储公共接口。实现共享会话时应使用显式的类型别名/窄转换，并在保存前按已有序列化规则物化；不复制每个 token 的完整历史。若严格声明消费发现字段不兼容，再单独收敛存储类型，不在本任务扩大协议。

## 原 D3a 分工记录（历史，不作为当前状态）

以下表格和任务列表记录迁移前的分工；manager/Vue/Angular连接现已落地。当前规则以上文“设计定案”为准，剩余验证按[下一步设计](./angular-adaptation-finalization-design.md)执行。

| 对象 | 拥有者 | `dispose`/卸载 | 请求与历史 |
| --- | --- | --- | --- |
| Angular 自有连接+引擎 | 连接创建者 | 解绑并 `abort()`；幂等 | 请求终止，历史保留 |
| Angular 共享连接 | 外部管理器 | 只解绑订阅；幂等 | 后台请求继续，历史保留 |
| 共享会话管理器（待 D3a.2/3） | Angular 应用级服务 | 停止新操作，处理自有请求与保存队列，保留历史 | 失败必须可观察 |
| 会话删除（待 D3a.2/3） | 管理器 | 先按规则取消/停止保存，再删除会话历史 | 与同 ID 重建按队列排序 |

现有 `toolPlugin` 会在暂停时保存 `PersistedTurnSnapshot`，但 `engine.abort()` 会触发 `onTurnAbort`，该钩子清除对应暂停快照。因此“释放后可恢复”的实现不能用 abort 伪造挂起；D3a.3 必须验证真正的管理器释放、已持久化暂停回合重建，以及取消后快照确实被清除。快照只保存回合元数据，消息仍由会话存储提供。

## 未决项与下一任务

- D3a.2 固定会话管理器的创建/加载/切换/删除、同 ID 代际和后台引擎缓存规则，不增加未被源码/文档证明需要的列表操作。
- D3a.3 固定保存物化时机、同 ID 持久化队列、尾保存、失败报告、管理器释放和暂停回合释放策略。
- D3b 保持 Vue `useConversation` 的 refs/computed、深度自动保存和直接嵌套修改；D3c.1 让 Angular 多连接消费同一管理器。
- `MessageEngine.dispose()`、Observable/HttpClient 桥接和 Angular 会话列表 API 暂不属于 D3a.1。

