import { expect, test } from '@playwright/experimental-ct-vue'
import TrMarkdownStory from './TrMarkdown.story.vue'

const pythonSource = `from dataclasses import dataclass

@dataclass
class User:
    name: str
    active: bool = True

def active_name(user: User) -> str:
    return user.name if user.active else ''`

const sqlSource = `SELECT id, name
FROM users
WHERE active = true
ORDER BY name;`

const yamlSource = `name: tiny-robot
services:
  web:
    image: opentiny/tiny-robot:latest`

const createFence = (language: string, source: string) => `\`\`\`${language}
${source}
\`\`\``

test.describe('TrMarkdown phase 4 highlight contracts', () => {
  test('supports Python, SQL, and YAML aliases while preserving source and copy action', async ({ mount, page }) => {
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (value: string) => {
            ;(window as Window & { __phase4Copied?: string }).__phase4Copied = value
          },
        },
      })
    })

    const component = await mount(TrMarkdownStory, {
      props: {
        content: [createFence('py', pythonSource), createFence('sql', sqlSource), createFence('yml', yamlSource)].join(
          '\n\n',
        ),
      },
    })

    const blocks = component.locator('.tr-markdown__code-block-wrap')
    await expect(blocks).toHaveCount(3)

    const pythonBlock = blocks.nth(0)
    await expect(pythonBlock.locator('.hljs')).toBeVisible()
    await expect(pythonBlock.locator('.hljs-keyword, .hljs-meta')).not.toHaveCount(0)
    await expect(pythonBlock.locator('.hljs')).toHaveText(pythonSource)
    await expect(pythonBlock.locator('.tr-markdown__copy-button')).toBeVisible()

    const sqlBlock = blocks.nth(1)
    await expect(sqlBlock.locator('.hljs')).toBeVisible()
    await expect(sqlBlock.locator('.hljs-keyword')).not.toHaveCount(0)
    await expect(sqlBlock.locator('.hljs')).toHaveText(sqlSource)

    const yamlBlock = blocks.nth(2)
    await expect(yamlBlock.locator('.hljs')).toBeVisible()
    await expect(yamlBlock.locator('.hljs-attr')).not.toHaveCount(0)
    await expect(yamlBlock.locator('.hljs')).toHaveText(yamlSource)

    const copyButton = pythonBlock.locator('.tr-markdown__copy-button')
    await copyButton.click()
    await expect(copyButton).toHaveAttribute('title', 'Copied')
    await expect
      .poll(() => page.evaluate(() => (window as Window & { __phase4Copied?: string }).__phase4Copied))
      .toBe(pythonSource)
  })

  test('keeps genuinely unsupported languages as exact plain text', async ({ mount }) => {
    const source = 'fn main() { println!("unsupported fixture"); }'
    const component = await mount(TrMarkdownStory, {
      props: {
        content: createFence('rust', source),
      },
    })

    const block = component.locator('.tr-markdown__code-block-wrap').first()
    await expect(block.locator('.tr-markdown__code-plain code')).toHaveText(source)
    await expect(block.locator('.hljs')).toHaveCount(0)
    await expect(block.locator('.tr-markdown__code-plain')).toContainText(source)
  })
})
