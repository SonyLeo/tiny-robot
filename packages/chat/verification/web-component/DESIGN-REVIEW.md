# Chat Web Component 首版设计与验收记录

状态：首版嵌入式方案已实现并完成原生 HTML 与 Angular 21 的初步消费验证，2026-09-27；尚未发布。阶段证据见 [RESULTS.md](./RESULTS.md) 和 [BUNDLE-SIZE.md](./BUNDLE-SIZE.md)。实际接入以 `packages/chat-web-component/README.md` 为准。

## 已确认与建议范围

| 分类 | 内容 |
| --- | --- |
| 已确认 | 原生 HTML 和 Angular 宿主；Chrome/Chromium 优先；宿主只使用 DOM 属性、特性、事件与方法；组件内部可携带 Vue；每个实例内存会话，刷新或卸载后清空；kit Angular 适配由另一任务负责。 |
| 首版建议 | 嵌入式正常布局，真实 TrChat/runtime/kit，流式响应、取消、失败后的重新发送、会话切换与历史、亮暗主题、菜单及键盘操作、一个无数据的原生 `header-notice` 插槽。保留输入建议浮层的 Shadow DOM 兼容性；当前演示中的固定 JavaScript/TypeScript 建议不作为产品默认数据。 |
| 待评审 | 宿主是否需要配置输入建议内容、会话/请求状态事件、更多无数据原生插槽；Angular 最低版本、Chrome 版本与移动端范围；可接受的冷启动指标。没有宿主场景前不扩充接口。 |
| 暂不承诺 | 外部状态接管、刷新后持久化、Vue scoped slot 数据、任意框架组件注入、SSR、浮动布局、完整 MCP/附件交互、任意 UI 配置透传、CDN 单文件分发。功能进入首版须另列接入与验收场景。 |

## 边界和发布方案

- 由 `packages/chat` 拥有 Web Component 外壳和 DOM 契约；一个元素实例创建一个 Vue app、一个 kit 会话集合及内存 storage。Vue 的 props/emit 不直接暴露给宿主；外壳把 DOM 输入转换为内部 props/动作，把需要的内部结果转换为 `CustomEvent`。kit 和普通 Vue Chat 入口继续各司其职。
- 已采用独立 `@opentiny/tiny-robot-chat-web-component` ESM 包，源码和构建归 `packages/chat`，包仅分发自包含 JS 与无 Vue 依赖的类型。原同包子入口安装时自动拉入 Vue 等 445 个包；独立包在空宿主中只安装自身，`npm ls vue` 为空。普通 Vue Chat 的 manifest 保持原导出形态。
- 宿主显式调用无参数 `registerTinyRobotChat()`；多次调用幂等，同名标签由其他构造器占用时报错。固定标签名为 `tiny-robot-chat`。
- Web Component 产物自带 Vue 和需要的 UI 依赖，保持 `inlineDynamicImports: false`。Angular 生产构建实测不会复制通过 `new URL('./style.css', import.meta.url)` 引用的样式，导致 `/style.css` 404 且无 `ready`；现已将构建生成的完整 CSS 嵌入入口，由每个实例写入 ShadowRoot。发布包包含入口、全部延迟 JS 和类型；构建目录保留 CSS 文件供门禁量测但不打入 tarball。不能只复制入口 JS。现有 Vue 构建 external 规则不变。
- 首版使用显式注册，不在 `import` 时自动注册，也不在 SSR 中访问 `window`/`customElements`。SSR 渲染或水合本身不承诺；使用浏览器动态导入的宿主可在客户端注册。原生 HTML 和 Angular 的生产包消费已验证，SSR 未验证。
- 原生插槽只投影宿主 DOM：`<span slot="header-notice">` 可以显示文本和原生内容，但没有 Vue scoped slot 的响应式参数。不能把 `Chat.vue` 的全部 Vue 插槽自动宣称为 DOM 插槽。

## DOM 契约

以下是已实现的首版 DOM 契约及尚未覆盖的边界。

