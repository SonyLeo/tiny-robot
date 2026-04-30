
# Chat · TrChat 全量用法

适合：用一个 `<TrChat>` 组件开启全部功能（MCP、附件、ModelSelector、Feedback、语音输入），不需要自定义页面结构。

> 💡 示例嵌入在文档页面中，空间有限。点击右上角的 **⤢** 按钮可全屏预览完整效果。
> `FullscreenToggle` 是文档示例专用的辅助组件，不是 Chat 套件的内置功能，业务项目中无需引入。

> ⚠️ 示例默认使用代理端点 `/api/chat/completions`。如需直连 DeepSeek，参考 `config.ts` 中的注释替换为 `baseURL` + `apiPath` 写法，并在项目中创建 `.env.local` 配置 `VITE_DEEPSEEK_API_KEY`。

<demo vue="../../demos/chat/trchat.vue" :vueFiles="['../../demos/chat/trchat.vue', '../../demos/chat/config.ts', '../../demos/chat/mockMcp.ts', '../../demos/chat/FullscreenToggle.vue']" />
