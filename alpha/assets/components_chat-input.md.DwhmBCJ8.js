const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/size.EzxiYTcM.js","assets/chunks/theme.CtyOnrh1.js","assets/chunks/framework.BdNhW8XL.js","assets/chunks/methods-demo.lgVAZJQH.js","assets/chunks/custom-slots.DWcAIwWz.js","assets/chunks/submit-type.CuOwixL5.js","assets/chunks/cancel-event.CJV7H4Uv.js","assets/chunks/actions-enhanced.l2LIaX5B.js","assets/chunks/actions-config-basic.BcvuWkhX.js","assets/chunks/voice-custom-ui.Cy1ziqjt.js","assets/chunks/PressToTalkOverlay.Czs9WcR6.js","assets/chunks/voice-custom.CDd2tlar.js","assets/chunks/speechHandlers.BaP7Oj2p.js","assets/chunks/voice-input.D5MgyaJp.js","assets/chunks/suggestion-highlight.nuxPWNhj.js","assets/chunks/suggestion-filter.B66xpxw3.js","assets/chunks/suggestion-basic.CwyrhQA6.js","assets/chunks/mention.CJHgdrke.js","assets/chunks/template-editor.CrsNjqxQ.js","assets/chunks/word-limit.B4q_leMV.js","assets/chunks/loading-state.CC2CUmWl.js","assets/chunks/mode-switch.BIwGzlw1.js"])))=>i.map(i=>d[i]);
import{s as p,A as r,_ as h,r as V,H as q,e as X,o as G,a4 as y,ah as c,J as n,q as s,ai as u,x as e,i as l,ak as k,g as d}from"./chunks/framework.BdNhW8XL.js";import{L as g,N as m}from"./chunks/index.Cjhfp_wh.js";const R=`<template>
  <div style="display: flex; gap: 24px; flex-wrap: wrap">
    <!-- 正常尺寸 -->
    <div style="flex: 1; min-width: 300px">
      <h4 style="margin: 0 0 12px 0; color: #666; font-size: 14px; font-weight: 500">
        正常尺寸（<code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px">size="normal"</code>）
      </h4>
      <div style="display: flex; flex-direction: column; gap: 12px">
        <ChatInput :default-value="message" size="normal" mode="single" placeholder="正常单行模式..." />
        <ChatInput
          :default-value="message"
          size="normal"
          mode="multiple"
          placeholder="正常多行模式..."
          :showWordLimit="true"
          :maxLength="200"
        />
      </div>
    </div>

    <!-- 紧凑尺寸 -->
    <div style="flex: 1; min-width: 300px">
      <h4 style="margin: 0 0 12px 0; color: #666; font-size: 14px; font-weight: 500">
        紧凑尺寸（<code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px">size="small"</code>）
      </h4>
      <div style="display: flex; flex-direction: column; gap: 12px">
        <ChatInput :default-value="message" size="small" mode="single" placeholder="紧凑单行模式..." />
        <ChatInput
          :default-value="message"
          size="small"
          mode="multiple"
          placeholder="紧凑多行模式..."
          :showWordLimit="true"
          :maxLength="100"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChatInput } from '@opentiny/tiny-robot'

const message = 'Hello TinyRobot'
<\/script>
`,P=`<template>
  <div class="demo-container">
    <div class="controls">
      <button @click="handleFocus">聚焦</button>
      <button @click="handleBlur">失焦</button>
      <button @click="handleSetContent">设置内容</button>
      <button @click="handleGetContent">获取内容</button>
      <button @click="handleClear">清空</button>
      <button @click="handleSubmit">提交</button>
    </div>
    <ChatInput
      ref="chatInputRef"
      v-model="content"
      placeholder="通过上方按钮控制输入框..."
      mode="multiple"
      clearable
      @submit="onSubmit"
    />
    <div v-if="result" class="result">{{ result }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChatInput } from '@opentiny/tiny-robot'

const chatInputRef = ref()
const content = ref('')
const result = ref('')

const handleFocus = () => {
  chatInputRef.value?.focus()
  result.value = '已聚焦'
}

const handleBlur = () => {
  chatInputRef.value?.blur()
  result.value = '已失焦'
}

const handleSetContent = () => {
  chatInputRef.value?.setContent('<p>这是通过方法设置的内容</p>')
  result.value = '已设置内容'
}

const handleGetContent = () => {
  const content = chatInputRef.value?.getContent()
  result.value = \`当前内容: \${content}\`
}

const handleClear = () => {
  chatInputRef.value?.clear()
  result.value = '已清空'
}

const handleSubmit = () => {
  chatInputRef.value?.submit()
}

const onSubmit = (value: string) => {
  result.value = \`已提交: \${value}\`
}
<\/script>

<style scoped>
.demo-container {
  padding: 20px;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.controls button {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.controls button:hover {
  border-color: #1476ff;
  color: #1476ff;
}

.result {
  margin-top: 15px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 14px;
}
</style>
`,M=`<script setup lang="ts">
import { ref } from 'vue'
import { ChatInput, UploadButton } from '@opentiny/tiny-robot'
import { IconSearch, IconThink, IconAi } from '@opentiny/tiny-robot-svgs'

const content = ref('')
const message = ref('')

const handleSubmit = (value: string) => {
  message.value = \`已提交: \${value}\`
  setTimeout(() => (message.value = ''), 3000)
}

const handleDeepThink = () => {
  message.value = '启动深度思考模式...'
  setTimeout(() => (message.value = ''), 3000)
}

const handleEmoji = () => {
  message.value = '打开网络搜索...'
  setTimeout(() => (message.value = ''), 3000)
}
<\/script>

<template>
  <div class="demo-container">
    <ChatInput
      v-model="content"
      placeholder="输入内容，可以使用深度思考..."
      mode="multiple"
      clearable
      @submit="handleSubmit"
    >
      <template #header>
        <div style="display: flex; justify-content: center">
          <span style="font-weight: 800">Hello,Tiny Robot!</span>
        </div>
      </template>
      <template #footer>
        <button class="deep-think-btn" @click="handleDeepThink">
          <IconThink />
          深度思考
        </button>
        <button class="search-btn" @click="handleEmoji">
          <IconSearch />
          网络搜索
        </button>
      </template>

      <template #prefix>
        <IconAi :style="{ fontSize: '26px' }" />
      </template>
      <template #footer-right>
        <UploadButton tooltip="文件上传" tooltip-placement="top" />
      </template>
    </ChatInput>
    <div v-if="message" class="message">{{ message }}</div>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 20px;
}

.deep-think-btn,
.search-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 26px;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.deep-think-btn:hover,
.emoji-btn:hover {
  background: #f5f5f5;
  border-color: #1476ff;
  color: #1476ff;
}

.message {
  margin-top: 15px;
  padding: 10px;
  background: #e7f3ff;
  border-radius: 6px;
  color: #1476ff;
}
</style>
`,j=`<template>
  <div class="demo-container">
    <div class="options-panel">
      <label>提交方式：</label>
      <div class="radio-group">
        <label> <input type="radio" value="enter" v-model="submitType" /> Enter </label>
        <label> <input type="radio" value="ctrlEnter" v-model="submitType" /> Ctrl + Enter </label>
        <label> <input type="radio" value="shiftEnter" v-model="submitType" /> Shift + Enter </label>
      </div>
    </div>

    <ChatInput v-model="content" :submitType="submitType" placeholder="请输入内容..." @submit="handleSubmit" />

    <div v-if="submittedContent" class="result">
      <strong>已提交: </strong>
      <span>{{ submittedContent }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChatInput, type SubmitTrigger } from '@opentiny/tiny-robot'

const content = ref('')
const submittedContent = ref('')
const submitType = ref<SubmitTrigger>('enter')

const handleSubmit = (value: string) => {
  submittedContent.value = value
  console.log('提交内容:', value)
}
<\/script>

<style scoped>
.demo-container {
  padding: 20px;
}

.options-panel {
  margin-bottom: 20px;
  padding: 15px;
  background: #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.radio-group {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.radio-group label {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.radio-group input {
  margin-right: 8px;
}

.result {
  margin-top: 20px;
  padding: 15px;
  background: #e9e9e9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.result strong {
  color: #333;
}

.result span {
  color: #555;
  word-break: break-all;
}
</style>
`,N=`<script setup lang="ts">
import { ref } from 'vue'
import { ChatInput } from '@opentiny/tiny-robot'

const content = ref('')
const loading = ref(false)
const message = ref('')

const handleSubmit = (text: string) => {
  loading.value = true
  message.value = '正在处理...'

  // 模拟 AI 响应
  setTimeout(() => {
    loading.value = false
    message.value = \`AI 回复: 收到您的消息 "\${text}"\`
    content.value = ''
  }, 3000)
}

const handleCancel = () => {
  loading.value = false
  message.value = '❌ 已取消响应'
  setTimeout(() => (message.value = ''), 2000)
}
<\/script>

<template>
  <div class="demo-container">
    <ChatInput
      v-model="content"
      :loading="loading"
      placeholder="输入内容后提交，观察 loading 状态..."
      stop-text="停止响应"
      clearable
      @submit="handleSubmit"
      @cancel="handleCancel"
    />

    <div v-if="message" :class="['message', { error: message.includes('取消') }]">
      {{ message }}
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 20px;
}

.message {
  margin-top: 15px;
  padding: 10px;
  background: #e7f3ff;
  border-radius: 6px;
  color: #1476ff;
}

.message.error {
  background: #fef0f0;
  color: #f56c6c;
}
</style>
`,z=`<script setup lang="ts">
import { ref } from 'vue'
import { ChatInput, UploadButton, VoiceButton } from '@opentiny/tiny-robot'

const content = ref('')
const message = ref('')

const handleSubmit = (text: string) => {
  message.value = \`已提交: \${text}\`
  content.value = ''
  setTimeout(() => (message.value = ''), 3000)
}

const handleFiles = (files: File[]) => {
  message.value = \`选择了 \${files.length} 个文件: \${files.map((f) => f.name).join(', ')}\`
  setTimeout(() => (message.value = ''), 3000)
}

const handleVoiceFinal = (text: string) => {
  content.value += text + ' '
}
<\/script>

<template>
  <div class="demo-container">
    <ChatInput
      v-model="content"
      placeholder="输入内容，或使用语音/上传文件..."
      mode="multiple"
      clearable
      @submit="handleSubmit"
    >
      <template #footer-right>
        <!-- 上传按钮 -->
        <UploadButton
          accept="image/*"
          :multiple="true"
          tooltip="上传图片"
          tooltip-placement="top"
          @select="handleFiles"
        />

        <!-- 语音按钮 -->
        <VoiceButton tooltip="语音输入" tooltip-placement="top" @speech-final="handleVoiceFinal" />
      </template>
    </ChatInput>

    <div v-if="message" class="message">{{ message }}</div>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 20px;
}

.message {
  margin-top: 15px;
  padding: 10px;
  background: #e7f3ff;
  border-radius: 6px;
  color: #1476ff;
}
</style>
`,Y=`<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChatInput } from '@opentiny/tiny-robot'

const content = ref('')

// 表单验证：至少 5 个字符
const isValid = computed(() => content.value.length >= 5)

// 按钮配置
const defaultActions = computed(() => ({
  submit: {
    disabled: !isValid.value,
    tooltip: isValid.value ? '发送消息' : '请输入至少 5 个字符',
  },
  clear: {
    tooltip: '清空内容',
  },
}))

const handleSubmit = (text: string) => {
  alert(\`已提交: \${text}\`)
  content.value = ''
}
<\/script>

<template>
  <div class="demo-container">
    <p class="tip">输入至少 5 个字符后，提交按钮才会启用（{{ content.length }}/5）</p>

    <ChatInput
      v-model="content"
      :default-actions="defaultActions"
      placeholder="请输入至少 5 个字符..."
      clearable
      @submit="handleSubmit"
    />
  </div>
</template>

<style scoped>
.demo-container {
  padding: 20px;
}

.tip {
  margin-bottom: 12px;
  font-size: 14px;
  color: #606266;
}
</style>

<style>
.tr-submit-button-tooltip-popper,
.tr-action-button-tooltip-popper {
  top: -10px !important;
}
</style>
`,H=`<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <!-- 语音录制 UI -->
    <div>
      <h4>{{ isMobile ? '移动端' : 'PC 端' }} 语音录制</h4>
      <div
        class="chat-input-container"
        @touchmove.prevent="handleTouchMove"
        @touchend.prevent="handleTouchEnd"
        @mousemove.prevent="handleTouchMove"
        @mouseup.prevent="handleTouchEnd"
      >
        <tr-chat-input
          v-show="!showMobileVoiceUI"
          ref="chatInputRef"
          v-model="inputText"
          mode="single"
          class="chat-input"
        >
          <!-- PC 端：使用 VoiceButton -->
          <template v-if="!isMobile" #actions-inline>
            <VoiceButton ref="voiceButtonRef" />
          </template>

          <!-- 移动端：使用自定义"按住说话"区域替换编辑器 -->
          <template v-else #content>
            <div
              class="press-to-talk-area"
              @touchstart.prevent="handleTouchStart"
              @mousedown.prevent="handleTouchStart"
            >
              按住说话
            </div>
          </template>
        </tr-chat-input>

        <!-- 录音浮层：显示录音动画和提示 -->
        <PressToTalkOverlay
          v-model:visible="showMobileVoiceUI"
          :isCanceling="isCanceling"
          :cancelThreshold="cancelThreshold"
        />
      </div>
    </div>
    <div>
      <span style="margin-right: 20px">是否是移动端</span>
      <tiny-switch v-model="isMobile"></tiny-switch>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TinySwitch } from '@opentiny/vue'
import { TrChatInput, VoiceButton } from '@opentiny/tiny-robot'
import PressToTalkOverlay from '../sender/PressToTalkOverlay.vue'

const chatInputRef = ref<InstanceType<typeof TrChatInput>>()
const voiceButtonRef = ref<InstanceType<typeof VoiceButton>>()
const inputText = ref('')
const showMobileVoiceUI = ref(false)
const isMobile = ref(false)
const isCanceling = ref(false)
const startY = ref(0)
const cancelThreshold = 30

// 按下开始录音
const handleTouchStart = (e: TouchEvent | MouseEvent) => {
  const clientY = e instanceof TouchEvent ? e.touches[0].clientY : e.clientY
  startY.value = clientY
  showMobileVoiceUI.value = true
  isCanceling.value = false
  voiceButtonRef.value?.start()
}

// 移动检测是否取消
const handleTouchMove = (e: TouchEvent | MouseEvent) => {
  if (!showMobileVoiceUI.value) return

  const currentY = e instanceof TouchEvent ? e.touches[0].clientY : e.clientY
  const slideDistance = startY.value - currentY
  isCanceling.value = slideDistance > cancelThreshold
}

// 松开结束录音
const handleTouchEnd = () => {
  if (!showMobileVoiceUI.value) return

  if (isCanceling.value) {
    // 取消录音（清空识别内容）
    inputText.value = ''
  } else {
    // 正常结束，如果有识别内容则提交
    if (inputText.value.trim()) {
      chatInputRef.value?.submit()
    }
  }

  voiceButtonRef.value?.stop()
  showMobileVoiceUI.value = false
  isCanceling.value = false
}
<\/script>

<style scoped>
.chat-input-container {
  position: relative;
  min-height: 180px;
}

.chat-input {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
}

/* 移动端"按住说话"区域 - 替换整个编辑器内容区域 */
.press-to-talk-area {
  width: 100%;
  min-height: 26px;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  cursor: pointer;
  font-size: 15px;
  color: #666;
  transition: all 0.2s;
}
</style>
`,Q=`<template>
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
      <tr-chat-input
        v-model="inputText"
        mode="single"
        placeholder="点击麦克风按钮开始语音输入..."
        @submit="handleSubmit"
      >
        <template #actions-inline>
          <VoiceButton
            :speech-config="speechConfig"
            @speech-start="handleSpeechStart"
            @speech-interim="handleSpeechInterim"
            @speech-final="handleSpeechFinal"
            @speech-end="handleSpeechEnd"
            @speech-error="handleSpeechError"
          />
        </template>
      </tr-chat-input>
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
import { TrChatInput, VoiceButton } from '@opentiny/tiny-robot'
import { MockSpeechHandler } from '../sender/speechHandlers'

// 组件状态
const inputText = ref('')
const speechStatus = ref('')
const interimResult = ref('')

// 语音配置 - 使用模拟处理器
const speechConfig = {
  customHandler: new MockSpeechHandler(),
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

const handleSpeechFinal = () => {
  speechStatus.value = '✅ 识别完成'
  interimResult.value = ''
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
`,J=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; align-items: center; gap: 12px">
      <span style="font-weight: 500">模式：</span>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="mixed" v-model="voiceMode" style="cursor: pointer" />
        <span>混合输入</span>
      </label>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="continuous" v-model="voiceMode" style="cursor: pointer" />
        <span>连续识别</span>
      </label>
    </div>
    <div style="padding: 8px 12px; background: #f5f7fa; border-radius: 4px; font-size: 13px; color: #666">
      {{ voiceMode === 'mixed' ? '语音识别结果追加到输入框，可继续编辑' : '持续识别语音并自动替换内容' }}
    </div>
    <tr-chat-input
      :key="voiceMode"
      mode="multiple"
      :placeholder="voiceMode === 'mixed' ? '点击麦克风说话，识别结果会追加到此处...' : '点击麦克风开始连续识别...'"
    >
      <template #footer-right>
        <VoiceButton
          :speech-config="
            voiceMode === 'mixed'
              ? { autoReplace: false, interimResults: true }
              : { autoReplace: true, continuous: true }
          "
        />
      </template>
    </tr-chat-input>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrChatInput, VoiceButton } from '@opentiny/tiny-robot'

