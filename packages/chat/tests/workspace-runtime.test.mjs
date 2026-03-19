import {
  assert,
  coerceWorkspacePanelId,
  findWorkspacePanelById,
  resolveWorkspaceCollapsedState,
  resolveWorkspaceRegionWidth,
  runTest,
  toWorkspacePanelHostItems,
} from './_helpers.mjs'

await runTest('workspace runtime resolves region width tokens and numeric widths predictably', async () => {
  assert.equal(resolveWorkspaceRegionWidth('sm', 'left'), '220px')
  assert.equal(resolveWorkspaceRegionWidth('md', 'left'), '248px')
  assert.equal(resolveWorkspaceRegionWidth('lg', 'right'), '286px')
  assert.equal(resolveWorkspaceRegionWidth(320, 'left'), '320px')
  assert.equal(resolveWorkspaceRegionWidth(undefined, 'left'), '248px')
  assert.equal(resolveWorkspaceRegionWidth(undefined, 'right'), '286px')
})

await runTest('workspace runtime keeps collapsed state controlled-safe and non-collapsible-safe', async () => {
  assert.equal(
    resolveWorkspaceCollapsedState({
      collapsible: false,
      controlledCollapsed: true,
      uncontrolledCollapsed: true,
    }),
    false,
  )

  assert.equal(
    resolveWorkspaceCollapsedState({
      collapsible: true,
      controlledCollapsed: true,
      uncontrolledCollapsed: false,
    }),
    true,
  )

  assert.equal(
    resolveWorkspaceCollapsedState({
      collapsible: true,
      controlledCollapsed: undefined,
      uncontrolledCollapsed: true,
    }),
    true,
  )
})

await runTest('workspace runtime maps panel definitions into host items with stable label fallback order', async () => {
  const items = toWorkspacePanelHostItems([
    { id: 'history', label: 'History', description: 'Conversation timeline' },
    { id: 'sources', title: 'Sources title', description: 'Attached references' },
    { id: 'pinned' },
  ])

  assert.deepEqual(items, [
    { id: 'history', label: 'History', description: 'Conversation timeline' },
    { id: 'sources', label: 'Sources title', description: 'Attached references' },
    { id: 'pinned', label: 'pinned', description: undefined },
  ])
})

await runTest('workspace runtime coerces active panel ids back to a valid panel and can find panel metadata by id', async () => {
  const panels = [
    { id: 'history', label: 'History' },
    { id: 'mcp', label: 'MCP' },
    { id: 'outline', label: 'Outline' },
  ]

  assert.equal(
    coerceWorkspacePanelId({
      items: panels,
      requestedId: 'mcp',
      fallbackId: 'history',
    }),
    'mcp',
  )

  assert.equal(
    coerceWorkspacePanelId({
      items: panels,
      requestedId: 'missing',
      fallbackId: 'outline',
    }),
    'outline',
  )

  assert.equal(
    coerceWorkspacePanelId({
      items: panels,
      requestedId: 'missing',
      fallbackId: 'also-missing',
    }),
    'history',
  )

  assert.deepEqual(findWorkspacePanelById(panels, 'outline'), panels[2])
  assert.equal(findWorkspacePanelById(panels, 'missing'), undefined)
})
