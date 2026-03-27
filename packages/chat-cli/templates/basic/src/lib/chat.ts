import { localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'

export const chatRuntime = {
  storage: localStorageStrategyFactory(),
}
