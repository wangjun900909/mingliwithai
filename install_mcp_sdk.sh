#!/bin/bash

# 安装MCP SDK
echo "正在安装MCP SDK..."

# 检查Python3是否安装
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到Python3，请先安装Python3"
    exit 1
fi

# 安装Python依赖
echo "安装Python依赖..."
pip3 install aiohttp>=3.8.0

# 设置MCP SDK路径
echo "设置MCP SDK路径..."
export PYTHONPATH="${PYTHONPATH}:$(pwd)/mcp_orchestrator_sdk"

# 测试MCP SDK
echo "测试MCP SDK..."
python3 -c "
import sys
sys.path.append('mcp_orchestrator_sdk')
try:
    from mcp_orchestrator_sdk import MCPOrchestratorSDK
    print('✅ MCP SDK安装成功!')
except ImportError as e:
    print(f'❌ MCP SDK导入失败: {e}')
"

echo "安装完成!" 