<script setup lang="ts">
import { TinySearch, TinyInput } from '@opentiny/vue'
import { computed, watch, ref, reactive, watchEffect } from 'vue'
import type { SearchProps, SearchEmits, FilterConfig } from '../index.type'

// 扩展 Props 以支持高级搜索功能
interface ExtendedSearchProps extends SearchProps {
  filters?: FilterConfig[]
  showFilters?: boolean
  selectedFilter?: string
  mode?: 'installed' | 'market'
}

interface ExtendedSearchEmits extends SearchEmits {
  (e: 'filter-change', filter: FilterConfig | null): void
}

const props = withDefaults(defineProps<ExtendedSearchProps>(), {
  placeholder: '搜索插件',
  modelValue: '',
  disabled: false,
  filters: () => [],
  showFilters: false,
  selectedFilter: '',
  mode: 'installed',
})

console.log(props)

const emit = defineEmits<ExtendedSearchEmits>()
const inputValue = ref(props.modelValue)

// 双向绑定的搜索值
const searchValue = computed({
  get: () => inputValue.value,
  set: (value: string) => {
    inputValue.value = value
    emit('update:modelValue', value)
  },
})

// 当前选中的过滤器
const currentFilter = ref(props.selectedFilter)

// 监听搜索值变化，实时触发搜索事件
watch(
  () => props.modelValue,
  (newValue) => {
    emit('search', newValue)
  },
  { immediate: true },
)

// 监听过滤器变化
watch(currentFilter, (newFilter) => {
  const filter = props.filters?.find((f) => f.value === newFilter) || null
  emit('filter-change', filter)
})

// 重置所有搜索条件
const resetSearch = () => {
  searchValue.value = ''
  currentFilter.value = ''
}

// 暴露重置方法给父组件
defineExpose({
  resetSearch,
})

const searchTypes = computed(() => {
  return props.mode === 'installed'
    ? []
    : [
        {
          text: '找人',
          value: 1,
        },
        {
          text: '找文档',
          value: 2,
        },
        {
          text: '找谁',
          value: 3,
        },
      ]
})

const typeValue = reactive(searchTypes.value[2])

watchEffect(() => {
  console.log(props.mode, 'props')
})
</script>

<template>
  <div class="mcp-search__container">
    <tiny-input v-if="mode === 'installed'" v-model="searchValue" :placeholder="placeholder" :disabled="disabled" />
    <tiny-search v-else :search-types="searchTypes" :type-value="typeValue"></tiny-search>
  </div>
</template>

<style lang="less" scoped>
.mcp-search__container {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;

  > :deep(.tiny-search .tiny-search__line) {
    border-radius: 81px;
  }

  > :deep(.tiny-input .tiny-input__inner) {
    border-radius: 81px;
  }
}
</style>
