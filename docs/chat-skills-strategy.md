# Chat Skills Strategy

> 面向未来 `chat-skills` 方向的低优先级草稿。
> 本文档不代表当前执行计划，只用于提前澄清职责边界、依赖方向与演进路径。
> 当前阶段仍以 `packages/chat` 能力稳定化为最高优先级。

---

## 1. 文档定位

这份文档主要回答：

1. 是否有必要将“面向大模型的 skill 资产”单独拆成一层
2. `chat`、`chat-cli`、`chat-skills` 三者分别负责什么
3. 如果未来推进，应该以什么依赖方向和治理方式落地
4. skill 与 template 的关系应该如何设计，避免两者混淆

这份文档**不是当前迭代任务**，也不要求立即新建包或目录。

---

## 2. 核心判断

### 2.1 三层解耦是合理的

推荐未来演进为：

```text
packages/chat
  -> 稳定能力与运行时契约

packages/chat-cli
  -> 稳定模板与脚手架产品化

packages/chat-skills
  -> 面向大模型的 skill / recipe / 组合说明
```

这三层不是重复建设，而是分别解决不同问题：

- `chat` 回答“系统能做什么”
- `chat-cli` 回答“用户怎样最快起一个稳定工程”
- `chat-skills` 回答“大模型怎样理解这些能力并生成应用”

### 2.2 这件事值得做，但不应早于 chat 主体能力稳定

`chat-skills` 的价值是真实的：

- 降低大模型理解 `packages/chat` 能力面的成本
- 为“按需生成 chat 应用”提供更清晰的知识入口
- 为 `chat-cli` 后续的模板推荐、模板孵化、模板晋升提供缓冲层

但其前提是：

- `feature`
- `SkillPack`
- `AgentPreset`
- `template contract`

这些上游边界已经相对稳定。  
否则 `chat-skills` 很容易因为上游频繁变动而快速漂移。

---

## 3. 职责边界建议

### 3.1 `packages/chat`

职责：

- feature contract
- SkillPack / AgentPreset
- adapter / preset / slice contract
- 组件与 composable runtime
- 稳定的结构化能力元数据导出

不负责：

- 面向大模型的 prompt 资产
- 模板产品决策
- 模型生成应用时的指导文案

一句话：

> `chat` 是能力底座，不是知识包装层。

### 3.2 `packages/chat-cli`

职责：

- template registry
- scaffold
- stable template governance
- 用户直接可选的官方模板

不负责：

- 过多实验性 recipe
- 频繁变化的大模型技能文档

一句话：

> `chat-cli` 是模板产品层，不是实验性技能仓库。

### 3.3 `packages/chat-skills`

职责：

- `SKILL.md`
- references / examples / scripts
- 面向大模型的能力说明
- 基于稳定 chat capability 的 app recipe
- 从 skill 到 template 的孵化区

不负责：

- 运行时代码真相定义
- 直接成为模板目录复制源
- 反向定义 `chat` 的能力边界

一句话：

> `chat-skills` 是面向模型的能力说明层与孵化层。

---

## 4. 依赖方向与架构约束

### 4.1 推荐依赖方向

```text
chat
  -> capability contracts

chat-cli
  -> depends on chat

chat-skills
  -> depends on chat
  -> can optionally read chat-cli template metadata
```

必须避免：

```text
chat -> chat-cli
chat -> chat-skills
chat-cli -> parse skill markdown as source of truth
```

### 4.2 真相来源必须保持单一

唯一真相来源应始终是：

- `packages/chat` 中的结构化契约与元数据

例如：

- feature keys
- SkillPack ids
- AgentPreset ids
- preset prop / preset slice contract

`chat-skills` 只能：

- 解释
- 组合
- 推荐

不能：

- 发明新的运行时能力
- 重新定义已有能力边界
- 通过文档变成事实标准

### 4.3 程序消费结构化元数据，不消费自由文本

未来如需让 CLI 或其他工具“理解 skills”，应新增结构化 registry / manifest，而不是解析 `SKILL.md` 正文。

例如：

```ts
interface ChatAgentSkillDefinition {
  id: string
  label: string
  description: string
  backedBySkillPacks: string[]
  requiredFeatures: string[]
  recommendedTemplates: string[]
  relatedPresets?: string[]
  status: 'stable' | 'experimental'
  docDir: string
}
```