const voiceMode = ref<'mixed' | 'continuous'>('mixed')
<\/script>
`,O=`<template>
  <div class="demo-highlight">
    <h3>高亮模式对比</h3>

    <div class="mode-selector">
      <label>
        <input type="radio" v-model="highlightMode" value="auto" />
        自动匹配
      </label>
      <label>
        <input type="radio" v-model="highlightMode" value="precise" />
        精确指定
      </label>
      <label>
        <input type="radio" v-model="highlightMode" value="custom" />
        自定义函数
      </label>
    </div>

    <p class="mode-description">{{ modeDescription }}</p>

    <ChatInput
      v-model="input"
      :extensions="extensions"
      placeholder="输入 ECS 或 CDN 查看不同高亮效果..."
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChatInput } from '@opentiny/tiny-robot'
import type { SuggestionItem, SuggestionTextPart, StructuredData } from '@opentiny/tiny-robot'

const input = ref('')
const highlightMode = ref<'auto' | 'precise' | 'custom'>('auto')

// 模式说明
const modeDescription = computed(() => {
  switch (highlightMode.value) {
    case 'auto':
      return '自动高亮与输入内容匹配的部分'
    case 'precise':
      return '通过 highlights 数组精确指定需要高亮的文本片段'
    case 'custom':
      return '通过 highlights 函数完全控制高亮逻辑，实现复杂的高亮规则'
    default:
      return ''
  }
})

// 自动匹配模式的建议项
const autoSuggestions: SuggestionItem[] = [
  { content: 'ECS-云服务器卡顿问题' },
  { content: 'ECS-备份弹性云服务器' },
  { content: 'CDN-权限管理配置' },
  { content: 'CDN-缓存刷新问题' },
]

// 精确指定模式的建议项
const preciseSuggestions: SuggestionItem[] = [
  {
    content: 'ECS-云服务器卡顿问题',
    highlights: ['ECS', '云服务器'],
  },
  {
    content: 'ECS-备份弹性云服务器',
    highlights: ['ECS', '弹性云服务器'],
  },
  {
    content: 'CDN-权限管理配置',
    highlights: ['CDN', '权限管理'],
  },
  {
    content: 'CDN-缓存刷新问题',
    highlights: ['CDN', '缓存刷新'],
  },
]

