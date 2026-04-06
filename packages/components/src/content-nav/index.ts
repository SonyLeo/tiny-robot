import { App } from 'vue'
import ContentNav from './index.vue'

ContentNav.name = 'TrContentNav'

const install = function <T>(app: App<T>) {
  app.component(ContentNav.name!, ContentNav)
}

ContentNav.install = install

export default ContentNav as typeof ContentNav & { install: typeof install }

export * from './index.type'
export {
  createContentNavFlashFeedback,
  createContentNavOutlinePulseFeedback,
  createNearestCenterResolver,
  createTopThresholdActiveResolver,
  defaultContentNavActiveResolver,
  defaultContentNavSearchMatcher,
  createContentNavFlashFeedback as createFlashJumpFeedback,
  createTopThresholdActiveResolver as createTopThresholdResolver,
} from './defaults'
export * from './useContentNavRegistry'
export * from './useContentNavScrollSpy'
export * from './useContentNavState'
export {
  provideContentNavScrollContainer,
  useContentNavScrollContainer,
  useContentNavScrollContainer as useScrollContainerContext,
} from './useScrollContainerContext'
