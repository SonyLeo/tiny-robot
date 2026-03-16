# Chat CLI Design

> 面向 `packages/chat-cli` 的后续设计文档  
> 目标：在当前基础脚手架能力之上，进一步把 `chat-cli` 演进为可扩展、可测试、可模板化、可与 `packages/chat` 稳定协同的聊天应用生成器。

---

## 一、文档定位

这份文档的定位不是“说明 `chat-cli` 怎么用”，而是：

- 对当前 `chat-cli` 实现进行结构化梳理
- 对齐业界成熟 CLI / Starter / Template Generator 的设计模式
- 明确当前已完成能力与真实边界
- 为后续模板体系、feature packs、`chat-cli` 扩展命令提供设计依据

也就是说，这份文档的目标是：

> 作为 `chat-cli` 的 vNext 设计文档，用于总结当前实现，并指导后续阶段性演进。

---

## 二、背景与目标

`create-tiny-robot` 当前已经可以：

- 生成基础聊天项目
- 选择默认 provider
- 注入项目名、README 命令、模板变量
- 输出更安全的 server proxy 默认结构
- 通过测试验证 scaffold / release / smoke 主链路

但从产品定位上看，`chat-cli` 的目标不应止步于：

> “复制一个能跑起来的聊天模板”

它更合理的长期定位应当是：

> “基于 `packages/chat` 稳定能力面，生成不同架构场景的聊天应用模板，并逐步演进成支持 feature packs、增量命令和模板治理的脚手架系统。”

因此，`chat-cli` 的核心目标可以概括为三条：

1. 成为 `packages/chat` 的正式初始化入口
2. 成为 `chat` feature 能力的模板消费层
3. 成为后续多模板、多场景、多阶段扩展的统一入口

---

## 三、业界最佳实践

### 3.1 参考对象

本设计主要参考以下公开方案：

- shadcn CLI
  - 强调 `init + add + registry + cwd + overwrite + yes`
  - 参考：<https://ui.shadcn.com/docs/cli>
- create-vue
  - 强调交互式初始化 + flags + 最小模板生成
  - 参考：<https://github.com/vuejs/create-vue>
- create-next-app
  - 强调 flags 丰富、example/template 选择、非交互模式友好
  - 参考：<https://nextjs.org/docs/app/api-reference/cli/create-next-app>
- Vercel AI SDK / Chatbot Template / RAG Template
  - 强调安全默认值、服务端代理、按架构场景拆模板
  - 参考：<https://vercel.com/academy/ai-sdk/basic-chatbot>
  - 参考：<https://vercel.com/templates/next.js/chatbot>
  - 参考：<https://vercel.com/templates/next.js/ai-sdk-rag>
- MCP 官方文档
  - 强调 tools / prompts / resources 是独立能力面，适合作为后续 feature pack 设计参考
  - 参考：<https://modelcontextprotocol.io/docs/getting-started/intro>

### 3.2 从业界实践中可以得到的共识

#### 1. CLI 必须同时支持交互式与非交互式模式

成熟脚手架通常都支持：

- 交互模式：适合新手
- flags 模式：适合自动化、CI、文档、批量生成

这意味着 `chat-cli` 不应只提供 prompts，而应始终把：

- `--template`
- `--provider`
- `--yes`
- `--overwrite`
- `--cwd`

这类能力视为正式产品能力，而不是辅助选项。

#### 2. 模板应代表“架构场景”，而不是“业务文案”

业界成熟 starter 不会把：

- 翻译助手
- 写作助手
- 客服助手

这类只是 prompt 不同的场景拆成独立模板。

更合理的顶层模板通常是：

- 基础聊天
- 工具型 Agent
- RAG / Docs Chat
- 全功能工作台

这些模板的区别，体现在：

- 目录结构
- 服务端结构
- feature 接入面
- 主 UI 形态

而不是一两句欢迎语的差异。

#### 3. 默认生成结果必须符合安全模型

Vercel AI SDK 与现代 AI 模板普遍强调：

- API Key 在服务端
- 浏览器只请求自己的代理层
- 前端只消费稳定的聊天状态和 UI

