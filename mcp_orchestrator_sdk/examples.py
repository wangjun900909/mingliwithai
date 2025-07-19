"""
MCP编排器SDK使用示例 - 包含真实使用场景
"""

import asyncio
import json
from datetime import datetime
from typing import List

from . import MCPOrchestratorSDK, create_callback_server
from .models import WorkflowExecutionResult, CallbackNotification
from .exceptions import MCPSDKError


async def realistic_wechat_example():
    """真实微信文章处理示例"""
    print("🎯 真实微信文章处理示例")
    print("=" * 50)
    
    async with MCPOrchestratorSDK("https://myaimcp-production.up.railway.app") as client:
        
        # 测试不同类型的微信文章
        test_cases = [
            {
                "name": "包含活动信息的文章",
                "url": "https://mp.weixin.qq.com/s/example-with-event-info",
                "expected": "应该能提取到活动信息并生成ICS"
            },
            {
                "name": "仅背景介绍的文章", 
                "url": "https://mp.weixin.qq.com/s/CTV483FVHCvV6MOukFcWQg",
                "expected": "无法生成ICS，但会提供智能指导"
            },
            {
                "name": "需要验证的文章",
                "url": "https://mp.weixin.qq.com/s/protected-article",
                "expected": "解析失败，系统会提供替代方案"
            }
        ]
        
        for i, case in enumerate(test_cases, 1):
            print(f"\n{i}️⃣ 测试: {case['name']}")
            print(f"链接: {case['url']}")
            print(f"预期: {case['expected']}")
            
            try:
                result = await client.execute_workflow_sync(
                    workflow_id="workflow_1751222199",  # 日历生成工作流
                    input_data=case["url"],
                    user_id=f"test_user_{i}"
                )
                
                print(f"✅ 工作流执行完成:")
                print(f"  - 状态: {result.status.value}")
                print(f"  - 耗时: {result.total_duration_seconds:.1f}秒")
                print(f"  - 步骤数: {len(result.steps)}")
                
                # 分析结果类型
                final_output = result.final_result
                if "BEGIN:VEVENT" in final_output and "END:VEVENT" in final_output:
                    print(f"  📅 成功生成ICS日历!")
                    # 提取活动名称
                    import re
                    summary_match = re.search(r'SUMMARY:(.+)', final_output)
                    if summary_match:
                        print(f"  🎪 活动: {summary_match.group(1)}")
                elif "无法提取" in final_output or "信息不足" in final_output:
                    print(f"  ⚠️ 信息不足，系统提供了智能指导")
                elif "建议" in final_output or "推荐" in final_output:
                    print(f"  💡 系统提供了有用的建议和指导")
                else:
                    print(f"  ❓ 其他类型的响应")
                
                # 显示关键步骤结果
                for step in result.steps:
                    if step.name == "元宝AI网页内容提取与处理":
                        if "解析失败" in step.result:
                            print(f"  🔍 内容提取: 解析失败 (常见情况)")
                        elif "parseStatus\": 1" in step.result:
                            print(f"  🔍 内容提取: 成功解析")
                        else:
                            print(f"  🔍 内容提取: 其他状态")
                
            except MCPSDKError as e:
                print(f"❌ 执行失败: {e.message}")
            
            print("-" * 40)


async def intelligent_error_handling_example():
    """智能错误处理示例"""
    print("\n🧠 智能错误处理示例")
    print("=" * 50)
    
    async with MCPOrchestratorSDK("https://myaimcp-production.up.railway.app") as client:
        
        # 测试各种边界情况
        edge_cases = [
            {
                "name": "无效链接",
                "input": "https://invalid-url.com/article",
                "expected_behavior": "系统应该优雅处理并提供指导"
            },
            {
                "name": "空输入",
                "input": "",
                "expected_behavior": "系统应该提示输入要求"
            },
            {
                "name": "非微信链接",
                "input": "https://example.com/some-article",
                "expected_behavior": "系统应该尝试处理或提供替代方案"
            },
            {
                "name": "包含特殊字符的输入",
                "input": "https://mp.weixin.qq.com/s/test?param=测试&other=特殊字符#anchor",
                "expected_behavior": "系统应该正确处理URL编码"
            }
        ]
        
        for i, case in enumerate(edge_cases, 1):
            print(f"\n{i}️⃣ 测试边界情况: {case['name']}")
            print(f"输入: {case['input']}")
            print(f"预期行为: {case['expected_behavior']}")
            
            try:
                result = await client.execute_workflow_sync(
                    workflow_id="workflow_1751222199",
                    input_data=case["input"],
                    user_id=f"edge_test_{i}",
                    timeout=120  # 给足够时间处理
                )
                
                # 分析系统的智能处理
                final_output = result.final_result
                
                intelligence_indicators = [
                    ("提供指导", ["建议", "推荐", "可以", "尝试"]),
                    ("错误说明", ["无法", "失败", "问题", "错误"]),
                    ("替代方案", ["或者", "也可以", "另外", "替代"]),
                    ("用户友好", ["请", "您", "帮助", "协助"]),
                ]
                
                print(f"  🎯 系统智能表现:")
                for indicator_name, keywords in intelligence_indicators:
                    if any(keyword in final_output for keyword in keywords):
                        print(f"    ✅ {indicator_name}: 检测到")
                    else:
                        print(f"    ⚪ {indicator_name}: 未检测到")
                
            except MCPSDKError as e:
                print(f"  ⚠️ SDK层面错误: {e.message}")
                print(f"    这通常表示网络或服务问题，而非内容处理问题")


