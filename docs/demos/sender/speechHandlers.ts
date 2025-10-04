import Recorder from 'recorder-core'
import 'recorder-core/src/engine/pcm'
import type { CustomSpeechHandler, SpeechCallbacks } from '@opentiny/tiny-robot'

/**
 * recorder-core 的配置选项
 */
interface RecorderOptions {
  type: 'wav' | 'mp3' | 'pcm' | string // 期望的输出格式
  sampleRate: 16000 | 8000 | number // 采样率
  bitRate: 16 | 8 | number // 比特率
  onProcess?: (buffers: Float32Array[], powerLevel: number, duration: number, sampleRate: number) => void
}

/**
 * recorder-core 实例的接口
 */
interface IRecorder {
  open(success: () => void, fail: (msg: string, isUserNotAllow: boolean) => void): void
  start(): void
  stop(success: (blob: Blob, duration: number) => void, fail: (msg: string) => void): void
  close(): void
  support(): boolean
}

interface RecorderStatic {
  (options: RecorderOptions): IRecorder
}

const TypedRecorder = Recorder as RecorderStatic

/**
 * 百度语音识别处理器
 * 集成百度AI开放平台的语音识别API
 */
export class BaiduSpeechHandler implements CustomSpeechHandler {
  private recorder?: IRecorder
  private callbacks?: SpeechCallbacks
  private apiKey: string
  private secretKey: string
  private accessToken?: string
  private apiKeyGetter?: () => string
  private secretKeyGetter?: () => string

  constructor(apiKey: string, secretKey: string) {
    this.apiKey = apiKey
    this.secretKey = secretKey
  }

  static createWithGetters(apiKeyGetter: () => string, secretKeyGetter: () => string): BaiduSpeechHandler {
    const instance = new BaiduSpeechHandler('', '')
    instance.apiKeyGetter = apiKeyGetter
    instance.secretKeyGetter = secretKeyGetter
    return instance
  }

  private getCurrentApiKey(): string {
    return this.apiKeyGetter ? this.apiKeyGetter() : this.apiKey
  }

  private getCurrentSecretKey(): string {
    return this.secretKeyGetter ? this.secretKeyGetter() : this.secretKey
  }

