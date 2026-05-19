<script setup lang="ts">
import { Chat } from '@/index'
import { IconLogo, IconMenuCollapse, IconMore, IconNewSession, IconSearch } from '@opentiny/tiny-robot-svgs'
import { historyGroups } from '../data'
</script>

<template>
  <Chat.Aside side="left">
    <div class="deepseek-sidebar">
      <div class="deepseek-sidebar__brand">
        <div class="deepseek-sidebar__brand-start">
          <div class="deepseek-sidebar__brand-mark">
            <IconLogo />
          </div>
          <strong>deepseek</strong>
        </div>

        <div class="deepseek-sidebar__brand-actions">
          <button class="deepseek-sidebar__icon-button" type="button">
            <IconSearch />
          </button>
          <Chat.AsideToggle side="left" class="deepseek-sidebar__icon-button" aria-label="Collapse sidebar">
            <IconMenuCollapse />
          </Chat.AsideToggle>
        </div>
      </div>

      <button class="deepseek-sidebar__new-session" type="button">
        <IconNewSession />
        <span>Open new chat</span>
      </button>

      <div class="deepseek-sidebar__scroll">
        <div class="deepseek-sidebar__section">
          <p class="deepseek-sidebar__section-label">Home</p>
          <button class="deepseek-sidebar__entry deepseek-sidebar__entry--muted" type="button">
            Intro prompt and self intro
          </button>
        </div>

        <div v-for="group in historyGroups" :key="group.label" class="deepseek-sidebar__section">
          <p class="deepseek-sidebar__section-label">{{ group.label }}</p>
          <button
            v-for="item in group.items"
            :key="item"
            class="deepseek-sidebar__entry"
            :class="{ 'is-active': item === 'How to say protagonist' }"
            type="button"
          >
            <span>{{ item }}</span>
            <IconMore v-if="item === 'How to say protagonist'" />
          </button>
        </div>
      </div>

      <div class="deepseek-sidebar__profile">
        <div class="deepseek-sidebar__avatar">A</div>
        <div class="deepseek-sidebar__profile-copy">
          <strong>Awake</strong>
          <p>layout review</p>
        </div>
        <span class="deepseek-sidebar__profile-more">...</span>
      </div>
    </div>
  </Chat.Aside>
</template>

<style scoped>
.deepseek-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 14px 12px 12px;
  background: #ffffff;
}

.deepseek-sidebar__brand,
.deepseek-sidebar__brand-start,
.deepseek-sidebar__profile,
.deepseek-sidebar__brand-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.deepseek-sidebar__brand {
  justify-content: space-between;
  gap: 10px;
  padding-inline: 6px;
}

.deepseek-sidebar__brand-start strong,
.deepseek-sidebar__profile strong {
  display: block;
  font-size: 15px;
  letter-spacing: -0.02em;
  color: #2447ff;
}

.deepseek-sidebar__profile p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #94a3b8;
}

.deepseek-sidebar__brand-mark {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  color: #4f67ff;
  font-size: 32px;
}

.deepseek-sidebar__icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #475569;
  transition:
    background-color 160ms ease,
    color 160ms ease;
}

.deepseek-sidebar__new-session {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  border: 1px solid #dbe3f0;
  border-radius: 999px;
  background: #ffffff;
  color: #0f172a;
  font-size: 15px;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
  margin-top: 20px;
}

.deepseek-sidebar__scroll {
  display: grid;
  gap: 18px;
  flex: 1;
  min-height: 0;
  margin-top: 18px;
  overflow-y: auto;
  padding-right: 4px;
}

.deepseek-sidebar__section {
  display: grid;
  gap: 8px;
}

.deepseek-sidebar__section-label {
  margin: 0;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 500;
  color: #94a3b8;
}

.deepseek-sidebar__entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 40px;
  padding: 0 12px;
  border: 0;
  border-radius: 16px;
  background: transparent;
  color: #0f172a;
  text-align: left;
  font-size: 14px;
  transition:
    background-color 160ms ease,
    color 160ms ease;
}

.deepseek-sidebar__entry span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.deepseek-sidebar__icon-button:hover,
.deepseek-sidebar__entry:hover {
  background: #f8fafc;
}

.deepseek-sidebar__new-session:hover {
  border-color: #cfd9ea;
  background: #f8fbff;
}

.deepseek-sidebar__entry.is-active {
  background: #eaf0ff;
  color: #2447ff;
}

.deepseek-sidebar__entry--muted {
  color: #475569;
}

.deepseek-sidebar__profile {
  margin-top: 14px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid transparent;
}

.deepseek-sidebar__profile-copy {
  min-width: 0;
}

.deepseek-sidebar__scroll::-webkit-scrollbar {
  width: 6px;
}

.deepseek-sidebar__scroll::-webkit-scrollbar-thumb {
  background: rgba(49, 94, 251, 0.18);
  border-radius: 999px;
}

.deepseek-sidebar__avatar {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: linear-gradient(135deg, #8ea7ff, #5f7bff);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
}

.deepseek-sidebar__profile-more {
  color: #94a3b8;
  font-size: 18px;
  line-height: 1;
}

@media (max-width: 959px) {
  .deepseek-sidebar {
    padding-top: max(18px, env(safe-area-inset-top));
    padding-bottom: max(28px, env(safe-area-inset-bottom));
  }

  .deepseek-sidebar__scroll {
    padding-right: 2px;
  }
}
</style>
