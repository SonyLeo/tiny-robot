# Review C Spec Detail

## Update | 2026-04-21 | Phase 2 kickoff preview

在当前这版 packet 定稿前，仓库里已经先落地了一条窄范围 `Phase 2` kickoff preview：

- `TrChat` 在接收到 target `TrChatConfig`
- 且没有额外提供 `runtime`、`callbacks`、`presetOverrides`

时，默认黑盒入口已经先进入：

`createRuntimeFromConfig(config) -> TrChat.Root + TrChat.Page`

同时仍保留一条明确 compatibility fallback：

- 旧 shipping `ChatConfig` 形态
- compatibility-only props

它们当前仍显式回退到 `ChatScaffold`。

所以 `Review C` 对 `Phase 2` 的判断，现在不只是“下一步要不要做黑盒 cutover”，而是：

1. 这条已经落地的 preview 是否足够干净，可以继续扩大
2. 它是否保持了 `Phase 1B` 已经关住的 owner-path contract
3. 哪些 legacy fallback 仍允许继续保留为 bounded compatibility path

建议把下面这 3 个 artifact 当成 `Phase 2 kickoff preview` 的补充 evidence：

- `packages/chat/tests/integration/trchat-blackbox-root-page.test.mjs`
- `packages/chat/docs/exec-plans/active/2026-04-21-phase-2-blackbox-trchat-cutover-baseline.md`
- `packages/chat/docs/histories/2026-04/2026-04-21-phase-2-blackbox-root-page-kickoff.md`

## 1. 这份文档解决什么问题

这份文档是 `Review C` 的详细说明底稿。

它不是给评审人速读的 memo，而是给 owner 在下面三种场景使用：

1. 你自己需要把 `Phase 1B` 的结果讲顺
2. 对方在评审里追问“你到底证明了什么、哪里有偏差、为什么现在可以进入 `Phase 2`”
3. 会后需要把评审结论回写到规范文档、tracker 和下一阶段计划

`Review C` 和 `Review B` 的角色不一样：

- `Review B` 负责证明 foundation 站住，并冻结 `Phase 1B` 开工所需 contract
- `Review C` 负责证明默认 page owner path 站住，并冻结 `Phase 2` 黑盒 `TrChat` 回切所需 contract

这轮的核心问题只有 3 个：

1. `Phase 1B` 到底证明了什么
2. 它有没有打穿 `Review B` 认可的 contract
3. `Phase 2` 的黑盒 `TrChat` cutover contract 是否已经足够开工

## 2. 这轮默认承接 `Review B` 的哪些结论

为了避免 `Review C` 退回成“重讲一遍 `Review B`”，这轮默认承接下面这些已通过的前提：

1. `Phase 1A` foundation 已成立
2. `TrChat.Page` 是官方默认 page layer
3. `Page` 保持 composition-only
4. `history / models / workspace` 在 `Phase 1B` 进入 page-level baseline
5. `footer-extra` 是当前唯一冻结的 page-level footer slot
6. `Phase 2` 的目标是黑盒 `TrChat` 默认主路径回切，而不是 parity / final public surface 收口

这轮不重新论证这些设计为什么合理。
这轮只做两件事：

- 检查实现有没有把这些 freeze 打穿
- 以前面的 freeze 为前提，决定 `Phase 2` 能不能开工

## 3. Review C 这轮到底要拍板什么

### 3.1 要拍板的 5 个问题

1. `Phase 1B` 是否真的证明了默认 page owner path
2. `TrChat.Page` 是否仍然保持 composition-only
3. 当前证据是否足够支撑 `Phase 1B pass`
4. `Phase 2` 范围是否合理
5. `Phase 2` 立刻依赖的 contract 是否已经冻结

### 3.2 哪些是硬门禁

下面这些点只要有一个答不稳，这轮就不应该直接进入 `Phase 2`：

1. `TrChat.Page` 实际上还不是默认 page composition owner
2. `Page` 重新读回 broad scaffold / preset buckets
3. `history / models / workspace` baseline 只是挂件，没有形成清晰 owner chain
4. mounted `Root + Page` proof 和 contract tests 还不足以说明默认 owner path 真的站住

下面这些点可以是 `pass with follow-ups`：

1. standalone page-level `footer` replace slot 的最终发布语义
2. 黑盒 `TrChat` 切回新主路径后的更多 parity 细节
3. 最终 helper / public surface 收口
4. `Review D` 才会关心的最终闭环项

## 4. 先给出这轮的完整判断框架

如果只看这轮的主线，其实就两件事：

```text
Part A:
Phase 1B 有没有真的把默认 page owner path 站住

Part B:
如果站住了，Phase 2 要不要直接开始，以及开始前必须冻结什么
```

这轮的判断标准也可以压缩成 4 句：

1. `Phase 1B` 必须先被证明站住了默认 page owner path，而不能只靠“Page 组件已经存在”
2. `Review B` 认可的 page-level contract 不能在实现里被打穿
3. `Phase 2` 必须聚焦黑盒 `TrChat` 默认主路径回切
4. `Phase 2` 开工前，立刻依赖的 blackbox cutover contract 必须先冻结

