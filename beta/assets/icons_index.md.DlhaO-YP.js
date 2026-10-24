const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/IconGallery.Qv9Xdeqx.js","assets/chunks/framework.CSCYUGUn.js","assets/chunks/theme.DwVu-FYj.js","assets/chunks/VNodeUsage.CAx3U5el.js","assets/chunks/PropsUsage.CSJKhlHJ.js","assets/chunks/DirectRender.Cx0U2Udi.js"])))=>i.map(i=>d[i]);
import{aD as C,bQ as s,aZ as D,aL as _,v as b,H as A,bL as d,bB as p,J as e,bk as o,bJ as r,G as u,w as t,I as l,b7 as y,aU as x}from"./chunks/framework.CSCYUGUn.js";import{L as g,N as m}from"./chunks/index.DLLCwG7b.js";const E=`<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { TinyModal } from '@opentiny/vue'
import * as exportedIcons from '@opentiny/tiny-robot-svgs'
import { hiddenIconNames, iconCategoryGroups, iconMetadataMap, uncategorizedTitle } from './iconMeta'

type IconComponent = (typeof exportedIcons)[keyof typeof exportedIcons]
type IconEntry = {
  name: string
  component: IconComponent
  category: string
  keywords: string[]
  previewLayout: 'regular' | 'illustration'
}

const searchQuery = shallowRef('')
const copiedName = shallowRef('')

let resetTimer: ReturnType<typeof setTimeout> | undefined

const iconEntries = Object.entries(exportedIcons)
  .map(([name, component]) => {
    const metadata = iconMetadataMap.get(name)

    return {
      name,
      component: component as IconComponent,
      category: metadata?.category ?? uncategorizedTitle,
      keywords: metadata?.keywords ?? [],
      previewLayout: metadata?.previewLayout ?? 'regular',
    } satisfies IconEntry
  })
  .filter(({ name }) => !hiddenIconNames.has(name))
  .sort((a, b) => a.name.localeCompare(b.name))

const filteredIcons = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()

  if (!keyword) {
    return iconEntries
  }

  return iconEntries.filter(({ name, category, keywords }) => {
    const haystack = [name, category, ...keywords].join(' ').toLowerCase()
    return haystack.includes(keyword)
  })
})

const groupedIcons = computed(() => {
  const sections = iconCategoryGroups
    .map(({ title, previewLayout = 'regular' }) => ({
      title,
      previewLayout,
      icons: filteredIcons.value.filter((icon) => icon.category === title),
    }))
    .filter(({ icons }) => icons.length)

  const uncategorizedIcons = filteredIcons.value.filter((icon) => icon.category === uncategorizedTitle)

  if (uncategorizedIcons.length) {
    sections.push({
      title: uncategorizedTitle,
      previewLayout: 'regular',
      icons: uncategorizedIcons,
    })
  }

  return sections
})

const filteredCount = computed(() => groupedIcons.value.reduce((count, section) => count + section.icons.length, 0))

async function copyName(name: string) {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(name)
    } else if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea')
      textarea.value = name
      textarea.setAttribute('readonly', 'true')
      textarea.style.position = 'absolute'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }

    copiedName.value = name
    TinyModal.message({
      message: \`\${name} 图标已复制\`,
      status: 'success',
      duration: 2000,
    })

    if (resetTimer) {
      clearTimeout(resetTimer)
    }

    resetTimer = setTimeout(() => {
      copiedName.value = ''
    }, 1800)
  } catch (error) {
    console.error('Failed to copy icon name:', error)
  }
}
<\/script>

<template>
  <div class="icon-gallery">
    <div class="icon-gallery__toolbar">
      <label class="icon-gallery__search">
        <span class="icon-gallery__search-label">搜索</span>
        <input
          v-model="searchQuery"
          class="icon-gallery__search-input"
          type="text"
          placeholder="输入 Icon 名称，例如 IconSend"
        />
      </label>
      <div class="icon-gallery__meta">
        <span>当前展示 {{ filteredCount }} / {{ iconEntries.length }}</span>
      </div>
    </div>

    <div v-if="groupedIcons.length" class="icon-gallery__sections">
      <section v-for="section in groupedIcons" :key="section.title" class="icon-gallery__section">
        <h3 class="icon-gallery__section-title">{{ section.title }}</h3>
        <div
          :class="[
            'icon-gallery__grid',
            { 'icon-gallery__grid--illustration': section.previewLayout === 'illustration' },
          ]"
        >
          <button
            v-for="icon in section.icons"
            :key="icon.name"
            :class="[
              'icon-gallery__card',
              { 'icon-gallery__card--illustration': section.previewLayout === 'illustration' },
              { 'icon-gallery__card--copied': copiedName === icon.name },
            ]"
            type="button"
            @click="copyName(icon.name)"
          >
            <span
              :class="[
                'icon-gallery__icon-preview',
                { 'icon-gallery__icon-preview--illustration': section.previewLayout === 'illustration' },
              ]"
            >
              <component
                :is="icon.component"
                :class="[
                  'icon-gallery__icon',
                  { 'icon-gallery__icon--illustration': section.previewLayout === 'illustration' },
                ]"
              />
            </span>
            <span class="icon-gallery__name">{{ icon.name }}</span>
          </button>
        </div>
      </section>
    </div>

    <div v-else class="icon-gallery__empty">未找到匹配的图标。</div>
  </div>
</template>

<style scoped>
.icon-gallery {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.icon-gallery__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.icon-gallery__search {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: min(100%, 320px);
}

.icon-gallery__search-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.icon-gallery__search-input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.icon-gallery__search-input:focus {
  outline: none;
  border-color: #1476ff;
  box-shadow: 0 0 0 3px color-mix(in srgb, #1476ff 18%, transparent);
}

.icon-gallery__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 1.6;
  text-align: right;
}

.icon-gallery__sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.icon-gallery__section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.icon-gallery__section-title {
  margin: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 20px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--vp-c-text-1);
}

.icon-gallery__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  gap: 12px;
}

.icon-gallery__grid--illustration {
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}

.icon-gallery__card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 112px;
  padding: 16px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease;
}

.icon-gallery__card--illustration {
  align-items: stretch;
  justify-content: flex-start;
  min-height: 220px;
}

.icon-gallery__card--copied {
  border-color: color-mix(in srgb, #1476ff 48%, var(--vp-c-divider));
  background: color-mix(in srgb, #1476ff 7%, var(--vp-c-bg));
  box-shadow: 0 0 0 2px color-mix(in srgb, #1476ff 14%, transparent);
}

.icon-gallery__card:hover {
  background: var(--vp-c-bg-soft);
}

.icon-gallery__card:focus-visible {
  outline: none;
  border-color: #1476ff;
  box-shadow: 0 0 0 3px color-mix(in srgb, #1476ff 18%, transparent);
}

.icon-gallery__icon-preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 6px;
  transition:
    background-color 0.18s ease,
    color 0.18s ease;
}

.icon-gallery__icon-preview--illustration {
  width: 100%;
  height: 132px;
  padding: 12px;
  overflow: hidden;
}

.icon-gallery__icon {
  font-size: 24px;
  transition: all 0.4s;
  transform-origin: center;
}

.icon-gallery__icon--illustration {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  font-size: 16px;
}

.icon-gallery__icon:hover {
  transform: scale(1.5);
}

.icon-gallery__icon--illustration:hover {
  transform: none;
}

.icon-gallery__name {
  font-size: 12px;
  line-height: 1.5;
  text-align: center;
  word-break: break-word;
}

.icon-gallery__empty {
  padding: 28px 16px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 8px;
  color: var(--vp-c-text-2);
  text-align: center;
  background: var(--vp-c-bg);
}

@media (max-width: 640px) {
  .icon-gallery__meta {
    text-align: left;
  }

  .icon-gallery__section-title {
    font-size: 18px;
  }

  .icon-gallery__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .icon-gallery__grid--illustration {
    grid-template-columns: 1fr;
  }
}
</style>
`,I=`<script setup lang="ts">
import { h, shallowRef } from 'vue'
import { TrHistory } from '@opentiny/tiny-robot'
import { IconCheck, IconCopy, IconDelete } from '@opentiny/tiny-robot-svgs'

const selectedId = shallowRef<string | undefined>('2')

const historyItems = shallowRef([
  { title: '已选中会话', id: '1', icon: h(IconCheck, { style: { fontSize: '16px' } }) },
  { title: '已复制消息', id: '2', icon: h(IconCopy, { style: { fontSize: '16px' } }) },
  { title: '待删除记录', id: '3', icon: h(IconDelete, { style: { fontSize: '16px' } }) },
])

function handleItemClick(item: { id: string }) {
  selectedId.value = item.id
}
<\/script>

<template>
  <TrHistory :data="historyItems" :selected="selectedId" @item-click="handleItemClick" />
</template>
`,w=`<script setup lang="ts">
import { TrIconButton } from '@opentiny/tiny-robot'
import { IconNewSession, IconRefresh, IconSearch } from '@opentiny/tiny-robot-svgs'
<\/script>

<template>
  <div class="icon-demo-row">
    <TrIconButton size="34" svg-size="18" :icon="IconNewSession" />
    <TrIconButton size="34" svg-size="18" :icon="IconRefresh" />
    <TrIconButton size="34" svg-size="18" :icon="IconSearch" />
  </div>
</template>

<style scoped>
.icon-demo-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
}
</style>
`,k=`<script setup lang="ts">
import { IconAi, IconSearch, IconSparkles } from '@opentiny/tiny-robot-svgs'
<\/script>

<template>
  <div class="icon-demo-row">
    <IconAi class="icon-demo-row__icon icon-demo-row__icon--primary" />
    <IconSparkles class="icon-demo-row__icon icon-demo-row__icon--brand" />
    <IconSearch class="icon-demo-row__icon icon-demo-row__icon--muted" />
  </div>
</template>

<style scoped>
.icon-demo-row {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 48px;
}

.icon-demo-row__icon {
  font-size: 22px;
}

.icon-demo-row__icon--primary {
  font-size: 30px;
}

.icon-demo-row__icon--brand {
  color: #1476ff;
}

.icon-demo-row__icon--muted {
  color: #5b6b82;
}
</style>
`,z=JSON.parse('{"title":"SVG 图标","description":"介绍 @opentiny/tiny-robot-svgs 图标包的安装方式和 SVG 图标组件使用方法。","frontmatter":{"outline":[1,3],"title":"SVG 图标","kind":"reference","description":"介绍 @opentiny/tiny-robot-svgs 图标包的安装方式和 SVG 图标组件使用方法。","status":"stable","package":"@opentiny/tiny-robot-svgs","keywords":["SVG","图标","图标组件"]},"headers":[],"relativePath":"icons/index.md","filePath":"icons/index.md"}'),F={name:"icons/index.md"},W=Object.assign(F,{setup(T){const B=y();C(async()=>{B.value=(await s(async()=>{const{default:a}=await import("./chunks/IconGallery.Qv9Xdeqx.js");return{default:a}},__vite__mapDeps([0,1,2]))).default});const h=y();C(async()=>{h.value=(await s(async()=>{const{default:a}=await import("./chunks/VNodeUsage.CAx3U5el.js");return{default:a}},__vite__mapDeps([3,2,1]))).default});const v=y();C(async()=>{v.value=(await s(async()=>{const{default:a}=await import("./chunks/PropsUsage.CSJKhlHJ.js");return{default:a}},__vite__mapDeps([4,2,1]))).default});const i=x(!0),f=y();return C(async()=>{f.value=(await s(async()=>{const{default:a}=await import("./chunks/DirectRender.Cx0U2Udi.js");return{default:a}},__vite__mapDeps([5,2,1]))).default}),(a,n)=>{const c=D("ClientOnly");return _(),b("div",null,[n[4]||(n[4]=A('<h1 id="svg-图标" tabindex="-1">SVG 图标 <a class="header-anchor" href="#svg-图标" aria-label="Permalink to &quot;SVG 图标&quot;">​</a></h1><p><code>@opentiny/tiny-robot-svgs</code> 提供了一组可直接使用的 SVG 图标组件。</p><h2 id="安装" tabindex="-1">安装 <a class="header-anchor" href="#安装" aria-label="Permalink to &quot;安装&quot;">​</a></h2><div class="vp-code-group vp-adaptive-theme"><div class="tabs"><input type="radio" name="group--m-t-" id="tab-VOJbYyQ" checked><label data-title="pnpm" for="tab-VOJbYyQ">pnpm</label><input type="radio" name="group--m-t-" id="tab-H5733PH"><label data-title="yarn" for="tab-H5733PH">yarn</label><input type="radio" name="group--m-t-" id="tab-UFoEgaI"><label data-title="npm" for="tab-UFoEgaI">npm</label></div><div class="blocks"><div class="language-bash vp-adaptive-theme active"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pnpm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot-svgs</span></span></code></pre></div><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">yarn</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot-svgs</span></span></code></pre></div><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot-svgs</span></span></code></pre></div></div></div><h2 id="示例" tabindex="-1">示例 <a class="header-anchor" href="#示例" aria-label="Permalink to &quot;示例&quot;">​</a></h2><p>下面展示几种最常见的使用方式。</p><h3 id="直接引入与渲染" tabindex="-1">直接引入与渲染 <a class="header-anchor" href="#直接引入与渲染" aria-label="Permalink to &quot;直接引入与渲染&quot;">​</a></h3><p>适合直接在页面中摆放独立图标，通过 <code>fontSize</code> 和 <code>color</code> 控制尺寸与颜色即可。</p>',8)),d(e(o(g),null,null,512),[[p,i.value]]),e(c,null,{default:r(()=>[e(o(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[0]||(n[0]=()=>{i.value=!1}),vueCode:o(k)},u({_:2},[f.value?{name:"vue",fn:r(()=>[e(o(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[5]||(n[5]=t("h3",{id:"作为组件-props-传递",tabindex:"-1"},[l("作为组件 props 传递 "),t("a",{class:"header-anchor",href:"#作为组件-props-传递","aria-label":'Permalink to "作为组件 props 传递"'},"​")],-1)),n[6]||(n[6]=t("p",null,[l("适合 "),t("code",null,"TrIconButton"),l("、"),t("code",null,"TrSender"),l("、"),t("code",null,"TrHistory"),l(" 等支持 "),t("code",null,"icon"),l(" 属性的组件。")],-1)),d(e(o(g),null,null,512),[[p,i.value]]),e(c,null,{default:r(()=>[e(o(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[1]||(n[1]=()=>{i.value=!1}),vueCode:o(w)},u({_:2},[v.value?{name:"vue",fn:r(()=>[e(o(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[7]||(n[7]=t("h3",{id:"作为-vnode-传递",tabindex:"-1"},[l("作为 VNode 传递 "),t("a",{class:"header-anchor",href:"#作为-vnode-传递","aria-label":'Permalink to "作为 VNode 传递"'},"​")],-1)),n[8]||(n[8]=t("p",null,"适合 icon 需要在运行时动态组装，或者第三方/业务组件要求接收 VNode 的场景。",-1)),d(e(o(g),null,null,512),[[p,i.value]]),e(c,null,{default:r(()=>[e(o(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[2]||(n[2]=()=>{i.value=!1}),vueCode:o(I)},u({_:2},[h.value?{name:"vue",fn:r(()=>[e(o(h))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[9]||(n[9]=t("h2",{id:"图标集合",tabindex:"-1"},[l("图标集合 "),t("a",{class:"header-anchor",href:"#图标集合","aria-label":'Permalink to "图标集合"'},"​")],-1)),n[10]||(n[10]=t("p",null,"图标集合按常用场景分类展示，支持按图标名、分类名和关键词筛选。点击图标卡片可以快速复制图标名称；插画型和场景态图标会单独分组展示。",-1)),d(e(o(g),null,null,512),[[p,i.value]]),e(c,null,{default:r(()=>[e(o(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22IconGallery.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ficons%2FIconGallery.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%20TinyModal%20%7D%20from%20'%40opentiny%2Fvue'%5Cnimport%20*%20as%20exportedIcons%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20hiddenIconNames%2C%20iconCategoryGroups%2C%20iconMetadataMap%2C%20uncategorizedTitle%20%7D%20from%20'.%2FiconMeta'%5Cn%5Cntype%20IconComponent%20%3D%20(typeof%20exportedIcons)%5Bkeyof%20typeof%20exportedIcons%5D%5Cntype%20IconEntry%20%3D%20%7B%5Cn%20%20name%3A%20string%5Cn%20%20component%3A%20IconComponent%5Cn%20%20category%3A%20string%5Cn%20%20keywords%3A%20string%5B%5D%5Cn%20%20previewLayout%3A%20'regular'%20%7C%20'illustration'%5Cn%7D%5Cn%5Cnconst%20searchQuery%20%3D%20shallowRef('')%5Cnconst%20copiedName%20%3D%20shallowRef('')%5Cn%5Cnlet%20resetTimer%3A%20ReturnType%3Ctypeof%20setTimeout%3E%20%7C%20undefined%5Cn%5Cnconst%20iconEntries%20%3D%20Object.entries(exportedIcons)%5Cn%20%20.map((%5Bname%2C%20component%5D)%20%3D%3E%20%7B%5Cn%20%20%20%20const%20metadata%20%3D%20iconMetadataMap.get(name)%5Cn%5Cn%20%20%20%20return%20%7B%5Cn%20%20%20%20%20%20name%2C%5Cn%20%20%20%20%20%20component%3A%20component%20as%20IconComponent%2C%5Cn%20%20%20%20%20%20category%3A%20metadata%3F.category%20%3F%3F%20uncategorizedTitle%2C%5Cn%20%20%20%20%20%20keywords%3A%20metadata%3F.keywords%20%3F%3F%20%5B%5D%2C%5Cn%20%20%20%20%20%20previewLayout%3A%20metadata%3F.previewLayout%20%3F%3F%20'regular'%2C%5Cn%20%20%20%20%7D%20satisfies%20IconEntry%5Cn%20%20%7D)%5Cn%20%20.filter((%7B%20name%20%7D)%20%3D%3E%20!hiddenIconNames.has(name))%5Cn%20%20.sort((a%2C%20b)%20%3D%3E%20a.name.localeCompare(b.name))%5Cn%5Cnconst%20filteredIcons%20%3D%20computed(()%20%3D%3E%20%7B%5Cn%20%20const%20keyword%20%3D%20searchQuery.value.trim().toLowerCase()%5Cn%5Cn%20%20if%20(!keyword)%20%7B%5Cn%20%20%20%20return%20iconEntries%5Cn%20%20%7D%5Cn%5Cn%20%20return%20iconEntries.filter((%7B%20name%2C%20category%2C%20keywords%20%7D)%20%3D%3E%20%7B%5Cn%20%20%20%20const%20haystack%20%3D%20%5Bname%2C%20category%2C%20...keywords%5D.join('%20').toLowerCase()%5Cn%20%20%20%20return%20haystack.includes(keyword)%5Cn%20%20%7D)%5Cn%7D)%5Cn%5Cnconst%20groupedIcons%20%3D%20computed(()%20%3D%3E%20%7B%5Cn%20%20const%20sections%20%3D%20iconCategoryGroups%5Cn%20%20%20%20.map((%7B%20title%2C%20previewLayout%20%3D%20'regular'%20%7D)%20%3D%3E%20(%7B%5Cn%20%20%20%20%20%20title%2C%5Cn%20%20%20%20%20%20previewLayout%2C%5Cn%20%20%20%20%20%20icons%3A%20filteredIcons.value.filter((icon)%20%3D%3E%20icon.category%20%3D%3D%3D%20title)%2C%5Cn%20%20%20%20%7D))%5Cn%20%20%20%20.filter((%7B%20icons%20%7D)%20%3D%3E%20icons.length)%5Cn%5Cn%20%20const%20uncategorizedIcons%20%3D%20filteredIcons.value.filter((icon)%20%3D%3E%20icon.category%20%3D%3D%3D%20uncategorizedTitle)%5Cn%5Cn%20%20if%20(uncategorizedIcons.length)%20%7B%5Cn%20%20%20%20sections.push(%7B%5Cn%20%20%20%20%20%20title%3A%20uncategorizedTitle%2C%5Cn%20%20%20%20%20%20previewLayout%3A%20'regular'%2C%5Cn%20%20%20%20%20%20icons%3A%20uncategorizedIcons%2C%5Cn%20%20%20%20%7D)%5Cn%20%20%7D%5Cn%5Cn%20%20return%20sections%5Cn%7D)%5Cn%5Cnconst%20filteredCount%20%3D%20computed(()%20%3D%3E%20groupedIcons.value.reduce((count%2C%20section)%20%3D%3E%20count%20%2B%20section.icons.length%2C%200))%5Cn%5Cnasync%20function%20copyName(name%3A%20string)%20%7B%5Cn%20%20try%20%7B%5Cn%20%20%20%20if%20(typeof%20navigator%20!%3D%3D%20'undefined'%20%26%26%20navigator.clipboard%3F.writeText)%20%7B%5Cn%20%20%20%20%20%20await%20navigator.clipboard.writeText(name)%5Cn%20%20%20%20%7D%20else%20if%20(typeof%20document%20!%3D%3D%20'undefined')%20%7B%5Cn%20%20%20%20%20%20const%20textarea%20%3D%20document.createElement('textarea')%5Cn%20%20%20%20%20%20textarea.value%20%3D%20name%5Cn%20%20%20%20%20%20textarea.setAttribute('readonly'%2C%20'true')%5Cn%20%20%20%20%20%20textarea.style.position%20%3D%20'absolute'%5Cn%20%20%20%20%20%20textarea.style.left%20%3D%20'-9999px'%5Cn%20%20%20%20%20%20document.body.appendChild(textarea)%5Cn%20%20%20%20%20%20textarea.select()%5Cn%20%20%20%20%20%20document.execCommand('copy')%5Cn%20%20%20%20%20%20document.body.removeChild(textarea)%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20copiedName.value%20%3D%20name%5Cn%20%20%20%20TinyModal.message(%7B%5Cn%20%20%20%20%20%20message%3A%20%60%24%7Bname%7D%20%E5%9B%BE%E6%A0%87%E5%B7%B2%E5%A4%8D%E5%88%B6%60%2C%5Cn%20%20%20%20%20%20status%3A%20'success'%2C%5Cn%20%20%20%20%20%20duration%3A%202000%2C%5Cn%20%20%20%20%7D)%5Cn%5Cn%20%20%20%20if%20(resetTimer)%20%7B%5Cn%20%20%20%20%20%20clearTimeout(resetTimer)%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20resetTimer%20%3D%20setTimeout(()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20copiedName.value%20%3D%20''%5Cn%20%20%20%20%7D%2C%201800)%5Cn%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20console.error('Failed%20to%20copy%20icon%20name%3A'%2C%20error)%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22icon-gallery%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22icon-gallery__toolbar%5C%22%3E%5Cn%20%20%20%20%20%20%3Clabel%20class%3D%5C%22icon-gallery__search%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cspan%20class%3D%5C%22icon-gallery__search-label%5C%22%3E%E6%90%9C%E7%B4%A2%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%3Cinput%5Cn%20%20%20%20%20%20%20%20%20%20v-model%3D%5C%22searchQuery%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20class%3D%5C%22icon-gallery__search-input%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20type%3D%5C%22text%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20placeholder%3D%5C%22%E8%BE%93%E5%85%A5%20Icon%20%E5%90%8D%E7%A7%B0%EF%BC%8C%E4%BE%8B%E5%A6%82%20IconSend%5C%22%5Cn%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22icon-gallery__meta%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cspan%3E%E5%BD%93%E5%89%8D%E5%B1%95%E7%A4%BA%20%7B%7B%20filteredCount%20%7D%7D%20%2F%20%7B%7B%20iconEntries.length%20%7D%7D%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20v-if%3D%5C%22groupedIcons.length%5C%22%20class%3D%5C%22icon-gallery__sections%5C%22%3E%5Cn%20%20%20%20%20%20%3Csection%20v-for%3D%5C%22section%20in%20groupedIcons%5C%22%20%3Akey%3D%5C%22section.title%5C%22%20class%3D%5C%22icon-gallery__section%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Ch3%20class%3D%5C%22icon-gallery__section-title%5C%22%3E%7B%7B%20section.title%20%7D%7D%3C%2Fh3%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%5Cn%20%20%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%5B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20'icon-gallery__grid'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%7B%20'icon-gallery__grid--illustration'%3A%20section.previewLayout%20%3D%3D%3D%20'illustration'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%5D%5C%22%5Cn%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20%20%20%20%20v-for%3D%5C%22icon%20in%20section.icons%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Akey%3D%5C%22icon.name%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%5B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20'icon-gallery__card'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%20'icon-gallery__card--illustration'%3A%20section.previewLayout%20%3D%3D%3D%20'illustration'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%20'icon-gallery__card--copied'%3A%20copiedName%20%3D%3D%3D%20icon.name%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%5D%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40click%3D%5C%22copyName(icon.name)%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cspan%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%5B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20'icon-gallery__icon-preview'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%20'icon-gallery__icon-preview--illustration'%3A%20section.previewLayout%20%3D%3D%3D%20'illustration'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%5D%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ccomponent%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ais%3D%5C%22icon.component%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%5B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20'icon-gallery__icon'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%20'icon-gallery__icon--illustration'%3A%20section.previewLayout%20%3D%3D%3D%20'illustration'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%5D%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cspan%20class%3D%5C%22icon-gallery__name%5C%22%3E%7B%7B%20icon.name%20%7D%7D%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Fsection%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20v-else%20class%3D%5C%22icon-gallery__empty%5C%22%3E%E6%9C%AA%E6%89%BE%E5%88%B0%E5%8C%B9%E9%85%8D%E7%9A%84%E5%9B%BE%E6%A0%87%E3%80%82%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.icon-gallery%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%2016px%3B%5Cn%7D%5Cn%5Cn.icon-gallery__toolbar%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20space-between%3B%5Cn%20%20gap%3A%2016px%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%7D%5Cn%5Cn.icon-gallery__search%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20min-width%3A%20min(100%25%2C%20320px)%3B%5Cn%7D%5Cn%5Cn.icon-gallery__search-label%20%7B%5Cn%20%20font-size%3A%2012px%3B%5Cn%20%20font-weight%3A%20600%3B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%7D%5Cn%5Cn.icon-gallery__search-input%20%7B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20padding%3A%209px%2012px%3B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider)%3B%5Cn%20%20border-radius%3A%208px%3B%5Cn%20%20background%3A%20var(--vp-c-bg)%3B%5Cn%20%20color%3A%20var(--vp-c-text-1)%3B%5Cn%20%20transition%3A%5Cn%20%20%20%20border-color%200.2s%20ease%2C%5Cn%20%20%20%20box-shadow%200.2s%20ease%3B%5Cn%7D%5Cn%5Cn.icon-gallery__search-input%3Afocus%20%7B%5Cn%20%20outline%3A%20none%3B%5Cn%20%20border-color%3A%20%231476ff%3B%5Cn%20%20box-shadow%3A%200%200%200%203px%20color-mix(in%20srgb%2C%20%231476ff%2018%25%2C%20transparent)%3B%5Cn%7D%5Cn%5Cn.icon-gallery__meta%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%204px%3B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%20%20line-height%3A%201.6%3B%5Cn%20%20text-align%3A%20right%3B%5Cn%7D%5Cn%5Cn.icon-gallery__sections%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%2020px%3B%5Cn%7D%5Cn%5Cn.icon-gallery__section%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%7D%5Cn%5Cn.icon-gallery__section-title%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20padding-bottom%3A%2010px%3B%5Cn%20%20border-bottom%3A%201px%20solid%20var(--vp-c-divider)%3B%5Cn%20%20font-size%3A%2020px%3B%5Cn%20%20font-weight%3A%20500%3B%5Cn%20%20line-height%3A%201.4%3B%5Cn%20%20color%3A%20var(--vp-c-text-1)%3B%5Cn%7D%5Cn%5Cn.icon-gallery__grid%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20grid-template-columns%3A%20repeat(auto-fill%2C%20minmax(132px%2C%201fr))%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%7D%5Cn%5Cn.icon-gallery__grid--illustration%20%7B%5Cn%20%20grid-template-columns%3A%20repeat(auto-fill%2C%20minmax(240px%2C%201fr))%3B%5Cn%7D%5Cn%5Cn.icon-gallery__card%20%7B%5Cn%20%20position%3A%20relative%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%20%20min-height%3A%20112px%3B%5Cn%20%20padding%3A%2016px%2012px%3B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider)%3B%5Cn%20%20border-radius%3A%208px%3B%5Cn%20%20background%3A%20var(--vp-c-bg)%3B%5Cn%20%20color%3A%20var(--vp-c-text-1)%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%20%20transition%3A%5Cn%20%20%20%20background-color%200.18s%20ease%2C%5Cn%20%20%20%20border-color%200.18s%20ease%2C%5Cn%20%20%20%20color%200.18s%20ease%3B%5Cn%7D%5Cn%5Cn.icon-gallery__card--illustration%20%7B%5Cn%20%20align-items%3A%20stretch%3B%5Cn%20%20justify-content%3A%20flex-start%3B%5Cn%20%20min-height%3A%20220px%3B%5Cn%7D%5Cn%5Cn.icon-gallery__card--copied%20%7B%5Cn%20%20border-color%3A%20color-mix(in%20srgb%2C%20%231476ff%2048%25%2C%20var(--vp-c-divider))%3B%5Cn%20%20background%3A%20color-mix(in%20srgb%2C%20%231476ff%207%25%2C%20var(--vp-c-bg))%3B%5Cn%20%20box-shadow%3A%200%200%200%202px%20color-mix(in%20srgb%2C%20%231476ff%2014%25%2C%20transparent)%3B%5Cn%7D%5Cn%5Cn.icon-gallery__card%3Ahover%20%7B%5Cn%20%20background%3A%20var(--vp-c-bg-soft)%3B%5Cn%7D%5Cn%5Cn.icon-gallery__card%3Afocus-visible%20%7B%5Cn%20%20outline%3A%20none%3B%5Cn%20%20border-color%3A%20%231476ff%3B%5Cn%20%20box-shadow%3A%200%200%200%203px%20color-mix(in%20srgb%2C%20%231476ff%2018%25%2C%20transparent)%3B%5Cn%7D%5Cn%5Cn.icon-gallery__icon-preview%20%7B%5Cn%20%20display%3A%20inline-flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%20%20width%3A%2044px%3B%5Cn%20%20height%3A%2044px%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20transition%3A%5Cn%20%20%20%20background-color%200.18s%20ease%2C%5Cn%20%20%20%20color%200.18s%20ease%3B%5Cn%7D%5Cn%5Cn.icon-gallery__icon-preview--illustration%20%7B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20height%3A%20132px%3B%5Cn%20%20padding%3A%2012px%3B%5Cn%20%20overflow%3A%20hidden%3B%5Cn%7D%5Cn%5Cn.icon-gallery__icon%20%7B%5Cn%20%20font-size%3A%2024px%3B%5Cn%20%20transition%3A%20all%200.4s%3B%5Cn%20%20transform-origin%3A%20center%3B%5Cn%7D%5Cn%5Cn.icon-gallery__icon--illustration%20%7B%5Cn%20%20max-width%3A%20100%25%3B%5Cn%20%20max-height%3A%20100%25%3B%5Cn%20%20width%3A%20auto%3B%5Cn%20%20height%3A%20auto%3B%5Cn%20%20font-size%3A%2016px%3B%5Cn%7D%5Cn%5Cn.icon-gallery__icon%3Ahover%20%7B%5Cn%20%20transform%3A%20scale(1.5)%3B%5Cn%7D%5Cn%5Cn.icon-gallery__icon--illustration%3Ahover%20%7B%5Cn%20%20transform%3A%20none%3B%5Cn%7D%5Cn%5Cn.icon-gallery__name%20%7B%5Cn%20%20font-size%3A%2012px%3B%5Cn%20%20line-height%3A%201.5%3B%5Cn%20%20text-align%3A%20center%3B%5Cn%20%20word-break%3A%20break-word%3B%5Cn%7D%5Cn%5Cn.icon-gallery__empty%20%7B%5Cn%20%20padding%3A%2028px%2016px%3B%5Cn%20%20border%3A%201px%20dashed%20var(--vp-c-divider)%3B%5Cn%20%20border-radius%3A%208px%3B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%20%20text-align%3A%20center%3B%5Cn%20%20background%3A%20var(--vp-c-bg)%3B%5Cn%7D%5Cn%5Cn%40media%20(max-width%3A%20640px)%20%7B%5Cn%20%20.icon-gallery__meta%20%7B%5Cn%20%20%20%20text-align%3A%20left%3B%5Cn%20%20%7D%5Cn%5Cn%20%20.icon-gallery__section-title%20%7B%5Cn%20%20%20%20font-size%3A%2018px%3B%5Cn%20%20%7D%5Cn%5Cn%20%20.icon-gallery__grid%20%7B%5Cn%20%20%20%20grid-template-columns%3A%20repeat(2%2C%20minmax(0%2C%201fr))%3B%5Cn%20%20%7D%5Cn%5Cn%20%20.icon-gallery__grid--illustration%20%7B%5Cn%20%20%20%20grid-template-columns%3A%201fr%3B%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22iconMeta.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ficons%2FiconMeta.ts%22%2C%22code%22%3A%22export%20const%20uncategorizedTitle%20%3D%20'%E6%9C%AA%E5%88%86%E7%B1%BB'%5Cn%5Cnexport%20interface%20IconCategoryGroup%20%7B%5Cn%20%20title%3A%20string%5Cn%20%20keywords%3A%20string%5B%5D%5Cn%20%20icons%3A%20string%5B%5D%5Cn%20%20previewLayout%3F%3A%20'regular'%20%7C%20'illustration'%5Cn%7D%5Cn%5Cn%2F%2F%20%E5%85%BC%E5%AE%B9%E6%97%A7%E7%89%88%E5%AF%BC%E5%87%BA%E5%90%8D%E4%BB%85%E7%94%A8%E4%BA%8E%E5%B9%B3%E6%BB%91%E5%8D%87%E7%BA%A7%EF%BC%8C%E4%B8%8D%E5%9C%A8%E5%9B%BE%E6%A0%87%E6%96%87%E6%A1%A3%E4%B8%AD%E5%B1%95%E7%A4%BA%E3%80%82%5Cnexport%20const%20compatibilityAliasIconNames%20%3D%20new%20Set%3Cstring%3E(%5B%5Cn%20%20'IconAccessory'%2C%5Cn%20%20'IconCancelFullScreen'%2C%5Cn%20%20'IconClear'%2C%5Cn%20%20'IconFullScreen'%2C%5Cn%20%20'IconImageLoading'%2C%5Cn%20%20'IconMenu'%2C%5Cn%20%20'IconMenu2'%2C%5Cn%5D)%5Cn%5Cnexport%20const%20hiddenIconNames%20%3D%20new%20Set%3Cstring%3E(compatibilityAliasIconNames)%5Cn%5Cnexport%20const%20iconCategoryGroups%3A%20IconCategoryGroup%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20title%3A%20'%E4%BC%9A%E8%AF%9D%E4%B8%8E%20AI'%2C%5Cn%20%20%20%20keywords%3A%20%5B'%E4%BC%9A%E8%AF%9D'%2C%20'chat'%2C%20'conversation'%2C%20'assistant'%2C%20'ai'%2C%20'robot'%5D%2C%5Cn%20%20%20%20icons%3A%20%5B%5Cn%20%20%20%20%20%20'IconAgent'%2C%5Cn%20%20%20%20%20%20'IconConsultation'%2C%5Cn%20%20%20%20%20%20'IconThink'%2C%5Cn%20%20%20%20%20%20'IconGenerativeUi'%2C%5Cn%20%20%20%20%20%20'IconHistory'%2C%5Cn%20%20%20%20%20%20'IconNewSession'%2C%5Cn%20%20%20%20%20%20'IconRecordingWave'%2C%5Cn%20%20%20%20%20%20'IconSend'%2C%5Cn%20%20%20%20%20%20'IconSparkles'%2C%5Cn%20%20%20%20%20%20'IconStop'%2C%5Cn%20%20%20%20%20%20'IconVoice'%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20title%3A%20'%E5%AF%BC%E8%88%AA%E4%B8%8E%E5%B8%83%E5%B1%80'%2C%5Cn%20%20%20%20keywords%3A%20%5B'%E5%AF%BC%E8%88%AA'%2C%20'layout'%2C%20'navigation'%2C%20'arrow'%2C%20'menu'%5D%2C%5Cn%20%20%20%20icons%3A%20%5B%5Cn%20%20%20%20%20%20'IconArrowDown'%2C%5Cn%20%20%20%20%20%20'IconArrowLeft'%2C%5Cn%20%20%20%20%20%20'IconArrowRight'%2C%5Cn%20%20%20%20%20%20'IconArrowUp'%2C%5Cn%20%20%20%20%20%20'IconCollapseLeft'%2C%5Cn%20%20%20%20%20%20'IconCollapseRight'%2C%5Cn%20%20%20%20%20%20'IconEnterFullScreen'%2C%5Cn%20%20%20%20%20%20'IconExitFullScreen'%2C%5Cn%20%20%20%20%20%20'IconMenuCollapse'%2C%5Cn%20%20%20%20%20%20'IconMenuExpand'%2C%5Cn%20%20%20%20%20%20'IconMore'%2C%5Cn%20%20%20%20%20%20'IconMoreCircle'%2C%5Cn%20%20%20%20%20%20'IconRefresh'%2C%5Cn%20%20%20%20%20%20'IconSearch'%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20title%3A%20'%E8%AF%AD%E4%B9%89%E7%8A%B6%E6%80%81'%2C%5Cn%20%20%20%20keywords%3A%20%5B'%E8%AF%AD%E4%B9%89'%2C%20'semantic'%2C%20'status'%2C%20'success'%2C%20'warning'%2C%20'error'%2C%20'info'%5D%2C%5Cn%20%20%20%20icons%3A%20%5B'IconSelected'%2C%20'IconSuccess'%2C%20'IconWarning'%2C%20'IconSuccessFilled'%2C%20'IconErrorFilled'%2C%20'IconInfoFilled'%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20title%3A%20'%E7%8A%B6%E6%80%81%E4%B8%8E%E9%80%89%E6%8B%A9'%2C%5Cn%20%20%20%20keywords%3A%20%5B'%E7%8A%B6%E6%80%81'%2C%20'status'%2C%20'selection'%2C%20'feedback'%2C%20'result'%5D%2C%5Cn%20%20%20%20icons%3A%20%5B%5Cn%20%20%20%20%20%20'IconCancelled'%2C%5Cn%20%20%20%20%20%20'IconCheck'%2C%5Cn%20%20%20%20%20%20'IconClose'%2C%5Cn%20%20%20%20%20%20'IconDislike'%2C%5Cn%20%20%20%20%20%20'IconDislikeFilled'%2C%5Cn%20%20%20%20%20%20'IconError'%2C%5Cn%20%20%20%20%20%20'IconInfo'%2C%5Cn%20%20%20%20%20%20'IconLike'%2C%5Cn%20%20%20%20%20%20'IconLikeFilled'%2C%5Cn%20%20%20%20%20%20'IconLoading'%2C%5Cn%20%20%20%20%20%20'IconUnselected'%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20title%3A%20'%E6%96%87%E4%BB%B6%E4%B8%8E%E4%B8%8A%E4%BC%A0'%2C%5Cn%20%20%20%20keywords%3A%20%5B'%E6%96%87%E4%BB%B6'%2C%20'file'%2C%20'attachment'%2C%20'upload'%2C%20'image'%5D%2C%5Cn%20%20%20%20icons%3A%20%5B%5Cn%20%20%20%20%20%20'IconFileExcel'%2C%5Cn%20%20%20%20%20%20'IconFileFolder'%2C%5Cn%20%20%20%20%20%20'IconFileImage'%2C%5Cn%20%20%20%20%20%20'IconFileNone'%2C%5Cn%20%20%20%20%20%20'IconFileOther'%2C%5Cn%20%20%20%20%20%20'IconFilePdf'%2C%5Cn%20%20%20%20%20%20'IconFilePpt'%2C%5Cn%20%20%20%20%20%20'IconFileRemove'%2C%5Cn%20%20%20%20%20%20'IconFileWord'%2C%5Cn%20%20%20%20%20%20'IconImageUpload'%2C%5Cn%20%20%20%20%20%20'IconImageWarning'%2C%5Cn%20%20%20%20%20%20'IconRiskyImage'%2C%5Cn%20%20%20%20%20%20'IconUpload'%2C%5Cn%20%20%20%20%20%20'IconUploadFailed'%2C%5Cn%20%20%20%20%20%20'IconUploadLoading'%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20title%3A%20'%E7%BC%96%E8%BE%91%E4%B8%8E%E6%93%8D%E4%BD%9C'%2C%5Cn%20%20%20%20keywords%3A%20%5B'%E7%BC%96%E8%BE%91'%2C%20'edit'%2C%20'action'%2C%20'operation'%5D%2C%5Cn%20%20%20%20icons%3A%20%5B%5Cn%20%20%20%20%20%20'IconCopy'%2C%5Cn%20%20%20%20%20%20'IconDelete'%2C%5Cn%20%20%20%20%20%20'IconDownload'%2C%5Cn%20%20%20%20%20%20'IconEdit'%2C%5Cn%20%20%20%20%20%20'IconEditPen'%2C%5Cn%20%20%20%20%20%20'IconExit'%2C%5Cn%20%20%20%20%20%20'IconFavorite'%2C%5Cn%20%20%20%20%20%20'IconPin'%2C%5Cn%20%20%20%20%20%20'IconPlus'%2C%5Cn%20%20%20%20%20%20'IconScan'%2C%5Cn%20%20%20%20%20%20'IconShare'%2C%5Cn%20%20%20%20%20%20'IconTop'%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20title%3A%20'%E7%B3%BB%E7%BB%9F%E4%B8%8E%E8%83%BD%E5%8A%9B'%2C%5Cn%20%20%20%20keywords%3A%20%5B'%E7%B3%BB%E7%BB%9F'%2C%20'system'%2C%20'capability'%2C%20'plugin'%2C%20'shell'%2C%20'user'%2C%20'setting'%5D%2C%5Cn%20%20%20%20icons%3A%20%5B%5Cn%20%20%20%20%20%20'IconAnalytics'%2C%5Cn%20%20%20%20%20%20'IconAssociate'%2C%5Cn%20%20%20%20%20%20'IconAtom'%2C%5Cn%20%20%20%20%20%20'IconBell'%2C%5Cn%20%20%20%20%20%20'IconBrowser'%2C%5Cn%20%20%20%20%20%20'IconControls'%2C%5Cn%20%20%20%20%20%20'IconPhone'%2C%5Cn%20%20%20%20%20%20'IconPlugin'%2C%5Cn%20%20%20%20%20%20'IconSetting'%2C%5Cn%20%20%20%20%20%20'IconShell'%2C%5Cn%20%20%20%20%20%20'IconTable'%2C%5Cn%20%20%20%20%20%20'IconTypeAll'%2C%5Cn%20%20%20%20%20%20'IconUser'%2C%5Cn%20%20%20%20%20%20'IconVideo'%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20title%3A%20'%E5%93%81%E7%89%8C'%2C%5Cn%20%20%20%20keywords%3A%20%5B'%E5%93%81%E7%89%8C'%2C%20'brand'%2C%20'logo'%5D%2C%5Cn%20%20%20%20icons%3A%20%5B%5Cn%20%20%20%20%20%20'IconLogo'%2C%5Cn%20%20%20%20%20%20'IconAi'%2C%5Cn%20%20%20%20%20%20'IconOpenai'%2C%5Cn%20%20%20%20%20%20'IconClaude'%2C%5Cn%20%20%20%20%20%20'IconDeepseek'%2C%5Cn%20%20%20%20%20%20'IconGemini'%2C%5Cn%20%20%20%20%20%20'IconBailian'%2C%5Cn%20%20%20%20%20%20'IconModelscope'%2C%5Cn%20%20%20%20%20%20'IconOpenrouter'%2C%5Cn%20%20%20%20%20%20'IconOllama'%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20title%3A%20'%E6%8F%92%E7%94%BB%E4%B8%8E%E5%9C%BA%E6%99%AF%E6%80%81'%2C%5Cn%20%20%20%20keywords%3A%20%5B'%E6%8F%92%E7%94%BB'%2C%20'illustration'%2C%20'scene'%2C%20'empty'%5D%2C%5Cn%20%20%20%20previewLayout%3A%20'illustration'%2C%5Cn%20%20%20%20icons%3A%20%5B'IconEmptyFile'%2C%20'IconEmptySearch'%2C%20'IconNoData'%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnexport%20interface%20IconMetadata%20%7B%5Cn%20%20category%3A%20string%5Cn%20%20keywords%3A%20string%5B%5D%5Cn%20%20previewLayout%3A%20'regular'%20%7C%20'illustration'%5Cn%7D%5Cn%5Cnexport%20const%20iconMetadataMap%20%3D%20new%20Map%3Cstring%2C%20IconMetadata%3E(%5Cn%20%20iconCategoryGroups.flatMap((%7B%20title%2C%20keywords%2C%20icons%2C%20previewLayout%20%3D%20'regular'%20%7D)%20%3D%3E%5Cn%20%20%20%20icons.map((name)%20%3D%3E%20%5Bname%2C%20%7B%20category%3A%20title%2C%20keywords%2C%20previewLayout%20%7D%5D)%2C%5Cn%20%20)%2C%5Cn)%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[3]||(n[3]=()=>{i.value=!1}),vueCode:o(E)},u({_:2},[B.value?{name:"vue",fn:r(()=>[e(o(B))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[11]||(n[11]=A('<h2 id="常用属性" tabindex="-1">常用属性 <a class="header-anchor" href="#常用属性" aria-label="Permalink to &quot;常用属性&quot;">​</a></h2><p>常规图标默认以 <code>1em</code> 渲染，插画型图标保留原始尺寸，可按下面方式控制样式：</p><table tabindex="0"><thead><tr><th>属性</th><th>说明</th><th>默认</th></tr></thead><tbody><tr><td><code>font-size</code></td><td>控制常规图标整体尺寸</td><td>继承当前字号</td></tr><tr><td><code>color</code></td><td>控制使用 <code>currentColor</code> 的单色图标颜色</td><td>跟随当前颜色</td></tr><tr><td><code>width</code> / <code>height</code></td><td>显式指定展示尺寸，插画型图标更常用</td><td>未设置时使用图标默认尺寸</td></tr><tr><td><code>class</code> / <code>style</code></td><td>追加自定义样式</td><td><code>-</code></td></tr></tbody></table><h2 id="兼容导出说明" tabindex="-1">兼容导出说明 <a class="header-anchor" href="#兼容导出说明" aria-label="Permalink to &quot;兼容导出说明&quot;">​</a></h2><p>本版本保留了一组旧图标名的兼容导出，便于平滑升级；这些旧名会在下个版本移除，建议尽快切换到新名字：</p><ul><li><code>IconAccessory</code> -&gt; <code>IconUpload</code></li><li><code>IconClear</code> -&gt; <code>IconClose</code></li><li><code>IconFullScreen</code> -&gt; <code>IconEnterFullScreen</code></li><li><code>IconCancelFullScreen</code> -&gt; <code>IconExitFullScreen</code></li><li><code>IconImageLoading</code> -&gt; <code>IconUploadLoading</code></li><li><code>IconMenu</code> -&gt; <code>IconMoreCircle</code></li><li><code>IconMenu2</code> -&gt; <code>IconMore</code></li></ul>',6))])}}});export{z as __pageData,W as default};
