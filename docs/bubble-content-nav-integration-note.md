# Bubble 与 ContentNav 集成调整说明

## 说明目的

这份文档用于向组件维护者同步当前讨论后的结论，澄清以下问题：

1. 为什么原来的 `BubbleList -> ContentNavSource` 方案需要收回
2. 维护者提出的两个方向在现有源码下是否可行
3. Bubble 和 ContentNav 的职责边界应该如何重新划分
4. 后续更合理的 API 与实现方向是什么

这份文档不再以“当前已实现内容”为主，而是以“讨论后的目标设计方案”为主。

## 讨论后的核心结论

讨论后的总体方向应该调整为：

- `Bubble` 不直接内建 `contentNav` 集成能力
- `BubbleList` 不负责向外 expose `ContentNavSource`
- `ContentNav` 不要求外部传 `source`
- `Bubble` 只提供“目标元素标记能力”
- `ContentNav` 直接消费 `items`，并在组件内部完成目标元素解析

也就是说，应该从原来的：

**Bubble 生产导航源，ContentNav 消费导航源**

收敛为：

**Bubble 只暴露可导航目标，ContentNav 自己解析目标**

这次调整的本质是职责收缩：

- `Bubble` 保持展示组件定位，不承担目录数据生产职责
- `ContentNav` 保持导航组件定位，自行解决“目录项如何找到真实目标元素”的问题

## 为什么原方案需要收回

原方案的核心是：

- `BubbleList` 根据 `messageGroups` 生成 `ContentNavItem[]`
- `BubbleList` 通过 `getContentNavSource()` 对外暴露 `ContentNavSource`
- `useBubbleContentNav()` 内部维护 `id -> bubble DOM` 的 registry
- `ContentNav` 通过 `source.resolveTarget(id)` 完成点击跳转与 scroll spy

这套方案本身是闭环的，但维护者认为它有两个问题：

1. `Bubble` 组件被赋予了过多“导航系统”职责
2. `ContentNav` 依赖 `source` 这层抽象过重，不够贴近业务直接使用场景

从源码角度看，这个判断是合理的。

当前 `BubbleList` 在语义上是消息展示组件，而不是“目录源组件”。如果给它增加：

- `contentNav?: boolean | BubbleListContentNavOptions`
- `getContentNavSource(): ContentNavSource`

就会让 Bubble 侧承担两层含义：

- 展示消息
- 生成并维护目录目标绑定

这虽然能工作，但组件职责会往“复合型业务组件”方向偏移。

另一方面，`ContentNavSource` 这层抽象要求外部同时提供：

- `items`
- `resolveTarget`
- `revision`

这对于“业务自己已经能给 DOM 打标记”的场景来说确实有些重。

## 维护者提出的两个方向

### 方向 1：Bubble 通过 `boxRendererMatches.attributes` 给目标元素打标记

维护者建议：

- 不要让 `BubbleList` 感知 `contentNav`
- 业务侧通过 `boxRendererMatches` 的 `attributes` 给 bubble 渲染结果打上 `data-content-nav-id`
- `attributes` 当前是静态对象，需要扩展成函数型，与 `find` 获取同样的上下文

这个方向的本质是：

**Bubble 只提供目标元素标记机制，不提供目录项生产机制**

### 方向 2：ContentNav 不外置 `useContentNavSource`

维护者建议：

- `ContentNav` 直接接收 `items`
- 不要求外部传 `source`
- `ContentNav` 内部兼容两种目标绑定方式
  - `data-content-nav-id`
  - `ref/element`

这个方向的本质是：

**ContentNav 自己解决“如何从 item 找到目标元素”**

## 对方向 1 的源码分析

### 当前 `attributes` 能力落点在哪里

当前链路如下：

- [`BubbleProvider.vue`](/e:/LS_WorkSpace/web/tiny-robot/packages/components/src/bubble/BubbleProvider.vue) 负责注入 `boxRendererMatches`
- [`useBubbleBoxRenderer.ts`](/e:/LS_WorkSpace/web/tiny-robot/packages/components/src/bubble/composables/useBubbleBoxRenderer.ts) 负责按 `find` 选中 match
- [`BubbleBoxWrapper.vue`](/e:/LS_WorkSpace/web/tiny-robot/packages/components/src/bubble/BubbleBoxWrapper.vue) 会把 `renderer.attributes` `v-bind` 到最终 box renderer 上
- 默认 box renderer 是 [`Box.vue`](/e:/LS_WorkSpace/web/tiny-robot/packages/components/src/bubble/renderers/Box.vue)

