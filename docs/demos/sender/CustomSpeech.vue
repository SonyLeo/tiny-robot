<template>
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
    errorMessage.value = `${error.message}\n当前API Key: ${baiduApiKey.value ? '已设置' : '未设置'}\n当前Secret Key: ${baiduSecretKey.value ? '已设置' : '未设置'}`
  } else if (
    (provider.value === 'aliyun' || provider.value === 'aliyun-realtime') &&
    (error.message.includes('AppKey') || error.message.includes('Token'))
  ) {
    errorMessage.value = `${error.message}\n当前AppKey: ${aliyunAppKey.value ? '已设置' : '未设置'}\n当前Token: ${aliyunToken.value ? '已设置' : '未设置'}`
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
</script>
