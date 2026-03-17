# Chat Kit Execution Explainer

> 面向 `packages/chat` 下一阶段执行方案的对内讲解文档。
> 本文档负责把“为什么这样做、接下来怎么做、如何向别人解释”讲清楚。
> 设计源见 [chat-kit-design.md](./chat-kit-design.md)。
> 执行决议见 [packages/chat/chat-kit-review-02.md](../packages/chat/chat-kit-review-02.md)。
> 实时状态见 [packages/chat/progress.md](../packages/chat/progress.md)。

---

## 1. 这份文档回答什么问题

这份文档不重复设计文档和进度文档的职责，而是集中回答下面几个更适合对内沟通的问题：

- `packages/chat` 当前真正缺的是什么
- 为什么下一阶段不是继续堆 props、堆页面、堆模板
- 为什么要先做 feature registry foundation
- 后续 attachments / sender actions / suggestions / MCP / layout 各自应该怎么理解
- 黑盒、白盒、`chat-cli` 为什么必须共享同一套能力底座
- 这个阶段划分和业界成熟方案相比，到底借鉴了什么

一句话说，它是一份“讲给团队听”的解释文稿。

---

## 2. 一句话主结论

`packages/chat` 接下来的主线，不是继续补聊天基础组件，而是：

> 把已经存在的聊天运行时能力，系统化升级为稳定、声明式、可被黑盒、白盒和 `chat-cli` 共同消费的 feature 契约。

这里最重要的关键词不是“新组件”，而是：

- 稳定
- 声明式
- 可复用
- 可生成

---

## 3. 当前真实问题到底是什么

如果只看表面，会以为 `packages/chat` 还缺很多东西。

但从当前代码和设计结论看，实际情况不是“没有能力”，而是“能力已经有了，但能力的装配方式还不稳定”。

当前已经存在的基础包括：

- 黑盒入口：`TrChat`
- 白盒入口：`TrChat.Root / Layout / Header / Welcome / MessageList / Footer / Sender / History`
- 状态组合层：`useChatKit`
- 配置主链路：`ChatConfig -> createChatAdapterFromConfig() -> createPresetChatProps()`
- 已存在的场景能力：历史、反馈、模型切换、重试、optimistic / rollback、MCP 接入、docs variant、统一消息动作入口

从实现上也能看出，`packages/chat` 已经在消费 TinyRobot 的原子能力，而不是从零造轮子：

- `ChatSender.vue` 直接包裹 `TrSender`
- `AttachmentsRenderer.vue` 直接包裹 `TrAttachments`
- `ChatWelcome.vue` 直接包裹 `TrWelcome` 和 `TrPrompts`
- `ChatMcpPanel.vue` 直接包裹 `TrMcpServerPicker`

所以真正的差距，不在“有没有 Sender / Attachments / Prompts / MCP Picker”，而在：

1. 这些能力是否有统一声明入口
2. 是否有统一解析入口
3. 黑盒和白盒是否共享同一套默认能力
4. `chat-cli` 是否能稳定消费这些能力

也就是说，当前偏窄的是：

- 配置层
- adapter 层
- feature 装配层

而不是底层原子组件层。

---

## 4. 为什么不能继续按老路往前走

如果不先解决装配层问题，继续沿着“页面手工 wiring”前进，会出现三个很现实的问题。

### 4.1 `TrChat` 会越来越像“大 props 容器”

每加一个高频能力，都往 `TrChatProps` 里补几个离散字段，短期快，长期一定失控。

最后会变成：

- 配置入口分散
- 默认值逻辑分散
- 黑盒行为难预测
- 白盒难复用

### 4.2 高价值能力会停留在“demo 可拼、页面可接”

比如：

- attachments
- sender actions
- suggestions
- drag upload
- conversations navigation
- 更完整的 MCP 管理

这些能力如果只是“原子组件有了”和“某个 demo 能拼出来”，那它们仍然不算 `chat` 的正式能力。

### 4.3 `chat-cli` 会继续走“复制页面”路线

如果底层没有稳定的 feature 契约，CLI 模板就只能依赖：

- 不同版本的 `App.vue`
- 大量页面层 if/else
- 手工拼 welcome / sender / side panel / MCP

这类模板越多，债越大。

---

## 5. 我们真正要建设的是什么

下一阶段的核心建设目标，可以用这条链路概括：