关键点在于：

```vue
<component
  :is="renderer.renderer"
  :data-role="props.role"
  :data-placement="props.placement"
  :data-shape="props.shape"
  v-bind="renderer.attributes"
>
```

所以 `attributes` 最终落在 box renderer 根节点，默认是 `.tr-bubble__box`，不是 `.tr-bubble` 根节点。

这意味着如果业务侧通过 `attributes` 打：

```ts
{ 'data-content-nav-id': 'turn-1' }
```

最终元素会是：

```html
<div class="tr-bubble__box" data-content-nav-id="turn-1"></div>
```

不是：

```html
<div class="tr-bubble" data-content-nav-id="turn-1"></div>
```

### 这个方案是否可行

可行，但要明确它解决的是：

**给目标元素打标记**

而不是：

**Bubble 官方内建目录功能**

只要 `ContentNav` 后续允许通过 selector 找到真实目标，这条路就成立。

### 当前 `attributes` 为什么必须扩成函数型

当前类型定义在 [`bubble/index.type.ts`](/e:/LS_WorkSpace/web/tiny-robot/packages/components/src/bubble/index.type.ts)：

```ts
attributes?: Record<string, string>
```

这是静态属性，不能根据当前 bubble 的 message 动态生成 id。

而业务想做的事情通常是这种：

```ts
attributes: (messages, content, contentIndex) => ({
  'data-content-nav-id': messages[0]?.id,
})
```

因此 `attributes` 必须具备和 `find` 同级的上下文能力，否则业务没法把“当前消息组”映射成“当前 DOM 标记”。

我建议的新类型可以是：

```ts
type BubbleRendererAttributes =
  | Record<string, string | undefined>
  | ((
      messages: BubbleMessage[],
      content: ChatMessageContentItem | undefined,
      contentIndex: number | undefined,
    ) => Record<string, string | undefined> | undefined)
```

然后 `useBubbleBoxRenderer()` 返回时统一把它解析成最终对象。

### 这个方案的限制

这个方案虽然可行，但有几个边界要说明清楚：

1. 属性落点在 `.tr-bubble__box`，不是 `.tr-bubble`
2. `split` 模式下一个 bubble 可能有多个 box，需要根据 `contentIndex` 决定是否只给一个 box 打标记
3. 如果业务自定义了多个 box renderer match，可能要保证这些 match 的 `attributes` 行为一致
4. 它只解决“DOM 标记”，不解决“目录项列表怎么来”

因此，这个方案更像一个 Bubble 的扩展点，而不是一个完整的 Bubble-ContentNav 集成方案。

### 如果业务侧给每个 matcher 都补同样的 attrs 逻辑，会不会解决覆盖问题

会。

前面提到的“最后一个 fallback match 覆盖不到图片/特殊 renderer”的问题，本质上不是 `attributes` 机制不行，而是：

- `useBubbleBoxRenderer()` 只会返回**第一个命中的 match**
- 如果某个特化 match 先命中，最后那个 `find: () => true` 的兜底 match 就不会再执行

所以如果业务侧直接把同一段 `data-content-nav-id` 逻辑写到每一个可能命中的 matcher 上，例如：

```ts
const resolveContentNavAttrs = (messages, _content, contentIndex) => {
  if (contentIndex !== undefined && contentIndex > 0) {
    return undefined
  }

  return {
    'data-content-nav-id': messages[0]?.id,
  }
}
```

然后每个业务自定义 matcher 都复用：

```ts
{
  find: ...,
  renderer: BubbleRenderers.Box,
  attributes: resolveContentNavAttrs,
}
```

那么不管最终命中哪个 match，只要这个 match 自身带上了该 attrs 逻辑，就不会再有“覆盖不到”的问题。

这说明：

- 业务侧完全可以通过“给多个 matcher 重复补 attrs”的方式先把方案跑通
- 这条路在短期是成立的
- 代价只是这段 attrs 逻辑会分散在多个 matcher 上，维护成本由业务侧承担

所以它是一个可接受的业务侧实现方式，只是不是框架层最优雅的长期形态。

## 对方向 2 的源码分析

### 为什么 `useContentNavSource` 应该收回内部

当前 `useContentNavSource()` 的作用是：

- 根据 `items` 创建 registry
- 返回 `source`
- 返回 `bindTarget(id)`

