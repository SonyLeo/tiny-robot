<script setup lang="ts">
defineProps<{
  mode: string
  selectedModel: string
  hasApiKey: boolean
  isOpenAI: boolean
}>()

defineEmits<{
  'update:mode': [value: string]
  'update:selectedModel': [value: string]
}>()
</script>

<template>
  <header class="demo-header">
    <div class="header-content">
      <div class="header-left">
        <h1 class="header-title">TinyRobot Chat</h1>
      </div>

      <div class="header-controls">
        <div class="control-item">
          <label>Mode</label>
          <select
            :value="mode"
            @input="$emit('update:mode', ($event.target as HTMLSelectElement).value)"
            class="select-input"
          >
            <option value="blackbox">Black-box (Zero Config)</option>
            <option value="whitebox">White-box (Custom)</option>
          </select>
        </div>

        <div class="status-item" :class="{ ready: hasApiKey, error: !hasApiKey }">
          <span class="status-dot"></span>
          {{ hasApiKey ? (isOpenAI ? 'OpenAI Ready' : 'DeepSeek Ready') : 'API Key Missing' }}
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.demo-header {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 24px;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  letter-spacing: -0.3px;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.control-item label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.select-input {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  background: #fff;
  color: #1f2937;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  min-width: 140px;
}

.select-input:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}

.select-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: #f3f4f6;
  color: #6b7280;
  transition: all 0.2s ease;
}

.status-item.ready {
  background: #ecfdf5;
  color: #047857;
}

.status-item.error {
  background: #fef2f2;
  color: #dc2626;
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

@media (max-width: 1024px) {
  .demo-header {
    padding: 10px 20px;
  }

  .header-content {
    gap: 16px;
  }

  .header-title {
    font-size: 16px;
  }

  .header-controls {
    gap: 12px;
  }

  .select-input {
    min-width: 120px;
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .demo-header {
    padding: 10px 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .header-title {
    font-size: 14px;
  }

  .header-controls {
    gap: 10px;
  }

  .control-item {
    flex: 1;
  }

  .select-input {
    width: 100%;
    min-width: auto;
  }

  .status-item {
    flex: 1;
    justify-content: center;
  }
}
</style>
