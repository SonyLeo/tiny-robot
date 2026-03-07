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

## Phase 1 — Step 2: `packages/chat-cli/`（CLI 工具）

### 2.1 CLI 工程配置
- ✅ `package.json`（bin 字段、`@clack/prompts` + `picocolors` 依赖）
  - ✅ npm 包名为 `create-tiny-robot`
  - ✅ 包含 `files` 字段（bin、templates、scripts）
  - ✅ 依赖配置正确

### 2.2 basic 模板
- ✅ `templates/basic/src/App.vue`（~40 行，直接用 `<TrChat>`）
  - ⚠️ 缺少 `:storage="storage"` 配置（会话持久化）
  - ⚠️ 缺少 `:prompts="prompts"` 配置（引导词）
  - ✅ 使用 `fullscreen` prop
  - ✅ 使用环境变量 `VITE_API_PROVIDER` 动态选择 provider
- ✅ `templates/basic/src/main.ts`
  - ⚠️ 样式导入路径使用 `/dist/style.css`，应改为 `/style`（使用 package.json 导出）
- ✅ `templates/basic/src/env.d.ts`
- ✅ `templates/basic/index.html`
- ✅ `templates/basic/package.json`（依赖版本使用 `workspace:*`）
- ✅ `templates/basic/vite.config.ts`
- ✅ `templates/basic/tsconfig.json` + `tsconfig.node.json`
- ✅ `templates/basic/_gitignore`（构建时重命名为 `.gitignore`）
- ✅ `templates/basic/_env.example`（构建时重命名为 `.env.example`）
- ✅ `templates/basic/README.md`（含生产环境后端代理安全说明）

### 2.3 CLI 交互逻辑
- ✅ `bin/index.js`（ESM，使用 `@clack/prompts`）
  - ✅ 项目名输入
  - ✅ 模板选择（basic + coming soon 选项）
  - ✅ API Provider 选择（OpenAI / DeepSeek / Custom）
  - ✅ 安装依赖确认
  - ✅ `isCancel()` 取消处理
  - ✅ `_gitignore` → `.gitignore` 重命名
  - ✅ `_env.example` → `.env.example` 重命名
  - ✅ Provider 占位符替换（`patchProviderInApp`）
  - ✅ 自动安装依赖（可选）
  - ✅ 完整的错误处理和用户反馈

### 2.4 版本同步脚本
- ❌ `scripts/update-versions.js`（未实现）
  - **问题**：模板中的依赖版本固定为 `workspace:*`，发布到 npm 后无法使用
  - **优先级**：P0（必须修复）
  - **实施方案**：需创建脚本读取各包版本，在 release CI 中自动运行

---

## Phase 1 — Step 3: 工程配置

### 3.1 Workspace 注册
- ✅ `pnpm-workspace.yaml` 已包含 `packages/**`（无需修改）
- ❌ 根 `package.json` 补充 `build:chat`、`dev:chat` 脚本
  - **问题**：缺少 `dev:chat-cli` 和 `build:chat-cli` 脚本
  - **优先级**：P1（强烈建议）
  - **实施方案**：在根 package.json 中添加 CLI 相关脚本

### 3.2 CI 配置
- ❌ `.github/workflows/` 补充 release 时触发版本同步脚本
  - **问题**：未配置 CI 自动运行版本同步
  - **优先级**：P0（必须修复）
  - **实施方案**：在 release workflow 中调用 `scripts/update-versions.js`

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

## 优化记录（2026-03-06）

### CLI 工具实施完成度评估

1. **已完成部分（100%）**
   - ✅ CLI 工程配置（package.json、bin 字段、依赖）
   - ✅ CLI 交互逻辑（项目名、模板选择、Provider 选择、依赖安装）
   - ✅ Basic 模板结构（所有必要文件）
   - ✅ 模板文档（README.md 含安全说明）

2. **与设计方案的差异**
   - ⚠️ App.vue 缺少 `:storage` 和 `:prompts` 配置
   - ⚠️ 样式导入路径使用 `/dist/style.css` 而非 `/style`
   - ✅ Provider 实现更灵活（环境变量而非占位符）

3. **缺失部分（需修复）**
   - ❌ `scripts/update-versions.js` 未实现（P0）
   - ❌ 根 package.json 缺少 CLI 脚本（P1）
   - ❌ App.vue 缺少 storage 和 prompts 配置（P1）
   - ❌ 样式导入路径需修正（P1）

4. **总体完成度**
   - CLI 工程配置：100%
   - CLI 交互逻辑：100%
   - Basic 模板结构：100%
   - Basic 模板功能：70%（缺 storage 和 prompts）
   - 版本同步脚本：0%
   - 根目录集成：0%
   - **总体：约 75%**

### 待修复项目清单

