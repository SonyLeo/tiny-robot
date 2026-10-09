const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/runtime-adapter.ChMWBvpu.js","assets/chunks/index.pu6DNDM2.js","assets/chunks/framework.BnMBnixn.js","assets/chunks/index.B4cAQlUF.js","assets/chunks/theme.DHvcpk4G.js","assets/chunks/runtime-send.3hhFfafm.js"])))=>i.map(i=>d[i]);
import{aD as h,bQ as c,aZ as m,aL as y,v,H as r,bL as p,bB as k,J as e,bk as s,bJ as n,G as E,b7 as C,aU as b}from"./chunks/framework.BnMBnixn.js";import{L as g,N as u}from"./chunks/index.CdcfJ4CB.js";const F=`<script setup lang="ts">
import { shallowRef } from 'vue'
import { useConversation } from '@opentiny/tiny-robot-kit'
import type { ChatMessage, ConversationStorageStrategy, ResponseProvider } from '@opentiny/tiny-robot-kit'
import {
  TrChatUI,
  useChatRuntimeAdapter,
  useChatRuntimeFromConversation,
  type ChatHistoryActionPayload,
} from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

const messagesByConversation = new Map<string, ChatMessage[]>()

const memoryStorage: ConversationStorageStrategy = {
  loadConversations: () => [],
  loadMessages: (conversationId) => [...(messagesByConversation.get(conversationId) ?? [])],
  saveConversation: () => undefined,
  saveMessages: (conversationId, messages) => {
    messagesByConversation.set(conversationId, [...messages])
  },
  deleteConversation: (conversationId) => {
    messagesByConversation.delete(conversationId)
  },
}

let responseIndex = 0

const responseProvider: ResponseProvider = async (requestBody) => {
  const text = String(requestBody.messages.filter((message) => message.role === 'user').at(-1)?.content ?? '')
  responseIndex += 1

  return {
    id: \`runtime-adapter-demo-\${responseIndex}\`,
    object: 'chat.completion',
    created: responseIndex,
    model: 'local-demo',
    system_fingerprint: null,
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content: \`Runtime 已收到：\${text}\` },
        delta: undefined,
        logprobs: null,
        finish_reason: 'stop',
      },
    ],
  }
}

const conversation = useConversation({
  storage: memoryStorage,
  autoSaveMessages: true,
  useMessageOptions: { responseProvider },
})
const runtime = useChatRuntimeFromConversation({ conversation })
const actionStatus = shallowRef('动作状态：正常')
const adapter = useChatRuntimeAdapter({
  runtime,
  onActionError({ action }) {
    actionStatus.value = \`动作失败：\${action}\`
  },
})

function handleHistoryAction(payload: ChatHistoryActionPayload) {
  if (payload.action.id === 'delete' && !payload.defaultPrevented) {
    adapter.deleteConversation(payload.conversation.id)
  }
}
<\/script>

<template>
  <section class="runtime-adapter-demo">
    <p class="runtime-adapter-demo__status" aria-live="polite">{{ actionStatus }}</p>
    <div class="runtime-adapter-demo__chat">
      <TrChatUI
        :data="adapter.data.value"
        :input-value="adapter.inputValue.value"
        @update:input-value="adapter.setInputValue"
        @submit="adapter.send"
        @cancel="adapter.abort"
        @clear="() => adapter.setInputValue('')"
        @create-conversation="adapter.clearActiveConversation"
        @switch-conversation="({ conversationId }) => adapter.switchConversation(conversationId)"
        @rename-conversation="({ conversationId, title }) => adapter.renameConversation(conversationId, title)"
        @history-action="handleHistoryAction"
      />
    </div>
  </section>
</template>

<style scoped>
.runtime-adapter-demo {
  --tr-layout-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.runtime-adapter-demo__status {
  margin: 0;
  color: var(--tr-text-secondary, #575d6c);
  font-size: 13px;
  overflow-wrap: anywhere;
}

.runtime-adapter-demo__chat {
  box-sizing: border-box;
  width: min(100%, 720px);
  height: min(620px, calc(100vh - 280px));
  min-height: 480px;
  min-width: 0;
}

.runtime-adapter-demo__chat :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}

.runtime-adapter-demo__chat :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 640px) {
  .runtime-adapter-demo__chat {
    height: 560px;
  }
}
</style>
`,f=`<script setup lang="ts">
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
`,P=JSON.parse('{"title":"Chat 配置与操作","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"suites/chat-runtime.md","filePath":"suites/chat-runtime.md"}'),B={name:"suites/chat-runtime.md"},x=Object.assign(B,{setup(A){const d=C();h(async()=>{d.value=(await c(async()=>{const{default:a}=await import("./chunks/runtime-adapter.ChMWBvpu.js");return{default:a}},__vite__mapDeps([0,1,2,3,4]))).default});const i=b(!0),o=C();return h(async()=>{o.value=(await c(async()=>{const{default:a}=await import("./chunks/runtime-send.3hhFfafm.js");return{default:a}},__vite__mapDeps([5,1,2,3,4]))).default}),(a,t)=>{const l=m("ClientOnly");return y(),v("div",null,[t[2]||(t[2]=r("",94)),p(e(s(g),null,null,512),[[k,i.value]]),e(l,null,{default:n(()=>[e(s(u),{title:"默认发送与自定义发送",description:"比较两种发送方式对空文本的处理。示例仅展示这一差异，不包含实际请求和消息保存。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22runtime-send.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fruntime-send.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%20useConversation%2C%20type%20ResponseProvider%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20useChatRuntimeFromConversation%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cn%5Cnconst%20defaultResult%20%3D%20shallowRef('%E5%B0%9A%E6%9C%AA%E5%8F%91%E9%80%81')%5Cnconst%20customResult%20%3D%20shallowRef('%E5%B0%9A%E6%9C%AA%E5%8F%91%E9%80%81')%5Cnconst%20responseProvider%3A%20ResponseProvider%20%3D%20async%20()%20%3D%3E%20(%7B%5Cn%20%20id%3A%20'runtime-send-demo'%2C%5Cn%20%20object%3A%20'chat.completion'%2C%5Cn%20%20created%3A%200%2C%5Cn%20%20model%3A%20'runtime-send-demo'%2C%5Cn%20%20system_fingerprint%3A%20null%2C%5Cn%20%20choices%3A%20%5B%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20message%3A%20%7B%20role%3A%20'assistant'%2C%20content%3A%20''%20%7D%2C%5Cn%20%20%20%20%20%20delta%3A%20undefined%2C%5Cn%20%20%20%20%20%20logprobs%3A%20null%2C%5Cn%20%20%20%20%20%20finish_reason%3A%20'stop'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%5D%2C%5Cn%7D)%5Cn%5Cnfunction%20createDemoConversation()%20%7B%5Cn%20%20return%20useConversation(%7B%5Cn%20%20%20%20useMessageOptions%3A%20%7B%20responseProvider%20%7D%2C%5Cn%20%20%7D)%5Cn%7D%5Cn%5Cnconst%20defaultRuntime%20%3D%20useChatRuntimeFromConversation(%7B%20conversation%3A%20createDemoConversation()%20%7D)%5Cnconst%20customRuntime%20%3D%20useChatRuntimeFromConversation(%7B%5Cn%20%20conversation%3A%20createDemoConversation()%2C%5Cn%20%20send%3A%20(%7B%20text%20%7D)%20%3D%3E%20%7B%5Cn%20%20%20%20customResult.value%20%3D%20%60%E8%87%AA%E5%AE%9A%E4%B9%89%20send%20%E6%94%B6%E5%88%B0%20text%3A%20%24%7BJSON.stringify(text)%7D%60%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%5Cnasync%20function%20sendDefaultEmptyText()%20%7B%5Cn%20%20defaultResult.value%20%3D%20String(await%20defaultRuntime.actions.send(%7B%20text%3A%20''%20%7D))%5Cn%7D%5Cn%5Cnasync%20function%20sendCustomEmptyText()%20%7B%5Cn%20%20const%20sent%20%3D%20await%20customRuntime.actions.send(%7B%20text%3A%20''%20%7D)%5Cn%20%20customResult.value%20%3D%20%60%24%7BcustomResult.value%7D%EF%BC%8C%E7%BB%93%E6%9E%9C%3A%20%24%7Bsent%7D%60%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22runtime-send-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22runtime-send-demo__item%5C%22%3E%5Cn%20%20%20%20%20%20%3Ch3%3E%E9%BB%98%E8%AE%A4%E5%8F%91%E9%80%81%3C%2Fh3%3E%5Cn%20%20%20%20%20%20%3Cbutton%20class%3D%5C%22runtime-send-demo__button%5C%22%20type%3D%5C%22button%5C%22%20%40click%3D%5C%22sendDefaultEmptyText%5C%22%3E%E5%8F%91%E9%80%81%E7%A9%BA%E6%96%87%E6%9C%AC%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3Cp%20aria-live%3D%5C%22polite%5C%22%3E%E7%BB%93%E6%9E%9C%EF%BC%9A%7B%7B%20defaultResult%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22runtime-send-demo__item%5C%22%3E%5Cn%20%20%20%20%20%20%3Ch3%3E%E8%87%AA%E5%AE%9A%E4%B9%89%20send%3C%2Fh3%3E%5Cn%20%20%20%20%20%20%3Cbutton%20class%3D%5C%22runtime-send-demo__button%5C%22%20type%3D%5C%22button%5C%22%20%40click%3D%5C%22sendCustomEmptyText%5C%22%3E%E5%8F%91%E9%80%81%E7%A9%BA%E6%96%87%E6%9C%AC%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3Cp%20aria-live%3D%5C%22polite%5C%22%3E%E7%BB%93%E6%9E%9C%EF%BC%9A%7B%7B%20customResult%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.runtime-send-demo%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20grid-template-columns%3A%20repeat(2%2C%20minmax(0%2C%201fr))%3B%5Cn%20%20gap%3A%2016px%3B%5Cn%7D%5Cn%5Cn.runtime-send-demo__item%20%7B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20padding%3A%2016px%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-common-border-color)%3B%5Cn%7D%5Cn%5Cn.runtime-send-demo__button%20%7B%5Cn%20%20display%3A%20inline-flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%20%20min-height%3A%2032px%3B%5Cn%20%20border%3A%201px%20solid%20%232f6fad%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20padding%3A%206px%2012px%3B%5Cn%20%20color%3A%20%23fff%3B%5Cn%20%20background%3A%20%232f6fad%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%20%20font%3A%20inherit%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.runtime-send-demo__button%3Ahover%20%7B%5Cn%20%20border-color%3A%20%2324598d%3B%5Cn%20%20background%3A%20%2324598d%3B%5Cn%7D%5Cn%5Cn.runtime-send-demo__button%3Afocus-visible%20%7B%5Cn%20%20outline%3A%202px%20solid%20%238ab8df%3B%5Cn%20%20outline-offset%3A%202px%3B%5Cn%7D%5Cn%5Cn.runtime-send-demo%20%3Adeep(.tr-welcome__title-wrapper)%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%7D%5Cn%5Cn.runtime-send-demo__item%20h3%2C%5Cn.runtime-send-demo__item%20p%20%7B%5Cn%20%20margin%3A%200%200%2012px%3B%5Cn%7D%5Cn%5Cn%40media%20(max-width%3A%20640px)%20%7B%5Cn%20%20.runtime-send-demo%20%7B%5Cn%20%20%20%20grid-template-columns%3A%201fr%3B%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{i.value=!1}),vueCode:s(f)},E({_:2},[o.value?{name:"vue",fn:n(()=>[e(s(o))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[3]||(t[3]=r("",8)),p(e(s(g),null,null,512),[[k,i.value]]),e(l,null,{default:n(()=>[e(s(u),{title:"在 TrChatUI 中复用 Runtime",description:"使用内存存储和模拟回复，展示输入、发送及会话切换、重命名、删除的绑定方式，无需连接真实服务。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22runtime-adapter.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fruntime-adapter.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%20useConversation%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20type%20%7B%20ChatMessage%2C%20ConversationStorageStrategy%2C%20ResponseProvider%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%5Cn%20%20TrChatUI%2C%5Cn%20%20useChatRuntimeAdapter%2C%5Cn%20%20useChatRuntimeFromConversation%2C%5Cn%20%20type%20ChatHistoryActionPayload%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cn%5Cnconst%20messagesByConversation%20%3D%20new%20Map%3Cstring%2C%20ChatMessage%5B%5D%3E()%5Cn%5Cnconst%20memoryStorage%3A%20ConversationStorageStrategy%20%3D%20%7B%5Cn%20%20loadConversations%3A%20()%20%3D%3E%20%5B%5D%2C%5Cn%20%20loadMessages%3A%20(conversationId)%20%3D%3E%20%5B...(messagesByConversation.get(conversationId)%20%3F%3F%20%5B%5D)%5D%2C%5Cn%20%20saveConversation%3A%20()%20%3D%3E%20undefined%2C%5Cn%20%20saveMessages%3A%20(conversationId%2C%20messages)%20%3D%3E%20%7B%5Cn%20%20%20%20messagesByConversation.set(conversationId%2C%20%5B...messages%5D)%5Cn%20%20%7D%2C%5Cn%20%20deleteConversation%3A%20(conversationId)%20%3D%3E%20%7B%5Cn%20%20%20%20messagesByConversation.delete(conversationId)%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnlet%20responseIndex%20%3D%200%5Cn%5Cnconst%20responseProvider%3A%20ResponseProvider%20%3D%20async%20(requestBody)%20%3D%3E%20%7B%5Cn%20%20const%20text%20%3D%20String(requestBody.messages.filter((message)%20%3D%3E%20message.role%20%3D%3D%3D%20'user').at(-1)%3F.content%20%3F%3F%20'')%5Cn%20%20responseIndex%20%2B%3D%201%5Cn%5Cn%20%20return%20%7B%5Cn%20%20%20%20id%3A%20%60runtime-adapter-demo-%24%7BresponseIndex%7D%60%2C%5Cn%20%20%20%20object%3A%20'chat.completion'%2C%5Cn%20%20%20%20created%3A%20responseIndex%2C%5Cn%20%20%20%20model%3A%20'local-demo'%2C%5Cn%20%20%20%20system_fingerprint%3A%20null%2C%5Cn%20%20%20%20choices%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20%20%20message%3A%20%7B%20role%3A%20'assistant'%2C%20content%3A%20%60Runtime%20%E5%B7%B2%E6%94%B6%E5%88%B0%EF%BC%9A%24%7Btext%7D%60%20%7D%2C%5Cn%20%20%20%20%20%20%20%20delta%3A%20undefined%2C%5Cn%20%20%20%20%20%20%20%20logprobs%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20finish_reason%3A%20'stop'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20conversation%20%3D%20useConversation(%7B%5Cn%20%20storage%3A%20memoryStorage%2C%5Cn%20%20autoSaveMessages%3A%20true%2C%5Cn%20%20useMessageOptions%3A%20%7B%20responseProvider%20%7D%2C%5Cn%7D)%5Cnconst%20runtime%20%3D%20useChatRuntimeFromConversation(%7B%20conversation%20%7D)%5Cnconst%20actionStatus%20%3D%20shallowRef('%E5%8A%A8%E4%BD%9C%E7%8A%B6%E6%80%81%EF%BC%9A%E6%AD%A3%E5%B8%B8')%5Cnconst%20adapter%20%3D%20useChatRuntimeAdapter(%7B%5Cn%20%20runtime%2C%5Cn%20%20onActionError(%7B%20action%20%7D)%20%7B%5Cn%20%20%20%20actionStatus.value%20%3D%20%60%E5%8A%A8%E4%BD%9C%E5%A4%B1%E8%B4%A5%EF%BC%9A%24%7Baction%7D%60%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%5Cnfunction%20handleHistoryAction(payload%3A%20ChatHistoryActionPayload)%20%7B%5Cn%20%20if%20(payload.action.id%20%3D%3D%3D%20'delete'%20%26%26%20!payload.defaultPrevented)%20%7B%5Cn%20%20%20%20adapter.deleteConversation(payload.conversation.id)%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22runtime-adapter-demo%5C%22%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22runtime-adapter-demo__status%5C%22%20aria-live%3D%5C%22polite%5C%22%3E%7B%7B%20actionStatus%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22runtime-adapter-demo__chat%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrChatUI%5Cn%20%20%20%20%20%20%20%20%3Adata%3D%5C%22adapter.data.value%5C%22%5Cn%20%20%20%20%20%20%20%20%3Ainput-value%3D%5C%22adapter.inputValue.value%5C%22%5Cn%20%20%20%20%20%20%20%20%40update%3Ainput-value%3D%5C%22adapter.setInputValue%5C%22%5Cn%20%20%20%20%20%20%20%20%40submit%3D%5C%22adapter.send%5C%22%5Cn%20%20%20%20%20%20%20%20%40cancel%3D%5C%22adapter.abort%5C%22%5Cn%20%20%20%20%20%20%20%20%40clear%3D%5C%22()%20%3D%3E%20adapter.setInputValue('')%5C%22%5Cn%20%20%20%20%20%20%20%20%40create-conversation%3D%5C%22adapter.clearActiveConversation%5C%22%5Cn%20%20%20%20%20%20%20%20%40switch-conversation%3D%5C%22(%7B%20conversationId%20%7D)%20%3D%3E%20adapter.switchConversation(conversationId)%5C%22%5Cn%20%20%20%20%20%20%20%20%40rename-conversation%3D%5C%22(%7B%20conversationId%2C%20title%20%7D)%20%3D%3E%20adapter.renameConversation(conversationId%2C%20title)%5C%22%5Cn%20%20%20%20%20%20%20%20%40history-action%3D%5C%22handleHistoryAction%5C%22%5Cn%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.runtime-adapter-demo%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.runtime-adapter-demo__status%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20color%3A%20var(--tr-text-secondary%2C%20%23575d6c)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20overflow-wrap%3A%20anywhere%3B%5Cn%7D%5Cn%5Cn.runtime-adapter-demo__chat%20%7B%5Cn%20%20box-sizing%3A%20border-box%3B%5Cn%20%20width%3A%20min(100%25%2C%20720px)%3B%5Cn%20%20height%3A%20min(620px%2C%20calc(100vh%20-%20280px))%3B%5Cn%20%20min-height%3A%20480px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.runtime-adapter-demo__chat%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%5Cn.runtime-adapter-demo__chat%20%3Adeep(.tr-welcome__title-wrapper)%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%7D%5Cn%5Cn%40media%20(max-width%3A%20640px)%20%7B%5Cn%20%20.runtime-adapter-demo__chat%20%7B%5Cn%20%20%20%20height%3A%20560px%3B%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[1]||(t[1]=()=>{i.value=!1}),vueCode:s(F)},E({_:2},[d.value?{name:"vue",fn:n(()=>[e(s(d))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[4]||(t[4]=r("",67))])}}});export{P as __pageData,x as default};
