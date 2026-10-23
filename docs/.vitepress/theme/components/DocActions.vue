<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, onMounted, onUnmounted, shallowRef } from 'vue'
import { IconArrowDown, IconCheck, IconCopy, IconError } from '@opentiny/tiny-robot-svgs'

const { page } = useData()
const isOpen = shallowRef(false)
const copyStatus = shallowRef<'idle' | 'content-success' | 'content-error' | 'link-success' | 'link-error'>('idle')
let statusTimer: ReturnType<typeof setTimeout> | undefined

const source = computed(() => page.value.relativePath?.replace(/^\/+/, '') || '')
const isEnabled = computed(
  () => Boolean(source.value) && source.value !== 'index.md' && !source.value.startsWith('examples/'),
)
const rawUrl = computed(() => {
  const base = normalizeBase(import.meta.env.BASE_URL)
  const path = `${base}raw/${source.value}`
  return typeof window === 'undefined' ? path : new URL(path, window.location.origin).href
})

function normalizeBase(base: string) {
  const value = base || '/'
  return value.endsWith('/') ? value : `${value}/`
}

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu() {
  isOpen.value = false
}

function setCopyStatus(status: typeof copyStatus.value) {
  copyStatus.value = status
  if (statusTimer) clearTimeout(statusTimer)
  statusTimer = setTimeout(() => {
    copyStatus.value = 'idle'
  }, 2200)
}

async function copyMarkdownLink() {
  try {
    await writeClipboardText(rawUrl.value)
    setCopyStatus('link-success')
  } catch {
    setCopyStatus('link-error')
  }
  closeMenu()
}

async function copyMarkdownContent() {
  try {
    setCopyStatus('idle')
    const response = await fetch(rawUrl.value)
    if (!response.ok) throw new Error('Markdown request failed')
    await writeClipboardText(await response.text())
    setCopyStatus('content-success')
  } catch {
    setCopyStatus('content-error')
  }
  closeMenu()
}

async function writeClipboardText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()
  if (!copied) throw new Error('Clipboard copy failed')
}

function onDocumentPointerDown(event: PointerEvent) {
  const target = event.target
  if (target instanceof Node && !target.closest('.doc-actions')) closeMenu()
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeMenu()
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
  document.addEventListener('keydown', onDocumentKeydown)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  document.removeEventListener('keydown', onDocumentKeydown)
  if (statusTimer) clearTimeout(statusTimer)
})
</script>

<template>
  <div v-if="isEnabled" class="doc-actions-host">
    <div class="doc-actions">
      <div class="doc-actions-group">
        <button class="doc-actions-copy" type="button" aria-label="复制页面 Markdown" @click="copyMarkdownContent">
          <IconCheck
            v-if="copyStatus === 'content-success'"
            class="doc-actions-copy-icon doc-actions-copy-success"
            aria-hidden="true"
          />
          <IconError
            v-else-if="copyStatus === 'content-error'"
            class="doc-actions-copy-icon doc-actions-copy-error"
            aria-hidden="true"
          />
          <IconCopy v-else class="doc-actions-copy-icon" aria-hidden="true" />
          <span>复制页面</span>
        </button>
        <button
          class="doc-actions-trigger"
          type="button"
          aria-haspopup="menu"
          :aria-expanded="isOpen"
          aria-label="打开文档复制操作"
          @click="toggleMenu"
        >
          <IconArrowDown class="doc-actions-chevron" aria-hidden="true" />
        </button>
      </div>

      <div v-if="isOpen" class="doc-actions-menu" role="menu" aria-label="文档复制操作">
        <button class="doc-actions-item" type="button" role="menuitem" @click="copyMarkdownLink">
          <span>{{
            copyStatus === 'link-success'
              ? '已复制 Markdown 链接'
              : copyStatus === 'link-error'
                ? '复制失败，请重试'
                : '复制 Markdown 链接'
          }}</span>
        </button>
        <a
          class="doc-actions-item"
          role="menuitem"
          :href="rawUrl"
          target="_blank"
          rel="noopener noreferrer"
          @click="closeMenu"
        >
          <span>查看 Markdown</span>
        </a>
      </div>
    </div>
    <span class="sr-only" aria-live="polite">
      {{
        copyStatus === 'content-success'
          ? 'Markdown 已复制'
          : copyStatus === 'link-success'
            ? 'Markdown 链接已复制'
            : copyStatus === 'content-error' || copyStatus === 'link-error'
              ? 'Markdown 复制失败'
              : ''
      }}
    </span>
  </div>
</template>

<style scoped>
.doc-actions-host {
  position: relative;
  top: -8px;
  z-index: 20;
  display: flex;
  justify-content: flex-end;
  min-height: 0;
  margin-bottom: -44px;
}

.doc-actions {
  position: relative;
}

.doc-actions-group {
  display: inline-flex;
  align-items: center;
  gap: 0;
}

.doc-actions-copy,
.doc-actions-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  border: 0;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  transition: background-color 0.15s;
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--vp-c-border), var(--vp-c-bg) 45%) inset;
}

.doc-actions-copy {
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px 0 0 6px;
}

.doc-actions-trigger {
  width: 28px;
  padding: 6px;
  margin-left: -1px;
  border-radius: 0 6px 6px 0;
  font-size: 12px;
  line-height: 16px;
}

.doc-actions-copy:hover,
.doc-actions-trigger:hover,
.doc-actions-trigger[aria-expanded='true'] {
  background: var(--vp-c-bg-soft);
}

.doc-actions-trigger:focus-visible,
.doc-actions-copy:focus-visible,
.doc-actions-item:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.doc-actions-chevron {
  width: 16px;
  height: 16px;
  transition: transform 0.2s;
}

.doc-actions-copy-icon {
  width: 14px;
  height: 14px;
}

.doc-actions-copy-success {
  color: var(--vp-c-green-1);
}

.doc-actions-copy-error {
  color: var(--vp-c-danger-1);
}

.doc-actions-trigger[aria-expanded='true'] .doc-actions-chevron {
  transform: rotate(180deg);
}

.doc-actions-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  display: grid;
  min-width: 192px;
  padding: 4px;
  border: 0;
  border-radius: 8px;
  background: var(--vp-c-bg);
  box-shadow:
    0 4px 16px rgb(0 0 0 / 12%),
    0 0 0 1px rgb(0 0 0 / 5%);
}

.doc-actions-item {
  display: flex;
  align-items: center;
  min-height: 32px;
  padding: 6px 8px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--vp-c-text-1);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  line-height: 20px;
  text-align: left;
  text-decoration: none;
  white-space: nowrap;
}

.doc-actions-item:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-brand-1);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 640px) {
  .doc-actions-host {
    top: 0;
    margin-bottom: 16px;
  }

  .doc-actions-menu {
    right: 0;
    min-width: min(192px, calc(100vw - 48px));
  }
}
</style>
