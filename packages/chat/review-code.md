# Chat 代码检视报告

检视范围：`packages/chat/src`、`packages/chat/tests`、`packages/test/src/chat`

---

## 一、功能缺陷

### B1. sender.send 不传 attachments

`createRuntimeFromConfig.ts` 中 `createSenderRuntimeFromChatKit` 的 `send()` 调用了 `chatKit.sendMessage(payload.text)`，但 `chatKit.sendMessage` 只接受 `string`。`payload.attachments` 和 `payload.modelId` 被完全忽略。

```ts
// createRuntimeFromConfig.ts:280
chatKit.sendMessage(payload.text)  // ← attachments、modelId 丢失
```

通过 config 路径创建的 runtime，附件只在 UI 上展示，发送时不会随消息传出。`modelId` 也没有传递给底层 engine，虽然 model switch 通过 `updateResponseProvider` 间接生效，但 `ChatSendInput.modelId` 的语义被破坏了。

### B2. chatUiContext 中 display 赋值逻辑无效

```ts
// chatUiContext.ts:250
display.value = mobile ? 'drawer' : 'drawer'
```

两个分支返回相同的值。如果这是有意为之（始终 drawer），那三元表达式是多余的；如果不是，桌面端应该有不同的 display mode。

### B3. ChatDefaultBodyRegion 的 after slot 和 feedback 冲突

当 `showFeedback` 为 true 时，`ChatDefaultBodyRegion` 在 `ChatMessageList` 的 `#after` slot 中渲染 `ChatFeedback`。但如果用户同时通过 `TrChatPage` 的 `#after` slot 传入了自定义内容，`bubbleSlotNames` 会包含 `after`，导致：

```vue
<!-- ChatDefaultBodyRegion.vue -->
<template v-for="name in props.bubbleSlotNames" #[name]="slotProps" :key="name">
  <slot :name="name" v-bind="slotProps ?? {}" />
</template>
<template v-if="resolvedShowFeedback" #after="slotProps">
  <ChatFeedback v-bind="slotProps" />
</template>
```

Vue 的 template 中同名 slot 后者覆盖前者，所以用户的 `#after` slot 会被内置的 feedback 覆盖。用户无法同时使用 `#after` slot 和内置 feedback。

---

## 二、内存与生命周期问题

### M1. effectScope 泄漏

`createRuntimeFromConfig` 使用 `effectScope(true)` 创建 detached scope，但没有暴露 `scope.stop()`。`useTrChatConfigRuntimeResolution` 在 config 变化时直接覆盖 `runtimeResolutionRef`，旧 runtime 的 scope 无法回收。

### M2. ChatProvider 在 setup 中直接执行不可恢复的副作用

`ChatProvider.vue` 在 `<script setup>` 中直接调用 `resolveProviderRuntime`（内部调用 `useChatKit`）。如果 props 验证失败（同时传了 `transportAdapter` 和 `responseProvider`），会在 setup 阶段直接抛错，导致整个组件树崩溃，没有错误边界。

### M3. useFloatingDropdown 的 autoUpdate 清理时机

`useFloatingDropdown` 在 `watch(isOpen)` 中启动 `autoUpdate`，在 `onScopeDispose` 中清理。但如果 `isOpen` 在 scope dispose 之前变为 false 又变为 true，`startAutoUpdate` 会被调用两次而 `cleanupAutoUpdate` 只保存最后一个，导致第一个 autoUpdate 泄漏。虽然当前 `stopAutoUpdate` 在 `startAutoUpdate` 之前被调用了（通过 `watch` 的 `newVal` 判断），但这个逻辑依赖 watch 的同步执行顺序，比较脆弱。

---

## 三、架构问题

### A1. 双轨运行时并存

叶子组件同时 inject `CHAT_RUNTIME_KEY` 和 `CHAT_KIT_KEY`，优先用前者，fallback 到后者。`createRootBootstrapState.ts` 的 `createFallbackChatKit` 把 `ChatRuntime` 降级翻译回 `UseChatKitReturn`。

