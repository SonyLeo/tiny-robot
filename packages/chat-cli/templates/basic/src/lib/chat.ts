import { createChatAdapterFromConfig, createPresetChatProps } from '@opentiny/tiny-robot-chat'
import { localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'
import chatConfig from '../chat.config'

const storage = localStorageStrategyFactory()
const chatAdapter = createChatAdapterFromConfig(chatConfig)

export const chatPreset = createPresetChatProps(chatAdapter, {
  storage,
  showHistory: true,
})