关系应是：

- 程序读 registry
- 模型读 `SKILL.md`
- 两者共享同一份结构化约束

---

## 5. skill 与 template 的关系

### 5.1 skill 不等于 template

两者必须区分：

- skill：表达“想做什么”“适合组合什么能力”
- template：表达“从哪个工程骨架开始”

因此：

- 一个 skill 可以推荐多个 template
- 一个 template 也可以承载多个相近 skill

### 5.2 推荐关系应是“能力 -> 技能 -> 模板”

推荐未来采用如下链路：

```text
feature
  -> SkillPack
  -> chat-skill
  -> AgentPreset
  -> CLI template
```

解释：

- `feature` 是最小运行时能力
- `SkillPack` 是稳定可复用组合包
- `chat-skill` 是面向模型的知识入口
- `AgentPreset` 是最终场景化组合
- `template` 是最终脚手架落地

### 5.3 模板晋升路径

未来最合理的节奏不是“想到一个模板就内置”，而是：

1. 能力先在 `chat` 中稳定
2. 场景先在 `chat-skills` 中作为 skill / recipe 孵化
3. 如果验证高频、稳定、可复用，再晋升为 `chat-cli` 内置模板

一句话：

> `chat-skills` 是模板产品化之前的孵化层。

---

## 6. 为什么不建议一开始就把所有最小 feature 做成独立 skill

虽然 `history`、`mcp`、`feedback` 都是最小能力，但它们不一定适合作为模型直接消费的 skill。

原因：

1. 粒度过细，模型看完也未必知道怎样拼成完整应用
2. skill 数量会迅速膨胀，维护成本高
3. 与现有 `SkillPack` 层重复度过高

因此更推荐的 skill 粒度是：

- 围绕稳定 `SkillPack`
- 围绕稳定应用场景

而不是围绕最底层 feature key。

---

## 7. 未来的最小落地方案

### 7.1 第一阶段不新建独立包，只保留策略草稿

当前建议：

- 先不创建 `packages/chat-skills`
- 先稳定 `packages/chat`
- 等 `SkillPack / Preset / template` 边界稳定后，再进入试点

### 7.2 未来试点建议

推荐只从一个 skill 开始试点：

- `tool-agent-core`

原因：

- 当前区分度最高
- 与 `agent-mcp` 模板天然相关
- 更容易验证“skill 是否真的帮助模型生成应用”

### 7.3 首批 skill 候选

未来如进入第二阶段，可优先考虑：

- `conversation-core`
- `tool-agent-core`
- `docs-reader`

其中：

- `conversation-core` 对应最小通用会话能力
- `tool-agent-core` 对应 MCP / tool 协作场景
- `docs-reader` 对应 docs layout / docs chat 场景

---

## 8. 建议的目录草案

仅供未来参考：

```text
packages/chat-skills/
  src/
    registry.ts
    types.ts
  skills/
    conversation-core/
      SKILL.md
      references/
      examples/
    tool-agent-core/
      SKILL.md
      references/
      examples/
    docs-reader/
      SKILL.md
      references/
      examples/
```

如果未来需要接入 OpenAI / Claude Code 风格的 skills UI 元数据，再补：

```text
skills/<id>/agents/openai.yaml
```

---

## 9. 推进前置条件

只有满足以下条件后，才建议正式推进 `chat-skills`：

1. `packages/chat` 的 feature / SkillPack / AgentPreset 边界已经基本稳定
2. `chat-cli` 模板体系已经具备稳定 registry 和治理规则
3. 团队愿意长期维护一层“模型文档资产”
4. 明确接受“skill 不一定晋升为模板”的产品策略

如果这些条件尚未满足，推荐继续将这件事保持在草稿阶段。

---

## 10. 当前建议

当前结论：

- 方向是合理的
- 但优先级明显低于 `packages/chat` 当前结构收口
- 现阶段最合适的动作，是保留这份策略草稿
- 等 `chat` 能力面稳定后，再决定是否进入单-skill 试点

一句话总结：

> `chat-skills` 值得作为未来的模型能力层与模板孵化层存在，但它必须建立在稳定的 `chat` 契约和稳定的 `chat-cli` 模板治理之上，而不是抢跑成为新的真相来源。
