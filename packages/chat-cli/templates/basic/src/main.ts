import { createApp } from 'vue'
import App from './App.vue'
// 使用 package.json exports 字段映射路径，比 /dist/style.css 更稳定
import '@opentiny/tiny-robot/style'
import '@opentiny/tiny-robot-chat/style'

createApp(App).mount('#app')
