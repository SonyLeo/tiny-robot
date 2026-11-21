import { expect, test } from '@playwright/experimental-ct-vue'
import type {
  TrMarkdownParserAdapter,
  TrMarkdownParserOptions,
  TrMarkdownRenderNode,
} from '../../../components/src/markdown/index.type'
import { measureMarkdownParseSizes } from './markdown-parse-benchmark'
import TrMarkdownStory from './TrMarkdown.story.vue'

const citationContent = 'A result with a source [1] and another source [2].'

const createDeferredParser = () => {
  const requests: Array<{
    source: string
    resolve: (nodes: TrMarkdownRenderNode[]) => void
  }> = []
  const parser: TrMarkdownParserAdapter = {
    name: 'phase2-deferred-parser',
    parse(source) {
      return new Promise((resolve) => {
        requests.push({ source, resolve })
      })
    },
  }

  return { parser, requests }
}

const createOptionParser = () => {
  const options: TrMarkdownParserOptions[] = []
  const parser: TrMarkdownParserAdapter = {
    name: 'phase2-option-parser',
    async parse(source, parserOptions) {
      options.push({ ...parserOptions })
      return [{ type: 'paragraph_open', tag: 'p', children: [{ type: 'text', text: source }] }]
    },
  }

  return { parser, options }
}

