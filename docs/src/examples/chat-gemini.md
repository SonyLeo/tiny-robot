---
title: Gemini 聊天示例
kind: example
description: 展示基于 TinyRobot Chat 构建的 Gemini 风格聊天界面。
status: stable
keywords: [Gemini, 聊天界面, Chat]
---

<demo
  vue="../../demos/chat/gemini/Demo.vue"
  :vueFiles="[
    '../../demos/chat/gemini/Demo.vue',
    '../../demos/chat/ChatDemoShell.vue',
    '../../demos/chat/gemini/GeminiCase.vue',
    '../../demos/chat/gemini/GeminiComposer.vue',
    '../../demos/chat/gemini/GeminiHeader.vue',
    '../../demos/chat/gemini/GeminiRail.vue',
    '../../demos/chat/gemini/icons/gemini-mask.svg',
    '../../demos/chat/gemini/config.ts',
    '../../demos/chat/shared/createChatRuntime.ts',
    '../../demos/chat/shared/mockConversationStorage.ts',
    '../../demos/chat/shared/modelProviders.ts',
    '../../demos/chat/shared/base.css'
  ]"
  playground="false"
/>
