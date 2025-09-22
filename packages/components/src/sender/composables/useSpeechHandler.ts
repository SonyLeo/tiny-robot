import { reactive, onUnmounted } from 'vue'
import type { SpeechHookOptions, SpeechHandler, SpeechState } from '../index.type'
import { WebSpeechStrategy, CustomSpeechStrategy, type SpeechRecognitionStrategy } from './speechStrategies'

/**
 * 语音识别处理 Hook
 * 支持 Web Speech API 和自定义语音识别实现
 *
 * @param options 语音识别配置
 */
export function useSpeechHandler(options: SpeechHookOptions): SpeechHandler {
  // 语音识别状态
  const speechState = reactive<SpeechState>({
    isRecording: false,
    isSupported: false,
    error: undefined,
  })

  // 选择语音识别策略
  let strategy: SpeechRecognitionStrategy

  if (options.customRecognition) {
    // 使用自定义语音识别
    strategy = new CustomSpeechStrategy(speechState, options)
  } else {
    // 使用 Web Speech API
    strategy = new WebSpeechStrategy(speechState, options)
  }

  // 更新支持状态
  speechState.isSupported = strategy.isSupported()

  // 开始录音
  const start = () => {
    if (!speechState.isSupported) {
      const error = new Error(options.customRecognition ? '自定义语音识别不可用' : '浏览器不支持语音识别')
      speechState.error = error
      options.onError?.(error)
      return
    }

    strategy.start()
  }

  // 停止录音
  const stop = () => {
    if (speechState.isSupported) {
      strategy.stop()
    }
  }

  // 组件卸载时清理资源
  onUnmounted(() => {
    if (strategy.cleanup) {
      strategy.cleanup()
    }
  })

  return {
    speechState,
    start,
    stop,
  }
}