也就是说，它是“外部自己管理目标绑定”的辅助工具。

但维护者现在希望的是：

- 外部只提供 `items`
- 目标绑定方式统一由 `ContentNav` 内部兼容

这意味着 `useContentNavSource` 不再适合作为公开 API。

它会使得业务多承担一层中间抽象，而维护者希望业务只表达：

- 我的导航项是什么
- 我的目标元素如何标记或引用

剩下的解析工作由 `ContentNav` 完成。

### ContentNav 当前为什么不能直接把 `id` 改成“string | ref”

这点需要特别强调。

从现有源码看，`ContentNavItem.id` 不只是“目标选择器”，它还是整个导航系统里的逻辑身份。

当前 `id` 同时用于：

- `activeId` 比较
- 高亮同步
- 键盘聚焦定位
- `v-for key`
- `data-item-id`
- 选择事件回传

涉及文件包括：

- [`useContentNavState.ts`](/e:/LS_WorkSpace/web/tiny-robot/packages/components/src/content-nav/useContentNavState.ts)
- [`ContentNavList.vue`](/e:/LS_WorkSpace/web/tiny-robot/packages/components/src/content-nav/components/ContentNavList.vue)
- [`ContentNavItem.vue`](/e:/LS_WorkSpace/web/tiny-robot/packages/components/src/content-nav/components/ContentNavItem.vue)
- [`content-nav/index.vue`](/e:/LS_WorkSpace/web/tiny-robot/packages/components/src/content-nav/index.vue)

如果直接把 `id` 改成：

```ts
string | Ref<Element | null>
```

会立即带来这些问题：

1. `activeId` 还是否是 `string`
2. `v-model:activeId` 回传什么
3. `item.id === activeId` 这类逻辑如何继续成立
4. `v-for :key=\"item.id\"` 是否稳定
5. `data-item-id` 还能否继续工作

所以从职责上看，`id` 不应该兼任“目标元素引用”。

### 更合理的做法：保留 `id` 为字符串，新增目标字段

建议保留：

```ts
id: string
```

然后新增例如：

```ts
target?: string | MaybeRefOrGetter<Element | ComponentPublicInstance | null>
```

这样职责就清晰了：

- `id`：目录项逻辑身份
- `target`：真实 DOM 目标的定位信息

这样既符合维护者要的“支持 selector 和 ref 两种绑定方式”，又不会破坏现有导航状态模型。

## 建议的新设计方案

讨论后的推荐方案如下。

### Bubble 侧职责

Bubble 侧只保留：

- 通过 `boxRendererMatches.attributes` 给目标元素打标记的能力

不再保留：

- `BubbleList.contentNav`
- `BubbleList.getContentNavSource()`
- `useBubbleContentNav()` 作为官方 Bubble 集成方案

### Bubble 侧 API 建议

调整 [`BubbleBoxRendererMatch`](/e:/LS_WorkSpace/web/tiny-robot/packages/components/src/bubble/index.type.ts)：

```ts
attributes?:
  | Record<string, string | undefined>
  | ((
      messages: BubbleMessage[],
      content: ChatMessageContentItem | undefined,
      contentIndex: number | undefined,
    ) => Record<string, string | undefined> | undefined)
```

业务侧示例：

```ts
const boxRendererMatches = [
  {
    find: () => true,
    renderer: Box,
    attributes: (messages, _content, contentIndex) => {
      if (contentIndex !== undefined && contentIndex !== 0) {
        return undefined
      }

      return {
        'data-content-nav-id': messages[0]?.id,
      }
    },
  },
]
```

### ContentNav 侧职责

ContentNav 侧负责：

- 接收 `items`
- 内部解析目标元素
- 完成点击跳转
- 完成 scroll spy
- 完成 active/highlight 同步

不再要求外部提供 `source`。

### ContentNavItem 建议结构

```ts
export type ContentNavTarget =
  | string
  | MaybeRefOrGetter<Element | ComponentPublicInstance | null>

export interface ContentNavItem {
  id: string
  label: string
  target?: ContentNavTarget
  searchText?: string
  tooltipText?: string
  meta?: Record<string, unknown>
}
```

### ContentNav 内部目标解析规则

建议内部采用如下优先级：

1. 如果 `item.target` 是 `ref/element/component instance`
   - 使用 `unrefElement()` 解出真实 `HTMLElement`
2. 如果 `item.target` 是字符串
   - 在 `scrollContainer` 内优先 `querySelector`
   - 找不到再退回 `document.querySelector`
