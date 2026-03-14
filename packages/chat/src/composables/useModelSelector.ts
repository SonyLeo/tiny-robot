import { computed, toValue, watchEffect, type MaybeRefOrGetter, type Ref } from 'vue'
import type { ModelOption, ModelProviderFactory, UseChatKitReturn } from '../types'
import { getProviderIcon } from '../utils/iconMap'

export interface UseModelSelectorOptions {
  currentModel: Ref<string>
  models: MaybeRefOrGetter<ModelOption[]>
  providerFactories?: MaybeRefOrGetter<ModelProviderFactory[] | undefined>
  chatKit?: Pick<UseChatKitReturn, 'updateResponseProvider'> | null
  onChange?: (model: ModelOption) => void
}

export function useModelSelector(options: UseModelSelectorOptions) {
  const models = computed(() => toValue(options.models))
  const providerFactories = computed(() => toValue(options.providerFactories))

  const currentModelOption = computed(() => {
    return models.value.find((model) => model.value === options.currentModel.value)
  })

  const currentProvider = computed(() => {
    return currentModelOption.value ? getProviderIcon(currentModelOption.value) : null
  })

  watchEffect(() => {
    if (models.value.length === 0) {
      return
    }

    const hasCurrentModel = models.value.some((model) => model.value === options.currentModel.value)
    if (!hasCurrentModel) {
      const fallbackModel = models.value.find((model) => !model.disabled) ?? models.value[0]
      if (fallbackModel) {
        options.currentModel.value = fallbackModel.value
      }
    }
  })

  function selectModel(model: ModelOption) {
    if (model.disabled) {
      return
    }

    options.currentModel.value = model.value

    if (options.chatKit && providerFactories.value?.length) {
      const factory = providerFactories.value.find((item) => item.match(model))
      if (factory) {
        options.chatKit.updateResponseProvider(factory.createProvider(model))
      }
    }

    options.onChange?.(model)
  }

  return {
    currentModelOption,
    currentProvider,
    selectModel,
  }
}
