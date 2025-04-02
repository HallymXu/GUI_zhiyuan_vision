<template>
  <div class="container">
    <h1 class="title">多任务传输系统</h1>
    <div class="video-grid">
      <TaskWindow
        v-for="(task, index) in tasks" 
        :key="index"
        :taskId="index + 1"
        :fps="task.fps"
        :bandwidth="task.bandwidth"
        :isActive="task.isActive"
        :isAdaptive="task.isAdaptive"
        @update-bandwidth="updateBandwidth"
        @toggle-adaptive="toggleAdaptive"
        @toggle-task="toggleTask"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import TaskWindow from './components/TaskWindow.vue'
import { ElMessage } from 'element-plus'
import { service } from './config'

const tasks = ref([
  { fps: 0, bandwidth: 0, isActive: true, isAdaptive: true },
  { fps: 0, bandwidth: 0, isActive: true, isAdaptive: true },
  { fps: 0, bandwidth: 0, isActive: true, isAdaptive: true },
  { fps: 0, bandwidth: 0, isActive: true, isAdaptive: true }
])

// 处理WebSocket消息
const handleMetricsUpdate = (data) => {
  Object.entries(data).forEach(([taskId, taskData]) => {
    const index = parseInt(taskId) - 1
    if (index >= 0 && index < tasks.value.length) {
      tasks.value[index] = { ...taskData }
    }
  })
}

// 初始化WebSocket连接
onMounted(async () => {
  try {
    // 获取初始任务数据
    const initialTasks = await service.getAllTasks()
    Object.entries(initialTasks).forEach(([taskId, taskData]) => {
      const index = parseInt(taskId) - 1
      if (index >= 0 && index < tasks.value.length) {
        tasks.value[index] = { ...taskData }
      }
    })

    // 建立WebSocket连接
    service.connectWebSocket()
    service.addMessageHandler(handleMetricsUpdate)
  } catch (error) {
    ElMessage.error('连接服务器失败')
    console.error('Failed to initialize:', error)
  }
})

// 清理WebSocket连接
onUnmounted(() => {
  service.removeMessageHandler(handleMetricsUpdate)
  if (service.ws) {
    service.ws.close()
  }
})

// 任务控制函数
const toggleTask = async (taskId) => {
  try {
    await service.toggleTask(taskId)
  } catch (error) {
    ElMessage.error(`切换任务${taskId}状态失败`)
    console.error('Failed to toggle task:', error)
  }
}

const updateBandwidth = async (taskId, value) => {
  try {
    await service.updateBandwidth(taskId, value)
  } catch (error) {
    ElMessage.error(`更新任务${taskId}带宽失败`)
    console.error('Failed to update bandwidth:', error)
  }
}

const toggleAdaptive = async (taskId) => {
  try {
    await service.toggleAdaptive(taskId)
  } catch (error) {
    ElMessage.error(`切换任务${taskId}自适应模式失败`)
    console.error('Failed to toggle adaptive mode:', error)
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.title {
  text-align: center;
  margin-bottom: 30px;
  font-weight: 600;
  color: var(--military-text);
  font-size: 32px;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 30px;
}
</style>