```text
ChatConfig
  -> Adapter Layer
  -> Feature Registry / Resolver
  -> Preset / Shared Runtime Output
  -> TrChat Blackbox / White-box Composition / chat-cli
```

和当前相比，新增的关键层是：

- `Feature Registry`
- `Feature Resolver`

这层的职责不是开放插件市场，而是先把 first-party feature 统一起来。

它至少要回答这些问题：

- 某个 feature 是否启用
- 启用后默认行为是什么
- 是否依赖某些运行时状态
- 如何映射到 preset
- 黑盒怎么消费
- 白盒怎么消费
- `chat-cli` 后续怎么消费

这就是为什么 `Phase A` 不是“可选优化”，而是后续所有 feature 化工作的前置条件。

---

## 6. 为什么 Phase A 要先做

当前配置链路大致是：

```text
ChatConfig
  -> createChatAdapterFromConfig()
  -> createPresetChatProps()
  -> TrChat
```

问题在于，当前 `ChatConfig` 主要还是：

- `models`
- `providers`
- `defaults`
- `ui`

也就是说，它还更像“模型与基础 UI 配置”，还不是“feature 配置中心”。

这会直接带来几个限制：

- 新能力没有正式的 config 入口
- preset 只能继续摊平字段
- 黑盒和白盒共享的是 props 结果，而不是 feature resolution 结果
- CLI 只能消费“基础 preset”，还消费不了“能力组合”

所以 `Phase A: Registry Foundation` 的核心不是做新 UI，而是做两件更基础的事：

1. 建立 feature 注册与解析基础设施
2. 让 adapter / preset 优先围绕 feature 结果组织输出

如果没有这一步，后面的 attachments、suggestions、MCP 都只会继续散落在页面层。

---

## 7. 分阶段到底怎么理解

### 7.1 Phase A: Registry Foundation

这是“修路阶段”。

目标不是做出最多用户可见的新效果，而是先建立统一装配层。

这一步完成后，团队应当能明确：

- feature 放在哪里定义
- feature 如何从 config 进入 adapter / preset
- 哪些结果对黑盒、白盒和 CLI 是稳定输出

这一步的衡量标准不是“页面多炫”，而是：

- 至少一个内建 feature 能完整走通 registry -> resolver -> preset
- 现有黑盒和白盒不回退
- `createPresetChatProps()` 不再朝“大 if/else 中心”演化

### 7.2 Phase B: High-value Features

这是“把高频能力收编为正式 feature”的阶段。

优先级已经很明确：

1. attachments
2. sender actions
3. suggestions

为什么是它们先做：

- 高频
- 直接影响聊天主体验
- 当前最容易散落在 demo 和页面层
- 一旦稳定下来，对 `chat-cli` 的模板组合价值很高

### 7.3 Phase C: MCP Config + Layout Formalization

这是“正式划边界”的阶段。

这一步不是再造 MCP，也不是先做大 workspace，而是把两个问题拆清楚：

- feature 决定有没有这个能力
- layout 决定能力摆在哪里

这个阶段最重要的价值，是避免未来把“MCP 能力”和“MCP 抽屉 UI”绑死，把“suggestions 能力”和“welcome 区展示方式”绑死。

### 7.4 Phase D: Template / CLI Consumption

这是“让模板系统真正消费能力”的阶段。

到这一步，`chat-cli` 才能从“复制页面”升级成“组合 capability”。

也就是说，模板差异要开始来自：

- feature 组合
- layout variant

而不是来自：

- 手工改 `App.vue`
- 多份页面逻辑复制

---

## 8. 结合使用场景怎么讲

下面这些例子最适合用来对团队解释“为什么要这样做”。

### 8.1 场景一：客服聊天，支持附件上传与附件消息展示

业务目标：

- 用户能上传截图和 PDF
- 消息区要显示附件卡片
- 附件支持预览和下载
- 黑盒、白盒和模板生成结果要尽量一致

如果不做 feature 化，通常会变成：

- 页面在 sender slot 里插上传按钮
- 页面自己管理文件约束
- 消息渲染再自己判断附件展示
- 黑盒和白盒各接一套

结果就是一个“附件能力”被拆散在多个层里。

更理想的 feature 配置形态应该像：

