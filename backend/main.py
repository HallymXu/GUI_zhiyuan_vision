from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import asyncio
import random
import json

app = FastAPI(title="多任务传输系统后端")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置具体的源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据模型
class TaskStatus(BaseModel):
    fps: float
    bandwidth: float
    isActive: bool
    isAdaptive: bool

class BandwidthUpdate(BaseModel):
    taskId: int
    bandwidth: float

# 全局状态管理
tasks: Dict[int, TaskStatus] = {
    1: TaskStatus(fps=22.44, bandwidth=2.88, isActive=True, isAdaptive=True),
    2: TaskStatus(fps=16.89, bandwidth=7.74, isActive=True, isAdaptive=True),
    3: TaskStatus(fps=23.87, bandwidth=0.92, isActive=True, isAdaptive=True),
    4: TaskStatus(fps=27.60, bandwidth=1.95, isActive=True, isAdaptive=True)
}

# WebSocket连接管理
active_connections: List[WebSocket] = []

# 工具函数
def update_metrics():
    """模拟更新任务指标"""
    for task_id, task in tasks.items():
        if task.isActive:
            if task.isAdaptive:
                # 在自适应模式下模拟带宽自动调整
                task.bandwidth = max(0.5, min(10.0, task.bandwidth + random.uniform(-0.5, 0.5)))
            # 模拟FPS变化
            task.fps = max(15.0, min(30.0, task.fps + random.uniform(-1.0, 1.0)))

async def broadcast_metrics():
    """广播指标更新到所有连接的客户端"""
    while True:
        update_metrics()
        if active_connections:
            message = {
                "type": "metrics_update",
                "data": {str(k): v.dict() for k, v in tasks.items()}
            }
            await asyncio.gather(
                *[connection.send_text(json.dumps(message)) for connection in active_connections]
            )
        await asyncio.sleep(1)  # 每秒更新一次

# WebSocket路由
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except:
        active_connections.remove(websocket)

# REST API路由
@app.get("/tasks")
async def get_tasks():
    """获取所有任务状态"""
    return tasks

@app.get("/tasks/{task_id}")
async def get_task(task_id: int):
    """获取单个任务状态"""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    return tasks[task_id]

@app.post("/tasks/{task_id}/toggle")
async def toggle_task(task_id: int):
    """切换任务活动状态"""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    tasks[task_id].isActive = not tasks[task_id].isActive
    return {"status": "success", "isActive": tasks[task_id].isActive}

@app.post("/tasks/{task_id}/bandwidth")
async def update_bandwidth(task_id: int, update: BandwidthUpdate):
    """更新任务带宽"""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    if tasks[task_id].isAdaptive:
        raise HTTPException(status_code=400, detail="Cannot update bandwidth in adaptive mode")
    tasks[task_id].bandwidth = update.bandwidth
    return {"status": "success", "bandwidth": tasks[task_id].bandwidth}

@app.post("/tasks/{task_id}/adaptive")
async def toggle_adaptive(task_id: int):
    """切换自适应模式"""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    tasks[task_id].isAdaptive = not tasks[task_id].isAdaptive
    return {"status": "success", "isAdaptive": tasks[task_id].isAdaptive}

# 启动时开始广播指标
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(broadcast_metrics()) 