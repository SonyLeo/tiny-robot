import { expect, test } from '@playwright/experimental-ct-vue'
import {
  trMarkdownPhase0StaticFixtures,
  trMarkdownPhase0StreamingFixtures,
} from '../../../components/src/markdown/fixtures/phase0'
import TrMarkdownPhase0Story from './TrMarkdownPhase0.story.vue'

const basicStreaming = {
  active: true,
  enabled: true,
  showCursor: true,
  showTail: true,
  smoothingChars: 8,
} as const

const getStaticFixture = (id: string) => {
  const fixture = trMarkdownPhase0StaticFixtures.find((item) => item.id === id)
  if (!fixture) throw new Error(`Missing phase 0 static fixture: ${id}`)
  return fixture
}

test.describe('TrMarkdown phase 0 baseline fixtures', () => {
  test('covers the representative static corpus and stable semantic contracts', async ({ mount }) => {
    const structure = getStaticFixture('chinese-structure')
    const component = await mount(TrMarkdownPhase0Story, {
      props: { content: structure.content },
    })

    await expect(component.locator('[data-testid="phase0-standalone"]')).toBeVisible()
    await expect(component.locator('h1')).toHaveText('团队周报')
    await expect(component.locator('h2')).toHaveCount(1)
    await expect(component.locator('.tr-markdown__task-checkbox')).toHaveCount(2)
    await expect(component.locator('.tr-markdown__list ul')).toHaveCount(1)

    const orderedTable = getStaticFixture('ordered-table')
    await component.update({ props: { content: orderedTable.content } })
    await expect(component.locator('ol')).toHaveCount(1)
    await expect(component.locator('ol > li')).toHaveCount(3)
    await expect(component.locator('ol > li').first()).toContainText('先确认构建产物和变更日志')
    // TODO(phase 3): forward markdown-it's ordered-list start attribute to <ol>.
    await expect(component.locator('ol')).not.toHaveAttribute('start')
    await expect(component.locator('.tr-markdown__table')).toHaveCount(1)
    await expect(component.locator('th')).toHaveCount(3)
    await expect(component.locator('th').nth(0)).toHaveText('项目')
    await expect(component.locator('th').nth(1)).toHaveText('状态')
    await expect(component.locator('th').nth(2)).toHaveText('说明')

    const alerts = getStaticFixture('quote-alert')
    await component.update({
      props: {
        content: alerts.content,
      },
    })
    await expect(component.locator('.tr-markdown__alert')).toHaveCount(0)
    await expect(component.locator('.tr-markdown__blockquote')).toContainText('[!TIP]')

    const code = getStaticFixture('code-languages')
    await component.update({ props: { content: code.content } })
    await expect(component.locator('.tr-markdown__code-block-wrap')).toHaveCount(4)
    await expect(component.locator('.tr-markdown-root')).toContainText('BEGIN signal -> stable -> done')
  })

  test('keeps dangerous protocols and rich syntax within safe fallback boundaries', async ({ mount }) => {
    const security = getStaticFixture('security-boundaries')
    const component = await mount(TrMarkdownPhase0Story, {
      props: {
        content: security.content,
        features: {
          html: true,
          math: { enabled: true },
          mermaid: { enabled: true, defaultMode: 'preview' },
        },
      },
    })

    const markdownRoot = component.locator('.tr-markdown-root')
    await expect(markdownRoot.locator('script')).toHaveCount(0)
    await expect(markdownRoot.locator('[onerror], [onload], [onclick]')).toHaveCount(0)
    await expect(markdownRoot.locator('a[href^="javascript:"]')).toHaveCount(0)
    await expect(markdownRoot.locator('img[src^="data:image/svg+xml"]')).toHaveCount(0)
    await expect(markdownRoot).not.toContainText('__tinyRobotUnsafeRawHtml')
    await expect(markdownRoot).not.toContainText('__tinyRobotUnsafeSvg')
    const mathBlock = component.locator('.tr-markdown__math-block-wrap')
    await expect(mathBlock).toHaveAttribute('data-math-state', 'ready', { timeout: 20000 })
    await expect(mathBlock.locator('a[href^="javascript:"]')).toHaveCount(0)

    const invalidMermaid = component.locator('[data-code-type="mermaid"]').first()
    await expect(invalidMermaid).toHaveAttribute('data-mermaid-state', 'error', { timeout: 30000 })
    await expect(invalidMermaid.locator('.tr-markdown__mermaid-source').first()).toContainText('Start -->')
  })

  test('keeps the production default standalone and Bubble screenshot surfaces stable', async ({ mount }) => {
    const content = getStaticFixture('chinese-structure').content
    const standalone = await mount(TrMarkdownPhase0Story, {
      props: { content, mode: 'standalone', theme: 'light' },
    })
    await expect(standalone).toHaveScreenshot('phase0-standalone-light.png', { animations: 'disabled' })

    const bubble = await mount(TrMarkdownPhase0Story, {
      props: { content, mode: 'bubble', theme: 'light' },
    })
    await expect(bubble).toHaveScreenshot('phase0-bubble-light.png', { animations: 'disabled' })
  })

  test.describe('narrow dark surface', () => {
    test.use({ viewport: { width: 375, height: 900 } })

    test('captures the Bubble narrow dark baseline', async ({ mount }) => {
      const narrowDark = await mount(TrMarkdownPhase0Story, {
        props: { content: getStaticFixture('chinese-structure').content, mode: 'bubble', theme: 'dark' },
      })
      await expect(narrowDark).toHaveScreenshot('phase0-bubble-dark-narrow.png', { animations: 'disabled' })
    })
  })

  test('replays deterministic incomplete syntax, rewrite, append and finalize steps', async ({ mount }) => {
    for (const fixture of trMarkdownPhase0StreamingFixtures) {
      expect(fixture.operations).toEqual(['append', 'rewrite', 'delete', 'finalize'])
      expect(fixture.steps.map(({ operation }) => operation)).toEqual([
        'append',
        'append',
        'rewrite',
        'delete',
        'finalize',
      ])
      const component = await mount(TrMarkdownPhase0Story, {
        props: {
          content: fixture.steps[0].content,
          mode: 'standalone',
          variant: 'default',
        },
      })

      for (const step of fixture.steps.slice(0, -1)) {
        await component.update({
          props: {
            content: step.content,
            streaming: basicStreaming,
          },
        })

        if (step.expectedTailKind) {
          await expect(component.locator(`.tr-markdown__stream-tail--${step.expectedTailKind}`)).toBeVisible()
        }
        if (step.expectedTailText) {
          await expect(component.locator('.tr-markdown__stream-tail')).toContainText(step.expectedTailText)
        }
      }

      await component.update({
        props: {
          content: fixture.finalContent,
          streaming: {
            ...basicStreaming,
            active: false,
          },
        },
      })
      await expect(component.locator('.tr-markdown__stream-tail')).toHaveCount(0)
      await expect(component.locator('.tr-markdown-root')).toHaveAttribute('data-stream-state', 'finalized')

      const finalizedText = await component.locator('.tr-markdown-root').innerText()
      const staticComponent = await mount(TrMarkdownPhase0Story, {
        props: { content: fixture.finalContent, mode: 'standalone', variant: 'default' },
      })
      const staticText = await staticComponent.locator('.tr-markdown-root').innerText()
      expect(finalizedText.replace(/\s+/g, ' ').trim()).toBe(staticText.replace(/\s+/g, ' ').trim())
    }
  })
})