```ts
const chatConfig = {
  features: {
    attachments: {
      enabled: true,
      upload: {
        accept: ['image/*', '.pdf'],
        maxCount: 5,
        maxSizeMB: 20,
      },
      message: {
        preview: true,
        download: true,
      },
    },
  },
}
```

这里表达的是业务意图，而不是页面细节。

resolver 再把它落到统一运行时输出：

- sender 侧是否显示 upload action
- sender 允许选择哪些文件
- 消息区是否渲染附件卡片
- 黑盒默认行为和白盒消费结果是否一致

这时 `packages/chat` 沉淀的就不是某个上传按钮，而是“聊天场景中的附件能力契约”。

### 8.2 场景二：企业智能助手，输入区支持多个高频动作

业务目标：

- 支持上传
- 支持语音输入
- 支持字数统计
- 支持“深度思考”开关
- 支持“联网搜索”开关

如果完全依赖页面 slot 和 demo 拼法，马上会遇到这些问题：

- 每个页面都自己决定按钮顺序
- 每个页面都自己决定状态注入方式
- 哪些动作会影响请求上下文，没有统一约束
- 黑盒和白盒会越来越不一致

更合理的表达方式是把它收敛成 `senderActions` feature：

```ts
const chatConfig = {
  features: {
    senderActions: {
      enabled: true,
      items: [
        { type: 'upload' },
        { type: 'voice' },
        { type: 'wordCount' },
        { type: 'toggle', key: 'reasoning', label: '深度思考' },
        { type: 'toggle', key: 'webSearch', label: '联网搜索' },
      ],
    },
  },
}
```

这样 `packages/chat` 负责沉淀的是：

- 动作的声明方式
- 动作的默认编排
- 动作与请求参数的关系
- 黑盒和白盒的共享消费方式

而不是把 `Sender` 的每一个 slot 直接变成业务 API。

### 8.3 场景三：知识库问答页，空状态展示建议问题

业务目标：

- 首次进入聊天页时展示建议问题
- 点击建议后快速发起提问
- 同一套建议能力在普通聊天、docs-chat、workspace 中都能复用

如果不 feature 化，这类能力最容易散落在：

- welcome 区
- docs 页面
- demo 卡片

更合理的形式是：

```ts
const chatConfig = {
  features: {
    suggestions: {
      enabled: true,
      trigger: 'empty-state',
      items: [
        { label: '帮我总结这篇文档', prompt: '请总结这篇文档的核心内容' },
        { label: '列出 API 使用步骤', prompt: '请列出该 API 的使用步骤' },
        { label: '给我一个 Vue 示例', prompt: '请给我一个 Vue 示例' },
      ],
    },
  },
}
```

这时候需要强调两个边界：

- `suggestions` feature 决定能力是否存在
- `layout` 决定建议显示在 welcome 区、sender 上方、侧栏还是别处

这正是“feature 与 layout 必须分离”的典型例子。

### 8.4 场景四：Agent 聊天，带 MCP 插件管理

业务目标：

- 聊天实例支持 MCP
- 可以启停插件
- 可以启停 tools
- 某些场景禁止删除插件
- UI 上可能是普通抽屉，也可能是 workspace 面板

当前 MCP 基础接入已经存在，但如果它还依赖页面层手工 wiring 才能生效，就说明它还不是稳定 feature。

更理想的能力声明可以是：

```ts
const chatConfig = {
  features: {
    mcp: {
      enabled: true,
      allowPluginToggle: true,
      allowToolToggle: true,
      allowPluginDelete: false,
    },
  },
  layout: {
    variant: 'workspace',
    placements: {
      mcpEntry: 'header-extra',
      mcpPanel: 'right-drawer',
    },
  },
}
```

这里要讲清楚：

- `mcp` feature 管的是能力边界和许可边界
- `layout` 管的是入口和面板摆放

如果这两层不拆开，后面每做一个新布局，MCP 都会重新耦合一遍。

### 8.5 场景五：同一个能力，不同布局下的呈现

这是最适合解释“为什么 layout 必须后置但必须正式化”的场景。

以 suggestions 为例：

- 普通聊天：欢迎区下方
- docs-chat：文档摘要区下方
- workspace：左侧任务面板

这三种页面长相不同，但本质上不是三个 suggestions 功能，而是：

- 同一个 feature
- 不同 layout placement

如果不把这层关系讲清楚，后续会自然演化成：

- docs 版 suggestions
- workspace 版 suggestions
- bubble 版 suggestions

