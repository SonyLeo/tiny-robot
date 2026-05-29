<script setup lang="ts">
import TinyRobotChat from './TinyRobotChat.vue'
</script>

<template>
  <main class="app-shell">
    <section class="hero-card">
      <p class="hero-card__eyebrow">TrChat</p>
      <h1 class="hero-card__title">Minimal Consumer Preview</h1>
      <p class="hero-card__description">
        This project consumes <code>@opentiny/tiny-robot/chat</code> and only passes the minimum chat props.
      </p>
      <div class="hero-card__steps">
        <span>1. Copy <code>.env.example</code></span>
        <span>2. Fill provider key</span>
        <span>3. Click the launcher</span>
      </div>
    </section>
  </main>

  <TinyRobotChat />
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  padding: 32px;
  background:
    radial-gradient(circle at top left, rgba(39, 110, 241, 0.12), transparent 32%),
    linear-gradient(180deg, var(--tr-container-bg-default) 0%, var(--tr-container-bg-hover) 100%);
}

.hero-card {
  max-width: 720px;
  padding: 32px;
  border: 1px solid var(--tr-border-color-disabled);
  border-radius: 28px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 92%, white);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
}

.hero-card__eyebrow {
  margin: 0 0 8px;
  color: var(--tr-color-primary);
  font-size: 12px;
  font-weight: 600;
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
