# Chat CLI Template Strategy

> 面向 `packages/chat-cli` 的模板体系策略文档。
> 本文档只负责回答“应该有哪些模板、为什么是这个顺序、每个模板依赖哪些上游契约”。
> 架构设计见 [docs/chat-cli-design.md](../../../docs/chat-cli-design.md)。
> 执行结论见 [../chat-cli-review-02.md](../chat-cli-review-02.md)。
> 实时状态见 [../progress.md](../progress.md)。

---

## 1. 文档角色

这份文档不重复完整架构设计，也不承担实时进度追踪。

它主要回答：

1. 顶层模板应该如何分类
2. 哪些模板值得优先进入稳定模板集
3. 每个模板依赖哪些 `chat` 与 `chat-cli` 前置能力
4. 模板体系长期应如何从“完整模板”过渡到“可组合模板”

---

## 2. 模板策略的基本判断

### 2.1 顶层模板应该按“架构场景”划分

顶层模板更适合表达这些差异：

- 主 UI 形态
- 服务端结构
- 上游能力接入面
- 项目工程组织方式

而不是只表达：

- system prompt 不同
- 欢迎文案不同
- 默认 prompts 不同

因此：

- “基础聊天”“Agent + MCP”“Docs / Retrieval”“Workbench”适合做顶层模板
- “翻译助手”“写作助手”“客服助手”更适合留在配置或 preset 层

### 2.2 模板数量应晚于 registry

没有 registry 的多模板，最终都会退化为：

- CLI 入口硬编码
- 帮助文案硬编码
- 测试矩阵和 README 手工同步

所以模板扩张的前提不是“又想到一个好模板”，而是“模板系统已经有正式注册面”。

### 2.3 模板体系长期应走向 `base + feature packs + add`

短期内可以容忍少量完整模板并存。  
但长期看，更合理的方向是：

- `base` 提供运行时骨架
- `preset` 表达默认场景
- `features` 提供可组合能力
- `add` 负责增量接入

---

## 3. 当前模板策略约束

在当前阶段，模板策略必须同时受到两类约束：

### 3.1 `chat-cli` 自身约束

当前 CLI 还没有正式的 template registry，也没有 `add` / `migrate` 能力。

这意味着：

- 不能同时铺开太多正式模板
- 新模板必须具备明显结构差异
- 模板引入顺序必须非常克制

### 3.2 `packages/chat` 上游契约约束

`chat-cli` 的模板扩张不能先于 `packages/chat` 的公共契约。

对模板策略最关键的上游依赖包括：

- feature registry foundation
- MCP config
- docs / workspace layout formalization
- retrieval contract

因此，模板顺序不仅是产品选择，也是上游契约成熟度的映射。

---

## 4. 顶层模板引入标准

一个新模板要进入正式模板集，建议至少满足这些条件：

1. 它代表的是一类稳定的工程场景，而不是一句提示词差异
2. 它依赖的 `chat` 能力已经有稳定 config / preset 输入
3. 它能够通过 scaffold、smoke、template hygiene 测试
4. 它不会让 CLI 入口继续堆更多特殊分支
5. 它对用户来说有清晰、独立的价值感知

不满足这些条件的，优先考虑：

- 放在配置层
- 放在 preset 层
- 等待上游契约成熟后再升级为正式模板

---

## 5. 推荐模板矩阵

### 5.1 总览

| 模板 | 场景定位 | 依赖的 chat 能力 | 依赖的 CLI 基础设施 | 推荐阶段 | 当前判断 |
|:--|:--|:--|:--|:--|:--|
| `basic` | 默认起步模板 | 当前稳定 `config -> adapter -> preset -> TrChat` | 现有 scaffold 即可 | 已有 | 继续保留 |
| `agent-mcp` | 工具型 Agent / Copilot 模板 | MCP feature config、最小 bridge 接入 | template registry、模板治理 | Phase B | 第二优先模板 |
| `docs-chat` | 阅读态 / 检索问答模板 | docs layout 能力、retrieval contract | template registry、模板治理 | Phase C | 不能早于 retrieval |
| `assistant-workbench` | 更完整的白盒工作台模板 | feature registry、layout formalization、多 feature 组合 | registry、feature composition、后续 `add` | 更后阶段 | 不宜提前 |

### 5.2 `basic`

定位：

