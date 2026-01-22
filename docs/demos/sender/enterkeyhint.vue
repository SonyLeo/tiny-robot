<script setup lang="ts">
import { ref } from 'vue'
import { TrSender, type EnterKeyHint } from '@opentiny/tiny-robot'

const message = ref('')
const currentHint = ref<EnterKeyHint>('send')
const hints: EnterKeyHint[] = ['send', 'search', 'done', 'go', 'next', 'previous', 'enter']
</script>

<template>
  <div class="demo">
    <p>
      当前值: <code>{{ currentHint }}</code>
    </p>

    <tr-sender v-model="message" :enterkeyhint="currentHint" placeholder="在移动设备上测试虚拟键盘回车键变化" />

    <div class="controls">
      <button v-for="hint in hints" :key="hint" :class="{ active: currentHint === hint }" @click="currentHint = hint">
        {{ hint }}
      </button>
    </div>

    <div class="tip">
      💡 验证方法：在移动设备上点击输入框，切换按钮观察虚拟键盘回车键变化；或打开开发者工具查看 input 元素的
      enterkeyhint 属性
    </div>
  </div>
</template>

<style scoped>
.demo {
  padding: 20px;
  max-width: 600px;
}

p {
  margin-bottom: 15px;
}

code {
  color: #1476ff;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 15px;
}

button {
  padding: 6px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  border-color: #1476ff;
}

button.active {
  background: #1476ff;
  color: #fff;
  border-color: #1476ff;
}

.tip {
  margin-top: 20px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.6;
}
</style>
