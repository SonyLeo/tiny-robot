const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/floating.DhTHZQ3N.js","assets/chunks/theme.C6WcCT8L.js","assets/chunks/framework.DtZ8hpGs.js","assets/chunks/main-scroll.BRiI4bIj.js","assets/chunks/aside-resizable.C-oXilRV.js","assets/chunks/aside-modes.DUtwD1yl.js","assets/chunks/basic.BDxL7GpX.js"])))=>i.map(i=>d[i]);
import{aD as i,bQ as s,aZ as _,aL as E,v as x,H as l,bL as c,bB as u,J as e,bk as a,bJ as n,G as p,b7 as h,aU as A}from"./chunks/framework.DtZ8hpGs.js";import{L as y,N as m}from"./chunks/index.Cip4UbMu.js";const k=`<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutFloatingConfig } from '@opentiny/tiny-robot'

const open = ref(false)

const defaultFloating: LayoutFloatingConfig = {
  x: 48,
  y: 32,
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

    <p class="layout-floating-demo__tip">打开后可直接拖动顶部横条，或拖动左右边缘调整宽度。</p>

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
          <p>这个示例只传 \`defaultFloating\`，后续位置和宽度由组件自己维护。</p>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style scoped>
.layout-floating-demo {
  display: grid;
  gap: 12px;

  --tr-layout-height: 100%;
  --tr-layout-content-max-width: none;
  --tr-layout-inner-padding-inline: 0;
  --tr-layout-inner-padding-block: 0;
  --tr-layout-surface-radius: 24px;
  --tr-layout-surface-shadow: 0 24px 60px color-mix(in srgb, var(--vp-c-text-1, #111827) 14%, transparent);
  --tr-layout-main-bg: var(--vp-c-bg, var(--tr-container-bg-default, #ffffff));
  --tr-layout-header-bg: var(--vp-c-bg, var(--tr-container-bg-default, #ffffff));
}

.layout-floating-demo__trigger,
.layout-floating-demo__close {
  height: 36px;
  padding: 0 14px;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 999px;
  background: var(--vp-c-bg, var(--tr-container-bg-default, #ffffff));
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-floating-demo__trigger {
  justify-self: start;
}

.layout-floating-demo__tip {
  margin: 0;
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-floating-demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-floating-demo__main {
  padding: 24px;
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
  display: inline-flex;
  gap: 8px;
}

.layout-main-scroll-demo__switch {
  height: 34px;
  padding: 0 14px;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 999px;
  background: var(--vp-c-bg, #ffffff);
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-main-scroll-demo__switch.is-active {
  border-color: var(--vp-c-brand-1, var(--tr-color-primary, #5e7ce0));
  color: var(--vp-c-brand-1, var(--tr-color-primary, #5e7ce0));
  background: color-mix(in srgb, var(--vp-c-brand-1, var(--tr-color-primary, #5e7ce0)) 10%, white);
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
`,D=`<script setup lang="ts">
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
  --tr-layout-left-bg: color-mix(in srgb, var(--vp-c-bg-soft, #f5f7fa) 90%, #ffffff);
  height: 400px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 18px;
  background: var(--vp-c-bg-soft, var(--tr-container-bg-secondary, #f5f7fa));
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
`,L=`<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'

const rightOpen = ref(false)
<\/script>

<template>
  <div class="layout-aside-demo">
    <TrLayout>
      <template #left-aside>
        <TrLayout.Aside placement="left" default-open :default-width="156" :rail-width="56">
          <template #default="{ isOpen }">
            <div v-if="isOpen" class="layout-aside-demo__aside">
              <TrLayout.AsideToggle placement="left" class="layout-aside-demo__chip"> 收起侧栏 </TrLayout.AsideToggle>
              <div class="layout-aside-demo__chip">railWidth: 56px</div>
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
        <div class="layout-aside-demo__main">左侧是 \`dock + railWidth\`，右侧是 \`drawer\`。</div>
      </template>

      <template #right-aside>
        <TrLayout.Aside
          placement="right"
          mode="drawer"
          v-model:open="rightOpen"
          style="--tr-layout-drawer-width: 240px"
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
  --tr-layout-left-bg: color-mix(in srgb, var(--vp-c-bg-soft, #f5f7fa) 88%, #ffffff);
  height: 400px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 18px;
  background: var(--vp-c-bg-soft, var(--tr-container-bg-secondary, #f5f7fa));
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-aside-demo__header,
.layout-aside-demo__main,
.layout-aside-demo__drawer {
  background: var(--vp-c-bg, var(--tr-container-bg-default, #ffffff));
}

.layout-aside-demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
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

.layout-aside-demo__chip {
  display: grid;
  place-items: center;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 10px;
  background: var(--vp-c-bg, var(--tr-container-bg-default, #ffffff));
  color: inherit;
}

.layout-aside-demo__rail-chip {
  display: grid;
  place-items: center;
  width: 40px;
  min-height: 40px;
  padding: 0;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 8px;
  background: var(--vp-c-bg, var(--tr-container-bg-default, #ffffff));
  color: inherit;
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
  --tr-layout-header-bg: color-mix(in srgb, var(--tr-color-primary, #1476ff) 8%, #ffffff);
  --tr-layout-main-bg: var(--vp-c-bg, var(--tr-container-bg-default, #ffffff));
  --tr-layout-footer-bg: color-mix(in srgb, var(--tr-color-primary, #1476ff) 8%, #ffffff);
  --tr-layout-left-bg: color-mix(in srgb, var(--vp-c-bg-soft, #f5f7fa) 92%, #eef3ff);
  --tr-layout-right-bg: color-mix(in srgb, var(--vp-c-bg-soft, #f5f7fa) 92%, #eef3ff);
  height: 400px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 18px;
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
  font-weight: 600;
}

.layout-basic-demo__header,
.layout-basic-demo__footer {
  padding: 16px 20px;
  text-align: center;
}

.layout-basic-demo__main,
.layout-basic-demo__aside {
  display: grid;
  place-items: center;
  height: 100%;
}
</style>
`,X=JSON.parse('{"title":"Layout 布局","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/layout.md","filePath":"components/layout.md"}'),T={name:"components/layout.md"},S=Object.assign(T,{setup(F){const b=h();i(async()=>{b.value=(await s(async()=>{const{default:o}=await import("./chunks/floating.DhTHZQ3N.js");return{default:o}},__vite__mapDeps([0,1,2]))).default});const f=h();i(async()=>{f.value=(await s(async()=>{const{default:o}=await import("./chunks/main-scroll.BRiI4bIj.js");return{default:o}},__vite__mapDeps([3,1,2]))).default});const v=h();i(async()=>{v.value=(await s(async()=>{const{default:o}=await import("./chunks/aside-resizable.C-oXilRV.js");return{default:o}},__vite__mapDeps([4,1,2]))).default});const C=h();i(async()=>{C.value=(await s(async()=>{const{default:o}=await import("./chunks/aside-modes.DUtwD1yl.js");return{default:o}},__vite__mapDeps([5,1,2]))).default});const d=A(!0),g=h();return i(async()=>{g.value=(await s(async()=>{const{default:o}=await import("./chunks/basic.BDxL7GpX.js");return{default:o}},__vite__mapDeps([6,1,2]))).default}),(o,t)=>{const r=_("ClientOnly");return E(),x("div",null,[t[5]||(t[5]=l('<h1 id="layout-布局" tabindex="-1">Layout 布局 <a class="header-anchor" href="#layout-布局" aria-label="Permalink to &quot;Layout 布局&quot;">​</a></h1><p><code>Layout</code> 用来组织带有头部、主内容区、底部和左右侧栏的页面。适合聊天页、工作台、详情页这类结构固定的界面。</p><p>它主要解决四类场景：</p><ul><li>标准页面骨架</li><li>可收起的左右侧栏</li><li>主区滚动同步</li><li>可拖动、可改宽的浮层布局</li></ul><h2 id="状态控制" tabindex="-1">状态控制 <a class="header-anchor" href="#状态控制" aria-label="Permalink to &quot;状态控制&quot;">​</a></h2><p><code>Layout</code> 和 <code>Layout.Aside</code> 都支持两种状态写法：</p><ul><li>设置默认状态：使用 <code>defaultMode</code>、<code>defaultFloating</code>、<code>defaultOpen</code>、<code>defaultWidth</code></li><li>外部持续控制状态：使用 <code>mode</code>、<code>floating</code>、<code>open</code>、<code>width</code>，并回写对应的 <code>update:*</code> 事件</li></ul><p>同一组状态里，受控写法和初始值写法只能二选一，例如 <code>mode</code> 和 <code>defaultMode</code> 不能同时传。</p><p>通常 <code>Layout</code> 负责布局模式和浮层位置，<code>Layout.Aside</code> 负责单个侧栏的开关和宽度。</p><h2 id="基础布局" tabindex="-1">基础布局 <a class="header-anchor" href="#基础布局" aria-label="Permalink to &quot;基础布局&quot;">​</a></h2><p>基础布局适合最常见的桌面端页面：</p><ul><li>顶部放工具栏或标题</li><li>中间放主内容</li><li>左右两侧按需放导航或信息栏</li><li>底部放状态栏或操作栏</li></ul><p><code>Layout</code> 本身只负责分区，不限制各区域的内容。</p>',13)),c(e(a(y),null,null,512),[[u,d.value]]),e(r,null,{default:n(()=>[e(a(m),{title:"基础布局",description:"最小布局示例。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{d.value=!1}),vueCode:a(w)},p({_:2},[g.value?{name:"vue",fn:n(()=>[e(a(g))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[6]||(t[6]=l(`<p>配置详见：<a href="#layout-props">Layout Props</a>、<a href="#layout-slots">Layout Slots</a></p><h2 id="侧栏模式" tabindex="-1">侧栏模式 <a class="header-anchor" href="#侧栏模式" aria-label="Permalink to &quot;侧栏模式&quot;">​</a></h2><p><code>Layout.Aside</code> 支持两种展示方式：</p><ul><li><code>dock</code>：侧栏占据布局空间，适合桌面端常驻侧栏</li><li><code>drawer</code>：侧栏覆盖在主区上方，适合移动端或临时面板</li></ul><p>当侧栏使用 <code>dock</code> 时，还可以通过 <code>railWidth</code> 控制收起后的窄栏宽度：</p><ul><li><code>railWidth &gt; 0</code>：收起后保留一条窄栏</li><li><code>railWidth = 0</code>：收起后完全隐藏</li></ul><p>抽屉侧栏的宽度不通过 <code>width</code> 控制，而是通过 <code>--tr-layout-drawer-width</code> 设置。</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrLayout</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Aside</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  placement</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;right&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  mode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;drawer&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  v-model</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">open</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rightOpen</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  class</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;inspector-drawer&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/TrLayout.Aside&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;style scoped&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.inspector-drawer {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  --tr-layout-drawer-width: min(88vw, 360px);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/style&gt;</span></span></code></pre></div>`,8)),c(e(a(y),null,null,512),[[u,d.value]]),e(r,null,{default:n(()=>[e(a(m),{title:"侧栏形态",description:"左侧 rail，右侧 drawer。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[1]||(t[1]=()=>{d.value=!1}),vueCode:a(L)},p({_:2},[C.value?{name:"vue",fn:n(()=>[e(a(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[7]||(t[7]=l('<p>配置详见：<a href="#layout-aside-props">Layout.Aside Props</a>、<a href="#layout-aside-toggle-props">Layout.AsideToggle Props</a>、<a href="#layout-aside-events">Layout.Aside Events</a>、<a href="#layout-css-content">CSS 变量</a></p><h2 id="侧栏拖拽" tabindex="-1">侧栏拖拽 <a class="header-anchor" href="#侧栏拖拽" aria-label="Permalink to &quot;侧栏拖拽&quot;">​</a></h2><p><code>resizable</code> 用来开启 <code>dock</code> 侧栏的拖拽改宽，宽度范围由 <code>minWidth</code> 和 <code>maxWidth</code> 约束。</p>',3)),c(e(a(y),null,null,512),[[u,d.value]]),e(r,null,{default:n(()=>[e(a(m),{title:"侧栏宽度调整",description:"拖动分隔线调整 dock 侧栏宽度。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[2]||(t[2]=()=>{d.value=!1}),vueCode:a(D)},p({_:2},[v.value?{name:"vue",fn:n(()=>[e(a(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[8]||(t[8]=l('<p>配置详见：<a href="#layout-aside-props">Layout.Aside Props</a>、<a href="#layout-aside-events">Layout.Aside Events</a>、<a href="#layout-layout-events">Layout Events</a></p><h2 id="主区滚动" tabindex="-1">主区滚动 <a class="header-anchor" href="#主区滚动" aria-label="Permalink to &quot;主区滚动&quot;">​</a></h2><p><code>Layout.Main</code> 用来接管主区滚动条，但它不制造滚动。真正发生滚动的仍然是你传入的 <code>scrollHost</code>。</p><p>下面分别展示 <code>BubbleList</code> 和普通 <code>div</code> 作为滚动容器时的写法。</p><p>使用时注意三点：</p><ul><li><code>scrollHost</code> 必须指向真实滚动容器</li><li>滚动容器本身需要设置 <code>overflow: auto</code> 或 <code>overflow-y: auto</code></li><li>建议同时设置 <code>width: 100%</code>、<code>height: 100%</code>、<code>box-sizing: border-box</code></li></ul><p><code>Layout.Main</code> 会统一处理主区滚动条的展示，因此不建议再额外定制 <code>scrollHost</code> 的滚动条样式。</p>',7)),c(e(a(y),null,null,512),[[u,d.value]]),e(r,null,{default:n(()=>[e(a(m),{title:"主区滚动",description:"切换查看 BubbleList 和普通 div 两种 scrollHost 写法。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22main-scroll.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Flayout%2Fmain-scroll.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20MainScrollBubble%20from%20'.%2Fmain-scroll-bubble.vue'%5Cnimport%20MainScrollDiv%20from%20'.%2Fmain-scroll-div.vue'%5Cn%5Cnconst%20activeExample%20%3D%20ref%3C'bubble'%20%7C%20'div'%3E('bubble')%5Cn%5Cnconst%20currentExample%20%3D%20computed(()%20%3D%3E%20(activeExample.value%20%3D%3D%3D%20'bubble'%20%3F%20MainScrollBubble%20%3A%20MainScrollDiv))%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22layout-main-scroll-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22layout-main-scroll-demo__switcher%5C%22%20aria-label%3D%5C%22%E4%B8%BB%E5%8C%BA%E6%BB%9A%E5%8A%A8%E7%A4%BA%E4%BE%8B%E5%88%87%E6%8D%A2%5C%22%3E%5Cn%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20class%3D%5C%22layout-main-scroll-demo__switch%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%7B%20'is-active'%3A%20activeExample%20%3D%3D%3D%20'bubble'%20%7D%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aaria-pressed%3D%5C%22activeExample%20%3D%3D%3D%20'bubble'%5C%22%5Cn%20%20%20%20%20%20%20%20%40click%3D%5C%22activeExample%20%3D%20'bubble'%5C%22%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20BubbleList%5Cn%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%5Cn%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20class%3D%5C%22layout-main-scroll-demo__switch%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%7B%20'is-active'%3A%20activeExample%20%3D%3D%3D%20'div'%20%7D%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aaria-pressed%3D%5C%22activeExample%20%3D%3D%3D%20'div'%5C%22%5Cn%20%20%20%20%20%20%20%20%40click%3D%5C%22activeExample%20%3D%20'div'%5C%22%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%E6%99%AE%E9%80%9A%20div%5Cn%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cp%20class%3D%5C%22layout-main-scroll-demo__tip%5C%22%3E%E4%B8%A4%E7%A7%8D%E5%86%99%E6%B3%95%E9%83%BD%E6%8A%8A%E7%9C%9F%E5%AE%9E%E6%BB%9A%E5%8A%A8%E5%AE%B9%E5%99%A8%E4%BC%A0%E7%BB%99%20%60scrollHost%60%EF%BC%8C%E5%8C%BA%E5%88%AB%E5%8F%AA%E5%9C%A8%E6%BB%9A%E5%8A%A8%E5%86%85%E5%AE%B9%E6%9C%AC%E8%BA%AB%E6%98%AF%E4%BB%80%E4%B9%88%E3%80%82%3C%2Fp%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22layout-main-scroll-demo__stage%5C%22%3E%5Cn%20%20%20%20%20%20%3Ccomponent%20%3Ais%3D%5C%22currentExample%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.layout-main-scroll-demo%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__switcher%20%7B%5Cn%20%20display%3A%20inline-flex%3B%5Cn%20%20gap%3A%208px%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__switch%20%7B%5Cn%20%20height%3A%2034px%3B%5Cn%20%20padding%3A%200%2014px%3B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider%2C%20var(--tr-border-color%2C%20%23dcdfe6))%3B%5Cn%20%20border-radius%3A%20999px%3B%5Cn%20%20background%3A%20var(--vp-c-bg%2C%20%23ffffff)%3B%5Cn%20%20color%3A%20var(--vp-c-text-2%2C%20var(--tr-text-secondary%2C%20%234e5969))%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__switch.is-active%20%7B%5Cn%20%20border-color%3A%20var(--vp-c-brand-1%2C%20var(--tr-color-primary%2C%20%235e7ce0))%3B%5Cn%20%20color%3A%20var(--vp-c-brand-1%2C%20var(--tr-color-primary%2C%20%235e7ce0))%3B%5Cn%20%20background%3A%20color-mix(in%20srgb%2C%20var(--vp-c-brand-1%2C%20var(--tr-color-primary%2C%20%235e7ce0))%2010%25%2C%20white)%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__tip%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20color%3A%20var(--vp-c-text-2%2C%20var(--tr-text-secondary%2C%20%234e5969))%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__stage%20%7B%5Cn%20%20--tr-bubble-box-bg%3A%20var(--tr-color-primary-light)%3B%5Cn%20%20--tr-layout-height%3A%20400px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22main-scroll-bubble.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Flayout%2Fmain-scroll-bubble.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20BubbleList%2C%20TrLayout%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20type%20%7B%20LayoutMainScrollHost%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cnconst%20scrollHostRef%20%3D%20ref%3CLayoutMainScrollHost%3E(null)%5Cn%5Cnconst%20messages%20%3D%20Array.from(%7B%20length%3A%2024%20%7D%2C%20(_%2C%20index)%20%3D%3E%20(%7B%5Cn%20%20role%3A%20index%20%25%202%20%3D%3D%3D%200%20%3F%20'assistant'%20%3A%20'user'%2C%5Cn%20%20content%3A%20%60layout%20message%20%24%7Bindex%20%2B%201%7D%60%2C%5Cn%7D))%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3CTrLayout%20class%3D%5C%22layout-main-scroll-example%20layout-main-scroll-example--bubble%5C%22%3E%5Cn%20%20%20%20%3Ctemplate%20%23main%3E%5Cn%20%20%20%20%20%20%3CTrLayout.Main%20%3Ascroll-host%3D%5C%22scrollHostRef%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3CBubbleList%20ref%3D%5C%22scrollHostRef%5C%22%20%3Amessages%3D%5C%22messages%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%3C%2FTrLayout.Main%3E%5Cn%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%3C%2FTrLayout%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.layout-main-scroll-example%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-example--bubble%20%7B%5Cn%20%20--tr-bubble-box-bg%3A%20var(--tr-color-primary-light)%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22main-scroll-div.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Flayout%2Fmain-scroll-div.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrLayout%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20type%20%7B%20LayoutMainScrollHost%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cnconst%20scrollHostRef%20%3D%20ref%3CLayoutMainScrollHost%3E(null)%5Cn%5Cnconst%20sections%20%3D%20Array.from(%7B%20length%3A%2012%20%7D%2C%20(_%2C%20index)%20%3D%3E%20(%7B%5Cn%20%20title%3A%20%60Section%20%24%7Bindex%20%2B%201%7D%60%2C%5Cn%20%20text%3A%20'%E6%99%AE%E9%80%9A%E6%BB%9A%E5%8A%A8%E5%AE%B9%E5%99%A8%E5%90%8C%E6%A0%B7%E5%8F%AF%E4%BB%A5%E7%9B%B4%E6%8E%A5%E4%BA%A4%E7%BB%99%20Layout.Main%20%E7%AE%A1%E7%90%86%E3%80%82'%2C%5Cn%7D))%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3CTrLayout%20class%3D%5C%22layout-main-scroll-example%20layout-main-scroll-example--div%5C%22%3E%5Cn%20%20%20%20%3Ctemplate%20%23main%3E%5Cn%20%20%20%20%20%20%3CTrLayout.Main%20%3Ascroll-host%3D%5C%22scrollHostRef%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20ref%3D%5C%22scrollHostRef%5C%22%20class%3D%5C%22layout-main-scroll-div__host%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Carticle%20v-for%3D%5C%22section%20in%20sections%5C%22%20%3Akey%3D%5C%22section.title%5C%22%20class%3D%5C%22layout-main-scroll-div__card%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cstrong%3E%7B%7B%20section.title%20%7D%7D%3C%2Fstrong%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cp%3E%7B%7B%20section.text%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Farticle%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2FTrLayout.Main%3E%5Cn%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%3C%2FTrLayout%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.layout-main-scroll-example%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-div__host%20%7B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20overflow%3A%20auto%3B%5Cn%20%20box-sizing%3A%20border-box%3B%5Cn%20%20padding%3A%2020px%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-div__card%20%7B%5Cn%20%20padding%3A%2016px%2018px%3B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider%2C%20var(--tr-border-color%2C%20%23dcdfe6))%3B%5Cn%20%20border-radius%3A%2016px%3B%5Cn%20%20background%3A%20var(--vp-c-bg%2C%20%23ffffff)%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-div__card%20%2B%20.layout-main-scroll-div__card%20%7B%5Cn%20%20margin-top%3A%2012px%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-div__card%20p%20%7B%5Cn%20%20margin%3A%208px%200%200%3B%5Cn%20%20color%3A%20var(--vp-c-text-2%2C%20var(--tr-text-secondary%2C%20%234e5969))%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[3]||(t[3]=()=>{d.value=!1}),vueCode:a(B)},p({_:2},[f.value?{name:"vue",fn:n(()=>[e(a(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[9]||(t[9]=l('<p>配置详见：<a href="#layout-main-props">Layout.Main Props</a>、<a href="#layout-css-content">CSS 变量</a></p><h2 id="浮层模式" tabindex="-1">浮层模式 <a class="header-anchor" href="#浮层模式" aria-label="Permalink to &quot;浮层模式&quot;">​</a></h2><p>浮层模式适合临时工作区、对话框式页面或可移动面板。</p><p>如果只需要设置默认位置和宽度，使用 <code>defaultFloating</code>。如果需要在外部持续同步位置和宽度，使用 <code>floating</code> 并监听 <code>update:floating</code>。</p>',4)),c(e(a(y),null,null,512),[[u,d.value]]),e(r,null,{default:n(()=>[e(a(m),{title:"浮层模式",description:"只传初始值的浮层示例。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[4]||(t[4]=()=>{d.value=!1}),vueCode:a(k)},p({_:2},[b.value?{name:"vue",fn:n(()=>[e(a(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[10]||(t[10]=l('<p>配置详见：<a href="#layout-props">Layout Props</a>、<a href="#layout-floating-config">LayoutFloatingConfig</a>、<a href="#layout-layout-events">Layout Events</a>、<a href="#layout-css-basics">CSS 变量</a></p><h2 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h2><p><a id="layout-props"></a></p><h3 id="layout" tabindex="-1">Layout <a class="header-anchor" href="#layout" aria-label="Permalink to &quot;Layout&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td><code>mode</code></td><td>外部控制布局模式</td><td><code>&#39;normal&#39; | &#39;floating&#39;</code></td><td><code>-</code></td></tr><tr><td><code>defaultMode</code></td><td>默认布局模式</td><td><code>&#39;normal&#39; | &#39;floating&#39;</code></td><td><code>&#39;normal&#39;</code></td></tr><tr><td><code>floating</code></td><td>外部传入的浮层位置和尺寸</td><td><code>LayoutFloatingConfig</code></td><td><code>-</code></td></tr><tr><td><code>defaultFloating</code></td><td>默认浮层位置和尺寸</td><td><code>LayoutFloatingConfig</code></td><td><code>-</code></td></tr></tbody></table><p><a id="layout-floating-config"></a></p><h4 id="layoutfloatingconfig" tabindex="-1">LayoutFloatingConfig <a class="header-anchor" href="#layoutfloatingconfig" aria-label="Permalink to &quot;LayoutFloatingConfig&quot;">​</a></h4><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td><code>x</code></td><td>距离视口左侧的偏移</td><td><code>number</code></td><td><code>视口内水平居中</code></td></tr><tr><td><code>y</code></td><td>距离视口顶部的偏移</td><td><code>number</code></td><td><code>24</code></td></tr><tr><td><code>width</code></td><td>浮层宽度</td><td><code>number | string</code></td><td><code>420</code></td></tr><tr><td><code>height</code></td><td>浮层高度</td><td><code>number | string</code></td><td><code>&#39;80vh&#39;</code></td></tr><tr><td><code>draggable</code></td><td>是否允许拖动浮层</td><td><code>boolean</code></td><td><code>true</code></td></tr><tr><td><code>resizable</code></td><td>是否允许从左右边缘改宽</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td><code>minWidth</code></td><td>最小宽度</td><td><code>number | string</code></td><td><code>320</code></td></tr><tr><td><code>maxWidth</code></td><td>最大宽度</td><td><code>number | string</code></td><td><code>视口宽度 - 48px</code></td></tr></tbody></table><p><a id="layout-main-props"></a></p><h3 id="layout-main" tabindex="-1">Layout.Main <a class="header-anchor" href="#layout-main" aria-label="Permalink to &quot;Layout.Main&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td><code>scrollHost</code></td><td>真实滚动容器的元素或组件 ref</td><td><code>HTMLElement | ComponentPublicInstance | null</code></td><td><code>-</code></td></tr></tbody></table><p><a id="layout-aside-props"></a></p><h3 id="layout-aside" tabindex="-1">Layout.Aside <a class="header-anchor" href="#layout-aside" aria-label="Permalink to &quot;Layout.Aside&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td><code>placement</code></td><td>侧栏位置</td><td><code>&#39;left&#39; | &#39;right&#39;</code></td><td><code>-</code></td></tr><tr><td><code>mode</code></td><td>侧栏模式</td><td><code>&#39;dock&#39; | &#39;drawer&#39;</code></td><td><code>&#39;dock&#39;</code></td></tr><tr><td><code>open</code></td><td>外部控制侧栏开关</td><td><code>boolean</code></td><td><code>-</code></td></tr><tr><td><code>defaultOpen</code></td><td>默认开关状态</td><td><code>boolean</code></td><td><code>left: true</code> / <code>right: false</code></td></tr><tr><td><code>width</code></td><td>外部控制的 <code>dock</code> 宽度</td><td><code>number</code></td><td><code>-</code></td></tr><tr><td><code>defaultWidth</code></td><td>默认 <code>dock</code> 宽度</td><td><code>number</code></td><td><code>-</code></td></tr><tr><td><code>railWidth</code></td><td><code>dock</code> 收起后保留的窄栏宽度</td><td><code>number</code></td><td><code>0</code></td></tr><tr><td><code>minWidth</code></td><td><code>dock</code> 最小宽度</td><td><code>number</code></td><td><code>left: 200</code> / <code>right: 240</code></td></tr><tr><td><code>maxWidth</code></td><td><code>dock</code> 最大宽度</td><td><code>number</code></td><td><code>left: 560</code> / <code>right: 640</code></td></tr><tr><td><code>resizable</code></td><td>是否允许拖动改变 <code>dock</code> 宽度</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td><code>collapseEffect</code></td><td>收起时的动画效果</td><td><code>&#39;overlay&#39; | &#39;slide&#39;</code></td><td><code>&#39;overlay&#39;</code></td></tr></tbody></table><p><a id="layout-aside-toggle-props"></a></p><h3 id="layout-asidetoggle" tabindex="-1">Layout.AsideToggle <a class="header-anchor" href="#layout-asidetoggle" aria-label="Permalink to &quot;Layout.AsideToggle&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td><code>placement</code></td><td>控制的侧栏位置</td><td><code>&#39;left&#39; | &#39;right&#39;</code></td><td><code>-</code></td></tr><tr><td><code>ariaLabel</code></td><td>切换按钮的无障碍文本</td><td><code>string</code></td><td><code>left: &#39;Toggle left panel&#39;</code> / <code>right: &#39;Toggle right panel&#39;</code></td></tr></tbody></table><h2 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h2><p><a id="layout-slots"></a></p><h3 id="layout-1" tabindex="-1">Layout <a class="header-anchor" href="#layout-1" aria-label="Permalink to &quot;Layout&quot;">​</a></h3><table tabindex="0"><thead><tr><th>插槽名</th><th>说明</th></tr></thead><tbody><tr><td><code>left-aside</code></td><td>左侧栏内容</td></tr><tr><td><code>header</code></td><td>顶部区域</td></tr><tr><td><code>main</code></td><td>主区内容</td></tr><tr><td><code>footer</code></td><td>底部区域</td></tr><tr><td><code>right-aside</code></td><td>右侧栏内容</td></tr></tbody></table><h3 id="layout-aside-1" tabindex="-1">Layout.Aside <a class="header-anchor" href="#layout-aside-1" aria-label="Permalink to &quot;Layout.Aside&quot;">​</a></h3><table tabindex="0"><thead><tr><th>插槽名</th><th>说明</th><th>作用域参数</th></tr></thead><tbody><tr><td><code>default</code></td><td>侧栏内容</td><td><code>{ isOpen: boolean }</code></td></tr></tbody></table><h3 id="layout-asidetoggle-1" tabindex="-1">Layout.AsideToggle <a class="header-anchor" href="#layout-asidetoggle-1" aria-label="Permalink to &quot;Layout.AsideToggle&quot;">​</a></h3><table tabindex="0"><thead><tr><th>插槽名</th><th>说明</th><th>作用域参数</th></tr></thead><tbody><tr><td><code>default</code></td><td>自定义切换按钮内容</td><td><code>{ isOpen: boolean }</code></td></tr></tbody></table><h2 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h2><p><a id="layout-layout-events"></a></p><h3 id="layout-2" tabindex="-1">Layout <a class="header-anchor" href="#layout-2" aria-label="Permalink to &quot;Layout&quot;">​</a></h3><table tabindex="0"><thead><tr><th>事件名</th><th>说明</th><th>回调参数</th></tr></thead><tbody><tr><td><code>update:mode</code></td><td>布局模式变化</td><td><code>(value: LayoutMode)</code></td></tr><tr><td><code>update:floating</code></td><td>浮层位置或尺寸变化</td><td><code>(value: LayoutFloatingConfig)</code></td></tr><tr><td><code>aside-resize-start</code></td><td>开始调整侧栏宽度</td><td><code>(detail: { placement: &#39;left&#39; | &#39;right&#39;; width: number })</code></td></tr><tr><td><code>aside-resize</code></td><td>调整侧栏宽度时持续触发</td><td><code>(detail: { placement: &#39;left&#39; | &#39;right&#39;; width: number })</code></td></tr><tr><td><code>aside-resize-end</code></td><td>结束调整侧栏宽度</td><td><code>(detail: { placement: &#39;left&#39; | &#39;right&#39;; width: number })</code></td></tr><tr><td><code>floating-drag-start</code></td><td>开始拖动浮层</td><td><code>(detail: { x: number; y: number })</code></td></tr><tr><td><code>floating-drag</code></td><td>拖动浮层时持续触发</td><td><code>(detail: { x: number; y: number })</code></td></tr><tr><td><code>floating-drag-end</code></td><td>结束拖动浮层</td><td><code>(detail: { x: number; y: number })</code></td></tr><tr><td><code>floating-resize-start</code></td><td>开始调整浮层宽度</td><td><code>(detail: { edge: &#39;left&#39; | &#39;right&#39;; width: number })</code></td></tr><tr><td><code>floating-resize</code></td><td>调整浮层宽度时持续触发</td><td><code>(detail: { edge: &#39;left&#39; | &#39;right&#39;; width: number })</code></td></tr><tr><td><code>floating-resize-end</code></td><td>结束调整浮层宽度</td><td><code>(detail: { edge: &#39;left&#39; | &#39;right&#39;; width: number })</code></td></tr></tbody></table><p><a id="layout-aside-events"></a></p><h3 id="layout-aside-2" tabindex="-1">Layout.Aside <a class="header-anchor" href="#layout-aside-2" aria-label="Permalink to &quot;Layout.Aside&quot;">​</a></h3><table tabindex="0"><thead><tr><th>事件名</th><th>说明</th><th>回调参数</th></tr></thead><tbody><tr><td><code>update:open</code></td><td>侧栏开关变化</td><td><code>(value: boolean)</code></td></tr><tr><td><code>update:width</code></td><td><code>dock</code> 宽度变化</td><td><code>(value: number)</code></td></tr></tbody></table><h2 id="css-变量" tabindex="-1">CSS 变量 <a class="header-anchor" href="#css-变量" aria-label="Permalink to &quot;CSS 变量&quot;">​</a></h2><p><a id="layout-css-basics"></a></p><h3 id="布局基础" tabindex="-1">布局基础 <a class="header-anchor" href="#布局基础" aria-label="Permalink to &quot;布局基础&quot;">​</a></h3><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-layout-height</code></td><td>布局高度</td></tr><tr><td><code>--tr-layout-bg</code></td><td>容器背景</td></tr><tr><td><code>--tr-layout-left-bg</code></td><td>左侧栏背景</td></tr><tr><td><code>--tr-layout-right-bg</code></td><td>右侧栏背景</td></tr><tr><td><code>--tr-layout-header-bg</code></td><td>顶部背景</td></tr><tr><td><code>--tr-layout-main-bg</code></td><td>主区背景</td></tr><tr><td><code>--tr-layout-footer-bg</code></td><td>底部背景</td></tr><tr><td><code>--tr-layout-divider-color</code></td><td>分隔线颜色</td></tr><tr><td><code>--tr-layout-overlay-bg</code></td><td>drawer 遮罩颜色</td></tr><tr><td><code>--tr-layout-panel-shadow</code></td><td>drawer 阴影</td></tr><tr><td><code>--tr-layout-surface-radius</code></td><td>浮层圆角</td></tr><tr><td><code>--tr-layout-surface-shadow</code></td><td>浮层阴影</td></tr><tr><td><code>--tr-layout-surface-z-index</code></td><td>浮层层级</td></tr></tbody></table><p><a id="layout-css-content"></a></p><h3 id="内容与交互" tabindex="-1">内容与交互 <a class="header-anchor" href="#内容与交互" aria-label="Permalink to &quot;内容与交互&quot;">​</a></h3><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-layout-content-max-width</code></td><td>内容最大宽度</td></tr><tr><td><code>--tr-layout-inner-padding-inline</code></td><td>横向内边距</td></tr><tr><td><code>--tr-layout-inner-padding-block</code></td><td>纵向内边距</td></tr><tr><td><code>--tr-layout-main-min-width</code></td><td>主区最小宽度</td></tr><tr><td><code>--tr-layout-drawer-width</code></td><td>drawer 展示宽度</td></tr><tr><td><code>--tr-layout-main-scrollbar-width</code></td><td>滚动条宽度</td></tr><tr><td><code>--tr-layout-main-scrollbar-thumb-bg</code></td><td>滚动条滑块颜色</td></tr><tr><td><code>--tr-layout-main-scrollbar-thumb-bg-hover</code></td><td>滑块悬停颜色</td></tr><tr><td><code>--tr-layout-main-scrollbar-thumb-bg-active</code></td><td>滑块激活颜色</td></tr></tbody></table>',39))])}}});export{X as __pageData,S as default};
