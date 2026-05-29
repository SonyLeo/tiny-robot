<script setup lang="ts">
import { TrThemeProvider } from '@opentiny/tiny-robot'
import { ref } from 'vue'
import AssistantLauncherButton from './components/AssistantLauncherButton.vue'
import AssistantPanel from './components/AssistantPanel.vue'

const show = ref(false)
const fullscreen = ref(false)
</script>

<template>
  <TrThemeProvider>
    <main class="app-shell">
      <section class="hero-card">
        <p class="hero-card__eyebrow">TinyRobot</p>
        <h1 class="hero-card__title">Assistant Panel</h1>
        <p class="hero-card__description">
          Fill the single-model <code>.env</code> config, then open the floating panel to chat and trigger MCP tools.
        </p>
        <div class="hero-card__steps">
          <span>1. Copy <code>.env.example</code></span>
          <span>2. Fill API key and model</span>
          <span>3. Click the floating button</span>
        </div>
      </section>

      <AssistantLauncherButton :show="show" @open="show = true" />
      <AssistantPanel v-model:show="show" v-model:fullscreen="fullscreen" />
    </main>
  </TrThemeProvider>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  padding: 32px;
}

.hero-card {
  max-width: 720px;
  padding: 32px;
  border: 1px solid var(--tr-border-color-disabled);
  border-radius: 28px;
  background: linear-gradient(
    180deg,
    var(--tr-container-bg-default) 0%,
    var(--tr-container-bg-default-2, var(--tr-container-bg-default)) 100%
  );
}

.hero-card__eyebrow {
  margin: 0 0 8px;
  color: var(--tr-color-primary);
  font-size: 12px;
  font-weight: var(--tr-font-weight-semibold);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-card__title {
  margin: 0;
  font-size: clamp(32px, 6vw, 56px);
  line-height: 1.05;
}

.hero-card__description {
  max-width: 560px;
  margin: 16px 0 0;
  color: var(--tr-text-secondary);
  font-size: var(--tr-font-size-md);
  line-height: 1.6;
}

.hero-card__steps {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

.hero-card__steps span {
  padding: 8px 12px;
  border-radius: var(--tr-radius-full);
  background: var(--tr-container-bg-hover);
  color: var(--tr-text-secondary);
  font-size: 13px;
}

@media (max-width: 767px) {
  .app-shell {
    padding: 16px;
  }

  .hero-card {
    padding: 24px;
    border-radius: 20px;
  }

  .hero-card__steps {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
