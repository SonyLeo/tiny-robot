<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrSender, UploadButton } from '@opentiny/tiny-robot'

const content = ref('')
const files = ref<File[]>([])
const message = ref('')

const hasFiles = computed(() => files.value.length > 0)

const defaultActions = computed(() => ({
  submit: {
    visible: true,
    canSubmit: (state: { hasContent: boolean }) => state.hasContent || hasFiles.value,
    tooltip: hasFiles.value ? '发送附件' : '请输入内容或选择附件',
  },
}))

const handleFiles = (selectedFiles: File[]) => {
  files.value = selectedFiles
  message.value = `已选择 ${selectedFiles.length} 个附件`
}

const handleSubmit = (text: string) => {
  const fileNames = files.value.map((file) => file.name).join('、')
  message.value = text || fileNames ? `已提交: ${text || '空文本'}${fileNames ? `，附件: ${fileNames}` : ''}` : ''
  content.value = ''
  files.value = []
}
</script>

<template>
  <div class="demo-container">
    <tr-sender
      v-model="content"
      mode="multiple"
      :default-actions="defaultActions"
      placeholder="请输入内容，或只上传附件后发送..."
      @submit="handleSubmit"
    >
      <template #footer-right>
        <UploadButton :multiple="true" tooltip="上传附件" tooltip-placement="top" @select="handleFiles" />
      </template>
    </tr-sender>

    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 20px;
}

.message {
  margin-top: 12px;
  font-size: 14px;
  color: #1476ff;
}
</style>
