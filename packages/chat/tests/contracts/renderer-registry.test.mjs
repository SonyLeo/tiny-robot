import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createRuntimeFromConfig, runTest } from '../_helpers.mjs'

const defaultBubbleConfigSource = readFileSync(
  fileURLToPath(new URL('../../src/components/core/useDefaultBubbleConfig.ts', import.meta.url)),
  'utf8',
)
const chatLayoutSource = readFileSync(fileURLToPath(new URL('../../src/components/core/ChatLayout.vue', import.meta.url)), 'utf8')

await runTest('renderer registry source contract keeps bubble renderer extension hooks in the chat layout chain', async () => {
  assert.equal(defaultBubbleConfigSource.includes('extraContentMatches'), true)
  assert.equal(defaultBubbleConfigSource.includes('extraBoxMatches'), true)
  assert.equal(chatLayoutSource.includes('bubbleRenderers'), true)
  assert.equal(chatLayoutSource.includes('contentMatches'), true)
  assert.equal(chatLayoutSource.includes('boxMatches'), true)
})

await runTest('ChatLayout source treats explicit bubbleRenderers as authoritative before page-input fallback', async () => {
  assert.equal(chatLayoutSource.includes('const resolvedBubbleRenderers = computed<ChatBubbleRenderers | undefined>('), true)
  assert.equal(
    chatLayoutSource.includes('props.bubbleRenderers ?? chatRuntime?.message.config?.renderers ?? layoutInput.value?.bubbleRenderers'),
    true,
  )
  assert.equal(chatLayoutSource.includes('...(layoutInput.value?.bubbleRenderers?.contentMatches ?? [])'), false)
  assert.equal(chatLayoutSource.includes('...(layoutInput.value?.bubbleRenderers?.boxMatches ?? [])'), false)
})

await runTest('createRuntimeFromConfig keeps bubble renderers on the runtime-owned message config', async () => {
  const customContentMatch = {
    find: (_message, content) => content?.type === 'text' && content.text?.startsWith('[card]'),
    renderer: { name: 'ProjectedContentRenderer' },
    priority: -2,
  }
  const customBoxMatch = {
    find: (messages, content) =>
      messages.length === 1 &&
      messages[0]?.role === 'assistant' &&
      content?.type === 'text' &&
      Boolean(content.text?.startsWith('[card]')),
    renderer: { name: 'ProjectedBoxRenderer' },
    priority: -2,
    attributes: {
      'data-registry-box': 'projected',
    },
  }

  const { runtime } = createRuntimeFromConfig({
    request: {
      models: [{ id: 'gpt-4o-mini', providerId: 'openai' }],
      transport: {
        type: 'openai-compatible',
        endpoint: '/api/chat',
      },
    },
    messages: {
      renderers: {
        contentMatches: [customContentMatch],
        boxMatches: [customBoxMatch],
      },
    },
  })

  assert.equal(runtime.message?.config?.renderers?.contentMatches?.[0], customContentMatch)
  assert.equal(runtime.message?.config?.renderers?.boxMatches?.[0], customBoxMatch)
})
