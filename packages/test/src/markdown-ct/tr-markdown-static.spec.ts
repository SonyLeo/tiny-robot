import { expect, test } from '@playwright/experimental-ct-vue'
import TrMarkdownStory from './TrMarkdown.story.vue'

const basicContent = `# Markdown Title

Paragraph with [link](https://example.com) and \`inline code\`.

This sentence is followed by a forced break.<br />
The next sentence should render on a new line.

> This is a blockquote.

- list item one
- list item two

- [ ] task list item
- [x] task list item done

This is a <ins>underlined</ins> text with H<sub>2</sub>O and E = mc<sup>2</sup>.

Press <kbd>Ctrl</kbd> + <kbd>K</kbd>.

| Name | Type | Description |
| --- | --- | --- |
| id | number | Unique identifier |
| active | boolean | Whether the item is active |

---`

const componentPropsContent = `# Component props heading

Use a [custom link](https://docs.opentiny.design/tiny-robot/) and a custom \`inline token\`.

This paragraph stays on the default node component path.`

const componentProps = {
  heading: {
    badge: 'M5.7',
  },
  inlineCode: {
    label: 'TOKEN',
    tone: 'brand',
  },
  link: {
    tone: 'brand',
  },
  paragraph: {
    'data-component-props-paragraph': 'true',
  },
}

const citations = [
  {
    summary: '提供杭州近几天的逐日天气概览与气温范围。',
    title: '中国天气网杭州预报',
    url: 'https://www.weather.com.cn/weather/101210101.shtml',
  },
  {
    summary: '提供站点级天气数据与降水趋势。',
    title: '中央气象台杭州站点',
    url: 'https://weather.cma.cn/web/weather/58457.html',
  },
  {
    summary: '补充未来几天的体感与趋势预测信息。',
    title: 'AccuWeather Hangzhou',
    url: 'https://www.accuweather.com/zh/cn/hangzhou/106832/weather-forecast/106832',
  },
]

const citationsGeneralContent = `杭州未来几天以阴雨和多云为主[1][2]。

- 明天有小雨[2]
- 周末开始逐步转多云[3]`

const citationsCodeBoundaryContent = `这里的 \`coord[1]\` 只是普通数组索引。

\`\`\`ts
const coord = [12, 34, 56]
console.log(coord[1])
\`\`\`

只有正文里的天气结论[1] 才应该被识别成第一方引用节点。`

const alertsMatrixContent = `> [!NOTE]
> TinyRobot treats GitHub alerts as first-party callouts.
>
> Regular **markdown** content, [links](https://example.com), and \`code\` still render inside.

> [!TIP]
> Keep alert detection inside render.

> [!IMPORTANT]
> Public docs and tests should move together.

> [!WARNING]
> Only GitHub's five official alert kinds are upgraded.

> [!CAUTION]
> Normal blockquotes must not be upgraded accidentally.`

const alertsCompareContent = `> Plain blockquotes should stay on the default quote path.

> [!TIP] Same-line alerts should work without leaking the marker.

> [!WARNING]
> The marker should disappear from the first paragraph.
>
> A follow-up paragraph should stay inside the same alert block.`

const footnotesSingleContent = `TinyRobot keeps a note handy.[^1]

[^1]: Footnotes should feel first-party, readable, and easy to jump back from.`

const footnotesRepeatedContent = `Same footnote.[^a] Again.[^a]

[^a]: Shared note with [link](https://example.com) and \`code\` inside the same footnote body.`

const footnotesInlineContent = `Inline footnote syntax also works.^[Inline note body with **emphasis** and an easy return path.]`

const customSemanticContent = `Before custom blocks.

<tr-thinking title="Why this becomes a first-party block">
This request should render as a first-party reasoning block.
</tr-thinking>

<tr-artifact identifier="sleep-interpretation-card" type="image/svg+xml" title="睡觉的新解释">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 160"></svg>
</tr-artifact>

<tr-unknown title="future">Unsupported tag should stay literal.</tr-unknown>`