受影响组件：`ChatSender`、`ChatHeader`、`ChatMessageList`、`ChatDefaultBodyRegion`、`ChatDefaultFooterRegion`、`ErrorRenderer`、`EditInputRenderer`、`ChatFeedback`、`ChatHistoryList`、`ChatHistoryNewSession`、`ChatHistoryPanel`、`ChatWorkspaceSidebarRail`。

### A2. TrChatPage 模板重复

workspace 和非 workspace 两个分支的模板几乎完全相同（`ChatLayout` → 三个 Region），约 80 行重复。

### A3. ThemeProvider 条件包裹导致的系统性模板重复

`WorkspaceShell.vue`（~80 行重复）、`ChatWorkspaceLeftSheet.vue`、`ChatWorkspaceRightSheet.vue`、`ChatHistory.vue`、`ChatLayout.vue` 都有相同的模式：`v-if="useScopedThemeProvider"` 包裹 `ThemeProvider`，`v-else` 重复整段模板。建议抽取 `ConditionalThemeProvider` wrapper。

### A4. ChatDefaultRenderer 是一个纯透传组件

`ChatDefaultRenderer.vue` 只是把 slots 透传给 `TrChatPage`，没有任何额外逻辑。它的存在增加了一层不必要的组件嵌套。

### A5. TrChatConfigEntryInput 重复定义

在 `types/root.ts`（第 218 行）和 `types/ui.ts`（第 95 行）各定义了一次，类型相同但是两个独立定义。

---

## 四、类型与接口问题

### I1. ChatTransportAdapter 是 ResponseProvider 的纯别名

```ts
export type ChatTransportAdapter = ResponseProvider
```

两个 prop（`transportAdapter` / `responseProvider`）接受完全相同的类型，union type 在类型层面没有实际区分能力。

### I2. normalizeRuntime 的 createDefaultMessageRuntime 中 edit 操作是空实现

当用户通过 `TrChat.Root` 传入自定义 runtime 但没有提供 `message` 模块时，`startEdit`、`cancelEdit`、`commitEdit` 都是空函数或返回 false。编辑功能会静默失败，没有任何警告。

### I3. ChatHistoryList 使用 syncRef 但方向固定为 ltr

```ts
const historyData = ref<HistoryItem[]>([])
syncRef(filteredHistoryData, historyData, { direction: 'ltr' })
```

`syncRef` 在这里只做单向同步，等价于 `watchEffect(() => { historyData.value = filteredHistoryData.value })`。引入 `@vueuse/core` 的 `syncRef` 增加了不必要的认知成本。

### I4. McpTrigger 的 label 默认值是硬编码中文

```ts
const props = withDefaults(defineProps<{ label?: string }>(), {
  label: '扩展',
})
```

但 `triggerTitle` 的计算又拼接了中文：`已激活 ${activeCount.value} 个插件`。这些应该走 `chatMessages` 体系。

### I5. ChatMcpPanel 中硬编码中文

```vue
<span>添加新插件</span>
<h3>安装更多插件</h3>
```

这些文案没有走 `chatMessages` 体系，无法被 `ChatMessagesOverrides` 覆盖。

### I6. ChatWorkspaceRightEmpty 中硬编码中文

```vue
<strong>暂无扩展内容</strong>
<span>后续可在此查看文件、链接或扩展结果。</span>
```

同样没有走 `chatMessages` 体系。

### I7. ChatWorkspaceSidebarShell 的 actionLabel 是硬编码英文

```ts
const actionLabel = computed(() => (props.mobile ? 'Close sidebar' : 'Collapse sidebar'))
```

和其他组件的中文默认值不一致，也没有走 `chatMessages` 体系。

---

## 五、代码质量问题

### Q1. useDefaultBubbleConfig 在每次调用时重新创建 VNode

```ts
const roles = {
  assistant: {
    avatar: h(IconAi, { style: { fontSize: '32px' } }),  // ← 每次调用都创建新 VNode
    // ...
  },
}
```

这些 VNode 没有被缓存或 `markRaw`，可能导致不必要的响应式追踪和重渲染。

### Q2. ChatHistoryPanel 的批量删除是串行的

