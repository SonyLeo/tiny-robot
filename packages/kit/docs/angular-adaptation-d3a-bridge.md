# D3a.1 共享会话核心边界与 Vue/Angular 引擎桥接

状态：D3a.1 设计与契约准备（2026-10-04）。本文不承诺完整会话管理、Vue 迁移或 Angular 多会话 UI。

## 决策摘要

- 消息规则唯一位于 `createMessageEngine(adapter, options)`。共享会话管理器以后只负责会话实例、存储顺序和生命周期，不复制消息/工具/Skill 规则。
- 每个会话使用一个 `MessageEngine`。框架连接只消费 `getState()`、`subscribe()` 和操作方法；Angular 使用 `createNativeMessageAdapter()`，Vue 继续使用 `createVueMessageAdapter()`。
- Vue 的响应式消息代理、插件上下文和直接嵌套修改保持原路径。Angular 通过现有 `updateMessage(message, recipe)` 作为受控嵌套修改入口，并用订阅状态和 `revision` 驱动 Signals/OnPush 消费。
- D3a.1 不新增列表操作，也不把 `dispose()` 加到 `MessageEngine`。连接释放与引擎释放由上层管理器负责，待 D3a.3 依据保存/释放测试固定。

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

## 所有权、释放和暂停快照

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

