<script setup lang="ts">
import { computed, provide, ref, useSlots, watch, type Slot } from 'vue'
import { createChatAdapterFromConfig, createPresetChatProps, createPresetChatSlices } from '@/adapters'
import { useChatKit, useModelSelector } from '@/composables'
import { CHAT_SCAFFOLD_KEY } from '@/context'
import type { ModelOption, UseChatKitReturn } from '@/types'
import type { TrChatScaffoldContextValue, TrChatScaffoldProps } from '@/types/scaffold'
import {
  collectScaffoldNamedSlots,
  createScaffoldPresetOverrides,
  createScaffoldResponseProvider,
  findScaffoldModelByValue,
  resolveScaffoldInitialModelValue,
  shouldManageScaffoldResponseProvider,
} from '@/helpers/scaffoldRuntime'
import ChatDefaultRenderer from './ChatDefaultRenderer.vue'
import ChatRoot from './ChatRoot.vue'

defineOptions({ name: 'TrChatScaffold' })

interface ScaffoldSlotProps {
  chatKit: UseChatKitReturn
  adapter: ReturnType<typeof createChatAdapterFromConfig>
  presetProps: ReturnType<typeof createPresetChatProps>
  presetSlices: ReturnType<typeof createPresetChatSlices>
  currentModel: { value: string }
  selectModel: (model: ModelOption) => void
}

const props = defineProps<TrChatScaffoldProps>()
const slots = useSlots() as Record<string, Slot | undefined>

const adapter = computed(() => createChatAdapterFromConfig(props.config))
const resolvedModels = computed(() => adapter.value.models)
const resolvedDefaultModel = computed(() => adapter.value.defaultModel)

const currentModel = ref(
  resolveScaffoldInitialModelValue({
    models: resolvedModels.value,
    defaultModel: resolvedDefaultModel.value,
    selectedModel: props.runtime?.selectedModel,
  }),
)

const chatKit =
  props.runtime?.chatKit ??
  useChatKit({
    responseProvider: createScaffoldResponseProvider({
      adapter: adapter.value,
      models: resolvedModels.value,
      defaultModel: resolvedDefaultModel.value,
      modelValue: currentModel.value || resolvedDefaultModel.value,
    }),
    plugins: props.runtime?.plugins,
    storage: props.runtime?.storage,
    initialMessages: props.runtime?.initialMessages,
    onFinish: props.callbacks?.onFinish,
    onError: props.callbacks?.onError,
  })

const { selectModel } = useModelSelector({
  currentModel,
  models: resolvedModels,
  onChange: (model) => {
    props.callbacks?.onModelChange?.(model)
  },
})

watch(
  [resolvedModels, () => props.runtime?.selectedModel],
  ([models, selectedModelValue]) => {
    if (!models.length) {
      currentModel.value = ''
      return
    }

    if (!selectedModelValue || selectedModelValue === currentModel.value) {
      return
    }

    const selectedModel = findScaffoldModelByValue(models, selectedModelValue)
    if (selectedModel) {
      selectModel(selectedModel, { notifyChange: false })
    }
  },
  { immediate: true },
)

watch(
  [currentModel, resolvedDefaultModel, adapter, resolvedModels],
  ([modelValue, defaultModel, currentAdapter, models]) => {
    if (!shouldManageScaffoldResponseProvider(props.runtime)) {
      return
    }

    const resolvedModelValue = modelValue || defaultModel
    if (!resolvedModelValue) {
      return
    }

    chatKit.updateResponseProvider(
      createScaffoldResponseProvider({
        adapter: currentAdapter,
        models,
        defaultModel,
        modelValue: resolvedModelValue,
      }),
    )
  },
  { immediate: true },
)

const presetProps = computed(() => {
  return createPresetChatProps(
    adapter.value,
    createScaffoldPresetOverrides({
      presetOverrides: props.presetOverrides,
      models: resolvedModels.value,
      currentModel: currentModel.value,
      defaultModel: resolvedDefaultModel.value,
      runtime: props.runtime,
      callbacks: props.callbacks,
    }),
  )
})
const presetSlices = computed(() => createPresetChatSlices(presetProps.value))

const scaffoldContext: TrChatScaffoldContextValue = {
  adapter,
  presetProps,
  presetSlices,
  currentModel,
  models: resolvedModels,
  defaultModel: computed(() => currentModel.value || resolvedDefaultModel.value),
  updateModel: selectModel,
}

const slotProps = computed<ScaffoldSlotProps>(() => ({
  chatKit,
  adapter: adapter.value,
  presetProps: presetProps.value,
  presetSlices: presetSlices.value,
  currentModel,
  selectModel,
}))

const namedSlots = computed<Record<string, Slot>>(() => collectScaffoldNamedSlots(slots))

function handleDefaultRendererModelUpdate(modelValue: string) {
  const model = findScaffoldModelByValue(resolvedModels.value, modelValue)
  if (model) {
    props.callbacks?.onModelChange?.(model)
  }
}

provide(CHAT_SCAFFOLD_KEY, scaffoldContext)
</script>

<template>
  <ChatRoot :chat-kit="chatKit" v-bind="presetSlices.root">
    <slot v-if="$slots.default" v-bind="slotProps" />
    <ChatDefaultRenderer v-else @update:model="handleDefaultRendererModelUpdate">
      <template v-for="(_, name) in namedSlots" #[name]="defaultSlotProps" :key="name">
        <slot :name="name" v-bind="defaultSlotProps ?? {}" />
      </template>
    </ChatDefaultRenderer>
  </ChatRoot>
</template>
