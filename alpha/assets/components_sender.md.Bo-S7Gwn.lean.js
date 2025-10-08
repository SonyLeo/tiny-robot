const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/CompactMode.Cf_gwEWx.js","assets/chunks/theme.C_-hLVRq.js","assets/chunks/framework.CdlzW3Za.js","assets/chunks/All.CwGfyzeK.js","assets/chunks/Suggestions.BPFeZJT9.js","assets/chunks/Template.DHua2ZnI.js","assets/chunks/FileUpload.DJbfYtoM.js","assets/chunks/DecorativeContent.DASiz415.js","assets/chunks/MobilePressToTalk.CRn2X0pA.js","assets/chunks/speechHandlers.BnEXGotK.js","assets/chunks/CustomSpeech.CNqeEhTv.js","assets/chunks/voiceInput.CNNBw3hD.js","assets/chunks/DeepThink.CVYC0OQa.js","assets/chunks/AutoSize.g61QLTYl.js","assets/chunks/Mode.ivI5fHL0.js"])))=>i.map(i=>d[i]);
import{D as d,v as h,V as C,p as R,C as _,c as I,o as W,a2 as o,af as c,G as e,j as s,ag as E,k as t,w as l,ai as k,a as r}from"./chunks/framework.CdlzW3Za.js";import{L as u,N as A}from"./chunks/index.nUIVzG0Y.js";const P=`<template>
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
`,Z=`<template>
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
`,q=`<template>
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
`,G=`<template>
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
`,K=`<template>
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
`,M=`<template>
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
    <div>
      <h4>支持移动端按住说话的输入框</h4>
      <div
        class="sender-container"
        @touchmove.prevent="handleContainerTouchMove"
        @touchend.prevent="handleContainerTouchEnd"
        @mousemove.prevent="handleContainerTouchMove"
        @mouseup.prevent="handleContainerTouchEnd"
      >
        <tr-sender
          v-show="!showMobileVoiceUI"
          ref="senderRef"
          v-model="inputText"
          mode="single"
          class="sender"
          :allowSpeech="true"
          :speech="speechConfig"
          placeholder="点击麦克风按钮开始语音输入..."
          @speech-start="handleSpeechStart"
          @speech-end="handleSpeechEnd"
          @speech-error="handleSpeechError"
          @submit="handleSubmit"
        >
          <template #content>
            <div
              style="width: 100%; display: flex; justify-content: center; user-select: none"
              @touchstart.prevent="handleDecorativeTouchStart"
              @mousedown.prevent="handleDecorativeTouchStart"
            >
              按住说话
            </div>
          </template>
        </tr-sender>

        <PressToTalkOverlay
          ref="mobileVoiceUIRef"
          v-model:visible="showMobileVoiceUI"
          :cancelThreshold="cancelThreshold"
          :isCanceling="isCanceling"
        />
      </div>
    </div>

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
          <div style="font-size: 12px; color: #999; margin-bottom: 4px">
            {{ result.timestamp }} - {{ result.platform }} - {{ result.mode }}
            <span v-if="result.canceled" style="color: #ff4d4f"> - 已取消</span>
            <span v-if="result.completed" style="color: #00b176"> - 已发送</span>
          </div>
          <div>{{ result.text }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import type { VoiceButtonClickContext } from '@opentiny/tiny-robot'
import { MockSpeechHandler } from './speechHandlers'
import PressToTalkOverlay from './PressToTalkOverlay.vue'

interface Result {
  text: string
  timestamp: string
  mode: string
  platform: string
  canceled?: boolean
  completed?: boolean
}

const senderRef = ref<InstanceType<typeof TrSender>>()
const mobileVoiceUIRef = ref<InstanceType<typeof PressToTalkOverlay>>()

const inputText = ref('')
const showMobileVoiceUI = ref(false)
const isCanceling = ref(false)
const startY = ref(0)
const results = ref<Result[]>([])

const autoReplace = ref(true)
const cancelThreshold = 30
const isMobile = computed(() => true)
const customSpeechHandler = new MockSpeechHandler()

const speechConfig = computed(() => ({
  mode: 'custom' as const,
  customHandler: customSpeechHandler,
  autoReplace: autoReplace.value,
  interimResults: true,
  isMobile: isMobile.value,
  onVoiceButtonClick: async (context: VoiceButtonClickContext) => {
    if (!context.isMobile) return false
    if (!context.isRecording) {
      showMobileVoiceUI.value = true
      return true
    } else {
      context.speechHandler.stop()
      showMobileVoiceUI.value = false
      return true
    }
  },
}))

const handleSpeechStart = () => {}

const handleSpeechEnd = (transcript?: string) => {
  if (transcript) {
    results.value.unshift({
      text: transcript,
      timestamp: new Date().toLocaleTimeString(),
      mode: autoReplace.value ? '替换模式' : '追加模式',
      platform: isMobile.value ? '移动端' : 'PC端',
    })
    if (results.value.length > 10) results.value.length = 10
  }
}

const handleSpeechError = () => {}

const handleSubmit = (text: string) => {
  console.log('提交内容:', text)
}

const handleDecorativeTouchStart = (e: TouchEvent | MouseEvent) => {
  const clientY = e instanceof TouchEvent ? e.touches[0].clientY : e.clientY
  startY.value = clientY
  showMobileVoiceUI.value = true
  isCanceling.value = false
  senderRef.value?.startSpeech()
}

const handleContainerTouchMove = (e: TouchEvent | MouseEvent) => {
  if (!showMobileVoiceUI.value) return
  const currentY = e instanceof TouchEvent ? e.touches[0].clientY : e.clientY
  const slideDistance = startY.value - currentY
  isCanceling.value = slideDistance > cancelThreshold
}

const handleContainerTouchEnd = (e: TouchEvent | MouseEvent) => {
  if (!showMobileVoiceUI.value) return

  const endY = e instanceof TouchEvent ? e.changedTouches[0].clientY : e.clientY
  const totalSlide = startY.value - endY
  const canceled = totalSlide > cancelThreshold

  if (canceled) {
    senderRef.value?.stopSpeech()
    results.value.unshift({
      text: '(录音已取消)',
      timestamp: new Date().toLocaleTimeString(),
      mode: autoReplace.value ? '替换模式' : '追加模式',
      platform: isMobile.value ? '移动端' : 'PC端',
      canceled: true,
    })
  } else {
    results.value.unshift({
      text: inputText.value,
      timestamp: new Date().toLocaleTimeString(),
      mode: autoReplace.value ? '替换模式' : '追加模式',
      platform: isMobile.value ? '移动端' : 'PC端',
      completed: true,
    })
    senderRef.value?.stopSpeech()
  }

  showMobileVoiceUI.value = false
  isCanceling.value = false
}
<\/script>

<style scoped>
.sender-container {
  position: relative;
  min-height: 180px;
}

.sender {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
`,X=`<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <!-- 配置区域 -->
    <div style="padding: 16px; background: #f5f5f5; border-radius: 8px">
      <h4 style="margin: 0 0 12px 0">语音识别配置</h4>

      <!-- 服务商选择 -->
      <div style="margin-bottom: 12px">
        <label style="display: block; margin-bottom: 4px; font-size: 14px">选择服务商:</label>
        <select v-model="provider" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px">
          <option value="baidu">百度语音识别</option>
          <option value="aliyun">阿里云一句话识别</option>
          <option value="aliyun-realtime">阿里云实时语音识别</option>
          <option value="mock">模拟演示</option>
        </select>
      </div>

      <!-- 百度配置 -->
      <div
        v-if="provider === 'baidu'"
        style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px"
      >
        <div>
          <label style="display: block; margin-bottom: 4px; font-size: 14px">API Key:</label>
          <input
            v-model="baiduApiKey"
            type="text"
            placeholder="请输入百度 API Key"
            style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px"
          />
        </div>
        <div>
          <label style="display: block; margin-bottom: 4px; font-size: 14px">Secret Key:</label>
          <input
            v-model="baiduSecretKey"
            type="password"
            placeholder="请输入百度 Secret Key"
            style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px"
          />
        </div>
      </div>

      <!-- 阿里云配置 -->
      <div
        v-if="provider === 'aliyun' || provider === 'aliyun-realtime'"
        style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px"
      >
        <div>
          <label style="display: block; margin-bottom: 4px; font-size: 14px">AppKey:</label>
          <input
            v-model="aliyunAppKey"
            type="text"
            placeholder="请输入阿里云 AppKey"
            style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px"
          />
        </div>
        <div>
          <label style="display: block; margin-bottom: 4px; font-size: 14px">Token:</label>
          <input
            v-model="aliyunToken"
            type="password"
            placeholder="请输入阿里云 Token"
            style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px"
          />
        </div>
      </div>

      <div style="display: flex; gap: 12px; align-items: center">
        <label style="display: flex; align-items: center; gap: 4px; font-size: 14px">
          <input v-model="autoReplace" type="checkbox" />
          替换模式 (否则为追加模式)
        </label>
      </div>
    </div>

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

    <!-- 错误提示 -->
    <div
      v-if="errorMessage"
      style="padding: 12px; background: #fff2f0; border-radius: 6px; border-left: 4px solid #ff4d4f"
    >
      <div style="font-weight: 500; color: #ff4d4f">错误信息</div>
      <div style="margin-top: 4px; color: #666">{{ errorMessage }}</div>
    </div>

    <!-- 输入组件 -->
    <div>
      <h4>自定义语音识别输入框</h4>
      <tr-sender
        :key="provider"
        v-model="inputText"
        mode="single"
        :allowSpeech="true"
        :speech="speechConfig"
        placeholder="点击麦克风按钮开始语音输入，或直接键盘输入..."
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
          <div style="font-size: 12px; color: #999; margin-bottom: 4px">{{ result.timestamp }} - {{ result.mode }}</div>
          <div>{{ result.text }}</div>
        </div>
      </div>
    </div>

    <!-- 使用说明 -->
    <div style="padding: 16px; background: #fffbe6; border-radius: 8px; border-left: 4px solid #faad14">
      <h4 style="margin: 0 0 8px 0; color: #fa8c16">使用说明</h4>
      <ul style="margin: 0; padding-left: 20px; color: #666">
        <li><strong>百度语音识别:</strong> 需要输入 API Key 和 Secret Key</li>
        <li><strong>阿里云一句话识别:</strong> 需要输入 AppKey 和 Token，适合短语音识别</li>
        <li><strong>阿里云实时语音识别:</strong> 需要输入 AppKey 和 Token，支持实时流式识别和中间结果</li>
        <li><strong>模拟演示:</strong> 无需真实 API 配置，可体验功能流程</li>
        <li>替换模式：每次语音识别会覆盖输入框内容</li>
        <li>追加模式：语音识别结果会追加到现有内容后面</li>
        <li>支持键盘和语音混合输入</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import {
  BaiduSpeechHandler,
  AliyunSpeechHandler,
  AliyunRealtimeSpeechHandler,
  MockSpeechHandler,
} from './speechHandlers'

// 配置状态
const provider = ref<'baidu' | 'aliyun' | 'aliyun-realtime' | 'mock'>('aliyun')
const baiduApiKey = ref('')
const baiduSecretKey = ref('')
const aliyunAppKey = ref('')
const aliyunToken = ref('')
const autoReplace = ref(false)

// 组件状态
const inputText = ref('')
const speechStatus = ref('')
const interimResult = ref('')
const errorMessage = ref('')
const results = ref<Array<{ text: string; timestamp: string; mode: string }>>([])

// 语音配置 - 使用动态获取密钥的方式
const speechConfig = computed(() => {
  let handler: BaiduSpeechHandler | AliyunSpeechHandler | AliyunRealtimeSpeechHandler | MockSpeechHandler

  switch (provider.value) {
    case 'baidu':
      handler = BaiduSpeechHandler.createWithGetters(
        () => baiduApiKey.value,
        () => baiduSecretKey.value,
      )
      break
    case 'aliyun':
      handler = AliyunSpeechHandler.createWithGetters(
        () => aliyunAppKey.value,
        () => aliyunToken.value,
      )
      break
    case 'aliyun-realtime':
      handler = AliyunRealtimeSpeechHandler.createWithGetters(
        () => aliyunAppKey.value,
        () => aliyunToken.value,
      )
      break
    case 'mock':
    default:
      handler = new MockSpeechHandler()
      break
  }

  return {
    mode: 'custom' as const,
    customHandler: handler,
    autoReplace: autoReplace.value,
    interimResults: provider.value === 'aliyun-realtime' || provider.value === 'mock',
  }
})

// 事件处理
const handleSpeechStart = () => {
  speechStatus.value = '🎤 正在录音...'
  interimResult.value = ''
  errorMessage.value = ''
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
    mode: autoReplace.value ? '替换模式' : '追加模式',
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
  errorMessage.value = error.message

  // 根据不同服务商给出更明确的提示
  if (provider.value === 'baidu' && (error.message.includes('API Key') || error.message.includes('Secret Key'))) {
    errorMessage.value = \`\${error.message}\\n当前API Key: \${baiduApiKey.value ? '已设置' : '未设置'}\\n当前Secret Key: \${baiduSecretKey.value ? '已设置' : '未设置'}\`
  } else if (
    (provider.value === 'aliyun' || provider.value === 'aliyun-realtime') &&
    (error.message.includes('AppKey') || error.message.includes('Token'))
  ) {
    errorMessage.value = \`\${error.message}\\n当前AppKey: \${aliyunAppKey.value ? '已设置' : '未设置'}\\n当前Token: \${aliyunToken.value ? '已设置' : '未设置'}\`
  }

  // 5秒后自动清除错误信息
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

const handleSubmit = (text: string) => {
  console.log('提交内容:', text)
  // 这里可以处理提交逻辑
}
<\/script>
`,z=`<template>
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
`,L=`<template>
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
`,H=`<template>
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
`,U=`<template>
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
`,J=JSON.parse('{"title":"Sender 消息输入框组件","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/sender.md","filePath":"components/sender.md"}'),N={name:"components/sender.md"},Q=Object.assign(N,{setup(Y){const B=d();h(async()=>{B.value=(await C(async()=>{const{default:a}=await import("./chunks/CompactMode.Cf_gwEWx.js");return{default:a}},__vite__mapDeps([0,1,2]))).default});const y=d();h(async()=>{y.value=(await C(async()=>{const{default:a}=await import("./chunks/All.CwGfyzeK.js");return{default:a}},__vite__mapDeps([3,1,2]))).default});const F=d();h(async()=>{F.value=(await C(async()=>{const{default:a}=await import("./chunks/Suggestions.BPFeZJT9.js");return{default:a}},__vite__mapDeps([4,1,2]))).default});const m=d();h(async()=>{m.value=(await C(async()=>{const{default:a}=await import("./chunks/Template.DHua2ZnI.js");return{default:a}},__vite__mapDeps([5,1,2]))).default});const D=d();h(async()=>{D.value=(await C(async()=>{const{default:a}=await import("./chunks/FileUpload.DJbfYtoM.js");return{default:a}},__vite__mapDeps([6,1,2]))).default});const v=d();h(async()=>{v.value=(await C(async()=>{const{default:a}=await import("./chunks/DecorativeContent.DASiz415.js");return{default:a}},__vite__mapDeps([7,1,2]))).default});const b=d();h(async()=>{b.value=(await C(async()=>{const{default:a}=await import("./chunks/MobilePressToTalk.CRn2X0pA.js");return{default:a}},__vite__mapDeps([8,2,1,9]))).default});const f=d();h(async()=>{f.value=(await C(async()=>{const{default:a}=await import("./chunks/CustomSpeech.CNqeEhTv.js");return{default:a}},__vite__mapDeps([10,2,1,9]))).default});const x=d();h(async()=>{x.value=(await C(async()=>{const{default:a}=await import("./chunks/voiceInput.CNNBw3hD.js");return{default:a}},__vite__mapDeps([11,1,2]))).default});const S=d();h(async()=>{S.value=(await C(async()=>{const{default:a}=await import("./chunks/DeepThink.CVYC0OQa.js");return{default:a}},__vite__mapDeps([12,1,2]))).default});const T=d();h(async()=>{T.value=(await C(async()=>{const{default:a}=await import("./chunks/AutoSize.g61QLTYl.js");return{default:a}},__vite__mapDeps([13,1,2]))).default});const i=R(!0),w=d();return h(async()=>{w.value=(await C(async()=>{const{default:a}=await import("./chunks/Mode.ivI5fHL0.js");return{default:a}},__vite__mapDeps([14,1,2]))).default}),(a,n)=>{const p=_("ClientOnly"),g=_("tr-sender");return W(),I("div",null,[n[12]||(n[12]=o("",7)),c(e(t(u),null,null,512),[[E,i.value]]),e(p,null,{default:l(()=>[e(t(A),{title:"基础用法",description:"Sender 组件的基础用法，支持单行和多行模式。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[0]||(n[0]=()=>{i.value=!1}),vueCode:t(U)},k({_:2},[w.value?{name:"vue",fn:l(()=>[e(t(w))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[13]||(n[13]=s("h3",{id:"状态控制",tabindex:"-1"},[r("状态控制 "),s("a",{class:"header-anchor",href:"#状态控制","aria-label":'Permalink to "状态控制"'},"​")],-1)),n[14]||(n[14]=s("h4",{id:"加载状态",tabindex:"-1"},[r("加载状态 "),s("a",{class:"header-anchor",href:"#加载状态","aria-label":'Permalink to "加载状态"'},"​")],-1)),n[15]||(n[15]=s("p",null,[r("通过设置"),s("code",null,"loading"),r("属性控制组件的加载状态，加载状态下输入框将显示加载动画并禁用输入。 在加载状态下，点击加载图标可以取消发送操作，这会触发 "),s("code",null,"cancel"),r(" 事件。")],-1)),e(g,{loading:!0,stopText:"停止回答"}),n[16]||(n[16]=o("",3)),e(g,{disabled:!0}),n[17]||(n[17]=o("",5)),e(g,{mode:"multiple",showWordLimit:!0,maxLength:20,defaultValue:"测试超出字数限制，当前已经超过了字数限制。"}),n[18]||(n[18]=o("",5)),c(e(t(u),null,null,512),[[E,i.value]]),e(p,null,{default:l(()=>[e(t(A),{title:"自动调整高度",description:"Sender 组件支持自动调整高度。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[1]||(n[1]=()=>{i.value=!1}),vueCode:t(H)},k({_:2},[T.value?{name:"vue",fn:l(()=>[e(t(T))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[19]||(n[19]=s("h4",{id:"可清空输入",tabindex:"-1"},[r("可清空输入 "),s("a",{class:"header-anchor",href:"#可清空输入","aria-label":'Permalink to "可清空输入"'},"​")],-1)),n[20]||(n[20]=s("p",null,[r("通过"),s("code",null,"clearable"),r("属性添加清空按钮，方便用户快速清除输入内容。")],-1)),e(g,{clearable:!0}),n[21]||(n[21]=o("",5)),c(e(t(u),null,null,512),[[E,i.value]]),e(p,null,{default:l(()=>[e(t(A),{title:"自定义按钮",description:"Sender 组件支持在多行模式下灵活定制底部区域。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[2]||(n[2]=()=>{i.value=!1}),vueCode:t(L)},k({_:2},[S.value?{name:"vue",fn:l(()=>[e(t(S))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[22]||(n[22]=o("",4)),c(e(t(u),null,null,512),[[E,i.value]]),e(p,null,{default:l(()=>[e(t(A),{title:"内置语音输入",description:"使用浏览器内置的 Web Speech API",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[3]||(n[3]=()=>{i.value=!1}),vueCode:t(z)},k({_:2},[x.value?{name:"vue",fn:l(()=>[e(t(x))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[23]||(n[23]=s("h4",{id:"自定义语音识别",tabindex:"-1"},[r("自定义语音识别 "),s("a",{class:"header-anchor",href:"#自定义语音识别","aria-label":'Permalink to "自定义语音识别"'},"​")],-1)),n[24]||(n[24]=s("p",null,"Sender 组件支持自定义语音识别服务，可以集成百度、Azure、阿里云等第三方语音识别服务，或者使用 WebSocket 实时语音识别。",-1)),c(e(t(u),null,null,512),[[E,i.value]]),e(p,null,{default:l(()=>[e(t(A),{title:"自定义语音识别",description:"集成百度语音识别服务的完整示例",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%22CustomSpeech.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fsender%2FCustomSpeech.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20style%3D%5C%22display%3A%20flex%3B%20flex-direction%3A%20column%3B%20gap%3A%2020px%5C%22%3E%5Cn%20%20%20%20%3C!--%20%E9%85%8D%E7%BD%AE%E5%8C%BA%E5%9F%9F%20--%3E%5Cn%20%20%20%20%3Cdiv%20style%3D%5C%22padding%3A%2016px%3B%20background%3A%20%23f5f5f5%3B%20border-radius%3A%208px%5C%22%3E%5Cn%20%20%20%20%20%20%3Ch4%20style%3D%5C%22margin%3A%200%200%2012px%200%5C%22%3E%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E9%85%8D%E7%BD%AE%3C%2Fh4%3E%5Cn%5Cn%20%20%20%20%20%20%3C!--%20%E6%9C%8D%E5%8A%A1%E5%95%86%E9%80%89%E6%8B%A9%20--%3E%5Cn%20%20%20%20%20%20%3Cdiv%20style%3D%5C%22margin-bottom%3A%2012px%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Clabel%20style%3D%5C%22display%3A%20block%3B%20margin-bottom%3A%204px%3B%20font-size%3A%2014px%5C%22%3E%E9%80%89%E6%8B%A9%E6%9C%8D%E5%8A%A1%E5%95%86%3A%3C%2Flabel%3E%5Cn%20%20%20%20%20%20%20%20%3Cselect%20v-model%3D%5C%22provider%5C%22%20style%3D%5C%22width%3A%20100%25%3B%20padding%3A%208px%3B%20border%3A%201px%20solid%20%23ddd%3B%20border-radius%3A%204px%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Coption%20value%3D%5C%22baidu%5C%22%3E%E7%99%BE%E5%BA%A6%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%3C%2Foption%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Coption%20value%3D%5C%22aliyun%5C%22%3E%E9%98%BF%E9%87%8C%E4%BA%91%E4%B8%80%E5%8F%A5%E8%AF%9D%E8%AF%86%E5%88%AB%3C%2Foption%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Coption%20value%3D%5C%22aliyun-realtime%5C%22%3E%E9%98%BF%E9%87%8C%E4%BA%91%E5%AE%9E%E6%97%B6%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%3C%2Foption%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Coption%20value%3D%5C%22mock%5C%22%3E%E6%A8%A1%E6%8B%9F%E6%BC%94%E7%A4%BA%3C%2Foption%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fselect%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%20%20%3C!--%20%E7%99%BE%E5%BA%A6%E9%85%8D%E7%BD%AE%20--%3E%5Cn%20%20%20%20%20%20%3Cdiv%5Cn%20%20%20%20%20%20%20%20v-if%3D%5C%22provider%20%3D%3D%3D%20'baidu'%5C%22%5Cn%20%20%20%20%20%20%20%20style%3D%5C%22display%3A%20grid%3B%20grid-template-columns%3A%201fr%201fr%3B%20gap%3A%2012px%3B%20margin-bottom%3A%2012px%5C%22%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Clabel%20style%3D%5C%22display%3A%20block%3B%20margin-bottom%3A%204px%3B%20font-size%3A%2014px%5C%22%3EAPI%20Key%3A%3C%2Flabel%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cinput%5Cn%20%20%20%20%20%20%20%20%20%20%20%20v-model%3D%5C%22baiduApiKey%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20type%3D%5C%22text%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20placeholder%3D%5C%22%E8%AF%B7%E8%BE%93%E5%85%A5%E7%99%BE%E5%BA%A6%20API%20Key%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20style%3D%5C%22width%3A%20100%25%3B%20padding%3A%208px%3B%20border%3A%201px%20solid%20%23ddd%3B%20border-radius%3A%204px%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Clabel%20style%3D%5C%22display%3A%20block%3B%20margin-bottom%3A%204px%3B%20font-size%3A%2014px%5C%22%3ESecret%20Key%3A%3C%2Flabel%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cinput%5Cn%20%20%20%20%20%20%20%20%20%20%20%20v-model%3D%5C%22baiduSecretKey%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20type%3D%5C%22password%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20placeholder%3D%5C%22%E8%AF%B7%E8%BE%93%E5%85%A5%E7%99%BE%E5%BA%A6%20Secret%20Key%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20style%3D%5C%22width%3A%20100%25%3B%20padding%3A%208px%3B%20border%3A%201px%20solid%20%23ddd%3B%20border-radius%3A%204px%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%20%20%3C!--%20%E9%98%BF%E9%87%8C%E4%BA%91%E9%85%8D%E7%BD%AE%20--%3E%5Cn%20%20%20%20%20%20%3Cdiv%5Cn%20%20%20%20%20%20%20%20v-if%3D%5C%22provider%20%3D%3D%3D%20'aliyun'%20%7C%7C%20provider%20%3D%3D%3D%20'aliyun-realtime'%5C%22%5Cn%20%20%20%20%20%20%20%20style%3D%5C%22display%3A%20grid%3B%20grid-template-columns%3A%201fr%201fr%3B%20gap%3A%2012px%3B%20margin-bottom%3A%2012px%5C%22%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Clabel%20style%3D%5C%22display%3A%20block%3B%20margin-bottom%3A%204px%3B%20font-size%3A%2014px%5C%22%3EAppKey%3A%3C%2Flabel%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cinput%5Cn%20%20%20%20%20%20%20%20%20%20%20%20v-model%3D%5C%22aliyunAppKey%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20type%3D%5C%22text%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20placeholder%3D%5C%22%E8%AF%B7%E8%BE%93%E5%85%A5%E9%98%BF%E9%87%8C%E4%BA%91%20AppKey%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20style%3D%5C%22width%3A%20100%25%3B%20padding%3A%208px%3B%20border%3A%201px%20solid%20%23ddd%3B%20border-radius%3A%204px%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Clabel%20style%3D%5C%22display%3A%20block%3B%20margin-bottom%3A%204px%3B%20font-size%3A%2014px%5C%22%3EToken%3A%3C%2Flabel%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cinput%5Cn%20%20%20%20%20%20%20%20%20%20%20%20v-model%3D%5C%22aliyunToken%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20type%3D%5C%22password%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20placeholder%3D%5C%22%E8%AF%B7%E8%BE%93%E5%85%A5%E9%98%BF%E9%87%8C%E4%BA%91%20Token%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20style%3D%5C%22width%3A%20100%25%3B%20padding%3A%208px%3B%20border%3A%201px%20solid%20%23ddd%3B%20border-radius%3A%204px%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%20%20%3Cdiv%20style%3D%5C%22display%3A%20flex%3B%20gap%3A%2012px%3B%20align-items%3A%20center%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Clabel%20style%3D%5C%22display%3A%20flex%3B%20align-items%3A%20center%3B%20gap%3A%204px%3B%20font-size%3A%2014px%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cinput%20v-model%3D%5C%22autoReplace%5C%22%20type%3D%5C%22checkbox%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%E6%9B%BF%E6%8D%A2%E6%A8%A1%E5%BC%8F%20(%E5%90%A6%E5%88%99%E4%B8%BA%E8%BF%BD%E5%8A%A0%E6%A8%A1%E5%BC%8F)%5Cn%20%20%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3C!--%20%E7%8A%B6%E6%80%81%E6%98%BE%E7%A4%BA%20--%3E%5Cn%20%20%20%20%3Cdiv%5Cn%20%20%20%20%20%20v-if%3D%5C%22speechStatus%5C%22%5Cn%20%20%20%20%20%20style%3D%5C%22padding%3A%2012px%3B%20background%3A%20%23e8f4fd%3B%20border-radius%3A%206px%3B%20border-left%3A%204px%20solid%20%231890ff%5C%22%5Cn%20%20%20%20%3E%5Cn%20%20%20%20%20%20%3Cdiv%20style%3D%5C%22font-weight%3A%20500%3B%20color%3A%20%231890ff%5C%22%3E%7B%7B%20speechStatus%20%7D%7D%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3Cdiv%20v-if%3D%5C%22interimResult%5C%22%20style%3D%5C%22margin-top%3A%208px%3B%20color%3A%20%23666%3B%20font-style%3A%20italic%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%E5%AE%9E%E6%97%B6%E8%AF%86%E5%88%AB%3A%20%7B%7B%20interimResult%20%7D%7D%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3C!--%20%E9%94%99%E8%AF%AF%E6%8F%90%E7%A4%BA%20--%3E%5Cn%20%20%20%20%3Cdiv%5Cn%20%20%20%20%20%20v-if%3D%5C%22errorMessage%5C%22%5Cn%20%20%20%20%20%20style%3D%5C%22padding%3A%2012px%3B%20background%3A%20%23fff2f0%3B%20border-radius%3A%206px%3B%20border-left%3A%204px%20solid%20%23ff4d4f%5C%22%5Cn%20%20%20%20%3E%5Cn%20%20%20%20%20%20%3Cdiv%20style%3D%5C%22font-weight%3A%20500%3B%20color%3A%20%23ff4d4f%5C%22%3E%E9%94%99%E8%AF%AF%E4%BF%A1%E6%81%AF%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3Cdiv%20style%3D%5C%22margin-top%3A%204px%3B%20color%3A%20%23666%5C%22%3E%7B%7B%20errorMessage%20%7D%7D%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3C!--%20%E8%BE%93%E5%85%A5%E7%BB%84%E4%BB%B6%20--%3E%5Cn%20%20%20%20%3Cdiv%3E%5Cn%20%20%20%20%20%20%3Ch4%3E%E8%87%AA%E5%AE%9A%E4%B9%89%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E8%BE%93%E5%85%A5%E6%A1%86%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20%20%20%3Akey%3D%5C%22provider%5C%22%5Cn%20%20%20%20%20%20%20%20v-model%3D%5C%22inputText%5C%22%5Cn%20%20%20%20%20%20%20%20mode%3D%5C%22single%5C%22%5Cn%20%20%20%20%20%20%20%20%3AallowSpeech%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aspeech%3D%5C%22speechConfig%5C%22%5Cn%20%20%20%20%20%20%20%20placeholder%3D%5C%22%E7%82%B9%E5%87%BB%E9%BA%A6%E5%85%8B%E9%A3%8E%E6%8C%89%E9%92%AE%E5%BC%80%E5%A7%8B%E8%AF%AD%E9%9F%B3%E8%BE%93%E5%85%A5%EF%BC%8C%E6%88%96%E7%9B%B4%E6%8E%A5%E9%94%AE%E7%9B%98%E8%BE%93%E5%85%A5...%5C%22%5Cn%20%20%20%20%20%20%20%20%40speech-start%3D%5C%22handleSpeechStart%5C%22%5Cn%20%20%20%20%20%20%20%20%40speech-interim%3D%5C%22handleSpeechInterim%5C%22%5Cn%20%20%20%20%20%20%20%20%40speech-final%3D%5C%22handleSpeechFinal%5C%22%5Cn%20%20%20%20%20%20%20%20%40speech-end%3D%5C%22handleSpeechEnd%5C%22%5Cn%20%20%20%20%20%20%20%20%40speech-error%3D%5C%22handleSpeechError%5C%22%5Cn%20%20%20%20%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3C!--%20%E7%BB%93%E6%9E%9C%E5%B1%95%E7%A4%BA%20--%3E%5Cn%20%20%20%20%3Cdiv%20v-if%3D%5C%22results.length%20%3E%200%5C%22%20style%3D%5C%22padding%3A%2016px%3B%20background%3A%20%23f9f9f9%3B%20border-radius%3A%208px%5C%22%3E%5Cn%20%20%20%20%20%20%3Ch4%20style%3D%5C%22margin%3A%200%200%2012px%200%5C%22%3E%E8%AF%86%E5%88%AB%E5%8E%86%E5%8F%B2%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%3Cdiv%20style%3D%5C%22max-height%3A%20200px%3B%20overflow-y%3A%20auto%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%5Cn%20%20%20%20%20%20%20%20%20%20v-for%3D%5C%22(result%2C%20index)%20in%20results%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Akey%3D%5C%22index%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20style%3D%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%208px%3B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20margin-bottom%3A%208px%3B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20background%3A%20white%3B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20border-radius%3A%204px%3B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20border-left%3A%203px%20solid%20%2352c41a%3B%5Cn%20%20%20%20%20%20%20%20%20%20%5C%22%5Cn%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cdiv%20style%3D%5C%22font-size%3A%2012px%3B%20color%3A%20%23999%3B%20margin-bottom%3A%204px%5C%22%3E%7B%7B%20result.timestamp%20%7D%7D%20-%20%7B%7B%20result.mode%20%7D%7D%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cdiv%3E%7B%7B%20result.text%20%7D%7D%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3C!--%20%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E%20--%3E%5Cn%20%20%20%20%3Cdiv%20style%3D%5C%22padding%3A%2016px%3B%20background%3A%20%23fffbe6%3B%20border-radius%3A%208px%3B%20border-left%3A%204px%20solid%20%23faad14%5C%22%3E%5Cn%20%20%20%20%20%20%3Ch4%20style%3D%5C%22margin%3A%200%200%208px%200%3B%20color%3A%20%23fa8c16%5C%22%3E%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%3Cul%20style%3D%5C%22margin%3A%200%3B%20padding-left%3A%2020px%3B%20color%3A%20%23666%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cli%3E%3Cstrong%3E%E7%99%BE%E5%BA%A6%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%3A%3C%2Fstrong%3E%20%E9%9C%80%E8%A6%81%E8%BE%93%E5%85%A5%20API%20Key%20%E5%92%8C%20Secret%20Key%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%3Cli%3E%3Cstrong%3E%E9%98%BF%E9%87%8C%E4%BA%91%E4%B8%80%E5%8F%A5%E8%AF%9D%E8%AF%86%E5%88%AB%3A%3C%2Fstrong%3E%20%E9%9C%80%E8%A6%81%E8%BE%93%E5%85%A5%20AppKey%20%E5%92%8C%20Token%EF%BC%8C%E9%80%82%E5%90%88%E7%9F%AD%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%3Cli%3E%3Cstrong%3E%E9%98%BF%E9%87%8C%E4%BA%91%E5%AE%9E%E6%97%B6%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%3A%3C%2Fstrong%3E%20%E9%9C%80%E8%A6%81%E8%BE%93%E5%85%A5%20AppKey%20%E5%92%8C%20Token%EF%BC%8C%E6%94%AF%E6%8C%81%E5%AE%9E%E6%97%B6%E6%B5%81%E5%BC%8F%E8%AF%86%E5%88%AB%E5%92%8C%E4%B8%AD%E9%97%B4%E7%BB%93%E6%9E%9C%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%3Cli%3E%3Cstrong%3E%E6%A8%A1%E6%8B%9F%E6%BC%94%E7%A4%BA%3A%3C%2Fstrong%3E%20%E6%97%A0%E9%9C%80%E7%9C%9F%E5%AE%9E%20API%20%E9%85%8D%E7%BD%AE%EF%BC%8C%E5%8F%AF%E4%BD%93%E9%AA%8C%E5%8A%9F%E8%83%BD%E6%B5%81%E7%A8%8B%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%3Cli%3E%E6%9B%BF%E6%8D%A2%E6%A8%A1%E5%BC%8F%EF%BC%9A%E6%AF%8F%E6%AC%A1%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E4%BC%9A%E8%A6%86%E7%9B%96%E8%BE%93%E5%85%A5%E6%A1%86%E5%86%85%E5%AE%B9%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%3Cli%3E%E8%BF%BD%E5%8A%A0%E6%A8%A1%E5%BC%8F%EF%BC%9A%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E7%BB%93%E6%9E%9C%E4%BC%9A%E8%BF%BD%E5%8A%A0%E5%88%B0%E7%8E%B0%E6%9C%89%E5%86%85%E5%AE%B9%E5%90%8E%E9%9D%A2%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%3Cli%3E%E6%94%AF%E6%8C%81%E9%94%AE%E7%9B%98%E5%92%8C%E8%AF%AD%E9%9F%B3%E6%B7%B7%E5%90%88%E8%BE%93%E5%85%A5%3C%2Fli%3E%5Cn%20%20%20%20%20%20%3C%2Ful%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20ref%2C%20computed%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%5Cn%20%20BaiduSpeechHandler%2C%5Cn%20%20AliyunSpeechHandler%2C%5Cn%20%20AliyunRealtimeSpeechHandler%2C%5Cn%20%20MockSpeechHandler%2C%5Cn%7D%20from%20'.%2FspeechHandlers'%5Cn%5Cn%2F%2F%20%E9%85%8D%E7%BD%AE%E7%8A%B6%E6%80%81%5Cnconst%20provider%20%3D%20ref%3C'baidu'%20%7C%20'aliyun'%20%7C%20'aliyun-realtime'%20%7C%20'mock'%3E('aliyun')%5Cnconst%20baiduApiKey%20%3D%20ref('')%5Cnconst%20baiduSecretKey%20%3D%20ref('')%5Cnconst%20aliyunAppKey%20%3D%20ref('')%5Cnconst%20aliyunToken%20%3D%20ref('')%5Cnconst%20autoReplace%20%3D%20ref(false)%5Cn%5Cn%2F%2F%20%E7%BB%84%E4%BB%B6%E7%8A%B6%E6%80%81%5Cnconst%20inputText%20%3D%20ref('')%5Cnconst%20speechStatus%20%3D%20ref('')%5Cnconst%20interimResult%20%3D%20ref('')%5Cnconst%20errorMessage%20%3D%20ref('')%5Cnconst%20results%20%3D%20ref%3CArray%3C%7B%20text%3A%20string%3B%20timestamp%3A%20string%3B%20mode%3A%20string%20%7D%3E%3E(%5B%5D)%5Cn%5Cn%2F%2F%20%E8%AF%AD%E9%9F%B3%E9%85%8D%E7%BD%AE%20-%20%E4%BD%BF%E7%94%A8%E5%8A%A8%E6%80%81%E8%8E%B7%E5%8F%96%E5%AF%86%E9%92%A5%E7%9A%84%E6%96%B9%E5%BC%8F%5Cnconst%20speechConfig%20%3D%20computed(()%20%3D%3E%20%7B%5Cn%20%20let%20handler%3A%20BaiduSpeechHandler%20%7C%20AliyunSpeechHandler%20%7C%20AliyunRealtimeSpeechHandler%20%7C%20MockSpeechHandler%5Cn%5Cn%20%20switch%20(provider.value)%20%7B%5Cn%20%20%20%20case%20'baidu'%3A%5Cn%20%20%20%20%20%20handler%20%3D%20BaiduSpeechHandler.createWithGetters(%5Cn%20%20%20%20%20%20%20%20()%20%3D%3E%20baiduApiKey.value%2C%5Cn%20%20%20%20%20%20%20%20()%20%3D%3E%20baiduSecretKey.value%2C%5Cn%20%20%20%20%20%20)%5Cn%20%20%20%20%20%20break%5Cn%20%20%20%20case%20'aliyun'%3A%5Cn%20%20%20%20%20%20handler%20%3D%20AliyunSpeechHandler.createWithGetters(%5Cn%20%20%20%20%20%20%20%20()%20%3D%3E%20aliyunAppKey.value%2C%5Cn%20%20%20%20%20%20%20%20()%20%3D%3E%20aliyunToken.value%2C%5Cn%20%20%20%20%20%20)%5Cn%20%20%20%20%20%20break%5Cn%20%20%20%20case%20'aliyun-realtime'%3A%5Cn%20%20%20%20%20%20handler%20%3D%20AliyunRealtimeSpeechHandler.createWithGetters(%5Cn%20%20%20%20%20%20%20%20()%20%3D%3E%20aliyunAppKey.value%2C%5Cn%20%20%20%20%20%20%20%20()%20%3D%3E%20aliyunToken.value%2C%5Cn%20%20%20%20%20%20)%5Cn%20%20%20%20%20%20break%5Cn%20%20%20%20case%20'mock'%3A%5Cn%20%20%20%20default%3A%5Cn%20%20%20%20%20%20handler%20%3D%20new%20MockSpeechHandler()%5Cn%20%20%20%20%20%20break%5Cn%20%20%7D%5Cn%5Cn%20%20return%20%7B%5Cn%20%20%20%20mode%3A%20'custom'%20as%20const%2C%5Cn%20%20%20%20customHandler%3A%20handler%2C%5Cn%20%20%20%20autoReplace%3A%20autoReplace.value%2C%5Cn%20%20%20%20interimResults%3A%20provider.value%20%3D%3D%3D%20'aliyun-realtime'%20%7C%7C%20provider.value%20%3D%3D%3D%20'mock'%2C%5Cn%20%20%7D%5Cn%7D)%5Cn%5Cn%2F%2F%20%E4%BA%8B%E4%BB%B6%E5%A4%84%E7%90%86%5Cnconst%20handleSpeechStart%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20speechStatus.value%20%3D%20'%F0%9F%8E%A4%20%E6%AD%A3%E5%9C%A8%E5%BD%95%E9%9F%B3...'%5Cn%20%20interimResult.value%20%3D%20''%5Cn%20%20errorMessage.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20handleSpeechInterim%20%3D%20(transcript%3A%20string)%20%3D%3E%20%7B%5Cn%20%20interimResult.value%20%3D%20transcript%5Cn%7D%5Cn%5Cnconst%20handleSpeechFinal%20%3D%20(transcript%3A%20string)%20%3D%3E%20%7B%5Cn%20%20speechStatus.value%20%3D%20'%E2%9C%85%20%E8%AF%86%E5%88%AB%E5%AE%8C%E6%88%90'%5Cn%20%20interimResult.value%20%3D%20''%5Cn%5Cn%20%20%2F%2F%20%E8%AE%B0%E5%BD%95%E8%AF%86%E5%88%AB%E7%BB%93%E6%9E%9C%5Cn%20%20results.value.unshift(%7B%5Cn%20%20%20%20text%3A%20transcript%2C%5Cn%20%20%20%20timestamp%3A%20new%20Date().toLocaleTimeString()%2C%5Cn%20%20%20%20mode%3A%20autoReplace.value%20%3F%20'%E6%9B%BF%E6%8D%A2%E6%A8%A1%E5%BC%8F'%20%3A%20'%E8%BF%BD%E5%8A%A0%E6%A8%A1%E5%BC%8F'%2C%5Cn%20%20%7D)%5Cn%5Cn%20%20%2F%2F%20%E9%99%90%E5%88%B6%E5%8E%86%E5%8F%B2%E8%AE%B0%E5%BD%95%E6%95%B0%E9%87%8F%5Cn%20%20if%20(results.value.length%20%3E%2010)%20%7B%5Cn%20%20%20%20results.value%20%3D%20results.value.slice(0%2C%2010)%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20handleSpeechEnd%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20speechStatus.value%20%3D%20''%5Cn%20%20interimResult.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20handleSpeechError%20%3D%20(error%3A%20Error)%20%3D%3E%20%7B%5Cn%20%20speechStatus.value%20%3D%20''%5Cn%20%20interimResult.value%20%3D%20''%5Cn%20%20errorMessage.value%20%3D%20error.message%5Cn%5Cn%20%20%2F%2F%20%E6%A0%B9%E6%8D%AE%E4%B8%8D%E5%90%8C%E6%9C%8D%E5%8A%A1%E5%95%86%E7%BB%99%E5%87%BA%E6%9B%B4%E6%98%8E%E7%A1%AE%E7%9A%84%E6%8F%90%E7%A4%BA%5Cn%20%20if%20(provider.value%20%3D%3D%3D%20'baidu'%20%26%26%20(error.message.includes('API%20Key')%20%7C%7C%20error.message.includes('Secret%20Key')))%20%7B%5Cn%20%20%20%20errorMessage.value%20%3D%20%60%24%7Berror.message%7D%5C%5Cn%E5%BD%93%E5%89%8DAPI%20Key%3A%20%24%7BbaiduApiKey.value%20%3F%20'%E5%B7%B2%E8%AE%BE%E7%BD%AE'%20%3A%20'%E6%9C%AA%E8%AE%BE%E7%BD%AE'%7D%5C%5Cn%E5%BD%93%E5%89%8DSecret%20Key%3A%20%24%7BbaiduSecretKey.value%20%3F%20'%E5%B7%B2%E8%AE%BE%E7%BD%AE'%20%3A%20'%E6%9C%AA%E8%AE%BE%E7%BD%AE'%7D%60%5Cn%20%20%7D%20else%20if%20(%5Cn%20%20%20%20(provider.value%20%3D%3D%3D%20'aliyun'%20%7C%7C%20provider.value%20%3D%3D%3D%20'aliyun-realtime')%20%26%26%5Cn%20%20%20%20(error.message.includes('AppKey')%20%7C%7C%20error.message.includes('Token'))%5Cn%20%20)%20%7B%5Cn%20%20%20%20errorMessage.value%20%3D%20%60%24%7Berror.message%7D%5C%5Cn%E5%BD%93%E5%89%8DAppKey%3A%20%24%7BaliyunAppKey.value%20%3F%20'%E5%B7%B2%E8%AE%BE%E7%BD%AE'%20%3A%20'%E6%9C%AA%E8%AE%BE%E7%BD%AE'%7D%5C%5Cn%E5%BD%93%E5%89%8DToken%3A%20%24%7BaliyunToken.value%20%3F%20'%E5%B7%B2%E8%AE%BE%E7%BD%AE'%20%3A%20'%E6%9C%AA%E8%AE%BE%E7%BD%AE'%7D%60%5Cn%20%20%7D%5Cn%5Cn%20%20%2F%2F%205%E7%A7%92%E5%90%8E%E8%87%AA%E5%8A%A8%E6%B8%85%E9%99%A4%E9%94%99%E8%AF%AF%E4%BF%A1%E6%81%AF%5Cn%20%20setTimeout(()%20%3D%3E%20%7B%5Cn%20%20%20%20errorMessage.value%20%3D%20''%5Cn%20%20%7D%2C%205000)%5Cn%7D%5Cn%5Cnconst%20handleSubmit%20%3D%20(text%3A%20string)%20%3D%3E%20%7B%5Cn%20%20console.log('%E6%8F%90%E4%BA%A4%E5%86%85%E5%AE%B9%3A'%2C%20text)%5Cn%20%20%2F%2F%20%E8%BF%99%E9%87%8C%E5%8F%AF%E4%BB%A5%E5%A4%84%E7%90%86%E6%8F%90%E4%BA%A4%E9%80%BB%E8%BE%91%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%22%7D%2C%22speechHandlers.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fsender%2FspeechHandlers.ts%22%2C%22code%22%3A%22import%20Recorder%20from%20'recorder-core'%5Cnimport%20'recorder-core%2Fsrc%2Fengine%2Fpcm'%5Cnimport%20type%20%7B%20CustomSpeechHandler%2C%20SpeechCallbacks%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cn%2F**%5Cn%20*%20recorder-core%20%E7%9A%84%E9%85%8D%E7%BD%AE%E9%80%89%E9%A1%B9%5Cn%20*%2F%5Cninterface%20RecorderOptions%20%7B%5Cn%20%20type%3A%20'wav'%20%7C%20'mp3'%20%7C%20'pcm'%20%7C%20string%20%2F%2F%20%E6%9C%9F%E6%9C%9B%E7%9A%84%E8%BE%93%E5%87%BA%E6%A0%BC%E5%BC%8F%5Cn%20%20sampleRate%3A%2016000%20%7C%208000%20%7C%20number%20%2F%2F%20%E9%87%87%E6%A0%B7%E7%8E%87%5Cn%20%20bitRate%3A%2016%20%7C%208%20%7C%20number%20%2F%2F%20%E6%AF%94%E7%89%B9%E7%8E%87%5Cn%20%20onProcess%3F%3A%20(buffers%3A%20Float32Array%5B%5D%2C%20powerLevel%3A%20number%2C%20duration%3A%20number%2C%20sampleRate%3A%20number)%20%3D%3E%20void%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20recorder-core%20%E5%AE%9E%E4%BE%8B%E7%9A%84%E6%8E%A5%E5%8F%A3%5Cn%20*%2F%5Cninterface%20IRecorder%20%7B%5Cn%20%20open(success%3A%20()%20%3D%3E%20void%2C%20fail%3A%20(msg%3A%20string%2C%20isUserNotAllow%3A%20boolean)%20%3D%3E%20void)%3A%20void%5Cn%20%20start()%3A%20void%5Cn%20%20stop(success%3A%20(blob%3A%20Blob%2C%20duration%3A%20number)%20%3D%3E%20void%2C%20fail%3A%20(msg%3A%20string)%20%3D%3E%20void)%3A%20void%5Cn%20%20close()%3A%20void%5Cn%20%20support()%3A%20boolean%5Cn%7D%5Cn%5Cninterface%20RecorderStatic%20%7B%5Cn%20%20(options%3A%20RecorderOptions)%3A%20IRecorder%5Cn%7D%5Cn%5Cnconst%20TypedRecorder%20%3D%20Recorder%20as%20RecorderStatic%5Cn%5Cn%2F**%5Cn%20*%20%E7%99%BE%E5%BA%A6%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E5%A4%84%E7%90%86%E5%99%A8%5Cn%20*%20%E9%9B%86%E6%88%90%E7%99%BE%E5%BA%A6AI%E5%BC%80%E6%94%BE%E5%B9%B3%E5%8F%B0%E7%9A%84%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%ABAPI%5Cn%20*%2F%5Cnexport%20class%20BaiduSpeechHandler%20implements%20CustomSpeechHandler%20%7B%5Cn%20%20private%20recorder%3F%3A%20IRecorder%5Cn%20%20private%20callbacks%3F%3A%20SpeechCallbacks%5Cn%20%20private%20apiKey%3A%20string%5Cn%20%20private%20secretKey%3A%20string%5Cn%20%20private%20accessToken%3F%3A%20string%5Cn%20%20private%20apiKeyGetter%3F%3A%20()%20%3D%3E%20string%5Cn%20%20private%20secretKeyGetter%3F%3A%20()%20%3D%3E%20string%5Cn%5Cn%20%20constructor(apiKey%3A%20string%2C%20secretKey%3A%20string)%20%7B%5Cn%20%20%20%20this.apiKey%20%3D%20apiKey%5Cn%20%20%20%20this.secretKey%20%3D%20secretKey%5Cn%20%20%7D%5Cn%5Cn%20%20static%20createWithGetters(apiKeyGetter%3A%20()%20%3D%3E%20string%2C%20secretKeyGetter%3A%20()%20%3D%3E%20string)%3A%20BaiduSpeechHandler%20%7B%5Cn%20%20%20%20const%20instance%20%3D%20new%20BaiduSpeechHandler(''%2C%20'')%5Cn%20%20%20%20instance.apiKeyGetter%20%3D%20apiKeyGetter%5Cn%20%20%20%20instance.secretKeyGetter%20%3D%20secretKeyGetter%5Cn%20%20%20%20return%20instance%5Cn%20%20%7D%5Cn%5Cn%20%20private%20getCurrentApiKey()%3A%20string%20%7B%5Cn%20%20%20%20return%20this.apiKeyGetter%20%3F%20this.apiKeyGetter()%20%3A%20this.apiKey%5Cn%20%20%7D%5Cn%5Cn%20%20private%20getCurrentSecretKey()%3A%20string%20%7B%5Cn%20%20%20%20return%20this.secretKeyGetter%20%3F%20this.secretKeyGetter()%20%3A%20this.secretKey%5Cn%20%20%7D%5Cn%5Cn%20%20async%20start(callbacks%3A%20SpeechCallbacks)%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20this.callbacks%20%3D%20callbacks%5Cn%5Cn%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20if%20(!this.accessToken)%20%7B%5Cn%20%20%20%20%20%20%20%20await%20this.getAccessToken()%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20%2F%2F%20%E5%88%9B%E5%BB%BA%E5%AE%9E%E4%BE%8B%5Cn%20%20%20%20%20%20this.recorder%20%3D%20TypedRecorder(%7B%5Cn%20%20%20%20%20%20%20%20type%3A%20'pcm'%2C%20%2F%2F%20%E7%9B%B4%E6%8E%A5%E6%8C%87%E5%AE%9A%E8%BE%93%E5%87%BA%E6%A0%BC%E5%BC%8F%E4%B8%BA%20pcm%5Cn%20%20%20%20%20%20%20%20sampleRate%3A%2016000%2C%20%2F%2F%20%E7%99%BE%E5%BA%A6%E6%8E%A8%E8%8D%90%E7%9A%84%E9%87%87%E6%A0%B7%E7%8E%87%5Cn%20%20%20%20%20%20%20%20bitRate%3A%2016%2C%20%2F%2F%2016%20bit%5Cn%20%20%20%20%20%20%7D)%5Cn%5Cn%20%20%20%20%20%20%2F%2F%20%E6%89%93%E5%BC%80%E9%BA%A6%E5%85%8B%E9%A3%8E%E5%B9%B6%E5%BC%80%E5%A7%8B%E5%BD%95%E9%9F%B3%5Cn%20%20%20%20%20%20this.recorder.open(%5Cn%20%20%20%20%20%20%20%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20this.recorder%3F.start()%5Cn%20%20%20%20%20%20%20%20%20%20callbacks.onStart()%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20(msg%3A%20string%2C%20isUserNotAllow%3A%20boolean)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20const%20errorMsg%20%3D%20isUserNotAllow%20%3F%20%60%E7%94%A8%E6%88%B7%E6%8B%92%E7%BB%9D%E4%BA%86%E9%BA%A6%E5%85%8B%E9%A3%8E%E6%9D%83%E9%99%90%3A%20%24%7Bmsg%7D%60%20%3A%20%60%E6%97%A0%E6%B3%95%E6%89%93%E5%BC%80%E9%BA%A6%E5%85%8B%E9%A3%8E%3A%20%24%7Bmsg%7D%60%5Cn%20%20%20%20%20%20%20%20%20%20callbacks.onError(new%20Error(errorMsg))%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20)%5Cn%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20callbacks.onError(error%20instanceof%20Error%20%3F%20error%20%3A%20new%20Error('%E7%99%BE%E5%BA%A6%E8%AF%AD%E9%9F%B3%E6%9C%8D%E5%8A%A1%E5%90%AF%E5%8A%A8%E5%A4%B1%E8%B4%A5'))%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20async%20stop()%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20if%20(!this.recorder)%20%7B%5Cn%20%20%20%20%20%20return%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%2F%2F%20%E5%81%9C%E6%AD%A2%E5%BD%95%E9%9F%B3%EF%BC%8C%E5%9C%A8%E5%9B%9E%E8%B0%83%E4%B8%AD%E5%A4%84%E7%90%86%E7%BC%96%E7%A0%81%E5%A5%BD%E7%9A%84%20Blob%5Cn%20%20%20%20this.recorder.stop(%5Cn%20%20%20%20%20%20(blob%3A%20Blob%2C%20duration%3A%20number)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20console.log(%60%E5%BD%95%E9%9F%B3%E6%88%90%E5%8A%9F%EF%BC%8C%E6%A0%BC%E5%BC%8F%3A%20%24%7Bblob.type%7D%EF%BC%8C%E6%97%B6%E9%95%BF%3A%20%24%7Bduration%7Dms%60%2C%20blob)%5Cn%5Cn%20%20%20%20%20%20%20%20%2F%2F%20%E5%B0%86%E6%A0%BC%E5%BC%8F%E6%AD%A3%E7%A1%AE%E7%9A%84%20Blob%20%E4%BC%A0%E9%80%92%E7%BB%99%E5%A4%84%E7%90%86%E5%87%BD%E6%95%B0%5Cn%20%20%20%20%20%20%20%20this.processWithBaiduAPI(blob)%5Cn%5Cn%20%20%20%20%20%20%20%20this.closeRecorder()%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20(msg%3A%20string)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20this.callbacks%3F.onError(new%20Error(%60%E5%BD%95%E9%9F%B3%E5%A4%B1%E8%B4%A5%3A%20%24%7Bmsg%7D%60))%5Cn%20%20%20%20%20%20%20%20this.closeRecorder()%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20)%5Cn%20%20%7D%5Cn%5Cn%20%20isSupported()%3A%20boolean%20%7B%5Cn%20%20%20%20return%20true%5Cn%20%20%7D%5Cn%5Cn%20%20%2F**%5Cn%20%20%20*%20%E5%AE%89%E5%85%A8%E5%9C%B0%E5%85%B3%E9%97%AD%E5%92%8C%E6%B8%85%E7%90%86%20recorder%20%E5%AE%9E%E4%BE%8B%5Cn%20%20%20*%2F%5Cn%20%20private%20closeRecorder()%3A%20void%20%7B%5Cn%20%20%20%20if%20(this.recorder)%20%7B%5Cn%20%20%20%20%20%20this.recorder.close()%5Cn%20%20%20%20%20%20this.recorder%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20private%20async%20getAccessToken()%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20const%20currentApiKey%20%3D%20this.getCurrentApiKey()%5Cn%20%20%20%20const%20currentSecretKey%20%3D%20this.getCurrentSecretKey()%5Cn%5Cn%20%20%20%20%2F%2F%20%E5%9C%A8%E5%BC%80%E5%8F%91%E7%8E%AF%E5%A2%83%E4%BD%BF%E7%94%A8%E4%BB%A3%E7%90%86%EF%BC%8C%E7%94%9F%E4%BA%A7%E7%8E%AF%E5%A2%83%E4%BD%BF%E7%94%A8%E7%9B%B4%E8%BF%9E%5Cn%20%20%20%20const%20isDev%20%3D%20window.location.hostname%20%3D%3D%3D%20'localhost'%20%7C%7C%20window.location.hostname%20%3D%3D%3D%20'127.0.0.1'%5Cn%20%20%20%20const%20url%20%3D%20isDev%20%3F%20'%2Fapi%2Fbaidu%2Foauth%2F2.0%2Ftoken'%20%3A%20'https%3A%2F%2Faip.baidubce.com%2Foauth%2F2.0%2Ftoken'%5Cn%5Cn%20%20%20%20const%20formData%20%3D%20new%20URLSearchParams()%5Cn%20%20%20%20formData.append('grant_type'%2C%20'client_credentials')%5Cn%20%20%20%20formData.append('client_id'%2C%20currentApiKey)%5Cn%20%20%20%20formData.append('client_secret'%2C%20currentSecretKey)%5Cn%5Cn%20%20%20%20const%20response%20%3D%20await%20fetch(url%2C%20%7B%5Cn%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20headers%3A%20%7B%20'Content-Type'%3A%20'application%2Fx-www-form-urlencoded'%20%7D%2C%5Cn%20%20%20%20%20%20body%3A%20formData.toString()%2C%5Cn%20%20%20%20%7D)%5Cn%5Cn%20%20%20%20const%20data%20%3D%20await%20response.json()%5Cn%20%20%20%20if%20(data.access_token)%20%7B%5Cn%20%20%20%20%20%20this.accessToken%20%3D%20data.access_token%5Cn%20%20%20%20%7D%20else%20%7B%5Cn%20%20%20%20%20%20throw%20new%20Error(data.error_description%20%7C%7C%20'%E8%8E%B7%E5%8F%96%E8%AE%BF%E9%97%AE%E4%BB%A4%E7%89%8C%E5%A4%B1%E8%B4%A5')%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20%2F%2F%20%E5%A4%84%E7%90%86%20Blob%5Cn%20%20private%20async%20processWithBaiduAPI(audioBlob%3A%20Blob)%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20if%20(!this.callbacks%20%7C%7C%20!this.accessToken)%20return%5Cn%5Cn%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20const%20base64Audio%20%3D%20await%20this.blobToBase64(audioBlob)%5Cn%5Cn%20%20%20%20%20%20%2F%2F%20%E5%9C%A8%E5%BC%80%E5%8F%91%E7%8E%AF%E5%A2%83%E4%BD%BF%E7%94%A8%E4%BB%A3%E7%90%86%EF%BC%8C%E7%94%9F%E4%BA%A7%E7%8E%AF%E5%A2%83%E4%BD%BF%E7%94%A8%E7%9B%B4%E8%BF%9E%5Cn%20%20%20%20%20%20const%20isDev%20%3D%20window.location.hostname%20%3D%3D%3D%20'localhost'%20%7C%7C%20window.location.hostname%20%3D%3D%3D%20'127.0.0.1'%5Cn%20%20%20%20%20%20const%20url%20%3D%20isDev%20%3F%20'%2Fapi%2Fserver%2Fserver_api'%20%3A%20'https%3A%2F%2Fvop.baidu.com%2Fserver_api'%5Cn%5Cn%20%20%20%20%20%20const%20response%20%3D%20await%20fetch(url%2C%20%7B%5Cn%20%20%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20%20%20headers%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20'Content-Type'%3A%20'application%2Fjson'%2C%5Cn%20%20%20%20%20%20%20%20%20%20Accept%3A%20'application%2Fjson'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20body%3A%20JSON.stringify(%7B%5Cn%20%20%20%20%20%20%20%20%20%20format%3A%20'pcm'%2C%5Cn%20%20%20%20%20%20%20%20%20%20rate%3A%2016000%2C%5Cn%20%20%20%20%20%20%20%20%20%20channel%3A%201%2C%5Cn%20%20%20%20%20%20%20%20%20%20cuid%3A%20'V9yRZ6nNWlJPbqrxKBk1Xng2CmvzeupQ'%2C%5Cn%20%20%20%20%20%20%20%20%20%20token%3A%20this.accessToken%2C%5Cn%20%20%20%20%20%20%20%20%20%20speech%3A%20base64Audio%2C%5Cn%20%20%20%20%20%20%20%20%20%20len%3A%20audioBlob.size%2C%5Cn%20%20%20%20%20%20%20%20%7D)%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%5Cn%20%20%20%20%20%20const%20result%20%3D%20await%20response.json()%5Cn%5Cn%20%20%20%20%20%20if%20(result.err_no%20%3D%3D%3D%200%20%26%26%20result.result%3F.length%20%3E%200)%20%7B%5Cn%20%20%20%20%20%20%20%20const%20transcript%20%3D%20result.result%5B0%5D%5Cn%20%20%20%20%20%20%20%20this.callbacks.onFinal(transcript)%5Cn%20%20%20%20%20%20%20%20this.callbacks.onEnd(transcript)%5Cn%20%20%20%20%20%20%7D%20else%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error(result.err_msg%20%7C%7C%20%60%E8%AF%86%E5%88%AB%E5%A4%B1%E8%B4%A5%EF%BC%8C%E9%94%99%E8%AF%AF%E7%A0%81%3A%20%24%7Bresult.err_no%7D%60)%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20this.callbacks.onError(error%20instanceof%20Error%20%3F%20error%20%3A%20new%20Error('%E7%99%BE%E5%BA%A6%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E5%A4%B1%E8%B4%A5'))%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20private%20blobToBase64(blob%3A%20Blob)%3A%20Promise%3Cstring%3E%20%7B%5Cn%20%20%20%20return%20new%20Promise((resolve%2C%20reject)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20const%20reader%20%3D%20new%20FileReader()%5Cn%20%20%20%20%20%20reader.onload%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20const%20base64%20%3D%20(reader.result%20as%20string).split('%2C')%5B1%5D%5Cn%20%20%20%20%20%20%20%20resolve(base64)%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20reader.onerror%20%3D%20reject%5Cn%20%20%20%20%20%20reader.readAsDataURL(blob)%5Cn%20%20%20%20%7D)%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20%E7%AE%80%E5%8D%95%E7%9A%84%E6%A8%A1%E6%8B%9F%E8%AF%AD%E9%9F%B3%E5%A4%84%E7%90%86%E5%99%A8%5Cn%20*%20%E7%94%A8%E4%BA%8E%E6%B5%8B%E8%AF%95%E5%92%8C%E6%BC%94%E7%A4%BA%5Cn%20*%2F%5Cnexport%20class%20MockSpeechHandler%20implements%20CustomSpeechHandler%20%7B%5Cn%20%20private%20timer%3F%3A%20ReturnType%3Ctypeof%20setInterval%3E%5Cn%20%20private%20callbacks%3F%3A%20SpeechCallbacks%5Cn%5Cn%20%20start(callbacks%3A%20SpeechCallbacks)%3A%20void%20%7B%5Cn%20%20%20%20this.callbacks%20%3D%20callbacks%5Cn%5Cn%20%20%20%20%2F%2F%20%E7%AB%8B%E5%8D%B3%E8%A7%A6%E5%8F%91%E5%BC%80%E5%A7%8B%5Cn%20%20%20%20callbacks.onStart()%5Cn%5Cn%20%20%20%20%2F%2F%20%E6%A8%A1%E6%8B%9F%E8%AF%86%E5%88%AB%E8%BF%87%E7%A8%8B%5Cn%20%20%20%20let%20step%20%3D%200%5Cn%20%20%20%20const%20steps%20%3D%20%5B'%E6%AD%A3%E5%9C%A8'%2C%20'%E6%AD%A3%E5%9C%A8%E8%AF%86%E5%88%AB'%2C%20'%E6%AD%A3%E5%9C%A8%E8%AF%86%E5%88%AB%E8%AF%AD%E9%9F%B3'%2C%20'%E6%AD%A3%E5%9C%A8%E8%AF%86%E5%88%AB%E8%AF%AD%E9%9F%B3%E5%86%85%E5%AE%B9'%5D%5Cn%5Cn%20%20%20%20this.timer%20%3D%20setInterval(()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20if%20(step%20%3C%20steps.length)%20%7B%5Cn%20%20%20%20%20%20%20%20callbacks.onInterim(steps%5Bstep%5D)%5Cn%20%20%20%20%20%20%20%20step%2B%2B%5Cn%20%20%20%20%20%20%7D%20else%20%7B%5Cn%20%20%20%20%20%20%20%20%2F%2F%20%E5%AE%8C%E6%88%90%E8%AF%86%E5%88%AB%5Cn%20%20%20%20%20%20%20%20const%20finalResult%20%3D%20'%E8%BF%99%E6%98%AF%E4%B8%80%E4%B8%AA%E6%A8%A1%E6%8B%9F%E7%9A%84%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E7%BB%93%E6%9E%9C'%5Cn%20%20%20%20%20%20%20%20callbacks.onFinal(finalResult)%5Cn%20%20%20%20%20%20%20%20callbacks.onEnd(finalResult)%5Cn%20%20%20%20%20%20%20%20this.cleanup()%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%2C%20500)%5Cn%20%20%7D%5Cn%5Cn%20%20stop()%3A%20void%20%7B%5Cn%20%20%20%20if%20(this.callbacks)%20%7B%5Cn%20%20%20%20%20%20this.callbacks.onEnd()%5Cn%20%20%20%20%7D%5Cn%20%20%20%20this.cleanup()%5Cn%20%20%7D%5Cn%5Cn%20%20isSupported()%3A%20boolean%20%7B%5Cn%20%20%20%20return%20true%20%2F%2F%20%E6%A8%A1%E6%8B%9F%E5%A4%84%E7%90%86%E5%99%A8%E6%80%BB%E6%98%AF%E6%94%AF%E6%8C%81%5Cn%20%20%7D%5Cn%5Cn%20%20private%20cleanup()%3A%20void%20%7B%5Cn%20%20%20%20if%20(this.timer)%20%7B%5Cn%20%20%20%20%20%20clearInterval(this.timer)%5Cn%20%20%20%20%20%20this.timer%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20%E9%98%BF%E9%87%8C%E4%BA%91%E4%B8%80%E5%8F%A5%E8%AF%9D%E8%AF%86%E5%88%AB%E5%A4%84%E7%90%86%E5%99%A8%5Cn%20*%20%E4%BD%BF%E7%94%A8%E9%98%BF%E9%87%8C%E4%BA%91%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%20REST%20API%5Cn%20*%2F%5Cnexport%20class%20AliyunSpeechHandler%20implements%20CustomSpeechHandler%20%7B%5Cn%20%20private%20recorder%3F%3A%20IRecorder%5Cn%20%20private%20callbacks%3F%3A%20SpeechCallbacks%5Cn%20%20private%20appKey%3A%20string%5Cn%20%20private%20token%3A%20string%5Cn%20%20private%20appKeyGetter%3F%3A%20()%20%3D%3E%20string%5Cn%20%20private%20tokenGetter%3F%3A%20()%20%3D%3E%20string%5Cn%5Cn%20%20constructor(appKey%3A%20string%2C%20token%3A%20string)%20%7B%5Cn%20%20%20%20this.appKey%20%3D%20appKey%5Cn%20%20%20%20this.token%20%3D%20token%5Cn%20%20%7D%5Cn%5Cn%20%20static%20createWithGetters(appKeyGetter%3A%20()%20%3D%3E%20string%2C%20tokenGetter%3A%20()%20%3D%3E%20string)%3A%20AliyunSpeechHandler%20%7B%5Cn%20%20%20%20const%20instance%20%3D%20new%20AliyunSpeechHandler(''%2C%20'')%5Cn%20%20%20%20instance.appKeyGetter%20%3D%20appKeyGetter%5Cn%20%20%20%20instance.tokenGetter%20%3D%20tokenGetter%5Cn%20%20%20%20return%20instance%5Cn%20%20%7D%5Cn%5Cn%20%20private%20getCurrentAppKey()%3A%20string%20%7B%5Cn%20%20%20%20return%20this.appKeyGetter%20%3F%20this.appKeyGetter()%20%3A%20this.appKey%5Cn%20%20%7D%5Cn%5Cn%20%20private%20getCurrentToken()%3A%20string%20%7B%5Cn%20%20%20%20return%20this.tokenGetter%20%3F%20this.tokenGetter()%20%3A%20this.token%5Cn%20%20%7D%5Cn%5Cn%20%20async%20start(callbacks%3A%20SpeechCallbacks)%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20this.callbacks%20%3D%20callbacks%5Cn%5Cn%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20this.recorder%20%3D%20TypedRecorder(%7B%5Cn%20%20%20%20%20%20%20%20type%3A%20'pcm'%2C%5Cn%20%20%20%20%20%20%20%20sampleRate%3A%2016000%2C%5Cn%20%20%20%20%20%20%20%20bitRate%3A%2016%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%5Cn%20%20%20%20%20%20this.recorder.open(%5Cn%20%20%20%20%20%20%20%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20this.recorder%3F.start()%5Cn%20%20%20%20%20%20%20%20%20%20callbacks.onStart()%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20(msg%3A%20string%2C%20isUserNotAllow%3A%20boolean)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20const%20errorMsg%20%3D%20isUserNotAllow%20%3F%20%60%E7%94%A8%E6%88%B7%E6%8B%92%E7%BB%9D%E4%BA%86%E9%BA%A6%E5%85%8B%E9%A3%8E%E6%9D%83%E9%99%90%3A%20%24%7Bmsg%7D%60%20%3A%20%60%E6%97%A0%E6%B3%95%E6%89%93%E5%BC%80%E9%BA%A6%E5%85%8B%E9%A3%8E%3A%20%24%7Bmsg%7D%60%5Cn%20%20%20%20%20%20%20%20%20%20callbacks.onError(new%20Error(errorMsg))%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20)%5Cn%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20callbacks.onError(error%20instanceof%20Error%20%3F%20error%20%3A%20new%20Error('%E9%98%BF%E9%87%8C%E4%BA%91%E8%AF%AD%E9%9F%B3%E6%9C%8D%E5%8A%A1%E5%90%AF%E5%8A%A8%E5%A4%B1%E8%B4%A5'))%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20async%20stop()%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20if%20(!this.recorder)%20%7B%5Cn%20%20%20%20%20%20return%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20this.recorder.stop(%5Cn%20%20%20%20%20%20(blob%3A%20Blob%2C%20duration%3A%20number)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20console.log(%60%E5%BD%95%E9%9F%B3%E6%88%90%E5%8A%9F%EF%BC%8C%E6%A0%BC%E5%BC%8F%3A%20%24%7Bblob.type%7D%EF%BC%8C%E6%97%B6%E9%95%BF%3A%20%24%7Bduration%7Dms%60%2C%20blob)%5Cn%20%20%20%20%20%20%20%20this.processWithAliyunAPI(blob)%5Cn%20%20%20%20%20%20%20%20this.closeRecorder()%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20(msg%3A%20string)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20this.callbacks%3F.onError(new%20Error(%60%E5%BD%95%E9%9F%B3%E5%A4%B1%E8%B4%A5%3A%20%24%7Bmsg%7D%60))%5Cn%20%20%20%20%20%20%20%20this.closeRecorder()%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20)%5Cn%20%20%7D%5Cn%5Cn%20%20isSupported()%3A%20boolean%20%7B%5Cn%20%20%20%20return%20true%5Cn%20%20%7D%5Cn%5Cn%20%20private%20closeRecorder()%3A%20void%20%7B%5Cn%20%20%20%20if%20(this.recorder)%20%7B%5Cn%20%20%20%20%20%20this.recorder.close()%5Cn%20%20%20%20%20%20this.recorder%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20private%20async%20processWithAliyunAPI(audioBlob%3A%20Blob)%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20if%20(!this.callbacks)%20return%5Cn%5Cn%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20const%20currentAppKey%20%3D%20this.getCurrentAppKey()%5Cn%20%20%20%20%20%20const%20currentToken%20%3D%20this.getCurrentToken()%5Cn%5Cn%20%20%20%20%20%20%2F%2F%20%E5%9C%A8%E5%BC%80%E5%8F%91%E7%8E%AF%E5%A2%83%E4%BD%BF%E7%94%A8%E4%BB%A3%E7%90%86%EF%BC%8C%E7%94%9F%E4%BA%A7%E7%8E%AF%E5%A2%83%E4%BD%BF%E7%94%A8%E7%9B%B4%E8%BF%9E%5Cn%20%20%20%20%20%20const%20isDev%20%3D%20window.location.hostname%20%3D%3D%3D%20'localhost'%20%7C%7C%20window.location.hostname%20%3D%3D%3D%20'127.0.0.1'%5Cn%20%20%20%20%20%20const%20baseUrl%20%3D%20isDev%20%3F%20'%2Fapi%2Faliyun%2Fasr'%20%3A%20'https%3A%2F%2Fnls-gateway-cn-shanghai.aliyuncs.com%2Fstream%2Fv1%2Fasr'%5Cn%5Cn%20%20%20%20%20%20const%20params%20%3D%20new%20URLSearchParams(%7B%5Cn%20%20%20%20%20%20%20%20appkey%3A%20currentAppKey%2C%5Cn%20%20%20%20%20%20%20%20format%3A%20'pcm'%2C%5Cn%20%20%20%20%20%20%20%20sample_rate%3A%20'16000'%2C%5Cn%20%20%20%20%20%20%20%20enable_punctuation_prediction%3A%20'true'%2C%5Cn%20%20%20%20%20%20%20%20enable_inverse_text_normalization%3A%20'true'%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%5Cn%20%20%20%20%20%20const%20response%20%3D%20await%20fetch(%60%24%7BbaseUrl%7D%3F%24%7Bparams.toString()%7D%60%2C%20%7B%5Cn%20%20%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20%20%20headers%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20'Content-Type'%3A%20'application%2Foctet-stream'%2C%5Cn%20%20%20%20%20%20%20%20%20%20'X-NLS-Token'%3A%20currentToken%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20body%3A%20audioBlob%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%5Cn%20%20%20%20%20%20if%20(!response.ok)%20%7B%5Cn%20%20%20%20%20%20%20%20const%20errorBody%20%3D%20await%20response.text()%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error(%60HTTP%20%E9%94%99%E8%AF%AF!%20%E7%8A%B6%E6%80%81%E7%A0%81%3A%20%24%7Bresponse.status%7D%2C%20%E5%93%8D%E5%BA%94%3A%20%24%7BerrorBody%7D%60)%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20const%20result%20%3D%20await%20response.json()%5Cn%5Cn%20%20%20%20%20%20if%20(result.status%20%3D%3D%3D%2020000000%20%26%26%20result.result)%20%7B%5Cn%20%20%20%20%20%20%20%20const%20transcript%20%3D%20result.result%5Cn%20%20%20%20%20%20%20%20this.callbacks.onFinal(transcript)%5Cn%20%20%20%20%20%20%20%20this.callbacks.onEnd(transcript)%5Cn%20%20%20%20%20%20%7D%20else%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error(result.message%20%7C%7C%20%60%E8%AF%86%E5%88%AB%E5%A4%B1%E8%B4%A5%EF%BC%8C%E7%8A%B6%E6%80%81%E7%A0%81%3A%20%24%7Bresult.status%7D%60)%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20this.callbacks.onError(error%20instanceof%20Error%20%3F%20error%20%3A%20new%20Error('%E9%98%BF%E9%87%8C%E4%BA%91%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E5%A4%B1%E8%B4%A5'))%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20%E9%98%BF%E9%87%8C%E4%BA%91%E5%AE%9E%E6%97%B6%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E5%A4%84%E7%90%86%E5%99%A8%5Cn%20*%20%E4%BD%BF%E7%94%A8%20WebSocket%20%E8%BF%9B%E8%A1%8C%E6%B5%81%E5%BC%8F%E8%AF%86%E5%88%AB%5Cn%20*%2F%5Cnexport%20class%20AliyunRealtimeSpeechHandler%20implements%20CustomSpeechHandler%20%7B%5Cn%20%20private%20ws%3F%3A%20WebSocket%5Cn%20%20private%20audioContext%3F%3A%20AudioContext%5Cn%20%20private%20scriptProcessor%3F%3A%20ScriptProcessorNode%5Cn%20%20private%20audioStream%3F%3A%20MediaStream%5Cn%20%20private%20callbacks%3F%3A%20SpeechCallbacks%5Cn%20%20private%20appKey%3A%20string%5Cn%20%20private%20token%3A%20string%5Cn%20%20private%20appKeyGetter%3F%3A%20()%20%3D%3E%20string%5Cn%20%20private%20tokenGetter%3F%3A%20()%20%3D%3E%20string%5Cn%5Cn%20%20constructor(appKey%3A%20string%2C%20token%3A%20string)%20%7B%5Cn%20%20%20%20this.appKey%20%3D%20appKey%5Cn%20%20%20%20this.token%20%3D%20token%5Cn%20%20%7D%5Cn%5Cn%20%20static%20createWithGetters(appKeyGetter%3A%20()%20%3D%3E%20string%2C%20tokenGetter%3A%20()%20%3D%3E%20string)%3A%20AliyunRealtimeSpeechHandler%20%7B%5Cn%20%20%20%20const%20instance%20%3D%20new%20AliyunRealtimeSpeechHandler(''%2C%20'')%5Cn%20%20%20%20instance.appKeyGetter%20%3D%20appKeyGetter%5Cn%20%20%20%20instance.tokenGetter%20%3D%20tokenGetter%5Cn%20%20%20%20return%20instance%5Cn%20%20%7D%5Cn%5Cn%20%20private%20getCurrentAppKey()%3A%20string%20%7B%5Cn%20%20%20%20return%20this.appKeyGetter%20%3F%20this.appKeyGetter()%20%3A%20this.appKey%5Cn%20%20%7D%5Cn%5Cn%20%20private%20getCurrentToken()%3A%20string%20%7B%5Cn%20%20%20%20return%20this.tokenGetter%20%3F%20this.tokenGetter()%20%3A%20this.token%5Cn%20%20%7D%5Cn%5Cn%20%20private%20generateUUID()%3A%20string%20%7B%5Cn%20%20%20%20%2F%2F%20%E4%BD%BF%E7%94%A8%20crypto.randomUUID()%20%E7%94%9F%E6%88%90%E6%A0%87%E5%87%86%20UUID%EF%BC%8C%E7%84%B6%E5%90%8E%E7%A7%BB%E9%99%A4%E8%BF%9E%E5%AD%97%E7%AC%A6%E5%BE%97%E5%88%B032%E4%BD%8D%E5%AD%97%E7%AC%A6%E4%B8%B2%5Cn%20%20%20%20return%20crypto.randomUUID().replace(%2F-%2Fg%2C%20'')%5Cn%20%20%7D%5Cn%5Cn%20%20isSupported()%3A%20boolean%20%7B%5Cn%20%20%20%20return%20true%5Cn%20%20%7D%5Cn%5Cn%20%20async%20start(callbacks%3A%20SpeechCallbacks)%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20if%20(!this.isSupported())%20%7B%5Cn%20%20%20%20%20%20callbacks.onError(new%20Error('%E5%BD%93%E5%89%8D%E6%B5%8F%E8%A7%88%E5%99%A8%E4%B8%8D%E6%94%AF%E6%8C%81%E5%AE%9E%E6%97%B6%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E6%89%80%E9%9C%80%E7%9A%84%E5%8A%9F%E8%83%BD'))%5Cn%20%20%20%20%20%20return%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20this.callbacks%20%3D%20callbacks%5Cn%20%20%20%20this.setupWebSocket()%5Cn%20%20%7D%5Cn%5Cn%20%20private%20setupWebSocket()%3A%20void%20%7B%5Cn%20%20%20%20const%20currentToken%20%3D%20this.getCurrentToken()%5Cn%20%20%20%20%2F%2F%20%E5%9C%A8%E5%BC%80%E5%8F%91%E7%8E%AF%E5%A2%83%E4%BD%BF%E7%94%A8%E4%BB%A3%E7%90%86%EF%BC%8C%E7%94%9F%E4%BA%A7%E7%8E%AF%E5%A2%83%E4%BD%BF%E7%94%A8%E7%9B%B4%E8%BF%9E%5Cn%20%20%20%20const%20isDev%20%3D%20window.location.hostname%20%3D%3D%3D%20'localhost'%20%7C%7C%20window.location.hostname%20%3D%3D%3D%20'127.0.0.1'%5Cn%20%20%20%20const%20socketUrl%20%3D%20isDev%5Cn%20%20%20%20%20%20%3F%20%60ws%3A%2F%2F%24%7Bwindow.location.host%7D%2Fapi%2Faliyun%2Fws%3Ftoken%3D%24%7BcurrentToken%7D%60%5Cn%20%20%20%20%20%20%3A%20%60wss%3A%2F%2Fnls-gateway.cn-shanghai.aliyuncs.com%2Fws%2Fv1%3Ftoken%3D%24%7BcurrentToken%7D%60%5Cn%5Cn%20%20%20%20this.ws%20%3D%20new%20WebSocket(socketUrl)%5Cn%5Cn%20%20%20%20this.ws.onopen%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%2F%2F%20%E8%BF%9E%E6%8E%A5%E6%88%90%E5%8A%9F%E5%90%8E%EF%BC%8C%E5%8F%91%E9%80%81%E5%BC%80%E5%A7%8B%E8%AF%86%E5%88%AB%E6%8C%87%E4%BB%A4%5Cn%20%20%20%20%20%20const%20startMessage%20%3D%20%7B%5Cn%20%20%20%20%20%20%20%20header%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20appkey%3A%20this.getCurrentAppKey()%2C%5Cn%20%20%20%20%20%20%20%20%20%20namespace%3A%20'SpeechTranscriber'%2C%5Cn%20%20%20%20%20%20%20%20%20%20name%3A%20'StartTranscription'%2C%5Cn%20%20%20%20%20%20%20%20%20%20task_id%3A%20this.generateUUID()%2C%5Cn%20%20%20%20%20%20%20%20%20%20message_id%3A%20this.generateUUID()%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20payload%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20format%3A%20'pcm'%2C%5Cn%20%20%20%20%20%20%20%20%20%20sample_rate%3A%2016000%2C%5Cn%20%20%20%20%20%20%20%20%20%20enable_intermediate_result%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20%20%20enable_punctuation_prediction%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20%20%20enable_inverse_text_normalization%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20this.ws%3F.send(JSON.stringify(startMessage))%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20this.ws.onmessage%20%3D%20(event)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20const%20message%20%3D%20JSON.parse(event.data)%5Cn%5Cn%20%20%20%20%20%20switch%20(message.header.name)%20%7B%5Cn%20%20%20%20%20%20%20%20case%20'TranscriptionStarted'%3A%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E6%9C%8D%E5%8A%A1%E7%AB%AF%E5%87%86%E5%A4%87%E5%B0%B1%E7%BB%AA%EF%BC%8C%E5%BC%80%E5%A7%8B%E6%8D%95%E6%8D%89%E5%92%8C%E5%8F%91%E9%80%81%E9%9F%B3%E9%A2%91%5Cn%20%20%20%20%20%20%20%20%20%20this.callbacks%3F.onStart()%5Cn%20%20%20%20%20%20%20%20%20%20this.startAudioProcessing()%5Cn%20%20%20%20%20%20%20%20%20%20break%5Cn%20%20%20%20%20%20%20%20case%20'TranscriptionResultChanged'%3A%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E4%B8%AD%E9%97%B4%E8%AF%86%E5%88%AB%E7%BB%93%E6%9E%9C%5Cn%20%20%20%20%20%20%20%20%20%20if%20(message.payload.result)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20this.callbacks%3F.onInterim(message.payload.result)%5Cn%20%20%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%20%20%20%20break%5Cn%20%20%20%20%20%20%20%20case%20'SentenceEnd'%3A%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E5%8F%A5%E5%AD%90%E7%BB%93%E6%9D%9F%EF%BC%8C%E6%9C%80%E7%BB%88%E7%BB%93%E6%9E%9C%5Cn%20%20%20%20%20%20%20%20%20%20if%20(message.payload.result)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20this.callbacks%3F.onFinal(message.payload.result)%5Cn%20%20%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%20%20%20%20break%5Cn%20%20%20%20%20%20%20%20case%20'TranscriptionCompleted'%3A%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E8%AF%86%E5%88%AB%E5%AE%8C%E6%88%90%5Cn%20%20%20%20%20%20%20%20%20%20this.callbacks%3F.onEnd()%5Cn%20%20%20%20%20%20%20%20%20%20break%5Cn%20%20%20%20%20%20%20%20case%20'TaskFailed'%3A%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E4%BB%BB%E5%8A%A1%E5%A4%B1%E8%B4%A5%5Cn%20%20%20%20%20%20%20%20%20%20this.callbacks%3F.onError(new%20Error(%60%E4%BB%BB%E5%8A%A1%E5%A4%B1%E8%B4%A5%3A%20%24%7Bmessage.payload.status_text%20%7C%7C%20'%E6%9C%AA%E7%9F%A5%E9%94%99%E8%AF%AF'%7D%60))%5Cn%20%20%20%20%20%20%20%20%20%20this.cleanup()%5Cn%20%20%20%20%20%20%20%20%20%20break%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20this.ws.onerror%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20this.callbacks%3F.onError(new%20Error('WebSocket%20%E8%BF%9E%E6%8E%A5%E5%8F%91%E7%94%9F%E9%94%99%E8%AF%AF'))%5Cn%20%20%20%20%20%20this.cleanup()%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20this.ws.onclose%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20this.cleanup()%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20private%20async%20startAudioProcessing()%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20%2F%2F%20%E8%8E%B7%E5%8F%96%E9%9F%B3%E9%A2%91%E6%B5%81%5Cn%20%20%20%20%20%20this.audioStream%20%3D%20await%20navigator.mediaDevices.getUserMedia(%7B%20audio%3A%20true%20%7D)%5Cn%5Cn%20%20%20%20%20%20%2F%2F%20%E5%88%9B%E5%BB%BA%E9%9F%B3%E9%A2%91%E4%B8%8A%E4%B8%8B%E6%96%87%5Cn%20%20%20%20%20%20const%20AudioContextClass%20%3D%5Cn%20%20%20%20%20%20%20%20window.AudioContext%20%7C%7C%5Cn%20%20%20%20%20%20%20%20(window%20as%20typeof%20window%20%26%20%7B%20webkitAudioContext%3F%3A%20typeof%20AudioContext%20%7D).webkitAudioContext%5Cn%20%20%20%20%20%20if%20(!AudioContextClass)%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error('AudioContext%20not%20supported')%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20this.audioContext%20%3D%20new%20AudioContextClass(%7B%20sampleRate%3A%2016000%20%7D)%5Cn%5Cn%20%20%20%20%20%20%2F%2F%20%E5%88%9B%E5%BB%BA%E8%84%9A%E6%9C%AC%E5%A4%84%E7%90%86%E5%99%A8%5Cn%20%20%20%20%20%20this.scriptProcessor%20%3D%20this.audioContext.createScriptProcessor(2048%2C%201%2C%201)%5Cn%5Cn%20%20%20%20%20%20this.scriptProcessor.onaudioprocess%20%3D%20(event)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20const%20inputData%20%3D%20event.inputBuffer.getChannelData(0)%5Cn%20%20%20%20%20%20%20%20%2F%2F%20%E8%BD%AC%E6%8D%A2%E4%B8%BA16-bit%20PCM%E6%A0%BC%E5%BC%8F%5Cn%20%20%20%20%20%20%20%20const%20pcmData%20%3D%20new%20Int16Array(inputData.length)%5Cn%20%20%20%20%20%20%20%20for%20(let%20i%20%3D%200%3B%20i%20%3C%20inputData.length%3B%20i%2B%2B)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20pcmData%5Bi%5D%20%3D%20Math.max(-1%2C%20Math.min(1%2C%20inputData%5Bi%5D))%20*%200x7fff%5Cn%20%20%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20%20%20if%20(this.ws%3F.readyState%20%3D%3D%3D%20WebSocket.OPEN)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20this.ws.send(pcmData.buffer)%5Cn%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20const%20source%20%3D%20this.audioContext.createMediaStreamSource(this.audioStream)%5Cn%20%20%20%20%20%20source.connect(this.scriptProcessor)%5Cn%20%20%20%20%20%20this.scriptProcessor.connect(this.audioContext.destination)%5Cn%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20this.callbacks%3F.onError(error%20instanceof%20Error%20%3F%20error%20%3A%20new%20Error('%E6%97%A0%E6%B3%95%E5%90%AF%E5%8A%A8%E9%BA%A6%E5%85%8B%E9%A3%8E%E6%88%96%E9%9F%B3%E9%A2%91%E5%A4%84%E7%90%86'))%5Cn%20%20%20%20%20%20this.cleanup()%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20stop()%3A%20void%20%7B%5Cn%20%20%20%20%2F%2F%20%E4%B8%BB%E5%8A%A8%E5%81%9C%E6%AD%A2%E6%97%B6%EF%BC%8C%E5%85%88%E8%A7%A6%E5%8F%91%20onEnd%20%E5%9B%9E%E8%B0%83%EF%BC%8C%E7%84%B6%E5%90%8E%E6%B8%85%E7%90%86%E8%B5%84%E6%BA%90%5Cn%20%20%20%20if%20(this.callbacks)%20%7B%5Cn%20%20%20%20%20%20this.callbacks.onEnd()%5Cn%20%20%20%20%7D%5Cn%20%20%20%20this.cleanup()%5Cn%20%20%7D%5Cn%5Cn%20%20private%20cleanup()%3A%20void%20%7B%5Cn%20%20%20%20%2F%2F%20%E5%81%9C%E6%AD%A2%E9%9F%B3%E9%A2%91%E6%B5%81%5Cn%20%20%20%20if%20(this.audioStream)%20%7B%5Cn%20%20%20%20%20%20this.audioStream.getTracks().forEach((track)%20%3D%3E%20track.stop())%5Cn%20%20%20%20%20%20this.audioStream%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%2F%2F%20%E6%96%AD%E5%BC%80%E9%9F%B3%E9%A2%91%E5%A4%84%E7%90%86%E5%99%A8%5Cn%20%20%20%20if%20(this.scriptProcessor)%20%7B%5Cn%20%20%20%20%20%20this.scriptProcessor.disconnect()%5Cn%20%20%20%20%20%20this.scriptProcessor%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%2F%2F%20%E5%85%B3%E9%97%AD%E9%9F%B3%E9%A2%91%E4%B8%8A%E4%B8%8B%E6%96%87%5Cn%20%20%20%20if%20(this.audioContext)%20%7B%5Cn%20%20%20%20%20%20this.audioContext.close()%5Cn%20%20%20%20%20%20this.audioContext%20%3D%20undefined%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%2F%2F%20%E5%85%B3%E9%97%AD%20WebSocket%20%E8%BF%9E%E6%8E%A5%5Cn%20%20%20%20if%20(this.ws%20%26%26%20this.ws.readyState%20%3D%3D%3D%20WebSocket.OPEN)%20%7B%5Cn%20%20%20%20%20%20this.ws.close()%5Cn%20%20%20%20%7D%5Cn%20%20%20%20this.ws%20%3D%20undefined%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20%E8%AF%AD%E9%9F%B3%E9%85%8D%E7%BD%AE%E5%B7%A5%E5%8E%82%E5%87%BD%E6%95%B0%5Cn%20*%2F%5Cnexport%20class%20SpeechConfigFactory%20%7B%5Cn%20%20%2F**%5Cn%20%20%20*%20%E7%99%BE%E5%BA%A6%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E9%85%8D%E7%BD%AE%5Cn%20%20%20*%2F%5Cn%20%20static%20createBaiduConfig(apiKey%3A%20string%2C%20secretKey%3A%20string)%20%7B%5Cn%20%20%20%20return%20%7B%5Cn%20%20%20%20%20%20mode%3A%20'custom'%20as%20const%2C%5Cn%20%20%20%20%20%20customHandler%3A%20new%20BaiduSpeechHandler(apiKey%2C%20secretKey)%2C%5Cn%20%20%20%20%20%20continuous%3A%20false%2C%5Cn%20%20%20%20%20%20interimResults%3A%20true%2C%5Cn%20%20%20%20%20%20lang%3A%20'zh-CN'%2C%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20%2F**%5Cn%20%20%20*%20%E9%98%BF%E9%87%8C%E4%BA%91%E4%B8%80%E5%8F%A5%E8%AF%9D%E8%AF%86%E5%88%AB%E9%85%8D%E7%BD%AE%5Cn%20%20%20*%2F%5Cn%20%20static%20createAliyunConfig(appKey%3A%20string%2C%20token%3A%20string)%20%7B%5Cn%20%20%20%20return%20%7B%5Cn%20%20%20%20%20%20mode%3A%20'custom'%20as%20const%2C%5Cn%20%20%20%20%20%20customHandler%3A%20new%20AliyunSpeechHandler(appKey%2C%20token)%2C%5Cn%20%20%20%20%20%20continuous%3A%20false%2C%5Cn%20%20%20%20%20%20interimResults%3A%20false%2C%5Cn%20%20%20%20%20%20lang%3A%20'zh-CN'%2C%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20%2F**%5Cn%20%20%20*%20%E9%98%BF%E9%87%8C%E4%BA%91%E5%AE%9E%E6%97%B6%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E9%85%8D%E7%BD%AE%5Cn%20%20%20*%2F%5Cn%20%20static%20createAliyunRealtimeConfig(appKey%3A%20string%2C%20token%3A%20string)%20%7B%5Cn%20%20%20%20return%20%7B%5Cn%20%20%20%20%20%20mode%3A%20'custom'%20as%20const%2C%5Cn%20%20%20%20%20%20customHandler%3A%20new%20AliyunRealtimeSpeechHandler(appKey%2C%20token)%2C%5Cn%20%20%20%20%20%20continuous%3A%20true%2C%5Cn%20%20%20%20%20%20interimResults%3A%20true%2C%5Cn%20%20%20%20%20%20lang%3A%20'zh-CN'%2C%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20%2F**%5Cn%20%20%20*%20%E6%A8%A1%E6%8B%9F%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E9%85%8D%E7%BD%AE%5Cn%20%20%20*%2F%5Cn%20%20static%20createMockConfig()%20%7B%5Cn%20%20%20%20return%20%7B%5Cn%20%20%20%20%20%20mode%3A%20'custom'%20as%20const%2C%5Cn%20%20%20%20%20%20customHandler%3A%20new%20MockSpeechHandler()%2C%5Cn%20%20%20%20%20%20continuous%3A%20false%2C%5Cn%20%20%20%20%20%20interimResults%3A%20true%2C%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[4]||(n[4]=()=>{i.value=!1}),vueCode:t(X)},k({_:2},[f.value?{name:"vue",fn:l(()=>[e(t(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[25]||(n[25]=s("h4",{id:"移动端按住说话",tabindex:"-1"},[r("移动端按住说话 "),s("a",{class:"header-anchor",href:"#移动端按住说话","aria-label":'Permalink to "移动端按住说话"'},"​")],-1)),n[26]||(n[26]=s("p",null,[r("Sender 组件支持通过 "),s("code",null,"onVoiceButtonClick"),r(' 拦截器实现移动端自定义录音 UI。通过拦截录音按钮的点击事件，可以在移动端显示"按住说话"界面，实现按住录音、松开发送、上滑取消等交互。')],-1)),n[27]||(n[27]=s("p",null,[r("新增配置 "),s("code",null,"autoSubmit: true"),r("，识别完成后自动提交")],-1)),c(e(t(u),null,null,512),[[E,i.value]]),e(p,null,{default:l(()=>[e(t(A),{title:"移动端按住说话",description:"通过事件拦截实现移动端自定义录音 UI，支持按住说话、上滑取消等交互",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%22MobilePressToTalk.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fsender%2FMobilePressToTalk.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20style%3D%5C%22display%3A%20flex%3B%20flex-direction%3A%20column%3B%20gap%3A%2020px%5C%22%3E%5Cn%20%20%20%20%3Cdiv%3E%5Cn%20%20%20%20%20%20%3Ch4%3E%E6%94%AF%E6%8C%81%E7%A7%BB%E5%8A%A8%E7%AB%AF%E6%8C%89%E4%BD%8F%E8%AF%B4%E8%AF%9D%E7%9A%84%E8%BE%93%E5%85%A5%E6%A1%86%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%3Cdiv%5Cn%20%20%20%20%20%20%20%20class%3D%5C%22sender-container%5C%22%5Cn%20%20%20%20%20%20%20%20%40touchmove.prevent%3D%5C%22handleContainerTouchMove%5C%22%5Cn%20%20%20%20%20%20%20%20%40touchend.prevent%3D%5C%22handleContainerTouchEnd%5C%22%5Cn%20%20%20%20%20%20%20%20%40mousemove.prevent%3D%5C%22handleContainerTouchMove%5C%22%5Cn%20%20%20%20%20%20%20%20%40mouseup.prevent%3D%5C%22handleContainerTouchEnd%5C%22%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20%20%20%20%20v-show%3D%5C%22!showMobileVoiceUI%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20ref%3D%5C%22senderRef%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20v-model%3D%5C%22inputText%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20mode%3D%5C%22single%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20class%3D%5C%22sender%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3AallowSpeech%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Aspeech%3D%5C%22speechConfig%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20placeholder%3D%5C%22%E7%82%B9%E5%87%BB%E9%BA%A6%E5%85%8B%E9%A3%8E%E6%8C%89%E9%92%AE%E5%BC%80%E5%A7%8B%E8%AF%AD%E9%9F%B3%E8%BE%93%E5%85%A5...%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%40speech-start%3D%5C%22handleSpeechStart%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%40speech-end%3D%5C%22handleSpeechEnd%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%40speech-error%3D%5C%22handleSpeechError%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Ctemplate%20%23content%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cdiv%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20style%3D%5C%22width%3A%20100%25%3B%20display%3A%20flex%3B%20justify-content%3A%20center%3B%20user-select%3A%20none%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%40touchstart.prevent%3D%5C%22handleDecorativeTouchStart%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%40mousedown.prevent%3D%5C%22handleDecorativeTouchStart%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%E6%8C%89%E4%BD%8F%E8%AF%B4%E8%AF%9D%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Ftr-sender%3E%5Cn%5Cn%20%20%20%20%20%20%20%20%3CPressToTalkOverlay%5Cn%20%20%20%20%20%20%20%20%20%20ref%3D%5C%22mobileVoiceUIRef%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20v-model%3Avisible%3D%5C%22showMobileVoiceUI%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3AcancelThreshold%3D%5C%22cancelThreshold%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3AisCanceling%3D%5C%22isCanceling%5C%22%5Cn%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20v-if%3D%5C%22results.length%20%3E%200%5C%22%20style%3D%5C%22padding%3A%2016px%3B%20background%3A%20%23f9f9f9%3B%20border-radius%3A%208px%5C%22%3E%5Cn%20%20%20%20%20%20%3Ch4%20style%3D%5C%22margin%3A%200%200%2012px%200%5C%22%3E%E8%AF%86%E5%88%AB%E5%8E%86%E5%8F%B2%3C%2Fh4%3E%5Cn%20%20%20%20%20%20%3Cdiv%20style%3D%5C%22max-height%3A%20200px%3B%20overflow-y%3A%20auto%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%5Cn%20%20%20%20%20%20%20%20%20%20v-for%3D%5C%22(result%2C%20index)%20in%20results%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Akey%3D%5C%22index%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20style%3D%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%208px%3B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20margin-bottom%3A%208px%3B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20background%3A%20white%3B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20border-radius%3A%204px%3B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20border-left%3A%203px%20solid%20%2352c41a%3B%5Cn%20%20%20%20%20%20%20%20%20%20%5C%22%5Cn%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cdiv%20style%3D%5C%22font-size%3A%2012px%3B%20color%3A%20%23999%3B%20margin-bottom%3A%204px%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%7B%7B%20result.timestamp%20%7D%7D%20-%20%7B%7B%20result.platform%20%7D%7D%20-%20%7B%7B%20result.mode%20%7D%7D%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cspan%20v-if%3D%5C%22result.canceled%5C%22%20style%3D%5C%22color%3A%20%23ff4d4f%5C%22%3E%20-%20%E5%B7%B2%E5%8F%96%E6%B6%88%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cspan%20v-if%3D%5C%22result.completed%5C%22%20style%3D%5C%22color%3A%20%2300b176%5C%22%3E%20-%20%E5%B7%B2%E5%8F%91%E9%80%81%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cdiv%3E%7B%7B%20result.text%20%7D%7D%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20ref%2C%20computed%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20type%20%7B%20VoiceButtonClickContext%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20MockSpeechHandler%20%7D%20from%20'.%2FspeechHandlers'%5Cnimport%20PressToTalkOverlay%20from%20'.%2FPressToTalkOverlay.vue'%5Cn%5Cninterface%20Result%20%7B%5Cn%20%20text%3A%20string%5Cn%20%20timestamp%3A%20string%5Cn%20%20mode%3A%20string%5Cn%20%20platform%3A%20string%5Cn%20%20canceled%3F%3A%20boolean%5Cn%20%20completed%3F%3A%20boolean%5Cn%7D%5Cn%5Cnconst%20senderRef%20%3D%20ref%3CInstanceType%3Ctypeof%20TrSender%3E%3E()%5Cnconst%20mobileVoiceUIRef%20%3D%20ref%3CInstanceType%3Ctypeof%20PressToTalkOverlay%3E%3E()%5Cn%5Cnconst%20inputText%20%3D%20ref('')%5Cnconst%20showMobileVoiceUI%20%3D%20ref(false)%5Cnconst%20isCanceling%20%3D%20ref(false)%5Cnconst%20startY%20%3D%20ref(0)%5Cnconst%20results%20%3D%20ref%3CResult%5B%5D%3E(%5B%5D)%5Cn%5Cnconst%20autoReplace%20%3D%20ref(true)%5Cnconst%20cancelThreshold%20%3D%2030%5Cnconst%20isMobile%20%3D%20computed(()%20%3D%3E%20true)%5Cnconst%20customSpeechHandler%20%3D%20new%20MockSpeechHandler()%5Cn%5Cnconst%20speechConfig%20%3D%20computed(()%20%3D%3E%20(%7B%5Cn%20%20mode%3A%20'custom'%20as%20const%2C%5Cn%20%20customHandler%3A%20customSpeechHandler%2C%5Cn%20%20autoReplace%3A%20autoReplace.value%2C%5Cn%20%20interimResults%3A%20true%2C%5Cn%20%20isMobile%3A%20isMobile.value%2C%5Cn%20%20onVoiceButtonClick%3A%20async%20(context%3A%20VoiceButtonClickContext)%20%3D%3E%20%7B%5Cn%20%20%20%20if%20(!context.isMobile)%20return%20false%5Cn%20%20%20%20if%20(!context.isRecording)%20%7B%5Cn%20%20%20%20%20%20showMobileVoiceUI.value%20%3D%20true%5Cn%20%20%20%20%20%20return%20true%5Cn%20%20%20%20%7D%20else%20%7B%5Cn%20%20%20%20%20%20context.speechHandler.stop()%5Cn%20%20%20%20%20%20showMobileVoiceUI.value%20%3D%20false%5Cn%20%20%20%20%20%20return%20true%5Cn%20%20%20%20%7D%5Cn%20%20%7D%2C%5Cn%7D))%5Cn%5Cnconst%20handleSpeechStart%20%3D%20()%20%3D%3E%20%7B%7D%5Cn%5Cnconst%20handleSpeechEnd%20%3D%20(transcript%3F%3A%20string)%20%3D%3E%20%7B%5Cn%20%20if%20(transcript)%20%7B%5Cn%20%20%20%20results.value.unshift(%7B%5Cn%20%20%20%20%20%20text%3A%20transcript%2C%5Cn%20%20%20%20%20%20timestamp%3A%20new%20Date().toLocaleTimeString()%2C%5Cn%20%20%20%20%20%20mode%3A%20autoReplace.value%20%3F%20'%E6%9B%BF%E6%8D%A2%E6%A8%A1%E5%BC%8F'%20%3A%20'%E8%BF%BD%E5%8A%A0%E6%A8%A1%E5%BC%8F'%2C%5Cn%20%20%20%20%20%20platform%3A%20isMobile.value%20%3F%20'%E7%A7%BB%E5%8A%A8%E7%AB%AF'%20%3A%20'PC%E7%AB%AF'%2C%5Cn%20%20%20%20%7D)%5Cn%20%20%20%20if%20(results.value.length%20%3E%2010)%20results.value.length%20%3D%2010%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20handleSpeechError%20%3D%20()%20%3D%3E%20%7B%7D%5Cn%5Cnconst%20handleSubmit%20%3D%20(text%3A%20string)%20%3D%3E%20%7B%5Cn%20%20console.log('%E6%8F%90%E4%BA%A4%E5%86%85%E5%AE%B9%3A'%2C%20text)%5Cn%7D%5Cn%5Cnconst%20handleDecorativeTouchStart%20%3D%20(e%3A%20TouchEvent%20%7C%20MouseEvent)%20%3D%3E%20%7B%5Cn%20%20const%20clientY%20%3D%20e%20instanceof%20TouchEvent%20%3F%20e.touches%5B0%5D.clientY%20%3A%20e.clientY%5Cn%20%20startY.value%20%3D%20clientY%5Cn%20%20showMobileVoiceUI.value%20%3D%20true%5Cn%20%20isCanceling.value%20%3D%20false%5Cn%20%20senderRef.value%3F.startSpeech()%5Cn%7D%5Cn%5Cnconst%20handleContainerTouchMove%20%3D%20(e%3A%20TouchEvent%20%7C%20MouseEvent)%20%3D%3E%20%7B%5Cn%20%20if%20(!showMobileVoiceUI.value)%20return%5Cn%20%20const%20currentY%20%3D%20e%20instanceof%20TouchEvent%20%3F%20e.touches%5B0%5D.clientY%20%3A%20e.clientY%5Cn%20%20const%20slideDistance%20%3D%20startY.value%20-%20currentY%5Cn%20%20isCanceling.value%20%3D%20slideDistance%20%3E%20cancelThreshold%5Cn%7D%5Cn%5Cnconst%20handleContainerTouchEnd%20%3D%20(e%3A%20TouchEvent%20%7C%20MouseEvent)%20%3D%3E%20%7B%5Cn%20%20if%20(!showMobileVoiceUI.value)%20return%5Cn%5Cn%20%20const%20endY%20%3D%20e%20instanceof%20TouchEvent%20%3F%20e.changedTouches%5B0%5D.clientY%20%3A%20e.clientY%5Cn%20%20const%20totalSlide%20%3D%20startY.value%20-%20endY%5Cn%20%20const%20canceled%20%3D%20totalSlide%20%3E%20cancelThreshold%5Cn%5Cn%20%20if%20(canceled)%20%7B%5Cn%20%20%20%20senderRef.value%3F.stopSpeech()%5Cn%20%20%20%20results.value.unshift(%7B%5Cn%20%20%20%20%20%20text%3A%20'(%E5%BD%95%E9%9F%B3%E5%B7%B2%E5%8F%96%E6%B6%88)'%2C%5Cn%20%20%20%20%20%20timestamp%3A%20new%20Date().toLocaleTimeString()%2C%5Cn%20%20%20%20%20%20mode%3A%20autoReplace.value%20%3F%20'%E6%9B%BF%E6%8D%A2%E6%A8%A1%E5%BC%8F'%20%3A%20'%E8%BF%BD%E5%8A%A0%E6%A8%A1%E5%BC%8F'%2C%5Cn%20%20%20%20%20%20platform%3A%20isMobile.value%20%3F%20'%E7%A7%BB%E5%8A%A8%E7%AB%AF'%20%3A%20'PC%E7%AB%AF'%2C%5Cn%20%20%20%20%20%20canceled%3A%20true%2C%5Cn%20%20%20%20%7D)%5Cn%20%20%7D%20else%20%7B%5Cn%20%20%20%20results.value.unshift(%7B%5Cn%20%20%20%20%20%20text%3A%20inputText.value%2C%5Cn%20%20%20%20%20%20timestamp%3A%20new%20Date().toLocaleTimeString()%2C%5Cn%20%20%20%20%20%20mode%3A%20autoReplace.value%20%3F%20'%E6%9B%BF%E6%8D%A2%E6%A8%A1%E5%BC%8F'%20%3A%20'%E8%BF%BD%E5%8A%A0%E6%A8%A1%E5%BC%8F'%2C%5Cn%20%20%20%20%20%20platform%3A%20isMobile.value%20%3F%20'%E7%A7%BB%E5%8A%A8%E7%AB%AF'%20%3A%20'PC%E7%AB%AF'%2C%5Cn%20%20%20%20%20%20completed%3A%20true%2C%5Cn%20%20%20%20%7D)%5Cn%20%20%20%20senderRef.value%3F.stopSpeech()%5Cn%20%20%7D%5Cn%5Cn%20%20showMobileVoiceUI.value%20%3D%20false%5Cn%20%20isCanceling.value%20%3D%20false%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.sender-container%20%7B%5Cn%20%20position%3A%20relative%3B%5Cn%20%20min-height%3A%20180px%3B%5Cn%7D%5Cn%5Cn.sender%20%7B%5Cn%20%20position%3A%20absolute%3B%5Cn%20%20left%3A%200%3B%5Cn%20%20right%3A%200%3B%5Cn%20%20bottom%3A%200%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22PressToTalkOverlay.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fsender%2FPressToTalkOverlay.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20v-if%3D%5C%22visible%5C%22%20class%3D%5C%22mobile-voice-overlay%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22recording-wave%5C%22%20%3Aclass%3D%5C%22%7B%20active%3A%20visible%20%7D%5C%22%3E%5Cn%20%20%20%20%20%20%3Cimg%20src%3D%5C%22..%2F..%2F..%2Fpackages%2Fcomponents%2Fsrc%2Fassets%2Fwave.webp%5C%22%20alt%3D%5C%22Recording%20Wave%5C%22%20class%3D%5C%22wave-image%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22voice-hint%5C%22%20%3Aclass%3D%5C%22%7B%20cancel%3A%20isCanceling%20%7D%5C%22%3E%5Cn%20%20%20%20%20%20%7B%7B%20hintText%20%7D%7D%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cbutton%20class%3D%5C%22voice-btn%5C%22%20%3Aclass%3D%5C%22%7B%20recording%3A%20visible%2C%20cancel%3A%20isCanceling%20%7D%5C%22%3E%E6%8C%89%E4%BD%8F%E8%AF%B4%E8%AF%9D%3C%2Fbutton%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%20%7D%20from%20'vue'%5Cn%5Cninterface%20Props%20%7B%5Cn%20%20visible%3F%3A%20boolean%5Cn%20%20isCanceling%3F%3A%20boolean%5Cn%20%20cancelThreshold%3F%3A%20number%5Cn%7D%5Cn%5Cnconst%20props%20%3D%20withDefaults(defineProps%3CProps%3E()%2C%20%7B%5Cn%20%20visible%3A%20false%2C%5Cn%20%20isCanceling%3A%20false%2C%5Cn%20%20cancelThreshold%3A%2030%2C%5Cn%7D)%5Cn%5Cnconst%20hintText%20%3D%20computed(()%20%3D%3E%20%7B%5Cn%20%20if%20(!props.visible)%20return%20'%E6%8C%89%E4%BD%8F%E8%AF%B4%E8%AF%9D'%5Cn%20%20if%20(props.isCanceling)%20return%20'%E6%9D%BE%E5%BC%80%E5%8F%96%E6%B6%88'%5Cn%20%20return%20'%E6%9D%BE%E5%BC%80%E5%8F%91%E9%80%81%EF%BC%8C%E4%B8%8A%E6%BB%91%E5%8F%96%E6%B6%88'%5Cn%7D)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.mobile-voice-overlay%20%7B%5Cn%20%20position%3A%20absolute%3B%5Cn%20%20left%3A%200%3B%5Cn%20%20right%3A%200%3B%5Cn%20%20bottom%3A%200%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%2026px%3B%5Cn%20%20z-index%3A%201%3B%5Cn%7D%5Cn%5Cn.recording-wave%20%7B%5Cn%20%20display%3A%20none%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20width%3A%20280px%3B%5Cn%7D%5Cn%5Cn.recording-wave.active%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%7D%5Cn%5Cn.voice-hint%20%7B%5Cn%20%20font-size%3A%2015px%3B%5Cn%20%20color%3A%20%23666%3B%5Cn%20%20height%3A%2024px%3B%5Cn%20%20text-align%3A%20center%3B%5Cn%20%20transition%3A%20all%200.3s%20ease%3B%5Cn%20%20font-weight%3A%20400%3B%5Cn%20%20white-space%3A%20nowrap%3B%5Cn%7D%5Cn%5Cn.voice-hint.cancel%20%7B%5Cn%20%20color%3A%20%23ff4d4f%3B%5Cn%20%20font-weight%3A%20500%3B%5Cn%7D%5Cn%5Cn.voice-btn%20%7B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20height%3A%2052px%3B%5Cn%20%20background-color%3A%20%231476ff%3B%5Cn%20%20border-radius%3A%2012px%3B%5Cn%20%20border%3A%20none%3B%5Cn%20%20color%3A%20white%3B%5Cn%20%20font-size%3A%2017px%3B%5Cn%20%20font-weight%3A%20500%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%20%20transition%3A%20all%200.3s%20ease%3B%5Cn%20%20box-shadow%3A%200%206px%2020px%20rgba(20%2C%20118%2C%20255%2C%200.25)%3B%5Cn%20%20user-select%3A%20none%3B%5Cn%20%20pointer-events%3A%20none%3B%5Cn%7D%5Cn%5Cn.voice-btn.recording%20%7B%5Cn%20%20background-color%3A%20%231476ff%3B%5Cn%7D%5Cn%5Cn.voice-btn.cancel%20%7B%5Cn%20%20background-color%3A%20%23f76360%3B%5Cn%20%20box-shadow%3A%200%206px%2020px%20rgba(247%2C%2099%2C%2096%2C%200.25)%3B%5Cn%7D%5Cn%5Cn.wave-image%20%7B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20object-fit%3A%20contain%3B%5Cn%20%20animation%3A%20pulse%201.5s%20ease-in-out%20infinite%3B%5Cn%20%20filter%3A%20drop-shadow(0%202px%208px%20rgba(20%2C%20118%2C%20255%2C%200.3))%3B%5Cn%7D%5Cn%5Cn%40keyframes%20pulse%20%7B%5Cn%20%200%25%2C%5Cn%20%20100%25%20%7B%5Cn%20%20%20%20opacity%3A%200.7%3B%5Cn%20%20%20%20transform%3A%20scale(0.95)%3B%5Cn%20%20%7D%5Cn%20%2050%25%20%7B%5Cn%20%20%20%20opacity%3A%201%3B%5Cn%20%20%20%20transform%3A%20scale(1.05)%3B%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[5]||(n[5]=()=>{i.value=!1}),vueCode:t(V)},k({_:2},[b.value?{name:"vue",fn:l(()=>[e(t(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[28]||(n[28]=o("",4)),c(e(t(u),null,null,512),[[E,i.value]]),e(p,null,{default:l(()=>[e(t(A),{title:"装饰性内容示例",description:"在输入框内显示装饰性内容和可点击链接，可用于服务状态提示、功能引导等场景。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[6]||(n[6]=()=>{i.value=!1}),vueCode:t(M)},k({_:2},[v.value?{name:"vue",fn:l(()=>[e(t(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[29]||(n[29]=o("",8)),c(e(t(u),null,null,512),[[E,i.value]]),e(p,null,{default:l(()=>[e(t(A),{title:"文件上传",description:"Sender 组件支持文件上传功能，并可通过 buttonGroup 动态控制按钮状态。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[7]||(n[7]=()=>{i.value=!1}),vueCode:t(K)},k({_:2},[D.value?{name:"vue",fn:l(()=>[e(t(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[30]||(n[30]=s("h4",{id:"模版填充",tabindex:"-1"},[r("模版填充 "),s("a",{class:"header-anchor",href:"#模版填充","aria-label":'Permalink to "模版填充"'},"​")],-1)),n[31]||(n[31]=s("p",null,[r("通过 "),s("code",null,"templateData"),r(" prop 实现模板的动态设置与双向绑定。推荐使用 "),s("code",null,"v-model:templateData"),r(" 的语法糖。")],-1)),n[32]||(n[32]=s("p",null,"该功能加载后，光标会自动聚焦在第一个可编辑的模板字段上，方便用户直接开始编辑。",-1)),n[33]||(n[33]=s("p",null,[s("strong",null,"模板示例")],-1)),c(e(t(u),null,null,512),[[E,i.value]]),e(p,null,{default:l(()=>[e(t(A),{title:"模板填充示例",description:"Sender 组件支持模板填充，展示动态模板切换功能。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[8]||(n[8]=()=>{i.value=!1}),vueCode:t(G)},k({_:2},[m.value?{name:"vue",fn:l(()=>[e(t(m))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[34]||(n[34]=o("",10)),c(e(t(u),null,null,512),[[E,i.value]]),e(p,null,{default:l(()=>[e(t(A),{title:"输入联想示例",description:"展示 Sender 组件的输入联想功能。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[9]||(n[9]=()=>{i.value=!1}),vueCode:t(q)},k({_:2},[F.value?{name:"vue",fn:l(()=>[e(t(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[35]||(n[35]=o("",4)),e(g,{submitType:"ctrlEnter",mode:"multiple",placeholder:"按Ctrl+Enter提交"}),n[36]||(n[36]=o("",1)),e(g,{submitType:"shiftEnter",mode:"multiple",placeholder:"按Shift+Enter提交"}),n[37]||(n[37]=o("",10)),c(e(t(u),null,null,512),[[E,i.value]]),e(p,null,{default:l(()=>[e(t(A),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[10]||(n[10]=()=>{i.value=!1}),vueCode:t(Z)},k({_:2},[y.value?{name:"vue",fn:l(()=>[e(t(y))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[38]||(n[38]=o("",6)),c(e(t(u),null,null,512),[[E,i.value]]),e(p,null,{default:l(()=>[e(t(A),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[11]||(n[11]=()=>{i.value=!1}),vueCode:t(P)},k({_:2},[B.value?{name:"vue",fn:l(()=>[e(t(B))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[39]||(n[39]=o("",15))])}}});export{J as __pageData,Q as default};
