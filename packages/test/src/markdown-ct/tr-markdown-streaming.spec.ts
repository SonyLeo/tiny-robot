import { expect, test } from '@playwright/experimental-ct-vue'
import type { Locator } from '@playwright/test'
import { trMarkdownStreamingFixtures } from '../../../components/src/markdown/fixtures/streaming'
import TrMarkdownStory from './TrMarkdown.story.vue'

type StreamSnapshot = {
  active: boolean
  blockCount: number
  hardReset: boolean
  mode: string
  parseCount: number
  pendingCount: number
  profilerEnabled: boolean
  profilerEventCount: number
  queueLength: number
  resetCount: number
  rewriteCount: number
  skippedNodeCount: number
  updateKind: string
}

type StreamProfilerDebug = {
  blockCommitCount: number
  finalizeCount: number
  rootCommitCount: number
  tokenScheduleCount: number
}

const readJsonDataset = async <T>(root: Locator, key: string) => {
  const raw = await root.getAttribute(key)
  return raw ? (JSON.parse(raw) as T) : null
}

const readStreamSnapshot = (root: Locator) => readJsonDataset<StreamSnapshot>(root, 'data-stream-snapshot')
const readStreamProfilerDebug = (root: Locator) =>
  readJsonDataset<StreamProfilerDebug>(root, 'data-stream-profiler-debug')

const getScenario = (id: string) => {
  const scenario = trMarkdownStreamingFixtures.find((item) => item.id === id)

  if (!scenario) {
    throw new Error(`Missing streaming fixture: ${id}`)
  }

  return scenario
}

const basicStreaming = {
  active: true,
  enabled: true,
  showCursor: true,
  showTail: true,
  smoothingChars: 48,
} as const

const smoothingStreaming = {
  ...basicStreaming,
  smoothingChars: 120,
} as const

const animatedStreaming = {
  active: true,
  enabled: true,
  mode: 'animated',
  preset: 'balanced',
  profile: {
    enabled: true,
    label: 'tiny-robot-ct',
    maxEvents: 64,
  },
  showCursor: true,
  showTail: true,
  smoothingChars: 64,
} as const

const skipMatrixInitial = `## Skip matrix repro
`

const skipMatrixMixed = `## Skip matrix repro

Animated paragraph text should reveal progressively while code, table and image stay on their own non-character-animation paths.

![TinyRobot logo](https://img.example.com/tiny-robot.png)

| Name | Type |
| --- | --- |
| retryCount | number |

\`\`\`ts
const skip = true
console.log(skip)
\`\`\`
`

const hardResetParagraph = `## Hard reset repro

This paragraph is intentionally replaced by a list so the block structure changes.
`

const hardResetList = `## Hard reset repro

- The paragraph became a list item
- Scheduler should hard reset this structure change
`