async def production_usage_example():
    """生产环境使用示例"""
    print("\n🏭 生产环境使用示例")
    print("=" * 50)
    
    async with MCPOrchestratorSDK("https://myaimcp-production.up.railway.app") as client:
        
        # 1. 健康检查
        print("\n1️⃣ 生产环境健康检查...")
        is_healthy = await client.check_health()
        if not is_healthy:
            print("❌ 生产服务不可用，停止处理")
            return
        print("✅ 生产服务健康")
        
        # 2. 获取服务状态详情
        print("\n2️⃣ 检查AI服务状态...")
        try:
            services = await client.get_service_status()
            ai_services = ["yuanbao", "doubao", "deepseek"]
            
            for service_name in ai_services:
                service_info = services.get(service_name, {})
                status = service_info.get("status", "unknown")
                print(f"  {service_name}: {status}")
                
        except Exception as e:
            print(f"  ⚠️ 无法获取详细状态: {e}")
        
        # 3. 实际处理流程
        print("\n3️⃣ 模拟实际用户请求...")
        
        # 模拟真实用户场景
        user_scenarios = [
            {
                "user_id": "mobile_app_user_001",
                "input": "https://mp.weixin.qq.com/s/some-real-event",
                "context": "移动应用用户想要添加活动到日历"
            },
            {
                "user_id": "web_user_002", 
                "input": "https://mp.weixin.qq.com/s/background-article",
                "context": "网页用户分享了背景介绍类文章"
            }
        ]
        
        for scenario in user_scenarios:
            print(f"\n  👤 用户场景: {scenario['context']}")
            print(f"  🆔 用户ID: {scenario['user_id']}")
            
            try:
                start_time = datetime.now()
                
                result = await client.execute_workflow_sync(
                    workflow_id="workflow_1751222199",
                    input_data=scenario["input"],
                    user_id=scenario["user_id"]
                )
                
                end_time = datetime.now()
                duration = (end_time - start_time).total_seconds()
                
                # 生产环境关键指标
                print(f"  ⏱️ 处理耗时: {duration:.1f}秒")
                print(f"  📊 步骤执行: {len(result.steps)}")
                
                # 判断用户体验
                if "BEGIN:VEVENT" in result.final_result:
                    print(f"  🎉 用户获得: 可用的ICS日历文件")
                    user_satisfaction = "高"
                elif "建议" in result.final_result or "推荐" in result.final_result:
                    print(f"  💡 用户获得: 有用的指导和建议")
                    user_satisfaction = "中等"
                else:
                    print(f"  ❓ 用户获得: 其他类型响应")
                    user_satisfaction = "待评估"
                
                print(f"  😊 预期用户满意度: {user_satisfaction}")
                
            except Exception as e:
                print(f"  ❌ 处理失败: {e}")
                print(f"  🔧 建议: 检查网络连接或稍后重试")


async def basic_usage_example():
    """基础使用示例"""
    print("🚀 基础使用示例")
    print("=" * 50)
    
    # 初始化客户端
    async with MCPOrchestratorSDK("http://localhost:8006") as client:
        
        # 1. 检查服务健康状态
        print("\n1️⃣ 检查服务健康状态...")
        is_healthy = await client.check_health()
        print(f"服务状态: {'健康' if is_healthy else '不健康'}")
        
        if not is_healthy:
            print("❌ 服务不可用，退出示例")
            return
        
        # 2. 获取可用工作流
        print("\n2️⃣ 获取可用工作流...")
        workflows = await client.get_workflows()
        print(f"发现 {len(workflows)} 个工作流:")
        for wf in workflows:
            print(f"  - {wf.workflow_id}: {wf.name}")
        
        if not workflows:
            print("❌ 没有可用的工作流")
            return
        
        # 3. 同步执行工作流
        print("\n3️⃣ 同步执行工作流...")
        workflow_id = workflows[0].workflow_id
        input_data = "测试微信文章链接：https://mp.weixin.qq.com/s/example123"
        
        try:
            result = await client.execute_workflow_sync(
                workflow_id=workflow_id,
                input_data=input_data,
                user_id="demo_user"
            )
            
            print(f"✅ 执行成功:")
            print(f"  - 工作流: {result.workflow_id}")
            print(f"  - 状态: {result.status.value}")
            print(f"  - 步骤数: {len(result.steps)}")
            print(f"  - 耗时: {result.total_duration_seconds:.2f}秒")
            
            # 显示每个步骤的结果
            for i, step in enumerate(result.steps):
                print(f"  步骤 {i+1}: {step.name} - {step.status.value}")
                if step.error:
                    print(f"    错误: {step.error}")
                
        except MCPSDKError as e:
            print(f"❌ 执行失败: {e.message}")


