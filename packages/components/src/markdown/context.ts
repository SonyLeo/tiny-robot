import { inject, provide } from 'vue'
import type { InjectionKey } from 'vue'
import type {
  TrMarkdownCitationItem,
  TrMarkdownComponentMap,
  TrMarkdownComponentPropsMap,
  TrMarkdownCodeConfig,
  TrMarkdownFeatureFlags,
  TrMarkdownLinkConfig,
  TrMarkdownProps,
  TrMarkdownRenderOptions,
  TrMarkdownRenderNode,
} from './index.type'

export interface TrMarkdownContext {
  variant: NonNullable<TrMarkdownProps['variant']>
  features: TrMarkdownFeatureFlags
  code: TrMarkdownCodeConfig
  link: TrMarkdownLinkConfig
  citations: TrMarkdownCitationItem[]
  components: Partial<TrMarkdownComponentMap>
  componentProps: TrMarkdownComponentPropsMap
  renderOptions: TrMarkdownRenderOptions
  imageGalleryIndexMap?: WeakMap<TrMarkdownRenderNode, number>
  openImageGallery?: (index: number) => void
}

export const TR_MARKDOWN_CONTEXT_KEY: InjectionKey<TrMarkdownContext> = Symbol('TR_MARKDOWN_CONTEXT_KEY')

export const provideMarkdownContext = (context: TrMarkdownContext) => {
  provide(TR_MARKDOWN_CONTEXT_KEY, context)
}

export const useMarkdownContext = () => {
  return inject(TR_MARKDOWN_CONTEXT_KEY)
}