| 接口 | 已实现行为 | 当前证据/缺口 |
| --- | --- | --- |
| `responseProvider` property | 必填函数 `(requestBody, abortSignal) => completion 或 AsyncIterable<chunk>`；允许注册前及升级前赋值。更新仅作用于后续请求，进行中的请求使用调用时的函数；不接受字符串 attribute。 | 升级前赋值、初始回调及运行后替换已通过正式包测试。 |
| `title` attribute/property | 字符串，运行中更新标题；property 与 attribute 同步。 | attribute 和 property 更新已通过验证切片。 |
| `color-mode` attribute / `colorMode` property | `light` 或 `dark`，默认 `light`；无效值回退 `light`，运行中更新实例主题。 | 两主题及 property 更新通过。 |
| `send(text): Promise<boolean>` | `ready` 后调用；空输入/被禁用返回 `false`，成功接受返回 `true`，服务失败 reject 并发 `chat-error`。`ready` 前 reject，不能静默丢消息。 | 发送、失败、错误去重及未 ready 拒绝已通过；空输入和禁用返回行为尚需单独验收。 |
| `cancel(): Promise<void>` | `ready` 后取消当前活跃会话的请求；无进行中请求则正常 resolve；`ready` 前 reject。取消不作为服务错误。 | abort signal 与晚到片段隔离通过；无请求/未 ready 待补。 |
| `ready` event | 每次成功挂载后触发一次；注册/元素升级不等于 ready。须等完整 CSS 插入、Vue 和 TrChat 挂载完成，`detail.instance` 是当前元素。`bubbles: true, composed: true`。 | 正式包在原生 HTML 与 Angular 已通过。 |
| `chat-error` event | `detail: { action: 'mount' | 'send' | 'cancel' | 'runtime', message: string }`；`bubbles: true, composed: true`。同一失败最多发一次，不暴露内部 Error 对象。 | 正式包 send 失败去重已通过；其他错误动作待补。 |
| `header-notice` slot | 投影宿主原生 DOM，无 scoped 数据。 | 已通过。 |

断开连接后延迟一个 microtask 再清理，以便同步移动节点时保留状态；真正卸载时取消请求、移除 Vue app/浮层、清空本实例内存。重新挂载是新会话并再次发 `ready`。正式包的 CSS 已内嵌，不再有独立样式请求及其失败重试路径。宿主须为元素设置实际高度，避免 Chat 有挂载但不可见。

## 宿主接入示意

以下是已在独立包中实现的接入形式，完整约束见包内 README。

原生 HTML（安装包后由静态服务提供完整 `dist` 目录）：

```html
<tiny-robot-chat id="chat" title="Support" color-mode="light" style="display:block;height:650px">
  <span slot="header-notice">在线支持</span>
</tiny-robot-chat>
<script type="module">
  import { registerTinyRobotChat } from './node_modules/@opentiny/tiny-robot-chat-web-component/dist/index.js'

  const chat = document.querySelector('#chat')
  chat.responseProvider = (body, signal) => myStreamingService(body, signal)
  chat.addEventListener('ready', () => console.log('Chat ready'))
  chat.addEventListener('chat-error', (event) => console.error(event.detail))
  registerTinyRobotChat()
</script>
```

Angular（组件中仍使用 DOM property，不调用 Vue，也不依赖 kit Angular 适配）：

```ts
import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, Input, ViewChild, AfterViewInit } from '@angular/core'
import { registerTinyRobotChat } from '@opentiny/tiny-robot-chat-web-component'
import type { ResponseProvider, TinyRobotChatElement } from '@opentiny/tiny-robot-chat-web-component'

registerTinyRobotChat()

@Component({
  selector: 'app-chat-host',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: '<tiny-robot-chat #chat title="Support" style="display:block;height:650px"></tiny-robot-chat>',
})
export class ChatHostComponent implements AfterViewInit {
  @Input() responseProvider!: ResponseProvider
  @ViewChild('chat') chat!: ElementRef<TinyRobotChatElement>

  ngAfterViewInit() {
    this.chat.nativeElement.responseProvider = this.responseProvider
  }
}
```

