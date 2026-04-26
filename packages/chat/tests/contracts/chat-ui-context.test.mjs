import { fileURLToPath } from 'node:url'
import { effectScope, nextTick, ref } from 'vue'
import createJiti from 'jiti'
import { assert, runTest } from '../_helpers.mjs'

const jiti = createJiti(import.meta.url, {
  alias: {
    '@': fileURLToPath(new URL('../../src', import.meta.url)),
  },
})

const { createChatUiContext } = await jiti.import('../../src/shared/context/chatUiContext.ts')

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

await runTest('createChatUiContext reactively syncs shell config changes without overwriting manual state on unrelated updates', async () => {
  const shell = ref({
    variant: 'stacked',
    leftRegion: {
      defaultOpen: true,
      collapseMode: 'rail',
      width: 272,
    },
    rightRegion: {
      defaultOpen: false,
      collapseMode: 'hidden',
      width: 420,
    },
  })

  const scope = effectScope()

  try {
    const chatUi = scope.run(() =>
      createChatUiContext({
        shell,
      }),
    )

    assert.ok(chatUi)
    assert.equal(chatUi.workspace.enabled.value, false)

    shell.value = {
      variant: 'workspace',
      leftRegion: {
        defaultOpen: false,
        collapseMode: 'rail',
        width: 320,
      },
      rightRegion: {
        defaultOpen: true,
        collapseMode: 'hidden',
        width: 480,
      },
    }
    await nextTick()

    assert.equal(chatUi.workspace.enabled.value, true)
    assert.equal(chatUi.workspace.left.collapsed.value, true)
    assert.equal(chatUi.workspace.left.visible.value, true)
    assert.equal(chatUi.workspace.left.width.value, 320)
    assert.equal(chatUi.workspace.right.collapsed.value, false)
    assert.equal(chatUi.workspace.right.visible.value, true)
    assert.equal(chatUi.workspace.right.width.value, 480)

    chatUi.workspace.left.expand()
    shell.value = {
      ...shell.value,
      leftRegion: {
        ...shell.value.leftRegion,
        width: 360,
      },
    }
    await nextTick()

    assert.equal(chatUi.workspace.left.collapsed.value, false)
    assert.equal(chatUi.workspace.left.visible.value, true)
    assert.equal(chatUi.workspace.left.width.value, 360)

    shell.value = {
      ...shell.value,
      leftRegion: {
        ...shell.value.leftRegion,
        defaultOpen: true,
      },
    }
    await nextTick()

    assert.equal(chatUi.workspace.left.collapsed.value, false)
    assert.equal(chatUi.workspace.left.visible.value, true)
  } finally {
    scope.stop()
  }
})
