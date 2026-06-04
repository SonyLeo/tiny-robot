import type { App } from 'vue'
import LayoutComp from './Layout.vue'
import LayoutAsideComp from './LayoutAside.vue'
import LayoutAsideToggleComp from './LayoutAsideToggle.vue'
import LayoutMainComp from './LayoutMain.vue'

export * from './index.type'

LayoutMainComp.name = 'TrLayoutMain'

const layoutMainInstall = function <T>(app: App<T>) {
  app.component(LayoutMainComp.name!, LayoutMainComp)
}

const LayoutMain = LayoutMainComp as typeof LayoutMainComp & {
  install: typeof layoutMainInstall
}

LayoutMain.install = layoutMainInstall

LayoutAsideComp.name = 'TrLayoutAside'

const layoutAsideInstall = function <T>(app: App<T>) {
  app.component(LayoutAsideComp.name!, LayoutAsideComp)
}

const LayoutAside = LayoutAsideComp as typeof LayoutAsideComp & {
  install: typeof layoutAsideInstall
}

LayoutAside.install = layoutAsideInstall

LayoutAsideToggleComp.name = 'TrLayoutAsideToggle'

const layoutAsideToggleInstall = function <T>(app: App<T>) {
  app.component(LayoutAsideToggleComp.name!, LayoutAsideToggleComp)
}

const LayoutAsideToggle = LayoutAsideToggleComp as typeof LayoutAsideToggleComp & {
  install: typeof layoutAsideToggleInstall
}

LayoutAsideToggle.install = layoutAsideToggleInstall

LayoutComp.name = 'TrLayout'

const layoutInstall = function <T>(app: App<T>) {
  app.component(LayoutComp.name!, LayoutComp)
  app.component(LayoutMain.name!, LayoutMain)
  app.component(LayoutAside.name!, LayoutAside)
  app.component(LayoutAsideToggle.name!, LayoutAsideToggle)
}

type LayoutCompound = typeof LayoutComp & {
  install: typeof layoutInstall
  Main: typeof LayoutMain
  Aside: typeof LayoutAside
  AsideToggle: typeof LayoutAsideToggle
}

const Layout = LayoutComp as LayoutCompound

Layout.install = layoutInstall
Layout.Main = LayoutMain
Layout.Aside = LayoutAside
Layout.AsideToggle = LayoutAsideToggle

export { Layout, LayoutMain, LayoutAside, LayoutAsideToggle }

export default Layout
