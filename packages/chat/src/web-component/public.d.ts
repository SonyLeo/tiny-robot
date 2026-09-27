export interface ChatRequestMessage {
  role?: string
  content?: unknown
  [key: string]: unknown
}

export interface ChatRequestBody {
  messages: ChatRequestMessage[]
  [key: string]: unknown
}

export interface ChatCompletion {
  id: string
  object: string
  created: number
  model: string
  system_fingerprint: string | null
  choices: Array<{
    index: number
    delta?: { role?: string; content?: string; [key: string]: unknown }
    message?: { role: string; content?: string; [key: string]: unknown }
    finish_reason: string | null
    [key: string]: unknown
  }>
  [key: string]: unknown
}

export type ResponseProvider = (
  requestBody: ChatRequestBody,
  abortSignal: AbortSignal,
) => Promise<ChatCompletion> | AsyncGenerator<ChatCompletion> | Promise<AsyncGenerator<ChatCompletion>>

export type ChatErrorAction = 'mount' | 'send' | 'cancel' | 'runtime'

export interface ChatErrorDetail {
  action: ChatErrorAction
  message: string
}

export type TinyRobotChatElement = HTMLElement & {
  responseProvider: ResponseProvider | undefined
  title: string
  colorMode: 'light' | 'dark'
  send(text: string): Promise<boolean>
  cancel(): Promise<void>
  addEventListener(
    type: 'ready',
    listener: (event: CustomEvent<{ instance: TinyRobotChatElement }>) => void,
    options?: AddEventListenerOptions | boolean,
  ): void
  addEventListener(
    type: 'chat-error',
    listener: (event: CustomEvent<ChatErrorDetail>) => void,
    options?: AddEventListenerOptions | boolean,
  ): void
}

export declare const TinyRobotChatElement: {
  new (): TinyRobotChatElement
}

export declare function registerTinyRobotChat(): typeof TinyRobotChatElement