```ts
async function handleBatchDelete() {
  for (const itemId of historyState.selectedItems.value) {
    await chatKit.deleteConversation(itemId)  // ← 串行等待每个删除
  }
}
```

如果有 10 个会话要删除，每个删除操作都要等前一个完成。应该用 `Promise.all` 或至少提供并行选项。

### Q3. ChatHistoryList 的 item.id 使用了非空断言

```ts
await chatKit.switchConversation(item.id!)
chatKit.updateConversationTitle(item.id!, newTitle)
historyState.toggleItemSelection(item.id!)
```

多处使用 `item.id!`，但 `HistoryItem` 的 `id` 类型可能是 `string | undefined`。如果 id 确实可能为空，这些操作会传入 `undefined`。

### Q4. EditInputRenderer 中 chatKit 使用了非空断言但可能为 null

```ts
const chatKit = inject<UseChatKitReturn>(CHAT_KIT_KEY)
// ...
chatKit!.messages.value.findIndex(...)  // ← 如果 chatKit 为 null 会崩溃
chatKit!.cancelEditMessage(messageIndex)
chatKit!.editMessage(messageIndex, localContent.value)
```

虽然在正常使用中 `CHAT_KIT_KEY` 总是被提供的，但 inject 没有默认值，如果组件在错误的上下文中使用会直接崩溃。

### Q5. ToolCallRenderer 中 attrs 的使用方式

```ts
const attrs = useAttrs()
// ...
<div class="markstream-vue" v-bind="attrs">
```

`inheritAttrs: false` + `v-bind="attrs"` 是正确的模式，但 `attrs` 可能包含 `class` 和 `style`，会和 `class="markstream-vue"` 合并。如果父组件传了 `class`，可能导致意外的样式覆盖。

---

## 六、单元测试问题

### T1. 自定义测试框架缺乏标准化

使用自定义 `_harness.mjs`（基于 `node:assert`），没有 `describe/it` 结构、`beforeEach/afterEach` 生命周期、coverage 支持、watch 模式、并行执行能力。

### T2. 测试间缺乏隔离

多个测试共享同一个模块导入（通过 `_helpers.mjs` 中的 jiti），Vue 响应式系统的 effect scope 可能在测试间泄漏。

### T3. localStorage 未 mock 导致测试噪音

`renderMountedProviderLeafComposition` 和 `useChatConversation` 的部分测试会触发 `localStorage is not defined` 错误。说明 `TrChat.Provider` 路径在不传 `storage` 时默认使用 `localStorageStrategy`，在 SSR/Node 环境下会崩溃。

### T4. public-surface.test.mjs 是源码字符串匹配（约 300+ 行）

通过 `readFileSync` 读取源码，用 `string.includes()` 做断言。对代码格式敏感，不能验证运行时行为，维护成本高。这是整个测试套件中最脆弱的部分。

### T5. workspace-slot-contract.test.mjs、appearance-runtime.test.mjs 同样是字符串匹配

和 T4 同样的问题。这类"合同测试"应该通过类型检查或运行时断言来验证。

### T6. 集成测试依赖 SSR 渲染的 HTML 字符串匹配

`root-page-mounted.test.mjs` 通过 `renderToString` + `html.includes()` 做断言。对 HTML 输出格式敏感，依赖 stub 组件的 `data-testid` 输出格式。

### T7. fetch mock 没有统一封装

`root-runtime.test.mjs` 中 6 个测试手动 mock `globalThis.fetch`，每个都有 30-50 行重复的 SSE 响应构造代码。应该抽取 `createMockFetch` 工具。

### T8. 缺少关键场景的测试覆盖

| 缺失场景 | 对应问题 |
|---|---|
| sender.send 传递 attachments | B1 |
| sender.send 传递 modelId | B1 |
| effectScope 清理 | M1 |
| beforeSend 返回 false 取消发送 | 功能边界 |
| afterReceive 的执行时机（在 createRuntimeFromConfig 路径） | 功能边界 |
| workspace 响应式断点切换 | 功能边界 |
| history management mode（搜索、批量选择、批量删除） | 功能边界 |
| MCP tool call 完整流程 | 功能边界 |
| model selector 键盘导航 | 功能边界 |
| ChatProvider 同时传 transportAdapter 和 responseProvider 的错误处理 | M2 |
| config 变化时旧 runtime 的清理 | M1 |

