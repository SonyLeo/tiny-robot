import remend, { INCOMPLETE_IMAGE_PLACEHOLDER } from 'remend'
import { markdownItAdapter } from '../../packages/components/src/markdown/parser/markdownItAdapter'
import {
  resolveMarkdownStreamState,
  resolveStreamingConfig,
} from '../../packages/components/src/markdown/stream/useMarkdownStreamState'

const streaming = resolveStreamingConfig({
  enabled: true,
  active: true,
  showTail: true,
  showCursor: true,
  smoothingChars: 8,
})

const scenarios = [
  {
    id: 'zh-emphasis',
    title: 'Chinese emphasis without spaces',
    source: '这是**重要内容**，也是*重点*。',
    cuts: [4, 7, 12, 17, 23, 28],
    target: 'emphasis',
  },
  {
    id: 'nested-emphasis',
    title: 'Nested emphasis',
    source: '这是***粗斜体以及**嵌套**文本***。',
    cuts: [3, 6, 11, 16, 22, 29],
    target: 'emphasis',
  },
  {
    id: 'half-link',
    title: 'Half link',
    source: '查看[项目文档](https://example.com/docs)然后继续。',
    cuts: [3, 7, 12, 18, 25, 34],
    target: 'link',
  },
  {
    id: 'half-image',
    title: 'Half image',
    source: '图片：![流程图](https://example.com/flow.png)结束。',
    cuts: [4, 9, 14, 20, 29, 39],
    target: 'image',
  },
  {
    id: 'inline-code',
    title: 'Inline code',
    source: '调用 `streaming.active` 后继续。',
    cuts: [3, 7, 12, 19, 25],
    target: 'code',
  },
  {
    id: 'currency',
    title: 'Currency dollar',
    source: '价格是 $20，折后 $18。',
    cuts: [4, 9, 14, 19],
    target: 'currency',
  },
  {
    id: 'block-math',
    title: 'Unclosed block math',
    source: '面积：\n\n$$a^2 + b^2 = c^2\n\n结论。',
    cuts: [5, 11, 17, 25, 32],
    target: 'math',
  },
  {
    id: 'fence',
    title: 'Open fence',
    source: '代码：\n\n```ts\nconst value = `**literal**`\nconsole.log(value)\n```\n结束。',
    cuts: [4, 10, 16, 26, 41, 57],
    target: 'fence',
  },
  {
    id: 'table',
    title: 'Table row',
    source: '| 名称 | 状态 |\n| --- | --- |\n| remend | 完成 |\n| current | 保留 |\n',
    cuts: [5, 13, 21, 30, 42, 53],
    target: 'table',
  },
  {
    id: 'html',
    title: 'HTML fragment',
    source: '文本 <span class="note">标记</span> 结束。',
    cuts: [3, 8, 15, 23, 32],
    target: 'html',
  },
  {
    id: 'cjk-punctuation',
    title: 'CJK punctuation markers',
    source: '结论：**通过**；下一步是 _验证_。',
    cuts: [3, 6, 11, 16, 22, 28],
    target: 'emphasis',
  },
]

const rewrites = [
  { id: 'rewrite-link-to-text', source: '查看[项目文档](https://example.com/docs)' },
  { id: 'rewrite-emphasis', source: '先是**旧内容**，然后替换为*新内容*。' },
  { id: 'rewrite-fence', source: '```js\nconst next = true\n```\n完成。' },
]

const clone = (value) => JSON.parse(JSON.stringify(value))

const nodeSignature = (nodes) => {
  const result = []
  const visit = (node) => {
    const attrs = node.attrs || {}
    result.push({
      type: node.type,
      tag: node.tag || undefined,
      text: node.type === 'text' ? node.text || '' : undefined,
      href: typeof attrs.href === 'string' ? attrs.href : undefined,
      src: typeof attrs.src === 'string' ? attrs.src : undefined,
      children: node.children?.length || 0,
    })
    for (const child of node.children || []) visit(child)
  }
  for (const node of nodes) visit(node)
  return result
}

