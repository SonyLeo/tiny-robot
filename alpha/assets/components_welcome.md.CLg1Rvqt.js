const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/footer.D8c0QF5B.js","assets/chunks/theme.CQ8ou-j-.js","assets/chunks/framework.Cb9btYwH.js","assets/chunks/align.CzgCec6o.js","assets/chunks/basic.BEj2l_L6.js"])))=>i.map(i=>d[i]);
import{D as p,v as m,V as h,p as g,C as w,c as T,o as k,a2 as W,af as f,G as t,j as o,ag as y,k as a,w as i,ai as b,a as r}from"./chunks/framework.Cb9btYwH.js";import{R as v,k as _}from"./chunks/index.DK90pyj8.js";const x=`<template>
  <tr-welcome title="盘古助手" description="您好，我是盘古助手，您专属的华为云专家" :icon="icon">
    <template #footer>
      <div class="welcome-footer">
        <span>根据相关法律法规要求，您需要先<a>登录</a>，若没有帐号，您可前往<a>注册</a></span>
      </div>
    </template>
  </tr-welcome>
</template>

<script setup lang="tsx">
import { TrWelcome } from '@opentiny/tiny-robot'
import { CSSProperties, h } from 'vue'

const icon = h('span', { style: { fontSize: '56px', lineHeight: '64px' } as CSSProperties }, '🤖')
<\/script>

<style lang="less" scoped>
.welcome-footer {
  margin-top: 12px;
  color: rgb(128, 128, 128);
  font-size: 12px;
  line-height: 20px;
}
</style>
`,S=`<template>
  <tr-welcome
    title="盘古助手"
    description="您好，我是盘古助手，您专属的华为云专家"
    :icon="icon"
    :align="align"
  ></tr-welcome>
  <hr />
  <div style="display: flex; align-items: center">
    <label>对齐方向：</label>
    <tiny-radio-group v-model="align">
      <tiny-radio label="left">left</tiny-radio>
      <tiny-radio label="center">center</tiny-radio>
      <tiny-radio label="right">right</tiny-radio>
    </tiny-radio-group>
  </div>
</template>

<script setup lang="ts">
import { TrWelcome } from '@opentiny/tiny-robot'
import { TinyRadio, TinyRadioGroup } from '@opentiny/vue'
import { CSSProperties, h, ref } from 'vue'

const icon = h('span', { style: { fontSize: '56px', lineHeight: '64px' } as CSSProperties }, '🤖')

const align = ref('left')
<\/script>
`,Z=`<template>
  <tr-welcome title="盘古助手2" description="您好，我是盘古助手，您专属的华为云专家" :icon="icon"></tr-welcome>
</template>

<script setup lang="tsx">
import { TrWelcome } from '@opentiny/tiny-robot'
import { CSSProperties, h } from 'vue'

const icon = h('span', { style: { fontSize: '56px', lineHeight: '64px' } as CSSProperties }, '🤖')
<\/script>
`,B=JSON.parse('{"title":"Welcome","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/welcome.md","filePath":"components/welcome.md"}'),C={name:"components/welcome.md"},L=Object.assign(C,{setup(A){const d=p();m(async()=>{d.value=(await h(async()=>{const{default:l}=await import("./chunks/footer.D8c0QF5B.js");return{default:l}},__vite__mapDeps([0,1,2]))).default});const s=p();m(async()=>{s.value=(await h(async()=>{const{default:l}=await import("./chunks/align.CzgCec6o.js");return{default:l}},__vite__mapDeps([3,1,2]))).default});const n=g(!0),c=p();return m(async()=>{c.value=(await h(async()=>{const{default:l}=await import("./chunks/basic.BEj2l_L6.js");return{default:l}},__vite__mapDeps([4,1,2]))).default}),(l,e)=>{const u=w("ClientOnly");return k(),T("div",null,[e[3]||(e[3]=W('<h1 id="welcome" tabindex="-1">Welcome <a class="header-anchor" href="#welcome" aria-label="Permalink to &quot;Welcome&quot;">​</a></h1><p>Welcome 是一个用于展示欢迎信息的通用组件，包含标题、描述、图标等内容。 组件支持自定义对齐方向、图标、底部内容等功能。</p><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="基本" tabindex="-1">基本 <a class="header-anchor" href="#基本" aria-label="Permalink to &quot;基本&quot;">​</a></h3><p>基础用法</p>',5)),f(t(a(v),null,null,512),[[y,n.value]]),t(u,null,{default:i(()=>[t(a(_),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:e[0]||(e[0]=()=>{n.value=!1}),vueCode:a(Z)},b({_:2},[c.value?{name:"vue",fn:i(()=>[t(a(c))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[4]||(e[4]=o("h3",{id:"对齐方向",tabindex:"-1"},[r("对齐方向 "),o("a",{class:"header-anchor",href:"#对齐方向","aria-label":'Permalink to "对齐方向"'},"​")],-1)),e[5]||(e[5]=o("p",null,[r("通过 "),o("code",null,"align"),r(" 属性设置对齐方向")],-1)),f(t(a(v),null,null,512),[[y,n.value]]),t(u,null,{default:i(()=>[t(a(_),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:e[1]||(e[1]=()=>{n.value=!1}),vueCode:a(S)},b({_:2},[s.value?{name:"vue",fn:i(()=>[t(a(s))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[6]||(e[6]=o("h3",{id:"底部内容",tabindex:"-1"},[r("底部内容 "),o("a",{class:"header-anchor",href:"#底部内容","aria-label":'Permalink to "底部内容"'},"​")],-1)),e[7]||(e[7]=o("p",null,[r("使用 "),o("code",null,"footer"),r(" 插槽，给 Welcome 底部添加内容")],-1)),f(t(a(v),null,null,512),[[y,n.value]]),t(u,null,{default:i(()=>[t(a(_),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:e[2]||(e[2]=()=>{n.value=!1}),vueCode:a(x)},b({_:2},[d.value?{name:"vue",fn:i(()=>[t(a(d))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[8]||(e[8]=W('<h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><h3 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性名</th><th>类型</th><th>必填</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>title</code></td><td><code>string</code></td><td>✅</td><td>—</td><td>标题</td></tr><tr><td><code>description</code></td><td><code>string</code></td><td>✅</td><td>—</td><td>标题描述</td></tr><tr><td><code>align</code></td><td><code>&#39;left&#39; | &#39;center&#39; | &#39;right&#39;</code></td><td>❌</td><td><code>&#39;center&#39;</code></td><td>内容对齐方式</td></tr><tr><td><code>icon</code></td><td><code>VNode</code></td><td>❌</td><td>—</td><td>自定义图标节点，支持 Vue 组件或 JSX</td></tr></tbody></table><h3 id="插槽" tabindex="-1">插槽 <a class="header-anchor" href="#插槽" aria-label="Permalink to &quot;插槽&quot;">​</a></h3><table tabindex="0"><thead><tr><th>插槽</th><th>必填</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>footer</code></td><td>❌</td><td>—</td><td>组件底部内容插槽</td></tr></tbody></table>',5))])}}});export{B as __pageData,L as default};