async def async_execution_example():
    """异步执行示例"""
    print("\n🔄 异步执行示例")
    print("=" * 50)
    
    # 启动回调服务器
    callback_server = await create_callback_server(port=8001)
    
    try:
        async with MCPOrchestratorSDK("http://localhost:8006") as client:
            
            # 注册回调函数
            def on_workflow_completed(notification: CallbackNotification):
                print(f"📨 收到完成通知: {notification.request_id}")
                print(f"结果: {notification.result}")
            
            callback_server.register_callback("workflow_completed", on_workflow_completed)
            
            # 提交异步任务
            print("\n1️⃣ 提交异步任务...")
            task_id = await client.execute_workflow_async(
                workflow_id="default_activity_processing",
                input_data="异步处理测试数据",
                user_id="async_user",
                callback_url=callback_server.get_webhook_url()
            )
            
            print(f"📋 任务已提交: {task_id}")
            
            # 等待回调通知
            print("\n2️⃣ 等待完成通知...")
            await asyncio.sleep(30)  # 等待30秒
            
    finally:
        # 清理回调服务器
        await callback_server.app.cleanup()


async def batch_execution_example():
    """批量执行示例"""
    print("\n📊 批量执行示例")
    print("=" * 50)
    
    async with MCPOrchestratorSDK("http://localhost:8006") as client:
        
        # 准备批量请求
        requests = [
            {
                "workflow_id": "default_activity_processing",
                "input_data": f"批量处理文章 {i+1}：https://example.com/article{i+1}",
                "user_id": f"batch_user_{i+1}"
            }
            for i in range(3)
        ]
        
        print(f"📤 提交 {len(requests)} 个批量任务...")
        
        # 执行批量任务
        results = await client.execute_workflows_batch(requests, max_concurrent=2)
        
        # 统计结果
        success_count = sum(1 for r in results if r.is_successful)
        failed_count = len(results) - success_count
        
        print(f"📊 批量执行结果:")
        print(f"  - 成功: {success_count}")
        print(f"  - 失败: {failed_count}")
        print(f"  - 总计: {len(results)}")
        
        # 显示详细结果
        for i, result in enumerate(results):
            status_icon = "✅" if result.is_successful else "❌"
            print(f"  {status_icon} 任务 {i+1}: {result.status.value}")
            if result.error:
                print(f"    错误: {result.error}")


async def error_handling_example():
    """错误处理示例"""
    print("\n⚠️ 错误处理示例")
    print("=" * 50)
    
    async with MCPOrchestratorSDK("http://localhost:8006") as client:
        
        # 1. 处理不存在的工作流
        print("\n1️⃣ 测试不存在的工作流...")
        try:
            await client.execute_workflow_sync(
                workflow_id="non_existent_workflow",
                input_data="测试数据",
                user_id="test_user"
            )
        except MCPSDKError as e:
            print(f"✅ 正确捕获错误: {e.error_code} - {e.message}")
        
        # 2. 处理连接超时
        print("\n2️⃣ 测试连接超时...")
        try:
            # 使用很短的超时时间
            client.config.timeout = 1
            await client.execute_workflow_sync(
                workflow_id="default_activity_processing",
                input_data="测试数据",
                user_id="test_user",
                timeout=1
            )
        except MCPSDKError as e:
            print(f"✅ 正确捕获超时: {e.error_code} - {e.message}")
        
        # 3. 处理无效输入
        print("\n3️⃣ 测试无效输入...")
        try:
            from .utils import sanitize_input_data
            sanitize_input_data("x" * 20000)  # 过长的输入
        except MCPSDKError as e:
            print(f"✅ 正确捕获验证错误: {e.error_code} - {e.message}")


