# 多任务传输系统后端

这是多任务传输系统的后端服务，提供了任务管理、数据监控和实时更新的功能。

## 功能特点

- 实时任务状态监控
- WebSocket实时数据推送
- RESTful API接口
- 自适应带宽控制

## API接口

### WebSocket

- `ws://localhost:8000/ws` - 实时数据推送

### REST API

- GET `/tasks` - 获取所有任务状态
- GET `/tasks/{task_id}` - 获取单个任务状态
- POST `/tasks/{task_id}/toggle` - 切换任务活动状态
- POST `/tasks/{task_id}/bandwidth` - 更新任务带宽
- POST `/tasks/{task_id}/adaptive` - 切换自适应模式

## 安装和运行

1. 创建虚拟环境（推荐）：
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows
```

2. 安装依赖：
```bash
pip install -r requirements.txt
```

3. 运行服务：
```bash
python run.py
```

服务将在 http://localhost:8000 启动，API文档可在 http://localhost:8000/docs 查看。

## 开发说明

- 使用 FastAPI 框架
- 支持热重载
- 包含完整的API文档（Swagger UI）
- 使用 WebSocket 进行实时数据推送

## 示例请求

1. 获取所有任务：
```bash
curl http://localhost:8000/tasks
```

2. 切换任务状态：
```bash
curl -X POST http://localhost:8000/tasks/1/toggle
```

3. 更新带宽：
```bash
curl -X POST http://localhost:8000/tasks/1/bandwidth \
  -H "Content-Type: application/json" \
  -d '{"taskId": 1, "bandwidth": 5.0}'
``` 