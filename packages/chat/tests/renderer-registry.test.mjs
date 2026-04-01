import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createChatAdapterFromConfig, createPresetChatProps, createPresetChatSlices, runTest } from './_helpers.mjs'

const defaultBubbleConfigSource = readFileSync(
  fileURLToPath(new URL('../src/composables/useDefaultBubbleConfig.ts', import.meta.url)),
  'utf8',
)
const chatLayoutSource = readFileSync(fileURLToPath(new URL('../src/components/chat/ChatLayout.vue', import.meta.url)), 'utf8')

await runTest('renderer registry source contract keeps bubble renderer extension hooks in the chat layout chain', async () => {
  assert.equal(defaultBubbleConfigSource.includes('extraContentMatches'), true)
  assert.equal(defaultBubbleConfigSource.includes('extraBoxMatches'), true)
  assert.equal(chatLayoutSource.includes('bubbleRenderers'), true)
  assert.equal(chatLayoutSource.includes('contentMatches'), true)
  assert.equal(chatLayoutSource.includes('boxMatches'), true)
})

await runTest('createPresetChatSlices projects bubble renderers through the layout slice', async () => {
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

  const adapter = createChatAdapterFromConfig({
    models: [{ id: 'gpt-4o-mini', providerId: 'openai' }],
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat',
      },
    },
  })

  const presetProps = createPresetChatProps(adapter, {
    bubbleRenderers: {
      contentMatches: [customContentMatch],
      boxMatches: [customBoxMatch],
    },
  })
  const slices = createPresetChatSlices(presetProps)

  assert.equal(slices.layout.bubbleRenderers?.contentMatches?.[0], customContentMatch)
  assert.equal(slices.layout.bubbleRenderers?.boxMatches?.[0], customBoxMatch)
})
