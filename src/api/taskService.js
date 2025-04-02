const API_BASE_URL = 'http://localhost:8000';
const WS_URL = 'ws://localhost:8000/ws';

export class TaskService {
    constructor() {
        this.ws = null;
        this.messageHandlers = new Set();
    }

    // WebSocket连接管理
    connectWebSocket() {
        this.ws = new WebSocket(WS_URL);
        
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'metrics_update') {
                this.messageHandlers.forEach(handler => handler(message.data));
            }
        };

        this.ws.onclose = () => {
            // 断线重连
            setTimeout(() => this.connectWebSocket(), 1000);
        };

        return this.ws;
    }

    // 添加消息处理器
    addMessageHandler(handler) {
        this.messageHandlers.add(handler);
    }

    // 移除消息处理器
    removeMessageHandler(handler) {
        this.messageHandlers.delete(handler);
    }

    // REST API调用
    async getAllTasks() {
        const response = await fetch(`${API_BASE_URL}/tasks`);
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        return response.json();
    }

    async getTask(taskId) {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch task ${taskId}`);
        }
        return response.json();
    }

    async toggleTask(taskId) {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/toggle`, {
            method: 'POST'
        });
        if (!response.ok) {
            throw new Error(`Failed to toggle task ${taskId}`);
        }
        return response.json();
    }

    async updateBandwidth(taskId, bandwidth) {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/bandwidth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ taskId, bandwidth })
        });
        if (!response.ok) {
            throw new Error(`Failed to update bandwidth for task ${taskId}`);
        }
        return response.json();
    }

    async toggleAdaptive(taskId) {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/adaptive`, {
            method: 'POST'
        });
        if (!response.ok) {
            throw new Error(`Failed to toggle adaptive mode for task ${taskId}`);
        }
        return response.json();
    }
}

// 创建单例实例
export const taskService = new TaskService(); 