<template>
  <header class="playground-header">
    <div class="header-left">
      <img class="playground-logo" src="/logo.svg" />
      <div class="playground-title">TinyRobot Playground</div>
    </div>

    <div class="header-center">
      <div class="version-selectors">
        <div class="version-selector">
          <label>TinyRobot:</label>
          <select v-model="tinyRobotVersion" @change="handleVersionChange('tinyRobot', $event)">
            <option v-for="version in tinyRobotVersions" :key="version" :value="version">
              {{ version }}
            </option>
          </select>
        </div>
        <div class="version-selector">
          <label>Vue:</label>
          <select v-model="vueVersion" @change="handleVersionChange('vue', $event)">
            <option v-for="version in vueVersions" :key="version" :value="version">
              {{ version }}
            </option>
          </select>
        </div>
        <div class="version-selector">
          <label>TypeScript:</label>
          <select v-model="typescriptVersion" @change="handleVersionChange('typescript', $event)">
            <option v-for="version in typescriptVersions" :key="version" :value="version">
              {{ version }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="header-right">
      <div class="action-buttons">
        <button
          class="action-btn"
          :class="{ active: isDark }"
          @click="toggleTheme"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <svg
            v-if="!isDark"
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>

        <button class="action-btn" @click="sharePlayground" title="Share playground">
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"
            />
          </svg>
        </button>

        <button class="action-btn" @click="reloadPlayground" title="Reload playground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        </button>

        <a class="action-btn" href="https://github.com/opentiny/tiny-robot" target="_blank" title="View on GitHub">
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
        </a>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  tinyRobotVersions: string[]
  vueVersions: string[]
  typescriptVersions: string[]
  initialTinyRobotVersion?: string
  initialVueVersion?: string
  initialTypescriptVersion?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialTinyRobotVersion: 'latest',
  initialVueVersion: 'latest',
  initialTypescriptVersion: 'latest',
})

const emit = defineEmits<{
  'version-change': [type: string, version: string]
  'theme-toggle': []
  share: []
  reload: []
}>()

const tinyRobotVersion = ref(props.initialTinyRobotVersion)
const vueVersion = ref(props.initialVueVersion)
const typescriptVersion = ref(props.initialTypescriptVersion)
const isDark = ref(false)

// Watch for prop changes
watch(
  () => props.initialTinyRobotVersion,
  (newVal) => {
    tinyRobotVersion.value = newVal
  },
)

watch(
  () => props.initialVueVersion,
  (newVal) => {
    vueVersion.value = newVal
  },
)

watch(
  () => props.initialTypescriptVersion,
  (newVal) => {
    typescriptVersion.value = newVal
  },
)

const toggleTheme = () => {
  isDark.value = !isDark.value
  emit('theme-toggle')

  // Apply theme to document
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const sharePlayground = () => {
  emit('share')
}

const reloadPlayground = () => {
  emit('reload')
}

const handleVersionChange = (type: string, event: Event) => {
  const target = event.target as HTMLSelectElement
  if (target) {
    emit('version-change', type, target.value)
  }
}

// Initialize theme
const initTheme = () => {
  const savedTheme = localStorage.getItem('playground-theme')
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
}

initTheme()

// Save theme preference
watch(isDark, (newVal) => {
  localStorage.setItem('playground-theme', newVal ? 'dark' : 'light')
})
</script>

<style scoped lang="less">
.playground-header {
  // CSS 自定义属性定义
  --header-height: 60px;
  --header-padding: 20px;
  --logo-size: 32px;
  --action-btn-size: 36px;
  --border-radius: 6px;
  --select-border-radius: 4px;
  --transition-duration: 0.2s;

  // 亮色模式颜色变量
  --primary-color: #655bf8;
  --bg-color: #f8f9fa;
  --border-color: #e1e4e8;
  --text-color: #24292e;
  --text-secondary: #586069;
  --select-bg: #ffffff;
  --select-border: #d1d5da;
  --btn-bg-hover: #f3f4f6;

  // 响应式断点
  --mobile-breakpoint: 768px;

  height: var(--header-height);
  background: var(--bg-color);
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--header-padding);
  border-bottom: 1px solid var(--border-color);
  position: relative;

  .header-left {
    flex: 0 0 auto;
    display: flex;
    align-items: center;

    .playground-logo {
      width: var(--logo-size);
      height: var(--logo-size);
      margin-right: 16px;
    }

    .playground-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--primary-color);
    }
  }

  .header-center {
    flex: 1;
    display: flex;
    justify-content: center;

    .version-selectors {
      display: flex;
      gap: 16px;
      align-items: center;

      .version-selector {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;

        label {
          color: var(--text-secondary);
          white-space: nowrap;
        }

        select {
          background: var(--select-bg);
          color: var(--text-color);
          border: 1px solid var(--select-border);
          border-radius: var(--select-border-radius);
          padding: 6px 10px;
          font-size: 12px;
          min-width: 120px;
          cursor: pointer;
          transition: border-color var(--transition-duration) ease;

          &:hover {
            border-color: var(--primary-color);
          }

          &:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px var(--primary-color, 20%);
          }
        }
      }
    }
  }

  .header-right {
    flex: 0 0 auto;

    .action-buttons {
      display: flex;
      gap: 8px;
      align-items: center;

      .action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--action-btn-size);
        height: var(--action-btn-size);
        background: transparent;
        border: none;
        border-radius: var(--border-radius);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all var(--transition-duration) ease;
        text-decoration: none;

        &:hover {
          background: var(--btn-bg-hover);
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        &.active {
          background: var(--primary-color);
          border-color: var(--primary-color);
          color: white;
        }

        > svg {
          width: 20px;
          height: 20px;
        }
      }
    }
  }
}

// Dark theme styles
.dark .playground-header {
  // 暗色模式颜色变量覆盖
  --primary-color: #655bf8;
  --bg-color: #0d1117;
  --border-color: #21262d;
  --text-color: #f0f6fc;
  --text-secondary: #8b949e;
  --select-bg: #21262d;
  --select-border: #30363d;
  --btn-bg-hover: #21262d;
}

// Responsive design
@media (max-width: 768px) {
  .playground-header {
    flex-direction: column;
    height: auto;
    padding: 12px 16px;
    gap: 12px;

    .header-center {
      order: 2;

      .version-selectors {
        flex-wrap: wrap;
        gap: 12px;
        justify-content: center;

        .version-selector select {
          min-width: 100px;
        }
      }
    }

    .header-right {
      order: 1;
      align-self: flex-end;
    }
  }
}
</style>
