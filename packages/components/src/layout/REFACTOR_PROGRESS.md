# Layout 重构进度追踪

## 目标

把 `Layout` 的重构工作拆成一份可执行、可勾选、可追踪的任务清单。

追踪范围包括：

- 状态 / API 重构
- CSS 变量收敛
- 文档 / demo 收口
- 测试补齐
- 遗留实现清理

## 相关文档

- [OPTIMIZATION.md](./OPTIMIZATION.md)
- [CSS_VARIABLES.md](./CSS_VARIABLES.md)

## 当前进度

- [x] 完成状态 / API 重构方案沉淀
- [x] 完成 CSS 变量收敛方案沉淀
- [x] 完成最终 API 定稿
- [x] 完成组件主链路代码实现
- [x] 完成 demo / README / 组件文档主口径收口
- [x] 完成 CSS 变量默认值清理与公开面进一步收敛
- 已把 dock / drawer 默认宽度，以及 surface / aside 的部分默认样式 owner 回收到 `layout.less`
- 已把内部默认值收回 `layout.less` 的局部 alias owner，源码 / demo / README 已不再依赖旧的 per-section 内容变量和 dock 宽度变量
- 已修正 `defaultOpen/open` 可选布尔 prop 的受控判定，以及 `Layout.Aside` 到 drawer 容器的宽度变量桥接
- 已完成 build-first 运行时回归：`pnpm build:components` 后，`layout` 目标用例 `35` 条全部通过
- 已完成全仓回归：`pnpm test`、`pnpm type-check`、`pnpm build:playground`、`pnpm build:docs` 全部通过
- [ ] 完成 CSS 变量公开面专项测试补齐

## 阶段总览

### 阶段 0：设计冻结

- [x] 输出 `Layout` 根级状态边界方案
- [x] 输出 `Layout.Aside` 轴式 API 方案
- [x] 输出 `drawer` 宽度走 CSS 变量的结论
- [x] 输出 CSS 变量公开 / 私有边界方案
- [x] 最终确认 breaking API 命名

### 阶段 1：类型与 API 底座

- [x] 重写 `packages/components/src/layout/index.type.ts`
- [x] 定义 `Layout` 根级 props：`mode/defaultMode`、`floating/defaultFloating`
- [x] 定义 `Layout.Aside` props：`open/defaultOpen`、`width/defaultWidth`
- [x] 定义 `railWidth`、`minWidth`、`maxWidth`、`resizable`、`mode`
- [x] 移除整对象侧栏协议作为最终推荐 API
- [x] 明确事件模型：`update:open`、`update:width`

### 阶段 2：状态层重构

- [x] 新建统一状态入口，例如 `useControllableLayoutState`
- [x] 去掉 `Layout.vue` 里的隐式 `useVModel(..., { passive: true })` 状态入口
- [x] 收口 `mode` 的受控 / 非受控逻辑
- [x] 收口 `floating` 的受控 / 非受控逻辑
- [x] 为 `Layout.Aside` 建立自己的受控 / 非受控状态入口
- [x] 明确不支持字段级半受控

### 阶段 3：Aside 交互接线

- [x] 让 `Layout.AsideToggle` 消费新的 Aside 状态上下文
- [x] 让 dock aside resize 最终提交到 `width`
- [x] 让 aside open/close 最终提交到 `open`
- [x] 保留 `aside-resize-start / aside-resize / aside-resize-end`
- [x] 校验受控模式下“只发事件，不自改 UI”
- [x] 校验非受控模式下“自改 UI”

### 阶段 4：Floating 状态收口

- [x] 去掉 `useLayoutSurface.ts` 中“读时写入”的默认值补齐路径
- [x] 拆开 floating 默认值解析和 floating 提交
- [x] 保留 `floating-resize-start / floating-resize / floating-resize-end`
- [ ] 决定是否补 `floating-drag-start / floating-drag / floating-drag-end`
- [x] 保留最近一次 floating 几何状态

### 阶段 5：运行时样式投影重构

- [x] 重构 `useLayoutViewState.ts`
- [x] 不再把公开变量名直接作为运行时状态投影出口
- [x] 建立组件局部桥接变量命名，例如 `--left-dock-width`
- [x] 实现优先级：显式状态值或内部提交值 > 公开 CSS 变量 > fallback
- [x] 缺省时不给公开变量写 inline 覆盖

