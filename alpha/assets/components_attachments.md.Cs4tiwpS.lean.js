const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/custom-file-type.BluD_6-2.js","assets/chunks/theme.C_-hLVRq.js","assets/chunks/framework.CdlzW3Za.js","assets/chunks/custom-icon.e-4s4-mv.js","assets/chunks/download.DOqOkIdZ.js","assets/chunks/wrap.DQlGPjIq.js","assets/chunks/picture-list.DxK0sYGN.js","assets/chunks/status.Cy3Wm-IB.js","assets/chunks/basic.2Qj2Xht1.js"])))=>i.map(i=>d[i]);
import{D as r,v as h,V as p,p as B,C as E,c as C,o as _,j as s,af as c,G as e,a2 as f,a as d,ag as u,k as n,w as l,ai as k}from"./chunks/framework.CdlzW3Za.js";import{L as m,N as y}from"./chunks/index.nUIVzG0Y.js";const T=`<template>
  <div class="demo-container">
    <div class="demo-section">
      <h4>支持自定义文件类型（txt、md、json）</h4>
      <tr-attachments v-model:items="customFiles" :file-matchers="fileMatchers" wrap />

      <h4>添加自定义文件类型</h4>
      <input type="file" @change="handleFileChange" accept=".txt,.md,.json" style="margin-bottom: 16px" />
      <p>选择 .txt、.md 或 .json 文件来测试自定义匹配器</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { TrAttachments } from '@opentiny/tiny-robot'
import type { Attachment, FileTypeMatcher } from '@opentiny/tiny-robot'

// 自定义图标组件
const TextIcon = h('div', { style: { color: '#52c41a', fontSize: '20px' } }, '📄')
const MDIcon = h('div', { style: { color: '#1890ff', fontSize: '20px' } }, '📝')
const JsonIcon = h('div', { style: { color: '#fa8c16', fontSize: '20px' } }, '📊')

// 自定义文件类型匹配器
const fileMatchers: FileTypeMatcher[] = [
  {
    type: 'txt',
    matcher: (file: File | string) => {
      if (typeof file !== 'string') {
        return file.type === 'text/plain' || file.name.endsWith('.txt')
      }
      return file.toLowerCase().endsWith('.txt')
    },
    icon: TextIcon,
  },
  {
    type: 'md',
    matcher: (file: File | string) => {
      if (typeof file !== 'string') {
        return file.name.endsWith('.md') || file.name.endsWith('.markdown')
      }
      return file.toLowerCase().endsWith('.md') || file.toLowerCase().endsWith('.markdown')
    },
    icon: MDIcon,
  },
  {
    type: 'json',
    matcher: (file: File | string) => {
      if (typeof file !== 'string') {
        return file.type === 'application/json' || file.name.endsWith('.json')
      }
      return file.toLowerCase().endsWith('.json')
    },
    icon: JsonIcon,
  },
]

// 自定义文件类型示例
const customFiles = ref<Attachment[]>([
  {
    id: '1',
    name: 'README.md',
    fileType: 'md',
    size: 1024 * 2, // 2KB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/book.md',
    status: 'success',
  },
  {
    id: '2',
    name: 'config.json',
    fileType: 'json',
    size: 1024 * 1.5, // 1.5KB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/book.json',
    status: 'success',
  },
  {
    id: '3',
    name: 'notes.txt',
    fileType: 'txt',
    size: 1024 * 3, // 3KB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/book.txt',
    status: 'success',
  },
])

// 处理文件选择
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (files && files.length > 0) {
    const file = files[0]

    customFiles.value.push({ rawFile: file })
  }

  // 清空输入框
  target.value = ''
}
<\/script>

<style scoped>
.demo-container {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.demo-section {
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
}

.demo-section h4 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
}
</style>
`,x=`<template>
  <tr-attachments v-model:items="items" :file-icons="fileIcons" />
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import type { Component } from 'vue'
import { TrAttachments } from '@opentiny/tiny-robot'
import type { Attachment, FileType } from '@opentiny/tiny-robot'

const fileIcons: Record<FileType, Component> = {
  word: h('span', '📄'),
  excel: h('span', '🐼'),
}

const items = ref<Attachment[]>([
  {
    url: 'https://www.demo.com/文档.docx',
    size: 12345,
  },
  {
    url: 'https://www.demo.com/表格.xlsx',
    size: 24576,
  },
])
<\/script>
`,W=`<template>
  <div class="demo-container">
    <div class="demo-container-body">
      <h3>自定义下载逻辑</h3>
      <p>使用默认下载行为，请使用 @download</p>
      <p>如果需要完全自定义下载逻辑，使用 @download.prevent 阻止默认行为</p>

      <h5>网络文件自定义下载</h5>
      <TrAttachments v-model:items="networkAttachments" variant="card" @download.prevent="handleCustomDownload" />
      <h5>本地文件自定义下载, 上传本地文件后展示</h5>
      <TrAttachments v-model:items="localAttachments" variant="card" @download.prevent="handleCustomDownload" />

      <div class="demo-section">
        <h4>添加本地文件</h4>
        <input type="file" @change="handleFileChange" accept="*" style="margin-bottom: 16px" />
        <p>选择文件来测试本地文件下载</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { type Attachment, TrAttachments } from '@opentiny/tiny-robot'

// 网络文件示例
const networkAttachments = ref<Attachment[]>([
  {
    id: '1',
    name: 'fruit-image-1.jpg',
    size: 1024 * 1024 * 3.5, // 3.5MB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
    fileType: 'image',
    status: 'success',
  },
  {
    id: '2',
    name: 'fruit-image-2.jpg',
    size: 1024 * 1024 * 3.5, // 3.5MB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
    fileType: 'image',
    status: 'success',
  },
])

// 本地文件示例
const localAttachments = ref<Attachment[]>([])

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (files && files.length > 0) {
    const file = files[0]

    localAttachments.value.push({
      rawFile: file,
      url: URL.createObjectURL(file),
    })

    target.value = ''
  }
}

// 处理自定义下载逻辑
const handleCustomDownload = (event: MouseEvent, file: Attachment) => {
  console.log('自定义下载逻辑:', event, file)

  // 这里实现完全自定义的下载逻辑
  alert(\`自定义下载文件: \${file.name}\`)
}
<\/script>

<style scoped lang="scss"></style>
`,Z=`<template>
  <div>
    <div style="margin-bottom: 16px">
      <tiny-radio-group v-model="wrap">
        <tiny-radio :label="false">no-wrap</tiny-radio>
        <tiny-radio :label="true">wrap</tiny-radio>
      </tiny-radio-group>
    </div>

    <tr-attachments v-model:items="files" :wrap="wrap" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrAttachments } from '@opentiny/tiny-robot'
import type { Attachment } from '@opentiny/tiny-robot'

const wrap = ref(false)

const files = ref<Attachment[]>([
  {
    id: '0',
    name: '示例文档.docx',
    status: 'success',
    size: 200,
    fileType: 'word',
    url: '/path/to/preview.docx',
  },
  {
    id: '1',
    name: '示例文档.pdf',
    status: 'success',
    size: 200,
    fileType: 'pdf',
    url: '/path/to/preview.pdf',
  },
  {
    id: '2',
    name: '示例文档.ppt',
    status: 'success',
    size: 200 * 1024,
    fileType: 'ppt',
    url: '/path/to/preview.ppt',
  },
  {
    id: '3',
    name: '示例文档.xlsx',
    status: 'success',
    size: 200,
    fileType: 'excel',
    url: '/path/to/preview.xlsx',
  },
  {
    id: '4',
    name: '示例文档',
    status: 'success',
    size: 200,
    fileType: 'folder',
    url: '/path/to/preview',
  },
])
<\/script>
`,X=`<template>
  <div style="display: flex; flex-direction: column; gap: 10px">
    <div>
      <h4>状态展示</h4>
      <p>图片卡片会根据状态自动显示不同的视觉效果。</p>
    </div>
    <tr-attachments v-model:items="pictureStatusFiles" variant="picture" />

    <div>
      <h4>上传超时文本</h4>
      <p>设置 <code>message</code> 可显示上传超时文本。</p>
    </div>
    <tr-attachments v-model:items="pictureTimeoutFiles" variant="picture" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrAttachments } from '@opentiny/tiny-robot'
import type { Attachment } from '@opentiny/tiny-robot'

const pictureStatusFiles = ref<Attachment[]>([
  {
    status: 'success',
    size: 1024 * 1024 * 3.5,
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
  },
  {
    status: 'uploading',
    size: 1024 * 1024 * 3.5,
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/book.jpg',
  },
  {
    status: 'error',
    size: 1024 * 1024 * 3.5,
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.png',
  },
])

const pictureTimeoutFiles = ref<Attachment[]>([
  {
    status: 'uploading',
    message: '努力中...',
    size: 1024 * 1024 * 3.5,
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
  },
])
<\/script>
`,L=`<template>
  <div class="demo-container">
    <div class="demo-section">
      <h4 style="margin: 10px 0">状态展示</h4>

      <tr-attachments v-model:items="statusFiles" variant="card" wrap />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrAttachments } from '@opentiny/tiny-robot'
import type { Attachment } from '@opentiny/tiny-robot'

const statusFiles = ref<Attachment[]>([
  {
    size: 1024 * 1024 * 3.5, // 3.5MB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
    status: 'success',
  },

  {
    size: 1024 * 1024 * 3.5, // 3.5MB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/设计2.jpg',
    status: 'uploading',
  },

  {
    size: 1024 * 1024 * 3.5, // 3.5MB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/设计3.jpg',
    status: 'error',
  },
])
<\/script>
`,R=`<template>
  <div class="demo-container">
    <div class="demo-section">
      <h4>文件列表</h4>
      <tr-attachments v-model:items="basicFiles" variant="card" />
    </div>
    <div class="demo-section">
      <h4>图片列表</h4>
      <tr-attachments v-model:items="basicFiles" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrAttachments } from '@opentiny/tiny-robot'
import type { Attachment } from '@opentiny/tiny-robot'

// 基本示例 - 显示文件类型和大小
const basicFiles = ref<Attachment[]>([
  {
    size: 1024 * 1024 * 3.5, // 3.5MB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
  },
  {
    size: 1024 * 1024 * 3.5, // 3.5MB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/book.jpg',
  },
  {
    size: 1024 * 1024 * 3.5, // 3.5MB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
  },
])
<\/script>
`,M=JSON.parse('{"title":"Attachments 附件卡片","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/attachments.md","filePath":"components/attachments.md"}'),j={name:"components/attachments.md"},S=Object.assign(j,{setup(q){const g=r();h(async()=>{g.value=(await p(async()=>{const{default:a}=await import("./chunks/custom-file-type.BluD_6-2.js");return{default:a}},__vite__mapDeps([0,1,2]))).default});const v=r();h(async()=>{v.value=(await p(async()=>{const{default:a}=await import("./chunks/custom-icon.e-4s4-mv.js");return{default:a}},__vite__mapDeps([3,1,2]))).default});const b=r();h(async()=>{b.value=(await p(async()=>{const{default:a}=await import("./chunks/download.DOqOkIdZ.js");return{default:a}},__vite__mapDeps([4,2,1]))).default});const A=r();h(async()=>{A.value=(await p(async()=>{const{default:a}=await import("./chunks/wrap.DQlGPjIq.js");return{default:a}},__vite__mapDeps([5,1,2]))).default});const F=r();h(async()=>{F.value=(await p(async()=>{const{default:a}=await import("./chunks/picture-list.DxK0sYGN.js");return{default:a}},__vite__mapDeps([6,1,2]))).default});const w=r();h(async()=>{w.value=(await p(async()=>{const{default:a}=await import("./chunks/status.Cy3Wm-IB.js");return{default:a}},__vite__mapDeps([7,1,2]))).default});const i=B(!0),D=r();return h(async()=>{D.value=(await p(async()=>{const{default:a}=await import("./chunks/basic.2Qj2Xht1.js");return{default:a}},__vite__mapDeps([8,1,2]))).default}),(a,t)=>{const o=E("ClientOnly");return _(),C("div",null,[t[7]||(t[7]=s("h1",{id:"attachments-附件卡片",tabindex:"-1"},[d("Attachments 附件卡片 "),s("a",{class:"header-anchor",href:"#attachments-附件卡片","aria-label":'Permalink to "Attachments 附件卡片"'},"​")],-1)),t[8]||(t[8]=s("p",null,"Attachments 组件用于展示文件列表，并支持图片预览、文件下载、状态显示等一系列交互功能。",-1)),t[9]||(t[9]=s("h2",{id:"代码示例",tabindex:"-1"},[d("代码示例 "),s("a",{class:"header-anchor",href:"#代码示例","aria-label":'Permalink to "代码示例"'},"​")],-1)),t[10]||(t[10]=s("p",null,[d("最基本的用法是使用 "),s("code",null,"v-model:items"),d(" 绑定一个附件列表数组。")],-1)),c(e(n(m),null,null,512),[[u,i.value]]),e(o,null,{default:l(()=>[e(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{i.value=!1}),vueCode:n(R)},k({_:2},[D.value?{name:"vue",fn:l(()=>[e(n(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[11]||(t[11]=f("",7)),c(e(n(m),null,null,512),[[u,i.value]]),e(o,null,{default:l(()=>[e(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[1]||(t[1]=()=>{i.value=!1}),vueCode:n(L)},k({_:2},[w.value?{name:"vue",fn:l(()=>[e(n(w))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[12]||(t[12]=s("p",null,"图片列表同样支持状态展示：",-1)),c(e(n(m),null,null,512),[[u,i.value]]),e(o,null,{default:l(()=>[e(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[2]||(t[2]=()=>{i.value=!1}),vueCode:n(X)},k({_:2},[F.value?{name:"vue",fn:l(()=>[e(n(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[13]||(t[13]=s("h3",{id:"列表换行",tabindex:"-1"},[d("列表换行 "),s("a",{class:"header-anchor",href:"#列表换行","aria-label":'Permalink to "列表换行"'},"​")],-1)),t[14]||(t[14]=s("p",null,[d("通过设置 "),s("code",null,"wrap"),d(" 属性，可以控制文件列表是否在达到容器宽度时自动换行。")],-1)),c(e(n(m),null,null,512),[[u,i.value]]),e(o,null,{default:l(()=>[e(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[3]||(t[3]=()=>{i.value=!1}),vueCode:n(Z)},k({_:2},[A.value?{name:"vue",fn:l(()=>[e(n(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[15]||(t[15]=f("",4)),c(e(n(m),null,null,512),[[u,i.value]]),e(o,null,{default:l(()=>[e(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[4]||(t[4]=()=>{i.value=!1}),vueCode:n(W)},k({_:2},[b.value?{name:"vue",fn:l(()=>[e(n(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[16]||(t[16]=f("",5)),c(e(n(m),null,null,512),[[u,i.value]]),e(o,null,{default:l(()=>[e(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[5]||(t[5]=()=>{i.value=!1}),vueCode:n(x)},k({_:2},[v.value?{name:"vue",fn:l(()=>[e(n(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[17]||(t[17]=s("h3",{id:"自定义文件类型-filematchers",tabindex:"-1"},[d("自定义文件类型 (fileMatchers) "),s("a",{class:"header-anchor",href:"#自定义文件类型-filematchers","aria-label":'Permalink to "自定义文件类型 (fileMatchers)"'},"​")],-1)),t[18]||(t[18]=s("p",null,[d("当内置的文件类型不满足需求时，可以通过 "),s("code",null,"fileMatchers"),d(" 属性定义新的文件类型、匹配逻辑和专属图标。这在需要支持特殊格式或业务特定文件时非常有用。")],-1)),c(e(n(m),null,null,512),[[u,i.value]]),e(o,null,{default:l(()=>[e(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[6]||(t[6]=()=>{i.value=!1}),vueCode:n(T)},k({_:2},[g.value?{name:"vue",fn:l(()=>[e(n(g))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[19]||(t[19]=f("",18))])}}});export{M as __pageData,S as default};
