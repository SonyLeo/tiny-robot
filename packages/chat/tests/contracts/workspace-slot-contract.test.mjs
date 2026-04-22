import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { runTest } from '../_harness.mjs'

const chatSource = readFileSync(fileURLToPath(new URL('../../src/components/core/Chat.vue', import.meta.url)), 'utf8')
const defaultRendererSource = readFileSync(
  fileURLToPath(new URL('../../src/components/core/default-renderer/ChatDefaultRenderer.vue', import.meta.url)),
  'utf8',
)
const chatPageSource = readFileSync(fileURLToPath(new URL('../../src/page/TrChatPage.vue', import.meta.url)), 'utf8')
const workspaceLayoutSource = readFileSync(
  fileURLToPath(new URL('../../src/components/workspace/ChatWorkspaceLayout.vue', import.meta.url)),
  'utf8',
)
const workspaceLeftSheetSource = readFileSync(
  fileURLToPath(new URL('../../src/components/workspace/ChatWorkspaceLeftSheet.vue', import.meta.url)),
  'utf8',
)
const workspaceRightSheetSource = readFileSync(
  fileURLToPath(new URL('../../src/components/workspace/ChatWorkspaceRightSheet.vue', import.meta.url)),
  'utf8',
)

await runTest('TrChat blackbox keeps workspace panel-level slot names aligned with the whitebox layout', async () => {
  assert.equal(chatSource.includes('<template v-for="(_, name) in slots" #[name]="slotProps" :key="name">'), true)
  assert.equal(chatSource.includes('<slot :name="name" v-bind="slotProps ?? {}" />'), true)
  assert.equal(defaultRendererSource.includes('<TrChatPage'), true)

  const panelSlots = [
    '<template v-if="$slots.left" #left>',
    `<template v-if="$slots['left-rail']" #left-rail>`,
    '<template v-if="$slots.right" #right>',
    `<template v-if="$slots['mobile-left']" #mobile-left>`,
    `<template v-if="$slots['mobile-right']" #mobile-right>`,
  ]

  panelSlots.forEach((templateToken) => {
    assert.equal(chatPageSource.includes(templateToken), true)
  })
})

await runTest('workspace mobile-left slot falls back to left when mobile-left is not provided', async () => {
  assert.equal(
    workspaceLayoutSource.includes('<ChatWorkspaceLeftSheet :appearance="resolvedAppearance" :sidebar-title="props.sidebarTitle">'),
    true,
  )
  assert.equal(workspaceLayoutSource.includes(`<slot v-if="$slots['mobile-left']" name="mobile-left" />`), true)
  assert.equal(workspaceLayoutSource.includes(`<slot v-else-if="$slots.left" name="left" />`), true)
})

await runTest('workspace mobile containers retain explicit owner inputs for sidebar and sheet fallback content', async () => {
  assert.equal(chatPageSource.includes(':sidebar-title="headerInput?.title"'), true)
  assert.equal(workspaceLayoutSource.includes('<slot name="left">'), true)
  assert.equal(workspaceLayoutSource.includes('<ChatWorkspaceSidebar :mobile="false" :title="props.sidebarTitle" />'), true)
  assert.equal(workspaceLayoutSource.includes('<slot name="right">'), true)
  assert.equal(workspaceLayoutSource.includes('<ChatWorkspaceRightPanel :mobile="false" />'), true)
  assert.equal(workspaceLayoutSource.includes('<ChatWorkspaceRightSheet :appearance="resolvedAppearance">'), true)
  assert.equal(workspaceLayoutSource.includes('CHAT_RUNTIME_KEY'), true)
  assert.equal(
    workspaceLayoutSource.includes('const resolvedShell = computed(() => props.shell ?? runtimeShell.value)'),
    true,
  )
  assert.equal(workspaceLayoutSource.includes('const resolvedAppearance = computed(() => props.appearance)'), true)
  assert.equal(workspaceLeftSheetSource.includes('const slotContainsSidebar = computed('), true)
  assert.equal(workspaceLeftSheetSource.includes('const appearance = computed(() => props.appearance)'), true)
  assert.equal(workspaceLeftSheetSource.includes('<ChatWorkspaceSidebar v-else mobile :title="props.sidebarTitle">'), true)
  assert.equal(workspaceRightSheetSource.includes('const slotContainsRightPanel = computed('), true)
  assert.equal(workspaceRightSheetSource.includes('const appearance = computed(() => props.appearance)'), true)
  assert.equal(workspaceRightSheetSource.includes('<ChatWorkspaceRightPanel v-else mobile>'), true)
  assert.equal(workspaceLeftSheetSource.includes('useChatScaffoldContext'), false)
  assert.equal(workspaceRightSheetSource.includes('useChatScaffoldContext'), false)
  assert.equal(workspaceLayoutSource.includes('useChatScaffoldContext'), false)
  assert.equal(workspaceLayoutSource.includes('presetSlices.value.shell.shell'), false)
  assert.equal(workspaceLayoutSource.includes('presetSlices.value.appearance.appearance'), false)
})

