# Chat Kit 实施进度追踪

> 基于 `chat-kit-design.md` v1.1 | 开始日期：2026-03-05 | 最后更新：2026-03-05

## 状态说明

| 符号 | 含义 |
|------|------|
| ✅ | 已完成 |
| 🚧 | 进行中 |
| ⏳ | 待开始 |
| ❌ | 阻塞/跳过 |

---

## Phase 1 — Step 1: `packages/chat/`（@opentiny/tiny-robot-chat）

### 1.1 工程配置
- ✅ `package.json`（依赖声明、构建脚本、peer deps）
- ✅ `tsconfig.json`
- ✅ `vite.config.ts`（lib 模式，external vue/components/kit）

### 1.2 类型与上下文
- ✅ `src/types.ts`（ChatStatus、ResponseProvider、UseChatKitOptions、UseChatKitReturn、TrChatProps、WelcomeConfig 等）
  - ✅ 补充白盒组件 Props 类型（TrChatRootProps、TrChatHeaderProps、TrChatWelcomeProps、TrChatMessageListProps、TrChatSenderProps、TrChatHistoryProps）
  - ✅ `WelcomeConfig.description` 改为可选
  - ✅ `TrChatProps` 补充缺失 props（roleConfigs、groupStrategy、senderProps、bubbleListProps、historyProps）
- ✅ `src/context.ts`（provide/inject symbol key）
  - ✅ 补充 `BUBBLE_LIST_SLOTS` 常量（slot 白名单）

### 1.3 核心 Composable
- ✅ `src/composables/useChatKit.ts`
  - ✅ 对 `useConversation` 的薄封装
  - ✅ 四态 `status`（ready/submitted/streaming/error）替代 `isProcessing`
  - ✅ `sendMessage(content, data?): void`（首次发送自动创建会话，支持 StructuredData）
  - ✅ `abort(): Promise<void>`
  - ✅ `onFinish` / `onError` 生命周期回调
  - ✅ 严格不管理 UI 状态（inputValue、showHistoryDrawer 等）
  - ✅ `updateResponseProvider(provider)` 动态更新当前活跃引擎的 provider

### 1.4 Providers
- ✅ `src/providers/openai.ts`（`createOpenAIProvider` 工厂函数）
- ✅ `src/providers/deepseek.ts`（`createDeepSeekProvider`，预设 baseURL）

### 1.5 样式
- ✅ `src/styles/variables.less`（`--chat-*` CSS 变量清单，引用 `--tr-*` 变量实现暗色模式自动切换）
- ✅ `src/styles/layout.less`（套件布局：flex 列、header/body/footer 分区，使用 Less 嵌套语法）
  - ✅ 补充 `__welcome` 区域样式（flex 居中、overflow-y auto）
- ✅ `src/styles/drawer.less`（Drawer 动画，position: absolute，零依赖，Less 嵌套）
- ✅ `src/styles/components.less`（组件样式，Less 嵌套语法）
  - ✅ `tr-chat__header-button` 样式（hover/active 状态）
- ✅ `src/styles/index.less`（样式入口，@import 所有样式文件）

### 1.6 白盒根组件
- ✅ `src/components/TrChatRoot.vue`
  - ✅ 支持两种互斥模式：传 Options（内部调用 useChatKit）或传 `:chat-kit`（外部注入实例）
  - ✅ `provide(CHAT_KIT_CONTEXT_KEY, chatKit)` 注入状态
  - ✅ 改进错误处理：throw 改为 console.warn（避免组件树崩溃）

### 1.7 Header 组件
- ✅ `src/components/TrChatHeader.vue`
  - ✅ props: `showHistory?`, `showNewChat?`
  - ✅ slot: `#extra`（追加操作）
  - ✅ 点击历史按钮 → `inject` 的 `showHistoryDrawer` 切换（由 TrChat.vue 通过 provide 注入）
  - ✅ 点击新建按钮 → 调用 `createConversation()`
  - ✅ 替换裸 `<button>` 为带样式的按钮（hover/active 状态、title 属性）

### 1.8 Welcome 组件
- ✅ `src/components/TrChatWelcome.vue`
  - ✅ props: `title`, `description?`, `icon?`（description 改为可选）
  - ✅ 内部使用 `TrWelcome` + `TrPrompts`
  - ✅ emit: `prompt-click`（白盒模式下由用户处理）
  - ✅ 黑盒模式下由 TrChat.vue 自动绑定 `sendMessage`
  - ✅ 修复 icon 类型断言（兼容 TrWelcome 的类型定义）

