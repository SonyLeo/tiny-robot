const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/features-playground.Z5KPqiUw.js","assets/chunks/index.L5xrffpa.js","assets/chunks/useConversation.DSauX1Ba.js","assets/chunks/framework.CtXINCeU.js","assets/chunks/useMessage.ClY3tPPj.js","assets/chunks/utils.DCcUktrc.js","assets/chunks/theme.C2rLY_YG.js"])))=>i.map(i=>d[i]);
import{aD as r,bQ as p,aZ as h,aL as c,v as E,H as l,bL as k,bB as C,J as s,bk as t,bJ as o,G as u,b7 as g,aU as y}from"./chunks/framework.CtXINCeU.js";import{L as f,N as m}from"./chunks/index.DZKug4fT.js";const b=`<template>
  <div class="chat-demo-shell">
    <div class="demo-toolbar">
      <button :class="buttonClass(stateMode === 'conversation')" @click="setConversationState">会话态</button>
      <button :class="buttonClass(stateMode === 'welcome')" @click="setWelcomeState">欢迎态</button>
      <button :class="buttonClass(true)" @click="toggleTheme">
        主题：{{ themeMode === 'light' ? '浅色' : '深色' }}
      </button>
      <button :class="buttonClass(showHistory)" @click="showHistory = !showHistory">历史入口</button>
      <button :class="buttonClass(showFeedback)" @click="showFeedback = !showFeedback">反馈能力</button>
      <button :class="buttonClass(showWordCount)" @click="showWordCount = !showWordCount">字数统计</button>
      <button :class="buttonClass(showPrompts)" @click="showPrompts = !showPrompts">欢迎提示词</button>
    </div>

    <div class="demo-note">
      这个示例先把稳定默认值收敛到 \`config.features\`，再通过 \`presetOverrides\` 切换当前页面差异。切到“欢迎态”可观察
      prompts，切到“会话态”更容易观察主题、历史入口、反馈和字数统计。
    </div>

    <div class="chat-demo-container">
      <TrChat :config="chatConfig" :runtime="{ chatKit }" :preset-overrides="presetOverrides" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrChat, createChatAdapterFromConfig, useChatKit } from '@opentiny/tiny-robot-chat'

const stateMode = ref<'welcome' | 'conversation'>('conversation')
const themeMode = ref<'light' | 'dark'>('light')
const showHistory = ref(true)
const showFeedback = ref(true)
const showWordCount = ref(true)
const showPrompts = ref(true)

const welcomePrompts = [
  { label: '快速上手', description: '我应该先看哪一页文档？' },
  { label: '功能开关', description: 'history、feedback、attachments 分别该写在哪里？' },
]

const conversationMessages = [
  {
    role: 'assistant',
    content: '这是一组预填充消息，用来观察主题、feedback 和 sender actions 的开关效果。',
  },
  {
    role: 'user',
    content: '请说明 config.features 和 presetOverrides 的职责边界。',
  },
  {
    role: 'assistant',
    content: '一个适合记忆的方法是：稳定默认值放进 config.features，当前页面差异优先放进 presetOverrides。',
  },
]

const chatConfig = {
  models: [{ id: 'gpt-4o-mini', providerId: 'openai', label: 'GPT-4o Mini' }],
  providers: {
    openai: {
      type: 'openai-compatible' as const,
      endpoint: '/api/chat/completions',
      systemPrompt: 'You are a helpful assistant for the TinyRobot docs.',
    },
  },
  defaults: {
    model: 'gpt-4o-mini',
  },
  ui: {
    brand: {
      title: 'Chat 配置与能力',
    },
    welcome: {
      title: '综合能力示例',
      description: '在一个页面里观察 features 和页面级覆盖是如何配合的。',
    },
    prompts: welcomePrompts,
  },
  features: {
    history: false,
    feedback: false,
    senderActions: false,
    welcomePrompts: false,
  },
}

const adapter = createChatAdapterFromConfig(chatConfig)
const chatKit = useChatKit({
  responseProvider: adapter.createResponseProvider(adapter.defaultModel),
})

function setConversationState() {
  stateMode.value = 'conversation'

  if (!chatKit.activeConversation.value) {
    const conversation = chatKit.createConversation({ title: 'Feature Playground' })
    conversation.engine.messages.value.push(...conversationMessages.map((message) => ({ ...message })))
    return
  }

  const activeMessages = chatKit.activeConversation.value.engine.messages.value
  if (!activeMessages.length) {
    activeMessages.push(...conversationMessages.map((message) => ({ ...message })))
  }
}

function setWelcomeState() {
  stateMode.value = 'welcome'
  chatKit.runtime.clear()
}

const presetOverrides = computed(() => ({
  appearance: {
    mode: themeMode.value,
  },
  showHistory: showHistory.value,
  showFeedback: showFeedback.value,
  prompts: showPrompts.value ? welcomePrompts : [],
  maxLength: showWordCount.value ? 300 : undefined,
  senderActionsFeature: showWordCount.value
    ? {
        enabled: true,
        wordCount: true,
      }
    : undefined,
}))

function buttonClass(active: boolean) {
  return ['toolbar-button', { active }]
}

function toggleTheme() {
  themeMode.value = themeMode.value === 'light' ? 'dark' : 'light'
}

setConversationState()
<\/script>

<style scoped>
.chat-demo-shell {
  display: grid;
  gap: 12px;
}

.demo-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.demo-note {
  padding: 10px 12px;
  color: #475467;
  background: #f8fafc;
  border: 1px solid #dbe4f0;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.6;
}

.toolbar-button {
  padding: 8px 12px;
  color: #344054;
  background: #fff;
  border: 1px solid #d0d5dd;
  border-radius: 999px;
  cursor: pointer;
}

.toolbar-button.active {
  color: #175cd3;
  background: #eff6ff;
  border-color: #b2ddff;
}

.chat-demo-container {
  height: 580px;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 12px;
}
</style>
`,x=JSON.parse('{"title":"Chat 配置与能力","description":"","frontmatter":{"outline":[2,3]},"headers":[],"relativePath":"components/chat-features.md","filePath":"components/chat-features.md"}'),F={name:"components/chat-features.md"},D=Object.assign(F,{setup(B){const a=y(!0),i=g();return r(async()=>{i.value=(await p(async()=>{const{default:n}=await import("./chunks/features-playground.Z5KPqiUw.js");return{default:n}},__vite__mapDeps([0,1,2,3,4,5,6]))).default}),(n,e)=>{const d=h("ClientOnly");return c(),E("div",null,[e[1]||(e[1]=l("",82)),k(s(t(f),null,null,512),[[C,a.value]]),s(d,null,{default:o(()=>[s(t(m),{title:"能力综合示例",description:"在同一个页面里切换主题、history、feedback、senderActions 和 welcomePrompts，观察 config.features 与 presetOverrides 的配合方式。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22features-playground.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Ffeatures-playground.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22chat-demo-shell%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22demo-toolbar%5C%22%3E%5Cn%20%20%20%20%20%20%3Cbutton%20%3Aclass%3D%5C%22buttonClass(stateMode%20%3D%3D%3D%20'conversation')%5C%22%20%40click%3D%5C%22setConversationState%5C%22%3E%E4%BC%9A%E8%AF%9D%E6%80%81%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3Cbutton%20%3Aclass%3D%5C%22buttonClass(stateMode%20%3D%3D%3D%20'welcome')%5C%22%20%40click%3D%5C%22setWelcomeState%5C%22%3E%E6%AC%A2%E8%BF%8E%E6%80%81%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3Cbutton%20%3Aclass%3D%5C%22buttonClass(true)%5C%22%20%40click%3D%5C%22toggleTheme%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%E4%B8%BB%E9%A2%98%EF%BC%9A%7B%7B%20themeMode%20%3D%3D%3D%20'light'%20%3F%20'%E6%B5%85%E8%89%B2'%20%3A%20'%E6%B7%B1%E8%89%B2'%20%7D%7D%5Cn%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3Cbutton%20%3Aclass%3D%5C%22buttonClass(showHistory)%5C%22%20%40click%3D%5C%22showHistory%20%3D%20!showHistory%5C%22%3E%E5%8E%86%E5%8F%B2%E5%85%A5%E5%8F%A3%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3Cbutton%20%3Aclass%3D%5C%22buttonClass(showFeedback)%5C%22%20%40click%3D%5C%22showFeedback%20%3D%20!showFeedback%5C%22%3E%E5%8F%8D%E9%A6%88%E8%83%BD%E5%8A%9B%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3Cbutton%20%3Aclass%3D%5C%22buttonClass(showWordCount)%5C%22%20%40click%3D%5C%22showWordCount%20%3D%20!showWordCount%5C%22%3E%E5%AD%97%E6%95%B0%E7%BB%9F%E8%AE%A1%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3Cbutton%20%3Aclass%3D%5C%22buttonClass(showPrompts)%5C%22%20%40click%3D%5C%22showPrompts%20%3D%20!showPrompts%5C%22%3E%E6%AC%A2%E8%BF%8E%E6%8F%90%E7%A4%BA%E8%AF%8D%3C%2Fbutton%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22demo-note%5C%22%3E%5Cn%20%20%20%20%20%20%E8%BF%99%E4%B8%AA%E7%A4%BA%E4%BE%8B%E5%85%88%E6%8A%8A%E7%A8%B3%E5%AE%9A%E9%BB%98%E8%AE%A4%E5%80%BC%E6%94%B6%E6%95%9B%E5%88%B0%20%60config.features%60%EF%BC%8C%E5%86%8D%E9%80%9A%E8%BF%87%20%60presetOverrides%60%20%E5%88%87%E6%8D%A2%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E5%B7%AE%E5%BC%82%E3%80%82%E5%88%87%E5%88%B0%E2%80%9C%E6%AC%A2%E8%BF%8E%E6%80%81%E2%80%9D%E5%8F%AF%E8%A7%82%E5%AF%9F%5Cn%20%20%20%20%20%20prompts%EF%BC%8C%E5%88%87%E5%88%B0%E2%80%9C%E4%BC%9A%E8%AF%9D%E6%80%81%E2%80%9D%E6%9B%B4%E5%AE%B9%E6%98%93%E8%A7%82%E5%AF%9F%E4%B8%BB%E9%A2%98%E3%80%81%E5%8E%86%E5%8F%B2%E5%85%A5%E5%8F%A3%E3%80%81%E5%8F%8D%E9%A6%88%E5%92%8C%E5%AD%97%E6%95%B0%E7%BB%9F%E8%AE%A1%E3%80%82%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22chat-demo-container%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrChat%20%3Aconfig%3D%5C%22chatConfig%5C%22%20%3Aruntime%3D%5C%22%7B%20chatKit%20%7D%5C%22%20%3Apreset-overrides%3D%5C%22presetOverrides%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrChat%2C%20createChatAdapterFromConfig%2C%20useChatKit%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cn%5Cnconst%20stateMode%20%3D%20ref%3C'welcome'%20%7C%20'conversation'%3E('conversation')%5Cnconst%20themeMode%20%3D%20ref%3C'light'%20%7C%20'dark'%3E('light')%5Cnconst%20showHistory%20%3D%20ref(true)%5Cnconst%20showFeedback%20%3D%20ref(true)%5Cnconst%20showWordCount%20%3D%20ref(true)%5Cnconst%20showPrompts%20%3D%20ref(true)%5Cn%5Cnconst%20welcomePrompts%20%3D%20%5B%5Cn%20%20%7B%20label%3A%20'%E5%BF%AB%E9%80%9F%E4%B8%8A%E6%89%8B'%2C%20description%3A%20'%E6%88%91%E5%BA%94%E8%AF%A5%E5%85%88%E7%9C%8B%E5%93%AA%E4%B8%80%E9%A1%B5%E6%96%87%E6%A1%A3%EF%BC%9F'%20%7D%2C%5Cn%20%20%7B%20label%3A%20'%E5%8A%9F%E8%83%BD%E5%BC%80%E5%85%B3'%2C%20description%3A%20'history%E3%80%81feedback%E3%80%81attachments%20%E5%88%86%E5%88%AB%E8%AF%A5%E5%86%99%E5%9C%A8%E5%93%AA%E9%87%8C%EF%BC%9F'%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20conversationMessages%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20content%3A%20'%E8%BF%99%E6%98%AF%E4%B8%80%E7%BB%84%E9%A2%84%E5%A1%AB%E5%85%85%E6%B6%88%E6%81%AF%EF%BC%8C%E7%94%A8%E6%9D%A5%E8%A7%82%E5%AF%9F%E4%B8%BB%E9%A2%98%E3%80%81feedback%20%E5%92%8C%20sender%20actions%20%E7%9A%84%E5%BC%80%E5%85%B3%E6%95%88%E6%9E%9C%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20content%3A%20'%E8%AF%B7%E8%AF%B4%E6%98%8E%20config.features%20%E5%92%8C%20presetOverrides%20%E7%9A%84%E8%81%8C%E8%B4%A3%E8%BE%B9%E7%95%8C%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20content%3A%20'%E4%B8%80%E4%B8%AA%E9%80%82%E5%90%88%E8%AE%B0%E5%BF%86%E7%9A%84%E6%96%B9%E6%B3%95%E6%98%AF%EF%BC%9A%E7%A8%B3%E5%AE%9A%E9%BB%98%E8%AE%A4%E5%80%BC%E6%94%BE%E8%BF%9B%20config.features%EF%BC%8C%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E5%B7%AE%E5%BC%82%E4%BC%98%E5%85%88%E6%94%BE%E8%BF%9B%20presetOverrides%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20chatConfig%20%3D%20%7B%5Cn%20%20models%3A%20%5B%7B%20id%3A%20'gpt-4o-mini'%2C%20providerId%3A%20'openai'%2C%20label%3A%20'GPT-4o%20Mini'%20%7D%5D%2C%5Cn%20%20providers%3A%20%7B%5Cn%20%20%20%20openai%3A%20%7B%5Cn%20%20%20%20%20%20type%3A%20'openai-compatible'%20as%20const%2C%5Cn%20%20%20%20%20%20endpoint%3A%20'%2Fapi%2Fchat%2Fcompletions'%2C%5Cn%20%20%20%20%20%20systemPrompt%3A%20'You%20are%20a%20helpful%20assistant%20for%20the%20TinyRobot%20docs.'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20defaults%3A%20%7B%5Cn%20%20%20%20model%3A%20'gpt-4o-mini'%2C%5Cn%20%20%7D%2C%5Cn%20%20ui%3A%20%7B%5Cn%20%20%20%20brand%3A%20%7B%5Cn%20%20%20%20%20%20title%3A%20'Chat%20%E9%85%8D%E7%BD%AE%E4%B8%8E%E8%83%BD%E5%8A%9B'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20welcome%3A%20%7B%5Cn%20%20%20%20%20%20title%3A%20'%E7%BB%BC%E5%90%88%E8%83%BD%E5%8A%9B%E7%A4%BA%E4%BE%8B'%2C%5Cn%20%20%20%20%20%20description%3A%20'%E5%9C%A8%E4%B8%80%E4%B8%AA%E9%A1%B5%E9%9D%A2%E9%87%8C%E8%A7%82%E5%AF%9F%20features%20%E5%92%8C%E9%A1%B5%E9%9D%A2%E7%BA%A7%E8%A6%86%E7%9B%96%E6%98%AF%E5%A6%82%E4%BD%95%E9%85%8D%E5%90%88%E7%9A%84%E3%80%82'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20prompts%3A%20welcomePrompts%2C%5Cn%20%20%7D%2C%5Cn%20%20features%3A%20%7B%5Cn%20%20%20%20history%3A%20false%2C%5Cn%20%20%20%20feedback%3A%20false%2C%5Cn%20%20%20%20senderActions%3A%20false%2C%5Cn%20%20%20%20welcomePrompts%3A%20false%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20adapter%20%3D%20createChatAdapterFromConfig(chatConfig)%5Cnconst%20chatKit%20%3D%20useChatKit(%7B%5Cn%20%20responseProvider%3A%20adapter.createResponseProvider(adapter.defaultModel)%2C%5Cn%7D)%5Cn%5Cnfunction%20setConversationState()%20%7B%5Cn%20%20stateMode.value%20%3D%20'conversation'%5Cn%5Cn%20%20if%20(!chatKit.activeConversation.value)%20%7B%5Cn%20%20%20%20const%20conversation%20%3D%20chatKit.createConversation(%7B%20title%3A%20'Feature%20Playground'%20%7D)%5Cn%20%20%20%20conversation.engine.messages.value.push(...conversationMessages.map((message)%20%3D%3E%20(%7B%20...message%20%7D)))%5Cn%20%20%20%20return%5Cn%20%20%7D%5Cn%5Cn%20%20const%20activeMessages%20%3D%20chatKit.activeConversation.value.engine.messages.value%5Cn%20%20if%20(!activeMessages.length)%20%7B%5Cn%20%20%20%20activeMessages.push(...conversationMessages.map((message)%20%3D%3E%20(%7B%20...message%20%7D)))%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnfunction%20setWelcomeState()%20%7B%5Cn%20%20stateMode.value%20%3D%20'welcome'%5Cn%20%20chatKit.runtime.clear()%5Cn%7D%5Cn%5Cnconst%20presetOverrides%20%3D%20computed(()%20%3D%3E%20(%7B%5Cn%20%20appearance%3A%20%7B%5Cn%20%20%20%20mode%3A%20themeMode.value%2C%5Cn%20%20%7D%2C%5Cn%20%20showHistory%3A%20showHistory.value%2C%5Cn%20%20showFeedback%3A%20showFeedback.value%2C%5Cn%20%20prompts%3A%20showPrompts.value%20%3F%20welcomePrompts%20%3A%20%5B%5D%2C%5Cn%20%20maxLength%3A%20showWordCount.value%20%3F%20300%20%3A%20undefined%2C%5Cn%20%20senderActionsFeature%3A%20showWordCount.value%5Cn%20%20%20%20%3F%20%7B%5Cn%20%20%20%20%20%20%20%20enabled%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20wordCount%3A%20true%2C%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%3A%20undefined%2C%5Cn%7D))%5Cn%5Cnfunction%20buttonClass(active%3A%20boolean)%20%7B%5Cn%20%20return%20%5B'toolbar-button'%2C%20%7B%20active%20%7D%5D%5Cn%7D%5Cn%5Cnfunction%20toggleTheme()%20%7B%5Cn%20%20themeMode.value%20%3D%20themeMode.value%20%3D%3D%3D%20'light'%20%3F%20'dark'%20%3A%20'light'%5Cn%7D%5Cn%5CnsetConversationState()%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.chat-demo-shell%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%7D%5Cn%5Cn.demo-toolbar%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%208px%3B%5Cn%7D%5Cn%5Cn.demo-note%20%7B%5Cn%20%20padding%3A%2010px%2012px%3B%5Cn%20%20color%3A%20%23475467%3B%5Cn%20%20background%3A%20%23f8fafc%3B%5Cn%20%20border%3A%201px%20solid%20%23dbe4f0%3B%5Cn%20%20border-radius%3A%2010px%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20line-height%3A%201.6%3B%5Cn%7D%5Cn%5Cn.toolbar-button%20%7B%5Cn%20%20padding%3A%208px%2012px%3B%5Cn%20%20color%3A%20%23344054%3B%5Cn%20%20background%3A%20%23fff%3B%5Cn%20%20border%3A%201px%20solid%20%23d0d5dd%3B%5Cn%20%20border-radius%3A%20999px%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.toolbar-button.active%20%7B%5Cn%20%20color%3A%20%23175cd3%3B%5Cn%20%20background%3A%20%23eff6ff%3B%5Cn%20%20border-color%3A%20%23b2ddff%3B%5Cn%7D%5Cn%5Cn.chat-demo-container%20%7B%5Cn%20%20height%3A%20580px%3B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20overflow%3A%20hidden%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-border-color-default%2C%20%23e5e6eb)%3B%5Cn%20%20border-radius%3A%2012px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{a.value=!1}),vueCode:t(b)},u({_:2},[i.value?{name:"vue",fn:o(()=>[s(t(i))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[2]||(e[2]=l("",75))])}}});export{x as __pageData,D as default};