### T9. message-actions.test.mjs 中 runtime mock 过于手工

测试中手动构造了完整的 runtime mock 对象（约 30 行），每个测试都重复类似的结构。应该抽取 `createMockRuntime` 工厂函数。

### T10. trchat-config-entry.test.mjs 和 trchat-config-runtime-resolution.test.mjs 的测试名称过长

测试名称如 `useTrChatConfigRuntimeResolution keeps the current runtime when the target config is replaced with an equivalent value` 超过 100 字符，在终端输出中难以阅读。

---

## 七、E2E 测试问题

### E1. mockProvider 延迟导致测试缓慢

每个字符 25ms 延迟 + 300ms 初始延迟，一条 50 字符回复需要 ~1.5 秒。多轮对话测试会显著拖慢。

### E2. 硬编码中文选择器

```ts
historyBtn: '[title="打开历史"], [title="关闭历史"]',
newChatBtn: '[title="新建对话"]',
```

如果默认文案变化，所有选择器失效。应优先使用 `data-testid`。

### E3. testHelper 中使用硬编码等待

```ts
await page.waitForTimeout(300) // 等待 Drawer 动画
```

在 CI 环境中不稳定。应等待 CSS transition 完成或 DOM 状态变化。

### E4. openChatSmokeScene 的导航定位脆弱

```ts
await page.locator('nav').getByRole('link').nth(2).click()
```

依赖导航链接的顺序位置。

### E5. 缺少错误场景的 E2E 覆盖

- 网络错误后的 retry UI 流程
- 流式传输中断后的 UI 状态恢复
- 并发发送的处理

### E6. 场景组件样式硬编码

多个场景使用 `height: calc(100vh - 100px)`，假设了特定页面布局。

### E7. mockChatApiPlugin 的使用不透明

`mockChatApiPlugin.ts` 导出了 Vite 插件用于拦截 `/api/openai`，但从场景代码看不出它是否被正确引用。如果没有被引用，e2e 测试可能依赖外部 API 或静默失败。

---

## 八、国际化问题汇总

以下位置存在硬编码文案，没有走 `chatMessages` 体系：

| 文件 | 内容 | 语言 |
|---|---|---|
| `McpTrigger.vue` | `label: '扩展'`、`已激活 X 个插件` | 中文 |
| `ChatMcpPanel.vue` | `添加新插件`、`安装更多插件` | 中文 |
| `ChatWorkspaceRightEmpty.vue` | `暂无扩展内容`、`后续可在此查看...` | 中文 |
| `ChatWorkspaceSidebarShell.vue` | `Close sidebar`、`Collapse sidebar` | 英文 |
| `shared/messages/index.ts` | 所有默认文案 | 中文 |

中英文混用，且部分文案无法被 `ChatMessagesOverrides` 覆盖。

---

## 九、按优先级排序

### 必须修复

1. **B1** sender.send 不传 attachments — 功能性 bug
2. **M1** effectScope 泄漏 — 内存泄漏
3. **B3** after slot 和 feedback 冲突 — 用户无法同时使用

### 应该修复

4. **B2** chatUiContext display 重复赋值 — 疑似 bug
5. **A2+A3** 模板重复（TrChatPage + ThemeProvider 模式） — 维护负担
6. **I4+I5+I6+I7** 硬编码文案未走 chatMessages — 国际化缺陷
7. **T3** Provider 路径 SSR 下 localStorage 崩溃 — 环境兼容性
8. **T8** 关键场景测试缺失 — 覆盖率缺口

### 建议改进

9. **A1** 双轨运行时统一 — 降低架构复杂度
10. **T4+T5** 源码字符串匹配测试 — 降低维护成本
11. **T7** fetch mock 统一封装 — 降低测试维护成本
12. **E2** E2E 选择器从中文 title 迁移到 data-testid — 提高稳定性
13. **Q2** 批量删除串行改并行 — 用户体验
14. **I2** 默认 message runtime 空实现加警告 — 开发体验
