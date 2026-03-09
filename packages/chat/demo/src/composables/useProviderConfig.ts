import { computed } from 'vue'
import { createOpenAIProvider, createDeepSeekProvider } from '@opentiny/tiny-robot-chat'
import type { ResponseProvider } from '@opentiny/tiny-robot-chat'

const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || ''
const deepseekApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || ''

export function useProviderConfig(selectedModel: { value: string }) {
  const responseProvider = computed<ResponseProvider>(() => {
    if (selectedModel.value.includes('gpt')) {
      if (!openaiApiKey) {
        return async () => {
          throw new Error('OpenAI API key not configured. Set VITE_OPENAI_API_KEY in .env')
        }
      }
      return createOpenAIProvider({
        apiKey: openaiApiKey,
        model: selectedModel.value || 'gpt-4o',
        systemPrompt: 'You are a helpful assistant.',
      })
    } else {
      if (!deepseekApiKey) {
        return async () => {
          throw new Error('DeepSeek API key not configured. Set VITE_DEEPSEEK_API_KEY in .env')
        }
      }
      return createDeepSeekProvider({
        apiKey: deepseekApiKey,
        model: selectedModel.value || 'deepseek-chat',
        systemPrompt: 'You are a helpful assistant.',
      })
    }
  })

  const apiKeyStatus = computed(() => ({
    isOpenAI: selectedModel.value.includes('gpt'),
    hasKey: selectedModel.value.includes('gpt') ? !!openaiApiKey : !!deepseekApiKey,
  }))

  return {
    responseProvider,
    apiKeyStatus,
    openaiApiKey,
    deepseekApiKey,
  }
}
