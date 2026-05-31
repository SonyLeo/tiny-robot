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
                  @click="activeView = view.id"
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

          <section v-for="section in activeSections" :key="section.id" class="content-section" :id="section.id">
            <div class="content-section__header">
              <h2>{{ section.title }}</h2>
              <p>{{ section.description }}</p>
            </div>

            <article v-for="demoCase in section.cases" :id="demoCase.id" :key="demoCase.id" class="example-block">
              <header class="example-block__header">
                <h3>{{ demoCase.title }}</h3>
                <p>{{ demoCase.description }}</p>
              </header>

              <MarkdownCaseSource v-if="demoCase.sourceCode" :source-code="demoCase.sourceCode" />
              <MarkdownPreviewCard :demo-case="demoCase" />
            </article>
          </section>

          <section v-if="activeView === 'public'" id="apis" class="content-section">
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
            <p class="toc__title">Table of Contents</p>
            <nav>
              <a v-for="section in activeSections" :key="section.id" :href="`#${section.id}`" class="toc__section">
                {{ section.title }}
              </a>
              <a v-for="demoCase in allCases" :key="demoCase.id" :href="`#${demoCase.id}`">
                {{ demoCase.title }}
              </a>
              <a v-if="activeView === 'public'" href="#apis">APIs</a>
            </nav>
          </div>
        </aside>
      </main>
    </div>
  </TrThemeProvider>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrThemeProvider } from '@opentiny/tiny-robot'
import MarkdownCaseSource from './components/MarkdownCaseSource.vue'
import MarkdownPreviewCard from './components/MarkdownPreviewCard.vue'
import { internalMarkdownSections, markdownApiRows, markdownIntro, publicMarkdownSections } from './data/markdownCases'

const theme = ref<'light' | 'dark'>('light')
const activeView = ref<'public' | 'internal'>('public')
const viewOptions = [
  { id: 'public', label: 'Public parity' },
  { id: 'internal', label: 'Internal regression' },
] as const

const activeSections = computed(() => {
  return activeView.value === 'public' ? publicMarkdownSections : internalMarkdownSections
})

const allCases = computed(() => activeSections.value.flatMap((section) => section.cases))

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

.example-block__header {
  display: grid;
  gap: 8px;
}

.toc {
  align-self: start;
}

.toc__panel {
  position: fixed;
  top: 24px;
  display: grid;
  gap: 14px;
  padding-left: 18px;
  border-left: 1px solid color-mix(in srgb, var(--tr-border-color-default) 22%, transparent);
}

.toc__title {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--tr-text-tertiary);
}

.toc nav {
  display: grid;
  gap: 12px;
}

.toc__section {
  font-weight: 700;
}

.toc a {
  color: var(--tr-text-secondary);
  text-decoration: none;
}

.toc a:hover {
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

  .api-table__head,
  .api-table__row {
    grid-template-columns: 1fr;
  }
}
</style>