const parseSignature = async (source, options = { html: true, linkify: true, math: true }) => {
  const nodes = await markdownItAdapter.parse(source, options)
  return nodeSignature(nodes)
}

const findLinks = (signature) => signature.filter((node) => node.type === 'link' || node.type === 'image')

const inspectPlaceholderDom = (signature) => {
  const link = findLinks(signature).find((node) => typeof node.href === 'string' && node.href.startsWith('streamdown:'))
  const image = findLinks(signature).find((node) => node.src === INCOMPLETE_IMAGE_PLACEHOLDER)
  const anchor = document.createElement('a')
  const imageElement = document.createElement('img')
  if (link?.href) anchor.setAttribute('href', link.href)
  if (image?.src) imageElement.setAttribute('src', image.src)
  return {
    linkAttribute: link?.href,
    linkDomHref: link ? anchor.href : undefined,
    imageAttribute: image?.src,
    imageDomSrc: image ? imageElement.src : undefined,
  }
}

const hasPlaceholder = (signature) =>
  findLinks(signature).some(
    (node) =>
      (typeof node.href === 'string' && node.href.startsWith('streamdown:')) ||
      node.src === INCOMPLETE_IMAGE_PLACEHOLDER,
  )

const containsType = (signature, types) => signature.some((node) => types.includes(node.type))

const expectedTargetTypes = {
  emphasis: ['strong', 'emphasis'],
  link: ['link'],
  image: ['image'],
  code: ['inline-code'],
  math: ['math-inline', 'math-block'],
  fence: ['fence', 'code_block'],
  table: ['table_open'],
  html: ['html-inline', 'html-block'],
  currency: ['math-inline', 'math-block'],
}

const makePreview = async (source, mode) => {
  const repaired =
    mode === 'current' ? undefined : remend(source, mode === 'remend-text-only' ? { linkMode: 'text-only' } : undefined)
  if (mode === 'current') {
    const state = resolveMarkdownStreamState(source, streaming)
    return {
      source,
      repaired: undefined,
      stableContent: state.stableContent,
      tailContent: state.tailContent,
      tailKind: state.tailKind,
      signature: await parseSignature(state.stableContent),
      previewSignature: await parseSignature(state.stableContent),
      placeholder: false,
      placeholderDom: {},
    }
  }

  const signature = await parseSignature(repaired)
  return {
    source,
    repaired,
    stableContent: repaired,
    tailContent: '',
    tailKind: 'text',
    signature,
    previewSignature: signature,
    placeholder: hasPlaceholder(signature),
    placeholderDom: inspectPlaceholderDom(signature),
  }
}

const createStep = async (scenario, source, step, kind) => {
  const [current, protocol, textOnly] = await Promise.all([
    makePreview(source, 'current'),
    makePreview(source, 'remend-protocol'),
    makePreview(source, 'remend-text-only'),
  ])
  const originalStaticState = resolveMarkdownStreamState(scenario.source, { ...streaming, active: false })
  const finalSignature = await parseSignature(scenario.source)
  const originalStaticSignature = await parseSignature(originalStaticState.stableContent)
  const targetTypes = expectedTargetTypes[scenario.target] || []
  const currentTarget = containsType(current.previewSignature, targetTypes)
  const protocolTarget = containsType(protocol.previewSignature, targetTypes)
  const textOnlyTarget = containsType(textOnly.previewSignature, targetTypes)
  return {
    scenarioId: scenario.id,
    title: scenario.title,
    target: scenario.target,
    kind,
    step,
    source,
    sourceLength: source.length,
    current: clone(current),
    remendProtocol: clone(protocol),
    remendTextOnly: clone(textOnly),
    finalSignature,
    metrics: {
      currentTarget,
      protocolTarget,
      textOnlyTarget,
      // A full source prefix is the finalize case. The current renderer may
      // keep its ordinary smoothing tail as raw text even when the source is
      // already syntactically complete, so it is not a fair temporary-parser
      // comparison. Count benefits only for genuinely incomplete append steps.
      protocolBenefit: kind === 'append' && source !== scenario.source && protocolTarget && !currentTarget,
      textOnlyBenefit: kind === 'append' && source !== scenario.source && textOnlyTarget && !currentTarget,
      protocolPlaceholder: protocol.placeholder,
      textOnlyPlaceholder: textOnly.placeholder,
      stableInvariant: current.stableContent + current.tailContent === source,
      protocolChangedSource: protocol.repaired !== source,
      textOnlyChangedSource: textOnly.repaired !== source,
      finalizeCurrentMatchesOriginal:
        kind === 'finalize' &&
        originalStaticState.stableContent === scenario.source &&
        originalStaticState.tailContent === '' &&
        JSON.stringify(originalStaticSignature) === JSON.stringify(finalSignature),
      protocolPreviewMatchesOriginal:
        kind === 'append' && JSON.stringify(protocol.previewSignature) === JSON.stringify(finalSignature),
      textOnlyPreviewMatchesOriginal:
        kind === 'append' && JSON.stringify(textOnly.previewSignature) === JSON.stringify(finalSignature),
    },
  }
}

