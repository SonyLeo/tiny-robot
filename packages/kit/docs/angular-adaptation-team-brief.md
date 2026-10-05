# Kit Angular 适配团队说明（评审稿）

> 2026-10-05。用于团队宣讲与消费评审，当前不是完整首版已验收公告。实现与验收进度以 [P7 准备清单](./angular-adaptation-p7-readiness.md) 为准。

## 1. 要解决的消费问题

Angular 业务方用自己的组件实现聊天界面，从 `/core` 消费消息、请求、插件/工具、Skill、会话与存储规则，从 `/angular` 取得 Signals 和生命周期连接。Angular 宿主无需安装 Vue，也不通过 Chat Web Components 绕过框架适配。

现有 Vue 应用继续从根入口使用 `useMessage/useConversation`。目标是共享业务规则、分别连接响应式系统，而非复制两套引擎。

## 2. 职责

| 层 | 负责 | 示例 |
| --- | --- | --- |
| 共享核心 | 消息原地更新、回合、取消、工具/Skill、会话代际、保存/删除顺序 | 保存完成后才能删除同 ID 历史；旧加载结果不能复活会话 |
| Vue 适配 | reactive/Ref/computed、插件响应式上下文、deep watch | 旧应用直接修改 message.state 后仍能自动保存 |
| Angular 适配 | Signals/computed、DI、DestroyRef、自有/共享连接 | 流式通知自动更新 OnPush 消息子组件 |
| 业务应用 | UI、鉴权、Provider、工具执行、存储选择和错误呈现 | 服务持有 manager；组件负责发送表单和审批按钮 |

`responseProvider(body, signal)` 仍是传输边界。业务方可使用 fetch 等实现，必须响应 AbortSignal；本次不增加 HttpClient/Observable wrapper。

## 3. Vue 开发者理解 Angular

| Angular 概念 | Vue 参照 | 必须注意的区别 |
| --- | --- | --- |
| Signal | ref，读取是 `messages()` 而非 `.value` | 普通对象内部原地写入不会自动发布 Signal |
| computed | computed | 依赖 Signal 的重新发布；持有旧嵌套引用并不等于深响应式 |
| OnPush | 减少无关组件重渲染的策略 | 父子输入仍为同一个消息引用时，用 revision 或变化后的工具状态输入驱动更新 |
| zoneless | 根据明确响应式通知安排刷新 | UI 不能依靠随机异步事件、额外点击或循环 detectChanges 才显示流式消息 |
| 依赖注入 | provide/inject | 应用服务可持有共享 manager；注入上下文决定 DestroyRef 对应的生命周期 |
| DestroyRef | onScopeDispose/onUnmounted | 组件连接销毁只解绑；共享 manager 的请求由其拥有者管理 |

核心保持消息对象身份，流式过程在原消息上更新。Angular 发布的是可变消息视图和 revision，并非深不可变历史快照。外部业务修改使用 `updateMessage(message, recipe)`。不能逐 token 深拷贝全历史，也不能换掉引擎仍持有的内部对象。

## 4. 四种动作需要分别理解

| 动作 | 意义 | 历史 |
| --- | --- | --- |
| 共享视图 `dispose()` | 解绑本视图，后台 manager 继续工作 | 保留 |
| 自有消息连接 `dispose()` / 显式 abort | 取消自有当前回合，待审批取消也属于取消 | 保留消息，但暂停恢复快照可能清理 |
| manager `dispose()` | 目标契约：拒绝新操作、处理活动请求、刷出尾保存；已保存 paused 回合可重建 | 保留；当前修复必须经实测后承诺 |
| delete/clear | 显式取消对应引擎并删除指定历史 | 删除目标会话，并清该回合恢复数据 |

浏览器强制退出不保证异步保存一定完成。成功保存后的恢复与保存失败的确定结果都要验收。

IndexedDB 的关闭由存储拥有者负责，需先等待 manager 的最终保存和 Skill 导入/写入。共享组件解绑、manager.dispose 都不自动关闭外部共用存储。close 保留历史并幂等；关闭后旧实例和它提供的 lazy reader 不可继续使用，新拥有者创建新实例读取历史。

本轮 LocalStorage 写入失败从“记录日志后返回”改为“记录日志并抛错”，用于避免保存失败被误认为成功；这是需要业务方处理的兼容变化。加载的空值 fallback 保持。旧文本 formatMessages 仅保留 role/content/name，不能承担工具消息或多模态请求转换。

## 5. 兼容与发布评审点

- 单包入口方向：Vue 根入口、共享 `/core`、Angular `/angular`、Node Skill `/node`。
- Vue/Angular peer optional；OpenAI 公共类型所需的依赖必须随安装可获得。
- npm 0.5.1 已发布 `/core` 的 `createVueMessageAdapter`，本次核对运行时和声明均存在；路径变化需明确记录。仓库没有该路径消费不等于外部无人使用。Angular 不提供同名替身。
- 候选 Angular 范围为 `>=20 <23`，必须有实际 Node/TypeScript/Zone 模式记录；peer 声明本身不算通过证据。
- SSR、Angular UI 组件库和 WC 不在本次首版范围。Skill 在范围内，不静默延期。

## 6. 验收各层各证明一件事

1. 核心可控 Promise/storage/fake timers：加载代际、保存尾调用、删除顺序、失败与取消。
2. Vue 回归：旧签名、插件上下文、直接嵌套修改与深度保存。
3. Angular TestBed：真实 OnPush 子组件、Signals、DI/DestroyRef、多视图生命周期。
4. 浏览器：自动显示每 chunk、后台会话、导航和整页重载审批、本地 HTTP/SSE、原生 File/IDB。
5. 仓库外最终 tarball：不装 Vue、不用源码 alias、skipLibCheck:false、生产构建与版本矩阵。
6. 性能/资源：长历史流式成本与重复卸载后的资源基线；短 heap 数据不等于长期无泄漏。

## 7. 目前待团队评审

P7 审查已经识别并授权修复 D3 的共享会话和生命周期缺口。正式发布前需要查看修复后产物、完整 M01-L01 结果、迁移说明和复现步骤。

最新检查点：kit275通过/1跳过，lint/clean build、Angular20无Vue严格声明/生产构建及32项TestBed通过；最新资源取消浏览器失败、21宿主依赖冲突，22与长资源基线未验收。待办优先处理取消时序和宿主模板，再评审列表调整能力并完成同一最终产物全矩阵；本次本地提交不表示首版放行。

当前没有 Angular 业务评审者，需明确记录。技术审查与独立宿主验证可以降低风险，但不能写成已获 Angular 使用方认可。
