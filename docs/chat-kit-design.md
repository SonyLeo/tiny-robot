# Chat Kit Feature Design

> 面向 `packages/chat` 的后续扩展设计文档  
> 目标：在不破坏现有 `config -> adapter -> preset -> TrChat` 链路的前提下，把 `@opentiny/tiny-robot` 的高价值组件能力逐步沉淀到 `@opentiny/tiny-robot-chat`，并最终形成更稳定的配置驱动基座，供 `chat-cli` 和后续模板系统复用。

---

## 一、背景

当前 `packages/chat` 已经具备一条清晰主链路：

- UI 组件来自 `@opentiny/tiny-robot`
- 消息、会话、请求能力来自 `@opentiny/tiny-robot-kit`
- `@opentiny/tiny-robot-chat` 负责把它们组装成黑盒 `TrChat`、白盒子组件、Adapter 和 Preset

这条链路已经能支持：

- 黑盒快速接入
- 白盒深度定制
- 多模型切换
- MCP 工具调用
- 错误重试、optimistic、rollback
- 基础配置驱动

但从后续演进角度看，`packages/chat` 还没有把 `packages/components` 的能力系统化地吸收进来。现在更像是：

- 已集成一部分高频聊天能力
- 其余能力仍停留在 demo 级手工拼装
- 配置层只覆盖了最基础的 `brand / welcome / prompts / models / providers`

这会带来两个直接问题：

1. `chat-cli` 虽然已经有 `ChatConfig` 契约，但配置面过窄，难以继续扩模板能力。
2. `packages/chat` 虽然有白盒能力，但很多组件能力还不能以稳定、声明式的方式被复用。

---

## 二、业界最佳实践

### 2.1 参考对象

本设计主要参考以下公开方案：

- Vercel AI SDK / AI Academy
  - 前后端分层，服务端持有密钥，前端消费统一聊天状态
  - 参考：<https://sdk.vercel.ai/docs/getting-started/vue>
  - 参考：<https://vercel.com/academy/ai-sdk/basic-chatbot>
- LobeHub / LobeChat
  - Store slices、插件体系、多 provider、多能力面板、Artifacts、Branching Conversations
  - 参考：<https://github.com/lobehub/lobe-chat>
  - 参考：<https://lobehub.com/docs/development/plugins/create-plugin>
- Ant Design X
  - Compound component + 场景组件与原子组件并存
  - 参考：<https://x.ant.design/components/overview>

### 2.2 共识模式

从这些成熟方案里，可以提炼出几条对 `packages/chat` 最有价值的原则：

1. **场景层不应直接等于原子组件层**
   - 聊天套件应当是“场景能力聚合层”，而不是把所有基础组件原样重新导出一遍。

2. **配置驱动应优先描述能力，而不是描述实现细节**
   - 配置里应该写“是否启用附件上传”“工具栏有哪些动作”“是否启用 MCP 面板”。
   - 不应该要求业务在配置里直接塞大量渲染函数或 VNode。

3. **状态层、渲染层、扩展层应分离**
   - LobeHub 的 store slices 和 Vercel AI SDK 的 hook 模式，本质上都在强调这件事。
   - `packages/chat` 已经有这条方向，但 feature 维度还不够清晰。

4. **扩展应该走 manifest / registry，而不是在黑盒组件里继续堆 if/else**
   - LobeHub 的插件与能力入口，本质上都是“先声明，再注册，再挂载到 UI”。

5. **黑盒与白盒应该消费同一套能力基座**
   - 黑盒不应有独占逻辑。
   - 白盒不应要求用户重新手工拼出一套完全不同的状态链路。

6. **高阶能力应尽量 first-party config 化，底层原子组件继续保留白盒出口**
   - 不是每个组件都必须变成 `TrChat.*`。
   - 但高价值的聊天场景能力应优先纳入 `packages/chat`。

### 2.3 LobeHub 对当前设计最值得借鉴的点

