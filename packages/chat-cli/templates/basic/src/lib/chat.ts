import { createChatAdapterFromConfig, createChatCliCapabilitySurface } from '@opentiny/tiny-robot-chat'
import { localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'
import chatConfig from '../chat.config'

export const chatStorage = localStorageStrategyFactory()
export const chatAdapter = createChatAdapterFromConfig(chatConfig)
export const chatCapabilitySurface = createChatCliCapabilitySurface(chatAdapter)