### 阶段 6：CSS 变量收敛

- [x] 收敛 `packages/components/src/styles/components/layout.less`
- [x] 保留公开稳定变量
- [x] 降级内部桥接变量为私有实现变量
- [x] 删除文档中的预留变量承诺
- [x] 把 `drawer` 宽度收口到 `--tr-layout-drawer-width`
- [x] 评估 `railWidth` 是否保留公开 CSS 变量

### 阶段 7：组件样式消费链路重构

- [x] 重写 `Layout.vue` 的 grid / drawer 宽度消费链路
- [x] 重写 `LayoutAside.vue` 的 dock / rail / slide / overlay 宽度消费链路
- [x] 保持 `LayoutMain.vue` 滚动条样式契约最小化
- [x] 清理对 left / right expanded / collapsed 公开变量的依赖

### 阶段 8：文档与 README 收口

- [x] 更新 `packages/components/src/layout/README.md`
- [x] 更新 `docs/src/components/layout.md`
- [x] 只保留公开稳定变量说明
- [x] 删除内部桥接变量说明
- [x] 删除预留变量说明
- [x] 增加 `--tr-layout-drawer-width` 用法示例
- [x] 增加受控 / 非受控最终推荐写法

### 阶段 9：Demo 收口

- [x] 更新 `packages/test/src/layout/index.vue`
- [x] 更新 layout demo，改为 `Layout.Aside` 直接受控
- [x] 不再展示 `leftAside/rightAside` 整对象 `computed + update`
- [x] 用 class + `--tr-layout-drawer-width` 展示 drawer 响应式宽度
- [x] 避免 demo 继续传播旧 API

### 阶段 10：测试补齐

- [x] 补 `Layout.Aside` 的 `open/defaultOpen` 测试入口
- [x] 补 `Layout.Aside` 的 `width/defaultWidth` 测试入口
- [x] 补受控模式“只发事件，不自改 UI”测试
- [x] 补非受控模式“自改 UI”测试
- [x] 补 `drawer` 宽度通过 `--tr-layout-drawer-width` 生效测试
- [ ] 补显式状态值优先于公开 CSS 变量测试
- [ ] 补私有变量不作为公开契约断言测试
- [ ] 补文档中列出的公开变量都有真实能力支撑的回归测试

### 阶段 11：遗留清理

- [ ] 删除旧整对象 API 的 demo 残留
- [ ] 删除不再公开的旧变量名说明
- [ ] 删除无效预留变量
- [x] 删除依赖内部变量的旧测试断言
- [x] 删除实现中的重复默认值 owner

## 任务分组 Checklist

### A. 必须先做

- [x] 最终确认 Aside 公开 API 命名
- [x] 重写类型定义
- [x] 建立新的状态入口
- [x] 完成 Aside 状态和交互接线

### B. 必须跟上

- [x] 收口运行时样式投影
- [x] 收敛 CSS 变量公开面
- [x] 重写样式消费链路

### C. 完成闭环

- [x] 更新 README
- [x] 更新组件文档
- [x] 更新 demo
- [ ] 补齐测试
- [ ] 清理遗留实现

## 实施顺序

本轮实际按下面顺序推进：

1. 清理 `layout.less` 中仍在公开的旧宽度变量和实现细节变量，把默认值 owner 收回到局部 alias。
2. 收口组件样式消费链路、测试夹具、README 和 docs demo，删掉对旧变量面的依赖。
3. 执行 build-first 验证，再跑 `layout` 目标矩阵和全仓回归。

## 完成标准

以下条件全部满足，才算本轮重构完成：

- [x] `Layout` 根级状态 API 已稳定
- [x] `Layout.Aside` 轴式 API 已稳定
- [x] `leftAside/rightAside` 整对象协议不再是主推荐方案
- [x] `drawer` 宽度已收口到 CSS 变量
- [x] 公开 CSS 变量面已收敛
- [x] README / docs / demo 口径一致
- [ ] 测试覆盖受控 / 非受控 / CSS 变量优先级 / 时序 / 约束
- [x] 无预留变量公开承诺
- [x] 无“读时写入”状态路径

## 备注

- 这份文档只负责追踪进度，不重复写设计细节。
- 设计细节以 `OPTIMIZATION.md` 和 `CSS_VARIABLES.md` 为准。
