export const AVAILABLE_MODELS = ['deepseek-reasoner', 'deepseek-chat']

export const WELCOME_CONFIG = {
  title: 'Welcome to TinyRobot Chat',
  description: 'Try asking me anything. I can help with coding, writing, analysis, and more.',
}

export const PROMPTS = [
  { label: 'Explain React hooks', description: 'Explain React hooks' },
  { label: 'Write a Python function', description: 'Write a Python function' },
  { label: 'Summarize this text', description: 'Summarize this text' },
  { label: 'Generate a poem', description: 'Generate a poem' },
]

export const BRAND_CONFIG = {
  title: 'TinyRobot Chat',
}

export const DEMO_MODES = {
  BLACKBOX: 'blackbox',
  WHITEBOX: 'whitebox',
} as const

export const MODE_INFO = {
  blackbox: {
    title: '🎯 Black-box Mode',
    description: 'Zero configuration. Just pass a responseProvider and it handles everything.',
    code: `<TrChat
  :response-provider="responseProvider"
  :brand="brandConfig"
  :welcome="welcomeConfig"
  :prompts="prompts"
  show-feedback
  show-history
/>`,
  },
  whitebox: {
    title: '⚙️ White-box Mode',
    description: 'Full control. Compose chat UI with individual components and custom slots.',
    code: `<TrChat.Root :response-provider="responseProvider">
  <TrChat.Header title="Custom Header" show-history />
  <TrChat.Welcome :title="title" :prompts="prompts" />
  <TrChat.MessageList>
    <template #after="{ role }">
      <TrChatFeedback v-if="role === 'assistant'" />
    </template>
  </TrChat.MessageList>
  <TrChat.Footer>
    <TrChat.Sender />
  </TrChat.Footer>
  <TrChat.History />
</TrChat.Root>`,
  },
}