这意味着 chat-cli 的默认输出不应鼓励浏览器直连 provider。

#### 4. 模板不应长期停留在“目录复制器”阶段

成熟模板系统最终都会走向：

- base template
- registry
- add / feature packs
- migrate / sync

这也是 `shadcn` 和很多现代 generator 最值得借鉴的一点：  
初始化只是第一步，真正有产品价值的是后续扩展能力。

#### 5. 模板治理本身是产品能力

成熟 CLI 不只是“生成成功”就算完成，还应具备：

- 模板源目录卫生校验
- 未替换占位符检测
- workspace 依赖协议转换
- smoke build
- 交互和 flags 的行为测试

对 `chat-cli` 来说，这一点尤其重要，因为它已经承担了模板发布和消费两端的责任。

---

## 四、当前实现现状

### 4.1 当前已落地能力

基于当前仓库实现，`packages/chat-cli` 已经具备这些能力：

- CLI 主入口
- 基础模板 `basic`
- provider 默认值注入
- 项目名与标题注入
- 包管理器命令注入
- `_gitignore` / `_env.example` 重命名
- `workspace:*` 版本替换
- release 校验辅助脚本
- scaffold / release / smoke 三层测试基线
- 用户文档与侧边栏入口

这说明 `chat-cli` 已经不是“脚本雏形”，而是一个已成型的基础脚手架。

### 4.2 当前主链路

当前主链路大致如下：

```text
CLI flags / prompts
  -> 选择 template / provider / install strategy
  -> scaffoldProject()
  -> copy template files
  -> rename special files
  -> apply template variables
  -> replace workspace protocol deps
  -> 输出项目目录
```

对应关键实现：

- 入口：`packages/chat-cli/src/index.ts`
- 生成逻辑：`packages/chat-cli/src/scaffold.ts`
- 模板：`packages/chat-cli/templates/basic`
- 发布辅助：`packages/chat-cli/scripts/*`
- 测试：`packages/test/src/chat-cli/*`

### 4.3 当前模板结构

`basic` 模板已经从“在 `App.vue` 手写所有逻辑”收敛为更合理的配置驱动结构：

```text
src/
  App.vue
  chat.config.ts
  lib/chat.ts
server/
  chat-proxy.example.ts
.env.example
README.md
```

这条链路非常关键，因为它说明 `chat-cli` 已经开始真正消费 `packages/chat` 的正式契约：

```text
chat.config.ts
  -> createChatAdapterFromConfig()
  -> createPresetChatProps()
  -> TrChat
```

也就是说，`chat-cli` 当前已经开始从“模板复制工具”走向“chat 能力消费层”。

### 4.4 当前实现的真实边界

虽然当前主链路已经比较完整，但仍有几个明确边界：

1. 当前只有一个正式模板：`basic`
2. 模板选择仍是硬编码，不是 registry 驱动
3. 模板系统还没有真正的 `base + feature packs`
4. 还没有 `add` / `migrate` 等增量命令
5. 还没有完整的模板源目录卫生校验

换句话说：

> `chat-cli` 现在已经是一个可靠的基础脚手架，但还不是完整的模板平台。

---

## 五、当前设计的优点与不足

### 5.1 当前设计的优点

#### 1. 已与 `packages/chat` 正式契约对齐

这是当前最重要的优点。

现在模板不再只是塞一个 demo 页面，而是已经围绕：

- `ChatConfig`
- `Adapter`
- `Preset`
- `TrChat`

这条链路组织起来。

#### 2. 安全默认值已经初步成立

当前模板默认推荐：

- 前端只请求自己的 `/api/chat`
- 服务端再代理到真实 provider

这与现代 AI 应用的最佳实践一致。

#### 3. 已有基础工程护栏

包括：

- release helpers
- scaffold tests
- smoke build
- CLI 行为回归

这让 `chat-cli` 后续扩展时不至于完全失控。

### 5.2 当前设计的不足

#### 1. 模板系统还不是 registry 驱动

当前的模板选择和模板差异仍是：

- CLI 硬编码
- 单模板目录复制

它还没有正式进入：

- template definition
- template metadata
- feature mapping

这套更可扩展的结构。

#### 2. 模板仍然是“完整目录”思维

