# Chat 重构执行计划

基于 `review-code.md` 和 `review-structure.md` 的检视结论，统一执行计划。

验证命令：
- type-check: `pnpm -F @opentiny/tiny-robot-chat type-check`
- unit test: `pnpm -F @opentiny/tiny-robot-chat test`
- build: `pnpm -F @opentiny/tiny-robot-chat build`
- e2e smoke: `pnpm -F tiny-robot-test test:chat:smoke`
- e2e scenario: `pnpm -F tiny-robot-test test:chat:scenario`

每个阶段完成后必须运行以上五个命令，全部通过才能进入下一阶段。

e2e 测试需要先启动 dev server（`pnpm -F tiny-robot-test dev`），再在另一个终端运行测试命令。如果本地 worker 不稳定，改用 `:full` 变体（`test:chat:smoke:full` / `test:chat:scenario:full`，4 workers）。

---

## 阶段 1：修复功能缺陷和关键 bug

目标：修复所有影响用户的功能性问题，不改变目录结构。

### 1.1 修复 sender.send 不传 attachments（B1）

- [x] 将 `sendMessage(content)` 扩展为 `sendMessage(content, options?: { attachments? })` 统一签名，消除独立的 `sendMessageWithAttachments` 方法
- [x] 修改 `useChatConversation`：合并两个发送方法，内部根据 attachments 选择 `engine.sendMessage` 或 `engine.send`
- [x] 修改 `useChatKit`：`resendMessage` 透传 attachments，所有发送路径统一走 `resendMessage → markOptimisticTurn`，修复带附件发送时跳过 optimistic 标记的 bug
- [x] 修改 `createRuntimeFromConfig.ts` 中 `createSenderRuntimeFromChatKit` 的 `send()` 方法，调用统一的 `chatKit.sendMessage`
- [x] 更新 `public-surface.test.mjs` 合同断言
- [x] `pnpm -F @opentiny/tiny-robot-chat type-check`
- [x] `pnpm -F @opentiny/tiny-robot-chat test`
- [x] `pnpm -F tiny-robot-test test:chat:smoke`（附件上传和发送流程）

### 1.2 修复 effectScope 泄漏（M1）

- [x] 修改 `createRuntimeFromConfig` 返回值，增加 `dispose()` 方法暴露 `scope.stop()`
- [x] 修改 `useTrChatConfigRuntimeResolution`，在 config 变化时调用旧 runtime 的 `dispose()`
- [x] 修改 `CreateRuntimeFromConfigResult` 类型定义，增加 `dispose` 字段
- [x] `pnpm -F @opentiny/tiny-robot-chat type-check`
- [x] `pnpm -F @opentiny/tiny-robot-chat test`

### 1.3 修复 after slot 和 feedback 冲突（B3）

- [x] 修改 `ChatDefaultBodyRegion.vue`，当用户提供了 `#after` slot 时，将 `ChatFeedback` 追加在用户内容之后，而不是覆盖
- [x] `pnpm -F @opentiny/tiny-robot-chat type-check`
- [x] `pnpm -F @opentiny/tiny-robot-chat test`
- [x] `pnpm -F tiny-robot-test test:chat:smoke`（feedback 渲染）

### 1.4 补全 ChatSender 的 footer slot 类型（B4）

- [x] 在 `TrChatSenderSlots`（`types/ui.ts`）中补充 `footer` slot 的类型声明
- [x] 确认 `ChatSender.vue` 中 `footer` slot 的透传路径正确（通过 `forwardedSlots` 隐式透传）
- [x] `pnpm -F @opentiny/tiny-robot-chat type-check`
- [x] `pnpm -F @opentiny/tiny-robot-chat test`

### 1.5 修复 chatUiContext display 重复赋值（B2）

- [x] 修改 `chatUiContext.ts` 中 `display.value = mobile ? 'drawer' : 'drawer'`，简化为 `display.value = 'drawer'`
- [x] `pnpm -F @opentiny/tiny-robot-chat type-check`
- [x] `pnpm -F @opentiny/tiny-robot-chat test`

### 1.6 修复 chat.md 重复文字（D1）

- [x] 修复第 89 行和第 99 行的"适合适合"重复

**阶段 1 完整验证：**
- [x] `pnpm -F @opentiny/tiny-robot-chat type-check`
- [x] `pnpm -F @opentiny/tiny-robot-chat test`
- [x] `pnpm -F @opentiny/tiny-robot-chat build`
- [x] `pnpm -F tiny-robot-test test:chat:smoke`
- [x] `pnpm -F tiny-robot-test test:chat:scenario`

