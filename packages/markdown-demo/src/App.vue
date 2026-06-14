<template>
  <TrThemeProvider :color-mode="theme">
    <div class="page">
      <main class="docs">
        <div class="docs__main">
          <section class="hero">
            <div class="hero__copy">
              <p class="hero__eyebrow">TinyRobot</p>
              <h1>{{ markdownIntro.title }}</h1>
              <p class="hero__desc">{{ markdownIntro.description }}</p>
            </div>

            <div class="hero__meta">
              <div class="view-switch">
                <button
                  v-for="view in viewOptions"
                  :key="view.id"
                  type="button"
                  class="view-switch__chip"
                  :class="{ 'view-switch__chip--active': activeView === view.id }"
                  @click="setActiveView(view.id)"
                >
                  {{ view.label }}
                </button>
              </div>

              <button type="button" class="theme-chip" @click="toggleTheme">Theme: {{ theme }}</button>

              <div class="install-snippet">
                <code>{{ markdownIntro.installSnippet }}</code>
              </div>
            </div>
          </section>

          <section class="explorer-toolbar">
            <div class="explorer-toolbar__summary">
              <p>{{ activeView === 'public' ? 'Public parity' : 'Internal regression' }}</p>
              <strong>{{ visibleCaseCount }} cases · {{ visibleSectionCount }} sections</strong>
              <span>{{ explorerSummary }}</span>
            </div>

            <div class="explorer-toolbar__actions">
              <button
                type="button"
                class="explorer-toolbar__chip"
                :class="{ 'explorer-toolbar__chip--active': activeSectionId === 'all' }"
                @click="resetExplorer"
              >
                <span>All sections</span>
                <span class="explorer-toolbar__chip-count">{{ totalCaseCount }}</span>
              </button>

              <button
                v-for="section in explorerSections"
                :key="section.id"
                type="button"
                class="explorer-toolbar__chip"
                :class="{ 'explorer-toolbar__chip--active': activeSectionId === section.id && !activeCaseId }"
                @click="selectSection(section.id)"
              >
                <span>{{ section.title }}</span>
                <span class="explorer-toolbar__chip-count">{{ section.cases.length }}</span>
              </button>
            </div>

            <div v-if="activeCaseEntry" class="focus-bar">
              <div class="focus-bar__copy">
                <p class="focus-bar__eyebrow">{{ activeCaseEntry.section.title }}</p>
                <strong>{{ activeCaseEntry.demoCase.title }}</strong>
                <span>{{ activeCaseEntry.demoCase.description }}</span>
              </div>

              <div class="focus-bar__actions">
                <button type="button" class="focus-bar__action" @click="clearCaseFocus">Show section</button>
                <button type="button" class="focus-bar__action" @click="resetExplorer">Show all</button>
              </div>
            </div>
          </section>

          <section v-for="section in activeSections" :key="section.id" class="content-section" :id="section.id">
            <div class="content-section__header">
              <div class="content-section__title-row">
                <h2>{{ section.title }}</h2>
                <span class="content-section__meta">{{ getSectionMeta(section) }}</span>
              </div>
              <p>{{ section.description }}</p>
            </div>

            <MarkdownSectionNarrative
              v-if="activeView === 'public' && section.publicNarrative && !activeCaseId"
              :story="section.publicNarrative"
              :displayed-cases="section.cases"
              :hidden-cases="getNarrativeHiddenCases(section)"
              @focus-case="focusCaseInSection(section.id, $event)"
            />

            <article
              v-for="demoCase in section.cases"
              :id="demoCase.id"
              :key="demoCase.id"
              class="example-block"
              :class="{ 'example-block--focused': activeCaseId === demoCase.id }"
            >
              <header class="example-block__header">
                <div class="example-block__title-row">
                  <div class="example-block__title-copy">
                    <h3>{{ demoCase.title }}</h3>
                    <p>{{ demoCase.description }}</p>
                  </div>

                  <button
                    type="button"
                    class="example-block__focus"
                    :class="{ 'example-block__focus--active': activeCaseId === demoCase.id }"
                    @click="focusCase(section.id, demoCase.id)"
                  >
                    {{ activeCaseId === demoCase.id ? 'Focused' : 'Focus case' }}
                  </button>
                </div>
              </header>

              <MarkdownCaseSource
                v-if="shouldShowSource(demoCase.id) && demoCase.sourceCode"
                :source-code="demoCase.sourceCode"
              />
              <MarkdownPreviewCard :demo-case="demoCase" :view-mode="activeView" />
            </article>
          </section>

          <section v-if="showApiSection" id="apis" class="content-section">
            <div class="content-section__header">
              <h2>APIs</h2>
              <p>公开层补一份最小 API 摘要，和 LobeUI 文档页的阅读顺序保持一致。</p>
            </div>

            <div class="api-table">
              <div class="api-table__head">
                <span>Property</span>
                <span>Description</span>
                <span>Type</span>
                <span>Default</span>
              </div>
              <div v-for="row in markdownApiRows" :key="row.name" class="api-table__row">
                <code>{{ row.name }}</code>
                <span>{{ row.description }}</span>
                <code>{{ row.type }}</code>
                <code>{{ row.defaultValue }}</code>
              </div>
            </div>
          </section>
        </div>

        <aside class="toc">
          <div class="toc__panel">
            <div class="toc__panel-head">
              <p class="toc__title">Case Browser</p>
              <p class="toc__subtitle">
                {{ activeView === 'public' ? 'LobeUI parity view' : 'TinyRobot regression view' }}
              </p>
            </div>

            <nav class="toc__nav">
              <button
                type="button"
                class="toc__reset"
                :class="{ 'toc__reset--active': activeSectionId === 'all' && !activeCaseId }"
                @click="resetExplorer"
              >
                All sections
              </button>

              <div v-for="section in explorerSections" :key="section.id" class="toc__group">
                <button
                  type="button"
                  class="toc__section"
                  :class="{ 'toc__section--active': activeSectionId === section.id && !activeCaseId }"
                  @click="selectSection(section.id)"
                >
                  <span>{{ section.title }}</span>
                  <span class="toc__count">{{ section.cases.length }}</span>
                </button>

                <template v-if="shouldExpandTocSection(section.id)">
                  <button
                    v-for="demoCase in section.cases"
                    :key="demoCase.id"
                    type="button"
                    class="toc__case"
                    :class="{ 'toc__case--active': activeCaseId === demoCase.id }"
                    @click="focusCase(section.id, demoCase.id)"
                  >
                    {{ demoCase.title }}
                  </button>
                </template>
              </div>

              <a v-if="showApiSection" href="#apis" class="toc__api">APIs</a>
            </nav>
          </div>
        </aside>
      </main>
    </div>
  </TrThemeProvider>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { TrThemeProvider } from '@opentiny/tiny-robot'
