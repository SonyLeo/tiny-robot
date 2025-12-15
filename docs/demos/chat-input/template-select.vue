<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Button as TinyButton } from '@opentiny/vue'
import { ChatInput } from '@opentiny/tiny-robot'
import type { TemplateItem, StructuredData } from '@opentiny/tiny-robot'

const content = ref('')
const submittedContent = ref('')
const structuredData = ref<StructuredData>()

const templateData = ref<TemplateItem[]>([])

// 通过 items 传入响应式数据
const extensions = [ChatInput.template(templateData)]

const setBasicSelect = () => {
  templateData.value = [
    { type: 'text', content: 'Write an essay about' },
    {
      type: 'select',
      placeholder: 'Select a topic',
      options: [
        { label: 'Campus Life', value: 'campus life' },
        { label: 'Travel Experience', value: 'travel experience' },
        { label: 'Reading Habits', value: 'reading habits' },
      ],
      content: '',
    },
    { type: 'text', content: '.' },
  ]
}

const setMultipleSelects = () => {
  templateData.value = [
    { type: 'text', content: 'I want to ' },
    {
      type: 'select',
      placeholder: 'action',
      options: [
        { label: 'learn', value: 'learn' },
        { label: 'practice', value: 'practice' },
        { label: 'master', value: 'master' },
      ],
      content: '',
    },
    { type: 'text', content: ' ' },
    {
      type: 'select',
      placeholder: 'skill',
      options: [
        { label: 'programming', value: 'programming' },
        { label: 'design', value: 'design' },
        { label: 'writing', value: 'writing' },
      ],
      content: '',
    },
    { type: 'text', content: ' in ' },
    {
      type: 'select',
      placeholder: 'time',
      options: [
        { label: '3 months', value: '3 months' },
        { label: '6 months', value: '6 months' },
        { label: '1 year', value: '1 year' },
      ],
      content: '',
    },
    { type: 'text', content: '.' },
  ]
}

const setMixedTemplate = () => {
  templateData.value = [
    { type: 'text', content: '请帮我' },
    {
      type: 'select',
      placeholder: '选择操作',
      options: [
        { label: '分析', value: '分析' },
        { label: '总结', value: '总结' },
        { label: '翻译', value: '翻译' },
        { label: '优化', value: '优化' },
      ],
      content: '',
    },
    { type: 'text', content: '以下内容：' },
    { type: 'block', content: '' },
    { type: 'text', content: '。要求：' },
    {
      type: 'select',
      placeholder: '选择风格',
      options: [
        { label: '简洁明了', value: '简洁明了' },
        { label: '详细全面', value: '详细全面' },
        { label: '专业严谨', value: '专业严谨' },
      ],
      content: '',
    },
  ]
}

const setWithDefaultValue = () => {
  templateData.value = [
    { type: 'text', content: 'Topic: ' },
    {
      type: 'select',
      placeholder: 'Select a topic',
      options: [
        { label: 'Campus', value: 'campus' },
        { label: 'Travel', value: 'travel' },
        { label: 'Reading', value: 'reading' },
      ],
      value: 'campus',
      content: 'campus',
    },
    { type: 'text', content: ', Length: ' },
    { type: 'block', content: '800' },
    { type: 'text', content: ' words' },
  ]
}

const clearTemplate = () => {
  templateData.value = []
  content.value = ''
  submittedContent.value = ''
  structuredData.value = undefined
}

const handleSubmit = (text: string, data?: StructuredData) => {
  submittedContent.value = text
  structuredData.value = data

  console.log('📝 提交内容（纯文本）：', text)
  console.log('📋 结构化数据：', data)
}

onMounted(() => {
  setBasicSelect()
})
</script>

<template>
  <div class="template-select-demo">
    <div class="demo-buttons">
      <tiny-button size="small" @click="setBasicSelect"> 基础选择器 </tiny-button>
      <tiny-button size="small" @click="setMultipleSelects"> 多个选择器 </tiny-button>
      <tiny-button size="small" @click="setMixedTemplate"> 混合模板 </tiny-button>
      <tiny-button size="small" @click="setWithDefaultValue"> 带默认值 </tiny-button>
      <tiny-button size="small" @click="clearTemplate"> 清空 </tiny-button>
    </div>

    <ChatInput
      mode="multiple"
      v-model="content"
      :extensions="extensions"
      placeholder="点击上方按钮插入模板，或直接输入..."
      :max-length="500"
      show-word-limit
      @submit="handleSubmit"
    />

    <div v-if="submittedContent" class="result">
      <div class="result-section">
        <div class="result-title">提交的内容（纯文本）：</div>
        <div class="result-content">{{ submittedContent }}</div>
      </div>

      <div v-if="structuredData" class="result-section">
        <div class="result-title">结构化数据：</div>
        <div class="result-json">{{ JSON.stringify(structuredData, null, 2) }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.template-select-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.demo-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.result {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.result-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.result-content {
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.result-json {
  font-size: 12px;
  font-family: 'Courier New', monospace;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre;
}

.tips {
  padding: 12px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.tips-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
}

.tips-list {
  margin: 0;
  padding-left: 20px;
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.8;
}

.tips-list li {
  margin-bottom: 4px;
}
</style>