最终每个能力都裂成多份实现。

### 8.6 场景六：为什么黑盒、白盒和 CLI 必须共享一套结果

使用方会有三类典型模式：

1. 直接用 `TrChat`
2. 用白盒组合 API 自己拼
3. 通过 `chat-cli` 生成模板项目

如果没有共享能力底座，就会出现：

- 黑盒能开某能力，白盒得重接
- 白盒能拼某能力，黑盒没有正式默认
- CLI 只能复制页面，不能消费 capability

所以更合理的目标形态是：

```ts
const resolved = resolveChatFeatures(chatConfig)
```

然后：

- 黑盒消费 `resolved`
- 白盒也消费 `resolved`
- CLI 未来消费同源元数据或解析结果

这就是“共享能力底座”的真正含义。

### 8.7 场景七：如果后续支持 Agent Skills，chat 里会怎么用

这里说的 `skills`，指的是以 `https://agentskills.io/home` 为代表的公开 Agent Skills 格式。

它的核心特征不是“一个神秘插件对象”，而是：

- skill 是一个目录
- 目录里至少包含一个 `SKILL.md`
- 可选携带 `scripts/`、`references/`、`assets/`
- agent 通过 progressive disclosure 方式按需加载 skill

如果未来 `packages/chat` 在后置阶段支持 Agent Skills，更合理的接入方式不是把 skill 直接塞进 `TrChat`，而是把它作为 capability bundle 来消费。

最典型的使用流程应当是：

1. 会话启动时，只发现和暴露 skill catalog，也就是 skill 的 `name + description`
2. 当用户问题或当前任务命中某个 skill 描述时，再激活 skill，读取完整 `SKILL.md`
3. 如果 `SKILL.md` 引用了 `references/` 或 `scripts/`，再按需继续加载
4. skill 最终解析回标准 capability 输出，而不是绕过 feature registry 直接改页面

下面是几个适合 `chat` 场景的例子。

#### 例子 A：项目级 docs-retrieval skill

假设某个仓库内存在：

```text
<project>/.agents/skills/docs-retrieval/
  ├── SKILL.md
  ├── references/
  │   └── retrieval-guidelines.md
  └── assets/
      └── query-template.md
```

这个 skill 的用途可以是：

- 当用户提问 API、SDK、文档摘要时，提示 agent 使用特定检索流程
- 给出查询模板、回答结构和注意事项
- 绑定一组 docs search 相关 MCP tools

在 `chat` 里更合理的消费方式是：

- skill 被发现后进入 catalog
- 命中时激活 `SKILL.md`
- resolver 把它映射为：
  - `suggestions`
  - docs retrieval 相关 prompts
  - MCP / tools binding
  - `layout.variant = 'docs'` 的 hint

这样 `docs-chat` 后续消费的是标准 capability 结果，而不是某个页面特判“如果有 docs skill 就手工改 UI”。

#### 例子 B：用户级 customer-support-runbook skill

假设用户本地有一个跨项目通用 skill：

```text
~/.agents/skills/customer-support-runbook/
  ├── SKILL.md
  ├── references/
  │   ├── escalation-policy.md
  │   └── response-style.md
  └── assets/
      └── reply-template.md
```

这个 skill 的用途可以是：

- 客服问答时套用统一回复风格
- 在识别到投诉、退款、升级支持等场景时，引导 agent 走既定流程
- 给出推荐回复模板和升级规则

在 `chat` 里，这类 skill 不应直接等价于一个新页面模板，而应被映射为：

- welcome / empty-state suggestions
- sender command 或常用 prompts
- 可能的 attachments 约束
- 可能的 workflow hints

这样同一个客服 runbook skill 可以被多个模板、多个页面和后续 CLI/workflow 共用。

#### 例子 C：项目级 code-review skill

假设某个开发项目内有：

```text
<project>/.agents/skills/code-review/
  ├── SKILL.md
  ├── scripts/
  │   └── collect-diff-summary.sh
  └── references/
      └── review-checklist.md
```

它的用途可以是：

- 代码评审时自动套用检查清单
- 在需要时调用脚本生成 diff 摘要
- 约束 agent 先读 checklist 再输出 review 结论

这类 skill 对 `chat` 的价值不是“多了一个 code review 页面”，而是：