结合 LobeChat 的产品和架构，对 TinyRobot Chat Kit 最有参考价值的不是具体 UI，而是以下设计思路：

1. **能力分层**
   - 模型、对话、工具、附件、知识、Artifacts 都不是“零散按钮”，而是独立 feature。

2. **可插拔能力入口**
   - 插件、工具、模型选择、面板切换等都通过统一能力入口接入，而不是在页面里到处散落控制逻辑。

3. **同一条会话主链路承载多种 UI 形态**
   - Bubble、Docs、Artifacts、Branch 等不是分裂成多个产品，而是在同一会话体系上扩展。

4. **多配置入口，但核心状态统一**
   - 页面布局、模型、插件、快捷操作可以变化，但消息状态与会话生命周期始终统一。

对 `packages/chat` 的启示是：

> 不要把“把更多组件接进来”理解成“在 `TrChat.vue` 里继续加更多 props”。  
> 正确方向应当是：把这些组件背后的聊天场景能力提炼成 feature，并通过统一配置层和注册机制接入。

---

## 三、当前仓库状态

### 3.1 `packages/chat` 已有的能力基座

当前 `packages/chat` 已经提供：

- 黑盒 `TrChat`
- 白盒 `TrChat.Root / Layout / Header / Welcome / MessageList / Footer / Sender / History`
- `useChatKit`
- `useMcpManager`
- `useModelSelector`
- `createChatAdapterFromConfig`
- `createPresetChatProps`

这意味着当前已经具备：

- 状态层与 UI 层的基本分离
- 多模型与 provider 工厂机制
- 黑盒与白盒双模式
- `config -> adapter -> preset` 的第一版契约

### 3.2 `packages/components` 当前公开导出的能力

当前 `@opentiny/tiny-robot` 已公开导出这些高价值能力：

- `TrAttachments`
- `TrBubble` / `TrBubbleList` / `TrBubbleProvider`
- `TrContainer`
- `TrConversations`
- `TrDragOverlay`
- `TrDropdownMenu`
- `TrFeedback`
- `TrHistory`
- `TrIconButton`
- `TrPrompt` / `TrPrompts`
- `TrSender`
- `TrSenderCompat`
- `TrSuggestionPills`
- `TrSuggestionPopover`
- `TrThemeProvider`
- `TrWelcome`
- `TrMcpServerPicker`
- `TrMcpAddForm`
- Sender Actions
  - `TrActionButton`
  - `TrSubmitButton`
  - `TrClearButton`
  - `TrUploadButton`
  - `TrVoiceButton`
  - `TrWordCounter`
  - `TrDefaultActionButtons`

### 3.3 `packages/chat` 当前已集成的组件能力

当前已在 chat 层系统集成的能力主要有：

- `TrBubbleList` / `BubbleProvider`
- `TrSender`
- `TrWelcome`
- `TrPrompts`
- `TrHistory`
- `TrFeedback`
- `TrIconButton`
- `TrMcpServerPicker`

此外，以下能力只在 demo 或局部渲染中出现，还没有沉淀成 chat 契约：

- `TrAttachments`
- `TrUploadButton`
- `TrActionButton`
- `TrVoiceButton`
- `TrWordCounter`
- `TrSuggestionPills`
- `TrSuggestionPopover`
- `TrThemeProvider`
- `TrDragOverlay`
- `TrConversations`
- `TrMcpAddForm`

### 3.4 当前设计的关键限制

当前 `ChatConfig` 的配置面仍然很窄：

```ts
interface ChatConfig {
  models: ChatConfigModel[]
  providers: Record<string, ChatConfigProvider>
  defaults?: ChatConfigDefaults
  ui?: {
    brand?: BrandConfig
    welcome?: WelcomeConfig
    prompts?: PromptProps[]
  }
}
```

这会带来几个现实问题：

