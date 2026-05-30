---
outline: deep
---

# Markdown M0 / M1 实施 Checklist

本文档用于把 `M0` 和 `M1` 的实现前准备，固化成可直接执行的检查清单。

它不负责解释方案本身，只负责回答：

> 真正开始编码时，`M0` 和 `M1` 需要逐项确认什么，做完什么才算能进入下一步？

配套文档：

- 流程： [Markdown 渲染开发流程](/guide/markdown-rendering-process)
- 设计： [TrMarkdown 设计方案](/guide/markdown-rendering-design)
- Spike： [Markdown 渲染 Spike 结论](/guide/markdown-rendering-spike)
- 路线图： [Markdown 渲染 Roadmap](/guide/markdown-rendering-roadmap)

## 使用方式

建议在真正开始 `M0` 和 `M1` 时，把这份清单作为逐项打勾的执行表。

## 当前进度更新（2026-05-30）

- [x] `Basic` demo 已覆盖 `headings / paragraph / long article / styling text / break lines / quoting text / links / lists / task lists / bubble variant / tables`
- [x] `marginMultiple` 已统一作用到 `paragraph / heading / blockquote / list / table / hr` 等基础节点间距
- [x] 显式 `<br>` 已进入 parser / render / test 链路，并补掉了 `<br>` 后重复 `softbreak` 的问题
- [x] demo 右侧面板当前统一控制整块 markdown 渲染内容，不再拆 code 与 typography 两套独立字号 / 行高模型
- [x] task list / checkbox 已进入默认静态实现，并补到 demo / test / bubble 集成回归
- [x] long-article / bubble 排版回归已补齐
- [ ] streaming markdown 仍不在本轮范围

## M0 Checklist

## 目标

建立 `TrMarkdown` 的模块边界和目录骨架，不做正式功能能力。

## 开始前确认

- [ ] 已阅读调研文档
- [ ] 已阅读设计文档
- [ ] 已阅读流程文档
- [ ] 已阅读 roadmap
- [ ] 已确认当前阶段不做高级能力

## 目录与导出

- [ ] 新建 `packages/components/src/markdown/`
- [ ] 新建 `index.ts`
- [ ] 新建 `index.type.ts`
- [ ] 新建 `TrMarkdown.vue`
- [ ] 预留 `parser/`
- [ ] 预留 `render/`
- [ ] 预留 `stream/`
- [ ] 预留 `components/`
- [ ] 预留 `styles/`

## 边界定义

- [ ] 明确 `TrMarkdown` 是统一入口组件
- [ ] 明确 `BubbleRenderers.Markdown` 后续只是适配层
- [ ] 明确静态与流式将是两条分支
- [ ] 明确默认路径不带重能力

## 类型与接口

- [ ] 预留 `TrMarkdownProps`
- [ ] 预留 `TrMarkdownParserAdapter`
- [ ] 预留 `TrMarkdownComponentMap`
- [ ] 预留 `variant` 概念
- [ ] 预留 `streaming` 概念

## 构建与导出检查

- [ ] 不新增默认运行时重依赖
- [ ] 不破坏 `packages/components/src/index.ts` 现有导出结构
- [ ] 不影响当前主包构建策略

## 文档回填

- [ ] design 文档中的目录结构与现实一致
- [ ] roadmap 中 `M0` 进入可执行状态

## M0 通过条件

- [ ] 目录骨架存在
- [ ] 导出边界明确
- [ ] 不引入重依赖
- [ ] 文档同步完成

## M1 Checklist

## 目标

完成第一版静态 Markdown 基座，支持基础 Markdown 节点与 `bubble` variant。

## 开始前确认

- [ ] `M0` 已完成
- [ ] 静态底层路线已拍板
- [ ] 默认路径轻量原则已确认
- [ ] fixture 规划已冻结

## 选型确认

- [ ] 确定静态路径优先采用哪条路线：
  - [ ] `Comark`
  - [ ] `@crazydos/vue-markdown`
  - [ ] `markdown-it` + 自建 IR/render
- [ ] 说明未选路线的原因

## 基础节点能力

- [ ] 标题
- [ ] 段落
- [ ] 列表
- [ ] 引用
- [ ] 分隔线
- [ ] 链接
- [ ] 图片
- [ ] 行内代码
- [ ] 基础代码块容器
- [ ] 表格

