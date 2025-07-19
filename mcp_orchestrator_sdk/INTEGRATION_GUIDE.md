# MCP编排器SDK集成指南

## 📦 SDK结构

```
mcp_orchestrator_sdk/
├── __init__.py          # 主模块入口
├── client.py            # 主客户端类
├── models.py            # 数据模型定义
├── exceptions.py        # 异常类定义
├── utils.py             # 工具函数
├── examples.py          # 完整示例
├── quick_start.py       # 快速开始
├── setup.py             # 安装配置
├── requirements.txt     # 依赖列表
├── README.md            # 使用文档
└── INTEGRATION_GUIDE.md # 集成指南
```

## 🚀 快速集成

### 1. 安装SDK

```bash
# 方法1: 直接复制到项目
cp -r mcp_orchestrator_sdk /path/to/your/project/

# 方法2: 本地安装
pip install -e ./mcp_orchestrator_sdk

# 方法3: 添加到requirements.txt
echo "mcp-orchestrator-sdk @ file:///path/to/mcp_orchestrator_sdk" >> requirements.txt
```

### 2. 基础集成

```python
# your_app.py
import asyncio
from mcp_orchestrator_sdk import MCPOrchestratorSDK
from mcp_orchestrator_sdk.exceptions import MCPSDKError

class MyApplication:
    def __init__(self):
        self.mcp_client = None
    
    async def initialize(self):
        """初始化MCP客户端"""
        self.mcp_client = MCPOrchestratorSDK("http://localhost:8006")
        
        # 检查连接
        is_healthy = await self.mcp_client.check_health()
        if not is_healthy:
            raise Exception("MCP服务不可用")
    
    async def process_article(self, article_url: str, user_id: str) -> dict:
        """处理文章"""
        try:
            result = await self.mcp_client.execute_workflow_sync(
                workflow_id="default_activity_processing",
                input_data=f"处理这篇文章：{article_url}",
                user_id=user_id
            )
            
            return {
                "success": result.is_successful,
                "result": result.final_result,
                "steps": len(result.steps),
                "duration": result.total_duration_seconds
            }
        except MCPSDKError as e:
            return {
                "success": False,
                "error": e.message
            }
    
    async def cleanup(self):
        """清理资源"""
        if self.mcp_client:
            await self.mcp_client.close()

# 使用示例
async def main():
    app = MyApplication()
    try:
        await app.initialize()
        result = await app.process_article(
            "https://mp.weixin.qq.com/s/example", 
            "user123"
        )
        print(result)
    finally:
        await app.cleanup()

asyncio.run(main())
```

## 🔧 高级集成模式

### 1. 单例模式

```python
# mcp_manager.py
import asyncio
from typing import Optional
from mcp_orchestrator_sdk import MCPOrchestratorSDK

class MCPManager:
    _instance: Optional['MCPManager'] = None
    _client: Optional[MCPOrchestratorSDK] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    async def initialize(self, base_url: str = "http://localhost:8006"):
        """初始化客户端"""
        if self._client is None:
            self._client = MCPOrchestratorSDK(base_url)
            await self._client._ensure_session()
    
    @property
    def client(self) -> MCPOrchestratorSDK:
        if self._client is None:
            raise RuntimeError("MCP客户端未初始化")
        return self._client
    
    async def close(self):
        """关闭客户端"""
        if self._client:
            await self._client.close()
            self._client = None

# 全局实例
mcp_manager = MCPManager()

# 使用方式
async def process_data(data: str):
    await mcp_manager.initialize()
    result = await mcp_manager.client.execute_workflow_sync(
        "default_activity_processing", data, "user"
    )
    return result
```

### 2. 依赖注入模式

```python
# di_example.py
from abc import ABC, abstractmethod
from mcp_orchestrator_sdk import MCPOrchestratorSDK

class WorkflowService(ABC):
    @abstractmethod
    async def execute(self, workflow_id: str, data: str, user_id: str) -> dict:
        pass

class MCPWorkflowService(WorkflowService):
    def __init__(self, client: MCPOrchestratorSDK):
        self.client = client
    
    async def execute(self, workflow_id: str, data: str, user_id: str) -> dict:
        result = await self.client.execute_workflow_sync(workflow_id, data, user_id)
        return result.to_dict()

class ArticleProcessor:
    def __init__(self, workflow_service: WorkflowService):
        self.workflow_service = workflow_service
    
    async def process(self, article_url: str) -> dict:
        return await self.workflow_service.execute(
            "default_activity_processing", 
            article_url, 
            "processor"
        )

# 使用示例
async def main():
    client = MCPOrchestratorSDK("http://localhost:8006")
    workflow_service = MCPWorkflowService(client)
    processor = ArticleProcessor(workflow_service)
    
    result = await processor.process("https://example.com/article")
    print(result)
    
    await client.close()
```

