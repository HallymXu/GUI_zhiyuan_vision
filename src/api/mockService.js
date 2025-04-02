// 模拟数据
const mockTasks = {
    1: { fps: 22.44, bandwidth: 2.88, isActive: true, isAdaptive: true },
    2: { fps: 16.89, bandwidth: 7.74, isActive: true, isAdaptive: true },
    3: { fps: 23.87, bandwidth: 0.92, isActive: true, isAdaptive: true },
    4: { fps: 27.60, bandwidth: 1.95, isActive: true, isAdaptive: true }
};

// 模拟WebSocket
class MockWebSocket {
    constructor(url) {
        this.url = url;
        this.onmessage = null;
        this.onclose = null;
        this._startBroadcast();
    }

    _startBroadcast() {
        setInterval(() => {
            if (this.onmessage) {
                // 更新模拟数据
                Object.values(mockTasks).forEach(task => {
                    if (task.isActive) {
                        if (task.isAdaptive) {
                            task.bandwidth = Math.max(0.5, Math.min(10.0, 
                                task.bandwidth + (Math.random() - 0.5)));
                        }
                        task.fps = Math.max(15.0, Math.min(30.0, 
                            task.fps + (Math.random() * 2 - 1)));
                    }
                });

                // 发送更新
                this.onmessage({
                    data: JSON.stringify({
                        type: 'metrics_update',
                        data: mockTasks
                    })
                });
            }
        }, 1000);
    }

    close() {
        if (this.onclose) {
            this.onclose();
        }
    }
}

export class MockTaskService {
    constructor() {
        this.ws = null;
        this.messageHandlers = new Set();
    }

    connectWebSocket() {
        this.ws = new MockWebSocket('mock://localhost');
        
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'metrics_update') {
                this.messageHandlers.forEach(handler => handler(message.data));
            }
        };

        this.ws.onclose = () => {
            setTimeout(() => this.connectWebSocket(), 1000);
        };

        return this.ws;
    }

    addMessageHandler(handler) {
        this.messageHandlers.add(handler);
    }

    removeMessageHandler(handler) {
        this.messageHandlers.delete(handler);
    }

    async getAllTasks() {
        return mockTasks;
    }

    async getTask(taskId) {
        if (!(taskId in mockTasks)) {
            throw new Error(`Task ${taskId} not found`);
        }
        return mockTasks[taskId];
    }

    async toggleTask(taskId) {
        if (!(taskId in mockTasks)) {
            throw new Error(`Task ${taskId} not found`);
        }
        mockTasks[taskId].isActive = !mockTasks[taskId].isActive;
        return { status: 'success', isActive: mockTasks[taskId].isActive };
    }

    async updateBandwidth(taskId, bandwidth) {
        if (!(taskId in mockTasks)) {
            throw new Error(`Task ${taskId} not found`);
        }
        if (mockTasks[taskId].isAdaptive) {
            throw new Error('Cannot update bandwidth in adaptive mode');
        }
        mockTasks[taskId].bandwidth = bandwidth;
        return { status: 'success', bandwidth: mockTasks[taskId].bandwidth };
    }

    async toggleAdaptive(taskId) {
        if (!(taskId in mockTasks)) {
            throw new Error(`Task ${taskId} not found`);
        }
        mockTasks[taskId].isAdaptive = !mockTasks[taskId].isAdaptive;
        return { status: 'success', isAdaptive: mockTasks[taskId].isAdaptive };
    }
}

// 创建mock服务实例
export const mockTaskService = new MockTaskService(); 