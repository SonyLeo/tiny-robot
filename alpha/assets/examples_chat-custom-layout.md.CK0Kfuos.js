const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/custom-layout.BZWNBM4v.js","assets/chunks/index.D8a2osu0.js","assets/chunks/framework.DKNOy_U-.js","assets/chunks/utils.DCcUktrc.js","assets/chunks/useConversation.BxzYiHUk.js","assets/chunks/useMessage.DeYkoEX7.js","assets/chunks/theme.rN_O4joo.js","assets/chunks/toolPlugin.C2FLgiZl.js","assets/chunks/mockMcp.Cl4EVz7t.js"])))=>i.map(i=>d[i]);
import{aD as r,bQ as A,aZ as l,aL as s,v as B,H as p,bL as c,bB as d,J as e,bk as C,bJ as o,G as D,b7 as g,aU as u}from"./chunks/framework.DKNOy_U-.js";import{L as F,N as m}from"./chunks/index.XLEjCtHe.js";const h=`<template>
  <div class="demo-container">
    <TrChat.Root :runtime="resolution.runtime" :ui="resolution.ui" :mcp-manager="mcpManager">
      <!--
        workspace 模式下，TrChat.Page 内部自带 WorkspaceLayout。
        直接把布局 slots 传给 TrChat.Page 即可：
        - #left：替换默认的历史记录侧边栏
        - #left-rail：自定义折叠后的 rail 图标
        - #right：自定义右侧面板内容
      -->
      <TrChat.Page>
        <!-- 自定义左侧面板 -->
        <template #left>
          <aside class="left-panel">
            <div class="left-panel__section">
              <p class="left-panel__eyebrow">项目</p>
              <h3 class="left-panel__title">自定义左侧面板</h3>
              <p class="left-panel__body">通过 TrChat.Page 的 #left slot 替换默认的历史列表。</p>
            </div>
            <div class="left-panel__section">
              <p class="left-panel__label">固定上下文</p>
              <ul class="left-panel__list">
                <li><strong>发布简报</strong><span>总结当前发布状态</span></li>
                <li><strong>文档计划</strong><span>保持示例和文档导航一致</span></li>
                <li><strong>API 清理</strong><span>关注公开接口的清晰度</span></li>
              </ul>
            </div>
          </aside>
        </template>

        <!-- 自定义 rail 图标（左侧面板折叠后显示） -->
        <template #left-rail>
          <span class="rail-icon" title="项目">📁</span>
          <span class="rail-icon" title="设置">⚙️</span>
        </template>

        <!-- 自定义右侧面板 -->
        <template #right>
          <aside class="right-panel">
            <div class="right-panel__card">
              <p class="right-panel__eyebrow">工作区摘要</p>
              <h3 class="right-panel__title">自定义右侧面板</h3>
              <p class="right-panel__body">右侧面板适合放结构化输出、检查点或操作工具。</p>
            </div>
            <div class="right-panel__metrics">
              <div class="right-panel__metric">
                <span class="right-panel__metric-label">入口</span>
                <strong>Root + Page</strong>
              </div>
              <div class="right-panel__metric">
                <span class="right-panel__metric-label">MCP</span>
                <strong>{{ mcpStatus }}</strong>
              </div>
            </div>
          </aside>
        </template>

        <template #header-extra>
          <FullscreenToggle />
        </template>
      </TrChat.Page>
    </TrChat.Root>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'
import { TrChat, createRuntimeFromConfig, useMcpManager } from '@opentiny/tiny-robot-chat'
import FullscreenToggle from './FullscreenToggle.vue'
import { createDemoConfig } from './config'
import { MOCK_PLUGINS, MOCK_BRIDGE } from './mockMcp'

const mcpManager = useMcpManager({ initialPlugins: MOCK_PLUGINS, bridge: MOCK_BRIDGE })

const resolution = createRuntimeFromConfig(
  createDemoConfig({
    storageKey: 'docs-demo-custom-layout',
    welcomeTitle: '自定义 Workspace 布局',
    welcomeDescription: '通过 WorkspaceLayout 的 #left、#right、#left-rail slots 自定义侧边栏内容。',
    workspace: true,
    initialMessages: [
      {
        role: 'assistant',
        content:
          '这个示例展示了自定义左侧面板、自定义右侧面板和自定义 rail 图标。聊天区由 TrChat.Page 负责，不需要手动组合原语。',
      },
    ],
  }),
)

onBeforeUnmount(() => resolution.dispose())

const mcpStatus = computed(() =>
  mcpManager.activeCount.value > 0 ? \`\${mcpManager.activeCount.value} 个插件已激活\` : '未激活',
)
<\/script>

<style scoped>
.demo-container {
  height: 600px;
  width: 100%;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 8px;
  overflow: hidden;
}

:deep(.tr-chat),
:deep(.tr-chat-workspace-layout),
:deep(.tr-workspace-shell) {
  height: 100%;
  min-height: 0;
}

/* ── 左侧面板 ── */
.left-panel {
  height: 100%;
  display: grid;
  align-content: start;
  gap: 18px;
  padding: 22px 18px;
  background: linear-gradient(180deg, rgba(250, 252, 255, 0.98) 0%, rgba(244, 248, 255, 1) 100%);
}

.left-panel__section {
  display: grid;
  gap: 10px;
}

.left-panel__eyebrow,
.left-panel__label {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #667085;
}

.left-panel__title {
  margin: 0;
  font-size: 18px;
  line-height: 1.25;
  color: #111827;
}

.left-panel__body {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #667085;
}

.left-panel__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}

.left-panel__list li {
  display: grid;
  gap: 4px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: inset 0 0 0 1px rgba(20, 24, 31, 0.06);
  font-size: 13px;
  line-height: 1.5;
  color: #475467;
}

.left-panel__list strong {
  color: #101828;
}

/* ── Rail 图标 ── */
.rail-icon {
  font-size: 15px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.15s ease;
}

.rail-icon:hover {
  opacity: 1;
}

/* ── 右侧面板 ── */
.right-panel {
  height: 100%;
  display: grid;
  align-content: start;
  gap: 18px;
  padding: 22px 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 250, 252, 1) 100%);
}

.right-panel__card,
.right-panel__metric {
  display: grid;
  gap: 8px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    0 8px 22px rgba(15, 23, 42, 0.05),
    inset 0 0 0 1px rgba(20, 24, 31, 0.06);
}

.right-panel__eyebrow {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #667085;
}

.right-panel__title {
  margin: 0;
  font-size: 18px;
  line-height: 1.25;
  color: #111827;
}

.right-panel__body {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #667085;
}

.right-panel__metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.right-panel__metric-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #667085;
}

.right-panel__metric strong {
  color: #111827;
  font-size: 14px;
}
</style>
`,x=JSON.parse('{"title":"Chat · 自定义布局","description":"","frontmatter":{},"headers":[],"relativePath":"examples/chat-custom-layout.md","filePath":"examples/chat-custom-layout.md"}'),f={name:"examples/chat-custom-layout.md"},v=Object.assign(f,{setup(_){const E=u(!0),t=g();return r(async()=>{t.value=(await A(async()=>{const{default:a}=await import("./chunks/custom-layout.BZWNBM4v.js");return{default:a}},__vite__mapDeps([0,1,2,3,4,5,6,7,8]))).default}),(a,n)=>{const i=l("ClientOnly");return s(),B("div",null,[n[1]||(n[1]=p('<h1 id="chat-·-自定义布局" tabindex="-1">Chat · 自定义布局 <a class="header-anchor" href="#chat-·-自定义布局" aria-label="Permalink to &quot;Chat · 自定义布局&quot;">​</a></h1><p>适合：需要替换 workspace 的左右侧边栏内容（如自定义导航、摘要面板），但聊天区本身不需要定制。workspace 模式下 <code>TrChat.Page</code> 内部自带 <code>WorkspaceLayout</code>，直接通过 <code>#left</code>、<code>#right</code>、<code>#left-rail</code> slots 替换即可。</p><blockquote><p>💡 示例嵌入在文档页面中，空间有限。点击右上角的 <strong>⤢</strong> 按钮可全屏预览完整效果。 <code>FullscreenToggle</code> 是文档示例专用的辅助组件，不是 Chat 套件的内置功能，业务项目中无需引入。</p></blockquote><blockquote><p>⚠️ 示例默认使用代理端点 <code>/api/chat/completions</code>。如需直连 DeepSeek，参考 <code>config.ts</code> 中的注释替换为 <code>baseURL</code> + <code>apiPath</code> 写法，并在项目中创建 <code>.env.local</code> 配置 <code>VITE_DEEPSEEK_API_KEY</code>。</p></blockquote>',4)),c(e(C(F),null,null,512),[[d,E.value]]),e(i,null,{default:o(()=>[e(C(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22custom-layout.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fcustom-layout.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22demo-container%5C%22%3E%5Cn%20%20%20%20%3CTrChat.Root%20%3Aruntime%3D%5C%22resolution.runtime%5C%22%20%3Aui%3D%5C%22resolution.ui%5C%22%20%3Amcp-manager%3D%5C%22mcpManager%5C%22%3E%5Cn%20%20%20%20%20%20%3C!--%5Cn%20%20%20%20%20%20%20%20workspace%20%E6%A8%A1%E5%BC%8F%E4%B8%8B%EF%BC%8CTrChat.Page%20%E5%86%85%E9%83%A8%E8%87%AA%E5%B8%A6%20WorkspaceLayout%E3%80%82%5Cn%20%20%20%20%20%20%20%20%E7%9B%B4%E6%8E%A5%E6%8A%8A%E5%B8%83%E5%B1%80%20slots%20%E4%BC%A0%E7%BB%99%20TrChat.Page%20%E5%8D%B3%E5%8F%AF%EF%BC%9A%5Cn%20%20%20%20%20%20%20%20-%20%23left%EF%BC%9A%E6%9B%BF%E6%8D%A2%E9%BB%98%E8%AE%A4%E7%9A%84%E5%8E%86%E5%8F%B2%E8%AE%B0%E5%BD%95%E4%BE%A7%E8%BE%B9%E6%A0%8F%5Cn%20%20%20%20%20%20%20%20-%20%23left-rail%EF%BC%9A%E8%87%AA%E5%AE%9A%E4%B9%89%E6%8A%98%E5%8F%A0%E5%90%8E%E7%9A%84%20rail%20%E5%9B%BE%E6%A0%87%5Cn%20%20%20%20%20%20%20%20-%20%23right%EF%BC%9A%E8%87%AA%E5%AE%9A%E4%B9%89%E5%8F%B3%E4%BE%A7%E9%9D%A2%E6%9D%BF%E5%86%85%E5%AE%B9%5Cn%20%20%20%20%20%20--%3E%5Cn%20%20%20%20%20%20%3CTrChat.Page%3E%5Cn%20%20%20%20%20%20%20%20%3C!--%20%E8%87%AA%E5%AE%9A%E4%B9%89%E5%B7%A6%E4%BE%A7%E9%9D%A2%E6%9D%BF%20--%3E%5Cn%20%20%20%20%20%20%20%20%3Ctemplate%20%23left%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Caside%20class%3D%5C%22left-panel%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22left-panel__section%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cp%20class%3D%5C%22left-panel__eyebrow%5C%22%3E%E9%A1%B9%E7%9B%AE%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ch3%20class%3D%5C%22left-panel__title%5C%22%3E%E8%87%AA%E5%AE%9A%E4%B9%89%E5%B7%A6%E4%BE%A7%E9%9D%A2%E6%9D%BF%3C%2Fh3%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cp%20class%3D%5C%22left-panel__body%5C%22%3E%E9%80%9A%E8%BF%87%20TrChat.Page%20%E7%9A%84%20%23left%20slot%20%E6%9B%BF%E6%8D%A2%E9%BB%98%E8%AE%A4%E7%9A%84%E5%8E%86%E5%8F%B2%E5%88%97%E8%A1%A8%E3%80%82%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22left-panel__section%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cp%20class%3D%5C%22left-panel__label%5C%22%3E%E5%9B%BA%E5%AE%9A%E4%B8%8A%E4%B8%8B%E6%96%87%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cul%20class%3D%5C%22left-panel__list%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3E%3Cstrong%3E%E5%8F%91%E5%B8%83%E7%AE%80%E6%8A%A5%3C%2Fstrong%3E%3Cspan%3E%E6%80%BB%E7%BB%93%E5%BD%93%E5%89%8D%E5%8F%91%E5%B8%83%E7%8A%B6%E6%80%81%3C%2Fspan%3E%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3E%3Cstrong%3E%E6%96%87%E6%A1%A3%E8%AE%A1%E5%88%92%3C%2Fstrong%3E%3Cspan%3E%E4%BF%9D%E6%8C%81%E7%A4%BA%E4%BE%8B%E5%92%8C%E6%96%87%E6%A1%A3%E5%AF%BC%E8%88%AA%E4%B8%80%E8%87%B4%3C%2Fspan%3E%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%3E%3Cstrong%3EAPI%20%E6%B8%85%E7%90%86%3C%2Fstrong%3E%3Cspan%3E%E5%85%B3%E6%B3%A8%E5%85%AC%E5%BC%80%E6%8E%A5%E5%8F%A3%E7%9A%84%E6%B8%85%E6%99%B0%E5%BA%A6%3C%2Fspan%3E%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Ful%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Faside%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%5Cn%20%20%20%20%20%20%20%20%3C!--%20%E8%87%AA%E5%AE%9A%E4%B9%89%20rail%20%E5%9B%BE%E6%A0%87%EF%BC%88%E5%B7%A6%E4%BE%A7%E9%9D%A2%E6%9D%BF%E6%8A%98%E5%8F%A0%E5%90%8E%E6%98%BE%E7%A4%BA%EF%BC%89%20--%3E%5Cn%20%20%20%20%20%20%20%20%3Ctemplate%20%23left-rail%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cspan%20class%3D%5C%22rail-icon%5C%22%20title%3D%5C%22%E9%A1%B9%E7%9B%AE%5C%22%3E%F0%9F%93%81%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cspan%20class%3D%5C%22rail-icon%5C%22%20title%3D%5C%22%E8%AE%BE%E7%BD%AE%5C%22%3E%E2%9A%99%EF%B8%8F%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%5Cn%20%20%20%20%20%20%20%20%3C!--%20%E8%87%AA%E5%AE%9A%E4%B9%89%E5%8F%B3%E4%BE%A7%E9%9D%A2%E6%9D%BF%20--%3E%5Cn%20%20%20%20%20%20%20%20%3Ctemplate%20%23right%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Caside%20class%3D%5C%22right-panel%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22right-panel__card%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cp%20class%3D%5C%22right-panel__eyebrow%5C%22%3E%E5%B7%A5%E4%BD%9C%E5%8C%BA%E6%91%98%E8%A6%81%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ch3%20class%3D%5C%22right-panel__title%5C%22%3E%E8%87%AA%E5%AE%9A%E4%B9%89%E5%8F%B3%E4%BE%A7%E9%9D%A2%E6%9D%BF%3C%2Fh3%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cp%20class%3D%5C%22right-panel__body%5C%22%3E%E5%8F%B3%E4%BE%A7%E9%9D%A2%E6%9D%BF%E9%80%82%E5%90%88%E6%94%BE%E7%BB%93%E6%9E%84%E5%8C%96%E8%BE%93%E5%87%BA%E3%80%81%E6%A3%80%E6%9F%A5%E7%82%B9%E6%88%96%E6%93%8D%E4%BD%9C%E5%B7%A5%E5%85%B7%E3%80%82%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22right-panel__metrics%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22right-panel__metric%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cspan%20class%3D%5C%22right-panel__metric-label%5C%22%3E%E5%85%A5%E5%8F%A3%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cstrong%3ERoot%20%2B%20Page%3C%2Fstrong%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22right-panel__metric%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cspan%20class%3D%5C%22right-panel__metric-label%5C%22%3EMCP%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cstrong%3E%7B%7B%20mcpStatus%20%7D%7D%3C%2Fstrong%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Faside%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%5Cn%20%20%20%20%20%20%20%20%3Ctemplate%20%23header-extra%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3CFullscreenToggle%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%20%20%3C%2FTrChat.Page%3E%5Cn%20%20%20%20%3C%2FTrChat.Root%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20onBeforeUnmount%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrChat%2C%20createRuntimeFromConfig%2C%20useMcpManager%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20FullscreenToggle%20from%20'.%2FFullscreenToggle.vue'%5Cnimport%20%7B%20createDemoConfig%20%7D%20from%20'.%2Fconfig'%5Cnimport%20%7B%20MOCK_PLUGINS%2C%20MOCK_BRIDGE%20%7D%20from%20'.%2FmockMcp'%5Cn%5Cnconst%20mcpManager%20%3D%20useMcpManager(%7B%20initialPlugins%3A%20MOCK_PLUGINS%2C%20bridge%3A%20MOCK_BRIDGE%20%7D)%5Cn%5Cnconst%20resolution%20%3D%20createRuntimeFromConfig(%5Cn%20%20createDemoConfig(%7B%5Cn%20%20%20%20storageKey%3A%20'docs-demo-custom-layout'%2C%5Cn%20%20%20%20welcomeTitle%3A%20'%E8%87%AA%E5%AE%9A%E4%B9%89%20Workspace%20%E5%B8%83%E5%B1%80'%2C%5Cn%20%20%20%20welcomeDescription%3A%20'%E9%80%9A%E8%BF%87%20WorkspaceLayout%20%E7%9A%84%20%23left%E3%80%81%23right%E3%80%81%23left-rail%20slots%20%E8%87%AA%E5%AE%9A%E4%B9%89%E4%BE%A7%E8%BE%B9%E6%A0%8F%E5%86%85%E5%AE%B9%E3%80%82'%2C%5Cn%20%20%20%20workspace%3A%20true%2C%5Cn%20%20%20%20initialMessages%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20content%3A%5Cn%20%20%20%20%20%20%20%20%20%20'%E8%BF%99%E4%B8%AA%E7%A4%BA%E4%BE%8B%E5%B1%95%E7%A4%BA%E4%BA%86%E8%87%AA%E5%AE%9A%E4%B9%89%E5%B7%A6%E4%BE%A7%E9%9D%A2%E6%9D%BF%E3%80%81%E8%87%AA%E5%AE%9A%E4%B9%89%E5%8F%B3%E4%BE%A7%E9%9D%A2%E6%9D%BF%E5%92%8C%E8%87%AA%E5%AE%9A%E4%B9%89%20rail%20%E5%9B%BE%E6%A0%87%E3%80%82%E8%81%8A%E5%A4%A9%E5%8C%BA%E7%94%B1%20TrChat.Page%20%E8%B4%9F%E8%B4%A3%EF%BC%8C%E4%B8%8D%E9%9C%80%E8%A6%81%E6%89%8B%E5%8A%A8%E7%BB%84%E5%90%88%E5%8E%9F%E8%AF%AD%E3%80%82'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D)%2C%5Cn)%5Cn%5CnonBeforeUnmount(()%20%3D%3E%20resolution.dispose())%5Cn%5Cnconst%20mcpStatus%20%3D%20computed(()%20%3D%3E%5Cn%20%20mcpManager.activeCount.value%20%3E%200%20%3F%20%60%24%7BmcpManager.activeCount.value%7D%20%E4%B8%AA%E6%8F%92%E4%BB%B6%E5%B7%B2%E6%BF%80%E6%B4%BB%60%20%3A%20'%E6%9C%AA%E6%BF%80%E6%B4%BB'%2C%5Cn)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.demo-container%20%7B%5Cn%20%20height%3A%20600px%3B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-border-color-default%2C%20%23e5e6eb)%3B%5Cn%20%20border-radius%3A%208px%3B%5Cn%20%20overflow%3A%20hidden%3B%5Cn%7D%5Cn%5Cn%3Adeep(.tr-chat)%2C%5Cn%3Adeep(.tr-chat-workspace-layout)%2C%5Cn%3Adeep(.tr-workspace-shell)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%5Cn%2F*%20%E2%94%80%E2%94%80%20%E5%B7%A6%E4%BE%A7%E9%9D%A2%E6%9D%BF%20%E2%94%80%E2%94%80%20*%2F%5Cn.left-panel%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20align-content%3A%20start%3B%5Cn%20%20gap%3A%2018px%3B%5Cn%20%20padding%3A%2022px%2018px%3B%5Cn%20%20background%3A%20linear-gradient(180deg%2C%20rgba(250%2C%20252%2C%20255%2C%200.98)%200%25%2C%20rgba(244%2C%20248%2C%20255%2C%201)%20100%25)%3B%5Cn%7D%5Cn%5Cn.left-panel__section%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%2010px%3B%5Cn%7D%5Cn%5Cn.left-panel__eyebrow%2C%5Cn.left-panel__label%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20font-size%3A%2011px%3B%5Cn%20%20font-weight%3A%20700%3B%5Cn%20%20letter-spacing%3A%200.12em%3B%5Cn%20%20text-transform%3A%20uppercase%3B%5Cn%20%20color%3A%20%23667085%3B%5Cn%7D%5Cn%5Cn.left-panel__title%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20font-size%3A%2018px%3B%5Cn%20%20line-height%3A%201.25%3B%5Cn%20%20color%3A%20%23111827%3B%5Cn%7D%5Cn%5Cn.left-panel__body%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20line-height%3A%201.6%3B%5Cn%20%20color%3A%20%23667085%3B%5Cn%7D%5Cn%5Cn.left-panel__list%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20padding%3A%200%3B%5Cn%20%20list-style%3A%20none%3B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%2010px%3B%5Cn%7D%5Cn%5Cn.left-panel__list%20li%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%204px%3B%5Cn%20%20padding%3A%2012px%3B%5Cn%20%20border-radius%3A%2014px%3B%5Cn%20%20background%3A%20rgba(255%2C%20255%2C%20255%2C%200.84)%3B%5Cn%20%20box-shadow%3A%20inset%200%200%200%201px%20rgba(20%2C%2024%2C%2031%2C%200.06)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20line-height%3A%201.5%3B%5Cn%20%20color%3A%20%23475467%3B%5Cn%7D%5Cn%5Cn.left-panel__list%20strong%20%7B%5Cn%20%20color%3A%20%23101828%3B%5Cn%7D%5Cn%5Cn%2F*%20%E2%94%80%E2%94%80%20Rail%20%E5%9B%BE%E6%A0%87%20%E2%94%80%E2%94%80%20*%2F%5Cn.rail-icon%20%7B%5Cn%20%20font-size%3A%2015px%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%20%20opacity%3A%200.7%3B%5Cn%20%20transition%3A%20opacity%200.15s%20ease%3B%5Cn%7D%5Cn%5Cn.rail-icon%3Ahover%20%7B%5Cn%20%20opacity%3A%201%3B%5Cn%7D%5Cn%5Cn%2F*%20%E2%94%80%E2%94%80%20%E5%8F%B3%E4%BE%A7%E9%9D%A2%E6%9D%BF%20%E2%94%80%E2%94%80%20*%2F%5Cn.right-panel%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20align-content%3A%20start%3B%5Cn%20%20gap%3A%2018px%3B%5Cn%20%20padding%3A%2022px%2018px%3B%5Cn%20%20background%3A%20linear-gradient(180deg%2C%20rgba(255%2C%20255%2C%20255%2C%200.98)%200%25%2C%20rgba(250%2C%20250%2C%20252%2C%201)%20100%25)%3B%5Cn%7D%5Cn%5Cn.right-panel__card%2C%5Cn.right-panel__metric%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20padding%3A%2014px%3B%5Cn%20%20border-radius%3A%2016px%3B%5Cn%20%20background%3A%20rgba(255%2C%20255%2C%20255%2C%200.92)%3B%5Cn%20%20box-shadow%3A%5Cn%20%20%20%200%208px%2022px%20rgba(15%2C%2023%2C%2042%2C%200.05)%2C%5Cn%20%20%20%20inset%200%200%200%201px%20rgba(20%2C%2024%2C%2031%2C%200.06)%3B%5Cn%7D%5Cn%5Cn.right-panel__eyebrow%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20font-size%3A%2011px%3B%5Cn%20%20font-weight%3A%20700%3B%5Cn%20%20letter-spacing%3A%200.12em%3B%5Cn%20%20text-transform%3A%20uppercase%3B%5Cn%20%20color%3A%20%23667085%3B%5Cn%7D%5Cn%5Cn.right-panel__title%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20font-size%3A%2018px%3B%5Cn%20%20line-height%3A%201.25%3B%5Cn%20%20color%3A%20%23111827%3B%5Cn%7D%5Cn%5Cn.right-panel__body%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20line-height%3A%201.6%3B%5Cn%20%20color%3A%20%23667085%3B%5Cn%7D%5Cn%5Cn.right-panel__metrics%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20grid-template-columns%3A%20repeat(2%2C%20minmax(0%2C%201fr))%3B%5Cn%20%20gap%3A%2010px%3B%5Cn%7D%5Cn%5Cn.right-panel__metric-label%20%7B%5Cn%20%20font-size%3A%2011px%3B%5Cn%20%20font-weight%3A%20700%3B%5Cn%20%20letter-spacing%3A%200.08em%3B%5Cn%20%20text-transform%3A%20uppercase%3B%5Cn%20%20color%3A%20%23667085%3B%5Cn%7D%5Cn%5Cn.right-panel__metric%20strong%20%7B%5Cn%20%20color%3A%20%23111827%3B%5Cn%20%20font-size%3A%2014px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22config.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fconfig.ts%22%2C%22code%22%3A%22import%20type%20%7B%20TrChatConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20%7B%20localStorageStrategyFactory%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cnexport%20interface%20DemoConfigOptions%20%7B%5Cn%20%20storageKey%3A%20string%5Cn%20%20welcomeTitle%3A%20string%5Cn%20%20welcomeDescription%3F%3A%20string%5Cn%20%20workspace%3F%3A%20boolean%5Cn%20%20initialMessages%3F%3A%20NonNullable%3CTrChatConfig%5B'conversation'%5D%3E%5B'initialMessages'%5D%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20%E6%96%87%E6%A1%A3%E7%A4%BA%E4%BE%8B%E5%85%B1%E7%94%A8%E9%85%8D%E7%BD%AE%E5%B7%A5%E5%8E%82%E3%80%82%5Cn%20*%20%E4%BD%BF%E7%94%A8%E5%9B%BA%E5%AE%9A%E7%9A%84%20demo%20endpoint%EF%BC%8C%E4%B8%8D%E4%BE%9D%E8%B5%96%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F%E3%80%82%5Cn%20*%2F%5Cnexport%20function%20createDemoConfig(options%3A%20DemoConfigOptions)%3A%20TrChatConfig%20%7B%5Cn%20%20return%20%7B%5Cn%20%20%20%20request%3A%20%7B%5Cn%20%20%20%20%20%20providers%3A%20%7B%5Cn%20%20%20%20%20%20%20%20deepseek%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20type%3A%20'openai-compatible'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E9%BB%98%E8%AE%A4%E4%BD%BF%E7%94%A8%E4%BB%A3%E7%90%86%E7%AB%AF%E7%82%B9%E3%80%82%E5%A6%82%E9%9C%80%E7%9B%B4%E8%BF%9E%20DeepSeek%EF%BC%8C%E6%9B%BF%E6%8D%A2%E4%B8%BA%EF%BC%9A%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%20%20baseURL%3A%20'https%3A%2F%2Fapi.deepseek.com%2Fv1'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%20%20apiPath%3A%20'%2Fchat%2Fcompletions'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%20%20headers%3A%20%7B%20Authorization%3A%20%60Bearer%20%24%7Bimport.meta.env.VITE_DEEPSEEK_API_KEY%20%7C%7C%20''%7D%60%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20endpoint%3A%20'%2Fapi%2Fchat%2Fcompletions'%2C%5Cn%20%20%20%20%20%20%20%20%20%20systemPrompt%3A%20'You%20are%20a%20helpful%20assistant.'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%20id%3A%20'deepseek-v4-flash'%2C%20label%3A%20'DeepSeek%20V4%20Flash'%2C%20providerId%3A%20'deepseek'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%20id%3A%20'deepseek-v4-pro'%2C%20label%3A%20'DeepSeek%20V4%20Pro'%2C%20providerId%3A%20'deepseek'%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20defaultModelId%3A%20'deepseek-v4-flash'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20conversation%3A%20%7B%5Cn%20%20%20%20%20%20initialMessages%3A%20options.initialMessages%2C%5Cn%20%20%20%20%20%20persistence%3A%20localStorageStrategyFactory(%7B%20key%3A%20options.storageKey%20%7D)%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20ui%3A%20%7B%5Cn%20%20%20%20%20%20brand%3A%20%7B%20title%3A%20'TinyRobot%20Chat'%20%7D%2C%5Cn%20%20%20%20%20%20welcome%3A%20%7B%5Cn%20%20%20%20%20%20%20%20title%3A%20options.welcomeTitle%2C%5Cn%20%20%20%20%20%20%20%20description%3A%20options.welcomeDescription%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20sender%3A%20%7B%5Cn%20%20%20%20%20%20placeholder%3A%20'%E5%90%91%20TinyRobot%20%E6%8F%90%E9%97%AE%E2%80%A6'%2C%5Cn%20%20%20%20%20%20mode%3A%20'multiple'%2C%5Cn%20%20%20%20%20%20wordCount%3A%20true%2C%5Cn%20%20%20%20%20%20voice%3A%20%7B%5Cn%20%20%20%20%20%20%20%20enabled%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20tooltip%3A%20'%E8%AF%AD%E9%9F%B3%E8%BE%93%E5%85%A5'%2C%5Cn%20%20%20%20%20%20%20%20autoInsert%3A%20false%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20attachments%3A%20%7B%5Cn%20%20%20%20%20%20enabled%3A%20true%2C%5Cn%20%20%20%20%20%20upload%3A%20%7B%20enabled%3A%20true%2C%20multiple%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20list%3A%20%7B%20wrap%3A%20true%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20history%3A%20options.workspace%20%3F%20%7B%20enabled%3A%20true%2C%20defaultOpen%3A%20true%20%7D%20%3A%20undefined%2C%5Cn%20%20%20%20workspace%3A%20options.workspace%5Cn%20%20%20%20%20%20%3F%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20enabled%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20%20%20defaultView%3A%20'workspace'%2C%5Cn%20%20%20%20%20%20%20%20%20%20left%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20enabled%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20width%3A%20272%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20collapsible%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20defaultOpen%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20collapseMode%3A%20'rail'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20railLabel%3A%20'%E5%8E%86%E5%8F%B2%E8%AE%B0%E5%BD%95'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20right%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20enabled%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20width%3A%20320%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20collapsible%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20defaultOpen%3A%20false%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20collapseMode%3A%20'hidden'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%3A%20undefined%2C%5Cn%20%20%20%20messages%3A%20%7B%5Cn%20%20%20%20%20%20feedback%3A%20%7B%20enabled%3A%20true%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%2C%22mockMcp.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2FmockMcp.ts%22%2C%22code%22%3A%22import%20type%20%7B%20PluginInfo%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20type%20%7B%20ToolCall%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cnexport%20const%20MOCK_PLUGINS%3A%20PluginInfo%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'utility'%2C%5Cn%20%20%20%20name%3A%20'%E5%AE%9E%E7%94%A8%E5%B7%A5%E5%85%B7'%2C%5Cn%20%20%20%20icon%3A%20'%F0%9F%94%A7'%2C%5Cn%20%20%20%20description%3A%20'%E6%8F%90%E4%BE%9B%E6%97%B6%E9%97%B4%E6%9F%A5%E8%AF%A2%E3%80%81%E8%AE%A1%E7%AE%97%E5%99%A8%E3%80%81%E6%96%87%E6%9C%AC%E5%A4%84%E7%90%86%E7%AD%89%E5%AE%9E%E7%94%A8%E5%B7%A5%E5%85%B7'%2C%5Cn%20%20%20%20enabled%3A%20true%2C%5Cn%20%20%20%20tools%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20id%3A%20'get_current_time'%2C%20name%3A%20'get_current_time'%2C%20description%3A%20'%E8%8E%B7%E5%8F%96%E5%BD%93%E5%89%8D%E6%97%B6%E9%97%B4%E5%92%8C%E6%97%A5%E6%9C%9F'%2C%20enabled%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'calculate'%2C%20name%3A%20'calculate'%2C%20description%3A%20'%E6%89%A7%E8%A1%8C%E6%95%B0%E5%AD%A6%E8%AE%A1%E7%AE%97'%2C%20enabled%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'word_count'%2C%20name%3A%20'word_count'%2C%20description%3A%20'%E7%BB%9F%E8%AE%A1%E6%96%87%E6%9C%AC%E7%9A%84%E5%AD%97%E6%95%B0%E5%92%8C%E5%AD%97%E7%AC%A6%E6%95%B0'%2C%20enabled%3A%20true%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'weather'%2C%5Cn%20%20%20%20name%3A%20'%E5%A4%A9%E6%B0%94%E6%9F%A5%E8%AF%A2'%2C%5Cn%20%20%20%20icon%3A%20'%F0%9F%8C%A4%EF%B8%8F'%2C%5Cn%20%20%20%20description%3A%20'%E6%9F%A5%E8%AF%A2%E5%9F%8E%E5%B8%82%E5%A4%A9%E6%B0%94%EF%BC%88%E6%A8%A1%E6%8B%9F%E6%95%B0%E6%8D%AE%EF%BC%89'%2C%5Cn%20%20%20%20enabled%3A%20true%2C%5Cn%20%20%20%20tools%3A%20%5B%7B%20id%3A%20'get_weather'%2C%20name%3A%20'get_weather'%2C%20description%3A%20'%E6%9F%A5%E8%AF%A2%E6%8C%87%E5%AE%9A%E5%9F%8E%E5%B8%82%E7%9A%84%E5%A4%A9%E6%B0%94%E4%BF%A1%E6%81%AF'%2C%20enabled%3A%20true%20%7D%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20WEATHER_MOCK%3A%20Record%3Cstring%2C%20%7B%20temp%3A%20number%3B%20condition%3A%20string%3B%20humidity%3A%20number%3B%20wind%3A%20string%20%7D%3E%20%3D%20%7B%5Cn%20%20%E5%8C%97%E4%BA%AC%3A%20%7B%20temp%3A%2022%2C%20condition%3A%20'%E6%99%B4'%2C%20humidity%3A%2035%2C%20wind%3A%20'%E4%B8%9C%E5%8C%97%E9%A3%8E%203%E7%BA%A7'%20%7D%2C%5Cn%20%20%E4%B8%8A%E6%B5%B7%3A%20%7B%20temp%3A%2026%2C%20condition%3A%20'%E5%A4%9A%E4%BA%91'%2C%20humidity%3A%2072%2C%20wind%3A%20'%E4%B8%9C%E5%8D%97%E9%A3%8E%202%E7%BA%A7'%20%7D%2C%5Cn%20%20%E5%B9%BF%E5%B7%9E%3A%20%7B%20temp%3A%2031%2C%20condition%3A%20'%E9%98%B5%E9%9B%A8'%2C%20humidity%3A%2088%2C%20wind%3A%20'%E5%8D%97%E9%A3%8E%201%E7%BA%A7'%20%7D%2C%5Cn%20%20%E6%B7%B1%E5%9C%B3%3A%20%7B%20temp%3A%2030%2C%20condition%3A%20'%E5%A4%9A%E4%BA%91%E8%BD%AC%E6%99%B4'%2C%20humidity%3A%2080%2C%20wind%3A%20'%E4%B8%9C%E9%A3%8E%202%E7%BA%A7'%20%7D%2C%5Cn%20%20%E6%9D%AD%E5%B7%9E%3A%20%7B%20temp%3A%2024%2C%20condition%3A%20'%E9%98%B4'%2C%20humidity%3A%2065%2C%20wind%3A%20'%E8%A5%BF%E5%8C%97%E9%A3%8E%202%E7%BA%A7'%20%7D%2C%5Cn%20%20%E6%88%90%E9%83%BD%3A%20%7B%20temp%3A%2020%2C%20condition%3A%20'%E5%B0%8F%E9%9B%A8'%2C%20humidity%3A%2078%2C%20wind%3A%20'%E6%97%A0%E9%A3%8E'%20%7D%2C%5Cn%7D%5Cn%5Cnexport%20const%20MOCK_BRIDGE%20%3D%20%7B%5Cn%20%20async%20getTools()%20%7B%5Cn%20%20%20%20return%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20type%3A%20'function'%20as%20const%2C%5Cn%20%20%20%20%20%20%20%20function%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20name%3A%20'utility__get_current_time'%2C%5Cn%20%20%20%20%20%20%20%20%20%20description%3A%20'%E8%8E%B7%E5%8F%96%E5%BD%93%E5%89%8D%E6%97%B6%E9%97%B4%E5%92%8C%E6%97%A5%E6%9C%9F%EF%BC%8C%E5%8F%AF%E6%8C%87%E5%AE%9A%E6%97%B6%E5%8C%BA'%2C%5Cn%20%20%20%20%20%20%20%20%20%20parameters%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20type%3A%20'object'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20properties%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20timezone%3A%20%7B%20type%3A%20'string'%2C%20description%3A%20'%E6%97%B6%E5%8C%BA%EF%BC%8C%E5%A6%82%20Asia%2FShanghai%EF%BC%8C%E9%BB%98%E8%AE%A4%E4%B8%BA%E6%9C%AC%E5%9C%B0%E6%97%B6%E5%8C%BA'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20format%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20type%3A%20'string'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20enum%3A%20%5B'full'%2C%20'date'%2C%20'time'%5D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20description%3A%20'%E8%BF%94%E5%9B%9E%E6%A0%BC%E5%BC%8F%EF%BC%9Afull%3D%E5%AE%8C%E6%95%B4%E6%97%A5%E6%9C%9F%E6%97%B6%E9%97%B4%EF%BC%8Cdate%3D%E4%BB%85%E6%97%A5%E6%9C%9F%EF%BC%8Ctime%3D%E4%BB%85%E6%97%B6%E9%97%B4'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20required%3A%20%5B%5D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20type%3A%20'function'%20as%20const%2C%5Cn%20%20%20%20%20%20%20%20function%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20name%3A%20'utility__calculate'%2C%5Cn%20%20%20%20%20%20%20%20%20%20description%3A%20'%E6%89%A7%E8%A1%8C%E6%95%B0%E5%AD%A6%E8%A1%A8%E8%BE%BE%E5%BC%8F%E8%AE%A1%E7%AE%97%EF%BC%8C%E6%94%AF%E6%8C%81%E5%8A%A0%E5%87%8F%E4%B9%98%E9%99%A4%E3%80%81%E5%B9%82%E8%BF%90%E7%AE%97%E3%80%81%E6%8B%AC%E5%8F%B7%E7%AD%89'%2C%5Cn%20%20%20%20%20%20%20%20%20%20parameters%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20type%3A%20'object'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20properties%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20expression%3A%20%7B%20type%3A%20'string'%2C%20description%3A%20'%E6%95%B0%E5%AD%A6%E8%A1%A8%E8%BE%BE%E5%BC%8F%EF%BC%8C%E5%A6%82%20%5C%222%20%2B%203%20*%204%5C%22%20%E6%88%96%20%5C%22(10%20%2B%205)%20%2F%203%5C%22'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20required%3A%20%5B'expression'%5D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20type%3A%20'function'%20as%20const%2C%5Cn%20%20%20%20%20%20%20%20function%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20name%3A%20'utility__word_count'%2C%5Cn%20%20%20%20%20%20%20%20%20%20description%3A%20'%E7%BB%9F%E8%AE%A1%E6%96%87%E6%9C%AC%E7%9A%84%E5%AD%97%E6%95%B0%E3%80%81%E5%AD%97%E7%AC%A6%E6%95%B0%E3%80%81%E8%A1%8C%E6%95%B0%E7%AD%89%E4%BF%A1%E6%81%AF'%2C%5Cn%20%20%20%20%20%20%20%20%20%20parameters%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20type%3A%20'object'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20properties%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20text%3A%20%7B%20type%3A%20'string'%2C%20description%3A%20'%E8%A6%81%E7%BB%9F%E8%AE%A1%E7%9A%84%E6%96%87%E6%9C%AC%E5%86%85%E5%AE%B9'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20required%3A%20%5B'text'%5D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20type%3A%20'function'%20as%20const%2C%5Cn%20%20%20%20%20%20%20%20function%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20name%3A%20'weather__get_weather'%2C%5Cn%20%20%20%20%20%20%20%20%20%20description%3A%20'%E6%9F%A5%E8%AF%A2%E6%8C%87%E5%AE%9A%E5%9F%8E%E5%B8%82%E7%9A%84%E5%BD%93%E5%89%8D%E5%A4%A9%E6%B0%94%E4%BF%A1%E6%81%AF%EF%BC%88%E6%A8%A1%E6%8B%9F%E6%95%B0%E6%8D%AE%EF%BC%89'%2C%5Cn%20%20%20%20%20%20%20%20%20%20parameters%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20type%3A%20'object'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20properties%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20city%3A%20%7B%20type%3A%20'string'%2C%20description%3A%20'%E5%9F%8E%E5%B8%82%E5%90%8D%E7%A7%B0%EF%BC%8C%E5%A6%82%20%E5%8C%97%E4%BA%AC%E3%80%81%E4%B8%8A%E6%B5%B7%E3%80%81%E5%B9%BF%E5%B7%9E'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20required%3A%20%5B'city'%5D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%5Cn%20%20%7D%2C%5Cn%5Cn%20%20async%20callTool(toolCall%3A%20ToolCall)%20%7B%5Cn%20%20%20%20const%20name%20%3D%20toolCall.function%3F.name%20%3F%3F%20''%5Cn%20%20%20%20const%20args%20%3D%20JSON.parse(toolCall.function%3F.arguments%20%7C%7C%20'%7B%7D')%5Cn%5Cn%20%20%20%20await%20new%20Promise((r)%20%3D%3E%20setTimeout(r%2C%20300))%5Cn%5Cn%20%20%20%20if%20(name%20%3D%3D%3D%20'utility__get_current_time')%20%7B%5Cn%20%20%20%20%20%20const%20now%20%3D%20new%20Date()%5Cn%20%20%20%20%20%20const%20pad%20%3D%20(n%3A%20number)%20%3D%3E%20String(n).padStart(2%2C%20'0')%5Cn%20%20%20%20%20%20const%20dateStr%20%3D%20%60%24%7Bnow.getFullYear()%7D-%24%7Bpad(now.getMonth()%20%2B%201)%7D-%24%7Bpad(now.getDate())%7D%60%5Cn%20%20%20%20%20%20const%20timeStr%20%3D%20%60%24%7Bpad(now.getHours())%7D%3A%24%7Bpad(now.getMinutes())%7D%3A%24%7Bpad(now.getSeconds())%7D%60%5Cn%20%20%20%20%20%20const%20weekdays%20%3D%20%5B'%E6%98%9F%E6%9C%9F%E6%97%A5'%2C%20'%E6%98%9F%E6%9C%9F%E4%B8%80'%2C%20'%E6%98%9F%E6%9C%9F%E4%BA%8C'%2C%20'%E6%98%9F%E6%9C%9F%E4%B8%89'%2C%20'%E6%98%9F%E6%9C%9F%E5%9B%9B'%2C%20'%E6%98%9F%E6%9C%9F%E4%BA%94'%2C%20'%E6%98%9F%E6%9C%9F%E5%85%AD'%5D%5Cn%20%20%20%20%20%20const%20result%20%3D%5Cn%20%20%20%20%20%20%20%20args.format%20%3D%3D%3D%20'date'%5Cn%20%20%20%20%20%20%20%20%20%20%3F%20%7B%20date%3A%20dateStr%2C%20weekday%3A%20weekdays%5Bnow.getDay()%5D%20%7D%5Cn%20%20%20%20%20%20%20%20%20%20%3A%20args.format%20%3D%3D%3D%20'time'%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3F%20%7B%20time%3A%20timeStr%20%7D%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3A%20%7B%20datetime%3A%20%60%24%7BdateStr%7D%20%24%7BtimeStr%7D%60%2C%20weekday%3A%20weekdays%5Bnow.getDay()%5D%2C%20timestamp%3A%20now.getTime()%20%7D%5Cn%20%20%20%20%20%20return%20JSON.stringify(result)%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20if%20(name%20%3D%3D%3D%20'utility__calculate')%20%7B%5Cn%20%20%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20%20%20const%20expr%20%3D%20args.expression%20as%20string%5Cn%20%20%20%20%20%20%20%20if%20(!%2F%5E%5B%5C%5Cd%5C%5Cs%2B%5C%5C-*%2F().%5E%25%5D%2B%24%2F.test(expr))%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20return%20JSON.stringify(%7B%20error%3A%20'%E8%A1%A8%E8%BE%BE%E5%BC%8F%E5%8C%85%E5%90%AB%E9%9D%9E%E6%B3%95%E5%AD%97%E7%AC%A6%EF%BC%8C%E5%8F%AA%E6%94%AF%E6%8C%81%E6%95%B0%E5%AD%97%E5%92%8C%E5%9F%BA%E6%9C%AC%E8%BF%90%E7%AE%97%E7%AC%A6'%20%7D)%5Cn%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%20%20const%20result%20%3D%20Function(%60%5C%22use%20strict%5C%22%3B%20return%20(%24%7Bexpr.replace(%2F%5C%5C%5E%2Fg%2C%20'**')%7D)%60)()%5Cn%20%20%20%20%20%20%20%20return%20JSON.stringify(%7B%20expression%3A%20expr%2C%20result%2C%20formatted%3A%20String(result)%20%7D)%5Cn%20%20%20%20%20%20%7D%20catch%20%7B%5Cn%20%20%20%20%20%20%20%20return%20JSON.stringify(%7B%20error%3A%20'%E8%AE%A1%E7%AE%97%E5%A4%B1%E8%B4%A5%EF%BC%8C%E8%AF%B7%E6%A3%80%E6%9F%A5%E8%A1%A8%E8%BE%BE%E5%BC%8F%E6%A0%BC%E5%BC%8F'%20%7D)%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20if%20(name%20%3D%3D%3D%20'utility__word_count')%20%7B%5Cn%20%20%20%20%20%20const%20text%20%3D%20args.text%20as%20string%5Cn%20%20%20%20%20%20const%20chars%20%3D%20text.length%5Cn%20%20%20%20%20%20const%20chineseChars%20%3D%20(text.match(%2F%5B%5C%5Cu4e00-%5C%5Cu9fa5%5D%2Fg)%20%7C%7C%20%5B%5D).length%5Cn%20%20%20%20%20%20const%20words%20%3D%20text.trim()%20%3F%20text.trim().split(%2F%5C%5Cs%2B%2F).length%20%3A%200%5Cn%20%20%20%20%20%20const%20lines%20%3D%20text.split('%5C%5Cn').length%5Cn%20%20%20%20%20%20return%20JSON.stringify(%7B%20chars%2C%20chineseChars%2C%20words%2C%20lines%20%7D)%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20if%20(name%20%3D%3D%3D%20'weather__get_weather')%20%7B%5Cn%20%20%20%20%20%20const%20city%20%3D%20args.city%20as%20string%5Cn%20%20%20%20%20%20const%20data%20%3D%20WEATHER_MOCK%5Bcity%5D%5Cn%20%20%20%20%20%20if%20(!data)%20%7B%5Cn%20%20%20%20%20%20%20%20const%20available%20%3D%20Object.keys(WEATHER_MOCK).join('%E3%80%81')%5Cn%20%20%20%20%20%20%20%20return%20JSON.stringify(%7B%20error%3A%20%60%E6%9A%82%E4%B8%8D%E6%94%AF%E6%8C%81%E8%AF%A5%E5%9F%8E%E5%B8%82%EF%BC%8C%E7%9B%AE%E5%89%8D%E6%94%AF%E6%8C%81%EF%BC%9A%24%7Bavailable%7D%60%20%7D)%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20return%20JSON.stringify(%7B%5Cn%20%20%20%20%20%20%20%20city%2C%5Cn%20%20%20%20%20%20%20%20temperature%3A%20%60%24%7Bdata.temp%7D%C2%B0C%60%2C%5Cn%20%20%20%20%20%20%20%20condition%3A%20data.condition%2C%5Cn%20%20%20%20%20%20%20%20humidity%3A%20%60%24%7Bdata.humidity%7D%25%60%2C%5Cn%20%20%20%20%20%20%20%20wind%3A%20data.wind%2C%5Cn%20%20%20%20%20%20%20%20note%3A%20'%EF%BC%88%E6%A8%A1%E6%8B%9F%E6%95%B0%E6%8D%AE%EF%BC%89'%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20return%20JSON.stringify(%7B%20error%3A%20%60%E6%9C%AA%E7%9F%A5%E5%B7%A5%E5%85%B7%3A%20%24%7Bname%7D%60%20%7D)%5Cn%20%20%7D%2C%5Cn%7D%5Cn%22%7D%2C%22FullscreenToggle.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2FFullscreenToggle.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3C!--%5Cn%20%20%20%20%E6%96%87%E6%A1%A3%E7%A4%BA%E4%BE%8B%E8%BE%85%E5%8A%A9%E7%BB%84%E4%BB%B6%EF%BC%8C%E4%BB%85%E7%94%A8%E4%BA%8E%E5%9C%A8%E5%B5%8C%E5%85%A5%E5%BC%8F%E6%96%87%E6%A1%A3%E9%A1%B5%E9%9D%A2%E4%B8%AD%E6%8F%90%E4%BE%9B%E5%85%A8%E5%B1%8F%E9%A2%84%E8%A7%88%E8%83%BD%E5%8A%9B%E3%80%82%5Cn%20%20%20%20%E4%B8%8D%E6%98%AF%20%40opentiny%2Ftiny-robot-chat%20%E7%9A%84%E5%86%85%E7%BD%AE%E7%BB%84%E4%BB%B6%EF%BC%8C%E4%B8%9A%E5%8A%A1%E9%A1%B9%E7%9B%AE%E4%B8%AD%E6%97%A0%E9%9C%80%E5%BC%95%E5%85%A5%E3%80%82%5Cn%20%20--%3E%5Cn%20%20%3Cbutton%20ref%3D%5C%22btnRef%5C%22%20class%3D%5C%22fullscreen-toggle%5C%22%20%3Atitle%3D%5C%22isFullscreen%20%3F%20'%E9%80%80%E5%87%BA%E5%85%A8%E5%B1%8F'%20%3A%20'%E5%85%A8%E5%B1%8F%E9%A2%84%E8%A7%88'%5C%22%20%40click%3D%5C%22toggle%5C%22%3E%5Cn%20%20%20%20%3Csvg%5Cn%20%20%20%20%20%20v-if%3D%5C%22!isFullscreen%5C%22%5Cn%20%20%20%20%20%20xmlns%3D%5C%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%5C%22%5Cn%20%20%20%20%20%20width%3D%5C%2216%5C%22%5Cn%20%20%20%20%20%20height%3D%5C%2216%5C%22%5Cn%20%20%20%20%20%20viewBox%3D%5C%220%200%2024%2024%5C%22%5Cn%20%20%20%20%20%20fill%3D%5C%22none%5C%22%5Cn%20%20%20%20%20%20stroke%3D%5C%22currentColor%5C%22%5Cn%20%20%20%20%20%20stroke-width%3D%5C%222%5C%22%5Cn%20%20%20%20%20%20stroke-linecap%3D%5C%22round%5C%22%5Cn%20%20%20%20%20%20stroke-linejoin%3D%5C%22round%5C%22%5Cn%20%20%20%20%3E%5Cn%20%20%20%20%20%20%3Cpolyline%20points%3D%5C%2215%203%2021%203%2021%209%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%3Cpolyline%20points%3D%5C%229%2021%203%2021%203%2015%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%3Cline%20x1%3D%5C%2221%5C%22%20y1%3D%5C%223%5C%22%20x2%3D%5C%2214%5C%22%20y2%3D%5C%2210%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%3Cline%20x1%3D%5C%223%5C%22%20y1%3D%5C%2221%5C%22%20x2%3D%5C%2210%5C%22%20y2%3D%5C%2214%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fsvg%3E%5Cn%20%20%20%20%3Csvg%5Cn%20%20%20%20%20%20v-else%5Cn%20%20%20%20%20%20xmlns%3D%5C%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%5C%22%5Cn%20%20%20%20%20%20width%3D%5C%2216%5C%22%5Cn%20%20%20%20%20%20height%3D%5C%2216%5C%22%5Cn%20%20%20%20%20%20viewBox%3D%5C%220%200%2024%2024%5C%22%5Cn%20%20%20%20%20%20fill%3D%5C%22none%5C%22%5Cn%20%20%20%20%20%20stroke%3D%5C%22currentColor%5C%22%5Cn%20%20%20%20%20%20stroke-width%3D%5C%222%5C%22%5Cn%20%20%20%20%20%20stroke-linecap%3D%5C%22round%5C%22%5Cn%20%20%20%20%20%20stroke-linejoin%3D%5C%22round%5C%22%5Cn%20%20%20%20%3E%5Cn%20%20%20%20%20%20%3Cpolyline%20points%3D%5C%224%2014%2010%2014%2010%2020%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%3Cpolyline%20points%3D%5C%2220%2010%2014%2010%2014%204%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%3Cline%20x1%3D%5C%2214%5C%22%20y1%3D%5C%2210%5C%22%20x2%3D%5C%2221%5C%22%20y2%3D%5C%223%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%3Cline%20x1%3D%5C%223%5C%22%20y1%3D%5C%2221%5C%22%20x2%3D%5C%2210%5C%22%20y2%3D%5C%2214%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fsvg%3E%5Cn%20%20%3C%2Fbutton%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20ref%2C%20onMounted%2C%20onUnmounted%20%7D%20from%20'vue'%5Cn%5Cnconst%20props%20%3D%20defineProps%3C%7B%5Cn%20%20target%3F%3A%20string%5Cn%7D%3E()%5Cn%5Cnconst%20btnRef%20%3D%20ref%3CHTMLButtonElement%20%7C%20null%3E(null)%5Cnconst%20isFullscreen%20%3D%20ref(false)%5Cnlet%20targetEl%3A%20HTMLElement%20%7C%20null%20%3D%20null%5Cn%5Cnfunction%20resolveTarget()%3A%20HTMLElement%20%7C%20null%20%7B%5Cn%20%20if%20(!btnRef.value)%20return%20null%5Cn%20%20if%20(props.target)%20return%20document.querySelector(props.target)%5Cn%20%20return%20btnRef.value.closest('.demo-container')%20as%20HTMLElement%20%7C%20null%5Cn%7D%5Cn%5Cnfunction%20toggle()%20%7B%5Cn%20%20isFullscreen.value%20%3D%20!isFullscreen.value%5Cn%20%20targetEl%20%3D%20resolveTarget()%5Cn%20%20if%20(!targetEl)%20return%5Cn%5Cn%20%20if%20(isFullscreen.value)%20%7B%5Cn%20%20%20%20targetEl.classList.add('is-demo-fullscreen')%5Cn%20%20%20%20document.body.style.overflow%20%3D%20'hidden'%5Cn%20%20%7D%20else%20%7B%5Cn%20%20%20%20exit()%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnfunction%20exit()%20%7B%5Cn%20%20isFullscreen.value%20%3D%20false%5Cn%20%20targetEl%3F.classList.remove('is-demo-fullscreen')%5Cn%20%20targetEl%20%3D%20null%5Cn%20%20document.body.style.overflow%20%3D%20''%5Cn%7D%5Cn%5Cnfunction%20onKeydown(e%3A%20KeyboardEvent)%20%7B%5Cn%20%20if%20(e.key%20%3D%3D%3D%20'Escape'%20%26%26%20isFullscreen.value)%20exit()%5Cn%7D%5Cn%5CnonMounted(()%20%3D%3E%20document.addEventListener('keydown'%2C%20onKeydown))%5CnonUnmounted(()%20%3D%3E%20%7B%5Cn%20%20document.removeEventListener('keydown'%2C%20onKeydown)%5Cn%20%20exit()%5Cn%7D)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.fullscreen-toggle%20%7B%5Cn%20%20display%3A%20inline-flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%20%20width%3A%2028px%3B%5Cn%20%20height%3A%2028px%3B%5Cn%20%20border%3A%200%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20background%3A%20transparent%3B%5Cn%20%20color%3A%20var(--chat-text-secondary%2C%20%236b7280)%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%20%20transition%3A%5Cn%20%20%20%20background%200.15s%20ease%2C%5Cn%20%20%20%20color%200.15s%20ease%3B%5Cn%7D%5Cn%5Cn.fullscreen-toggle%3Ahover%20%7B%5Cn%20%20background%3A%20var(--chat-surface-bg-hover%2C%20rgba(15%2C%2023%2C%2042%2C%200.06))%3B%5Cn%20%20color%3A%20var(--chat-text-primary%2C%20%23111827)%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%5Cn%3Cstyle%3E%5Cn.is-demo-fullscreen%20%7B%5Cn%20%20position%3A%20fixed%20!important%3B%5Cn%20%20inset%3A%200%20!important%3B%5Cn%20%20z-index%3A%209999%20!important%3B%5Cn%20%20height%3A%20100dvh%20!important%3B%5Cn%20%20width%3A%20100vw%20!important%3B%5Cn%20%20border%3A%200%20!important%3B%5Cn%20%20border-radius%3A%200%20!important%3B%5Cn%20%20background%3A%20var(--vp-c-bg%2C%20%23fff)%20!important%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[0]||(n[0]=()=>{E.value=!1}),vueCode:C(h)},D({_:2},[t.value?{name:"vue",fn:o(()=>[e(C(t))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1})])}}});export{x as __pageData,v as default};
