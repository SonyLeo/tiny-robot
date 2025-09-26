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
  }

  isSupported(): boolean {
    return this.customRecognition.isSupported?.() ?? true
  }

  start(): void {
    this.speechState.isRecording = true
    this.speechState.error = undefined
    this.options.onStart?.()
  }

  stop(): void {
    this.speechState.isRecording = false
    this.options.onEnd?.()
  }
}