async def service_monitoring_example():
    """服务监控示例"""
    print("\n📊 服务监控示例")
    print("=" * 50)
    
    async with MCPOrchestratorSDK("http://localhost:8006") as client:
        
        # 1. 获取服务状态
        print("\n1️⃣ 获取服务状态...")
        services = await client.get_service_status()
        
        print(f"发现 {len(services)} 个服务:")
        for service in services:
            status_icon = "🟢" if service.is_healthy else "🔴"
            print(f"  {status_icon} {service.service_name}")
            print(f"    URL: {service.url}")
            print(f"    状态: {service.health_status.value}")
            if service.response_time_ms:
                print(f"    响应时间: {service.response_time_ms:.0f}ms")
            if service.error:
                print(f"    错误: {service.error}")
        
        # 2. 持续监控
        print("\n2️⃣ 持续监控(10秒)...")
        for i in range(10):
            is_healthy = await client.check_health()
            status_icon = "🟢" if is_healthy else "🔴"
            print(f"  检查 {i+1}/10: {status_icon}")
            await asyncio.sleep(1)


class WorkflowManager:
    """工作流管理器示例"""
    
    def __init__(self, client: MCPOrchestratorSDK):
        self.client = client
        self.execution_history: List[WorkflowExecutionResult] = []
    
    async def execute_with_retry(
        self, 
        workflow_id: str, 
        input_data: str, 
        user_id: str,
        max_retries: int = 3
    ) -> WorkflowExecutionResult:
        """带重试的执行"""
        
        for attempt in range(max_retries):
            try:
                print(f"🔄 尝试执行 (第 {attempt + 1} 次)...")
                
                result = await self.client.execute_workflow_sync(
                    workflow_id=workflow_id,
                    input_data=input_data,
                    user_id=user_id
                )
                
                # 记录历史
                self.execution_history.append(result)
                
                if result.is_successful:
                    print(f"✅ 执行成功")
                    return result
                else:
                    print(f"❌ 执行失败: {result.error}")
                    if attempt < max_retries - 1:
                        await asyncio.sleep(2 ** attempt)  # 指数退避
                    
            except MCPSDKError as e:
                print(f"❌ 执行异常: {e.message}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(2 ** attempt)
                else:
                    raise
        
        raise MCPSDKError(f"执行失败，已重试 {max_retries} 次")
    
    async def get_statistics(self) -> dict:
        """获取执行统计"""
        total = len(self.execution_history)
        successful = sum(1 for r in self.execution_history if r.is_successful)
        failed = total - successful
        
        avg_duration = 0
        if self.execution_history:
            durations = [r.total_duration_seconds for r in self.execution_history if r.total_duration_seconds]
            if durations:
                avg_duration = sum(durations) / len(durations)
        
        return {
            "total_executions": total,
            "successful": successful,
            "failed": failed,
            "success_rate": successful / total if total > 0 else 0,
            "average_duration": avg_duration
        }


async def workflow_manager_example():
    """工作流管理器示例"""
    print("\n🎯 工作流管理器示例")
    print("=" * 50)
    
    async with MCPOrchestratorSDK("http://localhost:8006") as client:
        manager = WorkflowManager(client)
        
        # 执行几个任务
        tasks = [
            ("default_activity_processing", "测试文章1", "user1"),
            ("default_activity_processing", "测试文章2", "user2"),
            ("default_activity_processing", "测试文章3", "user3"),
        ]
        
        for workflow_id, input_data, user_id in tasks:
            try:
                await manager.execute_with_retry(workflow_id, input_data, user_id)
            except MCPSDKError as e:
                print(f"❌ 最终失败: {e.message}")
        
        # 显示统计
        stats = await manager.get_statistics()
        print(f"\n📊 执行统计:")
        print(f"  - 总执行次数: {stats['total_executions']}")
        print(f"  - 成功次数: {stats['successful']}")
        print(f"  - 失败次数: {stats['failed']}")
        print(f"  - 成功率: {stats['success_rate']:.1%}")
        print(f"  - 平均耗时: {stats['average_duration']:.2f}秒")


async def main():
    """主函数 - 运行真实场景示例"""
    print("🎬 MCP编排器SDK真实使用场景演示")
    print("=" * 80)
    
    examples = [
        ("真实微信文章处理", realistic_wechat_example),
        ("智能错误处理", intelligent_error_handling_example), 
        ("生产环境使用", production_usage_example),
        ("基础使用", basic_usage_example),
        ("批量执行", batch_execution_example),
        ("错误处理", error_handling_example),
        ("服务监控", service_monitoring_example),
        ("工作流管理器", workflow_manager_example),
    ]
    
    for name, example_func in examples:
        try:
            print(f"\n{'='*20} {name} {'='*20}")
            await example_func()
            print(f"✅ {name} 示例完成")
        except Exception as e:
            print(f"❌ {name} 示例失败: {e}")
        
        print("\n" + "⏸️ " * 20)
        await asyncio.sleep(2)  # 示例间暂停
    
    print("\n🎉 所有示例演示完成!")


if __name__ == "__main__":
    # 运行示例
    asyncio.run(main()) 