## 5. Part A：`Phase 1B` 到底应该证明什么

### 5.1 `Phase 1B` 的目标不是“像成品”

`Phase 1B` 要证明的，不是最终成品页面，而是默认 page owner path。

它应该证明下面 5 件事：

1. `TrChat.Page` 已成为默认 page composition owner
2. `history / models / workspace` baseline 已通过 page-level consumption 站住
3. mounted `Root + Page` proof 已存在
4. `Page` 已拥有窄输入边界，不再直接读 broad preset / scaffold buckets
5. 默认 owner path 下的最近一级 primitives 已开始以显式输入为 authoritative source

### 5.2 如果它只停留在下面这些状态，就不能算通过

- 只是多了一个 `TrChat.Page` 组件
- `Page` 仍然偷偷读 broad buckets
- `history / models / workspace` 只是“被挂在页面上”，没有清晰 owner chain
- integration proof 不存在，只靠 source-level contract 和 prose
- relay tightening 只做了一半，默认 owner path 下面仍然依赖隐式 scaffold fallback

## 6. Part A-1：`Review B` 认可的 contract 在实现里有没有被打穿

### 6.1 需要检查的 4 个硬门禁

#### 1. `TrChat.Page` 是否真的是 owner

这轮要检查的不是为什么要引入 `Page`，而是：

- 默认页面组合是否已经由 `Page` 承担
- `ChatDefaultRenderer` 是否退回 compatibility delegate

#### 2. `Page` 是否仍然保持 composition-only

这轮要检查的不是 composition-only 原则本身，而是：

- `Page` 有没有重新承担总装配
- `Page` 有没有重新从 broad preset / scaffold buckets 抽取原始输入

#### 3. `history / models / workspace` owner chain 是否成立

这轮要检查的是：

- 它们是否已经在默认 page path 中被真实消费
- 它们是否没有反向打穿 `Root + Page + primitives` 分层

#### 4. relay tightening 是否已经闭环

这轮要检查的不是“有没有做 relay tightening”，而是：

- 显式 owner 输入是否已经在最近一级 primitives 成为 authoritative source
- compatibility relay 是否已经显式化，而不是继续静默生效

### 6.2 最建议你现场使用的一张 drift 检查表

| Review B 认可项 | Review C 要看的不是 | Review C 真正要看的 |
| --- | --- | --- |
| `TrChat.Page` 是默认 page layer | 为什么要有 `Page` | 默认页面组合是否真的已由 `Page` 持有 |
| `Page` composition-only | composition-only 原则本身 | `Page` 是否重新变成总装配 |
| `history / models / workspace` 进入 page baseline | 为什么这些模块该在 `Page` 中消费 | 它们是否已经形成稳定 owner chain |
| relay tightening | 为什么 compatibility relay 不能一直开着 | 显式 owner 输入是否已真正成为 authoritative source |

## 7. Part A-2：`Phase 1B` 证据包至少应该长什么样

如果你要把 `Phase 1B` 讲得有说服力，证据包至少应该有 4 类：

1. `tests`
   contract tests + integration tests

2. `completed slices`
   把默认 owner path 站住的关键 execution slices

3. `histories`
   真实落地结果、known limits、follow-ups

4. `drift summary`
   明确哪些是 bounded follow-ups，哪些会碰硬门禁

如果缺少其中任意一类，评审很容易退化成“你口头说 Phase 1B 站住了”。

### 7.1 当前已经拿到的关键证据

基于现在这轮实现，`Review C` 不应该再把 `Phase 1B` 讲成“Page 还只是半成品”。当前至少已经有下面这 6 组硬证据：

1. `TrChat.Page` baseline 已经成立
   `Page` 已成为默认 page composition owner，`ChatDefaultRenderer` 已退回 compatibility delegate。

2. `history / models / workspace` baseline 已通过 page-level consumption 站住
   它们已被 `Page` 真实消费，而不是重新塞回 `Root` 总装配。

3. mounted `Root + Page` proof 已成立
   已存在独立 integration 测试，说明默认 owner path 不只是 source-level contract。

4. page-input boundary 已成立
   `Page` 不再直接读 broad preset / scaffold buckets，而是围绕明确 page-input boundary 组织默认 owner path。

5. relay tightening 已闭环
   workspace、layout renderer、header/history、welcome/messageList 这一圈默认 owner path 都已切成“显式输入优先 + compatibility relay 显式化”。

6. `Phase 1B` 默认 owner-path baseline 已收口
   completed slices + histories 已经能讲出完整闭环，而不只是碎片修补。

### 7.2 这轮建议直接引用的 evidence index

如果你不想在会中临时翻仓库，建议直接按下面顺序引用证据：

