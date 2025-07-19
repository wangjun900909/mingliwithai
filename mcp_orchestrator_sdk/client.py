"""
MCP编排器SDK主客户端
"""

import asyncio
import aiohttp
import json
import uuid
import time
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from urllib.parse import urljoin

# 版本号在这里直接定义，避免循环导入
SDK_VERSION = "2.0.0"
from .models import (
    WorkflowExecutionResult, ServiceStatus, WorkflowInfo, ExecutionStep,
    AsyncTaskInfo, ExecutionStatus, ServiceHealthStatus, CallbackNotification
)
from .exceptions import (
    MCPSDKError, MCPConnectionError, MCPTimeoutError, MCPWorkflowError,
    MCPServiceError, MCPValidationError, MCPResourceNotFoundError,
    HTTP_STATUS_TO_EXCEPTION
)


@dataclass
class MCPClientConfig:
    """客户端配置"""
    base_url: str
    timeout: int = 600
    retry_count: int = 3
    retry_delay: float = 1.0
    api_key: Optional[str] = None
    user_agent: str = f"MCP-Orchestrator-SDK/{SDK_VERSION}"
    enable_logging: bool = True
    max_concurrent_requests: int = 10
    
    def __post_init__(self):
        """配置验证"""
        if not self.base_url:
            raise MCPValidationError("base_url不能为空")
        
        # 确保URL以/结尾
        if not self.base_url.endswith('/'):
            self.base_url += '/'


