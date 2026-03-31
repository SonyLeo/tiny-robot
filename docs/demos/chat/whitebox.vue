<template>
  <div class="chat-demo-container">
    <!-- TrChat.Root 作为统一上下文注入器 -->
    <TrChat.Root :chat-kit="chat">
      <div class="tr-chat" style="height: 100%">
        <!-- 自定义顶部栏 -->
        <TrChat.Header show-history title="手动组合页面" />

        <!-- 互斥显示：没有消息时展示 Welcome，有消息时显示消息列表 -->
        <TrChat.Welcome
          v-if="messages.length === 0"
          title="手动组合页面结构"
          description="使用子组件和插槽自行组织页面内容"
          :prompts="prompts"
          @prompt-click="(desc: string) => chat.sendMessage(desc)"
        />

        <TrChat.MessageList v-else auto-scroll />

        <!-- 底部输入框 -->
        <TrChat.Footer>
          <template #extra>
            <div style="font-size: 12px; color: #999; margin-bottom: 8px">
              💡 这是通过 Footer 的 extra 插槽注入的自定义提示
            </div>
          </template>
          <TrChat.Sender placeholder="手动组合输入..." />
        </TrChat.Footer>

        <!-- 抽屉历史栏 -->
        <TrChat.History />
      </div>
    </TrChat.Root>
  </div>
</template>

<script setup lang="ts">
import { useChatKit, TrChat } from '@opentiny/tiny-robot-chat'
import type { PromptProps } from '@opentiny/tiny-robot'
import { createMockResponseProvider } from './shared'

const prompts: PromptProps[] = [{ label: '自定义 UI', description: '我们可以调整哪些组件布局？' }]

// 核心 Composable —— 驱动整个对话生命周期
const chat = useChatKit({ responseProvider: createMockResponseProvider('手动组合页面示例') })
const { messages } = chat
</script>

<style scoped>
.chat-demo-container {
  height: 600px;
  width: 100%;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}
</style>
