# TinyRobot Chat MVP 实施方案

## 1. MVP 目标

MVP 只验证 chat 套件架构是否成立，不追求完整功能。

核心验证：

- `runtime` 能否作为唯一数据与动作协议。
- `parts` 能否作为组件级 UI 配置协议。
- 黑盒入口 `<TrChat />` 与白盒入口 `<TrChat.Root + TrChat.* />` 能否共享同一套 `runtime + parts`。
- `kit` 能否作为官方 managed runtime core。
- 外部用户已有 runtime 时，能否只接入 chat UI。

MVP 只接入：

- `TrLayout`
- `TrHistory`
- `TrBubbleProvider`
- `TrBubbleList`
- `TrWelcome`
- `TrPrompts`
- `TrSender`

MVP 暂不接入：

- 附件、上传、语音。
- 反馈、复制、重新生成。
- MCP / tool calling 的专用 UI。
- 新 transport 协议。
- 新消息模型。
- 新 renderer 体系。

## 2. 预期目录

```text
packages/chat/
  package.json
  AGENTS.md
  architecture.md
  mvp-plan.md
  src/
    index.ts
    Chat.vue
    Root.vue
    context.ts
    types.ts
    styles.css
    composables/
      useChatContext.ts
      useKitChatRuntime.ts
      useManagedChatRuntime.ts
    components/
      Composer.vue
      Conversations.vue
      Header.vue
      Messages.vue
    __tests__/
      chat-runtime.types.test-d.ts
      external-runtime.spec.ts
      managed-runtime.spec.ts
  demos/
    basic.vue
    external-runtime.vue
    white-box.vue
```

目录约束：

- `src/types.ts` 只放公共协议类型。
- `src/context.ts` 只定义 `InjectionKey` 与 context 结构。
- `src/composables/useChatContext.ts` 只负责读取 context。
- `src/composables/useKitChatRuntime.ts` 只做 `kit -> ChatRuntime` 映射。
- `src/composables/useManagedChatRuntime.ts` 只补齐 chat 应用层行为。
- `src/components/*` 只做区域组件到原子组件的映射，不直接依赖 `kit` 返回结构。
- `demos/basic.vue` 验证黑盒入口。
- `demos/white-box.vue` 验证白盒入口。
- `demos/external-runtime.vue` 验证外部 runtime 只接 UI。

## 3. 阶段 1：包结构与公共协议

目标：建立 `@opentiny/tiny-robot-chat` 的最小包结构，先约束协议，不写复杂 UI。

实现内容：

- 新增 `src/index.ts`。
- 新增 `src/types.ts`。
- 新增 `src/context.ts`。
- 新增 `src/composables/useChatContext.ts`。
- 定义 `ChatRuntime`。
- 定义 `ChatParts`。
- 定义 `ChatSubmitPayload`。
- 定义 `ChatConversationItem`。
- 定义 `ChatMessageItem`。
- 定义 `chatRuntimeKey / chatPartsKey`。
- 暂不接 `kit`。
- 暂不写 `TrChat`。

验证点：

- 类型协议是否足够驱动 `Sender / BubbleList / History / Welcome / Prompts`。
- `runtime` 是否只暴露只读 state + actions。
- `parts` 是否没有包含 runtime 接管字段。

验证方案：

- 执行 chat 包类型检查。
- 写类型用例，确认 `parts.composer.sender` 不能配置 `modelValue / defaultValue / loading / disabled`。
- 写类型用例，确认 `parts.messages.bubbleList` 不能配置 `messages`。
- 写类型用例，确认 `parts.conversations.history` 不能配置 `data / selected`。

通过标准：

- 类型可导出。
- 不依赖内部实现。
- 没有新增消息模型、会话模型、transport 协议。

## 4. 阶段 2：Root 与 Context

目标：验证白盒入口的根基，`TrChat.Root` 可以向任意子区域提供同一份 `runtime + parts`。

实现内容：

- 新增 `src/Root.vue`。
- `Root` 接收 `runtime`。
- `Root` 接收 `parts`。
- `Root` provide `runtime / parts`。
- `Root` 渲染默认 slot。
- `Root` 不内置 `TrLayout`。
- `Root` 不创建 managed runtime。

验证点：

- 白盒拼装是否成立。
- 子组件是否能稳定读取同一份 `runtime + parts`。
- `Root` 是否没有变成巨型映射层。

验证方案：