1. `packages/chat/tests/contracts/public-surface.test.mjs`
2. `packages/chat/tests/contracts/workspace-slot-contract.test.mjs`
3. `packages/chat/tests/integration/root-page-mounted.test.mjs`
4. `packages/chat/docs/exec-plans/completed/2026-04-21-phase-1b-page-history-models-workspace-baseline.md`
5. `packages/chat/docs/exec-plans/completed/2026-04-21-phase-1b-mounted-root-page-integration.md`
6. `packages/chat/docs/exec-plans/completed/2026-04-21-phase-1b-welcome-message-list-relay-pruning.md`
7. `packages/chat/docs/histories/2026-04/2026-04-21-phase-1b-welcome-message-list-relay-pruning.md`
8. `packages/chat/tests/integration/trchat-blackbox-root-page.test.mjs`
9. `packages/chat/docs/exec-plans/active/2026-04-21-phase-2-blackbox-trchat-cutover-baseline.md`
10. `packages/chat/docs/histories/2026-04/2026-04-21-phase-2-blackbox-root-page-kickoff.md`

### 7.3 当前 drift 摘要

为了避免现场把“已知限制”和“硬门禁 drift”混在一起，这轮建议按下面口径讲：

- 当前没有已知 hard-gate drift：
  - `TrChat.Page` 仍保持 composition-only
  - `Page` 没有重新读回 broad preset / scaffold buckets
  - `history / models / workspace` 没有打穿 `Root + Page + primitives`
  - 默认 owner path 下的最近一级 primitives 已把显式输入当成 authoritative source
- 当前存在 3 个 bounded follow-ups：
  - standalone page-level `footer` replace slot 仍明确延后
  - 黑盒 `TrChat` 默认主路径还没有正式回切
  - 最终 parity / helper-public-surface 收口仍留给后续阶段

这 3 个点都不应单独阻塞 `Phase 1B pass`；只有它们开始打穿 `Page composition-only`、default owner path、history/models/workspace owner、或证据充分性时，才应升级成 `blocked`。

## 8. Part B：为什么现在轮到 `Phase 2`

`Phase 2` 不应该被理解成“继续写更多黑盒 UI”，而应该被理解成：

- 在默认 page owner path 已成立的前提下
- 正式把黑盒 `TrChat` 默认主路径回切到 `Root + Page`
- 同时收紧剩余 config projection / compatibility relay

也就是说，`Phase 2` 的本质是：

```text
default page owner path 已站住
-> 黑盒默认入口开始回到新主路径
-> 黑盒、白盒和 primitives 路径开始真正对齐
```

这里不需要再重讲 `Review A / B` 的设计理由。
只需要说明：如果 `Phase 1B` 已站住，下一层自然就是黑盒入口回切。

## 9. Part B-1：`Phase 2` 这轮应该冻结什么

这轮建议继续分 3 桶来看。

### A. Must Freeze Now

这些内容是 `Phase 2` 一开工就会依赖的 contract，这轮必须定下来：

#### 黑盒默认入口的起点

- `TrChat` 默认主路径应从 `createRuntimeFromConfig(config)` 起步
- `TrChat` 应落到 `Root + Page`，而不是重新走散开的 config projection

#### `Root + Page` baseline 关闭态

- `Root` 仍只消费 `{ runtime, ui }`
- `Page` 仍保持 composition-only
- `Page` 已闭环的 owner-path contract 不在 `Phase 2` 被重开

#### 允许保留的 bounded compatibility path

- 只允许保留明确的 compatibility delegate / adapter
- 不允许让黑盒默认主路径重新依赖 silent relay

### B. Freeze Semantics Now

这些本轮先冻结语义，不要求最终形态：

- 黑盒默认入口的最小 on-ramp coverage
- `TrChat` 与 `Root + Page` 之间剩余 relay / projection 的收紧原则
- 默认黑盒路径的最小 integration proof

### C. Defer To Review D

这些不应阻塞 `Phase 2` 开工：

- standalone page-level `footer` replace slot 的最终发布语义
- 全量 parity
- 最终 helper / public surface 收口
- `Review D` 才会评的整体闭环

## 10. 如果评审人继续追问，我建议你直接这样回答

### 10.1 “为什么你认为 `Phase 1B` 已经站住了？”

建议回答：

- 我不会只拿 `Page` 组件存在来证明
- 我会拿 contract tests、mounted integration proof、completed slices、histories 和当前 drift summary 一起证明
- 如果这些证据不能说明默认 owner path 已成立，我就不会把 `Phase 1B` 判成通过

### 10.2 “为什么 `Phase 2` 现在就该开始？”

建议回答：

- 因为 `Phase 1B` 解决的是默认 page owner path
- 默认 owner path 之后最自然的下一层，就是黑盒默认入口回切
- 如果默认 owner path 已站住，再不做这层，整条黑盒升级路径就会断档

### 10.3 “为什么这轮还不谈 `footer` replace slot 和 parity？”

建议回答：

- 因为这轮只冻结 `Phase 2` 立刻依赖的 contract
- standalone `footer` replace slot 和 parity 还不是黑盒默认入口回切的前置门槛
- 这些问题明确留到后续轮次，不应反向阻塞 `Phase 2`

## 11. 一句话总括

这轮不是在评“`Phase 1B` 页面做得多完整”，而是在评：

> 默认 page owner path 是否已经被真正证明站住，以及黑盒 `TrChat` 默认主路径回切是否已经冻结到足够进入 `Phase 2`。
