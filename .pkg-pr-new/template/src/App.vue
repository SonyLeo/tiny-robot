<script setup lang="ts">
import { ref } from 'vue'
import { TinyBubble, TinySender } from '@opentiny/tiny-robot'

const messages = ref([{ id: '1', role: 'assistant', content: '你好！这是 TinyRobot 预览环境' }])

const handleSend = (content: string) => {
  messages.value.push({
    id: Date.now().toString(),
    role: 'user',
    content,
  })
}
</script>

<template>
  <div class="app">
    <h1>TinyRobot Preview</h1>
    <p class="tip">💡 修改 App.vue 测试组件效果</p>

    <div class="chat">
      <TinyBubble v-for="msg in messages" :key="msg.id" :role="msg.role" :content="msg.content" />
      <TinySender @send="handleSend" placeholder="输入消息..." />
    </div>
  </div>
</template>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 8px;
}

.tip {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
}

.chat {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  min-height: 400px;
}
</style>
