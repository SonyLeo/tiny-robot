
# Chat Runtime + Slots 示例

使用 `createRuntimeFromConfig` 自己持有 runtime，通过 `TrChat.Page` 的 `#header-extra` 和 `#footer-extra` slots 做轻量扩展。页面外部的按钮可以直接调用 `runtime.conversation.send()` 发送消息。

<demo vue="../../demos/chat/runtime-and-slots.vue" :vueFiles="['../../demos/chat/runtime-and-slots.vue', '../../demos/chat/runtime-and-slots-config.ts', '../../demos/chat/FullscreenToggle.vue']" />
