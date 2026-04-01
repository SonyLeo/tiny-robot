import { useChatKit } from '@/composables/useChatKit'
import type { TrChatRootProps, UseChatKitOptions, UseChatKitReturn } from '@/types'
import { conditionalProp } from '@/utils'

interface RootChatKitResolution {
  providedChatKit?: UseChatKitReturn
  chatKitOptions?: UseChatKitOptions
}

export function getRootChatKitResolution(componentName: string, props: TrChatRootProps): RootChatKitResolution {
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

export function resolveRootChatKit(
  componentName: string,
  props: TrChatRootProps,
  createChatKit: (options: UseChatKitOptions) => UseChatKitReturn = useChatKit,
): UseChatKitReturn {
  const resolution = getRootChatKitResolution(componentName, props)

  if (resolution.providedChatKit) {
    return resolution.providedChatKit
  }

  return createChatKit(resolution.chatKitOptions!)
}
