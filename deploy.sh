#!/bin/bash

# 日期匹配查询应用部署脚本

echo "🚀 开始部署日期匹配查询应用..."

# 检查Node.js版本
echo "📋 检查环境..."
node_version=$(node --version)
echo "Node.js版本: $node_version"

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建应用
echo "🔨 构建应用..."
npm run build

# 检查构建结果
if [ $? -eq 0 ]; then
    echo "✅ 构建成功"
else
    echo "❌ 构建失败"
    exit 1
fi

# 检查数据文件
echo "📁 检查数据文件..."
if [ -f "enhanced_date_matches.json" ]; then
    echo "✅ 主数据文件存在"
else
    echo "❌ 主数据文件不存在"
    exit 1
fi

if [ -f "enhanced_reverse_index.json" ]; then
    echo "✅ 反向索引文件存在"
else
    echo "❌ 反向索引文件不存在"
    exit 1
fi

echo "🎉 部署准备完成！"
echo ""
echo "📱 应用功能："
echo "  • 主日期查询：查看指定日期的所有匹配关系"
echo "  • 反向查询：查看指定日期在哪些主日期中出现"
echo "  • 四种匹配类型：情人伴侣、工作伙伴朋友、竞争对手天敌、灵魂伴侣"
echo ""
echo "🚀 部署到Railway："
echo "  1. 安装Railway CLI: npm install -g @railway/cli"
echo "  2. 登录Railway: railway login"
echo "  3. 初始化项目: railway init"
echo "  4. 部署应用: railway up"
echo ""
echo "🌐 访问应用：部署完成后会获得一个Railway域名" 