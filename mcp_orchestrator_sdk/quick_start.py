#!/usr/bin/env python3
"""
MCP编排器SDK快速开始示例
"""

import asyncio
import sys
import os

# 添加SDK路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mcp_orchestrator_sdk import MCPOrchestratorSDK
from mcp_orchestrator_sdk.exceptions import MCPSDKError


async def quick_start():
    """快速开始示例"""
    print("🚀 MCP编排器SDK快速开始")
    print("=" * 50)
    
    # 1. 初始化客户端
    print("\n1️⃣ 初始化客户端...")
    async with MCPOrchestratorSDK("http://localhost:8006") as client:
        
        # 2. 检查服务状态
        print("\n2️⃣ 检查服务状态...")
        try:
            is_healthy = await client.check_health()
            if is_healthy:
                print("✅ 服务正常运行")
            else:
                print("❌ 服务不可用")
                return
        except Exception as e:
            print(f"❌ 无法连接到服务: {e}")
            print("💡 请确保MCP编排器服务正在运行 (http://localhost:8006)")
            return
        
        # 3. 获取可用工作流
        print("\n3️⃣ 获取可用工作流...")
        try:
            workflows = await client.get_workflows()
            if workflows:
                print(f"✅ 发现 {len(workflows)} 个工作流:")
                for i, wf in enumerate(workflows[:3]):  # 只显示前3个
                    print(f"  {i+1}. {wf.workflow_id}: {wf.name}")
                    print(f"     {wf.description}")
            else:
                print("⚠️ 没有可用的工作流")
                return
        except MCPSDKError as e:
            print(f"❌ 获取工作流失败: {e.message}")
            return
        
        # 4. 执行示例工作流
        print("\n4️⃣ 执行示例工作流...")
        
        # 使用第一个可用的工作流
        workflow_id = workflows[0].workflow_id
        input_data = "测试微信文章链接：https://mp.weixin.qq.com/s/example123"
        user_id = "quick_start_user"
        
        print(f"工作流: {workflow_id}")
        print(f"输入: {input_data[:50]}...")
        print(f"用户: {user_id}")
        
        try:
            print("⏳ 执行中...")
            result = await client.execute_workflow_sync(
                workflow_id=workflow_id,
                input_data=input_data,
                user_id=user_id,
                timeout=120  # 2分钟超时
            )
            
            # 5. 显示结果
            print("\n5️⃣ 执行结果:")
            if result.is_successful:
                print("✅ 执行成功!")
                print(f"   执行ID: {result.execution_id}")
                print(f"   总耗时: {result.total_duration_seconds:.2f}秒")
                print(f"   执行步骤: {len(result.steps)}")
                
                # 显示每个步骤
                for i, step in enumerate(result.steps):
                    status_icon = "✅" if step.status == "completed" else "❌"
                    print(f"   步骤 {i+1}: {status_icon} {step.name}")
                    print(f"           服务: {step.ai_service}")
                    if step.duration_seconds:
                        print(f"           耗时: {step.duration_seconds:.2f}秒")
                    if step.error:
                        print(f"           错误: {step.error}")
                
                # 显示最终结果摘要
                if result.final_result:
                    final_text = str(result.final_result)
                    if len(final_text) > 200:
                        final_text = final_text[:200] + "..."
                    print(f"\n📄 最终结果摘要:")
                    print(f"   {final_text}")
                
            else:
                print("❌ 执行失败!")
                print(f"   错误: {result.error}")
                
                # 显示失败的步骤
                failed_steps = result.failed_steps
                if failed_steps:
                    print(f"   失败步骤: {len(failed_steps)}")
                    for step in failed_steps:
                        print(f"   - {step.name}: {step.error}")
                        
        except MCPSDKError as e:
            print(f"❌ 执行失败: {e.message}")
            if e.error_code == "TIMEOUT_ERROR":
                print("💡 提示: 工作流执行时间较长，可以尝试:")
                print("   - 增加timeout参数")
                print("   - 使用异步执行模式")
            elif e.error_code == "CONNECTION_ERROR":
                print("💡 提示: 检查网络连接和服务状态")
            
        # 6. 异步执行示例
        print("\n6️⃣ 异步执行示例...")
        try:
            task_id = await client.execute_workflow_async(
                workflow_id=workflow_id,
                input_data="异步执行测试数据",
                user_id="async_user"
            )
            print(f"✅ 异步任务已提交: {task_id}")
            print("💡 在实际应用中，你可以:")
            print("   - 通过回调URL接收完成通知")
            print("   - 轮询状态检查任务进度")
            print("   - 在用户界面显示处理状态")
            
        except MCPSDKError as e:
            print(f"❌ 异步执行失败: {e.message}")
    
    print("\n🎉 快速开始完成!")
    print("\n📚 下一步:")
    print("   - 查看完整示例: python -m mcp_orchestrator_sdk.examples")
    print("   - 阅读文档: mcp_orchestrator_sdk/README.md")
    print("   - 集成到你的应用中")


if __name__ == "__main__":
    try:
        asyncio.run(quick_start())
    except KeyboardInterrupt:
        print("\n👋 用户中断，退出程序")
    except Exception as e:
        print(f"\n💥 程序异常: {e}")
        sys.exit(1) 