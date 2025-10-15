const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/CompactMode.BiTaDWen.js","assets/chunks/theme.FCGLGkiy.js","assets/chunks/framework.CSeOnaMy.js","assets/chunks/All.CknhYD70.js","assets/chunks/Suggestions.BSAP-fYx.js","assets/chunks/Template.RvlgSU1D.js","assets/chunks/FileUpload.BxGLIigk.js","assets/chunks/DecorativeContent.WksAJBbV.js","assets/chunks/CustomSpeech.B2PZyB3S.js","assets/chunks/voiceInput.BCZh5mOl.js","assets/chunks/DeepThink.7KwbREKO.js","assets/chunks/AutoSize.jT2jdZMP.js","assets/chunks/Mode.4VLiVrKe.js"])))=>i.map(i=>d[i]);
import{D as o,v as h,V as c,p as w,C as T,c as Z,o as W,a2 as d,af as k,G as n,j as s,ag as E,k as e,w as l,ai as u,a as r}from"./chunks/framework.CSeOnaMy.js";import{L as C,N as g}from"./chunks/index.BlMrQgh7.js";const q=`<template>
  <div class="demo-container">
    <h3>紧凑模式配置演示</h3>
    <p>通过添加 <code>tr-sender-compact</code> CSS类可以启用紧凑样式，适用于空间受限的场景。</p>

    <div class="mode-section">
      <h4>默认样式（宽松模式）</h4>
      <p>适用于独立页面或全屏对话场景，具有较大的字体（16px）、宽松的内边距、大圆角（26px）和大发送图标（36px）。</p>

      <div class="example-group">
        <h5>单行模式</h5>
        <tr-sender mode="single" placeholder="默认单行模式..." style="margin-bottom: 10px" />

        <h5>多行模式</h5>
        <tr-sender mode="multiple" placeholder="默认多行模式..." :showWordLimit="true" :maxLength="200" />
      </div>
    </div>

    <div class="mode-section">
      <h4>紧凑模式</h4>
      <p>适用于侧边栏、抽屉或紧凑界面，具有较小的字体（14px）、紧凑的内边距、小圆角（24px）和小发送图标（32px）。</p>

      <div class="example-group compact-container">
        <h5>单行模式</h5>
        <tr-sender class="tr-sender-compact" mode="single" placeholder="紧凑单行模式..." style="margin-bottom: 10px" />

        <h5>多行模式</h5>
        <tr-sender
          class="tr-sender-compact"
          mode="multiple"
          placeholder="紧凑多行模式..."
          :showWordLimit="true"
          :maxLength="100"
        />
      </div>
    </div>

    <div class="comparison-section">
      <h4>样式对比</h4>
      <div class="comparison-grid">
        <div class="comparison-item">
          <h5>默认样式</h5>
          <tr-sender mode="single" placeholder="默认样式示例" />
        </div>
        <div class="comparison-item">
          <h5>紧凑样式</h5>
          <tr-sender class="tr-sender-compact" mode="single" placeholder="紧凑样式示例" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrSender } from '@opentiny/tiny-robot'
<\/script>

<style scoped>
.demo-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.mode-section {
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
}

.example-group {
  margin-top: 12px;
}

.compact-container {
  max-width: 300px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
}

.custom-vars-section {
  border: 1px solid #1476ff;
  border-radius: 8px;
  padding: 16px;
  background: rgba(20, 118, 255, 0.02);
}

.custom-example {
  margin: 12px 0;
  max-width: 280px;
}

.comparison-section {
  border: 1px solid #52c41a;
  border-radius: 8px;
  padding: 16px;
  background: rgba(82, 196, 26, 0.02);
}

.comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 12px;
}

.comparison-item {
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: white;
}

.code-example {
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  color: #333;
  overflow-x: auto;
}

h3 {
  color: #333;
  margin-bottom: 8px;
}

h4 {
  color: #1476ff;
  margin-bottom: 8px;
}

h5 {
  color: #666;
  font-size: 14px;
  margin: 8px 0 4px 0;
}

p {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
}

code {
  background: #f0f0f0;
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 12px;
}
</style>
`,I=`<template>
  <tr-sender
    v-model="inputMessage"
    mode="multiple"
    submitType="ctrlEnter"
    :maxLength="2000"
    :showWordLimit="true"
    :autoSize="true"
    :clearable="true"
    :allowSpeech="true"
    :loading="isSubmitting"
    placeholder="请输入您的消息..."
    @submit="handleSubmit"
    @speech-end="handleSpeechEnd"
  >
    <template #header>
      <div class="conversation-title">自定义插槽</div>
    </template>

    <template #prefix>
      <icon-ai class="user-avatar" />
    </template>

    <template #footer-left>
      <tiny-tooltip :disabled="isActive" content="适用于复杂问题解析" placement="top" theme="dark">
        <div :class="['button-wrapper', isActive ? 'active' : '']" @click="toggleActive">
          <div class="button">
            <IconThink class="icon-think" />
            <span class="text">深度思考</span>
          </div>
        </div>
      </tiny-tooltip>
    </template>

    <template #footer-right>
      <IconSearch class="icon-search" />
    </template>
  </tr-sender>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import { IconAi, IconThink, IconSearch } from '@opentiny/tiny-robot-svgs'
import { TinyTooltip } from '@opentiny/vue'

const isActive = ref(false)

const inputMessage = ref('')
const isSubmitting = ref(false)

const toggleActive = () => {
  isActive.value = !isActive.value
}

const handleSubmit = async (message) => {
  isSubmitting.value = true
  try {
    inputMessage.value = '' // 清空输入
    console.log('发送成功:', message)
  } catch (error) {
    console.error('发送失败:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleSpeechEnd = (transcript) => {
  console.log('语音识别结果:', transcript)
}
<\/script>

<style scoped>
.conversation-title {
  font-weight: bold;
  padding: 8px 0;
  text-align: center;
}

.user-avatar {
  font-size: 28px;
  object-fit: cover;
}

.custom-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
}

.icon-search {
  color: #595959;
  font-size: 20px;
  cursor: pointer;
}

.text {
  width: 56px;
  height: 22px;
  line-height: 22px;
  font-size: 14px;
  font-weight: 400;
  text-align: left;
}

.icon-think {
  width: 16px;
  height: 16px;
  color: #595959;
}

.button-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 32px;
  border: 1px solid rgb(194, 194, 194);
  border-radius: 999px;
  cursor: pointer;
  box-sizing: border-box;
}
.button-wrapper:hover {
  background-color: rgba(0, 0, 0, 0.08);
}

.button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.button-wrapper.active {
  border: 1px solid rgb(20, 118, 255);
  background: rgba(20, 118, 255, 0.08);
  color: rgb(20, 118, 255);

  .icon-think {
    color: rgb(20, 118, 255);
  }
}

.button-wrapper.active:hover {
  background: rgba(20, 118, 255, 0.12);
}

:deep(.tiny-tooltip.tiny-tooltip__popper) {
  border-radius: 4px;
  padding: 4px 8px;
  background: rgb(89, 89, 89);
  box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.16);
}
</style>
`,R=`<template>
  <div class="demo-container">
    <h3>单行模式 (mode="single") - 默认</h3>
    <tr-sender
      mode="single"
      v-model="textSingle"
      :suggestions="sampleSuggestions"
      placeholder="尝试输入 'ECS', 'CDN' 等查看联想效果。"
    ></tr-sender>
    <p>当前输入: {{ textSingle }}</p>

    <h3>多行模式 (mode="multiple")</h3>
    <tr-sender
      v-model="textMultiple"
      :suggestions="sampleSuggestions"
      mode="multiple"
      placeholder="多行模式联想..."
    ></tr-sender>
    <p>当前输入: {{ textMultiple }}</p>

    <h3>自定义高亮方式</h3>
    <tr-sender
      v-model="textCustomHighlight"
      :suggestions="customHighlightSuggestions"
      mode="single"
      placeholder="输入'云'或'CDN'查看自定义高亮..."
    ></tr-sender>
    <p>当前输入: {{ textCustomHighlight }}</p>

    <h3>自定义激活按键</h3>
    <tr-sender
      v-model="textCustomKeys"
      :suggestions="sampleSuggestions"
      :activeSuggestionKeys="['Tab']"
      mode="single"
      placeholder="输入'ECS'后按 Tab 键选中联想项..."
    ></tr-sender>
    <p>当前输入: {{ textCustomKeys }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrSender, type SuggestionTextPart } from '@opentiny/tiny-robot'

const textSingle = ref('')
const textMultiple = ref('')
const textCustomHighlight = ref('')
const textCustomKeys = ref('')

// 基础建议项
const sampleSuggestions = ref([
  { content: 'ECS-云服务器卡顿问题' },
  { content: 'ECS-云服务器卡顿' },
  { content: 'ECS-备份弹性云服务器' },
  { content: 'ECS-搜索ECS' },
  { content: 'ECS-云服务器状态' },
  { content: 'ECS-免费云服务器' },
  { content: 'CDN-权限管理' },
  { content: 'CDN常见问题场景以及解决方法有哪些？' },
  { content: 'CDN-CDN是否支持全站加速？' },
  { content: 'CDN-添加CDN加速域名' },
])

// 自定义高亮建议项
const customHighlightSuggestions = ref([
  // 使用预定义高亮字符串数组
  {
    content: 'ECS-云服务器卡顿问题',
    highlights: ['云服务器', '卡顿'],
  },
  // 使用自定义高亮函数
  {
    content: 'ECS-备份弹性云服务器',
    highlights: (text: string) => {
      // 简单示例：高亮所有"云"字
      const parts: SuggestionTextPart[] = []
      let lastIndex = 0

      // 查找所有"云"字并高亮
      const keyword = '云'
      let index = text.indexOf(keyword)
      while (index !== -1) {
        // 添加前面的非匹配部分
        if (index > lastIndex) {
          parts.push({ text: text.substring(lastIndex, index), isMatch: false })
        }

        // 添加匹配部分
        parts.push({ text: keyword, isMatch: true })

        lastIndex = index + keyword.length
        index = text.indexOf(keyword, lastIndex)
      }

      // 添加最后剩余的部分
      if (lastIndex < text.length) {
        parts.push({ text: text.substring(lastIndex), isMatch: false })
      }

      return parts
    },
  },
  // 不指定高亮，使用默认高亮逻辑
  {
    content: 'CDN-权限管理与配置',
  },
  {
    content: 'CDN常见问题场景以及解决方法有哪些？',
    highlights: ['CDN', '问题', '解决方法'],
  },
])
<\/script>

<style scoped>
.demo-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

h3 {
  margin-bottom: 5px;
}

p {
  margin-top: 5px;
  margin-bottom: 10px;
  font-size: 0.9em;
  color: #555;
}
</style>
`,P=`<template>
  <div class="app-container">
    <h4 style="margin-bottom: 20px">模板编辑器</h4>
    <tr-sender
      v-model="inputText"
      v-model:template-data="templateData"
      mode="multiple"
      clearable
      @submit="handleSubmit"
      ref="senderRef"
    />

    <div class="template-selector-container">
      <h4>请选择模板</h4>
      <p style="font-size: 12px; color: #666; margin: 5px 0">
        💡 提示：设置模板后，你可以尝试复制模板字段并粘贴到其他位置，样式会自动保持一致
      </p>
    </div>

    <div class="template-selector">
      <button
        v-for="(item, index) in templates"
        :key="index"
        @click="selectTemplate(item)"
        class="template-button"
        :class="{ active: activeTemplateName === item.name }"
      >
        {{ item.name }}
      </button>
    </div>

    <!-- 实时显示输入值用于测试 -->
    <div class="real-time-value" v-if="inputText">
      <h4>当前输入值 (用于测试复制粘贴功能):</h4>
      <div class="value-display">
        <code>{{ inputText }}</code>
      </div>
      <p style="font-size: 12px; color: #666; margin-top: 8px">
        复制粘贴后，这里的值应该会实时更新。如果没有更新，说明存在问题。
      </p>
    </div>

    <div class="test-info" v-if="activeTemplateName">
      <h4>当前模板: {{ activeTemplateName }}</h4>
      <pre>{{ JSON.stringify(templateData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrSender, type UserItem } from '@opentiny/tiny-robot'
import { ref, onMounted } from 'vue'

const inputText = ref('')
const senderRef = ref(null)
const templateData = ref<UserItem[]>([])
const activeTemplateName = ref('')

// 预定义模板
const templates = [
  {
    name: '模板1',
    data: [
      { type: 'text', content: '你好' },
      { type: 'template', content: '张三' },
      { type: 'text', content: '，欢迎使用' },
      { type: 'template', content: 'TinyRobot' },
      { type: 'text', content: '！' },
    ],
  },
  {
    name: '模板2',
    data: [
      { type: 'text', content: '你好' },
      { type: 'template', content: '张三先生' },
      { type: 'text', content: '，关于' },
      { type: 'template', content: '' },
      { type: 'text', content: '的进展，请查看' },
      { type: 'template', content: '' },
      { type: 'text', content: '。' },
    ],
  },
  {
    name: '模板3',
    data: [
      { type: 'text', content: '尊敬的' },
      { type: 'template', content: '李明先生' },
      { type: 'text', content: '，您的' },
      { type: 'template', content: '定制化软件开发项目' },
      { type: 'text', content: '已经' },
      { type: 'template', content: '进入开发阶段' },
      { type: 'text', content: '，预计将在' },
      { type: 'template', content: '三个工作日内' },
      { type: 'text', content: '完成。' },
    ],
  },
  {
    name: '模板4',
    data: [
      { type: 'template', content: '北京某某科技有限公司产品研发部技术总监' },
      { type: 'text', content: '向' },
      { type: 'template', content: '上海某某集团信息技术部系统架构师团队负责人' },
      { type: 'text', content: '发送关于' },
      { type: 'template', content: '关于新一代人工智能客服系统设计方案的深度讨论与合作意向洽谈' },
      { type: 'text', content: '的邮件。' },
    ],
  },
  {
    name: '模板5',
    data: [
      { type: 'template', content: 'AI' },
      { type: 'text', content: '和' },
      { type: 'template', content: '企业级人工智能解决方案技术研讨会暨产品发布会' },
      { type: 'text', content: '在' },
      { type: 'template', content: '明天' },
      { type: 'text', content: '进行' },
      { type: 'template', content: '深度技术交流' },
      { type: 'text', content: '。' },
    ],
  },
  {
    name: '模板6',
    data: [{ type: 'text', content: 'ECS 服务器的最新版本' }],
  },
]

// 选择模板
const selectTemplate = (template) => {
  activeTemplateName.value = template.name
  templateData.value = template.data
  senderRef.value?.activateTemplateFirstField()
}

// 提交处理
const handleSubmit = (text) => {
  console.log('提交模板填充内容:', text)
  alert(\`提交内容: \${text}\`)
}

onMounted(() => {
  selectTemplate(templates[0])
})
<\/script>

<style scoped>
.app-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.template-selector {
  margin: 20px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.template-button {
  padding: 8px 16px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.template-button:hover {
  background: #e0e0e0;
}

.template-button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.real-time-value {
  margin: 20px 0;
  padding: 15px;
  background: #e8f4f8;
  border-radius: 8px;
  border: 1px solid #b8daff;
}

.real-time-value h4 {
  margin: 0 0 10px 0;
  color: #495057;
  font-size: 14px;
}

.value-display {
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 10px;
  margin: 8px 0;
  min-height: 20px;
}

.value-display code {
  background: transparent;
  padding: 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  color: #212529;
  word-break: break-all;
}

.test-info {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.test-info h4 {
  margin: 0 0 10px 0;
  color: #495057;
}

.test-info p {
  margin: 0 0 15px 0;
}

.test-info code {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.test-info pre {
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 10px;
  margin: 0;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.4;
}
</style>
`,X=`<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <!-- 默认位置 (top) -->
    <div>
      <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #666">默认 Tooltip 位置 (top)</h4>
      <tr-sender
        mode="multiple"
        :allow-files="true"
        :button-group="buttonGroup"
        @files-selected="handleFilesSelected"
        @submit="handleSubmit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const renderTooltip = () => {
  return h(
    'div',
    {
      style: {
        fontSize: '12px',
        maxWidth: '200px',
      },
    },
    [h('div', null, '• 支持最多上传3个图片（每个 10MB 以内）'), h('div', null, '• 支持图片格式JPG、PNG')],
  )
}

const buttonGroup = ref({
  file: {
    tooltips: renderTooltip,
    disabled: false,
    accept: 'image/jpeg, image/png',
  },
  submit: {
    tooltips: '',
    disabled: false,
  },
})

const handleFilesSelected = (files: File[]) => {
  console.log(files)
  // 文件数量大于3无法继续上传，禁用上传按钮并提示
  if (files.length > 3) {
    buttonGroup.value.file.disabled = true
    buttonGroup.value.submit.disabled = true
    buttonGroup.value.submit.tooltips = '请上传完再发送'
  } else {
    buttonGroup.value.file.disabled = false
    buttonGroup.value.submit.disabled = false
    buttonGroup.value.submit.tooltips = ''
  }
}

const handleSubmit = (message: string) => {
  console.log('submit', message)
}
<\/script>
`,G=`<template>
  <div class="demo-container">
    <h3>服务状态提示</h3>
    <div class="demo-section">
      <div class="demo-section">
        <h4>使用示例</h4>
        <p>使用 decorativeContent 插槽添加装饰性内容，会自动禁用输入和发送功能：</p>
        <tr-sender :allow-speech="false">
          <template #decorativeContent>
            缴费服务正在进行中，<a href="https://example.com" target="_blank">点击前往</a>
          </template>
        </tr-sender>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrSender } from '@opentiny/tiny-robot'
<\/script>

<style scoped>
.demo-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.demo-section {
  margin-bottom: 20px;
}

h4 {
  margin-bottom: 8px;
}
</style>
`,V=`<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <!-- 状态显示 -->
    <div
      v-if="speechStatus"
      style="padding: 12px; background: #e8f4fd; border-radius: 6px; border-left: 4px solid #1890ff"
    >
      <div style="font-weight: 500; color: #1890ff">{{ speechStatus }}</div>
      <div v-if="interimResult" style="margin-top: 8px; color: #666; font-style: italic">
        实时识别: {{ interimResult }}
      </div>
    </div>

    <!-- 输入组件 -->
    <div>
      <h4 style="margin: 24px 0">模拟语音识别演示</h4>
      <tr-sender
        v-model="inputText"
        mode="single"
        :allowSpeech="true"
        :speech="speechConfig"
        placeholder="点击麦克风按钮开始语音输入..."
        @speech-start="handleSpeechStart"
        @speech-interim="handleSpeechInterim"
        @speech-final="handleSpeechFinal"
        @speech-end="handleSpeechEnd"
        @speech-error="handleSpeechError"
        @submit="handleSubmit"
      />
    </div>

    <!-- 结果展示 -->
    <div v-if="results.length > 0" style="padding: 16px; background: #f9f9f9; border-radius: 8px">
      <h4 style="margin: 0 0 12px 0">识别历史</h4>
      <div style="max-height: 200px; overflow-y: auto">
        <div
          v-for="(result, index) in results"
          :key="index"
          style="
            padding: 8px;
            margin-bottom: 8px;
            background: white;
            border-radius: 4px;
            border-left: 3px solid #52c41a;
          "
        >
          <div style="font-size: 12px; color: #999; margin-bottom: 4px">{{ result.timestamp }}</div>
          <div>{{ result.text }}</div>
        </div>
      </div>
    </div>

    <!-- 使用说明 -->
    <div style="padding: 16px; background: #fffbe6; border-radius: 8px; border-left: 4px solid #faad14">
      <h4 style="margin: 0 0 8px 0; color: #fa8c16">使用说明</h4>
      <ul style="margin: 0; padding-left: 20px; color: #666">
        <li>此示例使用模拟语音识别，无需真实 API 配置</li>
        <li>点击麦克风按钮后会模拟语音识别过程，展示中间结果和最终结果</li>
        <li>如需接入真实的语音识别服务（阿里云等），请参考 <code>speechHandlers.ts</code> 中的实现示例</li>
        <li>支持自定义语音处理器，实现任意第三方语音识别服务的集成</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import { AliyunSpeechHandler } from './speechHandlers'

// 组件状态
const inputText = ref('')
const speechStatus = ref('')
const interimResult = ref('')
const results = ref<Array<{ text: string; timestamp: string }>>([])

// 语音配置 - 使用模拟处理器
const speechConfig = {
  customHandler: new AliyunSpeechHandler(),
  interimResults: true,
}

// 事件处理
const handleSpeechStart = () => {
  speechStatus.value = '🎤 正在录音...'
  interimResult.value = ''
}

const handleSpeechInterim = (transcript: string) => {
  interimResult.value = transcript
}

const handleSpeechFinal = (transcript: string) => {
  speechStatus.value = '✅ 识别完成'
  interimResult.value = ''

  // 记录识别结果
  results.value.unshift({
    text: transcript,
    timestamp: new Date().toLocaleTimeString(),
  })

  // 限制历史记录数量
  if (results.value.length > 10) {
    results.value = results.value.slice(0, 10)
  }
}

const handleSpeechEnd = () => {
  speechStatus.value = ''
  interimResult.value = ''
}

const handleSpeechError = (error: Error) => {
  speechStatus.value = ''
  interimResult.value = ''
  console.error('语音识别错误:', error)
}

const handleSubmit = (text: string) => {
  console.log('提交内容:', text)
}
<\/script>
`,L=`<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <h4>混合输入</h4>
    <tr-sender mode="multiple" :allowSpeech="true" :speech="{ autoReplace: false, interimResults: true }" />
    <h4>不间断语音输入</h4>
    <tr-sender mode="multiple" :allowSpeech="true" :speech="{ autoReplace: true, continuous: true }" />
  </div>
</template>

<script setup lang="ts">
import { TrSender } from '@opentiny/tiny-robot'
<\/script>
`,z=`<template>
  <tr-sender mode="multiple" :showWordLimit="true" :maxLength="1000">
    <template #footer-left>
      <tiny-tooltip :disabled="isActive" content="适用于复杂问题解析" placement="top" theme="dark">
        <div :class="['button-wrapper', isActive ? 'active' : '']" @click="toggleActive">
          <div class="button">
            <IconThink class="icon-think" />
            <span class="text">深度思考</span>
          </div>
        </div>
      </tiny-tooltip>
    </template>
  </tr-sender>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import { IconThink } from '@opentiny/tiny-robot-svgs'
import { TinyTooltip } from '@opentiny/vue'

const isActive = ref(false)

const toggleActive = () => {
  isActive.value = !isActive.value
}
<\/script>

<style scoped>
.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.text {
  width: 56px;
  height: 22px;
  line-height: 22px;
  font-size: 14px;
  font-weight: 400;
  text-align: left;
}

.icon-think {
  width: 16px;
  height: 16px;
  color: #595959;
}

.button-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 32px;
  border: 1px solid rgb(194, 194, 194);
  border-radius: 999px;
  cursor: pointer;
  box-sizing: border-box;
}

.button-wrapper:hover {
  background-color: rgba(0, 0, 0, 0.08);
}

.button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.button-wrapper.active {
  border: 1px solid rgb(20, 118, 255);
  background: rgba(20, 118, 255, 0.08);
  color: rgb(20, 118, 255);

  .icon-think {
    color: rgb(20, 118, 255);
  }
}

.button-wrapper.active:hover {
  background: rgba(20, 118, 255, 0.12);
}

:deep(.tiny-tooltip.tiny-tooltip__popper) {
  border-radius: 4px;
  padding: 4px 8px;
  background: rgb(89, 89, 89);
  box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.16);
}
</style>
`,N=`<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <tr-sender mode="multiple" :autoSize="true" placeholder="autosize 为 true" />
    <tr-sender
      mode="multiple"
      :autoSize="{ minRows: 2, maxRows: 3 }"
      placeholder="autosize 为 {minRows: 2, maxRows: 3}"
    />
  </div>
</template>

<script setup lang="ts">
import { TrSender } from '@opentiny/tiny-robot'
<\/script>
`,M=`<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <h4>单行模式</h4>
    <tr-sender />
    <h4>多行模式</h4>
    <tr-sender mode="multiple" />
  </div>
</template>

<script setup lang="ts">
import { TrSender } from '@opentiny/tiny-robot'
<\/script>
`,J=JSON.parse('{"title":"Sender 消息输入框组件","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/sender.md","filePath":"components/sender.md"}'),U={name:"components/sender.md"},O=Object.assign(U,{setup(j){const A=o();h(async()=>{A.value=(await c(async()=>{const{default:a}=await import("./chunks/CompactMode.BiTaDWen.js");return{default:a}},__vite__mapDeps([0,1,2]))).default});const m=o();h(async()=>{m.value=(await c(async()=>{const{default:a}=await import("./chunks/All.CknhYD70.js");return{default:a}},__vite__mapDeps([3,1,2]))).default});const F=o();h(async()=>{F.value=(await c(async()=>{const{default:a}=await import("./chunks/Suggestions.BSAP-fYx.js");return{default:a}},__vite__mapDeps([4,1,2]))).default});const B=o();h(async()=>{B.value=(await c(async()=>{const{default:a}=await import("./chunks/Template.RvlgSU1D.js");return{default:a}},__vite__mapDeps([5,1,2]))).default});const b=o();h(async()=>{b.value=(await c(async()=>{const{default:a}=await import("./chunks/FileUpload.BxGLIigk.js");return{default:a}},__vite__mapDeps([6,1,2]))).default});const v=o();h(async()=>{v.value=(await c(async()=>{const{default:a}=await import("./chunks/DecorativeContent.WksAJBbV.js");return{default:a}},__vite__mapDeps([7,1,2]))).default});const D=o();h(async()=>{D.value=(await c(async()=>{const{default:a}=await import("./chunks/CustomSpeech.B2PZyB3S.js");return{default:a}},__vite__mapDeps([8,1,2]))).default});const f=o();h(async()=>{f.value=(await c(async()=>{const{default:a}=await import("./chunks/voiceInput.BCZh5mOl.js");return{default:a}},__vite__mapDeps([9,1,2]))).default});const x=o();h(async()=>{x.value=(await c(async()=>{const{default:a}=await import("./chunks/DeepThink.7KwbREKO.js");return{default:a}},__vite__mapDeps([10,1,2]))).default});const S=o();h(async()=>{S.value=(await c(async()=>{const{default:a}=await import("./chunks/AutoSize.jT2jdZMP.js");return{default:a}},__vite__mapDeps([11,1,2]))).default});const i=w(!0),_=o();return h(async()=>{_.value=(await c(async()=>{const{default:a}=await import("./chunks/Mode.4VLiVrKe.js");return{default:a}},__vite__mapDeps([12,1,2]))).default}),(a,t)=>{const p=T("ClientOnly"),y=T("tr-sender");return W(),Z("div",null,[t[11]||(t[11]=d('<h1 id="sender-消息输入框组件" tabindex="-1">Sender 消息输入框组件 <a class="header-anchor" href="#sender-消息输入框组件" aria-label="Permalink to &quot;Sender 消息输入框组件&quot;">​</a></h1><p>Sender 是一个灵活的输入组件，支持多种输入方式和功能，包括文本输入、语音输入、模板填充等。具有丰富的功能和自定义选项。适用于聊天界面、评论输入、搜索框等多种场景。</p><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="基础用法" tabindex="-1">基础用法 <a class="header-anchor" href="#基础用法" aria-label="Permalink to &quot;基础用法&quot;">​</a></h3><blockquote><p>单行模式(<code>mode=&quot;single&quot;</code>), 适用于简单的输入场景，如搜索框、简短消息输入等。</p></blockquote><ul><li><p><strong>换行说明，在单行模式下</strong>：</p></li><li><p>1.输入文字超出单行宽度限制时，会自动切换至多行模式。</p></li><li><p>2.使用快捷键组合 <code>shift+enter</code> 可以直接切换至多行模式</p></li></ul><blockquote><p>多行模式(<code>mode=&quot;multiple&quot;</code>)适用于较长文本输入，如评论、聊天消息等。</p></blockquote>',7)),k(n(e(C),null,null,512),[[E,i.value]]),n(p,null,{default:l(()=>[n(e(g),{title:"基础用法",description:"Sender 组件的基础用法，支持单行和多行模式。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{i.value=!1}),vueCode:e(M)},u({_:2},[_.value?{name:"vue",fn:l(()=>[n(e(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[12]||(t[12]=s("h3",{id:"状态控制",tabindex:"-1"},[r("状态控制 "),s("a",{class:"header-anchor",href:"#状态控制","aria-label":'Permalink to "状态控制"'},"​")],-1)),t[13]||(t[13]=s("h4",{id:"加载状态",tabindex:"-1"},[r("加载状态 "),s("a",{class:"header-anchor",href:"#加载状态","aria-label":'Permalink to "加载状态"'},"​")],-1)),t[14]||(t[14]=s("p",null,[r("通过设置"),s("code",null,"loading"),r("属性控制组件的加载状态，加载状态下输入框将显示加载动画并禁用输入。 在加载状态下，点击加载图标可以取消发送操作，这会触发 "),s("code",null,"cancel"),r(" 事件。")],-1)),n(y,{loading:!0,stopText:"停止回答"}),t[15]||(t[15]=d('<div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">tr-sender</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">loading</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> stopText</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;停止回答&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div><h4 id="禁用状态" tabindex="-1">禁用状态 <a class="header-anchor" href="#禁用状态" aria-label="Permalink to &quot;禁用状态&quot;">​</a></h4><p>通过设置<code>disabled</code>属性禁用整个组件，禁用状态下无法输入内容或触发任何操作。</p>',3)),n(y,{disabled:!0}),t[16]||(t[16]=d('<div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">tr-sender</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">disabled</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div><h3 id="内容控制" tabindex="-1">内容控制 <a class="header-anchor" href="#内容控制" aria-label="Permalink to &quot;内容控制&quot;">​</a></h3><h4 id="字数限制与统计" tabindex="-1">字数限制与统计 <a class="header-anchor" href="#字数限制与统计" aria-label="Permalink to &quot;字数限制与统计&quot;">​</a></h4><p>通过<code>maxLength</code>属性限制输入字符数，搭配<code>showWordLimit</code>显示字数统计。</p><blockquote><p><strong>注意</strong>：当输入内容超出字数限制时，系统不会自动截断，真实字数会以红色标示，且无法发送。</p></blockquote>',5)),n(y,{mode:"multiple",showWordLimit:!0,maxLength:20,defaultValue:"测试超出字数限制，当前已经超过了字数限制。"}),t[17]||(t[17]=d('<div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">tr-sender</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> mode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;multiple&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">showWordLimit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">maxLength</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">20</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> defaultValue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;测试超出字数限制，当前已经超过了字数限制。&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/&gt;</span></span></code></pre></div><h4 id="自动调整高度" tabindex="-1">自动调整高度 <a class="header-anchor" href="#自动调整高度" aria-label="Permalink to &quot;自动调整高度&quot;">​</a></h4><p>通过<code>autoSize</code>属性可以设置输入框是否自动调整高度。当设置为<code>true</code>时，输入框会根据内容自动调整高度，适用于需要动态适应内容长度的场景。</p><p><strong>注意</strong>：只对 mode=&quot;multiple&quot; 有效。</p><blockquote><p>可传入对象，如{ minRows: 2, maxRows: 3 }。</p></blockquote>',5)),k(n(e(C),null,null,512),[[E,i.value]]),n(p,null,{default:l(()=>[n(e(g),{title:"自动调整高度",description:"Sender 组件支持自动调整高度。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[1]||(t[1]=()=>{i.value=!1}),vueCode:e(N)},u({_:2},[S.value?{name:"vue",fn:l(()=>[n(e(S))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[18]||(t[18]=s("h4",{id:"可清空输入",tabindex:"-1"},[r("可清空输入 "),s("a",{class:"header-anchor",href:"#可清空输入","aria-label":'Permalink to "可清空输入"'},"​")],-1)),t[19]||(t[19]=s("p",null,[r("通过"),s("code",null,"clearable"),r("属性添加清空按钮，方便用户快速清除输入内容。")],-1)),n(y,{clearable:!0}),t[20]||(t[20]=d('<div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">tr-sender</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">clearable</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div><h3 id="高级功能" tabindex="-1">高级功能 <a class="header-anchor" href="#高级功能" aria-label="Permalink to &quot;高级功能&quot;">​</a></h3><h4 id="自定义按钮" tabindex="-1">自定义按钮 <a class="header-anchor" href="#自定义按钮" aria-label="Permalink to &quot;自定义按钮&quot;">​</a></h4><p>Sender 组件支持在多行模式下灵活定制底部区域。通过 <code>footer-left</code> 和 <code>footer-right</code> 插槽，您可以在保留现有功能的同时添加自定义内容。</p><ul><li><code>footer-left</code>: 在字数限制左侧添加自定义内容</li><li><code>footer-right</code>: 在操作按钮左侧添加自定义内容</li><li><code>footer</code>: 完全自定义底部区域（会覆盖默认内容，仅用于向后兼容）</li></ul>',5)),k(n(e(C),null,null,512),[[E,i.value]]),n(p,null,{default:l(()=>[n(e(g),{title:"自定义按钮",description:"Sender 组件支持在多行模式下灵活定制底部区域。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[2]||(t[2]=()=>{i.value=!1}),vueCode:e(z)},u({_:2},[x.value?{name:"vue",fn:l(()=>[n(e(x))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[21]||(t[21]=d('<p>注意：<code>footer</code> 插槽与 <code>footer-left</code>/<code>footer-right</code> 插槽互斥，如果同时使用，将优先显示 <code>footer-left</code>/<code>footer-right</code> 插槽。</p><h4 id="语音输入" tabindex="-1">语音输入 <a class="header-anchor" href="#语音输入" aria-label="Permalink to &quot;语音输入&quot;">​</a></h4><p>启用<code>allowSpeech</code>支持语音输入功能，用户可以通过语音录入文本。</p><ul><li><p>混合模式：用户可以先用键盘输入部分内容，然后通过语音继续补充，自动停止录音。</p></li><li><p>连续语音输入：用户可以连续录入语音，系统会自动将语音转换为文本，点击按钮手动停止录音。</p></li></ul>',4)),k(n(e(C),null,null,512),[[E,i.value]]),n(p,null,{default:l(()=>[n(e(g),{title:"语音输入",description:"可以使用 speech 属性进行配置",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[3]||(t[3]=()=>{i.value=!1}),vueCode:e(L)},u({_:2},[f.value?{name:"vue",fn:l(()=>[n(e(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[22]||(t[22]=s("h4",{id:"自定义语音输入",tabindex:"-1"},[r("自定义语音输入 "),s("a",{class:"header-anchor",href:"#自定义语音输入","aria-label":'Permalink to "自定义语音输入"'},"​")],-1)),t[23]||(t[23]=s("p",null,"Sender 组件支持自定义语音输入服务，可以集成百度、阿里云、Azure 等第三方语音识别服务。",-1)),t[24]||(t[24]=s("p",null,[s("strong",null,"基本案例")],-1)),k(n(e(C),null,null,512),[[E,i.value]]),n(p,null,{default:l(()=>[n(e(g),{title:"自定义语音识别",description:"模拟语音识别的完整示例，实际项目中可参考 speechHandlers.ts 接入真实的语音识别服务",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%22CustomSpeech.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fsender%2FCustomSpeech.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20style%3D%5C%22display%3A%20flex%3B%20flex-direction%3A%20column%3B%20gap%3A%2020px%5C%22%3E%5Cn%20%20%20%20%3C!--%20%E7%8A%B6%E6%80%81%E6%98%BE%E7%A4%BA%20--%3E%5Cn%20%20%20%20%3Cdiv%5Cn%20%20%20%20%20%20v-if%3D%5C%22speechStatus%5C%22%5Cn%20%20%20%20%20%20style%3D%5C%22padding%3A%2012px%3B%20background%3A%20%23e8f4fd%3B%20border-radius%3A%206px%3B%20border-left%3A%204px%20solid%20%231890ff%5C%22%5Cn%20%20%20%20%3E%5Cn%20%20%20%20%20%20%3Cdiv%20style%3D%5C%22font-weight%3A%20500%3B%20color%3A%20%231890ff%5C%22%3E%7B%7B%20speechStatus%20%7D%7D%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3Cdiv%20v-if%3D%5C%22interimResult%5C%22%20style%3D%5C%22margin-top%3A%208px%3B%20color%3A%20%23666%3B%20font-style%3A%20italic%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%E5%AE%9E%E6%97%B6%E8%AF%86%E5%88%AB%3A%20%7B%7B%20interimResult%20%7D%7D%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3C!--%20%E8%BE%93%E5%85%A5%E7%BB%84%E4%BB%B6%20--%3E%5Cn%20%20%20%20%3Cdiv%3E%5Cn%20%20%20%20%20%20%3Ch4%20style%3D%5C%22margin%3A%2024px%200%5C%22%3E%E6%A8%A1%E6%8B%9F%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E6%BC%94%E7%A4%BA%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20%20%20v-model%3D%5C%22inputText%5C%22%5Cn%20%20%20%20%20%20%20%20mode%3D%5C%22single%5C%22%5Cn%20%20%20%20%20%20%20%20%3AallowSpeech%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aspeech%3D%5C%22speechConfig%5C%22%5Cn%20%20%20%20%20%20%20%20placeholder%3D%5C%22%E7%82%B9%E5%87%BB%E9%BA%A6%E5%85%8B%E9%A3%8E%E6%8C%89%E9%92%AE%E5%BC%80%E5%A7%8B%E8%AF%AD%E9%9F%B3%E8%BE%93%E5%85%A5...%5C%22%5Cn%20%20%20%20%20%20%20%20%40speech-start%3D%5C%22handleSpeechStart%5C%22%5Cn%20%20%20%20%20%20%20%20%40speech-interim%3D%5C%22handleSpeechInterim%5C%22%5Cn%20%20%20%20%20%20%20%20%40speech-final%3D%5C%22handleSpeechFinal%5C%22%5Cn%20%20%20%20%20%20%20%20%40speech-end%3D%5C%22handleSpeechEnd%5C%22%5Cn%20%20%20%20%20%20%20%20%40speech-error%3D%5C%22handleSpeechError%5C%22%5Cn%20%20%20%20%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3C!--%20%E7%BB%93%E6%9E%9C%E5%B1%95%E7%A4%BA%20--%3E%5Cn%20%20%20%20%3Cdiv%20v-if%3D%5C%22results.length%20%3E%200%5C%22%20style%3D%5C%22padding%3A%2016px%3B%20background%3A%20%23f9f9f9%3B%20border-radius%3A%208px%5C%22%3E%5Cn%20%20%20%20%20%20%3Ch4%20style%3D%5C%22margin%3A%200%200%2012px%200%5C%22%3E%E8%AF%86%E5%88%AB%E5%8E%86%E5%8F%B2%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%3Cdiv%20style%3D%5C%22max-height%3A%20200px%3B%20overflow-y%3A%20auto%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%5Cn%20%20%20%20%20%20%20%20%20%20v-for%3D%5C%22(result%2C%20index)%20in%20results%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Akey%3D%5C%22index%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20style%3D%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%208px%3B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20margin-bottom%3A%208px%3B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20background%3A%20white%3B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20border-radius%3A%204px%3B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20border-left%3A%203px%20solid%20%2352c41a%3B%5Cn%20%20%20%20%20%20%20%20%20%20%5C%22%5Cn%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cdiv%20style%3D%5C%22font-size%3A%2012px%3B%20color%3A%20%23999%3B%20margin-bottom%3A%204px%5C%22%3E%7B%7B%20result.timestamp%20%7D%7D%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cdiv%3E%7B%7B%20result.text%20%7D%7D%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3C!--%20%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E%20--%3E%5Cn%20%20%20%20%3Cdiv%20style%3D%5C%22padding%3A%2016px%3B%20background%3A%20%23fffbe6%3B%20border-radius%3A%208px%3B%20border-left%3A%204px%20solid%20%23faad14%5C%22%3E%5Cn%20%20%20%20%20%20%3Ch4%20style%3D%5C%22margin%3A%200%200%208px%200%3B%20color%3A%20%23fa8c16%5C%22%3E%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%3Cul%20style%3D%5C%22margin%3A%200%3B%20padding-left%3A%2020px%3B%20color%3A%20%23666%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cli%3E%E6%AD%A4%E7%A4%BA%E4%BE%8B%E4%BD%BF%E7%94%A8%E6%A8%A1%E6%8B%9F%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%EF%BC%8C%E6%97%A0%E9%9C%80%E7%9C%9F%E5%AE%9E%20API%20%E9%85%8D%E7%BD%AE%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%3Cli%3E%E7%82%B9%E5%87%BB%E9%BA%A6%E5%85%8B%E9%A3%8E%E6%8C%89%E9%92%AE%E5%90%8E%E4%BC%9A%E6%A8%A1%E6%8B%9F%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E8%BF%87%E7%A8%8B%EF%BC%8C%E5%B1%95%E7%A4%BA%E4%B8%AD%E9%97%B4%E7%BB%93%E6%9E%9C%E5%92%8C%E6%9C%80%E7%BB%88%E7%BB%93%E6%9E%9C%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%3Cli%3E%E5%A6%82%E9%9C%80%E6%8E%A5%E5%85%A5%E7%9C%9F%E5%AE%9E%E7%9A%84%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E6%9C%8D%E5%8A%A1%EF%BC%88%E9%98%BF%E9%87%8C%E4%BA%91%E7%AD%89%EF%BC%89%EF%BC%8C%E8%AF%B7%E5%8F%82%E8%80%83%20%3Ccode%3EspeechHandlers.ts%3C%2Fcode%3E%20%E4%B8%AD%E7%9A%84%E5%AE%9E%E7%8E%B0%E7%A4%BA%E4%BE%8B%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%3Cli%3E%E6%94%AF%E6%8C%81%E8%87%AA%E5%AE%9A%E4%B9%89%E8%AF%AD%E9%9F%B3%E5%A4%84%E7%90%86%E5%99%A8%EF%BC%8C%E5%AE%9E%E7%8E%B0%E4%BB%BB%E6%84%8F%E7%AC%AC%E4%B8%89%E6%96%B9%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E6%9C%8D%E5%8A%A1%E7%9A%84%E9%9B%86%E6%88%90%3C%2Fli%3E%5Cn%20%20%20%20%20%20%3C%2Ful%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20AliyunSpeechHandler%20%7D%20from%20'.%2FspeechHandlers'%5Cn%5Cn%2F%2F%20%E7%BB%84%E4%BB%B6%E7%8A%B6%E6%80%81%5Cnconst%20inputText%20%3D%20ref('')%5Cnconst%20speechStatus%20%3D%20ref('')%5Cnconst%20interimResult%20%3D%20ref('')%5Cnconst%20results%20%3D%20ref%3CArray%3C%7B%20text%3A%20string%3B%20timestamp%3A%20string%20%7D%3E%3E(%5B%5D)%5Cn%5Cn%2F%2F%20%E8%AF%AD%E9%9F%B3%E9%85%8D%E7%BD%AE%20-%20%E4%BD%BF%E7%94%A8%E6%A8%A1%E6%8B%9F%E5%A4%84%E7%90%86%E5%99%A8%5Cnconst%20speechConfig%20%3D%20%7B%5Cn%20%20customHandler%3A%20new%20AliyunSpeechHandler()%2C%5Cn%20%20interimResults%3A%20true%2C%5Cn%7D%5Cn%5Cn%2F%2F%20%E4%BA%8B%E4%BB%B6%E5%A4%84%E7%90%86%5Cnconst%20handleSpeechStart%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20speechStatus.value%20%3D%20'%F0%9F%8E%A4%20%E6%AD%A3%E5%9C%A8%E5%BD%95%E9%9F%B3...'%5Cn%20%20interimResult.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20handleSpeechInterim%20%3D%20(transcript%3A%20string)%20%3D%3E%20%7B%5Cn%20%20interimResult.value%20%3D%20transcript%5Cn%7D%5Cn%5Cnconst%20handleSpeechFinal%20%3D%20(transcript%3A%20string)%20%3D%3E%20%7B%5Cn%20%20speechStatus.value%20%3D%20'%E2%9C%85%20%E8%AF%86%E5%88%AB%E5%AE%8C%E6%88%90'%5Cn%20%20interimResult.value%20%3D%20''%5Cn%5Cn%20%20%2F%2F%20%E8%AE%B0%E5%BD%95%E8%AF%86%E5%88%AB%E7%BB%93%E6%9E%9C%5Cn%20%20results.value.unshift(%7B%5Cn%20%20%20%20text%3A%20transcript%2C%5Cn%20%20%20%20timestamp%3A%20new%20Date().toLocaleTimeString()%2C%5Cn%20%20%7D)%5Cn%5Cn%20%20%2F%2F%20%E9%99%90%E5%88%B6%E5%8E%86%E5%8F%B2%E8%AE%B0%E5%BD%95%E6%95%B0%E9%87%8F%5Cn%20%20if%20(results.value.length%20%3E%2010)%20%7B%5Cn%20%20%20%20results.value%20%3D%20results.value.slice(0%2C%2010)%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20handleSpeechEnd%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20speechStatus.value%20%3D%20''%5Cn%20%20interimResult.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20handleSpeechError%20%3D%20(error%3A%20Error)%20%3D%3E%20%7B%5Cn%20%20speechStatus.value%20%3D%20''%5Cn%20%20interimResult.value%20%3D%20''%5Cn%20%20console.error('%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E9%94%99%E8%AF%AF%3A'%2C%20error)%5Cn%7D%5Cn%5Cnconst%20handleSubmit%20%3D%20(text%3A%20string)%20%3D%3E%20%7B%5Cn%20%20console.log('%E6%8F%90%E4%BA%A4%E5%86%85%E5%AE%B9%3A'%2C%20text)%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%22%7D%2C%22speechHandlers.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fsender%2FspeechHandlers.ts%22%2C%22code%22%3A%22import%20Recorder%20from%20'recorder-core'%5Cnimport%20'recorder-core%2Fsrc%2Fengine%2Fwav'%5Cnimport%20type%20%7B%20SpeechHandler%2C%20SpeechCallbacks%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cn%2F**%5Cn%20*%20recorder-core%20%E7%9A%84%E9%85%8D%E7%BD%AE%E9%80%89%E9%A1%B9%5Cn%20*%2F%5Cninterface%20RecorderOptions%20%7B%5Cn%20%20type%3A%20'wav'%20%7C%20'mp3'%20%7C%20'pcm'%20%7C%20string%20%2F%2F%20%E6%9C%9F%E6%9C%9B%E7%9A%84%E8%BE%93%E5%87%BA%E6%A0%BC%E5%BC%8F%5Cn%20%20sampleRate%3A%2016000%20%7C%208000%20%7C%20number%20%2F%2F%20%E9%87%87%E6%A0%B7%E7%8E%87%5Cn%20%20bitRate%3A%2016%20%7C%208%20%7C%20number%20%2F%2F%20%E6%AF%94%E7%89%B9%E7%8E%87%5Cn%20%20onProcess%3F%3A%20(buffers%3A%20Float32Array%5B%5D%2C%20powerLevel%3A%20number%2C%20duration%3A%20number%2C%20sampleRate%3A%20number)%20%3D%3E%20void%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20recorder-core%20%E5%AE%9E%E4%BE%8B%E7%9A%84%E6%8E%A5%E5%8F%A3%5Cn%20*%2F%5Cninterface%20IRecorder%20%7B%5Cn%20%20open(success%3A%20()%20%3D%3E%20void%2C%20fail%3A%20(msg%3A%20string%2C%20isUserNotAllow%3A%20boolean)%20%3D%3E%20void)%3A%20void%5Cn%20%20start()%3A%20void%5Cn%20%20stop(success%3A%20(blob%3A%20Blob%2C%20duration%3A%20number)%20%3D%3E%20void%2C%20fail%3A%20(msg%3A%20string)%20%3D%3E%20void)%3A%20void%5Cn%20%20close()%3A%20void%5Cn%20%20support()%3A%20boolean%5Cn%7D%5Cn%5Cninterface%20RecorderStatic%20%7B%5Cn%20%20(options%3A%20RecorderOptions)%3A%20IRecorder%5Cn%7D%5Cn%5Cnconst%20TypedRecorder%20%3D%20Recorder%20as%20RecorderStatic%5Cn%5Cn%2F**%5Cn%20*%20%E7%AE%80%E5%8D%95%E7%9A%84%E6%A8%A1%E6%8B%9F%E8%AF%AD%E9%9F%B3%E5%A4%84%E7%90%86%E5%99%A8%5Cn%20*%20%E7%94%A8%E4%BA%8E%E6%B5%8B%E8%AF%95%E5%92%8C%E6%BC%94%E7%A4%BA%5Cn%20*%2F%5Cnexport%20class%20MockSpeechHandler%20implements%20SpeechHandler%20%7B%5Cn%20%20private%20timer%3F%3A%20ReturnType%3Ctypeof%20setInterval%3E%5Cn%5Cn%20%20start(callbacks%3A%20SpeechCallbacks)%3A%20void%20%7B%5Cn%20%20%20%20%2F%2F%20%E7%AB%8B%E5%8D%B3%E8%A7%A6%E5%8F%91%E5%BC%80%E5%A7%8B%5Cn%20%20%20%20callbacks.onStart()%5Cn%5Cn%20%20%20%20%2F%2F%20%E6%A8%A1%E6%8B%9F%E8%AF%86%E5%88%AB%E8%BF%87%E7%A8%8B%5Cn%20%20%20%20let%20step%20%3D%200%5Cn%20%20%20%20const%20steps%20%3D%20%5B'%E6%AD%A3%E5%9C%A8'%2C%20'%E6%AD%A3%E5%9C%A8%E8%AF%86%E5%88%AB'%2C%20'%E6%AD%A3%E5%9C%A8%E8%AF%86%E5%88%AB%E8%AF%AD%E9%9F%B3'%2C%20'%E6%AD%A3%E5%9C%A8%E8%AF%86%E5%88%AB%E8%AF%AD%E9%9F%B3%E5%86%85%E5%AE%B9'%5D%5Cn%5Cn%20%20%20%20this.timer%20%3D%20setInterval(()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20if%20(step%20%3C%20steps.length)%20%7B%5Cn%20%20%20%20%20%20%20%20callbacks.onInterim(steps%5Bstep%5D)%5Cn%20%20%20%20%20%20%20%20step%2B%2B%5Cn%20%20%20%20%20%20%7D%20else%20%7B%5Cn%20%20%20%20%20%20%20%20%2F%2F%20%E5%AE%8C%E6%88%90%E8%AF%86%E5%88%AB%5Cn%20%20%20%20%20%20%20%20const%20finalResult%20%3D%20'%E8%BF%99%E6%98%AF%E4%B8%80%E4%B8%AA%E6%A8%A1%E6%8B%9F%E7%9A%84%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E7%BB%93%E6%9E%9C'%5Cn%20%20%20%20%20%20%20%20callbacks.onFinal(finalResult)%5Cn%5Cn%20%20%20%20%20%20%20%20callbacks.onEnd()%5Cn%5Cn%20%20%20%20%20%20%20%20%2F%2F%20%E6%B8%85%E7%90%86%E5%AE%9A%E6%97%B6%E5%99%A8%E8%B5%84%E6%BA%90%5Cn%20%20%20%20%20%20%20%20this.stop()%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%2C%20500)%5Cn%20%20%7D%5Cn%5Cn%20%20stop()%3A%20void%20%7B%5Cn%20%20%20%20if%20(this.timer)%20%7B%5Cn%20%20%20%20%20%20clearInterval(this.timer)%5Cn%20%20%20%20%20%20this.timer%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20isSupported()%3A%20boolean%20%7B%5Cn%20%20%20%20return%20true%20%2F%2F%20%E6%A8%A1%E6%8B%9F%E5%A4%84%E7%90%86%E5%99%A8%E6%80%BB%E6%98%AF%E6%94%AF%E6%8C%81%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20%E9%98%BF%E9%87%8C%E4%BA%91%E4%B8%80%E5%8F%A5%E8%AF%9D%E8%AF%86%E5%88%AB%E5%A4%84%E7%90%86%E5%99%A8%5Cn%20*%20%E4%BD%BF%E7%94%A8%E9%98%BF%E9%87%8C%E4%BA%91%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%20REST%20API%5Cn%20*%5Cn%20*%20%E9%9C%80%E8%A6%81%E5%A1%AB%E5%85%A5%E8%87%AA%E5%B7%B1%E7%9A%84%20appKey%20%E5%92%8C%20token%5Cn%20*%2F%5Cnexport%20class%20AliyunSpeechHandler%20implements%20SpeechHandler%20%7B%5Cn%20%20private%20recorder%3F%3A%20IRecorder%5Cn%20%20private%20callbacks%3F%3A%20SpeechCallbacks%5Cn%5Cn%20%20private%20closeRecorder()%3A%20void%20%7B%5Cn%20%20%20%20if%20(this.recorder)%20%7B%5Cn%20%20%20%20%20%20this.recorder.close()%5Cn%20%20%20%20%20%20this.recorder%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20private%20async%20processWithAliyunAPI(audioBlob%3A%20Blob)%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20if%20(!this.callbacks)%20return%5Cn%5Cn%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20const%20baseUrl%20%3D%20'https%3A%2F%2Fagent.opentiny.design%2Fapi%2Fasr%2Frecognize'%5Cn%5Cn%20%20%20%20%20%20const%20formData%20%3D%20new%20FormData()%5Cn%20%20%20%20%20%20formData.append('audio'%2C%20audioBlob)%5Cn%5Cn%20%20%20%20%20%20const%20response%20%3D%20await%20fetch(%60%24%7BbaseUrl%7D%60%2C%20%7B%5Cn%20%20%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20%20%20body%3A%20formData%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%5Cn%20%20%20%20%20%20if%20(!response.ok)%20%7B%5Cn%20%20%20%20%20%20%20%20const%20errorBody%20%3D%20await%20response.text()%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error(%60HTTP%20%E9%94%99%E8%AF%AF!%20%E7%8A%B6%E6%80%81%E7%A0%81%3A%20%24%7Bresponse.status%7D%2C%20%E5%93%8D%E5%BA%94%3A%20%24%7BerrorBody%7D%60)%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20const%20result%20%3D%20await%20response.json()%5Cn%5Cn%20%20%20%20%20%20if%20(result.success%20%26%26%20result.data%3F.result)%20%7B%5Cn%20%20%20%20%20%20%20%20const%20transcript%20%3D%20result.data.result%5Cn%20%20%20%20%20%20%20%20this.callbacks.onFinal(transcript)%5Cn%20%20%20%20%20%20%20%20this.callbacks.onEnd(transcript)%5Cn%20%20%20%20%20%20%7D%20else%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error(result.message%20%7C%7C%20result.data%3F.message%20%7C%7C%20'%E8%AF%86%E5%88%AB%E5%A4%B1%E8%B4%A5')%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20this.callbacks.onError(error%20instanceof%20Error%20%3F%20error%20%3A%20new%20Error('%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E5%A4%B1%E8%B4%A5'))%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20async%20start(callbacks%3A%20SpeechCallbacks)%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20this.callbacks%20%3D%20callbacks%5Cn%5Cn%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20this.recorder%20%3D%20TypedRecorder(%7B%5Cn%20%20%20%20%20%20%20%20type%3A%20'wav'%2C%20%2F%2F%20%E4%BD%BF%E7%94%A8%20WAV%20%E6%A0%BC%E5%BC%8F%EF%BC%8C%E5%8C%85%E5%90%AB%E9%9F%B3%E9%A2%91%E5%A4%B4%E4%BF%A1%E6%81%AF%5Cn%20%20%20%20%20%20%20%20sampleRate%3A%2016000%2C%5Cn%20%20%20%20%20%20%20%20bitRate%3A%2016%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%5Cn%20%20%20%20%20%20this.recorder.open(%5Cn%20%20%20%20%20%20%20%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20this.recorder%3F.start()%5Cn%20%20%20%20%20%20%20%20%20%20callbacks.onStart()%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20(msg%3A%20string%2C%20isUserNotAllow%3A%20boolean)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20const%20errorMsg%20%3D%20isUserNotAllow%20%3F%20%60%E7%94%A8%E6%88%B7%E6%8B%92%E7%BB%9D%E4%BA%86%E9%BA%A6%E5%85%8B%E9%A3%8E%E6%9D%83%E9%99%90%3A%20%24%7Bmsg%7D%60%20%3A%20%60%E6%97%A0%E6%B3%95%E6%89%93%E5%BC%80%E9%BA%A6%E5%85%8B%E9%A3%8E%3A%20%24%7Bmsg%7D%60%5Cn%20%20%20%20%20%20%20%20%20%20callbacks.onError(new%20Error(errorMsg))%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20)%5Cn%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20callbacks.onError(error%20instanceof%20Error%20%3F%20error%20%3A%20new%20Error('%E9%98%BF%E9%87%8C%E4%BA%91%E8%AF%AD%E9%9F%B3%E6%9C%8D%E5%8A%A1%E5%90%AF%E5%8A%A8%E5%A4%B1%E8%B4%A5'))%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20async%20stop()%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20if%20(!this.recorder)%20%7B%5Cn%20%20%20%20%20%20return%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20this.recorder.stop(%5Cn%20%20%20%20%20%20(blob%3A%20Blob%2C%20duration%3A%20number)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20console.log(%60%E5%BD%95%E9%9F%B3%E6%88%90%E5%8A%9F%EF%BC%8C%E6%A0%BC%E5%BC%8F%3A%20%24%7Bblob.type%7D%EF%BC%8C%E6%97%B6%E9%95%BF%3A%20%24%7Bduration%7Dms%60%2C%20blob)%5Cn%20%20%20%20%20%20%20%20this.processWithAliyunAPI(blob)%5Cn%20%20%20%20%20%20%20%20this.closeRecorder()%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20(msg%3A%20string)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20this.callbacks%3F.onError(new%20Error(%60%E5%BD%95%E9%9F%B3%E5%A4%B1%E8%B4%A5%3A%20%24%7Bmsg%7D%60))%5Cn%20%20%20%20%20%20%20%20this.closeRecorder()%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20)%5Cn%20%20%7D%5Cn%5Cn%20%20isSupported()%3A%20boolean%20%7B%5Cn%20%20%20%20return%20true%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20%E9%98%BF%E9%87%8C%E4%BA%91%E5%AE%9E%E6%97%B6%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E5%A4%84%E7%90%86%E5%99%A8%5Cn%20*%20%E4%BD%BF%E7%94%A8%20WebSocket%20%E8%BF%9B%E8%A1%8C%E6%B5%81%E5%BC%8F%E8%AF%86%E5%88%AB%5Cn%20*%5Cn%20*%20%E9%9C%80%E8%A6%81%E5%A1%AB%E5%85%A5%E8%87%AA%E5%B7%B1%E7%9A%84%20appKey%20%E5%92%8C%20token%5Cn%20*%2F%5Cnexport%20class%20AliyunRealtimeSpeechHandler%20implements%20SpeechHandler%20%7B%5Cn%20%20private%20ws%3F%3A%20WebSocket%5Cn%20%20private%20audioContext%3F%3A%20AudioContext%5Cn%20%20private%20scriptProcessor%3F%3A%20ScriptProcessorNode%5Cn%20%20private%20audioStream%3F%3A%20MediaStream%5Cn%20%20private%20callbacks%3F%3A%20SpeechCallbacks%5Cn%20%20private%20appKey%3A%20string%20%3D%20'your_app_key'%5Cn%20%20private%20token%3A%20string%20%3D%20'your_token'%5Cn%5Cn%20%20private%20generateUUID()%3A%20string%20%7B%5Cn%20%20%20%20%2F%2F%20%E4%BD%BF%E7%94%A8%20crypto.randomUUID()%20%E7%94%9F%E6%88%90%E6%A0%87%E5%87%86%20UUID%EF%BC%8C%E7%84%B6%E5%90%8E%E7%A7%BB%E9%99%A4%E8%BF%9E%E5%AD%97%E7%AC%A6%E5%BE%97%E5%88%B032%E4%BD%8D%E5%AD%97%E7%AC%A6%E4%B8%B2%5Cn%20%20%20%20return%20crypto.randomUUID().replace(%2F-%2Fg%2C%20'')%5Cn%20%20%7D%5Cn%5Cn%20%20isSupported()%3A%20boolean%20%7B%5Cn%20%20%20%20return%20true%5Cn%20%20%7D%5Cn%5Cn%20%20async%20start(callbacks%3A%20SpeechCallbacks)%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20if%20(!this.isSupported())%20%7B%5Cn%20%20%20%20%20%20callbacks.onError(new%20Error('%E5%BD%93%E5%89%8D%E6%B5%8F%E8%A7%88%E5%99%A8%E4%B8%8D%E6%94%AF%E6%8C%81%E5%AE%9E%E6%97%B6%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E6%89%80%E9%9C%80%E7%9A%84%E5%8A%9F%E8%83%BD'))%5Cn%20%20%20%20%20%20return%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20this.callbacks%20%3D%20callbacks%5Cn%20%20%20%20this.setupWebSocket()%5Cn%20%20%7D%5Cn%5Cn%20%20private%20setupWebSocket()%3A%20void%20%7B%5Cn%20%20%20%20const%20scheme%20%3D%20window.location.protocol%20%3D%3D%3D%20'https%3A'%20%3F%20'wss'%20%3A%20'ws'%5Cn%20%20%20%20const%20socketUrl%20%3D%20%60%24%7Bscheme%7D%3A%2F%2F%24%7Bwindow.location.host%7D%2Fapi%2Faliyun%2Fws%3Ftoken%3D%24%7Bthis.token%7D%60%5Cn%5Cn%20%20%20%20this.ws%20%3D%20new%20WebSocket(socketUrl)%5Cn%5Cn%20%20%20%20this.ws.onopen%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%2F%2F%20%E8%BF%9E%E6%8E%A5%E6%88%90%E5%8A%9F%E5%90%8E%EF%BC%8C%E5%8F%91%E9%80%81%E5%BC%80%E5%A7%8B%E8%AF%86%E5%88%AB%E6%8C%87%E4%BB%A4%5Cn%20%20%20%20%20%20const%20startMessage%20%3D%20%7B%5Cn%20%20%20%20%20%20%20%20header%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20appkey%3A%20this.appKey%2C%5Cn%20%20%20%20%20%20%20%20%20%20namespace%3A%20'SpeechTranscriber'%2C%5Cn%20%20%20%20%20%20%20%20%20%20name%3A%20'StartTranscription'%2C%5Cn%20%20%20%20%20%20%20%20%20%20task_id%3A%20this.generateUUID()%2C%5Cn%20%20%20%20%20%20%20%20%20%20message_id%3A%20this.generateUUID()%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20payload%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20format%3A%20'pcm'%2C%5Cn%20%20%20%20%20%20%20%20%20%20sample_rate%3A%2016000%2C%5Cn%20%20%20%20%20%20%20%20%20%20enable_intermediate_result%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20%20%20enable_punctuation_prediction%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20%20%20enable_inverse_text_normalization%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20this.ws%3F.send(JSON.stringify(startMessage))%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20this.ws.onmessage%20%3D%20(event)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20const%20message%20%3D%20JSON.parse(event.data)%5Cn%5Cn%20%20%20%20%20%20switch%20(message.header.name)%20%7B%5Cn%20%20%20%20%20%20%20%20case%20'TranscriptionStarted'%3A%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E6%9C%8D%E5%8A%A1%E7%AB%AF%E5%87%86%E5%A4%87%E5%B0%B1%E7%BB%AA%EF%BC%8C%E5%BC%80%E5%A7%8B%E6%8D%95%E6%8D%89%E5%92%8C%E5%8F%91%E9%80%81%E9%9F%B3%E9%A2%91%5Cn%20%20%20%20%20%20%20%20%20%20this.callbacks%3F.onStart()%5Cn%20%20%20%20%20%20%20%20%20%20this.startAudioProcessing()%5Cn%20%20%20%20%20%20%20%20%20%20break%5Cn%20%20%20%20%20%20%20%20case%20'TranscriptionResultChanged'%3A%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E4%B8%AD%E9%97%B4%E8%AF%86%E5%88%AB%E7%BB%93%E6%9E%9C%5Cn%20%20%20%20%20%20%20%20%20%20if%20(message.payload.result)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20this.callbacks%3F.onInterim(message.payload.result)%5Cn%20%20%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%20%20%20%20break%5Cn%20%20%20%20%20%20%20%20case%20'SentenceEnd'%3A%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E5%8F%A5%E5%AD%90%E7%BB%93%E6%9D%9F%EF%BC%8C%E6%9C%80%E7%BB%88%E7%BB%93%E6%9E%9C%5Cn%20%20%20%20%20%20%20%20%20%20if%20(message.payload.result)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20this.callbacks%3F.onFinal(message.payload.result)%5Cn%20%20%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%20%20%20%20break%5Cn%20%20%20%20%20%20%20%20case%20'TranscriptionCompleted'%3A%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E8%AF%86%E5%88%AB%E5%AE%8C%E6%88%90%5Cn%20%20%20%20%20%20%20%20%20%20this.callbacks%3F.onEnd()%5Cn%20%20%20%20%20%20%20%20%20%20break%5Cn%20%20%20%20%20%20%20%20case%20'TaskFailed'%3A%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E4%BB%BB%E5%8A%A1%E5%A4%B1%E8%B4%A5%5Cn%20%20%20%20%20%20%20%20%20%20this.callbacks%3F.onError(new%20Error(%60%E4%BB%BB%E5%8A%A1%E5%A4%B1%E8%B4%A5%3A%20%24%7Bmessage.payload.status_text%20%7C%7C%20'%E6%9C%AA%E7%9F%A5%E9%94%99%E8%AF%AF'%7D%60))%5Cn%20%20%20%20%20%20%20%20%20%20this.cleanup()%5Cn%20%20%20%20%20%20%20%20%20%20break%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20this.ws.onerror%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20this.callbacks%3F.onError(new%20Error('WebSocket%20%E8%BF%9E%E6%8E%A5%E5%8F%91%E7%94%9F%E9%94%99%E8%AF%AF'))%5Cn%20%20%20%20%20%20this.cleanup()%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20this.ws.onclose%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20this.cleanup()%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20private%20async%20startAudioProcessing()%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20%2F%2F%20%E8%8E%B7%E5%8F%96%E9%9F%B3%E9%A2%91%E6%B5%81%5Cn%20%20%20%20%20%20this.audioStream%20%3D%20await%20navigator.mediaDevices.getUserMedia(%7B%20audio%3A%20true%20%7D)%5Cn%5Cn%20%20%20%20%20%20%2F%2F%20%E5%88%9B%E5%BB%BA%E9%9F%B3%E9%A2%91%E4%B8%8A%E4%B8%8B%E6%96%87%5Cn%20%20%20%20%20%20const%20AudioContextClass%20%3D%5Cn%20%20%20%20%20%20%20%20window.AudioContext%20%7C%7C%5Cn%20%20%20%20%20%20%20%20(window%20as%20typeof%20window%20%26%20%7B%20webkitAudioContext%3F%3A%20typeof%20AudioContext%20%7D).webkitAudioContext%5Cn%20%20%20%20%20%20if%20(!AudioContextClass)%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error('AudioContext%20not%20supported')%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20this.audioContext%20%3D%20new%20AudioContextClass(%7B%20sampleRate%3A%2016000%20%7D)%5Cn%5Cn%20%20%20%20%20%20%2F%2F%20%E5%88%9B%E5%BB%BA%E8%84%9A%E6%9C%AC%E5%A4%84%E7%90%86%E5%99%A8%5Cn%20%20%20%20%20%20this.scriptProcessor%20%3D%20this.audioContext.createScriptProcessor(2048%2C%201%2C%201)%5Cn%5Cn%20%20%20%20%20%20this.scriptProcessor.onaudioprocess%20%3D%20(event)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20const%20inputData%20%3D%20event.inputBuffer.getChannelData(0)%5Cn%20%20%20%20%20%20%20%20%2F%2F%20%E8%BD%AC%E6%8D%A2%E4%B8%BA16-bit%20PCM%E6%A0%BC%E5%BC%8F%5Cn%20%20%20%20%20%20%20%20const%20pcmData%20%3D%20new%20Int16Array(inputData.length)%5Cn%20%20%20%20%20%20%20%20for%20(let%20i%20%3D%200%3B%20i%20%3C%20inputData.length%3B%20i%2B%2B)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20pcmData%5Bi%5D%20%3D%20Math.max(-1%2C%20Math.min(1%2C%20inputData%5Bi%5D))%20*%200x7fff%5Cn%20%20%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20%20%20if%20(this.ws%3F.readyState%20%3D%3D%3D%20WebSocket.OPEN)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20this.ws.send(pcmData.buffer)%5Cn%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20const%20source%20%3D%20this.audioContext.createMediaStreamSource(this.audioStream)%5Cn%20%20%20%20%20%20source.connect(this.scriptProcessor)%5Cn%20%20%20%20%20%20this.scriptProcessor.connect(this.audioContext.destination)%5Cn%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20this.callbacks%3F.onError(error%20instanceof%20Error%20%3F%20error%20%3A%20new%20Error('%E6%97%A0%E6%B3%95%E5%90%AF%E5%8A%A8%E9%BA%A6%E5%85%8B%E9%A3%8E%E6%88%96%E9%9F%B3%E9%A2%91%E5%A4%84%E7%90%86'))%5Cn%20%20%20%20%20%20this.cleanup()%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20stop()%3A%20void%20%7B%5Cn%20%20%20%20%2F%2F%20%E5%81%9C%E6%AD%A2%E9%9F%B3%E9%A2%91%E6%B5%81%5Cn%20%20%20%20if%20(this.audioStream)%20%7B%5Cn%20%20%20%20%20%20this.audioStream.getTracks().forEach((track)%20%3D%3E%20track.stop())%5Cn%20%20%20%20%20%20this.audioStream%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%2F%2F%20%E6%96%AD%E5%BC%80%E9%9F%B3%E9%A2%91%E5%A4%84%E7%90%86%E5%99%A8%5Cn%20%20%20%20if%20(this.scriptProcessor)%20%7B%5Cn%20%20%20%20%20%20this.scriptProcessor.disconnect()%5Cn%20%20%20%20%20%20this.scriptProcessor%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%2F%2F%20%E5%85%B3%E9%97%AD%E9%9F%B3%E9%A2%91%E4%B8%8A%E4%B8%8B%E6%96%87%5Cn%20%20%20%20if%20(this.audioContext)%20%7B%5Cn%20%20%20%20%20%20this.audioContext.close()%5Cn%20%20%20%20%20%20this.audioContext%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%2F%2F%20%E5%85%B3%E9%97%AD%20WebSocket%20%E8%BF%9E%E6%8E%A5%5Cn%20%20%20%20if%20(this.ws%20%26%26%20this.ws.readyState%20%3D%3D%3D%20WebSocket.OPEN)%20%7B%5Cn%20%20%20%20%20%20this.ws.close()%5Cn%20%20%20%20%7D%5Cn%20%20%20%20this.ws%20%3D%20undefined%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[4]||(t[4]=()=>{i.value=!1}),vueCode:e(V)},u({_:2},[D.value?{name:"vue",fn:l(()=>[n(e(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[25]||(t[25]=d('<p><strong>接入真实服务</strong></p><p>如需接入 阿里云 等真实的语音识别服务，请参考 <code>speechHandlers.ts</code> 中的实现：</p><ul><li><code>AliyunSpeechHandler</code>: 阿里云一句话识别</li><li><code>AliyunRealtimeSpeechHandler</code>: 阿里云实时语音识别（WebSocket）</li></ul><p>这些实现展示了如何：</p><ul><li>处理录音和音频编码</li><li>调用第三方 API</li><li>处理实时流式识别</li><li>错误处理和资源清理</li></ul><h4 id="消息提示" tabindex="-1">消息提示 <a class="header-anchor" href="#消息提示" aria-label="Permalink to &quot;消息提示&quot;">​</a></h4><p>此功能适用于需要在输入框内显示提示信息并引导用户操作的场景，如：</p><ul><li><strong>1. 服务状态提示</strong></li><li><strong>2. 快捷操作链接</strong></li><li><strong>3. 功能引导等</strong></li></ul><p>当使用 <code>decorativeContent</code> 插槽时，输入框会自动被禁用，仅展示插槽内容，无法输入文本或触发发送操作。</p>',9)),k(n(e(C),null,null,512),[[E,i.value]]),n(p,null,{default:l(()=>[n(e(g),{title:"装饰性内容示例",description:"在输入框内显示装饰性内容和可点击链接，可用于服务状态提示、功能引导等场景。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[5]||(t[5]=()=>{i.value=!1}),vueCode:e(G)},u({_:2},[v.value?{name:"vue",fn:l(()=>[n(e(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[26]||(t[26]=d(`<h4 id="文件上传" tabindex="-1">文件上传 <a class="header-anchor" href="#文件上传" aria-label="Permalink to &quot;文件上传&quot;">​</a></h4><p>支持附件上传功能，可通过<code>allowFiles</code>控制。</p><p>结合 <code>buttonGroup</code> 属性，您可以实现更复杂的交互逻辑。例如，通过监听 <code>files-selected</code> 事件返回的文件列表，动态地禁用上传按钮或提交按钮，并更新其 <code>tooltips</code> 提示信息，以引导用户操作。</p><p><strong>自定义 Tooltip 位置</strong></p><p>通过 <code>buttonGroup.file.tooltipPlacement</code> 属性可以自定义文件上传按钮的 tooltip 弹窗位置：</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">tr-sender</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">allowFiles</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">buttonGroup</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    file: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      tooltips: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;点击上传文件&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      tooltipPlacement: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;bottom&#39;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 自定义 tooltip 位置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/&gt;</span></span></code></pre></div><p>支持的位置选项：<code>&#39;top&#39;</code> | <code>&#39;top-start&#39;</code> | <code>&#39;top-end&#39;</code> | <code>&#39;bottom&#39;</code> | <code>&#39;bottom-start&#39;</code> | <code>&#39;bottom-end&#39;</code> | <code>&#39;left&#39;</code> | <code>&#39;left-start&#39;</code> | <code>&#39;left-end&#39;</code> | <code>&#39;right&#39;</code> | <code>&#39;right-start&#39;</code> | <code>&#39;right-end&#39;</code></p><p>默认值为 <code>&#39;top&#39;</code>。</p>`,8)),k(n(e(C),null,null,512),[[E,i.value]]),n(p,null,{default:l(()=>[n(e(g),{title:"文件上传",description:"Sender 组件支持文件上传功能，并可通过 buttonGroup 动态控制按钮状态。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[6]||(t[6]=()=>{i.value=!1}),vueCode:e(X)},u({_:2},[b.value?{name:"vue",fn:l(()=>[n(e(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[27]||(t[27]=s("h4",{id:"模版填充",tabindex:"-1"},[r("模版填充 "),s("a",{class:"header-anchor",href:"#模版填充","aria-label":'Permalink to "模版填充"'},"​")],-1)),t[28]||(t[28]=s("p",null,[r("通过 "),s("code",null,"templateData"),r(" prop 实现模板的动态设置与双向绑定。推荐使用 "),s("code",null,"v-model:templateData"),r(" 的语法糖。")],-1)),t[29]||(t[29]=s("p",null,"该功能加载后，光标会自动聚焦在第一个可编辑的模板字段上，方便用户直接开始编辑。",-1)),t[30]||(t[30]=s("p",null,[s("strong",null,"模板示例")],-1)),k(n(e(C),null,null,512),[[E,i.value]]),n(p,null,{default:l(()=>[n(e(g),{title:"模板填充示例",description:"Sender 组件支持模板填充，展示动态模板切换功能。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[7]||(t[7]=()=>{i.value=!1}),vueCode:e(P)},u({_:2},[B.value?{name:"vue",fn:l(()=>[n(e(B))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[31]||(t[31]=d(`<p><strong>备注</strong><code>templateData</code> prop 接收一个 <code>UserItem[]</code> 类型的数组。 <code>UserItem</code> 的结构为 <code>{ type: &#39;text&#39;, content: string }</code> 或 <code>{ type: &#39;template&#39;, content: string }</code>。 当 <code>type</code> 为 <code>&#39;template&#39;</code> 时，对应的 <code>content</code> 会渲染为一个可编辑的模板字段。</p><h4 id="输入联想" tabindex="-1">输入联想 <a class="header-anchor" href="#输入联想" aria-label="Permalink to &quot;输入联想&quot;">​</a></h4><p>Sender 组件支持输入联想功能，当用户输入时，可以根据提供的 <code>suggestions</code> 列表显示匹配的建议项。此功能有助于提高输入效率和准确性。</p><p><strong>核心特性:</strong></p><ul><li><p><strong>Tab 提示器</strong>: 仅在有联想数据且输入框有内容时显示，提示用户可按 Tab 选择。</p></li><li><p><strong>输入框补全</strong>: 用户输入部分正常显示，联想到的补全部分以半透明灰色文本展示。</p></li><li><p><strong>键盘交互</strong>:</p><ul><li><code>↑</code>/<code>↓</code>: 在联想弹窗中导航。</li><li><code>Tab</code>/<code>Enter</code>: 确认当前高亮的联想项（可通过 <code>activeSuggestionKeys</code> 属性自定义）。</li><li><code>Esc</code>: 关闭联想弹窗。</li></ul></li></ul><blockquote><p><strong>注意</strong>: 输入框内的补全文本特性在匹配到联想项的前置字符时显示，否则不显示。</p></blockquote><p><strong>高亮匹配模式</strong></p><p>Sender 组件支持三种高亮匹配模式，通过 <code>suggestions</code> 属性实现：</p><ol><li><p><strong>自动匹配高亮</strong>（默认）：直接传入字符串数组到 <code>suggestions</code> 属性，组件会根据用户输入自动高亮匹配部分。</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">tr-sender</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">suggestions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;你好世界&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;你好中国&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;你好北京&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div></li><li><p><strong>精确指定高亮</strong>：传入对象数组到 <code>suggestions</code> 属性，通过 <code>content</code> 和 <code>highlights</code> 字段精确指定要高亮的文本片段。</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">tr-sender</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">suggestions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  { content: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;你好世界&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, highlights: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;你好&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  { content: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;你好中国&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, highlights: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;中国&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  { content: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;你好北京&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, highlights: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;你好&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;北京&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div></li><li><p><strong>完全自定义高亮</strong>：传入对象数组到 <code>suggestions</code> 属性，<code>highlights</code> 字段为函数，可完全自定义高亮逻辑。</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">tr-sender</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">suggestions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   content: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;你好世界&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   // 自定义高亮：根据输入内容高亮匹配部分</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">   highlights</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">content</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">input</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     // 简单示例：输入&quot;你&quot;时高亮&quot;你好&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">     if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (input </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">===</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;你&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">       return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">         { text: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;你&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, isMatch: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">         { text: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;好世界&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, isMatch: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">       ]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     }</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">     return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [{ text: content, isMatch: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div></li></ol><blockquote><p><strong>优先级</strong>：完全自定义高亮 &gt; 精确指定高亮 &gt; 自动匹配高亮</p></blockquote>`,10)),k(n(e(C),null,null,512),[[E,i.value]]),n(p,null,{default:l(()=>[n(e(g),{title:"输入联想示例",description:"展示 Sender 组件的输入联想功能。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[8]||(t[8]=()=>{i.value=!1}),vueCode:e(R)},u({_:2},[F.value?{name:"vue",fn:l(()=>[n(e(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[32]||(t[32]=d('<h4 id="自定义提交方式" tabindex="-1">自定义提交方式 <a class="header-anchor" href="#自定义提交方式" aria-label="Permalink to &quot;自定义提交方式&quot;">​</a></h4><p>通过<code>submitType</code>属性控制提交方式，支持多种键盘快捷键组合。</p><ul><li>提交行为说明：</li><li><ul><li>当 submitType 为 enter 时：按 Enter 键提交</li></ul></li><li><ul><li>当 submitType 为 ctrlEnter 时：按 Ctrl+Enter 提交，单独按 Enter 换行</li></ul></li><li><ul><li>当 submitType 为 shiftEnter 时：按 Shift+Enter 提交，单独按 Enter 换行</li></ul></li></ul><p>这些快捷键适用于不同的使用习惯和操作系统，方便用户根据自己的喜好选择提交方式。</p>',4)),n(y,{submitType:"ctrlEnter",mode:"multiple",placeholder:"按Ctrl+Enter提交"}),t[33]||(t[33]=d('<div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">tr-sender</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> submitType</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ctrlEnter&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> mode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;multiple&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> placeholder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;按Ctrl+Enter提交&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div>',1)),n(y,{submitType:"shiftEnter",mode:"multiple",placeholder:"按Shift+Enter提交"}),t[34]||(t[34]=d('<div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">tr-sender</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> submitType</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;shiftEnter&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> mode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;multiple&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> placeholder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;按Shift+Enter提交&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div><p>使用不同的提交方式可以适应不同的使用场景：</p><ul><li>聊天应用通常使用<code>enter</code>快速提交消息</li><li>多行文本编辑时，使用<code>ctrl+enter</code>或<code>shift+enter</code>可避免误提交</li><li>代码编辑器类应用通常使用<code>ctrl+enter</code>提交，保持编辑文本的结构</li></ul><h3 id="键盘快捷键支持" tabindex="-1">键盘快捷键支持 <a class="header-anchor" href="#键盘快捷键支持" aria-label="Permalink to &quot;键盘快捷键支持&quot;">​</a></h3><p>Sender 组件支持多种键盘快捷键操作，提高用户输入效率：</p><table tabindex="0"><thead><tr><th>快捷键</th><th>功能</th><th>适用条件</th></tr></thead><tbody><tr><td>Enter</td><td>提交内容 / 选中联想项</td><td>submitType=&quot;enter&quot;（默认） / 联想弹窗开启时</td></tr><tr><td>Ctrl+Enter</td><td>提交内容</td><td>submitType=&quot;ctrlEnter&quot;(多行)</td></tr><tr><td>Shift+Enter</td><td>提交内容</td><td>submitType=&quot;shiftEnter&quot;(多行)</td></tr><tr><td>Tab</td><td>选中联想项</td><td>联想弹窗开启并有联想数据时</td></tr><tr><td>Esc</td><td>取消语音/关闭联想/建议</td><td>对应功能激活时</td></tr><tr><td>↑ / ↓</td><td>导航联想项</td><td>联想弹窗开启时</td></tr></tbody></table><p><strong>自定义选中按键</strong>：可以通过 <code>activeSuggestionKeys</code> 属性自定义选中联想项的按键，默认值为 <code>[&#39;Enter&#39;, &#39;Tab&#39;]</code>。例如设置为 <code>[&#39;Tab&#39;]</code> 可仅使用 Tab 键选中联想项。<br> 注意：请勿使用纯修饰键（如 <code>Control</code>/<code>Shift</code>/<code>Alt</code>/<code>Meta</code>）作为选中按键，否则会劫持常见快捷键（如 Ctrl+C/Ctrl+V/Ctrl+A）。</p><p>您可以在实际开发中根据应用场景和用户需求选择最适合的快捷键方式。</p><h3 id="布局与插槽" tabindex="-1">布局与插槽 <a class="header-anchor" href="#布局与插槽" aria-label="Permalink to &quot;布局与插槽&quot;">​</a></h3><p>以下是一个关于插槽的综合使用示例：</p>',10)),k(n(e(C),null,null,512),[[E,i.value]]),n(p,null,{default:l(()=>[n(e(g),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[9]||(t[9]=()=>{i.value=!1}),vueCode:e(I)},u({_:2},[m.value?{name:"vue",fn:l(()=>[n(e(m))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[35]||(t[35]=d(`<h3 id="紧凑模式配置" tabindex="-1">紧凑模式配置 <a class="header-anchor" href="#紧凑模式配置" aria-label="Permalink to &quot;紧凑模式配置&quot;">​</a></h3><p>Sender 组件支持紧凑模式，适用于空间受限的场景。通过添加 <code>tr-sender-compact</code> CSS类可以启用紧凑样式。</p><p>紧凑模式的特点：</p><ul><li>较小的字体和输入框（14px vs 16px）</li><li>更紧凑的内边距和间距</li><li>更小的图标尺寸（32px vs 36px）</li><li>更小的圆角（24px vs 26px）</li></ul><p><strong>使用方式：</strong></p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">&lt;!-- 默认样式（宽松模式） --&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrSender</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">&lt;!-- 紧凑模式 --&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrSender</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> class</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;tr-sender-compact&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div>`,6)),k(n(e(C),null,null,512),[[E,i.value]]),n(p,null,{default:l(()=>[n(e(g),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[10]||(t[10]=()=>{i.value=!1}),vueCode:e(q)},u({_:2},[A.value?{name:"vue",fn:l(()=>[n(e(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[36]||(t[36]=d(`<h2 id="api-说明" tabindex="-1">API 说明 <a class="header-anchor" href="#api-说明" aria-label="Permalink to &quot;API 说明&quot;">​</a></h2><h3 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td>autofocus</td><td>自动获取焦点</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td>autoSize</td><td>自动调整高度</td><td><code>boolean | { minRows: number, maxRows: number }</code></td><td><code>false</code></td></tr><tr><td>allowSpeech</td><td>是否开启语音输入</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td>allowFiles</td><td>是否允许文件上传</td><td><code>boolean</code></td><td><code>true</code></td></tr><tr><td>clearable</td><td>是否可清空</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td>disabled</td><td>是否禁用</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td>modelValue</td><td>绑定值(v-model)</td><td><code>string</code></td><td><code>&#39;&#39;</code></td></tr><tr><td>defaultValue</td><td>默认值(非响应式)</td><td><code>string</code></td><td><code>&#39;&#39;</code></td></tr><tr><td>loading</td><td>是否加载中</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td>mode</td><td>输入框类型</td><td><code>&#39;single&#39; | &#39;multiple&#39;</code></td><td><code>&#39;single&#39;</code></td></tr><tr><td>maxLength</td><td>最大输入长度</td><td><code>number</code></td><td><code>Infinity</code></td></tr><tr><td>buttonGroup</td><td>按钮组配置</td><td><code>ButtonGroupConfig</code></td><td><code>{}</code></td></tr><tr><td>placeholder</td><td>输入框占位文本</td><td><code>string</code></td><td><code>&#39;请输入内容...&#39;</code></td></tr><tr><td>speech</td><td>语音识别配置</td><td><code>&#39;boolean&#39; | &#39;SpeechConfig&#39;</code></td><td>无</td></tr><tr><td>showWordLimit</td><td>是否显示字数统计</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td>stopText</td><td>停止按钮文字</td><td><code>string</code></td><td><code>仅显示图标</code></td></tr><tr><td>submitType</td><td>提交方式</td><td><code>&#39;enter&#39; | &#39;ctrl+enter&#39; | &#39;shift+enter&#39;</code></td><td><code>&#39;enter&#39;</code></td></tr><tr><td>theme</td><td>主题样式</td><td><code>&#39;light&#39; | &#39;dark&#39;</code></td><td><code>&#39;light&#39;</code></td></tr><tr><td>suggestions</td><td>输入建议列表</td><td><code>(string | SuggestionItem)[]</code></td><td><code>[]</code></td></tr><tr><td>suggestionPopupWidth</td><td>输入建议弹窗宽度</td><td><code>&#39;number&#39; | &#39;string&#39;</code></td><td><code>400px</code></td></tr><tr><td>activeSuggestionKeys</td><td>激活建议项的按键</td><td><code>string[]</code></td><td><code>[&#39;Enter&#39;, &#39;Tab&#39;]</code></td></tr><tr><td>templateData</td><td>模板数据，用于初始化或 v-model 更新</td><td><code>UserItem[]</code></td><td><code>[]</code></td></tr></tbody></table><h3 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h3><table tabindex="0"><thead><tr><th>事件名</th><th>说明</th><th>回调参数</th></tr></thead><tbody><tr><td>update:modelValue</td><td>输入值变化时触发(v-model)</td><td><code>(value: string)</code></td></tr><tr><td>blur</td><td>输入框失去焦点时触发</td><td><code>(event: FocusEvent)</code></td></tr><tr><td>change</td><td>输入值改变且失焦时触发</td><td><code>(value: string)</code></td></tr><tr><td>focus</td><td>输入框获得焦点时触发</td><td><code>(event: FocusEvent)</code></td></tr><tr><td>input</td><td>输入值改变时触发</td><td><code>(value: string)</code></td></tr><tr><td>submit</td><td>提交内容时触发</td><td><code>(value: string)</code></td></tr><tr><td>clear</td><td>清空内容时触发</td><td><code>()</code></td></tr><tr><td>cancel</td><td>取消发送（加载状态）时触发</td><td><code>()</code></td></tr><tr><td>speech-start</td><td>语音识别开始时触发</td><td><code>()</code></td></tr><tr><td>speech-end</td><td>语音识别结束时触发</td><td><code>(transcript: string)</code></td></tr><tr><td>speech-interim</td><td>语音识别中间结果时触发</td><td><code>(transcript: string)</code></td></tr><tr><td>speech-error</td><td>语音识别错误时触发</td><td><code>(error: Error)</code></td></tr><tr><td>suggestion-select</td><td>选择输入建议时触发</td><td><code>(value: string)</code></td></tr></tbody></table><h3 id="methods" tabindex="-1">Methods <a class="header-anchor" href="#methods" aria-label="Permalink to &quot;Methods&quot;">​</a></h3><table tabindex="0"><thead><tr><th>方法名</th><th>说明</th><th>参数</th><th>返回值</th></tr></thead><tbody><tr><td>focus</td><td>使输入框获取焦点</td><td>-</td><td><code>void</code></td></tr><tr><td>blur</td><td>使输入框失去焦点</td><td>-</td><td><code>void</code></td></tr><tr><td>clear</td><td>清空输入内容</td><td>-</td><td><code>void</code></td></tr><tr><td>submit</td><td>手动触发提交事件</td><td>-</td><td><code>void</code></td></tr><tr><td>startSpeech</td><td>开始语音识别</td><td>-</td><td><code>Promise&lt;void&gt;</code></td></tr><tr><td>stopSpeech</td><td>停止语音识别</td><td>-</td><td><code>void</code></td></tr><tr><td>activateTemplateFirstField</td><td>激活模板的第一个输入字段</td><td>-</td><td><code>void</code></td></tr></tbody></table><h3 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h3><p>组件布局结构如下：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>+----------------------+</span></span>
<span class="line"><span>|      header slot     |  &lt;!-- 位于内容区域上方 --&gt;</span></span>
<span class="line"><span>+----------------------+</span></span>
<span class="line"><span>| prefix |   content   | actions  &lt;!-- 横向排列 --&gt;</span></span>
<span class="line"><span>| slot   |    area     | slot</span></span>
<span class="line"><span>+----------------------+</span></span>
<span class="line"><span>|footer-left | footer-right|  &lt;!-- 底部左右两侧区域 --&gt;</span></span>
<span class="line"><span>+----------------------+</span></span></code></pre></div><table tabindex="0"><thead><tr><th>插槽名称</th><th>描述</th><th>CSS类名</th><th>默认内容</th></tr></thead><tbody><tr><td><code>header</code></td><td>头部插槽，位于输入框上方</td><td><code>.tiny-sender__header-slot</code></td><td>无</td></tr><tr><td><code>prefix</code></td><td>前缀插槽，位于输入框左侧</td><td><code>.tiny-sender__prefix-slot</code></td><td>无</td></tr><tr><td><code>actions</code></td><td>后缀插槽，位于输入框右侧</td><td><code>.tiny-sender__actions-slot</code></td><td>单行模式下的操作按钮</td></tr><tr><td><code>footer-left</code></td><td>底部左侧插槽，保留字数限制</td><td><code>.tiny-sender__footer-left</code></td><td>字数限制</td></tr><tr><td><code>footer-right</code></td><td>底部右侧插槽，保留操作按钮</td><td><code>.tiny-sender__footer-right</code></td><td>多行模式下的操作按钮</td></tr><tr><td><code>footer</code></td><td>底部完全自定义插槽(向后兼容)</td><td><code>.tiny-sender__footer-slot</code></td><td>无 (会覆盖其他底部元素)</td></tr><tr><td><code>decorativeContent</code></td><td>装饰性内容插槽，启用后禁止输入</td><td><code>.tiny-sender__decorative-content</code></td><td>无</td></tr></tbody></table><h3 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 语音回调函数集合</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SpeechCallbacks</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  onStart</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  onInterim</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">transcript</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  onFinal</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">transcript</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  onEnd</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">transcript</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  onError</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">error</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 自定义语音处理器接口</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SpeechHandler</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  start</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">callbacks</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SpeechCallbacks</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  stop</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  isSupported</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SpeechConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  customHandler</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SpeechHandler</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 自定义语音处理器</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  lang</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 识别语言，默认浏览器语言</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  continuous</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 是否持续识别</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  interimResults</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 是否返回中间结果</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  autoReplace</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 是否自动替换当前输入内容</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ControlState</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  tooltips</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Function</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 工具提示</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  disabled</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 是否禁用</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  tooltipPlacement</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;top&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;top-start&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;top-end&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;bottom&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;bottom-start&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;bottom-end&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;left&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;left-start&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;left-end&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;right&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;right-start&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;right-end&#39;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // tooltip 弹窗位置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fileUploadConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  accept</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 接受的文件类型</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  multiple</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 是否支持多选文件</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  reset</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 是否重置文件选择</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ButtonGroupConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  file</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ControlState</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &amp;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fileUploadConfig</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 文件上传按钮</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  submit</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ControlState</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 提交按钮</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 后续可扩展至其他按钮...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 高亮文本片段类型</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SuggestionTextPart</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  text</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 文本片段</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  isMatch</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 是否高亮</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 高亮函数类型</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> HighlightFunction</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">suggestionText</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">inputText</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SuggestionTextPart</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 建议项类型</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SuggestionItem</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  content</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 建议项文本内容</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  highlights</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> HighlightFunction</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 高亮方式</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div>`,15))])}}});export{J as __pageData,O as default};