test.describe('TrMarkdown phase 2 parse invalidation contracts', () => {
  test('does not reparse when presentation-only props change', async ({ mount }) => {
    const component = await mount(TrMarkdownStory, {
      props: {
        code: { copyable: true },
        content: 'A presentation-only update should keep the parsed tree.',
        features: { imageGallery: false, mermaid: false },
        variant: 'default',
      },
    })

    await expect(component).toHaveAttribute('data-stream-parse-count', '1')
    await expect(component.locator('.tr-markdown__paragraph')).toContainText('presentation-only update')

    await component.update({
      props: {
        code: { copyable: false, blockMode: 'full' },
        componentProps: { paragraph: { 'data-presentation-update': 'true' } },
        content: 'A presentation-only update should keep the parsed tree.',
        features: { imageGallery: true, mermaid: { enabled: true, defaultMode: 'source' } },
        renderOptions: {},
        variant: 'article',
      },
    })

    await expect(component).toHaveAttribute('data-stream-parse-count', '1')
    await expect(component.locator('.tr-markdown__paragraph')).toContainText('presentation-only update')
  })

  test('reparses when syntax options change', async ({ mount }) => {
    const component = await mount(TrMarkdownStory, {
      props: {
        content: 'The first line\nThe second line',
        parserOptions: { breaks: false, linkify: true },
      },
    })

    await expect(component).toHaveAttribute('data-stream-parse-count', '1')
    await component.update({
      props: {
        content: 'The first line\nThe second line',
        parserOptions: { breaks: true, linkify: true },
      },
    })
    await expect(component).toHaveAttribute('data-stream-parse-count', '2')
    await expect(component.locator('br')).toHaveCount(1)
  })

  test('reparses when an optional syntax plugin changes from disabled to enabled', async ({ mount }) => {
    const component = await mount(TrMarkdownStory, {
      props: {
        content: 'Inline $x$ math is available when enabled.',
      },
    })

    await expect(component).toHaveAttribute('data-stream-parse-count', '1')
    await expect(component.locator('.tr-markdown__math-inline')).toHaveCount(0)

    await component.update({
      props: {
        content: 'Inline $x$ math is available when enabled.',
        features: { math: true },
      },
    })
    await expect(component).toHaveAttribute('data-stream-parse-count', '2')
    await expect(component.locator('.tr-markdown__math-inline')).toHaveCount(1)
  })

  test('reparses when parser identity changes', async ({ mount }) => {
    const first = createOptionParser()
    const second = createOptionParser()
    const component = await mount(TrMarkdownStory, {
      props: { content: 'Parser identity changes are syntax changes.', parser: first.parser },
    })

    await expect(component).toHaveAttribute('data-stream-parse-count', '1')
    await component.update({ props: { content: 'Parser identity changes are syntax changes.', parser: second.parser } })
    await expect(component).toHaveAttribute('data-stream-parse-count', '2')
    expect(first.options).toHaveLength(1)
    expect(second.options).toHaveLength(1)
  })

  test('reparses custom adapters when extension options change', async ({ mount }) => {
    const custom = createOptionParser()
    const component = await mount(TrMarkdownStory, {
      props: {
        content: 'Custom extension options are owned by the adapter.',
        parser: custom.parser,
        parserOptions: { breaks: false, customExtension: { mode: 'a' } } as TrMarkdownParserOptions &
          Record<string, unknown>,
      },
    })

    await expect(component).toHaveAttribute('data-stream-parse-count', '1')
    await component.update({
      props: {
        content: 'Custom extension options are owned by the adapter.',
        parser: custom.parser,
        parserOptions: { breaks: false, customExtension: { mode: 'b' } } as TrMarkdownParserOptions &
          Record<string, unknown>,
      },
    })
    await expect(component).toHaveAttribute('data-stream-parse-count', '2')
    expect(custom.options[0]).toHaveProperty('customExtension', { mode: 'a' })
    expect(custom.options[1]).toHaveProperty('customExtension', { mode: 'b' })
  })

  test('updates citations without reparsing and never accumulates wrappers', async ({ mount }) => {
    const component = await mount(TrMarkdownStory, {
      props: {
        citations: [{ title: 'First source', url: 'https://example.com/first' }],
        content: citationContent,
      },
    })

    await expect(component).toHaveAttribute('data-stream-parse-count', '1')
    await expect(component.locator('[data-citation-index]')).toHaveCount(1)
    await expect(component.locator('[data-citation-url]')).toHaveAttribute(
      'data-citation-url',
      'https://example.com/first',
    )

    await component.update({
      props: {
        citations: [
          { title: 'First source updated', url: 'https://example.com/first-updated' },
          { title: 'Second source', url: 'https://example.com/second' },
        ],
        content: citationContent,
      },
    })

    await expect(component).toHaveAttribute('data-stream-parse-count', '1')
    await expect(component.locator('[data-citation-index]')).toHaveCount(2)
    await expect(component.locator('[data-citation-url]')).toHaveCount(2)
    await expect(component.locator('[data-citation-url="https://example.com/first-updated"]')).toHaveCount(1)
    await expect(component.locator('[data-citation-url="https://example.com/second"]')).toHaveCount(1)

    await component.update({
      props: {
        citations: [],
        content: citationContent,
      },
    })
    await expect(component.locator('[data-citation-index]')).toHaveCount(0)
    await expect(component).toContainText('[1] and another source [2]')

    await component.update({
      props: {
        citations: [{ title: 'First source again', url: 'https://example.com/again' }],
        content: citationContent,
      },
    })
    await expect(component.locator('[data-citation-index]')).toHaveCount(1)
    await expect(component.locator('[data-citation-url]')).toHaveAttribute(
      'data-citation-url',
      'https://example.com/again',
    )
    await expect(component).toHaveAttribute('data-stream-parse-count', '1')
  })

  test('commits the latest citations when an async parse resolves after citation props change', async ({ mount }) => {
    const deferred = createDeferredParser()
    const component = await mount(TrMarkdownStory, {
      props: {
        citations: [{ title: 'Latest source', url: 'https://example.com/latest' }],
        content: 'Result [1]',
        parser: deferred.parser,
      },
    })

    await expect.poll(() => deferred.requests.length).toBe(1)
    await component.update({
      props: {
        citations: [{ title: 'Changed source', url: 'https://example.com/changed' }],
      },
    })
    expect(deferred.requests).toHaveLength(1)

    deferred.requests[0].resolve([
      {
        type: 'paragraph_open',
        tag: 'p',
        children: [{ type: 'text', text: 'Result [1]' }],
      },
    ])

    await expect(component.locator('[data-citation-url]')).toHaveAttribute(
      'data-citation-url',
      'https://example.com/changed',
    )
    await expect(component).toHaveAttribute('data-stream-parse-count', '1')
  })

  test('ignores stale parser results when requests resolve in reverse order', async ({ mount }) => {
    const deferred = createDeferredParser()
    const component = await mount(TrMarkdownStory, {
      props: { content: 'first', parser: deferred.parser },
    })
    await expect.poll(() => deferred.requests.length).toBe(1)

    await component.update({ props: { content: 'second' } })
    await expect.poll(() => deferred.requests.length).toBe(2)

    deferred.requests[0].resolve([
      { type: 'paragraph_open', tag: 'p', children: [{ type: 'text', text: 'stale first' }] },
    ])
    deferred.requests[1].resolve([
      { type: 'paragraph_open', tag: 'p', children: [{ type: 'text', text: 'current second' }] },
    ])
    await expect(component.locator('.tr-markdown__paragraph')).toContainText('current second')
    await expect(component.locator('.tr-markdown__paragraph')).not.toContainText('stale first')
  })

  test('opt-in parser benchmark report', async () => {
    test.skip(!process.env.TINY_ROBOT_MARKDOWN_BENCH, 'set TINY_ROBOT_MARKDOWN_BENCH=1 to run parser measurements')
    const measurements = await measureMarkdownParseSizes([1_000, 10_000, 20_000], {}, undefined, 7, 2)

    expect(measurements.map((measurement) => measurement.requestedLength)).toEqual([1_000, 10_000, 20_000])
    expect(measurements.every((measurement) => measurement.textLength === measurement.requestedLength)).toBe(true)
    expect(measurements.every((measurement) => measurement.samplesMs.length === 7)).toBe(true)
    expect(measurements.every((measurement) => Number.isFinite(measurement.medianMs))).toBe(true)
    console.log(
      JSON.stringify(
        {
          environment: {
            browser: 'Playwright Chromium project',
            node: process.version,
            platform: process.platform,
          },
          scope: 'markdownItAdapter.parse only; 2 warmups + 7 timed samples per size',
          measurements,
        },
        null,
        2,
      ),
    )
  })
})
