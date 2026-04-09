# ContentNav x BubbleList 重构实施文档

## 1. 目标

这份文档用于指导 `ContentNav` 与 `BubbleList` 的集成重构，当前目标已经收敛为三件事：

- 让 `ContentNav` 只消费统一的 `source` 协议
- 为非 `BubbleList` 场景提供通用的 `useContentNavSource`
- 以最小改动为 `BubbleList` 增加内建内容导航源能力

当前处于开发阶段，不考虑 `ContentNav` 主入口的兼容性；同时要避免为了接入 `ContentNav` 而扩散修改 `Bubble.vue`、`BubbleItem.vue` 或 Bubble 内部状态链路。

## 2. 当前状态

### 2.1 已完成

以下改动已经落地并通过验证：

- `packages/components/src/content-nav/index.type.ts`
  - 定义了 `ContentNavSource`
  - `ContentNavProps` 收口为 `source + scrollContainer + 受控状态`
- `packages/components/src/content-nav/internal.type.ts`
  - `ContentNavScrollSpyOptions` 改为消费 `source`
- `packages/components/src/content-nav/index.vue`
  - 主渲染链路只消费 `props.source`
- `packages/components/src/content-nav/useContentNavScrollSpy.ts`
  - 只依赖 `source.items`、`source.resolveTarget`、`source.revision`
- `packages/components/src/content-nav/useContentNavSource.ts`
  - 新增通用 helper，向外暴露 `{ source, bindTarget }`
  - 已补稳定 binder 复用与 stale target 自动清理
- `packages/components/src/content-nav/index.ts`
  - 导出 `useContentNavSource`
- `packages/components/src/index.ts`
  - 根入口导出 `useContentNavSource`
  - 已移除 `vContentNavAnchor` / `useContentNavRegistry` 根导出
- `packages/test/src/content-nav/index.vue`
  - 已切到直接消费 `bubbleListRef.getContentNavSource()`
  - 已通过 `BubbleList.contentNav.itemResolver` 定制导航项文本与搜索文本
- `packages/components/src/bubble/index.type.ts`
  - 已新增 `contentNav` 配置类型
- `packages/components/src/bubble/BubbleList.vue`
  - 已可基于 `messageGroups` 生成最小版内容导航源
  - 已直接把 target 绑定到真实 `.tr-bubble` 根节点
- `packages/components/src/shared/composables/useTargetRegistry.ts`
  - 已抽出共享 target registry / binder 底座
- `packages/components/src/shared/content-nav.type.ts`
  - 已抽出 `ContentNavItem / ContentNavSource` 共享协议类型
- `packages/components/src/bubble/composables/useBubbleContentNav.ts`
  - 已复用 shared target registry
  - 不再自己维护独立的 target map / revision 逻辑

### 2.2 已验证

- `pnpm -F @opentiny/tiny-robot type-check` 通过
- `pnpm.cmd -F @opentiny/tiny-robot build` 通过
- `pnpm.cmd -F tiny-robot-test build` 通过
- `pnpm.cmd -F tiny-robot-test test -- src/content-nav` 15 个用例全部通过
- `pnpm.cmd -F docs build` 通过

### 2.3 仍未完成

- `docs/src/components/bubble.md` 还可以继续补充 `BubbleList.contentNav` 的使用限制与推荐场景

### 2.4 独立问题

`pnpm.cmd -F @opentiny/tiny-robot build` 现在已经可以正常走完 `vite-plugin-dts / api-extractor` 的声明 rollup 阶段，不再是当前重构的阻塞项。

当前仍保留一个非阻塞告警：

- API Extractor 内置 TypeScript 版本为 `5.8.2`
- 项目当前使用的 TypeScript 版本为 `5.9.3`

这条告警目前不影响构建成功，后续如果需要再单独评估是否升级相关依赖。

## 3. 已确认的设计决策

### 3.1 `ContentNav` 只保留 `source` 主协议

当前不再以 `items`、`registry`、`data-content-nav-id` 作为主接入协议。`ContentNav` 的主输入是：

```ts
export interface ContentNavSource {
  items: Readonly<Ref<ContentNavItem[]>>
  resolveTarget: (id: string) => HTMLElement | null
  revision: Readonly<Ref<number>>
}
```

### 3.2 非 `BubbleList` 场景统一走 `useContentNavSource`