test.describe('TrMarkdown static component contracts', () => {
  test('renders basic markdown structure and variants without the demo page', async ({ mount }) => {
    const component = await mount(TrMarkdownStory, {
      props: {
        content: basicContent,
        features: {
          html: true,
        },
        link: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      },
    })

    await expect(component).toHaveClass(/tr-markdown--default/)
    await expect(component.getByRole('heading', { name: 'Markdown Title' })).toHaveCount(1)
    await expect(component.locator('.tr-markdown__blockquote')).toContainText('This is a blockquote.')
    await expect(component.locator('.tr-markdown__table')).toContainText('Unique identifier')
    await expect(component.locator('.tr-markdown__link').first()).toHaveAttribute('target', '_blank')
    await expect(component.locator('.tr-markdown__link').first()).toHaveAttribute('rel', 'noopener noreferrer')
    await expect(component.locator('br')).toHaveCount(1)
    await expect(component.locator('.tr-markdown__task-checkbox')).toHaveCount(2)
    await expect(component.locator('.tr-markdown__task-checkbox').nth(1)).toBeChecked()
    await expect(component.locator('.tr-markdown__underline')).toContainText('underlined')
    await expect(component.locator('.tr-markdown__subscript')).toContainText('2')
    await expect(component.locator('.tr-markdown__superscript')).toContainText('2')
    await expect(component.locator('.tr-markdown__kbd').first()).toContainText('Ctrl')

    await component.update({
      props: {
        content: basicContent,
        variant: 'article',
      },
    })

    await expect(component).toHaveClass(/tr-markdown--article/)
  })

  test('passes componentProps to default and custom markdown components', async ({ mount }) => {
    const component = await mount(TrMarkdownStory, {
      props: {
        componentProps,
        content: componentPropsContent,
        fixture: 'component-props',
        link: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      },
    })

    const heading = component.locator('.markdown-ct__custom-heading').first()
    const link = component.locator('.markdown-ct__custom-link').first()
    const inlineCode = component.locator('.markdown-ct__custom-inline-code').first()
    const paragraphs = component.locator('.tr-markdown__paragraph[data-component-props-paragraph="true"]')

    await expect(heading).toHaveAttribute('data-heading-badge', 'M5.7')
    await expect(heading.locator('[data-custom-heading-badge="true"]')).toContainText('M5.7')
    await expect(link).toHaveAttribute('data-link-tone', 'brand')
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link.locator('[data-custom-link-icon="true"]')).toContainText('BRAND')
    await expect(inlineCode).toHaveAttribute('data-inline-label', 'TOKEN')
    await expect(inlineCode).toHaveAttribute('data-inline-tone', 'brand')
    await expect(inlineCode).toContainText('inline token')
    await expect(paragraphs).toHaveCount(2)
  })

  test('renders first-party citations and keeps code boundaries untouched', async ({ mount }) => {
    const general = await mount(TrMarkdownStory, {
      props: {
        citations,
        content: citationsGeneralContent,
      },
    })

    await expect(general.locator('[data-citation-trigger="true"]')).toHaveCount(4)
    await expect(general.locator('.tr-markdown__citation')).toHaveCount(4)
    await expect(general.locator('[data-citation-trigger="true"]').first()).toHaveAttribute(
      'data-citation-url',
      'https://www.weather.com.cn/weather/101210101.shtml',
    )

    const boundary = await mount(TrMarkdownStory, {
      props: {
        citations,
        content: citationsCodeBoundaryContent,
      },
    })

    await expect(boundary.locator('[data-citation-trigger="true"]')).toHaveCount(1)
    await expect(boundary.locator('.tr-markdown__inline-code')).toContainText('coord[1]')
    await expect(boundary.locator('.tr-markdown__code-block-wrap')).toContainText('console.log(coord[1])')
    await expect(boundary.locator('.tr-markdown__code-block-wrap [data-citation-trigger="true"]')).toHaveCount(0)
    await expect(boundary.locator('.tr-markdown__inline-code [data-citation-trigger="true"]')).toHaveCount(0)
  })

  test('renders GitHub alerts only when enabled and leaves plain blockquotes alone', async ({ mount }) => {
    const disabled = await mount(TrMarkdownStory, {
      props: {
        content: alertsMatrixContent,
      },
    })

    await expect(disabled.locator('.tr-markdown__alert')).toHaveCount(0)
    await expect(disabled.locator('.tr-markdown__blockquote').first()).toContainText('[!NOTE]')

    const matrix = await mount(TrMarkdownStory, {
      props: {
        content: alertsMatrixContent,
        features: {
          alerts: {
            enabled: true,
          },
        },
      },
    })

    const kinds = [
      ['note', 'Note', 'note'],
      ['tip', 'Tip', 'note'],
      ['important', 'Important', 'note'],
      ['warning', 'Warning', 'alert'],
      ['caution', 'Caution', 'alert'],
    ] as const

    await expect(matrix.locator('.tr-markdown__alert')).toHaveCount(kinds.length)

    for (const [kind, title, role] of kinds) {
      const alert = matrix.locator(`.tr-markdown__alert[data-alert-kind="${kind}"]`).first()

      await expect(alert).toHaveAttribute('role', role)
      await expect(alert.locator('.tr-markdown__alert-title')).toContainText(title)
      await expect(alert).not.toContainText(`[!${title.toUpperCase()}]`)
    }

    const compare = await mount(TrMarkdownStory, {
      props: {
        content: alertsCompareContent,
        features: {
          alerts: {
            enabled: true,
          },
        },
      },
    })

    await expect(compare.locator('.tr-markdown__blockquote')).toHaveCount(1)
    await expect(compare.locator('.tr-markdown__alert')).toHaveCount(2)
    await expect(compare.locator('.tr-markdown__alert[data-alert-kind="tip"]')).not.toContainText('[!TIP]')
    await expect(compare.locator('.tr-markdown__alert[data-alert-kind="warning"]')).not.toContainText('[!WARNING]')
  })

  test('renders footnotes only when enabled and keeps repeated references wired', async ({ mount }) => {
    const disabled = await mount(TrMarkdownStory, {
      props: {
        content: footnotesSingleContent,
      },
    })

    await expect(disabled.locator('.tr-markdown__footnote-ref')).toHaveCount(0)
    await expect(disabled.locator('.tr-markdown__footnotes')).toHaveCount(0)
    await expect(disabled).toContainText('[^1]')

    const single = await mount(TrMarkdownStory, {
      props: {
        content: footnotesSingleContent,
        features: {
          footnotes: {
            enabled: true,
          },
        },
      },
    })

    await expect(single.locator('.tr-markdown__footnote-ref-link').first()).toHaveAttribute('href', '#fn1')
    await expect(single.locator('.tr-markdown__footnote-item').first()).toContainText(
      'Footnotes should feel first-party',
    )
    await expect(single.locator('.tr-markdown__footnote-backref').first()).toHaveAttribute('href', '#fnref1')

    const repeated = await mount(TrMarkdownStory, {
      props: {
        content: footnotesRepeatedContent,
        features: {
          footnotes: {
            enabled: true,
          },
        },
      },
    })

    await expect(repeated.locator('.tr-markdown__footnote-ref-link')).toHaveCount(2)
    await expect(repeated.locator('.tr-markdown__footnote-ref-link').nth(0)).toHaveAttribute('id', 'fnref1')
    await expect(repeated.locator('.tr-markdown__footnote-ref-link').nth(1)).toHaveAttribute('id', 'fnref1:1')
    await expect(repeated.locator('.tr-markdown__footnote-item .tr-markdown__link')).toHaveAttribute(
      'href',
      'https://example.com',
    )
    await expect(repeated.locator('.tr-markdown__footnote-backref')).toHaveCount(2)

    const inline = await mount(TrMarkdownStory, {
      props: {
        content: footnotesInlineContent,
        features: {
          footnotes: {
            enabled: true,
          },
        },
      },
    })

    await expect(inline.locator('.tr-markdown__footnote-ref-link').first()).toHaveAttribute('href', '#fn1')
    await expect(inline.locator('.tr-markdown__footnote-item').first()).toContainText('Inline note body')
    await expect(inline.locator('.tr-markdown__footnote-item strong')).toContainText('emphasis')
  })

  test('supports first-party custom semantic blocks and custom alert shells', async ({ mount }) => {
    const custom = await mount(TrMarkdownStory, {
      props: {
        content: customSemanticContent,
        fixture: 'custom-semantic',
      },
    })

    const thinking = custom.locator('[data-thinking-block="true"]').first()
    const artifact = custom.locator('[data-artifact-block="true"]').first()

    await expect(thinking).toHaveCount(1)
    await expect(thinking.locator('[data-thinking-body="true"]')).toContainText('first-party reasoning block')
    await expect(artifact).toHaveAttribute('data-artifact-identifier', 'sleep-interpretation-card')
    await expect(artifact).toHaveAttribute('data-artifact-type', 'image/svg+xml')
    await expect(artifact.locator('.tr-markdown__artifact-pre')).toContainText('<svg')
    await expect(
      custom.getByText('<tr-unknown title="future">Unsupported tag should stay literal.</tr-unknown>'),
    ).toHaveCount(1)

    const alert = await mount(TrMarkdownStory, {
      props: {
        content: alertsCompareContent,
        features: {
          alerts: {
            enabled: true,
          },
        },
        fixture: 'custom-alert',
      },
    })

    await expect(alert.locator('.markdown-ct__custom-alert')).toHaveCount(2)
    await expect(alert.locator('.tr-markdown__alert')).toHaveCount(0)
    await expect(alert.locator('.tr-markdown__blockquote')).toHaveCount(1)
    await expect(alert.locator('.markdown-ct__custom-alert[data-custom-alert-kind="warning"]')).toHaveAttribute(
      'role',
      'alert',
    )
  })
})