---

## 阶段 2：命名对齐和国际化

目标：统一代码和文档的命名，收拢硬编码文案。

### 2.1 ui.copy → ui.labels 命名对齐（D2）

- [x] 已在之前的重构中完成，`TrChatRootUiConfig.labels` 已存在，`createRootBootstrapState` 和 `createRuntimeFromConfig` 均已使用 `labels`

### 2.2 硬编码文案收拢到 chatMessages（I4-I7）

- [x] 在 `types/ui.ts` 的 `ChatMessages` 中新增 `mcp` 和 `sidebar` 分组
- [x] 在 `shared/messages/index.ts` 中新增对应默认值，并更新 `resolveChatMessages`
- [x] `McpTrigger.vue`：`label` 默认值和 `triggerTitle` 改为读 `chatMessages.mcp`
- [x] `ChatMcpPanel.vue`：`添加新插件`、`安装更多插件` 改为读 `chatMessages.mcp`
- [x] `ChatWorkspaceRightEmpty.vue`：`暂无扩展内容`、`后续可在此查看...` 改为读 `chatMessages.sidebar`
- [x] `ChatWorkspaceSidebarShell.vue`：`Close sidebar`、`Collapse sidebar` 改为读 `chatMessages.sidebar`
- [x] `pnpm -F @opentiny/tiny-robot-chat type-check`
- [x] `pnpm -F @opentiny/tiny-robot-chat test`

### 2.3 修复 TrChatConfigEntryInput 重复定义（A5）

- [x] 删除 `types/ui.ts` 中的 `TrChatConfigEntryInput` 本地定义
- [x] 让 `types/ui.ts` 从 `types/root.ts` 导入该类型
- [x] 更新 `public-surface.test.mjs` 中对应的字符串匹配断言
- [x] `pnpm -F @opentiny/tiny-robot-chat type-check`
- [x] `pnpm -F @opentiny/tiny-robot-chat test`

**阶段 2 完整验证：**
- [x] `pnpm -F @opentiny/tiny-robot-chat type-check`
- [x] `pnpm -F @opentiny/tiny-robot-chat test`
- [x] `pnpm -F @opentiny/tiny-robot-chat build`
- [x] `pnpm -F tiny-robot-test test:chat:smoke`
- [x] `pnpm -F tiny-robot-test test:chat:scenario`

---

## 阶段 3：模板去重

目标：消除系统性的模板重复，降低维护成本。

### 3.1 抽取 ConditionalThemeProvider 组件（A3）

- [x] 创建 `components/shared/ConditionalThemeProvider.vue`，封装 `v-if ThemeProvider / v-else` 的条件包裹模式
- [x] 重构 `WorkspaceShell.vue`，使用 `ConditionalThemeProvider` 消除 ~80 行模板重复
- [x] 重构 `ChatWorkspaceLeftSheet.vue`，使用 `ConditionalThemeProvider`
- [x] 重构 `ChatWorkspaceRightSheet.vue`，使用 `ConditionalThemeProvider`
- [x] 重构 `ChatHistory.vue`，使用 `ConditionalThemeProvider`
- [x] 重构 `ChatLayout.vue`，使用 `ConditionalThemeProvider`
- [x] 更新 `appearance-runtime.test.mjs` 合同测试，指向 `ConditionalThemeProvider`
- [x] `pnpm -F @opentiny/tiny-robot-chat type-check`
- [x] `pnpm -F @opentiny/tiny-robot-chat test`
- [x] `pnpm -F tiny-robot-test test:chat:smoke`（主题切换、workspace 布局）

### 3.2 消除 TrChatPage 模板重复（A2）

- [x] 创建 `ChatPageContent.vue` 内部组件，封装 `ChatLayout` + 三个 Region 的公共模板
- [x] 重构 `TrChatPage.vue`，两个分支都使用 `ChatPageContent`
- [x] 更新 `public-surface.test.mjs` 中相关的字符串匹配断言
- [x] `pnpm -F @opentiny/tiny-robot-chat type-check`
- [x] `pnpm -F @opentiny/tiny-robot-chat test`
- [x] `pnpm -F tiny-robot-test test:chat:smoke`
- [x] `pnpm -F tiny-robot-test test:chat:scenario`（workspace slots）

### 3.3 删除 ChatDefaultRenderer 纯透传组件（A4）