| 优先级 | 项目 | 状态 | 说明 |
|--------|------|------|------|
| P0 | 版本同步脚本 | ❌ 未实现 | 影响 npm 发布，必须完成 |
| P0 | 构建脚本集成 | ❌ 未实现 | 需在 release CI 中调用版本同步 |
| P1 | App.vue 功能完整性 | ⚠️ 部分缺失 | 添加 storage 和 prompts 配置 |
| P1 | 样式导入路径 | ⚠️ 需修正 | 改为使用 package.json 导出路径 |
| P1 | 根目录脚本 | ❌ 未实现 | 添加 dev:chat-cli 和 build:chat-cli |
| P2 | CLI 增强功能 | ⏳ 可选 | --skip-install、--template 等标志 |
| P2 | 模板增强 | ⏳ 可选 | 更多示例、ESLint/Prettier 配置 |

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
| `createOpenAIProvider` 浏览器端安全 | ✅ 已处理 | README 已包含生产环境后端代理说明 |
| CLI `_gitignore` 重命名 | ✅ 已实现 | bin/index.js 中 renameSync 处理 |
| 暗色模式变量名 | ✅ 已修正 | `--tr-color-border` 改为 `--tr-border-color-default`；硬编码值在 `[data-tr-color-mode='dark']` 下覆盖 |
| 版本同步机制 | ❌ 未实现 | 模板依赖版本固定为 `workspace:*`，npm 发布后无法使用（P0） |
| 样式导入路径 | ⚠️ 需修正 | 使用 `/dist/style.css` 而非 `/style` 导出路径（P1） |
| App.vue 功能完整性 | ⚠️ 部分缺失 | 缺少 storage 和 prompts 配置（P1） |

---

## 实施检查清单

```
Phase 1 - Step 1: packages/chat/
  ✅ 1.1  package.json + tsconfig.json + vite.config.ts
  ✅ 1.2  src/types.ts + src/context.ts
  ✅ 1.3  src/composables/useChatKit.ts
  ✅ 1.4  src/providers/openai.ts + deepseek.ts
  ✅ 1.5  src/styles/variables.less + layout.less + drawer.less + index.less
  ✅ 1.6  src/components/TrChatRoot.vue
  ✅ 1.7  src/components/TrChatHeader.vue
  ✅ 1.8  src/components/TrChatWelcome.vue
  ✅ 1.9  src/components/TrChatMessageList.vue
  ✅ 1.10 src/components/TrChatFooter.vue
  ✅ 1.11 src/components/TrChatSender.vue
  ✅ 1.12 src/components/TrChatHistory.vue
  ✅ 1.13 src/components/TrChat.vue
  ✅ 1.14 src/index.ts + src/shims.d.ts

Phase 1 - Step 2: packages/chat-cli/（npm 包名: create-tiny-robot）
  ✅ 2.1  package.json
  ✅ 2.2  bin/index.js（完整的 CLI 交互逻辑）
  ✅ 2.3  templates/basic/src/App.vue + main.ts + env.d.ts
  ✅ 2.4  templates/basic/_env.example + _gitignore + index.html + package.json + vite.config.ts + tsconfig.json + README.md
  ❌ 2.5  scripts/update-versions.js（P0 - 必须修复）

Phase 1 - Step 3: 工程配置
  ✅ 3.1  pnpm-workspace.yaml 已包含 packages/**
  ✅ 3.2  根 package.json 已有 dev:chat / build:chat 脚本
  ❌ 3.3  根 package.json 补充 dev:chat-cli / build:chat-cli 脚本（P1 - 强烈建议）
  ❌ 3.4  .github/workflows/ 补充 release 时触发版本同步脚本（P0 - 必须修复）

Phase 1 - Step 4: 文档
  ⏳ 4.1  docs/ 补充套件快速开始页
  ⏳ 4.2  docs/ 补充 API 参考页
```

---

## 待修复项目详细清单

### P0 优先级（必须修复）

#### 1. 创建版本同步脚本
**文件**：`packages/chat-cli/scripts/update-versions.js`

**问题**：模板中的依赖版本固定为 `workspace:*`，发布到 npm 后无法使用

**实施方案**：
```js
#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// 读取各包版本
const chatPkg = JSON.parse(readFileSync(join(root, '../chat/package.json'), 'utf-8'))
const kitPkg = JSON.parse(readFileSync(join(root, '../kit/package.json'), 'utf-8'))
const componentsPkg = JSON.parse(readFileSync(join(root, '../components/package.json'), 'utf-8'))

// 更新模板 package.json
const templatePkgPath = join(root, 'templates/basic/package.json')
const templatePkg = JSON.parse(readFileSync(templatePkgPath, 'utf-8'))

templatePkg.dependencies['@opentiny/tiny-robot-chat'] = `^${chatPkg.version}`
templatePkg.dependencies['@opentiny/tiny-robot-kit'] = `^${kitPkg.version}`
templatePkg.dependencies['@opentiny/tiny-robot'] = `^${componentsPkg.version}`

writeFileSync(templatePkgPath, JSON.stringify(templatePkg, null, 2) + '\n')
console.log('✅ Template versions updated')
```