1. `ChatConfig` 只能描述“模型 + 欢迎区”。
2. 与 `chat-cli` 的契合点主要停留在 README、模型和欢迎区。
3. 附件、拖拽上传、Sender Actions、Suggestion、Theme、MCP 面板等都无法稳定配置。
4. 白盒 demo 中出现的很多能力仍需要手工拼装，难以模板化。

---

## 四、核心判断

### 4.1 不应该做的事情

不建议把目标定义成：

> “把 `packages/components` 里的所有组件逐个做成 `TrChat.*`。”

原因很简单：

1. 会让 `packages/chat` 变成一层重复转发层。
2. 会把原子组件和场景组件混成一层。
3. 会让黑盒 props 爆炸。
4. 会让配置层沦为“组件 props 的二次复制”。

### 4.2 应该做的事情

更合理的目标是：

> 让 `packages/chat` 吸收 `packages/components` 里的“聊天场景高价值能力”，并把这些能力统一收敛成 feature 配置与扩展入口。

换句话说，`packages/chat` 应该对齐的是：

- **能力层**
  - 附件输入
  - 工具栏动作
  - Suggestion
  - MCP 管理
  - Theme
  - 会话导航
  - Docs / Bubble / Workspace 等展示形态

而不是对齐：

- 每一个底层原子组件的全部 props

---

## 五、设计目标

### 5.1 目标

1. **兼容现有 `ChatConfig`**
   - 旧配置继续可用。
   - `createChatAdapterFromConfig` 与 `createPresetChatProps` 不做破坏性变更。

2. **把高价值聊天能力纳入配置驱动**
   - 附件、Sender Actions、Suggestion、MCP、Theme、Conversation Nav 等能力都能声明式启用。

3. **黑盒与白盒共享同一能力基座**
   - 黑盒只是一套默认编排。
   - 白盒可以按需复用同一组 feature。

4. **为 `chat-cli` 提供更稳定的模板输入**
   - CLI 以后不必再靠手写 `App.vue` 逻辑去拼附件、MCP、Suggestion。

5. **保持未来扩展能力**
   - 支持后续引入 Artifacts、知识库视图、Branch Conversations、右侧工作区等能力。

### 5.2 非目标

1. 不追求一次性把所有 components 能力都接进黑盒。
2. 不把配置层做成任意渲染函数的容器。
3. 不让 `TrChat` 直接承担全部业务扩展逻辑。
4. 不强迫 `packages/components` 的所有内部目录都立刻成为稳定 public API。

---

## 六、建议的目标架构

### 6.1 总体分层

建议后续演进为四层：

```text
ChatConfig
  -> Adapter Layer
  -> Feature Registry
  -> Preset / Context Layer
  -> TrChat blackbox / whitebox composition
```

具体含义：

1. **ChatConfig**
   - 只描述能力和业务意图
   - 不描述底层拼装细节

2. **Adapter Layer**
   - 负责把 config 解析为 model/provider/feature preset

3. **Feature Registry**
   - 负责把 feature 配置映射到：
     - 需要的组件
     - 需要的状态
     - 需要的默认布局插槽

4. **Preset / Context Layer**
   - 把 feature 结果合并成 `TrChatProps` 与共享上下文

5. **TrChat**
   - 只负责默认编排
   - 白盒继续共享相同 feature 结果

### 6.2 向后兼容策略

现有配置保留：

```ts
models
providers
defaults
ui.brand
ui.welcome
ui.prompts
```

在此基础上新增可选的 feature 层：

```ts
interface ChatConfigVNext extends ChatConfig {
  features?: ChatFeaturesConfig
  layout?: ChatLayoutConfig
  theme?: ChatThemeConfig
}
```

这里最重要的原则是：

- **旧字段不改语义**
- **新增字段全部可选**
- **旧模板无需迁移也能继续工作**

---

## 七、建议的配置模型

### 7.1 Feature 配置层

建议新增：

