const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/floating.DeSJADiF.js","assets/chunks/theme.TjE0w2ax.js","assets/chunks/framework.DtZ8hpGs.js","assets/chunks/main-scroll.IlClG-HZ.js","assets/chunks/aside-resizable.BAmggAiB.js","assets/chunks/aside-modes.n7jjVhxi.js","assets/chunks/basic.CiabLyJE.js"])))=>i.map(i=>d[i]);
import{aD as i,bQ as c,aZ as _,aL as x,v as A,H as n,bL as s,bB as u,J as e,bk as d,bJ as l,G as p,b7 as h,aU as E}from"./chunks/framework.DtZ8hpGs.js";import{L as m,N as y}from"./chunks/index.Cip4UbMu.js";const D=`<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutDefaultFloatingConfig } from '@opentiny/tiny-robot'

const open = ref(false)

const defaultFloating: LayoutDefaultFloatingConfig = {
  placement: 'top-right',
  offset: 24,
  width: 520,
  height: 360,
  draggable: true,
  resizable: true,
  minWidth: 360,
  maxWidth: 680,
}
<\/script>

<template>
  <div class="layout-floating-demo">
    <button type="button" class="layout-floating-demo__trigger" @click="open = !open">
      {{ open ? '关闭浮层' : '打开浮层' }}
    </button>

    <p class="layout-floating-demo__tip">打开后可直接拖动顶部横条，或拖动 8 个方向手柄调整尺寸。</p>

    <TrLayout v-if="open" class="layout-floating-demo__layout" mode="floating" :default-floating="defaultFloating">
      <template #header>
        <div class="layout-floating-demo__header">
          <strong>浮层布局</strong>
          <button type="button" class="layout-floating-demo__close" @click="open = false">关闭</button>
        </div>
      </template>

      <template #main>
        <div class="layout-floating-demo__main">
          <h3>初始值写法</h3>
          <p>
            这个示例只传 \`defaultFloating\`，首次挂载时按 \`placement + offset\` 初始化，后续位置和尺寸由组件自己维护。
          </p>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style>
.layout-floating-demo__layout {
  --tr-layout-surface-radius: 12px;
}
</style>

<style scoped>
.layout-floating-demo {
  display: grid;
  gap: 8px;
}

.layout-floating-demo__trigger,
.layout-floating-demo__close {
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 8px;
  background: var(--vp-c-bg, #ffffff);
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
  cursor: pointer;
}

.layout-floating-demo__tip {
  margin: 0 0 8px;
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-floating-demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-floating-demo__main {
  padding: 16px;
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-floating-demo__main p {
  margin: 8px 0 0;
  line-height: 1.6;
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}
</style>
`,B=`<script setup lang="ts">
import { computed, ref } from 'vue'
import MainScrollBubble from './main-scroll-bubble.vue'
import MainScrollDiv from './main-scroll-div.vue'

const activeExample = ref<'bubble' | 'div'>('bubble')

const currentExample = computed(() => (activeExample.value === 'bubble' ? MainScrollBubble : MainScrollDiv))
<\/script>

<template>
  <div class="layout-main-scroll-demo">
    <div class="layout-main-scroll-demo__switcher" aria-label="主区滚动示例切换">
      <button
        type="button"
        class="layout-main-scroll-demo__switch"
        :class="{ 'is-active': activeExample === 'bubble' }"
        :aria-pressed="activeExample === 'bubble'"
        @click="activeExample = 'bubble'"
      >
        BubbleList
      </button>

      <button
        type="button"
        class="layout-main-scroll-demo__switch"
        :class="{ 'is-active': activeExample === 'div' }"
        :aria-pressed="activeExample === 'div'"
        @click="activeExample = 'div'"
      >
        普通 div
      </button>
    </div>

    <p class="layout-main-scroll-demo__tip">两种写法都把真实滚动容器传给 \`scrollHost\`，区别只在滚动内容本身是什么。</p>

    <div class="layout-main-scroll-demo__stage">
      <component :is="currentExample" />
    </div>
  </div>
</template>

<style scoped>
.layout-main-scroll-demo {
  display: grid;
  gap: 12px;
}

.layout-main-scroll-demo__switcher {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.layout-main-scroll-demo__switch {
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 8px;
  background: var(--vp-c-bg, #ffffff);
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
  cursor: pointer;
}

.layout-main-scroll-demo__switch.is-active {
  border-color: var(--vp-c-brand-1, var(--tr-color-primary, #5e7ce0));
  color: var(--vp-c-brand-1, var(--tr-color-primary, #5e7ce0));
}

.layout-main-scroll-demo__tip {
  margin: 0;
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-main-scroll-demo__stage {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
  --tr-layout-height: 400px;
}
</style>
`,L=`<script setup lang="ts">
import { TrLayout } from '@opentiny/tiny-robot'
<\/script>

<template>
  <div class="layout-aside-resizable-demo">
    <TrLayout>
      <template #left-aside>
        <TrLayout.Aside
          placement="left"
          default-open
          :default-width="220"
          :min-width="160"
          :max-width="320"
          :resizable="true"
        >
          <div class="layout-aside-resizable-demo__aside">拖动右侧分隔线</div>
        </TrLayout.Aside>
      </template>

      <template #main>
        <div class="layout-aside-resizable-demo__main">当前示例只演示 dock 侧栏宽度调整。</div>
      </template>
    </TrLayout>
  </div>
</template>

<style scoped>
.layout-aside-resizable-demo {
  --tr-layout-height: 100%;
  --tr-layout-content-max-width: none;
  --tr-layout-inner-padding-inline: 0;
  --tr-layout-inner-padding-block: 0;
  --tr-layout-main-min-width: 0;
  --tr-layout-left-bg: var(--vp-c-bg-alt, #f8fafc);
  height: 400px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 16px;
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-aside-resizable-demo__aside,
.layout-aside-resizable-demo__main {
  display: grid;
  place-items: center;
  height: 100%;
}

.layout-aside-resizable-demo__main {
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}
</style>
`,k=`<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'

const rightOpen = ref(false)
<\/script>

<template>
  <div class="layout-aside-demo">
    <TrLayout>
      <template #left-aside>
        <TrLayout.Aside placement="left" default-open :default-width="156" :collapsed-width="56">
          <template #default="{ isOpen }">
            <div v-if="isOpen" class="layout-aside-demo__aside">
              <TrLayout.AsideToggle placement="left" class="layout-aside-demo__chip">收起侧栏</TrLayout.AsideToggle>
              <div class="layout-aside-demo__chip">collapsedWidth: 56px</div>
            </div>
            <div v-else class="layout-aside-demo__rail">
              <TrLayout.AsideToggle placement="left" class="layout-aside-demo__rail-chip">栏</TrLayout.AsideToggle>
              <div class="layout-aside-demo__rail-chip">56</div>
            </div>
          </template>
        </TrLayout.Aside>
      </template>

      <template #header>
        <div class="layout-aside-demo__header">
          <span>侧栏模式</span>
          <button type="button" class="layout-aside-demo__chip" @click="rightOpen = true">打开抽屉</button>
        </div>
      </template>

      <template #main>
        <div class="layout-aside-demo__main">左侧是 \`dock + collapsedWidth\`，右侧是 \`drawer\`。</div>
      </template>

      <template #right-aside>
        <TrLayout.Aside
          placement="right"
          mode="drawer"
          v-model:open="rightOpen"
          class="layout-aside-demo__drawer-panel"
        >
          <div class="layout-aside-demo__drawer">
            <div>Drawer</div>
            <div>点击遮罩、按 \`Esc\` 或按钮关闭。</div>
            <TrLayout.AsideToggle placement="right" class="layout-aside-demo__chip">关闭抽屉</TrLayout.AsideToggle>
          </div>
        </TrLayout.Aside>
      </template>
    </TrLayout>
  </div>
</template>

<style scoped>
.layout-aside-demo {
  --tr-layout-height: 100%;
  --tr-layout-content-max-width: none;
  --tr-layout-inner-padding-inline: 0;
  --tr-layout-inner-padding-block: 0;
  --tr-layout-left-bg: var(--vp-c-bg-alt, #f8fafc);
  height: 400px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 16px;
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-aside-demo__drawer-panel {
  --tr-layout-drawer-width: 240px;
}

.layout-aside-demo__header,
.layout-aside-demo__main,
.layout-aside-demo__drawer {
  background: var(--vp-c-bg, #ffffff);
}

.layout-aside-demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
}

.layout-aside-demo__main,
.layout-aside-demo__aside,
.layout-aside-demo__drawer {
  padding: 16px;
  box-sizing: border-box;
}

.layout-aside-demo__aside,
.layout-aside-demo__drawer,
.layout-aside-demo__rail {
  display: grid;
  gap: 8px;
}

.layout-aside-demo__rail {
  width: 56px;
  padding: 12px 8px;
  box-sizing: border-box;
  justify-items: center;
}

.layout-aside-demo__drawer {
  min-height: 100%;
}

.layout-aside-demo__main,
.layout-aside-demo__drawer {
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-aside-demo__chip,
.layout-aside-demo__rail-chip {
  display: grid;
  place-items: center;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  background: var(--vp-c-bg, #ffffff);
  color: inherit;
}

.layout-aside-demo__chip {
  min-height: 36px;
  padding: 0 12px;
  border-radius: 8px;
}

.layout-aside-demo__rail-chip {
  width: 40px;
  min-height: 40px;
  padding: 0;
  border-radius: 8px;
}
</style>
`,w=`<script setup lang="ts">
import { TrLayout } from '@opentiny/tiny-robot'
<\/script>

<template>
  <div class="layout-basic-demo">
    <TrLayout>
      <template #left-aside>
        <TrLayout.Aside placement="left" default-open :default-width="160">
          <div class="layout-basic-demo__aside">导航</div>
        </TrLayout.Aside>
      </template>

      <template #header>
        <div class="layout-basic-demo__header">Header</div>
      </template>

      <template #main>
        <div class="layout-basic-demo__main">Main</div>
      </template>

      <template #footer>
        <div class="layout-basic-demo__footer">Footer</div>
      </template>

      <template #right-aside>
        <TrLayout.Aside placement="right" default-open :default-width="160">
          <div class="layout-basic-demo__aside">信息栏</div>
        </TrLayout.Aside>
      </template>
    </TrLayout>
  </div>
</template>

<style scoped>
.layout-basic-demo {
  --tr-layout-height: 100%;
  --tr-layout-content-max-width: none;
  --tr-layout-inner-padding-inline: 0;
  --tr-layout-inner-padding-block: 0;
  --tr-layout-main-min-width: 0;
  --tr-layout-header-bg: var(--vp-c-bg-soft, #f6f8fa);
  --tr-layout-main-bg: var(--vp-c-bg, #ffffff);
  --tr-layout-footer-bg: var(--vp-c-bg-soft, #f6f8fa);
  --tr-layout-left-bg: var(--vp-c-bg-alt, #f8fafc);
  --tr-layout-right-bg: var(--vp-c-bg-alt, #f8fafc);
  height: 400px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 16px;
}

.layout-basic-demo__header,
.layout-basic-demo__footer {
  padding: 12px 16px;
  text-align: center;
}

.layout-basic-demo__main,
.layout-basic-demo__aside {
  display: grid;
  place-items: center;
  height: 100%;
}
</style>
`,P=JSON.parse('{"title":"Layout 布局","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/layout.md","filePath":"components/layout.md"}'),T={name:"components/layout.md"},X=Object.assign(T,{setup(F){const b=h();i(async()=>{b.value=(await c(async()=>{const{default:a}=await import("./chunks/floating.DeSJADiF.js");return{default:a}},__vite__mapDeps([0,1,2]))).default});const f=h();i(async()=>{f.value=(await c(async()=>{const{default:a}=await import("./chunks/main-scroll.IlClG-HZ.js");return{default:a}},__vite__mapDeps([3,1,2]))).default});const v=h();i(async()=>{v.value=(await c(async()=>{const{default:a}=await import("./chunks/aside-resizable.BAmggAiB.js");return{default:a}},__vite__mapDeps([4,1,2]))).default});const C=h();i(async()=>{C.value=(await c(async()=>{const{default:a}=await import("./chunks/aside-modes.n7jjVhxi.js");return{default:a}},__vite__mapDeps([5,1,2]))).default});const o=E(!0),g=h();return i(async()=>{g.value=(await c(async()=>{const{default:a}=await import("./chunks/basic.CiabLyJE.js");return{default:a}},__vite__mapDeps([6,1,2]))).default}),(a,t)=>{const r=_("ClientOnly");return x(),A("div",null,[t[5]||(t[5]=n("",13)),s(e(d(m),null,null,512),[[u,o.value]]),e(r,null,{default:l(()=>[e(d(y),{title:"基础布局",description:"最小布局示例。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{o.value=!1}),vueCode:d(w)},p({_:2},[g.value?{name:"vue",fn:l(()=>[e(d(g))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[6]||(t[6]=n("",9)),s(e(d(m),null,null,512),[[u,o.value]]),e(r,null,{default:l(()=>[e(d(y),{title:"侧栏形态",description:"左侧保留窄栏，右侧覆盖抽屉。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[1]||(t[1]=()=>{o.value=!1}),vueCode:d(k)},p({_:2},[C.value?{name:"vue",fn:l(()=>[e(d(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[7]||(t[7]=n("",3)),s(e(d(m),null,null,512),[[u,o.value]]),e(r,null,{default:l(()=>[e(d(y),{title:"侧栏宽度调整",description:"拖动分隔线调整 dock 侧栏宽度。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[2]||(t[2]=()=>{o.value=!1}),vueCode:d(L)},p({_:2},[v.value?{name:"vue",fn:l(()=>[e(d(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[8]||(t[8]=n("",8)),s(e(d(m),null,null,512),[[u,o.value]]),e(r,null,{default:l(()=>[e(d(y),{title:"主区滚动",description:"切换查看 BubbleList 和普通 div 两种 scrollHost 写法。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22main-scroll.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Flayout%2Fmain-scroll.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20MainScrollBubble%20from%20'.%2Fmain-scroll-bubble.vue'%5Cnimport%20MainScrollDiv%20from%20'.%2Fmain-scroll-div.vue'%5Cn%5Cnconst%20activeExample%20%3D%20ref%3C'bubble'%20%7C%20'div'%3E('bubble')%5Cn%5Cnconst%20currentExample%20%3D%20computed(()%20%3D%3E%20(activeExample.value%20%3D%3D%3D%20'bubble'%20%3F%20MainScrollBubble%20%3A%20MainScrollDiv))%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22layout-main-scroll-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22layout-main-scroll-demo__switcher%5C%22%20aria-label%3D%5C%22%E4%B8%BB%E5%8C%BA%E6%BB%9A%E5%8A%A8%E7%A4%BA%E4%BE%8B%E5%88%87%E6%8D%A2%5C%22%3E%5Cn%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20class%3D%5C%22layout-main-scroll-demo__switch%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%7B%20'is-active'%3A%20activeExample%20%3D%3D%3D%20'bubble'%20%7D%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aaria-pressed%3D%5C%22activeExample%20%3D%3D%3D%20'bubble'%5C%22%5Cn%20%20%20%20%20%20%20%20%40click%3D%5C%22activeExample%20%3D%20'bubble'%5C%22%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20BubbleList%5Cn%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%5Cn%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20class%3D%5C%22layout-main-scroll-demo__switch%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%7B%20'is-active'%3A%20activeExample%20%3D%3D%3D%20'div'%20%7D%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aaria-pressed%3D%5C%22activeExample%20%3D%3D%3D%20'div'%5C%22%5Cn%20%20%20%20%20%20%20%20%40click%3D%5C%22activeExample%20%3D%20'div'%5C%22%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%E6%99%AE%E9%80%9A%20div%5Cn%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cp%20class%3D%5C%22layout-main-scroll-demo__tip%5C%22%3E%E4%B8%A4%E7%A7%8D%E5%86%99%E6%B3%95%E9%83%BD%E6%8A%8A%E7%9C%9F%E5%AE%9E%E6%BB%9A%E5%8A%A8%E5%AE%B9%E5%99%A8%E4%BC%A0%E7%BB%99%20%60scrollHost%60%EF%BC%8C%E5%8C%BA%E5%88%AB%E5%8F%AA%E5%9C%A8%E6%BB%9A%E5%8A%A8%E5%86%85%E5%AE%B9%E6%9C%AC%E8%BA%AB%E6%98%AF%E4%BB%80%E4%B9%88%E3%80%82%3C%2Fp%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22layout-main-scroll-demo__stage%5C%22%3E%5Cn%20%20%20%20%20%20%3Ccomponent%20%3Ais%3D%5C%22currentExample%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.layout-main-scroll-demo%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__switcher%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%208px%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__switch%20%7B%5Cn%20%20height%3A%2034px%3B%5Cn%20%20padding%3A%200%2012px%3B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider%2C%20var(--tr-border-color%2C%20%23dcdfe6))%3B%5Cn%20%20border-radius%3A%208px%3B%5Cn%20%20background%3A%20var(--vp-c-bg%2C%20%23ffffff)%3B%5Cn%20%20color%3A%20var(--vp-c-text-2%2C%20var(--tr-text-secondary%2C%20%234e5969))%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__switch.is-active%20%7B%5Cn%20%20border-color%3A%20var(--vp-c-brand-1%2C%20var(--tr-color-primary%2C%20%235e7ce0))%3B%5Cn%20%20color%3A%20var(--vp-c-brand-1%2C%20var(--tr-color-primary%2C%20%235e7ce0))%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__tip%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20color%3A%20var(--vp-c-text-2%2C%20var(--tr-text-secondary%2C%20%234e5969))%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__stage%20%7B%5Cn%20%20--tr-bubble-box-bg%3A%20var(--tr-color-primary-light)%3B%5Cn%20%20--tr-layout-height%3A%20400px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22main-scroll-bubble.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Flayout%2Fmain-scroll-bubble.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20BubbleList%2C%20TrLayout%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20type%20%7B%20LayoutMainScrollHost%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cnconst%20scrollHostRef%20%3D%20ref%3CLayoutMainScrollHost%3E(null)%5Cn%5Cnconst%20messages%20%3D%20Array.from(%7B%20length%3A%2024%20%7D%2C%20(_%2C%20index)%20%3D%3E%20(%7B%5Cn%20%20role%3A%20index%20%25%202%20%3D%3D%3D%200%20%3F%20'assistant'%20%3A%20'user'%2C%5Cn%20%20content%3A%20%60layout%20message%20%24%7Bindex%20%2B%201%7D%60%2C%5Cn%7D))%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3CTrLayout%20class%3D%5C%22layout-main-scroll-example%20layout-main-scroll-example--bubble%5C%22%3E%5Cn%20%20%20%20%3Ctemplate%20%23main%3E%5Cn%20%20%20%20%20%20%3CTrLayout.Main%20%3Ascroll-host%3D%5C%22scrollHostRef%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3CBubbleList%20ref%3D%5C%22scrollHostRef%5C%22%20%3Amessages%3D%5C%22messages%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%3C%2FTrLayout.Main%3E%5Cn%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%3C%2FTrLayout%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.layout-main-scroll-example%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-example--bubble%20%7B%5Cn%20%20--tr-bubble-box-bg%3A%20var(--tr-color-primary-light)%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22main-scroll-div.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Flayout%2Fmain-scroll-div.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrLayout%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20type%20%7B%20LayoutMainScrollHost%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cnconst%20scrollHostRef%20%3D%20ref%3CLayoutMainScrollHost%3E(null)%5Cn%5Cnconst%20sections%20%3D%20Array.from(%7B%20length%3A%2012%20%7D%2C%20(_%2C%20index)%20%3D%3E%20(%7B%5Cn%20%20title%3A%20%60Section%20%24%7Bindex%20%2B%201%7D%60%2C%5Cn%20%20text%3A%20'%E6%99%AE%E9%80%9A%E6%BB%9A%E5%8A%A8%E5%AE%B9%E5%99%A8%E5%90%8C%E6%A0%B7%E5%8F%AF%E4%BB%A5%E7%9B%B4%E6%8E%A5%E4%BA%A4%E7%BB%99%20Layout.Main%20%E7%AE%A1%E7%90%86%E3%80%82'%2C%5Cn%7D))%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3CTrLayout%20class%3D%5C%22layout-main-scroll-example%20layout-main-scroll-example--div%5C%22%3E%5Cn%20%20%20%20%3Ctemplate%20%23main%3E%5Cn%20%20%20%20%20%20%3CTrLayout.Main%20%3Ascroll-host%3D%5C%22scrollHostRef%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20ref%3D%5C%22scrollHostRef%5C%22%20class%3D%5C%22layout-main-scroll-div__host%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Carticle%20v-for%3D%5C%22section%20in%20sections%5C%22%20%3Akey%3D%5C%22section.title%5C%22%20class%3D%5C%22layout-main-scroll-div__card%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cstrong%3E%7B%7B%20section.title%20%7D%7D%3C%2Fstrong%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cp%3E%7B%7B%20section.text%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Farticle%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2FTrLayout.Main%3E%5Cn%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%3C%2FTrLayout%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.layout-main-scroll-example%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-div__host%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20overflow%3A%20auto%3B%5Cn%20%20box-sizing%3A%20border-box%3B%5Cn%20%20padding%3A%2016px%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-div__card%20%7B%5Cn%20%20padding%3A%2016px%3B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider%2C%20var(--tr-border-color%2C%20%23dcdfe6))%3B%5Cn%20%20border-radius%3A%2012px%3B%5Cn%20%20background%3A%20var(--vp-c-bg%2C%20%23ffffff)%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-div__card%20p%20%7B%5Cn%20%20margin%3A%208px%200%200%3B%5Cn%20%20color%3A%20var(--vp-c-text-2%2C%20var(--tr-text-secondary%2C%20%234e5969))%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[3]||(t[3]=()=>{o.value=!1}),vueCode:d(B)},p({_:2},[f.value?{name:"vue",fn:l(()=>[e(d(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[9]||(t[9]=n("",7)),s(e(d(m),null,null,512),[[u,o.value]]),e(r,null,{default:l(()=>[e(d(y),{title:"浮层模式",description:"只传初始值的浮层示例。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[4]||(t[4]=()=>{o.value=!1}),vueCode:d(D)},p({_:2},[b.value?{name:"vue",fn:l(()=>[e(d(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[10]||(t[10]=n("",63))])}}});export{P as __pageData,X as default};
