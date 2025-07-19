"""
MCP AI编排器 SDK
================

一个功能完整的Python SDK，用于集成MCP AI编排器服务。

🎯 **SDK核心定位**：
这是一个**通用的工作流执行客户端**，可以执行MCP服务器上配置的任何工作流，
不限于特定的业务场景。当前示例使用日历生成是因为这是演示服务器的主要配置。

⚠️ **重要使用说明**：
- 🕐 **实时调用要求**：工作流必须实时调用，不支持预先缓存或延迟执行
- ⏱️ **最大执行时长**：单个工作流最长执行时间为600秒（10分钟）
- 🔄 **同步执行特性**：所有工作流步骤按顺序同步执行，无法跳过或并行
- 🌐 **网络依赖**：需要稳定的网络连接，执行过程中断网会导致失败
- 💾 **无状态设计**：每次调用都是独立的，不保存中间状态

主要功能:
- 🔄 同步和异步工作流执行 - 执行任何您配置的工作流
- 📊 服务状态监控 - 监控AI服务健康状态  
- 📋 工作流管理 - 获取、查看所有可用工作流
- 🔁 错误处理和重试 - 智能重试机制
- 📞 回调通知支持 - 异步任务完成通知
- 🚀 批量操作支持 - 并发执行多个工作流
- ☁️ Railway云服务兼容 - 完美支持云部署

🎯 **使用场景示例**：
- 📅 日历生成：微信文章 → ICS日历文件（30-120秒）
- 📝 内容处理：文本分析、摘要生成、翻译（10-60秒）
- 🤖 AI工作流：多AI服务协同处理复杂任务（60-300秒）
- 🔗 数据转换：各种格式转换和数据处理（5-30秒）
- 📊 批量分析：大量内容的批量处理（根据数量而定）

⏰ **超时配置说明**：
```python
# 默认超时：600秒（适合复杂工作流）
client = MCPOrchestratorSDK("https://server.com", timeout=600)

# 自定义超时（根据工作流复杂度调整）
client = MCPOrchestratorSDK("https://server.com", timeout=300)  # 5分钟
client = MCPOrchestratorSDK("https://server.com", timeout=900)  # 15分钟（不推荐）

# 注意：超过600秒的工作流可能会被服务器强制中断
```

使用示例:
    from mcp_orchestrator_sdk import MCPOrchestratorSDK
    
    # 初始化客户端（支持本地和云服务）
    client = MCPOrchestratorSDK("https://myaimcp-production.up.railway.app")
    
    # 执行日历生成工作流（示例1）- 实时处理
    result = await client.execute_workflow_sync(
        "workflow_1751222199",  # 日历生成工作流ID
        "https://mp.weixin.qq.com/s/example-article"
        # 注意：此调用会立即开始处理，最长等待600秒
    )
    
    # 执行其他工作流（示例2）- 自定义超时
    result = await client.execute_workflow_sync(
        "custom_analysis_workflow",  # 您自定义的分析工作流
        "需要分析的文本内容",
        timeout=300  # 5分钟超时（适合简单任务）
    )
    
    # 获取所有可用工作流
    workflows = await client.get_workflows()
    for wf in workflows:
        print(f"可执行工作流: {wf.name} - {wf.description}")
    
    # 批量执行（任何工作流）- 注意总时长
    results = await client.execute_workflows_batch([
        {"workflow_id": "workflow_A", "input_data": "数据1"},
        {"workflow_id": "workflow_B", "input_data": "数据2"}
        # 批量执行时，每个工作流都受600秒限制
    ])

🚨 **性能和限制说明**：
- **微信文章处理**：通常需要30-120秒，包含网页抓取、AI分析、格式转换
- **简单文本处理**：一般5-30秒完成
- **复杂多步骤工作流**：可能需要300-600秒
- **网络超时**：如遇网络问题，会自动重试最多3次
- **服务器限制**：Railway等云服务可能有额外的执行时间限制

版本历史:
    v2.0.0 (2025-07-02):
        - 增加超时时间到600秒，适配长时间处理任务
        - 完整的Railway云服务支持
        - 批量操作功能
        - 智能重试机制
        - 通用工作流执行能力
        - 生产环境优化
        - 添加实时调用和超时说明
    
    v1.0.0 (2025-06-30):
        - 初始版本
        - 基础工作流执行功能
        - 服务状态监控
"""

from .client import MCPOrchestratorSDK, MCPClientConfig
from .models import (
    WorkflowExecutionResult,
    ServiceStatus,
    WorkflowInfo,
    ExecutionStep,
    AsyncTaskInfo
)
from .exceptions import (
    MCPSDKError,
    MCPConnectionError,
    MCPTimeoutError,
    MCPWorkflowError,
    MCPServiceError
)
from .utils import create_callback_server, validate_url

__version__ = "2.0.0"
__author__ = "MCP Orchestrator Team"
__email__ = "support@mcp-orchestrator.com"
__build_date__ = "2025-07-02"
__railway_compatible__ = True

__all__ = [
    # 主要客户端
    "MCPOrchestratorSDK",
    "MCPClientConfig",
    
    # 数据模型
    "WorkflowExecutionResult",
    "ServiceStatus", 
    "WorkflowInfo",
    "ExecutionStep",
    "AsyncTaskInfo",
    
    # 异常类
    "MCPSDKError",
    "MCPConnectionError",
    "MCPTimeoutError", 
    "MCPWorkflowError",
    "MCPServiceError",
    
    # 工具函数
    "create_callback_server",
    "validate_url"
] 