<template>
  <div class="task-window" :class="{ inactive: !isActive }" @click="toggleTask">
    <div class="status-indicator" :class="{ active: isActive }">
      <div class="status-dot"></div>
      <span class="status-text">{{ isActive ? '运行中' : '已停止' }}</span>
    </div>
    <div class="video-container">
      <img src="/logo-g.png" alt="Video Stream" class="video-content" />
      <div class="overlay" v-if="!isActive">
        <div class="overlay-content">
          <div class="status-icon"></div>
          <span>点击启动任务</span>
        </div>
      </div>
    </div>
    <div class="info-panel" @click.stop>
      <div class="task-info">
        <span class="task-id">任务{{ taskId }}</span>
        <span class="adaptive-status">
          <span class="dot" :class="{ active: isAdaptive }"></span>
          {{ isAdaptive ? '自适应开启' : '自适应关闭' }}
        </span>
        <span class="metric">FPS: {{ formatNumber(fps) }}</span>
        <span class="metric">带宽: {{ formatNumber(bandwidth) }} Mbps</span>
      </div>
      <div class="bandwidth-control">
        <span class="control-label">带宽控制 (Mbps):</span>
        <div class="control-input">
          <input 
            type="number" 
            v-model="bandwidthInput"
            :disabled="isAdaptive"
            step="0.01"
            min="0"
            @input="handleBandwidthInput"
          >
          <button 
            @click="setBandwidth" 
            :disabled="isAdaptive || !isBandwidthChanged"
            class="set-button"
          >
            设置
          </button>
        </div>
        <div class="adaptive-control">
          <div class="toggle-container" @click="toggleAdaptiveMode">
            <input 
              type="checkbox" 
              v-model="adaptiveMode"
              class="toggle-input"
            >
            <div class="toggle-slider"></div>
          </div>
          <span class="toggle-label">自适应模式</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  taskId: {
    type: Number,
    required: true
  },
  fps: {
    type: Number,
    required: true
  },
  bandwidth: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAdaptive: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update-bandwidth', 'toggle-adaptive', 'toggle-task'])

const bandwidthInput = ref(formatNumber(props.bandwidth))
const adaptiveMode = ref(props.isAdaptive)
const isBandwidthChanged = ref(false)
const debounceTimer = ref(null)

// 格式化数字，保留两位小数
function formatNumber(num) {
  return Number(num).toFixed(2)
}

// 处理带宽输入
function handleBandwidthInput(event) {
  const value = event.target.value
  if (value === '') return
  
  const formattedValue = formatNumber(value)
  bandwidthInput.value = formattedValue
  isBandwidthChanged.value = formattedValue !== formatNumber(props.bandwidth)
  
  // 立即更新带宽，不再等待防抖
  if (!props.isAdaptive && isBandwidthChanged.value) {
    const value = Number(bandwidthInput.value)
    emit('update-bandwidth', props.taskId, value)
    isBandwidthChanged.value = false
  }
}

// 监听带宽变化更新输入框
watch(() => props.bandwidth, (newValue) => {
  const formattedValue = formatNumber(newValue)
  if (bandwidthInput.value !== formattedValue) {
    bandwidthInput.value = formattedValue
    isBandwidthChanged.value = false
  }
}, { flush: 'post' })

// 监听自适应模式变化
watch(() => props.isAdaptive, (newValue) => {
  adaptiveMode.value = newValue
  if (newValue) {
    isBandwidthChanged.value = false
  }
}, { flush: 'post' })

const setBandwidth = () => {
  if (!props.isAdaptive && isBandwidthChanged.value) {
    const value = Number(bandwidthInput.value)
    emit('update-bandwidth', props.taskId, value)
    isBandwidthChanged.value = false
  }
}

const toggleAdaptiveMode = () => {
  emit('toggle-adaptive', props.taskId)
}

const toggleTask = () => {
  emit('toggle-task', props.taskId)
}
</script>

<style scoped>
.task-window {
  border-radius: 8px;
  overflow: hidden;
  background: var(--military-dark);
  border: 1px solid var(--military-green);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  position: relative;
  cursor: pointer;
}

.task-window:hover {
  border-color: var(--military-highlight);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
  transform: translateY(-2px);
}