class MCPOrchestratorSDK:
    """MCP编排器SDK主客户端"""
    
    def __init__(self, base_url: str = "http://localhost:8006", config: Optional[MCPClientConfig] = None):
        """
        初始化SDK客户端
        
        Args:
            base_url: MCP编排器服务地址
            config: 客户端配置
            
        重要说明:
            - 工作流必须实时调用，不支持预先缓存
            - 默认超时时间为600秒（10分钟）
            - 超过600秒的工作流会被强制中断
            - 需要稳定的网络连接
        """
        self.config = config or MCPClientConfig(base_url=base_url)
        self.session: Optional[aiohttp.ClientSession] = None
        self._closed = False
        
        # 请求管理
        self.pending_requests: Dict[str, asyncio.Future] = {}
        self.request_semaphore = asyncio.Semaphore(self.config.max_concurrent_requests)
    
    async def __aenter__(self):
        """异步上下文管理器入口"""
        await self._ensure_session()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """异步上下文管理器出口"""
        await self.close()
    
    async def _ensure_session(self):
        """确保HTTP会话已创建"""
        if self.session is None or self.session.closed:
            timeout = aiohttp.ClientTimeout(total=self.config.timeout)
            headers = {
                'User-Agent': self.config.user_agent,
                'Content-Type': 'application/json'
            }
            
            if self.config.api_key:
                headers['Authorization'] = f'Bearer {self.config.api_key}'
            
            self.session = aiohttp.ClientSession(
                timeout=timeout,
                headers=headers
            )
    
    async def close(self):
        """关闭客户端"""
        if self.session and not self.session.closed:
            await self.session.close()
        self._closed = True
    
    def _validate_not_closed(self):
        """验证客户端未关闭"""
        if self._closed:
            raise MCPSDKError("SDK客户端已关闭")
    
    @classmethod
    def get_version(cls) -> str:
        """获取SDK版本号"""
        return SDK_VERSION
    
    @classmethod
    def get_version_info(cls) -> Dict[str, Any]:
        """获取详细版本信息"""
        return {
            "version": SDK_VERSION,
            "build_date": "2025-07-02",
            "railway_compatible": True,
            "user_agent": f"MCP-Orchestrator-SDK/{SDK_VERSION}",
            "features": [
                "同步/异步工作流执行",
                "批量操作支持",
                "智能重试机制",
                "Railway云服务兼容",
                "600秒超时配置",
                "微信文章处理优化"
            ]
        }
    
    async def _make_request(
        self, 
        method: str, 
        endpoint: str, 
        data: Optional[Dict] = None,
        params: Optional[Dict] = None,
        timeout: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        发送HTTP请求
        
        Args:
            method: HTTP方法
            endpoint: API端点
            data: 请求数据
            params: URL参数
            timeout: 超时时间
            
        Returns:
            响应数据
            
        Raises:
            MCPSDKError: 各种SDK异常
        """
        self._validate_not_closed()
        await self._ensure_session()
        
        url = urljoin(self.config.base_url, endpoint.lstrip('/'))
        request_timeout = timeout or self.config.timeout
        
        async with self.request_semaphore:
            for attempt in range(self.config.retry_count):
                try:
                    async with self.session.request(
                        method=method,
                        url=url,
                        json=data,
                        params=params,
                        timeout=aiohttp.ClientTimeout(total=request_timeout)
                    ) as response:
                        
                        # 处理HTTP状态码
                        if response.status >= 400:
                            error_text = await response.text()
                            exception_class = HTTP_STATUS_TO_EXCEPTION.get(
                                response.status, MCPServiceError
                            )
                            
                            raise exception_class(
                                f"HTTP {response.status}: {error_text}",
                                http_status=response.status
                            )
                        
                        # 解析响应
                        try:
                            return await response.json()
                        except json.JSONDecodeError:
                            text = await response.text()
                            return {"message": text}
                
                except asyncio.TimeoutError:
                    if attempt == self.config.retry_count - 1:
                        raise MCPTimeoutError(
                            f"请求超时 ({request_timeout}秒)",
                            timeout_seconds=request_timeout
                        )
                
                except aiohttp.ClientError as e:
                    if attempt == self.config.retry_count - 1:
                        raise MCPConnectionError(f"连接错误: {str(e)}")
                
                # 重试延迟
                if attempt < self.config.retry_count - 1:
                    await asyncio.sleep(self.config.retry_delay * (2 ** attempt))
    
    # ========== 服务状态相关 ==========
    
    async def ping(self) -> Dict[str, Any]:
        """
        Ping服务
        
        Returns:
            服务信息
        """
        return await self._make_request("GET", "/api/mcp/ping")
    
    async def get_service_status(self) -> List[ServiceStatus]:
        """
        获取所有服务状态
        
        Returns:
            服务状态列表
        """
        response = await self._make_request("GET", "/api/mcp/services/status")
        services = response.get('services', {})
        
        status_list = []
        for name, info in services.items():
            status = ServiceStatus(
                service_name=name,
                health_status=ServiceHealthStatus.HEALTHY if info.get('available') else ServiceHealthStatus.UNHEALTHY,
                url=info.get('url', ''),
                last_check=datetime.now(),
                response_time_ms=info.get('response_time'),
                error=info.get('error'),
                metadata=info
            )
            status_list.append(status)
        
        return status_list
    
    async def check_health(self) -> bool:
        """
        检查服务健康状态
        
        Returns:
            是否健康
        """
        try:
            await self.ping()
            return True
        except Exception:
            return False
    
    # ========== 工作流相关 ==========
    
    async def get_workflows(self) -> List[WorkflowInfo]:
        """
        获取所有工作流
        
        Returns:
            工作流信息列表
        """
        response = await self._make_request("GET", "/api/mcp/workflows")
        
        # 处理两种可能的响应格式
        if 'workflows' in response:
            # 格式1: {"workflows": [...]}
            workflows_data = response['workflows']
        else:
            # 格式2: {workflow_id: workflow_data, ...}
            workflows_data = list(response.values())
        
        workflows = []
        for wf_data in workflows_data:
            workflow = WorkflowInfo(
                workflow_id=wf_data['id'],
                name=wf_data['name'],
                description=wf_data['description'],
                enabled=wf_data.get('enabled', True),
                created_at=datetime.fromisoformat(wf_data['created_at']) if wf_data.get('created_at') else None,
                updated_at=datetime.fromisoformat(wf_data['updated_at']) if wf_data.get('updated_at') else None,
                metadata=wf_data
            )
            workflows.append(workflow)
        
        return workflows
    
    async def get_workflow(self, workflow_id: str) -> WorkflowInfo:
        """
        获取指定工作流详情
        
        Args:
            workflow_id: 工作流ID
            
        Returns:
            工作流信息
            
        Raises:
            MCPResourceNotFoundError: 工作流不存在
        """
        try:
            response = await self._make_request("GET", f"/api/mcp/workflows/{workflow_id}")
            
            return WorkflowInfo(
                workflow_id=response['id'],
                name=response['name'],
                description=response['description'],
                enabled=response.get('enabled', True),
                created_at=datetime.fromisoformat(response['created_at']) if response.get('created_at') else None,
                updated_at=datetime.fromisoformat(response['updated_at']) if response.get('updated_at') else None,
                metadata=response
            )
        except MCPServiceError as e:
            if e.details.get('http_status') == 404:
                raise MCPResourceNotFoundError(
                    f"工作流不存在: {workflow_id}",
                    resource_type="workflow",
                    resource_id=workflow_id
                )
            raise
    
    # ========== 工作流执行 ==========
    
    async def execute_workflow_sync(
        self, 
        workflow_id: str, 
        input_data: str, 
        user_id: str = None,
        timeout: int = None
    ) -> WorkflowExecutionResult:
        """
        同步执行工作流（实时处理）
        
        Args:
            workflow_id: 工作流ID
            input_data: 输入数据
            user_id: 用户ID
            timeout: 超时时间（秒，默认600秒）
            
        Returns:
            执行结果
            
        Raises:
            MCPWorkflowError: 工作流执行错误
            MCPTimeoutError: 执行超时
            
        重要说明:
            - 此方法会立即开始执行工作流
            - 最大执行时间为600秒，超时会自动中断
            - 执行过程中需要保持网络连接
            - 微信文章处理通常需要30-120秒
        """
        if not user_id:
            user_id = f"sdk_user_{int(time.time())}"
        
        request_data = {
            "input_data": input_data,
            "user_id": user_id
        }
        
        try:
            response = await self._make_request(
                "POST", 
                f"/api/mcp/workflows/{workflow_id}/execute",
                data=request_data,
                timeout=timeout
            )
            
            return self._parse_execution_result(response, workflow_id, user_id)
            
        except MCPTimeoutError:
            raise MCPTimeoutError(
                f"工作流执行超时: {workflow_id}",
                timeout_seconds=timeout or self.config.timeout
            )
        except MCPServiceError as e:
            raise MCPWorkflowError(
                f"工作流执行失败: {e.message}",
                workflow_id=workflow_id,
                details=e.details
            )
    
    async def execute_workflow_async(
        self, 
        workflow_id: str, 
        input_data: str, 
        user_id: str = None,
        callback_url: str = None
    ) -> str:
        """
        异步执行工作流
        
        Args:
            workflow_id: 工作流ID
            input_data: 输入数据
            user_id: 用户ID
            callback_url: 回调URL
            
        Returns:
            任务ID
            
        Raises:
            MCPWorkflowError: 工作流提交错误
        """
        if not user_id:
            user_id = f"sdk_user_{int(time.time())}"
        
        request_data = {
            "input_data": input_data,
            "user_id": user_id
        }
        
        try:
            response = await self._make_request(
                "POST", 
                f"/api/mcp/execute/async",
                params={"workflow_id": workflow_id},
                data=request_data
            )
            
            task_id = response.get('task_id')
            if not task_id:
                raise MCPWorkflowError("异步任务提交失败：未返回任务ID")
            
            return task_id
            
        except MCPServiceError as e:
            raise MCPWorkflowError(
                f"异步工作流提交失败: {e.message}",
                workflow_id=workflow_id,
                details=e.details
            )
    
    def _parse_execution_result(self, response: Dict, workflow_id: str, user_id: str) -> WorkflowExecutionResult:
        """解析执行结果"""
        steps = []
        for step_data in response.get('steps', []):
            step = ExecutionStep(
                step_id=step_data.get('step_id', ''),
                name=step_data.get('name', ''),
                ai_service=step_data.get('ai_service', ''),
                status=ExecutionStatus.COMPLETED if step_data.get('success') else ExecutionStatus.FAILED,
                input_data=step_data.get('input', ''),
                result=step_data.get('result'),
                error=step_data.get('error'),
                duration_seconds=step_data.get('duration')
            )
            steps.append(step)
        
        return WorkflowExecutionResult(
            workflow_id=workflow_id,
            execution_id=response.get('execution_id', str(uuid.uuid4())),
            user_id=user_id,
            status=ExecutionStatus.COMPLETED if response.get('success') else ExecutionStatus.FAILED,
            steps=steps,
            final_result=response.get('final_result'),
            error=response.get('error'),
            total_duration_seconds=response.get('total_duration')
        )
    
    # ========== 批量操作 ==========
    
    async def execute_workflows_batch(
        self, 
        requests: List[Dict[str, Any]], 
        max_concurrent: int = 5
    ) -> List[WorkflowExecutionResult]:
        """
        批量执行工作流
        
        Args:
            requests: 请求列表，每个请求包含 workflow_id, input_data, user_id
            max_concurrent: 最大并发数
            
        Returns:
            执行结果列表
        """
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def execute_single(request: Dict) -> WorkflowExecutionResult:
            async with semaphore:
                return await self.execute_workflow_sync(
                    workflow_id=request['workflow_id'],
                    input_data=request['input_data'],
                    user_id=request.get('user_id')
                )
        
        tasks = [execute_single(req) for req in requests]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 将异常转换为失败结果
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                error_result = WorkflowExecutionResult(
                    workflow_id=requests[i]['workflow_id'],
                    execution_id=str(uuid.uuid4()),
                    user_id=requests[i].get('user_id', 'unknown'),
                    status=ExecutionStatus.FAILED,
                    error=str(result)
                )
                processed_results.append(error_result)
            else:
                processed_results.append(result)
        
        return processed_results
    
    # ========== 工具方法 ==========
    
    async def wait_for_completion(
        self, 
        task_id: str, 
        polling_interval: float = 1.0,
        max_wait_time: float = 300.0
    ) -> WorkflowExecutionResult:
        """
        等待异步任务完成（轮询方式）
        
        Args:
            task_id: 任务ID
            polling_interval: 轮询间隔（秒）
            max_wait_time: 最大等待时间（秒）
            
        Returns:
            执行结果
            
        Raises:
            MCPTimeoutError: 等待超时
            MCPWorkflowError: 任务失败
        """
        start_time = time.time()
        
        while time.time() - start_time < max_wait_time:
            try:
                # 这里需要实现状态查询API，暂时使用模拟
                await asyncio.sleep(polling_interval)
                
                # TODO: 实现真正的状态查询
                # status = await self.get_task_status(task_id)
                # if status.is_completed:
                #     return status.result
                
            except Exception as e:
                if time.time() - start_time >= max_wait_time:
                    raise MCPTimeoutError(f"等待任务完成超时: {task_id}")
                continue
        
        raise MCPTimeoutError(f"等待任务完成超时: {task_id}")


    # ========== 批量操作 ==========
    
    async def execute_workflows_batch(
        self, 
        requests: List[Dict[str, Any]], 
        max_concurrent: int = 5
    ) -> List[WorkflowExecutionResult]:
        """
        批量执行工作流
        
        Args:
            requests: 请求列表，每个请求包含 workflow_id, input_data, user_id
            max_concurrent: 最大并发数
            
        Returns:
            执行结果列表
        """
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def execute_single(request: Dict) -> WorkflowExecutionResult:
            async with semaphore:
                return await self.execute_workflow_sync(
                    workflow_id=request['workflow_id'],
                    input_data=request['input_data'],
                    user_id=request.get('user_id')
                )
        
        tasks = [execute_single(req) for req in requests]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 将异常转换为失败结果
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                error_result = WorkflowExecutionResult(
                    workflow_id=requests[i]['workflow_id'],
                    execution_id=str(uuid.uuid4()),
                    user_id=requests[i].get('user_id', 'unknown'),
                    status=ExecutionStatus.FAILED,
                    error=str(result)
                )
                processed_results.append(error_result)
            else:
                processed_results.append(result)
        
        return processed_results


# 便捷函数
async def create_client(base_url: str = "http://localhost:8006", **config_kwargs) -> MCPOrchestratorSDK:
    """
    创建并初始化客户端
    
    Args:
        base_url: 服务地址
        **config_kwargs: 配置参数
        
    Returns:
        初始化的客户端
    """
    config = MCPClientConfig(base_url=base_url, **config_kwargs)
    client = MCPOrchestratorSDK(config=config)
    await client._ensure_session()
    return client 