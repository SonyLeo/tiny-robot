const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/IconGallery.Bk0NQLnU.js","assets/chunks/framework.PlJNRFak.js","assets/chunks/theme.8jYHNq6I.js","assets/chunks/BasicUsage.DnVcPJ7U.js"])))=>i.map(i=>d[i]);
import{aD as r,bQ as p,aZ as E,aL as _,v as b,H as d,bL as h,bB as k,J as i,bk as e,bJ as t,G as g,b7 as y,aU as v}from"./chunks/framework.PlJNRFak.js";import{L as u,N as m}from"./chunks/index.DQFFYRhS.js";const f=`<script setup lang="ts">
import { computed, shallowRef } from 'vue'
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
        <span v-if="copiedName">已复制 {{ copiedName }}</span>
        <span v-else>点击卡片可复制图标名称</span>
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
`,x=`<script setup lang="ts">
import { h, shallowRef } from 'vue'
import { TrHistory, TrIconButton } from '@opentiny/tiny-robot'
import {
  IconAi,
  IconCheck,
  IconCopy,
  IconDelete,
  IconNewSession,
  IconRefresh,
  IconSearch,
  IconSparkles,
} from '@opentiny/tiny-robot-svgs'

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
  <div class="icon-basic-demo">
    <section class="icon-basic-demo__card">
      <h3 class="icon-basic-demo__title">直接渲染</h3>
      <p class="icon-basic-demo__desc">图标可以像普通 Vue 组件一样直接使用。</p>
      <div class="icon-basic-demo__row">
        <IconAi class="icon-basic-demo__icon icon-basic-demo__icon--xl" />
        <IconSparkles class="icon-basic-demo__icon icon-basic-demo__icon--brand" />
        <IconSearch class="icon-basic-demo__icon icon-basic-demo__icon--muted" />
      </div>
    </section>

    <section class="icon-basic-demo__card">
      <h3 class="icon-basic-demo__title">作为 props 传递</h3>
      <p class="icon-basic-demo__desc">适合 \`TrIconButton\`、\`History\`、\`Feedback\` 等支持 icon 属性的组件。</p>
      <div class="icon-basic-demo__row">
        <TrIconButton size="34" svg-size="18" :icon="IconNewSession" />
        <TrIconButton size="34" svg-size="18" :icon="IconRefresh" />
        <TrIconButton size="34" svg-size="18" :icon="IconSearch" />
      </div>
    </section>

    <section class="icon-basic-demo__card icon-basic-demo__card--wide">
      <h3 class="icon-basic-demo__title">作为 VNode 传递</h3>
      <p class="icon-basic-demo__desc">在需要 VNode 的场景中，可以通过 \`h(IconXxx)\` 组装图标节点。</p>
      <TrHistory :data="historyItems" :selected="selectedId" @item-click="handleItemClick" />
    </section>
  </div>
</template>

<style scoped>
.icon-basic-demo {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.icon-basic-demo__card {
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}

.icon-basic-demo__card--wide {
  grid-column: 1 / -1;
}

.icon-basic-demo__title {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
}

.icon-basic-demo__desc {
  margin: 0 0 14px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}

.icon-basic-demo__row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.icon-basic-demo__icon {
  font-size: 20px;
}

.icon-basic-demo__icon--xl {
  font-size: 30px;
}

.icon-basic-demo__icon--brand {
  font-size: 24px;
  color: #1476ff;
}

.icon-basic-demo__icon--muted {
  font-size: 18px;
  color: #5b6b82;
}

@media (max-width: 768px) {
  .icon-basic-demo {
    grid-template-columns: 1fr;
  }

  .icon-basic-demo__card--wide {
    grid-column: auto;
  }
}
</style>
`,B=JSON.parse('{"title":"SVG 图标","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"icons/index.md","filePath":"icons/index.md"}'),F={name:"icons/index.md"},A=Object.assign(F,{setup(I){const o=y();r(async()=>{o.value=(await p(async()=>{const{default:a}=await import("./chunks/IconGallery.Bk0NQLnU.js");return{default:a}},__vite__mapDeps([0,1,2]))).default});const s=v(!0),l=y();return r(async()=>{l.value=(await p(async()=>{const{default:a}=await import("./chunks/BasicUsage.DnVcPJ7U.js");return{default:a}},__vite__mapDeps([3,2,1]))).default}),(a,n)=>{const c=E("ClientOnly");return _(),b("div",null,[n[2]||(n[2]=d('<h1 id="svg-图标" tabindex="-1">SVG 图标 <a class="header-anchor" href="#svg-图标" aria-label="Permalink to &quot;SVG 图标&quot;">​</a></h1><p><code>@opentiny/tiny-robot-svgs</code> 是 TinyRobot 的独立图标包。包内图标由 SVG 资源统一生成 Vue 组件，既可以单独安装使用，也可以和 <code>@opentiny/tiny-robot</code> 组合使用。</p><h2 id="安装" tabindex="-1">安装 <a class="header-anchor" href="#安装" aria-label="Permalink to &quot;安装&quot;">​</a></h2><div class="vp-code-group vp-adaptive-theme"><div class="tabs"><input type="radio" name="group-Wohu4" id="tab-GeI8LdV" checked><label data-title="pnpm" for="tab-GeI8LdV">pnpm</label><input type="radio" name="group-Wohu4" id="tab-3l9GZ1V"><label data-title="yarn" for="tab-3l9GZ1V">yarn</label><input type="radio" name="group-Wohu4" id="tab-OipbSHp"><label data-title="npm" for="tab-OipbSHp">npm</label></div><div class="blocks"><div class="language-bash vp-adaptive-theme active"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pnpm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot-svgs</span></span></code></pre></div><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">yarn</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot-svgs</span></span></code></pre></div><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot-svgs</span></span></code></pre></div></div></div><h2 id="基本用法" tabindex="-1">基本用法 <a class="header-anchor" href="#基本用法" aria-label="Permalink to &quot;基本用法&quot;">​</a></h2><p>图标包中的每一个导出都是 Vue 组件，可以像普通组件一样直接渲染，也可以作为 props 或 VNode 传递给其他 TinyRobot 组件。</p>',6)),h(i(e(u),null,null,512),[[k,s.value]]),i(c,null,{default:t(()=>[i(e(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[0]||(n[0]=()=>{s.value=!1}),vueCode:e(x)},g({_:2},[l.value?{name:"vue",fn:t(()=>[i(e(l))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[3]||(n[3]=d(`<p>常见用法有 3 种：</p><ol><li>直接在模板中渲染：<code>&lt;IconAi /&gt;</code></li><li>作为组件 props 传递：<code>&lt;TrIconButton :icon=&quot;IconNewSession&quot; /&gt;</code></li><li>在需要 VNode 的场景中，使用 <code>h(IconCheck, { style: { fontSize: &#39;16px&#39; } })</code></li></ol><h3 id="直接引入与渲染" tabindex="-1">直接引入与渲染 <a class="header-anchor" href="#直接引入与渲染" aria-label="Permalink to &quot;直接引入与渲染&quot;">​</a></h3><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> setup</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> lang</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ts&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { IconAi, IconSparkles } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot-svgs&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">IconAi</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> :style</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;{ fontSize: &#39;28px&#39; }&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">IconSparkles</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> :style</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;{ fontSize: &#39;20px&#39;, color: &#39;#1476ff&#39; }&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><h3 id="作为组件-props-传递" tabindex="-1">作为组件 props 传递 <a class="header-anchor" href="#作为组件-props-传递" aria-label="Permalink to &quot;作为组件 props 传递&quot;">​</a></h3><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> setup</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> lang</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ts&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { TrIconButton } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { IconNewSession } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot-svgs&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrIconButton</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> size</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;32&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> svg-size</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;18&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> :icon</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;IconNewSession&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><h3 id="作为-vnode-传递" tabindex="-1">作为 VNode 传递 <a class="header-anchor" href="#作为-vnode-传递" aria-label="Permalink to &quot;作为 VNode 传递&quot;">​</a></h3><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { h } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { IconCheck } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot-svgs&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> item</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  id: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;1&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  title: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;已选中会话&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  icon: </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">h</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(IconCheck, { style: { fontSize: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;16px&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> } }),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="样式与命名" tabindex="-1">样式与命名 <a class="header-anchor" href="#样式与命名" aria-label="Permalink to &quot;样式与命名&quot;">​</a></h2><ul><li>所有公开图标均以 <code>Icon</code> 作为前缀，例如 <code>IconSend</code>、<code>IconHistory</code>、<code>IconPlugin</code>。</li><li>图标尺寸建议通过 <code>fontSize</code>、<code>width</code> 或 <code>height</code> 控制。</li><li>图标颜色可优先通过 <code>color</code> 或 <code>fill</code> 调整，具体效果取决于 SVG 本身的配色方式。</li><li>本页下面的图标集合基于 <code>@opentiny/tiny-robot-svgs</code> 的公共导出生成。</li><li>插画型和场景态图标会在独立分组中展示，并使用单独的预览尺寸，避免影响常用图标浏览体验。</li></ul><h3 id="兼容导出说明" tabindex="-1">兼容导出说明 <a class="header-anchor" href="#兼容导出说明" aria-label="Permalink to &quot;兼容导出说明&quot;">​</a></h3><p>本版本保留了一组旧图标名的兼容导出，便于平滑升级；这些旧名会在下个版本移除，建议尽快切换到新名字：</p><ul><li><code>IconAccessory</code> -&gt; <code>IconUpload</code></li><li><code>IconClear</code> -&gt; <code>IconClose</code></li><li><code>IconFullScreen</code> -&gt; <code>IconEnterFullScreen</code></li><li><code>IconCancelFullScreen</code> -&gt; <code>IconExitFullScreen</code></li><li><code>IconImageLoading</code> -&gt; <code>IconUploadLoading</code></li><li><code>IconMenu</code> -&gt; <code>IconMoreCircle</code></li><li><code>IconMenu2</code> -&gt; <code>IconMore</code></li></ul><h2 id="图标集合" tabindex="-1">图标集合 <a class="header-anchor" href="#图标集合" aria-label="Permalink to &quot;图标集合&quot;">​</a></h2><p>图标集合按常用场景分类展示，支持按图标名、分类名和关键词筛选；点击图标卡片可以快速复制图标名称。</p>`,15)),h(i(e(u),null,null,512),[[k,s.value]]),i(c,null,{default:t(()=>[i(e(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[1]||(n[1]=()=>{s.value=!1}),vueCode:e(f)},g({_:2},[o.value?{name:"vue",fn:t(()=>[i(e(o))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1})])}}});export{B as __pageData,A as default};
