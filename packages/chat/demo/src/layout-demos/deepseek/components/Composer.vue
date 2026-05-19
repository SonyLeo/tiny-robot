<script setup lang="ts">
import { IconArrowUp, IconUpload } from '@opentiny/tiny-robot-svgs'
import { composerModes } from '../data'
</script>

<template>
  <div class="deepseek-composer">
    <div class="deepseek-composer__input">
      <span class="deepseek-composer__placeholder">Message DeepSeek</span>

      <div class="deepseek-composer__toolbar">
        <div class="deepseek-composer__modes">
          <button
            v-for="mode in composerModes"
            :key="mode.label"
            class="deepseek-composer__mode"
            :class="{ 'is-accent': mode.accent }"
            type="button"
          >
            <component :is="mode.icon" class="deepseek-composer__icon" />
            <span>{{ mode.label }}</span>
          </button>
        </div>

        <div class="deepseek-composer__end">
          <button class="deepseek-composer__icon-button deepseek-composer__icon-button--subtle" type="button">
            <IconUpload class="deepseek-composer__icon" />
          </button>
          <button class="deepseek-composer__submit" type="button">
            <IconArrowUp class="deepseek-composer__icon" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.deepseek-composer {
  width: min(100%, 780px);
  margin: 0 auto;
}

.deepseek-composer__input {
  display: grid;
  gap: 24px;
  min-height: 118px;
  padding: 18px 18px 14px;
  border: 1px solid #dfe5f2;
  border-radius: 28px;
  background: #ffffff;
  box-shadow: 0 24px 56px rgba(15, 23, 42, 0.08);
}

.deepseek-composer__placeholder {
  color: #94a3b8;
  font-size: 16px;
}

.deepseek-composer__toolbar,
.deepseek-composer__modes,
.deepseek-composer__end {
  display: flex;
  align-items: center;
  gap: 10px;
}

.deepseek-composer__toolbar {
  justify-content: space-between;
  flex-wrap: wrap;
}

.deepseek-composer__mode {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 0 18px;
  border: 1px solid #dbe3f0;
  border-radius: 999px;
  background: #ffffff;
  color: #0f172a;
  font-size: 14px;
}

.deepseek-composer__mode.is-accent {
  border-color: #bfceff;
  background: #eef4ff;
  color: #315efb;
}

.deepseek-composer__icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 999px;
  background: #ffffff;
  color: #68728b;
  box-shadow: inset 0 0 0 1px #e1e6f3;
}

.deepseek-composer__icon-button--subtle {
  width: 34px;
  height: 34px;
  box-shadow: none;
}

.deepseek-composer__submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #9cb0ff, #6984ff);
  color: #ffffff;
}

.deepseek-composer__icon {
  font-size: 18px;
}

@media (max-width: 959px) {
  .deepseek-composer {
    width: 100%;
  }

  .deepseek-composer__input {
    gap: 18px;
    min-height: 108px;
    padding: 16px 16px max(14px, env(safe-area-inset-bottom));
    border-radius: 24px;
  }

  .deepseek-composer__toolbar {
    align-items: flex-end;
    gap: 12px;
  }

  .deepseek-composer__modes {
    flex-wrap: wrap;
    flex: 1;
    row-gap: 10px;
  }

  .deepseek-composer__mode {
    min-height: 36px;
    padding-inline: 14px;
    font-size: 13px;
  }

  .deepseek-composer__end {
    margin-left: auto;
  }
}
</style>
