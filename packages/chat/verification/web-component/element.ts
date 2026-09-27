import { createApp, defineComponent, h, nextTick, onBeforeUnmount, ref } from 'vue'
import type { App } from 'vue'
import { useChatRuntimeFromConversation } from '../../src/runtime/useChatRuntimeFromConversation'
import { errorStatePlugin } from '../../src/runtime/plugins/errorStatePlugin'
import TrChat from '../../src/Chat.vue'
import type { ChatRuntimeActionErrorPayload, ChatUIOptions } from '../../src/types'
import { useConversation } from '@opentiny/tiny-robot-kit'
import type { ResponseProvider, ConversationStorageStrategy } from '@opentiny/tiny-robot-kit'
import { Sender } from '@opentiny/tiny-robot'

type ColorMode = 'light' | 'dark'

function createMemoryStorage(): ConversationStorageStrategy {
  const conversations = new Map<string, { id: string; title?: string; createdAt: number; updatedAt: number }>()
  const messages = new Map<string, Awaited<ReturnType<ConversationStorageStrategy['loadMessages']>>>()
  return {
    loadConversations: () => [...conversations.values()],
    loadMessages: (id) => messages.get(id) ?? [],
    saveConversation: (conversation) => {
      conversations.set(conversation.id, { ...conversation })
    },
    saveMessages: (id, value) => {
      messages.set(id, value)
    },
    deleteConversation: (id) => {
      conversations.delete(id)
      messages.delete(id)
    },
  }
}

export class TinyRobotChatVerificationElement extends HTMLElement {
  static observedAttributes = ['title', 'color-mode']

  private app: App | undefined
  private mountPoint: HTMLDivElement | undefined
  private pendingMount = false
  private providerValue: ResponseProvider | undefined
  private titleValue = ref('')
  private sendAction: ((text: string) => Promise<boolean>) | undefined
  private cancelAction: (() => Promise<void>) | undefined
  private generation = 0

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    // An own property assigned before customElements.define shadows the setter.
    const earlyProvider = Object.getOwnPropertyDescriptor(this, 'responseProvider')
    if (earlyProvider) {
      delete (this as { responseProvider?: ResponseProvider }).responseProvider
      this.responseProvider = earlyProvider.value
    }
  }

  get responseProvider(): ResponseProvider | undefined {
    return this.providerValue
  }
  set responseProvider(value: ResponseProvider | undefined) {
    this.providerValue = value
    if (this.isConnected && !this.app) void this.mount()
  }

  get colorMode(): ColorMode {
    return this.getAttribute('color-mode') === 'dark' ? 'dark' : 'light'
  }
  set colorMode(value: ColorMode) {
    this.setAttribute('color-mode', value)
  }

  connectedCallback() {
    if (this.app || this.pendingMount) return
    // A move within the document can reconnect before the deferred teardown.
    void this.mount()
  }

  disconnectedCallback() {
    const generation = ++this.generation
    queueMicrotask(() => {
      if (this.isConnected || this.generation !== generation) return
      this.app?.unmount()
      this.app = undefined
      this.sendAction = undefined
      this.cancelAction = undefined
      this.mountPoint?.remove()
      this.mountPoint = undefined
    })
  }

  attributeChangedCallback(name: string, _oldValue: string | null, value: string | null) {
    if (name === 'title') this.titleValue.value = value ?? ''
    if (name === 'color-mode') this.mountPoint?.setAttribute('data-tr-color-mode', value === 'dark' ? 'dark' : 'light')
  }

  async send(text: string): Promise<boolean> {
    if (!this.sendAction) throw new Error('Chat is not ready')
    return this.sendAction(text)
  }

  async cancel(): Promise<void> {
    if (!this.cancelAction) throw new Error('Chat is not ready')
    await this.cancelAction()
  }

  private reportActionError(action: string, error: unknown) {
    this.dispatchEvent(
      new CustomEvent('chat-error', {
        detail: { action, message: String(error) },
        bubbles: true,
        composed: true,
      }),
    )
  }

  private async mount() {
    if (this.pendingMount || this.app || !this.providerValue || !this.isConnected) return
    this.pendingMount = true
    const generation = ++this.generation
    try {
      const root = this.shadowRoot!
      if (!root.querySelector('link')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = new URL('./style.css', import.meta.url).href
        root.append(link)
        await new Promise<void>((resolve, reject) => {
          link.addEventListener('load', () => resolve(), { once: true })
          link.addEventListener('error', () => reject(new Error('Chat stylesheet failed to load')), { once: true })
        })
      }
      if (!this.isConnected || generation !== this.generation) return
      const mountPoint = document.createElement('div')
      mountPoint.className = 'chat-verification-root'
      mountPoint.setAttribute('data-tr-theme', '')
      mountPoint.setAttribute('data-tr-color-mode', this.colorMode)
      mountPoint.style.height = '100%'
      root.append(mountPoint)
      this.mountPoint = mountPoint
      const provider = this.providerValue
      const app = createApp(
        defineComponent({
          setup: () => {
            const suggestions = ref([{ content: 'JavaScript' }, { content: 'TypeScript' }])
            const ui: ChatUIOptions = { sender: { extensions: [Sender.suggestion(suggestions)] } }
            const conversation = useConversation({
              storage: createMemoryStorage(),
              autoSaveMessages: true,
              useMessageOptions: { responseProvider: provider!, plugins: [errorStatePlugin()] },
            })
            const runtime = useChatRuntimeFromConversation({ conversation })
            this.sendAction = (text) =>
              runtime.actions.send({ text }).catch((error) => {
                this.reportActionError('send', error)
                throw error
              })
            this.cancelAction = async () => {
              await runtime.actions.abort?.()
            }
            onBeforeUnmount(() => conversation.clear())
            return () =>
              h(
                TrChat,
                {
                  runtime,
                  ui,
                  title: this.titleValue.value || undefined,
                  onRuntimeActionError: (detail: ChatRuntimeActionErrorPayload) =>
                    this.reportActionError(detail.action, detail.error),
                },
                {
                  'header-notice': () => h('slot', { name: 'header-notice' }),
                },
              )
          },
        }),
      )
      app.mount(mountPoint)
      this.app = app
      await nextTick()
      if (this.isConnected && generation === this.generation) {
        this.dispatchEvent(new CustomEvent('ready', { detail: { instance: this }, bubbles: true, composed: true }))
      }
    } catch (error) {
      this.dispatchEvent(
        new CustomEvent('chat-error', {
          detail: { action: 'mount', message: String(error) },
          bubbles: true,
          composed: true,
        }),
      )
    } finally {
      this.pendingMount = false
      if (this.isConnected && !this.app && generation !== this.generation) {
        queueMicrotask(() => void this.mount())
      }
    }
  }
}

export function registerTinyRobotChatVerification(tag = 'tiny-robot-chat-verification') {
  const registered = customElements.get(tag)
  if (registered && registered !== TinyRobotChatVerificationElement) {
    throw new Error(`${tag} is already registered by another constructor`)
  }
  if (!registered) customElements.define(tag, TinyRobotChatVerificationElement)
  return TinyRobotChatVerificationElement
}
