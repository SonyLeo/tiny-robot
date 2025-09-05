<script setup lang="ts">
import { TinyInput, TinySelect, TinyOption } from '@opentiny/vue'
import { IconSearch } from '@opentiny/tiny-robot-svgs'
import { computed, watch, ref } from 'vue'
import type { SearchEmits, FilterConfig, SearchProps } from '../index.type'
import { useBreakpoints } from '@vueuse/core'
import MobileSearch from './MobileSearch.vue'

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

const emit = defineEmits<ExtendedSearchEmits>()

// 双向绑定的搜索值
const searchValue = computed({
  get: () => props.modelValue,
  set: (value: string) => {
    emit('update:modelValue', value)
  },
})

// 当前选中的过滤器
const currentFilter = ref(props.selectedFilter)

const breakpoints = useBreakpoints({ mobile: 768 })

const isMobile = breakpoints.smaller('mobile')

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

// 处理输入事件
const handleInput = (value: string) => {
  searchValue.value = value
}

// 处理清空事件
const handleClear = () => {
  searchValue.value = ''
}

// 处理过滤器选择
const handleFilterChange = (value: string) => {
  currentFilter.value = value
}

// 重置所有搜索条件
const resetSearch = () => {
  searchValue.value = ''
  currentFilter.value = ''
}

// 暴露重置方法给父组件
defineExpose({
  resetSearch,
})
</script>

<template>
  <div class="mcp-search">
    <div class="mcp-search__container">
      <!-- 移动端搜索组件-->

      <template v-if="isMobile">
        <MobileSearch :props="props" :mode="mode" />
      </template>

      <template v-else>
        <!-- 过滤器下拉框 -->
        <div v-if="showFilters && filters" class="mcp-search__filter">
          <TinySelect
            v-model="currentFilter"
            placeholder="选择过滤器"
            clearable
            @update:model-value="handleFilterChange"
            class="mcp-search__filter-select"
          >
            <TinyOption v-for="filter in filters" :key="filter.value" :label="filter.label" :value="filter.value" />
          </TinySelect>
        </div>

        <!-- 搜索输入框 -->
        <div class="mcp-search__input-wrapper">
          <TinyInput
            :model-value="searchValue"
            :placeholder="placeholder"
            :disabled="disabled"
            clearable
            @update:model-value="handleInput"
            @clear="handleClear"
            class="mcp-search__input"
          >
            <template #suffix>
              <IconSearch class="mcp-search__icon" />
            </template>
          </TinyInput>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="less" scoped>
.mcp-search {
  width: 100%;

  &__container {
    display: flex;
    gap: 12px;
    align-items: center;
    width: 100%;
  }

  &__filter {
    flex-shrink: 0;
    min-width: 160px;

    &-select {
      width: 100%;

      :deep(.tiny-select) {
        .tiny-input__inner {
          border-radius: 8px;
          border: 1px solid #dbdbdb;

          &:focus {
            border-color: #1476ff;
            box-shadow: 0 0 0 2px rgba(20, 118, 255, 0.1);
          }
        }
      }
    }
  }

  &__input-wrapper {
    flex: 1;
    min-width: 0;
  }

  &__input {
    width: 100%;

    :deep(.tiny-input__inner) {
      border-radius: 8px;
      border: 1px solid #dbdbdb;

      &:focus {
        border-color: #1476ff;
        box-shadow: 0 0 0 2px rgba(20, 118, 255, 0.1);
      }
    }
  }

  &__icon {
    font-size: 16px;
    color: #595959;
    cursor: pointer;

    &:hover {
      color: #1476ff;
    }
  }
}
</style>
