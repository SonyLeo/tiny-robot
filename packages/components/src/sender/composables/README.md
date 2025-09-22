# 语音识别功能使用指南

## 概述

`useSpeechHandler` Hook 支持两种语音识别模式：

1. **Web Speech API**（默认）- 适用于 PC 端浏览器
2. **自定义语音识别** - 适用于移动端或需要特定语音识别服务的场景

## 基本使用

### 使用 Web Speech API（默认）

```typescript
import { useSpeechHandler } from './composables/useSpeechHandler'

const speechHandler = useSpeechHandler({
  lang: 'zh-CN',
  continuous: false,
  interimResults: true,
  onStart: () => console.log('开始录音'),
  onEnd: () => console.log('结束录音'),
  onInterim: (transcript) => console.log('中间结果:', transcript),
  onFinal: (transcript) => console.log('最终结果:', transcript),
  onError: (error) => console.error('错误:', error)
})

// 开始录音
speechHandler.start()

// 停止录音
speechHandler.stop()

// 检查状态
console.log('是否支持:', speechHandler.speechState.isSupported)
console.log('是否录音中:', speechHandler.speechState.isRecording)
```

### 使用自定义语音识别

```typescript
import { useSpeechHandler } from './composables/useSpeechHandler'
import { createCustomSpeechRecognition } from './composables/customSpeechExample'

// 创建自定义语音识别实例
const customRecognition = createCustomSpeechRecognition()

const speechHandler = useSpeechHandler({
  lang: 'zh-CN',
  customRecognition, // 传入自定义实现
  onStart: () => console.log('开始录音'),
  onEnd: () => console.log('结束录音'),
  onInterim: (transcript) => console.log('中间结果:', transcript),
  onFinal: (transcript) => console.log('最终结果:', transcript),
  onError: (error) => console.error('错误:', error)
})
```

## 自定义语音识别实现

### 接口定义

```typescript
interface CustomSpeechRecognition {
  start(): Promise<void> | void
  stop(): Promise<void> | void
  abort?(): Promise<void> | void
  isSupported(): boolean
  
  // 可选的回调函数（推荐实现）
  onResult?: (transcript: string, isFinal: boolean) => void
  onError?: (error: Error) => void
}
```

### 实现示例

```typescript
class MyCustomSpeechRecognition implements CustomSpeechRecognition {
  private isRecording = false
  
  // 回调函数
  public onResult?: (transcript: string, isFinal: boolean) => void
  public onError?: (error: Error) => void

  isSupported(): boolean {
    // 检查是否支持自定义语音识别
    return true
  }

  async start(): Promise<void> {
    try {
      this.isRecording = true
      
      // 启动语音识别逻辑
      // 例如：调用第三方语音识别 API
      
      // 模拟识别结果
      setTimeout(() => {
        this.onResult?.('你好世界', false) // 中间结果
      }, 1000)
      
      setTimeout(() => {
        this.onResult?.('你好世界，这是最终结果', true) // 最终结果
      }, 2000)
      
    } catch (error) {
      this.onError?.(error as Error)
    }
  }

  async stop(): Promise<void> {
    this.isRecording = false
    // 停止语音识别逻辑
  }

  async abort(): Promise<void> {
    this.isRecording = false
    // 中止语音识别逻辑
  }
}
```

## 集成第三方语音识别服务

### 百度语音识别示例

```typescript
class BaiduSpeechRecognition implements CustomSpeechRecognition {
  private apiKey: string
  private secretKey: string
  
  constructor(apiKey: string, secretKey: string) {
    this.apiKey = apiKey
    this.secretKey = secretKey
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'MediaRecorder' in window
  }

  async start(): Promise<void> {
    // 1. 获取麦克风权限
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    
    // 2. 录制音频
    const mediaRecorder = new MediaRecorder(stream)
    const audioChunks: Blob[] = []
    
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data)
    }
    
    mediaRecorder.onstop = async () => {
      // 3. 处理音频数据
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
      
      // 4. 调用百度语音识别 API
      const result = await this.callBaiduAPI(audioBlob)
      this.onResult?.(result.transcript, true)
    }
    
    mediaRecorder.start()
  }

  private async callBaiduAPI(audioBlob: Blob): Promise<{ transcript: string }> {
    // 实现百度语音识别 API 调用
    // 返回识别结果
    return { transcript: '识别结果' }
  }

  // ... 其他方法实现
}
```

## 在组件中使用

```vue
<template>
  <div>
    <button @click="toggleRecording" :disabled="!speechState.isSupported">
      {{ speechState.isRecording ? '停止录音' : '开始录音' }}
    </button>
    
    <div v-if="speechState.error" class="error">
      错误: {{ speechState.error.message }}
    </div>
    
    <div v-if="interimText" class="interim">
      识别中: {{ interimText }}
    </div>
    
    <div v-if="finalText" class="final">
      最终结果: {{ finalText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSpeechHandler } from './composables/useSpeechHandler'

const interimText = ref('')
const finalText = ref('')

const { speechState, start, stop } = useSpeechHandler({
  lang: 'zh-CN',
  continuous: false,
  interimResults: true,
  onInterim: (transcript) => {
    interimText.value = transcript
  },
  onFinal: (transcript) => {
    finalText.value = transcript
    interimText.value = ''
  },
  onError: (error) => {
    console.error('语音识别错误:', error)
  }
})

const toggleRecording = () => {
  if (speechState.isRecording) {
    stop()
  } else {
    start()
  }
}
</script>
```

## 注意事项

1. **权限管理**: 自定义语音识别通常需要麦克风权限
2. **错误处理**: 务必实现完善的错误处理机制
3. **资源清理**: 在组件卸载时正确清理资源
4. **兼容性**: 检查目标平台的 API 支持情况
5. **性能优化**: 避免频繁的 API 调用，合理控制录音时长

## 常见问题

### Q: 如何在移动端使用？
A: 移动端浏览器通常不支持 Web Speech API，建议使用自定义语音识别实现。

### Q: 如何处理网络延迟？
A: 在自定义实现中添加超时处理和重试机制。

### Q: 如何提高识别准确率？
A: 选择合适的语音识别服务，配置正确的语言和采样率参数。