# Layout Refactor

## 决议

- `Layout.vue` 最外层只保留一个 `tr-layout`。
- 新增 `tr-layout__body`，只负责内容网格、背景和圆角裁切。
- 移除 `tr-layout-frame`。
- 浮层样式和定位收敛到 `tr-layout--floating`。
- 拖拽条、浮层缩放触发器直接挂到 `tr-layout` 下。
- `tr-layout-frame__*` 类名改为 `tr-layout__*`。
- 浮层公开变量改为 `--tr-layout-floating-*`。
- `header / main / footer` 改为单层结构。
- 移除 `*-shell`、`*-inner` 结构。
- 移除以下变量：
  - `--tr-layout-content-max-width`
  - `--tr-layout-inner-padding-inline`
  - `--tr-layout-inner-padding-block`
- `Layout` 只负责布局、侧栏、浮层交互，不负责内容容器排版。
- context 改为 `state / actions` 结构，不再包装 getter 风格 panel api。
- 默认值归一化前移到 `useLayoutRootState`。
- 组件优先从 context 取 panel 状态，不再从 `Layout.vue` 逐层透传。
- 移除 `useLayoutPanel`，组件直接消费 context。

## 修改范围

- `packages/components/src/layout/Layout.vue`
- `packages/components/src/layout/components/FloatingResizeTrigger.vue`
- `packages/components/src/layout/composables/useLayoutFloating.ts`
- `packages/components/src/layout/composables/useLayoutAsideResize.ts`
- `packages/components/src/layout/composables/useLayoutContext.ts`
- `packages/components/src/layout/composables/useLayoutRootState.ts`
- `packages/components/src/layout/composables/useLayoutRenderState.ts`
- `packages/components/src/styles/components/layout.less`

## 联动范围

- `packages/test/src/layout/selectors.ts`
- layout 相关 CT / E2E 用例
- layout 文档和示例中的结构选择器说明

## 暂不处理

- props / emits 语义调整
- 文档文案重写
- 测试迁移方案
