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
- [ ] 完成最终 API 定稿
- [ ] 完成代码实现
- [ ] 完成文档 / demo / 测试收口

## 阶段总览

### 阶段 0：设计冻结

- [x] 输出 `Layout` 根级状态边界方案
- [x] 输出 `Layout.Aside` 轴式 API 方案
- [x] 输出 `drawer` 宽度走 CSS 变量的结论
- [x] 输出 CSS 变量公开 / 私有边界方案
- [ ] 最终确认 breaking API 命名

### 阶段 1：类型与 API 底座

- [ ] 重写 `packages/components/src/layout/index.type.ts`
- [ ] 定义 `Layout` 根级 props：`mode/defaultMode`、`floating/defaultFloating`
- [ ] 定义 `Layout.Aside` props：`open/defaultOpen`、`width/defaultWidth`
- [ ] 定义 `railWidth`、`minWidth`、`maxWidth`、`resizable`、`mode`
- [ ] 移除整对象侧栏协议作为最终推荐 API
- [ ] 明确事件模型：`update:open`、`update:width`

### 阶段 2：状态层重构

- [ ] 新建统一状态入口，例如 `useControllableLayoutState`
- [ ] 去掉 `Layout.vue` 里的隐式 `useVModel(..., { passive: true })` 状态入口
- [ ] 收口 `mode` 的受控 / 非受控逻辑
- [ ] 收口 `floating` 的受控 / 非受控逻辑
- [ ] 为 `Layout.Aside` 建立自己的受控 / 非受控状态入口
- [ ] 明确不支持字段级半受控

### 阶段 3：Aside 交互接线

- [ ] 让 `Layout.AsideToggle` 消费新的 Aside 状态上下文
- [ ] 让 dock aside resize 最终提交到 `width`
- [ ] 让 aside open/close 最终提交到 `open`
- [ ] 保留 `aside-resize-start / aside-resize / aside-resize-end`
- [ ] 校验受控模式下“只发事件，不自改 UI”
- [ ] 校验非受控模式下“自改 UI”

### 阶段 4：Floating 状态收口

- [ ] 去掉 `useLayoutSurface.ts` 中“读时写入”的默认值补齐路径
- [ ] 拆开 floating 默认值解析和 floating 提交
- [ ] 保留 `floating-resize-start / floating-resize / floating-resize-end`
- [ ] 决定是否补 `floating-drag-start / floating-drag / floating-drag-end`
- [ ] 保留最近一次 floating 几何状态

### 阶段 5：运行时样式投影重构

- [ ] 重构 `useLayoutViewState.ts`
- [ ] 不再把公开变量名直接作为运行时状态投影出口
- [ ] 建立私有桥接变量命名，例如 `--_tr-layout-*`
- [ ] 实现优先级：显式状态值或内部提交值 > 公开 CSS 变量 > fallback
- [ ] 缺省时不给公开变量写 inline 覆盖

### 阶段 6：CSS 变量收敛

- [ ] 收敛 `packages/components/src/styles/components/layout.less`
- [ ] 保留公开稳定变量
- [ ] 降级内部桥接变量为私有实现变量
- [ ] 删除文档中的预留变量承诺
- [ ] 把 `drawer` 宽度收口到 `--tr-layout-drawer-width`
- [ ] 评估 `railWidth` 是否保留公开 CSS 变量

### 阶段 7：组件样式消费链路重构

- [ ] 重写 `Layout.vue` 的 grid / drawer 宽度消费链路
- [ ] 重写 `LayoutAside.vue` 的 dock / rail / slide / overlay 宽度消费链路
- [ ] 保持 `LayoutMain.vue` 滚动条样式契约最小化
- [ ] 清理对 left / right expanded / collapsed 公开变量的依赖

### 阶段 8：文档与 README 收口

- [ ] 更新 `packages/components/src/layout/README.md`
- [ ] 更新 `docs/src/components/layout.md`
- [ ] 只保留公开稳定变量说明
- [ ] 删除内部桥接变量说明
- [ ] 删除预留变量说明
- [ ] 增加 `--tr-layout-drawer-width` 用法示例
- [ ] 增加受控 / 非受控最终推荐写法

### 阶段 9：Demo 收口

- [ ] 更新 `packages/test/src/layout/index.vue`
- [ ] 更新 layout demo，改为 `Layout.Aside` 直接受控
- [ ] 不再展示 `leftAside/rightAside` 整对象 `computed + update`
- [ ] 用 class + `--tr-layout-drawer-width` 展示 drawer 响应式宽度
- [ ] 避免 demo 继续传播旧 API

### 阶段 10：测试补齐

- [ ] 补 `Layout.Aside` 的 `open/defaultOpen` 测试
- [ ] 补 `Layout.Aside` 的 `width/defaultWidth` 测试
- [ ] 补受控模式“只发事件，不自改 UI”测试
- [ ] 补非受控模式“自改 UI”测试
- [ ] 补 `drawer` 宽度通过 `--tr-layout-drawer-width` 生效测试
- [ ] 补显式状态值优先于公开 CSS 变量测试
- [ ] 补私有变量不作为公开契约断言测试
- [ ] 补文档中列出的公开变量都有真实能力支撑的回归测试

### 阶段 11：遗留清理

- [ ] 删除旧整对象 API 的 demo 残留
- [ ] 删除不再公开的旧变量名说明
- [ ] 删除无效预留变量
- [ ] 删除依赖内部变量的旧测试断言
- [ ] 删除实现中的重复默认值 owner

## 任务分组 Checklist

### A. 必须先做

- [ ] 最终确认 Aside 公开 API 命名
- [ ] 重写类型定义
- [ ] 建立新的状态入口
- [ ] 完成 Aside 状态和交互接线

### B. 必须跟上

- [ ] 收口运行时样式投影
- [ ] 收敛 CSS 变量公开面
- [ ] 重写样式消费链路

### C. 完成闭环

- [ ] 更新 README
- [ ] 更新组件文档
- [ ] 更新 demo
- [ ] 补齐测试
- [ ] 清理遗留实现

## 实施顺序

按下面顺序推进：

1. 先定 API 和类型。
2. 再做状态层和 Aside 接线。
3. 再做样式投影和 CSS 变量收敛。
4. 再改文档、demo、测试。
5. 最后清理遗留实现。

## 完成标准

以下条件全部满足，才算本轮重构完成：

- [ ] `Layout` 根级状态 API 已稳定
- [ ] `Layout.Aside` 轴式 API 已稳定
- [ ] `leftAside/rightAside` 整对象协议不再是主推荐方案
- [ ] `drawer` 宽度已收口到 CSS 变量
- [ ] 公开 CSS 变量面已收敛
- [ ] README / docs / demo 口径一致
- [ ] 测试覆盖受控 / 非受控 / CSS 变量优先级 / 时序 / 约束
- [ ] 无预留变量公开承诺
- [ ] 无“读时写入”状态路径

## 备注

- 这份文档只负责追踪进度，不重复写设计细节。
- 设计细节以 `OPTIMIZATION.md` 和 `CSS_VARIABLES.md` 为准。