// 自定义函数模式的建议项
const customSuggestions: SuggestionItem[] = [
  {
    content: 'ECS-云服务器卡顿问题',
    highlights: (text: string, _query: string): SuggestionTextPart[] => {
      // 高亮产品名称（ECS）
      const parts = text.split('-')
      return [
        { text: parts[0], isMatch: true },
        { text: '-', isMatch: false },
        { text: parts[1], isMatch: false },
      ]
    },
  },
  {
    content: 'ECS-备份弹性云服务器',
    highlights: (text: string, _query: string): SuggestionTextPart[] => {
      const parts = text.split('-')
      return [
        { text: parts[0], isMatch: true },
        { text: '-', isMatch: false },
        { text: parts[1], isMatch: false },
      ]
    },
  },
  {
    content: 'CDN-权限管理配置',
    highlights: (text: string, _query: string): SuggestionTextPart[] => {
      // 高亮产品名称（CDN）
      const parts = text.split('-')
      return [
        { text: parts[0], isMatch: true },
        { text: '-', isMatch: false },
        { text: parts[1], isMatch: false },
      ]
    },
  },
  {
    content: 'CDN-缓存刷新问题',
    highlights: (text: string, _query: string): SuggestionTextPart[] => {
      const parts = text.split('-')
      return [
        { text: parts[0], isMatch: true },
        { text: '-', isMatch: false },
        { text: parts[1], isMatch: false },
      ]
    },
  },
]

// 当前使用的建议项
const currentSuggestions = computed(() => {
  switch (highlightMode.value) {
    case 'auto':
      return autoSuggestions
    case 'precise':
      return preciseSuggestions
    case 'custom':
      return customSuggestions
    default:
      return autoSuggestions
  }
})

// 配置 Suggestion 扩展
// 高亮模式说明：
// - 区别在于 item.highlights 的配置：
//   * 自动匹配：不设置 highlights，根据用户输入自动高亮
//   * 精确指定：highlights 为数组，指定要高亮的文本片段
//   * 自定义函数：highlights 为函数，完全控制高亮逻辑
const extensions = [
  ChatInput.Suggestion.configure({
    items: currentSuggestions,
    onSelect: (item) => {
      console.log('选中建议:', item.content)
    },
  }),
]

const handleSubmit = (text: string, data?: StructuredData) => {
  console.log('📝 提交内容：', text)
  console.log('📋 结构化数据：', data)
  console.log('🎨 当前高亮模式：', highlightMode.value)
}
<\/script>

<style scoped>
.demo-highlight {
  padding: 20px;
}

.mode-selector {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}

.mode-selector label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
}

.mode-selector input[type='radio'] {
  cursor: pointer;
}

.mode-description {
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #e6f7ff;
  border-left: 3px solid #1890ff;
  color: #666;
  font-size: 14px;
  border-radius: 2px;
}
</style>
`,U=`<template>
  <div class="demo-filter">
    <div class="filter-selector">
      <label>
        <input type="radio" v-model="filterMode" value="default" />
        默认过滤
      </label>
      <label>
        <input type="radio" v-model="filterMode" value="prefix" />
        前缀匹配
      </label>
      <label>
        <input type="radio" v-model="filterMode" value="category" />
        分类匹配
      </label>
    </div>

    <p class="mode-description">{{ modeDescription }}</p>

    <ChatInput
      v-model="input"
      :extensions="extensions"
      placeholder="输入 ECS 或 CDN 查看建议..."
      @submit="handleSubmit"
    />

    <div v-if="selectedItem" class="demo-result"><strong>选中的建议：</strong> {{ selectedItem }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChatInput } from '@opentiny/tiny-robot'
import type { SuggestionItem, StructuredData } from '@opentiny/tiny-robot'

const input = ref('')
const selectedItem = ref('')
const filterMode = ref<'default' | 'prefix' | 'category'>('default')

// 模式说明
const modeDescription = computed(() => {
  switch (filterMode.value) {
    case 'default':
      return '默认过滤：模糊匹配，包含输入内容即可'
    case 'prefix':
      return '前缀匹配：只匹配以输入内容开头的建议'
    case 'category':
      return '分类匹配：只匹配分类标签（ECS、CDN、OSS）'
    default:
      return ''
  }
})

// 建议列表
const suggestions: SuggestionItem[] = [
  { content: 'ECS-云服务器卡顿问题' },
  { content: 'ECS-备份弹性云服务器' },
  { content: 'ECS-实例无法启动' },
  { content: 'CDN-权限管理配置' },
  { content: 'CDN-缓存刷新问题' },
  { content: 'OSS-存储桶访问控制' },
]

// 配置 Suggestion 扩展，使用自定义过滤函数
const extensions = computed(() => [
  ChatInput.Suggestion.configure({
    items: suggestions,
    // 自定义过滤逻辑
    filterFn: (items: SuggestionItem[], query: string) => {
      if (!query) return items

      const lowerQuery = query.toLowerCase()

      switch (filterMode.value) {
        case 'prefix':
          // 前缀匹配
          return items.filter((item) => item.content.toLowerCase().startsWith(lowerQuery))

        case 'category':
          // 分类匹配（只匹配 - 前面的部分）
          return items.filter((item) => {
            const category = item.content.split('-')[0].toLowerCase()
            return category.includes(lowerQuery)
          })

        default:
          // 默认模糊匹配
          return items.filter((item) => item.content.toLowerCase().includes(lowerQuery))
      }
    },
    onSelect: (item) => {
      selectedItem.value = item.content
      console.log('选中建议:', item.content)
    },
  }),
])

const handleSubmit = (text: string, data?: StructuredData) => {
  console.log('📝 提交内容：', text)
  console.log('📋 结构化数据：', data)
}
<\/script>

<style scoped>
.demo-filter {
  padding: 20px;
}

.filter-selector {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}

.filter-selector label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
}

.filter-selector input[type='radio'] {
  cursor: pointer;
}

.mode-description {
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #e6f7ff;
  border-left: 3px solid #1890ff;
  color: #666;
  font-size: 14px;
  border-radius: 2px;
}

.demo-result {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
}
</style>
`,$=`<template>
  <div class="demo-suggestion">
    <h3>基础用法</h3>
    <p class="demo-description">输入任意内容查看建议，支持键盘导航和自动补全</p>
    <ChatInput
      v-model="input"
      :extensions="extensions"
      placeholder="输入 ECS 或 CDN 查看建议..."
      @submit="handleSubmit"
    />

    <div v-if="selectedItem" class="demo-result"><strong>选中的建议：</strong> {{ selectedItem }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChatInput } from '@opentiny/tiny-robot'
import type { SuggestionItem, StructuredData } from '@opentiny/tiny-robot'

const input = ref('')
const selectedItem = ref('')

// 建议列表
const suggestions: SuggestionItem[] = [
  { content: 'ECS-云服务器卡顿问题' },
  { content: 'ECS-备份弹性云服务器' },
  { content: 'ECS-实例无法启动' },
  { content: 'CDN-权限管理配置' },
  { content: 'CDN-缓存刷新问题' },
  { content: 'OSS-存储桶访问控制' },
]

// 配置 Suggestion 扩展
const extensions = [ChatInput.suggestion(suggestions)]

const handleSubmit = (text: string, data?: StructuredData) => {
  console.log('📝 提交内容：', text)
  console.log('📋 结构化数据：', data)
}
<\/script>

<style scoped>
.demo-suggestion {
  padding: 20px;
}

.demo-description {
  margin-bottom: 16px;
  color: #666;
  font-size: 14px;
}

.demo-result {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
}
</style>
`,K=`<script setup lang="ts">
import { ref } from 'vue'
import { ChatInput } from '@opentiny/tiny-robot'
import type { MentionItem, StructuredData } from '@opentiny/tiny-robot'

const content = ref('')
const submittedContent = ref('')

const items: MentionItem[] = [
  {
    label: '小小画家',
    preset: '你是一个专业的绘画助手，擅长帮助用户进行艺术创作和绘画指导。',
  },
  {
    label: '代码助手',
    preset: '你是一个专业的编程助手，精通多种编程语言，能够帮助用户解决编程问题。',
  },
  {
    label: '文案大师',
    preset: '你是一个专业的文案撰写专家，擅长创作各类营销文案和创意内容。',
  },
  {
    label: '数据分析师',
    preset: '你是一个专业的数据分析师，擅长数据处理、统计分析和可视化。',
  },
  {
    label: '翻译专家',
    preset: '你是一个专业的翻译专家，精通多国语言，能够提供准确流畅的翻译服务。',
  },
]

const extensions = [ChatInput.mention(items)]

const handleSubmit = (text: string, data?: StructuredData) => {
  submittedContent.value = text

  console.log('📝 提交内容（纯文本）：', text)
  console.log('📋 结构化数据：', data)
}
<\/script>

<template>
  <div class="mention-demo">
    <div class="demo-tip">
      <p>💡 输入 <code>@</code> 触发提及选择，支持键盘导航（↑↓）和 Enter/Tab 选择</p>
    </div>

    <ChatInput
      v-model="content"
      :extensions="extensions"
      placeholder="输入 @ 选择助手..."
      mode="multiple"
      :max-length="500"
      show-word-limit
      clearable
      @submit="handleSubmit"
    />

    <div v-if="submittedContent" class="result">
      <div class="result-title">提交的内容（纯文本）：</div>
      <div class="result-content">{{ submittedContent }}</div>
    </div>
  </div>
</template>

<style scoped>
.mention-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.demo-tip {
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f0f7ff;
  border-left: 4px solid #1476ff;
  border-radius: 4px;
}

.demo-tip p {
  margin: 0;
  color: #333;
  font-size: 14px;
  line-height: 1.6;
}

.demo-tip code {
  padding: 2px 6px;
  background: rgba(20, 118, 255, 0.1);
  color: #1476ff;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
}

.result {
  padding: 12px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.result-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
}

