/**
 * Stage 6 unit test coverage:
 *   6.8 chatUiContext workspace region state management
 */
import { fileURLToPath } from 'node:url'
import createJiti from 'jiti'
import { effectScope, nextTick, ref } from 'vue'
import { assert, runTest } from '../_helpers.mjs'

const jiti = createJiti(import.meta.url, {
  alias: {
    '@': fileURLToPath(new URL('../../src', import.meta.url)),
  },
})

const { createChatUiContext } = await jiti.import('../../src/shared/context/chatUiContext.ts')

// ---------------------------------------------------------------------------
// 6.8  workspace region open/close/toggle/collapse/expand
// ---------------------------------------------------------------------------

await runTest('createChatUiContext workspace left region open/close/toggle/collapse/expand in workspace mode', async () => {
  const scope = effectScope()

  try {
    const chatUi = scope.run(() =>
      createChatUiContext({
        shell: {
          variant: 'workspace',
          leftRegion: { defaultOpen: true, collapseMode: 'rail' },
        },
      }),
    )

    // Initial state: open
    assert.equal(chatUi.workspace.left.visible.value, true)
    assert.equal(chatUi.workspace.left.collapsed.value, false)

    // close
    chatUi.workspace.left.close()
    assert.equal(chatUi.workspace.left.visible.value, false)

    // open
    chatUi.workspace.left.open()
    assert.equal(chatUi.workspace.left.visible.value, true)
    assert.equal(chatUi.workspace.left.collapsed.value, false)

    // collapse (rail mode keeps visible=true)
    chatUi.workspace.left.collapse()
    assert.equal(chatUi.workspace.left.collapsed.value, true)
    assert.equal(chatUi.workspace.left.visible.value, true)

    // expand
    chatUi.workspace.left.expand()
    assert.equal(chatUi.workspace.left.collapsed.value, false)
    assert.equal(chatUi.workspace.left.visible.value, true)

    // toggle: visible → hidden
    chatUi.workspace.left.toggle()
    assert.equal(chatUi.workspace.left.visible.value, false)

    // toggle: hidden → visible
    chatUi.workspace.left.toggle()
    assert.equal(chatUi.workspace.left.visible.value, true)
    assert.equal(chatUi.workspace.left.collapsed.value, false)
  } finally {
    scope.stop()
  }
})

await runTest('createChatUiContext workspace right region open/close/toggle in workspace mode', async () => {
  const scope = effectScope()

  try {
    const chatUi = scope.run(() =>
      createChatUiContext({
        shell: {
          variant: 'workspace',
          rightRegion: { defaultOpen: false, collapseMode: 'hidden' },
        },
      }),
    )

    // Initial state: closed
    assert.equal(chatUi.workspace.right.visible.value, false)

    // open
    chatUi.workspace.right.open()
    assert.equal(chatUi.workspace.right.visible.value, true)
    assert.equal(chatUi.workspace.right.collapsed.value, false)

    // close
    chatUi.workspace.right.close()
    assert.equal(chatUi.workspace.right.visible.value, false)

    // toggle: closed → open
    chatUi.workspace.right.toggle()
    assert.equal(chatUi.workspace.right.visible.value, true)

    // toggle: open → closed
    chatUi.workspace.right.toggle()
    assert.equal(chatUi.workspace.right.visible.value, false)
  } finally {
    scope.stop()
  }
})

await runTest('createChatUiContext setResponsiveHost with narrow container sets isMobile to true', async () => {
  const previousWindow = globalThis.window
  const previousResizeObserver = globalThis.ResizeObserver
  const resizeObservers = []

  globalThis.window = {
    matchMedia: () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  }

  class ResizeObserverMock {
    constructor(callback) {
      this.callback = callback
      resizeObservers.push(this)
    }
    observe(element) { this.element = element }
    disconnect() { this.element = null }
  }

  globalThis.ResizeObserver = ResizeObserverMock

  const scope = effectScope()

  try {
    const chatUi = scope.run(() =>
      createChatUiContext({
        shell: { variant: 'workspace' },
        mobileBreakpoint: '(max-width: 900px)',
      }),
    )

    assert.equal(chatUi.workspace.isMobile.value, false)

    // Narrow host (≤ 900px)
    const narrowHost = {
      getBoundingClientRect: () => ({ width: 600 }),
    }
    chatUi.workspace.setResponsiveHost(narrowHost)
    assert.equal(chatUi.workspace.isMobile.value, true)

    // Wide host (> 900px)
    const wideHost = {
      getBoundingClientRect: () => ({ width: 1200 }),
    }
    chatUi.workspace.setResponsiveHost(wideHost)
    resizeObservers.at(-1)?.callback()
    assert.equal(chatUi.workspace.isMobile.value, false)
  } finally {
    scope.stop()
    globalThis.window = previousWindow
    globalThis.ResizeObserver = previousResizeObserver
  }
})

await runTest('createChatUiContext shell collapseMode change syncs region state', async () => {
  const shell = ref({
    variant: 'workspace',
    leftRegion: { defaultOpen: false, collapseMode: 'rail' },
  })

  const scope = effectScope()

  try {
    const chatUi = scope.run(() => createChatUiContext({ shell }))

    // With rail mode and defaultOpen=false: collapsed=true, visible=true
    assert.equal(chatUi.workspace.left.collapsed.value, true)
    assert.equal(chatUi.workspace.left.visible.value, true)

    // Switch to hidden collapseMode
    shell.value = {
      variant: 'workspace',
      leftRegion: { defaultOpen: false, collapseMode: 'hidden' },
    }
    await nextTick()

    // With hidden mode and collapsed: visible should be false
    assert.equal(chatUi.workspace.left.collapseMode.value, 'hidden')
    assert.equal(chatUi.workspace.left.visible.value, false)
  } finally {
    scope.stop()
  }
})
