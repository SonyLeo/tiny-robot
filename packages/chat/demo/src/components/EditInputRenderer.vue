<template>
  <Transition name="slide-in-right" appear>
    <div class="edit-input-container">
      <div class="edit-textarea-wrapper">
        <textarea
          ref="textareaRef"
          rows="1"
          v-model="localContent"
          @keydown="handleKeydown"
          @input="adjustHeight"
          placeholder="编辑消息内容..."
          autofocus
        />
      </div>
      <div class="edit-input-actions">
        <button class="cancel-btn" @click="handleCancel">
          <span>取消</span>
        </button>
        <button class="save-btn" @click="handleSave" :disabled="isSaving">
          <span>{{ isSaving ? '保存中...' : '保存' }}</span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useMessageContent, type BubbleContentRendererProps } from '@opentiny/tiny-robot'
import { ref, nextTick, onMounted, watch } from 'vue'

const props = defineProps<BubbleContentRendererProps>()

const { contentText } = useMessageContent(props)

const localContent = ref(contentText.value || '')
const textareaRef = ref<HTMLTextAreaElement>()
const isSaving = ref(false)

// 确保消息有 state 对象
watch(
  () => props.message,
  (message) => {
    if (message && !message.state) {
      message.state = {}
    }
  },
  { immediate: true },
)

const adjustHeight = async () => {
  await nextTick()
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }
}

const handleSave = async () => {
  if (!localContent.value.trim()) {
    console.warn('消息内容不能为空')
    return
  }

  isSaving.value = true
  try {
    // 更新消息内容
    // eslint-disable-next-line vue/no-mutating-props
    props.message.content = localContent.value
    // 退出编辑状态
    props.message.state!.isEditing = false
  } finally {
    isSaving.value = false
  }
}

const handleCancel = () => {
  // 退出编辑状态，不保存内容
  props.message.state!.isEditing = false
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault()
    handleSave()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    handleCancel()
  }
}

onMounted(() => {
  adjustHeight()
})
</script>

<style scoped lang="less">
.edit-input-container {
  background: #fff;
  border: 1px solid #1476ff;
  border-radius: 8px;
  padding: 7px 15px;

  textarea {
    display: flex;
    width: 100%;
    border: none;
    outline: none;
    resize: none;
    font-size: 16px;
    line-height: 1.5;
    background: transparent;
    color: #333;
    font-family: inherit;

    &:focus {
      outline: none;
    }
  }

  .edit-input-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 6px;

    button {
      padding: 3px 20px;
      border-radius: 999px;
      cursor: pointer;
      font-size: 12px;
      line-height: 1.5;
      transition: all 0.2s ease;

      @media (max-width: 640px) {
        transition: none;
      }
    }

    .cancel-btn {
      border: 1px solid #d0d0d0;
      background: transparent;
      color: #666;

      &:hover {
        border-color: #999;
      }
    }

    .save-btn {
      border: 1px solid #1476ff;
      background: #1476ff;
      color: #fff;

      &:hover {
        background: #0d5ccc;
        border-color: #0d5ccc;
      }
    }
  }
}

// 滑动动画
.slide-in-right-enter {
  &-active {
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);

    @media (max-width: 640px) {
      transition: none;
    }
  }

  &-from {
    transform: translateX(20px);
    opacity: 0;

    @media (max-width: 640px) {
      transform: translateX(0);
      opacity: 1;
    }
  }

  &-to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
