import { ref } from 'vue'

export interface UseModelSelectorReturn {
  models: string[]
  currentModel: ReturnType<typeof ref<string>>
}

/**
 * 管理模型选择状态。
 * 不感知 provider 实现，切换逻辑由调用方通过 watch(currentModel) 处理。
 *
 * @param models - 可用模型列表
 * @param defaultModel - 默认选中模型，不传则取列表第一个
 */
export function useModelSelector(models: string[], defaultModel?: string): UseModelSelectorReturn {
  const currentModel = ref<string>(defaultModel ?? models[0] ?? '')
  return { models, currentModel }
}
