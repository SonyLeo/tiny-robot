import { expect, test } from '@playwright/experimental-ct-vue'
import TrMarkdownStory from './TrMarkdown.story.vue'

const mathInlineContent = 'Inline math keeps Einstein visible as $E = mc^2$ inside normal prose.'

const mathBlockContent = `$$
\\int_0^1 x^2\\,dx = \\frac{1}{3}
$$`

const mathInvalidContent = `$$
\\frac{1}{
$$`

const createMermaidFence = (source: string) => `\`\`\`mermaid
${source}
\`\`\``

const mermaidFlowchart = `flowchart TD
  User[User prompt] --> Planner{Freeze plan}
  Planner --> Implement[Implement Mermaid block]
  Implement --> Verify[Verify demo and tests]
  Verify --> Ship[Ship markdown update]`

const mermaidInvalid = `flowchart TD
  Start -->`

const videoContent = `A standalone <video /> block should render as a first-party media node.

<video src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" poster="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80" controls preload="metadata" />

TinyRobot keeps this path narrow instead of enabling general raw HTML.`

const imageGalleryContent = `![Desk setup](https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&w=1200&q=80 "Desk setup")

Gallery preview should stay owned by markdown instead of attachments.

![Ops wall](https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80 "Ops wall")

![Team board](https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80 "Team board")`