test.describe('TrMarkdown streaming contracts', () => {
  test.describe.configure({ mode: 'serial' })

  test('holds incomplete streaming structures until they are complete', async ({ mount }) => {
    const link = getScenario('incomplete-link')
    const linkComponent = await mount(TrMarkdownStory, {
      props: {
        content: link.steps[0].content,
        streaming: basicStreaming,
      },
    })

    await expect(linkComponent.locator('.tr-markdown__link')).toHaveCount(0)
    await expect(linkComponent.locator('.tr-markdown__stream-tail--link')).toContainText('[TinyRobot')
    await linkComponent.update({
      props: {
        content: link.steps[2].content,
        streaming: basicStreaming,
      },
    })
    await expect(linkComponent.locator('.tr-markdown__stream-tail--link')).toHaveCount(0)
    await expect(linkComponent.locator('.tr-markdown__link')).toHaveAttribute(
      'href',
      'https://docs.opentiny.design/tiny-robot/',
    )

    const image = getScenario('incomplete-image')
    const imageComponent = await mount(TrMarkdownStory, {
      props: {
        content: image.steps[0].content,
        streaming: basicStreaming,
      },
    })

    await expect(imageComponent.locator('.tr-markdown__image')).toHaveCount(0)
    await expect(imageComponent.locator('.tr-markdown__stream-tail--image')).toContainText('![TinyRobot')
    await imageComponent.update({
      props: {
        content: image.steps[2].content,
        streaming: basicStreaming,
      },
    })
    await expect(imageComponent.locator('.tr-markdown__stream-tail--image')).toHaveCount(0)
    await expect(imageComponent.locator('.tr-markdown__image')).toHaveAttribute(
      'src',
      'https://docs.opentiny.design/images/logo-opentiny-next-text.svg',
    )

    const code = getScenario('incomplete-code-fence')
    const codeComponent = await mount(TrMarkdownStory, {
      props: {
        content: code.steps[0].content,
        streaming: basicStreaming,
      },
    })

    await expect(codeComponent.locator('.tr-markdown__code-block-wrap')).toHaveCount(0)
    await expect(codeComponent.locator('.tr-markdown__stream-tail--code')).toContainText("const status = 'streaming'")
    await codeComponent.update({
      props: {
        content: code.steps[2].content,
        streaming: basicStreaming,
      },
    })
    await expect(codeComponent.locator('.tr-markdown__stream-tail--code')).toHaveCount(0)
    await expect(codeComponent.locator('.tr-markdown__code-block-wrap').first()).toHaveAttribute('data-language', 'ts')

    const table = getScenario('incomplete-table')
    const tableComponent = await mount(TrMarkdownStory, {
      props: {
        content: table.steps[0].content,
        streaming: basicStreaming,
      },
    })

    await expect(tableComponent.locator('.tr-markdown__table')).toHaveCount(0)
    await expect(tableComponent.locator('.tr-markdown__stream-tail--table')).toContainText('| Name | Type |')
    await tableComponent.update({
      props: {
        content: table.steps[2].content,
        streaming: basicStreaming,
      },
    })
    await expect(tableComponent.locator('.tr-markdown__stream-tail--table')).toHaveCount(0)
    await expect(tableComponent.locator('.tr-markdown__table')).toContainText('retryCount')
  })

  test('keeps parse count stable while only the smoothing tail changes', async ({ mount }) => {
    const textTail = getScenario('text-tail')
    const component = await mount(TrMarkdownStory, {
      props: {
        content: textTail.steps[0].content,
        streaming: smoothingStreaming,
      },
    })

    await expect(component).toHaveAttribute('data-stream-parse-count', '1')
    await component.update({
      props: {
        content: textTail.steps[1].content,
        streaming: smoothingStreaming,
      },
    })
    await expect(component).toHaveAttribute('data-stream-parse-count', '1')
    await component.update({
      props: {
        content: textTail.steps[2].content,
        streaming: smoothingStreaming,
      },
    })
    await expect(component).toHaveAttribute('data-stream-parse-count', '2')
  })

  test('exposes animated streaming summary telemetry and finalizes cleanly', async ({ mount }) => {
    const largeAppend = getScenario('large-append')
    const component = await mount(TrMarkdownStory, {
      props: {
        content: largeAppend.steps[0].content,
        streaming: animatedStreaming,
      },
    })

    await component.update({
      props: {
        content: largeAppend.steps[1].content,
        streaming: animatedStreaming,
      },
    })

    await expect(component).toHaveAttribute('data-stream-mode', 'animated')
    await expect(component).toHaveAttribute('data-stream-state', 'streaming')
    await expect(component).toHaveAttribute('data-stream-profiler-enabled', 'true')
    await expect.poll(async () => (await readStreamSnapshot(component))?.blockCount ?? 0).toBeGreaterThan(1)
    await expect.poll(async () => (await readStreamSnapshot(component))?.pendingCount ?? 0).toBeGreaterThan(0)
    await expect.poll(async () => (await readStreamSnapshot(component))?.profilerEventCount ?? 0).toBeGreaterThan(0)
    await expect.poll(async () => (await readStreamProfilerDebug(component))?.rootCommitCount ?? 0).toBeGreaterThan(0)
    await expect
      .poll(async () => (await readStreamProfilerDebug(component))?.tokenScheduleCount ?? 0)
      .toBeGreaterThan(0)

    await component.update({
      props: {
        content: largeAppend.steps[1].content,
        streaming: {
          ...animatedStreaming,
          active: false,
        },
      },
    })

    await expect.poll(async () => await component.getAttribute('data-stream-active')).toBe('false')
    await expect
      .poll(async () => await component.getAttribute('data-stream-state'), { timeout: 12000 })
      .toBe('finalized')
    await expect
      .poll(async () => (await readStreamProfilerDebug(component))?.finalizeCount ?? 0, { timeout: 12000 })
      .toBeGreaterThan(0)
    await expect
      .poll(async () => await component.locator('.tr-markdown__stream-char').count(), { timeout: 12000 })
      .toBe(0)
  })

  test('tracks rewrite reset hard reset and non-text skip summaries', async ({ mount }) => {
    const rewrite = getScenario('rewrite-reset')
    const rewriteComponent = await mount(TrMarkdownStory, {
      props: {
        content: rewrite.steps[1].content,
        streaming: animatedStreaming,
      },
    })
    const resetBefore = (await readStreamSnapshot(rewriteComponent))?.resetCount ?? 0

    await rewriteComponent.update({
      props: {
        content: rewrite.steps[2].content,
        streaming: animatedStreaming,
      },
    })

    await expect.poll(async () => (await readStreamSnapshot(rewriteComponent))?.rewriteCount ?? 0).toBeGreaterThan(0)
    await expect.poll(async () => (await readStreamSnapshot(rewriteComponent))?.resetCount ?? 0).toBe(resetBefore)

    const hardReset = await mount(TrMarkdownStory, {
      props: {
        content: hardResetParagraph,
        streaming: animatedStreaming,
      },
    })

    await hardReset.update({
      props: {
        content: hardResetList,
        streaming: animatedStreaming,
      },
    })

    await expect.poll(async () => (await readStreamSnapshot(hardReset))?.hardReset ?? false).toBe(true)
    await expect.poll(async () => (await readStreamSnapshot(hardReset))?.resetCount ?? 0).toBeGreaterThan(0)

    const skip = await mount(TrMarkdownStory, {
      props: {
        content: skipMatrixInitial,
        streaming: animatedStreaming,
      },
    })

    await skip.update({
      props: {
        content: skipMatrixMixed,
        streaming: animatedStreaming,
      },
    })

    await expect.poll(async () => (await readStreamSnapshot(skip))?.skippedNodeCount ?? 0).toBeGreaterThan(0)
    await expect(skip.locator('.tr-markdown__table')).toContainText('retryCount')
    await expect(skip.locator('.tr-markdown__code-block-wrap')).toContainText('const skip = true')
    await expect(skip.locator('.tr-markdown__image')).toHaveCount(1)
  })
})