统一 helper 形态如下：

```ts
export function useContentNavSource(options: {
  items: MaybeRefOrGetter<ContentNavItem[]>
}): {
  source: ContentNavSource
  bindTarget: (id: string) => (el: Element | ComponentPublicInstance | null) => void
}
```

这条链路已经是当前稳定方案。

### 3.3 不把 `Bubble.state/store` 当作导航链路

`Bubble.state` / `state-change` / `BubbleProvider.store` 的职责是消息 UI 状态共享，不适合作为：

- 导航结构数据
- `id -> DOM` 映射
- scroll-spy 的目标注册链路

因此本轮实现不基于它们扩展 `ContentNav`。

### 3.4 `BubbleList` 优先只改自身

下一步的最小实现优先只动：

- `packages/components/src/bubble/index.type.ts`
- `packages/components/src/bubble/BubbleList.vue`

当前不优先改：

- `packages/components/src/bubble/Bubble.vue`
- `packages/components/src/bubble/BubbleItem.vue`
- `packages/components/src/bubble/constants.ts`

原因很明确：

- `BubbleList` 已经拥有 `messageGroups`
- `BubbleList` 本身就负责分组渲染顺序
- 目标 DOM 可以直接挂在 `BubbleItem -> .tr-bubble` 这条现有根节点链路上
- 这样可以避免把 `Bubble` 变成 `ContentNav` 基础设施的一部分

## 4. 推荐实现路径

### 4.1 当前阶段的 `BubbleList` 集成原则

`BubbleList` 的首个版本只需要提供“导航源”，不需要一步到位做“Bubble 自动注册”。

推荐实现：

1. `BubbleList` 增加 `contentNav?: boolean | BubbleListContentNavOptions`
2. 根据 `messageGroups` 生成 `contentNavItems`
3. 通过 `BubbleItem` 现有单根结构把 `ref / data-content-nav-id` 直接挂到真实 `.tr-bubble`
4. 由 `useBubbleContentNav` 复用 shared target registry
5. 由 `BubbleList` 自己 expose `getContentNavSource()`

### 4.2 为什么优先直接挂到 `.tr-bubble`

相比改 `Bubble.vue` / `BubbleItem.vue` 做 bridge，直接挂到 `BubbleItem -> .tr-bubble` 这条现有链路更小、更稳：

- 改动面只在 `BubbleList.vue`
- 不需要新增 wrapper DOM
- `data-content-nav-id` 直接落在真实 target 上
- 继续避免 provide/inject 新 bridge
- 更容易回归和定位问题

### 4.3 预期 API

类型草案如下：

```ts
export interface BubbleListContentNavOptions {
  itemResolver?: (context: {
    group: BubbleMessageGroup
    groupIndex: number
    dividerRole: string
  }) => ContentNavItem | false
}

export interface BubbleListProps {
  messages: BubbleMessage[]
  groupStrategy?: 'consecutive' | 'divider' | BubbleGroupFunction
  dividerRole?: string
  fallbackRole?: string
  roleConfigs?: Record<string, BubbleRoleConfig>
  contentRenderMode?: BubbleProps['contentRenderMode']
  contentResolver?: BubbleProps['contentResolver']
  autoScroll?: boolean
  contentNav?: boolean | BubbleListContentNavOptions
}
```

## 5. 执行顺序

### 步骤 1：文档先切到当前真实方案

本轮已完成：

- 更新本方案文档
- 更新 `docs/src/components/content-nav.md`
- 更新 `docs/src/components/bubble.md`
- 更新 `docs/demos/content-nav/controlled-search.vue`

结果是文档已经与当前源码保持一致，不再继续宣传旧的 `items + vContentNavAnchor` 主路径。

### 步骤 2：最小化实现 `BubbleList.getContentNavSource()`

本轮已完成：

- `packages/components/src/bubble/index.type.ts`
- `packages/components/src/bubble/BubbleList.vue`

交付目标：

- `BubbleList` 增加 `contentNav` 配置
- `BubbleList` 内部按 group 生成 `contentNavItems`
- `BubbleList` expose `getContentNavSource()`

### 步骤 3：切换测试页

本轮已完成：

- `packages/test/src/content-nav/index.vue`
- `packages/test/src/content-nav/testHelper.ts`

交付目标：

