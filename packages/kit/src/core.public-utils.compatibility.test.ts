import { describe, expect, it } from 'vitest'
import { AIClient, extractTextFromResponse, formatMessages } from './core'
import {
  AIClient as rootAIClient,
  extractTextFromResponse as rootExtractTextFromResponse,
  formatMessages as rootFormatMessages,
} from './index'

describe('root and core public helper compatibility', () => {
  it('uses the same class and functions for both public entries', () => {
    expect(AIClient).toBe(rootAIClient)
    expect(extractTextFromResponse).toBe(rootExtractTextFromResponse)
    expect(formatMessages).toBe(rootFormatMessages)
  })
})
