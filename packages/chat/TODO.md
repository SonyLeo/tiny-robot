完全可行，而且比我之前的方案更务实。

思路很清晰：

- `packages/chat/demo` 是验证场，三条路径在这里跑通所有功能（MCP、附件、ModelSelector、workspace、history），确保 API 没问题
- `docs/demos/chat/` 直接把验证通过的写法搬过去，不做精简，用户看到的就是真实可用的全量代码，不会出现"示例太简单，实际接入发现缺东西"的问题
- 额外一个 `basic.vue` 展示最小接入（只有 `<TrChat :config="config" />`，不带 MCP、workspace 等），降低入门门槛

最终 `docs/demos/chat/` 的结构大概是：

```
docs/demos/chat/
  basic.vue                ← 最小案例：一个 config + <TrChat />
  blackbox.vue             ← 路径 1 全量：TrChat + MCP + 附件 + ModelSelector
  root-page.vue            ← 路径 2 全量：Root + Page + MCP + 附件 + workspace
  root-primitives.vue      ← 路径 3 全量：Root + 原语 + MCP + 附件 + workspace
  config.ts                ← 共用的 config 工厂（从 demo/data/officialConfig.ts 简化而来）
```

这样做的好处是 `chat/demo` 验证过的代码直接就是文档示例的来源，不存在两边不一致的问题。`basic.vue` 作为入口引导，全量示例作为进阶参考，用户的学习路径也很自然。

等你把 `chat/demo` 这边确认没问题了，我们再动 `docs/demos/chat/`。