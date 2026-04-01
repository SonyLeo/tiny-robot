import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { runTest } from '../_harness.mjs'

const chatSource = readFileSync(fileURLToPath(new URL('../../src/components/core/Chat.vue', import.meta.url)), 'utf8')
const defaultRendererSource = readFileSync(
  fileURLToPath(new URL('../../src/components/core/default-renderer/ChatDefaultRenderer.vue', import.meta.url)),
  'utf8',
)
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

  const panelSlots = [
    '<template v-if="$slots.left" #left>',
    `<template v-if="$slots['left-rail']" #left-rail>`,
    '<template v-if="$slots.right" #right>',
    `<template v-if="$slots['mobile-left']" #mobile-left>`,
    `<template v-if="$slots['mobile-right']" #mobile-right>`,
  ]

  panelSlots.forEach((templateToken) => {
    assert.equal(defaultRendererSource.includes(templateToken), true)
  })
})

await runTest('workspace mobile-left slot falls back to left when mobile-left is not provided', async () => {
  assert.equal(workspaceLayoutSource.includes('<ChatWorkspaceLeftSheet>'), true)
  assert.equal(workspaceLayoutSource.includes(`<slot v-if="$slots['mobile-left']" name="mobile-left" />`), true)
  assert.equal(workspaceLayoutSource.includes(`<slot v-else-if="$slots.left" name="left" />`), true)
})

await runTest('workspace mobile containers retain default sidebar and right panel fallback content when slots are absent', async () => {
  assert.equal(workspaceLayoutSource.includes('<slot name="left">'), true)
  assert.equal(workspaceLayoutSource.includes('<ChatWorkspaceSidebar :mobile="false" />'), true)
  assert.equal(workspaceLayoutSource.includes('<slot name="right">'), true)
  assert.equal(workspaceLayoutSource.includes('<ChatWorkspaceRightPanel :mobile="false" />'), true)
  assert.equal(workspaceLeftSheetSource.includes('const slotContainsSidebar = computed('), true)
  assert.equal(workspaceLeftSheetSource.includes('<ChatWorkspaceSidebar v-else mobile>'), true)
  assert.equal(workspaceRightSheetSource.includes('const slotContainsRightPanel = computed('), true)
  assert.equal(workspaceRightSheetSource.includes('<ChatWorkspaceRightPanel v-else mobile>'), true)
})

