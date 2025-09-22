import type { SpeechHookOptions, SpeechState } from '../index.type'

/**
 * 语音识别策略接口
 */
export interface SpeechRecognitionStrategy {
  isSupported(): boolean
  start(): void
  stop(): void
  cleanup?(): void
}

/**
 * Web Speech API 策略
 */
export class WebSpeechStrategy implements SpeechRecognitionStrategy {
  private recognition?: SpeechRecognition
  private speechState: SpeechState
  private options: SpeechHookOptions

  constructor(speechState: SpeechState, options: SpeechHookOptions) {
    this.speechState = speechState
    this.options = options
    this.initRecognition()
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  }

  private initRecognition(): void {
    if (!this.isSupported()) return

    this.recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)()

    // 配置语音识别
    this.recognition.continuous = this.options.continuous ?? false
    this.recognition.interimResults = this.options.interimResults ?? true
    this.recognition.lang = this.options.lang ?? navigator.language

    // 事件处理
    this.recognition.onstart = () => {
      this.speechState.isRecording = true
      this.speechState.error = undefined
      this.options.onStart?.()
    }

    this.recognition.onend = () => {
      this.speechState.isRecording = false
      this.options.onEnd?.()
    }

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('')

      if (event.results[0].isFinal) {
        this.options.onFinal?.(transcript)
      } else {
        this.options.onInterim?.(transcript)
      }
    }

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.speechState.error = new Error(event.error)
      this.speechState.isRecording = false
      this.options.onError?.(this.speechState.error)
    }
  }

  start(): void {
    if (!this.recognition) {
      const error = new Error('浏览器不支持语音识别')
      this.speechState.error = error
      this.options.onError?.(error)
      return
    }

    // 如果正在录音，先停止再重新开始
    if (this.speechState.isRecording) {
      try {
        this.recognition.stop()
        setTimeout(() => {
          try {
            this.recognition?.start()
          } catch (err) {
            this.handleError(err)
          }
        }, 100)
      } catch (err) {
        this.handleError(err)
      }
      return
    }

    try {
      this.recognition.start()
    } catch (error) {
      this.handleError(error)
    }
  }

  stop(): void {
    if (this.recognition && this.speechState.isRecording) {
      try {
        this.recognition.stop()
      } catch (error) {
        this.handleError(error)
      }
    }
  }

  private handleError(error: unknown): void {
    this.speechState.error = error instanceof Error ? error : new Error('语音识别操作失败')
    this.speechState.isRecording = false
    this.options.onError?.(this.speechState.error)
  }
}

/**
 * 自定义语音识别策略
 */
export class CustomSpeechStrategy implements SpeechRecognitionStrategy {
  private speechState: SpeechState
  private options: SpeechHookOptions
  private customRecognition: NonNullable<SpeechHookOptions['customRecognition']>

  constructor(speechState: SpeechState, options: SpeechHookOptions) {
    this.speechState = speechState
    this.options = options
    this.customRecognition = options.customRecognition!
    this.setupCustomRecognitionCallbacks()
  }

  isSupported(): boolean {
    return this.customRecognition.isSupported()
  }

  private setupCustomRecognitionCallbacks(): void {
    // 如果自定义识别实现支持回调，设置回调函数
    if ('onResult' in this.customRecognition && typeof this.customRecognition.onResult === 'function') {
      this.customRecognition.onResult = (transcript: string, isFinal: boolean) => {
        if (isFinal) {
          this.options.onFinal?.(transcript)
        } else {
          this.options.onInterim?.(transcript)
        }
      }
    }

    if ('onError' in this.customRecognition && typeof this.customRecognition.onError === 'function') {
      this.customRecognition.onError = (error: Error) => {
        this.handleError(error)
      }
    }
  }

  async start(): Promise<void> {
    try {
      // 如果正在录音，先停止
      if (this.speechState.isRecording) {
        await this.stop()
        // 短暂延迟后重新开始
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      this.speechState.isRecording = true
      this.speechState.error = undefined
      this.options.onStart?.()

      await this.customRecognition.start()
    } catch (error) {
      this.handleError(error)
    }
  }

  async stop(): Promise<void> {
    if (!this.speechState.isRecording) return

    try {
      await this.customRecognition.stop()
      this.speechState.isRecording = false
      this.options.onEnd?.()
    } catch (error) {
      this.handleError(error)
    }
  }

  cleanup(): void {
    if (this.customRecognition.abort) {
      try {
        this.customRecognition.abort()
      } catch (error) {
        console.warn('清理自定义语音识别时出错:', error)
      }
    }
  }

  private handleError(error: unknown): void {
    this.speechState.error = error instanceof Error ? error : new Error('自定义语音识别操作失败')
    this.speechState.isRecording = false
    this.options.onError?.(this.speechState.error)
  }
}
