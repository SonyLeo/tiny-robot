<script setup lang="ts">
import { inject, computed } from 'vue'
import { TrFeedback } from '@opentiny/tiny-robot'
import type { BubbleMessage } from '@opentiny/tiny-robot'
import { CHAT_KIT_KEY } from '../context'

const props = defineProps<{
  messages: BubbleMessage[]
  messageIndexes: number[]
  role?: string
}>()

const chatKit = inject(CHAT_KIT_KEY)!

// 取该组最后一条 assistant 消息的文本内容（用于复制）
const lastContent = computed(() => {
  const last = [...props.messages].reverse().find((m) => m.role === 'assistant' || !m.role)
  if (!last?.content) return ''
  return typeof last.content === 'string' ? last.content : JSON.stringify(last.content)
})

// 取触发本轮回答的最后一条 user 消息内容（用于重新生成）
const lastUserContent = computed(() => {
  const allMessages = chatKit.messages.value
  // 找到本组第一条消息之前最近的 user 消息
  const firstIndex = props.messageIndexes[0] ?? 0
  for (let i = firstIndex - 1; i >= 0; i--) {
    if (allMessages[i]?.role === 'user') {
      const content = allMessages[i].content
      return typeof content === 'string' ? content : ''
    }
  }
  return ''
})

const isStreaming = computed(() => chatKit.status.value === 'streaming' || chatKit.status.value === 'submitted')

function handleAction(name: string) {
  if (name === 'copy') {
    navigator.clipboard.writeText(lastContent.value).catch(() => {
      // 降级：创建临时 textarea 复制
      const el = document.createElement('textarea')
      el.value = lastContent.value
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    })
  } else if (name === 'refresh') {
    if (isStreaming.value || !lastUserContent.value) return
    chatKit.sendMessage(lastUserContent.value)
  }
}
</script>

<template>
  <TrFeedback
    :actions="[
      { name: 'copy', label: '复制', icon: 'copy' },
      { name: 'refresh', label: '重新生成', icon: 'refresh' },
      { name: 'like', label: '赞', icon: 'like' },
      { name: 'dislike', label: '踩', icon: 'dislike' },
    ]"
    @action="handleAction"
  />
</template>
