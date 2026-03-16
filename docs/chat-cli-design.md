# Chat CLI Design

> 面向 `packages/chat-cli` 的内部架构设计文档。
> 本文档负责说明 `chat-cli` 要解决什么问题、当前架构缺口在哪里、下一阶段应该把哪些能力做成正式产品能力。
> 模板矩阵与引入顺序见 [packages/chat-cli/review/template-strategy.md](../packages/chat-cli/review/template-strategy.md)。
> 执行结论见 [packages/chat-cli/chat-cli-review-02.md](../packages/chat-cli/chat-cli-review-02.md)。
> 实时状态见 [packages/chat-cli/progress.md](../packages/chat-cli/progress.md)。

---

## 1. 文档角色

这份文档不回答“用户应该怎样使用 `chat-cli`”，而是回答下面这些内部问题：

- `chat-cli` 当前到底处于什么阶段
- 它和 `packages/chat` 的正式边界是什么
- 下一阶段应该优先建设哪些架构能力
- 哪些问题已经是代码层面的真实 blocker，而不是抽象讨论

它不是模板清单，也不是进度台账。

---

## 2. 当前阶段判断

`create-tiny-robot` 当前已经完成了“可靠基础脚手架”的第一阶段。

当前已经成立的基础包括：

- 基础命令入口
- 交互式与 flags 两种初始化路径
- 默认模板 `basic`
- provider 默认值注入
- 项目名、README 命令和模板变量注入
- `_gitignore` / `_env.example` 重命名
- `workspace:*` 依赖替换
- scaffold / release / smoke 三层测试基线
- 面向用户的公开说明页

因此，下一阶段的重点不应再是“让它能生成一个项目”，而应转向：

> 把单模板脚手架升级为可治理、可扩展、可与 `packages/chat` 正式协同的模板系统。

---

## 3. 当前代码层面的真实缺口

下一阶段最重要的不是想象未来模板，而是先正视已经存在的结构性问题。

### 3.1 模板入口仍是硬编码

当前 CLI 入口仍直接维护：

- `supportedTemplates`
- 模板选择分支
- 帮助文案里的模板说明

这意味着模板体系还没有形成统一注册面。

### 3.2 交互入口里仍存在 dead-end 选项

当前交互菜单里仍然展示了若干 `coming soon` 模板占位入口。

这会带来两个问题：

- 用户可以看到不能真正使用的模板选项
- 代码层也在继续强化“模板列表写死在入口里”的结构

### 3.3 模板源目录还没有被当作可发布资产治理

当前模板复制逻辑虽然会跳过 `node_modules` 和 `dist`，但模板源目录本身已经暴露出真实卫生问题，例如模板目录中残留依赖目录。

这说明当前的“模板治理”还停留在“生成时规避”，还没有进入“发布前校验”的阶段。

### 3.4 `validate-templates` 的能力仍偏窄

当前模板校验主要覆盖：

- `workspace:*` 依赖是否已被替换

但还没有正式覆盖：

- 模板目录不得包含 `node_modules`
- 模板目录不得包含 `dist`
- 不得残留未替换占位符
- 模板 README / config / server example 的关键变量一致性

### 3.5 模板系统还没有正式的扩展层

当前 `chat-cli` 已具备初始化层能力，但还没有形成这些正式产品能力：

- template registry
- template metadata
- feature-based template composition
- `add` / `migrate` / `sync` 等增量命令

---

## 4. 设计目标

下一阶段建议围绕四个目标推进。

### 4.1 让模板入口从硬编码转向 registry-first

模板不应继续散落在 CLI 入口代码里，而应成为具备元数据、约束信息和扩展边界的正式定义。

### 4.2 保持默认生成结果符合安全模型

默认输出应继续坚持：

- 浏览器只请求自己的 `/api/chat`
- 服务端持有真实 Provider Key
- 前端围绕稳定的 `chat.config.ts -> adapter -> preset -> TrChat` 链路组织

### 4.3 把模板视作“架构场景”而不是“业务文案”

顶层模板应该表达工程结构差异，例如：

- 基础聊天
- MCP / Agent 场景
- Docs / Retrieval 场景
- 更完整的工作台场景

而不是把不同 prompt 或欢迎文案做成独立模板。

### 4.4 把模板治理本身做成产品能力

模板是否可发布、可验证、可回归，不应依赖人工约定，而应进入：

