<script setup lang="ts">
import { IconCopy, IconEdit } from '@opentiny/tiny-robot-svgs'
import { actionIcons } from '../data'
</script>

<template>
  <div class="deepseek-main">
    <div class="deepseek-main__column">
      <div class="deepseek-main__bubble-row">
        <div class="deepseek-main__user-bubble">protagonist pronunciation</div>
      </div>

      <div class="deepseek-main__bubble-actions">
        <button class="deepseek-main__bubble-action" type="button">
          <IconCopy class="deepseek-main__icon" />
        </button>
        <button class="deepseek-main__bubble-action" type="button">
          <IconEdit class="deepseek-main__icon" />
        </button>
      </div>

      <article class="deepseek-main__content">
        <p>
          The most standard translation is <strong>protagonist</strong>, which means the central character in a story,
          film, or play.
        </p>

        <ol>
          <li>
            <h2>1. protagonist</h2>
            <p>Use it when you want the most neutral and precise word for the main figure of a story.</p>
            <p class="deepseek-main__example">Example: Harry Potter is the protagonist of the series.</p>
          </li>
          <li>
            <h2>2. main character</h2>
            <p>This is more conversational and works well in daily writing or spoken English.</p>
            <p class="deepseek-main__example">Example: Who is the main character in this movie?</p>
          </li>
          <li>
            <h2>3. lead / leading role</h2>
            <p>
              This is common when the focus is on the performer or the starring role rather than the narrative function.
            </p>
            <p class="deepseek-main__example">Example: She played the lead in the play.</p>
          </li>
        </ol>

        <div class="deepseek-main__summary">
          <p>Quick summary:</p>
          <ul>
            <li>Use <strong>protagonist</strong> for the clearest dictionary-style answer.</li>
            <li>Use <strong>main character</strong> in casual explanations.</li>
            <li>Use <strong>lead</strong> when talking about acting or starring roles.</li>
          </ul>
        </div>
      </article>

      <div class="deepseek-main__actions">
        <button v-for="(Icon, index) in actionIcons" :key="index" class="deepseek-main__action" type="button">
          <component :is="Icon" class="deepseek-main__icon" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.deepseek-main {
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

.deepseek-main__column {
  width: min(100%, 760px);
  margin: 0 auto;
  padding: 32px var(--tr-chat-layout-main-padding-inline, var(--tr-chat-layout-inner-padding-inline)) 42px;
  box-sizing: border-box;
}

.deepseek-main__bubble-row {
  display: flex;
  justify-content: flex-end;
}

.deepseek-main__user-bubble {
  display: inline-flex;
  align-items: center;
  min-height: 46px;
  padding: 0 20px;
  border-radius: 999px;
  background: #eef4ff;
  color: #0f172a;
  font-size: 15px;
}

.deepseek-main__bubble-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
  color: #94a3b8;
}

.deepseek-main__bubble-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #94a3b8;
}

.deepseek-main__content {
  margin-top: 56px;
  color: #0f172a;
  font-size: 17px;
  line-height: 1.95;
}

.deepseek-main__content p,
.deepseek-main__content ol,
.deepseek-main__content ul,
.deepseek-main__content h2 {
  margin: 0;
}

.deepseek-main__content ol {
  display: grid;
  gap: 36px;
  margin-top: 44px;
  padding-left: 0;
  list-style: none;
}

.deepseek-main__content ol > li {
  display: grid;
  gap: 14px;
}

.deepseek-main__content h2 {
  font-size: 18px;
  font-weight: 700;
}

.deepseek-main__example {
  font-style: italic;
}

.deepseek-main__summary {
  margin-top: 40px;
}

.deepseek-main__summary > p {
  font-weight: 700;
}

.deepseek-main__summary ul {
  display: grid;
  gap: 8px;
  margin-top: 16px;
  padding-left: 24px;
  list-style: disc;
}

.deepseek-main__summary li {
  display: list-item;
}

.deepseek-main__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
}

.deepseek-main__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #64748b;
}

.deepseek-main__icon {
  font-size: 16px;
}

@media (max-width: 959px) {
  .deepseek-main__column {
    padding-bottom: 24px;
  }
}
</style>
