import type { SpeechHookOptions, SpeechCallbacks, CustomSpeechHandler } from '../index.type'

/**
 * 语音识别策略接口
 */
export interface SpeechStrategy {
  /**
   * 检查是否支持该策略
   */
  isSupported(): boolean

  /**
   * 初始化策略
   */
  initialize(options: SpeechHookOptions): void

  /**
   * 开始语音识别
   */
  start(callbacks: SpeechCallbacks): void

  /**
   * 停止语音识别
   */
  stop(): void

  /**
   * 清理资源
   */
  cleanup(): void
}

/**
 * 内置 Web Speech API 策略
 */
export class BuiltinSpeechStrategy implements SpeechStrategy {
  private recognition?: SpeechRecognition
  private currentCallbacks?: SpeechCallbacks

  isSupported(): boolean {
    return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  }

  initialize(options: SpeechHookOptions): void {
    if (!this.isSupported()) {
      return
    }

    // 创建语音识别实例
    this.recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)()

    // 配置识别参数
    this.recognition.continuous = options.continuous ?? false
    this.recognition.interimResults = options.interimResults ?? true
    this.recognition.lang = options.lang ?? navigator.language

    // 绑定事件处理器
    this.setupEventHandlers()
  }

  private setupEventHandlers(): void {
    if (!this.recognition) return

    this.recognition.onstart = () => {
      this.currentCallbacks?.onStart()
    }

    this.recognition.onend = () => {
      this.currentCallbacks?.onEnd()
    }

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (!this.currentCallbacks) return

      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('')

      const current = event.results[event.resultIndex]

      if (current?.isFinal) {
        this.currentCallbacks.onFinal(transcript)
      } else {
        this.currentCallbacks.onInterim(transcript)
      }
    }

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.currentCallbacks?.onError(new Error(event.error))
    }
  }

  start(callbacks: SpeechCallbacks): void {
    if (!this.recognition) {
      callbacks.onError(new Error('浏览器不支持语音识别'))
      return
    }

    this.currentCallbacks = callbacks

    try {
      this.recognition.start()
    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error('语音识别启动失败'))
    }
  }

  stop(): void {
    if (!this.recognition) return

    try {
      this.recognition.stop()
    } catch (error) {
      console.warn('停止语音识别时发生错误:', error)
    }
  }

  cleanup(): void {
    if (this.recognition) {
      // 清理事件监听器
      this.recognition.onstart = null
      this.recognition.onend = null
      this.recognition.onresult = null
      this.recognition.onerror = null

      // 停止识别
      this.stop()
    }

    this.currentCallbacks = undefined
  }
}

/**
 * 自定义语音处理策略
 */
export class CustomSpeechStrategy implements SpeechStrategy {
  private customHandler?: CustomSpeechHandler

  isSupported(): boolean {
    return this.customHandler?.isSupported() ?? false
  }

  initialize(options: SpeechHookOptions): void {
    this.customHandler = options.customHandler
  }

  start(callbacks: SpeechCallbacks): void {
    if (!this.customHandler) {
      callbacks.onError(new Error('自定义语音处理器未配置'))
      return
    }

    try {
      void Promise.resolve(this.customHandler.start(callbacks)).catch((error) => {
        callbacks.onError(error instanceof Error ? error : new Error('自定义语音启动失败'))
      })
    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error('自定义语音启动失败'))
    }
  }

  stop(): void {
    if (!this.customHandler) return

    try {
      void Promise.resolve(this.customHandler.stop()).catch((error) => {
        console.warn('停止自定义语音时发生错误:', error)
      })
    } catch (error) {
      console.warn('停止自定义语音时发生错误:', error)
    }
  }

  cleanup(): void {
    this.stop()
    this.customHandler = undefined
  }
}

/**
 * 语音策略工厂
 */
export class SpeechStrategyFactory {
  /**
   * 创建语音识别策略
   * @param mode 策略模式
   * @returns 策略实例
   */
  static createStrategy(mode: 'builtin' | 'custom' = 'builtin'): SpeechStrategy {
    switch (mode) {
      case 'custom':
        return new CustomSpeechStrategy()
      case 'builtin':
      default:
        return new BuiltinSpeechStrategy()
    }
  }
}
