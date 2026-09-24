const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/runtime-error.DaS7_dhQ.js","assets/chunks/index.CxwaSVxk.js","assets/chunks/framework.U4597d8b.js","assets/chunks/theme.BbUoO7b_.js","assets/chunks/index.BC6YLW9m.js","assets/chunks/runtime-send.ChJeOY4H.js","assets/chunks/basic.CR4TId6-.js","assets/chunks/modelProviders.InMS2kCU.js"])))=>i.map(i=>d[i]);
import{aD as h,bQ as p,aZ as y,aL as A,v as b,H as o,bL as C,bB as u,J as t,bk as n,bJ as a,G as k,b7 as E,aU as B}from"./chunks/framework.U4597d8b.js";import{T as v,a as F}from"./chunks/basic.BGvZKLpn.js";import{L as m,N as g}from"./chunks/index.iUw3Fsxy.js";const f=`<script setup lang="ts">
import { shallowRef } from 'vue'
import { useConversation, type ResponseProvider } from '@opentiny/tiny-robot-kit'
import { useChatRuntimeFromConversation } from '@opentiny/tiny-robot-chat'

const defaultResult = shallowRef('尚未发送')
const customResult = shallowRef('尚未发送')
const responseProvider: ResponseProvider = async () => ({
  id: 'runtime-send-demo',
  object: 'chat.completion',
  created: 0,
  model: 'runtime-send-demo',
  system_fingerprint: null,
  choices: [
    {
      index: 0,
      message: { role: 'assistant', content: '' },
      delta: undefined,
      logprobs: null,
      finish_reason: 'stop',
    },
  ],
})

function createDemoConversation() {
  return useConversation({
    useMessageOptions: { responseProvider },
  })
}

const defaultRuntime = useChatRuntimeFromConversation({ conversation: createDemoConversation() })
const customRuntime = useChatRuntimeFromConversation({
  conversation: createDemoConversation(),
  send: ({ text }) => {
    customResult.value = \`自定义 send 收到 text: \${JSON.stringify(text)}\`
  },
})

async function sendDefaultEmptyText() {
  defaultResult.value = String(await defaultRuntime.actions.send({ text: '' }))
}

async function sendCustomEmptyText() {
  const sent = await customRuntime.actions.send({ text: '' })
  customResult.value = \`\${customResult.value}，结果: \${sent}\`
}
<\/script>

<template>
  <section class="runtime-send-demo">
    <div class="runtime-send-demo__item">
      <h3>默认发送</h3>
      <button class="runtime-send-demo__button" type="button" @click="sendDefaultEmptyText">发送空文本</button>
      <p aria-live="polite">结果：{{ defaultResult }}</p>
    </div>
    <div class="runtime-send-demo__item">
      <h3>自定义 send</h3>
      <button class="runtime-send-demo__button" type="button" @click="sendCustomEmptyText">发送空文本</button>
      <p aria-live="polite">结果：{{ customResult }}</p>
    </div>
  </section>
</template>

<style scoped>
.runtime-send-demo {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.runtime-send-demo__item {
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--tr-common-border-color);
}

.runtime-send-demo__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  border: 1px solid #2f6fad;
  border-radius: 6px;
  padding: 6px 12px;
  color: #fff;
  background: #2f6fad;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
}

.runtime-send-demo__button:hover {
  border-color: #24598d;
  background: #24598d;
}

.runtime-send-demo__button:focus-visible {
  outline: 2px solid #8ab8df;
  outline-offset: 2px;
}

.runtime-send-demo :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.runtime-send-demo__item h3,
.runtime-send-demo__item p {
  margin: 0 0 12px;
}

@media (max-width: 640px) {
  .runtime-send-demo {
    grid-template-columns: 1fr;
  }
}
</style>
`,S=JSON.parse('{"title":"Chat 运行时","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"suites/chat-runtime.md","filePath":"suites/chat-runtime.md"}'),D={name:"suites/chat-runtime.md"},w=Object.assign(D,{setup(R){const d=E();h(async()=>{d.value=(await p(async()=>{const{default:i}=await import("./chunks/runtime-error.DaS7_dhQ.js");return{default:i}},__vite__mapDeps([0,1,2,3,4]))).default});const r=E();h(async()=>{r.value=(await p(async()=>{const{default:i}=await import("./chunks/runtime-send.ChJeOY4H.js");return{default:i}},__vite__mapDeps([5,4,2,1,3]))).default});const s=B(!0),l=E();return h(async()=>{l.value=(await p(async()=>{const{default:i}=await import("./chunks/basic.CR4TId6-.js");return{default:i}},__vite__mapDeps([6,1,2,3,4,7]))).default}),(i,e)=>{const c=y("ClientOnly");return A(),b("div",null,[e[3]||(e[3]=o("",7)),C(t(n(m),null,null,512),[[u,s.value]]),t(c,null,{default:a(()=>[t(n(g),{title:"创建运行时",description:"配置模型服务后创建 Runtime，发送消息并获得回答。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22basic.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fbasic.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrChat%2C%20useChatRuntime%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cnimport%20%7B%20modelProviders%20%7D%20from%20'.%2Fshared%2FmodelProviders'%5Cn%5Cnconst%20runtime%20%3D%20useChatRuntime(%7B%20modelProviders%20%7D)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22chat-basic-demo%5C%22%3E%5Cn%20%20%20%20%3Ctr-chat%20%3Aruntime%3D%5C%22runtime%5C%22%20%2F%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.chat-basic-demo%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20box-sizing%3A%20border-box%3B%5Cn%20%20height%3A%20min(620px%2C%20calc(100vh%20-%20240px))%3B%5Cn%20%20min-height%3A%20480px%3B%5Cn%7D%5Cn%5Cn.chat-basic-demo%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%5Cn.chat-basic-demo%20%3Adeep(.tr-welcome__title-wrapper)%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%7D%5Cn%5Cn%40media%20(max-width%3A%20640px)%20%7B%5Cn%20%20.chat-basic-demo%20%7B%5Cn%20%20%20%20height%3A%20560px%3B%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22modelProviders.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2FmodelProviders.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatProviderConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20%7B%20IconBailian%2C%20IconDeepseek%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cn%5Cnconst%20runtimeOrigin%20%3D%20typeof%20window%20%3D%3D%3D%20'undefined'%20%3F%20'http%3A%2F%2Flocalhost'%20%3A%20window.location.origin%5Cnconst%20defaultApiUrl%20%3D%20new%20URL(%60%24%7B'%2Ftiny-robot%2Fbeta%2F'%7Dapi%60%2C%20runtimeOrigin).toString()%5Cn%5Cnexport%20const%20modelProviders%3A%20ChatProviderConfig%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'qwen'%2C%5Cn%20%20%20%20label%3A%20'DashScope'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-plus'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Plus'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-max'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Max'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'deepseek'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-pro'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Pro'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{s.value=!1}),vueCode:n(v)},k({_:2},[l.value?{name:"vue",fn:a(()=>[t(n(l))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[4]||(e[4]=o("",13)),C(t(n(m),null,null,512),[[u,s.value]]),t(c,null,{default:a(()=>[t(n(g),{title:"自定义发送",description:"比较默认发送与自定义 send 对空文本的处理结果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22runtime-send.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fruntime-send.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%20useConversation%2C%20type%20ResponseProvider%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20useChatRuntimeFromConversation%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cn%5Cnconst%20defaultResult%20%3D%20shallowRef('%E5%B0%9A%E6%9C%AA%E5%8F%91%E9%80%81')%5Cnconst%20customResult%20%3D%20shallowRef('%E5%B0%9A%E6%9C%AA%E5%8F%91%E9%80%81')%5Cnconst%20responseProvider%3A%20ResponseProvider%20%3D%20async%20()%20%3D%3E%20(%7B%5Cn%20%20id%3A%20'runtime-send-demo'%2C%5Cn%20%20object%3A%20'chat.completion'%2C%5Cn%20%20created%3A%200%2C%5Cn%20%20model%3A%20'runtime-send-demo'%2C%5Cn%20%20system_fingerprint%3A%20null%2C%5Cn%20%20choices%3A%20%5B%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20message%3A%20%7B%20role%3A%20'assistant'%2C%20content%3A%20''%20%7D%2C%5Cn%20%20%20%20%20%20delta%3A%20undefined%2C%5Cn%20%20%20%20%20%20logprobs%3A%20null%2C%5Cn%20%20%20%20%20%20finish_reason%3A%20'stop'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%5D%2C%5Cn%7D)%5Cn%5Cnfunction%20createDemoConversation()%20%7B%5Cn%20%20return%20useConversation(%7B%5Cn%20%20%20%20useMessageOptions%3A%20%7B%20responseProvider%20%7D%2C%5Cn%20%20%7D)%5Cn%7D%5Cn%5Cnconst%20defaultRuntime%20%3D%20useChatRuntimeFromConversation(%7B%20conversation%3A%20createDemoConversation()%20%7D)%5Cnconst%20customRuntime%20%3D%20useChatRuntimeFromConversation(%7B%5Cn%20%20conversation%3A%20createDemoConversation()%2C%5Cn%20%20send%3A%20(%7B%20text%20%7D)%20%3D%3E%20%7B%5Cn%20%20%20%20customResult.value%20%3D%20%60%E8%87%AA%E5%AE%9A%E4%B9%89%20send%20%E6%94%B6%E5%88%B0%20text%3A%20%24%7BJSON.stringify(text)%7D%60%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%5Cnasync%20function%20sendDefaultEmptyText()%20%7B%5Cn%20%20defaultResult.value%20%3D%20String(await%20defaultRuntime.actions.send(%7B%20text%3A%20''%20%7D))%5Cn%7D%5Cn%5Cnasync%20function%20sendCustomEmptyText()%20%7B%5Cn%20%20const%20sent%20%3D%20await%20customRuntime.actions.send(%7B%20text%3A%20''%20%7D)%5Cn%20%20customResult.value%20%3D%20%60%24%7BcustomResult.value%7D%EF%BC%8C%E7%BB%93%E6%9E%9C%3A%20%24%7Bsent%7D%60%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22runtime-send-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22runtime-send-demo__item%5C%22%3E%5Cn%20%20%20%20%20%20%3Ch3%3E%E9%BB%98%E8%AE%A4%E5%8F%91%E9%80%81%3C%2Fh3%3E%5Cn%20%20%20%20%20%20%3Cbutton%20class%3D%5C%22runtime-send-demo__button%5C%22%20type%3D%5C%22button%5C%22%20%40click%3D%5C%22sendDefaultEmptyText%5C%22%3E%E5%8F%91%E9%80%81%E7%A9%BA%E6%96%87%E6%9C%AC%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3Cp%20aria-live%3D%5C%22polite%5C%22%3E%E7%BB%93%E6%9E%9C%EF%BC%9A%7B%7B%20defaultResult%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22runtime-send-demo__item%5C%22%3E%5Cn%20%20%20%20%20%20%3Ch3%3E%E8%87%AA%E5%AE%9A%E4%B9%89%20send%3C%2Fh3%3E%5Cn%20%20%20%20%20%20%3Cbutton%20class%3D%5C%22runtime-send-demo__button%5C%22%20type%3D%5C%22button%5C%22%20%40click%3D%5C%22sendCustomEmptyText%5C%22%3E%E5%8F%91%E9%80%81%E7%A9%BA%E6%96%87%E6%9C%AC%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3Cp%20aria-live%3D%5C%22polite%5C%22%3E%E7%BB%93%E6%9E%9C%EF%BC%9A%7B%7B%20customResult%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.runtime-send-demo%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20grid-template-columns%3A%20repeat(2%2C%20minmax(0%2C%201fr))%3B%5Cn%20%20gap%3A%2016px%3B%5Cn%7D%5Cn%5Cn.runtime-send-demo__item%20%7B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20padding%3A%2016px%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-common-border-color)%3B%5Cn%7D%5Cn%5Cn.runtime-send-demo__button%20%7B%5Cn%20%20display%3A%20inline-flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%20%20min-height%3A%2032px%3B%5Cn%20%20border%3A%201px%20solid%20%232f6fad%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20padding%3A%206px%2012px%3B%5Cn%20%20color%3A%20%23fff%3B%5Cn%20%20background%3A%20%232f6fad%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%20%20font%3A%20inherit%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.runtime-send-demo__button%3Ahover%20%7B%5Cn%20%20border-color%3A%20%2324598d%3B%5Cn%20%20background%3A%20%2324598d%3B%5Cn%7D%5Cn%5Cn.runtime-send-demo__button%3Afocus-visible%20%7B%5Cn%20%20outline%3A%202px%20solid%20%238ab8df%3B%5Cn%20%20outline-offset%3A%202px%3B%5Cn%7D%5Cn%5Cn.runtime-send-demo%20%3Adeep(.tr-welcome__title-wrapper)%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%7D%5Cn%5Cn.runtime-send-demo__item%20h3%2C%5Cn.runtime-send-demo__item%20p%20%7B%5Cn%20%20margin%3A%200%200%2012px%3B%5Cn%7D%5Cn%5Cn%40media%20(max-width%3A%20640px)%20%7B%5Cn%20%20.runtime-send-demo%20%7B%5Cn%20%20%20%20grid-template-columns%3A%201fr%3B%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{s.value=!1}),vueCode:n(f)},k({_:2},[r.value?{name:"vue",fn:a(()=>[t(n(r))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[5]||(e[5]=o("",5)),C(t(n(m),null,null,512),[[u,s.value]]),t(c,null,{default:a(()=>[t(n(g),{title:"本地 Runtime 错误状态",description:"触发确定性请求失败，观察错误归属、Promise 传播和后续成功发送。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22runtime-error.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fruntime-error.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20type%20%7B%20ConversationStorageStrategy%2C%20MessageRequestBody%2C%20ResponseProvider%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20TrChat%2C%20useChatRuntime%2C%20type%20ChatRuntimeActionErrorPayload%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cn%5Cnlet%20responseIndex%20%3D%200%5Cn%5Cnconst%20memoryStorage%3A%20ConversationStorageStrategy%20%3D%20%7B%5Cn%20%20loadConversations%3A%20()%20%3D%3E%20%5B%5D%2C%5Cn%20%20loadMessages%3A%20()%20%3D%3E%20%5B%5D%2C%5Cn%20%20saveConversation%3A%20()%20%3D%3E%20undefined%2C%5Cn%20%20saveMessages%3A%20()%20%3D%3E%20undefined%2C%5Cn%20%20deleteConversation%3A%20()%20%3D%3E%20undefined%2C%5Cn%7D%5Cn%5Cnconst%20responseProvider%3A%20ResponseProvider%20%3D%20async%20(requestBody%3A%20MessageRequestBody)%20%3D%3E%20%7B%5Cn%20%20await%20new%20Promise((resolve)%20%3D%3E%20setTimeout(resolve%2C%20300))%5Cn%5Cn%20%20const%20text%20%3D%20String(requestBody.messages.filter((message)%20%3D%3E%20message.role%20%3D%3D%3D%20'user').at(-1)%3F.content%20%3F%3F%20'')%5Cn%5Cn%20%20if%20(text.includes('%E5%A4%B1%E8%B4%A5'))%20%7B%5Cn%20%20%20%20const%20error%20%3D%20new%20Error(%5Cn%20%20%20%20%20%20'%E6%A8%A1%E6%8B%9F%E6%A8%A1%E5%9E%8B%E6%9C%8D%E5%8A%A1%E4%B8%8D%E5%8F%AF%E7%94%A8%E3%80%82%E9%94%99%E8%AF%AF%E8%AF%A6%E6%83%85%E5%B1%9E%E4%BA%8E%E8%BF%99%E6%9D%A1%20assistant%20%E6%B6%88%E6%81%AF%EF%BC%9B%E5%8C%85%E5%90%AB%E8%BE%83%E9%95%BF%E6%A0%87%E8%AF%86%20demo-request-abcdefghijklmnopqrstuvwxyz-0123456789%20%E4%BB%A5%E4%BE%BF%E6%A3%80%E6%9F%A5%E7%AA%84%E5%AE%B9%E5%99%A8%E6%8D%A2%E8%A1%8C%E3%80%82'%2C%5Cn%20%20%20%20)%5Cn%20%20%20%20Object.assign(error%2C%20%7B%20code%3A%20'DEMO_UNAVAILABLE'%20%7D)%5Cn%20%20%20%20throw%20error%5Cn%20%20%7D%5Cn%5Cn%20%20responseIndex%20%2B%3D%201%5Cn%20%20return%20%7B%5Cn%20%20%20%20id%3A%20%60runtime-error-demo-%24%7BresponseIndex%7D%60%2C%5Cn%20%20%20%20object%3A%20'chat.completion'%2C%5Cn%20%20%20%20created%3A%20responseIndex%2C%5Cn%20%20%20%20model%3A%20'local-demo'%2C%5Cn%20%20%20%20system_fingerprint%3A%20null%2C%5Cn%20%20%20%20choices%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20%20%20message%3A%20%7B%20role%3A%20'assistant'%2C%20content%3A%20%60%E8%AF%B7%E6%B1%82%E5%B7%B2%E6%81%A2%E5%A4%8D%EF%BC%9A%24%7Btext%20%7C%7C%20'%E6%88%90%E5%8A%9F%E6%B6%88%E6%81%AF'%7D%60%20%7D%2C%5Cn%20%20%20%20%20%20%20%20delta%3A%20undefined%2C%5Cn%20%20%20%20%20%20%20%20logprobs%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20finish_reason%3A%20'stop'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20runtime%20%3D%20useChatRuntime(%7B%5Cn%20%20conversation%3A%20%7B%20storage%3A%20memoryStorage%2C%20useMessageOptions%3A%20%7B%20responseProvider%20%7D%20%7D%2C%5Cn%7D)%5Cnconst%20actionStatus%20%3D%20shallowRef('%E5%B0%9A%E6%9C%AA%E6%94%B6%E5%88%B0%E5%8A%A8%E4%BD%9C%E5%A4%B1%E8%B4%A5%E9%80%9A%E7%9F%A5')%5Cn%5Cnfunction%20handleRuntimeActionError(payload%3A%20ChatRuntimeActionErrorPayload)%20%7B%5Cn%20%20actionStatus.value%20%3D%20%60%E5%B7%B2%E6%94%B6%E5%88%B0%20%24%7Bpayload.action%7D%20%E5%8A%A8%E4%BD%9C%E5%A4%B1%E8%B4%A5%E9%80%9A%E7%9F%A5%EF%BC%9B%E9%94%99%E8%AF%AF%E8%AF%A6%E6%83%85%E4%BB%8D%E7%94%B1%E6%89%80%E5%B1%9E%E6%B6%88%E6%81%AF%E6%B0%94%E6%B3%A1%E5%B1%95%E7%A4%BA%E3%80%82%60%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22runtime-error-demo%5C%22%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22runtime-error-demo__hint%5C%22%3E%5Cn%20%20%20%20%20%20%E8%BE%93%E5%85%A5%E5%8C%85%E5%90%AB%E2%80%9C%E5%A4%B1%E8%B4%A5%E2%80%9D%E7%9A%84%E5%86%85%E5%AE%B9%E4%BC%9A%E8%A7%A6%E5%8F%91%E7%A1%AE%E5%AE%9A%E6%80%A7%E9%94%99%E8%AF%AF%EF%BC%9B%E9%9A%8F%E5%90%8E%E8%BE%93%E5%85%A5%E5%85%B6%E4%BB%96%E5%86%85%E5%AE%B9%E5%8D%B3%E5%8F%AF%E7%BB%A7%E7%BB%AD%E5%8F%91%E9%80%81%E5%B9%B6%E8%A7%82%E5%AF%9F%E6%81%A2%E5%A4%8D%E7%BB%93%E6%9E%9C%E3%80%82%5Cn%20%20%20%20%3C%2Fp%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22runtime-error-demo__status%5C%22%20aria-live%3D%5C%22polite%5C%22%3E%7B%7B%20actionStatus%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22runtime-error-demo__chat%5C%22%3E%5Cn%20%20%20%20%20%20%3Ctr-chat%20%3Aruntime%3D%5C%22runtime%5C%22%20%40runtime-action-error%3D%5C%22handleRuntimeActionError%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.runtime-error-demo%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.runtime-error-demo__hint%2C%5Cn.runtime-error-demo__status%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20overflow-wrap%3A%20anywhere%3B%5Cn%7D%5Cn%5Cn.runtime-error-demo__hint%20%7B%5Cn%20%20color%3A%20var(--tr-text-primary%2C%20%23252b3a)%3B%5Cn%7D%5Cn%5Cn.runtime-error-demo__status%20%7B%5Cn%20%20color%3A%20var(--tr-text-secondary%2C%20%23575d6c)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.runtime-error-demo__chat%20%7B%5Cn%20%20box-sizing%3A%20border-box%3B%5Cn%20%20width%3A%20min(100%25%2C%20720px)%3B%5Cn%20%20height%3A%20min(620px%2C%20calc(100vh%20-%20280px))%3B%5Cn%20%20min-height%3A%20480px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.runtime-error-demo__chat%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%5Cn.runtime-error-demo__chat%20%3Adeep(.tr-welcome__title-wrapper)%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%7D%5Cn%5Cn%40media%20(max-width%3A%20640px)%20%7B%5Cn%20%20.runtime-error-demo__chat%20%7B%5Cn%20%20%20%20height%3A%20560px%3B%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[2]||(e[2]=()=>{s.value=!1}),vueCode:n(F)},k({_:2},[d.value?{name:"vue",fn:a(()=>[t(n(d))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[6]||(e[6]=o("",38))])}}});export{S as __pageData,w as default};
