import { describe, expect, it } from 'vitest'
import * as core from '../../core'
import * as root from '../../index'
import { createNativeMessageAdapter, createVueMessageAdapter } from '../adapters'
import { useMessage } from '../../vue/message/useMessage'
import { BaseModelProvider, OpenAIProvider, handleSSEStream, sseStreamToGenerator } from '../../core'
import { IndexedDBStrategy, LocalStorageStrategy, indexedDBStorageStrategyFactory, localStorageStrategyFactory } from '../../storage'

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
    expect(BaseModelProvider).toBeTypeOf('function')
    expect(OpenAIProvider).toBeTypeOf('function')
    expect(handleSSEStream).toBeTypeOf('function')
    expect(sseStreamToGenerator).toBeTypeOf('function')
    expect(LocalStorageStrategy).toBeTypeOf('function')
    expect(IndexedDBStrategy).toBeTypeOf('function')
    expect(localStorageStrategyFactory).toBeTypeOf('function')
    expect(indexedDBStorageStrategyFactory).toBeTypeOf('function')
  })
})
