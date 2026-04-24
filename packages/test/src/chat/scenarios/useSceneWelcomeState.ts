import { computed, type Ref } from 'vue'

interface SceneRuntimeResolution {
  runtime: {
    conversation: {
      messages: Ref<unknown[]>
    }
  }
}

export function useSceneWelcomeState(resolution: Ref<SceneRuntimeResolution>) {
  return computed(() => resolution.value.runtime.conversation.messages.value.length === 0)
}
