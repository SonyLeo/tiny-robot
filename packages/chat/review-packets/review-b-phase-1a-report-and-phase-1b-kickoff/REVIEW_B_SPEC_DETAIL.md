# Review B Spec Detail

## 1. 这份文档解决什么问题

这份文档是 `Review B` 的详细说明底稿。

它不是给评审人速读的 memo，而是给 owner 在下面三种场景使用：

1. 你自己需要把 `Phase 1A` 的结果讲顺
2. 对方在评审里追问“你到底证明了什么、哪里有偏差、为什么现在可以进入 `Phase 1B`”
3. 会后需要把评审结论回写到规范文档、tracker 和下一阶段计划

`Review B` 和 `Review A` 的角色不一样：

- `Review A` 负责把方向与开工门禁定下来
- `Review B` 负责证明 foundation 站住了，并冻结 `Phase 1B` 开工所需的 contract

这轮的核心问题只有 3 个：

1. `Phase 1A` 到底证明了什么
2. 它有没有打穿 `Review A` 冻结的 contract
3. `Phase 1B` 的 `Page / history / models / workspace / slot` contract 是否已经足够开工

## 2. 这轮默认承接 `Review A` 的哪些结论

为了避免 `Review B` 退回成“重讲一遍 `Review A`”，这轮默认承接下面这些已经通过的前提：

1. `TrChat / TrChat.Root / TrChat.Page` 的角色已经冻结
2. `createRuntimeFromConfig(config) -> { runtime, ui }` 是唯一官方桥接路径
3. `Root` 只消费 `{ runtime, ui }`
4. `ui` 保持 display-only
5. `Page` 保持 composition-only
6. `messageId` 是稳定动作定位键
7. `Phase 1A` bridge subset 已写清支持与不支持范围
8. 核心 slot contract 已冻结，但完整 slot 消费面留到后续轮次

这轮不重新论证这些设计为什么合理。  
这轮只做两件事：

- 检查实现有没有把这些 freeze 打穿
- 以这些 freeze 为前提，决定 `Phase 1B` 能不能开工

## 3. Review B 这轮到底要拍板什么

这轮不是泛泛的阶段汇报，而是要一次拍板 6 个问题。

### 3.1 要拍板的 6 个问题

1. `Phase 1A` 是否真的证明了 foundation  
   不是问“写了多少”，而是问 foundation 是否站住。

2. `Review A` 的硬门禁是否仍然成立  
   特别是 `Root` 输入边界、`ui` 边界、`messageId`、bridge subset。

3. 证据是否足够  
   tests / baseline / drift table 是否足以支撑 `Phase 1A pass`。

4. `Phase 1B` 的范围是否合理  
   是否聚焦 `Page baseline / history / models / workspace`，而不是重新散开。

5. `Phase 1B` 立刻依赖的 API / props contract 是否已经冻结  
   尤其是 `Page` 的 region 组合和 page consumption 边界。

6. `Phase 1B` 立刻依赖的 slot contract 是否已经冻结  
   不是讨论所有最终 slot parity，而是讨论下一阶段真正要进入编码的 slot scope。

### 3.2 哪些是硬门禁

下面这些点只要有一个答不稳，这轮就不应该直接进入 `Phase 1B`：

1. `Root` 已经重新读回超出 `{ runtime, ui }` 的输入
2. `messageId` 在实现里没有真正站住
3. sender / attachments handoff 仍然模糊
4. bridge subset 的实现已经把 `history / workspace / models / mcp` 之类的后续域提前拖进来
5. tests / baseline 还不足以证明 foundation 成立

下面这些点可以是 `pass with follow-ups`：

1. `Footer` 在 `Page baseline` 里的最终落位
2. `Page shell` 的更细粒度视觉和 app-shell 组织
3. 全量 slot 细粒度命名
4. 最终 helper / public surface 收口

## 4. 先给出这轮的完整判断框架

如果只看这轮的主线，其实就两件事：

```text
Part A:
Phase 1A 有没有把 foundation 站住

Part B:
如果站住了，Phase 1B 要不要直接开始，以及开始前必须冻结什么
```

这轮的判断标准也可以压缩成 4 句：

1. foundation 必须先被证明成立，不能只靠“代码已经写了”
2. `Review A` 冻结的硬门禁不能在实现里被打穿
3. `Phase 1B` 必须聚焦 `Page baseline / history / models / workspace`
4. `Phase 1B` 开工前，立刻依赖的 API / props / slot contract 必须先冻结

## 5. Part A：`Phase 1A` 到底应该证明什么

### 5.1 `Phase 1A` 的目标不是“像成品”

