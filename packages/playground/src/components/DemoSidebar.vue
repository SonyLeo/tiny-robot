<template>
  <div class="demo-sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <h3 v-if="!isCollapsed">Demo 示例</h3>
      <button class="collapse-btn" @click="toggleCollapse">
        <span :class="isCollapsed ? 'expand-icon' : 'collapse-icon'">
          {{ isCollapsed ? '→' : '←' }}
        </span>
      </button>
    </div>

    <div v-if="!isCollapsed" class="sidebar-content">
      <div class="search-box">
        <input v-model="searchQuery" type="text" placeholder="搜索 demo..." class="search-input" />
      </div>

      <div class="demo-categories">
        <div v-for="category in filteredCategories" :key="category.name" class="category">
          <div class="category-header" @click="toggleCategory(category.name)">
            <span class="category-icon">
              {{ expandedCategories.has(category.name) ? '▼' : '▶' }}
            </span>
            <span class="category-name">{{ formatCategoryName(category.name) }}</span>
            <span class="demo-count">({{ category.demos.length }})</span>
          </div>

          <div v-if="expandedCategories.has(category.name)" class="demo-list">
            <div
              v-for="demo in category.demos"
              :key="demo.path"
              class="demo-item"
              :class="{ active: selectedDemo?.path === demo.path }"
              @click="selectDemo(demo)"
              :title="`${formatDemoName(demo.name)} - ${demo.path}`"
            >
              <span class="demo-name">{{ formatDemoName(demo.name) }}</span>
              <span class="demo-preview-icon">👁</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { DemoFile, DemoCategory } from '../types/demo'
import { loadDemoCategories, getDemoTitle } from '../utils/demo-loader'

const emit = defineEmits<{
  demoSelected: [demo: DemoFile]
}>()

const isCollapsed = ref(false)
const searchQuery = ref('')
const categories = ref<DemoCategory[]>([])
const expandedCategories = ref(new Set<string>())
const selectedDemo = ref<DemoFile | null>(null)

const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value

  return categories.value
    .map((category) => ({
      ...category,
      demos: category.demos.filter(
        (demo) =>
          demo.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          category.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
      ),
    }))
    .filter((category) => category.demos.length > 0)
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const toggleCategory = (categoryName: string) => {
  if (expandedCategories.value.has(categoryName)) {
    expandedCategories.value.delete(categoryName)
  } else {
    expandedCategories.value.add(categoryName)
  }
}

const selectDemo = (demo: DemoFile) => {
  selectedDemo.value = demo
  emit('demoSelected', demo)
}

const formatCategoryName = (name: string) => {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatDemoName = (name: string) => {
  return getDemoTitle(name)
}

onMounted(async () => {
  try {
    categories.value = await loadDemoCategories()
    // 默认展开第一个分类
    if (categories.value.length > 0) {
      expandedCategories.value.add(categories.value[0].name)
    }
  } catch (error) {
    console.error('Failed to load demo categories:', error)
  }
})
</script>

<style scoped>
.demo-sidebar {
  width: var(--tr-sidebar-width);
  height: 100%;
  background: var(--tr-bg-secondary);
  border-right: 1px solid var(--tr-border-primary);
  display: flex;
  flex-direction: column;
  transition: var(--tr-transition-slow);

  &.collapsed {
    width: var(--tr-sidebar-collapsed-width);
  }
}

.sidebar-header {
  padding: var(--tr-spacing-md);
  border-bottom: 1px solid var(--tr-border-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    margin: 0;
    font-size: var(--tr-font-md);
    font-weight: 600;
    color: var(--tr-text-primary);
  }
}

.collapse-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--tr-spacing-xs);
  border-radius: var(--tr-radius-md);
  color: var(--tr-text-secondary);
  transition: var(--tr-transition-normal);

  &:hover {
    background: var(--tr-bg-tertiary);
  }
}

.sidebar-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.search-box {
  padding: var(--tr-spacing-md);
  border-bottom: 1px solid var(--tr-border-primary);
}

.search-input {
  width: 100%;
  padding: 6px var(--tr-spacing-sm);
  border: 1px solid var(--tr-border-primary);
  border-radius: var(--tr-radius-md);
  font-size: var(--tr-font-sm);
  background: var(--tr-bg-primary);
  color: var(--tr-text-primary);
  transition: var(--tr-transition-normal);

  &:focus {
    outline: none;
    border-color: var(--tr-color-primary);
    box-shadow: 0 0 0 2px var(--tr-color-primary-light);
  }
}

.demo-categories {
  flex: 1;
  overflow-y: auto;
  padding: var(--tr-spacing-sm) 0;
}

.category {
  margin-bottom: var(--tr-spacing-xs);
}

.category-header {
  padding: var(--tr-spacing-sm) var(--tr-spacing-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: var(--tr-font-md);
  font-weight: 500;
  color: var(--tr-text-primary);
  user-select: none;
  transition: var(--tr-transition-normal);

  &:hover {
    background: var(--tr-bg-tertiary);
  }
}

.category-icon {
  margin-right: 6px;
  font-size: 10px;
  width: 12px;
  display: inline-block;
}

.category-name {
  flex: 1;
}

.demo-count {
  color: var(--tr-text-secondary);
  font-size: var(--tr-font-xs);
  font-weight: normal;
}

.demo-list {
  margin-left: 18px;
}

.demo-item {
  padding: 6px var(--tr-spacing-md);
  cursor: pointer;
  font-size: var(--tr-font-sm);
  color: var(--tr-text-secondary);
  border-radius: var(--tr-radius-md);
  margin: 1px var(--tr-spacing-sm) 1px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: var(--tr-transition-normal);

  &:hover {
    background: var(--tr-bg-tertiary);
    color: var(--tr-text-primary);

    .demo-preview-icon {
      opacity: 1;
    }
  }

  &.active {
    background: var(--tr-color-primary-light);
    color: var(--tr-color-primary);
    font-weight: 500;

    .demo-preview-icon {
      opacity: 1;
    }
  }
}

.demo-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.demo-preview-icon {
  opacity: 0;
  font-size: 10px;
  margin-left: var(--tr-spacing-xs);
  transition: opacity var(--tr-transition-fast);
}
</style>