### 3. 异步队列模式

```python
# queue_example.py
import asyncio
from asyncio import Queue
from dataclasses import dataclass
from mcp_orchestrator_sdk import MCPOrchestratorSDK

@dataclass
class WorkflowTask:
    workflow_id: str
    input_data: str
    user_id: str
    callback: callable = None

class WorkflowQueue:
    def __init__(self, client: MCPOrchestratorSDK, max_workers: int = 5):
        self.client = client
        self.queue = Queue()
        self.workers = []
        self.max_workers = max_workers
        self.running = False
    
    async def start(self):
        """启动工作线程"""
        self.running = True
        for i in range(self.max_workers):
            worker = asyncio.create_task(self._worker(f"worker-{i}"))
            self.workers.append(worker)
    
    async def stop(self):
        """停止工作线程"""
        self.running = False
        
        # 等待所有任务完成
        await self.queue.join()
        
        # 取消工作线程
        for worker in self.workers:
            worker.cancel()
        
        await asyncio.gather(*self.workers, return_exceptions=True)
    
    async def submit(self, task: WorkflowTask):
        """提交任务"""
        await self.queue.put(task)
    
    async def _worker(self, name: str):
        """工作线程"""
        while self.running:
            try:
                # 获取任务
                task = await asyncio.wait_for(self.queue.get(), timeout=1.0)
                
                # 执行任务
                result = await self.client.execute_workflow_sync(
                    task.workflow_id, task.input_data, task.user_id
                )
                
                # 调用回调
                if task.callback:
                    await task.callback(result)
                
                # 标记任务完成
                self.queue.task_done()
                
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                print(f"Worker {name} error: {e}")
                self.queue.task_done()

# 使用示例
async def on_result(result):
    print(f"任务完成: {result.is_successful}")

async def main():
    client = MCPOrchestratorSDK("http://localhost:8006")
    queue = WorkflowQueue(client, max_workers=3)
    
    await queue.start()
    
    # 提交任务
    for i in range(10):
        task = WorkflowTask(
            workflow_id="default_activity_processing",
            input_data=f"任务 {i}",
            user_id=f"user_{i}",
            callback=on_result
        )
        await queue.submit(task)
    
    # 等待完成
    await asyncio.sleep(30)
    await queue.stop()
    await client.close()
```

## 🌐 Web框架集成

### 1. FastAPI集成

```python
# fastapi_integration.py
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from mcp_orchestrator_sdk import MCPOrchestratorSDK
from mcp_orchestrator_sdk.exceptions import MCPSDKError

app = FastAPI(title="MCP集成API")

# 全局客户端
mcp_client: MCPOrchestratorSDK = None

@app.on_event("startup")
async def startup():
    global mcp_client
    mcp_client = MCPOrchestratorSDK("http://localhost:8006")
    
    # 检查连接
    is_healthy = await mcp_client.check_health()
    if not is_healthy:
        raise Exception("MCP服务不可用")

@app.on_event("shutdown")
async def shutdown():
    if mcp_client:
        await mcp_client.close()

class WorkflowRequest(BaseModel):
    workflow_id: str
    input_data: str
    user_id: str

class WorkflowResponse(BaseModel):
    success: bool
    result: dict = None
    error: str = None

@app.post("/execute", response_model=WorkflowResponse)
async def execute_workflow(request: WorkflowRequest):
    """同步执行工作流"""
    try:
        result = await mcp_client.execute_workflow_sync(
            workflow_id=request.workflow_id,
            input_data=request.input_data,
            user_id=request.user_id
        )
        
        return WorkflowResponse(
            success=result.is_successful,
            result=result.to_dict() if result.is_successful else None,
            error=result.error if not result.is_successful else None
        )
    except MCPSDKError as e:
        raise HTTPException(status_code=500, detail=e.message)

@app.post("/execute-async")
async def execute_workflow_async(request: WorkflowRequest):
    """异步执行工作流"""
    try:
        task_id = await mcp_client.execute_workflow_async(
            workflow_id=request.workflow_id,
            input_data=request.input_data,
            user_id=request.user_id
        )
        
        return {"task_id": task_id, "status": "submitted"}
    except MCPSDKError as e:
        raise HTTPException(status_code=500, detail=e.message)

@app.get("/health")
async def health_check():
    """健康检查"""
    is_healthy = await mcp_client.check_health()
    return {"healthy": is_healthy}

@app.get("/workflows")
async def get_workflows():
    """获取工作流列表"""
    workflows = await mcp_client.get_workflows()
    return [wf.to_dict() for wf in workflows]
```