`ResponseProvider` 和 `TinyRobotChatElement` 已作为无需 Vue 类型的声明随包提供。可编译的 Angular 21 双实例示例在 `verification/chat-web-component-angular`；它先注册 `ready` 监听，再赋值 provider，两个实例均在 provider 设置后触发 `ready`。

## 需求—设计—测试—结果

| 需求 | 设计 | 可观察验收 | 当前结果 / 后续 |
| --- | --- | --- | --- |
| 无 Vue 的 HTML 宿主 | 独立 ESM 包自带 Vue 和 ShadowRoot 样式 | 空白 HTML 安装 tarball；宿主无 Vue/全局 Chat CSS | 独立安装、严格类型、Chromium 与实际 Chrome 通过 |
| Angular 宿主 | 同一 DOM 契约，`CUSTOM_ELEMENTS_SCHEMA`，无业务适配层 | 独立 Angular 21 工程安装 tarball、生产构建、流式/Markdown | Chromium 与实际 Chrome 通过 |
| 两实例和会话归属 | 元素各自的 Vue app/kit/storage | 双路手动流、切换会话、晚到结果不串实例/会话 | 正式产物 Chromium 与实际 Chrome 通过 |
| 流式取消和失败 | provider 接收 `AbortSignal`；一次请求固定 provider | 片段手动释放、取消、失败、重新发送、错误事件仅一次 | 正式产物替换 provider、取消、失败去重通过 |
| 注册与 ready | 显式注册、等待资源和真实挂载 | 升级前属性、重复注册、内嵌 CSS、事件 detail/传播 | 正式包在 Chromium 与实际 Chrome 通过；独立 CSS 请求与失败重试已不适用 |
| 样式、主题与浮层 | ShadowRoot CSS，实例主题，浮层在所属 root | 恶意宿主样式、亮暗并存、菜单/建议、键盘焦点和外部表单 | 已测路径通过；完整资源/交互待做 |
| 原生插槽 | 一个无数据的 `header-notice` | 宿主内容显示，且不假设 scoped 参数 | 通过；更多插槽待需求 |
| 生命周期 | 移动保留、卸载释放、重挂载新会话 | signal abort、DOM/监听器释放、状态重置 | 已测核心路径；资源与泄漏检查待做 |
| 发布与体积 | 包含全部 chunk 和 CSS 内嵌入口，类型无 Vue；动态模块拆分 | `npm pack --dry-run` 内容、无 Vue 宿主安装/类型检查、延迟资源、JS/CSS gzip 门禁、启动记录 | 正式 JS 706,680 B gzip，源 CSS 55,718 B gzip；独立安装/资源通过；最近一次本机五次 `ready` 中位数原生 243 ms、Angular 347 ms，线上指标待定 |

## 开发与验收顺序

1. **正式入口和类型**：已在 `packages/chat` 增加独立入口、稳定命名、显式注册和类型；普通 Vue Chat 构建、独立 tarball 原生宿主及严格类型消费检查通过。未验收的接口边界仍在上表列出。
2. **状态及生命周期**：已实现每实例 storage/provider 更新、发送错误去重和卸载清理；可控流与两个 ShadowRoot 的 Chrome 自动化已通过。CSS 内嵌后无独立请求或失败重试路径。其他错误动作和长期资源泄漏仍需检查。
3. **宿主与发布验收**：独立 Angular 工程已安装同一 tarball，完成生产构建及 Chrome 流式/资源检查；本机启动记录已保存。体积暂按全部 JS gzip <= 1,000 kB、源 CSS gzip <= 100 kB 守门；线上性能阈值、其他浏览器和正式发布仍待评审。

共享文件协调：本地提交包含 `packages/components/src/history/components/MenuList.vue` 与 `src/dropdown-menu/index.vue` 的键盘事件目标修复，以及 `src/sender/extensions/mention/plugin.ts` 与 `suggestion/plugin.ts` 的 ShadowRoot 浮层挂载修复。这四处改动是 Web Component 验证基线，也会影响普通 Vue 用法；合入共享分支前须与组件负责者核对。`packages/kit` 和另一个 Angular 适配任务不在本任务改动范围。本次只作本地提交，不推送或发布。