- 不再手动构造 `useContentNavSource + bindBubbleTarget`
- 直接消费 `bubbleListRef.getContentNavSource()`
- 跳转反馈和 e2e helper 都绑定到真实的 `.tr-bubble[data-role="user"]`

### 步骤 4：补回归验证

本轮已完成：

- `pnpm -F @opentiny/tiny-robot type-check`
- `pnpm.cmd -F @opentiny/tiny-robot build`
- `pnpm.cmd -F tiny-robot-test build`
- `pnpm.cmd -F tiny-robot-test test -- src/content-nav`
- `pnpm.cmd -F docs build`

## 6. 文件级计划

### 6.1 已完成

- `packages/components/src/content-nav/index.type.ts`
- `packages/components/src/content-nav/internal.type.ts`
- `packages/components/src/content-nav/index.vue`
- `packages/components/src/content-nav/useContentNavScrollSpy.ts`
- `packages/components/src/content-nav/useContentNavSource.ts`
- `packages/components/src/content-nav/index.ts`
- `packages/components/src/index.ts`
- `packages/test/src/content-nav/index.vue`
- `packages/test/src/content-nav/testHelper.ts`
- `docs/demos/content-nav/controlled-search.vue`
- `docs/src/components/content-nav.md`

### 6.2 下一步只剩这些收尾项

- `docs/src/components/bubble.md`
  - 继续补充 `BubbleList.contentNav` 的使用限制与推荐场景

### 6.3 暂不改动

- `packages/components/src/bubble/Bubble.vue`
- `packages/components/src/bubble/BubbleItem.vue`
- `packages/components/src/bubble/constants.ts`
- `packages/components/src/bubble/composables/*`

## 7. 风险与检查点

### 7.1 `BubbleMessage.id` 稳定性

如果用户消息缺少稳定 id，导航项 id 与 DOM 目标都会不稳定。文档里应明确建议：参与目录导航的消息需要稳定 id。

### 7.2 分组策略变化

`groupStrategy` 会直接影响 `messageGroups`，因此也会直接影响 `contentNavItems`。这一步必须让导航项严格从 group 结果派生，而不是再单独维护一套分组逻辑。

### 7.3 直接绑定到 `.tr-bubble` 的约束

当前已经不再新增 wrapper，但仍要重点关注“直接挂到 `.tr-bubble` 根节点”后的回归点：

- 间距
- overflow
- 自动滚动
- slot 布局

同时需要接受一个明确约束：

- 当前实现依赖 `BubbleItem` 继续保持单根，并把非 prop attribute 透传到 `.tr-bubble`

### 7.4 不在这一步处理的内容

- `Bubble` 自动注册 DOM

## 8. Checklist

### 已完成

- [x] 定义 `ContentNavSource`
- [x] `ContentNav` 收口到 `source`
- [x] `useContentNavScrollSpy` 接入 `source.resolveTarget`
- [x] `useContentNavScrollSpy` 接入 `source.revision`
- [x] 新增 `useContentNavSource`
- [x] 通用场景接入 `useContentNavSource`
- [x] `type-check` 通过
- [x] `@opentiny/tiny-robot build` 通过
- [x] `tiny-robot-test build` 通过
- [x] `src/content-nav` e2e 通过

### 待完成

- [x] `BubbleListProps` 新增 `contentNav`
- [x] `BubbleList` 内部生成 `contentNavItems`
- [x] `useBubbleContentNav` 复用 shared target registry
- [x] `BubbleList` 直接把 target 绑定到真实 `.tr-bubble` 根节点
- [x] `BubbleList` expose `getContentNavSource()`
- [x] 测试页改为直接消费 `bubbleListRef.getContentNavSource()`
- [x] 文档主示例更新为内建 `BubbleList` 方案

## 9. 结论

当前阶段已经把 `ContentNav -> BubbleList.getContentNavSource() -> 测试页/文档主示例` 这条主链路打通了，而且保持住了“只改 BubbleList、不扩散到 Bubble/BubbleItem”的边界。

接下来真正剩下的工作，主要是收尾而不是继续扩功能：

- 继续补充 `docs/src/components/bubble.md` 中 `BubbleList.contentNav` 的使用限制与推荐场景
- 如果后续出现真实需求，再决定是否要扩展 `BubbleList.contentNav` 的策略能力
