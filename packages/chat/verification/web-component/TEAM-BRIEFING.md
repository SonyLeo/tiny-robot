# Chat Web Component 团队讲解提纲

状态：2026-09-27，本地正式包消费验证完成；尚未发布。4178、4179、4180 验证服务已关闭。需要演示时按 `verification/README.md` 重建并启动原生宿主 `http://localhost:4179/` 和 Angular 生产宿主 `http://localhost:4180/`。

## 从 Vue 到 DOM 契约

- Vue 宿主传 `props`、监听 `emits`；原生和 Angular 宿主改用元素 `title` / `color-mode`、`responseProvider` property、`ready` / `chat-error` DOM 事件，以及 `send()` / `cancel()` 方法。
- 每个元素内部仍运行真实 `TrChat`、runtime 和 kit；各自拥有 Vue app 与内存会话。宿主不安装 Vue，也不用配置 Vue 运行环境。
- `registerTinyRobotChat()` 只定义标签。元素有 provider、完成挂载并插入 ShadowRoot 样式后才发 `ready`。可以在注册前给已有节点赋值；重复注册安全。
- 原生 `<span slot="header-notice">` 只投影宿主 DOM。它没有 Vue scoped slot 参数。

## 五分钟演示

1. 在原生页面检查两个不同主题的 Chat 和外部普通表单；手动释放 A/B 响应，观察内容不串实例。
2. 在 A 发起请求后切换会话，再释放旧结果；切回原会话才看到它。演示取消、失败事件和替换 provider 后重发。
3. 展示节点同步移动保留历史、真正卸载中止请求、重挂载建立新会话。刷新页面后历史清空。
4. 打开 Angular 生产页面，重复双实例流式发送和 Markdown 渲染；浏览器网络面板无 `/style.css` 404。

## 评审结论与下一步

独立包避免空宿主安装普通 Vue Chat 的 445 个依赖包；Web Component 仍在自身 JS 中携带 Vue。正式包完整 JS 为 706,680 B gzip，包含内嵌 CSS 和三个按需 JS chunk；源 CSS 单独为 55,718 B gzip，仅用于门禁，不随 tarball 分发。此值是产物文件计算值，不能当作首屏下载量。最近一次本机实际 Chrome 双实例 `ready` 五次中位数为原生 243 ms、Angular 347 ms；上次为 184/180 ms，尚不能作为线上性能承诺。

Angular 示例生产构建成功，但初始 chunk 为 2.15 MB 原始大小，超出示例默认 2.00 MB 预算约 146 kB；需按真实宿主的首屏场景决定是否延迟加载 Chat，不能只调整预算数字。发布前仍需确定 Angular/Chrome 最低版本与性能阈值，并评审完整 MCP/附件、浮动布局、移动端、其他浏览器和长期资源泄漏。外部状态接管、刷新持久化、SSR 与任意框架组件插槽不在首版承诺中。证据和具体用例见 [RESULTS.md](./RESULTS.md)；接入代码见 `packages/chat-web-component/README.md`。