### 1.9 MessageList 组件
- ✅ `src/components/TrChatMessageList.vue`
  - ✅ 透传完整 `TrBubbleList` props
  - ✅ 使用 slot 白名单过滤（BUBBLE_LIST_SLOTS）
  - ✅ 从 inject 获取 `messages`

### 1.10 Footer 组件
- ✅ `src/components/TrChatFooter.vue`
  - ✅ slot: `#extra`（输入框上方区域）
  - ✅ slot: `default`（放置 TrChat.Sender）

### 1.11 Sender 组件
- ✅ `src/components/TrChatSender.vue`
  - ✅ 透传完整 `TrSender` props
  - ✅ 从 inject 获取 `sendMessage`、`abort`、`status`
  - ✅ 内部管理 `inputValue`（不暴露给 useChatKit）
  - ✅ `status === 'streaming' || 'submitted'` 时显示停止按钮

### 1.12 History 组件
- ✅ `src/components/TrChatHistory.vue`
  - ✅ Drawer（position: absolute，自实现）+ `TrHistory`
  - ✅ 从 inject 获取 `conversations`、`switchConversation`、`deleteConversation`
  - ✅ 从 inject 获取 `showHistoryDrawer`（由 TrChat.vue provide）
  - ✅ 透传完整 `TrHistory` props
  - ✅ 改进错误处理：`switchConversation` 加 try-catch

### 1.13 黑盒入口组件
- ✅ `src/components/TrChat.vue`
  - ✅ 内部调用 `useChatKit`（或接受外部注入）
  - ✅ 内部管理 UI 状态：`inputValue`、`showHistoryDrawer`
  - ✅ 自动处理 Welcome/MessageList 切换（`messages.length === 0`）
  - ✅ 黑盒模式下自动绑定 `prompt-click → sendMessage`
  - ✅ 挂载所有白盒子组件（`TrChat.Root`、`TrChat.Header` 等）
  - ✅ 修复 welcome slot 逻辑缺陷（showWelcome 作为唯一分支条件）
  - ✅ 给欢迎页区域添加 `tr-chat__welcome` 样式类

### 1.14 导出入口
- ✅ `src/index.ts`
  - ✅ 导出 `TrChat`（含子组件挂载）
  - ✅ 导出 `useChatKit`
  - ✅ 导出 `createOpenAIProvider`、`createDeepSeekProvider`
  - ✅ 导出所有类型（含白盒组件 Props 类型）
  - ✅ 样式注释说明用户需手动导入（不在 index.ts 中自动引入）

---

## Phase 1 — Step 2: `packages/create-tiny-robot-app/`（CLI 工具）

### 2.1 CLI 工程配置
- ⏳ `package.json`（bin 字段、`@clack/prompts` + `picocolors` 依赖）

### 2.2 basic 模板
- ⏳ `templates/basic/src/App.vue`（~30 行，直接用 `<TrChat>`）
- ⏳ `templates/basic/src/main.ts`
- ⏳ `templates/basic/src/env.d.ts`
- ⏳ `templates/basic/index.html`
- ⏳ `templates/basic/package.json`（依赖版本占位符）
- ⏳ `templates/basic/vite.config.ts`
- ⏳ `templates/basic/tsconfig.json`
- ⏳ `templates/basic/_gitignore`（构建时重命名为 `.gitignore`）
- ⏳ `templates/basic/_env.example`（构建时重命名为 `.env.example`）
- ⏳ `templates/basic/README.md`（含生产环境后端代理安全说明）

### 2.3 CLI 交互逻辑
- ⏳ `bin/index.js`（ESM，使用 `@clack/prompts`）
  - 交互流程：项目名 → 模板选择 → 语言 → API Provider → 安装依赖
  - coming soon 模板的处理
  - `isCancel()` 取消处理
  - `_gitignore` → `.gitignore` 重命名

### 2.4 版本同步脚本
- ⏳ `scripts/update-versions.js`（读取 workspace 包版本，写入模板 package.json）

---

## Phase 1 — Step 3: 工程配置

### 3.1 Workspace 注册
- ⏳ `pnpm-workspace.yaml` 已包含 `packages/**`（无需修改）
- ⏳ 根 `package.json` 补充 `build:chat`、`dev:chat` 脚本

### 3.2 CI 配置
- ⏳ `.github/workflows/` 补充 release 时触发版本同步脚本（Phase 1 可选）

---

