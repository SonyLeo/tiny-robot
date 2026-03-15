# Chat CLI Progress

> 用于快速追踪 `packages/chat-cli` 的实施状态。  
> 详细评审与方案见 `packages/chat-cli/chat-cli-review.md`。

## 当前状态

- 总体进度：`100%`
- 当前阶段：`Completed`
- 当前目标：`进入维护与可选增强阶段`
- 下一步：`optional polish / future features`
- 最近更新：`2026-03-16`

## 快速追踪

| 阶段 | 状态 | 进度 | 说明 |
|:--|:--|:--|:--|
| Phase 1 | 已完成 | `100%` | 模板默认安全化、`chat.config.ts`、`lib/chat.ts`、README 收口 |
| Phase 2A | 已完成 | `100%` | CLI flags、项目名注入、README/CLI 输出一致性、发布护栏脚本 |
| Phase 2B | 已完成 | `100%` | `packages/test/src/chat-cli` 已覆盖 scaffold、flags、packageManager、release helpers、smoke build、CLI 主入口行为、`--yes` 默认路径与非法参数校验 |
| Docs Sync | 已完成 | `100%` | 正式文档页、侧边栏入口、进度文档与评审文档已经同步 |
| Final Sync | 已完成 | `100%` | review、progress、用户文档三层口径已经收口到当前实现状态 |

## 本轮新增

- 新增 `packages/chat-cli/src/scaffold.ts`
  - 抽出 `emptyDir`
  - 抽出 `copyTemplateFiles`
  - 抽出 `renameSpecialFiles`
  - 抽出 `getTemplateVariables`
  - 抽出 `getScaffoldMetadata`
  - 抽出 `applyTemplateVariables`
  - 抽出 `replaceWorkspaceProtocolDeps`
  - 新增 `scaffoldProject`
- 新增 `packages/chat-cli/scripts/template-release-utils.mjs`
  - 统一模板依赖版本替换
  - 统一 `workspace:*` 残留校验
- 新增正式文档页
  - `docs/src/components/chat-cli.md`
  - `docs/.vitepress/themeConfig.ts`
- 新增 `packages/test/src/chat-cli/scaffold.spec.ts`
  - 校验 provider 默认映射
  - 校验项目名与标题注入
  - 校验包管理器命令注入
  - 校验特殊文件重命名
  - 校验模板复制过滤规则
  - 校验占位符替换
  - 校验 `workspace:*` 到版本号的本地转换
  - 校验 `basic` 模板生成结果
  - 校验 CLI 无交互生成
  - 校验 `--yes` 默认生成路径
  - 校验 `--help` / `--version`
  - 校验非法 provider 快速失败
  - 校验非空目录默认拒绝覆盖
  - 校验 `--overwrite` 清理并重建目录
- 新增 `packages/test/src/chat-cli/release.spec.ts`
  - 校验 `inferPackageManager`
  - 校验 `getCommand`
  - 校验 workspace 包版本收集
  - 校验模板依赖版本替换
  - 校验模板 `workspace:*` 残留检测
- 新增 `packages/test/src/chat-cli/smoke.spec.ts`
  - 校验生成后的 `basic` 模板可用本地工具链完成 build
- `packages/chat-cli/src/index.ts`
  - 新增 `--template`
  - 新增 `--provider`
  - 新增 `--yes`
  - 新增 `--install` / `--no-install`
  - 新增 `--overwrite`
  - 新增 `--cwd`
- 模板新增项目级占位符
  - `__PROJECT_NAME__`
  - `__PROJECT_TITLE__`
  - `__INSTALL_COMMAND__`
  - `__DEV_COMMAND__`
  - `__BUILD_COMMAND__`
- 模板入口修正样式引用
  - `packages/chat-cli/templates/basic/src/main.ts`
- 新增发布护栏脚本
  - `packages/chat-cli/scripts/update-versions.mjs`
  - `packages/chat-cli/scripts/validate-templates.mjs`

## 当前验证基线

- `pnpm.cmd -F create-tiny-robot typecheck`
- `pnpm.cmd -F create-tiny-robot build`
- `pnpm.cmd -C packages/chat-cli/templates/basic exec vue-tsc --noEmit`
- `pnpm.cmd -F tiny-robot-test test -- src/chat-cli/scaffold.spec.ts src/chat-cli/release.spec.ts src/chat-cli/smoke.spec.ts`
- `pnpm.cmd -F docs build`

## 当前结论

- `chat-cli` 的模板安全化已经落地
- 代码生成逻辑、发布辅助逻辑、以及 smoke build 都已经有测试护栏
- CLI 主入口的核心行为现在也已纳入回归：帮助信息、版本输出、目录覆盖保护
- `--yes` 默认路径与非法参数失败路径也已纳入回归
- 从当前仓库源码直接运行 CLI 时，生成结果不再残留 `workspace:*`
- 生成模板已经能在本地测试工具链下完成 build
- 面向使用者的正式文档页已经补齐，并已挂入 VitePress 侧边栏
- 当前主链路实现、测试与文档已经完成收口
- 当前剩余内容主要是清理、体验优化和后续扩展，不再是主链路阻塞

## 后续可选项

- 增加真正的模板 `install` 冒烟测试
- 增加 CLI 交互流程测试
- 为 release 脚本补更多失败场景覆盖
- 继续推进 `add` / `migrate` / 多模板能力
