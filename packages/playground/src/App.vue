<template>
  <div class="playground" :class="{ dark: isDark }">
    <PlaygroundHeader
      :tiny-robot-versions="tinyRobotVersions"
      :vue-versions="vueVersions"
      :typescript-versions="typescriptVersions"
      :initial-tiny-robot-version="tinyRobotVersion"
      :initial-vue-version="vueVersion"
      :initial-typescript-version="typescriptVersion"
      @version-change="handleVersionChange"
      @theme-toggle="handleThemeToggle"
      @share="handleShare"
      @reload="handleReload"
    />
    <div class="playground-content">
      <LoadingSpinner v-if="isLoading" text="Initializing TinyRobot Playground..." />
      <Repl
        v-else
        ref="replRef"
        :store="store"
        :editor="Monaco"
        :show-compile-output="false"
        :show-import-map="true"
        :clear-console="false"
        :theme="isDark ? 'dark' : 'light'"
        @keydown="handleKeydown"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Repl } from '@vue/repl'
import { useStore } from '@vue/repl/core'
import Monaco from '@vue/repl/monaco-editor'
import { LoadingSpinner, PlaygroundHeader } from './components'
import { getVersions, getSupportedTSVersions } from './utils/versions'
import { generateImportMap } from './utils/import-map'
import { getDefaultFiles } from './utils/default-files'

// Version management
const tinyRobotVersions = ref<string[]>([])
const vueVersions = ref<string[]>([])
const typescriptVersions = ref<string[]>([])

const tinyRobotVersion = ref('latest')
const vueVersion = ref('latest')
const typescriptVersion = ref('latest')
const isDark = ref(false)
const isLoading = ref(true)

// Repl store
const store = useStore()

const replRef = ref<InstanceType<typeof Repl>>()

// Initialize from URL hash if available
const initFromUrl = async () => {
  try {
    const hash = window.location.hash.slice(1)
    if (hash) {
      const shareData = JSON.parse(atob(hash))

      // Set versions first
      if (shareData.tinyRobotVersion) {
        tinyRobotVersion.value = shareData.tinyRobotVersion
      }
      if (shareData.vueVersion) {
        vueVersion.value = shareData.vueVersion
      }
      if (shareData.typescriptVersion) {
        typescriptVersion.value = shareData.typescriptVersion
      }

      // Then deserialize the code if available
      if (shareData.code) {
        try {
          store.deserialize(shareData.code)
        } catch (deserializeError) {
          console.warn('Failed to deserialize shared code, using defaults:', deserializeError)
          // Fall back to default files if deserialization fails
          const defaultFiles = getDefaultFiles()
          try {
            await store.setFiles(defaultFiles, 'App.vue')
          } catch (setFilesError) {
            console.error('Failed to set default files during fallback:', setFilesError)
            // Manual file addition as last resort
            Object.entries(defaultFiles).forEach(([filename, content]) => {
              try {
                store.addFile(filename)
                if (store.files[filename]) {
                  store.files[filename].code = content
                } else {
                  console.warn(`File ${filename} not found after manual addition`)
                }
              } catch (addError) {
                console.error(`Failed to manually add file ${filename}:`, addError)
              }
            })
          }
        }
      } else {
        // No code in share data, use defaults
        const defaultFiles = getDefaultFiles()
        try {
          await store.setFiles(defaultFiles, 'App.vue')
        } catch (setFilesError) {
          console.error('Failed to set URL default files:', setFilesError)
          // Manual file addition as last resort
          Object.entries(defaultFiles).forEach(([filename, content]) => {
            try {
              store.addFile(filename)
              if (store.files[filename]) {
                store.files[filename].code = content
              }
            } catch (addError) {
              console.error(`Failed to add URL default file ${filename}:`, addError)
            }
          })
        }
      }

      return true
    }
  } catch (error) {
    console.warn('Failed to parse URL hash:', error)
  }
  return false
}

// Initialize versions
onMounted(async () => {
  try {
    // Load available versions
    const [tinyRobotVers, vueVers, tsVers] = await Promise.all([
      getVersions('@opentiny/tiny-robot'),
      getVersions('vue'),
      getSupportedTSVersions(),
    ])

    tinyRobotVersions.value = tinyRobotVers
    vueVersions.value = vueVers
    typescriptVersions.value = tsVers

    // Initialize the store first
    try {
      store.init()
    } catch (initError) {
      console.error('Failed to initialize store:', initError)
    }

    // Try to initialize from URL first
    const hasUrlData = await initFromUrl()

    if (!hasUrlData) {
      // Set default versions
      tinyRobotVersion.value = tinyRobotVers[0] || 'latest'
      vueVersion.value = vueVers[0] || 'latest'
      typescriptVersion.value = tsVers[0] || 'latest'

      // Initialize default files
      try {
        const defaultFiles = getDefaultFiles()
        await store.setFiles(defaultFiles, 'App.vue')
      } catch (fileError) {
        console.error('Failed to set default files:', fileError)
        // Try to add files one by one as fallback
        const defaultFiles = getDefaultFiles()
        Object.entries(defaultFiles).forEach(([filename, content]) => {
          try {
            store.addFile(filename)
            // Set the file content after adding
            if (store.files[filename]) {
              store.files[filename].code = content
            } else {
              console.warn(`File ${filename} not found in store after adding`)
            }
          } catch (addError) {
            console.error(`Failed to add file ${filename}:`, addError)
          }
        })
      }
    }

    // Always set the active file
    try {
      // Ensure we have files before setting active
      const files = Object.keys(store.files)

      if (files.length === 0) {
        console.warn('No files available, cannot set active file')
      } else if (files.includes('App.vue')) {
        store.setActive('App.vue')
      } else {
        store.setActive(files[0])
      }
    } catch (activeError) {
      console.error('Failed to set active file:', activeError)
      // Try to set any available file as active
      const files = Object.keys(store.files)
      if (files.length > 0) {
        try {
          store.setActive(files[0])
        } catch (fallbackError) {
          console.error('Failed to set fallback active file:', fallbackError)
        }
      }
    }

    // Update import map and load styles
    await updateImportMap()

    // Add a small delay to ensure everything is properly initialized
    setTimeout(() => {
      isLoading.value = false
    }, 1000)
  } catch (error) {
    console.error('Failed to initialize playground:', error)
    isLoading.value = false
  }
})

