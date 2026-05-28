<script setup lang="ts">
import { TrWelcome } from '@opentiny/tiny-robot'
import { IconAi, IconPlugin, IconSparkles } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const emit = defineEmits<{
  (e: 'submit', value: string): void
}>()

const welcomeIcon = h(IconAi, { style: { fontSize: '40px' } })

const promptItems = [
  {
    title: 'Plan a task',
    description: 'Break down a feature request into a short implementation plan.',
    message: 'Help me break down a feature request into an implementation plan.',
    icon: IconSparkles,
  },
  {
    title: 'Review API config',
    description: 'Check whether my model configuration looks correct.',
    message: 'Review my model configuration and tell me what is missing.',
    icon: IconAi,
  },
  {
    title: 'Try MCP tools',
    description: 'Trigger a real tool call and inspect the returned result in chat.',
    message: 'Use an MCP tool to search for the latest Vue 3 release notes.',
    icon: IconPlugin,
  },
] as const
</script>

<template>
  <section class="welcome-state">
    <TrWelcome
      title="Assistant Panel"
      description="Chat first, then bring in MCP tools only when the task needs them."
      :icon="welcomeIcon"
      class="welcome-hero"
    />

    <div class="prompt-grid">
      <button
        v-for="item in promptItems"
        :key="item.title"
        class="prompt-card"
        type="button"
        @click="emit('submit', item.message)"
      >
        <component :is="item.icon" :size="18" class="prompt-card__icon" />
        <span class="prompt-card__title">{{ item.title }}</span>
        <span class="prompt-card__description">{{ item.description }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.welcome-state {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  padding: 12px 0 8px;
}

.welcome-hero {
  justify-content: center;

  &.tr-welcome {
    --title-color: var(--tr-text-primary);
    --description-color: var(--tr-text-secondary);
  }
}

.prompt-grid {
  display: grid;
  gap: 12px;
}

.prompt-card {
  width: 100%;
  padding: 16px;
  border: 1px solid var(--tr-border-color-disabled);
  border-radius: var(--tr-radius-lg);
  background: var(--tr-container-bg-default);
  color: inherit;
  display: grid;
  gap: 6px;
  text-align: left;
  cursor: pointer;
}

.prompt-card:hover {
  border-color: var(--tr-border-color-hover);
  background: var(--tr-container-bg-hover);
}

.prompt-card__icon {
  color: var(--tr-color-primary);
}

.prompt-card__title {
  font-size: var(--tr-font-size-md);
  font-weight: var(--tr-font-weight-semibold);
}

.prompt-card__description {
  color: var(--tr-text-secondary);
  font-size: var(--tr-font-size-sm);
  line-height: 1.5;
}
</style>
