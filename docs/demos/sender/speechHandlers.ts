import type { CustomSpeechHandler, SpeechCallbacks } from '@opentiny/tiny-robot'

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
