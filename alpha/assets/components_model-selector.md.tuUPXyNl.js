const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/icon-trigger.BotB73KE.js","assets/chunks/theme.BLdxb5Fu.js","assets/chunks/framework.B8Neh5gQ.js","assets/chunks/slots.JfmIU8VQ.js","assets/chunks/variants.DCgkugmn.js","assets/chunks/demo-models.C_rsD6hW.js","assets/chunks/controlled.OqWd41ft.js","assets/chunks/basic.zM-7f3qq.js"])))=>i.map(i=>d[i]);
import{aD as l,bQ as d,aZ as A,aL as B,v as b,H as r,bL as p,bB as c,J as s,bk as t,bJ as o,G as h,w as k,I as v,b7 as g,aU as D}from"./chunks/framework.B8Neh5gQ.js";import{L as m,N as C}from"./chunks/index.DhKVcVs7.js";const _=`<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrModelSelector, type ModelSelectorOption } from '@opentiny/tiny-robot'
import { IconArrowDown, IconBailian, IconDeepseek } from '@opentiny/tiny-robot-svgs'

const model = shallowRef<string | null>('deepseek-v4-flash')

const models = [
  {
    value: 'deepseek-v4-flash',
    label: 'DeepSeek V4 Flash',
    icon: IconDeepseek,
  },
  {
    value: 'qwen3.7-max',
    label: 'Qwen3.7 Max',
    icon: IconBailian,
  },
] satisfies readonly ModelSelectorOption[]
<\/script>

<template>
  <div class="model-selector-icon-trigger-demo">
    <TrModelSelector v-model="model" :models="models">
      <template #trigger="{ option, label, open }">
        <span class="model-selector-icon-trigger-demo__trigger" :class="{ 'has-icon': option?.icon }">
          <span class="model-selector-icon-trigger-demo__trigger-main">
            <img
              v-if="typeof option?.icon === 'string'"
              :src="option.icon"
              class="model-selector-icon-trigger-demo__icon"
              alt=""
              aria-hidden="true"
            />
            <component
              :is="option?.icon"
              v-else-if="option?.icon"
              class="model-selector-icon-trigger-demo__icon"
              aria-hidden="true"
              focusable="false"
            />
            <span class="model-selector-icon-trigger-demo__label">{{ label }}</span>
          </span>
          <IconArrowDown
            class="model-selector-icon-trigger-demo__chevron"
            :class="{ 'is-open': open }"
            aria-hidden="true"
            focusable="false"
          />
        </span>
      </template>
    </TrModelSelector>

    <span class="model-selector-icon-trigger-demo__value" aria-live="polite">当前模型：{{ model }}</span>
  </div>
</template>

<style scoped>
.model-selector-icon-trigger-demo {
  display: flex;
  min-height: 96px;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  background: var(--vp-c-bg);
}

.model-selector-icon-trigger-demo__icon {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
}

.model-selector-icon-trigger-demo__trigger,
.model-selector-icon-trigger-demo__trigger-main {
  display: inline-flex;
  align-items: center;
}

.model-selector-icon-trigger-demo__trigger {
  width: 100%;
  justify-content: space-between;
  gap: 8px;
}

.model-selector-icon-trigger-demo__trigger-main {
  min-width: 0;
  gap: 8px;
}

.model-selector-icon-trigger-demo__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.model-selector-icon-trigger-demo__chevron {
  width: 1em;
  height: 1em;
  flex: 0 0 auto;
  transition: transform 0.18s ease;
}

.model-selector-icon-trigger-demo__chevron.is-open {
  transform: rotate(180deg);
}

@media (max-width: 480px) {
  .model-selector-icon-trigger-demo__trigger.has-icon .model-selector-icon-trigger-demo__label {
    display: none;
  }

  .model-selector-icon-trigger-demo__chevron {
    display: none;
  }

  .model-selector-icon-trigger-demo__trigger.has-icon .model-selector-icon-trigger-demo__trigger-main {
    gap: 0;
  }
}

.model-selector-icon-trigger-demo__value {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
`,x=`<script setup lang="ts">
import { shallowRef } from 'vue'
import {
  TrModelSelector,
  type ModelSelectorReasoningEffortOption,
  type ModelSelectorFilterMethod,
  type ModelSelectorOption,
} from '@opentiny/tiny-robot'
import { IconBailian, IconDeepseek } from '@opentiny/tiny-robot-svgs'

const providerBases = {
  deepseek: {
    icon: IconDeepseek,
    group: 'DeepSeek V4',
  },
  qwen: {
    icon: IconBailian,
    group: 'Qwen',
  },
} as const

const modelRows = [
  {
    provider: 'deepseek',
    value: 'deepseek-v4-pro',
    label: 'DeepSeek V4 Pro',
    description: '预览版 · 1M 上下文 · 最大输出 384K',
    reasoningEfforts: [
      ['high', 'High'],
      ['max', 'Max'],
    ],
  },
  {
    provider: 'deepseek',
    value: 'deepseek-v4-flash',
    label: 'DeepSeek V4 Flash',
    description: 'V4-Flash-0731 Public Beta · 1M 上下文 · 最大输出 384K',
    reasoningEfforts: [
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
    reasoningEfforts: undefined,
  },
  {
    provider: 'qwen',
    value: 'qwen3.7-max',
    label: 'Qwen3.7 Max',
    description: '纯文本旗舰 · 1M 上下文 · 最大输出 131K',
    reasoningEfforts: undefined,
  },
  {
    provider: 'qwen',
    value: 'qwen3.7-plus',
    label: 'Qwen3.7 Plus',
    description: '图像、文本与视频输入 · 1M 上下文 · 最大输出 131K',
    reasoningEfforts: undefined,
  },
] as const

const models = modelRows.map(({ provider, reasoningEfforts, ...row }) => ({
  ...row,
  ...providerBases[provider],
  ...(reasoningEfforts
    ? {
        reasoningEfforts: reasoningEfforts.map(([value, label]) => ({
          value,
          label,
        })) satisfies readonly ModelSelectorReasoningEffortOption[],
      }
    : {}),
})) satisfies readonly ModelSelectorOption[]

const model = shallowRef<string | null>('deepseek-v4-flash')
const reasoningEffort = shallowRef<string | null>('high')

const filterMethod: ModelSelectorFilterMethod = (query, option) => {
  const searchText = [option.label, option.value, option.description, option.group]
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
      v-model:reasoning-effort="reasoningEffort"
      :models="models"
      :filter-method="filterMethod"
      searchable
      variant="muted"
      size="large"
      placeholder="选择工作模型"
      search-placeholder="例如：推理 数学"
      panel-class="model-selector-slots-panel"
    >
      <template #trigger="{ option, label, open, reasoningEffortOption }">
        <span class="model-selector-slots-demo__trigger">
          <img
            v-if="typeof option?.icon === 'string'"
            :src="option.icon"
            class="model-selector-slots-demo__trigger-icon"
            alt=""
            aria-hidden="true"
          />
          <component
            :is="option?.icon"
            v-else-if="option?.icon"
            class="model-selector-slots-demo__trigger-icon"
            aria-hidden="true"
            focusable="false"
          />
          <span class="model-selector-slots-demo__trigger-copy">
            <span class="model-selector-slots-demo__trigger-meta">
              工作模型{{ reasoningEffortOption ? \` · \${reasoningEffortOption.label}\` : '' }}
            </span>
            <span class="model-selector-slots-demo__trigger-label">{{ label }}</span>
          </span>
          <span class="model-selector-slots-demo__trigger-state" aria-hidden="true">
            {{ open ? '收起' : '切换' }}
          </span>
        </span>
      </template>

      <template #header="{ query, close }">
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

      <template #item="{ option, selected, highlighted }">
        <span class="model-selector-slots-demo__item">
          <span class="model-selector-slots-demo__item-main">
            <img
              v-if="typeof option.icon === 'string'"
              :src="option.icon"
              class="model-selector-slots-demo__item-icon"
              alt=""
              aria-hidden="true"
            />
            <component
              :is="option.icon"
              v-else-if="option.icon"
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
            {{ option.disabled ? '不可用' : selected ? '当前' : highlighted ? 'Enter 选择' : '' }}
          </span>
        </span>
      </template>

      <template #empty="{ query }">
        <span class="model-selector-slots-demo__empty">
          <strong>没有找到“{{ query }}”</strong>
          <small class="model-selector-slots-demo__empty-hint">尝试厂商名、模型名或能力关键词。</small>
        </span>
      </template>

      <template #footer="{ close, reasoningEfforts, reasoningEffortOption, setReasoningEffort }">
        <div class="model-selector-slots-demo__footer">
          <div class="model-selector-slots-demo__effort">
            <span class="model-selector-slots-demo__effort-label">
              Reasoning effort{{ reasoningEffortOption ? \` · \${reasoningEffortOption.label}\` : '' }}
            </span>
            <div
              v-if="reasoningEfforts.length > 0"
              class="model-selector-slots-demo__effort-options"
              role="group"
              aria-label="推理强度"
            >
              <button
                v-for="option in reasoningEfforts"
                :key="option.value"
                type="button"
                class="model-selector-slots-demo__effort-option"
                :class="{ 'is-active': reasoningEffortOption?.value === option.value }"
                :aria-pressed="reasoningEffortOption?.value === option.value"
                :disabled="option.disabled"
                @click="setReasoningEffort(option.value)"
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
      >；<code>v-model:reasoning-effort</code> 保留值：<code>{{ String(reasoningEffort) }}</code>
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

:global(.tr-model-selector__panel.model-selector-slots-panel) {
  max-height: 420px;
  box-shadow: 0 16px 48px rgb(0 0 0 / 16%);
}
</style>
`,w=`<script setup lang="ts">
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
`,S=`<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrModelSelector } from '@opentiny/tiny-robot'
import { modelSelectorDemoModels } from './demo-models'

const model = shallowRef<string | null>('qwen3.7-plus')

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
      <TrModelSelector v-model="model" :models="modelSelectorDemoModels" placeholder="当前值没有匹配模型" searchable />

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
`,M=`<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrModelSelector, type ModelSelectorOption } from '@opentiny/tiny-robot'
import { IconBailian, IconDeepseek } from '@opentiny/tiny-robot-svgs'

const model = shallowRef<string | null>('deepseek-v4-flash')
const reasoningEffort = shallowRef<string | null>('high')

const models = [
  {
    value: 'deepseek-v4-flash',
    label: 'DeepSeek V4 Flash',
    icon: IconDeepseek,
    reasoningEfforts: [
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
    <TrModelSelector v-model="model" v-model:reasoning-effort="reasoningEffort" :models="models" searchable />
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
`,V=JSON.parse('{"title":"ModelSelector 模型选择器","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/model-selector.md","filePath":"components/model-selector.md"}'),T={name:"components/model-selector.md"},O=Object.assign(T,{setup(R){const E=g();l(async()=>{E.value=(await d(async()=>{const{default:i}=await import("./chunks/icon-trigger.BotB73KE.js");return{default:i}},__vite__mapDeps([0,1,2]))).default});const y=g();l(async()=>{y.value=(await d(async()=>{const{default:i}=await import("./chunks/slots.JfmIU8VQ.js");return{default:i}},__vite__mapDeps([3,1,2]))).default});const f=g();l(async()=>{f.value=(await d(async()=>{const{default:i}=await import("./chunks/variants.DCgkugmn.js");return{default:i}},__vite__mapDeps([4,1,2,5]))).default});const F=g();l(async()=>{F.value=(await d(async()=>{const{default:i}=await import("./chunks/controlled.OqWd41ft.js");return{default:i}},__vite__mapDeps([6,1,2,5]))).default});const n=D(!0),u=g();return l(async()=>{u.value=(await d(async()=>{const{default:i}=await import("./chunks/basic.zM-7f3qq.js");return{default:i}},__vite__mapDeps([7,1,2]))).default}),(i,e)=>{const a=A("ClientOnly");return B(),b("div",null,[e[5]||(e[5]=r('<h1 id="modelselector-模型选择器" tabindex="-1">ModelSelector 模型选择器 <a class="header-anchor" href="#modelselector-模型选择器" aria-label="Permalink to &quot;ModelSelector 模型选择器&quot;">​</a></h1><p>ModelSelector 是一个模型下拉选择器，用于在一组模型中选择当前模型。它内置搜索、分组、禁用项、键盘操作、浮层定位、思考强度和内容插槽。</p><p>组件只负责渲染与选择交互。DeepSeek、Qwen 等 Provider 的模型目录、请求参数、价格、上下文长度等业务数据仍由消费层维护；ModelSelector 只消费传入的 <code>models</code> 字段。</p><p>模型图标也由每个模型的 <code>icon</code> 字段传入。可以使用 <code>@opentiny/tiny-robot-svgs</code> 提供的 Provider 组件，也可以传入图片 URL；组件会分别使用 <code>component</code> 或 <code>img</code> 渲染。ModelSelector 本身不包含 <code>providerId -&gt; icon</code> 的自动映射。</p><div class="tip custom-block"><p class="custom-block-title">组件边界</p><p>按 Provider 筛选、决定实际向哪个模型发请求、把思考强度转换为 Provider 请求参数，都应该在组件外处理。组件只根据每个模型的 <code>reasoningEfforts</code> 字段展示可选的思考强度，并通过事件把用户选择通知出去。</p></div><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="基础用法" tabindex="-1">基础用法 <a class="header-anchor" href="#基础用法" aria-label="Permalink to &quot;基础用法&quot;">​</a></h3><p>组件的最小模型项只需要 <code>value</code> 与 <code>label</code>。下例通过 <code>v-model</code> 和 <code>v-model:reasoning-effort</code> 控制模型与推理强度，并演示外部图标及一个自定义 reasoning effort 配置。</p>',8)),p(s(t(m),null,null,512),[[c,n.value]]),s(a,null,{default:o(()=>[s(t(C),{title:"基础用法",description:"最小模型数据、受控模型与推理强度，以及外部 Provider 图标。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{n.value=!1}),vueCode:t(M)},h({_:2},[u.value?{name:"vue",fn:o(()=>[s(t(u))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[6]||(e[6]=r('<h4 id="模型数据怎么配置" tabindex="-1">模型数据怎么配置 <a class="header-anchor" href="#模型数据怎么配置" aria-label="Permalink to &quot;模型数据怎么配置&quot;">​</a></h4><p>推荐把完整模型目录与选择器要显示的数据分开。上下文长度、最大输出、模态、价格和 Provider 请求参数可以留在业务侧模型目录中；传给 ModelSelector 时，只映射当前 UI 需要展示或搜索的字段。</p><table tabindex="0"><thead><tr><th>字段层级</th><th>字段</th><th>什么时候配置</th></tr></thead><tbody><tr><td>必需</td><td><code>value</code>、<code>label</code></td><td>每个模型都需要，用于标识和显示</td></tr><tr><td>常用展示</td><td><code>icon</code>、<code>description</code>、<code>disabled</code></td><td>需要图标、描述或禁用模型时配置</td></tr><tr><td>进阶能力</td><td><code>group</code>、<code>reasoningEfforts</code></td><td>需要分组或思考强度时配置</td></tr></tbody></table><p>简单来说，组件不读取模型目录里的业务字段，也不会推断 Provider 能力；它只按 <code>ModelSelectorOption</code> 渲染你传入的列表。</p><h3 id="受控选择" tabindex="-1">受控选择 <a class="header-anchor" href="#受控选择" aria-label="Permalink to &quot;受控选择&quot;">​</a></h3><p><code>v-model</code> 控制当前模型。外部设置不存在的值时，组件保留原值并显示 <code>placeholder</code>，不会擅自选择第一项。这样可以避免模型列表异步更新时，组件悄悄替用户换模型。浮层的 <code>open</code> 受控行为和模型列表动态更新规则见下方“状态规则”。</p>',6)),p(s(t(m),null,null,512),[[c,n.value]]),s(a,null,{default:o(()=>[s(t(C),{title:"受控选择",description:"使用 v-model 修改当前模型，并观察无效值的 placeholder 行为。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22controlled.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fmodel-selector%2Fcontrolled.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrModelSelector%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20modelSelectorDemoModels%20%7D%20from%20'.%2Fdemo-models'%5Cn%5Cnconst%20model%20%3D%20shallowRef%3Cstring%20%7C%20null%3E('qwen3.7-plus')%5Cn%5Cnfunction%20setInvalidValue()%20%7B%5Cn%20%20model.value%20%3D%20'retired-model'%5Cn%7D%5Cn%5Cnfunction%20restoreValue()%20%7B%5Cn%20%20model.value%20%3D%20'qwen3.7-plus'%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22model-selector-controlled-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22model-selector-controlled-demo__selector%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrModelSelector%20v-model%3D%5C%22model%5C%22%20%3Amodels%3D%5C%22modelSelectorDemoModels%5C%22%20placeholder%3D%5C%22%E5%BD%93%E5%89%8D%E5%80%BC%E6%B2%A1%E6%9C%89%E5%8C%B9%E9%85%8D%E6%A8%A1%E5%9E%8B%5C%22%20searchable%20%2F%3E%5Cn%5Cn%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22model-selector-controlled-demo__actions%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cbutton%20type%3D%5C%22button%5C%22%20%40click%3D%5C%22setInvalidValue%5C%22%3E%E8%AE%BE%E7%BD%AE%E4%B8%8D%E5%AD%98%E5%9C%A8%E7%9A%84%E5%80%BC%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%20%20%3Cbutton%20type%3D%5C%22button%5C%22%20%40click%3D%5C%22restoreValue%5C%22%3E%E6%81%A2%E5%A4%8D%E6%9C%89%E6%95%88%E5%80%BC%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cp%20class%3D%5C%22model-selector-controlled-demo__state%5C%22%20aria-live%3D%5C%22polite%5C%22%3E%5Cn%20%20%20%20%20%20%E5%BD%93%E5%89%8D%E5%80%BC%EF%BC%9A%3Ccode%3E%7B%7B%20model%20%7D%7D%3C%2Fcode%3E%5Cn%20%20%20%20%3C%2Fp%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.model-selector-controlled-demo%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20align-items%3A%20flex-start%3B%5Cn%20%20gap%3A%2016px%3B%5Cn%20%20padding%3A%2020px%3B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider)%3B%5Cn%20%20border-radius%3A%2012px%3B%5Cn%20%20background%3A%20var(--vp-c-bg)%3B%5Cn%7D%5Cn%5Cn.model-selector-controlled-demo__selector%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20gap%3A%208px%3B%5Cn%7D%5Cn%5Cn.model-selector-controlled-demo__actions%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%208px%3B%5Cn%7D%5Cn%5Cn.model-selector-controlled-demo__actions%20button%20%7B%5Cn%20%20padding%3A%205px%2010px%3B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider)%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20background%3A%20var(--vp-c-bg)%3B%5Cn%20%20color%3A%20var(--vp-c-text-1)%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%7D%5Cn%5Cn.model-selector-controlled-demo__actions%20button%3Ahover%20%7B%5Cn%20%20border-color%3A%20var(--vp-c-brand-1)%3B%5Cn%7D%5Cn%5Cn.model-selector-controlled-demo__state%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22demo-models.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fmodel-selector%2Fdemo-models.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ModelSelectorReasoningEffortOption%2C%20ModelSelectorOption%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconBailian%2C%20IconDeepseek%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cn%5Cnconst%20providerBases%20%3D%20%7B%5Cn%20%20deepseek%3A%20%7B%5Cn%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20group%3A%20'DeepSeek%20V4'%2C%5Cn%20%20%7D%2C%5Cn%20%20qwen%3A%20%7B%5Cn%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20group%3A%20'Qwen'%2C%5Cn%20%20%7D%2C%5Cn%7D%20as%20const%5Cn%5Cntype%20ModelProvider%20%3D%20keyof%20typeof%20providerBases%5Cntype%20EffortRow%20%3D%20readonly%20%5Bvalue%3A%20string%2C%20label%3A%20string%5D%5Cn%5Cninterface%20ModelRow%20%7B%5Cn%20%20provider%3A%20ModelProvider%5Cn%20%20value%3A%20string%5Cn%20%20label%3A%20string%5Cn%20%20description%3A%20string%5Cn%20%20disabled%3F%3A%20boolean%5Cn%20%20reasoningEfforts%3F%3A%20readonly%20EffortRow%5B%5D%5Cn%7D%5Cn%5Cnconst%20modelRows%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20provider%3A%20'deepseek'%2C%5Cn%20%20%20%20value%3A%20'deepseek-v4-pro'%2C%5Cn%20%20%20%20label%3A%20'DeepSeek%20V4%20Pro'%2C%5Cn%20%20%20%20description%3A%20'%E9%A2%84%E8%A7%88%E7%89%88%20%C2%B7%201M%20%E4%B8%8A%E4%B8%8B%E6%96%87%20%C2%B7%20%E6%9C%80%E5%A4%A7%E8%BE%93%E5%87%BA%20384K'%2C%5Cn%20%20%20%20reasoningEfforts%3A%20%5B%5Cn%20%20%20%20%20%20%5B'high'%2C%20'High'%5D%2C%5Cn%20%20%20%20%20%20%5B'max'%2C%20'Max'%5D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20provider%3A%20'deepseek'%2C%5Cn%20%20%20%20value%3A%20'deepseek-v4-flash'%2C%5Cn%20%20%20%20label%3A%20'DeepSeek%20V4%20Flash'%2C%5Cn%20%20%20%20description%3A%20'V4-Flash-0731%20Public%20Beta%20%C2%B7%201M%20%E4%B8%8A%E4%B8%8B%E6%96%87%20%C2%B7%20%E6%9C%80%E5%A4%A7%E8%BE%93%E5%87%BA%20384K'%2C%5Cn%20%20%20%20reasoningEfforts%3A%20%5B%5Cn%20%20%20%20%20%20%5B'low'%2C%20'Low'%5D%2C%5Cn%20%20%20%20%20%20%5B'high'%2C%20'High'%5D%2C%5Cn%20%20%20%20%20%20%5B'max'%2C%20'Max'%5D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20provider%3A%20'qwen'%2C%5Cn%20%20%20%20value%3A%20'qwen3.8-max-preview'%2C%5Cn%20%20%20%20label%3A%20'Qwen3.8%20Max%20Preview'%2C%5Cn%20%20%20%20description%3A%20'%E9%9C%80%20Token%20Plan%EF%BC%88%E6%9C%AC%E7%A4%BA%E4%BE%8B%E7%A6%81%E7%94%A8%EF%BC%89%20%C2%B7%20%E6%8E%A8%E7%90%86%E4%B8%8E%E8%A7%86%E8%A7%89%E7%90%86%E8%A7%A3%20%C2%B7%201M%20%E4%B8%8A%E4%B8%8B%E6%96%87'%2C%5Cn%20%20%20%20disabled%3A%20true%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20provider%3A%20'qwen'%2C%5Cn%20%20%20%20value%3A%20'qwen3.7-max'%2C%5Cn%20%20%20%20label%3A%20'Qwen3.7%20Max'%2C%5Cn%20%20%20%20description%3A%20'%E7%BA%AF%E6%96%87%E6%9C%AC%E6%97%97%E8%88%B0%20%C2%B7%201M%20%E4%B8%8A%E4%B8%8B%E6%96%87%20%C2%B7%20%E6%9C%80%E5%A4%A7%E8%BE%93%E5%87%BA%20131K'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20provider%3A%20'qwen'%2C%5Cn%20%20%20%20value%3A%20'qwen3.7-plus'%2C%5Cn%20%20%20%20label%3A%20'Qwen3.7%20Plus'%2C%5Cn%20%20%20%20description%3A%20'%E5%9B%BE%E5%83%8F%E3%80%81%E6%96%87%E6%9C%AC%E4%B8%8E%E8%A7%86%E9%A2%91%E8%BE%93%E5%85%A5%20%C2%B7%201M%20%E4%B8%8A%E4%B8%8B%E6%96%87%20%C2%B7%20%E6%9C%80%E5%A4%A7%E8%BE%93%E5%87%BA%20131K'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20provider%3A%20'qwen'%2C%5Cn%20%20%20%20value%3A%20'qwen3.7-flash'%2C%5Cn%20%20%20%20label%3A%20'Qwen3.7%20Flash'%2C%5Cn%20%20%20%20description%3A%20'%E8%BD%BB%E9%87%8F%E4%BD%8E%E6%88%90%E6%9C%AC%E5%A4%9A%E6%A8%A1%E6%80%81%20%C2%B7%201M%20%E4%B8%8A%E4%B8%8B%E6%96%87%20%C2%B7%20%E6%9C%80%E5%A4%A7%E8%BE%93%E5%87%BA%20131K'%2C%5Cn%20%20%7D%2C%5Cn%5D%20satisfies%20readonly%20ModelRow%5B%5D%5Cn%5Cnexport%20const%20modelSelectorDemoModels%20%3D%20modelRows.map((%7B%20provider%2C%20reasoningEfforts%2C%20...model%20%7D)%20%3D%3E%20(%7B%5Cn%20%20...model%2C%5Cn%20%20...providerBases%5Bprovider%5D%2C%5Cn%20%20...(reasoningEfforts%5Cn%20%20%20%20%3F%20%7B%5Cn%20%20%20%20%20%20%20%20reasoningEfforts%3A%20reasoningEfforts.map((%5Bvalue%2C%20label%5D)%20%3D%3E%20(%7B%5Cn%20%20%20%20%20%20%20%20%20%20value%2C%5Cn%20%20%20%20%20%20%20%20%20%20label%2C%5Cn%20%20%20%20%20%20%20%20%7D))%20satisfies%20readonly%20ModelSelectorReasoningEffortOption%5B%5D%2C%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%3A%20%7B%7D)%2C%5Cn%7D))%20satisfies%20readonly%20ModelSelectorOption%5B%5D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{n.value=!1}),vueCode:t(S)},h({_:2},[F.value?{name:"vue",fn:o(()=>[s(t(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[7]||(e[7]=r('<h3 id="外观与尺寸" tabindex="-1">外观与尺寸 <a class="header-anchor" href="#外观与尺寸" aria-label="Permalink to &quot;外观与尺寸&quot;">​</a></h3><p>组件提供 <code>outline</code>、<code>ghost</code>、<code>muted</code> 三种外观，以及 <code>small</code>、<code>normal</code>、<code>large</code> 三种尺寸。这个案例只展示外观和尺寸，不涉及插槽或状态控制。</p>',2)),p(s(t(m),null,null,512),[[c,n.value]]),s(a,null,{default:o(()=>[s(t(C),{title:"外观与尺寸",description:"对比三种 variant 和三种 size。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22variants.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fmodel-selector%2Fvariants.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrModelSelector%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20modelSelectorDemoModels%20%7D%20from%20'.%2Fdemo-models'%5Cn%5Cnconst%20models%20%3D%20modelSelectorDemoModels.filter((option)%20%3D%3E%20!option.disabled)%5Cn%5Cnconst%20variants%20%3D%20%5B%5Cn%20%20%7B%20label%3A%20'outline%20%2F%20small'%2C%20variant%3A%20'outline'%20as%20const%2C%20size%3A%20'small'%20as%20const%2C%20value%3A%20'deepseek-v4-flash'%20%7D%2C%5Cn%20%20%7B%20label%3A%20'ghost%20%2F%20normal'%2C%20variant%3A%20'ghost'%20as%20const%2C%20size%3A%20'normal'%20as%20const%2C%20value%3A%20'qwen3.7-plus'%20%7D%2C%5Cn%20%20%7B%20label%3A%20'muted%20%2F%20large'%2C%20variant%3A%20'muted'%20as%20const%2C%20size%3A%20'large'%20as%20const%2C%20value%3A%20'qwen3.7-max'%20%7D%2C%5Cn%5D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22model-selector-variants-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20v-for%3D%5C%22item%20in%20variants%5C%22%20%3Akey%3D%5C%22item.label%5C%22%20class%3D%5C%22model-selector-variants-demo__item%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%20class%3D%5C%22model-selector-variants-demo__label%5C%22%3E%7B%7B%20item.label%20%7D%7D%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3CTrModelSelector%20%3Amodels%3D%5C%22models%5C%22%20%3Adefault-value%3D%5C%22item.value%5C%22%20%3Avariant%3D%5C%22item.variant%5C%22%20%3Asize%3D%5C%22item.size%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.model-selector-variants-demo%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20align-items%3A%20flex-start%3B%5Cn%20%20gap%3A%2024px%3B%5Cn%20%20padding%3A%2020px%3B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider)%3B%5Cn%20%20border-radius%3A%2012px%3B%5Cn%20%20background%3A%20var(--vp-c-bg)%3B%5Cn%7D%5Cn%5Cn.model-selector-variants-demo__item%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20min-width%3A%20140px%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20align-items%3A%20flex-start%3B%5Cn%20%20gap%3A%208px%3B%5Cn%7D%5Cn%5Cn.model-selector-variants-demo__label%20%7B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22demo-models.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fmodel-selector%2Fdemo-models.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ModelSelectorReasoningEffortOption%2C%20ModelSelectorOption%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconBailian%2C%20IconDeepseek%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cn%5Cnconst%20providerBases%20%3D%20%7B%5Cn%20%20deepseek%3A%20%7B%5Cn%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20group%3A%20'DeepSeek%20V4'%2C%5Cn%20%20%7D%2C%5Cn%20%20qwen%3A%20%7B%5Cn%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20group%3A%20'Qwen'%2C%5Cn%20%20%7D%2C%5Cn%7D%20as%20const%5Cn%5Cntype%20ModelProvider%20%3D%20keyof%20typeof%20providerBases%5Cntype%20EffortRow%20%3D%20readonly%20%5Bvalue%3A%20string%2C%20label%3A%20string%5D%5Cn%5Cninterface%20ModelRow%20%7B%5Cn%20%20provider%3A%20ModelProvider%5Cn%20%20value%3A%20string%5Cn%20%20label%3A%20string%5Cn%20%20description%3A%20string%5Cn%20%20disabled%3F%3A%20boolean%5Cn%20%20reasoningEfforts%3F%3A%20readonly%20EffortRow%5B%5D%5Cn%7D%5Cn%5Cnconst%20modelRows%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20provider%3A%20'deepseek'%2C%5Cn%20%20%20%20value%3A%20'deepseek-v4-pro'%2C%5Cn%20%20%20%20label%3A%20'DeepSeek%20V4%20Pro'%2C%5Cn%20%20%20%20description%3A%20'%E9%A2%84%E8%A7%88%E7%89%88%20%C2%B7%201M%20%E4%B8%8A%E4%B8%8B%E6%96%87%20%C2%B7%20%E6%9C%80%E5%A4%A7%E8%BE%93%E5%87%BA%20384K'%2C%5Cn%20%20%20%20reasoningEfforts%3A%20%5B%5Cn%20%20%20%20%20%20%5B'high'%2C%20'High'%5D%2C%5Cn%20%20%20%20%20%20%5B'max'%2C%20'Max'%5D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20provider%3A%20'deepseek'%2C%5Cn%20%20%20%20value%3A%20'deepseek-v4-flash'%2C%5Cn%20%20%20%20label%3A%20'DeepSeek%20V4%20Flash'%2C%5Cn%20%20%20%20description%3A%20'V4-Flash-0731%20Public%20Beta%20%C2%B7%201M%20%E4%B8%8A%E4%B8%8B%E6%96%87%20%C2%B7%20%E6%9C%80%E5%A4%A7%E8%BE%93%E5%87%BA%20384K'%2C%5Cn%20%20%20%20reasoningEfforts%3A%20%5B%5Cn%20%20%20%20%20%20%5B'low'%2C%20'Low'%5D%2C%5Cn%20%20%20%20%20%20%5B'high'%2C%20'High'%5D%2C%5Cn%20%20%20%20%20%20%5B'max'%2C%20'Max'%5D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20provider%3A%20'qwen'%2C%5Cn%20%20%20%20value%3A%20'qwen3.8-max-preview'%2C%5Cn%20%20%20%20label%3A%20'Qwen3.8%20Max%20Preview'%2C%5Cn%20%20%20%20description%3A%20'%E9%9C%80%20Token%20Plan%EF%BC%88%E6%9C%AC%E7%A4%BA%E4%BE%8B%E7%A6%81%E7%94%A8%EF%BC%89%20%C2%B7%20%E6%8E%A8%E7%90%86%E4%B8%8E%E8%A7%86%E8%A7%89%E7%90%86%E8%A7%A3%20%C2%B7%201M%20%E4%B8%8A%E4%B8%8B%E6%96%87'%2C%5Cn%20%20%20%20disabled%3A%20true%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20provider%3A%20'qwen'%2C%5Cn%20%20%20%20value%3A%20'qwen3.7-max'%2C%5Cn%20%20%20%20label%3A%20'Qwen3.7%20Max'%2C%5Cn%20%20%20%20description%3A%20'%E7%BA%AF%E6%96%87%E6%9C%AC%E6%97%97%E8%88%B0%20%C2%B7%201M%20%E4%B8%8A%E4%B8%8B%E6%96%87%20%C2%B7%20%E6%9C%80%E5%A4%A7%E8%BE%93%E5%87%BA%20131K'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20provider%3A%20'qwen'%2C%5Cn%20%20%20%20value%3A%20'qwen3.7-plus'%2C%5Cn%20%20%20%20label%3A%20'Qwen3.7%20Plus'%2C%5Cn%20%20%20%20description%3A%20'%E5%9B%BE%E5%83%8F%E3%80%81%E6%96%87%E6%9C%AC%E4%B8%8E%E8%A7%86%E9%A2%91%E8%BE%93%E5%85%A5%20%C2%B7%201M%20%E4%B8%8A%E4%B8%8B%E6%96%87%20%C2%B7%20%E6%9C%80%E5%A4%A7%E8%BE%93%E5%87%BA%20131K'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20provider%3A%20'qwen'%2C%5Cn%20%20%20%20value%3A%20'qwen3.7-flash'%2C%5Cn%20%20%20%20label%3A%20'Qwen3.7%20Flash'%2C%5Cn%20%20%20%20description%3A%20'%E8%BD%BB%E9%87%8F%E4%BD%8E%E6%88%90%E6%9C%AC%E5%A4%9A%E6%A8%A1%E6%80%81%20%C2%B7%201M%20%E4%B8%8A%E4%B8%8B%E6%96%87%20%C2%B7%20%E6%9C%80%E5%A4%A7%E8%BE%93%E5%87%BA%20131K'%2C%5Cn%20%20%7D%2C%5Cn%5D%20satisfies%20readonly%20ModelRow%5B%5D%5Cn%5Cnexport%20const%20modelSelectorDemoModels%20%3D%20modelRows.map((%7B%20provider%2C%20reasoningEfforts%2C%20...model%20%7D)%20%3D%3E%20(%7B%5Cn%20%20...model%2C%5Cn%20%20...providerBases%5Bprovider%5D%2C%5Cn%20%20...(reasoningEfforts%5Cn%20%20%20%20%3F%20%7B%5Cn%20%20%20%20%20%20%20%20reasoningEfforts%3A%20reasoningEfforts.map((%5Bvalue%2C%20label%5D)%20%3D%3E%20(%7B%5Cn%20%20%20%20%20%20%20%20%20%20value%2C%5Cn%20%20%20%20%20%20%20%20%20%20label%2C%5Cn%20%20%20%20%20%20%20%20%7D))%20satisfies%20readonly%20ModelSelectorReasoningEffortOption%5B%5D%2C%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%3A%20%7B%7D)%2C%5Cn%7D))%20satisfies%20readonly%20ModelSelectorOption%5B%5D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[2]||(e[2]=()=>{n.value=!1}),vueCode:t(w)},h({_:2},[f.value?{name:"vue",fn:o(()=>[s(t(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[8]||(e[8]=r('<h3 id="插槽定制" tabindex="-1">插槽定制 <a class="header-anchor" href="#插槽定制" aria-label="Permalink to &quot;插槽定制&quot;">​</a></h3><p>通过 <code>trigger</code>、<code>header</code>、<code>item</code>、<code>empty</code> 和 <code>footer</code> 插槽调整显示内容，不改变组件的选择、搜索和键盘交互。这个案例保留了更完整的面板层次和 effort 操作区，适合查看每个插槽能拿到哪些数据，以及如何替换默认展示。</p>',2)),p(s(t(m),null,null,512),[[c,n.value]]),s(a,null,{default:o(()=>[s(t(C),{title:"完整插槽组合",description:"自定义 Trigger、面板头、模型项、空状态和 footer。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[3]||(e[3]=()=>{n.value=!1}),vueCode:t(x)},h({_:2},[y.value?{name:"vue",fn:o(()=>[s(t(y))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[9]||(e[9]=k("h4",{id:"图标-trigger",tabindex:"-1"},[v("图标 Trigger "),k("a",{class:"header-anchor",href:"#图标-trigger","aria-label":'Permalink to "图标 Trigger"'},"​")],-1)),e[10]||(e[10]=k("p",null,[k("code",null,"trigger"),v(" 插槽可以在桌面端显示图标与模型名称，在移动端只显示图标。插槽只替换按钮内容，组件仍然保留外层按钮的打开关闭、键盘操作和 ARIA 语义；没有图标时应回退到 "),k("code",null,"label"),v("，避免出现空按钮。由于插槽会替换默认内容，示例同时自行渲染下拉箭头。")],-1)),p(s(t(m),null,null,512),[[c,n.value]]),s(a,null,{default:o(()=>[s(t(C),{title:"响应式图标 Trigger",description:"桌面端显示模型名称，移动端仅显示模型图标。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[4]||(e[4]=()=>{n.value=!1}),vueCode:t(_)},h({_:2},[E.value?{name:"vue",fn:o(()=>[s(t(E))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[11]||(e[11]=r(`<h2 id="状态规则" tabindex="-1">状态规则 <a class="header-anchor" href="#状态规则" aria-label="Permalink to &quot;状态规则&quot;">​</a></h2><h3 id="受控与非受控" tabindex="-1">受控与非受控 <a class="header-anchor" href="#受控与非受控" aria-label="Permalink to &quot;受控与非受控&quot;">​</a></h3><ul><li>传入 <code>v-model</code> / <code>modelValue</code> 时，当前模型由外部维护；否则组件使用 <code>defaultValue</code> 作为初始值，并在用户选择后自己更新。</li><li>传入 <code>v-model:reasoning-effort</code> / <code>reasoningEffort</code> 时，思考强度由外部维护；否则组件使用 <code>defaultReasoningEffort</code> 作为初始值，并在用户选择后自己更新。</li><li>传入 <code>open</code> 时，浮层开关由外部维护；否则组件使用 <code>defaultOpen</code> 作为初始开关，并在用户交互后自己更新。</li><li>同一个组件实例生命周期内不要在受控与非受控之间切换。开发环境会对此给出警告。</li><li>受控模式下，消费方需要响应对应的 <code>update:modelValue</code>、<code>update:reasoningEffort</code> 或 <code>update:open</code> 并回写状态；未回写时组件不会自行修改受控值。</li></ul><h3 id="禁用语义" tabindex="-1">禁用语义 <a class="header-anchor" href="#禁用语义" aria-label="Permalink to &quot;禁用语义&quot;">​</a></h3><ul><li>组件 <code>disabled</code>：禁用 Trigger、保持面板关闭，并禁止模型和 reasoning effort 选择。</li><li>模型项 <code>disabled</code>：保留展示，但不可选择。</li><li>reasoning effort 项 <code>disabled</code>：仅禁用对应的 effort 选项。</li></ul><h3 id="值与事件语义" tabindex="-1">值与事件语义 <a class="header-anchor" href="#值与事件语义" aria-label="Permalink to &quot;值与事件语义&quot;">​</a></h3><table tabindex="0"><thead><tr><th>场景</th><th>结果</th></tr></thead><tbody><tr><td>未提供初始值</td><td>显示 <code>placeholder</code>，不会默认选择第一项</td></tr><tr><td>初始化、外部赋值、更新 <code>models</code></td><td>不触发 <code>change</code></td></tr><tr><td>当前值不存在或对应项被移除</td><td>保留原值，显示 <code>placeholder</code>，不自动回退</td></tr><tr><td>用户选择新项</td><td>依次请求更新 value、触发 <code>change</code>、请求关闭浮层</td></tr><tr><td>用户重复选择当前项</td><td>只请求关闭，不重复触发 value 更新或 <code>change</code></td></tr><tr><td><code>models</code> 存在重复 <code>value</code></td><td>仅第一项参与渲染；开发环境输出警告</td></tr><tr><td>当前项或组件被禁用</td><td>禁止选择；组件禁用时浮层保持关闭</td></tr></tbody></table><p><code>ModelSelectorOption.value</code> 应在列表中保持唯一。组件通过 value 判断选中状态，因此不要把 label 当作稳定标识。</p><h2 id="搜索与分组" tabindex="-1">搜索与分组 <a class="header-anchor" href="#搜索与分组" aria-label="Permalink to &quot;搜索与分组&quot;">​</a></h2><p>默认搜索会进行不区分大小写的包含匹配，搜索文本由以下字段共同组成：</p><ul><li><code>label</code></li><li><code>value</code></li><li><code>description</code></li><li><code>group</code></li></ul><p>传入 <code>filterMethod(query, option)</code> 后将完全使用自定义过滤函数。设置 <code>searchable=false</code> 会隐藏搜索框并直接展示全部选项。</p><p><code>searchable</code> 默认为 <code>false</code>；需要搜索时应显式设置为 <code>true</code>。</p><p><code>group</code> 同时用作分组标识和显示名称。未设置分组字段的模型会进入无标题分组。</p><h2 id="思考强度" tabindex="-1">思考强度 <a class="header-anchor" href="#思考强度" aria-label="Permalink to &quot;思考强度&quot;">​</a></h2><p>每个模型通过 <code>ModelSelectorOption.reasoningEfforts</code> 声明自己支持的推理强度：</p><ul><li><code>true</code> 使用内置的 <code>Low</code>、<code>Medium</code>、<code>High</code> 三个选项；</li><li>自定义数组可定义任意 <code>value</code>、<code>label</code>，并通过 <code>disabled</code> 禁用单个选项；</li><li><code>false</code>、<code>undefined</code> 或空数组表示当前模型不提供 effort；</li><li>自定义数组中的重复 <code>value</code> 只保留第一项，开发环境会输出警告。</li></ul><p><code>reasoningEffort</code> / <code>defaultReasoningEffort</code> 保存的是用户选择过的值，并在切换模型时保持不变。组件不会因为新模型不支持该值而自动清空，也不会在模型切换时触发 reasoning effort 事件：</p><table tabindex="0"><thead><tr><th>当前模型状态</th><th>解析结果</th></tr></thead><tbody><tr><td>支持当前 reasoning effort 值</td><td>默认 Trigger 显示对应 label，默认 Footer 激活该项，插槽收到对应 <code>reasoningEffortOption</code></td></tr><tr><td>声明了 reasoningEfforts，但不支持当前值</td><td>用户选择过的值继续保留；默认 Trigger 不显示 reasoning effort，默认 Footer 无激活项，插槽收到 <code>reasoningEffortOption: null</code></td></tr><tr><td>未声明 reasoningEfforts</td><td>用户选择过的值继续保留；不渲染默认 reasoning effort Footer，Trigger 与插槽中的 <code>reasoningEffortOption</code> 均为空</td></tr><tr><td>后续切回支持同一 reasoning effort 值的模型</td><td>该值重新显示为激活项，不额外触发 <code>update:reasoningEffort</code> 或 <code>reasoning-effort-change</code></td></tr></tbody></table><p>用户通过默认 Footer 或 <code>footer</code> 插槽的 <code>setReasoningEffort()</code> 选择新值时，依次触发 <code>update:reasoningEffort</code> 和 <code>reasoning-effort-change</code>，不会关闭浮层。重复选择当前值、选择未声明值、禁用项，或当前模型处于禁用状态时不会触发事件；<code>setReasoningEffort(null)</code> 可清空保存的 reasoning effort。</p><p>提供 <code>footer</code> 插槽后会完整替换默认 reasoning effort Footer，而不是追加内容。插槽会收到当前模型可选的 <code>reasoningEfforts</code>、当前真正可用的 <code>reasoningEffortOption</code>，以及已经内置禁用和去重规则的 <code>setReasoningEffort()</code>，因此不需要在消费层重复维护选项列表或选择规则。</p><h2 id="键盘与可访问性" tabindex="-1">键盘与可访问性 <a class="header-anchor" href="#键盘与可访问性" aria-label="Permalink to &quot;键盘与可访问性&quot;">​</a></h2><table tabindex="0"><thead><tr><th>位置</th><th>按键</th><th>行为</th></tr></thead><tbody><tr><td>Trigger</td><td>点击</td><td>打开/关闭面板</td></tr><tr><td>Trigger</td><td><code>Enter</code></td><td>打开面板</td></tr><tr><td>Trigger</td><td><code>Space</code></td><td>通过原生按钮点击行为打开或关闭</td></tr><tr><td>Trigger / Panel</td><td><code>Escape</code></td><td>关闭浮层，并在键盘关闭或选择后恢复 Trigger 焦点</td></tr><tr><td>搜索框 / Listbox</td><td><code>ArrowDown</code> / <code>ArrowUp</code></td><td>跳过禁用项移动高亮</td></tr><tr><td>非搜索模式的 Listbox</td><td><code>Home</code> / <code>End</code></td><td>跳到首个或末个可用项；搜索框始终保留原生文本编辑语义</td></tr><tr><td>搜索框 / Listbox</td><td><code>Enter</code></td><td>选择高亮项；输入法组合期间不会误选</td></tr><tr><td>Listbox</td><td><code>Space</code></td><td>选择高亮项</td></tr><tr><td>Effort 按钮</td><td><code>Enter</code> / <code>Space</code></td><td>通过原生按钮行为切换 effort，不关闭浮层</td></tr></tbody></table><p>组件已内置常见键盘操作和 ARIA 属性。除非你在插槽中放入复杂内容，一般不需要额外处理。Trigger 是真实的 <code>button</code>，Panel 使用 <code>combobox</code>、<code>listbox</code> 和 <code>option</code> 表达选择状态；组件使用 <code>placeholder</code>、<code>searchPlaceholder</code> 和 <code>reasoningEffortLabel</code> 生成对应的可访问名称。</p><p>组件不会拦截 <code>Tab</code> 或重排页面焦点，Panel 也不会因为 Tab 离开而自动关闭。由于 Panel 可能 Teleport 到 <code>document.body</code> 末尾，离开 Panel 后的目标由 Teleport 后的实际 DOM 顺序决定。如需关闭面板，可使用 <code>Escape</code>、outside pointer 或受控 <code>open</code>。</p><div class="warning custom-block"><p class="custom-block-title">插槽中的交互元素</p><p><code>trigger</code> 只替换内部真实 <code>button</code> 的内容，不要在其中嵌套 button、link、input 等交互元素。<code>item</code> 位于 <code>role=&quot;option&quot;</code> 内，也只应渲染非交互内容。</p><p><code>header</code> 与 <code>footer</code> 可以放置按钮、链接或表单控件。组件会保留这些控件的 Enter、Space 和 Tab 行为，不会将它们误判为模型选择。</p></div><h2 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h2><table tabindex="0"><thead><tr><th>属性名</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>models</code></td><td><code>readonly ModelSelectorOption[]</code></td><td><code>[]</code></td><td>模型列表；每项可通过 <code>reasoningEfforts</code> 声明推理强度</td></tr><tr><td><code>modelValue</code></td><td><code>string | null</code></td><td><code>undefined</code></td><td>受控选中值；传入后需响应 <code>update:modelValue</code></td></tr><tr><td><code>defaultValue</code></td><td><code>string | null</code></td><td><code>null</code></td><td>非受控初始值，仅初始化时使用</td></tr><tr><td><code>reasoningEffort</code></td><td><code>string | null</code></td><td><code>undefined</code></td><td>受控推理强度；传入后需响应 <code>update:reasoningEffort</code></td></tr><tr><td><code>defaultReasoningEffort</code></td><td><code>string | null</code></td><td><code>null</code></td><td>非受控 reasoning effort 初始值，仅初始化时使用</td></tr><tr><td><code>open</code></td><td><code>boolean</code></td><td><code>undefined</code></td><td>受控开关；传入后需响应 <code>update:open</code></td></tr><tr><td><code>defaultOpen</code></td><td><code>boolean</code></td><td><code>false</code></td><td>非受控初始开关</td></tr><tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td><td>禁用 Trigger、保持面板关闭，并禁止模型和 reasoning effort 选择</td></tr><tr><td><code>searchable</code></td><td><code>boolean</code></td><td><code>false</code></td><td>是否显示搜索框</td></tr><tr><td><code>placeholder</code></td><td><code>string</code></td><td><code>&#39;选择模型&#39;</code></td><td>无匹配选中项时的 Trigger 文本</td></tr><tr><td><code>searchPlaceholder</code></td><td><code>string</code></td><td><code>&#39;搜索模型&#39;</code></td><td>搜索框占位文本</td></tr><tr><td><code>emptyText</code></td><td><code>string</code></td><td><code>&#39;暂无可用模型&#39;</code></td><td>默认空状态文本</td></tr><tr><td><code>filterMethod</code></td><td><code>ModelSelectorFilterMethod</code></td><td>内置包含匹配</td><td>自定义搜索过滤函数</td></tr><tr><td><code>variant</code></td><td><code>&#39;outline&#39; | &#39;ghost&#39; | &#39;muted&#39;</code></td><td><code>&#39;outline&#39;</code></td><td>Trigger 外观</td></tr><tr><td><code>size</code></td><td><code>&#39;small&#39; | &#39;normal&#39; | &#39;large&#39;</code></td><td><code>&#39;normal&#39;</code></td><td>Trigger 与 Panel 尺寸</td></tr><tr><td><code>placement</code></td><td><code>Placement</code></td><td><code>&#39;bottom-start&#39;</code></td><td>Floating UI 浮层位置</td></tr><tr><td><code>offset</code></td><td><code>number</code></td><td><code>8</code></td><td>Trigger 与浮层的间距</td></tr><tr><td><code>appendTo</code></td><td><code>string | HTMLElement</code></td><td>当前 ShadowRoot 或 <code>document.body</code></td><td>Teleport 目标；默认使用当前 ShadowRoot 或 <code>document.body</code>，选择器未命中时回退到默认目标</td></tr><tr><td><code>panelClass</code></td><td><code>string | readonly string[] | Record&lt;string, boolean&gt;</code></td><td>-</td><td>附加到 Panel 根元素的 class</td></tr><tr><td><code>reasoningEffortLabel</code></td><td><code>string</code></td><td><code>&#39;Thinking&#39;</code></td><td>默认 reasoning effort Footer 的可见标题</td></tr></tbody></table><h2 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h2><table tabindex="0"><thead><tr><th>事件名</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>update:modelValue</code></td><td><code>(value: string | null)</code></td><td>用户选择不同模型时请求更新 value</td></tr><tr><td><code>change</code></td><td><code>(option: ModelSelectorOption)</code></td><td>用户选择不同模型后触发，返回完整选项</td></tr><tr><td><code>update:reasoningEffort</code></td><td><code>(value: string | null)</code></td><td>用户选择或清空 reasoning effort 时请求更新当前值</td></tr><tr><td><code>reasoning-effort-change</code></td><td><code>(option: ModelSelectorReasoningEffortOption | null)</code></td><td>reasoning effort 请求变化后触发，返回对应选项</td></tr><tr><td><code>update:open</code></td><td><code>(open: boolean)</code></td><td>用户交互或组件状态变化请求更新浮层开关</td></tr></tbody></table><p>用户选择新模型时，事件顺序为 <code>update:modelValue</code> → <code>change</code> → <code>update:open(false)</code>；选择新 reasoning effort 时，事件顺序为 <code>update:reasoningEffort</code> → <code>reasoning-effort-change</code>。初始化、外部赋值、<code>models</code> 更新和模型切换时的 reasoning effort 重新解析都不会触发对应 change 事件。</p><h2 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h2><table tabindex="0"><thead><tr><th>插槽名</th><th>作用域参数</th><th>说明</th></tr></thead><tbody><tr><td><code>trigger</code></td><td><code>{ option, label, open, reasoningEffortOption }</code></td><td>替换内部 Trigger 按钮的内容</td></tr><tr><td><code>item</code></td><td><code>{ option, selected, highlighted }</code></td><td>自定义选项内容；禁用状态从 <code>option.disabled</code> 获取</td></tr><tr><td><code>empty</code></td><td><code>{ query }</code></td><td>自定义空状态</td></tr><tr><td><code>header</code></td><td><code>{ option, query, close }</code></td><td>Panel 顶部扩展区</td></tr><tr><td><code>footer</code></td><td><code>{ option, query, close, reasoningEfforts, reasoningEffortOption, setReasoningEffort }</code></td><td>完整替换默认 reasoning effort Footer</td></tr></tbody></table><p><code>close()</code> 会请求关闭浮层；关闭成功后恢复 Trigger 焦点。受控 <code>open</code> 未回写为 <code>false</code> 时，组件不会强制关闭。<code>trigger</code> 和 <code>footer</code> 中的 <code>reasoningEffortOption</code> 是当前模型真正可用的选项：保存的值不受支持时为 <code>null</code>。<code>setReasoningEffort(value)</code> 复用默认 UI 的校验和事件语义。</p><h2 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h2><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { Placement } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@floating-ui/dom&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { Component, VNode } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorVariant</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;outline&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;ghost&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;muted&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorSize</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;small&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;normal&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;large&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorPanelClass</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> readonly</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorReasoningEffortOption</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  readonly</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  readonly</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> label</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  readonly</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> disabled</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorReasoningEfforts</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> readonly</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorReasoningEffortOption</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorOption</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  label</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  description</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  icon</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Component</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  disabled</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  group</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  reasoningEfforts</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorReasoningEfforts</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorFilterMethod</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">query</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">option</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorOption</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  models</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> readonly</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorOption</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  modelValue</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  defaultValue</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  reasoningEffort</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  defaultReasoningEffort</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  open</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  defaultOpen</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  disabled</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  searchable</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  placeholder</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  searchPlaceholder</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  emptyText</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  filterMethod</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorFilterMethod</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  variant</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorVariant</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  size</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorSize</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  placement</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Placement</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  offset</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  appendTo</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> HTMLElement</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  panelClass</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorPanelClass</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  reasoningEffortLabel</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorTriggerSlotProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  option</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorOption</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  label</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  open</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** The effort supported by the selected model. Unsupported saved values are exposed as null. */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  reasoningEffortOption</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorReasoningEffortOption</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorItemSlotProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  option</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorOption</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  selected</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  highlighted</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorEmptySlotProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  query</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorSlotProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  option</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorOption</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  query</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  close</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorFooterSlotProps</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorSlotProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  reasoningEfforts</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> readonly</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorReasoningEffortOption</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** The effort supported by the selected model. Unsupported saved values are exposed as null. */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  reasoningEffortOption</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorReasoningEffortOption</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  setReasoningEffort</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorSlots</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  trigger</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">props</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorTriggerSlotProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  item</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">props</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorItemSlotProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  empty</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">props</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorEmptySlotProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  header</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">props</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorSlotProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  footer</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">props</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorFooterSlotProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorEmits</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">event</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;update:modelValue&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">event</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;change&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">option</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorOption</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">event</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;update:reasoningEffort&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">event</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;reasoning-effort-change&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">option</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ModelSelectorReasoningEffortOption</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">event</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;update:open&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">open</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="css-变量" tabindex="-1">CSS 变量 <a class="header-anchor" href="#css-变量" aria-label="Permalink to &quot;CSS 变量&quot;">​</a></h2><table tabindex="0"><thead><tr><th>变量名</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-model-selector-trigger-text-color</code></td><td><code>var(--tr-text-primary)</code></td><td>Trigger 文本颜色</td></tr><tr><td><code>--tr-model-selector-trigger-icon-color</code></td><td><code>var(--tr-text-secondary)</code></td><td>Trigger 图标与箭头颜色</td></tr><tr><td><code>--tr-model-selector-trigger-effort-color</code></td><td><code>var(--tr-text-tertiary)</code></td><td>Trigger effort 文本颜色</td></tr><tr><td><code>--tr-model-selector-trigger-outline-bg</code></td><td><code>var(--tr-container-bg-default)</code></td><td>outline 背景</td></tr><tr><td><code>--tr-model-selector-trigger-outline-border</code></td><td><code>var(--tr-border-color-default)</code></td><td>outline 边框</td></tr><tr><td><code>--tr-model-selector-trigger-ghost-bg</code></td><td><code>transparent</code></td><td>ghost 背景</td></tr><tr><td><code>--tr-model-selector-trigger-ghost-border</code></td><td><code>transparent</code></td><td>ghost 边框</td></tr><tr><td><code>--tr-model-selector-trigger-muted-bg</code></td><td><code>var(--tr-container-bg-default-2)</code></td><td>muted 背景</td></tr><tr><td><code>--tr-model-selector-trigger-muted-border</code></td><td><code>transparent</code></td><td>muted 边框</td></tr><tr><td><code>--tr-model-selector-trigger-hover-bg</code></td><td><code>var(--tr-container-bg-hover)</code></td><td>Trigger hover/open 背景</td></tr><tr><td><code>--tr-model-selector-trigger-hover-border</code></td><td><code>var(--tr-border-color-hover)</code></td><td>Trigger hover/open 边框</td></tr><tr><td><code>--tr-model-selector-trigger-disabled-color</code></td><td><code>var(--tr-text-disabled)</code></td><td>Trigger 禁用颜色</td></tr><tr><td><code>--tr-model-selector-panel-bg</code></td><td><code>var(--tr-dropdown-menu-bg-color)</code></td><td>Panel 背景</td></tr><tr><td><code>--tr-model-selector-panel-border</code></td><td><code>var(--tr-border-color-default)</code></td><td>Panel 边框</td></tr><tr><td><code>--tr-model-selector-panel-shadow</code></td><td><code>var(--tr-dropdown-menu-box-shadow)</code></td><td>Panel 阴影</td></tr><tr><td><code>--tr-model-selector-divider-color</code></td><td><code>var(--tr-border-color-default)</code></td><td>Header、搜索框与 Footer 分隔线</td></tr><tr><td><code>--tr-model-selector-item-color</code></td><td><code>var(--tr-dropdown-menu-item-color)</code></td><td>选项文本颜色</td></tr><tr><td><code>--tr-model-selector-item-description-color</code></td><td><code>var(--tr-text-tertiary)</code></td><td>选项描述颜色</td></tr><tr><td><code>--tr-model-selector-item-hover-bg</code></td><td><code>var(--tr-dropdown-menu-item-hover-bg-color)</code></td><td>选项 hover/highlight 背景</td></tr><tr><td><code>--tr-model-selector-item-selected-color</code></td><td><code>var(--tr-color-primary)</code></td><td>选中项强调色</td></tr><tr><td><code>--tr-model-selector-item-disabled-color</code></td><td><code>var(--tr-text-disabled)</code></td><td>禁用项颜色</td></tr><tr><td><code>--tr-model-selector-group-title-color</code></td><td><code>var(--tr-text-tertiary)</code></td><td>分组标题颜色</td></tr><tr><td><code>--tr-model-selector-empty-color</code></td><td><code>var(--tr-text-secondary)</code></td><td>空状态颜色</td></tr><tr><td><code>--tr-model-selector-scrollbar-color</code></td><td><code>var(--tr-dropdown-menu-scrollbar-thumb-color)</code></td><td>列表滚动条颜色</td></tr><tr><td><code>--tr-model-selector-effort-label-color</code></td><td><code>var(--tr-text-secondary)</code></td><td>Effort 标题颜色</td></tr><tr><td><code>--tr-model-selector-effort-option-color</code></td><td><code>var(--tr-text-secondary)</code></td><td>Effort 选项文字颜色</td></tr><tr><td><code>--tr-model-selector-effort-option-border</code></td><td><code>var(--tr-border-color-default)</code></td><td>Effort 选项边框</td></tr><tr><td><code>--tr-model-selector-effort-option-bg</code></td><td><code>transparent</code></td><td>Effort 选项背景</td></tr><tr><td><code>--tr-model-selector-effort-option-hover-bg</code></td><td><code>var(--tr-container-bg-hover)</code></td><td>Effort 选项 hover 背景</td></tr><tr><td><code>--tr-model-selector-effort-option-active-color</code></td><td><code>var(--tr-color-primary)</code></td><td>Effort 激活文字颜色</td></tr><tr><td><code>--tr-model-selector-effort-option-active-border</code></td><td><code>var(--tr-color-primary)</code></td><td>Effort 激活边框</td></tr><tr><td><code>--tr-model-selector-effort-option-active-bg</code></td><td><code>color-mix(in srgb, var(--tr-color-primary) 12%, transparent)</code></td><td>Effort 激活背景</td></tr><tr><td><code>--tr-model-selector-effort-option-disabled-color</code></td><td><code>var(--tr-text-disabled)</code></td><td>Effort 禁用文字颜色</td></tr></tbody></table>`,38))])}}});export{V as __pageData,O as default};
