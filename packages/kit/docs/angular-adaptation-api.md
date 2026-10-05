# Kit Angular 适配 API 与迁移说明

本文说明当前 Angular 适配阶段已经实现的公开入口。它面向使用 Angular 组件和服务组合聊天业务的开发者；kit 不提供 Angular 聊天 UI 组件。

> 2026-10-05最新P7检查点：共享会话、Vue接入、尾保存、存储close及core辅助出口已落地；以下仍为候选API，非首版发布承诺。最新Angular20产物严格声明/构建/32项TestBed通过，但资源取消浏览器失败，21安装失败、22未复验；列表调整API待评审。结果与待办见[P7清单](./angular-adaptation-p7-readiness.md)。

## 安装与入口

```bash
pnpm add @opentiny/tiny-robot-kit @angular/core
```

Angular 消费方使用以下入口：

```ts
import { createMessageEngine, createNativeMessageAdapter } from '@opentiny/tiny-robot-kit/core'
import { createConversationManager } from '@opentiny/tiny-robot-kit/core'
import { connectAngularConversation, injectAngularConversation } from '@opentiny/tiny-robot-kit/angular'
import { connectAngularMessage } from '@opentiny/tiny-robot-kit/angular'
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

会话管理器负责引擎隔离、并发加载去重、加载代际、保存队列、节流尾调用和删除顺序。视图销毁只解绑连接，不删除历史，也不终止仍由管理器持有的后台会话。最终释放入口为 `manager.dispose()`；本轮核心与独立 Angular20 已验证尾保存和暂停审批整页恢复，最终全版本与内置存储验收仍在进行。

## 存储与传输

Angular 从 `/core` 导入 `localStorageStrategyFactory`、`indexedDBStorageStrategyFactory`、`LocalStorageStrategy`、`IndexedDBStrategy`、`handleSSEStream` 和 `sseStreamToGenerator`。也可以实现 `ConversationStorage`，提供会话元数据和消息的加载、保存、删除方法。`responseProvider` 仍是请求边界，HttpClient/Observable 桥接不属于当前 API。

### 存储所有权与写入失败

Conversation 和 Skill 的 IndexedDB 实例提供 `close(): Promise<void>`，由创建它们的拥有者调用。先等待 manager 最终保存和正在执行的 Skill 导入/写入，再关闭自有存储；组件解绑不会关闭共享存储，manager.dispose 也不会替调用者关闭它。关闭保留历史，实例关闭后不可复用；需要再次消费时创建新实例。幂等、pending-open、重试和lazy reader边界已有局部验收，最终浏览器资源基线尚未通过。

LocalStorage 写入失败此前只打印日志。本轮调整为保留日志并抛出异常，使保存失败可被发现；manager 的 onPersistenceError、flush/dispose 提供错误观察路径。加载时读取失败返回空值的既有行为保持。业务方应在保存/最终释放入口处理拒绝，修复存储后可显式再次保存；浏览器强制退出无法保证异步保存完成。

### 旧客户端与文本工具

`/core` 同时导出原 `AIClient`、`BaseModelProvider`、`OpenAIProvider`、`formatMessages` 和 `extractTextFromResponse`。这些入口复用根入口的类和函数，不另建 Angular 包装。AIClient 继续是 deprecated 兼容能力，新应用优先使用 responseProvider。

`formatMessages` 沿用旧文本归一化规则，只输出 role、String(content) 和非空 name，丢弃 metadata、tool_calls、tool_call_id 等字段；多模态内容也不会保留。它可接受 core/OpenAI 消息，但返回的 FormattedMessage 不保证可直接用作 OpenAI 请求或核心工具消息。缺少 content 的对象沿用旧 fallback，转为 user/[object Object]。已有根调用签名保持；extractTextFromResponse 可接受 nullable content，返回首个 choice 的文本或空字符串。

core 的 ChatMessage 是 OpenAI 联合类型；旧客户端配套宽松消息类型以 LegacyChatMessage/LegacyChatHistory 等名称导出。不要混淆同名概念或用 cast 隐藏工具消息缺失字段。新出口已通过严格生成声明检查，完整独立版本矩阵仍在验收。

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

- Angular 20/21/22 单会话产物、Zone.js/zoneless smoke 已有阶段证据；修复后的完整多会话、工具/Skill 重载与资源基线仍需验收。
- manager生命周期、Vue共享接入50/50、内置存储错误传播与close局部契约已通过；最终全版本独立消费与浏览器资源仍待收口。
- 最新浏览器资源取消探针发现迟到内容进入历史，根因尚未核实；修复前不能宣称所有工具/Skill取消边界通过。
- 单条updateMessage不覆盖消息列表删除/清空；受控列表更新API等待评审。
- SSR 尚未纳入承诺。
- `responseProvider` 必须响应传入的 `AbortSignal`；永不返回的 Provider 可能让取消或最终释放等待。
- 暂停工具回合的恢复依赖已有消息和回合快照，存储失败时不能保证浏览器退出前完成异步写入。

## 旧 `/core` Vue adapter 路径

2026-10-05 读取 npm 已发布的 `@opentiny/tiny-robot-kit@0.5.1`：`dist/core.mjs` 和 `dist/core.d.ts` 确实导出 `createVueMessageAdapter`，声明还导入 Vue 的 `Ref/ComputedRef`。因此它不是只存在于仓库源码的内部符号，也不能因为仓库文档未使用就断言外部无人使用。

当前改造明确从 `/core` 移除这一导出，保持该入口无 Vue。已有 Vue 业务继续使用根入口的 `useMessage/useConversation`；不新增一个 Vue adapter 根入口导出，也不为 Angular 实现同名工厂。直接组合旧 adapter 的外部高级消费者需单独评估迁移，不在此假设已有对等公开替代路径。

正式版本号与该路径变化的发布方式需要后续评审。当前本地产物仍为开发基线 `0.5.1`，不会覆盖 npm 已发布版本。npm 旧产物 SHA-256：`B77754AA1EFD751C44B2CE7EE93BEB9861826982157E95CD1B12DD18C73DA98D`，registry integrity：`sha512-UhrK2tZOaI4L8A7r8Sy2tyAiNsXFIpM1bATiA3Qxse9KaVU1xpF20bAJMG85PXbWVtrcjptDMQt+LQHtk0GxRg==`。