- 默认模板
- 新手起步模板
- 当前稳定能力的最小工程化消费入口

价值：

- 上手门槛最低
- 最适合承载安全默认值
- 是后续所有模板的能力基线参考

注意点：

- `basic` 应逐步拆成 `base runtime skeleton + basic preset`
- 不应继续无限承载未来所有模板的公共职责

### 5.3 `agent-mcp`

定位：

- 面向 Agent、Copilot、工具协作场景的第二模板

为什么优先：

- 它比 `docs-chat` 更少依赖额外契约
- 它能明显体现 `chat-cli` 已经不只是“基础聊天页生成器”
- 它和 `packages/chat` 当前正在推进的 MCP 配置化方向高度相关

前置条件：

- chat 侧最小 MCP feature config 明确
- CLI 已接入 template registry
- 模板卫生校验已成为发布门槛

结论：

- 推荐作为下一阶段最优先的第二模板

### 5.4 `docs-chat`

定位：

- 阅读态 / 文档问答 / 知识问答模板

为什么暂缓：

- `docs` 样式本身不是难点
- 真正的难点是 retrieval contract 还没正式收口
- 如果先做模板，再补 contract，会让模板承担过多手工 wiring

前置条件：

- retrieval route / service contract 明确
- docs layout 相关能力稳定

结论：

- 应放在 `agent-mcp` 之后
- 当前不建议作为第一批稳定多模板的一部分

### 5.5 `assistant-workbench`

定位：

- 面向高级团队的更完整白盒工程模板

为什么后置：

- 它依赖多个 feature 契约成熟
- 它依赖 layout formalization
- 它依赖 CLI 已具备模板组合能力，而不只是完整目录复制

结论：

- 适合进入更后阶段，而不是当前轮次

---

## 6. 为什么不推荐“业务文案模板”

这些差异不适合做顶层模板：

- 翻译助手
- 写作助手
- 客服助手
- 周报助手

原因很简单：

- 它们通常只是在 prompt、品牌文案、默认 welcome prompts 上不同
- 不足以形成独立的工程结构差异
- 如果把这些都做成模板，模板数量会很快失控

这类差异更适合沉淀在：

- `chat.config.ts`
- preset
- 后续的 feature packs

---

## 7. 推荐的模板体系演进路径

### 7.1 短期

短期内可以先容忍少量完整模板并存：

```text
templates/
  basic/
  agent-mcp/
  docs-chat/
```

但这必须建立在：

- template registry
- template metadata
- 模板目录卫生校验

已经落地的前提下。

### 7.2 中期

中期建议过渡到：

```text
templates/
  base/
  presets/
    basic/
    agent-mcp/
    docs-chat/
  features/
    mcp/
    attachments/
    sender-actions/
    welcome-prompts/
```

这里的价值在于：

- 公共文件只维护一份
- 模板差异更像 preset 差异
- feature 可以逐步走向增量接入

### 7.3 长期

长期更理想的方向是：

```text
init
  -> choose preset
  -> scaffold base
  -> compose features
  -> add / migrate / sync
```

也就是说，顶层模板逐渐变少，能力组合逐渐变多。

---

## 8. 推荐的实施顺序

建议严格按这个顺序推进：

1. 先建立 template registry 和模板治理规则
2. 再推出 `agent-mcp`
3. 等 retrieval contract 明确后再评估 `docs-chat`
4. 之后再推进 `base + feature packs + add`
5. 最后再考虑 `assistant-workbench`

这个顺序的核心理由是：

- 先把体系做对
- 再增加模板数量
- 再让模板逐步走向可组合

---

## 9. 新模板的验收标准

每新增一个正式模板，建议至少通过这三层检查：

### 9.1 产品层

- 是否真的代表一个独立场景
- 是否和现有模板存在清晰边界

### 9.2 架构层

- 是否依赖稳定的 chat 契约
- 是否已进入 registry
- 是否没有继续把逻辑塞回 CLI 入口硬编码

### 9.3 质量层

- 是否通过 scaffold 测试
- 是否通过 smoke 构建
- 是否通过 template hygiene 校验

---

## 10. 一句话结论

如果只给一个最重要的策略建议，就是：

> 不要先增加模板数量，先把模板体系做成 registry-first，并让每个顶层模板都代表清晰、稳定、可验证的架构场景。
