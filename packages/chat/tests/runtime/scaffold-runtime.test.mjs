import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import createJiti from 'jiti'
import { runTest } from '../_harness.mjs'

const jiti = createJiti(import.meta.url, {
  alias: {
    '@': fileURLToPath(new URL('../../src', import.meta.url)),
  },
})

const scaffoldRuntimeModule = await jiti.import('../../src/helpers/scaffoldRuntime.ts')

const {
  resolveScaffoldInitialModelValue,
  findScaffoldModelByValue,
  createScaffoldResponseProvider,
  shouldManageScaffoldResponseProvider,
  createScaffoldPresetOverrides,
  collectScaffoldNamedSlots,
} = scaffoldRuntimeModule

const models = [
  { value: 'openai-test', label: 'OpenAI Test', providerId: 'openai' },
  { value: 'deepseek-test', label: 'DeepSeek Test', providerId: 'deepseek' },
]

await runTest('resolveScaffoldInitialModelValue keeps adapter-owned model priority', async () => {
  assert.equal(resolveScaffoldInitialModelValue({ models: [], defaultModel: 'x', selectedModel: 'x' }), '')
  assert.equal(
    resolveScaffoldInitialModelValue({
      models,
      defaultModel: 'openai-test',
      selectedModel: 'deepseek-test',
    }),
    'deepseek-test',
  )
  assert.equal(
    resolveScaffoldInitialModelValue({
      models,
      defaultModel: 'openai-test',
      selectedModel: 'missing-model',
    }),
    'openai-test',
  )
  assert.equal(
    resolveScaffoldInitialModelValue({
      models,
      defaultModel: undefined,
      selectedModel: undefined,
    }),
    'openai-test',
  )
})

await runTest('findScaffoldModelByValue finds models by value without extra runtime semantics', async () => {
  assert.equal(findScaffoldModelByValue(models, 'deepseek-test')?.providerId, 'deepseek')
  assert.equal(findScaffoldModelByValue(models, 'missing-model'), undefined)
})

await runTest('createScaffoldResponseProvider resolves model fallback in adapter order', async () => {
  const calledWith = []
  const provider = async function* () {}
  const adapter = {
    createResponseProvider(modelValue) {
      calledWith.push(modelValue)
      return provider
    },
  }

  const selectedProvider = createScaffoldResponseProvider({
    adapter,
    models,
    defaultModel: 'openai-test',
    modelValue: 'deepseek-test',
  })
  assert.equal(selectedProvider, provider)
  assert.deepEqual(calledWith, ['deepseek-test'])

  createScaffoldResponseProvider({
    adapter,
    models,
    defaultModel: 'openai-test',
    modelValue: 'missing-model',
  })
  createScaffoldResponseProvider({
    adapter,
    models,
    defaultModel: undefined,
    modelValue: undefined,
  })

  assert.deepEqual(calledWith, ['deepseek-test', 'openai-test', 'openai-test'])
})

await runTest('createScaffoldResponseProvider throws when no models are available', async () => {
  const adapter = {
    createResponseProvider() {
      return async function* () {}
    },
  }

  assert.throws(
    () =>
      createScaffoldResponseProvider({
        adapter,
        models: [],
      }),
    /\[TrChatScaffold\] No models available to create response provider/,
  )
})

await runTest('shouldManageScaffoldResponseProvider preserves externally provided chatKit providers', async () => {
  assert.equal(shouldManageScaffoldResponseProvider(), true)
  assert.equal(shouldManageScaffoldResponseProvider({}), true)
  assert.equal(shouldManageScaffoldResponseProvider({ chatKit: { id: 'external-kit' } }), false)
})

await runTest('createScaffoldPresetOverrides keeps adapter-driven model fields and runtime callback priority', async () => {
  const callbackMcpManager = { id: 'callback-manager' }
  const callbackAction = () => {}
  const callbackModelChange = () => {}
  const presetAction = () => {}
  const presetModelChange = () => {}

  const overrides = createScaffoldPresetOverrides({
    presetOverrides: {
      placeholder: 'preset-placeholder',
      onMessageAction: presetAction,
      onModelChange: presetModelChange,
      mcpManager: { id: 'preset-manager' },
      models: [{ value: 'should-not-win', providerId: 'x' }],
      defaultModel: 'should-not-win',
    },
    models,
    currentModel: 'deepseek-test',
    defaultModel: 'openai-test',
    runtime: {
      mcpManager: callbackMcpManager,
    },
    callbacks: {
      onMessageAction: callbackAction,
      onModelChange: callbackModelChange,
    },
  })

  assert.equal(overrides.placeholder, 'preset-placeholder')
  assert.equal(overrides.models, models)
  assert.equal(overrides.defaultModel, 'deepseek-test')
  assert.equal(overrides.mcpManager, callbackMcpManager)
  assert.equal(overrides.onMessageAction, callbackAction)
  assert.equal(overrides.onModelChange, callbackModelChange)
})

await runTest('collectScaffoldNamedSlots keeps non-default named slots only', async () => {
  const titleSlot = () => null
  const footerSlot = () => null
  const namedSlots = collectScaffoldNamedSlots({
    default: () => null,
    title: titleSlot,
    footer: footerSlot,
    empty: undefined,
  })

  assert.deepEqual(Object.keys(namedSlots).sort(), ['footer', 'title'])
  assert.equal(namedSlots.title, titleSlot)
  assert.equal(namedSlots.footer, footerSlot)
})