```vue
<TrChat.Root :runtime="runtime" :parts="parts">
  <DebugChild />
</TrChat.Root>
```

`DebugChild` 内部调用 `useChatContext()`，读取 `runtime.messages.items` 和 `parts.messages`。

通过标准：

- 子组件能读到 context。
- `Root` 不依赖 `TrLayout`。
- `Root` 不创建 runtime。
- `Root` 不直接操作消息、会话、输入状态。

## 5. 阶段 3：Composer

目标：先打通最核心事件流：输入、提交、取消。

实现内容：

- 新增 `src/components/Composer.vue`。
- 内部使用 `TrSender`。
- `runtime.composer.inputValue -> TrSender.modelValue`。
- `runtime.actions.setInputValue -> update:modelValue`。
- `runtime.composer.loading -> TrSender.loading`。
- `runtime.composer.disabled -> TrSender.disabled`。
- `runtime.composer.submitDisabled -> TrSender.defaultActions.submit.disabled`。
- `submit -> runtime.actions.send({ text, structuredData })`。
- `cancel -> runtime.actions.abort`。
- `parts.composer.sender` 透传给 `TrSender`。

验证点：

- 输入状态是否完全由 runtime 管理。
- `Sender` 原有 props 是否没有被改写。
- `structuredData` 是否能原样进入 runtime。
- `loading` 时 `cancel` 是否能触发 `abort`。

验证方案：

- 使用 external mock runtime 渲染 `Composer`。
- 输入 `hello` 后确认 `setInputValue('hello')` 被调用。
- 提交后确认 `send({ text: 'hello' })` 被调用。
- 设置 `loading=true` 后触发取消，确认 `abort()` 被调用。
- 设置 `submitDisabled=true` 后确认提交按钮不可用。

通过标准：

- `Composer` 不维护自己的输入源。
- `Composer` 不直接修改 `runtime.composer.inputValue`。
- 所有变更只走 `runtime.actions`。

## 6. 阶段 4：Messages

目标：打通消息展示、空状态和快捷提示。

实现内容：

- 新增 `src/components/Messages.vue`。
- 内部使用 `TrWelcome`。
- 内部使用 `TrPrompts`。
- 内部使用 `TrBubbleProvider`。
- 内部使用 `TrBubbleList`。
- `runtime.messages.items -> TrBubbleList.messages`。
- `parts.messages.bubbleProvider -> TrBubbleProvider`。
- `parts.messages.bubbleList -> TrBubbleList`。
- `parts.messages.welcome -> TrWelcome`。
- `parts.messages.prompts -> TrPrompts`。
- 无消息时显示 `Welcome + Prompts`。
- 有消息时显示 `BubbleList`。
- `Prompts.item-click` MVP 默认调用 `runtime.actions.setInputValue(item.label)`。

验证点：

- 消息来源是否只有 `runtime.messages.items`。
- 空状态是否独立于消息列表。
- `parts` 是否能透传 Bubble、Welcome、Prompts 配置。
- Prompts 是否不引入新业务状态。

验证方案：

- `messages=[]` 时显示 `Welcome + Prompts`。
- `messages=[user, assistant]` 时显示 `BubbleList`，不显示 `Welcome`。
- 点击 Prompt 后确认 `setInputValue(prompt.label)` 被调用。
- 修改 `parts.messages.bubbleList.roleConfigs` 后确认消息角色样式生效。

通过标准：

- `Messages` 不发请求。
- `Messages` 不创建消息。
- `Messages` 不定义新的 renderer 协议。
- Bubble 渲染仍使用现有 `BubbleProvider / BubbleList`。

## 7. 阶段 5：Conversations 与 Header

目标：补齐多会话最小闭环。

实现内容：

- 新增 `src/components/Conversations.vue`。
- 内部使用 `TrHistory`。
- `runtime.conversations.items -> TrHistory.data`。
- `runtime.conversations.currentId -> TrHistory.selected`。
- `item-click -> runtime.actions.switchConversation`。
- `item-title-change -> runtime.actions.renameConversation`。
- `item-action(delete) -> runtime.actions.deleteConversation`。
- 新增 `src/components/Header.vue`。
- `Header` 只显示标题。
- `Header` 在存在 `createConversation` 时显示新建按钮。

验证点：

- `History` 是否只消费 runtime conversations。
- 没有 `runtime.conversations` 时是否可降级。
- `menuItems` 是否根据 actions 自动收敛。
- `Header` 是否不管理 layout 状态。