- 为 agent preset 提供一组稳定 instructions
- 为 sender 或消息动作提供特定入口
- 为后续 workflow 提供一个可复用的审查能力包

也就是说，skill 更像“场景能力组合”，不是“页面变体本身”。

#### 例子 D：agent-mcp-builder skill

再比如一个更偏 agent 能力建设的 skill：

- 目标是指导 agent 生成或接入 MCP server
- 提供相关参考文档、模板和脚本
- 自动建议打开一组 MCP 管理能力

在 `chat` 中，这类 skill 更应该解析为：

- MCP 相关 prompts / commands
- `mcp` feature 的默认开关和入口 hint
- 一组推荐的 sender actions

而不是让 skill 直接接管整个 MCP 面板。

这个例子很适合说明：

- feature 是基础原语
- skill 是这些基础原语的组合包

### 8.8 为什么 Agent Skills 更适合作为后置扩展

把 Agent Skills 放到后置阶段，不是因为它不重要，而是因为它天然依赖下面这些基础能力先稳定：

- feature registry / resolver
- MCP / tools binding
- prompts / commands 的正式入口
- layout hints / variant
- preset / CLI 的标准消费链路

否则 skill 很容易退化成：

- 页面级特判
- 模板级手工 wiring
- 绕过 feature registry 的大黑盒

这与 Agent Skills 自己倡导的集成方式也是相反的。按 `agentskills.io` 的做法，skills 更适合作为：

- 可发现的 catalog
- 可按需激活的 instructions bundle
- 可选脚本与参考资料包

而不是一上来就替代 agent 的核心 capability 层。

---

## 9. 为什么 CLI 现在不能先扩模板

这个问题几乎一定会被问到。

表面上看，先多做几个模板似乎推进更快，但如果 feature 契约还没稳定，CLI 只能走“复制页面”路线。

例如：

- 模板 A 复制一个 `App.vue`
- 模板 B 再复制一个 `App.vue`
- 各自在页面里接 sender actions、welcome、MCP、attachments

这种方式的问题是：

- 模板差异来自页面复制
- 不来自能力组合

最终模板越多，维护越失控。

真正成熟的目标应当是：

```ts
createTemplate({
  base: 'chat',
  features: ['attachments', 'suggestions'],
  layout: 'docs',
})
```

或者：

```ts
createTemplate({
  base: 'chat',
  features: ['mcp', 'senderActions'],
  layout: 'workspace',
})
```

也就是说，模板应该逐步变成“capability consumer”，而不是“页面复制器”。

这也是为什么 `chat-cli` 的正式消费要放在 `Phase D`。

---

## 10. 结合业界成熟方案，我们借鉴了什么

这里最重要的是强调“借鉴分层思想”，而不是照搬实现。

### 10.1 Vercel AI SDK / AI Elements

Vercel 的公开方向非常强调：

- 用统一状态层管理聊天与流式过程
- 用可组合 UI 元素渲染消息、输入、工具与附件
- 把“AI 状态管理”和“界面渲染结构”拆开

对我们最有启发的不是具体 React API，而是这种分层方式：

- 状态主链路稳定
- 组件是可组合的
- 更高层产品再基于能力装配来组织体验

这与我们把 `useChatKit` 作为底座、再往上引入 feature registry / preset 的方向是一致的。

参考：

