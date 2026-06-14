import { expect, test } from '@playwright/experimental-ct-vue'
import TrMarkdownStory from './TrMarkdown.story.vue'

const rawHtmlContent = `Inline raw HTML should stay literal when disabled, but become real markup when enabled: <span class="raw-html-chip" data-raw-html-chip="inline">inline html</span>.

<div class="raw-html-card" data-raw-html-block="true">
  <strong>Block HTML</strong>
  <p>Generic raw HTML now has a dedicated render path.</p>
</div>`

const unsafeRawHtmlContent = `<div data-raw-html-safety="block">
  <script>window.__tinyRobotUnsafeRawHtml = true</script>
  <img src="x" onerror="window.__tinyRobotUnsafeRawHtml = true" />
  <a data-raw-html-safety-link="true" href="javascript:alert('xss')" onclick="window.__tinyRobotUnsafeRawHtml = true">unsafe link</a>
</div>`

const htmlPreviewFidelityDocument = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title> Fidelity </title>
  </head>
  <body>
    <pre id="fidelity-target">  leading and trailing whitespace preserved  </pre>
  </body>
</html>
`

const htmlPreviewFidelityContent = `\`\`\`html

${htmlPreviewFidelityDocument}

\`\`\``

test.describe('TrMarkdown component testing spike', () => {
  test('renders generic raw HTML only when the public html feature is enabled', async ({ mount }) => {
    const component = await mount(TrMarkdownStory, {
      props: {
        content: rawHtmlContent,
      },
    })

    await expect(component.locator('[data-raw-html-chip="inline"]')).toHaveCount(0)
    await expect(component.locator('[data-raw-html-block="true"]')).toHaveCount(0)
    await expect(component).toContainText('<span class="raw-html-chip" data-raw-html-chip="inline">inline html</span>')

    await component.update({
      props: {
        content: rawHtmlContent,
        features: {
          html: true,
        },
      },
    })

    await expect(component.locator('[data-raw-html-chip="inline"]')).toHaveCount(1)
    await expect(component.locator('[data-raw-html-block="true"]')).toHaveCount(1)
    await expect(component.locator('[data-raw-html-block="true"]')).toContainText(
      'Generic raw HTML now has a dedicated render path.',
    )
  })

  test('sanitizes dangerous raw HTML nodes and attributes when the html feature is enabled', async ({ mount }) => {
    const component = await mount(TrMarkdownStory, {
      props: {
        content: unsafeRawHtmlContent,
        features: {
          html: true,
        },
      },
    })

    const block = component.locator('[data-raw-html-safety="block"]').first()
    const link = component.locator('[data-raw-html-safety-link="true"]').first()

    await expect(block).toHaveCount(1)
    await expect(component.locator('script')).toHaveCount(0)
    await expect(component.locator('[onerror]')).toHaveCount(0)
    await expect(component.locator('[onclick]')).toHaveCount(0)
    await expect(link).toHaveCount(1)
    await expect(link).not.toHaveAttribute('href', /javascript:/i)
  })

  test('keeps html preview source fidelity in source mode', async ({ mount }) => {
    const component = await mount(TrMarkdownStory, {
      props: {
        code: {
          highlight: {
            enabled: false,
          },
        },
        content: htmlPreviewFidelityContent,
        features: {
          htmlPreview: {
            enabled: true,
            defaultMode: 'source',
            fileName: 'tiny-robot-html-preview-fidelity.html',
          },
        },
      },
    })

    const previewBlock = component.locator('[data-code-type="html-preview"]').first()
    const sourceBlock = previewBlock.locator('.tr-markdown__html-preview-source')

    await expect(previewBlock).toHaveCount(1)
    await expect(sourceBlock).toContainText('<title> Fidelity </title>')
    await expect(sourceBlock).toContainText(
      '<pre id="fidelity-target">  leading and trailing whitespace preserved  </pre>',
    )

    const sourceText = await sourceBlock.locator('code').textContent()
    expect(sourceText?.startsWith('\n<!doctype html>')).toBe(true)
  })

  test('updates injected markdown context consumers after prop changes', async ({ mount }) => {
    const component = await mount(TrMarkdownStory, {
      props: {
        code: {
          copyable: true,
        },
        content: 'A [reactive markdown context](https://example.com/context) should update injected consumers.',
        features: {
          html: false,
        },
        link: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
        probeContext: true,
        streaming: {
          active: false,
          enabled: true,
        },
        variant: 'default',
      },
    })
    const probe = component.locator('.markdown-ct__context-probe').first()

    await expect(probe).toHaveAttribute('data-context-variant', 'default')
    await expect(probe).toHaveAttribute('data-context-link-target', '_blank')
    await expect(probe).toHaveAttribute('data-context-link-rel', 'noopener noreferrer')
    await expect(probe).toHaveAttribute('data-context-html-enabled', 'false')
    await expect(probe).toHaveAttribute('data-context-copyable', 'true')
    await expect(probe).toHaveAttribute('data-context-streaming-active', 'false')
    await expect(probe).toHaveAttribute('data-context-streaming-enabled', 'true')

    await component.update({
      props: {
        code: {
          copyable: false,
        },
        content: 'A [reactive markdown context](https://example.com/context) should update injected consumers.',
        features: {
          html: true,
        },
        link: {
          rel: 'nofollow',
          target: '_self',
        },
        probeContext: true,
        streaming: {
          active: true,
          enabled: true,
        },
        variant: 'article',
      },
    })

    await expect(probe).toHaveAttribute('data-context-variant', 'article')
    await expect(probe).toHaveAttribute('data-context-link-target', '_self')
    await expect(probe).toHaveAttribute('data-context-link-rel', 'nofollow')
    await expect(probe).toHaveAttribute('data-context-html-enabled', 'true')
    await expect(probe).toHaveAttribute('data-context-copyable', 'false')
    await expect(probe).toHaveAttribute('data-context-streaming-active', 'true')
    await expect(probe).toHaveAttribute('data-context-streaming-enabled', 'true')
  })
})
