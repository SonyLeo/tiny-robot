const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/preset-overrides.DPEAM2iQ.js","assets/chunks/index.3BH5zFw1.js","assets/chunks/useConversation.DSauX1Ba.js","assets/chunks/framework.CtXINCeU.js","assets/chunks/useMessage.ClY3tPPj.js","assets/chunks/utils.DCcUktrc.js","assets/chunks/theme.uYXqZGAi.js","assets/chunks/blackbox.D6s9h1xm.js"])))=>i.map(i=>d[i]);
import{aD as c,bQ as p,aZ as f,aL as g,v as y,H as s,bL as C,bB as h,J as t,bk as n,bJ as i,G as E,b7 as B,aU as b}from"./chunks/framework.CtXINCeU.js";import{L as A,N as u}from"./chunks/index.DZKug4fT.js";const m=`<template>
  <div class="chat-demo-shell">
    <div class="demo-toolbar">
      <button :class="buttonClass(pageMode === 'base')" @click="pageMode = 'base'">基础页</button>
      <button :class="buttonClass(pageMode === 'override')" @click="pageMode = 'override'">覆盖页</button>
    </div>

    <div class="demo-note">
      <strong>{{ activeScenario.title }}</strong>
      <div class="demo-note-text">{{ activeScenario.description }}</div>
      <div class="demo-note-text">
        这个示例会把 \`centered\` 的演示阈值临时压到 \`560px\`，方便在文档预览里直接看出 \`contentLayout\` 的差异。
      </div>
    </div>

    <div class="override-chips">
      <span v-for="item in activeScenario.chips" :key="item" class="override-chip">{{ item }}</span>
    </div>

    <div class="chat-demo-container" data-demo-layout-preview="true">
      <TrChat :config="chatConfig" :runtime="{ initialMessages }" :preset-overrides="activePresetOverrides" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrChat } from '@opentiny/tiny-robot-chat'

type PageMode = 'base' | 'override'

const pageMode = ref<PageMode>('override')

const chatConfig = {
  models: [
    { id: 'gpt-4o-mini', providerId: 'openai', label: 'GPT-4o Mini' },
    { id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' },
  ],
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
      title: '页面级覆盖示例',
    },
    welcome: {
      title: '同一份基础配置',
      description: '这里演示的不是 feature 开关，而是同一份 config 在不同页面里的轻量差异。',
    },
  },
  layout: {
    contentLayout: 'centered' as const,
  },
  features: {
    history: false,
    feedback: false,
    senderActions: false,
  },
}

const initialMessages = [
  {
    role: 'assistant',
    content: '这是一段专门用来观察页面级覆盖的演示消息。你现在看到的是同一份基础 config 下的某个页面实例。',
  },
  {
    role: 'user',
    content: '请说明为什么这里更适合用 presetOverrides，而不是再维护一份新的 config。',
  },
  {
    role: 'assistant',
    content:
      '因为模型、provider 和大多数 UI 默认值都没变，变化的只是当前页面对主题、宽度、history、feedback 和发送区细节的轻量调整。',
  },
]

const scenarios = {
  base: {
    title: '基础页',
    description: '直接使用基础 config，不额外增加页面差异。适合默认聊天页或最普通的业务接入页。',
    chips: ['无页面级覆盖', 'centered', 'history 关闭', 'feedback 关闭'],
    overrides: {},
  },
  override: {
    title: '覆盖页',
    description:
      '保持基础 config 不变，只在当前页面通过 \`presetOverrides\` 调整主题、内容宽度、history、feedback 和发送区行为。',
    chips: ['appearance.dark', 'contentLayout: wide', 'showHistory', 'showFeedback', 'maxLength: 300', 'wordCount'],
    overrides: {
      appearance: {
        mode: 'dark' as const,
      },
      contentLayout: 'wide' as const,
      showHistory: true,
      showFeedback: true,
      placeholder: '当前是覆盖页...',
      maxLength: 300,
      senderActionsFeature: {
        enabled: true,
        wordCount: true,
      },
    },
  },
} as const

const activeScenario = computed(() => scenarios[pageMode.value])
const activePresetOverrides = computed(() => activeScenario.value.overrides)

function buttonClass(active: boolean) {
  return ['toolbar-button', { active }]
}
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

.demo-note {
  display: grid;
  gap: 6px;
  padding: 10px 12px;
  color: #475467;
  background: #f8fafc;
  border: 1px solid #dbe4f0;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.6;
}

.demo-note-text {
  margin: 0;
}

.override-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.override-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  color: #175cd3;
  background: #eff6ff;
  border: 1px solid #b2ddff;
  border-radius: 999px;
  font-size: 12px;
  line-height: 1.4;
}

.chat-demo-container {
  --chat-content-max-width: 560px;
  height: 560px;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 12px;
}
</style>
`,k=`<template>
  <div class="chat-demo-container">
    <TrChat
      :config="chatConfig"
      :preset-overrides="{
        showHistory: true,
        placeholder: '请输入问题...',
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { TrChat } from '@opentiny/tiny-robot-chat'

const chatConfig = {
  models: [
    { id: 'gpt-4o-mini', providerId: 'openai', label: 'GPT-4o Mini' },
    { id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' },
  ],
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
      title: 'TinyRobot Chat',
    },
    welcome: {
      title: '欢迎使用 Chat 套件',
      description: '这个示例直接请求 /api/chat/completions，在文档站内由 SW 返回 mock 响应。',
    },
    prompts: [
      { label: '快速上手', description: '如何引入并配置 TrChat 组件？' },
      { label: '流式响应', description: '演示一下打字机效果。' },
    ],
  },
  layout: {
    contentLayout: 'centered' as const,
  },
}
<\/script>

<style scoped>
.chat-demo-container {
  height: 600px;
  width: 100%;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 8px;
  overflow: hidden;
}
</style>
`,w=JSON.parse('{"title":"Chat 接入与入口","description":"","frontmatter":{"outline":[2,3]},"headers":[],"relativePath":"components/chat.md","filePath":"components/chat.md"}'),v={name:"components/chat.md"},_=Object.assign(v,{setup(x){const l=B();c(async()=>{l.value=(await p(async()=>{const{default:a}=await import("./chunks/preset-overrides.DPEAM2iQ.js");return{default:a}},__vite__mapDeps([0,1,2,3,4,5,6]))).default});const o=b(!0),d=B();return c(async()=>{d.value=(await p(async()=>{const{default:a}=await import("./chunks/blackbox.D6s9h1xm.js");return{default:a}},__vite__mapDeps([7,1,2,3,4,5,6]))).default}),(a,e)=>{const r=f("ClientOnly");return g(),y("div",null,[e[2]||(e[2]=s("",30)),C(t(n(A),null,null,512),[[h,o.value]]),t(r,null,{default:i(()=>[t(n(u),{title:"默认接入",description:"使用 TrChat 直接接入完整聊天页。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22blackbox.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fblackbox.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22chat-demo-container%5C%22%3E%5Cn%20%20%20%20%3CTrChat%5Cn%20%20%20%20%20%20%3Aconfig%3D%5C%22chatConfig%5C%22%5Cn%20%20%20%20%20%20%3Apreset-overrides%3D%5C%22%7B%5Cn%20%20%20%20%20%20%20%20showHistory%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20placeholder%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E9%97%AE%E9%A2%98...'%2C%5Cn%20%20%20%20%20%20%7D%5C%22%5Cn%20%20%20%20%2F%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrChat%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cn%5Cnconst%20chatConfig%20%3D%20%7B%5Cn%20%20models%3A%20%5B%5Cn%20%20%20%20%7B%20id%3A%20'gpt-4o-mini'%2C%20providerId%3A%20'openai'%2C%20label%3A%20'GPT-4o%20Mini'%20%7D%2C%5Cn%20%20%20%20%7B%20id%3A%20'gpt-4.1-mini'%2C%20providerId%3A%20'openai'%2C%20label%3A%20'GPT-4.1%20Mini'%20%7D%2C%5Cn%20%20%5D%2C%5Cn%20%20providers%3A%20%7B%5Cn%20%20%20%20openai%3A%20%7B%5Cn%20%20%20%20%20%20type%3A%20'openai-compatible'%20as%20const%2C%5Cn%20%20%20%20%20%20endpoint%3A%20'%2Fapi%2Fchat%2Fcompletions'%2C%5Cn%20%20%20%20%20%20systemPrompt%3A%20'You%20are%20a%20helpful%20assistant%20for%20the%20TinyRobot%20docs.'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20defaults%3A%20%7B%5Cn%20%20%20%20model%3A%20'gpt-4o-mini'%2C%5Cn%20%20%7D%2C%5Cn%20%20ui%3A%20%7B%5Cn%20%20%20%20brand%3A%20%7B%5Cn%20%20%20%20%20%20title%3A%20'TinyRobot%20Chat'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20welcome%3A%20%7B%5Cn%20%20%20%20%20%20title%3A%20'%E6%AC%A2%E8%BF%8E%E4%BD%BF%E7%94%A8%20Chat%20%E5%A5%97%E4%BB%B6'%2C%5Cn%20%20%20%20%20%20description%3A%20'%E8%BF%99%E4%B8%AA%E7%A4%BA%E4%BE%8B%E7%9B%B4%E6%8E%A5%E8%AF%B7%E6%B1%82%20%2Fapi%2Fchat%2Fcompletions%EF%BC%8C%E5%9C%A8%E6%96%87%E6%A1%A3%E7%AB%99%E5%86%85%E7%94%B1%20SW%20%E8%BF%94%E5%9B%9E%20mock%20%E5%93%8D%E5%BA%94%E3%80%82'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20prompts%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20label%3A%20'%E5%BF%AB%E9%80%9F%E4%B8%8A%E6%89%8B'%2C%20description%3A%20'%E5%A6%82%E4%BD%95%E5%BC%95%E5%85%A5%E5%B9%B6%E9%85%8D%E7%BD%AE%20TrChat%20%E7%BB%84%E4%BB%B6%EF%BC%9F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20label%3A%20'%E6%B5%81%E5%BC%8F%E5%93%8D%E5%BA%94'%2C%20description%3A%20'%E6%BC%94%E7%A4%BA%E4%B8%80%E4%B8%8B%E6%89%93%E5%AD%97%E6%9C%BA%E6%95%88%E6%9E%9C%E3%80%82'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20layout%3A%20%7B%5Cn%20%20%20%20contentLayout%3A%20'centered'%20as%20const%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.chat-demo-container%20%7B%5Cn%20%20height%3A%20600px%3B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-border-color-default%2C%20%23e5e6eb)%3B%5Cn%20%20border-radius%3A%208px%3B%5Cn%20%20overflow%3A%20hidden%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{o.value=!1}),vueCode:n(k)},E({_:2},[d.value?{name:"vue",fn:i(()=>[t(n(d))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[3]||(e[3]=s("",47)),C(t(n(A),null,null,512),[[h,o.value]]),t(r,null,{default:i(()=>[t(n(u),{title:"页面级覆盖",description:"在不改基础 config 的前提下，切换“基础页 / 覆盖页”两种页面身份，观察 presetOverrides 如何承接当前页的轻量差异。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22preset-overrides.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fpreset-overrides.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22chat-demo-shell%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22demo-toolbar%5C%22%3E%5Cn%20%20%20%20%20%20%3Cbutton%20%3Aclass%3D%5C%22buttonClass(pageMode%20%3D%3D%3D%20'base')%5C%22%20%40click%3D%5C%22pageMode%20%3D%20'base'%5C%22%3E%E5%9F%BA%E7%A1%80%E9%A1%B5%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3Cbutton%20%3Aclass%3D%5C%22buttonClass(pageMode%20%3D%3D%3D%20'override')%5C%22%20%40click%3D%5C%22pageMode%20%3D%20'override'%5C%22%3E%E8%A6%86%E7%9B%96%E9%A1%B5%3C%2Fbutton%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22demo-note%5C%22%3E%5Cn%20%20%20%20%20%20%3Cstrong%3E%7B%7B%20activeScenario.title%20%7D%7D%3C%2Fstrong%3E%5Cn%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22demo-note-text%5C%22%3E%7B%7B%20activeScenario.description%20%7D%7D%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22demo-note-text%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%E8%BF%99%E4%B8%AA%E7%A4%BA%E4%BE%8B%E4%BC%9A%E6%8A%8A%20%60centered%60%20%E7%9A%84%E6%BC%94%E7%A4%BA%E9%98%88%E5%80%BC%E4%B8%B4%E6%97%B6%E5%8E%8B%E5%88%B0%20%60560px%60%EF%BC%8C%E6%96%B9%E4%BE%BF%E5%9C%A8%E6%96%87%E6%A1%A3%E9%A2%84%E8%A7%88%E9%87%8C%E7%9B%B4%E6%8E%A5%E7%9C%8B%E5%87%BA%20%60contentLayout%60%20%E7%9A%84%E5%B7%AE%E5%BC%82%E3%80%82%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22override-chips%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%20v-for%3D%5C%22item%20in%20activeScenario.chips%5C%22%20%3Akey%3D%5C%22item%5C%22%20class%3D%5C%22override-chip%5C%22%3E%7B%7B%20item%20%7D%7D%3C%2Fspan%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22chat-demo-container%5C%22%20data-demo-layout-preview%3D%5C%22true%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrChat%20%3Aconfig%3D%5C%22chatConfig%5C%22%20%3Aruntime%3D%5C%22%7B%20initialMessages%20%7D%5C%22%20%3Apreset-overrides%3D%5C%22activePresetOverrides%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrChat%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cn%5Cntype%20PageMode%20%3D%20'base'%20%7C%20'override'%5Cn%5Cnconst%20pageMode%20%3D%20ref%3CPageMode%3E('override')%5Cn%5Cnconst%20chatConfig%20%3D%20%7B%5Cn%20%20models%3A%20%5B%5Cn%20%20%20%20%7B%20id%3A%20'gpt-4o-mini'%2C%20providerId%3A%20'openai'%2C%20label%3A%20'GPT-4o%20Mini'%20%7D%2C%5Cn%20%20%20%20%7B%20id%3A%20'gpt-4.1-mini'%2C%20providerId%3A%20'openai'%2C%20label%3A%20'GPT-4.1%20Mini'%20%7D%2C%5Cn%20%20%5D%2C%5Cn%20%20providers%3A%20%7B%5Cn%20%20%20%20openai%3A%20%7B%5Cn%20%20%20%20%20%20type%3A%20'openai-compatible'%20as%20const%2C%5Cn%20%20%20%20%20%20endpoint%3A%20'%2Fapi%2Fchat%2Fcompletions'%2C%5Cn%20%20%20%20%20%20systemPrompt%3A%20'You%20are%20a%20helpful%20assistant%20for%20the%20TinyRobot%20docs.'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20defaults%3A%20%7B%5Cn%20%20%20%20model%3A%20'gpt-4o-mini'%2C%5Cn%20%20%7D%2C%5Cn%20%20ui%3A%20%7B%5Cn%20%20%20%20brand%3A%20%7B%5Cn%20%20%20%20%20%20title%3A%20'%E9%A1%B5%E9%9D%A2%E7%BA%A7%E8%A6%86%E7%9B%96%E7%A4%BA%E4%BE%8B'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20welcome%3A%20%7B%5Cn%20%20%20%20%20%20title%3A%20'%E5%90%8C%E4%B8%80%E4%BB%BD%E5%9F%BA%E7%A1%80%E9%85%8D%E7%BD%AE'%2C%5Cn%20%20%20%20%20%20description%3A%20'%E8%BF%99%E9%87%8C%E6%BC%94%E7%A4%BA%E7%9A%84%E4%B8%8D%E6%98%AF%20feature%20%E5%BC%80%E5%85%B3%EF%BC%8C%E8%80%8C%E6%98%AF%E5%90%8C%E4%B8%80%E4%BB%BD%20config%20%E5%9C%A8%E4%B8%8D%E5%90%8C%E9%A1%B5%E9%9D%A2%E9%87%8C%E7%9A%84%E8%BD%BB%E9%87%8F%E5%B7%AE%E5%BC%82%E3%80%82'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20layout%3A%20%7B%5Cn%20%20%20%20contentLayout%3A%20'centered'%20as%20const%2C%5Cn%20%20%7D%2C%5Cn%20%20features%3A%20%7B%5Cn%20%20%20%20history%3A%20false%2C%5Cn%20%20%20%20feedback%3A%20false%2C%5Cn%20%20%20%20senderActions%3A%20false%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20initialMessages%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20content%3A%20'%E8%BF%99%E6%98%AF%E4%B8%80%E6%AE%B5%E4%B8%93%E9%97%A8%E7%94%A8%E6%9D%A5%E8%A7%82%E5%AF%9F%E9%A1%B5%E9%9D%A2%E7%BA%A7%E8%A6%86%E7%9B%96%E7%9A%84%E6%BC%94%E7%A4%BA%E6%B6%88%E6%81%AF%E3%80%82%E4%BD%A0%E7%8E%B0%E5%9C%A8%E7%9C%8B%E5%88%B0%E7%9A%84%E6%98%AF%E5%90%8C%E4%B8%80%E4%BB%BD%E5%9F%BA%E7%A1%80%20config%20%E4%B8%8B%E7%9A%84%E6%9F%90%E4%B8%AA%E9%A1%B5%E9%9D%A2%E5%AE%9E%E4%BE%8B%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20content%3A%20'%E8%AF%B7%E8%AF%B4%E6%98%8E%E4%B8%BA%E4%BB%80%E4%B9%88%E8%BF%99%E9%87%8C%E6%9B%B4%E9%80%82%E5%90%88%E7%94%A8%20presetOverrides%EF%BC%8C%E8%80%8C%E4%B8%8D%E6%98%AF%E5%86%8D%E7%BB%B4%E6%8A%A4%E4%B8%80%E4%BB%BD%E6%96%B0%E7%9A%84%20config%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20content%3A%5Cn%20%20%20%20%20%20'%E5%9B%A0%E4%B8%BA%E6%A8%A1%E5%9E%8B%E3%80%81provider%20%E5%92%8C%E5%A4%A7%E5%A4%9A%E6%95%B0%20UI%20%E9%BB%98%E8%AE%A4%E5%80%BC%E9%83%BD%E6%B2%A1%E5%8F%98%EF%BC%8C%E5%8F%98%E5%8C%96%E7%9A%84%E5%8F%AA%E6%98%AF%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E5%AF%B9%E4%B8%BB%E9%A2%98%E3%80%81%E5%AE%BD%E5%BA%A6%E3%80%81history%E3%80%81feedback%20%E5%92%8C%E5%8F%91%E9%80%81%E5%8C%BA%E7%BB%86%E8%8A%82%E7%9A%84%E8%BD%BB%E9%87%8F%E8%B0%83%E6%95%B4%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20scenarios%20%3D%20%7B%5Cn%20%20base%3A%20%7B%5Cn%20%20%20%20title%3A%20'%E5%9F%BA%E7%A1%80%E9%A1%B5'%2C%5Cn%20%20%20%20description%3A%20'%E7%9B%B4%E6%8E%A5%E4%BD%BF%E7%94%A8%E5%9F%BA%E7%A1%80%20config%EF%BC%8C%E4%B8%8D%E9%A2%9D%E5%A4%96%E5%A2%9E%E5%8A%A0%E9%A1%B5%E9%9D%A2%E5%B7%AE%E5%BC%82%E3%80%82%E9%80%82%E5%90%88%E9%BB%98%E8%AE%A4%E8%81%8A%E5%A4%A9%E9%A1%B5%E6%88%96%E6%9C%80%E6%99%AE%E9%80%9A%E7%9A%84%E4%B8%9A%E5%8A%A1%E6%8E%A5%E5%85%A5%E9%A1%B5%E3%80%82'%2C%5Cn%20%20%20%20chips%3A%20%5B'%E6%97%A0%E9%A1%B5%E9%9D%A2%E7%BA%A7%E8%A6%86%E7%9B%96'%2C%20'centered'%2C%20'history%20%E5%85%B3%E9%97%AD'%2C%20'feedback%20%E5%85%B3%E9%97%AD'%5D%2C%5Cn%20%20%20%20overrides%3A%20%7B%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20override%3A%20%7B%5Cn%20%20%20%20title%3A%20'%E8%A6%86%E7%9B%96%E9%A1%B5'%2C%5Cn%20%20%20%20description%3A%5Cn%20%20%20%20%20%20'%E4%BF%9D%E6%8C%81%E5%9F%BA%E7%A1%80%20config%20%E4%B8%8D%E5%8F%98%EF%BC%8C%E5%8F%AA%E5%9C%A8%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E9%80%9A%E8%BF%87%20%60presetOverrides%60%20%E8%B0%83%E6%95%B4%E4%B8%BB%E9%A2%98%E3%80%81%E5%86%85%E5%AE%B9%E5%AE%BD%E5%BA%A6%E3%80%81history%E3%80%81feedback%20%E5%92%8C%E5%8F%91%E9%80%81%E5%8C%BA%E8%A1%8C%E4%B8%BA%E3%80%82'%2C%5Cn%20%20%20%20chips%3A%20%5B'appearance.dark'%2C%20'contentLayout%3A%20wide'%2C%20'showHistory'%2C%20'showFeedback'%2C%20'maxLength%3A%20300'%2C%20'wordCount'%5D%2C%5Cn%20%20%20%20overrides%3A%20%7B%5Cn%20%20%20%20%20%20appearance%3A%20%7B%5Cn%20%20%20%20%20%20%20%20mode%3A%20'dark'%20as%20const%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20contentLayout%3A%20'wide'%20as%20const%2C%5Cn%20%20%20%20%20%20showHistory%3A%20true%2C%5Cn%20%20%20%20%20%20showFeedback%3A%20true%2C%5Cn%20%20%20%20%20%20placeholder%3A%20'%E5%BD%93%E5%89%8D%E6%98%AF%E8%A6%86%E7%9B%96%E9%A1%B5...'%2C%5Cn%20%20%20%20%20%20maxLength%3A%20300%2C%5Cn%20%20%20%20%20%20senderActionsFeature%3A%20%7B%5Cn%20%20%20%20%20%20%20%20enabled%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20wordCount%3A%20true%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%7D%20as%20const%5Cn%5Cnconst%20activeScenario%20%3D%20computed(()%20%3D%3E%20scenarios%5BpageMode.value%5D)%5Cnconst%20activePresetOverrides%20%3D%20computed(()%20%3D%3E%20activeScenario.value.overrides)%5Cn%5Cnfunction%20buttonClass(active%3A%20boolean)%20%7B%5Cn%20%20return%20%5B'toolbar-button'%2C%20%7B%20active%20%7D%5D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.chat-demo-shell%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%7D%5Cn%5Cn.demo-toolbar%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%208px%3B%5Cn%7D%5Cn%5Cn.toolbar-button%20%7B%5Cn%20%20padding%3A%208px%2012px%3B%5Cn%20%20color%3A%20%23344054%3B%5Cn%20%20background%3A%20%23fff%3B%5Cn%20%20border%3A%201px%20solid%20%23d0d5dd%3B%5Cn%20%20border-radius%3A%20999px%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.toolbar-button.active%20%7B%5Cn%20%20color%3A%20%23175cd3%3B%5Cn%20%20background%3A%20%23eff6ff%3B%5Cn%20%20border-color%3A%20%23b2ddff%3B%5Cn%7D%5Cn%5Cn.demo-note%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%206px%3B%5Cn%20%20padding%3A%2010px%2012px%3B%5Cn%20%20color%3A%20%23475467%3B%5Cn%20%20background%3A%20%23f8fafc%3B%5Cn%20%20border%3A%201px%20solid%20%23dbe4f0%3B%5Cn%20%20border-radius%3A%2010px%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20line-height%3A%201.6%3B%5Cn%7D%5Cn%5Cn.demo-note-text%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%7D%5Cn%5Cn.override-chips%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%208px%3B%5Cn%7D%5Cn%5Cn.override-chip%20%7B%5Cn%20%20display%3A%20inline-flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20padding%3A%204px%2010px%3B%5Cn%20%20color%3A%20%23175cd3%3B%5Cn%20%20background%3A%20%23eff6ff%3B%5Cn%20%20border%3A%201px%20solid%20%23b2ddff%3B%5Cn%20%20border-radius%3A%20999px%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%20%20line-height%3A%201.4%3B%5Cn%7D%5Cn%5Cn.chat-demo-container%20%7B%5Cn%20%20--chat-content-max-width%3A%20560px%3B%5Cn%20%20height%3A%20560px%3B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20overflow%3A%20hidden%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-border-color-default%2C%20%23e5e6eb)%3B%5Cn%20%20border-radius%3A%2012px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{o.value=!1}),vueCode:n(m)},E({_:2},[l.value?{name:"vue",fn:i(()=>[t(n(l))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[4]||(e[4]=s("",9))])}}});export{w as __pageData,_ as default};
