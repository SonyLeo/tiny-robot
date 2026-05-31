---
outline: deep
---

# Markdown 渲染开发流程

本文档用于固化 TinyRobot 在开发 `TrMarkdown` 过程中的标准顺序。

它只回答一个问题：

> 在真正开始实现之前，Markdown 渲染能力应该按什么顺序推进，才能避免范围失控、体积失控和渲染性能失控？

配套文档：

- 调研： [Markdown 渲染调研](/guide/markdown-rendering-research)
- 设计： [TrMarkdown 设计方案](/guide/markdown-rendering-design)
- Spike： [Markdown 渲染 Spike 结论](/guide/markdown-rendering-spike)
- 路线图： [Markdown 渲染 Roadmap](/guide/markdown-rendering-roadmap)

## 使用方式

把这份文档当作 `TrMarkdown` 的开发作业流程。

每进入一个新阶段，都应该按这里的顺序走，而不是直接开始写代码。

## 总流程

`TrMarkdown` 的开发建议固定成下面这条主线：

1. 目标冻结
2. 风险 Spike
3. 阶段方案确认
4. 最小实现
5. 构建检查
6. 测试与基准
7. 阶段验收
8. 文档回填
9. 是否进入下一阶段评审

## 总阶段顺序

Markdown 渲染整体推进建议按这个阶段顺序：

1. `Stage 0`：目标冻结
2. `Stage 1`：底层库 Spike
3. `M0`：模块骨架
4. `M1`：静态基础渲染
5. `M2`：代码块子系统
6. `M3`：Bubble 集成
7. `M4`：流式 Markdown
8. `M5`：高级能力扩展
9. `Stage End`：是否拆包评估

## 每个阶段的标准开发顺序

无论当前是在 `M0`、`M1` 还是 `M4`，建议都遵守同一套阶段内顺序。

## 1. 目标冻结

### 目的

先界定当前阶段“做什么”和“不做什么”。

### 需要产出

- 阶段目标
- 阶段非目标
- 阶段依赖
- 默认路径预算
- 渲染性能预算
- 需要验证的风险点

### 必须回答的问题

- 这一阶段是否会引入新依赖？
- 新依赖是否进入默认路径？
- 是否会引入新重能力？
- 是否会影响 Bubble 集成？
- 是否会影响静态/流式分支边界？

### 不允许跳过

如果阶段目标和非目标没有写清楚，就不应该进入实现。

## 2. 风险 Spike

### 目的

优先验证不确定性，而不是先做正式实现。

### 适合 Spike 的内容

- `Comark` 是否可接入
- `@crazydos/vue-markdown` 是否支持需要的组件映射
- `streamdown-vue` 是否适合流式分支
- `Shiki` 是否能被干净地按需加载
- Mermaid / KaTeX 接入是否会污染默认路径

### Spike 的规则

- 只做最小验证
- 不追求完备功能
- 不追求最终代码结构
- 只回答“值不值得用”

### Spike 产出

- 结论
- 风险点
- 放弃原因（若不采用）
- 是否进入正式实现

## 3. 阶段方案确认

### 目的

在进入代码前，把本阶段的技术路线定下来。

### 需要确认

- parser / renderer 选型
- 是否接入新组件
- 是否新增 provider / composable
- 是否新增样式变量
- 是否新增导出 API
- 是否新增 demo / fixture / benchmark

### 通过标准

- 设计文档中已有对应方案落点
- roadmap 中已有对应阶段位置
- 该阶段没有和其他阶段目标混淆

## 4. 最小实现

### 目的

先做最小可行能力，而不是一口气把“完整版”做完。

### 推荐顺序

1. 类型与接口
2. parser / render 核心
3. 节点组件
4. 样式
5. Bubble 适配
6. 高级能力补充

### 实现原则

- 默认路径先跑通
- 高级能力后接入
- 先结构正确，再样式精修
- 先静态路径，再流式路径
- rewrite / reset 类能力必须先区分 token patch 与 hard reset，不能继续把所有非 append 更新都当成整块重置

### 禁止事项

- 不允许在基础阶段直接把高亮、Mermaid、KaTeX 全部打进来
- 不允许一开始就把静态和流式混在同一个最薄实现里

## 5. 构建检查

### 目的

确认实现没有破坏主包导出和包体积边界。

### 必查项

- 新依赖是否被 external
- 重能力是否被动态引入
- 默认路径是否新增大块运行时代码
- 导出入口是否稳定
- 样式产物是否可控

### 对 `TrMarkdown` 特别重要的检查

- `Shiki` 是否进入默认路径
- `mermaid` 是否进入默认路径
- `KaTeX` 是否进入默认路径
- 流式增强逻辑是否进入默认静态路径

## 6. 测试与基准

### 目的

验证功能正确性和性能边界。

### 验证入口硬门禁

凡是用于 `TrMarkdown` 验证的入口页，都必须先确认自己吃的是哪条代码路径：

- `markdown-demo`
- `packages/test`
- Playwright / E2E 本地 webServer
- docs 本地 demo（若本轮用它做验收）

至少要满足下面两条之一：

1. 公开包导入通过 Vite alias + TS path 明确指向 workspace `src`
2. 明确使用受控的内部 source entry，而不是回退到 `packages/components/dist`

如果走第 1 条，还要同步补齐：

- `optimizeDeps.exclude`
- consumer `tsconfig` 对 `Bundler` / `ES2022.Intl` / source-only type 依赖的支持

否则很容易出现：

- `src` 改了但 demo / test 没吃到
- `dist` 还是旧产物，误判实现无效
- E2E 实际验证的是缓存或历史构建，不是当前源码