## 组件映射

- [ ] 预留 `components` 覆写能力
- [ ] 至少支持 `paragraph / heading / link / image / codeBlock / table`

## 样式与 variant

- [ ] 建立 `--tr-markdown-*` 第一版变量
- [ ] 建立 `default` variant
- [ ] 建立 `bubble` variant
- [ ] 不依赖 `markdown-body` 作为主心智

## 性能与体积检查

- [ ] 默认路径不引入 `Shiki`
- [ ] 默认路径不引入 `mermaid`
- [ ] 默认路径不引入 `KaTeX`
- [ ] 若用到 parser 依赖，确认是否 external / 可 lazy
- [ ] 普通文本渲染路径没有回退到最终整段 `v-html`

## 测试准备

- [ ] `basic.md`
- [ ] `long-article.md`
- [ ] `table-heavy.md`
- [ ] `bubble-chat.md`

## 测试内容

- [ ] 基础节点单元测试
- [ ] variant 测试
- [ ] 组件映射测试
- [ ] Bubble 集成基础测试
- [ ] 长文档场景回归

## M1 通过条件

- [ ] 基础 Markdown 静态渲染已可用
- [ ] `bubble` variant 生效
- [ ] 默认路径轻量约束满足
- [ ] fixture 可用于下一阶段回归
- [ ] 没有把流式能力、高级能力提前混进来

## 进入 M2 前的确认

- [ ] 代码块是否需要独立成专项子系统，已获得确认
- [ ] 高亮底层候选是否已明确
- [ ] 当前基础路径是否稳定

## M2 Checklist

## 目标

把 code 模块从“基础节点可渲染”推进到“对标 LobeUI docs 的正式 code 子系统”。

## 开始前确认

- [x] 已阅读 `markdown-codeblock-lobeui-report`
- [x] 已确认默认高亮主路径继续使用 `highlight.js/core`
- [x] 已确认 `Shiki` 只作为高级 code case 的可选路径
- [x] 已确认 docs/demo 场景与 Bubble 场景允许采用不同 code block 形态

## 配置模型

- [x] `TrMarkdownProps` 补正式 `code` 配置入口
- [x] 支持 `copyable`
- [x] 支持 `showLanguage`
- [x] 支持 `blockMode`
- [x] 支持 `defaultExpand`
- [x] 支持 `inlineColorPreview`
- [x] 支持高级 actions 扩展点

## code path 分型

- [x] inline code 保持轻量基础样式
- [x] 支持 color preview inline code
- [x] single-line fenced code 走 snippet 路径
- [x] multi-line fenced code 走 block 路径
- [x] docs 场景支持 `full` 模式
- [x] bubble / 紧凑场景保留 `overlay` 模式

## 高亮策略

- [x] 默认 `highlight.js` 路径可用
- [x] 高级 `Shiki` 路径可显式开启
- [x] `Shiki` 已收敛到显式语言 / 主题白名单
- [x] transformer 仅在高级路径生效
- [x] copy / hover / collapse 不触发代码内容重算

## 对标案例

- [x] `Inline code`
- [x] `Color models`
- [x] `Code blocks`
- [x] `Shiki Transformers`
- [x] `Custom Highlight`

## demo / test / 验收

- [x] markdown demo 补齐所有 code 案例
- [x] 右侧控制项可驱动 code 关键表现
- [x] demo 已切到 markdown / theme-provider 专项入口
- [x] 重 code case 已支持延迟挂载
- [x] `packages/test` 补关键 code 回归场景
- [x] `type-check`
- [x] `build`
- [x] Playwright 断言
- [x] `packages/components` 构建收敛到 `514 modules transformed`
- [x] `dist/markdown/index.js` 收敛到 `35.98 kB / gzip 8.73 kB`
- [x] `packages/markdown-demo` 构建收敛到 `267 modules transformed`
- [x] demo 构建日志已不再出现 large chunk warning

## M2 通过条件

- [x] 所有 code 案例可在 demo 中独立查看
- [x] docs 场景与 Bubble 场景 code block 形态清晰
- [x] 默认路径仍保持 `highlight.js` 主路径
- [x] 高级能力只在显式开启时进入
- [x] 文档、实现、demo、验证结果同步完成
