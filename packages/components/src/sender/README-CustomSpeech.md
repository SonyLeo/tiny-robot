# 自定义语音功能使用指南

## 概述

语音组件现在支持双模式：
- **内置模式**：使用浏览器的 Web Speech API
- **自定义模式**：使用用户提供的自定义语音处理器

## 快速开始

### 1. 使用内置模式（默认）

```typescript
import { useSpeechHandler } from './composables/useSpeechHandler'

const speechHandler = useSpeechHandler({
  // mode 默认为 'builtin'，可以省略
  continuous: false,
  interimResults: true,
  lang: 'zh-CN',
  onStart: () => console.log('开始录音'),
  onInterim: (text) => console.log('实时结果:', text),
  onFinal: (text) => console.log('最终结果:', text),
  onEnd: () => console.log('录音结束')
})
```

### 2. 使用自定义模式

```typescript
import { useSpeechHandler } from './composables/useSpeechHandler'
import type { CustomSpeechHandler } from './index.type'

// 实现自定义语音处理器
const myCustomHandler: CustomSpeechHandler = {
  start: async (callbacks) => {
    // 开始录音逻辑
    callbacks.onStart()
    
    // 启动你的语音服务
    await myVoiceService.startRecording()
    
    // 监听识别结果
    myVoiceService.onResult = (result) => {
      if (result.isFinal) {
        callbacks.onFinal(result.text)
        callbacks.onEnd(result.text)
      } else {
        callbacks.onInterim(result.text)
      }
    }
    
    myVoiceService.onError = (error) => {
      callbacks.onError(error)
    }
  },
  
  stop: async () => {
    await myVoiceService.stopRecording()
  },
  
  isSupported: () => {
    return myVoiceService.isAvailable()
  }
}

// 使用自定义处理器
const speechHandler = useSpeechHandler({
  mode: 'custom',
  customHandler: myCustomHandler,
  onStart: () => console.log('开始录音'),
  onInterim: (text) => console.log('实时结果:', text),
  onFinal: (text) => console.log('最终结果:', text),
  onEnd: () => console.log('录音结束'),
  onError: (error) => console.error('错误:', error)
})
```

## 接口定义

### SpeechMode

```typescript
type SpeechMode = 'builtin' | 'custom'
```

### CustomSpeechHandler

```typescript
interface CustomSpeechHandler {
  start: (callbacks: SpeechCallbacks) => Promise<void> | void
  stop: () => Promise<void> | void
  isSupported: () => boolean
}
```

### SpeechCallbacks

```typescript
interface SpeechCallbacks {
  onStart: () => void
  onInterim: (transcript: string) => void
  onFinal: (transcript: string) => void
  onEnd: (transcript?: string) => void
  onError: (error: Error) => void
}
```

### SpeechConfig

```typescript
interface SpeechConfig {
  mode?: SpeechMode // 语音模式
  customHandler?: CustomSpeechHandler // 自定义处理器
  lang?: string // 识别语言
  continuous?: boolean // 是否持续识别
  interimResults?: boolean // 是否返回中间结果
  autoReplace?: boolean // 是否自动替换输入内容
}
```

## 实现自定义处理器

### 基本结构

```typescript
class MyCustomSpeechHandler implements CustomSpeechHandler {
  private callbacks?: SpeechCallbacks
  
  async start(callbacks: SpeechCallbacks): Promise<void> {
    this.callbacks = callbacks
    
    try {
      // 1. 触发开始事件
      callbacks.onStart()
      
      // 2. 启动录音/语音服务
      await this.startRecording()
      
      // 3. 设置结果监听
      this.setupResultListeners()
      
    } catch (error) {
      callbacks.onError(error)
    }
  }
  
  async stop(): Promise<void> {
    // 停止录音/语音服务
    await this.stopRecording()
  }
  
  isSupported(): boolean {
    // 检查是否支持
    return this.checkSupport()
  }
  
  private setupResultListeners(): void {
    // 监听实时结果
    this.voiceService.onInterimResult = (text) => {
      this.callbacks?.onInterim(text)
    }
    
    // 监听最终结果
    this.voiceService.onFinalResult = (text) => {
      this.callbacks?.onFinal(text)
      this.callbacks?.onEnd(text)
    }
    
    // 监听错误
    this.voiceService.onError = (error) => {
      this.callbacks?.onError(error)
    }
  }
}
```

### 关键要点

1. **必须调用回调函数**：自定义处理器必须在适当的时机调用传入的回调函数
2. **错误处理**：所有错误都应该通过 `callbacks.onError()` 传递
3. **状态管理**：通过回调函数来同步录音状态
4. **异步支持**：`start` 和 `stop` 方法支持异步操作

## 使用场景

### 1. 云端语音服务

```typescript
class CloudSpeechHandler implements CustomSpeechHandler {
  async start(callbacks: SpeechCallbacks) {
    callbacks.onStart()
    
    // 获取麦克风权限
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    
    // 创建录音器
    const recorder = new MediaRecorder(stream)
    
    // 发送音频数据到云端
    recorder.ondataavailable = async (event) => {
      const result = await this.sendToCloud(event.data)
      if (result.isFinal) {
        callbacks.onFinal(result.text)
      } else {
        callbacks.onInterim(result.text)
      }
    }
    
    recorder.start()
  }
}
```

### 2. 本地语音模型

```typescript
class LocalSpeechHandler implements CustomSpeechHandler {
  async start(callbacks: SpeechCallbacks) {
    callbacks.onStart()
    
    // 加载本地语音模型
    await this.loadModel()
    
    // 启动本地识别
    this.localRecognizer.start()
    
    this.localRecognizer.onResult = (result) => {
      callbacks.onInterim(result.text)
      if (result.confidence > 0.8) {
        callbacks.onFinal(result.text)
      }
    }
  }
}
```

### 3. WebSocket 实时语音

```typescript
class WebSocketSpeechHandler implements CustomSpeechHandler {
  private ws?: WebSocket
  
  async start(callbacks: SpeechCallbacks) {
    callbacks.onStart()
    
    // 建立 WebSocket 连接
    this.ws = new WebSocket('wss://speech-api.example.com')
    
    this.ws.onmessage = (event) => {
      const result = JSON.parse(event.data)
      if (result.type === 'interim') {
        callbacks.onInterim(result.text)
      } else if (result.type === 'final') {
        callbacks.onFinal(result.text)
        callbacks.onEnd(result.text)
      }
    }
    
    // 开始发送音频流
    this.startAudioStream()
  }
}
```

## 最佳实践

1. **错误处理**：始终包装可能失败的操作并调用 `callbacks.onError()`
2. **资源清理**：在 `stop()` 方法中清理所有资源
3. **状态同步**：确保通过回调函数正确同步状态
4. **性能优化**：避免在回调函数中执行耗时操作
5. **用户体验**：提供清晰的错误信息和状态反馈

## 迁移指南

### 从内置模式迁移到自定义模式

```typescript
// 原有代码
const speechHandler = useSpeechHandler({
  continuous: false,
  interimResults: true,
  onStart: () => console.log('开始'),
  onFinal: (text) => console.log('结果:', text)
})

// 迁移后
const speechHandler = useSpeechHandler({
  mode: 'custom', // 添加模式配置
  customHandler: myCustomHandler, // 添加自定义处理器
  // 其他配置保持不变
  continuous: false,
  interimResults: true,
  onStart: () => console.log('开始'),
  onFinal: (text) => console.log('结果:', text)
})
```

所有现有的回调函数和配置都保持兼容，只需要添加 `mode` 和 `customHandler` 配置即可。