`Phase 1A` 要证明的，不是完整页面，而是 foundation。

它应该证明下面 5 件事：

1. `conversation / sender / message / attachments` 的 runtime foundation 已成立
2. `TrChat.Root({ runtime, ui })` 的最小白盒入口已成立
3. `createRuntimeFromConfig(config)` 的 `Phase 1A` bridge subset 已成立
4. `TrChat.Message / MessageList / Sender` 的最小 UI 主链路已成立
5. 这些 contract 可以被 tests 持续约束，而不只是停在 prose

### 5.2 如果它只是下面这些状态，就不能算通过

- 只写了一批 types
- 只写了 factory 骨架
- UI 组件能渲染，但主链路没真的打通
- 能跑 demo，但没有 contract tests
- tests 只证明页面表现，没有证明 contract

## 6. Part A-1：Review A freeze 在实现里有没有被打穿

这一章是 `Review B` 最不该和 `Review A` 重复、但最必须承接的地方。

因为这些内容在 `Review A` 里已经完成“设计冻结”，  
所以在 `Review B` 里它们不再是“为什么这样设计”，而是“实现有没有守住”。

### 6.1 需要检查的 4 个硬门禁

#### 1. `Root` 输入边界是否仍只读 `{ runtime, ui }`

这轮要检查的不是为什么这么设计，而是：

- 实现里有没有重新把 config projection / 总装配职责塞回 `Root`
- `Root` 有没有开始理解页面结构、完整 feature wiring 或其他越界输入

#### 2. `ui` 是否仍保持 display-only

这轮要检查的不是 display-only 原则本身，而是：

- 实现里有没有把行为 owner 偷放回 `ui`
- 有没有把 slot / page 结构 owner 重新塞进 `ui`

#### 3. `messageId` 是否仍是稳定动作定位键

这轮要检查的是它在实现里是否足够站住，至少要支撑：

- regenerate
- retry
- edit rollback
- hydrate restore
- optimistic message
- stream 更新和重组

如果这里仍依赖位置语义，`Phase 1A` 就没有真的站住。

#### 4. bridge subset 是否仍然清楚

这轮要检查的不是 subset 为什么这么选，而是实现有没有越界。

`Phase 1A` 支持的域应该仍然是：

- `request.transport`
- `request.systemPrompt`
- `request.defaultModelId`
- `conversation.initialMessages`
- `conversation.persistence` 的 active-conversation hydrate / restore
- `ui.*`
- `sender.*`
- `attachments.*`
- `messages.actions`
- `messages.renderers`
- `messages.feedback`
- `lifecycle.beforeSend`
- `lifecycle.error`

如果实现里已经偷偷把下面这些拉进来了，就说明 bridge 开始越界：

- `history.*`
- `workspace.*`
- `models.*`
- `mcp.*`
- `messages.transforms`
- `lifecycle.afterReceive`
- `lifecycle.modelChange`
- `lifecycle.conversationChange`

### 6.2 最建议你现场使用的一张 drift 检查表

| Review A 冻结项 | Review B 要看的不是 | Review B 真正要看的 |
| --- | --- | --- |
| `Root` 只吃 `{ runtime, ui }` | 为什么要这么设计 | 实现有没有重新加回越界输入 |
| `ui` display-only | display-only 原则本身 | 实现有没有把行为 owner 偷放进 `ui` |
| `messageId` | 为什么不能再用位置语义 | 实现里是否仍然稳定 |
| bridge subset | 为什么 Phase 1A 只承诺这组域 | 实现有没有越界承诺后续域 |
| 核心 slot contract | slot 为什么要分 replace / augment | 实现有没有推翻 A 已冻结的规则 |

## 7. Part A-2：`Phase 1A` 证据包至少应该长什么样

如果你要把 `Phase 1A` 讲得有说服力，证据包至少应该有 4 类：

1. `tests`
   targeted contract tests，尤其是：
   - runtime contract
   - `messageId`
   - sender / attachments handoff
   - `Root + createRuntimeFromConfig`

2. `baseline`
   最小链路确实跑起来的示例

3. `drift table`
   实现和 `Review A` freeze 的偏差表

4. `known limits`
   明确列出这轮没做什么，不要伪装成完整覆盖

如果缺少其中任意一类，评审很容易退化成“你口头说 foundation 站住了”。

## 8. Part B：为什么现在轮到 `Phase 1B`

`Phase 1B` 不应该被理解成“继续往前写一些页面”，而应该被理解成：

- 在 foundation 已成立的前提下
- 正式开始建立 `Page baseline`
- 同时把 `history / models / workspace` 放进 page-level consumption

