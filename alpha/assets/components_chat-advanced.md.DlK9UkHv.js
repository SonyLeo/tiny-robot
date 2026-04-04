const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/mcp-minimal.Bd0xfL45.js","assets/chunks/index.3BH5zFw1.js","assets/chunks/useConversation.DSauX1Ba.js","assets/chunks/framework.CtXINCeU.js","assets/chunks/useMessage.ClY3tPPj.js","assets/chunks/utils.DCcUktrc.js","assets/chunks/theme.uYXqZGAi.js","assets/chunks/useMcpManager.RJrKzE9v.js","assets/chunks/toolPlugin.FeKYxgZB.js","assets/chunks/workspace-panel-slots.BCI7LgqH.js"])))=>i.map(i=>d[i]);
import{aD as p,bQ as c,aZ as f,aL as A,v as y,H as r,bL as h,bB as C,J as t,bk as n,bJ as i,G as E,b7 as g,aU as B}from"./chunks/framework.CtXINCeU.js";import{L as k,N as u}from"./chunks/index.DZKug4fT.js";const m=`<template>
  <div class="chat-demo-shell">
    <div class="demo-tip">
      这个示例只展示 MCP 的最小前端接线： \`mcpManager + toolPlugin + runtime.mcpManager\`。 它不会额外模拟 \`tool_calls\`
      或假工具结果，真正的工具调用依赖你的模型或后端返回 \`tool_calls\`。
    </div>
    <div class="chat-demo-container">
      <TrChat
        :config="chatConfig"
        :runtime="runtime"
        :preset-overrides="{
          showHistory: false,
          showFeedback: false,
          placeholder: '这里的重点是 MCP 接入形状，不是模拟工具调用...',
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrChat, useMcpManager } from '@opentiny/tiny-robot-chat'
import { toolPlugin } from '@opentiny/tiny-robot-kit'
import type { PluginInfo } from '@opentiny/tiny-robot'

const initialPlugins: PluginInfo[] = [
  {
    id: 'docs-knowledge',
    name: 'Docs Knowledge',
    icon: 'DK',
    description: 'A minimal docs search MCP plugin used to show the integration shape.',
    enabled: true,
    expanded: true,
    tools: [
      {
        id: 'search_docs',
        name: 'Search Docs',
        description: 'Search the TinyRobot chat docs by keyword.',
        enabled: true,
      },
    ],
    category: 'documentation',
  },
]

const mcpManager = useMcpManager({ initialPlugins })

const chatConfig = {
  models: [{ id: 'gpt-4o-mini', providerId: 'openai', label: 'GPT-4o Mini' }],
  providers: {
    openai: {
      type: 'openai-compatible' as const,
      endpoint: '/api/chat/completions',
      systemPrompt: 'You are a helpful assistant for the TinyRobot docs.',
    },
  },
  defaults: {
    model: 'gpt-4o-mini',
  },
  ui: {
    brand: {
      title: 'MCP 最小集成',
    },
    welcome: {
      title: '先把 MCP 接到 TrChat 上',
      description:
        '这里不模拟工具调用，只展示最小前端 wiring。真实项目里再把 mcpManager.bridge 接到你的后端或 MCP bridge。',
    },
    prompts: [{ label: '打开 MCP 面板', description: '先看看插件和工具有没有接进来。' }],
  },
}

const runtime = {
  mcpManager,
  plugins: [
    toolPlugin({
      getTools: mcpManager.getTools,
      callTool: mcpManager.callTool,
    }),
  ],
}
<\/script>

<style scoped>
.chat-demo-shell {
  display: grid;
  gap: 12px;
}

.demo-tip {
  padding: 10px 12px;
  color: #475467;
  background: #f8fafc;
  border: 1px solid #dbe4f0;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.6;
}

.chat-demo-container {
  height: 560px;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 12px;
}
</style>
`,b=`<template>
  <div class="chat-demo-container">
    <TrChat :config="chatConfig" :runtime="{ chatKit, mcpManager }" :callbacks="{ onModelChange }">
      <template #left>
        <div class="workspace-left-panel">
          <header class="workspace-left-panel__brand">
            <strong>左侧占位面板</strong>
            <span>Workspace Slot 示例</span>
          </header>

          <button type="button" class="workspace-left-panel__action" @click="chatKit.createConversation()">
            + 新建会话
          </button>

          <div class="workspace-left-panel__note">
            这里直接替换了 \`TrChat\` 的左侧面板内容，但中间会话区、模型切换和默认运行时仍然保持不变。
          </div>

          <TrChat.HistorySurface class="workspace-left-panel__history" />
        </div>
      </template>

      <template #left-rail>
        <div class="workspace-left-rail">
          <span class="workspace-left-rail__mark">L</span>
          <span class="workspace-left-rail__text">Panel</span>
        </div>
      </template>

      <template #right>
        <div class="workspace-right-panel">
          <div class="workspace-right-panel__eyebrow">Right Slot</div>
          <h3>右侧占位内容</h3>
          <p>这个区域用于演示：继续使用 \`TrChat\` 时，也可以单独替换 workspace 右侧面板。</p>
          <div class="workspace-right-panel__placeholder">这里可以放预览、说明、详情，或者任何你自己的占位内容。</div>
        </div>
      </template>

      <template #mobile-right>
        <div class="workspace-mobile-sheet">
          <strong>移动端右侧内容</strong>
          <p>这里是 \`mobile-right\`，没有提供时会自动回退到 \`right\`。</p>
        </div>
      </template>
    </TrChat>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrChat, createChatAdapterFromConfig, useChatKit, useMcpManager } from '@opentiny/tiny-robot-chat'
import type { ModelOption } from '@opentiny/tiny-robot-chat'
import type { PluginInfo } from '@opentiny/tiny-robot'

const initialMessages = [
  {
    role: 'assistant',
    content: '你好，我是文档里的演示助手，已经为你准备好一组初始消息。',
  },
  {
    role: 'user',
    content: '请展示一下当前页面的定制效果。',
  },
  {
    role: 'assistant',
    content: '没问题，我们会直接把对应的 UI 差异渲染出来。',
  },
]

const initialPlugins: PluginInfo[] = [
  {
    id: 'docs-knowledge',
    name: 'Docs Knowledge',
    icon: 'DK',
    description: 'Provide lightweight documentation lookup tools for the docs chat demos.',
    enabled: true,
    expanded: true,
    tools: [
      {
        id: 'search_docs',
        name: 'Search Docs',
        description: 'Search demo documentation content by keyword.',
        enabled: true,
      },
    ],
    category: 'documentation',
  },
]

const chatConfig = {
  models: [
    { id: 'gpt-4o-mini', providerId: 'openai', label: 'GPT-4o Mini' },
    { id: 'gpt-4.1-mini', providerId: 'openai', label: 'GPT-4.1 Mini' },
  ],
  providers: {
    openai: {
      type: 'openai-compatible' as const,
      endpoint: '/api/chat/completions',
      systemPrompt: 'You are a helpful assistant for the TinyRobot docs.',
    },
  },
  defaults: {
    model: 'gpt-4o-mini',
  },
  shell: {
    variant: 'workspace' as const,
    leftRegion: {
      enabled: true,
      width: 320,
      collapsible: true,
      defaultOpen: true,
      collapseMode: 'rail' as const,
      railLabel: 'Control',
    },
    rightRegion: {
      enabled: true,
      width: 320,
      collapsible: true,
      defaultOpen: false,
      collapseMode: 'hidden' as const,
      railLabel: 'Preview',
    },
  },
  layout: {
    variant: 'workspace' as const,
    contentLayout: 'wide' as const,
  },
  ui: {
    brand: {
      title: 'workspace 面板级定制',
    },
    welcome: {
      title: '也能直接替换 workspace 面板',
      description: '保留默认聊天主区，只替换左侧控制台和右侧预览区。',
    },
  },
}

const adapter = createChatAdapterFromConfig(chatConfig)
const selectedModel = ref(adapter.defaultModel ?? adapter.models[0]?.value ?? 'gpt-4o-mini')
const mcpManager = useMcpManager({ initialPlugins })
const chatKit = useChatKit({
  responseProvider: adapter.createResponseProvider(selectedModel.value),
  initialMessages,
})

function onModelChange(model: ModelOption) {
  selectedModel.value = model.value
  chatKit.updateResponseProvider(adapter.createResponseProvider(model.value))
}
<\/script>

<style scoped>
.chat-demo-container {
  height: 620px;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 12px;
}

.workspace-left-panel {
  height: 100%;
  display: grid;
  grid-template-rows: auto auto auto minmax(0, 1fr);
  gap: 12px;
  padding: 18px 16px 16px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(247, 250, 255, 0.98) 100%);
}

.workspace-left-panel__brand {
  display: grid;
  gap: 2px;
}

.workspace-left-panel__brand strong {
  font-size: 15px;
}

.workspace-left-panel__brand span {
  color: var(--tr-text-secondary);
  font-size: 12px;
}

.workspace-left-panel__action {
  min-height: 40px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(180deg, #3670f3 0%, #2456d8 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.workspace-left-panel__note {
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.84);
  color: var(--tr-text-secondary);
  font-size: 12px;
  line-height: 1.55;
}

.workspace-left-panel__history {
  min-height: 0;
}

.workspace-left-rail {
  height: 100%;
  display: grid;
  align-content: start;
  justify-items: center;
  gap: 8px;
  padding: 18px 0;
  color: var(--tr-text-secondary);
}

.workspace-left-rail__mark {
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(47, 107, 255, 0.12);
  color: #2f6bff;
  font-size: 12px;
  font-weight: 700;
}

.workspace-left-rail__text {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.workspace-right-panel {
  height: 100%;
  display: grid;
  align-content: start;
  gap: 12px;
  padding: 18px 16px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(244, 248, 255, 1) 100%);
}

.workspace-right-panel__eyebrow {
  color: var(--tr-text-secondary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.workspace-right-panel h3,
.workspace-mobile-sheet strong {
  margin: 0;
  font-size: 16px;
}

.workspace-right-panel p,
.workspace-mobile-sheet p {
  margin: 0;
  color: var(--tr-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.workspace-right-panel__placeholder {
  padding: 14px 12px;
  border: 1px dashed rgba(15, 23, 42, 0.14);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.84);
  color: var(--tr-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

.workspace-mobile-sheet {
  height: 100%;
  display: grid;
  align-content: start;
  gap: 10px;
  padding: 20px 16px;
  background: #fff;
}
</style>
`,w=JSON.parse('{"title":"Chat 定制与进阶","description":"","frontmatter":{"outline":[2,3]},"headers":[],"relativePath":"components/chat-advanced.md","filePath":"components/chat-advanced.md"}'),x={name:"components/chat-advanced.md"},_=Object.assign(x,{setup(F){const l=g();p(async()=>{l.value=(await c(async()=>{const{default:s}=await import("./chunks/mcp-minimal.Bd0xfL45.js");return{default:s}},__vite__mapDeps([0,1,2,3,4,5,6,7,8]))).default});const a=B(!0),o=g();return p(async()=>{o.value=(await c(async()=>{const{default:s}=await import("./chunks/workspace-panel-slots.BCI7LgqH.js");return{default:s}},__vite__mapDeps([9,1,2,3,4,5,6,7]))).default}),(s,e)=>{const d=f("ClientOnly");return A(),y("div",null,[e[2]||(e[2]=r('<h1 id="chat-定制与进阶" tabindex="-1">Chat 定制与进阶 <a class="header-anchor" href="#chat-定制与进阶" aria-label="Permalink to &quot;Chat 定制与进阶&quot;">​</a></h1><p>这页只解决一个问题：</p><ul><li>当 <code>TrChat</code> 默认入口已经不够用时，应该如何升级到结构定制、运行时扩展和更高层装配</li></ul><p>如果你现在只是想先把 chat 跑起来，或者只是想查配置字段，建议先回到：</p><ul><li><a href="./chat.html">Chat 接入与入口</a></li><li><a href="./chat-features.html">Chat 配置与能力</a></li></ul><h2 id="什么时候该看这页" tabindex="-1">什么时候该看这页 <a class="header-anchor" href="#什么时候该看这页" aria-label="Permalink to &quot;什么时候该看这页&quot;">​</a></h2><p>适合：</p><ul><li>你已经熟悉 <code>TrChat</code>、<code>presetOverrides</code> 和常见 slots</li><li>你现在要继续扩消息动作、消息渲染或运行时结果</li><li>你要做 workspace 左右面板、页面结构重排，或接入 MCP</li></ul><p>不适合：</p><ul><li>第一次接入 <code>@opentiny/tiny-robot-chat</code></li><li>还没确认 <code>TrChat</code> 是否已经够用</li><li>还在查配置字段和能力开关写在哪里</li></ul><h2 id="定制升级路径" tabindex="-1">定制升级路径 <a class="header-anchor" href="#定制升级路径" aria-label="Permalink to &quot;定制升级路径&quot;">​</a></h2><p>建议按下面这条路径逐级升级：</p><table tabindex="0"><thead><tr><th style="text-align:left;">你要做什么</th><th style="text-align:left;">推荐入口</th><th style="text-align:left;">什么时候再往上走</th></tr></thead><tbody><tr><td style="text-align:left;">改布局、文案、默认开关</td><td style="text-align:left;"><code>presetOverrides</code></td><td style="text-align:left;">覆盖不够再用 slots</td></tr><tr><td style="text-align:left;">换局部 UI</td><td style="text-align:left;"><code>slots</code></td><td style="text-align:left;">默认结构本身不合适再进 <code>Scaffold</code></td></tr><tr><td style="text-align:left;">重排页面结构，但仍想复用默认配置能力</td><td style="text-align:left;"><code>TrChat.Scaffold</code></td><td style="text-align:left;">需要自己管 runtime 再进 <code>Provider</code></td></tr><tr><td style="text-align:left;">自己决定页面装配和底层输入</td><td style="text-align:left;"><code>TrChat.Provider</code></td><td style="text-align:left;">-</td></tr><tr><td style="text-align:left;">扩展消息动作、消息渲染、运行时消息结果</td><td style="text-align:left;"><code>presetOverrides</code> + 顶层 <code>runtime</code></td><td style="text-align:left;">-</td></tr></tbody></table><p>一条实用规则：</p><ul><li>先继续留在 <code>TrChat</code></li><li>确认默认入口真做不到时，再进入 <code>Scaffold</code> 或 <code>Provider</code></li></ul><h2 id="结构定制" tabindex="-1">结构定制 <a class="header-anchor" href="#结构定制" aria-label="Permalink to &quot;结构定制&quot;">​</a></h2><h3 id="继续使用-trchat-时-先试这-3-类手段" tabindex="-1">继续使用 <code>TrChat</code> 时，先试这 3 类手段 <a class="header-anchor" href="#继续使用-trchat-时-先试这-3-类手段" aria-label="Permalink to &quot;继续使用 `TrChat` 时，先试这 3 类手段&quot;">​</a></h3><ol><li><code>presetOverrides</code><ul><li>改布局模式、占位文案、默认能力开关</li></ul></li><li><code>slots</code><ul><li>替换 header、welcome、sender、message-list 局部内容</li></ul></li><li>workspace panel slots <ul><li>只替换 workspace 左右面板内容</li></ul></li></ol><p>常用 slots：</p><table tabindex="0"><thead><tr><th style="text-align:left;">slot</th><th style="text-align:left;">适合做什么</th></tr></thead><tbody><tr><td style="text-align:left;"><code>header-extra</code></td><td style="text-align:left;">给默认 header 右侧补按钮或工具位</td></tr><tr><td style="text-align:left;"><code>footer-extra</code></td><td style="text-align:left;">给默认 footer 顶部补说明或状态条</td></tr><tr><td style="text-align:left;"><code>welcome</code></td><td style="text-align:left;">替换欢迎区</td></tr><tr><td style="text-align:left;"><code>sender</code></td><td style="text-align:left;">接管底部输入区 UI，但保留默认运行时</td></tr><tr><td style="text-align:left;"><code>message-list</code></td><td style="text-align:left;">接管中间消息区</td></tr><tr><td style="text-align:left;"><code>left</code> / <code>left-rail</code> / <code>right</code></td><td style="text-align:left;">在 workspace 模式下替换左右面板内容</td></tr><tr><td style="text-align:left;"><code>mobile-left</code> / <code>mobile-right</code></td><td style="text-align:left;">在 workspace 模式下替换移动端 drawer / sheet</td></tr></tbody></table><h3 id="workspace-面板级定制" tabindex="-1">Workspace 面板级定制 <a class="header-anchor" href="#workspace-面板级定制" aria-label="Permalink to &quot;Workspace 面板级定制&quot;">​</a></h3><p>如果你只是想替换 workspace 左右面板内容，不需要为了这件事直接进入 <code>Scaffold</code> 或 <code>Provider</code>。</p><p>推荐顺序：</p><ul><li>继续使用 <code>TrChat</code></li><li>通过 <code>left / left-rail / right / mobile-left / mobile-right</code> 替换面板内容</li><li>保留默认聊天主区、模型选择和默认运行时</li></ul>',24)),h(t(n(k),null,null,512),[[C,a.value]]),t(d,null,{default:i(()=>[t(n(u),{title:"Workspace 面板级定制",description:"继续使用 TrChat，只替换 workspace 左右面板内容。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22workspace-panel-slots.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fworkspace-panel-slots.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22chat-demo-container%5C%22%3E%5Cn%20%20%20%20%3CTrChat%20%3Aconfig%3D%5C%22chatConfig%5C%22%20%3Aruntime%3D%5C%22%7B%20chatKit%2C%20mcpManager%20%7D%5C%22%20%3Acallbacks%3D%5C%22%7B%20onModelChange%20%7D%5C%22%3E%5Cn%20%20%20%20%20%20%3Ctemplate%20%23left%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22workspace-left-panel%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cheader%20class%3D%5C%22workspace-left-panel__brand%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cstrong%3E%E5%B7%A6%E4%BE%A7%E5%8D%A0%E4%BD%8D%E9%9D%A2%E6%9D%BF%3C%2Fstrong%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cspan%3EWorkspace%20Slot%20%E7%A4%BA%E4%BE%8B%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Fheader%3E%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%3Cbutton%20type%3D%5C%22button%5C%22%20class%3D%5C%22workspace-left-panel__action%5C%22%20%40click%3D%5C%22chatKit.createConversation()%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%2B%20%E6%96%B0%E5%BB%BA%E4%BC%9A%E8%AF%9D%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22workspace-left-panel__note%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%E8%BF%99%E9%87%8C%E7%9B%B4%E6%8E%A5%E6%9B%BF%E6%8D%A2%E4%BA%86%20%60TrChat%60%20%E7%9A%84%E5%B7%A6%E4%BE%A7%E9%9D%A2%E6%9D%BF%E5%86%85%E5%AE%B9%EF%BC%8C%E4%BD%86%E4%B8%AD%E9%97%B4%E4%BC%9A%E8%AF%9D%E5%8C%BA%E3%80%81%E6%A8%A1%E5%9E%8B%E5%88%87%E6%8D%A2%E5%92%8C%E9%BB%98%E8%AE%A4%E8%BF%90%E8%A1%8C%E6%97%B6%E4%BB%8D%E7%84%B6%E4%BF%9D%E6%8C%81%E4%B8%8D%E5%8F%98%E3%80%82%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%3CTrChat.HistorySurface%20class%3D%5C%22workspace-left-panel__history%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%5Cn%20%20%20%20%20%20%3Ctemplate%20%23left-rail%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22workspace-left-rail%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cspan%20class%3D%5C%22workspace-left-rail__mark%5C%22%3EL%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cspan%20class%3D%5C%22workspace-left-rail__text%5C%22%3EPanel%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%5Cn%20%20%20%20%20%20%3Ctemplate%20%23right%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22workspace-right-panel%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22workspace-right-panel__eyebrow%5C%22%3ERight%20Slot%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Ch3%3E%E5%8F%B3%E4%BE%A7%E5%8D%A0%E4%BD%8D%E5%86%85%E5%AE%B9%3C%2Fh3%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cp%3E%E8%BF%99%E4%B8%AA%E5%8C%BA%E5%9F%9F%E7%94%A8%E4%BA%8E%E6%BC%94%E7%A4%BA%EF%BC%9A%E7%BB%A7%E7%BB%AD%E4%BD%BF%E7%94%A8%20%60TrChat%60%20%E6%97%B6%EF%BC%8C%E4%B9%9F%E5%8F%AF%E4%BB%A5%E5%8D%95%E7%8B%AC%E6%9B%BF%E6%8D%A2%20workspace%20%E5%8F%B3%E4%BE%A7%E9%9D%A2%E6%9D%BF%E3%80%82%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22workspace-right-panel__placeholder%5C%22%3E%E8%BF%99%E9%87%8C%E5%8F%AF%E4%BB%A5%E6%94%BE%E9%A2%84%E8%A7%88%E3%80%81%E8%AF%B4%E6%98%8E%E3%80%81%E8%AF%A6%E6%83%85%EF%BC%8C%E6%88%96%E8%80%85%E4%BB%BB%E4%BD%95%E4%BD%A0%E8%87%AA%E5%B7%B1%E7%9A%84%E5%8D%A0%E4%BD%8D%E5%86%85%E5%AE%B9%E3%80%82%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%5Cn%20%20%20%20%20%20%3Ctemplate%20%23mobile-right%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22workspace-mobile-sheet%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cstrong%3E%E7%A7%BB%E5%8A%A8%E7%AB%AF%E5%8F%B3%E4%BE%A7%E5%86%85%E5%AE%B9%3C%2Fstrong%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cp%3E%E8%BF%99%E9%87%8C%E6%98%AF%20%60mobile-right%60%EF%BC%8C%E6%B2%A1%E6%9C%89%E6%8F%90%E4%BE%9B%E6%97%B6%E4%BC%9A%E8%87%AA%E5%8A%A8%E5%9B%9E%E9%80%80%E5%88%B0%20%60right%60%E3%80%82%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%3C%2FTrChat%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrChat%2C%20createChatAdapterFromConfig%2C%20useChatKit%2C%20useMcpManager%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20type%20%7B%20ModelOption%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20type%20%7B%20PluginInfo%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cnconst%20initialMessages%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20content%3A%20'%E4%BD%A0%E5%A5%BD%EF%BC%8C%E6%88%91%E6%98%AF%E6%96%87%E6%A1%A3%E9%87%8C%E7%9A%84%E6%BC%94%E7%A4%BA%E5%8A%A9%E6%89%8B%EF%BC%8C%E5%B7%B2%E7%BB%8F%E4%B8%BA%E4%BD%A0%E5%87%86%E5%A4%87%E5%A5%BD%E4%B8%80%E7%BB%84%E5%88%9D%E5%A7%8B%E6%B6%88%E6%81%AF%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20content%3A%20'%E8%AF%B7%E5%B1%95%E7%A4%BA%E4%B8%80%E4%B8%8B%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E7%9A%84%E5%AE%9A%E5%88%B6%E6%95%88%E6%9E%9C%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20content%3A%20'%E6%B2%A1%E9%97%AE%E9%A2%98%EF%BC%8C%E6%88%91%E4%BB%AC%E4%BC%9A%E7%9B%B4%E6%8E%A5%E6%8A%8A%E5%AF%B9%E5%BA%94%E7%9A%84%20UI%20%E5%B7%AE%E5%BC%82%E6%B8%B2%E6%9F%93%E5%87%BA%E6%9D%A5%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20initialPlugins%3A%20PluginInfo%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'docs-knowledge'%2C%5Cn%20%20%20%20name%3A%20'Docs%20Knowledge'%2C%5Cn%20%20%20%20icon%3A%20'DK'%2C%5Cn%20%20%20%20description%3A%20'Provide%20lightweight%20documentation%20lookup%20tools%20for%20the%20docs%20chat%20demos.'%2C%5Cn%20%20%20%20enabled%3A%20true%2C%5Cn%20%20%20%20expanded%3A%20true%2C%5Cn%20%20%20%20tools%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'search_docs'%2C%5Cn%20%20%20%20%20%20%20%20name%3A%20'Search%20Docs'%2C%5Cn%20%20%20%20%20%20%20%20description%3A%20'Search%20demo%20documentation%20content%20by%20keyword.'%2C%5Cn%20%20%20%20%20%20%20%20enabled%3A%20true%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%20%20category%3A%20'documentation'%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20chatConfig%20%3D%20%7B%5Cn%20%20models%3A%20%5B%5Cn%20%20%20%20%7B%20id%3A%20'gpt-4o-mini'%2C%20providerId%3A%20'openai'%2C%20label%3A%20'GPT-4o%20Mini'%20%7D%2C%5Cn%20%20%20%20%7B%20id%3A%20'gpt-4.1-mini'%2C%20providerId%3A%20'openai'%2C%20label%3A%20'GPT-4.1%20Mini'%20%7D%2C%5Cn%20%20%5D%2C%5Cn%20%20providers%3A%20%7B%5Cn%20%20%20%20openai%3A%20%7B%5Cn%20%20%20%20%20%20type%3A%20'openai-compatible'%20as%20const%2C%5Cn%20%20%20%20%20%20endpoint%3A%20'%2Fapi%2Fchat%2Fcompletions'%2C%5Cn%20%20%20%20%20%20systemPrompt%3A%20'You%20are%20a%20helpful%20assistant%20for%20the%20TinyRobot%20docs.'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20defaults%3A%20%7B%5Cn%20%20%20%20model%3A%20'gpt-4o-mini'%2C%5Cn%20%20%7D%2C%5Cn%20%20shell%3A%20%7B%5Cn%20%20%20%20variant%3A%20'workspace'%20as%20const%2C%5Cn%20%20%20%20leftRegion%3A%20%7B%5Cn%20%20%20%20%20%20enabled%3A%20true%2C%5Cn%20%20%20%20%20%20width%3A%20320%2C%5Cn%20%20%20%20%20%20collapsible%3A%20true%2C%5Cn%20%20%20%20%20%20defaultOpen%3A%20true%2C%5Cn%20%20%20%20%20%20collapseMode%3A%20'rail'%20as%20const%2C%5Cn%20%20%20%20%20%20railLabel%3A%20'Control'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20rightRegion%3A%20%7B%5Cn%20%20%20%20%20%20enabled%3A%20true%2C%5Cn%20%20%20%20%20%20width%3A%20320%2C%5Cn%20%20%20%20%20%20collapsible%3A%20true%2C%5Cn%20%20%20%20%20%20defaultOpen%3A%20false%2C%5Cn%20%20%20%20%20%20collapseMode%3A%20'hidden'%20as%20const%2C%5Cn%20%20%20%20%20%20railLabel%3A%20'Preview'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20layout%3A%20%7B%5Cn%20%20%20%20variant%3A%20'workspace'%20as%20const%2C%5Cn%20%20%20%20contentLayout%3A%20'wide'%20as%20const%2C%5Cn%20%20%7D%2C%5Cn%20%20ui%3A%20%7B%5Cn%20%20%20%20brand%3A%20%7B%5Cn%20%20%20%20%20%20title%3A%20'workspace%20%E9%9D%A2%E6%9D%BF%E7%BA%A7%E5%AE%9A%E5%88%B6'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20welcome%3A%20%7B%5Cn%20%20%20%20%20%20title%3A%20'%E4%B9%9F%E8%83%BD%E7%9B%B4%E6%8E%A5%E6%9B%BF%E6%8D%A2%20workspace%20%E9%9D%A2%E6%9D%BF'%2C%5Cn%20%20%20%20%20%20description%3A%20'%E4%BF%9D%E7%95%99%E9%BB%98%E8%AE%A4%E8%81%8A%E5%A4%A9%E4%B8%BB%E5%8C%BA%EF%BC%8C%E5%8F%AA%E6%9B%BF%E6%8D%A2%E5%B7%A6%E4%BE%A7%E6%8E%A7%E5%88%B6%E5%8F%B0%E5%92%8C%E5%8F%B3%E4%BE%A7%E9%A2%84%E8%A7%88%E5%8C%BA%E3%80%82'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20adapter%20%3D%20createChatAdapterFromConfig(chatConfig)%5Cnconst%20selectedModel%20%3D%20ref(adapter.defaultModel%20%3F%3F%20adapter.models%5B0%5D%3F.value%20%3F%3F%20'gpt-4o-mini')%5Cnconst%20mcpManager%20%3D%20useMcpManager(%7B%20initialPlugins%20%7D)%5Cnconst%20chatKit%20%3D%20useChatKit(%7B%5Cn%20%20responseProvider%3A%20adapter.createResponseProvider(selectedModel.value)%2C%5Cn%20%20initialMessages%2C%5Cn%7D)%5Cn%5Cnfunction%20onModelChange(model%3A%20ModelOption)%20%7B%5Cn%20%20selectedModel.value%20%3D%20model.value%5Cn%20%20chatKit.updateResponseProvider(adapter.createResponseProvider(model.value))%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.chat-demo-container%20%7B%5Cn%20%20height%3A%20620px%3B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20overflow%3A%20hidden%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-border-color-default%2C%20%23e5e6eb)%3B%5Cn%20%20border-radius%3A%2012px%3B%5Cn%7D%5Cn%5Cn.workspace-left-panel%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20grid-template-rows%3A%20auto%20auto%20auto%20minmax(0%2C%201fr)%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%20%20padding%3A%2018px%2016px%2016px%3B%5Cn%20%20background%3A%20linear-gradient(180deg%2C%20rgba(255%2C%20255%2C%20255%2C%200.96)%200%25%2C%20rgba(247%2C%20250%2C%20255%2C%200.98)%20100%25)%3B%5Cn%7D%5Cn%5Cn.workspace-left-panel__brand%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%202px%3B%5Cn%7D%5Cn%5Cn.workspace-left-panel__brand%20strong%20%7B%5Cn%20%20font-size%3A%2015px%3B%5Cn%7D%5Cn%5Cn.workspace-left-panel__brand%20span%20%7B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%7D%5Cn%5Cn.workspace-left-panel__action%20%7B%5Cn%20%20min-height%3A%2040px%3B%5Cn%20%20border%3A%200%3B%5Cn%20%20border-radius%3A%2012px%3B%5Cn%20%20background%3A%20linear-gradient(180deg%2C%20%233670f3%200%25%2C%20%232456d8%20100%25)%3B%5Cn%20%20color%3A%20%23fff%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20font-weight%3A%20700%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.workspace-left-panel__note%20%7B%5Cn%20%20padding%3A%2012px%3B%5Cn%20%20border-radius%3A%2014px%3B%5Cn%20%20background%3A%20rgba(255%2C%20255%2C%20255%2C%200.84)%3B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%20%20line-height%3A%201.55%3B%5Cn%7D%5Cn%5Cn.workspace-left-panel__history%20%7B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%5Cn.workspace-left-rail%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20align-content%3A%20start%3B%5Cn%20%20justify-items%3A%20center%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20padding%3A%2018px%200%3B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%7D%5Cn%5Cn.workspace-left-rail__mark%20%7B%5Cn%20%20width%3A%2026px%3B%5Cn%20%20height%3A%2026px%3B%5Cn%20%20display%3A%20inline-flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%20%20border-radius%3A%2010px%3B%5Cn%20%20background%3A%20rgba(47%2C%20107%2C%20255%2C%200.12)%3B%5Cn%20%20color%3A%20%232f6bff%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%20%20font-weight%3A%20700%3B%5Cn%7D%5Cn%5Cn.workspace-left-rail__text%20%7B%5Cn%20%20writing-mode%3A%20vertical-rl%3B%5Cn%20%20transform%3A%20rotate(180deg)%3B%5Cn%20%20font-size%3A%2011px%3B%5Cn%20%20font-weight%3A%20700%3B%5Cn%20%20letter-spacing%3A%200.12em%3B%5Cn%20%20text-transform%3A%20uppercase%3B%5Cn%7D%5Cn%5Cn.workspace-right-panel%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20align-content%3A%20start%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%20%20padding%3A%2018px%2016px%3B%5Cn%20%20background%3A%20linear-gradient(180deg%2C%20rgba(255%2C%20255%2C%20255%2C%200.98)%200%25%2C%20rgba(244%2C%20248%2C%20255%2C%201)%20100%25)%3B%5Cn%7D%5Cn%5Cn.workspace-right-panel__eyebrow%20%7B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%20%20font-size%3A%2011px%3B%5Cn%20%20font-weight%3A%20700%3B%5Cn%20%20letter-spacing%3A%200.08em%3B%5Cn%20%20text-transform%3A%20uppercase%3B%5Cn%7D%5Cn%5Cn.workspace-right-panel%20h3%2C%5Cn.workspace-mobile-sheet%20strong%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20font-size%3A%2016px%3B%5Cn%7D%5Cn%5Cn.workspace-right-panel%20p%2C%5Cn.workspace-mobile-sheet%20p%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20line-height%3A%201.6%3B%5Cn%7D%5Cn%5Cn.workspace-right-panel__placeholder%20%7B%5Cn%20%20padding%3A%2014px%2012px%3B%5Cn%20%20border%3A%201px%20dashed%20rgba(15%2C%2023%2C%2042%2C%200.14)%3B%5Cn%20%20border-radius%3A%2012px%3B%5Cn%20%20background%3A%20rgba(255%2C%20255%2C%20255%2C%200.84)%3B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%20%20line-height%3A%201.6%3B%5Cn%7D%5Cn%5Cn.workspace-mobile-sheet%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20align-content%3A%20start%3B%5Cn%20%20gap%3A%2010px%3B%5Cn%20%20padding%3A%2020px%2016px%3B%5Cn%20%20background%3A%20%23fff%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{a.value=!1}),vueCode:n(b)},E({_:2},[o.value?{name:"vue",fn:i(()=>[t(n(o))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[3]||(e[3]=r(`<h3 id="当-slots-不够时-trchat-scaffold" tabindex="-1">当 slots 不够时：<code>TrChat.Scaffold</code> <a class="header-anchor" href="#当-slots-不够时-trchat-scaffold" aria-label="Permalink to &quot;当 slots 不够时：\`TrChat.Scaffold\`&quot;">​</a></h3><p><code>TrChat.Scaffold</code> 适合：</p><ul><li>页面结构要改</li><li>但仍希望继续沿用默认配置能力和 <code>presetSlices</code></li></ul><p>可以把它理解成：</p><ul><li>“开始自己排页面”</li><li>“但还不想自己重写整条 config -&gt; preset -&gt; UI 装配链”</li></ul><p>一个最小示意：</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrChat</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Scaffold</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">config</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">chatConfig</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> v-slot</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{ chatKit, presetSlices }</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;TrChat.Layout&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;TrChat.Header v-bind=&quot;presetSlices.header&quot; /&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;TrChat.Welcome</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      v-if=&quot;chatKit.messages.value.length === 0 &amp;&amp; presetSlices.welcome&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      v-bind=&quot;presetSlices.welcome&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      @prompt-click=&quot;chatKit.sendMessage($event)&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    /&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;TrChat.MessageList v-else v-bind=&quot;presetSlices.messageList&quot; /&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;TrChat.Footer&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      &lt;TrChat.Sender v-bind=&quot;presetSlices.sender&quot; /&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;/TrChat.Footer&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;/TrChat.Layout&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/TrChat.Scaffold&gt;</span></span></code></pre></div><h3 id="需要自己接管-runtime-时-trchat-provider" tabindex="-1">需要自己接管 runtime 时：<code>TrChat.Provider</code> <a class="header-anchor" href="#需要自己接管-runtime-时-trchat-provider" aria-label="Permalink to &quot;需要自己接管 runtime 时：\`TrChat.Provider\`&quot;">​</a></h3><p><code>TrChat.Provider</code> 适合：</p><ul><li>你已经明确要自己装配页面</li><li>你愿意手动管理更底层输入</li><li>你已经有自己的 <code>chatKit</code> 或 <code>responseProvider</code></li></ul><p>一个最小示意：</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrChat</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Provider</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">chat-kit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">chatKit</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;div class=&quot;tr-chat&quot; style=&quot;height: 100%&quot;&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;TrChat.Header title=&quot;手动组合页面&quot; /&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;TrChat.MessageList /&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;TrChat.Footer&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      &lt;TrChat.Sender /&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;/TrChat.Footer&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;/div&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/TrChat.Provider&gt;</span></span></code></pre></div><p>如果你只是想替换 workspace 面板，不要直接从这里开始。</p><h2 id="运行时扩展" tabindex="-1">运行时扩展 <a class="header-anchor" href="#运行时扩展" aria-label="Permalink to &quot;运行时扩展&quot;">​</a></h2><h3 id="扩展消息下方动作" tabindex="-1">扩展消息下方动作 <a class="header-anchor" href="#扩展消息下方动作" aria-label="Permalink to &quot;扩展消息下方动作&quot;">​</a></h3><p>如果你想继续使用 <code>TrChat</code>，但要在消息下方增加业务动作，不需要先接管整页 <code>message-list</code>。</p><p>当前推荐入口：</p><ul><li><code>presetOverrides.messageActions</code></li><li><code>presetOverrides.messageActionsMode</code></li></ul><p>最小示例：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> presetOverrides</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  messageActions: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      id: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;save-case&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      label: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;保存到案例库&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      placement: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;operations&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      roles: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;assistant&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">      onClick</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">context</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(context.message)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="替换某类消息的默认渲染" tabindex="-1">替换某类消息的默认渲染 <a class="header-anchor" href="#替换某类消息的默认渲染" aria-label="Permalink to &quot;替换某类消息的默认渲染&quot;">​</a></h3><p>如果你只想替换某一类消息的默认渲染，不需要直接接管 <code>message-list</code>。</p><p>当前推荐入口：</p><ul><li><code>presetOverrides.bubbleRenderers</code></li></ul><p>最小示例：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> presetOverrides</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  bubbleRenderers: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    contentMatches: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        find</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">_message</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">content</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          content?.type </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">===</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;text&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &amp;&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> content.text?.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">startsWith</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;[card]&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        renderer: CustomCardRenderer,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        priority: </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>一个常见顺序是：</p><ol><li>先用 <code>messageTransforms</code> 改写结果</li><li>再用 <code>bubbleRenderers</code> 命中 renderer</li></ol><h3 id="运行时改写消息结果" tabindex="-1">运行时改写消息结果 <a class="header-anchor" href="#运行时改写消息结果" aria-label="Permalink to &quot;运行时改写消息结果&quot;">​</a></h3><p>如果你想在消息真正渲染前改写结果，当前推荐从 <code>runtime.messageTransforms</code> 进入。</p><p>当前支持：</p><ul><li><code>onChunk</code></li><li><code>onFinish</code></li></ul><p>最小示例：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> runtime</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  messageTransforms: {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    onFinish</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">message</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">      return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        content: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`[card] \${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">message</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">content</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ??</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;&#39;}\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        metadata: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          transformed: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>适合：</p><ul><li>过滤模型原始文本</li><li>给最终消息补 metadata</li><li>改写最终消息内容，再交给 renderer 命中</li></ul><h3 id="什么时候才需要看-chatkit-runtime" tabindex="-1">什么时候才需要看 <code>chatKit.runtime</code> <a class="header-anchor" href="#什么时候才需要看-chatkit-runtime" aria-label="Permalink to &quot;什么时候才需要看 \`chatKit.runtime\`&quot;">​</a></h3><p>大多数直接使用 <code>TrChat</code> 的页面，并不需要手动消费 runtime bridge。</p><p>只有在这些场景里，才值得继续往下看：</p><ul><li>你要读更细的请求状态</li><li>你要调试 streaming / request lifecycle</li><li>你要手动 <code>clear</code></li><li>你要手动 <code>saveMessages</code></li></ul><p>当前可用能力：</p><ul><li><code>chatKit.runtime.activeEngine</code></li><li><code>chatKit.runtime.requestState</code></li><li><code>chatKit.runtime.processingState</code></li><li><code>chatKit.runtime.isProcessing</code></li><li><code>chatKit.runtime.clear()</code></li><li><code>chatKit.runtime.saveMessages()</code></li></ul><h2 id="mcp-最小接入" tabindex="-1">MCP 最小接入 <a class="header-anchor" href="#mcp-最小接入" aria-label="Permalink to &quot;MCP 最小接入&quot;">​</a></h2><p>如果你现在要解决的不是“原理”，而是“先让模型能挂上 MCP 工具”，可以直接看这个最小 recipe。</p><p>最小闭环只需要 3 件事：</p><ol><li>用 <code>useMcpManager()</code> 托管工具列表和工具执行</li><li>用 <code>toolPlugin({ getTools, callTool })</code> 把工具接入消息请求链</li><li>把 <code>mcpManager</code> 通过 <code>runtime.mcpManager</code> 传给 <code>TrChat</code></li></ol>`,46)),h(t(n(k),null,null,512),[[C,a.value]]),t(d,null,{default:i(()=>[t(n(u),{title:"MCP 最小集成",description:"只展示 mcpManager + toolPlugin + runtime.mcpManager 的最小前端接线，不额外模拟工具调用。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22mcp-minimal.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fmcp-minimal.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22chat-demo-shell%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22demo-tip%5C%22%3E%5Cn%20%20%20%20%20%20%E8%BF%99%E4%B8%AA%E7%A4%BA%E4%BE%8B%E5%8F%AA%E5%B1%95%E7%A4%BA%20MCP%20%E7%9A%84%E6%9C%80%E5%B0%8F%E5%89%8D%E7%AB%AF%E6%8E%A5%E7%BA%BF%EF%BC%9A%20%60mcpManager%20%2B%20toolPlugin%20%2B%20runtime.mcpManager%60%E3%80%82%20%E5%AE%83%E4%B8%8D%E4%BC%9A%E9%A2%9D%E5%A4%96%E6%A8%A1%E6%8B%9F%20%60tool_calls%60%5Cn%20%20%20%20%20%20%E6%88%96%E5%81%87%E5%B7%A5%E5%85%B7%E7%BB%93%E6%9E%9C%EF%BC%8C%E7%9C%9F%E6%AD%A3%E7%9A%84%E5%B7%A5%E5%85%B7%E8%B0%83%E7%94%A8%E4%BE%9D%E8%B5%96%E4%BD%A0%E7%9A%84%E6%A8%A1%E5%9E%8B%E6%88%96%E5%90%8E%E7%AB%AF%E8%BF%94%E5%9B%9E%20%60tool_calls%60%E3%80%82%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22chat-demo-container%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrChat%5Cn%20%20%20%20%20%20%20%20%3Aconfig%3D%5C%22chatConfig%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aruntime%3D%5C%22runtime%5C%22%5Cn%20%20%20%20%20%20%20%20%3Apreset-overrides%3D%5C%22%7B%5Cn%20%20%20%20%20%20%20%20%20%20showHistory%3A%20false%2C%5Cn%20%20%20%20%20%20%20%20%20%20showFeedback%3A%20false%2C%5Cn%20%20%20%20%20%20%20%20%20%20placeholder%3A%20'%E8%BF%99%E9%87%8C%E7%9A%84%E9%87%8D%E7%82%B9%E6%98%AF%20MCP%20%E6%8E%A5%E5%85%A5%E5%BD%A2%E7%8A%B6%EF%BC%8C%E4%B8%8D%E6%98%AF%E6%A8%A1%E6%8B%9F%E5%B7%A5%E5%85%B7%E8%B0%83%E7%94%A8...'%2C%5Cn%20%20%20%20%20%20%20%20%7D%5C%22%5Cn%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrChat%2C%20useMcpManager%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20%7B%20toolPlugin%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20type%20%7B%20PluginInfo%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cnconst%20initialPlugins%3A%20PluginInfo%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'docs-knowledge'%2C%5Cn%20%20%20%20name%3A%20'Docs%20Knowledge'%2C%5Cn%20%20%20%20icon%3A%20'DK'%2C%5Cn%20%20%20%20description%3A%20'A%20minimal%20docs%20search%20MCP%20plugin%20used%20to%20show%20the%20integration%20shape.'%2C%5Cn%20%20%20%20enabled%3A%20true%2C%5Cn%20%20%20%20expanded%3A%20true%2C%5Cn%20%20%20%20tools%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'search_docs'%2C%5Cn%20%20%20%20%20%20%20%20name%3A%20'Search%20Docs'%2C%5Cn%20%20%20%20%20%20%20%20description%3A%20'Search%20the%20TinyRobot%20chat%20docs%20by%20keyword.'%2C%5Cn%20%20%20%20%20%20%20%20enabled%3A%20true%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%20%20category%3A%20'documentation'%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20mcpManager%20%3D%20useMcpManager(%7B%20initialPlugins%20%7D)%5Cn%5Cnconst%20chatConfig%20%3D%20%7B%5Cn%20%20models%3A%20%5B%7B%20id%3A%20'gpt-4o-mini'%2C%20providerId%3A%20'openai'%2C%20label%3A%20'GPT-4o%20Mini'%20%7D%5D%2C%5Cn%20%20providers%3A%20%7B%5Cn%20%20%20%20openai%3A%20%7B%5Cn%20%20%20%20%20%20type%3A%20'openai-compatible'%20as%20const%2C%5Cn%20%20%20%20%20%20endpoint%3A%20'%2Fapi%2Fchat%2Fcompletions'%2C%5Cn%20%20%20%20%20%20systemPrompt%3A%20'You%20are%20a%20helpful%20assistant%20for%20the%20TinyRobot%20docs.'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20defaults%3A%20%7B%5Cn%20%20%20%20model%3A%20'gpt-4o-mini'%2C%5Cn%20%20%7D%2C%5Cn%20%20ui%3A%20%7B%5Cn%20%20%20%20brand%3A%20%7B%5Cn%20%20%20%20%20%20title%3A%20'MCP%20%E6%9C%80%E5%B0%8F%E9%9B%86%E6%88%90'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20welcome%3A%20%7B%5Cn%20%20%20%20%20%20title%3A%20'%E5%85%88%E6%8A%8A%20MCP%20%E6%8E%A5%E5%88%B0%20TrChat%20%E4%B8%8A'%2C%5Cn%20%20%20%20%20%20description%3A%5Cn%20%20%20%20%20%20%20%20'%E8%BF%99%E9%87%8C%E4%B8%8D%E6%A8%A1%E6%8B%9F%E5%B7%A5%E5%85%B7%E8%B0%83%E7%94%A8%EF%BC%8C%E5%8F%AA%E5%B1%95%E7%A4%BA%E6%9C%80%E5%B0%8F%E5%89%8D%E7%AB%AF%20wiring%E3%80%82%E7%9C%9F%E5%AE%9E%E9%A1%B9%E7%9B%AE%E9%87%8C%E5%86%8D%E6%8A%8A%20mcpManager.bridge%20%E6%8E%A5%E5%88%B0%E4%BD%A0%E7%9A%84%E5%90%8E%E7%AB%AF%E6%88%96%20MCP%20bridge%E3%80%82'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20prompts%3A%20%5B%7B%20label%3A%20'%E6%89%93%E5%BC%80%20MCP%20%E9%9D%A2%E6%9D%BF'%2C%20description%3A%20'%E5%85%88%E7%9C%8B%E7%9C%8B%E6%8F%92%E4%BB%B6%E5%92%8C%E5%B7%A5%E5%85%B7%E6%9C%89%E6%B2%A1%E6%9C%89%E6%8E%A5%E8%BF%9B%E6%9D%A5%E3%80%82'%20%7D%5D%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20runtime%20%3D%20%7B%5Cn%20%20mcpManager%2C%5Cn%20%20plugins%3A%20%5B%5Cn%20%20%20%20toolPlugin(%7B%5Cn%20%20%20%20%20%20getTools%3A%20mcpManager.getTools%2C%5Cn%20%20%20%20%20%20callTool%3A%20mcpManager.callTool%2C%5Cn%20%20%20%20%7D)%2C%5Cn%20%20%5D%2C%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.chat-demo-shell%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%7D%5Cn%5Cn.demo-tip%20%7B%5Cn%20%20padding%3A%2010px%2012px%3B%5Cn%20%20color%3A%20%23475467%3B%5Cn%20%20background%3A%20%23f8fafc%3B%5Cn%20%20border%3A%201px%20solid%20%23dbe4f0%3B%5Cn%20%20border-radius%3A%2010px%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20line-height%3A%201.6%3B%5Cn%7D%5Cn%5Cn.chat-demo-container%20%7B%5Cn%20%20height%3A%20560px%3B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20overflow%3A%20hidden%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-border-color-default%2C%20%23e5e6eb)%3B%5Cn%20%20border-radius%3A%2012px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{a.value=!1}),vueCode:n(m)},E({_:2},[l.value?{name:"vue",fn:i(()=>[t(n(l))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[4]||(e[4]=r('<p>真正落地时，只需要把 <code>mcpManager.bridge</code> 对接到你的后端或真实 MCP bridge，让模型正常返回 <code>tool_calls</code> 即可。</p><h2 id="公开组件与工具函数" tabindex="-1">公开组件与工具函数 <a class="header-anchor" href="#公开组件与工具函数" aria-label="Permalink to &quot;公开组件与工具函数&quot;">​</a></h2><p>以下表格都对应 <a href="e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/index.ts" target="_blank" rel="noreferrer">packages/chat/src/index.ts</a> 当前真实导出的 public surface。</p><h3 id="trchat-compound-components" tabindex="-1"><code>TrChat</code> compound components <a class="header-anchor" href="#trchat-compound-components" aria-label="Permalink to &quot;`TrChat` compound components&quot;">​</a></h3><p>这些成员最适合做 whitebox 或半白盒组装：</p><table tabindex="0"><thead><tr><th style="text-align:left;">API</th><th style="text-align:left;">作用</th><th style="text-align:left;">适合什么时候用</th></tr></thead><tbody><tr><td style="text-align:left;"><code>TrChat.Scaffold</code></td><td style="text-align:left;">保留 config -&gt; preset -&gt; provider 链路，但自己排页面</td><td style="text-align:left;">想改结构但还想复用默认能力</td></tr><tr><td style="text-align:left;"><code>TrChat.Provider</code></td><td style="text-align:left;">建立 chat runtime / ui context 根</td><td style="text-align:left;">已有 <code>chatKit</code>，或要自己接 <code>responseProvider</code></td></tr><tr><td style="text-align:left;"><code>TrChat.Layout</code></td><td style="text-align:left;">默认 stacked 主体布局容器</td><td style="text-align:left;">自己重组 header / body / footer</td></tr><tr><td style="text-align:left;"><code>TrChat.WorkspaceLayout</code></td><td style="text-align:left;">workspace 壳层布局</td><td style="text-align:left;">自己接 left / right / mobile sheet</td></tr><tr><td style="text-align:left;"><code>TrChat.Header</code></td><td style="text-align:left;">默认 header 组件</td><td style="text-align:left;">单独摆标题、历史入口、新会话入口</td></tr><tr><td style="text-align:left;"><code>TrChat.Welcome</code></td><td style="text-align:left;">默认欢迎区</td><td style="text-align:left;">白盒组装欢迎态</td></tr><tr><td style="text-align:left;"><code>TrChat.MessageList</code></td><td style="text-align:left;">默认消息列表</td><td style="text-align:left;">保留默认 bubble 链与 actions</td></tr><tr><td style="text-align:left;"><code>TrChat.Footer</code></td><td style="text-align:left;">默认 footer 容器</td><td style="text-align:left;">继续复用默认底部分区</td></tr><tr><td style="text-align:left;"><code>TrChat.Attachments</code></td><td style="text-align:left;">默认附件列表区域</td><td style="text-align:left;">白盒页里单独摆附件区</td></tr><tr><td style="text-align:left;"><code>TrChat.Sender</code></td><td style="text-align:left;">默认发送区</td><td style="text-align:left;">继续复用发送、取消、附件动作</td></tr><tr><td style="text-align:left;"><code>TrChat.History</code></td><td style="text-align:left;">默认历史面板</td><td style="text-align:left;">整块复用会话历史</td></tr><tr><td style="text-align:left;"><code>TrChat.HistorySurface</code></td><td style="text-align:left;">历史表面组件</td><td style="text-align:left;">把历史区抽离到别处展示</td></tr><tr><td style="text-align:left;"><code>TrChat.WorkspaceShell</code></td><td style="text-align:left;">workspace 桌面壳层</td><td style="text-align:left;">自己接管左右区域宽度、折叠和主题</td></tr><tr><td style="text-align:left;"><code>TrChat.WorkspaceRightSheet</code></td><td style="text-align:left;">移动端右侧 sheet</td><td style="text-align:left;">单独复用移动端右栏入口</td></tr></tbody></table><h3 id="白盒入口核心-props" tabindex="-1">白盒入口核心 props <a class="header-anchor" href="#白盒入口核心-props" aria-label="Permalink to &quot;白盒入口核心 props&quot;">​</a></h3><p>最常需要查的是 <code>Scaffold</code> 和 <code>Provider</code> 这两个入口：</p><table tabindex="0"><thead><tr><th style="text-align:left;">API</th><th style="text-align:left;">核心 props</th><th style="text-align:left;">说明</th></tr></thead><tbody><tr><td style="text-align:left;"><code>TrChat.Scaffold</code></td><td style="text-align:left;"><code>config</code>、<code>runtime</code>、<code>callbacks</code>、<code>presetOverrides</code></td><td style="text-align:left;">和顶层 <code>TrChat</code> 基本一致，但默认通过 <code>slot</code> 暴露 <code>chatKit / adapter / presetProps / presetSlices / currentModel / selectModel</code></td></tr><tr><td style="text-align:left;"><code>TrChat.Provider</code></td><td style="text-align:left;">二选一：<code>chatKit</code> 或 <code>responseProvider</code></td><td style="text-align:left;">如果不传 <code>chatKit</code>，可以继续传 <code>plugins / storage / initialMessages / messageTransforms / onFinish / onError</code> 让它内部创建 runtime</td></tr><tr><td style="text-align:left;"><code>TrChat.Provider</code> 共享 props</td><td style="text-align:left;"><code>mcpManager</code>、<code>attachmentsManager</code>、<code>attachmentsFeature</code>、<code>senderActionsFeature</code>、<code>messages</code>、<code>shell</code></td><td style="text-align:left;">这些会进入 provider context，被叶子组件直接消费</td></tr></tbody></table><h3 id="独立公开组件" tabindex="-1">独立公开组件 <a class="header-anchor" href="#独立公开组件" aria-label="Permalink to &quot;独立公开组件&quot;">​</a></h3><p>这些组件也以 named export 的方式单独暴露，适合不想通过 <code>TrChat.*</code> 访问时使用：</p><table tabindex="0"><thead><tr><th style="text-align:left;">API</th><th style="text-align:left;">对应成员</th><th style="text-align:left;">作用</th></tr></thead><tbody><tr><td style="text-align:left;"><code>TrChatScaffold</code></td><td style="text-align:left;"><code>TrChat.Scaffold</code></td><td style="text-align:left;">单独导入 scaffold</td></tr><tr><td style="text-align:left;"><code>TrChatLayout</code></td><td style="text-align:left;"><code>TrChat.Layout</code></td><td style="text-align:left;">单独导入 stacked layout</td></tr><tr><td style="text-align:left;"><code>TrChatWorkspaceLayout</code></td><td style="text-align:left;"><code>TrChat.WorkspaceLayout</code></td><td style="text-align:left;">单独导入 workspace layout</td></tr><tr><td style="text-align:left;"><code>TrChatAttachments</code></td><td style="text-align:left;"><code>TrChat.Attachments</code></td><td style="text-align:left;">单独导入附件区</td></tr><tr><td style="text-align:left;"><code>TrChatHistorySurface</code></td><td style="text-align:left;"><code>TrChat.HistorySurface</code></td><td style="text-align:left;">单独导入历史 surface</td></tr><tr><td style="text-align:left;"><code>TrChatWorkspaceShell</code></td><td style="text-align:left;"><code>TrChat.WorkspaceShell</code></td><td style="text-align:left;">单独导入 workspace shell</td></tr><tr><td style="text-align:left;"><code>TrChatWorkspaceRightSheet</code></td><td style="text-align:left;"><code>TrChat.WorkspaceRightSheet</code></td><td style="text-align:left;">单独导入移动端右侧 sheet</td></tr><tr><td style="text-align:left;"><code>TrChatFeedback</code></td><td style="text-align:left;">无 compound 同名成员</td><td style="text-align:left;">复用消息反馈区</td></tr><tr><td style="text-align:left;"><code>TrModelSelector</code></td><td style="text-align:left;">无 compound 同名成员</td><td style="text-align:left;">在任意位置单独摆模型切换</td></tr><tr><td style="text-align:left;"><code>TrMcpTrigger</code></td><td style="text-align:left;">无 compound 同名成员</td><td style="text-align:left;">在任意位置单独摆 MCP 入口</td></tr><tr><td style="text-align:left;"><code>TrChatMcpPanel</code></td><td style="text-align:left;">无 compound 同名成员</td><td style="text-align:left;">复用 MCP 面板本体</td></tr></tbody></table><h3 id="这一页只保留少数值得手动消费的-api" tabindex="-1">这一页只保留少数值得手动消费的 API <a class="header-anchor" href="#这一页只保留少数值得手动消费的-api" aria-label="Permalink to &quot;这一页只保留少数值得手动消费的 API&quot;">​</a></h3><p><code>@opentiny/tiny-robot-chat</code> 的确还公开了更多 hooks、renderers 和底层常量，但对大多数业务接入并不构成稳定入口。</p><p>这份组件文档只保留“用户在白盒接入时真的可能手动消费”的少数工具：</p><table tabindex="0"><thead><tr><th style="text-align:left;">API</th><th style="text-align:left;">作用</th></tr></thead><tbody><tr><td style="text-align:left;"><code>createChatAdapterFromConfig</code></td><td style="text-align:left;">从配置生成 adapter</td></tr><tr><td style="text-align:left;"><code>createPresetChatProps</code></td><td style="text-align:left;">生成 preset props</td></tr><tr><td style="text-align:left;"><code>createPresetChatSlices</code></td><td style="text-align:left;">生成叶子组件可消费的 preset slices</td></tr><tr><td style="text-align:left;"><code>useChatKit</code></td><td style="text-align:left;">创建 chat facade runtime</td></tr><tr><td style="text-align:left;"><code>useChatAttachments</code></td><td style="text-align:left;">创建附件 manager</td></tr><tr><td style="text-align:left;"><code>useMcpManager</code></td><td style="text-align:left;">创建 MCP manager</td></tr><tr><td style="text-align:left;"><code>useModelSelector</code></td><td style="text-align:left;">模型选择状态桥接</td></tr></tbody></table><p>建议只有在这些场景才进入这层能力：</p><ul><li>页面壳层二次封装</li><li>内部白盒接入层</li><li>需要显式消费 adapter / preset props / preset slices 的中间层</li></ul><p>如果你只是业务页面接入聊天 UI，通常先停在 <code>TrChat</code> 就够了。</p><p>其余更底层的公开导出：</p><ul><li>更适合作为源码层能力保留</li><li>不适合作为用户文档里的主参考入口</li><li>真要追的话，直接看 <a href="e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/index.ts" target="_blank" rel="noreferrer">packages/chat/src/index.ts</a></li></ul><h2 id="faq-常见坑" tabindex="-1">FAQ / 常见坑 <a class="header-anchor" href="#faq-常见坑" aria-label="Permalink to &quot;FAQ / 常见坑&quot;">​</a></h2><h3 id="什么时候该用-scaffold-什么时候该用-provider" tabindex="-1">什么时候该用 <code>Scaffold</code>，什么时候该用 <code>Provider</code> <a class="header-anchor" href="#什么时候该用-scaffold-什么时候该用-provider" aria-label="Permalink to &quot;什么时候该用 `Scaffold`，什么时候该用 `Provider`&quot;">​</a></h3><p>推荐判断方式：</p><ul><li>还想复用默认配置能力和 <code>presetSlices</code><ul><li>先用 <code>Scaffold</code></li></ul></li><li>已经明确要自己装配页面，并且愿意自己管 runtime <ul><li>再用 <code>Provider</code></li></ul></li></ul><h3 id="只是替换-workspace-左右面板-是否需要进入-whitebox" tabindex="-1">只是替换 workspace 左右面板，是否需要进入 whitebox <a class="header-anchor" href="#只是替换-workspace-左右面板-是否需要进入-whitebox" aria-label="Permalink to &quot;只是替换 workspace 左右面板，是否需要进入 whitebox&quot;">​</a></h3><p>通常不需要。</p><p>优先继续使用：</p><ul><li><code>TrChat</code></li><li><code>left / left-rail / right / mobile-left / mobile-right</code></li></ul><h3 id="messageactions、bubblerenderers、messagetransforms-为什么不在-features" tabindex="-1"><code>messageActions</code>、<code>bubbleRenderers</code>、<code>messageTransforms</code> 为什么不在 <code>features</code> <a class="header-anchor" href="#messageactions、bubblerenderers、messagetransforms-为什么不在-features" aria-label="Permalink to &quot;`messageActions`、`bubbleRenderers`、`messageTransforms` 为什么不在 `features`&quot;">​</a></h3><p>因为它们不是稳定默认能力开关，而是：</p><ul><li>页面级渲染扩展</li><li>消息级行为扩展</li><li>运行时结果改写</li></ul><p>所以它们应继续放在：</p><ul><li><code>presetOverrides</code></li><li>顶层 <code>runtime</code></li></ul><h2 id="继续阅读" tabindex="-1">继续阅读 <a class="header-anchor" href="#继续阅读" aria-label="Permalink to &quot;继续阅读&quot;">​</a></h2><ul><li><a href="./chat.html">Chat 接入与入口</a></li><li><a href="./chat-features.html">Chat 配置与能力</a></li></ul>',36))])}}});export{w as __pageData,_ as default};
