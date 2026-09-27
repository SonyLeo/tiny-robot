import { createApp, defineComponent, h, nextTick, onBeforeUnmount, ref } from 'vue'
import type { App } from 'vue'
import { useConversation } from '@opentiny/tiny-robot-kit'
import type { ConversationStorageStrategy, ResponseProvider as KitResponseProvider } from '@opentiny/tiny-robot-kit'
import TrChat from '../Chat.vue'
import { useChatRuntimeFromConversation } from '../runtime/useChatRuntimeFromConversation'
import { errorStatePlugin } from '../runtime/plugins/errorStatePlugin'
import type { ChatRuntimeActionErrorPayload } from '../types'
import type { ResponseProvider } from './public'

const compiledStyles = '__TINY_ROBOT_CHAT_COMPILED_STYLES__'

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

export class TinyRobotChatElement extends HTMLElement {
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
    for (const name of ['responseProvider', 'title', 'colorMode'] as const) {
      const earlyValue = Object.getOwnPropertyDescriptor(this, name)
      if (earlyValue) {
        delete (this as unknown as Record<string, unknown>)[name]
        ;(this as unknown as Record<string, unknown>)[name] = earlyValue.value
      }
    }
  }

  get responseProvider(): ResponseProvider | undefined {
    return this.providerValue
  }
  set responseProvider(value: ResponseProvider | undefined) {
    if (value !== undefined && typeof value !== 'function') throw new TypeError('responseProvider must be a function')
    if (!value && this.app) throw new TypeError('responseProvider is required while Chat is mounted')
    this.providerValue = value
    if (this.isConnected && !this.app) void this.mount()
  }

  get title(): string {
    return this.getAttribute('title') ?? ''
  }
  set title(value: string) {
    this.setAttribute('title', value)
  }

  get colorMode(): 'light' | 'dark' {
    return this.getAttribute('color-mode') === 'dark' ? 'dark' : 'light'
  }
  set colorMode(value: 'light' | 'dark') {
    this.setAttribute('color-mode', value)
  }

  connectedCallback() {
    if (!this.app && !this.pendingMount) void this.mount()
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
    try {
      await this.cancelAction()
    } catch (error) {
      this.reportActionError('cancel', error)
      throw error
    }
  }

  private reportActionError(action: 'mount' | 'send' | 'cancel' | 'runtime', error: unknown) {
    this.dispatchEvent(
      new CustomEvent('chat-error', {
        detail: { action, message: String(error) },
        bubbles: true,
        composed: true,
      }),
    )
  }

  private ensureStyles() {
    if (this.shadowRoot!.querySelector('style[data-tiny-robot-chat]')) return
    const style = document.createElement('style')
    style.setAttribute('data-tiny-robot-chat', '')
    style.textContent = compiledStyles
    this.shadowRoot!.append(style)
  }

  private async mount() {
    if (this.pendingMount || this.app || !this.providerValue || !this.isConnected) return
    this.pendingMount = true
    const generation = ++this.generation
    try {
      this.ensureStyles()
      if (!this.isConnected || generation !== this.generation) return
      const mountPoint = document.createElement('div')
      mountPoint.className = 'chat-web-component-root'
      mountPoint.setAttribute('data-tr-theme', '')
      mountPoint.setAttribute('data-tr-color-mode', this.colorMode)
      mountPoint.style.height = '100%'
      this.shadowRoot!.append(mountPoint)
      this.mountPoint = mountPoint
      const app = createApp(
        defineComponent({
          setup: () => {
            const conversation = useConversation({
              storage: createMemoryStorage(),
              autoSaveMessages: true,
              useMessageOptions: {
                responseProvider: ((body, signal) => this.responseProvider!(body, signal)) as KitResponseProvider,
                plugins: [errorStatePlugin()],
              },
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
                  title: this.titleValue.value || undefined,
                  onRuntimeActionError: (detail: ChatRuntimeActionErrorPayload) =>
                    this.reportActionError(detail.action === 'send' ? 'send' : 'runtime', detail.error),
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
      this.reportActionError('mount', error)
    } finally {
      this.pendingMount = false
      if (this.isConnected && !this.app && generation !== this.generation) queueMicrotask(() => void this.mount())
    }
  }
}

export function registerTinyRobotChat() {
  const tag = 'tiny-robot-chat'
  const registered = customElements.get(tag)
  if (registered && registered !== TinyRobotChatElement) {
    throw new Error(`${tag} is already registered by another constructor`)
  }
  if (!registered) customElements.define(tag, TinyRobotChatElement)
  return TinyRobotChatElement
}