```ts
interface ChatFeaturesConfig {
  history?: boolean | ChatHistoryFeatureConfig
  feedback?: boolean | ChatFeedbackFeatureConfig
  modelSelector?: boolean | ChatModelSelectorFeatureConfig
  attachments?: false | ChatAttachmentsFeatureConfig
  senderActions?: false | ChatSenderActionsFeatureConfig
  suggestions?: false | ChatSuggestionsFeatureConfig
  mcp?: false | ChatMcpFeatureConfig
  conversations?: false | ChatConversationsFeatureConfig
  dragUpload?: false | ChatDragUploadFeatureConfig
}
```

其中：

- `boolean`
  - 表示启用默认行为
- `object`
  - 表示启用并覆盖默认配置
- `false`
  - 表示显式关闭

### 7.2 Layout 配置层

建议新增：

```ts
interface ChatLayoutConfig {
  variant?: 'assistant' | 'docs' | 'workspace'
  historyPlacement?: 'drawer' | 'sidebar'
  mcpPlacement?: 'drawer' | 'panel'
  attachmentsPlacement?: 'composer-top' | 'composer-bottom'
  modelSelectorPlacement?: 'footer' | 'sender-toolbar'
}
```

作用：

- 把“能力是否启用”和“能力摆在哪里”分开
- 避免 `TrChat` 的 if/else 与样式条件无限增长

### 7.3 Theme 配置层

建议新增：

```ts
interface ChatThemeConfig {
  enabled?: boolean
  theme?: string
  colorMode?: 'light' | 'dark' | 'auto'
  storageKey?: string
}
```

作用：

- 让 chat 套件可以受控地接入 `TrThemeProvider`
- 为 CLI 模板和业务模板提供统一 theme 入口

---

## 八、建议的 feature 分类

### 8.1 第一优先级：应尽快进入 `packages/chat`

这些能力已经高频出现在聊天场景，且当前 demo 已证明有价值：

1. **Attachments**
   - 依赖：`TrAttachments`
   - 目标：统一附件展示、附件状态、附件输入
   - 现状：仅 demo 手工拼接

2. **Sender Actions**
   - 依赖：`TrUploadButton`、`TrVoiceButton`、`TrWordCounter`、`TrDefaultActionButtons`
   - 目标：把 Sender 工具栏变成配置驱动
   - 现状：仍依赖插槽与手工布局

3. **Suggestions**
   - 依赖：`TrSuggestionPills`、`TrSuggestionPopover`
   - 目标：统一欢迎区建议、输入区建议、命令型建议
   - 现状：只覆盖了 `welcome.prompts`

4. **MCP Feature**
   - 依赖：`TrMcpServerPicker`、`TrMcpAddForm`
   - 目标：把 MCP 面板和创建方式纳入统一 feature
   - 现状：`TrChatMcpPanel` 只包了一层 Picker，能力还较窄

5. **Theme Feature**
   - 依赖：`TrThemeProvider`
   - 目标：为 chat 页面提供统一主题入口
   - 现状：chat 层完全未接入

### 8.2 第二优先级：适合后续引入

1. **Drag Upload**
   - 依赖：`TrDragOverlay`
   - 目标：附件拖拽上传体验

2. **Conversations Navigation**
   - 依赖：`TrConversations`
   - 目标：更适合 workspace / sidebar 形态的会话切换

3. **Workspace Layout**
   - 依赖：`TrContainer`
   - 目标：支撑 docs / workspace / artifact 等复杂布局

### 8.3 第三优先级：不建议直接纳入 chat 黑盒

1. `TrDropdownMenu`
2. `TrIconButton`
3. 纯底层 `BubbleRenderer` 工具

这些能力更适合继续作为：

- `@opentiny/tiny-robot` 的原子组件
- 或者 `packages/chat` 的白盒内部实现细节

不需要都暴露为 `TrChat.*`。

---

## 九、建议的 feature 注册机制

### 9.1 设计动机

