# 综合示例

## Chat 综合示例

通过完整的 TinyRobot 页面示例查看 Chat 的组合方式和源码：

<demo
  vue="../../demos/chat/tiny-robot/Demo.vue"
  :vueFiles="[
    '../../demos/chat/tiny-robot/Demo.vue',
    '../../demos/chat/ChatDemoShell.vue',
    '../../demos/chat/tiny-robot/TinyRobotChat.vue',
    '../../demos/chat/tiny-robot/ComposerTools.vue',
    '../../demos/chat/tiny-robot/WindowHeader.vue',
    '../../demos/chat/tiny-robot/useWindow.ts',
    '../../demos/chat/tiny-robot/chat-runtime.ts',
    '../../demos/chat/tiny-robot/chat-ui.ts',
    '../../demos/chat/shared/base.css'
  ]"
  playground="false"
 />

## 直接嵌入页面

在页面主体布局中集成 `TrBubbleList`、`TrSender`、`TrHistory`，配合 `useConversation` 与消息引擎，完成多会话与消息收发。

<demo vue="../../demos/examples/AssistantPageExample.vue" :vueFiles="['../../demos/examples/AssistantPageExample.vue', '../../demos/examples/responseProvider.ts', '../../demos/examples/assistantConstants.ts', '../../demos/examples/mockMcp.ts']" />

## 使用悬浮容器

使用 `TrContainer` 的悬浮窗形态，可控制显示与全屏，适合在站点内以浮层嵌入聊天。

<demo vue="../../demos/examples/AssistantContainerExample.vue" :vueFiles="['../../demos/examples/AssistantContainerExample.vue', '../../demos/examples/responseProvider.ts', '../../demos/examples/assistantConstants.ts', '../../demos/examples/mockMcp.ts']" />
