<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <h4>自定义语音输入</h4>
    <tr-sender v-model="inputValue" :speech="speechConfig" @speech-start="onSpeechStart" @speech-end="onSpeechEnd" />

    <div style="margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 4px">
      <p><strong>说明：</strong></p>
      <p>• 点击语音按钮触发自定义语音识别</p>
      <p>• 模拟语音识别结果会自动填入输入框</p>
      <p>• 实际使用时，可以接入任何第三方语音识别服务</p>
      <p><strong>当前输入值：</strong>{{ inputValue }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const inputValue = ref('')

// 模拟语音识别结果
const mockSpeechResults = [
  '你好，这是一个自定义语音识别的演示',
  '今天天气真不错',
  '我想要一杯咖啡',
  '请帮我查询一下明天的天气',
  '谢谢你的帮助',
]

let resultIndex = 0

// 自定义语音识别配置
const speechConfig = {
  customRecognition: {
    onRecordingChange: (transcript: string) => {
      // 这个函数接收语音识别结果，组件会自动处理文本设置
      console.log('收到语音识别结果:', transcript)
    },
    isSupported: () => true,
  },
}

const onSpeechStart = () => {
  console.log('开始语音识别')
  // 模拟语音识别过程
  setTimeout(() => {
    const result = mockSpeechResults[resultIndex % mockSpeechResults.length]
    resultIndex++

    // 直接调用配置中的回调函数
    speechConfig.customRecognition.onRecordingChange(result)
  }, 1500) // 模拟1.5秒的识别时间
}

const onSpeechEnd = (transcript?: string) => {
  console.log('语音识别结束:', transcript)
}
</script>