import MarkdownCaseSource from './components/MarkdownCaseSource.vue'
import MarkdownPreviewCard from './components/MarkdownPreviewCard.vue'
import MarkdownSectionNarrative from './components/MarkdownSectionNarrative.vue'
import { internalMarkdownSections, markdownApiRows, markdownIntro, publicMarkdownSections } from './data/markdownCases'
import type { MarkdownDemoCase, MarkdownDemoSection, MarkdownDemoView } from './types/markdownDemo'

const getDefaultSectionId = (view: MarkdownDemoView) => {
  if (view === 'internal') {
    return 'all'
  }

  return publicMarkdownSections[0]?.id || 'all'
}

const theme = ref<'light' | 'dark'>('light')
const activeView = ref<MarkdownDemoView>('public')
const activeSectionId = ref(getDefaultSectionId('public'))
const activeCaseId = ref('')
const viewOptions = [
  { id: 'public', label: 'Public parity' },
  { id: 'internal', label: 'Internal regression' },
] as const

const explorerSections = computed(() => {
  return activeView.value === 'public' ? publicMarkdownSections : internalMarkdownSections
})

const totalCaseCount = computed(() => {
  return explorerSections.value.reduce((count, section) => count + section.cases.length, 0)
})

const activeCaseEntry = computed<{ demoCase: MarkdownDemoCase; section: MarkdownDemoSection } | null>(() => {
  for (const section of explorerSections.value) {
    const demoCase = section.cases.find((item) => item.id === activeCaseId.value)

    if (demoCase) {
      return {
        demoCase,
        section,
      }
    }
  }

  return null
})

const activeSectionEntry = computed(() => {
  return explorerSections.value.find((section) => section.id === activeSectionId.value) || null
})

