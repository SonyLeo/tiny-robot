import { useChatKit } from '@/runtime/chat-kit/useChatKit'
import type { TrChatProviderProps, UseChatKitOptions, UseChatKitReturn } from '@/types'
import { conditionalProp } from '@/shared/utils'

interface ProviderChatKitResolution {
  providedChatKit?: UseChatKitReturn
  chatKitOptions?: UseChatKitOptions
}

export function getProviderChatKitResolution(
  componentName: string,
  props: TrChatProviderProps,
): ProviderChatKitResolution {
  const providedChatKit = conditionalProp(props, 'chatKit')

  if (providedChatKit) {
    return {
      providedChatKit,
    }
  }

  const responseProvider = conditionalProp(props, 'responseProvider')

  if (!responseProvider) {
    throw new Error(`[${componentName}] Either chatKit or responseProvider must be provided`)
  }

  return {
    chatKitOptions: {
      responseProvider,
      plugins: conditionalProp(props, 'plugins'),
      storage: conditionalProp(props, 'storage'),
      initialMessages: conditionalProp(props, 'initialMessages'),
      messageTransforms: conditionalProp(props, 'messageTransforms'),
      onFinish: conditionalProp(props, 'onFinish'),
      onError: conditionalProp(props, 'onError'),
    },
  }
}

export function resolveProviderChatKit(
  componentName: string,
  props: TrChatProviderProps,
  createChatKit: (options: UseChatKitOptions) => UseChatKitReturn = useChatKit,
): UseChatKitReturn {
  const resolution = getProviderChatKitResolution(componentName, props)

  if (resolution.providedChatKit) {
    return resolution.providedChatKit
  }

  return createChatKit(resolution.chatKitOptions!)
}
