<script setup lang="ts">
import { computed, provide, ref, useSlots, watchEffect } from 'vue'
import { createChatAdapterFromConfig, createPresetChatProps, createPresetChatSlices } from '@/adapters'
import { useChatKit, useModelSelector } from '@/composables'
import { CHAT_SCAFFOLD_KEY } from '@/context'
import type { ModelOption, UseChatKitReturn } from '@/types'
import type { TrChatScaffoldContextValue, TrChatScaffoldProps } from './scaffold'
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
const slots = useSlots()

const adapter = computed(() => createChatAdapterFromConfig(props.config))
const resolvedModels = computed(() => adapter.value.models)
const resolvedDefaultModel = computed(() => adapter.value.defaultModel)

function resolveInitialModelValue() {
  const models = resolvedModels.value
  if (!models.length) {
    return ''
  }

  const controlledModel = props.runtime?.selectedModel
  if (controlledModel && models.some((model) => model.value === controlledModel)) {
    return controlledModel
  }

  return resolvedDefaultModel.value ?? models[0]?.value ?? ''
}

function findModelByValue(modelValue: string) {
  return resolvedModels.value.find((item) => item.value === modelValue)
}

const currentModel = ref(resolveInitialModelValue())

function createScaffoldResponseProvider(modelValue?: string) {
  const models = resolvedModels.value
  const targetValue = modelValue ?? resolvedDefaultModel.value
  const model = models.find((item) => item.value === targetValue) ?? models[0]

  if (!model) {
    throw new Error('[TrChatScaffold] No models available to create response provider')
  }

  return adapter.value.createResponseProvider(model.value)
}

const chatKit =
  props.runtime?.chatKit ??
  useChatKit({
    responseProvider: createScaffoldResponseProvider(currentModel.value || resolvedDefaultModel.value),
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

watchEffect(() => {
  const models = resolvedModels.value
  if (!models.length) {
    currentModel.value = ''
    return
  }

  const selectedModelValue = props.runtime?.selectedModel
  if (!selectedModelValue || selectedModelValue === currentModel.value) {
    return
  }

  const selectedModel = findModelByValue(selectedModelValue)
  if (selectedModel) {
    selectModel(selectedModel, { notifyChange: false })
  }
})

watchEffect(() => {
  const modelValue = currentModel.value || resolvedDefaultModel.value
  if (!modelValue) {
    return
  }

  chatKit.updateResponseProvider(createScaffoldResponseProvider(modelValue))
})

const presetProps = computed(() => {
  const overrides = {
    ...props.presetOverrides,
    models: resolvedModels.value,
    defaultModel: currentModel.value || resolvedDefaultModel.value,
  }

  if (props.runtime?.mcpManager !== undefined) {
    overrides.mcpManager = props.runtime.mcpManager
  }

  if (props.callbacks?.onMessageAction !== undefined) {
    overrides.onMessageAction = props.callbacks.onMessageAction
  }

  if (props.callbacks?.onModelChange !== undefined) {
    overrides.onModelChange = props.callbacks.onModelChange
  }

  return createPresetChatProps(adapter.value, overrides)
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

const namedSlots = computed(() =>
  Object.fromEntries(Object.entries(slots).filter(([name]) => name !== 'default' && slots[name] !== undefined)),
)

function handleDefaultRendererModelUpdate(modelValue: string) {
  const model = findModelByValue(modelValue)
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
