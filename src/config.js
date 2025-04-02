import { taskService } from './api/taskService'
import { mockTaskService } from './api/mockService'

// 设置为 true 使用模拟数据，设置为 false 使用真实后端
const USE_MOCK = false

export const service = USE_MOCK ? mockTaskService : taskService 