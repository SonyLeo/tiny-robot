const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/slots.DUbHvk4c.js","assets/chunks/theme.BUuPtz-0.js","assets/chunks/framework.CV5uswMq.js","assets/chunks/variants.B0O5OWwB.js","assets/chunks/demo-models.wU03hjX4.js","assets/chunks/controlled.yvPI_wRl.js","assets/chunks/basic.Bjifa1u8.js"])))=>i.map(i=>d[i]);
import{aD as d,bQ as r,aZ as f,aL as A,v as u,H as l,bL as p,bB as h,J as s,bk as t,bJ as a,G as c,b7 as k,aU as B}from"./chunks/framework.CV5uswMq.js";import{L as C,N as g}from"./chunks/index.UKYjhuGV.js";const v=`<script setup lang="ts">
import { shallowRef } from 'vue'
import {
  TrModelSelector,
  type ModelSelectorEffortValue,
  type ModelSelectorEffortOption,
  type ModelSelectorFilterMethod,
  type ModelSelectorOption,
  type ModelSelectorValue,
} from '@opentiny/tiny-robot'
import { IconBailian, IconDeepseek } from '@opentiny/tiny-robot-svgs'

const providerBases = {
  deepseek: {
    icon: IconDeepseek,
    group: 'deepseek-v4',
    groupLabel: 'DeepSeek V4',
  },
  qwen: {
    icon: IconBailian,
    group: 'qwen',
    groupLabel: 'Qwen',
  },
} as const

const modelRows = [
  {
    provider: 'deepseek',
    value: 'deepseek-v4-pro',
    label: 'DeepSeek V4 Pro',
    description: '预览版 · 1M 上下文 · 最大输出 384K',
    keywords: ['preview', '推理', 'reasoning', 'agent', '代码'],
    efforts: [
      ['high', 'High'],
      ['max', 'Max'],
    ],
  },
  {
    provider: 'deepseek',
    value: 'deepseek-v4-flash',
    label: 'DeepSeek V4 Flash',
    description: 'V4-Flash-0731 Public Beta · 1M 上下文 · 最大输出 384K',
    keywords: ['推理', 'reasoning', '低成本'],
    efforts: [
      ['low', 'Low'],
      ['high', 'High'],
      ['max', 'Max'],
    ],
  },
  {
    provider: 'qwen',
    value: 'qwen3.8-max-preview',
    label: 'Qwen3.8 Max Preview',
    description: '需 Token Plan（本示例禁用） · 推理与视觉理解 · 1M 上下文',
    disabled: true,
    keywords: ['百炼', '通义千问', 'qwencloud', 'dashscope'],
    efforts: undefined,
  },
  {
    provider: 'qwen',
    value: 'qwen3.7-max',
    label: 'Qwen3.7 Max',
    description: '纯文本旗舰 · 1M 上下文 · 最大输出 131K',
    keywords: ['百炼', '通义千问', 'dashscope', '推理', 'reasoning', 'agent', '代码'],
    efforts: undefined,
  },
  {
    provider: 'qwen',
    value: 'qwen3.7-plus',
    label: 'Qwen3.7 Plus',
    description: '图像、文本与视频输入 · 1M 上下文 · 最大输出 131K',
    keywords: ['百炼', '通义千问', 'dashscope', '多模态', '推理', 'reasoning'],
    efforts: undefined,
  },
] as const

const models = modelRows.map(({ provider, efforts, ...row }) => ({
  ...row,
  ...providerBases[provider],
  ...(efforts
    ? {
        efforts: efforts.map(([value, label]) => ({ value, label })) satisfies readonly ModelSelectorEffortOption[],
      }
    : {}),
})) satisfies readonly ModelSelectorOption[]

const model = shallowRef<ModelSelectorValue>('deepseek-v4-flash')
const effort = shallowRef<ModelSelectorEffortValue>('high')

const filterMethod: ModelSelectorFilterMethod = (query, option) => {
  const searchText = [
    option.label,
    option.value,
    option.description,
    option.group,
    option.groupLabel,
    ...(option.keywords ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase()

  return query
    .trim()
    .toLocaleLowerCase()
    .split(/\\s+/)
    .every((keyword) => searchText.includes(keyword))
}
<\/script>

<template>
  <div class="model-selector-slots-demo">
    <h3 class="model-selector-slots-demo__title">完整插槽组合</h3>
    <TrModelSelector
      v-model="model"
      v-model:effort="effort"
      :models="models"
      :filter-method="filterMethod"
      variant="muted"
      size="large"
      placeholder="选择工作模型"
      search-placeholder="例如：推理 数学"
      content-class="model-selector-slots-panel"
      :content-style="{ maxHeight: '420px' }"
    >
      <template #trigger="{ option, label, open, effortOption }">
        <span class="model-selector-slots-demo__trigger">
          <component
            :is="option?.icon"
            v-if="option?.icon"
            class="model-selector-slots-demo__trigger-icon"
            aria-hidden="true"
            focusable="false"
          />
          <span class="model-selector-slots-demo__trigger-copy">
            <span class="model-selector-slots-demo__trigger-meta">
              工作模型{{ effortOption ? \` · \${effortOption.label}\` : '' }}
            </span>
            <span class="model-selector-slots-demo__trigger-label">{{ label }}</span>
          </span>
          <span class="model-selector-slots-demo__trigger-state" aria-hidden="true">
            {{ open ? '收起' : '切换' }}
          </span>
        </span>
      </template>

      <template #panel-header="{ query, close }">
        <div class="model-selector-slots-demo__panel-heading">
          <span class="model-selector-slots-demo__panel-copy">
            <strong>选择工作模型</strong>
            <small class="model-selector-slots-demo__panel-hint">
              {{ query ? \`正在筛选：\${query}\` : '可以按厂商、能力或关键词搜索' }}
            </small>
          </span>
          <button type="button" class="model-selector-slots-demo__close" @click="close">关闭</button>
        </div>
      </template>

      <template #group-label="{ label, models: groupModels }">
        <span class="model-selector-slots-demo__group-label">
          <span>{{ label }}</span>
          <span>{{ groupModels.length }} 项</span>
        </span>
      </template>

      <template #item="{ option, selected, highlighted, disabled }">
        <span class="model-selector-slots-demo__item">
          <span class="model-selector-slots-demo__item-main">
            <component
              :is="option.icon"
              v-if="option.icon"
              class="model-selector-slots-demo__item-icon"
              aria-hidden="true"
              focusable="false"
            />
            <span class="model-selector-slots-demo__item-copy">
              <span class="model-selector-slots-demo__item-label">{{ option.label }}</span>
              <span class="model-selector-slots-demo__item-description">{{ option.description }}</span>
            </span>
          </span>
          <span class="model-selector-slots-demo__item-state" aria-hidden="true">
            {{ disabled ? '不可用' : selected ? '当前' : highlighted ? 'Enter 选择' : '' }}
          </span>
        </span>
      </template>

      <template #empty="{ query }">
        <span class="model-selector-slots-demo__empty">
          <strong>没有找到“{{ query }}”</strong>
          <small class="model-selector-slots-demo__empty-hint">尝试厂商名、模型名或能力关键词。</small>
        </span>
      </template>

      <template #footer="{ close, efforts, effort: activeEffort, effortOption, setEffort }">
        <div class="model-selector-slots-demo__footer">
          <div class="model-selector-slots-demo__effort">
            <span class="model-selector-slots-demo__effort-label">
              Reasoning effort{{ effortOption ? \` · \${effortOption.label}\` : '' }}
            </span>
            <div
              v-if="efforts.length > 0"
              class="model-selector-slots-demo__effort-options"
              role="group"
              aria-label="推理强度"
            >
              <button
                v-for="option in efforts"
                :key="option.value"
                type="button"
                class="model-selector-slots-demo__effort-option"
                :class="{ 'is-active': activeEffort === option.value }"
                :aria-pressed="activeEffort === option.value"
                :disabled="option.disabled"
                @click="setEffort(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
            <span v-else class="model-selector-slots-demo__effort-empty">当前模型未声明推理强度</span>
          </div>
          <button type="button" class="model-selector-slots-demo__done" @click="close">完成</button>
        </div>
      </template>
    </TrModelSelector>

    <p class="model-selector-slots-demo__status" aria-live="polite">
      当前值：<code>{{ String(model) }}</code
      >；<code>v-model:effort</code> 保留值：<code>{{ String(effort) }}</code>
    </p>
  </div>
</template>

<style scoped>
.model-selector-slots-demo {
  display: grid;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}

.model-selector-slots-demo__title {
  margin: 0;
  font-size: 16px;
}

.model-selector-slots-demo__status {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}

.model-selector-slots-demo__trigger,
.model-selector-slots-demo__panel-copy,
.model-selector-slots-demo__item-main,
.model-selector-slots-demo__item-copy,
.model-selector-slots-demo__effort {
  display: inline-flex;
  min-width: 0;
}

.model-selector-slots-demo__trigger,
.model-selector-slots-demo__item-main {
  align-items: center;
  gap: 9px;
}

.model-selector-slots-demo__trigger {
  width: 100%;
}

.model-selector-slots-demo__trigger-icon,
.model-selector-slots-demo__item-icon {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
}

.model-selector-slots-demo__trigger-copy,
.model-selector-slots-demo__panel-copy,
.model-selector-slots-demo__item-copy,
.model-selector-slots-demo__effort {
  flex-direction: column;
}

.model-selector-slots-demo__trigger-copy,
.model-selector-slots-demo__panel-copy,
.model-selector-slots-demo__item-copy {
  gap: 2px;
}

.model-selector-slots-demo__trigger-meta,
.model-selector-slots-demo__item-description,
.model-selector-slots-demo__panel-hint,
.model-selector-slots-demo__effort-label,
.model-selector-slots-demo__effort-empty {
  color: var(--vp-c-text-2);
  font-size: 11px;
  line-height: 1.35;
}

.model-selector-slots-demo__trigger-label,
.model-selector-slots-demo__item-label,
.model-selector-slots-demo__item-description {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.model-selector-slots-demo__trigger-label,
.model-selector-slots-demo__item-label {
  color: var(--vp-c-text-1);
}

.model-selector-slots-demo__trigger-state,
.model-selector-slots-demo__item-state {
  flex: 0 0 auto;
  color: var(--vp-c-text-2);
  font-size: 11px;
}

.model-selector-slots-demo__panel-heading,
.model-selector-slots-demo__group-label,
.model-selector-slots-demo__item,
.model-selector-slots-demo__footer {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.model-selector-slots-demo__close,
.model-selector-slots-demo__done,
.model-selector-slots-demo__effort-option {
  border: 1px solid var(--vp-c-divider);
  border-radius: 7px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font: inherit;
}

.model-selector-slots-demo__close,
.model-selector-slots-demo__done {
  min-height: 28px;
  padding: 3px 9px;
  font-size: 12px;
}

.model-selector-slots-demo__empty {
  display: grid;
  gap: 5px;
}

.model-selector-slots-demo__empty-hint {
  color: var(--vp-c-text-2);
}

.model-selector-slots-demo__footer {
  align-items: flex-end;
}

.model-selector-slots-demo__effort {
  gap: 6px;
}

.model-selector-slots-demo__effort-options {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.model-selector-slots-demo__effort-option {
  min-width: 30px;
  min-height: 26px;
  padding: 2px 7px;
  font-size: 12px;
}

.model-selector-slots-demo__effort-option.is-active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.model-selector-slots-demo__effort-option:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

:global(.model-selector-slots-panel) {
  box-shadow: 0 16px 48px rgb(0 0 0 / 16%);
}
</style>
`,b=`<script setup lang="ts">
import { TrModelSelector } from '@opentiny/tiny-robot'
import { modelSelectorDemoModels } from './demo-models'

const models = modelSelectorDemoModels.filter((option) => !option.disabled)

const variants = [
  { label: 'outline / small', variant: 'outline' as const, size: 'small' as const, value: 'deepseek-v4-flash' },
  { label: 'ghost / normal', variant: 'ghost' as const, size: 'normal' as const, value: 'qwen3.7-plus' },
  { label: 'muted / large', variant: 'muted' as const, size: 'large' as const, value: 'qwen3.7-max' },
]
<\/script>

<template>
  <div class="model-selector-variants-demo">
    <div v-for="item in variants" :key="item.label" class="model-selector-variants-demo__item">
      <span class="model-selector-variants-demo__label">{{ item.label }}</span>
      <TrModelSelector :models="models" :default-value="item.value" :variant="item.variant" :size="item.size" />
    </div>
  </div>
</template>

<style scoped>
.model-selector-variants-demo {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 24px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}

.model-selector-variants-demo__item {
  display: flex;
  min-width: 140px;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.model-selector-variants-demo__label {
  color: var(--vp-c-text-2);
  font-size: 12px;
}
</style>
`,D=`<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrModelSelector, type ModelSelectorValue } from '@opentiny/tiny-robot'
import { modelSelectorDemoModels } from './demo-models'

const model = shallowRef<ModelSelectorValue>('qwen3.7-plus')

function setInvalidValue() {
  model.value = 'retired-model'
}

function restoreValue() {
  model.value = 'qwen3.7-plus'
}
<\/script>

<template>
  <div class="model-selector-controlled-demo">
    <div class="model-selector-controlled-demo__selector">
      <TrModelSelector v-model="model" :models="modelSelectorDemoModels" placeholder="当前值没有匹配模型" />

      <div class="model-selector-controlled-demo__actions">
        <button type="button" @click="setInvalidValue">设置不存在的值</button>
        <button type="button" @click="restoreValue">恢复有效值</button>
      </div>
    </div>

    <p class="model-selector-controlled-demo__state" aria-live="polite">
      当前值：<code>{{ model }}</code>
    </p>
  </div>
</template>

<style scoped>
.model-selector-controlled-demo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}

.model-selector-controlled-demo__selector {
  display: flex;
  gap: 8px;
}

.model-selector-controlled-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.model-selector-controlled-demo__actions button {
  padding: 5px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font-size: 12px;
}

.model-selector-controlled-demo__actions button:hover {
  border-color: var(--vp-c-brand-1);
}

.model-selector-controlled-demo__state {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
`,_=`<script setup lang="ts">
import { shallowRef } from 'vue'
import {
  TrModelSelector,
  type ModelSelectorEffortValue,
  type ModelSelectorOption,
  type ModelSelectorValue,
} from '@opentiny/tiny-robot'
import { IconBailian, IconDeepseek } from '@opentiny/tiny-robot-svgs'

const model = shallowRef<ModelSelectorValue>('deepseek-v4-flash')
const effort = shallowRef<ModelSelectorEffortValue>('high')

const models = [
  {
    value: 'deepseek-v4-flash',
    label: 'DeepSeek V4 Flash',
    icon: IconDeepseek,
    efforts: [
      { value: 'high', label: 'High' },
      { value: 'max', label: 'Max' },
    ],
  },
  {
    value: 'qwen3.7-max',
    label: 'Qwen3.7 Max',
    icon: IconBailian,
  },
] satisfies readonly ModelSelectorOption[]
<\/script>

<template>
  <div class="model-selector-basic-demo">
    <TrModelSelector v-model="model" v-model:effort="effort" :models="models" />
  </div>
</template>

<style scoped>
.model-selector-basic-demo {
  display: flex;
  min-height: 96px;
  align-items: center;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}
</style>
`,T=JSON.parse('{"title":"ModelSelector 模型选择器","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/model-selector.md","filePath":"components/model-selector.md"}'),x={name:"components/model-selector.md"},P=Object.assign(x,{setup(w){const E=k();d(async()=>{E.value=(await r(async()=>{const{default:n}=await import("./chunks/slots.DUbHvk4c.js");return{default:n}},__vite__mapDeps([0,1,2]))).default});const y=k();d(async()=>{y.value=(await r(async()=>{const{default:n}=await import("./chunks/variants.B0O5OWwB.js");return{default:n}},__vite__mapDeps([3,1,2,4]))).default});const m=k();d(async()=>{m.value=(await r(async()=>{const{default:n}=await import("./chunks/controlled.yvPI_wRl.js");return{default:n}},__vite__mapDeps([5,1,2,4]))).default});const i=B(!0),F=k();return d(async()=>{F.value=(await r(async()=>{const{default:n}=await import("./chunks/basic.Bjifa1u8.js");return{default:n}},__vite__mapDeps([6,1,2]))).default}),(n,e)=>{const o=f("ClientOnly");return A(),u("div",null,[e[4]||(e[4]=l("",8)),p(s(t(C),null,null,512),[[h,i.value]]),s(o,null,{default:a(()=>[s(t(g),{title:"基础用法",description:"最小模型数据、受控模型与推理强度，以及外部 Provider 图标。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{i.value=!1}),vueCode:t(_)},c({_:2},[F.value?{name:"vue",fn:a(()=>[s(t(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[5]||(e[5]=l("",6)),p(s(t(C),null,null,512),[[h,i.value]]),s(o,null,{default:a(()=>[s(t(g),{title:"受控选择",description:"使用 v-model 修改当前模型，并观察无效值的 placeholder 行为。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22controlled.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fmodel-selector%2Fcontrolled.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrModelSelector%2C%20type%20ModelSelectorValue%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20modelSelectorDemoModels%20%7D%20from%20'.%2Fdemo-models'%5Cn%5Cnconst%20model%20%3D%20shallowRef%3CModelSelectorValue%3E('qwen3.7-plus')%5Cn%5Cnfunction%20setInvalidValue()%20%7B%5Cn%20%20model.value%20%3D%20'retired-model'%5Cn%7D%5Cn%5Cnfunction%20restoreValue()%20%7B%5Cn%20%20model.value%20%3D%20'qwen3.7-plus'%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22model-selector-controlled-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22model-selector-controlled-demo__selector%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrModelSelector%20v-model%3D%5C%22model%5C%22%20%3Amodels%3D%5C%22modelSelectorDemoModels%5C%22%20placeholder%3D%5C%22%E5%BD%93%E5%89%8D%E5%80%BC%E6%B2%A1%E6%9C%89%E5%8C%B9%E9%85%8D%E6%A8%A1%E5%9E%8B%5C%22%20%2F%3E%5Cn%5Cn%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22model-selector-controlled-demo__actions%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cbutton%20type%3D%5C%22button%5C%22%20%40click%3D%5C%22setInvalidValue%5C%22%3E%E8%AE%BE%E7%BD%AE%E4%B8%8D%E5%AD%98%E5%9C%A8%E7%9A%84%E5%80%BC%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%20%20%3Cbutton%20type%3D%5C%22button%5C%22%20%40click%3D%5C%22restoreValue%5C%22%3E%E6%81%A2%E5%A4%8D%E6%9C%89%E6%95%88%E5%80%BC%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cp%20class%3D%5C%22model-selector-controlled-demo__state%5C%22%20aria-live%3D%5C%22polite%5C%22%3E%5Cn%20%20%20%20%20%20%E5%BD%93%E5%89%8D%E5%80%BC%EF%BC%9A%3Ccode%3E%7B%7B%20model%20%7D%7D%3C%2Fcode%3E%5Cn%20%20%20%20%3C%2Fp%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.model-selector-controlled-demo%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20align-items%3A%20flex-start%3B%5Cn%20%20gap%3A%2016px%3B%5Cn%20%20padding%3A%2020px%3B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider)%3B%5Cn%20%20border-radius%3A%2012px%3B%5Cn%20%20background%3A%20var(--vp-c-bg)%3B%5Cn%7D%5Cn%5Cn.model-selector-controlled-demo__selector%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20gap%3A%208px%3B%5Cn%7D%5Cn%5Cn.model-selector-controlled-demo__actions%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%208px%3B%5Cn%7D%5Cn%5Cn.model-selector-controlled-demo__actions%20button%20%7B%5Cn%20%20padding%3A%205px%2010px%3B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider)%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20background%3A%20var(--vp-c-bg)%3B%5Cn%20%20color%3A%20var(--vp-c-text-1)%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%7D%5Cn%5Cn.model-selector-controlled-demo__actions%20button%3Ahover%20%7B%5Cn%20%20border-color%3A%20var(--vp-c-brand-1)%3B%5Cn%7D%5Cn%5Cn.model-selector-controlled-demo__state%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22demo-models.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fmodel-selector%2Fdemo-models.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ModelSelectorEffortOption%2C%20ModelSelectorOption%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconBailian%2C%20IconDeepseek%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cn%5Cnconst%20providerBases%20%3D%20%7B%5Cn%20%20deepseek%3A%20%7B%5Cn%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20group%3A%20'DeepSeek%20V4'%2C%5Cn%20%20%7D%2C%5Cn%20%20qwen%3A%20%7B%5Cn%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20group%3A%20'Qwen'%2C%5Cn%20%20%7D%2C%5Cn%7D%20as%20const%5Cn%5Cntype%20ModelProvider%20%3D%20keyof%20typeof%20providerBases%5Cntype%20EffortRow%20%3D%20readonly%20%5Bvalue%3A%20string%2C%20label%3A%20string%5D%5Cn%5Cninterface%20ModelRow%20%7B%5Cn%20%20provider%3A%20ModelProvider%5Cn%20%20value%3A%20string%5Cn%20%20label%3A%20string%5Cn%20%20description%3A%20string%5Cn%20%20disabled%3F%3A%20boolean%5Cn%20%20keywords%3A%20readonly%20string%5B%5D%5Cn%20%20efforts%3F%3A%20readonly%20EffortRow%5B%5D%5Cn%7D%5Cn%5Cnconst%20modelRows%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20provider%3A%20'deepseek'%2C%5Cn%20%20%20%20value%3A%20'deepseek-v4-pro'%2C%5Cn%20%20%20%20label%3A%20'DeepSeek%20V4%20Pro'%2C%5Cn%20%20%20%20description%3A%20'%E9%A2%84%E8%A7%88%E7%89%88%20%C2%B7%201M%20%E4%B8%8A%E4%B8%8B%E6%96%87%20%C2%B7%20%E6%9C%80%E5%A4%A7%E8%BE%93%E5%87%BA%20384K'%2C%5Cn%20%20%20%20keywords%3A%20%5B'preview'%2C%20'%E6%8E%A8%E7%90%86'%2C%20'reasoning'%2C%20'agent'%2C%20'%E4%BB%A3%E7%A0%81'%5D%2C%5Cn%20%20%20%20efforts%3A%20%5B%5Cn%20%20%20%20%20%20%5B'high'%2C%20'High'%5D%2C%5Cn%20%20%20%20%20%20%5B'max'%2C%20'Max'%5D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20provider%3A%20'deepseek'%2C%5Cn%20%20%20%20value%3A%20'deepseek-v4-flash'%2C%5Cn%20%20%20%20label%3A%20'DeepSeek%20V4%20Flash'%2C%5Cn%20%20%20%20description%3A%20'V4-Flash-0731%20Public%20Beta%20%C2%B7%201M%20%E4%B8%8A%E4%B8%8B%E6%96%87%20%C2%B7%20%E6%9C%80%E5%A4%A7%E8%BE%93%E5%87%BA%20384K'%2C%5Cn%20%20%20%20keywords%3A%20%5B'%E6%8E%A8%E7%90%86'%2C%20'reasoning'%2C%20'%E4%BD%8E%E6%88%90%E6%9C%AC'%5D%2C%5Cn%20%20%20%20efforts%3A%20%5B%5Cn%20%20%20%20%20%20%5B'low'%2C%20'Low'%5D%2C%5Cn%20%20%20%20%20%20%5B'high'%2C%20'High'%5D%2C%5Cn%20%20%20%20%20%20%5B'max'%2C%20'Max'%5D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20provider%3A%20'qwen'%2C%5Cn%20%20%20%20value%3A%20'qwen3.8-max-preview'%2C%5Cn%20%20%20%20label%3A%20'Qwen3.8%20Max%20Preview'%2C%5Cn%20%20%20%20description%3A%20'%E9%9C%80%20Token%20Plan%EF%BC%88%E6%9C%AC%E7%A4%BA%E4%BE%8B%E7%A6%81%E7%94%A8%EF%BC%89%20%C2%B7%20%E6%8E%A8%E7%90%86%E4%B8%8E%E8%A7%86%E8%A7%89%E7%90%86%E8%A7%A3%20%C2%B7%201M%20%E4%B8%8A%E4%B8%8B%E6%96%87'%2C%5Cn%20%20%20%20disabled%3A%20true%2C%5Cn%20%20%20%20keywords%3A%20%5B'%E7%99%BE%E7%82%BC'%2C%20'%E9%80%9A%E4%B9%89%E5%8D%83%E9%97%AE'%2C%20'qwencloud'%2C%20'dashscope'%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20provider%3A%20'qwen'%2C%5Cn%20%20%20%20value%3A%20'qwen3.7-max'%2C%5Cn%20%20%20%20label%3A%20'Qwen3.7%20Max'%2C%5Cn%20%20%20%20description%3A%20'%E7%BA%AF%E6%96%87%E6%9C%AC%E6%97%97%E8%88%B0%20%C2%B7%201M%20%E4%B8%8A%E4%B8%8B%E6%96%87%20%C2%B7%20%E6%9C%80%E5%A4%A7%E8%BE%93%E5%87%BA%20131K'%2C%5Cn%20%20%20%20keywords%3A%20%5B'%E7%99%BE%E7%82%BC'%2C%20'%E9%80%9A%E4%B9%89%E5%8D%83%E9%97%AE'%2C%20'dashscope'%2C%20'%E6%8E%A8%E7%90%86'%2C%20'reasoning'%2C%20'agent'%2C%20'%E4%BB%A3%E7%A0%81'%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20provider%3A%20'qwen'%2C%5Cn%20%20%20%20value%3A%20'qwen3.7-plus'%2C%5Cn%20%20%20%20label%3A%20'Qwen3.7%20Plus'%2C%5Cn%20%20%20%20description%3A%20'%E5%9B%BE%E5%83%8F%E3%80%81%E6%96%87%E6%9C%AC%E4%B8%8E%E8%A7%86%E9%A2%91%E8%BE%93%E5%85%A5%20%C2%B7%201M%20%E4%B8%8A%E4%B8%8B%E6%96%87%20%C2%B7%20%E6%9C%80%E5%A4%A7%E8%BE%93%E5%87%BA%20131K'%2C%5Cn%20%20%20%20keywords%3A%20%5B'%E7%99%BE%E7%82%BC'%2C%20'%E9%80%9A%E4%B9%89%E5%8D%83%E9%97%AE'%2C%20'dashscope'%2C%20'%E5%A4%9A%E6%A8%A1%E6%80%81'%2C%20'%E6%8E%A8%E7%90%86'%2C%20'reasoning'%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20provider%3A%20'qwen'%2C%5Cn%20%20%20%20value%3A%20'qwen3.7-flash'%2C%5Cn%20%20%20%20label%3A%20'Qwen3.7%20Flash'%2C%5Cn%20%20%20%20description%3A%20'%E8%BD%BB%E9%87%8F%E4%BD%8E%E6%88%90%E6%9C%AC%E5%A4%9A%E6%A8%A1%E6%80%81%20%C2%B7%201M%20%E4%B8%8A%E4%B8%8B%E6%96%87%20%C2%B7%20%E6%9C%80%E5%A4%A7%E8%BE%93%E5%87%BA%20131K'%2C%5Cn%20%20%20%20keywords%3A%20%5B'%E7%99%BE%E7%82%BC'%2C%20'%E9%80%9A%E4%B9%89%E5%8D%83%E9%97%AE'%2C%20'dashscope'%2C%20'%E5%A4%9A%E6%A8%A1%E6%80%81'%2C%20'%E6%8E%A8%E7%90%86'%2C%20'reasoning'%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%20satisfies%20readonly%20ModelRow%5B%5D%5Cn%5Cnexport%20const%20modelSelectorDemoModels%20%3D%20modelRows.map((%7B%20provider%2C%20efforts%2C%20...model%20%7D)%20%3D%3E%20(%7B%5Cn%20%20...model%2C%5Cn%20%20...providerBases%5Bprovider%5D%2C%5Cn%20%20...(efforts%5Cn%20%20%20%20%3F%20%7B%5Cn%20%20%20%20%20%20%20%20efforts%3A%20efforts.map((%5Bvalue%2C%20label%5D)%20%3D%3E%20(%7B%20value%2C%20label%20%7D))%20satisfies%20readonly%20ModelSelectorEffortOption%5B%5D%2C%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%3A%20%7B%7D)%2C%5Cn%7D))%20satisfies%20readonly%20ModelSelectorOption%5B%5D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{i.value=!1}),vueCode:t(D)},c({_:2},[m.value?{name:"vue",fn:a(()=>[s(t(m))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[6]||(e[6]=l("",2)),p(s(t(C),null,null,512),[[h,i.value]]),s(o,null,{default:a(()=>[s(t(g),{title:"外观与尺寸",description:"对比三种 variant 和三种 size。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22variants.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fmodel-selector%2Fvariants.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrModelSelector%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20modelSelectorDemoModels%20%7D%20from%20'.%2Fdemo-models'%5Cn%5Cnconst%20models%20%3D%20modelSelectorDemoModels.filter((option)%20%3D%3E%20!option.disabled)%5Cn%5Cnconst%20variants%20%3D%20%5B%5Cn%20%20%7B%20label%3A%20'outline%20%2F%20small'%2C%20variant%3A%20'outline'%20as%20const%2C%20size%3A%20'small'%20as%20const%2C%20value%3A%20'deepseek-v4-flash'%20%7D%2C%5Cn%20%20%7B%20label%3A%20'ghost%20%2F%20normal'%2C%20variant%3A%20'ghost'%20as%20const%2C%20size%3A%20'normal'%20as%20const%2C%20value%3A%20'qwen3.7-plus'%20%7D%2C%5Cn%20%20%7B%20label%3A%20'muted%20%2F%20large'%2C%20variant%3A%20'muted'%20as%20const%2C%20size%3A%20'large'%20as%20const%2C%20value%3A%20'qwen3.7-max'%20%7D%2C%5Cn%5D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22model-selector-variants-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20v-for%3D%5C%22item%20in%20variants%5C%22%20%3Akey%3D%5C%22item.label%5C%22%20class%3D%5C%22model-selector-variants-demo__item%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%20class%3D%5C%22model-selector-variants-demo__label%5C%22%3E%7B%7B%20item.label%20%7D%7D%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3CTrModelSelector%20%3Amodels%3D%5C%22models%5C%22%20%3Adefault-value%3D%5C%22item.value%5C%22%20%3Avariant%3D%5C%22item.variant%5C%22%20%3Asize%3D%5C%22item.size%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.model-selector-variants-demo%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20align-items%3A%20flex-start%3B%5Cn%20%20gap%3A%2024px%3B%5Cn%20%20padding%3A%2020px%3B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider)%3B%5Cn%20%20border-radius%3A%2012px%3B%5Cn%20%20background%3A%20var(--vp-c-bg)%3B%5Cn%7D%5Cn%5Cn.model-selector-variants-demo__item%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20min-width%3A%20140px%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20align-items%3A%20flex-start%3B%5Cn%20%20gap%3A%208px%3B%5Cn%7D%5Cn%5Cn.model-selector-variants-demo__label%20%7B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22demo-models.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fmodel-selector%2Fdemo-models.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ModelSelectorEffortOption%2C%20ModelSelectorOption%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconBailian%2C%20IconDeepseek%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cn%5Cnconst%20providerBases%20%3D%20%7B%5Cn%20%20deepseek%3A%20%7B%5Cn%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20group%3A%20'DeepSeek%20V4'%2C%5Cn%20%20%7D%2C%5Cn%20%20qwen%3A%20%7B%5Cn%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20group%3A%20'Qwen'%2C%5Cn%20%20%7D%2C%5Cn%7D%20as%20const%5Cn%5Cntype%20ModelProvider%20%3D%20keyof%20typeof%20providerBases%5Cntype%20EffortRow%20%3D%20readonly%20%5Bvalue%3A%20string%2C%20label%3A%20string%5D%5Cn%5Cninterface%20ModelRow%20%7B%5Cn%20%20provider%3A%20ModelProvider%5Cn%20%20value%3A%20string%5Cn%20%20label%3A%20string%5Cn%20%20description%3A%20string%5Cn%20%20disabled%3F%3A%20boolean%5Cn%20%20keywords%3A%20readonly%20string%5B%5D%5Cn%20%20efforts%3F%3A%20readonly%20EffortRow%5B%5D%5Cn%7D%5Cn%5Cnconst%20modelRows%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20provider%3A%20'deepseek'%2C%5Cn%20%20%20%20value%3A%20'deepseek-v4-pro'%2C%5Cn%20%20%20%20label%3A%20'DeepSeek%20V4%20Pro'%2C%5Cn%20%20%20%20description%3A%20'%E9%A2%84%E8%A7%88%E7%89%88%20%C2%B7%201M%20%E4%B8%8A%E4%B8%8B%E6%96%87%20%C2%B7%20%E6%9C%80%E5%A4%A7%E8%BE%93%E5%87%BA%20384K'%2C%5Cn%20%20%20%20keywords%3A%20%5B'preview'%2C%20'%E6%8E%A8%E7%90%86'%2C%20'reasoning'%2C%20'agent'%2C%20'%E4%BB%A3%E7%A0%81'%5D%2C%5Cn%20%20%20%20efforts%3A%20%5B%5Cn%20%20%20%20%20%20%5B'high'%2C%20'High'%5D%2C%5Cn%20%20%20%20%20%20%5B'max'%2C%20'Max'%5D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20provider%3A%20'deepseek'%2C%5Cn%20%20%20%20value%3A%20'deepseek-v4-flash'%2C%5Cn%20%20%20%20label%3A%20'DeepSeek%20V4%20Flash'%2C%5Cn%20%20%20%20description%3A%20'V4-Flash-0731%20Public%20Beta%20%C2%B7%201M%20%E4%B8%8A%E4%B8%8B%E6%96%87%20%C2%B7%20%E6%9C%80%E5%A4%A7%E8%BE%93%E5%87%BA%20384K'%2C%5Cn%20%20%20%20keywords%3A%20%5B'%E6%8E%A8%E7%90%86'%2C%20'reasoning'%2C%20'%E4%BD%8E%E6%88%90%E6%9C%AC'%5D%2C%5Cn%20%20%20%20efforts%3A%20%5B%5Cn%20%20%20%20%20%20%5B'low'%2C%20'Low'%5D%2C%5Cn%20%20%20%20%20%20%5B'high'%2C%20'High'%5D%2C%5Cn%20%20%20%20%20%20%5B'max'%2C%20'Max'%5D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20provider%3A%20'qwen'%2C%5Cn%20%20%20%20value%3A%20'qwen3.8-max-preview'%2C%5Cn%20%20%20%20label%3A%20'Qwen3.8%20Max%20Preview'%2C%5Cn%20%20%20%20description%3A%20'%E9%9C%80%20Token%20Plan%EF%BC%88%E6%9C%AC%E7%A4%BA%E4%BE%8B%E7%A6%81%E7%94%A8%EF%BC%89%20%C2%B7%20%E6%8E%A8%E7%90%86%E4%B8%8E%E8%A7%86%E8%A7%89%E7%90%86%E8%A7%A3%20%C2%B7%201M%20%E4%B8%8A%E4%B8%8B%E6%96%87'%2C%5Cn%20%20%20%20disabled%3A%20true%2C%5Cn%20%20%20%20keywords%3A%20%5B'%E7%99%BE%E7%82%BC'%2C%20'%E9%80%9A%E4%B9%89%E5%8D%83%E9%97%AE'%2C%20'qwencloud'%2C%20'dashscope'%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20provider%3A%20'qwen'%2C%5Cn%20%20%20%20value%3A%20'qwen3.7-max'%2C%5Cn%20%20%20%20label%3A%20'Qwen3.7%20Max'%2C%5Cn%20%20%20%20description%3A%20'%E7%BA%AF%E6%96%87%E6%9C%AC%E6%97%97%E8%88%B0%20%C2%B7%201M%20%E4%B8%8A%E4%B8%8B%E6%96%87%20%C2%B7%20%E6%9C%80%E5%A4%A7%E8%BE%93%E5%87%BA%20131K'%2C%5Cn%20%20%20%20keywords%3A%20%5B'%E7%99%BE%E7%82%BC'%2C%20'%E9%80%9A%E4%B9%89%E5%8D%83%E9%97%AE'%2C%20'dashscope'%2C%20'%E6%8E%A8%E7%90%86'%2C%20'reasoning'%2C%20'agent'%2C%20'%E4%BB%A3%E7%A0%81'%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20provider%3A%20'qwen'%2C%5Cn%20%20%20%20value%3A%20'qwen3.7-plus'%2C%5Cn%20%20%20%20label%3A%20'Qwen3.7%20Plus'%2C%5Cn%20%20%20%20description%3A%20'%E5%9B%BE%E5%83%8F%E3%80%81%E6%96%87%E6%9C%AC%E4%B8%8E%E8%A7%86%E9%A2%91%E8%BE%93%E5%85%A5%20%C2%B7%201M%20%E4%B8%8A%E4%B8%8B%E6%96%87%20%C2%B7%20%E6%9C%80%E5%A4%A7%E8%BE%93%E5%87%BA%20131K'%2C%5Cn%20%20%20%20keywords%3A%20%5B'%E7%99%BE%E7%82%BC'%2C%20'%E9%80%9A%E4%B9%89%E5%8D%83%E9%97%AE'%2C%20'dashscope'%2C%20'%E5%A4%9A%E6%A8%A1%E6%80%81'%2C%20'%E6%8E%A8%E7%90%86'%2C%20'reasoning'%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20provider%3A%20'qwen'%2C%5Cn%20%20%20%20value%3A%20'qwen3.7-flash'%2C%5Cn%20%20%20%20label%3A%20'Qwen3.7%20Flash'%2C%5Cn%20%20%20%20description%3A%20'%E8%BD%BB%E9%87%8F%E4%BD%8E%E6%88%90%E6%9C%AC%E5%A4%9A%E6%A8%A1%E6%80%81%20%C2%B7%201M%20%E4%B8%8A%E4%B8%8B%E6%96%87%20%C2%B7%20%E6%9C%80%E5%A4%A7%E8%BE%93%E5%87%BA%20131K'%2C%5Cn%20%20%20%20keywords%3A%20%5B'%E7%99%BE%E7%82%BC'%2C%20'%E9%80%9A%E4%B9%89%E5%8D%83%E9%97%AE'%2C%20'dashscope'%2C%20'%E5%A4%9A%E6%A8%A1%E6%80%81'%2C%20'%E6%8E%A8%E7%90%86'%2C%20'reasoning'%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%20satisfies%20readonly%20ModelRow%5B%5D%5Cn%5Cnexport%20const%20modelSelectorDemoModels%20%3D%20modelRows.map((%7B%20provider%2C%20efforts%2C%20...model%20%7D)%20%3D%3E%20(%7B%5Cn%20%20...model%2C%5Cn%20%20...providerBases%5Bprovider%5D%2C%5Cn%20%20...(efforts%5Cn%20%20%20%20%3F%20%7B%5Cn%20%20%20%20%20%20%20%20efforts%3A%20efforts.map((%5Bvalue%2C%20label%5D)%20%3D%3E%20(%7B%20value%2C%20label%20%7D))%20satisfies%20readonly%20ModelSelectorEffortOption%5B%5D%2C%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%3A%20%7B%7D)%2C%5Cn%7D))%20satisfies%20readonly%20ModelSelectorOption%5B%5D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[2]||(e[2]=()=>{i.value=!1}),vueCode:t(b)},c({_:2},[y.value?{name:"vue",fn:a(()=>[s(t(y))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[7]||(e[7]=l("",2)),p(s(t(C),null,null,512),[[h,i.value]]),s(o,null,{default:a(()=>[s(t(g),{title:"完整插槽组合",description:"自定义 Trigger、面板头、分组标题、模型项、空状态和 footer。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[3]||(e[3]=()=>{i.value=!1}),vueCode:t(v)},c({_:2},[E.value?{name:"vue",fn:a(()=>[s(t(E))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[8]||(e[8]=l("",40))])}}});export{T as __pageData,P as default};