如果直接在 `createPresetChatProps` 里手工处理每个 feature，很快就会变成另一层硬编码。

更合理的方式是引入 first-party feature registry：

```ts
interface ChatFeatureDefinition<TConfig = unknown> {
  key: string
  normalize: (config: TConfig | boolean, ctx: ChatFeatureContext) => NormalizedChatFeature | null
  applyPreset?: (preset: MutableChatPreset, feature: NormalizedChatFeature, ctx: ChatFeatureContext) => void
  applyContext?: (ctx: MutableChatRuntimeContext, feature: NormalizedChatFeature) => void
}
```

这里的含义是：

- `normalize`
  - 把用户配置转成标准化 feature 数据
- `applyPreset`
  - 把 feature 结果挂到黑盒 preset 上
- `applyContext`
  - 把 feature 结果挂到 whitebox 可消费的运行时上下文上

### 9.2 为什么先做 first-party registry

因为当前阶段最重要的是把官方能力统一起来，而不是一上来开放第三方插件式 UI 扩展。

建议顺序：

1. 先做 first-party registry
2. 等配置模型稳定后，再开放 `registerChatFeature()`

---

## 十、对现有 API 的建议调整

### 10.1 `ChatConfigUI` 不建议继续无限增长

当前 `ui` 已有：

- `brand`
- `welcome`
- `prompts`

建议不要继续把更多能力都塞进 `ui`，例如：

- 不建议加 `ui.attachments`
- 不建议加 `ui.mcp`
- 不建议加 `ui.senderActions`

原因：

- `ui` 应该更偏视觉与文案
- feature 配置应该进入独立 `features` 字段

### 10.2 `ChatPresetProps` 需要扩展

当前 `ChatPresetProps` 仅包含：

- `models`
- `providerFactories`
- `defaultModel`
- `brand`
- `welcome`
- `prompts`

这对于 CLI 基座已经不够。

建议扩展为：

```ts
type ChatPresetProps = Pick<
  TrChatProps,
  | 'models'
  | 'providerFactories'
  | 'defaultModel'
  | 'brand'
  | 'welcome'
  | 'prompts'
  | 'showHistory'
  | 'showFeedback'
  | 'historyProps'
  | 'senderProps'
  | 'bubbleListProps'
  | 'mcpManager'
> & {
  features?: ResolvedChatFeatures
}
```

这样做的好处：

- 旧模板无感知
- 新模板可以统一通过 preset 注入 feature

### 10.3 `TrChatProps` 建议增加 feature 入口，而不是继续分散加 props

不建议继续无限新增：

- `showSuggestionPills`
- `showUploadButton`
- `showVoiceButton`
- `showWordCounter`
- `showDragOverlay`

建议新增一个聚合入口：

```ts
interface TrChatProps {
  features?: ResolvedChatFeatures
}
```

然后黑盒内部按 feature 结果组装默认布局。

---

## 十一、建议的首期落地方案

### Phase 1：把现有 demo 中已经证明有价值的能力正式化

目标：

- 不改 `ChatConfig` 主干
- 新增 `features`
- 先打通 sender area 和 panel area

建议先做：

1. `attachments`
2. `senderActions`
3. `mcp`
4. `modelSelector`
5. `history`
6. `feedback`

建议形成这样的默认黑盒编排：

```text
Header
MessageList / Welcome
Footer
  -> attachments area
  -> sender toolbar
  -> sender
History
Mcp Panel
```

### Phase 2：补 suggestion / theme / drag-upload

目标：

- 提升可用性
- 降低业务手工拼装成本

建议先做：

1. `suggestions`
2. `theme`
3. `dragUpload`

### Phase 3：引入 workspace 形态

目标：

- 为知识库、Artifacts、右侧工作区预留位

建议先做：

1. `layout.variant = 'workspace'`
2. `conversations`
3. `historyPlacement = 'sidebar'`
4. `mcpPlacement = 'panel'`

