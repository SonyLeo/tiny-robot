# Chat Refactor Source Of Truth

这个文件定义 `packages/chat` 重构期间“哪类信息应该写进哪个文件”。

目标不是增加更多文档，而是减少知识漂移和重复定义。

## 1. Normative Docs

下面这些文件负责定义“方案是什么”。

- `packages/chat/ARCHITECTURE_REFACTOR_DESIGN.md`
  负责方向、目标、非目标、顶层设计结论。
- `packages/chat/ARCHITECTURE_REFACTOR_API_RUNTIME.md`
  负责对外 API、runtime owner、slot contract、message model、source-of-truth 规则。
- `packages/chat/ARCHITECTURE_REFACTOR_EXECUTION.md`
  负责 phase、gate、覆盖表、测试矩阵、退出条件。
- `packages/chat/ARCHITECTURE_REFACTOR_IMPLEMENTATION_BLUEPRINT.md`
  负责当前实现阶段已经冻结到可编码粒度的 contract 与切片约束。

规则：

- 如果 contract、owner、边界、phase gate 发生变化，先改这里。
- tracker、review packet、generated artifact 都不能反向定义 normative contract。

## 2. Method Docs

下面这些文件负责定义“怎么评审和怎么组织讨论”。

- `packages/chat/ARCHITECTURE_REFACTOR_REVIEW_SCHEME.md`
  负责固定主线、四层对齐框架、四次关键评审、会议模板、评审材料建议。

规则：

- 评审方法、节奏、材料分工写在这里。
- 不要把 runtime contract 或 phase owner 写回方法文档。

## 3. Process Docs

下面这些文件负责定义“现在推进到哪了”。

- `packages/chat/ARCHITECTURE_REFACTOR_ALIGNMENT_TRACKER.md`
  负责当前阶段状态、已对齐结论、未决问题、follow-ups、下一步动作。

规则：

- 状态变化、会后结论、阻塞点、follow-up 写在这里。
- 如果某个结论改变了 normative contract，先更新 normative docs，再回写 tracker。

## 4. Review Packets

下面这些文件负责定义“某场评审怎么讲、怎么准备、怎么速读”。

- `packages/chat/review-packets/*/REVIEW_*_OWNER_RUNBOOK.md`
- `packages/chat/review-packets/*/REVIEW_*_SPEC_DETAIL.md`
- `packages/chat/review-packets/*/REVIEW_*_REVIEWER_MEMO.md`
- optional:
  `REVIEW_*_PRESENTATION_SCRIPT.md`
  `REVIEW_*_PREVIEW_EVIDENCE.md`

规则：

- review packet 服务某一轮会议，不取代长期 source docs。
- review packet 应总结并引用 normative docs，而不是创造第二套 contract。
- 会后结论优先回写 tracker；涉及 contract 变化时同时回写 normative docs。

## 5. User Docs

下面这些文件负责定义“当前 shipping surface 怎么给用户解释”。

- `docs/src/components/chat.md`
- `docs/src/components/chat-features.md`
- `docs/src/components/chat-advanced.md`

规则：

- 当前 shipping surface 的用户说明以这些文档为主。
- target refactor surface 的内部推进不直接重写这些用户文档；在 publish stage 前保持双轨说明。
- 如果这类文档与 refactor docs 同时被修改，先读 `packages/chat/docs/CURRENT_VS_TARGET_SURFACE.md`。

## 6. Execution Plans

下面这些文件负责定义“当前实现切片准备怎么做”。

- `packages/chat/docs/exec-plans/active/*.md`
- `packages/chat/docs/exec-plans/completed/*.md`
- template:
  `packages/chat/docs/exec-plans/templates/execution-slice.md`

规则：

- 一个执行切片一个 plan。
- plan 记录目标、范围、冻结输入、验证、风险和 drift backwrite。
- phase 级总计划仍然在 `ARCHITECTURE_REFACTOR_EXECUTION.md`；这里承接更小的实现切片。

## 7. Histories

下面这些文件负责定义“这次代码任务最终落了什么”。

- `packages/chat/docs/histories/template.md`
- `packages/chat/docs/histories/YYYY-MM/*.md`

规则：

- 只为实际落地的代码任务写 history。
- 纯讨论、纯评审、纯研究不写 history，除非它导致了仓库变更。
- history 记录结果，不替代 plan，不替代 tracker。

## 8. Generated Artifacts

下面这些文件负责定义“从长文档抽出的高频派生事实表”。

- `packages/chat/docs/generated/README.md`
- current examples:
  `runtime-owner-table.md`
  `config-bridge-matrix.md`
  `slot-catalog.md`
  `page-region-contract.md`

规则：

- 这里的内容是派生索引，不是新的权威 contract。
- 每份 artifact 都应标明来源文档。
- 当前阶段允许人工维护，但必须明确它依赖哪些 source docs。

## 9. Update Order

当一次讨论或实现产生新知识时，默认按下面顺序沉淀：

1. 先判断它是不是 normative contract。
2. 如果是，先更新 `DESIGN / API_RUNTIME / EXECUTION / BLUEPRINT`。
3. 再回写 `ALIGNMENT_TRACKER.md` 的状态和结论。
4. 如果这是一场评审，再同步 review packet。
5. 如果这是一段实现切片，再更新 `exec-plans/active/*.md`。
6. 如果代码已经落地，再补 `histories/*.md`。
7. 如果某个事实表会被反复查阅，再抽到 `generated/`。