- release gate
- 测试基线
- 本地校验入口

---

## 5. 与 `packages/chat` 的边界

这是 `chat-cli` 设计里最重要的约束之一。

### 5.1 `packages/chat` 是能力层，`chat-cli` 是初始化层

更准确地说：

- `packages/chat` 定义聊天能力的稳定输入和稳定输出
- `chat-cli` 基于这些输入和输出生成项目

因此：

- `chat-cli` 不应先于 `packages/chat` 发明新的 feature 契约
- `chat-cli` 应优先消费 `chat` 的正式能力面
- 模板差异应建立在 `chat` 已稳定的 config / adapter / preset 输出之上

### 5.2 `chat-cli` 下一阶段真正依赖哪些 chat 输出

对于 `chat-cli` 来说，chat 侧最关键的下一阶段输出包括：

- feature registry foundation
- attachments / sender actions / suggestions 的稳定 config 与 preset 输出
- MCP feature config
- layout variant formalization

只有这些输出逐步稳定，`chat-cli` 才能真正把模板差异从“页面手工拼装”转成“能力组合”。

---

## 6. 推荐的目标架构

建议下一阶段把 `chat-cli` 理解为四层：

```text
CLI Commands
  -> Template Registry
  -> Scaffold Engine
  -> Template Validation / Governance
  -> Template Assets
```

### 6.1 CLI Commands

负责：

- 交互式初始化
- flags 模式
- 后续可能出现的 `add` / `migrate` / `sync`

### 6.2 Template Registry

负责：

- 模板定义
- 模板元数据
- 支持的 Provider 范围
- 依赖的 chat capability / feature
- 生成后建议步骤

Registry 应成为：

- `--template` 校验来源
- 交互式模板列表来源
- 帮助文案来源
- README 注入与后续步骤说明来源

### 6.3 Scaffold Engine

负责：

- 复制模板资产
- 重命名特殊文件
- 替换模板变量
- 处理 workspace 依赖
- 生成目标项目目录

它的职责是稳定执行，而不是承载越来越多的模板语义。

### 6.4 Template Validation / Governance

负责：

- 模板目录卫生检查
- 未替换占位符检测
- 版本与依赖一致性检测
- smoke build 约束

它应成为模板系统的正式质量门槛。

---

## 7. 设计原则

### 7.1 Registry 先于模板扩张

如果 registry 不先落地，新增模板会继续退化为 CLI 入口中的 `if/else` 集合。

### 7.2 顶层模板少而稳

顶层模板不应过多，应优先按架构场景划分，而不是按行业文案划分。

### 7.3 安全默认值内建

模板默认输出不应鼓励浏览器直连模型提供商。

### 7.4 模板治理先于模板数量

如果模板目录卫生、校验和 release gate 没立起来，模板越多，维护越失控。

### 7.5 先消费稳定 chat 契约，再扩张模板差异

`chat-cli` 的模板能力应该跟着 `packages/chat` 的正式能力走，而不是反过来倒逼 `chat` 适配。

---

## 8. 下一阶段推荐主线

从架构角度看，下一阶段最推荐的主线不是“多做几个模板”，而是：

### 8.1 Phase A: Template Registry Foundation + Hygiene

核心目标：

- 建立 template registry
- 清理 hardcoded template 入口
- 把模板目录卫生校验升级为正式发布门槛

### 8.2 Phase B: 引入第二个真正有结构差异的模板

核心目标：

- 在 registry 存在的前提下引入第二模板
- 证明 CLI 已经从“单模板复制器”进入“模板系统”

### 8.3 Phase C: 进入 `base + feature packs + add` 路线

核心目标：

- 从多个完整模板复制，过渡到更可组合的模板结构

这里的具体模板顺序和模板矩阵，不在本文展开，统一交给模板策略文档维护。

---

## 9. 非目标

当前阶段不建议把下面这些方向当成优先目标：

- 继续在 CLI 入口里增加更多 `coming soon` 模板占位
- 把业务文案差异做成顶层模板
- 在 registry 前就同时铺开多个正式模板
- 在 chat 侧契约尚未成熟前，先让模板承担大量手工 wiring

---

## 10. 一句话结论

`chat-cli` 下一阶段最重要的任务，不是“再多做几个模板”，而是：

> 先把模板入口、模板治理和 `packages/chat` 的消费边界做对，再让模板数量与能力扩展建立在稳定的 registry-first 结构上。
