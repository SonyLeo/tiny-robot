
# Chat · 自定义布局

适合：需要替换 workspace 的左右侧边栏内容（如自定义导航、摘要面板），但聊天区本身不需要定制。workspace 模式下 `TrChat.Page` 内部自带 `WorkspaceLayout`，直接通过 `#left`、`#right`、`#left-rail` slots 替换即可。

> 💡 示例嵌入在文档页面中，空间有限。点击右上角的 **⤢** 按钮可全屏预览完整效果。
> `FullscreenToggle` 是文档示例专用的辅助组件，不是 Chat 套件的内置功能，业务项目中无需引入。

> ⚠️ 示例默认使用代理端点 `/api/chat/completions`。如需直连 DeepSeek，参考 `config.ts` 中的注释替换为 `baseURL` + `apiPath` 写法，并在项目中创建 `.env.local` 配置 `VITE_DEEPSEEK_API_KEY`。

<demo vue="../../demos/chat/custom-layout.vue" :vueFiles="['../../demos/chat/custom-layout.vue', '../../demos/chat/config.ts', '../../demos/chat/mockMcp.ts', '../../demos/chat/FullscreenToggle.vue']" />
