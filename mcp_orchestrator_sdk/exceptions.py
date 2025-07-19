"""
异常类定义
"""

from typing import Optional, Dict, Any


class MCPSDKError(Exception):
    """SDK基础异常类"""
    
    def __init__(self, message: str, error_code: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.details = details or {}
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "error_type": self.__class__.__name__,
            "message": self.message,
            "error_code": self.error_code,
            "details": self.details
        }


class MCPConnectionError(MCPSDKError):
    """连接错误"""
    
    def __init__(self, message: str = "无法连接到MCP编排器服务", **kwargs):
        super().__init__(message, error_code="CONNECTION_ERROR", **kwargs)


class MCPTimeoutError(MCPSDKError):
    """超时错误"""
    
    def __init__(self, message: str = "请求超时", timeout_seconds: Optional[float] = None, **kwargs):
        super().__init__(message, error_code="TIMEOUT_ERROR", **kwargs)
        if timeout_seconds:
            self.details["timeout_seconds"] = timeout_seconds


class MCPAuthenticationError(MCPSDKError):
    """认证错误"""
    
    def __init__(self, message: str = "认证失败", **kwargs):
        super().__init__(message, error_code="AUTHENTICATION_ERROR", **kwargs)


class MCPWorkflowError(MCPSDKError):
    """工作流错误"""
    
    def __init__(self, message: str, workflow_id: Optional[str] = None, step_id: Optional[str] = None, **kwargs):
        super().__init__(message, error_code="WORKFLOW_ERROR", **kwargs)
        if workflow_id:
            self.details["workflow_id"] = workflow_id
        if step_id:
            self.details["step_id"] = step_id


class MCPServiceError(MCPSDKError):
    """服务错误"""
    
    def __init__(self, message: str, service_name: Optional[str] = None, http_status: Optional[int] = None, **kwargs):
        super().__init__(message, error_code="SERVICE_ERROR", **kwargs)
        if service_name:
            self.details["service_name"] = service_name
        if http_status:
            self.details["http_status"] = http_status


class MCPValidationError(MCPSDKError):
    """验证错误"""
    
    def __init__(self, message: str, field_name: Optional[str] = None, **kwargs):
        super().__init__(message, error_code="VALIDATION_ERROR", **kwargs)
        if field_name:
            self.details["field_name"] = field_name


class MCPRateLimitError(MCPSDKError):
    """速率限制错误"""
    
    def __init__(self, message: str = "请求频率过高", retry_after: Optional[int] = None, **kwargs):
        super().__init__(message, error_code="RATE_LIMIT_ERROR", **kwargs)
        if retry_after:
            self.details["retry_after_seconds"] = retry_after


class MCPResourceNotFoundError(MCPSDKError):
    """资源未找到错误"""
    
    def __init__(self, message: str, resource_type: Optional[str] = None, resource_id: Optional[str] = None, **kwargs):
        super().__init__(message, error_code="RESOURCE_NOT_FOUND", **kwargs)
        if resource_type:
            self.details["resource_type"] = resource_type
        if resource_id:
            self.details["resource_id"] = resource_id


class MCPConfigurationError(MCPSDKError):
    """配置错误"""
    
    def __init__(self, message: str, config_key: Optional[str] = None, **kwargs):
        super().__init__(message, error_code="CONFIGURATION_ERROR", **kwargs)
        if config_key:
            self.details["config_key"] = config_key


# 异常映射表 - 用于从HTTP状态码映射到异常类
HTTP_STATUS_TO_EXCEPTION = {
    400: MCPValidationError,
    401: MCPAuthenticationError,
    403: MCPAuthenticationError,
    404: MCPResourceNotFoundError,
    408: MCPTimeoutError,
    429: MCPRateLimitError,
    500: MCPServiceError,
    502: MCPConnectionError,
    503: MCPServiceError,
    504: MCPTimeoutError,
} 