const activeSections = computed<MarkdownDemoSection[]>(() => {
  const scopedSections =
    activeSectionId.value === 'all'
      ? explorerSections.value
      : explorerSections.value.filter((section) => section.id === activeSectionId.value)

  if (!activeCaseId.value) {
    return scopedSections.map((section) => {
      if (activeView.value !== 'public' || !section.publicNarrative?.featuredCaseIds?.length) {
        return section
      }

      return {
        ...section,
        cases: section.cases.filter((demoCase) => section.publicNarrative?.featuredCaseIds.includes(demoCase.id)),
      }
    })
  }

  return scopedSections.flatMap((section) => {
    const demoCase = section.cases.find((item) => item.id === activeCaseId.value)

    return demoCase
      ? [
          {
            ...section,
            cases: [demoCase],
          },
        ]
      : []
  })
})

const visibleSectionCount = computed(() => activeSections.value.length)
const visibleCaseCount = computed(() =>
  activeSections.value.reduce((count, section) => count + section.cases.length, 0),
)
const showApiSection = computed(() => activeView.value === 'public' && !activeCaseId.value)
const explorerSummary = computed(() => {
  if (activeCaseEntry.value) {
    return `Focused: ${activeCaseEntry.value.demoCase.title}`
  }

  if (activeSectionEntry.value) {
    return `Browsing ${activeSectionEntry.value.title}`
  }

  return 'Browsing all matching cases'
})

watch(
  explorerSections,
  (sections) => {
    if (activeSectionId.value !== 'all' && !sections.some((section) => section.id === activeSectionId.value)) {
      activeSectionId.value = getDefaultSectionId(activeView.value)
    }

    if (
      activeCaseId.value &&
      !sections.some((section) => section.cases.some((demoCase) => demoCase.id === activeCaseId.value))
    ) {
      activeCaseId.value = ''
    }
  },
  {
    immediate: true,
  },
)

const scrollToDocsTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const applyViewDefaults = (view: MarkdownDemoView) => {
  activeSectionId.value = getDefaultSectionId(view)
  activeCaseId.value = ''
}

const setActiveView = (view: MarkdownDemoView) => {
  if (activeView.value === view) {
    return
  }

  activeView.value = view
  applyViewDefaults(view)
  scrollToDocsTop()
}

const selectSection = (sectionId: string) => {
  activeSectionId.value = sectionId
  activeCaseId.value = ''
  scrollToDocsTop()
}

const focusCase = (sectionId: string, caseId: string) => {
  if (activeCaseId.value === caseId) {
    activeCaseId.value = ''
    scrollToDocsTop()
    return
  }

  activeSectionId.value = sectionId
  activeCaseId.value = caseId
  scrollToDocsTop()
}

const clearCaseFocus = () => {
  activeCaseId.value = ''
  scrollToDocsTop()
}

const resetExplorer = () => {
  activeSectionId.value = 'all'
  activeCaseId.value = ''
  scrollToDocsTop()
}

const shouldShowSource = (caseId: string) => {
  return activeView.value === 'internal' || activeCaseId.value === caseId
}

const shouldExpandTocSection = (sectionId: string) => {
  if (activeView.value === 'internal') {
    return true
  }

  if (activeCaseEntry.value) {
    return activeCaseEntry.value.section.id === sectionId
  }

  return activeSectionId.value === sectionId
}

const getSectionMeta = (section: MarkdownDemoSection) => {
  const originalSection = explorerSections.value.find((item) => item.id === section.id)
  const totalCases = originalSection?.cases.length || section.cases.length

  if (activeView.value === 'public' && !activeCaseId.value && totalCases > section.cases.length) {
    return `${section.cases.length} shown / ${totalCases} total`
  }

  return `${section.cases.length} case${section.cases.length > 1 ? 's' : ''}`
}

const getNarrativeHiddenCases = (section: MarkdownDemoSection) => {
  if (activeView.value !== 'public' || !section.publicNarrative?.featuredCaseIds?.length || activeCaseId.value) {
    return []
  }

  const visibleCaseIds = new Set(section.publicNarrative.featuredCaseIds)
  const originalSection = explorerSections.value.find((item) => item.id === section.id)

  return (originalSection?.cases || []).filter((demoCase) => !visibleCaseIds.has(demoCase.id))
}

const focusCaseInSection = (sectionId: string, caseId: string) => {
  activeSectionId.value = sectionId
  activeCaseId.value = caseId
  scrollToDocsTop()
}

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>