- [AI SDK](https://vercel.com/docs/ai-sdk)
- [AI Elements | Vercel Academy](https://docs.vercel.com/academy/ai-sdk/ai-elements)
- [Introducing AI Elements](https://vercel.com/blog/introducing-ai-elements)

### 10.2 Ant Design X

Ant Design X 的组件体系是一个很典型的例子：

- `Bubble`
- `Prompts`
- `Sender`
- `Attachments`
- 各类会话交互组件

它强调的是“聊天原子能力的可组合性”，而不是一开始就把所有东西塞进单一场景组件。

对我们的启发是：

- 原子能力应继续留在组件层
- `packages/chat` 应承担场景装配职责
- 场景层不应简单复制原子组件，而应收敛聊天能力契约

参考：

- [Ant Design X Overview](https://x.ant.design/components/overview/)
- [Bubble - Ant Design X](https://x.ant.design/components/bubble/)

### 10.3 LobeChat

LobeChat 在插件体系和能力分层上的实践很值得参考。

它的启发主要不在于具体 UI，而在于：

- 扩展能力需要正式边界
- 插件系统要先稳定能力接口，再扩张生态
- 高层体验不能建立在脆弱的页面拼装之上

这和我们先做 registry foundation，再把高频能力沉淀成 first-party features，再让模板消费它们，本质上是同一路线。

参考：

- [LobeChat Plugin System](https://lobehub.com/it/docs/usage/features/plugin-system)
- [LobeChat Plugins Gateway](https://github.com/lobehub/chat-plugins-gateway)

### 10.4 MCP 官方架构

MCP 官方文档最值得借鉴的是它对边界和能力协商的强调：

- host / client / server 分层明确
- capability negotiation 明确
- prompts 是用户可控制触发的
- sampling 必须保留用户控制和审查空间

对我们的直接启发是：

- MCP 在 UI 层也不应被当作“一个随手塞进页面的抽屉”
- 应先定义能力边界，再决定入口和布局
- feature 与 layout 分离，符合 MCP 本身的边界意识

参考：

- [Architecture - Model Context Protocol](https://modelcontextprotocol.io/specification/2024-11-05/architecture)
- [Prompts - Model Context Protocol](https://modelcontextprotocol.io/docs/concepts/prompts)
- [Sampling - Model Context Protocol](https://modelcontextprotocol.io/docs/concepts/sampling)

### 10.5 Agent Skills（agentskills.io）

如果把我们前面讨论的 `skill pack` 和公开生态做对照，最接近的公开格式就是 Agent Skills：

- skill 是一个目录
- 以 `SKILL.md` 作为入口
- 可附带脚本、参考资料和资源文件
- 通过 progressive disclosure 控制上下文成本
- 兼容项目级和用户级 skill 扫描

它对我们最大的启发不是“马上引入 marketplace”，而是：

- skills 是能力包，不是底层原语
- skills 适合建立在稳定 capability 层之上
- skills 的接入重点在 discovery、activation、resolution，而不是先做 UI 特例

这和我们把 `Agent Preset / Skill Pack Foundation` 后置到 capability 主链路稳定之后，是一致的。

参考：

- [Agent Skills Overview](https://agentskills.io/home)
- [What are skills?](https://agentskills.io/what-are-skills)
- [Specification](https://agentskills.io/specification)
- [How to add skills support to your agent](https://agentskills.io/client-implementation/adding-skills-support)

---

## 11. 当前阶段明确不建议做什么

为了让团队更容易统一判断，下面这些方向在当前阶段不应优先推进：

- 继续给 `TrChat` 增加大量离散 props
- 把 `packages/components` 的原子组件大规模平移成 `TrChat.*`
- 先在 demo 或页面里拼出新功能，再反向要求 `chat` 去适配
- 在 feature 契约未稳定前，先扩张 CLI flags 或模板分支
- 在 attachments / sender actions / suggestions / MCP 正式收敛前，优先投入 theme 或 workspace shell

这些事不是永远不做，而是现在做会把结构带偏。

---

## 12. 如何向团队做 5 分钟版本说明

如果只给 5 分钟，我建议这样讲：

`packages/chat` 现在缺的不是组件，而是能力装配层。我们已经有 Sender、Attachments、Prompts、MCP Picker 这些基础能力，也已经有 `TrChat`、白盒组合和 `useChatKit`。问题是这些能力还没有被统一声明、统一解析、统一输出，所以它们还停留在“能拼、能接、但不稳定”的状态。

下一阶段首先要做的是 `feature registry + resolver`。这是为了让能力先进入 `ChatConfig -> Adapter -> Preset` 这条正式链路，避免继续在页面和 demo 里散落。然后才是把 attachments、sender actions、suggestions 这些高频能力正式 feature 化。再之后才轮到 MCP 和 layout 边界正式化，最后 `chat-cli` 才能真正基于 capability 生成模板。

换句话说，我们不是要多做几个聊天页面，而是先把聊天能力的底层装配方式做对。这样黑盒、白盒和 `chat-cli` 才能消费同一套能力结果，而不是各写各的。

---

## 13. 一句话结论

`packages/chat` 下一阶段最重要的任务，不是继续补聊天基础，不是先扩模板，也不是先扩 shell，而是：

> 先建立稳定的 feature registry foundation，再把高频聊天能力沉淀为可声明、可解析、可复用、可被 `chat-cli` 稳定消费的能力契约。