3. 如果未提供 `item.target`
   - 默认用 `item.id` 查找 `[data-content-nav-id="<id>"]`

这样可以同时支持：

- Bubble 业务场景通过 `data-content-nav-id` 标记目标
- 通用业务场景通过 ref 直接传递目标

## 一个更贴近业务的接入示例

### Bubble 场景

业务侧只需要：

1. 通过 `boxRendererMatches.attributes` 给 box 打 `data-content-nav-id`
2. 给 `ContentNav` 传一组普通 `items`

例如：

```ts
const items = [
  { id: 'turn-1', label: '会议结论' },
  { id: 'turn-2', label: '负责人和时间点' },
]
```

这里没有显式 `target`，`ContentNav` 会自动按：

```ts
[data-content-nav-id="turn-1"]
```

去查找目标元素。

### 纯文本消息场景下的最小接入方式

如果当前业务里只有文本消息，那么接入成本其实比较低，因为：

- 通常最终都会命中默认 `Box` renderer
- 不需要处理图片、卡片、多种 box renderer 分支
- 不需要考虑多个不同 match 的覆盖问题

在这种前提下，业务侧完全可以先采用一个“最后 fallback match + 动态 attributes”的最小方案。

概念上类似这样：

```ts
const textContentNavBoxMatch = {
  find: () => true,
  renderer: BubbleRenderers.Box,
  priority: 999,
  attributes: (messages, _content, contentIndex) => {
    if (contentIndex !== undefined && contentIndex > 0) {
      return undefined
    }

    return {
      'data-content-nav-id': messages[0]?.id,
    }
  },
}
```

再配合普通的 `ContentNav` items：

```ts
const items = [
  { id: 'turn-1', label: '项目结论' },
  { id: 'turn-2', label: '负责人和时间点' },
]
```

这种情况下，只要业务保证：

- bubble DOM 上的 `data-content-nav-id`
- `ContentNavItem.id`

使用的是同一套稳定 id，就能完成最基本的：

- 目录渲染
- 点击跳转
- active 高亮同步

也就是说，在“只有文本消息”的阶段，这个方案是一个低成本、可直接落地的业务接入方案。

只有当业务后续扩展到：

- 图片消息
- 多 renderer 类型
- split 模式
- 更复杂的自定义 Box renderer

才需要进一步考虑是否升级为更通用的框架层能力。

### 通用内容场景

如果业务不是 Bubble，而是普通文档内容：

```ts
const summaryRef = ref<HTMLElement | null>(null)

const items = [
  {
    id: 'summary',
    label: '摘要',
    target: summaryRef,
  },
]
```

这时 `ContentNav` 内部直接通过 `unrefElement(summaryRef)` 取得目标元素。

## 对当前分支代码的影响

如果采用讨论后的新方案，则以下内容需要从 Bubble PR 中撤回或重构：

- `BubbleList.vue` 中与 `contentNav` 相关的接入
- `BubbleList` 的 `getContentNavSource` expose
- `useBubbleContentNav.ts`
- `shared/content-nav.type.ts` 中围绕 `ContentNavSource` 的设计
- `useTargetRegistry.ts` 作为当前主链路实现
- `useContentNavSource.ts` 公开导出

而应转向：

- `BubbleBoxRendererMatch.attributes` 动态化
- `ContentNav` 直接接收 `items`
- `ContentNavItem` 新增 `target`
- `ContentNav` 内部兼容 selector/ref 两种目标解析方式

## 最终建议

综合当前源码与维护者意见，建议采取以下调整策略：

1. Bubble PR 收缩为“目标元素标记能力”
2. ContentNav PR 收缩为“内部目标解析能力”
3. 不要让 `BubbleList` 内建 `contentNav` 数据生产职责
4. 不要让 `ContentNavItem.id` 兼任逻辑身份和目标引用
5. 保持 `id: string`，新增 `target` 字段表达目标绑定信息

这样可以同时满足：

- 组件职责清晰
- Bubble 无需承担目录系统职责
- ContentNav 接入方式更贴近业务
- selector/ref 两种用法都能支持
- 现有 `activeId` / 高亮 / 键盘导航逻辑无需整体推翻

## 一句话总结

后续更合理的方案不是“Bubble 帮 ContentNav 生产 source”，而是：

**Bubble 只负责把真实目标元素暴露出来，ContentNav 自己基于 items 和目标绑定信息完成导航行为。**
