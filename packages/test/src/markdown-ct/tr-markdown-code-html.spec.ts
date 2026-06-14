import { expect, test } from '@playwright/experimental-ct-vue'
import CodeFenceResolver from '../../../components/src/markdown/components/code-block/CodeFenceResolver.vue'
import TrMarkdownStory from './TrMarkdown.story.vue'

const snippetContent = `\`\`\`bash
pnpm install
\`\`\``

const fullCodeContent = `\`\`\`ts
export function greetUser(name: string) {
  console.log('hewwo ' + name) // [!code --]
  console.log('Hello ' + name) // [!code ++]
  return \`Welcome, \${name}!\`
}
\`\`\``

const htmlPreviewDocument = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>TinyRobot HTML Preview Test</title>
  </head>
  <body>
    <main>
      <h1>Hello from inside Markdown</h1>
      <p>This block is rendered by HtmlPreview.</p>
    </main>
  </body>
</html>`

const htmlPreviewFragment = `<section>
  <h1>Fragment fallback</h1>
  <p>This stays as code because it is not a full HTML document.</p>
</section>`

const createHtmlFence = (source: string) => `\`\`\`html
${source}
\`\`\``

const createStreamingHtmlFence = (source: string) => `\`\`\`html
${source}
\`\`\``

const createClosedStreamingHtmlFenceWithoutTrailingNewline = (source: string) => `\`\`\`html
${source}
\`\`\``

const streamingHeadOnly = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Streaming HTML`

const streamingHeadClosed = `${streamingHeadOnly}</title>
  </head>
  <body>
    <main>Live preview can boot without script.</main>`

const streamingScriptLocked = `${streamingHeadOnly}</title>
  </head>
  <body>
    <script>window.__tinyRobotPreview = true</script>`

const streamingClosedDocument = `${streamingScriptLocked}
  </body>