.result-content {
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
`,tt=`<script setup lang="ts">
import { ref } from 'vue'
import { Button as TinyButton } from '@opentiny/vue'
import { ChatInput } from '@opentiny/tiny-robot'
import type { TemplateItem, StructuredData } from '@opentiny/tiny-robot'

const content = ref('')
const submittedContent = ref('')

const templateData = ref<TemplateItem[]>([])

// 通过 items 传入响应式数据
const extensions = [ChatInput.template(templateData)]

const setTemplate1 = () => {
  templateData.value = [
    { type: 'text', content: '你好，我是' },
    { type: 'block', content: '张三' },
    { type: 'text', content: '，来自' },
    { type: 'block', content: '北京' },
    { type: 'text', content: '，很高兴认识你！' },
  ]
}

const setTemplate2 = () => {
  templateData.value = [
    { type: 'text', content: '请帮我写一份关于' },
    { type: 'block', content: '人工智能' },
    { type: 'text', content: '的' },
    { type: 'block', content: '技术报告' },
    { type: 'text', content: '，字数要求' },
    { type: 'block', content: '3000字' },
    { type: 'text', content: '。' },
  ]
}

const setTemplate3 = () => {
  templateData.value = [
    { type: 'text', content: 'Write an essay about ' },
    {
      type: 'select',
      placeholder: 'Select a topic',
      options: [
        { label: 'Campus Life', value: 'campus life' },
        { label: 'Travel Experience', value: 'travel experience' },
        { label: 'Reading Habits', value: 'reading habits' },
        { label: 'Technology', value: 'technology' },
      ],
      content: '',
    },
    { type: 'text', content: '. The requirement is ' },
    { type: 'block', content: '800' },
    { type: 'text', content: ' words.' },
  ]
}

const setTemplate4 = () => {
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
  ]
}

const handleSubmit = (text: string, data?: StructuredData) => {
  submittedContent.value = text

  console.log('📝 提交内容（纯文本）：', text)
  console.log('📋 结构化数据：', data)
}
<\/script>

<template>
  <div class="template-demo">
    <div class="template-buttons">
      <tiny-button size="small" @click="setTemplate1"> 模板1：自我介绍 </tiny-button>
      <tiny-button size="small" @click="setTemplate2"> 模板2：写报告 </tiny-button>
      <tiny-button size="small" @click="setTemplate3"> 模板3：英文作文（带选择器） </tiny-button>
      <tiny-button size="small" @click="setTemplate4"> 模板4：混合模板 </tiny-button>
    </div>

    <ChatInput
      mode="multiple"
      v-model="content"
      :extensions="extensions"
      placeholder="点击上方按钮插入模板，或直接输入..."
      :max-length="500"
      show-word-limit
      clearable
      @submit="handleSubmit"
    />

    <div v-if="submittedContent" class="result">
      <div class="result-title">提交的内容（纯文本）：</div>
      <div class="result-content">{{ submittedContent }}</div>
    </div>
  </div>
</template>

<style scoped>
.template-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.template-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.result {
  padding: 12px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.result-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
}

.result-content {
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
`,nt=`<template>
  <div class="demo-container">
    <ChatInput
      default-value="测试超出字数限制，当前已经超过了字数限制。"
      placeholder="最多输入 20 个字符..."
      :max-length="20"
      show-word-limit
      mode="multiple"
    />
  </div>
</template>

<script setup lang="ts">
import { ChatInput } from '@opentiny/tiny-robot'
<\/script>
`,et=`<template>
  <div class="demo-container">
    <div class="controls">
      <div class="control-item">
        <label>Loading:</label>
        <tiny-switch v-model="loading"></tiny-switch>
      </div>
      <div class="control-item">
        <label>Disabled:</label>
        <tiny-switch v-model="isDisabled"></tiny-switch>
      </div>
    </div>
    <ChatInput
      v-model="content"
      placeholder="输入内容后提交，模拟加载状态..."
      :loading="loading"
      :disabled="isDisabled"
      stop-text="停止生成"
      clearable
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
    <p v-if="loading" class="loading-tip">正在生成回复...</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChatInput } from '@opentiny/tiny-robot'
import { Switch as TinySwitch } from '@opentiny/vue'

const content = ref('')
const loading = ref(false)
const isDisabled = ref(false)

const handleSubmit = (value: string) => {
  console.log('提交内容:', value)
  loading.value = true

  // 模拟 3 秒后完成
  setTimeout(() => {
    loading.value = false
    content.value = ''
  }, 3000)
}

const handleCancel = () => {
  console.log('取消生成')
  loading.value = false
}
<\/script>