### Streaming rewrite / scheduler 额外门禁

凡是本轮涉及 `M4.5` streaming animation、rewrite patch 或 scheduler 收口，都必须额外确认：

- root telemetry 能暴露 `updateKind / hardReset / rewriteCount / resetCount`
- 同 block rewrite 应增加 `rewriteCount`，但不应增加 `resetCount`
- block 数量、block type 或 tag 变化才应触发 `hardReset = true`
- `resetRevision` 只在 hard reset 时递增，避免 token patch rewrite 被误判为整块重播
- demo 与 `packages/test` 至少各有一个 token patch rewrite / hard reset 区分案例

### 测试分层

#### A. 单元测试

- Markdown 节点渲染
- 组件映射覆写
- feature flag 开关
- 代码块分流

#### B. 组件测试

- 单条 Markdown 消息
- Bubble variant
- BubbleList 多条消息
- 代码块、表格、图片的组合场景

#### C. 场景测试

- 长文档
- 代码块密集文档
- 表格密集文档
- 流式长回答

#### D. 基准样例

建议固定维护：

1. `basic.md`
2. `long-article.md`
3. `code-heavy.md`
4. `table-heavy.md`
5. `streaming-basic.md`
6. `streaming-code.md`

每个阶段都使用同一批样例回归。

## 7. 阶段验收

### 目的

判断当前阶段是否真的可以结束，而不是“代码差不多了”。

### 必看四项

1. 功能是否达到阶段目标
2. 默认路径是否变重
3. 渲染边界是否稳定
4. 文档/demo/fixture 是否闭环

### 不通过时怎么办

- 不进入下一阶段
- 回到“阶段方案确认”或“最小实现”
- 必要时拆小当前阶段

## 8. 文档回填

### 目的

避免实现与文档长期分离。

### 需要回填的文档

- `design`
- `roadmap`
- 组件文档 / demo
- 若有必要，补充 migration 或 guide

### 必须补充的内容

- 本阶段新增能力
- 本阶段未覆盖能力
- 新增开关/依赖/约束
- 典型使用方式

## 9. 是否进入下一阶段评审

### 目的

确认项目是否具备进入下一阶段的条件。

### 评审问题

- 当前阶段是否已完整通过验收？
- 是否引入了技术债，必须先还？
- 下一阶段依赖是否已经满足？
- 是否需要先做补充 Spike？

只有通过后，才进入下一阶段。

## 各阶段的推进顺序建议

## `Stage 0`：目标冻结

### 顺序

1. 汇总调研结论
2. 明确三份文档边界
3. 冻结阶段顺序
4. 冻结默认路径原则

### 产出

- `research`
- `design`
- `roadmap`
- 本文档

## `Stage 1`：底层库 Spike

### 顺序

1. 验证 `Comark`
2. 验证 `@crazydos/vue-markdown`
3. 验证 `streamdown-vue`
4. 比较接入自由度、体积、流式能力
5. 决定 `M1` 与 `M4` 候选路线

### 产出

- Spike 结论
- 推荐底层组合
- 放弃项清单

## `M0`：模块骨架

### 顺序

1. 建目录骨架
2. 建导出入口
3. 建类型入口
4. 明确 provider / renderer 边界

### 不做

- 不做高级能力
- 不做重依赖接入
- 不做流式

## `M1`：静态基础渲染

### 顺序

1. 选定静态 parser / renderer 路线
2. 跑通基础节点渲染
3. 建立第一版样式变量
4. 建立 `default` / `bubble` variant
5. 补基础测试和 fixtures

### 不做

- 不做 Mermaid
- 不做 KaTeX
- 不做流式
- 不做高亮重能力默认接入

## `M2`：代码块子系统

### 顺序

1. inline / block 分离
2. language 识别
3. 单行 / 多行分流
4. code block 容器与交互预留
5. 评估高亮策略接入

### 不做

- 不把全部代码块高级能力一次性做完

## `M3`：Bubble 集成

### 顺序

1. 用 `TrMarkdown` 替换 `BubbleRenderers.Markdown` 内核
2. 做 Bubble 场景变量桥接
3. 处理 fallback 与显式 markdown 内容类型
4. 补 `BubbleList` 场景测试

## `M4`：流式 Markdown

### 顺序

1. 选定流式底层路线
2. 实现 smoothing
3. 实现 incomplete token 策略
4. 加入 tail / loading 语义
5. 做长回答和代码块流式场景测试

### 注意

- 流式能力不得回灌污染静态默认路径

## `M5`：高级能力

### 顺序

1. Mermaid
2. KaTeX
3. Footnotes
4. Alert / Gallery / Preview
5. 插件与扩展点

### 注意

- 所有高级能力都必须显式开关控制

## `Stage End`：是否拆包评审

### 顺序

1. 回看包边界评估
2. 确认独立消费场景
3. 确认 API 是否稳定
4. 决定是否拆成独立包

## 开发中的硬门禁

无论在哪个阶段，只要发生以下任一情况，都不建议继续推进到下一阶段：

- 默认路径引入重依赖且无法关闭
- 静态与流式边界被混淆
- 代码块更新导致全量重算
- 文档、测试、实现明显脱节
- 组件能力边界开始模糊
- 验证入口仍默认依赖 `packages/components/dist`，无法证明当前 `src` 改动已经被实际消费

## 最终原则

`TrMarkdown` 的开发顺序，不应是“想到什么做什么”，而应始终遵循：

> 先冻结目标，再验证风险；先做静态基础，再做代码块；先完成 Bubble 集成，再做流式；最后才补高级能力和拆包决策。

这条顺序的核心价值，是让 Markdown 组件在功能扩展过程中仍然可控。