- [x] 确认 `ChatDefaultRenderer.vue` 无任何外部引用
- [x] 更新 `workspace-slot-contract.test.mjs` 和 `public-surface.test.mjs` 中的相关断言
- [x] 删除 `ChatDefaultRenderer.vue`
- [x] 更新 `default-renderer/index.ts`，新增 `ChatPageContent` 导出
- [x] `pnpm -F @opentiny/tiny-robot-chat type-check`
- [x] `pnpm -F @opentiny/tiny-robot-chat test`

**阶段 3 完整验证：**
- [x] `pnpm -F @opentiny/tiny-robot-chat type-check`
- [x] `pnpm -F @opentiny/tiny-robot-chat test`
- [x] `pnpm -F @opentiny/tiny-robot-chat build`
- [x] `pnpm -F tiny-robot-test test:chat:smoke`
- [x] `pnpm -F tiny-robot-test test:chat:scenario`

---

## 阶段 4：目录结构重组

目标：按 `review-structure.md` 的方案重组目录，每步保持可编译。

### 4.1 创建 entry/ 目录，移动入口组件

- [x] 创建 `src/entry/` 目录
- [x] 移动 `components/core/Chat.vue` → `entry/TrChat.vue`
- [x] 移动 `root/TrChatRoot.vue` → `entry/TrChatRoot.vue`
- [x] 移动 `page/TrChatPage.vue` → `entry/TrChatPage.vue`
- [x] 移动 `components/core/ChatProvider.vue` → `entry/TrChatProvider.vue`
- [x] 移动 `root/RootBootstrapProvider.vue` → `entry/RootBootstrapProvider.vue`
- [x] 移动 `root/createRootBootstrapState.ts` → `entry/createRootBootstrapState.ts`
- [x] 创建 `entry/index.ts`
- [x] 更新 `src/index.ts` 的 import 路径
- [x] 旧 `root/` 和 `page/` 目录保留为 re-export shim（向后兼容）
- [x] `pnpm -F @opentiny/tiny-robot-chat type-check`
- [x] `pnpm -F @opentiny/tiny-robot-chat test`

### 4.2 重组 runtime/ 目录

- [x] `runtime/chat-kit/` → `runtime/engine/`（重命名，旧目录保留 re-export shim）
- [x] 移动 `runtime/config/openaiCompatibleTransport.ts` → `runtime/transport/openaiCompatibleTransport.ts`
- [x] 创建 `runtime/transport/index.ts`
- [x] 移动 `runtime/config/registry.ts` → `runtime/features/registry.ts`
- [x] 移动 `runtime/config/featureTypes.ts` → `runtime/features/featureTypes.ts`
- [x] 创建 `runtime/features/index.ts`
- [x] 移动 `runtime/provider/resolveProviderRuntime.ts` → `runtime/config/resolveProviderRuntime.ts`
- [x] 更新 `runtime/config/index.ts` 的导出
- [x] 更新所有受影响的 import 路径
- [x] `pnpm -F @opentiny/tiny-robot-chat type-check`
- [x] `pnpm -F @opentiny/tiny-robot-chat test`

### 4.3 重组 components/ 目录

- [x] 将公开 primitive 组件提升到 `components/` 根目录（ChatLayout、ChatHeader、ChatMessageList、ChatSender、ChatFooter、ChatWelcome）
- [x] 移动 `useDefaultBubbleConfig.ts` 和 `useSlotFilter.ts` 到 `components/` 根目录
- [x] `default-renderer/` → `page-regions/`（重命名，旧目录保留 re-export shim）
- [x] 创建 `components/index.ts` 和 `components/page-regions/index.ts`
- [x] 更新 `components/core/index.ts` 为 re-export shim
- [x] 更新所有受影响的 import 路径
- [x] `pnpm -F @opentiny/tiny-robot-chat type-check`
- [x] `pnpm -F @opentiny/tiny-robot-chat test`

### 4.4 重组 shared/ 目录

- [x] 移动 `components/workspace/chatUiContext.ts` → `shared/context/chatUiContext.ts`
- [x] 重命名 `components/workspace/runtime.ts` → `components/workspace/workspaceUtils.ts`
- [x] 更新所有受影响的 import 路径
- [x] `pnpm -F @opentiny/tiny-robot-chat type-check`
- [x] `pnpm -F @opentiny/tiny-robot-chat test`

### 4.5 重组 types/ 目录