<style scoped>
.demo-container {
  padding: 20px;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.loading-tip {
  margin-top: 10px;
  color: #1476ff;
  font-size: 14px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
`,st=`<template>
  <div class="demo-container">
    <div class="mode-selector">
      <button :class="['mode-btn', { active: mode === 'single' }]" @click="mode = 'single'">单行模式</button>
      <button :class="['mode-btn', { active: mode === 'multiple' }]" @click="mode = 'multiple'">多行模式</button>
    </div>
    <ChatInput
      v-model="content"
      :mode="mode"
      placeholder="尝试切换模式..."
      clearable
      show-word-limit
      :max-length="200"
      @submit="handleSubmit"
    />
    <p class="tip">
      {{ mode === 'single' ? '单行模式：按 Enter 提交' : '多行模式：按 Enter 换行，按 Ctrl+Enter 提交' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChatInput } from '@opentiny/tiny-robot'

const content = ref('')
const mode = ref<'single' | 'multiple'>('single')

const handleSubmit = (value: string) => {
  console.log('提交内容:', value)
  content.value = ''
}
<\/script>

<style scoped>
.demo-container {
  padding: 20px;
}

.mode-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.mode-btn {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn:hover {
  border-color: #1476ff;
  color: #1476ff;
}

.mode-btn.active {
  background: #1476ff;
  border-color: #1476ff;
  color: white;
}

.tip {
  margin-top: 10px;
  color: #666;
  font-size: 14px;
}
</style>
`,ot=JSON.parse('{"title":"ChatInput 聊天输入框","description":"","frontmatter":{"outline":[1,4]},"headers":[],"relativePath":"components/chat-input.md","filePath":"components/chat-input.md"}'),it={name:"components/chat-input.md"},pt=Object.assign(it,{setup(at){const b=p();r(async()=>{b.value=(await h(async()=>{const{default:a}=await import("./chunks/size.EzxiYTcM.js");return{default:a}},__vite__mapDeps([0,1,2]))).default});const v=p();r(async()=>{v.value=(await h(async()=>{const{default:a}=await import("./chunks/methods-demo.lgVAZJQH.js");return{default:a}},__vite__mapDeps([3,1,2]))).default});const f=p();r(async()=>{f.value=(await h(async()=>{const{default:a}=await import("./chunks/custom-slots.DWcAIwWz.js");return{default:a}},__vite__mapDeps([4,1,2]))).default});const E=p();r(async()=>{E.value=(await h(async()=>{const{default:a}=await import("./chunks/submit-type.CuOwixL5.js");return{default:a}},__vite__mapDeps([5,2,1]))).default});const F=p();r(async()=>{F.value=(await h(async()=>{const{default:a}=await import("./chunks/cancel-event.CJV7H4Uv.js");return{default:a}},__vite__mapDeps([6,1,2]))).default});const A=p();r(async()=>{A.value=(await h(async()=>{const{default:a}=await import("./chunks/actions-enhanced.l2LIaX5B.js");return{default:a}},__vite__mapDeps([7,1,2]))).default});const D=p();r(async()=>{D.value=(await h(async()=>{const{default:a}=await import("./chunks/actions-config-basic.BcvuWkhX.js");return{default:a}},__vite__mapDeps([8,1,2]))).default});const C=p();r(async()=>{C.value=(await h(async()=>{const{default:a}=await import("./chunks/voice-custom-ui.Cy1ziqjt.js");return{default:a}},__vite__mapDeps([9,2,1,10]))).default});const x=p();r(async()=>{x.value=(await h(async()=>{const{default:a}=await import("./chunks/voice-custom.CDd2tlar.js");return{default:a}},__vite__mapDeps([11,1,2,12]))).default});const B=p();r(async()=>{B.value=(await h(async()=>{const{default:a}=await import("./chunks/voice-input.D5MgyaJp.js");return{default:a}},__vite__mapDeps([13,2,1]))).default});const T=p();r(async()=>{T.value=(await h(async()=>{const{default:a}=await import("./chunks/suggestion-highlight.nuxPWNhj.js");return{default:a}},__vite__mapDeps([14,2,1]))).default});const _=p();r(async()=>{_.value=(await h(async()=>{const{default:a}=await import("./chunks/suggestion-filter.B66xpxw3.js");return{default:a}},__vite__mapDeps([15,2,1]))).default});const S=p();r(async()=>{S.value=(await h(async()=>{const{default:a}=await import("./chunks/suggestion-basic.CwyrhQA6.js");return{default:a}},__vite__mapDeps([16,1,2]))).default});const W=p();r(async()=>{W.value=(await h(async()=>{const{default:a}=await import("./chunks/mention.CJHgdrke.js");return{default:a}},__vite__mapDeps([17,1,2]))).default});const I=p();r(async()=>{I.value=(await h(async()=>{const{default:a}=await import("./chunks/template-editor.CrsNjqxQ.js");return{default:a}},__vite__mapDeps([18,1,2]))).default});const w=p();r(async()=>{w.value=(await h(async()=>{const{default:a}=await import("./chunks/word-limit.B4q_leMV.js");return{default:a}},__vite__mapDeps([19,1,2]))).default});const L=p();r(async()=>{L.value=(await h(async()=>{const{default:a}=await import("./chunks/loading-state.CC2CUmWl.js");return{default:a}},__vite__mapDeps([20,1,2]))).default});const i=V(!0),Z=p();return r(async()=>{Z.value=(await h(async()=>{const{default:a}=await import("./chunks/mode-switch.BIwGzlw1.js");return{default:a}},__vite__mapDeps([21,1,2]))).default}),(a,t)=>{const o=q("ClientOnly");return G(),X("div",null,[t[18]||(t[18]=y('<h1 id="chatinput-聊天输入框" tabindex="-1">ChatInput 聊天输入框 <a class="header-anchor" href="#chatinput-聊天输入框" aria-label="Permalink to &quot;ChatInput 聊天输入框&quot;">​</a></h1><p><code>ChatInput</code> 是一个基于 <a href="https://tiptap.dev/" target="_blank" rel="noreferrer">Tiptap</a> 构建的高度可组合聊天输入组件。</p><ul><li><a href="#代码示例">代码示例</a> - 模式切换、状态控制、内容管理</li><li><a href="#输入增强">输入增强</a> - 模板填充、提及功能</li><li><a href="#交互定制">交互定制</a> - 快捷键、自定义底部、方法调用</li><li><a href="#样式配置">样式配置</a> - 主题、组件尺寸</li></ul><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="输入模式" tabindex="-1">输入模式 <a class="header-anchor" href="#输入模式" aria-label="Permalink to &quot;输入模式&quot;">​</a></h3><p><code>ChatInput</code> 支持单行和多行两种输入模式，通过 <code>mode</code> 属性控制。</p><div class="tip custom-block"><p class="custom-block-title">单行模式自动切换</p><p>在单行模式下，当输入内容超出宽度时，会自动切换为多行模式。</p><p>当 <code>submitType=&quot;enter&quot;</code> 时，按 <code>Ctrl+Enter</code> 或 <code>Shift+Enter</code> 也会自动切换为多行模式并换行。</p></div>',7)),c(n(e(g),null,null,512),[[u,i.value]]),n(o,null,{default:l(()=>[n(e(m),{title:"输入模式",description:"支持单行和多行模式，单行模式可自动切换为多行。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{i.value=!1}),vueCode:e(st)},k({_:2},[Z.value?{name:"vue",fn:l(()=>[n(e(Z))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[19]||(t[19]=s("h3",{id:"状态控制",tabindex:"-1"},[d("状态控制 "),s("a",{class:"header-anchor",href:"#状态控制","aria-label":'Permalink to "状态控制"'},"​")],-1)),t[20]||(t[20]=s("p",null,[d("通过 "),s("code",null,"loading"),d(" 和 "),s("code",null,"disabled"),d(" 属性控制组件状态。加载状态下可点击图标取消操作。")],-1)),c(n(e(g),null,null,512),[[u,i.value]]),n(o,null,{default:l(()=>[n(e(m),{title:"加载与禁用状态",description:"展示加载和禁用两种状态的表现。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[1]||(t[1]=()=>{i.value=!1}),vueCode:e(et)},k({_:2},[L.value?{name:"vue",fn:l(()=>[n(e(L))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[21]||(t[21]=y('<h3 id="内容管理" tabindex="-1">内容管理 <a class="header-anchor" href="#内容管理" aria-label="Permalink to &quot;内容管理&quot;">​</a></h3><h4 id="字数限制" tabindex="-1">字数限制 <a class="header-anchor" href="#字数限制" aria-label="Permalink to &quot;字数限制&quot;">​</a></h4><p>通过 <code>maxLength</code> 和 <code>showWordLimit</code> 属性实现字数限制和统计。</p><div class="warning custom-block"><p class="custom-block-title">超出限制行为</p><p>超出字数限制时，不会自动截断内容，但会以红色标示真实字数，且无法提交。</p></div>',4)),c(n(e(g),null,null,512),[[u,i.value]]),n(o,null,{default:l(()=>[n(e(m),{title:"字数限制",description:"限制输入字符数并显示字数统计。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[2]||(t[2]=()=>{i.value=!1}),vueCode:e(nt)},k({_:2},[w.value?{name:"vue",fn:l(()=>[n(e(w))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[22]||(t[22]=y(`<h2 id="输入增强" tabindex="-1">输入增强 <a class="header-anchor" href="#输入增强" aria-label="Permalink to &quot;输入增强&quot;">​</a></h2><p><code>ChatInput</code> 采用可插拔的扩展架构，通过 <code>extensions</code> prop 灵活添加功能。所有扩展都支持响应式数据自动同步。</p><h3 id="扩展使用" tabindex="-1">扩展使用 <a class="header-anchor" href="#扩展使用" aria-label="Permalink to &quot;扩展使用&quot;">​</a></h3><p>提供两种集成方式：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { ChatInput } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 便捷函数（推荐）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ChatInput.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mention</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(mentions, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;@&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ChatInput.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">suggestion</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(suggestions) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 不过滤</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ChatInput.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">suggestion</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(suggestions, { filterFn: customFilter }) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 自定义过滤</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ChatInput.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(templates)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 标准配置（用于复杂场景）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ChatInput.Mention.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">configure</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ items: mentions, char: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;@&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, allowSpaces: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ChatInput.Suggestion.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">configure</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ items: suggestions, filterFn: customFilter })</span></span></code></pre></div><h3 id="模板编辑" tabindex="-1">模板编辑 <a class="header-anchor" href="#模板编辑" aria-label="Permalink to &quot;模板编辑&quot;">​</a></h3><p>使用 <code>Template</code> 扩展实现模板填充功能，支持动态设置模板内容，光标自动聚焦到第一个可编辑字段。</p><div class="tip custom-block"><p class="custom-block-title">响应式数据</p><p>通过 <code>items</code> 配置项传入响应式 ref，模板数据变化时会自动更新编辑器内容。</p></div>`,8)),c(n(e(g),null,null,512),[[u,i.value]]),n(o,null,{default:l(()=>[n(e(m),{title:"模板填充",description:"支持动态模板切换，自动聚焦可编辑字段。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[3]||(t[3]=()=>{i.value=!1}),vueCode:e(tt)},k({_:2},[I.value?{name:"vue",fn:l(()=>[n(e(I))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[23]||(t[23]=y('<p><strong>配置详见</strong>：<a href="#template">扩展属性 - Template</a></p><h3 id="提及功能" tabindex="-1">提及功能 <a class="header-anchor" href="#提及功能" aria-label="Permalink to &quot;提及功能&quot;">​</a></h3><p>使用 <code>Mention</code> 扩展实现 @提及功能，输入触发字符（默认 <code>@</code>）触发提及选择，快速引用预设的助手或对象，支持键盘导航和搜索过滤。</p><div class="tip custom-block"><p class="custom-block-title">自定义触发字符</p><p>支持自定义触发字符，例如使用 <code>#</code> 代替 <code>@</code>。配置 <code>char: &#39;#&#39;</code> 后，输入 <code>#</code> 即可触发提及列表，选中后显示为 <code>#标签名</code> 的格式。</p></div><div class="tip custom-block"><p class="custom-block-title">删除提及</p><p>按 <code>Backspace</code> 删除提及项时会保留触发字符（如 <code>@</code> 或 <code>#</code>），可继续选择其他项。</p></div>',5)),c(n(e(g),null,null,512),[[u,i.value]]),n(o,null,{default:l(()=>[n(e(m),{title:"提及功能",description:"输入 @ 触发提及选择，快速引用预设的助手或对象，支持键盘导航和搜索过滤。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[4]||(t[4]=()=>{i.value=!1}),vueCode:e(K)},k({_:2},[W.value?{name:"vue",fn:l(()=>[n(e(W))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[24]||(t[24]=y('<p><strong>配置详见</strong>：<a href="#mention">扩展属性 - Mention</a></p><h3 id="智能联想" tabindex="-1">智能联想 <a class="header-anchor" href="#智能联想" aria-label="Permalink to &quot;智能联想&quot;">​</a></h3><p>使用 <code>Suggestion</code> 扩展实现智能联想功能，支持键盘导航（↑↓ 选择，Enter 确认）和自动补全提示。</p><div class="tip custom-block"><p class="custom-block-title">自动补全提示</p><p>选中建议项时，输入框会以灰色文本显示剩余部分，并显示 &quot;TAB&quot; 提示，按 Tab 键快速应用补全。</p></div><h4 id="基础用法" tabindex="-1">基础用法 <a class="header-anchor" href="#基础用法" aria-label="Permalink to &quot;基础用法&quot;">​</a></h4><p>不传 <code>filterFn</code> 时，直接显示所有建议项，不做任何过滤。</p>',6)),c(n(e(g),null,null,512),[[u,i.value]]),n(o,null,{default:l(()=>[n(e(m),{title:"基础用法",description:"直接显示所有建议项，不过滤。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[5]||(t[5]=()=>{i.value=!1}),vueCode:e($)},k({_:2},[S.value?{name:"vue",fn:l(()=>[n(e(S))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[25]||(t[25]=s("h4",{id:"自定义过滤",tabindex:"-1"},[d("自定义过滤 "),s("a",{class:"header-anchor",href:"#自定义过滤","aria-label":'Permalink to "自定义过滤"'},"​")],-1)),t[26]||(t[26]=s("p",null,[d("通过 "),s("code",null,"filterFn"),d(" 自定义过滤逻辑，实现模糊匹配、前缀匹配等。")],-1)),c(n(e(g),null,null,512),[[u,i.value]]),n(o,null,{default:l(()=>[n(e(m),{title:"自定义过滤",description:"使用 filterFn 实现自定义过滤逻辑。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[6]||(t[6]=()=>{i.value=!1}),vueCode:e(U)},k({_:2},[_.value?{name:"vue",fn:l(()=>[n(e(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[27]||(t[27]=y('<h4 id="高亮模式" tabindex="-1">高亮模式 <a class="header-anchor" href="#高亮模式" aria-label="Permalink to &quot;高亮模式&quot;">​</a></h4><p>支持三种高亮模式，满足不同的使用场景：</p><ol><li><strong>自动匹配</strong>：不设置 <code>highlights</code>，自动高亮与输入内容匹配的部分</li><li><strong>精确指定</strong>：通过 <code>highlights</code> 数组精确指定需要高亮的文本片段</li><li><strong>自定义函数</strong>：通过 <code>highlights</code> 函数完全控制高亮逻辑，实现复杂的高亮规则</li></ol>',3)),c(n(e(g),null,null,512),[[u,i.value]]),n(o,null,{default:l(()=>[n(e(m),{title:"高亮模式",description:"动态切换三种高亮模式，对比不同的高亮效果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[7]||(t[7]=()=>{i.value=!1}),vueCode:e(O)},k({_:2},[T.value?{name:"vue",fn:l(()=>[n(e(T))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[28]||(t[28]=y('<p><strong>配置详见</strong>：<a href="#suggestion">扩展属性 - Suggestion</a></p><h3 id="语音输入" tabindex="-1">语音输入 <a class="header-anchor" href="#语音输入" aria-label="Permalink to &quot;语音输入&quot;">​</a></h3><p>通过 <code>VoiceButton</code> 组件实现语音输入功能，支持浏览器内置语音识别和第三方语音识别服务。</p><div class="tip custom-block"><p class="custom-block-title">组件化设计</p><p>语音输入功能通过独立的 <code>VoiceButton</code> 组件实现，可按需添加到 <code>footer</code> 插槽中，无需额外配置。</p></div><h4 id="基础语音识别" tabindex="-1">基础语音识别 <a class="header-anchor" href="#基础语音识别" aria-label="Permalink to &quot;基础语音识别&quot;">​</a></h4><p>使用浏览器内置的语音识别功能，支持混合输入和连续识别两种模式。</p>',6)),c(n(e(g),null,null,512),[[u,i.value]]),n(o,null,{default:l(()=>[n(e(m),{title:"基础语音输入",description:"使用浏览器内置语音识别，支持混合输入和连续识别。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[8]||(t[8]=()=>{i.value=!1}),vueCode:e(J)},k({_:2},[B.value?{name:"vue",fn:l(()=>[n(e(B))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[29]||(t[29]=s("h4",{id:"自定义语音服务",tabindex:"-1"},[d("自定义语音服务 "),s("a",{class:"header-anchor",href:"#自定义语音服务","aria-label":'Permalink to "自定义语音服务"'},"​")],-1)),t[30]||(t[30]=s("p",null,"支持集成第三方语音识别服务（如阿里云、百度、Azure 等）。",-1)),c(n(e(g),null,null,512),[[u,i.value]]),n(o,null,{default:l(()=>[n(e(m),{title:"自定义语音识别",description:"集成第三方语音识别服务，参考 speechHandlers.ts 查看完整实现。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[9]||(t[9]=()=>{i.value=!1}),vueCode:e(Q)},k({_:2},[x.value?{name:"vue",fn:l(()=>[n(e(x))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[31]||(t[31]=s("div",{class:"tip custom-block"},[s("p",{class:"custom-block-title"},"参考实现"),s("p",null,[s("code",null,"speechHandlers.ts"),d(" 提供了阿里云一句话识别和实时识别的完整示例，包括录音处理、API 调用、流式识别等。")])],-1)),t[32]||(t[32]=s("h4",{id:"自定义录音-ui",tabindex:"-1"},[d("自定义录音 UI "),s("a",{class:"header-anchor",href:"#自定义录音-ui","aria-label":'Permalink to "自定义录音 UI"'},"​")],-1)),t[33]||(t[33]=s("p",null,"支持完全自定义语音录制界面，适用于移动端按住说话等场景。",-1)),c(n(e(g),null,null,512),[[u,i.value]]),n(o,null,{default:l(()=>[n(e(m),{title:"移动端按住说话",description:"自定义录音 UI，展示移动端按住说话的交互模式。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[10]||(t[10]=()=>{i.value=!1}),vueCode:e(H)},k({_:2},[C.value?{name:"vue",fn:l(()=>[n(e(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[34]||(t[34]=y('<p><strong>配置详见</strong>：<a href="#voicebutton">VoiceButton 属性</a></p><h3 id="按钮配置" tabindex="-1">按钮配置 <a class="header-anchor" href="#按钮配置" aria-label="Permalink to &quot;按钮配置&quot;">​</a></h3><h4 id="默认按钮配置" tabindex="-1">默认按钮配置 <a class="header-anchor" href="#默认按钮配置" aria-label="Permalink to &quot;默认按钮配置&quot;">​</a></h4><p>通过 <code>defaultActions</code> 属性统一配置默认按钮（Clear、Submit）的状态和提示。</p>',4)),c(n(e(g),null,null,512),[[u,i.value]]),n(o,null,{default:l(()=>[n(e(m),{title:"默认按钮配置",description:"通过 defaultActions 统一配置默认按钮的状态和提示。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[11]||(t[11]=()=>{i.value=!1}),vueCode:e(Y)},k({_:2},[D.value?{name:"vue",fn:l(()=>[n(e(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[35]||(t[35]=s("h4",{id:"增强按钮",tabindex:"-1"},[d("增强按钮 "),s("a",{class:"header-anchor",href:"#增强按钮","aria-label":'Permalink to "增强按钮"'},"​")],-1)),t[36]||(t[36]=s("p",null,"通过插槽添加增强按钮（Upload、Voice 等），每个按钮都有独立的配置。",-1)),c(n(e(g),null,null,512),[[u,i.value]]),n(o,null,{default:l(()=>[n(e(m),{title:"增强按钮",description:"通过插槽添加 Upload、Voice 等增强按钮。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[12]||(t[12]=()=>{i.value=!1}),vueCode:e(z)},k({_:2},[A.value?{name:"vue",fn:l(()=>[n(e(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[37]||(t[37]=s("h3",{id:"交互定制",tabindex:"-1"},[d("交互定制 "),s("a",{class:"header-anchor",href:"#交互定制","aria-label":'Permalink to "交互定制"'},"​")],-1)),t[38]||(t[38]=s("h4",{id:"取消操作",tabindex:"-1"},[d("取消操作 "),s("a",{class:"header-anchor",href:"#取消操作","aria-label":'Permalink to "取消操作"'},"​")],-1)),t[39]||(t[39]=s("p",null,[d("在 loading 状态下，点击停止按钮会触发 "),s("code",null,"cancel"),d(" 事件，用于取消正在进行的操作（如 AI 响应）。")],-1)),c(n(e(g),null,null,512),[[u,i.value]]),n(o,null,{default:l(()=>[n(e(m),{title:"取消操作",description:"loading 状态下点击停止按钮触发 cancel 事件。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[13]||(t[13]=()=>{i.value=!1}),vueCode:e(N)},k({_:2},[F.value?{name:"vue",fn:l(()=>[n(e(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[40]||(t[40]=s("h4",{id:"提交方式",tabindex:"-1"},[d("提交方式 "),s("a",{class:"header-anchor",href:"#提交方式","aria-label":'Permalink to "提交方式"'},"​")],-1)),t[41]||(t[41]=s("p",null,[d("通过 "),s("code",null,"submitType"),d(" 属性控制提交快捷键，支持 "),s("code",null,"enter"),d("、"),s("code",null,"ctrlEnter"),d("、"),s("code",null,"shiftEnter"),d(" 三种方式。")],-1)),c(n(e(g),null,null,512),[[u,i.value]]),n(o,null,{default:l(()=>[n(e(m),{title:"提交方式",description:"支持三种提交快捷键，适应不同使用场景。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[14]||(t[14]=()=>{i.value=!1}),vueCode:e(j)},k({_:2},[E.value?{name:"vue",fn:l(()=>[n(e(E))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[42]||(t[42]=y('<h4 id="快捷键参考" tabindex="-1">快捷键参考 <a class="header-anchor" href="#快捷键参考" aria-label="Permalink to &quot;快捷键参考&quot;">​</a></h4><table tabindex="0"><thead><tr><th>快捷键</th><th>功能</th><th>适用条件</th></tr></thead><tbody><tr><td>Enter</td><td>提交内容 / 换行</td><td>submitType=&quot;enter&quot;</td></tr><tr><td>Ctrl+Enter</td><td>提交内容 / 换行</td><td>submitType=&quot;ctrlEnter&quot; / submitType=&quot;enter&quot;</td></tr><tr><td>Shift+Enter</td><td>提交内容 / 换行</td><td>submitType=&quot;shiftEnter&quot; / submitType=&quot;enter&quot;</td></tr><tr><td>Tab</td><td>选中联想项</td><td>联想开启时</td></tr><tr><td>Esc</td><td>关闭联想</td><td>联想开启时</td></tr><tr><td>↑ / ↓</td><td>导航联想项</td><td>联想开启时</td></tr></tbody></table><div class="info custom-block"><p class="custom-block-title">换行与提交行为说明</p><ul><li><strong><code>submitType=&quot;enter&quot;</code></strong> 时：按 <code>Enter</code> 提交，按 <code>Ctrl+Enter</code> 或 <code>Shift+Enter</code> 换行</li><li><strong><code>submitType=&quot;ctrlEnter&quot;</code></strong> 时：按 <code>Ctrl+Enter</code> 提交，按 <code>Enter</code> 换行</li><li><strong><code>submitType=&quot;shiftEnter&quot;</code></strong> 时：按 <code>Shift+Enter</code> 提交，按 <code>Enter</code> 换行</li></ul><p>在单行模式下使用换行快捷键时，会自动切换为多行模式。</p></div><div class="tip custom-block"><p class="custom-block-title">自定义选中按键</p><p>通过 <code>activeSuggestionKeys</code> 可自定义选中联想项的按键。默认支持 <code>Enter</code> 和 <code>Tab</code>。</p></div><h4 id="自定义插槽" tabindex="-1">自定义插槽 <a class="header-anchor" href="#自定义插槽" aria-label="Permalink to &quot;自定义插槽&quot;">​</a></h4><p>ChatInput 提供了多个插槽位置，方便扩展功能：</p><ul><li><strong><code>header</code></strong> - 顶部区域，可添加标题、提示信息等</li><li><strong><code>prefix</code></strong> - 输入框前缀区域，可添加图标、标签等（位于输入框内部）</li><li><strong><code>footer</code></strong> - 底部左侧区域，可添加功能按钮</li><li><strong><code>footer-right</code></strong> - 底部右侧区域，可添加操作按钮</li></ul><div class="tip custom-block"><p class="custom-block-title">插槽作用域</p><p><code>footer</code> 和 <code>footer-right</code> 插槽提供了作用域数据，包括 <code>editor</code>、<code>hasContent</code>、<code>disabled</code>、<code>loading</code> 等状态，以及 <code>focus</code>、<code>insert</code>、<code>append</code>、<code>replace</code> 等操作方法，可用于实现自定义功能按钮。</p></div>',8)),c(n(e(g),null,null,512),[[u,i.value]]),n(o,null,{default:l(()=>[n(e(m),{title:"自定义插槽",description:"在插槽区域添加自定义按钮，如深度思考、网络搜索等功能。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[15]||(t[15]=()=>{i.value=!1}),vueCode:e(M)},k({_:2},[f.value?{name:"vue",fn:l(()=>[n(e(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[43]||(t[43]=s("h4",{id:"方法调用",tabindex:"-1"},[d("方法调用 "),s("a",{class:"header-anchor",href:"#方法调用","aria-label":'Permalink to "方法调用"'},"​")],-1)),c(n(e(g),null,null,512),[[u,i.value]]),n(o,null,{default:l(()=>[n(e(m),{title:"方法调用",description:"通过 ref 调用组件方法，如聚焦、设置内容等。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[16]||(t[16]=()=>{i.value=!1}),vueCode:e(P)},k({_:2},[v.value?{name:"vue",fn:l(()=>[n(e(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[44]||(t[44]=y('<h3 id="样式配置" tabindex="-1">样式配置 <a class="header-anchor" href="#样式配置" aria-label="Permalink to &quot;样式配置&quot;">​</a></h3><h4 id="主题支持" tabindex="-1">主题支持 <a class="header-anchor" href="#主题支持" aria-label="Permalink to &quot;主题支持&quot;">​</a></h4><div class="tip custom-block"><p class="custom-block-title">主题继承</p><p>主题会根据父级 <code>ThemeProvider</code> 的配置自动继承，无需重复设置。</p></div><h4 id="组件尺寸" tabindex="-1">组件尺寸 <a class="header-anchor" href="#组件尺寸" aria-label="Permalink to &quot;组件尺寸&quot;">​</a></h4><p>通过 <code>size</code> 属性控制组件尺寸，支持 <code>normal</code>（默认）和 <code>small</code>（紧凑）两种尺寸。</p>',5)),c(n(e(g),null,null,512),[[u,i.value]]),n(o,null,{default:l(()=>[n(e(m),{title:"组件尺寸",description:"支持正常和紧凑两种尺寸，适应不同的使用场景。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[17]||(t[17]=()=>{i.value=!1}),vueCode:e(R)},k({_:2},[b.value?{name:"vue",fn:l(()=>[n(e(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[45]||(t[45]=y(`<h2 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h2><h4 id="basicinput" tabindex="-1">BasicInput <a class="header-anchor" href="#basicinput" aria-label="Permalink to &quot;BasicInput&quot;">​</a></h4><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td>modelValue</td><td>绑定值(v-model)</td><td><code>string</code></td><td><code>&#39;&#39;</code></td></tr><tr><td>defaultValue</td><td>默认值(非响应式)</td><td><code>string</code></td><td><code>&#39;&#39;</code></td></tr><tr><td>placeholder</td><td>输入框占位文本</td><td><code>string</code></td><td><code>&#39;请输入内容...&#39;</code></td></tr><tr><td>mode</td><td>输入模式</td><td><code>&#39;single&#39; | &#39;multiple&#39;</code></td><td><code>&#39;single&#39;</code></td></tr><tr><td>size</td><td>组件尺寸</td><td><code>&#39;normal&#39; | &#39;small&#39;</code></td><td><code>&#39;normal&#39;</code></td></tr><tr><td>disabled</td><td>是否禁用</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td>loading</td><td>是否加载中</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td>autofocus</td><td>自动获取焦点</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td>autoSize</td><td>自动调整高度，仅在 mode === &#39;multiple&#39; 时有效</td><td><code>boolean | { minRows: number, maxRows: number }</code></td><td><code>{ minRows: 1, maxRows: 5 }</code></td></tr><tr><td>clearable</td><td>是否可清空</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td>maxLength</td><td>最大输入长度</td><td><code>number</code></td><td><code>Infinity</code></td></tr><tr><td>showWordLimit</td><td>是否显示字数统计</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td>submitType</td><td>提交方式</td><td><code>&#39;enter&#39; | &#39;ctrlEnter&#39; | &#39;shiftEnter&#39;</code></td><td><code>&#39;enter&#39;</code></td></tr><tr><td>stopText</td><td>停止按钮文字</td><td><code>string</code></td><td><code>&#39;停止响应&#39;</code></td></tr><tr><td>defaultActions</td><td>默认操作按钮配置，用于统一配置默认按钮（Clear、Submit）的状态和提示</td><td><code>DefaultActions</code></td><td><code>undefined</code></td></tr></tbody></table><h4 id="extension" tabindex="-1">Extension <a class="header-anchor" href="#extension" aria-label="Permalink to &quot;Extension&quot;">​</a></h4><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td>extensions</td><td>扩展列表，用于添加功能（Template、Mention、Suggestion 等）</td><td><code>Extension[]</code></td><td><code>[]</code></td></tr></tbody></table><div class="tip custom-block"><p class="custom-block-title">扩展系统</p><p>使用 <code>extensions</code> 属性配置功能扩展，提供灵活的配置和完整的类型支持。</p></div><h4 id="template" tabindex="-1">Template <a class="header-anchor" href="#template" aria-label="Permalink to &quot;Template&quot;">​</a></h4><p>模板填充功能扩展，支持动态设置模板内容。</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 便捷函数</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ChatInput.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(templates)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 标准配置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ChatInput.Template.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">configure</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ items: templates })</span></span></code></pre></div><table tabindex="0"><thead><tr><th>配置项</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>items</code></td><td><code>TemplateItem[]</code> | <code>Ref&lt;TemplateItem[]&gt;</code></td><td>模板数据列表</td></tr></tbody></table><h4 id="mention" tabindex="-1">Mention <a class="header-anchor" href="#mention" aria-label="Permalink to &quot;Mention&quot;">​</a></h4><p>@提及功能扩展，支持快速引用预设的助手或对象，支持自定义触发字符。</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 便捷函数（使用默认 &#39;@&#39; 触发）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ChatInput.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mention</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(mentions)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 便捷函数（自定义触发字符）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ChatInput.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mention</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(mentions, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;#&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 使用 &#39;#&#39; 触发</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 标准配置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ChatInput.Mention.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">configure</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ items: mentions, char: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;@&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, allowSpaces: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> })</span></span></code></pre></div><table tabindex="0"><thead><tr><th>配置项</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>items</code></td><td><code>MentionItem[]</code> | <code>Ref&lt;MentionItem[]&gt;</code></td><td><code>[]</code></td><td>提及项列表，支持响应式 ref</td></tr><tr><td><code>char</code></td><td><code>string</code></td><td><code>&#39;@&#39;</code></td><td>触发字符，支持任意字符（如 <code>&#39;@&#39;</code>、<code>&#39;#&#39;</code>、<code>&#39;!&#39;</code> 等）</td></tr><tr><td><code>allowSpaces</code></td><td><code>boolean</code></td><td><code>false</code></td><td>是否允许在触发字符后输入空格</td></tr><tr><td><code>onSelect</code></td><td><code>Function</code></td><td>-</td><td>选中提及项时的回调函数</td></tr></tbody></table><h4 id="suggestion" tabindex="-1">Suggestion <a class="header-anchor" href="#suggestion" aria-label="Permalink to &quot;Suggestion&quot;">​</a></h4><p>智能联想功能扩展，支持自动过滤、自定义过滤和多种高亮方式。</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 便捷函数</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ChatInput.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">suggestion</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(suggestions) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 不过滤，显示所有项</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ChatInput.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">suggestion</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(suggestions, { filterFn: customFilter }) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 自定义过滤</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 标准配置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ChatInput.Suggestion.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">configure</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  items: suggestions,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  filterFn</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">items</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">query</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> items.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">filter</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">item</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> item.content.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">includes</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(query)),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  showAutoComplete: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><table tabindex="0"><thead><tr><th>配置项</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>items</code></td><td><code>SuggestionItem[]</code> | <code>Ref&lt;SuggestionItem[]&gt;</code></td><td><code>[]</code></td><td>建议项列表</td></tr><tr><td><code>filterFn</code></td><td><code>Function</code></td><td><code>undefined</code></td><td>过滤函数（不传则不过滤）</td></tr><tr><td><code>showAutoComplete</code></td><td><code>boolean</code></td><td><code>true</code></td><td>自动补全</td></tr><tr><td><code>activeSuggestionKeys</code></td><td><code>string[]</code></td><td><code>[&#39;Enter&#39;]</code></td><td>激活按键</td></tr><tr><td><code>popupWidth</code></td><td><code>number</code> | <code>string</code></td><td><code>400</code></td><td>弹窗宽度</td></tr><tr><td><code>onSelect</code></td><td><code>(item) =&gt; void | false</code></td><td>-</td><td>选中回调，返回 false 阻止默认回填</td></tr></tbody></table><div class="tip custom-block"><p class="custom-block-title">popupWidth 格式</p><p>支持数字（如 <code>500</code>）、百分比（如 <code>&#39;100%&#39;</code>）、CSS 单位（如 <code>&#39;20rem&#39;</code>）</p></div><p><strong>高亮方式</strong>：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{ </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">content</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;ECS-云服务器&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 自动匹配</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{ </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">content</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;RDS-数据库&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">highlights</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;RDS&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;数据库&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] }  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 精确指定</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{ </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">content</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;OSS-存储&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">highlights</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">text</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">query</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">...</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] }  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 自定义函数</span></span></code></pre></div><p><strong>onSelect 回调</strong>：</p><p>选中建议项时触发，返回 <code>false</code> 可阻止默认回填行为：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 默认行为：自动回填</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onSelect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">item</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Selected:&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, item)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 不返回 false，内容会自动回填到编辑器</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 阻止默认回填并自定义</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onSelect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">item</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  editor.commands.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setContent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`前缀-\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">item</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">content</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}-后缀\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 阻止默认回填</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 条件性阻止</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onSelect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">item</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (item.data?.needsValidation) {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    validateAndFill</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(item)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 否则使用默认回填</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><div class="tip custom-block"><p class="custom-block-title">回调参数</p><p><code>item</code> 包含完整的 <code>SuggestionItem</code> 信息（<code>content</code>、<code>label</code>、<code>data</code>、<code>highlights</code>），可用于业务逻辑处理。</p></div><h4 id="uploadbutton" tabindex="-1">UploadButton <a class="header-anchor" href="#uploadbutton" aria-label="Permalink to &quot;UploadButton&quot;">​</a></h4><p>文件上传按钮组件，支持文件类型过滤、大小限制和数量限制。</p><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td>disabled</td><td>是否禁用</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td>accept</td><td>接受的文件类型</td><td><code>string</code></td><td><code>&#39;*&#39;</code></td></tr><tr><td>multiple</td><td>是否支持多选</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td>reset</td><td>选择后是否重置 input</td><td><code>boolean</code></td><td><code>true</code></td></tr><tr><td>maxSize</td><td>文件大小限制（MB）</td><td><code>number</code></td><td>-</td></tr><tr><td>maxCount</td><td>最大文件数量</td><td><code>number</code></td><td>-</td></tr><tr><td>tooltip</td><td>Tooltip</td><td><code>TooltipContent</code></td><td><code>-</code></td></tr><tr><td>tooltipPlacement</td><td>Tooltip 位置</td><td><code>TooltipPlacement</code></td><td><code>&#39;top&#39;</code></td></tr><tr><td>icon</td><td>自定义图标</td><td><code>VNode | Component</code></td><td><code>IconUpload</code></td></tr><tr><td>size</td><td>按钮尺寸</td><td><code>number | string</code></td><td><code>32</code></td></tr></tbody></table><h4 id="voicebutton" tabindex="-1">VoiceButton <a class="header-anchor" href="#voicebutton" aria-label="Permalink to &quot;VoiceButton&quot;">​</a></h4><p>语音输入按钮组件，支持浏览器内置语音识别和第三方语音识别服务。</p><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td>icon</td><td>自定义图标</td><td><code>VNode | Component</code></td><td><code>IconVoice</code></td></tr><tr><td>disabled</td><td>是否禁用</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td>size</td><td>按钮尺寸</td><td><code>&#39;small&#39; | &#39;normal&#39;</code></td><td><code>&#39;normal&#39;</code></td></tr><tr><td>tooltip</td><td>Tooltip</td><td><code>TooltipContent</code></td><td><code>-</code></td></tr><tr><td>tooltipPlacement</td><td>Tooltip 位置</td><td><code>TooltipPlacement</code></td><td><code>&#39;top&#39;</code></td></tr><tr><td>speechConfig</td><td>语音配置</td><td><code>SpeechConfig</code></td><td>-</td></tr><tr><td>autoInsert</td><td>是否自动插入识别结果到编辑器</td><td><code>boolean</code></td><td><code>true</code></td></tr><tr><td>onButtonClick</td><td>按钮点击拦截器</td><td><code>Function</code></td><td>-</td></tr></tbody></table><h2 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h2><table tabindex="0"><thead><tr><th>插槽名称</th><th>描述</th><th>默认内容</th><th>作用域参数</th></tr></thead><tbody><tr><td><code>header</code></td><td>头部插槽，位于输入框上方</td><td>无</td><td>-</td></tr><tr><td><code>prefix</code></td><td>前缀插槽，位于输入框左侧</td><td>无</td><td>-</td></tr><tr><td><code>content</code></td><td>内容插槽，用于完全自定义编辑器内容</td><td>输入内容区域</td><td><code>{ editor }</code></td></tr><tr><td><code>actions-inline</code></td><td>单行模式下的操作按钮区域</td><td>提交按钮、技能按钮等</td><td>-</td></tr><tr><td><code>footer</code></td><td>底部完全自定义插槽</td><td>字数限制、多行模式操作按钮</td><td>-</td></tr><tr><td><code>footer-right</code></td><td>底部右侧插槽，保留字数限制</td><td>多行模式下的操作按钮</td><td>-</td></tr></tbody></table><h2 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h2><h4 id="basicinput-1" tabindex="-1">BasicInput <a class="header-anchor" href="#basicinput-1" aria-label="Permalink to &quot;BasicInput&quot;">​</a></h4><table tabindex="0"><thead><tr><th>事件名</th><th>说明</th><th>回调参数</th></tr></thead><tbody><tr><td>update:modelValue</td><td>输入值变化时触发(v-model)</td><td><code>(value: string)</code></td></tr><tr><td>blur</td><td>输入框失去焦点时触发</td><td><code>(event: FocusEvent)</code></td></tr><tr><td>focus</td><td>输入框获得焦点时触发</td><td><code>(event: FocusEvent)</code></td></tr><tr><td>submit</td><td>提交内容时触发</td><td><code>(text: string, data?: StructuredData)</code></td></tr><tr><td>clear</td><td>清空内容时触发</td><td><code>()</code></td></tr><tr><td>cancel</td><td>在 loading 状态下点击停止按钮时触发，用于取消正在进行的操作（如 AI 响应）</td><td><code>()</code></td></tr><tr><td>input</td><td>输入内容变化时触发</td><td><code>(value: string)</code></td></tr></tbody></table><h4 id="uploadbutton-1" tabindex="-1">UploadButton <a class="header-anchor" href="#uploadbutton-1" aria-label="Permalink to &quot;UploadButton&quot;">​</a></h4><table tabindex="0"><thead><tr><th>事件名</th><th>说明</th><th>回调参数</th></tr></thead><tbody><tr><td>select</td><td>文件选择成功</td><td><code>(files: File[])</code></td></tr><tr><td>error</td><td>文件验证失败</td><td><code>(error: Error, file?: File)</code></td></tr></tbody></table><h4 id="voicebutton-1" tabindex="-1">VoiceButton <a class="header-anchor" href="#voicebutton-1" aria-label="Permalink to &quot;VoiceButton&quot;">​</a></h4><table tabindex="0"><thead><tr><th>事件名</th><th>说明</th><th>回调参数</th></tr></thead><tbody><tr><td>speech-start</td><td>开始录音</td><td><code>()</code></td></tr><tr><td>speech-interim</td><td>中间结果</td><td><code>(transcript: string)</code></td></tr><tr><td>speech-final</td><td>最终结果</td><td><code>(transcript: string)</code></td></tr><tr><td>speech-end</td><td>结束录音</td><td><code>(transcript?: string)</code></td></tr><tr><td>speech-error</td><td>识别错误</td><td><code>(error: Error)</code></td></tr></tbody></table><h2 id="methods" tabindex="-1">Methods <a class="header-anchor" href="#methods" aria-label="Permalink to &quot;Methods&quot;">​</a></h2><h4 id="basicinput-2" tabindex="-1">BasicInput <a class="header-anchor" href="#basicinput-2" aria-label="Permalink to &quot;BasicInput&quot;">​</a></h4><table tabindex="0"><thead><tr><th>方法名</th><th>说明</th><th>参数</th><th>返回值</th></tr></thead><tbody><tr><td>focus</td><td>使输入框获取焦点</td><td>-</td><td><code>void</code></td></tr><tr><td>blur</td><td>使输入框失去焦点</td><td>-</td><td><code>void</code></td></tr><tr><td>clear</td><td>清空输入内容</td><td>-</td><td><code>void</code></td></tr><tr><td>submit</td><td>手动触发提交事件</td><td>-</td><td><code>void</code></td></tr><tr><td>cancel</td><td>手动触发取消事件，用于在 loading 状态下取消正在进行的操作</td><td>-</td><td><code>void</code></td></tr><tr><td>setContent</td><td>设置编辑器内容</td><td><code>(content: string)</code></td><td><code>void</code></td></tr><tr><td>getContent</td><td>获取编辑器内容</td><td>-</td><td><code>string</code></td></tr></tbody></table><h4 id="uploadbutton-2" tabindex="-1">UploadButton <a class="header-anchor" href="#uploadbutton-2" aria-label="Permalink to &quot;UploadButton&quot;">​</a></h4><table tabindex="0"><thead><tr><th>方法名</th><th>说明</th><th>参数</th><th>返回值</th></tr></thead><tbody><tr><td>open</td><td>打开文件选择器</td><td>-</td><td><code>void</code></td></tr></tbody></table><h4 id="voicebutton-2" tabindex="-1">VoiceButton <a class="header-anchor" href="#voicebutton-2" aria-label="Permalink to &quot;VoiceButton&quot;">​</a></h4><table tabindex="0"><thead><tr><th>方法名</th><th>说明</th><th>参数</th><th>返回值</th></tr></thead><tbody><tr><td>start</td><td>开始录音</td><td>-</td><td><code>void</code></td></tr><tr><td>stop</td><td>停止录音</td><td>-</td><td><code>void</code></td></tr></tbody></table><h2 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h2><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// DefaultActions 默认按钮配置</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> DefaultActions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  submit</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    disabled</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 是否禁用提交按钮</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    tooltip</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 提交按钮提示文本</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    tooltipPlacement</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> TooltipPlacement</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // Tooltip 位置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  clear</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    disabled</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 是否禁用清空按钮</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    tooltip</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 清空按钮提示文本</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    tooltipPlacement</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> TooltipPlacement</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // Tooltip 位置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ToolTip 内容</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> TooltipContent</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Tooltip 位置</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> TooltipPlacement</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;top&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;top-start&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;top-end&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;bottom&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;bottom-start&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;bottom-end&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;left&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;left-start&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;left-end&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;right&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;right-start&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;right-end&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// SpeechConfig 语音配置</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SpeechConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  customHandler</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SpeechHandler</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 自定义语音处理器</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  lang</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 识别语言，默认浏览器语言</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  continuous</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 是否持续识别</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  interimResults</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 是否返回中间结果</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  autoReplace</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 是否自动替换内容</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  onVoiceButtonClick</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">isRecording</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">preventDefault</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 按钮点击拦截器</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 模板项（联合类型）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> TemplateItem</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  |</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">      id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 模板 ID（可选，组件会自动生成）</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">      type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;text&#39;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 类型：普通文本</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">      content</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 内容</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  |</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">      id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 模板 ID（可选，组件会自动生成）</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">      type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;block&#39;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 类型：模板块（可编辑）</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">      content</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 内容</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  |</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">      id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 模板 ID（可选，组件会自动生成）</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">      type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;select&#39;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 类型：选择器</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">      content</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 内容（选中的值）</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">      placeholder</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 占位文字（仅用于输入配置）</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">      options</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SelectOption</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 选项列表（仅用于输入配置）</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">      value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 当前选中的值（仅用于输入配置）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 选择器选项</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SelectOption</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  label</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 显示文本</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 选择后的值</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 提及项</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MentionItem</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  label</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 显示名称，如 &quot;小小画家&quot;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  preset</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 预设内容</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 建议项</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SuggestionItem</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  content</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 建议项内容（必填）</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  highlights</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> HighlightFunction</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 高亮方式（可选）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 高亮函数类型</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> HighlightFunction</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">suggestionText</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">inputText</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SuggestionTextPart</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 高亮文本片段</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SuggestionTextPart</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  text</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 文本片段</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  isMatch</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 是否高亮</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 结构化数据（submit 事件返回）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> StructuredData</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> TemplateItem</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MentionItem</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 输入模式</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> InputMode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;single&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;multiple&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 扩展类型</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { Extension } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@tiptap/core&#39;</span></span></code></pre></div>`,49))])}}});export{ot as __pageData,pt as default};