const run = async () => {
  const steps = []
  for (const scenario of scenarios) {
    const cuts = [...new Set(scenario.cuts.filter((cut) => cut > 0 && cut < scenario.source.length))]
    for (let index = 0; index < cuts.length; index += 1) {
      steps.push(await createStep(scenario, scenario.source.slice(0, cuts[index]), index + 1, 'append'))
    }
    steps.push(await createStep(scenario, scenario.source, cuts.length + 1, 'finalize'))
  }
  for (const rewrite of rewrites) {
    steps.push(
      await createStep(
        { id: rewrite.id, title: rewrite.id, source: rewrite.source, target: 'emphasis' },
        rewrite.source,
        1,
        'rewrite',
      ),
    )
  }

  const metrics = {
    totalSteps: steps.length,
    appendSteps: steps.filter((step) => step.kind === 'append').length,
    finalizeSteps: steps.filter((step) => step.kind === 'finalize').length,
    rewriteSteps: steps.filter((step) => step.kind === 'rewrite').length,
    protocolBenefits: steps.filter((step) => step.metrics.protocolBenefit).length,
    textOnlyBenefits: steps.filter((step) => step.metrics.textOnlyBenefit).length,
    protocolPlaceholderSteps: steps.filter((step) => step.metrics.protocolPlaceholder).length,
    textOnlyPlaceholderSteps: steps.filter((step) => step.metrics.textOnlyPlaceholder).length,
    protocolSourceMutations: steps.filter((step) => step.metrics.protocolChangedSource).length,
    textOnlySourceMutations: steps.filter((step) => step.metrics.textOnlyChangedSource).length,
    stableInvariantFailures: steps.filter((step) => !step.metrics.stableInvariant).length,
    finalizeOriginalMismatches: steps.filter(
      (step) => step.kind === 'finalize' && !step.metrics.finalizeCurrentMatchesOriginal,
    ).length,
  }

  const result = {
    generatedAt: new Date().toISOString(),
    remendVersion: '1.5.0',
    source: 'current packages/components/src/markdown stream state and markdownItAdapter',
    streaming,
    scenarios: scenarios.map(({ id, title, source, target, cuts }) => ({ id, title, source, target, cuts })),
    rewrites,
    metrics,
    steps,
  }
  window.__PHASE5_RESULT__ = result
  document.querySelector('#status').textContent = 'complete'
  document.querySelector('#report').innerHTML =
    `<pre>${escapeHtml(JSON.stringify({ metrics, firstStep: steps[0] }, null, 2))}</pre>`
}

const escapeHtml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

run().catch((error) => {
  document.querySelector('#status').textContent = `failed: ${error?.stack || error}`
  window.__PHASE5_ERROR__ = String(error?.stack || error)
})
