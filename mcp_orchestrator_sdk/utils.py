"""
工具函数
"""

import asyncio
import re
from typing import Optional, Dict, Any, Callable
from urllib.parse import urlparse
from aiohttp import web
import json
from datetime import datetime

from .models import CallbackNotification
from .exceptions import MCPValidationError


def validate_url(url: str) -> bool:
    """
    验证URL格式
    
    Args:
        url: 要验证的URL
        
    Returns:
        是否有效
    """
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except Exception:
        return False


def validate_workflow_id(workflow_id: str) -> bool:
    """
    验证工作流ID格式
    
    Args:
        workflow_id: 工作流ID
        
    Returns:
        是否有效
    """
    if not workflow_id or not isinstance(workflow_id, str):
        return False
    
    # 允许字母、数字、下划线、连字符
    pattern = r'^[a-zA-Z0-9_-]+$'
    return bool(re.match(pattern, workflow_id))


def validate_user_id(user_id: str) -> bool:
    """
    验证用户ID格式
    
    Args:
        user_id: 用户ID
        
    Returns:
        是否有效
    """
    if not user_id or not isinstance(user_id, str):
        return False
    
    # 允许字母、数字、下划线、连字符、@符号
    pattern = r'^[a-zA-Z0-9_@.-]+$'
    return bool(re.match(pattern, user_id))


def sanitize_input_data(input_data: str, max_length: int = 10000) -> str:
    """
    清理输入数据
    
    Args:
        input_data: 输入数据
        max_length: 最大长度
        
    Returns:
        清理后的数据
        
    Raises:
        MCPValidationError: 数据无效
    """
    if not isinstance(input_data, str):
        raise MCPValidationError("输入数据必须是字符串")
    
    if len(input_data) > max_length:
        raise MCPValidationError(f"输入数据过长，最大长度: {max_length}")
    
    # 移除潜在的危险字符
    sanitized = input_data.strip()
    
    # 可以添加更多的清理逻辑
    return sanitized


class CallbackServer:
    """
    回调服务器
    """
    
    def __init__(self, port: int = 8000, host: str = "localhost"):
        self.port = port
        self.host = host
        self.app = web.Application()
        self.callbacks: Dict[str, Callable] = {}
        self.received_notifications: Dict[str, CallbackNotification] = {}
        
        # 设置路由
        self.app.router.add_post('/webhook', self._handle_webhook)
        self.app.router.add_get('/status', self._get_status)
        self.app.router.add_get('/notifications/{request_id}', self._get_notification)
    
    def register_callback(self, callback_type: str, callback_func: Callable):
        """
        注册回调函数
        
        Args:
            callback_type: 回调类型
            callback_func: 回调函数
        """
        self.callbacks[callback_type] = callback_func
    
    async def _handle_webhook(self, request: web.Request) -> web.Response:
        """处理webhook请求"""
        try:
            data = await request.json()
            
            # 解析通知
            notification = CallbackNotification(
                request_id=data.get('request_id', ''),
                task_id=data.get('task_id', ''),
                result=data.get('result'),
                timestamp=datetime.fromisoformat(data.get('timestamp', datetime.now().isoformat())),
                source=data.get('source', 'unknown'),
                notification_type=data.get('notification_type', 'workflow_completed')
            )
            
            # 存储通知
            self.received_notifications[notification.request_id] = notification
            
            # 调用注册的回调函数
            callback_func = self.callbacks.get(notification.notification_type)
            if callback_func:
                try:
                    if asyncio.iscoroutinefunction(callback_func):
                        await callback_func(notification)
                    else:
                        callback_func(notification)
                except Exception as e:
                    print(f"回调函数执行失败: {e}")
            
            return web.json_response({
                "status": "ok",
                "message": "回调处理成功",
                "request_id": notification.request_id
            })
            
        except Exception as e:
            return web.json_response({
                "status": "error",
                "message": f"回调处理失败: {str(e)}"
            }, status=500)
    
    async def _get_status(self, request: web.Request) -> web.Response:
        """获取服务器状态"""
        return web.json_response({
            "status": "running",
            "host": self.host,
            "port": self.port,
            "received_notifications": len(self.received_notifications),
            "registered_callbacks": list(self.callbacks.keys())
        })
    
    async def _get_notification(self, request: web.Request) -> web.Response:
        """获取指定通知"""
        request_id = request.match_info['request_id']
        
        if request_id in self.received_notifications:
            notification = self.received_notifications[request_id]
            return web.json_response(notification.to_dict())
        else:
            return web.json_response({
                "error": "通知未找到"
            }, status=404)
    
    async def start(self) -> web.AppRunner:
        """启动服务器"""
        runner = web.AppRunner(self.app)
        await runner.setup()
        
        site = web.TCPSite(runner, self.host, self.port)
        await site.start()
        
        print(f"回调服务器启动: http://{self.host}:{self.port}")
        return runner
    
    def get_webhook_url(self) -> str:
        """获取webhook URL"""
        return f"http://{self.host}:{self.port}/webhook"