也就是说，`Phase 1B` 的本质是：

```text
foundation 已站住
-> 默认页面层开始长出来
-> Page 与 runtime module 的边界开始被真实消费验证
```

这里不需要再重讲 `Review A` 的设计理由。  
只需要说明：如果 foundation 已成立，下一层自然就是 `Page baseline`。

## 9. Part B-1：`Phase 1B` 这轮应该冻结什么

这轮建议继续分 3 桶来看。

### A. Must Freeze Now

这些内容是 `Phase 1B` 一开工就会依赖的 contract，这轮必须定下来：

#### `Page` baseline 的核心 region 组合

至少要明确：

- `Header`
- `Welcome`
- `MessageList`
- `Sender`
- `Footer` 仍只作为 companion region，不提前升级成重型独立主区域

#### `Page` 的 page-level consumption 边界

至少要明确：

- `Page` 会开始消费哪些 runtime module
- 哪些是通过 region 组件消费
- 哪些仍不能打穿 `Page` composition-only 的边界

#### `history / models / workspace` 的 owner 与 page 关系

这轮至少要定：

- 它们进入 `Phase 1B`
- 它们由 `Page` 消费，而不是被 `Root` 重新总装配
- 它们不会反向打穿 `Root + Page + primitives` 的分层

#### 进入 `Phase 1B` 的 slot scope

这轮必须定：

- 哪些核心 slot scope 真正进入 `Phase 1B`
- slot props 只暴露最小必要模块
- slot 不得拿 whole runtime

这里更关心“进入哪一批”，而不是“最终是否全量”。

### B. Freeze Semantics Now

这些本轮先冻结语义，不要求完整最终形态：

- `Footer` 的 companion region 语义
- stacked / workspace 两种 page shell 的关系
- workspace 稳定区位和 page-level slot 的关系
- `history / models / workspace` 在页面里的优先级和相对位置原则

### C. Defer To Review C

这些不应阻塞 `Phase 1B` 开工：

- `Page baseline` 的最终视觉 polish
- 完整 slot parity
- 细粒度 augment hook 命名
- 黑盒 `TrChat` 主路径如何完整回切
- 最终公开面

## 10. Part B-2：slot 在这轮到底应该谈到什么深度

这是这轮非常容易漂的问题。

这轮不该做的事：

- 不该把所有 slot 最终实现细节一次定完
- 不该把全量 slot parity 当成 `Phase 1B` 的前置门槛
- 不该开始讨论最终对外发布语义

这轮该做的事：

1. 明确 `Review A` 已冻结的 slot contract 没被推翻
2. 明确哪些 slot scope 进入 `Phase 1B`
3. 明确这些 slot 在 `Page baseline` 中由谁 provider、props 最小暴露到哪一层
4. 明确哪些 slot 细节留到 `Review C`

一句话：

- `Review A` 冻结 slot contract
- `Review B` 冻结进入 `Phase 1B` 的 slot scope
- `Review C` 验证 slot 实现结果

## 11. 如果评审人继续追问，我建议你直接这样回答

### 11.1 “`Phase 1A` 怎么证明不是只写了一堆新文件？”

建议回答：

- 我不会只拿代码量来证明
- 我会拿 foundation 的实际链路、targeted contract tests、最小 baseline、drift table 一起证明
- 如果这些证据不能说明 contract 已成立，我就不会把 `Phase 1A` 判成通过

### 11.2 “为什么 `Phase 1B` 现在就该开始？”

建议回答：

- 因为 `Phase 1A` 解决的是 foundation
- foundation 之后最自然的下一层，就是 `Page baseline` 和 page-level consumption
- 如果 foundation 已站住，再不开这层，整个分层验证就会断档

### 11.3 “这轮为什么还要继续谈 slot？”

建议回答：

- 因为只要开始写 `Page baseline`，就必然会依赖 page-level provider 边界和进入编码的 slot scope
- 但这轮不是谈所有最终 slot parity，而是谈下一阶段真正要进入编码的那一批

### 11.4 “如果 `Phase 1A` 有小偏差，能不能直接带着进 `Phase 1B`？”

建议回答：

- 要看偏差碰没碰硬门禁
- 如果动到了 `Root` 输入边界、`messageId`、handoff、bridge subset，那就不该直接进
- 如果只是更后面的 `Footer`、page shell polish、完整 slot parity 细节，可以记成 follow-up

## 12. 一句话总括

这轮不是在评“`Phase 1A` 代码写得多不多”，而是在评：

> foundation 是否已经被真正证明成立，以及 `Page baseline / history / models / workspace` 这一批 contract 是否已经冻结到足够进入 `Phase 1B`。