### 2. Django集成

```python
# django_integration.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import asyncio
from asgiref.sync import sync_to_async
from mcp_orchestrator_sdk import MCPOrchestratorSDK

# 全局客户端
mcp_client = None

async def get_mcp_client():
    global mcp_client
    if mcp_client is None:
        mcp_client = MCPOrchestratorSDK("http://localhost:8006")
    return mcp_client

@csrf_exempt
@require_http_methods(["POST"])
def execute_workflow(request):
    """执行工作流"""
    try:
        data = json.loads(request.body)
        
        # 异步执行
        result = asyncio.run(_execute_workflow_async(
            data['workflow_id'],
            data['input_data'],
            data['user_id']
        ))
        
        return JsonResponse({
            'success': result.is_successful,
            'result': result.to_dict()
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

async def _execute_workflow_async(workflow_id, input_data, user_id):
    client = await get_mcp_client()
    return await client.execute_workflow_sync(workflow_id, input_data, user_id)
```

### 3. Flask集成

```python
# flask_integration.py
from flask import Flask, request, jsonify
import asyncio
from mcp_orchestrator_sdk import MCPOrchestratorSDK
from mcp_orchestrator_sdk.exceptions import MCPSDKError

app = Flask(__name__)

# 全局客户端
mcp_client = None

def get_event_loop():
    try:
        return asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        return loop

@app.before_first_request
def initialize():
    global mcp_client
    loop = get_event_loop()
    mcp_client = MCPOrchestratorSDK("http://localhost:8006")
    
    # 检查连接
    is_healthy = loop.run_until_complete(mcp_client.check_health())
    if not is_healthy:
        raise Exception("MCP服务不可用")

@app.route('/execute', methods=['POST'])
def execute_workflow():
    """执行工作流"""
    try:
        data = request.get_json()
        loop = get_event_loop()
        
        result = loop.run_until_complete(mcp_client.execute_workflow_sync(
            workflow_id=data['workflow_id'],
            input_data=data['input_data'],
            user_id=data['user_id']
        ))
        
        return jsonify({
            'success': result.is_successful,
            'result': result.to_dict()
        })
    except MCPSDKError as e:
        return jsonify({
            'success': False,
            'error': e.message
        }), 500

@app.route('/health')
def health_check():
    """健康检查"""
    loop = get_event_loop()
    is_healthy = loop.run_until_complete(mcp_client.check_health())
    return jsonify({'healthy': is_healthy})
```

## 📋 最佳实践

### 1. 错误处理

```python
from mcp_orchestrator_sdk.exceptions import (
    MCPConnectionError, MCPTimeoutError, MCPWorkflowError
)

async def robust_execution(client, workflow_id, data, user_id):
    """健壮的执行函数"""
    max_retries = 3
    retry_delay = 1.0
    
    for attempt in range(max_retries):
        try:
            return await client.execute_workflow_sync(
                workflow_id, data, user_id, timeout=60
            )
        except MCPConnectionError:
            if attempt == max_retries - 1:
                raise
            await asyncio.sleep(retry_delay * (2 ** attempt))
        except MCPTimeoutError:
            # 超时时切换到异步模式
            task_id = await client.execute_workflow_async(
                workflow_id, data, user_id
            )
            return {"async_task_id": task_id}
        except MCPWorkflowError as e:
            # 工作流错误不重试
            raise
```

### 2. 连接池管理

```python
class MCPConnectionPool:
    def __init__(self, base_url: str, pool_size: int = 5):
        self.base_url = base_url
        self.pool_size = pool_size
        self.pool = asyncio.Queue(maxsize=pool_size)
        self.created_count = 0
    
    async def get_client(self) -> MCPOrchestratorSDK:
        """获取客户端"""
        try:
            return self.pool.get_nowait()
        except asyncio.QueueEmpty:
            if self.created_count < self.pool_size:
                client = MCPOrchestratorSDK(self.base_url)
                await client._ensure_session()
                self.created_count += 1
                return client
            else:
                return await self.pool.get()
    
    async def return_client(self, client: MCPOrchestratorSDK):
        """归还客户端"""
        await self.pool.put(client)
    
    async def close_all(self):
        """关闭所有客户端"""
        while not self.pool.empty():
            client = await self.pool.get()
            await client.close()
```

