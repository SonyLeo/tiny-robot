import { registerTinyRobotChat } from '@opentiny/tiny-robot-chat-web-component'
import type { ResponseProvider, TinyRobotChatElement } from '@opentiny/tiny-robot-chat-web-component'

const provider: ResponseProvider = async function* (body, signal) {
  const text = String(body.messages.at(-1)?.content ?? '')
  if (signal.aborted) return
  yield {
    id: 'mock',
    object: 'chat.completion.chunk',
    created: 0,
    model: 'mock',
    system_fingerprint: null,
    choices: [{ index: 0, delta: { role: 'assistant', content: text }, finish_reason: null }],
  }
}

registerTinyRobotChat()
const chat = document.querySelector('tiny-robot-chat') as TinyRobotChatElement
chat.responseProvider = provider
chat.addEventListener('ready', (event) => {
  event.detail.instance.send('hello')
})
chat.addEventListener('chat-error', (event) => {
  console.error(event.detail.action, event.detail.message)
})
