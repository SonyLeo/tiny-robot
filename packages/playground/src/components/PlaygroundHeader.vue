<template>
  <header class="playground-header">
    <div class="header-left">
      <div class="playground-info">
        <img class="playground-logo" src="/logo.svg" />
        <div class="playground-title">TinyRobot Playground</div>
      </div>

      <div class="mode-selector">
        <button class="mode-btn" :class="{ active: mode === 'repl' }" @click="switchMode('repl')">代码编辑器</button>
        <button class="mode-btn" :class="{ active: mode === 'demo' }" @click="switchMode('demo')">Demo 示例</button>
      </div>
    </div>

    <div class="header-right">
      <div v-if="mode === 'repl'" class="version-selectors">
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
import { ref, watch, inject, type Ref } from 'vue'

interface Props {
  tinyRobotVersions: string[]
  vueVersions: string[]
  typescriptVersions: string[]
  initialTinyRobotVersion?: string
  initialVueVersion?: string
  initialTypescriptVersion?: string
  mode?: 'repl' | 'demo'
}

const props = withDefaults(defineProps<Props>(), {
  initialTinyRobotVersion: 'latest',
  initialVueVersion: 'latest',
  initialTypescriptVersion: 'latest',
  mode: 'repl',
})

const emit = defineEmits<{
  'version-change': [type: string, version: string]
  'theme-toggle': []
  'mode-change': [mode: 'repl' | 'demo']
  share: []
  reload: []
}>()

const tinyRobotVersion = ref(props.initialTinyRobotVersion)
const vueVersion = ref(props.initialVueVersion)
const typescriptVersion = ref(props.initialTypescriptVersion)
const mode = ref<'repl' | 'demo'>(props.mode)

// 从父组件接收主题状态
const isDark = inject<Ref<boolean>>('isDark', ref(false))

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
  emit('theme-toggle')
}

const sharePlayground = () => {
  emit('share')
}

const reloadPlayground = () => {
  emit('reload')
}

const switchMode = (newMode: 'repl' | 'demo') => {
  mode.value = newMode
  emit('mode-change', newMode)
}

const handleVersionChange = (type: string, event: Event) => {
  const target = event.target as HTMLSelectElement
  if (target) {
    emit('version-change', type, target.value)
  }
}
</script>

<style scoped lang="less">
.playground-header {
  // 使用统一的 CSS 变量系统
  --header-height: var(--tr-header-height);
  --header-padding: var(--tr-spacing-xl);
  --logo-size: 32px;
  --action-btn-size: 36px;
  --border-radius: var(--tr-radius-lg);
  --select-border-radius: var(--tr-radius-md);
  --transition-duration: var(--tr-transition-normal);

  // 使用统一的颜色变量
  --primary-color: var(--tr-color-primary);
  --bg-color: var(--tr-bg-secondary);
  --border-color: var(--tr-border-primary);
  --text-color: var(--tr-text-primary);
  --text-secondary: var(--tr-text-secondary);
  --select-bg: var(--tr-bg-primary);
  --select-border: var(--tr-border-primary);
  --btn-bg-hover: var(--tr-bg-tertiary);

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
    gap: 16px;

    .playground-info {
      display: flex;
      align-items: center;
      gap: 6px;

      .playground-logo {
        width: var(--logo-size);
        height: var(--logo-size);
      }

      .playground-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--primary-color);
      }
    }

    .mode-selector {
      display: flex;
      background: var(--select-bg);
      border: 1px solid var(--select-border);
      border-radius: var(--border-radius);
      padding: 2px;

      .mode-btn {
        padding: 6px 12px;
        border: none;
        background: transparent;
        color: var(--text-secondary);
        font-size: 12px;
        cursor: pointer;
        border-radius: calc(var(--border-radius) - 2px);
        transition: all var(--transition-duration) ease;

        &:hover {
          color: var(--text-color);
        }

        &.active {
          background: var(--primary-color);
          color: white;
        }
      }
    }
  }

  .header-right {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 10px;

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
            box-shadow: 0 0 0 2px rgba(101, 91, 248, 0.2);
          }
        }
      }
    }

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
          color: var(--primary-color);
        }

        &.active {
          background: var(--primary-color);
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

// Responsive design
@media (max-width: 768px) {
  .playground-header {
    flex-direction: column;
    height: auto;
    padding: 12px 16px;
    gap: 12px;

    .header-right {
      .version-selectors {
        flex-wrap: wrap;
        gap: 12px;
        justify-content: center;

        .version-selector select {
          min-width: 100px;
        }
      }
    }
  }
}
</style>
