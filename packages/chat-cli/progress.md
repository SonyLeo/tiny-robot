# Chat CLI Progress

> `packages/chat-cli` 下一轮模板平台化改造的实时状态页。
> 设计基线见 [../../docs/chat-cli-design.md](../../docs/chat-cli-design.md)。
> 执行评审见 [chat-cli-review-02.md](./chat-cli-review-02.md)。
> 模板策略见 [review/template-strategy.md](./review/template-strategy.md)。

---

## 当前快照

- 当前阶段：`Phase A - Template Registry Foundation`
- 当前状态：`待启动`
- 最近更新：`2026-03-17`

---

## 已确认的现实问题

这些问题已经在当前代码结构中明确存在，应视为本轮工作的真实起点：

- CLI 模板入口仍是硬编码
- 交互菜单里仍有 `coming soon` 模板占位
- 模板源目录治理还没有进入正式 release gate
- 模板目录卫生校验范围仍偏窄
- `basic` 仍同时承担默认模板、安全默认值示例和 adapter/config 示例三种职责

---

## 当前焦点

### P0: Template Registry Foundation + Hygiene

- [ ] 建立 `ChatCliTemplateDefinition`、`ChatCliTemplateRegistry` 等核心类型
- [ ] 明确最小 registry schema：`id / label / status / templateDir / supportedProviders / requiredChatFeatures / postScaffoldSteps`
- [ ] 在 `packages/chat-cli/src` 中引入真正的 template registry
- [ ] 让 `--template`、交互选择、帮助信息统一走 registry
- [ ] 清理 CLI 中旧的 `coming soon` 模板占位入口
- [ ] 升级 `validate-templates.mjs`，校验模板目录不得包含 `node_modules`、`dist`、未替换占位符
- [ ] 把模板卫生检查升级为 `prepare:templates` 的正式阻塞规则

---

## 上游依赖与模板 readiness

| 项目 | 当前状态 | 说明 |
|:--|:--|:--|
| `basic` | `稳定` | 继续作为默认模板保留 |
| `agent-mcp` | `等待上游契约` | 依赖 chat 侧最小 MCP feature config |
| `docs-chat` | `等待 retrieval contract` | 不应早于 retrieval contract 落地 |
| `assistant-workbench` | `后置` | 依赖 layout formalization 与多 feature 组合能力 |
| `base + feature packs + add` | `未开始` | 属于 registry 落地后的下一阶段 |

---

## 下一步

### P1: Agent MCP Template

- [ ] 梳理 `agent-mcp` 模板依赖的最小 chat 能力面
- [ ] 接入 MCP server 示例、bridge 示例、配置文件和 README
- [ ] 建立 `agent-mcp` 的 scaffold / smoke / hygiene 测试

### P2: Retrieval / Docs Template

- [ ] 先定义 retrieval contract，而不是先做 `docs-chat` UI
- [ ] 评估 `docs-chat` 是否达到稳定模板条件
- [ ] 若 contract 成熟，再接入 `docs-chat` 模板

### P3: Platform Evolution

- [ ] 抽离 `base runtime skeleton`
- [ ] 设计 `add feature` / `feature packs`
- [ ] 评估 `assistant-workbench` 的模板时机和边界

---

## 风险与注意项

- 不要在 registry 之前继续增加正式模板数量
- 不要让模板实现继续依赖 CLI 入口硬编码
- 不要让 `docs-chat` 早于 retrieval contract 落地
- 不要让 `basic` 持续演变成所有模板的复制母版

---

## 验证基线

- `pnpm.cmd -F create-tiny-robot typecheck`
- `pnpm.cmd -F create-tiny-robot build`
- `pnpm.cmd -F create-tiny-robot prepare:templates`
- `pnpm.cmd -C packages/chat-cli/templates/basic exec vue-tsc --noEmit`
- `pnpm.cmd -F tiny-robot-test test -- src/chat-cli/scaffold.spec.ts src/chat-cli/release.spec.ts src/chat-cli/smoke.spec.ts`
- `pnpm.cmd -F docs build`

---

## 更新规则

这份文档是 `packages/chat-cli` 的唯一实时状态页。

当出现下面这些变化时，应直接更新这里：

- 当前阶段变更
- 真实 blocker 变化
- 模板 readiness 变化
- 上游依赖状态变化
- 验证基线调整
