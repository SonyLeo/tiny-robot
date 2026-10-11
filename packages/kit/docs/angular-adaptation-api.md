# Kit Angular 适配 API 与迁移说明

本文说明当前 Angular 适配阶段已经实现的公开入口。它面向使用 Angular 组件和服务组合聊天业务的开发者；kit 不提供 Angular 聊天 UI 组件。

> 2026-10-11：共享会话、Vue接入、尾保存、close、core辅助出口和`setMessages`已完成；当前N3候选包Angular20/21/22独立strict/build/TestBed及两模式浏览器通过。工具/Skill/旧格式、Node消费及受控传输负例已有补验，N6最终294/1 skipped与clean pack同hash已核对。本文描述技术验收通过的候选API，尚未发布；旧`/core`Vue adapter路径与LocalStorage写入抛错须按本文迁移说明处理。结果见[完成审核](./angular-adaptation-completion-audit.md)与[P7清单](./angular-adaptation-p7-readiness.md)。

## 安装与入口

以下安装命令面向本次候选产物发布后的消费；目前npm已发布的0.5.1不等同本次同版本号的本地候选包。当前复现须安装[宿主README](../experiments/angular-p7/README.md)所述tgz，不能直接安装注册表旧版来验证Angular能力。

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

在 Angular 服务中优先使用 `injectAngularMessage(options)` 创建自有引擎，或使用 `injectSharedAngularMessage(engine)` 连接应用已经持有的引擎。连接提供 `messages`、`requestState`、派生状态和 `revision` Signal，以及 `sendMessage`、`send`、`abort`、`dispatchCommand`、`setResponseProvider`、`updateMessage` 和 `setMessages` 等动作。

消息对象保持引擎中的对象身份。Angular 普通对象的嵌套原地写入不会单独触发 Signal；业务修改现有消息时使用 `updateMessage(message, recipe)`，OnPush 子组件可读取 `revision()` 作为更新依据。流式和工具状态由引擎通知，组件不需要额外点击或循环调用 `detectChanges()`。

这里的身份规则针对 native/Angular：native adapter 的 `getState()` 复制消息数组容器，消息和嵌套对象仍共享引用，旧状态视图会随后续原地修改变化。Vue adapter 的 `getState()` 则递归转换为普通值；Vue facade 对外提供的 `messages.value` 仍是响应式代理。不能把三者都描述为共享对象视图，也不能把 native 状态当作持久化快照。

### 受控消息列表更新

`setMessages(messages)` 是跨框架推荐的列表调整入口，支持删除、清空、替换和重排。它只替换列表容器，不深拷贝消息；已有消息对象保持身份，新对象按当前 `MessageStateAdapter` 创建。调用会发布一次 `messages` 通知，并由会话管理器按既有自动保存策略处理；需要立即确认写入时调用 `await conversation.flush()` 或 `await conversation.saveMessages()`。

列表更新只允许在 `idle`、`completed`、`aborted` 和 `error` 状态执行。`processing`、`paused` 以及等待工具审批时会拒绝，避免破坏流式助手消息、当前回合和暂停恢复快照。`setMessages([])` 只清空当前引擎的内存消息，不删除会话、不取消后台请求，也不关闭存储；删除会话仍使用 `deleteConversation`。

Angular 的 `messages` 是只读 Signal，但消息数组和对象没有被深度冻结；直接调用 `splice`、`push` 或写嵌套字段不会保证状态通知和自动保存，应通过 `setMessages` / `updateMessage` 修改。Vue 继续保留 `messages.value` 的直接修改兼容行为，同时提供同名 `setMessages` 作为跨框架推荐入口。

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

连接提供 `conversations`、`activeConversationId`、`activeConversation`、`activeEngine` 和 `revision` Signal，并转发 `load`、`createConversation`、`loadMessages`、`switchConversation`、`updateConversationTitle`、`deleteConversation`、`clear`、`saveMessages`、`flush`、`sendMessage`、`send`、`setMessages`、`abort` 和 `dispatchCommand`。

尚无活跃会话时，`sendMessage`、`send` 和 `abort` 返回已完成的 Promise，`setMessages` 不操作引擎；`dispatchCommand` 返回以 `No active conversation` 拒绝的 Promise。业务界面应先完成加载、创建或选择会话。消息和会话连接释放后，操作方法会同步抛出 disposed 错误；重复 `dispose()` 返回同一 Promise。

会话管理器负责引擎隔离、并发加载去重、加载代际、保存队列、节流尾调用和删除顺序。视图销毁只解绑连接，不删除历史，也不终止仍由管理器持有的后台会话。最终释放入口为`manager.dispose()`；核心与同hash三版两模式已验证尾保存和暂停审批整页恢复，内置存储旧格式/重开由Angular20当前包TestBed补验。

## 存储与传输

Angular 从 `/core` 导入 `localStorageStrategyFactory`、`indexedDBStorageStrategyFactory`、`LocalStorageStrategy`、`IndexedDBStrategy`、`handleSSEStream` 和 `sseStreamToGenerator`。也可以实现 `ConversationStorage`，提供会话元数据和消息的加载、保存、删除方法。`responseProvider` 仍是请求边界，HttpClient/Observable 桥接不属于当前 API。

### 存储所有权与写入失败

