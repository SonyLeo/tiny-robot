import { inject, provide } from 'vue'
import type { InjectionKey } from 'vue'
import type {
  TrMarkdownComponentMap,
  TrMarkdownCodeConfig,
  TrMarkdownFeatureFlags,
  TrMarkdownLinkConfig,
  TrMarkdownProps,
} from './index.type'

export interface TrMarkdownContext {
  variant: NonNullable<TrMarkdownProps['variant']>
  features: TrMarkdownFeatureFlags
  code: TrMarkdownCodeConfig
  link: TrMarkdownLinkConfig
  components: Partial<TrMarkdownComponentMap>
}

export const TR_MARKDOWN_CONTEXT_KEY: InjectionKey<TrMarkdownContext> = Symbol('TR_MARKDOWN_CONTEXT_KEY')

export const provideMarkdownContext = (context: TrMarkdownContext) => {
  provide(TR_MARKDOWN_CONTEXT_KEY, context)
}

export const useMarkdownContext = () => {
  return inject(TR_MARKDOWN_CONTEXT_KEY)
}