  async start(callbacks: SpeechCallbacks): Promise<void> {
    this.callbacks = callbacks

    try {
      if (!this.accessToken) {
        await this.getAccessToken()
      }

      // 创建实例
      this.recorder = TypedRecorder({
        type: 'pcm', // 直接指定输出格式为 pcm
        sampleRate: 16000, // 百度推荐的采样率
        bitRate: 16, // 16 bit
      })

      // 打开麦克风并开始录音
      this.recorder.open(
        () => {
          this.recorder?.start()
          callbacks.onStart()
        },
        (msg: string, isUserNotAllow: boolean) => {
          const errorMsg = isUserNotAllow ? `用户拒绝了麦克风权限: ${msg}` : `无法打开麦克风: ${msg}`
          callbacks.onError(new Error(errorMsg))
        },
      )
    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error('百度语音服务启动失败'))
    }
  }

  async stop(): Promise<void> {
    if (!this.recorder) {
      return
    }

    // 停止录音，在回调中处理编码好的 Blob
    this.recorder.stop(
      (blob: Blob, duration: number) => {
        console.log(`录音成功，格式: ${blob.type}，时长: ${duration}ms`, blob)

        // 将格式正确的 Blob 传递给处理函数
        this.processWithBaiduAPI(blob)

        this.closeRecorder()
      },
      (msg: string) => {
        this.callbacks?.onError(new Error(`录音失败: ${msg}`))
        this.closeRecorder()
      },
    )
  }

  isSupported(): boolean {
    return true
  }

  /**
   * 安全地关闭和清理 recorder 实例
   */
  private closeRecorder(): void {
    if (this.recorder) {
      this.recorder.close()
      this.recorder = undefined
    }
  }

  private async getAccessToken(): Promise<void> {
    const currentApiKey = this.getCurrentApiKey()
    const currentSecretKey = this.getCurrentSecretKey()
    const url = '/api/baidu/oauth/2.0/token'
    const formData = new URLSearchParams()
    formData.append('grant_type', 'client_credentials')
    formData.append('client_id', currentApiKey)
    formData.append('client_secret', currentSecretKey)

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    })

    const data = await response.json()
    if (data.access_token) {
      this.accessToken = data.access_token
    } else {
      throw new Error(data.error_description || '获取访问令牌失败')
    }
  }

  // 处理 Blob
  private async processWithBaiduAPI(audioBlob: Blob): Promise<void> {
    if (!this.callbacks || !this.accessToken) return

    try {
      const base64Audio = await this.blobToBase64(audioBlob)

      const response = await fetch(`/api/server/server_api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          format: 'pcm',
          rate: 16000,
          channel: 1,
          cuid: 'V9yRZ6nNWlJPbqrxKBk1Xng2CmvzeupQ',
          token: this.accessToken,
          speech: base64Audio,
          len: audioBlob.size,
        }),
      })

      const result = await response.json()

      if (result.err_no === 0 && result.result?.length > 0) {
        const transcript = result.result[0]
        this.callbacks.onFinal(transcript)
        this.callbacks.onEnd(transcript)
      } else {
        throw new Error(result.err_msg || `识别失败，错误码: ${result.err_no}`)
      }
    } catch (error) {
      this.callbacks.onError(error instanceof Error ? error : new Error('百度语音识别失败'))
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }
}

/**
 * WebSocket 实时语音识别处理器
 * 适用于需要实时流式识别的场景
 */
export class WebSocketSpeechHandler implements CustomSpeechHandler {
  private ws?: WebSocket
  private mediaRecorder?: MediaRecorder
  private callbacks?: SpeechCallbacks
  private wsUrl: string

  constructor(wsUrl: string) {
    this.wsUrl = wsUrl
  }

  async start(callbacks: SpeechCallbacks): Promise<void> {
    this.callbacks = callbacks

    try {
      // 建立WebSocket连接
      this.ws = new WebSocket(this.wsUrl)

      this.ws.onopen = async () => {
        callbacks.onStart()
        await this.startAudioStream()
      }

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data)

        switch (data.type) {
          case 'interim':
            callbacks.onInterim(data.text)
            break
          case 'final':
            callbacks.onFinal(data.text)
            break
          case 'end':
            callbacks.onEnd(data.text)
            break
          case 'error':
            callbacks.onError(new Error(data.message))
            break
        }
      }

      this.ws.onerror = () => {
        callbacks.onError(new Error('WebSocket连接失败'))
      }
    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error('WebSocket语音服务启动失败'))
    }
  }

  async stop(): Promise<void> {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop()
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop())
    }

    if (this.ws) {
      this.ws.send(JSON.stringify({ type: 'stop' }))
      this.ws.close()
    }
  }

  isSupported(): boolean {
    return (
      typeof WebSocket !== 'undefined' && typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
    )
  }

  private async startAudioStream(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        channelCount: 1,
      },
    })

    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus',
    })

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && this.ws?.readyState === WebSocket.OPEN) {
        // 发送音频数据到服务器
        this.ws.send(event.data)
      }
    }

    // 每100ms发送一次数据
    this.mediaRecorder.start(100)
  }
}

/**
 * 简单的模拟语音处理器
 * 用于测试和演示
 */
export class MockSpeechHandler implements CustomSpeechHandler {
  private timer?: ReturnType<typeof setInterval>
  private callbacks?: SpeechCallbacks

  start(callbacks: SpeechCallbacks): void {
    this.callbacks = callbacks

    // 立即触发开始
    callbacks.onStart()

    // 模拟识别过程
    let step = 0
    const steps = ['正在', '正在识别', '正在识别语音', '正在识别语音内容']

    this.timer = setInterval(() => {
      if (step < steps.length) {
        callbacks.onInterim(steps[step])
        step++
      } else {
        // 完成识别
        const finalResult = '这是一个模拟的语音识别结果'
        callbacks.onFinal(finalResult)
        callbacks.onEnd(finalResult)
        this.cleanup()
      }
    }, 500)
  }

  stop(): void {
    if (this.callbacks) {
      this.callbacks.onEnd()
    }
    this.cleanup()
  }

  isSupported(): boolean {
    return true // 模拟处理器总是支持
  }

  private cleanup(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = undefined
    }
  }
}

/**
 * 语音配置工厂函数
 */
export class SpeechConfigFactory {
  /**
   * 百度语音识别配置
   */
  static createBaiduConfig(apiKey: string, secretKey: string) {
    return {
      mode: 'custom' as const,
      customHandler: new BaiduSpeechHandler(apiKey, secretKey),
      continuous: false,
      interimResults: true,
      lang: 'zh-CN',
    }
  }

  /**
   * WebSocket 实时语音识别配置
   */
  static createWebSocketConfig(wsUrl: string) {
    return {
      mode: 'custom' as const,
      customHandler: new WebSocketSpeechHandler(wsUrl),
      continuous: true,
      interimResults: true,
    }
  }

  /**
   * 模拟语音识别配置
   */
  static createMockConfig() {
    return {
      mode: 'custom' as const,
      customHandler: new MockSpeechHandler(),
      continuous: false,
      interimResults: true,
    }
  }
}