---

## 十二、建议的组件映射关系

| Components 能力 | 应在 Chat 中对应为什么 | 是否建议进入配置驱动 |
|:--|:--|:--|
| `TrAttachments` | 附件展示 / 上传结果区 | 是 |
| `TrUploadButton` | Sender 工具栏动作 | 是 |
| `TrVoiceButton` | Sender 工具栏动作 | 是 |
| `TrWordCounter` | Sender 状态动作 | 是 |
| `TrDefaultActionButtons` | Sender 默认工具栏组合 | 是 |
| `TrSuggestionPills` | 快捷建议入口 | 是 |
| `TrSuggestionPopover` | 命令建议 / 模板建议入口 | 是 |
| `TrThemeProvider` | 页面主题能力 | 是 |
| `TrDragOverlay` | 拖拽上传层 | 是 |
| `TrConversations` | Workspace 模式会话导航 | 是，第二阶段 |
| `TrMcpServerPicker` | MCP 面板 | 是 |
| `TrMcpAddForm` | MCP 创建入口 | 是 |
| `TrContainer` | Workspace 布局骨架 | 是，第二阶段 |
| `TrDropdownMenu` | 底层内部能力 | 否，优先保留白盒/内部实现 |
| `TrIconButton` | 底层内部能力 | 否 |

---

## 十三、对 `chat-cli` 的直接价值

一旦 `packages/chat` 按上述方式扩展，`chat-cli` 可以直接受益：

1. 模板不需要再手工拼附件区、上传按钮、MCP 面板。
2. CLI 可以在创建时通过 `--feature attachments,mcp,voice` 这类输入生成更丰富模板。
3. 生成项目的 `chat.config.ts` 能真正承载更多聊天能力，而不是只承载模型和欢迎区。
4. 后续多模板体系可以共享同一套 feature config，而不是复制多个近似页面模板。

这也是为什么：

> `packages/chat` 的 feature 设计，实际上就是 `chat-cli` 的底层扩展协议设计。

---

## 十四、风险与边界

### 14.1 最大风险

最大的风险不是“技术做不到”，而是：

> 为了追求配置驱动，把本来适合代码表达的能力也强行塞进配置。

因此必须控制边界：

- 配置层只描述能力开关、位置、默认参数
- 复杂渲染、业务逻辑、桥接函数继续留在代码层

### 14.2 第二个风险

如果 `packages/chat` 直接依赖 `packages/components/src` 中尚未正式导出的内部能力，会带来新的稳定性问题。

因此建议：

- 只基于 `@opentiny/tiny-robot` 已公开导出的能力做集成
- 对尚未进入 public export 的组件，不纳入第一阶段设计前提

---

## 十五、最终建议

一句话总结：

> `packages/chat` 后续不应走“继续手工拼更多组件”的路线，而应走“把聊天高价值能力收敛成 feature，并通过 registry + adapter + preset 统一接入”的路线。

具体建议如下：

1. 保留现有 `ChatConfig` 主干不动
2. 新增 `features / layout / theme` 三层配置
3. 先做 first-party feature registry
4. 第一阶段优先把附件、Sender Actions、Suggestion、MCP、Theme 纳入 chat
5. 把 workspace / conversations / artifacts 视为第二阶段能力
6. 让 `chat-cli` 以后直接消费同一份 feature config，而不是继续在模板里手工拼装

---

## 十六、参考链接

- Vercel AI SDK Vue Getting Started  
  <https://sdk.vercel.ai/docs/getting-started/vue>
- Vercel AI Academy: Basic Chatbot  
  <https://vercel.com/academy/ai-sdk/basic-chatbot>
- LobeChat GitHub  
  <https://github.com/lobehub/lobe-chat>
- LobeHub Plugin Development  
  <https://lobehub.com/docs/development/plugins/create-plugin>
- Ant Design X Overview  
  <https://x.ant.design/components/overview>
