import { reactive, onUnmounted } from 'vue'
import type { SpeechHookOptions, SpeechHandler, SpeechState, SpeechCallbacks } from '../index.type'
import { SpeechStrategyFactory } from './speechStrategies'

/**
 * 语音识别处理 Hook
 * 支持内置 Web Speech API 和自定义语音处理器双模式
 * 使用策略模式实现不同的语音识别方案
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

  // 创建语音策略
  const strategy = SpeechStrategyFactory.createStrategy(options.mode)

  // 初始化策略
  strategy.initialize(options)
  speechState.isSupported = strategy.isSupported()

  // 创建回调函数集合
  const createCallbacks = (): SpeechCallbacks => ({
    onStart: () => {
      speechState.isRecording = true
      speechState.error = undefined
      options.onStart?.()
    },
    onInterim: (transcript: string) => {
      options.onInterim?.(transcript)
    },
    onFinal: (transcript: string) => {
      options.onFinal?.(transcript)
    },
    onEnd: (transcript?: string) => {
      speechState.isRecording = false
      options.onEnd?.(transcript)
    },
    onError: (error: Error) => {
      speechState.error = error
      speechState.isRecording = false
      options.onError?.(error)
    },
  })

  // 开始录音
  const start = () => {
    if (!speechState.isSupported) {
      const error = new Error('语音识别不受支持')
      speechState.error = error
      options.onError?.(error)
      return
    }

    // 如果正在录音，先停止再重新开始
    if (speechState.isRecording) {
      strategy.stop()
      // 短暂延迟后重新开始
      setTimeout(() => {
        strategy.start(createCallbacks())
      }, 100)
      return
    }

    strategy.start(createCallbacks())
  }

  // 停止录音
  const stop = () => {
    if (!speechState.isRecording) {
      return
    }

    strategy.stop()
  }

  // 组件卸载时清理资源
  onUnmounted(() => {
    strategy.cleanup?.()
  })

  return {
    speechState,
    start,
    stop,
  }
}
