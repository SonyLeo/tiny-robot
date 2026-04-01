import {
  assert,
  CHAT_CAPABILITY_MANIFEST,
  CHAT_CLI_CONSUMABLE_FEATURE_KEYS,
  CHAT_CLI_CONSUMABLE_PRESET_PROP_KEYS,
  CHAT_CLI_CONSUMABLE_PRESET_SLICE_KEYS,
  createChatCapabilityManifest,
  runTest,
} from '../_helpers.mjs'

await runTest('createChatCapabilityManifest exposes the current stable external metadata surface', async () => {
  const manifest = createChatCapabilityManifest()

  assert.equal(manifest.schemaVersion, 1)
  assert.deepEqual(manifest.featureKeys, CHAT_CLI_CONSUMABLE_FEATURE_KEYS)
  assert.deepEqual(manifest.presetPropKeys, CHAT_CLI_CONSUMABLE_PRESET_PROP_KEYS)
  assert.deepEqual(manifest.presetSliceKeys, CHAT_CLI_CONSUMABLE_PRESET_SLICE_KEYS)

  assert.deepEqual(
    manifest.skillPacks.map((entry) => entry.id),
    ['conversation-core', 'docs-layout', 'tool-agent-core'],
  )

  assert.deepEqual(
    manifest.presets.map((entry) => entry.id),
    ['assistant-base', 'docs-reader', 'tool-agent'],
  )
  assert.deepEqual(manifest.presets.find((entry) => entry.id === 'tool-agent')?.skills, ['tool-agent-core'])
  assert.deepEqual(manifest.presets.find((entry) => entry.id === 'docs-reader')?.extends, ['assistant-base'])
})

await runTest('CHAT_CAPABILITY_MANIFEST exports the default manifest instance', async () => {
  assert.deepEqual(CHAT_CAPABILITY_MANIFEST, createChatCapabilityManifest())
})

