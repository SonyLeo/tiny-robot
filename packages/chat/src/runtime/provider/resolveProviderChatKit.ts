import { useChatKit } from '@/runtime/chat-kit/useChatKit'
import type { TrChatProviderProps, UseChatKitOptions, UseChatKitReturn } from '@/types'

interface ProviderChatKitResolution {
  chatKitOptions: UseChatKitOptions
}

export function getProviderChatKitResolution(
  componentName: string,
  props: TrChatProviderProps,
): ProviderChatKitResolution {
  const responseProvider = props.responseProvider

  if (!responseProvider) {
    throw new Error(`[${componentName}] responseProvider must be provided`)
  }

  return {
    chatKitOptions: {
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

export function resolveProviderChatKit(
  componentName: string,
  props: TrChatProviderProps,
  createChatKit: (options: UseChatKitOptions) => UseChatKitReturn = useChatKit,
): UseChatKitReturn {
  const resolution = getProviderChatKitResolution(componentName, props)
  return createChatKit(resolution.chatKitOptions)
}
