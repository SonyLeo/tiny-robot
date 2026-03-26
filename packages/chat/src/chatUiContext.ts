import { ref, type Ref } from 'vue'

export type ChatHistoryDisplayMode = 'drawer' | 'surface'

export interface ChatUiContextValue {
  history: {
    visible: Ref<boolean>
    display: Ref<ChatHistoryDisplayMode>
    open: () => void
    close: () => void
    toggle: () => void
  }
}

export interface CreateChatUiContextOptions {
  historyDisplay?: ChatHistoryDisplayMode
  historyVisible?: boolean
  closableHistory?: boolean
}

export function createChatUiContext(options: CreateChatUiContextOptions = {}): ChatUiContextValue {
  const display = ref<ChatHistoryDisplayMode>(options.historyDisplay ?? 'drawer')
  const visible = ref(options.historyVisible ?? display.value === 'surface')
  const closableHistory = options.closableHistory ?? display.value !== 'surface'

  function setHistoryVisible(nextVisible: boolean) {
    if (!closableHistory && !nextVisible) {
      return
    }

    visible.value = nextVisible
  }

  return {
    history: {
      visible,
      display,
      open: () => {
        setHistoryVisible(true)
      },
      close: () => {
        setHistoryVisible(false)
      },
      toggle: () => {
        setHistoryVisible(!visible.value)
      },
    },
  }
}
