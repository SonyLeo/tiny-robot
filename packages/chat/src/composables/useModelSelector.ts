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

  function resolveProviderFactory(model: ModelOption) {
    return providerFactories.value?.find((item) => item.match(model))
  }

  function canSelectModel(model: ModelOption) {
    if (model.disabled) {
      return false
    }

    if (!options.chatKit || !providerFactories.value?.length) {
      return true
    }

    return Boolean(resolveProviderFactory(model))
  }

  function commitModel(model: ModelOption, notifyChange = true) {
    if (!canSelectModel(model)) {
      return false
    }

    options.currentModel.value = model.value

    if (options.chatKit && providerFactories.value?.length) {
      const factory = resolveProviderFactory(model)
      if (factory) {
        options.chatKit.updateResponseProvider(factory.createProvider(model))
      }
    }

    if (notifyChange) {
      options.onChange?.(model)
    }

    return true
  }

  watchEffect(() => {
    if (models.value.length === 0) {
      return
    }

    const selectedModel = currentModelOption.value
    const isCurrentModelSelectable = selectedModel ? canSelectModel(selectedModel) : false

    if (!isCurrentModelSelectable) {
      const fallbackModel = models.value.find((model) => canSelectModel(model))
      if (fallbackModel) {
        commitModel(fallbackModel)
      }
    }
  })

  function selectModel(model: ModelOption) {
    commitModel(model)
  }

  return {
    currentModelOption,
    currentProvider,
    selectModel,
  }
}