</html>`

test.describe('TrMarkdown code and HTML preview contracts', () => {
  test('shows snippet copy interaction and copied feedback', async ({ mount }) => {
    const component = await mount(TrMarkdownStory, {
      props: {
        code: {
          highlight: {
            engine: 'shiki',
          },
        },
        content: snippetContent,
      },
    })

    const snippet = component.locator('.tr-markdown__code-snippet-wrap').first()
    const copyButton = snippet.locator('.tr-markdown__copy-button').first()

    await expect(snippet).toBeVisible()
    await snippet.locator('.shiki').waitFor({ state: 'visible', timeout: 15000 })
    await expect(copyButton).toBeVisible()
    await copyButton.click()
    await expect(copyButton).toHaveAttribute('title', 'Copied')
  })

  test('renders full code mode, transformer output, expand state, and custom actions', async ({ mount }) => {
    const component = await mount(TrMarkdownStory, {
      props: {
        code: {
          blockMode: 'full',
          highlight: {
            enableTransformer: true,
            engine: 'shiki',
          },
        },
        content: fullCodeContent,
        fixture: 'code-actions',
      },
    })

    const block = component.locator('.tr-markdown__code-block-wrap--full').first()
    const expandButton = block.locator('.tr-markdown__code-expand').first()

    await expect(block).toHaveAttribute('data-language', 'ts')
    await block.locator('.shiki').waitFor({ state: 'visible', timeout: 15000 })
    await expect(block.locator('.shiki .line.diff.add')).toHaveCount(1)
    await expect(block.locator('.tr-markdown__code-language')).toContainText('TypeScript')
    await expect(block.getByRole('button', { name: 'Custom action' })).toBeVisible()
    await expect(block.locator('.markdown-ct__custom-code-action')).toHaveAttribute('data-code-action-language', 'ts')
    await expect(expandButton).toHaveAttribute('title', 'Collapse code block')

    await expandButton.click()

    await expect(expandButton).toHaveAttribute('title', 'Expand code block')
    await expect(block.locator('.tr-markdown__code-full-body')).toHaveClass(/tr-markdown__code-full-body--collapsed/)
  })

  test('renders HTML preview only when enabled and falls back for fragments', async ({ mount }) => {
    const disabled = await mount(TrMarkdownStory, {
      props: {
        content: createHtmlFence(htmlPreviewDocument),
      },
    })

    await expect(disabled.locator('[data-code-type="html-preview"]')).toHaveCount(0)
    await expect(disabled.locator('.tr-markdown__code-block-wrap')).toHaveCount(1)

    const enabled = await mount(TrMarkdownStory, {
      props: {
        content: createHtmlFence(htmlPreviewDocument),
        features: {
          htmlPreview: {
            defaultHeight: 260,
            enabled: true,
            fileName: 'tiny-robot-html-preview.html',
          },
        },
      },
    })

    const previewBlock = enabled.locator('[data-code-type="html-preview"]').first()
    const previewButton = previewBlock.getByRole('button', { name: 'Preview', exact: true })

    await expect(previewBlock).toHaveCount(1)
    await expect(previewBlock.locator('iframe.tr-markdown__html-preview-iframe')).toHaveCount(1)
    await expect(previewBlock.locator('iframe.tr-markdown__html-preview-iframe')).toHaveAttribute(
      'sandbox',
      'allow-scripts allow-forms allow-modals',
    )
    await expect(previewButton).toHaveClass(/tr-markdown__html-preview-segment--active/)

    const sourceEnabled = await mount(TrMarkdownStory, {
      props: {
        content: createHtmlFence(htmlPreviewDocument),
        features: {
          htmlPreview: {
            defaultMode: 'source',
            enabled: true,
          },
        },
      },
    })
    const sourceBlock = sourceEnabled.locator('[data-code-type="html-preview"]').first()

    await expect(sourceBlock.getByRole('button', { name: 'Code', exact: true })).toHaveClass(
      /tr-markdown__html-preview-segment--active/,
    )
    await expect(sourceBlock.locator('.tr-markdown__html-preview-source')).toContainText('Hello from inside Markdown')
    await expect(sourceBlock.getByRole('button', { name: 'Copy HTML code' })).toBeVisible()
    await expect(sourceBlock.getByRole('button', { name: 'Download HTML' })).toBeVisible()

    const fragment = await mount(TrMarkdownStory, {
      props: {
        content: createHtmlFence(htmlPreviewFragment),
        features: {
          htmlPreview: {
            enabled: true,
          },
        },
      },
    })

    await expect(fragment.locator('[data-code-type="html-preview"]')).toHaveCount(0)
    await expect(fragment.locator('.tr-markdown__code-block-wrap')).toHaveCount(1)
  })

  test('preserves the HTML source passed into the code fence resolver', async ({ mount }) => {
    const component = await mount(CodeFenceResolver, {
      props: {
        code: `${htmlPreviewDocument}\n`,
        highlight: false,
        htmlPreview: {
          defaultMode: 'source',
          enabled: true,
        },
        language: 'html',
      },
    })

    const sourceText = await component.locator('.tr-markdown__html-preview-source code').textContent()

    expect(sourceText?.startsWith('<!doctype html>')).toBe(true)
    expect(sourceText?.endsWith('</html>\n')).toBe(true)
    expect(sourceText?.endsWith('</html>')).toBe(false)
  })

  test('matches HTML preview streaming auto live and defer behavior', async ({ mount }) => {
    const autoNoScript = await mount(TrMarkdownStory, {
      props: {
        content: createStreamingHtmlFence(streamingHeadOnly),
        features: {
          htmlPreview: {
            enabled: true,
            streamingMode: 'auto',
          },
        },
        streaming: {
          active: true,
          enabled: true,
        },
      },
    })
    const autoNoScriptBlock = autoNoScript.locator('[data-code-type="html-preview"]').first()

    await expect(autoNoScriptBlock).toHaveAttribute('data-html-preview-streaming-mode', 'auto')
    await expect(autoNoScriptBlock).toHaveAttribute('data-html-preview-pending', 'true')
    await expect(autoNoScriptBlock).toHaveAttribute('data-html-preview-pending-reason', 'head')
    await expect(autoNoScriptBlock.locator('iframe.tr-markdown__html-preview-iframe')).toHaveCount(0)

    await autoNoScript.update({
      props: {
        content: createStreamingHtmlFence(streamingHeadClosed),
        features: {
          htmlPreview: {
            enabled: true,
            streamingMode: 'auto',
          },
        },
        streaming: {
          active: true,
          enabled: true,
        },
      },
    })

    await expect(autoNoScriptBlock).toHaveAttribute('data-html-preview-head-closed', 'true')
    await expect(autoNoScriptBlock).toHaveAttribute('data-html-preview-pending', 'false')
    await expect(autoNoScriptBlock).toHaveAttribute('data-html-preview-live-committed', 'true')
    await expect(autoNoScriptBlock.locator('iframe.tr-markdown__html-preview-iframe')).toHaveCount(1)

    const autoScript = await mount(TrMarkdownStory, {
      props: {
        content: createStreamingHtmlFence(streamingScriptLocked),
        features: {
          htmlPreview: {
            enabled: true,
            streamingMode: 'auto',
          },
        },
        streaming: {
          active: true,
          enabled: true,
        },
      },
    })
    const autoScriptBlock = autoScript.locator('[data-code-type="html-preview"]').first()

    await expect(autoScriptBlock).toHaveAttribute('data-html-preview-script-locked', 'true')
    await expect(autoScriptBlock).toHaveAttribute('data-html-preview-pending', 'true')
    await expect(autoScriptBlock).toHaveAttribute('data-html-preview-pending-reason', 'script')
    await expect(autoScriptBlock.locator('iframe.tr-markdown__html-preview-iframe')).toHaveCount(0)

    await autoScript.update({
      props: {
        content: createStreamingHtmlFence(streamingClosedDocument),
        features: {
          htmlPreview: {
            enabled: true,
            streamingMode: 'auto',
          },
        },
        streaming: {
          active: true,
          enabled: true,
        },
      },
    })

    await expect(autoScriptBlock).toHaveAttribute('data-html-preview-pending', 'false')
    await expect(autoScriptBlock).toHaveAttribute('data-html-preview-stable', 'true')
    await expect(autoScriptBlock.locator('iframe.tr-markdown__html-preview-iframe')).toHaveCount(1)

    const liveScript = await mount(TrMarkdownStory, {
      props: {
        content: createStreamingHtmlFence(streamingScriptLocked),
        features: {
          htmlPreview: {
            enabled: true,
            streamingMode: 'live',
          },
        },
        streaming: {
          active: true,
          enabled: true,
        },
      },
    })
    const liveScriptBlock = liveScript.locator('[data-code-type="html-preview"]').first()

    await expect(liveScriptBlock).toHaveAttribute('data-html-preview-streaming-mode', 'live')
    await expect(liveScriptBlock).toHaveAttribute('data-html-preview-script-locked', 'true')
    await expect(liveScriptBlock).toHaveAttribute('data-html-preview-pending', 'false')
    await expect(liveScriptBlock).toHaveAttribute('data-html-preview-live-committed', 'true')
    await expect(liveScriptBlock.locator('iframe.tr-markdown__html-preview-iframe')).toHaveCount(1)

    const deferNoScript = await mount(TrMarkdownStory, {
      props: {
        content: createStreamingHtmlFence(streamingHeadClosed),
        features: {
          htmlPreview: {
            enabled: true,
            streamingMode: 'defer',
          },
        },
        streaming: {
          active: true,
          enabled: true,
        },
      },
    })
    const deferNoScriptBlock = deferNoScript.locator('[data-code-type="html-preview"]').first()

    await expect(deferNoScriptBlock).toHaveAttribute('data-html-preview-streaming-mode', 'defer')
    await expect(deferNoScriptBlock).toHaveAttribute('data-html-preview-head-closed', 'true')
    await expect(deferNoScriptBlock).toHaveAttribute('data-html-preview-pending', 'true')
    await expect(deferNoScriptBlock).toHaveAttribute('data-html-preview-pending-reason', 'defer')
    await expect(deferNoScriptBlock.locator('iframe.tr-markdown__html-preview-iframe')).toHaveCount(0)
  })

  test('keeps a closed trailing HTML fence in the stable parser path while streaming', async ({ mount }) => {
    const component = await mount(TrMarkdownStory, {
      props: {
        content: createClosedStreamingHtmlFenceWithoutTrailingNewline(htmlPreviewDocument),
        features: {
          htmlPreview: {
            enabled: true,
            streamingMode: 'auto',
          },
        },
        streaming: {
          active: true,
          enabled: true,
          smoothingChars: 32,
        },
      },
    })

    const previewBlock = component.locator('[data-code-type="html-preview"]').first()

    await expect(previewBlock).toHaveCount(1)
    await expect(previewBlock).toHaveAttribute('data-html-preview-pending', 'false')
    await expect(previewBlock.locator('iframe.tr-markdown__html-preview-iframe')).toHaveCount(1)
    await expect(component.locator('.tr-markdown__stream-tail')).toHaveCount(0)
  })
})
