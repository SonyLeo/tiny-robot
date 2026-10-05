import { describe, expect, it } from 'vitest'
import * as core from '../../core'
import * as root from '../../index'
import { createNativeMessageAdapter, createVueMessageAdapter } from '../adapters'
import { useMessage } from '../../vue/message/useMessage'
import { IndexedDBStrategy, LocalStorageStrategy } from '../../storage'

describe('message public exports', () => {
  it('keeps the core entry limited to the native adapter', () => {
    expect(core.createNativeMessageAdapter).toBe(createNativeMessageAdapter)
    expect(core).not.toHaveProperty('createVueMessageAdapter')
  })

  it('keeps the root Vue composable and existing Vue adapter barrel reachable', () => {
    expect(root.useMessage).toBe(useMessage)
    expect(root).not.toHaveProperty('createVueMessageAdapter')
    expect(createVueMessageAdapter).toBeTypeOf('function')
  })

  it('exposes framework-neutral transport, providers, and storage from core', () => {
    expect(core.BaseModelProvider).toBeTypeOf('function')
    expect(core.OpenAIProvider).toBeTypeOf('function')
    expect(core.handleSSEStream).toBeTypeOf('function')
    expect(core.sseStreamToGenerator).toBeTypeOf('function')
    expect(core.LocalStorageStrategy).toBe(LocalStorageStrategy)
    expect(core.IndexedDBStrategy).toBe(IndexedDBStrategy)
    expect(core.localStorageStrategyFactory).toBeTypeOf('function')
    expect(core.indexedDBStorageStrategyFactory).toBeTypeOf('function')
  })
})
