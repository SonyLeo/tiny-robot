import { inject, provide, type InjectionKey, type Ref } from 'vue'
import type { ChatAssistantOutlineItem } from '../../../types'

export interface AssistantOutlineRegistration {
  messageIndex: number
  bubbleEl: HTMLElement
  bodyEl: HTMLElement
}

export interface AssistantOutlineContextValue {
  enabled: Ref<boolean>
  minItems: Ref<number>
  topOffset: Ref<number>
  scrollContainer: Ref<HTMLElement | null | undefined>
  activeMessageIndex: Ref<number | undefined>
  items: Ref<ChatAssistantOutlineItem[]>
  activeItemId: Ref<string | undefined>
  registerSource: (registration: AssistantOutlineRegistration) => () => void
  selectItem: (messageIndex: number, itemId: string) => void
}

export const ASSISTANT_OUTLINE_CONTEXT_KEY: InjectionKey<AssistantOutlineContextValue> = Symbol('assistantOutline')

export function provideAssistantOutlineContext(value: AssistantOutlineContextValue) {
  provide(ASSISTANT_OUTLINE_CONTEXT_KEY, value)
}

export function useAssistantOutlineContext() {
  return inject(ASSISTANT_OUTLINE_CONTEXT_KEY, null)
}