test.describe('TrMarkdown rich media contracts', () => {
  test('renders math only when enabled and keeps fallback visible for invalid formulas', async ({ mount }) => {
    const disabled = await mount(TrMarkdownStory, {
      props: {
        content: mathInlineContent,
      },
    })

    await expect(disabled.locator('.katex')).toHaveCount(0)
    await expect(disabled).toContainText('$E = mc^2$')

    const inline = await mount(TrMarkdownStory, {
      props: {
        content: mathInlineContent,
        features: {
          math: {
            copyable: true,
            enabled: true,
          },
        },
      },
    })

    const inlineMath = inline.locator('[data-math-display="inline"]').first()
    await expect(inlineMath).toHaveAttribute('data-math-state', 'ready', { timeout: 20000 })
    await expect(inlineMath.locator('.katex')).toHaveCount(1)

    const block = await mount(TrMarkdownStory, {
      props: {
        content: mathBlockContent,
        features: {
          math: {
            copyable: true,
            enabled: true,
          },
        },
      },
    })

    const blockMath = block.locator('[data-code-type="math"]').first()
    await expect(blockMath).toHaveAttribute('data-math-state', 'ready', { timeout: 20000 })
    await expect(blockMath).toHaveAttribute('data-math-error', 'false')
    await expect(blockMath.locator('.katex')).toHaveCount(1)
    await expect(blockMath.locator('.tr-markdown__copy-button')).toHaveCount(1)

    const invalid = await mount(TrMarkdownStory, {
      props: {
        content: mathInvalidContent,
        features: {
          math: {
            copyable: true,
            enabled: true,
          },
        },
      },
    })

    const invalidMath = invalid.locator('[data-code-type="math"]').first()
    await expect(invalidMath).toHaveAttribute('data-math-state', 'error', { timeout: 20000 })
    await expect(invalidMath).toHaveAttribute('data-math-error', 'true')
    await expect(invalidMath.locator('.tr-markdown__math-source').first()).toContainText('\\frac{1}{')
  })

  test('renders Mermaid only when enabled and preserves source fallback on errors', async ({ mount }) => {
    const disabled = await mount(TrMarkdownStory, {
      props: {
        content: createMermaidFence(mermaidFlowchart),
      },
    })

    await expect(disabled.locator('[data-code-type="mermaid"]')).toHaveCount(0)
    await expect(disabled.locator('.tr-markdown__code-block-wrap')).toContainText('flowchart TD')

    const flowchart = await mount(TrMarkdownStory, {
      props: {
        content: createMermaidFence(mermaidFlowchart),
        features: {
          mermaid: {
            defaultMode: 'preview',
            enabled: true,
          },
        },
      },
    })

    const mermaid = flowchart.locator('[data-code-type="mermaid"]').first()
    await expect(mermaid).toHaveAttribute('data-mermaid-state', 'ready', { timeout: 30000 })
    await expect(mermaid.locator('.tr-markdown__mermaid-svg svg')).toHaveCount(1)

    const invalid = await mount(TrMarkdownStory, {
      props: {
        content: createMermaidFence(mermaidInvalid),
        features: {
          mermaid: {
            defaultMode: 'preview',
            enabled: true,
          },
        },
      },
    })

    const invalidMermaid = invalid.locator('[data-code-type="mermaid"]').first()
    await expect(invalidMermaid).toHaveAttribute('data-mermaid-state', 'error', { timeout: 30000 })
    await expect(invalidMermaid.locator('.tr-markdown__mermaid-source').first()).toContainText('Start -->')
    await expect(invalidMermaid.getByRole('button', { name: 'Retry' })).toBeVisible()
  })

  test('renders standalone video tags as first-party media nodes without enabling raw HTML', async ({ mount }) => {
    const component = await mount(TrMarkdownStory, {
      props: {
        content: videoContent,
      },
    })

    const videoWrap = component.locator('.tr-markdown__video-wrap').first()
    const video = videoWrap.locator('.tr-markdown__video').first()

    await expect(videoWrap).toHaveCount(1)
    await expect(video).toHaveAttribute(
      'src',
      'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    )
    await expect(video).toHaveAttribute(
      'poster',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    )
    await expect(video).toHaveAttribute('preload', 'metadata')
    await expect(video).toHaveAttribute('controls', '')
    await expect(component).toContainText('A standalone')
    await expect(component.locator('.tr-markdown__link')).toHaveCount(0)
  })

  test('enables markdown-owned image gallery only when the feature is on', async ({ mount, page }) => {
    const disabled = await mount(TrMarkdownStory, {
      props: {
        content: imageGalleryContent,
      },
    })

    await expect(disabled.locator('.tr-markdown__image')).toHaveCount(3)
    await expect(disabled.locator('[data-image-gallery-trigger="true"]')).toHaveCount(0)
    await expect(disabled).toHaveAttribute('data-image-gallery-enabled', 'false')

    const enabled = await mount(TrMarkdownStory, {
      props: {
        content: imageGalleryContent,
        features: {
          imageGallery: {
            closeOnEscape: true,
            enabled: true,
            showCaption: true,
          },
        },
      },
    })

    await expect(enabled).toHaveAttribute('data-image-gallery-enabled', 'true')
    await expect(enabled).toHaveAttribute('data-image-gallery-count', '3')
    await expect(enabled.locator('[data-image-gallery-trigger="true"]')).toHaveCount(3)

    await enabled.locator('[data-image-gallery-trigger="true"]').first().click()

    const gallery = page.locator('[data-image-gallery="true"]').first()
    await expect(gallery).toBeVisible()
    await expect(gallery).toHaveAttribute('data-image-gallery-current-index', '0')
    await expect(gallery.locator('.tr-markdown__image-gallery-caption')).toContainText('Desk setup')
    await expect(gallery.locator('.tr-markdown__image-gallery-thumbnail')).toHaveCount(3)

    await gallery.getByRole('button', { name: 'Next image' }).click()
    await expect(gallery).toHaveAttribute('data-image-gallery-current-index', '1')
    await expect(gallery.locator('.tr-markdown__image-gallery-caption')).toContainText('Ops wall')

    await gallery.locator('.tr-markdown__image-gallery-thumbnail').nth(2).click()
    await expect(gallery).toHaveAttribute('data-image-gallery-current-index', '2')
    await expect(gallery.locator('.tr-markdown__image-gallery-caption')).toContainText('Team board')

    await page.keyboard.press('Escape')
    await expect(gallery).toHaveCount(0)
  })
})