验证方案：

- 点击历史项后确认 `switchConversation(id)` 被调用。
- 重命名后确认 `renameConversation(id, title)` 被调用。
- 删除后确认 `deleteConversation(id)` 被调用。
- 点击新建后确认 `createConversation()` 被调用。
- 移除 `renameConversation / deleteConversation` 后确认对应菜单项不出现。

通过标准：

- `History.data / selected` 不允许从 `parts` 覆盖。
- `createConversation` 不塞进 `History`。
- 无 conversations 时组件不报错。

## 8. 阶段 6：TrChat 黑盒装配

目标：验证黑盒入口和白盒入口共享同一套 `runtime + parts`。

实现内容：

- 新增 `src/Chat.vue`。
- 默认使用 `TrLayout` 装配 `Conversations / Header / Messages / Composer`。
- `parts.layout` 透传给 `TrLayout`。
- 支持 `header / left-aside / main / footer` 区域 slots。
- `index.ts` 挂载 `TrChat.Root / Header / Conversations / Messages / Composer`。
- 同时保留具名导出。

默认结构：

```text
TrChat
  -> TrChat.Root
    -> TrLayout
      -> left-aside: TrChat.Conversations
      -> header: TrChat.Header
      -> main: TrChat.Messages
      -> footer: TrChat.Composer
```

验证点：

- 黑盒和白盒配置能力是否一致。
- `parts` 在两种入口下是否表现一致。
- slot 是否能替换区域，但不破坏 runtime 协议。

验证方案：

黑盒 demo：

```vue
<TrChat :runtime="runtime" :parts="parts" />
```

白盒 demo：

```vue
<TrChat.Root :runtime="runtime" :parts="parts">
  <TrLayout v-bind="parts.layout">
    <template #left-aside>
      <TrChat.Conversations />
    </template>
    <template #main>
      <TrChat.Messages />
    </template>
    <template #footer>
      <TrChat.Composer />
    </template>
  </TrLayout>
</TrChat.Root>
```

对比验证：

- 消息展示一致。
- 输入提交一致。
- Prompts 行为一致。
- History 切换一致。
- `parts` 配置效果一致。

通过标准：

- 黑盒只是默认装配，不拥有额外能力。
- 白盒能复用同一套 `parts`。
- 用户下沉到原子组件时没有被阻断。

## 9. 阶段 7：接入 Managed Runtime

目标：验证 `kit` 可以作为官方 runtime core。

实现内容：

- 新增 `src/composables/useKitChatRuntime.ts`。
- 新增 `src/composables/useManagedChatRuntime.ts`。
- 基于 `useConversation + useMessage` 组合 `ChatRuntime`。
- 补齐 `inputValue`。
- 补齐 `submitDisabled`。
- 补齐首次发送自动建会话。
- 补齐 title fallback。
- 补齐 `lastError`。

验证点：

- `kit` 生命周期是否能映射到 `ChatRuntime`。
- 发送、流式、取消是否正常。
- 会话切换后消息是否更新。
- external runtime 能力是否没有被破坏。

验证方案：

- 用 mock `responseProvider` 流式返回内容。
- 首次发送前没有会话时，自动创建会话。
- 用户消息进入 `BubbleList`。
- assistant 消息能流式更新。
- `loading` 时 `Sender` 显示取消行为。
- cancel 后调用 `kit` abort。
- 切换会话后消息列表变化。
- 外部 runtime demo 继续可用。

通过标准：

- `chat` 不新增 transport。
- `chat` 不复制 `kit` 的 stream / abort 生命周期。
- external runtime demo 仍然能工作。

## 10. MVP 总验收清单

- 没有修改原子组件已有 props。
- runtime state 只读，变更只走 actions。
- `parts` 只负责 UI 配置，不接管数据源字段。
- 黑盒和白盒共享同一套协议。
- `kit` 只在 managed runtime 层出现，UI 组件不直接依赖 `kit` 返回结构。
- MVP 能覆盖发送、取消、消息渲染、空状态、Prompt 回填、会话切换、黑盒装配、白盒装配。

## 11. E2E 验证注意

任何 e2e / Playwright 测试前必须先构建 components 包。

重新构建 components 后，最好重启测试服务，避免旧服务复用缓存影响判断。

推荐流程：

```text
pnpm build:components
重启测试服务
pnpm -F tiny-robot-test test
```
