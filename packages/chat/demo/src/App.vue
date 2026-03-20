<script setup lang="ts">
import { ThemeProvider } from '@opentiny/tiny-robot'
import P5ShellPreview from './components/P5ShellPreview.vue'
import './styles/index.css'
</script>

<template>
  <ThemeProvider>
    <div class="demo-container">
      <P5ShellPreview />
    </div>
  </ThemeProvider>
</template>

<style>
.tr-sender:focus,
.tr-sender:focus-within {
  border-color: #1476ff;
  box-shadow: 0 0 6px rgba(20, 118, 255, 0.12) !important;
}

.tr-history {
  padding: 10px;
}
</style>
