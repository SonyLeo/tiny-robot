const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/preset-overrides.CYKOF6Sk.js","assets/chunks/index.D-tMMbE2.js","assets/chunks/useConversation.CTQzyNJx.js","assets/chunks/framework.Chy4RRS6.js","assets/chunks/useMessage.gRNNHRf2.js","assets/chunks/utils.DCcUktrc.js","assets/chunks/theme.C8T3d-Vi.js","assets/chunks/blackbox.ZK-YOqTj.js"])))=>i.map(i=>d[i]);
import{aD as c,bQ as p,aZ as u,aL as g,v as y,H as s,bL as C,bB as h,J as t,bk as n,bJ as a,G as E,b7 as B,aU as b}from"./chunks/framework.Chy4RRS6.js";import{L as A,N as f}from"./chunks/index.Dq-bVLzW.js";const m=`<template>
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
`,w=JSON.parse('{"title":"Chat 接入与入口","description":"","frontmatter":{"outline":[2,3]},"headers":[],"relativePath":"components/chat.md","filePath":"components/chat.md"}'),v={name:"components/chat.md"},_=Object.assign(v,{setup(x){const l=B();c(async()=>{l.value=(await p(async()=>{const{default:o}=await import("./chunks/preset-overrides.CYKOF6Sk.js");return{default:o}},__vite__mapDeps([0,1,2,3,4,5,6]))).default});const i=b(!0),d=B();return c(async()=>{d.value=(await p(async()=>{const{default:o}=await import("./chunks/blackbox.ZK-YOqTj.js");return{default:o}},__vite__mapDeps([7,1,2,3,4,5,6]))).default}),(o,e)=>{const r=u("ClientOnly");return g(),y("div",null,[e[2]||(e[2]=s(`<h1 id="chat-接入与入口" tabindex="-1">Chat 接入与入口 <a class="header-anchor" href="#chat-接入与入口" aria-label="Permalink to &quot;Chat 接入与入口&quot;">​</a></h1><p><code>@opentiny/tiny-robot-chat</code> 的主入口是 <code>TrChat</code>。</p><p>这页只解决 3 件事：</p><ul><li>先把一个完整聊天页跑起来</li><li>先分清 <code>config / runtime / callbacks / presetOverrides</code></li><li>先判断自己下一步应该看配置页，还是进阶页</li></ul><blockquote><p>本页示例统一请求 <code>/api/chat/completions</code>。在文档站内，service worker 会接管这个请求并返回 mock 响应；接入业务时，请替换成你自己的服务端 API。</p></blockquote><h2 id="什么时候看这页" tabindex="-1">什么时候看这页 <a class="header-anchor" href="#什么时候看这页" aria-label="Permalink to &quot;什么时候看这页&quot;">​</a></h2><p>适合：</p><ul><li>第一次接入 <code>@opentiny/tiny-robot-chat</code></li><li>想先用默认页面跑通一个可用聊天页</li><li>还在判断 <code>TrChat</code> 本身够不够用</li></ul><p>如果你现在更关心：</p><ul><li>配置字段和能力开关写在哪里 <ul><li>去看 <a href="./chat-features.html">Chat 配置与能力</a></li></ul></li><li>如何定制结构、扩展运行时、接 MCP <ul><li>去看 <a href="./chat-advanced.html">Chat 定制与进阶</a></li></ul></li></ul><h2 id="先看这-3-条路径" tabindex="-1">先看这 3 条路径 <a class="header-anchor" href="#先看这-3-条路径" aria-label="Permalink to &quot;先看这 3 条路径&quot;">​</a></h2><table tabindex="0"><thead><tr><th style="text-align:left;">你要做什么</th><th style="text-align:left;">推荐入口</th><th style="text-align:left;">什么时候升级</th></tr></thead><tbody><tr><td style="text-align:left;">跑通一个完整聊天页</td><td style="text-align:left;"><code>TrChat</code></td><td style="text-align:left;">默认结构不够用再看进阶页</td></tr><tr><td style="text-align:left;">只做页面轻量差异</td><td style="text-align:left;"><code>presetOverrides</code></td><td style="text-align:left;">覆盖不够再用 <code>slots</code></td></tr><tr><td style="text-align:left;">默认结构不够用</td><td style="text-align:left;"><code>TrChat.Scaffold</code> / <code>TrChat.Provider</code></td><td style="text-align:left;">需要自己接管运行时或页面装配时再进入</td></tr></tbody></table><p>一个简单判断顺序：</p><ol><li>先用 <code>TrChat</code></li><li>再用 <code>presetOverrides</code></li><li>再用 <code>slots</code></li><li>最后再考虑 <code>Scaffold</code> 或 <code>Provider</code></li></ol><h2 id="开始前先确认-3-个前提" tabindex="-1">开始前先确认 3 个前提 <a class="header-anchor" href="#开始前先确认-3-个前提" aria-label="Permalink to &quot;开始前先确认 3 个前提&quot;">​</a></h2><p>如果你是第一次在业务项目里接入 <code>@opentiny/tiny-robot-chat</code>，建议先把下面 3 件事补齐，再去复制最小示例。</p><h3 id="_1-先安装运行这个最小示例需要的依赖" tabindex="-1">1. 先安装运行这个最小示例需要的依赖 <a class="header-anchor" href="#_1-先安装运行这个最小示例需要的依赖" aria-label="Permalink to &quot;1. 先安装运行这个最小示例需要的依赖&quot;">​</a></h3><p><code>@opentiny/tiny-robot-chat</code> 不是一个完全独立的单包入口。如果你已经有一个 Vue 3 项目，最少需要先安装：</p><ul><li><code>@opentiny/tiny-robot</code></li><li><code>@opentiny/tiny-robot-chat</code></li><li><code>@opentiny/tiny-robot-kit</code></li><li><code>markstream-vue</code></li><li><code>markdown-it</code></li><li><code>dompurify</code></li></ul><div class="vp-code-group vp-adaptive-theme"><div class="tabs"><input type="radio" name="group-T-O_G" id="tab-Y5-_qfP" checked><label data-title="pnpm" for="tab-Y5-_qfP">pnpm</label><input type="radio" name="group-T-O_G" id="tab-ZnI6BU6"><label data-title="yarn" for="tab-ZnI6BU6">yarn</label><input type="radio" name="group-T-O_G" id="tab-JJlsf8f"><label data-title="npm" for="tab-JJlsf8f">npm</label></div><div class="blocks"><div class="language-bash vp-adaptive-theme active"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pnpm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot-chat</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot-kit</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> markstream-vue</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> markdown-it</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> dompurify</span></span></code></pre></div><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">yarn</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot-chat</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot-kit</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> markstream-vue</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> markdown-it</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> dompurify</span></span></code></pre></div><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot-chat</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot-kit</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> markstream-vue</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> markdown-it</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> dompurify</span></span></code></pre></div></div></div><p>如果你只安装 <code>@opentiny/tiny-robot-chat</code>，照着下面的最小示例直接复制，通常并不能完整跑起来。</p><h3 id="_2-在入口文件引入基础样式" tabindex="-1">2. 在入口文件引入基础样式 <a class="header-anchor" href="#_2-在入口文件引入基础样式" aria-label="Permalink to &quot;2. 在入口文件引入基础样式&quot;">​</a></h3><p>至少先在 <code>main.ts</code> / <code>main.js</code> 里引入 TinyRobot 的基础样式：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { createApp } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> App </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;./App.vue&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/dist/style.css&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">createApp</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(App).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mount</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;#app&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span></code></pre></div><p><code>chat</code> 包自己的样式会跟随包入口进入构建链，但 <code>@opentiny/tiny-robot</code> 的基础样式仍然需要你显式引入。</p><h3 id="_3-准备一个真实可请求的接口" tabindex="-1">3. 准备一个真实可请求的接口 <a class="header-anchor" href="#_3-准备一个真实可请求的接口" aria-label="Permalink to &quot;3. 准备一个真实可请求的接口&quot;">​</a></h3><p>本页所有最小示例都把 provider endpoint 写成 <code>/api/chat/completions</code>。</p><ul><li>在文档站里，这个请求会被 service worker mock 掉，所以示例可以直接演示</li><li>在你自己的项目里，这个地址需要由你自己的服务端 API 来实现</li></ul><p>如果你还没有服务端接口，最小示例可以先看 UI 是否正确渲染，但不能指望它在业务项目里直接返回真实对话结果。</p><h2 id="最小可运行示例" tabindex="-1">最小可运行示例 <a class="header-anchor" href="#最小可运行示例" aria-label="Permalink to &quot;最小可运行示例&quot;">​</a></h2>`,30)),C(t(n(A),null,null,512),[[h,i.value]]),t(r,null,{default:a(()=>[t(n(f),{title:"默认接入",description:"使用 TrChat 直接接入完整聊天页。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22blackbox.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fblackbox.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22chat-demo-container%5C%22%3E%5Cn%20%20%20%20%3CTrChat%5Cn%20%20%20%20%20%20%3Aconfig%3D%5C%22chatConfig%5C%22%5Cn%20%20%20%20%20%20%3Apreset-overrides%3D%5C%22%7B%5Cn%20%20%20%20%20%20%20%20showHistory%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20placeholder%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E9%97%AE%E9%A2%98...'%2C%5Cn%20%20%20%20%20%20%7D%5C%22%5Cn%20%20%20%20%2F%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrChat%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cn%5Cnconst%20chatConfig%20%3D%20%7B%5Cn%20%20models%3A%20%5B%5Cn%20%20%20%20%7B%20id%3A%20'gpt-4o-mini'%2C%20providerId%3A%20'openai'%2C%20label%3A%20'GPT-4o%20Mini'%20%7D%2C%5Cn%20%20%20%20%7B%20id%3A%20'gpt-4.1-mini'%2C%20providerId%3A%20'openai'%2C%20label%3A%20'GPT-4.1%20Mini'%20%7D%2C%5Cn%20%20%5D%2C%5Cn%20%20providers%3A%20%7B%5Cn%20%20%20%20openai%3A%20%7B%5Cn%20%20%20%20%20%20type%3A%20'openai-compatible'%20as%20const%2C%5Cn%20%20%20%20%20%20endpoint%3A%20'%2Fapi%2Fchat%2Fcompletions'%2C%5Cn%20%20%20%20%20%20systemPrompt%3A%20'You%20are%20a%20helpful%20assistant%20for%20the%20TinyRobot%20docs.'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20defaults%3A%20%7B%5Cn%20%20%20%20model%3A%20'gpt-4o-mini'%2C%5Cn%20%20%7D%2C%5Cn%20%20ui%3A%20%7B%5Cn%20%20%20%20brand%3A%20%7B%5Cn%20%20%20%20%20%20title%3A%20'TinyRobot%20Chat'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20welcome%3A%20%7B%5Cn%20%20%20%20%20%20title%3A%20'%E6%AC%A2%E8%BF%8E%E4%BD%BF%E7%94%A8%20Chat%20%E5%A5%97%E4%BB%B6'%2C%5Cn%20%20%20%20%20%20description%3A%20'%E8%BF%99%E4%B8%AA%E7%A4%BA%E4%BE%8B%E7%9B%B4%E6%8E%A5%E8%AF%B7%E6%B1%82%20%2Fapi%2Fchat%2Fcompletions%EF%BC%8C%E5%9C%A8%E6%96%87%E6%A1%A3%E7%AB%99%E5%86%85%E7%94%B1%20SW%20%E8%BF%94%E5%9B%9E%20mock%20%E5%93%8D%E5%BA%94%E3%80%82'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20prompts%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20label%3A%20'%E5%BF%AB%E9%80%9F%E4%B8%8A%E6%89%8B'%2C%20description%3A%20'%E5%A6%82%E4%BD%95%E5%BC%95%E5%85%A5%E5%B9%B6%E9%85%8D%E7%BD%AE%20TrChat%20%E7%BB%84%E4%BB%B6%EF%BC%9F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20label%3A%20'%E6%B5%81%E5%BC%8F%E5%93%8D%E5%BA%94'%2C%20description%3A%20'%E6%BC%94%E7%A4%BA%E4%B8%80%E4%B8%8B%E6%89%93%E5%AD%97%E6%9C%BA%E6%95%88%E6%9E%9C%E3%80%82'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20layout%3A%20%7B%5Cn%20%20%20%20contentLayout%3A%20'centered'%20as%20const%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.chat-demo-container%20%7B%5Cn%20%20height%3A%20600px%3B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-border-color-default%2C%20%23e5e6eb)%3B%5Cn%20%20border-radius%3A%208px%3B%5Cn%20%20overflow%3A%20hidden%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{i.value=!1}),vueCode:n(k)},E({_:2},[d.value?{name:"vue",fn:a(()=>[t(n(d))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[3]||(e[3]=s('<p>第一次接入时，先把这 4 块配好就够了：</p><ul><li><code>models</code></li><li><code>providers</code></li><li><code>defaults</code></li><li><code>ui</code></li></ul><p>剩余配置建议去看 <a href="./chat-features.html">Chat 配置与能力</a>。</p><h2 id="trchat-的-4-个输入项" tabindex="-1">TrChat 的 4 个输入项 <a class="header-anchor" href="#trchat-的-4-个输入项" aria-label="Permalink to &quot;TrChat 的 4 个输入项&quot;">​</a></h2><p>大多数场景里，你只需要先理解这 4 个输入项：</p><table tabindex="0"><thead><tr><th style="text-align:left;">字段</th><th style="text-align:left;">参考类型</th><th style="text-align:left;">适合放什么</th><th style="text-align:left;">什么时候最常用</th></tr></thead><tbody><tr><td style="text-align:left;"><code>config</code></td><td style="text-align:left;"><code>ChatConfig</code>，也可以传 JSON 字符串配置</td><td style="text-align:left;">模型、provider、UI、layout、features 等稳定默认值</td><td style="text-align:left;">场景默认值、长期保留的配置</td></tr><tr><td style="text-align:left;"><code>runtime</code></td><td style="text-align:left;"><code>TrChatRuntimeInput</code></td><td style="text-align:left;"><code>chatKit</code>、<code>plugins</code>、<code>storage</code>、<code>initialMessages</code>、<code>mcpManager</code>、<code>selectedModel</code>、<code>messageTransforms</code> 等实例级对象</td><td style="text-align:left;">页面实例级依赖、运行时对象、消息改写</td></tr><tr><td style="text-align:left;"><code>callbacks</code></td><td style="text-align:left;"><code>ChatScaffoldCallbacks</code></td><td style="text-align:left;"><code>onBeforeSend</code>、<code>onFinish</code>、<code>onError</code>、<code>onMessageAction</code>、<code>onModelChange</code> 等行为回调</td><td style="text-align:left;">日志、埋点、错误处理、业务联动</td></tr><tr><td style="text-align:left;"><code>presetOverrides</code></td><td style="text-align:left;"><code>TrChatPresetOverrides</code></td><td style="text-align:left;"><code>contentLayout</code>、<code>showHistory</code>、<code>showFeedback</code>、<code>placeholder</code>、<code>messageActions</code>、<code>bubbleRenderers</code> 等页面级覆盖</td><td style="text-align:left;">同一份基础配置在不同页面有轻微差异</td></tr></tbody></table><h3 id="config" tabindex="-1"><code>config</code> <a class="header-anchor" href="#config" aria-label="Permalink to &quot;`config`&quot;">​</a></h3><p><code>config</code> 负责稳定默认值。</p><p>优先放这里的通常是：</p><ul><li>模型列表</li><li>provider 配置</li><li>默认模型</li><li>品牌、欢迎区、layout、features</li></ul><p>如果你只是想查字段细节，直接看 <a href="./chat-features.html">Chat 配置与能力</a>。</p><h3 id="runtime" tabindex="-1"><code>runtime</code> <a class="header-anchor" href="#runtime" aria-label="Permalink to &quot;`runtime`&quot;">​</a></h3><p><code>runtime</code> 负责页面实例级对象。</p><p>最常见的内容包括：</p><ul><li><code>chatKit</code></li><li><code>plugins</code></li><li><code>storage</code></li><li><code>initialMessages</code></li><li><code>mcpManager</code></li><li><code>selectedModel</code></li><li><code>messageTransforms</code></li></ul><p>一个简单记法：</p><ul><li>稳定默认值放 <code>config</code></li><li>页面实例对象放 <code>runtime</code></li></ul><h3 id="callbacks" tabindex="-1"><code>callbacks</code> <a class="header-anchor" href="#callbacks" aria-label="Permalink to &quot;`callbacks`&quot;">​</a></h3><p><code>callbacks</code> 负责把 chat 行为接回你的业务。</p><p>最常见的回调包括：</p><ul><li><code>onBeforeSend</code></li><li><code>onFinish</code></li><li><code>onError</code></li><li><code>onMessageAction</code></li><li><code>onModelChange</code></li></ul><h3 id="presetoverrides" tabindex="-1"><code>presetOverrides</code> <a class="header-anchor" href="#presetoverrides" aria-label="Permalink to &quot;`presetOverrides`&quot;">​</a></h3><p><code>presetOverrides</code> 用来做页面级轻量覆盖。</p><p>常见覆盖包括：</p><ul><li><code>contentLayout</code></li><li><code>showHistory</code></li><li><code>showFeedback</code></li><li><code>placeholder</code></li><li><code>senderActionsFeature</code></li><li><code>messageActions</code></li><li><code>bubbleRenderers</code></li></ul><p>一条实用规则：</p><ul><li>场景默认值写进 <code>config</code></li><li>页面临时差异优先写进 <code>presetOverrides</code></li></ul><h3 id="常用-presetoverrides-速查" tabindex="-1">常用 <code>presetOverrides</code> 速查 <a class="header-anchor" href="#常用-presetoverrides-速查" aria-label="Permalink to &quot;常用 `presetOverrides` 速查&quot;">​</a></h3><p><code>presetOverrides</code> 是最容易越用越多的入口，源码里当前主要覆盖面如下：</p><table tabindex="0"><thead><tr><th style="text-align:left;">字段</th><th style="text-align:left;">作用</th><th style="text-align:left;">最常见场景</th></tr></thead><tbody><tr><td style="text-align:left;"><code>appearance</code></td><td style="text-align:left;">覆盖 chat 子树主题模式</td><td style="text-align:left;">某个页面强制浅色或深色</td></tr><tr><td style="text-align:left;"><code>shell</code></td><td style="text-align:left;">覆盖 workspace 外壳配置</td><td style="text-align:left;">当前页临时切到 workspace 或调整左右栏状态</td></tr><tr><td style="text-align:left;"><code>brand</code> / <code>welcome</code> / <code>prompts</code></td><td style="text-align:left;">覆盖 header 品牌、欢迎区、提示词</td><td style="text-align:left;">同一份 config 在不同页面换文案</td></tr><tr><td style="text-align:left;"><code>attachmentsFeature</code> / <code>senderActionsFeature</code></td><td style="text-align:left;">覆盖附件与发送区动作</td><td style="text-align:left;">当前页只开附件、只开字数统计等</td></tr><tr><td style="text-align:left;"><code>messages</code></td><td style="text-align:left;">覆盖内置文案 copy</td><td style="text-align:left;">本地化、业务术语替换</td></tr><tr><td style="text-align:left;"><code>placeholder</code> / <code>maxLength</code> / <code>senderMode</code></td><td style="text-align:left;">覆盖发送区基础输入行为</td><td style="text-align:left;">单行/多行、占位文案、长度限制</td></tr><tr><td style="text-align:left;"><code>autoScroll</code> / <code>messageListVariant</code> / <code>contentLayout</code></td><td style="text-align:left;">覆盖消息区布局与滚动行为</td><td style="text-align:left;">docs / workspace / 宽版内容区切换</td></tr><tr><td style="text-align:left;"><code>showHistory</code> / <code>showFeedback</code> / <code>show</code></td><td style="text-align:left;">覆盖历史入口、反馈区、整体显示状态</td><td style="text-align:left;">某页临时关闭某个默认能力</td></tr><tr><td style="text-align:left;"><code>messageActions</code> / <code>messageActionsMode</code> / <code>onMessageAction</code></td><td style="text-align:left;">扩展消息级操作</td><td style="text-align:left;">保存案例、跳转工单、替换默认操作</td></tr><tr><td style="text-align:left;"><code>bubbleRenderers</code></td><td style="text-align:left;">注册内容命中或气泡级 renderer</td><td style="text-align:left;">特定消息卡片、结构化内容渲染</td></tr><tr><td style="text-align:left;"><code>roleConfigs</code> / <code>groupStrategy</code></td><td style="text-align:left;">调整 BubbleList 分组和角色表现</td><td style="text-align:left;">强化 user / assistant 的版式差异</td></tr><tr><td style="text-align:left;"><code>senderProps</code> / <code>bubbleListProps</code> / <code>historyProps</code></td><td style="text-align:left;">透传更底层组件 props</td><td style="text-align:left;">局部调优基础组件，不想整体改结构</td></tr><tr><td style="text-align:left;"><code>attachmentsManager</code> / <code>mcpManager</code></td><td style="text-align:left;">页面级接管附件或 MCP manager</td><td style="text-align:left;">已有实例对象，想复用到当前页</td></tr><tr><td style="text-align:left;"><code>onModelChange</code></td><td style="text-align:left;">页面级模型切换回调</td><td style="text-align:left;">页面内状态联动、埋点</td></tr></tbody></table><h2 id="常用-slots-一览" tabindex="-1">常用 slots 一览 <a class="header-anchor" href="#常用-slots-一览" aria-label="Permalink to &quot;常用 slots 一览&quot;">​</a></h2><p>很多“只改一点默认 UI”的需求，其实不需要离开 <code>TrChat</code>。</p><h3 id="通用区域-slots" tabindex="-1">通用区域 slots <a class="header-anchor" href="#通用区域-slots" aria-label="Permalink to &quot;通用区域 slots&quot;">​</a></h3><table tabindex="0"><thead><tr><th style="text-align:left;">slot</th><th style="text-align:left;">作用</th><th style="text-align:left;">当前是否有 scoped props</th></tr></thead><tbody><tr><td style="text-align:left;"><code>header</code></td><td style="text-align:left;">完全替换默认 header 区</td><td style="text-align:left;">无</td></tr><tr><td style="text-align:left;"><code>header-extra</code></td><td style="text-align:left;">给默认 header 右侧补按钮或工具位</td><td style="text-align:left;">无</td></tr><tr><td style="text-align:left;"><code>welcome</code></td><td style="text-align:left;">替换欢迎区</td><td style="text-align:left;">无</td></tr><tr><td style="text-align:left;"><code>empty</code></td><td style="text-align:left;">在没有 <code>welcome</code> slice 时提供空态内容</td><td style="text-align:left;">无</td></tr><tr><td style="text-align:left;"><code>message-list</code></td><td style="text-align:left;">接管整个中间消息区</td><td style="text-align:left;">有：<code>{ messages }</code></td></tr><tr><td style="text-align:left;"><code>sender</code></td><td style="text-align:left;">接管底部输入区 UI，但保留默认运行时</td><td style="text-align:left;">有：<code>{ send, abort, status, lastError, retry }</code></td></tr><tr><td style="text-align:left;"><code>footer-extra</code></td><td style="text-align:left;">给默认 footer 顶部补说明或状态条</td><td style="text-align:left;">无</td></tr></tbody></table><h3 id="workspace-区域-slots" tabindex="-1">Workspace 区域 slots <a class="header-anchor" href="#workspace-区域-slots" aria-label="Permalink to &quot;Workspace 区域 slots&quot;">​</a></h3><table tabindex="0"><thead><tr><th style="text-align:left;">slot</th><th style="text-align:left;">作用</th><th style="text-align:left;">什么时候用</th></tr></thead><tbody><tr><td style="text-align:left;"><code>left</code></td><td style="text-align:left;">替换 workspace 左侧面板内容</td><td style="text-align:left;">想自定义左栏主体内容</td></tr><tr><td style="text-align:left;"><code>left-rail</code></td><td style="text-align:left;">替换左侧 rail 内容</td><td style="text-align:left;">左栏折叠态需要自定义快捷入口</td></tr><tr><td style="text-align:left;"><code>right</code></td><td style="text-align:left;">替换 workspace 右侧面板内容</td><td style="text-align:left;">放预览、上下文、工具结果等</td></tr><tr><td style="text-align:left;"><code>mobile-left</code></td><td style="text-align:left;">替换移动端左侧 drawer / sheet</td><td style="text-align:left;">移动端左栏和桌面端结构不同</td></tr><tr><td style="text-align:left;"><code>mobile-right</code></td><td style="text-align:left;">替换移动端右侧 drawer / sheet</td><td style="text-align:left;">移动端右栏和桌面端结构不同</td></tr></tbody></table><h3 id="bubble-扩展-slots" tabindex="-1">Bubble 扩展 slots <a class="header-anchor" href="#bubble-扩展-slots" aria-label="Permalink to &quot;Bubble 扩展 slots&quot;">​</a></h3><p>源码里当前固定的 bubble 扩展 slot 名称是：</p><ul><li><code>prefix</code></li><li><code>suffix</code></li><li><code>after</code></li><li><code>content-footer</code></li></ul><p>这些 slot 都会挂到默认 <code>ChatMessageList</code> 的 bubble 渲染链上，适合补：</p><ul><li>气泡前后的标识和状态</li><li>自定义消息操作区</li><li>反馈区之外的额外说明</li><li>结构化内容底部附加信息</li></ul><p>推荐顺序：</p><ol><li>先试 <code>presetOverrides</code></li><li>再试 <code>header-extra</code> / <code>footer-extra</code> / <code>welcome</code></li><li>已经切到 workspace shell 时，再试 <code>left / right / mobile-left / mobile-right</code></li><li>默认结构真的不够用时，再看 <a href="./chat-advanced.html">Chat 定制与进阶</a></li></ol><h2 id="页面级覆盖优先于拆结构" tabindex="-1">页面级覆盖优先于拆结构 <a class="header-anchor" href="#页面级覆盖优先于拆结构" aria-label="Permalink to &quot;页面级覆盖优先于拆结构&quot;">​</a></h2><p>如果基础配置是稳定的，但某个页面只是想切布局、文案或能力开关，优先用 <code>presetOverrides</code>，不要先拆页面结构。</p><p>典型场景：</p><ul><li>基础场景复用同一份 <code>config</code></li><li>某些页面只在主题、<code>history</code>、<code>feedback</code>、<code>contentLayout</code> 或发送区细节上有差异</li><li>页面不想为这些小差异单独维护一份新配置</li></ul>',47)),C(t(n(A),null,null,512),[[h,i.value]]),t(r,null,{default:a(()=>[t(n(f),{title:"页面级覆盖",description:"在不改基础 config 的前提下，切换“基础页 / 覆盖页”两种页面身份，观察 presetOverrides 如何承接当前页的轻量差异。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22preset-overrides.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fpreset-overrides.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22chat-demo-shell%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22demo-toolbar%5C%22%3E%5Cn%20%20%20%20%20%20%3Cbutton%20%3Aclass%3D%5C%22buttonClass(pageMode%20%3D%3D%3D%20'base')%5C%22%20%40click%3D%5C%22pageMode%20%3D%20'base'%5C%22%3E%E5%9F%BA%E7%A1%80%E9%A1%B5%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3Cbutton%20%3Aclass%3D%5C%22buttonClass(pageMode%20%3D%3D%3D%20'override')%5C%22%20%40click%3D%5C%22pageMode%20%3D%20'override'%5C%22%3E%E8%A6%86%E7%9B%96%E9%A1%B5%3C%2Fbutton%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22demo-note%5C%22%3E%5Cn%20%20%20%20%20%20%3Cstrong%3E%7B%7B%20activeScenario.title%20%7D%7D%3C%2Fstrong%3E%5Cn%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22demo-note-text%5C%22%3E%7B%7B%20activeScenario.description%20%7D%7D%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22demo-note-text%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%E8%BF%99%E4%B8%AA%E7%A4%BA%E4%BE%8B%E4%BC%9A%E6%8A%8A%20%60centered%60%20%E7%9A%84%E6%BC%94%E7%A4%BA%E9%98%88%E5%80%BC%E4%B8%B4%E6%97%B6%E5%8E%8B%E5%88%B0%20%60560px%60%EF%BC%8C%E6%96%B9%E4%BE%BF%E5%9C%A8%E6%96%87%E6%A1%A3%E9%A2%84%E8%A7%88%E9%87%8C%E7%9B%B4%E6%8E%A5%E7%9C%8B%E5%87%BA%20%60contentLayout%60%20%E7%9A%84%E5%B7%AE%E5%BC%82%E3%80%82%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22override-chips%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%20v-for%3D%5C%22item%20in%20activeScenario.chips%5C%22%20%3Akey%3D%5C%22item%5C%22%20class%3D%5C%22override-chip%5C%22%3E%7B%7B%20item%20%7D%7D%3C%2Fspan%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22chat-demo-container%5C%22%20data-demo-layout-preview%3D%5C%22true%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrChat%20%3Aconfig%3D%5C%22chatConfig%5C%22%20%3Aruntime%3D%5C%22%7B%20initialMessages%20%7D%5C%22%20%3Apreset-overrides%3D%5C%22activePresetOverrides%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrChat%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cn%5Cntype%20PageMode%20%3D%20'base'%20%7C%20'override'%5Cn%5Cnconst%20pageMode%20%3D%20ref%3CPageMode%3E('override')%5Cn%5Cnconst%20chatConfig%20%3D%20%7B%5Cn%20%20models%3A%20%5B%5Cn%20%20%20%20%7B%20id%3A%20'gpt-4o-mini'%2C%20providerId%3A%20'openai'%2C%20label%3A%20'GPT-4o%20Mini'%20%7D%2C%5Cn%20%20%20%20%7B%20id%3A%20'gpt-4.1-mini'%2C%20providerId%3A%20'openai'%2C%20label%3A%20'GPT-4.1%20Mini'%20%7D%2C%5Cn%20%20%5D%2C%5Cn%20%20providers%3A%20%7B%5Cn%20%20%20%20openai%3A%20%7B%5Cn%20%20%20%20%20%20type%3A%20'openai-compatible'%20as%20const%2C%5Cn%20%20%20%20%20%20endpoint%3A%20'%2Fapi%2Fchat%2Fcompletions'%2C%5Cn%20%20%20%20%20%20systemPrompt%3A%20'You%20are%20a%20helpful%20assistant%20for%20the%20TinyRobot%20docs.'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20defaults%3A%20%7B%5Cn%20%20%20%20model%3A%20'gpt-4o-mini'%2C%5Cn%20%20%7D%2C%5Cn%20%20ui%3A%20%7B%5Cn%20%20%20%20brand%3A%20%7B%5Cn%20%20%20%20%20%20title%3A%20'%E9%A1%B5%E9%9D%A2%E7%BA%A7%E8%A6%86%E7%9B%96%E7%A4%BA%E4%BE%8B'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20welcome%3A%20%7B%5Cn%20%20%20%20%20%20title%3A%20'%E5%90%8C%E4%B8%80%E4%BB%BD%E5%9F%BA%E7%A1%80%E9%85%8D%E7%BD%AE'%2C%5Cn%20%20%20%20%20%20description%3A%20'%E8%BF%99%E9%87%8C%E6%BC%94%E7%A4%BA%E7%9A%84%E4%B8%8D%E6%98%AF%20feature%20%E5%BC%80%E5%85%B3%EF%BC%8C%E8%80%8C%E6%98%AF%E5%90%8C%E4%B8%80%E4%BB%BD%20config%20%E5%9C%A8%E4%B8%8D%E5%90%8C%E9%A1%B5%E9%9D%A2%E9%87%8C%E7%9A%84%E8%BD%BB%E9%87%8F%E5%B7%AE%E5%BC%82%E3%80%82'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20layout%3A%20%7B%5Cn%20%20%20%20contentLayout%3A%20'centered'%20as%20const%2C%5Cn%20%20%7D%2C%5Cn%20%20features%3A%20%7B%5Cn%20%20%20%20history%3A%20false%2C%5Cn%20%20%20%20feedback%3A%20false%2C%5Cn%20%20%20%20senderActions%3A%20false%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20initialMessages%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20content%3A%20'%E8%BF%99%E6%98%AF%E4%B8%80%E6%AE%B5%E4%B8%93%E9%97%A8%E7%94%A8%E6%9D%A5%E8%A7%82%E5%AF%9F%E9%A1%B5%E9%9D%A2%E7%BA%A7%E8%A6%86%E7%9B%96%E7%9A%84%E6%BC%94%E7%A4%BA%E6%B6%88%E6%81%AF%E3%80%82%E4%BD%A0%E7%8E%B0%E5%9C%A8%E7%9C%8B%E5%88%B0%E7%9A%84%E6%98%AF%E5%90%8C%E4%B8%80%E4%BB%BD%E5%9F%BA%E7%A1%80%20config%20%E4%B8%8B%E7%9A%84%E6%9F%90%E4%B8%AA%E9%A1%B5%E9%9D%A2%E5%AE%9E%E4%BE%8B%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20content%3A%20'%E8%AF%B7%E8%AF%B4%E6%98%8E%E4%B8%BA%E4%BB%80%E4%B9%88%E8%BF%99%E9%87%8C%E6%9B%B4%E9%80%82%E5%90%88%E7%94%A8%20presetOverrides%EF%BC%8C%E8%80%8C%E4%B8%8D%E6%98%AF%E5%86%8D%E7%BB%B4%E6%8A%A4%E4%B8%80%E4%BB%BD%E6%96%B0%E7%9A%84%20config%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20content%3A%5Cn%20%20%20%20%20%20'%E5%9B%A0%E4%B8%BA%E6%A8%A1%E5%9E%8B%E3%80%81provider%20%E5%92%8C%E5%A4%A7%E5%A4%9A%E6%95%B0%20UI%20%E9%BB%98%E8%AE%A4%E5%80%BC%E9%83%BD%E6%B2%A1%E5%8F%98%EF%BC%8C%E5%8F%98%E5%8C%96%E7%9A%84%E5%8F%AA%E6%98%AF%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E5%AF%B9%E4%B8%BB%E9%A2%98%E3%80%81%E5%AE%BD%E5%BA%A6%E3%80%81history%E3%80%81feedback%20%E5%92%8C%E5%8F%91%E9%80%81%E5%8C%BA%E7%BB%86%E8%8A%82%E7%9A%84%E8%BD%BB%E9%87%8F%E8%B0%83%E6%95%B4%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20scenarios%20%3D%20%7B%5Cn%20%20base%3A%20%7B%5Cn%20%20%20%20title%3A%20'%E5%9F%BA%E7%A1%80%E9%A1%B5'%2C%5Cn%20%20%20%20description%3A%20'%E7%9B%B4%E6%8E%A5%E4%BD%BF%E7%94%A8%E5%9F%BA%E7%A1%80%20config%EF%BC%8C%E4%B8%8D%E9%A2%9D%E5%A4%96%E5%A2%9E%E5%8A%A0%E9%A1%B5%E9%9D%A2%E5%B7%AE%E5%BC%82%E3%80%82%E9%80%82%E5%90%88%E9%BB%98%E8%AE%A4%E8%81%8A%E5%A4%A9%E9%A1%B5%E6%88%96%E6%9C%80%E6%99%AE%E9%80%9A%E7%9A%84%E4%B8%9A%E5%8A%A1%E6%8E%A5%E5%85%A5%E9%A1%B5%E3%80%82'%2C%5Cn%20%20%20%20chips%3A%20%5B'%E6%97%A0%E9%A1%B5%E9%9D%A2%E7%BA%A7%E8%A6%86%E7%9B%96'%2C%20'centered'%2C%20'history%20%E5%85%B3%E9%97%AD'%2C%20'feedback%20%E5%85%B3%E9%97%AD'%5D%2C%5Cn%20%20%20%20overrides%3A%20%7B%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20override%3A%20%7B%5Cn%20%20%20%20title%3A%20'%E8%A6%86%E7%9B%96%E9%A1%B5'%2C%5Cn%20%20%20%20description%3A%5Cn%20%20%20%20%20%20'%E4%BF%9D%E6%8C%81%E5%9F%BA%E7%A1%80%20config%20%E4%B8%8D%E5%8F%98%EF%BC%8C%E5%8F%AA%E5%9C%A8%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E9%80%9A%E8%BF%87%20%60presetOverrides%60%20%E8%B0%83%E6%95%B4%E4%B8%BB%E9%A2%98%E3%80%81%E5%86%85%E5%AE%B9%E5%AE%BD%E5%BA%A6%E3%80%81history%E3%80%81feedback%20%E5%92%8C%E5%8F%91%E9%80%81%E5%8C%BA%E8%A1%8C%E4%B8%BA%E3%80%82'%2C%5Cn%20%20%20%20chips%3A%20%5B'appearance.dark'%2C%20'contentLayout%3A%20wide'%2C%20'showHistory'%2C%20'showFeedback'%2C%20'maxLength%3A%20300'%2C%20'wordCount'%5D%2C%5Cn%20%20%20%20overrides%3A%20%7B%5Cn%20%20%20%20%20%20appearance%3A%20%7B%5Cn%20%20%20%20%20%20%20%20mode%3A%20'dark'%20as%20const%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20contentLayout%3A%20'wide'%20as%20const%2C%5Cn%20%20%20%20%20%20showHistory%3A%20true%2C%5Cn%20%20%20%20%20%20showFeedback%3A%20true%2C%5Cn%20%20%20%20%20%20placeholder%3A%20'%E5%BD%93%E5%89%8D%E6%98%AF%E8%A6%86%E7%9B%96%E9%A1%B5...'%2C%5Cn%20%20%20%20%20%20maxLength%3A%20300%2C%5Cn%20%20%20%20%20%20senderActionsFeature%3A%20%7B%5Cn%20%20%20%20%20%20%20%20enabled%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20wordCount%3A%20true%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%7D%20as%20const%5Cn%5Cnconst%20activeScenario%20%3D%20computed(()%20%3D%3E%20scenarios%5BpageMode.value%5D)%5Cnconst%20activePresetOverrides%20%3D%20computed(()%20%3D%3E%20activeScenario.value.overrides)%5Cn%5Cnfunction%20buttonClass(active%3A%20boolean)%20%7B%5Cn%20%20return%20%5B'toolbar-button'%2C%20%7B%20active%20%7D%5D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.chat-demo-shell%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%7D%5Cn%5Cn.demo-toolbar%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%208px%3B%5Cn%7D%5Cn%5Cn.toolbar-button%20%7B%5Cn%20%20padding%3A%208px%2012px%3B%5Cn%20%20color%3A%20%23344054%3B%5Cn%20%20background%3A%20%23fff%3B%5Cn%20%20border%3A%201px%20solid%20%23d0d5dd%3B%5Cn%20%20border-radius%3A%20999px%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.toolbar-button.active%20%7B%5Cn%20%20color%3A%20%23175cd3%3B%5Cn%20%20background%3A%20%23eff6ff%3B%5Cn%20%20border-color%3A%20%23b2ddff%3B%5Cn%7D%5Cn%5Cn.demo-note%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%206px%3B%5Cn%20%20padding%3A%2010px%2012px%3B%5Cn%20%20color%3A%20%23475467%3B%5Cn%20%20background%3A%20%23f8fafc%3B%5Cn%20%20border%3A%201px%20solid%20%23dbe4f0%3B%5Cn%20%20border-radius%3A%2010px%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20line-height%3A%201.6%3B%5Cn%7D%5Cn%5Cn.demo-note-text%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%7D%5Cn%5Cn.override-chips%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%208px%3B%5Cn%7D%5Cn%5Cn.override-chip%20%7B%5Cn%20%20display%3A%20inline-flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20padding%3A%204px%2010px%3B%5Cn%20%20color%3A%20%23175cd3%3B%5Cn%20%20background%3A%20%23eff6ff%3B%5Cn%20%20border%3A%201px%20solid%20%23b2ddff%3B%5Cn%20%20border-radius%3A%20999px%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%20%20line-height%3A%201.4%3B%5Cn%7D%5Cn%5Cn.chat-demo-container%20%7B%5Cn%20%20--chat-content-max-width%3A%20560px%3B%5Cn%20%20height%3A%20560px%3B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20overflow%3A%20hidden%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-border-color-default%2C%20%23e5e6eb)%3B%5Cn%20%20border-radius%3A%2012px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{i.value=!1}),vueCode:n(m)},E({_:2},[l.value?{name:"vue",fn:a(()=>[t(n(l))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[4]||(e[4]=s('<h2 id="接下来该看哪一页" tabindex="-1">接下来该看哪一页 <a class="header-anchor" href="#接下来该看哪一页" aria-label="Permalink to &quot;接下来该看哪一页&quot;">​</a></h2><p>如果你现在要查：</p><ul><li>配置字段</li><li><code>features</code></li><li><code>config.integrations</code></li><li><code>shell</code> 和 <code>layout</code></li><li>能力开关和优先级</li></ul><p>请继续看：</p><ul><li><a href="./chat-features.html">Chat 配置与能力</a></li></ul><p>如果你现在要做：</p><ul><li>workspace 左右面板替换</li><li><code>Scaffold</code> / <code>Provider</code></li><li><code>messageActions</code></li><li><code>bubbleRenderers</code></li><li><code>messageTransforms</code></li><li>MCP 接入</li></ul><p>请继续看：</p><ul><li><a href="./chat-advanced.html">Chat 定制与进阶</a></li></ul>',9))])}}});export{w as __pageData,_ as default};
