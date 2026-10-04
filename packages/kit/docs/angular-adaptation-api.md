# Kit Angular 适配 API 与迁移说明

本文说明当前 Angular 适配阶段已经实现的公开入口。它面向使用 Angular 组件和服务组合聊天业务的开发者；kit 不提供 Angular 聊天 UI 组件。

## 安装与入口

```bash
pnpm add @opentiny/tiny-robot-kit @angular/core
```

Angular 消费方使用以下入口：

```ts
import { createMessageEngine, createNativeMessageAdapter } from '@opentiny/tiny-robot-kit/core'
import { createConversationManager } from '@opentiny/tiny-robot-kit/core'
import { connectAngularConversation, injectAngularConversation } from '@opentiny/tiny-robot-kit/angular'
```

`/core` 是框架无关入口，包含消息引擎、插件、Skill、会话管理器、存储策略、SSE 工具和 Provider。`/angular` 只负责 Signals、Angular 依赖注入和 `DestroyRef` 连接。根入口继续提供 Vue composable；Angular 应用不应导入根入口，也不需要安装 Vue。

## 单会话

```ts
const engine = createMessageEngine(createNativeMessageAdapter(), {
  responseProvider: async (body, signal) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    })
    return response.json()
  },
})

const view = connectAngularMessage(engine)
```

在 Angular 服务中优先使用 `injectAngularMessage(options)` 创建自有引擎，或使用 `injectSharedAngularMessage(engine)` 连接应用已经持有的引擎。连接提供 `messages`、`requestState`、派生状态和 `revision` Signal，以及 `sendMessage`、`send`、`abort`、`dispatchCommand`、`setResponseProvider` 和 `updateMessage` 等动作。

消息对象保持引擎中的对象身份。Angular 普通对象的嵌套原地写入不会单独触发 Signal；业务修改现有消息时使用 `updateMessage(message, recipe)`，OnPush 子组件可读取 `revision()` 作为更新依据。流式和工具状态由引擎通知，组件不需要额外点击或循环调用 `detectChanges()`。

## 多会话

应用服务持有一个共享 `ConversationManager`，组件只建立连接：

```ts
const manager = createConversationManager({
  storage: localStorageStrategyFactory(),
  engineFactory: (_id, initialMessages, options) => createMessageEngine(
    createNativeMessageAdapter(),
    { ...options, initialMessages },
  ),
  engineOptions: { responseProvider },
  autoSaveThrottle: 500,
})

const conversation = injectAngularConversation(manager)
```

连接提供 `conversations`、`activeConversationId`、`activeConversation`、`activeEngine` 和 `revision` Signal，并转发 `load`、`createConversation`、`loadMessages`、`switchConversation`、`updateConversationTitle`、`deleteConversation`、`clear`、`saveMessages`、`flush`、`sendMessage`、`send`、`abort` 和 `dispatchCommand`。

会话管理器负责引擎隔离、并发加载去重、加载代际、保存队列、节流尾调用和删除顺序。视图销毁只解绑连接，不删除历史，也不终止仍由管理器持有的后台会话。应用最终退出时显式调用 `manager.dispose()`；该操作释放管理器资源并保留历史。

## 存储与传输

Angular 从 `/core` 导入 `localStorageStrategyFactory`、`indexedDBStorageStrategyFactory`、`LocalStorageStrategy`、`IndexedDBStrategy`、`handleSSEStream` 和 `sseStreamToGenerator`。也可以实现 `ConversationStorage`，提供会话元数据和消息的加载、保存、删除方法。`responseProvider` 仍是请求边界，HttpClient/Observable 桥接不属于当前 API。

## 从 Vue 迁移

| Vue | Angular |
| --- | --- |
| `useMessage(options)` | `createMessageEngine(nativeAdapter, options)` + `/angular` 连接 |
| `messages.value` | `connection.messages()` |
| `computed` 派生值 | Angular `computed` 或连接提供的派生 Signal |
| `watch`/组件卸载 | 引擎订阅由连接管理，`DestroyRef` 自动解绑 |
| `useConversation(options)` | 应用服务持有 `createConversationManager`，组件使用 `injectAngularConversation` |
| Vue 深度直接修改消息 | Angular 使用 `updateMessage`，保持对象身份并发布通知 |

Vue 根入口、Vue adapter、旧存储类型和直接修改消息后的深度自动保存继续保持兼容。Angular 入口不复制 Vue `ref`、`watch` 或内部 `createVueMessageAdapter`。

## 当前边界

- 当前首版仍需完成 Angular 20/21/22 独立宿主、Zone.js/zoneless 浏览器矩阵和资源基线验收。
- SSR 尚未纳入承诺。
- `responseProvider` 必须响应传入的 `AbortSignal`；永不返回的 Provider 可能让取消或最终释放等待。
- 暂停工具回合的恢复依赖已有消息和回合快照，存储失败时不能保证浏览器退出前完成异步写入。
