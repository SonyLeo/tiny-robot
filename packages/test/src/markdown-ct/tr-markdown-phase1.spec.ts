import { expect, test } from '@playwright/experimental-ct-vue'
import {
  resolveMarkdownStreamState,
  resolveStreamingConfig,
} from '../../../components/src/markdown/stream/useMarkdownStreamState'
import { scanMarkdownFences } from '../../../components/src/markdown/stream/markdownFenceScanner'
import { splitMarkdownTail } from '../../../components/src/markdown/stream/useMarkdownSmoother'
import { resolveIncompleteMarkdown } from '../../../components/src/markdown/stream/useIncompleteMarkdown'
import MarkdownHighlightRaceStory from './MarkdownHighlightRace.story.vue'
import TrMarkdownStory from './TrMarkdown.story.vue'

const streaming = resolveStreamingConfig({ enabled: true, active: true, showTail: true, smoothingChars: 8 })

test.describe('TrMarkdown phase 1 stream contracts', () => {
  test('scans only valid fence closers across chunk boundaries', () => {
    expect(scanMarkdownFences('')).toEqual({ fences: [] })
    const appendingFence = '```ts\nconst ready = true\n'
    for (let chunkEnd = 1; chunkEnd <= appendingFence.length; chunkEnd += 1) {
      const partial = appendingFence.slice(0, chunkEnd)
      const openFence = scanMarkdownFences(partial).openFence
      if (partial.startsWith('```')) {
        expect(openFence).toBeDefined()
        expect(resolveIncompleteMarkdown(partial)?.holdIndex).toBe(0)
      }
    }
    expect(scanMarkdownFences('```ts\r\nconst x = 1\r\n```\r\nafter').fences).toEqual([
      { marker: '`', run: 3, start: 0, end: 23, open: false, closed: true },
    ])

    const open = scanMarkdownFences('  ~~~~ts\n~~~~~ nope\n```\ntext')
    expect(open.openFence).toEqual({ marker: '~', run: 4, start: 0, end: 28, open: true, closed: false })
    expect(resolveIncompleteMarkdown('  ~~~~ts\n~~~~~ nope\n```\ntext')).toEqual({
      holdIndex: 0,
      kind: 'code',
      reason: 'code-fence',
    })

    const whitespaceClosed = scanMarkdownFences('~~~~ts\nbody\n~~~~   \ntext')
    expect(whitespaceClosed.openFence).toBeUndefined()
    expect(whitespaceClosed.fences[0]).toMatchObject({ marker: '~', run: 4, closed: true })

    const shortCloser = scanMarkdownFences('````ts\nbody\n```\nafter')
    expect(shortCloser.openFence).toMatchObject({ marker: '`', run: 4, open: true, closed: false })

    const mixedMarkerInfo = scanMarkdownFences('~~~`info\nbody\n~~~\nafter')
    expect(mixedMarkerInfo.fences[0]).toMatchObject({ marker: '~', run: 3, closed: true })
    const invalidBacktickInfo = scanMarkdownFences('```~`info\nbody\ntext')
    expect(invalidBacktickInfo.openFence).toBeUndefined()
    expect(invalidBacktickInfo.fences).toEqual([])

    const loneCr = scanMarkdownFences('~~~\rbody\r~~~\rafter')
    expect(loneCr.fences[0]).toMatchObject({ start: 0, end: 12, closed: true })

    const closed = scanMarkdownFences('```\nbody\n```info\nbody\n````\nafter')
    expect(closed.openFence).toBeUndefined()
    expect(closed.fences[0]).toMatchObject({ marker: '`', run: 3, closed: true })
  })

  test('keeps smoother and incomplete paths on the same fence range', () => {
    const content = 'before\n```ts\nconst marker = "``` nope"\nvalue'
    const incomplete = resolveIncompleteMarkdown(content)
    expect(incomplete?.holdIndex).toBe(7)
    const smooth = splitMarkdownTail(`${content} with more text`, 8)
    expect(smooth.tailContent.startsWith('```ts')).toBe(true)

    const closed = resolveMarkdownStreamState(content + '\n```\nafter', streaming)
    expect(closed.tailKind).toBe('text')
    expect(closed.stableContent).toContain('```\n')
    expect(closed.tailContent).toContain('after')
  })

  test('skips character reveal when reduced motion is requested', async ({ mount, page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const component = await mount(TrMarkdownStory, {
      props: {
        content: 'A paragraph that is already complete.',
        streaming: { enabled: true, active: true, mode: 'animated', showTail: true },
      },
    })

    await expect(component.locator('.tr-markdown__stream-char')).toHaveCount(0)
    await expect(component).toContainText('A paragraph that is already complete.')
    await expect(component).toHaveAttribute('data-stream-active', 'true')
    await expect(component).toHaveAttribute('data-stream-state', 'streaming')
  })

  test('ignores stale async highlight results after code, language, engine, theme, disable, and unmount changes', async ({
    mount,
  }) => {
    const pending: Array<{ code: string; resolve: (result: string) => void }> = []
    const highlightCode = (code: string) =>
      new Promise<string>((resolve) => {
        pending.push({ code, resolve })
      })
    const component = await mount(MarkdownHighlightRaceStory, {
      props: { code: 'old code', highlightCode },
    })
    await expect.poll(() => pending.length).toBe(1)

    await component.update({ props: { code: 'new code', highlightCode } })
    await expect.poll(() => pending.length).toBe(2)
    pending[1].resolve('<code>new result</code>')
    await expect(component.locator('[data-testid="highlight-result"]')).toContainText('new result')
    pending[0].resolve('<code>stale code result</code>')
    await expect(component.locator('[data-testid="highlight-result"]')).toContainText('new result')
    await expect(component.locator('[data-testid="highlight-result"]')).not.toContainText('stale code result')

    await component.update({ props: { code: 'new code', language: 'typescript', highlightCode } })
    await expect.poll(() => pending.length).toBe(3)
    await component.update({ props: { code: 'new code', language: 'typescript', engine: 'shiki', highlightCode } })
    await expect.poll(() => pending.length).toBe(4)
    await component.update({
      props: { code: 'new code', language: 'typescript', engine: 'shiki', colorMode: 'dark', highlightCode },
    })
    await expect.poll(() => pending.length).toBe(5)
    pending[4].resolve('<code>current themed result</code>')
    await expect(component.locator('[data-testid="highlight-result"]')).toContainText('current themed result')
    pending[2].resolve('<code>stale language result</code>')
    pending[3].resolve('<code>stale engine result</code>')
    await expect(component.locator('[data-testid="highlight-result"]')).toContainText('current themed result')

    await component.update({ props: { code: 'disabled code', engine: 'highlightjs', highlightCode } })
    await expect.poll(() => pending.length).toBe(6)
    await component.update({ props: { code: 'disabled code', enabled: false, highlightCode } })
    pending[5].resolve('<code>disabled stale result</code>')
    await expect(component.locator('[data-testid="plain-source"]')).toContainText('disabled code')
    await expect(component.locator('[data-testid="highlight-result"]')).toHaveCount(0)

    await component.update({ props: { code: 'unmounted code', enabled: true, highlightCode } })
    await expect.poll(() => pending.length).toBe(7)
    await component.unmount()
    pending[6].resolve('<code>unmounted stale result</code>')
  })
})
