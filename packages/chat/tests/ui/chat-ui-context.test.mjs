import { fileURLToPath } from 'node:url'
import { effectScope } from 'vue'
import createJiti from 'jiti'
import { assert, runTest } from '../_helpers.mjs'

const jiti = createJiti(import.meta.url, {
  alias: {
    '@': fileURLToPath(new URL('../../src', import.meta.url)),
  },
})

const { createChatUiContext } = await jiti.import('../../src/chatUiContext.ts')

await runTest('createChatUiContext treats a narrow workspace host as mobile even on desktop viewport', async () => {
  const previousWindow = globalThis.window
  const previousResizeObserver = globalThis.ResizeObserver
  const listeners = new Set()
  const resizeObservers = []

  const mediaQueryList = {
    matches: false,
    addEventListener(_event, listener) {
      listeners.add(listener)
    },
    removeEventListener(_event, listener) {
      listeners.delete(listener)
    },
  }

  class ResizeObserverMock {
    constructor(callback) {
      this.callback = callback
      this.element = null
      resizeObservers.push(this)
    }

    observe(element) {
      this.element = element
    }

    disconnect() {
      this.element = null
    }
  }

  globalThis.window = {
    matchMedia: () => mediaQueryList,
  }
  globalThis.ResizeObserver = ResizeObserverMock

  const host = {
    width: 760,
    getBoundingClientRect() {
      return { width: this.width }
    },
  }

  const scope = effectScope()

  try {
    const chatUi = scope.run(() =>
      createChatUiContext({
        shell: {
          variant: 'workspace',
        },
      }),
    )

    assert.ok(chatUi)
    assert.equal(chatUi.workspace.isMobile.value, false)

    chatUi.workspace.setResponsiveHost(host)
    assert.equal(chatUi.workspace.isMobile.value, true)

    host.width = 1180
    resizeObservers[0]?.callback()
    assert.equal(chatUi.workspace.isMobile.value, false)

    mediaQueryList.matches = true
    listeners.forEach((listener) => listener(mediaQueryList))
    assert.equal(chatUi.workspace.isMobile.value, true)
  } finally {
    scope.stop()
    globalThis.window = previousWindow
    globalThis.ResizeObserver = previousResizeObserver
  }
})