现在的核心生成方式仍然是复制一个模板目录，再替换变量。

这种方式在 1 到 2 个模板时很好用，但一旦模板数增多，会迅速带来：

- 重复文件
- README 重复维护
- 版本同步困难
- smoke 测试数量膨胀

#### 3. `chat-cli` 的扩展能力还停留在初始化层

当前能做的是：

- `init`

未来更有价值的方向其实是：

- `add feature`
- `migrate template`
- `sync config`

这些能力还没有正式设计落地。

#### 4. 模板治理还缺强约束

当前 `templates/basic` 目录仍暴露出一个值得警惕的现实问题：

- 模板源目录中出现了 `node_modules`

虽然 scaffold 复制时会排除它，但这说明模板目录卫生还没有被正式纳入治理规则。

这类问题短期不一定会污染生成结果，但长期一定会影响模板维护质量。

---

## 六、与 `packages/chat` 的关系

这是 `chat-cli` 设计中最重要的约束之一。

### 6.1 `packages/chat` 是能力层，`chat-cli` 是初始化层

更准确地说：

- `packages/chat` 负责定义聊天能力的稳定输入和稳定输出
- `chat-cli` 负责基于这些输入输出生成项目

因此：

- `chat-cli` 不应先于 `packages/chat` 发明 feature 契约
- `chat-cli` 应优先消费 `chat` 的正式能力面
- 模板设计应建立在 `chat` 的 feature registry 成熟度之上

### 6.2 什么能力适合先进入 `chat`，再进入 `chat-cli`

以下能力如果未来要成为模板差异点，更适合先在 `packages/chat` 沉淀：

- attachments
- sender actions
- suggestions
- MCP config
- docs / workspace layout

只有这些能力先在 chat 层形成稳定配置与 preset 输出，`chat-cli` 才能稳定消费。

---

## 七、推荐的模板演进方向

### 7.1 稳定模板层

建议 `v1` 级别只保留少量场景模板：

#### T1 `basic`

定位：

- 默认起步模板
- 快速接入 `TrChat`
- 配置驱动基础模板

#### T2 `agent-mcp`

定位：

- 工具型 Agent 模板
- MCP 面板与 bridge 接入模板

它是最适合在 `basic` 之后优先扩展的第二模板。

### 7.2 次级候选模板

#### T3 `docs-chat`

定位：

- 文档问答 / 知识问答模板
- 强调 docs 阅读态输出

但它应晚于 `agent-mcp`，原因是它需要最小 retrieval contract 先稳定。

#### T4 `assistant-workbench`

定位：

- 白盒进阶工程模板
- 面向高度可定制布局与 feature 编排

它不应作为早期模板，而应建立在：

- chat feature registry 稳定
- layout formalization 形成

之后再推进。

---

## 八、推荐的模板体系结构

### 8.1 短期结构

在模板数量还少时，可以先保持：

```text
templates/
  basic/
  agent-mcp/
  docs-chat/
```

但必须同步引入：

- template metadata
- template registry
- template validation

避免继续把模板仅当作目录名处理。

### 8.2 长期结构

长期更推荐的方向是：

```text
templates/
  base/
  features/
    mcp/
    docs/
    attachments/
    sender-actions/
  presets/
    basic/
    agent-mcp/
    docs-chat/
    assistant-workbench/
```

这套结构的价值在于：

- 公共文件只维护一份
- feature 可以逐步组合
- 模板差异可以映射为 `base + feature packs + preset`

这也是 `chat-cli` 最应该演进的方向。

---

## 九、建议的实现阶段

### Phase 1：Template Registry Foundation

目标：

- 把当前硬编码模板选择改成 registry 驱动

建议内容：

- 明确最小 registry schema
  - `id`
  - `label`
  - `status`
  - `templateDir`
  - `supportedProviders`
  - `requiredChatFeatures`
  - `postScaffoldSteps`
- 定义 `ChatCliTemplateDefinition`
- 增加 `template registry`
- 让 CLI 根据 registry 渲染可选模板
- 引入模板源目录卫生校验
- 清理 CLI 中旧的 “coming soon” 模板占位入口

验收标准：