## Phase 1 — Step 4: 文档

### 4.1 快速开始文档
- ⏳ `docs/src/` 补充套件快速开始页（黑盒 / 白盒 / 纯逻辑三种用法）

### 4.2 API 参考文档
- ⏳ `docs/src/` 补充 TrChat API 参考页

---

## 优化记录（2026-03-05）

### 代码质量优化

1. **样式统一性**
   - ✅ 提取 `TrChatHeader.vue` 中的内联 CSS 到 `src/styles/components.less`
   - ✅ 所有组件样式统一使用 Less 嵌套语法，保持项目一致性
   - ✅ 新增 `components.less` 文件管理组件级样式

2. **逻辑 Bug 修复**
   - ✅ 修复 `useChatKit.ts` 中 `sendMessage` 的竞态问题（首次创建会话后统一走 `activeConversation.value?.engine.sendMessage` 路径）
   - ✅ 修复 `TrChat.vue` 中 welcome slot 逻辑缺陷（showWelcome 作为唯一分支条件，避免消息列表消失）
   - ✅ 改进 `TrChatRoot.vue` 错误处理（throw 改为 console.warn）
   - ✅ 改进 `TrChatHistory.vue` 错误处理（switchConversation 加 try-catch）

3. **API 完善**
   - ✅ `TrChatProps` 补充缺失 props（roleConfigs、groupStrategy、senderProps、bubbleListProps、historyProps）
   - ✅ `WelcomeConfig.description` 改为可选
   - ✅ 导出白盒组件 Props 类型（TrChatRootProps、TrChatHeaderProps 等）
   - ✅ `sendMessage` 签名扩展为支持 StructuredData（`sendMessage(content: string, data?: StructuredData)`)

4. **Slot 透传策略统一**
   - ✅ 提取 `BUBBLE_LIST_SLOTS` 常量到 `context.ts`
   - ✅ `TrChatMessageList.vue` 和 `TrChat.vue` 使用统一的 slot 白名单过滤

5. **样式增强**
   - ✅ 补充 `layout.less` 中的 `__welcome` 区域样式
   - ✅ `TrChatHeader.vue` 按钮添加 hover/active 状态样式

6. **文档澄清**
   - ✅ 确认 `index.ts` 不应自动引入 `@opentiny/tiny-robot` 样式（用户手动导入）
   - ✅ 样式文件扩展名统一为 `.less`（设计文档已更新）

---

## 关键设计决策备忘

| 决策点 | 结论 |
|--------|------|
| `useChatKit` UI 状态 | 不管理（`inputValue`/`showHistoryDrawer` 由组件层自行管理） |
| 消息状态 | `status: ChatStatus`（四态），替代 `isProcessing: boolean` |
| `sendMessage` 返回值 | `void`（同步入队，流式异步） |
| Drawer 实现 | 套件自实现，`position: absolute + transition`，零依赖 |
| CLI 交互库 | `@clack/prompts` + `picocolors` |
| `TrChat.Body` | 拆分为 `TrChat.Welcome` + `TrChat.MessageList` |
| Props 优先级 | 平铺 props > 透传对象 props |
| `TrChat.Root` 模式 | 两种互斥：传 Options 或传 `:chat-kit` 实例 |
| `ResponseProvider` 实际签名 | `AsyncGenerator<ChatCompletion>`（不是设计文档中的 `ReadableStream<string>`） |
| 样式技术栈 | Less（与 components 包保持一致），嵌套语法减少 BEM 前缀重复 |
| VueUse 引入 | 不引入（当前方案逻辑已足够简单，无明显简化收益） |
| 暗色模式 | 通过 `--tr-*` 变量引用链自动跟随 ThemeProvider，无需额外代码 |

---

## 风险追踪

| 风险 | 状态 | 备注 |
|------|------|------|
| BubbleList slots 动态透传 | ⏳ 待验证 | 带连字符 slot 名（`content-footer`）需测试 |
| ChatStatus 四态与底层映射 | ⏳ 待验证 | 从 `requestState` 推导，abort 后立即置 ready |
| `createOpenAIProvider` 浏览器端安全 | ⏳ 文档说明 | README 必须说明生产环境需后端代理 |
| CLI `_gitignore` 重命名 | ⏳ 待实现 | npm publish 会忽略 `.gitignore` |
| 暗色模式变量名 | ✅ 已修正 | `--tr-color-border` 改为 `--tr-border-color-default`；硬编码值在 `[data-tr-color-mode='dark']` 下覆盖 |
