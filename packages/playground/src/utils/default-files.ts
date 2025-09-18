export function getDefaultFiles() {
  return {
    'App.vue': `<template>
  <div class="app">
    <h1>TinyRobot Playground</h1>
    <p>Welcome to the TinyRobot component playground!</p>

    <div class="demo-section">
      <Demo />
    </div>
  </div>
</template>

<script setup lang="ts">
import Demo from './Demo.vue'
</script>

<style scoped>
.app {
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
  min-height: 100vh;
}

h1 {
  color: #2c3e50;
  margin-bottom: 10px;
  text-align: center;
}

p {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

.demo-section {
  background: white;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
</style>`,

    'Demo.vue': `<template>
  <div class="demo">
    <h2>TinyRobot Components Demo</h2>

    <div class="component-section">
      <h3>Welcome Component</h3>
      <TrWelcome
        title="Welcome to TinyRobot!"
        description="Explore our AI-powered component library"
      />
    </div>

    <div class="component-section">
      <h3>Chat Bubbles</h3>
      <div class="bubble-container">
        <TrBubble
          content="Hello! I'm TinyRobot, your AI assistant. How can I help you today?"
          role="assistant"
          style="--tr-bubble-content-bg: var(--tr-color-primary-light)"
        />
        <TrBubble
          content="Can you show me how to use your components?"
          placement="end"
          role="user"
        />
        <TrBubble
          content="Of course! TinyRobot provides a comprehensive set of Vue 3 components designed for AI applications. You can use them to build chat interfaces, feedback systems, and more."
          role="assistant"
          style="--tr-bubble-content-bg: var(--tr-color-primary-light)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrWelcome, TrBubble } from '@opentiny/tiny-robot'
</script>

<style scoped>
.demo {
  padding: 20px;
}

.component-section {
  margin: 30px 0;
  padding: 24px;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  background: #f8f9fa;
}

.component-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.bubble-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>`,

    'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"]
}`,

    'index.css': `/* TinyRobot 样式导入 */
@import url('https://unpkg.com/@opentiny/tiny-robot@0.3.0-rc.4/dist/style.css');`,

    'import-map.json': `{
  "imports": {
    "vue": "https://unpkg.com/vue@3.3.11/dist/vue.esm-browser.js",
    "@opentiny/tiny-robot": "https://unpkg.com/@opentiny/tiny-robot@0.3.0-rc.4/dist/index.js",
    "@opentiny/tiny-robot-svgs": "https://unpkg.com/@opentiny/tiny-robot-svgs@0.3.0-rc.4/dist/tiny-robot-svgs.js",
    "@opentiny/vue": "https://registry.npmmirror.com/@opentiny/vue-runtime/3.22/files/dist3/tiny-vue-pc.mjs",
    "@opentiny/vue-icon": "https://registry.npmmirror.com/@opentiny/vue-runtime/3.22/files/dist3/tiny-vue-icon.mjs",
    "@vueuse/core": "https://unpkg.com/@vueuse/core@13.1.0/index.mjs"
  }
}`,
  }
}