**集成方式**：在 release CI workflow 中调用此脚本

#### 2. 配置 Release CI 自动运行版本同步
**文件**：`.github/workflows/release.yml`（或类似）

**问题**：未配置 CI 自动运行版本同步脚本

**实施方案**：在 release 步骤中添加
```yaml
- name: Update template versions
  run: node packages/chat-cli/scripts/update-versions.js
```

### P1 优先级（强烈建议）

#### 1. 修复 App.vue 功能完整性
**文件**：`packages/chat-cli/templates/basic/src/App.vue`

**问题**：缺少 `:storage` 和 `:prompts` 配置

**修改内容**：添加 storage 和 prompts 配置
```vue
<script setup lang="ts">
import { TrChat, createOpenAIProvider, createDeepSeekProvider } from '@opentiny/tiny-robot-chat'
import { localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'

const apiKey = import.meta.env.VITE_API_KEY
const provider = import.meta.env.VITE_API_PROVIDER

let responseProvider

if (provider === 'openai') {
  responseProvider = createOpenAIProvider({
    apiKey,
    model: 'gpt-4-turbo',
  })
} else if (provider === 'deepseek') {
  responseProvider = createDeepSeekProvider({
    apiKey,
    model: 'deepseek-chat',
  })
} else {
  throw new Error(`Unknown API provider: ${provider}`)
}

const storage = localStorageStrategyFactory()

const welcome = {
  title: 'Welcome to Tiny Robot Chat',
  description: 'Start a conversation with AI',
}

const prompts = [
  { label: '✍️ 写作', description: '帮我写一篇关于...' },
  { label: '💻 编程', description: '帮我写一个...' },
  { label: '📊 分析', description: '帮我分析...' },
  { label: '🌐 翻译', description: '帮我翻译...' },
]
</script>

<template>
  <div id="app">
    <TrChat
      :response-provider="responseProvider"
      :storage="storage"
      :welcome="welcome"
      :prompts="prompts"
      show-history
      fullscreen
    />
  </div>
</template>

<style scoped>
#app {
  width: 100%;
  height: 100vh;
}
</style>
```

#### 2. 修正样式导入路径
**文件**：`packages/chat-cli/templates/basic/src/main.ts`

**问题**：使用 `/dist/style.css` 而非 `/style` 导出路径

**修改内容**：
```ts
import { createApp } from 'vue'
import App from './App.vue'
import '@opentiny/tiny-robot/dist/style.css'
import '@opentiny/tiny-robot-chat/style'  // 改为使用 package.json 导出路径

createApp(App).mount('#app')
```

#### 3. 添加根目录 CLI 脚本
**文件**：根 `package.json`

**问题**：缺少 CLI 相关脚本

**修改内容**：在 `scripts` 中添加
```json
{
  "scripts": {
    "dev:chat-cli": "pnpm -F create-tiny-robot dev",
    "build:chat-cli": "pnpm -F create-tiny-robot build"
  }
}
```

### P2 优先级（可选优化）

#### 1. CLI 增强功能
- 添加 `--skip-install` 标志
- 添加 `--template` 标志直接指定模板
- 添加版本检查和更新提示

#### 2. 模板增强
- 添加 TypeScript 严格模式配置
- 添加 ESLint/Prettier 配置（可选）
- 添加更多示例（多模态、工具调用等）

---

## 完成度统计

| 模块 | 完成度 | 状态 |
|------|--------|------|
| packages/chat 工程配置 | 100% | ✅ 完成 |
| packages/chat 核心功能 | 100% | ✅ 完成 |
| packages/chat 样式系统 | 100% | ✅ 完成 |
| packages/chat 组件库 | 100% | ✅ 完成 |
| packages/chat-cli 工程配置 | 100% | ✅ 完成 |
| packages/chat-cli CLI 交互 | 100% | ✅ 完成 |
| packages/chat-cli 模板结构 | 100% | ✅ 完成 |
| packages/chat-cli 模板功能 | 70% | ⚠️ 缺 storage 和 prompts |
| 版本同步脚本 | 0% | ❌ 未实现 |
| 工程集成脚本 | 50% | ⚠️ 部分缺失 |
| **总体完成度** | **75%** | ⚠️ 进行中 |

---

## 后续工作计划

### 立即执行（本周）
1. ✅ 完成 packages/chat 的构建和类型检查修复
2. ✅ 完成 packages/chat-cli 的 CLI 交互实现
3. ❌ 创建版本同步脚本（P0）
4. ❌ 修复 App.vue 功能完整性（P1）

### 本周内完成（优先级 P1）
1. ❌ 修正样式导入路径
2. ❌ 添加根目录 CLI 脚本
3. ❌ 配置 Release CI 集成

### 下周完成（优先级 P2）
1. ⏳ CLI 增强功能
2. ⏳ 模板增强
3. ⏳ 文档补充
