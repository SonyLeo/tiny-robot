import type { CustomSpeechHandler, SpeechCallbacks } from '@opentiny/tiny-robot'

/**
 * 百度语音识别处理器
 * 集成百度AI开放平台的语音识别API
 */
export class BaiduSpeechHandler implements CustomSpeechHandler {
  private mediaRecorder?: MediaRecorder
  private audioChunks: Blob[] = []
  private callbacks?: SpeechCallbacks
  private apiKey: string
  private secretKey: string
  private accessToken?: string

  constructor(apiKey: string, secretKey: string) {
    this.apiKey = apiKey
    this.secretKey = secretKey
  }

  async start(callbacks: SpeechCallbacks): Promise<void> {
    this.callbacks = callbacks

    try {
      // 获取访问令牌
      if (!this.accessToken) {
        await this.getAccessToken()
      }

      // 获取麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
        },
      })

      // 创建录音器
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })
      this.audioChunks = []

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = () => {
        this.processWithBaiduAPI()
      }

      // 开始录音
      this.mediaRecorder.start()
      callbacks.onStart()
    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error('百度语音服务启动失败'))
    }
  }

  async stop(): Promise<void> {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop()
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop())
    }
  }

  isSupported(): boolean {
    return (
      typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && !!this.apiKey && !!this.secretKey
    )
  }

  private async getAccessToken(): Promise<void> {
    const response = await fetch('https://aip.baidubce.com/oauth/2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${this.apiKey}&client_secret=${this.secretKey}`,
    })

    const data = await response.json()
    if (data.access_token) {
      this.accessToken = data.access_token
    } else {
      throw new Error(data.error_description || '获取访问令牌失败')
    }
  }

  private async processWithBaiduAPI(): Promise<void> {
    if (!this.callbacks || !this.accessToken) return

    try {
      // 转换音频格式
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' })
      const base64Audio = await this.blobToBase64(audioBlob)

      // 调用百度语音识别API
      const response = await fetch(`https://vop.baidu.com/server_api?access_token=${this.accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'wav',
          rate: 16000,
          channel: 1,
          cuid: 'web_client',
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
        throw new Error(result.err_msg || '识别失败')
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
