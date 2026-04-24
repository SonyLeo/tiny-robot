import { shallowRef, watch, type Ref } from 'vue'
import { createRuntimeFromConfig, type TrChatConfig } from '@opentiny/tiny-robot-chat'

export function useStableSceneRuntime(configRef: Readonly<Ref<TrChatConfig>>) {
  const resolution = shallowRef(createRuntimeFromConfig(configRef.value))

  watch(configRef, (nextConfig) => {
    resolution.value = createRuntimeFromConfig(nextConfig)
  })

  return resolution
}
