# Chat CLI Progress

> 该文档用于追踪 `packages/chat-cli` 下一轮模板平台化改造进度。  
> 设计基线见 [chat-cli-design.md](/d:/OpenTinyRepository/tiny-robot/docs/chat-cli-design.md)。  
> 执行评审见 [chat-cli-review-02.md](/d:/OpenTinyRepository/tiny-robot/packages/chat-cli/chat-cli-review-02.md)。  
> 模板策略见 [template-strategy.md](/d:/OpenTinyRepository/tiny-robot/packages/chat-cli/review/template-strategy.md)。

## 当前状态

- 总体进度：`0%`
- 当前阶段：`待启动`
- 当前目标：`Phase A - Template Registry Foundation`
- 最近更新：`2026-03-16`

## 阶段追踪

| Phase | 状态 | 进度 | 目标 |
|:--|:--|:--|:--|
| Phase A | 待启动 | `0%` | 建立 template registry、模板元数据、模板源目录治理规则 |
| Phase B | 待启动 | `0%` | 实现 `agent-mcp` 模板，并让 CLI 真正消费 registry |
| Phase C | 待启动 | `0%` | 建立最小 retrieval contract，评估并落地 `docs-chat` |
| Phase D | 待启动 | `0%` | 从“多模板复制”过渡到 `base + feature packs + add` |
| Phase E | 待启动 | `0%` | 评估 `assistant-workbench`，补齐模板平台能力 |

## 当前待办

### P0 Registry Foundation

- [ ] 建立 `ChatCliTemplateDefinition`、`ChatCliTemplateRegistry`、`ChatCliFeatureId` 等核心类型
- [ ] 明确最小 registry schema：`id / label / status / templateDir / supportedProviders / requiredChatFeatures / postScaffoldSteps`
- [ ] 在 `packages/chat-cli/src` 中引入真正的 template registry，而不是继续在 CLI 入口硬编码模板
- [ ] 让 `--template`、交互选择、帮助信息、README 注入统一走 registry
- [ ] 清理 CLI 中旧的 “coming soon” 模板占位入口
- [ ] 让所有正式模板支持非交互生成
- [ ] 把模板目录卫生检查升级为 release 阻塞规则
- [ ] 在 `validate-templates.mjs` 中校验模板目录不得包含 `node_modules`、`dist`、未替换占位符

### P1 Agent Template

- [ ] 梳理 `agent-mcp` 模板依赖的最小 chat 能力面
- [ ] 把 MCP server 示例、bridge 示例、配置文件、README 接入模板
- [ ] 建立 `agent-mcp` 的 scaffold / smoke / hygiene 测试

### P2 Retrieval / Docs Template

- [ ] 先定义 retrieval contract，而不是先做 `docs-chat` UI
- [ ] 评估 `docs-chat` 是否达到稳定模板条件
- [ ] 若 contract 成熟，再接入 `docs-chat` 模板

### P3 Platform Evolution

- [ ] 抽离 `base runtime skeleton`
- [ ] 设计 `add feature` / `feature packs`
- [ ] 评估 `assistant-workbench` 的模板时机和边界

## 验证基线

- `pnpm.cmd -F create-tiny-robot typecheck`
- `pnpm.cmd -F create-tiny-robot build`
- `pnpm.cmd -F create-tiny-robot prepare:templates`
- `pnpm.cmd -C packages/chat-cli/templates/basic exec vue-tsc --noEmit`
- `pnpm.cmd -F tiny-robot-test test -- src/chat-cli/scaffold.spec.ts src/chat-cli/release.spec.ts src/chat-cli/smoke.spec.ts`
- `pnpm.cmd -F docs build`

## 备注

- 上一轮“基础脚手架安全化、flags、README、release helpers、smoke tests”已经完成；本文件只追踪下一轮模板平台化工作。
- `basic` 当前仍同时承担默认模板、安全默认值示例、adapter/config 示例三种角色；后续需要逐步拆成 `base + preset`。
- `docs-chat` 暂不视为 v1 稳定模板，需等待 retrieval contract 成熟。
