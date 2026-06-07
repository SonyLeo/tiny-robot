import { h, mergeProps, type VNodeChild } from 'vue'
import type { TrMarkdownRenderNode } from '../../index.type'
import AlertBlock from '../../components/alerts/AlertBlock.vue'
import Citation from '../../components/citations/Citation.vue'
import ArtifactBlock from '../../components/custom/ArtifactBlock.vue'
import ThinkingBlock from '../../components/custom/ThinkingBlock.vue'
import FootnoteBackref from '../../components/footnotes/FootnoteBackref.vue'
import FootnoteBlock from '../../components/footnotes/FootnoteBlock.vue'
import FootnoteItem from '../../components/footnotes/FootnoteItem.vue'
import FootnoteRef from '../../components/footnotes/FootnoteRef.vue'
import MathBlock from '../../components/math/MathBlock.vue'
import MathInline from '../../components/math/MathInline.vue'
import { resolveMathConfig } from '../../components/math/utils'
import { resolveAlertBlock, resolveAlertConfig } from '../alerts'
import { resolveCitationRenderProps } from '../citations'
import type { TrMarkdownRenderHelpers } from './shared'

export const renderExtensionNode = (
  node: TrMarkdownRenderNode,
  helpers: TrMarkdownRenderHelpers,
): VNodeChild | undefined => {
  const components = helpers.context.components
  const alertConfig = resolveAlertConfig(helpers.context.features.alerts)
  const mathConfig = resolveMathConfig(helpers.context.features.math)

  switch (node.type) {
    case 'blockquote_open': {
      const resolvedAlert = alertConfig.enabled ? resolveAlertBlock(node) : null

      if (!resolvedAlert) {
        return undefined
      }

      const AlertComponent = components.alertBlock || AlertBlock
      const alertProps = helpers.resolveComponentProps(['alertBlock'], {
        kind: resolvedAlert.kind,
        title: resolvedAlert.title,
      })
      const renderChildren = () => helpers.renderChildren(resolvedAlert.children)
      const renderDefault = (overrideProps: Record<string, unknown> = {}) =>
        h(AlertComponent, mergeProps(alertProps, overrideProps), () => renderChildren())
      const alertRender = helpers.context.renderOptions.alerts?.render

      if (alertRender) {
        return alertRender({
          kind: resolvedAlert.kind,
          title: resolvedAlert.title,
          node,
          component: AlertComponent,
          props: { ...alertProps },
          renderChildren,
          renderDefault,
        })
      }

      return renderDefault()
    }
    case 'footnote-ref':
      return h(
        components.footnoteRef || FootnoteRef,
        helpers.resolveComponentProps(['footnoteRef'], {
          id: node.attrs?.id,
          subId: node.attrs?.subId,
          label: typeof node.attrs?.label === 'string' ? node.attrs.label : undefined,
        }),
      )
    case 'footnote-block':
      return h(
        components.footnoteBlock || FootnoteBlock,
        helpers.resolveComponentProps(['footnoteBlock'], {
          label: typeof node.attrs?.label === 'string' ? node.attrs.label : undefined,
        }),
        () => helpers.renderChildren(node.children),
      )
    case 'footnote-item':
      return h(
        components.footnoteItem || FootnoteItem,
        helpers.resolveComponentProps(['footnoteItem'], {
          id: node.attrs?.id,
          label: typeof node.attrs?.label === 'string' ? node.attrs.label : undefined,
        }),
        () => helpers.renderChildren(node.children),
      )
    case 'footnote-backref':
      return h(
        components.footnoteBackref || FootnoteBackref,
        helpers.resolveComponentProps(['footnoteBackref'], {
          id: node.attrs?.id,
          subId: node.attrs?.subId,
          label: typeof node.attrs?.label === 'string' ? node.attrs.label : undefined,
        }),
      )
    case 'citation':
      return h(
        components.citation || Citation,
        helpers.resolveComponentProps(
          ['citation'],
          resolveCitationRenderProps(helpers.context.citations, {
            href: typeof node.attrs?.href === 'string' ? node.attrs.href : undefined,
            index: node.attrs?.index,
            label: node.attrs?.label,
          }),
        ),
      )
    case 'thinking-block':
      return h(
        components.thinkingBlock || ThinkingBlock,
        helpers.resolveComponentProps(['thinkingBlock'], {
          title: typeof node.attrs?.title === 'string' ? node.attrs.title : undefined,
          content: node.text || '',
          defaultOpen: node.attrs?.open === 'true',
        }),
      )
    case 'artifact-block':
      return h(
        components.artifactBlock || ArtifactBlock,
        helpers.resolveComponentProps(['artifactBlock'], {
          identifier: typeof node.attrs?.identifier === 'string' ? node.attrs.identifier : undefined,
          title: typeof node.attrs?.title === 'string' ? node.attrs.title : undefined,
          type: typeof node.attrs?.type === 'string' ? node.attrs.type : undefined,
          language: typeof node.attrs?.language === 'string' ? node.attrs.language : undefined,
          content: node.text || '',
        }),
      )
    case 'math-inline':
      return h(
        components.mathInline || MathInline,
        helpers.resolveComponentProps(['mathInline'], {
          formula: node.text || '',
        }),
      )
    case 'math-block':
      return h(
        components.mathBlock || MathBlock,
        helpers.resolveComponentProps(['mathBlock'], {
          copyable: mathConfig.copyable !== false,
          formula: node.text || '',
        }),
      )
    default:
      return undefined
  }
}