<style scoped>
:global(body) {
  margin: 0;
  background: var(--tr-page-bg-default);
  color: var(--tr-text-primary);
}

:global(html) {
  scroll-behavior: smooth;
}

.page {
  min-height: 100vh;
  padding: 28px 32px 56px;
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--tr-color-primary) 12%, transparent), transparent 28%),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--tr-container-bg-default) 26%, var(--tr-page-bg-default) 74%) 0%,
      var(--tr-page-bg-default) 100%
    );
}

.docs {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 36px;
  max-width: 1440px;
  margin: 0 auto;
}

.docs__main {
  display: grid;
  gap: 40px;
  min-width: 0;
}

.hero {
  display: grid;
  gap: 20px;
  padding-bottom: 28px;
  border-bottom: 1px dashed color-mix(in srgb, var(--tr-border-color-default) 26%, transparent);
}

.hero__copy {
  display: grid;
  gap: 12px;
}

.hero__eyebrow {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--tr-color-primary);
}

h1 {
  margin: 0;
  font-size: clamp(36px, 4vw, 52px);
  line-height: 1.05;
}

.hero__desc {
  max-width: 960px;
  margin: 0;
  font-size: 18px;
  line-height: 1.65;
  color: var(--tr-text-secondary);
}

.hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
}

.explorer-toolbar {
  display: grid;
  gap: 16px;
  padding: 18px 20px;
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 18%, transparent);
  border-radius: 24px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--tr-container-bg-default) 92%, transparent), transparent),
    color-mix(in srgb, var(--tr-container-bg-default) 94%, transparent);
}

.explorer-toolbar__summary {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  align-items: center;
}

.explorer-toolbar__summary p,
.explorer-toolbar__summary strong,
.explorer-toolbar__summary span {
  margin: 0;
}

.explorer-toolbar__summary p {
  color: var(--tr-color-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.explorer-toolbar__summary strong {
  font-size: 16px;
  color: var(--tr-text-primary);
}

.explorer-toolbar__summary span {
  color: var(--tr-text-secondary);
  font-size: 14px;
}

.explorer-toolbar__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.explorer-toolbar__chip {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 18%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 84%, transparent);
  color: var(--tr-text-secondary);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.explorer-toolbar__chip--active {
  border-color: color-mix(in srgb, var(--tr-color-primary) 34%, transparent);
  background: color-mix(in srgb, var(--tr-container-bg-default) 70%, var(--tr-color-primary) 30%);
  color: var(--tr-text-primary);
}

.explorer-toolbar__chip-count {
  display: inline-flex;
  justify-content: center;
  min-width: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 82%, transparent);
  color: inherit;
  font-size: 11px;
  line-height: 1.8;
}

.focus-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border: 1px solid color-mix(in srgb, var(--tr-color-primary) 20%, transparent);
  border-radius: 18px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--tr-color-primary) 6%, transparent), transparent),
    color-mix(in srgb, var(--tr-container-bg-default) 96%, transparent);
}

.focus-bar__copy {
  display: grid;
  gap: 4px;
}

.focus-bar__copy strong,
.focus-bar__copy span,
.focus-bar__eyebrow {
  margin: 0;
}

.focus-bar__eyebrow {
  color: var(--tr-color-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.focus-bar__copy strong {
  color: var(--tr-text-primary);
  font-size: 16px;
}

.focus-bar__copy span {
  color: var(--tr-text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.focus-bar__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.focus-bar__action {
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 18%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 88%, transparent);
  color: var(--tr-text-primary);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.view-switch {
  display: inline-flex;
  gap: 8px;
  flex-wrap: wrap;
}

.view-switch__chip {
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 22%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 86%, transparent);
  color: var(--tr-text-secondary);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.view-switch__chip--active {
  border-color: color-mix(in srgb, var(--tr-color-primary) 34%, transparent);
  background: color-mix(in srgb, var(--tr-container-bg-default) 72%, var(--tr-color-primary) 28%);
  color: var(--tr-text-primary);
}

.theme-chip {
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 22%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 90%, transparent);
  color: var(--tr-text-primary);
  padding: 10px 16px;
  font: inherit;
  cursor: pointer;
}

.install-snippet {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  padding: 10px 14px;
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 18%, transparent);
  border-radius: 14px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 92%, transparent);
  color: var(--tr-text-primary);
  overflow: auto hidden;
}

.install-snippet code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 14px;
  white-space: nowrap;
}

