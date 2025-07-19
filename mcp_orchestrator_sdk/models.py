"""
数据模型定义
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Union, Callable
from datetime import datetime
from enum import Enum


class ExecutionStatus(Enum):
    """执行状态枚举"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    TIMEOUT = "timeout"
    CANCELLED = "cancelled"


class ServiceHealthStatus(Enum):
    """服务健康状态"""
    HEALTHY = "healthy"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"
    DEGRADED = "degraded"


@dataclass
class ExecutionStep:
    """工作流执行步骤"""
    step_id: str
    name: str
    ai_service: str
    status: ExecutionStatus
    input_data: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_seconds: Optional[float] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "step_id": self.step_id,
            "name": self.name,
            "ai_service": self.ai_service,
            "status": self.status.value,
            "input_data": self.input_data,
            "result": self.result,
            "error": self.error,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "duration_seconds": self.duration_seconds
        }


@dataclass
class WorkflowExecutionResult:
    """工作流执行结果"""
    workflow_id: str
    execution_id: str
    user_id: str
    status: ExecutionStatus
    steps: List[ExecutionStep] = field(default_factory=list)
    final_result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    total_duration_seconds: Optional[float] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    @property
    def is_successful(self) -> bool:
        """是否执行成功"""
        return self.status == ExecutionStatus.COMPLETED and self.error is None
    
    @property
    def failed_steps(self) -> List[ExecutionStep]:
        """获取失败的步骤"""
        return [step for step in self.steps if step.status == ExecutionStatus.FAILED]
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "workflow_id": self.workflow_id,
            "execution_id": self.execution_id,
            "user_id": self.user_id,
            "status": self.status.value,
            "steps": [step.to_dict() for step in self.steps],
            "final_result": self.final_result,
            "error": self.error,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "total_duration_seconds": self.total_duration_seconds,
            "metadata": self.metadata,
            "is_successful": self.is_successful
        }


@dataclass
class ServiceStatus:
    """服务状态"""
    service_name: str
    health_status: ServiceHealthStatus
    url: str
    last_check: datetime
    response_time_ms: Optional[float] = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    @property
    def is_healthy(self) -> bool:
        """是否健康"""
        return self.health_status == ServiceHealthStatus.HEALTHY
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "service_name": self.service_name,
            "health_status": self.health_status.value,
            "url": self.url,
            "last_check": self.last_check.isoformat(),
            "response_time_ms": self.response_time_ms,
            "error": self.error,
            "metadata": self.metadata,
            "is_healthy": self.is_healthy
        }


@dataclass
class WorkflowStep:
    """工作流步骤定义"""
    step_id: str
    name: str
    prompt: str
    ai_service: str
    required: bool = True
    order: int = 0
    timeout_seconds: int = 600
    retry_count: int = 3
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "step_id": self.step_id,
            "name": self.name,
            "prompt": self.prompt,
            "ai_service": self.ai_service,
            "required": self.required,
            "order": self.order,
            "timeout_seconds": self.timeout_seconds,
            "retry_count": self.retry_count
        }


@dataclass
class WorkflowInfo:
    """工作流信息"""
    workflow_id: str
    name: str
    description: str
    steps: List[WorkflowStep] = field(default_factory=list)
    enabled: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    @property
    def step_count(self) -> int:
        """步骤数量"""
        return len(self.steps)
    
    @property
    def required_steps_count(self) -> int:
        """必需步骤数量"""
        return len([step for step in self.steps if step.required])
    
    def get_step_by_id(self, step_id: str) -> Optional[WorkflowStep]:
        """根据ID获取步骤"""
        for step in self.steps:
            if step.step_id == step_id:
                return step
        return None
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "workflow_id": self.workflow_id,
            "name": self.name,
            "description": self.description,
            "steps": [step.to_dict() for step in self.steps],
            "enabled": self.enabled,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "metadata": self.metadata,
            "step_count": self.step_count,
            "required_steps_count": self.required_steps_count
        }


@dataclass
class AsyncTaskInfo:
    """异步任务信息"""
    task_id: str
    workflow_id: str
    user_id: str
    status: ExecutionStatus
    created_at: datetime
    callback_url: Optional[str] = None
    estimated_completion: Optional[datetime] = None
    progress_percentage: Optional[float] = None
    current_step: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    @property
    def is_completed(self) -> bool:
        """是否已完成"""
        return self.status in [ExecutionStatus.COMPLETED, ExecutionStatus.FAILED, ExecutionStatus.CANCELLED]
    
    @property
    def is_running(self) -> bool:
        """是否正在运行"""
        return self.status in [ExecutionStatus.PENDING, ExecutionStatus.RUNNING]
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "task_id": self.task_id,
            "workflow_id": self.workflow_id,
            "user_id": self.user_id,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "callback_url": self.callback_url,
            "estimated_completion": self.estimated_completion.isoformat() if self.estimated_completion else None,
            "progress_percentage": self.progress_percentage,
            "current_step": self.current_step,
            "metadata": self.metadata,
            "is_completed": self.is_completed,
            "is_running": self.is_running
        }


@dataclass
class CallbackNotification:
    """回调通知数据"""
    request_id: str
    task_id: str
    result: WorkflowExecutionResult
    timestamp: datetime
    source: str = "mcp_orchestrator"
    notification_type: str = "workflow_completed"
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "request_id": self.request_id,
            "task_id": self.task_id,
            "result": self.result.to_dict() if self.result else None,
            "timestamp": self.timestamp.isoformat(),
            "source": self.source,
            "notification_type": self.notification_type
        }


# 类型别名
ExecutionCallback = Callable[[CallbackNotification], None]
ProgressCallback = Callable[[AsyncTaskInfo], None] 