- [x] `types/ui.ts` → `types/component.ts`（重命名，旧文件保留 re-export shim）
- [x] `types/root.ts` 拆分为 `types/message.ts`（消息/发送相关类型）+ `types/runtime.ts`（runtime 接口）+ `types/config.ts`（配置类型），旧 `root.ts` 保留 re-export shim
- [x] 更新 `types/index.ts` 从新的规范位置导出
- [x] `pnpm -F @opentiny/tiny-robot-chat type-check`
- [x] `pnpm -F @opentiny/tiny-robot-chat test`

**阶段 4 完整验证：**
- [x] `pnpm -F @opentiny/tiny-robot-chat type-check`
- [x] `pnpm -F @opentiny/tiny-robot-chat test`
- [x] `pnpm -F @opentiny/tiny-robot-chat build`
- [ ] `pnpm -F tiny-robot-test test:chat:smoke`
- [ ] `pnpm -F tiny-robot-test test:chat:scenario`

---

## 阶段 5：测试改进

目标：补充关键测试覆盖，改善测试基础设施。

### 5.1 统一 fetch mock 封装（T7）

- [ ] 在 `tests/_helpers.mjs` 中创建 `createMockFetch` 工具函数
- [ ] 重构 `root-runtime.test.mjs` 中 6 个测试的 fetch mock，使用统一封装
- [ ] `pnpm -F @opentiny/tiny-robot-chat test`

### 5.2 补充关键场景测试（T8 部分）

- [ ] 补充测试：`beforeSend` 返回 `false` 取消发送
- [ ] 补充测试：`afterReceive` 在 `createRuntimeFromConfig` 路径的执行时机
- [ ] 补充测试：`ChatProvider` 同时传 `transportAdapter` 和 `responseProvider` 的错误处理
- [ ] `pnpm -F @opentiny/tiny-robot-chat test`

### 5.3 抽取 createMockRuntime 工厂（T9）

- [ ] 在 `tests/_helpers.mjs` 中创建 `createMockRuntime` 工厂函数
- [ ] 重构 `message-actions.test.mjs` 中的手工 runtime mock
- [ ] `pnpm -F @opentiny/tiny-robot-chat test`

**阶段 5 完整验证：**
- [ ] `pnpm -F @opentiny/tiny-robot-chat type-check`
- [ ] `pnpm -F @opentiny/tiny-robot-chat test`
- [ ] `pnpm -F @opentiny/tiny-robot-chat build`

---

## 阶段 6：代码质量改进

目标：修复剩余的代码质量问题。

### 6.1 改善默认 message runtime 空实现（I2）

- [ ] 在 `normalizeRuntime.ts` 的 `createDefaultMessageRuntime` 中，为 `startEdit`、`cancelEdit`、`commitEdit` 添加 `console.warn` 提示
- [ ] `pnpm -F @opentiny/tiny-robot-chat type-check`
- [ ] `pnpm -F @opentiny/tiny-robot-chat test`

### 6.2 批量删除改并行（Q2）

- [ ] 修改 `ChatHistoryPanel.vue` 的 `handleBatchDelete`，使用 `Promise.all` 并行删除
- [ ] `pnpm -F @opentiny/tiny-robot-chat type-check`
- [ ] `pnpm -F @opentiny/tiny-robot-chat test`

### 6.3 useDefaultBubbleConfig VNode 缓存（Q1）

- [ ] 对 `roles` 中的 avatar VNode 使用 `markRaw` 包裹
- [ ] `pnpm -F @opentiny/tiny-robot-chat type-check`
- [ ] `pnpm -F @opentiny/tiny-robot-chat test`

### 6.4 E2E 选择器迁移到 data-testid（E2 部分）

- [ ] 为 `ChatHeader` 的历史按钮和新建对话按钮添加 `data-testid`
- [ ] 更新 `selectors.ts` 中的 `historyBtn` 和 `newChatBtn` 选择器
- [ ] 更新 `testHelper.ts` 中受影响的方法
- [ ] `pnpm -F tiny-robot-test test:chat:smoke`（history 相关用例）
- [ ] `pnpm -F tiny-robot-test test:chat:scenario`

**阶段 6 完整验证：**
- [ ] `pnpm -F @opentiny/tiny-robot-chat type-check`
- [ ] `pnpm -F @opentiny/tiny-robot-chat test`
- [ ] `pnpm -F @opentiny/tiny-robot-chat build`
- [ ] `pnpm -F tiny-robot-test test:chat:smoke`
- [ ] `pnpm -F tiny-robot-test test:chat:scenario`