.task-window.inactive {
  opacity: 0.85;
  border-color: var(--military-red);
  transform: scale(0.98);
}

.task-window:active {
  transform: none;
}

.task-window:active .info-panel,
.task-window:active .adaptive-control,
.task-window:active .toggle-container {
  transform: none;
}

.status-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.6);
  padding: 6px 12px;
  border-radius: 16px;
  z-index: 2;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--military-red);
  box-shadow: 0 0 8px rgba(163, 65, 65, 0.4);
  transition: all 0.2s ease;
}

.status-indicator.active .status-dot {
  background-color: var(--military-accent);
  box-shadow: 0 0 8px rgba(139, 157, 125, 0.6);
}

.status-text {
  color: var(--military-text);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.video-container {
  aspect-ratio: 16/9;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--military-green);
  position: relative;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--military-text);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.overlay .status-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--military-accent);
  position: relative;
}

.overlay .status-icon:before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: var(--military-accent);
  border-radius: 50%;
}

.video-content {
  max-width: 100%;
  max-height: 100%;
}

.info-panel {
  padding: 20px;
  background: linear-gradient(to bottom, 
    rgba(74, 95, 60, 0.2),
    rgba(44, 65, 89, 0.2)
  );
}

.task-info {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.task-id {
  font-weight: 600;
  font-size: 16px;
  color: var(--military-highlight);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.adaptive-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--military-text);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--military-red);
  transition: all 0.2s ease;
  box-shadow: 0 0 8px rgba(163, 65, 65, 0.4);
}

.dot.active {
  background-color: var(--military-accent);
  box-shadow: 0 0 8px rgba(139, 157, 125, 0.6);
}

.metric {
  font-size: 14px;
  color: var(--military-text);
  font-family: monospace;
  background: rgba(0, 0, 0, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--military-accent);
}

.bandwidth-control {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-label {
  font-size: 14px;
  color: var(--military-text);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.control-input {
  display: flex;
  gap: 8px;
}

.control-input input {
  width: 100px;
  padding: 8px 12px;
  background: var(--military-dark);
  border: 1px solid var(--military-green);
  border-radius: 4px;
  font-size: 14px;
  color: var(--military-text);
  font-family: monospace;
  outline: none;
  transition: all 0.2s ease;
  -moz-appearance: textfield;
}

.control-input input::-webkit-outer-spin-button,
.control-input input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.control-input input:focus {
  border-color: var(--military-highlight);
  box-shadow: 0 0 0 2px rgba(232, 179, 57, 0.2);
}

.control-input input:disabled {
  background: rgba(0, 0, 0, 0.2);
  border-color: var(--military-accent);
  color: var(--military-accent);
}

.set-button {
  padding: 8px 16px;
  background: var(--military-green);
  color: var(--military-text);
  border: 1px solid var(--military-accent);
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.1s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.set-button:hover:not(:disabled) {
  background: var(--military-blue);
  border-color: var(--military-highlight);
  transform: translateY(-1px);
}

.set-button:active:not(:disabled) {
  transform: translateY(1px);
  transition: all 0.05s ease;
}

.set-button:disabled {
  background: var(--military-dark);
  border-color: var(--military-accent);
  color: var(--military-accent);
  cursor: not-allowed;
}

.adaptive-control {
  display: flex;
  align-items: center;
  gap: 12px;
  user-select: none;
  pointer-events: auto;
  position: relative;
  z-index: 1;
}

.toggle-container {
  cursor: pointer;
  width: 44px;
  height: 24px;
  transition: all 0.05s ease;
  pointer-events: auto;
  position: relative;
  z-index: 2;
}

.toggle-container:active {
  transform: none;
}

.toggle-label {
  color: var(--military-text);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: default;
}

.toggle-input {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 44px;
  height: 24px;
  background: var(--military-dark);
  border: 1px solid var(--military-green);
  border-radius: 12px;
  transition: all 0.05s ease;
}

.toggle-slider:before {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  background: var(--military-text);
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: all 0.5s ease;
}

.toggle-input:checked + .toggle-slider {
  background: var(--military-green);
  border-color: var(--military-accent);
}

.toggle-input:checked + .toggle-slider:before {
  transform: translateX(20px);
  background: var(--military-highlight);
}
</style>