- 模板不再只靠 `supportedTemplates` 这种硬编码集合
- 新模板可通过 registry 接入
- 所有正式模板都支持非交互生成
- 模板卫生问题会阻塞 `prepare:templates`

### Phase 2：第二模板 `agent-mcp`

目标：

- 在现有 `basic` 之外，落地第一个真正有结构差异的模板

建议内容：

- 增加 `agent-mcp` 模板
- 增加 MCP 相关文件注入
- 补对应 smoke / scaffold 测试

验收标准：

- `basic` 与 `agent-mcp` 都可稳定生成
- `agent-mcp` 不依赖大量模板内硬编码分支

### Phase 3：`docs-chat` 与 retrieval contract

目标：

- 在 `docs variant` 基础上，落地知识问答类模板

建议内容：

- 先定义最小 retrieval service contract
- 再落模板
- 避免在模板里写死具体向量库实现

验收标准：

- 模板具有清晰 docs UI 形态
- 模板不强绑定某个具体数据库或向量引擎

### Phase 4：Feature Packs / Add Command

目标：

- 让 CLI 从“只会初始化”走向“支持增量扩展”

建议内容：

- 设计 `add` 命令
- 让用户在已有项目中追加 feature
- 逐步从“多完整模板”转向“base + features”

验收标准：

- 新能力可增量接入
- 初始化模板数量不需要无限增长

### Phase 5：Workbench / Advanced Templates

目标：

- 为高级团队提供更强的白盒工程模板

建议内容：

- 引入 `assistant-workbench`
- 引入更明确的 layout / feature 编排模板

验收标准：

- 模板不只是页面样式变化
- 真正代表一类工程结构

---

## 十、测试与治理建议

后续阶段建议把测试分成三层：

### 10.1 Registry / Logic Tests

校验：

- template registry 定义正确
- template metadata 映射正确
- flags 与 registry 约束一致

### 10.2 Template Output Tests

校验：

- 模板变量替换
- 特殊文件重命名
- package manager 命令注入
- 生成结果结构正确

### 10.3 Template Hygiene / Smoke Tests

校验：

- 模板目录不包含 `node_modules` / `dist`
- 不残留未替换占位符
- 模板可以完成最小构建

这第三层应被视为模板系统的正式质量门槛，而不是可选附加项。

---

## 十一、风险与边界

### 11.1 最大风险：模板数量先膨胀，registry 后补

如果不先做 registry，而是先连续增加模板：

- CLI 入口会越来越硬编码
- 模板目录会快速重复
- 测试矩阵会持续变重

### 11.2 第二个风险：模板先于 chat feature 契约扩张

如果 `chat-cli` 先做很多 feature 化模板，而 `packages/chat` 还没有正式 feature registry：

- 模板会依赖大量手工 wiring
- 后续很难统一

### 11.3 第三个风险：把“场景模板”做成“业务文案模板”

如果把“翻译助手”“客服助手”“写作助手”都做成顶层模板：

- 模板数量会失控
- 维护价值很低
- 本质上只是 system prompt 不同

这类差异更适合走 preset，而不是 template。

---

## 十二、最终结论

综合当前实现、`chat-cli.md` 文档和业界实践，我对 `chat-cli` 的判断是：

### 12.1 当前已经是可靠的基础脚手架

它已经完成了：

- 安全默认值
- config-driven 基础模板
- flags 与项目名注入
- scaffold / release / smoke 测试基线
- 正式文档收口

### 12.2 但它还不是完整模板平台

最关键的缺口是：

- 模板 registry 尚未正式落地
- 模板体系仍停留在单模板复制模式
- `add / migrate / feature packs` 还没有形成正式设计与实现

### 12.3 最推荐的下一步路线

建议后续严格按这个顺序推进：

1. Template Registry Foundation
2. `agent-mcp`
3. `docs-chat`
4. `add` / feature packs
5. `assistant-workbench`

一句话总结就是：

> `chat-cli` 当前已经完成了“从 demo 复制器到基础脚手架”的跃迁，下一阶段的核心任务，是从“单模板脚手架”继续演进为“可治理、可扩展、可组合的聊天模板系统”。