// Update utils.js file to reflect current TinyRobot version

// Update import map when versions change
const updateImportMap = async () => {
  try {
    const importMap = await generateImportMap({
      tinyRobotVersion: tinyRobotVersion.value,
      vueVersion: vueVersion.value,
      typescriptVersion: typescriptVersion.value,
    })

    store.setImportMap(importMap)
  } catch (error) {
    console.error('Failed to update import map:', error)
  }
}

// Handle version changes
const handleVersionChange = async (type: string, version: string) => {
  switch (type) {
    case 'tinyRobot':
      tinyRobotVersion.value = version
      break
    case 'vue':
      vueVersion.value = version
      break
    case 'typescript':
      typescriptVersion.value = version
      break
  }
  await updateImportMap()
}

// Handle theme toggle
const handleThemeToggle = () => {
  isDark.value = !isDark.value
}

// Handle share functionality
const handleShare = async () => {
  try {
    // Ensure store is properly initialized before serializing
    if (!store.activeFile) {
      alert('Playground is still loading, please try again in a moment.')
      return
    }

    const serializedState = store.serialize()
    const shareData = {
      code: serializedState,
      tinyRobotVersion: tinyRobotVersion.value,
      vueVersion: vueVersion.value,
      typescriptVersion: typescriptVersion.value,
    }

    const shareUrl = `${window.location.origin}${window.location.pathname}#${btoa(JSON.stringify(shareData))}`

    if (navigator.share) {
      await navigator.share({
        title: 'TinyRobot Playground',
        text: 'Check out this TinyRobot component playground',
        url: shareUrl,
      })
    } else {
      await navigator.clipboard.writeText(shareUrl)
      alert('Share link copied to clipboard!')
    }
  } catch (error) {
    console.error('Failed to share:', error)
    alert('Failed to generate share link')
  }
}

// Handle reload functionality
const handleReload = () => {
  // 只刷新预览界面，而不是整个页面
  if (replRef.value) {
    try {
      // 尝试调用 Repl 组件的 reload 方法
      replRef.value.reload()
    } catch (error) {
      console.error('Failed to reload preview via Repl.reload():', error)

      // 如果直接 reload 失败，尝试通过重新设置 import map 来触发刷新
      try {
        updateImportMap()
      } catch (mapError) {
        console.error('Failed to refresh via import map:', mapError)

        // 最后的备选方案：触发文件重新编译
        try {
          const activeFile = store.activeFile
          if (activeFile) {
            // 通过修改文件内容来触发重新编译
            const originalCode = activeFile.code
            activeFile.code = originalCode + ' '
            setTimeout(() => {
              activeFile.code = originalCode
            }, 100)
          }
        } catch (compileError) {
          console.error('Failed to trigger recompile:', compileError)
        }
      }
    }
  } else {
    console.warn('Repl reference not available, cannot reload preview')
    // 如果没有 Repl 引用，尝试重新初始化
    try {
      updateImportMap()
    } catch (error) {
      console.error('Failed to reinitialize:', error)
    }
  }
}

// Handle keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault()
    // Auto-save functionality can be added here
  }
}
</script>

<style lang="less">
@import '@vue/repl/style.css';

.playground {
  // CSS 自定义属性定义
  --transition-duration: 0.2s;
  --mobile-breakpoint: 768px;
  --mobile-header-height: 120px;

  // 亮色模式颜色变量
  --bg-color: #ffffff;
  --brand-color: #42b883;
  --brand-color-variant: #369870;

  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-color);
  transition: background-color var(--transition-duration) ease;

  &.dark {
    // 暗色模式颜色变量覆盖
    --bg-color: #0d1117;
    --brand-color: #58a6ff;
    --brand-color-variant: #1f6feb;

    // Dark theme for repl
    .vue-repl {
      --color-branding: var(--brand-color);
      --color-branding-dark: var(--brand-color-variant);
    }
  }

  .playground-content {
    flex: 1;
    overflow: hidden;
  }
}

// Responsive design
@media (max-width: 768px) {
  .playground .playground-content {
    height: calc(100vh - var(--mobile-header-height));
  }
}
</style>