### 3. 配置管理

```python
# config.py
import os
from dataclasses import dataclass

@dataclass
class MCPConfig:
    base_url: str = os.getenv("MCP_BASE_URL", "http://localhost:8006")
    timeout: int = int(os.getenv("MCP_TIMEOUT", "300"))
    retry_count: int = int(os.getenv("MCP_RETRY_COUNT", "3"))
    max_concurrent: int = int(os.getenv("MCP_MAX_CONCURRENT", "10"))
    api_key: str = os.getenv("MCP_API_KEY")

# 使用配置
config = MCPConfig()
client = MCPOrchestratorSDK(
    base_url=config.base_url,
    config=MCPClientConfig(
        base_url=config.base_url,
        timeout=config.timeout,
        retry_count=config.retry_count,
        api_key=config.api_key,
        max_concurrent_requests=config.max_concurrent
    )
)
```

### 4. 监控和日志

```python
import logging
import time
from functools import wraps

logger = logging.getLogger(__name__)

def monitor_execution(func):
    """监控装饰器"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = await func(*args, **kwargs)
            duration = time.time() - start_time
            logger.info(f"执行成功: {func.__name__}, 耗时: {duration:.2f}秒")
            return result
        except Exception as e:
            duration = time.time() - start_time
            logger.error(f"执行失败: {func.__name__}, 耗时: {duration:.2f}秒, 错误: {e}")
            raise
    return wrapper

@monitor_execution
async def execute_with_monitoring(client, workflow_id, data, user_id):
    return await client.execute_workflow_sync(workflow_id, data, user_id)
```

## 🧪 测试集成

```python
# test_integration.py
import pytest
import asyncio
from unittest.mock import Mock, AsyncMock
from mcp_orchestrator_sdk import MCPOrchestratorSDK
from mcp_orchestrator_sdk.models import WorkflowExecutionResult, ExecutionStatus

@pytest.fixture
async def mock_client():
    """模拟客户端"""
    client = Mock(spec=MCPOrchestratorSDK)
    client.execute_workflow_sync = AsyncMock()
    client.check_health = AsyncMock(return_value=True)
    return client

@pytest.mark.asyncio
async def test_successful_execution(mock_client):
    """测试成功执行"""
    # 设置模拟返回
    mock_result = WorkflowExecutionResult(
        workflow_id="test_workflow",
        execution_id="exec_123",
        user_id="test_user",
        status=ExecutionStatus.COMPLETED
    )
    mock_client.execute_workflow_sync.return_value = mock_result
    
    # 执行测试
    result = await mock_client.execute_workflow_sync(
        "test_workflow", "test_data", "test_user"
    )
    
    # 验证结果
    assert result.is_successful
    assert result.workflow_id == "test_workflow"
    mock_client.execute_workflow_sync.assert_called_once()

@pytest.mark.asyncio
async def test_integration_with_real_service():
    """集成测试（需要真实服务）"""
    client = MCPOrchestratorSDK("http://localhost:8006")
    
    try:
        # 检查服务可用性
        is_healthy = await client.check_health()
        if not is_healthy:
            pytest.skip("MCP服务不可用")
        
        # 获取工作流
        workflows = await client.get_workflows()
        assert len(workflows) > 0
        
        # 执行工作流
        result = await client.execute_workflow_sync(
            workflows[0].workflow_id,
            "测试数据",
            "test_user"
        )
        
        assert result is not None
        
    finally:
        await client.close()
```

## 🚀 部署建议

### 1. 环境变量配置

```bash
# .env
MCP_BASE_URL=http://mcp-orchestrator:8006
MCP_TIMEOUT=300
MCP_RETRY_COUNT=3
MCP_MAX_CONCURRENT=10
MCP_API_KEY=your-api-key
```

### 2. Docker集成

```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app

# 复制SDK
COPY mcp_orchestrator_sdk/ ./mcp_orchestrator_sdk/

# 安装依赖
COPY requirements.txt .
RUN pip install -r requirements.txt

# 复制应用代码
COPY . .

CMD ["python", "app.py"]
```

### 3. Kubernetes配置

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app
        image: my-app:latest
        env:
        - name: MCP_BASE_URL
          value: "http://mcp-orchestrator-service:8006"
        - name: MCP_TIMEOUT
          value: "300"
```

这个集成指南提供了从基础使用到高级集成的完整方案，帮助开发者快速将MCP编排器SDK集成到各种应用中。 