Conversation和Skill的IndexedDB实例提供`close(): Promise<void>`，由创建它们的拥有者调用。先等待manager最终保存和正在执行的Skill导入/写入，再关闭自有存储；组件解绑不会关闭共享存储，manager.dispose也不会替调用者关闭它。关闭保留历史，实例关闭后不可复用；需要再次消费时创建新实例。幂等、pending-open、重试和lazy reader边界已有契约，内置conversation IDB数据往返使用fake IDB，三版真实浏览器Skill DB与30次销毁资源基线分别验收通过。

LocalStorage 写入失败此前只打印日志。本轮调整为保留日志并抛出异常，使保存失败可被发现；manager 的 onPersistenceError、flush/dispose 提供错误观察路径。加载时读取失败返回空值的既有行为保持。业务方应在保存/最终释放入口处理拒绝，修复存储后可显式再次保存；浏览器强制退出无法保证异步保存完成。

### 旧客户端与文本工具

`/core` 同时导出原 `AIClient`、`BaseModelProvider`、`OpenAIProvider`、`formatMessages` 和 `extractTextFromResponse`。这些入口复用根入口的类和函数，不另建 Angular 包装。AIClient 继续是 deprecated 兼容能力，新应用优先使用 responseProvider。

`formatMessages` 沿用旧文本归一化规则，只输出 role、String(content) 和非空 name，丢弃 metadata、tool_calls、tool_call_id 等字段；多模态内容也不会保留。它可接受 core/OpenAI 消息，但返回的 FormattedMessage 不保证可直接用作 OpenAI 请求或核心工具消息。缺少 content 的对象沿用旧 fallback，转为 user/[object Object]。已有根调用签名保持；extractTextFromResponse 可接受 nullable content，返回首个 choice 的文本或空字符串。

core的ChatMessage是OpenAI联合类型；旧客户端配套宽松消息类型以LegacyChatMessage/LegacyChatHistory等名称导出。不要混淆同名概念或用cast隐藏工具消息缺失字段。新出口已通过严格生成声明检查和三版仓库外消费；宿主不需直接安装openai来补齐kit遗漏的生产类型依赖。

## 从 Vue 迁移

| Vue | Angular |
| --- | --- |
| `useMessage(options)` | `createMessageEngine(nativeAdapter, options)` + `/angular` 连接 |
| `messages.value` | `connection.messages()` |
| `computed` 派生值 | Angular `computed` 或连接提供的派生 Signal |
| `watch`/组件卸载 | 引擎订阅由连接管理，`DestroyRef` 自动解绑 |
| `useConversation(options)` | 应用服务持有 `createConversationManager`，组件使用 `injectAngularConversation` |
| Vue 深度直接修改消息 | Angular 使用 `updateMessage`，保持对象身份并发布通知 |
| Vue 调整 `messages.value` 列表 | Angular 使用受控 `setMessages(messages)`；processing/paused/工具审批期间拒绝 |

Vue 根入口、Vue adapter、旧存储类型和直接修改消息后的深度自动保存继续保持兼容。Angular 入口不复制 Vue `ref`、`watch` 或内部 `createVueMessageAdapter`。

## 当前边界

- Angular20/21/22同hash独立strict/build/TestBed与两模式浏览器通过；受控GitHub404/取消及真实HTTP首块取消由Angular20两模式补验，真实GitHub固定ref成功另列。
- manager、Vue共享规则/直接修改、存储错误/close、工具流式42项和Node消费通过；旧renderContent分别由Angular20内置LocalStorage/IndexedDB迁移→OnPush显示→修改/flush/close/重开补验，不声称21/22重复细分补验。
- `setMessages`核心、Vue/Angular connection、manager与三版打包TestBed通过，证据见完成审核；当前native可变视图及revision语义已确认，不提供深不可变快照。
- 暂无Angular业务评审者，用户接受后续使用中迭代；技术检查不等于业务方认可。
- SSR 尚未纳入承诺。
- `responseProvider` 必须响应传入的 `AbortSignal`；永不返回的 Provider 可能让取消或最终释放等待。
- 暂停工具回合的恢复依赖已有消息和回合快照，存储失败时不能保证浏览器退出前完成异步写入。

## 旧 `/core` Vue adapter 路径

2026-10-05 读取 npm 已发布的 `@opentiny/tiny-robot-kit@0.5.1`：`dist/core.mjs` 和 `dist/core.d.ts` 确实导出 `createVueMessageAdapter`，声明还导入 Vue 的 `Ref/ComputedRef`。因此它不是只存在于仓库源码的内部符号，也不能因为仓库文档未使用就断言外部无人使用。

当前改造明确从 `/core` 移除这一导出，保持该入口无 Vue。已有 Vue 业务继续使用根入口的 `useMessage/useConversation`；不新增一个 Vue adapter 根入口导出，也不为 Angular 实现同名工厂。直接组合旧 adapter 的外部高级消费者需单独评估迁移，不在此假设已有对等公开替代路径。

正式版本号与该路径变化的发布方式需要后续评审。当前本地产物仍为开发基线 `0.5.1`，不会覆盖 npm 已发布版本。npm 旧产物 SHA-256：`B77754AA1EFD751C44B2CE7EE93BEB9861826982157E95CD1B12DD18C73DA98D`，registry integrity：`sha512-UhrK2tZOaI4L8A7r8Sy2tyAiNsXFIpM1bATiA3Qxse9KaVU1xpF20bAJMG85PXbWVtrcjptDMQt+LQHtk0GxRg==`。
