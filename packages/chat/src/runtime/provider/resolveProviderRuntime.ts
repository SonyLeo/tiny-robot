import { useChatKit } from '@/runtime/chat-kit/useChatKit'
import type { TrChatProviderProps } from '@/types'
import type { TrChatProviderRuntimeOptions, UseChatKitReturn } from '@/types/core'

interface ProviderRuntimeResolution {
  providerRuntimeOptions: TrChatProviderRuntimeOptions
}

export function getProviderRuntimeResolution(
  componentName: string,
  props: TrChatProviderProps,
): ProviderRuntimeResolution {
  const responseProvider = props.responseProvider

  if (!responseProvider) {
    throw new Error(`[${componentName}] responseProvider must be provided`)
  }

  return {
    providerRuntimeOptions: {
      responseProvider,
      plugins: props.plugins,
      storage: props.storage,
      initialMessages: props.initialMessages,
      messageTransforms: props.messageTransforms,
      onFinish: props.onFinish,
      onError: props.onError,
    },
  }
}

export function resolveProviderRuntime(
  componentName: string,
  props: TrChatProviderProps,
  createChatKit: (options: TrChatProviderRuntimeOptions) => UseChatKitReturn = useChatKit,
): UseChatKitReturn {
  const resolution = getProviderRuntimeResolution(componentName, props)
  return createChatKit(resolution.providerRuntimeOptions)
}
