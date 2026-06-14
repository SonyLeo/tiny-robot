import { computed, inject, provide, toValue } from 'vue'
import type { ComputedRef, InjectionKey, MaybeRefOrGetter } from 'vue'
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
  streaming: {
    active: boolean
    enabled: boolean
  }
  citations: TrMarkdownCitationItem[]
  components: Partial<TrMarkdownComponentMap>
  componentProps: TrMarkdownComponentPropsMap
  renderOptions: TrMarkdownRenderOptions
  imageGalleryIndexMap?: WeakMap<TrMarkdownRenderNode, number>
  openImageGallery?: (index: number) => void
}

export type TrMarkdownContextSource = MaybeRefOrGetter<TrMarkdownContext>

export const TR_MARKDOWN_CONTEXT_KEY: InjectionKey<ComputedRef<TrMarkdownContext>> = Symbol('TR_MARKDOWN_CONTEXT_KEY')

const contextProxyCache = new WeakMap<ComputedRef<TrMarkdownContext>, TrMarkdownContext>()

const createMarkdownContextProxy = (context: ComputedRef<TrMarkdownContext>) => {
  return new Proxy({} as TrMarkdownContext, {
    get(_, property) {
      return context.value[property as keyof TrMarkdownContext]
    },
    getOwnPropertyDescriptor(_, property) {
      return {
        configurable: true,
        enumerable: true,
        value: context.value[property as keyof TrMarkdownContext],
      }
    },
    has(_, property) {
      return property in context.value
    },
    ownKeys() {
      return Reflect.ownKeys(context.value)
    },
  })
}

export const provideMarkdownContext = (context: TrMarkdownContextSource) => {
  const resolvedContext = computed(() => toValue(context))
  provide(TR_MARKDOWN_CONTEXT_KEY, resolvedContext)
}

export const useMarkdownContextRef = () => {
  return inject(TR_MARKDOWN_CONTEXT_KEY)
}

export const useMarkdownContext = () => {
  const context = useMarkdownContextRef()

  if (!context) {
    return
  }

  const cachedContext = contextProxyCache.get(context)
  if (cachedContext) {
    return cachedContext
  }

  const proxyContext = createMarkdownContextProxy(context)
  contextProxyCache.set(context, proxyContext)
  return proxyContext
}