async def create_callback_server(
    port: int = 8000, 
    host: str = "localhost",
    auto_start: bool = True
) -> CallbackServer:
    """
    创建回调服务器
    
    Args:
        port: 端口号
        host: 主机地址
        auto_start: 是否自动启动
        
    Returns:
        回调服务器实例
    """
    server = CallbackServer(port=port, host=host)
    
    if auto_start:
        await server.start()
    
    return server


def format_duration(seconds: float) -> str:
    """
    格式化持续时间
    
    Args:
        seconds: 秒数
        
    Returns:
        格式化的时间字符串
    """
    if seconds < 1:
        return f"{seconds*1000:.0f}ms"
    elif seconds < 60:
        return f"{seconds:.1f}s"
    elif seconds < 3600:
        minutes = seconds // 60
        remaining_seconds = seconds % 60
        return f"{minutes:.0f}m{remaining_seconds:.0f}s"
    else:
        hours = seconds // 3600
        remaining_minutes = (seconds % 3600) // 60
        return f"{hours:.0f}h{remaining_minutes:.0f}m"


def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """
    截断文本
    
    Args:
        text: 要截断的文本
        max_length: 最大长度
        suffix: 后缀
        
    Returns:
        截断后的文本
    """
    if len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix


def parse_error_response(response_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    解析错误响应
    
    Args:
        response_data: 响应数据
        
    Returns:
        解析后的错误信息
    """
    error_info = {
        "message": "未知错误",
        "code": None,
        "details": {}
    }
    
    if isinstance(response_data, dict):
        error_info["message"] = response_data.get("message", error_info["message"])
        error_info["code"] = response_data.get("error_code")
        error_info["details"] = response_data.get("details", {})
    elif isinstance(response_data, str):
        error_info["message"] = response_data
    
    return error_info


class RetryHelper:
    """重试助手"""
    
    @staticmethod
    async def retry_async(
        func: Callable,
        max_attempts: int = 3,
        delay: float = 1.0,
        backoff_factor: float = 2.0,
        exceptions: tuple = (Exception,)
    ):
        """
        异步重试装饰器
        
        Args:
            func: 要重试的函数
            max_attempts: 最大尝试次数
            delay: 初始延迟
            backoff_factor: 退避因子
            exceptions: 要捕获的异常类型
            
        Returns:
            函数结果
        """
        last_exception = None
        
        for attempt in range(max_attempts):
            try:
                if asyncio.iscoroutinefunction(func):
                    return await func()
                else:
                    return func()
            except exceptions as e:
                last_exception = e
                if attempt < max_attempts - 1:
                    wait_time = delay * (backoff_factor ** attempt)
                    await asyncio.sleep(wait_time)
                else:
                    raise last_exception
        
        raise last_exception


def create_request_context(
    workflow_id: str,
    input_data: str,
    user_id: str,
    metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    创建请求上下文
    
    Args:
        workflow_id: 工作流ID
        input_data: 输入数据
        user_id: 用户ID
        metadata: 元数据
        
    Returns:
        请求上下文
    """
    return {
        "workflow_id": workflow_id,
        "input_data": input_data,
        "user_id": user_id,
        "metadata": metadata or {},
        "created_at": datetime.now().isoformat(),
        "request_id": f"req_{int(datetime.now().timestamp())}"
    } 