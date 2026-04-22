<script setup lang="ts">
import { computed, provide, ref, useSlots, watch, type Slot } from 'vue'
import { createChatAdapterFromConfig, createPresetChatProps, createPresetChatSlices } from '@/runtime/config'
import { useChatKit } from '@/runtime/chat-kit/useChatKit'
import { useModelSelector } from '@/components/model-selector/useModelSelector'
import { CHAT_BEFORE_SEND_KEY, CHAT_PAGE_INPUTS_KEY, CHAT_SCAFFOLD_KEY } from '@/shared/context'
import type { ModelOption, UseChatKitReturn } from '@/types'
import type { TrChatScaffoldContextValue, TrChatScaffoldProps } from '@/types/scaffold'
import {
  collectScaffoldNamedSlots,
  createScaffoldPresetOverrides,
  createScaffoldResponseProvider,
  findScaffoldModelByValue,
  resolveScaffoldInitialModelValue,
  shouldManageScaffoldResponseProvider,
} from '@/runtime/scaffold/scaffoldRuntime'
import ChatDefaultRenderer from './default-renderer/ChatDefaultRenderer.vue'
import ChatProvider from './ChatProvider.vue'

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
    messageTransforms: props.runtime?.messageTransforms,
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
const pageInputs = computed(() => ({
  header: presetSlices.value.header,
  layout: presetSlices.value.layout,
  welcome: presetSlices.value.welcome,
  messageList: presetSlices.value.messageList,
  history: presetSlices.value.history,
  appearance: presetSlices.value.appearance.appearance,
  shell: presetSlices.value.shell.shell,
  modelSelector: presetSlices.value.modelSelector,
  updateModel: selectModel,
}))

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
provide(CHAT_PAGE_INPUTS_KEY, pageInputs)
if (props.callbacks?.onBeforeSend) {
  provide(CHAT_BEFORE_SEND_KEY, props.callbacks.onBeforeSend)
}
</script>

<template>
  <ChatProvider :chat-kit="chatKit" :shell="presetSlices.shell.shell" v-bind="presetSlices.provider">
    <slot v-if="$slots.default" v-bind="slotProps" />
    <ChatDefaultRenderer v-else @update:model="handleDefaultRendererModelUpdate">
      <template v-for="(_, name) in namedSlots" #[name]="defaultSlotProps" :key="name">
        <slot :name="name" v-bind="defaultSlotProps ?? {}" />
      </template>
    </ChatDefaultRenderer>
  </ChatProvider>
</template>