.content-section {
  display: grid;
  gap: 28px;
}

.content-section__header {
  display: grid;
  gap: 10px;
}

.content-section__title-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.content-section__meta {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 82%, transparent);
  color: var(--tr-text-secondary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.content-section__header h2,
.example-block__header h3 {
  margin: 0;
}

.content-section__header p,
.example-block__header p {
  margin: 0;
  color: var(--tr-text-secondary);
  line-height: 1.7;
}

.example-block {
  display: grid;
  gap: 16px;
  scroll-margin-top: 24px;
}

.example-block--focused {
  padding: 20px;
  border: 1px solid color-mix(in srgb, var(--tr-color-primary) 18%, transparent);
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--tr-color-primary) 6%, transparent), transparent 32%),
    color-mix(in srgb, var(--tr-container-bg-default) 96%, transparent);
}

.example-block__header {
  display: grid;
  gap: 8px;
}

.example-block__title-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
}

.example-block__title-copy {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.example-block__focus {
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 22%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 88%, transparent);
  color: var(--tr-text-secondary);
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.example-block__focus--active {
  border-color: color-mix(in srgb, var(--tr-color-primary) 36%, transparent);
  background: color-mix(in srgb, var(--tr-container-bg-default) 72%, var(--tr-color-primary) 28%);
  color: var(--tr-text-primary);
}

.toc {
  align-self: start;
}

.toc__panel {
  position: sticky;
  top: 24px;
  display: grid;
  gap: 16px;
  max-height: calc(100vh - 48px);
  padding: 18px;
  overflow: auto;
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 18%, transparent);
  border-radius: 20px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 94%, transparent);
}

.toc__panel-head {
  display: grid;
  gap: 4px;
}

.toc__title {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--tr-text-tertiary);
}

.toc__subtitle {
  margin: 0;
  color: var(--tr-text-secondary);
  font-size: 13px;
  line-height: 1.5;
}

.toc__nav {
  display: grid;
  gap: 14px;
}

.toc__group {
  display: grid;
  gap: 8px;
}

.toc__reset,
.toc__section,
.toc__case {
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--tr-text-secondary);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.toc__reset {
  font-weight: 700;
}

.toc__reset--active,
.toc__section--active,
.toc__case--active {
  color: var(--tr-text-primary);
}

.toc__section {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  font-weight: 700;
}

.toc__count {
  display: inline-flex;
  justify-content: center;
  min-width: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 76%, transparent);
  color: inherit;
  font-size: 11px;
  line-height: 1.8;
}

.toc__case {
  padding-left: 12px;
  font-size: 13px;
  line-height: 1.45;
}

.toc__api {
  color: var(--tr-text-secondary);
  font-weight: 700;
  text-decoration: none;
}

.toc__api:hover,
.toc__reset:hover,
.toc__section:hover,
.toc__case:hover {
  color: var(--tr-text-primary);
}

.api-table {
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 18%, transparent);
  border-radius: 18px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 94%, transparent);
}

.api-table__head,
.api-table__row {
  display: grid;
  grid-template-columns: minmax(120px, 0.9fr) minmax(0, 1.8fr) minmax(180px, 1.2fr) 120px;
  gap: 16px;
  padding: 14px 16px;
}

.api-table__head {
  background: color-mix(in srgb, var(--tr-container-bg-default) 76%, transparent);
  font-size: 12px;
  font-weight: 700;
  color: var(--tr-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.api-table__row + .api-table__row {
  border-top: 1px solid color-mix(in srgb, var(--tr-border-color-default) 14%, transparent);
}

.api-table__row span,
.api-table__row code {
  min-width: 0;
}

.api-table__row span {
  color: var(--tr-text-primary);
  line-height: 1.6;
}

.api-table__row code {
  font-size: 12px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

@media (max-width: 1160px) {
  .docs {
    grid-template-columns: 1fr;
  }

  .toc {
    display: none;
  }
}

@media (max-width: 720px) {
  .page {
    padding-inline: 16px;
  }

  .hero__desc {
    font-size: 16px;
  }

  .focus-bar,
  .example-block__title-row {
    display: grid;
  }

  .api-table__head,
  .api-table__row {
    grid-template-columns: 1fr;
  }
}
</style>
