# MCP Feedback Enhanced 使用指南

## 🎯 **什么是 MCP Feedback Enhanced？**

MCP Feedback Enhanced 是一个增强的反馈系统，用于：
- 收集用户对 AI 回答的反馈
- 改进 AI 模型的表现
- 提供更好的用户体验
- 学习用户偏好

## ⚙️ **配置状态**

### 当前配置
```json
{
  "mcp-feedback-enhanced": {
    "command": "uvx",
    "args": ["mcp-feedback-enhanced@latest"],
    "timeout": 600,
    "autoApprove": ["interactive_feedback"]
  }
}
```

### 配置说明
- **command**: 使用 `uvx` 运行（uv 的包执行器）
- **timeout**: 600 秒超时时间
- **autoApprove**: 自动批准交互式反馈操作

## 🚀 **使用方法**

### 1. **在 Cursor 编辑器中使用**

1. **重启 Cursor 编辑器** 以加载 MCP 配置
2. **开始对话** 与 AI 助手
3. **查看反馈选项** 在对话界面中
4. **提供反馈** 对 AI 回答进行评分

### 2. **命令行使用**

```bash
# 直接运行
uvx mcp-feedback-enhanced@latest

# 或者通过 npx
npx mcp-feedback-enhanced@latest
```

### 3. **在 Next.js 项目中集成**

#### 使用反馈组件
```tsx
import FeedbackWidget from './components/FeedbackWidget';

// 在你的组件中
<FeedbackWidget
  messageId="unique-message-id"
  onFeedback={(type, comment) => {
    console.log('用户反馈:', type, comment);
  }}
/>
```

#### 使用完整的聊天组件
```tsx
import AIChatWithFeedback from './components/AIChatWithFeedback';

// 在你的页面中
<AIChatWithFeedback initialMessages={[]} />
```

## 📊 **反馈类型**

### 1. **正面反馈 (Positive)**
- ✅ 点赞按钮
- 表示回答有帮助
- 帮助 AI 学习好的回答模式

### 2. **负面反馈 (Negative)**
- ❌ 点踩按钮
- 表示回答没帮助
- 触发详细反馈表单
- 收集改进建议

### 3. **详细反馈**
- 📝 评论框
- 允许用户详细描述问题
- 提供具体的改进建议

## 🔧 **API 集成**

### 反馈 API 端点
```
POST /api/feedback
```

### 请求格式
```json
{
  "messageId": "unique-message-id",
  "type": "positive" | "negative",
  "comment": "可选的详细反馈"
}
```

### 响应格式
```json
{
  "success": true,
  "message": "反馈已提交",
  "data": {
    "messageId": "unique-message-id",
    "type": "positive",
    "comment": "详细反馈",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## 📈 **数据收集**

### 收集的信息
- 消息 ID
- 反馈类型（正面/负面）
- 详细评论
- 时间戳
- 用户代理信息

### 数据用途
- 改进 AI 模型
- 分析用户偏好
- 识别问题模式
- 优化回答质量

## 🎨 **UI 组件**

### FeedbackWidget 组件
- 点赞/点踩按钮
- 评论输入框
- 提交按钮
- 状态反馈

### AIChatWithFeedback 组件
- 完整的聊天界面
- 集成反馈功能
- 消息历史记录
- 加载状态显示

## 🔒 **隐私和安全**

### 数据保护
- 不收集个人身份信息
- 匿名化处理
- 安全传输
- 本地存储选项

### 用户控制
- 可选的反馈功能
- 随时可以禁用
- 数据删除选项

## 🚀 **部署和测试**

### 本地测试
```bash
npm run dev
# 访问 http://localhost:3000
```

### 生产部署
```bash
npm run build
npm start
```

### Railway 部署
- 自动部署到 Railway
- 环境变量配置
- 监控和日志

## 📞 **故障排除**

### 常见问题

1. **MCP 服务器未启动**
   - 重启 Cursor 编辑器
   - 检查 MCP 配置
   - 验证 uv 安装

2. **反馈提交失败**
   - 检查网络连接
   - 验证 API 端点
   - 查看控制台错误

3. **组件不显示**
   - 检查组件导入
   - 验证 props 传递
   - 查看浏览器控制台

### 调试技巧
- 查看浏览器控制台
- 检查网络请求
- 验证环境变量
- 测试 API 端点

## 📚 **进阶功能**

### 1. **统计分析**
- 反馈率统计
- 用户满意度分析
- 问题模式识别

### 2. **机器学习集成**
- 自动改进建议
- 个性化回答
- 智能推荐

### 3. **多语言支持**
- 国际化界面
- 多语言反馈
- 本地化处理

## 🎯 **最佳实践**

1. **用户体验**
   - 简洁的反馈界面
   - 快速响应
   - 清晰的提示信息

2. **数据质量**
   - 验证输入数据
   - 防止垃圾反馈
   - 保护用户隐私

3. **系统稳定性**
   - 错误处理
   - 降级方案
   - 监控告警

## 📞 **支持**

如有问题，请：
1. 检查 MCP 配置
2. 查看错误日志
3. 测试 API 端点
4. 联系技术支持 